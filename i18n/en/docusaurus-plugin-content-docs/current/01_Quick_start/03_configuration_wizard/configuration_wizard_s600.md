---
sidebar_position: 2
sidebar_products: RDK S600
---

# 1.3.2 Getting Started Configuration

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

## Default Login Accounts

Before configuring the system, you need to log in first. The RDK S600 system provides two default accounts:

- **Standard user:** username `sunrise`, password `sunrise`
- **Superuser (root):** username `root`, password `root`

## Connecting to Wi-Fi

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

Refer to the Ubuntu 24.04 Wi-Fi connection tutorial.

</TabItem>

<TabItem value="server" label="Server">

Connect via serial port or SSH, and refer to the following commands to complete the connection:

```bash
# Scan for Wi-Fi networks
sudo nmcli device wifi rescan
sudo nmcli device wifi list # List detected Wi-Fi networks
sudo wifi_connect "SSID" "PASSWD" # Connect to the specified Wi-Fi
```

After successfully executing the above commands, `successfully xxx` will appear. Use `ifconfig` to obtain the board's Wi-Fi IP address.

</TabItem>
</Tabs>

## Enabling SSH Service

The current system version has the SSH login service enabled by default. You can use the following methods to turn the SSH service on or off.

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

</TabItem>

<TabItem value="server" label="Server">

Use the `systemctl` command to check the current status of the SSH service, as follows:

```
sudo systemctl status ssh
```

After executing this command, detailed status information of the SSH service will be displayed. If the service is running, the output will show `Active: active (running)`; if it is not running, it will show `Active: inactive (dead)` or similar information.

The following are control commands for SSH:

```bash
sudo systemctl start ssh   # Start the SSH service
sudo systemctl stop ssh    # Stop the SSH service
sudo systemctl enable ssh  # Enable SSH service to start on boot
sudo systemctl disable ssh # Disable SSH service from starting on boot
sudo systemctl restart ssh # Restart the SSH service
```

</TabItem>
</Tabs>

For using SSH, please refer to [Remote Login - SSH Login](../remote_login#ssh).

## Setting Login Mode

### Automatic Login on Character Terminal

Modify the `serial-getty@ttyS0.service` file to set up password-less login as follows:

1. Open `serial-getty@ttyS0.service`

```bash
# Log in as root user
vim /usr/lib/systemd/system/serial-getty@ttyS0.service
# Log in as sunrise user
sudo vim /usr/lib/systemd/system/serial-getty@ttyS0.service
```

2. Change the line containing `ExecStart=-/sbin/agetty` to:

```
ExecStart=-/sbin/agetty -a root --keep-baud 921600,115200,38400,9600 %I $TERM
```

**Parameter explanation:** The `-a` parameter specifies the username for automatic login. `-o '-p -- \\u'` adds additional customization to the login process: preserves the current environment variables and displays the username in the login prompt.

3. After restarting, the user will be logged in automatically.

### Automatic Login on Graphical Terminal

To be updated.

## Setting Up Chinese Environment

1. Install the command packages:

```bash
sudo apt install language-pack-zh-hans language-pack-zh-hans-base fonts-wqy-microhei
```

- `language-pack-zh-hans`: Contains Chinese language translation files, allowing the system interface to display in Chinese.
- `language-pack-zh-hans-base`: Base language pack providing basic Chinese support.
- `fonts-wqy-microhei`: Installs Chinese fonts.

2. Open the terminal and enter the following command to open the language configuration file:

```bash
sudo vim /etc/default/locale
```

Add or modify the following content in the file:

```text
LANG=zh_CN.UTF-8
LANGUAGE=zh_CN:zh
LC_ALL=zh_CN.UTF-8
```

3. Execute the following command to update the configuration:

```bash
fc-cache -fv
source /etc/default/locale
```

## Setting Up Chinese Input Method

After setting up the Chinese environment, the system's built-in input method is supported by default. Press the `Super (Windows key)` + `Space` key combination to switch between different input methods.

## Setting Up RDK Studio

To be updated.

## NoMachine Configuration

`NoMachine` currently does not support `apt` download. You need to obtain the `deb` package from the official website.

Official NoMachine download URL: [NoMachine Download](https://downloads.nomachine.com/download/?id=30&platform=linux&distro=arm)

**Download the installation package**

After entering the official website, find the `ARM64` version of the installation package suitable for `RDK S600` and click `Download`.

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/configuration_wizard/image_s100_nomachine_dl.PNG" alt="image_s100_nomachine_dl" style={{ width: '100%' }} />

**Installation**

```shell
sudo apt update; sudo apt upgrade -y   // Ensure the current software is up to date
dpkg -i nomachine_*_arm64.deb
```

**Configuration and Startup**

1. Configure the server to allow remote connections:

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
    This command takes effect after a reboot. You can double-check with the following command; `EGL Capture has been enabled` indicates that the feature has been written to the configuration file.
    ```shell
    if [ -f "/usr/lib/systemd/user/org.gnome.Shell@wayland.service" ] && grep -q "nxpreload.sh" "/usr/lib/systemd/user/org.gnome.Shell@wayland.service" && [ -f "/usr/share/applications/org.gnome.Shell.desktop" ] && grep -q "nxpreload.sh" "/usr/share/applications/org.gnome.Shell.desktop" && [ -f "/usr/NX/etc/node.cfg" ] && grep -q "EnableEGLCapture 1" "/usr/NX/etc/node.cfg"; then echo "EGL Capture has been enabled"; else echo "Not enabled"; fi
    ```

4. Restart the `NoMachine` service:

    ```shell
    sudo systemctl restart nxserver
    ```

**Restart the S600**

Due to `NXServer` configuration issues, connecting directly after performing the above operations will result in a black screen. A reboot is required before use.

For using NoMachine, please refer to [Remote Login - NoMachine Login](../remote_login#nomachine-login).

## User Management

**Changing the username**

Using the new username `usertest` as an example:

```shell
# Terminate all processes of the sunrise user
sudo pkill -u sunrise
# Rename the sunrise user to usertest
sudo usermod -l usertest sunrise
# Change the user's home directory to /home/usertest
sudo usermod -d /home/usertest -m usertest
# Change the user password
sudo passwd usertest
```

Finally, update the automatically logged-in username for the desktop service:
  - gdm: RDK S100 default desktop service. Change `AutomaticLogin = sunrise` in the `/etc/gdm3/custom.conf` file to `AutomaticLogin = usertest`.
  - lighttdm: Change `autologin-user=sunrise` in the `/etc/lightdm/lightdm.conf.d/22-hobot-autologin.conf` file to `autologin-user=usertest`.

**Adding a new user**

Using the new user `usertest` as an example:

```shell
sudo useradd -U -m -d /home/usertest -k /etc/skel/ -s /bin/bash -G disk,kmem,dialout,sudo,audio,video,render,i2c,lightdm,vpu,gdm,weston-launch,graphics,jpu,ipu,vps,misc,gpio usertest
sudo passwd usertest
sudo cp -aRf /etc/skel/. /home/usertest
sudo chown -R usertest:usertest /home/usertest
```

You can also refer to the username change method to set the newly added user as the automatically logged-in user.