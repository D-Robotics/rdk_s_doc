---
sidebar_position: 3
title: "PWM 应用（RDK S100）"
sidebar_products: RDK S100
sidebar_label: "PWM 应用"
description: "RDK S100 40-pin LPWM 使用与测试例程"
---

# PWM 应用

Hobot.GPIO 库仅在带有附加硬件 PWM 控制器的引脚上支持 PWM。与 RPi.GPIO 库不同，Hobot.GPIO 库不实现软件模拟 PWM。RDK S100 40pin 的硬件形态支持两路 LPWM。

PWM 使用方法见下方示例代码。

:::tip
以下所提及的管脚仅作示例说明，不同平台的端口值存在差异，实际情况应以实际为准。亦可直接使用`/app/40pin_samples/`目录下的代码，该代码已在板子上经过实际验证。
:::

## 代码位置

- 板端预置脚本：`/app/40pin_samples/simple_pwm.py`（与下方测试代码逻辑一致，可直接运行）
- 下方测试代码为同款内联示例，便于按需修改占空比/频率参数

## 测试代码

打开 `output_pin` 指定的 PWM 通道，初始占空比 25%， 先每 0.25 秒增加 5%占空比，达到 100%之后再每 0.25 秒减少 5%占空比，在正常输出波形时，可以通过示波器或者逻辑分析仪测量输出信号，观察波形。

```python
#!/usr/bin/env python3
import sys
import signal
import Hobot.GPIO as GPIO
import time

def signal_handler(signal, frame):
    sys.exit(0)

# 支持PWM的管脚: 32 and 33, 在使用PWM时，必须确保该管脚没有被其他功能占用
output_pin = 33

GPIO.setwarnings(False)

def main():
    # Pin Setup:
    # Board pin-numbering scheme
    GPIO.setmode(GPIO.BOARD)
    # 支持的频率范围： 48KHz ~ 192MHz
    p = GPIO.PWM(output_pin, 48000)
    # 初始占空比 25%， 先每0.25秒增加5%占空比，达到100%之后再每0.25秒减少5%占空比
    val = 25
    incr = 5
    p.ChangeDutyCycle(val)
    p.start(val)

    print("PWM running. Press CTRL+C to exit.")
    try:
        while True:
            time.sleep(0.25)
            if val >= 100:
                incr = -incr
            if val <= 0:
                incr = -incr
            val += incr
            p.ChangeDutyCycle(val)
    finally:
        p.stop()
        GPIO.cleanup()

if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)
    main()

```

## 常见问题

### 无波形输出

**原因**：PWM 管脚被其他功能占用，或未外接测量设备。

**解决**：确认 `32`/`33` 号管脚未被其他功能占用；用示波器或逻辑分析仪测量输出波形，示例输出为占空比 25% 起步、每 0.25 秒增减 5% 的方波。

### 提示 PWM 通道初始化失败

**原因**：所选管脚不支持硬件 PWM。

**解决**：RDK S100 40-pin 仅 `32`、`33` 号管脚支持 LPWM，换用这两个管脚。

## 相关文档

- [管脚定义](./01_40pin_define.md)
- [PWM 驱动调试指南](../../../../07_Advanced_development/04_driver_development/07_driver_pwm.md)
- [C/C++ demo 编程指南](../../../04_demo_support/02_c_cpp_build.md)
