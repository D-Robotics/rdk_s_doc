---
title: Instance Segmentation - Ultralytics YOLO11 (C/C++)
sidebar_position: 1
description: "Pre-installed sample for deploying YOLO11 with C/C++ for instance segmentation"
---

# Instance Segmentation - Ultralytics YOLO11 (C/C++)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates how to deploy the Ultralytics YOLO11 instance segmentation model on the BPU with `C/C++`, run instance segmentation on a single image (preprocessing + inference + mask post-processing), and save the result as an image. For the Python version, see [YOLO11 Segmentation (Python)](./01_yolo11_seg_py.md).

The sample code is located in the `/app/cdev_demo/bpu/instance_segmentation_sample/ultralytics_yolo11_seg/` directory on the board.

## Prerequisites

- The development board is flashed with RDK OS and logged in via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- The board has a compilation toolchain (`cmake`, `make`, `g++`, pre-installed in the image).
- The pre-installed model is in place:
  - S100: `/opt/hobot/model/s100/basic/yolo11n_seg_nashe_640x640_nv12.hbm`
  - S600: `/opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm`

## Environment Dependencies

Compilation requires `libgflags-dev`:

```bash
sudo apt update && sudo apt install libgflags-dev
```

## Code Location

On-board path: `/app/cdev_demo/bpu/instance_segmentation_sample/ultralytics_yolo11_seg/`

:::tip
The code in this directory is pre-installed with the image and verified on the board. You can compile and run it directly.
:::

Directory structure:

```text
.
|-- CMakeLists.txt                 # CMake build script
|-- README.md                      # Project documentation
|-- inc/
|   `-- ultralytics_yolo11_seg.hpp # YOLO11-Seg inference class definition
`-- src/
    |-- main.cc                    # Program entry point
    `-- ultralytics_yolo11_seg.cc  # Inference class implementation
```

## Build

```bash
cd /app/cdev_demo/bpu/instance_segmentation_sample/ultralytics_yolo11_seg
mkdir build && cd build
cmake ..
make -j$(nproc)
```

The build artifact is `build/ultralytics_yolo11_seg`.

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model_path` | Model file path (.hbm) | S600: `/opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm` (S100 corresponds to `s100/basic/`) |
| `--test_img` | Test image path | `/app/res/assets/office_desk.jpg` |
| `--label_file` | Class labels (COCO 80 classes) | `/app/res/labels/coco_classes.names` |
| `--score_thres` | Confidence threshold | `0.25` |
| `--nms_thres` | IoU threshold for NMS | `0.7` |

## Usage

Make sure you are in the `build` directory, then run with default parameters:

```bash
./ultralytics_yolo11_seg
```

Run with specified parameters (equivalent to the defaults):

<DocScope products="RDK-S600">

```bash
./ultralytics_yolo11_seg \
  --model_path /opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm \
  --test_img /app/res/assets/office_desk.jpg \
  --label_file /app/res/labels/coco_classes.names \
  --score_thres 0.25 \
  --nms_thres 0.7
```

</DocScope>

## Execution Results

Actual output on RDK S600 (test image `office_desk.jpg`):

```text
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
pre_process finished
infer finished
post_process finished
[Saved] Result saved to: result.jpg
```

**Success indicator**: `pre_process/infer/post_process finished` appear in sequence, and `[Saved] Result saved to: result.jpg` appears at the end. Open `build/result.jpg` to see the overlaid instance segmentation masks.

## Software Notes

Data flow: read image → resize to 640×640 → convert to NV12 → BPU inference → decode detection head + segmentation head → confidence filtering → NMS → generate instance masks → overlay on the original image → save. Model input `1x3x640x640`, normalization `data_scale`.

## FAQ

- **`make` fails with `gflags` not found**: `libgflags-dev` is not installed. Install it as described in "Environment Dependencies".
- **Masks missing in `result.jpg`**: Confirm that the test image contains recognizable objects; lower `--score_thres`.
- **Error that the model cannot be found**: Check `--model_path`; the S600 model is in `/opt/hobot/model/s600/basic/`.

## Related Documentation

- [Python version of the YOLO11 segmentation sample](./01_yolo11_seg_py.md)
- [Object Detection - YOLO11 (C/C++)](../03_detection/02_yolo11.md)
- [C/C++ Demo Build Guide](../../04_demo_support/02_c_cpp_build.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [C Inference API](../../../04_Simple_API/02_inference_api/01_c_api.md)
