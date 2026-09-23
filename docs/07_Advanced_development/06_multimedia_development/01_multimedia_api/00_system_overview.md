---
sidebar_position: 1
title: "系统概述"
description: "RDK S100/S600 多媒体系统概述"
---

# 系统概述

## 文档使用方法
### 文档组成
- 第 1 小节 : 整体描述多媒体系统
- 第 2 小节 : 多媒体系统的核心软件框架 HBN ( 目前多媒体系统有部分模块，没有包含在 HBN 框架中，后面会详细描述 )
- 第 3 小节 : 多媒体系统的调试手段
- 第 4-14 小节 : 详细介绍各个独立模块 , 包括基本信息、使用方法、注意事项等
- 第 15 小节 : 图像质量的调试方法

### 如何使用文档
1. 掌握多媒体系统的整体和核心框架
    - 详细阅读多媒体章节的第 1 小节，掌握多媒体系统的组成部分（包含多媒体章节的第 4-12 小节）以及各个部分之间的关系
    - 详细阅读多媒体章节的第 2 小节，掌握多媒体系统的核心软件框架 HBN
    - 浏览多媒体章节的第 3 小节，了解多媒体系统有哪些调试手段，在后面使用过程中遇到问题时，知道有哪些手段可以调试
2. 结合 示例代码 章节的 demo, 逐个了解多媒体章节的第 4-14 小章节的模块，至此可以实现摄像头采集和处理链路的搭建
3. 按照多媒体章节的第 15 小节调试图像质量


## 整体概述
多媒体系统集成了多种硬件加速单元，使 CPU 专注于其优势任务：运行操作系统和处理业务逻辑。
同时，系统提供了简洁灵活的 API，用于高效连接和协调硬件加速单元。以下将从硬件与软件两个方面进行介绍：
1. 硬件方面：详述硬件模块的组成结构及各硬件单元之间的数据交互机制。
2. 软件方面：解析软件 API 的设计与功能，并说明如何利用 API 实现不同硬件单元间的高效数据协作

## 硬件方面

| 模块 | 全称 | 解释|
| --- | --- | --- |
| MIPI RX | Mobile Industry Processor Interface Receiver | 移动产业处理器接口（接收端），MIPI联盟制定的标准，用于接收摄像头输入的图像数据 |
| CIM | Camera Interface Manger | Camera接入管理模块，支持online或offline工作 |
| ISP | Image Signal Processor | 图像信号处理器 |
| PYM | Pyramid | 金字塔处理模块: 图像缩小及ROI |
| GDC | Geometric Distortion Correction | 几何畸变校正模块 |
| STITCH | Stitch hardware Module | 图像拼接处理模块 |
| IDU | Image Display Unit | 图像显示单元 |
| MIPI TX | Mobile Industry Processor Interface Transmitter | 移动产业处理器接口（发送端），MIPI联盟制定的标准，用于向显示设备输出图像数据 |
| IDE | Image Display Engine | 包含图像显示单元（IDU）、图像数据输出模块（MIPI TX） |
| VPU | Video Processing Unit | 视频处理单元，完成视频的编解码功能，支持 H.264/H.265 |
| JPU |	JPEG Processing Unit | JPEG 图片处理单元，完成 JPEG、 MJPEG 的编解码功能 |
| 3DGPU | 3D Graphics Processing Unit |	3D 图像渲染的加速单元 |

### 框架
多媒体章节包含多种硬件加速单元，下面分两种类别介绍
1. Camera 子系统相关模块：MIPI RX、CIM、ISP、YNR、PYM、GDC、STITCH、IDU、MIPI TX
2. 其他多媒体模块：VPU、JPU、3DGPU

其中 Camera 子系统相关模块在硬件上存在关联，详细描述如下：
<DocScope products="RDK S100">
![硬件框架简易](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/s100_hardware_framework_simple.png)
图例（右上角）解释：
- OTF： 硬件直连，软件配置上命名为 online 模式
- DMA IN/ DMA OUT：通过 DMA 把硬件处理单元的输入或输出与DDR交互，软件配置上命名为 offline 模式

