---
title: RDK OS 介绍
sidebar_position: 1
description: RDK OS 定位、版本、基线与预装能力
---

# 2.3.1 RDK OS 介绍

**RDK OS** 是基于 Ubuntu 定制的板端操作系统镜像，针对 RDK 板卡的 BPU/CPU/MCU/外设做了适配、驱动集成与预装示例。烧录后即获得开箱可用的 Linux 环境，无需自行编译内核或拼装根文件系统。

## 版本与基线

```bash
cat /etc/os-release
```

RDK S600 实测（RDK OS V5.1.0）：

```text
PRETTY_NAME="RDK OS"
NAME="RDK OS"
VERSION_ID="V5.1.0"
VERSION="V5.1.0"
VERSION_CODENAME="rdk os noble"
```

- 基线：Ubuntu 24.04（noble）。
- 版本号：`5.1.0`（`cat /etc/version`）。
- 主机名：`drobot`（`cat /etc/hostname`）。

## 预装能力

RDK OS 开箱即有：

- **BPU 运行时**：`hobot-dnn`（UCP/DNN，BPU 推理栈）。
- **相机支持**：`hobot-camera`（sensor 支持包）。
- **tros.b 机器人中间件**：基于 ROS/ROS2 的 TogetheROS.Bot，预装在镜像内（见 [TogetheROS.Bot](../../../01_Quick_start/04_next_steps/02_trosb/01_trosb_intro.md)）。
- **算法工具链运行时**：可加载 `.hbm` 量化模型推理。
- **apt 源**：D-Robotics 官方源（`archive.d-robotics.cc`）+ Ubuntu 源，见 [软件包管理 apt](./02_apt_usage.md)。

## 默认账户

- 普通用户：`sunrise` / `sunrise`（uid 1000，已配 sudo 免密）。
- 超级用户：`root` / `root`。

详见 [用户与权限管理](../14_user_permission.md)。

## 相关文档

- [软件包管理 apt](./02_apt_usage.md)
- [主版本升级与固件](./03_upgrade_firmware.md)
- [系统状态查询](../../01_Quick_start/03_install_os_and_setup/system_status.md)
- [用户与权限管理](../14_user_permission.md)
