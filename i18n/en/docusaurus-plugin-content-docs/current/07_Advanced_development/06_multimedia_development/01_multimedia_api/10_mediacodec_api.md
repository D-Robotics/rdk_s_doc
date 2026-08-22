---
sidebar_position: 10
title: "Codec - MediaCodec"
description: RDK S100/S600 5.5.1.10 MediaCodec (codec)
---

# Codec - MediaCodec

> **Level description**: This chapter covers the [Low-level Multimedia API] (board header `hb_media_codec.h`), the audio/video codec API (X5 Codec → RDK MediaCodec). It is intended for advanced development that directly operates on the multimedia pipeline (Mode 3); if you only need to run the encapsulated capture/codec/display functionality, see Chapter 4 [Simple API](/Simple_API/multimedia_api/cdev/vio_api) (Mode 1).

## Overview

MediaCodec (audio/video codec; X5 Codec → RDK MediaCodec) is the RDK A/V codec API (board header `hb_media_codec.h`, functions `hb_mm_mc_*`): codec init/config/start-stop, VPF attach, A/V encoder/decoder register/unregister and IDR frame request, driven by a state machine.

## Software Abstraction

- **Context**: `media_codec_context_t` carries the whole lifecycle.
- **State machine**: INITIALIZED → CONFIGURED → running (start/pause/flush/stop) → release.
- **VPF attach**: `hb_mm_mc_vpf_init` links MediaCodec to a VPF channel.
- **Codec register**: `hb_mm_mc_register_audio_encoder/decoder`/`unregister_*` dynamically register/unregister A/V codecs.

## API Call Flow

1. `hb_mm_mc_initialize` initializes the context (INITIALIZED).
2. `hb_mm_mc_vpf_init` attaches a VPF channel if needed; `hb_mm_mc_configure` configures (CONFIGURED).
3. `hb_mm_mc_start` starts; use `hb_mm_mc_pause`/`hb_mm_mc_flush`/`hb_mm_mc_request_idr_frame` while running.
4. `hb_mm_mc_stop` stops; `hb_mm_mc_release` releases the context.


## Quick Example

The following example references `/app/multimedia_samples/sample_codec/sample_codec.c` on the board and demonstrates the minimal usage sequence of the encoder:

```c
#include "hb_media_codec.h"

// 1. Get the codec descriptor and the default context, initialize it as an encoder
const media_codec_descriptor_t *desc = hb_mm_mc_get_descriptor(MEDIA_CODEC_ID_H265);
media_codec_context_t context = {0};
hb_mm_mc_get_default_context(MEDIA_CODEC_ID_H265, &context);
context.encoder = true;            /* encode */
context.codec_id = MEDIA_CODEC_ID_H265;

// 2. Initialize and configure (bitrate/resolution/framerate, etc.)
hb_mm_mc_initialize(&context);
mc_av_codec_config_t codec_cfg = {0};
/* fill in codec_cfg as needed ... */
hb_mm_mc_configure(&context);

// 3. Start encoding
mc_av_codec_startup_params_t startup_params = {0};
hb_mm_mc_start(&context, &startup_params);

// 4. Feed in image frames and get the encoded stream back (buffer reuse loop)
mc_buffer_t in_buf, out_buf;
mc_buffer_info_t out_info;
hb_mm_mc_dequeue_input_buffer(&context, &in_buf, 2000);
/* fill in_buf with an NV12 image ... */
hb_mm_mc_queue_input_buffer(&context, &in_buf, 2000);
hb_mm_mc_dequeue_output_buffer(&context, &out_buf, &out_info, 2000);
/* write the stream from out_buf ... */
hb_mm_mc_queue_output_buffer(&context, &out_buf, 0);

// 5. Stop and release
hb_mm_mc_stop(&context);
hb_mm_mc_release(&context);
```

> For a decoder, set `context.encoder` to `false` and change `codec_id` to a decode ID; the buffer type is `MC_VIDEO_FRAME_BUFFER` for encoding and `MC_VIDEO_STREAM_BUFFER` for decoding. See `sample_codec.c` for the complete flow.

## API List

| Function | Description |
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

## API Interface Description

### hb_mm_mc_get_descriptor

**Function Declaration**

```c
extern const media_codec_descriptor_t *hb_mm_mc_get_descriptor( media_codec_id_t codec_id);
```

