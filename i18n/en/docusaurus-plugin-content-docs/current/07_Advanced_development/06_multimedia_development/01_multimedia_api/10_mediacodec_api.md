---
sidebar_position: 10
title: "MediaCodec API"
description: RDK S100/S600 MediaCodec API
---

# MediaCodec API

## Overview

MediaCodec (audio/video codec; X5 Codec -> RDK MediaCodec) is the RDK A/V codec API (board header `hb_media_codec.h`, functions `hb_mm_mc_*`): codec init/config/start-stop, VPF attach, A/V encoder/decoder register/unregister and IDR frame request, driven by a state machine.

## Abstraction

- **Context**: `media_codec_context_t` carries the whole lifecycle.
- **State machine**: INITIALIZED -> CONFIGURED -> running (start/pause/flush/stop) -> release.
- **VPF attach**: `hb_mm_mc_vpf_init` links MediaCodec to a VPF channel.
- **Codec register**: `hb_mm_mc_register_audio_encoder/decoder`/`unregister_*` dynamically register/unregister A/V codecs.

## Call flow

1. `hb_mm_mc_initialize` initializes the context (INITIALIZED).
2. `hb_mm_mc_vpf_init` attaches a VPF channel if needed; `hb_mm_mc_configure` configures (CONFIGURED).
3. `hb_mm_mc_start` starts; use `hb_mm_mc_pause`/`hb_mm_mc_flush`/`hb_mm_mc_request_idr_frame` while running.
4. `hb_mm_mc_stop` stops; `hb_mm_mc_release` releases the context.


## API 列表

