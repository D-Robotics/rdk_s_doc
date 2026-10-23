---
sidebar_position: 5
description: Create a U disk upgrade drive; U-Boot automatically flashes the sparse image to onboard UFS on a cold boot
---

# U disk upgrade

## Overview

The U disk upgrade writes the system image to a U disk. After the board is powered off and on again, U-Boot reads the U disk and flashes the image to the onboard UFS.

- **Purpose**: Creates an upgrade U disk. Insert it into the board and cold-boot once to flash the system and reboot automatically.
- **Benefit**: Prepare the U disk once. After that, flashing on the board needs no PC and no XBurn, and the same U disk can be reused. It suits production-line batch flashing and on-site recovery.
- **Result**: The board reboots into the system version carried by the U disk image.

The U disk upgrade uses `img_packages/disk/ufs_disk.simg`, the same image that XBurn uses when flashing the `ufs` region. Only the transport changes from a PC to a U disk.

| Method | Carrier | Supported operations | Scenario |
| --- | --- | --- | --- |
| XBurn | PC + USB | Flash full image / Flash specific regions / Flash specific partition images / Back up specific regions | First-time flash, system recovery, partition-level maintenance |
| U disk upgrade | U disk | Flash the complete UFS region only (`ufs_disk.simg`) | No PC, batch flashing, on-site recovery |

