---
sidebar_position: 7
title: "PWM 驱动调试指南"
description: "PWM 驱动调试指南"
---

# PWM 驱动调试指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK S100">
S100 的 PWM 控制器是 LPWM（Light Pulse Width Modulation），位于 CAM 域，SDK 中配置了 `lpwm0`~`lpwm2` 共 3 个控制器节点，每个控制器提供多个输出通道。
</DocScope>

<DocScope products="RDK S600">
S600 的 PWM 控制器是 LPWM（Light Pulse Width Modulation），位于 CAM 域，SDK 中配置了 `lpwm0`~`lpwm3` 共 4 个控制器节点，每个控制器提供 4 个输出通道（`npwm = 4`）。

板端实测的 PWM 控制器如下：

| 控制器 | 寄存器基地址 | pwmchip 节点 | 通道数 |
|---|---|---|---|
| lpwm0 | 0x3712C000 | /sys/class/pwm/pwmchip0 | 4 |
| lpwm1 | 0x3712D000 | /sys/class/pwm/pwmchip4 | 4 |
| lpwm2 | 0x3712E000 | /sys/class/pwm/pwmchip8 | 4 |
| lpwm3 | 0x3712F000 | /sys/class/pwm/pwmchip12 | 4 |

</DocScope>

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要调试 PWM 驱动、设备树或输出波形的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 Linux PWM 子系统与设备树基础；PWM 输出引脚已正确复用。

**与其他模块关系**：本驱动是用户态 PWM 应用（扩展引脚应用）的底层实现；引脚复用配置见「[Pinctrl 调试指南](./05_driver_pinctrl_dev.md)」。

## 驱动代码

LPWM 控制器驱动位于 `hobot-drivers/camsys/lpwm_super/` 目录，其同步封装驱动位于 `hobot-drivers/pwm/` 目录。

```bash
hobot-drivers/camsys/lpwm_super/hobot_lpwm_dev.c  # LPWM 控制器驱动（模块 hobot_lpwm）
hobot-drivers/camsys/lpwm_super/hobot_lpwm_ops.c  # LPWM 操作实现
hobot-drivers/camsys/lpwm_super/hobot_lpwm_hw_reg.c # LPWM 寄存器访问
hobot-drivers/pwm/lpwm_sync.c                     # LPWM 同步封装（模块 lpwm_sync）
```

LPWM 控制器的 `compatible` 属性为 `"hobot,hobot-lpwm"`，驱动名称为 `hobot-lpwm`。

### 内核配置

配置文件路径：`hobot-drivers/configs/drobot_s600_defconfig`。

```bash
CONFIG_PWM=y             # PWM 子系统
CONFIG_HOBOT_LPWM=m      # LPWM 控制器驱动（模块）
CONFIG_LPWM_SYNC=m       # LPWM 同步封装（模块）
```

## 设备树配置

<DocScope products="RDK S100">
LPWM 节点定义在 `hobot-drivers/kernel-dts/drobot-camsys-base.dtsi`：

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

</DocScope>

<DocScope products="RDK S600">
LPWM 节点定义在 `hobot-drivers/kernel-dts/drobot-s600-camsys.dtsi`：

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

其中 `pinctrl-0` 引用的 `cam_lpwm0` 等节点定义了 PWM 输出引脚，定义在 `drobot-s600-pinctrl.dtsi`（S100 为 `drobot-s100-pinctrl.dtsi`）中。如需在引脚上输出 PWM，需保证对应引脚被复用为 `cam_lpwm*` 功能。

## 功能使用

PWM 驱动基于内核标准 PWM 子系统，用户态通过 `/sys/class/pwm/` 下的 sysfs 接口进行配置。

### 查看 PWM 控制器

```bash
ls /sys/class/pwm/
# 输出示例（RDK S600）：
# pwmchip0  pwmchip12  pwmchip4  pwmchip8

# 查看单个控制器的通道数
cat /sys/class/pwm/pwmchip0/npwm
# 4
```

### 配置并输出 PWM

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

`duty_cycle` 的值不能大于 `period`，否则写入会报错。调整占空比时请先写入 `period`，再写入 `duty_cycle`。

:::

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

### 排查 PWM 无输出

1. 确认控制器已注册：`ls /sys/class/pwm/` 是否包含 `pwmchip*` 节点。
2. 确认通道已导出且 `enable` 为 `1`。
3. 确认 `period` 与 `duty_cycle` 已正确写入。
4. 确认引脚已被复用为 `cam_lpwm*` 功能，可用 `cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/pinmux-pins` 查看引脚复用状态。

## 常见问题

### PWM 无波形输出

**原因**：控制器未注册、通道未使能、`period`/`duty_cycle` 未正确写入，或引脚未复用为 `cam_lpwm*` 功能。

**解决**：按「调试」节逐项核对：`ls /sys/class/pwm/` 确认 `pwmchip*` 存在、`enable` 为 `1`、周期与占空比已写入，并用 `pinmux-pins` 查看引脚复用状态。

### 写入的周期/占空比与预期频率不符

**原因**：sysfs 中 `period` 与 `duty_cycle` 的单位是纳秒（ns），被误当作频率（Hz）或百分比填写。

**解决**：按 `f = 1e9 / period` 换算频率，占空比 = `duty_cycle / period`；例如周期 `1000000`（ns）对应 1 kHz。

## 相关文档

- [扩展引脚应用（PWM）](/Demos/peripheral/40pin)
- [SPI 调试指南](/Advanced_development/driver_development/driver_spi_dev)
- [Pinctrl 调试指南](/Advanced_development/driver_development/driver_pinctrl_dev)
