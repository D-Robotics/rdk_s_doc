---
sidebar_position: 11
title: "Wi-Fi 驱动调试指南"
description: "Wi-Fi 模组驱动、内核配置与设备树，含接口确认与 PCIe 调试"
---

# Wi-Fi 驱动调试指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

Wi-Fi 模组接在由 PCIe 拓展出来的 M.2 接口上。本文介绍模组的驱动、内核配置与设备树，以及驱动侧的接口确认与 PCIe 调试方法。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）。适合调试 Wi-Fi 模组驱动、内核设备树配置，或排查模组识别异常的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 PCIe 与 Linux 无线驱动基础。

**与其他模块关系**：本文只涉及模组的驱动与设备树配置。联网（Station/Soft AP）的使用方法见「[网络配置](/System_configuration/network_config)」；PCIe 侧见「[PCIe 使用指南](/Advanced_development/driver_development/driver_pcie)」。

### 硬件资源

<DocScope products="RDK S100">

| 项目 | 内容 |
|---|---|
| 模组型号 | AW-XM612-plus |
| 芯片 | Broadcom BCM55560/2 |
| 驱动 | `brcmfmac`（模块） |
| 固件 | `/lib/firmware/cypress/cyfmac55572-pcie`（`.trxse` 主固件、`.txt` NVRAM、`.clm_blob` 管制矩阵） |
| 接口 | `wlan0` + P2P-device |

</DocScope>
<DocScope products="RDK S600">

| 项目 | 内容 |
|---|---|
| 模组型号 | AW-XB560NF |
| 芯片 | Realtek RTL8852CE |
| 驱动 | `rtl8852ce`（内建） |
| 固件 | 内嵌编译进驱动 |
| 接口 | `wlan0` + `wlan1`（双接口并发） |

</DocScope>

:::note
模组型号为当前批次配置，可能随出货批次变化。更换模组时需对应调整驱动与固件。
:::

## 驱动代码

<DocScope products="RDK S100">

S100 的 Wi-Fi 驱动为内核主线的 `brcmfmac`，配合模组厂商提供的固件使用：

```bash
source/kernel/drivers/net/wireless/broadcom/brcm80211/brcmfmac/    # brcmfmac 驱动源码
```

板端固件位于 `/lib/firmware/cypress/`，该目录是 `brcmfmac` 的固件库，含多个 Broadcom 芯片系列的固件文件。驱动按设备 ID 匹配对应前缀的文件，本模组使用 `cyfmac55572-pcie` 前缀的三个文件：

```bash
root@ubuntu:~# ls /lib/firmware/cypress/cyfmac55572-pcie.*
/lib/firmware/cypress/cyfmac55572-pcie.clm_blob
/lib/firmware/cypress/cyfmac55572-pcie.trxse
/lib/firmware/cypress/cyfmac55572-pcie.txt
```

三个文件的作用：

| 文件 | 作用 |
|---|---|
| `cyfmac55572-pcie.trxse` | 主固件，驱动下载到芯片执行的程序 |
| `cyfmac55572-pcie.txt` | NVRAM 板级参数，含 MAC 地址、板型、天线、发射功率等 `key=value` 配置 |
| `cyfmac55572-pcie.clm_blob` | 地区管制矩阵（CLM），各国家/地区的合法信道与功率上限 |

驱动加载固件时，优先尝试带板级后缀的文件（如 `cyfmac55572-pcie.drobot,s100-rdk.trxse`），缺失时回退到通用文件名。因此日志中出现 `Direct firmware load for cyfmac55572-pcie.drobot,s100-rdk.trxse failed` 属正常的回退过程。

:::note
`clm_blob` 缺失不影响基本联网，只是可用信道受限。`nvram.txt` 中的 `devid=0xbd31` 与 `lspci` 显示的设备 ID 一致，是固件与板型匹配的依据。
:::

</DocScope>
<DocScope products="RDK S600">

S600 的 Wi-Fi 驱动为 Realtek 厂商提供的 `rtl8852ce`，位于内核 staging 目录：

```bash
source/kernel/drivers/staging/rtl8852ce/    # RTL8852CE 驱动源码（厂商驱动）
```

该驱动编译进内核（`CONFIG_RTL8852CE=y`），在系统启动时加载。**固件内嵌编译进驱动**（`CONFIG_FILE_FWIMG=n`），无需 `/lib/firmware/` 下的外部固件文件。

