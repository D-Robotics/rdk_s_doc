---
sidebar_position: 2
---

# Flash the system image

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">

This page describes system flashing for the RDK S100. Complete [flashing preparation](/Quick_start/install_os_and_setup/instruction) before you flash.

</DocScope>

<DocScope products="RDK-S600">

This page describes system flashing for the RDK S600. Complete [flashing preparation](/Quick_start/install_os_and_setup/instruction) before you flash.

</DocScope>

## Download modes

| Download mode | Scenario | Prerequisite |
| --- | -------- | -------- |
| DFU+Fastboot | Blank board or system corruption that bricks the device | Set the DIP switches to put the device into DFU boot mode |
| Fastboot | Update the system on a non-blank board | Requires a non-blank board whose system can enter U-Boot |

<DocScope products="RDK-S100">

Before you flash the system image to the RDK S100 with XBurn, select a download mode based on the device state, then enter that mode and start flashing.

:::warning Prerequisite check
Set the [SW3 switch](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#boot-device-selection-sw3) to boot from onboard eMMC. Booting from an M.2 NVMe SSD is not supported.
:::

</DocScope>

<DocScope products="RDK-S600">

Before you flash the system image to the RDK S600 with XBurn, select a download mode based on the device state, then enter that mode and start flashing.

</DocScope>

### Enter DFU+Fastboot mode

<DocScope products="RDK-S100">

1. Set the [SW1](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#switches-sw1sw2) DIP switch to ↑, and power off.
2. Set the [SW2](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#switches-sw1sw2) DIP switch to ↑ to enter Download mode.
3. Set the SW1 DIP switch to ▽, and power on.
4. Check the [DOWNLOAD indicator LED](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#download-red): a lit LED means the device is in DFU mode. If it does not light up, press [K1](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#buttons-k1k2) to reset the system and retry.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/board_dfu1-en.jpg" alt="Enter DFU mode" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK-S600">

The RDK S600 currently on sale is V1P0. Enter DFU mode as follows:

**V1P0 (current)**

1. Set the [SW3](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#switches-sw2sw3) DIP switch to `OFF`, and power off.
2. Set the [SW2](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#switches-sw2sw3) DIP switch to `ON` to enter DFU mode.
3. Set the SW3 DIP switch to `ON`, and power on.
4. Check the [D61 Flash LED](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#indicator-leds-d59d60d61): steady on means the device is in DFU mode.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-dfu-mode.png" alt="image-S600-dfu-mode" style={{ width: '100%' }} />

<details>
<summary>Historical versions (V0P1, V0P2) DFU entry</summary>

**V0P1**

1. Set the [SW3](/01_Quick_start/01_hardware_introduction/02_rdk_s600/versions/rdk_s600/v0p1#switches-sw2sw3) DIP switch to `OFF`, and power off.
2. Short the [SW2](/01_Quick_start/01_hardware_introduction/02_rdk_s600/versions/rdk_s600/v0p1#switches-sw2sw3) jumper cap to enter DFU mode.
3. Set the SW3 DIP switch to `ON`, and power on.
4. Check the [D61 Flash LED](/01_Quick_start/01_hardware_introduction/02_rdk_s600/versions/rdk_s600/v0p1#indicator-leds-d59d60d61): steady on means the device is in DFU mode.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-V0P1-en.png" alt="image-S600-V0P1" style={{ width: '100%' }} />

**V0P2**

1. Set the [SW3](/01_Quick_start/01_hardware_introduction/02_rdk_s600/versions/rdk_s600/v0p2#switches-sw2sw3) DIP switch to `OFF`, and power off.
2. Set the [SW2](/01_Quick_start/01_hardware_introduction/02_rdk_s600/versions/rdk_s600/v0p2#switches-sw2sw3) DIP switch to `ON` to enter DFU mode.
3. Set the SW3 DIP switch to `ON`, and power on.
4. Check the [D61 Flash LED](/01_Quick_start/01_hardware_introduction/02_rdk_s600/versions/rdk_s600/v0p2#indicator-leds-d59d60d61): steady on means the device is in DFU mode.

V0P2 DFU entry is the same as the V1P0 version above.

</details>

</DocScope>

### Enter Fastboot mode

<DocScope products="RDK-S100">

1. Set the [SW1](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#switches-sw1sw2) DIP switch to ↑, and power off.
2. Set the [SW2](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#switches-sw1sw2) DIP switch to ↓ to enter normal boot mode.
3. Set the SW1 DIP switch to ▽, and power on.

</DocScope>

<DocScope products="RDK-S600">

1. Set the [SW3](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#switches-sw2sw3) DIP switch to `OFF`, and power off.
2. Set the [SW2](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#switches-sw2sw3) DIP switch to `OFF` to enter normal boot mode.
3. Set the SW3 DIP switch to `ON`, and power on.

</DocScope>

- **Automatic entry**: After the board system finishes booting, the ADB service starts automatically. XBurn detects the ADB device and sends a command to put the board into Fastboot.
- **Manual entry**: Right after power-on, press and hold the spacebar to enter the U-Boot command line, then enter `fastboot 0` to enter Fastboot.

## Flash the full image

<DocScope products="RDK-S100">

Use this for a first-time flash or system recovery. It flashes the complete system image package and overwrites the onboard eMMC and `miniboot_flash` on Norflash.

1. For **Product type**, select `RDK S100`.
2. For **Connection type**, select `USB`. For **Download mode**, select `DFU+Fastboot` or `Fastboot`.
3. For **Storage**, select `eMMC`. For **Firmware type**, select `secure`.
4. To the right of **Image directory**, click **Browse** and select the product folder that contains the firmware.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-full-image-flash-en.png" alt="Full image flashing" style={{ width: '100%' }} />

5. (Optional) To flash multiple devices at once, see the XBurn Manual [Batch flashing](https://developer.d-robotics.cc/xburn_doc/basics/batch-burn) (software limit 8 devices, recommended ≤4; the more devices, the higher the failure rate, and stability depends on the cable, USB hub, power supply, and other hardware. The software provides no guarantee). For batch flashing, turn off **Reboot after flashing** so that one device rebooting does not affect the others.

6. (Optional) Expand **Advanced configuration** and select **Reboot after flashing**. After flashing, the device reboots automatically, so you do not need to power off, exit download mode, and power on again manually. For details, see the XBurn Manual [Auto-reboot and boot check after flashing](https://developer.d-robotics.cc/xburn_doc/basics/auto-reboot).

7. Click **Start flashing**. The device powers on and flashing starts. Wait for the progress to complete.

8. After flashing completes, exit the corresponding mode (for DFU mode, toggle the flashing switch down to exit), and power off.

9. Verify the boot. Keep the device powered off, connect the device to a monitor with an HDMI cable, then power on the device. On first boot, the system performs default environment configuration that takes about 45 seconds, after which the Ubuntu desktop appears on the monitor.

   :::tip LED indicators
   - **<font color='Green'>Green</font>** LED: Lit means the hardware is powered on normally.
   :::

   If the device produces no display output for a long time (over 2 minutes) after power-on, the boot failed and you need to debug over a serial cable. For boot failure troubleshooting, see the XBurn Manual [Boot issues](https://developer.d-robotics.cc/xburn_doc/troubleshooting/boot-issues).

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-boot.png" alt="S100 system boot desktop" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK-S600">

Use this for a first-time flash or system recovery. It flashes the complete system image package. For **Storage medium**, select `UFS` (onboard) or `NVMe` (expansion) based on your setup.

:::warning Boot disk selection
The boot disk is determined by the [SW8 BOOT DIP switch](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#boot-sw8). **Before flashing**, set the SW8 DIP switch correctly for the target storage medium, and keep the switch position unchanged after flashing:

- Boot from **UFS**: Set SW8 to the UFS boot position (`D12=ON, D13=ON` or `D12=OFF, D13=OFF`).
- Boot from **NVMe**: Set SW8 to the NVMe boot position (`D12=OFF, D13=ON`).

Flashing NVMe requires the NVMe version of the image. D-Robotics provides UFS images by default; the NVMe image must be compiled on your own (build config `RDK_DISK_MEDIUM="nvme"`). See [Build system development guide · eMMC/UFS/NVMe image build notes](/Advanced_development/environment_build/rdk_gen#emmcufsnvme-image-build-notes).
:::

1. For **Product type**, select `RDK S600`.
2. For **Connection type**, select `USB`. For **Download mode**, select `DFU+Fastboot` or `Fastboot`.
3. For **Storage**, select `UFS` or `NVMe`. For **Firmware type**, select `secure`.
4. To the right of **Image directory**, click **Browse** and select the product folder that contains the firmware.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/en-full-flash.png" alt="Full image flashing" style={{ width: '100%' }} />

5. (Optional) To flash multiple devices at once, see the XBurn Manual [Batch flashing](https://developer.d-robotics.cc/xburn_doc/basics/batch-burn) (software limit 8 devices, recommended ≤4; the more devices, the higher the failure rate, and stability depends on the cable, USB hub, power supply, and other hardware. The software provides no guarantee). For batch flashing, turn off **Reboot after flashing** so that one device rebooting does not affect the others.

6. (Optional) Expand **Advanced configuration** and select **Reboot after flashing**. After flashing, the device reboots automatically, so you do not need to power off, switch to normal boot mode, or power on again manually. For details, see the XBurn Manual [Auto-reboot and boot check after flashing](https://developer.d-robotics.cc/xburn_doc/basics/auto-reboot).

7. Click **Start flashing**. The device powers on and flashing starts. Wait for the progress to complete.

8. After the flashing completes, power off.

9. Verify the boot. Keep the device powered off, connect the device to a monitor with an HDMI cable, then power on the device. On first boot, the system performs default environment configuration that takes about 45 seconds, after which the Ubuntu desktop appears on the monitor.

   :::tip LED indicators
   - **<font color='Green'>Green</font>** LED: Lit means the hardware is powered on normally.
   :::

   If the device produces no display output for a long time (over 2 minutes) after power-on, the boot failed and you need to debug over a serial cable. For boot failure troubleshooting, see the XBurn Manual [Boot issues](https://developer.d-robotics.cc/xburn_doc/troubleshooting/boot-issues).

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-boot.png" alt="image-desktop_display.jpg" style={{ width: '100%' }} />

</DocScope>

## Advanced usage

Use this for specific scenarios other than a first-time flash. In addition to flashing the full image, XBurn supports **Flash specific regions**, **Back up specific regions**, and **Flash specific partition images**.

### Flash specific regions{#flashing-specific-regions}

Flash only part of the image by region, instead of the complete full-image package.

<DocScope products="RDK-S100">

For **Storage medium**, select `eMMC`. The supported regions are:

| Region | Actual storage medium | Firmware content | Image |
| --- | --- | -------- | ---- |
| miniboot_flash | Norflash | Basic boot image on Norflash, including images for HSM/MCU0 and other system components | img_packages/disk/miniboot_flash.img |
| miniboot_emmc | eMMC | Basic boot image on eMMC, including images for BL31/U-Boot and other system components | img_packages/disk/miniboot_emmc.img |
| emmc | eMMC | Complete eMMC image, already includes miniboot_emmc | img_packages/disk/emmc_disk.simg |

Starting from the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Flash specific regions**, and select the target regions (such as `miniboot_flash` and `miniboot_emmc`). Complete the flash and verify the boot.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/specify-region-flash-en.png" alt="Flash specific regions" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK-S600">

`miniboot_flash` is on Norflash and is independent of the selected medium; both UFS and NVMe can select it. Other regions correspond to the selected medium per the "Actual storage medium" column.

| Region | Actual storage medium | Firmware content | Image |
| --- | --- | -------- | ---- |
| miniboot_flash | Norflash | Basic boot image on Norflash, including images for HSM/MCU0 and other system components | img_packages/disk/miniboot_flash.img |
| miniboot_ufs | UFS | Basic boot image on UFS, including images for BL31/U-Boot and other system components | img_packages/disk/miniboot_ufs.img |
| ufs | UFS | Complete UFS image, already includes miniboot_ufs | img_packages/disk/ufs_disk.simg |
| miniboot_nvme | NVMe | Basic boot image on NVMe, including images for BL31/U-Boot and other system components | img_packages/disk/miniboot_nvme.img |
| nvme | NVMe | Complete NVMe image, already includes miniboot_nvme | img_packages/disk/nvme_disk.simg |

Starting from the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Flash specific regions**, and select the target regions (such as `miniboot_flash` and `miniboot_ufs`). Complete the flash and verify the boot.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/en-region-flash.png" alt="Flash specific regions" style={{ width: '100%' }} />

</DocScope>

### Back up specific regions

Back up the image of specific regions to your PC.

<DocScope products="RDK-S100">

For **Storage**, select `eMMC`. The supported backup regions are:

| Region | Actual storage medium | Firmware content | Backup image |
| --- | --- | -------- | ------------ |
| miniboot_flash | Norflash | Complete Norflash image | img_packages/disk/miniboot_flash_backup.img |
| emmc | eMMC | Complete eMMC image | img_packages/disk/emmc_disk_backup.img |

Starting from the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Back up specific regions**, and select the target region (such as `miniboot_flash`). After flashing, open `img_packages/disk/` and check the backup image file `miniboot_flash_backup.img`.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/backup-region-flash-en.png" alt="Back up specific regions" style={{ width: '100%' }} />

:::warning Note
- Data backup takes a long time. Wait patiently.
- To flash a backup image, remove `_backup` from the filename and change it to the same filename used for flashing a specific region (for example, `emmc_disk_backup.img` → `emmc_disk.simg`).
:::

</DocScope>

<DocScope products="RDK-S600">

`miniboot_flash` is on Norflash; both UFS and NVMe can back it up. Other regions correspond to the selected medium per the "Actual storage medium" column.

| Region | Actual storage medium | Firmware content | Backup image |
| --- | --- | -------- | ------------ |
| miniboot_flash | Norflash | Complete Norflash image | img_packages/disk/miniboot_flash_backup.img |
| ufs | UFS | Complete UFS image | img_packages/disk/ufs_disk_backup.img |
| nvme | NVMe | Complete NVMe image | img_packages/disk/nvme_disk_backup.img |

Starting from the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Back up specific regions**, and select the target region (such as `miniboot_flash`). After flashing, open `img_packages/disk/` and check the backup image file `miniboot_flash_backup.img`.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/en-backup.png" alt="Back up specific regions" style={{ width: '100%' }} />

:::warning Note
- Data backup takes a long time. Wait patiently.
- To flash a backup image, remove `_backup` from the filename and change it to the same filename used for flashing a specific region (for example, `ufs_disk_backup.img` → `ufs_disk.simg`).
:::

</DocScope>

### Flash specific partition images

Flash by **individual system component partition**, at a finer granularity than [Flash specific regions](#flashing-specific-regions). This is partition-level (a single component partition, such as `uboot`, `boot`, or `system`).

Starting from the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Flash specific partition images**, and select the target partitions. Complete the flash and verify the boot.

<DocScope products="RDK-S100">

   The partition options that appear after selection are:

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/en-partition.png" alt="Flash specific partition images" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK-S600">

   The partition options that appear after selection are:

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/en-s600-partition.png" alt="Flash specific partition images" style={{ width: '100%' }} />

</DocScope>

## Related documents

- [Flashing preparation](/Quick_start/install_os_and_setup/instruction)
- [System status](/Quick_start/install_os_and_setup/system_status)
- [Remote login](/Quick_start/install_os_and_setup/remote_login)

<DocScope products="RDK-S100">

- [S100 hardware introduction](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit)

</DocScope>

<DocScope products="RDK-S600">

- [S600 hardware introduction](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit)

</DocScope>
