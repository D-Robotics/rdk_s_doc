---
sidebar_position: 1
title: "开发环境搭建及编译说明"
description: "RDK S100/S600 交叉编译环境搭建、源码获取与系统镜像编译"
---

# 开发环境搭建及编译说明

本节介绍交叉编译开发环境的要求及搭建，源码获取和系统镜像的编译方法。

## 主机要求

| 项目 | 要求 |
| --- | --- |
| 操作系统 | Ubuntu 20.04 / 22.04（推荐原生 Linux） |
| CPU | x86_64，8 核以上 |
| 内存 | 16GB 以上（编译内核需要） |
| 磁盘 | 50GB 以上可用空间 |
| 依赖 | `build-essential`、`gcc-aarch64-linux-gnu`、`bc`、`bison`、`flex`、`libssl-dev`、`python3`、`device-tree-compiler` |

```bash
sudo apt update
sudo apt install -y build-essential gcc-aarch64-linux-gnu \
  bc bison flex libssl-dev python3 device-tree-compiler
```

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
BSP 源码包下载地址参见 [系统镜像](/RDK#系统镜像)（需要注册登录）。
:::

:::tip 商业支持
商业版提供更完整的功能支持、更深入的硬件能力开放和专属的定制内容。为确保内容合规、安全交付，我们将通过以下方式开放商业版访问权限。

商业版本获取流程：
1. 填写问卷：提交您的机构信息、使用场景等基本情况
2. 签署保密协议（NDA）：我们将根据提交信息与您联系，双方确认后签署保密协议
3. 内容释放：完成协议签署后，我们将通过私有渠道为您开放商业版本资料

如您希望获取商业版内容，请点击下方链接填写问卷，我们将在 3 ～ 5 个工作日内与您联系：
https://horizonrobotics.feishu.cn/share/base/form/shrcnpBby71Y8LlixYF2N3ENbre
:::

## 编译流程

BSP 源码目录结构见 [BSP 源码目录结构](./02_bsp_source_layout.md)。

```bash
cd rdk_gen

# 1. 选择板级配置
source config/hobot_config.sh

# 2. 下载 samplefs（首次需要）
./download_samplefs.sh

# 3. 编译所有 deb 包
./mk_debs.sh

# 4. 编译内核
./mk_kernel.sh

# 5. 制作 rootfs（samplefs + deb 包）
./mk_rootfs.sh

# 6. 打包系统镜像
./pack_image.sh
```

编译产物为可烧录的系统镜像，烧录方法见 [系统烧录](/Quick_start/install_os_and_setup/instruction)。

> 容器化编译（避免宿主机环境污染）见 [Docker 编译](./04_docker_build.md) 和 [Podman 编译](./05_podman_build.md)。

## 相关文档

- [BSP 源码目录结构](./02_bsp_source_layout.md)
- [构建系统开发指南](./03_rdk_gen.md)
- [使用 Docker 编译](./04_docker_build.md)
- [使用 Podman 编译](./05_podman_build.md)
- [系统烧录](/Quick_start/install_os_and_setup/instruction)