| 函数 | 说明 |
| --- | --- |
| hb_mm_mc_get_descriptor | Get the descriptor of the specified code id. |
| hb_mm_mc_get_default_context | Get the default media codec context. |
| hb_mm_mc_initialize | Initialize the codec and codec context. If success, MediaCodec will |
| hb_mm_mc_vpf_init | Initialize the vpf codec. And it must to be called |
| hb_mm_mc_configure | Configure the codec using the specified parameters. If success, MediaCodec |
| hb_mm_mc_set_callback | Set callback to media codec. And Encoder/Decoder will work in async mode. |
| hb_mm_mc_set_vlc_buffer_listener | Set VLC buffer size listener to media codec. And user can modify the |
| hb_mm_mc_set_camera | It can specify the channel information of camera. |
| hb_mm_mc_start | Start the codec processing. VPU will create encoder instance, decode stream, |
| hb_mm_mc_stop | Stop the codec processing. If success, MediaCodec will be reset and |
| hb_mm_mc_pause | Pause the codec processing. If success, MediaCodec will be paused and |
| hb_mm_mc_flush | Flush the input and output buffers of the codec. And MediaCodec will enter |
| hb_mm_mc_release | Release the codec. MediaCodec will be released and go back to |
| hb_mm_mc_get_state | Get the state of media codec. The value is enum media_codec_state_t. |
| hb_mm_mc_get_status | Get the status of media codec. |
| hb_mm_mc_queue_input_buffer | Queue the input buffer into MediaCodec. The operation is valid only if |
| hb_mm_mc_dequeue_input_buffer | Dequeue the input buffer from MediaCodec. The operation is valid only if |
| hb_mm_mc_queue_output_buffer | Queue the output buffer into MediaCodec. The operation is valid only if |
| hb_mm_mc_dequeue_output_buffer | Dequeue the output buffer from MediaCodec. The operation is valid only if |
| hb_mm_mc_get_longterm_ref_mode | Get the parameters of long-term reference mode. |
| hb_mm_mc_set_longterm_ref_mode | Set the parameters of long-term reference mode. |
| hb_mm_mc_get_intra_refresh_config | Get the parameters of the intra refresh. |
| hb_mm_mc_set_intra_refresh_config | Intra refresh mode can be enabled for error robustness. |
| hb_mm_mc_get_rate_control_config | Get the parameters of rate control. |
| hb_mm_mc_set_rate_control_config | Set the parameters of rate control. |
| hb_mm_mc_get_max_bit_rate_config | Get the max bit rate of rate control. It's only useful for AVBR and CBR. |
| hb_mm_mc_set_max_bit_rate_config | Set the max bit rate of AVBR rate control. |
| hb_mm_mc_get_deblk_filter_config | Get the parameters of deblock filter. |
| hb_mm_mc_set_deblk_filter_config | Set the parameters of deblock filter. |
| hb_mm_mc_get_sao_config | Get the parameters of sample adaptive offset. |
| hb_mm_mc_set_sao_config | Set the parameters of sample adaptive offset. |
| hb_mm_mc_get_entropy_config | Get the parameters of entropy coding. |
| hb_mm_mc_set_entropy_config | Set the parameters of entropy coding mode. |
| hb_mm_mc_get_vui_timing_config | Get the timing parameters of VUI. |
| hb_mm_mc_set_vui_timing_config | Set the timing parameters of VUI. |
| hb_mm_mc_get_vui_config | Get the parameters of VUI. |
| hb_mm_mc_set_vui_config | Set the parameters of VUI. |
| hb_mm_mc_get_slice_config | Get the slice parameters. |
| hb_mm_mc_set_slice_config | Set the slice parameters. |
| hb_mm_mc_insert_user_data | Insert user data. |
| hb_mm_mc_request_idr_frame | Request the IDR Frame. |
| hb_mm_mc_request_idr_header | Enable the IDR Frame. |
| hb_mm_mc_enable_idr_frame | Enable the IDR Frame. |
| hb_mm_mc_skip_pic | Request skip the picture. The encoder ignores sourceFrame and generates |
| hb_mm_mc_get_3dnr_enc_config | Get the parameters of 3DNR (3D Noise Reduction). |
| hb_mm_mc_set_3dnr_enc_config | Set the parameters of 3DNR (3D Noise Reduction) for better quality of image |
| hb_mm_mc_get_smart_bg_enc_config | Get the parameters of smart background encoding. |
| hb_mm_mc_set_smart_bg_enc_config | Set the parameters of smart background encoding. |
| hb_mm_mc_get_pred_unit_config | Get the intra prediction parameters. |
| hb_mm_mc_set_pred_unit_config | Set the intra prediction parameters. |
| hb_mm_mc_get_transform_config | Get the transform parameters. |
| hb_mm_mc_set_transform_config | Set the transform parameters. |
| hb_mm_mc_get_roi_config | Get the ROI parameters. |
| hb_mm_mc_set_roi_config | Set the ROI parameters. |
| hb_mm_mc_get_roi_avg_qp | Get the ROI average QP. |
| hb_mm_mc_set_roi_avg_qp | Set the ROI average QP. |
| hb_mm_mc_get_roi_config_ex | Get the ROI parameters. |
| hb_mm_mc_set_roi_config_ex | Set the ROI parameters. |
| hb_mm_mc_get_mode_decision_config | Get the encoding mode decision parameters. |
| hb_mm_mc_set_mode_decision_config | Set the mode decision parameters. |
| hb_mm_mc_get_user_data | Get the user data parameters. |
| hb_mm_mc_release_user_data | Release the user data. |
| hb_mm_mc_get_explicit_header_config | Get explicit header configuration. |
| hb_mm_mc_set_explicit_header_config | Set explicit header configuration. |
| hb_mm_mc_get_mjpeg_config | Get the mjpeg parameters. |
| hb_mm_mc_set_mjpeg_config | Set the mjpeg parameters. |
| hb_mm_mc_get_jpeg_config | Get the jpeg parameters. |
| hb_mm_mc_set_jpeg_config | Set the jpeg parameters. |
| hb_mm_mc_get_fd | Get device fd. And user can use it to do select operation. |
| hb_mm_mc_close_fd | Close device fd. User must close the fd which is aquired through hb_mm_mc_get_fd. |
| hb_mm_mc_register_audio_encoder | Register audio encoder. User can use it to register external codec. |
| hb_mm_mc_unregister_audio_encoder | Unregister audio encoder. User can use it to unregister codec. |
| hb_mm_mc_register_audio_decoder | Register audio decoder. User can use it to register external codec. |
| hb_mm_mc_unregister_audio_decoder | Unregister audio decoder. User can use it to unregister codec. |
| hb_mm_mc_set_status |  |

## API 接口说明

### hb_mm_mc_get_descriptor

【函数声明】

```c
extern const media_codec_descriptor_t *hb_mm_mc_get_descriptor( media_codec_id_t codec_id);
```

【功能描述】

Get the descriptor of the specified code id.

【参数描述】

[IN] codec_id: codec id

【返回值】

