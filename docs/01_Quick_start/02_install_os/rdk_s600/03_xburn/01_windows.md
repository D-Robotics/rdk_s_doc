---
sidebar_position: 1
---

# Windows 平台烧录步骤


## 硬件连接

使用 Type-C 数据线将 PC 的 USB 接口和开发板的 Type-C 接口相连接。


:::warning 注意

请确保 Type-C 数据线为高质量数据线，以确保烧录的稳定性。
1. 带有屏蔽层 。
2. 长度越短越好 。
3. 数据传输质量高。

:::

## 驱动安装与验证


在使用烧录工具前，Windows 用户需要确认驱动是否已安装。

**驱动安装**

USB 驱动可通过 Xburn 工具安装。

1. 打开 Xburn 工具。
2. 点击 `驱动` 页面，Xburn 工具将自动检测 USB 驱动是否安装，如果未安装则显示以下界面，点击 `安装` 即可。
   ![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/xburn_driver_uninstalled.png)

3. 安装后界面显示如下。
   ![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/xburn_driver_installed.png)



**验证驱动安装**

1. 连接 USB 线。
2. 驱动安装完成后，设备管理器可正常识别串口板端口，如下图：

   ![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/uart_ch340_device.png)

3. 下载远程连接工具 [Mobaxterm](https://mobaxterm.mobatek.net/download.html)。

4. 打开`MobaXterm`工具，点击`Session`，然后选择`Serial`，配置端口号，例如`COM3`，实际使用的串口号以 PC 识别到的串口号为准，设置完成后点击 `OK`。

   串口配置参数如下：

   | 配置项               | 参数值 |
   | -------------------- | ------ |
   | 波特率（Baud rate）  | 921600 |
   | 数据位（Data bits）  | 8      |
   | 奇偶校验（Parity）   | None   |
   | 停止位（Stop bits）  | 1      |
   | 流控（Flow Control） | 无     |

   ![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/mobaxterm_2.png)

5. 开发板上电后立刻长按空格键，进入 uboot 命令行模式，输入 fastboot 0，让开发板进入 fastboot 模式：

   ![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/mobaxterm_4.png)

6. 成功安装驱动后，设备管理器会显示 Android Device 设备，如下图：

   <!-- ![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-usbdriver-ok.png) -->
   <img 
   src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-usbdriver-ok.png" 
   style={{ width: '100%', height: 'auto', align:'center'}}
   />

   如果未成功安装驱动时，设备管理器会提示存在 USB download gadget 的未知设备，如下图：

   <!-- ![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-usbdriver-no.png) -->
   <img 
   src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-usbdriver-no.png" 
   style={{ width: '100%', height: 'auto', align:'center'}}
   />



## **系统全镜像烧录**


RDK S600 通过 Xburn 烧录全系统镜像。支持 `fastboot` 和 `dfu-fastboot` 两种下载模式，用户可在 Xburn 的 `下载模式` 选项处进行选择。

两种下载模式的具体区别如下:

|       下载模式   |     连接类型     | <center> 场景 </center>|  <center> 注意事项 </center>  |
| :-------------: | :--------------: | ----------  | -------------------------|
| [DFU+Fastboot](#dfu-fastboot-烧录) |  USB  |  空板或者系统损坏导致设备变砖等特殊情况   | 需设置启动模式进入 `dfu` 状态 |
| [Fastboot](#fastboot-烧录)     |  USB  |  非空板状态更新系统，满足常用烧录场景  | 要求非空板状态，且系统能进入 `uboot` 模式 |


### **DFU-Fastboot 烧录**

:::info 注意

**DFU-Fastboot 烧录方式**适用于空片烧录或者固件损坏无法进入 Uboot 情况。

:::


**如何使 RDK S600 进入 DFU 启动模式**

以下分别介绍 RDKS600 V1P0、V0P1 和 V0P2 进入 DFU 模式方式，请根据硬件型号操作。

**RDKS600 V1P0 DFU 模式**

   1. 将 `PWR KEY` 拨码至 `OFF`，关闭电源
   2. 将 `FLASH` 拨码至 `ON`，进入 dfu 模式
   3. 将 `PWR KEY` 拨码至 `ON`，开启电源
   4. 如果 `FLS` 红灯亮起，表示进入 dfu 模式

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-dfu-mode.png" alt="image-S600-dfu-mode" style={{ width: '100%' }} />

<details>
<summary>RDKS600 V0P1 DFU 模式</summary>

   1. 将 `PWR KEY` 拨码至 `OFF`，关闭电源
   2. 短接跳线帽，进入 dfu 模式
   3. 将 `PWR KEY` 拨码至 `ON`，开启电源
   4. 如果 `FLS` 红灯亮起，表示进入 dfu 模式

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-V0P1.png" alt="image-S600-V0P1" style={{ width: '100%' }} />

</details>

<details>
<summary>RDKS600 V0P2 DFU 模式</summary>

   1. 将 `PWR KEY` 拨码至 `OFF`，关闭电源
   2. 将 `FLASH` 拨码至 `ON`，进入 dfu 模式
   3. 将 `PWR KEY` 拨码至 `ON`，开启电源
   4. 如果 `FLS` 红灯亮起，表示进入 dfu 模式

</details>

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

以指定备份 `miniboot_flash` 为例

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

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-desktop_display_s100.jpg" alt="image-desktop_display.jpg" style={{ width: '100%' }} />





:::tip

更多问题的处理，可以查阅 [常见问题](../../08_FAQ/01_hardware_and_system.md) 章节，同时可以访问 [D-Robotics 开发者官方论坛](https://developer.d-robotics.cc/forum) 获得帮助。

:::
