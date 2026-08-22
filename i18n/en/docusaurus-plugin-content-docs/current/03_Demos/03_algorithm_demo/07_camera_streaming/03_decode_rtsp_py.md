---
sidebar_position: 7
title: "RTSP Stream Pull and YOLOv5x Inference (Python)"
description: "Preset sample for pulling frames from an RTSP stream and performing real-time YOLOv5x detection using the hbm_runtime Python interface"
---

# RTSP Stream Pull and YOLOv5x Inference (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates how to deploy a quantized Ultralytics YOLOv5x model using the `hbm_runtime` Python interface, pull frames from an RTSP video stream for object detection, and display the results. It applies to BPU-equipped RDK devices and requires an RTSP video source (camera/NVR/local RTSP service). For the C/C++ version, see [RTSP Stream Pull and YOLOv5x Inference](./03_decode_rtsp.md).

:::tip
The sample code is located at `/app/pydev_demo/rtsp_yolov5x_display_sample/` on the board. It has been verified on the board.
:::

## Prerequisites

- An accessible RTSP stream address (e.g. `rtsp://<ip>/<stream>`).
- A desktop/display environment.
- The preset model is in place: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`).

## Environment Dependencies

Depends on the `pydev_demo` shared utility library (`utils`). If dependencies are reported missing:

<DocScope products="RDK S100">

```bash
cd /app/pydev_demo && pip install -r requirements.txt
```

</DocScope>
<DocScope products="RDK S600">

```bash
cd /app/pydev_demo && pip install -r requirements.txt --break-system-packages
```

</DocScope>

## Code Location

Board path: `/app/pydev_demo/rtsp_yolov5x_display_sample/`

Directory structure:

```text
.
├── README.md                 # Usage instructions
└── rtsp_yolov5x_display.py   # Main program
```

## Parameter Reference

| Parameter | Description | Default Value |
|---|---|---|
| `--rtsp-urls` / `-u` | RTSP stream address (separate multiple streams with semicolons, e.g. `rtsp://192.168.1.10/s1;rtsp://192.168.1.11/s2`) | `rtsp://127.0.0.1/assets/1080P_test.h264` |
| `--model-path` | BPU quantized model path (`.hbm`) | Auto-selected by SoC: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`) |
| `--priority` | Inference priority (`0~255`, `255` is highest) | `0` |
| `--bpu-cores` | BPU core index list (for example, `--bpu-cores 0 1`) | `[0]` |
| `--label-file` | Class label file (COCO) | `/app/res/labels/coco_classes.names` |
| `--nms-thres` | IoU threshold for NMS | `0.45` |
| `--score-thres` | Detection confidence threshold | `0.25` |

## Usage

Before using the default address, start a local RTSP streaming service first (serve `/app/res/assets/1080P_test.h264` as an RTSP stream):

```bash
cd /app/res
sudo chmod +x live555MediaServer
sudo ./live555MediaServer &
```

Then run:

```bash
cd /app/pydev_demo/rtsp_yolov5x_display_sample
python rtsp_yolov5x_display.py
```

Run with an explicit stream address:

```bash
python rtsp_yolov5x_display.py --rtsp-urls rtsp://<stream-address>
```

After it starts, frames are pulled from the RTSP stream → YOLOv5x inference → detection boxes are displayed. Press `Ctrl+C` to exit.

## Running Results

The following is the actual output measured on RDK S600 (live555 streaming + default parameters):

```text
['rtsp://127.0.0.1/assets/1080P_test.h264']
RTSP stream frame_width:1920, frame_height:1080
Decoder(0, 1) return:0
Camera vps return:0
Model already exists: /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm
=== Model Name List ===
['yolov5x_672x672_nv12']
```

**Indicators of success**: `RTSP stream frame_width:1920, frame_height:1080` means the RTSP stream was opened successfully. The model is then loaded (which prints `Model Name List`), and the screen displays the real-time frame with detection boxes.

## FAQ

- **Stream pull failure/timeout**: confirm the RTSP address is reachable and the network works; verify the stream with `ffprobe rtsp://...` or VLC.
- **No image displayed**: a display environment is required.
- **Multiple streams are laggy**: the BPU has a limit on parallel multi-stream processing; reduce the number of streams or increase `--bpu-cores`.
- **Error: model not found**: check whether the `.hbm` file exists under `--model-path`.

## Related Documentation

- [C/C++ RTSP Sample](./03_decode_rtsp.md)
- [Object Detection - YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
- [WebSocket YOLOv5x Inference (Python)](./04_websocket_py.md)
- [Python Inference API](../../../04_Simple_API/02_inference_api/02_python_api.md)
- [DECODER (Decode Module) API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md)