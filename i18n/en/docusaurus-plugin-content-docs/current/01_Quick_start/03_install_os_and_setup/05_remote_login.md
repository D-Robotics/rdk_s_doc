---
title: "Remote Login"
sidebar_position: 5
description: "Methods and default accounts for remotely logging in to the development board via SSH/serial port/NoMachine"
---

# Remote Login

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

Remote login is the basic way to access the development board from a personal computer (PC) after flashing the system.

- **What to do**: Log in to the development board from the PC via the serial port or SSH.
- **Why**: The development board typically has no dedicated monitor/keyboard/mouse for daily development, so remote operation is required.
- **What's next**: You get the board's shell on the PC, and can run commands, deploy programs, and debug.

## Prerequisites

- [ ] The development board has been flashed with RDK OS and finished booting (see [Flash the system and set it up](./01_instruction.md)).
- [ ] Before remote login, confirm the development board is network-reachable: the board's `eth1` uses the static IP `192.168.127.10` by default, or via Wi-Fi (`wlan0`) with an IP assigned by the router (check with `ifconfig` or `ip addr`).
- [ ] The PC and the development board are on the same network segment and can `ping` the board's IP (for network troubleshooting, see [Network status confirmation](#network_config)).

## Default Login Accounts

The system provides two default accounts for first-time users:

- **Standard user:** Username `sunrise`, Password `sunrise`
- **Superuser (root):** Username `root`, Password `root`

:::tip
Before logging in remotely over the network, the development board needs to be connected to the network via wired Ethernet or wireless Wi-Fi, with the board's IP address configured. The IP address information for the two connection methods is described below:

<DocScope products="RDK S100">

- Wired Ethernet:
  - The eth1 interface of the development board uses static IP mode by default, with IP address `192.168.127.10`, mask `255.255.255.0`, gateway `192.168.127.1`
  - The eth0 interface of the development board uses DHCP mode by default, and the IP address is generally assigned by the router. You can check the IP address of the eth0 network with the `ifconfig` command in the device command line.
- Wireless Wi-Fi: The development board's IP address is generally assigned by the router. You can check the IP address of the wlan0 network with the `ifconfig` command in the device command line.

</DocScope>

<DocScope products="RDK S600">

- Wired Ethernet:
  - The eth2 and eth3 interfaces of the development board are 10GbE ports, using DHCP mode by default. The IP addresses are generally assigned by the router (same as eth0).
  - The eth1 interface of the development board uses static IP mode by default, with IP address `192.168.127.10`, mask `255.255.255.0`, gateway `192.168.127.1`
  - The eth0 interface of the development board uses DHCP mode by default, and the IP address is generally assigned by the router. You can check the IP address of the eth0 network with the `ifconfig` command in the device command line.
- Wireless Wi-Fi: The development board's IP address is generally assigned by the router. You can check the IP address of the wlan0 network with the `ifconfig` command in the device command line.

</DocScope>

:::

## Serial Port Login{#login_uart}

### Connecting the Serial Port on Windows

Reference video: https://www.bilibili.com/video/BV1rm4y1E73q/?p=2

Before logging in via the serial port, you need to confirm that the development board's serial cable is correctly connected to the computer. For the connection method, refer to the debug serial port section of the corresponding development board:

