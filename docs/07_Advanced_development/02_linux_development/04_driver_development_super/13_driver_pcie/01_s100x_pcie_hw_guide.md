---
sidebar_position: 1
---
# PCIe 硬件规格以及支持的拓扑结构

## PCIe 简介

PCI Express (PCIe) 模块是一种多通道 I/O 互连，提供低引脚数、高可靠性和高速数据传输。
它是继 ISA 和 PCI 总线之后的第三代 I/O 互连技术，旨在用作多个细分市场的通用
串行 I/O 互连，包括台式机、移动设备、服务器、存储和嵌入式通信。

## PCIe 硬件规格


- 两个 PCIe Gen 4.0控制器，控制器与 lane 的配置如下：
  - 一个控制器：x2或者 x4
  - 两个控制器：x1
- 每个控制器都支持配置为 RC 或者 EP 模式
- EP 模式支持 SR-IOV：1个 PF+4个 VF
- 支持8对 DMA 通道
- 支持 MSI-X
- 支持 SMMU
- 支持48个 Outbound
- 支持 PTM 时间同步

## 支持如下几种 PCIe 总线拓扑

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/pcie/topology.png" alt="S100_600_PCIE_Topology" style={{ width: '100%' }} />

1. **拓扑1**：双开发板直连，一个开发板作为 RC，另一个开发板作为 EP

2. **拓扑2**：三开发板直连，一个开发板作为 RC 同时连接两个开发板 EP

3. **拓扑3**：一个开发板直连另一个第三方的标准 PCIe EP 设备，例如 NVMe SSD 设备

4. **拓扑4**：一个开发板作为 PCIe EP 设备连接到第三方的 RC 设备上，典型的场景是开发板作为 PCIe 加速卡

5. **拓扑5**：多个开发板以及第三方标准 PCIe EP 设备通过 PCIe Switch 连接，其中一个开发板作为 RC，其他设备均为 EP
