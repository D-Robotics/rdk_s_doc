---
sidebar_position: 1
---

# Flashing Steps on Windows Platform

## Hardware Connection

Use a Type-C data cable to connect the USB port of the PC to the Type-C port of the development board.

:::warning Note

Please ensure that the Type-C data cable is of high quality to guarantee the stability of the burning process.
1. It should have a shielding layer.
2. The shorter the length, the better.
3. It should have high data transmission quality.

:::

## Driver Installation and Verification

Before using the flashing tool, Windows users need to confirm whether the driver has been installed.

**Driver Installation**

The USB driver can be installed via the Xburn tool.

1. Open the Xburn tool.
2. Click the `Drivers` page. Xburn will automatically detect whether the USB driver is installed. If not installed, Click `Install`.
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/xburn_driver_uninstalled-en.png" alt="Driver Installation and Verification diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. After installation, the interface appears as follows.
   <img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/xburn_driver_installed-en.png' alt='Driver Installation and Verification diagram' style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


**Verify Driver Installation**

1. Connect the USB cable.
2. After the driver is installed, the Device Manager will correctly recognize the serial port board, as shown in the figure below:
  <img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-20220416105939067.png' alt='Serial port recognized in Device Manager' style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. Download the remote connection tool [Mobaxterm](https://mobaxterm.mobatek.net/download.html).

4. Open the `MobaXterm` tool, click `Session`, then select `Serial`. Configure the port number, for example, `COM3`. The actual serial port number used should match the one recognized by the PC. After completing the settings, click `OK`.

   The serial port configuration parameters are as follows:

   | Configuration Item      | Value  |
   | ----------------------- | ------ |
   | Baud rate               | 921600 |
   | Data bits               | 8      |
   | Parity                  | None   |
   | Stop bits               | 1      |
   | Flow Control            | None   |

   <img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/mobaxterm_2.png' alt='Driver Installation and Verification diagram' style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

5. After powering on the development board, immediately press and hold the space bar to enter the uboot command line mode. Type `fastboot 0` to make the development board enter fastboot mode:

   <img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/mobaxterm_4.png' alt='Driver Installation and Verification diagram' style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

6. After successfully installing the driver, the Device Manager will show an Android Device, as shown below:

   <!-- <img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-usbdriver-ok.png' alt='Driver Installation and Verification diagram' style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} /> -->
   <img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-usbdriver-ok-en.jpg' alt='Driver Installation and Verification diagram' style={{ width: '100%', height: 'auto', align:'center', maxWidth: '980px', display: 'block', margin: '0 auto' }} />

   If the driver installation is unsuccessful, the Device Manager will indicate an unknown device named USB download gadget, as shown below:

   <!-- <img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-usbdriver-no.png' alt='Driver Installation and Verification diagram' style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} /> -->
   <img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-usb-driver1.png' alt='Driver Installation and Verification diagram' style={{ width: '100%', height: 'auto', align:'center', maxWidth: '980px', display: 'block', margin: '0 auto' }} />

## **Full System Image Flashing**

The RDK S600 uses Xburn to flash the full system image. It supports two download modes: `fastboot` and `dfu-fastboot`. Users can select the mode in the `Download Mode` option of Xburn.

The specific differences between the two download modes are as follows:

