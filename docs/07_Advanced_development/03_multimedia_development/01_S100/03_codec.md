---
sidebar_position: 3
---
# 编解码

## 系统概述

### 概述

Codec（Coder-Decoder）是指编解码器，用于压缩或解压缩视频、图像、音频等媒体数据；S100
Soc 中存在两种硬件编解码单元，分别是 VPU（Video process unit）和 JPU（Jpeg process
unit），可提供4K\@90fps 的视频编解码能力和4K\@90fps 的图像编解码能力。

#### JPU 硬件特性

| **HW Feature** | **Feature Indicator**                        |
| -------------------- | -------------------------------------------------- |
| HW number            | 1                                                  |
| maximum input        | 8192x8192                                          |
| minimum input        | 32x32                                              |
| performance          | 4K\@90fps                                          |
| max instance         | 64                                                 |
| input image format   | 4:0:0, 4:2:0, 4:2:2, 4:4:0, and 4:4:4 color format |
| output image format  | 4:0:0, 4:2:0, 4:2:2, 4:4:0, and 4:4:4 color format |
| input crop           | Supports                                           |
| bitrate control      | FIXQP(MJPEG)                                       |
| rotation             | 90, 180, 270                                       |
| mirror               | Vertical, Horizontal, Vertical+Horizontal          |
| quantization table   | Supports Custom Settings                           |
| huffman table        | Supports Custom Settings                           |

#### VPU 硬件特性

| **HW Feature**           | **Feature Indicator**                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HW number                      | 1                                                                                                                                                                                                                                                                                                                                                                                                                               |
| maximum input                  | 8192x4096                                                                                                                                                                                                                                                                                                                                                                                                                       |
| minimum input                  | 256x128                                                                                                                                                                                                                                                                                                                                                                                                                         |
| input alignment required       | width 32, height 8                                                                                                                                                                                                                                                                                                                                                                                                              |
| performance                    | 4K\@90fps                                                                                                                                                                                                                                                                                                                                                                                                                       |
| max instance                   | 32                                                                                                                                                                                                                                                                                                                                                                                                                              |
| input image format             | 4:2:0, 4:2:2 color format                                                                                                                                                                                                                                                                                                                                                                                                       |
| output image format            | 4:2:0, 4:2:2 color format                                                                                                                                                                                                                                                                                                                                                                                                       |
| input crop                     | Supports                                                                                                                                                                                                                                                                                                                                                                                                                        |
| bitrate control                | CBR, VBR, AVBR, FIXQP, QPMAP                                                                                                                                                                                                                                                                                                                                                                                                    |
| rotation                       | 90, 180, 270                                                                                                                                                                                                                                                                                                                                                                                                                    |
| mirror                         | Vertical, Horizontal, Vertical+Horizontal                                                                                                                                                                                                                                                                                                                                                                                       |
| long-term reference prediction | Supports Custom Settings                                                                                                                                                                                                                                                                                                                                                                                                        |
| intra refresh                  | Supports                                                                                                                                                                                                                                                                                                                                                                                                                        |
| deblocking filter              | Supports                                                                                                                                                                                                                                                                                                                                                                                                                        |
| request IDR                    | Supports                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ROI mode                       | mode1: Users can set multiple zones’(up to 64) qp value(0~51), should not work with CBR or AVBR mode mode2: Users can set multiple zones’(up to 64) important level(0~8), should work with CBR or AVBR mode                                                                                                                                                                                                                   |
| GOP mode                       | 0: Custom GOP 1 : I-I-I-I,..I (all intra, gop_size=1) 2 : I-P-P-P,… P (consecutive P, gop_size=1) 3 : I-B-B-B,…B (consecutive B, gop_size=1) 4 : I-B-P-B-P,… (gop_size=2) 5 : I-B-B-B-P,… (gop_size=4) 6 : I-P-P-P-P,… (consecutive P, gop_size=4) 7 : I-B-B-B-B,… (consecutive B, gop_size=4) 8 : I-B-B-B-B-B-B-B-B,… (random access, gop_size=8) 9 : I-P-P-P,… P (consecutive P, gop_size = 1, with single reference) |

### 软件功能

#### 整体框架

MediaCodec 子系统会提供音视频和图像的编解码组件，原始流封装和视频录像等功能。该系统主要会封装底层 codec 硬件资源和软件编解码库，为上层提供编解码能力。开发者可以基于提供的编解码接口实现 H265和 H264视频的编解码功能，也可以使用 JPEG 编码功能将摄像头数据存成 JPEG 图片，还可以使用视频录像功能实现摄像头数据的录制。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/2f8364ee5efbb8cb14136e0dc942248e.png" alt="" style={{ width: '100%' }} />

#### 码率控制模式

MediaCodec 支持对 H264/H265和 MJPEG 协议的码率控制，分别支持 H264/H265编码通道的 CBR、VBR、AVBR、FixQp 和 QpMap 五种码率控制方式，以及支持 MJPGE 编码通道的 FixQp 码率控制方式。

##### CBR 说明

CBR 表示恒定码率，能够保证整体的编码码率稳定。下面是 CBR 模式下各个参数含义：

| **数据项**    | **描述**                                                                                                                                                                                                                                                 | **取值范围** | **默认值** |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------- |
| intra_period        | I 帧间隔                                                                                                                                                                                                                                                        | [0,2047]           | 28               |
| intra_qp            | I 帧的 QP 值                                                                                                                                                                                                                                                      | [0,51]             | 0                |
| bit_rate            | 目标平均比特率，单位是 kbps                                                                                                                                                                                                                                     | [0,700000]         | 0                |
| frame_rate          | 目标帧率，单位是 fps                                                                                                                                                                                                                                            | [1,240]            | 30               |
| initial_rc_qp       | 指定码率控制时的初始 QP 值，当该值不在[0,51]范围内,编码器内部会决定初始值                                                                                                                                                                                        | [0,63]             | 63               |
| vbv_buffer_size     | 指定 VBV Buffer 的大小，单位是 ms；实际的 VBV buffer 的空间大小为 bit_rate\*vbv_buffer_size/1000(kb)，该 buffer 的大小会影响编码图像质量和码率控制精度。当该 buffer 比较小时，码率控制精确度高，但图像编码质量较差；当该 buffer 比较大时，图像编码质量高，但是码率波动大。 | [10,3000]          | 10               |
| ctu_level_rc_enalbe | H264/H265的码率控制可以工作在 CTU 级别的控制，该模式可以达到更高精度的码率控制，但是会损失编码图像质量，该模式不可以和 ROI 编码一起工作，当使能 ROI 编码时，该功能自动失效。                                                                                         | [0,1]              | 0                |
| min_qp_I            | I 帧的最小 QP 值                                                                                                                                                                                                                                                  | [0,51]             | 8                |
| max_qp_I            | I 帧的最大 QP 值                                                                                                                                                                                                                                                  | [0,51]             | 51               |
| min_qp_P            | P 帧的最小 QP 值                                                                                                                                                                                                                                                  | [0,51]             | 8                |
| max_qp_P            | P 帧的最大 QP 值                                                                                                                                                                                                                                                  | [0,51]             | 51               |
| min_qp_B            | B 帧的最小 QP 值                                                                                                                                                                                                                                                  | [0,51]             | 8                |
| max_qp_B            | B 帧的最大 QP 值                                                                                                                                                                                                                                                  | [0,51]             | 51               |
| hvs_qp_enable       | H264/H265的码率控制可以工作在 subCTU 级别的控制，该模式会调整子宏块的 QP 值，进而提高主观图像质量。                                                                                                                                                                | [0,1]              | 1                |
| hvs_qp_scale        | 当 hvs_qp_enable 使能后有效，该值表示 QP 缩放因子。                                                                                                                                                                                                                | [0,4]              | 2                |
| max_delta_qp        | 当 hvs_qp_enable 使能后有效，指定 HVS qp 值的最大偏差范围。                                                                                                                                                                                                        | [0,51]             | 10               |
| qp_map_enable       | 使能 ROI 编码时的 QP map                                                                                                                                                                                                                                          | [0,1]              | 0                |

##### VBR 说明

VBR 表示可变码率，简单场景分配比较大的 qp，压缩率小，质量高。复杂场景分配较小 qp，可以保证编码图像的质量稳定。下面是 VBR 模式下各个参数含义：

| **数据项** | **描述**        | **取值范围** | **默认值** |
| ---------------- | --------------------- | ------------------ | ---------------- |
| intra_period     | I 帧间隔               | [0,2047]           | 28               |
| intra_qp         | I 帧的 QP 值             | [0,51]             | 0                |
| frame_rate       | 目标帧率，单位是 fps   | [1,240]            | 0                |
| qp_map_enable    | 使能 ROI 编码时的 QP map | 0,1                | 0                |

##### AVBR 说明

ABR 表示恒定平均目标码率，简单场景分配较低码率，复杂场景分配足够码率，使得有限的码率能够在不同场景下合理分配，这类似 VBR。同时一定时间内，平均码率又接近设置的目标码率，这样可以控制输出文件的大小，这又类似 CBR。可以认为是 CBR 和 VBR 的折中方案，产生码率和图像质量相对稳定的码流。下面是 AVBR 模式下各个参数含义：

| **数据项**    | **描述**                                                                                                                                                                                                                                                 | **取值范围** | **默认值** |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------- |
| intra_period        | I 帧间隔                                                                                                                                                                                                                                                        | [0,2047]           | 28               |
| intra_qp            | I 帧的 QP 值                                                                                                                                                                                                                                                      | [0,51]             | 0                |
| bit_rate            | 目标平均比特率，单位是 kbps                                                                                                                                                                                                                                     | [0,700000]         | 0                |
| frame_rate          | 目标帧率，单位是 fps                                                                                                                                                                                                                                            | [1,240]            | 30               |
| initial_rc_qp       | 指定码率控制时的初始 QP 值，当该值不在[0,51]范围内,编码器内部会决定初始值                                                                                                                                                                                        | [0,63]             | 63               |
| vbv_buffer_size     | 指定 VBVBuffer 的大小，单位是 ms；实际的 VBVbuffer 的空间大小为 bit_rate\*vbv_buffer_size/1000（kb），该 buffer 的大小会影响编码图像质量和码率控制精度。当该 buffer 比较小时，码率控制精确度高，但图像编码质量较差；当该 buffer 比较大时，图像编码质量高，但是码率波动大。 | [10,3000]          | 3000             |
| ctu_level_rc_enalbe | H264/H265的码率控制可以工作在 CTU 级别的控制，该模式可以达到更高精度的码率控制，但是会损失编码图像质量，该模式不可以和 ROI 编码一起工作，当使能 ROI 编码时，该功能自动失效。                                                                                         | [0,1]              | 0                |
| min_qp_I            | I 帧的最小 QP 值                                                                                                                                                                                                                                                  | [0,51]             | 8                |
| max_qp_I            | I 帧的最大 QP 值                                                                                                                                                                                                                                                  | [0,51]             | 51               |
| min_qp_P            | P 帧的最小 QP 值                                                                                                                                                                                                                                                  | [0,51]             | 8                |
| max_qp_P            | P 帧的最大 QP 值                                                                                                                                                                                                                                                  | [0,51]             | 51               |
| min_qp_B            | B 帧的最小 QP 值                                                                                                                                                                                                                                                  | [0,51]             | 8                |
| max_qp_B            | B 帧的最大 QP 值                                                                                                                                                                                                                                                  | [0,51]             | 51               |
| hvs_qp_enable       | H264/H265的码率控制可以工作在 subCTU 级别的控制，该模式会调整子宏块的 QP 值，进而提高主观图像质量。                                                                                                                                                                | [0,1]              | 1                |
| hvs_qp_scale        | 当 hvs_qp_enable 使能后有效，该值表示 QP 缩放因子。                                                                                                                                                                                                                | [0,4]              | 2                |
| max_delta_qp        | 当 hvs_qp_enable 使能后有效，指定 HVSqp 值的最大偏差范围。                                                                                                                                                                                                         | [0,51]             | 10               |
| qp_map_enable       | 使能 ROI 编码时的 QPmap                                                                                                                                                                                                                                           | [0,1]              | 0                |

##### FixQp 说明

FixQp 表示固定每一个 I 帧、P 帧的 QP 值，对于 I/P 帧可以分别设值。下面是 FixQp 模式下各个参数含义：

| **数据项** | **描述**      | **取值范围** | **默认值** |
| ---------------- | ------------------- | ------------------ | ---------------- |
| intra_period     | I 帧间隔             | [0,2047]           | 28               |
| frame_rate       | 目标帧率，单位是 fps | [1,240]            | 30               |
| force_qp_I       | 强制 I 帧的 QP 值       | [0,51]             | 0                |
| force_qp_P       | 强制 P 帧的 QP 值       | [0,51]             | 0                |
| force_qp_B       | 强制 B 帧的 QP 值       | [0,51]             | 0                |

##### QPMAP 说明

QPMAP 表示为一帧图像中的每一个块指定 QP 值，其中 H265块大小为32x32,H264块大小为16x16。下面是 QPMAP 模式下各个参数含义：

| **数据项**   | **描述**                                                                                                       | **取值范围**                                                                 | **默认值** |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------- |
| intra_period       | I 帧间隔                                                                                                              | [0,2047]                                                                           | 28               |
| frame_rate         | 目标帧率，单位是 fps                                                                                                  | [1,240]                                                                            | 30               |
| qp_map_array       | 指定 QPmap 表，H265的 subCTU 大小为32x32，需要为每一个 subCTU 指定一个 QP 值，每个 QP 值占一个字节，并且按照光栅扫描方向排序。 | 指针地址                                                                           | NULL             |
| qp_map_array_count | 指定 QPmap 表的大小。                                                                                                  | [0, MC_VIDEO_MAX_SUB_CTU_NUM]&&(ALIGN64(picWidth)\>\>5)\*(ALIGN64(picHeight)\>\>5) | 0                |

### 调试方法

#### 编码效果调优

根据当前客户使用 codec 进行视频编码的场景，多将码率模式设置为 CBR，当编码的场景较为复杂时，为了保证视频质量，硬件会自动提高码率值，导致输出的视频较预期更大。因此为了兼顾视频质量和实际码率，需要统筹 bit_rate 和 max_qp_I/P 值的设置。下面给出了全 I 帧模式下，不同复杂场景下，码率设置为15000kbps 时，不同 max_qp_I 下实际码率和 qp 的情况（不同场景复杂程度不同，下列数据仅供参考）：

| 场景&参数                              | 室外白天复杂场景 bitrate(15000) max_qp_I(35) | 室外白天复杂场景 bitrate(15000) max_qp_I(38) | 室外白天复杂场景 bitrate(15000) max_qp_I(39) |
| -------------------------------------- | -------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| Bit alloction(bps)（越大图像质量越高） | 60300045                                     | 42186920                                     | 35898230                                     |
| Qp avg（越小图像质量越高）             | 35                                           | 38                                           | 39                                           |

#### GOP 结构说明

H264/H265编码支持 GOP 结构的设置，用户可从预置的3种 GOP 结构种选择，也可自定义 GOP 结构。

GOP 结构表可定义一组周期性的 GOP 结构，该 GOP 结构将用于整个编码过程。单个结构表中的元素如下表所示，其中可以指定该图像的参考帧，如果 IDR 帧后的其他帧指定的参考帧为 IDR 帧前的数据帧，编码器内部会自动处理这种情况使其不参考其他帧，用户无需关心这种情况。用户在自定义 GOP 结构时需要指明结构表的数量，最多可定义3个结构表，结构表的顺序需要按照解码顺序排列。
下面表示了结构表中各个元素的含义：

| 元素           | 描述                                                                                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type           | 帧类型(I、P、B)                                                                                                                                                                                      |
| POC            | GOP 内帧的显示顺序，取值范围为[1,gop_size]。                                                                                                                                                          |
| QPoffset       | 自定义 GOP 中图片的量化参数                                                                                                                                                                            |
| NUM_REF_PIC_L0 | 标记为 P 帧使用多参考图片，仅在 PIC_TYPE 为 P 时有效。                                                                                                                                                     |
| temporal_id    | 帧的时间层，帧无法从具有较高时间 id（0\~6）的帧进行预测。                                                                                                                                            |
| 1st_ref_POC    | L0的第一张参考图片的 POC                                                                                                                                                                              |
| 2nd_ref_POC    | Type 为 B 时，第一张参考图片的 POC 是 L1的； Type 为 P 时，第二张参考图片的 POC 是 L0的； 可以使 reference_L1和 B slice 中的参考图片具有相同的 POC， 但出于压缩效率的考虑，建议 reference_L1和 reference_L0的 POC 不同。 |

##### GOP 预置结构

一共支持设置九种 GOP 预置结构

| 序号 | GOP 结构   | 低延迟（编码顺序和显示顺序相同） | GOP 大小 | 编码顺序                    | 最小源帧 buffer 数量 | 最小解码图片 buffer 数量 | 周期内（I 帧间隔）要求 |
| ---- | --------- | -------------------------------- | ------- | --------------------------- | ------------------ | ---------------------- | ---------------------- |
| 1    | I         | Yes                              | 1       | I0-I1-I2…                  | 1                  | 1                      |                        |
| 2    | P         | Yes                              | 1       | P0-P1-P2…                  | 1                  | 2                      |                        |
| 3    | B         | Yes                              | 1       | B0-B1-B2…                  | 1                  | 3                      |                        |
| 4    | BP        | NO                               | 2       | B1-P0-B3-P2…               | 1                  | 3                      |                        |
| 5    | BBBP      | Yes                              | 1       | B2-B1-B3-P0…               | 7                  | 4                      |                        |
| 6    | PPPP      | Yes                              | 4       | P0-P1-P2-P3…               | 1                  | 2                      |                        |
| 7    | BBBB      | Yes                              | 4       | B0-B1-B2-B3…               | 1                  | 3                      |                        |
| 8    | BBBB BBBB | Yes                              | 1       | B3-B2-B4- B1-B6-B5- B7-B0… | 12                 | 5                      |                        |
| 9    | P         | Yes                              | 1       | P0                          | 1                  | 2                      |                        |

GOP Preset 1

- 只有 I 帧，没有相互参考；
- 低延时；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/b02cc41ab083664ba3f8a3bef1543afa.png" alt="" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/fa1da95bc8801b2d6225b2abf1b2f2d3.png" alt="" style={{ width: '100%' }} />

GOP Preset 2

- 只有 I 帧和 P 帧；
- P 帧参考2个前向参考帧；
- 低延时；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/e3c2f773a89f6ee2fe2dab03200b6fd0.png" alt="" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/8fa5f892bd7282e82ac8ed96011c943d.png" alt="" style={{ width: '100%' }} />

GOP Preset 3

- 只有 I 帧和 B 帧；
- B 帧参考2个前向参考帧；
- 低延时；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/03bbdf35dc3e2a1b38f9e05d7038d064.png" alt="" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/e1b5707ea0c32b6a0c1658527a6186dd.png" alt="" style={{ width: '100%' }} />

GOP Preset 4

- 只有 I 帧、P 帧和 B 帧；
- P 帧参考2个前向参考帧；
- B 帧参考1个前向参考帧和一个后向参考帧；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/17e10e6a27db202fe9a0c2b5f3d5dd50.png" alt="" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/972bbe22d2e7364c1c0a3db03f57343e.png" alt="" style={{ width: '100%' }} />

GOP Preset 5

- 只有 I 帧、P 帧和 B 帧；
- P 帧参考2个前向参考帧；
- B 帧参考1个前向参考帧和一个后向参考帧，后向参考帧可为 P 帧或 B 帧；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/16ad2d15f0b22a91fda1450747a18422.png" alt="" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/8ff1393cdbb997c8768ea2f9f00c3c8b.png" alt="" style={{ width: '100%' }} />

GOP Preset 6

- 只有 I 帧和 P 帧；
- P 帧参考2个前向参考帧；
- 低延时；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/a5fbffa7c85a3423729f06d45f83a601.png" alt="" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/1e88c6cbacb8fff86f5d5fc301e01abd.png" alt="" style={{ width: '100%' }} />

GOP Preset 7

- 只有 I 帧和 B 帧；
- B 帧参考2个前向参考帧；
- 低延时；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/40cd6c4fa7cf66f9bf14c3675cb7ef20.png" alt="" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/be7fe30d2685e27e2b36f305ef745eb4.png" alt="" style={{ width: '100%' }} />

GOP Preset 8

- 只有 I 帧和 B 帧；
- B 帧参考1个前向参考帧，一个后向参考帧；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/9c46efaf2a9106bcee2468098e209b1f.png" alt="" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/d016b90fa0a06e183b6871bc430a8714.png" alt="" style={{ width: '100%' }} />

GOP Preset 9

- 只有 I 帧和 P 帧；
- P 帧参考1个前向参考帧；
- 低延时；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/0bc1b9d3e73b4037b64236650738b5cd.png" alt="" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/937b45950423ff5006e378cb510d695d.png" alt="" style={{ width: '100%' }} />

#### VPU 调试方式

VPU（视频处理单元）是一种专用的视觉处理单元，可以高效处理视频内容。VPU 可以实现 H265视频格式的编解码处理。用户通过 Codec 提供的接口即可获得输入的编码/解码流。

##### 编码状态

编码调试信息

```c
cat /sys/kernel/debug/vpu/venc
root@ubuntu:~# cat /sys/kernel/debug/vpu/venc
----encode enc param----
enc_idx  enc_id     profile       level width height pix_fmt fbuf_count extern_buf_flag bsbuf_count bsbuf_size mirror rotate
      0    h265        Main unspecified  4096   2160       0          5               1           5   13271040      0      0

----encode h265cbr param----
enc_idx rc_mode intra_period intra_qp bit_rate frame_rate initial_rc_qp vbv_buffer_size ctu_level_rc_enalbe min_qp_I max_qp_I min_qp_P max_qp_P min_qp_B max_qp_B hvs_qp_enable hvs_qp_scale qp_map_enable max_delta_qp
      0 h265cbr           20       30     5000         30            30            3000                   1        8       50        8       50        8       50             1            2             0           10
----encode gop param----
enc_idx  enc_id gop_preset_idx custom_gop_size decoding_refresh_type
      0    h265              2               0                     2
----encode intra refresh----
enc_idx  enc_id intra_refresh_mode intra_refresh_arg
      0    h265                  0                 0

----encode longterm ref----
enc_idx  enc_id use_longterm longterm_pic_period longterm_pic_using_period
      0    h265            0                   0                         0
----encode roi_params----
enc_idx  enc_id roi_enable roi_map_array_count
      0    h265          0                   0
----encode mode_decision 1----
enc_idx  enc_id mode_decision_enable pu04_delta_rate pu08_delta_rate pu16_delta_rate pu32_delta_rate pu04_intra_planar_delta_rate pu04_intra_dc_delta_rate pu04_intra_angle_delta_rate pu08_intra_planar_delta_rate pu08_intra_dc_delta_rate pu08_intra_angle_delta_rate pu16_intra_planar_delta_rate pu16_intra_dc_delta_rate pu16_intra_angle_delta_rate
      0    h265                    0               0               0               0               0                            0                        0                           0                            0                        0                           0                            0                        0                           0

----encode mode_decision 2----
enc_idx  enc_id pu32_intra_planar_delta_rate pu32_intra_dc_delta_rate pu32_intra_angle_delta_rate cu08_intra_delta_rate cu08_inter_delta_rate cu08_merge_delta_rate cu16_intra_delta_rate cu16_inter_delta_rate cu16_merge_delta_rate cu32_intra_delta_rate cu32_inter_delta_rate cu32_merge_delta_rate
      0    h265                            0                        0                           0                     0                     0                     0                     0                     0                     0                     0                     0                     0
----encode h265_transform----
enc_idx  enc_id chroma_cb_qp_offset chroma_cr_qp_offset user_scaling_list_enable
      0    h265                   0                   0                        0
----encode h265_pred_unit----
enc_idx  enc_id intra_nxn_enable constrained_intra_pred_flag strong_intra_smoothing_enabled_flag max_num_merge
      0    h265                1                           0                                   1             2
----encode h265 timing----
enc_idx  enc_id vui_num_units_in_tick vui_time_scale vui_num_ticks_poc_diff_one_minus1
      0    h265                  1000          30000                                 0
----encode h265 slice params----
enc_idx  enc_id h265_independent_slice_mode h265_independent_slice_arg h265_dependent_slice_mode h265_dependent_slice_arg
      0    h265                           0                          0                         0                        0
----encode h265 deblk filter----
enc_idx  enc_id slice_deblocking_filter_disabled_flag slice_beta_offset_div2 slice_tc_offset_div2 slice_loop_filter_across_slices_enabled_flag
      0    h265                                     0                      0                    0                                            1

----encode h265 sao param----
enc_idx  enc_id sample_adaptive_offset_enabled_flag

      0    h265                              1
----encode status----
enc_idx  enc_id cur_input_buf_cnt cur_output_buf_cnt left_recv_frame left_enc_frame total_input_buf_cnt total_output_buf_cnt     fps
      0    h265                 4                  1               0              0                1093                 1089      35
```

参数解释

| 调试信息分组             | 状态参数            | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| encode enc param         | 基础编码参数        | enc_idx：编码实例值 enc_id：编码类型 profile：profile 类型 level：h265 level 类型 width：编码宽度 height：编码高度 pix_fmt：输入帧像素类型 fbuf_count：输入的 rameBuffer 数 extern_buf_flag：是否使用外部输入 buffer bsbuf_count：bitstreamBuffer 数 bsbuf_size：bitstreamBuffer 大小 mirror：是否设置镜像 rotate：是否设置旋转                                                                                                                                                                                            |
| encode h265cbr param     | CBR 码率控制参数     | enc_idx：编码实例值 rc_mode：码率控制类型 intra_period：I 帧间隔 intra_qp：I 帧 qp 值 bit_rate：码率值 frame_rate：帧率 initial_rc_qp：初始 QP 值 vbv_buffer_size：VBV buffer 的大小 ctu_level_rc_enalbe：码率控制是否工作在 ctu 级别 min_qp_I：I 帧最小 QP 值 max_qp_I：I 帧最大 QP 值 min_qp_P：P 帧最小 QP 值 max_qp_P：P 帧最大 QP 值 min_qp_B：B 帧最小 QP 值 max_qp_B：B 帧最大 QP 值 hvs_qp_enable：码率控制是否工作在 subCTU 级别 hvs_qp_scale：QP 缩放因子 qp_map_enable：使能 ROI 编码时的 QP map max_delta_qp：指定 HVS QP 值的最大偏差范围 |
| encode gop param         | GOP 参数             | enc_idx：编码实例值 enc_id：编码类型 gop_preset_idx：选择预置的 GOP 结构 custom_gop_size：自定义时 GOP 的大小 decoding_refresh_type：设置 IDR 帧的具体类型                                                                                                                                                                                                                                                                                                                                                                |
| encode intra refresh     | 帧内刷新参数        | enc_idx：编码实例值 enc_id：编码类型 intra_refresh_mode：帧内刷新模式 intra_refresh_arg：帧内刷新参数                                                                                                                                                                                                                                                                                                                                                                                                               |
| encode longterm ref      | 长期参考帧参数      | enc_idx：编码实例值 enc_id：编码类型 use_longterm：使能长期参考帧 longterm_pic_period：长期参考帧周期 longterm_pic_using_period：参考长期参考帧的周期                                                                                                                                                                                                                                                                                                                                                               |
| encode roi_params        | ROI 参数             | enc_idx：编码实例值 enc_id：编码类型 roi_enable：使能 ROI 编码 roi_map_array_count：ROI map 中元素的个数                                                                                                                                                                                                                                                                                                                                                                                                               |
| encode mode_decision 1   | 块编码模式决策参数1 | 各种模式选择参数值，包括 pu04_delta_rate，pu08_delta_rate 等                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| encode mode_decision 2   | 块编码模式决策参数2 | 各种模式选择参数值，包括 pu32_intra_planar_delta_rate， pu32_intra_dc_delta_rate 等                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| encode h265_transform    | Transform 参数       | enc_idx：编码实例值 enc_id：编码类型 chroma_cb_qp_offset：指定 cb 分量的 QP 偏差 chroma_cr_qp_offset：指定 cr 分量的 QP 偏差 user_scaling_list_enable：使能用户指定的 scaling list                                                                                                                                                                                                                                                                                                                                           |
| encode h265_pred_unit    | 预测单元参数        | enc_idx：编码实例值 enc_id：编码类型 intra_nxn_enable：使能 intra NXN PUs constrained_intra_pred_flag：帧内预测是否受限 strong_intra_smoothing_enabled_flag：滤波过程是否使用双向线性插值 max_num_merge：指定 merge 候选的数量                                                                                                                                                                                                                                                                                         |
| encode h265 timing       | Timing 参数          | enc_idx：编码实例值 enc_id：编码类型 vui_num_units_in_tick：指定时间单位数 vui_time_scale：一秒内的时间单位数 vui_num_ticks_poc_diff_one_minus1：指定与等于1的图片顺序计数值之差对应的时钟滴答数                                                                                                                                                                                                                                                                                                                    |
| encode h265 slice params | Slice 参数           | enc_idx：编码实例值 enc_id：编码类型 h265_independent_slice_mode：独立 slice 编码模式 h265_independent_slice_arg：独立 slice 的大小 h265_dependent_slice_mode：非独立 slice 编码模式 h265_dependent_slice_arg：非独立 slice 的大小                                                                                                                                                                                                                                                                                          |
| encode h265 deblk filter | 去块滤波参数        | enc_idx：编码实例值 enc_id：编码类型 slice_deblocking_filter_disabled_flag：是否进行 slice 内部滤波 slice_beta_offset_div2：指定当前切片的β去块参数偏移量 slice_tc_offset_div2：指定当前切片的 tC 去块参数偏移量 slice_loop_filter_across_slices_enabled_flag：是否进行边界滤波                                                                                                                                                                                                                                        |
| encode h265 sao param    | SAO 参数             | enc_idx：编码实例值 enc_id：编码类型 sample_adaptive_offset_enabled_flag：是否对经过去块滤波处理后的重构图像进行采样自适应偏移处理                                                                                                                                                                                                                                                                                                                                                                                  |
| encode status            | 当前编码状态参数    | enc_idx：编码实例值 enc_id：编码类型 cur_input_buf_cnt：当前使用的 inputbuffer 数量 cur_output_buf_cnt：当前使用的 outputbuffer 数量 left_recv_frame：剩余需要接收的帧数（设置 receive_frame_number 后有效） left_enc_frame：剩余需要编码的帧数（设置 receive_frame_number 后有效） total_input_buf_cnt：表示当前总使用的 inputbuffer 数 total_output_buf_cnt：表示当前总使用的 outputbuffer 数 fps：表示当前的帧率                                                                                                             |

