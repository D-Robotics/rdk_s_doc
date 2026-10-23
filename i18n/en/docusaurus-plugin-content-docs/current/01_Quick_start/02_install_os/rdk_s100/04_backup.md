---
sidebar_position: 4
description: Describes how to back up the RDK S100 system image with XBurn and restore it, including backing up the full image, specific regions, and specific partitions, and restoring with the backup image.
---

# Back up and restore the image

This page describes how to back up the current RDK S100 system to an image, and restore it to the source board or copy it to a new board.

## Overview

Backing up saves the current system as an image. After backing up, flash the image to the target board to restore it. The target board can be the source board or a new board:

- **Restore to the source board**: Restore the system to the state it was in when it was backed up.
- **Copy to a new board**: Copy the system to another development board.

:::note
Backing up does not support batch operation. Back up one device at a time.
:::

## Prerequisites

### Source board preparation

Confirm that the source board boots normally and that ADB is enabled.

### XBurn version requirement

XBurn 1.2.2 or later is required. For installation, see [Install XBurn](https://developer.d-robotics.cc/xburn_doc/install).

### SDK version requirement

- On SDK 4.0.5 or later, start backing up directly.
- On SDK 4.0.5 or earlier, U-Boot does not support backing up partitions larger than 4 GB, so update it first.

Update U-Boot on the **source board** before backing up:

1. Obtain `uboot.img`:
   - **Option 1**: Apply the [patch](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/rdk_s/file/0001-fastboot-fetch-fix-RDKS100-1919-Support-fetching-par.patch) and compile to produce `uboot.img`.
   - **Option 2**: Download a prebuilt `uboot.img` — either [uboot-debug.img](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/rdk_s/file/uboot-debug.img) (includes debug messages) or [uboot-release.img](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/rdk_s/file/uboot-release.img) (for production).
2. Replace `uboot.img` in the `product` folder (`product` is the extracted folder downloaded in [Image download](./02_preparation.md#image-download)), overwriting:
   - `product/xmodem_tools/sec/out/s100/uboot.img`
   - `product/img_packages/uboot.img`
3. Flash to the `uboot` partition on the source board:
   - **Option 1**: In XBurn, select the `uboot` partition and flash.

     <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/en-s100-burn-uboot.png" alt="XBurn partition selection" style={{ width: '100%' }} />

   - **Option 2**: On the board, first enter Fastboot mode (after power-on, press and hold the spacebar to enter the U-Boot command line, then enter `fastboot 0`), then run:

     ```text
     fastboot oem interface:blk
     fastboot oem bootdevice:mmc
     fastboot flash uboot_a uboot.img
     fastboot flash uboot_b uboot.img
     ```

## Back up the full image

Back up the complete system image for restoring to the source board or copying to a new board.

1. Starting from the steps in [Flash the full image](./03_burn.md#flash-the-full-image), expand **Advanced configuration**, and select the `miniboot` regions and the `boot` and `system` partitions.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/en-s100-migration-back.png" alt="XBurn backup image configuration" style={{ width: '100%' }} />

   | Region/Partition | Description |
   | --- | --- |
   | `miniboot_flash` region | NOR Flash boot image |
   | `miniboot_emmc` region | eMMC basic boot image |
   | `boot`, `system`, and other partitions (as needed) | Partitions after U-Boot |

   :::note
   Do not select the `emmc` region, because `miniboot` already covers the boot image, and the rest is backed up by partition.
   :::

2. Wait for the backup to complete, then check the images under the `img_packages/` directory in the extracted `product` folder:

   | Path | Content | Naming rule |
   | --- | --- | --- |
   | `img_packages/disk/` | Region backup images | `[region]_backup.img` (such as `miniboot_flash_backup.img`, `miniboot_emmc_backup.img`) |
   | `img_packages/backup/` | Individual partition backup images | `[partition].img` (such as `boot.img`, `system.img`) |

   :::warning Do not interrupt the backup
   The backup takes a long time (a large partition such as a 45 GB `system` takes about 30 minutes or more). Wait patiently and do not interrupt the backup.
   :::

3. Rename the backup images, removing the `_backup` suffix from the filenames:

   | Original path | Path after rename | Naming rule |
   | --- | --- | --- |
   | `img_packages/disk/` | Unchanged | Remove `_backup`<br />- `miniboot_flash_backup.img` → `miniboot_flash.img`<br />- `miniboot_emmc_backup.img` → `miniboot_emmc.img` |
   | `img_packages/backup/` | `img_packages/` | Names unchanged (such as `boot.img`, `system.img`) |

4. Flash via [Flash specific regions](./03_burn.md#flashing-specific-regions) and [Flash specific partition images](./03_burn.md#flash-specific-partition-images), selecting the same regions and partitions as you backed up.

## Back up specific regions

Back up the image of specific regions to your PC. The supported backup regions are:

| Region | Actual storage medium | Firmware content | Backup image |
| --- | --- | -------- | ------------ |
| miniboot_flash | NOR Flash | Basic boot image on NOR Flash | img_packages/disk/miniboot_flash_backup.img |
| miniboot_emmc | eMMC | Basic boot image on eMMC | img_packages/disk/miniboot_emmc_backup.img |
| emmc | eMMC | Complete eMMC image | img_packages/disk/emmc_disk_backup.img |

1. Starting from the steps in [Flash the full image](./03_burn.md#flash-the-full-image), expand **Advanced configuration**, select **Back up specific regions**, and select the target regions (such as `miniboot_flash` and `miniboot_emmc`).

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/en-s100-back-region.png" alt="Back up specific regions" style={{ width: '100%' }} />

   :::note Backup takes time
   Data backup takes a long time. Wait patiently.
   :::

2. After the backup completes, open `img_packages/disk/` and check the backup image files (such as `miniboot_flash_backup.img` and `miniboot_emmc_backup.img`).

3. Rename the backup images, removing the `_backup` suffix from the filenames:

   | Region | Backup image | Renamed to |
   | --- | --- | --- |
   | miniboot_flash | `miniboot_flash_backup.img` | `miniboot_flash.img` |
   | miniboot_emmc | `miniboot_emmc_backup.img` | `miniboot_emmc.img` |
   | emmc | `emmc_disk_backup.img` | **`emmc_disk.simg`** |

   :::note
   The `emmc` region requires changing the extension from `.img` to `.simg`.
   :::

4. Flash via [Flash specific regions](./03_burn.md#flashing-specific-regions), selecting the same regions as you backed up.

## Back up specific partition images

Back up by **individual system component partition**, at a finer granularity than [Back up specific regions](#back-up-specific-regions). This is partition-level (a single component partition, such as `uboot`, `boot`, or `system`).

1. Starting from the steps in [Flash the full image](./03_burn.md#flash-the-full-image), expand **Advanced configuration**, select **Back up specific partition images**, select the target partitions, and complete the backup.

   The partition options that appear after selection are:

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/en-s100-back-partition.png" alt="Back up specific partition images" style={{ width: '100%' }} />

2. After the backup completes, the partition images are saved in `img_packages/backup/` (such as `boot.img` and `system.img`).

3. Before flashing, replace the partition images by overwriting the same-named files under `img_packages/` (such as `boot.img` and `system.img`).

4. Flash via [Flash specific partition images](./03_burn.md#flash-specific-partition-images), selecting the same partitions as you backed up.
