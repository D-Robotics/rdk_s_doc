---
title: "Capture→Display"
sidebar_position: 2
description: "RDK S100/S600 camera capture→VIO→Display real-time preview example"
---

# Capture→Display

This example demonstrates capturing the camera image via VIO and outputting it to an HDMI display in real time. It is the most basic pipeline of the multimedia path: Camera → VIO → Display.

:::tip
The example source code is pre-installed in the `/app/cdev_demo/vio2display/` directory on the board, and can be compiled and run directly with `make`.
:::

## Prerequisites

- The development board is flashed with RDK OS and booted (see [Getting Started with RDK](../../../01_Quick_start/02_getting_started.md))
- A MIPI camera is connected (see [Using MIPI Camera](../../01_peripheral/02_camera/01_mipi_camera.md))
- An HDMI display is connected

## Code Location

On-board path: `/app/cdev_demo/vio2display/`

```
vio2display/
├── Makefile
└── vio2display.c
```

## Build and Run

```bash
cd /app/cdev_demo/vio2display
make
./vio2display -w 1920 -h 1080
```

Parameter description:

| Parameter | Description |
| --- | --- |
| `-w` | Sensor output width |
| `-h` | Sensor output height |

After the program starts, the camera image is displayed on the HDMI display in real time. Type `q` in the terminal and press Enter to exit.

## Run Results

Success indicators: the camera image is displayed on the display in real time, the log shows `sp_open_camera success!`, followed by `Press 'q' to Exit !` waiting for exit.

Troubleshooting failure (no camera connected, actual measured output):

```text
[UCP]: log level = 3
[UCP]: UCP version = 3.13.6
[VP]: log level = 3
[DNN]: log level = 3
[HPL]: log level = 3
[UCPT]: log level = 6
disp_w=1920, disp_h=1080
2026/08/14 14:25:48.963 !INFO [CamInitParam][0314]set camera fps: -1,width: 1920,height: 1080
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@4 i2c bus: 4 mipi rx phy: 4
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@5 i2c bus: 5 mipi rx phy: 5
2026/08/14 14:25:48.966 ERROR [CamInitParam][0336]No camera sensor found, please check whether the camera connection or video_idx is correct.
2026/08/14 14:25:48.966 ERROR [OpenCamera][0433]CamInitParam failed error(-1)
[Error] sp_open_camera failed!
```

## Code Walkthrough

The example uses the Simple API (`sp_vio.h` / `sp_display.h` / `sp_sys.h`). Core flow:

1. `sp_init_vio_module` — initialize the VIO module
2. `sp_open_camera_v2` — open the camera capture channel
3. `sp_init_display_module` + `sp_start_display` — initialize and start the display
4. `sp_module_bind` — bind capture to display (VIO → DISPLAY)
5. `sp_vio_close` / `sp_stop_display` / `sp_release_*_module` — release resources

See [VIO API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) and [DISPLAY API](../../../04_Simple_API/01_multimedia_api/cdev/04_display_api.md) for interface details.

## FAQ

### `sp_open_camera failed` message

**Cause**: No MIPI camera is connected, or sensor initialization failed.

**Solution**: Power off the board, reconnect the camera, and retry after confirming that the sensor model is supported.

## Related Documents

- [Video Capture](./01_vio_capture.md)
- [Using MIPI Camera](../../01_peripheral/02_camera/01_mipi_camera.md)
- [VIO (Video Input) API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md)
- [DISPLAY (Display Module) API](../../../04_Simple_API/01_multimedia_api/cdev/04_display_api.md)
- [C/C++ Demo Programming Guide](../../04_demo_support/02_c_cpp_build.md)
