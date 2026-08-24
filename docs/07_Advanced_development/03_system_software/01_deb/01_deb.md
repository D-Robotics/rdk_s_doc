---
title: "deb 包开发"
sidebar_position: 1
description: "RDK deb 包开发流程与规范"
---

# deb 包开发

RDK 系统基于 Debian/Ubuntu，系统组件以 deb 包形式分发。本节面向模式 3（高度定制）用户，介绍如何在 deb/源码层开发系统组件；镜像层的 apt/配置层定制见 [系统定制](../02_system_customization/01_system_customization.md)。

**定位**：RDK 系统组件的 deb 包开发方法与打包规范，覆盖从源码目录组织、`mk_debs.sh` 打包到板端安装的完整链路。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要新增或修改系统组件（deb 包）的研发工程师。

**前置条件**：已搭建 BSP 编译环境（见 [搭建开发环境](/Advanced_development/environment_build/environment_build)）；了解 Debian 打包基本概念（control、postinst）。

**与其他模块关系**：deb 包是镜像定制（[系统定制](../02_system_customization/01_system_customization.md)）与板端组件升级（[系统 OTA](/Advanced_development/system_software/ota_system)、[miniboot 升级](/Advanced_development/system_software/ota_miniboot)）的产物来源；打包目录规范见 [BSP 源码目录结构](/Advanced_development/environment_build/bsp_source_layout)。

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

## 软件架构

RDK 的 deb 打包链路如下（区别于标准 Debian 手写 `debian/rules` 的方式）：

```mermaid
flowchart LR
    A["source/hobot-xxx<br/>包内容 + debian/ 文件树"] --> B["mk_debs.sh<br/>gen_contrl_file 生成 control"]
    B --> C["fakeroot dpkg -b 打包"]
    C --> D["out/product/deb_packages/<br/>hobot-xxx_版本_arm64.deb"]
    D --> E["板端 dpkg -i 安装"]
```

## 代码路径

- 源码目录：`source/hobot-*`（每个包的源码与 `debian/` 文件树）
- 打包脚本：`mk_debs.sh`（`gen_contrl_file()` 动态生成 control 与依赖）
- 产物目录：`out/product/deb_packages/hobot-xxx_<版本>_arm64.deb`

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

<!-- TODO(Sx): 待收集 —— 调试、常见问题：单 deb 包开发流程尚在探索阶段（ADR D3），暂无真实「现象→原因→解决」素材，待研发流程稳定后补充 -->

## 相关文档

- [系统定制](../02_system_customization/01_system_customization.md)
- [搭建开发环境](/Advanced_development/environment_build/environment_build)
- [BSP 源码目录结构](/Advanced_development/environment_build/bsp_source_layout)