**Description**

Get the descriptor of the specified code id.

**Parameter Description**

[IN] codec_id: codec id

**Return Value**

media_codec_descriptor_t: Detailed description information of codec
NULL: No descriptor

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_default_context

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_default_context(media_codec_id_t codec_id, hb_bool encoder, media_codec_context_t *context);
```

**Description**

Get the default media codec context.

**Parameter Description**

[IN] codec_id: codec id
[IN] encoder: encoder or decoder
[OUT] context: codec context

**Return Value**

=0: Success
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_initialize

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_initialize(media_codec_context_t *context);
```

**Description**

Initialize the codec and codec context. If success, MediaCodec will

**Parameter Description**

[IN] context: codec context

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_vpf_init

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_vpf_init(media_codec_context_t * context, hb_s32 channel_idx);
```

**Description**

Initialize the vpf codec. And it must to be called

**Parameter Description**

[IN] context: codec context
[IN] channel_idx: codec_node channel idx

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources

**Compatibility**
HW: Super; SW: v1.2.3

### hb_mm_mc_configure

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_configure(media_codec_context_t *context);
```

**Description**

Configure the codec using the specified parameters. If success, MediaCodec

**Parameter Description**

[IN] context: codec context

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_callback

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_callback(media_codec_context_t *context, const media_codec_callback_t *callback, hb_ptr userdata);
```

**Description**

Set callback to media codec. And Encoder/Decoder will work in async mode.

**Parameter Description**

[IN] context: ccodec context
[IN] callback: ccallback function
[IN] userdata: pointer to user data which is passed as an incoming parameter when the callback function is called

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_vlc_buffer_listener

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_vlc_buffer_listener( media_codec_context_t *context, const media_codec_callback_t *callback, hb_ptr userdata);
```

**Description**

Set VLC buffer size listener to media codec. And user can modify the

**Parameter Description**

[IN] context: codec context
[IN] callback: @see media_codec_callback_t
[IN] userdata: pointer to user data

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_camera

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_camera(media_codec_context_t *context, hb_s32 pipeline, hb_s32 channel_port_id);
```

**Description**

It can specify the channel information of camera.

**Parameter Description**

[IN] context: codec context
[IN] pipeline: pipeline number
[IN] channel_port_id: IPU channel port id

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_start

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_start(media_codec_context_t *context, const mc_av_codec_startup_params_t * info);
```

**Description**

Start the codec processing. VPU will create encoder instance, decode stream,

**Parameter Description**

[IN] context: codec context
[IN] info: startup information

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_stop

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_stop(media_codec_context_t *context);
```

**Description**

Stop the codec processing. If success, MediaCodec will be reset and

**Parameter Description**

[IN] context: codec context

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_pause

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_pause(media_codec_context_t *context);
```

**Description**

Pause the codec processing. If success, MediaCodec will be paused and

**Parameter Description**

[IN] context: codec context

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_flush

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_flush(media_codec_context_t *context);
```

**Description**

Flush the input and output buffers of the codec. And MediaCodec will enter

**Parameter Description**

[IN] context: codec context

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_release

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_release(media_codec_context_t *context);
```

**Description**

Release the codec. MediaCodec will be released and go back to

**Parameter Description**

[IN] context: codec context

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_state

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_state(media_codec_context_t *context, media_codec_state_t *state);
```

**Description**

Get the state of media codec. The value is enum media_codec_state_t.

**Parameter Description**

[IN] context: codec context
[OUT] state: codec state

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_status

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_status(media_codec_context_t *context, mc_inter_status_t *status);
```

**Description**

Get the status of media codec.

**Parameter Description**

[IN] context: codec context
[OUT] status: codec status

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_queue_input_buffer

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_queue_input_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, hb_s32 timeout);
```

**Description**

Queue the input buffer into MediaCodec. The operation is valid only if

**Parameter Description**

[IN] context: codec context
[IN] timeout: timeout in ms
[OUT] buffer: media codec buffer

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_BUFFER: Invalid buffer
HB_MEDIA_ERR_WAIT_TIMEOUT: Wait timeout

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_dequeue_input_buffer

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_dequeue_input_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, hb_s32 timeout);
```

**Description**

Dequeue the input buffer from MediaCodec. The operation is valid only if

**Parameter Description**

