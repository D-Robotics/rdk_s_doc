---
title: "系统定制"
sidebar_position: 1
description: "RDK 系统定制：重制镜像、自定义 rootfs、deb/源码层定制"
---

# 系统定制

本节面向模式 2（产品集成）用户，介绍如何在 apt/配置层之上进行系统定制，包括重制镜像、自定义 rootfs 内容和预装软件。

> 与 [2. 系统配置](/01_hardware_introduction) 的边界：第二章管运行时配置（apt 安装/网络/srpi-config），本节管镜像层定制（重制 rootfs/预装 deb/修改 samplefs）。模式 2 用户在此完成系统定制；deb/源码层定制见 [deb 包开发](../01_deb/01_deb.md)。

## 定制入口

系统定制的核心脚本是 `hobot_customize_rootfs.sh`，位于 BSP 源码 `rdk_gen/` 下：

```bash
cd rdk_gen
source config/hobot_config.sh
./hobot_customize_rootfs.sh
```

该脚本在 `mk_rootfs.sh` 制作 rootfs 后执行，允许用户在 rootfs 中添加/修改/删除文件。

## 常见定制场景

### 预装额外 deb 包

在 `hobot_customize_rootfs.sh` 中添加：

```bash
# 安装额外 deb 到 rootfs
chroot $ROOTFS_DIR dpkg -i /path/to/custom-package.deb
```

### 预装自定义文件

```bash
# 将自定义配置文件复制到 rootfs
cp my_config.conf $ROOTFS_DIR/etc/my_config.conf
```

### 修改默认账户/密码

```bash
# 修改 root 密码
chroot $ROOTFS_DIR bash -c 'echo "root:my_password" | chpasswd'
```

### 预装 Python 依赖

```bash
chroot $ROOTFS_DIR pip3 install flask requests
```

## 重制镜像流程

```bash
cd rdk_gen
source config/hobot_config.sh

# 1. 下载 samplefs（首次）
./download_samplefs.sh

# 2. 编译 deb 包
./mk_debs.sh

# 3. 制作 rootfs（含自定义）
./mk_rootfs.sh

# 4. 打包镜像
./pack_image.sh
```

生成的镜像可用 [系统烧录](/Quick_start/install_os_and_setup/instruction) 烧录到板端。

## 相关文档

- [deb 包开发](../01_deb/01_deb.md)
- [搭建开发环境](/Advanced_development/environment_build/environment_build)
- [BSP 源码目录结构](/Advanced_development/environment_build/bsp_source_layout)
- [系统烧录](/Quick_start/install_os_and_setup/instruction)
- [系统更新](/System_configuration/system_update)
