---
sidebar_position: 2
---

:::warning
<font color="red">**注意：**</font>使用 EtherCAT 协议需要系统版本V4.0.4及以上。
:::

## 使用前网络配置
:::warning
<font color="red">**注意：**</font>EtherCAT协议与以太网协议互斥，**无法共存**，**开发板默认使用 eth0 作为 DHCP 管理接口**，如果用户想使用 eth0 作为 EtherCAT 网络接口，可以使用下面的几种方案进行网络配置，**[点击查看使用eth0作为ethercat主站](#使用-eth0-作为-ethercat-主站)**。

**特别注意：RDK S100/S600默认使用eth0作为DHCP网口，如果用户原本使用eth0作为SSH连接开发板的主要模式，在使用eth0作为EtherCAT主站后，需要配置eth1为DHCP，或配置用户本地网络可用的固定IP作为SSH连接方式，并且将连接的网线改接到eth1网口。 [点击查看使用 eth0 作为主站时的 eth1 网络配置方案](#使用-eth0-作为主站时的-eth1-网络配置方案)**。
:::

## EtherCAT使用指南

1. 确认硬件连接：
    - 从站已上电。
    - 网线已接到你选择的主站网口（`eth0` 或 `eth1`）。
2. 选择主站网口（在选择主站端口前，请仔细阅读 **[使用前网络配置](#使用前网络配置)中的注意事项**：
    - 使用 `eth0` 作为主站：看 **[使用 eth0 作为 EtherCAT 主站](#使用-eth0-作为-ethercat-主站)**。
    - 使用 `eth1` 作为主站：看 **[使用 eth1 作为 EtherCAT 主站](#使用-eth1-作为-ethercat-主站)**。
3. 启动 EtherCAT 主站（使用 ethercatctl）：
    ```shell
    sudo ethercatctl start
    ```
4. 如果是 IgH 1.5.x（S100/S600 固件默认版本），且配置了 NetworkManager 不管理主站网口，则在使用前需要先手动启用网口：
    ```shell
    sudo ip link set dev eth0 up
    # 若主站网口为 eth1，则替换为 eth1
    ```
5. 使用用户层命令检查主站：
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
6. 配置 IgH 服务自启动：
    ```shell
    sudo systemctl enable ethercat
    ```

## EtherCAT开发指南

### 软件栈
地瓜 RDK S100 默认提供 EtherCAT-IgH 1.5 版本软件栈（本节以 S100 为例，S600 同理）。[EtherCAT-IgH软件栈](https://docs.etherlab.org/ethercat/1.5/pdf/ethercat_doc.pdf)是目前主流的开源 EtherCAT 主站协议。

EtherCAT官网：[EtherLab | EtherCAT](https://etherlab.org/en_GB/ethercat)
EtherCAT开源代码仓库：[Gitlab | EtherLab - EtherCAT](https://gitlab.com/etherlab.org/ethercat)

### 编译和部署
#### Host端构建
Host端构建支持两种构建方式：
1. 单独编译debian包并部署
   ```shell
   # Construct debian package
   ./mk_debs.sh hobot-ethercat

   # Deploy
   ## Transfer generated out/product/deb_packages/hobot-ethercat_<***>_arm64.deb package to RDK S100, the "<***>" is the version string
   ## On RDK S100, presuming debian package is transferred to /userdata
   dpkg -i /userdata/hobot-ethercat_4.0.4-20250827135836_arm64.deb
   ```

   hobot-ethercat的构建包括内核模块+用户层应用两个大模块。内核模块构建依赖用户本地构建的内核输出物。在用户没有在本地构建过内核时会自动跳过内核模块的构建。

2. 整编 \
   默认rdk-gen构建系统在整编disk镜像后，镜像内会默认集成hobot-ethercat debian 包，内部包括内核模块及用户层应用。

#### 板端构建
1. 下载源码：
   ```shell
   git clone https://gitlab.com/etherlab.org/ethercat.git -b stable-1.5
   ```
2. 构建
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
3. 编辑`/usr/local/etc/ethercat.conf`，添加以下内容：
   ```
   MASTER0_DEVICE="eth0" // Device or MAC
   DEVICE_MODULES="generic"
   ```

---

## 使用 eth0 作为 EtherCAT 主站

### 修改 EtherCAT 配置文件使用 eth0 作为 EtherCAT 主站

首先修改 `/etc/ethercat.conf` 文件，使用 eth0 作为 EtherCAT 主站。

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

根据您的使用场景，选择合适的 eth0 网络接口配置方案：

### 方案概述

**[方案一：配置 NetworkManager 不管理 eth0 接口（推荐）](#方案一配置-networkmanager-不管理-eth0-接口推荐)**
- **适用场景**：需要 NetworkManager 管理其他网络接口，但不想让 eth0 被管理
- **前提条件**：保留 NetworkManager 服务运行
- **优势**：既能保留 NetworkManager 服务，又能避免对 EtherCAT 所使用接口产生干扰
- **注意**：配置 NetworkManager 不管理 eth0 接口之后，对应的网口在系统启动的时候不会自动 up，使用时请参阅下方注意信息与配置方法进行使用。
:::warning **注意**
<font color="red">目前板卡上预装的是 igh 1.5.x 的版本，默认没有办法实现网口自动 up/down, 需要手动启用 EtherCAT 所使用接口 **eth0** 网卡。</font> igh 在 1.6.4 及之后版本支持配置文件配置网口自动 up/down, 具体参考：[自动启停网卡](#自动启停网卡ethercat-igh-主站164版本之后支持)
:::

**[方案二：使用 netplan 将 eth0 配置为静态IP地址](#方案二使用-netplan-将-eth0-配置为静态ip地址)、[方案三：使用 netplan 将 eth0 配置为本地链路](#方案三使用-netplan-将-eth0-配置为本地链路)**：保留 NetworkManager 服务运行，通过 netplan 配置 eth0
- **适用场景**：需要 NetworkManager 管理其他网络接口
- **前提条件**：保留 NetworkManager 对 eth0 的控制权限
- **提示**：需要按照下述方案使用 netplan 对 EtherCAT 所使用的网络接口进行特殊配置

:::warning
<font color="red">**特别注意：**</font>不要关闭 NetworkManager 的自动启动，否则重启后系统无法自动 UP 所有网络接口！！！会有设备失联的风险！！！
:::

### 方案一：配置 NetworkManager 不管理 eth0 接口（推荐）

1. 创建 NetworkManager 配置文件，将 eth0 设置为非托管状态：

    :::info
    **重要**：配置文件中的节名（section name）必须以 `device-` 开头。
    :::
    示例（用户工具自己需求进行更改）：
    ```shell
    vim /etc/NetworkManager/conf.d/99-unmanaged-devices.conf
    ```
    修改为如下内容：
    ```
    [device-eth0-unmanaged]
    match-device=interface-name:eth0
    managed=0
    ```
2. 重启系统以清除 NetworkManager 的设备状态缓存：
    ```shell
    sudo reboot
    ```

    :::info
    重启会清除 `/run/NetworkManager/devices/` 目录中的状态。这样可以防止 NetworkManager 对设置为非托管的设备使用该目录中已存在的连接。
    :::
3. 验证配置（重启后）：
    查看网络接口状态，可以看到 eth0 已经是不管理的状态了：
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
    此时查看 IP 地址，可以看到 eth0 是 DOWN 状态：
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
4. 启动 IgH EtherCAT 主站：

    ```shell
    # 启动 EtherCAT 服务
    sudo ethercatctl start

    # 查看服务状态
    sudo ethercatctl status
    ```

    示例输出：
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
    # 此时没有检测到从站
    ```

5. 手动启用 eth0 网卡（IgH 1.5.x 需要）：

    ```shell
    sudo ip link set dev eth0 up
    ```

    启用后再次检查，此时 EtherCAT 工作正常：

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
    此时可以看到 `Link: UP`，`Slaves: 1`，EtherCAT 从站已成功识别并正常工作。
    :::

如果你使用的是 EtherCAT igh 主站1.6.4以上的版本，可以参考[自动启停网卡（EtherCAT igh 主站1.6.4版本之后支持）](#自动启停网卡ethercat-igh-主站164版本之后支持)进行配置。

### 方案二：使用 netplan 将 eth0 配置为静态IP地址
<details>
    <summary>点击这里展开更多内容</summary>
1. 修改配置文件 `/etc/netplan/01-hobot-net.yaml` 如下（以下配置作为示例，用户自行按需配置）：
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
2. 应用配置文件
    ```shell
    netplan generate
    netplan apply
    ```
3. 查看 ip 地址信息
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

### 方案三：使用 netplan 将 eth0 配置为本地链路
<details>
    <summary>点击这里展开更多内容</summary>
1. 修改配置文件 `/etc/netplan/01-hobot-net.yaml` 如下:（以下配置作为示例，用户自行按需配置）：
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
2. 应用配置文件
    ```shell
    netplan generate
    netplan apply
    ```
3. 查看 ip 地址信息
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


### 使用 eth0 作为主站时的 eth1 网络配置方案

以下部分网络配置只提供 eth1 的配置，eth0 的配置可参考上方 **[使用-eth0-作为-ethercat-主站](#使用-eth0-作为-ethercat-主站)**

#### 配置 eth1 为 DHCP
<details>
    <summary>点击这里展开更多内容</summary>

    ```yaml
    network:
      version: 2
      renderer: NetworkManager
      ethernets:
        eth0:
          # 参考上面进行配置
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

#### 配置 eth1 为静态 IP
<details>
    <summary>点击这里展开更多内容</summary>

    ```yaml
    network:
      version: 2
      renderer: NetworkManager
      ethernets:
        eth0:
          # 参考上面进行配置
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

## 使用 eth1 作为 EtherCAT 主站

使用 eth1 作为 EtherCAT 主站的网络配置与上述[使用 eth0 作为 EtherCAT 主站](#使用-eth0-作为-ethercat-主站)类似，下方只展示推荐使用方案。

### 修改 EtherCAT 配置文件使用 eth1 作为 EtherCAT 主站

首先修改 `/etc/ethercat.conf` 使用 eth1 作为 EtherCAT 主站

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

:::warning
注意：RDK S100/S600 默认使用 eth0 作为 DHCP 网口，eth1 为静态 IP 配置，用户可以直接按照下方步骤配置 NetworkManager 不管理 eth1 接口（推荐）
:::

### 配置 NetworkManager 不管理 eth1 接口（推荐）

1. 创建 NetworkManager 配置文件，将 eth1 设置为非托管状态：

    :::info
    **重要**：配置文件中的节名（section name）必须以 `device-` 开头。
    :::
    示例（用户工具自己需求进行更改）：
    ```shell
    vim /etc/NetworkManager/conf.d/99-unmanaged-devices.conf
    ```
    修改为如下内容：
    ```
    [device-eth1-unmanaged]
    match-device=interface-name:eth1
    managed=0
    ```
2. 重启系统以清除 NetworkManager 的设备状态缓存：
    ```shell
    sudo reboot
    ```

    :::info
    重启会清除 `/run/NetworkManager/devices/` 目录中的状态。这样可以防止 NetworkManager 对设置为非托管的设备使用该目录中已存在的连接。
    :::
3. 验证配置（重启后）：
    查看网络接口状态，可以看到 eth1 已经是不管理的状态了：
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
    此时查看 IP 地址，可以看到 eth0 是 DOWN 状态：
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
4. 启动 IgH EtherCAT 主站：

    ```shell
    # 启动 EtherCAT 服务
    sudo ethercatctl start

    # 查看服务状态
    sudo ethercatctl status
    ```

    示例输出：
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
    # 此时没有检测到从站
    ```

5. 手动启用 eth1 网卡（IgH 1.5.x 需要）：

    ```shell
    sudo ip link set dev eth1 up
    ```

    启用后再次检查，此时 EtherCAT 工作正常：

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
    此时可以看到 `Link: UP`，`Slaves: 1`，EtherCAT 从站已成功识别并正常工作。
    :::

如果你使用的是 EtherCAT igh 主站1.6.4以上的版本，可以参考[自动启停网卡（EtherCAT igh 主站1.6.4版本之后支持）](#自动启停网卡ethercat-igh-主站164版本之后支持)进行配置。

## FAQ

### 自动启停网卡（EtherCAT igh 主站1.6.4版本之后支持）

:::info
**新版本支持**：新版本的 EtherCAT igh 主站（1.6.4版本之后）配置与启动脚本支持自动 up 端口（在启动脚本中添加了 `ip link set dev eth0 up` 命令）。如果您的版本不支持自动启用，可以手动执行上述命令。
:::
1. 修改 `/etc/ethercat.conf` 将对应的网口添加到 `UPDOWN_INTERFACES` 变量中。例如添加 eth0 接口，这样在执行 `ethercatctl start` 或 `ethercatctl stop` 的时候，会自动 UP/DOWN 对应的网络接口。
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
