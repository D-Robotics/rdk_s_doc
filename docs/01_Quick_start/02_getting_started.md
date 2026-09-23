---
sidebar_position: 2
title: "开始使用 RDK"
description: "RDK S100/S600 基础外设连接指南：电源、启动介质、键鼠、显示器、音频、网络、USB"
---

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

# 开始使用 RDK

本节介绍 RDK S100 与 RDK S600 开发者套件的基础外设连接与首次上电流程，涵盖电源、启动介质、键盘与鼠标、显示器、音频、网络及 USB 接口。完成后开发板可进入 Ubuntu 桌面（Desktop 版）或串口控制台（Server 版），并具备接入网络与远程登录的条件。

> 相机扩展板、MCU 接口扩展板等配件的安装见 [扩展板介绍](/01_Quick_start/01_hardware_introduction/03_expansion_board) 各板卡文档。网络深度配置见 [网络配置](../02_System_configuration/01_network_config.md)。烧录系统见 [系统烧录](./03_install_os_and_setup/01_instruction.md)。

**适用读者**：模式 1 用户——首次使用 RDK 开发者套件，需要完成基础外设连接与首次上电的开发者。

**与其他模块关系**：本节是 [系统烧录](./03_install_os_and_setup/01_instruction.md)、[入门配置](./03_install_os_and_setup/04_configuration_wizard.md) 与 [远程登录](./03_install_os_and_setup/05_remote_login.md) 的前置；各外设的完整配置见 [显示配置](../02_System_configuration/09_display_config.md)、[音频配置](../02_System_configuration/10_audio_output.md) 和 [网络配置](../02_System_configuration/01_network_config.md)。

## 前置条件

开始前请准备：

- [ ] 开发板与配套电源适配器（建议使用随附适配器：RDK S100 为 90W，RDK S600 额定输出 24V、最高 8A）
- [ ] 已了解手中板卡的接口布局：[RDK S100 硬件介绍](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit) 或 [RDK S600 硬件介绍](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit)
- [ ] Desktop 版：HDMI 显示器、HDMI 线、USB 键盘与鼠标（建议使用质量可靠、长度适中的 HDMI 线）
- [ ] Server 版：USB Type-C 数据线（调试串口）与 PC 端串口工具（串口登录见 [远程登录](03_install_os_and_setup/05_remote_login.md)）
- [ ] 有线网线（可选，推荐接入以便远程登录）

## 操作步骤

### 电源

RDK S100 与 RDK S600 均使用外接 DC 电源适配器供电，不支持通过 USB 口供电。请按下面的顺序完成连接，避免外设倒灌影响板卡启动。

1. 将配套电源适配器接到板卡的电源输入接口，并确认插头插紧。
2. 此时保持电源开关为 OFF，板卡尚未上电。
3. 如外设自带独立电源，务必等开发板上电后再给外设上电。

:::warning 警告
开发板需**先于**独立供电的外设上电。若外设先上电且对主板有电源倒灌，开发板可能触发保护状态而无法启动。

请勿在带电状态下插拔除 USB、HDMI 和网线之外的设备，以免损坏接口或外设。
:::

<DocScope products="RDK S100">

RDK S100 使用 DC 圆口（J1）供电：

- 电源输入：DC 12~20V，最大 150W；典型场景可用 12V@5.5A（70W）
- 随附适配器：90W 电源适配器
- 电源接口：内径 2.5mm、外径 6mm 的 DC 圆口
- 电源开关：**SW1**，拨至 ▽ 为 ON（上电），拨至 ↑ 为 OFF（断电）

</DocScope>

<DocScope products="RDK S600">

RDK S600 使用 4-pin 连接器（J1）供电：

- 电源输入：DC 12~28V，最大电流 16A
- 随附适配器：额定输出 24V、最高电流 8A
- 电源接口：4-pin Microfit Connector
- 电源开关：**SW3**，拨至 △ 为 ON（上电），拨至 OFF 为断电

</DocScope>

**预期结果**：把开关拨到 ON 后，电源指示灯常亮。RDK S100 为绿色 POWER 灯，RDK S600 为 D60 Power 灯。

**失败排查**：指示灯不亮时，依次检查电源开关是否拨到位、适配器插头是否插紧、供电插座是否正常。同时确认使用的是随附适配器，而不是 USB 线。

### 启动介质

RDK 出厂已预装系统镜像，可直接从板载存储启动，无需额外 SD 卡。启动介质由拨码开关选择，出厂已设为默认启动位，通常无需改动。

