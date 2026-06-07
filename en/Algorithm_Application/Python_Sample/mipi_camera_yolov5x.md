# MIPI Camera YOLOv5x Inference

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/Python_Sample/mipi_camera_yolov5x

This is a real-time Ultralytics YOLOv5x inference sample based on `hbm_runtime` . It reads frames from a MIPI camera for object detection and visualizes the results in fullscreen. The sample code is located in `/app/pydev_demo/10_mipi_camera_sample/` .

This is a real-time Ultralytics YOLOv5x inference sample based on `hbm_runtime` . It reads frames from a MIPI camera for object detection and visualizes the results in fullscreen. The sample code is located in `/app/pydev_demo/mipi_camera_sample/` .

## Features

- Model loading

Load `.hbm` models through `hbm_runtime` and initialize input/output information.
- Camera capture

Use `srcampy.Camera()` to initialize the VIO camera and capture 1920×1080 NV12 images.
- HDMI display

Use `srcampy.Display()` to bind the image output channel for real-time display.
- Image preprocessing

Split, scale, and convert NV12 images into the tensor format required by the BPU.
- BPU inference

Call the BPU to run inference tasks through the `run()` method.
- Postprocessing

Includes output decoding, confidence filtering, NMS suppression, and coordinate scaling.
- Visualization

Draw detection boxes and class labels on the overlay layer.

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

## Hardware Requirements

- The MIPI camera interface uses auto-detection mode. Only one MIPI camera may be connected when running this sample (any MIPI port is supported). Connecting multiple cameras will cause errors.
- This sample currently supports only MIPI sensors: IMX219 and SC230AI.

- For MIPI camera installation, refer to [Camera Expansion Board - MIPI Camera Interface](/rdk_s_doc/en/Quick_start/hardware_introduction/rdk_s100/rdk_s100_camera_expansion_board#mipi-camera-interfaces-j2200-j2201) .

- For MIPI camera installation, refer to [MIPI Camera Interface](/rdk_s_doc/en/Quick_start/hardware_introduction/rdk_s600/rdk_s600#mipi-camera-interfacej11j13) .

## Directory Structure

```text
.
├── 01_mipi_camera_yolov5x.py       # Real-time camera object detection and display with YOLOv5x
├── 02_mipi_camera_dump.py          # Save camera frames as YUV files (not related to model inference)
├── 03_mipi_camera_scale.py         # Scale local YUV images to different resolutions (not related to model inference)
├── 04_mipi_camera_crop_scale.py    # Crop and scale local YUV images (not related to model inference)
├── 05_mipi_camera_streamer.py      # Stream camera images to HDMI in real time (streaming test; not related to model inference)
└── README.md                       # Script descriptions, parameters, and usage
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
python 01_mipi_camera_yolov5x.py
```
- Run with specified parameters

```bash
python 01_mipi_camera_yolov5x.py \
--model-path /opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm \
--priority 0 \
--bpu-cores 0 \
--label-file /app/res/labels/coco_classes.names \
--nms-thres 0.45 \
--score-thres 0.25
```

```bash
python 01_mipi_camera_yolov5x.py \
--model-path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
--priority 0 \
--bpu-cores 0 \
--label-file /app/res/labels/coco_classes.names \
--nms-thres 0.45 \
--score-thres 0.25
```
- Exit

Press `Ctrl+C` in the terminal.
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
