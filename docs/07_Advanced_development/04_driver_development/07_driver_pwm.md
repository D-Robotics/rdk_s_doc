---
sidebar_position: 7
title: "PWM 驱动调试指南"
description: "PWM 驱动调试指南"
---

# PWM 驱动调试指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

PWM（Pulse Width Modulation，脉宽调制）用于在引脚上输出可调频率与占空比的方波。RDK Acore 侧采用 CAM 域 **LPWM**（Light Pulse Width Modulation）硬件控制器，由 `hobot_lpwm` 驱动接入 Linux 标准 PWM 子系统，向用户态暴露 `/sys/class/pwm/pwmchip*` sysfs 接口。

**模块定位**：本文说明 LPWM 驱动代码与内核配置、设备树节点、Kernel 与用户态下的 PWM 配置方法及 debugfs 排查手段，用于定位控制器未注册、通道无波形、频率/占空比异常等问题。相机/CIM 等子系统对 LPWM 的联动时序不在本文展开。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要调试 PWM/LPWM 驱动、设备树或输出波形的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 Linux PWM 子系统与设备树基础；PWM 输出引脚已正确复用；若验证 40-pin 排针输出，请准备示波器或逻辑分析仪。

**与其他模块关系**：本驱动是用户态 PWM 应用（扩展引脚应用）的底层实现；引脚复用见「[Pinctrl 调试指南](./05_driver_pinctrl_dev.md)」；同库 GPIO 操作见「[GPIO 使用](./04_driver_gpio_dev.md)」。

<DocScope products="RDK S100">

用户态 40-pin 示例见 [PWM 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/03_pwm.md)。

</DocScope>

### 硬件资源

<DocScope products="RDK S100">

S100 的 PWM 控制器是 LPWM，位于 CAM 域，SDK 中配置了 `lpwm0`～`lpwm2` 共 3 个控制器节点，每个控制器提供 4 个输出通道。板端实测对应关系如下：

| LPWM 控制器 | 寄存器基地址 | pwmchip 节点 | 通道数 | 板级使能 | 典型用途 |
|---|---|---|---|---|---|
| lpwm0 | `0x370f0000` | `/sys/class/pwm/pwmchip0` | 4 | 4 路（`channel = <1 1 1 1>`） | 相机/CIM/Deserializer 同步（`vin_vcon*` 绑定 `lpwm_chn`） |
| lpwm1 | `0x370f1000` | `/sys/class/pwm/pwmchip4` | 4 | 2 路（`channel = <1 1 0 0>`） | **40-pin** 扩展口 Pin 32/33 |
| lpwm2 | `0x370f2000` | `/sys/class/pwm/pwmchip8` | 4 | 默认关闭（`channel = <0 0 0 0>`） | 预留；需自定义 DTS 后方可使用 |

40-pin 扩展口仅引出 **LPWM1** 的两路输出；SoC 侧为 1.8 V IO，经板级电平转换后在排针上呈现 3.3 V。

| 物理管脚（BOARD） | 排针信号名 | pwmchip | 通道 |
|---|---|---|---|
| **33** | `LPWM1_DOUT0` | `pwmchip4` | 0 |
| **32** | `LPWM1_DOUT1` | `pwmchip4` | 1 |

LPWM 输出能力（硬件规格）：

| 参数 | 范围 |
|---|---|
| 频率 | 1 Hz ～ 26 MHz |
| 0%～100% 占空比（可调频段） | 200 Hz ～ 26 MHz |
| 输出脉宽 | 0 ms ～ 5 ms |

:::info 备注

- 40-pin 上其余 GPIO 引脚**不支持** `Hobot.GPIO.PWM` 软件模拟 PWM，仅 Pin 32/33 为硬件 LPWM。
- 外接测量/负载时注意排针为 **3.3 V** 电平；板载已完成电平转换，外设侧尽量避免再叠加电平转换（与 [UART 驱动调试指南](./02_driver_uart_dev.md) 中 40-pin 说明一致）。

:::

</DocScope>

<DocScope products="RDK S600">

S600 的 PWM 控制器是 LPWM，位于 CAM 域，SDK 中配置了 `lpwm0`～`lpwm3` 共 4 个控制器节点，每个控制器提供 4 个输出通道（`npwm = 4`）。

板端实测的 PWM 控制器如下：

| 控制器 | 寄存器基地址 | pwmchip 节点 | 通道数 |
|---|---|---|---|
| lpwm0 | `0x3712C000` | `/sys/class/pwm/pwmchip0` | 4 |
| lpwm1 | `0x3712D000` | `/sys/class/pwm/pwmchip4` | 4 |
| lpwm2 | `0x3712E000` | `/sys/class/pwm/pwmchip8` | 4 |
| lpwm3 | `0x3712F000` | `/sys/class/pwm/pwmchip12` | 4 |