##### 解码状态

解码调试信息

```c
cat /sys/kernel/debug/vpu/vdec
root@ubuntu:~# cat /sys/kernel/debug/vpu/vdec
----decode param----
dec_idx dec_id feed_mode pix_fmt bitstream_buf_size bitstream_buf_count frame_buf_count
   0   h265     1      0     13271040          6   6
----h265 decode param----
dec_idx dec_id reorder_enable skip_mode bandwidth_Opt cra_as_bla dec_temporal_id_mode target_dec_temporal_id_plus1
   0   h265        1          0          1            0        0                      0
----decode frameinfo----
dec_idx dec_id display_width display_height
    0   h265       4096       2160
----decode status----
dec_idx dec_id cur_input_buf_cnt cur_output_buf_cnt total_input_buf_cnt total_output_buf_cnt fps
   0   h265          5                1              458       453         53
```

参数解释

| 调试信息分组      | 状态参数         | 说明                                                                                                                                                                                                                                                                             |
| ----------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| decode param      | 基础解码参数     | dec_idx：解码实例值 dec_id：解码类型 feed_mode：数据填充类型 pix_fmt：输出像素类型 bitstream_buf_size：输入的 bitstream 缓存区大小 bitstream_buf_count：输入的 bitstream 缓存区个数 frame_buf_count：输出的 Framebuffer 缓存的个数                                                     |
| h265 decode param | H265解码基础参数 | dec_idx：解码实例值 dec_id：解码类型 reorder_enable：使能解码器按显示顺序输出帧序列 skip_mode：使能帧解码忽略模式 bandwidth_Opt：使能节省带宽模式 cra_as_bla：使能 CRA 作为 BLA 处理 dec_temporal_id_mode：指定 temporal id 的选择模式 target_dec_temporal_id_plus1：指定 temporal id 值 |
| decode frameinfo  | 解码输出帧信息   | dec_idx：解码实例值 dec_id：解码类型 display_width：显示的宽度 display_height：显示的高度                                                                                                                                                                                        |
| decode status     | 当前解码状态参数 | dec_idx：解码实例值 dec_id：解码类型 cur_input_buf_cnt：当前使用的 inputbuffer 数量 cur_output_buf_cnt：当前使用的 outputbuffer 数量 total_input_buf_cnt：当前总使用的 inputbuffer 数 total_output_buf_cnt：当前总使用的 outputbuffer 数 fps：当前帧率                                   |

#### JPU 调试方式

JPU（图片处理单元）主要用以完成 JPEG/MJPEG 的编解码功能。用户可以通过 CODEC 接口输入待编码的 YUV 数据或待解码的 JPEG 图片，通过 JPU 处理后获取编码完的 JPEG 图片或解码完的 YUV 数据。

##### 编码状态

编码调试信息

```c
cat /sys/kernel/debug/jpu/jenc
root@ubuntu:~# cat /sys/kernel/debug/jpu/jenc
----encode param----
enc_idx  enc_id width height pix_fmt fbuf_count extern_buf_flag bsbuf_count bsbuf_size mirror rotate
      0    jpeg  1920   1088       1          5               0           5    3137536      0      0

----encode rc param----
enc_idx   rc_mode frame_rate quality_factor
      0 noratecontrol          0              0
----encode status----
enc_idx  enc_id cur_input_buf_cnt cur_output_buf_cnt left_recv_frame left_enc_frame total_input_buf_cnt total_output_buf_cnt     fps
      0    jpeg                 4                  1               0              0                4344                 4340     287
```

参数解释

| 调试信息分组    | 状态参数          | 说明                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| encode param    | 基础编码参数      | enc_idx：编码实例 enc_id：编码类型 width：图像宽度 height：图像高度 pix_fmt：像素类型 fbuf_count：输入的 Framebuffer 缓存的个数 extern_buf_flag：是否使用用户分配的输入 buffer bsbuf_count：输出的 bitstream 缓存区个数 bsbuf_size：输出的 bitstream 的大小 mirror：是否设置镜像 rotate：是否设置旋转                                                                                                          |
| encode rc param | mjpeg 码率控制参数 | enc_idx：编码实例 rc_mode：码率控制模式 frame_rate：目标帧率 quality_factor：量化因子                                                                                                                                                                                                                                                                                                                   |
| encode status   | 当前编码状态参数  | enc_idx：编码实例值 enc_id：编码类型 cur_input_buf_cnt：当前使用的 inputbuffer 数量 cur_output_buf_cnt：当前使用的 outputbuffer 数量 left_recv_frame：剩余需要接收的帧数（设置 receive_frame_number 后有效） left_enc_frame：剩余需要编码的帧数（设置 receive_frame_number 后有效） total_input_buf_cnt：表示当前总使用的 inputbuffer 数 total_output_buf_cnt：表示当前总使用的 outputbuffer 数 fps：表示当前的帧率 |

##### 解码状态

解码调试信息

```c
cat /sys/kernel/debug/jpu/jdec
root@ubuntu:~# cat /sys/kernel/debug/jpu/jdec

----decode param----
dec_idx  dec_id feed_mode pix_fmt bitstream_buf_size bitstream_buf_count frame_buf_count mirror rotate
      0    jpeg         1       1            3133440                   5               5      0      0

----decode frameinfo----
dec_idx  dec_id display_width display_height
      0    jpeg          1920           1088

----decode status----
dec_idx  dec_id cur_input_buf_cnt cur_output_buf_cnt total_input_buf_cnt total_output_buf_cnt     fps
      0    jpeg                 0                  1                3779                 3779     264
```

参数解释

| 调试信息分组     | 状态参数         | 说明                                                                                                                                                                                                                                                 |
| ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| decode param     | 解码基础参数     | dec_idx：解码实例 dec_id：解码类型 feed_mode： pix_fmt：图像像素 bitstream_buf_size：输入的 bitstream 缓存区大小 bitstream_buf_count：输入的 bitstream 缓存区个数 frame_buf_count：输出的 Framebuffer 缓存的个数 mirror：是否设置镜像 rotate：是否设置旋转 |
| decode frameinfo | 解码输出帧信息   | dec_idx：解码实例值 dec_id：解码类型 display_width：显示的宽度 display_height：显示的高度                                                                                                                                                            |
| decode status    | 当前编码状态参数 | dec_idx：解码实例值 dec_id：解码类型 cur_input_buf_cnt：当前使用的 inputbuffer 数量 cur_output_buf_cnt：当前使用的 outputbuffer 数量 total_input_buf_cnt：当前总使用的 inputbuffer 数 total_output_buf_cnt：当前总使用的 outputbuffer 数 fps：当前帧率       |

### 典型场景

#### 单路编码

单路编码场景如下图所示。Scenario0是简单场景，从 EMMC 中读取 YUV 视频/图像文件，经过 VPU 硬件编码输出的 H26x 码流或 JPU 硬件编码输出的 Jpeg 图像，最后保存为文件存储到 EMMC。Scenario1是串联前后级模块的复杂场景，将摄像头采集的数据编码压缩后进行保存或通过网络和 PCIE 传输。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/788c1e3b839232111ccd53d35d25e278.png" alt="" style={{ width: '100%' }} />

#### 单路解码

单路解码场景如下图所示。Scenario0是简单场景，从 EMMC 中读取 H26x 码流/Jpeg 图像文件，经过 VPU 或 JPU 硬件解码输出的 YUV 数据，最后保存为文件存储到 EMMC。Scenario1是串联前后级模块的复杂场景，通过网络或 PCIE 接收已编码的视频或图像数据，经过 VPU 或 JPU 硬件解码后使用 IDE 显示播放。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/e50f9bf3c4d1ecfbd36b354f9009e8bc.png" alt="" style={{ width: '100%' }} />

#### 多路编码

多路编码场景如下图所示，Scenario0是文件输入的简单场景，Scenario1是串联前后级模块的复杂场景，需要注意的是在 Scenario1场景要综合考虑链路中各个模块的能力限制。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/272e3467c640af379d1b4c0a1de27eae.png" alt="" style={{ width: '100%' }} />

#### 多路解码

多路解码场景如下图所示，Scenario0是文件输入的简单场景，Scenario1是串联前后级模块的复杂场景，需要注意的是在 Scenario1场景要综合考虑链路中各个模块的能力限制。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/04f0aba90a1d65017dfeb90f9afa43e2.png" alt="" style={{ width: '100%' }} />

### 常见问题

#### 配置和用法问题

##### video 编码性能规格问题

问题背景：对于4K@30FPS 的编码，是否支持编码成4路独立的1080p@30fps 码流？

问题解答：不支持4K@30FPS 编码成4路独立的1080p@30fps 码流。codec 支持多路编码，但是本身不支持 crop，如果想实现1080p 4路的编码，输入的流就需要是4路1080p 的 size。

##### GOP 配置问题

问题背景：在 S100上 H265帧每次 publish 的时候，每个 GOP 的组合是怎么样的呢？会使用到 P 帧吗？每帧里支持独立解码吗？会在每帧中插入 SPS 和 PPS 吗？

问题解答：GOP 结构是需要用户配置的，可以支持全 I 帧和 IP 帧的模块；如果是全 IDR 帧的话，是支持独立解码的，需要配置全 I 帧的 gop 结构和 Intra period=1；
每个 IDR 帧是否要插入 sps/pps/vps，可以通过接口 hb_mm_mc_request_idr_header 选择，默认都会加。

##### 如何插入 userdata 信息

问题背景：在编码过程中，如何通过接口插入 userdata 信息？

问题解答：

```
//"+"后面部分为用户自己插入的信息
uint8_t uuid[] = "dc45e9bd-e6d948b7-962cd820-d923eeef+HorizonAI";
hb_u32 length = sizeof(uuid)/sizeof(uuid[0]);
ret = hb_mm_mc_insert_user_data(context, uuid, length);
```

##### 帧信息打印问题

问题背景：每帧编解码信息都打印会产生海量日志

问题解答：编解码进程初始化时会根据 LOGLEVEL 设置日志等级，当配置``LOGLEVEL<5``时不会输出帧信息。

##### 外部输入 Buffer 映射失败问题

问题背景：用户在使用外部输入 buffer 模式时遇到"Fail to map phys"报错，驱动报"Failed to map ion phy due to same phys"。

问题解答： 外部输入 buffer 是指通过内存映射来复用其它模块/程序申请的 ION Buffer，从而减少内存申请和拷贝；
用户使用外部输入 Buffer 模式时需要注意一下场景限制。

1.不能把同一个 Buffer 地址信息给到两个不同的编解码实例做映射；

2.不能把外部 Buffer 动态申请释放，避免得到交叠的地址导致报错；建议申请固定个数 Buffer 然后循环使用，实例退出后统一释放。

##### 内部 Buffer 申请失败问题

问题背景：用户使用较多编解码通道时出现内存申请失败问题。

问题解答：libmm 从 ion 中申请到内存后还会执行 map 和 import 操作去获取 iova 和 vaddr 地址；但可能会由于达到系统 ion 内存/进程 fd 上限/内部 buffer pool 个数上限而出现内存申请失败问题。

1.ion 内存上限：需要减少通道路或优化系统 ion 内存使用；

2.进程 fd 上限：通过 ulimit -n 调整进程 fd 上限值即可；

3.内部 buffer pool 个数上限：在解码特定码流时可能遇到，建议采用限制 dpb size（max_dec_frame_buffering）的码流。

#### VPU 编解码问题

##### dequeue output buffer 超时可能是什么原因

问题背景：编解码过程中，dequeue output buffer 超时可能是什么原因导致的？

问题解答：

1.CPU 压力较大时，导致线程调度频繁，相关工作线程调度延时；

2.前几次 dequeue output 后，未及时 queue output 归还不及时，未进行接口对称操作导致；

3.无输入 buffer 时，直接 dequeue output

##### video 解码时首帧获取出现 timeout 现象

问题背景：串行调用 dequeue/queue inputbuffer/outputbuffer 接口时，第一次 dequeue outputbuffer 必现 timeout 是什么原因？

问题解答：由于硬件特性，h265解码时第一帧会输出一个空帧，会延迟一帧给出数据。

##### video 解码时首帧 pts 不对齐问题

问题背景：解码时取出来的第一帧数据 pts 一直是0，和赋值不一致，获取到第二帧时，才和送进去第二帧中的 pts 对应上

问题解答：当首帧头信息和 IDR 帧分开送入时，可以支持第一帧 pts 对齐，一并送入时，由于和硬件处理特性关联，第一帧会是0.

##### 解码时出现 FAILED TO DEC_PIC_HDR: ret(1) SEQERR(00005000)报错

问题背景：video 解码过程中，出现 FAILED TO DEC_PIC_HDR: ret(1) SEQERR(00005000)报错

问题解答：这是解析帧头信息错误，解码器解码时，第一帧都带有 VPS SPS PPS 信息，但是有些码流因为格式问题，如果单独给 VPS SPS PPS 不能正常解码，需要给 VPS+SPS+PPS+IDR。

##### 编码时出现 Bitstream buffer is too small 报错

问题背景：编码过程中，出现 Bitstream buffer is too small 的报错

问题解答：bitstream_buf_size 设置过小导致，增大 size 值即可。

##### 编码时出现 Failed to VPU_EncRegisterFrameBuffer (1)报错

问题背景：编码过程中，出现 Failed to VPU_EncRegisterFrameBuffer (1)的报错

问题解答：vlc_buf_size 设置过小，增大 size 值即可。

##### video color range 问题

问题背景：请问 S100使用 VPU 进行 H265编码时，编码器是否会强制转换为 limit range(TVrange)输出？

测试方法：用一端 S100编码的265码流，直接用 ffmpeg 播放，发现解析出为 TV range

问题处理：编解码器并没有办法区分 full range 和 limit range，也没法识别这张图是 full range 或 limit range，只有用户自己知道输入的是什么 range，然后编解码处理像素的范围都是[0,255]，是按照给入的像素直接做处理，不会有转换，解码的时候也不会做转换；
但是对于 ffmpeg 他是有一个 swscaler 模块的他是可以转换的，yuv420p 是 limit range， yuvj420p 是 full range，他内部会根据 video full range 信息做输入和输出格式的转换的。

所以如果用户现在知道自己输入的是 full range 或者 limit range 是可以设置 vui 信息的，这样通过 ffmpeg 解码时根据 vui 信息指定 ffmpeg 的输出格式来决定是否转码。

目前已经根据用户需求，将 VUI 信息中默认的 color range 模式改为 full range。

##### 当编码大片蓝天时，出现了一些异常的条纹

问题背景：当编码大片蓝天时，出现了一些异常的条纹形状是什么原因？

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/image14.png" alt="image14" style={{ width: '100%' }} />

问题解答：原始图片中存在较多的噪点，压缩后噪点分布不规律，看着像是条纹状，其实是对噪点压缩导致，这种现象属于 codec 硬件特性，无法消除.

##### CBR 或 AVBR 模式编码输出码率不符合预期

问题背景：用户使用 CBR 和 AVBR 模式时发现实际输出码流的码率和设置的目标码率偏差超过10%。

问题解答：

1.全 I 帧编码（gop_preset_idx=1）时需要将 I 帧间隔（intra_period）置1；

2.检查目标码率设置是否合理，调整质量参数是有上下限的；
（仅供测试参考：针对 h264的以1:100压缩率设置码率，针对 h265的以1:150压缩率设置码率）

3.编码帧数是否足够多，码率控制过程调节质量参数需要一定时间。

##### 高优先级编码限制问题

多路编码场景中可以指定某一路优先级为高使其优先处理以获取最短延迟。方法是把要求低时延的编码任务的 priority 参数设置31（高优先级）。示例如下：

```
media_codec_context_t context;
context.priority = PRIO_31;
```

但需要注意如下限制条件:

1.存在多路高优任务时无法保证低时延目标。

2.用户需要确保高优任务程序的软件调度环境才能保证时延稳定。
（建议：总 cpu 负载不超过90%，把创建高优编码任务的线程的调度策略改 FIFO，优先级改20。）

3.业务场景 DDR 负载过高且 VPU 在总线中为低优先级时，带宽竞争会影响硬件处理延迟。
（建议：比 VPU 高优的写带宽流量不超过 DDR 负载45%。将 sysfs 节点中的 rt_task_expect_latency_ms 置0可减少指令排队。）

#### JPU 编解码问题

##### jpg 工具查看1080p 图片时出现绿边

问题背景：使用 jpg 工具查看1920x1080图片时，底下会出现绿边；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/image12.png" alt="image12" style={{ width: '100%' }} />

问题说明：这是因为当前 ip 进行编码时按照16位对齐进行，假如到最后如果是8位对齐而不是16位对齐，那么编码器就会在后面补齐，这部分补齐的数据是随机产生的，不属于有效数据；

##### 1080p 图片多次编码后 md5不同

问题背景：同一个1080p yuv 图片被多次编码后，即使编码的参数都相同，产生的 jpg 图片其 md5结果有可能不同

问题原因：因为当前 ip 进行编码时按照16位对齐进行，假如到最后是8位对齐而不是16位对齐，那么编码器就会在后面进行补齐，这部分补齐的数据是随机产生的，不属于有效数据。

##### 外部输入 Buffer 映射个数限制

问题背景：用户在使用外部输入 Buffer 模式（零拷贝）时，传入超过32个 Buffer 地址报异常"Fail to get map idx"

问题解答：libmm 内部做了 jpg 输入 buffer 映射信息缓存，默认上限是32个，在退出时统一解映射。建议申请有限个 buffer 的内存然后循环使用。

## Codec API

### MediaCodec 接口说明

MediaCodec 模块主要用于音频、视频和 JPEG 图像的编解码。本模块将会提供一系列的接口便于用户输入待处理的数据和获取处理完的数据。本模块支持多路编码或解码实例同时工作，其中视频和 JPEG 图像的编解码由硬件实现，用户需要调用 libmultimedia.so，音频则基于 FFMPEG 的接口由软件实现，用户需要调用 libffmedia.so，如下表所示为 RDKS100所支持的视频编解码规范和音频编解码规范，需要注意的是 AAC 的编解码需要 license 授权，因此用户需要获得授权后才能使能相关代码。

H265 profile 最高支持 Main profile，Level 最高支持 L5.1，Tier 支持 Main-tier。H264 profile 最高支持 High profile，Level 最高支持 L5.2。MJPEG/JPEG 支持 ISO/IEC 10918~1 Baseline sequential。音频支持：G.711 A-law/Mu-law，G.729 ADPCM，ADPCM IMA WAV，FLAC，AAC LC，AAC Main，AAC SSR，AAC LTP，AAC LD，AAC HE，AAC HEv2（AAC 需要 license 授权）。

此外视频和图像的数据源包括 VIO 输入的图像和用户输入的 YUV 数据两类，用户输入的 YUV 数据则可能是从文件中加载或者通过网络传输获得；音频的数据源包括 MIC 输入的音频和用户输入的 PCM 数据两类，MIC 输入的音频是由 Audio Codec 采集的数字信号，用户输入的 PCM 数据则可能是从文件或网络传输获得。

#### GOP

H264/H265编码支持 GOP 结构的设置，用户可从预置的9种 GOP 结构中选择，也可自定义 GOP 结构。

##### GOP 结构表

GOP 结构表可定义一组周期性的 GOP 结构，该 GOP 结构将用于整个编码过程。单个结构表中的元素如下表所示，其中可以指定该图像的参考帧，如果 IDR 帧后的其他帧指定的参考帧为 IDR 帧前的数据帧，编码器内部会自动处理这种情况使其不参考其他帧，用户无需关心这种情况。用户在自定义 GOP 结构时需要指明结构表的数量，最多可定义3个结构表，结构表的顺序需要按照解码顺序排列。

| Element        | Description                                                                                                                                                                                                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type           | Slice type（I，P）                                                                                                                                                                                                                                                                                                               |
| POC            | Display order of the frame within a GOP，ranging from 1 to GOP size                                                                                                                                                                                                                                                              |
| QPoffset       | A quantization parameter of the picture in the custom GOP                                                                                                                                                                                                                                                                        |
| NUM_REF_PIC_L0 | Flag to use multi reference picture for P picture. It is valid only if PIC_TYPE is P                                                                                                                                                                                                                                             |
| temporal_id    | Temporal layer of the frame. A frame cannot predict from a frame with a higher temporal id (0~6).                                                                                                                                                                                                                                |
| 1st_ref_POC    | The POC of the 1st reference picture of L0                                                                                                                                                                                                                                                                                       |
| 2nd_ref_POC    | The POC of 1st reference picture of L1 in case that Type is equal to B. The POC of 2nd reference picture of L0 in case that Type is equal to P. Note that reference_L1 can have the same POC as reference in B slice. But for compression efficiency it is recommended that reference_L1 have a different POC from reference_L0. |

##### GOP 预置结构

| Index | GOP Stru cture | Low Delay (encoding order and display order are same) | GOP Size | Encoding Order              | Minimum Source Frame Buffer | Minimum Decoded Picture Buffer | Intra Period (I Frame Interval) Requirement |
| ----- | -------------- | ----------------------------------------------------- | -------- | --------------------------- | --------------------------- | ------------------------------ | ------------------------------------------- |
| 1     | I              | Yes                                                   | 1        | I0-I1-I2…                  | 1                           | 1                              |                                             |
| 2     | P              | Yes                                                   | 1        | P0-P1-P2…                  | 1                           | 2                              |                                             |
| 3     | B              | Yes                                                   | 1        | B0-B1-B2…                  | 1                           | 3                              |                                             |
| 4     | BP             | NO                                                    | 2        | B1-P0-B3-P2…               | 1                           | 3                              | Multiple of 2                               |
| 5     | BBBP           | Yes                                                   | 1        | B2-B1-B3-P0…               | 7                           | 4                              | Multiple of 4                               |
| 6     | PPPP           | Yes                                                   | 4        | P0-P1-P2-P3…               | 1                           | 2                              |                                             |
| 7     | BBBB           | Yes                                                   | 4        | B0-B1-B2-B3…               | 1                           | 3                              |                                             |
| 8     | BBBB BBBB      | Yes                                                   | 1        | B3-B2-B4- B1-B6-B5- B7-B0… | 12                          | 5                              | Multiple of 8                               |
| 9     | P              | Yes                                                   | 1        | P0                          | 1                           | 2                              |                                             |

以下会对9种预置的 GOP 结构进行说明。

GOP Preset 1

- 只有 I 帧，没有相互参考；
- 低延时；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop1.png" alt="gop1" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop2.png" alt="gop2" style={{ width: '100%' }} />

GOP Preset 2

- 只有 I 帧和 P 帧；
- P 帧参考2个前向参考帧；
- 低延时；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop3.png" alt="gop3" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop4.png" alt="gop4" style={{ width: '100%' }} />

GOP Preset 3

- 只有 I 帧和 B 帧；
- B 帧参考2个前向参考帧；
- 低延时；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop5.png" alt="gop5" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop6.png" alt="gop6" style={{ width: '100%' }} />

GOP Preset 4

- 只有 I 帧、P 帧和 B 帧；
- P 帧参考2个前向参考帧；
- B 帧参考1个前向参考帧和一个后向参考帧；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop7.png" alt="gop7" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop8.png" alt="gop8" style={{ width: '100%' }} />

GOP Preset 5

- 只有 I 帧、P 帧和 B 帧；
- P 帧参考2个前向参考帧；
- B 帧参考1个前向参考帧和一个后向参考帧，后向参考帧可为 P 帧或 B 帧；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop9.png" alt="gop9" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop10.png" alt="gop10" style={{ width: '100%' }} />

GOP Preset 6

- 只有 I 帧和 P 帧；
- P 帧参考2个前向参考帧；
- 低延时；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop11.png" alt="gop11" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop12.png" alt="gop12" style={{ width: '100%' }} />

GOP Preset 7

- 只有 I 帧和 B 帧；
- B 帧参考2个前向参考帧；
- 低延时；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop13.png" alt="gop13" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop14.png" alt="gop14" style={{ width: '100%' }} />

GOP Preset 8

- 只有 I 帧和 B 帧；
- B 帧参考1个前向参考帧，一个后向参考帧；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop15.png" alt="gop15" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop16.png" alt="gop16" style={{ width: '100%' }} />

GOP Preset 9

- 只有 I 帧和 P 帧；
- P 帧参考1个前向参考帧；
- 低延时；

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop17.png" alt="gop17" style={{ width: '100%' }} />

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/gop18.png" alt="gop18" style={{ width: '100%' }} />

#### 长期参考帧

用户可指定长期参考帧的周期和参考长期参考帧的周期，如下图所示：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/reference_frame.png" alt="reference_frame" style={{ width: '100%' }} />

#### Intra Refresh

Intra
Refresh 模式通过在非 I 帧内部周期性的插入帧内编码的 MB/CTU 来提高容错性。它能够为解码器提供更多的修复点来避免时域错误造成的图像损坏。用户可以指定 MB/CTU 的连续行数、列数或者步长来强制编码器插入帧内编码单元，用户还可指定帧内编码单元的大小由编码器内部决定哪一块需要帧内编码。

#### 码率控制

MediaCodec 支持对 H264、H265和 MJPEG 协议的码率控制，分别支持 H264、H265编码通道的 CBR、VBR、AVBR、FixQp 和 QpMap 五种码率控制方式，以及支持 MJPEG 编码通道的 FixQp 码率控制方式。CBR 能够保证整体的编码码率稳定；VBR 则是保证编码图像的质量稳定；而 AVBR 会兼顾码率和图像质量，产生码率和图像质量相对稳定的码流；FixQp 则是固定每一个 I 帧、P 帧的 QP 值；QPMAP 则是为一帧图像中的每一个块指定 QP 值，其中 H265块大小为32x32，H264块大小为16x16。

