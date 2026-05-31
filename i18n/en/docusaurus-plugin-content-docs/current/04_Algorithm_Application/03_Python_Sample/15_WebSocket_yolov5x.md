---
sidebar_position: 15
---

# WebSocket YOLOv5x Inference

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">

This sample demonstrates how to run Ultralytics YOLOv5x object detection on an embedded platform with HBM acceleration and a VIO camera module (such as RDK S100), and stream JPEG images and detection boxes to clients in real time over WebSocket. The sample code is located in `/app/pydev_demo/11_web_display_camera_sample/`.

</DocScope>
<DocScope products="RDK-S600">

This sample demonstrates how to run Ultralytics YOLOv5x object detection on an embedded platform with HBM acceleration and a VIO camera module (such as RDK S600), and stream JPEG images and detection boxes to clients in real time over WebSocket. The sample code is located in `/app/pydev_demo/web_display_camera_sample/`.

</DocScope>

## Features

- Model loading

    Initialize `hbm_runtime`, load the model, and obtain input/output names and dimensions.

- Preprocessing

    Split raw NV12 images into Y/UV channels, scale them to the model input size, and build input tensors in the required format.

- Inference

    Call `.run()` to execute BPU inference.

- Postprocessing

    Decode inference results, filter low-confidence detections, apply NMS, and scale results back to the original image size.

- Camera management (`CameraManager`)

    Open the camera, obtain raw or model-sized images, and encode them as JPEG.

- WebSocket server

    Accept web client connections, continuously fetch camera frames, run detection, and return Protocol Buffer results to the web client.

## Model Description

    See the [Ultralytics YOLOv5x object detection sample](./04_Ultralytics_YOLOv5x.md) section.

## Environment Dependencies
- Ensure the dependencies in `pydev` are installed
    ```bash
    pip install -r ../requirements.txt
    ```
- Install WebSocket packages

    <DocScope products="RDK-S100">
    ```bash
    pip install websockets==15.0.1 protobuf==3.20.3
    ```

    </DocScope>
    <DocScope products="RDK-S600">
    ```bash
    pip install websockets==15.0.1 protobuf==3.20.3 --break-system-packages
    ```

    </DocScope>

## Hardware Requirements
- The MIPI camera interface uses auto-detection mode. Only one MIPI camera may be connected when running this sample (any MIPI port is supported). Connecting multiple cameras will cause errors.
- This sample currently supports only MIPI sensors: IMX219 and SC230AI.

<DocScope products="RDK-S100">

- For MIPI camera installation, refer to [Camera Expansion Board - MIPI Camera Interface](../../01_Quick_start/01_hardware_introduction/01_rdk_s100/02_rdk_s100_camera_expansion_board.md#mipi-camera-interfaces-j2200-j2201).

</DocScope>
<DocScope products="RDK-S600">

- For MIPI camera installation, refer to [MIPI Camera Interface](../../01_Quick_start/01_hardware_introduction/02_rdk_s600/index.md#mipi-camera-interface-j11j13).

</DocScope>

## Directory Structure
```text
.
├── mipi_camera_web_yolov5x.py      # Main program
└── README.md                       # Usage instructions
```

## Parameter Description

<DocScope products="RDK-S100">
| Parameter      | Description                                              | Default Value                               |
| --------------- | -------------------------------------------------------- | --------------------------------------------- |
| `--model-path`  | BPU quantized model path (`.hbm`)                        | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm` |
| `--priority`    | Inference priority (`0~255`, `255` is highest)           | `0`                                           |
| `--bpu-cores`   | BPU core index list (for example, `0 1`)                 | `[0]`                                         |
| `--label-file`  | Class label file path                                    | `/app/res/labels/coco_classes.names`          |
| `--nms-thres`   | IoU threshold for Non-Maximum Suppression (NMS)          | `0.45`                                        |
| `--score-thres` | Detection confidence threshold                           | `0.25`                                        |

</DocScope>
<DocScope products="RDK-S600">
| Parameter      | Description                                              | Default Value                               |
| --------------- | -------------------------------------------------------- | --------------------------------------------- |
| `--model-path`  | BPU quantized model path (`.hbm`)                        | `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` |
| `--priority`    | Inference priority (`0~255`, `255` is highest)           | `0`                                           |
| `--bpu-cores`   | BPU core index list (for example, `0 1`)                 | `[0]`                                         |
| `--label-file`  | Class label file path                                    | `/app/res/labels/coco_classes.names`          |
| `--nms-thres`   | IoU threshold for Non-Maximum Suppression (NMS)          | `0.45`                                        |
| `--score-thres` | Detection confidence threshold                           | `0.25`                                        |

</DocScope>


## Quick Start
- Start the web service
    ```bash
    # 1. Enter the webservice directory
    cd webservice/

    # 2. Start the service
    sudo ./sbin/nginx -p .
    ```
- Run the model
    - Return to the sample directory
        ```bash
        cd ..
        ```
    - Use default parameters
        ```bash
        python mipi_camera_web_yolov5x.py
        ```
    - Run with specified parameters

        <DocScope products="RDK-S100">
        ```bash
        python mipi_camera_web_yolov5x.py \
        --model-path /opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm \
        --priority 0 \
        --bpu-cores 0 \
        --label-file /app/res/labels/coco_classes.names \
        --nms-thres 0.45 \
        --score-thres 0.25
        ```

        </DocScope>
        <DocScope products="RDK-S600">
        ```bash
        python mipi_camera_web_yolov5x.py \
        --model-path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
        --priority 0 \
        --bpu-cores 0 \
        --label-file /app/res/labels/coco_classes.names \
        --nms-thres 0.45 \
        --score-thres 0.25
        ```

        </DocScope>

- View results

    After successful execution, open the web display at: `http://IP`

    **Note: Do not include a port number.**

- Exit

    Press `Ctrl+C` in the terminal.

## Notes

<DocScope products="RDK-S100">
- If the specified model path does not exist, try searching under `/opt/hobot/model/s100/basic/`.

</DocScope>
<DocScope products="RDK-S600">
- If the specified model path does not exist, try searching under `/opt/hobot/model/s600/basic/`.

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
