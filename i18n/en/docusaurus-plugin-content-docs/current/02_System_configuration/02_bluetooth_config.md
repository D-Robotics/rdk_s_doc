---
title: "Bluetooth Configuration"
sidebar_position: 2
description: "Bluetooth service status, scanning, pairing, and connection"
---

# Bluetooth Configuration

RDK OS comes with the BlueZ Bluetooth stack preinstalled, and `bluetooth.service` is enabled by default. On the board, you can use `bluetoothctl` to scan, pair, and connect Bluetooth devices (keyboard and mouse, headphones, BLE peripherals, etc.). For Bluetooth driver initialization, see the advanced [Bluetooth Initialization Guide](../07_Advanced_development/03_system_software/05_bluetooth_init.md).

## Checking Bluetooth Status

```bash
systemctl is-active bluetooth        # Whether the service is running
rfkill list                          # Whether it is soft/hard blocked
hciconfig                            # Controller status
```

Tested on RDK S600 (USB Bluetooth adapter hci0):

```text
$ systemctl is-active bluetooth
active

$ rfkill list
1: hci0: Bluetooth
        Soft blocked: no
        Hard blocked: no

$ hciconfig
hci0:   Type: Primary  Bus: USB
        BD Address: EC:3A:56:69:C4:E1  ACL MTU: 1021:8  SCO MTU: 255:12
        UP RUNNING PSCAN ISCAN
```

`Soft/Hard blocked: no` + `UP RUNNING` indicates that Bluetooth is ready. If blocked, use `sudo rfkill unblock bluetooth` to unblock it.

## Scanning and Pairing (bluetoothctl)

`bluetoothctl` is an interactive command-line tool (version 5.72):

```bash
bluetoothctl
# After entering the interactive mode:
[bluetooth]# power on               # Power on
[bluetooth]# agent on
[bluetooth]# default-agent
[bluetooth]# scan on                 # Start scanning
# When the target device appears, note down its MAC address
[bluetooth]# pair <MAC>              # Pair
[bluetooth]# trust <MAC>             # Trust (no need to pair again)
[bluetooth]# connect <MAC>           # Connect
[bluetooth]# quit
```

During pairing, both sides need to confirm the PIN or matching code. Once successful, the device is listed in `bluetoothctl devices`.

## Paired/Connected Devices

```bash
bluetoothctl devices                 # List of paired devices
bluetoothctl info <MAC>               # Details of a device (including Connected status)
```

Disconnect: `bluetoothctl disconnect <MAC>`; Remove: `bluetoothctl remove <MAC>`.

## Automatic Reconnection on Boot

Auto-reconnection in BlueZ is controlled by `ReconnectAttempts` and
`ReconnectIntervals` in `/etc/bluetooth/main.conf` (the number of reconnection attempts and intervals after the link is disconnected), which are commented out by default.
HID-class devices (keyboard and mouse) usually initiate reconnection from the peripheral side; if you need to adjust the reconnection behavior, uncomment and
configure the above two items, then restart `bluetooth.service`.

## FAQ

- **`rfkill` shows blocked**: `sudo rfkill unblock bluetooth`; some boards have a hardware switch that needs to be turned on manually.
- **Device cannot be found by scanning**: Confirm that the peer device is discoverable; check whether `hciconfig` shows `UP`; check whether the USB adapter is recognized (`lsusb`).
- **Cannot connect after pairing**: `trust` the device; audio devices additionally require configuring a pulseaudio/pipewire profile.
- **No automatic reconnection on boot**: Check `ReconnectAttempts` and
  `ReconnectIntervals` in `/etc/bluetooth/main.conf` (commented out by default); for HID devices, try having the peripheral initiate the connection.

## Related Documentation

- [Bluetooth Initialization Guide (Advanced)](../07_Advanced_development/03_system_software/05_bluetooth_init.md)
- [Network Configuration](./01_network_config.md)
- [Boot Auto-Start Configuration](./06_self_start.md)
