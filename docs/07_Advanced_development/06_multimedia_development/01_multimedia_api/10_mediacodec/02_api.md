---
sidebar_position: 2
title: "MediaCodec API 参考"
description: "RDK S100/S600 MediaCodec 74 个接口说明、数据结构与返回值"
toc_max_heading_level: 4
---

import DocScope from '@site/src/components/DocScope';

# MediaCodec API 参考

本篇逐条说明 74 个接口、数据结构与返回值约定；硬件规格与使用方法见 [MediaCodec 使用指南](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage)。

## API 参考

MediaCodec 共 74 个接口。多数配置类是**成对**出现的 `get_*` / `set_*`：`set_*` 下发参数，`get_*` 读回当前值。

### 生命周期与状态

| 接口 | 功能 |
| --- | --- |
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

### 回调与设备关联

| 接口 | 功能 |
| --- | --- |
| [`hb_mm_mc_set_callback`](#hb_mm_mc_set_callback) | 设置回调，切换到异步模式 |
| [`hb_mm_mc_set_vlc_buffer_listener`](#hb_mm_mc_set_vlc_buffer_listener) | 设置码流 buffer 大小监听回调 |
| [`hb_mm_mc_set_camera`](#hb_mm_mc_set_camera) | 指定关联的相机通道信息 |
| [`hb_mm_mc_vpf_init`](#hb_mm_mc_vpf_init) | 与 VPF 通道关联 |
| [`hb_mm_mc_get_fd`](#hb_mm_mc_get_fd) | 取得设备 fd |
| [`hb_mm_mc_close_fd`](#hb_mm_mc_close_fd) | 关闭设备 fd |

### 数据收发

| 接口 | 功能 |
| --- | --- |
| [`hb_mm_mc_dequeue_input_buffer`](#hb_mm_mc_dequeue_input_buffer) | 取一个空闲输入 buffer |
| [`hb_mm_mc_queue_input_buffer`](#hb_mm_mc_queue_input_buffer) | 交还输入 buffer |
| [`hb_mm_mc_dequeue_output_buffer`](#hb_mm_mc_dequeue_output_buffer) | 取出一个装有结果的输出 buffer |
| [`hb_mm_mc_queue_output_buffer`](#hb_mm_mc_queue_output_buffer) | 交还输出 buffer |

### 码率与 IDR 控制

| 接口 | 功能 |
| --- | --- |
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

### 编码质量工具

| 接口 | 功能 |
| --- | --- |
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

### ROI 编码

| 接口 | 功能 |
| --- | --- |
| [`hb_mm_mc_get_roi_config`](#hb_mm_mc_get_roi_config) | 读取 ROI 配置 |
| [`hb_mm_mc_set_roi_config`](#hb_mm_mc_set_roi_config) | 设置 ROI 编码 |
| [`hb_mm_mc_get_roi_config_ex`](#hb_mm_mc_get_roi_config_ex) | 按索引读取 ROI 区域配置 |
| [`hb_mm_mc_set_roi_config_ex`](#hb_mm_mc_set_roi_config_ex) | 按索引设置 ROI 区域配置 |
| [`hb_mm_mc_get_roi_avg_qp`](#hb_mm_mc_get_roi_avg_qp) | 读取 ROI 平均 QP |
| [`hb_mm_mc_set_roi_avg_qp`](#hb_mm_mc_set_roi_avg_qp) | 设置 ROI 平均 QP |

### 码流结构与用户数据

| 接口 | 功能 |
| --- | --- |
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

### MJPEG / JPEG 编码

| 接口 | 功能 |
| --- | --- |
| [`hb_mm_mc_get_mjpeg_config`](#hb_mm_mc_get_mjpeg_config) | 读取 MJPEG 编码参数 |
| [`hb_mm_mc_set_mjpeg_config`](#hb_mm_mc_set_mjpeg_config) | 设置 MJPEG 编码参数 |
| [`hb_mm_mc_get_jpeg_config`](#hb_mm_mc_get_jpeg_config) | 读取 JPEG 编码参数 |
| [`hb_mm_mc_set_jpeg_config`](#hb_mm_mc_set_jpeg_config) | 设置 JPEG 编码参数 |

### 音频组件注册

| 接口 | 功能 |
| --- | --- |
| [`hb_mm_mc_register_audio_encoder`](#hb_mm_mc_register_audio_encoder) | 注册音频编码器 |
| [`hb_mm_mc_unregister_audio_encoder`](#hb_mm_mc_unregister_audio_encoder) | 去注册音频编码器 |
| [`hb_mm_mc_register_audio_decoder`](#hb_mm_mc_register_audio_decoder) | 注册音频解码器 |
| [`hb_mm_mc_unregister_audio_decoder`](#hb_mm_mc_unregister_audio_decoder) | 去注册音频解码器 |

## 接口说明
下文 74 个接口共用以下约定，各小节不再重复。

- **返回值**：成功返回 `0`，失败返回负值错误码，含义统一见[返回值说明](#返回值说明)。
- **动态调整**：标注「支持动态调整」的配置类接口，可在 `hb_mm_mc_start` 之后运行期间调用，立即生效。

### 生命周期与状态

#### hb_mm_mc_get_descriptor

**【函数原型】**

```c
const media_codec_descriptor_t *hb_mm_mc_get_descriptor( media_codec_id_t codec_id);
```

**【功能描述】**

查询指定 codec 的描述信息。返回 `NULL` 表示该 codec 在当前平台上不可用，应当在建立通路前用它做一次可用性判断。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `codec_id` | `media_codec_id_t` | codec 类型，取值见 [media_codec_id_t](#media_codec_id_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 该接口不依赖 context，可在任何时刻调用。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_default_context

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_default_context(media_codec_id_t codec_id, hb_bool encoder, media_codec_context_t *context);
```

**【功能描述】**

取得指定 codec 的默认 context。`encoder` 传 `1` 得到编码器 context、传 `0` 得到解码器 context。调用方获取默认值后按需修改字段，再交给 `hb_mm_mc_initialize`。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `codec_id` | `media_codec_id_t` | codec 类型，取值见 [media_codec_id_t](#media_codec_id_t) |
| `encoder` | `hb_bool` | `1` 为编码器，`0` 为解码器 |
| `context` | `media_codec_context_t *` | **出参**。codec 上下文 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 分辨率、码率、GOP 等业务参数都需要在默认值基础上改写。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_initialize

**【函数原型】**

```c
hb_s32 hb_mm_mc_initialize(media_codec_context_t *context);
```

**【功能描述】**

初始化 codec 与 context，使其进入可配置状态。仅在 `MEDIA_CODEC_STATE_UNINITIALIZED` 状态下调用有效。成功后进入 `MEDIA_CODEC_STATE_INITIALIZED` 状态。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- `context` 中的 `codec_id` 与 `encoder` 必须在此前确定，初始化后不可更改。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_configure

**【函数原型】**

```c
hb_s32 hb_mm_mc_configure(media_codec_context_t *context);
```

**【功能描述】**

把 context 中已填好的参数下发到 codec，使其生效。需处于 `MEDIA_CODEC_STATE_INITIALIZED` 状态。成功后进入 `MEDIA_CODEC_STATE_CONFIGURED` 状态。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 各 `set_*_config` 类接口如果要在启动前配置，都应在 `hb_mm_mc_configure` 之前完成。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_start

**【函数原型】**

```c
hb_s32 hb_mm_mc_start(media_codec_context_t *context, const mc_av_codec_startup_params_t * info);
```

**【功能描述】**

启动编解码处理。VPU 会据此创建编解码实例、注册帧缓冲、生成编码头等。需处于 `MEDIA_CODEC_STATE_CONFIGURED` 状态。成功后进入 `MEDIA_CODEC_STATE_STARTED` 状态。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `info` | `mc_av_codec_startup_params_t *` | 启动参数，见 [mc_av_codec_startup_params_t](#mc_av_codec_startup_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- `hb_mm_mc_set_callback` 与 `hb_mm_mc_set_vlc_buffer_listener` 必须在调用本接口之前完成。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_stop

**【函数原型】**

```c
hb_s32 hb_mm_mc_stop(media_codec_context_t *context);
```

**【功能描述】**

停止编解码处理并复位实例。成功后回到 `MEDIA_CODEC_STATE_INITIALIZED` 状态。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_pause

**【函数原型】**

```c
hb_s32 hb_mm_mc_pause(media_codec_context_t *context);
```

**【功能描述】**

暂停编解码处理。暂停期间不再消耗输入 buffer。成功后进入 `MEDIA_CODEC_STATE_PAUSED` 状态。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_flush

**【函数原型】**

```c
hb_s32 hb_mm_mc_flush(media_codec_context_t *context);
```

**【功能描述】**

清空输入与输出 buffer 队列中尚未处理的 buffer。执行过程中进入 `MEDIA_CODEC_STATE_FLUSHING` 状态，清空完成后自动回到 `MEDIA_CODEC_STATE_STARTED` 状态。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- flush 会丢弃队列中已有的数据，切换码流或重新对齐时间戳时使用。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_release

**【函数原型】**

```c
hb_s32 hb_mm_mc_release(media_codec_context_t *context);
```

**【功能描述】**

释放 codec 及其占用的实例资源。调用前建议先 `hb_mm_mc_stop`。释放后回到 `MEDIA_CODEC_STATE_UNINITIALIZED` 状态。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_state

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_state(media_codec_context_t *context, media_codec_state_t *state);
```

**【功能描述】**

查询 MediaCodec 的当前状态，取值见 [media_codec_state_t](#media_codec_state_t)。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `state` | `media_codec_state_t *` | **出参**。codec 状态，见 [media_codec_state_t](#media_codec_state_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 调试时可用它确认某个接口是否处在允许的状态下被调用。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_status

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_status(media_codec_context_t *context, mc_inter_status_t *status);
```

**【功能描述】**

查询 codec 的详细运行状态信息（帧计数、buffer 占用等），取值见 [mc_inter_status_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_inter_status_t)。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `status` | `mc_inter_status_t *` | **出参**。codec 详细状态，见 [mc_inter_status_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_inter_status_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

### 回调与设备关联

#### hb_mm_mc_set_callback

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_callback(media_codec_context_t *context, const media_codec_callback_t *callback, hb_ptr userdata);
```

**【功能描述】**

设置回调函数，编码器/解码器随之切换到**异步模式**：输入 buffer 可用或输出 buffer 可用时由 codec 回调通知，调用方在回调中处理，无需自己轮询。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `callback` | `media_codec_callback_t *` | 回调函数 |
| `userdata` | `hb_ptr` | 用户数据指针，回调时作为入参原样传回 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 必须在 `hb_mm_mc_start` 之前调用。
- 异步模式与同步轮询模式二选一，设置回调后不要再在业务线程里主动 dequeue。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_vlc_buffer_listener

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_vlc_buffer_listener( media_codec_context_t *context, const media_codec_callback_t *callback, hb_ptr userdata);
```

**【功能描述】**

设置码流 buffer 大小监听回调。当编码器发现码流 buffer 不足时回调通知，调用方可在回调中调整 buffer 大小。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `callback` | `media_codec_callback_t *` | 见 [media_codec_callback_t](#media_codec_callback_t) |
| `userdata` | `hb_ptr` | 用户数据指针，回调时原样传回 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 必须在 `hb_mm_mc_start` 之前调用。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_camera

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_camera(media_codec_context_t *context, hb_s32 pipeline, hb_s32 channel_port_id);
```

**【功能描述】**

指定本路编解码关联的相机通道信息，用于与 VPF 通路对接时标识数据来源。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `pipeline` | `hb_s32` | pipeline 编号 |
| `channel_port_id` | `hb_s32` | IPU 通道端口号 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_vpf_init

**【函数原型】**

```c
hb_s32 hb_mm_mc_vpf_init(media_codec_context_t * context, hb_s32 channel_idx);
```

**【功能描述】**

把 MediaCodec 与指定的 VPF 通道关联，使编解码器可以从 VPF 通路直接取帧或向通路送帧。**必须在 `hb_mm_mc_initialize` 之后、`hb_mm_mc_configure` 之前调用**，顺序颠倒会返回 `HB_MEDIA_ERR_OPERATION_NOT_ALLOWED`。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `channel_idx` | `hb_s32` | VPF 通道号 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 不使用 VPF 通路、完全由调用方自己喂帧的场景不需要调用本接口。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_fd

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_fd(media_codec_context_t * context, hb_s32 *fd);
```

**【功能描述】**

取得 codec 的设备 fd，可用于 `select` / `poll` 等事件等待，把编解码就绪事件并入调用方自己的事件循环。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `fd` | `hb_s32 *` | **出参**。设备 fd |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 取得的 fd 必须用 `hb_mm_mc_close_fd` 关闭，不要直接 `close`。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_close_fd

**【函数原型】**

```c
hb_s32 hb_mm_mc_close_fd(media_codec_context_t * context, hb_s32 fd);
```

**【功能描述】**

关闭由 `hb_mm_mc_get_fd` 取得的设备 fd。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `fd` | `hb_s32` | 设备 fd |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

### 数据收发

#### hb_mm_mc_dequeue_input_buffer

**【函数原型】**

```c
hb_s32 hb_mm_mc_dequeue_input_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, hb_s32 timeout);
```

**【功能描述】**

从输入队列取出一个空闲 buffer，供调用方填入待编码（或待解码）的数据。仅在 `MEDIA_CODEC_STATE_STARTED` 状态下有效。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `buffer` | `media_codec_buffer_t *` | **出参**。buffer 描述符，包含虚拟地址、物理地址与大小 |
| `timeout` | `hb_s32` | 超时时间，单位 ms |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 取出的 buffer 用完必须 `hb_mm_mc_queue_input_buffer` 归还，否则队列会被耗尽。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_queue_input_buffer

**【函数原型】**

```c
hb_s32 hb_mm_mc_queue_input_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, hb_s32 timeout);
```

**【功能描述】**

把填好数据的输入 buffer 交还给 codec，触发一次编解码处理。仅在 `MEDIA_CODEC_STATE_STARTED` 状态下有效。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `buffer` | `media_codec_buffer_t *` | **出参**。buffer 描述符，包含虚拟地址、物理地址与大小 |
| `timeout` | `hb_s32` | 超时时间，单位 ms |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_dequeue_output_buffer

**【函数原型】**

```c
hb_s32 hb_mm_mc_dequeue_output_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, media_codec_output_buffer_info_t*info, hb_s32 timeout);
```

**【功能描述】**

从输出队列取出一个装有编解码结果的 buffer。编码时是码流，解码时是 YUV 图像。仅在 `MEDIA_CODEC_STATE_STARTED` 状态下有效。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `buffer` | `media_codec_buffer_t *` | **出参**。buffer 描述符，包含虚拟地址、物理地址与大小 |
| `info` | `media_codec_output_buffer_info_t*` | **出参**。码流附加信息，见 [media_codec_output_buffer_info_t](#media_codec_output_buffer_info_t) |
| `timeout` | `hb_s32` | 超时时间，单位 ms |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- `info` 出参会带回码流或图像的附加信息（帧类型、时间戳等），按需解析。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_queue_output_buffer

**【函数原型】**

```c
hb_s32 hb_mm_mc_queue_output_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, hb_s32 timeout);
```

**【功能描述】**

把消费完的输出 buffer 交还给 codec，供后续复用。仅在 `MEDIA_CODEC_STATE_STARTED` 状态下有效。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `buffer` | `media_codec_buffer_t *` | **出参**。buffer 描述符，包含虚拟地址、物理地址与大小 |
| `timeout` | `hb_s32` | 超时时间，单位 ms |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

### 码率与 IDR 控制

#### hb_mm_mc_get_rate_control_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_rate_control_config( media_codec_context_t *context, mc_rate_control_params_t *params);
```

**【功能描述】**

读取当前的码率控制参数。仅 H.264 / H.265 / MJPEG codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_rate_control_params_t *` | **出参**。码率控制参数，见 [码率控制](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#码率控制) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_rate_control_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_rate_control_config( media_codec_context_t *context, const mc_rate_control_params_t *params);
```

**【功能描述】**

设置码率控制参数，包括码控模式与各模式的参数项。仅 H.264 / H.265 / MJPEG codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_rate_control_params_t *` | 码率控制参数，见 [码率控制](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#码率控制) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 支持运行中**动态调整**，不需要重启编码器。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_max_bit_rate_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_max_bit_rate_config( media_codec_context_t *context, hb_u32 *params);
```

**【功能描述】**

读取最大码率配置。仅对 AVBR 与 CBR 码控模式有意义。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `hb_u32 *` | **出参**。最大码率配置 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_max_bit_rate_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_max_bit_rate_config( media_codec_context_t *context, hb_u32 params);
```

**【功能描述】**

设置 AVBR 模式下的最大码率，单位 kbps，取值 `[0, 700000]`。仅对 AVBR 与 CBR 码控模式有意义。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `hb_u32` | 码率控制参数，见 [码率控制](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#码率控制) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 当设置值小于目标码率 `bit_rate` 时，峰值传输码率视为无限大，即该限制不产生约束。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_longterm_ref_mode

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_longterm_ref_mode( media_codec_context_t *context, mc_video_longterm_ref_mode_t *params);
```

**【功能描述】**

读取长期参考帧模式的配置。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_longterm_ref_mode_t *` | **出参**。长期参考帧参数，见 [mc_video_longterm_ref_mode_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_longterm_ref_mode_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_longterm_ref_mode

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_longterm_ref_mode( media_codec_context_t *context, const mc_video_longterm_ref_mode_t *params);
```

**【功能描述】**

设置长期参考帧模式，用于抑制帧间预测的累积误差。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_longterm_ref_mode_t *` | 长期参考帧参数，见 [mc_video_longterm_ref_mode_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_longterm_ref_mode_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 支持运行中**动态调整**。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_intra_refresh_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_intra_refresh_config( media_codec_context_t *context, mc_video_intra_refresh_params_t *params);
```

**【功能描述】**

读取 Intra Refresh 的配置。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_intra_refresh_params_t *` | **出参**。Intra Refresh 参数，见 [mc_video_intra_refresh_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_intra_refresh_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_intra_refresh_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_intra_refresh_config( media_codec_context_t *context, const mc_video_intra_refresh_params_t *params);
```

**【功能描述】**

设置 Intra Refresh。在非 I 帧内部周期性插入帧内编码的块，为解码端提供修复点，提高码流的抗误码能力。可指定插入的行数、列数或步长，也可只给总量由编码器自行决定位置。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_intra_refresh_params_t *` | Intra Refresh 参数，见 [mc_video_intra_refresh_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_intra_refresh_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_request_idr_frame

**【函数原型】**

```c
hb_s32 hb_mm_mc_request_idr_frame(media_codec_context_t *context);
```

**【功能描述】**

请求编码器把下一帧编成 IDR 帧。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 需要在码流中插入随机接入点时调用，典型场景是解码端新接入或发生丢包后恢复。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_request_idr_header

**【函数原型】**

```c
hb_s32 hb_mm_mc_request_idr_header( media_codec_context_t *context, hb_u32 force_header);
```

**【功能描述】**

使能或关闭 IDR 帧输出，默认使能。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `force_header` | `hb_u32` | 使能 / 关闭 IDR 帧头输出，默认使能 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_enable_idr_frame

**【函数原型】**

```c
hb_s32 hb_mm_mc_enable_idr_frame( media_codec_context_t *context, hb_bool enable);
```

**【功能描述】**

使能或关闭 IDR 帧输出，默认使能。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `enable` | `hb_bool` | 使能 / 关闭 IDR 帧，默认使能 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_skip_pic

**【函数原型】**

```c
hb_s32 hb_mm_mc_skip_pic(media_codec_context_t * context, hb_s32 src_idx);
```

**【功能描述】**

请求跳过当前图像。编码器忽略输入图像内容，直接复用上一帧的重构帧，输出一个 P 帧——解码端看到的画面与上一帧完全相同。仅 H.264 / H.265 codec，且只对非 I 帧有效。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `src_idx` | `hb_s32` | 源 buffer 索引 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 无论当前 GOP 结构如何，skip 帧一律编为 P 帧。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

### 编码质量工具

#### hb_mm_mc_get_deblk_filter_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_deblk_filter_config( media_codec_context_t *context, mc_video_deblk_filter_params_t *params);
```

**【功能描述】**

读取去块滤波器的配置。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_deblk_filter_params_t *` | **出参**。去块滤波参数，见 [mc_video_deblk_filter_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_deblk_filter_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_deblk_filter_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_deblk_filter_config( media_codec_context_t *context, const mc_video_deblk_filter_params_t *params);
```

**【功能描述】**

设置去块滤波器。用于削弱块效应，关闭后画面在低码率下会出现明显方块。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_deblk_filter_params_t *` | 去块滤波参数，见 [mc_video_deblk_filter_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_deblk_filter_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_sao_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_sao_config(media_codec_context_t *context, mc_h265_sao_params_t *params);
```

**【功能描述】**

读取 SAO（Sample Adaptive Offset，样点自适应补偿）的配置。仅 H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_h265_sao_params_t *` | **出参**。SAO 参数，见 [mc_h265_sao_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_h265_sao_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_sao_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_sao_config(media_codec_context_t *context, const mc_h265_sao_params_t *params);
```

**【功能描述】**

设置 SAO。SAO 在去块滤波之后进一步补偿像素，改善重建画质，是 H.265 特有的编码工具。仅 H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_h265_sao_params_t *` | SAO 参数，见 [mc_h265_sao_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_h265_sao_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_entropy_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_entropy_config( media_codec_context_t *context, mc_h264_entropy_params_t *params);
```

**【功能描述】**

读取熵编码的配置。仅 H.264 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_h264_entropy_params_t *` | **出参**。熵编码参数，见 [mc_h264_entropy_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_h264_entropy_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_entropy_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_entropy_config( media_codec_context_t *context, const mc_h264_entropy_params_t *params);
```

**【功能描述】**

设置熵编码模式（CABAC / CAVLC）。CABAC 压缩率更高但计算量更大。仅 H.264 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_h264_entropy_params_t *` | 熵编码参数，见 [mc_h264_entropy_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_h264_entropy_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_pred_unit_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_pred_unit_config( media_codec_context_t *context, mc_video_pred_unit_params_t *params);
```

**【功能描述】**

读取帧内预测的配置。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_pred_unit_params_t *` | **出参**。帧内预测参数，见 [mc_video_pred_unit_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_pred_unit_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_pred_unit_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_pred_unit_config( media_codec_context_t *context, const mc_video_pred_unit_params_t *params);
```

**【功能描述】**

设置帧内预测相关参数。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_pred_unit_params_t *` | 帧内预测参数，见 [mc_video_pred_unit_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_pred_unit_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_transform_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_transform_config( media_codec_context_t *context, mc_video_transform_params_t *params);
```

**【功能描述】**

读取变换编码的配置。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_transform_params_t *` | **出参**。变换参数，见 [mc_video_transform_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_transform_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_transform_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_transform_config( media_codec_context_t *context, const mc_video_transform_params_t *params);
```

**【功能描述】**

设置变换相关参数。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_transform_params_t *` | 变换参数，见 [mc_video_transform_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_transform_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_mode_decision_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_mode_decision_config( media_codec_context_t *context, mc_video_mode_decision_params_t *params);
```

**【功能描述】**

读取编码模式决策的配置。仅 H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_mode_decision_params_t *` | **出参**。模式决策参数，见 [mc_video_mode_decision_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_mode_decision_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_mode_decision_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_mode_decision_config( media_codec_context_t *context, const mc_video_mode_decision_params_t *params);
```

**【功能描述】**

设置编码模式决策参数，用于在编码速度与压缩效率之间取舍。仅 H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_mode_decision_params_t *` | 模式决策参数，见 [mc_video_mode_decision_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_mode_decision_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_smart_bg_enc_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_smart_bg_enc_config( media_codec_context_t *context, mc_video_smart_bg_enc_params_t *params);
```

**【功能描述】**

读取智能背景编码的配置。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_smart_bg_enc_params_t *` | **出参**。智能背景编码参数，见 [mc_video_smart_bg_enc_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_smart_bg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_smart_bg_enc_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_smart_bg_enc_config( media_codec_context_t *context, const mc_video_smart_bg_enc_params_t *params);
```

**【功能描述】**

设置智能背景编码。针对监控等背景长期不变的场景，降低静止区域的码率开销。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_smart_bg_enc_params_t *` | 智能背景编码参数，见 [mc_video_smart_bg_enc_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_smart_bg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_3dnr_enc_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_3dnr_enc_config( media_codec_context_t *context, mc_video_3dnr_enc_params_t *params);
```

**【功能描述】**

读取 3D 降噪的配置。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_3dnr_enc_params_t *` | **出参**。3D 降噪参数，见 [mc_video_3dnr_enc_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_3dnr_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_3dnr_enc_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_3dnr_enc_config( media_codec_context_t *context, const mc_video_3dnr_enc_params_t *params);
```

**【功能描述】**

设置 3D 降噪（3D Noise Reduction）。利用时域信息抑制噪声，改善暗光场景的编码画质。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_3dnr_enc_params_t *` | 智能背景编码参数，见 [mc_video_smart_bg_enc_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_smart_bg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

### ROI 编码

#### hb_mm_mc_get_roi_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_roi_config(media_codec_context_t * context, mc_video_roi_params_t * params);
```

**【功能描述】**

读取 ROI 编码的配置。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_roi_params_t *` | **出参**。ROI 参数，见 [mc_video_roi_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_roi_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_roi_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_roi_config(media_codec_context_t * context, const mc_video_roi_params_t *params);
```

**【功能描述】**

设置 ROI 编码。按光栅扫描顺序为每个块指定 QP 值，实现重点区域高画质、次要区域省码率。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_roi_params_t *` | ROI 参数，见 [mc_video_roi_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_roi_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- H.264 的块大小为 16×16 像素，H.265 为 32×32 像素，每个 QP 值占 1 字节、取值 `[0, 51]`。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_roi_config_ex

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_roi_config_ex(media_codec_context_t *context, hb_u32 roi_idx, mc_video_roi_params_ex_t *params);
```

**【功能描述】**

按索引读取一路 ROI 区域的配置（ROI 扩展接口）。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `roi_idx` | `hb_u32` | ROI 区域索引 |
| `params` | `mc_video_roi_params_ex_t *` | **出参**。ROI 参数，见 [mc_video_roi_params_ex_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_roi_params_ex_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_roi_config_ex

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_roi_config_ex(media_codec_context_t *context, const mc_video_roi_params_ex_t *params);
```

**【功能描述】**

按索引设置一路 ROI 区域的配置（ROI 扩展接口）。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_roi_params_ex_t *` | ROI 参数，见 [mc_video_roi_params_ex_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_roi_params_ex_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_roi_avg_qp

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_roi_avg_qp(media_codec_context_t * context, hb_u32 * params);
```

**【功能描述】**

读取 ROI 区域的平均 QP 值。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `hb_u32 *` | **出参**。ROI 区域的平均 QP |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_roi_avg_qp

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_roi_avg_qp(media_codec_context_t * context, hb_u32 params);
```

**【功能描述】**

设置 ROI 区域的平均 QP 值，取值 `[0, 51]`。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `hb_u32` | ROI 区域的平均 QP，取值 `[0, 51]` |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- **仅在 CBR 或 AVBR 码控模式下有意义**——这两种模式下块的实际 QP 由 ROI 表值、码控内部值与该平均值共同决定。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

### 码流结构与用户数据

#### hb_mm_mc_get_vui_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_vui_config( media_codec_context_t *context, mc_video_vui_params_t *params);
```

**【功能描述】**

读取 VUI（Video Usability Information）的配置。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_vui_params_t *` | **出参**。VUI 参数，见 [mc_video_vui_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_vui_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_vui_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_vui_config( media_codec_context_t *context, const mc_video_vui_params_t *params);
```

**【功能描述】**

设置 VUI，向码流中写入像素宽高比、色彩描述等辅助信息。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_vui_params_t *` | VUI 参数，见 [mc_video_vui_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_vui_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_vui_timing_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_vui_timing_config( media_codec_context_t *context, mc_video_vui_timing_params_t *params);
```

**【功能描述】**

读取 VUI 中时序信息的配置。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_vui_timing_params_t *` | **出参**。VUI 时序参数，见 [mc_video_vui_timing_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_vui_timing_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_vui_timing_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_vui_timing_config( media_codec_context_t *context, const mc_video_vui_timing_params_t *params);
```

**【功能描述】**

设置 VUI 时序信息，向码流写入帧率相关参数，供解码端做帧率控制。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_vui_timing_params_t *` | VUI 时序参数，见 [mc_video_vui_timing_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_vui_timing_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_slice_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_slice_config(media_codec_context_t *context, mc_video_slice_params_t *params);
```

**【功能描述】**

读取 slice 切分参数。H.264 / H.265 / MJPEG / JPEG codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_slice_params_t *` | **出参**。slice 参数，见 [mc_video_slice_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_slice_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_slice_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_slice_config(media_codec_context_t *context, const mc_video_slice_params_t *params);
```

**【功能描述】**

设置 slice 切分参数。把一帧切成多个 slice 有利于并行编码与丢包恢复。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_video_slice_params_t *` | slice 参数，见 [mc_video_slice_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_video_slice_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_insert_user_data

**【函数原型】**

```c
hb_s32 hb_mm_mc_insert_user_data(media_codec_context_t * context, hb_u8 *data, hb_u32 length);
```

**【功能描述】**

向码流中插入用户自定义数据，例如设备编号、时间等业务信息。H.264 / H.265 / MJPEG / JPEG codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `data` | `hb_u8 *` | 用户数据，必须按 `UUID + 字符串` 的格式组织 |
| `length` | `hb_u32` | 数据长度，取值 `(0, 1024]` 字节 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- `data` 必须按 `UUID + 字符串` 的格式组织。
- `length` 取值范围 `(0, 1024]` 字节。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_user_data

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_user_data(media_codec_context_t * context, mc_user_data_buffer_t *params, hb_s32 timeout);
```

**【功能描述】**

从码流中取出调用方此前插入的用户数据。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_user_data_buffer_t *` | **出参**。用户数据，见 [mc_user_data_buffer_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_user_data_buffer_t) |
| `timeout` | `hb_s32` | 超时时间，单位 ms |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_release_user_data

**【函数原型】**

```c
hb_s32 hb_mm_mc_release_user_data(media_codec_context_t * context, const mc_user_data_buffer_t * params);
```

**【功能描述】**

释放取出的用户数据，与 `hb_mm_mc_get_user_data` 配对使用。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_user_data_buffer_t *` | **出参**。用户数据，见 [mc_user_data_buffer_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_user_data_buffer_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_explicit_header_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_explicit_header_config( media_codec_context_t *context, hb_s32 *status);
```

**【功能描述】**

读取显式头（explicit header）配置。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `status` | `hb_s32 *` | **出参**。显式头配置 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_explicit_header_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_explicit_header_config( media_codec_context_t *context, hb_s32 status);
```

**【功能描述】**

使能或关闭显式头输出，默认使能。仅 H.264 / H.265 codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `status` | `hb_s32` | 使能 / 关闭显式头，默认使能 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

### MJPEG / JPEG 编码

#### hb_mm_mc_get_mjpeg_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_mjpeg_config(media_codec_context_t * context, mc_mjpeg_enc_params_t *params);
```

**【功能描述】**

读取 MJPEG 编码参数。仅 MJPEG codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_mjpeg_enc_params_t *` | **出参**。MJPEG 编码参数，见 [mc_mjpeg_enc_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_mjpeg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_mjpeg_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_mjpeg_config(media_codec_context_t * context, const mc_mjpeg_enc_params_t *params);
```

**【功能描述】**

设置 MJPEG 编码参数。仅 MJPEG codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_mjpeg_enc_params_t *` | MJPEG 编码参数，见 [mc_mjpeg_enc_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_mjpeg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_jpeg_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_jpeg_config(media_codec_context_t * context, mc_jpeg_enc_params_t *params);
```

**【功能描述】**

读取 JPEG 编码参数。仅 JPEG codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_jpeg_enc_params_t *` | **出参**。JPEG 编码参数，见 [mc_jpeg_enc_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_jpeg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_set_jpeg_config

**【函数原型】**

```c
hb_s32 hb_mm_mc_set_jpeg_config(media_codec_context_t * context, const mc_jpeg_enc_params_t *params);
```

**【功能描述】**

设置 JPEG 编码参数。仅 JPEG codec。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `params` | `mc_jpeg_enc_params_t *` | JPEG 编码参数，见 [mc_jpeg_enc_params_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_jpeg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

### 音频组件注册

#### hb_mm_mc_register_audio_encoder

**【函数原型】**

```c
hb_s32 hb_mm_mc_register_audio_encoder(hb_s32 *handle, mc_audio_encode_param_t *encoder);
```

**【功能描述】**

注册一个外部音频编码器，使其可以通过 MediaCodec 的统一接口使用。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `handle` | `hb_s32 *` | **出参**。注册句柄 |
| `encoder` | `mc_audio_encode_param_t *` | 音频编码器描述，见 [mc_audio_encode_param_t](#mc_audio_encode_param_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 注册成功后返回 `handle`，去注册时需要使用。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_unregister_audio_encoder

**【函数原型】**

```c
hb_s32 hb_mm_mc_unregister_audio_encoder(hb_s32 handle);
```

**【功能描述】**

去注册此前注册的音频编码器。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `handle` | `hb_s32` | 注册句柄 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_register_audio_decoder

**【函数原型】**

```c
hb_s32 hb_mm_mc_register_audio_decoder(hb_s32 *handle, mc_audio_decode_param_t *decoder);
```

**【功能描述】**

注册一个外部音频解码器，使其可以通过 MediaCodec 的统一接口使用。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `handle` | `hb_s32 *` | **出参**。注册句柄 |
| `decoder` | `mc_audio_decode_param_t *` | 音频解码器描述，见 [mc_audio_decode_param_t](#mc_audio_decode_param_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 注册成功后返回 `handle`，去注册时需要使用。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_unregister_audio_decoder

**【函数原型】**

```c
hb_s32 hb_mm_mc_unregister_audio_decoder(hb_s32 handle);
```

**【功能描述】**

去注册此前注册的音频解码器。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `handle` | `hb_s32` | 注册句柄 |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

## 数据结构
字段的**语义**按主题分散在各节（`rc_params` 见[码率控制](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#码率控制)，`gop_params` 见 [GOP 与参考帧](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#gop-与参考帧)，buffer 各字段见[一帧数据的流转](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#数据流转)），这里只把配置的树摊开。完整字段以 SDK 头文件为准。

### 类型总览

MediaCodec 对外是一组 `hb_mm_mc_*` 函数。一路编解码任务的全部配置集中在 `media_codec_context_t` 里，初始化时下发一次；运行期再用 `set_*_config` 类接口增量修改。输入输出各走一条 buffer 队列，调用方只负责取还 buffer，不经手内存分配。

| 类型 | 作用 | 关键成员 |
| --- | --- | --- |
| `media_codec_context_t` | 一路编解码任务的全部配置 | `codec_id`、`encoder`、`video_enc_params` / `video_dec_params`、`priority` |
| `mc_video_codec_enc_params_t` | 编码参数 | `width` / `height`、`pix_fmt`、`rc_params`、`gop_params`、`frame_buf_count` |
| `mc_video_codec_dec_params_t` | 解码参数 | `feed_mode`、`pix_fmt`、`bitstream_buf_size` |
| `media_codec_buffer_t` | 一次收发的 buffer | `type`、`vframe_buf`、`vstream_buf` |
| `media_codec_callback_t` | 异步模式的回调集合 | `on_input_buffer_available`、`on_output_buffer_available` |
| `media_codec_descriptor_t` | codec 的静态描述 | `id`、`name`、`mime_types` |
| `media_codec_state_t` | 状态机取值 | 见 [状态迁移](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#状态迁移) |

**`codec_id` 与 `encoder`**：这两个字段决定 `video_*_params` 里哪个联合体成员生效，**初始化之后不可更改**。

**与 VPF 通路的关系**：编解码器可以当一个普通模块用（调用方自己喂 YUV、自己取码流），也可以通过 `hb_mm_mc_vpf_init` 挂到 VPF 通路上，由通路直接送帧、取帧。

**接口分属两个库**：`hb_mm_mc_*` 在 `libmultimedia.so`，buffer 内存的申请与 cache 操作等 `hb_mem_*` 在 `libhbmem.so`。

### media_codec_context_t

| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `codec_id` | `media_codec_id_t` | 编解码标准，**初始化后不可改** | `MEDIA_CODEC_ID_H264` | — | 见 [media_codec_id_t](#media_codec_id_t) |
| `encoder` | `hb_bool` | `1` = 编码器，`0` = 解码器，**初始化后不可改** | `1` | — | `0` / `1` |
| `instance_index` | `hb_s32` | 内部私有，不要修改 | — | — | — |
| `video_enc_params` | `mc_video_codec_enc_params_t` | 视频编码参数，`encoder = 1` 时生效 | — | — | 联合体四选一 |
| `video_dec_params` | `mc_video_codec_dec_params_t` | 视频解码参数，`encoder = 0` 时生效 | — | — | ↑ |
| `audio_enc_params` | `mc_audio_codec_enc_params_t` | 音频编码参数 | — | — | ↑ |
| `audio_dec_params` | `mc_audio_codec_dec_params_t` | 音频解码参数 | — | — | ↑ |
| `vpf_context` | `hb_ptr` | 内部私有，不要修改 | — | — | — |
| `priority` | `mc_video_cmd_prio_t` | 多路任务竞争硬件时的命令优先级 | — | `0`（`PRIO_0`） | 见 [mc_video_cmd_prio_t](#mc_video_cmd_prio_t) |

### mc_video_codec_enc_params_t

| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `width` / `height` | `hb_s32` | 输入图像宽高（亮度像素数） | `1920` × `1080` | — | 对齐宽 32 / 高 8，上限见[硬件规格](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#硬件规格) |
| `pix_fmt` | `mc_pixel_format_t` | 输入像素格式 | `MC_PIXEL_FORMAT_NV12` | — | 见 [mc_pixel_format_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_pixel_format_t) |
| `frame_buf_count` | `hb_u32` | 输入帧 buffer 数量 | — | — | — |
| `external_frame_buf` | `hb_bool` | `1` = 输入复用上游模块的 hbmem 内存，省一次拷贝 | `0` | `0` | `0` / `1` |
| `bitstream_buf_count` | `hb_u32` | 码流 buffer 数量 | — | — | — |
| `bitstream_buf_size` | `hb_u32` | 码流 buffer 大小 | — | `0` | `0` = 由 codec 自行计算 |
| `rc_params` | `mc_rate_control_params_t` | 码率控制参数，**唯一可运行中修改的成员** | — | — | 见[码率控制](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#码率控制) |
| `gop_params` | `mc_video_gop_params_t` | GOP 结构 | — | — | 见 [GOP 与参考帧](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#gop-与参考帧) |
| `rot_degree` | `mc_rotate_degree_t` | 编码前旋转（解码不支持） | `0` | `0` | `0°` / `90°` / `180°` / `270°` |
| `mir_direction` | `mc_mirror_direction_t` | 编码前镜像（解码不支持） | `0` | `0` | 垂直 / 水平 / 垂直+水平 |
| `frame_cropping_flag` | `hb_u32` | 是否启用输入裁剪 | `0` | `0` | `0` / `1` |
| `crop_rect` | `mc_av_codec_rect_t` | 裁剪矩形 | — | — | — |
| `enable_user_pts` | `hb_bool` | `1` = 用输入 buffer 的 pts 作码流 pts | `0` | `0` | `0` / `1` |
| `h264_enc_config` | `mc_h264_enc_config_t` | H.264 专有配置 | — | — | 联合体按 `codec_id` 四选一 |
| `h265_enc_config` | `mc_h265_enc_config_t` | H.265 专有配置 | — | — | ↑ |
| `mjpeg_enc_config` | `mc_mjpeg_enc_config_t` | MJPEG 专有配置 | — | — | ↑ |
| `jpeg_enc_config` | `mc_jpeg_enc_config_t` | JPEG 专有配置 | — | — | ↑ |

### mc_video_codec_dec_params_t

| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `feed_mode` | `mc_av_stream_feeding_mode_t` | 码流送入方式，**必设** | — | — | 见 [mc_av_stream_feeding_mode_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_av_stream_feeding_mode_t) |
| `pix_fmt` | `mc_pixel_format_t` | 输出像素格式 | `MC_PIXEL_FORMAT_NV12` | — | 见 [mc_pixel_format_t](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#mc_pixel_format_t) |
| `bitstream_buf_size` | `hb_u32` | 输入码流 buffer 大小 | — | — | — |
| `bitstream_buf_count` | `hb_u32` | 输入码流 buffer 数量 | — | — | — |
| `external_bitstream_buf` | `hb_bool` | `1` = 码流 buffer 复用外部 hbmem 内存 | `0` | `0` | `0` / `1` |
| `frame_buf_count` | `hb_u32` | 输出帧 buffer 数量 | — | — | — |
| `h264_dec_config` | `mc_h264_dec_config_t` | H.264 专有配置 | — | — | 联合体按 `codec_id` 四选一 |
| `h265_dec_config` | `mc_h265_dec_config_t` | H.265 专有配置 | — | — | ↑ |
| `mjpeg_dec_config` | `mc_mjpeg_dec_config_t` | MJPEG 专有配置 | — | — | ↑ |
| `jpeg_dec_config` | `mc_jpeg_dec_config_t` | JPEG 专有配置 | — | — | ↑ |

### media_codec_buffer_t

| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `type` | `media_codec_buffer_type_t` | 决定联合体哪个成员生效 | — | — | 见 [media_codec_buffer_type_t](#media_codec_buffer_type_t) |
| `vframe_buf` | `mc_video_frame_buffer_info_t` | 图像帧：编码的输入、解码的输出 | — | — | 联合体四选一 |
| `vstream_buf` | `mc_video_stream_buffer_info_t` | 码流：编码的输出、解码的输入 | — | — | ↑ |
| `aframe_buf` | `mc_audio_frame_buffer_info_t` | 音频帧 | — | — | ↑ |
| `astream_buf` | `mc_audio_stream_buffer_info_t` | 音频码流 | — | — | ↑ |

### media_codec_callback_t

异步模式的回调集合，作为 `hb_mm_mc_set_callback` 的入参。四个回调按需要实现，不需要的填 `NULL`。

| 回调 | 触发时机 | 说明 |
| --- | --- | --- |
| `on_input_buffer_available` | 有空的输入 buffer 可用 | 在回调里填入待编码/待解码的数据并 queue 回去 |
| `on_output_buffer_available` | 有输出 buffer 可取 | 在回调里消费码流或图像，并 queue 回去；`info` 带回帧类型与时间戳 |
| `on_media_codec_message` | codec 上报消息 | `error` 为错误码，用于异步场景下的异常感知 |
| `on_vlc_buffer_message` | 码流 buffer 大小需要调整 | `vlc_buf` 为建议的 buffer 大小，仅设置了 `hb_mm_mc_set_vlc_buffer_listener` 时触发 |

> 所有回调的 `userdata` 就是 `hb_mm_mc_set_callback` 传入的 `userdata` 指针，可用来回传调用方自己的上下文。

### media_codec_mode_t

| 取值 | 说明 |
| --- | --- |
| `MC_SOFTWARE` | 软件实现 |
| `MC_HARDWARE` | 硬件实现。RDK 上视频编解码走 VPU / JPU，即此项 |

### media_codec_state_t

| 取值 | 说明 |
| --- | --- |
| `MEDIA_CODEC_STATE_NONE` | 无效状态 |
| `MEDIA_CODEC_STATE_UNINITIALIZED` | 未初始化。创建 context 后的初始状态 |
| `MEDIA_CODEC_STATE_INITIALIZED` | 已初始化，尚未下发配置。`hb_mm_mc_configure` 与 `hb_mm_mc_vpf_init` 在此状态下调用 |
| `MEDIA_CODEC_STATE_CONFIGURED` | 配置已生效，可以启动 |
| `MEDIA_CODEC_STATE_STARTED` | 运行中。buffer 的 dequeue / queue 只能在此状态下进行 |
| `MEDIA_CODEC_STATE_PAUSED` | 已暂停 |
| `MEDIA_CODEC_STATE_FLUSHING` | 正在清空 buffer 队列，完成后自动回到 `STARTED` |
| `MEDIA_CODEC_STATE_ERROR` | 出错 |
| `MEDIA_CODEC_STATE_TOTAL` | 状态总数，非有效状态 |

### mc_video_cmd_prio_t

| 取值 | 说明 |
| --- | --- |
| `PRIO_0` … `PRIO_31` | 命令优先级，数值越大优先级越高 |
| `MAX_PRIO_32` | 优先级总数，非有效取值 |

优先级用于多路编解码任务竞争硬件资源时的调度。不显式设置时默认为 `PRIO_0`。

### media_codec_id_t

| 取值 | 说明 |
| --- | --- |
| `MEDIA_CODEC_ID_H264` / `MEDIA_CODEC_ID_H265` / `MEDIA_CODEC_ID_MJPEG` / `MEDIA_CODEC_ID_JPEG` | 视频与图像编解码，走 VPU / JPU 硬件 |
| `MEDIA_CODEC_ID_FLAC` … `MEDIA_CODEC_ID_AAC` 中的 6 种 | 内置软件音频编解码器（FLAC、G.711 A-law / Mu-law、G.726、ADPCM、AAC），直接以 `codec_id` 使用 |
| 其余 `MEDIA_CODEC_ID_*` 取值 | 需先经 `hb_mm_mc_register_audio_encoder` / `hb_mm_mc_register_audio_decoder` 注册外部编解码器 |

<DocScope products="RDK S100">

**S100 上可用的取值只有 4 个**：`MEDIA_CODEC_ID_H264`、`MEDIA_CODEC_ID_H265`、`MEDIA_CODEC_ID_MJPEG`、`MEDIA_CODEC_ID_JPEG`。其余取值 `hb_mm_mc_get_descriptor` 均返回 `NULL`。

</DocScope>

<DocScope products="RDK S600">

**S600 上可用的取值**：`MEDIA_CODEC_ID_H264`、`MEDIA_CODEC_ID_H265`、`MEDIA_CODEC_ID_MJPEG`、`MEDIA_CODEC_ID_JPEG`。另有 8 个 `MEDIA_CODEC_ID_*_HW1` / `_HW2` 变体（H264/H265/MJPEG/JPEG 各两个），用于指定具体的硬件编解码单元，仅在 S600 上可用。

</DocScope>

表中 FLAC 至 AAC 的 6 种为内置软件编解码器，直接使用；其余取值需要先通过 `hb_mm_mc_register_audio_encoder` / `hb_mm_mc_register_audio_decoder` 注册外部编解码器，见[音频编解码器注册](#hb_mm_mc_register_audio_encoder)。

### mc_audio_encode_param_t

音频编码器描述，注册音频编码器时由调用方填充。函数指针由软件编解码库实现，MediaCodec 通过它们调用编解码逻辑。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ff_type` | `media_codec_id_t` | 音频编码标准，取值见 [media_codec_id_t](#media_codec_id_t) |
| `ff_max_frm` | `hb_s32` | 单帧最大采样数 |
| `ff_codec_name[256]` | `char` | 编码器名称字符串 |

### mc_audio_decode_param_t

音频解码器描述，注册音频解码器时由调用方填充。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ff_type` | `media_codec_id_t` | 音频编码标准，取值见 [media_codec_id_t](#media_codec_id_t) |
| `ff_codec_name[256]` | `char` | 解码器名称字符串 |

### mc_av_codec_startup_params_t

启动参数，作为 `hb_mm_mc_start` 的入参。按 `codec_id` 与 `encoder` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `video_enc_startup_params` | `mc_video_enc_startup_params_t` | 联合体成员 |
| `video_dec_startup_params` | `mc_video_dec_startup_params_t` | 联合体成员 |
| `audio_enc_startup_params` | `mc_audio_enc_startup_params_t` | 联合体成员 |
| `audio_dec_startup_params` | `mc_audio_dec_startup_params_t` | 联合体成员 |

### media_codec_buffer_type_t

| 取值 | 说明 |
| --- | --- |
| `MC_VIDEO_FRAME_BUFFER` | 视频帧 buffer。编码时作输入，解码时作输出 |
| `MC_VIDEO_STREAM_BUFFER` | 视频码流 buffer。编码时作输出，解码时作输入 |
| `MC_AUDIO_FRAME_BUFFER` | 音频帧 buffer |
| `MC_AUDIO_STREAM_BUFFER` | 音频码流 buffer |

### media_codec_output_buffer_info_t

输出 buffer 的附加信息，由 `hb_mm_mc_dequeue_output_buffer` 的出参返回，携带帧类型、时间戳、码流帧序等。实际生效的联合体成员由 buffer 类型决定。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `video_frame_info` | `mc_h264_h265_output_frame_info_t` | H.264 / H.265 解码输出帧信息（帧类型、pts 等） |
| `video_stream_info` | `mc_h264_h265_output_stream_info_t` | H.264 / H.265 编码输出码流信息（帧类型、pts、slice 数等） |
| `jpeg_frame_info` | `mc_mjpeg_jpeg_output_frame_info_t` | MJPEG / JPEG 解码输出帧信息 |
| `jpeg_stream_info` | `mc_mjpeg_jpeg_output_stream_info_t` | MJPEG / JPEG 编码输出码流信息 |
| `audio_frame_info` | `mc_audio_output_frame_info_t` | 音频解码输出帧信息 |
| `audio_stream_info` | `mc_audio_output_stream_info_t` | 音频编码输出码流信息 |

## 返回值说明

所有接口成功时返回 `0`，失败时返回**负值错误码**。错误码高位固定为 `0xF`，例如 `HB_MEDIA_ERR_INVALID_PARAMS` 十进制为 `-268435447`，十六进制即 `0xF0000009`。定义在板端 `/usr/hobot/include/hb_media_error.h`。

| 十六进制 | 宏定义 | 说明 | 常见原因与处置 |
| --- | --- | --- | --- |
| `0xF0000001` | `HB_MEDIA_ERR_UNKNOWN` | 未知错误 | — |
| `0xF0000002` | `HB_MEDIA_ERR_CODEC_NOT_FOUND` | 找不到对应的 codec | — |
| `0xF0000003` | `HB_MEDIA_ERR_CODEC_OPEN_FAIL` | 无法打开 codec 设备 | — |
| `0xF0000004` | `HB_MEDIA_ERR_CODEC_RESPONSE_TIMEOUT` | codec 响应超时 | — |
| `0xF0000005` | `HB_MEDIA_ERR_CODEC_INIT_FAIL` | codec 初始化失败 | — |
| `0xF0000006` | `HB_MEDIA_ERR_OPERATION_NOT_ALLOWED` | 当前状态不允许该操作 | 当前状态不允许该操作。检查调用顺序，尤其是 `hb_mm_mc_vpf_init` 与各 `set_*` 的位置 |
| `0xF0000007` | `HB_MEDIA_ERR_INSUFFICIENT_RES` | 内部内存资源不足 | 内存资源不足。通常是 buffer 数量或大小配置过大 |
| `0xF0000008` | `HB_MEDIA_ERR_NO_FREE_INSTANCE` | 没有可用的实例 | 实例耗尽。每路编解码占一个实例，VPU 上限 32、JPU 上限 64；检查是否有实例未 `release` |
| `0xF0000009` | `HB_MEDIA_ERR_INVALID_PARAMS` | 无效的参数 | 参数非法。常见于分辨率未按 32×8 对齐、`bitstream_buf_size` 过小、ROI 表长度与分辨率不匹配 |
| `0xF000000A` | `HB_MEDIA_ERR_INVALID_INSTANCE` | 无效的实例 | — |
| `0xF000000B` | `HB_MEDIA_ERR_INVALID_BUFFER` | 无效的 buffer | buffer 非法。常见于把未 dequeue 的 buffer 直接 queue，或 buffer 已被释放 |
| `0xF000000C` | `HB_MEDIA_ERR_INVALID_COMMAND` | 无效的指令 | — |
| `0xF000000D` | `HB_MEDIA_ERR_WAIT_TIMEOUT` | 等待超时 | dequeue 超时。见下节 |
| `0xF000000E` | `HB_MEDIA_ERR_FILE_OPERATION_FAILURE` | 文件操作失败 | — |
| `0xF000000F` | `HB_MEDIA_ERR_PARAMS_SET_FAILURE` | 参数设置失败 | — |
| `0xF0000010` | `HB_MEDIA_ERR_PARAMS_GET_FAILURE` | 参数获取失败 | — |
| `0xF0000011` | `HB_MEDIA_ERR_CODING_FAILED` | 编解码失败 | — |
| `0xF0000012` | `HB_MEDIA_ERR_OUTPUT_BUF_FULL` | 输出 buffer 满 | 输出 buffer 满。调用方未及时取走输出，检查 queue / dequeue 是否配对 |
| `0xF0000013` | `HB_MEDIA_ERR_UNSUPPORTED_FEATURE` | 不支持的功能 | 该 codec 不支持此功能。对照[codec 适用性](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#codec-适用性) |
| `0xF0000014` | `HB_MEDIA_ERR_INVALID_PRIORITY` | 不支持的优先级 | — |
