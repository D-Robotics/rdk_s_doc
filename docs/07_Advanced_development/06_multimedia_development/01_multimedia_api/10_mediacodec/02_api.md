---
sidebar_position: 2
title: "MediaCodec API 参考"
description: "RDK S100/S600 MediaCodec 70 个接口说明、数据结构与返回值"
toc_max_heading_level: 4
---

import DocScope from '@site/src/components/DocScope';

# MediaCodec API 参考

本篇逐条说明 70 个接口、数据结构与返回值约定；硬件规格与使用方法见 [MediaCodec 使用指南](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage)。

## API 参考

MediaCodec 共 70 个接口。多数配置类是**成对**出现的 `get_*` / `set_*`：`set_*` 下发参数，`get_*` 读回当前值。

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

## 接口说明
下文 70 个接口共用以下约定，各小节不再重复。

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

**【示例代码】**

```c
const media_codec_descriptor_t *desc = hb_mm_mc_get_descriptor(MEDIA_CODEC_ID_H264);  /* NULL = 不可用 */
```

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

**【示例代码】**

```c
media_codec_context_t context = {0};
hb_mm_mc_get_default_context(MEDIA_CODEC_ID_H264, 1, &context);  /* 1 = 编码器 */
```

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

**【示例代码】**

```c
hb_mm_mc_initialize(&context);
```

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

**【示例代码】**

```c
hb_mm_mc_configure(&context);
```

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

**【示例代码】**

```c
mc_av_codec_startup_params_t startup_params = {0};
hb_mm_mc_start(&context, &startup_params);
```

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

**【示例代码】**

```c
hb_mm_mc_stop(&context);
```

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

**【示例代码】**

```c
hb_mm_mc_pause(&context);
```

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

**【示例代码】**

```c
hb_mm_mc_flush(&context);
```

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

**【示例代码】**

```c
hb_mm_mc_release(&context);
```

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

**【示例代码】**

```c
media_codec_state_t state;
hb_mm_mc_get_state(&context, &state);
```

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

#### hb_mm_mc_get_status

**【函数原型】**

```c
hb_s32 hb_mm_mc_get_status(media_codec_context_t *context, mc_inter_status_t *status);
```

**【功能描述】**

