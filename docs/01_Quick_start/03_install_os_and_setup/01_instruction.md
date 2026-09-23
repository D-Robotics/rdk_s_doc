---
sidebar_position: 1
title: "烧录说明"
description: "RDK S100/S600 烧录前准备：镜像下载、工具、数据线、环境"
---

# 烧录说明

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本页介绍烧录系统前的准备工作：获取系统镜像、安装 XBurn 烧录工具、连接数据线并检查硬件与环境。

设备出厂预装的固件为测试版，需先烧录最新版本镜像方可正常使用；完成本页准备后，即可按 [烧录步骤](./02_burn.md) 开始烧录。

## 前置条件

开始烧录前，请确认已准备：

- [ ] 一台 PC，推荐 Windows 10 及以上或 Ubuntu 22.04；用于运行 XBurn 烧录工具。
- [ ] 带屏蔽层、支持数据传输的 Type-C 数据线，非纯充电线。
- [ ] 开发板配套电源适配器；推荐使用正规品牌、规格与板卡匹配的适配器。
- [ ] 已获取对应平台的系统镜像（见[步骤 1](#步骤-1获取系统镜像)）。
- [ ] 已完成基础外设连接，见[开始使用 RDK](../02_getting_started.md)。
- [ ] 已了解手中板卡的接口布局：[RDK S100 硬件介绍](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit) 或 [RDK S600 硬件介绍](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit)。

:::warning 警告
烧录会抹除板端系统，请先确认板内数据已备份。为避免断电导致烧录中断或损坏 eMMC，烧录全程请勿断开开发板电源。
:::

## 操作步骤

### 步骤 1：获取系统镜像

<DocScope products="RDK S100">

RDK S100 提供 Ubuntu 22.04 桌面版系统镜像，自带图形桌面环境。

1. 前往 [镜像下载页](https://archive.d-robotics.cc/downloads/os_images/rdk_s100/)，选择 RDK S100 最新版本的镜像 > **RDK LNX SDK** > **firmwares** > **product.zip**。

2. 解压后得到 **product** 文件夹，确保其内有 **img_packages** 文件夹和 **xmodem_tools** 文件夹。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/acore-product.png" alt="product folder contents after unzipping (RDK S100)" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK S600">

RDK S600 提供 Ubuntu 24.04 桌面版系统镜像，自带图形桌面环境。

1. 前往 [镜像下载页](https://archive.d-robotics.cc/downloads/os_images/rdk_s600/)，选择 RDK S600 最新版本的镜像 > **RDK LNX SDK** > **firmwares** > **product.zip**。

2. 解压后得到 **product** 文件夹，确保其内有 **img_packages** 文件夹和 **xmodem_tools** 文件夹。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/product-folder.png" alt="product folder contents after unzipping (RDK S600)" style={{ width: '100%' }} />

</DocScope>

预期输出：`product` 文件夹结构如下。

```text
product/
├── img_packages/
└── xmodem_tools/
```

:::warning 警告
设备出厂预装的是测试版固件，请重新烧录最新版本镜像后再使用。
:::

### 步骤 2：安装 XBurn 并完成环境准备

下载并安装 XBurn 工具，见 [安装 XBurn](https://developer.d-robotics.cc/xburn_doc/install)。

驱动程序与依赖因操作系统而异，**烧录前必须完成**，否则 XBurn 无法识别设备：

- [ ] [Windows 环境](https://developer.d-robotics.cc/xburn_doc/environment/windows-setup)：USB Driver（ADB、Fastboot、DFU）与 CH341 串口驱动
- [ ] [Linux 环境](https://developer.d-robotics.cc/xburn_doc/environment/linux-setup)：adb/fastboot/dfu-util 依赖与 udev 规则
- [ ] [macOS 环境](https://developer.d-robotics.cc/xburn_doc/environment/mac-setup)：brew 依赖（android-platform-tools、dfu-util）

预期结果：XBurn 能正常启动，系统中存在对应操作系统的驱动与依赖。

失败排查：XBurn 无法启动或提示缺少驱动与依赖时，按上表重新安装对应环境的驱动与依赖（见[常见问题](#常见问题)）。

### 步骤 3：连接数据线并核对硬件

烧录通过 Type-C 数据线传输镜像，线材不达标会导致传输误码或烧录失败。数据线需满足以下条件：

- **带屏蔽层**：线材具备金属编织层或铝箔屏蔽，可减少传输误码。
- **长度尽量短**：长线会增大信号衰减。
- **支持数据传输**：部分线材仅供电不传数据，需使用支持 USB 数据传输的线材，而非纯充电线。

<DocScope products="RDK S100">

通过 Type-C 数据线连接 PC 的 USB 口与 RDK S100 的 Type-C 口。

</DocScope>

<DocScope products="RDK S600">

通过 Type-C 数据线连接 PC 的 USB 口与 RDK S600 的 Type-C 口。

</DocScope>

**安全注意事项**：

- 禁止带电时拔插除 USB、HDMI 和网线之外的任何设备。
- 选用正规品牌的电源适配器，否则会出现供电异常，导致系统异常断电。
- 建议使用板载 POWER ON/OFF 按键实现主板上下电，并在适配器断电状态下对 DC 头进行插拔。

预期结果：PC 可识别到开发板对应的 USB 设备，XBurn 启动后能识别到开发板。

失败排查：XBurn 不识别设备时，先确认数据线支持数据传输、开发板已上电，再回到[步骤 2](#步骤-2安装-xburn-并完成环境准备)核对驱动与依赖。

## 验证结果

| 检查项 | 命令 | 成功判据 |
| --- | --- | --- |
| 系统镜像已就绪 | 人工检查 `product` 文件夹 | 文件夹内同时存在 `img_packages` 与 `xmodem_tools` 两个条目 |
| 烧录环境已就绪 | 人工检查 XBurn 与系统驱动 | XBurn 能正常启动，且已安装对应操作系统的驱动与依赖 |
| 硬件已连接 | 人工检查 XBurn 设备列表 | XBurn 启动后能识别到开发板设备 |

## 常见问题

### XBurn 不识别设备

**原因**：Type-C 数据线不支持数据传输，或未完成对应操作系统的驱动与依赖安装。

**解决**：更换带屏蔽层、支持数据传输的 Type-C 数据线；按[步骤 2](#步骤-2安装-xburn-并完成环境准备)完成驱动与依赖安装。仍未识别时，参考 [XBurn 官方文档](https://developer.d-robotics.cc/xburn_doc/install)排查。

### `product` 文件夹结构不正确

**原因**：镜像压缩包未下载完整，或解压层级不对，导致缺少 `img_packages` 或 `xmodem_tools` 文件夹。

**解决**：按[步骤 1](#步骤-1获取系统镜像)重新下载并解压镜像，确认 `product` 文件夹内两个子文件夹都存在。

### 烧录过程中断或失败

**原因**：烧录过程断电、数据线接触不良或线材不达标。

**解决**：保持开发板供电稳定，烧录全程不断电；更换符合要求的数据线后重试，并确认烧录前已完成[步骤 2](#步骤-2安装-xburn-并完成环境准备)的环境准备。

## 相关文档

- [烧录步骤](./02_burn.md)
- [系统状态查询](./03_system_status.md)
- [远程登录](./05_remote_login.md)
- [开始使用 RDK](../02_getting_started.md)

