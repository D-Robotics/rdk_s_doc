---
sidebar_position: 2
---

# UART Driver Debugging Guide

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Overview

UART (Universal Asynchronous Receiver/Transmitter) is the basic serial communication peripheral on RDK development boards. This driver is implemented on the DesignWare 8250 framework and supports DMA transfer and hardware flow control.

**Target Audience**: Mode 3 deep-customization developers (commercial customers / deep teams) — BSP/driver engineers who need to modify kernel drivers or device trees, or debug board-level serial ports.

**Prerequisites**: RDK OS has been flashed and the board can be logged in; familiarity with the Linux device tree (DTS) and pinctrl basics; for serial loopback or transmit/receive self-testing, prepare jumper wires or a USB-to-TTL module.

**Relationships with Other Modules**: This driver is the underlying implementation of the user-space serial read/write application [3.1.1 Expansion Pin Usage](../../03_Demos/01_peripheral/01_40pin/01_s100/01_40pin_define.md); the board-level entry for the debug console uart0 is in [2.16 Debug Serial](../../02_System_configuration/16_debug_serial.md); kernel and U-Boot option configuration is in [5.4.1 Configuring U-Boot and Kernel Option Parameters](./01_uboot_kernel_config.md).

### Hardware Resources

<DocScope products="RDK S100">

The RDK S100 development board has 4 UARTs (uart0 to uart3): uart0 serves as the debug console with DMA disabled by default, and its baud rate (115200/921600) is controlled by the Bootstrap pin. The other 3 UARTs are used for data transmission with DMA enabled by default in the device tree, and they support software-configured baud rates (commonly 921600). uart0 and uart1 support hardware flow control.

</DocScope>

<DocScope products="RDK S600">

The RDK S600 development board has 8 UARTs (uart0 to uart7): uart0 serves as the debug console with DMA disabled by default. The other 7 UARTs are used for data transmission with DMA enabled by default in the device tree, and they support software-configured baud rates (commonly 921600). uart0 and uart1 support hardware flow control.

</DocScope>

## UART Usage Instructions

### Code Path

```shell
drivers/tty/serial/8250/8250_dw.c   # UART driver file
drivers/tty/serial/8250/8250_port.c    # UART port operation file
drivers/tty/serial/8250/8250_core.c    # 8250 UART driver core
hobot-drivers/serial/8250_pdma.c    # UART PDMA operation implementation file
```

### Kernel Configuration

<DocScope products="RDK S100">
Configuration file path: `hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
Configuration file path: `hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>

```text
CONFIG_SERIAL_8250=y   # 8250 driver configuration
CONFIG_SERIAL_8250_CONSOLE=y   # 8250 console driver configuration
CONFIG_SERIAL_8250_DW=y   # Enable Designware-specific features
```

### DTS Device Node Configuration

<DocScope products="RDK S100">

```text
/*kernel/arch/arm64/boot/dts/hobot/drobot-s100-soc.dtsi*/
uart1: uart@394A0000 {
    power-domains = <&scmi_smc_pd PD_IDX_LSPERI_TOP>;
    compatible = "snps,dw-apb-uart";
    reg = <0x0 0x394A0000 0x0 0x10000>;
    reg-shift = <2>;
    reg-io-width = <4>;
    interrupts = <GIC_SPI PERISYS_UART0_INTR PERISYS_UART0_INTR_TRIG_TYPE>;
    clock-frequency = <200000000>;
    pinctrl-names = "default";
    pinctrl-0 = <&peri_uart0>;
    dmas = <&pdma0 0>, <&pdma0 1>;
    dma-names = "rx", "tx";
    status = "okay";
};
```

</DocScope>
<DocScope products="RDK S600">

