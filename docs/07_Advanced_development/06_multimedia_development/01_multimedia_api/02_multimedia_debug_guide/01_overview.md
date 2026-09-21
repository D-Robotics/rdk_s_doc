---
sidebar_position: 1
title: 概述
description: RDK S100/S600 多媒体系统调试指南总览：范围、子系统原理与调试准备
---

# 概述

本调试指南覆盖多媒体 pipeline 的系统级调试方法，各模块的调试入口见下方[范围](#范围)节，部分模块后续补充。

多媒体章节中包含多种硬件加速单元，多个硬件单元可以组合成复杂的 pipeline，所以需要丰富的调试方法。调试方法与软件框架紧密相关，所以参考软件框架：

![软件框架](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/soft_framework.jpeg)

## 范围

本篇介绍多媒体 pipeline 的系统级调试方法。内容覆盖整条视频通路上的调试与观测节点，以及跨模块的故障定位思路。

帮助开发者定位“无图像、花屏、卡顿丢帧、同步异常”等系统级问题。

各模块自身的调试方法见各自文档，本篇不再重复，只做引用：

| 模块 | 调试方法位置 |
| --- | --- |
| HBN（视频通路） | [HBN 调试指南](./02_hbn_debug_guide.md) |
| Codec（VPU / JPU） | [MediaCodec 调试指南](./03_mediacodec_debug_guide.md) |
| DRM / OpenGL ES / OpenCL / HB_MEM | 等待补充 |

:::info 平台说明
本文节点路径与命令以板端 debugfs/procfs 实测为准；S100 与 S600 的差异内容以页面上的产品切换标注分流，不逐一说明。
:::

## 子系统原理

多媒体数据流沿“采集 → 处理 → 输出”方向流转。采集侧 Camera 经 SerDes 与 MIPI 进入 CIM/VIN；处理侧经 ISP、PYM、GDC 等模块完成图像处理与下采样；输出侧经 VENC/VDEC 编解码与 Display 输出。各模块以 vnode 形式接入 Vflow pipeline，由 HBN 框架统一调度。

数据流示意如下：

![数据流示意](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/debug/camsys_data_flow.jpg)

模块概念与硬件框图详见 [基础框架 - HBN](../01_hbn_api.md)。

## 准备工作

### 硬件资源

开发板（RDK S600 或 RDK S100），板端可远程登录，登录方式见 [远程登录](../../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)。

<DocScope products="RDK S600">

本文节点路径与命令以 RDK S600 板端实测为准。

</DocScope>

<DocScope products="RDK S100">

本文节点路径与命令以 RDK S100 板端实测为准。

</DocScope>

### 软件资源

- debugfs 默认挂载于 `/sys/kernel/debug`，procfs 位于 `/proc`，下文节点均在此二者下。
- 访问 debugfs 与部分 procfs 节点需 root 权限。
- 统计节点的前提是 pipeline 已在运行，观测前需先跑通一路 sample pipeline。

<DocScope products="RDK S600">

观测前先跑通一路 `sample_pipeline`：运行 `single_pipe_vin_isp_ynr_pym_vpu` 用例（IMX219 传感器），用例说明见 [sample_pipeline 使用说明](../../02_multimedia_sample_s600/09_sample_pipeline.md)。

</DocScope>

<DocScope products="RDK S100">

观测前先跑通一路 `sample_pipeline`：运行 `single_pipe_vin_isp_ynr_pym_vpu` 用例（IMX219 传感器），用例说明见 [sample_pipeline 使用说明](../../02_multimedia_sample/09_sample_pipeline.md)。

</DocScope>

### 用户态库（libcam / libvpf）

相机通路不经过独立服务进程，由 sample/应用直接调用用户态库建立 pipeline：相机侧为 libcam，视频处理侧为 libvpf，均通过底层 vnode 接口接入 HBN 框架。库本身不是独立进程，无独立调试节点，其行为通过下文统计节点反映。两者日志等级通过环境变量控制（四级：`1`=err、`2`=warning、`3`=info、`4`=debug，默认 warning，`4` 输出全部打印）：

```bash
export CAM_LOGLEVEL=4     # libcam
export VPF_LOGLEVEL=4     # libvpf
```

环境变量需在运行 sample 的同一 shell 设置。变量名与是否生效以 sample 实现为准，板端复核。

## 相关文档

- 前置：[基础框架 - HBN](../01_hbn_api.md)
- 模块 API：
  - [视频输入 - VIN](../04_vin_api.md)
  - [图像信号处理 - ISP](../05_isp/01_overview.md)
  - [视频处理框架 - PYM](../07_vpf_pym_api.md)
  - [畸变矫正 - GDC](../08_gdc_api.md)
  - [显示输出 - DISP](../09_disp_api.md)
  - [编解码 - MediaCodec](../10_mediacodec_api.md)
- 关联：[多路 Camera 及与 Lidar 同步](../12_camerasync.md)
- 用户层（封装层简易接口）：[多媒体简易 API](/Simple_API/multimedia_api)（与底层 API 双向互链）