硬件加速单元解释：
- MIPI RX: 3路CDPHY，每路为DPHY最大2.5Gbps/lane x 4lane或CPHY最大2.5Gsps/trio x 3trio，每路支持4VC，最多支持12路接入。
- MIPI TX（图中未画出）: 2路DPHY，每路为2.5Gbps/lane x 4lane，支持RX bypass与IDU输出方式。
- CIM: 与 MIPI RX对接，可以与其他模块直连，或者存储到 DDR 中， 其他模块再从 DDR 读取
- ISP: 2个ISP设备，每个ISP最大支持2x4K@60fps处理。
- YNR：1个YNR设备, 每个YNR最大支持2x4K@60fps处理。
- PYM: 3个PYM设备，每个PYM最大支持4K@60fps处理。
- GDC: 1个GDC设备，4K@60fps处理。
- STITCH: 1个 STITCH 设备，待补充。
</DocScope>

<DocScope products="RDK S600">
![硬件框架简易](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/s600_hardware_framework_simple.png)

硬件加速单元解释：
- MIPI RX: 6路CDPHY，每路为DPHY最大2.5Gbps/lane x 4lane或CPHY最大2.5Gsps/trio x 3trio，每路支持4VC，最多支持24路接入。
- MIPI TX（图中未画出）: 2路DPHY，每路为2.5Gbps/lane x 4lane，支持RX bypass与IDU输出方式。
- CIM: 与 MIPI RX对接，可以与其他模块直连，或者存储到 DDR 中， 其他模块再从 DDR 读取
- ISP: 4个ISP设备，每个ISP最大支持2x4K@60fps处理。
- YNR：4个YNR设备， 只有 YNR3 支持 3DNR，每个YNR最大支持2x4K@60fps处理。
- PYM: 5个PYM设备，每个PYM最大支持4K@60fps处理。
- GDC: 2个GDC设备，4K@60fps处理。
- STITCH: 1个 STITCH 设备，待补充。
</DocScope>

### 数据交互
芯片内置了专用数据通道，MIPI RX 接收到的摄像头数据可直接连接 CIM、 ISP 和 YNR等模块，实现视频数据的高速直传，不需要读写 DDR ，从而节省 DDR 带宽，大幅提升性能。
然而，由于硬件资源是有限的，当接入更多路摄像头时，必须通过分时复用的方式进行处理，视频数据必须通过 DDR 进行缓存。

基于数据传输是否依赖 DDR 缓存，硬件加速单元之间的数据交互方式可以分为以下两种模式：
1. Offline 模式 ( 图中 率色箭头)：数据通过 DDR 完成传输，上游模块将数据写入 DDR，下游模块从 DDR 读取。
2. Online 模式 ( 图中 红色箭头)：数据直接从上游模块传递至下游模块，无需读写 DDR，显著提升性能。

<DocScope products="RDK S100">
![硬件框架](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/s100_hardware_data_path.svg)

- CIM: 可online输出到ISP0/ISP1(RAW)与PYM0/PYM1(YUV)，也可offline下DDR，之后各模块通过DDR读取使用数据流。
- ISP: 2个ISP设备，各支持4路online+8路offline输入。
- YNR（图中未画出）：1个YNR设备，只能和 ISP1 online 的方式连接
- PYM: 3个PYM设备，其中PYM0/PYM1为全功能模块支持online/offline，PYM4只支持offline
- GDC: 1个GDC设备，只支持offline方式。
- STITCH: 1个 STITCH 设备，只支持offline方式。
- IDE（图中最下面）：2个IDE设备，每个 IDE 包括一个 IDU 和 MIPI TX， MIPI RX 可以直接连接到 MIPI TX输出， 也可以通过 IDU 读取DDR的数据再输出

各硬件加速单元支持的输入/输出数据交互方式如下：

| 硬件加速单元 | 输入方式 | 输出方式 |
| --- | --- | --- |
| MIPI | online | online |
| CIM0 | online/offline | online/offline |
| CIM1 | online | online/offline |
| CIM4 | online | offline |
| STITCH | offline | offline |
| ISP(0,1) | online/offline | online/offline |
| PYM(0,1) | online/offline | offline |
| PYM(4) | offline | offline |
| GDC | offline | offline |
| YNR | online | online |

</DocScope>

<DocScope products="RDK S600">
![硬件框架](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/s600_hardware_framework.png)

- CIM: 可online输出到ISP0/ISP1/ISP2/ISP3(RAW)与PYM0/PYM1/PYM2/PYM3(YUV)，也可offline下DDR，之后各模块通过DDR读取使用数据流。
- ISP: 4个ISP设备，各支持4路online+8路offline输入，每个ISP最大支持2x4K@60fps处理。
- YNR（图中未画出）：4个YNR设备，只能和 ISP1 online 的方式连接
- PYM: 5个PYM设备，其中PYM0/PYM1/PYM2/PYM3为全功能模块支持online/offline，PYM4只支持offline，4K@120fps处理。
- GDC: 2个GDC设备，只支持offline方式，4K@60fps处理。
- STITCH: 1个 STITCH 设备，只支持offline方式。
- IDE（图中最下面）：2个IDE设备，每个 IDE 包括一个 IDU 和 MIPI TX， MIPI RX 可以直接连接到 MIPI TX输出， 也可以通过 IDU 读取DDR的数据再输出

