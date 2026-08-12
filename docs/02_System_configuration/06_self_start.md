---
title: "2.6 开机自启动配置"
sidebar_position: 6
description: 用 systemd unit / init.d / rc.local 配置开机自启
---

# 2.6 开机自启动配置

Ubuntu 系统添加开机自启动的方式有多种，推荐用 systemd 自定义服务（最规范），也支持传统的 init.d 脚本与 rc.local。

## 查看已启用的自启服务

```bash
systemctl list-unit-files --state=enabled --type=service
```

RDK S600 实测（部分）：

```text
accounts-daemon.service   enabled
apparmor.service           enabled
bluetooth.service          enabled
...
```

## 方法一：systemd 自定义服务（推荐）

1. 编写 unit 文件，例如 `/etc/systemd/system/myapp.service`：

   ```ini
   [Unit]
   Description=My Application
   After=network.target

   [Service]
   ExecStart=/path/to/your/program
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

2. 重载 systemd 并启用自启：

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable myapp        # 注册开机自启
   sudo systemctl start myapp         # 立即启动
   ```

3. 验证：

   ```bash
   systemctl status myapp
   # ● myapp.service - My Application
   #      Active: active (running) since ...
   ```

停止/禁用：`sudo systemctl stop myapp` / `sudo systemctl disable myapp`。

## 方法二：init.d 脚本（传统 SysV）

1. 在 `/etc/init.d` 下创建脚本（带 LSB 头）：

   ```bash
   #!/bin/bash
   ### BEGIN INIT INFO
   # Provides:          your_service_name
   # Required-Start:    $all
   # Default-Start:     2 3 4 5
   # Default-Stop:      0 1 6
   # Short-Description: Start your_service_name at boot time
   ### END INIT INFO
   /path/to/your/program &
   exit 0
   ```

2. 加可执行权限并注册：

   ```bash
   sudo chmod +x /etc/init.d/your_script_name
   sudo update-rc.d your_script_name defaults
   sudo systemctl enable your_script_name   # systemd 兼容启用
   ```

## 方法三：rc.local（遗留）

`rc.local` 是 systemd 兼容的遗留启动脚本，开机末尾执行。在 `/etc/rc.local` 末尾（`exit 0` 之前）加命令即可：

```bash
#!/bin/bash -e
# 在此插入需要开机执行的命令
exit 0
```

:::tip
新项目优先用 systemd unit（方法一），可管理依赖、重启策略、日志；init.d/rc.local 仅作兼容。
:::

## 相关文档

- [系统日志查看](./15_system_log.md)
- [用户与权限管理](./14_user_permission.md)
- [软件包管理 apt](./03_system_update/02_apt_usage.md)
- [RDK OS 介绍](./03_system_update/01_rdk_os_intro.md)
