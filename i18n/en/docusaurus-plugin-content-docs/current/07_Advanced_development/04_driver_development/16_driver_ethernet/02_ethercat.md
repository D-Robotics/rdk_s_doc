---
sidebar_position: 2
---

# EtherCAT

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

:::warning
<font color="red">**Note:**</font> Using the EtherCAT protocol requires system version V4.0.4 or higher.
:::

## Native Driver vs. Generic Driver

### Version Notes

<DocScope products="RDK S100">
**RDK S100 V4.0.7 and above use the Native (hobot) EtherCAT driver by default**, not the Generic driver.

:::warning
<font color="red">**Note:**</font> The EtherCAT usage methods described in subsequent sections of this document ("[Network Configuration Before Use](#network-configuration-before-use)", "[EtherCAT Usage Guide](#ethercat-usage-guide)", etc.) are **based on the Generic driver mode**. If you are using the **V4.0.7 default image**, the system is pre-configured for Native driver mode. Please refer to the Native driver usage instructions in this section first.
:::
</DocScope>

<DocScope products="RDK S600">
**RDK S600 V5.1.0 and above use the Native (hobot) EtherCAT driver by default**, not the Generic driver.

:::warning
<font color="red">**Note:**</font> The EtherCAT usage methods described in subsequent sections of this document ("[Network Configuration Before Use](#network-configuration-before-use)", "[EtherCAT Usage Guide](#ethercat-usage-guide)", etc.) are **based on the Generic driver mode**. If you are using the **V5.1.0 default image**, the system is pre-configured for Native driver mode. Please refer to the Native driver usage instructions in this section first.
:::
</DocScope>

### Differences Between Native Driver and Generic Driver

| Feature | Native Driver (`ec_hobot`) | Generic Driver (`ec_generic`) |
|---------|---------------------------|-------------------------------|
| Driver Module | `ec_hobot` | `ec_generic` |
| Network Performance | Better (direct hardware operation, bypasses Linux network stack) | Standard Linux network stack |
| Compatibility with gmac driver | **Mutually exclusive**, requires unloading `hobot_eth_super` | **Compatible**, can coexist |
| Network Port Configuration | **Must use MAC address** | Supports interface name or MAC address |
| Visibility of Network Port in System | After being taken over by Native driver, the port with corresponding MAC **disappears from `ip a`** | Port always visible |

## Native Driver Usage Steps

### Network Port MAC Address Reference

The following are four example Ethernet port MAC addresses for S100/S600:

| Port | MAC Address |
|------|-------------|
| eth0 | `xx:xx:xx:xx:01:18` |
| eth1 | `xx:xx:xx:xx:01:19` |
| eth2 | `xx:xx:xx:xx:01:1a` |
| eth3 | `xx:xx:xx:xx:01:1b` |

:::tip
Actual MAC addresses may vary slightly depending on the hardware version. Please refer to the output of the `ip link show` command on your device.
:::

### Native Driver Configuration Steps

**Step 1: Verify the configuration file**

In the default image, `/etc/ethercat.conf` is pre-configured for Native mode. To switch the EtherCAT network port, modify `MASTER0_DEVICE` to the MAC address of the corresponding port:

```
MASTER0_DEVICE="xx:xx:xx:xx:01:18"  # MAC address of eth0
DEVICE_MODULES="hobot"
```

To use eth1 as the EtherCAT port:
```
MASTER0_DEVICE="xx:xx:xx:xx:01:19"  # MAC address of eth1
DEVICE_MODULES="hobot"
```

**Step 2: Configure systemd drop-in (required)**

Since the Native driver and the gmac driver are mutually exclusive, you need to configure a systemd drop-in to automatically handle driver unloading and reloading. Execute the following commands on the device to:
- Automatically unload `hobot_eth_super` before starting EtherCAT
- Automatically reload `hobot_eth_super` after stopping EtherCAT to restore network functionality

```shell
sudo mkdir -p /etc/systemd/system/ethercat.service.d

sudo tee /etc/systemd/system/ethercat.service.d/prestart.conf << 'EOF'
[Service]
ExecStartPre=-/sbin/rmmod hobot_eth_super
ExecStopPost=-/sbin/modprobe hobot_eth_super
EOF

sudo systemctl daemon-reload
```

:::info
- `ExecStartPre=-`:Automatically unloads `hobot_eth_super` before starting (the prefix `-` means execution continues even if this command fails)
- `ExecStopPost=-`:Automatically reloads `hobot_eth_super` after stopping to restore normal network functionality
:::

:::warning
<font color="red">**SSH Connection Note:**</font> If you are connected to the development board via SSH, when you execute `systemctl start ethercat` or `systemctl stop ethercat`, the network will experience a brief interruption of a few seconds (ping will show `Destination Host Unreachable`) due to the unloading/reloading of the gmac driver. The SSH client will typically reconnect automatically. This is normal and does not require manual intervention.
:::

**Step 3: Start EtherCAT**

```shell
sudo systemctl start ethercat
sudo systemctl status ethercat
```

Example of normal output:
```
● ethercat.service - EtherCAT Master Kernel Modules
     Loaded: loaded (/usr/lib/systemd/system/ethercat.service; disabled; preset: enabled)
    Drop-In: /etc/systemd/system/ethercat.service.d
             └─prestart.conf
     Active: active (exited) since Thu 2026-03-26 20:48:36 CST; 4s ago
    Process: 6476 ExecStartPre=/sbin/rmmod hobot_eth_super (code=exited, status=0/SUCCESS)
    Process: 6504 ExecStart=/sbin/ethercatctl start (code=exited, status=0/SUCCESS)
   Main PID: 6504 (code=exited, status=0/SUCCESS)
```

