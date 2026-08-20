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

The rootfs is 45G with 9.8G used (23%) and 33G remaining. When usage is high, clean up the apt cache (`apt clean`) or logs (`journalctl --vacuum-size`).

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

# Mount a USB flash drive
sudo mount /dev/sdb1 /mnt

# Unmount
sudo umount /mnt
```

## Expanding rootfs

If the rootfs does not fill the whole partition, it can be expanded:

```bash
sudo resize2fs /dev/<rootfs_partition>      # ext4
# Or grow to the partition limit
sudo growpart /dev/sda <partition_number>
```

:::warning
Partition operations carry a risk of data loss. First use `df`/`lsblk` to confirm the target partition, and back up when necessary.
:::

## Related Documents

- [Package Management apt](./03_system_update/01_apt_usage.md)
- [System Log Viewing](./15_system_log.md)
- [Linux Command: mount](../09_Appendix/linux-command-manual/09_mount.md)
