---
sidebar_position: 7
title: "Shared File Configuration"
description: "Share a directory from the board as a Samba or NFS server for PC clients to access"
---

# Shared File Configuration

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

In practice, files often need to be transferred between the board and a PC. RDK OS is based on Ubuntu and supports two network sharing protocols, Samba and NFS, which can share directories out for clients to access:

| Protocol | Client | Notes |
|---|---|---|
| Samba (SMB/CIFS) | Windows / Linux / macOS | Native to Windows, best experience; first choice for Windows PCs |
| NFS | Linux / macOS / Windows (Client for NFS) | Native to Linux, suited to Linux PCs/NAS; Windows requires enabling the client |

:::info Prerequisites
- The board has RDK OS flashed and is networked, and the PC can reach the board on the same subnet. For the default IP and account, see [Network Configuration](./01_network_config.md) (board default IP `192.168.127.10`, default account `sunrise`).
- You can log in to the board over SSH to run commands, see [Remote Login](../01_Quick_start/03_install_os_and_setup/05_remote_login.md).
:::

## Samba: the board as a server

Samba is a file-sharing protocol common to Windows/Linux/macOS. Once the board is configured as a Samba server, a PC can read and write a board-side directory like a network share; a Windows PC needs no extra software.

### 1. Install Samba

```bash
sudo apt update
sudo apt install samba
```

### 2. Create the shared directory

Create the shared directory under the persistent `/userdata` partition and assign it to `sunrise`:

```bash
sudo mkdir -p /userdata/shared
sudo chown sunrise:sunrise /userdata/shared
```

### 3. Configure the share

Open the Samba main configuration file `/etc/samba/smb.conf` and append the following at the end:

```ini
[shared]
   comment = Shared Directory
   path = /userdata/shared
   read only = no
   browsable = yes
   guest ok = no
   create mask = 0775
   directory mask = 0775
```

Field descriptions:

- `[shared]`: the share name, as seen by clients. Modify as needed.
- `path`: the actual path of the shared directory. This uses the `shared` directory under the `/userdata` partition; if you use a different path, update this accordingly.
- `read only = no`: allow clients to read and write.
- `browsable = yes`: the share can be discovered when browsing the network.
- `guest ok = no`: access requires a username and password; anonymous access is not allowed.
- `create mask` / `directory mask`: default permissions for new files and directories created inside the share.

### 4. Set the Samba user and password

Samba uses a separate password database. You must add the system user to the Samba user list and set a password:

```bash
sudo smbpasswd -a sunrise
```

Enter the password twice when prompted. This uses the default account `sunrise`; to use another system account, replace the username accordingly.

### 5. Start and enable at boot

```bash
sudo systemctl enable --now smbd
```

`enable --now` both sets the service to start at boot and starts it immediately.

### 6. (Optional) Open the firewall

RDK OS does not ship with a firewall by default (the `ufw` command is not present). This step is only needed if you have enabled a firewall yourself:

```bash
sudo ufw allow samba
```

### Verification

```bash
sudo systemctl status smbd
```

Success indicator: the output contains `Active: active (running)`.

<DocScope products="RDK S600">

Verified on RDK S600 (Samba 4.19.5):

```text
● smbd.service - Samba SMB Daemon
     Loaded: loaded (/usr/lib/systemd/system/smbd.service; enabled; preset: enabled)
     Active: active (running) since Mon 2026-09-21 13:02:50 CST; 16ms ago
       Docs: man:smbd(8)
             man:samba(7)
             man:smb.conf(5)
    Process: 15015 ExecCondition=/usr/share/samba/is-configured smb (code=exited, status=0/SUCCESS)
   Main PID: 15018 (smbd)
     Status: "smbd: ready to serve connections..."
      Tasks: 3 (limit: 17033)
     Memory: 31.3M ()
     CGroup: /system.slice/smbd.service
             ├─15018 /usr/sbin/smbd --foreground --no-process-group
             ├─15021 "smbd: notifyd" .
             └─15022 "smbd: cleanupd "
```

</DocScope>

<DocScope products="RDK S100">

