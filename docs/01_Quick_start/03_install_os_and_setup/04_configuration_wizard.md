---
sidebar_position: 4
title: "入门配置"
description: "RDK S100/S600 入门配置：账户、Wi-Fi、SSH、中文环境、RDK Studio、NoMachine"
---

# 入门配置

本节指导你在烧录系统并登录后完成首次基础配置：连接网络、开启 SSH、设置中文环境、安装远程桌面等，让板卡进入可日常使用的状态。

> 烧录见 [系统烧录](./01_instruction.md)，系统状态确认见 [系统状态查询](03_system_status.md)，远程登录见 [远程登录](05_remote_login.md)。

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 前置条件

开始前请准备：

- [ ] 开发板已 [烧录系统](./01_instruction.md) 并完成启动。
- [ ] 已通过串口或 SSH 登录开发板（登录方法见 [远程登录](05_remote_login.md)）。
- [ ] 配置无线网络前：已安装 M.2 Key E Wi-Fi & 蓝牙模组。

## 默认登录账户

在进行系统配置前，您需要先登录系统。

<DocScope products="RDK S100">

RDK S100 系统提供了两个默认账户：

</DocScope>

<DocScope products="RDK S600">

RDK S600 系统提供了两个默认账户：

</DocScope>

- **普通用户**： 用户名 `sunrise`，密码 `sunrise`
- **超级用户（root）**： 用户名 `root`，密码 `root`

## 连接 Wi-Fi

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

<DocScope products="RDK S100">

