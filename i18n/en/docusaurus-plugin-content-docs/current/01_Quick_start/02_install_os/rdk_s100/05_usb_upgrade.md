---
sidebar_position: 5
sidebar_versions: ">= 4.1.0"
sidebar_products: RDK S100
description: Create a U disk upgrade image; U-Boot flashes the system automatically after power-on
---

# U disk upgrade

## Overview

The U disk upgrade writes the system image to a U disk. On power-on, U-Boot reads the U disk, flashes the image to the onboard eMMC, and the board reboots into the new system.

Prepare the U disk once. After that, the same U disk can be reused, and flashing on the board needs no PC and no XBurn. It suits production-line batch flashing and on-site recovery.

The U disk upgrade uses `img_packages/disk/emmc_disk.simg`, the same image that XBurn uses when flashing the `emmc` region. Only the transport changes from a PC to a U disk.

| Method | Carrier | Supported operations | Scenario |
| --- | --- | --- | --- |
| XBurn | PC + USB | Flash full image / Flash specific regions / Flash specific partition images / Back up specific regions | First-time flash, system recovery, partition-level maintenance |
| U disk upgrade | U disk | Flash the complete eMMC region only (`emmc_disk.simg`) | No PC, batch flashing, on-site recovery |

:::warning Write-only, no backup
The U disk upgrade can only flash a sparse image from the U disk to the onboard eMMC. It **cannot** back up or write the onboard eMMC content back to a U disk. To back up the system, use [XBurn backup](./03_burn.md#back-up-specific-regions).
:::

:::note Version support
RDK S100 V4.1.0 and later support the U disk upgrade. Earlier versions ship a U-Boot without this feature, so no upgrade log appears after power-on.
:::

## Prerequisites

To complete this procedure, prepare:

- An RDK S100 board that boots from onboard eMMC
- A U disk: at least 16GB, USB 3.0 or above
- A debug serial cable for monitoring and verification
- The system image `img_packages/disk/emmc_disk.simg`. See [Image download](./02_preparation.md#image-download). This method does not require XBurn.

## Procedure

### Step 1: Create the upgrade U disk

U-Boot only recognizes a sparse image written at the **beginning** of the U disk (LBA 0). Copying the `.simg` file into a FAT or exFAT file system is not recognized. You must write it to the whole-disk device with `dd`.

:::danger All data is lost
This step erases all data and partitions on the U disk. Check the device name against the capacity carefully, and never select your PC system disk.
:::

Run the commands in this step from the unzipped `product` directory; the image is in `img_packages/disk/`.

1. Insert the U disk in a Linux or WSL environment and identify the whole-disk device:

   ```bash
   lsblk
   ```

   Example output (`sdf` is the U disk in this example; identify yours by capacity):

   ```text
   sdf      8:80   1  58.6G  0 disk
   └─sdf1   8:81   1  58.6G  0 part
   ```

2. (Optional) Verify that the image is a sparse image. The sparse image header starts with `3aff 26ed`:

   ```bash
   xxd -l 4 img_packages/disk/emmc_disk.simg
   ```

   Expected output:

   ```text
   00000000: 3aff 26ed
   ```

3. Erase the partition table and boot record at the beginning of the U disk:

   ```bash
   sudo dd if=/dev/zero of=/dev/sdf bs=512 count=2048
   ```

   Expected output:

   ```text
   2048+0 records in
   2048+0 records out
   1048576 bytes (1.0 MB, 1.0 MiB) copied
   ```

4. Write the image to the whole-disk device:

   ```bash
   sudo dd if=img_packages/disk/emmc_disk.simg of=/dev/sdf bs=4M conv=sync status=progress
   ```

   Expected output (byte counts vary by image version):

   ```text
   2150+0 records out
   9017753600 bytes (9.0 GB, 8.4 GiB) copied, 449.323 s, 20.1 MB/s
   ```

5. Flush the cache and eject the U disk safely:

   ```bash
   sync
   sudo eject /dev/sdf
   ```

`conv=sync` pads the last partial block to a full 4 MiB block, so the reported byte count is a multiple of 4 MiB and slightly larger than the image file size. This is expected. If `dd` reports an error, or the byte count is smaller than the image file size, repeat steps 3 and 4.

### Step 2: Connect the U disk and cold boot

1. Keep the board powered off and insert the prepared U disk into a USB 3.0 Type-A port (J19/J20). The USB Type-C port (J16) is device-only and cannot host a U disk.
2. Connect the PC and the debug serial port with a Type-C cable. For serial settings, see [Type-C (J16)](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#type-c-j16).
3. Power off the board and power it on again. The automatic upgrade only runs on a cold boot; a soft reboot such as `reboot` skips it.

### Step 3: Watch the upgrade

After U-Boot starts, it probes the U disk first. Example log:

```text
u disk auto upgrade: enabled
u disk upgrade: boot reason=poweroff (0xdead40ff)
...
USB upgrade source: usb 0 Vendor: Kingston Prod: DataTraveler 3.0
USB sparse image found, upgrading...
USB upgrade scratch @ 0x400000000
Do NOT remove the USB disk!!!
simg file bytes: 9015699728, expanded bytes: 24747937792
Flashing Sparse Image
...
upgrade progress: 222261248 / 24747937792 bytes (0%)
...
##################################
# USB disk upgrade to mmc SUCCESS, need reboot system.
##################################
upgrade from USB disk Success, now reboot system
```

- `USB sparse image found, upgrading...` means the image was found and flashing has started.
- Do **not** remove the U disk or power off during flashing. The board reboots automatically when progress reaches 100%.
- The time required depends on U disk and eMMC throughput, typically several minutes.

## Verification

- **Success**: the serial console shows `# USB disk upgrade to mmc SUCCESS, need reboot system.` and the board reboots automatically.
- Remove the U disk after the reboot and confirm the version matches the U disk image:

  ```bash
  cat /etc/version
  ```

  The output is the version carried by the image. You can also run `sudo rdkos_info` for complete system information. See [rdkos_info command](../../../09_Appendix/rdk-command-manual/cmd_rdkos_info.md).
- **Failure**: the serial console shows `# USB disk upgrade to mmc FAILED.` and stops at the U-Boot command line. See [FAQ](#faq).

## Advanced usage

### Trigger the upgrade manually

Enter the U-Boot command line (press and hold the spacebar right after power-on) and run:

```text
u_disk_upgrade           # automatically select the U disk whose LBA 0 holds a sparse image
u_disk_upgrade force     # skip the cold-boot check and upgrade immediately
```

### Disable or restore the automatic upgrade

The U-Boot environment variable `u_disk_auto_upgrade` controls whether the U disk is checked at power-on. The default is `1`:

```text
setenv u_disk_auto_upgrade 0    # disable; do not probe the U disk at power-on
saveenv
```

After disabling, the serial console shows `u disk auto upgrade: disabled (u_disk_auto_upgrade!=1)`. To restore automatic upgrading, set the variable back to `1` and run `saveenv` again.

## FAQ

### No upgrade log appears after power-on with the U disk inserted

**Cause**: The system version is earlier than V4.1.0 and its U-Boot does not include the feature, or the automatic upgrade was disabled.

**Solution**: Run `cat /etc/version` to check the system version. In the U-Boot command line, run `printenv u_disk_auto_upgrade` to confirm the value is `1`.

### The console shows skip u disk upgrade: not POR

**Cause**: This boot is a soft reboot rather than a cold boot. The automatic reboot after a successful upgrade also shows this message, which is expected and prevents flashing again.

**Solution**: Power off and power on again, or enter the U-Boot command line at the prompt and run `u_disk_upgrade force`.

### The console shows skip u disk upgrade: no sparse image on USB storage

**Cause**: The beginning of the U disk does not hold a sparse image. This usually happens when the `.simg` file was copied into a FAT or exFAT file system as an ordinary file.

**Solution**: Write the image to the whole-disk device with `dd` as described in [Step 1](#step-1-create-the-upgrade-u-disk).

### The upgrade repeats on the next power-on

**Cause**: The U disk is still inserted, so a cold boot triggers the automatic upgrade again.

**Solution**: Remove the U disk after the upgrade completes.

### The console shows USB disk upgrade to mmc FAILED and stops at the U-Boot command line

**Cause**: The image write was incomplete or the file is corrupted, or the target eMMC is smaller than the expanded image size.

**Solution**: Recreate the U disk and make sure the `dd` byte count is not smaller than the image file size. Check the eMMC capacity. In the U-Boot command line, run `run u_disk_upgrade_cmd` to retry.
