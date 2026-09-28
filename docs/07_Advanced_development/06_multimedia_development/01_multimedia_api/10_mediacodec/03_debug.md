---
sidebar_position: 3
title: "MediaCodec 调试指南"
description: "RDK S100/S600 MediaCodec 编码效果调优、GOP 结构与 VPU / JPU 调试节点"
---

# MediaCodec 调试指南

## 编码效果调优

根据当前客户使用 codec 进行视频编码的场景，多将码率模式设置为 CBR，当编码的场景较为复杂时，为了保证视频质量，硬件会自动提高码率值，导致输出的视频较预期更大。因此为了兼顾视频质量和实际码率，需要统筹 `bit_rate` 和 `max_qp_I/P` 值的设置。下面给出了全 I 帧模式下，不同复杂场景下，码率设置为 15000kbps 时，不同 `max_qp_I` 下实际码率和 qp 的情况（不同场景复杂程度不同，下列数据仅供参考）：

| 场景&参数 | 室外白天复杂场景<br />bitrate(15000)<br />max_qp_I(35) | 室外白天复杂场景<br />bitrate(15000)<br />max_qp_I(38) | 室外白天复杂场景<br />bitrate(15000)<br />max_qp_I(39) |
| --- | --- | --- | --- |
| Bit allocation(bps)（越大图像质量越高） | 60300045 | 42186920 | 35898230 |
| Qp avg（越小图像质量越高） | 35 | 38 | 39 |

## GOP结构说明

H264/H265 编码支持 GOP 结构的设置，用户可从预置的多种 GOP 结构选择，也可自定义 GOP 结构。

GOP 结构表可定义一组周期性的 GOP 结构，该 GOP 结构将用于整个编码过程。单个结构表中的元素如下表所示，其中可以指定该图像的参考帧，如果 IDR 帧后的其他帧指定的参考帧为 IDR 帧前的数据帧，编码器内部会自动处理这种情况使其不参考其他帧，用户无需关心这种情况。用户在自定义 GOP 结构时需要指定 GOP 内的帧数量（取值 [1,8]），结构表内各帧的参数按解码顺序排列。

下面表示了结构表中各个元素的含义：

| 元素 | 描述 |
| --- | --- |
| Type | 帧类型(I、P、B) |
| POC | GOP 内帧的显示顺序，取值范围为 [1,gop_size] |
| QPoffset | 自定义 GOP 中图片的量化参数 |
| NUM_REF_PIC_L0 | 标记为 P 帧使用多参考图片，仅在 PIC_TYPE 为 P 时有效 |
| temporal_id | 帧的时间层，帧无法从具有较高时间 id（0~6）的帧进行预测 |
| 1st_ref_POC | L0 的第一张参考图片的 POC |
| 2nd_ref_POC | Type 为 B 时，第一张参考图片的 POC 是 L1 的；Type 为 P 时，第二张参考图片的 POC 是 L0 的；可以使 reference_L1 和 B slice 中的参考图片具有相同的 POC，但出于压缩效率的考虑，建议 reference_L1 和 reference_L0 的 POC 不同 |

### GOP预置结构

RDK 上一共支持设置九种 GOP 预置结构：

| `gop_preset_idx` | GOP结构 | 低延迟（编码顺序和显示顺序相同） | GOP大小 | 编码顺序 | 最小源帧buffer数量 | 最小解码图片buffer数量 | 周期内（I 帧间隔）要求 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | I | Yes | 1 | I0-I1-I2… | 1 | 1 | N/A |
| 2 | P | Yes | 1 | I0-P1-P2-P3… | 1 | 2 | N/A |
| 3 | B | Yes | 1 | I0-B1-B2-B3… | 1 | 3 | N/A |
| 4 | BP | NO | 2 | I0-B2-P1-B4-P3… | 1 | 3 | N/A |
| 5 | BBBP | Yes | 1 | I0-B3-B2-B4-P1… | 7 | 4 | N/A |
| 6 | PPPP | Yes | 4 | I0-P1-P2-P3-P4… | 1 | 2 | N/A |
| 7 | BBBB | Yes | 4 | I0-B1-B2-B3-B4… | 1 | 3 | N/A |
| 8 | BBBB BBBB | Yes | 1 | I0-B4-B3-B5-B2-B7-B6-B8-B1… | 12 | 5 | N/A |
| 9 | P | Yes | 1 | I0-P1… | 1 | 2 | N/A |

以下会对预置的 GOP 结构进行说明。