在 Ubuntu 22.04 桌面环境中，点击桌面右上角 Wi-Fi 图标，选择热点并输入密码完成连接。操作图示见 [网络配置 - 无线网络](../../02_System_configuration/01_network_config.md#无线网络)。

</DocScope>

<DocScope products="RDK S600">

在 Ubuntu 24.04 桌面环境中，点击桌面右上角 Wi-Fi 图标，选择热点并输入密码完成连接。操作图示见 [网络配置 - 无线网络](../../02_System_configuration/01_network_config.md#无线网络)。

</DocScope>

</TabItem>

<TabItem value="server" label="Server">

通过串口或者 SSH，参考下述指令完成连接：

```bash
# 扫描 Wi-Fi 网络
sudo nmcli device wifi rescan
sudo nmcli device wifi list       # 列出找到的 Wi-Fi
sudo wifi_connect "SSID" "PASSWD" # 连接指定 Wi-Fi
```

连接成功后，会输出类似如下信息，末尾的 UUID 为本次连接生成的唯一标识：

```text
root@ubuntu:~# sudo wifi_connect "WiFi-Test" "12345678"
Device 'wlan0' successfully activated with 'd7468833-4195-45aa-aa33-3d43da86e1a7'.
```

之后使用 `ifconfig` 便可获得板卡 Wi-Fi 的 IP 地址。

如果连接时报错 `Error: No network with SSID 'WiFi-Test' found.`，说明未找到该热点，先执行 `sudo nmcli device wifi rescan` 重新扫描后再连接；如果扫描时报错 `Error: Scanning not allowed immediately following previous scan.`，说明扫描过于频繁，稍等片刻后重试。

</TabItem>
</Tabs>

## 开启 SSH 服务

当前系统版本默认开启 SSH 登录服务，用户可以使用本方法开、关 SSH 服务。

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

桌面版同样可打开终端（Terminal），执行下方相同的命令查看与控制 SSH 服务。

</TabItem>

<TabItem value="server" label="Server">

使用 systemctl 命令可以查看 SSH 服务当前的运行状态，命令如下：

```bash
sudo systemctl status ssh
```

执行该命令后，会输出 SSH 服务的详细状态信息。如果服务正在运行，输出中会显示 Active: active (running)；如果服务未运行，则会显示 Active: inactive (dead) 等相关信息。

以下为 SSH 的控制命令：

```bash
sudo systemctl start ssh #开启 SSH 服务
sudo systemctl stop ssh  #关闭 SSH 服务
sudo systemctl enable ssh #设置 SSH 服务开机自启
sudo systemctl disable ssh #禁止 SSH 服务开机自启
sudo systemctl restart ssh #重启 SSH 服务

```

</TabItem>

</Tabs>

SSH 的使用请查看 [远程登录 - SSH 登录](./05_remote_login.md#ssh)。

## 设置登录模式

### 字符终端自动登录

修改 serial-getty 服务文件可以设置免密登陆，操作如下：

<DocScope products="RDK S100">

1. 打开 `serial-getty@.service`。

```bash
# root 用户登录
vim /lib/systemd/system/serial-getty@.service

# sunrise 用户登录
sudo vim /lib/systemd/system/serial-getty@.service
```

</DocScope>

<DocScope products="RDK S600">

1. 打开 `serial-getty@ttyS0.service`。

```bash
# root 用户登录
vim /usr/lib/systemd/system/serial-getty@ttyS0.service

# sunrise 用户登录
sudo vim /usr/lib/systemd/system/serial-getty@ttyS0.service
```

</DocScope>

2.  将 `ExecStart=-/sbin/agetty` 所在行修改为（以 root 自动登录为例）:

```text
ExecStart=-/sbin/agetty --autologin root -o '-p -- \\u' --keep-baud 921600,115200,57600,38400,9600 - $TERM
```

**参数解释**： `--autologin root` 用于指定自动登录的用户名（也可写作 `-a root`）。

3. 重启后用户将自动登录。

<!-- ### 图形化终端自动登录

待更新 -->

## 设置中文环境

1. 安装语言包

```bash
sudo apt install language-pack-zh-hans language-pack-zh-hans-base fonts-wqy-microhei
```

- language-pack-zh-hans：包含中文语言的翻译文件，能让系统界面显示为中文。
- language-pack-zh-hans-base：基础语言包，提供基本的中文支持。
- fonts-wqy-microhei：安装中文字体

2. 打开终端，输入以下命令打开语言设置配置文件：

```bash
sudo vim /etc/default/locale
```

文件中添加或修改以下内容：

```text
LANG=zh_CN.UTF-8
LANGUAGE=zh_CN:zh
LC_ALL=zh_CN.UTF-8
```

3. 执行以下命令更新配置：

```bash
fc-cache -fv
source /etc/default/locale
```

## 设置中文输入法

安装好中文环境之后，默认支持系统自带的输入法，按下 `Super（Windows 键）` + `Space `组合键，即可在不同的输入法之间进行切换。

## 设置 RDK Studio

RDK Studio 是面向机器人开发的智能原生桌面工作台。它把 Moss 对话、项目工作区、设备连接、远程开发、烧录、本地模型和板端 Agent 放在同一个原生窗口里。

RDK Studio 的使用方法请参考 [RDK Studio 用户手册](https://developer.d-robotics.cc/rdk_studio_doc/category/1-product-intro)。

## NoMachine 配置

`NoMachine`当前不支持`apt`下载，需要到官网获取`deb`包。

NoMachine 下载官方网址： [NoMachine Download](https://downloads.nomachine.com/download/?id=30&platform=linux&distro=arm)

**下载安装包**

进入官网后找到适合

<DocScope products="RDK S100">

`RDK S100`

</DocScope>

<DocScope products="RDK S600">

`RDK S600`

</DocScope>

的`ARM64`版本的安装包，点击`Download`

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/image_s100_nomachine_dl.PNG" alt="NoMachine 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

**安装**

```shell
sudo apt update; sudo apt upgrade -y   # 确保当前软件是较新的状态
sudo dpkg -i nomachine_*_arm64.deb
```

**配置启动**

1. 配置服务器以允许远程连接

    ```shell
    sudo systemctl start nxserver
    ```

2. 设置`NoMachine`为开机启动：

    ```shell
    sudo systemctl enable nxserver
    ```

3. 设置`EGL Capture` 为`yes`，这是`NoMachine`提供的一个屏幕捕获功能，主要用于改善在特定显示服务器环境下的远程桌面体验：

    ```shell
    sudo /etc/NX/nxserver --eglcapture yes
    ```
    该命令重启后生效，可使用以下命令二次确认，当出现`EGL Capture has been enabled`则表示该功能已写入配置文件。
    ```shell
    if [ -f "/usr/lib/systemd/user/org.gnome.Shell@wayland.service" ] && grep -q "nxpreload.sh" "/usr/lib/systemd/user/org.gnome.Shell@wayland.service" && [ -f "/usr/share/applications/org.gnome.Shell.desktop" ] && grep -q "nxpreload.sh" "/usr/share/applications/org.gnome.Shell.desktop" && [ -f "/usr/NX/etc/node.cfg" ] && grep -q "EnableEGLCapture 1" "/usr/NX/etc/node.cfg"; then echo "EGL Capture has been enabled"; else echo "Not enabled"; fi
    ```

4. 重启`NoMachine`服务:

    ```shell
    sudo systemctl restart nxserver
    ```

**重启**

<DocScope products="RDK S100">

重启 S100。

</DocScope>

<DocScope products="RDK S600">

重启 S600。

</DocScope>

由于`NXServer`的配置问题，完成上述操作后直接连接会黑屏，需要重启后使用。

`NoMachine`的使用请查看 [远程登录 - NoMachine登录](./05_remote_login.md#nomachine-登录)。

## 用户管理

**修改用户名**

以新用户名为 usertest 为例

```shell
#关闭sunrise用户所有进程
sudo pkill -u sunrise
#sunrise用户改名为usertest
sudo usermod -l usertest sunrise
#用户的家目录改为/home/usertest
sudo usermod -d /home/usertest -m usertest
#修改用户密码
sudo passwd usertest
```

最后将更新桌面服务自动登录的用户名称:
  - gdm：RDK S100/S600 默认桌面服务，将`/etc/gdm3/custom.conf`文件中的`AutomaticLogin = sunrise`改为`AutomaticLogin = usertest`
  - lightdm（旧版桌面服务，若使用）：将`/etc/lightdm/lightdm.conf.d/22-hobot-autologin.conf`文件中的 `autologin-user=sunrise` 改为`autologin-user=usertest`，

**增加新用户**

以新增用户为 usertest 为例

```shell
sudo useradd -U -m -d /home/usertest -k /etc/skel/ -s /bin/bash -G disk,kmem,dialout,sudo,audio,video,render,i2c,lightdm,vpu,gdm,weston-launch,graphics,jpu,ipu,vps,misc,gpio usertest
sudo passwd usertest
sudo cp -aRf /etc/skel/. /home/usertest
sudo chown -R usertest:usertest /home/usertest
```

也可以参考修改用户名，将新增用户设为自动登录用户

## 验证

完成以上配置后，按以下清单确认：

- `ifconfig` 能看到无线/有线 IP 地址（网络配置成功）。
- 从 PC `ssh sunrise@<板端IP>` 能登录（SSH 服务正常）。
- 系统语言/中文字体生效（`locale` 输出含 `zh_CN.UTF-8`）。
- NoMachine 从 PC 能连接到板端桌面（远程桌面正常）。

## 常见问题

- **Wi-Fi 扫描不到网络**：检查 Wi-Fi 模组是否安装（M.2 Key E 接口），`nmcli device` 查看设备状态。
- **SSH 连接被拒绝**：`sudo systemctl status ssh` 确认服务运行；检查防火墙 `sudo ufw status`。
- **中文环境切换后无法登录桌面**：见 [桌面应用](../../08_FAQ/07_desktop_app.md)。
- **NoMachine 黑屏**：完成配置后必须**重启板卡**才生效。

## 相关文档

- [系统烧录](./01_instruction.md)
- [系统状态查询](03_system_status.md)
- [远程登录](05_remote_login.md)
- [网络配置](../../02_System_configuration/01_network_config.md)
- [srpi-config 工具配置](../../02_System_configuration/04_srpi_config/01_overview.md)
- [桌面应用](../../08_FAQ/07_desktop_app.md)
