---
sidebar_position: 1
---

# 2.1 网络与蓝牙配置

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本章节主要介绍开发板有线、无线网络配置的修改方法。

## 有线网络{#config_ethnet}

### 有线网络配置-Network Manager 方式

:::info 注意

 默认使用 `NetworkManager + Netplan` 管理网络，其它平台请以对应系统文档为准。

<DocScope products="RDK S100">
  - `RDK S100`根文件系统基于 Ubuntu-22.04 构建，默认不支持采用 ifup/ifdown 这种方式来对网络接口进行启用或停用操作。
</DocScope>

<DocScope products="RDK S600">
  - `RDK S600`根文件系统基于 Ubuntu-24.04 构建，默认不支持采用 ifup/ifdown 这种方式来对网络接口进行启用或停用操作。
</DocScope>

:::

在 Ubuntu 系统中，开发板的网络连接配置保存在 `/etc/NetworkManager/system-connections/` 目录下（每个网卡连接一个 `.nmconnection` 文件）。常用字段说明如下：

- **DHCP 配置**：将 `[ipv4]` 中 `method` 设置为 `auto`，由 DHCP 自动分配地址。
- **静态地址配置**：将 `[ipv4]` 中 `method` 设置为 `manual`，使用 `address1=IP/CIDR,Gateway` 配置 IP、掩码和网关。
- **自定义 DNS**：通过 `dns=` 字段指定 DNS 服务器，多个地址以分号分隔。

### ETH0 DHCP 配置示例

编辑连接文件：

```shell
sudo vim /etc/NetworkManager/system-connections/eth0_cfg.nmconnection
```

```shell
[connection]
id=eth0_cfg
uuid=1f3c0cb8-3ef4-4d7f-9f22-0a0f6f0b2222
type=ethernet
interface-name=eth0
timestamp=1773022723

[ethernet]

[ipv4]
dns=10.9.1.2;8.8.8.8;8.8.4.4;
method=auto

[ipv6]
addr-gen-mode=eui64
method=disabled

[proxy]

```

### ETH1 静态 IP 配置示例

编辑连接文件：

```shell
sudo vim /etc/NetworkManager/system-connections/eth1_cfg.nmconnection
```

```shell
[connection]
id=eth1_cfg
uuid=1f3c0cb8-3ef4-4d7f-9f22-0a0f6f0b1111
type=ethernet
interface-name=eth1
timestamp=1773022363

[ethernet]

[ipv4]
address1=192.168.127.10/24,192.168.127.1
dns=10.9.1.2;8.8.8.8;8.8.4.4;
method=manual

[ipv6]
addr-gen-mode=eui64
method=disabled

[proxy]

```

修改完成后，建议按以下顺序使配置生效：

```shell
# 建议检查配置文件权限（NetworkManager 要求仅 root 可读写）
sudo chmod 600 /etc/NetworkManager/system-connections/*.nmconnection

# 重新加载连接配置
sudo nmcli connection reload

# 启用对应连接
sudo nmcli connection up eth0_cfg
# 或
sudo nmcli connection up eth1_cfg

```

使用命令行配置静态 IP 示例：

```shell
# 配置 eth1 静态 IP 为 192.168.10.100/24，网关为 192.168.10.1，DNS 为 223.5.5.5 和 8.8.8.8
nmcli connection modify "eth1_cfg" \
  ipv4.method manual \
  ipv4.addresses "192.168.10.100/24" \
  ipv4.gateway "192.168.10.1" \
  ipv4.dns "223.5.5.5 8.8.8.8" \
  connection.autoconnect yes

# 重启连接使配置生效
nmcli connection down "eth1_cfg"
nmcli connection up "eth1_cfg"

```

使用命令行配置DHCP示例：

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

## 无线网络

Video: https://www.bilibili.com/video/BV1rm4y1E73q/?p=12

开发板需安装无线 Wi-Fi 模块，支持 Soft AP 和 Station 两种模式，默认运行在 Station 模式下。下面介绍两种模式的使用方法。

### Station 模式

Station 模式下，开发板作为客户端，接入路由器无线热点进行联网。

- 对于使用 Ubuntu Desktop 版本系统的用户，可点击桌面右上角 Wi-Fi 图标，选择对应热点并输入密码以完成网络配置，如下图：
  ![image-wifi-config](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/network/image-wifi-config.jpeg)

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
WIFI AP 模式暂不可用
持续更新中....
:::

