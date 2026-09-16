---
sidebar_position: 11
title: "USB Bus Speed Test"
description: "USB bus speed test"
---

# USB Bus Speed Test

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Overview

This document describes how to measure the actual transfer speed of the board's USB bus. It covers two tests:

- **Test 1: USB flash drive read/write speed** — uses the `dd` command to read from and write to a USB flash drive, evaluating USB 3.x bulk transfer bandwidth.
- **Test 2: USB virtual network interface speed** — uses `iperf3` to send and receive data over the USB virtual network interface, evaluating USB 2.0 bandwidth.

**Scope**: The board's USB bus. The commands and procedures in this document are platform-independent; only the USB topology and IP addresses differ between platforms, so refer to your actual board.

**Intended audience**: Test and development engineers performing hardware unit tests and system-level performance verification.

**Prerequisites**:

- The board has been flashed with an officially released RDK OS image and boots normally.
- Test 1: a USB storage device. The measured rate varies widely between drive models — see [Test Metrics](#test-metrics).
- Test 2: a PC and a USB data cable matching the port used (the two ports use different cables — see [Preparation](#usb-virtual-network-interface-setup) for details).

## Test Principle

USB speed testing measures the data transfer rate between the USB device and the host and derives the actual bus speed from the transfer time.

### Test Content

The USB bus speed test uses both a USB virtual network interface and the `dd` command to perform read/write operations on a USB flash drive. These two methods evaluate the transfer speeds of USB 2.0 and USB 3.0 respectively.

#### Explanation of the `dd` Command Principle

Using the `dd` command to test USB bus speed involves **disk I/O performance testing**. It does not measure the speed of the USB bus itself, but by measuring the throughput during data read/write operations with the USB device it indirectly reveals potential USB bus bottlenecks.

```shell
dd if=/dev/zero of=/mnt/usb/testfile bs=1M count=1024 conv=sync oflag=direct
```

- `if=/dev/zero`: The input file is `/dev/zero`, which generates a continuous stream of zero bytes.
- `of=/mnt/usb/testfile`: The output file is `testfile` under the mount point of the USB storage device, meaning data is written to the USB flash drive.
- `bs=1M`: Block size is set to 1MB. Each operation reads or writes 1MB of data.
- `count=1024`: Writes 1024 blocks in total, that is, 1GB of data.
- `conv=sync`: Handles block alignment. When the input data is smaller than one block, `conv=sync` pads the missing portion with zeros so that each block is exactly the size given by `bs`.
- `oflag=direct`: Bypasses the OS cache and writes directly to the USB flash drive, avoiding cache effects on the result.

```shell
dd if=/path/to/source_file of=/dev/null bs=1M iflag=direct
```

- `if=/path/to/source_file`: Specifies the input file path; `/path/to/source_file` is the file from which data is read.
- `of=/dev/null`: Specifies the output file location; here the data is discarded by writing to `/dev/null`.
- `bs=1M`: Block size, matching the write command so that the read and write results can be compared directly.
- `iflag=direct`: The `direct` flag ensures data is read directly from the USB flash drive without going through the OS cache.

By executing the `dd` commands, the system writes zero-filled data to the USB flash drive and measures the throughput during the write. When the command completes, it displays the number of bytes written and the time taken, from which the write speed can be calculated. The read command works the same way.

#### Explanation of USB Virtual Network Interface Principle

Configure the USB port to operate in device mode and enable the RNDIS driver. Once connected to a PC, a remote network adapter appears on the computer. After configuring IP addresses on both the board and the PC, use `iperf3` to test bandwidth.

## Preparation

### USB Flash Drive Read/Write Preparation

**1.** Insert the USB flash drive into the board's USB 3.0 port, then run `lsusb` to confirm the drive is recognized:

```shell
root@ubuntu:~# lsusb
Bus 004 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 003 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 002 Device 002: ID 24a9:205a          MoveSpeed YD 3.1
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
```

**2.** Confirm the interface speed the drive actually negotiated:

```shell
root@ubuntu:~# lsusb -t
/:  Bus 04.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/2p, 10000M
/:  Bus 03.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/2p, 480M
/:  Bus 02.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/2p, 10000M
    |__ Port 1: Dev 2, If 0, Class=Mass Storage, Driver=usb-storage, 5000M
/:  Bus 01.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/2p, 480M
```

The line with `Class=Mass Storage` is the flash drive; the **`5000M` after it means the device negotiated USB 3.0 (5Gbps)**. A value of `480M` would mean USB 2.0.

:::tip
Determine the interface type from the negotiated speed rather than inferring it from the bus number in `lsusb` — the bus number depends on the controller topology and does not reflect the actual negotiated speed.
:::

**3.** Use `lsblk` to confirm the device node, `/dev/sda1` in this case:

```shell
root@ubuntu:~# lsblk
NAME         MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda            8:0    1 117.2G  0 disk
`-sda1         8:1    1 117.2G  0 part
mmcblk0      179:0    0  58.2G  0 disk
|-mmcblk0p1  179:1    0     1M  0 part
|-mmcblk0p2  179:2    0     1M  0 part
|-mmcblk0p3  179:3    0     1M  0 part
|-mmcblk0p4  179:4    0     2M  0 part
|-mmcblk0p5  179:5    0     2M  0 part
|-mmcblk0p6  179:6    0     2M  0 part
|-mmcblk0p7  179:7    0     2M  0 part
|-mmcblk0p8  179:8    0     8M  0 part
|-mmcblk0p9  179:9    0     8M  0 part
|-mmcblk0p10 179:10   0     8M  0 part
|-mmcblk0p11 179:11   0     8M  0 part
|-mmcblk0p12 179:12   0    60M  0 part /boot
|-mmcblk0p13 179:13   0    60M  0 part
|-mmcblk0p14 179:14   0     8G  0 part /ota
|-mmcblk0p15 179:15   0     4G  0 part /log
|-mmcblk0p16 179:16   0     2G  0 part /userdata
`-mmcblk0p17 179:17   0  44.1G  0 part /
mmcblk0boot0 179:32   0     4M  1 disk
mmcblk0boot1 179:64   0     4M  1 disk
```

**4.** Create the mount point and mount the device:

```shell
mkdir -p /mnt/usb
mount /dev/sda1 /mnt/usb
```

### USB Virtual Network Interface Setup

**1.** Connect the board to a PC USB port; connect just one of the two ports:

| Board port | Cable |
|-|-|
| USB 2.0 port | Type-C data cable |
| USB 3.0 port | Male-to-male USB data cable |

The figure below uses the USB 2.0 port as an example:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/S100_USB2.0.png" alt="USB virtual network interface connection" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

**2.** Configure the USB 2.0 port as a virtual network interface:

```shell
usb-gadget.sh stop adb
usb-gadget.sh start rndis
```

On success, `start rndis` prints `usb-gadget start succeed.` at the end:

<DocScope products="RDK S100">

```shell
USB2.0 Gadget
Detecting platform:
 board : D-Robotics RDK S100 V1P0
 udc   : 39820000.dwc3
Creating the USB gadget
Loading composite module
Mount ConfigFS and create Gadget
configfs mount point:  /sys/kernel/config
Configfs already mounted...
Creating gadget directory g_comp
OK
init configfs...
Setting Vendor and Product ID's
OK
Setting Multi-func Gadget for Windows
Setting English strings
OK
Creating Config
Init functions...
funciton_init, but do nothing, please init on demand
OK
Bind functions...
Bind functions according to .usb-config file
bind gadget rndis...
Creating RNDIS gadget functionality
OK
Pre run userspace daemons(eg. adb)...
0
waiting
.
OK
Binding USB Device Controller
OK
Run some userspace daemons(eg. usb_camera)...
usb-gadget start succeed.
```

</DocScope>

<DocScope products="RDK S600">

```shell
USB2.0 Gadget
Detecting platform:
 board : D-Robotics RDK S600 MCB V0p2
 udc   : 3a820000.dwc3
Creating the USB gadget
Loading composite module
Mount ConfigFS and create Gadget
configfs mount point:  /sys/kernel/config
Configfs already mounted...
Creating gadget directory g_comp
OK
init configfs...
Setting Vendor and Product ID's
OK
Setting Multi-func Gadget for Windows
Setting English strings
OK
Creating Config
Init functions...
funciton_init, but do nothing, please init on demand
OK
Bind functions...
Bind functions according to .usb-config file
bind gadget rndis...
Creating RNDIS gadget functionality
OK
Pre run userspace daemons(eg. adb)...
0
waiting
.
OK
Binding USB Device Controller
OK
Run some userspace daemons(eg. usb_camera)...
usb-gadget start succeed.
```

</DocScope>

:::note
The rndis gadget enumerates in **USB 2.0 (high-speed)** mode, so Test 2 measures USB 2.0 bandwidth. Confirm the negotiated result with:

```shell
cat /sys/class/udc/*/current_speed
```
:::

On the PC, open the network configuration panel. You should see a network adapter labeled `Remote RNDIS Compatible Device`:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/RNIS_Device-en.png" alt="RNDIS network adapter" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

**3.** Configure the IP address of the `usb0` interface so that it is in the same subnet as the PC-side remote network adapter:

```shell
ifconfig usb0 192.168.1.110
```

The PC-side remote network adapter IP configuration is shown below:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/NETWORK_CONFIG-en.png" alt="PC-side network adapter IP configuration" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::note
This document uses `ifconfig` to configure `usb0`. Some newer images recommend `ip addr` instead; the two are equivalent, for example `ip addr add 192.168.1.110/24 dev usb0`.
:::

## Test Procedure

### Test 1: USB Flash Drive Read/Write Speed

First run `lsblk` to confirm the flash drive is mounted correctly:

```shell
root@ubuntu:~# lsblk
NAME         MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda            8:0    1 117.2G  0 disk
├─sda1         8:1    1 117.2G  0 part /mnt/usb
mmcblk0      179:0    0  58.2G  0 disk
├─mmcblk0p1   179:1    0     1M  0 part
├─mmcblk0p2   179:2    0     1M  0 part
├─mmcblk0p3   179:3    0     1M  0 part
├─mmcblk0p4   179:4    0     2M  0 part
├─mmcblk0p5   179:5    0     2M  0 part
├─mmcblk0p6   179:6    0     2M  0 part
├─mmcblk0p7   179:7    0     2M  0 part
├─mmcblk0p8   179:8    0     8M  0 part
├─mmcblk0p9   179:9    0     8M  0 part
├─mmcblk0p10  179:10   0     8M  0 part
├─mmcblk0p11  179:11   0     8M  0 part
├─mmcblk0p12  179:12   0    60M  0 part /boot
├─mmcblk0p13  179:13   0    60M  0 part
├─mmcblk0p14  179:14   0     8G  0 part /ota
├─mmcblk0p15  179:15   0     4G  0 part /log
├─mmcblk0p16  179:16   0     2G  0 part /userdata
└─mmcblk0p17  179:17   0  44.1G  0 part /
mmcblk0boot0 179:32   0     4M  1 disk
mmcblk0boot1 179:64   0     4M  1 disk
```

Test the write speed (1GB, 1MB blocks, bypassing the cache):

```shell
root@ubuntu:~# dd if=/dev/zero of=/mnt/usb/myfile bs=1M count=1024 conv=sync oflag=direct
1073741824 bytes (1.1 GB, 1.0 GiB) copied, 35.8346 s, 30.0 MB/s
```

Test the read speed. The read command also passes `iflag=direct` so that its parameters match the write command and the two figures are directly comparable:

```shell
root@ubuntu:~# dd if=/mnt/usb/myfile of=/dev/null bs=1M count=1024 iflag=direct
1073741824 bytes (1.1 GB, 1.0 GiB) copied, 2.55714 s, 420 MB/s
```

:::info
A write speed well below the read speed is typical of USB flash drives: writes are limited by the NAND program speed inside the drive, while reads more easily approach the bus bandwidth. The exact figures vary widely between drive models; see [Test Results](#test-results) for measurements across several drives.
:::

### Test 2: USB Virtual Network Interface Speed

On the PC side, start the iperf3 server from the Command Prompt (cmd):

```bash
iperf3 -s -p 5002
```

On the board, start the iperf3 client and connect using the same IP address and port as the server:

<DocScope products="RDK S100">

```shell
root@ubuntu:~# iperf3 -c 192.168.1.111 -i 5 -t 60 -p 5002
Connecting to host 192.168.1.111, port 5002
[  5] local 192.168.1.110 port 54446 connected to 192.168.1.111 port 5002
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-5.00   sec   140 MBytes   235 Mbits/sec    0   19.8 KBytes
[  5]   5.00-10.00  sec   140 MBytes   235 Mbits/sec    0   19.8 KBytes
[  5]  10.00-15.00  sec   140 MBytes   235 Mbits/sec    0   19.8 KBytes
[  5]  15.00-20.00  sec   140 MBytes   236 Mbits/sec    0   19.8 KBytes
[  5]  20.00-25.00  sec   140 MBytes   235 Mbits/sec    0   19.8 KBytes
[  5]  25.00-30.00  sec   140 MBytes   235 Mbits/sec    0   19.8 KBytes
[  5]  30.00-35.00  sec   140 MBytes   235 Mbits/sec    0   19.8 KBytes
[  5]  35.00-40.00  sec   142 MBytes   239 Mbits/sec    0   19.8 KBytes
[  5]  40.00-45.00  sec   140 MBytes   235 Mbits/sec    0   19.8 KBytes
[  5]  45.00-50.00  sec   140 MBytes   235 Mbits/sec    0   19.8 KBytes
[  5]  50.00-55.00  sec   140 MBytes   235 Mbits/sec    0   19.8 KBytes
[  5]  55.00-60.00  sec   129 MBytes   217 Mbits/sec    0   19.8 KBytes
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-60.00  sec  1.63 GBytes   234 Mbits/sec    0             sender
[  5]   0.00-60.00  sec  1.63 GBytes   234 Mbits/sec                  receiver

iperf Done.
```

</DocScope>

<DocScope products="RDK S600">

```shell
root@ubuntu:~# iperf3 -c 192.168.1.111 -i 5 -t 60 -p 5002
Connecting to host 192.168.1.111, port 5002
[  5] local 192.168.1.110 port 34394 connected to 192.168.1.111 port 5002
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-5.01   sec   159 MBytes   266 Mbits/sec    0   19.8 KBytes
[  5]   5.01-10.01  sec   159 MBytes   266 Mbits/sec    0   19.8 KBytes
[  5]  10.01-15.01  sec   158 MBytes   266 Mbits/sec    0   19.8 KBytes
[  5]  15.01-20.01  sec   159 MBytes   266 Mbits/sec    0   19.8 KBytes
[  5]  20.01-25.01  sec   159 MBytes   266 Mbits/sec    0   19.8 KBytes
[  5]  25.01-30.01  sec   158 MBytes   266 Mbits/sec    0   19.8 KBytes
[  5]  30.01-35.01  sec   159 MBytes   266 Mbits/sec    0   19.8 KBytes
[  5]  35.01-40.01  sec   159 MBytes   266 Mbits/sec    0   19.8 KBytes
[  5]  40.01-45.01  sec   158 MBytes   266 Mbits/sec    0   19.8 KBytes
[  5]  45.01-50.00  sec   159 MBytes   266 Mbits/sec    0   19.8 KBytes
[  5]  50.00-55.01  sec   159 MBytes   266 Mbits/sec    0   19.8 KBytes
[  5]  55.01-60.01  sec   158 MBytes   266 Mbits/sec    0   19.8 KBytes
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-60.01  sec  1.86 GBytes   266 Mbits/sec    0             sender
[  5]   0.00-60.01  sec  1.86 GBytes   266 Mbits/sec                  receiver

iperf Done.
```

</DocScope>

If the client connects successfully, the PC-side server prints the following:

```shell
-----------------------------------------------------------
Server listening on 5002
-----------------------------------------------------------
Accepted connection from 192.168.1.110, port 34392
[  5] local 192.168.1.111 port 5002 connected to 192.168.1.110 port 34394
```

:::tip
`-t` sets the test duration. 60 seconds is enough to measure bandwidth: the result is stable and the devices are not occupied for long. The `Retr` column is the retransmission count, which measured 0 on this platform.
:::

## Test Metrics

Theoretical maximum speeds of the USB buses:

- USB 2.0: 480Mbps, that is 60MB/s
- USB 3.1 Gen 1 (USB 3.0): 5Gbps, that is 625MB/s
- USB 3.1 Gen 2: 10Gbps, that is 1250MB/s

Actual transfer speeds are usually lower than the theoretical maximum due to protocol overhead, hardware limitations and device performance. Measured values on this platform:

<DocScope products="RDK S100">

| Interface | Theoretical | Measured on this platform |
|-|-|-|
| USB 2.0 | 60MB/s | 29MB/s (USB virtual network interface, see [Test 2](#test-2-usb-virtual-network-interface-speed)) |
| USB 3.1 Gen 1 | 625MB/s | 379MB/s~420MB/s (UAS-capable flash drive read, see [Test 1](#test-1-usb-flash-drive-readwrite-speed)) |

</DocScope>

<DocScope products="RDK S600">

| Interface | Theoretical | Measured on this platform |
|-|-|-|
| USB 2.0 | 60MB/s | 33MB/s (USB virtual network interface, see [Test 2](#test-2-usb-virtual-network-interface-speed)) |
| USB 3.1 Gen 1 | 625MB/s | 54MB/s~143MB/s (flash drive read, see [Test 1](#test-1-usb-flash-drive-readwrite-speed)) |

</DocScope>

### Common Influencing Factors

- **USB version**: Bandwidth differences among USB 3.1 Gen 1, USB 3.1 Gen 2 and USB 2.0 directly affect the transfer rate. On a USB 2.0 port the theoretical maximum is 480Mbps, and actual speeds are often lower.
- **Device type**: USB devices (flash drives, external HDDs, SSDs) differ in read/write performance. Flash-based drives are generally slower, while SSDs perform better.
- **Block size (`bs`)**: The block size used by `dd` has a large effect on the result. Larger blocks may increase throughput while very small blocks reduce efficiency; adjust the `dd` parameters as needed.

### Determining the bottleneck: BOT vs UAS

USB storage devices support two transfer protocols; the one in use can be determined from the interface's `bInterfaceProtocol`:

```shell
root@ubuntu:~# grep -H '' /sys/bus/usb/drivers/usb-storage/*/bInterfaceProtocol
/sys/bus/usb/drivers/usb-storage/2-1:1.0/bInterfaceProtocol:50
```

The output appearing under the `usb-storage` driver directory means the device uses BOT, with a protocol value of `50` (that is, `0x50`). If a device used UAS it would appear under `/sys/bus/usb/drivers/uas/` instead, with a protocol value of `62` (`0x62`).

Both protocol values are defined by the kernel header `include/linux/usb/storage.h`:

```c
#define USB_PR_BULK	0x50		/* bulk only */
#define USB_PR_UAS	0x62		/* USB Attached SCSI */
```

| Value | Protocol | Notes |
|-|-|-|
| `0x50` | BOT (Bulk-Only Transport) | Legacy protocol: half-duplex and no command queueing, so performance is lower. Most ordinary flash drives only support this. |
| `0x62` | UAS (USB Attached SCSI) | Supports command queueing and full duplex, so performance is closer to the bus limit. USB 3.0 SSDs usually support it. |

Note that **evaluating the USB bus bandwidth itself requires a UAS-capable device**. An ordinary flash drive only supports BOT, and its read/write rates are limited by the NAND inside the drive, so what you measure is mostly device performance rather than bus capability.

### Test Results

**Test 1: USB flash drive read/write speed**

All measurements used 1MB blocks with the `direct` flag on both read and write. Results vary widely between drives.

<DocScope products="RDK S100">

| Flash drive | Protocol | Negotiated speed | Write | Read |
|-|-|-|-|-|
| Kingston DataTraveler 3.0 (57.7GB) | BOT (`0x50`) | 5000Mbps | 8MB/s~12MB/s | 87MB/s |
| SanDisk 3.2Gen1 (57.3GB) | UAS (`0x62`) | 5000Mbps | 30MB/s~31MB/s | 379MB/s~420MB/s |

From the data above: both drives negotiated **5000Mbps** (USB 3.0). **The protocol has a large effect on read performance** — the UAS-capable SanDisk 3.2Gen1 read at **379MB/s~420MB/s**, while the BOT drive (Kingston) read at only **87MB/s**. Write speeds were low (**8MB/s~31MB/s**).

</DocScope>

<DocScope products="RDK S600">

| Flash drive | Protocol | Negotiated speed | Write | Read |
|-|-|-|-|-|
| SanDisk Ultra (14.5GB) | BOT (`0x50`) | 5000Mbps | 13MB/s~25MB/s | 143MB/s |
| Kingston DataTraveler 3.0 (57.7GB) | BOT (`0x50`) | 5000Mbps | 11MB/s~12MB/s | 87MB/s~88MB/s |
| HIKSEMI (117GB) | BOT (`0x50`) | 5000Mbps | 10MB/s~23MB/s | 54MB/s~74MB/s |

From the data above: all three drives negotiated **5000Mbps** (USB 3.0); read speeds were **54MB/s~143MB/s**; write speeds were low across the board (**10MB/s~25MB/s**).

</DocScope>

**Test 2: USB virtual network interface speed**

<DocScope products="RDK S100">

The USB 2.0 virtual network interface measured **234Mbits/sec** (about 29MB/s). Over a 60-second test the rate stayed stable with 0 retransmissions, within the USB 2.0 actual range (25MB/s~35MB/s), confirming the virtual network interface works correctly.

</DocScope>

<DocScope products="RDK S600">

The USB 2.0 virtual network interface measured **266Mbits/sec** (about 33MB/s). Over a 60-second test the rate stayed stable at 266Mbits/sec with 0 retransmissions, within the USB 2.0 actual range (25MB/s~35MB/s), confirming the virtual network interface works correctly.

</DocScope>


## FAQ

### USB read/write speed is lower than the nominal value

**Cause**: The most common cause is the write performance of the flash drive itself, not the interface — see [Determining the bottleneck: BOT vs UAS](#determining-the-bottleneck-bot-vs-uas). Other causes include the interface speed, the test block size and the file size.

**Solution**:

1. First confirm the negotiated interface speed (`speed` should be `5000`) to rule out the interface dropping to USB 2.0.
2. Check the device protocol with `bInterfaceProtocol`: an ordinary `0x50` (BOT) drive has inherently limited performance, which is expected; only `0x62` (UAS) devices are suitable for evaluating bus bandwidth.
3. Check the items in [Common Influencing Factors](#common-influencing-factors) one by one, and use larger block sizes and files.
4. To compare read and write figures directly, use the same cache settings for both commands (either add the `direct` flag to both or to neither).

### USB flash drive is not automatically mounted after being plugged in

**Cause**: The system does not auto-mount the drive, or the device is not recognized.

**Solution**: Use `lsblk` to find the device node, then create the mount point and mount it manually:

```shell
mkdir -p /mnt/usb
mount /dev/sda1 /mnt/usb
```

### The virtual network interface does not appear on the PC

**Cause**: The USB gadget did not switch to rndis mode, or the USB cable is not connected.

**Solution**: Confirm that `usb-gadget.sh start rndis` succeeded on the board and printed `usb-gadget start succeed.`; confirm the cable is connected to the **USB 2.0 port** or the **USB 3.0 port**; then reconnect the USB cable and check the network configuration panel on the PC.

### The virtual network interface shows a yellow warning in Device Manager

**Cause**: The adapter's driver is not installed or loaded correctly on the PC.

**Solution**: Reinstall the adapter's driver on the PC.

1. In Device Manager, right-click the `Remote NDIS Compatible Device` marked with a yellow warning and choose **Uninstall device**; also tick "Delete the driver software for this device" if offered.
2. Reconnect the USB cable so that Windows detects the device again and installs the driver.
3. If the warning persists, right-click the device → **Update driver** → **Browse my computer for drivers** → **Let me pick from a list of available drivers on my computer**; choose **Network adapters** as the category, **Microsoft** as the manufacturer, and `Remote NDIS Compatible Device` as the model.

Once the driver is installed correctly, the adapter appears under Network Connections and an IP address can be configured.

## Related Documentation

- [Driver Functional Unit Test](./01_overview.md)
- [AutoTest Usage](./02_auto_test.md)
- [Set Up the Development Environment](../../06_environment_build/01_environment_build.md)
