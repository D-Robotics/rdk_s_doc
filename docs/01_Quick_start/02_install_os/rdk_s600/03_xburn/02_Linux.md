---
sidebar_position: 2
---

# Linux 平台烧录步骤


## 硬件连接

使用 Type-C 数据线将 PC 的 USB 接口和开发板的 Type-C 接口相连接。

:::warning 注意

请确保 Type-C 数据线为高质量数据线，以确保烧录的稳定性。
1. 带有屏蔽层 。
2. 长度越短越好 。
3. 数据传输质量高。

:::

## 安装依赖


Ubuntu 平台用户可通过以下命令安装工具

```
sudo apt update
sudo apt install android-tools-adb android-tools-fastboot
sudo apt install dfu-util
```



## **系统全镜像烧录**


RDK S600 通过 Xburn 烧录全系统镜像。支持 `fastboot` 和 `dfu-fastboot` 两种下载模式，用户可在 Xburn 的 `下载模式` 选项处进行选择。

两种下载模式的具体区别如下

|       下载模式   |     连接类型     | <center> 场景 </center>|  <center> 注意事项 </center>  |
| :-------------: | :--------------: | ----------  | -------------------------|
| [DFU+Fastboot](#dfu-fastboot-烧录) |  USB  |  空板或者系统损坏导致设备变砖等特殊情况   | 需设置启动模式进入 `dfu` 状态 |
| [Fastboot](#fastboot-烧录)     |  USB  |  非空板状态更新系统，满足常用烧录场景  | 要求非空板状态，且系统能进入 `uboot` 模式 |


### **DFU-Fastboot 烧录**

:::info 注意

**DFU-Fastboot 烧录方式**

- 适用于空片烧录或者固件损坏无法进入 Uboot 情况

:::


**如何使 RDK S600 进入 DFU 启动模式**

以下分别介绍 RDKS600 V1P0、V0P1 和 V0P2 进入 DFU 模式方式，请根据硬件型号操作。

**RDKS600 V1P0 DFU 模式**

   1. 将 `PWR KEY` 拨码至 `OFF`，关闭电源
   2. 将 `FLASH` 拨码至 `ON`，进入 dfu 模式
   3. 将 `PWR KEY` 拨码至 `ON`，开启电源
   4. 如果 `FLS` 红灯亮起，表示进入 dfu 模式

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-dfu-mode.png" alt="RDK S600进入DFU模式操作示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

<details>
<summary>RDKS600 V0P1 DFU 模式</summary>

   1. 将 `PWR KEY` 拨码至 `OFF`，关闭电源
   2. 短接跳线帽，进入 dfu 模式
   3. 将 `PWR KEY` 拨码至 `ON`，开启电源
   4. 如果 `FLS` 红灯亮起，表示进入 dfu 模式

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-V0P1.png" alt="DFU-Fastboot 烧录示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</details>

<details>
<summary>RDKS600 V0P2 DFU 模式</summary>

   1. 将 `PWR KEY` 拨码至 `OFF`，关闭电源
   2. 将 `FLASH` 拨码至 `ON`，进入 dfu 模式
   3. 将 `PWR KEY` 拨码至 `ON`，开启电源
   4. 如果 `FLS` 红灯亮起，表示进入 dfu 模式

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-dfu-mode.png" alt="RDK S600进入DFU模式操作示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
</details>



**使用 Xburn 进行 DFU-Fastboot 烧录**

打开 Xburn，设置方法如下：

   - 选择产品型号: `RDKS600`
   - 连接模式: `usb`, 下载模式: `DFU+Fastboot`
   - 介质存储: `ufs`, 类型: `secure`

   设置界面参考如下

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-download_dfu.png" alt="DFU-Fastboot 烧录示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- 点击浏览选择固件所在 product 文件夹

- 点击开始升级，设备上电并等待升级完成
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-burn_progress.png" alt="DFU-Fastboot 烧录示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


- 升级完成后，关闭电源，改为正常启动模式并重新上电。


### **Fastboot 烧录**

:::info 注意

**Fastboot 烧录方式**

- RDK S600 使用正常启动模式

- 需保证系统 U-boot 正常启动并进入 Fastboot

:::

**如何使 RDK S600 进入 Fastboot 模式**

可以通过两种方式进入 Fastboot

- 自动进入 Fastboot : 系统启动后自动生成 ADB 设备，Xburn 检测 ADB 设备并下发命令让板端进入 Fastboot
- 手动进入 Fastboot : 板端启动进入 uboot，输入 `fastboot 0` 进入 Fastboot



**使用 Xburn 进行 Fastboot 烧录**

打开 Xburn，设置方法如下：

   - 选择产品型号: `RDKS600`
   - 连接模式: `usb`, 下载模式: `Fastboot`
   - 介质存储: `ufs`, 类型: `secure`

   设置界面参考如下

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-download_fastboot.png" alt="Fastboot 烧录示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- 点击浏览选择固件所在 product 文件夹


- 点击开始升级，设备进入 Fastboot 模式并等待升级完成
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-burn_progress.png" alt="Fastboot 烧录示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


- 升级完成后重新上电。


## **指定区域烧录**{#指定区域烧录}

### **烧录区域说明**

RDK S600 支持通过 Xburn 烧录指定区域，支持的烧录区域如下

|     区域      |     存储介质     | <center> 固件内容 </center>|  <center> 镜像 </center>  |
| :-------------: | :--------------: | ----------  | -------------------------|
| miniboot_flash |  Norflash  | Norflash 上的基础启动镜像，包括 HSM/MCU0 等系统组件的镜像   | img_packages/disk/miniboot_flash.img |
| miniboot_ufs   |  ufs  |  ufs 上的基础启动镜像，包括 BL31/Uboot 等系统组件的镜像   | img_packages/disk/miniboot_ufs.img |
| ufs            |  ufs  |  ufs 完整镜像，已包含 miniboot_ufs  | img_packages/disk/ufs_disk.img  |


### **使用 Xburn 指定区域烧录**

以指定烧录 `miniboot_flash` 和 `miniboot_ufs` 为例

打开 Xburn，设置方法如下：

   - 选择产品型号: `RDKS600`
   - 连接模式: `usb`, 下载模式: `DFU+Fastboot`
   - 介质存储: `ufs`, 类型: `secure`
   - 高级配置: 勾选 `烧录指定区域`，勾选 `miniboot_flash` 和 `miniboot_ufs`

   设置界面参考如下

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-download_partition.png" alt="使用 Xburn 指定区域烧录示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- 点击浏览选择固件所在 product 文件夹

- 点击开始升级，设备上电并等待升级完成


## **指定区域备份**

### **备份区域说明**

RDK S600 支持通过 Xburn 备份指定区域，支持的备份区域如下

|     区域      |     存储介质     | <center> 固件内容 </center>|  <center> 备份镜像路径 </center>  |
| :-------------: | :--------------: | ----------  | -------------------------|
| miniboot_flash |  Norflash  | Norflash 完整镜像   | img_packages/disk/miniboot_flash_backup.img |
| ufs            |  ufs  |  ufs 完整镜像  | img_packages/disk/ufs_disk_backup.img  |


### **使用 Xburn 指定区域备份**

以指定备份 `miniboot_flash` 为例

打开 Xburn，设置方法如下：

   - 选择产品型号: `RDKS600`
   - 连接模式: `usb`, 下载模式: `DFU+Fastboot`
   - 介质存储: `ufs`, 类型: `secure`
   - 高级配置: 勾选 `备份指定区域`，勾选 `miniboot_flash`

   设置界面参考如下

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-backup_partition.png" alt="使用 Xburn 指定区域备份示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- 点击浏览选择固件所在 product 文件夹

- 点击开始升级，设备上电并等待操作完成

- 操作完成后，打开 `img_packages/disk/`，查看备份镜像文件 `miniboot_flash_backup.img`
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-backup_partition_image.png" alt="使用 Xburn 指定区域备份实物图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />



:::info 注意

对于整个存储介质数据备份，耗时较长，请耐心等待备份结束。

:::


## **启动系统**

首先保持开发板断电，并通过 HDMI 线缆连接开发板与显示器，最后给开发板上电。

系统首次启动时会进行默认环境配置，整个过程持续 45 秒左右，配置结束后会在显示器输出 Ubuntu 系统桌面。

:::tip 开发板指示灯说明

- **<font color='Green'>绿色</font>** 指示灯：点亮代表硬件上电正常

如果开发板上电后长时间没有显示输出（2 分钟以上），说明开发板启动异常。需要通过串口线进行调试，查看开发板是否正常。

:::

Ubuntu Desktop 版本系统启动完成后，会通过 Display 传输接口在显示器上输出系统桌面，如下图：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-desktop_display_s100.jpg" alt="启动系统示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


## **常见问题**

### **使用 ubuntu 系统笔记本遇到的问题**

1. **ubuntu 系统笔记本连接开发板后，串口出现乱码**

   1. 下载官方串口驱动 [CH340N 驱动](https://www.wch.cn/downloads/CH341SER_LINUX_ZIP.html)
   2. 修改`ch341_tty_driver->name = "ttyUSB";`
   3. 重新编译并安装驱动

2. **ubuntu24.04 系统需要安装驱动**

   1. 执行如下脚本

   ```bash
   #!/bin/bash

   set -e

   echo "[INFO] Updating APT package list..."
   sudo apt update

   echo "[INFO] Installing required packages..."
   sudo apt install -y dfu-util libusb-1.0-0-dev

   echo "[INFO] Writing udev rules to /etc/udev/rules.d/99-drobotics.rules..."

   sudo tee /etc/udev/rules.d/99-drobotics.rules > /dev/null <<EOF
   SUBSYSTEM=="usb", ATTR{idVendor}=="3652", ATTR{idProduct}=="6610", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="3652", ATTR{idProduct}=="6615", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="3652", ATTR{idProduct}=="6620", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="3652", ATTR{idProduct}=="6625", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="18d1", ATTR{idProduct}=="6631", MODE="0666"
   SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", MODE="0666"
   EOF

   echo "[INFO] Reloading and triggering udev rules..."
   sudo udevadm control --reload
   sudo udevadm trigger

   echo "[INFO] Setup complete. Please replug your devices or reboot if necessary."
   ```

   2. 或者依次执行如下命令

   ```bash
   # 更新APT源
   sudo apt update

   # 安装DFU工具和libusb
   sudo apt install -y dfu-util libusb-1.0-0-dev

   # 设定开发板接口权限
   sudo tee /etc/udev/rules.d/99-drobotics.rules > /dev/null <<EOF
   SUBSYSTEM=="usb", ATTR{idVendor}=="3652", ATTR{idProduct}=="6610", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="3652", ATTR{idProduct}=="6615", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="3652", ATTR{idProduct}=="6620", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="3652", ATTR{idProduct}=="6625", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="18d1", ATTR{idProduct}=="6631", MODE="0666"
   SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", MODE="0666"
   EOF

   # 重载udev
   sudo udevadm control --reload
   sudo udevadm trigger
   ```

   3. 使用 Type-C 线连接电脑和开发板的 Type-C 口（靠近 DC 电源接头位置）
   4. 点击[下载](https://archive.d-robotics.cc/downloads/software_tools/download_tools/)最新的 `Xburn` 工具
   5. 安装并启动 `Xburn` 烧录工具。




:::tip

更多问题的处理，可以查阅 [常见问题](../../08_FAQ/01_hardware_and_system.md) 章节，同时可以访问 [D-Robotics 开发者官方论坛](https://developer.d-robotics.cc/forum) 获得帮助。

:::
