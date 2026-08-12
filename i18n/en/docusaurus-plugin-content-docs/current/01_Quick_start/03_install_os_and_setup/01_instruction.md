---
sidebar_position: 1
---

# Flashing preparation

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Safety notes

- Do not hot-plug any devices other than USB, HDMI, and Ethernet cables while powered on.
- Use a power adapter from a reputable brand; otherwise, abnormal power supply may cause unexpected system shutdowns.
- Use the onboard POWER ON/OFF button to power the board on and off, and plug or unplug the DC connector only when the adapter is disconnected from power.

## Image download

:::warning
The device ships with a test firmware preinstalled. Flash the latest image before you use the device.
:::

<DocScope products="RDK-S100">

The RDK S100 provides an Ubuntu 22.04 desktop system image with a graphical desktop environment.

1. Go to the [image download page](https://archive.d-robotics.cc/downloads/os_images/rdk_s100/) and select the latest RDK S100 image > **RDK LNX SDK** > **firmwares** > **product.zip**.

2. After extraction, you get a **product** folder. Confirm it contains an **img_packages** folder and an **xmodem_tools** folder.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/acore-product.png" alt="product folder interface" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK-S600">

The RDK S600 provides an Ubuntu 24.04 desktop system image with a graphical desktop environment.

1. Go to the [image download page](https://archive.d-robotics.cc/downloads/os_images/rdk_s600/) and select the latest RDK S600 image > **RDK LNX SDK** > **firmwares** > **product.zip**.

2. After extraction, you get a **product** folder. Confirm it contains an **img_packages** folder and an **xmodem_tools** folder.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/product-folder.png" alt="product folder interface" style={{ width: '100%' }} />

</DocScope>

## Flashing tool

Download and install the XBurn tool. See [Install XBurn](https://developer.d-robotics.cc/xburn_doc/install).

## Cable requirements

Flashing transfers the image over a Type-C data cable. A substandard cable causes transmission errors or flashing failure. The cable must meet the following conditions:

- **Shielded**: The cable has a metal braid or aluminum foil shield to reduce transmission errors.
- **As short as possible**: A longer cable increases signal attenuation.
- **Data-capable**: Some cables only supply power and do not transfer data. Use a cable that supports USB data transfer, not a charge-only cable.

## Hardware connection

<DocScope products="RDK-S100">

Use a Type-C data cable to connect a USB port on your PC to the Type-C port of the RDK S100.

</DocScope>

<DocScope products="RDK-S600">

Use a Type-C data cable to connect a USB port on your PC to the Type-C port of the RDK S600.

</DocScope>

## Environment setup

Install the drivers and dependencies for your operating system. **Complete this before flashing**; otherwise XBurn cannot detect the device:

- [Windows environment](https://developer.d-robotics.cc/xburn_doc/environment/windows-setup): USB drivers (ADB, Fastboot, DFU) and the CH341 serial driver
- [Linux environment](https://developer.d-robotics.cc/xburn_doc/environment/linux-setup): adb/fastboot/dfu-util dependencies and udev rules
- [macOS environment](https://developer.d-robotics.cc/xburn_doc/environment/mac-setup): brew dependencies (android-platform-tools, dfu-util)

## Related documents

- [Flashing steps](/Quick_start/install_os_and_setup/burn)
- [System status](/Quick_start/install_os_and_setup/system_status)
- [Remote login](/Quick_start/install_os_and_setup/remote_login)

<DocScope products="RDK-S100">

- [S100 hardware introduction](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit)

</DocScope>

<DocScope products="RDK-S600">

- [S600 hardware introduction](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit)

</DocScope>
