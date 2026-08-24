---
sidebar_position: 0
slug: /RDK
title: D-Robotics RDK Kits
description: "Introduction, resource index, documentation navigation, three-mode tour, and version releases for the RDK S100/S600 kits"
---

# D-Robotics RDK Kits

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Kit Introduction

**D-Robotics Developer Kits**, abbreviated as RDK kits, are robot developer kits built on the D-Robotics computing platform, covering both hardware boards and supporting software to help developers rapidly build robot prototypes and carry out evaluation and validation. The hardware product line of the kits includes RDK X3, RDK X3 Module, RDK X5, RDK Ultra, the RDK S100 series, and the RDK S600 series. This manual targets the **RDK S100 / RDK S600**.

The TogetheROS.Bot (tros.b) robotics middleware is preinstalled in the image. See [RDK OS Introduction](#rdk-os-introduction) below for details.

:::note Note
Check the system version number: `cat /etc/version`; use `rdkos_info` to view board and runtime information. See [System Status Query](./01_Quick_start/03_install_os_and_setup/03_system_status.md) for details.
:::

### Product Introduction

<DocScope products="RDK S100">

The **RDK S100 series** is a high-performance development kit featuring 80/128 TOPS of on-device inference capability and 6-core ARM A78AE processing power. It supports 2 MIPI camera inputs, 4 USB 3.0 ports, and 2 PCIe 3.0 interfaces.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/image-rdks100-serials.png" alt="RDK S100 series" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

<DocScope products="RDK S600">

The **RDK S600 series** is a high-performance development kit featuring 560 TOPS of on-device inference capability and 18-core ARM A78AE processing power. It supports 2 MIPI camera and 6 GMSL camera inputs, 6 USB 3.0 ports, and 4 PCIe 3.0 interfaces.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_600_v0p1_mainboard_overview.png" alt="RDK S600 series" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

## RDK OS Introduction

**RDK OS** is a board-level operating system image customized based on Ubuntu, with adaptations, driver integration, and preinstalled examples for the BPU/CPU/MCU/peripherals of RDK boards. After flashing, you immediately get a ready-to-use Linux environment without having to compile the kernel or assemble the root filesystem yourself.

### Preinstalled Capabilities

RDK OS works out of the box with:

- **BPU runtime**: `hobot-dnn` (UCP/DNN, the BPU inference stack).
- **Camera support**: `hobot-camera` (sensor support package).
- **tros.b robotics middleware**: TogetheROS.Bot based on ROS/ROS2, preinstalled in the image (see [Using TogetheROS.Bot](/Quick_start/next_steps/trosb)).
- **Algorithm toolchain runtime**: capable of loading `.hbm` quantized models for inference.
- **apt sources**: the official D-Robotics source (`archive.d-robotics.cc`) + Ubuntu sources, see [Package Management apt](./02_System_configuration/03_system_update/01_apt_usage.md).

## Resource Index

> Download system images, tools, and hardware materials here. Commercial edition materials are obtained through the questionnaire and NDA process; see the [Commercial Edition Materials](#commercial-edition-materials) section below.

### System Images

| Platform | Download |
| --- | --- |
| RDK S100 | [archive.d-robotics.cc/rdk_s100](https://archive.d-robotics.cc/downloads/os_images/rdk_s100/) |
| RDK S600 | [archive.d-robotics.cc/rdk_s600](https://archive.d-robotics.cc/downloads/os_images/rdk_s600/) |

### Tools

| Tool | Description |
| --- | --- |
| [XBurn](https://developer.d-robotics.cc/xburn_doc/install) | System flashing tool |
| [RDK Studio](https://developer.d-robotics.cc/rdkstudio) | Integrated development environment |
| Cross-compilation toolchain | See [Setting Up the Development Environment](./07_Advanced_development/06_environment_build/01_environment_build.md) |

### Hardware Materials

| Category | Description |
| --- | --- |
| Schematics / interface annotation diagrams / mechanical dimension drawings | See the documents for each kit and expansion board in [Hardware Introduction](./01_Quick_start/01_hardware_introduction/01_rdk_s100.md) |
| STEP 3D models / product renders | See the hardware materials section of [Hardware Introduction](./01_Quick_start/01_hardware_introduction/01_rdk_s100.md) |
| Certified accessories list (AVL) | See the accessories list section of [Hardware Introduction](./01_Quick_start/01_hardware_introduction/01_rdk_s100.md) |

### Commercial Edition Materials

:::tip Commercial Support
The commercial edition provides more complete feature support, deeper openness of hardware capabilities, and exclusive customized content. To ensure compliant and secure delivery of the content, access is granted through the following steps:

1. Fill in the questionnaire: submit basic information such as your organization and usage scenarios
2. Sign a non-disclosure agreement (NDA): signed after confirmation by both parties
3. Content release: the commercial edition materials are released through a private channel

Questionnaire link: https://horizonrobotics.feishu.cn/share/base/form/shrcnpBby71Y8LlixYF2N3ENbre
:::

## Documentation Navigation

- **Chapter 1 [Quick Start](/Quick_start)**: hardware introduction, peripheral connections, flashing, initial setup, and remote login.
- **Chapter 2 [System Configuration](./02_System_configuration/01_network_config.md)**: network, Bluetooth, system update, srpi-config, config.txt, display and audio, storage, clock, user permissions, logs, and debug serial port.
- **Chapter 3 [Demos](./03_Demos/01_peripheral/01_40pin/01_s100/01_40pin_define.md)**: demos for peripherals, multimedia, and algorithms (classification/detection/segmentation/pose/speech/camera inference), with C/C++ and Python side by side.
- **Chapter 4 [Simple API](./04_Simple_API/01_multimedia_api/cdev/01_vio_api.md)**: simple interfaces of the wrapper layer for multimedia and inference.
- **Chapter 5 [Advanced Development](./07_Advanced_development/02_board_bringup/01_rdk_s100_bringup.md)**: deb/system software/drivers/multimedia/MCU/algorithm toolchain/VDSP (Mode 3).
- **Chapter 6 [FAQ](/FAQ)**: FAQs organized by problem domain.
- **Chapter 7 [Appendix](./09_Appendix/rdk-command-manual/01_devmem.md)**: RDK-specific commands and Linux command usage.

## Three-Mode Tour

| Mode | Readers | Recommended path |
|---|---|---|
| Mode 1 Direct Use | Individuals/geeks/students | Chapter 1 Quick Start → Chapter 2 System Configuration → Chapter 3 Demos → Chapter 4 Simple API |
| Mode 2 Product Integration | R&D at product companies | Chapter 2 System Configuration + system customization in Chapter 5 Advanced Development (apt/configuration layer/image rebuilding) |
| Mode 3 Deep Customization | Commercial customers/deep-diver teams | The entire Chapter 5 Advanced Development (deb/drivers/multimedia/MCU/toolchain/VDSP) |

For the recommended path of each mode, see the table above.

## Version Releases

### RDK S100 Version Releases

- [RDKS100_LNX_SDK_V4.0.5_20260507](./10_Release_Note/01_s100/01_v4_0_5_260507.md)
- [RDKS100_LNX_SDK_V4.0.5](./10_Release_Note/01_s100/02_v4_0_5.md)
- [RDKS100_LNX_SDK_V4.0.4](./10_Release_Note/01_s100/03_v4_0_4.md)
- [RDKS100_LNX_SDK_V4.0.3](./10_Release_Note/01_s100/04_v4_0_3.md)
- [RDKS100_LNX_SDK_V4.0.2](./10_Release_Note/01_s100/05_v4_0_2.md)

### RDK S600 Version Releases

- [RDKS600_LNX_SDK_V5.1.0](./10_Release_Note/02_s600/03_v5_1_0.md)
- [RDKS600_LNX_SDK_V5.0.1_BETA](./10_Release_Note/02_s600/02_v5_0_1.md)
- [RDKS600_LNX_SDK_V5.0.0_BETA](./10_Release_Note/02_s600/01_v5_0_0.md)

## Ecosystem Project Cooperation

For product development, industry deployment, or volume rollout projects based on the RDK platform, the **"D-Robotics Ecosystem Project Cooperation Center"** is established as the unified collaboration entry point.

When you are involved in the following scenarios, we recommend submitting your project information through this entry point:

- Productization or mass production plans
- System architecture evaluation and solution confirmation
- Module adaptation and performance optimization support
- Joint development of commercial projects
- Technical confirmation before volume procurement

👉 Project cooperation entry point: [D-Robotics Ecosystem Project Cooperation Exchange](https://horizonrobotics.feishu.cn/share/base/form/shrcnpxBa3PjdjFmtxZS3tBXw0e)

:::note Note
This entry point applies to well-defined projects or commercial deployment needs. For everyday technical questions, we recommend resolving them first through forum Q&A or the [FAQ](/FAQ) chapter.
:::
