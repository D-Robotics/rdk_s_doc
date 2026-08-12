---
title: "2.15 系统日志查看"
sidebar_position: 15
description: 用 dmesg/journalctl/systemctl 查看系统日志与服务状态
---

# 2.15 系统日志查看

排障时常用三类日志：内核日志（`dmesg`）、systemd 日志（`journalctl`）、服务状态（`systemctl status`）。

## 内核日志 dmesg

查看内核环形缓冲日志（驱动、硬件、BPU 等）：

```bash
dmesg | tail -20
```

RDK S600 实测（BPU 核心内存分配）：

```text
[8659.329184] bpu-core: bpu core mem alloc mem addr addr = 0xffff800050400000, ...
[8660.285202] bpu-core: bpu core mem alloc mem addr addr = 0xffff800052410000, ...
```

按级别过滤：`dmesg --level=err,warn`。实时跟踪：`dmesg -w`。

## systemd 日志 journalctl

`journalctl` 查看所有服务的结构化日志（开机以来的全部）：

```bash
journalctl                       # 全部
journalctl -b                   # 本次开机以来
journalctl -u ssh                # 指定服务
journalctl -p err                # 仅错误及以上
journalctl -f                    # 实时跟踪
```

查看日志占用磁盘（S600 实测）：

```bash
journalctl --disk-usage
# Archived and active journals take up 185.9M in the file system.
```

清理旧日志（限制到 100M）：`journalctl --vacuum-size=100M`。

## 服务状态 systemctl

```bash
systemctl status ssh             # 看某服务状态
systemctl is-system-running       # 看整体运行状态
```

S600 实测：

```text
$ systemctl is-system-running
degraded

$ systemctl status ssh
● ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/usr/lib/systemd/system/ssh.service; disabled; preset: enabled)
     Active: active (running) since Tue 2026-08-11 20:56:04 CST; 3h 0min ago
TriggeredBy: ● ssh.socket
```

`degraded` 表示有服务启动失败（开发板常见，排查用 `systemctl --failed`）。`ssh` 显示 `active (running)` 即正常。

## 常见问题

- **`journalctl` 占满磁盘**：用 `--vacuum-size` 限制大小，或调整 `/etc/systemd/journald.conf` 的 `SystemMaxUse`。
- **`is-system-running` 显示 degraded**：`systemctl --failed` 列出失败服务，逐个排查。
- **dmesg 没权限**：root 直接 `dmesg`；非 root 需在 `video`/`systemd-journal` 组或用 `sudo`。

## 相关文档

- [开机自启动配置](./06_self_start.md)
- [存储与磁盘管理](./12_storage.md)
- [Linux 命令：dmesg](../09_Appendix/linux-command-manual/dmesg.md)
- [Linux 命令：systemctl 相关](../09_Appendix/linux-command-manual/ps.md)
