---
sidebar_position: 9
title: "显示输出 - Display"
description: "RDK S100/S600 显示输出子系统：IDU 显示控制器、MIPI DSI 输出与 HDMI 显示，基于标准 DRM 框架"
---

# 显示输出 - Display

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 模块说明

<DocScope products="RDK S100">

Display 子系统是 S100 项目中的视频显示引擎，其主要功能是为显示提供不同分辨率的视频输出。

</DocScope>
<DocScope products="RDK S600">

Display 子系统是 S600 项目中的视频显示引擎，其主要功能是为显示提供不同分辨率的视频输出。

</DocScope>

### 硬件架构

RDK S100/S600 的显示硬件由 SoC 内部的 **IDE** 和 **LT9611UXD** 桥接芯片两部分组成：IDE 内部集成 2 个 IDU，可同时输出两路视频，每路支持 MIPI DSI 和 MIPI CSI 两种输出方式；RDK 开发板通过 MIPI DSI 输出外接 LT9611UXD 桥接芯片转换为 HDMI 信号，实现 HDMI 显示输出。

#### IDE 架构：

IDE 图像显示引擎（Image Display Engine），包含图像显示单元（IDU）、图像数据输出模块（MIPI CSI-2 Device 和 MIPI DSI）。通过 IDU 从内存中读取图像数据进行处理，在 IDE 内部支持像素格式转换（RGB2YUV）和像素结构转换（DPI2IPI），使 IDU 的输出数据能够通过 MIPI DSI 和 MIPI CSI-2 Device 两种方式输出；MIPI DSI 和 MIPI CSI-2 Device 两个控制器共用一个 MIPI D-PHY。

IDU 完成图层处理后通过 DPI 接口送出像素流，最终由 MIPI D-PHY TX 串行化输出，有两种输出方式：

- **MIPI DSI 输出**：DPI 接口经 RGB2YUV 转换后直连 MIPI DSI TX，打包成 DSI 协议包输出，用于连接 MIPI DSI 接口的显示屏
- **MIPI CSI 输出**：DPI 接口经 DPI2IPI 转换后，通过 IPI 接口送入 MIPI CSI TX，打包成 CSI-2 包输出（参考下图绿色通路），用于经串行器连接串行屏等场景（目前软件不支持）

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/display/disp_ide_framework.png" alt="IDE 架构图" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

各模块说明如下：
- **IDU**：图像显示单元（Image Display Unit），从内存中读取图层 buffer 并完成图层合成与缩放，按显示时序输出像素流
- **DPI**：显示像素接口（Display Pixel Interface），IDU 的并行 RGB 像素输出接口，送入 MIPI DSI TX
- **IPI**：图像像素输入接口（Image Pixel Interface），MIPI CSI TX 的像素输入口；IDU 的 DPI 流经 DPI2IPI 模块转换后送入
- **MIPI DSI TX**：将 IDU 输出的像素流打包成 DSI 协议包
- **MIPI CSI TX**：设备端的 CSI-2 协议控制器，将 IPI 接口输入的像素流打包成 CSI-2 包输出
- **MIPI D-PHY TX**：MIPI 输出的物理层，完成高速串行化

#### S100/S600 HDMI 输出链路

由于 SoC 内部没有原生的 HDMI 输出接口，显示信号需以 MIPI DSI 协议送出，因此在开发板上外接了一颗 LT9611UXD 桥接芯片，将 MIPI DSI 信号转换为 HDMI 信号，实现 HDMI 显示输出。完整输出链路如下图：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/display/disp_framework.png" alt="S100/S600 HDMI 输出链路" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

各模块说明如下：
- **LT9611UXD**：桥接芯片，将 MIPI DSI 信号转换为 HDMI 2.0 信号输出
- **其余模块**：同 IDE 架构模块说明
 
:::info[说明]

当前开发板只实现了一路 HDMI 输出，用户可按照自己的需求拓展第二路视频输出。

:::

#### IDU 架构：

IDU 内部分为 AXI IF 和 Controller 两个区域：6 个图层的像素数据经 AXI IF（RDMA → Async FIFO → LBUF）从内存读出，并统一转换为 YUV444 格式后送入 Controller，完成 6 图层叠加混合与后处理（亮度/对比度/饱和度、Gamma、Dither），最终以 DPI 接口输出像素流；同时支持将合成后的图像转换为 YUV422/YUV420 回写到内存。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/display/disp_idu_framework.png" alt="IDU 架构图" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

各模块说明如下：

