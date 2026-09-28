---
sidebar_position: 8
title: "IPC 使用指南"
description: "MCU 侧 IPC 的实例与中断分配、IPC 实例配置、IpcBox 外设透传使用与应用程序接口说明"
---

# IPC 使用指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

MCU 侧的 IPC 由 MCAL 的 `Ipc` 模块实现，基于共享内存与邮箱中断在对端之间传递数据。一个 IPC 实例（Instance）包含一个或多个 Channel，同一实例的所有 Channel 共享一个中断，因此一个实例只能在其中一颗 MCU（MCU0 或 MCU1）上使能。IPC 的通信原理与 Acore 侧用法见 [IPC 模块介绍](../03_system_software/12_driver_ipc.md)。

**适用读者：** 需要在 MCU 侧对接或新增 IPC 实例，以及调试 MCU 与 Acore 之间通信的驱动、应用开发人员。

**前置条件：**

- MCU 侧 IPC 依赖 DMA，需要在 DMA 模块初始化之后再调用 IPC 初始化接口。
- 本章节的应用 sample 均运行在 Acore 侧并与 MCU1 通信，运行前需要先启动 MCU1 系统，见 [MCU1 启动步骤](./01_basic_information.md#start_mcu1)。

**与其他模块的关系：** IpcBox 基于 IPC 框架实现外设透传，见 [IpcBox 功能介绍](#IPCBOX)；CANHAL、时间同步、OTA、QGA、Diag 等模块也各自占用固定的 IPC 实例，完整占用情况见 [IPC 使用情况](#ipc-使用情况)。

各平台的默认分配如下，完整的实例、通道与中断分配见 [IPC 使用情况](#ipc-使用情况)。

<DocScope products="RDK S100">

| 配置项 | 默认值 | 说明 |
|---|---|---|
| User 可用 Instance | `Ipc_ShmCfgInstances0~8` | 供用户自定义使用的公共实例，需与 Acore 侧实例一一对应 |
| IPC 发送通道 | 2 个 | MDMA 发送通道数，见 [使用限制说明](#使用限制说明) |

</DocScope>
<DocScope products="RDK S600">

| 配置项 | 默认值 | 说明 |
|---|---|---|
| User 可用 Instance | `Ipc_ShmCfgInstances0~10`、`Ipc_ShmCfgInstances15` | 供用户自定义使用的公共实例；S600 没有实例 11~14 |
| IPC 发送通道 | 2 个 | MDMA 发送通道数，见 [使用限制说明](#使用限制说明) |

</DocScope>

## 使用限制说明

1. 在使用 Ipc_MDMA_SendMsg 接口发送数据时, 需要保证数据 buffer 地址16字节对齐。
2. 发送功能通过轮询方式查看 dma 状态，因此使用发送功能前必须关闭 DMA 中断(释放的代码默认已关闭)；使用接收功能时，DMA 中断和 IPC 中断配置成相同的优先级，避免相互打断。
3. Ipc Mdma 发送通道只有两个，单核或多核多任务发送时，建议使用自旋锁或者关中断方式控制 DMA 资源抢占。
4. IPC 多核发送或接收基于 Instance 分配，不支持基于 Channel 分配。
5. IPC 初始化需要在 DMA 模块初始化后再调用。
6. MCU IPC 配置需要核对端 IPC 配置保持一致。包括 Instance 控制段与 data 段地址，Channel 的数量与 ID，Buffer 数据，Buffer 大小，两端配置不一致会导致 IPC 通信失败。
7. Instance cfg 中的 receive_coreid 配置，需要明确该 Instance 是工作在 MCU0还是 MCU1，工作在 MCU1即配置为 Ipc_Receive_Core1，该项配置错误会导致 IPC 通信失败。
8. Instance 工作在哪个 MCU 上，IPC 中断即在哪个 MCU 上进行使能。如果在多核上都使能，可能出现中断被其他核抢占导致 IPC 通信失败。

## IPC 配置相关

当 MCU1 使用 IPC 时，需要配置两部分内容。

**步骤一：配置回调函数**

回调函数的作用是 IPC 接收到 notify 信号时触发中断进入回调函数进行处理。客户可自行定制当传输数据错误时的回调函数。下文以 Instance0 为例介绍。

```c
static Ipc_ChannelConfigType Ipc_ShmInstance0CfgChannel[8] = {
{
    .ChannelId = 0,
    .ChannelData   = {
        .NumPools = 1,
        .PoolCfg        = Ipc_ShmIpcInstance_0CfgIpcChannel_0BufPool,
        .RxCallback     = IpcTp_InsCan_RxCallback,
        .RxCallbackArg  = (NULL_PTR),
        .TxErrCallback    = DefaultTxErrCallback,
        .TxErrCallbackArg = (NULL_PTR),
    },
},
/* 其余 Channel（ChannelId 1~7）的配置省略 */
};
```

**步骤二：设置 `receive_coreid`**

如果实例工作在 MCU1 上，则需要配置 `receive_coreid = Ipc_Receive_Core1`，同时需要保障 MCU0 关于该 IPC 的设置相同。实例配置数组定义在 `Ipc_Cfg.c` 中，文件路径见 [代码路径](#代码路径)。

<DocScope products="RDK S100">

S100 MCU1 侧的 Instance0 配置如下，示例中的地址为直接填写的物理地址值：

```c
Ipc_InstanceConfigType Ipc_ShmCfgInstances0 = {
    .Ipc_InstanceId       = 0U,
    .Ipc_ChannelNum       = 8U,
    .LocalCtlAddr         = 0xcdd9e00,
    .RemoteCtlAddr        = 0xcdd9400,
    .CtlShmSize           = 0xa00,
    .LocalDataAddr        = 0xb4080000,
    .RemoteDataAddr       = 0xb4000000,
    .DataShmSize          = 0x80000,
    .SendDmaChanIdx       = 0xffU,
    .Async                = (TRUE),
    .HwInfo               = {
        .Ipc_HwId         = CPU_IPC0,/**< the id of the Hardware */
        .RecvIrqUsed      = (TRUE),/**< Whether to use Recv interrupt */
        .SendMboxId       = 0,/**< the mailbox id */
        .RecvMboxId       = 16,/**< the mailbox id */
        .RemoteIrq        = 16,
        .LocalIrq         = 0,
        .UseMDMA          = (TRUE),
    },
    .Ipc_ChannelConfigPtr = Ipc_ShmInstance0CfgChannel,
    .receive_coreid = Ipc_Receive_Core1,
};
```

</DocScope>
<DocScope products="RDK S600">

S600 MCU1 侧的 Instance0 配置如下，示例中的地址由 `IPC_CTRL_SRAM_BASE`、`IPC_DATA_SRAM_BASE` 等宏计算得到，S600 的 IPC 硬件枚举是 `MCU_IPC0/1/2`、`HSM_IPC3`、`CPU_IPC0..8`：

```c
Ipc_InstanceConfigType Ipc_ShmCfgInstances0 = {
    .Ipc_InstanceId       = 0U,
    .Ipc_ChannelNum       = 8U,
    .LocalCtlAddr         = IPC_CTRL_SRAM_BASE + 0 * IPC_CTRL_SIZE * 2 + IPC_CTRL_SIZE,
    .RemoteCtlAddr        = IPC_CTRL_SRAM_BASE + 0 * IPC_CTRL_SIZE * 2,
    .CtlShmSize           = IPC_CTRL_SIZE,
    .LocalDataAddr        = IPC_DATA_SRAM_BASE + 0 * IPC_DATA_SIZE * 2 + IPC_DATA_SIZE,
    .RemoteDataAddr       = IPC_DATA_SRAM_BASE + 0 * IPC_DATA_SIZE * 2,
    .DataShmSize          = IPC_DATA_SIZE,
    .SendDmaChanIdx       = 0xffU,
    .Async                = (TRUE),
    .HwInfo               = {
        .Ipc_HwId         = MCU_IPC0,/**< the id of the HardwareId */
        .RecvIrqUsed      = (TRUE),/**< Whether to use Recv interrupt */
        .SendMboxId       = 0x0,/**< the mailbox id */
        .RecvMboxId       = 0xc,/**< the mailbox id */
        .RemoteIrq        = 0xc,
        .LocalIrq         = 0x0,
        .UseMDMA          = (FALSE),
    },
    .Ipc_ChannelConfigPtr = Ipc_ShmInstance0CfgChannel,
    .receive_coreid = Ipc_Receive_Core1,
};
```

:::note
S600 的实例 0 与实例 4 在 MCU0 侧 `UseMDMA` 为 `TRUE`、`receive_coreid` 为 `Ipc_Receive_Core0`；在 MCU1 侧 `UseMDMA` 为 `FALSE`、`receive_coreid` 为 `Ipc_Receive_Core1`，即这两个实例在 MCU1 侧使用非 MDMA 接口族，示例对应 MCU1 侧的取值。
:::

</DocScope>

## IPC 使用情况

下表为各实例的硬件、通道与中断分配，以及当前占用方。`x` 为中断通道号，等于实例配置中的 `LocalIrq`，并非实例号。

<DocScope products="RDK S100">

| MCU IPC Instance | 使用方 | 通道数 | IPC 硬件 | 中断函数 | `receive_coreid`（MCU0/MCU1） | 对端 |
|---|---|---|---|---|---|---|
| `Ipc_ShmCfgInstances0` | User、canhal | 8 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch0Isr): Ipc_Driver_CpuIpc0Ch0Isr()` | Core1 / Core1 | Acore instance0 |
| `Ipc_ShmCfgInstances1` | User | 8 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch1Isr): Ipc_Driver_CpuIpc0Ch1Isr()` | Core0 / Core0 | Acore instance1 |
| `Ipc_ShmCfgInstances2` | User | 2 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch2Isr): Ipc_Driver_CpuIpc0Ch2Isr()` | Core0 / Core0 | Acore instance2 |
| `Ipc_ShmCfgInstances3` | User | 8 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch3Isr): Ipc_Driver_CpuIpc0Ch3Isr()` | Core0 / Core0 | Acore instance3 |
| `Ipc_ShmCfgInstances4` | User、canhal | 8 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch4Isr): Ipc_Driver_CpuIpc0Ch4Isr()` | Core0 / Core1 | Acore instance4 |
| `Ipc_ShmCfgInstances5` | 外置 RTC | 8 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch5Isr): Ipc_Driver_CpuIpc0Ch5Isr()` | Core0 / Core0 | Acore instance5 |
| `Ipc_ShmCfgInstances6` | User | 8 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch6Isr): Ipc_Driver_CpuIpc0Ch6Isr()` | Core0 / Core0 | Acore instance6 |
| `Ipc_ShmCfgInstances7` | ipcbox | 8 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch7Isr): Ipc_Driver_CpuIpc0Ch7Isr()` | Core0 / Core1 | Acore instance7 |
| `Ipc_ShmCfgInstances8` | mcu1 boot | 8 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch8Isr): Ipc_Driver_CpuIpc0Ch8Isr()` | Core0 / Core0 | Acore instance8 |
| `Ipc_PrivShmCfgInstance0` | Crypto | 2 | `HSM_IPC1` | `ISR(Ipc_HsmIpc1Ch4Isr): Ipc_Driver_HSMIpc1Ch4Isr()` | Core0 / Core0 | HSM |
| `Ipc_PrivShmCfgInstance1` | HSM DIAG | 2 | `HSM_IPC1` | `ISR(Ipc_HsmIpc1Ch5Isr): Ipc_Driver_HSMIpc1Ch5Isr()` | Core0 / Core0 | HSM |
| `Ipc_PrivShmCfgInstance2` | TROS Diag | 2 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch9Isr): Ipc_Driver_CpuIpc0Ch9Isr()` | Core0 / Core0 | Acore instance9 |
| `Ipc_PrivShmCfgInstance3` | TimeSync（仅 MCU1） | 1 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch10Isr): Ipc_Driver_CpuIpc0Ch10Isr()` | — / Core1 | Acore instance10 |
| `Ipc_PrivShmCfgInstance4` | Ota | 1 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch11Isr): Ipc_Driver_CpuIpc0Ch11Isr()` | Core0 / Core0 | Acore instance11 |
| `Ipc_PrivShmCfgInstance5` | QGA | 1 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch12Isr): Ipc_Driver_CpuIpc0Ch12Isr()` | Core0 / Core0 | Acore instance12 |
| `Ipc_PrivShmCfgInstance6` | Diag（心跳与 CF 事件） | 2 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch13Isr): Ipc_Driver_CpuIpc0Ch13Isr()` | Core0 / Core0 | Acore instance13 |
| `Ipc_PrivShmCfgInstance7` | Diag（NCF 事件） | 1 | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch14Isr): Ipc_Driver_CpuIpc0Ch14Isr()` | Core0 / Core0 | Acore instance14 |
| Housekeeping | Housekeeping | — | `CPU_IPC0` | `ISR(Ipc_CpuIpc0Ch15Isr): Housekeeping_IrqHandler()` | Core0 / Core0 | Acore Housekeeping |
| scmi | scmi | — | `CPU_IPC1` | `ISR(Ipc_CpuIpc1Ch0Isr): ScmiIpc_Irq0Handler()`、`ISR(Ipc_CpuIpc1Ch1Isr): ScmiIpc_Irq1Handler()`、`ISR(Ipc_CpuIpc1Ch2Isr): ScmiIpc_Irq2Handler()` | Core0 / Core0 | Acore scmi |

</DocScope>
<DocScope products="RDK S600">

| MCU IPC Instance | 使用方 | 通道数 | IPC 硬件 | 中断函数 | `receive_coreid`（MCU0/MCU1） | 对端 |
|---|---|---|---|---|---|---|
| `Ipc_ShmCfgInstances0` | User、canhal | 8 | `MCU_IPC0` | `ISR(Ipc0_Ch0Isr): Ipc_Driver_MCUIpc0Ch0Isr()` | Core0 / Core1 | Acore instance0 |
| `Ipc_ShmCfgInstances1` | User | 8 | `MCU_IPC0` | `ISR(Ipc0_Ch1Isr): Ipc_Driver_MCUIpc0Ch1Isr()` | Core0 / Core0 | Acore instance1 |
| `Ipc_ShmCfgInstances2` | User | 2 | `MCU_IPC0` | `ISR(Ipc0_Ch2Isr): Ipc_Driver_MCUIpc0Ch2Isr()` | Core0 / Core0 | Acore instance2 |
| `Ipc_ShmCfgInstances3` | User | 8 | `MCU_IPC0` | `ISR(Ipc0_Ch3Isr): Ipc_Driver_MCUIpc0Ch3Isr()` | Core0 / Core0 | Acore instance3 |
| `Ipc_ShmCfgInstances4` | User、canhal | 8 | `MCU_IPC0` | `ISR(Ipc0_Ch4Isr): Ipc_Driver_MCUIpc0Ch4Isr()` | Core0 / Core1 | Acore instance4 |
| `Ipc_ShmCfgInstances5` | 外置 RTC | 1 | `MCU_IPC0` | `ISR(Ipc0_Ch5Isr): Ipc_Driver_MCUIpc0Ch5Isr()` | Core0 / Core0 | Acore instance5 |
| `Ipc_ShmCfgInstances6` | User | 1 | `MCU_IPC0` | `ISR(Ipc0_Ch6Isr): Ipc_Driver_MCUIpc0Ch6Isr()` | Core0 / Core0 | Acore instance6 |
| `Ipc_ShmCfgInstances7` | ipcbox | 8 | `MCU_IPC0` | `ISR(Ipc0_Ch7Isr): Ipc_Driver_MCUIpc0Ch7Isr()` | Core0 / Core1 | Acore instance7 |
| `Ipc_ShmCfgInstances8` | mcu1 boot | 8 | `MCU_IPC1` | `ISR(Ipc1_Ch0Isr): Ipc_Driver_MCUIpc1Ch0Isr()` | Core0 / Core0 | Acore instance8 |
| `Ipc_ShmCfgInstances9` | User | 2 | `MCU_IPC1` | `ISR(Ipc1_Ch1Isr): Ipc_Driver_MCUIpc1Ch1Isr()` | Core0 / Core0 | Acore instance9 |
| `Ipc_ShmCfgInstances10` | timesync | 1 | `MCU_IPC1` | `ISR(Ipc1_Ch2Isr): Ipc_Driver_MCUIpc1Ch2Isr()` | Core0 / Core1 | Acore instance10 |
| `Ipc_ShmCfgInstances15` | User | 8 | `MCU_IPC1` | `ISR(Ipc1_Ch7Isr): Ipc_Driver_MCUIpc1Ch7Isr()` | Core0 / Core0 | Acore instance15 |
| `Ipc_PrivShmCfgInstance0` | Crypto | 4 | `HSM_IPC3` | `ISR(Ipc_HsmIpc3Ch4Isr): Ipc_Driver_HSMIpc3Ch4Isr()` | Core0 / Core0 | HSM |
| `Ipc_PrivShmCfgInstance1` | HSM Diag | 2 | `HSM_IPC3` | `ISR(Ipc_HsmIpc3Ch5Isr): Ipc_Driver_HSMIpc3Ch5Isr()` | Core0 / Core0 | HSM |
| `Ipc_PrivShmCfgInstance2` | OTA&fastboot | 1 | `MCU_IPC0` | `ISR(Ipc0_Ch8Isr): Ipc_Driver_MCUIpc0Ch8Isr()` | Core0 / Core0 | Acore instance50 |
| `Ipc_PrivShmCfgInstance3` | QGA | 1 | `MCU_IPC0` | `ISR(Ipc0_Ch9Isr): Ipc_Driver_MCUIpc0Ch9Isr()` | Core0 / Core0 | Acore instance51 |
| `Ipc_PrivShmCfgInstance4` | Diag（心跳与 CF 事件） | 2 | `MCU_IPC0` | `ISR(Ipc0_Ch10Isr): Ipc_Driver_MCUIpc0Ch10Isr()` | Core0 / Core0 | Acore instance52 |
| `Ipc_PrivShmCfgInstance5` | Diag（NCF 事件） | 1 | `MCU_IPC0` | `ISR(Ipc0_Ch11Isr): Ipc_Driver_MCUIpc0Ch11Isr()` | Core0 / Core0 | Acore instance53 |
| Housekeeping | Housekeeping | — | `MCU_IPC2` | `ISR(Ipc2_Ch3Isr): Housekeeping_IrqHandler()` | Core0 / Core0 | Acore Housekeeping |

:::note
- S600 的公共实例只有 `0~10` 与 `15`，没有实例 11~14。
- 实例 7 在 S600 MCU0 侧的 `RecvIrqUsed` 为 `FALSE`（`gen_s600_md/Ipc/src/Ipc_Cfg.c`），即 MCU0 侧不通过 `Ipc0_Ch7Isr` 接收，只能使用轮询方式；MCU1 侧该值为 `TRUE`。
- S600 的 MCU0 与 MCU1 公共实例集合完全相同，只有实例 0/4 的 `UseMDMA` 与 `receive_coreid`、实例 7 的 `RecvIrqUsed` 与 `receive_coreid`、实例 10 的 `receive_coreid` 不同。
- S600 的私有实例 `Priv0`、`Priv1`、`Priv2`、`Priv4`、`Priv5` 使用 `UseMDMA = FALSE`，`Priv3` 使用 `UseMDMA = TRUE`。
:::

</DocScope>

## 代码路径

IPC 的实例配置位于 MCU SDK 的 `mcu/Config/McalCdd/` 下，按平台与 MCU 区分。

<DocScope products="RDK S100">

| 文件 | 说明 |
|---|---|
| `mcu/Config/McalCdd/gen_s100_sip_B/Ipc/src/Ipc_Cfg.c` | 公共实例配置（S100 MCU0 侧） |
| `mcu/Config/McalCdd/gen_s100_sip_B_mcu1/Ipc/src/Ipc_Cfg.c` | 公共实例配置（S100 MCU1 侧） |

</DocScope>
<DocScope products="RDK S600">

| 文件 | 说明 |
|---|---|
| `mcu/Config/McalCdd/gen_s600_md/Ipc/src/Ipc_Cfg.c` | 公共实例配置（S600 MCU0 侧） |
| `mcu/Config/McalCdd/gen_s600_md_mcu1/Ipc/src/Ipc_Cfg.c` | 公共实例配置（S600 MCU1 侧） |

</DocScope>

除公共实例配置外，还会用到以下文件：

| 文件 | 说明 |
|---|---|
| `mcu/Config/McalCdd/gen_*/Ipc/src/Ipc_PrivateCfg.c` | 私有实例（Crypto、HSM Diag、OTA、QGA、Diag 等）配置 |
| `mcu/Config/McalCdd/gen_*/Ipc/inc/Ipc_Cfg.h`、`inc/Ipc_PrivateCfg.h` | 实例、通道相关的宏定义与 `extern` 声明 |
| `mcu/Include/Ipc.h`（即 `mcu/McalCdd/Ipc/inc/Ipc.h`） | IPC 公共 API 声明与错误码定义 |
| `mcu/McalCdd/Ipc/` | IPC MCAL 驱动实现 |
| `mcu/Service/HouseKeeping/ipc_box/` | IpcBox 应用实现 |

## 应用 sample

:::tip
本章节的应用 sample 均运行在 Acore 侧并与 MCU1 通信，使用前需要先启动 MCU1 系统。
:::

### IpcBox 功能介绍{#IPCBOX}

IpcBox 基于 MCU 侧的 IPC 通信框架增加的应用扩展，用于管理外设的透传功能，其实现框图如下：
各个外设通过统一的接口接入 IpcBox 中进行管理，简单来说就是外设数据经过 IPC Box 进行转发，并返回给 Acore 侧，同理 Acore 侧的数据通过 IpcBox 进行转发，并操作实际的外设，其数据流为：`Acore<->IPC<->MCU<->Peri`

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/mcu-ipbox.jpg" alt="IPCBOX架构图" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


:::tip
配套的 Acore 侧应用见[IPC模块介绍](../03_system_software/12_driver_ipc.md#IPC_APP) 章节。

<DocScope products="RDK S100">

IpcBox 在版本 `RDKS100的V4.0.4-Beta` -> `RDKS100的V4.0.5-Beta` 升级过程中进行了一次重构，修改范围包括数据包结构，Ipc 通道，透传外设的默认配置，注意 MCU 侧和 Acore 侧的版本对应关系。

</DocScope>

:::

#### 透传外设数据

**实现情况**：

| 项目 | 实现情况 | 备注 |
|---|---|---|
| RunCmd | 已实现 | — |
| SPI | 已实现 | — |
| I2C | 已实现 | — |
| Uart | 已实现 | S100 固定使用 Uart5 |

<DocScope products="RDK S600">

其中 S600 的 IpcBox Uart 使用 `UART_IPCBOX_HW_CHANNEL`，其定义为 `UART11_HW_CHANNEL`（`Config/McalCdd/gen_s600_md_mcu1/Uart/inc/Uart_Board.h`），即 S600 固定使用 Uart11。

</DocScope>

**协议包解析**

在一般情况下，一共占128字节，可以根据末尾数据域2扩展数据包长度，建议保持128字节，这样在为数据包申请64bytes 对齐的内存时，data[]数组仍为64bytes 对齐。

```c
typedef struct {
    uint32 magic; // 魔数
    uint32 version; // 版本号
    uint32 checksum; // 校验和
    uint32 length; //数据包总长度
    char cmd[MAX_CMD_LENGTH]; // 数据域1
    uint8 reserve[48]; // 预留
    uint8 data[]; // 数据域2
} IpcBoxPacket_t;
```

#### 使用方式

由于 IpcBox 会占用外设资源，所以在开机时，此功能是默认关闭的，如需要使用，请手动打开。
打开方式有以下两种：

1. 通过修改 MCU SDK 中的数组配置,找到对应的外设，将`DISABLE`改为`ENABLE`

    ```c
    // Service/HouseKeeping/ipc_box/src/ipc_box.c
    static Ipcbox_ComType IpcBox_InstanceMap[] = {
        { IPCBOX_COM_ID_RUNCMD, "runcmd", IpcConf_IpcInstance_IpcInstance_7,
        IpcConf_IpcInstance_7_IpcChannel_0, ENABLE, IPCBOX_PERIID_INVALID,
        IpcBox_RunCmdInit, IpcBox_RunCmdDeinit },
        { IPCBOX_COM_ID_UART, "uart", IpcConf_IpcInstance_IpcInstance_7,
        IpcConf_IpcInstance_7_IpcChannel_1, DISABLE, UART5_CHANNEL,
        IpcBox_UartInit, IpcBox_UartDeinit },
        { IPCBOX_COM_ID_SPI, "spi", IpcConf_IpcInstance_IpcInstance_7,
        IpcConf_IpcInstance_7_IpcChannel_2, DISABLE, IPCBOX_PERIID_INVALID,
        IpcBox_SpiInit, IpcBox_SpiDeinit },
        { IPCBOX_COM_ID_I2C, "i2c", IpcConf_IpcInstance_IpcInstance_7,
        IpcConf_IpcInstance_7_IpcChannel_3, DISABLE, IPCBOX_PERIID_INVALID,
        IpcBox_I2cInit, IpcBox_I2cDeinit },
    };
    ```

2. 这是临时打开的方式，可以通过 MCU1 的命令行进行打开，命令见下文「MCU1 命令行操作」。

#### MCU1 命令行操作

以下命令在 **MCU1 的串口 shell** 中执行，不在 Acore 上执行；这两条命令也只编译进 MCU1 固件。

**`ipcbox_set_mode`**

查看外设透传功能的使能情况，或临时打开/关闭某个透传外设。不带参数时打印帮助信息：

```bash
Usage: ipcbox <name> [enable]
       name: debug, spi, uart, etc.
       enable: 0 (disable), 1 (enable)
