---
sidebar_position: 1
title: "USB Camera YOLOv5x Inference"
description: "Preset sample for real-time YOLOv5x object detection with a USB camera"
---

# USB Camera YOLOv5x Inference

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates how to deploy a quantized Ultralytics YOLOv5x model on the BPU, read frames in real time from a USB camera for object detection, and visualize the detection results in a fullscreen window (preprocessing + inference + NMS + box drawing). For the Python version, see [USB Camera YOLOv5x Inference (Python)](./01_usb_camera_py.md).

:::tip
The sample code is located at `/app/cdev_demo/bpu/usb_camera_sample/` on the board. It has been verified on the board and can be compiled and run directly.
:::

## Prerequisites

- The board is flashed with RDK OS and accessible via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- Desktop image (Desktop) is used; the desktop/console display is available.
- A USB camera is connected and detected (`ls /dev/video*` shows a device).
- The preset model is in place: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`); if missing, see [Model Acquisition and Placement](../../04_demo_support/01_model_files.md).

## Environment Dependencies

Building requires `libgflags-dev`:

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Code Location

Board path: `/app/cdev_demo/bpu/usb_camera_sample/`

Directory structure:

```text
.
|-- CMakeLists.txt                 # CMake build script: target/dependency/include/link configuration
|-- README.md                      # Usage instructions
|-- inc
|   `-- ultralytics_yolov5x.hpp    # YOLOv5x inference wrapper header: load/preprocess/infer/postprocess interfaces
`-- src
    |-- main.cc                    # Program entry: camera probe → capture → infer → draw → display
    `-- ultralytics_yolov5x.cc     # Inference implementation: letterbox, NV12 tensor write, decode, NMS, box restoration
```

## Build

```bash
cd /app/cdev_demo/bpu/usb_camera_sample
mkdir build && cd build
cmake ..
make -j$(nproc)
```

The build output is `build/usb_camera`.

## Parameter Reference

| Parameter | Description | Default Value |
|---|---|---|
| `--video_device` | Video device (e.g. `/dev/video0`; auto-detected if empty) | `""` (auto-detect the first openable device under `/dev/video*`) |
| `--model_path` | BPU quantized model path (.hbm) | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`) |
| `--label_file` | Class label file (one class name per line) | `/app/res/labels/coco_classes.names` |
| `--score_thres` | Confidence threshold | `0.25` |
| `--nms_thres` | IoU threshold for NMS | `0.45` |

## Usage

In the `build` directory, run with default parameters:

```bash
./usb_camera
```

Run with explicit parameters (equivalent to the defaults):

<DocScope products="RDK-S600">

```bash
./usb_camera \
  --video_device /dev/video0 \
  --model_path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
  --label_file /app/res/labels/coco_classes.names \
  --score_thres 0.25 \
  --nms_thres 0.45
```

</DocScope>

To exit: place the mouse inside the display window and press `q`.

## Running Results

The program first probes for a USB camera, then loads the model for inference and displays the result fullscreen. The actual output on this board (no USB camera connected) is:

```text
./usb_camera
No USB camera found under /dev/video*.
```

Indicators of success after connecting a USB camera (per the source code `main.cc`):

- Prints `Open USB camera successfully`;
- Prints `Place the mouse in the display window and press 'q' to quit`;
- The screen displays the real-time frame with detection boxes fullscreen; press `q` to exit.

<!-- TODO: 待接入摄像头实测成功 log -->

## Software Description

Data flow: probe/open `/dev/video*` (V4L2) → capture BGR frames → letterbox scale to 672×672 → convert to NV12 → BPU inference → decode output head + NMS → keep boxes with score ≥ 0.25 → draw boxes and classes on the frame → display fullscreen.

## FAQ

- **`No USB camera found under /dev/video*.`**: the USB camera is not recognized. Check the USB connection, whether `lsusb` lists the device, whether it is a UVC camera, and confirm the device node with `ls /dev/video*`.
- **No image/black screen**: a desktop environment is required (Desktop image or configured display); the Server version cannot display fullscreen.
- **`make` fails with gflags not found**: `libgflags-dev` is not installed; install it per "Environment Dependencies".
- **Error: model not found**: check whether the `.hbm` file exists under `--model_path`; the S600 model is in `/opt/hobot/model/s600/basic/`.

## Related Documentation

- [Python USB Camera Sample](./01_usb_camera_py.md)
- [Object Detection - YOLOv5x (C/C++)](../03_detection/01_yolov5x.md)
- [C/C++ Demo Programming Guide](../../04_demo_support/02_c_cpp_build.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)