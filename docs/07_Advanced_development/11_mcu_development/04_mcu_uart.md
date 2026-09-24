---
sidebar_position: 4
title: "UART 使用指南"
description: "UART 使用指南"
---

# UART 使用指南

## 概述

本文介绍 MCU 侧 UART 驱动的使用，包括硬件能力、软件架构、代码路径、使用示例与应用程序接口。

- **定位**：帮助用户在 MCU 上进行 UART 收发开发。
- **适用读者**：需要开发 UART 通信功能的深度定制开发者。
- **前置条件**：了解 MCU 基本框架，参见 [MCU 快速入门指南](01_basic_information.md)。
- **与其他模块关系**：UART 通道可能被 IPC 透传占用，参见 [常见问题](#常见问题)；Acore 侧 UART 驱动参见 [UART 驱动调试指南](../04_driver_development/02_driver_uart_dev.md)。

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 硬件支持

本文所述 UART 数量为 MCU 域 UART，与 datasheet 概览中 "MCU domain" 一行对应（S100 为 3x UART，S600 为 4x UART）。Acore/Linux 侧可用的 Main 域 UART（S100 4 路、S600 8 路）不在本指南范围内，参见 [UART 驱动调试指南](../04_driver_development/02_driver_uart_dev.md)。

:::info 说明
通道数量为 SoC MCU 域 UART 总数，板上实际可用性以原理图为准。

<DocScope products="RDK S100">
S100：UART4 固定为调试控制台，不可复用；UART5 为引出供用户使用的通道（J22）；UART6 复用在 LIN2 引脚，当前硬件版本未在开发板上引出，仅供移植到自研硬件时参考。
</DocScope>
<DocScope products="RDK S600">
S600：UART8 固定为调试控制台，不可复用；UART10 和 UART11 为引出供用户使用的通道（J18）；UART9 当前硬件版本未在开发板上引出，仅供移植到自研硬件时参考。
</DocScope>
:::

### 资源与默认配置

<DocScope products="RDK S100">

MCU 域共有 3 路 UART，即 UART4~UART6。其中 UART4 作为调试控制台使用（MCU0、MCU1 共用调试串口）。默认配置如下：

| **配置项**         | **uart4** | **uart5** | **uart6** |
|--------------------|-----------|-----------|-----------|
| 通道标识符         | Uart_Channel0 | Uart_Channel1 | Uart_Channel2 |
| 波特率             | 921600    | 921600    | 921600    |
| 校验位             | 无        | 无        | 无        |
| 停止位             | 1 位      | 1 位       | 1 位      |
| 数据位             | 8 位      | 8 位       | 8 位      |
| 异步接口收发方式   | 中断      | 中断       | 中断      |

</DocScope>
<DocScope products="RDK S600">

MCU 域共有 4 路 UART，即 UART8~UART11。其中 UART8 作为调试控制台使用（MCU0、MCU1 共用调试串口）。默认配置如下：

| **配置项**     | **uart8**     | **uart9**     | **uart10**    | **uart11**    |
|----------------|---------------|---------------|---------------|---------------|
| 通道标识符     | Uart_Channel0 | Uart_Channel1 | Uart_Channel2 | Uart_Channel3 |
| 波特率         | 921600        | 921600        | 921600        | 921600        |
| 校验位         | 无            | 无            | 无            | 无            |
| 停止位         | 1 位          | 1 位           | 1 位          | 1 位           |
| 数据位         | 8 位          | 8 位           | 8 位          | 8 位           |
| 异步接口收发方式 | 中断          | 中断           | **DMA**       | **DMA**       |

:::note 注意
UART10、UART11 的异步接口默认走 DMA 收发。使用 DMA 时，应用层提供的发送和接收 buffer 起始地址必须是 64 字节对齐的；地址未对齐时 DMA 配置会失败，但接口仍返回 `E_OK`，表现为数据未发出，排查时请优先检查 buffer 对齐。

同步接口始终为轮询收发，不受该配置影响。
:::

</DocScope>

### 硬件能力

- 支持 4800、9600、38400、115200、921600 等常用波特率
- 支持 5~8 位数据位配置
- 支持奇偶校验配置
- 支持 1、1.5、2 位停止位配置
- 支持 DMA 模式


## 软件架构

- UART APP：UART 的应用层代码。
- UART Interface：UART 的接口层代码，提供标准化的 UART 操作接口。
- UART LLD：UART 的底层驱动代码，直接操作硬件寄存器，实现异步/同步传输、中断处理、FIFO 管理等核心功能。
- UART PBcfg：UART 的 PB 配置文件，用于外设的配置参数。
- Hardware：UART 硬件。


<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/mcu_uart.png" alt="MCU 软件架构图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />



## 代码路径

```bash
# Driver source code:
McalCdd/Uart/inc/Uart.h                    # 公共 API 接口
McalCdd/Uart/inc/Uart_Lld.h                # 底层硬件操作函数声明
McalCdd/Uart/inc/Uart_Private.h            # 私有接口（Uart_Putc、Uart_Getc 等）
McalCdd/Uart/src/Uart.c                    # 公共 API 实现
McalCdd/Uart/src/Uart_Lld.c                # 底层硬件操作实现，直接配置寄存器
Platform/Schm/SchM_Uart.h                  # 访问权限与资源保护
McalCdd/Common/Register/inc/Uart_Register.h # 寄存器地址与位域定义

# Board configuration source code (gen_xxxx 见下方说明):
Config/McalCdd/gen_xxxx/Uart/inc/Uart_Cfg.h
Config/McalCdd/gen_xxxx/Uart/inc/Uart_PBcfg.h
Config/McalCdd/gen_xxxx/Uart/inc/Uart_Board.h
Config/McalCdd/gen_xxxx/Uart/src/Uart_PBcfg.c

# Sample source code:
samples/Uart/src/Uart_Test.c
```

<DocScope products="RDK S100">
上述 `gen_xxxx` 为 `gen_s100_sip_B_mcu1`（MCU1 侧）或 `gen_s100_sip_B`（MCU0 侧）。
</DocScope>
<DocScope products="RDK S600">
上述 `gen_xxxx` 为 `gen_s600_md_mcu1`（MCU1 侧）或 `gen_s600_md`（MCU0 侧）。
</DocScope>

## 应用 sample

<DocScope products="RDK S100">

S100 开发板将 UART5 引出供用户开发学习使用，PIN 脚位于 `Main Board` 板上的 `MCU Expansion Header (J22)`。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mainboard_interface.png" alt="使用示例实物图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::tip
UART5 与 IPC 透传共用同一通道，两者不能同时启用。该通道出厂默认未占用，可直接测试；若此前已启用 IPC 透传，需先释放再测试。

用 `ipcbox_set_mode debug` 确认占用状态，`uart` 所在行显示 `Enable` 表示已占用：

```bash
D-Robotics:/$ ipcbox_set_mode debug
[012813.038216 0]IpcBox_set_mode:217 Module: runcmd, Enable
[012813.038708 0]IpcBox_set_mode:217 Module: uart, Disable
[012813.039359 0]IpcBox_set_mode:217 Module: spi, Disable
[012813.039999 0]IpcBox_set_mode:217 Module: i2c, Disable
```

在 MCU 的控制终端执行以下命令释放；若本就未占用，命令执行后提示已处于释放状态：

```bash
D-Robotics:/$ ipcbox_set_mode uart 0
[012865.816457 0]IpcBox_set_mode:249 uart processing disabled
[012865.816972 0]IpcBox_UartDeinit:247 uart is already deinitialized
```
:::


- 语法格式
    - `test_id`: 测试用例 ID（必需）
    - `bus`: UART 总线编号（可选，部分测试用例使用）
    - `baudrate`: 波特率设置（可选，部分测试用例使用）
    - `parity`: 校验位设置（可选，部分测试用例使用）
    - `stopbit`: 停止位设置（可选，部分测试用例使用）
    - `databits`: 数据位设置（可选，部分测试用例使用）
```text
uarttest <test_id> [bus] [baudrate] [parity] [stopbit] [databits]
```

- `uarttest 0 5 921600 0 1 8` 配置并初始化指定 UART 通道

```bash
D-Robotics:/$ uarttest 0 5 921600 0 1 8
[057.876445 0]g_UartTest updated:
[057.876655 0]  HwChannel: 1
[057.876980 0]  BaudRate: 921600
[057.877349 0]  Parity: 0
[057.877642 0]  StopBit: 1
[057.877946 0]  DataBits: 8
[057.878267 0]Init Uart 1
[057.878557 0]set data bit success!
[057.878969 0]set stop bit success!
[057.879379 0]UART configuration test passed!
```

- `uarttest 1` 初始化默认 UART 配置（默认通道为 UART5）

- `uarttest 2` 接收数据，测试 UART 接收功能
此处使用串口助手（配置：921600 波特率 8-N-1）向 MCU 发送数据
```bash
D-Robotics:/$ uarttest 2
Rx: 0 1 2 3 4 5 6 7 8 9 a b c d e f 10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f 20 21 22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f 30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f 41 42 43 44 45
[0359.598869 0]AsyncSend & ASyncReceive test pass!
```

- `uarttest 3` 发送数据，测试 UART 发送功能
```bash

D-Robotics:/$ uarttest 3
Tx: 0 1 2 3 4 5 6 7 8 9 a b c d e f 10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f 20 21 22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f 30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f 41 42 43 44 45
```

- `uarttest 4` 回环测试，同时测试发送和接收功能，注意将 RX 引脚接 TX 引脚

```bash
D-Robotics:/$ uarttest 4
Tx: 0 1 2 3 4 5 6 7 8 9 a b c d e f 10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f 20 21 22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f 30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f 41 42 43 44 45
Rx: 0 1 2 3 4 5 6 7 8 9 a b c d e f 10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f 20 21 22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f 30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f 41 42 43 44 45
[012993.519564 0]SyncSend & AsyncReceive test pass!
```

未短接 RX 与 TX 引脚时，回环测试失败：

```bash
D-Robotics:/$ uarttest 4
Tx: 0 1 2 3 4 5 6 7 8 9 a b c d e f 10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f 20 21 22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f 30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f 41 42 43 44 45
[094.534092 0]SyncSend & AsyncReceive test fail!
```
</DocScope>
<DocScope products="RDK S600">

S600 开发板将 UART10 和 UART11 引出供用户开发学习使用，PIN 脚位于 `Main Board` 板上的 `UART 接口（MAIN&MCU）(J18)`，该连接器同时引出 2 路 Main 域 UART。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_v0p1_mainboard_interface.png" alt="RDK S600 主板接口图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::tip
UART11 与 IPC 透传共用同一通道，两者不能同时启用。该通道出厂默认未占用，可直接测试；若此前已启用 IPC 透传，需先释放再测试。UART10 无此限制。

用 `ipcbox_set_mode debug` 确认占用状态，`uart` 所在行显示 `Enable` 表示已占用；确认被占用后在 MCU 的控制终端执行 `ipcbox_set_mode uart 0` 释放后重试。命令输出格式与 S100 一致，参见上文 S100 章节示例。
:::


- 语法格式
    - `test_id`: 测试用例 ID（必需）
    - `bus`: UART 总线编号（可选，部分测试用例使用）
    - `baudrate`: 波特率设置（可选，部分测试用例使用）
    - `parity`: 校验位设置（可选，部分测试用例使用）
    - `stopbit`: 停止位设置（可选，部分测试用例使用）
    - `databits`: 数据位设置（可选，部分测试用例使用）
```text
uarttest <test_id> [bus] [baudrate] [parity] [stopbit] [databits]
```



- `uarttest 0 11 921600 0 1 8` 配置并初始化指定 UART 通道

```bash
D-Robotics:/$ uarttest 0 11 921600 0 1 8
[016552.712366 0]g_UartTest updated:
[016552.712385 0]  HwChannel: 3
[016552.712443 0]  BaudRate: 921600
[016552.712845 0]  Parity: 0
[016552.713170 0]  StopBit: 1
[016552.713506 0]  DataBits: 8
[016552.713859 0]Init Uart 3
[016552.714181 0]set data bit success!
[016552.714625 0]set stop bit success!
[016552.715069 0]UART configuration test passed!
```

- `uarttest 1` 初始化默认 UART 配置

```bash
D-Robotics:/$ uarttest 1
[016634.087968 0]Init Uart 3
[016634.087987 0]set data bit success!
[016634.088047 0]set stop bit success!
[016634.088491 0]UART configuration test passed!

```


- `uarttest 2` 接收数据，测试 UART 接收功能
此处使用串口助手（配置：921600 波特率 8-N-1）向 MCU 发送数据
```bash
D-Robotics:/$ uarttest 2
Rx: 12 32 34 53 46 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
[0268.494060 0]AsyncSend & ASyncReceive test pass!

```

- `uarttest 3` 发送数据，测试 UART 发送功能
```bash

D-Robotics:/$ uarttest 3
Tx: 0 1 2 3 4 5 6 7 8 9 a b c d e f 10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f 20 21 22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f 30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f 41 42 43 44 45
```

- `uarttest 4` 回环测试，同时测试发送和接收功能，注意将 RX 引脚接 TX 引脚


```bash
D-Robotics:/$ uarttest 4
Tx: 0 1 2 3 4 5 6 7 8 9 a b c d e f 10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f 20 21 22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f 30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f 41 42 43 44 45
Rx: 0 1 2 3 4 5 6 7 8 9 a b c d e f 10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f 20 21 22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f 30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f 41 42 43 44 45
[016668.173248 0]SyncSend & AsyncReceive test pass!
```
</DocScope>


## 应用程序接口

### Uart_Init

**【函数原型】**

`void Uart_Init(void)`

**【功能描述】**

初始化 UART 子系统驱动，配置所有已配置的 UART 通道。在其他接口调用前必须执行。

**【参数】**

无

**【返回值】**

无

---

### Uart_Deinit

**【函数原型】**

`void Uart_Deinit(void)`

**【功能描述】**

反初始化 UART 子系统驱动，释放已占用的通道资源。

**【参数】**

无

**【返回值】**

无

---

### Uart_BaudSet

**【函数原型】**

`Std_ReturnType Uart_BaudSet(uint8 Channel, Uart_BaudrateType Baudrate)`

**【功能描述】**

配置指定 UART 通道的波特率。

**【参数】**

| 参数 | 类型 | 必选 | 说明 |
|---|---|---|---|
| `Channel` | `uint8` | 是 | UART 通道标识符，取值见 [通道标识符](#通道标识符) |
| `Baudrate` | `Uart_BaudrateType` | 是 | 目标波特率，支持 4800、9600、19200、38400、57600、115200、230400、460800、921600、4000000 |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 设置成功 |
| `E_NOT_OK` | 设置失败：模块未初始化、通道号越界或通道未配置 |

---

### Uart_BaudGet

**【函数原型】**

`Std_ReturnType Uart_BaudGet(uint8 Channel, uint32 *Baudrate)`

**【功能描述】**

获取指定 UART 通道当前的波特率。

**【参数】**

| 参数 | 类型 | 必选 | 说明 |
|---|---|---|---|
| `Channel` | `uint8` | 是 | UART 通道标识符，取值见 [通道标识符](#通道标识符) |
| `Baudrate` | `uint32 *` | 是 | 输出参数，用于返回当前波特率 |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 获取成功 |
| `E_NOT_OK` | 获取失败：模块未初始化、通道号越界或通道未配置 |

---

### Uart_SetDatabits

**【函数原型】**

`Std_ReturnType Uart_SetDatabits(uint8 Channel, uint8 Databits)`

**【功能描述】**

配置指定 UART 通道的数据位。

**【参数】**

| 参数 | 类型 | 必选 | 说明 |
|---|---|---|---|
| `Channel` | `uint8` | 是 | UART 通道标识符，取值见 [通道标识符](#通道标识符) |
| `Databits` | `uint8` | 是 | 数据位，支持 5、6、7、8 |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 设置成功 |
| `E_NOT_OK` | 设置失败：模块未初始化、通道号越界或通道未配置 |

---

### Uart_SetStopbit

**【函数原型】**

`Std_ReturnType Uart_SetStopbit(uint8 Channel, uint8 Stopbit)`

**【功能描述】**

配置指定 UART 通道的停止位。

**【参数】**

| 参数 | 类型 | 必选 | 说明 |
|---|---|---|---|
| `Channel` | `uint8` | 是 | UART 通道标识符，取值见 [通道标识符](#通道标识符) |
| `Stopbit` | `uint8` | 是 | 停止位，1 表示 1 位；2 表示 2 位。数据位为 5 时，填 2 表示 1.5 位 |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 设置成功 |
| `E_NOT_OK` | 设置失败：模块未初始化、通道号越界或通道未配置 |

---

### Uart_SetParity

**【函数原型】**

`Std_ReturnType Uart_SetParity(uint8 Channel, Uart_ParityType CurParity)`

**【功能描述】**

配置指定 UART 通道的校验方式。

**【参数】**

| 参数 | 类型 | 必选 | 说明 |
|---|---|---|---|
| `Channel` | `uint8` | 是 | UART 通道标识符，取值见 [通道标识符](#通道标识符) |
| `CurParity` | `Uart_ParityType` | 是 | 校验方式：`UART_PARITY_NONE`（无校验）、`UART_PARITY_ODD`（奇校验）、`UART_PARITY_EVEN`（偶校验） |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 设置成功 |
| `E_NOT_OK` | 设置失败：模块未初始化、通道号越界或通道未配置 |

---

### Uart_StatusGet

**【函数原型】**

`Uart_StatusType Uart_StatusGet(uint8 Channel, uint32 *BytesTransfered, Uart_DataDirectionType TransferType)`

**【功能描述】**

获取指定 UART 通道的收发状态与已传输字节数，用于异步传输的状态查询。

**【参数】**

| 参数 | 类型 | 必选 | 说明 |
|---|---|---|---|
| `Channel` | `uint8` | 是 | UART 通道标识符，取值见 [通道标识符](#通道标识符) |
| `BytesTransfered` | `uint32 *` | 是 | 输出参数，用于返回已传输的字节数 |
| `TransferType` | `Uart_DataDirectionType` | 是 | 查询方向：`UART_SEND`（发送）、`UART_RECEIVE`（接收） |

**【返回值】**

返回通道状态 `Uart_StatusType`，取值如下：

| 返回值 | 说明 |
|---|---|
| `UART_SEND_COMPLETE` | 发送完成 |
| `UART_RECEIVE_COMPLETE` | 接收完成 |
| `UART_SENDING` | 发送中 |
| `UART_RECEIVING` | 接收中 |
| `UART_SEND_TIMEOUT` | 发送超时 |
| `UART_RX_TIMEOUT` | 接收超时 |
| `UART_SEND_ABORT` | 发送中止 |
| `UART_RECEIVE_ABORT` | 接收中止 |
| `UART_IDLE` | 空闲 |
| `UART_CHANNEL_ERR` | 通道错误 |

---

### Uart_SyncDataTrans

**【函数原型】**

`Std_ReturnType Uart_SyncDataTrans(uint8 Channel, const uint8 *Buffer, uint32 BufferSize, uint32 Timeout)`

**【功能描述】**

以同步（阻塞）方式发送指定长度的数据，函数返回时传输已完成或已超时。

**【参数】**

| 参数 | 类型 | 必选 | 说明 |
|---|---|---|---|
| `Channel` | `uint8` | 是 | UART 通道标识符，取值见 [通道标识符](#通道标识符) |
| `Buffer` | `const uint8 *` | 是 | 待发送数据缓冲区 |
| `BufferSize` | `uint32` | 是 | 待发送数据长度，单位字节 |
| `Timeout` | `uint32` | 是 | 超时时间，单位微秒 |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 发送成功 |
| `E_NOT_OK` | 发送失败或超时 |

---

### Uart_SyncDataReceive

**【函数原型】**

`Std_ReturnType Uart_SyncDataReceive(uint8 Channel, uint8 *Buffer, uint32 BufferSize, uint32 Timeout)`

**【功能描述】**

以同步（阻塞）方式接收指定长度的数据，函数返回时接收已完成或已超时。

**【参数】**

| 参数 | 类型 | 必选 | 说明 |
|---|---|---|---|
| `Channel` | `uint8` | 是 | UART 通道标识符，取值见 [通道标识符](#通道标识符) |
| `Buffer` | `uint8 *` | 是 | 接收数据缓冲区地址 |
| `BufferSize` | `uint32` | 是 | 待接收数据长度，单位字节 |
| `Timeout` | `uint32` | 是 | 超时时间，单位微秒 |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 接收成功 |
| `E_NOT_OK` | 接收失败或超时 |

---

### Uart_AsyncDataTrans

**【函数原型】**

`Std_ReturnType Uart_AsyncDataTrans(uint8 Channel, const uint8 *Buffer, uint32 BufferSize)`

**【功能描述】**

以异步（非阻塞）方式启动数据发送，函数立即返回，传输状态需通过 [Uart_StatusGet](#uart_statusget) 查询。

**【参数】**

| 参数 | 类型 | 必选 | 说明 |
|---|---|---|---|
| `Channel` | `uint8` | 是 | UART 通道标识符，取值见 [通道标识符](#通道标识符) |
| `Buffer` | `const uint8 *` | 是 | 待发送数据缓冲区 |
| `BufferSize` | `uint32` | 是 | 待发送数据长度，单位字节 |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 请求已接受 |
| `E_NOT_OK` | 请求未被接受 |

---

### Uart_AsyncDataReceive

**【函数原型】**

`Std_ReturnType Uart_AsyncDataReceive(uint8 Channel, uint8 *Buffer, uint32 BufferSize)`

**【功能描述】**

以异步（非阻塞）方式启动数据接收，函数立即返回，传输状态需通过 [Uart_StatusGet](#uart_statusget) 查询。

**【参数】**

| 参数 | 类型 | 必选 | 说明 |
|---|---|---|---|
| `Channel` | `uint8` | 是 | UART 通道标识符，取值见 [通道标识符](#通道标识符) |
| `Buffer` | `uint8 *` | 是 | 接收数据缓冲区地址 |
| `BufferSize` | `uint32` | 是 | 待接收数据长度，单位字节 |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 请求已接受 |
| `E_NOT_OK` | 请求未被接受 |

---

### Uart_GetVersionInfo

**【函数原型】**

`void Uart_GetVersionInfo(Std_VersionInfoType *versioninfo)`

**【功能描述】**

获取 UART 模块的版本信息。

**【参数】**

| 参数 | 类型 | 必选 | 说明 |
|---|---|---|---|
| `versioninfo` | `Std_VersionInfoType *` | 是 | 输出参数，用于返回模块版本信息 |

**【返回值】**

无

---

### 通道标识符

<DocScope products="RDK S100">
| 通道标识符 | 对应 UART |
|---|---|
| `Uart_Channel0` | UART4 |
| `Uart_Channel1` | UART5 |
| `Uart_Channel2` | UART6 |
</DocScope>
<DocScope products="RDK S600">
| 通道标识符 | 对应 UART |
|---|---|
| `Uart_Channel0` | UART8 |
| `Uart_Channel1` | UART9 |
| `Uart_Channel2` | UART10 |
| `Uart_Channel3` | UART11 |
</DocScope>


## 调试

1. **确认串口参数**：与对端核对波特率、数据位、停止位、校验位一致（默认 921600、8-N-1）。
2. **确认通道未被 IPC 透传占用**：该通道出厂默认未占用；若此前启用过 IPC 透传，通过 `ipcbox_set_mode debug` 查看占用状态，`uart` 所在行显示 `Enable` 时执行 `ipcbox_set_mode uart 0` 释放后重试。
3. **收发自测**：运行 [应用 sample](#应用-sample) 的收发示例，比对发送与接收数据是否一致。
4. **自环测试**：将测试通道的 RX 引脚与 TX 引脚短接后执行自环测试，验证控制器与引脚连通性。
5. **配置核对**：检查 `Uart_PBcfg.c` 与 `Uart_Board.h` 中通道配置是否与目标一致。
6. **波形验证**：使用示波器或逻辑分析仪测 TX 引脚波形，核对实测波特率与配置一致。

<DocScope products="RDK S100">

S100 调试要点：

- 调试串口为 UART4（网络 DBG_MCU_UART，连接板边调试座）。
- 用户可用通道为 UART5（J22 引出）。
- 与 IPC 透传共用的通道为 UART5，若已启用 IPC 透传需先按步骤 2 释放。
- UART6 引脚未引出，`uarttest 4` 回环测试会因无法短接而失败，属预期现象。

</DocScope>
<DocScope products="RDK S600">

S600 调试要点：

- 调试串口为 UART8（连接板边调试座）。
- 用户可用通道为 UART10 和 UART11（J18 引出）。
- 与 IPC 透传共用的通道为 UART11，若已启用 IPC 透传需先按步骤 2 释放；UART10 无此限制。

</DocScope>

## 常见问题

### UART 测试失败，提示通道被占用

**原因**：IPC 透传占用了 UART 通道，与测试用例产生冲突。

<DocScope products="RDK S100">
S100 上被占用的是 UART5。
</DocScope>
<DocScope products="RDK S600">
S600 上被占用的是 UART11。
</DocScope>

**解决**：通过 `ipcbox_set_mode debug` 确认占用状态，若 `uart` 所在行显示 `Enable`，则在 MCU 控制终端执行 `ipcbox_set_mode uart 0` 释放通道后重试。

```bash
D-Robotics:/$ ipcbox_set_mode debug
[0427.611637 0]Module: uart, Enable

D-Robotics:/$ ipcbox_set_mode uart 0
[0774.571200 0]uart processing disabled
```

### 回环测试失败

**原因**：回环测试需要外部将 UART 通道的 RX 引脚与 TX 引脚短接，未短接时发送的数据无法回环接收。

<DocScope products="RDK S100">
S100 上 UART6 引脚未引出，无法短接，回环测试必然失败，属预期现象。
</DocScope>

**解决**：将测试通道的 RX 引脚接 TX 引脚后，重新执行 `uarttest 4`。

## 相关文档

- [MCU 快速入门指南](01_basic_information.md)
- [UART 驱动调试指南](../04_driver_development/02_driver_uart_dev.md)

<DocScope products="RDK S100">
- 扩展引脚应用：[S100 40PIN 管脚定义](../../03_Demos/01_peripheral/01_40pin/01_s100/01_40pin_define.md)
</DocScope>
<DocScope products="RDK S600">
- 扩展引脚应用：[S600 40PIN 管脚定义](../../03_Demos/01_peripheral/01_40pin/02_s600/01_ext_io.md)
</DocScope>