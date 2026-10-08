---
sidebar_position: 4
title: "入门配置"
description: "入门配置：账户、Wi-Fi、SSH、中文环境、RDK Studio、NoMachine"
---

# 入门配置

本节介绍烧录系统并完成登录后的首次基础配置，包括连接网络、启用 SSH、设置中文环境、安装远程桌面等，使开发板进入可用状态。

> 前置章节：[系统烧录](./01_instruction.md)、[系统状态查询](./03_system_status.md)、[远程登录](./05_remote_login.md)。

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 前置条件

- [ ] 开发板已 [烧录系统](./01_instruction.md) 并完成启动。
- [ ] 已通过串口或 SSH 登录开发板（登录方法见 [远程登录](./05_remote_login.md)）。
- [ ] 配置无线网络前，已安装 M.2 Key E Wi-Fi & 蓝牙模组。

## 默认登录账户

系统提供以下两个默认账户：

- **普通用户**：用户名 `sunrise`，密码 `sunrise`
- **root 用户**：用户名 `root`，密码 `root`

> 默认账号与网络默认 IP 的权威定义见 [网络配置](../../02_System_configuration/01_network_config.md)。

## 连接 Wi-Fi

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

<DocScope products="RDK S100">

在 Ubuntu 22.04 桌面中，点击左下角图标进入 Settings。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-WIFI-1.png" alt="S100 Wi-Fi 连接示意图 1" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

在左侧栏选择 Wi-Fi 并打开开关，从 Visible Networks 中选择目标热点。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-WIFI-2.png" alt="S100 Wi-Fi 连接示意图 2" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

输入密码并点击 Connect 完成连接。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-WIFI-3.png" alt="S100 Wi-Fi 连接示意图 3" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

在 Ubuntu 24.04 桌面中，点击左下角图标进入 Settings。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-WIFI-1.png" alt="S600 Wi-Fi 连接示意图 1" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

在左侧栏选择 Wi-Fi 并打开开关，从 Visible Networks 中选择目标热点。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-WIFI-2.png" alt="S600 Wi-Fi 连接示意图 2" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

输入密码并点击 Connect 完成连接。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-WIFI-3.png" alt="S600 Wi-Fi 连接示意图 3" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

</TabItem>

<TabItem value="server" label="Server">

通过串口或 SSH 执行以下命令连接：

```bash
# 扫描 Wi-Fi 网络
sudo nmcli device wifi rescan
sudo nmcli device wifi list       # 列出找到的 Wi-Fi
sudo wifi_connect "SSID" "PASSWD" # 连接指定 Wi-Fi
```

连接成功后输出如下信息，末尾 UUID 为本次连接的唯一标识：

```text
root@ubuntu:~# sudo wifi_connect "WiFi-Test" "12345678"
Device 'wlan0' successfully activated with 'd7468833-4195-45aa-aa33-3d43da86e1a7'.
```

使用 `ifconfig` 查看 Wi-Fi IP 地址。

若报错 `Error: No network with SSID 'WiFi-Test' found.`，表示未找到热点，先执行 `sudo nmcli device wifi rescan` 重新扫描；若报错 `Error: Scanning not allowed immediately following previous scan.`，表示扫描过于频繁，稍后重试。

</TabItem>
</Tabs>

## 启用 SSH 服务

系统默认启用 SSH 服务，可按以下方式开启或关闭。

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

<DocScope products="RDK S100">

在 Ubuntu 22.04 桌面中按以下步骤开启或关闭 SSH 服务：

1. 点击左下角图标，选择 RDK Configuration 进入系统设置。

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-1.png" alt="S100 SSH 操作示意图 1" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

2. 选择 `Interface Options`。

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-2.png" alt="S100 SSH 操作示意图 2" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

3. 选择 `I1 SSH`。

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-3.png" alt="S100 SSH 操作示意图 3" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

4. 开启 SSH：选择 `Yes`。

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-4.png" alt="S100 SSH 操作示意图 4" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-5.png" alt="S100 SSH 操作示意图 5" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

5. 关闭 SSH：选择 `No`。

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-6.png" alt="S100 SSH 操作示意图 6" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-7.png" alt="S100 SSH 操作示意图 7" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

在 Ubuntu 24.04 桌面中按以下步骤开启或关闭 SSH 服务：

1. 点击左下角图标，选择 RDK Configuration 进入系统设置。

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-1.png" alt="S600 SSH 操作示意图 1" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

2. 选择 `Interface Options`。

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-2.png" alt="S600 SSH 操作示意图 2" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

3. 选择 `I1 SSH`。

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-3.png" alt="S600 SSH 操作示意图 3" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

