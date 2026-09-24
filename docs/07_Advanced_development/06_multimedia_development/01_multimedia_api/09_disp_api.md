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

### 硬件框图

Display 子系统由如下模块组成：

- **IDU**：图像显示单元（Image Display Unit），从内存中读取图层 buffer 并完成图层合成与缩放，按显示时序输出像素流
- **MIPI DSI TX**：将 IDU 输出的像素流打包成 DSI 协议包
- **MIPI D-PHY**：MIPI 输出的物理层，完成高速串行化
- **LT9611UXD**：桥接芯片，将 MIPI DSI 信号转换为 HDMI 2.0 信号输出

各模块之间的关系如下图所示：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/display/disp_framework.png" alt="S100/S600 显示硬件框图" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### 规格参数

#### IDU

- 最大输入分辨率 2880x2160
- 均支持 Crop 裁剪，支持 Crop 宽高与顶点坐标配置
- YUV 图层输入格式：UYVY Interleaved YUV422、VYUY Interleaved YUV422、YUYV Interleaved YUV422、YVYU Interleaved YUV422、UV Semi-planar YUV422、VU Semi-planar YUV422、UV Semi-planar YUV420、VU Semi-planar YUV420、Planar YUV422（YU YV）、Planar YUV422（YV YU）、Planar YUV420（YU YV）、Planar YUV420（YV YU）
- RGB 图层输入格式：8-bpp（CLUT 调色盘）、RGB565、Unpacked RGB888、Packed RGB888、ARGB、RGBA；其中 8-bpp 无 endian 问题，RGB565 / Unpacked RGB888 / Packed RGB888 仅支持 little-endian，ARGB / RGBA 支持 little-endian 或 big-endian
- 支持与 Background 背景层、HW Cursor 硬件光标叠加（Overlay & Alpha-Blending、Key-color），Alpha 值与叠加层优先级可配置
- YUV 图层支持 Up-Scale，最大放大 6 倍
- 输出支持 Color-Adjust（对比度、饱和度、亮度、色度、gamma、Dithering）
- 支持回写（writeback），回写格式：UYVY、VYUY、YUYV、YVYU、NV12、NV21、Unpacked RGB888
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

#### MIPI D-PHY

- MIPI D-PHY最大支持4 lanes x 2.5Gbps速率

## 软件描述

### DRM 框架概述

S100/S600 显示子系统接入标准 Linux **DRM（Direct Rendering Manager）** 框架，框架分为用户空间的 libdrm 库与内核空间的 DRM 驱动（`hobot-drm`）。

DRM 将显示子系统抽象为几个标准组件，与 S100/S600 硬件的对应关系如下：

| DRM 概念 | 含义 | S100/S600 硬件对应 |
| ------- | ---- | ------------- |
| CRTC | 显示控制器抽象，读取图层、合成、产生扫描时序 | **IDU**（`hobot,hobot-drm-idu`） |
| Plane | 图层，承载待显示的图像 buffer，支持位置/缩放/合成 | IDU 内部图层 |
| Encoder | CRTC 与 Connector 之间的信号转换 | **MIPI DSI Host**（DSI 协议封装） |
| Bridge | Encoder 后级的外挂协议转换芯片 | **LT9611UXD**（MIPI DSI → HDMI 2.0） |
| Connector | 物理输出接口抽象（状态/EDID/热插拔） | **HDMI 接口**（connector 名 `HDMI-A-1`） |
| Framebuffer / GEM | 显存对象，支持 dma-buf 零拷贝导入 | 图像 buffer（可与 PYM 输出 buffer 共享） |

### DRM 调试信息与硬件的对应关系

DRM 使用过程中，主要关注 Planes、 CRTC、 Connector 三种部件。系统启动后 , 可以使用 modetest 命令查看这些资源

#### modetest 运行

> 注意：modetest 打印的信息在不同版本上会有不一样体现。

运行 `modetest -M hobot-drm -a`，典型输出如下（已省略部分属性）：