- **AXI IF**：AXI 总线接口区域，通过 RDMA/WDMA 完成与 DDR 之间的图层数据读取和回写数据写回
- **Controller**：显示控制器核心区域，完成图层叠加混合与显示时序产生，输出 DPI 像素流
- **RDMA / WDMA**：读/写 DMA，分别负责从内存读取图层数据和将回写数据写回内存
- **Async FIFO**：异步 FIFO，完成图层数据的跨时钟域缓存
- **LBUF**：行缓冲器（Line Buffer），按行缓存图层数据
- **CLUT**：颜色查找表（Color Look-Up Table），用于 8-bpp 调色盘格式的颜色映射（仅 RGB 图层）
- **Upscaling**：YUV 图层的上采样模块，实现图层放大（最大 6 倍）
- **LBUF scaling**：缩放后的行缓冲
- **Overlay & Alpha-Blending**：图层叠加与透明混合模块，将 6 个图层与背景层按优先级合成为一路视频
- **VPG**：视频测试图案发生器（Video Pattern Generator），用于无输入时的调试显示
- **Brightness/Contrast/Saturation**：亮度、对比度、饱和度调节（Color-Adjust）
- **Gamma**：Gamma 校正
- **Dither**：抖动处理，降低低色深下的色阶失真

### 规格参数

#### IDU

- IDU 模块共支持 6 个通道，通道 0、通道 1、通道 4、通道 5 作为 YUV 图层通道，通道 2、通道 3 作为 RGB 图层通道
- 每个通道支持最大输入分辨率为 2880x2160
- 6 个通道都支持 Crop 功能，支持 Crop 宽高配置，支持 Crop 顶点坐标配置
- YUV 图层支持 UYVY Interleaved YUV422、VYUY Interleaved YUV422、YUYV Interleaved YUV422、YVYU Interleaved YUV422、UV Semi-planar YUV422、VU Semi-planar YUV422、UV Semi-planar YUV420、VU Semi-planar YUV420、Planar YUV422(YU YV)、Planar YUV422(YV YU)、Planar YUV420(YU YV)、Planar YUV420(YV YU)
- RGB 图层支持 8-bpp(CLUT、调色盘)、RGB565、Unpacked RGB888、Packed RGB888、ARGB、RGBA。其中 8-bpp 格式没有 endian 问题，RGB565、Unpacked RGB888、Packed RGB888 只支持 little-endian 格式，ARGB、RGBA 支持 little-endian 或 big-endian 格式
- 支持 6 个图层与背景(Background)层及光标(HW Cursor)进行叠加(Overlay & Alpha-Blending, Key-color)，可配置 Alpha 值和叠加层优先级
- YUV 图层支持 Up-Scale，最大放大倍数 6 倍
- 输出支持 Color-Adjust(对比度，饱和度，亮度，色度，gamma，Dithering)
- 支持回写功能，支持回写格式有：UYVY、VYUY、YUYV、YVYU、NV12、NV21、Unpacked RGB888
- 输出方式支持 MIPI CSI TX 或 MIPI DSI
<DocScope products="RDK S100">

- IDU 输出格式：RGB888、RGB565、RGB666，并支持通过 RGB2YUV 模块转换为 YUV422、YCbCr
- 最大 pixel rate：600 MHz；最大输出分辨率 3840x2160

</DocScope>
<DocScope products="RDK S600">

- IDU 输出格式：RGB888、RGB565、RGB666、YUV444，并支持通过 RGB2YUV 模块转换为 YUV422、YCbCr
- 最大 pixel rate：625 MHz；最大输出分辨率 3840x2160

</DocScope>

#### LT9611UXD

- 支持输出的分辨率：2560x1440@60FPS
- MIPI 输入：最多 2-Port，每 Port 支持 1/2/3/4 Lane 可配，每 Lane 最高 2.5 Gbps；支持 DSI V1.3
- MIPI 输入支持 Non-Burst Mode with Sync Pulses / Non-Burst Mode with Sync Events / Burst Mode 三种传输模式
- 输入数据格式：DSI——RGB565、RGB666、RGB8/10/12bpc、Loosely 20bit YCbCr422、20/24bit YCbCr422、16bit YCbCr422、12bit YCbCr420
- 仅支持 Video Mode，不支持 Command Mode
- MIPI Clock 支持 Continuous Mode 和 Non-Continuous Mode
- MIPI DSI 输入时不需要通过 DCS 发送初始化命令，SoC 的 DSI 驱动如发送了 DCS 命令，LT9611UXD 会忽略
- HDMI 输出：兼容 CEA/VESA 标准分辨率；非标准分辨率需通过 I2C 写入完整 video timing
- 支持 HDCP、CEC、DDC/CI
- 支持 Normal / Standby / Sleep 功耗模式

#### MIPI TX

