---
sidebar_position: 9
---

# 7.2.9 Bluetooth Initialization Guide

```mdx-code-block
import DocScope from '@site/src/components/DocScope'
```

This chapter describes the initialization process and usage of the Bluetooth feature on the development board.

## Overview

The development board supports connecting Bluetooth modules through USB or UART interfaces. At system startup, the `hobot-bluetooth` service automatically detects and initializes Bluetooth devices.

### Supported Bluetooth Types

| Type | Interface | Description |
|------|------|------|
| USB Bluetooth | USB interface | Bluetooth adapter connected through a USB interface |
| UART Bluetooth | UART serial port | Bluetooth module connected through a UART serial port (such as CYW55560) |

## System Services

### hobot-bluetooth Service

Bluetooth initialization is managed by the `hobot-bluetooth.service` system service, which runs automatically at system startup.

**Service configuration file location**: `/lib/systemd/system/hobot-bluetooth.service`

```ini
[Unit]
Description=Hobot init Bluetooth
Before=getty.target system-getty.slice
After=hobot-loadko.service
StartLimitIntervalSec=60
StartLimitBurst=5

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/etc/init.d/hobot-bluetooth start
ExecStop=/usr/bin/hciconfig hci0 down > /dev/null 2>&1
TimeoutStartSec=1min
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Service Management Commands

```bash
# Check service status
systemctl status hobot-bluetooth

# Start service manually
sudo systemctl start hobot-bluetooth

# Stop service manually
sudo systemctl stop hobot-bluetooth

# Enable auto-start at boot
sudo systemctl enable hobot-bluetooth

# Disable auto-start at boot
sudo systemctl disable hobot-bluetooth
```

## Initialization Script Description

### Initialization Flow

The Bluetooth initialization script `/usr/bin/startbt.sh` detects and initializes Bluetooth devices in the following order:

```
┌─────────────────────────────┐
│    Bluetooth init start     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│    Detect USB Bluetooth     │
│    (lsusb -t | grep btusb)   │
└──────────────┬──────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
   USB detected    USB not detected
       │               │
       ▼               ▼
┌──────────────┐  ┌──────────────────┐
│ Load btusb   │  │ Detect UART BT    │
│ driver module│  │ (/dev/ttyS1)      │
└──────┬───────┘  └────────┬─────────┘
       │                   │
       │           ┌───────┴───────┐
       │           │               │
       │           ▼               ▼
       │       UART detected  UART not detected
       │           │               │
       │           ▼               ▼
       │    ┌──────────────┐  ┌──────────────┐
       │    │ GPIO control │  │  Exit with   │
       │    │ FW download  │  │    error     │
       │    │ hciattach    │  │              │
       │    └──────┬───────┘  └──────────────┘
       │           │
       └─────┬─────┘
             │
             ▼
    ┌──────────────────┐
    │ hciconfig hci0 up │
    │ hciconfig piscan  │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Init complete   │
    └──────────────────┘
```

### USB Bluetooth Initialization

When a USB Bluetooth device is detected, the initialization flow is as follows:

```bash
# 1. Load the btusb driver module
modprobe btusb

# 2. Wait for firmware loading to complete
sleep 3

# 3. Enable the Bluetooth device
hciconfig hci0 up
sleep 2
hciconfig hci0 piscan
```

### UART Bluetooth Initialization

When a UART Bluetooth device is detected, the initialization flow is as follows (using XM612 as an example; if you use a different Bluetooth module, contact the module vendor for details):

```bash
# Configuration parameters
BT_REG_GPIO=427              # Bluetooth enable GPIO
UART_PORT="/dev/ttyS1"       # UART port
UART_BAUD=921600             # Baud rate
FW="/lib/firmware/cypress/CYW55560A1.hcd"  # Firmware path

# 1. Export and configure GPIO
echo 427 > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio427/direction

# 2. Reset the Bluetooth module
echo 0 > /sys/class/gpio/gpio427/value
sleep 1
echo 1 > /sys/class/gpio/gpio427/value
sleep 2

# 3. Download firmware
mbt download /lib/firmware/cypress/CYW55560A1.hcd --autobaud3M
mbt update_baudrate 921600

