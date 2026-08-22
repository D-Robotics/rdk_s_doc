---
sidebar_position: 2
title: "Getting Started with RDK"
description: "Basic peripheral connection guide for RDK S100/S600: power, boot media, keyboard and mouse, display, audio, network, USB"
---

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

# Getting Started with RDK

This page guides you through connecting the basic peripherals and completing the first boot after you receive an RDK development board. Simply connect the power, display, and input devices to enter the desktop environment (Desktop edition) or the console (Server edition), preparing the board for the subsequent flashing, configuration, and development.

> For the installation of accessories such as the Camera Expansion Board and the MCU Port Expansion Board, see the documents of each board under [Hardware Introduction](/01_Quick_start/01_hardware_introduction/03_expansion_board). For in-depth network configuration, see [Network Configuration](../02_System_configuration/01_network_config.md). For flashing the OS, see [OS Flashing](./03_install_os_and_setup/01_instruction.md).

## Prerequisites

Before you begin, prepare the following:

- [ ] Development board kit (development board + power adapter).
- [ ] Desktop edition: HDMI monitor, USB keyboard and mouse.
- [ ] Server edition: TTL-USB serial cable (for serial login, see [Remote Login](03_install_os_and_setup/05_remote_login.md)).
- [ ] Wired Ethernet cable (optional; recommended for remote login).
- Completed: understanding the interface layout in [Introduction to the RDK S100 Hardware](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit) or [Introduction to the RDK S600 Hardware](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit).

## Power

The RDK development board is powered by an external DC power adapter. USB power supply is not supported.

:::warning Power-up Sequence
The development board must be powered on **before** any independently powered peripherals. If the peripherals are powered on first and back-feed power to the main board, the development board may trigger a protection state and fail to boot.
:::

<DocScope products="RDK-S100">

RDK S100 power specifications:

- Power input: DC 12~20V, maximum 150W
- Included adapter: 90W power adapter
- Power interface: DC round jack
- Power switch: **SW1** (toggle to ON to power on, OFF to power off)

</DocScope>

<DocScope products="RDK-S600">

RDK S600 power specifications:

- Power input: DC 12~28V
- Power interface: 4-pin connector
- Power switch: **SW3** (toggle to ON to power on, OFF to power off)

</DocScope>

## Boot Media

The RDK ships with a pre-installed system image and can boot directly from the onboard storage; no additional SD card is required.

<DocScope products="RDK-S100">

The RDK S100 boots from the onboard **eMMC**. The boot device selection is determined by the **SW3** DIP switch, which is set to the eMMC boot position at the factory. If you need to boot from other media (NVMe boot is currently not supported), refer to the SW3 description in [Introduction to the S100 Hardware](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#boot-device-selection-sw3).

</DocScope>

<DocScope products="RDK-S600">

The RDK S600 boots from the onboard **UFS**. The boot device selection is determined by the **SW8 BOOT** DIP switch, which is set to the UFS boot position at the factory. If you need to boot from NVMe, refer to the SW8 description in [Introduction to the S600 Hardware](/01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600_kit#bootsw8), and use the NVMe edition image.

</DocScope>

## Keyboard and Mouse

- **Wired keyboard and mouse**: Simply plug them into a **USB Type-A** port of the development board. The RDK S100 provides 4 USB 3.0 Type-A ports, and the RDK S600 provides 6 USB 3.2 Type-A ports.
- **Bluetooth keyboard and mouse**: You must first install the Wi-Fi & Bluetooth module (M.2 Key E interface). For pairing instructions, see [Bluetooth Configuration](../02_System_configuration/02_bluetooth_config.md).

## Display

Connect a monitor through the **HDMI** interface.

<DocScope products="RDK-S100">

The RDK S100 provides one HDMI Type-A port, supporting up to **2560×1440@60Hz**.

</DocScope>

<DocScope products="RDK-S600">

The RDK S600 provides one HDMI port.

</DocScope>

Once connected, power on the board. On the first boot, the system performs the default environment setup (about 45 seconds), and then outputs the Ubuntu desktop environment (Desktop edition) or the console (Server edition) on the display.

## Audio

Audio can be output via HDMI (built-in speakers of the monitor/TV) or via the onboard audio interface. The RDK S100 provides an onboard I2S/PCM audio interface; for the audio output configuration, see [Audio Configuration](../02_System_configuration/10_audio_output.md).

## Network

### Wired Network

Plug an Ethernet cable into the **RJ45** port of the development board.

<DocScope products="RDK-S100">

The RDK S100 provides 2 1000M Ethernet ports (RJ45).

</DocScope>

<DocScope products="RDK-S600">

The RDK S600 provides 2 1GbE + 2 10GbE Ethernet ports (RJ45), plus one 1GbE port in the MCU domain.

</DocScope>

In the factory system, eth0 obtains an IP automatically via DHCP by default, and eth1 has the static IP `192.168.127.10` by default. After power-on, you can check the IP via the display, or log in via serial/SSH and run `ip addr`.

### Wireless Network

Wi-Fi requires the M.2 Key E Wi-Fi & Bluetooth module to be installed first. For the Wi-Fi connection configuration, see [Network Configuration](../02_System_configuration/01_network_config.md).

## USB Flash Connection

The USB Type-A ports are used for connecting storage devices such as USB flash drives and portable hard drives. The USB Type-C port is used for OS flashing and serial debugging, and is not used as a regular USB data port. For flashing instructions, see [OS Flashing](./03_install_os_and_setup/01_instruction.md).

## First Boot

1. Connect the power adapter.
2. Connect the display (HDMI), keyboard, and mouse (Desktop edition) or the serial cable (Server edition).
3. Plug the wired network into RJ45 (optional, but recommended for remote login).
4. Toggle the power switch to **ON** to power on the development board.
5. Watch the power indicator light up; the system starts booting.
6. The first boot takes about 45 seconds for the automatic setup, after which you enter the desktop or the console.

:::tip Default Accounts
- Regular user: username `sunrise`, password `sunrise`
- Superuser: username `root`, password `root`
:::

## Result Verification

- ✅ The power indicator stays on, and the system status indicator blinks (the system is running properly).
- ✅ Desktop edition: the Ubuntu desktop is displayed on the monitor. Server edition: the login prompt is shown in the serial output.
- ✅ After logging in via serial or SSH, running `ip addr` shows the IP addresses of eth0/eth1 or wlan0.

## FAQ

- **No display output after power-on**: Verify that the power switch is toggled to ON, the HDMI cable is firmly connected, and the input source of the monitor is switched to the corresponding HDMI port.
- **The development board fails to boot**: Check the power-up sequence (independently powered peripherals must not be powered on before the development board), and check whether the boot media DIP switch is set to the default boot position.
- **Keyboard and mouse are unresponsive**: Try another USB Type-A port; make sure you are using a wired keyboard and mouse (Bluetooth keyboards/mice require the Wi-Fi & Bluetooth module to be installed first).

## Related Documentation

- [Hardware Introduction](/01_Quick_start/01_hardware_introduction/03_expansion_board)
- [OS Flashing](./03_install_os_and_setup/01_instruction.md)
- [System Status Query](03_install_os_and_setup/03_system_status.md)
- [Initial Configuration](03_install_os_and_setup/04_configuration_wizard.md)
- [Remote Login](03_install_os_and_setup/05_remote_login.md)
- [Network Configuration](../02_System_configuration/01_network_config.md)
