---
sidebar_position: 2
title: "EtherCAT"
description: "EtherCAT"
---

# EtherCAT

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

:::warning
⚠️ **注意**：使用 EtherCAT 协议需要系统版本 V4.0.4及以上。
:::

## 概述

EtherCAT 是一种基于标准以太网的实时工业以太网协议，RDK 平台支持 Native（hobot）与 Generic 两种 EtherCAT 驱动模式，并支持使用 eth0 或 eth1 作为 EtherCAT 主站。

<DocScope products="RDK S100">
RDK S100 V4.0.7 及以上版本默认使用 Native（hobot）EtherCAT 驱动，而非 Generic 驱动。
</DocScope>

<DocScope products="RDK S600">
RDK S600 V5.1.0 及以上版本默认使用 Native（hobot）EtherCAT 驱动，而非 Generic 驱动。
</DocScope>

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要部署 EtherCAT 主站、切换驱动模式或联调从站的 BSP/驱动工程师。

**前置条件**：已烧录支持 EtherCAT 的系统版本并可登录板端；了解 EtherCAT 主站（igh）与网络配置基础。

**与其他模块关系**：本驱动依赖以太网控制器，见「[Ethernet](./01_ethernet.md)」；MCU 侧主站见「EtherCAT 用户手册（MCU 侧）」；使用 EtherCAT 协议需要系统版本 V4.0.4 及以上。

## Native 驱动与 Generic 驱动

### 版本说明

<DocScope products="RDK S100">
**RDK S100 V4.0.7 及以上版本默认使用 Native（hobot）EtherCAT 驱动**，而非 Generic 驱动。

