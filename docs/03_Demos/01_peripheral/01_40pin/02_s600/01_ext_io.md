---
sidebar_position: 1
title: "管脚定义与应用（RDK S600）"
sidebar_products: RDK S600
sidebar_label: "管脚定义与应用"
description: "RDK S600 扩展引脚定义与 GPIO 读写示例"
---

# 管脚定义与应用

## 功能概述

开发板上存在多个自锁连接器，方便用户进行外围扩展。自锁连接器带锁扣，插头插入后自动锁紧，防止振动或拉扯时松脱。本章节介绍其接口定义，以及 GPIO 读写示例的使用方法。

开发板 `/app/40pin_samples/` 目录下预置了多种管脚的功能测试代码，包括 GPIO 的输入/输出测试、I2C、SPI、UART 等。所有示例均为 Python 语言编写，详细信息可查阅本章节其他模块。

:::tip
以下所提及的管脚仅作示例说明，不同平台的端口值存在差异，实际情况应以实际为准。亦可直接使用 `/app/40pin_samples/` 目录下的代码，该代码已在板子上经过实际验证。
:::

## 扩展引脚排定义{#pin_define}

RDK S600 有 2 个 10-pin 自锁接口、1 个 12-pin 自锁接口、1 个 14-pin 自锁接口，方便用户进行外围扩展。接口定义如下：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_mainboard_pin.png" alt="扩展引脚排定义实物图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::note
上述自锁接口为 1.25mm 间距的线对板连接器（如星坤 X1251WRS 系列）。接线需使用配套的自锁插头（胶壳 + 压线端子），杜邦线（2.54mm）无法直接插入。
:::

其中 J19（14-pin）为 PCM+I2C 接口，原用于接入音频子卡，本文示例即使用其上的 PCM 管脚（复用为 GPIO），该组管脚为 **1.8V** 电平。

## 环境准备

使用配套自锁插头，将 J19（14-pin 自锁接口）上的两个管脚压线引出：

- `PCM1_DATA0_1V8`（J19 第 4 脚）：输入管脚，接按键或电平源；
- `PCM1_FSYNC_1V8`（J19 第 3 脚）：输出管脚，接 LED 或万用表。

## 代码位置

本章节所有示例代码位于板端 `/app/40pin_samples/` 目录，包含 9 个 Python 脚本：

```text
/app/40pin_samples/
├── button_event.py      # 边沿事件检测示例
├── button_interrupt.py  # 中断方式处理边沿事件示例
├── button_led.py        # 按键输入控制 LED 输出示例
├── gpio_rw_demo.py      # GPIO 读写演示（本文使用）
├── simple_input.py      # GPIO 输入示例
├── simple_out.py        # GPIO 输出示例
├── test_i2c.py          # I2C 总线扫描与读写示例
├── test_serial.py       # UART 回环测试示例
└── test_spi.py          # SPI 回环测试示例
```

## 使用方法

本文使用 `/app/40pin_samples/gpio_rw_demo.py`，分别在输出模式与输入模式下演示 GPIO 读写。

```bash
root@drobot:~# cd /app/40pin_samples/
```

**输出模式**：循环翻转 `PCM1_FSYNC_1V8` 输出管脚的电平并打印，默认间隔 3 秒：

```bash
root@drobot:/app/40pin_samples# python3 gpio_rw_demo.py output
```

可在命令后追加间隔秒数，例如改为 5 秒：

```bash
root@drobot:/app/40pin_samples# python3 gpio_rw_demo.py output 5
```

**输入模式**：读取 `PCM1_DATA0_1V8` 输入管脚的电平，**只在电平变化时才打印**：

```bash
root@drobot:/app/40pin_samples# python3 gpio_rw_demo.py input
```

两个模式均按 `Ctrl+C` 退出。

## 运行效果

**输出模式**：串口每隔 3 秒打印一次当前输出电平。同时可用万用表测量 `PCM1_FSYNC_1V8` 对 GND 的电压，应同步在 0V 与 1.8V 之间跳变。

```bash
root@drobot:/app/40pin_samples# python3 gpio_rw_demo.py output
Output mode: pin 3 (PCM1_FSYNC), interval 3s. Press CTRL+C to exit
Output pin 3 (PCM1_FSYNC): LOW
Output pin 3 (PCM1_FSYNC): HIGH
Output pin 3 (PCM1_FSYNC): LOW
```

**输入模式**：打印中括号内为板端丝印名。将 `PCM1_DATA0_1V8` 手动接入 GND（低电平）或 1.8V（高电平），每次切换打印一行：

```bash
root@drobot:/app/40pin_samples# python3 gpio_rw_demo.py input
Input mode: pin 4 (PCM1_DATA0). Press CTRL+C to exit
Input pin 4 (PCM1_DATA0): LOW
Input pin 4 (PCM1_DATA0): HIGH
Input pin 4 (PCM1_DATA0): LOW
```

:::info
打印中的 `pin 3` / `pin 4` 是 BOARD 编码编号，括号内是管脚的板端丝印名（不含 `_1V8` 后缀），与 `hb_gpioinfo` 显示的 Pin Name 一致。
:::

## 常见问题

### 输入模式下切换电平但串口无打印

**原因**：`gpio_rw_demo.py` 输入模式只在电平变化时打印；输入管脚 `PCM1_DATA0_1V8` 一直保持同一电平（悬空或固定接 1.8V/GND）。

**解决**：确认导线在 GND 与 1.8V 之间确实切换过；注意 S600 扩展接口未引出 1.8V 电源，需从 J15 的 `VDDIO_MCU_1V8` 引出，**切勿接 5V，会损坏 1.8V IO**。

### 输入电平读数不确定

**原因**：输入管脚内部无上下拉，悬空时电平不确定。

**解决**：为输入管脚接确定电平（GND 或 1.8V），不要悬空。

### 输出管脚测不到电平变化

**原因**：输出管脚未外接测量点，或万用表未正确接地。

**解决**：确认自锁插头压线正确；`PCM1_FSYNC_1V8` 为输出，可将万用表一端接管脚、另一端接 GND 观察 0V/1.8V 跳变，或接 LED 观察亮灭。

## 相关文档

- [GPIO 应用](./02_gpio.md)
- [GPIO 使用](../../../../07_Advanced_development/04_driver_development/04_driver_gpio_dev.md)
- [硬件介绍](../../../../01_Quick_start/01_hardware_introduction/02_rdk_s600.md)
