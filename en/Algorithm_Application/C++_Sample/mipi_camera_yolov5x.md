# MIPI Camera YOLOv5x Inference

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/C++_Sample/mipi_camera_yolov5x

This is a real-time Ultralytics YOLOv5x inference sample based on the BPU. It reads frames from a MIPI camera for object detection and visualizes the results in fullscreen. The sample code is located in `/app/cdev_demo/bpu/10_mipi_camera_sample/` .

This is a real-time Ultralytics YOLOv5x inference sample based on the BPU. It reads frames from a MIPI camera for object detection and visualizes the results in fullscreen. The sample code is located in `/app/cdev_demo/bpu/mipi_camera_sample/` .

## Feature Overview

- Model loading

Load `.hbm` format models and initialize input/output information.
- Camera capture

Initialize the VIO camera and capture 1920×1080 NV12 images.
- HDMI display

Bind the image output channel for real-time display.
- Image preprocessing

Split, scale, and convert NV12 images into the tensor format required by the BPU.
- BPU inference

Call the BPU to run inference tasks through the `.infer()` method.
- Postprocessing

Includes output decoding, confidence filtering, NMS suppression, and coordinate scaling.
- Visualization

Draw detection boxes and class labels on the overlay layer.

## Model Description

See the [Ultralytics YOLOv5x object detection sample](/rdk_s_doc/en/Algorithm_Application/C++_Sample/Ultralytics_YOLOv5x) section.

## Environment Dependencies

Before building and running, ensure the following dependencies are installed:

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Hardware Requirements

- The MIPI camera interface uses auto-detection mode. Only one MIPI camera may be connected when running this sample (any MIPI port is supported). Connecting multiple cameras will cause errors.
- This sample currently supports only MIPI sensors: IMX219 and SC230AI.
- For MIPI camera installation, refer to [Camera Expansion Board - MIPI Camera Interface](/rdk_s_doc/en/Quick_start/hardware_introduction/rdk_s100/rdk_s100_camera_expansion_board#mipi-camera-interfaces-j2200-j2201) .

- The MIPI camera interface uses auto-detection mode. Only one MIPI camera may be connected when running this sample (any MIPI port is supported). Connecting multiple cameras will cause errors.
- This sample currently supports only MIPI sensors: IMX219 and SC230AI.
- For MIPI camera installation, refer to [MIPI Camera Interface](/rdk_s_doc/en/Quick_start/hardware_introduction/rdk_s600/rdk_s600#mipi-camera-interface-j11j13) .

## Directory Structure

```text
.
|-- CMakeLists.txt                     # CMake build script: target/dependency/include/link
|-- README.md                          # Usage instructions (this file)
|-- inc
|   `-- ultralytics_yolov5x.hpp        # YOLOv5x inference wrapper header: load/preprocess/infer/postprocess interfaces
`-- src
    |-- main.cc                        # Program entry: VIO capture → infer → draw on Display layer
    `-- ultralytics_yolov5x.cc         # Inference implementation: letterbox, NV12 tensor write, decode, NMS, coordinate restoration
```

## Build the Project

- Configure and build
```bash
mkdir build && cd build
cmake ..
make -j$(nproc)
```

## Model Download

If the model is not found at runtime, download it with the following command:

```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolov5x_672x672_nv12.hbm
```

## Model Download

If the model is not found at runtime, download it with the following command:

```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ultralytics_YOLO/yolov5x_672x672_nv12.hbm
```

## Parameter Reference

| Parameter | Description | Default Value 
| `--width` | Sensor native width (for VIO parameters/display scaling) | `1920` 
| `--height` | Sensor native height (for VIO parameters/display scaling) | `1080` 
| `--model_path` | BPU quantized model path ( `.hbm` ) | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm` 
| `--label_file` | Class label file (one class name per line) | `/app/res/labels/coco_classes.names` 
| `--score_thres` | Confidence threshold | `0.25` 
| `--nms_thres` | IoU threshold for NMS | `0.45` 

| Parameter | Description | Default Value 
| `--width` | Sensor native width (for VIO parameters/display scaling) | `1920` 
| `--height` | Sensor native height (for VIO parameters/display scaling) | `1080` 
| `--model_path` | BPU quantized model path ( `.hbm` ) | `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` 
| `--label_file` | Class label file (one class name per line) | `/app/res/labels/coco_classes.names` 
| `--score_thres` | Confidence threshold | `0.25` 
| `--nms_thres` | IoU threshold for NMS | `0.45` 

## Quick Start

Note: This program must run in a desktop environment.

- Run the model

- Make sure you are in the `build` directory
- Use default parameters

```bash
./mipi_camera
```
- Run with custom parameters

```bash
./mipi_camera \
    --width 1920 --height 1080 \
    --model_path /opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm \
    --label_file /app/res/labels/coco_classes.names \
    --score_thres 0.25 \
    --nms_thres 0.45
```

```bash
./mipi_camera \
    --width 1920 --height 1080 \
    --model_path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
    --label_file /app/res/labels/coco_classes.names \
    --score_thres 0.25 \
    --nms_thres 0.45
```
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
