---
title: "3.1.5 IMU 应用"
sidebar_position: 5
description: "RDK S100/S600 IMU 传感器数据读取示例（BMI08X/ICM42688）"
---

# 3.1.5 IMU 应用

本示例演示读取 IMU 传感器（加速度计 + 陀螺仪）数据。板端支持两种 IMU 芯片：**BMI08X**（6 轴）和 **ICM42688**（6 轴）。

## 环境准备

- 开发板已烧录 RDK OS 并启动
- IMU 传感器已连接（通过 MCU 接口扩展板或主板 I2C/SPI）

## 代码位置

板端路径：`/app/sample_imu/`

```
sample_imu/
├── Makefile
├── sample_imu.c       # 主程序：初始化 + 循环读取 IMU 数据
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

程序启动后，将持续输出加速度计和陀螺仪的原始数据（加速度 g、角速度 °/s）。按 `Ctrl+C` 退出。

## 代码解读

示例采用分层设计：

1. `imu_interface.h` — 定义 IMU 抽象接口（init/read/close），屏蔽不同芯片差异
2. `bmi08x.c` / `icm42688.c` — 各芯片的具体驱动实现（通过 I2C/SPI 读写寄存器）
3. `imu_manager.c` — 管理层，自动探测并初始化已连接的 IMU 芯片
4. `sample_imu.c` — 主程序，调用 `imu_manager` 接口循环读取数据

## 效果

终端持续输出类似：

```text
accel: x=0.012 g, y=-0.003 g, z=1.001 g
gyro:  x=0.05 °/s, y=0.02 °/s, z=-0.01 °/s
```

静止状态下，加速度 Z 轴约 1g（重力），其余轴接近 0。

## 相关文档

- [3.1.1 扩展引脚应用](/Demos/peripheral/40pin)
- [3.4.2 C/C++ demo 编程指南](../04_demo_support/02_c_cpp_build.md)