# 4. Start HCI attach
hciattach -s 921600 /dev/ttyS1 any 921600 &

# 5. Enable the Bluetooth device
hciconfig hci0 up
hciconfig hci0 piscan
```

## Bluetooth Firmware

### Firmware Storage Paths

Bluetooth firmware is stored in the following directories:

| Chip Model | Firmware Path |
|---------|---------|
| Realtek RTL8852BTU | `/lib/firmware/rtl_bt/rtl8852btu_fw.bin` |
| Realtek RTL8723BS | `/lib/firmware/rtl_bt/rtl8723bs_fw.bin` |
| Cypress CYW55560 | `/lib/firmware/cypress/CYW55560A1.hcd` |

### View Loaded Firmware

```bash
# View rtl_bt firmware
ls -la /lib/firmware/rtl_bt/

# View cypress firmware
ls -la /lib/firmware/cypress/
```

## Bluetooth Status Query

### View Bluetooth Devices

```bash
# List Bluetooth devices
hciconfig

# View detailed Bluetooth device information
hciconfig hci0
```

Example output:
```
hci0:   Type: Primary  Bus: USB
        BD Address: 00:11:22:33:44:55  ACL MTU: 1021:8  SCO MTU: 64:1
        UP RUNNING PSCAN ISCAN
        RX bytes:1234 acl:0 sco:0 events:456 bytes:789
        TX bytes:987 acl:0 sco:0 commands:123 errors:0
```

### View Bluetooth Device Properties

```bash
# View Bluetooth device status
hciconfig hci0 status

# View Bluetooth device address
hciconfig hci0 | grep "BD Address"
```

## Bluetooth Operation Commands

### Enable/Disable Bluetooth

```bash
# Enable Bluetooth device
sudo hciconfig hci0 up

# Disable Bluetooth device
sudo hciconfig hci0 down

# Enable scan mode
sudo hciconfig hci0 piscan

# Disable scan mode
sudo hciconfig hci0 noscan
```

### Bluetooth Scanning

```bash
# Scan nearby Bluetooth devices
hcitool scan

# Scan BLE devices
hcitool lescan
```

### Bluetooth Pairing

```bash
# Pair using bluetoothctl
bluetoothctl

# In the bluetoothctl interactive interface:
[bluetooth]# power on
[bluetooth]# agent on
[bluetooth]# default-agent
[bluetooth]# scan on
[bluetooth]# pair XX:XX:XX:XX:XX:XX
[bluetooth]# trust XX:XX:XX:XX:XX:XX
[bluetooth]# connect XX:XX:XX:XX:XX:XX
```

## FAQ

### Bluetooth Device Not Recognized

If the Bluetooth device is not recognized, check the following:

1. **Check service status**
   ```bash
   systemctl status hobot-bluetooth
   ```

2. **Check device connection**
   ```bash
   # USB Bluetooth
   lsusb

   # UART devices
   ls -la /dev/ttyS*
   ```

3. **Check driver modules**
   ```bash
   lsmod | grep bt
   ```

### Firmware Loading Failed

If firmware loading fails:

1. **Check whether firmware files exist**
   ```bash
   ls -la /lib/firmware/rtl_bt/
   ls -la /lib/firmware/cypress/
   ```

2. **Check kernel logs**
   ```bash
   dmesg | grep -i bluetooth
   dmesg | grep -i firmware
   ```

### UART Bluetooth Initialization Failed

If UART Bluetooth initialization fails:

1. **Check GPIO status**
   ```bash
   cat /sys/class/gpio/gpio427/value
   ```

2. **Check UART port permissions**
   ```bash
   ls -la /dev/ttyS1
   ```

3. **Manually test UART**
   ```bash
   stty -F /dev/ttyS1 921600
   cat /dev/ttyS1 &
   echo "test" > /dev/ttyS1
   ```

### Manually Reinitialize Bluetooth

If you need to manually reinitialize Bluetooth:

```bash
# Stop the Bluetooth service
sudo systemctl stop hobot-bluetooth

# Disable the Bluetooth device
sudo hciconfig hci0 down

# Unload the driver module
sudo rmmod btusb

# Reload the driver
sudo modprobe btusb

# Start the Bluetooth service
sudo systemctl start hobot-bluetooth
```
