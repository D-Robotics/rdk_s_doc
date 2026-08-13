---
title: "2.10 音频配置"
sidebar_position: 10
description: "音频输出设备选择与基础控制"
---

# 2.10 音频配置

RDK 板卡音频可从 3.5mm 耳机口、HDMI 或 USB 声卡输出。通过桌面设置或命令行选择输出设备、调节音量。

:::info 说明
本板为 headless（无音频输出设备，`aplay -l` 为空），本节命令未在板端实测；以接好音频设备的板子为准。
:::

## 查看音频设备

```bash
aplay -l                  # 列出回放设备
amixer scontrols          # 列出可调音量控件
```

接好音频设备后，`aplay -l` 会列出 `hw:0,0` 之类的 card/device。

## 选择输出设备

桌面版在「设置 → 声音」里选输出设备。命令行：

```bash
# 列出当前默认设备
pactl info | grep "Default Sink"

# 设置默认输出（示例）
pactl set-default-sink alsa_output.pci-0000_00_01.0
```

无 PulseAudio 时直接用 ALSA：

```bash
aplay -D hw:0,0 test.wav     # 指定设备播放
```

## 音量控制

```bash
amixer set Master 50%        # 设主音量 50%
amixer set Master unmute     # 取消静音
alsamixer                    # 交互式调音台
```

## 播放测试

```bash
speaker-test -t sine -f 440 -l 1   # 播 1 秒正弦测试音
aplay /app/res/assets/chi_sound.wav
```

## 常见问题

- **无声**：`aplay -l` 是否列出设备；输出是否被静音（`amixer`）；HDMI 音频需选 HDMI sink。
- **USB 声卡不识别**：`lsusb` 确认，`dmesg` 查驱动加载。
- **杂音/爆音**：降采样率，确认 buffer/period 设置。

## 相关文档

- [显示配置](./09_display_config.md)
- [蓝牙配置](./02_bluetooth_config.md)
- [软件包管理 apt](./03_system_update/01_apt_usage.md)
