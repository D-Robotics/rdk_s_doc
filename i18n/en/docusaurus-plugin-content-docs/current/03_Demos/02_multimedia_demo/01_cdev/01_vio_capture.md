---
sidebar_position: 1
title: "Video Capture"
description: "RDK S100/S600 camera capture→save RAW/YUV to local files example"
---

# Video Capture

This example demonstrates capturing images from a MIPI camera via VIO and saving images in both RAW and YUV formats to local files. Pipeline: Camera → VIO → File.

:::tip
The example source code is pre-installed in the `/app/cdev_demo/vio_capture/` directory on the board, and can be compiled and run directly with `make`.
:::

## Prerequisites

- The development board is flashed with RDK OS and booted (see [Getting Started with RDK](../../../01_Quick_start/02_getting_started.md))
- A MIPI camera is connected (see [Using MIPI Camera](../../01_peripheral/02_camera/01_mipi_camera.md))

## Code Location

On-board path: `/app/cdev_demo/vio_capture/`

```
vio_capture/
├── Makefile
└── capture.c
```

## Build and Run

```bash
cd /app/cdev_demo/vio_capture
make
./capture -b 10 -c 10 -w 1920 -h 1080
```

Parameter description:

| Parameter | Description |
| --- | --- |
| `-w` / `-h` | Sensor output width / height |
| `-b` | RAW image bit depth, usually 10 (IMX219), 12 for IMX477 |
| `-c` | Number of frames to capture |
| `-f` | Sensor frame rate (optional, auto-detected by default) |

## Run Results

After the program runs, it generates `2 × count` files in the current directory: `yuv_0.yuv`, `yuv_1.yuv`… (YUV format) and `raw_0.raw`, `raw_1.raw`… (RAW format). During execution the capture progress is printed frame by frame:

```text
capture time :0
capture time :1
...
capture time :9
```

Troubleshooting failure: when no camera is connected, the program prints `[Error] sp_open_camera failed!` and exits.

## FAQ

### `sp_open_camera failed` message

**Cause**: No MIPI camera is connected, or camera initialization failed.

**Solution**: Power off the board, reconnect the camera, and retry after confirming that the sensor model is supported.

## Related Documentation

- [Python Multimedia Examples](../02_pydev/01_pydev_multimedia.md)
- [VIO (Video Input) API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md)
- [Capture→Display](./02_vio2display.md)
- [C/C++ Demo Programming Guide](../../04_demo_support/02_c_cpp_build.md)
