---
title: Pose Estimation - Ultralytics YOLO11 (C/C++)
sidebar_position: 1
description: "Pre-installed example of deploying YOLO11 for human pose estimation with C/C++"
---

# Pose Estimation - Ultralytics YOLO11 (C/C++)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This example demonstrates how to deploy the Ultralytics YOLO11 pose estimation model on the BPU with `C/C++`, perform person detection + keypoint estimation on an image, and draw the skeleton onto the image and save it. For the Python version, see [YOLO11 Pose (Python)](./01_yolo11_pose_py.md).

The example code is located in the `/app/cdev_demo/bpu/pose_sample/ultralytics_yolo11_pose/` directory on the board.

## Prerequisites

- The development board is flashed with RDK OS and logged in via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- The compilation toolchain is available on the board (`cmake`, `make`, `g++`, pre-installed in the image).
- The pre-installed models are in place:
  - S100: `/opt/hobot/model/s100/basic/yolo11n_pose_nashe_640x640_nv12.hbm`
  - S600: `/opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm`

## Environment Dependencies

Compilation requires `libgflags-dev`:

```bash
sudo apt update && sudo apt install libgflags-dev
```

## Code Location

Path on the board: `/app/cdev_demo/bpu/pose_sample/ultralytics_yolo11_pose/`

:::tip
The code in this directory is pre-installed with the image and verified on the board; it can be compiled and run directly.
:::

Directory structure:

```text
.
|-- CMakeLists.txt                     # CMake build script
|-- README.md                          # Project description
|-- inc/
|   `-- ultralytics_yolo11_pose.hpp    # YOLO11-Pose inference class definition
`-- src/
    |-- main.cc                        # Program entry point
    `-- ultralytics_yolo11_pose.cc     # Inference class implementation
```

## Build

```bash
cd /app/cdev_demo/bpu/pose_sample/ultralytics_yolo11_pose
mkdir build && cd build
cmake ..
make -j$(nproc)
```

The build output is `build/ultralytics_yolo11_pose`.

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model_path` | Model file path (.hbm) | S600: `/opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm` (S100 uses `s100/basic/`) |
| `--test_img` | Test image path | `/app/res/assets/bus.jpg` |
| `--label_file` | Class labels (COCO 80 classes) | `/app/res/labels/coco_classes.names` |
| `--score_thres` | Confidence threshold | `0.25` |
| `--nms_thres` | NMS IoU threshold | `0.7` |
| `--kpt_conf_thres` | Confidence threshold for keypoint visualization | `0.5` |

## Usage

Make sure you are in the `build` directory and run with default parameters:

```bash
./ultralytics_yolo11_pose
```

Run with explicit parameters (equivalent to the defaults):

<DocScope products="RDK S600">

```bash
./ultralytics_yolo11_pose \
  --model_path /opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm \
  --test_img /app/res/assets/bus.jpg \
  --label_file /app/res/labels/coco_classes.names \
  --score_thres 0.25 \
  --nms_thres 0.7 \
  --kpt_conf_thres 0.5
```

</DocScope>

## Execution Results

Actual output on RDK S600 (test image `bus.jpg`):

```text
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
[Saved] Result saved to: result.jpg
```

**Success indicators**: `[Saved] Result saved to: result.jpg` appears at the end; `BPULib verison(2, 2, 15)` and `DNN: 3.13.6` indicate the BPU runtime is working normally. Open `build/result.jpg` to see the person bounding boxes and keypoint skeleton.

## Software Notes

Data flow: read image → resize to 640×640 → convert to NV12 → BPU inference → decode detection head + keypoint head → confidence filtering → NMS → draw person boxes and skeleton → save. The model input is `1x3x640x640`, with `data_scale` normalization.

## FAQ

- **`make` reports `gflags` not found**: `libgflags-dev` is not installed; install it as described in "Environment Dependencies".
- **No skeleton visible in `result.jpg`**: Make sure the image contains clear persons; lower `--score_thres` or `--kpt_conf_thres`.
- **Model not found error**: Check `--model_path`; the S600 models are in `/opt/hobot/model/s600/basic/`.

## Related Documentation

- [YOLO11 Pose Example (Python)](./01_yolo11_pose_py.md)
- [Object Detection - YOLO11 (C/C++)](../03_detection/02_yolo11.md)
- [C/C++ Demo Build Guide](../../04_demo_support/02_c_cpp_build.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [C Inference API](../../../04_Simple_API/02_inference_api/01_c_api.md)
