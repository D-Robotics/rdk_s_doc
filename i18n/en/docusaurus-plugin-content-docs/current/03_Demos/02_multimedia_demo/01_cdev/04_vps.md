---
title: "Video Processing"
sidebar_position: 4
description: "RDK S100/S600 VPS video processing example (file/decode input→scale→output)"
---

# Video Processing

This example demonstrates scaling images via VPS (Video Process Subsystem). Two input modes are supported: YUV file input and H.264 bitstream decode input.

:::tip
The example source code is pre-installed in the `/app/cdev_demo/vps/` directory on the board, and can be compiled and run directly with `make`.
:::

## Prerequisites

- The development board is flashed with RDK OS and booted (see [Getting Started with RDK](../../../01_Quick_start/02_getting_started.md))
- The example ships with test data: `input_1080p.h264`, `input_1080p.yuv`

## Code Location

On-board path: `/app/cdev_demo/vps/`

```
vps/
├── Makefile
├── vps.c
├── input_1080p.h264    # test H.264 bitstream
└── input_1080p.yuv     # test YUV data
```

## Build and Run

```bash
cd /app/cdev_demo/vps
make
```

Mode 1: bitstream decode input (H.264 → decode → VPS scale → output YUV file)

```bash
./vps -m 1 -i input_1080p.h264 -o output.yuv \
  --iheight 1080 --iwidth 1920 --oheight 720 --owidth 1280
```

Mode 2: YUV file input (YUV → VPS scale → output YUV file)

```bash
./vps -m 2 -i input_1080p.yuv -o output.yuv \
  --iheight 1080 --iwidth 1920 --oheight 720 --owidth 1280
```

Parameter description:

| Parameter | Description |
| --- | --- |
| `-m` | Input mode: 1=bitstream (H.264), 2=file (YUV) |
| `-i` | Input file path |
| `-o` | Output file path |
| `--iwidth` / `--iheight` | Input width / height |
| `--owidth` / `--oheight` | Output width / height (scale target) |
| `--skip` | Number of frames to skip in bitstream mode (optional) |

## Run Results

After the program runs, the scaled YUV file is generated (the example scales 1920×1080 to 1280×720). The output log is as follows (actual measured):

```text
[UCP]: log level = 3
[UCP]: UCP version = 3.13.6
[VP]: log level = 3
[DNN]: log level = 3
[HPL]: log level = 3
[UCPT]: log level = 6
2026/08/14 14:24:34.807 !INFO [CamInitPymParam][0277]Setting PYM channel:0: crop_x:0, crop_y:0, input_width:1920, input_height:1080, dst_w:1280, dst_h:720
```

Success indicators: `output.yuv` is generated in the current directory (at 1280×720 size it is 1382400 bytes). In mode 1 `origin.yuv` (the raw first decoded frame) is additionally generated.

You can preview the result with `ffplay -f rawvideo -pixel_format yuv420p -video_size 1280x720 output.yuv`.

## Code Walkthrough

The example uses the Simple API (`sp_vio.h` / `sp_codec.h` / `sp_sys.h`). Core flow:

1. Mode 1 (bitstream): `sp_init_decoder_module` + `sp_start_decode` start decoding, and `sp_decoder_get_image` fetches decoded frames
2. Mode 2 (file): read the YUV file directly
3. `sp_open_vps` (`SP_VPS_SCALE`) — open the VPS scale channel
4. `sp_vio_set_frame` feeds an image in → `sp_vio_get_frame` fetches the scaled image
5. Write the output file and release resources

See [VIO API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) and [DECODER API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md) for interface details.

## FAQ

### `file2vps` / `decoder2vps` error message

**Cause**: The input file path does not exist, or the input resolution does not match the actual data.

**Solution**: Confirm the input file exists and that `--iwidth` / `--iheight` match the resolution of the input data.

## Related Documentation

- [Python Multimedia Examples](../02_pydev/01_pydev_multimedia.md)
- [Video Capture](./01_vio_capture.md)
- [VIO (Video Input) API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md)
- [DECODER (Decoder Module) API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md)
- [C/C++ Demo Programming Guide](../../04_demo_support/02_c_cpp_build.md)
