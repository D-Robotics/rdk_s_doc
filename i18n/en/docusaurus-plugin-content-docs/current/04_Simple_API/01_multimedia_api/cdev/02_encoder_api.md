---
sidebar_position: 2
title: "ENCODER (Encoding Module) API"
description: "ENCODER (encoding module) API reference"
---

# ENCODER (Encoding Module) API

The `ENCODER` module provides image encoding functionality, supporting `H264`, `H265` and `MJPEG` encoding.

- **Interface level**: encapsulated simple API (mode 1). For the low-level MediaCodec, see [MediaCodec API](/Advanced_development/multimedia_development/multimedia_api/mediacodec_api).
- **Applicable scenarios**: capture→encode and save. See [Capture→Encode](/Demos/multimedia_demo/cdev/vio2encoder).
- **Prerequisites**: RDK OS is flashed, a compile toolchain is available on the board, and a MIPI camera can be connected or image frame data is available.

The `ENCODER` API provides the following interfaces:

| Function | Description |
| ---- | ----- |
| sp_init_encoder_module | **Initialize the encoder module object** |
| sp_release_encoder_module | **Destroy the encoder module object** |
| sp_start_encode | **Create an image encoding channel** |
| sp_stop_encode | **Close an image encoding channel** |
| sp_encoder_set_frame | **Feed an image frame into the encoding channel** |
| sp_encoder_get_stream | **Retrieve the encoded bitstream from the encoding channel** |

:::warning Note

The image to be encoded requires 16-bit alignment on RDK X5, while RDK X3 allows 8/16-bit alignment.

:::

## sp_init_encoder_module  

**[Function Prototype]**  

`void *sp_init_encoder_module()`

**[Description]**  

Initializes the encoder module object. It must be called to obtain the operation handle when using the encoder module.

**[Parameters]**

None

**[Return Value]**  

Returns an `ENCODER` object pointer on success, and `NULL` on failure.

## sp_release_encoder_module  

**[Function Prototype]**  

`void sp_release_encoder_module(void *obj)`

**[Description]**  

Destroys the encoder module object.

**[Parameters]**

 - `obj`: the object pointer obtained by calling the initialization interface.

**[Return Value]**  

None

## sp_start_encode  

**[Function Prototype]**  

`int32_t sp_start_encode(void *obj, int32_t chn, int32_t type, int32_t width, int32_t height, int32_t bits)`

**[Description]**  

Creates one image encoding channel. Up to `32` channels can be created, and the supported encoding types are `H264`, `H265` and `MJPEG`.

**[Parameters]**

- `obj`: the already initialized `ENCODER` object pointer
- `chn`: the encoding channel number to create. Supports 0 ~ 31
- `type`: the image encoding type. Supports `SP_ENCODER_H264`, `SP_ENCODER_H265` and `SP_ENCODER_MJPEG`.
- `width`: the resolution-width of the image data fed to the encoding channel
- `height`: the resolution-height of the image data fed to the encoding channel
- `bits`: the encoding bitrate. Common values are bitrates such as 512, 1024, 2048, 4096, 8192, 16384 (unit: Mbps). Other values are also allowed; the higher the bitrate, the sharper the encoded image, the smaller the compression ratio, and the larger the stream data.

**[Return Value]**  

Returns 0 on success, and -1 on failure

## sp_stop_encode  

**[Function Prototype]**  

`int32_t sp_stop_encode(void *obj)`

**[Description]**  

Closes an opened encoding channel.

**[Parameters]**

- `obj`: the already initialized `ENCODER` object pointer

**[Return Value]** 

Returns 0 on success, and -1 on failure

## sp_encoder_set_frame  

**[Function Prototype]**  

`int32_t sp_encoder_set_frame(void *obj, char *frame_buffer, int32_t size)`

**[Description]**  

Feeds the image frame data to be encoded into the encoding channel. The format must be `NV12`.

**[Parameters]**

- `obj`: the already initialized `ENCODER` object pointer
- `frame_buffer`: the image frame data to be encoded. It must be in `NV12` format, and its resolution must match the image frame resolution used when calling the `sp_start_encode` interface.
- `size`: the image frame data size. The size of an image in `NV12` format is computed by `(width * height * 3) / 2`.

**[Return Value]** 

Returns 0 on success, and -1 on failure

## sp_encoder_get_stream  

**[Function Prototype]**  

`int32_t sp_encoder_get_stream(void *obj, char *stream_buffer)`

**[Description]**  

Retrieves the encoded bitstream data from the encoding channel.

**[Parameters]**

- `obj`: the already initialized `ENCODER` object pointer
- `stream_buffer`: on successful retrieval, the bitstream data is stored in this buffer. The size of this buffer must be adjusted according to the encoding resolution and bitrate.

**[Return Value]** 

Returns the size of the bitstream data on success, and -1 on failure

## Data Structures and Constants

The following constants are defined in `sp_codec.h`:

| Constant | Value | Description |
| ---- | --- | ---- |
| `SP_ENCODER_H264` | 1 | Encoding type: H.264 |
| `SP_ENCODER_H265` | 2 | Encoding type: H.265 |
| `SP_ENCODER_MJPEG` | 3 | Encoding type: MJPEG |

## Quick Example

The typical call sequence for encoding one frame (see [Capture→Encode](/Demos/multimedia_demo/cdev/vio2encoder) for a fully compilable example):

```c
void *enc = sp_init_encoder_module();        // 1. Initialize the ENCODER object
sp_start_encode(enc, /*chn*/0, SP_ENCODER_H264,
                width, height, /*bits*/4096);// 2. Create the encoding channel
sp_encoder_set_frame(enc, frame_buffer, size);  // 3. Feed in one image frame
char *stream = malloc(stream_buf_size);
sp_encoder_get_stream(enc, stream);          // 4. Retrieve the encoded bitstream
// ... write to a file or further process stream ...
sp_stop_encode(enc);                         // 5. Stop the encoding channel
sp_release_encoder_module(enc);              // 6. Destroy the ENCODER object
free(stream);
```

## Related Documents

- [VIO API](/Simple_API/multimedia_api/cdev/vio_api)
- [DECODER API](/Simple_API/multimedia_api/cdev/decoder_api)
- [Capture→Encode](/Demos/multimedia_demo/cdev/vio2encoder)
