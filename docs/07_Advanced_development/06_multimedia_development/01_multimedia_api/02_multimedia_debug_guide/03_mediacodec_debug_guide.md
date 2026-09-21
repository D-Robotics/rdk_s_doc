---
sidebar_position: 3
title: MediaCodec 调试指南
description: VPU / JPU 编解码模块调试信息
---

# MediaCodec 调试指南

## VPU 模块调试信息

VPU 为视频编解码单元，含编码（VENC）与解码（VDEC）。调试节点位于 `/sys/kernel/debug/vpu/`：

```bash
ls /sys/kernel/debug/vpu/
# irqenable  loading  loadingsetting  rt_task_expect_latency_ms  vdec  venc
cat /sys/kernel/debug/vpu/loading
cat /sys/kernel/debug/vpu/venc     # 编码实例状态，无任务时为空
cat /sys/kernel/debug/vpu/vdec     # 解码实例状态，无任务时为空
```

- `loading` 反映 VPU 负载，运行一路 H.264 编码实测约 `9.0`。
- `venc`、`vdec` 分别为编码、解码的实例状态文件（注意是文件而非目录），无对应任务时为空，运行编/解码任务后输出实例的运行状态。
- `irqenable` 为 VPU 中断使能开关（`1` 为使能），`loadingsetting` 为负载统计开关。
- `rt_task_expect_latency_ms` 为实时任务期望延时，输出形如 `Expect latency of realtime task is 33ms(fix=0ms).`。

`loading` 运行一路 H.264 编码时实测约 `9.0`：

```text
9.0
```

`venc` 仅在编码任务运行时输出（无任务时为空）。调试前需先跑通一路编码示例。板端示例位于 `/app/multimedia_samples/sample_codec/`，配置文件 `codec_config.ini` 节选如下（`encode_streams` 为按位掩码：`0x01` 对应 venc_stream1、`0x02` 对应 venc_stream2、`0x04` 对应 venc_stream3、`0x08` 对应 venc_stream4、`0x10` 对应 venc_stream5；可组合，如 `0x03` 启用前两路、`0x0f` 前四路）：

```ini
[encode]
encode_streams = 0x1

[venc_stream1]
; 编码类型（0：H264，1：H265，2：MJPEG，3：JPEG）
codec_type = 0
width = 1920
height = 1080
frame_rate = 30
bit_rate = 8192
input = 1920x1080_NV12.yuv
output = 1920x1080_30fps.h264
frame_num = 100
profile = h264_main@L4
```

默认启用一路 H.264 编码，运行：

```bash
cd /app/multimedia_samples/sample_codec
./sample_codec            # 默认读 codec_config.ini，等价 ./sample_codec -e 0x1
```

打印输出（节选）：

```text
Config file: codec_config.ini
encode_streams: 0x1
decode_streams: 0x0
Encoding video...
Encode params...
 codec_type: 0, width: 1920, height: 1080, frame_rate: 30, bit_rate: 8192, input_file: 1920x1080_NV12.yuv, output_file: 1920x1080_30fps.h264, frame_num: 100, profile: h264_main@L4, performance_test:0
encode_video...
Encode idx: 0, init successful
Encode idx: 0, start successful
Encode idx: 0, frame= 1
Encode idx: 0, frame= 2
Encode idx: 0, frame= 3
...
```

编码运行中另开终端查看实例状态：

```bash
cat /sys/kernel/debug/vpu/venc
```

输出按 enc param、h264cbr、GOP、intra refresh、longterm ref、ROI、entropy、slice、deblk、timing、intra_pred、transform、VUI、3DNR、smart bg、encode status 等分组，完整示例如下（H.264 编码 1920×1080 30fps 8Mbps，profile main@L4）：

