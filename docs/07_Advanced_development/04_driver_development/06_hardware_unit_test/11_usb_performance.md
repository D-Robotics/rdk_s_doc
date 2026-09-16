---
sidebar_position: 11
title: "USB 总线速率测试"
description: "USB 总线速率测试"
---

# USB 总线速率测试

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

本文介绍如何测量开发板 USB 总线的实际传输速率，包含两项测试：

- **测试一：U 盘读写速率** —— 用 `dd` 命令对 U 盘读写，评估 USB 3.x 大块数据传输带宽。
- **测试二：USB 虚拟网口速率** —— 用 `iperf3` 通过 USB 虚拟网口收发数据，评估 USB 2.0 带宽。

**适用范围**：开发板的 USB 总线。本文所用命令与操作不区分平台，仅 USB 拓扑与 IP 地址因平台而异，请以实际板端为准。

**适用读者**：进行硬件单元测试与整机性能验证的测试及开发人员。

**前置条件**：

- 开发板已烧录官方发布的 RDK OS 镜像，且已正常启动。
- 测试一：一个 USB 存储设备。U 盘规格不同，实测速率差异很大，详见[测试指标](#测试指标)。
- 测试二：一台 PC，以及一根与所接接口匹配的 USB 数据线（两种接口的线材不同，详见[准备工作](#usb-虚拟网口准备)）。

## 测试原理

USB 速率测试通过测量 USB 设备与主机之间的数据传输速率，计算数据传输时间，以此得出实际的总线速率。

### 测试内容

USB 总线速率测试分别使用 USB 虚拟网口和 `dd` 命令对 U 盘进行读写操作，这两种测试方法用于评估 USB 2.0 和 USB 3.0 的传输速率。

#### dd 命令原理说明

使用 `dd` 命令测试 USB 总线速率的原理涉及 **磁盘 I/O 性能测试**。它并不直接测量 USB 总线本身的速度，但通过测试与 USB 设备进行数据读写时的吞吐量，可以间接推测出 USB 总线的性能瓶颈。

```shell
dd if=/dev/zero of=/mnt/usb/testfile bs=1M count=1024 conv=sync oflag=direct
```

- `if=/dev/zero`：输入文件是 `/dev/zero`，它会生成连续的零数据。
- `of=/mnt/usb/testfile`：输出文件为 USB 存储设备挂载点下的 `testfile`，即将数据写入 U 盘。
- `bs=1M`：块大小为 1MB，每次操作读取或写入 1MB 数据。
- `count=1024`：共写入 1024 个块，即 1GB 的数据。
- `conv=sync`：用于处理块对齐。输入数据不足一个块时，`conv=sync` 会将缺少的部分用零填充，确保每个块大小都是 `bs` 指定的值。
- `oflag=direct`：绕过操作系统缓存，直接写入 U 盘，避免缓存影响测试结果。

```shell
dd if=/path/to/source_file of=/dev/null bs=1M iflag=direct
```

- `if=/path/to/source_file`：`if`（输入文件）指定输入文件的路径，即要从中读取数据的文件。
- `of=/dev/null`：`of`（输出文件）指定输出文件的位置，这里将数据写入 `/dev/null`。
- `bs=1M`：块大小，与写命令保持一致，便于读写结果直接对比。
- `iflag=direct`：`direct` 标志确保数据直接从 U 盘读取，不经过操作系统的缓存。

通过执行 `dd` 读写命令，系统会把零数据写入 U 盘，测试写入过程中的吞吐量。命令执行后会显示写入的字节数和所需时间，从而计算出写入速度，读命令同理。

#### USB 虚拟网口原理说明

设置 USB 口工作在 device 模式并使能 rndis 驱动，连接到个人电脑后会在电脑上生成一个远程网卡。配置好板端和电脑上的网络 IP 地址后，使用 `iperf3` 工具进行速率带宽测试。

## 准备工作

### U 盘读写准备

**1.** 将 U 盘插入开发板的 USB 3.0 接口，输入 `lsusb` 查看 U 盘是否被识别：

```shell
root@ubuntu:~# lsusb
Bus 004 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 003 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 002 Device 002: ID 24a9:205a          MoveSpeed YD 3.1
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
```

**2.** 确认该 U 盘实际协商到的接口速率：

```shell
root@ubuntu:~# lsusb -t
/:  Bus 04.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/2p, 10000M
/:  Bus 03.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/2p, 480M
/:  Bus 02.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/2p, 10000M
    |__ Port 1: Dev 2, If 0, Class=Mass Storage, Driver=usb-storage, 5000M
/:  Bus 01.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/2p, 480M
```

其中 `Class=Mass Storage` 那一行即 U 盘，其后的 **`5000M` 表示该设备协商在 USB 3.0（5Gbps）**；若显示 `480M` 则为 USB 2.0。

:::tip
判断接口类型应看协商速率，不要根据 `lsusb` 的总线编号推断——编号与控制器拓扑有关，不能反映实际协商速率。
:::

**3.** 用 `lsblk` 确认设备节点，此处为 `/dev/sda1`：

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

**4.** 创建挂载点并挂载：

```shell
mkdir -p /mnt/usb
mount /dev/sda1 /mnt/usb
```

### USB 虚拟网口准备

**1.** 将开发板连接至 PC 的 USB 口，接其中一个接口即可：

| 开发板接口 | 线材 |
|-|-|
| USB 2.0 口 | Type-C 数据线 |
| USB 3.0 口 | 双公头 USB 数据线 |

下图以 USB 2.0 口为例：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/S100_USB2.0.png" alt="USB 虚拟网口连接示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

**2.** 将 USB 2.0 口虚拟为网口：

```shell
usb-gadget.sh stop adb
usb-gadget.sh start rndis
```

`start rndis` 执行成功时，末尾会打印 `usb-gadget start succeed.`：

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
rndis gadget 以 **USB 2.0（high-speed）** 模式枚举，因此测试二测量的是 USB 2.0 带宽。可用以下命令确认协商结果：

```shell
cat /sys/class/udc/*/current_speed
```
:::

在电脑上打开网络配置页面，可以看到如下图所示的 `Remote RNDIS Compatible Device` 网卡：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/RNIS_Device.png" alt="RNDIS 网卡示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

**3.** 配置板端 `usb0` 网络接口的 IP 地址，使其与 PC 端远程网卡处于同一网段：

```shell
ifconfig usb0 192.168.1.110
```

PC 端远程网卡的 IP 配置如图：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/NETWORK_CONFIG.png" alt="PC 端网卡 IP 配置示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::note
本文使用 `ifconfig` 配置 `usb0`。部分较新的系统镜像推荐改用 `ip addr`，二者等效，例如 `ip addr add 192.168.1.110/24 dev usb0`。
:::

## 测试方法

### 测试一：U 盘读写速率

先用 `lsblk` 确认 U 盘挂载路径正确：

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

测试写入速率（1GB，块大小 1MB，绕过缓存）：

```shell
root@ubuntu:~# dd if=/dev/zero of=/mnt/usb/myfile bs=1M count=1024 conv=sync oflag=direct
1073741824 bytes (1.1 GB, 1.0 GiB) copied, 35.8346 s, 30.0 MB/s
```

测试读取速率。读命令同样加上 `iflag=direct`，与写命令参数保持一致，两个数值才可直接对比：

```shell
root@ubuntu:~# dd if=/mnt/usb/myfile of=/dev/null bs=1M count=1024 iflag=direct
1073741824 bytes (1.1 GB, 1.0 GiB) copied, 2.55714 s, 420 MB/s
```

:::info 关于这两组数据
写速率明显低于读速率是 U 盘的常见特征：写入受盘内 NAND 写入速度限制，读取则更容易接近总线带宽。具体数值因 U 盘型号差异很大，多款 U 盘的实测对比见[测试结果](#测试结果)。
:::

### 测试二：USB 虚拟网口速率

在 PC 端通过命令提示符（cmd）启动 iperf3 服务端：

```bash
iperf3 -s -p 5002
```

在开发板端启动 iperf3 客户端，使用与服务端相同的 IP 地址和端口号连接并启动测试：

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

客户端连接成功后，PC 端服务端打印如下：

```shell
-----------------------------------------------------------
Server listening on 5002
-----------------------------------------------------------
Accepted connection from 192.168.1.110, port 34392
[  5] local 192.168.1.111 port 5002 connected to 192.168.1.110 port 34394
```

:::tip
`-t` 指定测试时长。测量带宽用 60 秒即可，结果稳定且无需长时间占用设备。`Retr` 列为重传次数，本平台实测为 0。
:::

## 测试指标

USB 总线的理论速率（最高）：

- USB 2.0：480Mbps，即 60MB/s
- USB 3.1 Gen 1（即 USB 3.0）：5Gbps，即 625MB/s
- USB 3.1 Gen 2：10Gbps，即 1250MB/s

实际传输速率通常低于理论最大值，受协议开销、硬件限制和设备性能等因素影响。本平台实测值如下：

<DocScope products="RDK S100">

| 接口 | 理论速率 | 本平台实测 |
|-|-|-|
| USB 2.0 | 60MB/s | 29MB/s（USB 虚拟网口，见[测试二](#测试二usb-虚拟网口速率)） |
| USB 3.1 Gen 1 | 625MB/s | 379MB/s~420MB/s（支持 UAS 的 U 盘读取，见[测试一](#测试一u-盘读写速率)） |

</DocScope>

<DocScope products="RDK S600">

| 接口 | 理论速率 | 本平台实测 |
|-|-|-|
| USB 2.0 | 60MB/s | 33MB/s（USB 虚拟网口，见[测试二](#测试二usb-虚拟网口速率)） |
| USB 3.1 Gen 1 | 625MB/s | 54MB/s~143MB/s（U 盘读取，见[测试一](#测试一u-盘读写速率)） |

</DocScope>

### 常见影响因素

- **USB 版本**：USB 3.1 Gen 1、USB 3.1 Gen 2 和 USB 2.0 的带宽差异会直接影响数据传输速率。在 USB 2.0 接口上使用设备时理论最大速度为 480Mbps，实际速度可能更低。
- **设备类型**：U 盘、外接硬盘、SSD 等 USB 设备的读写性能各不相同，闪存类型的 U 盘速度较慢，SSD 性能更好。
- **块大小（`bs`）**：`dd` 命令的块大小选择对测试结果有很大影响。较大的块大小可能提高吞吐量，过小的块大小可能导致效率低下，可适当调整 `dd` 命令参数以达到更好的测试效果。

### 判断瓶颈：BOT 与 UAS

USB 存储设备有两种传输协议，可通过接口的 `bInterfaceProtocol` 判断实际使用的是哪一种：

```shell
root@ubuntu:~# grep -H '' /sys/bus/usb/drivers/usb-storage/*/bInterfaceProtocol
/sys/bus/usb/drivers/usb-storage/2-1:1.0/bInterfaceProtocol:50
```

输出出现在 `usb-storage` 驱动目录下，说明该设备使用 BOT，协议值为 `50`（即 `0x50`）。若设备使用 UAS，则会出现在 `/sys/bus/usb/drivers/uas/` 目录下，协议值为 `62`（即 `0x62`）。

两个协议值由内核头文件 `include/linux/usb/storage.h` 定义：

```c
#define USB_PR_BULK	0x50		/* bulk only */
#define USB_PR_UAS	0x62		/* USB Attached SCSI */
```

| 值 | 协议 | 说明 |
|-|-|-|
| `0x50` | BOT（Bulk-Only Transport） | 传统协议，半双工且无命令队列，性能较低。多数普通 U 盘只支持该协议。 |
| `0x62` | UAS（USB Attached SCSI） | 支持命令队列与全双工，性能更接近总线上限。USB 3.0 SSD 通常支持。 |

需要特别说明：**要评估 USB 总线本身的带宽，应使用支持 UAS 的设备**。普通 U 盘只支持 BOT，其读写速率受盘内 NAND 速度制约，测出的主要是设备性能而非总线能力。

### 测试结果

**测试一：U 盘读写速率**

块大小均为 1MB，读写均带 `direct` 标志。不同 U 盘的实测结果差异很大。

<DocScope products="RDK S100">

| U 盘 | 协议 | 协商速率 | 写入 | 读取 |
|-|-|-|-|-|
| Kingston DataTraveler 3.0（57.7GB） | BOT（`0x50`） | 5000Mbps | 8MB/s~12MB/s | 87MB/s |
| SanDisk 3.2Gen1（57.3GB） | UAS（`0x62`） | 5000Mbps | 30MB/s~31MB/s | 379MB/s~420MB/s |

从上述数据可以看出：两块 U 盘均协商到 **5000Mbps**（USB 3.0）；**协议对读取性能影响显著**——支持 UAS 的 SanDisk 3.2Gen1 读取达到 **379MB/s~420MB/s**，而 BOT 协议的 Kingston 只有 **87MB/s**；写入普遍偏低（**8MB/s~31MB/s**）。

</DocScope>

<DocScope products="RDK S600">

| U 盘 | 协议 | 协商速率 | 写入 | 读取 |
|-|-|-|-|-|
| SanDisk Ultra（14.5GB） | BOT（`0x50`） | 5000Mbps | 13MB/s~25MB/s | 143MB/s |
| Kingston DataTraveler 3.0（57.7GB） | BOT（`0x50`） | 5000Mbps | 11MB/s~12MB/s | 87MB/s~88MB/s |
| HIKSEMI（117GB） | BOT（`0x50`） | 5000Mbps | 10MB/s~23MB/s | 54MB/s~74MB/s |

从上述数据可以看出：三块 U 盘均协商到 **5000Mbps**（USB 3.0）；读取为 **54MB/s~143MB/s**；写入普遍偏低（**10MB/s~25MB/s**）。

</DocScope>

**测试二：USB 虚拟网口速率**

<DocScope products="RDK S100">

USB 2.0 虚拟网口实测 **234Mbits/sec**（约 29MB/s）。60 秒测试期间速率稳定，重传次数为 0，处于 USB 2.0 的实际速率区间（25MB/s~35MB/s），说明虚拟网口工作正常。

</DocScope>

<DocScope products="RDK S600">

USB 2.0 虚拟网口实测 **266Mbits/sec**（约 33MB/s）。60 秒测试期间速率稳定在 266Mbits/sec，重传次数为 0，处于 USB 2.0 的实际速率区间（25MB/s~35MB/s），说明虚拟网口工作正常。

</DocScope>


## 常见问题

### USB 读写速度低于标称值

**原因**：最常见的原因是 U 盘自身的写入性能限制，而非接口问题，详见[判断瓶颈：BOT 与 UAS](#判断瓶颈bot-与-uas)。其余原因包括接口速率、测试块大小与文件大小等。

**解决**：

1. 先确认接口协商速率（`speed` 应为 `5000`），排除接口降到 USB 2.0 的可能。
2. 用 `bInterfaceProtocol` 确认设备协议：`0x50`（BOT）的普通 U 盘本身性能有限，属正常现象；`0x62`（UAS）的设备才适合评估总线带宽。
3. 参考[常见影响因素](#常见影响因素)逐项排查，使用较大的块大小与文件进行读写测试。
4. 若希望读写数据可直接对比，请为读、写命令使用相同的缓存参数（均加 `direct` 标志或均不加）。

### U 盘接入后未自动挂载

**原因**：系统未自动挂载 U 盘，或设备未被识别。

**解决**：用 `lsblk` 查看设备节点，手动创建挂载点并挂载：

```shell
mkdir -p /mnt/usb
mount /dev/sda1 /mnt/usb
```

### 虚拟网口在 PC 端未出现

**原因**：USB gadget 未正确切换到 rndis 模式，或 USB 线未连接。

**解决**：确认板端 `usb-gadget.sh start rndis` 执行成功且输出 `usb-gadget start succeed.`；确认数据线接的是 **USB 2.0 口**；重新插拔 USB 线后检查 PC 端网络配置页面。

### 虚拟网口在 PC 端显示黄色感叹号

**原因**：PC 端未正确安装或加载该网卡的驱动。

**解决**：在 PC 端重新安装该网卡的驱动。

1. 在设备管理器中右键带感叹号的 `Remote NDIS Compatible Device`，选择**卸载设备**；若出现「删除此设备的驱动程序软件」选项，一并勾选。
2. 重新插拔 USB 线，让 Windows 重新识别并安装驱动。
3. 若仍显示感叹号，右键该设备 → **更新驱动程序** → **浏览我的电脑上的驱动程序** → **让我从计算机上的可用驱动程序列表中选取**；类别选**网络适配器**，厂商选 **Microsoft**，型号选 `Remote NDIS Compatible Device`。

驱动安装正常后，网络连接中即可看到该网卡，随后配置 IP 地址。

## 相关文档

- [驱动功能单元测试](/Advanced_development/driver_development/hardware_unit_test)
- [AutoTest 使用方法](./02_auto_test.md)
- [搭建开发环境](/Advanced_development/environment_build/environment_build)
