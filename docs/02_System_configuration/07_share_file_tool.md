---
sidebar_position: 7
title: "共享文件配置"
description: "Samba 与 NFS 共享文件配置"
---

# 共享文件配置

本章节介绍在 Ubuntu 系统内共享工具的使用说明。



## Samba

### 安装命令

```bash
sudo apt install samba
```

### 配置 Samba

1. 创建共享目录，在用户主目录下创建一个名为 shared 的目录作为共享目录，执行以下命令：

```bash
mkdir ~/shared
```

2. 配置 Samba 共享，打开 Samba 的主配置文件 `/etc/samba/smb.conf`，在文件末尾添加以下内容来定义共享目录的配置：

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

   语法说明：

   - `[shared]`：共享名称，客户端访问共享资源时看到的名称，可按需修改。
   - `comment`：共享目录的描述信息。
   - `path`：共享目录的实际路径，请把 `your_username` 替换为你自己的用户名。
   - `read only = no`：允许客户端对共享目录读写。
   - `browsable = yes`：共享目录可在网络中被浏览到。
   - `guest ok = no`：访问共享目录需要用户名和密码。
   - `create mask` / `directory mask`：在共享目录中创建文件和目录时的默认权限。

3. 设置 Samba 用户和密码

为了能够访问共享目录，需要创建一个 Samba 用户并设置密码。我们可以使用系统已有的用户作为 Samba 用户，执行以下命令将系统用户添加到 Samba 用户列表中：
```bash
sudo smbpasswd -a sunrise
```

4. 重启 Samba 服务

```bash
sudo systemctl restart smbd
```

可以使用以下命令检查 Samba 服务的运行状态：

```bash
sudo systemctl status smbd
```

RDK S600 实测（Samba 4.19.5）：

```text
● smbd.service - Samba SMB Daemon
     Loaded: loaded (/usr/lib/systemd/system/smbd.service; enabled; preset: enabled)
     Active: active (running) since Fri 2026-08-14 00:25:07 CST; 18h ago
     Status: "smbd: ready to serve connections..."
```

`Active: active (running)` 即表示 Samba 服务正常运行。

5. 配置防火墙（可选）

如果系统启用了防火墙（如 ufw），需要开放 Samba 相关的端口，以便其他设备能够访问共享目录：

```bash
sudo ufw allow samba
```

:::info
RDK OS 默认未安装 ufw（板端 `ufw` 命令不存在），本步骤仅在有防火墙的环境下才需要。
:::



## NFS

NFS（Network File System）即网络文件系统，NFS 采用经典的客户端 - 服务器（C/S）架构。服务器负责管理和存储共享的文件与目录，客户端则通过网络请求访问这些资源。

本章节介绍 Ubuntu 22.04/24.04 作为 NFS 客户端使用的教程

**使用前提：** 已搭建好 NFS 服务


1. 安装 NFS 客户端软件

```bash
sudo apt install nfs-common
```

2. 创建挂载点

在 Ubuntu 系统中创建一个本地目录作为挂载点，用于挂载 Windows 的 NFS 共享目录，例如：

```bash
sudo mkdir -p /userdata/windows_nfs_share
```

3. 挂载 NFS 共享目录

使用以下命令将 Windows 的 NFS 共享目录挂载到 Ubuntu 的挂载点，假设 Windows 服务器的 IP 地址是 192.168.127.11，共享目录是 D:\NFSShare：

```bash
sudo mount -v -t nfs -o vers=3,proto=tcp 192.168.127.11:/D/NFSShare /userdata/windows_nfs_share

解析：
-v       ：verbose，显示详细挂载过程
-t nfs   ：指定文件系统类型为 NFS
-o       ：指定挂载选项
vers=3   ：使用 NFSv3 协议
proto=tcp：使用 TCP 传输
```

4. 验证挂载

执行以下命令查看是否成功挂载：
```bash
mount | grep windows_nfs_share
```

如果在输出中看到 192.168.127.11:/D:/NFSShare 被挂载到 /userdata/windows_nfs_share，则表示挂载成功。

5. 设置开机自动挂载(可选)

为了使 Ubuntu 在每次开机时自动挂载 NFS 共享目录，可以执行下面命令：

   - 创建挂载服务

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

   - 启动服务

      ```bash
      # 重新加载 systemd 配置文件
      systemctl daemon-reload

      # 设置开机自动启动
      systemctl enable mount-windows-nfs.service

      # 立即启动服务
      systemctl start mount-windows-nfs.service
      ```

   - 保存并退出编辑器。

## 相关文档

- [网络配置](./01_network_config.md)
- [远程登录](../01_Quick_start/03_install_os_and_setup/05_remote_login.md)
- [存储与磁盘管理](./12_storage.md)