:::warning Write-only, no backup
The U disk upgrade can only flash a sparse image from the U disk to the onboard UFS. It **cannot** back up or write the onboard UFS content back to a U disk. To back up the system, use [Back up specific regions](./03_burn.md#back-up-specific-regions) in XBurn.
:::

:::note Onboard UFS only
The U disk upgrade supports onboard UFS only, not NVMe. For an NVMe system, use [XBurn flashing](./03_burn.md).
:::

:::note Version support
The U disk upgrade is provided by U-Boot and requires both U-Boot and the system image to include the feature. If the serial console shows no `try upgrade from USB disk` log after power-on, the current U-Boot does not support it. Upgrade to a system image that includes this feature.
:::

## Prerequisites

To complete this procedure, prepare:

- An RDK S600 board that boots from onboard UFS
- A U disk: at least 16GB, USB 3.0 or above
- A debug serial cable for monitoring and verification
- The system image `img_packages/disk/ufs_disk.simg`. See [Image download](./02_preparation.md#image-download). This method does not require XBurn.

## Procedure

### Step 1: Create the upgrade U disk

U-Boot only recognizes a sparse image written at the **beginning** of the U disk (LBA 0). Copying the `.simg` file into a FAT or exFAT file system is not recognized. Write it to the whole-disk device instead.

:::danger All data is lost
This step erases all data and partitions on the U disk. Check the device name against the capacity carefully, and never select your PC system disk.
:::

The U disk has no file system after creation. The PC may prompt you to format it. This is expected, and you should **not** format it.

#### Use dd on Linux

1. Insert the U disk and run `lsblk` to identify the whole-disk device (`sdf` in this example; identify yours by capacity):

   ```bash
   lsblk
   ```

   ```text
   sdf      8:80   1  58.6G  0 disk
   └─sdf1   8:81   1  58.6G  0 part
   ```

2. Erase the partition table and boot record at the beginning of the U disk:

   ```bash
   sudo dd if=/dev/zero of=/dev/sdf bs=512 count=2048
   ```

3. Write the image to the whole-disk device:

   ```bash
   sudo dd if=ufs_disk.simg of=/dev/sdf bs=4M conv=sync status=progress
   ```

   The byte count reported by `dd` should match the image file size. Writing an 8 GB sparse image takes about 3 to 4 minutes.

4. Flush the cache and eject the U disk safely:

   ```bash
   sync
   sudo eject /dev/sdf
   ```

#### Use dd on WSL2

WSL2 cannot access the U disk directly. Attach it to WSL with usbipd-win first.

1. Install usbipd-win in an administrator PowerShell window (once only):

   ```powershell
   winget install dorssel.usbipd-win
   ```

2. List the USB devices and note the BUSID of the U disk (`5-4` in this example):

   ```powershell
   usbipd list
   ```

3. Bind and attach the device to WSL:

   ```powershell
   usbipd bind --busid 5-4
   usbipd attach --wsl --busid 5-4
   ```

4. Run `lsblk` in WSL to identify the device name, then erase and write the image by following [Use dd on Linux](#use-dd-on-linux).

#### Use balenaEtcher on Windows

1. Install and open [balenaEtcher](https://etcher.balena.io/), and select **Flash from file**.
2. In the file dialog, switch the file format to **Any file format**, then select `ufs_disk.simg`.
3. Select the target U disk and click **Flash!**.
4. If it reports "No partition table", click **Continue**. This is expected because the image is a sparse image without a partition table.
5. When it reports that the image was compressed and cannot be validated, click **Cancel** and ignore the message.
6. Eject the U disk from the Windows notification area before removing it.

:::note balenaEtcher reports Flash Failed
This error is usually caused by an unstable connection between the U disk and the PC. Reconnect the U disk and retry. If it keeps failing, try another U disk or USB port.
:::

### Step 2: Connect the U disk and cold boot

1. Keep the board powered off and insert the prepared U disk into a USB 3.0 Type-A port ([J7/J8/J9](../../01_hardware_introduction/02_rdk_s600/01_rdk_s600.md#usb-30-type-a-interface-j7j8j9)). The Type-C port supports Device mode only and cannot host a U disk.
2. Connect the PC to the board [debug serial port](../../01_hardware_introduction/02_rdk_s600/01_rdk_s600.md#j4) with a Type-C cable. Use 921600 baud, 8 data bits, no parity, 1 stop bit, and no flow control.
3. Power the board off and on again. The automatic upgrade runs only on power-on reset (POR). A `reboot` or a press of the RST button skips the upgrade check.

### Step 3: Watch the upgrade

After U-Boot starts, it probes the U disk first. Example log:

```text
try upgrade from USB disk
reset reason is POR,try upgrade from u disk to scsi
addr=0x400000000, usb_index=0
starting USB...
scanning bus xhci_pci for devices... 1 USB Device(s) found
scanning usb for storage devices... 1 Storage Device(s) found
Device 0: Vendor: SanDisk Rev: 1.00 Prod: Ultra
            Type: Removable Hard Disk
            Capacity: 29664.0 MB = 28.9 GB (60751872 x 512)
Reading sparse image from usb disk 0 ...
=== Sparse Image Info ===
blk_sz: 4096, total_blks: 6168280
total_chunks: 746
Reading sparse image from USB disk. Please wait. Do NOT remove the USB disk!!!
usb read: device 0 block # 0, count 20971520 ... 20971520 blocks read: OK
Writing sparse image 0000400080000000 to scsi...
Flashing sparse Image at offset 0
Flashing Sparse Image
....... write 12380372992 bytes to '0x0'
time: 7 minutes, 0.719 seconds
#################################
# USB disk upgrade to scsi SUCCESS, need reboot system.
#################################
upgrade from USB disk Success, now reboot system
try to clear boot count...
read aon boot cnt = 0
resetting ...
```

- `Reading sparse image from usb disk 0` means the image was found and reading has started. U-Boot then prints `Do NOT remove the USB disk!!!` while the U disk is still being read.
- Do **not** remove the U disk while it is being read. Remove it only after `Writing sparse image ... to scsi` appears, which marks the start of writing to UFS.
- The serial console does not print percentage progress during the write. No new log output for a long time is expected. An 8 GB sparse image usually takes about 7 minutes, depending on the U disk read speed and the UFS write speed.
- The board reboots automatically after a successful upgrade and clears the upgrade flag. A later cold boot with the U disk still inserted does not flash again.

## Verification

- **Success**: the serial console shows `USB disk upgrade to scsi SUCCESS, need reboot system.` and the board reboots automatically.
- After the reboot, confirm that the version matches the U disk image:

  ```bash
  cat /etc/version
  ```

  The output is the version carried by the image. You can also run `sudo rdkos_info` for complete system information. See [rdkos_info command](../../../09_Appendix/rdk-command-manual/cmd_rdkos_info.md).
- **Failure**: the serial console stops at the U-Boot command line and boot does not continue. See [FAQ](#faq).

## Advanced usage

### Trigger the upgrade manually

Enter the U-Boot command line (press and hold the spacebar right after power-on) and run:

```text
u_disk_upgrade           # automatically select the U disk whose LBA 0 holds a sparse image
u_disk_upgrade force     # skip the cold-boot check and upgrade immediately
```

When you trigger the upgrade manually, the command returns after the upgrade completes. Reboot the board manually to start from UFS.

## FAQ

### No upgrade log appears after power-on with the U disk inserted

**Cause**: The current U-Boot does not support the U disk upgrade.

**Solution**: Check the system image version and upgrade to a version that includes the feature. If the U disk is plugged into the Type-C port, move it to a USB 3.0 Type-A port.

### The console shows reset reason is not POR, skip upgrade from u disk

**Cause**: This boot is a soft reboot or reset rather than a power-on reset. The automatic reboot after a successful upgrade also shows this message, which is expected and prevents flashing again.

**Solution**: Power the board off and on again, or enter the U-Boot command line and run `u_disk_upgrade force`.

### The console prints only try upgrade from USB disk and no U disk is detected

**Cause**: The U disk is not seated correctly, is plugged into the Device-mode Type-C port, or is not a USB 3.0 device.

**Solution**: Insert the U disk into a USB 3.0 Type-A port (J7/J8/J9) and make sure it is fully seated, then power the board off and on again. If it is still not detected, try another U disk or port.

### The upgrade takes longer than expected

**Cause**: Low U disk read speed or UFS write speed. Reference values: about 113MB/s for U disk reads and about 41MB/s for UFS writes.

**Solution**: Use a USB 3.0 or above U disk, and make sure the image was written to the whole-disk device as described in [Step 1](#step-1-create-the-upgrade-u-disk) rather than into a file system.

### Can I remove the U disk during the upgrade

Never remove the U disk while it is being read. You may remove it only after `Writing sparse image ... to scsi` appears, which marks the start of writing to UFS.

### Does the U disk upgrade affect normal boot time

Yes. Whether or not a U disk is inserted, U-Boot spends about 4 seconds checking for one on every cold boot. If no U disk is inserted, the boot continues normally right after the check.

### What happens if the upgrade fails

- A U disk read error (no U disk or an invalid image format): the boot continues normally and the kernel starts from UFS.
- A UFS write error (UFS hardware failure and similar): the boot stops at the U-Boot command line.

### Do I need to remove the U disk right after the upgrade

No. U-Boot has cleared the upgrade flag, so a later cold boot with the U disk inserted does not flash again. Removing the U disk after the upgrade prevents an outdated image from being used by accident later.

### LED status during the upgrade

- The LED is off by default after power-on.
- During flashing, the Flash LED ([D61](../../01_hardware_introduction/02_rdk_s600/01_rdk_s600.md#indicator-leds-d59d60d61)) stays on and turns off when flashing completes.
- On success, the system reboots automatically and the LED blinks after Linux starts.
- On failure, the boot stops at the U-Boot command line and the LED stays off.

## Related documents

- Previous: [Image download](./02_preparation.md#image-download)
- Related: [Flash the system image](./03_burn.md) (flash from a PC with XBurn)
- Related: [Build system guide: Default images and partitions](../../../07_Advanced_development/06_rdk_gen.md#default-images-and-partition-introduction) (how `ufs_disk.simg` is generated)
- Related: [rdkos_info command](../../../09_Appendix/rdk-command-manual/cmd_rdkos_info.md)