media_codec_descriptor_t: Detailed description information of codec
NULL: No descriptor

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_default_context

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_default_context(media_codec_id_t codec_id, hb_bool encoder, media_codec_context_t *context);
```

【功能描述】

Get the default media codec context.

【参数描述】

[IN] codec_id: codec id
[IN] encoder: encoder or decoder
[OUT] context: codec context

【返回值】

=0: Success
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_initialize

【函数声明】

```c
extern hb_s32 hb_mm_mc_initialize(media_codec_context_t *context);
```

【功能描述】

Initialize the codec and codec context. If success, MediaCodec will

【参数描述】

[IN] context: codec context

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_vpf_init

【函数声明】

```c
extern hb_s32 hb_mm_mc_vpf_init(media_codec_context_t * context, hb_s32 channel_idx);
```

【功能描述】

Initialize the vpf codec. And it must to be called

【参数描述】

[IN] context: codec context
[IN] channel_idx: codec_node channel idx

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources

【兼容性】
HW: Super; SW: v1.2.3

### hb_mm_mc_configure

【函数声明】

```c
extern hb_s32 hb_mm_mc_configure(media_codec_context_t *context);
```

【功能描述】

Configure the codec using the specified parameters. If success, MediaCodec

【参数描述】

[IN] context: codec context

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_callback

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_callback(media_codec_context_t *context, const media_codec_callback_t *callback, hb_ptr userdata);
```

【功能描述】

Set callback to media codec. And Encoder/Decoder will work in async mode.

【参数描述】

[IN] context: ccodec context
[IN] callback: ccallback function
[IN] userdata: pointer to user data which is passed as an incoming parameter when the callback function is called

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_vlc_buffer_listener

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_vlc_buffer_listener( media_codec_context_t *context, const media_codec_callback_t *callback, hb_ptr userdata);
```

【功能描述】

Set VLC buffer size listener to media codec. And user can modify the

【参数描述】

[IN] context: codec context
[IN] callback: @see media_codec_callback_t
[IN] userdata: pointer to user data

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_camera

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_camera(media_codec_context_t *context, hb_s32 pipeline, hb_s32 channel_port_id);
```

【功能描述】

It can specify the channel information of camera.

【参数描述】

[IN] context: codec context
[IN] pipeline: pipeline number
[IN] channel_port_id: IPU channel port id

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_start

【函数声明】

```c
extern hb_s32 hb_mm_mc_start(media_codec_context_t *context, const mc_av_codec_startup_params_t * info);
```

【功能描述】

Start the codec processing. VPU will create encoder instance, decode stream,

【参数描述】

[IN] context: codec context
[IN] info: startup information

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_stop

【函数声明】

```c
extern hb_s32 hb_mm_mc_stop(media_codec_context_t *context);
```

【功能描述】

Stop the codec processing. If success, MediaCodec will be reset and

【参数描述】

[IN] context: codec context

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_pause

【函数声明】

```c
extern hb_s32 hb_mm_mc_pause(media_codec_context_t *context);
```

【功能描述】

Pause the codec processing. If success, MediaCodec will be paused and

【参数描述】

[IN] context: codec context

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_flush

【函数声明】

```c
extern hb_s32 hb_mm_mc_flush(media_codec_context_t *context);
```

【功能描述】

Flush the input and output buffers of the codec. And MediaCodec will enter

【参数描述】

[IN] context: codec context

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_release

【函数声明】

```c
extern hb_s32 hb_mm_mc_release(media_codec_context_t *context);
```

【功能描述】

Release the codec. MediaCodec will be released and go back to

【参数描述】

[IN] context: codec context

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_state

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_state(media_codec_context_t *context, media_codec_state_t *state);
```

【功能描述】

Get the state of media codec. The value is enum media_codec_state_t.

【参数描述】

[IN] context: codec context
[OUT] state: codec state

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_status

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_status(media_codec_context_t *context, mc_inter_status_t *status);
```

【功能描述】

Get the status of media codec.

【参数描述】

[IN] context: codec context
[OUT] status: codec status

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_queue_input_buffer

【函数声明】

```c
extern hb_s32 hb_mm_mc_queue_input_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, hb_s32 timeout);
```

【功能描述】

Queue the input buffer into MediaCodec. The operation is valid only if

【参数描述】

[IN] context: codec context
[IN] timeout: timeout in ms
[OUT] buffer: media codec buffer

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_BUFFER: Invalid buffer
HB_MEDIA_ERR_WAIT_TIMEOUT: Wait timeout

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_dequeue_input_buffer