**GOP Preset 1**

只有 I 帧，没有相互参考；

- 低延时；

![GOP Preset 1 结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop1.png)

![GOP Preset 1 编码顺序](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop2.png)

**GOP Preset 2**

- 只有 I 帧和 P 帧；
- P 帧参考 2 个前向参考帧；
- 低延时；

![GOP Preset 2 结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop3.png)

![GOP Preset 2 编码顺序](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop4.png)

**GOP Preset 3**

- 只有 I 帧和 B 帧；
- B 帧参考 2 个前向参考帧；
- 低延时；

![GOP Preset 3 结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop5.png)

![GOP Preset 3 编码顺序](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop6.png)

**GOP Preset 4**

- 只有 I 帧、P 帧和 B 帧；
- P 帧参考 2 个前向参考帧；
- B 帧参考 1 个前向参考帧和一个后向参考帧；

![GOP Preset 4 结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop7.png)

![GOP Preset 4 编码顺序](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop8.png)

**GOP Preset 5**

- 只有 I 帧、P 帧和 B 帧；
- P 帧参考 2 个前向参考帧；
- B 帧参考 1 个前向参考帧和一个后向参考帧，后向参考帧可为 P 帧或 B 帧；

![GOP Preset 5 结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop9.png)

![GOP Preset 5 编码顺序](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop10.png)

**GOP Preset 6**

- 只有 I 帧和 P 帧；
- P 帧参考 2 个前向参考帧；
- 低延时；

![GOP Preset 6 结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop11.png)

![GOP Preset 6 编码顺序](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop12.png)

**GOP Preset 7**

- 只有 I 帧和 B 帧；
- B 帧参考 2 个前向参考帧；
- 低延时；

![GOP Preset 7 结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop13.png)

![GOP Preset 7 编码顺序](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop14.png)

**GOP Preset 8**

- 只有 I 帧和 B 帧；
- B 帧参考 1 个前向参考帧，一个后向参考帧；

![GOP Preset 8 结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop15.png)

![GOP Preset 8 编码顺序](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop16.png)

**GOP Preset 9**

- 只有 I 帧和 P 帧；
- P 帧参考 1 个前向参考帧；
- 低延时；

![GOP Preset 9 结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop17.png)

![GOP Preset 9 编码顺序](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/gop18.png)

## VPU调试方式

VPU（视频处理单元）是一种专用的视觉处理单元，可以高效处理视频内容。VPU 可以实现 H264/H265 视频格式的编解码处理。用户通过 Codec 提供的接口即可获得输入的编码/解码流。

### 编码状态

编码调试信息：

```bash
cat /sys/kernel/debug/vpu/venc
```

