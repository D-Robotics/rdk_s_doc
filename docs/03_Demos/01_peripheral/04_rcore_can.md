---
title: "CAN 应用"
sidebar_position: 4
description: "RDK S100/S600 CAN 总线收发示例，无需改系统代码"
---

# CAN 应用

本示例演示在 RDK 开发板上使用 CAN 总线进行数据收发，无需修改系统代码。板端提供基于 HAL 的 CAN 示例和基于 SocketCAN 的示例两种方式。

> CAN 驱动调试见 [CAN 驱动开发](../../07_Advanced_development/11_mcu_development/09_mcu_can.md)。

## 环境准备

- 开发板已烧录 RDK OS 并启动
- CAN 总线已连接（CAN_H/CAN_L + 共地）
- 如使用 CAN 分析仪，已连接并配置好波特率

## 代码位置

板端路径：`/app/Can/`

```text
Can/
├── can_get/         # HAL 方式：接收 CAN 数据
├── can_send/        # HAL 方式：发送 CAN 数据
├── can_multi_ch/    # HAL 方式：多通道收发
└── socketcan/       # SocketCAN 方式：压力测试
```

源码路径：`2-rdk_s600_source_code/source/hobot-io-samples/debian/app/Can/`（S600）或 `1-rdk_s100_source_code/source/hobot-io-samples/debian/app/Can/`（S100）。

> S100 与 S600 的示例目录略有差异：S100 使用 `can_fast_bidir`，S600 使用 `socketcan`，其余 `can_get`/`can_send`/`can_multi_ch` 一致。

## 编译与运行

### HAL 方式

```bash
# 发送（target 为 IPCF 通道名，默认 bypass；canid 为 CAN 通道号）
cd /app/Can/can_send
make
./canhal_send bypass 2

# 接收
cd /app/Can/can_get
make
./canhal_get bypass

# 多通道
cd /app/Can/can_multi_ch
make
./can_multi_ch
```

HAL 方式示例参数说明：

- `canhal_send <target> <canid>`：`target` 为 IPCF 通道名（对应 `config/ipcf_channel.json` 中配置的 `bypass`），`canid` 为 CAN 通道号。
- `canhal_get <target>`：接收端只需指定 `target`。
- `can_multi_ch` 支持 `-t <can_type>`（0 标准帧 / 1 扩展帧 / 2 FD 标准帧 / 3 FD 扩展帧）、`-l <can_length>`（8 / 64）、`-n <帧数>` 等参数，例如 `./can_multi_ch -t 2 -l 64 -n 5`。

### SocketCAN 方式

SocketCAN 使用 Linux 标准 Socket 接口，无需专用 HAL：

```bash
cd /app/Can/socketcan
make
sudo ./can_stress -i can0 -f 1 -l 64 -t 0x100 -r 0x100 -p 1 -w 1000 -L -D 60
```

也可使用 Python 版本（参数语义与 C 版本一致）：

```bash
sudo python3 can_stress.py -i can0 -f 1 -l 64 -t 0x100 -r 0x100 -p 1 -w 1000 -L -D 60 -S 1
```

:::tip SocketCAN

- SocketCAN 方式兼容 Linux 标准 CAN 工具（`cansend`、`candump`），无需额外 API 学习成本。
- 运行前需先加载 CAN 模块并配置 CAN 接口（如 `ip link set can0 ...`），具体步骤与参数见 `socketcan/README.md`。

:::

## 代码解读

### HAL 方式（`can_get`/`can_send`）

- `can_get.c` — 调用 CAN HAL 接口初始化 CAN 通道，循环读取 CAN 帧
- `can_send.c` — 调用 CAN HAL 接口初始化 CAN 通道，发送 CAN 帧
- `can_multi_ch/main.cpp` — 多通道同时收发

### SocketCAN 方式（`socketcan/can_stress.c`）

- 使用标准 Linux Socket API（`socket`/`bind`/`read`/`write`），CAN 控制器映射为 `can0`/`can1` 网络接口

## 运行效果

HAL 发送示例 `./canhal_send bypass 2` 运行输出如下（成功初始化 IPCF 通道；若对端 MCU/接收端未连接，发送会返回错误码）：

```text
root@drobot:/app/Can/can_send# ./canhal_send bypass 2
group name is bypass
[INFO][hb_ipcf_hal.cpp] [channel] bypass [ins] 0 [id] 4 init success.
[INFO][hb_ipcf_hal.cpp] [channel] bypass [ins] 0 [id] 4 config success.
[CANHAL][ERROR] HorizonHal_IPCF_Send of id:0 failed, ret is -14
canSendMsgFrame failed ret: -14
Send end, send package total: 1 frame total: 1
```

- `can_send` 发送 CAN 帧后，`can_get` 端可接收到对应数据
- SocketCAN 方式可用 `candump can0` 验证接收

## 常见问题

### 发送报错 canSendMsgFrame failed ret: -14

**现象**：HAL 发送示例输出 `[CANHAL][ERROR] HorizonHal_IPCF_Send ... failed`、`canSendMsgFrame failed ret: -14`。

**原因**：对端 MCU/接收端未连接。

**解决**：确认 CAN 总线已连接（CAN_H/CAN_L + 共地），且接收端已就绪。

### SocketCAN 方式无法正常收发数据

**现象**：运行 SocketCAN 示例后无法正常收发 CAN 数据。

**原因**：运行前未加载 CAN 模块并配置 CAN 接口。

**解决**：先加载 CAN 模块并配置 CAN 接口（如 `ip link set can0 ...`），具体步骤与参数见 `socketcan/README.md`。

## 相关文档

- [CAN 驱动开发](../../07_Advanced_development/11_mcu_development/09_mcu_can.md)
- [C/C++ demo 编程指南](../04_demo_support/02_c_cpp_build.md)
