---
sidebar_position: 2
title: "1.2 开始使用 RDK"
description: "RDK S100/S600 基础外设连接指南：电源、启动介质、键鼠、显示器、音频、网络、USB"
---

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

# 1.2 开始使用 RDK

本页指导你在拿到 RDK 开发板后，连接基础外设并完成首次启动。只需接好电源、显示器和输入设备，即可进入桌面环境（Desktop 版）或控制台（Server 版），为后续烧录、配置和开发做准备。

> 相机扩展板、MCU 接口扩展板等配件的安装见 [1.1 硬件介绍](/01_Quick_start/01_hardware_introduction/03_expansion_board) 各板卡文档。网络深度配置见 [2.1 网络配置](../02_System_configuration/01_network_config.md)。烧录系统见 [1.3.1 系统烧录](./03_install_os_and_setup/01_instruction.md)。

## 电源

RDK 开发板使用外接 DC 电源适配器供电，不支持 USB 供电。

:::warning 上电顺序
开发板需**先于**独立供电的外设上电。若外设先上电且对主板有电源倒灌，开发板可能触发保护状态无法启动。
:::

<DocScope products="RDK-S100">

RDK S100 电源规格：

- 电源输入：DC 12~20V，最大 150W
- 随附适配器：90W 电源适配器
- 电源接口：DC 圆口
- 电源开关：**SW1**（拨至 ON 上电，OFF 断电）

</DocScope>

<DocScope products="RDK-S600">

RDK S600 电源规格：

- 电源输入：DC 12~28V
- 电源接口：4-pin 连接器
- 电源开关：**SW3**（拨至 ON 上电，OFF 断电）

</DocScope>

## 启动介质

RDK 出厂预装系统镜像，可直接从板载存储启动，无需额外 SD 卡。

<DocScope products="RDK-S100">

RDK S100 从板载 **eMMC** 启动。启动盘选择由 **SW3** 拨码决定，出厂已设为 eMMC 启动位。如需从其他介质启动（暂不支持 NVMe 启动），参考 [S100 硬件介绍](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#系统启动盘选择-sw3) 的 SW3 说明。

</DocScope>

<DocScope products="RDK-S600">

RDK S600 从板载 **UFS** 启动。启动盘选择由 **SW8 BOOT** 拨码决定，出厂已设为 UFS 启动位。如需从 NVMe 启动，参考 [S600 硬件介绍](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#bootsw8) 的 SW8 说明，并需使用 NVMe 版本镜像。

</DocScope>

## 键盘与鼠标

- **有线键鼠**：插入开发板的 **USB Type-A** 接口即可。RDK S100 提供 4 个 USB 3.0 Type-A 接口，RDK S600 提供 6 个 USB 3.2 Type-A 接口。
- **蓝牙键鼠**：需先安装 Wi-Fi & 蓝牙模组（M.2 Key E 接口），配对方法见 [2.2 蓝牙配置](../02_System_configuration/02_bluetooth_config.md)。

## 显示器

通过 **HDMI** 接口连接显示器。

<DocScope products="RDK-S100">

RDK S100 提供 1 个 HDMI Type-A 接口，最高支持 **2560×1440@60Hz**。

</DocScope>

<DocScope products="RDK-S600">

RDK S600 提供 1 个 HDMI 接口。

</DocScope>

连接后上电，系统首次启动会进行默认环境配置（约 45 秒），之后在显示器输出 Ubuntu 桌面环境（Desktop 版）或控制台（Server 版）。

## 音频

音频可通过 HDMI 输出（显示器/电视自带扬声器）或板载音频接口输出。RDK S100 提供板载 I2S/PCM 音频接口；具体音频输出配置见 [2.10 音频配置](../02_System_configuration/10_audio_output.md)。

## 网络

### 有线网络

将以太网线插入开发板的 **RJ45** 接口。

<DocScope products="RDK-S100">

RDK S100 提供 2 个 1000M 以太网口（RJ45）。

</DocScope>

<DocScope products="RDK-S600">

RDK S600 提供 2 个 1GbE + 2 个 10GbE 以太网口（RJ45），另有 1 个 MCU 域 1GbE 口。

</DocScope>

出厂系统默认 DHCP 自动获取 IP。上电后可通过显示器查看 IP，或通过串口/SSH 登录后用 `ip addr` 查看。

### 无线网络

Wi-Fi 需先安装 M.2 Key E Wi-Fi & 蓝牙模组。Wi-Fi 连接配置见 [2.1 网络配置](../02_System_configuration/01_network_config.md)。

## USB 闪连

USB Type-A 接口用于连接 U 盘、移动硬盘等存储设备。USB Type-C 接口用于系统烧录和串口调试，不作为常规 USB 数据口使用。烧录方法见 [1.3.1 系统烧录](./03_install_os_and_setup/01_instruction.md)。

## 首次启动

1. 接好电源适配器。
2. 连接显示器（HDMI）、键盘、鼠标（Desktop 版）或串口线（Server 版）。
3. 有线网络插入 RJ45（可选，但推荐以便远程登录）。
4. 将电源开关拨至 **ON**，开发板上电。
5. 观察电源指示灯亮起，系统开始启动。
6. 首次启动自动配置约 45 秒，之后进入桌面或控制台。

:::tip 默认账户
- 普通用户：用户名 `sunrise`，密码 `sunrise`
- 超级用户：用户名 `root`，密码 `root`
:::

## 相关文档

- [1.1 硬件介绍](/01_Quick_start/01_hardware_introduction/03_expansion_board)
- [1.3.1 系统烧录](./03_install_os_and_setup/01_instruction.md)
- [1.3.2 系统状态查询](./03_install_os_and_setup/system_status.md)
- [1.3.3 入门配置](./03_install_os_and_setup/configuration_wizard.md)
- [1.3.4 远程登录](./03_install_os_and_setup/remote_login.md)
- [2.1 网络配置](../02_System_configuration/01_network_config.md)