```text
root@hobot:~# cat /sys/kernel/debug/vpu/venc
----encode enc param----
enc_idx enc_id profile level width height pix_fmt fbuf_count extern_buf_flag bsbuf_count bsbuf_size mirror rotate
 0 h265 Main unspecified 4096 2160 0 5 1 5 13271040 0 0

----encode h265cbr param----
enc_idx rc_mode intra_period intra_qp bit_rate frame_rate initial_rc_qp vbv_buffer_size ctu_level_rc_enalbe min_qp_I max_qp_I min_qp_P max_qp_P min_qp_B max_qp_B hvs_qp_enable hvs_qp_scale qp_map_enable max_delta_qp
 0 h265cbr 20 30 5000 30 30 3000 1 8 50 8 50 8 50 1 2 0 10
----encode gop param----
enc_idx enc_id gop_preset_idx custom_gop_size decoding_refresh_type
 0 h265 2 0 2
----encode intra refresh----
enc_idx enc_id intra_refresh_mode intra_refresh_arg
 0 h265 0 0

----encode longterm ref----
enc_idx enc_id use_longterm longterm_pic_period longterm_pic_using_period
 0 h265 0 0 0
----encode roi_params----
enc_idx enc_id roi_enable roi_map_array_count
 0 h265 0 0
----encode mode_decision 1----
enc_idx enc_id mode_decision_enable pu04_delta_rate pu08_delta_rate pu16_delta_rate pu32_delta_rate pu04_intra_planar_delta_rate pu04_intra_dc_delta_rate pu04_intra_angle_delta_rate pu08_intra_planar_delta_rate pu08_intra_dc_delta_rate pu08_intra_angle_delta_rate pu16_intra_planar_delta_rate pu16_intra_dc_delta_rate pu16_intra_angle_delta_rate
 0 h265 0 0 0 0 0 0 0 0 0 0 0 0 0

----encode mode_decision 2----
enc_idx enc_id pu32_intra_planar_delta_rate pu32_intra_dc_delta_rate pu32_intra_angle_delta_rate cu08_intra_delta_rate cu08_inter_delta_rate cu08_merge_delta_rate cu16_intra_delta_rate cu16_inter_delta_rate cu16_merge_delta_rate cu32_intra_delta_rate cu32_inter_delta_rate cu32_merge_delta_rate
 0 h265 0 0 0 0 0 0 0 0 0 0 0 0
----encode h265_transform----
enc_idx enc_id chroma_cb_qp_offset chroma_cr_qp_offset user_scaling_list_enable
 0 h265 0 0 0
----encode h265_pred_unit----
enc_idx enc_id intra_nxn_enable constrained_intra_pred_flag strong_intra_smoothing_enabled_flag max_num_merge
 0 h265 1 0 1 2
----encode h265 timing----
enc_idx enc_id vui_num_units_in_tick vui_time_scale vui_num_ticks_poc_diff_one_minus1
 0 h265 1000 30000 0
----encode h265 slice params----
enc_idx enc_id h265_independent_slice_mode h265_independent_slice_arg h265_dependent_slice_mode h265_dependent_slice_arg
 0 h265 0 0 0 0
----encode h265 deblk filter----
enc_idx enc_id slice_deblocking_filter_disabled_flag slice_beta_offset_div2 slice_tc_offset_div2 slice_loop_filter_across_slices_enabled_flag
 0 h265 0 0 0 1

----encode h265 sao param----
enc_idx enc_id sample_adaptive_offset_enabled_flag

 0 h265 1
----encode status----
enc_idx enc_id cur_input_buf_cnt cur_output_buf_cnt left_recv_frame left_enc_frame total_input_buf_cnt total_output_buf_cnt fps
 0 h265 4 1 0 0 1093 1089 35
```

参数解释：

| 调试信息分组 | 状态参数 | 说明 |
| --- | --- | --- |
| encode enc param | 基础编码参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />profile：profile类型<br />level：h265 level类型<br />width：编码宽度<br />height：编码高度<br />pix_fmt：输入帧像素类型<br />fbuf_count：输入的rameBuffer数<br />extern_buf_flag：是否使用外部输入buffer<br />bsbuf_count：bitstreamBuffer数<br />bsbuf_size：bitstreamBuffer大小<br />mirror：是否设置镜像<br />rotate：是否设置旋转 |
| encode h265cbr param | CBR码率控制参数 | enc_idx：编码实例值<br />rc_mode：码率控制类型<br />intra_period：I帧间隔<br />intra_qp：I帧qp值<br />bit_rate：码率值<br />frame_rate：帧率<br />initial_rc_qp：初始QP值<br />vbv_buffer_size：VBV buffer的大小<br />ctu_level_rc_enalbe：码率控制是否工作在ctu级别<br />min_qp_I：I帧最小QP值<br />max_qp_I：I帧最大QP值<br />min_qp_P：P帧最小QP值<br />max_qp_P：P帧最大QP值<br />min_qp_B：B帧最小QP值<br />max_qp_B：B帧最大QP值<br />hvs_qp_enable：码率控制是否工作在subCTU级别<br />hvs_qp_scale：QP缩放因子<br />qp_map_enable：使能ROI编码时的QP map<br />max_delta_qp：指定HVS QP值的最大偏差范围 |
| encode gop param | GOP参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />gop_preset_idx：选择预置的GOP结构<br />custom_gop_size：自定义时GOP的大小<br />decoding_refresh_type：设置IDR帧的具体类型 |
| encode intra refresh | 帧内刷新参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />intra_refresh_mode：帧内刷新模式<br />intra_refresh_arg：帧内刷新参数 |
| encode longterm ref | 长期参考帧参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />use_longterm：使能长期参考帧<br />longterm_pic_period：长期参考帧周期<br />longterm_pic_using_period：参考长期参考帧的周期 |
| encode roi_params | ROI参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />roi_enable：使能ROI编码<br />roi_map_array_count：ROI map中元素的个数 |
| encode mode_decision 1 | 块编码模式决策参数1 | 各种模式选择参数值，包括pu04_delta_rate，pu08_delta_rate等 |
| encode mode_decision 2 | 块编码模式决策参数2 | 各种模式选择参数值，包括pu32_intra_planar_delta_rate，pu32_intra_dc_delta_rate等 |
| encode h265_transform | Transform参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />chroma_cb_qp_offset：指定cb分量的QP偏差<br />chroma_cr_qp_offset：指定cr分量的QP偏差<br />user_scaling_list_enable：使能用户指定的scaling list |
| encode h265_pred_unit | 预测单元参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />intra_nxn_enable：使能intra NXN PUs<br />constrained_intra_pred_flag：帧内预测是否受限<br />strong_intra_smoothing_enabled_flag：滤波过程是否使用双向线性插值<br />max_num_merge：指定merge候选的数量 |
| encode h265 timing | Timing参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />vui_num_units_in_tick：指定时间单位数<br />vui_time_scale：一秒内的时间单位数<br />vui_num_ticks_poc_diff_one_minus1：指定与等于1的图片顺序计数值之差对应的时钟滴答数 |
| encode h265 slice params | Slice参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />h265_independent_slice_mode：独立slice编码模式<br />h265_independent_slice_arg：独立slice的大小<br />h265_dependent_slice_mode：非独立slice编码模式<br />h265_dependent_slice_arg：非独立slice的大小 |
| encode h265 deblk filter | 去块滤波参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />slice_deblocking_filter_disabled_flag：是否进行slice内部滤波<br />slice_beta_offset_div2：指定当前切片的β去块参数偏移量<br />slice_tc_offset_div2：指定当前切片的tc去块参数偏移量<br />slice_loop_filter_across_slices_enabled_flag：是否进行边界滤波 |
| encode h265 sao param | SAO参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />sample_adaptive_offset_enabled_flag：是否对经过去块滤波处理后的重构图像进行采样自适应偏移处理 |
| encode status | 当前编码状态参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />cur_input_buf_cnt：当前使用的inputbuffer数量<br />cur_output_buf_cnt：当前使用的outputbuffer数量<br />left_recv_frame：剩余需要接收的帧数（设置receive_frame_number后有效）<br />left_enc_frame：剩余需要编码的帧数（设置receive_frame_number后有效）<br />total_input_buf_cnt：表示当前总使用的inputbuffer数<br />total_output_buf_cnt：表示当前总使用的outputbuffer数<br />fps：表示当前的帧率 |

