---
title: "Capture→Encode"
sidebar_position: 3
description: "RDK S100/S600 camera capture→VIO→encode and save example"
---

# Capture→Encode

This example demonstrates capturing the camera image via VIO, encoding it into an H.264 stream in real time and saving it to a file. Pipeline: Camera → VIO → Encoder → File.

:::tip
The example source code is pre-installed in the `/app/cdev_demo/vio2encoder/` directory on the board, and can be compiled and run directly with `make`.
:::

## Prerequisites

- The development board is flashed with RDK OS and booted (see [Getting Started with RDK](../../../01_Quick_start/02_getting_started.md))
- A MIPI camera is connected (see [Using MIPI Camera](../../01_peripheral/02_camera/01_mipi_camera.md))
- Writable storage space is available (used for saving the encoded output file)

## Code Location

On-board path: `/app/cdev_demo/vio2encoder/`

```
vio2encoder/
├── Makefile
└── vio2encoder.c
```

## Build and Run

```bash
cd /app/cdev_demo/vio2encoder
make
./vio2encoder -w 1920 -h 1080 --iwidth 1920 --iheight 1080 -o stream.h264
```

Parameter description:

| Parameter | Description |
| --- | --- |
| `-w` / `-h` | Encoded output video width / height |
| `--iwidth` / `--iheight` | Sensor output width / height |
| `-o` | Encoded output file path |
| `-f` | Sensor frame rate (optional, auto-detected by default) |

The program keeps encoding until you press `Ctrl+C` to stop. In this example the encode format is fixed to H.264.

## Run Results

Success indicators: the log shows `sp_open_camera success!`, `sp_start_encode success!` and `sp_module_bind(vio -> encoder) success!` in sequence; after pressing `Ctrl+C` it prints `recv:2,Stoping...` and generates the `stream.h264` file.

Troubleshooting failure: when no camera is connected, the program prints `[Error] sp_open_camera failed!` and exits.

## Code Walkthrough

The example uses the Simple API (`sp_vio.h` / `sp_codec.h` / `sp_sys.h`). Core flow:

1. `sp_init_vio_module` / `sp_init_encoder_module` — initialize the VIO and encoder modules
2. `sp_open_camera_v2` — open the camera capture channel
3. `sp_start_encode` (`SP_ENCODER_H264`) — start H.264 encoding
4. `sp_module_bind` — bind capture to encoding (VIO → ENCODER)
5. Loop `sp_encoder_get_stream` — fetch the bitstream and write it to the file
6. `sp_module_unbind` / `sp_stop_encode` / `sp_vio_close` — stop and release resources

See [VIO API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) and [ENCODER API](../../../04_Simple_API/01_multimedia_api/cdev/02_encoder_api.md) for interface details.

## FAQ

### `sp_open_camera failed` message

**Cause**: No MIPI camera is connected, or sensor initialization failed.

**Solution**: Power off the board, reconnect the camera, and retry after confirming that the sensor model is supported.

## Related Documentation

- [Video Capture](./01_vio_capture.md)
- [VIO (Video Input) API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md)
- [ENCODER (Encoder Module) API](../../../04_Simple_API/01_multimedia_api/cdev/02_encoder_api.md)
- [C/C++ Demo Programming Guide](../../04_demo_support/02_c_cpp_build.md)
