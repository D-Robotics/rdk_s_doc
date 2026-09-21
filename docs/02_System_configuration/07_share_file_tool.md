---
sidebar_position: 7
title: "共享文件配置"
description: "通过 Samba 或 NFS 把开发板作为服务端共享目录给 PC 客户端访问"
---

# 共享文件配置

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

在实际的开发过程中，开发板与 PC 之间经常需要互传文件。RDK OS 基于 Ubuntu，支持 Samba 和 NFS 两种网络共享协议。可实现对外共享目录供客户端访问：

| 协议 | 客户端 | 特点 |
|---|---|---|
| Samba（SMB/CIFS） | Windows / Linux / macOS | Windows 原生支持，体验最好，Windows PC 首选 |
| NFS | Linux / macOS / Windows（Client for NFS） | Linux 原生，适合 Linux PC/NAS；Windows 侧需额外启用客户端 |

:::info 前置条件
- 开发板已烧录 RDK OS 并联网，PC 与板在同一网段可达。默认 IP 与账号见 [网络配置](./01_network_config.md)（板端默认 IP `192.168.127.10`，默认账号 `sunrise`）。
- 能通过 SSH 登录开发板执行命令，见 [远程登录](../01_Quick_start/03_install_os_and_setup/05_remote_login.md)。
:::

## Samba

Samba 是 Windows/Linux/macOS 通用的文件共享协议。把开发板配成 Samba 服务端后，PC 可像访问网络邻居一样读写板端目录。

### 1. 安装 Samba

```bash
sudo apt update
sudo apt install samba
```

### 2. 创建共享目录

在 `/userdata` 分区下创建共享目录，并归属到 `sunrise`：

```bash
sudo mkdir -p /userdata/shared
sudo chown sunrise:sunrise /userdata/shared
```

### 3. 配置共享

打开 Samba 主配置文件 `/etc/samba/smb.conf`，在文件末尾追加：

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

字段说明：

- `[shared]`：共享名，客户端访问时看到的名称，可按需修改。
- `path`：共享目录的实际路径。这里用 `/userdata` 分区下的 `shared` 目录；如改用其他路径，同步修改此处。
- `read only = no`：允许客户端读写。
- `browsable = yes`：可在网络中被浏览到。
- `guest ok = no`：访问需用户名和密码，不允许匿名。
- `create mask` / `directory mask`：共享目录中新建文件和目录的默认权限。

### 4. 设置 Samba 用户和密码

Samba 使用独立的密码库，需把系统用户加入 Samba 用户列表并设密码：

```bash
sudo smbpasswd -a sunrise
```

按提示两次输入密码即完成。这里用默认账号 `sunrise`；如使用其他系统账号，替换为对应用户名。

### 5. 启动并设为开机自启

```bash
sudo systemctl enable --now smbd
```

`enable --now` 同时完成"设为开机自启"和"立即启动"。

### 6. （可选）放行防火墙

RDK OS 默认未安装防火墙（`ufw` 命令不存在），本步骤仅在自行启用了防火墙的环境下才需要：

```bash
sudo ufw allow samba
```

### 验证

```bash
sudo systemctl status smbd
```

成功标志：输出含 `Active: active (running)`。

<DocScope products="RDK S600">

RDK S600 实测：

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

RDK S100 实测：

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

服务端就绪后，在 PC 侧访问共享目录确认：

- **Windows**：打开资源管理器，地址栏输入 `\\192.168.127.10\shared`。

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20143720.png" alt="Windows 资源管理器访问 Samba 共享目录" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  在弹出的对话框中输入 Samba 用户名 `sunrise` 和第 4 步设置的密码。

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20152031.png" alt="Windows 输入 Samba 用户名和密码" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  如果能看到 `shared` 目录内容即配通。

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20153625.png" alt="成功访问 Samba 共享目录内容" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  在 `shared` 目录下创建一个测试文件 `pc_linux.txt`。

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20153726.png" alt="在 shared 目录创建测试文件 pc_linux.txt" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  在 RDK 系统中可以正常看到上一步 PC 端创建的文件：

  ```shell
  root@drobot:~# ls /userdata/shared/
  pc_linux.txt
  ```

## NFS

NFS（Network File System）是 Linux 原生的网络文件系统。把开发板配成 NFS 服务端，Linux PC/NAS 可直接挂载，Windows PC 需先启用 Client for NFS。

### 1. 安装 NFS 服务端

```bash
sudo apt update
sudo apt install nfs-kernel-server
```

### 2. 创建导出目录

在 `/userdata` 分区下创建导出目录，并归属到 `sunrise`：

```bash
sudo mkdir -p /userdata/nfs_export
sudo chown sunrise:sunrise /userdata/nfs_export
```

### 3. 配置导出

编辑 `/etc/exports`，在末尾追加一行（把 `192.168.127.0/24` 换成你的 PC 所在网段）：

```text
/userdata/nfs_export 192.168.127.0/24(rw,sync,no_subtree_check,all_squash,insecure,anonuid=1000,anongid=1000)
```

选项说明：