[IN] context: codec context
[IN] timeout: timeout in ms
[OUT] buffer: media codec buffer

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_BUFFER: Invalid buffer
HB_MEDIA_ERR_WAIT_TIMEOUT: Wait timeout

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_queue_output_buffer

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_queue_output_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, hb_s32 timeout);
```

**Description**

Queue the output buffer into MediaCodec. The operation is valid only if

**Parameter Description**

[IN] context: codec context
[IN] timeout: timeout in ms
[OUT] buffer: media codec buffer

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_BUFFER: Invalid buffer
HB_MEDIA_ERR_WAIT_TIMEOUT: Wait timeout

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_dequeue_output_buffer

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_dequeue_output_buffer( media_codec_context_t *context, media_codec_buffer_t *buffer, media_codec_output_buffer_info_t*info, hb_s32 timeout);
```

**Description**

Dequeue the output buffer from MediaCodec. The operation is valid only if

**Parameter Description**

[IN] context: codec context
[IN] timeout: timeout in ms
[OUT] buffer: media codec buffer
[OUT] info: stream information

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_BUFFER: Invalid buffer
HB_MEDIA_ERR_WAIT_TIMEOUT: Wait timeout

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_longterm_ref_mode

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_longterm_ref_mode( media_codec_context_t *context, mc_video_longterm_ref_mode_t *params);
```

**Description**

Get the parameters of long-term reference mode.

**Parameter Description**

[IN] context: codec context
[OUT] params: long-term reference parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_longterm_ref_mode

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_longterm_ref_mode( media_codec_context_t *context, const mc_video_longterm_ref_mode_t *params);
```

**Description**

Set the parameters of long-term reference mode.

**Parameter Description**

[IN] context: codec context
[IN] params: long-term reference parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_intra_refresh_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_intra_refresh_config( media_codec_context_t *context, mc_video_intra_refresh_params_t *params);
```

**Description**

Get the parameters of the intra refresh.

**Parameter Description**

[IN] context: codec context
[OUT] params: intra refresh parameters @see mc_video_intra_refresh_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_intra_refresh_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_intra_refresh_config( media_codec_context_t *context, const mc_video_intra_refresh_params_t *params);
```

**Description**

Intra refresh mode can be enabled for error robustness.

**Parameter Description**

[IN] context: codec context
[IN] params: intra refresh parameters @see mc_video_intra_refresh_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_rate_control_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_rate_control_config( media_codec_context_t *context, mc_rate_control_params_t *params);
```

**Description**

Get the parameters of rate control.

**Parameter Description**

[IN] context: codec context
[OUT] params: rate control parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_rate_control_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_rate_control_config( media_codec_context_t *context, const mc_rate_control_params_t *params);
```

**Description**

Set the parameters of rate control.

**Parameter Description**

[IN] context: codec context
[IN] params: rate control parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_max_bit_rate_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_max_bit_rate_config( media_codec_context_t *context, hb_u32 *params);
```

**Description**

Get the max bit rate of rate control. It's only useful for AVBR and CBR.

**Parameter Description**

[IN] context: codec context
[OUT] params: max bitrate

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_max_bit_rate_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_max_bit_rate_config( media_codec_context_t *context, hb_u32 params);
```

**Description**

Set the max bit rate of AVBR rate control.

**Parameter Description**

[IN] context: codec context
[IN] params: rate control parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_deblk_filter_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_deblk_filter_config( media_codec_context_t *context, mc_video_deblk_filter_params_t *params);
```

**Description**

Get the parameters of deblock filter.

**Parameter Description**

[IN] context: codec context
[OUT] params: deblock filter parameters @see mc_video_deblk_filter_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_deblk_filter_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_deblk_filter_config( media_codec_context_t *context, const mc_video_deblk_filter_params_t *params);
```

**Description**

Set the parameters of deblock filter.

**Parameter Description**

[IN] context: codec context
[IN] params: deblock filter parameters @see mc_video_deblk_filter_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_sao_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_sao_config(media_codec_context_t *context, mc_h265_sao_params_t *params);
```

**Description**

Get the parameters of sample adaptive offset.

**Parameter Description**

[IN] context: codec context
[OUT] params: SAO parameters @see mc_h265_sao_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_sao_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_sao_config(media_codec_context_t *context, const mc_h265_sao_params_t *params);
```

**Description**

Set the parameters of sample adaptive offset.

**Parameter Description**

