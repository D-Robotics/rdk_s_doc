---
sidebar_position: 9
---

# 7.5.10 CAN 使用指南

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 基本概述
<DocScope products="RDK S100">
- 最大可使用 CAN controller 数量：10。
- CAN 最高传输速率：8M。(受限于 transceiver 的波特率限制，目前实验室只测试验证到5M 波特率。)
- 一个 controller 的 Ram 内划分的 Block 个数：
    - CAN0~CAN3：4 Block (可变 payload);
    - CAN4~CAN9：4 Block (可变 payload)+ 4 Block(固定 payload)。
- 一个 controller 支持的最大 Mailbox 个数为128。
- 一个 controller 支持一路 RxFIFO，FIFO 深度为：
    - CAN0~CAN3：8 * 64 bytes;
    - CAN4~CAN9：32 * 64 bytes。
- 不支持 TTController，即不支持 TTCAN（一种基于 CAN 总线的高层协议）。
- CAN 支持多包合并传输，并且可以配置合包的数量和超时时间，默认合包数量为1，超时时间为1000us。
</DocScope>
<DocScope products="RDK S600">
- 最大可使用 CAN controller 数量：16。
- CAN 最高传输速率：8M。(受限于 transceiver 的波特率限制，目前实验室只测试验证到5M 波特率。)
- 一个 controller 的 Ram 内划分的 Block 个数：
    - CAN0~CAN3：4 Block (可变 payload);
    - CAN4~CAN11：4 Block (可变 payload)+ 4 Block(固定 payload)。
    - CAN12~CAN15：4 Block (可变 payload);
- 一个 controller 支持的最大 Mailbox 个数为128。
- 一个 controller 支持一路 RxFIFO，FIFO 深度为：
    - CAN0~CAN3：8 * 64 bytes;
    - CAN4~CAN11：32 * 64 bytes;
    - CAN12~CAN15：8 * 64 bytes;
- 考虑到系统层面的唤醒功能，软件驱动不支持 controller 的 PretendedNetwork 功能。
- 不支持 TTController，即不支持 TTCAN（一种基于 CAN 总线的高层协议）。
- CAN 支持多核使用，可将不同的 CAN 控制器绑定在不同的核心上，但不支持多个核心同时使用同一个 CAN 控制器。
</DocScope>
## 软件架构{#Software_architecture}
<DocScope products="RDK S100">
S100芯片的 CAN 控制器位于 MCU 域，负责 CAN 数据收发。由于感知等应用位于 Acore，因此部分 CAN 数据需要通过 IPC 核间通信机制转发到 Acore。架构保证传输可靠性，转发机制实现数据正确性检测、丢包检测和传输超时检测等机制。此外，还需要规避 MCU 侧高频转发小数据块导致 CPU 占用率过高，造成 MCU 实时性降低等性能问题。

S100 CAN 转发方案的核心流程如下：
- 首先通过 MCU 侧 CAN2IPC 模块将 CAN 通道映射到对应 IPC 通道，然后通过 Acore 侧 CANHAL 模块将 IPC 通道反映射为虚拟 CAN 设备通道。最后用户通过 CANHAL 提供的 API 接口获取虚拟 CAN 设备中的数据。其中，CAN2IPC 模块为 MCU 侧服务，CANHAL 模块为 Acore 侧提供给应用程序的动态库。
- CAN 采用中断的方式接收数据，当接收到数据之后调用 CAN2IPC 模块，CAN2IPC 模块将 MCU 侧 CAN 数据，按照指定传输协议进行打包，然后通过 IPC 核间通信转发到 Acore。Ipc instance 0和 Ipc instance 4分配给 can 使用，默认使能 can5-can9, can5-can9与 IPC 对应关系如下表：

|             | Ipc_ShmCfgInstances | channel |
|-------------|---------------------|---------|
| can0        | 0                   | -       |
| can1        | 0                   | -       |
| can2        | 0                   | -       |
| can3        | 0                   | -       |
| can4        | 0                   | -       |
| can5        | 0                   | 4       |
| can6        | 0                   | 6       |
| can7        | 4                   | 7       |
| can8        | 4                   | 2       |
| can9        | 0                   | 3       |
- CANHAL 模块获取来自 MCU 侧的 IPC 数据，按照指定的传输协议解析数据，并支持业务软件通过 API 获取原始 CAN 帧。
</DocScope>
<DocScope products="RDK S600">
S600芯片的 CAN 控制器位于 MCU 域，负责 CAN 数据收发。由于感知等应用位于 Acore，因此部分 CAN 数据需要通过 IPC 核间通信机制转发到 Acore。架构保证传输可靠性，转发机制实现数据正确性检测、丢包检测和传输超时检测等机制。此外，还需要规避 MCU 侧高频转发小数据块导致 CPU 占用率过高，造成 MCU 实时性降低等性能问题。

S600 CAN 转发方案的核心流程如下：
- 首先通过 MCU 侧 CAN2IPC 模块将 CAN 通道映射到对应 IPC 通道，然后通过 Acore 侧 CANHAL 模块将 IPC 通道反映射为虚拟 CAN 设备通道。最后用户通过 CANHAL 提供的 API 接口获取虚拟 CAN 设备中的数据。其中，CAN2IPC 模块为 MCU 侧服务，CANHAL 模块为 Acore 侧提供给应用程序的动态库。
- CAN 采用中断的方式接收数据，当接收到数据之后调用 CAN2IPC 模块，CAN2IPC 模块将 MCU 侧 CAN 数据，按照指定传输协议进行打包，然后通过 IPC 核间通信转发到 Acore。Ipc instance 0和 Ipc instance 4分配给 can 使用，默认使能 can1-can10, can1-can10与 IPC 对应关系如下表：

|             | Ipc_ShmCfgInstances | channel |
|-------------|---------------------|---------|
| can0        | 0                   | -       |
| can1        | 0                   | 1       |
| can2        | 0                   | 2       |
| can3        | 0                   | 3       |
| can4        | 4                   | 4       |
| can5        | 0                   | 4       |
| can6        | 4                   | 0       |
| can7        | 4                   | 1       |
| can8        | 4                   | 2       |
| can9        | 4                   | 3       |
| can10       | 4                   | 5       |
- CANHAL 模块获取来自 MCU 侧的 IPC 数据，按照指定的传输协议解析数据，并支持业务软件通过 API 获取原始 CAN 帧。
</DocScope>

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/mcu_can.png" alt="Acore与MCU之间透传CAN数据架构图" style={{ width: '100%' }} />

数据流如上图所示：
- 外设数据通过 CAN 的 PHY 和控制器器件被 MCU 域 CAN 驱动接收后，CAN 驱动将数据上报并缓存在 hobot CANIF 模块。
- 满足合包个数或超时时间,调用 CAN2IPC 模块，按照可靠传输协议进行打包，然后通过 IPC 核间通信机制转发给 Acore。
- CANHAL 模块获取来自 MCU 侧的 IPC 数据，按照指定的传输协议解析数据，Acore 应用程序通过 CANHAL Lib 库提供的 API 获取 CAN 帧。

方案特性说明：
- 支持数据透传正确性校验。
- 支持数据透传丢包检测。
- 支持传输超时检测。MCU 侧 CAN2IPC 转发数据时将数据包打上 MCU 侧的时间戳，Acore CANHAL 接收到数据后会读取 Acore 的时间戳，如果传输超时会报警。注意，需要提前启动时间同步完成 MCU RTC 时间和 Acore 网卡 phc0的时间同步。
- 支持多个 CAN 通道并行传输。MCU 侧多个 CAN 控制器的数据可同时被转发给 Acore，Acore 应用程序通过 CANHAL 从不同通道号读出 CAN 数据。
- 由于 CANHAL 底层通过 ipc 核间通信进行传输，而 ipc 目前不支持多个进程或者线程读写同一个通道，因此 CANHAL 也不支持该特性。

