---
sidebar_position: 4
sidebar_products: RDK S600
---

# 1.2.1 系统烧录

RDK S600 套件目前提供 Ubuntu 22.04 系统镜像，可支持 Desktop 桌面图形化交互。RDK S600 出厂已经烧写测试版本系统镜像，为确保使用最新版本的系统，建议参考本文档完成最新版本系统镜像的烧写。

基于系统提供的 PC 烧录工具 Xburn，可以完成以下固件更新操作

- [系统全镜像烧录](#系统全镜像烧录)
- [指定区域烧录](#指定区域烧录)
- [指定区域备份](#指定区域备份)



## **硬件**

### **供电**

RDK S600 开发板通过 DC 接口供电，推荐使用套件中自带的电源适配器。

### **存储**

RDK S600 采用 UFS 作为系统存储介质。

### **硬件连接**

准备一根 Type-C 数据线，数据线的一端与板子的 Type-C 接口相连接，另一端与 PC 相连接。

:::warning 注意事项

- 禁止带电时拔插除 USB、HDMI 和网线之外的任何设备
- 选用正规品牌的电源适配器，否则会出现供电异常，导致系统异常断电的问题
- 建议使用板载 POWER ON/OFF 按键实现主板上下电，并在适配器断电状态下对 DC 头进行插拔。

:::


## **烧录准备**

### **镜像下载**

1. 下载镜像包，下载地址请参考[1.6 资源汇总](../../01_Quick_start/download.md)章节
	  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S600/basic_information/download_web.png" alt="" style={{ width: '100%' }} />

2. 解压后得到 `product` 目录，请确保包含 `img_packages` 和 `xmodem_tools` 子目录
	  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/acore_product.png" alt="" style={{ width: '100%' }} />

### **烧录工具 Xburn**

烧录工具 Xburn 安装与使用指南请参考本页后续章节。


## **系统全镜像烧录**


RDK S600 通过 Xburn 烧录全系统镜像。支持 `fastboot` 和 `dfu-fastboot` 两种下载模式，用户可在 Xburn 的 `下载模式` 选项处进行选择。

两种下载模式的具体区别如下

|       下载模式   |     连接类型     | <center> 场景 </center>|  <center> 注意事项 </center>  |
| :-------------: | :--------------: | ----------  | -------------------------|
| [DFU+Fastboot](#DFU-Fastboot烧录) |  USB  |  空板或者系统损坏导致设备变砖等特殊情况   | 需设置启动模式进入 `dfu` 状态 |
| [Fastboot](#Fastboot烧录)     |  USB  |  非空板状态更新系统，满足常用烧录场景  | 要求非空板状态，且系统能进入 `uboot` 模式 |


### **DFU-Fastboot 烧录**

:::info 注意

**DFU-Fastboot 烧录方式**

- 适用于空片烧录或者固件损坏无法进入 Uboot 情况

:::


**如何使 RDK S600 进入 DFU 启动模式**

以下分别介绍 RDKS600 V0P1 和 V0P2 进入 DFU 模式方式，用户请根据硬件型号操作

**RDKS600 V0P1 dfu 模式**

   1. 将 `PWR KEY` 拨码至 `OFF`，关闭电源
   2. 短接跳线帽，进入 dfu 模式
   3. 将 `PWR KEY` 拨码至 `ON`，开启电源
   4. 如果 `FLS` 红灯亮起，表示进入 dfu 模式

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-V0P1.png" alt="image-S600-V0P1" style={{ width: '100%' }} />


**RDKS600 V0P2 dfu 模式**

   1. 将 `PWR KEY` 拨码至 `OFF`，关闭电源
   2. 将 `FLASH` 拨码至 `ON`，进入 dfu 模式
   3. 将 `PWR KEY` 拨码至 `ON`，开启电源
   4. 如果 `FLS` 红灯亮起，表示进入 dfu 模式

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-dfu-mode.png" alt="image-S600-dfu-mode" style={{ width: '100%' }} />



**使用 Xburn 进行 DFU-Fastboot 烧录**

打开 Xburn，设置方法如下：

   - 选择产品型号: `RDKS600`
   - 连接模式: `usb`, 下载模式: `DFU+Fastboot`
   - 介质存储: `ufs`, 类型: `secure`

   设置界面参考如下

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-download_dfu.png" alt="image-S600-xburn-download_dfu" style={{ width: '100%' }} />

- 点击浏览选择固件所在 product 文件夹

- 点击开始升级，设备上电并等待升级完成
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-burn_progress.png" alt="" style={{ width: '100%' }} />


- 升级完成后，关闭电源，改为正常启动模式并重新上电。


### **Fastboot 烧录**

:::info 注意

**Fastboot 烧录方式**

- RDK S600 使用正常启动模式

- 需保证系统 U-boot 正常启动并进入 Fastboot

:::

**如何使 RDK S100 进入 Fastboot 模式**

可以通过两种方式进入 Fastboot

- 自动进入 Fastboot : 系统启动后自动生成 ADB 设备，Xburn 检测 ADB 设备并下发命令让板端进入 Fastboot
- 手动进入 Fastboot : 板端启动进入 uboot，输入 `fastboot 0` 进入 Fastboot



**使用 Xburn 进行 Fastboot 烧录**

打开 Xburn，设置方法如下：

   - 选择产品型号: `RDKS600`
   - 连接模式: `usb`, 下载模式: `Fastboot`
   - 介质存储: `ufs`, 类型: `secure`

   设置界面参考如下

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-download_fastboot.png" alt="" style={{ width: '100%' }} />

- 点击浏览选择固件所在 product 文件夹


- 点击开始升级，设备进入 Fastboot 模式并等待升级完成
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-burn_progress.png" alt="" style={{ width: '100%' }} />


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

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-download_partition.png" alt="" style={{ width: '100%' }} />

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

以指定烧录 `miniboot_flash` 为例

打开 Xburn，设置方法如下：

   - 选择产品型号: `RDKS600`
   - 连接模式: `usb`, 下载模式: `DFU+Fastboot`
   - 介质存储: `ufs`, 类型: `secure`
   - 高级配置: 勾选 `备份指定区域`，勾选 `miniboot_flash`

   设置界面参考如下

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-backup_partition.png" alt="" style={{ width: '100%' }} />

- 点击浏览选择固件所在 product 文件夹

- 点击开始升级，设备上电并等待操作完成

- 操作完成后，打开 `img_packages/disk/`，查看备份镜像文件 `miniboot_flash_backup.img`
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-backup_partition_image.png" alt="" style={{ width: '100%' }} />



:::info 注意

对于整个存储介质数据备份，耗时较长，请耐心等待备份结束

:::


## **启动系统**

首先保持开发板断电，并通过 HDMI 线缆连接开发板与显示器，最后给开发板上电。

系统首次启动时会进行默认环境配置，整个过程持续 45 秒左右，配置结束后会在显示器输出 Ubuntu 系统桌面。

:::tip 开发板指示灯说明

- **<font color='Green'>绿色</font>** 指示灯：点亮代表硬件上电正常

如果开发板上电后长时间没有显示输出（2 分钟以上），说明开发板启动异常。需要通过串口线进行调试，查看开发板是否正常。

:::

Ubuntu Desktop 版本系统启动完成后，会通过 Display 传输接口在显示器上输出系统桌面，如下图：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-desktop_display_s100.jpg" alt="image-desktop_display.jpg" style={{ width: '100%' }} />


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

### **使用 MacOS 系统笔记本串口乱码问题**

以 MacOs 版本 15.0(芯片 M3)为例，MACOS 系统默认串口驱动以 921600 波特率连接 CH340N 会出现乱码，需要安装最新的 CH340N 的驱动，操作如下：

1. 默认的 CH340N 驱动插上设备显示为`tty.usbserial*`，说明此时为 MACOS 默认串口驱动，需要更新：
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-ttyusb.png" alt="" style={{ width: '100%' }} />

2. 安装流程：(以下安装流程参考[CH340N 最新驱动发布页面](https://github.com/WCHSoftGroup/ch34xser_macos?tab=readme-ov-file)下的 README.md 文档编写)
   1. 在[CH340N 最新驱动发布页面](https://github.com/WCHSoftGroup/ch34xser_macos?tab=readme-ov-file)点击下载压缩包
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install1.png" alt="" style={{ width: '100%' }} />
   2. 解压并使用 pkg 包进行驱动安装
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install2.png" alt="" style={{ width: '100%' }} />
   3. 点击继续
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install3.png" alt="" style={{ width: '100%' }} />
   4. 点击安装并输入密码
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install4.png" alt="" style={{ width: '100%' }} />
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install5.png" alt="" style={{ width: '100%' }} />
   5. 点击安装，打开系统设置
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install6.png" alt="" style={{ width: '100%' }} />
   6. 授权允许并输入密码
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install7.png" alt="" style={{ width: '100%' }} />
   7. 弹框显示安装成功
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install8.png" alt="" style={{ width: '100%' }} />
   8. **<font color='red'>重启电脑</font>**
   9. 检查是否安装成功，识别到 tty.wch\* 表示驱动安装成功
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-ttywch.png" alt="" style={{ width: '100%' }} />
3. 连接设备验证
   :::warning 注意

   CH340N 最新官方驱动仍不支持 MACOS 系统自带的 screen 工具以 921600 波特率通讯，需使用`minicom`工具。

   :::

   1. 以上图为例，一般编号小的为 ACore 串口，编号大的为 MCU 串口，如上图显示`/dev/tty.wchusbserial1220`是 ACore 串口，`/dev/tty.wchusbserial1230`是 MCU 串口，连接 ACore 串口命令是：`minicom -D /dev/tty.wchusbserial1220 -b 921600 -8`; 连接 MCU 串口命令是：`minicom -D /dev/tty.wchusbserial1230 -b 921600 -8`，请根据实际设备编号 **/dev/tty.wchusbserial** 替换命令中的设备路径
   2. `minicom`连接 ACore 串口命令如下（`minicom -D /dev/tty.wchusbserial1220 -b 921600 -8`）
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-minicom.png" alt="" style={{ width: '100%' }} />
   3. 连接开发板验证
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-minicom-success.png" alt="" style={{ width: '100%' }} />

4. FAQ

    Q1：之前已安装或使用官网下载的 CH340N 驱动后，串口查看还是乱码。
      A：如果已经从官网安装驱动，但是查看到设备仍为`tty.usbserial*`，需要把 CH34xVCPDriverApp 放到废纸篓里，清空废纸篓，**<font color='red'>重启电脑</font>**，根据[上面的步骤](#使用-macos-系统笔记本串口乱码问题)重新安装。


:::tip

更多问题的处理，可以查阅 [常见问题](../../08_FAQ/01_hardware_and_system.md) 章节，同时可以访问 [D-Robotics 开发者官方论坛](https://developer.d-robotics.cc/forum) 获得帮助。

:::