**Step 4: Verification**

After starting, check `ip a`. You will see that the MAC address of the network port bound to EtherCAT has disappeared from the kernel protocol stack (no longer appears in the list):

```shell
$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> ...
6: wlan0: <NO-CARRIER,BROADCAST,MULTICAST,UP> ...
7: eth0: <NO-CARRIER,BROADCAST,MULTICAST,UP> ...    # MAC is for an unbound port
8: eth1: <NO-CARRIER,BROADCAST,MULTICAST,UP> ...    # MAC is for an unbound port
9: eth2: <NO-CARRIER,BROADCAST,MULTICAST,UP> ...    # MAC is for an unbound port
# Note: eth0 with MAC xx:xx:xx:xx:01:18 is no longer in the list (taken over by Native driver)
```

Check EtherCAT master status:

```shell
$ sudo ethercat master
Master0
  Phase: Idle
  Active: no
  Slaves: 1
  Ethernet devices:
    Main: xx:xx:xx:xx:01:18 (attached)
      Link: UP
      ...

$ sudo ethercat slaves
0  0:0  PREOP  +  SSC-Device
```

**Step 5: Stop EtherCAT (switch back to normal network mode)**

After stopping the EtherCAT service, `ExecStopPost` will automatically load `hobot_eth_super`, and all network ports will revert to normal network mode:

```shell
sudo systemctl stop ethercat
```

### Switching the Network Port Used by the Native Driver

To switch the network port used by EtherCAT, simply modify `MASTER0_DEVICE` in `/etc/ethercat.conf` to the MAC address of the corresponding port, then restart the EtherCAT service:

1. Modify the configuration (e.g., switch from eth0 to eth1):
   ```
   MASTER0_DEVICE="xx:xx:xx:xx:01:19"  # Change to MAC of eth1
   DEVICE_MODULES="hobot"
   ```

2. Restart the service:
   ```shell
   sudo systemctl restart ethercat
   ```

3. Verify that the new port is active:
   ```shell
   sudo ethercat master
   # Should display the new MAC address: Main: xx:xx:xx:xx:01:19 (attached)
   ```

### Risks and Impacts of the Native Driver

:::warning
<font color="red">**Important:**</font> Because the Native driver and the gmac driver are mutually exclusive, it is **strongly recommended to use `systemctl` to manage the EtherCAT service** (with the systemd drop-in to automatically handle driver unloading/reloading). **Do not use the `ethercatctl` command directly.** Using `ethercatctl start` directly requires manually unloading `hobot_eth_super` with `rmmod`, and improper operation (e.g., forgetting to unload the gmac driver) will cause EtherCAT to fail to start. Furthermore, in remote SSH connection scenarios, manual operation could lead to network loss that cannot be recovered.
:::

#### 1. Conflict with gmac driver

The Native driver `ec_hobot` is **mutually exclusive** with the system's `hobot_eth_super` (xgmac) driver; the two cannot be loaded simultaneously. `hobot_eth_super` must be unloaded before starting EtherCAT, otherwise the EtherCAT service will not start correctly.

**Impact**: After unloading `hobot_eth_super`, the network port bound to the EtherCAT master is taken over by the Native driver. **The remaining Ethernet ports can still be used normally** (they can be configured with IPs, used for SSH connections, etc.). However, at the moment of `rmmod`/`modprobe hobot_eth_super`, all Ethernet ports will briefly interrupt for a few seconds and then automatically recover. The SSH connection will typically reconnect automatically.

**Recovery Method**: After stopping EtherCAT, `ExecStopPost` will automatically reload `hobot_eth_super`, and all Ethernet ports will return to normal network functionality.

#### 2. Network port is exclusive to the Native driver

When the Native driver starts, the network port corresponding to the MAC address bound to `MASTER0_DEVICE` in the configuration file will **disappear** from the Linux kernel protocol stack (it will no longer be shown in `ip a`) and will be exclusively used by EtherCAT. The other, unbound ports will remain visible and usable.

#### 3. MAC address configuration requirement

In Native driver mode, `MASTER0_DEVICE` in `/etc/ethercat.conf` **must be configured with the actual MAC address of the corresponding network port** (e.g., `"xx:xx:xx:xx:01:18"`). The broadcast address `ff:ff:ff:ff:ff:ff` or an interface name (e.g., `"eth0"`) cannot be used, as the driver will not be able to bind correctly.

### Notes on deb Package Upgrades

When upgrading EtherCAT-related deb packages, **versions must be consistent**. Upgrade the following two packages synchronously:

```shell
# Both packages must be upgraded synchronously, and version numbers must match
dpkg -i hobot-ethercat_5.1.0-20260525160326_arm64.deb
dpkg -i linux-image-rdk-s600_6.1.158-rt58-DR-5.1.0-2605251554-g369e4b-gf8e87c-29_arm64.deb
```

If you upgrade only `hobot-ethercat` without upgrading `linux-image`, the kernel module version mismatch may prevent the driver from loading.

### Switching to Generic Driver Mode

If you need to use Generic driver mode (supports multiple ports eth0/eth1, can coexist with gmac driver, can stop the service normally), modify `/etc/ethercat.conf`:

