---
sidebar_position: 14
title: "RTC 调试指南"
description: "内置与外置 RTC 驱动、内核配置与设备树，含时间读写与调试"
---

# RTC 调试指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

RTC（Real-Time Clock，实时时钟）在内核中管理硬件实时时钟设备，使系统在断电后仍能维持时间基准。本文介绍内置与外置 RTC 的驱动、内核配置与设备树，以及驱动侧的时间读写与调试方法。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）。适合调试 RTC 驱动、闹钟与中断、设备树配置，或排查时间异常的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 Linux RTC 子系统与设备树基础。

**与其他模块关系**：本文只涉及 RTC 的驱动与设备树配置。系统级时钟同步（RTC/NTP）的配置见「[时钟与 RTC 同步](/System_configuration/rtc_ntp)」。

### 功能说明

RTC 经 32.768 kHz 晶振计时，提供时间与日期记录、闹钟中断、定时唤醒、时间读写与低功耗运行。外接备用电池在主电源关闭时维持计时。

### 硬件资源

系统有两个 RTC 设备：`rtc0` 为内置 super-rtc，`rtc1` 为外置 YSN8130E。

<DocScope products="RDK S100">

| RTC | 类型 | 地址 | 设备节点 | 闹钟中断 |
|---|---|---|---|---|
| 内置 super-rtc | SoC 内置 | 0x2a830000 | `/dev/rtc0` | 支持（SoC 内部 IRQ） |
| 外置 YSN8130E | I2C | 0x32（i2c bus 4） | `/dev/rtc1` | 支持（`/INT` 由 MCU 经 IPC 转发） |

</DocScope>
<DocScope products="RDK S600">

| RTC | 类型 | 地址 | 设备节点 | 闹钟中断 |
|---|---|---|---|---|
| 内置 super-rtc | SoC 内置 | 0x3b420000 | `/dev/rtc0` | 不支持（无闹钟中断线） |
| 外置 YSN8130E | I2C | 0x32（i2c bus 8） | `/dev/rtc1` | 支持（`/INT` 由 MCU 经 IPC 转发） |

</DocScope>

:::note
**闹钟设置与闹钟中断的区别**：设置是把目标时间写入 RTC 的闹钟寄存器；中断是时间到达时 RTC 拉中断信号通知 CPU。

只有设置、没有中断时，闹钟时间可以被写入，但到点不会通知系统。此时系统只能主动轮询，也无法用它唤醒睡眠中的系统。上表「闹钟中断」一列即指后者。
:::

:::note
两个产品的 `/dev/rtc` 均软链接到 `rtc1`（外置 YSN8130E），且内核配置 `CONFIG_RTC_HCTOSYS_DEVICE="rtc1"`，系统启动时从外置 RTC 读取时间。实际系统时间由 NTP 同步。
:::

## 驱动代码

```bash
source/hobot-drivers/rtc/rtc-super.c      # 内置 super-rtc 驱动
source/hobot-drivers/rtc/rtc-ysn8130.c    # 外置 YSN8130E 驱动（经 MCU IPC）
```

内置 super-rtc 由内核 `CONFIG_RTC_HOBOT=y` 编译进内核，在系统启动时注册为 `rtc0`。外置 YSN8130E 编译为模块（`rtc-ysn8130`），挂载在 I2C 总线。

### 中断链路

两个 RTC 的中断机制不同。

**内置 super-rtc** 的中断是 SoC 内部 IRQ（走 GIC），不涉及外部引脚。该中断的支持情况因产品而异：

<DocScope products="RDK S100">

super-rtc 有闹钟中断，设备树中配置为 `GIC_SPI 284`（`CPUSYS_SW0_TRIG_INTR_4`），闹钟到点可触发中断。

</DocScope>
<DocScope products="RDK S600">

super-rtc **没有闹钟中断**。其硬件仅提供 PPS 中断（`AONSYS_RTC_TRIGGER_PPS_INTR`，用于时间同步），设备树中也未配置闹钟中断，驱动查找闹钟 IRQ 失败后打印 `platform_get_irq error`。因此闹钟时间可以设置，但到点不会触发中断。

</DocScope>

