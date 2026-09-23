---
sidebar_position: 15
title: "多媒体术语与缩略语"
description: "多媒体 API 参考章节术语与缩略语汇总：按硬件（模块）与软件（框架）分类，覆盖输入、ISP、几何处理、显示、编解码、AI 计算、总线内存及 HBN、内存管理、媒体框架、图像格式等"
---

# 多媒体术语与缩略语

本文档汇总《多媒体 API 参考》各章节中出现的缩略语与简称，按 **硬件**（按模块划分）与 **软件**（按框架划分）分类整理，另附通用术语。

- 英文全称优先采用文档中给出的官方全称，其余为行业通用全称；
- `-` 表示专有名词缩写或文档未给出对应全称。

## 硬件

### 输入接口

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| MIPI | Mobile Industry Processor Interface | 移动产业处理器接口标准（MIPI 联盟制定） |
| MIPI RX | Mobile Industry Processor Interface Receiver | MIPI 接收端，接收摄像头输入的图像数据 |
| CSI-2 | Camera Serial Interface | MIPI 相机串行接口协议（Sensor 像素流格式）；调试节点 CSI TX 指 MIPI 发送侧 |
| DPHY / CPHY / CDPHY | - | MIPI 物理层协议，CDPHY 为兼容 D-PHY / C-PHY 的组合 PHY |
| VC | Virtual Channel | MIPI 虚拟通道，每路 MIPI RX 支持 4 个 VC |
| SerDes | Serializer / Deserializer | 串行器/解串器（如 max96712），SerDes 接口相机模组的接入方式 |
| GMSL | Gigabit Multimedia Serial Link | 千兆多媒体串行链路摄像头接口标准 |
| POC | Power Over Coax | 通过同轴电缆给相机模组供电 |
| I2C | Inter-Integrated Circuit | 芯片间串行总线，用于配置 Sensor / SerDes |
| GPIO | General-Purpose Input/Output | 通用输入输出引脚 |
| MCLK | Master Clock | Sensor 参考主时钟 |
| MFP | Multi-Function Pin | 多功能复用引脚 |
| ETH | Ethernet | 以太网（亦用于 PPS 网络授时） |
| PCIe | Peripheral Component Interconnect Express | 高速串行扩展总线 |

### 采集与输入处理

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| CIM | Camera Interface Manager | Camera 接入管理模块，支持 online / offline 工作 |
| VIN | Video Input | 视频输入模块（HBN 框架中的数据源 vnode） |
| IPI | - | 芯片内部 MIPI RX 到 CIM 的数据通路，1 路相机占 1 路 |
| CPE | Camera Process Engine | 相机处理引擎，MIPI RX + CIM + ISP + YNR + PYM 组成的物理分组 |
| TPG | Test Pattern Generator | 测试图案发生器，不接 Sensor 也能出图（VIN / ISP 通路自测） |
| EMB | Embedded Data | Sensor 随图像输出的内嵌数据（曝光、温度等） |
| RAWDS | - | CIM 内的 2×2 下采样功能块 |
| LPWM | - | VIN 触发信号模块（类 PWM 方波，1Hz~500KHz 可配） |
| VCON | - | VIN 板级连接编排模块（I2C/POC/GPIO/PHY 映射）；亦指相机物理接口编号（VCON0~5） |
| FSYNC | Frame Synchronization | 帧同步信号，用于多路 Camera 同步曝光 |
| SIF | - | 传感器接口（tuning_tool 默认 SIF 直通 ISP 模式） |

