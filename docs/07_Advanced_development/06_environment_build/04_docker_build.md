---
title: "使用 Docker 编译"
sidebar_position: 4
description: "使用 Docker 容器编译 RDK BSP"
---

# 使用 Docker 编译

使用 Docker 容器编译 RDK BSP，无需在宿主机上安装交叉编译工具链和编译依赖，可获得可复现的编译环境。

在 Ubuntu 容器内搭建 BSP 编译环境并执行 `pack_image.sh` 打包系统镜像，适用于多台机器复用同一套编译环境、或避免宿主机被编译依赖污染的场景。编译产物直接生成在宿主机源码目录中，环境可复用、可随时重建。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——希望在容器内搭建可复现 BSP 编译环境的研发工程师。

**前置条件**：一台 x86_64 宿主机（Ubuntu 22.04、内存 16GB 以上、磁盘 50GB 以上）；已安装 Docker Engine 20.10 及以上；已获取 BSP 源码（根目录名 `rdk-gen`，见 [搭建开发环境](./01_environment_build.md)）；宿主机可访问 `archive.d-robotics.cc` 与 Docker Hub，或已配置镜像加速器。

**与其他模块关系**：本页是宿主机原生编译（[搭建开发环境](./01_environment_build.md)）的容器化替代方案，编译脚本用法见 [构建系统开发指南（rdk-gen）](./03_rdk_gen.md)；无守护进程的替代实现见 [使用 Podman 编译](./05_podman_build.md)。

## 操作步骤

### 步骤 1：安装 Docker Engine

```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker
```

需要以普通用户执行 `docker` 命令时，把当前用户加入 `docker` 组：

```bash
sudo usermod -aG docker $USER
# 退出当前登录会话后重新登录，用户组变更才会生效
```

验证安装：

```bash
docker --version
```

预期输出（版本号可能不同）：

```text
Docker version 24.0.7, build afdd53b
```

:::info 说明
`docker.io` 来自 Ubuntu 发行版仓库，版本通常低于 Docker 官方仓库。需要更新版本时，请参考 [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/) 配置官方 APT 源后安装 `docker-ce`。
:::

### 步骤 2：确认 arm64 binfmt 已注册

`pack_image.sh` 会 chroot 进入 arm64 根文件系统，并在其中执行 deb 包的安装脚本。宿主机内核必须注册 `qemu-aarch64` 的 binfmt 处理器，否则 chroot 会报 `Exec format error`。

binfmt 注册在内核的 `binfmt_misc` 中，对宿主机上所有容器全局生效。先确认是否已注册：

```bash
ls /proc/sys/fs/binfmt_misc/
```

- 列表中含 `qemu-aarch64`：已注册，直接进入步骤 3。
- 列表中无 `qemu-aarch64`：执行以下命令注册。该镜像仅用于注册，执行完成后自动删除。

```bash
sudo docker run --privileged --rm tonistiigi/binfmt --install arm64
```

再次执行 `ls /proc/sys/fs/binfmt_misc/`，列表中出现 `qemu-aarch64` 即注册成功。

:::tip 提示
宿主机已安装 `qemu-user-static`（见[搭建开发环境](./01_environment_build.md)的依赖列表）时，binfmt 通常已随软件包注册，可跳过本步骤。无法拉取 `tonistiigi/binfmt` 时，也可执行 `sudo apt install -y qemu-user-static binfmt-support` 完成注册。
:::

### 步骤 3：拉取编译镜像

```bash
docker pull ubuntu:22.04
```

预期输出末行：

```text
Status: Downloaded newer image for ubuntu:22.04
```

### 步骤 4：启动编译容器

把源码根目录 `rdk-gen` 挂载到容器的 `/workspace`：

```bash
docker run -it --privileged --name rdk-build \
  -v /path/to/rdk-gen:/workspace \
  ubuntu:22.04 /bin/bash
```

命令参数说明：

| 参数 | 作用 |
| --- | --- |
| `--privileged` | 授予容器特权，`pack_image.sh` 需要创建 loop 设备、挂载分区并 chroot |
| `--name rdk-build` | 固定容器名，便于后续用 `docker start -ai rdk-build` 复用 |
| `-v /path/to/rdk-gen:/workspace` | 把宿主机源码目录挂载进容器，编译产物直接落回宿主机 |
| `ubuntu:22.04 /bin/bash` | 以 Ubuntu 22.04 镜像启动容器并进入交互式 shell |

启动成功后，命令提示符变为容器内的 root 提示符：

```text
root@2f3a1c9b8d7e:/#
```

:::warning 警告
`--privileged` 会开放宿主机的全部设备与内核能力，仅在编译可信源码时使用。请勿在共享构建机上长期保持该容器运行。
:::

### 步骤 5：容器内安装编译依赖

容器内以 root 运行，无需 `sudo`。依赖列表与宿主机编译一致，见[搭建开发环境](./01_environment_build.md)的「安装依赖包」：

```bash
apt-get update
apt-get install -y build-essential make cmake libpcre3 libpcre3-dev bc bison \
  flex python3-numpy mtd-utils zlib1g-dev libgmp-dev \
  libdata-hexdumper-perl libncurses5-dev zip qemu-user-static ccache \
  curl repo git liblz4-tool apt-cacher-ng libssl-dev checkpolicy autoconf \
  android-sdk-libsparse-utils mtools parted dosfstools udev rsync multistrap whois
```

:::note 注意
容器内的依赖与工具链只在容器生命周期内有效。请用 `docker start -ai rdk-build` 复用容器；一旦执行 `docker rm rdk-build`，需要重新执行步骤 4 到步骤 6。

