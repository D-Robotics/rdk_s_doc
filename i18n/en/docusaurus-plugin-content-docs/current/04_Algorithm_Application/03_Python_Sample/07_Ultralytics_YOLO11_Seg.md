---
sidebar_position: 7
---

# Instance Segmentation - Ultralytics YOLO11

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">
This sample shows how to run the YOLOv11 instance segmentation model on BPU based on `hbm_runtime`. It supports image preprocessing, inference, and postprocessing (parsing outputs and overlaying colored segmentation masks). The sample code is located in `/app/pydev_demo/03_instance_segmentation_sample/02_ultralytics_yolo11_seg/`.

</DocScope>
<DocScope products="RDK-S600">
This sample shows how to run the YOLOv11 instance segmentation model on BPU based on `hbm_runtime`. It supports image preprocessing, inference, and postprocessing (parsing outputs and overlaying colored segmentation masks). The sample code is located in `/app/pydev_demo/instance_segmentation_sample/ultralytics_yolo11_seg/`.

</DocScope>

## Model Description
- Introduction:

    Ultralytics YOLO11 is a lightweight object detection and instance segmentation model based on the YOLO series, combining anchor-free and anchor-based design ideas with distributional regression. This model is the instance segmentation variant, supporting simultaneous output of bounding boxes, class probabilities, and high-quality pixel-level masks. It is suitable for multi-object detection and segmentation tasks in real-time scenarios.

<DocScope products="RDK-S100">
- HBM model name: `yolo11n_seg_nashe_640x640_nv12.hbm`

</DocScope>
<DocScope products="RDK-S600">
- HBM model name: `yolo11n_seg_nashp_640x640_nv12.hbm`

</DocScope>

- Input format: `NV12` image (Y/UV separated), size `640x640`

- Output:

    - Object detection results (bounding box + class + score)

    - Instance segmentation masks (one mask per object)

- Model download URL (automatically downloaded by the program):

    <DocScope products="RDK-S100">
    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolo11n_seg_nashe_640x640_nv12.hbm
    ```

    </DocScope>
    <DocScope products="RDK-S600">
    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ultralytics_YOLO/yolo11n_seg_nashp_640x640_nv12.hbm
    ```

    </DocScope>

## Features
- Model loading

    Use `hbm_runtime` to load the quantized Ultralytics YOLO11 instance segmentation model and parse runtime metadata such as input/output tensor names, shapes, and quantization parameters.

- Input preprocessing

    Resize the input BGR image to `640×640` and convert it to NV12 format (Y and UV planes separated) to meet model input requirements.

- Inference execution

    Trigger forward inference with the `.run()` method. Scheduling parameters (BPU core binding and priority) can be set through the interface. Inference outputs include multi-scale class scores, bounding box regression, mask coefficients, and global mask prototype tensors.

- Output postprocessing

    - Filter detection candidates using thresholds and decode bounding boxes and mask coefficients;

    - Merge outputs from all scales and apply NMS to select final objects;

    - Reconstruct each object's mask from mask prototypes and coefficients;

    - Scale masks and bounding boxes back to the original image size;

    - Optional morphological opening to refine mask edges;

    - Final output includes bounding boxes, classes, scores, and pixel-level instance masks.

## Environment Dependencies
This sample has no special environment requirements. You only need to ensure the dependencies in `pydev` are installed.

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
├── ultralytics_yolo11_seg.py   # Main inference script
└── README.md                   # Usage instructions
```

## Parameter Description

<DocScope products="RDK-S100">
| Parameter         | Description                               | Default Value                         |
| ----------------- | ----------------------------------------- | ------------------------------------- |
| `--model-path`    | Model file path (`.hbm` format)           | `/opt/hobot/model/s100/basic/yolo11n_seg_nashe_640x640_nv12.hbm` |
| `--test-img`      | Test image path                           | `/app/res/assets/office_desk.jpg`     |
| `--label-file`    | Classification label file                 | `/app/res/labels/coco_classes.names`  |
| `--img-save-path` | Output path for saved result image        | `result.jpg`                          |
| `--priority`      | Model priority (`0~255`)                  | `0`                                   |
| `--bpu-cores`     | BPU core IDs                              | `[0]`                                 |
| `--nms-thres`     | NMS IoU threshold                         | `0.7`                                 |
| `--score-thres`   | Confidence threshold                      | `0.25`                                |
| `--is-open`       | Whether to apply morphological opening to segmentation results | `True` |
| `--is-point`      | Whether to draw contour points on mask edges | `True`                             |

</DocScope>
<DocScope products="RDK-S600">
| Parameter         | Description                               | Default Value                         |
| ----------------- | ----------------------------------------- | ------------------------------------- |
| `--model-path`    | Model file path (`.hbm` format)           | `/opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm` |
| `--test-img`      | Test image path                           | `/app/res/assets/office_desk.jpg`     |
| `--label-file`    | Classification label file                 | `/app/res/labels/coco_classes.names`  |
| `--img-save-path` | Output path for saved result image        | `result.jpg`                          |
| `--priority`      | Model priority (`0~255`)                  | `0`                                   |
| `--bpu-cores`     | BPU core IDs                              | `[0]`                                 |
| `--nms-thres`     | NMS IoU threshold                         | `0.7`                                 |
| `--score-thres`   | Confidence threshold                      | `0.25`                                |
| `--is-open`       | Whether to apply morphological opening to segmentation results | `True` |
| `--is-point`      | Whether to draw contour points on mask edges | `True`                             |

</DocScope>

## Quick Start
- Run the model
    - Use default parameters
        ```bash
        python ultralytics_yolo11_seg.py
        ```
    - Run with specified parameters

        <DocScope products="RDK-S100">
        ```bash
        python ultralytics_yolo11_seg.py \
        --model-path /opt/hobot/model/s100/basic/yolo11n_seg_nashe_640x640_nv12.hbm \
        --test-img /app/res/assets/office_desk.jpg \
        --label-file /app/res/labels/coco_classes.names \
        --img-save-path result.jpg \
        --priority 0 \
        --bpu-cores 0 \
        --nms-thres 0.7 \
        --score-thres 0.25 \
        --is-open True \
        --is-point True
        ```

        </DocScope>
        <DocScope products="RDK-S600">
        ```bash
        python ultralytics_yolo11_seg.py \
        --model-path /opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm \
        --test-img /app/res/assets/office_desk.jpg \
        --label-file /app/res/labels/coco_classes.names \
        --img-save-path result.jpg \
        --priority 0 \
        --bpu-cores 0 \
        --nms-thres 0.7 \
        --score-thres 0.25 \
        --is-open True \
        --is-point True
        ```

        </DocScope>

- View the result

    After successful execution, results will be drawn on the original image and saved to the path specified by `--img-save-path`.
    ```bash
    [Saved] Result saved to: result.jpg
    ```

## Notes
- If the specified model path does not exist, the program will attempt to download the model automatically.

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
