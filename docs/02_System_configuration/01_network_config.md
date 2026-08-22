---
sidebar_position: 1
title: "网络配置"
description: "RDK S100/S600 有线/无线网络配置、DNS、Proxy，默认账号与 IP 权威定义"
---

# 网络配置

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本章节主要介绍开发板有线、无线网络配置的修改方法。

## 默认账号与网络

开发板出厂默认账号与网络如下（本页为默认账号、IP 的单一来源，其余章节只引用不重复定义）：

- 默认账号：
  - 普通用户：`sunrise`，密码 `sunrise`
  - 超级用户：`root`，密码 `root`
- 默认网络：
  - `eth1`：静态 IP `192.168.127.10/24`，不设默认网关（`never-default`），
    用于与 PC 直连或设备管理
  - `eth0`：DHCP 自动获取 IP
  - `wlan0`：DHCP（需外接 Wi-Fi 模块）

<DocScope products="RDK S600">

- 另有 `eth2`、`eth3` 两个网口，默认 DHCP 自动获取 IP。

</DocScope>

## 有线网络{#config_ethnet}

### 有线网络配置-Network Manager 方式

:::note 注意

 默认使用 `NetworkManager + Netplan` 管理网络，其它平台请以对应系统文档为准。

<DocScope products="RDK S100">
  - `RDK S100`根文件系统基于 Ubuntu-22.04 构建，默认不支持采用 ifup/ifdown 这种方式来对网络接口进行启用或停用操作。
</DocScope>

<DocScope products="RDK S600">
  - `RDK S600`根文件系统基于 Ubuntu-24.04 构建，默认不支持采用 ifup/ifdown 这种方式来对网络接口进行启用或停用操作。
</DocScope>

:::

使用命令行配置静态 IP 示例：

```shell
# 配置 eth1 静态 IP 为 192.168.10.100/24，网关为 192.168.10.1，DNS 为 223.5.5.5 和 8.8.8.8
nmcli connection modify "eth1_cfg" \
  ipv4.method manual \
  ipv4.addresses "192.168.10.100/24" \
  ipv4.gateway "192.168.10.1" \
  ipv4.dns "223.5.5.5 8.8.8.8" \
  ipv4.never-default yes \
  connection.autoconnect yes

# 重启连接使配置生效
nmcli connection down "eth1_cfg"
nmcli connection up "eth1_cfg"

```

使用命令行配置 DHCP 示例：

```shell
# 切换 eth1 为 DHCP
nmcli connection modify "eth1_cfg" \
  ipv4.method auto \
  ipv4.addresses "" \
  ipv4.gateway "" \
  ipv4.dns "" \
  connection.autoconnect yes

# 重启连接使配置生效
nmcli connection down "eth1_cfg"
nmcli connection up "eth1_cfg"
```

使用命令行查看当前 IP/网关/DNS 配置：

```shell
# 查看设备当前 IP/网关/DNS
nmcli device show eth1

```

