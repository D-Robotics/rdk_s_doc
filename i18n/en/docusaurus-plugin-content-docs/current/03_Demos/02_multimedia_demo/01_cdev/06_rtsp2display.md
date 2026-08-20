---
title: "RTSP→Display"
sidebar_position: 6
description: "RDK S100/S600 RTSP network pull→decode→Display real-time output example"
---

# RTSP→Display

This example demonstrates pulling a video bitstream from an RTSP network address, decoding it and outputting it to an HDMI display in real time. Pipeline: RTSP → Decoder → Display.

:::tip
The example source code is pre-installed in the `/app/cdev_demo/rtsp2display/` directory on the board, and can be compiled and run directly with `make`.
:::

## Prerequisites

- The development board is flashed with RDK OS and booted (see [Getting Started with RDK](../../../01_Quick_start/02_getting_started.md))
- An HDMI display is connected
- An RTSP bitstream source is available. You can use the pre-installed `live555MediaServer` on the board to push a stream, serving `1080P_test.h264` as an RTSP stream (address `rtsp://127.0.0.1/assets/1080P_test.h264`):

```bash
cd /app/res
sudo chmod +x live555MediaServer
sudo ./live555MediaServer &
```

## Code Location

On-board path: `/app/cdev_demo/rtsp2display/`

```
rtsp2display/
├── Makefile
└── rtsp2display.c
```

## Build and Run

```bash
cd /app/cdev_demo/rtsp2display
make
./rtsp2display -i rtsp://127.0.0.1/assets/1080P_test.h264 -t tcp
```

Parameter description:

| Parameter | Description |
| --- | --- |
| `-i` | RTSP pull stream address |
| `-t` | Transport type, either `tcp` or `udp` |

After the program starts, the decoded RTSP bitstream is displayed on the HDMI display in real time. Press `Ctrl+C` to exit.

## Run Results

Success indicators: the log shows `avformat_open_input ok!` and `sp_open_vps success!`, and the display plays the RTSP bitstream. Runtime log (actual measured):

```text
[UCP]: log level = 3
[UCP]: UCP version = 3.13.6
[VP]: log level = 3
[DNN]: log level = 3
[HPL]: log level = 3
[UCPT]: log level = 6
avformat_open_input ok!
avformat_find_stream_info ok!
Input #0, rtsp, from 'rtsp://127.0.0.1/assets/1080P_test.h264':
  Metadata:
    title           : H.264 Video, streamed by the LIVE555 Media Server
    comment         : assets/1080P_test.h264
  Duration: N/A, start: 0.040000, bitrate: N/A
  Stream #0:0: Video: h264 (High), yuv420p(progressive), 1920x1080 [SAR 1:1 DAR 16:9], 25 fps, 25 tbr, 90k tbn
av_dump_format ok!
rtsp_w:1920,rtsp_h:1080
display_w:1920,dispaly_h:1080
2026/08/14 14:25:42.161 !WARN [sp_start_display][0049]Warning: Using vot_chn values 0-3 is deprecated. Defaulting to HDMI mode.
2026/08/14 14:25:42.161 !WARN [sp_start_display][0050]Please use the new method: pass 10 for DisplayPort (DP) or 11 for HDMI.
2026/08/14 14:25:42.161 !INFO [OpenDisplay][0111]Wayland is available, using Wayland for rendering.
2026/08/14 14:25:42.161 !INFO [init][0572]Using default socket path: /run/user/1000/wayland-0
2026/08/14 14:25:42.257 !INFO [init][0449]Renderer::init completed successfully. SP_OVERLAY_SPACE=image
2026/08/14 14:25:42.257 !INFO [CamInitPymParam][0277]Setting PYM channel:0: crop_x:0, crop_y:0, input_width:1920, input_height:1080, dst_w:1920, dst_h:1080
sp_open_vps success!

recv:2,Stoping...
```

## Code Walkthrough

The example uses ffmpeg (`libavformat`) to pull the stream, plus the Simple API (`sp_codec.h` / `sp_display.h` / `sp_vio.h` / `sp_sys.h`) for decoding and display. Core flow:

1. `avformat_open_input` etc. — open and parse the RTSP bitstream
2. `sp_init_decoder_module` / `sp_init_display_module` / `sp_init_vio_module` — initialize the modules
3. `sp_start_decode` / `sp_start_display` / `sp_open_vps` — start decoding, display and VPS scaling
4. `sp_module_bind` — bind DECODER → VPS → DISPLAY
5. `sp_stop_decode` / `sp_stop_display` / `sp_release_*_module` — release resources

See [DECODER API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md) and [DISPLAY API](../../../04_Simple_API/01_multimedia_api/cdev/04_display_api.md) for interface details.

## FAQ

### Screen corruption with UDP transport

**Cause**: Under UDP transport, network packet loss causes screen corruption.

**Solution**: Switch to TCP transport (`-t tcp`). TCP is more stable but has slightly higher latency.

### `Could not open input file` / Connection refused message

**Cause**: The RTSP address is unreachable, or the port is incorrect.

**Solution**: Confirm the streaming service is running, and adjust the address according to the port information printed by `live555MediaServer`.

## Related Documents

- [Decode→Display](./05_decode2display.md) (local file version)
- [DECODER (Decoder Module) API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md)
- [DISPLAY (Display Module) API](../../../04_Simple_API/01_multimedia_api/cdev/04_display_api.md)
- [C/C++ Demo Programming Guide](../../04_demo_support/02_c_cpp_build.md)
