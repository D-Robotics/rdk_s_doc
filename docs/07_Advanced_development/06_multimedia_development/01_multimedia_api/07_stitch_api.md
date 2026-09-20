---
sidebar_position: 7
title: "图像拼接 - STITCH"
description: "RDK S100/S600 5.5.1.7 STITCH（图像拼接模块）"
toc_max_heading_level: 4
---

# 图像拼接 - STITCH

> **层级说明**：本篇是【底层多媒体 API】中的 **STITCH 模块使用文档**。STITCH 在 HBN 框架里是 `HB_STITCH` 类型的 vnode（板端头文件 `hbn_sth_cfg.h`），讲清它**是什么、怎么配、有哪些接口、典型怎么用**。通用 vnode 接口的完整字段表见 [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)；几何校正见 [畸变矫正 - GDC](/Advanced_development/multimedia_development/multimedia_api/gdc_api)。

## 概述

STITCH 把**多路输入画面按 ROI 摆进一张输出画布**，并在重叠区域做 Alpha 融合。典型场景包括：

- **机器人本体环视**：机身四周的鱼眼相机拼成俯视图，供遥控操作与近距避障使用。
- **多路画面合成一路回传**：把头部、腕部、底盘等相机的画面拼进同一张画布，由一路编码器输出，遥操作与数据采集时只需回传一路码流。
- **超广角拼接**：相邻相机视场有重叠，在重叠带做 Alpha 融合，得到比单相机更宽的视场。

这些场景的共同前提是：输入画面在进入 STITCH 之前已经完成几何校正（由 GDC 完成，见[畸变矫正 - GDC](/Advanced_development/multimedia_development/multimedia_api/gdc_api)）。STITCH 只负责把它们摆到位、并处理接缝处的过渡。

STITCH 不做缩放、几何变换与色彩转换，每个 ROI 内按 1 : 1 搬运。画布尺寸在输出通道上独立设定：可以只取各路画面的一部分，也可以拼出比单路输入更大的画布。

<details>
<summary>展开：术语表</summary>

**术语表**