### 解码状态

解码调试信息：

```bash
cat /sys/kernel/debug/vpu/vdec
```

```text
root@hobot:~# cat /sys/kernel/debug/vpu/vdec
----decode param----
dec_idx dec_id feed_mode pix_fmt bitstream_buf_size bitstream_buf_count frame_buf_count
 0 h265 1 0 13271040 6
 6
----h265 decode param----
dec_idx dec_id reorder_enable skip_mode bandwidth_Opt cra_as_bla dec_temporal_id_mode target_dec_temporal_id_plus1
 0 h265 1 0 1 0
 0 0
----decode frameinfo----
dec_idx dec_id display_width display_height
 0 h265 4096 2160
----decode status----
dec_idx dec_id cur_input_buf_cnt cur_output_buf_cnt total_input_buf_cnt total_output_buf_cnt fps
 0 h265 5 1 458
 453 53
```

参数解释：

| 调试信息分组 | 状态参数 | 说明 |
| --- | --- | --- |
| decode param | 基础解码参数 | dec_idx：解码实例值<br />dec_id：解码类型<br />feed_mode：数据填充类型<br />pix_fmt：输出像素类型<br />bitstream_buf_size：输入的bitstream缓存区大小<br />bitstream_buf_count：输入的bitstream缓存区个数<br />frame_buf_count：输出的Framebuffer缓存的个数 |
| h265 decode param | H265解码基础参数 | dec_idx：解码实例值<br />dec_id：解码类型<br />reorder_enable：使能解码器按显示顺序输出帧序列<br />skip_mode：使能帧解码忽略模式<br />bandwidth_Opt：使能节省带宽模式<br />cra_as_bla：使能CRA作为BLA处理<br />dec_temporal_id_mode：指定temporal id的选择模式<br />target_dec_temporal_id_plus1：指定temporal id值 |
| decode frameinfo | 解码输出帧信息 | dec_idx：解码实例值<br />dec_id：解码类型<br />display_width：显示的宽度<br />display_height：显示的高度 |
| decode status | 当前解码状态参数 | dec_idx：解码实例值<br />dec_id：解码类型<br />cur_input_buf_cnt：当前使用的inputbuffer数量<br />cur_output_buf_cnt：当前使用的outputbuffer数量<br />total_input_buf_cnt：当前总使用的inputbuffer数<br />total_output_buf_cnt：当前总使用的outputbuffer数<br />fps：当前帧率 |