```text
----encode enc param----
enc_idx  enc_id     profile       level width height pix_fmt fbuf_count extern_buf_flag bsbuf_count bsbuf_size mirror rotate
      0    h264          mp      level4  1920   1080       1          3               0           3    3110912      0      0

----encode h264cbr param----
enc_idx rc_mode intra_period intra_qp bit_rate frame_rate initial_rc_qp vbv_buffer_size mb_level_rc_enalbe min_qp_I max_qp_I min_qp_P max_qp_P min_qp_B max_qp_B hvs_qp_enable hvs_qp_scale qp_map_enable max_delta_qp
      0 h264cbr           30       30     8192         30            20              20                  1        8       50        8       50        8       50             1            2             0           10

----encode gop param----
enc_idx  enc_id gop_preset_idx custom_gop_size decoding_refresh_type
      0    h264              1               0                     0

----encode intra refresh----
enc_idx  enc_id intra_refresh_mode intra_refresh_arg
      0    h264                  0                 1

----encode longterm ref----
enc_idx  enc_id use_longterm longterm_pic_period longterm_pic_using_period
      0    h264            0                   0                         0

----encode roi_params----
enc_idx  enc_id roi_enable roi_map_array_count
      0    h264          0                   0

----encode h264 entropy params----
enc_idx  enc_id entropy_coding_mode
      0    h264               CABAC

----encode h264 slice params----
enc_idx  enc_id h264_slice_mode h264_slice_arg
      0    h264               0              0

----encode h264 deblk filter----
enc_idx  enc_id disable_deblocking_filter_idc slice_alpha_c0_offset_div2 slice_beta_offset_div2
      0    h264                             1                          0                      0

----encode h264 timing----
enc_idx  enc_id vui_num_units_in_tick vui_time_scale fixed_frame_rate_flag
      0    h264                  1000          60000                     0

----encode h264_intra_pred----
enc_idx  enc_id constrained_intra_pred_flag
      0    h264                           0

----encode h264_transform----
enc_idx  enc_id transform_8x8_enable chroma_cb_qp_offset chroma_cr_qp_offset user_scaling_list_enable
      0    h264                    1                   0                   0                        0

----encode h264 vui----
enc_idx  enc_id aspect_ratio_info_present_flag aspect_ratio_idc sar_width sar_height overscan_info_present_flag overscan_appropriate_flag video_signal_type_present_flag video_format video_full_range_flag colour_description_present_flag colour_primaries transfer_characteristics matrix_coefficients vui_timing_info_present_flag vui_num_units_in_tick vui_time_scale vui_fixed_frame_rate_flag bitstream_restriction_flag
      0    h264                              0                0         0          0                          0                         0                              1            0                     1                               0                0                        0                   0                            1                  1000          60000                         0                          0

----encode 3dnr----
enc_idx  enc_id nr_y_enable nr_cb_enable nr_cr_enable nr_est_enable nr_intra_weightY nr_intra_weightCb nr_intra_weightCr nr_inter_weightY nr_inter_weightCb nr_inter_weightCr nr_noise_sigmaY nr_noise_sigmaCb nr_noise_sigmaCr
      0    h264           0            0            0             0                0                 0                 0                0                 0                 0               0                0                0

----encode smart bg----
enc_idx  enc_id bg_detect_enable bg_threshold_diff bg_threshold_mean_diff bg_lambda_qp bg_delta_qp s2fme_disable
      0    h264                0                 0                      0            0           0             0

----encode status----
enc_idx  enc_id cur_input_buf_cnt cur_output_buf_cnt left_recv_frame left_enc_frame total_input_buf_cnt total_output_buf_cnt     fps
      0    h264                 0                  1               0              0                  56                   56      29
```

参数解析（按输出分组）：