[IN] context: codec context
[IN] params: SAO parameters @see mc_h265_sao_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_entropy_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_entropy_config( media_codec_context_t *context, mc_h264_entropy_params_t *params);
```

**Description**

Get the parameters of entropy coding.

**Parameter Description**

[IN] context: codec context
[OUT] params: entropy coding parameters @see mc_h264_entropy_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_set_entropy_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_entropy_config( media_codec_context_t *context, const mc_h264_entropy_params_t *params);
```

**Description**

Set the parameters of entropy coding mode.

**Parameter Description**

[IN] context: codec context
[IN] params: entropy coding parameters @see mc_h264_entropy_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_get_vui_timing_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_vui_timing_config( media_codec_context_t *context, mc_video_vui_timing_params_t *params);
```

**Description**

Get the timing parameters of VUI.

**Parameter Description**

[IN] context: codec context
[OUT] params: VUI timing parameters @see mc_video_vui_timing_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_vui_timing_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_vui_timing_config( media_codec_context_t *context, const mc_video_vui_timing_params_t *params);
```

**Description**

Set the timing parameters of VUI.

**Parameter Description**

[IN] context: codec context
[IN] params: VUI timing parameters @see mc_video_vui_timing_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_vui_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_vui_config( media_codec_context_t *context, mc_video_vui_params_t *params);
```

**Description**

Get the parameters of VUI.

**Parameter Description**

[IN] context: codec context
[OUT] params: VUI parameters @see mc_video_vui_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_vui_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_vui_config( media_codec_context_t *context, const mc_video_vui_params_t *params);
```

**Description**

Set the parameters of VUI.

**Parameter Description**

[IN] context: codec context
[IN] params: VUI parameters @see mc_video_vui_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_slice_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_slice_config(media_codec_context_t *context, mc_video_slice_params_t *params);
```

**Description**

Get the slice parameters.

**Parameter Description**

[IN] context: codec context
[OUT] params: slice parameters @see mc_video_slice_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_slice_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_slice_config(media_codec_context_t *context, const mc_video_slice_params_t *params);
```

**Description**

Set the slice parameters.

**Parameter Description**

[IN] context: codec context
[IN] params: slice parameters @see mc_video_slice_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_insert_user_data

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_insert_user_data(media_codec_context_t * context, hb_u8 *data, hb_u32 length);
```

**Description**

Insert user data.

**Parameter Description**

[IN] context: codec context
[IN] data: userdata, must be "UUID+string"
[IN] length: length (0, 1024]

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_request_idr_frame

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_request_idr_frame(media_codec_context_t *context);
```

**Description**

Request the IDR Frame.

**Parameter Description**

[IN] context: codec context

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_request_idr_header

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_request_idr_header( media_codec_context_t *context, hb_u32 force_header);
```

**Description**

Enable the IDR Frame.

**Parameter Description**

[IN] context: codec context
[IN] enable: enalbe/diable idr frame, default enable The valid numbers are as follows. 0 : Disable 1 : Enable

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_enable_idr_frame

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_enable_idr_frame( media_codec_context_t *context, hb_bool enable);
```

**Description**

Enable the IDR Frame.

**Parameter Description**

[IN] context: codec context
[IN] enable: enalbe/diable idr frame, default enable The valid numbers are as follows. 0 : Disable 1 : Enable

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_skip_pic

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_skip_pic(media_codec_context_t * context, hb_s32 src_idx);
```

**Description**

Request skip the picture. The encoder ignores sourceFrame and generates

**Parameter Description**

[IN] context: codec context
[IN] src_idx: source buffer index

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_3dnr_enc_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_3dnr_enc_config( media_codec_context_t *context, mc_video_3dnr_enc_params_t *params);
```

**Description**

Get the parameters of 3DNR (3D Noise Reduction).

**Parameter Description**

[IN] context: codec context
[OUT] params: 3dnr encoding parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_set_3dnr_enc_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_3dnr_enc_config( media_codec_context_t *context, const mc_video_3dnr_enc_params_t *params);
```

**Description**

Set the parameters of 3DNR (3D Noise Reduction) for better quality of image

**Parameter Description**

[IN] context: codec context
[IN] params: smart background encoding parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_get_smart_bg_enc_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_smart_bg_enc_config( media_codec_context_t *context, mc_video_smart_bg_enc_params_t *params);
```