【函数声明】

```c
extern hb_s32 hb_mm_mc_dequeue_input_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, hb_s32 timeout);
```

【功能描述】

Dequeue the input buffer from MediaCodec. The operation is valid only if

【参数描述】

[IN] context: codec context
[IN] timeout: timeout in ms
[OUT] buffer: media codec buffer

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_BUFFER: Invalid buffer
HB_MEDIA_ERR_WAIT_TIMEOUT: Wait timeout

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_queue_output_buffer

【函数声明】

```c
extern hb_s32 hb_mm_mc_queue_output_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, hb_s32 timeout);
```

【功能描述】

Queue the output buffer into MediaCodec. The operation is valid only if

【参数描述】

[IN] context: codec context
[IN] timeout: timeout in ms
[OUT] buffer: media codec buffer

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_BUFFER: Invalid buffer
HB_MEDIA_ERR_WAIT_TIMEOUT: Wait timeout

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_dequeue_output_buffer

【函数声明】

```c
extern hb_s32 hb_mm_mc_dequeue_output_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, media_codec_output_buffer_info_t*info, hb_s32 timeout);
```

【功能描述】

Dequeue the output buffer from MediaCodec. The operation is valid only if

【参数描述】

[IN] context: codec context
[IN] timeout: timeout in ms
[OUT] buffer: media codec buffer
[OUT] info: stream information

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_BUFFER: Invalid buffer
HB_MEDIA_ERR_WAIT_TIMEOUT: Wait timeout

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_longterm_ref_mode

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_longterm_ref_mode( media_codec_context_t *context, mc_video_longterm_ref_mode_t *params);
```

【功能描述】

Get the parameters of long-term reference mode.

【参数描述】

[IN] context: codec context
[OUT] params: long-term reference parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_longterm_ref_mode

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_longterm_ref_mode( media_codec_context_t *context, const mc_video_longterm_ref_mode_t *params);
```

【功能描述】

Set the parameters of long-term reference mode.

【参数描述】

[IN] context: codec context
[IN] params: long-term reference parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_intra_refresh_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_intra_refresh_config( media_codec_context_t *context, mc_video_intra_refresh_params_t *params);
```

【功能描述】

Get the parameters of the intra refresh.

【参数描述】

[IN] context: codec context
[OUT] params: intra refresh parameters @see mc_video_intra_refresh_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_intra_refresh_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_intra_refresh_config( media_codec_context_t *context, const mc_video_intra_refresh_params_t *params);
```

【功能描述】

Intra refresh mode can be enabled for error robustness.

【参数描述】

[IN] context: codec context
[IN] params: intra refresh parameters @see mc_video_intra_refresh_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_rate_control_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_rate_control_config( media_codec_context_t *context, mc_rate_control_params_t *params);
```

【功能描述】

Get the parameters of rate control.

【参数描述】

[IN] context: codec context
[OUT] params: rate control parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_rate_control_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_rate_control_config( media_codec_context_t *context, const mc_rate_control_params_t *params);
```

【功能描述】

Set the parameters of rate control.

【参数描述】

[IN] context: codec context
[IN] params: rate control parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_max_bit_rate_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_max_bit_rate_config( media_codec_context_t *context, hb_u32 *params);
```

【功能描述】

Get the max bit rate of rate control. It's only useful for AVBR and CBR.

【参数描述】

[IN] context: codec context
[OUT] params: max bitrate

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_max_bit_rate_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_max_bit_rate_config( media_codec_context_t *context, hb_u32 params);
```

【功能描述】

Set the max bit rate of AVBR rate control.

【参数描述】

[IN] context: codec context
[IN] params: rate control parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_deblk_filter_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_deblk_filter_config( media_codec_context_t *context, mc_video_deblk_filter_params_t *params);
```

【功能描述】

Get the parameters of deblock filter.

【参数描述】

[IN] context: codec context
[OUT] params: deblock filter parameters @see mc_video_deblk_filter_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_deblk_filter_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_deblk_filter_config( media_codec_context_t *context, const mc_video_deblk_filter_params_t *params);
```

【功能描述】

Set the parameters of deblock filter.

【参数描述】