| Download Mode     | Connection Type | <center> Scenario </center>                                  | <center> Precautions </center>                                    |
| :---------------: | :-------------: | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| [DFU+Fastboot](#dfu-fastboot-flashing) | USB             | Special cases like an empty board or system corruption causing the device to be bricked | Requires setting the boot mode to enter `dfu` state               |
| [Fastboot](#fastboot-flashing)         | USB             | Updating the system on a non-empty board, suitable for common flashing scenarios | Requires a non-empty board state and the system to enter `uboot` mode |

### **DFU-Fastboot Flashing**

:::info Note

**DFU-Fastboot Flashing Method** is suitable for flashing an empty board or when the firmware is corrupted preventing entry into Uboot.

:::

**How to make the RDK S600 enter DFU boot mode**

The following describes how to enter DFU mode for RDKS600 V1P0, V0P1, and V0P2 respectively. Operate according to your hardware version.

**RDKS600 V1P0 DFU Mode**

   1. Toggle the `PWR KEY` dip switch to `OFF` to power off.
   2. Toggle the `FLASH` dip switch to `ON` to enter dfu mode.
   3. Toggle the `PWR KEY` dip switch to `ON` to power on.
   4. If the red `FLS` LED lights up, it indicates entry into dfu mode.

<img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-dfu-mode.png' alt='How to put RDK S600 into DFU mode' style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

<details>
<summary>RDKS600 V0P1 DFU Mode</summary>

   1. Toggle the `PWR KEY` dip switch to `OFF` to power off.
   2. Short the jumper cap to enter dfu mode.
   3. Toggle the `PWR KEY` dip switch to `ON` to power on.
   4. If the red `FLS` LED lights up, it indicates entry into dfu mode.

<img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-V0P1-en.png' alt='DFU-Fastboot Flashing diagram' style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</details>

<details>
<summary>RDKS600 V0P2 DFU Mode</summary>

   1. Toggle the `PWR KEY` dip switch to `OFF` to power off.
   2. Toggle the `FLASH` dip switch to `ON` to enter dfu mode.
   3. Toggle the `PWR KEY` dip switch to `ON` to power on.
   4. If the red `FLS` LED lights up, it indicates entry into dfu mode.

</details>

**Using Xburn for DFU-Fastboot Flashing**

Open Xburn and set the parameters as follows:

   - Select Product Model: `RDKS600`
   - Connection Mode: `usb`, Download Mode: `DFU+Fastboot`
   - Storage Medium: `ufs`, Type: `secure`

   Refer to the settings interface below:

   <img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-download_dfu-en.png' alt='DFU-Fastboot Flashing diagram' style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- Click Browse to select the product folder containing the firmware.

- Click Start Upgrade, power on the device, and wait for the upgrade to complete.
   <img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S100-xburn-burn_progress-en.png' alt='DFU-Fastboot Flashing diagram' style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- After the upgrade is complete, power off the device, switch to normal boot mode, and power on again.

### **Fastboot Flashing**

:::info Note

**Fastboot Flashing Method**

- The RDK S600 uses normal boot mode.
- Ensure the system U-boot starts normally and enters Fastboot.

:::

**How to make the RDK S600 enter Fastboot mode**

You can enter Fastboot in two ways:

- Automatic Fastboot Entry: After system startup, an ADB device is automatically generated. Xburn detects the ADB device and sends commands to make the board enter Fastboot.
- Manual Fastboot Entry: After the board starts and enters uboot, type `fastboot 0` to enter Fastboot.

**Using Xburn for Fastboot Flashing**

Open Xburn and set the parameters as follows:

   - Select Product Model: `RDKS600`
   - Connection Mode: `usb`, Download Mode: `Fastboot`
   - Storage Medium: `ufs`, Type: `secure`

   Refer to the settings interface below:

   <img src='https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-download_fastboot-en.png' alt='Fastboot Flashing diagram' style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- Click Browse to select the product folder containing the firmware.

- Click Start Upgrade. The device enters Fastboot mode and waits for the upgrade to complete.
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S100-xburn-burn_progress-en.png" alt="Fastboot Flashing diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- Power cycle the device after the upgrade is complete.

## **Designated Area Flashing**{#designated-area-flashing}

### **Description of Flashing Areas**

The RDK S600 supports flashing designated areas via Xburn. The supported flashing areas are as follows:

| Area            | Storage Medium | <center> Firmware Content </center>                                | <center> Image </center>                               |
| :-------------: | :------------: | ------------------------------------------------------------ | --------------------------------------------------- |
| miniboot_flash  | Norflash       | Basic boot image on Norflash, including images for system components like HSM/MCU0 | img_packages/disk/miniboot_flash.img                |
| miniboot_ufs    | ufs            | Basic boot image on ufs, including images for system components like BL31/Uboot | img_packages/disk/miniboot_ufs.img                  |
| ufs             | ufs            | Complete ufs image, includes miniboot_ufs                     | img_packages/disk/ufs_disk.img                      |

### **Using Xburn for Designated Area Flashing**

Take flashing `miniboot_flash` and `miniboot_ufs` as an example.

Open Xburn and set the parameters as follows:

   - Select Product Model: `RDKS600`
   - Connection Mode: `usb`, Download Mode: `DFU+Fastboot`
   - Storage Medium: `ufs`, Type: `secure`
   - Advanced Configuration: Check `Flash Designated Area`, check `miniboot_flash` and `miniboot_ufs`

   Refer to the settings interface below:

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-download_partition-en.png" alt="Using Xburn for Designated Area Flashing diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- Click Browse to select the product folder containing the firmware.

- Click Start Upgrade, power on the device, and wait for the upgrade to complete.

## **Designated Area Backup**

### **Description of Backup Areas**

The RDK S600 supports backing up designated areas via Xburn. The supported backup areas are as follows:

| Area            | Storage Medium | <center> Firmware Content </center>         | <center> Backup Image Path </center>                     |
| :-------------: | :------------: | ------------------------------------- | ----------------------------------------------------- |
| miniboot_flash  | Norflash       | Complete Norflash image               | img_packages/disk/miniboot_flash_backup.img           |
| ufs             | ufs            | Complete ufs image                     | img_packages/disk/ufs_disk_backup.img                 |

### **Using Xburn for Designated Area Backup**

Take backing up `miniboot_flash` as an example.

Open Xburn and set the parameters as follows:

   - Select Product Model: `RDKS600`
   - Connection Mode: `usb`, Download Mode: `DFU+Fastboot`
   - Storage Medium: `ufs`, Type: `secure`
   - Advanced Configuration: Check `Backup Designated Area`, check `miniboot_flash`

   Refer to the settings interface below:

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-backup_partition-en.png" alt="Using Xburn for Designated Area Backup diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- Click Browse to select the product folder containing the firmware.

- Click Start Upgrade, power on the device, and wait for the operation to complete.

- After the operation is complete, open `img_packages/disk/` to view the backup image file `miniboot_flash_backup.img`.
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-backup_partition_image.png" alt="Using Xburn for Designated Area Backup photo" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::info Note

Backing up entire storage medium data takes a long time. Please wait patiently for the backup to finish.

:::

## **Booting the System**

First, keep the development board powered off. Connect the development board to a monitor using an HDMI cable. Then, power on the development board.

On the first boot, the system will configure the default environment. This process takes about 45 seconds. After configuration, the Ubuntu system desktop will be output on the monitor.

:::tip Development Board LED Indicator Description

- **<font color='Green'>Green</font>** indicator: Lights up to indicate normal hardware power-on.

If there is no display output for a long time (over 2 minutes) after powering on the development board, it indicates a boot anomaly. Debugging via the serial cable is required to check if the development board is functioning normally.

:::

After the Ubuntu Desktop system finishes booting, the system desktop will be output on the monitor via the Display interface, as shown below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-desktop_display_s100.jpg" alt="Booting the System diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::tip

For solutions to more issues, please refer to the [FAQ](../../08_FAQ/01_hardware_and_system.md) section. You can also visit the [D-Robotics Official Developer Forum](https://developer.d-robotics.cc/forum) for assistance.

:::