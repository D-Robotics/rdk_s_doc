---
title: "用户与权限管理"
sidebar_position: 14
description: "用户/用户组、sudo、su 管理"
---

# 用户与权限管理

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

## 验证

- 当前身份：`whoami`/`id` 查看当前用户与 uid。
- 用户存在：`grep "^sunrise:" /etc/passwd` 能查到默认用户；新建用户后 `grep "^myapp:" /etc/passwd` 能查到。
- 组成员与权限：`groups <用户>` 查看所属组；`ls -l <文件>` 查看权限与属主。

## 常见问题

### 普通用户执行命令提示 permission denied

**原因**：文件/目录权限不足，或用户不在对应组（如 `dialout` 访问串口、`video` 访问显示设备）。

**解决**：用 `sudo` 提权，或 `sudo usermod -aG <组> <用户>` 加入对应组后重新登录。

### sudo 需要密码或无法提权

**原因**：sudoers 未授权该用户免密，或免密配置被删除。

**解决**：`sunrise` 默认免密（`/etc/sudoers.d/010_sunrise-nopasswd`）；新建用户加入 `sudo` 组并用 `visudo` 按需授权。

### 加组后用户被踢出其它组

**原因**：误用 `usermod -G`（覆盖）而非 `-aG`（追加）。

**解决**：追加组用 `sudo usermod -aG <组> <用户>`，保留原组。

## 相关文档

- [开机自启动配置](./06_self_start.md)
- [系统日志查看](./15_system_log.md)
