---
sidebar_position: 3
title: "串口应用（RDK S600）"
sidebar_products: RDK S600
sidebar_label: "串口应用"
description: "RDK S600 自锁 10-PIN UART 使用与回环测试"
---

# 串口应用


RDK S600 在 自锁10-PIN 支持 UART6 UART7，IO 电压 3.3V。

请参阅 `/app/40pin_samples/test_serial.py`了解如何使用串口的详细信息。

:::tip
以下所提及的管脚仅作示例说明，不同平台的端口值存在差异，实际情况应以实际为准。亦可直接使用`/app/40pin_samples/`目录下的代码，该代码已在板子上经过实际验证。
:::

## 代码位置

UART 回环测试代码位于板端 `/app/40pin_samples/test_serial.py`。

## 回环测试

把 TXD 和 RXD 在硬件上进行连接，然后运行测试程序，进行写和读操作，预期结果是读出的数据要完全等于写入的数据

### 硬件连接

测试之前，把 TXD 和 RXD 短接：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/03_40pin_user_guide/image/40pin_user_guide/image-rdk_s600_uart.png" alt="硬件连接示意图" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### 测试过程

- 运行 `python3 /app/40pin_samples/test_serial.py`
- 从打印的串口设备（其中 /dev/ttyS0 是系统调试口，不建议对它进行测试，除非你完全明白它的作用）中选择串口设备作为输入选项，例如 RDK S600 选择测试 `/dev/ttyS6` 或者 `/dev/ttyS7` 按回车键确认，并输入波特率参数：

```
root@ubuntu:/app/40pin_samples# ./test_serial.py
List of enabled UART:
/dev/ttyS0
/dev/ttyS1
/dev/ttyS2
/dev/ttyS3
/dev/ttyS4
/dev/ttyS5
/dev/ttyS6
/dev/ttyS7

请输出需要测试的串口设备名(默认 /dev/ttyS0):/dev/ttyS6
请输入波特率(默认115200):921600
Serial<id=0xffff211c3850, open=True>(port='/dev/ttyS6', baudrate=921600, bytesize=8, parity='N', stopbits=1, timeout=1, xonxoff=False, rtscts=False, dsrdtr=False)
```

- TXD 与 RXD 短接后，程序正确运行起来会持续打印 `Send: AA55` 和 `Recv:  AA55`：

```
Starting demo now! Press CTRL+C to exit
Send:  AA55
Recv:  AA55
```

- 若未短接 TXD/RXD，`Recv:` 后面为空（读不到数据），说明回环失败：

```
Starting demo now! Press CTRL+C to exit
Send:  AA55
Recv:
```

## 测试代码

:::caution 注意
设备树中 ttyS 与 uart 硬件控制器的对应关系为：`/dev/ttyS0` ~ `/dev/ttyS7` 依次对应 `uart0` ~ `uart7`。RDK S600 的 10-pin 自锁接口引出的是 `uart6`/`uart7`，对应 `/dev/ttyS6` 与 `/dev/ttyS7`。
具体引脚请参考 [管脚定义与应用](./01_ext_io.md) 章节。
:::

```python
#!/usr/bin/env python3

import sys
import signal
import os
import time

# 导入python串口库
import serial
import serial.tools.list_ports

def signal_handler(signal, frame):
    sys.exit(0)

def serialTest():
    print("List of enabled UART:")
    os.system('ls /dev/tty[a-zA-Z]*')
    uart_dev = input("请输出需要测试的串口设备名(默认 /dev/ttyS0):").strip() or "/dev/ttyS0"
    if not os.path.exists(uart_dev):
        print("UART device not found: %s" % uart_dev)
        return -1

    baudrate = input("请输入波特率(默认115200):").strip() or "115200"
    if not baudrate.isdigit():
        print("Invalid baudrate: %s" % baudrate)
        return -1
    try:
        ser = serial.Serial(uart_dev, int(baudrate), timeout=1) # 1s timeout
    except Exception as e:
        print("open serial failed: %s" % e)
        return -1

    print(ser)

    print("Starting demo now! Press CTRL+C to exit")

    while True:
        test_data = "AA55"
        write_num = ser.write(test_data.encode('UTF-8'))
        print("Send: ", test_data)

        received_data = ser.read(write_num).decode('UTF-8')
        print("Recv: ", received_data)

        time.sleep(1)

    ser.close()
    return 0


if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)
    if serialTest() != 0:
        print("Serial test failed!")
    else:
        print("Serial test success!")

```

## 常见问题

### 提示 `open serial failed`

**原因**：串口设备打开失败，可能被其他进程占用，或设备不存在。

**解决**：确认所选 `/dev/ttySx` 存在且未被占用；系统调试口 `/dev/ttyS0` 不建议测试。

### `Recv:` 后面为空

**原因**：TXD 与 RXD 未短接，或接线错误，读不到回环数据。

**解决**：按 [硬件连接](#硬件连接) 将 TXD 与 RXD 短接后重试。

## 相关文档

- [管脚定义](./01_ext_io.md)
- [UART 驱动调试指南](/Advanced_development/driver_development/driver_uart_dev)
- [C/C++ demo 编程指南](/Demos/demo_support/c_cpp_build)
