---
sidebar_position: 2
---

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

:::warning
<font color="red">**Note:**</font> Using the EtherCAT protocol requires system version V4.0.4 or higher.
:::

## Network Configuration Before Use

<DocScope products="RDK S100">
:::warning
<font color="red">**Note:**</font> The EtherCAT protocol and the Ethernet protocol are mutually exclusive and **cannot coexist**. **The development board uses eth0 as the DHCP management interface by default**. If you want to use eth0 as the EtherCAT network interface, you can use one of the following network configuration solutions. **[Click here to view using eth0 as the EtherCAT master](#using-eth0-as-the-ethercat-master)**.

**Special note: RDK S100 uses eth0 as the DHCP network port by default. If you originally used eth0 as the main mode for SSH connection to the development board, after using eth0 as the EtherCAT master, you need to configure eth1 as DHCP, or configure a fixed IP available on your local network as the SSH connection method, and change the connected network cable to the eth1 port. [Click here to view the eth1 network configuration solution when using eth0 as the master](#eth1-network-configuration-solution-when-using-eth0-as-the-master)**.
:::
</DocScope>
<DocScope products="RDK S600">
:::warning
<font color="red">**Note:**</font> The EtherCAT protocol and the Ethernet protocol are mutually exclusive and **cannot coexist**. **The development board uses eth0 as the DHCP management interface by default**. If you want to use eth0 as the EtherCAT network interface, you can use one of the following network configuration solutions. **[Click here to view using eth0 as the EtherCAT master](#using-eth0-as-the-ethercat-master)**.

**Special note: RDK S600 uses eth0 as the DHCP network port by default. If you originally used eth0 as the main mode for SSH connection to the development board, after using eth0 as the EtherCAT master, you need to configure eth1 as DHCP, or configure a fixed IP available on your local network as the SSH connection method, and change the connected network cable to the eth1 port. [Click here to view the eth1 network configuration solution when using eth0 as the master](#eth1-network-configuration-solution-when-using-eth0-as-the-master)**.
:::
</DocScope>

## EtherCAT User Guide

1. Verify hardware connections:
    - The slave is powered on.
    - The network cable is connected to the master network port you selected (`eth0` or `eth1`).
2. Select the master network port (before selecting the master port, carefully read the **precautions in [Network Configuration Before Use](#network-configuration-before-use)**:
    - Using `eth0` as master: see **[Using eth0 as the EtherCAT master](#using-eth0-as-the-ethercat-master)**.
    - Using `eth1` as master: see **[Using eth1 as the EtherCAT master](#using-eth1-as-the-ethercat-master)**.
3. Start the EtherCAT master (using ethercatctl):
    ```shell
    sudo ethercatctl start
    ```
<DocScope products="RDK S100">
4. If using IgH 1.5.x (default firmware version for S100) and NetworkManager is configured not to manage the master network port, you need to manually enable the network port before use:
</DocScope>
<DocScope products="RDK S600">
4. If using IgH 1.5.x (default firmware version for S600) and NetworkManager is configured not to manage the master network port, you need to manually enable the network port before use:
</DocScope>

    ```shell
    sudo ip link set dev eth0 up
    # If the master network port is eth1, replace with eth1
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
        Main: c8:30:76:63:2d:93 (attached)
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
D-Robotics RDK S100 provides the EtherCAT-IgH 1.5 software stack by default (this section uses S100 as an example; the same applies to S600). The [EtherCAT-IgH software stack](https://docs.etherlab.org/ethercat/1.5/pdf/ethercat_doc.pdf) is currently the mainstream open-source EtherCAT master protocol.

EtherCAT official website: [EtherLab | EtherCAT](https://etherlab.org/en_GB/ethercat)
EtherCAT open-source code repository: [Gitlab | EtherLab - EtherCAT](https://gitlab.com/etherlab.org/ethercat)

### Compilation and Deployment
#### Host-side Build
Host-side build supports two methods:
1. Compile debian package separately and deploy
   ```shell
   # Construct debian package
   ./mk_debs.sh hobot-ethercat

   # Deploy
   ## Transfer generated out/product/deb_packages/hobot-ethercat_<***>_arm64.deb package to RDK S100, the "<***>" is the version string
   ## On RDK S100, presuming debian package is transferred to /userdata
   dpkg -i /userdata/hobot-ethercat_4.0.4-20250827135836_arm64.deb
   ```

   The build of hobot-ethercat includes two major modules: kernel module + user-space applications. Building the kernel module depends on the locally built kernel outputs. If the user has not built the kernel locally, the kernel module build will be automatically skipped.

2. Full build \
   By default, after the rdk-gen build system fully builds the disk image, the image will have the hobot-ethercat debian package integrated by default, which includes the kernel module and user-space applications.

#### Board-side Build
1. Download source code:
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
3. Edit `/usr/local/etc/ethercat.conf` and add the following:
   ```
   MASTER0_DEVICE="eth0" // Device or MAC
   DEVICE_MODULES="generic"
   ```

---

## Using eth0 as the EtherCAT Master

### Modify EtherCAT configuration file to use eth0 as the EtherCAT master

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

Choose the appropriate eth0 network interface configuration solution based on your usage scenario:

### Solution Overview

**[Solution 1: Configure NetworkManager not to manage the eth0 interface (recommended)](#solution-1-configure-networkmanager-not-to-manage-the-eth0-interface-recommended)**
- **Applicable scenario**: Need NetworkManager to manage other network interfaces but do not want eth0 to be managed
- **Prerequisite**: Keep the NetworkManager service running
- **Advantage**: Retains the NetworkManager service while avoiding interference with the interface used by EtherCAT
- **Note**: After configuring NetworkManager not to manage the eth0 interface, the corresponding network port will not automatically come up when the system starts. Please refer to the note below and the configuration method for usage.
:::warning **Note**
<font color="red">Currently, the pre-installed version on the board is igh 1.5.x, which by default cannot automatically bring the network port up/down. You need to manually enable the **eth0** network card used by EtherCAT.</font> igh versions 1.6.4 and later support configuring automatic network port up/down in the configuration file. For details, refer to: [Automatic network card start/stop](#automatic-network-card-startstop-supported-in-ethercat-igh-master-version-164-and-later)
:::

[Solution 2: Use netplan to configure eth0 with a static IP address](#solution-2-use-netplan-to-configure-eth0-with-a-static-ip-address),

 [Solution 3: Use netplan to configure eth0 for local link](#solution-3-use-netplan-to-configure-eth0-for-local-link): Keep NetworkManager service running, configure eth0 via netplan
- **Applicable scenario**: Need NetworkManager to manage other network interfaces
- **Prerequisite**: Retain NetworkManager's control over eth0
- **Tip**: Special configuration of the network interface used by EtherCAT is required using netplan as described in the solutions below

:::warning
<font color="red">**Special note:**</font> Do not disable NetworkManager's auto-start, otherwise the system will not automatically UP all network interfaces after reboot!!! There is a risk of losing device connection!!!
:::

### Solution 1: Configure NetworkManager not to manage the eth0 interface (recommended)

1. Create a NetworkManager configuration file to set eth0 as unmanaged:

    :::info
    **Important**: The section name in the configuration file must start with `device-`.
    :::
    Example (users can modify as needed):
    ```shell
    vim /etc/NetworkManager/conf.d/99-unmanaged-devices.conf
    ```
    Change to the following:
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
3. Verify configuration (after reboot):
    Check the network interface status; you can see eth0 is now unmanaged:
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
    Check the IP address; you can see eth0 is DOWN:
    ```shell
    sunrise@ubuntu:~$ sudo ip a
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
        inet 127.0.0.1/8 scope host lo
           valid_lft forever preferred_lft forever
        inet6 ::1/128 scope host noprefixroute
           valid_lft forever preferred_lft forever
    2: eth0: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN group default qlen 1000
        link/ether 82:89:02:ec:a0:75 brd ff:ff:ff:ff:ff:ff
        altname end2
    3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
        link/ether 26:36:26:6f:d5:bf brd ff:ff:ff:ff:ff:ff permaddr 52:a7:fa:6c:50:16
        altname end3
        inet 192.168.127.10/24 brd 192.168.127.255 scope global noprefixroute eth1
           valid_lft forever preferred_lft forever
        inet6 fe80::2436:26ff:fe6f:d5bf/64 scope link
           valid_lft forever preferred_lft forever
    ...
    ```
4. Start the IgH EtherCAT master:

    ```shell
    # Start EtherCAT service
    sudo ethercatctl start

    # Check service status
    sudo ethercatctl status
    ```

    Sample output:
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
        Main: 82:89:02:ec:a0:75 (attached)
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
    # No slave detected
    ```

5. Manually enable eth0 network card (required for IgH 1.5.x):

    ```shell
    sudo ip link set dev eth0 up
    ```

    Check again after enabling; EtherCAT works normally:

    ```shell
    sunrise@ubuntu:~$ sudo ip a
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
        inet 127.0.0.1/8 scope host lo
           valid_lft forever preferred_lft forever
        inet6 ::1/128 scope host noprefixroute
           valid_lft forever preferred_lft forever
    2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
        link/ether 82:89:02:ec:a0:75 brd ff:ff:ff:ff:ff:ff
        altname end2
        inet6 fe80::8089:2ff:feec:a075/64 scope link
           valid_lft forever preferred_lft forever
    3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
        link/ether 26:36:26:6f:d5:bf brd ff:ff:ff:ff:ff:ff permaddr 52:a7:fa:6c:50:16
        altname end3
        inet 192.168.127.10/24 brd 192.168.127.255 scope global noprefixroute eth1
           valid_lft forever preferred_lft forever
        inet6 fe80::2436:26ff:fe6f:d5bf/64 scope link
           valid_lft forever preferred_lft forever
    ...

    sunrise@ubuntu:~$ sudo ethercat master
    Master0
      Phase: Idle
      Active: no
      Slaves: 1
      Ethernet devices:
        Main: 82:89:02:ec:a0:75 (attached)
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
    You can now see `Link: UP`, `Slaves: 1`, and the EtherCAT slave is successfully recognized and working normally.
    :::

If you are using EtherCAT igh master version 1.6.4 or later, you can refer to [Automatic network card start/stop (supported in EtherCAT igh master version 1.6.4 and later)](#automatic-network-card-startstop-supported-in-ethercat-igh-master-version-164-and-later) for configuration.

### Solution 2: Use netplan to configure eth0 with a static IP address
<details>
    <summary>Click here to expand for more</summary>
1. Modify the configuration file `/etc/netplan/01-hobot-net.yaml` as follows (the following configuration is an example; users can configure as needed):
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
          macaddress: "52:e9:e0:57:b8:59"
        eth1:
          addresses:
            - "192.168.127.11/24"
          nameservers:
            addresses:
              - 10.9.1.2
              - 8.8.8.8
              - 8.8.4.4
          macaddress: "22:60:87:8c:4d:8d"
    ```
2. Apply the configuration file
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
        link/ether 52:e9:e0:57:b8:59 brd ff:ff:ff:ff:ff:ff permaddr c6:34:76:c1:e0:b4
        inet 192.168.127.10/24 brd 192.168.127.255 scope link noprefixroute eth0
            valid_lft forever preferred_lft forever
        inet6 fe80::50e9:e0ff:fe57:b859/64 scope link
            valid_lft forever preferred_lft forever
    3: eth1: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN group default qlen 1000
        link/ether ca:03:43:37:17:52 brd ff:ff:ff:ff:ff:ff
    ```
</details>

### Solution 3: Use netplan to configure eth0 for local link
<details>
    <summary>Click here to expand for more</summary>
1. Modify the configuration file `/etc/netplan/01-hobot-net.yaml` as follows (the following configuration is an example; users can configure as needed):
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
          macaddress: "52:e9:e0:57:b8:59"
        eth1:
          addresses:
            - "192.168.127.11/24"
          nameservers:
            addresses:
              - 10.9.1.2
              - 8.8.8.8
              - 8.8.4.4
          macaddress: "22:60:87:8c:4d:8d"
    ```
2. Apply the configuration file
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
        link/ether 52:e9:e0:57:b8:59 brd ff:ff:ff:ff:ff:ff permaddr c6:34:76:c1:e0:b4
        inet 169.254.245.98/16 brd 169.254.255.255 scope link noprefixroute eth0
            valid_lft forever preferred_lft forever
        inet6 fe80::50e9:e0ff:fe57:b859/64 scope link
            valid_lft forever preferred_lft forever
    3: eth1: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN group default qlen 1000
        link/ether ca:03:43:37:17:52 brd ff:ff:ff:ff:ff:ff
    ```
</details>

### eth1 Network Configuration Solution When Using eth0 as the Master

The following network configurations only provide configuration for eth1. For eth0 configuration, refer to **[Using eth0 as the EtherCAT master](#using-eth0-as-the-ethercat-master)** above.

#### Configure eth1 as DHCP
<details>
    <summary>Click here to expand for more</summary>

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
          macaddress: "26:36:26:6f:d5:bf"
    ```
</details>

#### Configure eth1 with a static IP
<details>
    <summary>Click here to expand for more</summary>

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
          macaddress: "26:36:26:6f:d5:bf"
    ```
</details>

## Using eth1 as the EtherCAT Master

The network configuration for using eth1 as the EtherCAT master is similar to [Using eth0 as the EtherCAT master](#using-eth0-as-the-ethercat-master) above. Only the recommended solution is shown below.

### Modify EtherCAT configuration file to use eth1 as the EtherCAT master

First, modify `/etc/ethercat.conf` to use eth1 as the EtherCAT master

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
Note: RDK S100 uses eth0 as the DHCP network port by default, and eth1 is configured with a static IP. Users can directly follow the steps below to configure NetworkManager not to manage the eth1 interface (recommended)
:::
</DocScope>
<DocScope products="RDK S600">
:::warning
Note: RDK S600 uses eth0 as the DHCP network port by default, and eth1 is configured with a static IP. Users can directly follow the steps below to configure NetworkManager not to manage the eth1 interface (recommended)
:::
</DocScope>

### Configure NetworkManager not to manage the eth1 interface (recommended)

1. Create a NetworkManager configuration file to set eth1 as unmanaged:

    :::info
    **Important**: The section name in the configuration file must start with `device-`.
    :::
    Example (users can modify as needed):
    ```shell
    vim /etc/NetworkManager/conf.d/99-unmanaged-devices.conf
    ```
    Change to the following:
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
3. Verify configuration (after reboot):
    Check the network interface status; you can see eth1 is now unmanaged:
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
    Check the IP address; you can see eth0 is DOWN:
    ```shell
    sunrise@ubuntu:~$ sudo ip a
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
        inet 127.0.0.1/8 scope host lo
        valid_lft forever preferred_lft forever
        inet6 ::1/128 scope host noprefixroute
        valid_lft forever preferred_lft forever
    2: eth0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN group default qlen 1000
        link/ether c6:40:e8:32:f0:8a brd ff:ff:ff:ff:ff:ff
        altname end2
    3: eth1: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN group default qlen 1000
        link/ether c2:97:53:60:e3:5b brd ff:ff:ff:ff:ff:ff
        altname end3
    ...
    ```
4. Start the IgH EtherCAT master:

    ```shell
    # Start EtherCAT service
    sudo ethercatctl start

    # Check service status
    sudo ethercatctl status
    ```

    Sample output:
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
        Main: c2:97:53:60:e3:5b (attached)
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
    # No slave detected
    ```

5. Manually enable eth1 network card (required for IgH 1.5.x):

    ```shell
    sudo ip link set dev eth1 up
    ```

    Check again after enabling; EtherCAT works normally:

    ```shell
    sunrise@ubuntu:~$ sudo ip a
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
        inet 127.0.0.1/8 scope host lo
        valid_lft forever preferred_lft forever
        inet6 ::1/128 scope host noprefixroute
        valid_lft forever preferred_lft forever
    2: eth0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN group default qlen 1000
        link/ether c6:40:e8:32:f0:8a brd ff:ff:ff:ff:ff:ff
        altname end2
    3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
        link/ether c2:97:53:60:e3:5b brd ff:ff:ff:ff:ff:ff
        altname end3
        inet6 fe80::c097:53ff:fe60:e35b/64 scope link
        valid_lft forever preferred_lft forever
    ...

    sunrise@ubuntu:~$ sudo ethercat master
    Master0
    Phase: Idle
    Active: no
    Slaves: 1
    Ethernet devices:
        Main: c2:97:53:60:e3:5b (attached)
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
    You can now see `Link: UP`, `Slaves: 1`, and the EtherCAT slave is successfully recognized and working normally.
    :::

If you are using EtherCAT igh master version 1.6.4 or later, you can refer to [Automatic network card start/stop (supported in EtherCAT igh master version 1.6.4 and later)](#automatic-network-card-startstop-supported-in-ethercat-igh-master-version-164-and-later) for configuration.

## FAQ

### Automatic network card start/stop (supported in EtherCAT igh master version 1.6.4 and later)

:::info
**New version support**: Newer versions of the EtherCAT igh master (version 1.6.4 and later) configuration and startup script support automatically bringing the port up (the `ip link set dev eth0 up` command is added to the startup script). If your version does not support automatic enabling, you can manually execute the above command.
:::
1. Modify `/etc/ethercat.conf` to add the corresponding network port to the `UPDOWN_INTERFACES` variable. For example, add the eth0 interface so that when executing `ethercatctl start` or `ethercatctl stop`, the corresponding network interface will be automatically brought UP/DOWN.
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