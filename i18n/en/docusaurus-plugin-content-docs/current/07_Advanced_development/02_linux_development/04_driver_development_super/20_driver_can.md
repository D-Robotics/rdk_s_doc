---
sidebar_position: 20
---

# CAN Debugging Guide

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Preface

<DocScope products="RDK S100">

This chapter mainly introduces the S100 SocketCAN configuration and error debugging methods.

### MCU-Side Initialization Configuration

<DocScope products="RDK S100">

The STBY pin of the CAN transceiver is high by default, which keeps the transceiver in STANDBY mode. The MCU side must **pull the STBY pin low** to exit STANDBY mode; otherwise, the CAN transceiver cannot work properly. The MCU side needs to execute the following code:

```
/* Set the clock source of CAN0~9 according to the actual situation, consistent with the device tree (80M); call this after McuFunc_ModuleInit/Mcu_InitClock */
writel((__IO uint32 *)(0x2370007c), 0x8001);
writel((__IO uint32 *)(0x23700080), 0x8001);
writel((__IO uint32 *)(0x23700084), 0x8001);
writel((__IO uint32 *)(0x23700088), 0x8001);
writel((__IO uint32 *)(0x2370008c), 0x8001);
writel((__IO uint32 *)(0x23700090), 0x8001);
writel((__IO uint32 *)(0x23700094), 0x8001);
writel((__IO uint32 *)(0x23700098), 0x8001);
writel((__IO uint32 *)(0x2370009c), 0x8001);
writel((__IO uint32 *)(0x237000a0), 0x8001);

/* Pull STBY low to enable the CAN transceiver */
Port_Lld_SetPinModeWithoutCheck(6, PORT_PINMUX_GPIO, S100_PORT_MCU);
Port_Lld_SetGpioDirWithoutCheck(6, PORT_PIN_DIR_OUT, S100_PORT_MCU);
Dio_WriteChannel(6, STD_LOW);
```
</DocScope>

### Device Tree Code

dts files related to CAN configuration in the S100:

```text
|-- source/hobot-drivers/kernel-dts/drobot-s100-soc.dtsi   # canfd0~canfd5 device nodes
```

### Device Tree Configuration Description

<DocScope products="RDK S100">

The S100 A-Core side has a total of 6 FlexCAN nodes:

```dts
canfd1: canfd@0x23720000 {
    status = "okay";
    compatible = "hobot,s100-flexcan";
    reg = <0x0 0x23720000 0x0 0x4000>;
    interrupts = <GIC_SPI MCUSYS_CANFD5_IPI_MB_INTR  IRQ_TYPE_LEVEL_HIGH>,
                 <GIC_SPI MCUSYS_CANFD5_IPI_ERR_INTR IRQ_TYPE_LEVEL_HIGH>;
    clock-frequency = <80000000>;
    fsl,clk-source = <0>;
};
```

The mapping between each node and the MCU-side CAN-FD is as follows:

| A-Core Device Node | MCU-Side CAN Controller | Register Address | Default Status |
| -------------- | --------------- | ---------- | -------- |
| canfd0         | MCU canfd3      | 0x235b0000 | disabled |
| canfd1         | MCU canfd5      | 0x23720000 | disabled |
| canfd2         | MCU canfd6      | 0x23730000 | disabled |
| canfd3         | MCU canfd7      | 0x23740000 | disabled |
| canfd4         | MCU canfd8      | 0x23750000 | disabled |
| canfd5         | MCU canfd9      | 0x23760000 | disabled |

Configuration item descriptions:

-   `compatible = "hobot,s100-flexcan"`: vendor and model.
-   `reg`: register address range occupied by the device.
-   `interrupts`: two interrupts, the Mailbox TX/RX interrupt (`_IPI_MB_INTR`) and the error interrupt (`_IPI_ERR_INTR`).
-   `clock-frequency`: CAN module clock, 80 MHz; the baud rate calculation is based on this value.
-   `fsl,clk-source`: clock source selection.

</DocScope>

## Environment Setup and Testing

<DocScope products="RDK S100">
This section uses the default-enabled **can1** (canfd1, MCU-side canfd5) as an example to introduce the basic functions of SocketCAN.
</DocScope>

### Test Environment Preparation

