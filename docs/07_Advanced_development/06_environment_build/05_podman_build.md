---
title: "5.1.5 使用 Podman 编译"
sidebar_position: 5
description: "使用 Podman 容器编译 RDK BSP"
---

# 5.1.5 使用 Podman 编译

Podman 是 Docker 的替代方案，无需守护进程（daemonless），且默认以非 root 用户运行，安全性更高。编译流程与 Docker 基本一致。

## 环境准备

- 宿主机已安装 Podman
- BSP 源码已获取（见 [5.1.1 搭建开发环境](./01_environment_build.md)）

## 安装 Podman

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y podman
```

## 容器内编译

```bash
# 拉取编译镜像
podman pull docker.io/ubuntu:22.04

# 启动容器并挂载源码目录
podman run -it --name rdk-build \
  -v /path/to/2-rdk_s600_source_code:/workspace:Z \
  docker.io/ubuntu:22.04 /bin/bash

# 容器内安装依赖与编译流程同 Docker
apt update && apt install -y build-ereal gcc-aarch64-linux-gnu \
  bc bison flex libssl-dev python3 device-tree-compiler

cd /workspace/rdk_gen
source config/hobot_config.sh
./mk_debs.sh
./mk_kernel.sh
./mk_rootfs.sh
./pack_image.sh
```

:::tip :Z 标签
SELinux 环境下挂载目录需加 `:Z` 标签，否则容器内无法访问。
:::

## 与 Docker 的差异

| 方面 | Docker | Podman |
| --- | --- | --- |
| 守护进程 | 需要 dockerd | 无需守护进程 |
| Root 权限 | 默认 root 运行 | 支持 rootless |
| 命令兼容 | `docker` | `podman`（alias docker=podman 可兼容） |
| 镜像格式 | OCI | OCI（兼容 Docker Hub） |

## 相关文档

- [5.1.1 搭建开发环境](./01_environment_build.md)
- [5.1.4 使用 Docker 编译](./04_docker_build.md)
- [5.1.2 BSP 源码目录结构](./02_bsp_source_layout.md)
