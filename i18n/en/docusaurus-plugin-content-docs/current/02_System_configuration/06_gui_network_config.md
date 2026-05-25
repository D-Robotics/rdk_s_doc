---
sidebar_position: 6
---

# 2.6 GUI Network Configuration Process

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

This section describes how to configure static `IP`, `DNS`, and `Proxy` settings for the ETH network via the GUI interface in the `Ubuntu` system.

<DocScope products="RDK S100">
## Modifying Static IP and DNS Configuration

1. After entering the desktop, click the bottom-left corner to open the application list and select the `Settings` app. In the pop-up window, choose `Network`.

![image-show-app](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-show-app.jpg)

2. `Ethernet (eth0)` and `Ethernet (eth1)` correspond to configurations for different physical network ports, as shown below:

![image-phy-eth](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-phy-eth.png)

![image-sel-eth](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-sel-eth.png)

3. Taking `Ethernet (eth1)` as an example, click the gear icon next to the edit button. In the pop-up window, select `IPv4`, choose `Manual` for manual configuration, and enter the `IP` address, subnet mask, and gateway in the `Addresses` field below.

![image_set_static_ip](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image_set_static_ip.png)

4. Scroll down and enter the DNS configuration in the DNS field below.

![image_set_static_dns](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image_set_static_dns.png)

5. To assign multiple IP addresses to a single network interface (using `Ethernet (eth1)` as an example), click the plus sign (`+`) on the right. Configure the additional IP address following the same steps as in steps 3 and 4. After completing the configuration, ensure that the `netplan-eth1` option is selected (indicated by a `√`).

![image-sel_ok](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-sel_ok.jpg)

## Modifying Proxy Configuration

Similar to configuring a static `IP`, follow these steps to modify the `Proxy` settings:

1. After entering the desktop, click the bottom-left corner to open the application list and select the `Settings` app. In the pop-up window, choose `Network`.

2. Scroll down and click the gear icon next to `Network Proxy` to access its configuration.

![image-proxy](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-proxy.jpg)

3. Enter the required proxy settings in the pop-up window.

![image-proxy_set](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-proxy_set.png)

</DocScope>

<DocScope products="RDK S600">
## Modify Static IP, DNS Configuration

1. After entering the desktop, click the bottom left corner to open the application list, select the `settings` application, and in the pop-up interface, choose `Network`.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-show-app.jpg" alt="image-show-app" style={{ width: '100%' }} />

2. `Ethernet (eth0)`, `Ethernet (eth1)`, `Ethernet (eth3)`, and `Ethernet (eth4)` correspond to different physical network port configurations. The mapping between configuration and physical ports is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-phy-eth.png" alt="image-phy-eth" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-sel-eth.png" alt="image-sel-eth" style={{ width: '100%' }} />

3. Take modifying `Ethernet (eth1)` as an example. Click the gear icon in the options on the right side of the modify button. In the pop-up interface, select `IPV4`, choose `Manual` for manual configuration, and enter the `IP` address, subnet mask, and gateway in the `Addresser` field below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image_set_static_ip.png" alt="image_set_static_ip" style={{ width: '100%' }} />

4. Enter the DNS configuration in the DNS field below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image_set_static_dns.png" alt="image_set_static_dns" style={{ width: '100%' }} />

5. To configure multiple IP addresses for a single network card, take `Ethernet (eth1)` as an example. Click the plus sign on the right, configure the IP address following the same steps as in steps 3 and 4. After completing the configuration, make sure to select `netplan-eth1` and verify that the `√` option appears.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-sel_ok.jpg" alt="image-sel_ok" style={{ width: '100%' }} />

## Modify Proxy Configuration

Similar to modifying a static `IP`, the steps to modify the `Proxy` configuration are as follows:

1. After entering the desktop, click the bottom left corner to open the application list, select the `settings` application, and in the pop-up interface, choose `Network`.

2. Select `Proxy` and click to enter the configuration.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy.jpg" alt="image-proxy" style={{ width: '100%' }} />

3. Fill in the required configuration in the redirected interface.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy_set_0.png" alt="image-proxy_set_0" style={{ width: '100%' }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy_set_1.png" alt="image-proxy_set_1" style={{ width: '100%' }} />
</DocScope>