- `rw`：允许客户端读写。
- `sync`：同步写，数据落盘后再返回，更安全。
- `no_subtree_check`：不检查子树，常见优化项。
- `all_squash`：把所有客户端（含 Windows 匿名）身份压成匿名，再由 `anonuid`/`anongid` 映射到板端 `sunrise`。**Windows Client for NFS 默认匿名访问，必须加此项**，否则匿名客户端以 nobody 身份访问、无写权限。
- `insecure`：允许客户端从非特权端口连接。**Windows Client for NFS 必须加此项**，否则连接会被拒。
- `anonuid=1000,anongid=1000`：把被 `all_squash` 压成匿名的客户端映射到板端 `sunrise`（UID/GID 1000）。Windows 客户端默认匿名访问，经此映射后写入的文件在板端归属 `sunrise`，可正常读写。

### 4. 应用导出

```bash
sudo exportfs -ra
```

查看当前导出确认：

```bash
sudo exportfs -v
```

### 5. 启动并设为开机自启

```bash
sudo systemctl enable --now nfs-server
```

### 验证

```bash
sudo systemctl status nfs-server
```

成功标志：输出含 `Active: active (exited)`。

<DocScope products="RDK S600">

RDK S600 实测（nfs-kernel-server 2.6.4）：

```text
● nfs-server.service - NFS server and services
     Loaded: loaded (/usr/lib/systemd/system/nfs-server.service; enabled; preset: enabled)
     Active: active (exited) since Fri 2026-06-05 23:36:40 CST; 3 months 16 days ago
   Main PID: 4779 (code=exited, status=0/SUCCESS)
```

</DocScope>

<DocScope products="RDK S100">

RDK S100 实测（nfs-kernel-server 2.6.4）：

```text
● nfs-server.service - NFS server and services
     Loaded: loaded (/usr/lib/systemd/system/nfs-server.service; enabled; preset: enabled)
     Active: active (exited) since Fri 2026-06-05 23:39:36 CST; 3 months 16 days ago
   Main PID: 3398 (code=exited, status=0/SUCCESS)
```

</DocScope>

确认导出生效：

```bash
sudo exportfs -v
```

成功标志：输出列出 `/userdata/nfs_export` 及其选项，例如：

```text
/userdata/nfs_export
		192.168.127.0/24(sync,wdelay,hide,no_subtree_check,anonuid=1000,anongid=1000,sec=sys,rw,insecure,root_squash,all_squash)
```

服务端就绪后，在 PC 侧挂载确认：

- **Windows**：需先在"启用或关闭 Windows 功能"里勾选 **Client for NFS**。在widows中执行`Win + R` 输入 `control.exe`

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20171426.png" alt="启用 Client for NFS 功能" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  在弹出的对话框中找到 **选择程序和功能** 选项。

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/20260921-171703.jpg" alt="Client for NFS 功能启用确认" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  在弹出的对话框左侧边栏中点击 **启用或关闭Windows功能** 选项。

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/20260921-171750.jpg" alt="NFS 客户端操作截图 1" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  在弹出的对话框中找到 **NFS服务选项** 勾选 **NFS客户端** 和 **管理工具** 选项，然后点击确定。

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/20260921-171921.jpg" alt="NFS 客户端操作截图 2" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  然后以管理员权限运行 cmd 执行如下命令挂载：

  ```cmd
  mount -o anon \\192.168.127.10\userdata\nfs_export Z:
  ```
  提示**命令已成功完成** 表示挂载成功。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20172111.png" alt="NFS 客户端操作截图 3" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  打开windows资源管理器，可以在网络位置下面看到挂载的目录。

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202026-09-21%20172437.png" alt="NFS 客户端操作截图 4" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  挂载成功后，`Z:` 盘可读写板端 `/userdata/nfs_export` 目录。在 `Z:` 盘下创建一个测试文件 `pc_linux.txt`，回到开发板确认文件已同步：

  ```shell
  root@drobot:~# ls /userdata/nfs_export/
  pc_linux.txt
  ```

  用完卸载：`umount Z:`。

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/02_System_configuration/image/share_file_tool/20260921-194757.jpg" alt="卸载 NFS 挂载" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## 常见问题

### 客户端访问不了 Samba 共享

**原因**：`smbd` 未运行、Samba 用户/密码未配，或防火墙未放行。

**解决**：`systemctl status smbd` 确认服务运行；`sudo smbpasswd -a sunrise` 补建 Samba 用户；自行装了防火墙时 `sudo ufw allow samba` 放行。

### Samba 提示密码错误或权限拒绝

**原因**：Samba 密码库与系统登录密码相互独立，登录密码改过后未同步到 Samba。

**解决**：用 `sudo smbpasswd sunrise` 重设 Samba 密码（不是改系统密码）。

### NFS 客户端挂载失败：access denied 或 connection timed out

**原因**：导出网段不含客户端 IP，或缺少 `insecure` 选项（Windows 客户端常因此被拒）。

**解决**：确认 `/etc/exports` 网段含 PC 的 IP；Windows 客户端必须带 `insecure` 选项；改完执行 `sudo exportfs -ra` 重新应用。

### NFS 挂上了但写不进去（只读或 Permission denied）

**原因**：未设 `anonuid`/`anongid` 或映射的 UID 与板端用户不匹配，匿名客户端写入无权限。

**解决**：导出加 `anonuid=1000,anongid=1000`（映射到 `sunrise`），`sudo exportfs -ra` 重新应用；或让客户端以匹配的 UID 挂载。

## 相关文档

- 默认账号、默认 IP 与联网方式：[网络配置](./01_network_config.md)
- 登录开发板执行命令：[远程登录](../01_Quick_start/03_install_os_and_setup/05_remote_login.md)
- `/userdata` 等分区与持久化存储：[存储与磁盘管理](./12_storage.md)
