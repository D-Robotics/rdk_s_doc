---
sidebar_position: 1
---

# 2.1 Network and Bluetooth Configuration

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This section mainly introduces how to modify the wired and wireless network configurations of the development board.

## Wired Network{#config_ethnet}

### Wired Network Configuration - Network Manager Method

:::info Note

  By default, `NetworkManager + Netplan` is used to manage the network. For other platforms, please refer to the corresponding system documentation.

<DocScope products="RDK S100">
  - The `RDK S100` root file system is built on Ubuntu-22.04 and does not support enabling or disabling network interfaces using ifup/ifdown by default.
</DocScope>

<DocScope products="RDK S600">
  - The `RDK S600` root file system is built on Ubuntu-24.04 and does not support enabling or disabling network interfaces using ifup/ifdown by default.
</DocScope>

:::

Example of configuring a static IP using the command line:

```shell
# Configure eth1 static IP as 192.168.10.100/24, gateway as 192.168.10.1, DNS as 223.5.5.5 and 8.8.8.8
nmcli connection modify "eth1_cfg" \
  ipv4.method manual \
  ipv4.addresses "192.168.10.100/24" \
  ipv4.gateway "192.168.10.1" \
  ipv4.dns "223.5.5.5 8.8.8.8" \
  ipv4.never-default yes \
  connection.autoconnect yes

# Restart the connection for changes to take effect
nmcli connection down "eth1_cfg"
nmcli connection up "eth1_cfg"

```

Example of configuring DHCP using the command line:

```shell
# Switch eth1 to DHCP
nmcli connection modify "eth1_cfg" \
  ipv4.method auto \
  ipv4.addresses "" \
  ipv4.gateway "" \
  ipv4.dns "" \
  connection.autoconnect yes

# Restart the connection for changes to take effect
nmcli connection down "eth1_cfg"
nmcli connection up "eth1_cfg"
```

Check the current IP/gateway/DNS configuration using the command line:

```shell
# Check the device's current IP/gateway/DNS
nmcli device show eth1

```

