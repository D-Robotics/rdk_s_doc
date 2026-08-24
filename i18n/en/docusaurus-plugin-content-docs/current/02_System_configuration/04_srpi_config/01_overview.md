---
sidebar_position: 1
title: "srpi-config Tool Configuration"
description: "srpi-config system configuration tool: System/Interface/Performance/Localisation/Advanced options"
---

# srpi-config Tool Configuration

## Introduction

`srpi-config` is a system configuration tool. To open the configuration tool, type the following command in the command line:

```
sudo srpi-config
```

> sudo is a privilege escalation command and must be entered here, so that configuration management can be performed with root permissions. The default sunrise account does not have permission to modify system files.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/srpi-config/srpi-config-home_s100.png" alt="Introduction illustration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


If you are using a desktop system, you can find the `RDK Configuration` application in the menu to perform configuration. This will also open the same configuration terminal as shown in the image above. The difference in background color is related to the environment variable `TERM` of the environment in which the terminal is opened.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/srpi-config/desktop_rdk_configuration_s100.png" alt="Introduction illustration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/srpi-config/srpi-config-gui-home_s100.png" alt="Introduction illustration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## System Options

The System Options menu allows configuration changes to Wi-Fi network, user password, hostname, system login mode, browser selection and other parts, as well as some system-level changes.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/srpi-config/srpi-config-gui-system_s100.png" alt="System Options illustration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- **Wireless LAN**

  Set the `SSID` and `password` of the wireless network.

- **Password**

  Change the password of the "default" user. The default account is `sunrise` (for the default account/password, see
  [Network Configuration](../01_network_config.md)).

- **Hostname**

  Set the visible name of the current device on the network.

- **Boot / Auto login**

  Choose whether to boot to the console or the desktop, and whether to log in automatically. If automatic login is selected, it logs in with the identity of the system default account `sunrise`.

- **Power LED**

  If the RDK model allows it, you can change the behavior of the power LED in this option. The default is off or blinking.

- **Browser**

  If you are using a desktop system, you can set the default browser. Without configuration, `firefox` is used by default. Users can install the `chromium` browser with the command `sudo apt install chromium`.

- **Update Miniboot**

  If you need to upgrade Miniboot-related partitions, you can do it in this option. For the upgrade principle and the partitions involved in the upgrade, refer to: [miniboot Upgrade](../../07_Advanced_development/03_system_software/07_ota_miniboot.md).

## Display Options

Display options, used to select the display output interface on the board.

- **Display Chose**

  Select DSI or HDMI as the display output.

## Interface Options

The Interface Options menu. The following options can be enabled/disabled: SSH, peripherals and other functions.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/srpi-config/srpi-config-gui-intf_s100.png" alt="srpi-config Interface Options menu" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- **SSH**

  Enable/disable remote login to the `RDK` via SSH. By default the system has the SSH option enabled.

- **VNC**

  S100 does not support VNC (please use NoMachine); S600 supports VNC (based on x11vnc).

- Peripheral configuration
  It is recommended to refer to [config.txt File Configuration](../05_config_txt/01_usage.md) for peripheral configuration;


## Performance Options

Performance options, including CPU running mode and fixed-frequency settings, ION memory size adjustment and other functions.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/srpi-config/srpi-config-gui-performance_s100.png" alt="Performance Options illustration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- **CPU frequency**

  Configure the CPU running mode and fixed frequency.

- **ION memory**

  You can configure the commonly used size of the ION memory through this option.

> The ION memory is physical memory space reserved for the BPU and for image and video multimedia features. It consists of three parts: `ion_cma`, `cma_reserved` and `carveout` (measured on the S600 board, they are 1024MB, 2048MB and 2048MB respectively). When running large models or multiple encoding/decoding streams, you can adjust them in this menu as needed.

## Localisation Options

Localisation options. The following options are provided for you to choose: local language, time zone, keyboard layout.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/srpi-config/srpi-config-gui-localisation_s100.png" alt="Localisation Options illustration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- **Locale**

  Choose a locale. For example, configure the Chinese environment `zh_CN.UTF-8`. It takes effect after reboot.

- **Time Zone**

  Choose your local time zone, starting from the region, for example Asia, and then choose a city, for example Shanghai. Type a letter to jump the list down to that point in the alphabet.

- **Keyboard**

  Reading all keyboard types takes a long time to display. Changes usually take effect immediately, but a reboot may be required.

## Advanced Options

Advanced options. You can set options such as disk expansion and network proxy.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/srpi-config/srpi-config-gui-advanced_s100.png" alt="Advanced Options illustration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- **Expand Filesystem**

  This option expands the filesystem to fill the entire storage medium (eMMC by default on S100), providing more space for the filesystem.

- **Network Proxy Settings**

  Configure the network proxy settings.

## Update

Update the `srpi-config` tool to the latest version.

## About srpi-config

Information about `srpi-config`

Selecting this option displays the following information:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/srpi-config/srpi-config-gui-about_s100.png" alt="About srpi-config illustration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Finish Button

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/srpi-config/srpi-config-gui-finish_s100.png" alt="Finish button illustration" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

After completing your changes, select the `Finish` button. For the system configuration provided by `srpi-config`, options that depend on a reboot to take effect will ask you whether to reboot. If you do not reboot, the configuration will not take effect properly. Please decide the reboot timing according to your usage.

## Verification

- Tool opens: `sudo srpi-config` entering the configuration menu means it works (on the Desktop edition, open `RDK Configuration` from the menu).
- Configuration takes effect: after making changes, choose reboot at the `Finish` prompt, and the configuration takes effect after reboot; for example, after `Expand Filesystem`, `df -h /` shows more space, and after changing `Hostname`, `hostname` outputs the new name.

## FAQ

### Changes Do Not Take Effect

**Cause**: Some configurations require a reboot, and you did not choose to reboot after `Finish`.

**Solution**: Choose reboot at the `Finish` prompt, or manually run `reboot` and then verify.

### Running as a Regular User Reports a Permission Error

**Cause**: The default `sunrise` account does not have permission to modify system files.

**Solution**: Run `sudo srpi-config` with root privileges.

### Abnormal Background Color in the Terminal UI

**Cause**: Different `TERM` environment variables lead to color-scheme differences.

**Solution**: This does not affect functionality; adjust the terminal type as needed, based on the text of the menu options.

## Related Documentation

- [config.txt File Configuration](../05_config_txt/01_usage.md)
- [Network Configuration](../01_network_config.md)
- [Auto-start Configuration at Boot](../06_self_start.md)