The board must have `iproute2` (the `ip` command) and `can-utils` (`candump`/`cansend`).

#### 1. Load the FlexCAN Driver

If the FlexCAN driver is compiled as a kernel module, load it first:

```bash
modprobe flexcan
```

After loading, use `ip link` to confirm that the can0~can5 devices are present:

```bash
ip link show
```

If the driver is built in to the kernel image, this step is not required; the CAN devices are visible directly after the system boots.

#### 2. Configure the Bitrate and Enable the Interface

Classic CAN

```bash
# Bring the interface down first (parameters can only be changed in the DOWN state)
ip link set can1 down
# Configure the bitrate and sample point
ip link set can1 type can bitrate 500000 sample-point 0.8
# Enable the interface
ip link set can1 up
```
CAN-FD

```bash
# Bring the interface down first (parameters can only be changed in the DOWN state)
ip link set can1 down
# Configure CAN FD: arbitration phase 1 Mbps, sample point 80%; data phase 5 Mbps, sample point 75%
ip link set can1 type can bitrate 1000000 sample-point 0.8 dbitrate 5000000 dsample-point 0.75 fd on
# Enable the interface
ip link set can1 up
```


#### Common Parameters [ip link set]

| Parameter | Description | Example |
|------|------|------|
| `bitrate N` | Arbitration-phase bitrate / classic CAN bitrate | `bitrate 500000` |
| `dbitrate N` | CAN FD data-phase bitrate | `dbitrate 5000000` |
| `restart-ms N` | Automatically recover N ms after bus-off | `restart-ms 3000` |
| `berr-reporting on/off` | Report bus error frames | `berr-reporting on` |
| `loopback on/off` | Internal loopback | `loopback on` |
| `listen-only on/off` | Listen-only mode | `listen-only on` |
| `one-shot on/off` | Do not automatically retransmit after a failed transmission | `one-shot on` |
| `fd on/off` | CAN FD mode support | `fd on` |

:::tip
When debugging error states, it is recommended to enable `berr-reporting on`; otherwise, the driver will not report bus error frames such as BIT0/CRC, and `candump` will not show error details.
:::

### Basic Transmit/Receive Test

#### Internal Loopback Test

```bash
ip link set can1 down
ip link set can1 type can bitrate 500000 loopback on
ip link set can1 up

# Terminal A: capture frames
candump can1 &
# Terminal B: send a standard frame, ID=0x123, 8 data bytes
cansend can1 123#1122334455667788
```

In loopback mode, transmitted frames are received by the interface itself, and `candump` should print `can1  123   [8]  11 22 33 44 55 66 77 88`.

#### Two-Node Closed-Loop Test

Connect the CAN_H/CAN_L of two CAN channels (for example, can1 and can2), and connect a 120Ω termination resistor at each end (on the S100 MCU daughter board, connect it via a jumper cap). Send from one end and receive at the other:

```bash
# Node A (can1)
cansend can1 123#AABBCCDD
# Node B (can2)
candump can2
```
## SocketCAN Debugging

### Viewing Interface Status and Error Counters

```bash
# View detailed CAN parameters
ip -s -d link show can1
```

Example output:

```c
18: can1: <NOARP,UP,LOWER_UP,ECHO> mtu 16 qdisc pfifo_fast state UP mode DEFAULT group default qlen 10
    link/can  promiscuity 0 minmtu 0 maxmtu 0
    can <BERR-REPORTING> state ERROR-ACTIVE (berr-counter tx 0 rx 0) restart-ms 3000
          bitrate 500000 sample-point 0.875
          tq 25 prop-seg 37 phase-seg1 32 phase-seg2 10 sjw 1
          flexcan: tseg1 2..96 tseg2 2..32 sjw 1..16 brp 1..1024 brp-inc 1
          flexcan: dtseg1 2..39 dtseg2 2..8 dsjw 1..4 dbrp 1..1024 dbrp-inc 1
          clock 80000000
          re-started bus-errors arbit-lost error-warn error-pass bus-off
          0          0          0          0          0          0         numtxqueues 1 numrxqueues 1 gso_max_size 65536 gso_max_segs 65535 parentbus platform parentdev 23740000.canfd
    RX:  bytes packets errors dropped  missed   mcast
             4       1      0       0       0       0
    TX:  bytes packets errors dropped carrier collsns
             4       1      0       0       0       0

```

