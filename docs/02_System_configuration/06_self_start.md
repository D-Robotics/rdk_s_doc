---
title: "开机自启动配置"
sidebar_position: 6
description: "用 systemd 服务 / rc.local / init.d 脚本配置开机自启"
---

# 开机自启动配置

:::doc_scope{products="RDK S100"}
RDK S100 出厂镜像基于 Ubuntu，采用 systemd 作为 init 系统。系统启动后，systemd 按既定流程逐级拉起各项服务。
:::

:::doc_scope{products="RDK S600"}
RDK S600 出厂镜像基于 Ubuntu，采用 systemd 作为 init 系统。系统启动后，systemd 按既定流程逐级拉起各项服务。
:::

本文提供了三种方法实现开机自启动配置，三种互不冲突，用户可按需选择。推荐使用 systemd 服务；简单场景可用 rc.local；从其他系统移植现成的 init.d 脚本可用 init.d 方法实现开机自启动配置。

## 方案选型

根据需求选择一种方法即可，三种方法互不冲突：

| 方法 | 适用场景 |
|-|-|
| 方法一：systemd 服务 | 需要失败自动重启、依赖其他服务就绪、独立日志管理 |
| 方法二：rc.local | 仅需开机时执行少量简单命令 |
| 方法三：init.d 脚本 | 从其他系统移植现成的 init.d 脚本 |

## 功能原理

### systemd

systemd 是现代 Ubuntu 的 **init 系统**，即内核加载完成后启动的首个用户态进程（PID 1），负责统一管理各系统服务。其最小管理单位为**单元（unit）**，`.service` 即其中描述一个服务的类型（此外还有 target、socket、timer 等类型）。

开机时 systemd 按 **target（目标）链**逐级拉起单元。target 为一组同时启动的单元集合，对应一个启动阶段：

```
sysinit.target → basic.target → multi-user.target → graphical.target
```

- `sysinit.target`：硬件、设备节点、文件系统等底层初始化；
- `basic.target`：基础系统服务就绪；
- `multi-user.target`：多用户文本模式就绪（含网络与登录服务）；
- `graphical.target`：图形界面登录就绪，依赖 `multi-user.target`。

实现开机自启的方法是编写 `.service` 单元，在其中声明启动命令（`ExecStart`）、启动顺序依赖（`After`）、失败重启策略（`Restart`）、运行用户（`User`）等字段，再以 `systemctl enable` 注册。`enable` 的实质是在对应 target 的 `.wants` 目录（如 `/etc/systemd/system/multi-user.target.wants/`）下创建符号链接；开机时 systemd 到达该 target 后遍历 `.wants` 中的链接并拉起相应服务。`.wants` 表示弱依赖——systemd 会尝试启动相应单元，但不强制等待其完成。

此外，systemd 会对所启动的进程实施监督：标准输出与错误写入系统日志（经 `journalctl` 查看），进程异常退出时按 `Restart` 策略自动重启。因此原生 unit 具备显式的依赖关系、可管理的重启策略与独立日志，是系统服务的标准形态，亦为新项目首选。

### init.d

init.d 源自 **SysV init**（传统 Unix System V init），早于 systemd 多年。其核心概念为**运行级（run level）**：以 0–6 七个数字标识系统运行状态（0 关机、1 单用户、2–5 多用户、6 重启），开机进入默认运行级后依次执行该级对应的启动脚本。

配置方式为：在 `/etc/init.d/` 下放置一个接受 `start`/`stop`/`restart` 参数的 shell 脚本，其头部以 **LSB 头**（Linux Standard Base Header，脚本顶部一段可被工具解析的元数据注释块，声明依赖与默认运行级）声明依赖与默认运行级；再由 `update-rc.d` 在 `/etc/rcN.d/`（N 为运行级）目录中建立符号链接：

- `S##name`：进入该运行级时启动（S = Start），`##` 为 00–99 两位序号，决定执行先后；
- `K##name`：离开该运行级时停止（K = Kill）。

开机进入默认运行级时，init 按序号升序依次执行全部 `S##` 脚本。

