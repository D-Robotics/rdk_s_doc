---
sidebar_position: 2
title: "Flashing Steps"
description: "Steps for flashing the RDK S100/S600 system image with XBurn"
---

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

# Flashing Steps

<DocScope products="RDK S100">

:::info Note
This page is compiled from the official flashing documentation and has not been reproduced and verified on an S100 board (no S100 board is available, and flashing wipes the system); the S100 DIP switch and LED settings are to be cross-checked once the S100 board is back.
:::

This page describes system flashing for the RDK S100. Complete [Flashing preparation](./01_instruction.md) before flashing.

</DocScope>

<DocScope products="RDK S600">

:::info Note
This page is compiled from the official flashing documentation and has not been reproduced and verified on an S600 board (flashing would wipe the S600 system currently in use); the DIP switch and LED settings are subject to the actual board.
:::

This page describes system flashing for the RDK S600. Complete [Flashing preparation](./01_instruction.md) before flashing.

</DocScope>

## Overview

Flashing is the process of writing the RDK OS system image to the storage medium of the development board.

- **What to do**: Flash the downloaded system image to the storage medium of the development board with the XBurn tool.
- **Why**: The device ships with a test firmware preinstalled, and the latest image must be flashed again before it can be used normally.
- **What's next**: After power-on, the development board boots into the Ubuntu desktop, and you can follow [System status](03_system_status.md) to confirm the version and the board model.

## Prerequisites

Before you start flashing, make sure you have completed:

