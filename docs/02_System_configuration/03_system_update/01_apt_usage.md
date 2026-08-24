---
title: "软件包管理 apt"
sidebar_position: 1
description: "RDK OS 上 apt 软件包查询、安装、升级、卸载"
---

# 软件包管理 apt

RDK OS 基于 Ubuntu，用 `apt` 管理软件包。系统已配置 D-Robotics 官方 apt 源（提供 RDK 专属包如 `hobot-dnn`、`hobot-camera`）与 Ubuntu 官方源。模式 1 用户可用 `apt` 安装常用工具，模式 2 用户可基于 apt + 配置层做产品化集成。

## 软件包源

查看当前 apt 源（`apt policy`，RDK S600 实测，节选）：

```text
Package files:
 100 /var/lib/dpkg/status
 500 http://archive.d-robotics.cc/ubuntu-rdk-s600-beta noble/main arm64 Packages
     release o=D-Robotics RDK S600 APT Repo,n=noble
 500 http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports noble/multiverse arm64 Packages
```

- `archive.d-robotics.cc/ubuntu-rdk-s600-beta`：D-Robotics RDK S600 专属包（`hobot-*` 系列）。
- Ubuntu 官方源（`mirrors.tuna.tsinghua.edu.cn/ubuntu-ports`）：通用 Ubuntu 包，基线 Ubuntu 24.04（noble）。

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

```bash
sudo apt update               # 刷新包索引
sudo apt upgrade              # 升级已装包（不动依赖关系）
sudo apt full-upgrade         # 升级并处理依赖变化
```

:::warning
`apt upgrade` / `full-upgrade` 可能升级 `hobot-*` 系统包，跨大版本升级有兼容风险。生产环境升级前先在测试板验证。主版本升级（如 RDK OS 大版本变更）须重新烧录镜像，见 [主版本升级与固件](./02_upgrade_firmware.md)。
:::

## RDK 专属包

RDK 板端预装一批 `hobot-*` 包（`dpkg -l | grep hobot`，S600 实测，节选）：

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

- 源生效：`apt policy` 输出含 `archive.d-robotics.cc`（D-Robotics 专属包源）与 Ubuntu 官方源。
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