### ISP 图像信号处理

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| ISP | Image Signal Processor | 图像信号处理器 |
| MCFE | Multi-Context Front End | ISP 前端，多路调度控制与 buffer 管理 |
| CFA | Color Filter Array | 颜色滤波阵列（RGGB / RCCB 等 Bayer 排列） |
| BIST | Built-In Self-Test | 内置自检（ISP 功能安全特性） |
| TDMF | - | ISP 分时复用调度模式（sched_mode 取值） |
| YNR | Y Noise Reduction | 亮度降噪模块，串接在 ISP 之后、PYM 之前 |
| 2DNR / 3DNR | 2-D / 3-D Noise Reduction | 空域降噪 / 时域降噪（S600 仅 YNR3 支持 3DNR） |
| AE / AWB / AF | Auto Exposure / Auto White Balance / Auto Focus | 自动曝光 / 自动白平衡 / 自动对焦 |
| 2A | AE + AWB | 自动曝光与自动白平衡的合称（2A 算法） |
| HDR | High Dynamic Range | 高动态范围合成模式（LINEAR / NATIVE / 2To1 等） |
| DOL | Digital OverLap | Sensor 长短帧多曝合成模式（hbplayer 最多支持 dol4） |
| FV | Focus Value | 对焦评价值（配合马达位置绘制 FV-pos 曲线） |
| AFM | - | 自动对焦窗口 / 统计功能（AFMV1 / AFMV3 为版本） |

### 几何处理

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| PYM | Pyramid | 金字塔处理模块，图像缩小及 ROI 多层输出 |
| DS / BL / SRC | Down Sampling / BiLinear / Source | PYM 输出层：下采样层 / 双线性层 / 源图层 |
| GDC | Geometric Distortion Correction | 几何畸变校正模块（仅 offline 回灌），支持旋转与视角变换 |
| IPM | Inverse Perspective Mapping | 逆透视变换（地面图像转俯视图），由 GDC 完成 |
| STITCH | - | 图像拼接模块，多路画面按 ROI 摆位并做 Alpha 融合 |
| VSE | - | 视频缩放模块（HBN 框架覆盖节点，文档未展开） |
| IPU | - | 图像处理单元（MediaCodec 中指相机通路端口） |
| SOL | Start of Line | 行开始时序（PYM 通道配置项） |

### 显示

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| DISP | Display | 显示输出模块 |
| IDU | Image Display Unit | 图像显示单元 |
| IDE | Image Display Engine | 图像显示引擎，包含 IDU 与 MIPI TX |
| MIPI TX | Mobile Industry Processor Interface Transmitter | MIPI 发送端，向显示设备输出图像 |
| DSI | Display Serial Interface | MIPI 显示串行接口 |
| HDMI | High-Definition Multimedia Interface | 高清多媒体接口 |
| VPG | Video Pattern Generator | 测试图发生器（MIPI TX 无屏自测） |
| OSD | On-Screen Display | 屏幕叠加显示 |
| HSA / HBP / HFP / VSA / VBP / VFP | Horizontal / Vertical Sync Active、Back / Front Porch | 行/场同步与消隐前后肩等显示时序参数 |

### 编解码

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| VPU | Video Processing Unit | 视频处理单元，完成 H.264 / H.265 编解码 |
| VENC / VDEC | Video Encoder / Video Decoder | 视频编码 / 视频解码 |
| JPU | JPEG Processing Unit | JPEG 图片处理单元，完成 JPEG / MJPEG 编解码 |
| JENC / JDEC | JPEG Encoder / JPEG Decoder | JPEG 编码 / JPEG 解码 |
| CODEC | Coder-Decoder | 编解码器（VPU / JPU 的统称） |

### AI 与图形计算

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| BPU | Brain Processing Unit | AI 推理加速单元 |
| PE | Processing Element | BPU 核处理单元（CORE_TYPE_4PE / 2PE / 1PE 表示核型） |
| GPU | Graphics Processing Unit | 图形处理器（Mali-G78AE），支持 2D/3D 图形与通用计算 |
| 2DGPU / 3DGPU | 2D / 3D Graphics Processing Unit | 2D 图形处理 / 3D 图形渲染加速单元 |
| GPGPU | General-Purpose computing on GPU | GPU 通用计算 |
| VDSP | - | DSP 数字信号处理单元（S600 上 vdsp0 / vdsp1 双实例） |
| CPU | Central Processing Unit | 中央处理器 |

