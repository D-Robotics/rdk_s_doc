---
toc_max_heading_level: 4
---

import DocScope from '@site/src/components/DocScope';

# 编解码 - MediaCodec


## 概述

MediaCodec 是 RDK 的音视频编解码 API，向下封装两个硬件加速单元，向上提供一套统一的接口。

- **VPU**：视频编解码单元，负责 H.264 / H.265 / MJPEG 的编码与解码
- **JPU**：图像编解码单元，负责 JPEG / MJPEG 的编码与解码
- **软件编解码库**：音频编解码，RDK 无音频硬件加速单元。内置 FLAC、G.711（A-law / Mu-law）、G.726、ADPCM、AAC 共 6 种软件编解码器，直接以 `codec_id` 使用；另可通过 `hb_mm_mc_register_audio_encoder` / `hb_mm_mc_register_audio_decoder` 注册外部编解码器，用完调对应的 `unregister_*` 去注册

> 音频软件编解码器中的 AAC 涉及第三方专利授权，商用前需自行向 AAC 技术管理组织申请许可。

![MediaCodec 软件框架：应用经 MediaCodec API 与各组件调用，经驱动落到 VPU / JPU 硬件](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/framework.png)

编码把 YUV 图像压缩成码流，解码方向相反。输入输出经 **buffer 队列**流转，全程由**状态机**驱动，接口能否调用取决于当前状态。各单元的规格见[硬件规格](#硬件规格)。

## 硬件规格

### VPU

<DocScope products="RDK S100">

| 项目 | S100 |
| --- | --- |
| VPU 核数 | 1 |
| 编解码标准 | H.264 / H.265 / MJPEG |
| 编解码实例总数 | 32 |
| 编解码合计能力 | 4K@90fps |
| 最大分辨率 | 8192 × 4096 |
| 最小分辨率 | 256 × 128 |
| 宽高对齐要求 | 宽 8、高 8 |
| 输入位深 | 8bit |
| 码率控制 | CBR / VBR / AVBR / FixQP / QpMap |
| 旋转 | 90° / 180° / 270° |
| 镜像 | 水平 / 垂直 / 水平+垂直 |
| B 帧 | 支持（取决于 GOP 预设，见 [GOP 与参考帧](#gop-与参考帧)） |

</DocScope>

<DocScope products="RDK S600">

| 项目 | S600 |
| --- | --- |
| VPU 核数 | 3 |
| 编解码标准 | H.264 / H.265 / MJPEG |
| 编解码实例总数 | 32 |
| 编解码合计能力 | 3 × 4K@80fps |
| 最大分辨率 | 8192 × 4096 |
| 最小分辨率 | 256 × 128 |
| 宽高对齐要求 | 宽 8、高 8 |
| 输入位深 | 8bit |
| 码率控制 | CBR / VBR / AVBR / FixQP / QpMap |
| 旋转 | 90° / 180° / 270° |
| 镜像 | 水平 / 垂直 / 水平+垂直 |
| B 帧 | 支持（取决于 GOP 预设，见 [GOP 与参考帧](#gop-与参考帧)） |

</DocScope>

> **编解码合计能力**指同一时刻所有实例的编码与解码负载之和。按各路「宽 × 高 × 帧率」的像素吞吐求和折算，编码与解码都计入，上限为上表合计能力。

### JPU

<DocScope products="RDK S100">

| 项目 | S100 |
| --- | --- |
| JPU 核数 | 1 |
| 编解码标准 | JPEG（Baseline / Extended Sequential）、MJPEG |
| 编解码实例总数 | 64 |
| 编解码合计能力 | 4K@90fps |
| 最大分辨率 | 8192 × 8192 |
| 最小分辨率 | 32 × 32 |
| 输入位深 | 8bit |
| 支持色彩格式 | 4:0:0 / 4:2:0 / 4:2:2 / 4:4:0 / 4:4:4 |
| 码率控制 | FixQP |
| 旋转 | 90° / 180° / 270° |
| 镜像 | 水平 / 垂直 / 水平+垂直 |
| 量化表 / 哈夫曼表 | 支持自定义 |

</DocScope>

<DocScope products="RDK S600">

| 项目 | S600 |
| --- | --- |
| JPU 核数 | 3 |
| 编解码标准 | JPEG（Baseline / Extended Sequential）、MJPEG |
| 编解码实例总数 | 64 |
| 编解码合计能力 | 3 × 4K@50fps |
| 最大分辨率 | 8192 × 8192 |
| 最小分辨率 | 32 × 32 |
| 输入位深 | 8bit |
| 支持色彩格式 | 4:0:0 / 4:2:0 / 4:2:2 / 4:4:0 / 4:4:4 |
| 码率控制 | FixQP |
| 旋转 | 90° / 180° / 270° |
| 镜像 | 水平 / 垂直 / 水平+垂直 |
| 量化表 / 哈夫曼表 | 支持自定义 |

</DocScope>

## 使用说明

### 数据通路
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
| 内部输入 buffer | `0` | 输入内存由 MediaCodec 内部通过 hbmem 分配，调用方不关心内存来源 |
| 外部输入 buffer | `1` | 输入内存来自其他模块（如 VPF 通路、PYM 的输出），必须也是 hbmem 分配的内存 |

外部输入 buffer 的意义是**省掉一次拷贝**：上游模块输出的图像帧本身就是 hbmem 内存，直接拿它当编码器的输入，不必再搬一次。

> 即使用外部输入 buffer，**仍然要走 dequeue / queue**：dequeue 拿到 buffer 描述后，把它记录的地址改成上游帧的地址，再 queue 回去。buffer 的内存是复用的，换的只是内容来源。

<details>
<summary>展开：buffer 结构体定义</summary>

三个结构体是一层层套下去的：`media_codec_buffer_t` 按 `type` 选联合体成员，图像与码流各有一个专门的描述结构。

**buffer 描述符 —— dequeue 的返回值**

```c
typedef struct _media_codec_buffer {
    media_codec_buffer_type_t type;               // 决定下面哪个联合体成员生效
    union {
        mc_video_frame_buffer_info_t  vframe_buf;  // 图像帧：编码的输入、解码的输出
        mc_video_stream_buffer_info_t vstream_buf; // 码流：编码的输出、解码的输入
        mc_audio_frame_buffer_info_t  aframe_buf;
        mc_audio_stream_buffer_info_t astream_buf;
    };
} media_codec_buffer_t;
```

**图像帧**

```c
typedef struct _mc_video_frame_buffer_info {
    hb_u8  *vir_ptr[3];       // 各分量平面的虚拟地址。NV12 用 [0] = Y、[1] = UV
    hb_u64  phy_ptr[3];       // 各分量平面的物理地址
    hb_u32  size;             // 帧数据字节数
    hb_u32  compSize[3];      // 各分量平面的字节数
    hb_s32  width, height;    // 帧宽高
    mc_pixel_format_t pix_fmt;// 像素格式
    hb_s32  stride, vstride;  // 行跨度 / 垂直跨度
    hb_s32  fd[3];            // 各分量平面的 dma-buf fd
    hb_u64  pts;              // 时间戳
    hb_s32  src_idx;          // 源 buffer 索引，hb_mm_mc_skip_pic 用得到
    hb_bool frame_end;        // 是否为本批送帧的最后一帧
    hb_bool qp_map_valid;     // 本次是否携带 QP 映射表
    hb_byte qp_map_array;     // QP 映射表地址
    hb_u32  qp_map_array_count;
    hb_s32  flags;
} mc_video_frame_buffer_info_t;
```

**码流**

```c
typedef struct _mc_video_stream_buffer_info {
    hb_u8  vir_ptr;      // 码流的虚拟地址
    hb_u64 phy_ptr;      // 码流的物理地址
    hb_u32 size;         // 码流字节数
    hb_u64 pts;          // 时间戳
    hb_s32 fd;           // dma-buf fd
    hb_s32 src_idx;      // 源 buffer 索引
    hb_bool stream_end;  // 是否为码流结尾，最后一包置 1
} mc_video_stream_buffer_info_t;
```

</details>

> **dequeue 与 queue 必须成对**。取出的 buffer 不归还，队列很快会耗尽，后续 dequeue 会一直超时。

#### 典型场景

四种典型数据通路——单路 / 多路 × 编码 / 解码：

![单路编码：文件输入直存，或串联相机通路](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/scene-enc-single.png)

![单路解码：文件回灌出图，或网络收流送显](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/scene-dec-single.png)

![多路编码：多文件或多相机并发编码](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/scene-enc-multi.png)

![多路解码：多路码流并发解码](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/scene-dec-multi.png)

### 关键配置选择
以下参数决定编码器「怎么编」——码率、参考关系、画质分配。它们都通过 `set_*_config` 类接口下发，或在 `hb_mm_mc_configure` 之前写进 `media_codec_context_t`。

#### 码率控制

编码器怎么在**画质**与**码率**之间取舍。由 `video_enc_params.rc_params.mode` 选模式，再填该模式对应的参数。

| 模式 | `mode` 取值 | 特点 |
| --- | --- | --- |
| **CBR** | `MC_AV_RC_MODE_H264CBR` / `H265CBR` | 恒定码率。码率平稳，画面复杂时压低画质 |
| **VBR** | `MC_AV_RC_MODE_H264VBR` / `H265VBR` | 可变码率。画质优先，码率随画面复杂度起伏 |
| **AVBR** | `MC_AV_RC_MODE_H264AVBR` / `H265AVBR` | 平均码率。短期允许波动，长期收敛到目标值 |
| **FixQP** | `MC_AV_RC_MODE_H264FIXQP` / `H265FIXQP` / `MJPEGFIXQP` | 不做码率控制，QP 固定 |
| **QpMap** | `MC_AV_RC_MODE_H264QPMAP` / `H265QPMAP` | 逐块指定 QP，控制最精细 |

**怎么选**：

| 你的场景 | 推荐 | 原因 |
| --- | --- | --- |
| 带宽固定，需要可预测的码率 | **CBR** | 码率平稳是它唯一的优先项 |
| 本地存储，画质优先、不在意文件大小 | **VBR** | 把码率让给画面复杂度 |
| 大多数场景 | **AVBR** | 兼顾两者——码率长期可控、画质也不难看 |
| 调试验证，要确定性的画质 | **FixQP** | 没有码控的收敛过程，输出可复现 |
| 配合 ROI 做精细画质分配 | **QpMap** | 见 [ROI](#roi) |

![码率控制模式的取舍](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/fig3-rate-control.svg)

**CBR / AVBR 的参数**（填进 `video_enc_params.rc_params.h264_cbr_params` 或 `h265_cbr_params`）：

| 参数 | 含义 | 取值 | 默认 |
| --- | --- | --- | --- |
| `intra_period` | I 帧间隔 | `[0,2047]` | 28 |
| `intra_qp` | I 帧的 QP | `[0,51]` | 30 |
| `bit_rate` | 目标平均码率，单位 kbps | `[0,700000]` | 1000 |
| `frame_rate` | 目标帧率，单位 fps | `[1,240]` | 30 |
| `initial_rc_qp` | 初始 QP；超出 `[0,51]` 时由编码器自定 | `[0,63]` | 63 |
| `vbv_buffer_size` | VBV 缓冲大小，单位 ms。**越小码率越精确、画质越差；越大反之** | `[10,3000]` | CBR 10 / AVBR 3000 |
| `mb_level_rc_enalbe` | 码控精细到 MB 级，画质换精度；**与 ROI 互斥** | `0` / `1` | 0 |
| `min_qp_I` · `max_qp_I` | I 帧 QP 的上下限 | `[0,51]` | 8 / 51 |
| `min_qp_P` · `max_qp_P` | P 帧 QP 的上下限 | `[0,51]` | 8 / 51 |
| `min_qp_B` · `max_qp_B` | B 帧 QP 的上下限 | `[0,51]` | 8 / 51 |
| `hvs_qp_enable` | 按块方差微调 QP，提升主观画质 | `0` / `1` | 1 |
| `hvs_qp_scale` | 上述微调的强度，1 代表原值 | `[0,4]` | 2 |
| `max_delta_qp` | 上述微调的幅度上限 | `[0,12]` | 10 |
| `qp_map_enable` | 是否启用 QP 映射表 | `0` / `1` | 0 |

> 上表默认值为 `hb_mm_mc_get_default_context` 的返回结果。

**VBR 的参数**（`h264_vbr_params` / `h265_vbr_params`）比 CBR 少得多，只有`intra_period`、`intra_qp`、`frame_rate`、`qp_map_enable`——没有码率目标，也没有 QP 上下限。

**FixQP 的参数**（`h264_fixqp_params` / `h265_fixqp_params`）只有`intra_period`、`frame_rate`、`force_qp_I` / `force_qp_P` / `force_qp_B`——直接指定每类帧的 QP。

**运行中切码率**：`hb_mm_mc_set_rate_control_config` 支持动态调整。例如检测到网络带宽下降，可以直接切到更低的码率目标，不需要重启编码器。

**限制峰值**：AVBR / CBR 还可以用 `hb_mm_mc_set_max_bit_rate_config` 单独限制峰值码率。注意当设置值**小于**目标码率 `bit_rate` 时，该限制不产生约束。

#### GOP 与参考帧

GOP 结构决定 I 帧的插入间隔与帧间参考关系，由 `mc_video_gop_params_t` 配置。RDK 提供 **10 种预设结构**（`gop_preset_idx` 取 `0`–`9`），也可以自定义。

| 预设 | 结构 | gop_size | 说明 |
| --- | --- | --- | --- |
| 0 | Custom GOP | — | 自定义，需配合 `custom_gop_param` 使用 |
| 1 | I-I-I-I… | 1 | 全 I 帧，无帧间参考，码率最高 |
| 2 | I-P-P-P… | 1 | 连续 P 帧（**默认值**） |
| 3 | I-B-B-B… | 1 | 连续 B 帧 |
| 4 | I-B-P-B-P… | 2 | B、P 交替 |
| 5 | I-B-B-B-P… | 4 | 三个 B 帧后接一个 P 帧 |
| 6 | I-P-P-P-P… | 4 | 连续 P 帧，gop_size 为 4 |
| 7 | I-B-B-B-B… | 4 | 连续 B 帧，gop_size 为 4 |
| 8 | I-B-B-B-B-B-B-B-B… | 8 | 随机接入结构 |
| 9 | I-P-P-P… | 1 | 连续 P 帧，单参考帧 |

> **默认 GOP 预设是 2**（`gop_preset_idx`）。

**自定义 GOP**（`gop_preset_idx = 0`）时，结构由 `mc_video_custom_gop_params_t` 描述：逐个图像指定类型（I / P / B）、显示顺序（POC）、QP 偏移、参考帧等，最多 3 张结构表。结构表的顺序必须按**解码顺序**排列。

> 自定义结构中的参考帧如果指向 IDR 帧之前的图像，编码器内部会自动处理，不需要调用方关心。


普通 P 帧参考前一帧，误差会逐帧累积。**长期参考帧**模式指定某个已编码帧长期留在参考帧列表里，让后续帧可以随时参考它，抑制累积误差。由 `mc_video_longterm_ref_mode_t` 配置：

| 成员 | 说明 |
| `use_longterm` | 是否使能长期参考帧模式，`0` 关闭 / `1` 开启（默认 `0`） |
| `longterm_pic_period` | 每隔多少帧指定一个长期参考帧 |
| `longterm_pic_using_period` | 长期参考帧被持续使用多少帧 |

运行时可通过 `hb_mm_mc_set_longterm_ref_mode` **动态调整**，不需要重启编码器。

##### mc_video_gop_params_t

GOP 结构参数。除 `custom_gop_pic_param` 外**在同一段码流内不可更改**。仅 H.264 / H.265 有效。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `decoding_refresh_type` | `hb_s32` | 默认 `IDR` | 每 `intra_period` 插入的 I 帧类型：`0` 普通 I 帧（非随机接入点）、`1` CRA、`2` IDR。仅 H.265 有效 |
| `gop_preset_idx` | `hb_u32` | 默认 `2` | GOP 预设结构编号，取值 `[0,9]`，含义见 [GOP](#gop-与参考帧)。该默认值两个平台一致 |
| `custom_gop_size` | `hb_s32` | — | 自定义 GOP 的长度，取值 `[1,8]`。仅 `gop_preset_idx = 0` 时有效 |
| `custom_gop_pic_param[MC_MAX_GOP_NUM]` | `mc_video_custom_gop_pic_params_t[]` | — | 自定义 GOP 中逐帧的参数，见 [mc_video_custom_gop_pic_params_t](#mc_video_custom_gop_pic_params_t) |

##### mc_video_custom_gop_pic_params_t

自定义 GOP 中单帧的参数。仅 `gop_preset_idx = 0` 时有效。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `pic_type` | `hb_u32` | 默认 `0` | 帧类型：`0` I 帧、`1` P 帧、`2` B 帧 |
| `poc_offset` | `hb_s32` | 默认 `0` | 该帧在 GOP 内的显示顺序（POC），取值 `[1, custom_gop_size]` |
| `pic_qp` | `hb_u32` | 默认 `30` | 该帧的量化参数，取值 `[0,51]` |
| `num_ref_picL0` | `hb_s32` | 默认 `0` | L0 参考帧的数量，取值 `[0,1]`。仅 `pic_type = 1`（P 帧）时有效 |
| `ref_pocL0` | `hb_s32` | 默认 `0` | L0 参考帧的 POC，取值 `[-custom_gop_size, custom_gop_size]` |
| `ref_pocL1` | `hb_s32` | 默认 `0` | L1 参考帧的 POC，取值 `[-custom_gop_size, custom_gop_size]` |
| `temporal_id` | `hb_u32` | 默认 `0` | 时域层编号，取值 `[0,6]`。低层帧不能参考高层帧 |

##### mc_video_longterm_ref_mode_t

长期参考帧参数。用于指定某个已编码帧长期留在参考帧列表中，抑制帧间预测的累积误差。**支持运行中动态调整**。仅 H.264 / H.265 codec 有效。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `use_longterm` | `hb_u32` | 默认 `0` | 是否使能长期参考帧模式，`0` 关闭 / `1` 开启 |
| `longterm_pic_period` | `hb_u32` | 默认 `0` | 每隔多少帧指定一个长期参考帧 |
| `longterm_pic_using_period` | `hb_u32` | 默认 `0` | 长期参考帧被持续使用多少帧 |


<details>
<summary>展开：各预置 GOP 的结构图</summary>

![GOP Preset 1：全 I 帧](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop-preset-1.png)

![GOP Preset 2：I-P-P-P 连续 P 帧（默认）](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop-preset-2.png)

![GOP Preset 3：I-B-B-B 连续 B 帧](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop-preset-3.png)

![GOP Preset 4：I-B-P-B-P 交替](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop-preset-4.png)

![GOP Preset 5：I-B-B-B-P](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop-preset-5.png)

![GOP Preset 6：I-P-P-P-P（gop_size=4）](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop-preset-6.png)

![GOP Preset 7：I-B-B-B-B（gop_size=4）](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop-preset-7.png)

![GOP Preset 8：随机接入结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop-preset-8.png)

![GOP Preset 9：I-P-P-P 单参考帧](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop-preset-9.png)

</details>

#### Intra Refresh

丢包或误码会让解码端出现时域错误，并沿参考链一路传播到后续帧。**Intra Refresh** 在非 I 帧内部周期性地插入帧内编码的块（H.264 的 MB / H.265 的 CTU），让解码端有更多修复点，从而限制错误的传播范围。

由 `mc_video_intra_refresh_params_t` 配置，可指定插入的行数、列数或步长。也可以只给出总量，让编码器内部自行决定哪些块需要帧内编码。

##### mc_video_intra_refresh_params_t

Intra Refresh 参数。**在同一段码流内不可更改**。仅 H.264 / H.265 有效。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `intra_refresh_mode` | `hb_s32` | 默认 `0` | 刷新方式：`0` 关闭；`1` 按行；`2` 按列；`3` 按步长；`4` 自适应（仅 H.265） |
| `intra_refresh_arg` | `hb_u32` | 默认 `0` | 刷新参数，含义随 `intra_refresh_mode` 变化：模式 1 为连续行数、模式 2 为连续列数、模式 3 为步长、模式 4 为每帧刷新块数 |

> **注意**：`intra_refresh_mode = 4`（自适应）不能与无损编码和 ROI 同时使用。

#### ROI

ROI 编码为图像中不同区域分别指定 QP，实现「重点区域高画质、次要区域省码率」。配置方式与 QpMap 类似：**按光栅扫描顺序**为每个块指定一个 QP 值。

- H.264 的块大小为 **16 × 16** 像素，H.265 为 **32 × 32** 像素
- 每个 QP 值占 1 字节，取值范围 `[0, 51]`

ROI 与码率控制的配合关系：

| 码控模式 | 块的实际 QP |
| 未使能 CBR / AVBR | 就是 ROI 表里指定的值 |
| 使能 CBR / AVBR | `QP(i) = MQP(i) + RQP(i) - ROIAvgQP`，其中 `MQP` 为 ROI 表的值，`RQP` 为码控内部算出的值，`ROIAvgQP` 为 ROI 表的平均 QP |

第二种情况需要先用 `hb_mm_mc_set_roi_avg_qp` 把 `ROIAvgQP` 告知编码器，处理相对关系。

相关接口：`hb_mm_mc_set_roi_config` / `hb_mm_mc_get_roi_config`、`hb_mm_mc_set_roi_avg_qp` / `hb_mm_mc_get_roi_avg_qp`，以及按索引操作的 `hb_mm_mc_set_roi_config_ex` / `hb_mm_mc_get_roi_config_ex`。

##### mc_video_roi_params_t

ROI 的 QpMap 形式参数：为图像中每一个块逐个指定 QP 值。更适合由算法逐块生成 QP 的场景。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `roi_enable` | `hb_u32` | 默认 `0` | 是否使能 ROI 编码，`0` 关闭 / `1` 开启。**需要码率控制处于开启状态** |
| `roi_map_array` | `hb_byte` | 默认 `0` | QP 映射表，按光栅扫描顺序为每个块存放 1 字节 QP 值，取值 `[0,51]` |
| `roi_map_array_count` | `hb_u32` | 默认 `0` | 映射表的元素个数。H.264 应为 `(ALIGN16(宽)>>4) × (ALIGN16(高)>>4)`；H.265 应为 `(ALIGN64(宽)>>5) × (ALIGN64(高)>>5)` |

##### mc_video_roi_params_ex_t

ROI 的区域形式参数：最多支持 64 个矩形区域，每个区域指定重要程度或 QP。适合只关注少数几块重点区域的场景。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `roi_mode` | `hb_u32` | 默认 `0` | ROI 模式：`0` 关闭；`1` CTU 重要程度映射（取值 `[0,8]`，**需要码率控制开启**）；`2` CTU QP 映射（取值 `[0,51]`，**不能与码率控制同时使用**） |
| `roi_idx` | `hb_u32` | 默认 `0` | ROI 区域索引，取值 `[0,63]`。索引 0 的区域优先级最高 |
| `roi_enable` | `hb_u32` | 默认 `0` | 该区域是否使能，`0` 关闭 / `1` 开启 |
| `roi_val` | `hb_u8` | 默认 `0` | 该区域的值。模式 1 下为重要程度 `[0,8]`（越大越重要）；模式 2 下为 QP `[0,51]`（越大画质越差） |
| `roi_delta_qp` | `hb_u32` | 默认 `3` | 模式 1 下的 QP 调整步长，取值 `[0,51]`。区域最终 QP 按 `QP - roi_delta_qp × 重要程度` 计算 |
| `crop_rect` | `mc_av_codec_rect_t` | — | 该区域对应的矩形范围，见 [mc_av_codec_rect_t](#mc_av_codec_rect_t) |

##### mc_av_codec_rect_t

矩形区域，用于描述裁剪范围或 ROI 区域。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `x_pos` | `hb_u32` | 左上角横坐标 |
| `y_pos` | `hb_u32` | 左上角纵坐标 |
| `width` | `hb_u32` | 宽度 |
| `height` | `hb_u32` | 高度 |

#### 帧 Skip

调用 `hb_mm_mc_skip_pic` 可以让**下一次** queue 输入的那一帧走 skip 模式：编码器忽略输入图像内容，直接复用上一帧的重构帧，输出一个 P 帧。

典型用途是上游送帧不及时或者画面确实没有变化时，用极低的代价维持帧率与时间戳连续。

三条约束：

- skip 只对**非 I 帧**有效
- 输入的图像会被忽略，但仍需正常完成 dequeue / queue 流程
- 无论 GOP 结构如何，skip 帧一律编成 **P 帧**


#### MJPEG 与 JPEG

##### mc_mjpeg_enc_params_t

MJPEG 编码参数。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `luma_quant_table[64]` | `hb_u8` | 亮度量化表，64 个元素，按 Z 字形顺序排列 |
| `chroma_quant_table[64]` | `hb_u8` | 色度量化表，64 个元素 |
| `luma_quant_es_table[64]` | `hb_u16` | 亮度量化表的扩展表（16bit），用于更高精度场景 |
| `chroma_quant_es_table[64]` | `hb_u16` | 色度量化表的扩展表（16bit） |
| `restart_interval` | `hb_u32` | 重启间隔，每多少个 MCU 插入一个重启标记 |

##### mc_jpeg_enc_params_t

JPEG 编码参数。量化表可由 `hb_mm_mc_set_jpeg_config` 下发自定义值。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `quality_factor` | `hb_u32` | 画质因子，数值越大画质越高、码流越大 |
| `luma_quant_table[64]` | `hb_u8` | 亮度量化表，64 个元素 |
| `chroma_quant_table[64]` | `hb_u8` | 色度量化表，64 个元素 |
| `luma_quant_es_table[64]` | `hb_u16` | 亮度量化表扩展表（16bit） |
| `chroma_quant_es_table[64]` | `hb_u16` | 色度量化表扩展表（16bit） |
| `restart_interval` | `hb_u32` | 重启间隔 |
| `crop_en` | `hb_bool` | 是否使能裁剪 |
| `crop_rect` | `mc_av_codec_rect_t` | 裁剪矩形，见 [mc_av_codec_rect_t](#mc_av_codec_rect_t) |

#### 码流元信息

##### mc_video_slice_params_t

slice 切分参数。按 `codec_id` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_slice` | `mc_h264_slice_params_t` | 联合体成员 |
| `h265_slice` | `mc_h265_slice_params_t` | 联合体成员 |
| `mjpeg_slice` | `mc_mjpeg_slice_params_t` | 联合体成员 |

##### mc_video_vui_params_t

VUI 参数。按 `codec_id` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_vui` | `mc_h264_vui_params_t` | 联合体成员 |
| `h265_vui` | `mc_h265_vui_params_t` | 联合体成员 |

##### mc_video_vui_timing_params_t

VUI 时序参数。按 `codec_id` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_timing` | `mc_h264_timing_params_t` | 联合体成员 |
| `h265_timing` | `mc_h265_timing_params_t` | 联合体成员 |

##### mc_user_data_buffer_t

用户数据 buffer，用于 `hb_mm_mc_get_user_data` 取出码流中携带的用户数据。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `user_data_valid` | `hb_bool` | 默认 `0` | 该 buffer 是否有效，`0` 无效 / `1` 有效 |
| `size` | `hb_u32` | 默认 `0` | 数据长度，单位字节 |
| `phys_addr` | `hb_u64` | 默认 `0` | 数据的物理地址，读取时需转换为虚拟地址 |
| `virt_addr` | `hb_u8` | 默认 `0` |  |

#### 编码前处理

##### mc_rotate_degree_t

| 取值 | 说明 |
| `MC_CCW_0` | 不旋转 |
| `MC_CCW_90` / `MC_CCW_180` / `MC_CCW_270` | 逆时针旋转 90° / 180° / 270° |

仅编码支持旋转，解码不支持。

##### mc_mirror_direction_t

| 取值 | 说明 |
| `MC_DIRECTION_NONE` | 不镜像 |
| `MC_VERTICAL` | 垂直镜像 |
| `MC_HORIZONTAL` | 水平镜像 |
| `MC_HOR_VER` | 水平 + 垂直镜像（等价于旋转 180°） |

仅编码支持镜像，解码不支持。

#### 解码器参数

##### mc_video_codec_dec_params_t

视频解码参数。所有字段**在同一段码流内不可更改**。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `feed_mode` | `mc_av_stream_feeding_mode_t` | 默认 `MC_FEEDING_MODE_NONE` | 码流送入方式，取值见 [mc_av_stream_feeding_mode_t](#mc_av_stream_feeding_mode_t) |
| `pix_fmt` | `mc_pixel_format_t` | 默认 `MC_PIXEL_FORMAT_YUV420P` | 输出像素格式。H.264/H.265 取 NV12 / NV21 / YUV420P；MJPEG/JPEG 取 `MC_PIXEL_FORMAT_NONE` 或 YUV440P（YUV440P 仅用于 YUV422 旋转 90°/270°） |
| `bitstream_buf_size` | `hb_u32` | 默认 `10*1024*1024` | 输入码流 buffer 的大小，单位字节，取值 `[1024, 2^31-1]`。**必须大于单次送入的数据量**，通常按 1024 对齐 |
| `bitstream_buf_count` | `hb_u32` | 默认 `5` | 输入码流 buffer 的数量，取值 `[1,65536]` |
| `external_bitstream_buf` | `hb_bool` | 默认 `0` | `1` 表示使用外部码流 buffer，`0` 表示由 MediaCodec 内部通过 hbmem 分配 |
| `frame_buf_count` | `hb_u32` | 默认 `5` | 输出帧 buffer 的数量，取值 `[1,31]`。H.264/H.265 因存在显示重排序，实际使用数量可能被内部上调；MJPEG/JPEG 至少为 2 |
| `h264_dec_config` | `mc_h264_dec_config_t` | — | H.264 专有解码配置，联合体成员，按 `codec_id` 选择 |
| `h265_dec_config` | `mc_h265_dec_config_t` | — | H.265 专有解码配置，联合体成员 |
| `mjpeg_dec_config` | `mc_mjpeg_dec_config_t` | — | MJPEG 专有解码配置，联合体成员 |
| `jpeg_dec_config` | `mc_jpeg_dec_config_t` | — | JPEG 专有解码配置，联合体成员 |

##### mc_av_stream_feeding_mode_t

解码时码流的送入方式。

| 取值 | 说明 |
| `MC_FEEDING_MODE_NONE` | 未指定 |
| `MC_FEEDING_MODE_STREAM_SIZE` | 按字节流长度送入。每次 queue 一个连续码流片段 |
| `MC_FEEDING_MODE_FRAME_SIZE` | 按帧送入。每次 queue 一整帧码流，便于按帧统计 |
| `MC_FEEDING_MODE_TOTAL` | 模式总数，非有效取值 |

#### 编码器参数

##### mc_video_codec_enc_params_t

视频编码参数。除 `rc_params` 外，其余字段**在同一段码流内不可更改**。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `width` | `hb_s32` | 默认 `0` | 输入图像的宽度（亮度像素数） |
| `height` | `hb_s32` | 默认 `0` | 输入图像的高度（亮度像素数） |
| `pix_fmt` | `mc_pixel_format_t` | 默认 `0` | 输入像素格式。H.264/H.265 支持 4:2:0 与 4:2:2 两组格式（枚举 0–9）；MJPEG/JPEG 额外支持 4:0:0 与 4:4:4 系列。取值见 [mc_pixel_format_t](#mc_pixel_format_t) |
| `frame_buf_count` | `hb_u32` | 默认 `5` | 输入帧 buffer 的数量。H.264/H.265 取值 `[1,31]`；MJPEG/JPEG 取值 `[1,65536]` |
| `external_frame_buf` | `hb_bool` | 默认 `0` | `1` 表示使用外部输入 buffer（画面来自其他模块、需自行填充地址），`0` 表示使用内部 buffer |
| `bitstream_buf_count` | `hb_u32` | 默认 `5` | 码流 buffer 的数量，取值 `[1,65536]` |
| `bitstream_buf_size` | `hb_u32` | 默认 `10*1024*1024` | 码流 buffer 的大小，单位字节。H.264/H.265 取值 `[64K, 2^31-1]`、按 1024 对齐；MJPEG/JPEG 取值 `[8K, 2^31-1]`、按 4096 对齐。**填 `0` 表示由 codec 自行计算** |
| `rc_params` | `mc_rate_control_params_t` | — | 码率控制参数，见 [码率控制](#码率控制)。**唯一支持运行中动态调整的字段** |
| `gop_params` | `mc_video_gop_params_t` | — | GOP 参数，见 [mc_video_gop_params_t](#mc_video_gop_params_t)。仅 H.264 / H.265 有效 |
| `rot_degree` | `mc_rotate_degree_t` | 默认 `MC_CCW_0` | 编码前对输入图像做逆时针旋转，取值见 [mc_rotate_degree_t](#mc_rotate_degree_t)。**解码不支持旋转** |
| `mir_direction` | `mc_mirror_direction_t` | 默认 `MC_DIRECTION_NONE` | 编码前对输入图像做镜像，取值见 [mc_mirror_direction_t](#mc_mirror_direction_t)。**解码不支持镜像** |
| `frame_cropping_flag` | `hb_u32` | — | 是否使能裁剪，非 0 表示使能 |
| `crop_rect` | `mc_av_codec_rect_t` | — | 裁剪矩形，见 [mc_av_codec_rect_t](#mc_av_codec_rect_t) |
| `enable_user_pts` | `hb_bool` | 默认 `FALSE` | `1` 表示使用输入 buffer 携带的 pts 作为码流 pts。仅 H.264 / H.265 有效 |
| `h264_enc_config` | `mc_h264_enc_config_t` | — | H.264 专有编码配置，联合体成员，按 `codec_id` 选择 |
| `h265_enc_config` | `mc_h265_enc_config_t` | — | H.265 专有编码配置，联合体成员 |
| `mjpeg_enc_config` | `mc_mjpeg_enc_config_t` | — | MJPEG 专有编码配置，联合体成员 |
| `jpeg_enc_config` | `mc_jpeg_enc_config_t` | — | JPEG 专有编码配置，联合体成员 |

##### mc_pixel_format_t

| 取值 | 说明 |
| `MC_PIXEL_FORMAT_NONE` | 未指定 |
| `MC_PIXEL_FORMAT_YUV420P` | YUV420 平面格式 |
| `MC_PIXEL_FORMAT_NV12` | YUV420 半平面，Y 平面 + UV 交错平面（**最常用**） |
| `MC_PIXEL_FORMAT_NV21` | YUV420 半平面，Y 平面 + VU 交错平面 |
| `MC_PIXEL_FORMAT_YUV422P` / `MC_PIXEL_FORMAT_NV16` / `MC_PIXEL_FORMAT_NV61` | YUV422 平面与半平面格式 |
| `MC_PIXEL_FORMAT_YUYV422` / `MC_PIXEL_FORMAT_YVYU422` / `MC_PIXEL_FORMAT_UYVY422` / `MC_PIXEL_FORMAT_VYUY422` | YUV422 打包格式，主要为 JPEG / MJPEG 使用 |
| `MC_PIXEL_FORMAT_YUV444` / `MC_PIXEL_FORMAT_YUV444P` / `MC_PIXEL_FORMAT_NV24` / `MC_PIXEL_FORMAT_NV42` | YUV444 格式 |
| `MC_PIXEL_FORMAT_YUV440P` | YUV440 格式，JPEG 解码旋转 90°/270° 时使用 |
| `MC_PIXEL_FORMAT_YUV400` | 灰度格式，仅 JPEG / MJPEG |
| `MC_PIXEL_FORMAT_NV12_Y10C8` / `_LSB` 系列 | 10bit 亮度格式，本产品线编解码器不支持 |


##### mc_h264_profile_t / mc_h264_level_t / mc_h265_level_t

`profile` 与 `level` 决定编码器输出的码流符合哪一档标准，影响解码端的兼容范围。常用取值：

| 类型 | 取值 |
| `mc_h264_profile_t` | `MC_H264_PROFILE_BP`（Baseline）、`MC_H264_PROFILE_MP`（Main）、`MC_H264_PROFILE_HP`（High）等 |
| `mc_h264_level_t` | `MC_H264_LEVEL1`(10) … `MC_H264_LEVEL5_2`(52)，数值为 level × 10 |
| `mc_h265_level_t` | `MC_H265_LEVEL1`(30) … `MC_H265_LEVEL5_1`(153)，数值为 level × 30 |

板端 `sample_codec` 的 `codec_config.ini` 中通过 `profile` 字段以字符串形式指定，例如 `h264_main@L4`、`h265_main@L4%high_tier`。


每个类型的完整定义见板端 `/usr/hobot/include/hb_media_codec.h`。标注「联合体成员」的字段，实际生效的那个由 `codec_id`（以及 `encoder`）决定。


#### 编码工具开关

编码器内置的若干画质 / 性能开关，均可运行中调整。

##### mc_video_deblk_filter_params_t

去块滤波参数。按 `codec_id` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_deblk` | `mc_h264_deblk_filter_params_t` | 联合体成员 |
| `h265_deblk` | `mc_h265_deblk_filter_params_t` | 联合体成员 |


##### mc_h265_sao_params_t

H.265 的 SAO（样点自适应补偿）参数。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `sample_adaptive_offset_enabled_flag` | `hb_u32` | 默认 `1` | 是否使能 SAO，`0` 关闭 / `1` 开启。同时作用于亮度与色度分量 |


##### mc_h264_entropy_params_t

H.264 的熵编码参数。支持运行中动态调整。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `entropy_coding_mode` | `hb_u32` | 默认 `1` | 熵编码方式：`0` CAVLC；`1` CABAC（压缩率更高、计算量更大） |


##### mc_video_pred_unit_params_t

帧内预测参数。按 `codec_id` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_intra_pred` | `mc_h264_intra_pred_params_t` | 联合体成员 |
| `h265_pred_unit` | `mc_h265_pred_unit_params_t` | 联合体成员 |


##### mc_video_transform_params_t

变换参数。按 `codec_id` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_transform` | `mc_h264_transform_params_t` | 联合体成员 |
| `h265_transform` | `mc_h265_transform_params_t` | 联合体成员 |


##### mc_video_mode_decision_params_t

编码模式决策参数，用于在编码速度与压缩效率之间取舍。各字段均可运行中动态调整。仅 H.265 codec 有效。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `mode_decision_enable` | `hb_u32` | 默认 `0` | 是否使能模式决策，`0` 关闭 / `1` 开启 |
| `pu04_delta_rate` | `hb_s32` | 默认 `0` | 4×4 块的总代价附加量，取值 `[0,255]` |
| `pu08_delta_rate` | `hb_s32` | 默认 `0` | 8×8 块的总代价附加量，取值 `[0,255]` |
| `pu16_delta_rate` | `hb_s32` | 默认 `0` | 16×16 块的总代价附加量，取值 `[0,255]` |
| `pu32_delta_rate` | `hb_s32` | 默认 `0` | 32×32 块的总代价附加量，取值 `[0,255]` |
| `pu04_intra_planar_delta_rate` | `hb_s32` | 默认 `0` | 4×4 块在 Planar 帧内预测模式下计算代价（失真 + 码率）时的码率附加量，取值 `[0,255]` |
| `pu04_intra_dc_delta_rate` | `hb_s32` | 默认 `0` | 4×4 块在 DC 帧内预测模式下计算代价（失真 + 码率）时的码率附加量，取值 `[0,255]` |
| `pu04_intra_angle_delta_rate` | `hb_s32` | 默认 `0` | 4×4 块在 角度 帧内预测模式下计算代价（失真 + 码率）时的码率附加量，取值 `[0,255]` |
| `pu08_intra_planar_delta_rate` | `hb_s32` | 默认 `0` | 8×8 块在 Planar 帧内预测模式下计算代价（失真 + 码率）时的码率附加量，取值 `[0,255]` |
| `pu08_intra_dc_delta_rate` | `hb_s32` | 默认 `0` | 8×8 块在 DC 帧内预测模式下计算代价（失真 + 码率）时的码率附加量，取值 `[0,255]` |
| `pu08_intra_angle_delta_rate` | `hb_s32` | 默认 `0` | 8×8 块在 角度 帧内预测模式下计算代价（失真 + 码率）时的码率附加量，取值 `[0,255]` |
| `pu16_intra_planar_delta_rate` | `hb_s32` | 默认 `0` | 16×16 块在 Planar 帧内预测模式下计算代价（失真 + 码率）时的码率附加量，取值 `[0,255]` |
| `pu16_intra_dc_delta_rate` | `hb_s32` | 默认 `0` | 16×16 块在 DC 帧内预测模式下计算代价（失真 + 码率）时的码率附加量，取值 `[0,255]` |
| `pu16_intra_angle_delta_rate` | `hb_s32` | 默认 `0` | 16×16 块在 角度 帧内预测模式下计算代价（失真 + 码率）时的码率附加量，取值 `[0,255]` |
| `pu32_intra_planar_delta_rate` | `hb_s32` | 默认 `0` | 32×32 块在 Planar 帧内预测模式下计算代价（失真 + 码率）时的码率附加量，取值 `[0,255]` |
| `pu32_intra_dc_delta_rate` | `hb_s32` | 默认 `0` | 32×32 块在 DC 帧内预测模式下计算代价（失真 + 码率）时的码率附加量，取值 `[0,255]` |
| `pu32_intra_angle_delta_rate` | `hb_s32` | 默认 `0` | 32×32 块在 角度 帧内预测模式下计算代价（失真 + 码率）时的码率附加量，取值 `[0,255]` |
| `cu08_intra_delta_rate` | `hb_s32` | 默认 `0` | 8×8 CU 在 帧内模式下计算代价时的码率附加量，取值 `[0,255]` |
| `cu08_inter_delta_rate` | `hb_s32` | 默认 `0` | 8×8 CU 在 帧间模式下计算代价时的码率附加量，取值 `[0,255]` |
| `cu08_merge_delta_rate` | `hb_s32` | 默认 `0` | 8×8 CU 在 merge模式下计算代价时的码率附加量，取值 `[0,255]` |
| `cu16_intra_delta_rate` | `hb_s32` | 默认 `0` | 16×16 CU 在 帧内模式下计算代价时的码率附加量，取值 `[0,255]` |
| `cu16_inter_delta_rate` | `hb_s32` | 默认 `0` | 16×16 CU 在 帧间模式下计算代价时的码率附加量，取值 `[0,255]` |
| `cu16_merge_delta_rate` | `hb_s32` | 默认 `0` | 16×16 CU 在 merge模式下计算代价时的码率附加量，取值 `[0,255]` |
| `cu32_intra_delta_rate` | `hb_s32` | 默认 `0` | 32×32 CU 在 帧内模式下计算代价时的码率附加量，取值 `[0,255]` |
| `cu32_inter_delta_rate` | `hb_s32` | 默认 `0` | 32×32 CU 在 帧间模式下计算代价时的码率附加量，取值 `[0,255]` |
| `cu32_merge_delta_rate` | `hb_s32` | 默认 `0` | 32×32 CU 在 merge模式下计算代价时的码率附加量，取值 `[0,255]` |


##### mc_video_smart_bg_enc_params_t

智能背景编码参数。针对监控等背景长期不变的场景，降低静止区域的码率开销。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `bg_detect_enable` | `hb_u32` | 默认 `0` | 是否使能背景检测，`0` 关闭 / `1` 开启 |
| `bg_threshold_diff` | `hb_s32` | 默认 `8` | 块内最大差异阈值，取值 `[0,255]`。仅背景检测开启时有效 |
| `bg_threshold_mean_diff` | `hb_s32` | 默认 `1` | 块内平均差异阈值，取值 `[0,255]`。仅背景检测开启时有效 |
| `bg_lambda_qp` | `hb_s32` | 默认 `32` | 背景区域的最小 QP，取值 `[0,51]` |
| `bg_delta_qp` | `hb_s32` | 默认 `3` | 背景与前景的 QP 差值，取值 `[-16,15]` |
| `s2fme_disable` | `hb_u32` | 默认 `0` | 是否关闭 s2me_fme 流程，`0` 使能 / `1` 关闭。仅作用于 H.264 编码器 |


##### mc_video_3dnr_enc_params_t

3D 降噪参数。通过时域信息抑制噪声，改善暗光场景的编码画质。各字段均**支持运行中动态调整**。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `nr_y_enable` | `hb_u32` | 默认 `0` | 是否对 Y 分量降噪，`0` 关闭 / `1` 开启 |
| `nr_cb_enable` | `hb_u32` | 默认 `0` | 是否对 Cb 分量降噪 |
| `nr_cr_enable` | `hb_u32` | 默认 `0` | 是否对 Cr 分量降噪 |
| `nr_est_enable` | `hb_u32` | 默认 `0` | 是否使能噪声估计。关闭时由调用方通过 `nr_noise_sigma*` 手动指定噪声水平 |
| `nr_intra_weightY` | `hb_u32` | 默认 `7` | I 帧下 Y 分量的噪声权重，取值 `[0,31]`。实际作用强度为该值除以 4 |
| `nr_intra_weightCb` | `hb_u32` | 默认 `7` | I 帧下 Cb 分量的噪声权重，取值 `[0,31]` |
| `nr_intra_weightCr` | `hb_u32` | 默认 `7` | I 帧下 Cr 分量的噪声权重，取值 `[0,31]` |
| `nr_inter_weightY` | `hb_u32` | 默认 `4` | P/B 帧下 Y 分量的噪声权重，取值 `[0,31]`。实际作用强度为该值除以 4 |
| `nr_inter_weightCb` | `hb_u32` | 默认 `4` | P/B 帧下 Cb 分量的噪声权重，取值 `[0,31]` |
| `nr_inter_weightCr` | `hb_u32` | 默认 `4` | P/B 帧下 Cr 分量的噪声权重，取值 `[0,31]` |
| `nr_noise_sigmaY` | `hb_u32` | 默认 `0` | Y 分量的噪声标准差，取值 `[0,255]`。仅 `nr_est_enable = 0` 时有效 |
| `nr_noise_sigmaCb` | `hb_u32` | 默认 `0` | Cb 分量的噪声标准差，取值 `[0,255]`。仅 `nr_est_enable = 0` 时有效 |
| `nr_noise_sigmaCr` | `hb_u32` | 默认 `0` | Cr 分量的噪声标准差，取值 `[0,255]`。仅 `nr_est_enable = 0` 时有效 |

### API 调用流程
MediaCodec 由状态机驱动，接口调用的合法性取决于当前状态。状态取值见 [media_codec_state_t](#media_codec_state_t)。

### 状态迁移

![MediaCodec 状态迁移](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/fig1-state-machine.svg)

<details>
<summary>展开：状态迁移表与两条易踩规则</summary>

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

两条容易踩的规则：

- **从 `PAUSED` 恢复运行，用的是 `hb_mm_mc_start`**，不是别的接口
- **`hb_mm_mc_stop` 之后不能直接 `hb_mm_mc_start`** —— `stop` 会把状态复位到 `INITIALIZED`，而 `start` 要求 `CONFIGURED`。此时直接调用 `start` 会返回 `HB_MEDIA_ERR_OPERATION_NOT_ALLOWED`。要重新启动，必须再走一次 `hb_mm_mc_configure`

</details>

### 调用序列

典型的编码流程（解码流程方向相反，接口序列一致）：

![API 典型调用时序（同步 / 异步）](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/fig4-api-sequence.svg)

<details>
<summary>展开：完整调用序列</summary>

1. `hb_mm_mc_get_descriptor(codec_id)` 查该 codec 是否可用。
2. `hb_mm_mc_get_default_context(codec_id, 1, &context)` 取默认 context（`1` = 编码器），再按业务改字段。
3. `hb_mm_mc_initialize(&context)` 初始化。
4. `hb_mm_mc_vpf_init(&context, ch)`（可选）关联 VPF 通道 —— **必须夹在 initialize 与 configure 之间**，顺序颠倒会返回 `HB_MEDIA_ERR_OPERATION_NOT_ALLOWED`。
5. `hb_mm_mc_set_*_config(...)`（可选）配置码控、GOP、ROI、编码工具等，需在 `configure` 之前完成。
6. `hb_mm_mc_configure(&context)` 参数下发。
7. `hb_mm_mc_set_callback(...)` / `hb_mm_mc_set_vlc_buffer_listener(...)`（可选）切异步模式 —— **必须在 `start` 之前**。
8. `hb_mm_mc_start(&context, &startup_params)` 启动。
9. 每帧：`hb_mm_mc_dequeue_input_buffer` 取空 buffer → 填入 YUV → `hb_mm_mc_queue_input_buffer` 交还 → `hb_mm_mc_dequeue_output_buffer` 取码流 → 消费 → `hb_mm_mc_queue_output_buffer` 归还。
10. 运行中可调：`hb_mm_mc_set_rate_control_config`、`hb_mm_mc_request_idr_frame`、`hb_mm_mc_set_roi_config`、`hb_mm_mc_pause`、`hb_mm_mc_flush`。
11. 收尾：`hb_mm_mc_stop(&context)` + `hb_mm_mc_release(&context)`。

</details>

### 同步与异步

默认是**同步模式**：调用方在一个循环里主动 dequeue / queue，用超时参数控制等待。

调用 `hb_mm_mc_set_callback` 后进入**异步模式**：编码器/解码器在输入 buffer 可用、输出 buffer 可用时回调通知，调用方在回调里处理。异步模式适合上游数据由外部事件驱动的场景。

两种模式的选择是**二选一**，`hb_mm_mc_set_callback` 必须在 `hb_mm_mc_start` 之前调用。

### 快速示例
板端示例程序 `sample_codec` 是一份可直接运行的 MediaCodec 参考实现，源码在 `/app/multimedia_samples/sample_codec/`，同时提供了 H.264 / H.265 / JPEG 的编解码示例。

### 运行示例

```bash
cd /app/multimedia_samples/sample_codec
./sample_codec              # 按 codec_config.ini 的默认配置运行
```

S100 镜像已预编译 `sample_codec` 可直接运行；S600 镜像带源码，先在目录内 `make` 编译再运行。

默认配置 `encode_streams = 0x1`，只跑第一路 1920×1080 H.264 编码，编码 100 帧后自动退出：

```
Config file: codec_config.ini
encode_streams: 0x1
decode_streams: 0x0
Encoding video...
Encode params...
 codec_type: 0, width: 1920, height: 1080, frame_rate: 30, bit_rate: 8192,
 input_file: 1920x1080_NV12.yuv, output_file: 1920x1080_30fps.h264,
 frame_num: 100, profile: h264_main@L4, performance_test:0
encode_video...
Encode idx: 0, init successful
Encode idx: 0, start successful
Encode idx: 0, frame= 1
Encode idx: 0, frame= 2
... ...
Encode idx: 0, frame= 100
```

编码结果写在当前目录下的 `1920x1080_30fps.h264`。

常用命令：

| 命令 | 说明 |
| `./sample_codec` | 使用 `codec_config.ini` 的默认配置 |
| `./sample_codec -e 0x3` | 只跑 `venc_stream1` 与 `venc_stream2` 两路编码 |
| `./sample_codec -e 0 -d 0x1` | 关闭编码，只跑 `vdec_stream1` 解码 |
| `./sample_codec -f my.ini` | 指定配置文件 |
| `./sample_codec -v` | 输出详细日志 |

`-e` / `-d` 的参数是**按位掩码**：`0x1` 对应 `venc_stream1`、`0x2` 对应 `venc_stream2`、`0x4` 对应 `venc_stream3`，依此类推，多路用按位或组合。

### 配置文件

`codec_config.ini` 由四类段组成：

```ini
[encode]
; 启用哪些编码流，按位掩码
encode_streams = 0x1

[venc_stream1]
codec_type = 0          ; 0:H264  1:H265  2:MJPEG  3:JPEG
width = 1920
height = 1080
frame_rate = 30
bit_rate = 8192         ; 单位 kbps
input = 1920x1080_NV12.yuv
output = 1920x1080_30fps.h264
frame_num = 100
profile = h264_main@L4

[decode]
decode_streams = 0x0    ; 0x0 表示不启用解码

[vdec_stream1]
codec_type = 0
width = 1920
height = 1080
input = 1920x1080_30fps.h264
output = 1920x1080_NV12.yuv
```

- `input` 只支持 NV12 格式的 YUV 文件，文件中可连续存放多帧；帧数不足 `frame_num` 时会循环读取
- `performance_test = 1` 可使能性能测试流程：预先从文件读入若干帧存到外部 buffer，排除读盘影响
- 各字段的完整含义见 [sample_codec 使用说明](/Advanced_development/multimedia_development/multimedia_sample/sample_codec)

### 最小编码示例

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

### 最小解码示例

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

### 约束与注意事项
#### 状态与调用顺序

| 约束 | 说明 |
| `hb_mm_mc_vpf_init` 的位置 | 必须在 `hb_mm_mc_initialize` 之后、`hb_mm_mc_configure` 之前。顺序错误返回 `HB_MEDIA_ERR_OPERATION_NOT_ALLOWED` |
| `hb_mm_mc_set_callback` 的位置 | 必须在 `hb_mm_mc_start` 之前 |
| `hb_mm_mc_set_vlc_buffer_listener` 的位置 | 必须在 `hb_mm_mc_start` 之前 |
| buffer 操作的状态 | `dequeue` / `queue` 四个接口只在 `MEDIA_CODEC_STATE_STARTED` 状态下有效 |
| `codec_id` 与 `encoder` | 在 `hb_mm_mc_initialize` 之后不可更改 |
| 各 `set_*_config` | 启动前调用需在 `hb_mm_mc_configure` 之前；标注「支持动态调整」的可在运行中调用 |

#### codec 适用性

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

#### 参数填写

- **分辨率对齐**：宽必须是 32 的倍数、高必须是 8 的倍数。不满足时可用 VPU 的裁剪功能先裁再编
- **`bitstream_buf_size` 与单帧码流大小**：buffer 必须大于单帧最大码流。填 `0` 由 codec 自行计算
- **ROI 与码率控制的组合**：QpMap 形式（`mc_video_roi_params_t`）需要码率控制开启；区域形式（`mc_video_roi_params_ex_t`）的模式 1 需要码率控制、模式 2 不能与码率控制并用
- **Intra Refresh 自适应模式**（`intra_refresh_mode = 4`）不能与无损编码和 ROI 同时使用
- **`external_frame_buf = 1` 时**：外部 buffer 的地址仍需通过 dequeue / queue 流程填入，直接改 buffer 地址即可


## API 参考

### API 列表
MediaCodec 共 74 个接口。多数配置类是**成对**出现的 `get_*` / `set_*`：`set_*` 下发参数，`get_*` 读回当前值。

> 头文件中另有少数接口标注为**内部接口**（如 `hb_mm_mc_set_status`，原文写明 "It's an internal API. Don't use this API."），不要在业务代码中调用，下表也未收录。

| 接口 | 功能 |
| [`hb_mm_mc_get_descriptor`](#hb_mm_mc_get_descriptor) | 查询 codec 描述信息，判断 codec 是否可用 |
| [`hb_mm_mc_get_default_context`](#hb_mm_mc_get_default_context) | 取得默认 context |
| [`hb_mm_mc_initialize`](#hb_mm_mc_initialize) | 初始化 codec 与 context |
| [`hb_mm_mc_configure`](#hb_mm_mc_configure) | 下发参数，配置生效 |
| [`hb_mm_mc_start`](#hb_mm_mc_start) | 启动编解码 |
| [`hb_mm_mc_stop`](#hb_mm_mc_stop) | 停止并复位 |
| [`hb_mm_mc_pause`](#hb_mm_mc_pause) | 暂停 |
| [`hb_mm_mc_flush`](#hb_mm_mc_flush) | 清空输入输出 buffer 队列 |
| [`hb_mm_mc_release`](#hb_mm_mc_release) | 释放 codec |
| [`hb_mm_mc_get_state`](#hb_mm_mc_get_state) | 查询当前状态 |
| [`hb_mm_mc_get_status`](#hb_mm_mc_get_status) | 查询详细运行状态 |
| [`hb_mm_mc_set_callback`](#hb_mm_mc_set_callback) | 设置回调，切换到异步模式 |
| [`hb_mm_mc_set_vlc_buffer_listener`](#hb_mm_mc_set_vlc_buffer_listener) | 设置码流 buffer 大小监听回调 |
| [`hb_mm_mc_set_camera`](#hb_mm_mc_set_camera) | 指定关联的相机通道信息 |
| [`hb_mm_mc_vpf_init`](#hb_mm_mc_vpf_init) | 与 VPF 通道关联 |
| [`hb_mm_mc_get_fd`](#hb_mm_mc_get_fd) | 取得设备 fd |
| [`hb_mm_mc_close_fd`](#hb_mm_mc_close_fd) | 关闭设备 fd |
| [`hb_mm_mc_dequeue_input_buffer`](#hb_mm_mc_dequeue_input_buffer) | 取一个空闲输入 buffer |
| [`hb_mm_mc_queue_input_buffer`](#hb_mm_mc_queue_input_buffer) | 交还输入 buffer |
| [`hb_mm_mc_dequeue_output_buffer`](#hb_mm_mc_dequeue_output_buffer) | 取出一个装有结果的输出 buffer |
| [`hb_mm_mc_queue_output_buffer`](#hb_mm_mc_queue_output_buffer) | 交还输出 buffer |
| [`hb_mm_mc_get_rate_control_config`](#hb_mm_mc_get_rate_control_config) | 读取码率控制参数 |
| [`hb_mm_mc_set_rate_control_config`](#hb_mm_mc_set_rate_control_config) | 设置码率控制参数 |
| [`hb_mm_mc_get_max_bit_rate_config`](#hb_mm_mc_get_max_bit_rate_config) | 读取最大码率 |
| [`hb_mm_mc_set_max_bit_rate_config`](#hb_mm_mc_set_max_bit_rate_config) | 设置最大码率 |
| [`hb_mm_mc_get_longterm_ref_mode`](#hb_mm_mc_get_longterm_ref_mode) | 读取长期参考帧配置 |
| [`hb_mm_mc_set_longterm_ref_mode`](#hb_mm_mc_set_longterm_ref_mode) | 设置长期参考帧模式 |
| [`hb_mm_mc_get_intra_refresh_config`](#hb_mm_mc_get_intra_refresh_config) | 读取 Intra Refresh 配置 |
| [`hb_mm_mc_set_intra_refresh_config`](#hb_mm_mc_set_intra_refresh_config) | 设置 Intra Refresh |
| [`hb_mm_mc_request_idr_frame`](#hb_mm_mc_request_idr_frame) | 请求输出 IDR 帧 |
| [`hb_mm_mc_request_idr_header`](#hb_mm_mc_request_idr_header) | 使能 / 关闭 IDR 帧 |
| [`hb_mm_mc_enable_idr_frame`](#hb_mm_mc_enable_idr_frame) | 使能 / 关闭 IDR 帧 |
| [`hb_mm_mc_skip_pic`](#hb_mm_mc_skip_pic) | 跳过当前图像 |
| [`hb_mm_mc_get_deblk_filter_config`](#hb_mm_mc_get_deblk_filter_config) | 读取去块滤波配置 |
| [`hb_mm_mc_set_deblk_filter_config`](#hb_mm_mc_set_deblk_filter_config) | 设置去块滤波 |
| [`hb_mm_mc_get_sao_config`](#hb_mm_mc_get_sao_config) | 读取 SAO 配置 |
| [`hb_mm_mc_set_sao_config`](#hb_mm_mc_set_sao_config) | 设置 SAO |
| [`hb_mm_mc_get_entropy_config`](#hb_mm_mc_get_entropy_config) | 读取熵编码配置 |
| [`hb_mm_mc_set_entropy_config`](#hb_mm_mc_set_entropy_config) | 设置熵编码模式 |
| [`hb_mm_mc_get_pred_unit_config`](#hb_mm_mc_get_pred_unit_config) | 读取帧内预测配置 |
| [`hb_mm_mc_set_pred_unit_config`](#hb_mm_mc_set_pred_unit_config) | 设置帧内预测参数 |
| [`hb_mm_mc_get_transform_config`](#hb_mm_mc_get_transform_config) | 读取变换编码配置 |
| [`hb_mm_mc_set_transform_config`](#hb_mm_mc_set_transform_config) | 设置变换参数 |
| [`hb_mm_mc_get_mode_decision_config`](#hb_mm_mc_get_mode_decision_config) | 读取模式决策配置 |
| [`hb_mm_mc_set_mode_decision_config`](#hb_mm_mc_set_mode_decision_config) | 设置模式决策参数 |
| [`hb_mm_mc_get_smart_bg_enc_config`](#hb_mm_mc_get_smart_bg_enc_config) | 读取智能背景编码配置 |
| [`hb_mm_mc_set_smart_bg_enc_config`](#hb_mm_mc_set_smart_bg_enc_config) | 设置智能背景编码 |
| [`hb_mm_mc_get_3dnr_enc_config`](#hb_mm_mc_get_3dnr_enc_config) | 读取 3D 降噪配置 |
| [`hb_mm_mc_set_3dnr_enc_config`](#hb_mm_mc_set_3dnr_enc_config) | 设置 3D 降噪 |
| [`hb_mm_mc_get_roi_config`](#hb_mm_mc_get_roi_config) | 读取 ROI 配置 |
| [`hb_mm_mc_set_roi_config`](#hb_mm_mc_set_roi_config) | 设置 ROI 编码 |
| [`hb_mm_mc_get_roi_config_ex`](#hb_mm_mc_get_roi_config_ex) | 按索引读取 ROI 区域配置 |
| [`hb_mm_mc_set_roi_config_ex`](#hb_mm_mc_set_roi_config_ex) | 按索引设置 ROI 区域配置 |
| [`hb_mm_mc_get_roi_avg_qp`](#hb_mm_mc_get_roi_avg_qp) | 读取 ROI 平均 QP |
| [`hb_mm_mc_set_roi_avg_qp`](#hb_mm_mc_set_roi_avg_qp) | 设置 ROI 平均 QP |
| [`hb_mm_mc_get_vui_config`](#hb_mm_mc_get_vui_config) | 读取 VUI 配置 |
| [`hb_mm_mc_set_vui_config`](#hb_mm_mc_set_vui_config) | 设置 VUI |
| [`hb_mm_mc_get_vui_timing_config`](#hb_mm_mc_get_vui_timing_config) | 读取 VUI 时序配置 |
| [`hb_mm_mc_set_vui_timing_config`](#hb_mm_mc_set_vui_timing_config) | 设置 VUI 时序信息 |
| [`hb_mm_mc_get_slice_config`](#hb_mm_mc_get_slice_config) | 读取 slice 参数 |
| [`hb_mm_mc_set_slice_config`](#hb_mm_mc_set_slice_config) | 设置 slice 参数 |
| [`hb_mm_mc_insert_user_data`](#hb_mm_mc_insert_user_data) | 插入用户自定义数据 |
| [`hb_mm_mc_get_user_data`](#hb_mm_mc_get_user_data) | 取出用户数据 |
| [`hb_mm_mc_release_user_data`](#hb_mm_mc_release_user_data) | 释放用户数据 |
| [`hb_mm_mc_get_explicit_header_config`](#hb_mm_mc_get_explicit_header_config) | 读取显式头配置 |
| [`hb_mm_mc_set_explicit_header_config`](#hb_mm_mc_set_explicit_header_config) | 设置显式头 |
| [`hb_mm_mc_get_mjpeg_config`](#hb_mm_mc_get_mjpeg_config) | 读取 MJPEG 编码参数 |
| [`hb_mm_mc_set_mjpeg_config`](#hb_mm_mc_set_mjpeg_config) | 设置 MJPEG 编码参数 |
| [`hb_mm_mc_get_jpeg_config`](#hb_mm_mc_get_jpeg_config) | 读取 JPEG 编码参数 |
| [`hb_mm_mc_set_jpeg_config`](#hb_mm_mc_set_jpeg_config) | 设置 JPEG 编码参数 |
| [`hb_mm_mc_register_audio_encoder`](#hb_mm_mc_register_audio_encoder) | 注册音频编码器 |
| [`hb_mm_mc_unregister_audio_encoder`](#hb_mm_mc_unregister_audio_encoder) | 去注册音频编码器 |
| [`hb_mm_mc_register_audio_decoder`](#hb_mm_mc_register_audio_decoder) | 注册音频解码器 |
| [`hb_mm_mc_unregister_audio_decoder`](#hb_mm_mc_unregister_audio_decoder) | 去注册音频解码器 |

### 接口说明
下文 74 个接口共用一套返回值约定：**成功返回 `0`，失败返回负值错误码**，各接口不再重复罗列，含义统一见[返回值说明](#返回值说明)。标注「支持动态调整」的配置类接口，可在 `hb_mm_mc_start` 之后运行期间调用，立即生效。


#### hb_mm_mc_get_descriptor

查询指定 codec 的描述信息。返回 `NULL` 表示该 codec 在当前平台上不可用，应当在建立通路前用它做一次可用性判断。

```c
const media_codec_descriptor_t *hb_mm_mc_get_descriptor( media_codec_id_t codec_id);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `codec_id` | `media_codec_id_t` | codec 类型，取值见 [media_codec_id_t](#media_codec_id_t) |

> 该接口不依赖 context，可在任何时刻调用。

#### hb_mm_mc_get_default_context

取得指定 codec 的默认 context。`encoder` 传 `1` 得到编码器 context、传 `0` 得到解码器 context。调用方拿到默认值后按需修改字段，再交给 `hb_mm_mc_initialize`。

```c
hb_s32 hb_mm_mc_get_default_context(media_codec_id_t codec_id, hb_bool encoder, media_codec_context_t *context);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `codec_id` | `media_codec_id_t` | codec 类型，取值见 [media_codec_id_t](#media_codec_id_t) |
| `encoder` | `hb_bool` | `1` 为编码器，`0` 为解码器 |
| `context` | `media_codec_context_t *` | **出参**。codec 上下文 |

> 分辨率、码率、GOP 等业务参数都需要在默认值基础上改写。

#### hb_mm_mc_initialize

初始化 codec 与 context，使其进入可配置状态。仅在 `MEDIA_CODEC_STATE_UNINITIALIZED` 状态下调用有效。成功后进入 `MEDIA_CODEC_STATE_INITIALIZED` 状态。

```c
hb_s32 hb_mm_mc_initialize(media_codec_context_t *context);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

> `context` 中的 `codec_id` 与 `encoder` 必须在此前确定，初始化后不可更改。

#### hb_mm_mc_configure

把 context 中已填好的参数下发到 codec，使其生效。需处于 `MEDIA_CODEC_STATE_INITIALIZED` 状态。成功后进入 `MEDIA_CODEC_STATE_CONFIGURED` 状态。

```c
hb_s32 hb_mm_mc_configure(media_codec_context_t *context);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

> 各 `set_*_config` 类接口如果要在启动前配置，都应在 `hb_mm_mc_configure` 之前完成。

#### hb_mm_mc_start

启动编解码处理。VPU 会据此创建编解码实例、注册帧缓冲、生成编码头等。需处于 `MEDIA_CODEC_STATE_CONFIGURED` 状态。成功后进入 `MEDIA_CODEC_STATE_STARTED` 状态。

```c
hb_s32 hb_mm_mc_start(media_codec_context_t *context, const mc_av_codec_startup_params_t * info);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `info` | `mc_av_codec_startup_params_t *` | 启动参数，见 [mc_av_codec_startup_params_t](#mc_av_codec_startup_params_t) |

> `hb_mm_mc_set_callback` 与 `hb_mm_mc_set_vlc_buffer_listener` 必须在调用本接口之前完成。

#### hb_mm_mc_stop

停止编解码处理并复位实例。成功后回到 `MEDIA_CODEC_STATE_INITIALIZED` 状态。

```c
hb_s32 hb_mm_mc_stop(media_codec_context_t *context);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

#### hb_mm_mc_pause

暂停编解码处理。暂停期间不再消耗输入 buffer。成功后进入 `MEDIA_CODEC_STATE_PAUSED` 状态。

```c
hb_s32 hb_mm_mc_pause(media_codec_context_t *context);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

#### hb_mm_mc_flush

清空输入与输出 buffer 队列中尚未处理的 buffer。执行过程中进入 `MEDIA_CODEC_STATE_FLUSHING` 状态，清空完成后自动回到 `MEDIA_CODEC_STATE_STARTED` 状态。

```c
hb_s32 hb_mm_mc_flush(media_codec_context_t *context);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

> flush 会丢弃队列中已有的数据，切换码流或重新对齐时间戳时使用。

#### hb_mm_mc_release

释放 codec 及其占用的实例资源。调用前建议先 `hb_mm_mc_stop`。释放后回到 `MEDIA_CODEC_STATE_UNINITIALIZED` 状态。

```c
hb_s32 hb_mm_mc_release(media_codec_context_t *context);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

#### hb_mm_mc_get_state

查询 MediaCodec 的当前状态，取值见 [media_codec_state_t](#media_codec_state_t)。

```c
hb_s32 hb_mm_mc_get_state(media_codec_context_t *context, media_codec_state_t *state);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `state` | `media_codec_state_t *` | **出参**。codec 状态，见 [media_codec_state_t](#media_codec_state_t) |

> 调试时可用它确认某个接口是否处在允许的状态下被调用。

#### hb_mm_mc_get_status

查询 codec 的详细运行状态信息（帧计数、buffer 占用等），取值见 [mc_inter_status_t](#mc_inter_status_t)。

```c
hb_s32 hb_mm_mc_get_status(media_codec_context_t *context, mc_inter_status_t *status);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `status` | `mc_inter_status_t *` | **出参**。codec 详细状态，见 [mc_inter_status_t](#mc_inter_status_t) |


#### hb_mm_mc_set_callback

设置回调函数，编码器/解码器随之切换到**异步模式**：输入 buffer 可用或输出 buffer 可用时由 codec 回调通知，调用方在回调中处理，无需自己轮询。

```c
hb_s32 hb_mm_mc_set_callback(media_codec_context_t *context, const media_codec_callback_t *callback, hb_ptr userdata);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `callback` | `media_codec_callback_t *` | 回调函数 |
| `userdata` | `hb_ptr` | 用户数据指针，回调时作为入参原样传回 |

> 必须在 `hb_mm_mc_start` 之前调用。

> 异步模式与同步轮询模式二选一，设置回调后不要再在业务线程里主动 dequeue。

#### hb_mm_mc_set_vlc_buffer_listener

设置码流 buffer 大小监听回调。当编码器发现码流 buffer 不足时回调通知，调用方可在回调中调整 buffer 大小。

```c
hb_s32 hb_mm_mc_set_vlc_buffer_listener( media_codec_context_t *context, const media_codec_callback_t *callback, hb_ptr userdata);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `callback` | `media_codec_callback_t *` | 见 [media_codec_callback_t](#media_codec_callback_t) |
| `userdata` | `hb_ptr` | 用户数据指针，回调时原样传回 |

> 必须在 `hb_mm_mc_start` 之前调用。

#### hb_mm_mc_set_camera

指定本路编解码关联的相机通道信息，用于与 VPF 通路对接时标识数据来源。

```c
hb_s32 hb_mm_mc_set_camera(media_codec_context_t *context, hb_s32 pipeline, hb_s32 channel_port_id);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `pipeline` | `hb_s32` | pipeline 编号 |
| `channel_port_id` | `hb_s32` | IPU 通道端口号 |

#### hb_mm_mc_vpf_init

把 MediaCodec 与指定的 VPF 通道关联，使编解码器可以从 VPF 通路直接取帧或向通路送帧。**必须在 `hb_mm_mc_initialize` 之后、`hb_mm_mc_configure` 之前调用**，顺序颠倒会返回 `HB_MEDIA_ERR_OPERATION_NOT_ALLOWED`。

```c
hb_s32 hb_mm_mc_vpf_init(media_codec_context_t * context, hb_s32 channel_idx);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `channel_idx` | `hb_s32` | VPF 通道号 |

> 不使用 VPF 通路、完全由调用方自己喂帧的场景不需要调用本接口。

#### hb_mm_mc_get_fd

取得 codec 的设备 fd，可用于 `select` / `poll` 等事件等待，把编解码就绪事件并入调用方自己的事件循环。

```c
hb_s32 hb_mm_mc_get_fd(media_codec_context_t * context, hb_s32 *fd);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `fd` | `hb_s32 *` | **出参**。设备 fd |

> 取得的 fd 必须用 `hb_mm_mc_close_fd` 关闭，不要直接 `close`。

#### hb_mm_mc_close_fd

关闭由 `hb_mm_mc_get_fd` 取得的设备 fd。

```c
hb_s32 hb_mm_mc_close_fd(media_codec_context_t * context, hb_s32 fd);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `fd` | `hb_s32` | 设备 fd |


#### hb_mm_mc_dequeue_input_buffer

从输入队列取出一个空闲 buffer，供调用方填入待编码（或待解码）的数据。仅在 `MEDIA_CODEC_STATE_STARTED` 状态下有效。

```c
hb_s32 hb_mm_mc_dequeue_input_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, hb_s32 timeout);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `timeout` | `hb_s32` | 超时时间，单位 ms |
| `buffer` | `media_codec_buffer_t *` | **出参**。buffer 描述符，包含虚拟地址、物理地址与大小 |

> 取出的 buffer 用完必须 `hb_mm_mc_queue_input_buffer` 归还，否则队列会被耗尽。

#### hb_mm_mc_queue_input_buffer

把填好数据的输入 buffer 交还给 codec，触发一次编解码处理。仅在 `MEDIA_CODEC_STATE_STARTED` 状态下有效。

```c
hb_s32 hb_mm_mc_queue_input_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, hb_s32 timeout);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `timeout` | `hb_s32` | 超时时间，单位 ms |
| `buffer` | `media_codec_buffer_t *` | **出参**。buffer 描述符，包含虚拟地址、物理地址与大小 |

#### hb_mm_mc_dequeue_output_buffer

从输出队列取出一个装有编解码结果的 buffer。编码时是码流，解码时是 YUV 图像。仅在 `MEDIA_CODEC_STATE_STARTED` 状态下有效。

```c
hb_s32 hb_mm_mc_dequeue_output_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, media_codec_output_buffer_info_t*info, hb_s32 timeout);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `timeout` | `hb_s32` | 超时时间，单位 ms |
| `buffer` | `media_codec_buffer_t *` | **出参**。buffer 描述符，包含虚拟地址、物理地址与大小 |
| `info` | `media_codec_output_buffer_info_t*` | **出参**。码流附加信息，见 [media_codec_output_buffer_info_t](#media_codec_output_buffer_info_t) |

> `info` 出参会带回码流或图像的附加信息（帧类型、时间戳等），按需解析。

#### hb_mm_mc_queue_output_buffer

把消费完的输出 buffer 交还给 codec，供后续复用。仅在 `MEDIA_CODEC_STATE_STARTED` 状态下有效。

```c
hb_s32 hb_mm_mc_queue_output_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, hb_s32 timeout);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `timeout` | `hb_s32` | 超时时间，单位 ms |
| `buffer` | `media_codec_buffer_t *` | **出参**。buffer 描述符，包含虚拟地址、物理地址与大小 |


#### hb_mm_mc_get_rate_control_config

读取当前的码率控制参数。仅 H.264 / H.265 / MJPEG codec。

```c
hb_s32 hb_mm_mc_get_rate_control_config( media_codec_context_t *context, mc_rate_control_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_rate_control_params_t *` | **出参**。码率控制参数，见 [码率控制](#码率控制) |

#### hb_mm_mc_set_rate_control_config

设置码率控制参数，包括码控模式与各模式的参数项。仅 H.264 / H.265 / MJPEG codec。

```c
hb_s32 hb_mm_mc_set_rate_control_config( media_codec_context_t *context, const mc_rate_control_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_rate_control_params_t *` | 码率控制参数，见 [码率控制](#码率控制) |

> 支持运行中**动态调整**，不需要重启编码器。

#### hb_mm_mc_get_max_bit_rate_config

读取最大码率配置。仅对 AVBR 与 CBR 码控模式有意义。

```c
hb_s32 hb_mm_mc_get_max_bit_rate_config( media_codec_context_t *context, hb_u32 *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `hb_u32 *` | **出参**。最大码率配置 |

#### hb_mm_mc_set_max_bit_rate_config

设置 AVBR 模式下的最大码率，单位 kbps，取值 `[0, 700000]`。仅对 AVBR 与 CBR 码控模式有意义。

```c
hb_s32 hb_mm_mc_set_max_bit_rate_config( media_codec_context_t *context, hb_u32 params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `hb_u32` | 码率控制参数，见 [码率控制](#码率控制) |

> 当设置值小于目标码率 `bit_rate` 时，峰值传输码率视为无限大，即该限制不产生约束。


#### hb_mm_mc_get_longterm_ref_mode

读取长期参考帧模式的配置。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_longterm_ref_mode( media_codec_context_t *context, mc_video_longterm_ref_mode_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_longterm_ref_mode_t *` | **出参**。长期参考帧参数，见 [mc_video_longterm_ref_mode_t](#mc_video_longterm_ref_mode_t) |

#### hb_mm_mc_set_longterm_ref_mode

设置长期参考帧模式，用于抑制帧间预测的累积误差。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_longterm_ref_mode( media_codec_context_t *context, const mc_video_longterm_ref_mode_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_longterm_ref_mode_t *` | 长期参考帧参数，见 [mc_video_longterm_ref_mode_t](#mc_video_longterm_ref_mode_t) |

> 支持运行中**动态调整**。

#### hb_mm_mc_get_intra_refresh_config

读取 Intra Refresh 的配置。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_intra_refresh_config( media_codec_context_t *context, mc_video_intra_refresh_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_intra_refresh_params_t *` | **出参**。Intra Refresh 参数，见 [mc_video_intra_refresh_params_t](#mc_video_intra_refresh_params_t) |

#### hb_mm_mc_set_intra_refresh_config

设置 Intra Refresh。在非 I 帧内部周期性插入帧内编码的块，为解码端提供修复点，提高码流的抗误码能力。可指定插入的行数、列数或步长，也可只给总量由编码器自行决定位置。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_intra_refresh_config( media_codec_context_t *context, const mc_video_intra_refresh_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_intra_refresh_params_t *` | Intra Refresh 参数，见 [mc_video_intra_refresh_params_t](#mc_video_intra_refresh_params_t) |

#### hb_mm_mc_request_idr_frame

请求编码器把下一帧编成 IDR 帧。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_request_idr_frame(media_codec_context_t *context);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

> 需要在码流中插入随机接入点时调用，典型场景是解码端新接入或发生丢包后恢复。

#### hb_mm_mc_request_idr_header

使能或关闭 IDR 帧输出，默认使能。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_request_idr_header( media_codec_context_t *context, hb_u32 force_header);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `enable` | `` | 使能 / 关闭 IDR 帧，默认使能 |

#### hb_mm_mc_enable_idr_frame

使能或关闭 IDR 帧输出，默认使能。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_enable_idr_frame( media_codec_context_t *context, hb_bool enable);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `enable` | `hb_bool` | 使能 / 关闭 IDR 帧，默认使能 |

#### hb_mm_mc_skip_pic

请求跳过当前图像。编码器忽略输入图像内容，直接复用上一帧的重构帧，输出一个 P 帧——解码端看到的画面与上一帧完全相同。仅 H.264 / H.265 codec，且只对非 I 帧有效。

```c
hb_s32 hb_mm_mc_skip_pic(media_codec_context_t * context, hb_s32 src_idx);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `src_idx` | `hb_s32` | 源 buffer 索引 |

> 无论当前 GOP 结构如何，skip 帧一律编为 P 帧。


#### hb_mm_mc_get_deblk_filter_config

读取去块滤波器的配置。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_deblk_filter_config( media_codec_context_t *context, mc_video_deblk_filter_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_deblk_filter_params_t *` | **出参**。去块滤波参数，见 [mc_video_deblk_filter_params_t](#mc_video_deblk_filter_params_t) |

#### hb_mm_mc_set_deblk_filter_config

设置去块滤波器。用于削弱块效应，关闭后画面在低码率下会出现明显方块。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_deblk_filter_config( media_codec_context_t *context, const mc_video_deblk_filter_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_deblk_filter_params_t *` | 去块滤波参数，见 [mc_video_deblk_filter_params_t](#mc_video_deblk_filter_params_t) |

#### hb_mm_mc_get_sao_config

读取 SAO（Sample Adaptive Offset，样点自适应补偿）的配置。仅 H.265 codec。

```c
hb_s32 hb_mm_mc_get_sao_config(media_codec_context_t *context, mc_h265_sao_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_h265_sao_params_t *` | **出参**。SAO 参数，见 [mc_h265_sao_params_t](#mc_h265_sao_params_t) |

#### hb_mm_mc_set_sao_config

设置 SAO。SAO 在去块滤波之后进一步补偿像素，改善重建画质，是 H.265 特有的编码工具。仅 H.265 codec。

```c
hb_s32 hb_mm_mc_set_sao_config(media_codec_context_t *context, const mc_h265_sao_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_h265_sao_params_t *` | SAO 参数，见 [mc_h265_sao_params_t](#mc_h265_sao_params_t) |

#### hb_mm_mc_get_entropy_config

读取熵编码的配置。仅 H.264 codec。

```c
hb_s32 hb_mm_mc_get_entropy_config( media_codec_context_t *context, mc_h264_entropy_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_h264_entropy_params_t *` | **出参**。熵编码参数，见 [mc_h264_entropy_params_t](#mc_h264_entropy_params_t) |

#### hb_mm_mc_set_entropy_config

设置熵编码模式（CABAC / CAVLC）。CABAC 压缩率更高但计算量更大。仅 H.264 codec。

```c
hb_s32 hb_mm_mc_set_entropy_config( media_codec_context_t *context, const mc_h264_entropy_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_h264_entropy_params_t *` | 熵编码参数，见 [mc_h264_entropy_params_t](#mc_h264_entropy_params_t) |

#### hb_mm_mc_get_pred_unit_config

读取帧内预测的配置。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_pred_unit_config( media_codec_context_t *context, mc_video_pred_unit_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_pred_unit_params_t *` | **出参**。帧内预测参数，见 [mc_video_pred_unit_params_t](#mc_video_pred_unit_params_t) |

#### hb_mm_mc_set_pred_unit_config

设置帧内预测相关参数。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_pred_unit_config( media_codec_context_t *context, const mc_video_pred_unit_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_pred_unit_params_t *` | 帧内预测参数，见 [mc_video_pred_unit_params_t](#mc_video_pred_unit_params_t) |

#### hb_mm_mc_get_transform_config

读取变换编码的配置。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_transform_config( media_codec_context_t *context, mc_video_transform_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_transform_params_t *` | **出参**。变换参数，见 [mc_video_transform_params_t](#mc_video_transform_params_t) |

#### hb_mm_mc_set_transform_config

设置变换相关参数。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_transform_config( media_codec_context_t *context, const mc_video_transform_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_transform_params_t *` | 变换参数，见 [mc_video_transform_params_t](#mc_video_transform_params_t) |

#### hb_mm_mc_get_mode_decision_config

读取编码模式决策的配置。仅 H.265 codec。

```c
hb_s32 hb_mm_mc_get_mode_decision_config( media_codec_context_t *context, mc_video_mode_decision_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_mode_decision_params_t *` | **出参**。模式决策参数，见 [mc_video_mode_decision_params_t](#mc_video_mode_decision_params_t) |

#### hb_mm_mc_set_mode_decision_config

设置编码模式决策参数，用于在编码速度与压缩效率之间取舍。仅 H.265 codec。

```c
hb_s32 hb_mm_mc_set_mode_decision_config( media_codec_context_t *context, const mc_video_mode_decision_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_mode_decision_params_t *` | 模式决策参数，见 [mc_video_mode_decision_params_t](#mc_video_mode_decision_params_t) |

#### hb_mm_mc_get_smart_bg_enc_config

读取智能背景编码的配置。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_smart_bg_enc_config( media_codec_context_t *context, mc_video_smart_bg_enc_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_smart_bg_enc_params_t *` | **出参**。智能背景编码参数，见 [mc_video_smart_bg_enc_params_t](#mc_video_smart_bg_enc_params_t) |

#### hb_mm_mc_set_smart_bg_enc_config

设置智能背景编码。针对监控等背景长期不变的场景，降低静止区域的码率开销。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_smart_bg_enc_config( media_codec_context_t *context, const mc_video_smart_bg_enc_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_smart_bg_enc_params_t *` | 智能背景编码参数，见 [mc_video_smart_bg_enc_params_t](#mc_video_smart_bg_enc_params_t) |

#### hb_mm_mc_get_3dnr_enc_config

读取 3D 降噪的配置。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_3dnr_enc_config( media_codec_context_t *context, mc_video_3dnr_enc_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_3dnr_enc_params_t *` | **出参**。3D 降噪参数，见 [mc_video_3dnr_enc_params_t](#mc_video_3dnr_enc_params_t) |

#### hb_mm_mc_set_3dnr_enc_config

设置 3D 降噪（3D Noise Reduction）。利用时域信息抑制噪声，改善暗光场景的编码画质。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_3dnr_enc_config( media_codec_context_t *context, const mc_video_3dnr_enc_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_3dnr_enc_params_t *` | 智能背景编码参数，见 [mc_video_smart_bg_enc_params_t](#mc_video_smart_bg_enc_params_t) |


#### hb_mm_mc_get_roi_config

读取 ROI 编码的配置。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_roi_config(media_codec_context_t * context, mc_video_roi_params_t * params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_roi_params_t *` | **出参**。ROI 参数，见 [mc_video_roi_params_t](#mc_video_roi_params_t) |

#### hb_mm_mc_set_roi_config

设置 ROI 编码。按光栅扫描顺序为每个块指定 QP 值，实现重点区域高画质、次要区域省码率。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_roi_config(media_codec_context_t * context, const mc_video_roi_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_roi_params_t *` | ROI 参数，见 [mc_video_roi_params_t](#mc_video_roi_params_t) |

> H.264 的块大小为 16×16 像素，H.265 为 32×32 像素，每个 QP 值占 1 字节、取值 `[0, 51]`。

#### hb_mm_mc_get_roi_config_ex

按索引读取一路 ROI 区域的配置（ROI 扩展接口）。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_roi_config_ex(media_codec_context_t *context, hb_u32 roi_idx, mc_video_roi_params_ex_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `roi_idx` | `hb_u32` | ROI 区域索引 |
| `params` | `mc_video_roi_params_ex_t *` | **出参**。ROI 参数，见 [mc_video_roi_params_ex_t](#mc_video_roi_params_ex_t) |

#### hb_mm_mc_set_roi_config_ex

按索引设置一路 ROI 区域的配置（ROI 扩展接口）。

```c
hb_s32 hb_mm_mc_set_roi_config_ex(media_codec_context_t *context, const mc_video_roi_params_ex_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_roi_params_ex_t *` | ROI 参数，见 [mc_video_roi_params_ex_t](#mc_video_roi_params_ex_t) |


#### hb_mm_mc_get_roi_avg_qp

读取 ROI 区域的平均 QP 值。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_roi_avg_qp(media_codec_context_t * context, hb_u32 * params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `hb_u32 *` | **出参**。ROI 区域的平均 QP |

#### hb_mm_mc_set_roi_avg_qp

设置 ROI 区域的平均 QP 值，取值 `[0, 51]`。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_roi_avg_qp(media_codec_context_t * context, hb_u32 params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `hb_u32` | ROI 区域的平均 QP，取值 `[0, 51]` |

> **仅在 CBR 或 AVBR 码控模式下有意义**——这两种模式下块的实际 QP 由 ROI 表值、码控内部值与该平均值共同决定。


#### hb_mm_mc_get_vui_config

读取 VUI（Video Usability Information）的配置。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_vui_config( media_codec_context_t *context, mc_video_vui_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_vui_params_t *` | **出参**。VUI 参数，见 [mc_video_vui_params_t](#mc_video_vui_params_t) |

#### hb_mm_mc_set_vui_config

设置 VUI，向码流中写入像素宽高比、色彩描述等辅助信息。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_vui_config( media_codec_context_t *context, const mc_video_vui_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_vui_params_t *` | VUI 参数，见 [mc_video_vui_params_t](#mc_video_vui_params_t) |

#### hb_mm_mc_get_vui_timing_config

读取 VUI 中时序信息的配置。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_vui_timing_config( media_codec_context_t *context, mc_video_vui_timing_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_vui_timing_params_t *` | **出参**。VUI 时序参数，见 [mc_video_vui_timing_params_t](#mc_video_vui_timing_params_t) |

#### hb_mm_mc_set_vui_timing_config

设置 VUI 时序信息，向码流写入帧率相关参数，供解码端做帧率控制。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_vui_timing_config( media_codec_context_t *context, const mc_video_vui_timing_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_vui_timing_params_t *` | VUI 时序参数，见 [mc_video_vui_timing_params_t](#mc_video_vui_timing_params_t) |

#### hb_mm_mc_get_slice_config

读取 slice 切分参数。H.264 / H.265 / MJPEG / JPEG codec。

```c
hb_s32 hb_mm_mc_get_slice_config(media_codec_context_t *context, mc_video_slice_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_slice_params_t *` | **出参**。slice 参数，见 [mc_video_slice_params_t](#mc_video_slice_params_t) |

#### hb_mm_mc_set_slice_config

设置 slice 切分参数。把一帧切成多个 slice 有利于并行编码与丢包恢复。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_slice_config(media_codec_context_t *context, const mc_video_slice_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_slice_params_t *` | slice 参数，见 [mc_video_slice_params_t](#mc_video_slice_params_t) |

#### hb_mm_mc_insert_user_data

向码流中插入用户自定义数据，例如设备编号、时间等业务信息。H.264 / H.265 / MJPEG / JPEG codec。

```c
hb_s32 hb_mm_mc_insert_user_data(media_codec_context_t * context, hb_u8 *data, hb_u32 length);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `data` | `hb_u8 *` | 用户数据，必须按 `UUID + 字符串` 的格式组织 |
| `length` | `hb_u32` | 数据长度，取值 `(0, 1024]` 字节 |

> `data` 必须按 `UUID + 字符串` 的格式组织。

> `length` 取值范围 `(0, 1024]` 字节。

#### hb_mm_mc_get_user_data

从码流中取出调用方此前插入的用户数据。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_user_data(media_codec_context_t * context, mc_user_data_buffer_t *params, hb_s32 timeout);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_user_data_buffer_t *` | **出参**。用户数据，见 [mc_user_data_buffer_t](#mc_user_data_buffer_t) |
| `timeout` | `hb_s32` | 超时时间，单位 ms |

#### hb_mm_mc_release_user_data

释放取出的用户数据，与 `hb_mm_mc_get_user_data` 配对使用。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_release_user_data(media_codec_context_t * context, const mc_user_data_buffer_t * params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_user_data_buffer_t *` | **出参**。用户数据，见 [mc_user_data_buffer_t](#mc_user_data_buffer_t) |

#### hb_mm_mc_get_explicit_header_config

读取显式头（explicit header）配置。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_get_explicit_header_config( media_codec_context_t *context, hb_s32 *status);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `status` | `hb_s32 *` | **出参**。显式头配置 |

#### hb_mm_mc_set_explicit_header_config

使能或关闭显式头输出，默认使能。仅 H.264 / H.265 codec。

```c
hb_s32 hb_mm_mc_set_explicit_header_config( media_codec_context_t *context, hb_s32 status);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `status` | `hb_s32` | 使能 / 关闭显式头，默认使能 |


#### hb_mm_mc_get_mjpeg_config

读取 MJPEG 编码参数。仅 MJPEG codec。

```c
hb_s32 hb_mm_mc_get_mjpeg_config(media_codec_context_t * context, mc_mjpeg_enc_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_mjpeg_enc_params_t *` | **出参**。MJPEG 编码参数，见 [mc_mjpeg_enc_params_t](#mc_mjpeg_enc_params_t) |

#### hb_mm_mc_set_mjpeg_config

设置 MJPEG 编码参数。仅 MJPEG codec。

```c
hb_s32 hb_mm_mc_set_mjpeg_config(media_codec_context_t * context, const mc_mjpeg_enc_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_mjpeg_enc_params_t *` | MJPEG 编码参数，见 [mc_mjpeg_enc_params_t](#mc_mjpeg_enc_params_t) |

#### hb_mm_mc_get_jpeg_config

读取 JPEG 编码参数。仅 JPEG codec。

```c
hb_s32 hb_mm_mc_get_jpeg_config(media_codec_context_t * context, mc_jpeg_enc_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_jpeg_enc_params_t *` | **出参**。JPEG 编码参数，见 [mc_jpeg_enc_params_t](#mc_jpeg_enc_params_t) |

#### hb_mm_mc_set_jpeg_config

设置 JPEG 编码参数。仅 JPEG codec。

```c
hb_s32 hb_mm_mc_set_jpeg_config(media_codec_context_t * context, const mc_jpeg_enc_params_t *params);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `codec` | `` | codec 上下文 |
| `jpeg` | `` | JPEG 编码参数，见 [mc_jpeg_enc_params_t](#mc_jpeg_enc_params_t) |


#### hb_mm_mc_register_audio_encoder

注册一个外部音频编码器，使其可以通过 MediaCodec 的统一接口使用。

```c
hb_s32 hb_mm_mc_register_audio_encoder(hb_s32 *handle, mc_audio_encode_param_t *encoder);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `handle` | `hb_s32 *` | **出参**。注册句柄 |
| `encoder` | `mc_audio_encode_param_t *` | 音频编码器描述，见 [mc_audio_encode_param_t](#mc_audio_encode_param_t) |

> 注册成功后返回 `handle`，去注册时需要使用。

#### hb_mm_mc_unregister_audio_encoder

去注册此前注册的音频编码器。

```c
hb_s32 hb_mm_mc_unregister_audio_encoder(hb_s32 handle);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `handle` | `hb_s32` | 注册句柄 |

#### hb_mm_mc_register_audio_decoder

注册一个外部音频解码器，使其可以通过 MediaCodec 的统一接口使用。

```c
hb_s32 hb_mm_mc_register_audio_decoder(hb_s32 *handle, mc_audio_decode_param_t *decoder);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `handle` | `hb_s32 *` | **出参**。注册句柄 |
| `decoder` | `mc_audio_decode_param_t *` | 音频解码器描述，见 [mc_audio_decode_param_t](#mc_audio_decode_param_t) |

> 注册成功后返回 `handle`，去注册时需要使用。

#### hb_mm_mc_unregister_audio_decoder

去注册此前注册的音频解码器。

```c
hb_s32 hb_mm_mc_unregister_audio_decoder(hb_s32 handle);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `handle` | `hb_s32` | 注册句柄 |


### 数据结构
字段的**语义**按主题分散在各节（`rc_params` 见[码率控制](#码率控制)，`gop_params` 见 [GOP 与参考帧](#gop-与参考帧)，buffer 各字段见[一帧数据的流转](#数据通路)），这里只把配置的树摊开。完整字段以 SDK 头文件为准。

#### 类型总览

MediaCodec 对外是一组 `hb_mm_mc_*` 函数。一路编解码任务的全部配置集中在 `media_codec_context_t` 里，初始化时下发一次；运行期再用 `set_*_config` 类接口增量修改。输入输出各走一条 buffer 队列，调用方只负责取还 buffer，不经手内存分配。

| 类型 | 作用 | 关键成员 |
| --- | --- | --- |
| `media_codec_context_t` | 一路编解码任务的全部配置 | `codec_id`、`encoder`、`video_enc_params` / `video_dec_params`、`priority` |
| `mc_video_codec_enc_params_t` | 编码参数 | `width` / `height`、`pix_fmt`、`rc_params`、`gop_params`、`frame_buf_count` |
| `mc_video_codec_dec_params_t` | 解码参数 | `feed_mode`、`pix_fmt`、`bitstream_buf_size` |
| `media_codec_buffer_t` | 一次收发的 buffer | `type`、`vframe_buf`、`vstream_buf` |
| `media_codec_callback_t` | 异步模式的回调集合 | `on_input_buffer_available`、`on_output_buffer_available` |
| `media_codec_descriptor_t` | codec 的静态描述 | `id`、`name`、`mime_types` |
| `media_codec_state_t` | 状态机取值 | 见 [状态迁移](#状态迁移) |

**`codec_id` 与 `encoder`**：这两个字段决定 `video_*_params` 里哪个联合体成员生效，**初始化之后不可更改**。

**与 VPF 通路的关系**：编解码器可以当一个普通模块用（调用方自己喂 YUV、自己取码流），也可以通过 `hb_mm_mc_vpf_init` 挂到 VPF 通路上，由通路直接送帧、取帧。

**接口分属两个库**：`hb_mm_mc_*` 在 `libmultimedia.so`，buffer 内存的申请与 cache 操作等 `hb_mem_*` 在 `libhbmem.so`。

#### 顶层

```c
typedef struct _media_codec_context {
    media_codec_id_t    codec_id;         // 编解码标准；初始化后不可改
    hb_bool             encoder;          // 1 = 编码器，0 = 解码器；初始化后不可改
    hb_s32              instance_index;   // 内部私有，不要改
    union {
        mc_video_codec_enc_params_t video_enc_params;  // 编码参数（encoder = 1）
        mc_video_codec_dec_params_t video_dec_params;  // 解码参数（encoder = 0）
        mc_audio_codec_enc_params_t audio_enc_params;
        mc_audio_codec_dec_params_t audio_dec_params;
    };
    hb_ptr              vpf_context;      // 内部私有，不要改
    mc_video_cmd_prio_t priority;         // 命令优先级
} media_codec_context_t;
```

**编码参数**

```c
typedef struct _mc_video_codec_enc_params {
    hb_s32                   width, height;         // 输入图像宽高（亮度像素数）
    mc_pixel_format_t        pix_fmt;               // 输入像素格式
    hb_u32                   frame_buf_count;       // 输入帧 buffer 数量
    hb_bool                  external_frame_buf;    // 1 = 用上游模块的内存，省一次拷贝
    hb_u32                   bitstream_buf_count;   // 码流 buffer 数量
    hb_u32                   bitstream_buf_size;    // 码流 buffer 大小，0 = 由 codec 自行计算
    mc_rate_control_params_t rc_params;             // 码率控制，唯一可运行中修改的成员
    mc_video_gop_params_t    gop_params;            // GOP 结构
    mc_rotate_degree_t       rot_degree;            // 编码前旋转（解码不支持）
    mc_mirror_direction_t    mir_direction;         // 编码前镜像（解码不支持）
    hb_u32                   frame_cropping_flag;   // 是否裁剪
    mc_av_codec_rect_t       crop_rect;             // 裁剪矩形
    hb_bool                  enable_user_pts;       // 用输入 buffer 的 pts 当码流 pts
    union {                                        // 各 codec 的专有配置
        mc_h264_enc_config_t  h264_enc_config;
        mc_h265_enc_config_t  h265_enc_config;
        mc_mjpeg_enc_config_t mjpeg_enc_config;
        mc_jpeg_enc_config_t  jpeg_enc_config;
    };
} mc_video_codec_enc_params_t;
```

**解码参数**

```c
typedef struct _mc_video_codec_dec_params {
    mc_av_stream_feeding_mode_t feed_mode;            // 码流送入方式，必设
    mc_pixel_format_t           pix_fmt;              // 输出像素格式
    hb_u32                      bitstream_buf_size;   // 输入码流 buffer 大小
    hb_u32                      bitstream_buf_count;  // 输入码流 buffer 数量
    hb_bool                     external_bitstream_buf;
    hb_u32                      frame_buf_count;      // 输出帧 buffer 数量
    union {                                          // 各 codec 的专有配置
        mc_h264_dec_config_t  h264_dec_config;
        mc_h265_dec_config_t  h265_dec_config;
        mc_mjpeg_dec_config_t mjpeg_dec_config;
        mc_jpeg_dec_config_t  jpeg_dec_config;
    };
} mc_video_codec_dec_params_t;
```

**buffer 与回调**

```c
typedef struct _media_codec_buffer {
    media_codec_buffer_type_t type;                  // 决定下面哪个联合体成员生效
    union {
        mc_video_frame_buffer_info_t  vframe_buf;    // 图像帧：编码的输入、解码的输出
        mc_video_stream_buffer_info_t vstream_buf;   // 码流：编码的输出、解码的输入
        mc_audio_frame_buffer_info_t  aframe_buf;
        mc_audio_stream_buffer_info_t astream_buf;
    };
} media_codec_buffer_t;

typedef struct _media_codec_callback {
    void (*on_input_buffer_available)(hb_ptr userdata, media_codec_buffer_t *buffer);
    void (*on_output_buffer_available)(hb_ptr userdata, media_codec_buffer_t *buffer,
                                       media_codec_output_buffer_info_t *info);
    void (*on_media_codec_message)(hb_ptr userdata, hb_s32 error);
    void (*on_vlc_buffer_message)(hb_ptr userdata, hb_s32 *vlc_buf);
} media_codec_callback_t;
```

**codec 描述项（`hb_mm_mc_get_descriptor` 的返回值）**

```c
typedef enum _media_codec_mode {
    MC_SOFTWARE = 0,   // 软件实现
    MC_HARDWARE,       // 硬件实现。RDK 上视频编解码走 VPU / JPU，即此项
} media_codec_mode_t;
```


#### 相关类型

##### media_codec_state_t

```c
typedef enum _media_codec_state {
    MEDIA_CODEC_STATE_NONE = -1,
    MEDIA_CODEC_STATE_UNINITIALIZED,
    MEDIA_CODEC_STATE_INITIALIZED,
    MEDIA_CODEC_STATE_CONFIGURED,
    MEDIA_CODEC_STATE_STARTED,
    MEDIA_CODEC_STATE_PAUSED,
    MEDIA_CODEC_STATE_FLUSHING,
    MEDIA_CODEC_STATE_ERROR,
    MEDIA_CODEC_STATE_TOTAL,
} media_codec_state_t;
```

| 取值 | 说明 |
| `MEDIA_CODEC_STATE_NONE` | 无效状态 |
| `MEDIA_CODEC_STATE_UNINITIALIZED` | 未初始化。创建 context 后的初始状态 |
| `MEDIA_CODEC_STATE_INITIALIZED` | 已初始化，尚未下发配置。`hb_mm_mc_configure` 与 `hb_mm_mc_vpf_init` 在此状态下调用 |
| `MEDIA_CODEC_STATE_CONFIGURED` | 配置已生效，可以启动 |
| `MEDIA_CODEC_STATE_STARTED` | 运行中。buffer 的 dequeue / queue 只能在此状态下进行 |
| `MEDIA_CODEC_STATE_PAUSED` | 已暂停 |
| `MEDIA_CODEC_STATE_FLUSHING` | 正在清空 buffer 队列，完成后自动回到 `STARTED` |
| `MEDIA_CODEC_STATE_ERROR` | 出错 |
| `MEDIA_CODEC_STATE_TOTAL` | 状态总数，非有效状态 |

##### mc_video_cmd_prio_t

| 取值 | 说明 |
| `PRIO_0` … `PRIO_31` | 命令优先级，数值越大优先级越高 |
| `MAX_PRIO_32` | 优先级总数，非有效取值 |

优先级用于多路编解码任务竞争硬件资源时的调度。不指定时取默认的 `NON_PRIO`。

##### media_codec_id_t

```c
typedef enum _media_codec_id {
    MEDIA_CODEC_ID_NONE = -1,
    MEDIA_CODEC_ID_H264, MEDIA_CODEC_ID_H265, MEDIA_CODEC_ID_MJPEG, MEDIA_CODEC_ID_JPEG,
    /* 音频 codec（软件实现，经 register_audio_* 注册后使用） */
    MEDIA_CODEC_ID_FLAC, MEDIA_CODEC_ID_PCM_MULAW, MEDIA_CODEC_ID_PCM_ALAW,
    MEDIA_CODEC_ID_ADPCM_G726, MEDIA_CODEC_ID_ADPCM, MEDIA_CODEC_ID_AAC,
    MEDIA_CODEC_ID_MP3, MEDIA_CODEC_ID_MP2, MEDIA_CODEC_ID_TAK, MEDIA_CODEC_ID_AC3,
    MEDIA_CODEC_ID_WMA, MEDIA_CODEC_ID_AMR, MEDIA_CODEC_ID_APE, MEDIA_CODEC_ID_G729,
    MEDIA_CODEC_ID_G723, MEDIA_CODEC_ID_G722, MEDIA_CODEC_ID_IAC, MEDIA_CODEC_ID_RALF,
    MEDIA_CODEC_ID_QMCDEC, MEDIA_CODEC_ID_DTS, MEDIA_CODEC_ID_GSM, MEDIA_CODEC_ID_TTA,
    MEDIA_CODEC_ID_QCELP, MEDIA_CODEC_ID_MLP, MEDIA_CODEC_ID_ATRAC1,
    MEDIA_CODEC_ID_IMC, MEDIA_CODEC_ID_EAC, MEDIA_CODEC_ID_MP1, MEDIA_CODEC_ID_SIPR,
    MEDIA_CODEC_ID_OPUS, MEDIA_CODEC_ID_CELT,
    MEDIA_CODEC_ID_MOV_TEXT,
} media_codec_id_t;
```

<DocScope products="RDK S100">

**S100 上可用的取值只有 4 个**：`MEDIA_CODEC_ID_H264`、`MEDIA_CODEC_ID_H265`、`MEDIA_CODEC_ID_MJPEG`、`MEDIA_CODEC_ID_JPEG`。其余取值 `hb_mm_mc_get_descriptor` 均返回 `NULL`。

</DocScope>

<DocScope products="RDK S600">

**S600 上可用的取值**：`MEDIA_CODEC_ID_H264`、`MEDIA_CODEC_ID_H265`、`MEDIA_CODEC_ID_MJPEG`、`MEDIA_CODEC_ID_JPEG`。另有 8 个 `MEDIA_CODEC_ID_*_HW1` / `_HW2` 变体（H264/H265/MJPEG/JPEG 各两个），用于指定具体的硬件编解码单元，仅在 S600 上可用。

</DocScope>

表中 FLAC 至 AAC 的 6 种为内置软件编解码器，直接使用；其余取值需要先通过 `hb_mm_mc_register_audio_encoder` / `hb_mm_mc_register_audio_decoder` 注册外部编解码器，见[音频编解码器注册](#hb_mm_mc_register_audio_encoder)。

##### mc_audio_encode_param_t

音频编码器描述，注册音频编码器时由调用方填充。函数指针由软件编解码库实现，MediaCodec 通过它们调用编解码逻辑。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ff_type` | `media_codec_id_t` | 音频编码标准，取值见 [media_codec_id_t](#media_codec_id_t) |
| `ff_max_frm` | `hb_s32` | 单帧最大采样数 |
| `ff_codec_name[256]` | `char` | 编码器名称字符串 |

##### mc_audio_decode_param_t

音频解码器描述，注册音频解码器时由调用方填充。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ff_type` | `media_codec_id_t` | 音频编码标准，取值见 [media_codec_id_t](#media_codec_id_t) |
| `ff_codec_name[256]` | `char` | 解码器名称字符串 |

##### mc_av_codec_startup_params_t

启动参数，作为 `hb_mm_mc_start` 的入参。按 `codec_id` 与 `encoder` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `video_enc_startup_params` | `mc_video_enc_startup_params_t` | 联合体成员 |
| `video_dec_startup_params` | `mc_video_dec_startup_params_t` | 联合体成员 |
| `audio_enc_startup_params` | `mc_audio_enc_startup_params_t` | 联合体成员 |
| `audio_dec_startup_params` | `mc_audio_dec_startup_params_t` | 联合体成员 |

##### media_codec_callback_t

异步模式的回调集合，作为 `hb_mm_mc_set_callback` 的入参。四个回调按需要实现，不需要的填 `NULL`。


| 回调 | 触发时机 | 说明 |
| --- | --- | --- |
| `on_input_buffer_available` | 有空的输入 buffer 可用 | 在回调里填入待编码/待解码的数据并 queue 回去 |
| `on_output_buffer_available` | 有输出 buffer 可取 | 在回调里消费码流或图像，并 queue 回去；`info` 带回帧类型与时间戳 |
| `on_media_codec_message` | codec 上报消息 | `error` 为错误码，用于异步场景下的异常感知 |
| `on_vlc_buffer_message` | 码流 buffer 大小需要调整 | `vlc_buf` 为建议的 buffer 大小，仅设置了 `hb_mm_mc_set_vlc_buffer_listener` 时触发 |

> 所有回调的 `userdata` 就是 `hb_mm_mc_set_callback` 传入的 `userdata` 指针，可用来回传调用方自己的上下文。


##### media_codec_buffer_type_t

| 取值 | 说明 |
| `MC_VIDEO_FRAME_BUFFER` | 视频帧 buffer。编码时作输入，解码时作输出 |
| `MC_VIDEO_STREAM_BUFFER` | 视频码流 buffer。编码时作输出，解码时作输入 |
| `MC_AUDIO_FRAME_BUFFER` | 音频帧 buffer |
| `MC_AUDIO_STREAM_BUFFER` | 音频码流 buffer |

##### media_codec_output_buffer_info_t

输出 buffer 的附加信息，由 `hb_mm_mc_dequeue_output_buffer` 的出参返回，携带帧类型、时间戳、码流帧序等。实际生效的联合体成员由 buffer 类型决定。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `video_frame_info` | `mc_h264_h265_output_frame_info_t` | H.264 / H.265 解码输出帧信息（帧类型、pts 等） |
| `video_stream_info` | `mc_h264_h265_output_stream_info_t` | H.264 / H.265 编码输出码流信息（帧类型、pts、slice 数等） |
| `jpeg_frame_info` | `mc_mjpeg_jpeg_output_frame_info_t` | MJPEG / JPEG 解码输出帧信息 |
| `jpeg_stream_info` | `mc_mjpeg_jpeg_output_stream_info_t` | MJPEG / JPEG 编码输出码流信息 |
| `audio_frame_info` | `mc_audio_output_frame_info_t` | 音频解码输出帧信息 |
| `audio_stream_info` | `mc_audio_output_stream_info_t` | 音频编码输出码流信息 |

### 返回值说明

所有接口成功时返回 `0`，失败时返回**负值错误码**。错误码高位固定为 `0xF`，例如 `HB_MEDIA_ERR_INVALID_PARAMS` 十进制为 `-268435447`，十六进制即 `0xF0000009`。定义在板端 `/usr/hobot/include/hb_media_error.h`。

| 十六进制 | 宏定义 | 说明 |
| --- | --- | --- |
| `0xF0000001` | `HB_MEDIA_ERR_UNKNOWN` | 未知错误 |
| `0xF0000002` | `HB_MEDIA_ERR_CODEC_NOT_FOUND` | 找不到对应的 codec |
| `0xF0000003` | `HB_MEDIA_ERR_CODEC_OPEN_FAIL` | 无法打开 codec 设备 |
| `0xF0000004` | `HB_MEDIA_ERR_CODEC_RESPONSE_TIMEOUT` | codec 响应超时 |
| `0xF0000005` | `HB_MEDIA_ERR_CODEC_INIT_FAIL` | codec 初始化失败 |
| `0xF0000006` | `HB_MEDIA_ERR_OPERATION_NOT_ALLOWED` | 当前状态不允许该操作 |
| `0xF0000007` | `HB_MEDIA_ERR_INSUFFICIENT_RES` | 内部内存资源不足 |
| `0xF0000008` | `HB_MEDIA_ERR_NO_FREE_INSTANCE` | 没有可用的实例 |
| `0xF0000009` | `HB_MEDIA_ERR_INVALID_PARAMS` | 无效的参数 |
| `0xF000000A` | `HB_MEDIA_ERR_INVALID_INSTANCE` | 无效的实例 |
| `0xF000000B` | `HB_MEDIA_ERR_INVALID_BUFFER` | 无效的 buffer |
| `0xF000000C` | `HB_MEDIA_ERR_INVALID_COMMAND` | 无效的指令 |
| `0xF000000D` | `HB_MEDIA_ERR_WAIT_TIMEOUT` | 等待超时 |
| `0xF000000E` | `HB_MEDIA_ERR_FILE_OPERATION_FAILURE` | 文件操作失败 |
| `0xF000000F` | `HB_MEDIA_ERR_PARAMS_SET_FAILURE` | 参数设置失败 |
| `0xF0000010` | `HB_MEDIA_ERR_PARAMS_GET_FAILURE` | 参数获取失败 |
| `0xF0000011` | `HB_MEDIA_ERR_CODING_FAILED` | 编解码失败 |
| `0xF0000012` | `HB_MEDIA_ERR_OUTPUT_BUF_FULL` | 输出 buffer 满 |
| `0xF0000013` | `HB_MEDIA_ERR_UNSUPPORTED_FEATURE` | 不支持的功能 |
| `0xF0000014` | `HB_MEDIA_ERR_INVALID_PRIORITY` | 不支持的优先级 |

## 排障
### 常见返回码

| 返回码 | 含义与常见原因 |
| `HB_MEDIA_ERR_INVALID_PARAMS` | 参数非法。常见于分辨率未按 32×8 对齐、`bitstream_buf_size` 过小、ROI 表长度与分辨率不匹配 |
| `HB_MEDIA_ERR_OPERATION_NOT_ALLOWED` | 当前状态不允许该操作。检查调用顺序，尤其是 `hb_mm_mc_vpf_init` 与各 `set_*` 的位置 |
| `HB_MEDIA_ERR_NO_FREE_INSTANCE` | 实例耗尽。每路编解码占一个实例，VPU 上限 32、JPU 上限 64；检查是否有实例未 `release` |
| `HB_MEDIA_ERR_INSUFFICIENT_RES` | 内存资源不足。通常是 buffer 数量或大小配置过大 |
| `HB_MEDIA_ERR_WAIT_TIMEOUT` | dequeue 超时。见下节 |
| `HB_MEDIA_ERR_INVALID_BUFFER` | buffer 非法。常见于把未 dequeue 的 buffer 直接 queue，或 buffer 已被释放 |
| `HB_MEDIA_ERR_OUTPUT_BUF_FULL` | 输出 buffer 满。调用方未及时取走输出，检查 queue / dequeue 是否配对 |
| `HB_MEDIA_ERR_UNSUPPORTED_FEATURE` | 该 codec 不支持此功能。对照[codec 适用性](#codec-适用性) |

#### mc_inter_status_t

codec 的详细运行状态，由 `hb_mm_mc_get_status` 返回。可用于观察队列水位、排查堆积与超时。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `cur_input_buf_cnt` | `hb_u32` | 当前待处理的输入 buffer 数（待编码的帧或待解码的码流）。解码且送入方式为按帧大小时，该值也表示待解码帧数 |
| `cur_input_buf_size` | `hb_u64` | 当前输入 buffer 占用的字节数 |
| `cur_output_buf_cnt` | `hb_u32` | 当前待取走的输出 buffer 数（已编码码流或已解码帧） |
| `cur_output_buf_size` | `hb_u64` | 当前输出 buffer 占用的字节数 |
| `left_recv_frame` | `hb_u32` | 还需接收的帧数。仅当启动参数中设置了 `receive_frame_number` 时有效 |
| `left_enc_frame` | `hb_u32` | 还需编码的帧数。仅当启动参数中设置了 `receive_frame_number` 时有效 |
| `total_input_buf_cnt` | `hb_u32` | 累计接收的 buffer 数 |
| `total_output_buf_cnt` | `hb_u32` | 累计处理的 buffer 数（累计编码帧数或累计解码帧数） |
| `pipeline` | `hb_s32` | 相机 pipeline 编号，仅视频编码有效 |
| `channel_port_id` | `hb_s32` | 相机 pipeline 的通道端口号，仅视频编码有效 |

### dequeue 超时

`hb_mm_mc_dequeue_input_buffer` / `hb_mm_mc_dequeue_output_buffer` 返回 `HB_MEDIA_ERR_WAIT_TIMEOUT`（`-268435443`）时，按以下顺序排查：

1. **输入侧**：解码时要确认送入方式（`feed_mode`）与每次 queue 的数据量匹配——按帧送入时，每次必须送完整一帧；码流缺少 SPS / PPS 参数集时解码器无法解析，也会表现为一直取不到输出
2. **队列水位**：用 `hb_mm_mc_get_status` 看 `cur_input_buf_cnt` / `cur_output_buf_cnt`。输入侧持续堆积说明编码器没有消费，检查 `bitstream_buf_size` 是否过小
3. **分辨率匹配**：输入 YUV 的实际分辨率必须与配置一致，不一致会导致编码器一直等待有效输入
4. **buffer 是否配对**：取出未归还的 buffer 会让队列很快耗尽。检查每一条 dequeue 都有对应的 queue

### 调试节点

```bash
ls /dev/vpu /dev/jpu                    # 编解码设备节点
cat /sys/class/vpu/vpu/dev              # VPU 设备号
lsmod | grep -E 'vpu|jpu'               # 驱动模块：hobot_vpu / hobot_jpu / hobot_videosys
```

编码/解码的详细信息可以通过板端示例的 `-v` 参数打开：

```bash
./sample_codec -v
```

### 输出码流不正常

| 现象 | 排查方向 |
| 码流文件极小或为空 | `frame_num` 是否为 0；`hb_mm_mc_dequeue_output_buffer` 是否成功取出并消费 |
| 码流无法播放 | 码率参数是否极端；profile / level 是否为播放端支持的范围 |
| 画面出现绿边 / 花屏 | 分辨率是否满足 32×8 对齐；裁切参数是否正确 |
| 码率与配置不符 | CBR / AVBR 的码率控制需要若干帧才能收敛到目标值，短序列上偏差属正常 |

## 相关文档
- [sample_codec 使用说明](/Advanced_development/multimedia_development/multimedia_sample/sample_codec)
- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
- [视频输入 - VIN](/Advanced_development/multimedia_development/multimedia_api/vin_api)
- [采集→编码 Demo](/Demos/multimedia_demo/cdev/vio2encoder)
- [解码→显示 Demo](/Demos/multimedia_demo/cdev/decode2display)
- [简易 API - 编码](/Simple_API/multimedia_api/cdev/encoder_api)
- [简易 API - 解码](/Simple_API/multimedia_api/cdev/decoder_api)
