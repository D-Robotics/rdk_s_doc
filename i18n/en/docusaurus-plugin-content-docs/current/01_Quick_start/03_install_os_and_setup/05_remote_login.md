---
title: "Remote Login"
sidebar_position: 5
description: "Methods and default accounts for remotely logging in to the development board via SSH/serial port/NoMachine"
---

# Remote Login

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

Remote login is the basic way to access the development board from a PC after flashing the system. The board typically has no dedicated monitor or keyboard/mouse during daily development, so it must be operated remotely via the serial port or SSH. After logging in, you get the board's shell on the PC, where you can run commands, deploy programs, and debug.

## Prerequisites

- [ ] The board has been flashed with RDK OS and finished booting (see [System flashing and configuration](./01_instruction.md)).
- [ ] Before logging in remotely, confirm the board is reachable on the network: the board's `eth1` uses a static IP `192.168.127.10` by default, or an IP assigned by the router via Wi-Fi (`wlan0`) (check with `ifconfig` or `ip addr`).
- [ ] The PC and the board are on the same network segment and can `ping` the board's IP (for network troubleshooting, see [Network status confirmation](#network_config)).

## Default Login Accounts

The system provides two default accounts for first-time use:

- **Standard user:** username `sunrise`, password `sunrise`
- **Superuser (root):** username `root`, password `root`

:::tip
Before logging in remotely over the network, the board must be connected to the network via wired Ethernet or wireless Wi-Fi, with its IP address configured. The IP address information for the two connection methods is as follows:

<DocScope products="RDK S100">

- Wired Ethernet:
  - The `eth1` interface uses a static IP by default: IP `192.168.127.10`, netmask `255.255.255.0`, gateway `192.168.127.1`.
  - The `eth0` interface uses DHCP by default; its IP is assigned by the router and can be viewed with `ifconfig`.
- Wireless Wi-Fi: the board's IP is assigned by the router and can be viewed with `ifconfig` for `wlan0`.

</DocScope>

<DocScope products="RDK S600">

- Wired Ethernet:
  - `eth2` and `eth3` are 10GbE ports using DHCP by default; their IPs are assigned by the router (same as `eth0`).
  - The `eth1` interface uses a static IP by default: IP `192.168.127.10`, netmask `255.255.255.0`, gateway `192.168.127.1`.
  - The `eth0` interface uses DHCP by default; its IP is assigned by the router and can be viewed with `ifconfig`.
- Wireless Wi-Fi: the board's IP is assigned by the router and can be viewed with `ifconfig` for `wlan0`.

</DocScope>

:::

## Serial Port Login{#login_uart}

### Connecting the Serial Port on Windows

#### Hardware Connection

Before using serial login, confirm that the board's serial cable is correctly connected to the PC. The board hardware already integrates a serial-to-USB chip. Use a Type-C cable to connect the board to the PC, and install the CH340 driver on the PC.

<DocScope products="RDK S100">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s100-uart.jpg" alt="S100 serial connection diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/S600-uart.jpg" alt="S600 serial connection diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

#### Driver Installation

