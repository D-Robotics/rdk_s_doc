---
title: "远程登录"
sidebar_position: 5
description: "通过 SSH/串口/NoMachine 远程登录开发板的方法与默认账户"
---

# 远程登录

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

远程登录是烧录系统后从 PC 访问开发板的基本方式。开发板日常开发通常不外接显示器与键鼠，需通过串口或 SSH 远程操作。完成登录后，可在 PC 端获得板端 shell，执行命令、部署与调试程序。

## 前置条件

- [ ] 开发板已烧录 RDK OS 并完成启动（见 [烧录系统与配置](./01_instruction.md)）。
- [ ] 远程登录前确认开发板网络可达：板端 `eth1` 默认静态 IP `192.168.127.10`，或通过 Wi-Fi（`wlan0`）由路由器分配 IP（可用 `ifconfig` 或 `ip addr` 查看）。
- [ ] PC 与开发板处于同一网段，能 `ping` 通开发板 IP（网络排查见 [网络状态确认](#network_config)）。

## 默认登录账户

系统提供了两个默认账户，方便用户首次使用：

- **普通用户**：用户名 `sunrise`，密码 `sunrise`
- **超级用户（root）**：用户名 `root`，密码 `root`

:::tip
通过网络方式远程登录前，开发板需要通过有线以太网或者无线 Wi-Fi 方式接入网络，配置好开发板 IP 地址。对于两种连接方式下的 IP 地址信息可参考如下描述：

<DocScope products="RDK S100">

- 有线以太网：
  - 开发板 eth1 接口默认采用静态 IP 模式，IP 地址为 `192.168.127.10`，掩码 `255.255.255.0`，网关 `192.168.127.1`
  - 开发板 eth0 接口默认采用 dhcp 模式，IP 地址一般由路由器分配，可在设备命令行中通过 `ifconfig` 命令查看 eth0 网络的 IP 地址
- 无线 Wi-Fi：开发板 IP 地址一般由路由器分配，可在设备命令行中通过 `ifconfig` 命令查看 wlan0 网络的 IP 地址

</DocScope>

<DocScope products="RDK S600">

- 有线以太网：
  - 开发板 eth2、eth3 为 10GbE 万兆网口，默认采用 dhcp 模式，IP 地址一般由路由器分配（同 eth0）
  - 开发板 eth1 接口默认采用静态 IP 模式，IP 地址为 `192.168.127.10`，掩码 `255.255.255.0`，网关 `192.168.127.1`
  - 开发板 eth0 接口默认采用 dhcp 模式，IP 地址一般由路由器分配，可在设备命令行中通过 `ifconfig` 命令查看 eth0 网络的 IP 地址
- 无线 Wi-Fi：开发板 IP 地址一般由路由器分配，可在设备命令行中通过 `ifconfig` 命令查看 wlan0 网络的 IP 地址

</DocScope>

:::

## 串口登录{#login_uart}

### Windows 连接串口

#### 硬件连接

在使用串口登录前，需要确认开发板串口线跟电脑正确连接。开发板硬件上已经支持了串口转 USB芯片，用户使用一根 Type-C数据线将开发板连接到个人电脑（PC）上，在PC上安装好 CH340 驱动即可使用。

<DocScope products="RDK S100">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s100-uart.jpg" alt="S100 串口连接示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/S600-uart.jpg" alt="S600 串口连接示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

#### 驱动安装

在 Windows 上使用串口功能时，需要先安装 CH340驱动，驱动程序可从资源中心的[工具子栏目](https://developer.d-robotics.cc/resource)获取。完成驱动安装后，在设备管理器中可以查看到类似如下图所示的COM设备（具体以实际为准）：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/COM.jpg" alt="设备管理器中的 COM 设备" style={{ width: '50%', maxWidth: '980px', height: 'auto', display: 'block' }} />

#### 连接使用

串口登录需要借助 PC 终端工具，目前常用的工具有 `PuTTY`、`MobaXterm` 等，用户可根据自身使用习惯来选择。不同工具的端口配置流程基本类似，下面以 `MobaXterm` 为例，介绍新建串口连接过程：

- 打开 `MobaXterm` 工具，点击 `Session`，然后选择 `Serial`

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/MobaXterm-1.png" alt="MobaXterm 新建串口连接" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

- 配置端口号，例如 `COM34`，实际使用的串口号以 PC 识别到的串口号为准

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/MobaXterm-2.png" alt="MobaXterm 串口端口号配置" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

- 设置串口配置参数，如下：

  | 配置项               | 参数值 |
  | -------------------- | ------ |
  | 波特率（Baud rate）  | 921600 |
  | 数据位（Data bits）  | 8      |
  | 奇偶校验（Parity）   | None   |
  | 停止位（Stop bits）  | 1      |
  | 流控（Flow Control） | 无     |

- 点击 `OK`，输入用户名：`root`、密码：`root` 登录设备

此时，可使用 `ifconfig -a` 命令查询开发板 IP 地址，其中 eth0/eth1、wlan0 分别代表有线、无线网络：

<DocScope products="RDK S100">

```bash
eth0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 7547  bytes 2230733 (2.2 MB)
        RX errors 0  dropped 2  overruns 0  frame 0
        TX packets 1126  bytes 108615 (108.6 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 93

eth1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.127.10  netmask 255.255.255.0  broadcast 192.168.127.255
        inet6 fe80::xxxx:xxff:fexx:xxxx  prefixlen 64  scopeid 0x20<link>
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 43  bytes 3882 (3.8 KB)
        RX errors 0  dropped 1  overruns 0  frame 0
        TX packets 46  bytes 6234 (6.2 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 99

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 46  bytes 6342 (6.3 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 46  bytes 6342 (6.3 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```
</DocScope>
<DocScope products="RDK S600">

```text
eth0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 139

eth1: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 192.168.127.10  netmask 255.255.255.0  broadcast 192.168.127.255
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 199

eth2: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 210

eth3: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 227

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 32  bytes 4590 (4.5 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 32  bytes 4590 (4.5 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```
</DocScope>

### macOS 连接串口

macOS 系统下使用 minicom 工具连接串口，步骤如下：

1. 使用 minicom 连接串口：

   ```bash
   minicom -D /dev/tty.wchusbserial* -b 921600 -8
   ```

   参数说明：`-D` 指定串口设备，`-b` 设置波特率（921600），`-8` 设置数据位为 8 位。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-minicom.png" alt="macOS 下 minicom 串口连接命令示例" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

2. 连接成功后界面如下：

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-minicom-success.png" alt="macOS 下 minicom 成功连接开发板界面" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

:::tip

使用 minicom 连接出现乱码，请查看 [macOS 驱动残留导致仍乱码](https://developer.d-robotics.cc/xburn_doc/troubleshooting/serial-driver#macos-驱动残留导致仍乱码)
:::

## 网络状态确认{#network_config}

参考视频：[远程登录与网络配置](https://www.bilibili.com/video/BV1rm4y1E73q/?p=3)

在使用远程登录前，需要确保电脑、开发板网络通信正常，如无法 `ping` 通，需按如下步骤进行确认：

- 确认开发板、电脑 IP 地址配置，一般前三段需要是一样的，例如开发板：`192.168.127.10`，电脑：`192.168.127.100`
- 确认开发板、电脑的子网掩码、网关配置是否一致
- 确认电脑网络防火墙是否处于关闭状态

开发板靠外的有线以太网口（eth1）默认采用静态 IP 模式，IP 地址为 `192.168.127.10`。对于开发板、电脑网络直连的情况，只需要将电脑配置为静态 IP，保证跟开发板处于同一网段即可。以 Windows 10 系统为例，电脑静态 IP 修改方法如下：

- 在网络连接中找到对应的以太网设备并双击打开
- 找到 Internet 协议版本 4 选项并双击打开
- 在下图红框位置填入对应的网络参数，点击确定

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-s100-pc-static-ip.png" alt="Windows静态IP配置对话框" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

如需将开发板有线网络配置为动态获取 DHCP 模式，可参考 [有线网络](../../02_System_configuration/01_network_config.md)章节进行配置。

## SSH 登录{#ssh}
下面分别介绍终端软件、终端命令行两种方法的创建步骤。

### 终端软件

目前常用终端工具有 `PuTTY`、`MobaXterm` 等，用户可根据自身使用习惯来选择。不同工具的端口配置流程基本类似，下面以 `MobaXterm` 为例，介绍新建 SSH 连接过程：

1. 打开 `MobaXterm` 工具，点击 `Session`，然后选择 `SSH`

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh_login-1.png" alt="MobaXterm 新建 SSH 连接" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

2. 输入开发板 IP 地址，例如 `192.168.127.10` 选中 `specify username`，输入 `sunrise`，Port 选择 `22`

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh_login-2.png" alt="MobaXterm SSH 填写 IP 地址" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

3. 点击 OK 后，输入用户名（sunrise）、密码（sunrise）即可完成登录

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh_login-3.png" alt="MobaXterm SSH 指定用户名" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

### 电脑命令行

用户也可通过命令行方式进行 SSH 登录，步骤如下：

1. 打开终端窗口，在 `PC` 端 按 `Win + R`，输入 `cmd` 回车。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh-login-4.png" alt="命令行 SSH 登录示例" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

2. 在终端中输入 SSH 登录命令，例如 `ssh sunrise@192.168.127.10`。如弹出连接确认提示，输入 `YES`。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh_login-5.png" alt="命令行 SSH 连接确认" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

3. 输入密码（sunrise）即可完成登录。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh_login-6.png" alt="命令行 SSH 登录成功" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

4. 看到如下界面表示登陆成功。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh_login-7.png" alt="命令行 SSH 登录成功界面" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

## NoMachine 登录

<DocScope products="RDK S100">

:::tip
NoMachine 功能需要 S100端的软件包支持，配置指南见[NoMachine配置](04_configuration_wizard.md#nomachine-配置)
:::

</DocScope>

<DocScope products="RDK S600">

:::tip
NoMachine 功能需要 S600端的软件包支持，配置指南见[NoMachine配置](04_configuration_wizard.md#nomachine-配置)
:::

</DocScope>

本章节面向使用 Ubuntu Desktop 系统版本的用户，介绍如何通过 `NoMachine` 实现远程桌面登录功能。

**连接开发板**

<DocScope products="RDK S100">

1. 打开 `NoMachine` 客户端，点击 `Add` 增加主机配置

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s600_nomachine-0.png" alt="NoMachine 新建主机配置" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

1. 打开 `NoMachine` 客户端，点击 `Add` 增加主机配置

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s600_nomachine-0.png" alt="NoMachine 新建主机配置" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S100">

2. 在跳出来的界面中填写 `RDKS100`的主机信息，完成后点击 `Add`

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s100_nomachine-1.png" alt="NoMachine 填写主机信息" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

2. 在跳出来的界面中填写 `RDKS600`的主机信息，完成后点击 `Add`

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s600_nomachine-1.png" alt="NoMachine 填写主机信息" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S100">

3. 此时返回主界面，双击刚才生成的主机

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s100_nomachine-2.png" alt="NoMachine 双击主机连接" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

3. 此时返回主界面，双击刚才生成的主机

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s600_nomachine-2.png" alt="NoMachine 双击主机连接" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S100">

4. 弹出登录界面，输入用户名、密码点击 OK 即可完成远程登录

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-S100-nomachine_login04.jpg" alt="NoMachine 登录界面" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-S100-nomachine_login05.jpg" alt="NoMachine 登录成功" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

4. 弹出登录界面，输入用户名、密码点击 OK 即可完成远程登录

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s600_nomachine-3.png" alt="NoMachine 登录界面" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

## 常见问题

- **SSH 连接被拒绝**：板端 `sudo systemctl status ssh` 确认服务运行；确认防火墙 `sudo ufw status` 未拦截。
- **串口无输出**：检查波特率（应为 921600），确认 TTL-USB 线 TX/RX 未接反。
- **NoMachine 黑屏**：首次配置后必须重启板卡。详见 [入门配置 - NoMachine 配置](04_configuration_wizard.md)。
- **IP 地址不确定**：串口登录后 `ip addr` 查看，或路由器管理页查找 MAC 地址对应 IP。

## 相关文档

- [系统烧录](./01_instruction.md)
- [系统状态查询](03_system_status.md)
- [入门配置](04_configuration_wizard.md)
- [网络配置](../../02_System_configuration/01_network_config.md)
- [调试串口](../../02_System_configuration/16_debug_serial.md)
