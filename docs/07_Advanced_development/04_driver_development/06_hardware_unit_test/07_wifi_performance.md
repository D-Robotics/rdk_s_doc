---
sidebar_position: 7
title: "Wi-Fi 性能测试"
description: "Wi-Fi 性能测试"
---
# Wi-Fi 性能测试

## 概述

本文介绍如何使用 iperf3 工具对开发板 Wi-Fi 进行性能测试，测量带宽/吞吐量、延迟、丢包率等指标，验证无线网络在高负载下的表现。关于 iperf3 的使用说明，请参考 [iperf3 官方文档](https://iperf.fr/iperf-doc.php#3doc)。

Wi-Fi 性能测试主要关注以下方面：

1. **带宽和吞吐量**：评估网络实际可用带宽，确定 Wi-Fi 网络在高负载情况下的表现。
2. **延迟**：测量数据传输时的延迟，高负载下延迟增加可能对实时应用产生负面影响。
3. **丢包率**：检测数据包丢失率，丢包率过高可能影响数据传输的完整性。
4. **信号强度和覆盖范围**：分析信号强度和覆盖范围，确保测试区域内信号稳定。

**适用范围**：RDK S100 / S600 开发板（Wi-Fi 经 PCIe 拓展的 M.2 E-key 接口接入）。

**适用读者**：进行硬件单元测试与整机性能验证的测试及开发人员。

## 测试准备工作

性能测试示意图：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/WiFi_usage_diagram.png" alt="测试准备工作示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

在进行 Wi-Fi 性能测试前，请确保完成以下准备：
1. **启用板端 Wi-Fi 功能**：确保开发板已开启 Wi-Fi 并连接到路由器。
2. **明确服务器和客户端设备**：开发板既可以作为客户端，也可以作为服务器；对端设备可使用 PC 或另一块开发板。
3. **网络通信测试**：确保开发板和对端设备可以通过 Wi-Fi 正常通信。

以下是本测试的网络配置：

- 个人电脑（PC）作为服务器，IP 地址：192.168.137.1。
- 开发板作为客户端，IP 地址：192.168.137.124。

:::note
上述 IP 地址为示例值，实际以你的网络环境为准。
:::

通过以下命令验证开发板与服务器之间的连接：

```shell
ping -I wlan0 192.168.137.1
```

执行结果：

```text
PING 192.168.137.1 (192.168.137.1) 56(84) bytes of data.
64 bytes from 192.168.137.1: icmp_seq=1 ttl=128 time=15.0 ms
64 bytes from 192.168.137.1: icmp_seq=2 ttl=128 time=8.26 ms
64 bytes from 192.168.137.1: icmp_seq=3 ttl=128 time=6.60 ms
```

## 测试方法
### 步骤一：启动服务器

在个人电脑（PC）上启动 iperf3 服务器：

1. 下载并安装 iperf3：
   - 前往 [iperf 官网](https://iperf.fr/iperf-download.php) 下载适合操作系统的安装包。

2. 在 Windows 系统中，通过命令提示符（cmd）运行以下命令启动服务器：

```shell
iperf3 -s -p 5002
```

服务器启动后的日志示例：

```text
-----------------------------------------------------------
Server listening on 5002
-----------------------------------------------------------
```

客户端连接成功后，服务器日志将显示：

```text
Accepted connection from 192.168.137.124, port 48632
[  5] local 192.168.137.1 port 5002 connected to 192.168.137.124 port 48644
[ ID] Interval           Transfer     Bitrate
[  5]   0.00-1.02   sec  14.8 MBytes   121 Mbits/sec
[  5]   1.02-2.00   sec  14.5 MBytes   123 Mbits/sec
[  5]   2.00-3.02   sec  14.8 MBytes   121 Mbits/sec
[  5]   3.02-4.01   sec  12.8 MBytes   108 Mbits/sec
```

### 步骤二：启动客户端

在开发板上启动 iperf3 客户端，连接到服务器并开始测试：

```shell
iperf3 -c 192.168.137.1 -i 1 -t 60 -p 5002
```

命令参数说明：

```text
-c：指定服务器的 IP 地址。
-i：设置数据打印间隔时间（单位：秒）。
-t：设定总运行时间（单位：秒）。
-p：指定服务器的端口号。
```

客户端运行日志示例：

```text
Connecting to host 192.168.137.1, port 5002
[  5] local 192.168.137.124 port 48644 connected to 192.168.137.1 port 5002
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-1.00   sec  15.1 MBytes   121 Mbits/sec    0    941 KBytes
[  5]   1.00-2.00   sec  15.0 MBytes   126 Mbits/sec    0    512 KBytes
[  5]   2.00-3.00   sec  15.0 MBytes   126 Mbits/sec    0    552 KBytes
[  5]   3.00-4.00   sec  12.5 MBytes   105 Mbits/sec    0    512 KBytes
```

## 测试结果

关于 iperf3 输出日志中字段的含义及分析方法，请查阅 [iperf3 官方文档](https://iperf.fr/iperf-doc.php)。

## 性能标准

测试 Wi-Fi 性能没有一概而论的数据指标可以参考。影响性能的外部因素非常丰富，包括硬件、环境等多个方面。以下是一些会对性能有影响的常见因素：

1. **天线质量和方向性**：Wi-Fi 设备的天线质量和方向性会影响信号的传播和接收。使用高质量的天线和合适的方向性可以提高信号质量和覆盖范围。
2. **信道干扰**：其他 Wi-Fi 网络、无线设备或电子设备可能在相同或相邻的频段上产生干扰，影响 Wi-Fi 信号的质量和性能。
3. **信号强度和衰减**：Wi-Fi 信号强度与距离成反比关系，而且受到障碍物、墙壁等的影响。
4. **其他无线设备**：附近的其他无线设备，如蓝牙设备、无线键盘、鼠标等，也可能对 Wi-Fi 性能产生影响。

在评估 Wi-Fi 性能数据时，应综合考虑上述因素，制定优化策略以确保网络性能的稳定性和可靠性。

## 常见问题

### iperf3 客户端无法连接到服务器

**原因**：服务器未启动，或开发板与服务器之间的 Wi-Fi 网络不通。

**解决**：先 `ping -I wlan0 <服务器IP>` 确认连通，再在 PC 端执行 `iperf3 -s -p 5002` 启动服务器后重试。

### 测试带宽显著低于预期

**原因**：Wi-Fi 性能受天线方向、信道干扰、信号强度/衰减、邻近无线设备等环境因素影响。

**解决**：参考[性能标准](#性能标准)逐项排查并优化测试环境。

## 相关文档

- [驱动功能单元测试](/Advanced_development/driver_development/hardware_unit_test)
- [概述](./01_overview.md)
- [搭建开发环境](/Advanced_development/environment_build/environment_build)