### 总线、内存与存储

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| DDR | Double Data Rate SDRAM | 系统内存，offline 模式下数据经 DDR 交互 |
| DMA | Direct Memory Access | 直接内存访问 |
| RDMA | - | 读 DMA（CIM 的 DDR 回灌输入源） |
| AXI | Advanced eXtensible Interface | AMBA 总线接口（如 ISP 经 AXI 写 DDR） |
| AMBA | Advanced Microcontroller Bus Architecture | Arm 片上总线架构 |
| ACE-Lite | AXI Coherency Extensions Lite | AMBA 5 一致性内存接口（GPU 外部内存接口） |
| IOVA | I/O Virtual Address | 设备侧 IO 虚拟地址 |
| GIC | Generic Interrupt Controller | ARM 通用中断控制器（GICv3） |
| IRQ | Interrupt Request | 中断请求 |
| SRAM | Static Random Access Memory | 片上静态内存（S600 的 custom/sram heap） |
| ECC | Error-Correcting Code | 纠错码（S600 的 inline ecc heap） |
| eMMC | embedded MultiMediaCard | 板载闪存存储器 |

## 软件

### HBN 多媒体框架

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| HBN | - | 多媒体系统核心软件框架（含 HBN Framework API / Camera API / ISP API） |
| vnode | Virtual Node | HBN 对硬件加速单元（VIN/ISP/PYM/GDC/STITCH 等）的软件抽象节点 |
| vflow | Virtual Flow | 多个 vnode 连接形成的视频处理流水线 |
| ichn / ochn | Input / Output Channel | vnode 的输入通道 / 输出通道 |
| VPF | Video Processing Framework | 视频处理框架（libvpf，承载 hbn_vnode_* / hbn_vflow_* 接口） |
| libcam | - | 相机侧用户态库（Camera API 实现） |
| camsys | Camera System | 相机子系统（CIM/ISP/PYM 等，支持 HBN 与 V4L2 两种运行模式） |
| VPM | - | pipeline 配置管理（vpm_config.json 定义 CIM/ISP/YNR 通路） |
| OTF | On The Fly | 硬件直连（软件上对应 online 模式），数据不经 DDR |
| M2M / m2m | Memory to Memory | 经 DDR 的离线（offline）数据搬运 / 绑定方式 |
| HAL | Hardware Abstraction Layer | 硬件抽象层 |

### 其他媒体 API 与框架

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| VIO | Video Input/Output | 视频输入输出简易 API 及其通路（调试统计按 VIO 通路组织） |
| SYS | System | 简易 API 层的系统模块，提供封装层模块绑定接口 |
| MediaCodec | - | RDK 音视频编解码 API（hb_mm_mc_*，控制 VPU / JPU） |
| V4L2 | Video for Linux 2 | Linux 标准视频采集框架 |
| UVC | USB Video Class | USB 视频类协议 |
| DRM | Direct Rendering Manager | Linux 内核显示子系统（hobot-drm 显示驱动） |
| KMS | Kernel Mode Setting | 内核显示模式设置子系统（与 DRM 配合） |
| DRI | Direct Rendering Infrastructure | DRM 调试节点目录（/sys/kernel/debug/dri） |

### 内存管理框架

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| hbmem / HB_MEM | - | 共享内存管理库 libhbmem（hb_mem_* 接口） |
| ION | - | 内核内存分配器，管理设备树预留内存区域（hbmem 的内存来源） |
| CMA | Contiguous Memory Allocator | Linux 连续物理内存分配器（ion_cma / cma_reserved 区域） |
| carveout | - | 整块预留、物理连续的专用内存区域（ION heap 类型） |
| dmabuf | DMA Buffer | Linux 跨设备 DMA 缓冲区共享机制（零拷贝传递） |
| GBM | Generic Buffer Manager | 图形缓冲区管理库（libgbm，配合 DRM 显示） |