:::note
SDK 中同时存在上游内核驱动 `rtw89_8852ce`（`drivers/net/wireless/realtek/rtw89`，编译为模块 `CONFIG_RTW89_8852CE=m`）。该模块虽被加载（`lsmod` 可见），但因 `rtl8852ce` 内建驱动已先绑定 PCI 设备，`rtw89_8852ce` 并未绑定任何设备（`lsmod` 中引用计数为 0）。

判断实际在用的驱动应以绑定关系为准，而非 `lsmod` 是否出现：

```bash
root@drobot:~# readlink /sys/class/net/wlan0/device/driver
../../../../../../../../../bus/pci/drivers/rtl8852ce
root@drobot:~# lspci -v -s 04:00.0 | grep "driver in use"
        Kernel driver in use: rtl8852ce
```

`lspci` 的 `Kernel modules:` 字段列出的是与该 PCI ID 匹配的所有可用模块（含 `rtw89_8852ce`），不代表实际在用。
:::

</DocScope>

### 内核配置

<DocScope products="RDK S100">

配置文件路径：`source/hobot-drivers/configs/drobot_s100_defconfig`

```bash
CONFIG_CFG80211=m            # 无线配置子系统
CONFIG_MAC80211=m            # 无线 MAC 子系统
CONFIG_BRCMFMAC=m            # Broadcom FullMAC 驱动
CONFIG_BRCMFMAC_PCIE=y       # brcmfmac 的 PCIe 总线支持
CONFIG_BRCMFMAC_USB=y        # brcmfmac 的 USB 总线支持
```

</DocScope>
<DocScope products="RDK S600">

配置文件路径：`source/hobot-drivers/configs/drobot_s600_defconfig`

```bash
CONFIG_CFG80211=m            # 无线配置子系统
CONFIG_MAC80211=m            # 无线 MAC 子系统
CONFIG_RTL8852CE=y           # Realtek RTL8852CE 厂商驱动（内建）
```

</DocScope>

## 设备树配置

PCIe 拓展的 Wi-Fi 模组需要 Host 端控制模组的 reset、reg_on 等信号，这部分在设备树中配置。PCIe 驱动在初始化时申请这些 GPIO 并作解复位等操作。

<DocScope products="RDK S100">

定义在 `source/hobot-drivers/kernel-dts/rdk-v0p5.dtsi`：

```dts
&hobot_pcie_rc0 {
	refclk-mode = <2>; /* 0:internal; 1:CC; 2:SRNS; 3:SRIS; */
	num-lanes = <2>;

	switch-perst-gpios = <&gpio_exp_27 14 GPIO_ACTIVE_LOW>;	/* SWITCH_PERSTB */

	ep-ponrst-gpios = <&gpio_exp_24 3 GPIO_ACTIVE_LOW>,	/* WIFI_REG_ON */
			<&gpio_exp_20 0 GPIO_ACTIVE_LOW>,	/* USBHUB1_PWRON */
			<&gpio_exp_20 7 GPIO_ACTIVE_LOW>;	/* USBHUB2_PWRON */

	ep-perst-gpios = <&gpio_exp_20 3 GPIO_ACTIVE_LOW>,	/* NVME_PERSTB */
			<&gpio_exp_24 2 GPIO_ACTIVE_LOW>,	/* WIFI_PERSTB */
			<&gpio_exp_27 15 GPIO_ACTIVE_LOW>,	/* USBHUB1_PERSTB */
			<&gpio_exp_20 5 GPIO_ACTIVE_LOW>;	/* USBHUB2_PERSTB */
};
```

Wi-Fi 相关的信号为 `WIFI_REG_ON`（`ep-ponrst` 首项）与 `WIFI_PERSTB`（`ep-perst` 第二项）。

</DocScope>
<DocScope products="RDK S600">

定义在 `source/hobot-drivers/kernel-dts/rdk-s600-mcb.dtsi`：

```dts
&hobot_pcie_rc0 {
        status = "okay";
        refclk-mode = <2>;      /* 1:CC; 2:SRNS; 3:SRIS; */

        max-link-speed = <4>;   /* pcie gen4 */
        num-lanes = <2>;        /* 2 lane */

        switch-perst-gpios = <&gpio_exp_27 14 GPIO_ACTIVE_LOW>;         /* asm2806 switch perst */

        ep-ponrst-gpios = <&gpio_exp_20 0 GPIO_ACTIVE_LOW>,             /* asm3042 hub 0 power on reset */
                        <&gpio_exp_20 7 GPIO_ACTIVE_LOW>,               /* asm3042 hub 1 power on reset */
                        <&gpio_exp_27 6 GPIO_ACTIVE_LOW>,               /* asm3042 hub 2 power on reset */
                        <&gpio_exp_24 3 GPIO_ACTIVE_LOW>;               /* m2.e wifi reg on reset */

        ep-perst-gpios = <&gpio_exp_27 15 GPIO_ACTIVE_LOW>,             /* asm3042 hub 0 perst */
                        <&gpio_exp_20 5 GPIO_ACTIVE_LOW>,               /* asm3042 hub 1 perst */
                        <&gpio_exp_20 4 GPIO_ACTIVE_LOW>,               /* asm3042 hub 2 perst */
                        <&gpio_exp_24 2 GPIO_ACTIVE_LOW>;               /* m2.e perst(wifi perst) */
};
```

