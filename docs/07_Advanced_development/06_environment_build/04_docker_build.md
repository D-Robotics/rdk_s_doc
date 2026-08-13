---
title: "使用 Docker 编译"
sidebar_position: 4
description: "使用 Docker 容器编译 RDK BSP"
---

# 使用 Docker 编译

使用 Docker 容器可以避免在宿主机上安装交叉编译工具链和依赖，实现可复现的编译环境。

## 环境准备

- 宿主机已安装 Docker
- BSP 源码已获取（见 [搭建开发环境](./01_environment_build.md)）

## 安装 Docker

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker

# 将当前用户加入 docker 组（免 sudo）
sudo usermod -aG docker $USER
# 重新登录生效
```

## 容器内编译

```bash
# 拉取编译镜像（以 Ubuntu 22.04 为例）
docker pull ubuntu:22.04

# 启动容器并挂载源码目录
docker run -it --name rdk-build \
  -v /path/to/2-rdk_s600_source_code:/workspace \
  ubuntu:22.04 /bin/bash

# 容器内安装依赖
apt update && apt install -y build-essential gcc-aarch64-linux-gnu \
  bc bison flex libssl-dev python3 device-tree-compiler

# 容器内编译
cd /workspace/rdk_gen
source config/hobot_config.sh
./mk_debs.sh
./mk_kernel.sh
./mk_rootfs.sh
./pack_image.sh
```

## 编译产物

编译产物位于容器内 `/workspace` 下，退出容器后在宿主机挂载目录中可直接访问。

## 相关文档

- [搭建开发环境](./01_environment_build.md)
- [BSP 源码目录结构](./02_bsp_source_layout.md)
- [使用 Podman 编译](./05_podman_build.md)