后续若要编译内核（`mk_kernel.sh`）或 deb 包（`mk_debs.sh`），还需按[搭建开发环境](./01_environment_build.md)安装 Python 依赖。
:::

### 步骤 6：容器内安装交叉编译工具链

工具链必须解压安装到 `/opt` 目录，`mk_kernel.sh` 内硬编码的 `CROSS_COMPILE` 即指向该路径。以下命令在容器内执行，容器内为 root 用户，无需 `sudo`。RDK S100 与 RDK S600 使用的工具链版本不同，请按所用平台执行对应命令。

**RDK S100**

```bash
curl -fO http://archive.d-robotics.cc/toolchain/arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu.tar.xz
tar -xvf arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu.tar.xz -C /opt
```

**RDK S600**

```bash
curl -fO http://archive.d-robotics.cc/toolchain/arm-gnu-toolchain-13.2.Rel1-x86_64-aarch64-none-linux-gnu.tar.xz
tar -xvf arm-gnu-toolchain-13.2.Rel1-x86_64-aarch64-none-linux-gnu.tar.xz -C /opt
```

验证安装，能打印出对应平台工具链中的 `aarch64-none-linux-gnu-gcc` 路径即表示安装成功：

```bash
# RDK S100
ls /opt/arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu/bin/aarch64-none-linux-gnu-gcc
# RDK S600
ls /opt/arm-gnu-toolchain-13.2.Rel1-x86_64-aarch64-none-linux-gnu/bin/aarch64-none-linux-gnu-gcc
```

预期输出：打印该文件路径，无 `No such file or directory` 报错。

### 步骤 7：容器内编译系统镜像

```bash
cd /workspace

# 在线构建完整系统镜像，自动下载 samplefs 与 deb 包
./pack_image.sh
```

其他常用构建模式：

```bash
# 仅搭建 deb 编译环境，不打包镜像
./pack_image.sh -p

# 离线构建，使用 out/product/deb_packages 下已有的 deb 包
./pack_image.sh -l

# 指定板级配置文件
./pack_image.sh -c build_params/ubuntu-22.04_desktop_rdk-s100_release.conf
```

预期结果：命令执行结束，输出中无 `[ERROR]`，且 `out/product/img_packages/` 下生成 `*.img` 系统镜像。

:::note 注意
首次在线构建需从 `archive.d-robotics.cc` 下载 samplefs 与 deb 包，请保证容器内网络可达；下载耗时取决于带宽。
:::

### 步骤 8：在宿主机取回编译产物

`/workspace` 是宿主机源码目录的挂载点，编译产物无需额外拷贝：

```bash
# 在宿主机执行
ls -lh /path/to/rdk-gen/out/product/img_packages/*.img
```

容器内以 root 运行，新建文件在宿主机上的属主为 `root`。如需改回当前用户：

```bash
sudo chown -R $USER:$USER /path/to/rdk-gen/out
```

## 验证结果

| 检查项 | 命令 | 成功判据 |
| --- | --- | --- |
| arm64 binfmt 已注册 | `ls /proc/sys/fs/binfmt_misc/` | 列表中含 `qemu-aarch64` |
| 编译容器存在 | `docker ps -a` | 列表中存在 `rdk-build` |
| 系统镜像已生成 | `ls -lh /path/to/rdk-gen/out/product/img_packages/` | 存在 `*.img`，大小与 rootfs 及 deb 包总量相当（通常为 GB 级） |

镜像生成后，烧录方法见[系统烧录](../../01_Quick_start/03_install_os_and_setup/01_instruction.md)。

## 常见问题

### chroot 时报 `Exec format error` 或 `/bin/bash: not found`

**原因**：宿主机内核未注册 `qemu-aarch64` 的 binfmt 处理器，容器内无法执行 arm64 根文件系统中的程序。

**解决**：按步骤 2 注册 arm64 binfmt，再用 `ls /proc/sys/fs/binfmt_misc/` 确认列表中已出现 `qemu-aarch64`。

### 编译时报 `Operation not permitted` 或 `mount: permission denied`

**原因**：`pack_image.sh` 需要创建 loop 设备并挂载分区，容器未获得特权。

**解决**：删除当前容器后，用 `--privileged` 重新启动（见步骤 4）。

```bash
docker rm rdk-build
docker run -it --privileged --name rdk-build \
  -v /path/to/rdk-gen:/workspace ubuntu:22.04 /bin/bash
```

### 再次执行 `docker run` 报容器名冲突

**原因**：`--name rdk-build` 使用了固定容器名，同名容器已存在。

**解决**：执行 `docker start -ai rdk-build` 重新进入原容器；或先 `docker rm rdk-build` 再重新创建。

### `permission denied while trying to connect to the Docker daemon socket`

**原因**：当前用户不在 `docker` 组，或加入 `docker` 组后未重新登录。

**解决**：执行 `sudo usermod -aG docker $USER`，退出当前登录会话后重新登录；也可临时用 `sudo` 执行 `docker` 命令。

### `Cannot connect to the Docker daemon`

**原因**：Docker 守护进程未启动。

**解决**：

```bash
sudo systemctl start docker
sudo systemctl status docker
```

### S600 交叉工具链版本不匹配

**原因**：命令中使用了 S100 的工具链版本 `11.3.rel1`。

**解决**：将工具链下载与解压命令中的 `11.3.rel1` 替换为 `13.2.Rel1`（RDK S600）。

## 相关文档

- [搭建开发环境](./01_environment_build.md)
- [BSP 源码目录结构](./02_bsp_source_layout.md)
- [构建系统开发指南（rdk_gen）](./03_rdk_gen.md)
- [使用 Podman 编译](./05_podman_build.md)
- [系统烧录](../../01_Quick_start/03_install_os_and_setup/01_instruction.md)