具体引脚引出与复用以对应 RDK S600 板级 DTS（如 `rdk-s600-camsys-v0p1.dtsi`）及扩展接口定义为准。`lpwm0`～`lpwm3` 默认与相机 `vin_vcon*` 的 `lpwm_chn` 绑定，用户态调试时请确认目标通道未被成像 pipeline 占用。

</DocScope>

## 驱动代码

LPWM 控制器驱动位于 `hobot-drivers/camsys/lpwm_super/` 目录，其同步封装驱动位于 `hobot-drivers/pwm/` 目录。

```bash
hobot-drivers/camsys/lpwm_super/hobot_lpwm_dev.c   # LPWM 控制器驱动（模块 hobot_lpwm）
hobot-drivers/camsys/lpwm_super/hobot_lpwm_ops.c   # LPWM 操作实现
hobot-drivers/camsys/lpwm_super/hobot_lpwm_hw_reg.c # LPWM 寄存器访问
hobot-drivers/pwm/lpwm_sync.c                      # LPWM 同步封装（模块 lpwm_sync）
kernel/drivers/pwm/pwm-sysfs.c                     # PWM sysfs 接口（内核通用）
```

LPWM 控制器的 `compatible` 属性为 `"hobot,hobot-lpwm"`，驱动名称为 `hobot-lpwm`。

### 内核配置

<DocScope products="RDK S100">
配置文件路径：`hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
配置文件路径：`hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>

```bash
CONFIG_PWM=y             # Linux PWM 子系统
CONFIG_HOBOT_LPWM=m      # LPWM 控制器驱动（模块）
CONFIG_LPWM_SYNC=m       # LPWM 同步封装（模块）
```

## 设备树配置

LPWM 控制器节点定义在 CAM 子系统 DTS 中；板级 DTS 通过 `&lpwmN { ... }` 覆盖 pinctrl、通道使能等。其中 `pinctrl-0` 引用的 `cam_lpwm0` 等节点定义了 PWM 输出引脚；如需在引脚上输出 PWM，须保证对应引脚被复用为 `cam_lpwm*` 功能。

<DocScope products="RDK S100">

SoC 基础节点：`hobot-drivers/kernel-dts/drobot-camsys-base.dtsi`  
RDK S100 板级覆盖：`hobot-drivers/kernel-dts/rdk-camsys-v0p5.dtsi`（及其他 `rdk-camsys-*.dtsi`）  
引脚组定义：`hobot-drivers/kernel-dts/drobot-s100-pinctrl.dtsi`

**lpwm0 控制器示例：**

```dts
lpwm0: lpwm0@370f0000 {
    compatible = "hobot,hobot-lpwm";
    reg = <0 0x370f0000 0 0x1000>;
    pinctrl-names = "default";
    pinctrl-0 = <&cam_lpwm0>;
    interrupt-parent = <&gic>;
    interrupts = <GIC_SPI CAMERASYS_LPWM_INTR_0 CAMERASYS_LPWM_INTR_0_TRIG_TYPE>;
    offset = <1 1 1 1>;
    trigger-source = <4>;
    channel = <1 1 1 1>;
    #pwm-cells = <3>;
    status = "okay";
};
```

**40-pin PWM（lpwm1）板级覆盖示例：**

```dts
&lpwm1 {
    pinctrl-0 = <&cam_lpwm1_dout01>;  /* 仅引出 DOUT0/DOUT1 -> Pin 33/32 */
    channel = <1 1 0 0>;              /* 使能通道 0、1 */
};
```

`cam_lpwm1_dout01` 引脚复用示例：

```dts
cam_lpwm1_dout01: cam_lpwm1_dout01_func {
    pinmux {
        function = "cam_lpwm1";
        pins = "cam_lpwm1_dout0", "cam_lpwm1_dout1";
    };
};
```

</DocScope>

<DocScope products="RDK S600">

SoC/板级节点：`hobot-drivers/kernel-dts/drobot-s600-camsys.dtsi`  
板级覆盖示例：`hobot-drivers/kernel-dts/rdk-s600-camsys-v0p1.dtsi`  
引脚组定义：`hobot-drivers/kernel-dts/drobot-s600-pinctrl.dtsi`

**lpwm0 控制器示例：**

```dts
lpwm0: lpwm0@3712C000 {
    compatible = "hobot,hobot-lpwm";
    reg = <0 0x3712C000 0 0x1000>;
    pinctrl-names = "default";
    pinctrl-0 = <&cam_lpwm0>;
    interrupt-parent = <&gic>;
    interrupts = <GIC_SPI CAMERASYS_LPWM_INTR_0 IRQ_TYPE_EDGE_RISING>;
    offset = <1 1 1 1>;
    trigger-source = <4>;
    channel = <1 1 1 1>;
    #pwm-cells = <3>;
    status = "okay";
};
```

