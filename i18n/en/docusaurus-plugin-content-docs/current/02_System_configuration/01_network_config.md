---
sidebar_position: 1
title: "Network Configuration"
description: "Wired/wireless network configuration, DNS, and Proxy for RDK S100/S600, plus the authoritative definitions of default accounts and IP"
---

# Network Configuration

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This chapter mainly introduces how to modify the wired and wireless network configurations of the development board.

## Default Accounts and Network

The factory default accounts and network of the development board are as follows (this page is the single source of truth for the default accounts and IP; other chapters only reference it without redefining):

- Default accounts:
  - Regular user: `sunrise`, password `sunrise`
  - Superuser: `root`, password `root`
- Default network:
  - `eth1`: static IP `192.168.127.10/24`, not set as the default gateway (`never-default`),
    used for direct connection to a PC or for device management
  - `eth0`: IP obtained automatically via DHCP
  - `wlan0`: DHCP (requires an external Wi-Fi module)

<DocScope products="RDK S600">

- There are also two network ports, `eth2` and `eth3`, which obtain IP automatically via DHCP by default.

</DocScope>

## Wired Network{#config_ethnet}

### Wired Network Configuration - NetworkManager Method

:::note Note

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

# Restart the connection to apply the configuration
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

# Restart the connection to apply the configuration
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

You can also directly edit the `.nmconnection` files in this directory; after editing, run `sudo nmcli connection reload` and `sudo nmcli connection up [connection_name]` to apply the configuration.
:::

### Configuring Static IP and DNS via GUI{#gui_static_ip}

In the desktop environment, static IP and DNS can also be configured via the `Network` panel of the system `settings` application, equivalent to the command-line methods above.

<DocScope products="RDK S100">

#### S100 Steps

1. After entering the desktop, click the bottom-left corner to open the application list, select the `settings` application, and select `Network` in the window that pops up.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-show-app.jpg" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

2. `Ethernet (eth0)` and `Ethernet (eth1)` correspond to different physical network port configurations respectively. The correspondence between configuration and physical ports is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-phy-eth.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-sel-eth.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. Taking the modification of `Ethernet (eth1)` as an example, click the gear icon in the options to the right of the modify button, select `IPv4` in the window that pops up, choose `Manual` for manual configuration, and enter the `IP` address, mask, and gateway in the `Addresses` field below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image_set_static_ip.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

4. Scroll down and enter the DNS configuration in the DNS field below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image_set_static_dns.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

5. To configure multiple IP addresses for one network interface, taking `Ethernet (eth1)` as an example, click the plus sign on the right. The IP address configuration is consistent with steps 3 and 4. After completing the configuration, make sure to select `eth1_cfg` so that the `√` option appears.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-sel_nmcli_netplan.jpg" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

If there is no network configuration entry in the configuration file under the /etc/netplan/ directory, the configuration interface is as follows.
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-sel_nmcli_only.jpg" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

<DocScope products="RDK S600">

#### S600 Steps

1. After entering the desktop, click the bottom-left corner to open the application list, select the `settings` application, and select `Network` in the window that pops up.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-show-app.jpg" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

2. `Ethernet (eth0)`, `Ethernet (eth1)`, `Ethernet (eth2)`, and `Ethernet (eth3)` correspond to different physical network port configurations respectively. The correspondence between configuration and physical ports is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-phy-eth.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-sel-eth.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. Taking the modification of `Ethernet (eth1)` as an example, click the gear icon in the options to the right of the modify button, select `IPv4` in the window that pops up, choose `Manual` for manual configuration, and enter the `IP` address, mask, and gateway in the `Addresses` field below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image_set_static_ip.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

4. Enter the DNS configuration in the DNS field below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image_set_static_dns.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

5. To configure multiple IP addresses for one network interface, taking `Ethernet (eth1)` as an example, click the plus sign on the right. The IP address configuration is consistent with steps 3 and 4. After completing the configuration, make sure to select `eth1_cfg` so that the `√` option appears.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-sel_ok.jpg" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>


## Wireless Network

The development board needs to be equipped with a wireless Wi-Fi module and runs in Station mode by default. Soft AP mode is currently unavailable; the Station mode usage is described below.

### Station Mode

In Station mode, the development board acts as a client, connecting to the router's wireless hotspot for networking.