[IN] context: codec context
[IN] params: deblock filter parameters @see mc_video_deblk_filter_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_sao_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_sao_config(media_codec_context_t *context, mc_h265_sao_params_t *params);
```

【功能描述】

Get the parameters of sample adaptive offset.

【参数描述】

[IN] context: codec context
[OUT] params: SAO parameters @see mc_h265_sao_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_sao_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_sao_config(media_codec_context_t *context, const mc_h265_sao_params_t *params);
```

【功能描述】

Set the parameters of sample adaptive offset.

【参数描述】

[IN] context: codec context
[IN] params: SAO parameters @see mc_h265_sao_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_entropy_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_entropy_config( media_codec_context_t *context, mc_h264_entropy_params_t *params);
```

【功能描述】

Get the parameters of entropy coding.

【参数描述】

[IN] context: codec context
[OUT] params: entropy coding parameters @see mc_h264_entropy_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_set_entropy_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_entropy_config( media_codec_context_t *context, const mc_h264_entropy_params_t *params);
```

【功能描述】

Set the parameters of entropy coding mode.

【参数描述】

[IN] context: codec context
[IN] params: entropy coding parameters @see mc_h264_entropy_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_get_vui_timing_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_vui_timing_config( media_codec_context_t *context, mc_video_vui_timing_params_t *params);
```

【功能描述】

Get the timing parameters of VUI.

【参数描述】

[IN] context: codec context
[OUT] params: VUI timing parameters @see mc_video_vui_timing_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_vui_timing_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_vui_timing_config( media_codec_context_t *context, const mc_video_vui_timing_params_t *params);
```

【功能描述】

Set the timing parameters of VUI.

【参数描述】

[IN] context: codec context
[IN] params: VUI timing parameters @see mc_video_vui_timing_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_vui_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_vui_config( media_codec_context_t *context, mc_video_vui_params_t *params);
```

【功能描述】

Get the parameters of VUI.

【参数描述】

[IN] context: codec context
[OUT] params: VUI parameters @see mc_video_vui_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_vui_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_vui_config( media_codec_context_t *context, const mc_video_vui_params_t *params);
```

【功能描述】

Set the parameters of VUI.

【参数描述】

[IN] context: codec context
[IN] params: VUI parameters @see mc_video_vui_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_slice_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_slice_config(media_codec_context_t *context, mc_video_slice_params_t *params);
```

【功能描述】

Get the slice parameters.

【参数描述】

[IN] context: codec context
[OUT] params: slice parameters @see mc_video_slice_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_slice_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_slice_config(media_codec_context_t *context, const mc_video_slice_params_t *params);
```

【功能描述】

Set the slice parameters.

【参数描述】

[IN] context: codec context
[IN] params: slice parameters @see mc_video_slice_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_insert_user_data

【函数声明】

```c
extern hb_s32 hb_mm_mc_insert_user_data(media_codec_context_t * context, hb_u8 *data, hb_u32 length);
```

【功能描述】

Insert user data.

【参数描述】

[IN] context: codec context
[IN] data: userdata, must be "UUID+string"
[IN] length: length (0, 1024]

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_request_idr_frame

【函数声明】

```c
extern hb_s32 hb_mm_mc_request_idr_frame(media_codec_context_t *context);
```

【功能描述】

Request the IDR Frame.

【参数描述】

[IN] context: codec context

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_request_idr_header

【函数声明】

```c
extern hb_s32 hb_mm_mc_request_idr_header( media_codec_context_t *context, hb_u32 force_header);
```

【功能描述】

Enable the IDR Frame.

【参数描述】

[IN] context: codec context
[IN] enable: enalbe/diable idr frame, default enable The valid numbers are as follows. 0 : Disable 1 : Enable

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_enable_idr_frame

【函数声明】

```c
extern hb_s32 hb_mm_mc_enable_idr_frame( media_codec_context_t *context, hb_bool enable);
```

【功能描述】

Enable the IDR Frame.

【参数描述】

[IN] context: codec context
[IN] enable: enalbe/diable idr frame, default enable The valid numbers are as follows. 0 : Disable 1 : Enable

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_skip_pic

【函数声明】

```c
extern hb_s32 hb_mm_mc_skip_pic(media_codec_context_t * context, hb_s32 src_idx);
```

【功能描述】

Request skip the picture. The encoder ignores sourceFrame and generates

【参数描述】

[IN] context: codec context
[IN] src_idx: source buffer index

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_3dnr_enc_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_3dnr_enc_config( media_codec_context_t *context, mc_video_3dnr_enc_params_t *params);
```

【功能描述】

Get the parameters of 3DNR (3D Noise Reduction).

【参数描述】

[IN] context: codec context
[OUT] params: 3dnr encoding parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_set_3dnr_enc_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_3dnr_enc_config( media_codec_context_t *context, const mc_video_3dnr_enc_params_t *params);
```

