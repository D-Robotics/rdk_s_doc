---
title: 烧录说明（S600）
sidebar_position: 1
description: RDK S600 烧录前准备：镜像下载、工具、数据线、环境
---

# 烧录准备

:::info 说明
本页基于官方烧录说明整理。烧录会抹除板端系统，未在 S600 板端复现验证（避免抹除当前在用的 S600）；镜像下载地址与 XBurn 工具以官方说明为准。
:::

## 安全注意事项

- 禁止带电时拔插除 USB、HDMI 和网线之外的任何设备。
- 选用正规品牌的电源适配器，否则会出现供电异常，导致系统异常断电。
- 建议使用板载 POWER ON/OFF 按键实现主板上下电，并在适配器断电状态下对 DC 头进行插拔。

## 镜像下载

RDK S600 提供 Ubuntu 24.04 桌面版系统镜像，自带图形桌面环境。

:::warning
设备出厂预装的是测试版固件，建议重新烧录最新版本镜像后再使用。
:::

1. 前往 [镜像下载页](https://archive.d-robotics.cc/downloads/os_images/rdk_s600/)，选择 RDK S600 最新版本的镜像 > **RDK LNX SDK** > **firmwares** > **product.zip**。


2. 解压后得到 **product** 文件夹，确保其内有 **img_packages** 文件夹和 **xmodem_tools** 文件。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/product-folder.png" alt="product 文件夹界面" style={{ width: '100%' }} />

## 烧录工具

下载并安装 XBurn 工具，见 [安装 XBurn](https://developer.d-robotics.cc/xburn_doc/install)。

## 数据线要求

烧录通过 Type-C 数据线传输镜像，线材不达标会导致传输误码或烧录失败。数据线需满足以下条件：

1. **带屏蔽层**：线材具备金属编织层或铝箔屏蔽，可降低传输误码。
2. **长度尽量短**：过长会增大信号衰减。
3. **支持数据传输**：部分线材仅供电不传数据，使用支持 USB 数据传输的线材，而非纯充电线。

## 硬件连接

通过 Type-C 数据线连接 PC 的 USB 口与 RDK S600 的 Type-C 口。

## 环境准备

安装驱动与依赖（因操作系统而异，**烧录前必须完成**，否则 XBurn 无法识别设备）：

- [Windows 环境](https://developer.d-robotics.cc/xburn_doc/environment/windows-setup)：USB Driver（ADB、Fastboot、DFU）与 CH341 串口驱动
- [Linux 环境](https://developer.d-robotics.cc/xburn_doc/environment/linux-setup)：adb/fastboot/dfu-util 依赖与 udev 规则
- [macOS 环境](https://developer.d-robotics.cc/xburn_doc/environment/mac-setup)：brew 依赖（android-platform-tools、dfu-util）

## 相关文档

- [烧录步骤（S600）](./02_burn/01_burn.md)
- [系统状态查询](../system_status.md)
- [远程登录](../remote_login.md)
- [S600 硬件介绍](../../01_hardware_introduction/02_rdk_s600.md)
