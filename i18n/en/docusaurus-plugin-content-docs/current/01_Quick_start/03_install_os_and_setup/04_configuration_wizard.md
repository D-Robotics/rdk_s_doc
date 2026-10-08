---
sidebar_position: 4
title: "Initial Setup"
description: "Initial setup: accounts, Wi-Fi, SSH, Chinese locale, RDK Studio, NoMachine"
---

# Initial Setup

This section introduces the first basic setup after flashing the system and logging in, including connecting to the network, enabling SSH, setting the Chinese locale, installing a remote desktop, and so on, to bring the board into a usable state.

> Prerequisites: [System flashing](./01_instruction.md), [System status](./03_system_status.md), [Remote login](05_remote_login.md).

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## Prerequisites

- [ ] The board has been [flashed with the system](./01_instruction.md) and finished booting.
- [ ] You have logged in to the board via the serial port or SSH (see [Remote login](05_remote_login.md)).
- [ ] Before configuring the wireless network, the M.2 Key E Wi-Fi & Bluetooth module is installed.

## Default Login Accounts

The system provides the following two default accounts:

- **Standard user:** username `sunrise`, password `sunrise`
- **root user:** username `root`, password `root`

> For the authoritative definition of default accounts and the default network IP, see [Network configuration](../../02_System_configuration/01_network_config.md).

## Connect to Wi-Fi

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

<DocScope products="RDK S100">

In the Ubuntu 22.04 desktop, click the icon in the bottom-left corner to open Settings.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-WIFI-1.png" alt="S100 Wi-Fi connection diagram 1" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

In the left sidebar, select Wi-Fi and turn it on. Choose the target hotspot from Visible Networks.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-WIFI-2.png" alt="S100 Wi-Fi connection diagram 2" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

Enter the password and click Connect to finish.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-WIFI-3.png" alt="S100 Wi-Fi connection diagram 3" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

In the Ubuntu 24.04 desktop, click the icon in the bottom-left corner to open Settings.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-WIFI-1.png" alt="S600 Wi-Fi connection diagram 1" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

In the left sidebar, select Wi-Fi and turn it on. Choose the target hotspot from Visible Networks.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-WIFI-2.png" alt="S600 Wi-Fi connection diagram 2" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

Enter the password and click Connect to finish.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-WIFI-3.png" alt="S600 Wi-Fi connection diagram 3" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

</TabItem>

<TabItem value="server" label="Server">

Run the following commands via the serial port or SSH to connect:

```bash
# Scan for Wi-Fi networks
sudo nmcli device wifi rescan
sudo nmcli device wifi list       # List found Wi-Fi networks
sudo wifi_connect "SSID" "PASSWD" # Connect to the specified Wi-Fi
```

After a successful connection, output similar to the following is displayed. The UUID at the end is the unique identifier for this connection:

```text
root@ubuntu:~# sudo wifi_connect "WiFi-Test" "12345678"
Device 'wlan0' successfully activated with 'd7468833-4195-45aa-aa33-3d43da86e1a7'.
```

Use `ifconfig` to view the Wi-Fi IP address.

If the error `Error: No network with SSID 'WiFi-Test' found.` is reported, the hotspot was not found. Run `sudo nmcli device wifi rescan` to rescan first; if the error `Error: Scanning not allowed immediately following previous scan.` is reported, scanning is too frequent. Wait a moment and retry.

</TabItem>
</Tabs>

## Enable the SSH Service

The SSH service is enabled by default. You can enable or disable it as follows.

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

<DocScope products="RDK S100">

In the Ubuntu 22.04 desktop, enable or disable the SSH service as follows:

1. Click the icon in the bottom-left corner and select RDK Configuration to enter system settings.

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-1.png" alt="S100 SSH operation diagram 1" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

2. Select `Interface Options`.

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-2.png" alt="S100 SSH operation diagram 2" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

3. Select `I1 SSH`.

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-3.png" alt="S100 SSH operation diagram 3" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

4. Enable SSH: select `Yes`.

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-4.png" alt="S100 SSH operation diagram 4" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-5.png" alt="S100 SSH operation diagram 5" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

5. Disable SSH: select `No`.

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-6.png" alt="S100 SSH operation diagram 6" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S100-SSH-7.png" alt="S100 SSH operation diagram 7" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

<DocScope products="RDK S600">

In the Ubuntu 24.04 desktop, enable or disable the SSH service as follows:

1. Click the icon in the bottom-left corner and select RDK Configuration to enter system settings.

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-1.png" alt="S600 SSH operation diagram 1" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

