---
title: "时钟与 RTC 同步"
sidebar_position: 13
description: "系统时间、RTC 硬件时钟与 NTP 授时"
---

# 时钟与 RTC 同步

板端时间涉及三处——系统时钟、RTC（Real-Time Clock，实时时钟）和 NTP（Network Time Protocol，网络时间协议）——默认关系如下：

| 时间来源 | 作用 | 默认行为 |
|---|---|---|
| 系统时钟 | 内核维护，系统实际使用的时间 | 启动时从 RTC 恢复，运行中由 NTP 同步 |
| NTP | 网络授时 | 默认开启（`systemd-timesyncd`），自动同步系统时钟 |
| RTC | 硬件时钟 | 默认不自动写入；出厂不带电池，断电后时间不维持 |

简单说：**NTP 同步系统时钟，系统时钟不会自动回写 RTC**。要让断电后时间不丢，需自备 RTC 电池，并手动把系统时钟写入外置 RTC。

## 系统时间

### 查看系统时间

```bash
timedatectl   # 综合查看系统时间、RTC 时间、时区和 NTP 状态
date          # 查看系统时间
```

输出示例：

```text
               Local time: Tue 2026-09-29 10:47:42 CST
           Universal time: Tue 2026-09-29 02:47:42 UTC
                 RTC time: Tue 2026-09-29 02:47:35
                Time zone: Asia/Shanghai (CST, +0800)
System clock synchronized: no
              NTP service: active
          RTC in local TZ: no
```

- `Local time`：系统时钟（内核维护，日常使用的时间）。
- `Time zone`：当前时区。
- `RTC time`：RTC 硬件时钟。
- `System clock synchronized`：系统时钟是否已由 NTP 同步（`yes` 表示已同步，网络可达时为 `yes`）。
- `NTP service`：NTP 服务是否开启。

### 设置时区

```bash
sudo timedatectl set-timezone Asia/Shanghai    # 改时区
timedatectl list-timezones | grep Asia          # 查可用时区
```

## NTP 授时

NTP 默认开启，由 `systemd-timesyncd` 服务管理，自动从网络授时服务器同步系统时钟。

### 查看状态

```bash
timedatectl                          # 看 NTP service 与 System clock synchronized
systemctl status systemd-timesyncd   # 看同步服务状态
```

### 关闭 / 开启

```bash
sudo timedatectl set-ntp false   # 关闭
sudo timedatectl set-ntp true    # 开启
```

### 主动触发授时

```bash
sudo systemctl restart systemd-timesyncd   # 重启服务，立即重新同步
```

:::note
NTP 只同步系统时钟，不回写 RTC。
:::

## RTC 硬件时钟

板上有两个 RTC：

| RTC | 类型 | 设备节点 | 电池 |
|---|---|---|---|
| rtc0 | 内置 super-rtc | `/dev/rtc0` | 无 |
| rtc1 | 外置 YSN8130E | `/dev/rtc1` | 备用电池（出厂不带） |

`hwclock` 默认操作 `rtc0`，操作外置 RTC（接电池的 `rtc1`）需加 `--rtc /dev/rtc1`。

### 是否自动同步

默认**不**自动同步：板端 `hwclock.service` 被 mask 禁用。

### 手动同步

```bash
# 读内置 RTC（默认 rtc0）
sudo hwclock --show

# 读外置 RTC（rtc1，YSN8130E，接电池）
sudo hwclock --rtc /dev/rtc1 --show

# 把系统时钟写入外置 RTC（接电池的那个）
sudo hwclock --rtc /dev/rtc1 --systohc
```

### 配置自动同步

板端默认无自动同步机制。如需自动同步，可自行创建 systemd 服务与定时器：oneshot 服务将系统时钟写入外置 RTC，timer 周期性触发。以下示例开机 1 分钟后首次执行，此后每 1 小时执行一次：

```bash
# ① 服务：执行一次“系统时钟 → 外置 RTC”的写入
sudo tee /etc/systemd/system/rtc-sync.service <<'EOF'
[Unit]
Description=Sync system clock to external RTC

[Service]
Type=oneshot
ExecStart=/sbin/hwclock --rtc /dev/rtc1 --systohc
EOF

# ② 定时器：开机 1 分钟后触发一次，此后每隔 1 小时触发一次
sudo tee /etc/systemd/system/rtc-sync.timer <<'EOF'
[Unit]
Description=Sync system clock to external RTC periodically

[Timer]
OnBootSec=1min
OnUnitActiveSec=1h

[Install]
WantedBy=timers.target
EOF

# ③ 重载并启用定时器
sudo systemctl daemon-reload
sudo systemctl enable --now rtc-sync.timer
```

执行频率由 timer 的两个参数决定：

- `OnBootSec=1min`：开机后 1 分钟首次触发。
- `OnUnitActiveSec=1h`：每次触发后，间隔 1 小时再次触发。

想改频率就改 `OnUnitActiveSec`，例如 `30min`（半小时）、`1d`（每天）。查看与停用：

```bash
systemctl list-timers rtc-sync.timer        # 查看下次触发时间
sudo systemctl disable --now rtc-sync.timer # 停用并移除
```

## 常见问题

- **断电后系统时间不对**：默认不写 RTC 且出厂不带电池，断电后启动从外置 RTC 恢复的时间是错的（可能是默认值）。联网后 NTP 会纠正；如需断电保时，自备电池并 `sudo hwclock --rtc /dev/rtc1 --systohc` 写入真实时间。
- **NTP 不生效**：确认网络可达、`timedatectl` 中 `NTP service` 为 `active`；看 `systemctl status systemd-timesyncd` 的同步状态。
- **`hwclock` 报 adjtime 警告**：`/etc/adjtime` 格式异常，按提示重建或忽略（不影响主功能）。

## 相关文档

- [RTC 调试指南（进阶）](../07_Advanced_development/04_driver_development/14_driver_rtc.md)
- [系统日志查看](./15_system_log.md)
