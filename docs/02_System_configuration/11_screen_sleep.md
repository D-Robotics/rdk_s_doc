---
title: "屏幕休眠与电源管理"
sidebar_position: 11
description: "桌面/控制台屏幕休眠与电源管理"
---

# 屏幕休眠与电源管理

关闭屏幕休眠可避免演示/产测时屏幕变黑；电源管理涉及散热策略与功耗模式。

## 桌面版关闭休眠

GNOME 桌面默认无操作 5 分钟后息屏。查看当前设置：

```bash
gsettings get org.gnome.desktop.session idle-delay
```

RDK S600 实测：

```text
$ gsettings get org.gnome.desktop.session idle-delay
uint32 300
```

`300` 即 300 秒（5 分钟）。临时关闭自动息屏与挂起：

```bash
# 关闭自动息屏
gsettings set org.gnome.desktop.session idle-delay 0
# 关闭交流供电下的自动挂起（该 key 属于 power 插件）
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 0
systemctl mask sleep.target suspend.target
```

或用 `xset`（X11 会话；Wayland 会话不适用，请用上面的 gsettings）：

```bash
xset s off          # 关屏保
xset -dpms          # 关 DPMS（电源管理）
xset s noblank
```

## 控制台息屏

内核帧缓冲控制台默认 10 分钟后黑屏，关闭：

```bash
# 临时关闭息屏
setterm --blank 0
```

永久关闭需在内核命令行加 `consoleblank=0`，方法见 [config.txt 配置](./05_config_txt/01_usage.md)。

RDK S600 板默认走串口控制台（`cat /proc/cmdline` 中 `console=ttyS0`），无帧缓冲控制台，无需处理息屏；接显示器的桌面环境按上一节配置。

## 持久化

把上述命令写入开机脚本（见 [开机自启动配置](./06_self_start.md)）或 `~/.config/autostart/` 使重启仍生效。

## 功耗与散热

Thermal 与 CPU 频率策略见 [Thermal 和 CPU 频率管理](./08_frequency_management.md)；低功耗模式见进阶 [低功耗模式调试指南](../07_Advanced_development/03_system_software/13_driver_lowpower.md)。

## 常见问题

- **桌面仍息屏**：确认 gsettings 生效；Wayland 下需用对应的 org.gnome.* 设置。
- **控制台仍黑屏**：`consoleblank=0` 是否进了内核命令行（`cat /proc/cmdline`）。

## 相关文档

- [显示配置](./09_display_config.md)
- [Thermal 和 CPU 频率管理](./08_frequency_management.md)
- [开机自启动配置](./06_self_start.md)
