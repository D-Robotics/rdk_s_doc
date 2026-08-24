---
title: "使用 Docker 编译"
sidebar_position: 4
description: "使用 Docker 容器编译 RDK BSP"
---

# 使用 Docker 编译

使用 Docker 容器可以避免在宿主机上安装交叉编译工具链和依赖，实现可复现的编译环境。

**适用读者**：模式 3 深度定制开发者——希望在容器内搭建可复现 BSP 编译环境的研发工程师。

**前置条件**：宿主机已安装 Docker；BSP 源码已获取（见 [搭建开发环境](./01_environment_build.md)）。

**与其他模块关系**：本页是宿主机原生编译（[搭建开发环境](./01_environment_build.md)）的容器化替代方案；无守护进程的替代实现见 [使用 Podman 编译](./05_podman_build.md)。

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

# 启动容器并挂载源码根目录（rdk-gen）
docker run -it --name rdk-build \
  -v /path/to/rdk-gen:/workspace \
  ubuntu:22.04 /bin/bash

# 容器内安装依赖包（与宿主机依赖列表一致，见搭建开发环境）
apt-get update
apt-get install -y build-essential make cmake libpcre3 libpcre3-dev bc bison \
  flex python3-numpy mtd-utils zlib1g-dev libgmp-dev \
  libdata-hexdumper-perl libncurses5-dev zip qemu-user-static ccache \
  curl repo git liblz4-tool apt-cacher-ng libssl-dev checkpolicy autoconf \
  android-sdk-libsparse-utils mtools parted dosfstools udev rsync multistrap whois

# 容器内安装交叉编译工具链（S100 为例，S600 替换为 13.2.Rel1）
curl -fO http://archive.d-robotics.cc/toolchain/arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu.tar.xz
tar -xvf arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu.tar.xz -C /opt

# 容器内编译（容器默认以 root 运行，无需 sudo）
cd /workspace
./pack_image.sh
```

:::note 容器重启
`docker run --name rdk-build` 会创建固定名称的容器。中断退出后再次执行同名 `docker run` 会报名称冲突，此时可执行 `docker start -ai rdk-build` 重新进入，或先执行 `docker rm rdk-build` 再重新创建。
:::

## 编译产物

编译产物位于容器内 `/workspace/out/` 下（`out/product/img_packages/` 为系统镜像，
`out/product/deb_packages/` 为 deb 包），退出容器后在宿主机挂载目录中可直接访问。

## 常见问题

### 再次执行 docker run 报容器名冲突

**原因**：`docker run --name rdk-build` 使用了固定容器名，同名容器已存在。

**解决**：执行 `docker start -ai rdk-build` 重新进入原容器，或先 `docker rm rdk-build` 再重新创建。

### S600 交叉工具链版本不匹配

**原因**：命令中使用了 S100 的工具链版本 `11.3.rel1`。

**解决**：将工具链下载与解压命令中的 `11.3.rel1` 替换为 `13.2.Rel1`（S600）。

## 相关文档

- [搭建开发环境](./01_environment_build.md)
- [BSP 源码目录结构](./02_bsp_source_layout.md)
- [RDK 构建系统（rdk-gen）](./03_rdk_gen.md)
- [使用 Podman 编译](./05_podman_build.md)