查询 codec 的详细运行状态信息（帧计数、buffer 占用等），取值见 [mc_inter_status_t](#mc_inter_status_t)。

**【参数】**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `context` | `media_codec_context_t *` | codec 上下文 |
| `status` | `mc_inter_status_t *` | **出参**。codec 详细状态，见 [mc_inter_status_t](#mc_inter_status_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【示例代码】**

```c
mc_inter_status_t status;
hb_mm_mc_get_status(&context, &status);
```

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

**【示例代码】**

```c
media_codec_callback_t callback = {0};
hb_ptr userdata = 0;
hb_mm_mc_set_callback(&context, &callback, userdata);  /* 之后进入异步模式 */
```

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

**【示例代码】**

```c
media_codec_buffer_t in_buf = {0};
hb_mm_mc_dequeue_input_buffer(&context, &in_buf, 2000);  /* 超时 2000 ms */
```

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

**【示例代码】**

```c
/* in_buf 为 dequeue_input_buffer 取出的描述符，填好数据后归还 */
hb_mm_mc_queue_input_buffer(&context, &in_buf, 2000);
```

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

**【示例代码】**

```c
media_codec_buffer_t out_buf = {0};
media_codec_output_buffer_info_t out_info = {0};
hb_mm_mc_dequeue_output_buffer(&context, &out_buf, &out_info, 2000);
```

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

**【示例代码】**

```c
/* out_buf 为 dequeue_output_buffer 取出的描述符，消费完归还 */
hb_mm_mc_queue_output_buffer(&context, &out_buf, 0);
```

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
| `params` | `mc_video_longterm_ref_mode_t *` | **出参**。长期参考帧参数，见 [mc_video_longterm_ref_mode_t](#mc_video_longterm_ref_mode_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_longterm_ref_mode_t *` | 长期参考帧参数，见 [mc_video_longterm_ref_mode_t](#mc_video_longterm_ref_mode_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- 支持运行中**动态调整**。

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
| `params` | `mc_video_intra_refresh_params_t *` | **出参**。Intra Refresh 参数，见 [mc_video_intra_refresh_params_t](#mc_video_intra_refresh_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_intra_refresh_params_t *` | Intra Refresh 参数，见 [mc_video_intra_refresh_params_t](#mc_video_intra_refresh_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_deblk_filter_params_t *` | **出参**。去块滤波参数，见 [mc_video_deblk_filter_params_t](#mc_video_deblk_filter_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_deblk_filter_params_t *` | 去块滤波参数，见 [mc_video_deblk_filter_params_t](#mc_video_deblk_filter_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_h265_sao_params_t *` | **出参**。SAO 参数，见 [mc_h265_sao_params_t](#mc_h265_sao_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_h265_sao_params_t *` | SAO 参数，见 [mc_h265_sao_params_t](#mc_h265_sao_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_h264_entropy_params_t *` | **出参**。熵编码参数，见 [mc_h264_entropy_params_t](#mc_h264_entropy_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_h264_entropy_params_t *` | 熵编码参数，见 [mc_h264_entropy_params_t](#mc_h264_entropy_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_pred_unit_params_t *` | **出参**。帧内预测参数，见 [mc_video_pred_unit_params_t](#mc_video_pred_unit_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_pred_unit_params_t *` | 帧内预测参数，见 [mc_video_pred_unit_params_t](#mc_video_pred_unit_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_transform_params_t *` | **出参**。变换参数，见 [mc_video_transform_params_t](#mc_video_transform_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_transform_params_t *` | 变换参数，见 [mc_video_transform_params_t](#mc_video_transform_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_mode_decision_params_t *` | **出参**。模式决策参数，见 [mc_video_mode_decision_params_t](#mc_video_mode_decision_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_mode_decision_params_t *` | 模式决策参数，见 [mc_video_mode_decision_params_t](#mc_video_mode_decision_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_smart_bg_enc_params_t *` | **出参**。智能背景编码参数，见 [mc_video_smart_bg_enc_params_t](#mc_video_smart_bg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_smart_bg_enc_params_t *` | 智能背景编码参数，见 [mc_video_smart_bg_enc_params_t](#mc_video_smart_bg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_3dnr_enc_params_t *` | **出参**。3D 降噪参数，见 [mc_video_3dnr_enc_params_t](#mc_video_3dnr_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_3dnr_enc_params_t *` | 智能背景编码参数，见 [mc_video_smart_bg_enc_params_t](#mc_video_smart_bg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_roi_params_t *` | **出参**。ROI 参数，见 [mc_video_roi_params_t](#mc_video_roi_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_roi_params_t *` | ROI 参数，见 [mc_video_roi_params_t](#mc_video_roi_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

- H.264 的块大小为 16×16 像素，H.265 为 32×32 像素，每个 QP 值占 1 字节、取值 `[0, 51]`。

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
| `params` | `mc_video_roi_params_ex_t *` | **出参**。ROI 参数，见 [mc_video_roi_params_ex_t](#mc_video_roi_params_ex_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_roi_params_ex_t *` | ROI 参数，见 [mc_video_roi_params_ex_t](#mc_video_roi_params_ex_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_vui_params_t *` | **出参**。VUI 参数，见 [mc_video_vui_params_t](#mc_video_vui_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_vui_params_t *` | VUI 参数，见 [mc_video_vui_params_t](#mc_video_vui_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_vui_timing_params_t *` | **出参**。VUI 时序参数，见 [mc_video_vui_timing_params_t](#mc_video_vui_timing_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_vui_timing_params_t *` | VUI 时序参数，见 [mc_video_vui_timing_params_t](#mc_video_vui_timing_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_slice_params_t *` | **出参**。slice 参数，见 [mc_video_slice_params_t](#mc_video_slice_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_video_slice_params_t *` | slice 参数，见 [mc_video_slice_params_t](#mc_video_slice_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_user_data_buffer_t *` | **出参**。用户数据，见 [mc_user_data_buffer_t](#mc_user_data_buffer_t) |
| `timeout` | `hb_s32` | 超时时间，单位 ms |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_user_data_buffer_t *` | **出参**。用户数据，见 [mc_user_data_buffer_t](#mc_user_data_buffer_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_mjpeg_enc_params_t *` | **出参**。MJPEG 编码参数，见 [mc_mjpeg_enc_params_t](#mc_mjpeg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_mjpeg_enc_params_t *` | MJPEG 编码参数，见 [mc_mjpeg_enc_params_t](#mc_mjpeg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_jpeg_enc_params_t *` | **出参**。JPEG 编码参数，见 [mc_jpeg_enc_params_t](#mc_jpeg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

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
| `params` | `mc_jpeg_enc_params_t *` | JPEG 编码参数，见 [mc_jpeg_enc_params_t](#mc_jpeg_enc_params_t) |

**【返回值】**

成功返回 `0`；失败返回负值错误码，见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【示例代码】**

完整可运行版本见[最小编码示例](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#最小编码示例)与板端 `/app/multimedia_samples/sample_codec/`。

## 数据结构

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

### 核心数据结构

#### media_codec_context_t

| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `codec_id` | `media_codec_id_t` | 编解码标准，**初始化后不可改** | `MEDIA_CODEC_ID_H264` | — | 见 [media_codec_id_t](#media_codec_id_t) |
| `encoder` | `hb_bool` | `1` = 编码器，`0` = 解码器，**初始化后不可改** | `1` | — | `0` / `1` |
| `instance_index` | `hb_s32` | 内部私有，不要修改 | — | — | — |
| `video_enc_params` | `mc_video_codec_enc_params_t` | 视频编码参数，`encoder = 1` 时生效 | — | — | — |
| `video_dec_params` | `mc_video_codec_dec_params_t` | 视频解码参数，`encoder = 0` 时生效 | — | — | ↑ |
| `vpf_context` | `hb_ptr` | 内部私有，不要修改 | — | — | — |
| `priority` | `mc_video_cmd_prio_t` | 多路任务竞争硬件时的命令优先级 | — | `0`（`PRIO_0`） | 见 [mc_video_cmd_prio_t](#mc_video_cmd_prio_t) |

#### mc_video_codec_enc_params_t

| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `width` / `height` | `hb_s32` | 输入图像宽高（亮度像素数） | `1920` × `1080` | — | 对齐宽 32 / 高 8，上限见[硬件规格](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#硬件规格) |
| `pix_fmt` | `mc_pixel_format_t` | 输入像素格式 | `MC_PIXEL_FORMAT_NV12` | — | 见 [mc_pixel_format_t](#mc_pixel_format_t) |
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

#### mc_video_codec_dec_params_t

| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `feed_mode` | `mc_av_stream_feeding_mode_t` | 码流送入方式，**必设** | — | — | 见 [mc_av_stream_feeding_mode_t](#mc_av_stream_feeding_mode_t) |
| `pix_fmt` | `mc_pixel_format_t` | 输出像素格式 | `MC_PIXEL_FORMAT_NV12` | — | 见 [mc_pixel_format_t](#mc_pixel_format_t) |
| `bitstream_buf_size` | `hb_u32` | 输入码流 buffer 大小 | — | — | — |
| `bitstream_buf_count` | `hb_u32` | 输入码流 buffer 数量 | — | — | — |
| `external_bitstream_buf` | `hb_bool` | `1` = 码流 buffer 复用外部 hbmem 内存 | `0` | `0` | `0` / `1` |
| `frame_buf_count` | `hb_u32` | 输出帧 buffer 数量 | — | — | — |
| `h264_dec_config` | `mc_h264_dec_config_t` | H.264 专有配置 | — | — | 联合体按 `codec_id` 四选一 |
| `h265_dec_config` | `mc_h265_dec_config_t` | H.265 专有配置 | — | — | ↑ |
| `mjpeg_dec_config` | `mc_mjpeg_dec_config_t` | MJPEG 专有配置 | — | — | ↑ |
| `jpeg_dec_config` | `mc_jpeg_dec_config_t` | JPEG 专有配置 | — | — | ↑ |

#### mc_av_codec_startup_params_t

启动参数，作为 `hb_mm_mc_start` 的入参。按 `codec_id` 与 `encoder` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `video_enc_startup_params` | `mc_video_enc_startup_params_t` | 联合体成员 |
| `video_dec_startup_params` | `mc_video_dec_startup_params_t` | 联合体成员 |

#### media_codec_buffer_t

| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `type` | `media_codec_buffer_type_t` | 决定联合体哪个成员生效 | — | — | 见 [media_codec_buffer_type_t](#media_codec_buffer_type_t) |
| `vframe_buf` | `mc_video_frame_buffer_info_t` | 图像帧：编码的输入、解码的输出 | — | — | — |
| `vstream_buf` | `mc_video_stream_buffer_info_t` | 码流：编码的输出、解码的输入 | — | — | ↑ |

#### mc_inter_status_t

`hb_mm_mc_get_status` 的出参，用于观察队列水位、排查堆积与超时。字段与[多媒体调试指南](/Advanced_development/multimedia_development/multimedia_api/debug_guide/mediacodec_debug_guide)中 `encode status` 分组对应。

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

#### mc_video_frame_buffer_info_t

图像帧描述——编码的输入、解码的输出，`media_codec_buffer_t` 联合体成员之一。

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `vir_ptr[3]` | `hb_u8 *[3]` | 各分量平面的虚拟地址。NV12 用 `[0]` = Y、`[1]` = UV |
| `phy_ptr[3]` | `hb_u64[3]` | 各分量平面的物理地址 |
| `size` | `hb_u32` | 帧数据字节数 |
| `compSize[3]` | `hb_u32[3]` | 各分量平面的字节数 |
| `width` / `height` | `hb_s32` | 帧宽高 |
| `pix_fmt` | `mc_pixel_format_t` | 像素格式 |
| `stride` / `vstride` | `hb_s32` | 行跨度 / 垂直跨度 |
| `fd[3]` | `hb_s32[3]` | 各分量平面的 dma-buf fd |
| `pts` | `hb_u64` | 时间戳 |
| `src_idx` | `hb_s32` | 源 buffer 索引，`hb_mm_mc_skip_pic` 使用 |
| `frame_end` | `hb_bool` | 是否为本批送帧的最后一帧 |
| `qp_map_valid` | `hb_bool` | 本次是否携带 QP 映射表 |
| `qp_map_array` | `hb_byte` | QP 映射表地址（头文件声明为标量，按指针语义使用，见 [返回值说明](#返回值说明)） |
| `qp_map_array_count` | `hb_u32` | QP 映射表条目数 |
| `flags` | `hb_s32` | 标志位 |

#### mc_video_stream_buffer_info_t

码流描述——编码的输出、解码的输入。

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `vir_ptr` | `hb_u8 *` | 码流的虚拟地址 |
| `phy_ptr` | `hb_u64` | 码流的物理地址 |
| `size` | `hb_u32` | 码流字节数 |
| `pts` | `hb_u64` | 时间戳 |
| `fd` | `hb_s32` | dma-buf fd |
| `src_idx` | `hb_s32` | 源 buffer 索引 |
| `stream_end` | `hb_bool` | 是否为码流结尾，最后一包置 `1` |

#### media_codec_callback_t

异步模式的回调集合，作为 `hb_mm_mc_set_callback` 的入参。四个回调按需要实现，不需要的填 `NULL`。

| 回调 | 触发时机 | 说明 |
| --- | --- | --- |
| `on_input_buffer_available` | 有空的输入 buffer 可用 | 在回调里填入待编码/待解码的数据并 queue 回去 |
| `on_output_buffer_available` | 有输出 buffer 可取 | 在回调里消费码流或图像，并 queue 回去；`info` 带回帧类型与时间戳 |
| `on_media_codec_message` | codec 上报消息 | `error` 为错误码，用于异步场景下的异常感知 |
| `on_vlc_buffer_message` | 码流 buffer 大小需要调整 | `vlc_buf` 为建议的 buffer 大小，仅设置了 `hb_mm_mc_set_vlc_buffer_listener` 时触发 |

> 所有回调的 `userdata` 就是 `hb_mm_mc_set_callback` 传入的 `userdata` 指针，可用来回传调用方自己的上下文。

#### media_codec_output_buffer_info_t

输出 buffer 的附加信息，由 `hb_mm_mc_dequeue_output_buffer` 的出参返回，携带帧类型、时间戳、码流帧序等。实际生效的联合体成员由 buffer 类型决定。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `video_frame_info` | `mc_h264_h265_output_frame_info_t` | H.264 / H.265 解码输出帧信息（帧类型、pts 等） |
| `video_stream_info` | `mc_h264_h265_output_stream_info_t` | H.264 / H.265 编码输出码流信息（帧类型、pts、slice 数等） |
| `jpeg_frame_info` | `mc_mjpeg_jpeg_output_frame_info_t` | MJPEG / JPEG 解码输出帧信息 |
| `jpeg_stream_info` | `mc_mjpeg_jpeg_output_stream_info_t` | MJPEG / JPEG 编码输出码流信息 |

### 码率控制

由 `mc_rate_control_params_t` 承载：`mode` 选模式，参数填进对应模式的联合体成员。模式的选择依据见[使用指南](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#码率控制)。

#### mc_rate_control_params_t

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `mode` | `mc_video_rate_control_mode_t` | 码率控制模式（`MC_AV_RC_MODE_H264CBR` 等，编码方向） |
| `h264_cbr_params` / `h265_cbr_params` / `h264_avbr_params` / `h265_avbr_params` | 各模式结构体 | 联合体，按 `mode` 生效 |
| `h264_vbr_params` / `h265_vbr_params` | | ↑ |
| `h264_fixqp_params` / `h265_fixqp_params` / `mjpeg_fixqp_params` | | ↑ |
| `h264_qpmap_params` / `h265_qpmap_params` | | ↑ |

#### mc_h264_cbr_params_t / mc_h265_cbr_params_t（CBR）与 mc_h264_avbr_params_t / mc_h265_avbr_params_t（AVBR）

CBR 与 AVBR 参数集相同，仅 `vbv_buffer_size` 默认值不同（CBR 为 10，AVBR 为 3000）。填进 `video_enc_params.rc_params.h264_cbr_params` 或对应成员：

| 参数 | 含义 | 取值 | 默认 |
| --- | --- | --- | --- |
| `intra_period` | I 帧间隔 | `[0,2047]` | 28 |
| `intra_qp` | I 帧的 QP | `[0,51]` | 30 |
| `bit_rate` | 目标平均码率，单位 kbps | `[0,700000]` | 1000 |
| `frame_rate` | 目标帧率，单位 fps | `[1,240]` | 30 |
| `initial_rc_qp` | 初始 QP；超出 `[0,51]` 时由编码器自定 | `[0,63]` | 63 |
| `vbv_buffer_size` | VBV 缓冲大小，单位 ms。**越小码率越精确、画质越差；越大反之** | `[10,3000]` | CBR 10 / AVBR 3000 |
| `mb_level_rc_enalbe` / `ctu_level_rc_enalbe` | 码控精细到块级（H264 结构体为 `mb_level_rc_enalbe`，H265 为 `ctu_level_rc_enalbe`，头文件原拼写如此），画质换精度；**与 ROI 互斥** | `0` / `1` | 0 |
| `min_qp_I` · `max_qp_I` | I 帧 QP 的上下限 | `[0,51]` | 8 / 51 |
| `min_qp_P` · `max_qp_P` | P 帧 QP 的上下限 | `[0,51]` | 8 / 51 |
| `min_qp_B` · `max_qp_B` | B 帧 QP 的上下限 | `[0,51]` | 8 / 51 |
| `hvs_qp_enable` | 按块方差微调 QP，提升主观画质 | `0` / `1` | 1 |
| `hvs_qp_scale` | 上述微调的强度，1 代表原值 | `[0,4]` | 2 |
| `max_delta_qp` | 上述微调的幅度上限 | `[0,12]` | 10 |
| `qp_map_enable` | 是否启用 QP 映射表 | `0` / `1` | 0 |

#### mc_h264_vbr_params_t / mc_h265_vbr_params_t

比 CBR 少得多——没有码率目标，也没有 QP 上下限：

| 参数 | 含义 | 取值 | 默认 |
| --- | --- | --- | --- |
| `intra_period` | I 帧间隔 | `[0,2047]` | 28 |
| `intra_qp` | I 帧的 QP | `[0,51]` | 30 |
| `frame_rate` | 目标帧率，单位 fps | `[1,240]` | 30 |
| `qp_map_enable` | 是否启用 QP 映射表 | `0` / `1` | 0 |

#### mc_h264_fix_qp_params_t / mc_h265_fix_qp_params_t / mc_mjpeg_fix_qp_params_t

直接指定每类帧的 QP。MJPEG 不用 QP 值，改用 `quality_factor`（质量因子，取值 `[0,100]`、默认 `50`）：

| 参数 | 含义 | 取值 | 默认 |
| --- | --- | --- | --- |
| `intra_period` | I 帧间隔 | `[0,2047]` | 28 |
| `frame_rate` | 目标帧率，单位 fps | `[1,240]` | 30 |
| `force_qp_I` | 强制 I 帧的 QP | `[0,51]` | 0 |
| `force_qp_P` | 强制 P 帧的 QP | `[0,51]` | 0 |
| `force_qp_B` | 强制 B 帧的 QP | `[0,51]` | 0 |
| `quality_factor` | MJPEG / JPEG 的质量因子（仅 `mjpeg_fixqp_params`，不用 QP 值） | `[0,100]` | `50` |

#### mc_h264_qp_map_params_t / mc_h265_qp_map_params_t

为帧内每个块单独指定 QP——H264 的块大小为 16 × 16，H265 为 32 × 32。QP 映射表也可随输入帧携带（`qp_map_valid` / `qp_map_array`，见 [mc_video_frame_buffer_info_t](#mc_video_frame_buffer_info_t)），并与 [ROI](#mc_video_roi_params_t) 的 mode2 配合使用：

| 参数 | 含义 | 取值 | 默认 |
| --- | --- | --- | --- |
| `intra_period` | I 帧间隔 | `[0,2047]` | 28 |
| `frame_rate` | 目标帧率，单位 fps | `[1,240]` | 30 |
| `qp_map_array` | QP 映射表地址，每个块一个 QP 值（1 字节），按光栅扫描顺序排列 | 指针 | `NULL` |
| `qp_map_array_count` | QP 映射表的条目数 | H.264 ≤ `MC_VIDEO_MAX_MB_NUM`、H.265 ≤ `MC_VIDEO_MAX_SUB_CTU_NUM`；条目数 H.264 为 `(ALIGN16(宽)>>4) × (ALIGN16(高)>>4)`，H.265 为 `(ALIGN64(宽)>>5) × (ALIGN64(高)>>5)`，完整说明见 [ROI 编码参数](#roi-编码参数) | 0 |

> 上表默认值为 `hb_mm_mc_get_default_context` 的返回结果（CBR / AVBR）；VBR / FixQP / QpMap 三表的默认值取自权威调试手册。

### GOP 与参考帧

#### mc_video_gop_params_t

GOP 结构参数。除 `custom_gop_pic_param` 外**在同一段码流内不可更改**。仅 H.264 / H.265 有效。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `decoding_refresh_type` | `hb_s32` | 默认 `IDR` | 每 `intra_period` 插入的 I 帧类型：`0` 普通 I 帧（非随机接入点）、`1` CRA、`2` IDR。仅 H.265 有效 |
| `gop_preset_idx` | `hb_u32` | 默认 `2` | GOP 预设结构编号，取值 `[0,9]`，含义见 [GOP 预置结构](/Advanced_development/multimedia_development/multimedia_api/mediacodec/usage#gop-预置结构)。该默认值两个平台一致 |
| `custom_gop_size` | `hb_u32` | — | 自定义 GOP 的长度，取值 `[1,8]`。仅 `gop_preset_idx = 0` 时有效 |
| `custom_gop_pic_param[MC_MAX_GOP_NUM]` | `mc_video_custom_gop_pic_params_t[]` | — | 自定义 GOP 中逐帧的参数，见 [mc_video_custom_gop_pic_params_t](#mc_video_custom_gop_pic_params_t) |

#### mc_video_custom_gop_pic_params_t

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

#### mc_video_longterm_ref_mode_t

长期参考帧参数。用于指定某个已编码帧长期留在参考帧列表中，抑制帧间预测的累积误差。**支持运行中动态调整**。仅 H.264 / H.265 codec 有效。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `use_longterm` | `hb_u32` | 默认 `0` | 是否使能长期参考帧模式，`0` 关闭 / `1` 开启 |
| `longterm_pic_period` | `hb_u32` | 默认 `0` | 每隔多少帧指定一个长期参考帧 |
| `longterm_pic_using_period` | `hb_u32` | 默认 `0` | 长期参考帧被持续使用多少帧 |

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


### Intra Refresh

#### mc_video_intra_refresh_params_t

Intra Refresh 参数。**在同一段码流内不可更改**。仅 H.264 / H.265 有效。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `intra_refresh_mode` | `hb_s32` | 默认 `0` | 刷新方式：`0` 关闭；`1` 按行；`2` 按列；`3` 按步长；`4` 自适应（仅 H.265） |
| `intra_refresh_arg` | `hb_u32` | `[0, 2^31-1]`，默认 `0` | 刷新参数，含义随 `intra_refresh_mode` 变化：模式 1 为连续行数、模式 2 为连续列数、模式 3 为步长、模式 4 为每帧刷新块数 |

> **注意**：`intra_refresh_mode = 4`（自适应）不能与无损编码和 ROI 同时使用。

### ROI 编码参数

ROI 与码率控制同时使能时，块的实际 QP 合成关系：

| 码控模式 | 块的实际 QP |
| --- | --- |
| 未使能 CBR / AVBR | 就是 ROI 表里指定的值 |
| 使能 CBR / AVBR | `QP(i) = MQP(i) + RQP(i) - ROIAvgQP`，其中 `MQP` 为 ROI 表的值，`RQP` 为码控内部算出的值，`ROIAvgQP` 为 ROI 表的平均 QP |

#### mc_video_roi_params_t

ROI 的 QpMap 形式参数：为图像中每一个块逐个指定 QP 值。更适合由算法逐块生成 QP 的场景。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `roi_enable` | `hb_u32` | 默认 `0` | 是否使能 ROI 编码，`0` 关闭 / `1` 开启。**需要码率控制处于开启状态** |
| `roi_map_array` | `hb_byte` | 默认 `0` | QP 映射表，按光栅扫描顺序为每个块存放 1 字节 QP 值，取值 `[0,51]` |
| `roi_map_array_count` | `hb_u32` | 默认 `0` | 映射表的元素个数。H.264 应为 `(ALIGN16(宽)>>4) × (ALIGN16(高)>>4)`；H.265 应为 `(ALIGN64(宽)>>5) × (ALIGN64(高)>>5)` |

#### mc_video_roi_params_ex_t

ROI 的区域形式参数：最多支持 64 个矩形区域，每个区域指定重要程度或 QP。适合只关注少数几块重点区域的场景。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `roi_mode` | `hb_u32` | 默认 `0` | ROI 模式：`0` 关闭；`1` CTU 重要程度映射（取值 `[0,8]`，**需要码率控制开启**）；`2` CTU QP 映射（取值 `[0,51]`，**不能与码率控制同时使用**） |
| `roi_idx` | `hb_u32` | 默认 `0` | ROI 区域索引，取值 `[0,63]`。索引 0 的区域优先级最高 |
| `roi_enable` | `hb_u32` | 默认 `0` | 该区域是否使能，`0` 关闭 / `1` 开启 |
| `roi_val` | `hb_u8` | 默认 `0` | 该区域的值。模式 1 下为重要程度 `[0,8]`（越大越重要）；模式 2 下为 QP `[0,51]`（越大画质越差） |
| `roi_delta_qp` | `hb_u32` | 默认 `3` | 模式 1 下的 QP 调整步长，取值 `[0,51]`。区域最终 QP 按 `QP - roi_delta_qp × 重要程度` 计算 |
| `crop_rect` | `mc_av_codec_rect_t` | — | 该区域对应的矩形范围，见 [mc_av_codec_rect_t](#mc_av_codec_rect_t) |

#### mc_av_codec_rect_t

矩形区域，用于描述裁剪范围或 ROI 区域。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `x_pos` | `hb_u32` | 左上角横坐标 |
| `y_pos` | `hb_u32` | 左上角纵坐标 |
| `width` | `hb_u32` | 宽度 |
| `height` | `hb_u32` | 高度 |

### 编码质量工具

#### mc_video_deblk_filter_params_t

去块滤波参数。按 `codec_id` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_deblk` | `mc_h264_deblk_filter_params_t` | 联合体成员 |
| `h265_deblk` | `mc_h265_deblk_filter_params_t` | 联合体成员 |

#### mc_h265_sao_params_t

H.265 的 SAO（样点自适应补偿）参数。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `sample_adaptive_offset_enabled_flag` | `hb_u32` | 默认 `1` | 是否使能 SAO，`0` 关闭 / `1` 开启。同时作用于亮度与色度分量 |

#### mc_h264_entropy_params_t

H.264 的熵编码参数。支持运行中动态调整。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `entropy_coding_mode` | `hb_u32` | 默认 `1` | 熵编码方式：`0` CAVLC；`1` CABAC（压缩率更高、计算量更大） |

#### mc_video_pred_unit_params_t

帧内预测参数。按 `codec_id` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_intra_pred` | `mc_h264_intra_pred_params_t` | 联合体成员 |
| `h265_pred_unit` | `mc_h265_pred_unit_params_t` | 联合体成员 |

#### mc_video_transform_params_t

变换参数。按 `codec_id` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_transform` | `mc_h264_transform_params_t` | 联合体成员 |
| `h265_transform` | `mc_h265_transform_params_t` | 联合体成员 |

#### mc_video_mode_decision_params_t

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

#### mc_video_smart_bg_enc_params_t

智能背景编码参数。针对监控等背景长期不变的场景，降低静止区域的码率开销。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `bg_detect_enable` | `hb_u32` | 默认 `0` | 是否使能背景检测，`0` 关闭 / `1` 开启 |
| `bg_threshold_diff` | `hb_s32` | 默认 `8` | 块内最大差异阈值，取值 `[0,255]`。仅背景检测开启时有效 |
| `bg_threshold_mean_diff` | `hb_s32` | 默认 `1` | 块内平均差异阈值，取值 `[0,255]`。仅背景检测开启时有效 |
| `bg_lambda_qp` | `hb_s32` | 默认 `32` | 背景区域的最小 QP，取值 `[0,51]` |
| `bg_delta_qp` | `hb_s32` | 默认 `3` | 背景与前景的 QP 差值，取值 `[-16,15]` |
| `s2fme_disable` | `hb_u32` | 默认 `0` | 是否关闭 s2me_fme 流程，`0` 使能 / `1` 关闭。仅作用于 H.264 编码器 |

#### mc_video_3dnr_enc_params_t

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

### 码流与元信息

#### mc_video_slice_params_t

slice 切分参数。按 `codec_id` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_slice` | `mc_h264_slice_params_t` | 联合体成员 |
| `h265_slice` | `mc_h265_slice_params_t` | 联合体成员 |
| `mjpeg_slice` | `mc_mjpeg_slice_params_t` | 联合体成员 |

#### mc_video_vui_params_t

VUI 参数。按 `codec_id` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_vui` | `mc_h264_vui_params_t` | 联合体成员 |
| `h265_vui` | `mc_h265_vui_params_t` | 联合体成员 |

#### mc_video_vui_timing_params_t

VUI 时序参数。按 `codec_id` 选择联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_timing` | `mc_h264_timing_params_t` | 联合体成员 |
| `h265_timing` | `mc_h265_timing_params_t` | 联合体成员 |

#### mc_user_data_buffer_t

用户数据 buffer，用于 `hb_mm_mc_get_user_data` 取出码流中携带的用户数据。

| 字段 | 类型 | 取值 / 默认值 | 说明 |
| --- | --- | --- | --- |
| `user_data_valid` | `hb_bool` | 默认 `0` | 该 buffer 是否有效，`0` 无效 / `1` 有效 |
| `size` | `hb_u32` | 默认 `0` | 数据长度，单位字节 |
| `phys_addr` | `hb_u64` | 默认 `0` | 数据的物理地址，读取时需转换为虚拟地址 |
| `virt_addr` | `hb_u8` | 默认 `0` |  |

### 图像与格式

#### mc_mjpeg_enc_params_t

MJPEG 编码参数，经 `hb_mm_mc_set_mjpeg_config` 下发。在同一段码流内不可更改。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `restart_interval` | `hb_u32` | 重启间隔，每多少个 MCU 插入一个重启标记，`0` 表示不插入。默认 `0` |
| `huff_table_valid` | `hb_bool` | 自定义哈夫曼表是否有效，`0` 无效（用默认表）/ `1` 有效。默认 `0` |
| `huff_luma_dc_bits[16]` / `huff_luma_dc_val[16]` | `hb_u8[16]` | 亮度 DC 哈夫曼表：16 个位长值 + 12（Baseline）/ 13（Extended）个哈夫曼值 |
| `huff_luma_ac_bits[16]` / `huff_luma_ac_val[256]` | `hb_u8[]` | 亮度 AC 哈夫曼表：16 个位长值 + 162（Baseline）/ 256（Extended）个哈夫曼值 |
| `huff_chroma_dc_bits[16]` / `huff_chroma_dc_val[16]` | `hb_u8[16]` | 色度 DC 哈夫曼表，结构同亮度 DC |
| `huff_chroma_ac_bits[16]` / `huff_chroma_ac_val[256]` | `hb_u8[]` | 色度 AC 哈夫曼表，结构同亮度 AC |
| `extended_sequential` | `hb_bool` | 是否启用 Extended Sequential 模式 |

#### mc_jpeg_enc_params_t

JPEG 编码参数，经 `hb_mm_mc_set_jpeg_config` 下发。哈夫曼表结构与 MJPEG 相同。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `dcf_enable` | `hb_bool` | 是否生成 DCF（数码相机格式）头，用于 Exif |
| `restart_interval` | `hb_u32` | 重启间隔，每多少个 MCU 插入一个重启标记 |
| `quality_factor` | `hb_u32` | 画质因子，取值 `[0,100]`、默认 `50`，数值越大画质越高、码流越大 |
| `huff_table_valid` | `hb_bool` | 自定义哈夫曼表是否有效 |
| `huff_luma_dc_bits[16]` / `huff_luma_dc_val[16]` | `hb_u8[16]` | 亮度 DC 哈夫曼表 |
| `huff_luma_ac_bits[16]` / `huff_luma_ac_val[256]` | `hb_u8[]` | 亮度 AC 哈夫曼表 |
| `huff_chroma_dc_bits[16]` / `huff_chroma_dc_val[16]` | `hb_u8[16]` | 色度 DC 哈夫曼表 |
| `huff_chroma_ac_bits[16]` / `huff_chroma_ac_val[256]` | `hb_u8[]` | 色度 AC 哈夫曼表 |
| `extended_sequential` | `hb_bool` | 是否启用 Extended Sequential 模式 |

#### mc_h264_enc_config_t / mc_h265_enc_config_t

`mc_video_codec_enc_params_t` 联合体成员，按 `codec_id` 四选一。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `h264_profile` / `h264_level` | `mc_h264_profile_t` / `mc_h264_level_t` | H.264 的 profile 与 level（仅 H.264） |
| `main_still_picture_profile_enable` | `hb_bool` | 使能 Main Still Picture profile（仅 H.265） |
| `h265_level` / `h265_tier` | `mc_h265_level_t` / `hb_s32` | H.265 的 level 与 tier |
| `transform_skip_enabled_flag` | `hb_u32` | 变换跳过开关（仅 H.265） |
| `lossless_mode` | `hb_u32` | 无损编码模式（仅 H.265） |
| `tmvp_enable` | `hb_u32` | 时域运动矢量预测开关（仅 H.265） |
| `wpp_enable` | `hb_u32` | 波前并行处理开关（仅 H.265） |
| `extended_sequential` | `mc_pixel_10bit_format_t` | 10bit 输入的扩展格式选择 |

#### mc_h264_dec_config_t / mc_h265_dec_config_t

`mc_video_codec_dec_params_t` 联合体成员。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `reorder_enable` | `hb_bool` | 使能解码器按显示顺序输出帧序列 |
| `skip_mode` | `hb_u32` | 帧解码忽略模式 |
| `cra_as_bla` | `hb_bool` | CRA 作为 BLA 处理（仅 H.265） |
| `bandwidth_Opt` | `hb_bool` | 使能节省带宽模式 |
| `dec_temporal_id_mode` | `hb_u32` | temporal id 的选择模式（仅 H.265） |
| `target_dec_temporal_id_plus1` | `hb_u32` | 目标 temporal id 值（仅 H.265） |

#### mc_mjpeg_dec_config_t / mc_jpeg_dec_config_t

MJPEG / JPEG 解码的联合体成员，两者字段相同。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `rot_degree` | `mc_rotate_degree_t` | 解码输出旋转 |
| `mir_direction` | `mc_mirror_direction_t` | 解码输出镜像 |
| `frame_crop_enable` | `hb_bool` | 是否裁剪输出 |
| `crop_rect` | `mc_av_codec_rect_t` | 裁剪矩形 |

#### mc_rotate_degree_t

| 取值 | 说明 |
| --- | --- |
| `MC_CCW_0` | 不旋转 |
| `MC_CCW_90` / `MC_CCW_180` / `MC_CCW_270` | 逆时针旋转 90° / 180° / 270° |

仅编码支持旋转，解码不支持。

#### mc_mirror_direction_t

| 取值 | 说明 |
| --- | --- |
| `MC_DIRECTION_NONE` | 不镜像 |
| `MC_VERTICAL` | 垂直镜像 |
| `MC_HORIZONTAL` | 水平镜像 |
| `MC_HOR_VER` | 水平 + 垂直镜像（等价于旋转 180°） |

仅编码支持镜像，解码不支持。

#### mc_pixel_format_t

| 取值 | 说明 |
| --- | --- |
| `MC_PIXEL_FORMAT_NONE` | 未指定 |
| `MC_PIXEL_FORMAT_YUV420P` | YUV420 平面格式 |
| `MC_PIXEL_FORMAT_NV12` | YUV420 半平面，Y 平面 + UV 交错平面（**最常用**） |
| `MC_PIXEL_FORMAT_NV21` | YUV420 半平面，Y 平面 + VU 交错平面 |
| `MC_PIXEL_FORMAT_YUV422P` / `MC_PIXEL_FORMAT_NV16` / `MC_PIXEL_FORMAT_NV61` | YUV422 平面与半平面格式 |
| `MC_PIXEL_FORMAT_YUYV422` / `MC_PIXEL_FORMAT_YVYU422` / `MC_PIXEL_FORMAT_UYVY422` / `MC_PIXEL_FORMAT_VYUY422` | YUV422 打包格式，主要为 JPEG / MJPEG 使用 |
| `MC_PIXEL_FORMAT_YUV444` / `MC_PIXEL_FORMAT_YUV444P` / `MC_PIXEL_FORMAT_NV24` / `MC_PIXEL_FORMAT_NV42` | YUV444 格式 |
| `MC_PIXEL_FORMAT_YUV440P` | YUV440 格式，JPEG 解码旋转 90°/270° 时使用 |
| `MC_PIXEL_FORMAT_YUV400` | 灰度格式，仅 JPEG / MJPEG |
| `MC_PIXEL_FORMAT_NV12_Y10C8` / `MC_PIXEL_FORMAT_NV21_Y10C8` / `MC_PIXEL_FORMAT_NV12_Y10C8_LSB` / `MC_PIXEL_FORMAT_NV21_Y10C8_LSB` | 10bit 亮度压缩格式，本产品线编解码器不支持 |
| `MC_PIXEL_FORMAT_TOTAL` | 格式总数，非有效取值 |

#### mc_h264_profile_t / mc_h264_level_t / mc_h265_level_t

`profile` 与 `level` 决定编码器输出的码流符合哪一档标准，影响解码端的兼容范围。常用取值：

| 类型 | 取值 |
| --- | --- |
| `mc_h264_profile_t` | `MC_H264_PROFILE_BP`（Baseline）、`MC_H264_PROFILE_MP`（Main）、`MC_H264_PROFILE_HP`（High）等 |
| `mc_h264_level_t` | `MC_H264_LEVEL1`(10) … `MC_H264_LEVEL5_2`(52)，数值为 level × 10 |
| `mc_h265_level_t` | `MC_H265_LEVEL1`(30) … `MC_H265_LEVEL5_1`(153)，数值为 level × 30 |

每个类型的完整定义见板端 `/usr/hobot/include/hb_media_codec.h`。标注「联合体成员」的字段，实际生效的那个由 `codec_id`（以及 `encoder`）决定。

### 枚举与取值

#### media_codec_mode_t

| 取值 | 说明 |
| --- | --- |
| `MC_SOFTWARE` | 软件实现 |
| `MC_HARDWARE` | 硬件实现。RDK 上视频编解码走 VPU / JPU，即此项 |

#### media_codec_state_t

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

#### mc_video_cmd_prio_t

| 取值 | 说明 |
| --- | --- |
| `PRIO_0` … `PRIO_31` | 命令优先级，数值越大优先级越高 |
| `MAX_PRIO_32` | 优先级总数，非有效取值 |

优先级用于多路编解码任务竞争硬件资源时的调度。不显式设置时默认为 `PRIO_0`。

#### media_codec_id_t

| 取值 | 说明 |
| --- | --- |
| `MEDIA_CODEC_ID_H264` / `MEDIA_CODEC_ID_H265` / `MEDIA_CODEC_ID_MJPEG` / `MEDIA_CODEC_ID_JPEG` | 视频与图像编解码，走 VPU / JPU 硬件 |
| 其余 `MEDIA_CODEC_ID_*` 取值 | 未使用 |

<DocScope products="RDK S100">

**S100 上可用的取值只有 4 个**：`MEDIA_CODEC_ID_H264`、`MEDIA_CODEC_ID_H265`、`MEDIA_CODEC_ID_MJPEG`、`MEDIA_CODEC_ID_JPEG`。其余取值 `hb_mm_mc_get_descriptor` 均返回 `NULL`。

</DocScope>

<DocScope products="RDK S600">

**S600 上可用的取值**：`MEDIA_CODEC_ID_H264`、`MEDIA_CODEC_ID_H265`、`MEDIA_CODEC_ID_MJPEG`、`MEDIA_CODEC_ID_JPEG`。另有 8 个 `MEDIA_CODEC_ID_*_HW1` / `_HW2` 变体（H264/H265/MJPEG/JPEG 各两个），用于指定具体的硬件编解码单元，仅在 S600 上可用。

</DocScope>


#### mc_av_stream_feeding_mode_t

解码时码流的送入方式。

| 取值 | 说明 |
| --- | --- |
| `MC_FEEDING_MODE_NONE` | 未指定 |
| `MC_FEEDING_MODE_STREAM_SIZE` | 按字节流长度送入。每次 queue 一个连续码流片段 |
| `MC_FEEDING_MODE_FRAME_SIZE` | 按帧送入。每次 queue 一整帧码流，便于按帧统计 |
| `MC_FEEDING_MODE_TOTAL` | 模式总数，非有效取值 |

#### media_codec_buffer_type_t

| 取值 | 说明 |
| --- | --- |
| `MC_VIDEO_FRAME_BUFFER` | 视频帧 buffer。编码时作输入，解码时作输出 |
| `MC_VIDEO_STREAM_BUFFER` | 视频码流 buffer。编码时作输出，解码时作输入 |

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
