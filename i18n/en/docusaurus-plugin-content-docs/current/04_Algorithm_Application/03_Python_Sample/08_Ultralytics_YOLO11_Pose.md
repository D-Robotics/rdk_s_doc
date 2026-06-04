---
sidebar_position: 8
---

# Pose Estimation - Ultralytics YOLO11

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">
This sample shows how to run the Ultralytics YOLO11 pose estimation model on BPU based on `hbm_runtime`, enabling human keypoint detection and visualization. It supports model preprocessing, inference execution, and postprocessing (including keypoint decoding, bounding box drawing, and keypoint annotation). The sample code is located in `/app/pydev_demo/04_pose_sample/01_ultralytics_yolo11_pose/`.

</DocScope>
<DocScope products="RDK-S600">
This sample shows how to run the Ultralytics YOLO11 pose estimation model on BPU based on `hbm_runtime`, enabling human keypoint detection and visualization. It supports model preprocessing, inference execution, and postprocessing (including keypoint decoding, bounding box drawing, and keypoint annotation). The sample code is located in `/app/pydev_demo/pose_sample/ultralytics_yolo11_pose/`.

</DocScope>

## Model Description
- Introduction:

    Ultralytics YOLO11 Pose is an efficient lightweight human keypoint detection model that supports simultaneous object detection and pose estimation (multi-keypoint prediction). It integrates Distribution Focal Loss (DFL) to improve bounding box and keypoint localization accuracy, making it suitable for multi-person pose recognition tasks in real-time applications.

<DocScope products="RDK-S100">
- HBM model name: `yolo11n_pose_nashe_640x640_nv12.hbm`

</DocScope>
<DocScope products="RDK-S600">
- HBM model name: `yolo11n_pose_nashp_640x640_nv12.hbm`

</DocScope>

- Input format: `NV12` image (Y and UV separated), size `640×640`

- Output:

    - Bounding box coordinates for each person (xyxy)

    - Keypoint positions (K×2, x/y coordinates)

    - Confidence score for each keypoint

    - Supports COCO human keypoint format (commonly 17 keypoints)

- Model download URL (automatically downloaded by the program):

    <DocScope products="RDK-S100">
    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolo11n_pose_nashe_640x640_nv12.hbm
    ```

    </DocScope>
    <DocScope products="RDK-S600">
    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ultralytics_YOLO/yolo11n_pose_nashp_640x640_nv12.hbm
    ```

    </DocScope>

## Features
- Model loading

    Use `hbm_runtime` to load the specified Ultralytics YOLO11 pose estimation model and automatically parse input/output tensor names, shapes, and quantization parameters.

- Input preprocessing

    Resize the input BGR image to `640×640` and convert it to NV12 format (Y and UV separated) for model inference.

- Inference execution

    Execute inference through the `.run()` interface. Running priority and BPU core binding can be configured via `set_scheduling_params()`.

- Output postprocessing

    - Decode bounding boxes from multi-scale outputs (using DFL bin decoding);

    - Decode keypoint positions and confidence (K×2 + K);

    - Apply NMS to remove redundant detection boxes;

    - Map keypoint coordinates and bounding boxes back to the original image size;

    - Threshold control to display only high-confidence keypoints;

    - Image visualization support, including detection boxes and keypoint drawing.

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
├── ultralytics_yolo11_pose.py    # Main inference script
└── README.md                     # Usage instructions
```

## Parameter Description

<DocScope products="RDK-S100">
| Parameter          | Description                                              | Default Value                         |
| ------------------ | -------------------------------------------------------- | ------------------------------------- |
| `--model-path`     | Model file path (`.hbm` format)                          | `/opt/hobot/model/s100/basic/yolo11n_pose_nashe_640x640_nv12.hbm` |
| `--test-img`       | Test image path                                          | `/app/res/assets/bus.jpg`             |
| `--label-file`     | Class label path, one class name per line              | `/app/res/labels/coco_classes.names`  |
| `--img-save-path`  | Detection result save path                               | `result.jpg`                          |
| `--priority`       | Model scheduling priority (`0~255`; larger is higher)    | `0`                                   |
| `--bpu-cores`      | List of BPU core IDs for inference (for example, `--bpu-cores 0 1`) | `[0]` |
| `--nms-thres`      | IoU threshold for non-maximum suppression (NMS)          | `0.7`                                 |
| `--score-thres`    | Object confidence threshold (objects below this value are filtered) | `0.25` |
| `--kpt-conf-thres` | Keypoint visualization confidence threshold (keypoints below this value are not displayed) | `0.5` |

</DocScope>
<DocScope products="RDK-S600">
| Parameter          | Description                                              | Default Value                         |
| ------------------ | -------------------------------------------------------- | ------------------------------------- |
| `--model-path`     | Model file path (`.hbm` format)                          | `/opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm` |
| `--test-img`       | Test image path                                          | `/app/res/assets/bus.jpg`             |
| `--label-file`     | Class label path, one class name per line              | `/app/res/labels/coco_classes.names`  |
| `--img-save-path`  | Detection result save path                               | `result.jpg`                          |
| `--priority`       | Model scheduling priority (`0~255`; larger is higher)    | `0`                                   |
| `--bpu-cores`      | List of BPU core IDs for inference (for example, `--bpu-cores 0 1`) | `[0]` |
| `--nms-thres`      | IoU threshold for non-maximum suppression (NMS)          | `0.7`                                 |
| `--score-thres`    | Object confidence threshold (objects below this value are filtered) | `0.25` |
| `--kpt-conf-thres` | Keypoint visualization confidence threshold (keypoints below this value are not displayed) | `0.5` |

</DocScope>

## Quick Start
- Run the model
    - Use default parameters
        ```bash
        python ultralytics_yolo11_pose.py
        ```
    - Run with specified parameters

        <DocScope products="RDK-S100">
        ```bash
        python ultralytics_yolo11_pose.py \
        --model-path /opt/hobot/model/s100/basic/yolo11n_pose_nashe_640x640_nv12.hbm \
        --test-img /app/res/assets/bus.jpg \
        --label-file /app/res/labels/coco_classes.names \
        --img-save-path result.jpg \
        --priority 0 \
        --bpu-cores 0 \
        --score-thres 0.25 \
        --nms-thres 0.7 \
        --kpt-conf-thres 0.5
        ```

        </DocScope>
        <DocScope products="RDK-S600">
        ```bash
        python ultralytics_yolo11_pose.py \
        --model-path /opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm \
        --test-img /app/res/assets/bus.jpg \
        --label-file /app/res/labels/coco_classes.names \
        --img-save-path result.jpg \
        --priority 0 \
        --bpu-cores 0 \
        --score-thres 0.25 \
        --nms-thres 0.7 \
        --kpt-conf-thres 0.5
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
