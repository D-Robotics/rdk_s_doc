---
sidebar_position: 6
title: "Network Configuration Process via GUI"
description: Network configuration process via GUI
unlisted: true
---

# Network Configuration Process via GUI

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

This chapter describes how to perform static `IP`, `DNS`, and `Proxy` configuration for the ETH network through the GUI on the `Ubuntu` system.

<DocScope products="RDK S100">
## Modify Static IP and DNS Configuration

1. After entering the desktop, click the bottom-left corner to open the application list, select the `settings` application, and select `Network` in the window that pops up.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-show-app.jpg" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

2. `Ethernet (eth0)` and `Ethernet (eth1)` correspond to different physical network port configurations respectively. The correspondence between configuration and physical ports is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-phy-eth.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-sel-eth.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. Taking the modification of `Ethernet (eth1)` as an example, click the gear icon in the options to the right of the modify button, select `IPV4` in the window that pops up, choose `Manual` for manual configuration, and enter the `IP` address, mask, and gateway in the `Addresser` field below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image_set_static_ip.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

4. Scroll down and enter the DNS configuration in the DNS field below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image_set_static_dns.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

5. To configure multiple IP addresses for one network interface, taking `Ethernet (eth1)` as an example, click the plus sign on the right. The IP address configuration is consistent with steps 3 and 4. After completing the configuration, make sure to select `eth1_cfg` so that the `√` option appears.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-sel_nmcli_netplan.jpg" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

If there is no network configuration entry in the configuration file under the /etc/netplan/ directory, the configuration interface is as follows.
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/image-sel_nmcli_only.jpg" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Modify Proxy Configuration

Similar to modifying the static `IP`, the steps to modify the `Proxy` configuration are as follows:

1. After entering the desktop, click the bottom-left corner to open the application list, select the `settings` application, and select `Network` in the window that pops up.

2. Scroll down and click the gear icon of `Network Proxy` to enter the configuration.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-proxy.jpg" alt="Illustration of modifying Proxy configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. Fill in the required configuration in the window that pops up.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s100/image-proxy_set.png" alt="Illustration of modifying Proxy configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

<DocScope products="RDK S600">
## Modify Static IP and DNS Configuration

1. After entering the desktop, click the bottom-left corner to open the application list, select the `settings` application, and select `Network` in the window that pops up.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-show-app.jpg" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

2. `Ethernet (eth0)`, `Ethernet (eth1)`, `Ethernet (eth2)`, and `Ethernet (eth3)` correspond to different physical network port configurations respectively. The correspondence between configuration and physical ports is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-phy-eth.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-sel-eth.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. Taking the modification of `Ethernet (eth1)` as an example, click the gear icon in the options to the right of the modify button, select `IPV4` in the window that pops up, choose `Manual` for manual configuration, and enter the `IP` address, mask, and gateway in the `Addresser` field below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image_set_static_ip.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

4. Enter the DNS configuration in the DNS field below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image_set_static_dns.png" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

5. To configure multiple IP addresses for one network interface, taking `Ethernet (eth1)` as an example, click the plus sign on the right. The IP address configuration is consistent with steps 3 and 4. After completing the configuration, make sure to select `eth1_cfg` so that the `√` option appears.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-sel_ok.jpg" alt="Illustration of modifying static IP and DNS configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Modify Proxy Configuration

Similar to modifying the static `IP`, the steps to modify the `Proxy` configuration are as follows:

1. After entering the desktop, click the bottom-left corner to open the application list, select the `settings` application, and select `Network` in the window that pops up.

2. Select `Proxy` and click to enter the configuration.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy.jpg" alt="Illustration of modifying Proxy configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. Fill in the required configuration in the window that pops up.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy_set_0.png" alt="Illustration of modifying Proxy configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/gui_network_config/s600/image-proxy_set_1.png" alt="Illustration of modifying Proxy configuration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
</DocScope>

## Related Documentation

- [Network Configuration](./01_network_config.md)
- [Bluetooth Configuration](./02_bluetooth_config.md)