1. 上电前确认拨码开关处于默认启动位。
2. 若拨码曾被改动，按下方对应板卡的位定义拨回默认启动位。

<DocScope products="RDK S100">

RDK S100 从板载 **eMMC** 启动，启动盘由 **SW3** 拨码选择。**SW3** 中 D13=0、D12=1 为 eMMC 启动位，出厂即为此位。

当前 S100 仅支持 eMMC 启动，暂不支持 NVMe 启动。拨码位置见 [S100 硬件介绍](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#boot-device-selection-sw3)。

</DocScope>

<DocScope products="RDK S600">

RDK S600 从板载 **UFS** 启动，启动盘由 **SW8 BOOT** 拨码选择。拨码位设置为 1 代表 ON，设置为 0 代表 OFF。

| D12 | D13 | 启动介质 |
| --- | --- | --- |
| ON | ON | UFS（出厂默认） |
| OFF | OFF | UFS |
| OFF | ON | NVMe，需使用 NVMe 版本镜像 |

拨码位置见 [S600 硬件介绍](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#boot-sw8)。

</DocScope>

**预期结果**：上电后系统从板载存储引导，系统运行指示灯闪烁表示运行正常。RDK S100 为橙色 SYSTEM 灯，RDK S600 为 D59 System 灯。

**失败排查**：若串口停在 U-Boot 提示符或系统反复重启，先确认拨码是否在默认启动位，再检查电源是否满足规格。

### 键盘与鼠标

有线键鼠即插即用，蓝牙键鼠需要额外的模组与配对步骤。

- **有线键鼠**：直接插入开发板的 USB Type-A 接口，接口为 Host 模式，每口最大输出 5V/1A。
- **蓝牙键鼠**：需先安装 M.2 Key E 的 Wi-Fi 与 Bluetooth 模组，再完成配对，方法见 [蓝牙配置](../02_System_configuration/02_bluetooth_config.md)。

<DocScope products="RDK S100">

RDK S100 提供 4 个 USB 3.0 Type-A 接口（J19/J20）。

</DocScope>

<DocScope products="RDK S600">

RDK S600 提供 6 个 USB 3.2 Type-A 接口（J7/J8/J9）。

</DocScope>

**预期结果**：插入后键鼠指示灯亮，桌面环境下可移动光标并输入字符；执行 `lsusb` 能在输出中看到键鼠对应的 USB 设备。

```bash
lsusb
```

**失败排查**：键鼠无响应时，换一个 USB Type-A 口重试，并确认使用的是有线键鼠。蓝牙键鼠需先确认模组已安装，且 `bluetoothctl` 能扫描到设备。

### 显示器

用 HDMI 线连接板卡的 HDMI 接口与显示器，显示器输入源需切换到对应的 HDMI 口。

<DocScope products="RDK S100">

RDK S100 提供 1 个 HDMI Type-A 接口（J21），最高支持 **2560×1440@60Hz**。

</DocScope>

<DocScope products="RDK S600">

RDK S600 提供 1 个 HDMI 接口（J10），最高支持 2K 60 帧。

</DocScope>

**预期结果**：上电后显示器输出启动画面；Desktop 版进入 Ubuntu 桌面，Server 版在显示器上输出控制台信息。也可用内核 DRM 节点确认连接状态：

```bash
cat /sys/class/drm/card0-HDMI-A-1/status
```

预期输出为 `connected`；输出 `disconnected` 表示显示器未被识别。节点名随板卡与内核版本不同，可用 `ls /sys/class/drm/` 查找实际节点。

**失败排查**：无输出时先确认显示器输入源已切到对应 HDMI 口、HDMI 线两端插紧，再尝试更换 HDMI 线或换用 1920×1080 显示器。详见 [显示配置](../02_System_configuration/09_display_config.md)。

### 音频

音频可通过 HDMI 输出（使用显示器自带扬声器），也可通过板载音频接口接音频子板输出。输出设备选择与音量调节见 [音频配置](../02_System_configuration/10_audio_output.md)。

<DocScope products="RDK S100">

RDK S100 提供板载 I2S/PCM 音频接口，可接入 Audio Driver HAT REV2 音频子板。

</DocScope>

<DocScope products="RDK S600">

RDK S600 提供 PCM+I2C 接口（J19，14-Pin），用于接入音频子板，也可接入 USB 声卡。

</DocScope>

**预期结果**：接好音频设备后，`aplay -l` 能列出 `hw:0,0` 之类的回放设备。

```bash
aplay -l
```

:::info 说明
RDK S600 本板未接音频输出设备（无音频 codec/声卡），`aplay -l` 提示 `no soundcards found` 属正常现象。
:::

**失败排查**：无声时先用 `amixer set Master unmute` 取消静音并调高音量，再确认已选对输出设备；HDMI 音频需选择 HDMI sink。

### 网络

网络分为有线与无线两种接入方式。出厂系统默认使用 NetworkManager 管理网络，`eth1` 为管理口，`eth0` 为通用口。

#### 有线网络

1. 将以太网线插入开发板的 **RJ45** 接口，并确认网口指示灯亮起。
2. 按接口标识区分用途：`eth1` 为固定静态地址的管理口，`eth0` 为 DHCP 自动获取地址的通用口。

<DocScope products="RDK S100">

RDK S100 提供 2 个 1000M 以太网口（RJ45）：U43 为 `eth0`，U45 为 `eth1`。

</DocScope>

<DocScope products="RDK S600">

RDK S600 提供 2 个 1GbE 网口（U44，对应 `eth0`/`eth1`）、2 个 10GbE 网口（U45，对应 `eth2`/`eth3`），另有 1 个 MCU 域 1GbE 网口（U80）。

</DocScope>

**预期结果**：`eth1` 固定为静态地址 `192.168.127.10/24`，`eth0` 由 DHCP 分配地址。

```bash
ip addr show eth1
```

预期输出中 `inet` 行显示 `192.168.127.10/24`。上电后也可直接在显示器上查看地址，或通过串口、SSH 登录后执行 `ip addr` 查看。

**失败排查**：查不到地址时，用 `nmcli device show eth1` 查看连接状态，并尝试 `nmcli connection up eth1_cfg` 激活连接；仍无地址则更换网线或网口，详见 [网络配置](../02_System_configuration/01_network_config.md)。

#### 无线网络

Wi-Fi 需先安装 M.2 Key E 的 Wi-Fi 与 Bluetooth 模组，连接配置见 [网络配置](../02_System_configuration/01_network_config.md)。

**预期结果**：Desktop 版点击桌面右上角 Wi-Fi 图标，选择热点并输入密码即可连接；Server 版可先扫描热点：

```bash
sudo nmcli device wifi list
```

输出中能看到周围的热点列表。连接成功后执行 `ip addr show wlan0`，可查到路由器分配到的 IP 地址。

**失败排查**：扫描不到热点时，确认模组已安装并检查 `nmcli device` 中 `wlan0` 的状态；提示扫描过于频繁时稍等片刻再重试。

### USB 闪连

USB 接口按用途分为两类，接线前请先确认用途，避免插错接口。

- **存储设备**：USB Type-A 接口用于连接 U 盘、移动硬盘等存储设备。
- **烧录与调试**：USB Type-C 接口用于系统烧录和串口调试，仅支持 Device 模式，不作为常规 USB 数据口使用。烧录方法见 [系统烧录](./03_install_os_and_setup/01_instruction.md)。

<DocScope products="RDK S100">

RDK S100 的 USB Type-C 接口为 **J16**，内置 2 颗 CH340 芯片，分别对应 Main 域与 MCU 域的调试串口。

</DocScope>

<DocScope products="RDK S600">

RDK S600 的 USB Type-C 接口为 **J4**（闪连），内置 2 颗 CH340 芯片，分别对应 Main 域与 MCU 域的调试串口。

</DocScope>

**预期结果**：插入 U 盘后系统识别为存储设备，Desktop 版自动挂载并可在文件管理器中访问。用 Type-C 数据线连接 PC 后，PC 能识别出 Main 域与 MCU 域两个串口。

**失败排查**：U 盘不识别时，换一个 USB Type-A 口重试；NTFS 分区需安装 `ntfs-3g` 后才能读写。串口不识别时，确认使用带屏蔽层、支持数据传输的 Type-C 数据线，并在 PC 上安装 CH340 驱动。

## 首次启动

1. 接好电源适配器，先不拨电源开关。
2. 连接显示器（HDMI）、键盘、鼠标（Desktop 版），或连接 Type-C 数据线并打开 PC 串口终端（Server 版）。
3. 接入网线（可选，推荐接入以便远程登录）。
4. 将电源开关拨至 **ON**，开发板上电。
5. 观察电源指示灯常亮、系统运行指示灯闪烁。
6. 首次启动自动完成默认环境配置，约 45 秒后进入桌面或控制台。

:::tip 提示
系统预置两个默认账户，首次登录后请及时修改密码。

- 普通用户：用户名 `sunrise`，密码 `sunrise`
- 超级用户：用户名 `root`，密码 `root`
:::

## 验证结果

| 检查项 | 命令或观察点 | 成功判据 |
| --- | --- | --- |
| 供电正常 | 观察电源指示灯 | 常亮（RDK S100：POWER 绿灯；RDK S600：D60 Power 灯） |
| 系统运行 | 观察系统运行指示灯 | 闪烁（RDK S100：SYSTEM 橙灯；RDK S600：D59 System 灯） |
| 显示器识别 | `cat /sys/class/drm/card0-HDMI-A-1/status` | 输出 `connected` |
| 桌面或控制台 | 观察显示器输出 | Desktop 版显示 Ubuntu 桌面；Server 版串口出现登录提示 |
| 有线网络 | `ip addr show eth1` | `inet` 行显示 `192.168.127.10/24` |
| 键鼠可用 | 桌面移动光标并输入字符 | 光标可移动，字符可输入 |
| 音频（可选） | `aplay -l` | 接好音频设备后列出 `hw:0,0` 等设备 |

## 常见问题

### 上电后电源指示灯不亮

**原因**：适配器插头未插紧、电源开关未拨到 ON，或供电插座无输出。

**解决**：重新插紧适配器与 DC 插头，确认开关拨到 ON，并换用正常供电的插座复测；同时确认使用的是随附适配器。

### 上电后显示器无输出

**原因**：显示器输入源未切换、HDMI 线接触不良，或显示器分辨率与板卡输出不兼容。

**解决**：把显示器输入源切到对应 HDMI 口，重新插紧或更换 HDMI 线。仍无输出时换用 1920×1080 显示器复测，并确认 Desktop 版图形服务已启动。

### 开发板无法启动或反复重启

**原因**：供电不足、上电顺序错误（独立供电外设先于开发板上电造成倒灌），或启动介质拨码不在默认启动位。

**解决**：使用随附适配器供电，先给开发板上电再给独立供电外设上电，并把启动介质拨码拨回默认启动位。

### 系统启动停在 U-Boot 提示符

**原因**：上电瞬间调试串口收到非预期输入，打断了 U-Boot 的自动引导流程。

**解决**：在提示符下输入 `boot` 并回车尝试继续引导；或拔掉串口线后重新给开发板上电。

### 键盘与鼠标无响应

**原因**：USB 口接触不良，或使用蓝牙键鼠但未安装 Wi-Fi 与 Bluetooth 模组。

**解决**：换其他 USB Type-A 口重试；蓝牙键鼠需先安装 M.2 Key E 模组并完成配对，见 [蓝牙配置](../02_System_configuration/02_bluetooth_config.md)。

### 网口查不到 IP 地址

**原因**：网线或网口接触不良，或 NetworkManager 连接未激活。

**解决**：重新插紧网线或换一个网口，用 `nmcli device show eth1` 查看连接状态并激活连接，详见 [网络配置](../02_System_configuration/01_network_config.md)。

### 串口无输出或输出乱码

**原因**：串口参数不匹配，或使用的不是支持数据传输的 Type-C 线。

**解决**：把串口参数设为波特率 `921600`、数据位 8、无校验、停止位 1、无流控；更换支持数据传输的 Type-C 数据线，并确认 PC 已安装 CH340 驱动。

### U 盘插入后不识别

**原因**：USB 口接触或供电异常，或分区格式不被系统支持。

**解决**：换一个 USB Type-A 口重试；NTFS 分区的 U 盘需安装 `ntfs-3g` 后重新挂载。

## 相关文档

- [扩展板介绍](/01_Quick_start/01_hardware_introduction/03_expansion_board)
- [系统烧录](./03_install_os_and_setup/01_instruction.md)
- [系统状态查询](03_install_os_and_setup/03_system_status.md)
- [入门配置](03_install_os_and_setup/04_configuration_wizard.md)
- [远程登录](03_install_os_and_setup/05_remote_login.md)
- [网络配置](../02_System_configuration/01_network_config.md)
- [config.txt 配置指南](../02_System_configuration/05_config_txt/00_overview.md)
- [显示配置](../02_System_configuration/09_display_config.md)
- [音频配置](../02_System_configuration/10_audio_output.md)
- [蓝牙配置](../02_System_configuration/02_bluetooth_config.md)
- [调试串口](../02_System_configuration/16_debug_serial.md)
