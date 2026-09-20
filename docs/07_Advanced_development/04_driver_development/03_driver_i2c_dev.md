---
sidebar_position: 3
title: "I2C 调试指南"
description: "I2C 调试指南"
---

# I2C 调试指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

I2C（Inter-Integrated Circuit）是 RDK 开发板上常用的两线制串行总线，通过 SDA/SCL 在主机与多个从设备之间传输数据。Acore 侧基于 Synopsys DesignWare I2C 控制器与 Linux I2C 子系统实现：内核提供 `i2c_adapter`、总线驱动与外设 `i2c_driver`；用户态可通过 `/dev/i2c-*` 字符设备与 `i2c-tools` 直接访问总线。

**模块定位**：本文说明 RDK 平台 I2C 控制器的驱动代码路径、内核配置、设备树节点、用户态调试命令及 debugfs 抓包方法，用于排查总线扫描异常、速率配置与外设通信故障。具体外设（Codec、传感器等）的寄存器级驱动开发，请结合器件数据手册及对应专题文档。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要调试 I2C 外设驱动、设备树或板级 I2C 器件的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 Linux I2C 子系统与设备树（DTS）基础；如需验证 40-pin 扩展总线，请准备外接 I2C 设备或 Audio Driver HAT。

**与其他模块关系**：本驱动是用户态 I2C 应用（[I2C 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/05_i2c.md)）与 `i2c-tools` 的底层实现；引脚复用见「[Pinctrl 调试指南](./05_driver_pinctrl_dev.md)」；GPIO 相关中断/扩展见「[GPIO 使用](./04_driver_gpio_dev.md)」；MCU 侧 I2C 见「[MCU I2C 使用指南](../11_mcu_development/10_mcu_i2c.md)」。

### 硬件资源

<DocScope products="RDK S100">

S100 Acore 集成 6 路 DesignWare I2C 控制器（`i2c0`～`i2c5`），板端对应 `/dev/i2c-0`～`/dev/i2c-5`。其中 **I2C4 / I2C5** 经 40-pin 引出，须注意与 UART2 的引脚复用及拨码配置。

| 用户态总线 | DTS 节点 | 基地址 | pinctrl | 典型用途 |
|---|---|---|---|---|
| `i2c-0` | `i2c@39420000` | `0x39420000` | `cam_i2c0` | 摄像头、HDMI Bridge 等板载器件 |
| `i2c-1` | `i2c@39430000` | `0x39430000` | `cam_i2c1` | 摄像头域外设 |
| `i2c-2` | `i2c@39440000` | `0x39440000` | `cam_i2c2` | 摄像头域外设 |
| `i2c-3` | `i2c@39450000` | `0x39450000` | `cam_i2c3` | 摄像头域外设 |
| `i2c-4` | `i2c@39460000` | `0x39460000` | `cam_i2c4` | 40-pin **I2C4**（Pin 27/28），RTC/风扇等，扫描常见 `UU` |
| `i2c-5` | `i2c@39470000` | `0x39470000` | `peri_i2c5` | 40-pin **I2C5**（Pin 3/5），扩展 HAT / 外设 |

控制器能力：主模式；7 位 / 10 位寻址；速率 100 kHz / 400 kHz / 1 MHz / 3.4 MHz（由 DTS `clock-frequency` 配置，默认多为 400 kHz）。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_funcreuse_40pin.png" alt="S100 40-pin I2C5 与 UART2 拨码复用示意" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

<DocScope products="RDK S600">

## S600 I2C 概述

S600 Acore 集成 6 路 DesignWare I2C 控制器（`i2c0`～`i2c5`），位于 HSI 域，板端对应 `/dev/i2c-0`～`/dev/i2c-5`（以 `ls /sys/class/i2c-dev/` 为准）。

| 用户态总线 | DTS 节点 | 基地址 | pinctrl | 说明 |
|---|---|---|---|---|
| `i2c-0` | `i2c@34840000` | `0x34840000` | `hsi_i2c0` | HSI I2C0 |
| `i2c-1` | `i2c@34841000` | `0x34841000` | `hsi_i2c1` | HSI I2C1 |
| `i2c-2` | `i2c@34842000` | `0x34842000` | `hsi_i2c2` | HSI I2C2 |
| `i2c-3` | `i2c@34843000` | `0x34843000` | `hsi_i2c3` | HSI I2C3 |
| `i2c-4` | `i2c@34844000` | `0x34844000` | `hsi_i2c4` | HSI I2C4 |
| `i2c-5` | `i2c@34845000` | `0x34845000` | `hsi_i2c5` | HSI I2C5 |

