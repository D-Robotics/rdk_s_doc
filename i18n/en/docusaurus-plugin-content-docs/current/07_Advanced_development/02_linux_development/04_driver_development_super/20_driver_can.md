---
sidebar_position: 20
---

# CAN Debugging Guide

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Preface

<DocScope products="RDK S100">

The S100 does not yet support SocketCAN or the bypass protocol stack. To use CAN, please contact technical support.

</DocScope>

<DocScope products="RDK S600">

The S600 Acore/Main domain has 4 CAN channels. When these 4 CAN channels cannot meet the business requirements, Acore can also directly control the MCU-domain CAN controllers, taking over up to 6 additional channels, for a maximum of 10 CAN channels in total. This feature requires configuration changes on both the Acore and MCU sides. For details, see [Section 3](#acore-takes-over-mcu-domain-can-expanding-can-channels).

This document is a quick-start guide and consists of three parts:

1. **Standard SocketCAN usage on Acore**: modify the device tree + load modules + pull down the CAN_STB pin;
2. **Bypass protocol stack (Fastpath) usage**: module loading and user-space mmap/poll transmission and reception;
3. **Acore takes over MCU-domain CAN**: MCU-side configuration changes for expanding the CAN channel count.

</DocScope>

<DocScope products="RDK S600">

## Driver Code

```bash
drivers/net/can/flexcan/flexcan-core.c      # FlexCAN driver core (TX/RX, interrupts, bit timing, Mailbox management)
drivers/net/can/flexcan/flexcan-ethtool.c    # ethtool statistics and ring parameter interfaces
drivers/net/can/flexcan/flexcan.h            # driver header file and register definitions
```

### Kernel Configuration Location

Configuration file path: `hobot-drivers/configs/drobot_s600_defconfig`

```bash
CONFIG_CAN=m                    # CAN protocol family framework
CONFIG_CAN_RAW=m                # CAN raw socket protocol
CONFIG_CAN_FLEXCAN=m            # FlexCAN hardware driver
CONFIG_CAN_FLEXCAN_FASTPATH=y   # bypass protocol stack (Fastpath), compiled by default
```

### Kernel DTS Node Configuration

The S600 CAN nodes are divided into two groups:

| Group | Node | Base Address Range | Clock Frequency | pinctrl | Default Status |
| ----- | ---- | ------------------ | --------------- | ------- | -------------- |
| Acore/Main domain | `canfd0`~`canfd3` | `0x34860000`~`0x3486C000` | 200MHz | Yes | `disabled` |
| MCU domain | `canfd4`~`canfd9` | `0x23870000`~`0x238e0000` | 80MHz | No | `disabled` |

The device tree source file is located at `hobot-drivers/kernel-dts/drobot-s600-soc.dtsi`.

**Acore/Main domain CAN node** (using `canfd0` as an example):

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
/* canfd1/canfd2/canfd3 follow the same pattern, with base addresses 0x34864000 / 0x34868000 / 0x3486C000 */
```

**MCU domain CAN node** (using `canfd4` as an example, `disabled` by default, change to `okay` when Acore takes over):

```dts
canfd4: canfd@0x23870000 {
    status = "disabled";           /* change to okay when Acore takes over */
    compatible = "hobot,s600-flexcan";
    reg = <0x0 0x23870000 0x0 0x4000>;
    interrupts = <GIC_SPI MCUSYS_CANFD1_IPI_MB_INTR IRQ_TYPE_LEVEL_HIGH>,
                  <GIC_SPI MCUSYS_CANFD1_IPI_ERR_INTR IRQ_TYPE_LEVEL_HIGH>;
    clock-frequency = <80000000>;
    fsl,clk-source = <0>;
};
/* canfd5~canfd9 follow the same pattern, with base addresses 0x23880000/0x238b0000/0x238c0000/0x238d0000/0x238e0000 */
```

:::note Pin Multiplexing and Conflicts
The TX/RX pins of the 4 Acore/Main domain CAN channels are all multiplexed with other peripherals. Before use, you must correctly configure `pinctrl` in the device tree and disable the conflicting peripherals:

| CAN Controller | TXD Pin | RXD Pin | Conflicting Peripheral |
| -------------- | ------- | ------- | ---------------------- |
| `canfd0` (CAN0) | `hsi_spi0_miso` | `hsi_spi0_sclk` | SPI0 |
| `canfd1` (CAN1) | `hsi_spi0_csn0` | `hsi_spi0_mosi` | SPI0 |
| `canfd2` (CAN2) | `hsi_uart3_txd` | `hsi_uart3_rxd` | UART3 |
| `canfd3` (CAN3) | `hsi_uart4_txd` | `hsi_uart4_rxd` | UART4 |

- **CAN0 + CAN1 share the same group of 4 pins with SPI0**, so the two cannot be used simultaneously. Enabling CAN0/CAN1 requires disabling SPI0;
- **CAN2 conflicts with UART3** and **CAN3 conflicts with UART4**. Enabling the corresponding CAN requires disabling the corresponding UART.
:::

## Using CAN

### 1. Standard SocketCAN Usage on Acore

Using SocketCAN requires three steps: modify the device tree to enable the CAN nodes and disable conflicting peripherals, load three kernel modules, and pull down the CAN_STB pin to enable the transceiver.

#### 1.1 Modify the Device Tree

By default, the `status` of the 4 CAN nodes `canfd0`~`canfd3` is `disabled`, while the conflicting `spi0` may be `okay`. Before using SocketCAN, verify two things:

**① Confirm the CAN nodes are enabled**

Make sure the `status` of `canfd0`~`canfd3` is `okay` (see the DTS node configuration above).

**② Disable the conflicting SPI0**

CAN0/CAN1 share the same group of 4 pins with SPI0. Before using CAN0 or CAN1, you must disable SPI0:

```dts
spi0: spi@34900000 {
    ...
    status = "disabled";                /* okay → disabled */
    ...
};
```

:::warning Disable on Demand
- As long as CAN0 or CAN1 is used, SPI0 must be disabled;
- If only CAN2 is used, UART3 must be disabled; if only CAN3 is used, UART4 must be disabled.
:::

After making the changes, recompile the device tree and flash it.

#### 1.2 Load the CAN Modules (Three Modules)

After system startup, load the following three kernel modules:

```shell
modprobe can        # CAN protocol family framework
modprobe can-raw    # CAN raw socket protocol
modprobe flexcan    # FlexCAN hardware driver
```

:::note Module Dependencies
`can-raw` depends on `can`, and `flexcan` depends on `can` (including the `can-dev` device interface). Loading in the above order automatically handles the dependencies. If the drivers are built-in, manual loading is unnecessary — only the protocol modules need to be loaded.
:::

#### 1.3 Pull Down the CAN_STB Pin (Enable the Transceiver)

The CAN transceiver standby control pin `MAIN_CAN_STB` is located on line 7 of the I2C GPIO expander chip `tpt29555a@0x27`, corresponding to `gpio369` in the Linux sysfs. **It must be pulled low for normal data transmission and reception**:

```shell
echo out > /sys/class/gpio/gpio369/direction
echo 0 > /sys/class/gpio/gpio369/value
```

:::tip Persistence
You can add the above commands to a startup script (such as `/etc/rc.local` or a systemd service) to ensure the pin is pulled low automatically on every boot.
:::

#### 1.4 Configure the CAN Interface and Communicate

After loading the modules and pulling down STB, configure the baud rate and bring up the interface (using CAN-FD as an example, with a nominal rate of 1 Mbps and a data rate of 5 Mbps):

```shell
# can0
ip link set can0 down
ip link set can0 type can fd on loopback off bitrate 1000000 sample-point 0.75 dbitrate 5000000 dsample-point 0.75
ip link set can0 up

# can1 / can2 / can3 follow the same pattern
ip link set can1 down
ip link set can1 type can fd on loopback off bitrate 1000000 sample-point 0.75 dbitrate 5000000 dsample-point 0.75
ip link set can1 up
```

Classic CAN (non-FD) configuration example (500 kbps):

```shell
ip link set can0 down
ip link set can0 type can bitrate 500000 sample-point 0.875
ip link set can0 up
```

Transmit/receive test:

```shell
# listen on the receiving end
candump can0

# send a standard frame
cansend can0 123#DEADBEEF

# send a CAN-FD frame (## indicates FD; the 0 is followed by the BRS flag)
cansend can0 123##0112233445566778899AABBCCDDEE

# send a remote frame
cansend can0 123#R
```

Operating modes (optional):

```shell
# loopback mode (self-test when no external node is connected)
ip link set can0 type can bitrate 500000 loopback on
# listen-only mode (only listens, does not send or acknowledge)
ip link set can0 type can bitrate 500000 listen-only on
```

#### 1.5 Quick Verification Tools

The official stress test tool `can_stress` and the interop verification tool `can_pair_test` are provided:

```text
Source path: hobot-io-samples/debian/app/Can/socketcan/
├── can_stress.c       # C stress/latency test tool
├── can_stress.py      # Python version
├── can_pair_test.c    # paired interop verification (can0<->can1, can2<->can3)
├── Makefile
└── README.md
```

Compilation and usage:

```shell
cd hobot-io-samples/debian/app/Can/socketcan
make

# single-channel loopback test (CAN-FD, 64 bytes, 1 ms period, 60 seconds)
sudo ./can_stress -i can0 -f 1 -l 64 -t 0x100 -r 0x100 -p 1 -w 1000 -L -D 60

# dual-channel concurrent interconnect test
sudo ./can_stress -i can0 -f 1 -l 64 -t 0x100 -r 0x101 -p 1 -w 1000 -L \
                 -i can1 -f 1 -l 64 -t 0x101 -r 0x100 -p 1 -w 1000 -L -D 60

# paired interop verification (hardware connection can0<->can1, can2<->can3)
sudo ./can_pair_test
```

#### 1.6 Errors and Statistics

```shell
# network TX/RX statistics
ip -s link show can0

# ethtool ring parameters and statistics
ethtool -g can0
ethtool -S can0

# CAN controller status and error counters
ip -details link show can0
```

### 2. Bypass Protocol Stack (Fastpath) Usage

The bypass protocol stack exchanges CAN frames directly with user space in interrupt context through a shared-memory ring buffer (mmap), bypassing the SocketCAN/NAPI protocol stack. It offers lower latency and jitter, and is suitable for scenarios with real-time requirements. Compilation is controlled by the kernel configuration `CONFIG_CAN_FLEXCAN_FASTPATH` (default `y`), and it is enabled at runtime via module parameters.

#### 2.1 Enable Fastpath (Module Loading)

Fastpath is disabled by default and is enabled via `flexcan` module parameters:

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `shm_rx` | bool | 0(off) | enable the fast receive channel |
| `shm_rx_entries` | uint | 1024 | number of RX ring buffer entries |
| `shm_tx` | bool | 0(off) | enable the fast transmit channel |
| `shm_tx_entries` | uint | 1024 | number of TX ring buffer entries |
| `shm_tx_budget` | uint | 256 | maximum number of entries sent per doorbell/interrupt |

```shell
# enable bidirectional fast channels at load time
modprobe flexcan shm_rx=1 shm_rx_entries=2048 shm_tx=1 shm_tx_entries=2048

# or modify via sysfs at runtime (must be set before bringing the interface up)
echo 1 | sudo tee /sys/module/flexcan/parameters/shm_tx
echo 1 | sudo tee /sys/module/flexcan/parameters/shm_rx
```

:::warning When the Parameters Take Effect
The parameters are read when `ip link set canX up` is executed, at which point the shared memory and misc devices are initialized. After modification, the interface must be brought up again:

```shell
ip link set can0 down
echo 1 > /sys/module/flexcan/parameters/shm_rx
ip link set can0 up
```
:::

After loading and bringing up the interface, misc device nodes are created (one pair per CAN channel):

```shell
ls -l /dev/flexcan_shm_rx_can0 /dev/flexcan_shm_tx_can0
```

#### 2.2 Header Files and Link Library

- **Header files**: `hobot_can_hal.h` + `hobot_can_hal_fast.h`
- **Link library**: `-lhbcanhal`
- **Applicable languages**: C / C++

#### 2.3 Data Types

The fast path reuses the ordinary interface's `struct canframe` (defined in `hobot_can_hal.h`):

```c
struct canframe {
    uint64_t time_stamp;   /* hardware RX timestamp (µs), ignored for TX        */
    uint32_t canid;        /* pure numeric CAN ID, without any flag bits        */
    uint8_t  count;        /* unused by the fast path, fixed to 0               */
    uint8_t  can_type;     /* frame type, one of the CANFAST_TYPE_* values      */
    uint8_t  can_channel;  /* unused by the fast path, fixed to 0               */
    uint8_t  len;          /* payload length in bytes (CAN: 0~8, CANFD: 0~64)   */
    uint8_t  data[64];     /* payload data                                     */
};
```

`can_type` encodes both the frame format (SFF/EFF) and the bus type (classic CAN / CANFD+BRS), taking one of the following constants:

| Constant | Value | Meaning |
| -------- | ----- | ------- |
| `CANFAST_TYPE_CAN` | 0 | classic CAN, standard frame (SFF, 11-bit ID, `len` ≤ 8) |
| `CANFAST_TYPE_CAN_EFF` | 1 | classic CAN, extended frame (EFF, 29-bit ID, `len` ≤ 8) |
| `CANFAST_TYPE_CANFD` | 2 | CAN FD + BRS, standard frame (SFF, `len` ≤ 64) |
| `CANFAST_TYPE_CANFD_EFF` | 3 | CAN FD + BRS, extended frame (EFF, `len` ≤ 64) |

`canid` is always a pure number without any flag bits. On TX, the frame format is determined by `can_type`; on RX, `canid` is likewise the pure number with flags removed, so no additional masking is required.

#### 2.4 Interface Overview

| Function | Purpose |
| -------- | ------- |
| `canFastTxOpen(ifname)` | open the TX channel, clear stale frames, return a handle |
| `canFastTxClose(tx)` | close the TX channel and release resources |
| `canFastSend(tx, frames[], n)` | send in bulk (up to n frames) |
| `canFastPollTx(tx, ms)` | wait until the TX ring has space |
| `canFastRxOpen(ifname)` | open the RX channel, discard stale frames, return a handle |
| `canFastRxClose(rx)` | close the RX channel and release resources |
| `canFastRecv(rx, frames[], n)` | receive in bulk (up to n frames) |
| `canFastPollRx(rx, ms)` | wait until RX has data |
| `canFastRxDropped(rx)` | query the kernel packet-drop count |
| `canFastIsEff(can_type)` | check whether it is an extended frame (returns 0 or 1) |
| `canFastIsFd(can_type)` | check whether it is a CANFD frame (returns 0 or 1) |

:::note Automatic Clearing of Stale Frames on Open
`canFastTxOpen` aligns the TX ring head to the current tail, discarding unsent frames left by the previous process; `canFastRxOpen` aligns the RX ring tail to the current head, discarding unconsumed frames left by the previous process. No manual reset is needed, so "old-frame resend" will not occur when running tests multiple times.
:::

#### 2.5 Code Examples

##### 2.5.1 Send: Classic CAN Standard Frame (Single Frame)

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
    frame.can_type  = CANFAST_TYPE_CAN;   /* classic CAN, standard frame */
    frame.len       = 8;
    frame.data[0]   = 0xAA;
    frame.data[1]   = 0xBB;

    int rc;
    do {
        rc = canFastSend(tx, &frame, 1);
        if (rc == -EAGAIN) canFastPollTx(tx, 100);
    } while (rc == -EAGAIN);
    printf("send rc=%d\n", rc);   /* rc==1 means 1 frame was sent successfully */

    canFastTxClose(tx);
    return 0;
}
```

##### 2.5.2 Send: CANFD + BRS Extended Frame (Bulk)

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
        frames[i].can_type = CANFAST_TYPE_CANFD_EFF;   /* CANFD + BRS, extended frame */
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

##### 2.5.3 Receive: Bulk Receive and Parse

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

##### 2.5.4 Bidirectional Communication (Separate TX and RX Threads)

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
        frames[i].can_type = CANFAST_TYPE_CANFD;   /* CANFD + BRS, standard frame */
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

#### 2.6 Error Handling and Notes

**Error handling:**

```c
int rc = canFastSend(tx, frames, count);
if (rc < 0) {
    if (rc == -EAGAIN) {
        /* TX ring is full; wait and retry */
        canFastPollTx(tx, 10);
    } else if (rc == -EINVAL) {
        /* invalid parameter; check whether canFastTxOpen succeeded and whether frames/count are valid */
    } else {
        fprintf(stderr, "canFastSend error: %s\n", strerror(-rc));
    }
} else if (rc < (int)count) {
    /* the ring was full and only some frames were sent; call again with the remaining pointer and count */
}
```

**Notes:**

- **Thread safety**: the same handle must not be called concurrently by multiple threads. Each thread should call `canFastTxOpen` / `canFastRxOpen` independently and hold its own handle.
- **TX ring full**: when `canFastSend` returns `-EAGAIN`, the frame has not been sent and must be retried (unless the business allows dropping frames). It is recommended to call `canFastPollTx(tx, ms)` to wait for space and then retry.
- **RX packet loss**: `canFastRxDropped(rx) > 0` means the consumption speed is slower than the kernel write speed. You can increase `BATCH`, reduce processing time, or increase the kernel `shm_rx_entries`.
- **Resource release**: before the program exits, `canFastTxClose` / `canFastRxClose` must be called to avoid mmap and fd leaks. It is recommended to set an exit flag in the `SIGINT` / `SIGTERM` signal handler and perform close after the main loop exits.

#### 2.7 Bypass Channel vs. Standard Path Comparison

| Dimension | Standard SocketCAN | Bypass Fastpath |
| --------- | ------------------ | --------------- |
| User interface | `PF_CAN` raw socket | `/dev/flexcan_shm_rx/tx_*` + `hobot_can_hal_fast` library |
| TX/RX path | skb + NAPI + net_rx_action | mmap ring buffer + IRQ direct write |
| Latency | higher (protocol stack overhead) | low (bypasses the protocol stack, µs level) |
| Default state | available once the interface is up | module parameter off, activated only when the misc device is opened |
| CAN-FD | supported | supported |
| Message filtering | SocketCAN filter | none (filtered in user space) |

### 3. Acore Takes Over MCU-domain CAN (Expanding CAN Channels) {#acore-takes-over-mcu-domain-can-expanding-can-channels}

#### 3.1 Background

The S600 Acore/Main domain has only 4 CAN channels. When the business needs more CAN channels, Acore can directly control the MCU-domain CAN controllers, taking over up to 6 additional channels (`canfd4`~`canfd9`), expanding the CAN channels available to Acore to 10.

On the Acore side, the standard FlexCAN driver directly accesses the MCU-domain CAN register space (memory mapping), and the data TX/RX path is direct register access, **without IPC forwarding**. Interrupts are routed from the MCU domain to Acore via inter-core interrupts (IPI).

Since MCU-domain CAN controllers are initialized and managed by the MCU side by default, the configuration must be modified on the **MCU side** before takeover, releasing the CAN controller's interrupt, clock, and startup control from the MCU side. Otherwise, issues such as both cores simultaneously grabbing interrupts and the clock not being switched will occur. The inter-core passthrough solution for MCU-domain CAN (CAN2IPC / CANHAL) has dedicated documentation, which is not repeated here.

#### 3.2 CAN Node Mapping

The correspondence between the MCU-domain CAN nodes in the Acore device tree and the CAN controllers on the MCU side:

| Acore Device Node | MCU-side CAN | Register Base Address | Default Status |
| ----------------- | ------------ | --------------------- | -------------- |
| `canfd4` | CAN1 | `0x23870000` | `disabled` |
| `canfd5` | CAN2 | `0x23880000` | `disabled` |
| `canfd6` | CAN5 | `0x238b0000` | `disabled` |
| `canfd7` | CAN6 | `0x238c0000` | `disabled` |
| `canfd8` | CAN7 | `0x238d0000` | `disabled` |
| `canfd9` | CAN8 | `0x238e0000` | `disabled` |

The Acore-side device tree nodes and interrupt routing configuration have been merged into the mainline code. To use a particular CAN channel, simply change the `status` of the corresponding node from `disabled` to `okay` in the board-level DTS. The default `disabled` setting prevents anomalies for customers who use MCU-side CAN.

#### 3.3 MCU-side Changes (Three Modification Points)

For each CAN controller to be handed over to Acore, the MCU side requires **3 modifications**, following this rule: **hand over to Acore = make all three changes; keep on MCU = make none of the three changes**.

| No. | Modification Point | File | Function | Operation |
| --- | ------------------ | ---- | -------- | --------- |
| ① | Interrupt registration | `Isr_Hal.c` | `Interrupt_McuConfigs[]` array | comment out the interrupt configuration line for the corresponding CAN |
| ② | Clock register | `Can_test.c` | `Can_Initclock()` | change the clock register write value from `0x8000` to `0x8001` |
| ③ | Controller startup | `Can_test.c` | `CanPro_Init()` | comment out the corresponding `Can_SetControllerMode(..., CAN_CS_STARTED)` |

**CAN controller parameter reference table:**

| CAN No. | CANFD | Clock Register Address | Controller Enum | Interrupt Channel / ISR |
| ------- | ----- | ---------------------- | --------------- | ----------------------- |
| 1 | CANFD1 | `0x235200CC` | `CanController_1` | `Os_IntChannel_Can1_DataIsr` / `Os_Isr_Can1_DataIsr` |
| 2 | CANFD2 | `0x235200D0` | `CanController_2` | `Os_IntChannel_Can2_DataIsr` / `Os_Isr_Can2_DataIsr` |
| 5 | CANFD5 | `0x235200DC` | `CanController_5` | `Os_IntChannel_Can5_DataIsr` / `Os_Isr_Can5_DataIsr` |
| 6 | CANFD6 | `0x235200E0` | `CanController_6` | `Os_IntChannel_Can6_DataIsr` / `Os_Isr_Can6_DataIsr` |
| 7 | CANFD7 | `0x235200E4` | `CanController_7` | `Os_IntChannel_Can7_DataIsr` / `Os_Isr_Can7_DataIsr` |
| 8 | CANFD8 | `0x235200E8` | `CanController_8` | `Os_IntChannel_Can8_DataIsr` / `Os_Isr_Can8_DataIsr` |

##### Modification Point ① — Interrupt Registration (`Isr_Hal.c`)

File path: `Target/Target_S600/Target-hobot-lite-freertos-mcu1/target/FreeRtosOsHal/Isr_Hal.c`

In the `Interrupt_McuConfigs[]` array, each CAN controller corresponds to one interrupt configuration entry. For controllers handed over to Acore, **comment out** this line so that the MCU no longer registers and responds to the CAN data interrupt, avoiding dual-core contention:

```c
// For the CAN handed over to Acore, comment out this line:
//{Os_IntChannel_Can1_DataIsr, Os_Isr_Can1_DataIsr, OS_IMASK_FOR_Can1_DataIsr/8, ENABLE},
```

##### Modification Point ② — Clock Register (`Can_test.c` / `Can_Initclock()`)

File path: `samples/Can/Can_Pro_Sample/src/Can_test.c`

`Can_Initclock()` writes the clock register value for each CANFD, controlling clock ownership:

- `0x8000`: clock used by the **MCU domain** (default, corresponding to 40MHz)
- `0x8001`: clock handed over to the **Acore domain** (bit0 set to 1 means ownership switched to Acore, corresponding to 80MHz)

For controllers handed over to Acore, change the corresponding `writel` value from `0x8000` to `0x8001`:

```c
writel((__IO uint32 *)(0x235200CC), 0x8001); // CANFD1
```

##### Modification Point ③ — Controller Startup (`Can_test.c` / `CanPro_Init()`)

File path: `samples/Can/Can_Pro_Sample/src/Can_test.c`

`CanPro_Init()` calls `Can_SetControllerMode(CanController_X, CAN_CS_STARTED)` for each controller to start it. For controllers handed over to Acore, **comment out** this call so that the MCU does not start the controller, and Acore initializes and starts it by itself:

```c
//Can_SetControllerMode(CanController_1, CAN_CS_STARTED);
```

##### Quick Reference Table for Each CAN Controller Modification

| CAN to Hand Over to Acore | `Isr_Hal.c` Line to Comment Out | `Can_Initclock` Register to Change | `CanPro_Init` Line to Comment Out |
| ------------------------- | ------------------------------- | ---------------------------------- | --------------------------------- |
| CAN1 | `Can1_DataIsr` | CANFD1 `0x235200CC` → `0x8001` | `CanController_1` |
| CAN2 | `Can2_DataIsr` | CANFD2 `0x235200D0` → `0x8001` | `CanController_2` |
| CAN5 | `Can5_DataIsr` | CANFD5 `0x235200DC` → `0x8001` | `CanController_5` |
| CAN6 | `Can6_DataIsr` | CANFD6 `0x235200E0` → `0x8001` | `CanController_6` |
| CAN7 | `Can7_DataIsr` | CANFD7 `0x235200E4` → `0x8001` | `CanController_7` |
| CAN8 | `Can8_DataIsr` | CANFD8 `0x235200E8` → `0x8001` | `CanController_8` |

#### 3.4 Compilation and Upgrade Process

After making the changes, upgrade MCU1 and then the kernel in sequence:

**① Upgrade MCU1**
Apply the MCU patch, compile MCU1, and upgrade MCU1.
**② Upgrade the kernel**
After merging the Acore-side device tree changes, recompile the kernel and upgrade it.

#### 3.5 System Startup Sequence

:::warning Startup Sequence
The system must **start MCU1 first and then load the CAN modules**, otherwise anomalies will occur.
:::

```shell
# 1. Start MCU1 first
cd /sys/class/remoteproc/remoteproc_mcu0
echo S600_MCU_DEBUG.elf > firmware
echo start > state

# 2. Load the CAN modules
modprobe can
modprobe can-raw
modprobe flexcan

# 3. Configure the CAN interfaces (Acore domain can0~can3 + MCU domain can4~can5, CAN-FD 1M/5M)
ip link set can0 down
ip link set can0 type can fd on loopback off bitrate 1000000 sample-point 0.75 dbitrate 5000000 dsample-point 0.75
ip link set can0 up

ip link set can4 down
ip link set can4 type can fd on loopback off bitrate 1000000 sample-point 0.75 dbitrate 5000000 dsample-point 0.75
ip link set can4 up

# ... configure can1~can3 and can5 the same way

# 4. Test verification
candump -ta can4
cansend can5 123#1122334455667788
```

:::warning Mutually Exclusive with the MCU Passthrough Solution
Once an MCU-domain CAN controller is taken over by Acore, the MCU-side CAN2IPC passthrough path becomes invalid for that controller.
:::

</DocScope>

## Debugging

### Logs and Device Confirmation

```shell
# driver probe log
dmesg | grep -i flexcan

# network device
ip link show can0

# bypass misc device (only after enabled and brought up)
ls -l /dev/flexcan_shm_rx_can0 /dev/flexcan_shm_tx_can0
```

### Common Issue Troubleshooting

- **CAN cannot receive data**: ① confirm `gpio369` is pulled low (`cat /sys/class/gpio/gpio369/value` should be 0); ② confirm `canfd0`~`canfd3` are `okay` in the device tree and the conflicting SPI0/UART are `disabled`; ③ confirm the three modules are loaded (`lsmod | grep -E "can|flexcan"`); ④ confirm the interface is `up` and the baud rate matches the peer.
- **misc device not appearing**: confirm `CONFIG_CAN_FLEXCAN_FASTPATH=y`, `shm_rx=1`/`shm_tx=1` are set, and the interface is `up`.
- **Bypass RX packet loss**: check `canFastRxDropped(rx)` and increase `shm_rx_entries`.
- **MCU-domain CAN startup reports interrupt conflict**: confirm the board-level DTS has enabled the corresponding CAN node and the three MCU-side modifications are all done (interrupt commented out, clock changed to `0x8001`, startup commented out).

## FAQ

#### Q1: Why can't CAN0/CAN1 be used?

A: CAN0/CAN1 share the same group of 4 pins with SPI0. Disable SPI0 in the device tree (`status = "disabled"`) and enable the CAN nodes.

#### Q2: Why can't I receive data?

A: The most common cause is that the **CAN_STB pin is not pulled low**. The transceiver is in standby mode and cannot transmit or receive. Run `echo out > /sys/class/gpio/gpio369/direction; echo 0 > /sys/class/gpio/gpio369/value`.

#### Q3: Which three modules need to be loaded?

A: `can` (CAN framework), `can-raw` (raw socket), `flexcan` (hardware driver).

#### Q4: Does CAN-FD require RX Mailbox mode?

A: Yes. The FlexCAN hardware limitation means CAN-FD does not support RX-FIFO. The S600 devtype is fixed to use RX Mailbox + RTR reception, with no configuration needed. CAN-FD and three-sample mode (`CAN_CTRLMODE_3_SAMPLES`) cannot be used simultaneously.

#### Q5: Does the bypass protocol stack affect standard SocketCAN?

A: No. When the module parameter is off by default, the standard path is unaffected. Only after user space `open`s the shm_rx device does the controller's receive interrupt switch to the fast path. shm_tx shares the TX Mailbox with the standard netdev and is serialized via `tx_lock`, so there is no conflict.

#### Q6: What is the difference between the fast path interface and the ordinary interface?

A: The fast path exchanges frames directly with the FlexCAN driver through a kernel shared-memory ring buffer (mmap), bypassing the socket and protocol stack, with lower latency (µs level); the ordinary interface (`canSendMsgFrame`, etc.) goes through IPCF/socket and the kernel protocol stack, with higher latency. The fast path only requires the interface name and no configuration file, and the maximum frame length is 64 bytes (CANFD).
