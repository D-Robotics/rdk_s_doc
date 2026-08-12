---
sidebar_position: 2
---

# Flash the system image

This page describes system flashing for the RDK S100. Complete [flashing preparation](../01_instruction.md) before you flash.

## Download modes

Before you flash the system image to the RDK S100 with XBurn, select a download mode based on the device state, then enter that mode and start flashing.

| Download mode | Scenario | Prerequisite |
| --- | -------- | -------- |
| DFU+Fastboot | Blank board or system corruption that bricks the device | Set the DIP switches to put the device into DFU boot mode |
| Fastboot | Update the system on a non-blank board | Requires a non-blank board whose system can enter U-Boot |

:::warning Prerequisite check
Set the [SW3 switch](../../../01_hardware_introduction/01_rdk_s100.md#boot-device-selection-sw3) to boot from onboard eMMC. Booting from an M.2 NVMe SSD is not supported.
:::

### Enter DFU+Fastboot mode

1. Set the [SW1](../../../01_hardware_introduction/01_rdk_s100.md#switches-sw1sw2) DIP switch to ↑, and power off.
2. Set the [SW2](../../../01_hardware_introduction/01_rdk_s100.md#switches-sw1sw2) DIP switch to ↑ to enter Download mode.
3. Set the SW1 DIP switch to ▽, and power on.
4. Check the [DOWNLOAD indicator LED](../../../01_hardware_introduction/01_rdk_s100.md#download-red): a lit LED means the device is in DFU mode. If it does not light up, press [K1](../../../01_hardware_introduction/01_rdk_s100.md#buttons-k1k2) to reset the system and retry.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/board_dfu1-en.jpg" alt="Enter DFU mode" style={{ width: '100%' }} />

### Enter Fastboot mode

1. Set the [SW1](../../../01_hardware_introduction/01_rdk_s100.md#switches-sw1sw2) DIP switch to ↑, and power off.
2. Set the [SW2](../../../01_hardware_introduction/01_rdk_s100.md#switches-sw1sw2) DIP switch to ↓ to enter normal boot mode.
3. Set the SW1 DIP switch to ▽, and power on.

- **Automatic entry**: After the board system finishes booting, the ADB service starts automatically. XBurn detects the ADB device and sends a command to put the board into Fastboot.
- **Manual entry**: Right after power-on, press and hold the spacebar to enter the U-Boot command line, then enter `fastboot 0` to enter Fastboot.

## Flash the full image

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

## Advanced usage

Use this for specific scenarios other than a first-time flash.

### Flash specific regions{#flashing-specific-regions}

Flash only part of the image by region, instead of the complete full-image package. For **Storage medium**, select `eMMC`. The supported regions are:

| Region | Actual storage medium | Firmware content | Image |
| --- | --- | -------- | ---- |
| miniboot_flash | Norflash | Basic boot image on Norflash, including images for HSM/MCU0 and other system components | img_packages/disk/miniboot_flash.img |
| miniboot_emmc | eMMC | Basic boot image on eMMC, including images for BL31/U-Boot and other system components | img_packages/disk/miniboot_emmc.img |
| emmc | eMMC | Complete eMMC image, already includes miniboot_emmc | img_packages/disk/emmc_disk.simg |

Starting from the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Flash specific regions**, and select the target regions (such as `miniboot_flash` and `miniboot_emmc`). Complete the flash and verify the boot.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/specify-region-flash-en.png" alt="Flash specific regions" style={{ width: '100%' }} />

### Back up specific regions

Back up the image of specific regions to your PC. For **Storage**, select `eMMC`. The supported backup regions are:

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

### Flash specific partition images

Flash by **individual system component partition**, at a finer granularity than [Flash specific regions](#flashing-specific-regions). This is partition-level (a single component partition, such as `uboot`, `boot`, or `system`).

Starting from the steps in [Flash the full image](#flash-the-full-image), expand **Advanced configuration**, select **Flash specific partition images**, and select the target partitions. Complete the flash and verify the boot.

   The partition options that appear after selection are:

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/en-partition.png" alt="Flash specific partition images" style={{ width: '100%' }} />