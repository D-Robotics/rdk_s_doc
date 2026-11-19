---
sidebar_position: 3
description: Describes how to flash the RDK S100 system image with XBurn, including selecting a download mode, flashing the full image, and flashing specific regions or partitions.
---

# Flash the system image

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This page describes system flashing for the RDK S100. Complete [flashing preparation](./02_preparation.md) before you flash. To back up the current system and restore it, see [Back up and restore the image](./04_backup.md). To flash without a PC, for example in batch or on site, see [USB drive upgrade](./05_usb_upgrade.md).

## Download modes

Before you flash the system image to the RDK S100 with XBurn, select a download mode based on the device state, then enter that mode and start flashing.

| Download mode | Scenario | Prerequisite |
| --- | -------- | -------- |
| DFU+Fastboot | Blank board or system corruption that bricks the device | Set the DIP switches to put the device into DFU boot mode |
| Fastboot | Update the system on a non-blank board | Requires a non-blank board whose system can enter U-Boot |

<DocScope versions=">= 4.1.0">

:::warning Boot disk selection
The boot disk is determined by the [SW3 switch](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#boot-device-selection-sw3). Set SW3 for the medium you want to boot from. The flashing steps use only SW1 (power) and SW2 (DOWNLOAD) and do not involve SW3. If you flash in Fastboot mode, the device must be able to enter U-Boot from the current boot disk; if the boot disk is not usable, use DFU+Fastboot instead.

- Boot from **eMMC**: `D13=0, D12=1`.
- Boot from **NVMe**: `D13=1, D12=0`.

Flashing NVMe requires the NVMe version of the image. D-Robotics provides eMMC images by default, so build the NVMe image yourself (build config `RDK_DISK_MEDIUM="nvme"`); see [Build system development guide · eMMC/UFS/NVMe image build notes](../../../07_Advanced_development/06_rdk_gen.md#emmcufsnvme-image-build-notes). The hardware version requirement for NVMe boot (V0P6 and later) and the `miniboot_flash` mode constraint are described in "NVMe Boot Notes" at the end of the same section. Flashing an NVMe image requires XBurn 1.1.10 or later.
:::

</DocScope>

<DocScope versions="4.0.5">

:::warning Prerequisite check
Set the [SW3 switch](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#boot-device-selection-sw3) to boot from onboard eMMC. Booting from an M.2 NVMe SSD is not supported.
:::

</DocScope>

### Enter DFU+Fastboot mode

1. Set the [SW1](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#switches-sw1sw2) DIP switch to ↑, and power off.
2. Set the [SW2](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#switches-sw1sw2) DIP switch to ↑ to enter Download mode.
3. Set the SW1 DIP switch to ▽, and power on.
4. Check the [DOWNLOAD indicator LED](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#download-red): a lit LED means the device is in DFU mode. If it does not light up, press [K1](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#buttons-k1k2) to reset the system and retry.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/board_dfu1-en.jpg" alt="Enter DFU mode" style={{ width: '100%' }} />

### Enter Fastboot mode

1. Set the [SW1](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#switches-sw1sw2) DIP switch to ↑, and power off.
2. Set the [SW2](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#switches-sw1sw2) DIP switch to ↓ to enter normal boot mode.
3. Set the SW1 DIP switch to ▽, and power on.

- **Automatic entry**: After the board system finishes booting, the ADB service starts automatically. XBurn detects the ADB device and sends a command to put the board into Fastboot.
- **Manual entry**: Right after power-on, press and hold the spacebar to enter the U-Boot command line, then enter `fastboot 0` to enter Fastboot.

## Flash the full image

Use this for a first-time flash or system recovery. It flashes the complete system image package and overwrites the <DocScope versions=">= 4.1.0">selected storage medium</DocScope><DocScope versions="4.0.5">onboard eMMC</DocScope> and `miniboot_flash` on NOR Flash.<DocScope versions=">= 4.1.0"> For **Storage medium**, select `eMMC` (onboard) or `NVMe` (M.2 expansion) based on your setup.</DocScope>

1. For **Product type**, select `RDK S100`.
2. For **Connection type**, select `USB`. For **Download mode**, select `DFU+Fastboot` or `Fastboot`.
3. For **Storage**, select <DocScope versions=">= 4.1.0">`eMMC` or `NVMe`</DocScope><DocScope versions="4.0.5">`eMMC`</DocScope>. For **Firmware type**, select `secure`.
4. To the right of **Image directory**, click **Browse** and select the product folder that contains the firmware.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-full-image-flash-en.png" alt="Full image flashing" style={{ width: '100%' }} />

5. (Optional) To flash multiple devices at once, see the XBurn Manual [Batch flashing](https://developer.d-robotics.cc/xburn_doc/basics/batch-burn) (software limit 8 devices, recommended ≤4; the more devices, the higher the failure rate, and stability depends on the cable, USB hub, power supply, and other hardware. The software provides no guarantee). For batch flashing, turn off **Reboot after flashing** so that one device rebooting does not affect the others.

6. (Optional) Expand **Advanced configuration** and select **Reboot after flashing**. After flashing, the device reboots automatically, so you do not need to power off, exit download mode, and power on again manually. For details, see the XBurn Manual [Auto-reboot and boot check after flashing](https://developer.d-robotics.cc/xburn_doc/basics/auto-reboot).

7. Click **Start Burn**. The device powers on and flashing starts. Wait for the progress to complete.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S100-xburn-burn_progress-en.png" alt="Burning progress" style={{ width: '100%' }} />

8. After flashing completes, exit the corresponding mode (for DFU mode, toggle the flashing switch down to exit), and power off.
9. Verify the boot. Keep the device powered off, connect the device to a monitor with an HDMI cable, then power on the device. On first boot, the system performs default environment configuration that takes about 45 seconds, after which the Ubuntu desktop appears on the monitor.

   :::note LED indicators
   - **<font color='Green'>Green</font>** LED: Lit means the hardware is powered on normally.
   :::

   If the device produces no display output for a long time (over 2 minutes) after power-on, the boot failed and you need to debug over a serial cable. For boot failure troubleshooting, see the XBurn Manual [Boot issues](https://developer.d-robotics.cc/xburn_doc/troubleshooting/boot-issues).

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-boot.png" alt="S100 system boot desktop" style={{ width: '100%' }} />

## Flash specific regions{#flashing-specific-regions}

<DocScope versions=">= 4.1.0">

Flash only part of the image by region, instead of the complete full-image package. For **Storage medium**, select `eMMC` or `NVMe`. `miniboot_flash` is on NOR Flash and is independent of the selected medium; both eMMC and NVMe can select it. Other regions correspond to the selected medium per the "Actual storage medium" column. The supported regions are:

| Region | Actual storage medium | Firmware content | Image |
| --- | --- | -------- | ---- |
| miniboot_flash | NOR Flash | Basic boot image on NOR Flash, including images for HSM/MCU0 and other system components | img_packages/disk/miniboot_flash.img |
| miniboot_emmc | eMMC | Basic boot image on eMMC, including images for BL31/U-Boot and other system components | img_packages/disk/miniboot_emmc.img |
| emmc | eMMC | Complete eMMC image, already includes miniboot_emmc | img_packages/disk/emmc_disk.simg |
| miniboot_nvme | NVMe | Basic boot image on NVMe, including images for BL31/U-Boot and other system components | img_packages/disk/miniboot_nvme.img |
| nvme | NVMe | Complete NVMe image, already includes miniboot_nvme | img_packages/disk/nvme_disk.simg |

</DocScope>

<DocScope versions="4.0.5">

Flash only part of the image by region, instead of the complete full-image package. For **Storage medium**, select `eMMC`. The supported regions are:

| Region | Actual storage medium | Firmware content | Image |
| --- | --- | -------- | ---- |
| miniboot_flash | NOR Flash | Basic boot image on NOR Flash, including images for HSM/MCU0 and other system components | img_packages/disk/miniboot_flash.img |
| miniboot_emmc | eMMC | Basic boot image on eMMC, including images for BL31/U-Boot and other system components | img_packages/disk/miniboot_emmc.img |
| emmc | eMMC | Complete eMMC image, already includes miniboot_emmc | img_packages/disk/emmc_disk.simg |

</DocScope>

Starting from the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Flash specific regions**, and select the target regions (such as `miniboot_flash` and `miniboot_emmc`<DocScope versions=">= 4.1.0">; for NVMe media, `miniboot_flash` and `miniboot_nvme`</DocScope>). Complete the flash and verify the boot.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/specify-region-flash-en.png" alt="Flash specific regions" style={{ width: '100%' }} />

## Flash specific partition images

Flash by **individual system component partition**, at a finer granularity than [Flash specific regions](#flashing-specific-regions). This is partition-level (a single component partition, such as `uboot`, `boot`, or `system`).

Starting from the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Flash specific partition images**, and select the target partitions. Complete the flash and verify the boot.

   The partition options that appear after selection are:

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/en-partition.png" alt="Flash specific partition images" style={{ width: '100%' }} />