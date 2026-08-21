---
title: "Debug Serial Port"
sidebar_position: 16
description: "Wiring the debug serial port USB Type-C, configuring serial tools, and logging in via the serial port"
---

# Debug Serial Port

The debug serial port is a **hardware-level entry point** when the system fails to boot — it does not depend on the network or on the system being healthy. You can view boot logs and enter U-Boot/the recovery system directly through the onboard debug serial port. When network login is unavailable, the serial port is the fallback.

## Hardware Wiring

The debug serial port of RDK S100/S600 is converted to USB by an onboard CH340 chip and exposed through a USB Type-C port, so no TTL serial cable is needed:

- RDK S100: USB Type-C (J16), with 2 built-in CH340 chips corresponding to the debug serial ports of the Main domain and the MCU domain respectively.
- RDK S600: USB Type-C (J4), likewise with 2 built-in CH340 chips.

Connect the board's debug port and the PC with a USB Type-C data cable. On first use you need to install the CH340 driver (search for `CH340 serial port driver` to download and install it). The PC will enumerate two serial ports for the Main domain and the MCU domain; the Main domain one is the Linux debug serial port.

For connector locations and parameters, see the hardware introduction of each board:

- [RDK S100 Hardware Introduction - Type-C (J16)](../01_Quick_start/01_hardware_introduction/01_rdk_s100.md#type-c-j16)
- [RDK S600 Hardware Introduction - Flash Port: Flashing, Main&MCU Debugging (J4)](../01_Quick_start/01_hardware_introduction/02_rdk_s600.md#j4)

## PC Serial Tool

After installing the CH340 driver, use `Putty`/`MobaXterm`/`minicom`/`SecureCRT` to connect to the Main-domain serial port:

| Configuration | Value |
|---|---|
| Baud rate | 921600 |
| Data bits | 8 |
| Parity | None |
| Stop bits | 1 |
| Flow Control | None |

The baud rate of 921600 can be confirmed from the kernel command line on the board: `cat /proc/cmdline` shows `console=ttyS0,921600n8`.

### Windows (MobaXterm)

Create a new Serial session, select the COM port recognized by the PC, and configure it as in the table above. After connecting, press Enter to get the login prompt, then enter `root`/`root`.

### macOS/Linux (minicom)

```bash
minicom -D /dev/ttyUSB0 -b 921600 -8
# or screen
screen /dev/ttyUSB0 921600
```

## Serial Port Login

After connecting and powering on, the serial port outputs boot logs (U-Boot → kernel → systemd). Once the system is up, press Enter to get the login prompt and enter the account credentials (see [User and Permission Management](./14_user_permission.md)).

## Entering U-Boot (When the System Fails to Boot)

At the moment of power-on, press any key (or space) in the serial terminal to interrupt auto-boot and enter the U-Boot command line, where you can check/modify boot parameters and recover the boot. For U-Boot parameter configuration, see [Configuring U-Boot and Kernel Option Parameters](../07_Advanced_development/04_driver_development/01_uboot_kernel_config.md).

## Common Issues

- **No output on the serial port**: The wrong serial port is selected (the board enumerates two serial ports, Main/MCU; select the Main domain); the baud rate is wrong (confirm 921600); the CH340 driver is not installed.
- **Garbled characters**: The baud rate is wrong (confirm 921600); a leftover macOS driver, see [macOS driver residue causing garbled text](https://developer.d-robotics.cc/xburn_doc/troubleshooting/serial-driver).
- **Cannot enter U-Boot**: The power-on timing must be early (interrupt as soon as boot logs start); if missed, restart and retry.

## Related Documents

- [Remote Login](../01_Quick_start/03_install_os_and_setup/05_remote_login.md)
- [User and Permission Management](./14_user_permission.md)
- [Configuring U-Boot and Kernel Option Parameters (Advanced)](../07_Advanced_development/04_driver_development/01_uboot_kernel_config.md)
- [System Log Viewing](./15_system_log.md)
