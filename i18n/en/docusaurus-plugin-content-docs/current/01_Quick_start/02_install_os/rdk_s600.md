---
sidebar_position: 4
sidebar_products: RDK S600
---

# 1.2.1 System Flashing

The RDK S600 kit currently provides the Ubuntu 22.04 system image, which supports Desktop graphical interaction. The RDK S600 is pre-flashed with a test version system image from the factory. To ensure the latest system version is used, it is recommended to refer to this document to flash the latest system image.

Based on the PC flashing tool Xburn provided by the system, the following firmware update operations can be performed:

- [Full System Image Flashing](#full-system-image-flashing)
- [Designated Area Flashing](#designated-area-flashing)
- [Designated Area Backup](#designated-area-backup)

## **Hardware**

### **Power Supply**

The RDK S600 development board is powered via the DC interface. It is recommended to use the power adapter included in the kit.

### **Storage**

The RDK S600 uses UFS as the system storage medium.

### **Hardware Connection**

Prepare a USB Type-C cable. Connect one end of the cable to the board's Type-C interface and the other end to the PC.

:::warning Precautions

- Do not plug or unplug any devices except USB, HDMI, and Ethernet cables while the power is on.
- Use a power adapter from a reputable brand; otherwise, abnormal power supply may cause unexpected system power loss.
- It is recommended to use the onboard POWER ON/OFF button to power the board on/off and to plug/unplug the DC connector when the adapter is powered off.

:::

## **Preparation for Flashing**

### **Image Download**

1. Download the image package. For the download address, please refer to section [1.6 Resource Summary](../../01_Quick_start/download.md).
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S600/basic_information/download_web.png" alt="" style={{ width: '100%' }} />

2. After decompression, you will get the `product` directory. Ensure it contains the `img_packages` and `xmodem_tools` subdirectories.
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/acore_product.png" alt="" style={{ width: '100%' }} />

### **Flashing Tool Xburn**

Please refer to the subsequent sections of this page for the installation and usage guide of the Xburn flashing tool.

## **Full System Image Flashing**

The RDK S600 uses Xburn to flash the full system image. It supports two download modes: `fastboot` and `dfu-fastboot`. Users can select the mode in the `Download Mode` option of Xburn.

The specific differences between the two download modes are as follows:

| Download Mode     | Connection Type | <center> Scenario </center>                                  | <center> Precautions </center>                                    |
| :---------------: | :-------------: | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| [DFU+Fastboot](#dfu-fastboot-flashing) | USB             | Special cases like an empty board or system corruption causing the device to be bricked | Requires setting the boot mode to enter `dfu` state               |
| [Fastboot](#fastboot-flashing)         | USB             | Updating the system on a non-empty board, suitable for common flashing scenarios | Requires a non-empty board state and the system to enter `uboot` mode |

### **DFU-Fastboot Flashing**

:::info Note

**DFU-Fastboot Flashing Method**

- Suitable for flashing an empty board or when the firmware is corrupted preventing entry into Uboot.

:::

**How to make the RDK S600 enter DFU boot mode**

The following describes how to enter DFU mode for RDKS600 V0P1 and V0P2 respectively. Users should operate according to the hardware version.

**RDKS600 V0P1 dfu mode**

   1. Toggle the `PWR KEY` dip switch to `OFF` to power off.
   2. Short the jumper cap to enter dfu mode.
   3. Toggle the `PWR KEY` dip switch to `ON` to power on.
   4. If the red `FLS` LED lights up, it indicates entry into dfu mode.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-V0P1.png" alt="image-S600-V0P1" style={{ width: '100%' }} />

**RDKS600 V0P2 dfu mode**

   1. Toggle the `PWR KEY` dip switch to `OFF` to power off.
   2. Toggle the `FLASH` dip switch to `ON` to enter dfu mode.
   3. Toggle the `PWR KEY` dip switch to `ON` to power on.
   4. If the red `FLS` LED lights up, it indicates entry into dfu mode.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-dfu-mode.png" alt="image-S600-dfu-mode" style={{ width: '100%' }} />

**Using Xburn for DFU-Fastboot Flashing**

Open Xburn and set the parameters as follows:

   - Select Product Model: `RDKS600`
   - Connection Mode: `usb`, Download Mode: `DFU+Fastboot`
   - Storage Medium: `ufs`, Type: `secure`

   Refer to the settings interface below:

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-download_dfu.png" alt="image-S600-xburn-download_dfu" style={{ width: '100%' }} />

- Click Browse to select the product folder containing the firmware.

- Click Start Upgrade, power on the device, and wait for the upgrade to complete.
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-burn_progress.png" alt="" style={{ width: '100%' }} />

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

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-download_fastboot.png" alt="" style={{ width: '100%' }} />

- Click Browse to select the product folder containing the firmware.

- Click Start Upgrade. The device enters Fastboot mode and waits for the upgrade to complete.
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-burn_progress.png" alt="" style={{ width: '100%' }} />

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

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-download_partition.png" alt="" style={{ width: '100%' }} />

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

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-backup_partition.png" alt="" style={{ width: '100%' }} />

- Click Browse to select the product folder containing the firmware.

- Click Start Upgrade, power on the device, and wait for the operation to complete.

- After the operation is complete, open `img_packages/disk/` to view the backup image file `miniboot_flash_backup.img`.
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-backup_partition_image.png" alt="" style={{ width: '100%' }} />

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

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-desktop_display_s100.jpg" alt="image-desktop_display.jpg" style={{ width: '100%' }} />

## **Frequently Asked Questions**

### **Issues Encountered with Ubuntu System Laptop**

1. **Garbled serial output after connecting the development board to an Ubuntu system laptop**

   1. Download the official serial driver [CH340N Driver](https://www.wch.cn/downloads/CH341SER_LINUX_ZIP.html)
   2. Modify `ch341_tty_driver->name = "ttyUSB";`
   3. Recompile and install the driver

2. **Driver installation required for Ubuntu 24.04 system**

   1. Execute the following script:

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

   2. Or execute the following commands sequentially:

   ```bash
   # Update APT sources
   sudo apt update

   # Install DFU tool and libusb
   sudo apt install -y dfu-util libusb-1.0-0-dev

   # Set development board interface permissions
   sudo tee /etc/udev/rules.d/99-drobotics.rules > /dev/null <<EOF
   SUBSYSTEM=="usb", ATTR{idVendor}=="3652", ATTR{idProduct}=="6610", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="3652", ATTR{idProduct}=="6615", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="3652", ATTR{idProduct}=="6620", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="3652", ATTR{idProduct}=="6625", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="18d1", ATTR{idProduct}=="6631", MODE="0666"
   SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", MODE="0666"
   EOF

   # Reload udev
   sudo udevadm control --reload
   sudo udevadm trigger
   ```

   3. Use a USB Type-C cable to connect the computer and the board's Type-C port (near the DC power connector).
   4. Click [Download](https://archive.d-robotics.cc/downloads/software_tools/download_tools/) the latest `Xburn` tool.
   5. Install and launch the `Xburn` flashing tool.

### **Garbled Serial Output Issue with MacOS System Laptop**

Taking MacOS version 15.0 (M3 chip) as an example, the default macOS serial driver connecting to CH340N at 921600 baud rate may produce garbled output. The latest CH340N driver needs to be installed. Procedure:

1. With the default CH340N driver, the connected device appears as `tty.usbserial*`, indicating the default macOS serial driver is in use and needs updating:
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-ttyusb.png" alt="" style={{ width: '100%' }} />

2. Installation procedure (based on the README.md on the [CH340N Latest Driver Release Page](https://github.com/WCHSoftGroup/ch34xser_macos?tab=readme-ov-file)):
   1. Click to download the zip package on the [CH340N Latest Driver Release Page](https://github.com/WCHSoftGroup/ch34xser_macos?tab=readme-ov-file)
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install1.png" alt="" style={{ width: '100%' }} />
   2. Unzip and use the pkg package to install the driver.
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install2.png" alt="" style={{ width: '100%' }} />
   3. Click Continue.
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install3.png" alt="" style={{ width: '100%' }} />
   4. Click Install and enter the password.
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install4.png" alt="" style={{ width: '100%' }} />
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install5.png" alt="" style={{ width: '100%' }} />
   5. Click Install, open System Settings.
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install6.png" alt="" style={{ width: '100%' }} />
   6. Authorize and enter the password.
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install7.png" alt="" style={{ width: '100%' }} />
   7. A pop-up indicates successful installation.
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-install8.png" alt="" style={{ width: '100%' }} />
   8. **<font color='red'>Restart the computer</font>**.
   9. Check if the installation was successful. Recognizing `tty.wch*` indicates successful driver installation.
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-ttywch.png" alt="" style={{ width: '100%' }} />
3. Verify by connecting to the device.
   :::warning Note

   The latest official CH340N driver still does not support the macOS built-in `screen` tool for communication at 921600 baud rate. Use the `minicom` tool.

   :::

   1. Using the example above, the smaller number is usually the ACore serial port, the larger one is the MCU serial port. In the image, `/dev/tty.wchusbserial1220` is the ACore serial port, `/dev/tty.wchusbserial1230` is the MCU serial port. Command to connect to the ACore serial port: `minicom -D /dev/tty.wchusbserial1220 -b 921600 -8`; Command to connect to the MCU serial port: `minicom -D /dev/tty.wchusbserial1230 -b 921600 -8`. Replace the device path in the command according to your actual **/dev/tty.wchusbserial** device number.
   2. `minicom` command to connect to the ACore serial port (`minicom -D /dev/tty.wchusbserial1220 -b 921600 -8`):
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-minicom.png" alt="" style={{ width: '100%' }} />
   3. Verify connection to the development board.
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-minicom-success.png" alt="" style={{ width: '100%' }} />

4. FAQ

    Q1: After previously installing or downloading the CH340N driver from the official website, the serial output is still garbled.
      A: If you have installed the driver from the official website but still see `tty.usbserial*` for the device, move CH34xVCPDriverApp to the Trash, empty the Trash, **<font color='red'>restart the computer</font>**, and reinstall following [the steps above](#garbled-serial-output-issue-with-macos-system-laptop).

:::tip

For solutions to more issues, please refer to the [FAQ](../../08_FAQ/01_hardware_and_system.md) section. You can also visit the [D-Robotics Official Developer Forum](https://developer.d-robotics.cc/forum) for assistance.

:::