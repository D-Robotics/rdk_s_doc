---
title: Object Detection - Ultralytics YOLOv5x (C/C++)
sidebar_position: 1
description: "Pre-installed sample for deploying YOLOv5x with C/C++ for object detection"
---

# Object Detection - Ultralytics YOLOv5x (C/C++)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates how to deploy the quantized Ultralytics YOLOv5x model on the BPU with `C/C++`, run object detection on a single image (preprocessing + inference + NMS + box drawing), and save the result as an image. For the Python version, see [YOLOv5x (Python)](./01_yolov5x_py.md).

The sample code is located in the `/app/cdev_demo/bpu/detection_sample/ultralytics_yolov5x/` directory on the board.

## Prerequisites

- The development board is flashed with RDK OS and logged in via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)).
- The board has a compilation toolchain (`cmake`, `make`, `g++`, pre-installed in the image).
- The pre-installed model is in place: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 corresponds to `s100/basic/`).

## Environment Dependencies

Compilation requires `libgflags-dev`:

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Code Location

On-board path: `/app/cdev_demo/bpu/detection_sample/ultralytics_yolov5x/`

## Build

```bash
cd /app/cdev_demo/bpu/detection_sample/ultralytics_yolov5x
mkdir build && cd build
cmake ..
make -j$(nproc)
```

The build artifact is `build/ultralytics_yolov5x`.

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model-path` | Model file path (.hbm) | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` |
| `--test-img` | Test image path | `/app/res/assets/kite.jpg` |
| `--label-file` | Class labels (COCO 80 classes) | `/app/res/labels/coco_classes.names` |
| `--score-thres` | Confidence threshold (filters out low-score boxes) | `0.25` |
| `--nms-thres` | IoU threshold (NMS) | `0.45` |

## Usage

Run in the `build` directory:

```bash
./ultralytics_yolov5x
```

Run with specified parameters (equivalent to the defaults):

<DocScope products="RDK-S600">

```bash
./ultralytics_yolov5x \
  --model-path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
  --test-img   /app/res/assets/kite.jpg \
  --label-file /app/res/labels/coco_classes.names \
  --score-thres 0.25 \
  --nms-thres 0.45
```

</DocScope>

**Notes**:

- It must be run in the `build` directory. The default paths such as `--test-img` and `--label-file` are given according to the pre-installed directories on the board.
- The detection result image is saved to the relative path `result.jpg` (i.e., `build/result.jpg`). Running it in another directory will make the result image hard to find.
- Before compiling for the first time, install `libgflags-dev` as described in "Environment Dependencies", otherwise `make` will fail.
- The model must be located at the default path (for S600 it is `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`; S100 corresponds to `s100/basic/`). If missing, `--model-path` must be explicitly specified.

## Execution Results

The program loads the model, runs inference and NMS, draws boxes, and saves the result. The following is actual output on RDK S600 (test image `kite.jpg`):

```text
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
[Saved] Result saved to: result.jpg
```

**Success indicator**: `[Saved] Result saved to: result.jpg` appears at the end. `BPULib verison(2, 2, 15)` and `DNN: 3.13.6` indicate that the BPU runtime is loaded properly. Open `build/result.jpg` with an image viewer to see the detection boxes (e.g., the person and the kite in `kite.jpg`).

## Software Notes

Data flow: read image (BGR) → resize to 672×672 → convert to NV12 → BPU inference → decode output heads → NMS deduplication → keep boxes with score≥0.25 → draw boxes and classes on the original image → save. Model input `1x3x672x672`, normalization `data_scale` (scale≈1/255).

## FAQ

- **No boxes visible in `result.jpg`**: Confirm that the test image contains recognizable objects; lower `--score-thres` (e.g., 0.1).
- **`make` fails with `gflags` not found**: `libgflags-dev` is not installed. Install it as described in "Environment Dependencies".
- **Error that the model cannot be found**: Check whether the `.hbm` exists under `--model-path`; the S600 model is in `/opt/hobot/model/s600/basic/`.

## Related Documentation

- [Python version of the YOLOv5x sample](./01_yolov5x_py.md)
- [C/C++ Demo Build Guide](../../04_demo_support/02_c_cpp_build.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [C Inference API](../../../04_Simple_API/02_inference_api/01_c_api.md)
