---
sidebar_position: 6
---

# 2.6 GUI 界面配置网络流程

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

本章节介绍在`Ubuntu`系统内通过 GUI 界面对 ETH 网络进行静态 `IP`、`DNS`、`Proxy` 配置的方法。

<DocScope products="RDK S100">
## 修改静态 IP、DNS 配置

1. 进入桌面后点击左下角打开应用列表，选择`settings`应用，在跳出来的界面中选择`Network`。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-show-app.jpg" alt="image-show-app" style={{ width: '100%' }} />

2. `Ethernet (eth0)` 和`Ethernet (eth1)`分别对应不同的物理网口配置，配置与实物对应如下:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-phy-eth.png" alt="image-phy-eth" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-sel-eth.png" alt="image-sel-eth" style={{ width: '100%' }} />

3. 以修改`Ethernet (eth1)` 为例,点击修改按钮右侧选项中的齿轮，在跳出来的界面中选择`IPV4`, 选择`Manual`手动配置，在下方`Addresser`栏中写入`IP`地址，掩码和网关。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image_set_static_ip.png" alt="image_set_static_ip" style={{ width: '100%' }} />

4. 下拉，在下方 DNS 栏中输入 DNS 配置。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image_set_static_dns.png" alt="image_set_static_dns" style={{ width: '100%' }} />

5. 一个网卡配置多个 ip 地址，以`Ethernet (eth1)`为例，点击右侧的加号，配置 ip 地址和步骤3、4一致，完成配置后注意选中`eth1_cfg`出现`√`选项

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-sel_nmcli_netplan.jpg" alt="image-sel_nmcli_netplan" style={{ width: '100%' }} />

若是/etc/netplan/目录下的配置文件中没有网络配置项，则配置界面如下。
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-sel_nmcli_only.jpg" alt="image-sel_nmcli_only" style={{ width: '100%' }} />

## 修改 Proxy 配置

与修改静态`IP`类似, 修改`Proxy`配置步骤如下:

1. 进入桌面后点击左下角打开应用列表，选择`settings`应用，在跳出来的界面中选择`Network`。

2. 下拉选择`Network Proxy`的齿轮进入配置。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-proxy.jpg" alt="image-proxy" style={{ width: '100%' }} />

3. 在跳出来的界面中填写所需配置即可。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-proxy_set.png" alt="image-proxy_set" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK S600">
## 修改静态 IP、DNS 配置

1. 进入桌面后点击左下角打开应用列表，选择`settings`应用，在跳出来的界面中选择`Network`。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-show-app.jpg" alt="image-show-app" style={{ width: '100%' }} />

2. `Ethernet (eth0)` 、`Ethernet (eth1)`、`Ethernet (eth3)`和`Ethernet (eth4)`分别对应不同的物理网口配置，配置与实物对应如下:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-phy-eth.png" alt="image-phy-eth" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-sel-eth.png" alt="image-sel-eth" style={{ width: '100%' }} />

3. 以修改`Ethernet (eth1)` 为例,点击修改按钮右侧选项中的齿轮，在跳出来的界面中选择`IPV4`, 选择`Manual`手动配置，在下方`Addresser`栏中写入`IP`地址，掩码和网关。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image_set_static_ip.png" alt="image_set_static_ip" style={{ width: '100%' }} />

4. 在下方 DNS 栏中输入 DNS 配置。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image_set_static_dns.png" alt="image_set_static_dns" style={{ width: '100%' }} />

5. 一个网卡配置多个 ip 地址，以`Ethernet (eth1)`为例，点击右侧的加号，配置 ip 地址和步骤3、4一致，完成配置后注意选中`netplan-eth1`出现`√`选项

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-sel_ok.jpg" alt="image-sel_ok" style={{ width: '100%' }} />

## 修改 Proxy 配置

与修改静态`IP`类似, 修改`Proxy`配置步骤如下:

1. 进入桌面后点击左下角打开应用列表，选择`settings`应用，在跳出来的界面中选择`Network`。

2. 选择`Proxy`点击进入配置。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy.jpg" alt="image-proxy" style={{ width: '100%' }} />

3. 在跳转的界面中填写所需配置即可。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy_set_0.png" alt="image-proxy_set_0" style={{ width: '100%' }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy_set_1.png" alt="image-proxy_set_1" style={{ width: '100%' }} />
</DocScope>