### Error State Machine and bus-off

The CAN controller maintains an error state machine based on TEC/REC; different counter values correspond to different error levels:

| State | TEC / REC | Meaning | Reported As |
|------|-----------|------|------|
| ERROR-ACTIVE | 0 ~ 95 | Normal transmit/receive, active error flag | — |
| ERROR-WARNING | 96 ~ 127 | Error warning | `CAN_ERR_CRTL` + TX/RX_WARNING |
| ERROR-PASSIVE | 128 ~ 255 | Passive error, transmit/receive restricted | `CAN_ERR_CRTL` + TX/RX_PASSIVE |
| BUS-OFF | ≥ 256 | Bus off, transmit/receive stopped | `CAN_ERR_BUSOFF` |

#### Understanding Error Frame Fields

After enabling `berr-reporting on`, error frames can be seen with `candump -e can1`. An error frame is a `struct can_frame` whose `can_id` carries `CAN_ERR_FLAG (0x20000000)`, with `len=8`:

| Field | Meaning | Common Values |
|------|------|----------|
| `can_id` bits | Error category | `CAN_ERR_BUSOFF=0x40`, `CAN_ERR_CRTL=0x04`, `CAN_ERR_PROT=0x08`, `CAN_ERR_ACK=0x20`, `CAN_ERR_BUSERROR=0x80`, `CAN_ERR_RESTARTED=0x100` |
| `data[1]` | CRTL status | `CAN_ERR_CRTL_RX_WARNING=0x04`, `TX_WARNING=0x08`, `RX_PASSIVE=0x10`, `TX_PASSIVE=0x20` |
| `data[2]` | PROT error type | `CAN_ERR_PROT_BIT0=0x08`, `BIT1=0x10`, `BIT(single/CRC)=0x01`, `FORM=0x02`, `STUFF=0x04` |
| `data[3]` | PROT error location | `CAN_ERR_PROT_LOC_ACK=0x19`, `CAN_ERR_PROT_LOC_CRC_SEQ=0x08`, etc. |

For example, when a bus-off occurs, a frame with `can_id=0x20000040` is usually received first (reporting entry into the BUS-OFF state), immediately followed by a frame with `can_id=0x20000088` (reporting the specific bus error, where `data[2]=0x08` indicates BIT0). See the table above for the correspondence between error categories and field meanings.

### bus-off Recovery

Recovery falls into two categories: automatic recovery (recovery occurs automatically when the timer set by restart-ms expires) and manual soft reset. Both ultimately bring the controller back to the normal transmit/receive state (ERROR-ACTIVE) through a soft reset.

#### Automatic Recovery (restart-ms > 0)

```bash
ip link set can1 down
ip link set can1 type can restart-ms 3000   # Automatically recover 3 seconds after bus-off
ip link set can1 up
```

After bus-off, the driver automatically performs a soft reset when the time set by `restart-ms` expires, and sends a `CAN_ERR_RESTARTED` frame to notify the application layer.

#### Manual Soft Reset

In addition to automatic recovery, a soft reset can be triggered manually in two ways:

**Method 1: the restart command**

```bash
ip link set can1 type can restart
```

This command triggers a soft reset. After recovery, the interface carrier is turned on again, the state returns to ERROR-ACTIVE, and a `CAN_ERR_RESTARTED` frame is sent to the application layer. It succeeds only when `restart_ms == 0` and `state == BUS_OFF`; otherwise, it returns:

| Error | Cause | Solution |
|------|------|------|
| `Invalid argument` (-EINVAL) | `restart_ms != 0` (manual restart is not allowed while automatic recovery is enabled) | Run `down`, set `restart-ms 0`, then run `up` |
| `Device or resource busy` (-EBUSY) | `state != BUS_OFF` (bus-off has not actually occurred) | Confirm that bus-off has actually occurred; an ACK error only reaches error-passive, which does not count as bus-off |

**Method 2: down + up**

```bash
ip link set can1 down
ip link set can1 up
```

Running down followed by up reinitializes the entire interface (re-requesting interrupts and transmit/receive resources and performing a soft reset), returning the state to ERROR-ACTIVE.

