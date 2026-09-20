---
sidebar_position: 1
title: "管脚定义与应用（RDK S100）"
sidebar_products: RDK S100
sidebar_label: "管脚定义与应用"
description: "RDK S100 40-pin 扩展引脚定义与 GPIO 读写示例"
---

# 管脚定义与应用

## 功能概述

开发板上存在 40-pin 扩展引脚排，方便用户进行外围扩展。本章节介绍其接口定义，以及 GPIO 读写示例的使用方法。

开发板 `/app/40pin_samples/` 目录下预置了多种管脚的功能测试代码，包括 GPIO 的输入/输出测试、PWM、I2C、SPI、UART 等。所有示例均为 Python 语言编写，详细信息可查阅本章节其他模块。

:::tip
以下所提及的管脚仅作示例说明，不同平台的端口值存在差异，实际情况应以实际为准。亦可直接使用 `/app/40pin_samples/` 目录下的代码，该代码已在板子上经过实际验证。
:::

## 扩展引脚排定义{#40pin_define}

RDK S100 有 40-pin，方便用户进行外围扩展，其中数字 IO 采用 3.3V 电平设计。接口定义如下：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mainboard_40pin.png" alt="扩展引脚排定义图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::info
接口定义中，命名为 `40PIN_GPIO[x]_3V3` 的管脚是 I2C 扩展 IO 器件提供的 GPIO。该组管脚不受 Pinctrl 控制器管理，没有其他功能可复用，不需要在 dts 内配置 Pinmux，仅能作为**GPIO 功能**使用。
:::

:::warning
`I2C4_SDA_3V3`、`I2C4_SCL_3V3`、`I2C5_SDA_3V3`、`I2C5_SCL_3V3`、`UART2_TX_3V3`、`UART2_RX_3V3` 信号作为 **GPIO** 使用时，不允许接外部下拉电阻。
:::

## 环境准备

使用杜邦线将 40-pin 上的两个管脚引出：

- `SPI0_CS0_3V3`（第 24 脚）：输入管脚，接按键或电平源；
- `SPI0_CLK_3V3`（第 23 脚）：输出管脚，接 LED 或万用表。

## 代码位置

本章节所有示例代码位于板端 `/app/40pin_samples/` 目录，包含 10 个 Python 脚本：

```text
/app/40pin_samples/
├── button_event.py      # 边沿事件检测示例
├── button_interrupt.py  # 中断方式处理边沿事件示例
├── button_led.py        # 按键输入控制 LED 输出示例
├── gpio_rw_demo.py      # GPIO 读写演示（本文使用）
├── simple_input.py      # GPIO 输入示例
├── simple_out.py        # GPIO 输出示例
├── simple_pwm.py        # PWM 输出示例
├── test_i2c.py          # I2C 总线扫描与读写示例
├── test_serial.py       # UART 回环测试示例
└── test_spi.py          # SPI 回环测试示例
```

## 使用方法

本文使用 `/app/40pin_samples/gpio_rw_demo.py`，分别在输出模式与输入模式下演示 GPIO 读写。

```bash
root@ubuntu:~# cd /app/40pin_samples/
```

**输出模式**：循环翻转 `SPI0_CLK_3V3`（第 23 脚）输出管脚的电平并打印，默认间隔 3 秒：

```bash
root@ubuntu:/app/40pin_samples# python3 gpio_rw_demo.py output
```

可在命令后追加间隔秒数，例如改为 5 秒：

```bash
root@ubuntu:/app/40pin_samples# python3 gpio_rw_demo.py output 5
```

**输入模式**：读取 `SPI0_CS0_3V3`（第 24 脚）输入管脚的电平，**只在电平变化时才打印**：

```bash
root@ubuntu:/app/40pin_samples# python3 gpio_rw_demo.py input
```

两个模式均按 `Ctrl+C` 退出。

## 运行效果

**输出模式**：串口每隔 3 秒打印一次当前输出电平。同时可用万用表测量 `SPI0_CLK_3V3` 对 GND 的电压，应同步在 0V 与 3.3V 之间跳变。

```bash
root@ubuntu:/app/40pin_samples# python3 gpio_rw_demo.py output
Output mode: pin 23 (SPI_SCLK), interval 3s. Press CTRL+C to exit
Output pin 23 (SPI_SCLK): LOW
Output pin 23 (SPI_SCLK): HIGH
Output pin 23 (SPI_SCLK): LOW
```

**输入模式**：打印中括号内为板端丝印名。将 `SPI0_CS0_3V3` 接入 3.3V 读到高电平，再切到 GND 读到低电平，每次切换打印一行：

```bash
root@ubuntu:/app/40pin_samples# python3 gpio_rw_demo.py input
Input mode: pin 24 (SPI_CSN). Press CTRL+C to exit
Input pin 24 (SPI_CSN): HIGH
Input pin 24 (SPI_CSN): LOW
```

:::info
打印中的 `pin 23` / `pin 24` 是 BOARD 编码编号，括号内是管脚的板端丝印名（不含 `_3V3` 后缀），与 `hb_gpioinfo` 显示的 Pin Name 一致。
:::

:::note
`SPI0_CS0_3V3` 经板载电平转换器件接出，**带有弱上拉**：悬空或断开后不再接任何电平，仍会读到高电平。要读到低电平，必须将其主动接到 GND。
:::

## 常见问题

### 输入模式下切换电平但串口无打印

**原因**：`gpio_rw_demo.py` 输入模式只在电平变化时打印；输入管脚一直保持同一电平（悬空或固定接 3.3V/GND）。

**解决**：确认导线在 GND 与 3.3V 之间确实切换过。40-pin 上可直接取 3.3V；**切勿接 5V，会损坏 3.3V IO**。

### 输入电平一直读到高电平

**原因**：`SPI0_CS0_3V3` 经板载电平转换器件接出，带有弱上拉。断开外部电平后管脚被上拉到高电平，不会自动回落到低电平。

**解决**：要读到低电平，需将 `SPI0_CS0_3V3` 主动接到 GND。

### 输出管脚测不到电平变化

**原因**：输出管脚未外接测量点，或万用表未正确接地。

**解决**：确认杜邦线连接正确；`SPI0_CLK_3V3` 为输出，可将万用表一端接管脚、另一端接 GND 观察 0V/3.3V 跳变，或接 LED 观察亮灭。

## 相关文档

- [GPIO 应用](./02_gpio.md)
- [GPIO 使用](../../../../07_Advanced_development/04_driver_development/04_driver_gpio_dev.md)
- [硬件介绍](../../../../01_Quick_start/01_hardware_introduction/01_rdk_s100.md)
