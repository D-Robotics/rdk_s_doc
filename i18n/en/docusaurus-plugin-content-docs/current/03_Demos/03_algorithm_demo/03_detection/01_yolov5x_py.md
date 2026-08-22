---
title: Object Detection - Ultralytics YOLOv5x (Python)
sidebar_position: 3
description: "Pre-installed sample for deploying YOLOv5x with the hbm_runtime Python interface for object detection"
---

# Object Detection - Ultralytics YOLOv5x (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates how to deploy the quantized Ultralytics YOLOv5x model on the BPU using the Python interface of `hbm_runtime`, run object detection on a single image (preprocessing + inference + NMS + box drawing), and save the detection result as an image. It applies to RDK devices equipped with a BPU.

The sample code is located in the `/app/pydev_demo/detection_sample/ultralytics_yolov5x/` directory on the board.

## Prerequisites

- The development board is flashed with RDK OS and logged in via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- The pre-installed model is in place: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 corresponds to `s100/basic/`).
- The Python environment and `hbm_runtime` are pre-installed with the image.

## Environment Dependencies

It depends on the common utility library (`utils`) of `pydev_demo`. If it reports missing dependencies:

<DocScope products="RDK S100">

```bash
cd /app/pydev_demo && pip install -r requirements.txt
```

</DocScope>
<DocScope products="RDK S600">

```bash
cd /app/pydev_demo && pip install -r requirements.txt --break-system-packages
```

</DocScope>

## Code Location

On-board path: `/app/pydev_demo/detection_sample/ultralytics_yolov5x/`

Directory structure:

```text
.
├── ultralytics_yolov5x.py   # Main inference script
└── README.md                # Usage instructions
```

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model-path` | Model file path (.hbm) | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` |
| `--test-img` | Test image path | `/app/res/assets/kite.jpg` |
| `--label-file` | Class labels (one class per line, COCO 80 classes) | `/app/res/labels/coco_classes.names` |
| `--img-save-path` | Save path of the detection result image | `result.jpg` |
| `--priority` | Model scheduling priority (0~255) | `0` |
| `--bpu-cores` | List of BPU core IDs (e.g., `--bpu-cores 0 1`) | `[0]` |
| `--nms-thres` | NMS threshold | `0.45` |
| `--score-thres` | Confidence threshold | `0.25` |

## Usage

Enter the sample directory and run it directly:

```bash
cd /app/pydev_demo/detection_sample/ultralytics_yolov5x
python ultralytics_yolov5x.py
```

After it runs successfully, the detection boxes are drawn on the original image and saved as `result.jpg`.

**Notes**:

- You must first `cd` into the sample directory before running it: the script depends on the common `utils` module in the parent directory, and running it in another directory will fail with `No module named 'utils'`.
- The detection result image `result.jpg` is saved in the current working directory (i.e., the sample directory). Running it in another directory will make the result image hard to find.
- The model must be located at the default path (for S600 it is `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`; S100 corresponds to `s100/basic/`). If missing, `--model-path` must be explicitly specified.

## Execution Results

The program loads the model, runs inference and NMS post-processing, draws boxes, and saves the result. The following is actual output (excerpt) on RDK S600 (test image `kite.jpg`):

```text
Model Description:
 - yolov5x_672x672_nv12: {"MARCH": "nash-p", "INPUT_SHAPE": "1x3x672x672",
   "INPUT_TYPE_RT": "nv12", "NORM_TYPE": "data_scale",
   "SCALE_VALUE": "[0.003921568627451]"}

=== Scheduling Parameters ===
yolov5x_672x672_nv12:
  priority    : 0
  bpu_cores   : [0]
  deviceId    : 0

[Saved] Result saved to: result.jpg
```

**Success indicator**: `[Saved] Result saved to: result.jpg` appears at the end. Open `result.jpg` with an image viewer to see the detected object boxes (e.g., the person and the kite in `kite.jpg`).

## Software Notes

Data flow: read image (BGR) → resize to 672×672 → convert to NV12 → BPU inference → decode output heads → NMS deduplication → keep boxes with score≥0.25 → draw boxes and classes on the original image → save. Model input `1x3x672x672`, normalization uses `data_scale` (scale≈1/255).

## FAQ

- **No boxes visible in `result.jpg`**: Confirm that the test image contains recognizable objects; lower `--score-thres` (e.g., 0.1) or `--nms-thres` to see more candidate boxes.
- **Error that the model cannot be found**: Check whether the `.hbm` exists under `--model-path`; the S600 model is in `/opt/hobot/model/s600/basic/`.
- **Error `No module named 'utils'`**: It is not running in the sample directory. You must `cd` into `ultralytics_yolov5x/` before running it (it depends on the parent `utils`).

## Related Documentation

- [C/C++ version of the YOLOv5x sample](./01_yolov5x.md)
- [Image Classification - ResNet18 (Python)](../02_classification/01_resnet18_py.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [Python Inference API](../../../04_Simple_API/02_inference_api/02_python_api.md)
