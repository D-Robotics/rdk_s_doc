---
title: Pose Estimation - Ultralytics YOLO11 (Python)
sidebar_position: 2
description: "Pre-installed example of deploying YOLO11 for human pose estimation with the hbm_runtime Python interface"
---

# Pose Estimation - Ultralytics YOLO11 (Python)

This example demonstrates how to deploy the Ultralytics YOLO11 pose estimation model on the BPU with the `hbm_runtime` Python interface, perform person detection + keypoint estimation on an image, and draw the skeleton onto the image and save it. This example uses the `yolo11n-pose` (nano) version.

The example code is located in the `/app/pydev_demo/pose_sample/ultralytics_yolo11_pose/` directory on the board.

## Prerequisites

- The development board is flashed with RDK OS and logged in via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- The pre-installed models are in place:
  - S100: `/opt/hobot/model/s100/basic/yolo11n_pose_nashe_640x640_nv12.hbm`
  - S600: `/opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm`
- The Python environment and `hbm_runtime` are pre-installed with the image.

## Code Location

Path on the board: `/app/pydev_demo/pose_sample/ultralytics_yolo11_pose/`

:::tip
The code in this directory is pre-installed with the image and verified on the board; it can be run directly.
:::

Directory structure:

```text
.
├── ultralytics_yolo11_pose.py   # Main inference script
└── README.md                    # Usage instructions
```

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model-path` | Model file path (.hbm) | S600: `/opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm` (S100 uses `s100/basic/`) |
| `--test-img` | Test image path | `/app/res/assets/bus.jpg` |
| `--label-file` | Class labels (COCO 80 classes) | `/app/res/labels/coco_classes.names` |
| `--img-save-path` | Save path for the output result image | `result.jpg` |
| `--priority` | Model scheduling priority (0~255) | `0` |
| `--bpu-cores` | List of BPU core IDs to use (e.g. `--bpu-cores 0 1`) | `[0]` |
| `--nms-thres` | NMS IoU threshold | `0.7` |
| `--score-thres` | Confidence threshold | `0.25` |
| `--kpt-conf-thres` | Confidence threshold for keypoint visualization | `0.5` |

## Usage

```bash
cd /app/pydev_demo/pose_sample/ultralytics_yolo11_pose
python ultralytics_yolo11_pose.py
```

After a successful run, the person bounding boxes and keypoint skeleton are drawn on the original image and saved as `result.jpg`.

## Execution Results

The following is actual output on RDK S600 (test image `bus.jpg`):

```text
Model Description:
 - yolo11n_pose_nashp_640x640_nv12_debug: {"MARCH": "nash-p",
   "INPUT_SHAPE": "1x3x640x640", "INPUT_TYPE_RT": "nv12",
   "NORM_TYPE": "data_scale", "SCALE_VALUE": "[0.003921568627451]", ...}

=== Scheduling Parameters ===
yolo11n_pose_nashp_640x640_nv12_debug:
  priority    : 0
  bpu_cores   : [0]
  deviceId    : 0

[Saved] Result saved to: result.jpg
```

**Success indicators**: `[Saved] Result saved to: result.jpg` appears at the end. Open `result.jpg` to see the person bounding boxes and keypoint skeleton (the persons in `bus.jpg`).

## Software Notes

Data flow: read image → resize to 640×640 → convert to NV12 → BPU inference → decode detection head + keypoint head → confidence filtering (score≥0.25) → NMS (IoU 0.7) → draw person boxes and keypoint skeleton → save. The model input is `1x3x640x640`, with `data_scale` normalization (scale≈1/255).

## FAQ

- **No skeleton visible in `result.jpg`**: Make sure the image contains clearly recognizable persons; lower `--score-thres` or `--kpt-conf-thres`.
- **Model not found error**: Check `--model-path`; the S600 models are in `/opt/hobot/model/s600/basic/`.
- **`No module named 'utils'` error**: The script must be run inside the example directory (it depends on the parent-level `utils`).

## Related Documentation

- [YOLO11 Pose Example (C/C++)](./01_yolo11_pose.md)
- [Object Detection - YOLO11 (Python)](../03_detection/02_yolo11_py.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [Python Inference API](../../../04_Simple_API/02_inference_api/02_python_api.md)
