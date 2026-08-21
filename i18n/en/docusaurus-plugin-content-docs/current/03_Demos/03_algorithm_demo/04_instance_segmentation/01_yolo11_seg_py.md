---
title: Instance Segmentation - Ultralytics YOLO11 (Python)
sidebar_position: 3
description: "Pre-installed sample for deploying YOLO11 with the hbm_runtime Python interface for instance segmentation"
---

# Instance Segmentation - Ultralytics YOLO11 (Python)

This sample demonstrates how to deploy the Ultralytics YOLO11 instance segmentation model on the BPU using the Python interface of `hbm_runtime`, run instance segmentation on a single image (preprocessing + inference + mask post-processing), and save the result with masks as an image. This sample uses the `yolo11n-seg` (nano) version.

The sample code is located in the `/app/pydev_demo/instance_segmentation_sample/ultralytics_yolo11_seg/` directory on the board.

## Prerequisites

- The development board is flashed with RDK OS and logged in via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- The pre-installed model is in place:
  - S100: `/opt/hobot/model/s100/basic/yolo11n_seg_nashe_640x640_nv12.hbm`
  - S600: `/opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm`
- The Python environment and `hbm_runtime` are pre-installed with the image.

## Code Location

On-board path: `/app/pydev_demo/instance_segmentation_sample/ultralytics_yolo11_seg/`

:::tip
The code in this directory is pre-installed with the image and verified on the board. You can run it directly.
:::

Directory structure:

```text
.
├── ultralytics_yolo11_seg.py   # Main inference script
└── README.md                   # Usage instructions
```

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model-path` | Model file path (.hbm) | S600: `/opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm` (S100 corresponds to `s100/basic/`) |
| `--test-img` | Test image path | `/app/res/assets/office_desk.jpg` |
| `--label-file` | Class labels (COCO 80 classes) | `/app/res/labels/coco_classes.names` |
| `--img-save-path` | Save path of the output result image | `result.jpg` |
| `--priority` | Model scheduling priority (0~255) | `0` |
| `--bpu-cores` | List of BPU core IDs to use (e.g., `--bpu-cores 0 1`) | `[0]` |
| `--nms-thres` | IoU threshold for NMS | `0.7` |
| `--score-thres` | Confidence threshold | `0.25` |
| `--is-open` | Whether to apply morphological opening to the masks | `True` |
| `--is-point` | Whether to draw mask edge contour points | `True` |

## Usage

```bash
cd /app/pydev_demo/instance_segmentation_sample/ultralytics_yolo11_seg
python ultralytics_yolo11_seg.py
```

After it runs successfully, the instance segmentation masks are overlaid on the original image and saved as `result.jpg`.

## Execution Results

The following is actual output on RDK S600 (test image `office_desk.jpg`):

```text
Model Description:
 - yolo11n_seg_nashp_640x640_nv12_debug: {"MARCH": "nash-p",
   "INPUT_SHAPE": "1x3x640x640", "INPUT_TYPE_RT": "nv12",
   "NORM_TYPE": "data_scale", "SCALE_VALUE": "[0.003921568627451]", ...}

=== Scheduling Parameters ===
yolo11n_seg_nashp_640x640_nv12_debug:
  priority    : 0
  bpu_cores   : [0]
  deviceId    : 0

[Saved] Result saved to: result.jpg
```

**Success indicator**: `[Saved] Result saved to: result.jpg` appears at the end. Open `result.jpg` to see the overlaid instance segmentation masks.

## Software Notes

Data flow: read image → resize to 640×640 → convert to NV12 → BPU inference → decode detection head and segmentation head → confidence filtering → NMS → generate instance masks → overlay on the original image → save. Model input `1x3x640x640`, normalization `data_scale` (scale≈1/255).

## FAQ

- **Masks missing in `result.jpg`**: Confirm that the test image contains recognizable objects; lower `--score-thres`.
- **Error that the model cannot be found**: Check `--model-path`; the S600 model is in `/opt/hobot/model/s600/basic/`.
- **Error `No module named 'utils'`**: It must be run inside the sample directory (it depends on the parent `utils`).

## Related Documentation

- [C/C++ version of the YOLO11 segmentation sample](./01_yolo11_seg.md)
- [Object Detection - YOLO11 (Python)](../03_detection/02_yolo11_py.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [Python Inference API](../../../04_Simple_API/02_inference_api/02_python_api.md)
