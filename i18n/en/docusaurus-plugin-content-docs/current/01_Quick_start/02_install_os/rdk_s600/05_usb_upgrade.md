---
sidebar_position: 5
description: Create a USB drive upgrade image; U-Boot automatically flashes the sparse image to onboard UFS on a cold boot
---

# USB drive upgrade

## Overview

The USB drive upgrade writes the system image to a USB drive. On a cold boot, U-Boot reads the USB drive, flashes the image to the onboard UFS, and the board reboots into the new system.

Prepare the USB drive once. After that, the same USB drive can be reused, and flashing on the board needs no PC and no XBurn. It suits production-line batch flashing and on-site recovery.

The USB drive upgrade uses `img_packages/disk/ufs_disk.simg`, the same image that XBurn uses when flashing the `ufs` region. Only the transport changes from a PC to a USB drive.

| Method | Carrier | Supported operations | Scenario |
| --- | --- | --- | --- |
| XBurn | PC + USB | Flash full image / Flash specific regions / Flash specific partition images / Back up specific regions | First-time flash, system recovery, partition-level maintenance |
| USB drive upgrade | USB drive | Flash the complete UFS region only (`ufs_disk.simg`) | No PC, batch flashing, on-site recovery |

:::warning Write-only, no backup
The USB drive upgrade can only flash a sparse image from the USB drive to the onboard UFS. It **cannot** back up or write the onboard UFS content back to a USB drive. To back up the system, use [Back up specific regions](./03_burn.md#back-up-specific-regions) in XBurn.
:::

:::note Onboard UFS only
The USB drive upgrade supports onboard UFS only, not NVMe. For an NVMe system, use [XBurn flashing](./03_burn.md).
:::

## Prerequisites

To complete this procedure, prepare:

- An RDK S600 board that boots from onboard UFS
- A USB drive: at least 16GB, USB 3.0 or above
- A debug serial cable for monitoring and verification
- The system image `img_packages/disk/ufs_disk.simg`. See [Image download](./02_preparation.md#image-download). This method does not require XBurn.

## Procedure

### Step 1: Create the upgrade USB drive

U-Boot only recognizes a sparse image written at the **beginning** of the USB drive (LBA 0). Copying the `.simg` file into a FAT or exFAT file system is not recognized. Write it to the whole-disk device instead.

:::danger All data is lost
This step erases all data and partitions on the USB drive. Check the device name against the capacity carefully, and never select your PC system disk.
:::

The USB drive has no file system after creation. The PC may prompt you to format it. This is expected, and you should **not** format it.

#### Use dd on Linux

Run the commands in this section from the unzipped `product` directory; the image is in `img_packages/disk/`.

1. Insert the USB drive and run `lsblk` to identify the whole-disk device (`sdf` in this example; identify yours by capacity):

   ```bash
   lsblk
   ```

   ```text
   sdf      8:80   1  58.6G  0 disk
   └─sdf1   8:81   1  58.6G  0 part
   ```

2. Erase the partition table and boot record at the beginning of the USB drive:

   ```bash
   sudo dd if=/dev/zero of=/dev/sdf bs=512 count=2048
   ```

3. Write the image to the whole-disk device:

   ```bash
   sudo dd if=img_packages/disk/ufs_disk.simg of=/dev/sdf bs=4M conv=sync status=progress
   ```

   `conv=sync` pads the last partial block to a full 4 MiB block, so the reported byte count is a multiple of 4 MiB and slightly larger than the image file size. This is expected. If `dd` reports an error, or the byte count is smaller than the image file size, repeat steps 2 and 3. Writing time depends on the image size and the USB drive write speed; an 8 GB image takes about 3 to 4 minutes.

4. Flush the cache and eject the USB drive safely:

   ```bash
   sync
   sudo eject /dev/sdf
   ```

#### Use dd on WSL2

WSL2 cannot access the USB drive directly. Attach it to WSL with usbipd-win first.

1. Install usbipd-win in an administrator PowerShell window (once only):

   ```powershell
   winget install dorssel.usbipd-win
   ```

2. List the USB devices and note the BUSID of the USB drive (`5-4` in this example):

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
3. Select the target USB drive and click **Flash!**.
4. If it reports "No partition table", click **Continue**. This is expected because the image is a sparse image without a partition table.
5. When it reports that the image was compressed and cannot be validated, click **Cancel** and ignore the message.
6. Eject the USB drive from the Windows notification area before removing it.

:::note balenaEtcher reports Flash Failed
This error is usually caused by an unstable connection between the USB drive and the PC. Reconnect the USB drive and retry. If it keeps failing, try another USB drive or USB port.
:::

### Step 2: Connect the USB drive and cold boot

1. Keep the board powered off and insert the prepared USB drive into a USB 3.0 Type-A port ([J7/J8/J9](../../01_hardware_introduction/02_rdk_s600/01_rdk_s600.md#usb-30-type-a-interface-j7j8j9)). The Type-C port supports Device mode only and cannot host a USB drive.
2. Connect the PC to the board [debug serial port](../../01_hardware_introduction/02_rdk_s600/01_rdk_s600.md#j4) with a Type-C cable. Use 921600 baud, 8 data bits, no parity, 1 stop bit, and no flow control.
3. Power the board off and on again. The automatic upgrade runs only on power-on reset (POR). A `reboot` or a press of the RST button skips the upgrade check.

### Step 3: Watch the upgrade

After U-Boot starts, it probes the USB drive first. Example log:

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

- `Reading sparse image from usb disk 0` means the image was found and reading has started. U-Boot then prints `Do NOT remove the USB disk!!!` while the USB drive is still being read.
- Do **not** remove the USB drive while it is being read. Remove it only after `Writing sparse image ... to scsi` appears, which marks the start of writing to UFS.
- The serial console does not print percentage progress during the write. No new log output for a long time is expected. The upgrade time depends on the image size and the UFS write speed, and the image size varies by version; the image in the log above writes about 12.4 GB and takes about 7 minutes.
- The board reboots automatically after a successful upgrade and clears the upgrade flag. A later cold boot with the USB drive still inserted does not flash again.

## Verification

- **Success**: the serial console shows `USB disk upgrade to scsi SUCCESS, need reboot system.` and the board reboots automatically.
- After the reboot, confirm that the version matches the USB drive image:

  ```bash
  cat /etc/version
  ```

  The output is the version carried by the image. You can also run `sudo rdkos_info` for complete system information. See [rdkos_info command](../../../09_Appendix/rdk-command-manual/cmd_rdkos_info.md).
- **Failure**: the serial console stops at the U-Boot command line and boot does not continue. See [FAQ](#faq).

## Advanced usage

### Trigger the upgrade manually

Enter the U-Boot command line (press and hold the spacebar right after power-on) and run:

```text
u_disk_upgrade           # automatically select the USB drive whose LBA 0 holds a sparse image
u_disk_upgrade force     # skip the cold-boot check and upgrade immediately
```

When you trigger the upgrade manually, the command returns after the upgrade completes. Reboot the board manually to start from UFS.

## FAQ

### No upgrade log appears after power-on with the USB drive inserted

**Cause**: The serial console is not connected correctly, or the board was not fully powered off and on.

**Solution**: Check that the serial cable is connected to the debug port with 921600 8N1, and that the USB drive is in a USB 3.0 Type-A port (J7, J8, or J9). Then power the board off and on again.

### The console shows reset reason is not POR, skip upgrade from u disk

**Cause**: This boot is a soft reboot or reset rather than a power-on reset. The automatic reboot after a successful upgrade also shows this message, which is expected and prevents flashing again.

**Solution**: Power the board off and on again, or enter the U-Boot command line and run `u_disk_upgrade force`.

### The console prints only try upgrade from USB disk and no USB drive is detected

**Cause**: The USB drive is not seated correctly, is plugged into the Device-mode Type-C port, or is not a USB 3.0 device.

**Solution**: Insert the USB drive into a USB 3.0 Type-A port (J7/J8/J9) and make sure it is fully seated, then power the board off and on again. If it is still not detected, try another USB drive or port.

### The upgrade takes longer than expected

**Cause**: Low USB drive read speed or UFS write speed. Reference values: about 113MB/s for USB drive reads and about 30MB/s for UFS writes.

**Solution**: Use a USB 3.0 or faster drive, and make sure the image was written to the whole-disk device as described in [Step 1](#step-1-create-the-upgrade-usb-drive) rather than into a file system.

### Can I remove the USB drive during the upgrade

Never remove the USB drive while it is being read. You may remove it only after `Writing sparse image ... to scsi` appears, which marks the start of writing to UFS.

### Does the USB drive upgrade affect normal boot time

Yes. Whether or not a USB drive is inserted, U-Boot spends about 4 seconds checking for one on every cold boot. If no USB drive is inserted, the boot continues normally right after the check.

### What happens if the upgrade fails

- A USB drive read error (no USB drive or an invalid image format): the boot continues normally and the kernel starts from UFS.
- A UFS write error (UFS hardware failure and similar): the boot stops at the U-Boot command line.

### Do I need to remove the USB drive right after the upgrade

No. U-Boot has cleared the upgrade flag, so a later cold boot with the USB drive inserted does not flash again. Removing the USB drive after the upgrade prevents an outdated image from being used by accident later.

### LED status during the upgrade

- The LED is off by default after power-on.
- During flashing, the Flash LED ([D61](../../01_hardware_introduction/02_rdk_s600/01_rdk_s600.md#indicator-leds-d59d60d61)) stays on and turns off when flashing completes.
- On success, the system reboots automatically and the LED blinks after Linux starts.
- On failure, the boot stops at the U-Boot command line and the LED stays off.