## 硬件连接说明
<DocScope products="RDK S100">
- CAN 物理层的形式主要分为闭环总线及开环总线网络两种，一个适合于高速通讯，一个适合于远距离通讯；**S100的 sample 默认采用闭环总线网络架构**。

- CAN 总线的引脚位于 S100的 MCU 扩展板上，引出了5路 CAN 接口，连接器分别对应了5个绿色的螺丝式的3 PIN 连接器。1 PIN（三角标志）为 GND，中间 PIN 为 CAN_L，剩下的为 CAN_H。
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/mcu_can_phy.png" alt="MCU CAN物理图示" style={{ width: '100%' }} />
- MCU 小板通过2pin 跳帽的形式来选择是否在 CAN_H 和 CAN_L 之间接入120欧姆电阻；当插入跳帽时，接入电阻，适用于闭环网络所需的终端匹配阻抗‌；移除跳帽则断开终端电阻，适用于开环网络或中继节点场景‌。
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/mcu_can_sche.png" alt="MCU CAN简笔图示" style={{ width: '100%' }} />

CAN 闭环网络使用两个120欧姆电阻是 CAN 总线的标准配置，以下以 S100举例，如何正确接入电阻：
:::info 提示
整体而言，开环网络配置不需要接入120欧姆电阻，而闭环网络配置总共需要插入**两个**120欧姆电阻；
:::
- 在使用开环网络时，确保 CAN_H 与 CAN_L 线路正确连接，所用到的 CAN 不要插入跳线帽(在网络中不接入120欧姆电阻)；
- 若将 S100的 CAN5和 CAN6连接组成双节点内部闭环网络，确保 CAN_H 与 CAN_L 线路正确连接，还需要在 CAN5和 CAN6接线端子后面的插针插入跳帽(在网络中插入两个120欧姆电阻)；
- 若将 S100的 CAN5~CAN9连接组成多节点内部闭环网络，确保 CAN_H 与 CAN_L 线路正确连接，还需要插入两个跳线帽，任意选择两个，严禁插入超过2个跳线帽，以免出现不可预测的问题；
- 若将 S100的 CAN5~CAN9中的任意一个控制器和其它 CAN 设备组成外部闭环网络，确保 CAN_H 与 CAN_L 线路正确连接外，还需要在 RDK 的 CAN 控制器的接线端子后面的插针插入跳帽，并在网络中其它设备端接入一个120Ω电阻；
</DocScope>
<DocScope products="RDK S600">
- CAN 物理层的形式主要分为闭环总线及开环总线网络两种，一个适合于高速通讯，一个适合于远距离通讯；**S600的 sample 默认采用闭环总线网络架构**。

- CAN 总线的引脚 S600共引出10路 can，其中在 MCU 扩展板，引出了5路 CAN 接口，连接器分别对应了5个绿色的螺丝式的3 PIN 连接器。每个 pin 脚的作用可以查看 mcu 子板的背面。在底板上，也引出了5路 CAN 接口，使用 BP 连接器引出。
- MCU 小板通过拨动拨码开关，来选择是否在 CAN_H 和 CAN_L 之间接入120欧姆电阻；当拨码开关波动到 ON 端，表示接入电阻，适用于闭环网络所需的终端匹配阻抗‌；当拨码开关波动到数字编码端，表示断开电阻，适用于开环网络或中继节点场景‌。
- MCU 扩展版上的 CAN 与拨码开关:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/02_S600/09_MCU_CAN/mcu.png" alt="MCU CAN物理图示" style={{ width: '100%' }} />

- CAN 与拨码开关的对应关系：

|             | DPI num |             | DPI num |
|-------------|---------|-------------|---------|
| can1        | 1       | can4        | 4       |
| can2        | 2       | can10       | 5       |
| can3        | 3       |

- S600底板上的 CAN 与拨码开关:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/02_S600/09_MCU_CAN/Baseboard.png" alt="MCU CAN物理图示" style={{ width: '100%' }} />

- 底板上 J16为 can 在的位置， 信号名 J16从上到下如下：

| Signal name |
|-------------|
| GND         |
| CAN5_H      |
| CAN5_L      |
| CAN6_H      |
| CAN6_L      |
| GND         |
| CAN7_H      |
| CAN7_L      |
| CAN8_H      |
| CAN8_L      |
| CAN9_H      |
| CAN9_L      |

- 底板拨码开关在底板背面
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/02_S600/09_MCU_CAN/baseboard_dpi_switch.png" alt="MCU CAN物理图示" style={{ width: '100%' }} />
- CAN 与拨码开关的对应关系：

|             | DPI num |             | DPI num |
|-------------|---------|-------------|---------|
| can5        | 1       | can8        | 4       |
| can6        | 2       | can9        | 5       |
| can7        | 3       |

CAN 闭环网络使用两个120欧姆电阻是 CAN 总线的标准配置，以下以 S600举例，如何正确接入电阻：
- 在使用开环网络时，确保 CAN_H 与 CAN_L 线路正确连接，所用到的 CAN(在网络中不接入120欧姆电阻)；
- 若将 S600的 CAN1和 CAN2连接组成双节点内部闭环网络，确保 CAN_H 与 CAN_L 线路正确连接，还需要将 CAN1和 CAN2对应拨码开关波动到 ON 端(在网络中插入两个120欧姆电阻)；
- 若将 S600的 CAN1~CAN10中的任意一个控制器和其它 CAN 设备组成外部闭环网络，确保 CAN_H 与 CAN_L 线路正确连接外，还需要将 RDK 的 CAN 控制器对应的莫玛开源波动到 ON 端，并在网络中其它设备端接入一个120Ω电阻；
</DocScope>

## CAN Filter 配置

标准帧的 filter 最多可配置128个，扩展帧的 filter 最多可配置64个，可选择的 filter 类型如下：
- ONE_ID_FILTER：指定 ID 并可配置 MASK 来忽略 ID 中的哪些 bit 进行过滤，
- RANGE_ID_FILTER：按照 ID 范围进行过滤，
- TWO_ID_FILTER：指定两个 ID 进行过滤。

### 过滤器的识别
过滤器类型通过检查 u32HwFilterCode 的最高2位来确定：
- 0b00: ONE_ID_FILTER
- 0b01: RANGE_ID_FILTER
- 0b10: TWO_ID_FILTER

```c
/**
 * @struct Can_HwFilterType
 * @brief Can Hardware Filter
 * @NO{S01E03C01}
 */
typedef struct Can_HwFilterType
{
    const uint32 u32HwFilterCode;   /**< @brief Specifies (together with the filter mask) the identifiers range that passes the hardware filter. */
    const uint32 u32HwFilterMask;   /**< @brief Describes a mask for hardware-based filtering of CAN identifiers. */
}Can_HwFilterType;

```

- 配置举例：
    - 这是 CAN 7 的过滤器配置，拥有两个过滤器
    - 过滤器0的第一个元素的高2位为01，属于范围过滤方式
    - 扩展帧和标准帧的过滤相互独立，互不影响
    - 标准帧的所有过滤器，如下面的例子过滤器0和过滤1为"或"关系，即如果至少有一个过滤元件满足匹配标准，则 CAN 消息内容将被传输到增强型 RX FIFO 存储器
    - 同理，扩展帧的所有过滤器，如下面的例子过滤器2和过滤3为"或"关系，即如果至少有一个过滤元件满足匹配标准，则 CAN 消息内容将被传输到增强型 RX FIFO 存储器

