---
title: "Storage and Disk Management"
sidebar_position: 12
description: "Viewing storage, rootfs usage, and mounts on RDK OS"
---

# Storage and Disk Management

View the storage devices, rootfs usage, and mount status on the board.

## Check Disk Usage

```bash
df -h /
```

Measured on RDK S600 (rootfs on the SSD partition):

```text
Filesystem                                              Size  Used Avail Use% Mounted on
/dev/disk/by-partuuid/1993ccc4-e089-b84e-b2d5-193a1bc4b7f3  45G  9.8G  33G  23% /
```

The rootfs is 45G with 9.8G used (23%) and 33G remaining. When usage is high, clean up the apt cache (`apt clean`) or logs (`journalctl --vacuum-size=100M`).

## Check Block Devices

```bash
lsblk
```

Measured on RDK S600 (SSD `sda`, 59.6G):

```text
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda       8:0    0 59.6G  0 disk
|-sda1    8:1    0    1M  0 part
|-sda2    8:2    0    1M  0 part
|-sda3    8:3    0    1M  0 part
|-sda4    8:4    0    2M  0 part
|-sda5    8:5    0    2M  0 part
|-sda6    8:6    0    2M  0 part
|-sda7    8:7    0    2M  0 part
|-sda8    8:8    0    8M  0 part
|-sda9    8:9    0    8M  0 part
|-sda10   8:10   0    8M  0 part
|-sda11   8:11   0    8M  0 part
|-sda12   8:12   0  120M  0 part /boot
|-sda13   8:13   0  120M  0 part
|-sda14   8:14   0    8G  0 part /ota
|-sda15   8:15   0    4G  0 part /log
|-sda16 259:0    0    2G  0 part /userdata
`-sda17 259:1    0 45.3G  0 part /
```

The RDK S600 boots from an SSD (`sda`). Its partitions include boot (sda1~sda4), kernel/DTB (sda5~sda13), `/boot`, `/ota` (OTA partition), `/log` (log partition), `/userdata` (user data), and the rootfs (`/`). `sdb`/`sdc` are the onboard 4M storage.

## Mount and Unmount

```bash
# Check mounted devices
mount | grep -E "sd|mmc"

# Mount a USB flash drive (first confirm the device name with lsblk; sdb/sdc are the onboard 4M storage, and the USB drive usually appears as sdd or later)
sudo mount /dev/sdd1 /mnt

# Unmount
sudo umount /mnt
```

## Expanding rootfs

`resize2fs` expands the file system to the limit of the partition it resides on (use it when the file system does not fill the partition); `growpart` expands a partition into the unallocated space of the disk (use it when there is still free space after the partition; after growing the partition, run `resize2fs` again):

```bash
# Expand the ext4 file system to the partition limit
sudo resize2fs /dev/<rootfs_partition>

# If there is unallocated space after the partition, grow the partition first, then the file system
sudo growpart /dev/sda <partition_number>
sudo resize2fs /dev/<rootfs_partition>
```

:::warning
Partition operations carry a risk of data loss. First use `df`/`lsblk` to confirm the target partition, and back up when necessary. On this board, the rootfs is on sda17 (the last partition) with no unallocated space after it, so `growpart` cannot be used here; it applies only when unallocated space exists.
:::

## Verification

- Disk usage: `df -h /` shows the rootfs size and available space.
- Block devices: `lsblk` lists the disks and their partitions/mounts.
- Mounting: `mount | grep -E "sd|mmc"` shows the mounted devices; after mounting a USB drive, `ls /mnt` showing its contents means success.

## FAQ

### rootfs Usage Too High

**Cause**: apt cache, logs, or user data are taking up too much space.

**Solution**: Run `sudo apt clean` and `journalctl --vacuum-size=100M` to clean up; if still insufficient, see "Expanding rootfs" or migrate data.

### USB Drive Mount Fails

**Cause**: The device name was determined incorrectly (`sdb`/`sdc` are the onboard 4M storage; the USB drive usually appears as `sdd` or later).

**Solution**: First confirm the device name with `lsblk`, then mount with the correct node.

### growpart Reports No Expandable Space

**Cause**: There is no unallocated space after the rootfs partition (the onboard rootfs is the last partition).

**Solution**: `growpart` can only be used when there is unallocated space after the partition; otherwise, mount another storage device and migrate data.

## Related Documentation

- [Package Management apt](./03_system_update/01_apt_usage.md)
- [System Log Viewing](./15_system_log.md)
- [Linux Command: mount](../09_Appendix/linux-command-manual/09_mount.md)
