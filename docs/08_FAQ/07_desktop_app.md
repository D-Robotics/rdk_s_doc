---
sidebar_position: 7
title: "6.7 桌面应用"
description: RDK 桌面版第三方应用常见问题与解决方案
---

# 6.7 桌面应用

本节解答在 RDK 桌面版使用第三方应用时遇到的常见问题。

> 桌面显示/音频/屏幕休眠配置见 [2.9 显示配置](/System_configuration/display_config)、[2.10 音频配置](/System_configuration/audio_output)、[2.11 屏幕休眠与电源管理](/System_configuration/screen_sleep)。

## VS Code 打不开

Visual Studio Code 使用的 Electron shell 在处理 GPU 硬件加速时可能存在问题，导致界面空白或无法打开。

**解决方案：** 禁用 GPU 加速启动：

```bash
code --disable-gpu
```

参考：[VS Code 官方 FAQ](https://code.visualstudio.com/docs/supporting/faq#_vs-code-is-blank)

## 切换系统语言后无法登录桌面

在 Settings 中切换系统语言并重启桌面会话后，可能出现输入正确密码也无法登录的情况。

**解决方案：**

1. 打开 Settings → Region & Language，选择目标语言。
2. 点击 restart（仅重启桌面会话，不重启设备）。
3. 在锁屏界面输入密码登录。
4. 若仍无法登录，`reboot` 重启设备即可完成切换。

:::info 注意
建议暂不使用系统语言切换功能。如需使用，按上述步骤操作，遇到问题重启设备即可。
:::

## 屏幕分辨率不正确

HDMI 显示器分辨率可通过 config.txt 配置，见 [2.5.3 常用配置项参考](/System_configuration/config_txt/common_options) 的显示选项部分。

也可通过桌面 Settings → Displays 调整。

## HDMI 无显示输出

1. 确认 HDMI 线缆连接牢固。
2. 确认显示器电源已开且输入源选择 HDMI。
3. 确认电源指示灯亮（系统已启动）。
4. 系统首次启动约 45 秒配置时间，等待后应出现桌面。
5. 若长时间（2 分钟以上）无显示，通过串口调试，见 [2.16 调试串口](/System_configuration/debug_serial)。

## 桌面卡顿

- 检查 CPU 占用：`top`（见 [7.2.18 top 命令](/Appendix/linux-command-manual/top)）。
- 检查 BPU 占用：`hrut_ps`（见 [7.1.3 hrut_ps](/Appendix/rdk-command-manual/hrut_ps)）。
- 关闭不必要的后台服务。
- 降低桌面特效：Settings → Appearance → 关闭动画。

## 相关文档

- [2.9 显示配置](/System_configuration/display_config)
- [2.10 音频配置](/System_configuration/audio_output)
- [2.11 屏幕休眠与电源管理](/System_configuration/screen_sleep)
- [2.5.3 常用配置项参考](/System_configuration/config_txt/common_options)
- [2.16 调试串口](/System_configuration/debug_serial)
