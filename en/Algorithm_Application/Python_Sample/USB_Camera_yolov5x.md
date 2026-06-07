# USB Camera YOLOv5x Inference

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/Python_Sample/USB_Camera_yolov5x

This is a real-time Ultralytics YOLOv5x inference sample based on `hbm_runtime` . It reads frames from a USB camera for object detection and visualizes the results in fullscreen. The sample code is located in `/app/pydev_demo/09_usb_camera_sample/` .

This is a real-time Ultralytics YOLOv5x inference sample based on `hbm_runtime` . It reads frames from a USB camera for object detection and visualizes the results in fullscreen. The sample code is located in `/app/pydev_demo/usb_camera_sample/` .

## Features

- Model loading

Load the specified `.hbm` model file through `hbm_runtime` and extract model name, input/output shapes, quantization information, and more.
- Camera capture

Automatically scan devices under `/dev/video*` , open the first available USB camera, and configure MJPEG encoding, 1080p resolution, and 30 FPS.
- Image preprocessing

Resize BGR images to the model input resolution (letterbox or plain scaling) and convert them to NV12 format.
- Inference execution

Submit input tensors through the `run()` method to perform model forward inference on the BPU.
- Postprocessing

Includes quantized output decoding, candidate box filtering (by score threshold), NMS deduplication, and coordinate mapping back to the original image size.
- Visualization

Draw detection boxes with class labels and confidence scores on the image, display them fullscreen in a window, and support real-time processing and exit control.

## Model Description

See the [Ultralytics YOLOv5x object detection sample](/rdk_s_doc/en/Algorithm_Application/Python_Sample/Ultralytics_YOLOv5x) section.

## Environment Dependencies

- Ensure the dependencies in `pydev` are installed

```bash
pip install -r ../requirements.txt
```

```bash
pip install -r ../requirements.txt --break-system-packages
```

## Directory Structure

```text
.
├── usb_camera_yolov5x.py       # Main program
└── README.md                   # Usage instructions
```

## Parameter Description

| Parameter | Description | Default Value 
| `--model-path` | BPU quantized model path ( `.hbm` ) | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm` 
| `--priority` | Inference priority ( `0~255` , `255` is highest) | `0` 
| `--bpu-cores` | BPU core index list (for example, `0 1` ) | `[0]` 
| `--label-file` | Class label file path | `/app/res/labels/coco_classes.names` 
| `--nms-thres` | IoU threshold for Non-Maximum Suppression (NMS) | `0.45` 
| `--score-thres` | Detection confidence threshold | `0.25` 

| Parameter | Description | Default Value 
| `--model-path` | BPU quantized model path ( `.hbm` ) | `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` 
| `--priority` | Inference priority ( `0~255` , `255` is highest) | `0` 
| `--bpu-cores` | BPU core index list (for example, `0 1` ) | `[0]` 
| `--label-file` | Class label file path | `/app/res/labels/coco_classes.names` 
| `--nms-thres` | IoU threshold for Non-Maximum Suppression (NMS) | `0.45` 
| `--score-thres` | Detection confidence threshold | `0.25` 

## Quick Start

Note: This program must run in a desktop environment.

- Run the model

- Use default parameters

```bash
python usb_camera_yolov5x.py
```
- Run with specified parameters

```bash
python usb_camera_yolov5x.py \
--model-path /opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm \
--priority 0 \
--bpu-cores 0 \
--label-file /app/res/labels/coco_classes.names \
--nms-thres 0.45 \
--score-thres 0.25
```

```bash
python usb_camera_yolov5x.py \
--model-path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
--priority 0 \
--bpu-cores 0 \
--label-file /app/res/labels/coco_classes.names \
--nms-thres 0.45 \
--score-thres 0.25
```
- Exit

Move the mouse over the display window and press `q` to quit.
- View results

After successful execution, object detection results are displayed on screen in real time.

## Notes

- This program must run in a desktop environment.

- If the specified model path does not exist, try searching under `/opt/hobot/model/s100/basic/` .

- If the specified model path does not exist, try searching under `/opt/hobot/model/s600/basic/` .

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