**外置 YSN8130E** 通过 `/INT` 引脚输出中断信号：

<DocScope products="RDK S100">

`RTC_INT_3V3_N` 接至 **MCU A13** 引脚（`CAN3_RX`，AON Domain，可复用为 `GPIO_AON[3]`）。MCU 侧以 GPIO 实例 3 注册中断（`AON_WAKEUP_GPIO_INTR`）：

```text
YSN8130E /INT ──RTC_INT_3V3_N──▶ A13（CAN3_RX → GPIO_AON[3]，AON Domain）
                                      │ AON_WAKEUP_GPIO_INTR
                                      ▼
                                  MCU 固件（GPIO 实例 3，Gpio3_ExtIsr）
                                      │ IPC instance 5
                                      ▼
                                  Acore Linux
                                  hb_ipc_open_instance(ins[5])
                                  data_chan_rx_cb() → ysn8130_irq_handler()
```

</DocScope>
<DocScope products="RDK S600">

`RTC_INT_3V3_N` 接至 **Acore 的 `WAKEUP_IO1_3V3`** 引脚（S600_SYS）。MCU 侧以 GPIO 实例 4 注册中断（`AON_GPIO_INTR`）：

```text
YSN8130E /INT ──RTC_INT_3V3_N──▶ WAKEUP_IO1_3V3（SYS）
                                      │ AON_GPIO_INTR
                                      ▼
                                  MCU 固件（GPIO 实例 4，Gpio4_ExtIsr）
                                      │ IPC instance 5
                                      ▼
                                  Acore Linux
                                  hb_ipc_open_instance(ins[5])
                                  data_chan_rx_cb() → ysn8130_irq_handler()
```

</DocScope>

### 内核配置

<DocScope products="RDK S100">
配置文件路径：`source/hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
配置文件路径：`source/hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>

```bash
CONFIG_RTC_CLASS=y                # Linux RTC 子系统
CONFIG_RTC_HCTOSYS_DEVICE="rtc1"  # 启动时从外置 RTC 同步系统时间
CONFIG_HOBOT_RTC_SET=y            # ACore 配置 MCU RTC
CONFIG_RTC_HOBOT=y                # 内置 super-rtc 驱动（Kconfig 默认 y，内建）
CONFIG_RTC_DRV_YSN8130=m          # 外置 YSN8130E 驱动（Kconfig 默认 m，模块）
```

前三项在 defconfig 中显式设置；后两项未在 defconfig 中设置，由 Kconfig 默认值生效（`CONFIG_RTC_HOBOT` 为 `bool default y`，`CONFIG_RTC_DRV_YSN8130` 为 `tristate default m`），最终在构建 `.config` 中生效。

### 软件架构

Linux RTC 框架自上而下分四层：

- **用户空间**：`hwclock`、`date` 等工具，以及 `/dev/rtcN` 字符设备、sysfs（`/sys/class/rtc/rtcN`）、procfs（`/proc/driver/rtc`）接口。
- **接口层**：管理字符设备、sysfs 与 procfs 属性。
- **RTC Core**：负责 RTC 设备的注册与注销，提供时间转换（`rtc-lib.c`）。
- **驱动层**：通过 `rtc_class_ops` 定义的底层操作函数（读/设时间、读/设闹钟等），本驱动的 `rtc-super.c` 与 `rtc-ysn8130.c` 位于此层。
- **硬件层**：内置 super-rtc、外置 YSN8130E、晶振与备用电池。

## 设备树配置

RTC 设备树包含内置 super-rtc 与外置 YSN8130E 两类节点。

### 内置 super-rtc 节点

<DocScope products="RDK S100">

定义在 `source/hobot-drivers/kernel-dts/drobot-s100-soc.dtsi`，带中断线：

```dts
/* drobot-s100-soc.dtsi */
rtc: rtc@aon {
    compatible = "drobot,super-rtc";
    reg = <0x0 0x2a830000 0x0 0x10>;
    regmap-reg = <&rtc_ctrl_reg>;
    interrupt-parent = <&gic>;
    interrupts = <GIC_SPI CPUSYS_SW0_TRIG_INTR_4 CPUSYS_SW0_TRIG_INTR_4_TRIG_TYPE>;
    rtc-as-bin-timer;
    clock-frequency = <32768>;
    status = "okay";
    parity;
    lockstep;
};
```