- [ ] [Flashing preparation](./01_instruction.md): downloaded the image, installed XBurn, connected the Type-C data cable, and completed the environment setup.
- [ ] Selected a download mode based on the device state (see [Download modes](#download-modes)).

<DocScope products="RDK S600">

- [ ] Set the SW8 BOOT DIP switch based on the target storage medium (see the boot disk selection in [Flash the full image](#flash-the-full-image)).

</DocScope>

## Download modes

| Download mode | Applicable scenario | Prerequisite |
| --- | -------- | -------- |
| DFU+Fastboot | Blank board, or the device is bricked due to system corruption | Set the DIP switches to put the device into DFU boot mode |
| Fastboot | Update the system on a non-blank board | Requires a non-blank board whose system can enter U-Boot |

<DocScope products="RDK S100">

Before flashing the system image to the RDK S100 with XBurn, select a download mode based on the device state, then enter that mode and run the flashing.

:::warning Prerequisite check
  Currently, set the [SW3 switch](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#boot-device-selection-sw3) to boot from onboard eMMC. Booting from an M.2 NVMe SSD is not supported yet.
:::

</DocScope>

<DocScope products="RDK S600">

To flash the system image to the RDK S600 with XBurn, select a download mode based on the device state, then enter that mode and run the flashing.

</DocScope>

### Enter DFU+Fastboot mode

<DocScope products="RDK S100">

1. Set the [SW1](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#switches-sw1sw2) DIP switch to ↑, and power off.
2. Set the [SW2](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#switches-sw1sw2) DIP switch to ↑ to enter Download mode.
3. Set the SW1 DIP switch to ▽, and power on.
4. Check the [DOWNLOAD indicator LED](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#download-red): a lit LED means the device is in DFU mode; if it does not light up, press [K1](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#buttons-k1k2) to reset the system and retry.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/board_dfu1.png" alt="Enter DFU mode" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK S600">

The currently sold version of the RDK S600 is V1P0. Enter DFU mode as follows:

**V1P0 version (current)**

1. Set the [SW3](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#switches-sw2sw3) DIP switch to `OFF`, and power off.
2. Set the [SW2](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#switches-sw2sw3) DIP switch to `ON` to enter DFU mode.
3. Set the SW3 DIP switch to `ON`, and power on.
4. Check the [D61 Flash LED](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#indicator-leds-d59d60d61): steady on means the device is in DFU mode.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-dfu-mode.png" alt="image-S600-dfu-mode" style={{ width: '100%' }} />

</DocScope>

### Enter Fastboot mode

<DocScope products="RDK S100">

1. Set the [SW1](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#switches-sw1sw2) DIP switch to ↑, and power off.
2. Set the [SW2](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#switches-sw1sw2) DIP switch to ↓ to enter normal boot mode.
3. Set the SW1 DIP switch to ▽, and power on.

</DocScope>

<DocScope products="RDK S600">

1. Set the [SW3](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#switches-sw2sw3) DIP switch to `OFF`, and power off.
2. Set the [SW2](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#switches-sw2sw3) DIP switch to `OFF` to enter normal boot mode.
3. Set the SW3 DIP switch to `ON`, and power on.

</DocScope>

- **Automatic entry**: After the board system finishes booting, the ADB service starts automatically. XBurn detects the ADB device and sends a command to put the board into Fastboot.
- **Manual entry**: Right after power-on, press and hold the spacebar to enter the U-Boot command line, and enter `fastboot 0` to enter Fastboot.

## Flash the full image

<DocScope products="RDK S100">

Use this for a first-time flash or system recovery. It flashes the complete system image package and overwrites `miniboot_flash` on the onboard eMMC and Norflash.

1. For **Product type**, select `RDK S100`.
2. For **Connection type**, select `USB`. For **Download mode**, select `DFU+Fastboot` or `Fastboot`.
3. For **Storage medium**, select `eMMC`. For **Firmware type**, select `secure`.
4. To the right of **Image directory**, click **Browse** and select the product folder that contains the firmware.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/full-image-flash.jpg" alt="" style={{ width: '100%' }} />

5. (Optional) To flash multiple devices at the same time, see the XBurn manual [Batch flashing](https://developer.d-robotics.cc/xburn_doc/basics/batch-burn) (software limit of 8 devices, recommended ≤4; the more devices, the higher the failure probability, and stability depends on hardware such as the cables, hub, and power supply; the software provides no guarantee). For batch flashing, it is recommended to turn off **Reboot automatically after flashing** below, so that one device rebooting after completion does not affect the other devices.

6. (Optional) Expand **Advanced configuration** and select **Reboot automatically after flashing**. After flashing completes, the device reboots automatically, saving you from manually powering off, exiting download mode, and powering on again. For details, see the XBurn manual [Auto-reboot and boot check after flashing](https://developer.d-robotics.cc/xburn_doc/basics/auto-reboot).

7. Click **Start upgrade**. The device powers on and flashing starts. Wait for the progress to complete.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-burn_progress.png" alt="" style={{ width: '100%' }} />

8. After the upgrade completes, exit the corresponding mode (for DFU mode, toggle the flashing switch down to exit), and power off.

9. Verify the boot. Keep the device powered off first, connect the device to a monitor with an HDMI cable, then power on the device. On first boot, the system performs default environment configuration for about 45 seconds, after which the Ubuntu desktop appears on the monitor.

   :::tip Device LED description
   - **✅ Green** LED: Lit means the hardware is powered on normally.
   :::

   If the device produces no display output for a long time after power-on (over 2 minutes), the boot is abnormal and you need to debug over a serial cable. For boot failure troubleshooting, see the XBurn manual [Boot issues](https://developer.d-robotics.cc/xburn_doc/troubleshooting/boot-issues).

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-boot.png" alt="S100 system boot desktop" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK S600">

Use this for a first-time flash or system recovery. It flashes the complete system image package. For **Storage medium**, select `UFS` (onboard) or `NVMe` (expansion) based on the actual setup.

:::warning Boot disk selection
The boot disk is determined by the [SW8 BOOT DIP switch](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#boot-sw8). **Before flashing**, set the SW8 DIP switch correctly according to the target storage medium, and keep the switch position unchanged after flashing:

- Boot from **UFS**: Set SW8 to the UFS boot position (`D12=ON, D13=ON` or `D12=OFF, D13=OFF`).
- Boot from **NVMe**: Set SW8 to the NVMe boot position (`D12=OFF, D13=ON`).

Flashing NVMe requires the NVMe version of the image. The image provided by D-Robotics by default targets UFS; the NVMe image must be compiled on your own (build config `RDK_DISK_MEDIUM="nvme"`). See [Build System Development Guide · eMMC/UFS/NVMe Image Build Notes](../../07_Advanced_development/06_environment_build/03_rdk_gen.md#emmcufsnvme-image-build-notes).
:::

1. For **Product type**, select `RDK S600`.
2. For **Connection type**, select `USB`. For **Download mode**, select `DFU+Fastboot` or `Fastboot`.
3. For **Storage medium**, select `UFS` or `NVMe`. For **Firmware type**, select `secure`.
4. To the right of **Image directory**, click **Browse** and select the product folder that contains the firmware.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s600-full-image-flash.jpg" alt="" style={{ width: '100%' }} />

5. (Optional) To flash multiple devices at the same time, see the XBurn manual [Batch flashing](https://developer.d-robotics.cc/xburn_doc/basics/batch-burn) (software limit of 8 devices, recommended ≤4; the more devices, the higher the failure probability, and stability depends on hardware such as the cables, hub, and power supply; the software provides no guarantee). For batch flashing, it is recommended to turn off **Reboot automatically after flashing** below, so that one device rebooting after completion does not affect the other devices.

6. (Optional) Expand **Advanced configuration** and select **Reboot automatically after flashing**. After flashing completes, the device reboots automatically, saving you from manually powering off, switching to normal boot mode, and powering on again. For details, see the XBurn manual [Auto-reboot and boot check after flashing](https://developer.d-robotics.cc/xburn_doc/basics/auto-reboot).

7. Click **Start upgrade**. The device powers on and flashing starts. Wait for the progress to complete.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-burn_progress.png" alt="" style={{ width: '100%' }} />

8. After the upgrade completes, power off.

9. Verify the boot. Keep the device powered off first, connect the device to a monitor with an HDMI cable, then power on the device. On first boot, the system performs default environment configuration for about 45 seconds, after which the Ubuntu desktop appears on the monitor.

   :::tip Device LED Description
   - **✅ Green** LED: Lit means the hardware is powered on normally.
   :::

   If the device produces no display output for a long time after power-on (over 2 minutes), the boot is abnormal and you need to debug over a serial cable. For boot failure troubleshooting, see the XBurn manual [Boot issues](https://developer.d-robotics.cc/xburn_doc/troubleshooting/boot-issues).

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-boot.png" alt="System booting into the Ubuntu desktop" style={{ width: '100%' }} />

</DocScope>

## Advanced usage

Use this for specific scenarios other than a first-time flash. In addition to flashing the full image, XBurn also supports **Flash specific regions**, **Back up specific regions**, and **Flash specific partition images**.

### Flash specific regions{#flash-specific-regions}

Flashing by specified region flashes only part of the image, instead of the complete full-image package.

<DocScope products="RDK S100">

For **Storage medium**, select `eMMC`. The supported regions are:

| Region | Actual storage medium | Firmware content | Image |
| --- | --- | -------- | ---- |
| miniboot_flash | Norflash | Basic boot image on Norflash, including images for system components such as HSM/MCU0 | img_packages/disk/miniboot_flash.img |
| miniboot_emmc | eMMC | Basic boot image on eMMC, including images for system components such as BL31/U-Boot | img_packages/disk/miniboot_emmc.img |
| emmc | eMMC | Complete eMMC image, already includes miniboot_emmc | img_packages/disk/emmc_disk.simg |

Based on the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Flash specific regions**, and select the target regions (such as `miniboot_flash` and `miniboot_emmc`). Complete the flashing and verify the boot.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/specify-region-flash.jpg" alt="" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK S600">

`miniboot_flash` is on Norflash and is independent of the selected medium; it can be selected for both UFS and NVMe. Other regions correspond to the selected medium per the "Actual storage medium" column.

| Region | Actual storage medium | Firmware content | Image |
| --- | --- | -------- | ---- |
| miniboot_flash | Norflash | Basic boot image on Norflash, including images for system components such as HSM/MCU0 | img_packages/disk/miniboot_flash.img |
| miniboot_ufs | UFS | Basic boot image on UFS, including images for system components such as BL31/U-Boot | img_packages/disk/miniboot_ufs.img |
| ufs | UFS | Complete UFS image, already includes miniboot_ufs | img_packages/disk/ufs_disk.simg |
| miniboot_nvme | NVMe | Basic boot image on NVMe, including images for system components such as BL31/U-Boot | img_packages/disk/miniboot_nvme.img |
| nvme | NVMe | Complete NVMe image, already includes miniboot_nvme | img_packages/disk/nvme_disk.simg |

Based on the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Flash specific regions**, and select the target regions (such as `miniboot_flash` and `miniboot_ufs`). Complete the flashing and verify the boot.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s600-specify-region-flash.jpg" alt="" style={{ width: '100%' }} />

</DocScope>

### Back up specific regions

Back up the image of specified regions to your PC.

<DocScope products="RDK S100">

For **Storage medium**, select `eMMC`. The supported backup regions are:

| Region | Actual storage medium | Firmware content | Backup image |
| --- | --- | -------- | ------------ |
| miniboot_flash | Norflash | Complete Norflash image | img_packages/disk/miniboot_flash_backup.img |
| emmc | eMMC | Complete eMMC image | img_packages/disk/emmc_disk_backup.img |

Based on the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Back up specific regions**, and select the target region (such as `miniboot_flash`). After flashing completes, open `img_packages/disk/` and check the backup image file `miniboot_flash_backup.img`.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/specify-region-backup.jpg" alt="" style={{ width: '100%' }} />

:::warning Note
- Data backup takes a long time. Please be patient.
- To use a backup image for flashing again, remove `_backup` from the filename to match the filename used for flashing specific regions (for example, `emmc_disk_backup.img` → `emmc_disk.simg`).
:::

</DocScope>

<DocScope products="RDK S600">

`miniboot_flash` is on Norflash and can be backed up for both UFS and NVMe. Other regions correspond to the selected medium per the "Actual storage medium" column.

| Region | Actual storage medium | Firmware content | Backup image |
| --- | --- | -------- | ------------ |
| miniboot_flash | Norflash | Complete Norflash image | img_packages/disk/miniboot_flash_backup.img |
| ufs | UFS | Complete UFS image | img_packages/disk/ufs_disk_backup.img |
| nvme | NVMe | Complete NVMe image | img_packages/disk/nvme_disk_backup.img |

Based on the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Back up specific regions**, and select the target region (such as `miniboot_flash`). After flashing completes, open `img_packages/disk/` and check the backup image file `miniboot_flash_backup.img`.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s600-specify-region-backup.jpg" alt="" style={{ width: '100%' }} />

:::warning Note
- Data backup takes a long time. Please be patient.
- To use a backup image for flashing again, remove `_backup` from the filename to match the filename used for flashing specific regions (for example, `ufs_disk_backup.img` → `ufs_disk.simg`).
:::

</DocScope>

### Flash specific partition images

Flashing by **individual system component partition**, at a finer granularity than [Flash specific regions](#flash-specific-regions). This is partition-level (a single component partition, such as `uboot`, `boot`, or `system`).

Based on the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Flash specific partition images**, and select the target partitions. Complete the flashing and verify the boot.

<DocScope products="RDK S100">

The partition options that appear after selection are:

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-specify-partition-flash.jpg" alt="" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK S600">

The partition options that appear after selection are:

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s600-specify-partition-flash.jpg" alt="" style={{ width: '100%' }} />

</DocScope>

## Verification

After flashing completes and the device boots, log in to the development board and confirm:

- ✅ Success criteria:
  - `cat /etc/version` outputs a version number (non-empty), and it matches the expected image version.
  - The `[Hardware Model]` from `rdkos_info` matches the board in your hands (RDK S100/S600).
- ❌ Common failures:
  - The version from `cat /etc/version` does not match expectations → the flashed image is wrong; flash again following [Flash the full image](#flash-the-full-image).
  - No display output for a long time after power-on → see the boot failure troubleshooting in [Flash the full image](#flash-the-full-image).

For detailed status query commands and sample outputs, see [System status](03_system_status.md).

## Related documents

- [Flashing preparation](./01_instruction.md)
- [System status](./03_system_status.md)
- [Remote login](./05_remote_login.md)

<DocScope products="RDK S100">

- [S100 hardware introduction](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit)

</DocScope>

<DocScope products="RDK S600">

- [S600 hardware introduction](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit)

</DocScope>