:::caution
If the MCU-side CAN transceiver is not enabled and causes bus-off, both automatic recovery and manual soft reset will "immediately enter bus-off again after a successful recovery", appearing as a repeated `bus-off -> restart -> bus-off` loop. In this case, check the MCU-side physical layer.
:::

## Error Frame Monitoring: User-Space Example

The following is an example error frame monitoring program based on a RAW socket, which can decode BUS OFF / ACK / CRC and other information (requires `berr-reporting on`):

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <sys/socket.h>
#include <sys/ioctl.h>
#include <sys/time.h>
#include <net/if.h>
#include <linux/can.h>
#include <linux/can/raw.h>
#include <linux/can/error.h>
#include <linux/can/netlink.h>

static volatile int running = 1;
static void sig_handler(int s) { running = 0; }

/* Decode the error frame */
static void parse_err_frame(const struct can_frame *cf, struct timeval *tv) {
    printf("[%ld.%06ld] ", tv->tv_sec, tv->tv_usec);
    canid_t id = cf->can_id;

    /* Error category */
    if (id & CAN_ERR_BUSOFF)    printf("[BUS-OFF] ");
    if (id & CAN_ERR_ACK)       printf("[ACK_ERR] ");
    if (id & CAN_ERR_RESTARTED) printf("[RESTARTED] ");

    /* Controller status */
    if (id & CAN_ERR_CRTL) {
        printf("[CRTL] ");
        if (cf->data[1] & CAN_ERR_CRTL_TX_WARNING) printf("TX_WRN ");
        if (cf->data[1] & CAN_ERR_CRTL_RX_WARNING) printf("RX_WRN ");
        if (cf->data[1] & CAN_ERR_CRTL_TX_PASSIVE) printf("TX_PASSIVE ");
        if (cf->data[1] & CAN_ERR_CRTL_RX_PASSIVE) printf("RX_PASSIVE ");
    }

    /* Protocol error type */
    if (id & CAN_ERR_PROT) {
        printf("[PROT] ");
        if (cf->data[2] & CAN_ERR_PROT_BIT0)  printf("BIT0_ERR ");
        if (cf->data[2] & CAN_ERR_PROT_BIT1)  printf("BIT1_ERR ");
        if (cf->data[2] & CAN_ERR_PROT_FORM)  printf("FORM_ERR ");
        if (cf->data[2] & CAN_ERR_PROT_STUFF) printf("STUFF_ERR ");
        if (cf->data[2] & CAN_ERR_PROT_BIT)   printf("CRC_ERR ");
    }

    printf("\n");
}