```shell
# Switch to Generic driver configuration
sudo sed -i 's/DEVICE_MODULES="hobot"/DEVICE_MODULES="generic"/' /etc/ethercat.conf
sudo sed -i 's/MASTER0_DEVICE=".*"/MASTER0_DEVICE="eth0"/' /etc/ethercat.conf
```

After modification, restart the device or the EtherCAT service. For detailed usage in Generic mode, please refer to the subsequent sections (starting with "Network Configuration Before Use").

---

## Network Configuration Before Use

<DocScope products="RDK S100">
:::warning
<font color="red">**Note:**</font> The following content applies to **Generic driver mode**. If you are using the V4.0.7 default Native driver mode, please refer to the "[Native Driver Usage Steps](#native-driver-usage-steps)" section above.

The EtherCAT protocol is mutually exclusive with the Ethernet protocol and **cannot coexist**. **The development board uses eth0 as the DHCP management interface by default**. If you want to use eth0 as the EtherCAT network interface, you can use one of the following network configuration schemes. **[Click here to see using eth0 as the EtherCAT master](#using-eth0-as-the-ethercat-master)**.

**Special note: The RDK S100 uses eth0 as the DHCP port by default. If you originally used eth0 as the primary mode for SSH connection to the development board, after using eth0 as the EtherCAT master, you need to configure eth1 for DHCP, or configure a fixed IP usable on your local network for SSH connection, and move the connected network cable to the eth1 port. [Click here to see the eth1 network configuration scheme when using eth0 as the master](#eth1-network-configuration-scheme-when-using-eth0-as-the-master)**.
:::
</DocScope>

<DocScope products="RDK S600">
:::warning
<font color="red">**Note:**</font> The following content applies to **Generic driver mode**. If you are using the V5.1.0 default Native driver mode, please refer to the "[Native Driver Usage Steps](#native-driver-usage-steps)" section above.

The EtherCAT protocol is mutually exclusive with the Ethernet protocol and **cannot coexist**. **The development board uses eth0 as the DHCP management interface by default**. If you want to use eth0 as the EtherCAT network interface, you can use one of the following network configuration schemes. **[Click here to see using eth0 as the EtherCAT master](#using-eth0-as-the-ethercat-master)**.

**Special note: The RDK S600 uses eth0 as the DHCP port by default. If you originally used eth0 as the primary mode for SSH connection to the development board, after using eth0 as the EtherCAT master, you need to configure eth1 for DHCP, or configure a fixed IP usable on your local network for SSH connection, and move the connected network cable to the eth1 port. [Click here to see the eth1 network configuration scheme when using eth0 as the master](#eth1-network-configuration-scheme-when-using-eth0-as-the-master)**.
:::
</DocScope>

## EtherCAT Usage Guide

:::info
This section applies to **Generic driver mode**. If you are using Native driver mode, please refer to the "[Native Driver Usage Steps](#native-driver-usage-steps)" section above.
:::

1. Ensure hardware connection:
    - The slave is powered on.
    - The network cable is connected to the master port you selected (`eth0` or `eth1`).
2. Select the master port (before selecting the master port, please carefully read the **notes in [Network Configuration Before Use](#network-configuration-before-use)**):
    - Using `eth0` as master: See **[Using eth0 as the EtherCAT master](#using-eth0-as-the-ethercat-master)**.
    - Using `eth1` as master: See **[Using eth1 as the EtherCAT master](#using-eth1-as-the-ethercat-master)**.
3. Start the EtherCAT master (using ethercatctl):
    ```shell
    sudo ethercatctl start
    ```
<DocScope products="RDK S100">
4. If using IgH 1.5.x (default firmware version for S100) and NetworkManager is configured not to manage the master port, you need to manually bring up the port before use:
</DocScope>
<DocScope products="RDK S600">
4. If using IgH 1.5.x (default firmware version for S600) and NetworkManager is configured not to manage the master port, you need to manually bring up the port before use:
</DocScope>

    ```shell
    sudo ip link set dev eth0 up
    # If the master port is eth1, replace with eth1
    ```
5. Check the master using user-space commands:
    ```shell
    sudo ethercat master
    # Sample output:
    sunrise@ubuntu:~$ sudo ethercat master
    Master0
      Phase: Idle
      Active: no
      Slaves: 0
      Ethernet devices:
        Main: xx:xx:xx:xx:xx:xx (attached)
        Link: UP
        Tx frames:   9477
        Tx bytes:    568620
        Rx frames:   0
        Rx bytes:    0
        Tx errors:   0
        Tx frame rate [1/s]:    124    125     89
        Tx rate [KByte/s]:      7.3    7.3    5.2
        Rx frame rate [1/s]:      0      0      0
        Rx rate [KByte/s]:      0.0    0.0    0.0
      Common:
        Tx frames:   9477
        Tx bytes:    568620
        Rx frames:   0
        Rx bytes:    0
        Lost frames: 9477
        Tx frame rate [1/s]:    124    125     89
        Tx rate [KByte/s]:      7.3    7.3    5.2
        Rx frame rate [1/s]:      0      0      0
        Rx rate [KByte/s]:      0.0    0.0    0.0
        Loss rate [1/s]:        124    125     89
        Frame loss [%]:       100.0  100.0  100.0
    Distributed clocks:
      Reference clock:   None
      DC reference time: 0
      Application time:  0
    ```
6. Configure IgH service to start automatically:
    ```shell
    sudo systemctl enable ethercat
    ```

## EtherCAT Development Guide

### Software Stack
The D-Robotics RDK S100 provides the EtherCAT-IgH 1.5 software stack by default (this section uses S100 as an example; the same applies to S600). The [EtherCAT-IgH software stack](https://docs.etherlab.org/ethercat/1.5/pdf/ethercat_doc.pdf) is currently the mainstream open-source EtherCAT master protocol.

EtherCAT official website: [EtherLab | EtherCAT](https://etherlab.org/en_GB/ethercat)
EtherCAT open-source code repository: [Gitlab | EtherLab - EtherCAT](https://gitlab.com/etherlab.org/ethercat)

### Compilation and Deployment
<DocScope products="RDK S100">
:::info
V4.0.7 uses the Native driver (`ec_hobot`) by default, which is pre-compiled in the system image. The following Host-side and board-side build instructions apply to scenarios where you need to compile the EtherCAT software stack yourself.
:::
</DocScope>

<DocScope products="RDK S600">
:::info
V5.1.0 uses the Native driver (`ec_hobot`) by default, which is pre-compiled in the system image. The following Host-side and board-side build instructions apply to scenarios where you need to compile the EtherCAT software stack yourself.
:::
</DocScope>

#### Host-side Build
Host-side build supports two methods:
1. Compile the debian package separately and deploy it
   ```shell
   # Construct debian package
   ./mk_debs.sh hobot-ethercat

   # Deploy
   ## Transfer generated out/product/deb_packages/hobot-ethercat_<***>_arm64.deb package to RDK S100/S600, the "<***>" is the version string
   ## On RDK S100/S600, presuming debian package is transferred to /userdata
   dpkg -i /userdata/hobot-ethercat_4.0.4-20250827135836_arm64.deb
   ```

   The build of hobot-ethercat includes two major modules: kernel module + user-space application. The kernel module build depends on the kernel outputs built locally by the user. If the user has not built the kernel locally, the kernel module build will be skipped automatically.

   :::info
   The `hobot-ethercat` debian package contains both the Native driver (`ec_hobot`) and the Generic driver (`ec_generic`), switched via the `DEVICE_MODULES` configuration in `/etc/ethercat.conf`.
   :::

2. Full build \
   By default, the rdk-gen build system integrates the hobot-ethercat debian package into the built disk image, which includes the kernel module and user-space applications.

#### Board-side Build
1. Download the source code:
   ```shell
   git clone https://gitlab.com/etherlab.org/ethercat.git -b stable-1.5
   ```
2. Build
   ```shell
   # Install build dependencies
   sudo apt install automake libtool m4 autoconf

   # Setup kernel module build environment
   sudo apt install flex bison
   sudo make -C /lib/modules/$(uname -r)/build prepare

   # Setup build environment
   cd ethercat
   ./bootstrap

   ./configure --enable-kernel --enable-generic --enable-igb --disable-eoe --enable-hrtimer --disable-8139too --with-linux-dir=/lib/modules/$(uname -r)/build/

   # Compile and install
   make -j
   make modules -j
   sudo make install
   sudo make modules_install
   ```
3. Edit `/usr/local/etc/ethercat.conf` and add the following content:
   ```
   MASTER0_DEVICE="eth0" // Device or MAC
   DEVICE_MODULES="generic"
   ```

---

## Using eth0 as the EtherCAT Master

### Modify EtherCAT Configuration File to Use eth0 as the EtherCAT Master

First, modify the `/etc/ethercat.conf` file to use eth0 as the EtherCAT master.

    ```shell
    ...
    # Main Ethernet devices.
    #
    # The MASTER<X>_DEVICE variable specifies the Ethernet device for a master
    # with index 'X'.
    #
    # Specify the MAC address (hexadecimal with colons) of the Ethernet device to
    # use. Example: "00:00:08:44:ab:66"
    #
    # Alternatively, a network interface name can be specified. The interface
    # name will be resolved to a MAC address using the 'ip' command.
    # Example: "eth0"
    #
    # The broadcast address "ff:ff:ff:ff:ff:ff" has a special meaning: It tells
    # the master to accept the first device offered by any Ethernet driver.
    #
    # The MASTER<X>_DEVICE variables also determine, how many masters will be
    # created: A non-empty variable MASTER0_DEVICE will create one master, adding a
    # non-empty variable MASTER1_DEVICE will create a second master, and so on.
    #
    # Examples:
    # MASTER0_DEVICE="00:00:08:44:ab:66"
    # MASTER0_DEVICE="eth0"
    #
    MASTER0_DEVICE="eth0"
    #MASTER1_DEVICE=""
    ...
    ```

Choose the appropriate network interface configuration scheme for eth0 based on your usage scenario:

### Scheme Overview

**[Scheme 1: Configure NetworkManager not to manage the eth0 interface (Recommended)](#scheme-1-configure-networkmanager-not-to-manage-the-eth0-interface-recommended)**
- **Use case**: You need NetworkManager to manage other network interfaces but do not want eth0 to be managed.
- **Prerequisite**: Keep the NetworkManager service running.
- **Advantage**: Allows you to keep the NetworkManager service while avoiding interference with the interface used by EtherCAT.
- **Note**: After configuring NetworkManager not to manage the eth0 interface, the corresponding port will not be automatically brought up when the system starts. Please refer to the notes and configuration method below for usage.
:::warning **Note**
<font color="red">The pre-installed version on the board is igh 1.5.x, which does not support automatic network port up/down by default. You need to manually enable the **eth0** network card used by EtherCAT.</font> igh versions 1.6.4 and later support configuring automatic network port up/down in the configuration file. For details, refer to [Automatic network card start/stop (supported in EtherCAT igh master version 1.6.4 and later)](#automatic-network-card-startstop-supported-in-ethercat-igh-master-version-164-and-later).
:::

**[Scheme 2: Use netplan to configure eth0 with a static IP address](#scheme-2-use-netplan-to-configure-eth0-with-a-static-ip-address)**

**[Scheme 3: Use netplan to configure eth0 for link-local addressing](#scheme-3-use-netplan-to-configure-eth0-for-link-local-addressing)**: Keep the NetworkManager service running, configure eth0 via netplan.
- **Use case**: You need NetworkManager to manage other network interfaces.
- **Prerequisite**: Keep NetworkManager's control over eth0.
- **Hint**: Special configuration of the network interface used by EtherCAT via netplan is required as described in the schemes below.

:::warning
<font color="red">**Special Note:**</font> Do not disable NetworkManager's automatic startup, otherwise the system will not be able to automatically bring UP all network interfaces after reboot!!! There is a risk of losing device connectivity!!!
:::

### Scheme 1: Configure NetworkManager not to manage the eth0 interface (Recommended)

1. Create a NetworkManager configuration file to set eth0 as unmanaged:

    :::info
    **Important**: The section name in the configuration file must start with `device-`.
    :::
    Example (user can modify according to their needs):
    ```shell
    vim /etc/NetworkManager/conf.d/99-unmanaged-devices.conf
    ```
    Change the content to:
    ```
    [device-eth0-unmanaged]
    match-device=interface-name:eth0
    managed=0
    ```
2. Reboot the system to clear NetworkManager's device state cache:
    ```shell
    sudo reboot
    ```

    :::info
    Rebooting clears the state in the `/run/NetworkManager/devices/` directory. This prevents NetworkManager from using existing connections in that directory for devices set as unmanaged.
    :::
3. Verify the configuration (after reboot):
    Check the network interface status. You should see that eth0 is now unmanaged:
    ```shell
    sunrise@ubuntu:~$ sudo nmcli device status
    DEVICE         TYPE      STATE                   CONNECTION
    eth1           ethernet  connected               netplan-eth1
    lo             loopback  connected (externally)  lo
    wlan0          wifi      disconnected            --
    p2p-dev-wlan0  wifi-p2p  disconnected            --
    eth2           ethernet  unavailable             --
    eth3           ethernet  unavailable             --
    eth0           ethernet  unmanaged               --
    ```
    Check IP addresses. You should see that eth0 is DOWN:
    ```shell
    sunrise@ubuntu:~$ sudo ip a
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
        inet 127.0.0.1/8 scope host lo
           valid_lft forever preferred_lft forever
        inet6 ::1/128 scope host noprefixroute
           valid_lft forever preferred_lft forever
    2: eth0: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff
        altname end2
    3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff permaddr xx:xx:xx:xx:xx:xx
        altname end3
        inet 192.168.127.10/24 brd 192.168.127.255 scope global noprefixroute eth1
           valid_lft forever preferred_lft forever
        inet6 fe80::xxxx:xxff:fexx:xxxx/64 scope link
           valid_lft forever preferred_lft forever
    ...
    ```
4. Start the IgH EtherCAT master:

    ```shell
    # Start the EtherCAT service
    sudo ethercatctl start

    # Check service status
    sudo ethercatctl status
    ```

    Example output:
    ```shell
    sudo ethercatctl status
    # sample output
    Checking for EtherCAT master 1.5.3
    Master0  running

    sudo ethercat master
    # sample output
    Master0
      Phase: Idle
      Active: no
      Slaves: 0
      Ethernet devices:
        Main: xx:xx:xx:xx:xx:xx (attached)
          Link: DOWN
          Tx frames:   0
          Tx bytes:    0
          Rx frames:   0
          Rx bytes:    0
          Tx errors:   0
          Tx frame rate [1/s]:      0      0      0
          Tx rate [KByte/s]:      0.0    0.0    0.0
          Rx frame rate [1/s]:      0      0      0
          Rx rate [KByte/s]:      0.0    0.0    0.0
        Common:
          Tx frames:   0
          Tx bytes:    0
          Rx frames:   0
          Rx bytes:    0
          Lost frames: 0
          Tx frame rate [1/s]:      0      0      0
          Tx rate [KByte/s]:      0.0    0.0    0.0
          Rx frame rate [1/s]:      0      0      0
          Rx rate [KByte/s]:      0.0    0.0    0.0
          Loss rate [1/s]:          0      0      0
          Frame loss [%]:         0.0    0.0    0.0
      Distributed clocks:
        Reference clock:   None
        DC reference time: 0
        Application time:  0
                           2000-01-01 00:00:00.000000000

    sunrise@ubuntu:~$ sudo ethercat slaves
    # No slaves detected at this point
    ```

5. Manually bring up the eth0 network card (required for IgH 1.5.x):

    ```shell
    sudo ip link set dev eth0 up
    ```

    Check again after bringing it up. EtherCAT should now be working normally:

    ```shell
    sunrise@ubuntu:~$ sudo ip a
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
        inet 127.0.0.1/8 scope host lo
           valid_lft forever preferred_lft forever
        inet6 ::1/128 scope host noprefixroute
           valid_lft forever preferred_lft forever
    2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff
        altname end2
        inet6 fe80::xxxx:xxff:fexx:xxxx/64 scope link
           valid_lft forever preferred_lft forever
    3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff permaddr xx:xx:xx:xx:xx:xx
        altname end3
        inet 192.168.127.10/24 brd 192.168.127.255 scope global noprefixroute eth1
           valid_lft forever preferred_lft forever
        inet6 fe80::xxxx:xxff:fexx:xxxx/64 scope link
           valid_lft forever preferred_lft forever
    ...

    sunrise@ubuntu:~$ sudo ethercat master
    Master0
      Phase: Idle
      Active: no
      Slaves: 1
      Ethernet devices:
        Main: xx:xx:xx:xx:xx:xx (attached)
          Link: UP
          Tx frames:   5236
          Tx bytes:    373552
          Rx frames:   5235
          Rx bytes:    373492
          Tx errors:   0
          Tx frame rate [1/s]:    249    313     77
          Tx rate [KByte/s]:     14.6   22.0    5.4
          Rx frame rate [1/s]:    249    313     77
          Rx rate [KByte/s]:     14.6   22.0    5.4
        Common:
          Tx frames:   5236
          Tx bytes:    373552
          Rx frames:   5235
          Rx bytes:    373492
          Lost frames: 0
          Tx frame rate [1/s]:    249    313     77
          Tx rate [KByte/s]:     14.6   22.0    5.4
          Rx frame rate [1/s]:    249    313     77
          Rx rate [KByte/s]:     14.6   22.0    5.4
          Loss rate [1/s]:          0      0      0
          Frame loss [%]:         0.0    0.0    0.0
      Distributed clocks:
        Reference clock:   Slave 0
        DC reference time: 0
        Application time:  0
                           2000-01-01 00:00:00.000000000

    sunrise@ubuntu:~$ sudo ethercat slaves
    0  0:0  PREOP  +  SSC-Device-ADDOUT
    ```

    :::tip
    You can now see `Link: UP`, `Slaves: 1`, indicating the EtherCAT slave has been successfully recognized and is working normally.
    :::

If you are using EtherCAT igh master version 1.6.4 or later, you can refer to [Automatic network card start/stop (supported in EtherCAT igh master version 1.6.4 and later)](#automatic-network-card-startstop-supported-in-ethercat-igh-master-version-164-and-later) for configuration.

### Scheme 2: Use netplan to configure eth0 with a static IP address
<details>
    <summary>Click here to expand more content</summary>
1. Modify the configuration file `/etc/netplan/01-hobot-net.yaml` as follows (the following configuration is an example; users should configure according to their needs):
    ```yaml
    root@ubuntu:/etc/netplan# cat 01-hobot-net.yaml
    network:
      version: 2
      renderer: NetworkManager
      ethernets:
        eth0:
          addresses:
            - "192.168.127.10/24"
          nameservers:
            addresses:
              - 10.9.1.2
              - 8.8.8.8
              - 8.8.4.4
          macaddress: "xx:xx:xx:xx:xx:xx"
        eth1:
          addresses:
            - "192.168.127.11/24"
          nameservers:
            addresses:
              - 10.9.1.2
              - 8.8.8.8
              - 8.8.4.4
          macaddress: "xx:xx:xx:xx:xx:xx"
    ```
2. Apply the configuration
    ```shell
    netplan generate
    netplan apply
    ```
3. Check IP address information
    ```shell
    root@ubuntu:/etc/netplan# ip a
    # Sample output:
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
        inet 127.0.0.1/8 scope host lo
            valid_lft forever preferred_lft forever
        inet6 ::1/128 scope host
            valid_lft forever preferred_lft forever
    2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff permaddr xx:xx:xx:xx:xx:xx
        inet 192.168.127.10/24 brd 192.168.127.255 scope link noprefixroute eth0
            valid_lft forever preferred_lft forever
        inet6 fe80::xxxx:xxff:fexx:xxxx/64 scope link
            valid_lft forever preferred_lft forever
    3: eth1: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff
    ```
</details>

### Scheme 3: Use netplan to configure eth0 for link-local addressing
<details>
    <summary>Click here to expand more content</summary>
1. Modify the configuration file `/etc/netplan/01-hobot-net.yaml` as follows: (the following configuration is an example; users should configure according to their needs):
    ```yaml
    root@ubuntu:/etc/netplan# cat 01-hobot-net.yaml
    network:
      version: 2
      renderer: NetworkManager
      ethernets:
        eth0:
          #nameservers:
          #  addresses:
          #    - 10.9.1.2
          #    - 8.8.8.8
          #    - 8.8.4.4
          dhcp4: false
          dhcp6: false
          macaddress: "xx:xx:xx:xx:xx:xx"
        eth1:
          addresses:
            - "192.168.127.11/24"
          nameservers:
            addresses:
              - 10.9.1.2
              - 8.8.8.8
              - 8.8.4.4
          macaddress: "xx:xx:xx:xx:xx:xx"
    ```
2. Apply the configuration
    ```shell
    netplan generate
    netplan apply
    ```
3. Check IP address information
    ```shell
    root@ubuntu:/etc/netplan# ip a
    # Sample output:
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
        inet 127.0.0.1/8 scope host lo
            valid_lft forever preferred_lft forever
        inet6 ::1/128 scope host
            valid_lft forever preferred_lft forever
    2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff permaddr xx:xx:xx:xx:xx:xx
        inet 169.254.245.98/16 brd 169.254.255.255 scope link noprefixroute eth0
            valid_lft forever preferred_lft forever
        inet6 fe80::xxxx:xxff:fexx:xxxx/64 scope link
            valid_lft forever preferred_lft forever
    3: eth1: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff
    ```
</details>

### eth1 Network Configuration Scheme When Using eth0 as the Master

The following network configurations only provide configuration for eth1. For eth0 configuration, please refer to **[Using eth0 as the EtherCAT master](#using-eth0-as-the-ethercat-master)** above.

#### Configure eth1 for DHCP
<details>
    <summary>Click here to expand more content</summary>

    ```yaml
    network:
      version: 2
      renderer: NetworkManager
      ethernets:
        eth0:
          # Refer to configuration above
        eth1:
          nameservers:
            addresses:
              - 10.9.1.2
              - 8.8.8.8
              - 8.8.4.4
          dhcp4: true
          dhcp6: true
          macaddress: "xx:xx:xx:xx:xx:xx"
    ```
</details>

#### Configure eth1 with a static IP
<details>
    <summary>Click here to expand more content</summary>

    ```yaml
    network:
      version: 2
      renderer: NetworkManager
      ethernets:
        eth0:
          # Refer to configuration above
        eth1:
          addresses:
            - "192.168.127.11/24"
          routes:
            - to: default
              via: "192.168.127.1"
          nameservers:
            addresses:
              - 10.9.1.2
              - 8.8.8.8
              - 8.8.4.4
          macaddress: "xx:xx:xx:xx:xx:xx"
    ```
</details>

## Using eth1 as the EtherCAT Master

The network configuration for using eth1 as the EtherCAT master is similar to the above section [Using eth0 as the EtherCAT master](#using-eth0-as-the-ethercat-master). Only the recommended scheme is shown below.

### Modify EtherCAT Configuration File to Use eth1 as the EtherCAT Master

First, modify `/etc/ethercat.conf` to use eth1 as the EtherCAT master.

    ```shell
    ...
    # Main Ethernet devices.
    #
    # The MASTER<X>_DEVICE variable specifies the Ethernet device for a master
    # with index 'X'.
    #
    # Example: "eth1"
    #
    # The broadcast address "ff:ff:ff:ff:ff:ff" has a special meaning: It tells
    # the master to accept the first device offered by any Ethernet driver.
    #
    # The MASTER<X>_DEVICE variables also determine, how many masters will be
    # created: A non-empty variable MASTER0_DEVICE will create one master, adding a
    # non-empty variable MASTER1_DEVICE will create a second master, and so on.
    #
    # Examples:
    # MASTER0_DEVICE="00:00:08:44:ab:66"
    # MASTER0_DEVICE="eth1"
    #
    MASTER0_DEVICE="eth1"
    #MASTER1_DEVICE=""
    ...
    ```

<DocScope products="RDK S100">
:::warning
Note: The RDK S100 uses eth0 as the DHCP port by default, and eth1 is configured with a static IP. Users can directly follow the steps below to configure NetworkManager not to manage the eth1 interface (recommended).
:::
</DocScope>
<DocScope products="RDK S600">
:::warning
Note: The RDK S600 uses eth0 as the DHCP port by default, and eth1 is configured with a static IP. Users can directly follow the steps below to configure NetworkManager not to manage the eth1 interface (recommended).
:::
</DocScope>

### Configure NetworkManager not to manage the eth1 interface (Recommended)

1. Create a NetworkManager configuration file to set eth1 as unmanaged:

    :::info
    **Important**: The section name in the configuration file must start with `device-`.
    :::
    Example (user can modify according to their needs):
    ```shell
    vim /etc/NetworkManager/conf.d/99-unmanaged-devices.conf
    ```
    Change the content to:
    ```
    [device-eth1-unmanaged]
    match-device=interface-name:eth1
    managed=0
    ```
2. Reboot the system to clear NetworkManager's device state cache:
    ```shell
    sudo reboot
    ```

    :::info
    Rebooting clears the state in the `/run/NetworkManager/devices/` directory. This prevents NetworkManager from using existing connections in that directory for devices set as unmanaged.
    :::
3. Verify the configuration (after reboot):
    Check the network interface status. You should see that eth1 is now unmanaged:
    ```shell
    sunrise@ubuntu:~$ sudo nmcli device status
    nmcli device status
    DEVICE         TYPE      STATE                   CONNECTION
    lo             loopback  connected (externally)  lo
    wlan0          wifi      disconnected            --
    p2p-dev-wlan0  wifi-p2p  disconnected            --
    eth0           ethernet  unavailable             --
    eth2           ethernet  unavailable             --
    eth3           ethernet  unavailable             --
    eth1           ethernet  unmanaged               --
    ```
    Check IP addresses. You should see that eth1 is DOWN:
    ```shell
    sunrise@ubuntu:~$ sudo ip a
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
        inet 127.0.0.1/8 scope host lo
        valid_lft forever preferred_lft forever
        inet6 ::1/128 scope host noprefixroute
        valid_lft forever preferred_lft forever
    2: eth0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff
        altname end2
    3: eth1: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff
        altname end3
    ...
    ```
4. Start the IgH EtherCAT master:

    ```shell
    # Start the EtherCAT service
    sudo ethercatctl start

    # Check service status
    sudo ethercatctl status
    ```

    Example output:
    ```shell
    sunrise@ubuntu:~$ sudo ethercatctl start
    [  458.587518] ec_generic: Binding socket to interface 3 (eth1).

    sunrise@ubuntu:~$ sudo ethercatctl status
    Checking for EtherCAT master 1.5.3
    Master0  running

    sunrise@ubuntu:~$ sudo ethercat master
    Master0
    Phase: Idle
    Active: no
    Slaves: 0
    Ethernet devices:
        Main: xx:xx:xx:xx:xx:xx (attached)
        Link: DOWN
        Tx frames:   0
        Tx bytes:    0
        Rx frames:   0
        Rx bytes:    0
        Tx errors:   0
        Tx frame rate [1/s]:      0      0      0
        Tx rate [KByte/s]:      0.0    0.0    0.0
        Rx frame rate [1/s]:      0      0      0
        Rx rate [KByte/s]:      0.0    0.0    0.0
        Common:
        Tx frames:   0
        Tx bytes:    0
        Rx frames:   0
        Rx bytes:    0
        Lost frames: 0
        Tx frame rate [1/s]:      0      0      0
        Tx rate [KByte/s]:      0.0    0.0    0.0
        Rx frame rate [1/s]:      0      0      0
        Rx rate [KByte/s]:      0.0    0.0    0.0
        Loss rate [1/s]:          0      0      0
        Frame loss [%]:         0.0    0.0    0.0
    Distributed clocks:
        Reference clock:   None
        DC reference time: 0
        Application time:  0
                        2000-01-01 00:00:00.000000000

    sunrise@ubuntu:~$ sudo ethercat slaves
    # No slaves detected at this point
    ```

5. Manually bring up the eth1 network card (required for IgH 1.5.x):

    ```shell
    sudo ip link set dev eth1 up
    ```

    Check again after bringing it up. EtherCAT should now be working normally:

    ```shell
    sunrise@ubuntu:~$ sudo ip a
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
        inet 127.0.0.1/8 scope host lo
        valid_lft forever preferred_lft forever
        inet6 ::1/128 scope host noprefixroute
        valid_lft forever preferred_lft forever
    2: eth0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff
        altname end2
    3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff
        altname end3
        inet6 fe80::xxxx:xxff:fexx:xxxx/64 scope link
        valid_lft forever preferred_lft forever
    ...

    sunrise@ubuntu:~$ sudo ethercat master
    Master0
    Phase: Idle
    Active: no
    Slaves: 1
    Ethernet devices:
        Main: xx:xx:xx:xx:xx:xx (attached)
        Link: UP
        Tx frames:   7071
        Tx bytes:    483524
        Rx frames:   7070
        Rx bytes:    483464
        Tx errors:   0
        Tx frame rate [1/s]:    249    280     98
        Tx rate [KByte/s]:     14.6   18.1    6.5
        Rx frame rate [1/s]:    249    280     98
        Rx rate [KByte/s]:     14.6   18.1    6.5
        Common:
        Tx frames:   7071
        Tx bytes:    483524
        Rx frames:   7070
        Rx bytes:    483464
        Lost frames: 0
        Tx frame rate [1/s]:    249    280     98
        Tx rate [KByte/s]:     14.6   18.1    6.5
        Rx frame rate [1/s]:    249    280     98
        Rx rate [KByte/s]:     14.6   18.1    6.5
        Loss rate [1/s]:          0     -0      0
        Frame loss [%]:         0.0   -0.0    0.0
    Distributed clocks:
        Reference clock:   Slave 0
        DC reference time: 0
        Application time:  0
                        2000-01-01 00:00:00.000000000

    sunrise@ubuntu:~$ sudo ethercat slaves
    0  0:0  PREOP  +  SSC-Device-ADDOUT
    ```

    :::tip
    You can now see `Link: UP`, `Slaves: 1`, indicating the EtherCAT slave has been successfully recognized and is working normally.
    :::

If you are using EtherCAT igh master version 1.6.4 or later, you can refer to [Automatic network card start/stop (supported in EtherCAT igh master version 1.6.4 and later)](#automatic-network-card-startstop-supported-in-ethercat-igh-master-version-164-and-later) for configuration.

## FAQ

### Automatic network card start/stop (supported in EtherCAT igh master version 1.6.4 and later)

:::info
**New version support**: Newer versions of the EtherCAT igh master (version 1.6.4 and later) configuration and startup scripts support automatically bringing up the port (the `ip link set dev eth0 up` command is added to the startup script). If your version does not support automatic enabling, you can manually execute the command above.
:::
1. Modify `/etc/ethercat.conf` and add the corresponding network port to the `UPDOWN_INTERFACES` variable. For example, add the eth0 interface. This will automatically bring up/down the corresponding network interface when executing `ethercatctl start` or `ethercatctl stop`.
    ```bash
    #
    # List of interfaces to bring up and down automatically.
    #
    # Specify a space-separated list of interface names (such as eth0 or
    # enp0s1) that shall be brought up on `ethercatctl start` and down on
    # `ethercatctl stop`.
    #
    # When using the generic driver, the corresponding Ethernet device has to be
    # activated before the master is started, otherwise all frames will time out.
    # This the perfect use-case for `UPDOWN_INTERFACES`.
    #
    UPDOWN_INTERFACES="eth0"
    ```

## Related Documentation

- [Ethernet](./01_ethernet.md)
- [EtherCAT User Manual (MCU Side)](../../11_mcu_development/17_mcu_ethercat.md)
