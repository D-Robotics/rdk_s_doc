---
sidebar_position: 2
---

# UART 驱动调试指南

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

S100(S600)芯片共有4(8)路 uart，即 uart0-uart3(uart0~uart7)。其中 uart0作为调试控制台使用，默认不开启 DMA，且需要通过控制 Bootstrip pin 决定波特率为115200或921600;

其他几路 uart 用作数据传输功能，设备树中默认开启 DMA，支持用户通过软件配置为各种波特率，常用波特率为921600。uart0和1支持硬件流控功能，其他几路 uart 不支持该功能。


## UART 使用说明

### 代码路径

```shell
drivers/tty/serial/8250/8250_dw.c   #uart驱动文件
drivers/tty/serial/8250/8250_port.c    #uart端口操作文件
drivers/tty/serial/8250/8250_core.c    #8250 uart驱动核心
hobot-drivers/serial/8250_pdma.c    #uart PDMA操作实现文件
```

<DocScope products="RDK S100">

```shell
kernel/arch/arm64/boot/dts/hobot/drobot-s100-pdma.dtsi   # PDMA 通道 / handshake 映射表
kernel/arch/arm64/boot/dts/hobot/drobot-s100-soc.dtsi    # UART 节点
```

</DocScope>
<DocScope products="RDK S600">

```shell
kernel/arch/arm64/boot/dts/hobot/drobot-s600-pdma.dtsi   # PDMA 通道 / handshake 映射表
kernel/arch/arm64/boot/dts/hobot/drobot-s600-soc.dtsi    # UART 节点
```

</DocScope>

### 内核配置

<DocScope products="RDK S100">
配置文件路径: `hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
配置文件路径: `hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>

``` {.text}
CONFIG_SERIAL_8250=y   # 8250驱动配置
CONFIG_SERIAL_8250_CONSOLE=y   #8250 console驱动配置
CONFIG_SERIAL_8250_DW=y   #使能Designware独有的feature
CONFIG_HOBOT_PDMAC=y   # UART PDMA 依赖
```

`CONFIG_SERIAL_8250_PDMA` 依赖 `SERIAL_8250 && HOBOT_PDMAC=y`，默认跟随 `SERIAL_8250`。

### DTS 设备节点配置

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

### UART DMA(PDMA) 配置

S100 A-core 侧 UART 可使用外设 DMA（PDMA）。`drobot-s100-pdma.dtsi` 预先描述每条 PDMA 通道对应的外设握手号，**只供查找 uart 对应的 pdma 通道，不可更改该设备树的配置**。

UART 与 handshake 对应关系如下，UART 编号以 `drobot-s100-soc.dtsi` 中节点为准：

| UART | RX handshake | TX handshake |
|---|---|---|
| uart0（console） | 2 | 3 |
| uart1@394A0000 | 0 | 1 |
| uart2@394C0000 | 4 | 5 |
| uart3@394D0000 | 6 | 7 |

在 `drobot-s100-soc.dtsi` 对应 UART 节点内添加 PDMA 相关属性即可使能，`dmas` 中的通道号需与上表 handshake 一致：

``` {.text}
&uart2 {
    status = "okay";
    dmas = <&pdma0 4>, <&pdma0 5>; /* rx, tx handshake */
    dma-names = "rx", "tx";
};
```

`drobot-s100-soc.dtsi` 中 uart1 已配置 `dmas` 与 `dma-names`，可作为参考（见上文设备节点）。

</DocScope>

<DocScope products="RDK S600">

### UART DMA(PDMA) 配置

S600 A-core 侧 UART 可使用外设 DMA（PDMA）。`drobot-s600-pdma.dtsi` 预先描述每条 PDMA 通道对应的外设握手号，**只供查找 uart 对应的 pdma 通道，不可更改该设备树的配置**。

UART 与 handshake 对应关系如下，UART 编号以 `drobot-s600-soc.dtsi` 中编号为准：

| UART | RX handshake | TX handshake |
|---|---|---|
| uart0（console） | 0 | 1 |
| uart1@3484A000 | 2 | 3 |
| uart2@3484B000 | 4 | 5 |
| uart3@3484D000 | 6 | 7 |
| uart4@3484E000 | 8 | 9 |
| uart5@3484F000 | 10 | 11 |
| uart6@34850000 | 12 | 13 |
| uart7@34851000 | 14 | 15 |

在 `drobot-s600-soc.dtsi` 对应 UART 节点内添加 PDMA 相关属性即可使能，`dmas` 中的通道号需与上表 handshake 一致：

``` {.text}
&uart6 {
    status = "okay";
    dmas = <&pdma0 12>, <&pdma0 13>; /* rx, tx handshake */
    dma-names = "rx", "tx";
};
```

`drobot-s600-soc.dtsi` 中 uart4 已配置 `dmas` 与 `dma-names`，可作为参考（见上文设备节点）。

</DocScope>

## 使用示例

### 检查 uart 节点

``` {.text}
ls /dev/ttyS*
/dev/ttyS0  /dev/ttyS1  /dev/ttyS2  /dev/ttyS3
```

### 串口相关操作

-   查看串口波特率等配置：

    ``` {.text}
    stty -F /dev/ttyS1 -a
    ```

-   配置波特率等：

    ``` {.text}
    stty -F /dev/ttyS1 speed 921600 cs8 -cstopb parenb -parodd
    ```

<DocScope products="RDK S100">

-   读取串口数据：

    ``` {.text}
    cat /dev/ttyS1
    ```

-   向串口输出数据测试：

    ``` {.text}
    echo 123456789 > /dev/ttyS1
    ```

</DocScope>
<DocScope products="RDK S600">

RDK S600是将 uart4初始化为/dev/ttyS1，uart4并没有引出物理引脚，且内部不支持软件环回，无法进行串口读写测试。

</DocScope>

## 注意事项

<DocScope products="RDK S100">

- RDK S100硬件设计上40PIN GPIO 使用了 TI 的 TXS 系列的电平转换芯片将1.8V IO 转成3.3V IO，为了信号的质量和可靠性，通信对端尽量不要使用电平转换芯片对其再次进行转换，若使用多级请关注实际硬件信号质量。
- **uart0 作为 console，不能使能 DMA。**

</DocScope>
<DocScope products="RDK S600">

- RDK S600硬件设计上只将 uart6和 uart7通过拓展引脚排引出，且使用了 TI 的 TXB 系列的电平转换芯片将1.8V IO 转成3.3V IO。**RDK S600 V0P1 开发板由于硬件限制，uart6和 uart7无法使用**。
- **uart0 作为 console，不能使能 DMA。**

</DocScope>