### 图形与 AI 计算框架

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| OpenGL | Open Graphics Library | 桌面 3D 图形标准 API |
| OpenGL ES | OpenGL for Embedded Systems | 嵌入式 3D 图形标准 API（GPU 接口） |
| EGL | - | 渲染 API 与本地窗口系统间的接口，管理图形上下文/表面 |
| OpenCL | Open Computing Language | 开放并行计算标准 API |
| Vulkan | - | 跨平台图形 / 计算 API |
| ICD | Installable Client Driver | Vulkan 驱动加载器（libvulkan.so） |
| WSI | Window System Integration | Vulkan 与窗口系统的交互层 |
| GTK | GIMP Toolkit | 图形控件与界面构建工具包 |
| hbDNN | - | 神经网络推理库（DNN = Deep Neural Network） |
| hbm_runtime | - | BPU 模型运行时 |
| hbUCP | - | hbm_runtime 内部使用的计算库 |
| hbdk | - | 地平线模型编译工具链 / 运行时 |

### 图像与视频格式

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| YUV | Y luminance + U/V chrominance | 亮度-色度色彩空间及像素格式（4:4:4 / 4:2:2 / 4:2:0 采样） |
| NV12 / NV21 | - | YUV 4:2:0 双平面半平面格式（Y 平面 + UV/VU 交错平面） |
| NV16 / NV61 / NV24 / NV42 | - | YUV 4:2:2 / 4:4:4 的 UV(VU) 交错格式 |
| YUYV / YVYU / UYVY / VYUY | - | YUV 4:2:2 打包格式（16bpp） |
| YUV420SP | YUV 4:2:0 Semi-Planar | 4:2:0 半平面格式（即 NV12） |
| yuv420p | - | YUV 4:2:0 平面（planar）格式 |
| RAW | - | Sensor 原始 Bayer 图像格式（RAW8~RAW24，数字为位宽） |
| RGB | Red Green Blue | RGB 色彩模型 / 像素格式族（RGB565、RGB24 等） |
| ARGB / RGBA / ABGR / BGRA | - | 带 Alpha 通道的 32bpp 打包像素格式 |
| RGB888 | - | 每通道 8bit 的 RGB 格式（ISP 输出格式之一） |
| H.264 | Advanced Video Coding（AVC） | 视频编码标准 |
| H.265 | High Efficiency Video Coding（HEVC） | 视频编码标准 |
| JPEG | Joint Photographic Experts Group | 静态图像压缩标准 |
| MJPEG | Motion JPEG | 逐帧 JPEG 编码的视频格式 |
| BMP | Bitmap | 位图图像文件格式 |
| PWL | Piecewise Linear | 分段线性曲线（decompanding 解压方式之一） |

### 编码控制与算法术语

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| CBR | Constant Bit Rate | 恒定码率控制模式 |
| AVBR | Average Variable Bit Rate | 平均可变码率控制模式 |
| GOP | Group of Pictures | 图像组（I/P/B 帧组织结构） |
| IDR | Instantaneous Decoding Refresh | 即时解码刷新帧，可独立解码 |
| QP | Quantization Parameter | 量化参数（min/max QP、ROI 平均 QP 等） |
| SAO | Sample Adaptive Offset | 样本自适应偏移（H.265 编码工具） |
| CABAC | Context-based Adaptive Binary Arithmetic Coding | 基于上下文的自适应二进制算术编码 |
| CAVLC | Context-based Adaptive Variable Length Coding | 基于上下文的自适应变长编码 |
| VLC | Variable Length Coding | 变长编码；VLC buffer 指码流缓存 |
| VBV | Video Buffering Verifier | 码率控制缓存模型（vbv_buffer_size） |
| VUI | Video Usability Information | 码流附加信息（宽高比、色彩、时序等） |
| HVS | Human Visual System | 人眼视觉系统（HVS QP 感知码率控制） |
| CTU | Coding Tree Unit | 编码树单元（H.265，subCTU 级码控） |
| MB | Macroblock | 宏块（宏块级码率控制） |
| LUT | Look-Up Table | 查找表（STITCH 的 alpha/beta 融合权重等） |
| FOV | Field of View | 视场角（GDC 变换参数 FOV_h / FOV_w） |
| PTZ | Pan / Tilt / Zoom | 水平位移 / 垂直位移 / 缩放（GDC 变换参数组） |

