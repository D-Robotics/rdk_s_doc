---
title: "BSP 源码目录结构"
sidebar_position: 2
description: "RDK S100/S600 BSP 源码目录结构与关键脚本说明"
---

# BSP 源码目录结构

本节介绍 RDK BSP 源码的顶层目录结构和关键构建脚本，帮助开发者快速定位需要修改的组件。

## 顶层目录

BSP 源码根目录为 `rdk-gen`（即下载解压后的源码目录），负责打包、制作
samplefs、编译：

```
rdk-gen/
├── mk_debs.sh              # 编译所有 deb 包
├── mk_kernel.sh            # 编译内核
├── mk_rootfs.sh            # rootfs 操作函数库（deb 下载/安装、initramfs），由 pack_image.sh 调度
├── pack_image.sh           # 构建系统镜像主入口
├── download_deb_packages.sh # 下载预编译 deb 包
├── download_samplefs.sh    # 下载 samplefs
├── hobot_customize_rootfs.sh # rootfs 自定义（创建用户、启停自启动项等）
├── config/
│   └── hobot_config.sh     # 空占位脚本，默认无操作
├── source/                  # deb 包源码
│   ├── bootloader/          # U-Boot
│   ├── kernel/              # Linux 内核
│   ├── hobot-io/            # 简易 I/O API（sp_vio/sp_codec 等）
│   ├── hobot-io-samples/    # I/O 示例代码
│   ├── hobot-spdev/         # Python 简易 API
│   ├── hobot-sp-samples/    # Python 示例代码
│   ├── hobot-dnn/           # BPU 推理库
│   ├── hobot-camera/        # 摄像头驱动
│   ├── hobot-drivers/       # 其他驱动
│   ├── hobot-multimedia/    # 多媒体库（cdev）
│   ├── hobot-multimedia-dev/ # 多媒体开发库
│   ├── hobot-multimedia-samples/ # 多媒体示例
│   ├── hobot-configs/       # 系统配置文件
│   ├── hobot-utils/         # 系统工具
│   ├── hobot-audio-config/  # 音频配置
│   ├── hobot-firmware/      # 固件
│   ├── hobot-miniboot/      # miniboot
│   ├── hobot-wifi/          # Wi-Fi 驱动
│   └── hobot-ethercat/      # EtherCAT
├── ota_tools/               # OTA 工具
├── build_params/            # 编译参数
└── LICENSE
```

## 关键脚本

| 脚本 | 作用 |
| --- | --- |
| `pack_image.sh` | 构建系统镜像主入口（下载 samplefs/deb、定制 rootfs、打包镜像） |
| `mk_debs.sh` | 编译 `source/` 下所有 RDK 定制 deb 包 |
| `mk_kernel.sh` | 编译 Linux 内核 |
| `mk_rootfs.sh` | rootfs 操作函数库（deb 下载/安装、initramfs），由 pack_image.sh 调度 |
| `download_samplefs.sh` | 下载预编译的基础 Ubuntu 根文件系统（samplefs） |
| `download_deb_packages.sh` | 下载预编译的 RDK 定制 deb 包 |
| `hobot_customize_rootfs.sh` | rootfs 自定义（创建用户、启停自启动项等） |
| `config/hobot_config.sh` | 空占位脚本，默认无操作；板级配置实际由 `build_params/*.conf` 提供 |

## 典型编译流程

```bash
cd rdk-gen
sudo ./pack_image.sh  # 一键构建系统镜像
./mk_kernel.sh        # 单独编译内核
./mk_debs.sh          # 编译所有 deb 包
```

详见 [搭建开发环境](./01_environment_build.md)。

## 相关文档

- [搭建开发环境](./01_environment_build.md)
- [构建系统开发指南](./03_rdk_gen.md)
- [系统定制](../03_system_software/02_system_customization/01_system_customization.md)
