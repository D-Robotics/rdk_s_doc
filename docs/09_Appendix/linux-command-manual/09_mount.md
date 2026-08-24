---
sidebar_position: 9
title: "mount"
description: "Linux 命令 mount 用法"
---

# mount

**mount** 用于挂载文件系统的命令。

## 语法说明

```
mount [-l|-h|-V]
mount -a [-fFnrsvw] [-t fstype] [-O optlist]
mount [-fnrsvw] [-o options] device|dir
mount [-fnrsvw] [-t fstype] [-o options] device dir
```

## 选项说明

```shell
-V：显示程序版本
-h：显示辅助讯息
-v：显示较讯息，通常和 -f 用来除错。
-a：将 /etc/fstab 中定义的所有档案系统挂上。
-F：这个命令通常和 -a 一起使用，它会为每一个 mount 的动作产生一个行程负责执行。在系统需要挂上大量 NFS 档案系统时可以加快挂上的动作。
-f：通常用在除错的用途。它会使 mount 并不执行实际挂上的动作，而是模拟整个挂上的过程。通常会和 -v 一起使用。
-n：一般而言，mount 在挂上后会在 /etc/mtab 中写入一笔资料。但在系统中没有可写入档案系统存在的情况下可以用这个选项取消这个动作。
-r：等于 -o ro
-w：等于 -o rw
-L：将含有特定标签的硬盘分割挂上。
-U：将含有特定 UUID 的硬盘分割挂上。-L 和 -U 必须在 /proc/partitions 这种档案存在时才有意义。
-t：指定档案系统的型态，通常不必指定。mount 会自动选择正确的型态。
-o async：打开非同步模式，所有的档案读写动作都会用非同步模式执行。
-o sync：在同步模式下执行。
-o atime、-o noatime：当 atime 打开时，系统会在每次读取档案时更新档案的『上一次调用时间』。当我们使用 flash 档案系统时可能会选项把这个选项关闭以减少写入的次数。
-o auto、-o noauto：打开/关闭自动挂上模式。
-o defaults:使用预设的选项 rw, suid, dev, exec, auto, nouser, and async.
-o dev、-o nodev：允许/禁止使用设备文件作为档案系统。-o exec、-o noexec：允许/禁止执行档案系统中的可执行档。
-o suid、-o nosuid：允许/禁止 setuid/setgid 位生效。
-o user、-o nouser：允许/禁止普通使用者挂载（nouser 时仅 root 可挂载）。
-o remount：将一个已经挂下的档案系统重新用不同的方式挂上。例如原先是唯读的系统，现在用可读写的模式重新挂上。
-o ro：用唯读模式挂上。
-o rw：用可读写模式挂上。
-o loop=：使用 loop 模式用来将一个档案当成硬盘分割挂上系统。
```

## 常用命令

将 /dev/hda1 挂在 /mnt 之下

```
mount /dev/hda1 /mnt
```

将 /dev/hda1 用只读模式挂在 /mnt 之下

```
mount -o ro /dev/hda1 /mnt
```

将 / 根目录重新挂载为读写模式

```
mount -o remount,rw /
```

挂载 nfs 网络文件系统

```
mount -t nfs -o nolock 192.168.1.20:/home/ /tmp/nfs
```

查看当前系统已挂载的文件系统

```
mount
```

预期输出（节选）：

```text
sysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)
proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)
udev on /dev type devtmpfs (rw,nosuid,relatime,size=12336064k,nr_inodes=192751,mode=755)
/dev/sda17 on / type ext4 (rw,relatime)
```

## 相关文档

- [存储与磁盘管理](../../02_System_configuration/12_storage.md)
