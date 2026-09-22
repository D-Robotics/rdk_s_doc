---
sidebar_position: 8
---

# Pose Estimation - Ultralytics YOLO11

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">

This example shows how to run the Ultralytics YOLO11 pose estimation model on the BPU for human keypoint detection and visualization. It supports model preprocessing, inference, and post-processing (including keypoint decoding, bounding box drawing, and keypoint annotation). The sample code is located in `/app/cdev_demo/bpu/04_pose_sample/01_ultralytics_yolo11_pose/`.

</DocScope>
<DocScope products="RDK-S600">

This example shows how to run the Ultralytics YOLO11 pose estimation model on the BPU for human keypoint detection and visualization. It supports model preprocessing, inference, and post-processing (including keypoint decoding, bounding box drawing, and keypoint annotation). The sample code is located in `/app/cdev_demo/bpu/pose_sample/ultralytics_yolo11_pose/`.

</DocScope>

## Model Description
- Overview:

    Ultralytics YOLO11 Pose is an efficient lightweight human keypoint detection model that supports simultaneous object detection and pose estimation (multi-keypoint prediction). It integrates Distribution Focal Loss (DFL) to improve localization accuracy for both bounding boxes and keypoints, suitable for multi-person pose recognition in real-time applications.

<DocScope products="RDK-S100">
- HBM model name: yolo11n_pose_nashe_640x640_nv12.hbm

</DocScope>
<DocScope products="RDK-S600">
- HBM model name: yolo11n_pose_nashp_640x640_nv12.hbm

</DocScope>

- Input format: NV12 image (Y and UV separated), size 640×640

- Output:

    - Bounding box coordinates for each person (xyxy)

    - Keypoint positions (K×2, x/y coordinates)

    - Confidence score for each keypoint

    - Supports COCO human keypoint format (typically 17 keypoints)

## Feature Overview
- Model loading

    Load the specified Ultralytics YOLO11 pose estimation model and automatically parse model metadata.

- Input preprocessing

    Resize the input BGR image to 640×640 and convert it to NV12 format (Y and UV separated) for model inference.

- Inference execution

    Run inference via the `.infer()` interface.

- Result post-processing

    - Decode bounding boxes from multi-scale outputs (using DFL bin decoding);

    - Decode keypoint positions and confidence scores (K×2 + K);

    - Apply NMS to remove redundant detection boxes;

    - Map keypoint coordinates and bounding boxes back to the original image size;

    - Use threshold controls to display only high-confidence keypoints;

    - Support image visualization including detection boxes and keypoint drawing.


## Environment Dependencies
Before building and running, ensure the following dependencies are installed:
```bash
sudo apt update
sudo apt install libgflags-dev
```

## Directory Structure
```text
.
|-- CMakeLists.txt                     # CMake build script: targets, dependencies, include paths
|-- README.md                          # Usage instructions (this file)
|-- inc
|   `-- ultralytics_yolo11_pose.hpp    # Model wrapper header: load/preprocess/infer/post-process interface declarations
`-- src
    |-- main.cc                        # Program entry: parse arguments → full pipeline → save visualization
    `-- ultralytics_yolo11_pose.cc     # Model implementation: decoding, NMS, keypoint post-processing, coordinate restoration
```

## Build the Project
- Configure and build
    ```bash
    mkdir build && cd build
    cmake ..
    make -j$(nproc)
    ```

## Model Download
If the model is not found at runtime, download it with the following command:

<DocScope products="RDK-S100">

```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolo11n_pose_nashe_640x640_nv12.hbm
```

</DocScope>
<DocScope products="RDK-S600">

```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ultralytics_YOLO/yolo11n_pose_nashp_640x640_nv12.hbm
```

</DocScope>

## Parameter Reference

<DocScope products="RDK-S100">
| Parameter          | Description                                              | Default Value                                                     |
| ------------------ | -------------------------------------------------------- | ----------------------------------------------------------------- |
| `--model_path`     | Model file path (`.hbm`)                                 | `/opt/hobot/model/s100/basic/yolo11n_pose_nashe_640x640_nv12.hbm` |
| `--test_img`       | Input test image path                                    | `/app/res/assets/bus.jpg`                                         |
| `--label_file`     | Class label file (one class name per line)               | `/app/res/labels/coco_classes.names`                              |
| `--score_thres`    | Confidence threshold (detections below this are filtered) | `0.25`                                                           |
| `--nms_thres`      | IoU threshold (intra-class NMS deduplication)           | `0.7`                                                             |
| `--kpt_conf_thres` | Keypoint visualization confidence threshold (points below this are not shown) | `0.5`                                            |

</DocScope>
<DocScope products="RDK-S600">
| Parameter          | Description                                              | Default Value                                                     |
| ------------------ | -------------------------------------------------------- | ----------------------------------------------------------------- |
| `--model_path`     | Model file path (`.hbm`)                                 | `/opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm` |
| `--test_img`       | Input test image path                                    | `/app/res/assets/bus.jpg`                                         |
| `--label_file`     | Class label file (one class name per line)               | `/app/res/labels/coco_classes.names`                              |
| `--score_thres`    | Confidence threshold (detections below this are filtered) | `0.25`                                                           |
| `--nms_thres`      | IoU threshold (intra-class NMS deduplication)           | `0.7`                                                             |
| `--kpt_conf_thres` | Keypoint visualization confidence threshold (points below this are not shown) | `0.5`                                            |

</DocScope>

## Quick Start
- Run the model
    - Make sure you are in the `build` directory
    - Use default parameters
        ```bash
        ./ultralytics_yolo11_pose
        ```
    - Run with custom parameters

        <DocScope products="RDK-S100">
        ```bash
        ./ultralytics_yolo11_pose \
        --model_path /opt/hobot/model/s100/basic/yolo11n_pose_nashe_640x640_nv12.hbm \
        --test_img   /app/res/assets/bus.jpg \
        --label_file /app/res/labels/coco_classes.names \
        --score_thres 0.25 \
        --nms_thres   0.7 \
        --kpt_conf_thres 0.5
        ```

        </DocScope>
        <DocScope products="RDK-S600">
        ```bash
        ./ultralytics_yolo11_pose \
        --model_path /opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm \
        --test_img   /app/res/assets/bus.jpg \
        --label_file /app/res/labels/coco_classes.names \
        --score_thres 0.25 \
        --nms_thres   0.7 \
        --kpt_conf_thres 0.5
        ```

        </DocScope>

- View the results

    After a successful run, the result is drawn on the original image and saved to `build/result.jpg`.
    ```bash
    [Saved] Result saved to: result.jpg
    ```

## Notes
- The output is saved as `result.jpg` for you to inspect.

- For more deployment options or model support information, refer to the official documentation or contact platform technical support.


## License
    ```license
    Copyright (C) 2025，XiangshunZhao D-Robotics.

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
