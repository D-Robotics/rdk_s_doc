---
sidebar_position: 4
title: "SPI 应用（RDK S600）"
sidebar_products: RDK S600
sidebar_label: "SPI 应用"
description: "RDK S600 14-PIN SPI1 使用与回环测试"
---

# SPI 应用

RDK S600 在 14-PIN 自锁接口上引出了 `SPI1` 总线，支持一个片选，IO 电压 1.8V。

请参阅 `/app/40pin_samples/test_spi.py`了解如何使用 SPI 的详细信息。

:::tip
以下所提及的管脚仅作示例说明，不同平台的端口值存在差异，实际情况应以实际为准。亦可直接使用`/app/40pin_samples/`目录下的代码，该代码已在板子上经过实际验证。
:::

## 代码位置

SPI 回环测试代码位于板端 `/app/40pin_samples/test_spi.py`。

## 回环测试

把 MISO 和 MOSI 在硬件上进行连接，然后运行 SPI 测试程序，进行写和读操作，预期结果是读出的数据要完全等于写入的数据

### 硬件连接

测试之前，需要把 MISO 和 MOSI 短接：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/03_40pin_user_guide/image/40pin_user_guide/image-rdk_s600_spi.png" alt="RDK S600 SPI回环测试硬件连接示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### 测试过程

- 运行 `cd /boot`，在 config.txt 文件（如果不存在，则运行 `sudo nano config.txt` 创建）中写入
    ```text
    dtbo_file_path=/overlays/s600_v0p2_enable_spi1.dtbo
    ```
- 运行 `sudo reboot` 重启系统
- 重启后，运行 `python3 /app/40pin_samples/test_spi.py`
- 从打印的 spi 控制器中选择总线号和片选号作为输入选项，例如选择测试 `spidev1.0`，`bus num` 选择 `1` 和 `cs num` 选择 `0`，按回车键确认：

```text
List of enabled spi controllers:
/dev/spidev0.0  /dev/spidev1.0
Please input SPI bus num (default 0):1
Please input SPI cs num (default 0):0
```

- MISO 与 MOSI 短接后，程序正确运行起来会持续打印 `0x55 0xAA`：

```text
Starting demo now! Press CTRL+C to exit
0x55 0xAA
0x55 0xAA
```

- 若未短接 MISO/MOSI（回环失败），读回的是 MISO 默认电平（本板实测为 `0xFF 0xFF`），与写入值不一致：

```text
Starting demo now! Press CTRL+C to exit
0xFF 0xFF
0xFF 0xFF
```

## 测试代码

```python
#!/usr/bin/env python3

import sys
import signal
import os
import time

# 导入spidev模块
import spidev

def signal_handler(signal, frame):
    sys.exit(0)

def BytesToHex(Bytes):
    return ''.join(["0x%02X " % x for x in Bytes]).strip()

def spidevTest():
    # 设置spi的bus号（0, 1, 2）和片选(0, 1)
    spi_bus = input("Please input SPI bus num (default 0):").strip() or "0"
    spi_device = input("Please input SPI cs num (default 0):").strip() or "0"
    if not spi_bus.isdigit() or not spi_device.isdigit():
        print("Invalid SPI bus/cs: %s/%s" % (spi_bus, spi_device))
        return

    # 创建spidev类的对象以访问基于spidev的Python函数。
    spi = spidev.SpiDev()
    # 打开spi总线句柄
    try:
        spi.open(int(spi_bus), int(spi_device))
    except Exception as e:
        print("open spi failed: %s" % e)
        return

    # 设置 spi 频率为 12MHz
    spi.max_speed_hz = 12000000

    print("Starting demo now! Press CTRL+C to exit")

    # 发送 [0x55, 0xAA], 接收的数据应该也是 [0x55, 0xAA]
    try:
        while True:
            resp = spi.xfer2([0x55, 0xAA])
            print(BytesToHex(resp))
            time.sleep(1)

    except KeyboardInterrupt:
        spi.close()

if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)
    print("List of enabled spi controllers:")
    os.system('ls /dev/spidev*')

    spidevTest()

```

## 常见问题

### 提示 `open spi failed`

**原因**：SPI 控制器未使能，或总线号/片选号输入错误。

**解决**：确认已按上文在 `config.txt` 写入 `s600_v0p2_enable_spi1.dtbo` 并重启；`SPI1` 对应 `bus num = 1`。

### 一直打印 `0xFF 0xFF`

**原因**：MISO 与 MOSI 未短接，MISO 处于默认电平。

**解决**：按 [硬件连接](#硬件连接) 将 MISO 与 MOSI 短接后重试，成功时应打印 `0x55 0xAA`。

## 相关文档

- [管脚定义](./01_ext_io.md)
- [SPI 调试指南](/Advanced_development/driver_development/driver_spi_dev)
- [C/C++ demo 编程指南](/Demos/demo_support/c_cpp_build)