```c
// Config/McalCdd/gen_s100_sip_B_mcu1/Can/src/Can_PBcfg.c
static const Can_HwFilterType Can_aHwFilter_Object7[4U]=
{
    { /* Standard frame configuration */
        (uint32)0x400007ffU,    // 标准帧配置：接收id为0x0~0x7ff的消息
        (uint32)0x00000000U
    },
    { /* Standard frame configuration */
        (uint32)0x400007ffU,   // 标准帧配置：接收id为0x600~0x7ff的消息
        (uint32)0x00000600U
    },
    { /* Extended frame configuration */
        (uint32)0x5fffffffU,   // 扩展帧配置：接收id为0x0~0x1fffffff的消息
        (uint32)0x00000000U
    },
    { /* Extended frame configuration */
        (uint32)0x5fffffffU,   // 扩展帧配置：接收id为0x600~0x1fffffff的消息
        (uint32)0x00000600U
    }
};
```

### ONE_ID_FILTER（单 ID 过滤方式）

这是最常见的过滤器类型，使用过滤器代码和掩码进行过滤,伪代码如下：
```c
if ((Received_ID & Filter_Mask) == (Filter_Code & Filter_Mask))
    // 接收该消息
else
    // 丢弃该消
```

以标准帧过滤器0配置为例，代码如下：
```c
// Config/McalCdd/gen_s100_sip_B_mcu1/Can/src/Can_PBcfg.c
static const Can_HwFilterType Can_aHwFilter_Object7[4U]=
{
    { /* Standard frame configuration */
        (uint32)0x00000400U,  // 只接收id = 0x400&0x7ff = 0x400 消息
        (uint32)0x000007ffU
    },
    {  /* Standard frame configuration */
        (uint32)0x400007ffU,  // 范围过滤方式，支持混用
        (uint32)0x00000600U
    }
    { /* Extended frame configuration */
        (uint32)0x5fffffffU,   // 扩展帧配置：接收id为0x0~0x1fffffff的消息
        (uint32)0x00000000U
    },
    { /* Extended frame configuration */
        (uint32)0x5fffffffU,   // 扩展帧配置：接收id为0x600~0x1fffffff的消息
        (uint32)0x00000600U
    }
};
```


### RANGE_ID_FILTER（范围过滤方式）

在这种模式下，使用范围过滤逻辑：

```c
if (id1 <= Received_ID <= id2)
    // 接收该消息
else
    // 丢弃该消息
```
这也是 S100 MCU 默认的过滤方式，也是最常用的过滤方式;举例代码如下：
```c
// Config/McalCdd/gen_s100_sip_B_mcu1/Can/src/Can_PBcfg.c
static const Can_HwFilterType Can_aHwFilter_Object7[4U]=
{
    { /* Standard frame configuration */
        (uint32)0x00000400U,  // 只接收id = 0x400&0x7ff = 0x400 消息
        (uint32)0x000007ffU
    },
    {  /* Standard frame configuration */
        (uint32)0x400007ffU,  // 范围过滤方式，支持混用
        (uint32)0x00000600U
    }
    { /* Extended frame configuration */
        (uint32)0x5fffffffU,   // 扩展帧配置：接收id为0x0~0x1fffffff的消息
        (uint32)0x00000000U
    },
    { /* Extended frame configuration */
        (uint32)0x5fffffffU,   // 扩展帧配置：接收id为0x600~0x1fffffff的消息
        (uint32)0x00000600U
    }
};
```

### TWO_ID_FILTER（双 ID 过滤方式）

这种类型允许指定两个独立的 ID 进行匹配：
- id1: 第一个匹配 ID
- id2: 第二个匹配 ID

```c
if (Received_ID == id1 || Received_ID == id2)
    // 接收该消息
else
    // 丢弃该消息
```

以标准帧过滤器0配置为例，代码如下：
```c
// Config/McalCdd/gen_s100_sip_B_mcu1/Can/src/Can_PBcfg.c
static const Can_HwFilterType Can_aHwFilter_Object7[4U]=
{
    { /* Standard frame configuration */
        (uint32)0x80000404U,// 只接收id为404的消息
        (uint32)0x00000303U // 只接收id为303的消息
    },
    { /* Standard frame configuration */
        (uint32)0x400007ffU,  // 范围过滤方式，支持混用
        (uint32)0x00000600U
    }
    { /* Extended frame configuration */
        (uint32)0x5fffffffU,   // 扩展帧配置：接收id为0x0~0x1fffffff的消息
        (uint32)0x00000000U
    },
    { /* Extended frame configuration */
        (uint32)0x5fffffffU,   // 扩展帧配置：接收id为0x600~0x1fffffff的消息
        (uint32)0x00000600U
    }
};
```

:::tip
1. RDK S100软硬件支持收发扩展帧和标准帧，而不需要修改配置
2. RDK S100软硬件支持对扩展帧和标准帧分别过滤
3. 注意 id 的长度配置，超出规定长度将发生截断，扩展帧的 id 长度最高为29位，即最大为0x1FFFFFFF，标准帧的 id 长度最高为11位，即最大为0x7FF
4. RDK S600软件目前还不支持扩展帧
:::


## 波特率配置

CAN 的标称位时（Nominal bit timing）可以分为四个段：
1. 同步段(sync_seg)‌：用于节点间的时钟同步，所有节点在此段内检测信号边沿。其长度固定为1个时间单位(TQ)
2. 传播段(prop_seg)‌：补偿信号在物理线路上的传播延迟。其长度可调整，用于确保信号在物理介质上的传输时间
3. 相位缓冲段1(phase_seg1)‌：用于调整相位误差，确保采样点的准确性，可以扩展重同步
4. 相位缓冲段2(phase_seg2)‌：同样用于调整相位误差，但可以缩短
这些段的总和决定了 CAN 的总位时间，通过调整这些段的长度，可以配置不同的波特率。
此外还有以下几个重要概念：
1. 同步跳转宽度(SJW，synchronization jump width)：CAN 总线同步机制中允许调整相位缓冲段的最大时间量，在 硬同步 和 重同步 过程中补偿节点间的时钟偏差，确保采样点对齐。
2. 延迟补偿偏移量(Transceiver Delay Compensation Offset)：仅 CAN FD 支持，用于解决数据段高速传输时的物理层时序偏移用于补偿 CAN FD 模式下 收发器环路延迟 和 信号传播时间 的固定修正值
3. 采样点：CAN 控制器在位时间内对总线电平进行采样的精确时刻，用于判定位的逻辑值（显性0或隐性1）

### 取值范围和公式计算
1. 采样点计算：（sync_seg + prop_seg + phase_seg1）/（sync_seg + prop_seg + phase_seg1 + phase_seg2）×100%
2. 同步段固定一个 tq
3. prop_seg + phase_seg1>phase_seg2
4. SJW ≤ min(Phase_Seg1, Phase_Seg2)
5. 当配置5M 及以上波特率时，需配置补偿参数，补偿参数计算公式如下：
  - TDC offset = (PropSeg + Seg1 + 1) * Fd Prescaler

### 配置仲裁段1M 数据段5M 实例说明
#### 1. 基础参数确认
- CAN 时钟频率（CAN_CLK）: 40 MHz
- 目标波特率（Bit Rate）: 5 Mbps
- 预分频值（Prescaler）: 1（不分频）
- 单 Bit 时间内的 TQ 总数: TQ = CAN_CLK/(Bit Rate×Prescaler)=40MHz/5Mbps×1=8TQ
- 时间量子：Tq time = 1 / (40M / prescaler) = 1/40M = 25ns

#### 2. 时间量子（TQ）分配
Sync_Seg（固定段）: 1 TQ（同步段不可修改）

剩余 TQ 分配: Prop_Seg+Phase_Seg1+Phase_Seg2=8−1=7TQ

此处取 Prop_Seg=1，Phase_Seg1=4，Phase_Seg2=2，则采样点= (Sync_Seg+Prop_Seg+Phase_Seg1)/Total TQ x 100% = (1+4+1)/8 x 100%= 75%

#### 3. 延迟补偿偏移量（Transceiver Delay Compensation Offset）

Offset=(Prop_Seg+Phase_Seg1+1)×Prescaler = (1+4+1)×1=6TQ