各硬件加速单元支持的输入/输出数据交互方式如下：

| 硬件加速单元 | 输入方式 | 输出方式 |
| --- | --- | --- |
| MIPI | online | online |
| CIM0 | online | online/offline |
| CIM1 | online | online/offline |
| CIM2 | online | online/offline |
| CIM3 | online/offline | online/offline |
| CIM4 | online | offline |
| CIM5 | online | offline |
| STITCH | offline | offline |
| ISP(0,1,2,3) | online/offline | online/offline |
| PYM(0,1,2,3) | online/offline | offline |
| PYM(4) | offline | offline |
| GDC(0,1) | offline | offline |
| YNR(0,1,2,3) | online | online |

</DocScope>

备注： 此处仅为基本功能描述，具体方案设计的典型使用场景与相关限制说明请参见 各个模块的描述。

## 软件方面
### 框架

![软件框架](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/soft_framework.jpeg)

下面从左向右介绍每个 API 的作用：
1. HBN API: 包含了 HBN Framework API、ISP API、Camera API，覆盖了摄像头采集链路的所有模块
    - HBN Framework API: 多媒体系统软件的核心框架 , 把每个模块作为一个节点（ vnode），然后把每个模块连接起来形成流水线 (vflow)，目前涵盖了 VIN， ISP， VSE， GDC， 2DGPU, 详细见 HBN 框架接口说明
    - ISP API: 用于动态配置和获取 ISP 模块参数，详细见 图像质量 ISP, ISP 模块的静态参数配置和数据流转在 HBN Framework 中实现
    - Camera API: 用于配置 Camera Sensor，没有被 HBN Framework API 覆盖，但是可以通过接口 attach 到 VIN 节点 ,详细见 视频接入 Camera
2. MediaCodec API: 用于控制 VPU 和 JPU 模块，实现 H264 、 H265 、 JPEG 编解码的功能 , 详细见 视频编解码 Codec
3. OpenGL ES、EGL、OpenCL、Vulkan: 3DGPU 的接口，通用的 3DGPU 框架 , 详细见 3DGPU
4. DRM API: 视频显示模块的接口，详细见 视频输出 Display
5. HB_MEM API: 实现在用户空间实现大块物理地址连续内存的管理，详细见 内存管理 Hbmem
    - 实现视频帧数据缓存：所有的硬件加速单元和 DMA 模块使用的内存必须是物理地址连续的
    - 实现视频帧数据流转：底层基于 dmabuf，实现了图像数据在内核态的不同驱动之间以及内核态和用户态之间传递

### 数据交互
在处理视频帧数据时，硬件加速单元要求使用物理地址连续的 DDR 缓存。为满足这一需求，多媒体系统软件提供了 HB_MEM API，具备以下特点 :

- 用户态内存分配 ：支持在用户态分配大块物理地址连续的内存，满足视频处理需求。
- 专用内存区域：分配的内存来源于 ION 区域（设备树中预留的内存区域， Linux 系统的标准分配器不会使用该区域）。详细见 ION 系统调试指南
- 零拷贝数据传输：基于底层的 dmabuf 框架，实现不同驱动间以及内核态与用户态之间数据的直接传递，避免内存拷贝操作。
- 高效内存管理：通过内存池（ mempool）避免频繁的内存申请和释放，从而减少用户态与内核态间的频繁切换，提升内存分配效率。
- 视频帧结构体支持：提供结构体 hb_mem_graphic_buf_t，用于描述视频帧的数据内容和格式信息。

因此多媒体系统软件中基于结构体 hb_mem_graphic_buf_t 完成不同硬件加速单元之间数据交换，对于不支持 hb_mem_graphic_buf_t 的 API，

可以通过各种方式完成转换，如下描述：
1. HBN API 与 MediaCodec API 使用的视频帧的数据结构是 hb_mem_graphic_buf_t
2. DRM API 底层也是基于 dmabuf 实现，可以从 hb_mem_graphic_buf_t 中获取 dmabuf 的文件描述符后转换成 dma_buf_map_t
3. OpenGL ES、EGL、OpenCL、Vulkan: 待补充