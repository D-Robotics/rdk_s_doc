---
title: Object Detection - Ultralytics YOLO11 (Python)
sidebar_position: 4
description: "Pre-installed sample for deploying YOLO11 with the hbm_runtime Python interface for object detection"
---

# Object Detection - Ultralytics YOLO11 (Python)

This sample demonstrates how to deploy the Ultralytics YOLO11 model on the BPU using the Python interface of `hbm_runtime`, run object detection on a single image (preprocessing + inference + decoding + NMS), and save the detection result as an image. YOLO11 is a newer generation of detection models from Ultralytics; this sample uses the `yolo11n` (nano) version.

The sample code is located in the `/app/pydev_demo/detection_sample/ultralytics_yolo11/` directory on the board.

## Prerequisites

- The development board is flashed with RDK OS and logged in via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- The pre-installed model is in place:
  - S100: `/opt/hobot/model/s100/basic/yolo11n_detect_nashe_640x640_nv12.hbm`
  - S600: `/opt/hobot/model/s600/basic/yolo11n_detect_nashp_640x640_nv12.hbm`
- The Python environment and `hbm_runtime` are pre-installed with the image.

## Code Location

The sample code is located in the `/app/pydev_demo/detection_sample/ultralytics_yolo11/` directory on the board, with the following structure:

```text
/app/pydev_demo/detection_sample/ultralytics_yolo11/
├── README.md
└── ultralytics_yolo11.py
```

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model-path` | Model file path (.hbm) | S600: `/opt/hobot/model/s600/basic/yolo11n_detect_nashp_640x640_nv12.hbm`; S100: `/opt/hobot/model/s100/basic/yolo11n_detect_nashe_640x640_nv12.hbm` |
| `--test-img` | Test image path | `/app/res/assets/kite.jpg` |
| `--label-file` | Class labels (COCO 80 classes) | `/app/res/labels/coco_classes.names` |
| `--img-save-path` | Save path of the detection result image | `result.jpg` |
| `--nms-thres` | IoU threshold for NMS | `0.45` |
| `--score-thres` | Confidence filtering threshold | `0.25` |

## Usage

```bash
cd /app/pydev_demo/detection_sample/ultralytics_yolo11
python ultralytics_yolo11.py
```

After it runs successfully, the detection boxes are drawn on the original image and saved as `result.jpg`.

**Notes**:

- You must first `cd` into the sample directory before running it: the script depends on the common `utils` module in the parent directory, and running it in another directory will fail with `No module named 'utils'`.
- The detection result image `result.jpg` is saved in the current working directory (i.e., the sample directory). Running it in another directory will make the result image hard to find.
- The model must be located at the default path (S600: `/opt/hobot/model/s600/basic/yolo11n_detect_nashp_640x640_nv12.hbm`, S100: `/opt/hobot/model/s100/basic/yolo11n_detect_nashe_640x640_nv12.hbm`). If missing, `--model-path` must be explicitly specified.

## Execution Results

The following is actual output (excerpt) on RDK S600 (test image `kite.jpg`):

```text
Model Description:
 - yolo11n_detect_nashp_640x640_nv12_beta: {"MARCH": "nash-p",
   "INPUT_SHAPE": "1x3x640x640", "INPUT_TYPE_RT": "nv12",
   "NORM_TYPE": "data_scale", "SCALE_VALUE": "[0.003921568627451]"}

=== Scheduling Parameters ===
  priority    : 0
  bpu_cores   : [0]

[Saved] Result saved to: result.jpg
```

**Success indicator**: `[Saved] Result saved to: result.jpg` appears at the end. Open `result.jpg` to see the detection boxes (e.g., the person and the kite in `kite.jpg`).

## Software Notes

Data flow: read image → resize to 640×640 → convert to NV12 → BPU inference → decode detection head → confidence filtering (score≥0.25) → NMS (IoU 0.45) → draw boxes and classes → save. Model input `1x3x640x640`, normalization `data_scale` (scale≈1/255).

## FAQ

- **No boxes visible in `result.jpg`**: Confirm that the test image contains recognizable objects; lower `--score-thres` (e.g., 0.1).
- **Error that the model cannot be found**: Check `--model-path`; the S600 model is in `/opt/hobot/model/s600/basic/`.
- **Error `No module named 'utils'`**: It must be run inside the sample directory (it depends on the parent `utils`).

## Related Documentation

- [C/C++ version of the YOLO11 detection sample](./02_yolo11.md)
- [Object Detection - YOLOv5x (Python)](./01_yolov5x_py.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [Python Inference API](../../../04_Simple_API/02_inference_api/02_python_api.md)
