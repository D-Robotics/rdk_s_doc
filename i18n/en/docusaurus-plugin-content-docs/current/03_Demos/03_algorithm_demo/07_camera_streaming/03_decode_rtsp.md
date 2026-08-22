---
sidebar_position: 3
title: "RTSP Stream Pull and YOLOv5x Inference"
description: "Preset sample for pulling an RTSP stream, decoding it and performing real-time YOLOv5x object detection"
---

# RTSP Stream Pull and YOLOv5x Inference

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates the end-to-end pipeline of combining SP hardware modules (decoder, VIO, display) with the BPU: RTSP/H.264 video stream → hardware decode (NV12) → YOLOv5x inference → detection boxes overlay → real-time display. For the Python version, see [RTSP Stream Pull and YOLOv5x Inference (Python)](./03_decode_rtsp_py.md).

:::tip
The sample code is located at `/app/cdev_demo/bpu/rtsp_yolov5x_display_sample/` on the board. It has been verified on the board and can be compiled and run directly.
:::

## Prerequisites

- The board is flashed with RDK OS and accessible via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- Desktop image (Desktop) is used; the desktop/console display is available.
- An accessible RTSP stream address (e.g. `rtsp://<ip>/<stream>`).
- The preset model is in place: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`); if missing, see [Model Acquisition and Placement](../../04_demo_support/01_model_files.md).

## Environment Dependencies

Building requires `libgflags-dev` and the FFmpeg development libraries:

```bash
sudo apt update
sudo apt install libgflags-dev libavformat-dev libavcodec-dev libavutil-dev
```

## Code Location

Board path: `/app/cdev_demo/bpu/rtsp_yolov5x_display_sample/`

Directory structure:

```text
.
|-- CMakeLists.txt                 # CMake build script
|-- README.md                      # Usage instructions
|-- inc
|   `-- ultralytics_yolov5x.hpp    # YOLOv5x wrapper header file
`-- src
    |-- main.cc                    # Main program entry: RTSP decode → YOLOv5x inference → display
    `-- ultralytics_yolov5x.cc     # YOLOv5x implementation: preprocessing/inference/postprocessing/NMS
```

## Build

```bash
cd /app/cdev_demo/bpu/rtsp_yolov5x_display_sample
mkdir build && cd build
cmake ..
make -j$(nproc)
```

The build output is `build/rtsp_yolov5x_display`.

## Parameter Reference

| Parameter | Description | Default Value |
|---|---|---|
| `--rtsp_url` | RTSP stream URL | `rtsp://127.0.0.1/assets/1080P_test.h264` |
| `--transfer_type` | RTSP transfer type (tcp/udp) | `tcp` |
| `--model_path` | YOLOv5x quantized BPU model path (.hbm) | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`) |
| `--label_file` | Class name file (one class name per line) | `/app/res/labels/coco_classes.names` |
| `--score_thres` | Confidence threshold (filters low-score detection boxes) | `0.25` |
| `--nms_thres` | IoU threshold for NMS | `0.45` |

## Usage

First prepare the RTSP stream. Use the preset streaming service on the system to serve the `1080P_test.h264` video file as an RTSP stream (URL `rtsp://127.0.0.1/assets/1080P_test.h264`):

```bash
cd /app/res
sudo chmod +x live555MediaServer
sudo ./live555MediaServer &
```

In the `build` directory, run with default parameters:

```bash
./rtsp_yolov5x_display
```

Run with explicit parameters (equivalent to the defaults):

<DocScope products="RDK-S600">

```bash
./rtsp_yolov5x_display \
  --rtsp_url rtsp://127.0.0.1/assets/1080P_test.h264 \
  --transfer_type tcp \
  --model_path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
  --label_file /app/res/labels/coco_classes.names \
  --score_thres 0.25 \
  --nms_thres 0.45
```

</DocScope>

To exit: press `Ctrl+C` on the command line.

## Running Results

The following is the actual output measured on RDK S600 (live555 streaming + default parameters):

```text
./rtsp_yolov5x_display
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
rtsp_w:1920, rtsp_h:1080, display_w:1920, display_h:1080
```

**Indicators of success**: `rtsp_w:1920, rtsp_h:1080` means the RTSP stream was opened successfully and the resolution parsed; `BPULib verison(2, 2, 15)` and `DNN: 3.13.6` mean the BPU runtime loaded normally. The screen displays the real-time frame with detection boxes.

## Software Description

Data flow: FFmpeg initializes the network stack and opens the RTSP stream (`avformat_network_init`/`avformat_open_input`) → SP hardware decode (`sp_start_decode`/`sp_decoder_get_image`) captures NV12 frames → NV12 to BGR → letterbox scale → BPU inference → NMS → draw detection boxes on the Display layer (`draw_detections_on_disp`); if the display resolution does not match the stream resolution, an SP VPS scaling pipeline is inserted automatically.

## FAQ

- **Stream pull failure/timeout**: confirm the RTSP address is reachable and the network works; verify the stream with `ffprobe rtsp://...` or VLC; live555 must be started in the `/app/res` directory.
- **`No video stream found`**: the stream has no video track; check the streaming source.
- **No image displayed**: a display environment is required; confirm the `--rtsp_url` resolution matches the display, otherwise VPS scaling is needed.
- **Error: model not found**: check whether the `.hbm` file exists under `--model_path`.

## Related Documentation

- [Python RTSP Sample](./03_decode_rtsp_py.md)
- [Object Detection - YOLOv5x (C/C++)](../03_detection/01_yolov5x.md)
- [C/C++ Demo Programming Guide](../../04_demo_support/02_c_cpp_build.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)