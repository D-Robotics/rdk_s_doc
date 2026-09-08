---
title: "软件包管理 apt"
sidebar_position: 1
description: "RDK OS 上 apt 软件包查询、安装、升级、卸载"
---

# 软件包管理 apt

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

RDK OS 基于 Ubuntu，用 `apt` 管理软件包。系统已配置 D-Robotics 官方 apt 源（提供 RDK 专属包如 `hobot-dnn`、`hobot-camera`）、Ubuntu 官方源和 ROS2 源。用户可用 `apt` 安装常用工具，也可基于 `apt` 与配置层做产品化集成。

## 软件包源

RDK OS 预置了三类软件源：D-Robotics 专属源、Ubuntu 源和 ROS2 源：

<DocScope products="RDK S600">

```text
http://archive.d-robotics.cc/ubuntu-rdk-s600-beta noble main
http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports noble main universe multiverse
http://mirrors4.tuna.tsinghua.edu.cn/ros2/ubuntu noble main
```

</DocScope>

<DocScope products="RDK S100">

```text
http://archive.d-robotics.cc/ubuntu-rdk-s100-beta jammy main
http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports jammy main universe multiverse
http://mirrors4.tuna.tsinghua.edu.cn/ros2/ubuntu jammy main
```

</DocScope>

- **D-Robotics 专属源**（`archive.d-robotics.cc/ubuntu-rdk-s600-beta` / `ubuntu-rdk-s100-beta`）：提供 RDK 专属包（`hobot-*` 系列）和 tros.b 机器人中间件（`tros-*` 系列，不随镜像预装）。
- **Ubuntu 源**（`mirrors.tuna.tsinghua.edu.cn/ubuntu-ports`，清华镜像）：提供通用 Ubuntu 包。
- **ROS2 源**（`mirrors4.tuna.tsinghua.edu.cn/ros2/ubuntu`）：提供 ROS2 软件包（`ros-*`），是 tros.b 的运行依赖，不随镜像预装，需要时通过 `apt install` 下载安装。

## 常用命令

### 查询

```bash
# 列出已安装包
apt list --installed

# 搜索包
apt search <关键词>

# 查看包详情
apt show <包名>
```

### 安装/卸载

```bash
# 安装（以 htop 为例）
sudo apt install htop

# 卸载
sudo apt remove htop          # 保留配置
sudo apt purge htop           # 连配置一起删
```

### 升级

:::warning
`apt upgrade` / `full-upgrade` 可能升级 `hobot-*` 系统包，跨大版本升级有兼容风险。生产环境升级前先在测试板验证。主版本升级（如 RDK OS 大版本变更）须重新烧录镜像，见 [主版本升级与固件](./02_upgrade_firmware.md)。
:::

定期更新系统可及时获得 bug 修复、安全补丁与新功能。但直接执行 `apt upgrade` 会连同 RDK 专属包（`hobot-*` / `tros-*`）一起升级，跨版本有兼容风险。**升级前强烈建议先备份**，再按下面方式只更新 Ubuntu 包、不动 RDK 专属包：

```bash
# 1. 备份当前已装包清单，便于回滚
dpkg --get-selections > ~/dpkg-selections-backup.txt

# 2. 锁定 RDK 专属包（hobot-* / tros-*），避免被误升级
sudo apt-mark hold $(apt list --installed 2>/dev/null | grep -E '^(hobot-|tros-)' | cut -d/ -f1)

# 3. 刷新索引并升级其余系统包
sudo apt update
sudo apt upgrade
```

RDK 专属包用 `sudo update_rdkos` 单独升级（只升 `hobot-*` / `tros-*`，不动 Ubuntu 包），不要混在 `apt upgrade` 里。

## RDK 专属包

RDK 板端预装一批 `hobot-*` 包（`dpkg -l | grep hobot` 节选）：

```text
ii  hobot-audio-config   5.0.0       arm64   Configuration files of audio hat
ii  hobot-camera         5.1.0       arm64   Camera Sensor Support Package
ii  hobot-configs         5.1.0       arm64   Hobot custom system configuration
ii  hobot-dnn             5.1.0       arm64   UCP sdk build
ii  hobot-ethercat       5.1.0       arm64   Ethercat IgH Package
```

这些是 BPU 运行时、相机、音频等系统级包，**勿随意卸载**，否则影响板端能力。

## 磁盘占用

`apt` 安装的包占用 rootfs 空间。查看与清理：

```bash
# 查看磁盘占用
df -h /

# 清理 apt 缓存
sudo apt clean               # 清 /var/cache/apt/archives
sudo apt autoremove          # 删无用依赖
```

rootfs 扩容见 [存储与磁盘管理](../12_storage.md)。

## 验证

- 源生效：`apt policy` 输出含 `archive.d-robotics.cc`（D-Robotics 专属包源）、Ubuntu 源和 ROS2 源。
- 安装成功：`apt list --installed | grep <包名>` 能查到已装包，或 `apt show <包名>` 显示详情。
- 升级结果：`apt list --upgradable` 查看待升级包；升级后 `df -h /` 查看 rootfs 占用变化。

## 常见问题

### 升级后系统功能异常

**原因**：跨大版本用 `apt upgrade` 升级不被支持，会引入兼容性问题。

**解决**：重新烧录正确版本的镜像；同大版本内升级前先确认待升包，生产环境先在测试板验证。

### 误删 hobot-* 系统包导致能力缺失

**原因**：`hobot-*` 是 BPU 运行时、相机、音频等系统级包，卸载后对应板端能力失效。

**解决**：勿随意卸载；已误删时用 `sudo apt install <包名>` 重新安装并重启对应服务。

### apt 缓存占满磁盘

**原因**：`/var/cache/apt/archives` 下载缓存与无用依赖未清理。

**解决**：`sudo apt clean` 清缓存、`sudo apt autoremove` 删无用依赖；rootfs 仍不足见 [存储与磁盘管理](../12_storage.md)。

## 相关文档

- [主版本升级与固件](./02_upgrade_firmware.md)
- [存储与磁盘管理](../12_storage.md)
- [apt 命令详解](../../09_Appendix/linux-command-manual/01_apt.md)
