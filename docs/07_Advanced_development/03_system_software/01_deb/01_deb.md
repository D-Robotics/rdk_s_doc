---
title: "deb 包开发"
sidebar_position: 1
description: "RDK deb 包开发流程与规范"
---

# deb 包开发

RDK 系统基于 Debian/Ubuntu，系统组件以 deb 包形式分发。本节介绍 deb 包的开发流程。

:::note 待完善
单 deb 包开发模式研发流程仍在探索阶段，本节当前记录现状与设计原则，实际内容待研发流程稳定后补充（ADR D3）。
:::

## deb 包结构

RDK 源码 `source/` 下每个 `hobot-*` 目录是一个 deb 包源码。与标准 Debian 打包（手写 `debian/control`、`debian/rules` + `dpkg-buildpackage`）不同，RDK 采用「预置文件树 + `mk_debs.sh` 动态生成 control」的方式，目录结构示意如下：

```
hobot-xxx/
├── debian/           # 打包内容根目录（其中的文件树会安装到根文件系统）
│   ├── usr/          # 安装到 /usr 下的文件（bin、lib、include 等）
│   ├── lib/          # 安装到 /lib 下的文件（部分包使用）
│   └── DEBIAN/       # 可选，预置的 control / postinst 等
└── ...               # 包内容源文件（源码、配置、固件等）
```

其中 `debian/control` 由 `mk_debs.sh` 的 `gen_contrl_file()` 按包名、版本、依赖动态生成，无需手写；安装路径由 `debian/` 下的文件树位置决定。

## 开发流程

1. 在 `source/` 下创建新的 `hobot-xxx/` 目录
2. 按目标安装路径组织 `debian/` 下的文件树（对应 `/usr`、`/lib` 等）
3. 在 `mk_debs.sh` 中添加该包的构建 case（拷贝文件、生成 control 与依赖）
4. 编译：`./mk_debs.sh hobot-xxx`（内部使用 `fakeroot dpkg -b` 打包）
5. 产物输出到 `out/product/deb_packages/hobot-xxx_<版本>_arm64.deb`
6. 安装到板端：`dpkg -i hobot-xxx_*.deb`

## 现有 deb 包列表

以下为 `mk_debs.sh` 当前支持的官方 deb 包（对应 `source/` 下的 `hobot-*` 目录）：

| 包名 | 说明 |
| --- | --- |
| `hobot-configs` | 系统配置文件、启动配置与服务 |
| `hobot-utils` | 系统工具（hobot-log 等） |
| `hobot-wifi` | Wi-Fi 脚本 |
| `hobot-io` | I/O 库 |
| `hobot-io-samples` | I/O 库示例代码 |
| `hobot-multimedia` | 多媒体库 |
| `hobot-multimedia-dev` | 多媒体库开发工具 |
| `hobot-multimedia-samples` | 多媒体示例 |
| `hobot-camera` | 摄像头/sensor 驱动 |
| `hobot-dnn` | 深度学习推理框架 |
| `hobot-spdev` | 多媒体 + 推理框架 |
| `hobot-sp-samples` | 多媒体 + 推理框架示例代码 |
| `hobot-miniboot` | miniboot 升级包 |
| `hobot-audio-config` | 音频服务 |
| `hobot-firmware` | 网口/USB 等外设固件 |
| `hobot-ethercat` | EtherCAT 支持 |

完整列表及源码目录说明见 [BSP 源码目录结构](/Advanced_development/environment_build/bsp_source_layout)。

## 相关文档

- [系统定制](../02_system_customization/01_system_customization.md)
- [搭建开发环境](/Advanced_development/environment_build/environment_build)
- [BSP 源码目录结构](/Advanced_development/environment_build/bsp_source_layout)