To use the serial port on Windows, install the CH340 driver first. The driver can be obtained from the [Tools section](https://developer.d-robotics.cc/resource) of the Resource Center. After installation, a COM device similar to the one below appears in Device Manager (actual values may vary):

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/COM.jpg" alt="COM device in Device Manager" style={{ width: '50%', maxWidth: '980px', height: 'auto', display: 'block' }} />

#### Connecting

Serial login requires a PC terminal tool. Common tools include `PuTTY` and `MobaXterm`; choose one as needed. The configuration flow is similar across tools. The following uses `MobaXterm` as an example to create a serial connection:

- Open `MobaXterm`, click `Session`, then select `Serial`.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/MobaXterm-1.png" alt="MobaXterm new serial connection" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

- Configure the port number, for example `COM34`. The actual port is the one recognized by the PC.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/MobaXterm-2.png" alt="MobaXterm serial port configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

- Set the serial parameters as follows:

  | Parameter           | Value  |
| ------------------- | ------ |
| Baud rate           | 921600 |
| Data bits           | 8      |
| Parity              | None   |
| Stop bits           | 1      |
| Flow Control        | None   |

- Click `OK`, then enter username `root` and password `root` to log in.

You can then use `ifconfig -a` to query the board's IP address. `eth0`/`eth1` and `wlan0` represent the wired and wireless networks respectively:

<DocScope products="RDK S100">

```bash
eth0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 7547  bytes 2230733 (2.2 MB)
        RX errors 0  dropped 2  overruns 0  frame 0
        TX packets 1126  bytes 108615 (108.6 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 93

eth1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.127.10  netmask 255.255.255.0  broadcast 192.168.127.255
        inet6 fe80::xxxx:xxff:fexx:xxxx  prefixlen 64  scopeid 0x20<link>
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 43  bytes 3882 (3.8 KB)
        RX errors 0  dropped 1  overruns 0  frame 0
        TX packets 46  bytes 6234 (6.2 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 99

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 46  bytes 6342 (6.3 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 46  bytes 6342 (6.3 KB)
        TX errors 0  dropped 0  overruns 0  carrier 0  collisions 0

wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0  overruns 0  carrier 0  collisions 0
```
</DocScope>
<DocScope products="RDK S600">

```text
eth0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0  overruns 0  carrier 0  collisions 0
        device interrupt 139

eth1: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 192.168.127.10  netmask 255.255.255.0  broadcast 192.168.127.255
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0  overruns 0  carrier 0  collisions 0
        device interrupt 199

eth2: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0  overruns 0  carrier 0  collisions 0
        device interrupt 210

eth3: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0  overruns 0  carrier 0  collisions 0
        device interrupt 227

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 32  bytes 4590 (4.5 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 32  bytes 4590 (4.5 KB)
        TX errors 0  dropped 0  overruns 0  carrier 0  collisions 0

wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0  overruns 0  carrier 0  collisions 0
```
</DocScope>

### Connecting the Serial Port on macOS

On macOS, use the minicom tool to connect to the serial port. The steps are as follows:

1. Connect to the serial port using minicom:

   ```bash
   minicom -D /dev/tty.wchusbserial* -b 921600 -8
   ```

   Parameter notes: `-D` specifies the serial device, `-b` sets the baud rate (921600), and `-8` sets the data bits to 8.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-minicom.png" alt="Example of minicom serial port connection command on macOS" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

2. Successful connection:

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-minicom-success.png" alt="Successful connection to the development board via minicom on macOS" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

:::tip

If garbled text appears when connecting with minicom, see [macOS driver residue causing garbled text](https://developer.d-robotics.cc/xburn_doc/troubleshooting/serial-driver#macos-驱动残留导致仍乱码)
:::

## Network Status Confirmation{#network_config}

Reference video: [Remote login and network configuration](https://www.bilibili.com/video/BV1rm4y1E73q/?p=3)

Before logging in remotely, ensure that the PC and the board can communicate over the network. If `ping` fails, check the following:

- Confirm the IP configuration of the board and the PC. The first three octets must match, for example board `192.168.127.10` and PC `192.168.127.100`.
- Confirm that the subnet mask and gateway of the board and the PC are consistent.
- Confirm that the PC's firewall is disabled.

The board's outer wired Ethernet port (`eth1`) uses a static IP `192.168.127.10` by default. When the PC and the board are connected directly, simply configure the PC as a static IP on the same subnet as the board. Taking Windows 10 as an example, the steps to change the PC's static IP are:

- In Network Connections, find the Ethernet device and double-click to open it.
- Find Internet Protocol Version 4 (TCP/IPv4) and double-click to open it.
- Fill in the network parameters in the red box shown below and click OK.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-s100-pc-static-ip.png" alt="Windows static IP configuration dialog" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

To configure the board's wired network to obtain an IP via DHCP, see [Wired network](../../02_System_configuration/01_network_config.md).

## SSH Login{#ssh}

The following describes the two methods: terminal software and command line.

### Terminal software

Common terminal tools include `PuTTY` and `MobaXterm`; choose one as needed. The configuration flow is similar across tools. The following uses `MobaXterm` as an example to create an SSH connection:

1. Open `MobaXterm`, click `Session`, then select `SSH`.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh_login-1.png" alt="MobaXterm new SSH connection" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

2. Enter the board's IP address, for example `192.168.127.10`, select `specify username`, enter `sunrise`, and set Port to `22`.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh_login-2.png" alt="MobaXterm SSH enter IP address" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

3. Click OK, then enter the username (sunrise) and password (sunrise) to log in.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh_login-3.png" alt="MobaXterm SSH specify username" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

### Computer command line

You can also log in via SSH from the command line. The steps are as follows:

1. Open a terminal window: on the PC, press `Win + R`, type `cmd`, and press Enter.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh-login-4.png" alt="Command-line SSH login example" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

2. In the terminal, enter the SSH login command, for example `ssh sunrise@192.168.127.10`. If a connection confirmation prompt appears, enter `YES`.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh_login-5.png" alt="Command-line SSH connection confirmation" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

3. Enter the password (sunrise) to complete the login.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh_login-6.png" alt="Command-line SSH login success" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

4. The following screen indicates a successful login.

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/ssh_login-7.png" alt="Command-line SSH login success screen" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

## NoMachine Login

<DocScope products="RDK S100">

:::tip
NoMachine requires the software package on the S100. For configuration, see [NoMachine configuration](04_configuration_wizard.md#nomachine-配置).
:::

</DocScope>

<DocScope products="RDK S600">

:::tip
NoMachine requires the software package on the S600. For configuration, see [NoMachine configuration](04_configuration_wizard.md#nomachine-配置).
:::

</DocScope>

This section is for users of the Ubuntu Desktop system and describes how to log in to the remote desktop via `NoMachine`.

**Connecting to the board**

<DocScope products="RDK S100">

1. Open the `NoMachine` client and click `Add` to create a host configuration.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s600_nomachine-0.png" alt="NoMachine new host configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

1. Open the `NoMachine` client and click `Add` to create a host configuration.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s600_nomachine-0.png" alt="NoMachine new host configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S100">

2. In the dialog that appears, fill in the host information for `RDKS100`, then click `Add`.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s100_nomachine-1.png" alt="NoMachine enter host information" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

2. In the dialog that appears, fill in the host information for `RDKS600`, then click `Add`.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s600_nomachine-1.png" alt="NoMachine enter host information" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S100">

3. Return to the main interface and double-click the host just created.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s100_nomachine-2.png" alt="NoMachine double-click host to connect" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

3. Return to the main interface and double-click the host just created.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s600_nomachine-2.png" alt="NoMachine double-click host to connect" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S100">

4. When the login screen appears, enter the username and password and click OK to complete the remote login.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-S100-nomachine_login04.jpg" alt="NoMachine login screen" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-S100-nomachine_login05.jpg" alt="NoMachine login success" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

4. When the login screen appears, enter the username and password and click OK to complete the remote login.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/s600_nomachine-3.png" alt="NoMachine login screen" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

## FAQ

- **SSH connection refused**: run `sudo systemctl status ssh` on the board to confirm the service is running; check the firewall with `sudo ufw status`.
- **No serial output**: check the baud rate (should be 921600) and confirm that the TTL-USB cable's TX/RX are not reversed.
- **NoMachine black screen**: after the first configuration, the board must be rebooted. See [Initial setup - NoMachine configuration](04_configuration_wizard.md).
- **IP address unknown**: run `ip addr` after serial login, or look up the IP by MAC address in the router's admin page.

## Related Documents

- [System flashing](./01_instruction.md)
- [System status](03_system_status.md)
- [Initial setup](04_configuration_wizard.md)
- [Network configuration](../../02_System_configuration/01_network_config.md)
- [Debug serial port](../../02_System_configuration/16_debug_serial.md)