2. Select `Interface Options`.

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-2.png" alt="S600 SSH operation diagram 2" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

3. Select `I1 SSH`.

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-3.png" alt="S600 SSH operation diagram 3" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

4. Enable SSH: select `Yes`.

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-4.png" alt="S600 SSH operation diagram 4" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-5.png" alt="S600 SSH operation diagram 5" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

5. Disable SSH: select `No`.

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-6.png" alt="S600 SSH operation diagram 6" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/S600-SSH-7.png" alt="S600 SSH operation diagram 7" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

</DocScope>

</TabItem>

<TabItem value="server" label="Server">

1. Run the `srpi-config` tool in the terminal:

```bash
sudo srpi-config
```
2. Select `Interface Options`.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/ssh-server-1.png" alt="srpi-config SSH configuration diagram 1" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

3. Select `I1 SSH`.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/ssh-server-2.png" alt="srpi-config SSH configuration diagram 2" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

4. Enable SSH: select `Yes`.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/ssh-server-3.png" alt="srpi-config SSH configuration diagram 3" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

5. Disable SSH: select `No`.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/ssh-server-5.png" alt="srpi-config SSH configuration diagram 4" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />


</TabItem>

</Tabs>

For SSH usage, see [Remote login - SSH login](./05_remote_login.md#ssh).

## Set the Login Mode

### Automatic Login on the Text Terminal

Modify the serial-getty service file to enable passwordless login. The steps are:

1. Open `serial-getty@ttyS0.service`.

```bash
# Log in as root
vi /usr/lib/systemd/system/serial-getty@ttyS0.service

# Log in as sunrise
sudo vi /usr/lib/systemd/system/serial-getty@ttyS0.service
```

2.  Modify the line containing `ExecStart=-/sbin/agetty` to (taking root automatic login as an example):

```text
ExecStart=-/sbin/agetty --autologin root -o '-p -- \\u' --keep-baud 921600,115200,57600,38400,9600 - $TERM
```

**Parameter explanation:** `--autologin root` specifies the username for automatic login (it can also be written as `-a root`).

3. After reboot, the user will be logged in automatically.

<!-- ### Automatic Login on the Graphical Terminal

To be updated -->

## Set the Chinese Locale

1. Install the language packages:

```bash
sudo apt install language-pack-zh-hans language-pack-zh-hans-base fonts-wqy-microhei
```

- `language-pack-zh-hans`: Chinese interface translation files.
- `language-pack-zh-hans-base`: base Chinese language support.
- `fonts-wqy-microhei`: Chinese fonts.

2. Edit the locale configuration file:

```bash
sudo vi /etc/default/locale
```

Add or modify the following content:

```text
LANG=zh_CN.UTF-8
LANGUAGE=zh_CN:zh
LC_ALL=zh_CN.UTF-8
```

3. Apply the configuration:

```bash
fc-cache -fv
source /etc/default/locale
```

## Set the Chinese Input Method

:::note
This section applies to the Desktop image. The Server image has no graphical desktop and does not involve input methods.
:::

IBus and Chinese input engines (such as libpinyin) are preinstalled, but no Chinese input method is added to the desktop input sources by default. You must add one before you can switch to it.

**Add a Chinese input source**

- GUI: open Settings → Keyboard → Input Sources, click +, and select Chinese (China) → Intelligent Pinyin to add it.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/input-1.png" alt="Chinese input method configuration diagram 1" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/input-2.png" alt="Chinese input method configuration diagram 2" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/input-3.png" alt="Chinese input method configuration diagram 3" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

- Command line (run in the desktop terminal as the current user):

```bash
gsettings set org.gnome.desktop.input-sources sources "[('xkb', 'us'), ('ibus', 'libpinyin')]"
```

:::warning
The command above overwrites the existing input source list. If you have customized other keyboard layouts, keep them in the list as well.
:::

After adding it, press `Super (Windows key)` + `Space` to switch between the Chinese and English input methods. Once switched to Chinese, you can type Chinese characters in the terminal, text editors, and other applications.


## Set up RDK Studio

RDK Studio is an intelligent-native desktop workbench for robotics development, integrating Moss conversation, project workspaces, device connection, remote development, flashing, local models, and on-board Agent in a single window.

For usage, see the [RDK Studio User Manual](https://developer.d-robotics.cc/rdk_studio_doc/category/1-product-intro).

## NoMachine Configuration

NoMachine does not provide an apt source. You need to obtain the `.deb` package from the official website.

Official download page: [NoMachine Download](https://downloads.nomachine.com/download/?id=30&platform=linux&distro=arm)

**Download the installation package**

On the official website, select the ARM64 package and click Download.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/image_s100_nomachine_dl.PNG" alt="NoMachine download diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block' }} />

**Install**

```bash
sudo apt update && sudo apt upgrade -y   # Update installed software
sudo dpkg -i nomachine_*_arm64.deb
```

**Configure and start**

1. Start the NoMachine service:

    ```bash
    sudo systemctl start nxserver
    ```

2. Enable NoMachine to start on boot:

    ```bash
    sudo systemctl enable nxserver
    ```

3. Enable EGL Capture (improves the remote desktop experience under specific display servers):

    ```bash
    sudo /etc/NX/nxserver --eglcapture yes
    ```

    This command takes effect after a reboot. You can verify it with the following command. An output of `EGL Capture has been enabled` means it has been written to the configuration:

    ```bash
    if [ -f "/usr/lib/systemd/user/org.gnome.Shell@wayland.service" ] && grep -q "nxpreload.sh" "/usr/lib/systemd/user/org.gnome.Shell@wayland.service" && [ -f "/usr/share/applications/org.gnome.Shell.desktop" ] && grep -q "nxpreload.sh" "/usr/share/applications/org.gnome.Shell.desktop" && [ -f "/usr/NX/etc/node.cfg" ] && grep -q "EnableEGLCapture 1" "/usr/NX/etc/node.cfg"; then echo "EGL Capture has been enabled"; else echo "Not enabled"; fi
    ```

4. Restart the NoMachine service:

    ```bash
    sudo systemctl restart nxserver
    ```

**Reboot**

Reboot the board.

:::warning
Due to NXServer configuration, connecting directly after completing the above steps results in a black screen. You must reboot the board before use.
:::

For NoMachine usage, see [Remote login - NoMachine login](./05_remote_login.md#nomachine-login).

## User Management

### Change the Username

Taking the rename of `sunrise` to `usertest` as an example. This operation must be performed as root or another administrator user, and must not be run from within the session of the user being renamed (`pkill` terminates all of that user's processes, including the current login session).

1. Terminate all processes of `sunrise` to avoid failures caused by busy resources:

```bash
sudo pkill -u sunrise
```

2. Rename the user and its primary group:

```bash
sudo usermod -l usertest sunrise
```

3. Migrate the home directory to `/home/usertest`:

```bash
sudo usermod -d /home/usertest -m usertest
```

4. Set the new user's password:

```bash
sudo passwd usertest
```

5. If desktop auto-login is enabled, update the username in the configuration accordingly. Otherwise, auto-login will still point to the now-nonexistent `sunrise` and fail:

- gdm (default desktop service): edit `/etc/gdm3/custom.conf` and change `AutomaticLogin = sunrise` to `AutomaticLogin = usertest`.
- lightdm (legacy desktop service, if used): edit `/etc/lightdm/lightdm.conf.d/22-hobot-autologin.conf` and change `autologin-user=sunrise` to `autologin-user=usertest`.

### Add a New User

Taking the new user `usertest` as an example. The supplementary groups specified by `-G` cover `sudo`, audio/video, and RDK hardware access (GPIO, I2C, VPU, JPU, IPU, VPS, etc.), giving the new user the same device access as `sunrise`:

```bash
sudo useradd -U -m -d /home/usertest -k /etc/skel/ -s /bin/bash -G disk,kmem,dialout,sudo,audio,video,render,i2c,lightdm,vpu,gdm,weston-launch,graphics,jpu,ipu,vps,misc,gpio usertest
sudo passwd usertest
sudo cp -aRf /etc/skel/. /home/usertest
sudo chown -R usertest:usertest /home/usertest
```

To enable auto-login for the new user, refer to the "Set the Login Mode" section above.

## FAQ

- **Wi-Fi scanning finds no network**: confirm the Wi-Fi module is installed (M.2 Key E interface) and use `nmcli device` to check the device status.
- **SSH connection refused**: run `sudo systemctl status ssh` to confirm the service status, and check the firewall with `sudo ufw status`.
- **Cannot log in to the desktop after switching the Chinese locale**: see [Desktop applications](../../08_FAQ/07_desktop_app.md).
- **NoMachine black screen**: you must reboot the board after completing the configuration for it to take effect.

## Related Documents

- [System flashing](./01_instruction.md)
- [System status](./03_system_status.md)
- [Remote login](05_remote_login.md)
- [Network configuration](../../02_System_configuration/01_network_config.md)
- [srpi-config tool configuration](../../02_System_configuration/04_srpi_config/01_overview.md)
- [Desktop applications](../../08_FAQ/07_desktop_app.md)
