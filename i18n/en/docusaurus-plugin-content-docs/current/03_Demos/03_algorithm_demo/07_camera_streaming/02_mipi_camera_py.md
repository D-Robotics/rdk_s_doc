---
title: MIPI Camera YOLOv5x Inference (Python)
sidebar_position: 6
description: "Preset sample for real-time YOLOv5x detection with a MIPI camera using the hbm_runtime Python interface"
---

# MIPI Camera YOLOv5x Inference (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates how to deploy a quantized Ultralytics YOLOv5x model using the `hbm_runtime` Python interface, read frames in real time from a MIPI camera (onboard camera interface) for object detection, and visualize the results. It applies to RDK devices with a BPU and requires a MIPI camera module and display. For the C++ version, see [MIPI Camera YOLOv5x Inference](./02_mipi_camera.md).

:::tip
The sample code is located at `/app/pydev_demo/mipi_camera_sample/` on the board. It has been verified on the board.
:::

## Prerequisites

- The MIPI camera module is connected to the onboard MIPI interface and detected.
- A desktop environment or display is available.
- The preset model is in place: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`).

## Environment Dependencies

Depends on the `pydev_demo` common utility library (`utils`). If missing dependencies are reported:

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

Board path: `/app/pydev_demo/mipi_camera_sample/`

Directory structure:

```text
.
├── 01_mipi_camera_yolov5x.py    # Main program: real-time MIPI camera object detection and display
├── 02_mipi_camera_dump.py       # Capture image frames and save them as YUV files
├── 03_mipi_camera_scale.py      # Local YUV image scaling
├── 04_mipi_camera_crop_scale.py # Local YUV image crop and scale
├── 05_mipi_camera_streamer.py   # Camera HDMI real-time echo
└── README.md                    # Usage instructions
```

This document uses `01_mipi_camera_yolov5x.py` as an example to describe object detection inference.

## Parameter Reference

| Parameter | Description | Default Value |
|---|---|---|
| `--model-path` | BPU quantized model path (.hbm) | Auto-selected by SoC: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`) |
| `--priority` | Inference priority (0~255, 255 is highest) | `0` |
| `--bpu-cores` | BPU core index list (e.g. `--bpu-cores 0 1`) | `[0]` |
| `--label-file` | Class labels (COCO) | `/app/res/labels/coco_classes.names` |
| `--nms-thres` | IoU threshold for NMS | `0.45` |
| `--score-thres` | Detection confidence threshold | `0.25` |

## Usage

```bash
cd /app/pydev_demo/mipi_camera_sample
python 01_mipi_camera_yolov5x.py
```

After running, frames are captured in real time from the MIPI camera → YOLOv5x inference → detection boxes are displayed; press `Ctrl+C` to exit.

## Running Results

The actual output on this board (no MIPI camera connected) is:

```text
No camera sensor found, please check whether the camera connection or video_idx is correct.
[OpenCamera] CamInitParam failed error(-1)
```

Indicators of success after connecting a MIPI camera (per the source code `01_mipi_camera_yolov5x.py`): after the camera is initialized successfully, the model is loaded and the screen displays the real-time frame with detection boxes.

<!-- TODO: 待接入摄像头实测成功 log -->

## FAQ

- **`No camera sensor found`**: the MIPI camera is not recognized; check the sensor with `dmesg | grep -i sensor`, and confirm the ribbon cable is properly connected and the camera is detected.
- **No image displayed**: a desktop/display environment is required.
- **Low frame rate**: increase `--bpu-cores` or lower the resolution.
- **Error `No module named 'utils'`**: not run in the sample directory; `cd` into `mipi_camera_sample/` and run again (it depends on the parent `utils`).

## Related Documentation

- [C++ MIPI Camera Sample](./02_mipi_camera.md)
- [Object Detection - YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)