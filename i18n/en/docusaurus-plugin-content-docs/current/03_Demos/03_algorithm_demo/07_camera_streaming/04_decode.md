---
sidebar_position: 15
---

# Video Decode and YOLOv5x Inference

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">

This sample demonstrates how to combine SP decode/display/VIO modules with the BPU on platforms such as RDK S100 to implement an end-to-end pipeline:
local H.264 file → hardware decode (NV12) → YOLOv5x inference → overlay boxes on the display layer. The sample code is located in `/app/cdev_demo/bpu/decode_yolov5x_display_sample`.

</DocScope>
<DocScope products="RDK-S600">

This sample demonstrates how to combine SP decode/display/VIO modules with the BPU on platforms such as RDK S600 to implement an end-to-end pipeline:
local H.264 file → hardware decode (NV12) → YOLOv5x inference → overlay boxes on the display layer. The sample code is located in `/app/cdev_demo/bpu/decode_yolov5x_display_sample`.

</DocScope>

## Feature Overview

- Model loading

    Load the model and obtain input/output related information.

- Preprocessing

    Convert NV12 frames obtained from VIO to BGR (`cv::cvtColor`), apply letterbox/scaling, and write to the NV12 input tensor.

- Inference

    Call `infer()` to execute forward computation on the BPU.

- Postprocessing

    Call `yolov5x.post_process(score_thres, nms_thres, W, H)` to complete decoding, confidence filtering, and NMS, and restore box coordinates to the original resolution.

- Camera management (VIO)

    Open the sensor channel through `sp_open_camera_v2` and pull NV12 frames with `sp_vio_get_yuv`.

- Screen overlay (SP Display)

    Initialize the display channel with `sp_start_display`; draw detection results on screen with `draw_detections_on_disp`.

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
|-- CMakeLists.txt                     # CMake build script (target/dependency/include/link)
|-- README.md                          # Usage instructions
|-- inc
|   `-- ultralytics_yolov5x.hpp        # YOLOv5x wrapper header: load/preprocess/infer/postprocess interfaces
`-- src
    |-- main.cc                        # Program entry: H.264 decode → infer → display overlay (Ctrl+C to exit)
    `-- ultralytics_yolov5x.cc         # YOLOv5x implementation: letterbox, NV12 tensor write, decode, NMS, coordinate restoration
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
| Parameter       | Description                                              | Default Value                                              |
| --------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| `--width`       | Source stream/decode expected width (pixels)             | `1920`                                                     |
| `--height`      | Source stream/decode expected height (pixels)            | `1080`                                                     |
| `--input_path`  | Input H.264 file path (local file in this example; can be extended to stream pipelines) | `/app/res/assets/1080P_test.h264` |
| `--model_path`  | YOLOv5x quantized model (`.hbm`) path                      | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm`     |
| `--label_file`  | Class name list file (one class name per line)           | `/app/res/labels/coco_classes.names`                       |
| `--score_thres` | Confidence threshold (filter low-score boxes)          | `0.25`                                                     |
| `--nms_thres`   | NMS IoU threshold                                        | `0.45`                                                     |

</DocScope>
<DocScope products="RDK-S600">
| Parameter       | Description                                              | Default Value                                              |
| --------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| `--width`       | Source stream/decode expected width (pixels)             | `1920`                                                     |
| `--height`      | Source stream/decode expected height (pixels)            | `1080`                                                     |
| `--input_path`  | Input H.264 file path (local file in this example; can be extended to stream pipelines) | `/app/res/assets/1080P_test.h264` |
| `--model_path`  | YOLOv5x quantized model (`.hbm`) path                      | `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`     |
| `--label_file`  | Class name list file (one class name per line)           | `/app/res/labels/coco_classes.names`                       |
| `--score_thres` | Confidence threshold (filter low-score boxes)          | `0.25`                                                     |
| `--nms_thres`   | NMS IoU threshold                                        | `0.45`                                                     |

</DocScope>

## Quick Start
- Run the model
    - Make sure you are in the `build` directory
    - Use default parameters
        ```bash
        ./decode_yolov5x_display
        ```
    - Run with custom parameters

        <DocScope products="RDK-S100">
        ```bash
        ./decode_yolov5x_display \
            --width 1920 --height 1080 \
            --input_path /app/res/assets/1080P_test.h264 \
            --model_path /opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm \
            --label_file /app/res/labels/coco_classes.names \
            --score_thres 0.25 \
            --nms_thres 0.45
        ```

        </DocScope>
        <DocScope products="RDK-S600">
        ```bash
        ./decode_yolov5x_display \
            --width 1920 --height 1080 \
            --input_path /app/res/assets/1080P_test.h264 \
            --model_path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
            --label_file /app/res/labels/coco_classes.names \
            --score_thres 0.25 \
            --nms_thres 0.45
        ```

        </DocScope>

- Exit

    Press `Ctrl+C` in the terminal.

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
