---
sidebar_position: 16
---

# RTSP Stream Pull and YOLOv5x Inference

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">

This sample demonstrates how to combine SP hardware modules (decoder, VIO, display) with the BPU on platforms such as RDK S100 to implement:
RTSP/H.264 video stream → hardware decode (NV12) → YOLOv5x inference → overlay detection boxes → real-time display. The sample code is located in `/app/pydev_demo/12_rtsp_yolov5x_display_sample/`.

</DocScope>
<DocScope products="RDK-S600">

This sample demonstrates how to combine SP hardware modules (decoder, VIO, display) with the BPU on platforms such as RDK S600 to implement:
RTSP/H.264 video stream → hardware decode (NV12) → YOLOv5x inference → overlay detection boxes → real-time display. The sample code is located in `/app/pydev_demo/rtsp_yolov5x_display_sample/`.

</DocScope>

## Features

- Model loading

    Load the YOLOv5x model with `hbm_runtime.HB_HBMRuntime(model_path)`, read input/output information, and configure BPU priority and core binding through `set_scheduling_params()`.

- Preprocessing

    Obtain NV12 frames from the decode thread, split Y/UV channels, resize to model input dimensions, and pack them into BPU input format.

- Inference

    Call `self.model.run()` to perform forward inference and generate detection results.

- Postprocessing

    Dequantize inference outputs, decode, filter, apply NMS, map coordinates to the display resolution, and output detection boxes and classes.

- RTSP decoding

    A child thread uses `cv2.VideoCapture` to pull H.264 streams and hardware-decodes them to NV12 frames through `srcampy.Decoder`.

- Resolution and display (VPS + Display)

    Call `srcampy.Display()` and `srcampy.Camera().open_vps()` to build a VPS → HDMI display pipeline.

- Overlay drawing

    Use `draw.draw_detections_on_disp()` to draw detection boxes and class labels on the display layer.

- Signal handling

    Catch `SIGINT` (`Ctrl+C`), set `is_stop=True`, safely exit the main loop and child threads, and close VPS, display, and decoder in order.

- Threading and frame queue

    `DecodeRtspStream` inherits from `threading.Thread` and maintains a frame queue; the main thread obtains the latest frame through `get_frame()`.

- Argument parsing

    Provide parameters through `argparse`: RTSP source, model path, BPU cores, priority, label file, NMS threshold, and confidence threshold.

- HDMI resolution detection

    Call `/usr/bin/get_hdmi_res` to obtain the current HDMI resolution; default to 1920×1080 if unavailable.

## Model Description

    See the [Ultralytics YOLOv5x object detection sample](./04_Ultralytics_YOLOv5x.md) section.


## Environment Dependencies
This sample has no special environment requirements. You only need to ensure the dependencies in `pydev` are installed.

<DocScope products="RDK-S100">
```bash
pip install -r ../requirements.txt
```

</DocScope>
<DocScope products="RDK-S600">
```bash
pip install -r ../requirements.txt --break-system-packages
```

</DocScope>

## Directory Structure

```text
.
├── README.md               # Usage instructions
└── rtsp_yolov5x_display.py # Main program
```

## Parameter Description

<DocScope products="RDK-S100">
| Parameter       | Description                                              | Default Value                               |
| ----------------------- | -------------------------------------------------------- | --------------------------------------------- |
| `--rtsp-urls` / `-u` | RTSP stream URL(s); multiple streams can be separated by semicolons (for example: `rtsp://192.168.1.10/stream1;rtsp://192.168.1.11/stream2`) | `rtsp://127.0.0.1/1080P_test.h264` |
| `--model-path`  | BPU quantized model path (`.hbm`)                        | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm` |
| `--priority`    | Inference priority (`0~255`, `255` is highest)           | `0`                                           |
| `--bpu-cores`   | BPU core index list (for example, `0 1`)                 | `[0]`                                         |
| `--label-file`  | Class label file path                                    | `/app/res/labels/coco_classes.names`          |
| `--nms-thres`   | IoU threshold for Non-Maximum Suppression (NMS)          | `0.45`                                        |
| `--score-thres` | Detection confidence threshold                           | `0.25`                                        |

</DocScope>
<DocScope products="RDK-S600">
| Parameter       | Description                                              | Default Value                               |
| ----------------------- | -------------------------------------------------------- | --------------------------------------------- |
| `--rtsp-urls` / `-u` | RTSP stream URL(s); multiple streams can be separated by semicolons (for example: `rtsp://192.168.1.10/stream1;rtsp://192.168.1.11/stream2`) | `rtsp://127.0.0.1/1080P_test.h264` |
| `--model-path`  | BPU quantized model path (`.hbm`)                        | `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` |
| `--priority`    | Inference priority (`0~255`, `255` is highest)           | `0`                                           |
| `--bpu-cores`   | BPU core index list (for example, `0 1`)                 | `[0]`                                         |
| `--label-file`  | Class label file path                                    | `/app/res/labels/coco_classes.names`          |
| `--nms-thres`   | IoU threshold for Non-Maximum Suppression (NMS)          | `0.45`                                        |
| `--score-thres` | Detection confidence threshold                           | `0.25`                                        |

</DocScope>


## Quick Start
- Prepare RTSP stream

    Use the built-in streaming service to prepare an RTSP stream as input. The service converts the `1080P_test.h264` video file into an RTSP stream at `rtsp://127.0.0.1/assets/1080P_test.h264`. Start the streaming service with:
    ```bash
    cd /app/res
    sudo chmod +x live555MediaServer
    sudo ./live555MediaServer &
    ```
- Run the model
    - Use default parameters
        ```bash
        python rtsp_yolov5x_display.py
        ```
    - Run with specified parameters

        <DocScope products="RDK-S100">
        ```bash
        python rtsp_yolov5x_display.py \
        --rtsp-urls rtsp://127.0.0.1/assets/1080P_test.h264 \
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
        python rtsp_yolov5x_display.py \
        --rtsp-urls rtsp://127.0.0.1/assets/1080P_test.h264 \
        --model-path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
        --priority 0 \
        --bpu-cores 0 \
        --label-file /app/res/labels/coco_classes.names \
        --nms-thres 0.45 \
        --score-thres 0.25
        ```

        </DocScope>

- Exit

    Press `Ctrl+C` in the terminal.

- View results

    After successful execution, object detection results are displayed on screen in real time.

## Notes
- This program must run in a desktop environment.

- For more deployment options or supported models, refer to the official documentation or contact platform technical support.

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