int main(int argc, char **argv) {
    /* Interface name, can be specified via a command-line argument, defaults to can1 */
    const char *ifname = argc > 1 ? argv[1] : "can1";

    struct sigaction sa = { .sa_handler = sig_handler };
    sigaction(SIGINT, &sa, NULL);

    /* Create a CAN_RAW socket */
    int s = socket(PF_CAN, SOCK_RAW, CAN_RAW);

    /* Get the index of the specified CAN interface */
    struct ifreq ifr = {0};
    strncpy(ifr.ifr_name, ifname, IFNAMSIZ - 1);
    ioctl(s, SIOCGIFINDEX, &ifr);

    /* Clear the normal data frame filter: length 0, so no normal CAN data frames are received */
    struct can_filter empty[0];
    setsockopt(s, SOL_CAN_RAW, CAN_RAW_FILTER, empty, 0);

    /* Enable error message frame filtering: receive all types of errors */
    can_err_mask_t err_mask = CAN_ERR_MASK;
    setsockopt(s, SOL_CAN_RAW, CAN_RAW_ERR_FILTER, &err_mask, sizeof(err_mask));

    /* Enable timestamps */
    int enable = 1;
    setsockopt(s, SOL_SOCKET, SO_TIMESTAMP, &enable, sizeof(enable));

    /* Bind the socket to the specified CAN interface */
    struct sockaddr_can addr = {
        .can_family  = AF_CAN,
        .can_ifindex = ifr.ifr_ifindex
    };
    if (bind(s, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("bind");
        close(s);
        return 1;
    }

    printf("Listening for CAN error frames on %s ... (Ctrl+C to exit)\n", ifname);

    struct can_frame cf;
    struct msghdr msg = {0};
    struct iovec iov;
    unsigned char ctrl[1024];

    iov.iov_base = &cf;
    iov.iov_len = sizeof(cf);

    msg.msg_iov = &iov;
    msg.msg_iovlen = 1;
    msg.msg_control = ctrl;
    msg.msg_controllen = sizeof(ctrl);

    while (running) {
    msg.msg_controllen = sizeof(ctrl);
    ssize_t n = recvmsg(s, &msg, 0);

        if (n == sizeof(cf) && (cf.can_id & CAN_ERR_FLAG)) {
            struct timeval tv = {0, 0};
            struct cmsghdr *cmsg = CMSG_FIRSTHDR(&msg);

            while (cmsg) {
                if (cmsg->cmsg_level == SOL_SOCKET &&
                    cmsg->cmsg_type == SO_TIMESTAMP) {
                    tv = *(struct timeval *)CMSG_DATA(cmsg);
                    break;
                }
                cmsg = CMSG_NXTHDR(&msg, cmsg);
            }

            parse_err_frame(&cf, &tv);
        }
    }
    close(s);
    return 0;
}
```

Usage:

```bash
# Enable error reporting and set automatic recovery to 3s
ip link set can1 type can berr-reporting on restart-ms 3000
# Compile and run
gcc can_err_monitor.c -o can_err_monitor
./can_err_monitor can1
```
Example output
```c
Listening for CAN error frames on can1 ... (Ctrl+C to exit)
[1786678280.362306] [CRTL] TX_WRN
[1786678280.362316] [PROT] BIT0_ERR
[1786678280.362322] [CRTL] TX_PASSIVE  # Passive error
[1786678280.362323] [PROT] BIT0_ERR
[1786678280.362338] [PROT] BIT0_ERR
[1786678280.362363] [PROT] BIT0_ERR
[1786678280.362390] [PROT] BIT0_ERR
[1786678280.362415] [PROT] BIT0_ERR
[1786678280.362441] [PROT] BIT0_ERR
[1786678280.362469] [PROT] BIT0_ERR
[1786678280.362494] [PROT] BIT0_ERR
[1786678280.362518] [PROT] BIT0_ERR
[1786678280.362542] [PROT] BIT0_ERR
[1786678280.362569] [PROT] BIT0_ERR
[1786678280.362597] [PROT] BIT0_ERR
[1786678280.362623] [PROT] BIT0_ERR
[1786678280.362650] [PROT] BIT0_ERR
[1786678280.362673] [PROT] BIT0_ERR
[1786678280.362713] [BUS-OFF]        # A [BIT0_ERR] frame follows the [BUS-OFF] frame; the hardware timestamps of the two frames are almost identical (Δt=2us) because they come from the same interrupt: the driver reports the state change first, then the bus error
[1786678280.362715] [PROT] BIT0_ERR
[1786678283.389491] [RESTARTED]

```

## Error Frame Monitoring: Kernel Logs

1. First raise the flexcan log level (the driver must be loaded first):

```bash
echo 'file flexcan-core.c +p' > /sys/kernel/debug/dynamic_debug/control
```
2. View the kernel logs (`dmesg -w`):

```c
[ 3877.853136] IPv6: ADDRCONF(NETDEV_CHANGE): can1: link becomes ready
[ 4238.143737] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.143767] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.143789] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.143814] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.143841] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.143868] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.143892] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.143917] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.143944] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.143969] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.143995] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.144022] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.144048] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.144073] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.144097] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4238.144125] flexcan 23740000.canfd can1: bus-off, scheduling restart in 3000 ms
[ 4238.144135] flexcan 23740000.canfd can1: BIT0_ERR irq
[ 4241.368721] IPv6: ADDRCONF(NETDEV_CHANGE): can1: link becomes ready
[ 4241.368722] flexcan 23740000.canfd can1: writing ctrl=0x0000c050
[ 4241.368728] flexcan 23740000.canfd can1: writing cbt=0x802093e9
[ 4241.368731] flexcan 23740000.canfd can1: writing fdctrl=0x06c00000
[ 4241.368734] flexcan 23740000.canfd can1: flexcan_set_bittiming_cbt: mcr=0x5980000f ctrl=0x0000c050 ctrl2=0x80633800 fdctrl=0x06c00000 cbt=0x80000000 fdcbt=0x00000000
[ 4241.368739] flexcan 23740000.canfd can1: flexcan_chip_start: writing mcr=0x59a3023f
[ 4241.368742] flexcan 23740000.canfd can1: flexcan_chip_start: writing ctrl=0x00000050
[ 4241.368745] flexcan 23740000.canfd can1: flexcan_chip_start: writing fdctrl=0x06c00000
[ 4241.368795] flexcan 23740000.canfd can1: flexcan_chip_start: reading mcr=0x40a3023f ctrl=0x00000050

