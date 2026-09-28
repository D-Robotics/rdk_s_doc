---
sidebar_position: 1
title: "MediaCodec 使用指南"
description: "RDK S100/S600 MediaCodec 编解码概述、硬件规格、使用说明与排障"
toc_max_heading_level: 4
---

import DocScope from '@site/src/components/DocScope';

# MediaCodec 使用指南

## 概述

MediaCodec 是 RDK 的音视频编解码 API，向下封装两个硬件加速单元，向上提供一套统一的接口。

- **VPU**：视频编解码单元，负责 H.264 / H.265 / MJPEG 的编码与解码
- **JPU**：图像编解码单元，负责 JPEG / MJPEG 的编码与解码
- **软件编解码库**：音频编解码，RDK 无音频硬件加速单元。内置 FLAC、G.711（A-law / Mu-law）、G.726、ADPCM、AAC 共 6 种软件编解码器，直接以 `codec_id` 使用；另可通过 `hb_mm_mc_register_audio_encoder` / `hb_mm_mc_register_audio_decoder` 注册外部编解码器，用完调对应的 `unregister_*` 去注册

编码把 YUV 图像压缩成码流，解码方向相反。输入输出经 **buffer 队列**流转，全程由**状态机**驱动，接口能否调用取决于当前状态。各单元的规格见[硬件规格](#硬件规格)。

## 硬件规格

### VPU

<DocScope products="RDK S100">

- **硬件单元数**：1
- **吞吐能力**：4K@90fps
- **10bit 解码吞吐**：受总线 outstanding 瓶颈，规格目标 4K@80fps
- **编码标准**：H.264 / H.265 / MJPEG
- **最大输入分辨率**：8192 × 4096
- **最小输入分辨率**：256 × 128
- **输入对齐要求**：宽 32、高 8
- **最大实例数**：32
- **输入位深**：8bit、10bit
- **输入图像格式**：4:2:0 / 4:2:2
- **输出图像格式**：4:2:0
- **输入裁剪**：支持
- **码率控制**：CBR / VBR / AVBR / FIXQP / QPMAP
- **旋转**：90° / 180° / 270°
- **镜像**：垂直 / 水平 / 垂直+水平
- **长期参考帧预测**：支持自定义设置
- **帧内刷新**：支持
- **去块滤波**：支持
- **请求 IDR**：支持
- **ROI 模式**：mode1——最多 64 个区域设重要度（0–8），需 CBR / AVBR；mode2——最多 64 个区域设 QP（0–51），与 CBR / AVBR 不兼容
- **GOP 模式**：0 自定义 + 1–9 预设，结构见 [GOP 与参考帧](#gop-与参考帧)

</DocScope>

<DocScope products="RDK S600">

- **硬件单元数**：3
- **吞吐能力**：3 × 4K@80fps
- **编码标准**：H.264 / H.265 / MJPEG
- **最大输入分辨率**：8192 × 4096
- **最小输入分辨率**：256 × 128
- **输入对齐要求**：宽 32、高 8
- **最大实例数**：32
- **输入位深**：8bit、10bit
- **输入图像格式**：4:2:0 / 4:2:2
- **输出图像格式**：4:2:0
- **输入裁剪**：支持
- **码率控制**：CBR / VBR / AVBR / FIXQP / QPMAP
- **旋转**：90° / 180° / 270°
- **镜像**：垂直 / 水平 / 垂直+水平
- **长期参考帧预测**：支持自定义设置
- **帧内刷新**：支持
- **去块滤波**：支持
- **请求 IDR**：支持
- **ROI 模式**：mode1——最多 64 个区域设重要度（0–8），需 CBR / AVBR；mode2——最多 64 个区域设 QP（0–51），与 CBR / AVBR 不兼容
- **GOP 模式**：0 自定义 + 1–9 预设，结构见 [GOP 与参考帧](#gop-与参考帧)

</DocScope>

### JPU

<DocScope products="RDK S100">

- **硬件单元数**：1
- **吞吐能力**：4K@90fps
- **编码标准**：JPEG（Baseline / Extended Sequential）/ MJPEG
- **最大输入分辨率**：8192 × 8192
- **最小输入分辨率**：32 × 32
- **最大实例数**：64
- **输入位深**：8bit、12bit
- **输入图像格式**：4:0:0 / 4:2:0 / 4:2:2 / 4:4:0 / 4:4:4
- **输出图像格式**：同输入图像格式
- **输入裁剪**：支持
- **码率控制**：FIXQP（MJPEG）
- **旋转**：90° / 180° / 270°
- **镜像**：垂直 / 水平 / 垂直+水平
- **量化表**：支持自定义设置
- **哈夫曼表**：支持自定义设置

</DocScope>

<DocScope products="RDK S600">

- **硬件单元数**：3
- **吞吐能力**：3 × 4K@50fps
- **编码标准**：JPEG（Baseline / Extended Sequential）/ MJPEG
- **最大输入分辨率**：8192 × 8192
- **最小输入分辨率**：32 × 32
- **最大实例数**：64
- **输入位深**：8bit、12bit
- **输入图像格式**：4:0:0 / 4:2:0 / 4:2:2 / 4:4:0 / 4:4:4
- **输出图像格式**：同输入图像格式
- **输入裁剪**：支持
- **码率控制**：FIXQP（MJPEG）
- **旋转**：90° / 180° / 270°
- **镜像**：垂直 / 水平 / 垂直+水平
- **量化表**：支持自定义设置
- **哈夫曼表**：支持自定义设置

</DocScope>

> **编解码合计能力**指同一时刻所有实例的编码与解码负载之和。按各路「宽 × 高 × 帧率」的像素吞吐求和折算，编码与解码都计入，上限为上述合计能力。

- 输入尺寸不满足对齐要求时，可使用 VPU 读入 CROP 功能先裁剪再编码，参见[最小编码示例](#最小编码示例)
- VPU 对 YUV 4:2:2：仅支持**编码输入** 4:2:2，硬件内部降采样为 4:2:0 后再编码
- JPU 解码主要受总线写带宽限制，非 YUV420 8bit 格式的吞吐按输出数据量等比例折算：YUV422 8bit 约为 YUV420 8bit 的 0.75 倍，YUV420 12bit 约为 0.5 倍

## 软件框架

![MediaCodec 软件框架：应用经 MediaCodec API 与各组件调用，经驱动落到 VPU / JPU 硬件](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/framework.png)

应用经 MediaCodec API 发起编解码，接口层封装参数下发与 buffer 队列，经驱动落到 VPU / JPU 硬件单元；音频编解码由软件库实现。MediaCodec 独立于 HBN vnode 框架，配置与启停走自己的 `hb_mm_mc_*` 接口。

## 使用说明

### 数据流转
一帧数据从取到还，走一条固定的回路：**dequeue 取出 → 填或读 → queue 还回**。输入输出各一条队列，调用方只负责取还 buffer，内存由 MediaCodec 分配（或直接复用上游模块的内存）。

![buffer 的申请与归还](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/fig2-buffer-flow.svg)

**编解码两个方向正好镜像**——同一个 `media_codec_buffer_t`，编码时输入装图像、输出出码流；解码时反过来：

| | 输入 buffer | 输出 buffer |
| --- | --- | --- |
| **编码** | 图像（`vframe_buf`） | 码流（`vstream_buf`） |
| **解码** | 码流（`vstream_buf`） | 图像（`vframe_buf`） |

**输入 buffer 的来源有两种**，由 `mc_video_codec_enc_params_t.external_frame_buf` 选择：

| 模式 | `external_frame_buf` | 说明 |
| --- | --- | --- |
| 内部输入 buffer | `0` | 输入内存由 MediaCodec 内部通过 hbmem 分配，来源对调用方透明 |
| 外部输入 buffer | `1` | 输入内存来自其他模块（如 PYM 的输出），必须也是 hbmem 分配的内存 |

外部输入 buffer 的意义是**省掉一次拷贝**：上游模块输出的图像帧本身就是 hbmem 内存，直接拿它当编码器的输入，不必再搬一次。

> 即使用外部输入 buffer，**仍然要走 dequeue / queue**：dequeue 取出 buffer 描述后，把它记录的地址改成上游帧的地址，再 queue 归还。buffer 的内存是复用的，换的只是内容来源。

buffer 各字段的完整定义（图像帧、码流、音频）见 [核心数据结构](/Advanced_development/multimedia_development/multimedia_api/mediacodec/api#核心数据结构)。
> **dequeue 与 queue 必须成对**。取出的 buffer 不归还，队列很快会耗尽，后续 dequeue 会一直超时。

### 典型场景

- **单路编码**：文件转码（读 YUV 落盘码流）或实时推流（相机画面经相机通路直送编码，码流走网络）
- **单路解码**：文件回灌出 YUV，或网络收流解码后送显示
- **多路编码**：批量文件转码，或多相机并发编码——每路一个编码实例，共享 VPU 吞吐
- **多路解码**：多路码流并发解码，用于批量处理或多画面上墙

各场景的完整链路图（文件链路与相机链路），见[应用场景](/Advanced_development/multimedia_development/multimedia_api/mediacodec/scene)。


### 编码配置

编码器的可配置项分六类，均通过 `set_*_config` 类接口下发，或在 `hb_mm_mc_configure` 之前写进 `media_codec_context_t`：**码率控制**（选哪种码控模式）、**GOP 与参考帧**（帧结构与参考关系）、**Intra Refresh**（抗误码）、**ROI**（分区域画质分配）、**帧 Skip**（跳帧维持帧率）、**编码工具开关**（画质 / 性能细节）。

#### 码率控制

编码器在**画质**与**码率**之间的取舍由 `video_enc_params.rc_params.mode` 决定：选定模式后填入该模式对应的参数。

| 模式 | `mode` 取值 | 特点 |
| --- | --- | --- |
| **CBR** | `MC_AV_RC_MODE_H264CBR` / `H265CBR` | 恒定码率。码率平稳，画面复杂时压低画质 |
| **VBR** | `MC_AV_RC_MODE_H264VBR` / `H265VBR` | 可变码率。画质优先，码率随画面复杂度起伏 |
| **AVBR** | `MC_AV_RC_MODE_H264AVBR` / `H265AVBR` | 平均码率。短期允许波动，长期收敛到目标值 |
| **FixQP** | `MC_AV_RC_MODE_H264FIXQP` / `H265FIXQP` / `MJPEGFIXQP` | 不做码率控制，QP 固定 |
| **QpMap** | `MC_AV_RC_MODE_H264QPMAP` / `H265QPMAP` | 逐块指定 QP，控制最精细 |

**模式选择**：

| 使用场景 | 推荐 | 原因 |
| --- | --- | --- |
| 带宽固定，需要可预测的码率 | **CBR** | 码率平稳是它唯一的优先项 |
| 本地存储，画质优先、不在意文件大小 | **VBR** | 把码率让给画面复杂度 |
| 大多数场景 | **AVBR** | 兼顾两者——码率长期可控、画质也不难看 |
| 调试验证，要确定性的画质 | **FixQP** | 没有码控的收敛过程，输出可复现 |
| 配合 ROI 做精细画质分配 | **QpMap** | 见 [ROI](#roi) |

![码率控制模式的取舍](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/fig3-rate-control.svg)

各模式的参数字段表见 [码率控制参数](/Advanced_development/multimedia_development/multimedia_api/mediacodec/api#码率控制)。


#### GOP 与参考帧

GOP 结构决定 I 帧的插入间隔与帧间参考关系，由 `mc_video_gop_params_t` 配置。`gop_preset_idx` 取 `0`–`9`：`0` 为自定义，`1`–`9` 为 9 种预设结构。

GOP 预设结构（`gop_preset_idx` 取 `1`–`9`）的完整说明与结构图，见 [GOP 预置结构](/Advanced_development/multimedia_development/multimedia_api/mediacodec/debug#gop预置结构)。

**自定义 GOP**（`gop_preset_idx = 0`）时，结构由 `mc_video_custom_gop_params_t` 描述：逐个图像指定类型（I / P / B）、显示顺序（POC）、QP 偏移、参考帧等，一条结构最多描述 8 张图片（`MC_MAX_GOP_NUM`），图片条目按**解码顺序**排列。

> 自定义结构中的参考帧如果指向 IDR 帧之前的图像，由编码器内部自动处理。

普通 P 帧参考前一帧，误差会逐帧累积。**长期参考帧**模式指定某个已编码帧长期留在参考帧列表里，让后续帧可以随时参考它，抑制累积误差。由 `mc_video_longterm_ref_mode_t` 配置：

| 成员 | 说明 |
| --- | --- |
| `use_longterm` | 是否使能长期参考帧模式，`0` 关闭 / `1` 开启（默认 `0`） |
| `longterm_pic_period` | 每隔多少帧指定一个长期参考帧 |
| `longterm_pic_using_period` | 长期参考帧被持续使用多少帧 |

运行时可通过 `hb_mm_mc_set_longterm_ref_mode` **动态调整**，不需要重启编码器。

字段表见 [GOP 与参考帧](/Advanced_development/multimedia_development/multimedia_api/mediacodec/api#gop-与参考帧)。


#### Intra Refresh

丢包或误码会让解码端出现时域错误，并沿参考链一路传播到后续帧。**Intra Refresh** 在非 I 帧内部周期性地插入帧内编码的块（H.264 的 MB / H.265 的 CTU），让解码端有更多修复点，从而限制错误的传播范围。适合码流经不可靠信道传输（无线 / 易丢包链路）的场景；本地存储或可靠链路下通常不需要。

由 `mc_video_intra_refresh_params_t` 配置，可指定插入的行数、列数或步长。也可以只给出总量，让编码器内部自行决定哪些块需要帧内编码。

字段表见 [Intra Refresh](/Advanced_development/multimedia_development/multimedia_api/mediacodec/api#intra-refresh)。


#### ROI

ROI 编码为图像中不同区域分别指定 QP，实现「重点区域高画质、次要区域省码率」。配置方式与 QpMap 类似：**按光栅扫描顺序**为每个块指定一个 QP 值。

- H.264 的块大小为 **16 × 16** 像素，H.265 为 **32 × 32** 像素
- 每个 QP 值占 1 字节，取值范围 `[0, 51]`

ROI 与码率控制同时使能时，块的实际 QP 由 ROI 表与码控共同合成（需要先用 `hb_mm_mc_set_roi_avg_qp` 告知编码器 ROI 表的平均 QP），合成公式见 [ROI 编码参数](/Advanced_development/multimedia_development/multimedia_api/mediacodec/api#roi-编码参数)。

相关接口：`hb_mm_mc_set_roi_config` / `hb_mm_mc_get_roi_config`、`hb_mm_mc_set_roi_avg_qp` / `hb_mm_mc_get_roi_avg_qp`，以及按索引操作的 `hb_mm_mc_set_roi_config_ex` / `hb_mm_mc_get_roi_config_ex`。

字段表见 [ROI 编码参数](/Advanced_development/multimedia_development/multimedia_api/mediacodec/api#roi-编码参数)。


#### 帧 Skip

调用 `hb_mm_mc_skip_pic` 可以让**下一次** queue 输入的那一帧走 skip 模式：编码器忽略输入图像内容，直接复用上一帧的重构帧，输出一个 P 帧。

典型用途是上游送帧不及时或者画面确实没有变化时，用极低的代价维持帧率与时间戳连续。

三条约束：

- skip 只对**非 I 帧**有效
- 输入的图像会被忽略，但仍需正常完成 dequeue / queue 流程
- 无论 GOP 结构如何，skip 帧一律编成 **P 帧**


#### 编码工具开关

编码器内置的若干画质 / 性能开关，均可运行中调整。各开关的各开关的字段表见 [编码质量工具](/Advanced_development/multimedia_development/multimedia_api/mediacodec/api#编码质量工具)。

- **编码工具细节**（去块滤波、SAO、熵编码、帧内预测、变换、模式决策）：编码标准实现层的调节项，多数场景使用默认值即可
- **智能背景编码**：静态背景区域长期参考，降低背景码率
- **3D 降噪**：时域降噪，抑制编码前的噪点

### API 调用流程

MediaCodec 由状态机驱动，接口调用的合法性取决于当前状态。状态取值见 [media_codec_state_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/api#media_codec_state_t)。

#### 状态迁移

![MediaCodec 状态迁移](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/fig1-state-machine.svg)

<details>
<summary>展开：状态迁移表与两条易错规则</summary>

下表为各接口调用成功后的状态变化。

| 调用 | 前置状态 | 之后状态 |
| --- | --- | --- |
| `hb_mm_mc_initialize` | `UNINITIALIZED` | `INITIALIZED` |
| `hb_mm_mc_configure` | `INITIALIZED` | `CONFIGURED` |
| `hb_mm_mc_start` | `CONFIGURED` 或 `PAUSED` | `STARTED` |
| `hb_mm_mc_pause` | `STARTED` | `PAUSED` |
| `hb_mm_mc_flush` | `STARTED` | 过程中 `FLUSHING`，完成后自动回到 `STARTED` |
| `hb_mm_mc_stop` | `STARTED` | `INITIALIZED` |
| `hb_mm_mc_release` | 任意 | `UNINITIALIZED` |

两条易错规则：

- **从 `PAUSED` 恢复运行，用的是 `hb_mm_mc_start`**，不是别的接口
- **`hb_mm_mc_stop` 之后不能直接 `hb_mm_mc_start`** —— `stop` 会把状态复位到 `INITIALIZED`，而 `start` 要求 `CONFIGURED`。此时直接调用 `start` 会返回 `HB_MEDIA_ERR_OPERATION_NOT_ALLOWED`。要重新启动，必须再走一次 `hb_mm_mc_configure`

</details>

#### 调用序列

典型的编码流程（解码流程方向相反，接口序列一致）：

![MediaCodec API 调用流程思维导图：1–11 主支，9 号为逐帧循环](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/fig4-api-sequence.svg)

<details>
<summary>展开：完整调用序列</summary>

1. `hb_mm_mc_get_descriptor(codec_id)` 查该 codec 是否可用。
2. `hb_mm_mc_get_default_context(codec_id, 1, &context)` 取默认 context（`1` = 编码器），再按业务改字段。
3. `hb_mm_mc_initialize(&context)` 初始化。
4. `hb_mm_mc_set_*_config(...)`（可选）以接口形式配置码控、GOP、ROI、编码工具等，也可直接写进 context 随 `configure` 一次下发；多数 `set_*_config` 支持启动后动态调整，见各接口说明。
5. `hb_mm_mc_configure(&context)` 参数下发。
6. `hb_mm_mc_set_callback(...)` / `hb_mm_mc_set_vlc_buffer_listener(...)`（可选）切异步模式 —— **必须在 `start` 之前**。
7. `hb_mm_mc_start(&context, &startup_params)` 启动。
8. 每帧：`hb_mm_mc_dequeue_input_buffer` 取空 buffer → 填入 YUV → `hb_mm_mc_queue_input_buffer` 交还 → `hb_mm_mc_dequeue_output_buffer` 取码流 → 消费 → `hb_mm_mc_queue_output_buffer` 归还。
9. 运行中可调：`hb_mm_mc_set_rate_control_config`、`hb_mm_mc_request_idr_frame`、`hb_mm_mc_set_roi_config`、`hb_mm_mc_pause`、`hb_mm_mc_flush`。
10. 收尾：`hb_mm_mc_stop(&context)` + `hb_mm_mc_release(&context)`。

</details>

#### 同步与异步

默认是**同步模式**：调用方在一个循环里主动 dequeue / queue，用超时参数控制等待。

调用 `hb_mm_mc_set_callback` 后进入**异步模式**：编码器/解码器在输入 buffer 可用、输出 buffer 可用时回调通知，调用方在回调里处理。异步模式适合上游数据由外部事件驱动的场景。

两种模式的选择是**二选一**，`hb_mm_mc_set_callback` 必须在 `hb_mm_mc_start` 之前调用。

### 快速示例
板端示例程序 `sample_codec` 是一份可直接运行的 MediaCodec 参考实现，源码在 `/app/multimedia_samples/sample_codec/`，同时提供了 H.264 / H.265 / JPEG 的编解码示例。运行方式与配置项详见 [sample_codec 使用说明](/Advanced_development/multimedia_development/multimedia_sample/sample_codec)。

#### 最小编码示例

示例程序内部对每个码流通道执行的核心序列（编码为例，解码方向相反）：

```c
#include "hb_media_codec.h"

const media_codec_descriptor_t *desc = hb_mm_mc_get_descriptor(MEDIA_CODEC_ID_H264);

/* 1. 取默认 context，再改业务参数 */
media_codec_context_t context = {0};
hb_mm_mc_get_default_context(MEDIA_CODEC_ID_H264, 1, &context);   /* 1 = 编码器 */
context.video_enc_params.width   = 1920;
context.video_enc_params.height  = 1080;
context.video_enc_params.pix_fmt = MC_PIXEL_FORMAT_NV12;
/* 帧率与码率属于码率控制参数，不在 video_enc_params 上 */
context.video_enc_params.rc_params.mode = MC_AV_RC_MODE_H264CBR;
context.video_enc_params.rc_params.h264_cbr_params.bit_rate   = 8192;   /* 单位 kbps */
context.video_enc_params.rc_params.h264_cbr_params.frame_rate = 30;

/* 2. 初始化并配置 */
hb_mm_mc_initialize(&context);
hb_mm_mc_configure(&context);

/* 3. 启动 */
mc_av_codec_startup_params_t startup_params = {0};
hb_mm_mc_start(&context, &startup_params);

/* 4. 逐帧循环：取输入 buffer -> 填 YUV -> 交还 -> 取输出 buffer -> 消费码流 -> 交还 */
while (frame_count--) {
    media_codec_buffer_t in_buf  = {0};
    media_codec_buffer_t out_buf = {0};
    media_codec_output_buffer_info_t out_info = {0};

    hb_mm_mc_dequeue_input_buffer(&context, &in_buf, 2000);
    /* NV12 分两个平面：Y 写 vir_ptr[0]（width*height 字节），UV 写 vir_ptr[1] */
    hb_mm_mc_queue_input_buffer(&context, &in_buf, 2000);

    hb_mm_mc_dequeue_output_buffer(&context, &out_buf, &out_info, 2000);
    /* 从 out_buf.vstream_buf.vir_ptr 取 out_buf.vstream_buf.size 字节码流写文件 */
    hb_mm_mc_queue_output_buffer(&context, &out_buf, 0);
}

/* 5. 停止并释放 */
hb_mm_mc_stop(&context);
hb_mm_mc_release(&context);
```

> 解码的用法见下节[最小解码示例](#最小解码示例)——有两点与编码不同，其中 `feed_mode` 不设会直接失败。

#### 最小解码示例

与编码序列同构，差异在 context 的取法、`feed_mode` 必设、以及 buffer 的方向。完整代码如下：

```c
#include <stdio.h>
#include <string.h>
#include "hb_media_codec.h"

FILE *fi = fopen("input.h264", "rb");
unsigned char chunk[256 * 1024];
int eos = 0;

/* 1. 取默认 context —— encoder 传 0 表示解码器 */
media_codec_context_t context = {0};
hb_mm_mc_get_default_context(MEDIA_CODEC_ID_H264, 0, &context);
context.video_dec_params.pix_fmt = MC_PIXEL_FORMAT_NV12;
/* feed_mode 必须显式设置：默认的 MC_FEEDING_MODE_NONE 非法，configure 会直接失败 */
context.video_dec_params.feed_mode           = MC_FEEDING_MODE_STREAM_SIZE;
context.video_dec_params.bitstream_buf_size  = 1024 * 1024;
context.video_dec_params.bitstream_buf_count = 5;

/* 2. 初始化、配置、启动 —— 与编码完全一致 */
hb_mm_mc_initialize(&context);
hb_mm_mc_configure(&context);
mc_av_codec_startup_params_t startup_params = {0};
hb_mm_mc_start(&context, &startup_params);

/* 3. 送码流、取图像 */
while (!eos) {
    media_codec_buffer_t in_buf = {0}, out_buf = {0};
    media_codec_output_buffer_info_t out_info = {0};
    size_t n = fread(chunk, 1, sizeof(chunk), fi);
    eos = (n < sizeof(chunk));          /* 读到文件尾，最后一包要标记 */

    hb_mm_mc_dequeue_input_buffer(&context, &in_buf, 2000);
    memcpy(in_buf.vstream_buf.vir_ptr, chunk, n);
    in_buf.vstream_buf.size       = n;
    in_buf.vstream_buf.stream_end = eos;   /* 置 1 后解码器才会吐完缓冲的帧 */
    hb_mm_mc_queue_input_buffer(&context, &in_buf, 2000);

    while (hb_mm_mc_dequeue_output_buffer(&context, &out_buf, &out_info, 300) == 0) {
        /* 从 out_buf.vframe_buf.vir_ptr[0] (Y) 与 [1] (UV) 取 NV12 图像写文件 */
        hb_mm_mc_queue_output_buffer(&context, &out_buf, 0);
    }
}

/* 4. 停止并释放 */
hb_mm_mc_stop(&context);
hb_mm_mc_release(&context);
```

三点与编码不同，其中第 2 条不写会**直接失败**：

1. `hb_mm_mc_get_default_context` 的 `encoder` 传 `0`，`codec_id` 换成目标码流格式
2. **`feed_mode` 必须显式设置**。默认值 `MC_FEEDING_MODE_NONE`（`-1`）非法，`hb_mm_mc_configure` 返回 `HB_MEDIA_ERR_INVALID_PARAMS`。按字节送用`MC_FEEDING_MODE_STREAM_SIZE`，按整帧送用 `MC_FEEDING_MODE_FRAME_SIZE`
3. **buffer 方向相反**：输入是码流（写 `vstream_buf`），输出是图像（读 `vframe_buf`）

送码流时 `bitstream_buf_size` 要大于单次送入的字节数；末尾那包把 `vstream_buf.stream_end`
置 `1`，解码器才会把缓冲的帧全部吐出（会多吐一帧 `size = 0` 的收尾帧，正常）。

## 注意事项与约束

### 状态与调用顺序

| 约束 | 说明 |
| --- | --- |
| `hb_mm_mc_set_callback` 的位置 | 必须在 `hb_mm_mc_start` 之前 |
| `hb_mm_mc_set_vlc_buffer_listener` 的位置 | 必须在 `hb_mm_mc_start` 之前 |
| buffer 操作的状态 | `dequeue` / `queue` 四个接口只在 `MEDIA_CODEC_STATE_STARTED` 状态下有效 |
| `codec_id` 与 `encoder` | 在 `hb_mm_mc_initialize` 之后不可更改 |
| 各 `set_*_config` | 启动前调用需在 `hb_mm_mc_configure` 之前；标注「支持动态调整」的可在运行中调用 |

### codec 适用性

不同编码标准支持的配置项不同。对不支持的 codec 调用相应接口，返回 `HB_MEDIA_ERR_UNSUPPORTED_FEATURE` 或 `HB_MEDIA_ERR_INVALID_PARAMS`。

| 配置项 | H.264 | H.265 | MJPEG / JPEG |
| --- | --- | --- | --- |
| 码率控制 | ✅ | ✅ | 仅 FixQP |
| GOP / 长期参考帧 / Intra Refresh / IDR / skip | ✅ | ✅ | ❌ |
| SAO | ❌ | ✅ | ❌ |
| 熵编码模式 | ✅ | ❌ | ❌ |
| 模式决策 | ❌ | ✅ | ❌ |
| 去块滤波 / 帧内预测 / 变换 / 智能背景 / 3D 降噪 | ✅ | ✅ | ❌ |
| ROI / QpMap | ✅ | ✅ | ❌ |
| VUI / 用户数据 / 显式头 | ✅ | ✅ | ❌ |
| slice 切分 | ✅ 设置 | ✅ 设置 | 仅读取 |
| 旋转 / 镜像 | ✅ 仅编码 | ✅ 仅编码 | ✅ 仅编码 |

### 参数填写

- **分辨率对齐**：宽必须是 32 的倍数、高必须是 8 的倍数。不满足时可用 VPU 的裁剪功能先裁再编
- **`bitstream_buf_size` 与单帧码流大小**：buffer 必须大于单帧最大码流。填 `0` 由 codec 自行计算
- **ROI 与码率控制的组合**：QpMap 形式（`mc_video_roi_params_t`）需要码率控制开启；区域形式（`mc_video_roi_params_ex_t`）的模式 1 需要码率控制、模式 2 不能与码率控制并用
- **Intra Refresh 自适应模式**（`intra_refresh_mode = 4`）不能与无损编码和 ROI 同时使用
- **`external_frame_buf = 1` 时**：外部 buffer 的地址仍需通过 dequeue / queue 流程填入，直接改 buffer 地址即可

具体故障现象与排查见[常见问题](/Advanced_development/multimedia_development/multimedia_api/mediacodec/faq)；调试节点与状态输出见[调试指南](/Advanced_development/multimedia_development/multimedia_api/mediacodec/debug)。

## 相关文档
- [MediaCodec 调试指南](/Advanced_development/multimedia_development/multimedia_api/mediacodec/debug)
- [MediaCodec 应用场景](/Advanced_development/multimedia_development/multimedia_api/mediacodec/scene)
- [MediaCodec 常见问题](/Advanced_development/multimedia_development/multimedia_api/mediacodec/faq)
- [sample_codec 使用说明](/Advanced_development/multimedia_development/multimedia_sample/sample_codec)
- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
- [视频输入 - VIN](/Advanced_development/multimedia_development/multimedia_api/vin_api)
