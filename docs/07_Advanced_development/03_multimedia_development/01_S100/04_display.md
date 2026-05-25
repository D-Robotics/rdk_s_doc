---
sidebar_position: 4
---

# 显示子系统

## IDE 架构图

IDE（Image Display Engine）包含图像显示单元（Image Display
Unit）、图像数据输出模块（MIPI CSI2 Device 和 MIPI
DSI）。通过 IDU 从内存中读取图像数据进行处理，在 IDE 内部支持像素格式转换和像素结构转换，使 IDU 的输出数据能够通过 MIPI
DSI 和 MIPI CSI2 Device 两种方式输出，MIPI DSI 和 MIPI CSI2
Device 两个控制器共用一个 MIPI D-PHY

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/display/3a04cee3e78794a86060831ada036a2b.png" alt="" style={{ width: '100%' }} />

## IDU 架构图

S100 有两个功能完全相同的 IDU（Image Display Unit）硬件模块

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/display/78d95d4a8683535bee0965957165a802.png" alt="" style={{ width: '100%' }} />

## IDU 支持的功能

-   IDU 模块共支持6个通道，通道0、通道1、通道4、通道5作为 YUV 图层通道，通道2、通道3作为 RGB 图层通道

-   每个通道支持最大输入分辨率为2880x2160

-   6个通道都支持 Crop 功能，支持 Crop 宽高配置，支持 crop 顶点坐标配置

-   YUV 图层支持 UYVY Interleaved YUV422、VYUY Interleaved YUV422、YUYV
    Interleaved YUV422、YVYU Interleaved YUV422、UV Semi-planar YUV422、VU
    Semi-planar YUV422、UV Semi-planar YUV420、VU Semi-planar YUV420、Planar
    YUV422(YU YV)、Planar YUV422(YV YU)、Planar YUV420(YU YV)、Planar YUV420(YV
    YU)

-   RGB 图层支持8-bpp (CLUT、调色盘)、RGB565、Unpacked RGB888、Packed
    RGB888、ARGB、RGBA。其中8-bpp 格式沒有 endian 问题，RGB565、Unpacked
    RGB888、Packed
    RGB888只支持 little-endian 格式，ARGB、RGBA 支持 little-endian 或 big-endian 格式。(主流图像格式皆为 big-endian)

-   支持6个图层与背景（Background）层及光标（HW Cursor）进行叠加（Overlay &
    Alpha-Blending, Key-color），可配置 a 值和叠加层优先级

-   YUV 图层支持 Up-Scale，最大放大倍数6倍

-   输出支持 Color-Adjust(对比度，饱和度，亮度，色度，gamma，Dithering)

-   支持回写功能，支持回写格式有：UYVY、VYUY、YUYV、YVYU、NV12、NV21、Unpacked
    RGB888

-   输出方式支持 MIPI-CSI-TX 或 MIPI DSI

-   IDU 输出支持 RGB888、RGB565、RGB666，并支持通过 RGB2YUV 模块将 IDU 输出转换为 YUV422、Ycbcr

-   最大 pixel rate: 600MHz，最大输出分辨率: 3840x2160

## MIPI TX 支持的功能

-   MIPI CSI TX 控制器为 CSI2.0

-   MIPI DSI 控制器为 DSI1.2

-   IDE 中共有两路 MIPI TX 输出，可配置 CSI 或 DSI 输出，两种控制器共用一个 D-PHY

-   MIPI D-PHY 最大支持4 lanes x 2.5Gbps 速率

## IDU 的调试方法

### IDU 的调试节点

-   使能寄存器配置跟踪信息：

```c
echo 1 > /sys/kernel/debug/idu_hw0/trace_log

echo 1 > /sys/kernel/debug/idu_hw1/trace_log
```

-   查看 IDU 配置信息：

```c
cat /sys/kernel/debug/idu_hw0/config

cat /sys/kernel/debug/idu_hw1/config
```

### IDU 驱动 debug 日志开启方法

```c
echo -n "file hb_idu_hw.c +p" > /sys/kernel/debug/dynamic_debug/control
```

## MIPI CSI TX 的调试方法

### MIPI CSI TX 的调试节点

-   查看 MIPI CSI TX 配置信息：

```c
cat /sys/kernel/debug/mipi_csi_dev0/config

cat /sys/kernel/debug/mipi_csi_dev1/config
```

### MIPI CSI TX 驱动 debug 日志开启方法

```c
echo -n "file hb_mipi_csi_device_debug.c +p" > /sys/kernel/debug/dynamic_debug/control
```

## MIPI DSI 的调试方法

### MIPI DSI 的调试节点

-   查看 MIPI DSI 配置信息：

```c
cat /sys/kernel/debug/mipi_dsi_host0/config

cat /sys/kernel/debug/mipi_dsi_host1/config
```

### MIPI DSI 驱动 debug 日志开启方法

```c
echo -n "file hb_mipi_dsi_host_ops.c +p" > /sys/kernel/debug/dynamic_debug/control
```
