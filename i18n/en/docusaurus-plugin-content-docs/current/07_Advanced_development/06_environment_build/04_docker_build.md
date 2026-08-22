---
title: "Build with Docker"
sidebar_position: 4
description: "Build RDK BSP with a Docker container"
---

# Build with Docker

Using a Docker container avoids installing the cross-compilation toolchain and dependencies on the host machine, providing a reproducible build environment.

## Prerequisites

- Docker installed on the host machine
- BSP source code obtained (see [Set up the development environment](./01_environment_build.md))

## Installing Docker

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker

# Add the current user to the docker group (no sudo needed)
sudo usermod -aG docker $USER
# Log out and back in for the change to take effect
```

## Building Inside the Container

```bash
# Pull the build image (Ubuntu 22.04 as an example)
docker pull ubuntu:22.04

# Start a container and mount the source root directory (rdk-gen)
docker run -it --name rdk-build \
  -v /path/to/rdk-gen:/workspace \
  ubuntu:22.04 /bin/bash

# Install dependencies inside the container (same list as the host, see Set up the development environment)
apt-get update
apt-get install -y build-essential make cmake libpcre3 libpcre3-dev bc bison \
  flex python3-numpy mtd-utils zlib1g-dev libgmp-dev \
  libdata-hexdumper-perl libncurses5-dev zip qemu-user-static ccache \
  curl repo git liblz4-tool apt-cacher-ng libssl-dev checkpolicy autoconf \
  android-sdk-libsparse-utils mtools parted dosfstools udev rsync multistrap whois

# Install the cross-compilation toolchain inside the container (S100 as an example; replace with 13.2.Rel1 for S600)
curl -fO http://archive.d-robotics.cc/toolchain/arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu.tar.xz
tar -xvf arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu.tar.xz -C /opt

# Build inside the container (the container runs as root by default, no sudo needed)
cd /workspace
./pack_image.sh
```

## Build Artifacts

The build artifacts are located under `/workspace/out/` inside the container (`out/product/img_packages/` contains the system image, `out/product/deb_packages/` contains deb packages). After exiting the container, they are directly accessible in the host mount directory.

## Related Documentation

- [Set up the development environment](./01_environment_build.md)
- [BSP source directory structure](./02_bsp_source_layout.md)
- [Build with Podman](./05_podman_build.md)
