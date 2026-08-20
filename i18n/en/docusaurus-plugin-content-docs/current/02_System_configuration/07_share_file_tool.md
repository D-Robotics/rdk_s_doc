---
sidebar_position: 7
title: "Shared File Configuration"
description: "Samba and NFS shared file configuration"
---

# Shared File Configuration

This chapter describes how to use sharing tools on the Ubuntu system.



## Samba

### Installation Command

```bash
sudo apt install samba
```

### Configure Samba

1. Create a shared directory. Create a directory named shared under the user home directory as the shared directory, and run the following command:

```bash
mkdir ~/shared
```

2. Configure the Samba share. Open the Samba main configuration file `/etc/samba/smb.conf`, and append the following content at the end of the file to define the configuration of the shared directory:

   ```ini
   [shared]
      comment = Shared Directory
      path = /home/your_username/shared
      read only = no
      browsable = yes
      guest ok = no
      create mask = 0775
      directory mask = 0775
   ```

   Syntax description:

   - `[shared]`: The share name, i.e., the name that clients see when accessing the shared resource. Modify it as needed.
   - `comment`: The description of the shared directory.
   - `path`: The actual path of the shared directory. Replace `your_username` with your own username.
   - `read only = no`: Allow clients to read from and write to the shared directory.
   - `browsable = yes`: The shared directory can be browsed on the network.
   - `guest ok = no`: A username and password are required to access the shared directory.
   - `create mask` / `directory mask`: The default permissions when creating files and directories in the shared directory.

3. Set up the Samba user and password

To be able to access the shared directory, you need to create a Samba user and set a password. You can use an existing system user as the Samba user. Run the following command to add the system user to the Samba user list:
```bash
sudo smbpasswd -a sunrise
```

4. Restart the Samba service

```bash
sudo systemctl restart smbd
```

You can use the following command to check the running status of the Samba service:

```bash
sudo systemctl status smbd
```

Measured on RDK S600 (Samba 4.19.5):

```text
● smbd.service - Samba SMB Daemon
     Loaded: loaded (/usr/lib/systemd/system/smbd.service; enabled; preset: enabled)
     Active: active (running) since Fri 2026-08-14 00:25:07 CST; 18h ago
     Status: "smbd: ready to serve connections..."
```

`Active: active (running)` indicates that the Samba service is running properly.

5. Configure the firewall (optional)

If a firewall (such as ufw) is enabled on the system, you need to open the Samba-related ports so that other devices can access the shared directory:

```bash
sudo ufw allow samba
```

:::info
RDK OS does not have ufw installed by default (the `ufw` command does not exist on the board). This step is only needed in environments with a firewall.
:::



## NFS

NFS (Network File System) is a network file system. NFS adopts the classic client-server (C/S) architecture. The server is responsible for managing and storing the shared files and directories, while clients access these resources through network requests.

This chapter provides a tutorial on using Ubuntu 22.04/24.04 as an NFS client.

**Prerequisites:** An NFS service has been set up.


1. Install the NFS client software

```bash
sudo apt install nfs-common
```

2. Create a mount point

Create a local directory on the Ubuntu system as the mount point, used to mount the Windows NFS shared directory, for example:

```bash
sudo mkdir -p /userdata/windows_nfs_share
```

3. Mount the NFS shared directory

Use the following command to mount the Windows NFS shared directory to the mount point on Ubuntu. Assume the IP address of the Windows server is 192.168.127.11 and the shared directory is D:\NFSShare:

```bash
sudo mount -v -t nfs -o vers=3,proto=tcp 192.168.127.11:/D/NFSShare /userdata/windows_nfs_share

Explanation:
-v       : verbose, shows the detailed mount process
-t nfs   : specifies the file system type as NFS
-o       : specifies mount options
vers=3   : uses the NFSv3 protocol
proto=tcp: uses TCP transport
```

4. Verify the mount

Run the following command to check whether the mount succeeded:
```bash
mount | grep windows_nfs_share
```

If you see in the output that 192.168.127.11:/D:/NFSShare is mounted on /userdata/windows_nfs_share, the mount succeeded.

5. Set up automatic mounting at boot (optional)

To make Ubuntu automatically mount the NFS shared directory at every boot, you can run the following commands:

   - Create the mount service

      ```
      cat > /etc/systemd/system/mount-windows-nfs.service << 'EOF'
      [Unit]
      Description=Mount Windows NFS Share
      After=network-online.target
      Wants=network-online.target

      [Service]
      Type=oneshot
      RemainAfterExit=yes
      ExecStartPre=/bin/sleep 10
      ExecStart=/bin/mount -t nfs -o vers=3,proto=tcp 192.168.127.11:/D/NFSShare /userdata/windows_nfs_share
      ExecStop=/bin/umount /userdata/windows_nfs_share

      [Install]
      WantedBy=multi-user.target
      EOF
      ```

   - Start the service

      ```bash
      # Reload the systemd configuration files
      systemctl daemon-reload

      # Set up automatic start at boot
      systemctl enable mount-windows-nfs.service

      # Start the service immediately
      systemctl start mount-windows-nfs.service
      ```

   - Save and exit the editor.

## Related Documents

- [Network Configuration](./01_network_config.md)
- [Remote Login](../01_Quick_start/03_install_os_and_setup/remote_login.md)
- [Storage and Disk Management](./12_storage.md)
