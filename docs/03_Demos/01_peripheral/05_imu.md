---
title: "IMU 应用"
sidebar_position: 5
sidebar_products: RDK S600
description: "RDK S600 IMU 传感器数据读取示例（BMI08X/ICM42688）"
---

# IMU 应用

本示例演示读取 IMU 传感器（加速度计 + 陀螺仪）数据。板端支持两种 IMU 芯片：**BMI08X**（6 轴）和 **ICM42688**（6 轴）。

:::tip
该示例基于 Linux IIO 子系统读取数据，当前随 RDK S600 镜像提供；源码位于 `2-rdk_s600_source_code/source/hobot-io-samples/debian/app/sample_imu/`。
:::

## 环境准备

- 开发板已烧录 RDK OS 并启动
- IMU 传感器已连接（通过 MCU 接口扩展板或主板 I2C/SPI），且对应 IIO 驱动已加载（可在 `/sys/bus/iio/devices/` 下看到 `iio:device*` 节点）

## 代码位置

板端路径：`/app/sample_imu/`

```text
sample_imu/
├── Makefile
├── sample_imu.c       # 主程序：解析参数 + 交互式读取 IMU 数据
├── imu_manager.c/.h    # IMU 管理层：统一接口封装
├── imu_interface.h     # IMU 抽象接口
├── bmi08x.c            # BMI08X 驱动实现
└── icm42688.c          # ICM42688 驱动实现
```

源码路径：`2-rdk_s600_source_code/source/hobot-io-samples/debian/app/sample_imu/`

## 编译与运行

```bash
cd /app/sample_imu
make
./sample_imu
```

程序启动后进入交互式命令行，输入命令读取 IMU 数据（见 [运行效果](#运行效果)）；未通过 `-n` 指定传感器时，默认使用 `bmi08x`。

## 代码解读

示例采用分层设计：

1. `imu_interface.h` — 定义 IMU 抽象接口（init/read/close），屏蔽不同芯片差异
2. `bmi08x.c` / `icm42688.c` — 各芯片的具体驱动实现（通过 IIO sysfs 读取寄存器数据）
3. `imu_manager.c` — 管理层，在 `/sys/bus/iio/devices/` 下探测并初始化已连接的 IMU 芯片
4. `sample_imu.c` — 主程序，解析命令行参数并处理交互式读数命令（`g`/`l`/`q`/`h`）

## 运行效果

运行 `./sample_imu -h` 可查看帮助信息：

```text
root@drobot:/app/sample_imu# ./sample_imu -h
Usage: sample_imu [OPTIONS]
Options:
  -n <imu_name>         Specify IMU name (default: bmi08x)
  -h                    Show this help message
Supported sensors: bmi08x icm42688-gyro icm42688-accel
```

程序启动后显示命令菜单，输入 `g` 读取一帧数据：

```text
***************  Command Lists  ***************
 g    -- Get a single frame of imu data
 l    -- Get multiple frames of imu data
 q    -- Quit the program
 h    -- Print this help message
Enter command: g
Data received (Frame 1):
  Accelerometer: [0.012000, -0.003000, 9.801000] m/s²
  Gyroscope:     [0.050000, 0.020000, -0.010000] rad/s
  Timestamp:     00:00:00.000.000
```

命令说明：

- `g`：获取一帧 IMU 数据
- `l`：获取多帧 IMU 数据，需输入帧数
- `q`：退出程序
- `h`：显示帮助信息

未接入 IMU 传感器时，程序会检测失败并退出：

```text
No IMU specified, using default: bmi08x
Using IMU: bmi08x

=== Detected IIO Devices ===
============================

Error: init IMU 'bmi08x' failed !!! Quit Now
```

> 上述数据帧为输出格式示例（加速度单位 m/s²、角速度单位 rad/s），具体数值随传感器姿态与量程变化。

## 相关文档

- [扩展引脚应用](./01_40pin/02_s600/02_gpio.md)
- [C/C++ demo 编程指南](../04_demo_support/02_c_cpp_build.md)
