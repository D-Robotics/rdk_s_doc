---
title: "2.14 用户与权限管理"
sidebar_position: 14
description: 用户/用户组、sudo、su 管理
---

# 2.14 用户与权限管理

RDK OS 默认提供两个账户，模式 2 产品化时常需新建专用用户、配置 sudo 与权限隔离。

## 默认账户

| 账户 | 用户名 | 密码 | 说明 |
|---|---|---|---|
| 普通用户 | `sunrise` | `sunrise` | uid 1000，已配 sudo 免密 |
| 超级用户 | `root` | `root` | 全权 |

板端实测（`id`、`/etc/passwd`）：

```text
$ whoami && id
root
uid=0(root) gid=0(root) groups=0(root)

$ grep "^sunrise:" /etc/passwd
sunrise:x:1000:1000::/home/sunrise:/bin/bash
```

`sunrise` 的 sudo 免密配置在 `/etc/sudoers.d/010_sunrise-nopasswd`。

## sudo / su

```bash
# 普通用户提权执行单条命令
sudo <命令>

# 切换到 root 的 shell
sudo -i          # 或 su -
```

:::tip
生产环境建议关闭默认密码登录、改用密钥，并按需收回 `sunrise` 的 sudo 免密（删 `/etc/sudoers.d/010_sunrise-nopasswd`，按需单独授权）。
:::

## 新建用户（模式 2 产品化）

```bash
# 新建用户 myapp，建主目录，加入 sudo 组
sudo useradd -m -s /bin/bash -G sudo myapp
sudo passwd myapp

# 删除用户
sudo userdel -r myapp
```

## 用户组管理

```bash
sudo groupadd <组名>            # 建组
sudo usermod -aG <组> <用户>     # 把用户加入组（追加，不踢出其他组）
groups <用户>                    # 查看用户所属组
```

常用组：`sudo`（提权）、`video`（视频/显示设备）、`dialout`（串口设备）、`plugdev`（热插拔设备）。

## 文件权限

```bash
chmod 755 <文件>        # rwxr-xr-x
chown <用户>:<组> <文件>  # 改属主属组
```

## 相关文档

- [RDK OS 介绍](./03_system_update/01_rdk_os_intro.md)
- [开机自启动配置](./06_self_start.md)
- [系统日志查看](./15_system_log.md)