- MIPI CSI TX控制器为MIPI CSI-2 v2.0
- IDE中共有两路MIPI TX输出，可配置CSI或DSI输出，两种控制器共用一个D-PHY
- MIPI D-PHY最大支持4 lanes x 2.5Gbps速率

## 软件描述

### DRM 框架概述

S100/S600 显示子系统接入标准 Linux **DRM（Direct Rendering Manager）** 框架，框架分为用户空间的 libdrm 库与内核空间的 DRM 驱动（`hobot-drm`）。

DRM 将显示子系统抽象为几个标准组件，与 S100/S600 硬件的对应关系如下：

| DRM 概念 | 含义 | S100/S600 硬件对应 |
| ------- | ---- | ------------- |
| CRTC | 显示控制器抽象，读取图层、合成、产生扫描时序 | IDU（`hobot-drm`） |
| Plane | 图层，承载待显示的图像 buffer，支持位置/缩放/合成 | IDU 内部图层 |
| Encoder | CRTC 与 Connector 之间的信号转换 | MIPI DSI Host（DSI 协议封装） |
| Bridge | Encoder 后级的外挂协议转换芯片 | LT9611UXD（MIPI DSI → HDMI 2.0） |
| Connector | 物理输出接口抽象（状态/EDID/热插拔） | HDMI 接口（connector 名 `HDMI-A-1`） |
| Framebuffer / GEM | 显存对象，支持 dma-buf 零拷贝导入 | 图像 buffer（可与 PYM 输出 buffer 共享） |

### DRM 调试信息与硬件的对应关系

DRM 使用过程中，主要关注 Planes、 CRTC、 Connector 三种部件。系统启动后 , 可以使用 modetest 命令查看这些资源

#### modetest 运行

> 注意：modetest 打印的信息在不同版本上会有不一样体现。

运行 `modetest -M hobot-drm -a`，典型输出如下（已省略部分属性）：

```text
root@ubuntu:/# modetest -M hobot-drm -a
Encoders:
id  crtc    type    possible crtcs  possible clones
89  0   Virtual 0x00000001  0x00000000
153 0   Virtual 0x00000002  0x00000000
156 0   Virtual 0x00000001  0x00000000
158 0   Virtual 0x00000002  0x00000000
160 0   DSI     0x00000001  0x00000000

Connectors:
id  encoder status       name        size (mm)  modes  encoders
94  0       unknown      Writeback-1 0x0        0      89
  props:
    [...]
155 0       unknown      Writeback-2 0x0        0      153
  props:
    [...]
157 0       disconnected Virtual-1   0x0        0      156
  props:
    [...]
159 0       disconnected Virtual-2   0x0        0      158
  props:
    [...]
161 0       connected    HDMI-A-1    520x320    20     160
  modes:
    index name refresh (Hz) hdisp hss hse htot vdisp vss vse vtot
  #0 1920x1080 60.00 1920 2008 2052 2200 1080 1084 1089 1125 148500 flags: phsync, pvsync; type: preferred, driver
  #1 1920x1080 60.00 1920 2008 2052 2200 1080 1084 1089 1125 148500 flags: phsync, pvsync; type: driver
    [...]
  props:
    [...]

CRTCs:
id  fb  pos size
31  0   (0,0)   (0x0)
  #0  nan 0 0 0 0 0 0 0 0 0 flags: ; type:
  props:
    [...]
95  0   (0,0)   (0x0)
  #0  nan 0 0 0 0 0 0 0 0 0 flags: ; type:
  props:
    [...]

Planes:
id  crtc  fb  CRTC x,y  x,y gamma size  possible crtcs
35  0     0   0,0      0,0 0             0x00000001
  formats: UYVY VYUY YUYV YVYU NV16 NV61 NV12 NV21 YU16 YV16 YU12 YV12
  props:
    [...]
44  0     0   0,0      0,0 0             0x00000001
  formats: UYVY VYUY YUYV YVYU NV16 NV61 NV12 NV21 YU16 YV16 YU12 YV12
  props:
    [...]
53  0     0   0,0      0,0 0             0x00000001
  formats: R8 RG16 XR24 RG24 AR24 RA24
  props:
    [...]
62  0     0   0,0      0,0 0             0x00000001
  formats: R8 RG16 XR24 RG24 AR24 RA24
  props:
    [...]
71  0     0   0,0      0,0 0             0x00000001
  formats: UYVY VYUY YUYV YVYU NV16 NV61 NV12 NV21 YU16 YV16 YU12 YV12
  props:
    [...]
80  0     0   0,0      0,0 0             0x00000001
  formats: UYVY VYUY YUYV YVYU NV16 NV61 NV12 NV21 YU16 YV16 YU12 YV12
  props:
    [...]
99  0     0   0,0      0,0 0             0x00000002
  formats: UYVY VYUY YUYV YVYU NV16 NV61 NV12 NV21 YU16 YV16 YU12 YV12
  props:
    [...]
108 0     0   0,0      0,0 0             0x00000002
  formats: UYVY VYUY YUYV YVYU NV16 NV61 NV12 NV21 YU16 YV16 YU12 YV12
  props:
    [...]
117 0     0   0,0      0,0 0             0x00000002
  formats: R8 RG16 XR24 RG24 AR24 RA24
  props:
    8 type:
        flags: immutable enum
        enums: Overlay=0 Primary=1 Cursor=2
        value: 1
    [...]
126 0     0   0,0      0,0 0             0x00000002
  formats: R8 RG16 XR24 RG24 AR24 RA24
  props:
    [...]
135 0     0   0,0      0,0 0             0x00000002
  formats: UYVY VYUY YUYV YVYU NV16 NV61 NV12 NV21 YU16 YV16 YU12 YV12
  props:
    [...]
144 0     0   0,0      0,0 0             0x00000002
  formats: UYVY VYUY YUYV YVYU NV16 NV61 NV12 NV21 YU16 YV16 YU12 YV12
  props:
    [...]

Frame buffers:
id  size  pitch
```

