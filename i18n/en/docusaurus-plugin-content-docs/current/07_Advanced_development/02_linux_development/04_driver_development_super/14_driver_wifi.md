---
sidebar_position: 14
---
# Wi-Fi Driver Debugging Guide
The Wi-Fi of the RDK S100 is connected to the M.2 interface expanded via PCIe. This chapter introduces some user-space commands and kernel DTS configuration items.

The examples in this chapter are based on the AW-XM612 module. Users should make corresponding modifications according to the specific module they are using.

## User-Space Debugging
### Identifying PCIe EP Devices
Use the user-space command `lspci` to check whether the Wi-Fi module is properly recognized.
```bash
# Check which EP nodes are present
root@ubuntu:~# lspci -vt
-+-[0000:01]---00.0-[02-07]----00.0-[03-07]--+-00.0-[04]----00.0  Anchor Chips Inc. Device bd31
 |                                           +-02.0-[05]----00.0  Realtek Semiconductor Co., Ltd. Device 5765
 |                                           +-06.0-[06]----00.0  ASMedia Technology Inc. Device 3042
 |                                           \-0e.0-[07]----00.0  ASMedia Technology Inc. Device 3042
 \-[0000:00]-

# Check specific node:
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
## Module Driver Code
The driver code for the AW-XM612 module is provided by the module manufacturer and integrated by Dijiang. The integrated code is located in the `source/kernel/drivers/net/wireless/broadcom/brcm80211/` directory.

## Module Kernel Configuration
The driver for the AW-XM612 module requires the following configurations:
```defconfig
CONFIG_CFG80211=m
CONFIG_BRCMFMAC=m
CONFIG_BRCMFMAC_PCIE=y
```

## Kernel DTS Configuration
PCIe-expanded Wi-Fi modules generally require the host side to control signals such as reset and reg_on of the module. On the S100, these configurations are defined in `source/hobot-drivers/kernel-dts/rdk-v0p5.dtsi`:
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
The PCIe driver of the S100 requests these GPIOs and performs operations such as de-asserting reset during initialization.