**Description**

Get the parameters of smart background encoding.

**Parameter Description**

[IN] context: codec context
[OUT] params: smart background encoding parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_set_smart_bg_enc_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_smart_bg_enc_config( media_codec_context_t *context, const mc_video_smart_bg_enc_params_t *params);
```

**Description**

Set the parameters of smart background encoding.

**Parameter Description**

[IN] context: codec context
[IN] params: smart background encoding parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_get_pred_unit_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_pred_unit_config( media_codec_context_t *context, mc_video_pred_unit_params_t *params);
```

**Description**

Get the intra prediction parameters.

**Parameter Description**

[IN] context: codec context
[OUT] params: intra prediction @see mc_video_pred_unit_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_pred_unit_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_pred_unit_config( media_codec_context_t *context, const mc_video_pred_unit_params_t *params);
```

**Description**

Set the intra prediction parameters.

**Parameter Description**

[IN] context: codec context
[IN] params: intra prediction @see mc_video_pred_unit_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_transform_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_transform_config( media_codec_context_t *context, mc_video_transform_params_t *params);
```

**Description**

Get the transform parameters.

**Parameter Description**

[IN] context: codec context
[OUT] params: transform parameters @see mc_video_transform_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_transform_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_transform_config( media_codec_context_t *context, const mc_video_transform_params_t *params);
```

**Description**

Set the transform parameters.

**Parameter Description**

[IN] context: codec context
[IN] params: transform parameters @see mc_video_transform_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_roi_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_roi_config(media_codec_context_t * context, mc_video_roi_params_t * params);
```

**Description**

Get the ROI parameters.

**Parameter Description**

[IN] context: codec context
[OUT] params: ROI parameters @see mc_video_roi_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_roi_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_roi_config(media_codec_context_t * context, const mc_video_roi_params_t *params);
```

**Description**

Set the ROI parameters.

**Parameter Description**

[IN] context: codec context
[IN] params: ROI parameters @see mc_video_roi_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_roi_avg_qp

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_roi_avg_qp(media_codec_context_t * context, hb_u32 * params);
```

**Description**

Get the ROI average QP.

**Parameter Description**

[IN] context: codec context
[OUT] params: ROI average QP

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_roi_avg_qp

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_roi_avg_qp(media_codec_context_t * context, hb_u32 params);
```

**Description**

Set the ROI average QP.

**Parameter Description**

[IN] context: codec context
[IN] params: ROI average QP [0, 51] 0: using the average qp of QP map.

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_roi_config_ex

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_roi_config_ex(media_codec_context_t *context, hb_u32 roi_idx, mc_video_roi_params_ex_t *params);
```

**Description**

Get the ROI parameters.

**Parameter Description**

[IN] context: codec context
[IN] roi_idx: roi index
[OUT] params: ROI parameters @see mc_video_roi_params_ex_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_roi_config_ex

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_roi_config_ex(media_codec_context_t *context, const mc_video_roi_params_ex_t *params);
```

**Description**

Set the ROI parameters.

**Parameter Description**

[IN] context: codec context
[IN] params: ROI parameters @see mc_video_roi_params_ex_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_INVALID_INSTANCE: Invalid instance

**Compatibility**
HW: Ultra; SW: v1.2.3

### hb_mm_mc_get_mode_decision_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_mode_decision_config( media_codec_context_t *context, mc_video_mode_decision_params_t *params);
```

**Description**

Get the encoding mode decision parameters.

**Parameter Description**

[IN] context: codec context
[OUT] params: mode decision parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_set_mode_decision_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_mode_decision_config( media_codec_context_t *context, const mc_video_mode_decision_params_t *params);
```

**Description**

Set the mode decision parameters.

**Parameter Description**

[IN] context: codec context
[IN] params: mode decision parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Super; SW: v1.2.3

### hb_mm_mc_get_user_data

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_user_data(media_codec_context_t * context, mc_user_data_buffer_t *params, hb_s32 timeout);
```

**Description**

Get the user data parameters.

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_WAIT_TIMEOUT: Wait timeout

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_release_user_data

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_release_user_data(media_codec_context_t * context, const mc_user_data_buffer_t * params);
```

**Description**

Release the user data.

**Parameter Description**

[IN] context: codec context
[OUT] params: user data parameters @see mc_user_data_buffer_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_explicit_header_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_explicit_header_config( media_codec_context_t *context, hb_s32 *status);
```