| 分组 | 字段 | 说明 |
|---|---|---|
| encode enc param（基础编码参数）| `enc_idx` | 编码实例号 |
| | `enc_id` | 编码类型（h264/h265/jpeg）|
| | `profile` / `level` | profile / level 类型 |
| | `width` / `height` | 编码宽 / 高 |
| | `pix_fmt` | 输入帧像素类型 |
| | `fbuf_count` | 输入 FrameBuffer 数 |
| | `extern_buf_flag` | 是否使用外部输入 buffer |
| | `bsbuf_count` / `bsbuf_size` | bitstream buffer 个数 / 大小 |
| | `mirror` / `rotate` | 镜像 / 旋转 |
| encode h264cbr param（CBR 码率控制）| `rc_mode` | 码率控制类型（h264cbr）|
| | `intra_period` / `intra_qp` | I 帧间隔 / I 帧 QP |
| | `bit_rate` / `frame_rate` | 码率 / 帧率 |
| | `initial_rc_qp` | 初始 QP |
| | `vbv_buffer_size` | VBV buffer 大小 |
| | `mb_level_rc_enalbe` | 码率控制是否工作在宏块级 |
| | `min/max_qp_I`、`min/max_qp_P`、`min/max_qp_B` | I/P/B 帧最小/最大 QP |
| | `hvs_qp_enable` / `hvs_qp_scale` | subCTU 级码率控制使能 / QP 缩放因子 |
| | `qp_map_enable` | 使能 ROI 编码时的 QP map |
| | `max_delta_qp` | HVS QP 最大偏差 |
| encode gop param（GOP 参数）| `gop_preset_idx` | 预置 GOP 结构 |
| | `custom_gop_size` | 自定义 GOP 大小 |
| | `decoding_refresh_type` | IDR 帧刷新类型 |
| encode intra refresh（帧内刷新）| `intra_refresh_mode` / `intra_refresh_arg` | 帧内刷新模式 / 参数 |
| encode longterm ref（长期参考帧）| `use_longterm` | 使能长期参考帧 |
| | `longterm_pic_period` / `longterm_pic_using_period` | 长期参考帧周期 / 使用周期 |
| encode roi_params（ROI 参数）| `roi_enable` | 使能 ROI 编码 |
| | `roi_map_array_count` | ROI map 元素个数 |
| encode h264 entropy params | `entropy_coding_mode` | 熵编码模式（CABAC/CAVLC）|
| encode h264 slice params | `h264_slice_mode` / `h264_slice_arg` | slice 模式 / 参数 |
| encode h264 deblk filter（去块滤波）| `disable_deblocking_filter_idc` | 去块滤波开关 |
| | `slice_alpha_c0_offset_div2` / `slice_beta_offset_div2` | α / β 去块参数偏移 |
| encode h264 timing | `vui_num_units_in_tick` / `vui_time_scale` | 时间单位数 / 一秒内时间单位数 |
| | `fixed_frame_rate_flag` | 固定帧率标志 |
| encode h264_intra_pred | `constrained_intra_pred_flag` | 帧内预测是否受限 |
| encode h264_transform | `transform_8x8_enable` | 8×8 变换使能 |
| | `chroma_cb_qp_offset` / `chroma_cr_qp_offset` | cb / cr 分量 QP 偏差 |
| | `user_scaling_list_enable` | 使能用户 scaling list |
| encode h264 vui | 各 `*_flag`/`sar_*`/`colour_*`/`matrix_*` | 宽高比、过扫、视频信号、色彩、时序等 VUI 信息 |
| encode 3dnr | `nr_y/cb/cr_enable` | Y/Cb/Cr 去噪使能 |
| | `nr_est_enable` | 噪声估计使能 |
| | `nr_intra_weight*` / `nr_inter_weight*` | 帧内 / 帧间去噪权重 |
| | `nr_noise_sigma*` | 噪声强度 |
| encode smart bg（智能背景检测）| `bg_detect_enable` | 背景检测使能 |
| | `bg_threshold_diff` / `bg_threshold_mean_diff` | 背景判定阈值 |
| | `bg_lambda_qp` / `bg_delta_qp` | 背景 QP 调整 |
| | `s2fme_disable` | 小块运动估计禁用 |
| encode status（当前编码状态）| `cur_input_buf_cnt` / `cur_output_buf_cnt` | 当前 input / output buffer 数 |
| | `left_recv_frame` / `left_enc_frame` | 剩余待接收 / 待编码帧数（设 `receive_frame_number` 后有效）|
| | `total_input_buf_cnt` / `total_output_buf_cnt` | 累计 input / output buffer 数 |
| | `fps` | 当前帧率 |

