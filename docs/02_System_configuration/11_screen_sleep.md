---
title: "2.11 屏幕休眠与电源管理"
sidebar_position: 11
description: 桌面/控制台屏幕休眠与电源管理
---

# 2.11 屏幕休眠与电源管理

关闭屏幕休眠可避免演示/产测时屏幕变黑；电源管理涉及散热策略与功耗模式。

:::info 说明
本板为 headless，本节命令未在板端实测；以桌面版镜像行为为准。
:::

## 桌面版关闭休眠

桌面环境（GNOME 等）默认若干分钟无操作后息屏。临时关闭：

```bash
# 禁用自动息屏与挂起
gsettings set org.gnome.desktop.session idle-delay 0
gsettings set org.gnome.desktop.session sleep-inactive-ac-timeout 0
systemctl mask sleep.target suspend.target
```

或用 `xset`（X11）：

```bash
xset s off          # 关屏保
xset -dpms          # 关 DPMS（电源管理）
xset s noblank
```

## 控制台息屏

内核控制台默认 10 分钟后黑屏，关闭：

```bash
# 临时
echo 0 > /sys/class/graphics/fb0/blank        # 或 setterm --blank 0
# 永久（grub/bootopts 加 consoleblank=0）
```

## 持久化

把上述命令写入开机脚本（见 [开机自启动配置](./06_self_start.md)）或 `~/.config/autostart/` 使重启仍生效。

## 功耗与散热

Thermal 与 CPU 频率策略见 [Thermal 和 CPU 频率管理](./08_frequency_management.md)；低功耗模式见进阶 [低功耗模式调试指南](../07_Advanced_development/03_system_software/10_driver_lowpower.md)。

## 常见问题

- **桌面仍息屏**：确认 gsettings 生效；Wayland 下需用对应的 org.gnome.* 设置。
- **控制台仍黑屏**：`consoleblank=0` 是否进了内核命令行（`cat /proc/cmdline`）。

## 相关文档

- [显示配置](./09_display_config.md)
- [Thermal 和 CPU 频率管理](./08_frequency_management.md)
- [开机自启动配置](./06_self_start.md)