```

| 参数 | 必选 | 说明 |
|---|---|---|
| `name` | 是 | 外设名，可选 `debug`、`runcmd`、`uart`、`spi`、`i2c` |
| `enable` | 否 | 省略时仅查询状态；`1` 表示打开，`0` 表示关闭。仅当 `name` 为 `debug` 时可以省略 |

- 查看外设透传功能使能情况

    ```bash
    D-Robotics:/$ ipcbox_set_mode debug
    [066378.758965 0]Module: runcmd, Enable
    [066378.759240 0]Module: uart, Enable
    [066378.759663 0]Module: spi, Enable
    [066378.760075 0]Module: i2c, Enable
    ```

- 打开和关闭 IpcBox 透传 uart 外设功能

    ```bash
    D-Robotics:/$ ipcbox_set_mode uart 1
    [066386.990200 0]uart processing enabled
    [066386.990487 0]IpcBox_FreeRtos_OsTask_IpcBox_Uart_ASW task is already initialized or running

    D-Robotics:/$ ipcbox_set_mode uart 0
    [066389.201404 0]uart processing disabled
    [066389.267399 0]IpcBox_uart task resources released and terminating
    [066389.701820 0]IpcBox_uart task exited properly
    ```

- 打开和关闭 IpcBox 透传 I2C 外设功能

    ```bash
    D-Robotics:/$ ipcbox_set_mode i2c 1
    [066394.631826 0]i2c processing enabled
    [066394.632101 0]IpcBox_FreeRtos_OsTask_IpcBox_I2c_ASW task is already initialized or running

    D-Robotics:/$ ipcbox_set_mode i2c 0
    [066397.082288 0]i2c processing disabled
    [066397.085213 0]IpcBox_i2c task resources released and terminating
    [066397.087215 0]IpcBox_i2c task exited properly
    ```

- 打开和关闭 IpcBox 透传 SPI 外设功能

    ```bash
    D-Robotics:/$ ipcbox_set_mode spi 1
    [066403.227424 0]spi processing enabled
    [066403.227699 0]IpcBox_Spi task is already initialized or running

    D-Robotics:/$ ipcbox_set_mode spi 0
    [066406.388582 0]spi processing disabled
    [066406.389522 0]IpcBox_spi task resources released and terminating
    [066406.393520 0]IpcBox_spi task exited properly
    ```

**`ipcbox_loglevel`**

IpcBox 模块的打印信息可以动态开关，由 `ipcbox_loglevel` 命令控制。不带参数时打印 `Usage: loglevel <0-4|show|help>`：

```bash
D-Robotics:/$ ipcbox_loglevel help
Usage: loglevel <level|subcommand>
  level: 0=NO_LOG, 1=ERROR, 2=WARN, 3=INFO, 4=DEBUG
  subcommands:
    show - show current log level
    help - show this message
