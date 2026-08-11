---
sidebar_position: 5
---

# Object Detection - Ultralytics YOLO11

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">

This example performs image object detection with the Ultralytics YOLO11 model using C/C++. It supports image preprocessing, inference, post-processing (including decoding, confidence filtering, and NMS), and result image saving. The sample code is located in `/app/cdev_demo/bpu/02_detection_sample/02_ultralytics_yolo11/`.

</DocScope>
<DocScope products="RDK-S600">

This example performs image object detection with the Ultralytics YOLO11 model using C/C++. It supports image preprocessing, inference, post-processing (including decoding, confidence filtering, and NMS), and result image saving. The sample code is located in `/app/cdev_demo/bpu/detection_sample/ultralytics_yolo11/`.

</DocScope>

## Model Description
- Overview:

    Ultralytics YOLO11 is a lightweight anchor-based object detection model that combines anchor-free and anchor-based ideas, offering fast inference and accurate localization. During the regression stage, it uses discrete regression bins combined with softmax classification and decoding to improve localization accuracy. Ultralytics YOLO11 is suitable for deploying small models in real-time scenarios such as security monitoring and industrial inspection.

<DocScope products="RDK-S100">

- HBM model name: yolo11n_detect_nashe_640x640_nv12.hbm

</DocScope>
<DocScope products="RDK-S600">

- HBM model name: yolo11n_detect_nashp_640x640_nv12.hbm

</DocScope>

- Input format: NV12, size 640x640 (Y and UV planes separated)

- Output: Multi-scale feature maps, each containing class score tensors and discrete bounding box regression tensors; final output includes bounding box coordinates, class IDs, and confidence scores

## Feature Overview
- Model loading

   Load the quantized Ultralytics YOLO11 model and extract model metadata for the inference pipeline.

- Input preprocessing

    Resize the original BGR image to 640×640, convert it to NV12 format (Y and UV separated), and construct a nested dictionary input tensor for the inference interface.

- Inference execution

    Run the forward pass via the `.infer()` method, producing classification and regression tensors at multiple scale branches.

- Result post-processing

    - Dequantize the output to float32;

    - Filter classification scores at each scale branch and keep candidate boxes above the confidence threshold;

    - Decode bounding boxes using the multi-bin regression algorithm;

    - Merge candidates from all scales and apply NMS (non-maximum suppression) to remove redundant boxes;

    - Map detection boxes from the model input coordinate system back to the original image size;

    - Optionally draw detection results and save the output image.

## Environment Dependencies
Before building and running, ensure the following dependencies are installed:
```bash
sudo apt update
sudo apt install libgflags-dev
```

## Directory Structure

```text
.
├── CMakeLists.txt               # CMake build script
├── README.md                    # Usage instructions
├── inc
│   └── ultralytics_yolo11.hpp   # YOLO11 model wrapper header
└── src
    ├── main.cc                  # Main program entry point
    └── ultralytics_yolo11.cc    # YOLO11 model implementation
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
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolo11n_detect_nashe_640x640_nv12.hbm
```

</DocScope>
<DocScope products="RDK-S600">

```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ultralytics_YOLO/yolo11n_detect_nashp_640x640_nv12.hbm
```

</DocScope>

## Parameter Reference

<DocScope products="RDK-S100">

| Parameter       | Description                                              | Default Value                                                       |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| `--model_path`  | Model file path (.hbm format)                            | `/opt/hobot/model/s100/basic/yolo11n_detect_nashe_640x640_nv12.hbm` |
| `--test_img`    | Input test image path                                    | `/app/res/assets/kite.jpg`                                          |
| `--label_file`  | Class label file path (one class name per line)          | `/app/res/labels/coco_classes.names`                                |
| `--score_thres` | Confidence filter threshold (targets below this are discarded) | `0.25`                                                        |
| `--nms_thres`   | IoU threshold for NMS (non-maximum suppression)          | `0.7`                                                               |

</DocScope>
<DocScope products="RDK-S600">

| Parameter       | Description                                              | Default Value                                                       |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| `--model_path`  | Model file path (.hbm format)                            | `/opt/hobot/model/s600/basic/yolo11n_detect_nashp_640x640_nv12.hbm` |
| `--test_img`    | Input test image path                                    | `/app/res/assets/kite.jpg`                                          |
| `--label_file`  | Class label file path (one class name per line)          | `/app/res/labels/coco_classes.names`                                |
| `--score_thres` | Confidence filter threshold (targets below this are discarded) | `0.25`                                                        |
| `--nms_thres`   | IoU threshold for NMS (non-maximum suppression)          | `0.7`                                                               |

</DocScope>


## Quick Start
- Run the model
    - Use default parameters
        ```bash
        ./ultralytics_yolo11
        ```
    - Run with custom parameters

        <DocScope products="RDK-S100">

        ```bash
        ./ultralytics_yolo11 \
            --model_path /opt/hobot/model/s100/basic/yolo11n_detect_nashe_640x640_nv12.hbm \
            --test_img /app/res/assets/kite.jpg \
            --label_file /app/res/labels/coco_classes.names \
            --score_thres 0.25 \
            --nms_thres 0.7
        ```

        </DocScope>
        <DocScope products="RDK-S600">

        ```bash
        ./ultralytics_yolo11 \
            --model_path /opt/hobot/model/s600/basic/yolo11n_detect_nashp_640x640_nv12.hbm \
            --test_img /app/res/assets/kite.jpg \
            --label_file /app/res/labels/coco_classes.names \
            --score_thres 0.25 \
            --nms_thres 0.7
        ```

        </DocScope>
- View the results

    After a successful run, detection boxes are drawn on the original image and saved to `build/result.jgp`.
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
