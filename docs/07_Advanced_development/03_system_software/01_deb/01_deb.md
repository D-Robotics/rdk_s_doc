---
title: "5.3.1 deb 包开发"
sidebar_position: 1
description: "RDK deb 包开发流程与规范"
---

# 5.3.1 deb 包开发

RDK 系统基于 Debian/Ubuntu，系统组件以 deb 包形式分发。本节介绍 deb 包的开发流程。

:::note 待完善
单 deb 包开发模式研发流程仍在探索阶段，本节当前记录现状与设计原则，实际内容待研发流程稳定后补充（ADR D3）。
:::

## deb 包结构

RDK 源码 `source/` 下每个 `hobot-*` 目录是一个 deb 包源码，包含：

```
hobot-xxx/
├── debian/           # Debian 打包规则
│   ├── control       # 包名、依赖、描述
│   ├── rules         # 编译与安装规则（Makefile 入口）
│   ├── install        # 文件安装路径映射
│   └── changelog     # 版本历史
├── src/ 或 源码文件   # 包内程序源码
├── Makefile          # 编译入口
└── LICENSE
```

## 开发流程

1. 在 `source/` 下创建新的 `hobot-xxx/` 目录
2. 编写 `debian/control`（包名、依赖、描述）
3. 编写 `debian/rules`（编译规则）
4. 编写源码 + `Makefile`
5. 编译：`cd source/hobot-xxx && dpkg-buildpackage -us -uc -b`
6. 安装到板端：`dpkg -i hobot-xxx_*.deb`

## 现有 deb 包列表

| 包名 | 说明 |
| --- | --- |
| `hobot-io` | 简易 I/O API（sp_vio/sp_codec/sp_display/sp_sys） |
| `hobot-spdev` | Python 简易 API |
| `hobot-dnn` | BPU 推理库 |
| `hobot-camera` | 摄像头驱动 |
| `hobot-drivers` | 其他驱动 |
| `hobot-multimedia` | 多媒体库（cdev） |
| `hobot-configs` | 系统配置文件 |
| `hobot-utils` | 系统工具 |
| `hobot-wifi` | Wi-Fi 驱动 |

完整列表见 [5.1.2 BSP 源码目录结构](/Advanced_development/environment_build/bsp_source_layout)。

## 相关文档

- [5.3.2 系统定制](../02_system_customization/01_system_customization.md)
- [5.1.1 搭建开发环境](/Advanced_development/environment_build/environment_build)
- [5.1.2 BSP 源码目录结构](/Advanced_development/environment_build/bsp_source_layout)
