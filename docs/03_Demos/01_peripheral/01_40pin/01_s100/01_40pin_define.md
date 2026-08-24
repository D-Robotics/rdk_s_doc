---
sidebar_position: 1
title: "管脚定义与应用（RDK S100）"
sidebar_products: RDK S100
sidebar_label: "管脚定义与应用"
description: "RDK S100 40-pin 扩展引脚定义与 GPIO 读写示例"
---

# 管脚定义与应用


开发板上存在扩展引脚排，方便用户进行外围扩展，接口定义请查看本章节。

## 扩展引脚排定义{#40pin_define}

RDK S100 有 40-pin，方便用户进行外围扩展，其中数字 IO 采用 3.3V 电平设计。接口定义如下：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mainboard_40pin.png" alt="扩展引脚排定义图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::info
接口定义中，命名为`40PIN_GPIO[x]_3V3`的管脚是 I2C 扩展 IO 芯片提供的 GPIO，不受芯片 Pinctrl 控制器管理，没有其他功能可复用，不需要在 dts 内配置 Pinmux 功能，仅能作为**GPIO 功能**使用。
:::

## GPIO 读写操作示例

:::tip
以下所提及的管脚仅作示例说明，不同平台的端口值存在差异，实际情况应以实际为准。亦可直接使用`/app/40pin_samples/`目录下的代码，该代码已在板子上经过实际验证。
:::



开发板 `/app/40pin_samples/` 目录下，预置了多种 PIN 管脚的功能测试代码，包括 gpio 的输入/输出测试、PWM、I2C、SPI、UART 等测试。所有测试程序均使用 Python 语言编写，详细信息可以查阅本章节其他模块。

以`/app/40pin_samples/button_led.py`为例，该程序配置`24`号管脚为输入，配置`23`号管脚为输出，并根据`24`号管脚的输入状态来控制`23`号管脚的输出状态。

## 代码位置

本章节所有示例代码位于板端 `/app/40pin_samples/` 目录，包含 9 个 Python 脚本：

```text
/app/40pin_samples/
├── button_event.py      # 边沿事件检测示例
├── button_interrupt.py  # 中断方式处理边沿事件示例
├── button_led.py        # 按键输入控制 LED 输出示例
├── simple_input.py      # GPIO 输入示例
├── simple_out.py        # GPIO 输出示例
├── simple_pwm.py        # PWM 输出示例
├── test_i2c.py          # I2C 总线扫描与读写示例
├── test_serial.py       # UART 回环测试示例
└── test_spi.py          # SPI 回环测试示例
```

## 环境准备

使用杜邦线连接 `24`号管脚到 3.3V 或 GND，以控制其高低电平。

## 运行方式

执行 `button_led.py` 程序，以启动 GPIO 读写程序。

```bash
root@ubuntu:~# cd /app/40pin_samples/
root@ubuntu:/app/40pin_samples# sudo python3 ./button_led.py
```

## 预期效果

通过控制`24`号管脚的高低电平，可以改变 `23`号管脚的输出电平值。

```bash
root@ubuntu:/app/40pin_samples# sudo python3 ./button_led.py
Starting demo now! Press CTRL+C to exit
Outputting 1 to Pin 23
Outputting 0 to Pin 23
Outputting 1 to Pin 23
```

## 常见问题

### 运行示例脚本提示权限不足

**原因**：GPIO 等外设访问需要 root 权限。

**解决**：使用 `sudo python3 ./button_led.py` 运行，或先执行 `sudo -s` 切换到 root 用户。

### 管脚电平无变化

**原因**：输入管脚没有正确接电平，或输出管脚未外接测量点。

**解决**：确认杜邦线连接正确；`24` 号管脚为输入，需接 3.3V 或 GND；`23` 号管脚为输出，可用万用表或接 LED 观察。

## 相关文档

- [扩展引脚应用（S100）](./01_40pin_define.md)
- [GPIO 使用](../../../../07_Advanced_development/04_driver_development/04_driver_gpio_dev.md)
- [硬件介绍](../../../../01_Quick_start/01_hardware_introduction/01_rdk_s100.md)
