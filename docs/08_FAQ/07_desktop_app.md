---
sidebar_position: 7
---
# 8.7 桌面应用

本节主要解答在桌面使用第三方应用遇到的问题。

<!-- ```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
``` -->

### Q1: 下载 Visual Studio Code 应用打不开？

<!-- <Tabs groupId="accessory">
<TabItem value="rdk_s600" label="rdk_s600"> -->

**A:**
* **使用命令行打开：** Visual Studio Code 使用的 Electron shell 在处理某些 GPU（图形处理单元）硬件加速时存在问题，您可以尝试在启动 VS Code 时通过添加 Electron --disable-gpu 命令行开关来禁用 GPU 加速（https://code.visualstudio.com/docs/supporting/faq#_vs-code-is-blank）：
```bash
    code --disable-gpu
```
<!-- </TabItem>
</Tabs> -->

### Q2: RDKS100 安装 NoMachine 后 GNOME Wayland 会话无法启动，系统回退到 X11 会话？

问题描述：RDKS100 设备安装 NoMachine 后，原本默认的 Wayland 会话无法启动，登录桌面后仅运行在 X11 模式下。

解决方案：升级 NoMachine 至最新版本（使用的版本为9.3.7）后，Wayland 会话可以正常启动，远程连接功能恢复正常。

确认当前会话类型：
可通过以下两种方式查看当前使用的显示协议

1、在桌面终端执行下面命令可以查看，输出内容为会话模式，Wayland模式会输出Wayland
```bash
    echo $XDG_SESSION_TYPE
```
2、打开桌面的 `settings` 应用，选择 `about`，在 `Windowing System` 一栏可查看当前会话模式（Wayland 或 X11）

手动切换回 Wayland 会话：若启动后发现会话模式为 X11，可执行以下命令切换至 Wayland
```bash
    systemctl restart gdm
```

## 已知问题

1、切换语言问题会遇到下面问题
:::info 注意
建议先不使用此功能，若使用，请参考下面步骤解决。
:::

问题描述：在"Settings"中切换系统语言并重启后，出现输入正确密码也无法登录桌面的情况。

步骤：打开 Settings 应用，导航至 Region & Language，选择目标语言，出现restart按钮（此restart只重启桌面会话，不会重启设备），在锁屏界面输入密码。

解决方案：若在步骤中遇到输入密码正确无法登录的问题，设备重新上电或reboot重启设备即可完成切换。