**SJW（Synchronization Jump Width）设置**：

SJW 必须满足: SJW≤min⁡(Phase_Seg1,Phase_Seg2)=min⁡(4,2)=2

因此，配置 SJW = 2 TQ。

#### 4. 终配置参数

根据上述的方式同理可以计算到1M 情况下的参数，由于部分寄存器获取到的值会自动加一，所以实际写入的值要减一，具体可看下表

- 5M 75%数据段配置


| 参数名               | 值（TQ 或时间） | 需写入寄存器的值 |
|----------------------|----------------|------------------|
| Sync_Seg             | 1 TQ           | 无需写入，固定为1 |
| Prop_Seg             | 1 TQ           | 1                |
| Phase_Seg1           | 4 TQ           | 3                |
| Phase_Seg2           | 2 TQ           | 1                |
| Prescaler            | 1              | 0                |
| SJW                  | 2 TQ           | 1                |
| 延迟补偿偏移量       | 6 TQ            | 6                |

- 1M 80%仲裁段配置

| 参数名        | 值（TQ 或时间） | 需写入寄存器的值 |
|---------------|----------------|------------------|
| Sync_Seg      | 1 TQ           | 无需写入，固定为1  |
| Prop_Seg      | 7 TQ           | 6                |
| Phase_Seg1    | 8 TQ           | 7                |
| Phase_Seg2    | 4 TQ           | 3                |
| Prescaler     | 2              | 1                |
| SJW           | 2 TQ           | 1                |


#### 5. 8M 的配置相对于5M 较为特殊，使用60%的采样

| 参数名          | 值（TQ 或时间） | 需写入寄存器的值 |
|-----------------|----------------|------------------|
| Sync_Seg        | 1 TQ           | 无需写入，固定为1  |
| Prop_Seg        | 1 TQ           | 1                |
| Phase_Seg1      | 1 TQ           | 0                |
| Phase_Seg2      | 2 TQ           | 1                |
| Prescaler       | 1              | 0                |
| SJW             | 1 TQ           | 0                |
| 延迟补偿偏移量  | 3 TQ           | 3                |

#### 6. 将结果更新到配置文件中
配置文件路径:
```
${mcu_sdk}/Config/McalCdd/gen_s100_sip_B_mcu1/Can/src/Can_PBcfg.c
```

配置文件中存在两个波特率相关的重要结构体，下面以 CAN5为例分别说明：
- Can_aControllerConfig：用于配置 CAN 控制器。每个控制器都有一个对应的配置项
```c
static const Can_ControllerConfigType Can_aControllerConfig[CAN_CONTROLLER_CONFIG_COUNT]=
{
    ...
 {
        /* Controller ID configured */
        (uint8)5U,
        /* Hw controller Offset */
        (uint8)5U,
        /* Base Address */
        FLEXCAN_5_BASE,
        /* Activation or not */
        (boolean)TRUE,
        /* Bus Off uses polling or not */
        (boolean)TRUE,
        /* Global mask of Legacy FIFO (not used) */
        (uint32)0xFFFFFFFFU,
        /* Acceptance Mode of Legacy FIFO (not used)*/
        CAN_LEGACY_FIFO_FORMAT_A,
        /* Legacy FIFO Warning Notification */
        NULL_PTR,
        /* Legacy FIFO Overflow Notification */
        NULL_PTR,
        /* Enhanced FIFO Overflow Notification */
        NULL_PTR,
        /* Error interrupt enable or not */
        (boolean)TRUE,
        /* Can Error Notification */
        Can_ErrorNotif,
        /* CanFd Error Notification */
        CanFd_ErrorNotif,
        /* Default Baudrate ID, 4--1M+5M 5--1M+8M */
        (uint16)4U,
         /* Baudrate config Count*/
        (uint16)6U,
        /* Pointer to baudrate config Structure */
        Can_aBaudrateConfig_Ctrl5,
        /* Pointer to LLD structure to IP config */
        &Flexcan_aCtrlConfigPB[5U],
        /* HwObject count */
        (uint8)9U,
        /* Point to group of HwObject that referenced to the current Controller */
        Can_apHwObject_Ctrl5
    },
    ...
}
```
- Can_aBaudrateConfig_Ctrl5：用于定义特定控制器的波特率配置，这是一个大数组，上述步骤中生成的参数均写到这个数组中
```c
static const Can_BaudrateConfigType Can_aBaudrateConfig_Ctrl5[6U]=
{
    {
        /*Enhance CBT support */
        (boolean)TRUE,
        /* Tx Bit Rate Switch or not */
        (boolean)TRUE,
        /* CanFd support */
        (boolean)TRUE,
        /* Nominal bit rate */ //仲裁段配置
        {
            (uint8)6U, // 传播段(prop_seg)‌
            (uint8)7U, // 相位缓冲段1(phase_seg1)‌
            (uint8)3U, // 相位缓冲段2(phase_seg2)‌
            (uint16)3U, // 预分频值（Prescaler）
            (uint8)1U //同步跳转宽度(SJW)
        },
        /* Data bit rate */ //数据段配置
        {
            (uint8)3U,
            (uint8)3U,
            (uint8)1U,
            (uint16)3U,
            (uint8)1U
        },

        /* Tx Arbitration Start delay */
        (uint8)12U, // 延迟补偿偏移量(Transceiver Delay Compensation Offset)
        /* Tranceiver Delay Disable */
        (boolean)FALSE,
        (uint8)0U
    },
    ...
```

RDK S100默认配置了6组参数，用户可以通过修改 Can_aControllerConfig 中的 u16DefaultBaudrateID 成员值来选择波特率,下表为索引对应的波特率参数：
| u16DefaultBaudrateID | 仲裁段频率 | 数据段频率 |
|----------------------|------------|------------|
| 0                    | 500K       | 1M         |
| 1                    | 500K       | 2M         |
| 2                    | 1M         | 2M         |
| 3                    | 1M         | 5M（短距离:小于50m） |
| 4                    | 1M         | 5M（长距离:大于50m） |
| 5                    | 1M         | 8M         |


## 多包合并配置

CAN 驱动支持接收多包合并数据传输功能，当 CAN 驱动接收到一定阈值的数据包时，会将它们合并，通过 IPC 从 MCU 传输到 Acore。目的是为了减少 IPC 传输频率，提高传输效率。在此基础上提供了合包数量和超时时间两个可配参数。
1. 合包数量：用于设置 CAN 驱动接收到多少包之后，进行一次 IPC 传输， 默认为1。
2. 超时时间：用于当一定时间内还没有收到所设阈值的数据包时，进行一次强制传输，默认为1000us。

### 配置方式

