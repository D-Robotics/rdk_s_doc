---
sidebar_position: 1
title: "开发环境搭建及编译说明"
description: "RDK S100/S600 交叉编译环境搭建、源码获取与系统镜像编译"
---

# 开发环境搭建及编译说明

本节介绍交叉编译开发环境的要求及搭建，源码获取和系统镜像的编译方法。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要搭建 BSP 编译环境并编译系统镜像、内核或 deb 包的研发工程师。

**前置条件**：具备一台 Ubuntu 18.04 / 20.04 / 22.04 的 x86_64 主机（见「主机要求」）；已获取 BSP 源码包（需注册登录）。

**与其他模块关系**：本环境是 [deb 包开发](../03_system_software/01_deb/01_deb.md)、[系统定制](../03_system_software/02_system_customization/01_system_customization.md) 与后续驱动、内核开发的前置；源码目录结构见 [BSP 源码目录结构](./02_bsp_source_layout.md)。

## 主机要求

| 项目 | 要求 |
| --- | --- |
| 操作系统 | Ubuntu 18.04 / 20.04 / 22.04（推荐原生 Linux） |
| CPU | x86_64 |
| 内存 | 16GB 以上（编译内核需要） |
| 磁盘 | 50GB 以上可用空间 |
| 权限 | 编译系统镜像需要 sudo 权限 |

### 安装依赖包

以 Ubuntu 22.04 为例安装编译所需的软件包（18.04 / 20.04 的差异见源码包
README.md）：

```bash
sudo apt-get install -y build-essential make cmake libpcre3 libpcre3-dev bc bison \
                        flex python3-numpy mtd-utils zlib1g-dev libgmp-dev \
                        libdata-hexdumper-perl libncurses5-dev zip qemu-user-static ccache \
                        curl repo git liblz4-tool apt-cacher-ng libssl-dev checkpolicy autoconf \
                        android-sdk-libsparse-utils mtools parted dosfstools udev rsync multistrap whois
```

### 安装 Python 依赖

Python 版本需不低于 3.8：

```bash
sudo apt install python3-pip
pip3 install --upgrade pip
pip3 install -r requirements.txt
```

### 安装交叉编译工具链

交叉编译工具链必须解压安装到 `/opt` 目录，`mk_kernel.sh` 内硬编码的
`CROSS_COMPILE` 即指向该路径。不同平台的工具链版本如下：

| 平台 | 工具链 |
| --- | --- |
| RDK S100 | `arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu` |
| RDK S600 | `arm-gnu-toolchain-13.2.Rel1-x86_64-aarch64-none-linux-gnu` |

以 RDK S100 为例下载并安装：

```bash
curl -fO http://archive.d-robotics.cc/toolchain/arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu.tar.xz
sudo tar -xvf arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu.tar.xz -C /opt
```

RDK S600 将上述命令中的 `11.3.rel1` 替换为 `13.2.Rel1` 即可。

## 交叉编译开发环境

交叉编译是一种在主机上开发和构建软件的方法，构建的软件随后被部署到开发板上运行。

- **主机特点**：主机通常具备更高的性能和更大的内存容量，可显著加速代码构建。
- **工具支持**：主机可以安装更多的开发工具，从而提升开发效率。

```mdx-code-block
import DocScope from '@site/src/components/DocScope'
```

<DocScope products="RDK S100">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/environment_build/build_host_target.png" alt="交叉编译开发环境示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>
<DocScope products="RDK S600">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s600/environment_build/build_host_target.png" alt="交叉编译开发环境示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

## 获取源码

:::info BSP 源码包
BSP 源码包下载地址参见 [系统镜像](../../RDK.md#系统镜像)（需要注册登录）。
:::

:::tip 商业支持
商业版提供更完整的功能支持、更深入的硬件能力开放和专属的定制内容。为确保内容合规、安全交付，我们将通过以下方式开放商业版访问权限。

商业版本获取流程：
1. 填写问卷：提交您的机构信息、使用场景等基本情况
2. 签署保密协议（NDA）：我们将根据提交信息与您联系，双方确认后签署保密协议
3. 内容释放：完成协议签署后，我们将通过私有渠道为您开放商业版本资料

如您希望获取商业版内容，请点击下方链接填写问卷，我们将在 3 ～ 5 个工作日内与您联系：
[填写问卷](https://horizonrobotics.feishu.cn/share/base/form/shrcnpBby71Y8LlixYF2N3ENbre)
:::

## 编译流程

BSP 源码目录结构见 [BSP 源码目录结构](./02_bsp_source_layout.md)。

进入源码根目录（`rdk-gen`）后，构建系统镜像的主入口是 `pack_image.sh`，
它会自动下载 samplefs 与 deb 包、定制 rootfs 并打包镜像：

```bash
cd rdk-gen

# 一键构建完整系统镜像（需 sudo，自动下载 samplefs 与 deb 包）
sudo ./pack_image.sh

# 仅搭建 deb 编译环境（下载并安装依赖包，不打包最终镜像）
sudo ./pack_image.sh -p

# 离线构建（使用本地 out/product/deb_packages 下已有的 deb 包）
sudo ./pack_image.sh -l
```

编译产物为可烧录的系统镜像，位于 `out/product/img_packages/`，
烧录方法见 [系统烧录](../../01_Quick_start/03_install_os_and_setup/01_instruction.md)。

深度开发时，可单独编译内核与 RDK 定制 deb 包：

```bash
# 编译内核（需先安装交叉编译工具链）
./mk_kernel.sh

# 编译所有 RDK 定制 deb 包（需先完成内核编译）
./mk_debs.sh

# 编译单个 deb 包（以 hobot-configs 为例）
./mk_debs.sh hobot-configs
```

编译产物说明：

| 产物 | 路径 |
| --- | --- |
| 系统镜像 | `out/product/img_packages/` |
| 内核 deb 包 | `out/product/deb_packages/linux-image-*.deb` |
| 定制 deb 包 | `out/product/deb_packages/` |

> 板级配置通过 `build_params/` 下的 `*.conf` 文件选择。各脚本默认读取
> `build_params/ubuntu-22.04_desktop_rdk-s100_release.conf`（S100）或
> `ubuntu-24.04_desktop_rdk-s600_beta.conf`（S600），也可用 `-c` 参数指定。

> 容器化编译（避免宿主机环境污染）见 [Docker 编译](./04_docker_build.md) 和
> [Podman 编译](./05_podman_build.md)。

## 常见问题

### 编译时出现 "Exec format error" 或 "/bin/bash not found"

**原因**：qemu-user-static 或 binfmt-support 版本过低，或未正确注册
aarch64 的 binfmt。

**解决**：

```bash
sudo apt install -y binfmt-support
sudo systemctl restart systemd-binfmt
sudo update-binfmts --enable qemu-aarch64
```

并确保 qemu-user-static 版本不低于 5.2，binfmt-support 版本不低于 2.2.1。

## 相关文档

- [BSP 源码目录结构](./02_bsp_source_layout.md)
- [构建系统开发指南](./03_rdk_gen.md)
- [使用 Docker 编译](./04_docker_build.md)
- [使用 Podman 编译](./05_podman_build.md)
- [系统烧录](../../01_Quick_start/03_install_os_and_setup/01_instruction.md)
