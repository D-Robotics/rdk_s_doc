---
title: "2.12 存储与磁盘管理"
sidebar_position: 12
description: RDK OS 存储查看、rootfs 占用、挂载
---

# 2.12 存储与磁盘管理

查看板端存储设备、rootfs 占用与挂载情况。

## 查看磁盘占用

```bash
df -h /
```

RDK S600 实测（rootfs 在 SSD 分区上）：

```text
Filesystem                                              Size  Used Avail Use% Mounted on
/dev/disk/by-partuuid/1993ccc4-e089-b84e-b2d5-193a1bc4b7f3  45G  9.7G  33G  23% /
```

rootfs 45G、已用 9.7G（23%），剩余 33G。占用高时清理 apt 缓存（`apt clean`）或日志（`journalctl --vacuum-size`）。

## 查看块设备

```bash
lsblk
```

S600 实测（SSD `sda` 59.6G，多分区）：

```text
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda       8:0    0 59.6G  0 disk
|-sda1    8:1    0    1M  0 part
|-sda2    8:2    0    1M  0 part
|-sda3    8:3    0    1M  0 part
|-sda4    8:4    0    2M  0 part
...
```

RDK S600 用 NVMe/SSD 启动（`sda`），分区含引导、kernel、rootfs 等。

## 挂载与卸载

```bash
# 查看已挂载
mount | grep -E "sd|mmc"

# 挂载 U 盘
sudo mount /dev/sdb1 /mnt

# 卸载
sudo umount /mnt
```

## rootfs 扩容

若 rootfs 未占满整个分区，可扩展：

```bash
sudo resize2fs /dev/<rootfs分区>      # ext4
# 或对齐到分区上限
sudo growpart /dev/sda <分区号>
```

:::warning
操作分区有数据丢失风险，先 `df`/`lsblk` 确认目标分区，必要时备份。
:::

## 相关文档

- [软件包管理 apt](./03_system_update/02_apt_usage.md)
- [系统日志查看](./15_system_log.md)
- [Linux 命令：mount](../09_Appendix/linux-command-manual/mount.md)