## JPU调试方式

JPU（图片处理单元）主要用以完成 JPEG/MJPEG 的编解码功能。用户可以通过 CODEC 接口输入待编码的 YUV 数据或待解码的 JPEG 图片，通过 JPU 处理后获取编码完的 JPEG 图片或解码完的 YUV 数据。

### 编码状态

编码调试信息：

```bash
cat /sys/kernel/debug/jpu/jenc
```

```text
root@hobot:~# cat /sys/kernel/debug/jpu/jenc
----encode param----
enc_idx enc_id width height pix_fmt fbuf_count extern_buf_flag bsbuf_count bsbuf_size mirror rotate
 0 jpeg 1920 1088 1 5 0 5 3137536 0 0

----encode rc param----
enc_idx rc_mode frame_rate quality_factor
 0 noratecontrol 0 0
----encode status----
enc_idx enc_id cur_input_buf_cnt cur_output_buf_cnt left_recv_frame left_enc_frame total_input_buf_cnt total_output_buf_cnt fps
 0 jpeg 4 1 0 0 4344 4340 287
```

参数解释：

| 调试信息分组 | 状态参数 | 说明 |
| --- | --- | --- |
| encode param | 基础编码参数 | enc_idx：编码实例<br />enc_id：编码类型<br />width：图像宽度<br />height：图像高度<br />pix_fmt：像素类型<br />fbuf_count：输入的Framebuffer缓存的个数<br />extern_buf_flag：是否使用用户分配的输入buffer<br />bsbuf_count：输出的bitstream缓存区个数<br />bsbuf_size：输出的bitstream的大小<br />mirror：是否设置镜像<br />rotate：是否设置旋转 |
| encode rc param | mjpeg码率控制参数 | enc_idx：编码实例<br />rc_mode：码率控制模式<br />frame_rate：目标帧率<br />quality_factor：量化因子 |
| encode status | 当前编码状态参数 | enc_idx：编码实例值<br />enc_id：编码类型<br />cur_input_buf_cnt：当前使用的inputbuffer数量<br />cur_output_buf_cnt：当前使用的outputbuffer数量<br />left_recv_frame：剩余需要接收的帧数（设置receive_frame_number后有效）<br />left_enc_frame：剩余需要编码的帧数（设置receive_frame_number后有效）<br />total_input_buf_cnt：表示当前总使用的inputbuffer数<br />total_output_buf_cnt：表示当前总使用的outputbuffer数<br />fps：表示当前的帧率 |

### 解码状态

解码调试信息：

```bash
cat /sys/kernel/debug/jpu/jdec
```

```text
root@hobot:~# cat /sys/kernel/debug/jpu/jdec

----decode param----
dec_idx dec_id feed_mode pix_fmt bitstream_buf_size bitstream_buf_count frame_buf_count mirror rotate
 0 jpeg 1 1 3133440 5 5 0 0

----decode frameinfo----
dec_idx dec_id display_width display_height
 0 jpeg 1920 1088

----decode status----
dec_idx dec_id cur_input_buf_cnt cur_output_buf_cnt total_input_buf_cnt total_output_buf_cnt fps
 0 jpeg 0 1 3779 3779 264
```

参数解释：

| 调试信息分组 | 状态参数 | 说明 |
| --- | --- | --- |
| decode param | 解码基础参数 | dec_idx：解码实例<br />dec_id：解码类型<br />feed_mode：数据填充类型<br />pix_fmt：图像像素<br />bitstream_buf_size：输入的bitstream缓存区大小<br />bitstream_buf_count：输入的bitstream缓存区个数<br />frame_buf_count：输出的Framebuffer缓存的个数<br />mirror：是否设置镜像<br />rotate：是否设置旋转 |
| decode frameinfo | 解码输出帧信息 | dec_idx：解码实例值<br />dec_id：解码类型<br />display_width：显示的宽度<br />display_height：显示的高度 |
| decode status | 当前编码状态参数 | dec_idx：解码实例值<br />dec_id：解码类型<br />cur_input_buf_cnt：当前使用的inputbuffer数量<br />cur_output_buf_cnt：当前使用的outputbuffer数量<br />total_input_buf_cnt：当前总使用的inputbuffer数<br />total_output_buf_cnt：当前总使用的outputbuffer数<br />fps：当前帧率 |
