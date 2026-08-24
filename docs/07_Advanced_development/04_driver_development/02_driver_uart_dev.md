---
sidebar_position: 2
title: "UART 驱动调试指南"
description: "UART 驱动调试指南"
---

# UART 驱动调试指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

UART（Universal Asynchronous Receiver/Transmitter，通用异步收发传输器）是 RDK 开发板的基础串行通信外设，本驱动基于 DesignWare 8250 框架实现，支持 DMA 收发与硬件流控。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要改动内核驱动、设备树，或调试板级串口的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 Linux 设备树（DTS）与 pinctrl 基础；如需做串口回环/收发自测，请准备杜邦线或 USB 转 TTL 模块。

**与其他模块关系**：本驱动是用户态串口读写应用（3.1.1 扩展引脚应用）的底层实现；调试控制台 uart0 的板级入口见「2.16 调试串口」；内核与 U-Boot 选项配置见「5.4.1 配置 U-Boot 和 Kernel 选项参数」。

### 硬件资源

<DocScope products="RDK S100">

S100 开发板共有 4 路 UART（uart0~uart3）：uart0 作为调试控制台，默认不开启 DMA，波特率（115200/921600）由 Bootstrap pin 控制；其余 3 路用于数据传输，设备树默认开启 DMA，支持软件配置波特率（常用 921600）；uart0、uart1 支持硬件流控。

</DocScope>

<DocScope products="RDK S600">

S600 开发板共有 8 路 UART（uart0~uart7）：uart0 作为调试控制台，默认不开启 DMA；其余 7 路用于数据传输，设备树默认开启 DMA，支持软件配置波特率（常用 921600）；uart0、uart1 支持硬件流控。

</DocScope>


## UART 使用说明

### 代码路径

```shell
drivers/tty/serial/8250/8250_dw.c   #uart驱动文件
drivers/tty/serial/8250/8250_port.c    #uart端口操作文件
drivers/tty/serial/8250/8250_core.c    #8250 uart驱动核心
hobot-drivers/serial/8250_pdma.c    #uart PDMA操作实现文件
```

### 内核配置

<DocScope products="RDK S100">
配置文件路径: `hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
配置文件路径: `hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>

```bash
CONFIG_SERIAL_8250=y   # 8250驱动配置
CONFIG_SERIAL_8250_CONSOLE=y   #8250 console驱动配置
CONFIG_SERIAL_8250_DW=y   #使能Designware独有的feature
```

### DTS 设备节点配置

<DocScope products="RDK S100">

```dts
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

```dts
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

## 使用示例

### 检查 UART 节点

```bash
ls /dev/ttyS*
```

<DocScope products="RDK S100">

```bash
/dev/ttyS0  /dev/ttyS1  /dev/ttyS2  /dev/ttyS3
```

</DocScope>

<DocScope products="RDK S600">

```bash
/dev/ttyS0  /dev/ttyS1  /dev/ttyS2  /dev/ttyS3  /dev/ttyS4
/dev/ttyS5  /dev/ttyS6  /dev/ttyS7
```

</DocScope>

### 串口相关操作

-   查看串口波特率等配置：

    ```bash
    stty -F /dev/ttyS1 -a
    ```

-   配置波特率等：

    ```bash
    stty -F /dev/ttyS1 speed 921600 cs8 -cstopb parenb -parodd
    ```

<DocScope products="RDK S100">

-   读取串口数据：

    ```bash
    cat /dev/ttyS1
    ```

-   向串口输出数据测试：

    ```bash
    echo 123456789 > /dev/ttyS1
    ```

</DocScope>
<DocScope products="RDK S600">

RDK S600是将 UART4 初始化为/dev/ttyS1，UART4 并没有引出物理引脚，且内部不支持软件环回，无法进行串口读写测试。

</DocScope>

## 注意事项

<DocScope products="RDK S100">

- RDK S100硬件设计上40PIN GPIO 使用了 TI 的 TXS 系列的电平转换芯片将1.8V IO 转成3.3V IO，为了信号的质量和可靠性，通信对端尽量不要使用电平转换芯片对其再次进行转换，若使用多级请关注实际硬件信号质量。

</DocScope>
<DocScope products="RDK S600">

- RDK S600硬件设计上只将 UART6 和 UART7 通过拓展引脚排引出，且使用了 TI 的 TXB 系列的电平转换芯片将1.8V IO 转成3.3V IO。**RDK S600 V0P1 开发板由于硬件限制，UART6 和 UART7 无法使用**。

</DocScope>

## 常见问题

### 串口通信数据异常或信号质量差

**原因**：RDK S100/S600 的 40PIN GPIO 都经过 TI TXS/TXB 系列电平转换芯片将 1.8V IO 转为 3.3V IO，通信对端若再做一级电平转换，会引入信号畸变，影响通信质量与可靠性。

**解决**：通信对端尽量不叠加电平转换芯片；若必须多级转换，实测关注线路信号质量（边沿、幅值）。

### RDK S600 无法对 /dev/ttyS1 做串口读写测试

**原因**：RDK S600 将 UART4 初始化为 `/dev/ttyS1`，但 UART4 未引出物理引脚且内部不支持软件环回；此外 V0P1 开发板因硬件限制，UART6、UART7 也无法使用。

**解决**：先通过 `ls /dev/ttyS*` 确认可用设备节点再做收发测试；未引出或受硬件限制的通道不进行串口读写验证。

## 相关文档

- [扩展引脚应用](/Demos/peripheral/40pin)
- [dpkg-deb 命令](/Appendix/linux-command-manual/dpkg-deb)
- [调试串口](/System_configuration/debug_serial)