【功能描述】

Set the parameters of 3DNR (3D Noise Reduction) for better quality of image

【参数描述】

[IN] context: codec context
[IN] params: smart background encoding parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_get_smart_bg_enc_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_smart_bg_enc_config( media_codec_context_t *context, mc_video_smart_bg_enc_params_t *params);
```

【功能描述】

Get the parameters of smart background encoding.

【参数描述】

[IN] context: codec context
[OUT] params: smart background encoding parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_set_smart_bg_enc_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_smart_bg_enc_config( media_codec_context_t *context, const mc_video_smart_bg_enc_params_t *params);
```

【功能描述】

Set the parameters of smart background encoding.

【参数描述】

[IN] context: codec context
[IN] params: smart background encoding parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_get_pred_unit_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_pred_unit_config( media_codec_context_t *context, mc_video_pred_unit_params_t *params);
```

【功能描述】

Get the intra prediction parameters.

【参数描述】

[IN] context: codec context
[OUT] params: intra prediction @see mc_video_pred_unit_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_pred_unit_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_pred_unit_config( media_codec_context_t *context, const mc_video_pred_unit_params_t *params);
```

【功能描述】

Set the intra prediction parameters.

【参数描述】

[IN] context: codec context
[IN] params: intra prediction @see mc_video_pred_unit_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_transform_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_transform_config( media_codec_context_t *context, mc_video_transform_params_t *params);
```

【功能描述】

Get the transform parameters.

【参数描述】

[IN] context: codec context
[OUT] params: transform parameters @see mc_video_transform_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_transform_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_transform_config( media_codec_context_t *context, const mc_video_transform_params_t *params);
```

【功能描述】

Set the transform parameters.

【参数描述】

[IN] context: codec context
[IN] params: transform parameters @see mc_video_transform_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_roi_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_roi_config(media_codec_context_t * context, mc_video_roi_params_t * params);
```

【功能描述】

Get the ROI parameters.

【参数描述】

[IN] context: codec context
[OUT] params: ROI parameters @see mc_video_roi_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_roi_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_roi_config(media_codec_context_t * context, const mc_video_roi_params_t *params);
```

【功能描述】

Set the ROI parameters.

【参数描述】

[IN] context: codec context
[IN] params: ROI parameters @see mc_video_roi_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_roi_avg_qp

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_roi_avg_qp(media_codec_context_t * context, hb_u32 * params);
```

【功能描述】

Get the ROI average QP.

【参数描述】

[IN] context: codec context
[OUT] params: ROI average QP

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_roi_avg_qp

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_roi_avg_qp(media_codec_context_t * context, hb_u32 params);
```

【功能描述】

Set the ROI average QP.

【参数描述】

[IN] context: codec context
[IN] params: ROI average QP [0, 51] 0: using the average qp of QP map.

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_roi_config_ex

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_roi_config_ex(media_codec_context_t *context, hb_u32 roi_idx, mc_video_roi_params_ex_t *params);
```

【功能描述】

Get the ROI parameters.

【参数描述】

[IN] context: codec context
[IN] roi_idx: roi index
[OUT] params: ROI parameters @see mc_video_roi_params_ex_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_roi_config_ex

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_roi_config_ex(media_codec_context_t *context, const mc_video_roi_params_ex_t *params);
```

【功能描述】

Set the ROI parameters.

【参数描述】

[IN] context: codec context
[IN] params: ROI parameters @see mc_video_roi_params_ex_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

【兼容性】
HW: Ultra; SW: v1.2.3

### hb_mm_mc_get_mode_decision_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_mode_decision_config( media_codec_context_t *context, mc_video_mode_decision_params_t *params);
```

【功能描述】

Get the encoding mode decision parameters.

【参数描述】

[IN] context: codec context
[OUT] params: mode decision parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_set_mode_decision_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_mode_decision_config( media_codec_context_t *context, const mc_video_mode_decision_params_t *params);
```

【功能描述】

Set the mode decision parameters.

【参数描述】

