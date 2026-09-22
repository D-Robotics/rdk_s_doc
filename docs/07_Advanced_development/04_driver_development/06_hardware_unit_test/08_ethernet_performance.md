---
sidebar_position: 8
title: "以太网性能测试"
description: "以太网性能测试"
---

# 以太网性能测试

## 功能概述

本章指导如何使用 `iperf3` 工具进行以太网性能测试，可查阅 [iperf3 文档](https://iperf.fr/iperf-doc.php#3docd) 了解命令详细说明。

**以太网性能测试的关注点**：

1. **带宽和吞吐量**：测试以太网的实际可用带宽，以确定以太网在高负载情况下的性能表现。
2. **延迟**：评估数据在以太网上传输时的延迟，特别是在高负载条件下，延迟的增加可能会对实时应用产生负面影响。
3. **丢包率**：测试以太网中数据包的丢失率，以确定以太网的稳定性。丢包率过高会影响数据传输的完整性。

## 环境准备

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/Ethernet_usage_diagram.png" alt="准备工作示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

1. **选择连接方式**：`开发板`-`电脑`直连，或者`开发板`-`开发板`直连，或两端接入同一台普通交换机（同一 VLAN）。注意：两端必须处于**同一个二层广播域**，跨网段/跨 VLAN 时无法直接 ARP，需额外配置网关。
2. **确定服务器和客户端**：开发板做客户端和服务端都可以，对端设备可以是个人电脑（PC），也可以是另一块开发板。
3. **确定网段**：两端配置为相同网段的静态 IP（测试场景通常无 DHCP 服务器，建议直接用静态 IP）。
4. **清理对端过期 ARP 缓存**：若对端（尤其是 Windows PC）此前连接过其它板子或其它 IP，ARP 表里可能残留**静态/过期记录**，导致 ping 时 ARP 解析到错误 MAC，回包发到错误 MAC 被丢弃，表现为「ARP 能解析但 ping 100% 丢包」。测试前在对端清理：

   ```bash
   # Windows（管理员 PowerShell / cmd）
   Remove-NetNeighbor -IPAddress 192.168.127.10 -Confirm:$false
   netsh interface ip delete arpcache
   # Linux
   ip neigh flush all
   ```
5. **PC 网卡只配一个测试 IP**：若 PC 同一张网卡上挂了多个网段的 IP（例如同时有 `192.168.127.195` 和 `192.168.1.7`），Windows 可能选错源 IP，导致板子收到的报文源 IP 不在自己网段而丢弃。测试时建议在 PC 测试网卡上**只保留一个测试网段的 IP**。
6. **关闭防火墙 / 放行端口**：关闭 PC 防火墙，或在防火墙放行 `iperf3` 使用的端口（如 `5002`/`5201`）和入站 ICMP。
7. **验证连通性**：先 `ping` 通且 0 丢包，再启动 `iperf3`。

:::note 注意
本章节内测试的配置仅供参考，用户需根据其实际硬件情况调整测试配置。
:::

### 示例配置

在本测试中配置如下：

- **连接方式**：`开发板`-`电脑`直连。
- **服务器（PC）**：IP 地址为 `192.168.127.195`
- **客户端（开发板）**：IP 地址为 `192.168.127.10`

执行命令测试 PC 和开发板的以太网连通性：

```bash
ping -I eth0 192.168.127.195
```

执行结果：

```bash
PING 192.168.127.195 (192.168.127.195) from 192.168.127.10 eth0: 56(84) bytes of data.
64 bytes from 192.168.127.195: icmp_seq=1 ttl=128 time=1.54 ms
64 bytes from 192.168.127.195: icmp_seq=2 ttl=128 time=1.28 ms
64 bytes from 192.168.127.195: icmp_seq=3 ttl=128 time=1.57 ms
64 bytes from 192.168.127.195: icmp_seq=4 ttl=128 time=1.40 ms
```

## 代码位置

`iperf3` 为开源网络测速工具，板端与 PC 端均需安装：

- **PC 端**：前往 [iperf 官网](https://iperf.fr/iperf-download.php) 下载对应平台的 `iperf3` 安装包并安装。
- **板端**：通过 `apt` 安装，或交叉编译后部署到板端：

  ```bash
  apt install iperf3 -y
  ```

  若板端无网络，可在 PC 上交叉编译 `iperf3`（源码见 [iperf3 GitHub](https://github.com/esnet/iperf)）后通过 `scp`/U 盘推送到板端 `/usr/bin/`。

:::tip
测试前先确认链路已协商到期望速率：`ethtool eth0 | grep -E 'Speed|Link|Duplex'`。
:::

:::warning iperf3 server 默认监听 IPv6
板端 `iperf3`（3.x）默认 server 监听 IPv6 `[::]:5201`，**不接收 IPv4 连接**，PC 用 IPv4 连接会报 `Connection refused`。板端起 server 时务必显式绑定 IPv4：

```bash
iperf3 -s -B 0.0.0.0 -p 5201
```

PC 端若使用基于 Cygwin 的 `iperf3.exe`（如 3.1.1），需在**其安装目录下运行**（依赖同目录的 `cygwin1.dll`），否则可能报 `unable to create a new stream`。建议两端 `iperf3` 版本尽量一致（板端常见为 3.16）。
:::

## 使用方法

### 测试原理

以太网性能测试依赖于客户端和服务器之间的数据传输操作。具体原理如下：

1. **服务器端**：使用 `iperf3` 监听指定端口，等待客户端连接。服务器通过记录接收的数据量和时间间隔，计算实际带宽和吞吐量。
2. **客户端**：客户端主动连接服务器，并以指定的速率和间隔发送数据包，模拟网络流量负载。
3. **统计信息**：测试过程中，`iperf3` 会记录关键数据，包括带宽、延迟、丢包率、重传次数等，帮助分析网络性能。

### 步骤一：启动服务器

在 PC 上使用 `iperf3` 启动服务器。首先，前往 [iperf 官网](https://iperf.fr/iperf-download.php) 下载 iperf3 安装包并完成安装。

在 Windows 系统上，通过命令提示窗口（cmd）执行命令：

```bash
iperf3 -s -p 5002
```

启动日志：

```bash
-----------------------------------------------------------
Server listening on 5002
-----------------------------------------------------------
```

客户端连接成功后的日志：

```bash
Accepted connection from 192.168.127.10, port 51592
[  5] local 192.168.127.195 port 5002 connected to 192.168.127.10 port 51598
[ ID] Interval           Transfer     Bitrate
[  5]   0.00-1.00   sec   112 MBytes   937 Mbits/sec
[  5]   1.00-2.01   sec   113 MBytes   940 Mbits/sec
[  5]   2.01-3.01   sec   112 MBytes   941 Mbits/sec
[  5]   3.01-4.01   sec   113 MBytes   942 Mbits/sec
[  5]   4.01-5.01   sec   112 MBytes   941 Mbits/sec
[  5]   5.01-6.01   sec   113 MBytes   942 Mbits/sec
[  5]   6.01-7.01   sec   112 MBytes   942 Mbits/sec
[  5]   7.01-8.01   sec   112 MBytes   941 Mbits/sec
[  5]   8.01-9.00   sec   111 MBytes   941 Mbits/sec
[  5]   8.01-9.00   sec   111 MBytes   941 Mbits/sec
```

### 步骤二：启动客户端

在板端启动 iperf3 客户端，指定要连接的 Server 端的 IP 地址和端口号，然后启动测试。

执行命令：

```bash
iperf3 -c 192.168.127.195 -i 1 -t 600 -p 5002
```

命令参数说明：

- `-c `: 指定服务器的 IP 地址。
- `-i `: 数据打印间隔时间（单位：秒）。
- `-t `: 测试总运行时间（单位：秒）。
- `-p `: 指定服务器监听的端口号。

执行日志：

```bash
Connecting to host 192.168.127.195, port 5002
[  5] local 192.168.127.10 port 51598 connected to 192.168.127.195 port 5002
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-1.00   sec   115 MBytes   965 Mbits/sec    0    381 KBytes
[  5]   1.00-2.00   sec   113 MBytes   947 Mbits/sec    0    402 KBytes
[  5]   2.00-3.00   sec   113 MBytes   949 Mbits/sec    0    402 KBytes
[  5]   3.00-4.00   sec   113 MBytes   950 Mbits/sec    0    402 KBytes
[  5]   4.00-5.00   sec   113 MBytes   949 Mbits/sec    0    402 KBytes
[  5]   5.00-6.00   sec   114 MBytes   956 Mbits/sec    0    425 KBytes
[  5]   6.00-7.00   sec   113 MBytes   947 Mbits/sec    0    492 KBytes
[  5]   7.00-8.00   sec   114 MBytes   954 Mbits/sec    0    492 KBytes
```

## 运行效果

### 测试结果

请查阅 [iperf3 测试结果分析](https://iperf.fr/iperf-doc.php#3doc) 了解输出信息各字段含义。

为获得理想的性能测试结果，请确保以下条件：

- 客户端与服务器通过高质量网线直连。
- 客户端和服务器协商得到 1000M 的速率。
- 测试时，客户端和服务器无其他高负载任务运行。

目前我们测试出来的性能指标数据如下（仅供参考，千兆口直连场景）：

接收带宽：**949 Mbits/sec**

发送带宽：**950 Mbits/sec**

<DocScope products="RDK S100">

实测参考（RDK S100，千兆口经交换机与 PC 直连，板端 `iperf3` 3.16 / PC 端 `iperf3` 3.1.1，单流 `-t 10`）：

| 方向 | 带宽 | 重传 |
|------|------|------|
| 下行（PC → 板，板端接收） | 约 928 Mbits/sec | 0 |
| 上行（板 → PC，板端发送） | 约 853 Mbits/sec | 0 |

> 千兆链路理论上限约 940 Mbits/sec（扣除以太网/IP/TCP 开销），实测值在 850–950 Mbits/sec 之间均属正常，差异主要来自对端性能、网线质量与链路协商结果。

</DocScope>

## 常见问题

### 1. 为什么 iperf3 客户端无法连接到服务器？

- **原因分析**：
  1. 客户端和服务器未在同一网段，或 IP 地址配置错误。
  2. 防火墙阻止了 `iperf3` 使用的端口。
  3. 服务器未正确启动或未监听指定端口。
- **解决方法**：
  1. 确保客户端和服务器的 IP 地址处于同一网段，且能通过 `ping` 命令相互通信。
  2. 检查防火墙设置，允许 `iperf3` 使用的端口通信（例如 `5002`）。
  3. 确保服务器端已正确执行 `iperf3 -s` 命令并在监听。

### 2. 为什么测试带宽低于预期值？

- **原因分析**：
  1. 网络硬件如网卡不支持千兆速率，或未协商到千兆速率。
  2. 客户端或服务器运行了其他高负载任务，影响了性能。
- **解决方法**：
  1. 检查设备硬件支持千兆以太网，必要时强制网卡协商为千兆速率。
  2. 测试前，关闭客户端和服务器上可能占用网络或系统资源的其他任务。

### 3. 为什么测试过程中出现高丢包率？

- **原因分析**：
  1. 测试网络环境存在干扰，或网线质量较差。
  2. 测试设备的网络配置（如缓冲区大小）不符合要求。
- **解决方法**：
  1. 使用高质量网线，并确保连接稳固无干扰。
  2. 调整网络配置，例如增大 TCP 缓冲区：

     ```bash
     sysctl net.core.rmem_max                          # 查看接收缓冲区（rmem_max）的最大值
     sysctl net.core.wmem_max                          # 查看发送缓冲区（wmem_max）的最大值
     sysctl -w net.core.rmem_max=2500000               # 设置接收缓冲区（rmem_max）的最大值为 2,500,000 字节
     sysctl -w net.core.wmem_max=2500000               # 设置发送缓冲区（wmem_max）的最大值为 2,500,000 字节
     ```

### 4. 如何解决 iperf3 运行时显示 "Address already in use" 错误？

- **原因分析**：此错误通常是因为服务器端口已经被占用，可能是另一个 `iperf3` 实例未关闭。
- **解决方法**：
  1. 确保服务器端未运行其他 `iperf3` 实例，或使用不同端口启动。

     ```bash
     iperf3 -s -p <新端口号>
     ```
  2. 检查并结束占用端口的进程：

     ```bash
     netstat -tuln | grep 5002
     kill <进程 ID>
     ```

### 5. 为什么 ping 通但 iperf3 报 Connection refused？

- **原因分析**：板端 `iperf3`（3.x）默认 server 监听 IPv6 `[::]`，不接收 IPv4 连接，PC 用 IPv4 连接时被拒绝。
- **解决方法**：板端起 server 时显式绑定 IPv4：`iperf3 -s -B 0.0.0.0 -p 5201`，并用 `ss -tlnp4 | grep 5201` 确认监听在 `0.0.0.0:5201`。

### 6. 为什么 iperf3 报 unable to create a new stream: No such file or directory？

- **原因分析**：PC 端使用基于 Cygwin 的 `iperf3.exe`（如 3.1.1）时，未在其安装目录下运行，导致找不到同目录的 `cygwin1.dll`。
- **解决方法**：`cd` 到 `iperf3.exe` 所在目录后再执行；或将其目录加入 `PATH`。建议两端 `iperf3` 版本尽量一致。

### 7. 为什么两端都配了静态 IP，ping 还是 100% 丢包（但 ARP 能解析）？

- **原因分析**：对端（常见为 Windows PC）ARP 表里残留**静态/过期记录**，把板子 IP 钉到了一个错误 MAC。板子发出的 request 对端收到了，但回包发到了错误 MAC，板子网卡硬件直接丢弃，表现为 `ip neigh` 显示对端 `REACHABLE`、`tcpdump` 能看到 reply，但 `ping` 0 收包。
- **解决方法**：在对端清理 ARP 缓存后重新 `ping`：

  ```bash
  # Windows（管理员）
  Remove-NetNeighbor -IPAddress 192.168.127.10 -Confirm:$false
  netsh interface ip delete arpcache
  # Linux
  ip neigh flush all
  ```

  另检查 PC 测试网卡是否挂了多个网段 IP 导致源 IP 选错（见「环境准备」第 5 条）。

:::note 提示
若以上方法未能解决问题，请参考 [iperf3 官方文档](https://iperf.fr/) 或相关技术论坛，获取更多支持。
:::

## 相关文档

- [概述](./01_overview.md)
- [Ethernet 驱动开发指南](../16_driver_ethernet/01_ethernet.md)
- [搭建开发环境](../../06_environment_build/01_environment_build.md)
