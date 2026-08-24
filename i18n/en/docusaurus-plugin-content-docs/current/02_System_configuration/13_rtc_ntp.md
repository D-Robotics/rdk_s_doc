---
title: "Clock and RTC Synchronization"
sidebar_position: 13
description: "System time, RTC hardware clock, and NTP time synchronization"
---

# Clock and RTC Synchronization

The board's time comes from three sources: the system clock (kernel), the RTC hardware clock (maintained across power loss), and NTP (network time synchronization). Under normal conditions, NTP synchronizes the system clock, and the system clock is periodically written to the RTC.

## Check Time Status

```bash
timedatectl
```

Measured on RDK S600:

```text
               Local time: Tue 2026-08-11 23:56:11 CST
           Universal time: Tue 2026-08-11 15:56:11 UTC
                 RTC time: Thu 1970-01-01 03:05:23
                Time zone: Asia/Shanghai (CST, +0800)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

- `System clock synchronized: yes` + `NTP service: active`: NTP has synchronized the system clock.
- `RTC time` shows 1970: no real time has been written to the RTC (on this board the RTC is not aligned, and the system clock is maintained via NTP). Without NTP after a power loss, the system clock falls back to the RTC time.

## Set Timezone

```bash
sudo timedatectl set-timezone Asia/Shanghai    # Change timezone
timedatectl list-timezones | grep Asia          # List available timezones
```

## NTP Time Synchronization

```bash
# Enable/disable NTP
sudo timedatectl set-ntp true
sudo timedatectl set-ntp false
```

When NTP is enabled, the system automatically synchronizes from network time servers.

## RTC Hardware Clock

```bash
# Read the RTC
sudo hwclock --show

# Write the system clock to the RTC
sudo hwclock --systohc
```

Measured on RDK S600 (no real time written to the RTC, and an empty line in `/etc/adjtime` causes warnings):

```text
# hwclock --show
hwclock: Warning: unrecognized line in adjtime file:
hwclock: Warning: unrecognized line in adjtime file:
1970-01-01 15:44:24.417387+08:00
```

:::tip
If the board has no network across power loss but must keep time, make sure the RTC has battery power and that a real time has been written with `hwclock --systohc`.
:::

## FAQ

- **System time falls back to 1970 after power loss**: No real time has been written to the RTC. After connecting to the network, run `sudo hwclock --systohc` to write it.
- **NTP not taking effect**: Confirm that the network is reachable and that `set-ntp true` is enabled; check `systemctl status systemd-timesyncd`.
- **`hwclock` reports adjtime warnings**: The `/etc/adjtime` format is abnormal; rebuild it as suggested or ignore the warnings (main functionality is unaffected).

## Verification

- System clock: in `timedatectl`, `System clock synchronized: yes` + `NTP service: active` means NTP is synchronized.
- Time zone: `Time zone` in `timedatectl` shows the target time zone (such as `Asia/Shanghai`).
- RTC write: `sudo hwclock --show` reading the real time means the write succeeded (the board's RTC defaults to 1970; run `sudo hwclock --systohc` first to write it).

## Related Documentation

- [RTC Debugging Guide (Advanced)](../07_Advanced_development/04_driver_development/14_driver_rtc.md)
- [System Log Viewing](./15_system_log.md)