- For users of the Ubuntu Desktop version, you can click the Wi-Fi icon in the upper right corner of the desktop, select the corresponding hotspot, and enter the password to complete the network configuration, as shown below:
  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/network/image-wifi-config.jpeg" alt="Station Mode diagram" style={{ width: '50%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- For users of the Ubuntu Server version, wireless network configuration can be done via the command line as follows:

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
Wi-Fi AP mode is currently unavailable and is being continuously updated.
:::

<!-- The development board's wireless network runs in Station mode by default. If you need to use Soft AP mode, follow the steps below to configure it.

1. Install `hostapd` and `isc-dhcp-server`

    ```shell
    sudo apt update
    sudo apt install hostapd
    sudo apt install isc-dhcp-server
    ```

2. Run the `sudo vim /etc/hostapd.conf` command to configure `hostapd.conf`, paying attention to the following fields:

    ```shell
    interface=wlan0 #Network card acting as the AP hotspot
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

    - Run `sudo vim /etc/default/isc-dhcp-server` to edit the `isc-dhcp-server` file and add the following defined network interface:
    ```shell
    INTERFACESv4="wlan0"
    ```
    -  Run `sudo vim /etc/dhcp/dhcpd.conf` to edit the `dhcpd.conf` file and uncomment the following field:
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
    Using interface wlan0 with hwaddr xx:xx:xx:xx:xx:xx and ssid "sunrise"
    wlan0: interface state UNINITIALIZED->ENABLED
    wlan0: AP-ENABLED
   ```
   - Use the `ifconfig` command to configure the IP and network segment of the wireless interface `wlan0`. Note that it must be consistent with the configuration in step 3.
    ```bash
    sudo ifconfig wlan0 10.5.5.1 netmask 255.255.255.0
    ```
   - Finally, start the `dhcp` server. When a client connects to the hotspot, an IP address between `10.5.5.100` and `10.5.5.255` will be assigned to it.
    ```bash
    sudo ifconfig wlan0 10.5.5.1 netmask 255.255.255.0
    sudo systemctl start isc-dhcp-server
    sudo systemctl enable isc-dhcp-server
    ```

6. Connect to the development board hotspot, e.g., `sunrise`
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/network/image-20220601203025803.png" alt="Connecting to the development board Soft AP hotspot" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

7. To switch back to `Station` mode, you can do the following:

    [RDK X5]

    ```bash
    # Stop hostapd
    killall -9 hostapd

    # Clear the address of wlan0
    ip addr flush dev wlan0
    sleep 0.5
    ifconfig wlan0 down
    sleep 1
    ifconfig wlan0 up

    # Restart wpa_supplicant
    systemctl unmask wpa_supplicant
    systemctl restart wpa_supplicant

    # Reinstall the wifi driver
    rmmod aic8800_fdrv
    modprobe aic8800_fdrv

    # Connect to the hotspot; for detailed operations, see the previous section "Wireless Network"
    wifi_connect "WiFi-Test" "12345678"
    ```

    [Other]

    ```bash
    # Stop hostapd
    killall -9 hostapd

    # Clear the address of wlan0
    ip addr flush dev wlan0
    sleep 0.5
    ifconfig wlan0 down
    sleep 1
    ifconfig wlan0 up

    # Restart wpa_supplicant
    systemctl unmask wpa_supplicant
    systemctl restart wpa_supplicant

    # Connect to the hotspot; for detailed operations, see the previous section "Wireless Network"
    wifi_connect "WiFi-Test" "12345678"
    ``` -->

## DNS Service

DNS (Domain Name Server) performs the translation between domain names and IP addresses.

DNS on RDK OS is managed centrally by NetworkManager. `/etc/resolv.conf` is
automatically generated by NetworkManager (the file header is `# Generated by NetworkManager`).
Do not edit it manually. `systemd-resolved` is not installed on the board.

- To specify a static DNS for a connection, for example to configure DNS servers for `eth1_cfg`:

  ```shell
  nmcli connection modify eth1_cfg ipv4.dns "8.8.8.8 114.114.114.114"
  nmcli connection up eth1_cfg
  ```

- To revert to DNS obtained automatically via DHCP:

  ```shell
  nmcli connection modify eth1_cfg ipv4.dns "" ipv4.ignore-auto-dns no
  nmcli connection up eth1_cfg
  ```

After configuration, use `nmcli device show eth1 | grep DNS` or `cat /etc/resolv.conf`
to check the active DNS servers.