`vdec` 仅在解码任务运行时输出（无任务时为空）。同样以 `sample_codec` 跑一路 H.264 解码触发，解码配置节选（`decode_streams` 为按位掩码，规则同 `encode_streams`）：

```ini
[decode]
decode_streams = 0x1

[vdec_stream1]
codec_type = 0
width = 1920
height = 1080
input = 1920x1080_30fps.h264
output = 1920x1080_NV12.yuv
```

运行解码：

```bash
cd /app/multimedia_samples/sample_codec
./sample_codec -d 0x1      # 启用 vdec_stream1 解码
```

解码运行中查看：

```bash
cat /sys/kernel/debug/vpu/vdec
```

输出按 decode param、h264 decode param、decode frameinfo、decode status 分组，示例如下（H.264 解码 1920×1080）：

```text
----decode param----
dec_idx  dec_id feed_mode pix_fmt bitstream_buf_size bitstream_buf_count frame_buf_count
      0    h264         1       1            3110912                   3               3
----h264 decode param----
dec_idx  dec_id reorder_enable skip_mode bandwidth_Opt
      0    h264              1         0             1

----decode frameinfo----
dec_idx  dec_id display_width display_height
      0    h264          1920           1080
----decode status----
dec_idx  dec_id cur_input_buf_cnt cur_output_buf_cnt total_input_buf_cnt total_output_buf_cnt     fps
      0    h264                 0                  2                  11                   11       0
```

参数解析（按输出分组）：

| 分组 | 字段 | 说明 |
|---|---|---|
| decode param（基础解码参数）| `dec_idx` / `dec_id` | 解码实例号 / 类型（h264/h265/jpeg）|
| | `feed_mode` | 数据填充模式 |
| | `pix_fmt` | 输出像素类型 |
| | `bitstream_buf_size` / `bitstream_buf_count` | 输入 bitstream 缓存大小 / 个数 |
| | `frame_buf_count` | 输出 FrameBuffer 缓存个数 |
| h264 decode param（H.264 解码参数）| `reorder_enable` | 使能解码器按显示顺序输出帧序列 |
| | `skip_mode` | 使能帧解码忽略模式 |
| | `bandwidth_Opt` | 使能节省带宽模式 |
| decode frameinfo（解码输出帧信息）| `display_width` / `display_height` | 显示宽 / 高 |
| decode status（当前解码状态）| `cur_input_buf_cnt` / `cur_output_buf_cnt` | 当前 input / output buffer 数 |
| | `total_input_buf_cnt` / `total_output_buf_cnt` | 累计 input / output buffer 数 |
| | `fps` | 当前帧率 |

## JPU 模块调试信息

JPU 为 JPEG 编解码单元，含 JENC 与 JDEC，节点位于 `/sys/kernel/debug/jpu/`：

```bash
ls /sys/kernel/debug/jpu/
# jdec  jenc  loading  loadingsetting
cat /sys/kernel/debug/jpu/loading
cat /sys/kernel/debug/jpu/jenc     # JPEG 编码实例状态，无任务时为空
cat /sys/kernel/debug/jpu/jdec     # JPEG 解码实例状态，无任务时为空
```

运行 JPEG 编码时 `loading` 实测约 `1.8`：

```text
1.8
```

`jenc` 仅在 JPEG 编码任务运行时输出（无任务时为空）。以 `sample_codec` 跑一路 JPEG 编码触发，对应 `codec_config.ini` 的 `venc_stream3`（`codec_type=3`，即 JPEG）。运行：

```bash
cd /app/multimedia_samples/sample_codec
./sample_codec -e 0x4      # 0x04 启用 venc_stream3（JPEG 编码 1280×720，quality 50）
```

编码运行中查看：

```bash
cat /sys/kernel/debug/jpu/jenc
```

输出按 encode param、rc param、encode status 分组，示例如下（JPEG 编码 1280×720，quality 50）：

