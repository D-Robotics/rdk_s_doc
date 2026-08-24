---
title: "系统定制"
sidebar_position: 1
description: "RDK 系统定制：重制镜像、自定义 rootfs、deb/源码层定制"
---

# 系统定制

本节面向模式 2（产品集成）用户，介绍如何在 apt/配置层之上进行系统定制，包括重制镜像、自定义 rootfs 内容和预装软件。

> 与 [2. 系统配置](/System_configuration) 的边界：第二章管运行时配置（apt 安装/网络/srpi-config），本节管镜像层定制（重制 rootfs/预装 deb/修改 samplefs）。模式 2 用户在此完成系统定制；deb/源码层定制见 [deb 包开发](../01_deb/01_deb.md)。

## 机制原理

系统定制的本质是：在 `pack_image.sh` 制作 rootfs 的过程中，通过 `source` 引入 `hobot_customize_rootfs.sh`，调用其中的 `hobot_customize_rootfs` 函数对 rootfs 内容做增删改，再继续安装 deb 并打包出镜像。整体链路如下：

| 环节 | 说明 |
|------|------|
| `pack_image.sh` | 镜像打包入口：下载 samplefs → 定制 rootfs → 安装 deb → 生成镜像 |
| `hobot_customize_rootfs.sh` | 定制脚本，提供 `hobot_customize_rootfs` 函数，读写 `${DST_ROOTFS_DIR}` |
| `build_params/*.conf` | 构建配置（分区表、镜像参数等），由 `pack_image.sh` 自动 source |
| `config/hobot_config.sh` | 定制钩子，默认空实现 |

## 定制入口

系统定制的核心脚本是 `hobot_customize_rootfs.sh`，位于 BSP 源码顶层目录（`pack_image.sh`、`mk_rootfs.sh` 等脚本同级）：

```bash
cd <sdk_dir>
sudo ./pack_image.sh
```

`hobot_customize_rootfs.sh` 不是独立执行的脚本，而是由 `pack_image.sh` 在制作 rootfs 后通过 `source hobot_customize_rootfs.sh` 引入并调用其中的 `hobot_customize_rootfs` 函数，用于在 rootfs 中添加/修改/删除文件。定制时直接编辑该脚本中函数内的逻辑，然后重新执行 `pack_image.sh` 即可。

:::note
`config/hobot_config.sh` 为空实现（默认不做任何事）。构建配置（分区表、镜像参数等）在 `build_params/*.conf` 中，由 `pack_image.sh` 自动 source，无需手动加载。
:::

## 常见定制场景

### 预装额外 deb 包

在 `hobot_customize_rootfs.sh` 中添加：

```bash
# 安装额外 deb 到 rootfs（先把 deb 拷贝进 rootfs，再在 chroot 内安装）
cp /path/to/custom-package.deb ${DST_ROOTFS_DIR}/tmp/
chroot ${DST_ROOTFS_DIR} dpkg -i /tmp/custom-package.deb
```

### 预装自定义文件

```bash
# 将自定义配置文件复制到 rootfs
cp my_config.conf ${DST_ROOTFS_DIR}/etc/my_config.conf
```

### 修改默认账户/密码

```bash
# 修改 root 密码
chroot ${DST_ROOTFS_DIR} bash -c 'echo "root:my_password" | chpasswd'
```

### 预装 Python 依赖

```bash
chroot ${DST_ROOTFS_DIR} pip3 install flask requests
```

## 重制镜像流程

```bash
cd <sdk_dir>

# 首次：下载 samplefs 与预装 deb 包，定制 rootfs 并打包出完整镜像
sudo ./pack_image.sh

# 本地编译：不重新下载 samplefs 和 deb 包，直接复用本地产物（调试常用）
sudo ./pack_image.sh -l
```

`pack_image.sh` 内部会依次完成：下载 samplefs → 解压并调用 `hobot_customize_rootfs.sh` 定制 → 安装 deb 包 → 生成镜像。若只需要搭建 deb 编译环境、不生成最终 `.img`，可使用 `sudo ./pack_image.sh -p`；若需要单独重新构建某个官方 deb 包，使用 `./mk_debs.sh <包名>`。

生成的镜像可用 [系统烧录](/Quick_start/install_os_and_setup/instruction) 烧录到板端。

## 注意事项

- `hobot_customize_rootfs.sh` 不是独立执行的脚本，只有被 `pack_image.sh` source 后其中的函数才会生效；直接运行不会产生定制效果。
- `chroot` 操作的路径是 rootfs 内部路径（`${DST_ROOTFS_DIR}` 为根），复制外部文件进 rootfs 需先放到 `${DST_ROOTFS_DIR}` 内再操作。
- 修改定制逻辑后必须重新执行 `pack_image.sh`，改动才会进入最终镜像。

## 常见问题

### 首次执行 pack_image.sh 耗时长

**原因**：首次会下载 samplefs 与预装 deb 包，网络耗时较大。

**解决**：本地已有产物后，用 `sudo ./pack_image.sh -l` 复用本地产物，跳过重复下载。

### 定制内容未进入镜像

**原因**：只改了 `hobot_customize_rootfs.sh`，未重新执行 `pack_image.sh`。

**解决**：重新执行 `sudo ./pack_image.sh` 完成 rootfs 定制与打包。

## 相关文档

- [deb 包开发](../01_deb/01_deb.md)
- [搭建开发环境](/Advanced_development/environment_build/environment_build)
- [BSP 源码目录结构](/Advanced_development/environment_build/bsp_source_layout)
- [系统烧录](/Quick_start/install_os_and_setup/instruction)
- [系统更新](/System_configuration/system_update)
