---
sidebar_position: 1
title: 概述
description: RDK S100/S600 多媒体系统调试指南总览：范围、数据流通路与调试准备
---

# 概述

多媒体章节中包含多种硬件加速单元，多个硬件单元可以组合成复杂的 pipeline，所以需要丰富的调试方法。

调试方法与软件框架紧密相关，从软件框架中可以看出（高亮部分），存在 5 种类型的 API：

![软件框架](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/debug/API.jpg)

| 接口类型 | 硬件模块 | 链接 |
| --- | --- | --- |
| HBN | VIN、ISP、PYM、GDC、STITCH、Camera 相关 | [HBN 调试指南](./02_hbn_debug_guide.md) |
| MediaCodec | VPU、JPU | [MediaCodec 调试指南](./03_mediacodec_debug_guide.md) |
| OpenGL ES、OpenCL | 3DGPU | 等待补充 |
| DRM | IDU | 等待补充 |
| HB_MEM | DDR | 等待补充 |

本篇介绍多媒体 pipeline 的系统级调试方法。内容覆盖整条视频通路上的调试与观测节点，以及跨模块的故障定位思路。

帮助开发者定位“无图像、花屏、卡顿丢帧、同步异常”等系统级问题。

:::info 平台说明
本文节点路径与命令以板端 debugfs/procfs 实测为准；S100 与 S600 的差异内容以页面上的产品切换标注分流，不逐一说明。
:::

## 数据流通路

多媒体数据流沿“采集 → 处理 → 输出”方向流转：

- **采集侧**：Camera 经 SerDes 与 MIPI 进入 CIM/VIN
- **处理侧**：经 ISP、PYM、GDC、GPU 等模块完成图像处理与下采样
- **输出侧**：经 VENC/VDEC 编解码与 Display 输出

各模块的调度方式按接口类型分为两类：

- **HBN 框架统一调度**：VIN、ISP、PYM、GDC、STITCH 以 vnode 形式接入 Vflow pipeline，由 HBN 框架统一调度
- **各自独立接口控制**：Display、VENC、VDEC、GPU 等模块通过各自独立的接口进行控制与调度

数据流示意如下：

![数据流示意](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/debug/camsys_data_vflow.jpg)

模块概念与硬件框图详见 [基础框架 - HBN](../01_hbn_api.md)。

## 相关文档

- 前置：[基础框架 - HBN](../01_hbn_api.md)
- 模块 API：
  - [视频输入 - VIN](../04_vin_api.md)
  - [图像信号处理 - ISP](../05_isp/01_overview.md)
  - [视频处理框架 - PYM](../07_vpf_pym_api.md)
  - [畸变矫正 - GDC](../08_gdc/01_gdc_overview.md)
  - [显示输出 - DISP](../09_disp_api.md)
  - [编解码 - MediaCodec](../10_mediacodec_api.md)
- 关联：[多路 Camera 及与 Lidar 同步](../12_camerasync.md)
- 用户层（封装层简易接口）：[多媒体简易 API](/Simple_API/multimedia_api)（与底层 API 双向互链）
