---
sidebar_position: 5
title: "USB Camera YOLOv5x Inference (Python)"
description: "Preset sample for real-time YOLOv5x detection with a USB camera using the hbm_runtime Python interface"
---

# USB Camera YOLOv5x Inference (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates how to deploy a quantized Ultralytics YOLOv5x model using the `hbm_runtime` Python interface, read frames in real time from a USB camera for object detection, and visualize the results in fullscreen. It applies to BPU-equipped RDK devices and requires a desktop environment and a USB camera. For the C/C++ version, see [USB Camera YOLOv5x Inference](./01_usb_camera.md).

:::tip
The sample code is located at `/app/pydev_demo/usb_camera_sample/` on the board. It has been verified on the board.
:::

## Prerequisites

- Desktop image (Desktop) is used, or the desktop/console display is accessible.
- A USB camera is connected and detected (`ls /dev/video*` shows a device).
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

Board path: `/app/pydev_demo/usb_camera_sample/`

Directory structure:

```text
.
├── usb_camera_yolov5x.py   # Main program
└── README.md               # Usage instructions
```

## Parameter Reference

| Parameter | Description | Default Value |
|---|---|---|
| `--model-path` | BPU quantized model path (`.hbm`) | Auto-selected by SoC: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`) |
| `--priority` | Inference priority (`0~255`, `255` is highest) | `0` |
| `--bpu-cores` | BPU core index list (for example, `--bpu-cores 0 1`) | `[0]` |
| `--label-file` | Class label file (COCO) | `/app/res/labels/coco_classes.names` |
| `--resize-type` | Resize method (`0` direct resize, `1` letterbox) | `1` |
| `--classes-num` | Number of detection classes | `80` |
| `--nms-thres` | IoU threshold for NMS | `0.45` |
| `--score-thres` | Detection confidence threshold | `0.25` |

## Usage

```bash
cd /app/pydev_demo/usb_camera_sample
python usb_camera_yolov5x.py
```

After it starts, frames are read from the USB camera in real time → YOLOv5x inference → detection boxes are drawn fullscreen. Place the mouse inside the display window and press `q` to exit.

## Running Results

The actual output on this board (no USB camera connected) is:

```text
No USB camera found.
```

Indicators of success after connecting a USB camera (per the source code `usb_camera_yolov5x.py`):

- Prints `Opening video device: /dev/videoN` and `Open USB camera successfully`;
- The fullscreen window displays the real-time frame with detection boxes.

<!-- TODO: 待接入摄像头实测成功 log -->

## FAQ

- **`No USB camera found.`**: the USB camera is not recognized. Check the USB connection, whether `lsusb` lists the device, and whether it is a UVC camera.
- **No image/black screen**: a desktop environment is required (Desktop image or a configured display); the Server version cannot display fullscreen.
- **Low frame rate**: increase `--bpu-cores` to use more BPU cores.
- **Error `No module named 'utils'`**: the program was not run from the sample directory. `cd` into `usb_camera_sample/` and run it there (it depends on the parent `utils`).

## Related Documentation

- [C/C++ USB Camera Sample](./01_usb_camera.md)
- [Object Detection - YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [Python Inference API](../../../04_Simple_API/02_inference_api/02_python_api.md)