**Description**

Get explicit header configuration.

**Parameter Description**

[IN] context: codec context
[OUT] status: explicit header configuration The valid numbers are as follows. 0 : Disable, the header will be encoded into independent frame 1 : Enable, the header will be encoded into IDR frame if it exists.

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_explicit_header_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_explicit_header_config( media_codec_context_t *context, hb_s32 status);
```

**Description**

Set explicit header configuration.

**Parameter Description**

[IN] context: codec context
[IN] status: enalbe/diable explicit header, default enable The valid numbers are as follows. 0 : Disable, the header will be encoded into independent frame 1 : Enable, the header will be encoded into IDR frame if it exists.

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_mjpeg_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_mjpeg_config(media_codec_context_t * context, mc_mjpeg_enc_params_t *params);
```

**Description**

Get the mjpeg parameters.

**Parameter Description**

[IN] context: codec context
[OUT] params: mjpeg parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_mjpeg_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_mjpeg_config(media_codec_context_t * context, const mc_mjpeg_enc_params_t *params);
```

**Description**

Set the mjpeg parameters.

**Parameter Description**

[IN] context: codec context
[IN] params: mjpeg parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_jpeg_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_jpeg_config(media_codec_context_t * context, mc_jpeg_enc_params_t *params);
```

**Description**

Get the jpeg parameters.

**Parameter Description**

[IN] context: codec context
[OUT] params: jpeg parameters

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_jpeg_config

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_jpeg_config(media_codec_context_t * context, const mc_jpeg_enc_params_t *params);
```

**Description**

Set the jpeg parameters.

**Parameter Description**

[IN] codec: context
[IN] jpeg: parameters @see mc_jpeg_enc_params_t

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_get_fd

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_get_fd(media_codec_context_t * context, hb_s32 *fd);
```

**Description**

Get device fd. And user can use it to do select operation.

**Parameter Description**

[IN] context: codec context
[OUT] fd: device fd

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_close_fd

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_close_fd(media_codec_context_t * context, hb_s32 fd);
```

**Description**

Close device fd. User must close the fd which is aquired through hb_mm_mc_get_fd.

**Parameter Description**

[IN] context: codec context
[IN] fd: device fd

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_NO_FREE_INSTANCE: No available instance

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_register_audio_encoder

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_register_audio_encoder(hb_s32 *handle, mc_audio_encode_param_t *encoder);
```

**Description**

Register audio encoder. User can use it to register external codec.

**Parameter Description**

[OUT] handle: register handle
[IN] encoder: audio encoder

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_unregister_audio_encoder

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_unregister_audio_encoder(hb_s32 handle);
```

**Description**

Unregister audio encoder. User can use it to unregister codec.

**Parameter Description**

[IN] handle: register handle

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_register_audio_decoder

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_register_audio_decoder(hb_s32 *handle, mc_audio_decode_param_t *decoder);
```

**Description**

Register audio decoder. User can use it to register external codec.

**Parameter Description**

[OUT] handle: register handle
[IN] decoder: audio decoder

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_unregister_audio_decoder

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_unregister_audio_decoder(hb_s32 handle);
```

**Description**

Unregister audio decoder. User can use it to unregister codec.

**Parameter Description**

[IN] handle: register handle

**Return Value**

=0: Success
HB_MEDIA_ERR_UNKNOWN: Unknow error
HB_MEDIA_ERR_INVALID_PARAMS: Invalid parameter
HB_MEDIA_ERR_OPERATION_NOT_ALLOWED: Disallowed operation
HB_MEDIA_ERR_INSUFFICIENT_RES: Insufficient resources

**Compatibility**
HW: XJ3/Ultra/Super; SW: v1.2.3

### hb_mm_mc_set_status

**Function Declaration**

```c
extern hb_s32 hb_mm_mc_set_status(media_codec_context_t *context, mc_user_status_t *status);
```

**Description**



**Return Value**

&gt;=0 on success, negative HB_MEDIA_ERROR in case of failure

## Related Documentation

- [ENCODER API](/Simple_API/multimedia_api/cdev/encoder_api)
- [DECODER API](/Simple_API/multimedia_api/cdev/decoder_api)
- [Capture→Encode](/Demos/multimedia_demo/cdev/vio2encoder)

