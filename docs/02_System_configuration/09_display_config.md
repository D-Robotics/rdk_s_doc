---
title: "显示配置"
sidebar_position: 9
description: "HDMI/DP 显示器连接、分辨率、多屏"
---

# 显示配置

RDK 板卡通过 HDMI/DP 接口接显示器。桌面版（Desktop）开箱即显示图形桌面，Server 版可配置控制台分辨率。

:::info 说明
RDK OS 桌面版默认运行 GNOME（Wayland 会话）。`xrandr` 是 X11 工具，仅适用于 X11 会话；Wayland 会话下请在「设置 → 显示器」里调整分辨率，或用 `gnome-control-center display` 打开设置。
:::

## 连接显示器

- 用 HDMI/DP 线连接板卡与显示器，上电后桌面版自动输出。
- 支持分辨率取决于板卡与显示器 EDID 协商结果。

## 查看与设置分辨率

### 命令行（X11）

```bash
# 列出已连接显示器与支持分辨率
xrandr

# 设置分辨率（示例）
xrandr --output HDMI-1 --mode 1920x1080 --rate 60
```

### Wayland（GNOME 桌面，默认）

```bash
gnome-control-center display      # 打开「设置 → 显示器」图形界面
```

### 内核 DRM 节点（两种会话通用）

无论 X11 还是 Wayland，都可通过内核 DRM 节点查看显示器连接状态与支持的模式：

```bash
cat /sys/class/drm/card0-HDMI-A-1/status    # connected / disconnected
cat /sys/class/drm/card0-HDMI-A-1/modes     # 支持的显示模式
```

RDK S600 实测（HDMI-A-1 已连接，输出 1920x1080@60）：

```text
$ cat /sys/class/drm/card0-HDMI-A-1/status
connected
$ cat /sys/class/drm/card0-HDMI-A-1/modes
1920x1080
1680x1050
1280x1024
1440x900
1280x800
1280x720
...
```

Server 版控制台分辨率在 config.txt（见 [config.txt](./05_config_txt/01_usage.md)）里配置 `video=` 参数。

## 多屏

X11 会话用 `xrandr` 列出所有输出，可设主屏与扩展屏：

```bash
xrandr --output HDMI-1 --primary --output HDMI-2 --right-of HDMI-1
```

Wayland 会话请在「设置 → 显示器」里配置多屏布局。

## 旋转

X11 会话用 `xrandr` 旋转输出：

```bash
xrandr --output HDMI-1 --rotate left    # left/right/normal/inverted
```

Wayland 会话请在「设置 → 显示器」里配置旋转方向。

## 常见问题

- **无显示**：确认线材与接口、显示器输入源；Server 版默认无图形桌面，需接桌面版镜像或装 `xorg`。
- **分辨率不对**：X11 用 `xrandr` 看支持列表；Wayland 在「设置 → 显示器」调整，或 `cat /sys/class/drm/card0-HDMI-A-1/modes` 看内核支持的模式，选 EDID 报告的模式。
- **花屏/闪屏**：换合规 HDMI 线，确认刷新率。

## 相关文档

- [config.txt 配置](./05_config_txt/01_usage.md)
- [屏幕休眠与电源管理](./11_screen_sleep.md)
- [音频配置](./10_audio_output.md)
