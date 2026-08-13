---
sidebar_position: 0
slug: /RDK
title: D-Robotics RDK 套件
description: "RDK S100/S600 套件介绍、资料索引、文档导航、三模式导览、版本发布"
---

# D-Robotics RDK 套件

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 套件介绍

**D-Robotics Developer Kits**，简称 RDK 套件，是基于 D-Robotics 计算平台打造的机器人开发者套件，涵盖硬件板卡与配套软件，帮助开发者快速搭建机器人原型、开展评测与验证。套件硬件产品线包括 RDK X3、RDK X3 Module、RDK X5、RDK Ultra、RDK S100 系列、RDK S600 系列。本手册面向 **RDK S100 / RDK S600**。

RDK OS 是基于 Ubuntu 定制的板端操作系统镜像，烧录后即开箱可用；TogetheROS.Bot（tros.b）机器人中间件预装在镜像内。详见 产品共识（标准仓库）。

:::note 注意
确认系统版本号：`cat /etc/version`；`rdkos_info` 查看板卡与运行时信息。详见 [系统状态查询](./01_Quick_start/03_install_os_and_setup/system_status.md)。
:::

### 产品介绍

<DocScope products="RDK-S100">

**RDK S100 系列** 是一款高性能开发套件，具有 80/128 TOPS 端侧推理算力与 6 核 ARM A78AE 处理能力，支持 2 路 MIPI Camera 接入，4 路 USB 3.0 接口，2 路 PCIe3.0 接口，充分满足各类场景的使用需求。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/image-rdks100-serials.png" alt="RDK S100 series" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

<DocScope products="RDK-S600">

**RDK S600 系列** 是一款高性能开发套件，具有 560 TOPS 端侧推理算力与 18 核 ARM A78AE 处理能力，支持 6 路 MIPI Camera 接入，6 路 USB 3.0 接口，4 路 PCIe3.0 接口，充分满足各类场景的使用需求。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_600_v0p1_mainboard_overview.png" alt="RDK S600 series" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

## RDK OS 介绍

**RDK OS** 是基于 Ubuntu 定制的板端操作系统镜像，针对 RDK 板卡的 BPU/CPU/MCU/外设做了适配、驱动集成与预装示例。烧录后即获得开箱可用的 Linux 环境，无需自行编译内核或拼装根文件系统。

### 预装能力

RDK OS 开箱即有：

- **BPU 运行时**：`hobot-dnn`（UCP/DNN，BPU 推理栈）。
- **相机支持**：`hobot-camera`（sensor 支持包）。
- **tros.b 机器人中间件**：基于 ROS/ROS2 的 TogetheROS.Bot，预装在镜像内（见 [使用 TogetheROS.Bot](/Quick_start/next_steps/trosb)）。
- **算法工具链运行时**：可加载 `.hbm` 量化模型推理。
- **apt 源**：D-Robotics 官方源（`archive.d-robotics.cc`）+ Ubuntu 源，见 [软件包管理 apt](/System_configuration/system_update/apt_usage)。

## 资料索引

> 系统镜像、工具、硬件资料下载。商业资料请切换 **FTP 下载** 选项，按表格路径在 FTP 服务器获取。

### 系统镜像

