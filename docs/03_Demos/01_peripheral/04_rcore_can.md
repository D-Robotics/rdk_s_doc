---
title: "CAN 应用"
sidebar_position: 4
description: "RDK S100/S600 CAN 总线收发示例，无需改系统代码"
---

# CAN 应用

本示例演示在 RDK 开发板上使用 CAN 总线进行数据收发，无需修改系统代码。板端提供基于 HAL 的 CAN 示例和基于 SocketCAN 的示例两种方式。

> CAN 驱动调试见 [驱动开发](/Advanced_development/driver_development)。

## 环境准备

- 开发板已烧录 RDK OS 并启动
- CAN 总线已连接（CAN_H/CAN_L + 共地）
- 如使用 CAN 分析仪，已连接并配置好波特率

## 代码位置

板端路径：`/app/Can/`

```
Can/
├── can_get/         # HAL 方式：接收 CAN 数据
├── can_send/        # HAL 方式：发送 CAN 数据
├── can_multi_ch/    # HAL 方式：多通道收发
└── socketcan/       # SocketCAN 方式：压力测试
```

源码路径：`2-rdk_s600_source_code/source/hobot-io-samples/debian/app/Can/`

## 编译与运行

### HAL 方式

```bash
# 发送
cd /app/Can/can_send
make
./canhal_send

# 接收
cd /app/Can/can_get
make
./canhal_get

# 多通道
cd /app/Can/can_multi_ch
make
./can_multi_ch
```

### SocketCAN 方式

SocketCAN 使用 Linux 标准 Socket 接口，无需专用 HAL：

```bash
cd /app/Can/socketcan
make
./can_stress
```

:::tip SocketCAN
SocketCAN 方式兼容 Linux 标准 CAN 工具（`cansend`、`candump`），无需额外 API 学习成本。
:::

## 代码解读

### HAL 方式（`can_get`/`can_send`）

- `can_get.c` — 调用 CAN HAL 接口初始化 CAN 通道，循环读取 CAN 帧
- `can_send.c` — 调用 CAN HAL 接口初始化 CAN 通道，发送 CAN 帧
- `can_multi_ch/main.cpp` — 多通道同时收发

### SocketCAN 方式（`socketcan/can_stress.c`）

- 使用标准 Linux Socket API（`socket`/`bind`/`read`/`write`），CAN 控制器映射为 `can0`/`can1` 网络接口

## 效果

- `can_send` 发送 CAN 帧后，`can_get` 端可接收到对应数据
- SocketCAN 方式可用 `candump can0` 验证接收

## 相关文档

- [驱动开发指南](/Advanced_development/driver_development)
- [C/C++ demo 编程指南](../04_demo_support/02_c_cpp_build.md)