For more information on configuration fields, please refer to:
[Ubuntu Manpage: NetworkManager](https://networkmanager.dev/docs/api/latest/nmcli.html)

:::tip Note
The `RDK S100` desktop version uses the `NetworkManager + Netplan` network framework by default. After saving configurations via GUI or `nmcli`, the configurations are written to `/etc/NetworkManager/system-connections/`.

You can also directly edit the `.nmconnection` file in this directory; after editing, run `sudo nmcli connection reload` and `sudo nmcli connection up [connection_name]` to apply the configuration.
:::

## Wireless Network

Video: https://www.bilibili.com/video/BV1rm4y1E73q/?p=12

The development board needs to be equipped with a wireless Wi-Fi module, supporting both Soft AP and Station modes, and runs in Station mode by default. The usage of the two modes is described below.

### Station Mode

In Station mode, the development board acts as a client, connecting to the router's wireless hotspot for networking.

- For users using the Ubuntu Desktop version, you can click the Wi-Fi icon in the upper right corner of the desktop, select the corresponding hotspot, and enter the password to complete the network configuration, as shown below:
  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/network/image-wifi-config.jpeg" alt="image-wifi-config" style={{ width: '100%' }} />

- For users using the Ubuntu Server version, wireless network configuration can be done via the command line as follows:

1. Use the `sudo nmcli device wifi rescan` command to scan for hotspots. If the following message appears, it indicates that scanning is too frequent; please try again later.
   ```shell
   root@ubuntu:~# sudo nmcli device wifi rescan
   Error: Scanning not allowed immediately following previous scan.
   ```
2. Use the `sudo nmcli device wifi list` command to list the scanned hotspots.
3. Use the `sudo wifi_connect "SSID" "PASSWD"` command to connect to the hotspot. The following message indicates a successful network connection:

   ```shell
   root@ubuntu:~# sudo wifi_connect "WiFi-Test" "12345678"
   Device 'wlan0' successfully activated with 'd7468833-4195-45aa-aa33-3d43da86e1a7'.
   ```

   :::tip
   If, after connecting to the hotspot, the following message appears, it means the hotspot was not found. You can run the `sudo nmcli device wifi rescan` command to rescan and then try again.

   ```shell
   root@ubuntu:~# sudo wifi_connect "WiFi-Test" "12345678"
   Error: No network with SSID 'WiFi-Test' found.
   ```

   :::

### Soft AP Mode

:::tip
Wi-Fi AP mode is currently unavailable
Continuously updating...
:::

<!-- The development board's wireless network runs in Station mode by default. If you need to use Soft AP mode, follow the steps below for configuration.

1. Install `hostapd` and `isc-dhcp-server`

    ```shell
    sudo apt update
    sudo apt install hostapd
    sudo apt install isc-dhcp-server
    ```

2. Run the `sudo vim /etc/hostapd.conf` command to configure `hostapd.conf`, paying attention to the following fields:

    ```shell
    interface=wlan0 #Network card acting as AP hotspot
    ssid=Sunrise #WiFi name
    wpa=2 #0 for WPA, 2 for WPA2, usually 2
    wpa_key_mgmt=WPA-PSK #Encryption algorithm, usually WPA-PSK
    wpa_passphrase=12345678 #Password
    wpa_pairwise=CCMP #Encryption protocol, usually CCMP
    ```

      - For a passwordless hotspot configuration, add the following content to the `hostapd.conf` file:

    ```shell
    interface=wlan0
    driver=nl80211
    ctrl_interface=/var/run/hostapd
    ssid=Sunrise
    channel=6
    ieee80211n=1
    hw_mode=g
    ignore_broadcast_ssid=0
    ```

      - For a password-protected hotspot configuration, add the following content to the `hostapd.conf` file:

    ```shell
    interface=wlan0
    driver=nl80211
    ctrl_interface=/var/run/hostapd
    ssid=Sunrise
    channel=6
    ieee80211n=1
    hw_mode=g
    ignore_broadcast_ssid=0
    wpa=2
    wpa_key_mgmt=WPA-PSK
    wpa_pairwise=CCMP
    wpa_passphrase=12345678
    ```

3. Configure the `isc-dhcp-server` file as follows:

    - Run `sudo vim /etc/default/isc-dhcp-server` to edit the `isc-dhcp-server` file, and add the defined network interface as follows:
    ```shell
    INTERFACESv4="wlan0"
    ```
    - Run `sudo vim /etc/dhcp/dhcpd.conf` to edit the `dhcpd.conf` file, and uncomment the following field:
    ```shell
      authoritative;
    ```
    - Then add the following configuration at the end of the `/etc/dhcp/dhcpd.conf` file:
    ```shell
      subnet 10.5.5.0 netmask 255.255.255.0 { #Network segment and subnet mask
      range 10.5.5.100 10.5.5.254;#Range of obtainable IPs
      option subnet-mask 255.255.255.0; #Subnet mask
      option routers 10.5.5.1;#Default gateway
      option broadcast-address 10.5.5.31;#Broadcast address
      default-lease-time 600;#Default lease time, in seconds
      max-lease-time 7200;#Maximum lease time, in seconds
    }
    ```

4. Stop the `wpa_supplicant` service and restart `wlan0`

    ```bash
    systemctl mask wpa_supplicant
    systemctl stop wpa_supplicant

    ip addr flush dev wlan0
    sleep 0.5
    ifconfig wlan0 down
    sleep 1
    ifconfig wlan0 up
    ```

5. Start the `hostapd` service as follows:
   - Execute the `sudo hostapd -B /etc/hostapd.conf` command
   ```bash
    root@ubuntu:~# sudo hostapd -B /etc/hostapd.conf

    Configuration file: /etc/hostapd.conf
    Using interface wlan0 with hwaddr 08:e9:f6:af:18:26 and ssid "sunrise"
    wlan0: interface state UNINITIALIZED->ENABLED
    wlan0: AP-ENABLED
   ```
   - Use the `ifconfig` command to configure the IP and network segment of the wireless interface `wlan0`, ensuring consistency with the configuration in step 3.
    ```bash
    sudo ifconfig wlan0 10.5.5.1 netmask 255.255.255.0
    ```
   - Finally, start the DHCP server. When connected to the hotspot, the client will be assigned an IP address between `10.5.5.100` and `10.5.5.255`.
    ```bash
    sudo ifconfig wlan0 10.5.5.1 netmask 255.255.255.0
    sudo systemctl start isc-dhcp-server
    sudo systemctl enable isc-dhcp-server
    ```

6. Connect to the development board hotspot, e.g., `sunrise`
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/network/image-20220601203025803.png" alt="image-20220601203025803" style={{ width: '100%' }} />

7. To switch back to Station mode, you can do the following:

    [RDK X5]

    ```bash
    # Stop hostapd
    killall -9 hostapd

    # Clear wlan0 address
    ip addr flush dev wlan0
    sleep 0.5
    ifconfig wlan0 down
    sleep 1
    ifconfig wlan0 up

    # Restart wpa_supplicant
    systemctl unmask wpa_supplicant
    systemctl restart wpa_supplicant

    # Reload wifi driver
    rmmod aic8800_fdrv
    modprobe aic8800_fdrv

    # Connect to hotspot; see the previous section "Wireless Network" for details
    wifi_connect "WiFi-Test" "12345678"
    ```

    [Other]

    ```bash
    # Stop hostapd
    killall -9 hostapd

    # Clear wlan0 address
    ip addr flush dev wlan0
    sleep 0.5
    ifconfig wlan0 down
    sleep 1
    ifconfig wlan0 up

    # Restart wpa_supplicant
    systemctl unmask wpa_supplicant
    systemctl restart wpa_supplicant

    # Connect to hotspot; see the previous section "Wireless Network" for details
    wifi_connect "WiFi-Test" "12345678"
    ``` -->

## DNS Service


DNS (Domain Name Server) is a server that translates domain names into their corresponding IP addresses.

The DNS configuration of the development board is managed through the `/etc/systemd/resolved.conf` file. Users can modify this file to complete DNS-related configurations as follows:

1. Edit the `resolved.conf` file and add the DNS server address, for example:

   ```bash
   DNS=8.8.8.8 114.114.114.114
   ```

2. Apply the DNS configuration using the following commands:

   ```bash
   sudo systemctl restart systemd-resolved
   sudo systemctl enable systemd-resolved
   sudo mv /etc/resolv.conf  /etc/resolv.conf.bak
   sudo ln -s /run/systemd/resolve/resolv.conf /etc/
   ```

## Proxy Configuration

Proxy configuration refers to setting up a network proxy. In network communication, a proxy server acts as an intermediary between the client and the target server. The client's request is first sent to the proxy server, which then forwards it to the target server. The target server's response is also returned to the client through the proxy server.

Edit the `~/.bashrc` or `/etc/environment` file. If configuring the proxy for the current user, edit `~/.bashrc`; if configuring the proxy for all users, edit `/etc/environment`.

Add the following content to the file (using HTTP proxy as an example):

```
http_proxy=http://proxy_server_address:port
https_proxy=http://proxy_server_address:port
ftp_proxy=http://proxy_server_address:port
no_proxy=localhost,127.0.0.1
```

After saving the file, run the following command to apply the configuration:

```
source ~/.bashrc
```

## System Update

:::warning
Do not execute before the product is released
:::

For system security and stability reasons, it is recommended that users update the system using the `apt` command after installing the system.

The `/etc/apt/source.list` file contains the list of software sources for the `apt` command. Before installing software, you need to update the package list using the `apt` command.

First, open the terminal command line and enter the following command:

```bash
sudo apt update
```

Next, upgrade all installed packages to the latest versions using the following command:

```bash
sudo apt full-upgrade
```

:::tip
It is recommended to use the `full-upgrade` option instead of `upgrade` so that dependency packages are also updated synchronously when related dependencies change.

When running the `sudo apt full-upgrade` command, the system will prompt you about the data download and disk space usage, but `apt` does not check if there is sufficient disk space. It is recommended that users manually check using the `df -h` command. Additionally, the deb files downloaded during the upgrade are saved in the `/var/cache/apt/archives` directory. Users can delete the cache files using the `sudo apt clean` command to free up disk space.
:::

After executing the `apt full-upgrade` command, drivers, kernel files, and some system software may be reinstalled. It is recommended that users manually reboot the device for the updates to take effect using the following command:

```bash
sudo reboot
```

## Bluetooth Configuration


### Initialization
Users can use commands to check whether the Bluetooth process is normal as follows:

```bash
ps ax | grep "/usr/bin/dbus-daemon\|/usr/lib/bluetooth/bluetoothd"
/usr/bin/dbus-daemon

/usr/lib/bluetooth/bluetoothd
```

Users can use commands to check whether the Bluetooth controller is normal as follows (note that the `<MAC Addr>` in `Controller <MAC Addr>` in the command example below will vary depending on the actual Bluetooth controller):
```bash
bluetoothctl list
Controller F0:68:E3:22:7E:91 ubuntu [default]
```

### Network Configuration and Connection

Execute `sudo bluetoothctl` to enter the Bluetooth configuration interface in interactive mode. If device information similar to the image below appears, it means the Bluetooth device has been recognized. Then use `show` to view Bluetooth information, paying attention to the `powered` and `discoverable` status of Bluetooth.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601172604051.png" alt="image-20220601172604051" style={{ width: '100%' }} />

Execute `power on` to enable Bluetooth, as shown in the image below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601172501882.png" alt="image-20220601172501882" style={{ width: '50%' }} />

To allow Bluetooth to be discovered by nearby devices, execute `discoverable on` to enable Bluetooth and turn on the Bluetooth discoverable property, as shown in the image below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601172648853.png" alt="image-20220601172648853" style={{ width: '100%' }} />

At this point, using a phone or computer to scan for Bluetooth will reveal a Bluetooth device named `ubuntu`:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601175322650-en.jpg" alt="image-20220601175322650" style={{ width: '100%' }} />

Next, test the active scanning function of Bluetooth. Enter `scan on` in the `bluetoothctl` interactive interface to enable active scanning. It will periodically print nearby devices. It should have discovered your phone device. Use `scan off` to disable the scanning function and summarize the list of scanned Bluetooth devices:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601154131158.png" alt="image-20220601154131158" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601154253947.png" alt="image-20220601154253947" style={{ width: '100%' }} />

Then, proceed to pair with other Bluetooth devices:

- Pairing command: `pair [targetMAC]`. After entering this command, type `yes` as prompted, and select the `Pair` option on the peer Bluetooth device to complete pairing.

- After successful pairing, you can use `trust [targetMAC]` to enable automatic connection the next time.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601154414717.png" alt="image-20220601154414717" style={{ width: '100%' }} />

After the above operations, the basic functions of Bluetooth scanning and pairing are completed. For more advanced features, please refer to the official help documentation of `BlueZ`.