```text
/*kernel/arch/arm64/boot/dts/hobot/drobot-s600-soc.dtsi*/
uart4: uart@3484E000 {
    // power-domains = <&scmi_smc_pd PD_IDX_LSPERI_TOP>;
    compatible = "snps,dw-apb-uart";
    reg-shift = <2>;
    reg-io-width = <4>;
    reg = <0x0 0x3484E000 0x0 0x10000>;
    interrupts = <GIC_SPI HSISYS_UART4_INTR IRQ_TYPE_LEVEL_HIGH>;
    clock-frequency = <500000000>;
    pinctrl-names = "default";
    pinctrl-0 = <&hsi_uart4_txd_uart4_txd &hsi_uart4_rxd_uart4_rxd>;
    dmas = <&pdma0 8>, <&pdma0 9>;
    dma-names = "rx", "tx";
};
```

</DocScope>

## Usage Examples

### Check UART Nodes

```text
ls /dev/ttyS*
```

<DocScope products="RDK S100">

```text
/dev/ttyS0  /dev/ttyS1  /dev/ttyS2  /dev/ttyS3
```

</DocScope>

<DocScope products="RDK S600">

```text
/dev/ttyS0  /dev/ttyS1  /dev/ttyS2  /dev/ttyS3  /dev/ttyS4
/dev/ttyS5  /dev/ttyS6  /dev/ttyS7
```

</DocScope>

### Serial Port Operations

-   View serial port baud rate and other configurations:

    ```text
    stty -F /dev/ttyS1 -a
    ```

-   Configure baud rate, etc.:

    ```text
    stty -F /dev/ttyS1 speed 921600 cs8 -cstopb parenb -parodd
    ```

<DocScope products="RDK S100">

-   Read serial port data:

    ```text
    cat /dev/ttyS1
    ```

-   Test output data to the serial port:

    ```text
    echo 123456789 > /dev/ttyS1
    ```

</DocScope>
<DocScope products="RDK S600">

On RDK S600, uart4 is initialized as /dev/ttyS1. uart4 does not have physical pins exposed and does not support software loopback internally, so serial read/write testing cannot be performed.

</DocScope>

## Important Notes

<DocScope products="RDK S100">

- In the RDK S100 hardware design, the 40-pin GPIO uses a TXS series level shift chip from TI to convert 1.8V IO to 3.3V IO. For signal quality and reliability, it is recommended that the communication peer avoid using another level shift chip for further conversion. If multiple stages are used, please pay attention to the actual hardware signal quality.

</DocScope>
<DocScope products="RDK S600">

- In the RDK S600 hardware design, only uart6 and uart7 are exposed via expansion pin headers, and a TXB series level shift chip from TI is used to convert 1.8V IO to 3.3V IO. **Due to hardware limitations on the RDK S600 V0P1 development board, uart6 and uart7 cannot be used**.

</DocScope>

## FAQ

### Serial communication data is abnormal or signal quality is poor

**Cause**: The 40-pin GPIO on RDK S100/S600 both use TI TXS/TXB series level shift chips to convert 1.8V IO to 3.3V IO. If the communication peer adds another level of level shifting, it introduces signal distortion and affects communication quality and reliability.

**Solution**: Avoid stacking additional level shift chips on the communication peer; if multi-level conversion is necessary, measure the line signal quality (edges, amplitude) during testing.

### RDK S600 cannot perform serial read/write testing on /dev/ttyS1

**Cause**: The RDK S600 initializes UART4 as `/dev/ttyS1`, but UART4 has no physical pins exposed and does not support software loopback internally. In addition, the V0P1 development board cannot use UART6 and UART7 due to hardware limitations.

**Solution**: First run `ls /dev/ttyS*` to confirm available device nodes before performing transmit/receive tests; channels that are not exposed or are limited by hardware should not be used for serial read/write verification.

## Related Documentation

- [Expansion Pin Usage](../../03_Demos/01_peripheral/01_40pin/01_s100/01_40pin_define.md)
- [dpkg-deb Command](../../09_Appendix/linux-command-manual/03_dpkg-deb.md)
- [Debug Serial](../../02_System_configuration/16_debug_serial.md)