由于 RDK OS 已采用 systemd，其内置的 **`systemd-sysv-generator`** 会在开机时扫描 `/etc/init.d/`，为每个脚本生成同名 `.service`，将 LSB 头中的 `Required-Start` 转换为 unit 的 `After=`，并依据 `/etc/rcN.d/` 中的 `S##`/`K##` 软链决定是否开机启动。因此 init.d 在本系统上实质为 systemd 之上的**兼容层**：既有脚本可近乎原样复用，但缺乏自动重启、细粒度依赖与结构化日志等能力，仅适用于复用既有旧脚本。

### rc.local

rc.local 是 SysV 时代的另一遗留约定：系统启动末尾执行 `/etc/rc.local` 脚本，用于集中放置开机阶段需执行的零散命令。

systemd 下由内置的 **`systemd-rc-local-generator`** 处理：开机生成阶段，其检查 `/etc/rc.local` 是否存在且具备可执行权限，若是则生成 `rc-local.service`（`Type=forking`），安排在启动末尾执行该文件。其触发条件为 `ConditionFileIsExecutable`，即要求文件可执行；如果默认无可执行权限，须先执行 `chmod +x`，否则该服务在开机时被跳过。

此外，`Type=forking` 表示该脚本应自行 fork 出后台进程后退出，systemd 在初始进程退出后即判定启动完成。因此，若在 rc.local 中写入前台命令而未追加 `&`，该命令将持续占用启动流程并阻塞后续阶段；必须以 `&` 将命令置于后台。

rc.local 适合追加少量简单命令，但作为单一脚本，无独立服务管理、默认以 root 运行、无自动重启，不适用于承载正式服务。

---

三种机制最终均由 systemd 在开机时拉起；其中 systemd 服务依赖关系最显式、能力最完备，推荐优先采用。

## 配置方法

下文示例统一以程序路径 `/usr/bin/myapp` 演示，请替换为您的实际路径。程序需已部署且具备可执行权限（`chmod +x`）。

### 方法一：systemd 服务（推荐）

当你的程序需要**失败自动重启**、**在某个服务就绪后启动**、或**独立日志**时，建议优先选择使用原生 systemd 服务单元方式实现。这是系统服务采用的标准方式，依赖关系显式、最可靠。

**步骤 1：创建服务单元文件**

```bash
sudo vim /etc/systemd/system/myapp.service
```

```ini
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/myapp
Restart=on-failure
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
```

**`.service` 文件字段说明：**

| 段 | 字段 | 说明 |
|-|-|-|
| `[Unit]` | `Description` | 服务描述，供 `systemctl status` 等展示，无功能影响 |
| `[Unit]` | `After` | 声明启动顺序依赖；服务会在指定目标/服务之后再启动。可叠加多个，如 `After=network.target` |
| `[Service]` | `Type` | 启动类型，默认 `simple`（前台进程，`ExecStart` 启动的进程不退出即视为运行中） |
| `[Service]` | `ExecStart` | 启动命令，使用绝对路径（如 `/usr/bin/myapp`） |
| `[Service]` | `Restart` | 进程退出后的重启策略；`on-failure` 表示非零退出码才自动重启 |
| `[Service]` | `RestartSec` | 重启间隔秒数，如 `3` 表示退出后等待 3 秒再拉起 |
| `[Service]` | `User` | 运行该服务的用户；不需要 root 时改用非特权用户（如 `sunrise`）以降低风险 |
| `[Install]` | `WantedBy` | `systemctl enable` 时挂入的目标；`multi-user.target` 对应多用户运行级（开机自启） |

:::tip
**安全提示：** 不需要 root 权限的程序，请改用非特权用户（如 `User=sunrise`）以降低风险。修改 `.service` 后务必执行 `sudo systemctl daemon-reload`。需要程序崩溃自动拉起加 `Restart=on-failure`；需要指定工作目录加 `WorkingDirectory=/app`。
:::

**步骤 2：重载配置并启用服务**

```bash
sudo systemctl daemon-reload
sudo systemctl enable myapp.service
sudo systemctl start myapp.service
```

**步骤 3：重启并验证**

### 方法二：rc.local

系统出厂自带 `/etc/rc.local`，开机时由 `rc-local.service` 执行。但出厂该文件默认**没有可执行权限**，而 `rc-local.service` 的触发条件是"文件可执行"——**因此必须先加可执行权限，否则开机不会执行**。

