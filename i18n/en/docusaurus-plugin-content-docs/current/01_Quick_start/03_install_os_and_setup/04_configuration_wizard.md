---
sidebar_position: 4
title: "Initial Setup"
description: "Initial setup for RDK S100/S600: accounts, Wi-Fi, SSH, Chinese locale, RDK Studio, NoMachine"
---

# Initial Setup

This section guides you through completing the first basic setup after flashing the system and logging in: connecting to the network, enabling SSH, setting the Chinese locale, installing remote desktop, and so on, to get the board into a state ready for daily use.

> For flashing, see [System flashing](./01_instruction.md); for confirming the system status, see [System status](03_system_status.md); for remote login, see [Remote login](05_remote_login.md).

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## Prerequisites

Before starting, please prepare:

- [ ] The development board has been [flashed with the system](./01_instruction.md) and finished booting.
- [ ] You have logged in to the development board via the serial port or SSH (see [Remote login](05_remote_login.md) for the login methods).
- [ ] Before configuring the wireless network: the M.2 Key E Wi-Fi & Bluetooth module is already installed.

## Default Login Accounts

Before configuring the system, you need to log in first.

<DocScope products="RDK-S100">

The RDK S100 system provides two default accounts:

</DocScope>

<DocScope products="RDK-S600">

The RDK S600 system provides two default accounts:

</DocScope>

- **Standard user:** Username `sunrise`, Password `sunrise`
- **Superuser (root):** Username `root`, Password `root`

## Connect to Wi-Fi

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

<DocScope products="RDK-S100">

Follow the Ubuntu 22.04 Wi-Fi connection tutorial.

</DocScope>

<DocScope products="RDK-S600">

Follow the Ubuntu 24.04 Wi-Fi connection tutorial.

</DocScope>

</TabItem>

<TabItem value="server" label="Server">

Connect via the serial port or SSH using the commands below:

```bash
# Scan for Wi-Fi networks
sudo nmcli device wifi rescan
sudo nmcli device wifi list       # List found Wi-Fi networks
sudo wifi_connect "SSID" "PASSWD" # Connect to the specified Wi-Fi
```

After a successful connection, output similar to the following is displayed. The UUID at the end is the unique identifier generated for this connection:

```text
root@ubuntu:~# sudo wifi_connect "WiFi-Test" "12345678"
Device 'wlan0' successfully activated with 'd7468833-4195-45aa-aa33-3d43da86e1a7'.
```

Afterwards, use `ifconfig` to obtain the Wi-Fi IP address of the board.

If connecting reports the error `Error: No network with SSID 'WiFi-Test' found.`, it means the hotspot was not found. Run `sudo nmcli device wifi rescan` to rescan first, then connect again; if scanning reports the error `Error: Scanning not allowed immediately following previous scan.`, it means scanning is too frequent. Wait a moment and retry.

</TabItem>
</Tabs>

## Enable the SSH Service

The current system version enables the SSH login service by default. Users can use this method to enable or disable the SSH service.

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

The desktop version can also open the Terminal and run the same commands below to check and control the SSH service.

</TabItem>

<TabItem value="server" label="Server">

Use the systemctl command to check the current running status of the SSH service:

```
sudo systemctl status ssh
```

After running this command, detailed status information of the SSH service is displayed. If the service is running, the output shows Active: active (running); if the service is not running, it shows Active: inactive (dead) and similar information.

The following are the control commands for SSH:

```bash
sudo systemctl start ssh # Start SSH service
sudo systemctl stop ssh  # Stop SSH service
sudo systemctl enable ssh # Enable SSH service at boot
sudo systemctl disable ssh # Disable SSH service at boot
sudo systemctl restart ssh # Restart SSH service

```

</TabItem>

</Tabs>

