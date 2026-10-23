---
sidebar_position: 2
---

# UART Driver Debugging Guide

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

The S100(S600) chip has a total of 4(8) UARTs, namely uart0-uart3(uart0~uart7). Among them, uart0 is used as the debug console, DMA is not enabled by default, and the baud rate is determined by controlling the Bootstrip pin to be either 115200 or 921600.

The other UARTs are used for data transmission, with DMA enabled by default in the device tree. They support various baud rates configured via software, with the commonly used baud rate being 921600. uart0 and uart1 support hardware flow control, while the other UARTs do not support this feature.

## UART Usage Instructions

### Code Path

```shell
drivers/tty/serial/8250/8250_dw.c   # UART driver file
drivers/tty/serial/8250/8250_port.c    # UART port operation file
drivers/tty/serial/8250/8250_core.c    # 8250 UART driver core
hobot-drivers/serial/8250_pdma.c    # UART PDMA operation implementation file
```

<DocScope products="RDK S100">

```shell
kernel/arch/arm64/boot/dts/hobot/drobot-s100-pdma.dtsi   # PDMA channel / handshake mapping
kernel/arch/arm64/boot/dts/hobot/drobot-s100-soc.dtsi    # UART nodes
```

</DocScope>
<DocScope products="RDK S600">

```shell
kernel/arch/arm64/boot/dts/hobot/drobot-s600-pdma.dtsi   # PDMA channel / handshake mapping
kernel/arch/arm64/boot/dts/hobot/drobot-s600-soc.dtsi    # UART nodes
```

</DocScope>

### Kernel Configuration

<DocScope products="RDK S100">
Configuration file path: `hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
Configuration file path: `hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>

``` {.text}
CONFIG_SERIAL_8250=y   # 8250 driver configuration
CONFIG_SERIAL_8250_CONSOLE=y   # 8250 console driver configuration
CONFIG_SERIAL_8250_DW=y   # Enable Designware-specific features
CONFIG_HOBOT_PDMAC=y   # Required by UART PDMA
```

`CONFIG_SERIAL_8250_PDMA` depends on `SERIAL_8250 && HOBOT_PDMAC=y` and follows `SERIAL_8250` by default.

### DTS Device Node Configuration

<DocScope products="RDK S100">

``` {.text}
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

``` {.text}
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

<DocScope products="RDK S100">

### UART DMA (PDMA) Configuration

S100 A-core UARTs can use peripheral DMA (PDMA). `drobot-s100-pdma.dtsi` predefines the handshake ID for each PDMA channel. **Use it only to look up the PDMA channel for a UART; do not modify that device tree.**

UART-to-handshake mapping is as follows. UART numbers follow the nodes in `drobot-s100-soc.dtsi`:

| UART | RX handshake | TX handshake |
|---|---|---|
| uart0 (console) | 2 | 3 |
| uart1@394A0000 | 0 | 1 |
| uart2@394C0000 | 4 | 5 |
| uart3@394D0000 | 6 | 7 |

Enable PDMA by adding the following properties to the corresponding UART node in `drobot-s100-soc.dtsi`. The channel numbers in `dmas` must match the handshake IDs in the table above:

``` {.text}
&uart2 {
    status = "okay";
    dmas = <&pdma0 4>, <&pdma0 5>; /* rx, tx handshake */
    dma-names = "rx", "tx";
};
```

uart1 in `drobot-s100-soc.dtsi` already has `dmas` and `dma-names` as a reference (see the device node above).

</DocScope>

<DocScope products="RDK S600">

### UART DMA (PDMA) Configuration

S600 A-core UARTs can use peripheral DMA (PDMA). `drobot-s600-pdma.dtsi` predefines the handshake ID for each PDMA channel. **Use it only to look up the PDMA channel for a UART; do not modify that device tree.**

UART-to-handshake mapping is as follows. UART numbers follow those in `drobot-s600-soc.dtsi`:

| UART | RX handshake | TX handshake |
|---|---|---|
| uart0 (console) | 0 | 1 |
| uart1@3484A000 | 2 | 3 |
| uart2@3484B000 | 4 | 5 |
| uart3@3484D000 | 6 | 7 |
| uart4@3484E000 | 8 | 9 |
| uart5@3484F000 | 10 | 11 |
| uart6@34850000 | 12 | 13 |
| uart7@34851000 | 14 | 15 |

Enable PDMA by adding the following properties to the corresponding UART node in `drobot-s600-soc.dtsi`. The channel numbers in `dmas` must match the handshake IDs in the table above:

``` {.text}
&uart6 {
    status = "okay";
    dmas = <&pdma0 12>, <&pdma0 13>; /* rx, tx handshake */
    dma-names = "rx", "tx";
};
```

uart4 in `drobot-s600-soc.dtsi` already has `dmas` and `dma-names` as a reference (see the device node above).

</DocScope>

## Usage Examples

### Check UART Nodes

``` {.text}
ls /dev/ttyS*
/dev/ttyS0  /dev/ttyS1  /dev/ttyS2  /dev/ttyS3
```

### Serial Port Operations

-   View serial port baud rate and other configurations:

    ``` {.text}
    stty -F /dev/ttyS1 -a
    ```

-   Configure baud rate, etc.:

    ``` {.text}
    stty -F /dev/ttyS1 speed 921600 cs8 -cstopb parenb -parodd
    ```

<DocScope products="RDK S100">

-   Read serial port data:

    ``` {.text}
    cat /dev/ttyS1
    ```

-   Test output data to the serial port:

    ``` {.text}
    echo 123456789 > /dev/ttyS1
    ```

</DocScope>
<DocScope products="RDK S600">

On RDK S600, uart4 is initialized as /dev/ttyS1. uart4 does not have physical pins exposed and does not support software loopback internally, so serial read/write testing cannot be performed.

</DocScope>

## Important Notes

<DocScope products="RDK S100">

- In the RDK S100 hardware design, the 40-pin GPIO uses a TXS series level shift chip from TI to convert 1.8V IO to 3.3V IO. For signal quality and reliability, it is recommended that the communication peer avoid using another level shift chip for further conversion. If multiple stages are used, please pay attention to the actual hardware signal quality.
- **uart0 is used as the console and must not enable DMA.**

</DocScope>
<DocScope products="RDK S600">

- In the RDK S600 hardware design, only uart6 and uart7 are exposed via expansion pin headers, and a TXB series level shift chip from TI is used to convert 1.8V IO to 3.3V IO. **Due to hardware limitations on the RDK S600 V0P1 development board, uart6 and uart7 cannot be used**.
- **uart0 is used as the console and must not enable DMA.**

</DocScope>