### 工具与调试

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| sysfs / procfs / debugfs | - | 内核伪文件系统（/sys、/proc、/sys/kernel/debug 调试节点） |
| VPS | Video Processing Subsystem | 视频处理子系统，VIO 通路调试节点目录（/sys/class/vps） |
| fmgr | Frame Manager | 帧管理器（fmgr_stats 反映驱动 buffer 占用与流转） |
| FS / FE / QB / DQ | Frame Start / Frame End / 取帧 / 出帧 | vio_delay 调试中的时间戳字段 |
| DTS | Device Tree Source | 设备树源文件（板级配置来源） |
| ko | Kernel Object | 内核模块文件（.ko，modprobe / rmmod 加载卸载） |
| OpenCV | Open Source Computer Vision Library | 视觉库（图像格式转换） |
| GCC | GNU Compiler Collection | 编译器 |
| npm | Node Package Manager | Node.js 包管理器（GDC Tool 依赖安装） |

## 通用术语

| 缩写 | 英文全称 | 说明 |
| --- | --- | --- |
| API | Application Programming Interface | 应用程序编程接口 |
| SDK | Software Development Kit | 软件开发包 |
| SoC | System on Chip | 片上系统 |
| RDK | Robot Developer Kit | 地平线机器人开发套件（RDK S100 / S600） |
| JSON | JavaScript Object Notation | 配置 / 数据交换格式 |
| FPS | Frames Per Second | 帧率（每秒帧数） |
| ROI | Region of Interest | 感兴趣区域（VIN/PYM/GDC/编码中的裁剪区域） |
| FIFO | First In First Out | 先进先出缓存（FIFO 溢出会导致丢帧） |
| CRC | Cyclic Redundancy Check | 循环冗余校验 |
| MCU | Microcontroller Unit | 微控制器（同步触发源之一） |
| RTC | Real-Time Clock | 实时时钟 |
| PPS | Pulse Per Second | 秒脉冲信号（多路 Camera / LiDAR 同步） |
| GPS | Global Positioning System | 全球定位系统（外部授时源） |
| PHC | PTP Hardware Clock | 网卡 PTP 硬件时钟（统一时间轴） |
| gPTP | Generalized Precision Time Protocol | 网络精密时间同步协议 |
| LiDAR | Light Detection and Ranging | 激光雷达（与 Camera 数据时间对齐） |
| PWM | Pulse Width Modulation | 脉宽调制 |
| IPC | Inter-Process Communication | 进程间通信 |
| fd | File Descriptor | 文件描述符（hbmem 以 fd 标识 buffer） |
| mmap | Memory Mapping | 内存映射（将内存映射到用户空间） |
| ioctl | I/O Control | 字符设备控制系统调用 |
| bpp | Bits Per Pixel | 每像素比特数 |
| MSB / LSB | Most / Least Significant Bit | 最高 / 最低有效位（RAW 图位序配置） |
| UUID | Universally Unique Identifier | 通用唯一标识 |
| GFLOPS | Giga Floating-point Operations Per Second | 每秒十亿次浮点运算（算力单位） |
| HTTP | HyperText Transfer Protocol | 超文本传输协议 |
| IP | Internet Protocol | 网络协议 / 设备 IP 地址 |
| SSH | Secure Shell | 远程登录终端 |
| PC | Personal Computer | 个人电脑（宿主机 / 上位机） |
| UI | User Interface | 用户界面 |
| HW / SW | Hardware / Software | 硬件平台 / 软件版本（兼容性标注） |
| FAE | Field Application Engineer | 现场应用工程师 |