| 缩写 | 说明 |
| --- | --- |
| **STITCH** | 图像拼接模块，本文档的主题。按 ROI 把多路画面摆进一张画布并融合重叠区 |
| **ROI** | Region Of Interest，矩形区域。STITCH 以 ROI 为唯一处理单位 |
| **ichn** | 输入通道（input channel）。STITCH 有 4 个输入通道，每个对应一路源图 |
| **ochn** | 输出通道（output channel）。STITCH 只有 1 个，输出拼接后的画布 |
| **画布 / canvas** | 输出通道的整张图。各路画面通过 ROI 落到它上面的指定位置 |
| **Alpha 融合** | 重叠区按权重混合两路源图。权重可由硬件自动生成，也可由 LUT 逐像素指定 |
| **LUT** | Look-Up Table。存融合权重系数，1 字节/像素，按 ROI 顺序紧密排布 |
| **IPM** | Inverse Perspective Mapping，逆透视变换。把地面图像转成俯视图，由 GDC 完成 |
| **vnode** | HBN 框架对功能模块的抽象。STITCH 就是一个 vnode，用 `hbn_vnode_*` 接口操作 |
| **M2M** | Memory to Memory。STITCH 的输入只能通过 M2M 方式绑定，见[通路绑定](#通路绑定) |

</details>

## 硬件框图

### STITCH 在链路中的位置

STITCH 是**独立使用模块**：既可以由用户态直接送帧（离线回灌），也可以用 vflow 绑定在上游节点之后，两种用法走同一套 `hbn_vnode_*` 接口。

![STITCH 在相机链路中的位置与上下游](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/stitch/fig1-stitch-position.svg)

### 与 GDC 的分工

两个模块的职责划分如下：

| 模块 | 对图像做什么 | 职责 |
| --- | --- | --- |
| **GDC** | 几何校正：把畸变的鱼眼图变成俯视图（IPM） | **改形状** |
| **STITCH** | 布局与融合：把多张图摆到一张画布上，重叠区加权混合 | **摆位置** |

环视拼接的典型顺序是 `Camera → GDC → STITCH → 显示/编码`。**STITCH 不做畸变矫正**，传给它的图像必须已经完成矫正，否则拼接缝无法对齐。

## 硬件规格

### 平台规格

<DocScope products="RDK S100">

| 项目 | S100 |
| --- | --- |
| 输入通道 | 4 路（`stitch0_ich0` ~ `stitch0_ich3`） |
| 输出通道 | 1 路（`stitch0_och`） |
| 硬件实例数 | 1 个（`hw_id` 固定为 0） |
| 并发流水线数 | 最多 5 条（`ctx_id` 取 0 ~ 4） |
| 单次拼接 ROI 数上限 | 12 |
| 输入格式 | NV12 |
| 输入尺寸 | 最小 **16 × 2**、最大 **3840 × 3840**（宽 × 高，单位像素）；宽必须是 16 的倍数，高必须为偶数 |
| 输出画布尺寸 | 最小 **16 × 2**、最大 **3840 × 3840**（宽 × 高，单位像素）；宽必须是 16 的倍数，高必须为偶数 |
| 缩放能力 | 无，只能 1:1 搬运与裁剪 |
| 硬件设备节点 | `37c50000.videostitch` |

</DocScope>

<DocScope products="RDK S600">

| 项目 | S600 |
| --- | --- |
| 输入通道 | 4 路（`stitch0_ich0` ~ `stitch0_ich3`） |
| 输出通道 | 1 路（`stitch0_och`） |
| 硬件实例数 | 1 个（`hw_id` 固定为 0） |
| 并发流水线数 | 最多 5 条（`ctx_id` 取 0 ~ 4） |
| 单次拼接 ROI 数上限 | 12 |
| 输入格式 | NV12 |
| 输入尺寸 | 最小 **16 × 2**、最大 **3840 × 3840**（宽 × 高，单位像素）；宽必须是 16 的倍数，高必须为偶数 |
| 输出画布尺寸 | 最小 **16 × 2**、最大 **3840 × 3840**（宽 × 高，单位像素）；宽必须是 16 的倍数，高必须为偶数 |
| 缩放能力 | 无，只能 1:1 搬运与裁剪 |
| 硬件设备节点 | `37c70000.videostitch` |

</DocScope>

:::warning STITCH 没有缩放器

每个 ROI 的源裁剪窗口与目的落位**尺寸必须完全相等**，STITCH 不支持缩放。要在画布上摆不同大小的画面，必须**在 STITCH 之前**把每路缩放到目标尺寸（例如各路的 PYM 节点）。

尺寸不匹配时不会在配置阶段报错，而是在出帧时失败：`hbn_vnode_getframe` 返回 `-41`，内核打印 `hw process faild, reg status = 0x2` 并持续丢帧。

:::

## 接入评估

规划一条拼接通路时先确定以下几项。

**画布尺寸** 由最终要显示或编码的画面决定。上限 3840 × 3840，宽必须是 16 字节的倍数。画布按 NV12 存放，1920 × 1080 一帧约 3.0 MB，`buffers_num` 个 buffer 常驻内存。

**每路格子的尺寸** 由画布划分方式决定。STITCH 不缩放，该尺寸确定后上游必须把每路缩放到这个尺寸，拼墙场景由各路的 PYM 完成。

**输入路数** 一路输入对应一个输入通道，硬件共 4 路。需要更多路时，要么分多级拼接，要么先在上游把画面合成。

**ROI 的数量** 上限 12，每块需要独立落位的矩形占一个 ROI；重叠区若用 `BLENDING_MODE_ALPHA` 融合，还要额外占一个，划分方式见[典型方案](#典型方案四路环视拼接)。

**并发流水线数** 全芯片只有一个 STITCH 实例，最多支持 5 条并发流水线（`ctx_id` 取 0 ~ 4）；每 `hbn_vnode_open` 一次占一条，第 6 个返回 `-655407`（`HBN_STATUS_STH_INIT_BIND_ERROR`）。需要同时跑更多路拼接时，只能把它们合并到同一张画布上（画布更大、ROI 更多），或让几条流水线分时复用。

### 典型方案：四路环视拼接

机身前后左右各装一颗鱼眼相机，方案分两步落地：

1. **GDC 做几何校正** —— 四路鱼眼图各转成一张俯视图，得到四张 IPM 图，见[畸变矫正 - GDC](/Advanced_development/multimedia_development/multimedia_api/gdc_api)。
2. **STITCH 落位与融合** —— 四张图按机身周边的实际位置摆进一张画布，相邻两路的交界处做 Alpha 融合，输出俯视全景图，供遥控操作与近距避障使用。

整套方案要准备三类参数：

| 参数 | 作用于 | 内容 | 本平台上怎么来 |
| --- | --- | --- | --- |
| GDC 畸变配置 | GDC | 每个相机的畸变模型与映射关系 | `hbn_gen_gdc_cfg` 生成，见[畸变矫正 - GDC](/Advanced_development/multimedia_development/multimedia_api/gdc_api) |
| ROI 划分表 | STITCH | 每张图在画布上的落位，以及重叠带的裁剪与融合方式 | 由相机安装位置与各路图的覆盖范围算出 |
| alpha 权重表 | STITCH | 重叠带内**逐像素**的融合权重，是一张二维权重场 | 按重叠区的几何自行生成，本平台不提供生成工具；板端 `sample_gdc_stitch` 直接随样例提供成品 bin。`BLENDING_MODE_ONLINE` 不需要它 |

#### ROI 划分方法

ROI 划分表描述两类信息：**四张图各自在画布上的落位**，以及**每处重叠区的划分**。划分原则只有两条：**不重叠的部分直接拷贝，重叠的部分用 Alpha 融合**。四路各占一个直拷 ROI 铺满画布，四个角的重叠区各再占一个融合 ROI。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/stitch/roi-layout-4cam.png" alt="四路环视的 ROI 划分示例" width="100%" />

上图是这种划分方式的示意图：前后左右四路各占一个直拷 ROI（`BLENDING_MODE_SRC`），四个角的重叠区各占一个融合 ROI（`BLENDING_MODE_ALPHA`），合计 8 个。图中标注的坐标与尺寸是这张图自身的示例；下面给出板端样例的实际取值。

板端 `sample_gdc_stitch` 是一份可直接运行的八 ROI 方案，四路输入、画布 896 × 896：

| ROI | 落位 (x, y) | 尺寸 (w × h) | 取源 | 融合方式 |
| --- | --- | --- | --- | --- |
| 0 | (0, 16) | 390 × 778 | 输入 2 | 直拷 |
| 1 | (506, 14) | 390 × 780 | 输入 3 | 直拷 |
| 2 | (0, 598) | 896 × 298 | 输入 0 | 直拷 |
| 3 | (0, 0) | 892 × 298 | 输入 1 | 直拷 |
| 4 | (0, 16) | 390 × 282 | 输入 2 + 1 | Alpha 融合 |
| 5 | (506, 14) | 388 × 284 | 输入 3 + 1 | Alpha 融合 |
| 6 | (0, 598) | 390 × 196 | 输入 2 + 0 | Alpha 融合 |
| 7 | (506, 598) | 390 × 196 | 输入 3 + 0 | Alpha 融合 |

四个直拷 ROI 先把四路画面铺满画布，四个融合 ROI 再盖到四角的重叠区上。**后写的 ROI 覆盖先写的**，所以融合 ROI 的下标必须排在直拷 ROI 之后。

### 吞吐

STITCH 的处理能力有限，下表是不同画布尺寸下的拼接帧率上限：

<DocScope products="RDK S100">

| 配置 | 画布 | 帧率上限 | 硬件占用率 |
| --- | --- | --- | --- |
| 2 路 1024×1080 | 1920×1080 | 约 610 fps | 99 % |
| 4 路 1920×1080 | 3840×2160 | 约 183 fps | 99.6 % |

</DocScope>

<DocScope products="RDK S600">

| 配置 | 画布 | 帧率上限 | 硬件占用率 |
| --- | --- | --- | --- |
| 2 路 1024×1080 | 1920×1080 | 约 687 fps | 99.3 % |
| 4 路 1920×1080 | 3840×2160 | 约 206 fps | 99.6 % |

</DocScope>

硬件占用率在持续运行中接近 100 %，上表即稳态上限。折算画布输出能力：1920 × 1080 档 S100 约 **1.26 Gpx/s**、S600 约 **1.42 Gpx/s**，3840 × 2160 档 S100 约 **1.52 Gpx/s**、S600 约 **1.71 Gpx/s**；按「目标帧率 × 画布像素数 < 1.2 Gpx/s」估算属保守口径（各档实际能力 1.26 ~ 1.71 Gpx/s）。注意 4K 档的短时测试（百帧量级，S100 约 135 fps、S600 约 146 fps）明显低于稳态，吞吐评估要跑足时长（≥ 1000 帧）。

## 使用说明

### 数据通路

1. 应用把各路源帧送入对应的输入通道（`hbn_vnode_sendframe` / `hbn_vnode_sendframe_async`）。
2. 0 号输入通道到达时触发本次拼接；此时尚未送达的其他通道按缺帧处理，由驱动以全零帧替换该路输入（NV12 全零在显示侧呈绿色，两板实测）。
3. 驱动按 ROI 的数组下标顺序逐个搬运：每个 ROI 按 `src0_index` / `src1_index` 指定的输入通道取源，从 `roi_x` / `roi_y` 处裁剪，按 `roi_w` / `roi_h` 写入画布的落位坐标。重叠区由后写的 ROI 覆盖先写的。
4. 画布作为一帧从输出通道 0 输出，应用用 `hbn_vnode_getframe` 取出，用完 `hbn_vnode_releaseframe` 归还。

一帧处理失败时（尺寸不匹配、缺少 LUT 等）不输出画布，取帧返回 `-41`，见[排障](#排障)。

### 关键配置选择

动手配之前有三个选择要定：源帧从哪来、每个 ROI 怎么融合、怎么接进 vflow。

#### 送帧模式

`stitch_base_attr.mode` 决定**源帧从哪来**。

| 值 | 枚举 | 含义 |
| --- | --- | --- |
| 0 | `STH_MODE_FB_EXTERNAL_BUF` | 外部 buffer 回灌。源帧由用户态 `hbn_vnode_sendframe` 送入 |
| 1 | `STH_MODE_FB_INTERNAL_BUF` | 内部 buffer 回灌 |
| 2 | `STH_MODE_FLOW` | flow 绑定模式。源帧来自 vflow 里绑定的上游节点，用户态不发帧 |

外部 buffer 回灌（`STH_MODE_FB_EXTERNAL_BUF`）的拼接时机以 **0 号输入通道的到达为准**：0 号通道收到源帧即触发本次拼接，此时其余通道尚未送到的帧按缺帧处理、以全零帧顶替（该路区域画面呈绿色，见[不报错、但结果不对的配置](#不报错但结果不对的配置)）。因此送帧顺序是 **1 ~ N-1 路先送、0 号最后送**（见[快速示例](#快速示例)）；0 号先送同样能出帧，只是其余各路的当前帧会缺席当次拼接。`STH_MODE_FLOW` 不需要应用送帧：驱动按帧时间戳对各路分组，时间差在 15 ms 以内的帧合为一组触发拼接，超过该窗口的迟到帧被丢弃、早到帧强制触发本次拼接。各路输入的帧率或延迟差异较大时，优先选 `STH_MODE_FLOW`。

#### 融合模式

`blending_attr.blending_mode` 决定**每个 ROI 内部怎么融合**，与送帧模式无关。

| 值 | 枚举 | 需要 LUT | 硬件行为 |
| --- | --- | --- | --- |
| 0 | `BLENDING_MODE_ONLINE` | 否 | 硬件按 `direct` 方向自动算权重，过渡带由 ROI 自身几何推出。**`margin` 必须为 `0`、`margin_inv` 必须为 `128`**；ROI 宽高可以不等 |
| 1 | `BLENDING_MODE_ALPHA` | alpha | 按 alpha 表逐像素加权融合。**表值即 src0 的权重**：0 全取 src1，255 全取 src0 |
| 2 | `BLENDING_MODE_ALPHA_BETA` | alpha + beta | 按 alpha、beta 表加权融合 |
| 3 | `BLENDING_MODE_SRC` | 否 | 直接拷贝 src0，逐像素不改 |
| 5 | `BLENDING_MODE_ALPHA_SRC` | alpha | 按 alpha 表与 src0 融合 |

> 枚举值是 `0,1,2,3,5`，没有 4。

单个 ROI 的融合过程：两路源图各取一块，按 `blending_mode` 融合后写入画布的落位处。

![单个 ROI 的融合机制](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/stitch/fig4-roi-blend.svg)

`blending_attr` 的其余字段（方向、增益、过渡带等）见[配置结构体定义](#配置结构体定义)。

各模式的 LUT 需求见上表「需要 LUT」列。alpha / beta 表按 ROI 的下标顺序紧密排布，每个需要 LUT 的 ROI 占 `roi_w × roi_h` 字节（1 字节/像素）。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/stitch/lut-generation.png" alt="LUT 表生成流程" width="100%" />

LUT 表按 ROI 划分表中的重叠区域位置逐像素算出融合权重，得到 alpha / beta 两张表。

算例：4 个 `BLENDING_MODE_ALPHA` 的 ROI，面积 390×282 + 388×284 + 390×196 + 390×196 = **373052** 字节，alpha 表就需要这么大；直拷 ROI 不计入。

`blending_attr.gain_src0_yuv` / `gain_src1_yuv` 是两路源图各自的 Y/U/V 增益（定标 256 = 1.0×），用来做两路之间的**亮度与色度均衡**——重叠带两侧来自不同相机，曝光与白平衡未必一致，不加增益会在接缝处看出色阶跳变。

alpha 表由调用方逐像素给定，因此标准融合之外的效果也能实现：让某块区域按梯度透明可做**水印**，让某路画面按曲线渐隐可做**背景虚化**。

`BLENDING_MODE_ALPHA_BETA` 必须同时提供 alpha 与 beta 两张表。`alpha_lut` / `beta_lut` 的 `size` 填 0 时配置仍会通过，要到出帧才失败，见[不报错、但结果不对的配置](#不报错但结果不对的配置)。

#### 通路绑定

STITCH 绑定进 vflow 时**只支持 `CHN_BIND_M2M`**，其他绑定类型会被拒绝。绑定时还会校验输入通道的 `width` / `height` / `strid[0]` 与上游通道属性是否逐字段相等，不一致则返回 `-EINVAL`，见[会被拒绝的配置](#会被拒绝的配置)。

典型绑法：每路 `VIN → ISP → YNR → PYM` 独立成链，末端 PYM 把画面缩到格子尺寸，再以 `CHN_BIND_M2M` 绑到 STITCH 的第 i 个输入通道；STITCH 输出接显示。

### API 调用流程

一次完整拼接从打开、配置到停流释放的调用时序如下：

![API 典型调用时序](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/stitch/fig3-api-sequence.svg)

<details>
<summary>展开：函数调用参考</summary>

**打开与全局配置**

1. `hbn_vnode_open(HB_STITCH, hw_id, AUTO_ALLOC_ID, &handle)` —— 打开一路 STITCH，`hw_id` 固定为 `0`，`handle` 为出参
2. `hb_mem_alloc_com_buf(size, flags, &lut_buf)` —— 申请 LUT buffer，`size` 为各需要 LUT 的 ROI 面积之和（1 字节/像素）
3. 填写 LUT 内容后 `hb_mem_flush_buf_with_vaddr(lut_buf.virt_addr, size)` 刷 cache，把 `share_id` / `offset` / `size` 填进 `base_attr.alpha_lut` / `base_attr.beta_lut`
4. `hbn_vnode_set_attr(handle, &base_attr)` —— 下发全局配置。`stitch_base_attr` 含 `mode`（送帧模式）、`roi_nums`、`img_nums`、`alpha_lut` / `beta_lut`、`blending[]`（每个 ROI 一条）

**通道与缓冲**

5. `hbn_vnode_set_ichn_attr(handle, ichn_id, &ichn_attr)` —— 逐路设输入通道，`ichn_id` 取 `0` ~ `3`，写该路源图的宽高与裁剪原点
6. `hbn_vnode_set_ochn_attr(handle, 0, &ochn_attr)` —— 设输出画布尺寸与每个 ROI 的落位，`ochn_id` 固定为 `0`
7. `hbn_vnode_set_ochn_buf_attr(handle, 0, &alloc_attr)` —— 给画布配 buffer 数量与内存属性

**启动**

8. `hbn_vnode_start(handle)` —— 启动 vnode；绑进 vflow 时改用 `hbn_vflow_start()`

**每帧**

9. `hbn_vnode_sendframe_async(handle, ichn_id, &img)` —— 1 ~ N-1 路异步送入源帧
10. `hbn_vnode_sendframe(handle, 0, &img)` —— 0 号通道最后同步送入，它到达即触发本次拼接
11. `hbn_vnode_getframe(handle, 0, timeout, &img)` —— 取出整张画布；用完 `hbn_vnode_releaseframe(handle, 0, &img)` 归还

**收尾**

12. `hbn_vnode_stop(handle)` / `hbn_vnode_close(handle)` —— 停流并释放

</details>

### 快速示例

STITCH 的落位方式分两类，画布同为 1920 × 1080：

![两类多路 ROI 落位示意图](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/stitch/fig2-roi-layout.svg)

板上完整样例的编译与运行方式见[相关文档](#相关文档)。

#### 最小示例

左右两路 1024×1080 的相机画面，重叠 128 像素，拼接成一张 1920×1080 的宽幅画面：左右两路先各自直拷铺底，重叠带再用 Alpha 融合覆盖。

```c
#include <stdio.h>
#include "hbn_vpf_interface.h"
#include "hbn_sth_cfg.h"
#include "hb_mem_mgr.h"

#define AUTO_ALLOC_ID  (-1)
#define SRC_W          1024     /* 两路源图宽 */
#define SRC_H          1080     /* 两路源图高 */
#define WALL_W         1920     /* 画布宽 */
#define WALL_H         1080     /* 画布高 */
#define OVERLAP_X      896      /* 重叠带在画布上的起始 x = WALL_W - SRC_W */
#define OVERLAP_W      128      /* 重叠带宽 */
#define LUT_SIZE       (OVERLAP_W * SRC_H)

static struct stitch_base_attr base_attr = {
	.mode     = STH_MODE_FB_EXTERNAL_BUF,
	.roi_nums = 3,
	.img_nums = 2,
	.blending = {
		{ .roi_index = 0, .blending_mode = BLENDING_MODE_SRC, .uv_en = 1,
		  .src0_index = 0, .src1_index = 0,
		  .gain_src0_yuv = {256, 256, 256}, .gain_src1_yuv = {256, 256, 256} },
		{ .roi_index = 1, .blending_mode = BLENDING_MODE_SRC, .uv_en = 1,
		  .src0_index = 1, .src1_index = 1,
		  .gain_src0_yuv = {256, 256, 256}, .gain_src1_yuv = {256, 256, 256} },
		{ .roi_index = 2, .blending_mode = BLENDING_MODE_ALPHA, .uv_en = 1,
		  .src0_index = 0, .src1_index = 1,
		  .gain_src0_yuv = {256, 256, 256}, .gain_src1_yuv = {256, 256, 256} },
	},
};

static struct stitch_ch_attr inch_attr[2] = {
	{ .width = SRC_W, .height = SRC_H, .strid = {SRC_W, SRC_W},
	  .rois = { [0] = { .roi_index = 0, .roi_x = 0, .roi_y = 0 },
	            [2] = { .roi_index = 2, .roi_x = OVERLAP_X, .roi_y = 0 } } },
	{ .width = SRC_W, .height = SRC_H, .strid = {SRC_W, SRC_W},
	  .rois = { [1] = { .roi_index = 1, .roi_x = 0, .roi_y = 0 },
	            [2] = { .roi_index = 2, .roi_x = 0, .roi_y = 0 } } },
};

static struct stitch_ch_attr och_attr = {
	.width = WALL_W, .height = WALL_H, .strid = {WALL_W, WALL_W},
	.rois = {
		[0] = { .roi_index = 0, .roi_x = 0,         .roi_y = 0, .roi_w = SRC_W,     .roi_h = SRC_H },
		[1] = { .roi_index = 1, .roi_x = OVERLAP_X, .roi_y = 0, .roi_w = SRC_W,     .roi_h = SRC_H },
		[2] = { .roi_index = 2, .roi_x = OVERLAP_X, .roi_y = 0, .roi_w = OVERLAP_W, .roi_h = SRC_H },
	},
};

int main(void)
{
	hbn_vnode_handle_t sth_fd;
	hbn_buf_alloc_attr_t alloc_attr = {0};
	hb_mem_common_buf_t alpha_buf;
	hbn_vnode_image_t in_img[2] = {0};
	hbn_vnode_image_t out_img = {0};
	uint8_t *lut;
	int32_t ret, x, y;

	hb_mem_module_open();

	/* 1. 申请 alpha 权重表：ROI2 为 128×1080，表大小 = 128×1080 字节（1 字节/像素） */
	ret = hb_mem_alloc_com_buf(LUT_SIZE,
			HB_MEM_USAGE_MAP_INITIALIZED | HB_MEM_USAGE_PRIV_HEAP_2_RESERVERD |
			HB_MEM_USAGE_CPU_READ_OFTEN | HB_MEM_USAGE_CPU_WRITE_OFTEN |
			HB_MEM_USAGE_CACHED, &alpha_buf);
	if (ret < 0) return ret;

	/* 2. 填表：沿 x 方向 0 → 255 线性渐变，融合带从左到右由 src0 过渡到 src1 */
	lut = (uint8_t *)alpha_buf.virt_addr;
	for (y = 0; y < SRC_H; y++) {
		for (x = 0; x < OVERLAP_W; x++) {
			lut[y * OVERLAP_W + x] = (uint8_t)(x * 255 / (OVERLAP_W - 1));
		}
	}
	hb_mem_flush_buf_with_vaddr((uint64_t)alpha_buf.virt_addr, LUT_SIZE);
	base_attr.alpha_lut.share_id = alpha_buf.share_id;
	base_attr.alpha_lut.size     = LUT_SIZE;

	/* 3. 打开 STITCH 节点，hw_id 固定为 0 */
	ret = hbn_vnode_open(HB_STITCH, 0, AUTO_ALLOC_ID, &sth_fd);
	if (ret < 0) return ret;

	/* 4. 全局配置 */
	ret = hbn_vnode_set_attr(sth_fd, &base_attr);
	if (ret < 0) return ret;

	/* 5. 逐路配置输入通道 */
	for (x = 0; x < 2; x++) {
		ret = hbn_vnode_set_ichn_attr(sth_fd, x, &inch_attr[x]);
		if (ret < 0) return ret;
	}

	/* 6. 配置输出画布 */
	ret = hbn_vnode_set_ochn_attr(sth_fd, 0, &och_attr);
	if (ret < 0) return ret;

	/* 7. 画布 buffer 交给框架分配 */
	alloc_attr.buffers_num = 3;
	alloc_attr.is_contig   = 1;
	alloc_attr.flags = HB_MEM_USAGE_CPU_READ_OFTEN | HB_MEM_USAGE_CPU_WRITE_OFTEN |
	                   HB_MEM_USAGE_MAP_INITIALIZED | HB_MEM_USAGE_CACHED;
	ret = hbn_vnode_set_ochn_buf_attr(sth_fd, 0, &alloc_attr);
	if (ret < 0) return ret;

	ret = hbn_vnode_start(sth_fd);
	if (ret < 0) return ret;

	/* 8. 申请两路源帧 buffer（此处只申请，实际使用时填入图像数据） */
	for (x = 0; x < 2; x++) {
		ret = hb_mem_alloc_graph_buf(SRC_W, SRC_H, MEM_PIX_FMT_NV12,
				HB_MEM_USAGE_MAP_INITIALIZED | HB_MEM_USAGE_CPU_READ_OFTEN |
				HB_MEM_USAGE_CPU_WRITE_OFTEN, SRC_W, SRC_H, &in_img[x].buffer);
		if (ret < 0) return ret;
	}

	/* 9. 送帧：1 号路先异步、0 号路最后同步——0 号是回灌模式的触发点 */
	hbn_vnode_sendframe_async(sth_fd, 1, &in_img[1]);
	hbn_vnode_sendframe(sth_fd, 0, &in_img[0]);

	/* 10. 取出拼接后的整张画布 */
	ret = hbn_vnode_getframe(sth_fd, 0, 1000, &out_img);
	if (ret < 0) return ret;
	printf("wall: frame_id=%u, fd=%d, %dx%d\n", out_img.info.frame_id,
	       out_img.buffer.fd[0], out_img.buffer.width, out_img.buffer.height);
	hbn_vnode_releaseframe(sth_fd, 0, &out_img);

	/* 11. 收尾 */
	hbn_vnode_stop(sth_fd);
	hbn_vnode_close(sth_fd);
	hb_mem_module_close();
	return 0;
}
```

重叠带的融合权重由 `alpha_lut` 逐像素给出，**表值是该像素处 src0 的权重**：0 全取 src1，255 全取 src0。上例沿 x 方向做 0 → 255 的线性渐变，重叠带因此从右图平滑过渡到左图。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/stitch/minexample-output.png" alt="最小示例在板端的实测输出" width="100%" />

上图为该示例在板端的实测输出：源帧是程序填充的纯色测试图（左路红、右路蓝），画布左右两段是直拷 ROI 的原样搬运，中间 128 像素重叠带按 alpha 表从右路色渐变到左路色。顶部标注条为后期加注，画布内容即程序原始输出。

无重叠的场景（例如四路 960×540 各占一格、拼成 1920×1080）只需把 ROI 两两相切排列，全部用 `BLENDING_MODE_SRC`，不需要 LUT。

### 约束与注意事项

#### 会被拒绝的配置

| 约束 | 表现 |
| --- | --- |
| 绑定类型不是 `CHN_BIND_M2M` | `-EINVAL`，日志 `stitch only support CHN_BIND_M2M` |
| `roi_nums > 12` | `hbn_vnode_set_attr` 返回 `-22` |
| `img_nums > 4` | `hbn_vnode_set_attr` 返回 `-22` |
| `width` / `strid` 不是 16 字节的倍数 | 输入侧在 `hbn_vnode_set_ichn_attr`、输出侧在 `hbn_vnode_set_ochn_attr` 返回 `-22` |

#### 不报错、但结果不对的配置

| 坑 | 后果 |
| --- | --- |
| ROI 尺寸与源裁剪尺寸不等 | 出帧失败，`getframe` 返回 `-41`，内核 `reg status = 0x2`。STITCH 不做缩放 |
| 该给 LUT 的模式没给 LUT | 出帧失败，`getframe` 返回 `-41`，内核 `reg status = 0x40` |
| ROI 的书写顺序 | 按下标 `0 → roi_nums-1` 依次写入，**后写的覆盖先写的**。重叠区必须把融合 ROI 放在被覆盖的整块 ROI 之后，否则融合结果会被后来的直拷盖掉 |
| 画布上没被任何 ROI 覆盖的区域 | 不会被写入，保持 buffer 原样。用未初始化的 buffer 时该区域会显示为**纯绿而不是黑**，排查时不要把它当成图像错误 |
| 源帧格式不是 NV12，或通道 `width` / `strid` 与来帧不符 | `sendframe` 照常收下；该帧被驱动丢弃，`getframe` 取不到画布（返回 `-8`），内核打印 `drop frame, drop_flag = 1` |
| 输入或画布的高为奇数 | 配置阶段不报错，出帧失败：`getframe` 返回 `-41` |

## API 相关

### 配置结构体定义

完整字段以 SDK 头文件 `hbn_sth_cfg.h` 为准，本节是它的阅读版。字段的**语义**按功能分散在各节——`mode` 见[送帧模式](#送帧模式)，`blending_mode` 与 LUT 相关规则见[融合模式](#融合模式)，通道字段的用法见 [API 接口说明](#api-接口说明)。

#### 类型总览

STITCH 对外是一个 vnode，没有自己的函数 API，配置分三处下发：全局配置走 `hbn_vnode_set_attr`，输入与输出通道属性分别走 `hbn_vnode_set_ichn_attr` / `hbn_vnode_set_ochn_attr`；建流与绑定交给 `hbn_vflow_*`。

| 类型 | 作用 | 关键成员 |
| --- | --- | --- |
| `stitch_base_attr` | 全局配置，经 `hbn_vnode_set_attr` 下发 | `mode`、`roi_nums`、`img_nums`、`alpha_lut`、`beta_lut`、`blending[MAX_STH_ROI_NUMS]` |
| `stitch_ch_attr` | 通道属性；输入通道与输出通道共用同一结构体，字段含义不对称 | `width`、`height`、`strid[MAX_STH_FRAME_PLAN]`、`rois[MAX_STH_ROI_NUMS]` |
| `roi_info` | 一个 ROI 的矩形 | `roi_x`、`roi_y`、`roi_w`、`roi_h`（另有 `roi_index`） |
| `blending_attr` | 一个 ROI 的融合方式 | `blending_mode`、`direct`、`uv_en`、`src0_index`、`src1_index`、`margin`、`margin_inv`、`gain_src0_yuv[3]`、`gain_src1_yuv[3]` |
| `lut_attr` | 融合权重表的描述符 | `share_id`、`offset`、`size`、`vaddr` |

**`hw_id`**：打开 STITCH 时指定的硬件编号，本平台固定为 `0`。

**`ochn_id`**：STITCH 只有一个输出通道，取 `0`。

**`rois[]` 的下标即 ROI 编号**：驱动按下标顺序逐个处理，与 `blending[]` 一一对应，`roi_index` 字段不影响行为。输入通道只用 `roi_x` / `roi_y`（源图裁剪原点），`roi_w` / `roi_h` 可留 0；输出通道的 `roi_x` / `roi_y` 是落位坐标，`roi_w` / `roi_h` 是搬运块尺寸，四个都要填。

**通道的 `width` 与 `strid` 必须是 16 字节的倍数**，否则 `hbn_vnode_set_ochn_attr` 返回 `-22`。`strid[0]` 填该路 buffer 的实际行跨度：与 `width` 相等是最常见取值，带对齐填充的 buffer 填实际 stride 同样可用（两板实测 `strid[0] = width + 16` 配置通过，硬件按 stride 取数）。`roi_x` / `roi_y` 建议填偶数：奇数会让 UV 分量在取整时偏半个像素。

**接口分属两个库**：`hbn_vnode_*` / `hbn_vflow_*` 在 `libvpf.so`，`hb_mem_*` 在 `libhbmem.so`。

#### 顶层

##### stitch_base_attr

一次下发给 `hbn_vnode_set_attr`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `mode` | `uint32_t` | 送帧模式，取值见[送帧模式](#送帧模式) |
| `roi_nums` | `uint32_t` | 本次拼接的 ROI 个数，上限 12 |
| `img_nums` | `uint32_t` | 参与拼接的输入图像数，取值 1 ~ 4 |
| `alpha_lut` | `lut_attr` | Alpha 权重表；用到的模式必须提供 |
| `beta_lut` | `lut_attr` | Beta 权重表；仅 `BLENDING_MODE_ALPHA_BETA` 需要 |
| `blending` | `blending_attr[MAX_STH_ROI_NUMS]` | 每个 ROI 一条融合配置，按 ROI 下标索引 |

#### 通道级

##### stitch_ch_attr

输入通道与输出通道**共用同一个结构体**，同一字段在两侧含义不同。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `width` / `height` | `uint32_t` | 输入侧：该路源图宽高，须与来帧完全一致；输出侧：画布宽高 |
| `strid` | `uint32_t[MAX_STH_FRAME_PLAN]` | `strid[0]` = Y 行跨度，`strid[1]` = UV 行跨度；填 buffer 的实际 stride，不要求等于 `width`，须为 16 字节的倍数 |
| `rois` | `roi_info[MAX_STH_ROI_NUMS]` | 输入侧只用 `roi_x` / `roi_y` 作裁剪原点；输出侧四个字段都要填 |

##### roi_info

一个 ROI 的矩形。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `roi_index` | `uint32_t` | 框架不读取；下标即 ROI 编号 |
| `roi_x` / `roi_y` | `uint32_t` | 输入侧 = 源图裁剪原点；输出侧 = 画布落位坐标 |
| `roi_w` / `roi_h` | `uint32_t` | 搬运块尺寸，仅输出侧使用 |

##### blending_attr

每个 ROI 一条，描述这块区域从哪两路源图、以什么方式融合出来。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `blending_mode` | `uint32_t` | 融合模式，取值见[融合模式](#融合模式) |
| `direct` | `uint32_t` | 融合方向，取值 `0`=左上 `1`=右下 `2`=左下 `3`=右上（枚举 `BLENDING_DIRECT_LT` / `_RB` / `_LB` / `_RT`）。`BLENDING_MODE_ONLINE` 按它决定过渡带方向；其余模式不校验，板端 `sample_gdc_stitch` 在 4 个 `BLENDING_MODE_ALPHA` 的 ROI 上按所处角落分别填了 `0` ~ `3` |
| `uv_en` | `uint32_t` | 是否同时搬运 UV 分量，取值 0 / 1 |
| `src0_index` / `src1_index` | `uint32_t` | 两路源图的输入通道号，取值 0 ~ 3 |
| `margin` / `margin_inv` | `uint32_t` | 过渡带参数。**只有 `BLENDING_MODE_ONLINE` 会校验这两个值，且仅接受 `0` / `128`**；其余融合模式不校验（板端 `sample_gdc_stitch` 各 ROI 用的是 `10` / `0`） |
| `gain_src0_yuv` / `gain_src1_yuv` | `uint32_t[3]` | 两路源图的 Y/U/V 增益（`[0]`=Y、`[1]`=U、`[2]`=V），定标 256 = 1.0× |

#### 权重表

##### lut_attr

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `share_id` | `int32_t` | 存放 LUT 的 hbmem 共享 ID（`hb_mem_alloc_com_buf` 返回值） |
| `offset` | `uint64_t` | 表在 buffer 内的偏移 |
| `size` | `uint64_t` | 表大小（字节），填 0 表示不使用该表 |
| `vaddr` | `uint64_t` | 用户态虚拟地址 |

### API 列表

STITCH 复用 HBN 的通用 vnode 接口，没有自己的私有 ioctl。常用接口如下：

| 接口 | 功能 |
| --- | --- |
| [`hbn_vnode_open`](#hbn_vnode_open) | 打开 STITCH vnode |
| [`hbn_vnode_close`](#hbn_vnode_close) | 关闭 STITCH vnode |
| [`hbn_vnode_set_attr`](#hbn_vnode_set_attr) | 设置模块基本属性（`stitch_base_attr`） |
| [`hbn_vnode_set_ichn_attr`](#hbn_vnode_set_ichn_attr) | 设置输入通道属性（`stitch_ch_attr`） |
| [`hbn_vnode_get_ichn_attr`](#hbn_vnode_get_ichn_attr) | 获取输入通道属性 |
| [`hbn_vnode_set_ochn_attr`](#hbn_vnode_set_ochn_attr) | 设置输出通道属性（`stitch_ch_attr`） |
| [`hbn_vnode_get_ochn_attr`](#hbn_vnode_get_ochn_attr) | 获取输出通道属性 |
| [`hbn_vnode_set_ochn_buf_attr`](#hbn_vnode_set_ochn_buf_attr) | 设置输出通道 buffer 属性 |
| [`hbn_vnode_start`](#hbn_vnode_start) | 启动 vnode |
| [`hbn_vnode_stop`](#hbn_vnode_stop) | 停止 vnode |
| [`hbn_vnode_getframe`](#hbn_vnode_getframe) | 获取拼接结果 |
| [`hbn_vnode_releaseframe`](#hbn_vnode_releaseframe) | 释放帧数据 |
| [`hbn_vnode_sendframe`](#hbn_vnode_sendframe) | 向输入通道送入源帧（阻塞） |
| [`hbn_vnode_sendframe_async`](#hbn_vnode_sendframe_async) | 向输入通道送入源帧（非阻塞） |

绑进 vflow 时使用 `hbn_vflow_create` / `hbn_vflow_add_vnode` / `hbn_vflow_bind_vnode` / `hbn_vflow_start` / `hbn_vflow_stop` / `hbn_vflow_destroy`，详见 [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)。

### API 接口说明

下文 14 个接口的返回值约定一致：**成功返回 `HBN_STATUS_SUCESS`（0），失败返回负值错误码**（实现为 `-HBN_STATUS_xxx`），各小节不再重复。

`set_attr` / `set_ichn_attr` / `get_ichn_attr` / `set_ochn_attr` / `get_ochn_attr` 为宏实现，`attr` 必须传指向对应结构体的指针，不能传 `void *`。

#### hbn_vnode_open

打开 STITCH 的设备节点，返回该模块的 vnode handle。与 `hbn_vnode_close` 成对使用。

```c
hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id,
                            int32_t ctx_id, hbn_vnode_handle_t *vnode_fd);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_type` | `hb_vnode_type` | vnode 类型，STITCH 取 `HB_STITCH` |
| `hw_id` | `uint32_t` | 硬件实例编号。STITCH 只有一个硬件实例，**固定传 0** |
| `ctx_id` | `int32_t` | context id，软件概念；可指定具体值（STITCH 合法范围 0 ~ 4），或传 `AUTO_ALLOC_ID` 由框架自动分配。超出范围返回 `-655407` |
| `vnode_fd` | `hbn_vnode_handle_t *` | **出参**，返回的 vnode handle |

**设备节点**：STITCH 实例在 `/dev` 下对应 `/dev/stitch0_ich0` ~ `/dev/stitch0_ich3` 与 `/dev/stitch0_och`。正常走 `hbn_vnode_*` 接口时不需要直接操作它们。

#### hbn_vnode_close

关闭 STITCH 设备节点，释放该 handle。需与 `hbn_vnode_open` 成对使用，建议先 `hbn_vflow_stop` 再关闭。

```c
hobot_status hbn_vnode_close(hbn_vnode_handle_t vnode_fd);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |

#### hbn_vnode_set_attr

设置模块基本属性，STITCH 传 `stitch_base_attr`（送帧模式、ROI 个数、参与拼接的图像数、LUT 描述符与每个 ROI 的融合配置）。

```c
hobot_status hbn_vnode_set_attr(hbn_vnode_handle_t vnode_fd, stitch_base_attr *attr);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `attr` | `stitch_base_attr *` | 全局配置，字段见 [stitch_base_attr](#类型总览) |

**要点**

- 用到的 LUT buffer 需在本接口之前申请好，并把 `share_id` / `offset` / `size` 填进 `stitch_base_attr`
- `roi_nums` 超过 12 时本接口直接失败（返回 `-22`）

#### hbn_vnode_set_ichn_attr

设置某一路输入通道的属性，STITCH 传 `stitch_ch_attr`（该路源图宽高、行宽与裁剪原点）。

```c
hobot_status hbn_vnode_set_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
                                     stitch_ch_attr *attr);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ichn_id` | `uint32_t` | 输入通道 id，取 0 ~ 3 |
| `attr` | `stitch_ch_attr *` | 该输入通道的属性，字段见 [stitch_ch_attr 与 roi_info](#类型总览) |

**要点**

- 四路输入通道**逐路**调用，`width` / `height` / `strid[0]` 必须与该路来帧完全一致，否则出帧时失败
- 输入通道只用到 `rois[]` 里的 `roi_x` / `roi_y`，`roi_w` / `roi_h` 可留 0

#### hbn_vnode_get_ichn_attr

回读某一路输入通道当前生效的属性。

```c
hobot_status hbn_vnode_get_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
                                     stitch_ch_attr *attr);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ichn_id` | `uint32_t` | 输入通道 id，取值同 `hbn_vnode_set_ichn_attr` |
| `attr` | `stitch_ch_attr *` | **出参**，回读到的输入通道属性 |

#### hbn_vnode_set_ochn_attr

设置输出通道属性，STITCH 传 `stitch_ch_attr`（画布宽高、行宽，以及每个 ROI 的落位与搬运块尺寸）。

```c
hobot_status hbn_vnode_set_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                     stitch_ch_attr *attr);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 输出通道 id，STITCH 只有一路输出，**固定传 0** |
| `attr` | `stitch_ch_attr *` | 输出画布属性，字段见 [stitch_ch_attr 与 roi_info](#类型总览) |

**要点**

- 每个 ROI 的搬运块尺寸由本接口的 `rois[].roi_w` / `roi_h` 决定，且必须与该 ROI 的源裁剪尺寸相等
- `width` / `strid` 不是 16 字节的倍数时本接口失败（返回 `-22`）

#### hbn_vnode_get_ochn_attr

回读输出通道当前生效的属性。

```c
hobot_status hbn_vnode_get_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                     stitch_ch_attr *attr);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 输出通道 id，取值同 `hbn_vnode_set_ochn_attr` |
| `attr` | `stitch_ch_attr *` | **出参**，回读到的输出画布属性 |

#### hbn_vnode_set_ochn_buf_attr

设置输出通道的 buffer 属性，**真正发起画布 buffer 分配的是本接口**。

```c
hobot_status hbn_vnode_set_ochn_buf_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                         hbn_buf_alloc_attr_t *alloc_attr);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 输出通道 id，固定传 0 |
| `alloc_attr` | `hbn_buf_alloc_attr_t *` | 含 `buffers_num` / `is_contig` / `flags` 三个成员 |

**要点**

- 拼接结果由应用侧读取时，`flags` 需包含 `HB_MEM_USAGE_CACHED`，并保证读 `virt_addr` 前 cache 一致
- `buffers_num` 决定同时可持有的画布数量；取值过小会让取帧等待

#### hbn_vnode_start

启动 vnode。

```c
hobot_status hbn_vnode_start(hbn_vnode_handle_t vnode_fd);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |

**要点**

- 绑进 vflow 时可改用 `hbn_vflow_start` 统一管理整条流

#### hbn_vnode_stop

停止 vnode。

```c
hobot_status hbn_vnode_stop(hbn_vnode_handle_t vnode_fd);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |

**要点**

- 绑进 vflow 时可改用 `hbn_vflow_stop` 统一管理整条流

#### hbn_vnode_getframe

从输出通道获取一张拼接画布，**阻塞接口**。

```c
hobot_status hbn_vnode_getframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                uint32_t millisecondTimeout, hbn_vnode_image_t *out_img);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 输出通道 id，固定传 0 |
| `millisecondTimeout` | `uint32_t` | 超时时间（毫秒） |
| `out_img` | `hbn_vnode_image_t *` | **出参**，拼接后的整张画布 |

**要点**

- 获取到的帧**必须**通过 `hbn_vnode_releaseframe` 归还，否则缓冲区耗尽后无法继续取帧
- 硬件侧处理失败时返回 `-41`（而非普通的取帧超时），此时查内核日志定位原因

#### hbn_vnode_releaseframe

归还一张画布。

```c
hobot_status hbn_vnode_releaseframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                    hbn_vnode_image_t *img);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 输出通道 id，需与取帧时一致 |
| `img` | `hbn_vnode_image_t *` | 要归还的帧 |

#### hbn_vnode_sendframe

向某一路输入通道送入源帧，**阻塞接口**，用于回灌场景。

```c
hobot_status hbn_vnode_sendframe(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
                                 hbn_vnode_image_t *img);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ichn_id` | `uint32_t` | 输入通道 id，取 0 ~ 3 |
| `img` | `hbn_vnode_image_t *` | 要送入的源帧 |

**要点**

- 源帧尺寸必须与该输入通道的 `stitch_ch_attr.width` / `height` 一致
- 多路回灌时逐路阻塞会拖慢整帧节奏，参考下一节

#### hbn_vnode_sendframe_async

非阻塞版本的送帧接口，语义与 `hbn_vnode_sendframe` 相同。

```c
hobot_status hbn_vnode_sendframe_async(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
                                       hbn_vnode_image_t *img);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ichn_id` | `uint32_t` | 输入通道 id，取 0 ~ 3 |
| `img` | `hbn_vnode_image_t *` | 要送入的源帧 |

**要点**

- 多路回灌的写法：**1 ~ N-1 路用 `hbn_vnode_sendframe_async` 送入，0 号通道最后用 `hbn_vnode_sendframe` 同步送入**。0 号通道是回灌模式的触发点，它到达时本次拼接立即开始；若 0 号先到，其余各路会被当作缺帧、以全零帧替换（显示侧呈绿色）

## 排障

### 常见返回码

| 返回值 | 宏 | 含义与下一步 |
| --- | --- | --- |
| `-8` | `HBN_STATUS_INVALID_NULL_PTR` | 传了空指针；源帧被驱动丢弃后取帧也返回此值，见[不报错、但结果不对的配置](#不报错但结果不对的配置) |
| `-22` | `-EINVAL` | 属性组合非法（尺寸不匹配、对齐不满足等） |
| `-41` | `HBN_STATUS_NODE_POLL_HUP` | 硬件处理失败，驱动向取帧队列发了挂起信号。查内核 `hw process faild` 一行确认原因 |
| `-655368` | `HBN_STATUS_STH_INVALID_NULL_PTR` | STITCH 侧空指针 |
| `-655369` | `HBN_STATUS_STH_INVALID_PARAMETER` | STITCH 侧参数非法 |
| `-655389` | `HBN_STATUS_STH_OPEN_OCHN_FAIL` | 输出通道打开失败 |
| `-655390` | `HBN_STATUS_STH_OPEN_ICHN_FAIL` | 输入通道打开失败 |
| `-655407` | `HBN_STATUS_STH_INIT_BIND_ERROR` | 绑定初始化失败 |
| `-655411` | `HBN_STATUS_STH_INVALID_VERSION` | 版本不匹配 |


### 调试节点

节点挂在 `stitch0_ich0` 下，输出通道 `stitch0_och` 下没有这组节点：

```bash
cat /sys/class/vps/stitch0_ich0/loading        # 硬件占用率，默认采样窗口 200 ms
cat /sys/class/vps/stitch0_ich0/hw_timeout     # 硬件超时，默认 1000 ms
cat /sys/class/vps/stitch0_ich0/regdump        # 寄存器快照，只读
```

- `loading` 只在运行中有意义，且与上一次读取间隔太近会读到 `0.0 %`；在跑流时从另一个会话读取、间隔 1 s 以上。
- `loading` 的采样窗口可写：`echo 1000 > /sys/class/vps/stitch0_ich0/loading`，范围 `(0, 10000]` ms，填 0 回落默认值。
- `hw_timeout` 可写：`echo 2000 > /sys/class/vps/stitch0_ich0/hw_timeout`，有效范围 1 ~ 5000 ms；写入 0 或超过 5000 后读回 0，不是回落默认值（两板实测）。
- 帧率不在 STITCH 节点上，见 flow 级的 `/sys/class/vps/flow/fps`。

## 相关文档

- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api) —— vnode 通用接口与 `hbn_vnode_*` 字段表
- [共享内存 - Hbmem](/Advanced_development/multimedia_development/multimedia_api/hbmem_api) —— 源帧与 LUT buffer 的分配（`hb_mem_*`）
- [畸变矫正 - GDC](/Advanced_development/multimedia_development/multimedia_api/gdc_api) —— IPM 逆透视变换，环视拼接的上游
- [视频处理框架 - VPF/PYM](/Advanced_development/multimedia_development/multimedia_api/vpf_pym_api) —— 缩放与金字塔，拼墙场景的上游
- [视频输入 - VIN](/Advanced_development/multimedia_development/multimedia_api/vin_api) —— 相机接入，环视与拼墙链路的起点（`STH_MODE_FLOW` 的典型上游）

板端示例：

- `/app/multimedia_demo/camsys_demo/sample_gdc_stitch/` —— 离线 GDC + STITCH 环视（两板均有）

通路类样例的说明文档：

<DocScope products="RDK S100">

- [sample_pipeline 使用说明](../02_multimedia_sample/09_sample_pipeline.md)

</DocScope>

<DocScope products="RDK S600">

- [sample_pipeline 使用说明](../02_multimedia_sample_s600/09_sample_pipeline.md)

</DocScope>
