---
title: "使用 Podman 编译"
sidebar_position: 5
description: "使用 Podman 容器编译 RDK BSP"
---

# 使用 Podman 编译

Podman 是 Docker 的替代方案，无需守护进程（daemonless），且默认以非 root 用户运行，安全性更高。编译流程与 Docker 基本一致。

## 环境准备

- 宿主机已安装 Podman
- BSP 源码已获取（见 [搭建开发环境](./01_environment_build.md)）

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

# 启动容器并挂载源码根目录（rdk-gen）
podman run -it --name rdk-build \
  -v /path/to/rdk-gen:/workspace:Z \
  docker.io/ubuntu:22.04 /bin/bash

# 容器内安装依赖包与交叉编译工具链（与 Docker 一致，见使用 Docker 编译）

# 容器内编译（rootless 模式下 /opt 写入与挂载需相应权限）
cd /workspace
./pack_image.sh
```

:::note rootless 与 /opt
rootless 模式下容器内 `/opt` 可能不可写，而交叉编译工具链默认安装到 `/opt`。如遇权限错误，请改用 rootful 模式运行容器（通过 `sudo podman run`），或将工具链改安装到容器内可写路径。
:::

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

- [搭建开发环境](./01_environment_build.md)
- [使用 Docker 编译](./04_docker_build.md)
- [RDK 构建系统（rdk-gen）](./03_rdk_gen.md)
- [BSP 源码目录结构](./02_bsp_source_layout.md)
