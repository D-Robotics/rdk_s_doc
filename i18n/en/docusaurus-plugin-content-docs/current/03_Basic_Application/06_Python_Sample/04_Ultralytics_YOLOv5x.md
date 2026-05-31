---
sidebar_position: 4
---

# Object Detection - Ultralytics YOLOv5x

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">
This example shows how to perform image object detection on the BPU using a quantized Ultralytics YOLOv5x model. It supports preprocessing, post-processing, NMS, bounding box drawing, and result saving. The sample code is located in `/app/pydev_demo/02_detection_sample/01_ultralytics_yolov5x/`.

</DocScope>
<DocScope products="RDK-S600">
This example shows how to perform image object detection on the BPU using a quantized Ultralytics YOLOv5x model. It supports preprocessing, post-processing, NMS, bounding box drawing, and result saving. The sample code is located in `/app/pydev_demo/detection_sample/ultralytics_yolov5x/`.

</DocScope>


## Model Description
- Overview:

    Ultralytics YOLOv5x is a high-performance object detection model. The name stands for "You Only Look Once," meaning a single forward pass can complete object localization and classification. YOLOv5x is the largest variant, with more network parameters and higher detection accuracy, making it suitable for scenarios that require high precision. The model maps the input image to multiple grids, with each grid predicting class labels and bounding boxes for multiple anchors. This model has been quantized into HBM format for BPU chips, with NV12 input at 672×672 resolution.

- HBM model name: yolov5x_672x672_nv12.hbm

- Input format: NV12, size 672x672 (Y and UV planes separated)

- Output: N object boxes, each containing a tuple of (class index, probability, bounding box coordinates)


## Features
- Model loading

    Loads the quantized Ultralytics YOLOv5x model through `hbm_runtime`, parsing model name, input and output names, shapes, quantization parameters, and other information to prepare for subsequent inference.

- Input preprocessing

    Resizes the input image to 672x672, converts it to NV12 format (Y and UV separated), and organizes the input as a nested dictionary to match the inference interface.

- Inference execution

    Runs inference using the `.run()` method, with support for setting inference priority and BPU core binding (such as core0/core1).

- Post-processing

    - Dequantizes the output tensor;

    - Decodes YOLO outputs to obtain predicted boxes, confidence scores, and class indices;

    - Filters candidates based on the score threshold;

    - Applies NMS (non-maximum suppression) to remove redundant boxes;

    - Maps predicted box coordinates back to the original image size;

    - Overlays detection boxes and saves the result image.

<DocScope products="RDK-S100">
- Model download URL (automatically downloaded by the program):

    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolov5x_672x672_nv12.hbm
    ```

</DocScope>
<DocScope products="RDK-S600">
- Model download URL (automatically downloaded by the program):

    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ultralytics_YOLO/yolov5x_672x672_nv12.hbm
    ```

</DocScope>


## Environment Dependencies
This sample has no special environment requirements. Just ensure that the dependencies in pydev are installed.

<DocScope products="RDK-S100">
```bash
pip install -r ../../requirements.txt
```

</DocScope>
<DocScope products="RDK-S600">
```bash
pip install -r ../../requirements.txt --break-system-packages
```

</DocScope>

## Directory Structure

```text
.
├── ultralytics_yolov5x.py      # Main inference script
└── README.md                   # Usage instructions
```

## Parameters

<DocScope products="RDK-S100">
| Parameter         | Description                                              | Default Value                               |
|-------------------|----------------------------------------------------------|---------------------------------------------|
| `--model-path`    | Model file path (.hbm format)                            | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm` |
| `--test-img`      | Test image path                                          | `/app/res/assets/kite.jpg`                     |
| `--label-file`    | Class label path (one class per line)                    | `/app/res/labels/coco_classes.names`           |
| `--img-save-path` | Path to save the detection result image                  | `result.jpg`                                |
| `--priority`      | Model scheduling priority (0~255)                        | `0`                                         |
| `--bpu-cores`     | List of BPU core IDs to use (e.g. `--bpu-cores 0 1`)     | `[0]`                                      |
| `--nms-thres`     | Non-maximum suppression (NMS) threshold                  | `0.45`                                    |
| `--score-thres`   | Confidence threshold                                     | `0.25`                                    |

</DocScope>
<DocScope products="RDK-S600">
| Parameter         | Description                                              | Default Value                               |
|-------------------|----------------------------------------------------------|---------------------------------------------|
| `--model-path`    | Model file path (.hbm format)                            | `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` |
| `--test-img`      | Test image path                                          | `/app/res/assets/kite.jpg`                     |
| `--label-file`    | Class label path (one class per line)                    | `/app/res/labels/coco_classes.names`           |
| `--img-save-path` | Path to save the detection result image                  | `result.jpg`                                |
| `--priority`      | Model scheduling priority (0~255)                        | `0`                                         |
| `--bpu-cores`     | List of BPU core IDs to use (e.g. `--bpu-cores 0 1`)     | `[0]`                                      |
| `--nms-thres`     | Non-maximum suppression (NMS) threshold                  | `0.45`                                    |
| `--score-thres`   | Confidence threshold                                     | `0.25`                                    |

</DocScope>


## Quick Start
- Run the model
    - With default parameters
        ```bash
        python ultralytics_yolov5x.py
        ```
    - Run with specified parameters

        <DocScope products="RDK-S100">
        ```bash
        python ultralytics_yolov5x.py \
            --model-path /opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm \
            --test-img /app/res/assets/kite.jpg \
            --label-file /app/res/labels/coco_classes.names \
            --img-save-path result.jpg \
            --priority 0 \
            --bpu-cores 0 \
            --nms-thres 0.45 \
            --score-thres 0.25
        ```

        </DocScope>
        <DocScope products="RDK-S600">
        ```bash
        python ultralytics_yolov5x.py \
            --model-path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
            --test-img /app/res/assets/kite.jpg \
            --label-file /app/res/labels/coco_classes.names \
            --img-save-path result.jpg \
            --priority 0 \
            --bpu-cores 0 \
            --nms-thres 0.45 \
            --score-thres 0.25
        ```

        </DocScope>

- View results

    After a successful run, detection boxes are drawn on the original image and saved to the path specified by `--img-save-path`.
    ```bash
    [Saved] Result saved to: result.jpg
    ```

## Notes

<DocScope products="RDK-S100">
- If the specified model path does not exist, try looking in `/opt/hobot/model/s100/basic/`.

</DocScope>
<DocScope products="RDK-S600">
- If the specified model path does not exist, try looking in `/opt/hobot/model/s600/basic/`.

</DocScope>

## License
    ```license
    Copyright (C) 2025, XiangshunZhao D-Robotics.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
    ```
