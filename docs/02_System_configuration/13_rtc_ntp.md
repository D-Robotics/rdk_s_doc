---
title: "时钟与 RTC 同步"
sidebar_position: 13
description: "系统时间、RTC 硬件时钟与 NTP 授时"
---

# 时钟与 RTC 同步

板端时间来自三处：系统时钟（内核）、RTC 硬件时钟（断电维持）、NTP（网络授时）。正常情况 NTP 同步系统时钟，系统时钟定期写入 RTC。

## 查看时间状态

```bash
timedatectl
```

RDK S600 实测：

```text
               Local time: Tue 2026-08-11 23:56:11 CST
           Universal time: Tue 2026-08-11 15:56:11 UTC
                 RTC time: Thu 1970-01-01 03:05:23
                Time zone: Asia/Shanghai (CST, +0800)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

- `System clock synchronized: yes` + `NTP service: active`：NTP 已同步系统时钟。
- `RTC time` 显示 1970：RTC 未写入真实时间（本板 RTC 未对齐，靠 NTP 维持系统时钟）。断电后若无 NTP，系统时钟会回到 RTC 的时间。

## 设置时区

```bash
sudo timedatectl set-timezone Asia/Shanghai    # 改时区
timedatectl list-timezones | grep Asia          # 查可用时区
```

## NTP 授时

```bash
# 开/关 NTP
sudo timedatectl set-ntp true
sudo timedatectl set-ntp false
```

NTP 开启后系统自动从网络授时服务器同步。

## RTC 硬件时钟

```bash
# 读 RTC
sudo hwclock --show

# 把系统时钟写入 RTC
sudo hwclock --systohc
```

RDK S600 实测（RTC 未写入真实时间，且 `/etc/adjtime` 有空行导致警告）：

```text
# hwclock --show
hwclock: Warning: unrecognized line in adjtime file:
hwclock: Warning: unrecognized line in adjtime file:
1970-01-01 15:44:24.417387+08:00
```

:::tip
断电场景下若板子无网络、又需保持时间，需确保 RTC 有电池供电、且已 `hwclock --systohc` 写入过真实时间。
:::

## 常见问题

- **断电后系统时间回到 1970**：RTC 未写真实时间。联网后执行 `sudo hwclock --systohc` 写入。
- **NTP 不生效**：确认网络可达、`set-ntp true` 已开；看 `systemctl status systemd-timesyncd`。
- **`hwclock` 报 adjtime 警告**：`/etc/adjtime` 格式异常，按提示重建或忽略（不影响主功能）。

## 相关文档

- [RTC 调试指南（进阶）](../07_Advanced_development/04_driver_development/17_driver_rtc.md)
- [系统日志查看](./15_system_log.md)