```

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

#### 1.6 Acquiring CAN Hardware Timestamps (RX)

FlexCAN supports **hardware timestamps for received frames**: when a message reaches the controller, the hardware latches the SoC RTC time into the
`HR_TIME_STAMPn` register. The driver reads this value back when receiving the frame, converts it to the `CLOCK_REALTIME` timeline, and finally
SocketCAN reports it to user space through the `SCM_TIMESTAMPING` control message.

| Item | Description |
| ---- | ---- |
| Supported direction | RX (receive) only; **TX hardware timestamps are not supported** |
| Time base | SoC RTC (32768 Hz tick); after conversion it falls on the `CLOCK_REALTIME` timeline |
| With Fastpath | After the bypass protocol stack is enabled, frames do not enter the protocol stack, so SocketCAN cannot obtain hardware timestamps |

:::note Prerequisites
- The driver must have hardware timestamp capability (`FLEXCAN_QUIRK_HW_TIMESTAMP`);
- The CAN interface is `up`, and the modules have been loaded and CAN_STB pulled low as described in Sections 1.2 and 1.3;
- `SIOCSHWTSTAMP` requires `root` (or `CAP_NET_ADMIN`).
:::

**Three-step call flow**

| Step | Interface | Purpose |
| ---- | ---- | ---- |
| 1 | `ioctl(SIOCSHWTSTAMP)` with `rx_filter = HWTSTAMP_FILTER_ALL` | Turn on the RX hardware timestamp switch for the entire network interface |
| 2 | `setsockopt(SO_TIMESTAMPING, SOF_TIMESTAMPING_RX_HARDWARE \| SOF_TIMESTAMPING_RAW_HARDWARE)` | Make the kernel deliver hardware timestamps to this socket |
| 3 | `recvmsg()` parses the `SCM_TIMESTAMPING` cmsg | The hardware timestamp is in `ts[2]`, in nanoseconds |

:::tip Why read ts[2]
The `SCM_TIMESTAMPING` data is always three `timespec` values, and FlexCAN fills only the last one:

```text
ts[0]  SOF_TIMESTAMPING_SOFTWARE      software timestamp
ts[1]  SOF_TIMESTAMPING_SYS_HARDWARE  converted hardware timestamp (not filled by flexcan)
ts[2]  SOF_TIMESTAMPING_RAW_HARDWARE  raw hardware timestamp   <-- use this one
```
:::

Key call stack:

```text
[Enable] application ioctl(SIOCSHWTSTAMP)
  sock_ioctl -> dev_ioctl -> dev_ifsioc -> dev_eth_ioctl
    -> flexcan_eth_ioctl -> flexcan_set_hwtstamp_config    # record rx_filter, set hwts.rx_enabled

[Receive] the CAN controller receives a message
  flexcan_irq -> flexcan_mailbox_read -> flexcan_hwts_read_mb      # read HR_TIME_STAMPn
    -> skb_hwtstamps(skb)->hwtstamp = flexcan_hwts_to_ktime()      # convert RTC time to CLOCK_REALTIME
    -> netif_receive_skb -> can_receive -> raw_rcv -> socket receive queue

[Read] application recvmsg()
  raw_recvmsg -> sock_recv_cmsgs -> __sock_recv_timestamp -> put_cmsg(SCM_TIMESTAMPING)