</DocScope>
<DocScope products="RDK S600">

定义在 `source/hobot-drivers/kernel-dts/drobot-s600-soc.dtsi`，无闹钟中断线：

```dts
/* drobot-s600-soc.dtsi */
rtc: rtc@aon {
    compatible = "drobot,super-rtc";
    reg = <0x0 0x3b420000 0x0 0x10>;
    regmap-reg = <&rtc_ctrl_reg>;
    rtc-as-bin-timer;
    clock-frequency = <32768>;
    status = "okay";
    s600;
    parity;
    lockstep;
};
```

S600 的节点没有 `interrupt-parent` 与 `interrupts` 属性。硬件上 S600 的内置 super-rtc 只有 PPS 中断（`AONSYS_RTC_TRIGGER_PPS_INTR`，用于时间同步），没有闹钟中断线，因此不支持闹钟中断。驱动加载时查找闹钟 IRQ 失败，打印 `platform_get_irq error`，属正常现象。闹钟中断唤醒由外置 YSN8130E 经 MCU 实现。

</DocScope>

### 外置 YSN8130E 节点

挂载在 I2C 总线，地址 `0x32`。

<DocScope products="RDK S100">

定义在 `source/hobot-drivers/kernel-dts/rdk-v0p5.dtsi`：

```dts
/* rdk-v0p5.dtsi */
ysn8130@32 {
    compatible = "drobot,ysn8130e";
    reg = <0x32>;
    status = "okay";
    drobot,backup-charge-enable = <0>;
    drobot,bfvsel = <2>;
};
```

</DocScope>
<DocScope products="RDK S600">

定义在 `source/hobot-drivers/kernel-dts/rdk-s600-mcb-v0p2.dts`：

```dts
/* rdk-s600-mcb-v0p2.dts */
ysn8130@32 {
    compatible = "drobot,ysn8130e";
    reg = <0x32>;
    status = "okay";
};
```

:::note
S600 各板型的 YSN8130E 归属不同：`mcb-v0p1` 挂 `i2c7`，`mcb-v0p2`/`mcb-v1p0` 挂 `i2c8`，`md_pt` 为 `disabled`。本文以 `mcb-v0p2`（`i2c8`，实测 `rtc-ysn8130 8-0032`）为例。
:::

</DocScope>

## 功能使用

### Kernel 阶段

驱动加载后，内置 super-rtc 注册为 `rtc0`，外置 YSN8130E 注册为 `rtc1`，可在加载日志中确认。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# dmesg | grep -i rtc
[    0.329924] rtc_super 2a830000.rtc: S100 rtc.
[    0.330183] rtc_super 2a830000.rtc: registered as rtc0
[    0.330451] hobot-pps soc:rtc_sync: Registered IRQ 60 as PPS source
[    3.062493] rtc-ysn8130 4-0032: backup charge: CHGEN=0 (disabled by drobot,backup-charge-enable)
[    3.069051] rtc-ysn8130 4-0032: registered as rtc1
[    3.070464] rtc-ysn8130 4-0032: setting system clock to 2000-01-01T14:51:23 UTC (946738283)
```

`rtc_super` 注册为 `rtc0`，`rtc-ysn8130`（i2c bus 4，地址 0x32）注册为 `rtc1`。最后一行表示系统启动时从外置 RTC（rtc1）读取时间。

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# dmesg | grep -i rtc
[    0.442190] rtc_super 3b420000.rtc: S600 rtc.
[    0.442195] rtc_super 3b420000.rtc: error -ENXIO: IRQ index 0 not found
[    0.442200] rtc_super 3b420000.rtc: request irq failed
[    0.442342] rtc_super 3b420000.rtc: registered as rtc0
[    0.442647] hobot-pps soc:rtc_sync: Registered IRQ 104 as PPS source
[    3.696897] rtc-ysn8130 8-0032: registered as rtc1
[    3.697327] rtc-ysn8130 8-0032: setting system clock to 2000-01-01T14:22:28 UTC (946736548)
```