4. 开启 SSH：选择 `Yes`。

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-4.png" alt="S600 SSH 操作示意图 4" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-5.png" alt="S600 SSH 操作示意图 5" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

5. 关闭 SSH：选择 `No`。

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-6.png" alt="S600 SSH 操作示意图 6" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-7.png" alt="S600 SSH 操作示意图 7" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

</TabItem>

<TabItem value="server" label="Server">

1. 在终端运行 `srpi-config` 配置工具：

```bash
sudo srpi-config
```
2. 选择 `Interface Options`。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/ssh-server-1.png" alt="srpi-config 配置 SSH 示意图 1" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

3. 选择 `I1 SSH`。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/ssh-server-2.png" alt="srpi-config 配置 SSH 示意图 2" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

4. 开启 SSH：选择 `Yes`。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/ssh-server-3.png" alt="srpi-config 配置 SSH 示意图 3" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

5. 关闭 SSH：选择 `No`。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/ssh-server-5.png" alt="srpi-config 配置 SSH 示意图 4" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />


</TabItem>

</Tabs>

SSH 使用方法见 [远程登录 - SSH 登录](./05_remote_login.md#ssh)。

## 设置登录模式

### 字符终端自动登录

修改 serial-getty 服务文件可以设置免密登陆，操作如下：

1. 打开 `serial-getty@ttyS0.service`。

```bash
# root 用户登录
vi /usr/lib/systemd/system/serial-getty@ttyS0.service

# sunrise 用户登录
sudo vi /usr/lib/systemd/system/serial-getty@ttyS0.service
```

2.  将 `ExecStart=-/sbin/agetty` 所在行修改为（以 root 自动登录为例）:

```text
ExecStart=-/sbin/agetty --autologin root -o '-p -- \\u' --keep-baud 921600,115200,57600,38400,9600 - $TERM
```

**参数解释**： `--autologin root` 用于指定自动登录的用户名（也可写作 `-a root`）。

3. 重启后用户将自动登录。

<!-- ### 图形化终端自动登录

待更新 -->

## 设置中文环境

1. 安装语言包：

```bash
sudo apt install language-pack-zh-hans language-pack-zh-hans-base fonts-wqy-microhei
```

- `language-pack-zh-hans`：中文界面翻译文件。
- `language-pack-zh-hans-base`：基础中文语言支持。
- `fonts-wqy-microhei`：中文字体。

2. 编辑语言配置文件：

```bash
sudo vi /etc/default/locale
```

添加或修改为以下内容：

```text
LANG=zh_CN.UTF-8
LANGUAGE=zh_CN:zh
LC_ALL=zh_CN.UTF-8
```

3. 更新配置：

```bash
fc-cache -fv
source /etc/default/locale
```

## 设置中文输入法

:::note
本节适用于 Desktop 镜像。Server 镜像无图形桌面，不涉及输入法。
:::

系统已预装 IBus 及中文输入引擎（libpinyin 等），但默认未将中文输入法加入桌面输入源列表，需手动添加后方可切换。

**添加中文输入源**

- 图形界面：进入 设置 → 键盘 → 输入源，点击 +，选择 中文（中国） → Intelligent Pinyin 添加。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/input-1.png" alt="中文输入法配置示意图 1" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/input-2.png" alt="中文输入法配置示意图 2" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/input-3.png" alt="中文输入法配置示意图 3" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

- 命令行（在桌面终端以当前用户执行）：

```bash
gsettings set org.gnome.desktop.input-sources sources "[('xkb', 'us'), ('ibus', 'libpinyin')]"
```

:::warning
上述命令会覆盖现有输入源列表。如已自定义其他键盘布局，请在列表中一并保留。
:::

添加完成后，按 `Super（Windows 键）` + `Space` 在中英文输入法之间切换。切到中文后即可在终端、文本编辑器等应用中输入汉字。


## 设置 RDK Studio

RDK Studio 是面向机器人开发的智能原生桌面工作台，将 Moss 对话、项目工作区、设备连接、远程开发、烧录、本地模型与板端 Agent 集成于同一窗口。

使用方法见 [RDK Studio 用户手册](https://developer.d-robotics.cc/rdk_studio_doc/category/1-product-intro)。

## NoMachine 配置

NoMachine 未提供 apt 源，需从官网获取 `.deb` 安装包。

官方下载页：[NoMachine Download](https://downloads.nomachine.com/download/?id=30&platform=linux&distro=arm)

**下载安装包**

在官网选择 ARM64 版本安装包，点击 Download。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/image_s100_nomachine_dl.PNG" alt="NoMachine 下载示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

**安装**

```bash
sudo apt update && sudo apt upgrade -y   # 更新已安装软件
sudo dpkg -i nomachine_*_arm64.deb
```

**配置启动**

1. 启动 NoMachine 服务：

    ```bash
    sudo systemctl start nxserver
    ```

2. 设置开机自启：

    ```bash
    sudo systemctl enable nxserver
    ```

3. 启用 EGL Capture（改善特定显示服务器下的远程桌面体验）：

    ```bash
    sudo /etc/NX/nxserver --eglcapture yes
    ```

    该命令重启后生效，可用以下命令验证，输出 `EGL Capture has been enabled` 表示已写入配置：

    ```bash
    if [ -f "/usr/lib/systemd/user/org.gnome.Shell@wayland.service" ] && grep -q "nxpreload.sh" "/usr/lib/systemd/user/org.gnome.Shell@wayland.service" && [ -f "/usr/share/applications/org.gnome.Shell.desktop" ] && grep -q "nxpreload.sh" "/usr/share/applications/org.gnome.Shell.desktop" && [ -f "/usr/NX/etc/node.cfg" ] && grep -q "EnableEGLCapture 1" "/usr/NX/etc/node.cfg"; then echo "EGL Capture has been enabled"; else echo "Not enabled"; fi
    ```

4. 重启 NoMachine 服务：

    ```bash
    sudo systemctl restart nxserver
    ```

**重启**

重启板卡。

:::warning
受 NXServer 配置影响，完成上述操作后直接连接会出现黑屏，必须重启板卡后方可使用。
:::

NoMachine 使用方法见 [远程登录 - NoMachine 登录](./05_remote_login.md#nomachine-登录)。

## 用户管理

### 修改用户名

以将 `sunrise` 重命名为 `usertest` 为例。操作须以 root 或其他管理员用户登录执行，不可在被改名的用户会话内进行（`pkill` 会终止该用户全部进程，包括当前登录会话）。

1. 终止 `sunrise` 的所有进程，避免占用导致改名失败：

```bash
sudo pkill -u sunrise
```

2. 重命名用户及同名用户组：

```bash
sudo usermod -l usertest sunrise
```

3. 迁移家目录至 `/home/usertest`：

```bash
sudo usermod -d /home/usertest -m usertest
```

4. 设置新用户密码：

```bash
sudo passwd usertest
```

5. 若已开启桌面自动登录，同步更新配置中的用户名，否则开机自动登录仍指向已不存在的 `sunrise` 而失效：

- gdm（默认桌面服务）：编辑 `/etc/gdm3/custom.conf`，将 `AutomaticLogin = sunrise` 改为 `AutomaticLogin = usertest`。
- lightdm（旧版桌面服务，如使用）：编辑 `/etc/lightdm/lightdm.conf.d/22-hobot-autologin.conf`，将 `autologin-user=sunrise` 改为 `autologin-user=usertest`。

### 新增用户

以新增用户 `usertest` 为例。`-G` 指定的附加组涵盖 `sudo`、音视频及 RDK 硬件访问权限（GPIO、I2C、VPU、JPU、IPU、VPS 等），使新用户具备与 `sunrise` 一致的设备访问能力：

```bash
sudo useradd -U -m -d /home/usertest -k /etc/skel/ -s /bin/bash -G disk,kmem,dialout,sudo,audio,video,render,i2c,lightdm,vpu,gdm,weston-launch,graphics,jpu,ipu,vps,misc,gpio usertest
sudo passwd usertest
sudo cp -aRf /etc/skel/. /home/usertest
sudo chown -R usertest:usertest /home/usertest
```

如需让新用户开机自动登录，参考上文「设置登录模式」配置。

## 常见问题

- **Wi-Fi 扫描不到网络**：确认 Wi-Fi 模组已安装（M.2 Key E 接口），使用 `nmcli device` 查看设备状态。
- **SSH 连接被拒绝**：执行 `sudo systemctl status ssh` 确认服务状态，检查防火墙 `sudo ufw status`。
- **中文环境切换后无法登录桌面**：见 [桌面应用](../../08_FAQ/07_desktop_app.md)。
- **NoMachine 黑屏**：配置完成后必须重启板卡才生效。

## 相关文档

- [系统烧录](./01_instruction.md)
- [系统状态查询](./03_system_status.md)
- [远程登录](./05_remote_login.md)
- [网络配置](../../02_System_configuration/01_network_config.md)
- [srpi-config 工具配置](../../02_System_configuration/04_srpi_config/01_overview.md)
- [桌面应用](../../08_FAQ/07_desktop_app.md)