<!-- 开发板无线网络默认运行在Station模式下，如需使用Soft AP模式，请按照以下步骤进行配置。

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
    Using interface wlan0 with hwaddr 08:e9:f6:af:18:26 and ssid "sunrise"
    wlan0: interface state UNINITIALIZED->ENABLED
    wlan0: AP-ENABLED
   ```
   - 通过`ifconfig`命令，配置无线接口`wlan0`的IP和网段，注意要跟第三步的配置保持一致
    ```bash
    sudo ifconfig wlan0 10.5.5.1 netmask 255.255.255.0
    ```
   - 最后开启`dhcp`服务器，连上热点会从`10.5.5.100`到`10.5.5.255`之间分配一个ip地址给客户端
    ```bash
    sudo ifconfig wlan0 10.5.5.1 netmask 255.255.255.0
    sudo systemctl start isc-dhcp-server
    sudo systemctl enable isc-dhcp-server
    ```

6. 连接开发板热点，例如 `sunrise`
![image-20220601203025803](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/network/image-20220601203025803.png)

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

Video: https://www.bilibili.com/video/BV1rm4y1E73q/?p=13

DNS(Domain Name Server)是进行域名(domain name)和与之相对应的 IP 地址转换的服务器。

开发板 DNS 配置通过`/etc/systemd/resolved.conf`文件管理，用户可通过修改该文件完成 DNS 相关配置，步骤如下：

1. 修改`resolved.conf`文件，添加 DNS 服务器地址，例如：

   ```bash
   DNS=8.8.8.8 114.114.114.114
   ```

2. 通过如下命令，使能 DNS 配置：

   ```bash
   sudo systemctl restart systemd-resolved
   sudo systemctl enable systemd-resolved
   sudo mv /etc/resolv.conf  /etc/resolv.conf.bak
   sudo ln -s /run/systemd/resolve/resolv.conf /etc/
   ```

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

## 系统更新

:::warning
产品未上市前，请勿执行
:::

出于系统安全、稳定性的考虑，推荐用户安装完系统后，通过`apt`命令对系统进行更新。

在`/etc/apt/source.list`文件中，保存了`apt`命令的软件源列表，在安装软件前，需要先通过`apt`命令更新 package 列表。

首先打开终端命令行，输入如下命令：

```bash
sudo apt update
```

其次，升级所有已安装的软件包到最新版本，命令如下：

```bash
sudo apt full-upgrade
```

:::tip
推荐使用`full-upgrade`而不是`upgrade`选项，这样当相关依赖发生变动时，也会同步更新依赖包。

当运行`sudo apt full-upgrade`命令时，系统会提示数据下载和磁盘占用大小，但是`apt`不会检查磁盘空间是否充足，建议用户通过`df -h`命令手动检查。此外，升级过程中下载的 deb 文件会保存在`/var/cache/apt/archives`目录中，用户可以通过`sudo apt clean`命令删除缓存文件以释放磁盘空间。
:::

执行`apt full-upgrade`命令后，可能会重新安装驱动、内核文件和部分系统软件，建议用户手动重启设备使更新生效，命令如下：

```bash
sudo reboot
```


## 蓝牙配置

Video: https://www.bilibili.com/video/BV1rm4y1E73q/?p=9

### 初始化
用户可以使用命令查询蓝牙进程是否正常，命令如下：

```bash
ps ax | grep "/usr/bin/dbus-daemon\|/usr/lib/bluetooth/bluetoothd"
/usr/bin/dbus-daemon

/usr/lib/bluetooth/bluetoothd
```

用户可以使用命令查询蓝牙控制器是否正常，命令如下（注意以下命令示例中的`Controller <MAC Addr>`的`<MAC Addr>`会随实际蓝牙控制器变化而变化）：
```bash
bluetoothctl list
Controller F0:68:E3:22:7E:91 ubuntu [default]
```

### 配网连接

执行`sudo bluetoothctl`进入交互模式下的蓝牙配置界面，出现了类似下图的设备信息表示蓝牙被识别到了，然后用`show`来查看蓝牙信息，留意蓝牙的`powered`和`discoverable`状态。

![image-20220601172604051](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601172604051.png)

执行 `power on` 使能蓝牙，如下图所示：

![image-20220601172501882](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601172501882.png)

为了能够使蓝牙被附近的设备发现，需要执行`discoverable on`使能蓝牙并打开蓝牙可发现属性，如下图所示：

![image-20220601172648853](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601172648853.png)

此时使用手机或者电脑扫描蓝牙就可以发现 `ubuntu` 这个名称的蓝牙设备：

![image-20220601175322650](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601175322650.png)

接下来测试蓝牙的主动扫描功能，在`bluetoothctl`的交互界面输入`scan on`即可打开主动扫描，它会周期性地打印附近的设备，可以看到已经发现了我的手机设备，`scan off`关闭扫描功能并汇总打印扫描到的蓝牙设备：

![image-20220601154131158](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601154131158.png)

![image-20220601154253947](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601154253947.png)

然后就是和其他蓝牙的配对：

- 配对命令：`pair [targetMAC] `，输入该命令后，根据提示输入`yes`，对端蓝牙设备选择`配对`选项完成配对。

- 配对成功后可以使用`trust [targetMAC]`来让下次自动连接

![image-20220601154414717](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/hardware_interface/image-20220601154414717.png)

经过以上操作后，蓝牙的扫描、配对的基本功能就完成了，如需使用更多功能，可查阅 `BlueZ`的官方帮助说明。