控制器能力：主模式；7 位 / 10 位寻址；速率 100 kHz / 400 kHz / 1 MHz / 3.4 MHz。

</DocScope>

## 驱动代码

```bash
kernel/drivers/i2c/i2c-dev.c                 # I2C 字符设备接口
kernel/drivers/i2c/i2c-core-base.c           # I2C 框架核心
kernel/drivers/i2c/busses/i2c-designware-platdrv.c  # DesignWare 平台驱动
kernel/drivers/i2c/busses/i2c-designware-common.c     # 速率与时序解析
kernel/Documentation/i2c/dev-interface.rst   # 用户态接口说明
```

### 内核配置

<DocScope products="RDK S100">
配置文件路径：`hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
配置文件路径：`hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>

```bash
CONFIG_I2C_CHARDEV=y                 # 使能 /dev/i2c-* 字符设备
CONFIG_I2C_DESIGNWARE_PLATFORM=y     # DesignWare I2C 平台驱动
```

## 设备树配置

I2C 控制器节点定义在 SoC DTS 中，板级 DTS 通过 `&i2cN { ... }` 挂载具体外设子节点。

<DocScope products="RDK S100">

SoC 节点文件：`hobot-drivers/kernel-dts/drobot-s100-soc.dtsi`


40-pin / 音频子板相关板级配置：`hobot-drivers/kernel-dts/rdk-v0p5.dtsi`（及其他 `rdk-s100-*.dts`）

**I2C0 控制器示例（板载域）：**

```dts
i2c0: i2c@39420000 {
    power-domains = <&scmi_smc_pd PD_IDX_LSPERI_TOP>;
    #address-cells = <1>;
    #size-cells = <0>;
    compatible = "snps,designware-i2c";
    reg = <0x0 0x39420000 0x0 0x10000>;
    clocks = <&scmi_smc_clk CLK_IDX_TOP_PERI_I2C0>;
    clock-names = "apb_pclk";
    interrupts = <GIC_SPI PERISYS_I2C0_INTR PERISYS_I2C0_INTR_TRIG_TYPE>;
    clock-frequency = <400000>;          /* 400 kHz */
    i2c-sda-hold-time-ns = <50>;
    pinctrl-names = "default", "gpio";
    pinctrl-0 = <&cam_i2c0>;
    pinctrl-1 = <&cam_i2c0_gpio>;
    scl-gpios = <&cam_port0 8 GPIO_ACTIVE_HIGH>;
    sda-gpios = <&cam_port0 9 GPIO_ACTIVE_HIGH>;
    status = "okay";
};
```

**I2C5 控制器示例（40-pin I2C5，扣合 Audio Driver HAT 时常见子节点）：**

```dts
i2c5: i2c@39470000 {
    compatible = "snps,designware-i2c";
    reg = <0x0 0x39470000 0x0 0x10000>;
    clock-frequency = <400000>;
    pinctrl-0 = <&peri_i2c5>;
    status = "okay";

    es8156: es8156@8 {
        compatible = "everest,es8156";
        reg = <0x08>;
        status = "okay";
    };

    es7210_0: es7210_0@40 {
        compatible = "MicArray_0";
        reg = <0x40>;
        status = "okay";
    };

    es7210_1@42 {
        compatible = "MicArray_2";
        reg = <0x42>;
        status = "okay";
    };
};
```

关键属性说明：

| 属性 | 说明 |
|---|---|
| `clock-frequency` | 总线速率（Hz），仅支持 100k / 400k / 1M / 3.4M |
| `i2c-sda-hold-time-ns` | SDA 保持时间，影响高速模式稳定性 |
| `pinctrl-0` | 引脚复用为 I2C 功能 |
| `reg`（子节点） | 7 位 I2C 从地址 |

</DocScope>

<DocScope products="RDK S600">

SoC 节点文件：`hobot-drivers/kernel-dts/drobot-s600-soc.dtsi`

**I2C0 控制器示例：**

