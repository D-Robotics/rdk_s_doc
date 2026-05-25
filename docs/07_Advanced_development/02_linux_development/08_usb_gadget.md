---
sidebar_position: 8
---

# 7.2.8 USB Gadget 使用指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope'
```

本章节介绍开发板 USB Gadget 功能的使用方法，包括如何将 USB 2.0 Type-C 接口配置为 ADB 模式和 RNDIS 模式。

## 硬件限制条件

### USB 接口概述

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<DocScope products="RDK S100">

RDK S100 开发板提供以下 USB 接口：

| 接口类型 | 位置 | 数量 | 工作模式 | 用途 |
|---------|------|------|---------|------|
| USB Type-C | J16 | 1 | Device Only | 镜像烧录、调试串口、USB Gadget |
| USB 3.0 Type-A | J19/J20 | 4 | Host Only | 连接 USB 外设（U盘、键盘、鼠标等） |

:::warning 重要限制

1. **USB Type-C (J16) 仅支持 Device 模式**，不支持 Host 模式，无法通过该接口读取 U 盘或连接其他 USB 设备。
2. **USB 3.0 Type-A (J19/J20) 仅支持 Host 模式**，无法配置为 Gadget 模式。
3. USB Type-C 接口包含调试串口功能，通过 CH340 芯片将 Main 域和 MCU 域的调试串口转换为 USB 接口。
4. 注意 USB 2.0 Camera 接入能力限制，详见基础应用章节的 USB 摄像头文档。

:::

</DocScope>
<DocScope products="RDK S600">

RDK S600 开发板提供以下 USB 接口：

| 接口类型 | 位置 | 数量 | 工作模式 | 用途 |
|---------|------|------|---------|------|
| USB Type-C | J4 | 1 | Device Only | 镜像烧录、调试串口、USB Gadget |
| USB 3.2 Gen 1x1 Type-A | J7/J8/J9 | 6 | Host Only | 连接 USB 外设（U盘、键盘、鼠标等） |

:::warning 重要限制

1. **USB Type-C (J4) 仅支持 Device 模式**，不支持 Host 模式，无法通过该接口读取 U 盘或连接其他 USB 设备。
2. **USB 3.2 Type-A (J7/J8/J9) 仅支持 Host 模式**，无法配置为 Gadget 模式。
3. USB Type-C 接口包含调试串口功能，通过 CH340 芯片将 Main 域和 MCU 域的调试串口转换为 USB 接口。
4. 注意 USB 2.0 Camera 接入能力限制，详见基础应用章节的 USB 摄像头文档。

:::

</DocScope>

### USB Gadget 功能说明

USB Gadget 是 Linux 内核提供的一种框架，允许设备作为 USB 外设（Device）连接到主机（Host）。通过 USB Gadget 框架，RDK 开发板可以模拟多种 USB 设备功能。

RDK 开发板通过 `usb-gadget.sh` 脚本支持以下 Gadget 功能：

| 功能 | 说明 |
|------|------|
| **adb** | Android Debug Bridge，用于 ADB 调试 |
| **rndis** | Remote NDIS，虚拟网卡功能，可实现 USB 网络共享 |


## 使用方法

### 切换到 ADB 模式

ADB (Android Debug Bridge) 模式允许用户通过 USB Type-C 接口进行调试和文件传输。

**启动 ADB 模式：**

```bash
usb-gadget.sh start adb
```

执行输出示例：

```shell
Detecting platform:
 board : D-Robotics RDK S100 V0P5
 udc   : 39820000.dwc3
Creating the USB gadget
Loading composite module
Mount ConfigFS and create Gadget
Creating gadget directory g_comp
OK
init configfs...
Setting Vendor and Product ID's
OK
...
Creating ACM gadget functionality
OK
Binding USB Device Controller
OK
usb-gadget start succeed.
```

**停止 ADB 模式：**

```bash
usb-gadget.sh stop adb
```

### 切换到 RNDIS 模式

RNDIS (Remote Network Driver Interface Specification) 模式将 USB Type-C 接口虚拟为网卡，实现 USB 网络共享功能。连接到 PC 后，会在电脑上生成一个远程网卡设备。

**启动 RNDIS 模式：**

```bash
usb-gadget.sh stop adb
usb-gadget.sh start rndis
```

执行输出示例：

```shell
Stopping the USB gadget
Stoping & Delete usb-gadget g_comp
waiting...
...
OK
Bind functions...
Bind functions according to .usb-config file
bind gadget rndis...
Creating RNDIS gadget functionality
OK
Pre run userspace daemons(eg. adb)...
0
waiting
.
OK
Binding USB Device Controller
OK
Run some userspace daemons(eg. usb_camera)...
usb-gadget start succeed.
```

连接到 PC 后，在电脑的网络配置页面可以看到 `Remote NDIS Compatible Device` 网卡：

![RNDIS_Device](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/RNIS_Device.png)

**配置网络 IP：**

开发板端配置 USB 网卡 IP 地址：

```bash
ifconfig usb0 192.168.1.110
```

PC 端配置远程网卡 IP 地址（需要与开发板在同一网段）：

![NETWORK_CONFIG](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/NETWORK_CONFIG.png)

**验证网络连接：**

在开发板上 ping PC 端 IP：

```bash
ping 192.168.1.111
```

**停止 RNDIS 模式：**

```bash
usb-gadget.sh stop rndis
```

## 常见问题

### Windows 无法识别 RNDIS 设备

如果在 Windows 系统上连接 RNDIS 设备后无法正确识别，可能是因为：

1. **首次连接未加载 OS 描述符**：Windows 会在注册表中记录设备信息，如果首次连接时没有正确的 OS 描述符，后续连接将不会重新请求。

   **解决方法**：删除注册表中的设备记录：
   ```
   HKLM\SYSTEM\CurrentControlSet\Control\usbflags\[USB_VID+USB_PID+bcdRelease]\osvc
   ```

2. **手动安装驱动**：在设备管理器中找到未识别的设备，右键选择"更新驱动程序"，选择"浏览计算机以查找驱动程序"，然后选择"从计算机的设备驱动程序列表中选取"，选择"网络适配器" -> "Microsoft" -> "Remote NDIS Compatible Device"。

### ADB 设备无法识别

如果在 PC 上无法识别 ADB 设备：

1. 确认已安装 ADB 驱动（Windows）或 adb 工具（Linux/macOS）
2. 检查 USB 线缆是否支持数据传输
3. 使用 `adb devices` 命令查看设备是否被识别

### 切换模式后设备未识别

切换 Gadget 模式后，如果 PC 未识别新设备：

1. 拔掉 USB 线缆重新连接
2. 执行 `usb-gadget.sh stop` 命令停止当前模式，再启动新模式
