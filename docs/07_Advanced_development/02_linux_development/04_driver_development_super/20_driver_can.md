---
sidebar_position: 20
---

# CAN 调试指南

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 前言

<DocScope products="RDK S100">

S100 暂不支持 SocketCAN 及旁路协议栈功能。如需使用 CAN，请联系技术支持。

</DocScope>

<DocScope products="RDK S600">

S600 Acore/Main 域共有 4 路 CAN。当 4 路 CAN 无法满足业务需求时，Acore 还可直接控制 MCU 域的 CAN，最多额外接管 6 路，合计最多 10 路。该功能涉及 Acore 与 MCU 两侧的配置修改，详情请参见[第三节](#三acore-接管-mcu-域-can扩展-can-路数)。

本文档面向快速上手，包含三部分：

1. **Acore SocketCAN 标准使用**：修改设备树 + 加载模块 + 拉低 CAN_STB 引脚；
2. **旁路协议栈（Fastpath）使用**：模块加载与用户态 mmap/poll 收发；
3. **Acore 接管 MCU 域 CAN**：扩展 CAN 路数的 MCU 侧配置修改。

</DocScope>

<DocScope products="RDK S600">

## 驱动代码

```bash
drivers/net/can/flexcan/flexcan-core.c      # FlexCAN 驱动核心（收发、中断、位时序、Mailbox 管理）
drivers/net/can/flexcan/flexcan-ethtool.c    # ethtool 统计与 ring 参数接口
drivers/net/can/flexcan/flexcan.h            # 驱动头文件与寄存器定义
```

### 内核配置位置

配置文件路径：`hobot-drivers/configs/drobot_s600_defconfig`

```bash
CONFIG_CAN=m                    # CAN 协议族框架
CONFIG_CAN_RAW=m                # CAN raw 套接字协议
CONFIG_CAN_FLEXCAN=m            # FlexCAN 硬件驱动
CONFIG_CAN_FLEXCAN_FASTPATH=y   # 旁路协议栈（Fastpath），默认编译
```

### 内核 DTS 节点配置

S600 的 CAN 节点分为两组：

| 分组 | 节点 | 基址范围 | 时钟频率 | pinctrl | 默认状态 |
| ---- | ---- | -------- | -------- | -------- | -------- |
| Acore/Main 域 | `canfd0`~`canfd3` | `0x34860000`~`0x3486C000` | 200MHz | 有 | `disabled` |
| MCU 域 | `canfd4`~`canfd9` | `0x23870000`~`0x238e0000` | 80MHz | 无 | `disabled` |

设备树源文件位于 `hobot-drivers/kernel-dts/drobot-s600-soc.dtsi`。

**Acore/Main 域 CAN 节点**（以 `canfd0` 为例）：

```dts
canfd0: canfd@0x34860000 {
    status = "disabled";
    compatible = "hobot,s600-flexcan";
    reg = <0x0 0x34860000 0x0 0x3400>;
    interrupts = <GIC_SPI HSISYS_CANFD0_IPI_MB_INTR IRQ_TYPE_LEVEL_HIGH>,
                  <GIC_SPI HSISYS_CANFD0_IPI_ERR_INTR IRQ_TYPE_LEVEL_HIGH>;
    clock-frequency = <200000000>;
    fsl,clk-source = <0>;
    pinctrl-names = "default";
    pinctrl-0 = <&hsi_peri_canfd0_txd &hsi_peri_canfd0_rxd>;
};
/* canfd1/canfd2/canfd3 同理，基址 0x34864000 / 0x34868000 / 0x3486C000 */
```

**MCU 域 CAN 节点**（以 `canfd4` 为例，默认 `disabled`，Acore 接管时改为 `okay`）：

```dts
canfd4: canfd@0x23870000 {
    status = "disabled";           /* Acore 接管时改为 okay */
    compatible = "hobot,s600-flexcan";
    reg = <0x0 0x23870000 0x0 0x4000>;
    interrupts = <GIC_SPI MCUSYS_CANFD1_IPI_MB_INTR IRQ_TYPE_LEVEL_HIGH>,
                  <GIC_SPI MCUSYS_CANFD1_IPI_ERR_INTR IRQ_TYPE_LEVEL_HIGH>;
    clock-frequency = <80000000>;
    fsl,clk-source = <0>;
};
/* canfd5~canfd9 同理，基址 0x23880000/0x238b0000/0x238c0000/0x238d0000/0x238e0000 */
```

:::note 引脚复用与冲突
Acore/Main 域 4 路 CAN 的收发引脚均与其他外设复用，使用前必须在设备树中正确配置 `pinctrl` 并禁用冲突外设：

| CAN 控制器 | TXD 引脚 | RXD 引脚 | 冲突外设 |
| ---------- | -------- | -------- | -------- |
| `canfd0` (CAN0) | `hsi_spi0_miso` | `hsi_spi0_sclk` | SPI0 |
| `canfd1` (CAN1) | `hsi_spi0_csn0` | `hsi_spi0_mosi` | SPI0 |
| `canfd2` (CAN2) | `hsi_uart3_txd` | `hsi_uart3_rxd` | UART3 |
| `canfd3` (CAN3) | `hsi_uart4_txd` | `hsi_uart4_rxd` | UART4 |

- **CAN0 + CAN1 与 SPI0 复用同一组 4 个引脚**，两者不可同时使用，使能 CAN0/CAN1 时必须禁用 SPI0；
- **CAN2 与 UART3 复用**、**CAN3 与 UART4 复用**，使能对应 CAN 时需禁用相应 UART。
:::

## CAN 使用

### 一、Acore SocketCAN 标准使用

使用 SocketCAN 需完成三步：修改设备树使能 CAN 节点并禁用冲突外设、加载三个内核模块、拉低 CAN_STB 引脚使能收发器。

#### 1.1 修改设备树

默认情况下 4 路 CAN 节点 `canfd0`~`canfd3` 的 `status` 为 `disabled`，而与之引脚冲突的 `spi0` 也可能为 `okay`。使用 SocketCAN 前需确认两处：

**① 确认 CAN 节点已使能**

确保 `canfd0`~`canfd3` 的 `status` 为 `okay`（参见上文 DTS 节点配置）。

**② 禁用冲突的 SPI0**

CAN0/CAN1 与 SPI0 复用同一组 4 个引脚，使用 CAN0 或 CAN1 前必须禁用 SPI0：

```dts
spi0: spi@34900000 {
    ...
    status = "disabled";                /* okay → disabled */
    ...
};
```

:::warning 按需禁用
- 只要用到 CAN0 或 CAN1，就必须禁用 SPI0；
- 若仅使用 CAN2，需禁用 UART3；仅使用 CAN3，需禁用 UART4。
:::

修改完成后重新编译设备树并烧录。

#### 1.2 加载 CAN 模块（三个模块）

系统启动后需加载以下三个内核模块：

```shell
modprobe can        # CAN 协议族框架
modprobe can-raw    # CAN raw 套接字协议
modprobe flexcan    # FlexCAN 硬件驱动
```

:::note 模块依赖
`can-raw` 依赖 `can`，`flexcan` 依赖 `can`（含 `can-dev` 设备接口），按上述顺序加载即可自动处理依赖。若驱动内置（built-in）则无需手动加载，仅需加载协议模块。
:::

#### 1.3 拉低 CAN_STB 引脚（使能收发器）

CAN 收发器待机控制引脚 `MAIN_CAN_STB` 位于 I2C GPIO 扩展芯片 `tpt29555a@0x27` 第 7 线，对应 Linux sysfs 的 `gpio369`。**必须拉低才能正常收发数据**：

```shell
echo out > /sys/class/gpio/gpio369/direction
echo 0 > /sys/class/gpio/gpio369/value
```

:::tip 持久化
可将上述命令加入开机启动脚本（如 `/etc/rc.local` 或 systemd service），确保每次开机自动拉低。
:::

#### 1.4 配置 CAN 接口并通信

加载模块且拉低 STB 后，配置波特率并启动接口（以 CAN-FD 为例，标称段 1Mbps、数据段 5Mbps）：

```shell
# can0
ip link set can0 down
ip link set can0 type can fd on loopback off bitrate 1000000 sample-point 0.75 dbitrate 5000000 dsample-point 0.75
ip link set can0 up

# can1 / can2 / can3 同理
ip link set can1 down
ip link set can1 type can fd on loopback off bitrate 1000000 sample-point 0.75 dbitrate 5000000 dsample-point 0.75
ip link set can1 up
```

经典 CAN（非 FD）配置示例（500kbps）：

```shell
ip link set can0 down
ip link set can0 type can bitrate 500000 sample-point 0.875
ip link set can0 up
```

收发测试：

```shell
# 接收端监听
candump can0

# 发送标准帧
cansend can0 123#DEADBEEF

# 发送 CAN-FD 帧（## 表示 FD，0 后为 BRS 标志）
cansend can0 123##0112233445566778899AABBCCDDEE

# 发送远程帧
cansend can0 123#R
```

工作模式（可选）：

```shell
# 环回模式（无外接节点时自测）
ip link set can0 type can bitrate 500000 loopback on
# 监听模式（只听不发，不回 ACK）
ip link set can0 type can bitrate 500000 listen-only on
```

#### 1.5 快速验证工具

官方提供压力测试工具 `can_stress` 与互通验证工具 `can_pair_test`：

```text
源码路径：hobot-io-samples/debian/app/Can/socketcan/
├── can_stress.c       # C 版压力/延迟测试工具
├── can_stress.py      # Python 版
├── can_pair_test.c    # 成对互通验证（can0<->can1, can2<->can3）
├── Makefile
└── README.md
```

编译与使用：

```shell
cd hobot-io-samples/debian/app/Can/socketcan
make

# 单路回环测试（CAN-FD，64 字节，1ms 周期，60 秒）
sudo ./can_stress -i can0 -f 1 -l 64 -t 0x100 -r 0x100 -p 1 -w 1000 -L -D 60

# 双路互联并发测试
sudo ./can_stress -i can0 -f 1 -l 64 -t 0x100 -r 0x101 -p 1 -w 1000 -L \
                 -i can1 -f 1 -l 64 -t 0x101 -r 0x100 -p 1 -w 1000 -L -D 60

# 成对互通验证（硬件连接 can0<->can1, can2<->can3）
sudo ./can_pair_test
```

#### 1.6 错误与统计

```shell
# 网络收发统计
ip -s link show can0

# ethtool ring 参数与统计
ethtool -g can0
ethtool -S can0

# CAN 控制器状态与错误计数
ip -details link show can0
```

### 二、旁路协议栈（Fastpath）使用

旁路协议栈通过共享内存环形缓冲区（mmap），在中断上下文直接与用户态交换 CAN 帧，绕过 SocketCAN/NAPI 协议栈，延迟更低、抖动更小，适用于对实时性有要求的场景。由内核配置 `CONFIG_CAN_FLEXCAN_FASTPATH`（默认 `y`）控制编译，运行时由模块参数使能。

#### 2.1 使能 Fastpath（模块加载）

Fastpath 默认关闭，通过 `flexcan` 模块参数使能：

| 参数名 | 类型 | 默认值 | 说明 |
| ------ | ---- | ------ | ---- |
| `shm_rx` | bool | 0(off) | 使能快速接收通道 |
| `shm_rx_entries` | uint | 1024 | RX 环形缓冲区 entry 数 |
| `shm_tx` | bool | 0(off) | 使能快速发送通道 |
| `shm_tx_entries` | uint | 1024 | TX 环形缓冲区 entry 数 |
| `shm_tx_budget` | uint | 256 | 每次门铃/中断最多发送 entry 数 |

```shell
# 加载时使能双向快速通道
modprobe flexcan shm_rx=1 shm_rx_entries=2048 shm_tx=1 shm_tx_entries=2048

# 或运行时通过 sysfs 修改（需在 up 接口前设置）
echo 1 | sudo tee /sys/module/flexcan/parameters/shm_tx
echo 1 | sudo tee /sys/module/flexcan/parameters/shm_rx
```

:::warning 生效时机
参数在 `ip link set canX up` 时读取并初始化共享内存与 misc 设备。修改后需重新 up 接口：

```shell
ip link set can0 down
echo 1 > /sys/module/flexcan/parameters/shm_rx
ip link set can0 up
```
:::

加载并 up 接口后，生成 misc 设备节点（每路 CAN 一对）：

```shell
ls -l /dev/flexcan_shm_rx_can0 /dev/flexcan_shm_tx_can0
```

#### 2.2 头文件与链接库

- **头文件**：`hobot_can_hal.h` + `hobot_can_hal_fast.h`
- **链接库**：`-lhbcanhal`
- **适用语言**：C / C++

#### 2.3 数据类型

快速路径复用普通接口的 `struct canframe`（定义于 `hobot_can_hal.h`）：

```c
struct canframe {
    uint64_t time_stamp;   /* 硬件 RX 时间戳（µs），TX 时忽略            */
    uint32_t canid;        /* 纯数字 CAN ID，不含任何 flag 位            */
    uint8_t  count;        /* 快速路径未使用，固定为 0                    */
    uint8_t  can_type;     /* 帧类型，取 CANFAST_TYPE_* 值               */
    uint8_t  can_channel;  /* 快速路径未使用，固定为 0                    */
    uint8_t  len;          /* payload 字节数（CAN: 0~8，CANFD: 0~64）   */
    uint8_t  data[64];     /* payload 数据                               */
};
```

`can_type` 同时编码帧格式（SFF/EFF）和总线类型（经典 CAN / CANFD+BRS），取以下常量之一：

| 常量 | 值 | 含义 |
| ---- | -- | ---- |
| `CANFAST_TYPE_CAN` | 0 | 经典 CAN，标准帧（SFF，11-bit ID，`len` ≤ 8） |
| `CANFAST_TYPE_CAN_EFF` | 1 | 经典 CAN，扩展帧（EFF，29-bit ID，`len` ≤ 8） |
| `CANFAST_TYPE_CANFD` | 2 | CAN FD + BRS，标准帧（SFF，`len` ≤ 64） |
| `CANFAST_TYPE_CANFD_EFF` | 3 | CAN FD + BRS，扩展帧（EFF，`len` ≤ 64） |

`canid` 永远是纯数字，不含任何 flag 位。TX 时按 `can_type` 决定帧格式；RX 收到帧后 `canid` 同样是去除 flag 的纯数字，无需额外 mask 操作。

#### 2.4 接口一览

| 函数 | 功能 |
| ---- | ---- |
| `canFastTxOpen(ifname)` | 打开 TX 通道，清除 stale 帧，返回句柄 |
| `canFastTxClose(tx)` | 关闭 TX 通道，释放资源 |
| `canFastSend(tx, frames[], n)` | 批量发送（最多 n 帧） |
| `canFastPollTx(tx, ms)` | 等待 TX 环有空间 |
| `canFastRxOpen(ifname)` | 打开 RX 通道，丢弃 stale 帧，返回句柄 |
| `canFastRxClose(rx)` | 关闭 RX 通道，释放资源 |
| `canFastRecv(rx, frames[], n)` | 批量接收（最多 n 帧） |
| `canFastPollRx(rx, ms)` | 等待 RX 有数据 |
| `canFastRxDropped(rx)` | 查询内核丢包计数 |
| `canFastIsEff(can_type)` | 判断是否为扩展帧（返回 0 或 1） |
| `canFastIsFd(can_type)` | 判断是否为 CANFD 帧（返回 0 或 1） |

:::note 打开时自动清除 stale 帧
`canFastTxOpen` 会将 TX 环的 head 对齐到当前 tail，丢弃上次进程遗留的未发帧；`canFastRxOpen` 会将 RX 环的 tail 对齐到当前 head，丢弃上次进程遗留的未消费帧。无需手动复位，多次运行测试时不会出现"旧帧重发"现象。
:::

#### 2.5 代码示例

##### 2.5.1 发送：经典 CAN 标准帧（单帧）

```c
#include <hobot_can_hal_fast.h>
#include <string.h>
#include <stdio.h>

int main(void)
{
    canfast_tx_t *tx = canFastTxOpen("can1");
    if (!tx) return -1;

    struct canframe frame;
    memset(&frame, 0, sizeof(frame));
    frame.canid     = 0x123;
    frame.can_type  = CANFAST_TYPE_CAN;   /* 经典 CAN，标准帧 */
    frame.len       = 8;
    frame.data[0]   = 0xAA;
    frame.data[1]   = 0xBB;

    int rc;
    do {
        rc = canFastSend(tx, &frame, 1);
        if (rc == -EAGAIN) canFastPollTx(tx, 100);
    } while (rc == -EAGAIN);
    printf("send rc=%d\n", rc);   /* rc==1 表示成功发出 1 帧 */

    canFastTxClose(tx);
    return 0;
}
```

##### 2.5.2 发送：CANFD + BRS 扩展帧（批量）

```c
#include <hobot_can_hal_fast.h>
#include <string.h>

#define BATCH 8

int main(void)
{
    canfast_tx_t *tx = canFastTxOpen("can1");
    if (!tx) return -1;

    struct canframe frames[BATCH];
    for (int i = 0; i < BATCH; i++) {
        memset(&frames[i], 0, sizeof(frames[i]));
        frames[i].canid    = 0x1FFFFFFF;
        frames[i].can_type = CANFAST_TYPE_CANFD_EFF;   /* CANFD + BRS，扩展帧 */
        frames[i].len      = 64;
        memset(frames[i].data, (uint8_t)i, 64);
    }

    int remaining = BATCH;
    int offset    = 0;
    while (remaining > 0) {
        int rc = canFastSend(tx, &frames[offset], (uint32_t)remaining);
        if (rc == -EAGAIN) { canFastPollTx(tx, 10); continue; }
        if (rc < 0)        { fprintf(stderr, "send error %d\n", rc); break; }
        offset    += rc;
        remaining -= rc;
    }

    canFastTxClose(tx);
    return 0;
}
```

##### 2.5.3 接收：批量收帧并解析

```c
#include <hobot_can_hal_fast.h>
#include <stdio.h>

#define BATCH 32

int main(void)
{
    canfast_rx_t *rx = canFastRxOpen("can1");
    if (!rx) return -1;

    struct canframe frames[BATCH];

    while (1) {
        if (canFastPollRx(rx, 1000) <= 0)
            continue;

        int count = canFastRecv(rx, frames, BATCH);
        for (int i = 0; i < count; i++) {
            struct canframe *f = &frames[i];
            printf("id=0x%X (%s)  len=%u  fd=%d\n",
                   f->canid,
                   canFastIsEff(f->can_type) ? "EFF" : "SFF",
                   f->len,
                   canFastIsFd(f->can_type));
        }

        uint32_t dropped = canFastRxDropped(rx);
        if (dropped)
            printf("WARNING: kernel dropped %u frames\n", dropped);
    }

    canFastRxClose(rx);
    return 0;
}
```

##### 2.5.4 双向通信（收发各一个线程）

```c
#include <hobot_can_hal_fast.h>
#include <pthread.h>
#include <string.h>
#include <stdio.h>
#include <unistd.h>
#include <signal.h>

#define BATCH 32

static volatile int g_stop = 0;
static void on_signal(int s) { (void)s; g_stop = 1; }

static void *tx_task(void *arg)
{
    (void)arg;
    canfast_tx_t *tx = canFastTxOpen("can1");
    if (!tx) return NULL;

    struct canframe frames[8];
    for (int i = 0; i < 8; i++) {
        memset(&frames[i], 0, sizeof(frames[i]));
        frames[i].canid    = 0x100;
        frames[i].can_type = CANFAST_TYPE_CANFD;   /* CANFD + BRS，标准帧 */
        frames[i].len      = 64;
    }

    while (!g_stop) {
        int remaining = 8, offset = 0;
        while (!g_stop && remaining > 0) {
            int rc = canFastSend(tx, &frames[offset], (uint32_t)remaining);
            if (rc == -EAGAIN) { canFastPollTx(tx, 10); continue; }
            if (rc < 0) break;
            offset += rc; remaining -= rc;
        }
        usleep(1000);
    }

    canFastTxClose(tx);
    return NULL;
}

static void *rx_task(void *arg)
{
    (void)arg;
    canfast_rx_t *rx = canFastRxOpen("can1");
    if (!rx) return NULL;

    struct canframe frames[BATCH];
    long total = 0;

    while (!g_stop) {
        if (canFastPollRx(rx, 1000) <= 0) continue;

        int n = canFastRecv(rx, frames, BATCH);
        total += n;
    }

    printf("RX total=%ld  dropped=%u\n", total, canFastRxDropped(rx));
    canFastRxClose(rx);
    return NULL;
}

int main(void)
{
    signal(SIGINT,  on_signal);
    signal(SIGTERM, on_signal);

    pthread_t t_tx, t_rx;
    pthread_create(&t_rx, NULL, rx_task, NULL);
    pthread_create(&t_tx, NULL, tx_task, NULL);
    pthread_join(t_tx, NULL);
    pthread_join(t_rx, NULL);
    return 0;
}
```

#### 2.6 错误处理与注意事项

**错误处理：**

```c
int rc = canFastSend(tx, frames, count);
if (rc < 0) {
    if (rc == -EAGAIN) {
        /* TX 环满，等待后重试 */
        canFastPollTx(tx, 10);
    } else if (rc == -EINVAL) {
        /* 参数非法，检查 canFastTxOpen 是否成功、frames/count 是否合法 */
    } else {
        fprintf(stderr, "canFastSend error: %s\n", strerror(-rc));
    }
} else if (rc < (int)count) {
    /* 环满导致只发出了部分帧，用剩余指针和数量再次调用 */
}
```

**注意事项：**

- **线程安全**：同一句柄不可多线程并发调用，每个线程应独立调用 `canFastTxOpen` / `canFastRxOpen`，各自持有独立句柄。
- **TX 环满**：`canFastSend` 返回 `-EAGAIN` 时帧尚未发出，必须重试（除非业务允许丢帧），推荐 `canFastPollTx(tx, ms)` 等待空间后重试。
- **RX 丢包**：`canFastRxDropped(rx) > 0` 说明消费速度慢于内核写入速度，可增大 `BATCH`、减少处理耗时，或增大内核 `shm_rx_entries`。
- **资源释放**：程序退出前必须调用 `canFastTxClose` / `canFastRxClose`，避免 mmap 和 fd 泄漏。推荐在 `SIGINT` / `SIGTERM` 信号处理中设置退出标志，主循环退出后执行 close。

#### 2.7 旁路通道与标准路径对比

| 维度 | 标准 SocketCAN | 旁路 Fastpath |
| ---- | --------------- | -------------- |
| 用户接口 | `PF_CAN` raw socket | `/dev/flexcan_shm_rx/tx_*` + `hobot_can_hal_fast` 库 |
| 收发路径 | skb + NAPI + net_rx_action | mmap 环形缓冲 + IRQ 直接写 |
| 延迟 | 较高（协议栈开销） | 低（绕过协议栈，µs 量级） |
| 默认状态 | 接口 up 即可用 | 模块参数 off，需 open misc 设备才激活 |
| CAN-FD | 支持 | 支持 |
| 报文过滤 | SocketCAN filter | 无（用户态自行过滤） |

### 三、Acore 接管 MCU 域 CAN（扩展 CAN 路数）

#### 3.1 背景

S600 Acore/Main 域仅有 4 路 CAN。当业务需要更多 CAN 通道时，可让 Acore 直接控制 MCU 域的 CAN 控制器，最多额外接管 6 路（`canfd4`~`canfd9`），将 Acore 可用 CAN 扩展至 10 路。

Acore 侧使用标准 FlexCAN 驱动直接访问 MCU 域 CAN 的寄存器空间（内存映射），数据收发路径为直接寄存器访问，**不经过 IPC 转发**。中断通过核间中断（IPI）从 MCU 域路由到 Acore。

由于 MCU 域 CAN 默认由 MCU 侧初始化和管理，接管前需在 **MCU 侧修改配置**，将该 CAN 控制器的中断、时钟、启动控制从 MCU 侧释放，否则会出现双核同时抢占中断、时钟未切换等问题。MCU 域 CAN 的核间透传方案（CAN2IPC / CANHAL）有专门说明文档，本文不再赘述。

#### 3.2 CAN 节点对应关系

Acore 设备树中 MCU 域 CAN 节点与 MCU 侧 CAN 控制器的对应关系：

| Acore 设备节点 | MCU 侧 CAN | 寄存器基址 | 默认状态 |
| -------------- | ---------- | ---------- | -------- |
| `canfd4` | CAN1 | `0x23870000` | `disabled` |
| `canfd5` | CAN2 | `0x23880000` | `disabled` |
| `canfd6` | CAN5 | `0x238b0000` | `disabled` |
| `canfd7` | CAN6 | `0x238c0000` | `disabled` |
| `canfd8` | CAN7 | `0x238d0000` | `disabled` |
| `canfd9` | CAN8 | `0x238e0000` | `disabled` |

Acore 侧设备树节点与中断路由相关配置已合入主线代码。客户想使用哪路 CAN，在板级 DTS 中将对应节点 `status` 从 `disabled` 改为 `okay` 即可。默认设为 `disabled` 是为了防止使用 MCU 侧 CAN 的客户出现异常。

#### 3.3 MCU 侧修改（三处修改点）

对每一个要交给 Acore 的 CAN 控制器，MCU 侧需做 **3 处修改**，规则：**交给 Acore = 三处全部改；留在 MCU = 三处都不改**。

| 序号 | 修改点 | 所在文件 | 所在函数 | 操作 |
| ---- | ------ | -------- | -------- | ---- |
| ① | 中断注册 | `Isr_Hal.c` | `Interrupt_McuConfigs[]` 数组 | 注释掉对应 CAN 的中断配置行 |
| ② | 时钟寄存器 | `Can_test.c` | `Can_Initclock()` | 将时钟寄存器写入值由 `0x8000` 改为 `0x8001` |
| ③ | 控制器启动 | `Can_test.c` | `CanPro_Init()` | 注释掉对应 `Can_SetControllerMode(..., CAN_CS_STARTED)` |

**CAN 控制器参数对照表：**

| CAN 编号 | CANFD | 时钟寄存器地址 | 控制器枚举 | 中断通道 / ISR |
| -------- | ----- | ------------- | ---------- | -------------- |
| 1 | CANFD1 | `0x235200CC` | `CanController_1` | `Os_IntChannel_Can1_DataIsr` / `Os_Isr_Can1_DataIsr` |
| 2 | CANFD2 | `0x235200D0` | `CanController_2` | `Os_IntChannel_Can2_DataIsr` / `Os_Isr_Can2_DataIsr` |
| 5 | CANFD5 | `0x235200DC` | `CanController_5` | `Os_IntChannel_Can5_DataIsr` / `Os_Isr_Can5_DataIsr` |
| 6 | CANFD6 | `0x235200E0` | `CanController_6` | `Os_IntChannel_Can6_DataIsr` / `Os_Isr_Can6_DataIsr` |
| 7 | CANFD7 | `0x235200E4` | `CanController_7` | `Os_IntChannel_Can7_DataIsr` / `Os_Isr_Can7_DataIsr` |
| 8 | CANFD8 | `0x235200E8` | `CanController_8` | `Os_IntChannel_Can8_DataIsr` / `Os_Isr_Can8_DataIsr` |

##### 修改点 ① — 中断注册（`Isr_Hal.c`）

文件路径：`Target/Target_S600/Target-hobot-lite-freertos-mcu1/target/FreeRtosOsHal/Isr_Hal.c`

`Interrupt_McuConfigs[]` 数组中，每个 CAN 控制器对应一条中断配置。交给 Acore 的控制器需将此行**注释掉**，使 MCU 不再注册和响应该 CAN 的数据中断，避免双核竞争：

```c
// 交给 Acore 的 CAN，注释掉此行：
//{Os_IntChannel_Can1_DataIsr, Os_Isr_Can1_DataIsr, OS_IMASK_FOR_Can1_DataIsr/8, ENABLE},
```

##### 修改点 ② — 时钟寄存器（`Can_test.c` / `Can_Initclock()`）

文件路径：`samples/Can/Can_Pro_Sample/src/Can_test.c`

`Can_Initclock()` 对每个 CANFD 写入时钟寄存器值，控制时钟所有权：

- `0x8000`：时钟由 **MCU 域**使用（默认值，对应 40MHz）
- `0x8001`：时钟移交给 **Acore 域**（bit0 置 1 表示所有权切换到 Acore，对应 80MHz）

交给 Acore 的控制器，将对应 `writel` 的值由 `0x8000` 改为 `0x8001`：

```c
writel((__IO uint32 *)(0x235200CC), 0x8001); // CANFD1
```

##### 修改点 ③ — 控制器启动（`Can_test.c` / `CanPro_Init()`）

文件路径：`samples/Can/Can_Pro_Sample/src/Can_test.c`

`CanPro_Init()` 中对每个控制器调用 `Can_SetControllerMode(CanController_X, CAN_CS_STARTED)` 启动。交给 Acore 的控制器需**注释掉**此调用，使 MCU 不启动该控制器，由 Acore 自行初始化和启动：

```c
//Can_SetControllerMode(CanController_1, CAN_CS_STARTED);
```

##### 各 CAN 控制器修改速查表

| 要交给 Acore 的 CAN | `Isr_Hal.c` 注释行 | `Can_Initclock` 改值寄存器 | `CanPro_Init` 注释行 |
| ------------------- | ------------------ | ------------------------- | -------------------- |
| CAN1 | `Can1_DataIsr` | CANFD1 `0x235200CC` → `0x8001` | `CanController_1` |
| CAN2 | `Can2_DataIsr` | CANFD2 `0x235200D0` → `0x8001` | `CanController_2` |
| CAN5 | `Can5_DataIsr` | CANFD5 `0x235200DC` → `0x8001` | `CanController_5` |
| CAN6 | `Can6_DataIsr` | CANFD6 `0x235200E0` → `0x8001` | `CanController_6` |
| CAN7 | `Can7_DataIsr` | CANFD7 `0x235200E4` → `0x8001` | `CanController_7` |
| CAN8 | `Can8_DataIsr` | CANFD8 `0x235200E8` → `0x8001` | `CanController_8` |

#### 3.4 编译与升级流程

修改完成后需依次升级 MCU1、内核：

**① 升级 MCU1**
打入 MCU patch 后编译 MCU1，升级 MCU1。
**② 升级 内核**
将 Acore 侧设备树修改合入后重新编译内核，升级内核。

#### 3.5 系统启动顺序

:::warning 启动顺序
系统需要**先启动 MCU1 之后再加载 CAN 模块**，否则会出现异常。
:::

```shell
# 1. 先启动 MCU1
cd /sys/class/remoteproc/remoteproc_mcu0
echo S600_MCU_DEBUG.elf > firmware
echo start > state

# 2. 加载 CAN 模块
modprobe can
modprobe can-raw
modprobe flexcan

# 3. 配置 CAN 接口（Acore 域 can0~can3 + MCU 域 can4~can5，CAN-FD 1M/5M）
ip link set can0 down
ip link set can0 type can fd on loopback off bitrate 1000000 sample-point 0.75 dbitrate 5000000 dsample-point 0.75
ip link set can0 up

ip link set can4 down
ip link set can4 type can fd on loopback off bitrate 1000000 sample-point 0.75 dbitrate 5000000 dsample-point 0.75
ip link set can4 up

# ... can1~can3、can5 同理配置

# 4. 测试验证
candump -ta can4
cansend can5 123#1122334455667788
```

:::warning 与 MCU 透传方案互斥
同一 MCU 域 CAN 控制器被 Acore 接管后，MCU 侧 CAN2IPC 透传路径对该控制器失效。
:::

## 调试

### 日志与设备确认

```shell
# 驱动探测日志
dmesg | grep -i flexcan

# 网络设备
ip link show can0

# 旁路 misc 设备（仅使能且 up 后）
ls -l /dev/flexcan_shm_rx_can0 /dev/flexcan_shm_tx_can0
```

### 常见问题排查

- **CAN 收不到数据**：① 确认 `gpio369` 已拉低（`cat /sys/class/gpio/gpio369/value` 应为 0）；② 确认 `canfd0`~`canfd3` 设备树已 `okay` 且冲突的 SPI0/UART 已 `disabled`；③ 确认三个模块已加载（`lsmod | grep -E "can|flexcan"`）；④ 确认接口已 `up` 且波特率与对端一致。
- **misc 设备未出现**：确认 `CONFIG_CAN_FLEXCAN_FASTPATH=y`，`shm_rx=1`/`shm_tx=1` 已设置且接口已 `up`。
- **旁路 RX 丢包**：检查 `canFastRxDropped(rx)`，增大 `shm_rx_entries`。
- **MCU 域 CAN 启动报中断冲突**：确认板级 DTS 已使能对应 CAN 节点，且 MCU 侧三处修改均已执行（中断已注释、时钟已改 `0x8001`、启动已注释）。

## FAQ

#### Q1：CAN0/CAN1 为什么不能用？

A：CAN0/CAN1 与 SPI0 复用同一组 4 个引脚。需在设备树中将 SPI0 禁用（`status = "disabled"`）并使能 CAN 节点。

#### Q2：为什么收不到数据？

A：最常见原因是 **CAN_STB 引脚未拉低**。收发器处于待机模式无法收发。执行 `echo out > /sys/class/gpio/gpio369/direction; echo 0 > /sys/class/gpio/gpio369/value`。

#### Q3：需要加载哪三个模块？

A：`can`（CAN 框架）、`can-raw`（raw 套接字）、`flexcan`（硬件驱动）。

#### Q4：CAN-FD 必须用 RX Mailbox 模式吗？

A：是。FlexCAN 硬件限制 CAN-FD 不支持 RX-FIFO，S600 devtype 已固定使用 RX Mailbox + RTR 接收，无需配置。CAN-FD 与三采样模式（`CAN_CTRLMODE_3_SAMPLES`）不可同时使用。

#### Q5：旁路协议栈会影响标准 SocketCAN 吗？

A：不会。模块参数默认 off 时标准路径不受影响。仅当用户态 `open` 了 shm_rx 设备后，该控制器接收中断才切换到快速路径。shm_tx 与标准 netdev 共享 TX Mailbox，通过 `tx_lock` 串行化无冲突。

#### Q6：快速路径接口与普通接口有什么区别？

A：快速路径通过内核共享内存环形缓冲区（mmap）直接与 FlexCAN 驱动交换帧，绕过 socket 和协议栈，延迟更低（µs 量级）；普通接口（`canSendMsgFrame` 等）走 IPCF/socket 经内核协议栈，延迟较高。快速路径只需接口名无需配置文件，最大帧长均为 64 字节（CANFD）。

</DocScope>
