---
sidebar_position: 1
title: "ISP概览"
description: "RDK S100/S600 ISP 硬件框图、输入输出通路与硬件规格"
---

# ISP概览

## 概述

ISP（Image Signal Processing，图像信号处理）是一种用于处理前端图像传感器输出信号的关键单元，其主要功能是适配不同厂商的图像传感器，以实现最佳的图像质量和性能。

本文介绍 ISP 的硬件框图、输入输出通路与硬件规格。ISP 软件开发请参考本目录下另两篇：[ISP HBN API](./isp_hbn_api) 与 [ISP Tuning API](./isp_tuning_api)。

## 硬件框图

::::doc_scope{products="RDK S100"}
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/video-path-hw.png" alt="S100 视频通路硬件框图（Sensor → MIPI RX → CIM → ISP → PYM，CPE0 / CPE1 / CPE Lite 分组 + AXI 总线）" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

S100 的 ISP 硬件有 **2 个**（ISP0 / ISP1），两个 ISP core 可以并行处理视频流。

上图把媒体模块划分成三组连续的 online 处理单元——**CPE（Camera Process Engine）**，每个 CPE 由 MIPI RX + CIM + ISP + YNR + PYM 组成，S100 上共 CPE0 / CPE1 / CPE Lite 三组。

:::tip YNR 降噪
S100 的 YNR 硬件有 **1 个**（YNR1），支持 2DNR / 3DNR。只有 CPE1 这一路的 ISP1，后级才能直接连接 YNR（`ISP1 → YNR1 → PYM1` 全 online 链路）；不串 YNR、直接 `ISP → PYM` 输出也可以。
:::
::::

:::doc_scope{products="RDK S600"}
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/s600-video-path-hw.png" alt="S600 视频通路硬件框图（Sensor → MIPI RX → CIM → ISP → PYM + AXI 总线）" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

S600 的 ISP 硬件有 **4 个**（ISP0 ~ ISP3），通路构成与 S100 相同（Sensor → MIPI RX → CIM → ISP → PYM）。S600 的能力：

- **ISP**：4 个（ISP0 ~ ISP3）。
- **YNR**：4 个（YNR0 ~ YNR3），其中 **YNR0~2 只支持 2DNR，YNR3 支持 2DNR & 3DNR**。
:::

再看 ISP 内部。下图的 ISP 里面，处理管线固定为 `MCFE → RAW Domain → RGB Domain → Output Formatter` 四级，逐级完成多路调度、RAW 域校正、RGB 域色彩处理与输出格式转换：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/isp-pipeline.png" alt="ISP 图像信号处理硬件管线（CIM → MCFE → RAW Domain → Demosaic → RGB Domain → Output Formatter → 3DNR → PYM）" style={{ width: '100%', maxWidth: '1300px', height: 'auto', display: 'block', margin: '0 auto' }} />

**MCFE**：Multi-Context Front End，用于 ISP 多路调度控制与 buffer 管理，逐路进行 Multi-camera 图像处理。

**RAW Domain**：RAW 域图像处理，负责 RAW 数据进 ISP 后的各路校正与处理，按功能大致分为以下几类：

- **输入与格式**：input port（含 input crop 功能）、channel switch、input formatter、sensor offset linear、digital gain。
- **Gamma / 位深处理**：gamma FE（即 decompander）、gamma_sqrt、gamma_sq、gamma BE。
- **坏点与噪声**：raw frontend、static defect pixel、sinter。
- **白平衡与标定**：static white balance、radial shading correction、mesh shading correction、chromatic aberration。
- **增益与去马赛克**：digital gain iridix、iridix、demosaic。

**RGB Domain**：RGB 域图像处理，负责把 RGB 数据做色彩校正与格式调整：

- **色彩校正**：purple fringe correction、color matrix、RGB gamma。
- **裁剪与降噪**：crop、cnr。
- **Gamma 正反向**：gamma RGB forward SQ、gamma RGB reverse SQ。

**Output Formatter**：CS（color space）转换，将 RGB 通道数据转换成 YUV 等格式，再由 output control 进行输出控制。

## ISP 输入输出通路

每个 ISP 都支持 online / offline 两种接入模式，共 12 路输入，按场景取舍：

- **online 直连输入（4 路，`ISP Ch0 ~ Ch3`）**：由 CIM 直连 ISP，数据不经过 DDR。优点是延迟低、省内存带宽；限制是只能接收本组 CPE 前级 CIM 的数据（S100 上 ISP0 ← CIM0、ISP1 ← CIM1）。
- **offline memory 输入（8 路，`ISP Ch4 ~ Ch11`）**：从 DDR 读取 CIM 写入的数据。离线通路**不局限于本组 CPE 内部**——每路 ISP 都可以选择任意一个 CIM 输出的数据（例如 ISP0、ISP1 都可以取 CPE0 或 CPE1 的 CIM 输出），组网灵活，代价是多一跳内存读写（带宽和延迟开销）。

ISP 的输出支持两种方式，且可以并行：

- **streaming output**：处理结果直通后级模块（YNR / PYM），走 online 输出链路。
- **offline output**：处理结果写 DDR，供后级模块或 CPU 从内存读取。

软件配置时，输入模式通过 `slot_id` 区分（online 取 0 至 3、offline 取 4 至 11），输出方式通过 `ochn_attr` 配置，见「HBN 框架接口用到的数据结构」。

## ISP 硬件规格

ISP 硬件 IP 本身的主要特性：

- **Multi-camera support**：每个 ISP 硬件 IP 支持 16 路，软件最大可接入 12 路 sensor，另外 4 路用于 safety slots。
- **最大分辨率**：4096 × 2160。
- **支持灵活的颜色滤波阵列（CFA）格式**：RGGB、RCCB、RCCG、RYYCy。
- **模组数据格式**：
  - 线性数据：Raw 8, 10, 12, 14, 16, 20, 22, 24-bit。
  - 压缩数据：Raw 8, 10, 12, 14, 16-bit；Decompanding：Log-1, PWL。
- **功能安全特性**：内置自检（BIST）；专用功能安全电路持续巡检；异常中断控制器。

## API使用场景

**串流场景**：需要把 ISP 接入视频通路（创建 vnode 节点、配置属性、绑定前后级）时，使用 [ISP HBN API](./isp_hbn_api)，把 ISP 串成 pipeline 里的一个处理节点。

**调参场景**：流跑起来之后，需要在运行时控制 ISP（切 2A 自动/手动、设曝光/白平衡、取统计）时，使用 [ISP Tuning API](./isp_tuning_api)。


## 相关文档

- [视频输入输出 - VIO](/Advanced_development/multimedia_development/multimedia_api/vio_api)
- [视频处理框架 - VPF/PYM](/Advanced_development/multimedia_development/multimedia_api/vpf_pym_api)