进入 MCU 串口配置方式如下：
```c
D-Robotics:/$ Can
Can_Set_Merge_Time    CMD   --------  Set the CAN packet merge timeout in ...
Can_Set_Merge_Num     CMD   --------  Set the number of CAN packages to me...

D-Robotics:/$ Can_Set_Merge_Num 8   // 设置合包数量为8

D-Robotics:/$ Can_Set_Merge_Time 100  // 设置超时时间为100us
```
acore 侧也支持多包合并传输功能，下面只简单介绍相关数据结构，具体可以使用[应用sample](#应用sample)中提供的测试用例进行修改验证。
```c
#define CAN_FRAME_NUM (1)   // Acore侧表示合并传输数据包的数量
struct pack_info pack = { 0 };
pack.data_num = CAN_FRAME_NUM;
```

## 应用 sample

### 使用指南

:::info 提示

执行 sample 之前需要先开启 MCU1，MCU1 开启的流程参考[开启 MCU](./01_basic_information.md#mcu1启动关闭流程)。

:::

Acore canhal 使用可参考 sample 源码目录：source/hobot-io-samples/debian/app/Can，可以在 S100的/app/Can 目录下直接 make 编译使用。

以多路透传为例，目录结构如下：
```bash
$ tree /app/Can/can_multi_ch
.
├── Makefile // 主编译脚本
├── config  // 配置文件目录
│   ├── channels.json // 通道映射配置文件
│   ├── ipcf_channel.json // IPCF通道映射配置文件
│   └── nodes.json // Can虚拟设备映射配置文件
├── main.cpp // 主程序
├── readme.md // 说明文件
├── can_multich_log.h // 日志头文件
└── run.sh // 运行脚本

```
json 文件配置主要包括3个 json 配置文件：node.json、ipcf_channel.json、channels.json。目前为了支持多进程，各个进程都会去当前路径下的 config 目录下寻找这3个配置文件。

node.json 负责创建虚拟 CAN 设备节点给 CANHAL API 访问。关键配置选项包括：
- channel_id 字段指定该虚拟 CAN 设备从 ipc 配置文件 ipcf_channel.json 中哪一个节点获取数据。
- target 字段表示该虚拟 CAN 设备节点的名称，CANHAL API 通过该名称访问指定的节点。
- enable 字段表示该节点是否使能。

```json
{
  "nodes" : [
    {
      "id" : 0,
      "enable" : true,
      "mode_comment" : "value_table: R, W, RW",
      "mode" : "RW",
      "target" : "can6_ins0ch6",
      "clk_source" : "/dev/hrtc0",
      "io_channel" : {
        "device_type_comment" : "value_table: can, eth, ipcf, spi",
        "device_type" : "ipcf",
        "channel_id" : 0
      },
      "raw_protocol" : "built_1.0"
    },
    .....
    {
      "id" : 4,
      "enable" : true,
      "mode_comment" : "value_table: R, W, RW",
      "mode" : "RW",
      "target" : "can5_ins0ch4",
      "clk_source" : "/dev/hrtc0",
      "io_channel" : {
        "device_type_comment" : "value_table: can, eth, ipcf, spi",
        "device_type" : "ipcf",
        "channel_id" : 4
      },
      "raw_protocol" : "built_1.0"
    }
  ]
}
```
ipcf_channel.json 将 node.json 中用到的 ipc 节点映射到具体的 instance 和 channel。
```json
{
  "enable" : true,
  "libipcf_path" : "/usr/hobot/lib/libhbipcfhal.so.1",
  "channels" : [
    {
      "id" : 0,
      "channel" : {
        "name" : "can6_ins0ch6",
        "instance": 0,
        "channel": 6,
        "fifo_size": 64000,
        "fifo_type": 0,
        "pkg_size_max": 4096,
        "dev_path":"/dev/ipcdrv",
        "dev_name":"ipcdrv",
        "recv_timeout" : 4000
      }
    },
    ......
    {
      "id" : 4,
      "channel" : {
        "name" : "can5_ins0ch4",
        "instance": 0,
        "channel": 4,
        "fifo_size": 64000,
        "fifo_type": 0,
        "pkg_size_max": 4096,
        "dev_path":"/dev/ipcdrv",
        "dev_name":"ipcdrv",
        "recv_timeout" : 4000
      }
    }
  ]
}
```
channels.json 指定 ipc 配置文件，用户一般不需要更改。
```json
{
  "io_channels" : {
   "ipcf" : "./config/ipcf_channel.json"
 }
}
```

Acore 无法直接操作 CAN 外设，需要通过借助 Ipc 模块来中转数据，与外设通道的映射关系可以查阅 [MCU IPC使用指南](./../../07_Advanced_development/05_mcu_development/08_mcu_ipc.md) 中的 IPC 使用情况章节。


Acore 应用程序通过 CANHAL 获取 MCU 侧 CAN 帧的流程伪代码如下：

```c
void send_frame_data(void *arg)
{
    ... do
    {
        ret = canSendMsgFrame(test_params->target, &frame[0], &pack);
        if (ret > 0) { /* 发送成功 */
            send_count++;
            PRINT_DEBUG("Send length %d\n", ret);
            break;
        } else if (ret == -CAN_TRY_AGAIN && /* 由于IPC或者其他资源不足，重试 */
                   retry++ < MAX_RETRY) {
            usleep(2);
            continue;
        } else { /* 发送失败 */
            PRINT_ERR("Send failed after retries, exiting...\n");
            break;
        }
    }
    while (1)
        ;
}

void *recv_frame_data(void *arg)
{
    while (!exit_flag) {
        ret = canRecvMsgFrame(target, frame, &pack); // non blocking
        if (ret < 0) {
            if (ret == -CAN_TRY_AGAIN) { /* 由于IPC或者其他资源不足，重试 */
                PRINT_DEBUG("canRecvMsgFrame try again\n");
                continue;
            } else {
                PRINT_ERR("canRecvMsgFrame failed ret: %d\n", ret);
                gettimeofday(&current_time, NULL);
                double elapsed =
                        difftime(current_time.tv_sec, last_recv_time.tv_sec);
                if (elapsed > RECV_TIMEOUT) { /* 超时退出 */
                    PRINT_INFO(
                            "No data received for %d seconds. Exiting thread.\n",
                            RECV_TIMEOUT);
                    goto can_recv_exit;
                }
                continue;
            }
        }
    }
}

int main(int argc, char *argv[])
{
    ret = canInit();
    pthread_create(&send_thread, NULL, send_frame_data, &tx_params);
    pthread_create(&rx_threads[i], NULL, recv_frame_data, &rx_params[i])

            pthread_join(send_thread, NULL);
    pthread_join(rx_threads[i], NULL);
    canDeInit();
}
```

- 首先执行 canInit()完成初始化,然后创建发送线程和接收线程
- 发送线程调用 canSendMsgFrame()发送数据包，接收线程调用 canRecvMsgFrame()接收数据包，其中 target 参数为 json 文件中配置好的通道。
- pack 信息包含这一包数据的信息，包括 can 帧数量、mcu 侧的时间戳以及 acore 侧的 monotic 时间戳等信息。
- canhal 会从这一包 ipc 数据中解析出 can 帧，用户通过 frame 指针读取出所有 can 帧。
- 最后执行 canDeInit()释放资源。

:::tip
can 的接收和发送函数依赖 IPC 的资源，当传输速率过快时会出现资源耗尽的情况，此时可以进行降速和重传。
:::

### ACORE 侧实例说明

#### 简单的 can 收发 sample

##### 目录介绍
```
// /app/Can/can_send
.
├── Makefile // 主编译脚本
├── canhal_send.c // 发送一帧标准帧数据
└── config // 配置文件目录
    ├── channels.json  // 通道映射配置文件
    ├── ipcf_channel.json  // 通道映射配置文件
    └── nodes.json // 通道映射配置文件

// /app/Can/can_get
.
├── Makefile // 主编译脚本
├── canhal_get.c // while 1循环，接收数据
└── config // 配置文件目录
    ├── channels.json   // 通道映射配置文件
    ├── ipcf_channel.json  // 通道映射配置文件
    └── nodes.json  // 通道映射配置文件
```

##### 使用前提

这里仅给出一个简单的 sample，实际应用中需要根据实际需求进行修改。

使用前提：
- MCU1正常运行
- 硬件连接：使用 CAN 闭环总线网络，CAN5连接 CAN6，RDKS100上 CAN5和 CAN6需要在接线柱后面的2 PIN 引脚使用跳线帽或杜邦线短接， 以确保 CAN_H 和 CAN_L 之间接入120欧姆电阻， RDKS600上需要将 can5,can6对应的拨码开关，波到 ON 端，以确保 CAN_H 和 CAN_L 之间接入120欧姆电阻。
- 由于 can_send 和 can_get 都使用的 instance channel4(默认映射来自 CAN5的数据)，**由于 Ipc 单个 channel 只能被一个线程使用**，因此在互联测试的时候需要依据 [软件架构](./09_mcu_can.md#Software_architecture)中 can 与 instance channel 的对应关系来设置配置文件。例如针对 can6, S100上 intance 为0， channel 为6， S600上 instance 为4， channel 为0， 对应设置文件如下：

```json
{
  "enable" : true,
  "libipcf_path" : "/usr/hobot/lib/libhbipcfhal.so.1",
  "channels" : [
    {
      "id" : 0,
      "channel" : {
        "name" : "bypass",
        "instance": 0, // S100 为0  S600 为4
        "channel": 6, // S100 为6  S600 为0
        "fifo_size": 64000,
        "fifo_type": 0,
        "pkg_size_max": 4096,
        "dev_path":"/dev/ipcdrv",
        "dev_name":"ipcdrv",
        "recv_timeout" : 4000
      }
    }
  ]
}
```

##### 使用方式
1. 分别编译 can_send 和 can_get 两个 sample
2. 进入 can_get 目录执行以下命令
```bash
./canhal_get bypass &
```
3. 进入 can_send 目录执行以下命令
```bash
root@ubuntu:/app/Can/can_send# ./canhal_send bypass 6
[CANHAL][INFO][ipcf_dev.cpp:32][2025-2-20 21:43:47.522]:the path of ipcf plugin is /usr/hobot/lib/libhbipcfhal.so.1.
group name is bypass
[CANHAL][INFO][comps_mgr.cpp:158][2025-2-20 21:43:47.523]:channel constructor Register dev: ipcf success.
[CANHAL][INFO][node.cpp:17][2025-2-20 21:43:47.523]:channel id is 0
[INFO][hb_ipcf_hal.cpp:282] [channel] bypass [ins] 0 [id] 6 init success.
[INFO][hb_ipcf_hal.cpp:333] [channel] bypass [ins] 0 [id] 6 config success.
[CANHAL][INFO][node.cpp:39][2025-2-20 21:43:47.523]:io_channel init successful
[CANHAL][INFO][node.cpp:44][2025-2-20 21:43:47.523]:protocol is built_1.0
Send end, send package total: 1 frame total: 1
[CANHAL][INFO][can_hal_impl.cpp:120][2025-2-20 21:43:47.524]:Deinit node: bypass
[INFO][hb_ipcf_hal.cpp:553] [channel] bypass [ins] 0 [id] 6 deinit success.
[CANHAL][INFO][can_hal_impl.cpp:128][2025-2-20 21:43:47.524]:Deinit node: bypass
[CANHAL][INFO][channel_ctor.cpp:47][2025-2-20 21:43:47.524]:Deinit device: ipcf
*********************************************
[bypass] [pack]length: 1 soc_ts: 1186831 mcu_ts: 1191955
[canhal_get] [bypass] [canframe] canid is 0x00000131 timestamp is 0x123013 data is:
 0x0  0xaa  0xaa  0xaa  0xaa  0xaa  0xaa  0xfc
```
4. 出现如下打印则测试成功：
```
[canhal_get] [bypass] [canframe] canid is 0x00000131 timestamp is 0x10b221 data is:
 0x0  0xaa  0xaa  0xaa  0xaa  0xaa  0xaa  0xfc
```


#### 多通道传输

##### 目录介绍
```bash
// /app/Can/can_multi_ch
.
├── Makefile // 主编译脚本
├── config  // 配置文件目录
│   ├── channels.json // 通道映射配置文件
│   ├── ipcf_channel.json // IPCF通道映射配置文件
│   └── nodes.json // Can虚拟设备映射配置文件
├── main.cpp // 主程序
├── readme.md // 说明文件
├── can_multich_log.h // 日志头文件
└── run.sh // 运行脚本
```

本程序实现 CAN 总线多通道数据发送与接收：
<DocScope products="RDK S100">

- **硬件连接**：使用 CAN 闭环总线网络，Can6连接 Can7，Can8连接 Can9，Can5单独通道不接，CAN_H 和 CAN_L 之间接入120欧姆电阻（把所用到的 CAN 总线的接线柱后面的2 PIN 引脚使用跳线帽或杜邦线短接）。
- **发送线程**：为每个通道创建独立线程发送数据，当使用 CANFD 时，数据包含计数器和时间戳，当使用经典 CAN 时，数据为全0x55。
- **接收线程**：为每个通道创建独立线程接收数据并验证数据正确性。

</DocScope>
<DocScope products="RDK S600">

- **硬件连接**：使用 CAN 闭环总线网络，建议两两互联进行回环测试（例如 Can1连接 Can2，Can3连接 Can4，Can5连接 Can6，Can7连接 Can8，Can9连接 Can10），并将参与组网的 CAN 通道对应拨码开关拨到 ON 端，使 CAN_H 和 CAN_L 之间接入120欧姆电阻。
- **发送线程**：为每个通道创建独立线程发送数据，当使用 CANFD 时，数据包含计数器和时间戳，当使用经典 CAN 时，数据为全0x55。
- **接收线程**：为每个通道创建独立线程接收数据并验证数据正确性。

</DocScope>


<DocScope products="RDK S100">
发送策略：
- 相隔固定时间通过 Can 发送数据，可通过修改延时调整发送频率，频率过高可能会出现丢包。
- 目标通道：按照配置文件中启用的 CAN 通道广播数据（S100默认 CAN5-CAN9）
</DocScope>
<DocScope products="RDK S600">
发送策略：
- 相隔固定时间通过 Can 发送数据，可通过修改延时调整发送频率，频率过高可能会出现丢包。
- 目标通道：按照配置文件中启用的 CAN 通道广播数据（S600默认 CAN1-CAN10）
</DocScope>

接收策略:
- 被动接收数据，验证接收数据的计数器和计算传输时延
- 超过100秒未收到数据则退出程序（代码中定义的超时时间）

##### 依赖
- `pthread`: 线程库
- `hobot_can_hal `: CAN 接口库
- `hb_ipcf_hal`: IPCF 接口库
- `alog`: Android 日志库


##### 通道映射关系


<DocScope products="RDK S100">

| 通道   | 对应线程名称 | 设备名           |
|--------|--------------|------------------|
| CAN5   | CAN5RX       | "can5_ins0ch4"   |
| CAN6   | CAN6RX       | "can6_ins0ch6"   |
| CAN7   | CAN7RX       | "can7_ins4ch7"   |
| CAN8   | CAN8RX       | "can8_ins4ch2"   |
| CAN9   | CAN9RX       | "can9_ins0ch3"   |
</DocScope>
<DocScope products="RDK S600">

| 通道   | 对应线程名称 | 设备名 |
|--------|--------------|--------|
| CAN1   | CAN1RX       | "can1" |
| CAN2   | CAN2RX       | "can2" |
| CAN3   | CAN3RX       | "can3" |
| CAN4   | CAN4RX       | "can4" |
| CAN5   | CAN5RX       | "can5" |
| CAN6   | CAN6RX       | "can6" |
| CAN7   | CAN7RX       | "can7" |
| CAN8   | CAN8RX       | "can8" |
| CAN9   | CAN9RX       | "can9" |
| CAN10  | CAN10RX      | "can10"|

> 说明：`can_multi_ch/config/ipcf_channel.json` 中默认 IPC 映射为
> CAN1→'ins0/ch1'，CAN2→'ins0/ch2'，CAN3→'ins0/ch3'，CAN4→'ins4/ch4'，CAN5→'ins0/ch4'，
> CAN6→'ins4/ch0'，CAN7→'ins4/ch1'，CAN8→'ins4/ch2'，CAN9→'ins4/ch3'，CAN10→'ins4/ch5'。
</DocScope>


##### DEBUG 开关

```C
// can_multich_log.h
#define VERBOSE 0 //修改为1时打印调试信息
```
也可以使用 logcat 查看更多日志

##### 发送端

<DocScope products="RDK S100">

发送策略：
- 相隔固定时间通过 Can 发送数据，可通过修改延时调整发送频率，频率过高可能会出现丢包。
- 数据内容：通过 CANFD 发送扩展帧(64bytes)的数据。
- 目标通道：按照配置文件中启用的 CAN 通道发送数据（S100默认 CAN5-CAN9）

</DocScope>
<DocScope products="RDK S600">
发送策略：
- 相隔固定时间通过 Can 发送数据，可通过修改延时调整发送频率，频率过高可能会出现丢包。
- 数据内容：通过 CANFD 发送扩展帧(64bytes)的数据。
- 目标通道：按照配置文件中启用的 CAN 通道发送数据（S600默认 CAN1-CAN10）
</DocScope>

##### 接收端

接收策略:
- 被动接收数据，验证接收数据的计数器和计算传输时延
- 超过100秒未收到数据则退出程序（代码中定义的超时时间）

##### 注意事项
- 程序退出时会自动释放 CAN 设备资源
- 按 Ctrl+C 可中断程序运行
- 支持命令行参数配置发送帧数、CAN 帧类型和数据长度

##### 编译命令
```bash
make # 编译
make clean # 清除编译文件
```
##### 命令行参数
程序支持以下命令行参数来自定义运行参数：
```bash
-n <can_tran_num>                 指定要发送的帧数 (默认: 1)
-t <can_type>                     指定CAN帧类型 (0: 标准帧, 1: 扩展帧, 2: FD标准帧, 3: FD扩展帧) (默认: 2)
-l <can_length>                   指定CAN帧长度 (8: 8字节, 64: 64字节) (默认: 64)
-h, --help                        显示帮助信息
```

##### 运行命令
```bash
export CAN_HAL_DEBUG_LEVEL=6 //  设置CAN接口库调试等级，不打印任何日志;打印较多的情况下会影响发送频率
./can_multi_ch
```
或者使用参数运行：
```bash
./can_multi_ch -t 2 -l 64 -n 5
```

##### 日志分析

S600平台可通过同样的 `can_multi_ch` 测试流程查看日志信息，日志字段含义与 S100一致，仅通道与 IPC 映射按 S600配置解析。

以运行 `./can_multi_ch -t 2 -l 64 -n 5 `为例:

- 当前默认参数配置:
    ```bash
    [param_config_display 389] [INFO]: Current parameter configuration:
    [param_config_display 390] [INFO]:   CAN Transmit Number: 1
    [param_config_display 391] [INFO]:   CAN Type: CAN_FD_STANDARD
    [param_config_display 392] [INFO]:   CAN Length: 64
    ```

- 使用的硬件配置，CAN 控制器，IPC 的实例和通道
    ```
    group name is can6_ins0ch6
    group name is can7_ins4ch7
    group name is can8_ins4ch2
    group name is can9_ins0ch3
    group name is can5_ins0ch4
    ```

- 使用的硬件配置，CAN 控制器，IPC 的实例和通道
    ```
    group name is can6_ins0ch6
    group name is can7_ins4ch7
    group name is can8_ins4ch2
    group name is can9_ins0ch3
    group name is can5_ins0ch4
    ```

- 通道初始化信息
    ```bash
    [INFO][hb_ipcf_hal.cpp:282] [channel] can6_ins0ch6 [ins] 0 [id] 6 init success.
    [INFO][hb_ipcf_hal.cpp:333] [channel] can6_ins0ch6 [ins] 0 [id] 6 config success.
    [INFO][hb_ipcf_hal.cpp:282] [channel] can7_ins4ch7 [ins] 0 [id] 7 init success.
    [INFO][hb_ipcf_hal.cpp:333] [channel] can7_ins4ch7 [ins] 0 [id] 7 config success.
    [INFO][hb_ipcf_hal.cpp:282] [channel] can8_ins4ch2 [ins] 0 [id] 2 init success.
    [INFO][hb_ipcf_hal.cpp:333] [channel] can8_ins4ch2 [ins] 0 [id] 2 config success.
    [INFO][hb_ipcf_hal.cpp:282] [channel] can9_ins0ch3 [ins] 0 [id] 3 init success.
    [INFO][hb_ipcf_hal.cpp:333] [channel] can9_ins0ch3 [ins] 0 [id] 3 config success.
    [INFO][hb_ipcf_hal.cpp:282] [channel] can5_ins0ch4 [ins] 0 [id] 4 init success.
    [INFO][hb_ipcf_hal.cpp:333] [channel] can5_ins0ch4 [ins] 0 [id] 4 config success.
    ```

- 发送线程发送的数据打印，可以看到发到成功将多少帧数据转发到 MCU，速率如何
    ```
    [send_frame_data 266] [INFO]: Target can5_ins0ch4 Time: 0.005230s
    [send_frame_data 268] [INFO]: Send success count: 5 Total:5
    [send_frame_data 271] [INFO]: 61185.468750 byte/s -> 59.751434kb/s
    [send_frame_data 274] [INFO]: Sending FPS: 956.02 frames/s
    [send_frame_data 276] [INFO]: Send end, send package total: 5 frame total: 5
    [send_frame_data 278] [INFO]: Send thread exiting...
    [send_frame_data 266] [INFO]: Target can6_ins0ch6 Time: 0.005074s
    [send_frame_data 268] [INFO]: Send success count: 5 Total:5
    [send_frame_data 271] [INFO]: 63066.613281 byte/s -> 61.588490kb/s
    [send_frame_data 274] [INFO]: Sending FPS: 985.42 frames/s
    [send_frame_data 276] [INFO]: Send end, send package total: 5 frame total: 5
    [send_frame_data 278] [INFO]: Send thread exiting...
    [send_frame_data 266] [INFO]: Target can7_ins4ch7 Time: 0.004979s
    .....
    ```

- 接收超时,起接收线程后会等待接收数据，长时间没有接收错误会报-303错误，可根据实际情况判断是否存在异常，当超过100s 时候，会退出线程
    ```
    [recv_frame_data 307] [ERR]: canRecvMsgFrame failed ret: -303
    [recv_frame_data 307] [ERR]: canRecvMsgFrame failed ret: -303
    [recv_frame_data 307] [ERR]: canRecvMsgFrame failed ret: -303
    [recv_frame_data 307] [ERR]: canRecvMsgFrame failed ret: -303
    [recv_frame_data 307] [ERR]: canRecvMsgFrame failed ret: -303
    [recv_frame_data 307] [ERR]: canRecvMsgFrame failed ret: -303
    [recv_frame_data 307] [ERR]: canRecvMsgFrame failed ret: -303
    [recv_frame_data 307] [ERR]: canRecvMsgFrame failed ret: -303
    [recv_frame_data 307] [ERR]: canRecvMsgFrame failed ret: -303
    [recv_frame_data 307] [ERR]: canRecvMsgFrame failed ret: -303
    [recv_frame_data 307] [ERR]: canRecvMsgFrame failed ret: -303
    [recv_frame_data 314] [INFO]: No data received for 100 seconds. Exiting thread.

    ```

- 按 ctrl+c 退出后可以看到各个接收线程中收到包的数量，接收的最大延迟(仅 CAN FD 支持)，由于 CAN5没有接设备，所以接收到的包数量为0
    ```
    Target :can7_ins4ch7 recv frame num: 5 Total recv frame num: 5 Maximum transmission time:32209 us
    Target :can6_ins0ch6 recv frame num: 5 Total recv frame num: 5 Maximum transmission time:41182 us
    Target :can8_ins4ch2 recv frame num: 5 Total recv frame num: 5 Maximum transmission time:22676 us
    Target :can9_ins0ch3 recv frame num: 5 Total recv frame num: 5 Maximum transmission time:11395 us
    Target :can5_ins0ch4 recv frame num: 0 Total recv frame num: 5 Maximum transmission time:0 us
    ```
- 资源释放
    ```
    [INFO][hb_ipcf_hal.cpp:553] [channel] can5_ins0ch4 [ins] 0 [id] 4 deinit success.
    [INFO][hb_ipcf_hal.cpp:553] [channel] can8_ins4ch2 [ins] 0 [id] 2 deinit success.
    [INFO][hb_ipcf_hal.cpp:553] [channel] can9_ins0ch3 [ins] 0 [id] 3 deinit success.
    [INFO][hb_ipcf_hal.cpp:553] [channel] can7_ins4ch7 [ins] 0 [id] 7 deinit success.
    [INFO][hb_ipcf_hal.cpp:553] [channel] can6_ins0ch6 [ins] 0 [id] 6 deinit success.
    ```

#### 多 can 组网传输

:::tip
持续更新中
:::

#### 应用层修改 can 波特率等配置

:::tip
持续更新中
:::

### 库文件打印开关

CAN_HAL_DEBUG_LEVEL 是一个环境变量，用于控制库文件 libhbcanhal.so 日志输出的级别。它的不同值代表不同的日志级别，这些级别决定了哪些日志信息会被记录下来
```
0 (log_trace): 跟踪级别。
1 (log_debug): 调试级别。
2 (log_info): 信息级别。
3 (log_warn): 警告级别。
4 (log_err): 错误级别。
5 (log_critical): 致命级别。
6 (log_never): 不打印任何日志。
```
通过设置 CAN_HAL_DEBUG_LEVEL 的值，可以控制日志输出的详细程度。例如，如果设置为 2，那么只有 log_info、log_warn、log_err 和 log_critical 级别的日志会被打印

### MCU 侧 DEBUG 应用说明
1. 进入 MCU1的控制台
2. 输入命令：can_tran_debug
```
can_tran_debug
```

3. 在 `/sys/class/remoteproc/remoteproc_mcu1` 路径下使用 `cat log` 命令查看结果

   <img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/s100_debug.jpg" alt="Debug日志" style={{ width: '100%' }} />


### 应用程序接口

#### void Can_Init(const Can_ConfigType* Config)

```shell
Description：This function initializes the module.

Sync/Async: Synchronous
Parameters(in)
    Config: Pointer to driver configuration.
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Can_GetVersionInfo(Std_VersionInfoType* versioninfo)

```shell
Description：Returns the version information of this module.

Sync/Async: Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    versioninfo: Pointer to where to store the version information of this module.
Return value：None
```

#### void Can_DeInit(void)

```shell
Description：This function de-initializes the module.

Sync/Async: Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### Std_ReturnType Can_SetControllerMode(uint8 Controller, Can_ControllerStateType Transition)

```shell
Description：This function performs software triggered state transitions of the CAN controller State machine.

Sync/Async: Synchronous
Parameters(in)
    Controller: CAN controller for which the status shall be changed.
    Transition: Transition value to request new CAN controller state.
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
	E_OK: request accepted.
    E_NOT_OK: request not accepted, a development error occurred.
```

#### void Can_DisableControllerInterrupts(uint8 Controller)

```shell
Description：This function disables all interrupts for this CAN controller.

Sync/Async: Synchronous
Parameters(in)
    Controller: CAN controller for which interrupts shall be disabled.
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Can_EnableControllerInterrupts(uint8 Controller)

```shell
Description：This function enables all allowed interrupts.

Sync/Async: Synchronous
Parameters(in)
    Controller: CAN controller for which interrupts shall be re-enabled.
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### Std_ReturnType Can_GetControllerErrorState(uint8 ControllerId, Can_ErrorStateType* ErrorStatePtr)

```shell
Description：This service obtains the error state of the CAN controller.

Sync/Async: Synchronous
Parameters(in)
    ControllerId: Abstracted CanIf ControllerId which is assigned to a CAN controller, which is requested for ErrorState.
Parameters(inout)
    None
Parameters(out)
    ErrorStatePtr:Pointer to a memory location, where the error state of the CAN controller will be stored.
Return value：Std_ReturnType
	E_OK: Error state request has been accepted.
    E_NOT_OK: Error state request has not been accepted.
```

#### Std_ReturnType Can_GetControllerMode(uint8 Controller, Can_ControllerStateType* ControllerModePtr)

```shell
Description：This service reports about the current status of the requested CAN controller.

Sync/Async: Synchronous
Parameters(in)
    Controller: CAN controller for which the status shall be requested.
Parameters(inout)
    None
Parameters(out)
    ControllerModePtr: Pointer to a memory location, where the current mode of the CAN controller will be stored.
Return value：Std_ReturnType
    E_OK: Controller mode request has been accepted.
    E_NOT_OK: Controller mode request has not been accepted.
```

#### Std_ReturnType Can_GetControllerRxErrorCounter(uint8 ControllerId, uint8* RxErrorCounterPtr)

```shell
Description：Returns the Rx error counter for a CAN controller.
             This value might not be available for all CAN controllers, in which case E_NOT_OK would be
             returned.Please note that the value of the counter might not be correct at the moment the
             API returns it, because the Rx counter is handled as ynchronously in hardware.Applications
             should not trust this value for any assumption about the current bus state.

Sync/Async: Synchronous
Parameters(in)
    ControllerId: CAN controller, whose current Rx error counter shall be acquired.
Parameters(inout)
    None
Parameters(out)
    RxErrorCounterPtr: Pointer to a memory location, where the current Rx error counter of the
                       CAN controller will be stored.
Return value：Std_ReturnType
    E_OK: Rx error counter available.
    E_NOT_OK: Wrong ControllerId, or Rx error counter not available.
```

#### Std_ReturnType Can_GetControllerTxErrorCounter(uint8 ControllerId, uint8* TxErrorCounterPtr)

```shell
Description：Returns the Tx error counter for a CAN controller. This value might not be available
             for all CAN controllers, in which case E_NOT_OK would be returned.Please note that the
             value of the counter might not be correct at the moment the API returns it, because the
             Tx counter is handled as ynchronously in hardware.Applications should not trust this
             value for any assumption about the current bus state.

Sync/Async: Synchronous
Parameters(in)
    ControllerId: CAN controller, whose current Rx error counter shall be acquired.
Parameters(inout)
    None
Parameters(out)
    TxErrorCounterPtr:Pointer to a memory location, where the current Tx error counter
                      of the CAN controller will be stored.
Return value：Std_ReturnType
    E_OK: Rx error counter available.
    E_NOT_OK: Wrong ControllerId, or Rx error counter not available.
```

#### Std_ReturnTypeCan_Write(Can_HwHandleType Hth, const Can_PduType* PduInfo)

```shell
Description：This function is called by CanIf to pass a CAN message to CanDrv for tran smission.

Sync/Async: Synchronous
Parameters(in)
    Hth:information which HW-transmit handle shall be used for transmit.Implicitly this is
        also the information about the controller to use because the Hth numbers are unique
        inside one hardware unit.
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: Write command has been accepted.
    E_NOT_OK: development error occurred.
    CAN_BUSY: No TX hardware buffer available or pre-emptive call of Can_Write that can’t be
              implemented re-entrant (see Can_ReturnType).
```

#### void Can_MainFunction_Write(Void)

```shell
Description：This function performs the polling of TX confirmation when CAN_TX_PROCESSING
             is set to POLLING.

Sync/Async: Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    None
Return value: None
```

#### void Can_MainFunction_Read(Void)

```shell
Description：Returns the value of the specified CAN channel.This function performs the
             polling of RX indications when CAN_RX_PROCESSING is set to POLLING.

Sync/Async: Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Can_MainFunction_BusOff(Void)

```shell
Description：This function performs the polling of bus-off events that are configured statically
             as ‘to be polled’.

Sync/Async: Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Can_MainFunction_Mode(Void)

```shell
Description：This function performs the polling of CAN controller mode transitions.

Sync/Async: Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```