对于 CBR 和 AVBR 来说，编码器内部会为每一帧图片找到合适的 QP 值，从而保证恒定码率。编码器内部支持三种级别的码率控制，分别为帧级别、CTU/MB 级别和 subCTU/subMB 级别。其中帧级别的控制主要会根据目标码率为每一帧图片产生一个 QP 值，从而保证码率恒定；CTU/MB 级别的控制则根据每一个64x64的 CTU 或16x16的 MB 的目标码率为每个 block 产生一个 QP 值，能够得到更好的码率控制，但是频繁的 QP 值调整会造成图像质量不稳定的问题；subCTU/subMB 级别的控制则为每一个32x32的 subCTU 或8x8的 subMB 产生一个 QP 值，其中复杂的块会得到较高的 QP 值，静态的块则会得到较低的 QP 值，因为相比于复杂的区域人眼对于静态的区域更敏感，复杂和静态区域的检测主要依赖于内部硬件模块，这个级别控制主要是为了提高主观图像质量同时保证码率恒定，该模式控制下 SSIM 得分较高，但是 PSNR 得分会降低。

#### ROI

ROI 编码的实现依赖于和 QPMAP 类似，需要用户按照光栅扫描的方向为每一个块设定 QP 值，如下图：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/roi_map.png" alt="roi_map" style={{ width: '100%' }} />

对于 H264编码来说，每一个块的大小为16x16，而 H265中则为32x32。在 ROI
map 表中，每一个 QP 值占用一个字节，大小为0\~51。ROI 编码可以和 CBR 和 AVBR 一起工作，当不使能 CBR 或 AVBR 时，每个块区域的实际 QP 值就为 ROI
map 中指定的值，当使能 CBR 或 AVBR 时，则每个块区域的实际值由以下公式得到：

QP(i) = MQP(i)+ RQP(i) - ROIAvgQP

其中 MQP 为 ROI map 中的值， RQP 为编码器内部码率控制得到的值， ROIAvaQP 为 ROI
map 中 QP 的平均值。

#### 输入输出 buffer 管理

MediaCodec 的 buffer 包括输入和输出 buffer 两种，一般情况下，这些 buffer 会由 MediaCodec 通过 ION 接口统一分配，用户不需要关心 buffer 的分配，只需要在操作 buffer 前执行 dequeue 操作获取空闲的 buffer，处理完后执行 queue 操作返还该 buffer。但是为了减少某些情况下 buffer 的拷贝操作，比如 PYM 的输出 buffer 用来编码时，该 buffer 是由 PYM 内部通过 ION 分配，可直接作为 MediaCodec 的输入 buffer，因此 MediaCodec 还支持编码时的输入 buffer 由用户分配，但是用户必须通过 ION 接口分配物理连续的 buffer，还需要在 MediaCodec 配置前指定 media\_codec\_context\_t 中的 external\_frame\_buf 变量。需要注意的是，当用户指定输入 buffer 不需要 MediaCodec 分配之后，在 buffer 操作时，用户仍然需要执行 dequeue 操作获取队列信息，然后对队列中的信息进行赋值（主要是虚拟地址和物理地址），再执行 queue 操作。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/buffer.png" alt="buffer" style={{ width: '100%' }} />

#### 帧率控制

MediaCodec 内部目前不支持帧率控制，当用户不使用 hb\_mm\_mc\_set\_camera 接口使能 VIO 和 MediaCodec 的直接交互时，用户可自行控制 buffer 的输入帧率；当用户使能 VIO 和 MediaCodec 的交互后，用户不需要控制输入 buffer，只需要操作输出 buffer，此时 MediaCodec 内部也不会对输入 buffer 进行帧率控制，当编码出现卡顿或者输入 buffer 队列满等情况时，MediaCodec 会等待队列控线后再次操作。

#### 帧 Skip 设置

用户可调用 hb\_mm\_mc\_skip\_pic 设置下一次 queue 操作输入的图像的编码模式为 skip 模式，该模式只对非 I 帧编码有效；skip 模式下编码器内部会忽略输入帧，而是利用上一帧的重构帧生成该次输入的的重构帧，输入帧则被编码成 P 帧。

#### JPEG 编解码限制

- JPEG/MJPEG 编码时，当输入为 yuv420和 yuv422格式时，要求输入的宽16对齐，输入的高8对齐，当输入为 yuv440、yuv444和 yuv400格式时，要求输入的宽和高8对齐，如果同时 crop，要求输入的 x 和 y 坐标8对齐；
- JPEG/MJPEG 编码同时旋转90/270，当输入为 yuv420格式时，要求输入的宽16对齐，高8对齐，当输入的格式为 yuv422和 yuv440时，要求输入的宽16对齐，输入的高16对齐，当输入的格式为 yuv444和 yuv400时，要求输入的宽和高8对齐，如果同时 crop，当输入为 yuv420格式时，要求 crop 的宽16对齐，

crop 的高8对齐，当输入的格式为 yuv422和 yuv440时，要求 crop 的宽16对齐，crop 的高16对齐，当输入的格式为 yuv444和 yuv400时，要求 crop 的宽和高8对齐；

- JPEG/MJPEG 编码同时旋转90/270，当输入格式为 yuv422格式时，旋转后的格式会变成 yuv440，当输入格式为 yuv440格式时，旋转后的格式变成 yuv422；
- JPEG/MJPEG 解码同时旋转或镜像时，要求输出的 yuv 格式需要和输入的图像格式一致，但是 YUV422格式的 JPEG/MJPEG 旋转90/270解码时，要求输出的格式为 YUV440p/YUYV/YVYU/UYVY/VYUY；
- JPEG/MJPEG 解码时，旋转或镜像不能和 Crop 同时工作；
- JPEG/MJPEG 解码时，输出 buffer 的宽高要求和输入格式的 MCU

width 和 height 对齐，如果使能了 Crop，crop 的参数（包括起始坐标和宽高）需要和输入格式的 MCU
width 和 height 对齐；（MCU size for 420: 16x16, 422: 16x8, 440: 8x16, 400: 8x8, 444: 8x8.）

- JPEG/MJPEG 解码时，输出格式为 Packed
  YUV444，要求输入格式为 YUV444格式；
- JPEG/MJPEG 解码只支持 MC\_FEEDING\_MODE\_FRAME\_SIZE 模式；
- JPEG 编码时，如果用户指定 bitstream buffer 得 size，需要额外分配4k 大小。
- JPEG 编码时，由于编码器内部处理以16x16为单元做编码处理，当待编码数据为非16x16对齐时，编码完的数据最后一部分填充的部分会存在差异，但是不会影响有效数据，这个是硬件限制；因此做 md5比较时需要注意这点。

### API 参考

#### hb\_mm\_mc\_get\_descriptor

【函数声明】

const
media\_codec\_descriptor\_t\*hb\_mm\_mc\_get\_descriptor(media\_codec\_id\_t
codec\_id);

【参数描述】

- \[IN\] media\_codec\_id\_t codec\_id：表示 codec 类型

【返回值】

- 非空：codec 描述信息
- NULL：表示查询不到该 codec id 对应的描述符

【功能描述】

根据 codec\_id 获取 MediaCodec 支持的 codec 信息，信息包括 codec 名字，详细描述，MIME 类型以及 codec 支持的 profile 类型等。

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
int main(int argc, char *argv[])
{
    const media_codec_descriptor_t *desc = NULL;
    desc = hb_mm_mc_get_descriptor(MEDIA_CODEC_ID_H265);
    return 0;
}
```

#### hb\_mm\_mc\_get\_default\_context

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_default\_context(media\_codec\_id\_t codec\_id,
hb\_bool encoder, media\_codec\_context\_t \*context)

【参数描述】

- \[IN\] media\_codec\_id\_t codec\_id：表示 codec 类型
- \[IN\] hb\_bool encoder：指定 codec 是编码器还是解码器
- \[OUT\] media\_codec\_context\_t
  \*context：指定 codec 类型默认的 context

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_INVALID\_PARAMS： 无效参数

【功能描述】

获取指定的 codec 的默认属性。

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
int main(int argc, char *argv[])
{
    int ret = 0;
    media_codec_context_t context;
    memset(&context, 0x00, sizeof(context));
    ret = hb_mm_mc_get_default_context(MEDIA_CODEC_ID_H265, 1, &context)
    return 0;
}
```

#### hb\_mm\_mc\_initialize

【函数声明】

hb\_s32 hb\_mm\_mc\_initialize(media\_codec\_context\_t \*context)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INSUFFICIENT\_RES：内部内存资源不足
- HB\_MEDIA\_ERR\_NO\_FREE\_INSTANCE：没有可用的 instance（Video 最多32个，MJPEG/JPEG 最多64个，Audio 最多32个）

【功能描述】