## Proxy Configuration

Proxy configuration refers to setting up a network proxy. In network communication, a proxy server acts as an intermediary layer between the client and the target server. The client's request is first sent to the proxy server, which then forwards it to the target server. The target server's response is also returned to the client through the proxy server.

Edit the `~/.bashrc` or `/etc/environment` file; the two differ in syntax and in how they take effect:

- To configure the proxy for the current user, edit `~/.bashrc`. Variables must have the `export` prefix, otherwise child processes (such as `apt` and `curl`) cannot read the proxy settings:

  ```bash
  export http_proxy=http://proxy_server_address:port
  export https_proxy=http://proxy_server_address:port
  export ftp_proxy=http://proxy_server_address:port
  export no_proxy=localhost,127.0.0.1
  ```

  After saving, run the following command to apply the configuration:

  ```bash
  source ~/.bashrc
  ```

- To configure the proxy for all users, edit `/etc/environment` and write variables directly in `KEY=VALUE` form (without `export`). This file is read by PAM at login and takes effect after re-login; running `source ~/.bashrc` does not apply it:

  ```bash
  http_proxy=http://proxy_server_address:port
  https_proxy=http://proxy_server_address:port
  ftp_proxy=http://proxy_server_address:port
  no_proxy=localhost,127.0.0.1
  ```

### Configuring Proxy via GUI{#gui_proxy}

<DocScope products="RDK S100">

#### S100 Steps

Similar to modifying the static `IP`, the steps to modify the `Proxy` configuration are as follows:

1. After entering the desktop, click the bottom-left corner to open the application list, select the `settings` application, and select `Network` in the window that pops up.

2. Scroll down and click the gear icon of `Network Proxy` to enter the configuration.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-proxy.jpg" alt="Illustration of modifying Proxy configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. Fill in the required configuration in the window that pops up.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-proxy_set.png" alt="Illustration of modifying Proxy configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

<DocScope products="RDK S600">

#### S600 Steps

Similar to modifying the static `IP`, the steps to modify the `Proxy` configuration are as follows:

1. After entering the desktop, click the bottom-left corner to open the application list, select the `settings` application, and select `Network` in the window that pops up.

2. Select `Proxy` and click to enter the configuration.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy.jpg" alt="Illustration of modifying Proxy configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. Fill in the required configuration in the window that pops up.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy_set_0.png" alt="Illustration of modifying Proxy configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy_set_1.png" alt="Illustration of modifying Proxy configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

:::tip
For system software package upgrades and major version/firmware updates, see [System Update](./03_system_update/02_upgrade_firmware.md).
:::

## Verification

- Wired network: in the output of `nmcli device show eth1`, `IP4.ADDRESS[1]` shows the configured static IP or the IP assigned by DHCP.
- Wireless Station: `ip addr show wlan0` shows the IP address assigned by the router.
- DNS: `nmcli device show eth1 | grep DNS` or `cat /etc/resolv.conf` shows the active DNS servers.

## FAQ

### Cannot Access the Internet After Configuring a Static IP

**Cause**: The default gateway or DNS is not configured correctly, or it does not match the network segment.

**Solution**: Use `ip route` to check the default route and `cat /etc/resolv.conf` to check the active DNS, then verify each item against the "Wired Network" section; the gateway must be in the same network segment as the IP.

### DHCP Cannot Obtain an Address

**Cause**: The NetworkManager connection is not active, or the cable/port is faulty.

**Solution**: Use `nmcli device show eth1` to check the connection status; run `nmcli con up <connection>` to activate the connection; if there is still no address, check the cable or try another port.

### Can Ping an IP Address but Domain Name Resolution Fails

**Cause**: The DNS server is not configured or is unreachable.

**Solution**: Check whether `/etc/resolv.conf` has a DNS entry; if not, add one through NetworkManager or `nmcli con mod` (for example `223.5.5.5` and `8.8.8.8`).

## Related Documentation

- [Bluetooth Configuration](./02_bluetooth_config.md)
- [System Update](./03_system_update/02_upgrade_firmware.md)
- [Remote Login](../01_Quick_start/03_install_os_and_setup/05_remote_login.md)
- [Wi-Fi Driver Debug Guide](../07_Advanced_development/04_driver_development/11_driver_wifi.md)
- [Ethernet](../07_Advanced_development/04_driver_development/16_driver_ethernet/01_ethernet.md)
