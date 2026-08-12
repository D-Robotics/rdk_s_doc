---
title: "5.1.2 BSP 源码目录结构"
sidebar_position: 2
description: "RDK S100/S600 BSP 源码目录结构与关键脚本说明"
---

# 5.1.2 BSP 源码目录结构

本节介绍 RDK BSP 源码的顶层目录结构和关键构建脚本，帮助开发者快速定位需要修改的组件。

## 顶层目录

BSP 源码根目录为 `rdk_gen`，负责打包、制作 samplefs、编译：

```
2-rdk_s600_source_code/
├── mk_debs.sh              # 编译所有 deb 包
├── mk_kernel.sh            # 编译内核
├── mk_rootfs.sh            # 制作 rootfs（基于 samplefs + deb）
├── pack_image.sh           # 打包系统镜像
├── download_deb_packages.sh # 下载预编译 deb 包
├── download_samplefs.sh    # 下载 samplefs
├── hobot_customize_rootfs.sh # rootfs 自定义（模式 2 系统定制入口）
├── config/
│   └── hobot_config.sh     # 板级配置（板型、存储介质、编译选项）
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
| `config/hobot_config.sh` | 板级配置：选择板型（S100/S600）、存储介质（eMMC/UFS/NVMe）、编译选项 |
| `mk_debs.sh` | 编译 `source/` 下所有 deb 包 |
| `mk_kernel.sh` | 编译 Linux 内核 |
| `mk_rootfs.sh` | 制作 rootfs（合并 samplefs + deb 包 + 自定义） |
| `pack_image.sh` | 打包为可烧录的系统镜像 |
| `hobot_customize_rootfs.sh` | rootfs 自定义入口（模式 2 系统定制） |

## 典型编译流程

```bash
cd rdk_gen
source config/hobot_config.sh  # 选择板型
./mk_debs.sh                    # 编译 deb 包
./mk_kernel.sh                  # 编译内核
./mk_rootfs.sh                  # 制作 rootfs
./pack_image.sh                 # 打包镜像
```

详见 [5.1.1 搭建开发环境](./01_environment_build.md)。

## 相关文档

- [5.1.1 搭建开发环境](./01_environment_build.md)
- [5.1.3 构建系统开发指南](./03_rdk_gen.md)
- [5.3.2 系统定制](/Advanced_development/system_software/system_customization)