[IN] context: codec context
[IN] params: mode decision parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_get_user_data

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_user_data(media_codec_context_t * context, mc_user_data_buffer_t *params, hb_s32 timeout);
```

【功能描述】

Get the user data parameters.

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_WAIT_TIMEOUT: Wait timeout

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_release_user_data

【函数声明】

```c
extern hb_s32 hb_mm_mc_release_user_data(media_codec_context_t * context, const mc_user_data_buffer_t * params);
```

【功能描述】

Release the user data.

【参数描述】

[IN] context: codec context
[OUT] params: user data parameters @see mc_user_data_buffer_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_explicit_header_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_explicit_header_config( media_codec_context_t *context, hb_s32 *status);
```

【功能描述】

Get explicit header configuration.

【参数描述】

[IN] context: codec context
[OUT] status: explicit header configuration The valid numbers are as follows. 0 : Disable, the header will be encoded into independent frame 1 : Enable, the header will be encoded into IDR frame if it exists.

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_explicit_header_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_explicit_header_config( media_codec_context_t *context, hb_s32 status);
```

【功能描述】

Set explicit header configuration.

【参数描述】

[IN] context: codec context
[IN] status: enalbe/diable explicit header, default enable The valid numbers are as follows. 0 : Disable, the header will be encoded into independent frame 1 : Enable, the header will be encoded into IDR frame if it exists.

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_mjpeg_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_mjpeg_config(media_codec_context_t * context, mc_mjpeg_enc_params_t *params);
```

【功能描述】

Get the mjpeg parameters.

【参数描述】

[IN] context: codec context
[OUT] params: mjpeg parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_mjpeg_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_mjpeg_config(media_codec_context_t * context, const mc_mjpeg_enc_params_t *params);
```

【功能描述】

Set the mjpeg parameters.

【参数描述】

[IN] context: codec context
[IN] params: mjpeg parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_jpeg_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_jpeg_config(media_codec_context_t * context, mc_jpeg_enc_params_t *params);
```

【功能描述】

Get the jpeg parameters.

【参数描述】

[IN] context: codec context
[OUT] params: jpeg parameters

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_jpeg_config

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_jpeg_config(media_codec_context_t * context, const mc_jpeg_enc_params_t *params);
```

【功能描述】

Set the jpeg parameters.

【参数描述】

[IN] codec: context
[IN] jpeg: parameters @see mc_jpeg_enc_params_t

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_fd

【函数声明】

```c
extern hb_s32 hb_mm_mc_get_fd(media_codec_context_t * context, hb_s32 *fd);
```

【功能描述】

Get device fd. And user can use it to do select operation.

【参数描述】

[IN] context: codec context
[OUT] fd: device fd

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_close_fd

【函数声明】

```c
extern hb_s32 hb_mm_mc_close_fd(media_codec_context_t * context, hb_s32 fd);
```

【功能描述】

Close device fd. User must close the fd which is aquired through hb_mm_mc_get_fd.

【参数描述】

[IN] context: codec context
[IN] fd: device fd

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_register_audio_encoder

【函数声明】

```c
extern hb_s32 hb_mm_mc_register_audio_encoder(hb_s32 *handle, mc_audio_encode_param_t *encoder);
```

【功能描述】

Register audio encoder. User can use it to register external codec.

【参数描述】

[OUT] handle: register handle
[IN] encoder: audio encoder

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_unregister_audio_encoder

【函数声明】

```c
extern hb_s32 hb_mm_mc_unregister_audio_encoder(hb_s32 handle);
```

【功能描述】

Unregister audio encoder. User can use it to unregister codec.

【参数描述】

[IN] handle: register handle

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_register_audio_decoder

【函数声明】

```c
extern hb_s32 hb_mm_mc_register_audio_decoder(hb_s32 *handle, mc_audio_decode_param_t *decoder);
```

【功能描述】

Register audio decoder. User can use it to register external codec.

【参数描述】

[OUT] handle: register handle
[IN] decoder: audio decoder

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_unregister_audio_decoder

【函数声明】

```c
extern hb_s32 hb_mm_mc_unregister_audio_decoder(hb_s32 handle);
```

【功能描述】

Unregister audio decoder. User can use it to unregister codec.

【参数描述】

[IN] handle: register handle

【返回值】

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources

【兼容性】
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_status

【函数声明】

```c
extern hb_s32 hb_mm_mc_set_status(media_codec_context_t *context, mc_user_status_t *status);
```

【功能描述】



【返回值】

&gt;=0 on success, negative HB_MEDIA_ERROR in case of failure

