---
sidebar_position: 13
---

# USB Camera YOLOv5x Inference

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">
This is a real-time Ultralytics YOLOv5x inference sample based on the BPU. It reads frames from a USB camera for object detection and visualizes the results in fullscreen. The sample code is located in `/app/cdev_demo/bpu/09_usb_camera_sample/`.

</DocScope>
<DocScope products="RDK-S600">
This is a real-time Ultralytics YOLOv5x inference sample based on the BPU. It reads frames from a USB camera for object detection and visualizes the results in fullscreen. The sample code is located in `/app/cdev_demo/bpu/usb_camera_sample/`.

</DocScope>

## Feature Overview
- Model loading

    Load the specified `.hbm` model file and extract related model metadata.

- Camera capture

    Automatically scan devices under `/dev/video*`, open the first available USB camera, and configure MJPEG encoding, 1080p resolution, and 30 FPS.

- Image preprocessing

    Resize BGR images to the model input resolution (letterbox or plain scaling) and convert them to NV12 format.

- Inference execution

    Submit input tensors through the `infer()` method to perform model forward inference on the BPU.

- Postprocessing

    Includes quantized output decoding, candidate box filtering (by score threshold), NMS deduplication, and coordinate mapping back to the original image size.

- Visualization

    Draw detection boxes with class labels and confidence scores on the image, display them fullscreen in a window, and support real-time processing and exit control.

## Model Description

    See the [Ultralytics YOLOv5x object detection sample](./04_Ultralytics_YOLOv5x.md) section.

## Environment Dependencies
Before building and running, ensure the following dependencies are installed:
```bash
sudo apt update
sudo apt install libgflags-dev
```

## Directory Structure
```text
.
|-- CMakeLists.txt                 # CMake build script: target/dependency/include/link configuration
|-- README.md                      # Usage instructions (this file)
|-- inc
|   `-- ultralytics_yolov5x.hpp    # YOLOv5x inference wrapper header: load/preprocess/infer/postprocess interfaces
`-- src
    |-- main.cc                    # Program entry: camera probe → capture → infer → draw → display (fullscreen window)
    `-- ultralytics_yolov5x.cc     # Inference implementation: letterbox, NV12 tensor write, decode, NMS, box restoration
```

## Build the Project
- Configure and build
    ```bash
    mkdir build && cd build
    cmake ..
    make -j$(nproc)
    ```

<DocScope products="RDK-S100">
## Model Download
If the model is not found at runtime, download it with the following command:
```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolov5x_672x672_nv12.hbm
```

</DocScope>
<DocScope products="RDK-S600">
## Model Download
If the model is not found at runtime, download it with the following command:
```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ultralytics_YOLO/yolov5x_672x672_nv12.hbm
```

</DocScope>

## Parameter Reference

<DocScope products="RDK-S100">
| Parameter        | Description                                              | Default Value                                                |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `--video_device` | Specify video device (e.g. `/dev/video0`; auto-detect if empty) | `""` (empty: auto-detect first openable device under `/dev/video*`) |
| `--model_path`   | BPU quantized model path (`.hbm`)                        | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm`        |
| `--label_file`   | Class label file (one class name per line)               | `/app/res/labels/coco_classes.names`                         |
| `--score_thres`  | Confidence threshold                                     | `0.25`                                                       |
| `--nms_thres`    | IoU threshold for NMS                                    | `0.45`                                                       |

</DocScope>
<DocScope products="RDK-S600">
| Parameter        | Description                                              | Default Value                                                |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `--video_device` | Specify video device (e.g. `/dev/video0`; auto-detect if empty) | `""` (empty: auto-detect first openable device under `/dev/video*`) |
| `--model_path`   | BPU quantized model path (`.hbm`)                        | `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`        |
| `--label_file`   | Class label file (one class name per line)               | `/app/res/labels/coco_classes.names`                         |
| `--score_thres`  | Confidence threshold                                     | `0.25`                                                       |
| `--nms_thres`    | IoU threshold for NMS                                    | `0.45`                                                       |

</DocScope>


## Quick Start
Note: This program must run in a desktop environment.
- Run the model
    - Make sure you are in the `build` directory
    - Use default parameters
        ```bash
        ./usb_camera
        ```
    - Run with custom parameters

        <DocScope products="RDK-S100">
        ```bash
        ./usb_camera \
            --video_device /dev/video0 \
            --model_path /opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm \
            --label_file /app/res/labels/coco_classes.names \
            --score_thres 0.25 \
            --nms_thres 0.45
        ```

        </DocScope>
        <DocScope products="RDK-S600">
        ```bash
        ./usb_camera \
            --video_device /dev/video0 \
            --model_path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
            --label_file /app/res/labels/coco_classes.names \
            --score_thres 0.25 \
            --nms_thres 0.45
        ```

        </DocScope>
- Exit

    Move the mouse over the display window and press `q` to quit.

- View the results

    After successful execution, object detection results are displayed on screen in real time.

## Notes
- This program must run in a desktop environment.

- For more deployment options or model support information, refer to the official documentation or contact platform technical support.

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
