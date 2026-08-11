---
title: 显示配置
sidebar_position: 9
description: HDMI/DP 显示器连接、分辨率、多屏
---

# 2.9 显示配置

RDK 板卡通过 HDMI/DP 接口接显示器。桌面版（Desktop）开箱即显示图形桌面，Server 版可配置控制台分辨率。

:::info 说明
本板为 headless（未接显示器），本节命令未在板端实测；以桌面版镜像行为为准。
:::

## 连接显示器

- 用 HDMI/DP 线连接板卡与显示器，上电后桌面版自动输出。
- 支持分辨率取决于板卡与显示器 EDID 协商结果。

## 查看与设置分辨率

```bash
# 列出已连接显示器与支持分辨率
xrandr                    # 桌面版

# 设置分辨率（示例）
xrandr --output HDMI-1 --mode 1920x1080 --rate 60
```

Server 版控制台分辨率在 `/boot/boot.scr` 或 `config.txt`（见 [config.txt](./05_config_txt/01_usage.md)）里配置 `video=` 参数。

## 多屏

`xrandr` 列出所有输出，可设主屏与扩展屏：

```bash
xrandr --output HDMI-1 --primary --output HDMI-2 --right-of HDMI-1
```

## 旋转

```bash
xrandr --output HDMI-1 --rotate left    # left/right/normal/inverted
```

## 常见问题

- **无显示**：确认线材与接口、显示器输入源；Server 版默认无图形桌面，需接桌面版镜像或装 `xorg`。
- **分辨率不对**：`xrandr` 看支持列表，选 EDID 报告的模式。
- **花屏/闪屏**：换合规 HDMI 线，确认刷新率。

## 相关文档

- [config.txt 配置](./05_config_txt/01_usage.md)
- [屏幕休眠与电源管理](./11_screen_sleep.md)
- [音频配置](./10_audio_output.md)