```text
root@ubuntu:/# modetest -M hobot-drm -a
opened device `Horizon Super SoC DRM driver` on driver `hobot-drm` (version 1.0.0 at 20230512)
Encoders:
id  crtc    type    possible crtcs  possible clones
89  0   Virtual 0x00000001  0x00000000
153 0   Virtual 0x00000002  0x00000000
156 0   Virtual 0x00000001  0x00000000
158 0   Virtual 0x00000002  0x00000000
160 0   DSI 0x00000001  0x00000000

Connectors:
id  encoder status      name        size (mm)   modes   encoders
94  0   unknown     Writeback-1     0x0     0   89
  props:
    [...]
161 0   connected   HDMI-A-1        520x320     20  160
  modes:
    index name refresh (Hz) hdisp hss hse htot vdisp vss vse vtot
  #0 1920x1080 60.00 1920 2008 2052 2200 1080 1084 1089 1125 148500 flags: phsync, pvsync; type: preferred, driver
  #1 1920x1080 60.00 1920 2008 2052 2200 1080 1084 1089 1125 148500 flags: phsync, pvsync; type: driver
  #2 1920x1080 59.94 1920 2008 2052 2200 1080 1084 1089 1125 148352 flags: phsync, pvsync; type: driver
  #4 1280x720 60.00 1280 1390 1430 1650 720 725 730 750 74250 flags: phsync, pvsync; type: driver
    [...]
  props:
    [...]

CRTCs:
id  fb  pos size
31  0   (0,0)   (0x0)
  #0  nan 0 0 0 0 0 0 0 0 0 flags: ; type:
  props:
    [...]

Planes:
id  crtc    fb  CRTC x,y    x,y gamma size  possible crtcs
35  0   0   0,0     0,0 0           0x00000001
  formats: UYVY VYUY YUYV YVYU NV16 NV61 NV12 NV21 YU16 YV16 YU12 YV12
  props:
    8 type:
        flags: immutable enum
        enums: Overlay=0 Primary=1 Cursor=2
        value: 0
    [...]
44  0   0   0,0     0,0 0           0x00000001
  formats: UYVY VYUY YUYV YVYU NV16 NV61 NV12 NV21 YU16 YV16 YU12 YV12
  props:
    [...]
53  0   0   0,0     0,0 0           0x00000001
  formats: R8 RG16 XR24 RG24 AR24 RA24
  props:
    8 type:
        flags: immutable enum
        enums: Overlay=0 Primary=1 Cursor=2
        value: 1
    [...]
62  0   0   0,0     0,0 0           0x00000001
  formats: R8 RG16 XR24 RG24 AR24 RA24
  props:
    [...]
71  0   0   0,0     0,0 0           0x00000001
  formats: UYVY VYUY YUYV YVYU NV16 NV61 NV12 NV21 YU16 YV16 YU12 YV12
  props:
    [...]
80  0   0   0,0     0,0 0           0x00000001
  formats: UYVY VYUY YUYV YVYU NV16 NV61 NV12 NV21 YU16 YV16 YU12 YV12
  props:
    [...]

Frame buffers:
id  size    pitch
```

#### modetest 信息分析

以上面的实测输出为例，DRM 调试信息与硬件的对应关系如下描述（具体 ID 以实际输出为准）：

1、CRTC:

- 31 -> IDU0

2、Connectors:

- 94 -> Writeback-1（IDU0 的回写输出）
- 161 -> HDMI-A-1（HDMI 接口）

3、Planes（IDU0）:

- 35 -> yuv layer 0（Overlay，zpos 0，YUV 格式，支持缩放与镜像翻转）
- 44 -> yuv layer 1（Overlay，zpos 1，YUV 格式，支持缩放与镜像翻转）
- 53 -> Primary Plane（RGB 图层，zpos 2，不支持缩放与旋转）
- 62 -> rgb layer 1（Overlay，zpos 3，RGB 格式，支持缩放、不支持旋转）
- 71 -> yuv layer 2（Overlay，zpos 4，YUV 格式，支持缩放与镜像翻转）
- 80 -> yuv layer 3（Overlay，zpos 5，YUV 格式，支持缩放与镜像翻转）

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