| 平台 | 下载地址 |
| --- | --- |
| RDK S100 | [archive.d-robotics.cc/rdk_s100](https://archive.d-robotics.cc/downloads/os_images/rdk_s100/) |
| RDK S600 | [archive.d-robotics.cc/rdk_s600](https://archive.d-robotics.cc/downloads/os_images/rdk_s600/) |

### 工具

| 工具 | 说明 |
| --- | --- |
| [XBurn](https://developer.d-robotics.cc/xburn_doc/install) | 系统烧录工具 |
| [RDK Studio](https://developer.d-robotics.cc/) | 集成开发环境 |
| 交叉编译工具链 | 见 [5.1.1 搭建开发环境](/Advanced_development/environment_build/environment_build) |

### 硬件资料

| 类别 | 说明 |
| --- | --- |
| 原理图 / 接口标注图 / 机械尺寸图 | 见 [1.1 硬件介绍](/01_hardware_introduction) 各 kit 与扩展板文档 |
| STEP 3D 模型 / 产品渲染图 | 见 [1.1 硬件介绍](/01_hardware_introduction) 硬件资料节 |
| 认证配件清单（AVL） | 见 [1.1 硬件介绍](/01_hardware_introduction) 配件清单节 |

### 商业版资料

:::tip 商业支持
商业版提供更完整的功能支持、更深入的硬件能力开放和专属的定制内容。为确保内容合规、安全交付，通过以下方式开放访问权限：

1. 填写问卷：提交机构信息、使用场景等基本情况
2. 签署保密协议（NDA）：双方确认后签署
3. 内容释放：通过私有渠道开放商业版本资料

问卷链接：https://horizonrobotics.feishu.cn/share/base/form/shrcnpBby71Y8LlixYF2N3ENbre
:::

## 文档导航

- **第 1 章 [快速开始](/Quick_start)**：硬件介绍、外设连接、烧录、入门配置、远程登录。
- **第 2 章 [系统配置](/System_configuration)**：网络、蓝牙、系统更新、srpi-config、config.txt、显示音频、存储、时钟、用户权限、日志、调试串口。
- **第 3 章 [开发示例](/Demos)**：外设、多媒体、算法（分类/检测/分割/姿态/语音/摄像头推理）demo，C/C++ 与 Python 对照。
- **第 4 章 [简易 API](/Simple_API)**：多媒体与推理的封装层简易接口。
- **第 5 章 [进阶开发](/Advanced_development)**：deb/系统软件/驱动/多媒体/MCU/算法工具链/VDSP（模式 3）。
- **第 6 章 [常见问题](/FAQ)**：按问题域分类的 FAQ。
- **第 7 章 [附录](/Appendix)**：RDK 专属命令与 Linux 命令用法。

## 三模式导览

| 模式 | 读者 | 推荐路径 |
|---|---|---|
| 模式 1 直接使用 | 个人/极客/学生 | 第 1 章快速开始 → 第 2 章系统配置 → 第 3 章开发示例 → 第 4 章简易 API |
| 模式 2 产品集成 | 产品公司研发 | 第 2 章系统配置 + 第 5 章进阶开发中的系统定制（apt/配置层/重制镜像） |
| 模式 3 高度定制 | 商业客户/深度团队 | 第 5 章进阶开发全章（deb/驱动/多媒体/MCU/工具链/VDSP） |

详见 产品共识（标准仓库）§3。

## 版本发布

### RDK S100 版本发布

- [RDKS100_LNX_SDK_V4.0.5_20260507](./10_Release_Note/01_s100/01_v4_0_5_260507.md)
- [RDKS100_LNX_SDK_V4.0.5](./10_Release_Note/01_s100/02_v4_0_5.md)
- [RDKS100_LNX_SDK_V4.0.4](./10_Release_Note/01_s100/03_v4_0_4.md)
- [RDKS100_LNX_SDK_V4.0.3](./10_Release_Note/01_s100/04_v4_0_3.md)
- [RDKS100_LNX_SDK_V4.0.2](./10_Release_Note/01_s100/05_v4_0_2.md)

### RDK S600 版本发布

- [RDKS600_LNX_SDK_V5.1.0](./10_Release_Note/02_s600/03_v5_1_0.md)
- [RDKS600_LNX_SDK_V5.0.1_BETA](./10_Release_Note/02_s600/02_v5_0_1.md)
- [RDKS600_LNX_SDK_V5.0.0_BETA](./10_Release_Note/02_s600/01_v5_0_0.md)

## 生态项目对接

针对基于 RDK 平台的产品开发、行业落地或批量部署项目，设立 **"地瓜生态项目对接中心"** 作为统一协同入口。

当您涉及以下场景时，建议通过该入口提交项目信息：

- 产品化或量产规划
- 系统架构评估与方案确认
- 模块适配与性能优化支持
- 商业项目联合开发
- 批量采购前的技术确认

👉 项目对接入口：[地瓜生态项目对接交流](https://horizonrobotics.feishu.cn/share/base/form/shrcnpxBa3PjdjFmtxZS3tBXw0e)

:::note 说明
本入口适用于明确的项目或商业落地需求。日常技术问题建议优先通过论坛问答或 [FAQ](/FAQ) 章节解决。
:::