更多配置字段说明可参考：
[Ubuntu Manpage: NetworkManager](https://networkmanager.dev/docs/api/latest/nmcli.html)

:::tip 提示
`RDK S100` 桌面版本默认采用 `NetworkManager + Netplan` 网络框架。通过 GUI 或 `nmcli` 保存配置后，配置会写入 `/etc/NetworkManager/system-connections/`。

也可以直接编辑该目录中的 `.nmconnection` 文件；编辑完成后，执行 `sudo nmcli connection reload` 和 `sudo nmcli connection up [connection_name]` 使配置生效。
:::

### 通过图形界面配置静态 IP 与 DNS{#gui_static_ip}

桌面环境下也可通过系统 `settings` 应用的 `Network` 面板完成静态 IP 与 DNS 配置，与上述命令行方式等效。

<DocScope products="RDK S100">

#### S100 操作步骤

1. 进入桌面后点击左下角打开应用列表，选择`settings`应用，在跳出来的界面中选择`Network`。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-show-app.jpg" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

2. `Ethernet (eth0)` 和`Ethernet (eth1)`分别对应不同的物理网口配置，配置与实物对应如下:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-phy-eth.png" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-sel-eth.png" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. 以修改`Ethernet (eth1)` 为例,点击修改按钮右侧选项中的齿轮，在跳出来的界面中选择`IPV4`, 选择`Manual`手动配置，在下方`Addresser`栏中写入`IP`地址，掩码和网关。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image_set_static_ip.png" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

4. 下拉，在下方 DNS 栏中输入 DNS 配置。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image_set_static_dns.png" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

5. 一个网卡配置多个 ip 地址，以`Ethernet (eth1)`为例，点击右侧的加号，配置 ip 地址和步骤3、4一致，完成配置后注意选中`eth1_cfg`出现`√`选项

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-sel_nmcli_netplan.jpg" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

若是/etc/netplan/目录下的配置文件中没有网络配置项，则配置界面如下。
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-sel_nmcli_only.jpg" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

<DocScope products="RDK S600">

#### S600 操作步骤

1. 进入桌面后点击左下角打开应用列表，选择`settings`应用，在跳出来的界面中选择`Network`。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-show-app.jpg" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

2. `Ethernet (eth0)` 、`Ethernet (eth1)`、`Ethernet (eth2)`和`Ethernet (eth3)`分别对应不同的物理网口配置，配置与实物对应如下:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-phy-eth.png" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-sel-eth.png" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. 以修改`Ethernet (eth1)` 为例,点击修改按钮右侧选项中的齿轮，在跳出来的界面中选择`IPV4`, 选择`Manual`手动配置，在下方`Addresser`栏中写入`IP`地址，掩码和网关。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image_set_static_ip.png" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

4. 在下方 DNS 栏中输入 DNS 配置。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image_set_static_dns.png" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

5. 一个网卡配置多个 ip 地址，以`Ethernet (eth1)`为例，点击右侧的加号，配置 ip 地址和步骤3、4一致，完成配置后注意选中`eth1_cfg`出现`√`选项

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-sel_ok.jpg" alt="修改静态 IP、DNS 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>


## 无线网络

开发板需安装无线 Wi-Fi 模块，支持 Soft AP 和 Station 两种模式，默认运行在 Station 模式下。下面介绍两种模式的使用方法。

### Station 模式

Station 模式下，开发板作为客户端，接入路由器无线热点进行联网。

- 对于使用 Ubuntu Desktop 版本系统的用户，可点击桌面右上角 Wi-Fi 图标，选择对应热点并输入密码以完成网络配置，如下图：
  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/network/image-wifi-config.jpeg" alt="Station 模式示意图" style={{ width: '50%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- 对于使用 Ubuntu Server 版本系统的用户，可通过命令行完成无线网络配置，步骤如下：

1. 使用`sudo nmcli device wifi rescan`命令扫描热点。如返回如下信息，说明扫描过于频繁，需要稍后再试
   ```shell
   root@ubuntu:~# sudo nmcli device wifi rescan
   Error: Scanning not allowed immediately following previous scan.
   ```
2. 使用`sudo nmcli device wifi list`命令列出扫描到的热点
3. 使用 `sudo wifi_connect "SSID" "PASSWD"`命令连接热点，返回如下信息，说明网络连接成功

   ```shell
   root@ubuntu:~# sudo wifi_connect "WiFi-Test" "12345678"
   Device 'wlan0' successfully activated with 'd7468833-4195-45aa-aa33-3d43da86e1a7'.
   ```

   :::tip
   如果连接热点后，返回如下信息，说明热点没有找到，可以执行`sudo nmcli device wifi rescan`命令重新扫描后再次连接

   ```shell
   root@ubuntu:~# sudo wifi_connect "WiFi-Test" "12345678"
   Error: No network with SSID 'WiFi-Test' found.
   ```

   :::

### Soft AP 模式

:::tip
Wi-Fi AP 模式暂不可用
持续更新中....
:::

<!-- 开发板无线网络默认运行在 Station 模式下，如需使用 Soft AP 模式，请按照以下步骤进行配置。

1. 安装`hostapd` 和 `isc-dhcp-server`

    ```shell
    sudo apt update
    sudo apt install hostapd
    sudo apt install isc-dhcp-server
    ```

2. 运行 `sudo vim /etc/hostapd.conf`命令来配置`hostapd.conf`，主要关注下面几个字段:

    ```shell
    interface=wlan0 #作为AP热点的网卡
    ssid=Sunrise #WiFi名字
    wpa=2 #0为WPA 2为WPA2 一般为2
    wpa_key_mgmt=WPA-PSK #加密算法 一般为WPA-PSK
    wpa_passphrase=12345678 #密码
    wpa_pairwise=CCMP #加密协议，一般为CCMP
    ```

      - 无密码的热点配置，请在`hostapd.conf`文件添加以下内容：

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

      - 有密码的热点配置，请在`hostapd.conf`文件添加以下内容：

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

3. 配置`isc-dhcp-server`文件，步骤如下：

    - 执行 `sudo vim /etc/default/isc-dhcp-server`修改`isc-dhcp-server`文件，添加如下定义的网络接口：
    ```shell
    INTERFACESv4="wlan0"
    ```
    -  执行 `sudo vim /etc/dhcp/dhcpd.conf`修改`dhcpd.conf`文件， 取消以下字段的注释：
    ```shell
      authoritative;
    ```
    - 然后在 `/etc/dhcp/dhcpd.conf`文件末尾增加以下配置：
    ```shell
      subnet 10.5.5.0 netmask 255.255.255.0 { #网段和子网掩码
      range 10.5.5.100 10.5.5.254;#可获取的IP范围
      option subnet-mask 255.255.255.0; #子网掩码
      option routers 10.5.5.1;#默认网关
      option broadcast-address 10.5.5.31;#广播地址
      default-lease-time 600;#默认租约期限，单位秒
      max-lease-time 7200;#最长租约期限，单位秒
    }
    ```

4. 停止 `wpa_supplicant` 服务，并重启 `wlan0`

    ```bash
    systemctl mask wpa_supplicant
    systemctl stop wpa_supplicant

    ip addr flush dev wlan0
    sleep 0.5
    ifconfig wlan0 down
    sleep 1
    ifconfig wlan0 up
    ```

5. 按如下步骤启动 `hostapd`服务
   - 执行`sudo hostapd -B /etc/hostapd.conf`命令
   ```bash
    root@ubuntu:~# sudo hostapd -B /etc/hostapd.conf

    Configuration file: /etc/hostapd.conf
    Using interface wlan0 with hwaddr xx:xx:xx:xx:xx:xx and ssid "sunrise"
    wlan0: interface state UNINITIALIZED->ENABLED
    wlan0: AP-ENABLED
   ```
   - 通过`ifconfig`命令，配置无线接口`wlan0`的 IP 和网段，注意要跟第三步的配置保持一致
    ```bash
    sudo ifconfig wlan0 10.5.5.1 netmask 255.255.255.0
    ```
   - 最后开启`dhcp`服务器，连上热点会从`10.5.5.100`到`10.5.5.255`之间分配一个 ip 地址给客户端
    ```bash
    sudo ifconfig wlan0 10.5.5.1 netmask 255.255.255.0
    sudo systemctl start isc-dhcp-server
    sudo systemctl enable isc-dhcp-server
    ```

6. 连接开发板热点，例如 `sunrise`
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/network/image-20220601203025803.png" alt="连接开发板Soft AP热点" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

7. 如需切换回`Station`模式，可按如下方式进行：

    [RDK X5]

    ```bash
    # 停止 hostapd
    killall -9 hostapd

    # 清除 wlan0 的地址
    ip addr flush dev wlan0
    sleep 0.5
    ifconfig wlan0 down
    sleep 1
    ifconfig wlan0 up

    # 重启 wpa_supplicant
    systemctl unmask wpa_supplicant
    systemctl restart wpa_supplicant

    #重装wifi驱动
    rmmod aic8800_fdrv
    modprobe aic8800_fdrv

    # 连接热点,，具体操作可以查看上一章节 “无线网络”
    wifi_connect "WiFi-Test" "12345678"
    ```

    [Other]

    ```bash
    # 停止 hostapd
    killall -9 hostapd

    # 清除 wlan0 的地址
    ip addr flush dev wlan0
    sleep 0.5
    ifconfig wlan0 down
    sleep 1
    ifconfig wlan0 up

    # 重启 wpa_supplicant
    systemctl unmask wpa_supplicant
    systemctl restart wpa_supplicant

    # 连接热点,，具体操作可以查看上一章节 “无线网络”
    wifi_connect "WiFi-Test" "12345678"
    ``` -->

## DNS 服务

DNS（Domain Name Server）进行域名与 IP 地址之间的转换。

RDK OS 的 DNS 由 NetworkManager 统一管理，`/etc/resolv.conf` 由
NetworkManager 自动生成（文件头为 `# Generated by NetworkManager`），
请勿手工编辑。板端未安装 `systemd-resolved`。

- 为某个连接指定静态 DNS，例如为 `eth1_cfg` 配置 DNS 服务器：

  ```shell
  nmcli connection modify eth1_cfg ipv4.dns "8.8.8.8 114.114.114.114"
  nmcli connection up eth1_cfg
  ```

- 恢复为 DHCP 自动获取的 DNS：

  ```shell
  nmcli connection modify eth1_cfg ipv4.dns "" ipv4.ignore-auto-dns no
  nmcli connection up eth1_cfg
  ```

配置后可用 `nmcli device show eth1 | grep DNS` 或 `cat /etc/resolv.conf`
查看生效的 DNS 服务器。

## Proxy 配置

Proxy 配置指的是对网络代理进行设置。在网络通信中，代理服务器作为客户端和目标服务器之间的中间层，客户端的请求先发送到代理服务器，再由代理服务器转发给目标服务器，目标服务器的响应也通过代理服务器返回给客户端。

编辑 `~/.bashrc` 或 `/etc/environment` 文件。如果是为当前用户配置代理，编辑 `~/.bashrc`；如果是为所有用户配置代理，编辑 `/etc/environment`.

在文件中添加以下内容（以 HTTP 代理为例）：

```
http_proxy=http://proxy_server_address:port
https_proxy=http://proxy_server_address:port
ftp_proxy=http://proxy_server_address:port
no_proxy=localhost,127.0.0.1
```

保存文件后，执行以下命令使配置生效：

```
source ~/.bashrc
```

### 通过图形界面配置 Proxy{#gui_proxy}

<DocScope products="RDK S100">

#### S100 操作步骤

与修改静态`IP`类似, 修改`Proxy`配置步骤如下:

1. 进入桌面后点击左下角打开应用列表，选择`settings`应用，在跳出来的界面中选择`Network`。

2. 下拉选择`Network Proxy`的齿轮进入配置。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-proxy.jpg" alt="修改 Proxy 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. 在跳出来的界面中填写所需配置即可。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-proxy_set.png" alt="修改 Proxy 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

<DocScope products="RDK S600">

#### S600 操作步骤

与修改静态`IP`类似, 修改`Proxy`配置步骤如下:

1. 进入桌面后点击左下角打开应用列表，选择`settings`应用，在跳出来的界面中选择`Network`。

2. 选择`Proxy`点击进入配置。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy.jpg" alt="修改 Proxy 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. 在跳转的界面中填写所需配置即可。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy_set_0.png" alt="修改 Proxy 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy_set_1.png" alt="修改 Proxy 配置示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

:::tip
系统软件包升级与主版本/固件更新见 [系统更新](./03_system_update/02_upgrade_firmware.md)。
:::

## 验证

- 有线网络：`nmcli device show eth1` 输出中 `IP4.ADDRESS[1]` 显示配置的静态 IP 或 DHCP 分配的 IP。
- 无线 Station：`ip addr show wlan0` 能查到路由器分配的 IP 地址。
- DNS：`nmcli device show eth1 | grep DNS` 或 `cat /etc/resolv.conf` 显示生效的 DNS 服务器。

## 相关文档

- [蓝牙配置](./02_bluetooth_config.md)
- [系统更新](./03_system_update/02_upgrade_firmware.md)
- [远程登录](../01_Quick_start/03_install_os_and_setup/05_remote_login.md)