`rtc_super` 注册为 `rtc0`，`rtc-ysn8130`（i2c bus 8，地址 0x32）注册为 `rtc1`。开头的 `IRQ index 0 not found` 与 `request irq failed` 是驱动查找闹钟中断（IRQ index 0）失败所致。S600 的内置 super-rtc 只有 PPS 中断（用于时间同步），没有闹钟中断线，故不支持闹钟中断（见「设备树配置」）。

</DocScope>

### 用户态使用

#### 确认 RTC 设备

驱动注册后出现 `/dev/rtcN` 设备节点，`/dev/rtc` 软链接到 `rtc1`：

```bash
root@ubuntu:~# ls -l /dev/rtc*
lrwxrwxrwx 1 root root      4 Jan  1  2000 /dev/rtc -> rtc1
crw-rw-r-- 1 root misc 252, 0 Aug 26  2025 /dev/rtc0
crw-rw-r-- 1 root misc 252, 1 Jan  1  2000 /dev/rtc1
```

设备与驱动的对应关系可在 `/sys/class/rtc/` 下确认：

<DocScope products="RDK S100">

```bash
root@ubuntu:~# for r in /sys/class/rtc/rtc*/; do echo "$r -> $(cat $r/name)"; done
/sys/class/rtc/rtc0/ -> rtc_super 2a830000.rtc
/sys/class/rtc/rtc1/ -> rtc-ysn8130 4-0032
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# for r in /sys/class/rtc/rtc*/; do echo "$r -> $(cat $r/name)"; done
/sys/class/rtc/rtc0/ -> rtc_super 3b420000.rtc
/sys/class/rtc/rtc1/ -> rtc-ysn8130 8-0032
```

</DocScope>

#### 读写 RTC 时间

用 `hwclock` 读写 RTC 时间。`hwclock` 默认操作 `/dev/rtc0`（内置 super-rtc），操作外置 RTC 需用 `--rtc` 指定。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# hwclock -r                          # 默认读 /dev/rtc0
1970-01-01 11:10:41.195193+08:00
root@ubuntu:~# hwclock --rtc /dev/rtc0 -r          # 内置 super-rtc
1970-01-01 11:10:42.001640+08:00
root@ubuntu:~# hwclock --rtc /dev/rtc1 -r          # 外置 YSN8130E
2000-01-02 02:01:58.733918+08:00
root@ubuntu:~# date                                # 系统时间（NTP 同步）
Tue Jun 30 19:40:54 CST 2026
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# hwclock -r                          # 默认读 /dev/rtc0
1970-01-01 10:50:58.095597+08:00
root@drobot:~# hwclock --rtc /dev/rtc0 -r          # 内置 super-rtc
1970-01-01 10:50:59.001208+08:00
root@drobot:~# hwclock --rtc /dev/rtc1 -r          # 外置 YSN8130E
2000-01-02 01:13:14.449040+08:00
root@drobot:~# date                                # 系统时间（NTP 同步）
Tue Jun 16 17:53:00 CST 2026
```

</DocScope>

:::note
`hwclock` 默认操作 `/dev/rtc0` 而非 `/dev/rtc` 链接指向的 `rtc1`。要操作外置 RTC 必须显式加 `--rtc /dev/rtc1`。RTC 时间与系统时间相互独立，系统时间由 NTP 同步。
:::

#### 查看 RTC 状态

`/proc/driver/rtc` 提供当前 RTC 的时间、闹钟与中断状态：

```bash
root@ubuntu:~# cat /proc/driver/rtc
rtc_time        : 18:01:59
rtc_date        : 2000-01-01
alrm_time       : 00:00:00
alrm_date       : 2000-01-02
alarm_IRQ       : no
alrm_pending    : no
update IRQ enabled      : no
periodic IRQ enabled    : no
periodic IRQ frequency  : 1
max user IRQ frequency  : 1
24hr            : yes