```dts
i2c0: i2c@34840000 {
    #address-cells = <1>;
    #size-cells = <0>;
    compatible = "snps,designware-i2c";
    reg = <0x0 0x34840000 0x0 0x1000>;
    clocks = <&clk_500m>;
    clock-names = "apb_pclk";
    interrupts = <GIC_SPI HSISYS_I2C0_INTR IRQ_TYPE_LEVEL_HIGH>;
    clock-frequency = <400000>;
    i2c-sda-hold-time-ns = <50>;
    pinctrl-names = "default", "gpio";
    pinctrl-0 = <&hsi_i2c0>;
    pinctrl-1 = <&hsi_i2c0_gpio>;
    scl-gpios = <&hsi_port0 16 GPIO_ACTIVE_HIGH>;
    sda-gpios = <&hsi_port0 17 GPIO_ACTIVE_HIGH>;
    resets = <&smc_reset RST_IDX_I2C0>;
    reset-names = "i2c_rst";
    status = "okay";
};
```

</DocScope>

## 功能使用

### Kernel 阶段

内核加载 DesignWare I2C 驱动后，在 `/sys/class/i2c-dev/` 下注册适配器，并对外设子节点加载对应 `i2c_driver`。

**检查适配器是否就绪（板端实测）：**

```bash
ls /sys/class/i2c-dev/
# i2c-0  i2c-1  i2c-2  i2c-3  i2c-4  i2c-5

cat /sys/class/i2c-dev/i2c-0/name
# Synopsys DesignWare I2C adapter
```

**I2C 速率配置**

默认速率由 DTS `clock-frequency` 决定（常见为 400 kHz）。驱动仅接受 100k / 400k / 1M / 3.4M 四档，解析与校验逻辑位于：

```text
kernel/drivers/i2c/busses/i2c-designware-common.c   # supported_speeds[]
kernel/drivers/i2c/busses/i2c-designware-platdrv.c  # i2c_parse_fw_timings()
```

修改速率示例：将对应 `i2cN` 节点的 `clock-frequency` 改为 `<100000>` 或 `<1000000>`，重新编译内核/设备树并烧录。

### 用户态使用

用户态通过 `/dev/i2c-N` 或 `i2c-tools` 访问总线。Kernel 文档详见 `Documentation/i2c/dev-interface.rst`。

**1. 检查字符设备节点**

```bash
ls /dev/i2c-*
# /dev/i2c-0  /dev/i2c-1  /dev/i2c-2  /dev/i2c-3  /dev/i2c-4  /dev/i2c-5
```

若节点缺失，可执行 `modprobe i2c-dev`，并确认 DTS 中对应控制器 `status = "okay"`。

**2. 使用 i2c-tools 扫描与读写**

工具已预装在 rootfs 中，常用命令：

| 命令 | 作用 |
|---|---|
| `i2cdetect` | 列举总线及总线上的设备地址 |
| `i2cdump` | 显示从设备寄存器 |
| `i2cget` | 读取指定寄存器 |
| `i2cset` | 写入指定寄存器 |

<DocScope products="RDK S100">

板载 bus `0` 扫描（驱动已占用的地址显示为 `UU`）：

```bash
root@ubuntu:~# i2cdetect -y -r 0
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: UU -- -- -- UU -- -- UU -- -- -- UU -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- 44 -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```

40-pin **I2C5**（bus `5`）在扣合 Audio Driver HAT REV2 后，应看到 `08`、`40`、`42`：

```bash
root@ubuntu:~# i2cdetect -y -r 5
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         08 -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: 40 -- 42 -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```

读取示例（以扫描到的地址为准）：

```bash
i2cget -y 5 0x08 0x00    # 读 ES8156 寄存器 0x00
i2cget -y 5 0x42 0x00    # 读 ES7210 寄存器 0x00
```

</DocScope>

**3. Python `i2cdev` 示例**

板端示例脚本：`/app/40pin_samples/test_i2c.py`（SDK：`hobot-io-samples/debian/app/40pin_samples/test_i2c.py`）。

```bash
cd /app/40pin_samples
python3 test_i2c.py
```

交互流程：输入 bus 号（默认 `0`）→ `i2cdetect` 扫描 → 输入十六进制地址（支持 `08` 或 `0x08`）→ 读取 1 字节并打印 `read value=`。

扣合 Audio Driver HAT 后，bus `5` + 地址 `08` 的典型输出：