```text
----encode param----
enc_idx  enc_id width height pix_fmt fbuf_count extern_buf_flag bsbuf_count bsbuf_size mirror rotate
      0    jpeg  1280    720       1          3               0           3    1384448      0      0

----encode rc param----
enc_idx   rc_mode frame_rate quality_factor
      0 noratecontrol          0             50

----encode status----
enc_idx  enc_id cur_input_buf_cnt cur_output_buf_cnt left_recv_frame left_enc_frame total_input_buf_cnt total_output_buf_cnt     fps
      0    jpeg                 0                  1               0              0                  61                   61      31
```

参数解析（按输出分组）：

| 分组 | 字段 | 说明 |
|---|---|---|
| encode param（基础编码参数）| `enc_idx` / `enc_id` | 编码实例号 / 类型（jpeg）|
| | `width` / `height` | 图像宽 / 高 |
| | `pix_fmt` | 像素类型 |
| | `fbuf_count` | 输入 FrameBuffer 缓存个数 |
| | `extern_buf_flag` | 是否使用用户分配的输入 buffer |
| | `bsbuf_count` / `bsbuf_size` | 输出 bitstream 缓存个数 / 大小 |
| | `mirror` / `rotate` | 镜像 / 旋转 |
| encode rc param（码率控制）| `rc_mode` | 码率控制模式（noratecontrol）|
| | `frame_rate` | 目标帧率 |
| | `quality_factor` | 量化因子（quality）|
| encode status（当前编码状态）| `cur_input_buf_cnt` / `cur_output_buf_cnt` | 当前 input / output buffer 数 |
| | `left_recv_frame` / `left_enc_frame` | 剩余待接收 / 待编码帧数（设 `receive_frame_number` 后有效）|
| | `total_input_buf_cnt` / `total_output_buf_cnt` | 累计 input / output buffer 数 |
| | `fps` | 当前帧率 |

`jdec` 仅在 JPEG 解码任务运行时输出（无任务时为空）。同样以 `sample_codec` 跑一路 JPEG 解码触发，对应 `vdec_stream3`。运行：

```bash
cd /app/multimedia_samples/sample_codec
./sample_codec -d 0x4      # 0x04 启用 vdec_stream3（JPEG 解码 1280×720）
```

解码运行中查看：

```bash
cat /sys/kernel/debug/jpu/jdec
```

输出按 decode param、decode frameinfo、decode status 分组，示例如下（JPEG 解码 1280×720）：

```text
----decode param----
dec_idx  dec_id feed_mode pix_fmt bitstream_buf_size bitstream_buf_count frame_buf_count mirror rotate
      0    jpeg         1       1            1382400                   3               3      0      0

----decode frameinfo----
dec_idx  dec_id display_width display_height
      0    jpeg          1280            720

----decode status----
dec_idx  dec_id cur_input_buf_cnt cur_output_buf_cnt total_input_buf_cnt total_output_buf_cnt     fps
      0    jpeg                 0                  1                 100                  100       0
```

参数解析（按输出分组）：

| 分组 | 字段 | 说明 |
|---|---|---|
| decode param（基础解码参数）| `dec_idx` / `dec_id` | 解码实例号 / 类型（jpeg）|
| | `feed_mode` | 数据填充模式 |
| | `pix_fmt` | 输出像素类型 |
| | `bitstream_buf_size` / `bitstream_buf_count` | 输入 bitstream 缓存大小 / 个数 |
| | `frame_buf_count` | 输出 FrameBuffer 缓存个数 |
| | `mirror` / `rotate` | 镜像 / 旋转 |
| decode frameinfo（解码输出帧信息）| `display_width` / `display_height` | 显示宽 / 高 |
| decode status（当前解码状态）| `cur_input_buf_cnt` / `cur_output_buf_cnt` | 当前 input / output buffer 数 |
| | `total_input_buf_cnt` / `total_output_buf_cnt` | 累计 input / output buffer 数 |
| | `fps` | 当前帧率 |

字段含义与 VPU 对应：`loading`/`loadingsetting` 同上；`jenc`、`jdec` 分别为 JPEG 编码、解码的实例状态文件（文件而非目录），无 JPEG 任务时为空。