</DocScope>

关键属性说明：

| 属性 | 说明 |
|---|---|
| `reg` | LPWM 控制器寄存器基地址 |
| `pinctrl-0` | PWM 输出引脚复用组 |
| `channel` | 各输出通道使能（`1` 为使能） |
| `offset` / `trigger-source` | LPWM 与 CIM 等模块的同步/触发配置 |
| `#pwm-cells` | PWM 绑定参数个数（period、duty 等） |

## 功能使用

PWM 驱动基于内核标准 PWM 子系统，用户态通过 `/sys/class/pwm/` 下的 sysfs 接口进行配置。

### Kernel 阶段

内核启动后，`hobot_lpwm` 驱动为每个使能的 LPWM 控制器注册 `pwmchip` 设备。

### 查看 PWM 控制器

```bash
ls /sys/class/pwm/

# 查看单个控制器的通道数
cat /sys/class/pwm/pwmchip0/npwm
# 4
```

<DocScope products="RDK S100">

S100 板端实测示例：

```bash
root@ubuntu:~# ls /sys/class/pwm/
pwmchip0  pwmchip4  pwmchip8

root@ubuntu:~# cat /sys/class/pwm/pwmchip4/npwm
4

root@ubuntu:~# lsmod | grep lpwm
hobot_lpwm            327680  0
lpwm_sync             262144  1 hobot_lpwm
```

启动日志示例：

```text
[I|LPWM|hobot_lpwm_dev.c+711]: [lpwm0]hobot_lpwm_probe Probe success
[I|LPWM|hobot_lpwm_dev.c+711]: [lpwm1]hobot_lpwm_probe Probe success
[I|LPWM|hobot_lpwm_dev.c+711]: [lpwm2]hobot_lpwm_probe Probe success
```

</DocScope>

<DocScope products="RDK S600">

S600 板端输出示例：

```text
pwmchip0  pwmchip12  pwmchip4  pwmchip8
```

</DocScope>

### 用户态使用

#### 配置并输出 PWM

以 `pwmchip0` 的通道 0 为例，输出 1 kHz、50% 占空比的 PWM：

```bash
# 导出通道 0
echo 0 > /sys/class/pwm/pwmchip0/export

# 查看生成的通道目录
ls /sys/class/pwm/pwmchip0/
# device  export  npwm  power  pwm0  subsystem  uevent  unexport

# 设置周期为 1 ms（即 1 kHz），单位 ns
echo 1000000 > /sys/class/pwm/pwmchip0/pwm0/period

# 设置占空比为 0.5 ms（50%），单位 ns
echo 500000 > /sys/class/pwm/pwmchip0/pwm0/duty_cycle

# 使能输出
echo 1 > /sys/class/pwm/pwmchip0/pwm0/enable

# 关闭输出
echo 0 > /sys/class/pwm/pwmchip0/pwm0/enable

# 释放通道
echo 0 > /sys/class/pwm/pwmchip0/unexport
```

:::tip

`period` 与 `duty_cycle` 单位为 **纳秒（ns）**。须先写 `period`，再写 `duty_cycle`，且 `duty_cycle` 不得大于 `period`，否则写入会报错。频率换算：`f = 1e9 / period`（Hz）。

:::

<DocScope products="RDK S100">

#### 示例使用

40-pin 扩展口对应 **lpwm1**，请使用 **pwmchip4**。以通道 0 输出 1 kHz、50% 占空比（板端实测命令与回读）：

```bash
root@ubuntu:~# echo 0 > /sys/class/pwm/pwmchip4/export
root@ubuntu:~# echo 1000000 > /sys/class/pwm/pwmchip4/pwm0/period
root@ubuntu:~# echo 500000 > /sys/class/pwm/pwmchip4/pwm0/duty_cycle
root@ubuntu:~# echo 1 > /sys/class/pwm/pwmchip4/pwm0/enable

root@ubuntu:~# cat /sys/class/pwm/pwmchip4/pwm0/period \
                   /sys/class/pwm/pwmchip4/pwm0/duty_cycle \
                   /sys/class/pwm/pwmchip4/pwm0/enable
1000000
500000
1

root@ubuntu:~# echo 0 > /sys/class/pwm/pwmchip4/pwm0/enable
root@ubuntu:~# echo 0 > /sys/class/pwm/pwmchip4/unexport
```

亦可通过 `Hobot.GPIO` 调用。板端脚本：`/app/40pin_samples/simple_pwm.py`（SDK：`hobot-io-samples/debian/app/40pin_samples/simple_pwm.py`）。

```bash
root@ubuntu:/app/40pin_samples# python3 simple_pwm.py
PWM running. Press CTRL+C to exit.
```

