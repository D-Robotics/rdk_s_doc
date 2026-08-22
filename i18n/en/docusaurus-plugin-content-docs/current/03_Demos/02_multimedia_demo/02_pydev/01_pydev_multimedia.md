---
title: "Python Multimedia Examples"
sidebar_position: 1
description: "RDK S100/S600 Python multimedia capture/display/codec examples"
---

# Python Multimedia Examples

This section introduces examples of multimedia capture, display and encoding/decoding using the Python interface. The Python interface is `libsrcampy` (package name `hobot_vio`), providing objects such as `Camera` / `Encoder` / `Decoder` / `Display`, corresponding to the C cdev examples.

:::tip
The example source code is pre-installed in the `/app/pydev_demo/` directory on the board. Python scripts do not need compilation — just run them directly.
:::

## Prerequisites

- The development board is flashed with RDK OS and booted (see [Getting Started with RDK](../../../01_Quick_start/02_getting_started.md))
- A MIPI camera or USB camera is connected (depending on the example)
- An HDMI display is connected (for display-type examples)
- Python dependencies are installed:

```bash
pip install -r /app/pydev_demo/requirements.txt
```

## Code Location

On-board path: `/app/pydev_demo/`

```
pydev_demo/
├── mipi_camera_sample/           # MIPI camera capture/scale/crop/streaming
│   ├── 02_mipi_camera_dump.py    #   capture and save YUV
│   ├── 03_mipi_camera_scale.py   #   VPS scale
│   ├── 04_mipi_camera_crop_scale.py # VPS crop + scale
│   ├── 05_mipi_camera_streamer.py   # capture → HDMI display
│   └── 01_mipi_camera_yolov5x.py    # object detection (see algorithm examples)
├── usb_camera_sample/            # USB camera + object detection
├── rtsp_yolov5x_display_sample/  # RTSP pull stream + object detection + display
├── web_display_camera_sample/    # Web display + object detection
└── requirements.txt
```

> The object detection examples (`01_mipi_camera_yolov5x.py`, `usb_camera_sample`, etc.) are covered in [Model Zoo Overview](../../03_algorithm_demo/01_summary.md). This section focuses on multimedia capture / display / encoding & decoding.

## Usage

Python examples do not need compilation — just run them directly:

```bash
# capture → HDMI display (connectivity test, requires desktop environment)
cd /app/pydev_demo/mipi_camera_sample
python3 05_mipi_camera_streamer.py -w 1920 -h 1080

# capture and save YUV
python3 02_mipi_camera_dump.py -f 30 -c 10 -w 1920 -h 1080

# VPS scale (input is a YUV file in NV12 format)
python3 03_mipi_camera_scale.py -i input.yuv -o output.yuv \
  -w 640 -h 360 --iwidth 1920 --iheight 1080

# VPS crop + scale
python3 04_mipi_camera_crop_scale.py -i input.yuv -o output.yuv \
  -w 640 -h 480 --iwidth 1920 --iheight 1080 \
  -x 304 -y 304 --crop_w 896 --crop_h 592
```

## Code Walkthrough

The Python examples use the object interface of `hobot_vio`. Core flow:

```python
from hobot_vio import libsrcampy

# create objects
cam = libsrcampy.Camera()      # Camera object: capture + VPS
disp = libsrcampy.Display()    # Display object: HDMI output

# capture → display
cam.open_cam(0, -1, 30, 1920, 1080)  # open the MIPI camera
disp.display(0, 1920, 1080)          # open the display channel
libsrcampy.bind(cam, disp)           # bind capture to display
```

- `Camera` object — wraps VIO capture and VPS, see [Camera Object](../../../04_Simple_API/01_multimedia_api/pydev/02_object_camera.md) for details
- `Display` object — wraps display output, see [Display Object](../../../04_Simple_API/01_multimedia_api/pydev/05_object_display.md) for details
- `Encoder` / `Decoder` objects — wrap encoding/decoding, see [Encoder Object](../../../04_Simple_API/01_multimedia_api/pydev/03_object_encoder.md) / [Decoder Object](../../../04_Simple_API/01_multimedia_api/pydev/04_object_decoder.md) for details

## Run Results

- `05_mipi_camera_streamer.py` — the HDMI display shows the camera image in real time
- `02_mipi_camera_dump.py` — the script directory generates capture files `output0.yuv`, `output1.yuv`…
- `03_mipi_camera_scale.py` / `04_mipi_camera_crop_scale.py` — generate the scaled / cropped YUV files

## FAQ

### `Failed to open camera` message

**Cause**: No camera is connected, or multiple MIPI cameras are connected at the same time.

**Solution**: The MIPI camera interface uses auto-detection mode, so only one MIPI camera can be connected at a time; connecting more than one causes an error.

### No image from display-type examples

**Cause**: Display-type scripts must be run in a desktop environment.

**Solution**: Use the desktop image and run them within a desktop session.

## Related Documentation

- [C Language Examples](../01_cdev/01_vio_capture.md)
- [Multimedia Interface Description](../../../04_Simple_API/01_multimedia_api/pydev/01_pydev_multimedia_api.md)
- [Camera Object](../../../04_Simple_API/01_multimedia_api/pydev/02_object_camera.md)
- [Display Object](../../../04_Simple_API/01_multimedia_api/pydev/05_object_display.md)
- [Model Zoo Overview](../../03_algorithm_demo/01_summary.md)
