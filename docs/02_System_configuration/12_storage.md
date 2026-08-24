---
title: "存储与磁盘管理"
sidebar_position: 12
description: "RDK OS 存储查看、rootfs 占用、挂载"
---

# 存储与磁盘管理

查看板端存储设备、rootfs 占用与挂载情况。

## 查看磁盘占用

```bash
df -h /
```

RDK S600 实测（rootfs 在 SSD 分区上）：

```text
Filesystem                                              Size  Used Avail Use% Mounted on
/dev/disk/by-partuuid/1993ccc4-e089-b84e-b2d5-193a1bc4b7f3  45G  9.8G  33G  23% /
```

rootfs 45G、已用 9.8G（23%），剩余 33G。占用高时清理 apt 缓存（`apt clean`）或日志（`journalctl --vacuum-size=100M`）。

## 查看块设备

```bash
lsblk
```

RDK S600 实测（SSD `sda` 59.6G）：

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

RDK S600 用 SSD（`sda`）启动，分区含引导（sda1~sda4）、内核/DTB（sda5~sda13）、`/boot`、`/ota`（OTA 分区）、`/log`（日志分区）、`/userdata`（用户数据）与 rootfs（`/`）。`sdb`/`sdc` 为板载 4M 存储。

## 挂载与卸载

```bash
# 查看已挂载
mount | grep -E "sd|mmc"

# 挂载 U 盘（先 lsblk 确认设备名；sdb/sdc 为板载 4M 存储，U 盘通常为 sdd 及之后）
sudo mount /dev/sdd1 /mnt

# 卸载
sudo umount /mnt
```

## rootfs 扩容

`resize2fs` 把文件系统扩展到所在分区上限（文件系统未占满分区时使用）；`growpart` 把分区扩展到磁盘的未分配空间（分区后仍有空闲空间时使用，扩分区后需再跑 `resize2fs`）：

```bash
# 将 ext4 文件系统扩展到分区上限
sudo resize2fs /dev/<rootfs分区>

# 分区后仍有未分配空间时，先扩分区，再扩文件系统
sudo growpart /dev/sda <分区号>
sudo resize2fs /dev/<rootfs分区>
```

:::warning
操作分区有数据丢失风险，先 `df`/`lsblk` 确认目标分区，必要时备份。本机 rootfs 位于 sda17（最后一个分区），其后已无未分配空间，无法用 `growpart` 扩展，仅当存在未分配空间时可用。
:::

## 验证

- 磁盘占用：`df -h /` 查看 rootfs 大小与可用空间。
- 块设备：`lsblk` 列出磁盘与分区挂载情况。
- 挂载：`mount | grep -E "sd|mmc"` 查看已挂载设备；挂载 U 盘后 `ls /mnt` 能看到内容即成功。

## 常见问题

### rootfs 占用过高

**原因**：apt 缓存、日志或用户数据占用过大。

**解决**：`sudo apt clean`、`journalctl --vacuum-size=100M` 清理；仍不足则见「rootfs 扩容」或迁移数据。

### 挂载 U 盘失败

**原因**：设备名判断错误（`sdb`/`sdc` 为板载 4M 存储，U 盘通常为 `sdd` 及之后）。

**解决**：先 `lsblk` 确认设备名，再用正确节点挂载。

### growpart 提示无可扩展空间

**原因**：rootfs 分区后已无未分配空间（本机 rootfs 为最后一个分区）。

**解决**：仅当分区后存在未分配空间时才可 `growpart`；否则另挂存储迁移数据。

## 相关文档

- [软件包管理 apt](./03_system_update/01_apt_usage.md)
- [系统日志查看](./15_system_log.md)
- [Linux 命令：mount](../09_Appendix/linux-command-manual/09_mount.md)