For SSH usage, see [Remote Login - SSH Login](./remote_login#ssh).

## Set the Login Mode

### Automatic Login on the Text Terminal

Modify the serial-getty service file to enable passwordless login. The steps are:

<DocScope products="RDK-S100">

1. Open `serial-getty@.service`.

```bash
# Log in as root user
vim /lib/systemd/system/serial-getty@.service

# Log in as sunrise user
sudo vim /lib/systemd/system/serial-getty@.service
```

</DocScope>

<DocScope products="RDK-S600">

1. Open `serial-getty@ttyS0.service`.

```bash
# Log in as root user
vim /usr/lib/systemd/system/serial-getty@ttyS0.service

# Log in as sunrise user
sudo vim /usr/lib/systemd/system/serial-getty@ttyS0.service
```

</DocScope>

2.  Modify the line containing `ExecStart=-/sbin/agetty` to (taking root automatic login as an example):

```text
ExecStart=-/sbin/agetty --autologin root -o '-p -- \\u' --keep-baud 921600,115200,57600,38400,9600 - $TERM
```

**Parameter explanation:** `--autologin root` specifies the username for automatic login (it can also be written as `-a root`).

3. After reboot, users will log in automatically.

<!-- ### Automatic Login on the Graphical Terminal

To be updated -->

## Set the Chinese Locale

1. Install the language packages

```bash
sudo apt install language-pack-zh-hans language-pack-zh-hans-base fonts-wqy-microhei
```

- language-pack-zh-hans: Contains the translation files for the Chinese language, making the system interface display in Chinese.
- language-pack-zh-hans-base: Base language pack providing basic Chinese support.
- fonts-wqy-microhei: Installs Chinese fonts.

2. Open a terminal and run the following command to open the locale configuration file:

```bash
sudo vim /etc/default/locale
```

Add or modify the following content in the file:

```text
LANG=zh_CN.UTF-8
LANGUAGE=zh_CN:zh
LC_ALL=zh_CN.UTF-8
```

3. Run the following commands to apply the configuration:

```bash
fc-cache -fv
source /etc/default/locale
```

## Set the Chinese Input Method

After the Chinese locale is installed, the system's built-in input method is supported by default. Press the `Super (Windows key)` + `Space` key combination to switch between different input methods.

## Set up RDK Studio

RDK Studio is an AI-native desktop workbench for robotics development. It puts Moss conversation, project workspaces, device connection, remote development, flashing, local models, and on-board Agent all in the same native window.

For RDK Studio usage, refer to the [RDK Studio User Manual](https://developer.d-robotics.cc/rdk_studio_doc/category/1-product-intro).

## NoMachine Configuration

`NoMachine` currently does not support installation via `apt`. You need to get the `deb` package from the official website.

NoMachine official download URL: [NoMachine Download](https://downloads.nomachine.com/download/?id=30&platform=linux&distro=arm)

**Download the installation package**

On the official website, find the `ARM64` version installation package suitable for

<DocScope products="RDK-S100">

`RDK S100`

</DocScope>

<DocScope products="RDK-S600">

`RDK S600`

</DocScope>

and click `Download`

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/image_s100_nomachine_dl.PNG" alt="NoMachine configuration diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

**Install**

```shell
sudo apt update; sudo apt upgrade -y   # Ensure the current software is up to date
dpkg -i nomachine_*_arm64.deb
```

**Configure and start**

1. Configure the server to allow remote connections

    ```shell
    sudo systemctl start nxserver
    ```

2. Set `NoMachine` to start on boot:

    ```shell
    sudo systemctl enable nxserver
    ```

3. Set `EGL Capture` to `yes`. This is a screen capture feature provided by `NoMachine`, mainly used to improve the remote desktop experience in specific display server environments:

    ```shell
    sudo /etc/NX/nxserver --eglcapture yes
    ```
    This command takes effect after a reboot. You can run the following command to double-check; when `EGL Capture has been enabled` appears, the feature has been written to the configuration file.
    ```shell
    if [ -f "/usr/lib/systemd/user/org.gnome.Shell@wayland.service" ] && grep -q "nxpreload.sh" "/usr/lib/systemd/user/org.gnome.Shell@wayland.service" && [ -f "/usr/share/applications/org.gnome.Shell.desktop" ] && grep -q "nxpreload.sh" "/usr/share/applications/org.gnome.Shell.desktop" && [ -f "/usr/NX/etc/node.cfg" ] && grep -q "EnableEGLCapture 1" "/usr/NX/etc/node.cfg"; then echo "EGL Capture has been enabled"; else echo "Not enabled"; fi
    ```

4. Restart the `NoMachine` service:

    ```shell
    sudo systemctl restart nxserver
    ```

**Reboot**

<DocScope products="RDK-S100">

Reboot the S100.

</DocScope>

<DocScope products="RDK-S600">

Reboot the S600.

</DocScope>

Due to a configuration issue with `NXServer`, connecting directly after completing the above operations results in a black screen. A reboot is required before use.

For `NoMachine` usage, see [Remote Login - NoMachine Login](./remote_login#nomachine-login).

## User Management

**Change the username**

Taking usertest as the new username as an example:

```shell
# Kill all processes of the sunrise user
sudo pkill -u sunrise
# Rename the sunrise user to usertest
sudo usermod -l usertest sunrise
# Change the user's home directory to /home/usertest
sudo usermod -d /home/usertest -m usertest
# Change the user's password
sudo passwd usertest
```

Finally, update the username configured for automatic login in the desktop service:
  - gdm: The default desktop service on RDK S100/S600. Change `AutomaticLogin = sunrise` to `AutomaticLogin = usertest` in the `/etc/gdm3/custom.conf` file.
  - lightdm (legacy desktop service, if used): Change `autologin-user=sunrise` to `autologin-user=usertest` in the `/etc/lightdm/lightdm.conf.d/22-hobot-autologin.conf` file.

**Add a new user**

Taking usertest as the new user to add as an example:

```shell
sudo useradd -U -m -d /home/usertest -k /etc/skel/ -s /bin/bash -G disk,kmem,dialout,sudo,audio,video,render,i2c,lightdm,vpu,gdm,weston-launch,graphics,jpu,ipu,vps,misc,gpio usertest
sudo passwd usertest
sudo cp -aRf /etc/skel/. /home/usertest
sudo chown -R usertest:usertest /home/usertest
```

You can also refer to the username modification steps to set the newly added user as the automatic login user.

## Verification

After completing the above configuration, confirm using the following checklist:

- `ifconfig` shows the wireless/wired IP address (network configuration succeeded).
- Running `ssh sunrise@<board IP>` from the PC can log in (the SSH service works).
- The system language/Chinese fonts take effect (`locale` output contains `zh_CN.UTF-8`).
- NoMachine can connect from the PC to the board's desktop (remote desktop works).

## FAQ

- **Wi-Fi scanning finds no network**: Check whether the Wi-Fi module is installed (M.2 Key E interface), and use `nmcli device` to check the device status.
- **SSH connection refused**: Use `sudo systemctl status ssh` to confirm the service is running; check the firewall with `sudo ufw status`.
- **Cannot log in to the desktop after switching the Chinese locale**: See [Desktop applications](../../08_FAQ/07_desktop_app.md).
- **NoMachine black screen**: After completing the configuration, you must **reboot the board** for it to take effect.

## Related documents

- [System flashing](./01_instruction.md)
- [System status](03_system_status.md)
- [Remote login](05_remote_login.md)
- [Network configuration](../../02_System_configuration/01_network_config.md)
- [srpi-config tool configuration](../../02_System_configuration/04_srpi_config/01_overview.md)
- [Desktop applications](../../08_FAQ/07_desktop_app.md)
