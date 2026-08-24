---
sidebar_position: 7
title: "PWM Driver Debugging Guide"
description: "PWM Driver Debugging Guide"
---

# PWM Driver Debugging Guide

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK S100">
The PWM controller on the S100 is the LPWM (Light Pulse Width Modulation), located in the CAM domain. The SDK configures 3 controller nodes `lpwm0`~`lpwm2`, each providing multiple output channels.
</DocScope>

<DocScope products="RDK S600">
The PWM controller on the S600 is the LPWM (Light Pulse Width Modulation), located in the CAM domain. The SDK configures 4 controller nodes `lpwm0`~`lpwm3`, each providing 4 output channels (`npwm = 4`).

PWM controllers measured on the board:

| Controller | Register Base Address | pwmchip Node | Channel Count |
|---|---|---|---|
| lpwm0 | 0x3712C000 | /sys/class/pwm/pwmchip0 | 4 |
| lpwm1 | 0x3712D000 | /sys/class/pwm/pwmchip4 | 4 |
| lpwm2 | 0x3712E000 | /sys/class/pwm/pwmchip8 | 4 |
| lpwm3 | 0x3712F000 | /sys/class/pwm/pwmchip12 | 4 |

</DocScope>

## Driver Code

The LPWM controller driver is located in the `hobot-drivers/camsys/lpwm_super/` directory, and its synchronous wrapper driver is in the `hobot-drivers/pwm/` directory.

```bash
hobot-drivers/camsys/lpwm_super/hobot_lpwm_dev.c  # LPWM controller driver (module hobot_lpwm)
hobot-drivers/camsys/lpwm_super/hobot_lpwm_ops.c  # LPWM operation implementation
hobot-drivers/camsys/lpwm_super/hobot_lpwm_hw_reg.c # LPWM register access
hobot-drivers/pwm/lpwm_sync.c                     # LPWM synchronous wrapper (module lpwm_sync)
```

The `compatible` property of the LPWM controller is `"hobot,hobot-lpwm"`, and the driver name is `hobot-lpwm`.

### Kernel Configuration

Configuration file path: `hobot-drivers/configs/drobot_s600_defconfig`.

```bash
CONFIG_PWM=y             # PWM subsystem
CONFIG_HOBOT_LPWM=m      # LPWM controller driver (module)
CONFIG_LPWM_SYNC=m       # LPWM synchronous wrapper (module)
```

## Device Tree Configuration

<DocScope products="RDK S100">
The LPWM node is defined in `hobot-drivers/kernel-dts/drobot-camsys-base.dtsi`:

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
The LPWM node is defined in `hobot-drivers/kernel-dts/drobot-s600-camsys.dtsi`:

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

The `cam_lpwm0` and other nodes referenced by `pinctrl-0` define the PWM output pins, and are defined in `drobot-s600-pinctrl.dtsi` (for the S100, `drobot-s100-pinctrl.dtsi`). To output PWM on a pin, the corresponding pin must be muxed to the `cam_lpwm*` function.

## Usage

The PWM driver is based on the kernel standard PWM subsystem. In user space, configuration is done through the sysfs interface under `/sys/class/pwm/`.

### Viewing PWM Controllers

```bash
ls /sys/class/pwm/
# Example output (RDK S600):
# pwmchip0  pwmchip12  pwmchip4  pwmchip8

# View the channel count of a single controller
cat /sys/class/pwm/pwmchip0/npwm
# 4
```

### Configuring and Outputting PWM

Take channel 0 of `pwmchip0` as an example: output a 1 kHz PWM with 50% duty cycle:

```bash
# Export channel 0
echo 0 > /sys/class/pwm/pwmchip0/export

# View the generated channel directory
ls /sys/class/pwm/pwmchip0/
# device  export  npwm  power  pwm0  subsystem  uevent  unexport

# Set the period to 1 ms (i.e. 1 kHz), in ns
echo 1000000 > /sys/class/pwm/pwmchip0/pwm0/period

# Set the duty cycle to 0.5 ms (50%), in ns
echo 500000 > /sys/class/pwm/pwmchip0/pwm0/duty_cycle

# Enable the output
echo 1 > /sys/class/pwm/pwmchip0/pwm0/enable

# Disable the output
echo 0 > /sys/class/pwm/pwmchip0/pwm0/enable

# Unexport the channel
echo 0 > /sys/class/pwm/pwmchip0/unexport
```

:::tip

The `duty_cycle` value must not be greater than `period`; otherwise the write reports an error. When adjusting the duty cycle, write `period` first, then `duty_cycle`.

:::

## Debugging

### Confirming the Driver Load Status

```bash
lsmod | grep lpwm
# hobot_lpwm            327680  0
# lpwm_sync             262144  1 hobot_lpwm
```

### Viewing Kernel Logs

```bash
dmesg | grep -i lpwm
```

### Troubleshooting No PWM Output

1. Confirm the controller is registered: check whether `ls /sys/class/pwm/` contains `pwmchip*` nodes.
2. Confirm the channel is exported and `enable` is `1`.
3. Confirm `period` and `duty_cycle` are written correctly.
4. Confirm the pin is muxed to the `cam_lpwm*` function; use `cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/pinmux-pins` to view the pin mux status.

## Related Documentation

- [Expansion Pin Usage (PWM)](../../03_Demos/01_peripheral/01_40pin/01_s100/01_40pin_define.md)
- [SPI Debugging Guide](./07_driver_spi_dev.md)
- [Pinctrl Debugging Guide](./05_driver_pinctrl_dev.md)