脚本在 **Pin 33**（`lpwm1` 通道 0）上以 **48 kHz** 输出，占空比在 0%～100% 间自动扫变（本板实测频率约 **47.6 kHz**）。完整参数、波形截图与接线说明见 [PWM 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/03_pwm.md)。

</DocScope>

## 调试

### 确认驱动加载状态

```bash
lsmod | grep lpwm
# hobot_lpwm            327680  0
# lpwm_sync             262144  1 hobot_lpwm
```

### 查看内核日志

```bash
dmesg | grep -i lpwm
```

正常应看到各 `lpwmN` 的 `hobot_lpwm_probe Probe success`。

### 查看引脚复用

若 sysfs 配置成功但引脚无波形，检查 LPWM 引脚是否复用为 `cam_lpwm*`：

```bash
cat /sys/kernel/debug/pinctrl/*/pinmux-pins | grep -i lpwm
```

也可用 `cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/pinmux-pins` 查看引脚复用状态。

### 排查 PWM 无输出

1. 确认控制器已注册：`ls /sys/class/pwm/` 是否包含 `pwmchip*` 节点。
2. 确认通道已导出且 `enable` 为 `1`。
3. 确认 `period` 与 `duty_cycle` 已正确写入。
4. 确认引脚已被复用为 `cam_lpwm*` 功能，可用 `cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/pinmux-pins` 查看引脚复用状态。

<DocScope products="RDK S100">

5. 40-pin 场景确认 Pin `32`/`33` 未被其他功能占用。

</DocScope>

## 常见问题

### PWM 无波形输出

**原因**：控制器未注册、通道未使能、`period`/`duty_cycle` 未正确写入，或引脚未复用为 `cam_lpwm*` 功能。

**解决**：按「调试」节逐项核对：`ls /sys/class/pwm/` 确认 `pwmchip*` 存在、`enable` 为 `1`、周期与占空比已写入，并用 `pinmux-pins` 查看引脚复用状态。

<DocScope products="RDK S100">

40-pin 扩展口仅 Pin `32`/`33` 可输出硬件 LPWM。

</DocScope>

### 写入的周期/占空比与预期频率不符

**原因**：sysfs 中 `period` 与 `duty_cycle` 的单位是纳秒（ns），被误当作频率（Hz）或百分比填写。

**解决**：按 `f = 1e9 / period` 换算频率，占空比 = `duty_cycle / period`；例如周期 `1000000`（ns）对应 1 kHz。

<DocScope products="RDK S100">

设定频率须处于 LPWM 硬件支持范围内（1 Hz～26 MHz；可调占空比频段 200 Hz～26 MHz）。`Hobot.GPIO.PWM` 脚本默认 48 kHz 已在板端验证。

</DocScope>

### duty_cycle 写入失败

**原因**：`duty_cycle` 大于 `period`，或尚未写入 `period`。

**解决**：先写 `period`，再写 `duty_cycle`，并保证 `duty_cycle ≤ period`。

<DocScope products="RDK S100">

### 运行 simple_pwm.py 提示不支持 PWM

**原因**：当前硬件未引出 40-pin LPWM 引脚，或所用 BOARD 编号不是 Pin `32`/`33`。

**解决**：在已引出 40-pin LPWM 的 RDK S100 开发板上运行；仅 Pin `32`、`33` 支持 `Hobot.GPIO.PWM`。详见 [PWM 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/03_pwm.md)。

### pwmchip0/pwmchip8 与相机功能冲突

**原因**：`lpwm0` 四路通道在 RDK S100 默认全部使能并绑定 `vin_vcon*` 相机同步；`lpwm2` 虽注册 `pwmchip8`，但板级 `channel = <0 0 0 0>` 未开放输出。

**解决**：40-pin 用户态验证请使用 **pwmchip4**（`lpwm1` 通道 0/1）。若需复用 `lpwm0`/`lpwm2` 做自定义触发，须同步调整 `rdk-camsys-*.dtsi` 中 `channel` 与相机 pipeline 配置，并评估对成像同步的影响。

</DocScope>

<DocScope products="RDK S600">

### LPWM 通道与相机 pipeline 冲突

**原因**：S600 默认将多路 `lpwm*` 通道绑定至 `vin_vcon*` 的 `lpwm_chn`，与用户态自行 `export` 的通道可能冲突。

**解决**：确认目标 `pwmchip` 与通道号未被成像子系统占用；必要时在板级 DTS 中调整 `channel` 与 `pinctrl-0` 后再验证波形。

</DocScope>

## 相关文档

- [扩展引脚应用（PWM）](/Demos/peripheral/40pin)
- [SPI 调试指南](./07_driver_spi_dev.md)
- [Pinctrl 调试指南](./05_driver_pinctrl_dev.md)

<DocScope products="RDK S100">

- 用户层示例：[PWM 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/03_pwm.md)
- 板端示例代码：`/app/40pin_samples/simple_pwm.py`

</DocScope>
