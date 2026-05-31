---
sidebar_position: 5
---

# Object Detection - Ultralytics YOLO11

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">
This example uses the Ultralytics YOLO11 model with the `hbm_runtime` interface to perform image object detection. It supports image preprocessing, inference, post-processing (including decoding, confidence filtering, and NMS), and result image saving. The sample code is located in `/app/pydev_demo/02_detection_sample/02_ultralytics_yolo11/`.

</DocScope>
<DocScope products="RDK-S600">
This example uses the Ultralytics YOLO11 model with the `hbm_runtime` interface to perform image object detection. It supports image preprocessing, inference, post-processing (including decoding, confidence filtering, and NMS), and result image saving. The sample code is located in `/app/pydev_demo/detection_sample/ultralytics_yolo11/`.

</DocScope>

## Model Description
- Overview:

    Ultralytics YOLO11 is a lightweight anchor-based object detection model that combines anchor-free and anchor-based ideas, offering fast inference and precise localization. During the regression stage, it uses discrete regression bins together with softmax classification and decoding mechanisms to improve localization accuracy. YOLO11 is suitable for deploying small models in real-time scenarios such as security monitoring and industrial inspection.

<DocScope products="RDK-S100">
- HBM model name: yolo11n_detect_nashe_640x640_nv12.hbm

</DocScope>
<DocScope products="RDK-S600">
- HBM model name: yolo11n_detect_nashp_640x640_nv12.hbm

</DocScope>

- Input format: NV12, size 640x640 (Y and UV planes separated)

- Output: Multi-scale feature maps, each containing class score tensors and discrete bounding box regression tensors; the final output includes object box locations, class IDs, and confidence scores

- Model download URL (automatically downloaded by the program):

    <DocScope products="RDK-S100">
    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolo11n_detect_nashe_640x640_nv12.hbm
    ```

    </DocScope>
    <DocScope products="RDK-S600">
    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ultralytics_YOLO/yolo11n_detect_nashp_640x640_nv12.hbm
    ```

    </DocScope>

## Features
- Model loading

    Loads the quantized Ultralytics YOLO11 model using the `hbm_runtime` interface and extracts model metadata such as input and output names, shapes, and quantization information for subsequent inference.

- Input preprocessing

    Resizes the original BGR image to 640×640, converts it to NV12 format (Y and UV separated), and constructs a nested dictionary input tensor to meet the inference interface requirements.

- Inference execution

    Runs forward inference through the `.run()` method, with optional scheduling parameters (inference priority and BPU core binding). The output includes classification and regression tensors from multiple scale branches.

- Post-processing

    - Dequantizes the quantized output to float32;

    - Filters classification scores at each scale branch and retains candidate boxes above the confidence threshold;

    - Decodes bounding boxes using a multi-bin regression algorithm;

    - Merges candidate boxes from all scales and applies NMS (non-maximum suppression) to remove redundant boxes;

    - Maps detection boxes from the model input coordinate system back to the original image size;

    - Optionally draws detection results and saves the output image.

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
├── ultralytics_yolo11.py       # Main inference script
└── README.md                   # Usage instructions
```

## Parameters

<DocScope products="RDK-S100">
| Parameter         | Description                                              | Default Value                               |
|-------------------|----------------------------------------------------------|---------------------------------------------|
| `--model-path`    | Model file path (.hbm format)                            | `/opt/hobot/model/s100/basic/yolo11n_detect_nashe_640x640_nv12.hbm`        |
| `--test-img`      | Input test image path                                    | `/app/res/assets/kite.jpg`                        |
| `--label-file`    | Class label file path (one class name per line)          | `/app/res/labels/coco_classes.names`              |
| `--img-save-path` | Path to save the detection result image                  | `result.jpg`                                   |
| `--priority`      | Model scheduling priority (0~255; higher values mean higher priority) | `0`                                            |
| `--bpu-cores`     | List of BPU core IDs to use (e.g. `--bpu-cores 0 1`)     | `[0]`                                          |
| `--nms-thres`     | IoU threshold for non-maximum suppression (NMS)          | `0.45`                                         |
| `--score-thres`   | Confidence filter threshold (objects below this value are discarded) | `0.25`                                         |

</DocScope>
<DocScope products="RDK-S600">
| Parameter         | Description                                              | Default Value                               |
|-------------------|----------------------------------------------------------|---------------------------------------------|
| `--model-path`    | Model file path (.hbm format)                            | `/opt/hobot/model/s600/basic/yolo11n_detect_nashp_640x640_nv12.hbm`        |
| `--test-img`      | Input test image path                                    | `/app/res/assets/kite.jpg`                        |
| `--label-file`    | Class label file path (one class name per line)          | `/app/res/labels/coco_classes.names`              |
| `--img-save-path` | Path to save the detection result image                  | `result.jpg`                                   |
| `--priority`      | Model scheduling priority (0~255; higher values mean higher priority) | `0`                                            |
| `--bpu-cores`     | List of BPU core IDs to use (e.g. `--bpu-cores 0 1`)     | `[0]`                                          |
| `--nms-thres`     | IoU threshold for non-maximum suppression (NMS)          | `0.45`                                         |
| `--score-thres`   | Confidence filter threshold (objects below this value are discarded) | `0.25`                                         |

</DocScope>


## Quick Start
- Run the model
    - With default parameters
        ```bash
        python ultralytics_yolo11.py
        ```
    - Run with specified parameters

        <DocScope products="RDK-S100">
        ```bash
        python ultralytics_yolo11.py \
            --model-path /opt/hobot/model/s100/basic/yolo11n_detect_nashe_640x640_nv12.hbm \
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
        python ultralytics_yolo11.py \
            --model-path /opt/hobot/model/s600/basic/yolo11n_detect_nashp_640x640_nv12.hbm \
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
