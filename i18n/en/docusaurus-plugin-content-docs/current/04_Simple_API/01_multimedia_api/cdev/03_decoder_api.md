---
sidebar_position: 3
title: "DECODER (Decoding Module) API"
description: "DECODER (decoding module) API reference"
---

# DECODER (Decoding Module) API

The `DECODER` module provides video stream decoding functionality, supporting `H264`, `H265` and `MJPEG` streams.

- **Interface level**: encapsulated simple API (mode 1). For the low-level MediaCodec, see [MediaCodec API](/Advanced_development/multimedia_development/multimedia_api/mediacodec_api).
- **Applicable scenarios**: decode→display, RTSP stream pull and decode. See [Decode→Display](/Demos/multimedia_demo/cdev/decode2display).
- **Prerequisites**: RDK OS is flashed, a compile toolchain is available on the board, and a stream file or stream data source is available.

The `DECODER` API provides the following interfaces:

| Function | Description |
| ---- | ----- |
| sp_init_decoder_module | **Initialize the decoder module object** |
| sp_release_decoder_module | **Destroy the decoder module object** |
| sp_start_decode | **Create an image decoding channel** |
| sp_stop_decode | **Close an image decoding channel** |
| sp_decoder_get_image | **Retrieve a decoded image frame from the decoding channel** |
| sp_decoder_set_image | **Feed the encoded stream data into the decoding channel** |

## sp_init_decoder_module  

**[Function Prototype]**  

`void *sp_init_decoder_module()`

**[Description]**  

Initializes the decoder module object. It must be called to obtain the operation handle when using the decoder module. Video streams in H264, H265 and MJPEG formats are supported.

**[Parameters]**

None.

**[Return Value]** 

Returns a `DECODER` object on success, and NULL on failure.

## sp_release_decoder_module  

**[Function Prototype]**  

`void sp_release_decoder_module(void *obj)`

**[Description]**  

Destroys the decoder module object.

**[Parameters]**

 - `obj`: the object pointer obtained by calling the initialization interface.

**[Return Value]**  

None

## sp_start_decode  

**[Function Prototype]**  

`int32_t sp_start_decode(void *obj, const char *stream_file, int32_t video_chn, int32_t type, int32_t width, int32_t height)`

**[Description]**  

Creates a decoding channel and sets the channel number, the stream type to decode, and the image frame resolution.

**[Parameters]**

- `obj`: the already initialized `DECODER` object pointer
- `stream_file`: when `stream_file` is set to a stream file name, that stream file will be decoded, e.g. setting the H264 stream file "stream.h264". When `stream_file` is an empty string, the data to decode must be fed in by calling `sp_decoder_set_image`.
- `video_chn`: the decoding channel number. Supports 0~31.
- `type`: the type of data to decode. Supports `SP_ENCODER_H264`, `SP_ENCODER_H265` and `SP_ENCODER_MJPEG`.
- `width`: the resolution - width of the decoded image frame
- `height`: the resolution - height of the decoded image frame

**[Return Value]** 

Returns 0 on success, and -1 on failure

## sp_stop_decode  

**[Function Prototype]**  

`int32_t sp_stop_decode(void *obj)`

**[Description]**  

Closes the decoding channel.

**[Parameters]**

- `obj`: the already initialized `DECODER` object pointer

**[Return Value]** 

Returns 0 on success, and -1 on failure

## sp_decoder_get_image  

**[Function Prototype]**  

`int32_t sp_decoder_get_image(void *obj, char *image_buffer)`

**[Description]**  

Retrieves the decoded image frame data from the decoding channel. The returned image data format is an `NV12` `YUV` image.

**[Parameters]**

- `obj`: the already initialized `DECODER` object pointer
- `image_buffer`: the returned image frame data. The relationship between this buffer size and the image resolution is `(width * height * 3) / 2`.

**[Return Value]** 

Returns 0 on success, and -1 on failure

## sp_decoder_set_image  

**[Function Prototype]**  

`int32_t sp_decoder_set_image(void *obj, char *image_buffer, int32_t chn, int32_t size, int32_t eos)`

**[Description]**  

Feeds stream data into an already opened decoding channel.
When decoding an H264 or H265 stream, you need to feed 3~5 frames of data first so that the decoder finishes its frame buffering before retrieving decoded frame data.
When decoding an H264 stream, the first frame fed to the decoder must be the SPS and PPS description information, otherwise the decoder will report an error and exit.

**[Parameters]**

- `obj`: the already initialized `DECODER` object pointer.
- `image_buffer`: the stream data pointer.
- `chn`: the decoder channel number. It must be a channel number opened by calling `sp_start_decode`.
- `size`: the stream data size.
- `eos`: whether this is the last frame of data.

**[Return Value]** 

Returns 0 on success, and -1 on failure

## Data Structures and Constants

The decoding types reuse the encoding type constants (defined in `sp_codec.h`): `SP_ENCODER_H264` (1), `SP_ENCODER_H265` (2), `SP_ENCODER_MJPEG` (3), used in the `type` parameter of `sp_start_decode`.

## Quick Example

The typical call sequence for decoding a video file (see [Decode→Display](/Demos/multimedia_demo/cdev/decode2display) for a fully compilable example):

```c
void *dec = sp_init_decoder_module();        // 1. Initialize the DECODER object
sp_start_decode(dec, "test.h264", /*video_chn*/0,
                SP_ENCODER_H264, width, height);  // 2. Open the stream file and create the decoding channel
char *img = malloc(FRAME_BUFFER_SIZE(width, height));
sp_decoder_get_image(dec, img);              // 3. Get one decoded image frame (NV12)
// ... use the image data in img (e.g. display/inference) ...
sp_stop_decode(dec);                         // 4. Stop the decoding channel
sp_release_decoder_module(dec);              // 5. Destroy the DECODER object
free(img);
```

## Related Documentation

- [ENCODER API](/Simple_API/multimedia_api/cdev/encoder_api)
- [DISPLAY API](/Simple_API/multimedia_api/cdev/display_api)
- [Decode→Display](/Demos/multimedia_demo/cdev/decode2display)
