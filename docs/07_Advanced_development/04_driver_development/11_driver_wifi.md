---
sidebar_position: 11
title: "Wi-Fi 驱动调试指南"
description: "Wi-Fi 驱动调试指南"
---
# Wi-Fi 驱动调试指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK S100">

RDK S100 的 Wi-Fi 接在由 PCIe 拓展出来的 M.2 接口上。本章节会介绍部分用户层命令和内核 dts 配置项。

</DocScope>
<DocScope products="RDK S600">

RDK S600 的 Wi-Fi 接在由 PCIe 拓展出来的 M.2 接口上。本章节会介绍部分用户层命令和内核 dts 配置项。

</DocScope>

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要调试 Wi-Fi 模组驱动、内核 DTS 配置或排查模组识别异常的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 PCIe 与 Linux 无线驱动基础；已准备 Wi-Fi 模组（如 AW-XM612）。

**与其他模块关系**：本驱动依赖 PCIe 子系统（模组经 M.2/PCIe 接入），用户态配置见「[网络配置](/System_configuration/network_config)」，PCIe 侧见「[PCIe 使用指南](/Advanced_development/driver_development/driver_pcie)」。

本章节后续示例以 AW-XM612 模组为例，用户需要根据自己使用的具体模组进行对应的修改。

## 用户层调试
### 确认 PCIe ep 设备
可以通过用户层命令`lspci`来确认 Wi-Fi 模组是否正常被识别。
```bash
# 确认当前有哪些ep节点
root@ubuntu:~# lspci -vt
-+-[0000:01]---00.0-[02-07]----00.0-[03-07]--+-00.0-[04]----00.0  Anchor Chips Inc. Device bd31
 |                                           +-02.0-[05]----00.0  Realtek Semiconductor Co., Ltd. Device 5765
 |                                           +-06.0-[06]----00.0  ASMedia Technology Inc. Device 3042
 |                                           \-0e.0-[07]----00.0  ASMedia Technology Inc. Device 3042
 \-[0000:00]-

# 确认具体的节点：
root@ubuntu:~# lspci -v -s 04:00.0
04:00.0 Network controller: Anchor Chips Inc. Device bd31 (rev 02)
        Subsystem: Anchor Chips Inc. Device 0000
        Flags: bus master, fast devsel, latency 0, IRQ 181, IOMMU group 18
        Memory at 8000400000 (64-bit, non-prefetchable) [size=64K]
        Memory at 8000800000 (64-bit, non-prefetchable) [size=8M]
        Capabilities: [48] Power Management version 3
        Capabilities: [58] MSI: Enable+ Count=1/32 Maskable- 64bit+
        Capabilities: [68] Vendor Specific Information: Len=38 <?>
        Capabilities: [a0] MSI-X: Enable- Count=64 Masked-
        Capabilities: [ac] Express Endpoint, MSI 00
        Capabilities: [100] Advanced Error Reporting
        Capabilities: [13c] Device Serial Number 00-00-00-ff-ff-00-00-00
        Capabilities: [150] Power Budgeting <?>
        Capabilities: [160] Virtual Channel
        Capabilities: [1b0] Latency Tolerance Reporting
        Capabilities: [220] Physical Resizable BAR
        Capabilities: [240] L1 PM Substates
        Capabilities: [200] Precision Time Measurement
        Kernel driver in use: brcmfmac
        Kernel modules: brcmfmac
```
## 模组驱动代码
AW-XM612模组的驱动代码由模组厂提供，地瓜集成，集成的代码路径在：`source/kernel/drivers/net/wireless/broadcom/brcm80211/`文件夹内。

## 模组内核配置
AW-XM612模组的驱动需要使能以下配置：
```defconfig
CONFIG_CFG80211=m
CONFIG_BRCMFMAC=m
CONFIG_BRCMFMAC_PCIE=m
```

## 内核 DTS 配置

<DocScope products="RDK S100">

PCIe 拓展的 Wi-Fi 模组一般需要 Host 端对模组的 reset 信号/reg_on 等信号进行控制，在 S100 上，这部分配置被定义在了 `source/hobot-drivers/kernel-dts/rdk-v0p5.dtsi` 内：
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
S100的 PCIe 驱动会在初始化时，申请这些 GPIO 并作解复位等操作。

</DocScope>
<DocScope products="RDK S600">

PCIe 拓展的 Wi-Fi 模组一般需要 Host 端对模组的 reset 信号/reg_on 等信号进行控制，在 S600 上，这部分配置被定义在了 `source/hobot-drivers/kernel-dts/rdk-s600-mcb.dtsi` 内：
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
S600的 PCIe 驱动会在初始化时，申请这些 GPIO 并作解复位等操作。

</DocScope>

## 常见问题

### lspci 未显示 Wi-Fi 模组节点

**原因**：M.2 模组未插紧，或 PCIe ep 未正常枚举。

**解决**：重新插拔模组后 `lspci -vt` 确认 ep 节点出现；仍无则检查模组供电与复位 GPIO 配置。

### Wi-Fi 模组已识别但无法联网

**原因**：内核模块或 DTS 配置与具体模组不匹配（本文示例为 AW-XM612，其他模组需对应修改）。

**解决**：按「模组驱动代码」「内核 DTS 配置」核对并调整为所使用模组的配置。

## 相关文档

- [网络配置](/System_configuration/network_config)
- [PCIe 使用指南](/Advanced_development/driver_development/driver_pcie)