:::warning
⚠️ **注意**：本文档后续章节描述的 EtherCAT 使用方式（「[使用前网络配置](#使用前网络配置)」、「[EtherCAT使用指南](#ethercat-使用指南)」等）**基于 Generic 驱动模式**。如果您使用的是 **V4.0.7 默认镜像**，系统已预配置为 Native 驱动模式，请优先参考本章节的 Native 驱动使用说明。
:::
</DocScope>

<DocScope products="RDK S600">
**RDK S600 V5.1.0 及以上版本默认使用 Native（hobot）EtherCAT 驱动**，而非 Generic 驱动。

:::warning
⚠️ **注意**：本文档后续章节描述的 EtherCAT 使用方式（「[使用前网络配置](#使用前网络配置)」、「[EtherCAT使用指南](#ethercat-使用指南)」等）**基于 Generic 驱动模式**。如果您使用的是 **V5.1.0 默认镜像**，系统已预配置为 Native 驱动模式，请优先参考本章节的 Native 驱动使用说明。
:::
</DocScope>


### Native 驱动与 Generic 驱动的区别

| 特性 | Native 驱动（`ec_hobot`） | Generic 驱动（`ec_generic`） |
|------|--------------------------|---------------------------|
| 驱动模块 | `ec_hobot` | `ec_generic` |
| 网络性能 | 更优（直接操作硬件，绕过 Linux 网络栈） | 标准 Linux 网络栈 |
| 与 gmac 驱动兼容性 | **互斥**，需卸载 `hobot_eth_super` | **兼容**，可共存 |
| 网口配置方式 | **必须使用 MAC 地址** | 支持网口名或 MAC 地址 |
| 网口在系统中的可见性 | 被 Native 驱动接管后，对应 MAC 的网口**从 `ip a` 中消失** | 网口始终可见 |

## Native 驱动使用步骤

### 网口 MAC 地址参考

以下为 S100/S600 的四个示例以太网口 MAC 地址：

| 网口 | MAC 地址 |
|------|----------|
| eth0 | `xx:xx:xx:xx:01:18` |
| eth1 | `xx:xx:xx:xx:01:19` |
| eth2 | `xx:xx:xx:xx:01:1a` |
| eth3 | `xx:xx:xx:xx:01:1b` |

:::tip
实际的 MAC 地址可能因硬件版本不同而略有差异。请以设备上 `ip link show` 命令输出为准。
:::

### Native 驱动配置步骤

**步骤 1：确认配置文件**

默认镜像中 `/etc/ethercat.conf` 已预配置为 Native 模式。如需切换 EtherCAT 使用的网口，修改 `MASTER0_DEVICE` 为对应网口的 MAC 地址：

:::warning
⚠️ **Native 驱动只支持使用 Mac 地址进行配置**。默认的 MASTER0_DEVICE 值为 ff:ff:ff:ff:ff:ff，在启用的时候默认使用 eth0 网口，请根据需求修改。
:::

```
MASTER0_DEVICE="xx:xx:xx:xx:01:18"  # eth0 的 MAC 地址
DEVICE_MODULES="hobot"
```

如需使用 eth1 作为 EtherCAT 网口：
```
MASTER0_DEVICE="xx:xx:xx:xx:01:19"  # eth1 的 MAC 地址
DEVICE_MODULES="hobot"
```

:::warning
⚠️ **SSH 连接注意事项**：如果通过 SSH 远程连接开发板，使用 systemctl 或 ethercatctl 管理 ethercat 服务的时候。由于 gmac 驱动的卸载/重装，**网络会短暂中断几秒**（ping 会显示 `Destination Host Unreachable`），SSH 客户端通常会自动重连。这是正常现象，无需手动干预。
:::

**步骤 2：启动 EtherCAT**

```shell
sudo systemctl start ethercat
sudo systemctl status ethercat
# 5.4.13.2 EtherCAT
sudo ethercatctl start
sudo ethercatctl status
```

正常输出示例：
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

**步骤 3：验证**

启动后，检查 `ip a` 可以发现被 EtherCAT 绑定的网口 MAC 地址已从内核协议栈中消失（不再出现在列表中）：

```shell
$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> ...
6: wlan0: <NO-CARRIER,BROADCAST,MULTICAST,UP> ...
7: eth0: <NO-CARRIER,BROADCAST,MULTICAST,UP> ...    # MAC 为未绑定的网口
8: eth1: <NO-CARRIER,BROADCAST,MULTICAST,UP> ...    # MAC 为未绑定的网口
9: eth2: <NO-CARRIER,BROADCAST,MULTICAST,UP> ...    # MAC 为未绑定的网口
# 注意：MAC 为 xx:xx:xx:xx:01:18 的 eth0 已不在列表中（被 Native 驱动接管）
```

检查 EtherCAT 主站状态：

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

**步骤 4：停止 EtherCAT（切换回普通网络模式）**

停止 EtherCAT 服务后，会自动加载 `hobot_eth_super`，所有网口恢复为普通网络模式：

```shell
sudo systemctl stop ethercat
```

### 切换 Native 驱动使用的网口

如需切换 EtherCAT 使用的网口，只需修改 `/etc/ethercat.conf` 中的 `MASTER0_DEVICE` 为对应网口的 MAC 地址，然后重启 EtherCAT 服务：

1. 修改配置（例如从 eth0 切换到 eth1）：
   ```
   MASTER0_DEVICE="xx:xx:xx:xx:01:19"  # 改为 eth1 的 MAC
   DEVICE_MODULES="hobot"
   ```

2. 重启服务：
   ```shell
   sudo systemctl restart ethercat
   ```

3. 验证新网口已生效：
   ```shell
   sudo ethercat master
   # 应显示新的 MAC 地址: Main: xx:xx:xx:xx:01:19 (attached)
   ```

### Native 驱动的风险与影响

:::warning
⚠️ **重要**：由于 Native 驱动与 gmac 驱动互斥，涉及到网卡驱动的卸载与加载。在进行 Native 驱动与 generic 驱动切换的时候，**必须先修改配置文件，然后重启系统完成驱动切换**，否则可能会引起网络中断。
:::

#### 1. 与 gmac 驱动冲突

Native 驱动 `ec_hobot` 与系统的 `hobot_eth_super`（xgmac）驱动**互斥**，两者不能同时加载。启动 EtherCAT 前必须先卸载 `hobot_eth_super`，否则 EtherCAT 服务无法正常启动。

**影响**：卸载 `hobot_eth_super` 后，EtherCAT 主站绑定的网口被 Native 驱动接管，**其余以太网口仍可正常使用**（可配置 IP、用于 SSH 连接等）。但在 `rmmod`/`modprobe hobot_eth_super` 的瞬间，所有以太网口会短暂中断数秒后自动恢复，SSH 连接通常会自动重连。

#### 2. 网口被 Native 驱动独占

当 Native 驱动启动后，配置文件中 `MASTER0_DEVICE` 绑定的 MAC 地址对应的网口将从 Linux 内核协议栈中**消失**（`ip a` 中不再显示该网口），完全被 EtherCAT 独占。其余未绑定的网口仍然可见且可正常使用。

#### 3. MAC 地址配置要求

Native 驱动模式下，`/etc/ethercat.conf` 中的 `MASTER0_DEVICE` **必须配置为对应网口的实际 MAC 地址**（如 `"xx:xx:xx:xx:01:18"`），不能使用网口名（如 `"eth0"`），否则驱动无法正确绑定。

### deb 包升级注意事项

升级 EtherCAT 相关 deb 包时，**必须保证版本一致**，同步升级以下两个包：

```shell
# 两个包必须同步升级，版本号必须匹配
dpkg -i hobot-ethercat_5.1.0-20260525160326_arm64.deb
dpkg -i linux-image-rdk-s600_6.1.158-rt58-DR-5.1.0-2605251554-g369e4b-gf8e87c-29_arm64.deb
```

如果只升级 `hobot-ethercat` 而不升级 `linux-image`，可能因内核模块版本不匹配导致驱动无法加载。

### 切换到 Generic 驱动模式

如果您需要使用 Generic 驱动模式（支持多网口 eth0/eth1、可与 gmac 驱动共存、可正常停止服务），请修改 `/etc/ethercat.conf`：

```shell
# 修改为 Generic 驱动配置
sudo sed -i 's/DEVICE_MODULES="hobot"/DEVICE_MODULES="generic"/' /etc/ethercat.conf
sudo sed -i 's/MASTER0_DEVICE=".*"/MASTER0_DEVICE="eth0"/' /etc/ethercat.conf
```

修改后重启设备生效。Generic 模式下的详细使用方式请参考后续章节（「使用前网络配置」起）。

---

## 使用前网络配置

<DocScope products="RDK S100">
:::warning
⚠️ **注意**：以下内容适用于 **Generic 驱动模式**。如果您使用的是 V4.0.7 默认的 Native 驱动模式，请参考上方「[Native 驱动使用步骤](#native-驱动使用步骤)」。

EtherCAT协议与以太网协议互斥，**无法共存**，**开发板默认使用 eth0 作为 DHCP 管理接口**，如果用户想使用 eth0 作为 EtherCAT 网络接口，可以使用下面的几种方案进行网络配置，**[点击查看使用eth0作为ethercat主站](#使用-eth0-作为-ethercat-主站)**。

**特别注意：RDK S100默认使用 eth0作为 DHCP 网口，如果用户原本使用 eth0作为 SSH 连接开发板的主要模式，在使用 eth0作为 EtherCAT 主站后，需要配置 eth1为 DHCP，或配置用户本地网络可用的固定 IP 作为 SSH 连接方式，并且将连接的网线改接到 eth1网口。 [点击查看使用 eth0 作为主站时的 eth1 网络配置方案](#使用-eth0-作为主站时的-eth1-网络配置方案)**。
:::
</DocScope>

<DocScope products="RDK S600">
:::warning
⚠️ **注意**：以下内容适用于 **Generic 驱动模式**。如果您使用的是 V5.1.0 默认的 Native 驱动模式，请参考上方「[Native 驱动使用步骤](#native-驱动使用步骤)」。

EtherCAT协议与以太网协议互斥，**无法共存**，**开发板默认使用 eth0 作为 DHCP 管理接口**，如果用户想使用 eth0 作为 EtherCAT 网络接口，可以使用下面的几种方案进行网络配置，**[点击查看使用eth0作为ethercat主站](#使用-eth0-作为-ethercat-主站)**。

**特别注意：RDK S600默认使用 eth0作为 DHCP 网口，如果用户原本使用 eth0作为 SSH 连接开发板的主要模式，在使用 eth0作为 EtherCAT 主站后，需要配置 eth1为 DHCP，或配置用户本地网络可用的固定 IP 作为 SSH 连接方式，并且将连接的网线改接到 eth1网口。 [点击查看使用 eth0 作为主站时的 eth1 网络配置方案](#使用-eth0-作为主站时的-eth1-网络配置方案)**。
:::
</DocScope>

## EtherCAT 使用指南

:::info
本节内容适用于 **Generic 驱动模式**。如果您使用的是 Native 驱动模式，请参考上方「[Native 驱动使用步骤](#native-驱动使用步骤)」。
:::

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
<DocScope products="RDK S100">
4. 如果是 IgH 1.5.x（S100 固件默认版本），且配置了 NetworkManager 不管理主站网口，则在使用前需要先手动启用网口：
</DocScope>
<DocScope products="RDK S600">
4. 如果是 IgH 1.5.x（S600 固件默认版本），且配置了 NetworkManager 不管理主站网口，则在使用前需要先手动启用网口：
</DocScope>

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
6. 配置 IgH 服务自启动：
    ```shell
    sudo systemctl enable ethercat
    ```

## EtherCAT 开发指南

### 软件栈
RDK S100 默认提供 EtherCAT-IgH 1.5 版本软件栈（本节以 S100 为例，S600 同理）。[EtherCAT-IgH软件栈](https://docs.etherlab.org/ethercat/1.5/pdf/ethercat_doc.pdf)是目前主流的开源 EtherCAT 主站协议。

EtherCAT 官网：[EtherLab | EtherCAT](https://etherlab.org/en_GB/ethercat)
EtherCAT 开源代码仓库：[Gitlab | EtherLab - EtherCAT](https://gitlab.com/etherlab.org/ethercat)

### 编译和部署
<DocScope products="RDK S100">
:::info
V4.0.7 默认使用 Native 驱动（`ec_hobot`），该驱动已预编译在系统镜像中。以下 Host 端和板端构建说明适用于自行编译 EtherCAT 软件栈的场景。
:::
</DocScope>

<DocScope products="RDK S600">
:::info
V5.1.0 默认使用 Native 驱动（`ec_hobot`），该驱动已预编译在系统镜像中。以下 Host 端和板端构建说明适用于自行编译 EtherCAT 软件栈的场景。
:::
</DocScope>

#### Host 端构建
Host 端构建支持两种构建方式：
1. 单独编译 debian 包并部署
   ```shell
   # Construct debian package
   ./mk_debs.sh hobot-ethercat

   # Deploy
   ## Transfer generated out/product/deb_packages/hobot-ethercat_<***>_arm64.deb package to RDK S100/S600, the "<***>" is the version string
   ## On RDK S100/S600, presuming debian package is transferred to /userdata
   dpkg -i /userdata/hobot-ethercat_4.0.4-20250827135836_arm64.deb
   ```

   hobot-ethercat 的构建包括内核模块+用户层应用两个大模块。内核模块构建依赖用户本地构建的内核输出物。在用户没有在本地构建过内核时会自动跳过内核模块的构建。

   :::info
   `hobot-ethercat` debian 包中同时包含 Native 驱动（`ec_hobot`）和 Generic 驱动（`ec_generic`），通过 `/etc/ethercat.conf` 中的 `DEVICE_MODULES` 配置切换。
   :::

2. 整编 \
   默认 rdk-gen 构建系统在整编 disk 镜像后，镜像内会默认集成 hobot-ethercat debian 包，内部包括内核模块及用户层应用。

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
目前板卡上预装的是 igh 1.5.x 的版本，默认没有办法实现网口自动 up/down, 需要手动启用 EtherCAT 所使用接口 **eth0** 网卡。 igh 在 1.6.4 及之后版本支持配置文件配置网口自动 up/down, 具体参考：[自动启停网卡](#自动启停网卡ethercat-igh-主站164版本之后支持)
:::

**[方案二：使用 netplan 将 eth0 配置为静态IP地址](#方案二使用-netplan-将-eth0-配置为静态-ip-地址)**

**[方案三：使用 netplan 将 eth0 配置为本地链路](#方案三使用-netplan-将-eth0-配置为本地链路)**：保留 NetworkManager 服务运行，通过 netplan 配置 eth0
- **适用场景**：需要 NetworkManager 管理其他网络接口
- **前提条件**：保留 NetworkManager 对 eth0 的控制权限
- **提示**：需要按照下述方案使用 netplan 对 EtherCAT 所使用的网络接口进行特殊配置

:::warning
⚠️ **特别注意**：不要关闭 NetworkManager 的自动启动，否则重启后系统无法自动 UP 所有网络接口！！！会有设备失联的风险！！！
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
    此时可以看到 `Link: UP`，`Slaves: 1`，EtherCAT 从站已成功识别并正常工作。
    :::

如果你使用的是 EtherCAT igh 主站1.6.4以上的版本，可以参考[自动启停网卡（EtherCAT igh 主站1.6.4版本之后支持）](#自动启停网卡ethercat-igh-主站164版本之后支持)进行配置。

### 方案二：使用 netplan 将 eth0 配置为静态 IP 地址
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
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff permaddr xx:xx:xx:xx:xx:xx
        inet 192.168.127.10/24 brd 192.168.127.255 scope link noprefixroute eth0
            valid_lft forever preferred_lft forever
        inet6 fe80::xxxx:xxff:fexx:xxxx/64 scope link
            valid_lft forever preferred_lft forever
    3: eth1: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff
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
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff permaddr xx:xx:xx:xx:xx:xx
        inet 169.254.245.98/16 brd 169.254.255.255 scope link noprefixroute eth0
            valid_lft forever preferred_lft forever
        inet6 fe80::xxxx:xxff:fexx:xxxx/64 scope link
            valid_lft forever preferred_lft forever
    3: eth1: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN group default qlen 1000
        link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff
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
          macaddress: "xx:xx:xx:xx:xx:xx"
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
          macaddress: "xx:xx:xx:xx:xx:xx"
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

<DocScope products="RDK S100">
:::warning
注意：RDK S100 默认使用 eth0 作为 DHCP 网口，eth1 为静态 IP 配置，用户可以直接按照下方步骤配置 NetworkManager 不管理 eth1 接口（推荐）
:::
</DocScope>
<DocScope products="RDK S600">
:::warning
注意：RDK S600 默认使用 eth0 作为 DHCP 网口，eth1 为静态 IP 配置，用户可以直接按照下方步骤配置 NetworkManager 不管理 eth1 接口（推荐）
:::
</DocScope>

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
    此时查看 IP 地址，可以看到 eth1 是 DOWN 状态：
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
    此时可以看到 `Link: UP`，`Slaves: 1`，EtherCAT 从站已成功识别并正常工作。
    :::

如果你使用的是 EtherCAT igh 主站1.6.4以上的版本，可以参考[自动启停网卡（EtherCAT igh 主站1.6.4版本之后支持）](#自动启停网卡ethercat-igh-主站164版本之后支持)进行配置。

## 常见问题

### Generic 驱动模式下 EtherCAT 帧全部超时（frame time out）

**原因**：master 启动前对应网口未激活（未 `ip link set up`），或未将网口加入 `UPDOWN_INTERFACES`。

**解决**：把网口写入 `/etc/ethercat.conf` 的 `UPDOWN_INTERFACES`，或手动 `ip link set dev eth0 up` 后再启动 master。

### Native 与 Generic 切换后主站不工作

**原因**：切换驱动模式后未按对应模式的章节重新配置网口，或 `deb` 包版本不匹配。

**解决**：参考「切换 Native 驱动使用的网口」「使用前网络配置」重新配置；通过 `deb` 升级时确保两个 EtherCAT 包版本号匹配。

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

## 相关文档

- [Ethernet](./01_ethernet.md)
- [EtherCAT 用户手册（MCU 侧）](../../11_mcu_development/17_mcu_ethercat.md)
