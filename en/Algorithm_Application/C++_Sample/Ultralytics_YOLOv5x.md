# Object Detection - Ultralytics YOLOv5x

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/C++_Sample/Ultralytics_YOLOv5x

This example shows how to run image object detection on the BPU using a quantized Ultralytics YOLOv5x model. It supports preprocessing, post-processing, NMS, bounding box drawing, and result saving. The sample code is located in `/app/cdev_demo/bpu/02_detection_sample/01_ultralytics_yolov5x/` .

This example shows how to run image object detection on the BPU using a quantized Ultralytics YOLOv5x model. It supports preprocessing, post-processing, NMS, bounding box drawing, and result saving. The sample code is located in `/app/cdev_demo/bpu/detection_sample/ultralytics_yolov5x/` .

## Model Description

- Overview:

Ultralytics YOLOv5x is a high-performance object detection model. The name stands for "You Only Look Once," meaning a single forward pass performs object localization and classification. YOLOv5x is the largest variant, with more network parameters and higher detection accuracy, suitable for scenarios that require high precision. The model maps the input image to multiple grids, with each grid predicting class labels and bounding boxes for multiple anchors. This model has been quantized to HBM format for BPU chips, with NV12 input at 672×672 resolution.
- HBM model name: yolov5x_672x672_nv12.hbm
- Input format: NV12, size 672x672 (Y and UV planes separated)
- Output: N bounding boxes, each containing a (class index, probability, bounding box) triplet

## Feature Overview

- Model loading

Load the quantized Ultralytics YOLOv5x model and parse model metadata to prepare for inference.
- Input preprocessing

Resize the input image to 672x672, convert it to NV12 format (Y and UV separated), and organize the input as a nested dictionary for the inference interface.
- Inference execution

Run inference via the `.infer()` method.
- Result post-processing

- Dequantize the output tensor;
- Decode YOLO outputs to obtain predicted boxes, confidence scores, and class indices;
- Apply an initial filter based on the score threshold;
- Apply NMS (non-maximum suppression) to remove redundant boxes;
- Map predicted box coordinates back to the original image size;
- Overlay detection boxes and save the result image.

## Environment Dependencies

Ensure the following dependencies are installed:

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Directory Structure

```text
.
├── CMakeLists.txt                 # Build configuration
├── README.md                      # Usage instructions
├── inc
│   └── ultralytics_yolov5x.hpp     # YOLOv5x model wrapper class definition
└── src
    ├── main.cc                     # Inference entry point (parse arguments, execute)
    └── ultralytics_yolov5x.cc      # YOLOv5x inference logic implementation
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
| `--model-path` | Model file path (.hbm format) | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm` 
| `--test-img` | Test image path | `/app/res/assets/kite.jpg` 
| `--label-file` | Class label file path | `/app/res/labels/coco_classes.names` 
| `--score-thres` | Confidence threshold (filters low-score boxes) | `0.25` 
| `--nms-thres` | IoU threshold (NMS non-maximum suppression) | `0.45` 

| Parameter | Description | Default Value 
| `--model-path` | Model file path (.hbm format) | `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` 
| `--test-img` | Test image path | `/app/res/assets/kite.jpg` 
| `--label-file` | Class label file path | `/app/res/labels/coco_classes.names` 
| `--score-thres` | Confidence threshold (filters low-score boxes) | `0.25` 
| `--nms-thres` | IoU threshold (NMS non-maximum suppression) | `0.45` 

## Quick Start

- Run the model

- Use default parameters

```bash
./ultralytics_yolov5x
```
- Run with custom parameters

```bash
./ultralytics_yolov5x \
    --model-path /opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm \
    --test-img /app/res/assets/kite.jpg \
    --label-file /app/res/labels/coco_classes.names \
    --score-thres 0.25 \
    --nms-thres 0.45
```

```bash
./ultralytics_yolov5x \
    --model-path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
    --test-img /app/res/assets/kite.jpg \
    --label-file /app/res/labels/coco_classes.names \
    --score-thres 0.25 \
    --nms-thres 0.45
```
- View the results

After a successful run, detection boxes are drawn on the original image and saved to `build/result.jpg` .

```bash
[Saved] Result saved to: result.jpg
```

## Notes

- The output is saved as `result.jpg` for you to inspect.
- For more deployment options or model support information, refer to the official documentation or contact platform technical support.

## License

```license
Copyright (C) 2025，XiangshunZhao D-Robotics.

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
