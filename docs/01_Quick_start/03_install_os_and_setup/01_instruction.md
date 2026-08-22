---
sidebar_position: 1
title: "烧录说明"
description: "RDK S100/S600 烧录前准备：镜像下载、工具、数据线、环境"
---

# 烧录说明

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK S100">

**说明：** 本页基于官方烧录说明整理。烧录会抹除板端系统，烧录操作未在 S100 板端复现验证；镜像下载地址已实测可达（2026-08-20 验证）。

</DocScope>

<DocScope products="RDK S600">

**说明：** 本页基于官方烧录说明整理。烧录会抹除板端系统，未在 S600 板端复现验证（避免抹除当前在用的 S600）；镜像下载地址已实测可达（2026-08-20 验证 S100/S600 下载页均返回 HTTP 200），XBurn 工具以官方说明为准。

</DocScope>

## 概述

烧录说明介绍烧录系统前的准备工作：下载镜像、安装烧录工具、连接数据线、完成环境准备。

- **做什么**：完成烧录前的镜像、工具、线材与环境准备。
- **为什么**：设备出厂预装测试版固件，需烧录最新版本镜像后才能正常使用。
- **做完能干嘛**：按 [烧录步骤](./02_burn.md) 即可开始烧录。

## 前置条件

开始烧录前，请确认已准备：

- [ ] 一台 PC（Windows/Linux/macOS），用于运行 XBurn 烧录工具。
- [ ] 带屏蔽层、支持数据传输的 Type-C 数据线（非纯充电线）。
- [ ] 开发板配套电源适配器。
- 已完成：[开始使用 RDK](../02_getting_started.md) 的基础外设连接。

## 安全注意事项

- 禁止带电时拔插除 USB、HDMI 和网线之外的任何设备。
- 选用正规品牌的电源适配器，否则会出现供电异常，导致系统异常断电。
- 建议使用板载 POWER ON/OFF 按键实现主板上下电，并在适配器断电状态下对 DC 头进行插拔。

## 镜像下载

:::warning
设备出厂预装的是测试版固件，建议重新烧录最新版本镜像后再使用。
:::

<DocScope products="RDK S100">

RDK S100 提供 Ubuntu 22.04 桌面版系统镜像，自带图形桌面环境。

1. 前往 [镜像下载页](https://archive.d-robotics.cc/downloads/os_images/rdk_s100/)，选择 RDK S100 最新版本的镜像 > **RDK LNX SDK** > **firmwares** > **product.zip**。

2. 解压后得到 **product** 文件夹，确保其内有 **img_packages** 文件夹和 **xmodem_tools** 文件夹。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/acore-product.png" alt="product 文件夹界面" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK S600">

RDK S600 提供 Ubuntu 24.04 桌面版系统镜像，自带图形桌面环境。

1. 前往 [镜像下载页](https://archive.d-robotics.cc/downloads/os_images/rdk_s600/)，选择 RDK S600 最新版本的镜像 > **RDK LNX SDK** > **firmwares** > **product.zip**。

2. 解压后得到 **product** 文件夹，确保其内有 **img_packages** 文件夹和 **xmodem_tools** 文件夹。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/product-folder.png" alt="product 文件夹界面" style={{ width: '100%' }} />

</DocScope>

## 烧录工具

下载并安装 XBurn 工具，见 [安装 XBurn](https://developer.d-robotics.cc/xburn_doc/install)。

## 数据线要求

烧录通过 Type-C 数据线传输镜像，线材不达标会导致传输误码或烧录失败。数据线需满足以下条件：

- **带屏蔽层**：线材具备金属编织层或铝箔屏蔽，可减少传输误码。
- **长度尽量短**：长线会增大信号衰减。
- **支持数据传输**：部分线材仅供电不传数据，使用支持 USB 数据传输的线材，而非纯充电线。

## 硬件连接

<DocScope products="RDK S100">

通过 Type-C 数据线连接 PC 的 USB 口与 RDK S100 的 Type-C 口。

</DocScope>

<DocScope products="RDK S600">

通过 Type-C 数据线连接 PC 的 USB 口与 RDK S600 的 Type-C 口。

</DocScope>

## 环境准备

安装驱动与依赖（因操作系统而异，**烧录前必须完成**，否则 XBurn 无法识别设备）：

- [Windows 环境](https://developer.d-robotics.cc/xburn_doc/environment/windows-setup)：USB Driver（ADB、Fastboot、DFU）与 CH341 串口驱动
- [Linux 环境](https://developer.d-robotics.cc/xburn_doc/environment/linux-setup)：adb/fastboot/dfu-util 依赖与 udev 规则
- [macOS 环境](https://developer.d-robotics.cc/xburn_doc/environment/mac-setup)：brew 依赖（android-platform-tools、dfu-util）

## 验证结果

准备完成后，确认：

- ✅ 成功标志：product 文件夹内同时存在 `img_packages` 和 `xmodem_tools` 两个条目；XBurn 启动后能识别到开发板设备。
- ❌ 常见失败：
  - XBurn 不识别设备 → 检查 Type-C 数据线是否支持数据传输、是否已完成 [环境准备](#环境准备)。
  - product 文件夹结构不对 → 重新下载并解压镜像。

## 相关文档

- [烧录步骤](/Quick_start/install_os_and_setup/burn)
- [系统状态查询](/Quick_start/install_os_and_setup/system_status)
- [远程登录](/Quick_start/install_os_and_setup/remote_login)

<DocScope products="RDK S100">

- [S100 硬件介绍](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit)

</DocScope>

<DocScope products="RDK S600">

- [S600 硬件介绍](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit)

</DocScope>