Wi-Fi 相关的信号为 `m2.e wifi reg on reset`（`ep-ponrst` 末项）与 `m2.e perst`（`ep-perst` 末项）。

</DocScope>

## 功能使用

### Kernel 阶段

驱动加载后向内核注册无线接口，请求固件并初始化芯片。

<DocScope products="RDK S100">

`brcmfmac` 编译为模块，加载日志按「驱动注册 → 固件请求 → 固件回退 → 初始化完成」的顺序展开：

```bash
root@ubuntu:~# dmesg | grep brcmfmac
[    3.706964] usbcore: registered new interface driver brcmfmac
[    3.707196] brcmfmac 0000:04:00.0: enabling bus mastering
[    5.288738] brcmfmac: brcmf_fw_alloc_request: using cypress/cyfmac55572-pcie for chip BCM55560/2
[    5.288875] brcmfmac 0000:04:00.0: Direct firmware load for cypress/cyfmac55572-pcie.drobot,s100-rdk.trxse failed with error -2
[    5.291742] brcmfmac: brcmf_fw_request_firmware: no board-specific nvram available (ret=-2), device will use cypress/cyfmac55572-pcie.txt
[    5.292242] brcmfmac: brcmf_fw_request_firmware: no board-specific nvram available (ret=-2), device will use cypress/cyfmac55572-pcie.clm_blob
[    6.239669] brcmfmac: brcmf_c_preinit_dcmds: Firmware: BCM55560/2 wl0: Nov 15 2024 02:48:37 version 18.53.421.21 (5f285ce) FWID 01-94c1563b
[    9.408673] brcmfmac: brcmf_generic_offload_config: successfully set generic offload profile:1 feat:0x3ff
```

各阶段对应的日志标志：

| 阶段 | 日志标志 | 说明 |
|---|---|---|
| 驱动注册 | `usbcore: registered new interface driver brcmfmac` | brcmfmac 模块已注册 |
| PCIe 使能 | `enabling bus mastering` | PCIe 设备使能 |
| 固件请求 | `using cypress/cyfmac55572-pcie for chip BCM55560/2` | 按设备 ID 匹配固件前缀 |
| 板级回退 | `Direct firmware load for ...drobot,s100-rdk.trxse failed`、`no board-specific nvram available` | 板级固件缺失，回退到通用文件，属正常现象 |
| 初始化完成 | `Firmware: BCM55560/2 ... FWID 01-94c1563b` | 固件加载成功，芯片就绪 |

</DocScope>
<DocScope products="RDK S600">

`rtl8852ce` 编译进内核，固件内嵌，启动时自动加载。加载日志按「驱动初始化 → PCIe 使能 → 硬件抽象层初始化 → 固件使能」的顺序展开：

```bash
root@drobot:~# dmesg | grep -iE "8852|RTW:|PHL:"
[    0.394674] RTW: rtl8852ce v1.19.16.1-209-g42a776f89.20250731_Certified_Module_beta
[    3.698539] rtl8852ce 0000:04:00.0: enabling device (0000 -> 0002)
[    3.698560] rtl8852ce 0000:04:00.0: enabling bus mastering
[    3.699227] PHL: [BTC], hal_btc_init(): Init 8852C!!
[    3.712321] PHL: hal_cfg_fw_8852c : fw_en 1.
[    4.002669] RTW: retriveFromFile openFile path:/lib/firmware/rtl8852ce/efuse.map Fail, ret:-2
[    4.002677] PHL: rtw_hal_efuse_shadow_file_load:: /lib/firmware/rtl8852ce/efuse.map FAIL
[   11.164399] PHL: hal_cfg_fw_8852c : fw_en 1.
```

各阶段对应的日志标志：