**步骤 1：编辑 rc.local**

```bash
sudo vim /etc/rc.local
```

**步骤 2：在 `exit 0` 之前插入启动命令**

```bash
#!/bin/bash -e
#
# rc.local - 开机自动执行
# By default this script does nothing.

# 在此插入你的启动命令
/usr/bin/myapp &

exit 0
```

:::warning
命令必须写在 `exit 0` **之前**；`rc-local.service` 为 `Type=forking`，前台命令不加 `&` 会阻塞开机流程。
:::

**步骤 3：赋予可执行权限（必须）**

```bash
sudo chmod +x /etc/rc.local
```

:::tip
**此步骤不可省略。** 出厂 `/etc/rc.local` 默认权限为 `644`（不可执行），`rc-local.service` 的 `ConditionFileIsExecutable` 条件不满足时会在开机时被跳过。可用 `ls -l /etc/rc.local` 确认权限含 `x`。
:::

**步骤 4：重启并验证**

### 方法三：init.d 脚本

此为传统 SysV 方式，适用于从旧版脚本迁移。新项目建议使用方法一。

**步骤 1：创建 LSB 风格 init 脚本**

```bash
sudo vim /etc/init.d/myapp
```

```bash
#!/bin/bash
### BEGIN INIT INFO
# Provides:          myapp
# Required-Start:    $all
# Required-Stop:
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start myapp at boot time
### END INIT INFO

case "$1" in
  start)
    echo "Starting myapp"
    /usr/bin/myapp &
    ;;
  stop)
    killall myapp
    ;;
  restart)
    $0 stop
    $0 start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
esac
exit 0
```

**步骤 2：赋权并注册开机启动**

```bash
sudo chmod +x /etc/init.d/myapp
sudo update-rc.d myapp defaults
```

**步骤 3：重启并验证**

## 验证

配置完成后，重启开发板确认开机自启生效：

```bash
sudo reboot
```

重启后按方法选择验证命令：

| 方法 | 验证命令 | 成功标志 |
|-|-|-|
| 方法一 | `systemctl is-active myapp.service` | 输出 active |
| 方法二 | `pgrep -af myapp`<br/>`systemctl is-active rc-local` | 进程在运行；rc-local 为 active |
| 方法三 | `systemctl is-active myapp.service` | 输出 active |

## 取消自启动

调试或更换程序时，按下表撤销对应方法的开机自启：

| 方法 | 取消方式 |
|-|-|
| 方法一：systemd 服务 | `sudo systemctl disable --now myapp.service`；<br/>删除 `/etc/systemd/system/myapp.service`；<br/>`sudo systemctl daemon-reload` |
| 方法二：rc.local | 删除 `/etc/rc.local` 中你添加的行（可执行权限可保留） |
| 方法三：init.d 脚本 | `sudo update-rc.d -f myapp remove`；<br/>删除 `/etc/init.d/myapp` |

## 常见错误排查清单

| 现象 | 排查方法 |
|-|-|
| 开机后程序没运行 | `systemctl status myapp.service` 查状态与错误码；`journalctl -u myapp.service -b` 查日志 |
| rc.local 没执行 | `ls -l /etc/rc.local` 确认权限含 `x`；若无，执行 `sudo chmod +x /etc/rc.local`；`journalctl -u rc-local.service -b` 看日志 |
| 命令找不到 / 找不到库 | 在服务单元里用 `Environment=PATH=...` 指定，或在脚本里用绝对路径；程序依赖的库需放在系统路径或 `/app/lib` 下 |
| 改了 .service 不生效 | 每次修改 service 文件后必须执行 `sudo systemctl daemon-reload` |
| 启动顺序不对 / 硬件未就绪 | 用 `After=` 显式声明依赖（如 `hobot-loadko.service` 内核模块加载完成）；详见方法一 `.service` 文件字段说明 |
| 程序以 root 运行有安全顾虑 | 在 `[Service]` 段改用 `User=<非特权用户>`，避免不必要的 root 权限 |

## 相关文档

- [系统日志查看](./15_system_log.md)
- [用户与权限管理](./14_user_permission.md)
- [软件包管理 apt](./03_system_update/02_apt_usage.md)