RTC-YSN8130 registers
Extension Register: WADA=1, TE=0, USEL=0
Flag Register: VLF=0, AF=0, TF=0, UF=0
Control Register0: AIE=0, TIE=0, UIE=0, STOP=0, TEST=0
```

末尾的 `RTC-YSN8130 registers` 是外置 YSN8130E 的扩展寄存器状态，由 YSN8130 驱动额外输出。

### 用户态编程接口

RTC 是字符设备，用户态程序经 `open` + `ioctl` 操作 `/dev/rtcN`。常用 `ioctl` 命令如下：

| `ioctl` 命令 | 作用 | 对应函数示例 |
|---|---|---|
| `RTC_RD_TIME` | 读取 RTC 时间 | `read_rtc_time` |
| `RTC_SET_TIME` | 设置 RTC 时间 | `set_rtc_time` |
| `RTC_ALM_READ` | 读取闹钟 | `alm_read_rtc` |
| `RTC_ALM_SET` | 设置闹钟 | `alm_set_rtc` |
| `RTC_AIE_ON` | 使能闹钟中断 | `alm_rtc_enable` |
| `RTC_AIE_OFF` | 关闭闹钟中断 | `alm_rtc_disable` |

设置时间的示例：

```c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <linux/rtc.h>

int set_rtc_time(int fd, struct rtc_time rtc_tm)
{
    int ret;
    ret = ioctl(fd, RTC_SET_TIME, &rtc_tm);
    if (ret < 0) {
        printf("set rtc time failed!\n");
        return -1;
    }
    return 0;
}
```

完整测试用例见源码 `source/kernel/tools/testing/selftests/rtc/rtctest.c`，可参考其实现框架按需裁剪。

## 调试

### 查看驱动加载状态

```bash
dmesg | grep -i rtc
```

正常时应能看到 `rtc_super ... registered as rtc0` 与 `rtc-ysn8130 ... registered as rtc1`。外置 RTC 未注册时，检查 I2C 总线与设备树 `ysn8130@32` 节点的 `status`。

### 查看设备与驱动的对应关系

```bash
for r in /sys/class/rtc/rtc*/; do echo "$r -> $(cat $r/name)"; done
```

`rtc0` 对应 `rtc_super`（内置），`rtc1` 对应 `rtc-ysn8130`（外置）。

### 确认主 RTC 设备

```bash
ls -l /dev/rtc                          # 查看 /dev/rtc 链接目标
cat /sys/class/rtc/rtc1/hctosys         # 1 表示系统时间由该 RTC 同步
```

两个产品的 `/dev/rtc` 均链接到 `rtc1`，且 `CONFIG_RTC_HCTOSYS_DEVICE="rtc1"`，`rtc1` 的 `hctosys` 属性为 1，系统启动从外置 RTC 读时间。

## 常见问题

### 为什么无法设置秒级的闹钟

**原因**：这是**外置 YSN8130E（rtc1）的硬件限制**。其闹钟寄存器为 `ALMIN`（分，`0x17`）、`ALHOUR`（时，`0x18`）、`ALWDAY`（星期/日，`0x19`），没有秒级闹钟寄存器，最小单位为分。

<DocScope products="RDK S100">

**解决**：秒级闹钟用内置 super-rtc（`rtc0`）。它写入 `time64` 秒数，支持秒级精度，且带中断线，可触发闹钟中断。

</DocScope>
<DocScope products="RDK S600">

**解决**：秒级闹钟可写到内置 super-rtc（`rtc0`，`time64` 秒级精度），但它没有闹钟中断线，不能触发闹钟中断。需要闹钟中断唤醒时用外置 YSN8130E（分级）经 MCU 实现。

</DocScope>

### 如何禁用 RTC 的中断

**原因**：闹钟中断（`alarm_IRQ`）在触发后保持使能，会持续产生中断。

**解决**：用 `ioctl(fd, RTC_AIE_OFF, 0)` 关闭闹钟中断，或清除设备树中对应 RTC 节点与 MCU 的中断配置。

### `/dev/rtc` 链接指向的 RTC 与 `hwclock` 默认读取的不一致

**原因**：`/dev/rtc` 链接到 `rtc1`（外置），但 `hwclock` 默认操作 `/dev/rtc0`（内置）。

**解决**：操作外置 RTC 时显式加 `--rtc /dev/rtc1`；或确认要操作的设备后选择对应节点。

## 相关文档

- [时钟与 RTC 同步](/System_configuration/rtc_ntp)：系统级时钟与 NTP 配置
