---
sidebar_position: 2
title: "MIPI Camera YOLOv5x Inference"
description: "Preset sample for real-time YOLOv5x object detection with a MIPI camera"
---

# MIPI Camera YOLOv5x Inference

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates how to deploy a quantized Ultralytics YOLOv5x model on the BPU, read frames in real time from a MIPI camera (onboard camera interface) for object detection, and visualize the detection results fullscreen (VIO capture + preprocessing + inference + NMS + box drawing). For the Python version, see [MIPI Camera YOLOv5x Inference (Python)](./02_mipi_camera_py.md).

:::tip
The sample code is located at `/app/cdev_demo/bpu/mipi_camera_sample/` on the board. It has been verified on the board and can be compiled and run directly.
:::

## Prerequisites

- The board is flashed with RDK OS and accessible via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- Desktop image (Desktop) is used; the desktop/console display is available.
- A MIPI camera is connected to the onboard camera interface and detected.
- The preset model is in place: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`); if missing, see [Model Acquisition and Placement](../../04_demo_support/01_model_files.md).

## Environment Dependencies

Building requires `libgflags-dev`:

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Hardware Environment

- The MIPI camera interface uses auto-detection mode. Only one MIPI camera can be connected at runtime (any MIPI interface works); connecting multiple cameras at once causes an error.

<DocScope products="RDK-S100">
- For MIPI camera installation, refer to [Camera Expansion Board (RDK S100)](../../../01_Quick_start/01_hardware_introduction/03_expansion_board/01_camera/01_rdk_camera_expansion_board.md).
</DocScope>

<DocScope products="RDK-S600">
- For MIPI camera installation, refer to [MIPI Camera Interface (J11/J13)](../../../01_Quick_start/01_hardware_introduction/02_rdk_s600.md#mipi-camera-interfaces-j11j13).
</DocScope>

## Code Location

Board path: `/app/cdev_demo/bpu/mipi_camera_sample/`

Directory structure:

```text
.
|-- CMakeLists.txt                 # CMake build script: target/dependency/include/link configuration
|-- README.md                      # Usage instructions
|-- inc
|   `-- ultralytics_yolov5x.hpp    # YOLOv5x inference wrapper header: load/preprocess/infer/postprocess interfaces
`-- src
    |-- main.cc                    # Program entry: VIO capture → infer → draw on the Display layer
    `-- ultralytics_yolov5x.cc     # Inference implementation: letterbox, NV12 tensor write, decode, NMS, coordinate restoration
```

## Build

```bash
cd /app/cdev_demo/bpu/mipi_camera_sample
mkdir build && cd build
cmake ..
make -j$(nproc)
```

The build output is `build/mipi_camera`.

## Parameter Reference

| Parameter | Description | Default Value |
|---|---|---|
| `--width` | Sensor original width (for VIO parameters/display scaling) | `1920` |
| `--height` | Sensor original height (for VIO parameters/display scaling) | `1080` |
| `--model_path` | BPU quantized model path (.hbm) | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`) |
| `--label_file` | Class label file (one class name per line) | `/app/res/labels/coco_classes.names` |
| `--score_thres` | Confidence threshold | `0.25` |
| `--nms_thres` | IoU threshold for NMS | `0.45` |

## Usage

In the `build` directory, run with default parameters:

```bash
./mipi_camera
```

Run with explicit parameters (equivalent to the defaults):

<DocScope products="RDK-S600">

```bash
./mipi_camera \
  --width 1920 --height 1080 \
  --model_path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
  --label_file /app/res/labels/coco_classes.names \
  --score_thres 0.25 \
  --nms_thres 0.45
```

</DocScope>

To exit: press `Ctrl+C` on the command line.

## Running Results

The program first initializes the VIO camera, then loads the model for inference and overlays the display. The actual output on this board (no MIPI camera connected) is:

```text
disp_w=1920, disp_h=1080
set camera fps: -1,width: 1920,height: 1080
No camera sensor found, please check whether the camera connection or video_idx is correct.
[OpenCamera] CamInitParam failed error(-1)
[Error] sp_open_camera failed!
```

Indicators of success after connecting a MIPI camera (per the source code `main.cc`):

- Prints `disp_w=..., disp_h=...` and `sp_open_camera success!`;
- The screen displays the real-time frame with detection boxes; press `Ctrl+C` to exit.

<!-- TODO: 待接入摄像头实测成功 log -->

## Software Description

Data flow: VIO initialization and sensor open (NV12 1920×1080) → `sp_vio_get_yuv` capture → NV12 to BGR → letterbox scale to 672×672 → convert to NV12 → BPU inference → decode output head + NMS → draw boxes and classes on the Display layer → real-time display.

## FAQ

- **`No camera sensor found`**: the MIPI camera is not recognized. Check the sensor with `dmesg | grep -i sensor`, and confirm the ribbon cable is properly connected and the camera is detected.
- **`sp_open_camera failed!`**: sensor initialization failed; check the camera connection and power supply.
- **No image displayed**: a desktop/display environment is required.
- **`make` fails with gflags not found**: `libgflags-dev` is not installed; install it per "Environment Dependencies".

## Related Documentation

- [Python MIPI Camera Sample](./02_mipi_camera_py.md)
- [Object Detection - YOLOv5x (C/C++)](../03_detection/01_yolov5x.md)
- [C/C++ Demo Programming Guide](../../04_demo_support/02_c_cpp_build.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)