#### modetest 信息分析

以上面的实测输出为例，DRM 调试信息与硬件的对应关系如下描述（具体 ID 以实际输出为准）：

1、CRTC:

- 31 -> IDU 0
- 95 -> IDU 1

2、Encoders:

- 160 -> MIPI DSI Host（类型 DSI，HDMI 通路的编码器）
- 89 -> IDU 0 回写通路（Virtual）
- 153 -> IDU 1 回写通路（Virtual）
- 156 -> IDU 0 CSI-TX 通路（Virtual）
- 158 -> IDU 1 CSI-TX 通路（Virtual）

3、Connectors:

- 94 -> Writeback-1（IDU 0 回写输出）
- 155 -> Writeback-2（IDU 1 回写输出）
- 157 -> Virtual-1（IDU 0 的 MIPI CSI-TX 输出通路）
- 159 -> Virtual-2（IDU 1 的 MIPI CSI-TX 输出通路）
- 161 -> HDMI-A-1（HDMI 接口；链路：CRTC 31 -> Encoder 160 -> LT9611UXD 桥接 -> HDMI）

4、Planes（每个 CRTC 6 个，按 possible crtcs 区分归属）:

IDU 0：

- 35 -> yuv layer 0（Overlay，zpos 0，YUV 格式，支持缩放 + reflect-x/y）
- 44 -> yuv layer 1（Overlay，zpos 1，同上）
- 53 -> Primary Plane（RGB 图层，zpos 2，不支持缩放/旋转）
- 62 -> rgb layer 1（Overlay，zpos 3，RGB 格式，支持缩放）
- 71 -> yuv layer 2（Overlay，zpos 4）
- 80 -> yuv layer 3（Overlay，zpos 5）

IDU 1（图层布局与能力与 IDU 0 完全相同）：

- 99 -> yuv layer 0
- 108 -> yuv layer 1
- 117 -> Primary Plane（RGB 图层）
- 126 -> rgb layer 1（Overlay，RGB 格式）
- 135 -> yuv layer 2
- 144 -> yuv layer 3

### DRM 快速体验

根据 modetest 获取到的信息，我们可以执行下面命令进行 HDMI 功能测试，执行之前请接入支持 1080P@60Hz 模式的显示器：

```sh
modetest -M hobot-drm -a -s 161@31:1920x1080 -P 35@31:1920x1080@NV12
```

命令执行完成之后，显示屏上应该会出现 SMPTE 的测试彩条 ECR-1-1978：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/display/display_subsystem_smpte_patten.png" alt="SMPTE 测试彩条" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## 参考示例

- 待补充

## API 参考

参考开源代码：[drm lib](https://gitlab.freedesktop.org/mesa/libdrm/-/blob/main/xf86drmMode.h)

## 接口说明

参考开源代码：[drm lib](https://gitlab.freedesktop.org/mesa/libdrm/-/blob/main/xf86drmMode.h)

## 数据结构

参考开源代码：[drm lib](https://gitlab.freedesktop.org/mesa/libdrm/-/blob/main/xf86drmMode.h)

## 返回值说明

参考开源代码：[drm lib](https://gitlab.freedesktop.org/mesa/libdrm/-/blob/main/xf86drmMode.h)

## 相关文档

- [多媒体 API 参考 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