```

| 参数 | 说明 |
|---|---|
| `0~4` | 设置日志等级：0=NO_LOG，1=ERROR，2=WARN，3=INFO，4=DEBUG |
| `show` | 查看当前日志等级 |
| `help` | 打印帮助信息 |

输入`ipcbox_loglevel 0`后打印最少，输入`ipcbox_loglevel 4`后打印最多

```bash
D-Robotics:/$ ipcbox_loglevel 0
[066736.123326 0]This is an ERROR message

D-Robotics:/$ ipcbox_loglevel 4
[066738.473668 0]Log level changed to 4
[066738.473942 0]This is an ERROR message
[066738.474408 0]This is a WARN message
[066738.474853 0]This is an INFO message
[066738.475309 0]This is a DEBUG message
```

:::note
帮助信息里的 `Usage` 不带 `ipcbox_` 前缀，这是源码中的实际输出。
:::

#### IpcBox RunCmd 的实现

根据 Acore 端传过来的命令，执行 MCU 侧的 CMD 应用，简称 RunCmd 应用。

各个外设经过 IPC Box 进行数据转发大同小异，实现原理主要分为以下两个过程：
1. `Acore->Ipc->MCU`过程
    - Acore 向 MCU 发送数据时触发 mcu 的中断，在中断的 callback 中将数据存储到队列中
2. `MCU->Ipc->Acore`过程
    - MCU 存在一个常驻线程，持续读取队列，若队列不为空，则校验并解析数据，识别出 cmd 命令并运行
    - FreeRTOS 的 cmd 的应用类似于 U-Boot 的 cmd 的命令，通过此方式用户可以很方便的定制化自己的应用，在此场景中，运行的 cmd 将 adc 的值读出，再通过 ipc 返回给 Acore

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/mcu-runcmd.jpg" alt="Acore与MCU之间透传Can数据架构图" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

#### IpcBox Uart 的实现
与 Runcmd 的实现类似，在此场景中，MCU 向 Acore 发送数据时触发 MCU 的中断，但并不会使用队列存储

实现原理主要分为以下两个过程：
1. `Acore->Ipc->MCU`过程
    - Acore 向 MCU 发送数据时触发 mcu 的中断，在中断解析数据，并通过 Uart 外设发出
2. `MCU->Ipc->Acore`过程
    - MCU 存在一个常驻线程，持续调用 Uart 外设接收数据，当存在数据时，将数据打包，转发到 Acore

#### IpcBox I2c 的实现
与 Runcmd 的实现类似，在此场景中，MCU 向 Acore 发送数据时触发 mcu 的中断，在中断的 callback 中将数据存储到队列中，然后通过 ipc 返回给 Acore
实现原理主要分为以下两个过程：
1. `Acore->Ipc->MCU`过程
    - Acore 向 MCU 发送数据时触发 mcu 的中断，在中断的 callback 中将数据存储到队列中
2. `MCU->Ipc->Acore`过程
    - MCU 存在一个常驻线程，持续读取队列，若队列不为空，则校验并解析数据
    - 根据命令码实现 detect/get/set 操作。
    - 由于 Slave 设备多样，例如地址宽度和操作步骤不同，所以 get/set 操作的实现不同，需要客户根据实际场景去实现`IpcBox_I2cGetValue`和`IpcBox_I2cSetValue`，这两个 API 位于`Service/HouseKeeping/ipc_box/src/ipc_i2c.c`

#### IpcBox Spi 的实现
与 Runcmd 的实现类似，在此场景中，MCU 向 Acore 发送数据时触发 mcu 的中断，在中断的 callback 中将数据存储到队列中，然后通过 ipc 返回给 Acore
实现原理主要分为以下两个过程：
1. `Acore->Ipc->MCU`过程
    - Acore 向 MCU 发送数据时触发 mcu 的中断，在中断的 callback 中将数据存储到队列中
2. `MCU->Ipc->Acore`过程
    - MCU 存在一个常驻线程，持续读取队列，若队列不为空，则校验并解析数据
    - 根据命令码执行读写、只读、只写功能，由于 Spi 是全双工通信，所以只读其实是发送了等长度的无效数据，只写同理



### 应用程序接口

此部分为 MCU 侧的 IPC 接口。IPC 提供两套并行的接口，具体使用哪一套由 Instance 配置中的 `HwInfo.UseMDMA` 决定：

| 接口族 | 使用条件 | 接口 |
|---|---|---|
| `Ipc_MDMA_*` | `HwInfo.UseMDMA == TRUE` | `Ipc_MDMA_Init`、`Ipc_MDMA_DeInit`、`Ipc_MDMA_CheckRemoteCoreReady`、`Ipc_MDMA_SendMsg`、`Ipc_MDMA_PollMsg`、`Ipc_MDMA_OpenInstance`、`Ipc_MDMA_CloseInstance`、`Ipc_MDMA_TryGetHwResource` |
| `Ipc_*` | `HwInfo.UseMDMA == FALSE` | `Ipc_Init`、`Ipc_DeInit`、`Ipc_GetVersionInfo`、`Ipc_CheckRemoteCoreReady`、`Ipc_GetFreeBuffs`、`Ipc_SendMsg`、`Ipc_FreeRemoteBuffs`、`Ipc_PollMsg`、`Ipc_OpenInstance`、`Ipc_CloseInstance`、`Ipc_CheckInstanceState`、`Ipc_FreeHwResource`、`Ipc_Irq` |

两套接口的定位差异是：`Ipc_*` 把发送过程拆分为「申请 buffer（`Ipc_GetFreeBuffs`）→ 发送（`Ipc_SendMsg`）→ 回收对端 buffer（`Ipc_FreeRemoteBuffs`）」，由用户管理 buffer；`Ipc_MDMA_*` 则由驱动内部完成 buffer 管理。在 `HwInfo.UseMDMA == FALSE` 的 Instance 上调用 `Ipc_MDMA_*` 接口不会生效，驱动会通过 Det 上报 `IPC_E_PARAM_ERROR`。各实例的 `UseMDMA` 取值见 [IPC 使用情况](#ipc-使用情况)。

下面先列出 MDMA 接口族的 8 个接口，再列出非 MDMA 接口族的 13 个接口。

#### Ipc_MDMA_Init

**【函数原型】**

`void Ipc_MDMA_Init(Ipc_InstanceConfigType* pConfigPtr, uint32 InstanceId)`

**【功能描述】**

初始化指定 Instance 的 MDMA 通道 IPC 驱动，注册配置并申请所需资源。使用 `Ipc_MDMA_*` 接口族前需要先调用本接口，且必须在 DMA 模块初始化之后调用。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `pConfigPtr` | `Ipc_InstanceConfigType*` | 是 | — | 指向该 Instance 配置的指针，即 `Ipc_Cfg.c` 中的 `Ipc_ShmCfgInstances*` |
| `InstanceId` | `uint32` | 是 | — | Instance ID，需与 `pConfigPtr->Ipc_InstanceId` 一致 |

**【返回值】**

无返回值（`void`）。

#### Ipc_MDMA_DeInit

**【函数原型】**

`void Ipc_MDMA_DeInit(uint32 InstanceId)`

**【功能描述】**

去初始化指定 Instance，释放驱动申请的资源，并将 Instance 状态复位为未初始化。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |

**【返回值】**

无返回值（`void`）。若 Instance 仍处于打开状态（未先调用 `Ipc_MDMA_CloseInstance`），本接口不执行去初始化，并通过 Det 上报 `IPC_E_CHANNEL_NOT_CLOSE`；若 Instance 未初始化，则上报 `IPC_E_DRIVER_NOT_INIT`。

#### Ipc_GetVersionInfo

**【函数原型】**

`void Ipc_GetVersionInfo(Std_VersionInfoType* Versioninfo)`

**【功能描述】**

获取 IPC 驱动版本信息。该接口由 `IPC_VERSION_INFO_API` 条件编译控制，未开启时不存在。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `Versioninfo` | `Std_VersionInfoType*` | 是 | — | 输出参数，指向用于存放版本信息的结构体 |

**【返回值】**

无返回值（`void`）。

#### Ipc_MDMA_CheckRemoteCoreReady

**【函数原型】**

`Std_ReturnType Ipc_MDMA_CheckRemoteCoreReady(uint32 InstanceId)`

**【功能描述】**

检查指定 Instance 的对端核是否已就绪。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 对端核已就绪 |
| `IPC_E_PARAM_ERROR` | 入参非法 |
| `IPC_E_DRIVER_NOT_INIT` | 驱动未初始化 |
| `IPC_E_INSTANCE_NOT_READY_ERROR` | 对端核未就绪 |
| `IPC_E_CHANNEL_NOT_OPEN` | Instance 未打开 |

#### Ipc_MDMA_SendMsg

**【函数原型】**

`Std_ReturnType Ipc_MDMA_SendMsg(uint32 InstanceId, uint32 ChanId, uint32 Size, uint8* Buf, uint32 Timeout)`

**【功能描述】**

向指定 Instance 的指定 Channel 发送数据，发送过程为同步阻塞，直到传输完成或超时。发送数据时需保证数据 buffer 地址 16 字节对齐。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |
| `ChanId` | `uint32` | 是 | — | Channel ID |
| `Size` | `uint32` | 是 | — | 待发送数据的长度 |
| `Buf` | `uint8*` | 是 | — | 指向待发送数据的指针 |
| `Timeout` | `uint32` | 是 | — | 超时时间，单位 us |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 发送成功 |
| `IPC_E_PARAM_ERROR` | 入参非法 |
| `IPC_E_DRIVER_NOT_INIT` | 驱动未初始化 |
| `IPC_E_CHANNEL_NOT_OPEN` | Instance 未打开 |
| `IPC_E_TIMEOUT_ERROR` | 发送超时 |
| `IPC_E_NO_MEMORY_ERROR` | 无内存可发送 |
| `IPC_E_CHECKRESERROR` | 申请资源失败 |

:::tip
DMA 硬件要求传输地址 16 字节对齐，buffer 需要保证首地址与长度均 16 字节对齐。SDK 中的写法可参考 `mcu/qa_test/S13_IPC/qa_IpcTest.c`：

```c
static uint8 __attribute__((aligned(16))) Ipc_Send_Buf[8192];
```
:::

#### Ipc_MDMA_PollMsg

**【函数原型】**

`Std_ReturnType Ipc_MDMA_PollMsg(uint32 InstanceId)`

**【功能描述】**

在 Instance 未使用中断接收数据时，主动轮询接收消息。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 成功 |
| `IPC_E_PARAM_ERROR` | 入参非法 |
| `IPC_E_DRIVER_NOT_INIT` | 驱动未初始化 |
| `IPC_E_CHANNEL_NOT_OPEN` | Instance 未打开 |
| `IPC_E_NO_DATA_TO_RECEIVE_ERROR` | 无数据可接收 |

#### Ipc_MDMA_OpenInstance

**【函数原型】**

`Std_ReturnType Ipc_MDMA_OpenInstance(uint32 InstanceId)`

**【功能描述】**

打开指定 Instance，打开后才能在该 Instance 上收发数据。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 成功 |
| `IPC_E_DRIVER_NOT_INIT` | 驱动未初始化 |
| `IPC_E_CHANNEL_NOT_CLOSE` | Instance 已被打开 |
| `IPC_E_PARAM_ERROR` | 入参非法 |

#### Ipc_MDMA_CloseInstance

**【函数原型】**

`Std_ReturnType Ipc_MDMA_CloseInstance(uint32 InstanceId)`

**【功能描述】**

关闭指定 Instance。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 成功 |
| `IPC_E_PARAM_ERROR` | 入参非法 |
| `IPC_E_CHANNEL_NOT_OPEN` | Instance 未打开 |

:::note
上表以当前版本的实现（`McalCdd/Ipc/src/Ipc_MDMA.c`）为准。头文件注释中列出的 `IPC_E_DRIVER_NOT_INIT` 与 `IPC_E_CHANNEL_NOT_CLOSE` 在本接口实现中不会返回。
:::

#### Ipc_MDMA_TryGetHwResource

**【函数原型】**

`Std_ReturnType Ipc_MDMA_TryGetHwResource(uint32 InstanceId, uint32 ChanId, uint32 BufSize)`

**【功能描述】**

尝试申请指定 Channel 的硬件资源，用于接收数据。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |
| `ChanId` | `uint32` | 是 | — | Channel ID |
| `BufSize` | `uint32` | 是 | — | 申请的 buffer 大小 |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 申请成功 |
| `E_NOT_OK` | 申请失败 |
| `IPC_E_PARAM_ERROR` | 入参非法 |
| `IPC_E_DRIVER_NOT_INIT` | 驱动未初始化 |
| `IPC_E_CHANNEL_NOT_OPEN` | Instance 未打开 |
| `IPC_E_DEVICE_BUSY` | Instance 忙 |
| `IPC_E_MDMA_BUSY` | 发送 MDMA 忙 |
| `IPC_E_NO_BUF_ERROR` | 无可用 buffer |
| `IPC_E_MAIN_POWER_DOWN` | 主域已下电 |
| `IPC_E_CHECKRESERROR` | 申请资源失败 |
| `IPC_E_INSTANCE_NOT_READY_ERROR` | Instance 未就绪 |

:::note
上表以当前版本的实现（`McalCdd/Ipc/src/Ipc_MDMA.c` 及其错误码转换函数）为准。
:::

#### Ipc_Init

**【函数原型】**

`void Ipc_Init(Ipc_InstanceConfigType* pConfigPtr, uint32 InstanceId)`

**【功能描述】**

初始化指定 Instance 的非 MDMA IPC 驱动。使用 `Ipc_*` 接口族前需要先调用本接口，且必须在 DMA 模块初始化之后调用。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `pConfigPtr` | `Ipc_InstanceConfigType*` | 是 | — | 指向该 Instance 配置的指针 |
| `InstanceId` | `uint32` | 是 | — | Instance ID，需与 `pConfigPtr->Ipc_InstanceId` 一致 |

**【返回值】**

无返回值（`void`）。

#### Ipc_DeInit

**【函数原型】**

`void Ipc_DeInit(uint32 InstanceId)`

**【功能描述】**

去初始化指定 Instance，释放驱动申请的资源。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |

**【返回值】**

无返回值（`void`）。

#### Ipc_CheckRemoteCoreReady

**【函数原型】**

`Std_ReturnType Ipc_CheckRemoteCoreReady(uint32 InstanceId)`

**【功能描述】**

检查指定 Instance 的对端核是否已就绪。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 对端核已就绪 |
| `IPC_E_PARAM_ERROR` | 入参非法 |
| `IPC_E_DRIVER_NOT_INIT` | 驱动未初始化 |
| `IPC_E_INSTANCE_NOT_READY_ERROR` | 对端核未就绪 |
| `IPC_E_CHANNEL_NOT_OPEN` | Instance 未打开 |

#### Ipc_GetFreeBuffs

**【函数原型】**

`Std_ReturnType Ipc_GetFreeBuffs(uint32 InstanceId, uint32 ChanId, uint32 Size, uint8** Buf)`

**【功能描述】**

发送数据前申请空闲 buffer，申请到的地址通过 `Buf` 返回。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |
| `ChanId` | `uint32` | 是 | — | Channel ID |
| `Size` | `uint32` | 是 | — | 需要申请的 buffer 大小 |
| `Buf` | `uint8**` | 是 | — | 输出参数，指向用于存放 buffer 地址的指针 |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 申请成功 |
| `E_NOT_OK` | 申请失败 |
| `IPC_E_PARAM_ERROR` | 入参非法 |
| `IPC_E_DRIVER_NOT_INIT` | 驱动未初始化 |
| `IPC_E_CHANNEL_NOT_OPEN` | Instance 未打开 |

#### Ipc_SendMsg

**【函数原型】**

`Std_ReturnType Ipc_SendMsg(uint32 InstanceId, uint32 ChanId, uint32 Size, uint8* Buf, uint32 Timeout)`

**【功能描述】**

向指定 Instance 的指定 Channel 发送数据。发送用的 buffer 需先通过 `Ipc_GetFreeBuffs` 申请。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |
| `ChanId` | `uint32` | 是 | — | Channel ID |
| `Size` | `uint32` | 是 | — | 待发送数据的长度 |
| `Buf` | `uint8*` | 是 | — | 指向待发送数据的指针 |
| `Timeout` | `uint32` | 是 | — | 超时时间，单位 us |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 发送成功 |
| `IPC_E_PARAM_ERROR` | 入参非法 |
| `IPC_E_DRIVER_NOT_INIT` | 驱动未初始化 |
| `IPC_E_CHANNEL_NOT_OPEN` | Instance 未打开 |
| `IPC_E_TIMEOUT_ERROR` | 发送超时 |
| `IPC_E_NO_MEMORY_ERROR` | 无内存可发送 |

#### Ipc_FreeRemoteBuffs

**【函数原型】**

`Std_ReturnType Ipc_FreeRemoteBuffs(uint32 InstanceId, uint32 ChanId, const void* Buf)`

**【功能描述】**

接收完成后释放对端 buffer。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |
| `ChanId` | `uint32` | 是 | — | Channel ID |
| `Buf` | `const void*` | 是 | — | 指向待释放 buffer 的指针 |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 成功 |
| `IPC_E_PARAM_ERROR` | 入参非法 |
| `IPC_E_DRIVER_NOT_INIT` | 驱动未初始化 |
| `IPC_E_CHANNEL_NOT_OPEN` | Instance 未打开 |
| `IPC_E_NO_MEMORY_ERROR` | 无内存可释放 |

#### Ipc_PollMsg

**【函数原型】**

`Std_ReturnType Ipc_PollMsg(uint32 InstanceId)`

**【功能描述】**

在 Instance 未使用中断接收数据时，主动轮询接收消息。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 成功 |
| `IPC_E_PARAM_ERROR` | 入参非法 |
| `IPC_E_DRIVER_NOT_INIT` | 驱动未初始化 |
| `IPC_E_CHANNEL_NOT_OPEN` | Instance 未打开 |
| `IPC_E_NO_DATA_TO_RECEIVE_ERROR` | 无数据可接收 |

#### Ipc_OpenInstance

**【函数原型】**

`Std_ReturnType Ipc_OpenInstance(uint32 InstanceId)`

**【功能描述】**

打开指定 Instance，打开后才能在该 Instance 上收发数据。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 成功 |
| `IPC_E_DRIVER_NOT_INIT` | 驱动未初始化 |
| `IPC_E_CHANNEL_NOT_CLOSE` | Instance 已被打开 |
| `IPC_E_PARAM_ERROR` | 入参非法 |

#### Ipc_CloseInstance

**【函数原型】**

`Std_ReturnType Ipc_CloseInstance(uint32 InstanceId)`

**【功能描述】**

关闭指定 Instance。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 成功 |
| `IPC_E_DRIVER_NOT_INIT` | 驱动未初始化 |
| `IPC_E_CHANNEL_NOT_OPEN` | Instance 未打开或已被关闭 |
| `IPC_E_PARAM_ERROR` | 入参非法 |

#### Ipc_CheckInstanceState

**【函数原型】**

`Std_ReturnType Ipc_CheckInstanceState(uint32 InstanceId)`

**【功能描述】**

检查指定 Instance 的状态。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 成功 |
| `IPC_E_DEVICE_BUSY` | Instance 忙 |

#### Ipc_FreeHwResource

**【函数原型】**

`Std_ReturnType Ipc_FreeHwResource(uint32 InstanceId, uint32 ChanId, uint8* Buf)`

**【功能描述】**

释放指定 Channel 的硬件资源。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `InstanceId` | `uint32` | 是 | — | Instance ID |
| `ChanId` | `uint32` | 是 | — | Channel ID |
| `Buf` | `uint8*` | 是 | — | 指向待释放 buffer 的指针 |

**【返回值】**

| 返回值 | 说明 |
|---|---|
| `E_OK` | 成功 |
| 其它 | 失败 |

#### Ipc_Irq

**【函数原型】**

`void Ipc_Irq(uint8 IpcHwId, uint8 IrqId)`

**【功能描述】**

IPC 中断的统一入口，由中断服务程序调用，用于按硬件与中断通道分发处理。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
|---|---|---|---|---|
| `IpcHwId` | `uint8` | 是 | — | IPC 硬件 ID，取值与 `Ipc_PrivateCfg.h` 中的 `MCU_IPC*`、`HSM_IPC*`、`CPU_IPC*` 宏一致 |
| `IrqId` | `uint8` | 是 | — | 中断通道号 |

**【返回值】**

无返回值（`void`）。

#### 错误码说明

接口的返回值类型为 `Std_ReturnType`，除下表的 `IPC_E_*` 之外，还可能返回标准返回码 `E_OK`（`0x00`，成功）与 `E_NOT_OK`（`0x01`，失败），或被驱动透传的内部错误码。

| 宏 | 值 | 含义 |
|---|---|---|
| `IPC_E_DRIVER_NOT_INIT` | `0x02` | 驱动未初始化 |
| `IPC_E_PARAM_ERROR` | `0x03` | 入参非法 |
| `IPC_E_DRIVER_INITTED` | `0x04` | 驱动已初始化 |
| `IPC_E_CHANNEL_NOT_OPEN` | `0x05` | 通道/Instance 未打开 |
| `IPC_E_CHANNEL_NOT_CLOSE` | `0x06` | 通道/Instance 未关闭 |
| `IPC_E_NO_BUF_ERROR` | `0x07` | 无可用 buffer，或无需读取的 buffer |
| `IPC_E_NO_MEMORY_ERROR` | `0x08` | 初始化、发送或释放 buffer 时无内存 |
| `IPC_E_INSTANCE_NOT_READY_ERROR` | `0x09` | Instance 未就绪 |
| `IPC_E_NO_DATA_TO_RECEIVE_ERROR` | `0x0A` | 无数据可接收 |
| `IPC_E_TIMEOUT_ERROR` | `0x0B` | 超时 |
| `IPC_E_DEVICE_BUSY` | `0x0C` | 发送时设备忙 |
| `IPC_E_MDMA_BUSY` | `0x0D` | 申请资源时 MDMA 忙 |
| `IPC_E_MAIN_POWER_DOWN` | `0x0E` | 主域已下电 |
| `IPC_E_MAILBOX` | `0x0F` | 邮箱 ID 错误 |
| `IPC_E_CHECKRESERROR` | `0x10` | 申请资源失败 |

错误码定义位于 `mcu/Include/Ipc.h`。

## 调试

- **通信自测**：运行 Acore 侧 sample 与 MCU1 进行通信，核对数据收发正确。
- **配置核对**：核对两端 IPC 配置一致，包括 Instance 控制段与 data 段地址、Channel 数量与 ID、Buffer 大小。
- **中断核对**：核对 Instance 工作核配置（`receive_coreid`）与中断使能核一致，避免多核抢占导致通信失败。

## 常见问题

### IPC 通信失败，两端配置不一致

**原因**：MCU 端与对端 IPC 配置不一致，包括 Instance 控制段与 data 段地址、Channel 数量与 ID、Buffer 数据与大小。

**解决**：核对两端配置并保持一致后重试，可参考 [IPC 使用情况](#ipc-使用情况) 中列出的通道数与硬件编号。

### IPC 通信失败，receive_coreid 配置错误

**原因**：Instance 的 `receive_coreid` 与实际工作核（MCU0 或 MCU1）不匹配。

**解决**：明确 Instance 工作在 MCU0 还是 MCU1，相应配置为 `Ipc_Receive_Core1`。

### IPC 通信失败，中断被其他核抢占

**原因**：IPC 中断在多个核上同时使能，被其他核抢占。

**解决**：仅在实际工作的核上使能对应 IPC 中断。

### 发送接口返回 `IPC_E_MDMA_BUSY` 或 `IPC_E_NO_BUF_ERROR`

**原因**：MDMA 发送通道只有两个（`IPC_SEND_MDMA_CHAN_0/1`），多个任务并发发送时会互相抢占 DMA 资源。

**解决**：单核或多核多任务发送时，使用自旋锁或关中断方式保护发送流程，避免并发抢占。

### 发送接口返回 `IPC_E_CHANNEL_NOT_OPEN`

**原因**：调用发送接口前没有先调用对应接口族的 `OpenInstance`，或 Instance 已被 `CloseInstance`。

**解决**：确认 Instance 已完成 `Init` 与 `OpenInstance`，再调用发送接口。

### 发送数据异常或传输失败

**原因**：发送 buffer 未满足 16 字节对齐要求。

**解决**：把发送 buffer 定义为 16 字节对齐（`__attribute__((aligned(16)))`），并保证发送长度也是 16 字节对齐。

### IpcBox 透传外设无响应

**原因**：IpcBox 的 `uart`、`spi`、`i2c` 默认是 `DISABLE`，需要手动打开。

**解决**：按 [使用方式](#使用方式) 修改 `IpcBox_InstanceMap` 后重新编译，或在 MCU1 命令行用 `ipcbox_set_mode <name> 1` 临时打开。

### IpcBox sample 收不到数据

**原因**：应用 sample 运行在 Acore 侧并与 MCU1 通信，MCU1 系统未启动时无法通信。

**解决**：先启动 MCU1 系统，见 [MCU1 启动步骤](./01_basic_information.md#start_mcu1)。

### IpcBox 数据包解析失败

**原因**：MCU 侧与 Acore 侧的 IpcBox 版本不匹配。IpcBox 在 S100 `V4.0.4-Beta` -> `V4.0.5-Beta` 升级中重构过数据包结构、Ipc 通道与透传外设的默认配置，两端版本不一致时数据包无法正确解析。

**解决**：确认 MCU 侧与 Acore 侧的版本对应关系，升级到相互匹配的版本。

## 相关文档

- [IPC 模块介绍（Acore 侧）](/Advanced_development/system_software/driver_ipc)
- [MCU1 启动步骤](./01_basic_information.md#start_mcu1)
- [CAN 使用指南](./09_mcu_can.md)
- [MCU 代码包结构介绍](./00_code_release.md)
- IpcBox 实现代码：`mcu/Service/HouseKeeping/ipc_box/`