```text
Please input I2C BUS num (default 0):5
...
Please input I2C device num(Hex, e.g. 51):08
Read data from device 0x8 on I2C bus 5
read value= b'\x1c'
```

完整交互日志与接线说明见 [I2C 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/05_i2c.md)。

## 调试

DesignWare I2C 驱动在 debugfs 下提供寄存器与 FIFO 抓包接口。板端可见 `dw_i2c0`～`dw_i2c5` 调试目录（以 S100 为例）：

```bash
ls /sys/kernel/debug/ | grep dw_i2c
# dw_i2c0  dw_i2c1  dw_i2c2  dw_i2c3  dw_i2c4  dw_i2c5
```

### 寄存器 dump

以 `i2c-5` 为例（板端实测）：

```bash
root@ubuntu:~# cat /sys/kernel/debug/dw_i2c5/registers
39470000.i2c registers:
=================================
CON:            0x00000065
SAR:            0x00000055
DATA_CMD:       0x00000000
STATUS:         0x00000006
SDA_HOLD:       0x0001000c
...
=================================
```

### 实时传输 dump（`reldump_en`）

```bash
# 使能
echo 1 > /sys/kernel/debug/dw_i2c0/reldump_en
# 关闭
echo 0 > /sys/kernel/debug/dw_i2c0/reldump_en
```

使能后可通过 `dmesg` 查看实时传输记录。

### FIFO 历史 dump（`fifodump_en` / `fifodump`）

```bash
echo 1 > /sys/kernel/debug/dw_i2c0/fifodump_en
i2cget -y 0 0x28 0x00          # 触发一次访问
cat /sys/kernel/debug/dw_i2c0/fifodump
echo 0 > /sys/kernel/debug/dw_i2c0/fifodump_en
```

输出字段含义：`b`=bus，`a`=slave 地址，`f`=0 写 / 1 读；`me`/`ce`/`ae` 为非零时表示传输异常。

### 地址白名单（`whitelist`）

```bash
echo 08 40 42 > /sys/kernel/debug/dw_i2c5/whitelist
cat /sys/kernel/debug/dw_i2c5/whitelist
# whitelist: 08 40 42
```

白名单用于过滤 `reldump` / `fifodump` 输出；写入 `0` 关闭过滤。

## 常见问题

### `i2cdetect` 扫描结果全为 `--`

**原因**：外设未上电、SDA/SCL 无上拉、引脚复用未切到 I2C，或扫描了未接设备的总线。

**解决**：确认外设供电与 40-pin 拨码（I2C5 须切至 I2C 而非 UART2）；用示波器/万用表确认空闲时 SCL/SDA 为高；对扩展场景使用 `i2cdetect -y -r 5` 重新扫描。

### 扫描到 `UU` 或访问报 `Remote I/O error`

**原因**：`UU` 表示该地址已有内核驱动占用，用户态不可裸读；`Remote I/O error` 常见于地址错误、总线未就绪或器件无应答。

**解决**：`UU` 地址应通过对应内核驱动或 debug 接口调试，勿用 `i2cdev` 强读；用户态验证优先选择无驱动占用的外设总线（如 40-pin I2C5 + HAT）；确认输入地址与扫描矩阵一致。

### 找不到 `/dev/i2c-N` 设备节点

**原因**：`i2c-dev` 未加载，或 DTS 中控制器 `status` 非 `okay`。

**解决**：`ls /sys/class/i2c-dev/` 确认适配器；缺失时 `modprobe i2c-dev` 并检查设备树。

### 误用 I2C4 与 I2C5

**原因**：S100 40-pin 上 I2C4（Pin 27/28）接板载 RTC/风扇等，I2C5（Pin 3/5）接扩展子板；二者 bus 号不同。

**解决**：扩展外设示例使用 bus `5`；板载器件使用 bus `4` 并由内核驱动管理。详见 [I2C 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/05_i2c.md)。

## 相关文档

- 用户层示例：[I2C 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/05_i2c.md)
- 关联驱动：[GPIO 使用](./04_driver_gpio_dev.md)、[Pinctrl 调试指南](./05_driver_pinctrl_dev.md)
- 跨核关联：[MCU I2C 使用指南](../11_mcu_development/10_mcu_i2c.md)
- 音频子板器件说明：[音频调试指南](./09_driver_audio.md)
- 板端示例代码：`/app/40pin_samples/test_i2c.py`