| 阶段 | 日志标志 | 说明 |
|---|---|---|
| 驱动初始化 | `RTW: rtl8852ce v1.19.16.1-...` | 厂商驱动与版本 |
| PCIe 使能 | `enabling device`、`enabling bus mastering` | PCIe 设备使能 |
| PHL 初始化 | `PHL: [BTC], hal_btc_init(): Init 8852C!!` | 硬件抽象层初始化 |
| 固件使能 | `PHL: hal_cfg_fw_8852c : fw_en 1.` | 内嵌固件使能 |
| 可选 shadow | `efuse.map ... Fail, ret:-2` | 可选 shadow efuse 缺失，可忽略 |

`efuse.map` 是可选的 shadow efuse 覆盖文件，用于调试期覆盖芯片 efuse 配置。主固件内嵌于驱动，不依赖该文件。

:::note
上述 `grep` 关键字 `8852|RTW:|PHL:` 用于只保留厂商驱动日志。用 `rtl` 过滤会同时带出蓝牙（`Bluetooth: hci0: RTL`）与以太网 PHY（`RTL8211F`）等其他子系统的日志。固件内嵌，加载过程无独立的成功标志行，初始化完成的判据见下文「用户态使用」的接口确认。
:::

</DocScope>

### 用户态使用

#### 确认无线接口

驱动注册成功后出现 `wlan` 接口，可用 `ip link` 或 `iw dev` 查看。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# ip link show wlan0
4: wlan0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc pfifo_fast state DOWN mode DORMANT group default qlen 1000
    link/ether 28:d0:43:83:5a:d3 brd ff:ff:ff:ff:ff:ff
    altname wlp4s0
```

`iw dev` 可查看接口类型与信道。S100 除 `wlan0` 外还有一个 P2P-device 接口：

```bash
root@ubuntu:~# iw dev
phy#0
	Unnamed/non-netdev interface
		wdev 0x2
		addr 2a:d0:43:83:5a:d3
		type P2P-device
	Interface wlan0
		ifindex 4
		wdev 0x1
		addr 28:d0:43:83:5a:d3
		type managed
		channel 1 (2412 MHz), width: 20 MHz, center1: 2412 MHz
```

</DocScope>
<DocScope products="RDK S600">

S600 注册出 `wlan0` 与 `wlan1` 两个接口，支持双接口并发：

```bash
root@drobot:~# iw dev
phy#0
	Interface wlan1
		ifindex 6
		wdev 0x2
		addr ee:3a:56:69:cb:9c
		type managed
		channel 36 (5180 MHz), width: 20 MHz, center1: 5180 MHz
	Interface wlan0
		ifindex 5
		wdev 0x1
		addr ec:3a:56:69:cb:9c
		type managed
		channel 36 (5180 MHz), width: 20 MHz, center1: 5180 MHz
```

</DocScope>

#### 查看驱动与总线信息

`ethtool -i` 可同时确认驱动名、固件版本与 PCIe 总线位置：

<DocScope products="RDK S100">

```bash
root@ubuntu:~# ethtool -i wlan0
driver: brcmfmac
firmware-version: 01-94c1563b
bus-info: 0000:04:00.0
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# ethtool -i wlan0
driver: rtl8852ce
version: v1.19.16.1-209-g42a776f89.20250
firmware-version: N/A
bus-info: 0000:04:00.0
```

</DocScope>

#### 确认模块加载（仅模块化驱动）

<DocScope products="RDK S100">

`brcmfmac` 为模块，可用 `lsmod` 确认：

```bash
root@ubuntu:~# lsmod | grep -iE "brcmfmac|brcmutil|cfg80211"
brcmfmac              589824  0
brcmutil              262144  1 brcmfmac
cfg80211             1179648  1 brcmfmac
```

</DocScope>
<DocScope products="RDK S600">

`rtl8852ce` 编译进内核，不在 `lsmod` 中列出。确认方式见上文 `ethtool -i`。

</DocScope>

## 调试

### 确认 PCIe 设备

用 `lspci` 确认模组是否被 PCIe 枚举。模组不在线时整个节点不出现。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# lspci -vt
-+-[0000:01]---00.0-[02-07]----00.0-[03-07]--+-00.0-[04]----00.0  Anchor Chips Inc. Device bd31
 |                                           +-02.0-[05]--
 |                                           +-06.0-[06]----00.0  ASMedia Technology Inc. Device 3042
 |                                           \-0e.0-[07]----00.0  ASMedia Technology Inc. Device 3042
 \-[0000:00]-
```

`04:00.0` 的 `Anchor Chips Inc. Device bd31` 即 Wi-Fi 模组（`bd31` 对应 Broadcom CY55572 设备 ID）。`05:00.0` 为 NVMe 槽位，未插设备时为空。`06:00.0`、`07:00.0` 为两个 USB hub。