初始化编码或解码器，调用成功后 MediaCodec 进入 MEDIA\_CODEC\_STATE\_INITIALIZED 状态。

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
static Uint64 osal_gettime(void)
{
    struct timespec tp;
    clock_gettime(CLOCK_MONOTONIC, &tp);
    return ((Uint64)tp.tv_sec*1000 + tp.tv_nsec/1000000);
}
typedef struct MediaCodecTestContext {
    media_codec_context_t *context;
    char *inputFileName;
    char *outputFileName;
} MediaCodecTestContext;
typedef struct AsyncMediaCtx {
    media_codec_context_t *ctx;
    FILE *inFile;
    FILE *outFile;
    int lastStream;
    Uint64 startTime;
    int32_t duration;
} AsyncMediaCtx;
static void on_encoder_input_buffer_available(hb_ptr userdata,
media_codec_buffer_t *inputBuffer) {
    AsyncMediaCtx *asyncCtx = (AsyncMediaCtx *)userdata;
    Int noMoreInput = 0;
    hb_s32 ret = 0;
    Uint64 curTime = 0;
    if (!noMoreInput) {
        curTime = osal_gettime();
        if ((curTime - asyncCtx->startTime)/1000 < (uint32_t)asyncCtx->duration) {
            ret = fread(inputBuffer->vframe_buf.vir_ptr[0], 1,
            inputBuffer->vframe_buf.size, asyncCtx->inFile);
            if (ret <= 0) {
                if(fseek(asyncCtx->inFile, 0, SEEK_SET)) {
                printf("Failed to rewind input filen");
            } else {
                ret = fread(inputBuffer->vframe_buf.vir_ptr[0], 1,
                inputBuffer->vframe_buf.size, asyncCtx->inFile);
                if (ret <= 0) {
                    printf("Failed to read input filen");
                }
            }
        }
    }
    if (!ret) {
        printf("%s There is no more input data!n", TAG);
        inputBuffer->vframe_buf.frame_end = TRUE;
        noMoreInput = 1;
    } else {
        inputBuffer->vframe_buf.frame_end = TRUE;
        inputBuffer->vframe_buf.size = 0;
    }
}
static void on_encoder_output_buffer_available(hb_ptr userdata,
media_codec_buffer_t *outputBuffer,
media_codec_output_buffer_info_t *extraInfo) {
    AsyncMediaCtx *asyncCtx = (AsyncMediaCtx *)userdata;
    mc_265_output_stream_info_t info = extraInfo->video_stream_info;
    fwrite(outputBuffer->vstream_buf.vir_ptr,
    outputBuffer->vstream_buf.size, 1, asyncCtx->outFile);
    if (outputBuffer->vstream_buf.stream_end) {
        printf("There is no more output data!n");
        asyncCtx->lastStream = 1;
    }
}
static void on_encoder_media_codec_message(hb_ptr userdata, hb_s32
       error) {
    AsyncMediaCtx *asyncCtx = (AsyncMediaCtx *)userdata;
    if (error) {
        asyncCtx->lastStream = 1;
        printf("ERROR happened!n");
    }
}
static void on_vlc_buffer_message(hb_ptr userdata, hb_s32 * vlc_buf)
{
    MediaCodecTestContext *ctx = (MediaCodecTestContext *)userdata;
    printf("%s %s VLC Buffer size = %d; Reset to %d.n", TAG,
    __FUNCTION__,
    *vlc_buf, ctx->vlc_buf_size);
    *vlc_buf = ctx->vlc_buf_size;
}
static void do_async_encoding(void *arg) {
    hb_s32 ret = 0;
    FILE *outFile;
    FILE *inFile;
    int step = 0;
    AsyncMediaCtx asyncCtx;
    MediaCodecTestContext *ctx = (MediaCodecTestContext *)arg;
    media_codec_context_t *context = ctx->context;
    char *inputFileName = ctx->inputFileName;
    char *outputFileName = ctx->outputFileName;
    media_codec_state_t state = MEDIA_CODEC_STATE_NONE;
    inFile = fopen(inputFileName, "rb");
    if (!inFile) {
        goto ERR;
    }
    outFile = fopen(outputFileName, "wb");
    if (!outFile) {
        goto ERR;
    }
    memset(&asyncCtx, 0x00, sizeof(AsyncMediaCtx));
    asyncCtx.ctx = context;
    asyncCtx.inFile = inFile;
    asyncCtx.outFile = outFile;
    asyncCtx.lastStream = 0;
    asyncCtx.duration = 5;
    asyncCtx.startTime = osal_gettime();
    ret = hb_mm_mc_initialize(context);
    if (ret) {
        goto ERR;
    }
    media_codec_callback_t callback;
    callback.on_input_buffer_available =
    on_encoder_input_buffer_available;
    callback.on_output_buffer_available =
    on_encoder_output_buffer_available;
    callback.on_media_codec_message = on_encoder_media_codec_message;
    ret = hb_mm_mc_set_callback(context, &callback, &asyncCtx);
    if (ret) {
        goto ERR;
    }
    media_codec_callback_t callback2;
    callback2.on_vlc_buffer_message = on_vlc_buffer_message;
    if (ctx->vlc_buf_size > 0) {
        ret = hb_mm_mc_set_vlc_buffer_listener(context, &callback2, ctx);
        if (ret) {
            goto ERR;
        }
    }
    ret = hb_mm_mc_configure(context);
    if (ret) {
        goto ERR;
    }
    mc_av_codec_startup_params_t startup_params;
    startup_params.video_enc_startup_params.receive_frame_number = 0;
    ret = hb_mm_mc_start(context, &startup_params);
    if (ret) {
        goto ERR;
    }
    while(!asyncCtx.lastStream) {
        sleep(1);
    }
    hb_mm_mc_stop(context);
    hb_mm_mc_release(context);
    context = NULL;
ERR:
    hb_mm_mc_get_state(context, &state);
    if (context && state !=
    MEDIA_CODEC_STATE_UNINITIALIZED) {
        hb_mm_mc_stop(context);
        hb_mm_mc_release(context);
    }
    if (inFile)
        fclose(inFile);
    if (outFile)
        fclose(outFile);
}
int main(int argc, char *argv[])
{
    int ret = 0;
    char outputFileName[MAX_FILE_PATH] = "./tmp.yuv";
    char inputFileName[MAX_FILE_PATH] = "./output.h265";
    mc_video_codec_enc_params_t *params = NULL;
    media_codec_context_t context;
    memset(&context, 0x00, sizeof(media_codec_context_t));
    context.codec_id = MEDIA_CODEC_ID_H265;
    context.encoder = 1;
    params = &context.video_enc_params;
    params->width = 640;
    params->height = 480;
    params->pix_fmt = MC_PIXEL_FORMAT_YUV420P;
    params->frame_buf_count = 5;
    params->external_frame_buf = 0;
    params->bitstream_buf_count = 5;
    params->rc_params.mode = MC_AV_RC_MODE_H265CBR;
    ret = hb_mm_mc_get_rate_control_config(&context, &params->rc_params);
    if (ret) {
        return -1;
    }
    params->rc_params.h265_cbr_params.bit_rate = 5000;
    params->rc_params.h265_cbr_params.frame_rate = 30;
    params->rc_params.h265_cbr_params.intra_period = 30;
    params->gop_params.decoding_refresh_type = 2;
    params->gop_params.gop_preset_idx = 2;
    params->rot_degree = MC_CCW_0;
    params->mir_direction = MC_DIRECTION_NONE;
    params->frame_cropping_flag = FALSE;
    MediaCodecTestContext ctx;
    memset(&ctx, 0x00, sizeof(ctx));
    ctx.context = &context;
    ctx.inputFileName = inputFileName;
    ctx.outputFileName = outputFileName;
    do_async_encoding(&ctx);
    return 0;
}
```

#### hb\_mm\_mc\_set\_callback

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_callback(media\_codec\_context\_t \*context,
const media\_codec\_callback\_t \*callback, hb\_ptr userdata)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const media\_codec\_callback\_t \*callback：用户回调函数
- \[IN\] hb\_ptr
  userdata：用户数据指针，该值会在回调函数被调用时作为入参传入

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许

【功能描述】

设置回调函数指针，调用该函数后 MediaCodec 会进入异步工作模式。

【示例代码】

参考 [hb_mm_mc_initialize](#hb_mm_mc_initialize)

#### hb\_mm\_mc\_configure

【函数声明】

hb\_s32 hb\_mm\_mc\_configure(media\_codec\_context\_t \*context)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INSUFFICIENT\_RES：内部内存资源不足
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例

【功能描述】

根据输入信息配置编码或解码器，调用成功后 MediaCodec 进入 MEDIA\_CODEC\_STATE\_CONFIGURED 状态。

【示例代码】

参考 [hb_mm_mc_initialize](#hb_mm_mc_initialize)

#### hb\_mm\_mc\_start

【函数声明】

hb\_s32 hb\_mm\_mc\_start(media\_codec\_context\_t \*context, const
mc\_av\_codec\_startup\_params\_t \*info)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] mc\_av\_codec\_startup\_params\_t
  \*info：指定音视频编解码时的启动参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INSUFFICIENT\_RES：内部内存资源不足
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例

【功能描述】

启动编码/解码流程，MediaCodec 将创建编解码实例、设置序列或解析数据流、注册 Framebuffer、编码头信息等，调用成功后 MediaCodec 进入 MEDIA\_CODEC\_STATE\_STARTED 状态。

【示例代码】

参考 [hb_mm_mc_initialize](#hb_mm_mc_initialize)

#### hb\_mm\_mc\_stop

【函数声明】

hb\_s32 hb\_mm\_mc\_stop(media\_codec\_context\_t \*context)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例

【功能描述】

停止编码/解码流程，退出所有子线程并释放相关资源，调用成功后 MediaCodec 回到 MEDIA\_CODEC\_STATE\_INITIALIZED 状态。

【示例代码】

参考 [hb_mm_mc_initialize](#hb_mm_mc_initialize)

#### hb\_mm\_mc\_pause

【函数声明】

hb\_s32 hb\_mm\_mc\_pause(media\_codec\_context\_t \*context)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例

【功能描述】

停止编码/解码流程，暂停所有子线程，调用成功后 MediaCodec 进入到 MEDIA\_CODEC\_STATE\_PAUSED 状态。

【示例代码】

参考 [hb_mm_mc_queue_input_buffer](#hb_mm_mc_queue_input_buffer)

#### hb\_mm\_mc\_flush

【函数声明】

hb\_s32 hb\_mm\_mc\_flush(media\_codec\_context\_t \*context)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例

【功能描述】

刷新输入输出 buffer 缓冲区，强制编码器/解码器刷新未处理的输入输出 buffer，函数调用后 MediaCodec 进入 MEDIA\_CODEC\_STATE\_FLUSHING 状态，操作成功后，MediaCodec 会再次进入 MEDIA\_CODEC\_STATE\_STARTED 状态。

【示例代码】

参考 [hb_mm_mc_queue_input_buffer](#hb_mm_mc_queue_input_buffer)

#### hb\_mm\_mc\_release

【函数声明】

hb\_s32 hb\_mm\_mc\_release(media\_codec\_context\_t \*context)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例

【功能描述】

释放 MediaCodec 内部所有资源，用户需要在调用该函数前调用 hb\_mm\_mc\_stop 来停止编解码，操作成功后 MediaCodec 进入 MEDIA\_CODEC\_STATE\_UNINITIALIZED 状态。

【示例代码】

参考 [hb_mm_mc_initialize](#hb_mm_mc_initialize)

#### hb\_mm\_mc\_get\_state

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_state(media\_codec\_context\_t \*context,
media\_codec\_state\_t \*state)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] media\_codec\_state\_t \*state：MediaCodec 当前状态

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 MediaCodec 当前的状态。

【示例代码】

参考 [hb_mm_mc_initialize](#hb_mm_mc_initialize)

#### hb\_mm\_mc\_get\_status

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_status(media\_codec\_context\_t \*context,
mc\_inter\_status\_t \*status)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_inter\_status\_t \*status：MediaCodec 当前内部状态

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 MediaCodec 当前内部的状态信息。

【示例代码】

参考 [hb_mm_mc_get_fd](#hb_mm_mc_get_fd)

#### hb\_mm\_mc\_queue\_input\_buffer

【函数声明】

hb\_s32 hb\_mm\_mc\_queue\_input\_buffer(media\_codec\_context\_t
\*context, media\_codec\_buffer\_t \*buffer, hb\_s32 timeout)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] media\_codec\_buffer\_t \*buffer：输入的 buffer 信息
- \[IN\] hb\_s32 timeout：超时时间

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数
- HB\_MEDIA\_ERR\_INVALID\_BUFFER：无效 buffer
- HB\_MEDIA\_ERR\_WAIT\_TIMEOUT：等待超时

【功能描述】

填充需要处理的 buffer 到 MediaCodec 中。

【示例代码】

```
#include "hb_media_codec.h"

#include "hb_media_error.h"
typedef struct MediaCodecTestContext {
    media_codec_context_t *context;
    char *inputFileName;
    char *outputFileName;
    int32_t duration; // s
} MediaCodecTestContext;
Uint64 osal_gettime(void)
{
    struct timespec tp;
    clock_gettime(CLOCK_MONOTONIC, &tp);
    return ((Uint64)tp.tv_sec*1000 + tp.tv_nsec/1000000);
}
static void do_sync_encoding(void *arg) {
    hb_s32 ret = 0;
    FILE *inFile;
    FILE *outFile;
    int noMoreInput = 0;
    int lastStream = 0;
    Uint64 lastTime = 0;
    Uint64 curTime = 0;
    int needFlush = 1;
    MediaCodecTestContext *ctx = (MediaCodecTestContext *)arg;
    media_codec_context_t *context = ctx->context;
    char *inputFileName = ctx->inputFileName;
    char *outputFileName = ctx->outputFileName;
    media_codec_state_t state = MEDIA_CODEC_STATE_NONE;
    inFile = fopen(inputFileName, "rb");
    if (!inFile) {
        goto ERR;
    }
    outFile = fopen(outputFileName, "wb");
    if (!outFile) {
        goto ERR;
    }
    //get current time
    lastTime = osal_gettime();
    ret = hb_mm_mc_initialize(context);
    if (ret) {
        goto ERR;
    }
    ret = hb_mm_mc_configure(context);
    if (ret) {
        goto ERR;
    }
    mc_av_codec_startup_params_t startup_params;
    startup_params.video_enc_startup_params.receive_frame_number = 0;
    ret = hb_mm_mc_start(context, &startup_params);
    if (ret) {
        goto ERR;
    }
    ret = hb_mm_mc_pause(context);
    if (ret) {
        goto ERR;
    }
    do {
        if (!noMoreInput) {
            media_codec_buffer_t inputBuffer;
            memset(&inputBuffer, 0x00, sizeof(media_codec_buffer_t));
            ret = hb_mm_mc_dequeue_input_buffer(context, &inputBuffer, 100);
            if (!ret) {
                curTime = osal_gettime();
                if ((curTime - lastTime)/1000 < (uint32_t)ctx->duration) {
                    ret = fread(inputBuffer.vframe_buf.vir_ptr[0], 1,
                    inputBuffer.vframe_buf.size, inFile);
                    if (ret <= 0) {
                        if(fseek(inFile, 0, SEEK_SET)) {
                            printf("Failed to rewind input filen");
                        } else {
                        ret = fread(inputBuffer.vframe_buf.vir_ptr[0], 1,
                        inputBuffer.vframe_buf.size, inFile);
                        if (ret <= 0) {
                            printf("Failed to read input filen");
                        }
                }
            }
        } else {
            printf("Time up(%d)n",ctx->duration);
            ret = 0;
        }
        if (!ret) {
            printf("There is no more input data!n");
            inputBuffer.vframe_buf.frame_end = TRUE;
            noMoreInput = 1;
        }
        ret = hb_mm_mc_queue_input_buffer(context, &inputBuffer, 100);
        if (ret) {
            printf("Queue input buffer fail.n");
            break;
        } else {
            if (ret != (int32_t)HB_MEDIA_ERR_WAIT_TIMEOUT) {
                printf("Dequeue input buffer fail.n");
                break;
            }
        }

        if (!lastStream) {
            media_codec_buffer_t outputBuffer;
            media_codec_output_buffer_info_t info;
            memset(&outputBuffer, 0x00, sizeof(media_codec_buffer_t));
            memset(&info, 0x00, sizeof(media_codec_output_buffer_info_t));
            ret = hb_mm_mc_dequeue_output_buffer(context, &outputBuffer, &info,
            3000);
            if (!ret && outFile) {
                fwrite(outputBuffer.vstream_buf.vir_ptr,
                outputBuffer.vstream_buf.size, 1, outFile);
                ret = hb_mm_mc_queue_output_buffer(context, &outputBuffer, 100);
                if (ret) {
                    printf("Queue output buffer fail.n");
                    break;
                }
                if (outputBuffer.vstream_buf.stream_end) {
                    printf("There is no more output data!n");
                    lastStream = 1;
                    break;
                }
            } else {
                if (ret != (int32_t)HB_MEDIA_ERR_WAIT_TIMEOUT) {
                    printf("Dequeue output buffer fail.n");
                    break;
                }
            }
        }
        if (needFlush) {
            ret = hb_mm_mc_flush(context);
            needFlush = 0;
            if (ret) {
                break;
            }
        }
    }while(TRUE);
    hb_mm_mc_stop(context);
    hb_mm_mc_release(context);
    context = NULL;
ERR:
    hb_mm_mc_get_state(context, &state);
    if (context && state !=
        MEDIA_CODEC_STATE_UNINITIALIZED) {
        hb_mm_mc_stop(context);
        hb_mm_mc_release(context);
    }
    if (inFile)
        fclose(inFile);
    if (outFile)
    fclose(outFile);
}
int main(int argc, char *argv[])
{
    hb_s32 ret = 0;
    char outputFileName[MAX_FILE_PATH] = "./tmp.yuv";
    char inputFileName[MAX_FILE_PATH] = "./output.stream";
    mc_video_codec_enc_params_t *params;
    media_codec_context_t context;
    memset(&context, 0x00, sizeof(media_codec_context_t));
    context.codec_id = MEDIA_CODEC_ID_H265;
    context.encoder = TRUE;
    params = &context.video_enc_params;
    params->width = 640;
    params->height = 480;
    params->pix_fmt = MC_PIXEL_FORMAT_YUV420P;
    params->frame_buf_count = 5;
    params->external_frame_buf = FALSE;
    params->bitstream_buf_count = 5;
    params->rc_params.mode = MC_AV_RC_MODE_H265CBR;
    ret = hb_mm_mc_get_rate_control_config(&context, &params->rc_params);
    if (ret) {
        return -1;
    }
    params->rc_params.h265_cbr_params.bit_rate = 5000;
    params->rc_params.h265_cbr_params.frame_rate = 30;
    params->rc_params.h265_cbr_params.intra_period = 30;
    params->gop_params.decoding_refresh_type = 2;
    params->gop_params.gop_preset_idx = 2;
    params->rot_degree = MC_CCW_0;
    params->mir_direction = MC_DIRECTION_NONE;
    params->frame_cropping_flag = FALSE;
    MediaCodecTestContext ctx;
    memset(&ctx, 0x00, sizeof(ctx));
    ctx.context = &context;
    ctx.inputFileName = inputFileName;
    ctx.outputFileName = outputFileName;
    ctx.duration = 5;
    do_sync_encoding(&ctx);
}
```

#### hb\_mm\_mc\_dequeue\_input\_buffer

【函数声明】

hb\_s32 hb\_mm\_mc\_dequeue\_input\_buffer(media\_codec\_context\_t
\*context, media\_codec\_buffer\_t \*buffer, hb\_s32 timeout)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] hb\_s32 timeout：超时时间
- \[OUT\] media\_codec\_buffer\_t \*buffer：输入的 buffer 信息

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数
- HB\_MEDIA\_ERR\_INVALID\_BUFFER：无效 buffer
- HB\_MEDIA\_ERR\_WAIT\_TIMEOUT：等待超时

【功能描述】

获取输入的 buffer。

【示例代码】

参考 [hb_mm_mc_queue_input_buffer](#hb_mm_mc_queue_input_buffer)

#### hb\_mm\_mc\_queue\_output\_buffer

【函数声明】

hb\_s32 hb\_mm\_mc\_queue\_output\_buffer(media\_codec\_context\_t
\*context, media\_codec\_buffer\_t \*buffer, hb\_s32 timeout)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] media\_codec\_buffer\_t \*buffer：输出的 buffer 信息
- \[IN\] hb\_s32 timeout：超时时间

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数
- HB\_MEDIA\_ERR\_INVALID\_BUFFER：无效 buffer
- HB\_MEDIA\_ERR\_WAIT\_TIMEOUT：等待超时

【功能描述】

返还处理完的 output buffer 到 MediaCodec 中。

【示例代码】

参考 [hb_mm_mc_queue_input_buffer](#hb_mm_mc_queue_input_buffer)

#### hb\_mm\_mc\_dequeue\_output\_buffer

【函数声明】

hb\_s32 hb\_mm\_mc\_dequeue\_output\_buffer(media\_codec\_context\_t
\*context, media\_codec\_buffer\_t \*buffer,
media\_codec\_output\_buffer\_info\_t \*info, hb\_s32 timeout)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] hb\_s32 timeout：超时时间
- \[OUT\] media\_codec\_buffer\_t \*buffer：输出的 buffer 信息
- \[IN\] media\_codec\_output\_buffer\_info\_t
  \*info：输出数据流的信息

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数
- HB\_MEDIA\_ERR\_INVALID\_BUFFER：无效 buffer
- HB\_MEDIA\_ERR\_WAIT\_TIMEOUT：等待超时

【功能描述】

获取输出的 buffer。

【示例代码】

参考 [hb_mm_mc_queue_input_buffer](#hb_mm_mc_queue_input_buffer)

#### hb\_mm\_mc\_get\_longterm\_ref\_mode

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_longterm\_ref\_mode(media\_codec\_context\_t
\*context, mc\_video\_longterm\_ref\_mode\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_video\_longterm\_ref\_mode\_t
  \*params：长期参考帧模式参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取长期参考帧模式的参数，适用于 H264/H265。

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"

typedef enum ENC_CONFIG_MESSAGE {
    ENC_CONFIG_NONE = (0 << 0),
    ENC_CONFIG_LONGTERM_REF = (1 << 0),
    ENC_CONFIG_INTRA_REFRESH = (1 << 1),
    ENC_CONFIG_RATE_CONTROL = (1 << 2),
    ENC_CONFIG_DEBLK_FILTER = (1 << 3),
    ENC_CONFIG_SAO = (1 << 4),
    ENC_CONFIG_ENTROPY = (1 << 5),
    ENC_CONFIG_VUI_TIMING = (1 << 6),
    ENC_CONFIG_SLICE = (1 << 7),
    ENC_CONFIG_REQUEST_IDR = (1 << 8),
    ENC_CONFIG_SKIP_PIC = (1 << 9),
    ENC_CONFIG_SMART_BG = (1 << 10),
    ENC_CONFIG_MONOCHROMA = (1 << 11),
    ENC_CONFIG_PRED_UNIT = (1 << 12),
    ENC_CONFIG_TRANSFORM = (1 << 13),
    ENC_CONFIG_ROI = (1 << 14),
    ENC_CONFIG_MODE_DECISION = (1 << 15),
    ENC_CONFIG_USER_DATA = (1 << 16),
    ENC_CONFIG_MJPEG = (1 << 17),
    ENC_CONFIG_JPEG = (1 << 18),
    ENC_CONFIG_CAMERA = (1 << 19),
    ENC_CONFIG_INSERT_USERDATA = (1 << 20),
    ENC_CONFIG_VUI = (1 << 21),
    ENC_CONFIG_3DNR = (1 << 22),
    ENC_CONFIG_REQUEST_IDR_HEADER = (1 << 23),
    ENC_CONFIG_ENABLE_IDR = (1 << 24),
    ENC_CONFIG_TOTAL = (1 << 25),
} ENC_CONFIG_MESSAGE;

typedef struct MediaCodecTestContext {
    media_codec_context_t *context;
    char *inputFileName;
    char *outputFileName;
    int32_t duration; // s
    ENC_CONFIG_MESSAGE message;
    mc_video_longterm_ref_mode_t ref_mode;
    mc_rate_control_params_t rc_params;
    mc_video_intra_refresh_params_t intra_refr;
    mc_video_deblk_filter_params_t deblk_filter;
    mc_h265_sao_params_t sao;
    mc_h264_entropy_params_t entropy;
    mc_video_vui_params_t vui;
    mc_video_vui_timing_params_t vui_timing;
    mc_video_slice_params_t slice;
    mc_video_3dnr_enc_params_t noise_reduction;
    mc_video_smart_bg_enc_params_t smart_bg;
    mc_video_pred_unit_params_t pred_unit;
    mc_video_transform_params_t transform;
    mc_video_roi_params_t roi;
    mc_video_mode_decision_params_t mode_decision;
} MediaCodecTestContext;

Uint64 osal_gettime(void)
{
    struct timespec tp;

    clock_gettime(CLOCK_MONOTONIC, &tp);

    return ((Uint64)tp.tv_sec*1000 + tp.tv_nsec/1000000);
}
uint8_t uuid[] =
    "dc45e9bd-e6d948b7-962cd820-d923eeef+HorizonAI";
static void set_message(MediaCodecTestContext *ctx) {
    int ret = 0;
    media_codec_context_t *context = ctx->context;

    mc_video_longterm_ref_mode_t *ref_mode = &ctx->ref_mode;
    hb_mm_mc_get_longterm_ref_mode(context, ref_mode);
    ref_mode->use_longterm = TRUE;
    ref_mode->longterm_pic_using_period = 20;
    ref_mode->longterm_pic_period = 30;
    //ctx->message = ENC_CONFIG_LONGTERM_REF;
    if (ctx->message & ENC_CONFIG_LONGTERM_REF) {
        ret = hb_mm_mc_set_longterm_ref_mode(context, &ctx->ref_mode);
    }
if (ctx->message & ENC_CONFIG_INTRA_REFRESH) {
hb_mm_mc_get_intra_refresh_config(context, &ctx->intra_refr)
        ret = hb_mm_mc_set_intra_refresh_config(context, &ctx->intra_refr);
}
if (ctx->message & ENC_CONFIG_SAO) {
hb_mm_mc_get_sao_config(context, &ctx->sao);
        ret = hb_mm_mc_set_sao_config(context, &ctx->sao);
    }

if (ctx->message & ENC_CONFIG_ENTROPY) {
hb_mm_mc_get_entropy_config(context, &ctx->entropy);
        ret = hb_mm_mc_set_entropy_config(context, &ctx->entropy);
    }

if (ctx->message & ENC_CONFIG_VUI) {
hb_mm_mc_get_vui_config(context, &ctx->vui);
    ret = hb_mm_mc_set_vui_config(context, &ctx->vui);
    }

if (ctx->message & ENC_CONFIG_VUI_TIMING) {
hb_mm_mc_get_vui_timing_config(context, &ctx->vui_timing);
        ret = hb_mm_mc_set_vui_timing_config(context, &ctx->vui_timing);
    }
    mc_rate_control_params_t *rc_params = &ctx->rc_params;
    rc_params->mode = context->video_enc_params.rc_params.mode;
    hb_mm_mc_get_rate_control_config(context, rc_params);
    switch (rc_params->mode) {
    case MC_AV_RC_MODE_H264CBR:
        rc_params->h264_cbr_params.bit_rate = 5000;
        rc_params->h264_cbr_params.intra_period = 60;
        break;
    case MC_AV_RC_MODE_H264VBR:
        rc_params->h264_vbr_params.intra_qp = 20;
        rc_params->h264_vbr_params.intra_period = 30;
        break;
    case MC_AV_RC_MODE_H264AVBR:
        rc_params->h264_avbr_params.intra_period = 15;
        rc_params->h264_avbr_params.intra_qp = 25;
        rc_params->h264_avbr_params.bit_rate = 2000;
        rc_params->h264_avbr_params.vbv_buffer_size = 3000;
        rc_params->h264_avbr_params.min_qp_I = 15;
        rc_params->h264_avbr_params.max_qp_I = 50;
        rc_params->h264_avbr_params.min_qp_P = 15;
        rc_params->h264_avbr_params.max_qp_P = 45;
        rc_params->h264_avbr_params.min_qp_B = 15;
        rc_params->h264_avbr_params.max_qp_B = 48;
        rc_params->h264_avbr_params.hvs_qp_enable = 0;
        rc_params->h264_avbr_params.hvs_qp_scale = 2;
        rc_params->h264_avbr_params.max_delta_qp = 5;
        rc_params->h264_avbr_params.qp_map_enable = 0;
        break;
    case MC_AV_RC_MODE_H264FIXQP:
        rc_params->h264_fixqp_params.force_qp_I = 23;
        rc_params->h264_fixqp_params.force_qp_P = 23;
        rc_params->h264_fixqp_params.force_qp_B = 23;
        rc_params->h264_fixqp_params.intra_period = 23;
        break;
    case MC_AV_RC_MODE_H264QPMAP:
        break;
    case MC_AV_RC_MODE_H265CBR:
        rc_params->h265_cbr_params.bit_rate = 5000;
        rc_params->h265_cbr_params.intra_period = 60;
        break;
    case MC_AV_RC_MODE_H265VBR:
        rc_params->h265_vbr_params.intra_qp = 20;
        rc_params->h265_vbr_params.intra_period = 30;
        break;
    case MC_AV_RC_MODE_H265AVBR:
        rc_params->h265_avbr_params.intra_period = 15;
        rc_params->h265_avbr_params.intra_qp = 25;
        rc_params->h265_avbr_params.bit_rate = 2000;
        rc_params->h265_avbr_params.vbv_buffer_size = 3000;
        rc_params->h265_avbr_params.min_qp_I = 15;
        rc_params->h265_avbr_params.max_qp_I = 50;
        rc_params->h265_avbr_params.min_qp_P = 15;
        rc_params->h265_avbr_params.max_qp_P = 45;
        rc_params->h265_avbr_params.min_qp_B = 15;
        rc_params->h265_avbr_params.max_qp_B = 48;
        rc_params->h265_avbr_params.hvs_qp_enable = 0;
        rc_params->h265_avbr_params.hvs_qp_scale = 2;
        rc_params->h265_avbr_params.max_delta_qp = 5;
        rc_params->h265_avbr_params.qp_map_enable = 0;
        break;
    case MC_AV_RC_MODE_H265FIXQP:
        rc_params->h265_fixqp_params.force_qp_I = 23;
        rc_params->h265_fixqp_params.force_qp_P = 23;
        rc_params->h265_fixqp_params.force_qp_B = 23;
        rc_params->h265_fixqp_params.intra_period = 23;
        break;
    case MC_AV_RC_MODE_H265QPMAP:
        break;
    default:
        break;
    }
    //ctx->message = ENC_CONFIG_RATE_CONTROL;
    if (ctx->message & ENC_CONFIG_RATE_CONTROL) {
        ret = hb_mm_mc_set_rate_control_config(context, &ctx->rc_params);
    }

    mc_video_deblk_filter_params_t *deblk_filter = &ctx->deblk_filter;
    hb_mm_mc_get_deblk_filter_config(context, deblk_filter);
    if (context->codec_id == MEDIA_CODEC_ID_H264) {
        deblk_filter->h264_deblk.disable_deblocking_filter_idc = 2;
        deblk_filter->h264_deblk.slice_alpha_c0_offset_div2 = 6;
        deblk_filter->h264_deblk.slice_beta_offset_div2 = 6;
    } else {
        deblk_filter->h265_deblk.slice_deblocking_filter_disabled_flag = 1;
        deblk_filter->h265_deblk.slice_beta_offset_div2 = 6;
        deblk_filter->h265_deblk.slice_tc_offset_div2 = 6;
        deblk_filter->h265_deblk.slice_loop_filter_across_slices_enabled_flag = 1;
    }
    //ctx->message = ENC_CONFIG_DEBLK_FILTER;
    if (ctx->message & ENC_CONFIG_DEBLK_FILTER) {
        ret = hb_mm_mc_set_deblk_filter_config(context, &ctx->deblk_filter);
    }

    if (context->codec_id == MEDIA_CODEC_ID_H264) {
        mc_h264_entropy_params_t *entropy = &ctx->entropy;
        hb_mm_mc_get_entropy_config(context, entropy);
        entropy->entropy_coding_mode = 0;
        ctx->message = ENC_CONFIG_ENTROPY;
        if (ctx->message & ENC_CONFIG_ENTROPY) {
            ret = hb_mm_mc_set_entropy_config(context, &ctx->entropy);
        }
    }

    //ctx->message = ENC_CONFIG_SKIP_PIC;
    if (ctx->message & ENC_CONFIG_SKIP_PIC) {
        ret = hb_mm_mc_skip_pic(context, 0), (int32_t)0);
    }

    //ctx->message = ENC_CONFIG_REQUEST_IDR;
    if (ctx->message & ENC_CONFIG_REQUEST_IDR) {
        ret = hb_mm_mc_request_idr_frame(context);
    }

    mc_video_slice_params_t *slice = &ctx->slice;
    hb_mm_mc_get_slice_config(context, slice);
    if (context->codec_id == MEDIA_CODEC_ID_H264) {
        slice->h264_slice.h264_slice_mode = 0;
        slice->h264_slice.h264_slice_arg = 60;
    } else {
        slice->h265_slice.h265_dependent_slice_mode = 0;
        slice->h265_slice.h265_dependent_slice_arg = 80;
        slice->h265_slice.h265_independent_slice_mode = 1;
        slice->h265_slice.h265_independent_slice_arg = 100;
    }
    //ctx->message = ENC_CONFIG_SLICE;
    if (ctx->message & ENC_CONFIG_SLICE) {
        ret = hb_mm_mc_set_slice_config(context, &ctx->slice);
    }

    mc_video_smart_bg_enc_params_t *smart_bg = &ctx->smart_bg;
    hb_mm_mc_get_smart_bg_enc_config(context, smart_bg);
    smart_bg->bg_detect_enable = 0;
    smart_bg->bg_threshold_diff = 8;
    smart_bg->bg_threshold_mean_diff = 1;
    smart_bg->bg_lambda_qp = 32;
    smart_bg->bg_delta_qp = 3;
    smart_bg->s2fme_disable = 0;
    //ctx->message = ENC_CONFIG_SMART_BG;
    if (ctx->message & ENC_CONFIG_SMART_BG) {
        ret = hb_mm_mc_set_smart_bg_enc_config(context, &ctx->smart_bg);
    }

    mc_video_pred_unit_params_t *pred_unit = &ctx->pred_unit;
    hb_mm_mc_get_pred_unit_config(context, pred_unit);
    if (context->codec_id == MEDIA_CODEC_ID_H264) {
        pred_unit->h264_intra_pred.constrained_intra_pred_flag = 1;
    } else {
        pred_unit->h265_pred_unit.intra_nxn_enable = 1;
        pred_unit->h265_pred_unit.constrained_intra_pred_flag = 1;
        pred_unit->h265_pred_unit.strong_intra_smoothing_enabled_flag = 0;
        pred_unit->h265_pred_unit.max_num_merge = 2;
    }
    //ctx->message = ENC_CONFIG_PRED_UNIT;
    if (ctx->message & ENC_CONFIG_PRED_UNIT) {
        ret = hb_mm_mc_set_pred_unit_config(context, &ctx->pred_unit);
    }

    mc_video_transform_params_t *transform = &ctx->transform;
    hb_mm_mc_get_transform_config(context, transform);
    if (context->codec_id == MEDIA_CODEC_ID_H264) {
        transform->h264_transform.transform_8x8_enable = 1;
        transform->h264_transform.chroma_cb_qp_offset = 4;
        transform->h264_transform.chroma_cr_qp_offset = 3;
        transform->h264_transform.user_scaling_list_enable = 0;
    } else {
        transform->h265_transform.chroma_cb_qp_offset = 6;
        transform->h265_transform.chroma_cr_qp_offset = 5;
        transform->h265_transform.user_scaling_list_enable = 0;
    }
    //ctx->message = ENC_CONFIG_TRANSFORM;
    if (ctx->message & ENC_CONFIG_TRANSFORM) {
        ret = hb_mm_mc_set_transform_config(context, &ctx->transform);
    }

    mc_video_roi_params_t *roi = &ctx->roi;
    hb_mm_mc_get_roi_config(context, roi);
    roi->roi_enable = 0;
    //ctx->message = ENC_CONFIG_ROI;
    if (ctx->message & ENC_CONFIG_ROI) {
        ret = hb_mm_mc_set_roi_config(context, &ctx->roi);
    }

    mc_video_mode_decision_params_t *mode_decision = &ctx->mode_decision;
    hb_mm_mc_get_mode_decision_config(context, mode_decision);
    mode_decision->mode_decision_enable = FALSE;
    mode_decision->pu04_delta_rate = 76;
    mode_decision->pu08_delta_rate = 80;
    mode_decision->pu16_delta_rate = 86;
    mode_decision->pu32_delta_rate = 87;
    mode_decision->pu04_intra_planar_delta_rate = 0;
    mode_decision->pu04_intra_dc_delta_rate = 0;
    mode_decision->pu04_intra_angle_delta_rate = 0;
    mode_decision->pu08_intra_planar_delta_rate = 0;
    mode_decision->pu08_intra_dc_delta_rate = 0;
    mode_decision->pu08_intra_angle_delta_rate = 0;
    mode_decision->pu16_intra_planar_delta_rate = 0;
    mode_decision->pu16_intra_dc_delta_rate = 0;
    mode_decision->pu16_intra_angle_delta_rate = 0;
    mode_decision->pu32_intra_planar_delta_rate = 0;
    mode_decision->pu32_intra_dc_delta_rate = 0;
    mode_decision->pu32_intra_angle_delta_rate = 0;
    mode_decision->cu08_intra_delta_rate = 0;
    mode_decision->cu08_inter_delta_rate = 0;
    mode_decision->cu08_merge_delta_rate = 0;
    mode_decision->cu16_intra_delta_rate = 0;
    mode_decision->cu16_inter_delta_rate = 0;
    mode_decision->cu16_merge_delta_rate = 0;
    mode_decision->cu32_intra_delta_rate = 0;
    mode_decision->cu32_inter_delta_rate = 0;
    mode_decision->cu32_merge_delta_rate = 0;
    //ctx->message = ENC_CONFIG_MODE_DECISION;
    if (ctx->message & ENC_CONFIG_MODE_DECISION) {
        ret = hb_mm_mc_set_mode_decision_config(context, &ctx->mode_decision);
}
    if (ctx->message & ENC_CONFIG_INSERT_USERDATA) {
        hb_u32 length = sizeof(uuid)/sizeof(uuid[0]);
        ret = hb_mm_mc_insert_user_data(context, uuid, length);
}
if (ctx->message & ENC_CONFIG_3DNR) {
hb_mm_mc_get_3dnr_enc_config(context, &ctx->noise_reduction);
        ret = hb_mm_mc_set_3dnr_enc_config(context, &ctx->noise_reduction);
}
    if (ctx->message & ENC_CONFIG_ENABLE_IDR) {
        // disable idr frame first
        if (ctx->enable_idr_num) {
            ret = hb_mm_mc_enable_idr_frame(context, 0);
        }
    }

    if (ctx->message & ENC_CONFIG_REQUEST_IDR_HEADER) {
        ret = hb_mm_mc_request_idr_header(context, ctx->force_idr_header);
    }
}

static void do_sync_encoding(void *arg) {
    hb_s32 ret = 0;
    FILE *inFile;
    FILE *outFile;
    int noMoreInput = 0;
    int lastStream = 0;
    Uint64 lastTime = 0;
    Uint64 curTime = 0;
    int needFlush = 1;
    MediaCodecTestContext *ctx = (MediaCodecTestContext *)arg;
    media_codec_context_t *context = ctx->context;
    char *inputFileName = ctx->inputFileName;
    char *outputFileName = ctx->outputFileName;
    media_codec_state_t state = MEDIA_CODEC_STATE_NONE;
    inFile = fopen(inputFileName, "rb");
    if (!inFile) {
        goto ERR;
    }
    outFile = fopen(outputFileName, "wb");
    if (!outFile) {
        goto ERR;
    }

    //get current time
    lastTime = osal_gettime();

    ret = hb_mm_mc_initialize(context);
    if (ret) {
        goto ERR;
    }

    ret = hb_mm_mc_configure(context);
    if (ret) {
        goto ERR;
    }

    mc_av_codec_startup_params_t startup_params;
    startup_params.video_enc_startup_params.receive_frame_number = 0;
    ret = hb_mm_mc_start(context, &startup_params);
    if (ret) {
        goto ERR;
    }

    ret = hb_mm_mc_pause(context);
    if (ret) {
        goto ERR;
    }

    do {
        set_message(ctx);
        if (!noMoreInput) {
            media_codec_buffer_t inputBuffer;
            memset(&inputBuffer, 0x00, sizeof(media_codec_buffer_t));
            ret = hb_mm_mc_dequeue_input_buffer(context, &inputBuffer, 100);
            if (!ret) {
                curTime = osal_gettime();
                if ((curTime - lastTime)/1000 < (uint32_t)ctx->duration) {
                    ret = fread(inputBuffer.vframe_buf.vir_ptr[0], 1,
                        inputBuffer.vframe_buf.size, inFile);
                    if (ret <= 0) {
                        if(fseek(inFile, 0, SEEK_SET)) {
                            printf("Failed to rewind input file\n");
                        } else {
                            ret = fread(inputBuffer.vframe_buf.vir_ptr[0], 1,
                                inputBuffer.vframe_buf.size, inFile);
                            if (ret <= 0) {
                                printf("Failed to read input file\n");
                            }
                        }
                    }
                } else {
                    printf("Time up(%d)\n",ctx->duration);
                    ret = 0;
                }
                if (!ret) {
                    printf("There is no more input data!\n");
                    inputBuffer.vframe_buf.frame_end = TRUE;
                    noMoreInput = 1;
                }
                ret = hb_mm_mc_queue_input_buffer(context, &inputBuffer, 100);
                if (ret) {
                    printf("Queue input buffer fail.\n");
                    break;
                }
            } else {
                if (ret != (int32_t)HB_MEDIA_ERR_WAIT_TIMEOUT) {
                    printf("Dequeue input buffer fail.\n");
                    break;
                }
            }
        }

        if (!lastStream) {
            media_codec_buffer_t outputBuffer;
            media_codec_output_buffer_info_t info;
            memset(&outputBuffer, 0x00, sizeof(media_codec_buffer_t));
            memset(&info, 0x00, sizeof(media_codec_output_buffer_info_t));
            ret = hb_mm_mc_dequeue_output_buffer(context, &outputBuffer, &info, 3000);
            if (!ret && outFile) {
                fwrite(outputBuffer.vstream_buf.vir_ptr, outputBuffer.vstream_buf.size, 1, outFile);

                ret = hb_mm_mc_queue_output_buffer(context, &outputBuffer, 100);
                if (ret) {
                    printf("Queue output buffer fail.\n");
                    break;
                }
                if (outputBuffer.vstream_buf.stream_end) {
                    printf("There is no more output data!\n");
                    lastStream = 1;
                    break;
                }
            } else {
                if (ret != (int32_t)HB_MEDIA_ERR_WAIT_TIMEOUT) {
                    printf("Dequeue output buffer fail.\n");
                    break;
                }
            }
        }
        if (needFlush) {
            ret = hb_mm_mc_flush(context);
            needFlush = 0;
            if (ret) {
                break;
            }
        }
    }while(TRUE);

    hb_mm_mc_stop(context);

    hb_mm_mc_release(context);
    context = NULL;

ERR:
    hb_mm_mc_get_state(context, &state);
    if (context && state != MEDIA_CODEC_STATE_UNINITIALIZED) {
        hb_mm_mc_stop(context);
        hb_mm_mc_release(context);
    }

    if (inFile)
        fclose(inFile);

    if (outFile)
        fclose(outFile);
}

int main(int argc, char *argv[])
{
    hb_s32 ret = 0;
    char outputFileName[MAX_FILE_PATH] = "./tmp.yuv";
    char inputFileName[MAX_FILE_PATH] = "./output.stream";
    mc_video_codec_enc_params_t *params;
    media_codec_context_t context;

    memset(&context, 0x00, sizeof(media_codec_context_t));
    context.codec_id = MEDIA_CODEC_ID_H265;
    context.encoder = TRUE;
    params = &context.video_enc_params;
    params->width = 640;
    params->height = 480;
    params->pix_fmt = MC_PIXEL_FORMAT_YUV420P;
    params->frame_buf_count = 5;
    params->external_frame_buf = FALSE;
    params->bitstream_buf_count = 5;
    params->rc_params.mode = MC_AV_RC_MODE_H265CBR;
    ret = hb_mm_mc_get_rate_control_config(&context, &params->rc_params);
    if (ret) {
        return -1;
    }
    params->rc_params.h265_cbr_params.bit_rate = 5000;
    params->rc_params.h265_cbr_params.frame_rate = 30;
    params->rc_params.h265_cbr_params.intra_period = 30;
    params->gop_params.decoding_refresh_type = 2;
    params->gop_params.gop_preset_idx = 2;
    params->rot_degree = MC_CCW_0;
    params->mir_direction = MC_DIRECTION_NONE;
    params->frame_cropping_flag = FALSE;

    MediaCodecTestContext ctx;
    memset(&ctx, 0x00, sizeof(ctx));
    ctx.context = &context;
    ctx.inputFileName = inputFileName;
    ctx.outputFileName = outputFileName;
    ctx.duration = 5;
    do_sync_encoding(&ctx);
}
```

#### hb\_mm\_mc\_set\_longterm\_ref\_mode

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_longterm\_ref\_mode(media\_codec\_context\_t
\*context, const mc\_video\_longterm\_ref\_mode\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_video\_longterm\_ref\_mode\_t
  \*params：长期参考帧模式参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置长期参考帧模式的参数，该参数为动态参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_intra\_refresh\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_intra\_refresh\_config(media\_codec\_context\_t
\*context, mc\_video\_intra\_refresh\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_video\_intra\_refresh\_params\_t \*params：帧内刷新参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取帧内刷新参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_intra\_refresh\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_intra\_refresh\_config(media\_codec\_context\_t
\*context, const mc\_video\_intra\_refresh\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_video\_intra\_refresh\_params\_t
  \*params：帧内刷新参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置帧内刷新模式参数，该参数为静态参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_rate\_control\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_rate\_control\_config(media\_codec\_context\_t
\*context, mc\_rate\_control\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_rate\_control\_params\_t \*params：码率控制参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取码率控制参数，该参数为动态参数，适用于 H264/H265/MJPEG。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_rate\_control\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_rate\_control\_config(media\_codec\_context\_t
\*context, const mc\_rate\_control\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_rate\_control\_params\_t \*params：码率控制参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置码率控制参数，该参数为动态参数，适用于 H264/H265/MJPEG。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_deblk\_filter\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_deblk\_filter\_config(media\_codec\_context\_t
\*context, mc\_video\_deblk\_filter\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_video\_deblk\_filter\_params\_t \* params：去块滤波参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取去块滤波参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_deblk\_filter\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_deblk\_filter\_config(media\_codec\_context\_t
\*context, const mc\_video\_deblk\_filter\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_video\_deblk\_filter\_params\_t
  \*params：去块滤波参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置去块滤波参数，该参数为动态参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_sao\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_sao\_config(media\_codec\_context\_t \*context,
mc\_h265\_sao\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_h265\_sao\_params\_t \*params：SAO 参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 SAO 参数，适用于 H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_sao\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_sao\_config(media\_codec\_context\_t \*context,
const mc\_h265\_sao\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_h265\_sao\_params\_t \*params：SAO 参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置 SAO 参数，该参数为静态参数，适用于 H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_entropy\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_entropy\_config(media\_codec\_context\_t
\*context, mc\_h264\_entropy\_params\_t \*params);

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] mc\_h264\_entropy\_params\_t \*params：entropy 参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 entropy 参数，适用于 H264。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_entropy\_config

【函数声明】

extern hb\_s32 hb\_mm\_mc\_set\_entropy\_config(media\_codec\_context\_t
\*context, const mc\_h264\_entropy\_params\_t \*params);

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_h264\_entropy\_params\_t \*params：entropy 数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置 entropy 参数，适用于 H264。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_vui\_timing\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_vui\_timing\_config(media\_codec\_context\_t
\*context, mc\_video\_vui\_timing\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_video\_vui\_timing\_params\_t \*params：VUI Timing 参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 VUI Timing 参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_vui\_timing\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_vui\_timing\_config(media\_codec\_context\_t
\*context, const mc\_video\_vui\_timing\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_video\_vui\_timing\_params\_t \*params：VUI
  Timing 参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置 VUI Timing 参数，该参数为静态参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_slice\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_slice\_config(media\_codec\_context\_t
\*context, mc\_video\_slice\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_video\_slice\_params\_t \*params：slice 编码参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 slice 编码参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_slice\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_slice\_config(media\_codec\_context\_t
\*context, const mc\_video\_slice\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_video\_slice\_params\_t \*params：slice 编码参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置 slice 编码参数，该参数为动态参数，适用于 H264/H265。限制每帧 slice 个数小于等于1500。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_insert\_user\_data

【函数声明】

hb\_s32 hb\_mm\_mc\_insert\_user\_data(media\_codec\_context\_t \*
context, hb\_u8 \*data, hb\_u32 length)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] hb\_u8 \*data：用户数据
- \[IN\] hb\_u32 length：用户数据长度

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

在编码流中插入用户数据，该参数为动态参数，适用于 H264/H265/MJPG/JPG。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_request\_idr\_frame

【函数声明】

hb\_s32 hb\_mm\_mc\_request\_idr\_frame(media\_codec\_context\_t
\*context)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例

【功能描述】

请求 IDR 帧，该接口可动态设置，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_skip\_pic

【函数声明】

hb\_s32 hb\_mm\_mc\_skip\_pic(media\_codec\_context\_t
\*context，hb\_s32 src\_idx)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] hb\_s32 src\_idx：source buffer 索引值

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

使能指定的图像的 skip 模式编码，该接口可动态设置，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_smart\_bg\_enc\_config

【函数声明】

extern hb\_s32
hb\_mm\_mc\_get\_smart\_bg\_enc\_config(media\_codec\_context\_t
\*context, mc\_video\_smart\_bg\_enc\_params\_t \*params);

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_video\_smart\_bg\_enc\_params\_t
  \*params：智能背景编码模式参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取智能背景编码参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_smart\_bg\_enc\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_smart\_bg\_enc\_config(media\_codec\_context\_t
\*context, const mc\_video\_smart\_bg\_enc\_params\_t \*params);

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_video\_smart\_bg\_enc\_params\_t
  \*params：智能背景编码模式参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置智能背景编码参数，该参数为动态参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_pred\_unit\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_pred\_unit\_config(media\_codec\_context\_t
\*context, mc\_video\_pred\_unit\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_video\_pred\_unit\_params\_t \*params：预测单元参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取预测单元参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_pred\_unit\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_pred\_unit\_config(media\_codec\_context\_t
\*context, const mc\_video\_pred\_unit\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_video\_pred\_unit\_params\_t \*params：预测单元参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置预测单元参数，该参数为动态参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_transform\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_transform\_config(media\_codec\_context\_t
\*context, mc\_video\_transform\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_video\_transform\_params\_t \*params：Transform 参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 Transform 参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_transform\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_transform\_config(media\_codec\_context\_t
\*context, const mc\_video\_transform\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_video\_transform\_params\_t \*params：
  Transform 参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置 Transform 参数，该参数为动态参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_roi\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_roi\_config(media\_codec\_context\_t \*context,
mc\_video\_roi\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_video\_roi\_params\_t \*params：ROI 编码参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 ROI 编码参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_roi\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_roi\_config(media\_codec\_context\_t \*context,
const mc\_video\_roi\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_video\_roi\_params\_t \*params：ROI 编码参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置 ROI 编码参数，该参数为动态参数，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_mode\_decision\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_mode\_decision\_config(media\_codec\_context\_t
\*context, mc\_video\_mode\_decision\_params\_t \*params);

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_video\_mode\_decision\_params\_t \*params：模式决策参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 mode decision 参数，适用于 H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_mode\_decision\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_mode\_decision\_config(media\_codec\_context\_t
\*context, const mc\_video\_mode\_decision\_params\_t \*params);

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_video\_mode\_decision\_params\_t
  \*params：模式决策参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置模式决策参数，该参数为动态参数，适用于 H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_user\_data

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_user\_data(media\_codec\_context\_t \*context,
mc\_user\_data\_buffer\_t \*params , hb\_s32 timeout)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_user\_data\_buffer\_t \*params：用户数据
- \[IN\] timeout：超时时间

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取解码流中的用户数据，适用于 H264/H265。

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
static int check_and_init_test(MediaCodecTestContext *ctx) {
    int32_t ret = 0;
    char *inputFileName, *outputFileName, *inputMd5FileName;
    EXPECT_NE(ctx, nullptr);
    EXPECT_NE(ctx->context, nullptr);
    if (ctx == NULL || ctx->context == NULL) {
        return -1;
    }
    inputFileName = ctx->inputFileName;
    outputFileName = ctx->outputFileName;
    inputMd5FileName = ctx->inputMd5FileName;
    printf("%s[%d:%d] Thread work in %s mode\n", TAG, getpid(), gettid(),
    ctx->workMode == THREAD_WORK_MODE_SYNC ? "sync" :
        (ctx->workMode == THREAD_WORK_MODE_ASYNC ? "async" : "poll"));
    printf("%s[%d:%d] InputFileName = %s\n", TAG, getpid(), gettid(), inputFileName);
    printf("%s[%d:%d] OutputFileName = %s\n", TAG, getpid(), gettid(), outputFileName);
    printf("%s[%d:%d] InputMd5File = %s\n", TAG, getpid(), gettid(), inputMd5FileName);
    EXPECT_NE(inputFileName, nullptr);
    EXPECT_NE(outputFileName, nullptr);
    if (inputFileName == NULL || outputFileName == NULL) {
        return -1;
    }
    ctx->inFile = fopen(inputFileName, "rb");
    EXPECT_NE(ctx->inFile, nullptr);
    ctx->outFile = fopen(outputFileName, "wb+");
    EXPECT_NE(ctx->outFile, nullptr);
    if (ctx->inFile == NULL || ctx->outFile == NULL) {
        return -1;
    }
    if (ctx->md5Test == TRUE) {
        if (inputMd5FileName) {
            ctx->inMd5File = fopen(inputMd5FileName, "rb");
        }
        EXPECT_NE(ctx->inMd5File, nullptr);
        if (ctx->inMd5File == NULL) {
            return -1;
        }
    }
    // allocate ion buffers
    ctx->ionFd = ion_open();
    EXPECT_GT(ctx->ionFd, 0);
    if (ctx->ionFd <= 0) {
        return -1;
    }
    if (ctx->context->encoder == TRUE) {
        printf("%s[%d:%d] Thread use %s buffer mode, %d rc mode\n", TAG, getpid(), gettid(),
        ctx->context->video_enc_params.external_frame_buf ?
        "external" : "internal",
        ctx->context->video_enc_params.rc_params.mode);
        if (ctx->context->video_enc_params.external_frame_buf) {
            ctx->exFb = (ExternalFrameBuffer *) malloc(
            ctx->context->video_enc_params.frame_buf_count * sizeof(ExternalFrameBuffer));
            EXPECT_NE(ctx->exFb, nullptr);
            if (ctx->exFb == NULL) {
                return -1;
            }
            for (Uint32 i=0; i<ctx->context->video_enc_params.frame_buf_count; i++) {
                ctx->exFb[i].buf.size = ctx->context->video_enc_params.width
                * ctx->context->video_enc_params.height * 3/2; // only for yuv420;
                ret = allocate_ion_mem(ctx->ionFd, &ctx->exFb[i].buf);
                EXPECT_EQ(ret, 0);
                if (ret != 0) {
                    return ret;
                }
                ctx->exFb[i].valid = 1;
                ctx->exFb[i].src_idx = i;
            }
        }
    } else {
        printf("%s[%d:%d] Thread use %s buffer mode, %d feed mode.\n", TAG, getpid(), gettid(),
        ctx->context->video_dec_params.external_bitstream_buf ?
        "external" : "internal",
        ctx->context->video_dec_params.feed_mode);
        if (ctx->context->video_dec_params.external_bitstream_buf) {
            ctx->exBs = (ExternalStreamBuffer *) malloc(
            ctx->context->video_dec_params.bitstream_buf_count * sizeof(ExternalStreamBuffer));
            EXPECT_NE(ctx->exBs, nullptr);
            if (ctx->exBs == NULL) {
                return -1;
            }
            for (Uint32 i=0; i<ctx->context->video_dec_params.bitstream_buf_count; i++) {
                ctx->exBs[i].buf.size = ctx->context->video_dec_params.bitstream_buf_size;
                ret = allocate_ion_mem(ctx->ionFd, &ctx->exBs[i].buf);
                EXPECT_EQ(ret, 0);
                if (ret != 0) {
                    return ret;
                }
                ctx->exBs[i].valid = 1;
                ctx->exBs[i].src_idx = i;
            }
        }
    }
// open decode files
    if (ctx->context->encoder != TRUE) {
    if (ctx->context->video_dec_params.feed_mode == MC_FEEDING_MODE_FRAME_SIZE) {
        ret = avformat_open_input(&ctx->avContext, ctx->inputFileName, 0, 0);
        EXPECT_GE(ret, 0);
        if (ret < 0) {
            return ret;
        }
        ret = avformat_find_stream_info(ctx->avContext, 0);
        EXPECT_GE(ret, 0);
        if (ret < 0) {
            return ret;
        }
        ctx->videoIndex = av_find_best_stream(ctx->avContext, AVMEDIA_TYPE_VIDEO, -1, -1, NULL, 0);
        EXPECT_GE(ctx->videoIndex, 0);
        if (ctx->videoIndex < 0) {
            return -1;
        }
        av_init_packet(&ctx->avpacket);
    } else {
        if (ctx->feedingSize == 0) {
            uint32_t KB = 1024;
            int32_t probability10;
            srand((uint32_t)time(NULL));
            ctx->feedingSize = rand() % MAX_FEEDING_SIZE;
            probability10 = (ctx->feedingSize % 100) < 10;
            if (ctx->feedingSize < KB) {
                if (probability10 == FALSE)
                    ctx->feedingSize *= 100;
                }
            }
            printf("%s[%d:%d] Feeding size = %d\n", TAG,
            getpid(), gettid(), ctx->feedingSize);
        }
        ctx->firstPacket = 1;
    }
    return 0;
}
static int check_and_release_test(MediaCodecTestContext *ctx) {
    int32_t ret = 0;
    int md5Match, wholeFileSize = 0;
    uint8_t *md5Buffer = NULL;
    EXPECT_NE(ctx, nullptr);
    EXPECT_NE(ctx->context, nullptr);
    EXPECT_NE(ctx->inFile, nullptr);
    EXPECT_NE(ctx->outFile, nullptr);
    if (ctx == NULL || ctx->context == NULL || ctx->inFile == NULL ||
        ctx->outFile == NULL) {
        return -1;
    }
    if (ctx->context->encoder != TRUE) {
        if (ctx->context->video_dec_params.feed_mode == MC_FEEDING_MODE_FRAME_SIZE) {
            if (ctx->avContext) {
                avformat_close_input(&ctx->avContext);
            }
        }
    }
    if (ctx->context->encoder == TRUE) {
        if (ctx->context->video_enc_params.external_frame_buf) {
            if (ctx->exFb) {
                for (Uint32 i=0; i<ctx->context->video_enc_params.frame_buf_count; i++) {
                    ret = release_ion_mem(ctx->ionFd, &ctx->exFb[i].buf);
                    EXPECT_EQ(ret, 0);
                }
                free(ctx->exFb);
            }
        }
    } else {
        if (ctx->context->video_dec_params.external_bitstream_buf) {
            if (ctx->exBs) {
                for (Uint32 i=0; i<ctx->context->video_dec_params.bitstream_buf_count; i++) {
                    ret = release_ion_mem(ctx->ionFd, &ctx->exBs[i].buf);
                    EXPECT_EQ(ret, 0);
                }
                free(ctx->exBs);
            }
        }
    }
    if (ctx->ionFd)
        ion_close(ctx->ionFd);
    if (ctx->md5Test && ctx->inMd5File) {
        fseek(ctx->outFile, 0, SEEK_END);
        wholeFileSize = ftell(ctx->outFile);
        fseek(ctx->outFile, 0, SEEK_SET);
        md5Buffer = (uint8_t *)malloc(wholeFileSize);
        EXPECT_NE(md5Buffer, nullptr);
        if (md5Buffer == NULL) {
            return -1;
        }
        fread(md5Buffer, wholeFileSize, 1, ctx->outFile);
        md5Match = compare_md5_value(MD5_SIZE, ctx->inMd5File,
        md5Buffer, wholeFileSize);
        free(md5Buffer);
        fclose(ctx->inMd5File);
        EXPECT_EQ(md5Match, 1);
        if (md5Match != 1) {
            return -1;
        }
    }
    if (ctx->outFile)
        fclose(ctx->outFile);
    if (ctx->inFile)
        fclose(ctx->inFile);
    return 0;
}
static void on_vlc_buffer_message(hb_ptr userdata, hb_s32 * vlc_buf) {
    MediaCodecTestContext *ctx = (MediaCodecTestContext *)userdata;
    ASSERT_NE(vlc_buf, nullptr);
    ASSERT_NE(ctx, nullptr);
    ASSERT_GE(ctx->vlc_buf_size, 0);
    if (ctx->testLog) {
        printf("%s %s VLC Buffer size = %d; Reset to %d.\n", TAG, __FUNCTION__,
        *vlc_buf, ctx->vlc_buf_size);
    }
    *vlc_buf = ctx->vlc_buf_size;
}
static int read_input_streams(MediaCodecTestContext *ctx,
    media_codec_buffer_t *inputBuffer) {
    Uint64 curTime = 0;
    int ret = 0, ret2 = 0;
    Uint32 bufIdx = 0, srcIdx = 0;
    Int32 doRead = TRUE, doRewind = FALSE;
    uint8_t *seqHeader = NULL;
    int seqHeaderSize = 0;
    void *bufPtr = NULL;
    int avalBufSize = 0;
    EXPECT_NE(ctx, nullptr);
    EXPECT_NE(ctx->context, nullptr);
    EXPECT_NE(ctx->inFile, nullptr);
    EXPECT_NE(ctx->outFile, nullptr);
    EXPECT_NE(inputBuffer, nullptr);
    if (ctx == NULL || ctx->context == NULL || ctx->inFile == NULL ||
        ctx->outFile == NULL || inputBuffer == NULL) {
        printf("%s[%d:%d] Invalid parameters(%s).\n",
        TAG, getpid(), gettid(), __FUNCTION__);
        return -1;
    }
    if (ctx->stabilityTest || ctx->pfTest) {
        doRewind = TRUE;
        curTime = osal_gettime();
        if ((curTime - ctx->testStartTime)/1000 < (uint32_t)ctx->duration) {
            doRead = TRUE;
        } else {
            printf("%s[%d:%d] Time up(%d)\n",
            TAG, getpid(), gettid(), ctx->duration);
            doRead = FALSE;
            ret = 0;
        }
    }
    if (ctx->context->video_dec_params.external_bitstream_buf) {
        // release input buffer and take it as the new input buffer
        for (bufIdx = 0;
            bufIdx < ctx->context->video_dec_params.bitstream_buf_count;
            bufIdx++) {
            if (ctx->exBs[bufIdx].valid &&
                ctx->exBs[bufIdx].src_idx == inputBuffer->vstream_buf.src_idx) {
                srcIdx = inputBuffer->vstream_buf.src_idx;
                break;
            }
        }
        EXPECT_NE(bufIdx, ctx->context->video_dec_params.bitstream_buf_count);
        if (bufIdx == ctx->context->video_dec_params.bitstream_buf_count) {
            return -1;
        }
        bufPtr = (void *)ctx->exBs[srcIdx].buf.virt_addr;
        if (ctx->context->video_dec_params.feed_mode ==
            MC_FEEDING_MODE_FRAME_SIZE) {
            avalBufSize = ctx->exBs[srcIdx].buf.size;
        } else {
            avalBufSize = (ctx->exBs[srcIdx].buf.size < (int)ctx->feedingSize) ?
            ctx->exBs[srcIdx].buf.size : ctx->feedingSize;
        }
        inputBuffer->vstream_buf.fd = ctx->exBs[srcIdx].buf.fd;
        inputBuffer->vstream_buf.phy_ptr =
        ctx->exBs[srcIdx].buf.phys_addr;
        inputBuffer->vstream_buf.vir_ptr =
        (hb_u8 *)ctx->exBs[srcIdx].buf.virt_addr;
    } else {
        bufPtr = (void *)inputBuffer->vstream_buf.vir_ptr;
        if (ctx->context->video_dec_params.feed_mode ==
            MC_FEEDING_MODE_FRAME_SIZE) {
            avalBufSize = inputBuffer->vstream_buf.size;
        } else {
            avalBufSize = (inputBuffer->vstream_buf.size < ctx->feedingSize) ?
            inputBuffer->vstream_buf.size : ctx->feedingSize;
        }
    }
    if (doRead == FALSE) {
        return ret;
    }
    // MC_FEEDING_MODE_FRAME_SIZE mode
    if (ctx->context->video_dec_params.feed_mode == MC_FEEDING_MODE_FRAME_SIZE) {
        do {
            if (ctx->avpacket.size == 0) {
                ret = av_read_frame(ctx->avContext, &ctx->avpacket);
                if (ret < 0 && doRewind == FALSE) {
                    printf("%s[%d:%d] Failed to read input file (error=0x%x)\n",
                        TAG, getpid(), gettid(), ret);
                }
                if (ret < 0 && doRewind == TRUE) {
                    avformat_close_input(&ctx->avContext);
                    ret2 = avformat_open_input(&ctx->avContext, ctx->inputFileName, 0, 0);
                    EXPECT_GE(ret2, 0);
                    if (ret2 < 0) {
                        ret = ret2;
                        break;
                    }
                    /*ret = avformat_find_stream_info(ctx->avContext, 0);
                    EXPECT_GE(ret, 0);
                    if (ret < 0) {
                        break;
                    }
                    ctx->videoIndex = av_find_best_stream(ctx->avContext, AVMEDIA_TYPE_VIDEO, -1, -1, NULL, 0);
                    EXPECT_GE(ctx->videoIndex, 0);
                    if (ctx->videoIndex < 0) {
                        ret = -1;
                        break;
                    }*/
                    av_init_packet(&ctx->avpacket);
                }
            } else {
                if (ctx->testLog) {
                    printf("%s[%d:%d] Reuse previous stream packet size %d\n",
                    TAG, getpid(), gettid(), ctx->avpacket.size);
                }
            }
        } while (ret < 0 && doRewind == TRUE);
        if (ret < 0) {
            if (ret == AVERROR_EOF || ctx->avContext->pb->eof_reached == TRUE) {
                printf("%s[%d:%d] End of file!\n", TAG, getpid(), gettid());
                ret = 0;
            } else {
                printf("%s[%d:%d] Failed to av_read_frame error(0x%08x)\n",
                TAG, getpid(), gettid(), ret);
            }
            return ret;
        }
        if (ctx->testLog) {
            printf("%s[%d:%d] Read packet size %d\n",
                TAG, getpid(), gettid(), ctx->avpacket.size);
        }
        seqHeaderSize = 0;
        if (ctx->firstPacket) {
            AVCodecParameters* codec;
            int retSize = 0;
            codec = ctx->avContext->streams[ctx->videoIndex]->codecpar;
            seqHeader = (uint8_t*)malloc(codec->extradata_size + 1024);
            if (seqHeader == NULL) {
                printf("%s[%d:%d] Failed to mallock seqHeader\n",
                TAG, getpid(), gettid());
                ret = -1;
                return ret;
            }
            memset((void*)seqHeader, 0x00, codec->extradata_size + 1024);
            seqHeaderSize = build_dec_seq_header(seqHeader,
            ctx->context->codec_id,
            ctx->avContext->streams[ctx->videoIndex], &retSize);
            if (seqHeaderSize < 0) {
                printf("%s[%d:%d] Failed to build seqHeader\n",
                TAG, getpid(), gettid());
                ret = -1;
                return ret;
            }
            ctx->firstPacket = 0;
        }
        if ((ctx->avpacket.size <= avalBufSize)
            && (seqHeaderSize <= avalBufSize)) {
            int bufSize = 0;
            if (seqHeaderSize) {
                memcpy(bufPtr, seqHeader, seqHeaderSize);
                bufSize = seqHeaderSize;
                /*memcpy((char *)bufPtr+bufSize,ctx->avpacket.data, ctx->avpacket.size);
                bufSize += ctx->avpacket.size;
                av_packet_unref(&ctx->avpacket);
                ctx->avpacket.size = 0;*/
            } else {
                memcpy(bufPtr,ctx->avpacket.data, ctx->avpacket.size);
                bufSize = ctx->avpacket.size;
                av_packet_unref(&ctx->avpacket);
                ctx->avpacket.size = 0;
            }
            inputBuffer->vstream_buf.size = bufSize;
        } else {
            printf("%s[%d:%d] The stream buffer is too "
            "small!\n", TAG, getpid(), gettid());
            return -1;
        }
        if (seqHeader) {
            free(seqHeader);
            seqHeader = NULL;
        }
        return 1;
    }
    // MC_FEEDING_MODE_STREAM_SIZE mode
    do {
        ret = fread(bufPtr, 1, avalBufSize, ctx->inFile);
        if (ret <= 0 && doRewind == FALSE) {
            printf("%s[%d:%d] Failed to read input file (error=0x%x)\n",
                TAG, getpid(), gettid(), ret);
        }
        if (ret <= 0 && doRewind == TRUE) {
            if(fseek(ctx->inFile, 0, SEEK_SET)) {
                printf("%s Failed to rewind input file (pid=%d, tid=%d)\n",
                    TAG, getpid(), gettid());
                break;
            }
        }
    } while (ret == 0 && doRewind == TRUE);
    inputBuffer->vstream_buf.size = ret > 0 ? ret : 0;
    return ret;
}
static int write_output_frames(MediaCodecTestContext *ctx,
    media_codec_buffer_t *outputBuffer) {
    int32_t ret = 0;
    EXPECT_NE(ctx, nullptr);
    EXPECT_NE(ctx->context, nullptr);
    EXPECT_NE(ctx->inFile, nullptr);
    EXPECT_NE(ctx->outFile, nullptr);
    EXPECT_NE(outputBuffer, nullptr);
    if (ctx == NULL || ctx->context == NULL || ctx->inFile == NULL ||
        ctx->outFile == NULL || outputBuffer == NULL) {
        printf("%s[%d:%d] Invalid parameters(%s).\n",
        TAG, getpid(), gettid(), __FUNCTION__);
        return -1;
    }
    if (!ctx->stabilityTest && !ctx->pfTest) {
        fwrite(outputBuffer->vframe_buf.vir_ptr[0], outputBuffer->vframe_buf.size,
            1, ctx->outFile);
    }
    return ret;
}
static int do_decode_params_checking(MediaCodecTestContext *ctx,
    media_codec_buffer_t *outputBuffer) {
    media_codec_context_t *context;
    int32_t ret = 0;
    EXPECT_NE(ctx, nullptr);
    EXPECT_NE(ctx->context, nullptr);
    if (ctx == NULL || ctx->context == NULL || ctx->inFile == NULL ||
        ctx->outFile == NULL || outputBuffer == NULL) {
        printf("%s[%d:%d] Invalid parameters(%s).\n",
        TAG, getpid(), gettid(), __FUNCTION__);
        return -1;
    }
    context = ctx->context;
    if (ctx->enable_get_userdata) {
        mc_user_data_buffer_t userdata = {0};
        ret = hb_mm_mc_get_user_data(context, &userdata, 0);
        if (!ret) {
            printf("%s[%d:%d] Get userdata %d:\n", TAG, getpid(), gettid(), userdata.size);
            for (uint32_t i = 0; i < userdata.size; i++) {
                if (i < 16) {
                    printf("%s[%d:%d] userdata[i]:%x\n", TAG, getpid(), gettid(), userdata.virt_addr[i]);
                } else {
                    printf("%s[%d:%d] userdata[i]:%c\n", TAG, getpid(), gettid(), userdata.virt_addr[i]);
                }
            }
            ret = hb_mm_mc_release_user_data(context, &userdata);
        } else {
            ret = 0;
        }
    }
    return ret;
}
static void do_sync_decoding(void *arg) {
    int ret = 0;
    int step = 0;
    MediaCodecTestContext *ctx = (MediaCodecTestContext *)arg;
    media_codec_context_t *context;
    media_codec_callback_t callback;
    media_codec_buffer_t inputBuffer;
    media_codec_buffer_t outputBuffer;
    media_codec_output_buffer_info_t info;
    int32_t decStartTime = 0, decFinishTime = 0;
    ctx->workMode = THREAD_WORK_MODE_SYNC;
    ASSERT_EQ(check_and_init_test(ctx), 0);
    context = ctx->context;
    //get current time
    ctx->testStartTime = osal_gettime();
    if (ctx->testLog) {
        printf("%s[%d:%d] Step %d initialize (outFile=%s, FileFd=%p)\n",
            TAG, getpid(), gettid(), step++, ctx->outputFileName, ctx->outFile);
    }
    ret = hb_mm_mc_initialize(context);
    ASSERT_EQ(ret, (int32_t)0);
    callback.on_vlc_buffer_message = on_vlc_buffer_message;
    if (ctx->vlc_buf_size > 0) {
        ret = hb_mm_mc_set_vlc_buffer_listener(context, &callback, ctx);
        ASSERT_EQ(ret, (int32_t)0);
    }
    if (ctx->testLog) {
        printf("%s[%d:%d] Step %d configure\n", TAG, getpid(), gettid(), step++);
    }
    ret = hb_mm_mc_configure(context);
    EXPECT_EQ(ret, (int32_t)0);
    if (ctx->testLog) {
        printf("%s[%d:%d] Step %d start\n", TAG, getpid(), gettid(), step++);
    }
    mc_av_codec_startup_params_t startup_params;
    memset(&startup_params, 0x00, sizeof(mc_av_codec_startup_params_t));
    ret = hb_mm_mc_start(context, &startup_params);
    EXPECT_EQ(ret, (int32_t)0);
    do {
        if (!ctx->lastStream) {
            if (ctx->testLog) {
                printf("%s[%d:%d] Step %d dequeue input\n", TAG, getpid(), gettid(), step++);
            }
            // process input buffers
            ret = hb_mm_mc_dequeue_input_buffer(context, &inputBuffer, 3000);
            //EXPECT_EQ(ret, (int32_t)0);
            if (!ret) {
                if (ctx->testLog) {
                    printf("%s[%d:%d] input buffer viraddr %p phy addr %x, size = %d\n",
                    TAG, getpid(), gettid(), inputBuffer.vstream_buf.vir_ptr,
                    inputBuffer.vstream_buf.phy_ptr,
                    inputBuffer.vstream_buf.size);
                }
                if (ctx->testLog) {
                    printf("%s[%d:%d] Step %d feed input (pid=%d, tid=%d)\n", TAG, getpid(), gettid(), step++);
                }
                ret = read_input_streams(ctx, &inputBuffer);
                if (ret <= 0) {
                    printf("%s[%d:%d] There is no more input data(ret=%d)!\n",
                    TAG, getpid(), gettid(), ret);
                    inputBuffer.vstream_buf.stream_end = TRUE;
                    inputBuffer.vstream_buf.size = 0;
                    ctx->lastStream = 1;
                }
                //EXPECT_EQ(ret, (int32_t)TRUE);
                if (ctx->testLog) {
                    printf("%s[%d:%d] Step %d queue input(size=%d)\n",
                    TAG, getpid(), gettid(), step++, inputBuffer.vstream_buf.size);
                }
                ret = hb_mm_mc_queue_input_buffer(context, &inputBuffer, 100);
                EXPECT_EQ(ret, (int32_t)0);
                if (ret != 0) {
                    break;
                }
                if (ctx->delaytest) {
                    decStartTime = osal_gettime();
                }
            } else {
                if (ret != (int32_t)HB_MEDIA_ERR_WAIT_TIMEOUT) {
                    EXPECT_EQ(ret, (int32_t)0);
                    char info[256];
                    hb_mm_strerror(ret, info, 256);
                    printf("%s[%d:%d] dequeue input buffer fail.(%s)\n", TAG, getpid(), gettid(), info);
                    break;
                }
            }
        }
        if (!ctx->lastFrame) {
            if (ctx->testLog) {
            printf("%s[%d:%d] Step %d dequeue output\n", TAG, getpid(), gettid(), step++);
            }
            // process output buffers
            memset(&outputBuffer, 0x00, sizeof(media_codec_buffer_t));
            memset(&info, 0x00, sizeof(media_codec_output_buffer_info_t));
            ret = hb_mm_mc_dequeue_output_buffer(context, &outputBuffer, &info, 100);
            //EXPECT_EQ(ret, (int32_t)0);
            if (!ret) {
                if (ctx->testLog) {
                    printf("%s[%d:%d] output bufferviraddr %p phy addr %x, size = %d, outFile = %p\n",
                    TAG, getpid(), gettid(), outputBuffer.vframe_buf.vir_ptr[0],
                    outputBuffer.vframe_buf.phy_ptr[0],
                    outputBuffer.vframe_buf.size, ctx->outFile);
                }
                if (ctx->testLog) {
                    printf("%s[%d:%d] Step %d write output file\n", TAG, getpid(), gettid(), step++);
                }
                if (ctx->delaytest) {
                    decFinishTime = osal_gettime();
                    if ((decFinishTime - decStartTime) >= ctx->delaytime) {
                        printf("%s[%d:%d] Decoding time is %d, more than %dms\n",
                        TAG, getpid(), gettid(), (decFinishTime - decStartTime), ctx->delaytime);
                        ASSERT_LE((decFinishTime - decStartTime), ctx->delaytime);
                    }
                }
                ASSERT_EQ(write_output_frames(ctx, &outputBuffer), 0);
                if (ctx->testLog) {
                    printf("%s[%d:%d] Step %d queue output\n", TAG, getpid(), gettid(), step++);
                }
                ASSERT_EQ(do_decode_params_checking(ctx, &outputBuffer), 0);
                ret = hb_mm_mc_queue_output_buffer(context, &outputBuffer, 100);
                EXPECT_EQ(ret, (int32_t)0);
                if (outputBuffer.vframe_buf.frame_end) {
                    printf("%s[%d:%d] There is no more output data!\n", TAG, getpid(), gettid());
                    ctx->lastFrame = 1;
                    break;
                }
                if (ret) {
                    break;
                }
            } else {
                char info[256];
                hb_mm_strerror(ret, info, 256);
                printf("%s[%d:%d] dequeue output buffer fail.(%s)\n", TAG, getpid(), gettid(), info);
                if (ret != (int32_t)HB_MEDIA_ERR_WAIT_TIMEOUT) {
                    EXPECT_EQ(ret, (int32_t)0);
                    break;
                }
                if (ctx->stabilityTest && ctx->lastStream ==1) {
                    break;
                }
            }
        }
    }while(TRUE);
    ret = hb_mm_mc_stop(context);
    EXPECT_EQ(ret, (int32_t)0);
    ret = hb_mm_mc_release(context);
    EXPECT_EQ(ret, (int32_t)0);
    ASSERT_EQ(check_and_release_test(ctx), 0);
}
int main(int argc, char *argv[])
{
    char outputFileName[MAX_FILE_PATH] = "input.h265";
    char inputFileName[MAX_FILE_PATH] = "output.yuv";
    mTestWidth = 640;
    mTestHeight = 480;
    mTestPixFmt = MC_PIXEL_FORMAT_YUV420P;
    mTestFeedMode = MC_FEEDING_MODE_FRAME_SIZE;
    mTestCodec = TEST_CODEC_ID_H265;
    mc_video_codec_dec_params_t *params;
    media_codec_context_t *context = (media_codec_context_t *)malloc(sizeof(media_codec_context_t ));
    ASSERT_NE(context, nullptr);
    memset(context, 0x00, sizeof(media_codec_context_t));
    context->codec_id = get_codec_id(mTestCodec);
    context->encoder = FALSE;
    params = &context->video_dec_params;
    params->feed_mode = mTestFeedMode;
    params->pix_fmt = mTestPixFmt;
    params->bitstream_buf_size = mTestWidth * mTestHeight * 3 / 2;
    params->bitstream_buf_count = 6;
    params->frame_buf_count = 8;
    if (context->codec_id == MEDIA_CODEC_ID_H265) {
        params->h265_dec_config.bandwidth_Opt = TRUE;
        params->h265_dec_config.reorder_enable = TRUE;
        params->h265_dec_config.skip_mode = 0;
        params->h265_dec_config.cra_as_bla = FALSE;
        params->h265_dec_config.dec_temporal_id_mode = 0;
        params->h265_dec_config.target_dec_temporal_id_plus1 = 0;
    }
    MediaCodecTestContext ctx;
    memset(&ctx, 0x00, sizeof(ctx));
    ctx.context = context;
    ctx.inputFileName = inputFileName;
    ctx.outputFileName = outputFileName;
    char inputMd5FileName[MAX_FILE_PATH];
    if (ctx.md5Test) {
        char inputMd5Suffix[MAX_FILE_PATH] = ".md5";
        snprintf(dedicatedSuffix, MAX_FILE_PATH, "%s", "dec");
        snprintf(inputMd5FileName, MAX_FILE_PATH, "%s%s_%s_%s%s",
        dedicatedInputPrefix, mGlobalPixFmtName[mTestPixFmt],
        dedicatedSuffix, mGlobalCodecName[mTestCodec], inputMd5Suffix);
        ctx.inputMd5FileName = inputMd5FileName;
    }
    do_sync_decoding(&ctx);
    if (context != NULL) {
        free(context);
    }
}
```

#### hb\_mm\_mc\_release\_user\_data

【函数声明】

hb\_s32 hb\_mm\_mc\_release\_user\_data(media\_codec\_context\_t \*
context, const mc\_user\_data\_buffer\_t \* params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_user\_data\_buffer\_t \* params： 用户数据

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

释放解码流中的用户数据，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_user_data](#hb_mm_mc_get_user_data)

#### hb\_mm\_mc\_get\_mjpeg\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_mjpeg\_config(media\_codec\_context\_t
\*context, mc\_mjpeg\_enc\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_mjpeg\_enc\_params\_t \*params：MJPEG 编码参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 MJPEG 编码参数，适用于 MJPEG。

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
int main(int argc, char *argv[])
{
    int ret = 0;
    char outputFileName[MAX_FILE_PATH];
    char inputFileName[MAX_FILE_PATH];
    mTestCodec = TEST_CODEC_ID_MJPEG;
    mTestPixFmt = MC_PIXEL_FORMAT_NV12;
    char dedicatedSuffix[MAX_FILE_PATH] = "_test";
    char inputSuffix[MAX_FILE_PATH] = ".yuv";
    char outputSuffixJpeg[MAX_FILE_PATH] = ".jpg";
    char outputSuffixMjpg[MAX_FILE_PATH] = ".mjpg";
    snprintf(inputFileName, MAX_FILE_PATH, "%s%s%s",
        mInputSpecPrefix, mTest12Bit ? mGlobal12BPixFmtName[mTestPixFmt]
        : mGlobalPixFmtName[mTestPixFmt], inputSuffix);
    snprintf(outputFileName, MAX_FILE_PATH, "%s%s%s%s",
        mOutputSpecPrefix, mTest12Bit ? mGlobal12BPixFmtName[mTestPixFmt]
        : mGlobalPixFmtName[mTestPixFmt], dedicatedSuffix,
    mTestCodec == TEST_CODEC_ID_JPEG ? outputSuffixJpeg : outputSuffixMjpg);
    mc_video_codec_enc_params_t *params;
    media_codec_context_t *context = (media_codec_context_t *)malloc(sizeof(media_codec_context_t ));
    ASSERT_NE(context, nullptr);
    memset(context, 0x00, sizeof(media_codec_context_t));
    context->codec_id = mTestCodec == TEST_CODEC_ID_JPEG ?
        MEDIA_CODEC_ID_JPEG : MEDIA_CODEC_ID_MJPEG;
    context->encoder = TRUE;
    params = &context->video_enc_params;
    params->width = mTestWidth;
    params->height = mTestHeight;
    params->pix_fmt = mTestPixFmt;
    params->frame_buf_count = 5;
    params->bitstream_buf_count = 5;
    params->rot_degree = MC_CCW_0;
    params->mir_direction = MC_DIRECTION_NONE;
    params->frame_cropping_flag = FALSE;
    params->external_frame_buf = FALSE;
    if (context->codec_id == MEDIA_CODEC_ID_MJPEG) {
        params->rc_params.mode = MC_AV_RC_MODE_MJPEGFIXQP;
        ret = hb_mm_mc_get_rate_control_config(context, &params->rc_params);
        ASSERT_EQ(ret, (int32_t)0);
        params->mjpeg_enc_config.restart_interval = mTestWidth/16;
        params->mjpeg_enc_config.extended_sequential = mTest12Bit;
    } else {
        params->jpeg_enc_config.restart_interval = mTestWidth/16;
        params->jpeg_enc_config.extended_sequential = mTest12Bit;
    }
    mc_mjpeg_enc_params_t mjpeg_params;
    memset(&mjpeg_params, 0x00, sizeof(mjpeg_params));
    ret = hb_mm_mc_get_mjpeg_config(context, &mjpeg_params);
    ASSERT_EQ(ret, (int32_t)0);
    ret = hb_mm_mc_initialize(context);
    ASSERT_EQ(ret, (int32_t)0);
    ret = hb_mm_mc_set_mjpeg_config(context, &mjpeg_params);
    ASSERT_EQ(ret, (int32_t)0);
    ret = hb_mm_mc_stop(context);
    ASSERT_EQ(ret, (int32_t)0);
    ret = hb_mm_mc_release(context);
    ASSERT_EQ(ret, (int32_t)0);
    if (context != NULL) {
        free(context);
    }
}
```

#### hb\_mm\_mc\_set\_mjpeg\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_mjpeg\_config(media\_codec\_context\_t
\*context, const mc\_mjpeg\_enc\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_mjpeg\_enc\_params\_t \*params：MJPEG 编码参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置 MJPEG 编码参数，该参数为动态参数，适用于 MJPEG。

【示例代码】

参考 [hb_mm_mc_get_mjpeg_config](#hb_mm_mc_get_mjpeg_config)

#### hb\_mm\_mc\_get\_jpeg\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_jpeg\_config(media\_codec\_context\_t
\*context, mc\_jpeg\_enc\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_jpeg\_enc\_params\_t \*params：JPEG 编码参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 JPEG 编码参数，适用于 JPEG。

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
int main(int argc, char *argv[])
{
    int ret = 0;
    char outputFileName[MAX_FILE_PATH];
    char inputFileName[MAX_FILE_PATH];
    mTestCodec = TEST_CODEC_ID_JPEG;
    mTestPixFmt = MC_PIXEL_FORMAT_NV12;
    char dedicatedSuffix[MAX_FILE_PATH] = "_test";
    char inputSuffix[MAX_FILE_PATH] = ".yuv";
    char outputSuffixJpeg[MAX_FILE_PATH] = ".jpg";
    char outputSuffixMjpg[MAX_FILE_PATH] = ".mjpg";
    snprintf(inputFileName, MAX_FILE_PATH, "%s%s%s",
        mInputSpecPrefix, mTest12Bit ? mGlobal12BPixFmtName[mTestPixFmt]
        : mGlobalPixFmtName[mTestPixFmt], inputSuffix);
    snprintf(outputFileName, MAX_FILE_PATH, "%s%s%s%s",
        mOutputSpecPrefix, mTest12Bit ? mGlobal12BPixFmtName[mTestPixFmt]
        : mGlobalPixFmtName[mTestPixFmt], dedicatedSuffix,
        mTestCodec == TEST_CODEC_ID_JPEG ? outputSuffixJpeg : outputSuffixMjpg);
    mc_video_codec_enc_params_t *params;
    media_codec_context_t *context = (media_codec_context_t *)malloc(sizeof(media_codec_context_t ));
    ASSERT_NE(context, nullptr);
    memset(context, 0x00, sizeof(media_codec_context_t));
    context->codec_id = mTestCodec == TEST_CODEC_ID_JPEG ?
    MEDIA_CODEC_ID_JPEG : MEDIA_CODEC_ID_MJPEG;
    context->encoder = TRUE;
    params = &context->video_enc_params;
    params->width = mTestWidth;
    params->height = mTestHeight;
    params->pix_fmt = mTestPixFmt;
    params->frame_buf_count = 5;
    params->bitstream_buf_count = 5;
    params->rot_degree = MC_CCW_0;
    params->mir_direction = MC_DIRECTION_NONE;
    params->frame_cropping_flag = FALSE;
    params->external_frame_buf = FALSE;
    if (context->codec_id == MEDIA_CODEC_ID_MJPEG) {
        params->rc_params.mode = MC_AV_RC_MODE_MJPEGFIXQP;
        ret = hb_mm_mc_get_rate_control_config(context, &params->rc_params);
        ASSERT_EQ(ret, (int32_t)0);
        params->mjpeg_enc_config.restart_interval = mTestWidth/16;
        params->mjpeg_enc_config.extended_sequential = mTest12Bit;
    } else {
        params->jpeg_enc_config.restart_interval = mTestWidth/16;
        params->jpeg_enc_config.extended_sequential = mTest12Bit;
    }
    mc_jpeg_enc_params_t jpeg_params;
    memset(&jpeg_params, 0x00, sizeof(jpeg_params));
    ret = hb_mm_mc_get_jpeg_config(context, &jpeg_params);
    ASSERT_EQ(ret, (int32_t)0);
    ret = hb_mm_mc_initialize(context);
    ASSERT_EQ(ret, (int32_t)0);
    jpeg_params.quality_factor = 30;
    jpeg_params.restart_interval = (((params->width+15)>>4) *
        ((params->height+15)>>4) * 2) + 1;
    jpeg_params.crop_en = FALSE;
    ret = hb_mm_mc_set_jpeg_config(context, &jpeg_params);
    ASSERT_EQ(ret, (int32_t)HB_MEDIA_ERR_INVALID_PARAMS);
    jpeg_params.restart_interval = 70;
    ret = hb_mm_mc_set_jpeg_config(context, &jpeg_params);
    ASSERT_EQ(ret, (int32_t)0);
    ret = hb_mm_mc_stop(context);
    ASSERT_EQ(ret, (int32_t)0);
    ret = hb_mm_mc_release(context);
    ASSERT_EQ(ret, (int32_t)0);
    if (context != NULL) {
        free(context);
    }
}
```

#### hb\_mm\_mc\_set\_jpeg\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_jpeg\_config(media\_codec\_context\_t
\*context, const mc\_jpeg\_enc\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_jpeg\_enc\_params\_t \*params：JPEG 编码参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置 JPEG 编码参数，该参数为动态参数，适用于 JPEG。

【示例代码】

参考 [hb_mm_mc_get_jpeg_config](#hb_mm_mc_get_jpeg_config)

#### hb\_mm\_mc\_get\_fd

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_fd(media\_codec\_context\_t \* context, hb\_s32
\*fd)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] hb\_s32 \*fd：设备节点 fd

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取设备节点 fd，可用于 select 操作，监听编解码结果。

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"

typedef struct MediaCodecTestContext {
    media_codec_context_t *context;
    char *inputFileName;
    char *outputFileName;
    int abnormal;
    int32_t duration; // s
} MediaCodecTestContext;

Uint64 osal_gettime(void)
{
    struct timespec tp;

    clock_gettime(CLOCK_MONOTONIC, &tp);

    return ((Uint64)tp.tv_sec*1000 + tp.tv_nsec/1000000);
}

static void do_poll_encoding_select(void *arg) {
    hb_s32 ret = 0;
    int pollFd = -1;
    FILE *outFile;
    int lastStream = 0;
    fd_set readFds;
    MediaCodecTestContext *ctx = (MediaCodecTestContext *)arg;
    media_codec_context_t *context = ctx->context;
    char *outputFileName = ctx->outputFileName;
    mc_inter_status_t status;

    outFile = fopen(outputFileName, "wb");
    if (!outFile) {
        goto ERR;
    }

    ret = hb_mm_mc_get_fd(context, &pollFd);
    if (ret) {
        goto ERR;
    }

    do {
        FD_ZERO(&readFds);
        FD_SET(pollFd, &readFds);
        ret = select(pollFd+1, &readFds, NULL, NULL, NULL);
        if (ret < 0) {
            printf("Failed to select fd = %d.(err %s)\n", pollFd, strerror(errno));
            ctx->abnormal = TRUE;
            break;
        } else if (ret == 0) {
            printf("Time out to select fd = %d.\n", pollFd);
            ctx->abnormal = TRUE;
            break;
        } else {
            if (FD_ISSET(pollFd, &readFds)) {
                ASSERT_EQ(hb_mm_mc_get_status(context, &status), (int32_t)0);
                if (ctx->testLog) {
                    printf("%s[%d:%d] output count %d input count %d\n", TAG, getpid(), gettid(),
                    status.cur_output_buf_cnt, status.cur_input_buf_cnt);
                }
                media_codec_buffer_t outputBuffer;
                media_codec_output_buffer_info_t info;
                memset(&outputBuffer, 0x00, sizeof(media_codec_buffer_t));
                memset(&info, 0x00, sizeof(media_codec_output_buffer_info_t));
                ret = hb_mm_mc_dequeue_output_buffer(context, &outputBuffer, &info, 100);
                if (!ret && outFile) {
                    fwrite(outputBuffer.vstream_buf.vir_ptr, outputBuffer.vstream_buf.size, 1, outFile);
                    ret = hb_mm_mc_queue_output_buffer(context, &outputBuffer, 100);

                    if (outputBuffer.vstream_buf.stream_end) {
                        printf("%There is no more output data!\n");
                        lastStream = 1;
                        break;
                    }
                    if (ret) {
                        ctx->abnormal = TRUE;
                        break;
                    }
                } else {
                    if (ret != (int32_t)HB_MEDIA_ERR_WAIT_TIMEOUT) {
                        printf("Dequeue output buffer fail.\n");
                        break;
                    }
                }
            }
        }
    } while (!lastStream && !ctx->abnormal);

ERR:
    if (pollFd) {
        hb_mm_mc_close_fd(context, pollFd)
    }
    if (outFile)
        fclose(outFile);
}

static void do_poll_encoding(void *arg) {
    pthread_t thread_id;
    void* retVal;
    hb_s32 ret = 0;
    FILE *inFile;
    int noMoreInput = 0;
    MediaCodecTestContext *ctx = (MediaCodecTestContext *)arg;
    media_codec_context_t *context = ctx->context;

    char *inputFileName = ctx->inputFileName;
    char *outputFileName = ctx->outputFileName;
    media_codec_state_t state = MEDIA_CODEC_STATE_NONE;
    inFile = fopen(inputFileName, "rb");
    if (!inFile) {
        goto ERR;
    }

    ret = hb_mm_mc_initialize(context);
    if (ret) {
        goto ERR;
    }

    ret = hb_mm_mc_configure(context);
    if (ret) {
        goto ERR;
    }

    mc_av_codec_startup_params_t startup_params;
    startup_params.video_enc_startup_params.receive_frame_number = 0;
    ret = hb_mm_mc_start(context, &startup_params);
    if (ret) {
        goto ERR;
    }

    pthread_create(&thread_id, NULL, (void* (*)(void*))do_poll_encoding_select, ctx);

    do {
        media_codec_buffer_t inputBuffer;
        memset(&inputBuffer, 0x00, sizeof(media_codec_buffer_t));
        ret = hb_mm_mc_dequeue_input_buffer(context, &inputBuffer, 100);
        if (!ret) {
            ret = fread(inputBuffer.vframe_buf.vir_ptr[0], 1,
                inputBuffer.vframe_buf.size, inFile);
            if (!ret) {
                printf("There is no more input data!\n");
                inputBuffer.vframe_buf.frame_end = TRUE;
                noMoreInput = 1;
            }
            ret = hb_mm_mc_queue_input_buffer(context, &inputBuffer, 100);
            if (ret) {
                printf("Queue input buffer fail.\n");
                break;
            }
        } else {
            if (ret != (int32_t)HB_MEDIA_ERR_WAIT_TIMEOUT) {
                printf("Dequeue input buffer fail.\n");
                break;
            }
        }
    }while(!noMoreInput && !ctx->abnormal);

    pthread_join(thread_id, &retVal);

    hb_mm_mc_stop(context);

    hb_mm_mc_release(context);
    context = NULL;

ERR:
    hb_mm_mc_get_state(context, &state);
    if (context && state != MEDIA_CODEC_STATE_UNINITIALIZED) {
        hb_mm_mc_stop(context);
        hb_mm_mc_release(context);
    }

    if (inFile)
        fclose(inFile);
}

int main(int argc, char *argv[])
{
    hb_s32 ret = 0;
    char outputFileName[MAX_FILE_PATH] = "./tmp.yuv";
    char inputFileName[MAX_FILE_PATH] = "./output.stream";
    mc_video_codec_enc_params_t *params;
    media_codec_context_t context;

    memset(&context, 0x00, sizeof(media_codec_context_t));
    context.codec_id = MEDIA_CODEC_ID_H265;
    context.encoder = TRUE;
    params = &context.video_enc_params;
    params->width = 640;
    params->height = 480;
    params->pix_fmt = MC_PIXEL_FORMAT_YUV420P;
    params->frame_buf_count = 5;
    params->external_frame_buf = FALSE;
    params->bitstream_buf_count = 5;
    params->rc_params.mode = MC_AV_RC_MODE_H265CBR;
    ret = hb_mm_mc_get_rate_control_config(&context, &params->rc_params);
    if (ret) {
        return -1;
    }
    params->rc_params.h265_cbr_params.bit_rate = 5000;
    params->rc_params.h265_cbr_params.frame_rate = 30;
    params->rc_params.h265_cbr_params.intra_period = 30;
    params->gop_params.decoding_refresh_type = 2;
    params->gop_params.gop_preset_idx = 2;
    params->rot_degree = MC_CCW_0;
    params->mir_direction = MC_DIRECTION_NONE;
    params->frame_cropping_flag = FALSE;

    MediaCodecTestContext ctx;
    memset(&ctx, 0x00, sizeof(ctx));
    ctx.context = &context;
    ctx.inputFileName = inputFileName;
    ctx.outputFileName = outputFileName;
    ctx.duration = 5;
    do_poll_encoding(&ctx);
}
```

#### hb\_mm\_mc\_close\_fd

【函数声明】

hb\_s32 hb\_mm\_mc\_close\_fd(media\_codec\_context\_t \* context,
hb\_s32 fd)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] hb\_s32 fd：设备节点 fd

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

关闭设备节点。

【示例代码】

参考 [hb_mm_mc_get_fd](#hb_mm_mc_get_fd)

#### hb\_mm\_mc\_set\_camera

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_camera(media\_codec\_context\_t \*context,
hb\_s32 pipeline, hb\_s32 channel\_port\_id)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] hb\_s32 pipeline：pipeline
- \[IN\] hb\_s32 channel\_port\_id：通道端口号

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置 VIO 的 camera 信息，该参数为静态参数，适用于 H264/H265。

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
typedef struct _media_codec_context {
    media_codec_id_t codec_id;
    hb_bool encoder;
    hb_s32 instance_index;
    union {
        mc_video_codec_enc_params_t video_enc_params;
        mc_video_codec_dec_params_t video_dec_params;
        mc_audio_codec_enc_params_t audio_enc_params;
        mc_audio_codec_dec_params_t audio_dec_params;
    };
} media_codec_context_t;
void MediaCodecAPITest::init_params_H265() {
    memset(&context, 0x00, sizeof(media_codec_context_t));
    context.codec_id = MEDIA_CODEC_ID_H265;
    context.encoder = TRUE;
    params = &context.video_enc_params;
    params->width = mGlobalWidth;
    params->height = mGlobalHeight;
    params->pix_fmt = mGlobalPixFmt;
    params->frame_buf_count = 5;
    params->external_frame_buf = FALSE;
    params->bitstream_buf_count = 5;
    params->rc_params.mode = MC_AV_RC_MODE_H265CBR;
    EXPECT_EQ(hb_mm_mc_get_rate_control_config(&context, &params->rc_params), (int32_t)0);
    params->rc_params.h265_cbr_params.bit_rate = 5000;
    params->rc_params.h265_cbr_params.frame_rate = 30;
    params->rc_params.h265_cbr_params.intra_period = 6;
    params->gop_params.decoding_refresh_type = 2;
    params->gop_params.gop_preset_idx = 2;
    params->rot_degree = MC_CCW_0;
    params->mir_direction = MC_DIRECTION_NONE;
    params->frame_cropping_flag = FALSE;
}
int main(int argc, char *argv[])
{
    init_params_H265();
    EXPECT_EQ(hb_mm_mc_initialize(&context), (int32_t)0);
    EXPECT_EQ(hb_mm_mc_set_camera(&context, 1, 1), (int32_t)0);
    EXPECT_EQ(hb_mm_mc_release(&context), (int32_t)0);
}
```

#### hb\_mm\_mc\_get\_vui\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_vui\_config(media\_codec\_context\_t \*context,
mc\_video\_vui\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] mc\_video\_vui\_ params\_t \*params：VUI 参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 VUI 参数。

【其他说明】

目前 video 编码时设置头信息中的默认 color range 为 full
range 模式，如果设置 limit
range 需要显式调用 hb\_mm\_mc\_set\_vui\_config 接口。

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
typedef enum ENC_CONFIG_MESSAGE {
    ENC_CONFIG_NONE = (0 << 0),
    ENC_CONFIG_LONGTERM_REF = (1 << 0),
    ENC_CONFIG_INTRA_REFRESH = (1 << 1),
    ENC_CONFIG_RATE_CONTROL = (1 << 2),
    ENC_CONFIG_DEBLK_FILTER = (1 << 3),
    ENC_CONFIG_SAO = (1 << 4),
    ENC_CONFIG_ENTROPY = (1 << 5),
    ENC_CONFIG_VUI_TIMING = (1 << 6),
    ENC_CONFIG_SLICE = (1 << 7),
    ENC_CONFIG_REQUEST_IDR = (1 << 8),
    ENC_CONFIG_SKIP_PIC = (1 << 9),
    ENC_CONFIG_SMART_BG = (1 << 10),
    ENC_CONFIG_MONOCHROMA = (1 << 11),
    ENC_CONFIG_PRED_UNIT = (1 << 12),
    ENC_CONFIG_TRANSFORM = (1 << 13),
    ENC_CONFIG_ROI = (1 << 14),
    ENC_CONFIG_MODE_DECISION = (1 << 15),
    ENC_CONFIG_USER_DATA = (1 << 16),
    ENC_CONFIG_MJPEG = (1 << 17),
    ENC_CONFIG_JPEG = (1 << 18),
    ENC_CONFIG_CAMERA = (1 << 19),
    ENC_CONFIG_INSERT_USERDATA = (1 << 20),
    ENC_CONFIG_VUI = (1 << 21),
    ENC_CONFIG_3DNR = (1 << 22),
    ENC_CONFIG_REQUEST_IDR_HEADER = (1 << 23),
    ENC_CONFIG_ENABLE_IDR = (1 << 24),
    ENC_CONFIG_TOTAL = (1 << 25),
} ENC_CONFIG_MESSAGE;
typedef struct MediaCodecTestContext {
    media_codec_context_t *context;
    char *inputFileName;
    char *outputFileName;
    int32_t duration; // s
    ENC_CONFIG_MESSAGE message;
    mc_video_longterm_ref_mode_t ref_mode;
    mc_rate_control_params_t rc_params;
    mc_video_intra_refresh_params_t intra_refr;
    mc_video_deblk_filter_params_t deblk_filter;
    mc_h265_sao_params_t sao;
    mc_h264_entropy_params_t entropy;
    mc_video_vui_params_t vui;
    mc_video_vui_timing_params_t vui_timing;
    mc_video_slice_params_t slice;
    mc_video_3dnr_enc_params_t noise_reduction;
    mc_video_smart_bg_enc_params_t smart_bg;
    mc_video_pred_unit_params_t pred_unit;
    mc_video_transform_params_t transform;
    mc_video_roi_params_t roi;
    mc_video_mode_decision_params_t mode_decision;
} MediaCodecTestContext;
Uint64 osal_gettime(void)
{
    struct timespec tp;
    clock_gettime(CLOCK_MONOTONIC, &tp);
    return ((Uint64)tp.tv_sec*1000 + tp.tv_nsec/1000000);
}
uint8_t uuid[] =
"dc45e9bd-e6d948b7-962cd820-d923eeef+HorizonAI";
static void set_message(MediaCodecTestContext *ctx) {
    int ret = 0;
    media_codec_context_t *context = ctx->context;
    if (ctx->message & ENC_CONFIG_VUI) {
        hb_mm_mc_get_vui_config(context, &ctx->vui);
        ret = hb_mm_mc_set_vui_config(context, &ctx->vui);
    }
}
static void do_sync_encoding(void *arg) {
    hb_s32 ret = 0;
    FILE *inFile;
    FILE *outFile;
    int noMoreInput = 0;
    int lastStream = 0;
    Uint64 lastTime = 0;
    Uint64 curTime = 0;
    int needFlush = 1;
    MediaCodecTestContext *ctx = (MediaCodecTestContext *)arg;
    media_codec_context_t *context = ctx->context;
    char *inputFileName = ctx->inputFileName;
    char *outputFileName = ctx->outputFileName;
    media_codec_state_t state = MEDIA_CODEC_STATE_NONE;
    inFile = fopen(inputFileName, "rb");
    if (!inFile) {
        goto ERR;
    }
    outFile = fopen(outputFileName, "wb");
    if (!outFile) {
        goto ERR;
    }
    //get current time
    lastTime = osal_gettime();
    ret = hb_mm_mc_initialize(context);
    if (ret) {
        goto ERR;
    }
    ret = hb_mm_mc_configure(context);
    if (ret) {
        goto ERR;
    }
    mc_av_codec_startup_params_t startup_params;
    startup_params.video_enc_startup_params.receive_frame_number = 0;
    ret = hb_mm_mc_start(context, &startup_params);
    if (ret) {
        goto ERR;
    }
    ret = hb_mm_mc_pause(context);
    if (ret) {
        goto ERR;
    }
    do {
    set_message(ctx);
    if (!noMoreInput) {
        media_codec_buffer_t inputBuffer;
        memset(&inputBuffer, 0x00, sizeof(media_codec_buffer_t));
        ret = hb_mm_mc_dequeue_input_buffer(context, &inputBuffer, 100);
        if (!ret) {
            curTime = osal_gettime();
            if ((curTime - lastTime)/1000 < (uint32_t)ctx->duration) {
                ret = fread(inputBuffer.vframe_buf.vir_ptr[0], 1,
                inputBuffer.vframe_buf.size, inFile);
                if (ret <= 0) {
                    if(fseek(inFile, 0, SEEK_SET)) {
                        printf("Failed to rewind input filen");
                    } else {
                        ret = fread(inputBuffer.vframe_buf.vir_ptr[0], 1,
                        inputBuffer.vframe_buf.size, inFile);
                        if (ret <= 0) {
                            printf("Failed to read input filen");
                        }
                    }
                }
            } else {
                printf("Time up(%d)n",ctx->duration);
                ret = 0;
            }
            if (!ret) {
                printf("There is no more input data!n");
                inputBuffer.vframe_buf.frame_end = TRUE;
                noMoreInput = 1;
            }
            ret = hb_mm_mc_queue_input_buffer(context, &inputBuffer, 100);
            if (ret) {
                printf("Queue input buffer fail.n");
                break;
            }
        } else {
            if (ret != (int32_t)HB_MEDIA_ERR_WAIT_TIMEOUT) {
                printf("Dequeue input buffer fail.n");
                break;
            }
        }
    }
    if (!lastStream) {
        media_codec_buffer_t outputBuffer;
        media_codec_output_buffer_info_t info;
        memset(&outputBuffer, 0x00, sizeof(media_codec_buffer_t));
        memset(&info, 0x00, sizeof(media_codec_output_buffer_info_t));
        ret = hb_mm_mc_dequeue_output_buffer(context, &outputBuffer, &info,
        3000);
        if (!ret && outFile) {
            fwrite(outputBuffer.vstream_buf.vir_ptr,
                outputBuffer.vstream_buf.size, 1, outFile);
            ret = hb_mm_mc_queue_output_buffer(context, &outputBuffer, 100);
            if (ret) {
                printf("Queue output buffer fail.n");
                break;
            }
            if (outputBuffer.vstream_buf.stream_end) {
                printf("There is no more output data!n");
                lastStream = 1;
                break;
            }
        } else {
            if (ret != (int32_t)HB_MEDIA_ERR_WAIT_TIMEOUT) {
                printf("Dequeue output buffer fail.n");
                break;
            }
        }
    }
    if (needFlush) {
        ret = hb_mm_mc_flush(context);
        needFlush = 0;
        if (ret) {
            break;
        }
    }
}while(TRUE);
hb_mm_mc_stop(context);
hb_mm_mc_release(context);
context = NULL;
ERR:
hb_mm_mc_get_state(context, &state);
if (context && state!=
    MEDIA_CODEC_STATE_UNINITIALIZED) {
    hb_mm_mc_stop(context);
    hb_mm_mc_release(context);
}
if (inFile)
    fclose(inFile);
if (outFile)
    fclose(outFile);
}
int main(int argc, char *argv[])
{
    hb_s32 ret = 0;
    char outputFileName[MAX_FILE_PATH] = "./tmp.yuv";
    char inputFileName[MAX_FILE_PATH] = "./output.stream";
    mc_video_codec_enc_params_t *params;
    media_codec_context_t context;
    memset(&context, 0x00, sizeof(media_codec_context_t));
    context.codec_id = MEDIA_CODEC_ID_H265;
    context.encoder = TRUE;
    params = &context.video_enc_params;
    params->width = 640;
    params->height = 480;
    params->pix_fmt = MC_PIXEL_FORMAT_YUV420P;
    params->frame_buf_count = 5;
    params->external_frame_buf = FALSE;
    params->bitstream_buf_count = 5;
    params->rc_params.mode = MC_AV_RC_MODE_H265CBR;
    ret = hb_mm_mc_get_rate_control_config(&context, &params->rc_params);
    if (ret) {
        return -1;
    }
    params->rc_params.h265_cbr_params.bit_rate = 5000;
    params->rc_params.h265_cbr_params.frame_rate = 30;
    params->rc_params.h265_cbr_params.intra_period = 30;
    params->gop_params.decoding_refresh_type = 2;
    params->gop_params.gop_preset_idx = 2;
    params->rot_degree = MC_CCW_0;
    params->mir_direction = MC_DIRECTION_NONE;
    params->frame_cropping_flag = FALSE;
    MediaCodecTestContext ctx;
    memset(&ctx, 0x00, sizeof(ctx));
    ctx.context = &context;
    ctx.inputFileName = inputFileName;
    ctx.outputFileName = outputFileName;
    mc_video_vui_params_t *vui = &ctx.vui;
    ret = hb_mm_mc_get_vui_config(context, vui);
    if (ret != 0) {
        return -1;
    }
    vui->h265_vui.video_signal_type_present_flag = 1;
    vui->h265_vui.video_format = 0;
    vui->h265_vui.video_full_range_flag = 0;
    ctx.message = ENC_CONFIG_VUI;
    do_sync_encoding(&ctx);
}
```

#### hb\_mm\_mc\_set\_vui\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_vui\_config(media\_codec\_context\_t \*context,
const mc\_video\_vui\_params\_t \*params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_video\_vui\_params\_t \*params：VUI 参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置 VUI 参数，该参数为静态参数。

【示例代码】

参考 [hb_mm_mc_get_vui_config](#hb_mm_mc_get_vui_config)

#### hb\_mm\_mc\_get\_3dnr\_enc\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_3dnr\_enc\_config(media\_codec\_context\_t
\*context, mc\_video\_3dnr\_enc\_params\_t \*params);

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] mc\_video\_3dnr\_enc\_params\_t \*params：3DNR 参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取3DNR 参数，该参数为动态参数，适用于 H265.

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
typedef enum ENC_CONFIG_MESSAGE {
    ENC_CONFIG_NONE = (0 << 0),
    ENC_CONFIG_LONGTERM_REF = (1 << 0),
    ENC_CONFIG_INTRA_REFRESH = (1 << 1),
    ENC_CONFIG_RATE_CONTROL = (1 << 2),
    ENC_CONFIG_DEBLK_FILTER = (1 << 3),
    ENC_CONFIG_SAO = (1 << 4),
    ENC_CONFIG_ENTROPY = (1 << 5),
    ENC_CONFIG_VUI_TIMING = (1 << 6),
    ENC_CONFIG_SLICE = (1 << 7),
    ENC_CONFIG_REQUEST_IDR = (1 << 8),
    ENC_CONFIG_SKIP_PIC = (1 << 9),
    ENC_CONFIG_SMART_BG = (1 << 10),
    ENC_CONFIG_MONOCHROMA = (1 << 11),
    ENC_CONFIG_PRED_UNIT = (1 << 12),
    ENC_CONFIG_TRANSFORM = (1 << 13),
    ENC_CONFIG_ROI = (1 << 14),
    ENC_CONFIG_MODE_DECISION = (1 << 15),
    ENC_CONFIG_USER_DATA = (1 << 16),
    ENC_CONFIG_MJPEG = (1 << 17),
    ENC_CONFIG_JPEG = (1 << 18),
    ENC_CONFIG_CAMERA = (1 << 19),
    ENC_CONFIG_INSERT_USERDATA = (1 << 20),
    ENC_CONFIG_VUI = (1 << 21),
    ENC_CONFIG_3DNR = (1 << 22),
    ENC_CONFIG_REQUEST_IDR_HEADER = (1 << 23),
    ENC_CONFIG_ENABLE_IDR = (1 << 24),
    ENC_CONFIG_TOTAL = (1 << 25),
} ENC_CONFIG_MESSAGE;
typedef struct MediaCodecTestContext {
    media_codec_context_t *context;
    char *inputFileName;
    char *outputFileName;
    int32_t duration; // s
    ENC_CONFIG_MESSAGE message;
    mc_video_longterm_ref_mode_t ref_mode;
    mc_rate_control_params_t rc_params;
    mc_video_intra_refresh_params_t intra_refr;
    mc_video_deblk_filter_params_t deblk_filter;
    mc_h265_sao_params_t sao;
    mc_h264_entropy_params_t entropy;
    mc_video_vui_params_t vui;
    mc_video_vui_timing_params_t vui_timing;
    mc_video_slice_params_t slice;
    mc_video_3dnr_enc_params_t noise_reduction;
    mc_video_smart_bg_enc_params_t smart_bg;
    mc_video_pred_unit_params_t pred_unit;
    mc_video_transform_params_t transform;
    mc_video_roi_params_t roi;
    mc_video_mode_decision_params_t mode_decision;
} MediaCodecTestContext;
Uint64 osal_gettime(void)
{
    struct timespec tp;
    clock_gettime(CLOCK_MONOTONIC, &tp);
    return ((Uint64)tp.tv_sec*1000 + tp.tv_nsec/1000000);
}
uint8_t uuid[] =
"dc45e9bd-e6d948b7-962cd820-d923eeef+HorizonAI";
static void set_message(MediaCodecTestContext *ctx) {
    int ret = 0;
    media_codec_context_t *context = ctx->context;
    if (ctx->message & ENC_CONFIG_VUI) {
        hb_mm_mc_get_vui_config(context, &ctx->vui);
        ret = hb_mm_mc_set_vui_config(context, &ctx->vui);
    }
}
static void do_sync_encoding(void *arg) {
    hb_s32 ret = 0;
    FILE *inFile;
    FILE *outFile;
    int noMoreInput = 0;
    int lastStream = 0;
    Uint64 lastTime = 0;
    Uint64 curTime = 0;
    int needFlush = 1;
    MediaCodecTestContext *ctx = (MediaCodecTestContext *)arg;
    media_codec_context_t *context = ctx->context;
    char *inputFileName = ctx->inputFileName;
    char *outputFileName = ctx->outputFileName;
    media_codec_state_t state = MEDIA_CODEC_STATE_NONE;
    inFile = fopen(inputFileName, "rb");
    if (!inFile) {
        goto ERR;
    }
    outFile = fopen(outputFileName, "wb");
    if (!outFile) {
        goto ERR;
    }
    //get current time
    lastTime = osal_gettime();
    ret = hb_mm_mc_initialize(context);
    if (ret) {
        goto ERR;
    }
    ret = hb_mm_mc_configure(context);
    if (ret) {
        goto ERR;
    }
    mc_av_codec_startup_params_t startup_params;
    startup_params.video_enc_startup_params.receive_frame_number = 0;
    ret = hb_mm_mc_start(context, &startup_params);
    if (ret) {
        goto ERR;
    }
    ret = hb_mm_mc_pause(context);
    if (ret) {
        goto ERR;
    }
    do {
    set_message(ctx);
    if (!noMoreInput) {
        media_codec_buffer_t inputBuffer;
        memset(&inputBuffer, 0x00, sizeof(media_codec_buffer_t));
        ret = hb_mm_mc_dequeue_input_buffer(context, &inputBuffer, 100);
        if (!ret) {
            curTime = osal_gettime();
            if ((curTime - lastTime)/1000 < (uint32_t)ctx->duration) {
                ret = fread(inputBuffer.vframe_buf.vir_ptr[0], 1,
                inputBuffer.vframe_buf.size, inFile);
                if (ret <= 0) {
                    if(fseek(inFile, 0, SEEK_SET)) {
                        printf("Failed to rewind input filen");
                    } else {
                        ret = fread(inputBuffer.vframe_buf.vir_ptr[0], 1,
                        inputBuffer.vframe_buf.size, inFile);
                        if (ret <= 0) {
                            printf("Failed to read input filen");
                        }
                    }
                }
            } else {
                printf("Time up(%d)n",ctx->duration);
                ret = 0;
            }
            if (!ret) {
                printf("There is no more input data!n");
                inputBuffer.vframe_buf.frame_end = TRUE;
                noMoreInput = 1;
            }
            ret = hb_mm_mc_queue_input_buffer(context, &inputBuffer, 100);
            if (ret) {
                printf("Queue input buffer fail.n");
                break;
            }
        } else {
            if (ret != (int32_t)HB_MEDIA_ERR_WAIT_TIMEOUT) {
                printf("Dequeue input buffer fail.n");
                break;
            }
        }
    }
    if (!lastStream) {
        media_codec_buffer_t outputBuffer;
        media_codec_output_buffer_info_t info;
        memset(&outputBuffer, 0x00, sizeof(media_codec_buffer_t));
        memset(&info, 0x00, sizeof(media_codec_output_buffer_info_t));
        ret = hb_mm_mc_dequeue_output_buffer(context, &outputBuffer, &info,
        3000);
        if (!ret && outFile) {
            fwrite(outputBuffer.vstream_buf.vir_ptr,
                outputBuffer.vstream_buf.size, 1, outFile);
            ret = hb_mm_mc_queue_output_buffer(context, &outputBuffer, 100);
            if (ret) {
                printf("Queue output buffer fail.n");
                break;
            }
            if (outputBuffer.vstream_buf.stream_end) {
                printf("There is no more output data!n");
                lastStream = 1;
                break;
            }
        } else {
            if (ret != (int32_t)HB_MEDIA_ERR_WAIT_TIMEOUT) {
                printf("Dequeue output buffer fail.n");
                break;
            }
        }
    }
    if (needFlush) {
        ret = hb_mm_mc_flush(context);
        needFlush = 0;
        if (ret) {
            break;
        }
    }
}while(TRUE);
hb_mm_mc_stop(context);
hb_mm_mc_release(context);
context = NULL;
ERR:
hb_mm_mc_get_state(context, &state);
if (context && state!=
    MEDIA_CODEC_STATE_UNINITIALIZED) {
    hb_mm_mc_stop(context);
    hb_mm_mc_release(context);
}
if (inFile)
    fclose(inFile);
if (outFile)
    fclose(outFile);
}
int main(int argc, char *argv[])
{
    hb_s32 ret = 0;
    char outputFileName[MAX_FILE_PATH] = "./tmp.yuv";
    char inputFileName[MAX_FILE_PATH] = "./output.stream";
    mc_video_codec_enc_params_t *params;
    media_codec_context_t context;
    memset(&context, 0x00, sizeof(media_codec_context_t));
    context.codec_id = MEDIA_CODEC_ID_H265;
    context.encoder = TRUE;
    params = &context.video_enc_params;
    params->width = 640;
    params->height = 480;
    params->pix_fmt = MC_PIXEL_FORMAT_YUV420P;
    params->frame_buf_count = 5;
    params->external_frame_buf = FALSE;
    params->bitstream_buf_count = 5;
    params->rc_params.mode = MC_AV_RC_MODE_H265CBR;
    ret = hb_mm_mc_get_rate_control_config(&context, &params->rc_params);
    if (ret) {
        return -1;
    }
    params->rc_params.h265_cbr_params.bit_rate = 5000;
    params->rc_params.h265_cbr_params.frame_rate = 30;
    params->rc_params.h265_cbr_params.intra_period = 30;
    params->gop_params.decoding_refresh_type = 2;
    params->gop_params.gop_preset_idx = 2;
    params->rot_degree = MC_CCW_0;
    params->mir_direction = MC_DIRECTION_NONE;
    params->frame_cropping_flag = FALSE;
    MediaCodecTestContext ctx;
    memset(&ctx, 0x00, sizeof(ctx));
    ctx.context = &context;
    ctx.inputFileName = inputFileName;
    ctx.outputFileName = outputFileName;
    mc_video_3dnr_enc_params_t *noise_rd = &ctx.noise_reduction;
    ret = hb_mm_mc_get_3dnr_enc_config(context, noise_rd);
    noise_rd->nr_y_enable = 0;
    noise_rd->nr_cb_enable = 0;
    noise_rd->nr_cr_enable = 0;
    noise_rd->nr_est_enable = 0;
    ctx.message = ENC_CONFIG_3DNR;
    do_sync_encoding(&ctx);
}
```

#### hb\_mm\_mc\_set\_3dnr\_enc\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_3dnr\_enc\_config(media\_codec\_context\_t
\*context, const mc\_video\_3dnr\_enc\_params\_t \*params);

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] const mc\_video\_3dnr\_enc\_params\_t \*params：3DNR 参数

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置3DNR 参数，该参数为动态参数，适用于 H265。

【示例代码】

参考 [hb_mm_mc_get_3dnr_enc_config](#hb_mm_mc_get_3dnr_enc_config)

#### hb\_mm\_mc\_request\_idr\_header

【函数声明】

hb\_s32 hb\_mm\_mc\_request\_idr\_header(media\_codec\_context\_t
\*context, hb\_u32 force\_header)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] hb\_u32 force\_header：

  > 0 : No froced header(VPS/SPS/PPS)
  >
  > 1 : Forced header before IDR frame
  >
  > 2 : Forced header before I frame for H264 or forced header before
  > CRA and IDR frame for H265
  >

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

请求帧头 IDR 帧头信息，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_enable\_idr\_frame

【函数声明】

hb\_s32 hb\_mm\_mc\_enable\_idr\_frame(media\_codec\_context\_t
\*context, hb\_bool enable)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] hb\_bool enable：0：不使能；1：使能；

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

使能 IDR 帧，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_register\_audio\_encoder

【函数声明】

hb\_s32 hb\_mm\_mc\_register\_audio\_encoder(hb\_s32 \*handle,
mc\_audio\_encode\_param\_t \*encoder)

【参数描述】

- \[IN\] hb\_s32 \*handle：编码器句柄
- \[IN\] mc\_audio\_encode\_param\_t \*encoder：audio 编码器描述符；

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

注册 audio 编码器，适用于 Audio。

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
#include "include/aac.h"
int main(int argc, char *argv[])
{
    mc_audio_codec_enc_params_t *params;
    media_codec_context_t context;
    memset(&context, 0x00, sizeof(media_codec_context_t));
    context.codec_id = MEDIA_CODEC_ID_AAC;
    context.encoder = TRUE;
    params = &context.audio_enc_params;
    params->bit_rate = 128000;
    params->frame_buf_count = 5;
    params->packet_count = 5;
    params->sample_fmt = MC_AV_SAMPLE_FMT_S16;
    params->sample_rate = MC_AV_SAMPLE_RATE_16000;
    params->channel_layout = MC_AV_CHANNEL_LAYOUT_STEREO;
    params->channels = 2;
    mc_aac_enc_config_t config;
    config.profile = MC_AAC_PROFILE_LOW;
    config.type = MC_AAC_DATA_TYPE_ADTS;
    params->enc_config = &config;
    int ret;
    int handle;
    mc_audio_encode_param_t encoder;
    encoder.ff_type = MEDIA_CODEC_ID_AAC;
    snprintf(encoder.ff_codec_name, sizeof(encoder.ff_codec_name), "aacenc");
    encoder.ff_audio_open_encoder = ff_audio_aac_open_encoder;
    encoder.ff_audio_encode_frame = ff_audio_aac_encode_frm;
    encoder.ff_audio_close_encoder = ff_audio_aac_close_encoder;
    ret = hb_mm_mc_register_audio_encoder(&handle, &encoder);
    printf("handle = %d\n", handle);
    ASSERT_EQ(ret, 0);
    ret = hb_mm_mc_unregister_audio_encoder(handle);
    ASSERT_EQ(ret, 0);
}
```

#### hb\_mm\_mc\_unregister\_audio\_encoder

【函数声明】

hb\_s32 hb\_mm\_mc\_unregister\_audio\_encoder(hb\_s32 handle)

【参数描述】

- \[IN\] hb\_s32 \*handle：编码器句柄

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

注销 audio 编码器，适用于 Audio。

【示例代码】

参考 [hb_mm_mc_register_audio_encoder](#hb_mm_mc_register_audio_encoder)

#### hb\_mm\_mc\_register\_audio\_decoder

【函数声明】

hb\_s32 hb\_mm\_mc\_register\_audio\_decoder(hb\_s32 \*handle,
mc\_audio\_decode\_param\_t \*decoder)

【参数描述】

- \[IN\] hb\_s32 \*handle：解码器句柄
- \[IN\] mc\_audio\_decode\_param\_t \*decoder：audio 解码器描述符；

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

注册 audio 解码器，适用于 Audio。

【示例代码】

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
#include "include/aac.h"
int main(int argc, char *argv[])
{
    mc_audio_codec_dec_params_t *params;
    media_codec_context_t context;
    memset(&context, 0x00, sizeof(media_codec_context_t));
    context.codec_id = MEDIA_CODEC_ID_AAC;
    context.encoder = FALSE;
    params = &context.audio_dec_params;
    params->feed_mode = MC_FEEDING_MODE_FRAME_SIZE;
    params->packet_buf_size = 1024;
    params->packet_count = 5;
    params->frame_cache_size = 5;
    params->frame_buf_count = 5;
    mc_aac_dec_config_t config;
    config.sample_rate = MC_AV_SAMPLE_RATE_8000;
    config.channels = 1;
    config.sample_fmt = MC_AV_SAMPLE_FMT_S16;
    params->dec_config = &config;
    mc_audio_decode_param_t decoder;
    decoder.ff_type = MEDIA_CODEC_ID_AAC;
    snprintf(decoder.ff_codec_name, sizeof(decoder.ff_codec_name), "aacdec");
    decoder.ff_audio_open_decoder = ff_audio_aac_open_decoder;
    decoder.ff_audio_decode_frame = ff_audio_aac_decode_frm;
    decoder.ff_audio_close_decoder = ff_audio_aac_close_decoder;
    ret = hb_mm_mc_register_audio_decoder(&handle, &decoder);
    ASSERT_EQ(ret, 0);
    ret = hb_mm_mc_unregister_audio_decoder(handle);
    ASSERT_EQ(ret, 0);
}
```

#### hb\_mm\_mc\_unregister\_audio\_decoder

【函数声明】

hb\_s32 hb\_mm\_mc\_unregister\_audio\_decoder(hb\_s32 handle)

【参数描述】

- \[IN\] hb\_s32 \*handle：解码器句柄；

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

注销 audio 解码器，适用于 Audio。

【示例代码】

参考 [hb_mm_mc_register_audio_decoder](#hb_mm_mc_register_audio_decoder)

#### hb\_mm\_mc\_get\_explicit\_header\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_explicit\_header\_config
(media\_codec\_context\_t \*context, hb\_s32 \*status)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] hb\_s32 \*status：使能/不使能头信息和 IDR 帧编码成一帧

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取头信息和 IDR 帧是否编码成一帧的配置，0：IDR 和头信息独立，1：IDR 和头信息合成一帧，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_explicit\_header\_config

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_explicit\_header\_config
(media\_codec\_context\_t \*context, hb\_s32 status)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] hb\_s32 status：使能/不使能头信息和 IDR 帧编码成一帧

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

使能/不使能头信息和 I 帧编码成一帧，该参数为静态参数，0：IDR 和头信息独立，1：IDR 和头信息合成一帧，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_get\_roi\_avg\_qp

【函数声明】

hb\_s32 hb\_mm\_mc\_get\_roi\_avg\_qp(media\_codec\_context\_t \*
context, hb\_u32 \* params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[OUT\] hb\_u32 \*params：ROI 平均 QP

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

获取 ROI 平均 QP 值，0：代表该值由用户设定得 QPMAP 决定，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

#### hb\_mm\_mc\_set\_roi\_avg\_qp

【函数声明】

hb\_s32 hb\_mm\_mc\_set\_roi\_avg\_qp(media\_codec\_context\_t \*
context, hb\_u32 params)

【参数描述】

- \[IN\] media\_codec\_context\_t \*context：指定 codec 类型的 context
- \[IN\] hb\_u32 params：ROI 平均 QP 值

【返回值】

- 0：操作成功
- HB\_MEDIA\_ERR\_UNKNOWN： 未知错误
- HB\_MEDIA\_ERR\_OPERATION\_NOT\_ALLOWED：操作不允许
- HB\_MEDIA\_ERR\_INVALID\_INSTANCE：无效实例
- HB\_MEDIA\_ERR\_INVALID\_PARAMS：无效参数

【功能描述】

设置 ROI 编码平均 QP 值，该参数为动态参数，0：表示使用设置的 QP
Map 中所有值得平均值，该值在 RC 模式为 CBR 或者 AVBR 时才能使编码效果生效，适用于 H264/H265。

【示例代码】

参考 [hb_mm_mc_get_longterm_ref_mode](#hb_mm_mc_get_longterm_ref_mode)

### 主要参数说明

#### media\_codec\_state\_t

【描述】

定义 Media codec 的内部工作状态。

【定义】

```
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

#### media\_codec\_id\_t

【描述】

定义 MediaCodec 支持的 codec id。

【定义】

```
typedef enum _media_codec_id {
    MEDIA_CODEC_ID_NONE = -1,
    /* Video Codecs */
    MEDIA_CODEC_ID_H264,
    MEDIA_CODEC_ID_H265,
    MEDIA_CODEC_ID_MJPEG,
    MEDIA_CODEC_ID_JPEG,
    /* Audio Codecs */
    MEDIA_CODEC_ID_FLAC,
    MEDIA_CODEC_ID_PCM_MULAW,
    MEDIA_CODEC_ID_PCM_ALAW,
    MEDIA_CODEC_ID_ADPCM_G726,
    MEDIA_CODEC_ID_ADPCM,
    MEDIA_CODEC_ID_AAC,
    MEDIA_CODEC_ID_MP3,
    MEDIA_CODEC_ID_MP2,
    MEDIA_CODEC_ID_TAK,
    MEDIA_CODEC_ID_AC3,
    MEDIA_CODEC_ID_WMA,
    MEDIA_CODEC_ID_AMR,
    MEDIA_CODEC_ID_APE,
    MEDIA_CODEC_ID_G729,
    MEDIA_CODEC_ID_G723,
    MEDIA_CODEC_ID_G722,
    MEDIA_CODEC_ID_IAC,
    MEDIA_CODEC_ID_RALF,
    MEDIA_CODEC_ID_QDMC,
    MEDIA_CODEC_ID_DTS,
    MEDIA_CODEC_ID_GSM,
    MEDIA_CODEC_ID_TTA,
    MEDIA_CODEC_ID_QCELP,
    MEDIA_CODEC_ID_MLP,
    MEDIA_CODEC_ID_ATRAC1,
    MEDIA_CODEC_ID_IMC,
    MEDIA_CODEC_ID_EAC,
    MEDIA_CODEC_ID_MP1,
    MEDIA_CODEC_ID_SIPR,
    MEDIA_CODEC_ID_OPUS,
    MEDIA_CODEC_ID_CELT,
    MEDIA_CODEC_ID_MOV_TEXT,
    MEDIA_CODEC_ID_TOTAL,
} media_codec_id_t;
```

#### mc\_video\_rate\_control\_mode\_t

【描述】

定义视频的码率控制方式，目前只支持 H264/H265和 MJPEG 编码通道的码率控制。

【定义】

```
typedef enum _mc_video_rate_control_mode {
    MC_AV_RC_MODE_NONE = -1,
    MC_AV_RC_MODE_H264CBR,
    MC_AV_RC_MODE_H264VBR,
    MC_AV_RC_MODE_H264AVBR,
    MC_AV_RC_MODE_H264FIXQP,
    MC_AV_RC_MODE_H264QPMAP,
    MC_AV_RC_MODE_H265CBR,
    MC_AV_RC_MODE_H265VBR,
    MC_AV_RC_MODE_H265AVBR,
    MC_AV_RC_MODE_H265FIXQP,
    MC_AV_RC_MODE_H265QPMAP,
    MC_AV_RC_MODE_MJPEGFIXQP,
    MC_AV_RC_MODE_TOTAL,
} mc_video_rate_control_mode_t;
```

#### mc\_h264\_cbr\_params\_t

【描述】

定义 H264的 CBR 控制方式下的可调节的参数集。

【定义】

```
typedef struct _mc_h264_cbr_params {
    hb_u32 intra_period;
    hb_u32 intra_qp;
    hb_u32 bit_rate;
    hb_u32 frame_rate;
    hb_u32 initial_rc_qp;
    hb_s32 vbv_buffer_size;
    hb_u32 mb_level_rc_enalbe;
    hb_u32 min_qp_I;
    hb_u32 max_qp_I;
    hb_u32 min_qp_P;
    hb_u32 max_qp_P;
    hb_u32 min_qp_B;
    hb_u32 max_qp_B;
    hb_u32 hvs_qp_enable;
    hb_s32 hvs_qp_scale;
    hb_u32 max_delta_qp;
    hb_bool qp_map_enable;
} mc_h264_cbr_params_t;
```

#### mc\_h264\_vbr\_params\_t

【描述】

定义 H264的 VBR 控制方式下的可调节的参数集。

【定义】

```
typedef struct _mc_h264_vbr_params {
    hb_u32 intra_period;
    hb_u32 intra_qp;
    hb_u32 frame_rate;
    hb_bool qp_map_enable;
} mc_h264_vbr_params_t;
```

#### mc\_h264\_avbr\_params\_t

【描述】

定义 H264的 AVBR 控制方式下的可调节的参数集。

【定义】

```
typedef struct _mc_h264_avbr_params {
    hb_u32 intra_period;
    hb_u32 intra_qp;
    hb_u32 bit_rate;
    hb_u32 frame_rate;
    hb_u32 initial_rc_qp;
    hb_s32 vbv_buffer_size;
    hb_u32 mb_level_rc_enalbe;
    hb_u32 min_qp_I;
    hb_u32 max_qp_I;
    hb_u32 min_qp_P;
    hb_u32 max_qp_P;
    hb_u32 min_qp_B;
    hb_u32 max_qp_B;
    hb_u32 hvs_qp_enable;
    hb_s32 hvs_qp_scale;
    hb_u32 max_delta_qp;
    hb_bool qp_map_enable;
} mc_h264_avbr_params_t;
```

#### mc\_h264\_fix\_qp\_params\_t

【描述】

定义 H264的 FixQP 控制方式下的可调节的参数集。

【定义】

```
typedef struct _mc_h264_fix_qp_params {
    hb_u32 intra_period;
    hb_u32 frame_rate;
    hb_u32 force_qp_I;
    hb_u32 force_qp_P;
    hb_u32 force_qp_B;
} mc_h264_fix_qp_params_t;
```

#### mc_h264_qp_map_params_t

【描述】

定义 H264的 QPMAP 控制方式下的可调节的参数集。

【定义】

```
typedef struct _mc_h264_qp_map_params {
    hb_u32 intra_period;
    hb_u32 frame_rate;
    hb_byte qp_map_array;
    hb_u32 qp_map_array_count;
} mc_h264_qp_map_params_t;
```

#### mc\_h265\_cbr\_params\_t

【描述】

定义 H265的 CBR 控制方式下的可调节的参数集。

【定义】

```
typedef struct _mc_h265_cbr_params {
    hb_u32 intra_period;
    hb_u32 intra_qp;
    hb_u32 bit_rate;
    hb_u32 frame_rate;
    hb_u32 initial_rc_qp;
    hb_s32 vbv_buffer_size;
    hb_u32 ctu_level_rc_enalbe;
    hb_u32 min_qp_I;
    hb_u32 max_qp_I;
    hb_u32 min_qp_P;
    hb_u32 max_qp_P;
    hb_u32 min_qp_B;
    hb_u32 max_qp_B;
    hb_u32 hvs_qp_enable;
    hb_s32 hvs_qp_scale;
    hb_u32 max_delta_qp;
    hb_bool qp_map_enable;
} mc_h265_cbr_params_t;
```

#### mc\_h265\_vbr\_params\_t

【描述】

定义 H265的 VBR 控制方式下的可调节的参数集。

【定义】

```
typedef struct _mc_h265_vbr_params {
    hb_u32 intra_period;
    hb_u32 intra_qp;
    hb_u32 frame_rate;
    hb_bool qp_map_enable;
} mc_h265_vbr_params_t;
```

#### mc\_h265\_avbr\_params\_t

【描述】

定义 H265的 AVBR 控制方式下的可调节的参数集。

【定义】

```
typedef struct _mc_h265_avbr_params {
    hb_u32 intra_period;
    hb_u32 intra_qp;
    hb_u32 bit_rate;
    hb_u32 frame_rate;
    hb_u32 initial_rc_qp;
    hb_s32 vbv_buffer_size;
    hb_u32 ctu_level_rc_enalbe;
    hb_u32 min_qp_I;
    hb_u32 max_qp_I;
    hb_u32 min_qp_P;
    hb_u32 max_qp_P;
    hb_u32 min_qp_B;
    hb_u32 max_qp_B;
    hb_u32 hvs_qp_enable;
    hb_s32 hvs_qp_scale;
    hb_u32 max_delta_qp;
    hb_bool qp_map_enable;
} mc_h265_avbr_params_t;
```

#### mc\_h265\_fix\_qp\_params\_t

【描述】

定义 H265的 FixQP 控制方式下的可调节的参数集。

【定义】

```
typedef struct _mc_h265_fix_qp_params {
    hb_u32 intra_period;
    hb_u32 frame_rate;
    hb_u32 force_qp_I;
    hb_u32 force_qp_P;
    hb_u32 force_qp_B;
} mc_h265_fix_qp_params_t;
```

#### mc\_h265\_qp\_map\_params\_t

【描述】

定义 H265的 QPMAP 控制方式下的可调节的参数集。

【定义】

```
typedef struct _mc_h265_qp_map_params {
    hb_u32 intra_period;
    hb_u32 frame_rate;
    hb_byte qp_map_array;
    hb_u32 qp_map_array_count;
} mc_h265_qp_map_params_t;
```

#### mc\_mjpeg\_fix\_qp\_params\_t

【描述】

定义 MJPEG 的 FixQP 控制方式下的可调节的参数集。

【定义】

```
typedef struct _mc_mjpeg_fix_qp_params {
    hb_u32 frame_rate;
    hb_u32 quality_factor;
} mc_mjpeg_fix_qp_params_t;
```

#### mc\_video\_custom\_gop\_pic\_params\_t

【描述】

定义自定义的 GOP 结构表的数据结构。

【定义】

```
typedef struct _mc_video_custom_gop_pic_params {
    hb_u32 pic_type;
    hb_s32 poc_offset;
    hb_u32 pic_qp;
    hb_s32 num_ref_picL0;
    hb_s32 ref_pocL0;
    hb_s32 ref_pocL1;
    hb_u32 temporal_id;
} mc_video_custom_gop_pic_params_t;
```

#### mc\_inter\_status\_t

【描述】

定义 media codec 内部状态信息

【定义】

```
typedef struct _mc_inter_status {
    hb_u32 cur_input_buf_cnt;
    hb_u64 cur_input_buf_size;
    hb_u32 cur_output_buf_cnt;
    hb_u64 cur_output_buf_size;
    hb_u32 left_recv_frame;
    hb_u32 left_enc_frame;
    hb_u32 total_input_buf_cnt;
    hb_u32 total_output_buf_cnt;
    hb_s32 pipeline;
    hb_s32 channel_port_id;
} mc_inter_status_t;
```

#### media\_codec\_context\_t

【描述】

定义 Media codec 的上下文。

【定义】

```
typedef struct _media_codec_context {
    media_codec_id_t codec_id;
    hb_bool encoder;
    hb_s32 instance_index;
    union {
        mc_video_codec_enc_params_t video_enc_params;
        mc_video_codec_dec_params_t video_dec_params;
        mc_audio_codec_enc_params_t audio_enc_params;
        mc_audio_codec_dec_params_t audio_dec_params;
    };
    hb_ptr vpf_context;
    mc_video_cmd_prio_t priority;
} media_codec_context_t;
```

#### mc\_video\_codec\_enc\_params\_t

【描述】

定义视频编码器的编码参数，视频编码器类型包括 H264，H265，MJPEG 和 JPEG。

【定义】

```
typedef struct _mc_video_codec_enc_params {
    hb_s32 width, height;
    mc_pixel_format_t pix_fmt;
    hb_u32 frame_buf_count;
    hb_bool external_frame_buf;
    hb_u32 bitstream_buf_count;
    hb_u32 bitstream_buf_size;
    mc_rate_control_params_t rc_params;
    mc_video_gop_params_t gop_params;
    mc_rotate_degree_t rot_degree;
    mc_mirror_direction_t mir_direction;
    hb_u32 frame_cropping_flag;
    mc_av_codec_rect_t crop_rect;
    hb_bool enable_user_pts;
    union {
        mc_h264_enc_config_t h264_enc_config;
        mc_h265_enc_config_t h265_enc_config;
        mc_mjpeg_enc_config_t mjpeg_enc_config;
        mc_jpeg_enc_config_t jpeg_enc_config;
    };
} mc_video_codec_enc_params_t;
```

#### mc\_video\_codec\_dec\_params\_t

【描述】

定义视频解码器的解码参数，视频解码器类型包括 H264，H265，MJPEG 和 JPEG。

【定义】

```
typedef struct _mc_video_codec_dec_params {
    mc_av_stream_feeding_mode_t feed_mode;
    mc_pixel_format_t pix_fmt;
    hb_u32 bitstream_buf_size;
    hb_u32 bitstream_buf_count;
    hb_bool external_bitstream_buf;
    hb_u32 frame_buf_count;
    union {
        mc_h264_dec_config_t h264_dec_config;
        mc_h265_dec_config_t h265_dec_config;
        mc_mjpeg_dec_config_t mjpeg_dec_config;
        mc_jpeg_dec_config_t jpeg_dec_config;
    };
} mc_video_codec_dec_params_t;
```

#### mc\_audio\_codec\_enc\_params\_t

【描述】

定义 audio codec 的编码参数。

【定义】

```
typedef struct _mc_audio_codec_enc_params {
    hb_u32 bit_rate;
    hb_s32 frame_size;
    hb_s32 frame_buf_count;
    hb_s32 packet_count;
    mc_audio_sample_format_t sample_fmt;
    mc_audio_sample_rate_t sample_rate;
    mc_audio_channel_layout_t channel_layout;
    hb_s32 channels;
    hb_ptr enc_config;
} mc_audio_codec_enc_params_t;
```

#### mc\_audio\_codec\_dec\_params\_t

【描述】

定义 audio codec 的解码参数。

【定义】

```
typedef struct _mc_audio_codec_dec_params {
    mc_av_stream_feeding_mode_t feed_mode;
    hb_s32 packet_buf_size;
    hb_s32 packet_count;
    hb_s32 frame_cache_size;
    hb_s32 internal_frame_size;
    hb_s32 frame_buf_count;
    hb_ptr dec_config;
} mc_audio_codec_dec_params_t;
```

### 返回值说明

| 错误码 | 宏定义 | 描述 |
| --- | --- | --- |
| 0xF0000001 | HB_MEDIA_ERR_UNKNOWN | 未知的错误 |
| 0xF0000002 | HB_MEDIA_ERR_CODEC_NOT_FOUND | 找不到对应的 codec |
| 0xF0000003 | HB_MEDIA_ERR_CODEC_OPEN_FAIL | 无法打开 codec 设备 |
| 0xF0000004 | HB_MEDIA_ERR_CODEC_RESPONSE_TIMEOUT | codec 响应超时 |
| 0xF0000005 | HB_MEDIA_ERR_CODEC_INIT_FAIL | codec 初始化失败 |
| 0xF0000006 | HB_MEDIA_ERR_OPERATION_NOT_ALLOWED | 操作不允许 |
| 0xF0000007 | HB_MEDIA_ERR_INSUFFICIENT_RES | 内部内存资源不足 |
| 0xF0000008 | HB_MEDIA_ERR_NO_FREE_INSTANCE | 没有可用的 insta nce（VPU 最多32个，JPU 最 多64个，Audio 最多32个） |
| 0xF0000009 | HB_MEDIA_ERR_INVALID_PARAMS | 无效的参数 |
| 0xF000000A | HB_MEDIA_ERR_INVALID_INSTANCE | 无效的实例 |
| 0xF000000B | HB_MEDIA_ERR_INVALID_BUFFER | 无效的 buffer |
| 0xF000000C | HB_MEDIA_ERR_INVALID_COMMAND | 无效的指令 |
| 0xF000000D | HB_MEDIA_ERR_WAIT_TIMEOUT | 等待超时 |
| 0xF000000E | HB_MEDIA_ERR_FILE_OPERATION_FAILURE | 文件操作失败 |
| 0xF000000F | HB_MEDIA_ERR_PARAMS_SET_FAILURE | 参数设置失败 |
| 0xF0000010 | HB_MEDIA_ERR_PARAMS_GET_FAILURE | 参数获取失败 |
| 0xF0000011 | HB_MEDIA_ERR_CODING_FAILED | 编解码失败 |
| 0xF0000012 | HB_MEDIA_ERR_OUTPUT_BUF_FULL | 输出 buffer 满 |
| 0xF0000013 | HB_MEDIA_ERR_UNSUPPORTED_FEATURE | 不支持的功能 |
| 0xF0000014 | HB_MEDIA_ERR_INVALID_PRIORITY | 不支持的优先级 |

## Codec sample

:::info 注意
    只有 S600支持 VPU 多核，编解码示例通过`-u`配置不同核只在 S600上生效。
:::

### 编码示例

#### 功能概述

编码 yuv 图像, 生成 h264/h265 视频或 jpg 图片。

##### 软件架构说明

采用 MediaCodec 的 poll 模式来解耦输入和输出，可使编码帧率性能达到最优。
在主线程中灌 YUV 数据：取出一个空的 input
buffer，配置 YUV 数据的地址信息（如 phys addr），再 queue input
buffer 并通知编码器处理该帧数据；
另一个线程取输出码流：通过 select 接收硬件编码完成通知，取出一个硬件填满输出码流的 output
buffer，将编码结果写到文件中后归还 output buffer。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/encoder2.png" alt="image" style={{ width: '100%' }} />

##### 硬件数据流说明

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/encoder1.png" alt="image" style={{ width: '100%' }} />

##### 代码位置及目录结构

sample 代码位置在工程目录 source/hobot-sp-samples/debian/app/multimedia\_demo/codec\_demo。

目录结构如下：

```
├── README.md
└── sample_venc_vdec
    ├── input_3840x2160_yuv420p.h264
    ├── input_3840x2160_yuv420p.yuv
    ├── Makefile
    ├── sample.c
    ├── sample_common.c
    ├── sample.h
    ├── sample_vdec.c
    └── sample_venc.c
```

根目录包含 README.md，简要介绍编译命令，运行帮助信息及命令。

sample_venc_devc 下的 Makefile 用于该目录下的编译。其中，sample.c 是 main 入口的所在文件，sample\_common 包含了一些共用的 api，sample\_venc.c 包含编码相关函数，sample\_vdec.c 包含解码相关函数。

#### 编译

##### 编译环境

板端在安装 hobot-sp-samples_*.deb 包后，会包含 codec\_demo 源码内容。

##### 编译说明

本 sample 主要依赖 libmm 提供的 API 头文件：

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
```

编译依赖的库有如下：

```
LIBS += -lpthread -ldl -lhbmem -lalog  -lmultimedia
LIBS += -lavformat -lavcodec -lavutil -lswresample
```

编译命令:

板端进入/app/multimedia\_demo/codec\_demo/sample\_venc\_vdec 目录。

```
make
```

#### 运行

##### 支持平台

RDKS100/RDKS600。

##### 板端部署及配置

刷写系统软件镜像后，本 sample 的源码位于板端路径：`/app/multimedia_demo/codec_demo/sample_venc_vdec`；

可能需要用到的资源：

- 输入 YUV 图像默认包含4K 格式的 YUV 裸流及 H264文件，如果测试其他测试请用户自行上传；

##### 运行指南

###### 运行参数说明

`sample_codec` ： 应用程序名字

-m：编码或解码，默认编码， 0： encoder 1： decoder

-c：编解码器类型，默认 H264， 0：H264 1：H265 2：mjpg 3：jpg

-w：图像宽度，默认3840

-h：图像高度，默认2160

-p：编解码图像格式，默认 nv12， 0：yuv420p 1：nv12 2：nv21

-n：测试线程数量，默认1个

-i：输入文件的路径，默认`./input_${w}x${h}_${pixfmt}<_thread_idx>.yuv`

-o：输出文件的路径，默认`./output_${w}x${h}_${pixfmt}<_thread_idx>.{code_type}`

-u: vpu core id，默认0，可配置值：0/1/2

-H：打印帮助信息

###### 帮助菜单

使用`./sample_codec --help`可以获取帮助菜单，如下所示：
```
Usage: ./sample_codec
        -m --samplemode sample mode, default encoder, {0-encoder, 1-decoder}
        -c --codecid codec id, default h264, {0-h264, 1-h265, 2-mjpeg, 3-jpeg}
        -w --width width, default 3840
        -h --height height, default 2160
        -p --pixfmt pix fmt, default nv12, {0-yuv420p, 1-nv12, ..}
        -n --threadnum test thread number, default 1
        -i --inputfile input file name, default ./input_${w}x${h}_${pixfmt}<_thread_idx>.yuv
        -o --outputfile output file name, default ./output_${w}x${h}_${pixfmt}<_thread_idx>.{code_type}
        -u --core unit, default 0
        -H --help print usage
```

###### 运行方法

输入源准备：将测试文件(如 input\_3840x2160\_nv12.yuv)到当前目录 或
用-i 指定文件路径；

编码一路 3840x2160 的 YUV 图像序列，生成 H264 视频码流

```
/app/multimedia_demo/codec_demo/sample_venc_vdec/sample_codec
```

编码一路 1920x1080 的 YUV 图像序列，生成 H265 视频码流

```
/app/multimedia_demo/codec_demo/sample_venc_vdec/sample_codec -c 1 -w 1920 -h 1080
```

编码一张 1920x1088 的 YUV 图像，生成 jpg 图片

```
/app/multimedia_demo/codec_demo/sample_venc_vdec/sample_codec -c 3 -w 1920 -h 1088
```

编码两路 3840x2160 的 YUV 图像序列，生成 H265 视频

```
/app/multimedia_demo/codec_demo/sample_venc_vdec/sample_codec -c 1 -n 2
```

编码四路 1920x1080 的 YUV 图像序列，生成 H265 视频

```
/app/multimedia_demo/codec_demo/sample_venc_vdec/sample_codec -c 1 -w 1920 -h 1080 -n 4
```

VPU CROP 读入并编码：将1920x1300（图像尺寸不满足对齐要求）输入按`{x=200, y=300, w=1280, h=720}`大小读入数据并编码生成 H265 视频

```
/app/multimedia_demo/codec_demo/sample_venc_vdec/sample_codec -c 1 -w 1920 -h 1300
```

###### 运行结果说明

如下图所示为运行成功

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/encoder3.png" alt="image" style={{ width: '100%' }} />

查看生成的 h264/h265/jpg 是否正常

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/encoder4.png" alt="image" style={{ width: '100%' }} />

### 解码示例

#### 功能概述

解码 h264/h265视频或 jpg 图片，生成 yuv 图像。

##### 软件架构

采用 MediaCodec 的 poll 模式来解耦输入和输出，可使解码帧率性能达到最优。
在主线程中灌码流数据：取出一个空的 input
buffer，配置码流数据的地址信息（如 phys addr），再 queue input
buffer 并通知解码器处理该帧数据；
另一个线程取输出 YUV 图像：通过 select 接收硬件解码完成通知，取出一个硬件填满输出图像的 output
buffer，将解码结果写到文件中后归还 output buffer。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/decoder2.png" alt="image" style={{ width: '100%' }} />

##### 硬件数据流说明

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/decoder1.png" alt="image" style={{ width: '100%' }} />

##### 代码位置及目录结构

sample 代码位置在工程目录 source/hobot-sp-samples/debian/app/multimedia\_demo/codec\_demo。

目录结构如下：

```
├── README.md
└── sample_venc_vdec
    ├── input_3840x2160_yuv420p.h264
    ├── input_3840x2160_yuv420p.yuv
    ├── Makefile
    ├── sample.c
    ├── sample_common.c
    ├── sample.h
    ├── sample_vdec.c
    └── sample_venc.c
```

根目录包含 README.md，简要介绍编译命令，运行帮助信息及命令。

sample_venc_devc 下的 Makefile 用于该目录下的编译。其中，sample.c 是 main 入口的所在文件，sample\_common 包含了一些共用的 api，sample\_venc.c 包含编码相关函数，sample\_vdec.c 包含解码相关函数。

#### 编译

##### 编译环境

板端在安装 hobot-sp-samples_*.deb 包后，会包含 codec\_demo 源码内容。

##### 编译说明

本 sample 主要依赖 libmm 提供的 API 头文件：

```
#include "hb_media_codec.h"
#include "hb_media_error.h"
```

编译依赖的库有如下：

```
LIBS += -lpthread -ldl -lhbmem -lalog  -lmultimedia
LIBS += -lavformat -lavcodec -lavutil -lswresample
```

编译命令:

板端进入/app/multimedia\_demo/codec\_demo/sample\_venc\_vdec 目录。

```
make
```

#### 运行

##### 支持平台

RDKS100/RDKS600。

##### 板端部署及配置

刷写系统软件镜像后，本 sample 的源码位于板端路径：`/app/multimedia_demo/codec_demo/sample_venc_vdec`；

可能需要用到的资源：

- 输入 YUV 图像默认包含4K 格式的 YUV 裸流及 H264文件，如果测试其他测试请用户自行上传；

##### 运行指南

###### 运行参数说明

`sample_codec` ： 应用程序名字

-m：编码或解码，默认编码， 0： encoder 1： decoder

-c：编解码器类型，默认 H264， 0：H264 1：H265 2：mjpg 3：jpg

-w：图像宽度，默认3840

-h：图像高度，默认2160

-p：编解码图像格式，默认 nv12， 0：yuv420p 1：nv12 2：nv21

-n：测试线程数量，默认1个

-i：输入文件的路径，默认`./input_${w}x${h}_${pixfmt}<_thread_idx>.yuv`

-o：输出文件的路径，默认`./output_${w}x${h}_${pixfmt}<_thread_idx>.{code_type}`

-u: vpu core id，默认0，可配置值：0/1/2

-H：打印帮助信息

###### 帮助菜单

```
Usage: ./sample_codec
        -m --samplemode sample mode, default encoder, {0-encoder, 1-decoder}
        -c --codecid codec id, default h264, {0-h264, 1-h265, 2-mjpeg, 3-jpeg}
        -w --width width, default 3840
        -h --height height, default 2160
        -p --pixfmt pix fmt, default nv12, {0-yuv420p, 1-nv12, ..}
        -n --threadnum test thread number, default 1
        -i --inputfile input file name, default ./input_${w}x${h}_${pixfmt}<_thread_idx>.yuv
        -o --outputfile output file name, default ./output_${w}x${h}_${pixfmt}<_thread_idx>.{code_type}
        -u --core unit, default 0
        -H --help print usage
```

###### 运行方法

输入源准备：将测试文件(如 input\_3840x2160\_nv12.h264)到当前目录 或
用-i 指定文件路径；

解码一路 3840x2160 的 h264 视频, 生成 yuv 图像

```
/app/multimedia_demo/codec_demo/sample_venc_vdec/sample_codec -m 1
```

解码一路 1920x1080 的 h265 视频, 生成 yuv 图像

```
/app/multimedia_demo/codec_demo/sample_venc_vdec/sample_codec -m 1 -c 1 -w 1920 -h 1080
```

解码一张 1920x1088 的 jpg 图片, 生成 yuv 图像

```
/app/multimedia_demo/codec_demo/sample_venc_vdec/sample_codec -m 1 -c 3 -w 1920 -h 1088
```

解码两路 3840x2160 的 h264 视频, 生成 yuv 图像

```
/app/multimedia_demo/codec_demo/sample_venc_vdec/sample_codec -m 1 -n 2
```

解码四路 1920x1080 的 h265 视频, 生成 yuv 图像

```
/app/multimedia_demo/codec_demo/sample_venc_vdec/sample_codec -m 1 -c 1 -n 4 -w 1920 -h 1080
```

###### 运行结果说明

如下图所示为运行成功

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/decoder3.png" alt="image" style={{ width: '100%' }} />

使用 yuvplayer 查看生成的 yuv 图像文件是否正常

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/codec/decoder4.png" alt="image" style={{ width: '100%' }} />