```

**① Check interface capabilities**

```shell
ethtool -T can0
```

If `SOF_TIMESTAMPING_RX_HARDWARE` / `SOF_TIMESTAMPING_RAW_HARDWARE` are valid, while
`SOF_TIMESTAMPING_TX_HARDWARE` is empty and `phc_index = -1`, only RX hardware timestamps are supported.

**② Enable/disable RX hardware timestamps**

User space issues it through `SIOCSHWTSTAMP` (already wrapped in the sample program):

```c
struct hwtstamp_config cfg = {
        .flags     = 0,
        .tx_type   = HWTSTAMP_TX_OFF,      /* flexcan has no TX hardware timestamp */
        .rx_filter = HWTSTAMP_FILTER_ALL,  /* timestamp all RX frames in hardware */
};
struct ifreq ifr = { 0 };
int fd = socket(AF_INET, SOCK_DGRAM, 0);

strncpy(ifr.ifr_name, "can0", IFNAMSIZ - 1);
ifr.ifr_data = &cfg;
ioctl(fd, SIOCSHWTSTAMP, &ifr);             /* requires CAP_NET_ADMIN;
                                             * use SIOCGHWTSTAMP to read back the current configuration */
```

To disable it, set `rx_filter` to `HWTSTAMP_FILTER_NONE` and issue the call again.

:::warning Device-level switch
This switch applies to the entire network interface. As long as one process enables it, other sockets can also obtain hardware timestamps;
`ip link set canX down` resets this state, and it must be issued again after bringing the interface back `up`.
:::

**③ Read hardware timestamps**

```c
unsigned int flags = SOF_TIMESTAMPING_RX_HARDWARE |
                     SOF_TIMESTAMPING_RAW_HARDWARE;
struct timespec ts[3];                  /* [0]=SW [1]=reserved [2]=HW */
char ctrl[CMSG_SPACE(sizeof(ts))];

setsockopt(fd, SOL_SOCKET, SO_TIMESTAMPING, &flags, sizeof(flags));

for (cmsg = CMSG_FIRSTHDR(&msg); cmsg; cmsg = CMSG_NXTHDR(&msg, cmsg)) {
        if (cmsg->cmsg_level != SOL_SOCKET ||
            cmsg->cmsg_type != SCM_TIMESTAMPING)
                continue;
        memcpy(ts, CMSG_DATA(cmsg), sizeof(ts));
        printf("hw = %lld.%09ld\n",
               (long long)ts[2].tv_sec, (long)ts[2].tv_nsec);
}
```

**④ Compile and run the example**

The complete code is in `hobot-io-samples/debian/app/Can/socketcan/can_hwtstamp_rx.c` (minimal example) and
`can_hwtstamp_test.c` (diagnostic version: capability query, software timestamp comparison, latency statistics).

```shell
cd hobot-io-samples/debian/app/Can/socketcan
make can_hwtstamp_rx can_hwtstamp_test
```

Single-board self-test (hardware loopback, no second node required):

```shell
ip link set can0 down
ip link set can0 type can bitrate 500000 loopback on
ip link set can0 up

sudo ./can_hwtstamp_rx can0 &
cansend can0 123#1122334455667788
```

```text
SIOCSHWTSTAMP ok: tx_type=0 rx_filter=1
id=0x123 len=8  no hw timestamp (tx echo frame or not enabled)
id=0x123 len=8  hw_ts=1789563324.123456789
```

The first line is the TX echo frame looped back from the local transmission (no hardware timestamp), and only the second line is the frame received through the hardware loopback;
when testing with `can0 <-> can1` on two nodes, no echo frame appears. Diagnostic version usage:

```shell
# Receive side: print capabilities, wait for 10 frames with hardware timestamps (-o filters echo frames)
sudo ./can_hwtstamp_test -T -s -n 10 -o can0
# Transmit side
cangen can1 -g 10 -I 123 -L 8
```

**⑤ Common issues**

| Symptom | Cause / Handling |
| ---- | ----------- |
| `SIOCSHWTSTAMP: Operation not supported` | The driver has no hardware timestamp capability, or the interface is not flexcan |
| `ts[2]` is always 0 | `SIOCSHWTSTAMP` was not issued; the frame is a local TX echo; the interface went down and the call was not reissued |
| No timestamp after enabling Fastpath | Bypass-mode frames do not enter the protocol stack; disable fastpath first |
| A fixed offset between the timestamp and `date` | Hardware timestamps are converted from SoC RTC ticks; the RTC and system clock must stay synchronized |

#### 1.7 Errors and Statistics

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
