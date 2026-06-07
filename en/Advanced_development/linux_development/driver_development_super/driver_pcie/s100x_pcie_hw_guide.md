# PCIe Hardware Specifications and Supported Topologies

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_pcie/s100x_pcie_hw_guide

## Introduction to PCIe

PCI Express (PCIe) is a multi-channel I/O interconnect that provides low pin count, high reliability, and high-speed data transmission. It is the third-generation I/O interconnect technology following the ISA and PCI buses, designed to serve as a universal serial I/O interconnect for multiple market segments, including desktops, mobile devices, servers, storage, and embedded communications.

## PCIe Hardware Specifications

- Two PCIe Gen 4.0 controllers, with controller and lane configurations as follows:
- One controller: x2 or x4
- Two controllers: x1
- Each controller supports configuration as RC or EP mode
- EP mode supports SR-IOV: 1 PF + 4 VFs
- Supports 8 pairs of DMA channels
- Supports MSI-X
- Supports SMMU
- Supports 48 Outbound channels
- Supports PTM time synchronization

## The following PCIe bus topologies are supported

![S100_600_PCIE_Topology](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/pcie/topology.png)
1. **Topology 1** : Direct connection between two development boards, with one board acting as RC and the other as EP
2. **Topology 2** : Direct connection among three development boards, with one board acting as RC connected to two EP boards
3. **Topology 3** : Direct connection between one development board and another third-party standard PCIe EP device, such as an NVMe SSD device
4. **Topology 4** : One development board acts as a PCIe EP device connected to a third-party RC device, typically used when the development board serves as a PCIe accelerator card
5. **Topology 5** : Multiple development boards and third-party standard PCIe EP devices connected via a PCIe Switch, with one development board acting as RC and all other devices as EP