查看具体节点，确认驱动绑定：

```bash
root@ubuntu:~# lspci -v -s 04:00.0
04:00.0 Network controller: Anchor Chips Inc. Device bd31 (rev 02)
	Subsystem: Anchor Chips Inc. Device 0000
	Kernel driver in use: brcmfmac
	Kernel modules: brcmfmac
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# lspci -vt
-[0000:01]---00.0-[02-07]----00.0-[03-07]--+-00.0-[04]----00.0  Realtek Semiconductor Co., Ltd. RTL8852CE PCIe 802.11ax Wireless Network Controller
                                           +-02.0-[05]----00.0  ASMedia Technology Inc. ASM3042 USB 3.2 Gen 1 xHCI Controller
                                           +-06.0-[06]----00.0  ASMedia Technology Inc. ASM3042 USB 3.2 Gen 1 xHCI Controller
                                           \-0e.0-[07]----00.0  ASMedia Technology Inc. ASM3042 USB 3.2 Gen 1 xHCI Controller
-[0001:40]---00.0-[41]--
```

`04:00.0` 的 `Realtek ... RTL8852CE` 即 Wi-Fi 模组。`05:00.0`、`06:00.0`、`07:00.0` 为三个 USB hub。`[0001:40]` 为另一个 PCIe 端口，当前无设备。

查看具体节点，确认驱动绑定：

```bash
root@drobot:~# lspci -v -s 04:00.0
0000:04:00.0 Network controller: Realtek Semiconductor Co., Ltd. RTL8852CE PCIe 802.11ax Wireless Network Controller (rev 01)
	Subsystem: AzureWave Device 5600
	Kernel driver in use: rtl8852ce
	Kernel modules: rtw89_8852ce
```

`Subsystem: AzureWave Device 5600` 与模组型号 `AW-XB560NF` 对应。`Kernel driver in use` 为实际在用的厂商驱动 `rtl8852ce`；`Kernel modules` 列出的是与该 PCI ID 匹配的候选模块 `rtw89_8852ce`（上游驱动，未实际绑定，见「驱动代码」）。

</DocScope>

## 常见问题

### lspci 未显示 Wi-Fi 模组节点

**原因**：M.2 模组未插紧，或 PCIe ep 未正常枚举。

**解决**：重新插拔模组后 `lspci -vt` 确认 ep 节点出现；仍无则检查模组供电与设备树中 reset、reg_on 等 GPIO 配置。

### Wi-Fi 模组已识别但无 `wlan` 接口

**原因**：PCIe 枚举成功不等于接口已注册。可能是驱动未绑定、固件加载失败，或接口名不是 `wlan0`。

<DocScope products="RDK S100">

**解决**：按链路逐层排查：

1. **枚举**：`lspci -vt` 确认 `04:00.0` 节点存在（本模组为 `Anchor Chips bd31`）。
2. **绑定**：`lspci -v -s 04:00.0 | grep "driver in use"` 确认驱动已绑定（本模组为 `brcmfmac`）；为空则驱动未加载。
3. **固件**：`dmesg | grep -i brcm` 查看固件加载日志，确认固件请求成功。
4. **接口**：`ip link show` 查看全部接口，不要只查 `wlan0`。接口可能显示为 `wlp4s0` 等名称。

</DocScope>
<DocScope products="RDK S600">

**解决**：按链路逐层排查：

1. **枚举**：`lspci -vt` 确认 `04:00.0` 节点存在（本模组为 `Realtek RTL8852CE`）。
2. **绑定**：`lspci -v -s 04:00.0 | grep "driver in use"` 确认驱动已绑定（本模组为 `rtl8852ce`）；为空则驱动未加载。
3. **固件**：`dmesg | grep -iE "8852|RTW:|PHL:"` 查看日志，确认固件加载成功。
4. **接口**：`ip link show` 查看全部接口，不要只查 `wlan0`。接口可能显示为 `wlp4s0` 等名称。

</DocScope>

各层异常对应的处理：第 2 层失败按「内核配置」确认驱动配置；第 3 层失败按「驱动代码」确认固件文件；第 4 层若接口存在但名称不符，直接用实际名称操作即可。

### 识别到接口但无法联网

**原因**：联网配置未完成，或配置与当前模组不匹配。

**解决**：接口确认无误后，按「[网络配置](/System_configuration/network_config)」完成 Station 模式联网。

## 相关文档

- [网络配置](/System_configuration/network_config)：Wi-Fi 联网（Station/Soft AP）的用户层配置
- [PCIe 使用指南](/Advanced_development/driver_development/driver_pcie)