Verified on RDK S100 (Samba 4.19.5):

```text
● smbd.service - Samba SMB Daemon
     Loaded: loaded (/usr/lib/systemd/system/smbd.service; enabled; preset: enabled)
     Active: active (running) since Mon 2026-09-21 13:02:50 CST; 21ms ago
       Docs: man:smbd(8)
             man:samba(7)
             man:smb.conf(5)
    Process: 24916 ExecCondition=/usr/share/samba/is-configured smb (code=exited, status=0/SUCCESS)
   Main PID: 24919 (smbd)
     Status: "smbd: ready to serve connections..."
      Tasks: 3 (limit: 2861)
     Memory: 27.8M ()
     CGroup: /system.slice/smbd.service
             ├─24919 /usr/sbin/smbd --foreground --no-process-group
             ├─24923 "smbd: notifyd" .
             └─24924 "smbd: cleanupd "
```

</DocScope>

Once the server is ready, confirm from the PC:

- **Windows**: open File Explorer, enter `\\192.168.127.10\shared` in the address bar.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20143720.png" alt="Windows File Explorer accessing the Samba share" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  Press Enter and provide the Samba username `sunrise` and the password set in step 4.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20152031.png" alt="Windows entering the Samba username and password" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  Seeing the contents of the `shared` directory means it is configured correctly.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20153625.png" alt="Successfully accessing the Samba share contents" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  Create a test file `pc_linux.txt` in the `shared` directory.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20153726.png" alt="Creating a test file pc_linux.txt in the shared directory" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  The file created on the PC in the previous step is visible from RDK OS:

  ```shell
  root@drobot:~# ls /userdata/shared/
  pc_linux.txt
  ```

## NFS: the board as a server

NFS (Network File System) is a Linux-native network filesystem. With the board configured as an NFS server, a Linux PC/NAS can mount it directly; a Windows PC must first enable Client for NFS.

### 1. Install the NFS server

```bash
sudo apt update
sudo apt install nfs-kernel-server
```

### 2. Create the export directory

Create the export directory under the persistent `/userdata` partition and assign it to `sunrise`:

```bash
sudo mkdir -p /userdata/nfs_export
sudo chown sunrise:sunrise /userdata/nfs_export
```

### 3. Configure the export

