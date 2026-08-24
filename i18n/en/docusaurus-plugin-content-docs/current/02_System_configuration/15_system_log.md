---
title: "System Log Viewing"
sidebar_position: 15
description: "Viewing system logs and service status with dmesg/journalctl/systemctl"
---

# System Log Viewing

During troubleshooting, three types of logs are commonly used: kernel logs (`dmesg`), systemd logs (`journalctl`), and service status (`systemctl status`).

## Kernel Logs dmesg

View the kernel ring buffer logs (drivers, hardware, BPU, etc.):

```bash
dmesg | tail -20
```

Measured on RDK S600 (BPU core memory allocation):

```text
[15543.458668] bpu-core: bpu core mem alloc mem addr addr = 0xffff800020860000, 0x4200d00000, 0xff1a00000, 0xffa100000, 0x100000
[15544.414637] bpu-core: bpu core mem alloc mem addr addr = 0xffff800052cd0000, 0x4210e10000, 0xff6000000, 0xffe000000, 0x2000000
```

Filter by level: `dmesg --level=err,warn`. Follow in real time: `dmesg -w`.

## systemd Logs journalctl

`journalctl` shows structured logs of all services (everything since boot):

```bash
journalctl                       # All
journalctl -b                   # Since the current boot
journalctl -u ssh                # A specific service
journalctl -p err                # Only errors and above
journalctl -f                    # Follow in real time
```

Check the disk usage of logs (measured on S600):

```bash
journalctl --disk-usage
# Archived and active journals take up 231.2M in the file system.
```

Clean up old logs (limit to 100M): `journalctl --vacuum-size=100M`.

## Service Status systemctl

```bash
systemctl status ssh             # Check the status of a service
systemctl is-system-running       # Check the overall system state
```

Measured on S600:

```text
$ systemctl is-system-running
degraded

$ systemctl --failed
  UNIT           LOAD   ACTIVE SUB    DESCRIPTION
● apport.service loaded failed failed automatic crash report generation

$ systemctl status ssh
● ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/usr/lib/systemd/system/ssh.service; disabled; preset: enabled)
     Active: active (running) since Fri 2026-08-14 12:04:08 CST; 7h ago
TriggeredBy: ● ssh.socket
```

`degraded` means some service failed to start (`apport.service` in this example); use `systemctl --failed` to identify it. If `ssh` shows `active (running)`, it is normal.

## FAQ

- **`journalctl` fills up the disk**: Limit the size with `--vacuum-size`, or adjust `SystemMaxUse` in `/etc/systemd/journald.conf`.
- **`is-system-running` shows degraded**: List the failed services with `systemctl --failed` and investigate them one by one.
- **No permission for dmesg**: root can run `dmesg` directly; non-root users need to be in the `video`/`systemd-journal` group or use `sudo`.

## Verification

- Kernel logs: `dmesg | tail -20` shows the kernel/driver logs; `dmesg --level=err,warn` shows only errors and warnings.
- systemd logs: `journalctl -b` shows the logs for the current boot; `journalctl -u ssh` shows the logs for a specific service.
- Service status: `systemctl status ssh` showing `Active: active (running)` means it is normal; `systemctl --failed` lists the failed services.

## Related Documentation

- [Boot Auto-Start Configuration](./06_self_start.md)
- [Storage and Disk Management](./12_storage.md)
- [Linux Command: dmesg](../09_Appendix/linux-command-manual/02_dmesg.md)
- [Linux Command: ps (Process Viewing)](../09_Appendix/linux-command-manual/12_ps.md)
