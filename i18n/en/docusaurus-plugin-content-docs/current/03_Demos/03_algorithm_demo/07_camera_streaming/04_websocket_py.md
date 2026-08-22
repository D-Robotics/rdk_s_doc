---
title: WebSocket YOLOv5x Inference (Python)
sidebar_position: 8
description: "Preset sample for pushing YOLOv5x detection results over WebSocket for browser viewing"
---

# WebSocket YOLOv5x Inference (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates how to deploy a quantized Ultralytics YOLOv5x model using the `hbm_runtime` Python interface, and push the MIPI camera detection results (JPEG image + detection boxes) to a browser frontend in real time over WebSocket. No desktop on the board is required — results are viewed in a PC browser, suitable for Server boards without a display.

:::tip
The sample code is located at `/app/pydev_demo/web_display_camera_sample/` on the board. It has been verified on the board.
:::

## Prerequisites

- The MIPI camera module is connected to the onboard MIPI interface and detected.
- A PC browser (on the same network segment as the board, to receive and display the results).
- The preset model is in place: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`).

## Environment Dependencies

Depends on the `pydev_demo` common utility library (`utils`), and the WebSocket-related packages must be installed:

<DocScope products="RDK-S100">

```bash
cd /app/pydev_demo && pip install -r requirements.txt
pip install websockets==15.0.1 protobuf==3.20.3
```

</DocScope>
<DocScope products="RDK-S600">

```bash
cd /app/pydev_demo && pip install -r requirements.txt --break-system-packages
pip install websockets==15.0.1 protobuf==3.20.3 --break-system-packages
```

</DocScope>

## Code Location

Board path: `/app/pydev_demo/web_display_camera_sample/`

Directory structure:

```text
.
├── mipi_camera_web_yolov5x.py   # Main program: MIPI capture + inference + WebSocket push
├── x3_pb2.py                    # protobuf generated code (detection result serialization)
├── start_nginx.sh               # Frontend nginx start script
├── webservice/                  # nginx + frontend pages (html/modules/protos etc.)
└── README.md                    # Usage instructions
```

## Parameter Reference

| Parameter | Description | Default Value |
|---|---|---|
| `--model-path` | BPU quantized model path (.hbm) | Auto-selected by SoC: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`) |
| `--priority` | Inference priority (0~255, 255 is highest) | `0` |
| `--bpu-cores` | BPU core index list (e.g. `--bpu-cores 0 1`) | `[0]` |
| `--label-file` | Class labels (COCO) | `/app/res/labels/coco_classes.names` |
| `--nms-thres` | IoU threshold for NMS | `0.45` |
| `--score-thres` | Detection confidence threshold | `0.25` |

> The WebSocket service port is fixed at `8080` (hardcoded in the source code) and is not configurable via command-line parameters.

## Usage

1. Start the frontend nginx (in the `webservice/` directory):

```bash
cd /app/pydev_demo/web_display_camera_sample/webservice
sudo ./sbin/nginx -p .
```

2. Return to the sample directory and start the inference + WebSocket service:

```bash
cd /app/pydev_demo/web_display_camera_sample
python mipi_camera_web_yolov5x.py
```

3. Open `http://<board-IP>` in a PC browser to view the detection frames in real time. Press `Ctrl+C` to exit.

## Running Results

The following is the actual output measured on RDK S600 (no MIPI camera connected on this board; only the service startup was verified):

```text
No camera sensor found, please check whether the camera connection or video_idx is correct.
[OpenCamera] CamInitParam failed error(-1)
Model already exists: /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm
=== Model Name List ===
['yolov5x_672x672_nv12']
WebSocket server started on ws://0.0.0.0:8080
```

**Indicators of success**: the last line `WebSocket server started on ws://0.0.0.0:8080` means the WebSocket service is ready. After connecting a MIPI camera, open `http://<board-IP>` in the browser to see the real-time detection frames; if no camera is connected, only `No camera sensor found` is printed and the browser shows no image.

<!-- TODO: 待接入摄像头实测完整推理画面 log -->

## FAQ

- **`No module named 'websockets'`**: install `websockets`/`protobuf` per "Environment Dependencies".
- **Browser cannot connect**: confirm the board and PC are on the same network segment, ports `8080`/`80` are open, the frontend address points to the board IP, and nginx is started in the `webservice/` directory.
- **No inference frames**: confirm the MIPI camera is connected and detected (`dmesg | grep -i sensor`).

## Related Documentation

- [Video Decode and YOLOv5x Inference (C/C++)](./04_decode.md)
- [Object Detection - YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)