Edit `/etc/exports` and append one line at the end (replace `192.168.127.0/24` with your PC's subnet):

```text
/userdata/nfs_export 192.168.127.0/24(rw,sync,no_subtree_check,all_squash,insecure,anonuid=1000,anongid=1000)
```

Option descriptions:

- `rw`: allow clients to read and write.
- `sync`: synchronous writes; data is flushed to disk before returning, safer.
- `no_subtree_check`: skip subtree checking, a common optimization.
- `all_squash`: squash all clients (including anonymous Windows) to the anonymous identity, then map to the board-side `sunrise` via `anonuid`/`anongid`. **Required for Windows Client for NFS**, which accesses anonymously by default; without it the anonymous client appears as nobody and cannot write.
- `insecure`: allow clients to connect from non-privileged ports. **Required for Windows Client for NFS**; without it the connection is refused.
- `anonuid=1000,anongid=1000`: map clients squashed to anonymous by `all_squash` to the board-side `sunrise` (UID/GID 1000). Windows clients access anonymously by default; mapped this way, files written from Windows are owned by `sunrise` on the board and can be read and written normally.

### 4. Apply the export

```bash
sudo exportfs -ra
```

Confirm the current exports:

```bash
sudo exportfs -v
```

### 5. Start and enable at boot

```bash
sudo systemctl enable --now nfs-server
```

### Verification

```bash
sudo systemctl status nfs-server
```

Success indicator: the output contains `Active: active (exited)`. The NFS server is a oneshot service that starts the kernel `nfsd`; `active (exited)` is normal and differs from `smbd`'s `active (running)` — it does not mean the service is not running.

<DocScope products="RDK S600">

Verified on RDK S600 (nfs-kernel-server 2.6.4):

```text
● nfs-server.service - NFS server and services
     Loaded: loaded (/usr/lib/systemd/system/nfs-server.service; enabled; preset: enabled)
     Active: active (exited) since Fri 2026-06-05 23:36:40 CST; 3 months 16 days ago
   Main PID: 4779 (code=exited, status=0/SUCCESS)
```

</DocScope>

<DocScope products="RDK S100">

Verified on RDK S100 (nfs-kernel-server 2.6.4):

```text
● nfs-server.service - NFS server and services
     Loaded: loaded (/usr/lib/systemd/system/nfs-server.service; enabled; preset: enabled)
     Active: active (exited) since Fri 2026-06-05 23:39:36 CST; 3 months 16 days ago
   Main PID: 3398 (code=exited, status=0/SUCCESS)
```

</DocScope>

Confirm the export is active:

```bash
sudo exportfs -v
```

Success indicator: the output lists `/userdata/nfs_export` and its options, for example:

```text
/userdata/nfs_export
		192.168.127.0/24(sync,wdelay,hide,no_subtree_check,anonuid=1000,anongid=1000,sec=sys,rw,insecure,root_squash,all_squash)
```

Once the server is ready, mount from the PC to confirm:

- **Windows**: first enable **Client for NFS** under "Turn Windows features on or off". In Windows, press `Win + R` and enter `control.exe`.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20171426.png" alt="Enabling the Client for NFS feature" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  In the dialog that opens, find the **Programs and Features** option.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/20260921-171703.jpg" alt="Client for NFS feature enabled" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  In the left sidebar of the dialog, click **Turn Windows features on or off**.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/20260921-171750.jpg" alt="NFS client step 1" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  In the dialog, find the **Services for NFS** option, check **Client for NFS** and **Administrative Tools**, then click OK.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/20260921-171921.jpg" alt="NFS client step 2" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  Then run cmd as an administrator and mount with:

  ```cmd
  mount -o anon \\192.168.127.10\userdata\nfs_export Z:
  ```
  A "**The command completed successfully**" message means the mount succeeded.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20172111.png" alt="NFS client step 3" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  Open Windows File Explorer; the mounted directory appears under Network locations.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20172437.png" alt="NFS client step 4" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  Once mounted, the `Z:` drive can read and write the board's `/userdata/nfs_export` directory. Create a test file `pc_linux.txt` on the `Z:` drive, then back on the board confirm the file has synced:

  ```shell
  root@drobot:~# ls /userdata/nfs_export/
  pc_linux.txt
  ```

  Unmount when done: `umount Z:`.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/20260921-194757.jpg" alt="Unmounting the NFS mount" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## FAQ

### The client cannot access the Samba share

**Cause**: `smbd` is not running, the Samba user or password was not configured, or the firewall is blocking it.

**Solution**: run `systemctl status smbd` to confirm the service is running; run `sudo smbpasswd -a sunrise` to create the Samba user; if you installed a firewall yourself, run `sudo ufw allow samba`.

### Samba reports a wrong password or permission denied

**Cause**: the Samba password database is independent of the system login password; if the login password was changed, it was not synced to Samba.

**Solution**: reset the Samba password with `sudo smbpasswd sunrise` (not the system password).

### NFS client mount fails: access denied or connection timed out

**Cause**: the export subnet does not include the client IP, or the `insecure` option is missing (Windows clients are often rejected for this reason).

**Solution**: confirm the `/etc/exports` subnet includes the PC's IP; for Windows clients the `insecure` option is required; after changes run `sudo exportfs -ra` to re-apply.

### NFS mounts but is read-only or writes get Permission denied

**Cause**: `anonuid`/`anongid` are not set or the mapped UID does not match a board-side user, so anonymous client writes have no permission.

**Solution**: add `anonuid=1000,anongid=1000` to the export (mapping to `sunrise`), run `sudo exportfs -ra` to re-apply; or have the client mount with a matching UID.

## Related documents

- Default account, default IP, and networking: [Network Configuration](./01_network_config.md)
- Logging in to the board to run commands: [Remote Login](../01_Quick_start/03_install_os_and_setup/05_remote_login.md)
- The `/userdata` partition and persistent storage: [Storage and Disk Management](./12_storage.md)