<DocScope products="RDK S100">
- [Debug serial port section](../01_hardware_introduction/01_rdk_s100.md#type-c-j16)
</DocScope>

<DocScope products="RDK S600">
- [Debug serial port section](../01_hardware_introduction/02_rdk_s600.md#j4)
</DocScope>

Serial port login requires a PC terminal tool. Commonly used tools include `Putty`, `MobaXterm`, and so on. Users can choose according to their own usage habits. The port configuration process is basically similar across different tools. The following takes `MobaXterm` as an example to introduce the process of creating a new serial port connection:

- When the serial port USB adapter board is plugged into the computer for the first time, you need to install the serial driver. The driver can be obtained from the [Tools subsection](https://developer.d-robotics.cc/resource) of the Resource Center. After the driver installation completes, Device Manager recognizes the serial board port properly, as shown below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-20220416105939067.png" alt="Serial port recognized in Device Manager" style={{ width: '50%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- Open the `MobaXterm` tool, click `Session`, then select `Serial`

- Configure the port number, for example `COM3`. Use the actual serial port number recognized by the PC.

- Set the serial port configuration parameters as follows:

  | Configuration item | Parameter value |
  | -------------------- | ------ |
  | Baud rate  | 921600 |
  | Data bits  | 8      |
  | Parity   | None   |
  | Stop bits  | 1      |
  | Flow Control | None     |

- Click `OK`, enter the username: `root`, password: `root` to log in to the device
  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-Uart-Login.gif" alt="Windows serial port connection demo" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

At this point, you can use the `ifconfig -a` command to query the development board's IP address, where eth0/eth1 and wlan0 represent wired and wireless networks respectively:

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
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```
</DocScope>
<DocScope products="RDK S600">

```text
eth0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 139

eth1: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 192.168.127.10  netmask 255.255.255.0  broadcast 192.168.127.255
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 199

eth2: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 210

eth3: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 227

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 32  bytes 4590 (4.5 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 32  bytes 4590 (4.5 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```
</DocScope>

### Connecting the Serial Port on macOS

On macOS, use the minicom tool to connect to the serial port. The steps are as follows:
1. Use the minicom command to connect to the serial port and verify (`minicom -D /dev/tty.wchusbserial* -b 921600 -8`)
      ```bash
      minicom  # Start the minicom terminal tool for serial communication
      -D       # Specify the serial device to use
      -b       # Set the serial baud rate
      -8       # Set data bits to 8
      ```
      <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-minicom.png" alt="Example of minicom serial port connection command on macOS" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
2. Connect to the development board and verify
   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-mac-usb-driver-minicom-success.png" alt="Successful connection to the development board via minicom on macOS" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::tip

If garbled text appears when connecting with minicom, see [macOS driver residue causing garbled text](https://developer.d-robotics.cc/xburn_doc/troubleshooting/serial-driver#macos-驱动残留导致仍乱码)
:::

## Network Status Confirmation{#network_config}

Reference: https://www.bilibili.com/video/BV1rm4y1E73q/?p=3

Before using remote login, you need to ensure that the network communication between the computer and the development board is normal. If `ping` fails, follow these steps to confirm:

- Confirm the IP address configuration of the development board and the computer. Generally the first three segments need to be the same, for example: development board: `192.168.127.10`, computer: `192.168.127.100`
- Confirm whether the subnet mask and gateway configuration of the development board and the computer are consistent
- Confirm whether the computer's network firewall is turned off

The outer wired Ethernet port (eth1) of the development board uses static IP mode by default, with IP address `192.168.127.10`. For a direct network connection between the development board and the computer, you only need to configure the computer with a static IP to ensure it is on the same network segment as the development board. Taking the WIN10 system as an example, the method to change the computer's static IP is as follows:

- In Network Connections, find the corresponding Ethernet device and double-click to open it
- Find the Internet Protocol Version 4 option and double-click to open it
- Fill in the corresponding network parameters at the red box area in the figure below and click OK

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-s100-pc-static-ip.png" alt="Windows static IP configuration dialog" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

If you need to configure the development board's wired network to dynamically obtain an address in DHCP mode, refer to the [Wired network](../../02_System_configuration/01_network_config.md) section.

## SSH Login{#ssh}
The following introduces the steps for creating a connection with terminal software and the terminal command line respectively.

### Terminal software

Currently commonly used terminal tools include `Putty`, `MobaXterm`, and so on. Users can choose according to their own usage habits. The port configuration process is basically similar across different tools. The following takes `MobaXterm` as an example to introduce the process of creating a new SSH connection:

1. Open the `MobaXterm` tool, click `Session`, then select `SSH`
2. Enter the development board's IP address, for example `192.168.127.10`
3. Select `specify username` and enter `sunrise`
4. After clicking OK, enter the username (sunrise) and password (sunrise) to complete the login

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-Network-Login.gif" alt="Terminal software demo" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Computer command line

Users can also log in via SSH through the command line. The steps are as follows:

1. Open a terminal window and enter the SSH login command, for example `ssh sunrise@192.168.127.10`
2. When the connection confirmation prompt appears, enter YES
3. Enter the password (sunrise) to complete the login

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/linux_login_01.gif" alt="Computer command line demo" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


## NoMachine Login

:::tip
The NoMachine feature requires software package support on the S100/S600 side. See [NoMachine configuration](04_configuration_wizard.md#nomachine-configuration) for the configuration guide.
:::

This section is for users of the Ubuntu Desktop system version, introducing how to implement remote desktop login via `NoMachine`. The following sections use the S100 as an example; the operation on the S600 is the same as on the S100, just replace `S100` in the link name with `S600`.

**Connect to the development board**

1. Open the `NoMachine` client and click `Add` to add a host configuration

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-S100-nomachine_login01.jpg" alt="NoMachine login screenshot" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

2. In the pop-up window, fill in the host information for `RDK100/RDKS600`, then click `Add` when done

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-S100-nomachine_login02.jpg" alt="NoMachine login screenshot" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. You are then returned to the main interface. Double-click the host you just created

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-S100-nomachine_login03.jpg" alt="NoMachine login screenshot" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

4. The login interface pops up. Enter the username and password, then click OK to complete the remote login

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-S100-nomachine_login04.jpg" alt="NoMachine login screenshot" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/remote_login/image-S100-nomachine_login05.jpg" alt="NoMachine login screenshot" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Verification

- **SSH**: Run `ssh sunrise@<board IP>` from the PC, and entering the password `sunrise` gets you into the shell.
- **Serial port**: The serial terminal shows the U-Boot boot log and the Linux login prompt.
- **NoMachine**: The NoMachine client can connect and display the board's desktop.

## FAQ

- **SSH connection refused**: Use `sudo systemctl status ssh` on the board to confirm the service is running; confirm the firewall `sudo ufw status` is not blocking.
- **No serial port output**: Check the baud rate (it should be 921600), and confirm the TX/RX of the TTL-USB cable are not swapped.
- **NoMachine black screen**: After the first configuration, you must reboot the board. See [Initial Setup - NoMachine Configuration](04_configuration_wizard.md).
- **IP address unknown**: After logging in via the serial port, check with `ip addr`, or look up the IP corresponding to the MAC address on the router's admin page.

## Related documents

- [System flashing](./01_instruction.md)
- [System status](03_system_status.md)
- [Initial setup](04_configuration_wizard.md)
- [Network configuration](../../02_System_configuration/01_network_config.md)
- [Debug serial port](../../02_System_configuration/16_debug_serial.md)
