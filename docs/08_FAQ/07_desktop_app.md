---
sidebar_position: 7
title: "桌面应用"
description: "RDK 桌面版第三方应用的桌面显示、桌面性能、输入与语言、应用兼容常见问题"
---

# 桌面应用

本节解答在 RDK 桌面版使用第三方应用时的常见问题，按桌面显示、桌面性能、输入与语言、应用兼容分组。本文适用于 RDK S100 与 RDK S600 的桌面版系统。

:::info 说明
桌面显示、音频与屏幕休眠的配置项见 [显示配置](/System_configuration/display_config)、[音频配置](/System_configuration/audio_output)、[屏幕休眠与电源管理](/System_configuration/screen_sleep)。
:::

## 桌面显示

### 屏幕分辨率不正确

**原因**：HDMI 输出分辨率未按显示器支持的模式配置。

**解决**：可在桌面 Settings → Displays 中调整，也可以通过 srpi-config 的 Display Options 配置（见 [srpi-config 工具配置](/System_configuration/srpi_config/overview)）。

### HDMI 无显示输出

**原因**：HDMI 线缆接触不良、显示器电源未开或输入源选择错误，或系统首次启动尚未完成配置。

**解决**：按以下顺序排查：

1. 确认 HDMI 线缆连接牢固。
2. 确认显示器电源已开且输入源选择 HDMI。
3. 确认电源指示灯亮（系统已启动）。
4. 系统首次启动约 45 秒配置时间，等待后应出现桌面。
5. 若长时间（2 分钟以上）无显示，通过串口调试，见 [调试串口](/System_configuration/debug_serial)。

## 桌面性能

### 桌面卡顿

**原因**：CPU 或 BPU 占用过高、后台服务过多，或桌面特效开销较大。

**解决**：

- 检查 CPU 占用：`top`（见 [top 命令](/Appendix/linux-command-manual/top)）。
- 检查 BPU 占用：`hrut_ps`（见 [hrut_ps](/Appendix/rdk-command-manual/hrut_ps)）。
- 关闭不必要的后台服务。
- 降低桌面特效：Settings → Appearance → 关闭动画。

## 输入与语言

### 切换系统语言后无法登录桌面

**原因**：在 Settings 中切换系统语言并重启桌面会话后，语言切换可能未正常完成，导致输入正确密码也无法登录。

**解决**：

1. 打开 Settings → Region & Language，选择目标语言。
2. 点击 restart（仅重启桌面会话，不重启设备）。
3. 在锁屏界面输入密码登录。
4. 若仍无法登录，执行 `reboot` 重启设备即可完成切换。

:::note 注意
建议暂不使用系统语言切换功能。如需使用，请按上述步骤操作，遇到问题重启设备即可。
:::

## 应用兼容

### VS Code 打不开

**原因**：Visual Studio Code 使用的 Electron shell 在处理 GPU 硬件加速时可能存在问题，导致界面空白或无法打开。

**解决**：禁用 GPU 加速后启动：

```bash
code --disable-gpu
```

参考 [VS Code 官方 FAQ](https://code.visualstudio.com/docs/supporting/faq#_vs-code-is-blank)。

## 相关文档

- [显示配置](/System_configuration/display_config)
- [音频配置](/System_configuration/audio_output)
- [屏幕休眠与电源管理](/System_configuration/screen_sleep)
- [调试串口](/System_configuration/debug_serial)
