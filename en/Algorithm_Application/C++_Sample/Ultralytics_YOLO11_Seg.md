# Instance Segmentation - Ultralytics YOLO11

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/C++_Sample/Ultralytics_YOLO11_Seg

This example shows how to run the YOLOv11 semantic segmentation model on the BPU. It supports image preprocessing, inference, and post-processing (parse outputs and overlay colored segmentation masks). The sample code is located in `/app/cdev_demo/bpu/03_instance_segmentation_sample/02_ultralytics_yolo11_seg/` .

This example shows how to run the YOLOv11 instance segmentation model on the BPU. It supports image preprocessing, inference, and post-processing (parse outputs and overlay colored segmentation masks). The sample code is located in `/app/cdev_demo/bpu/instance_segmentation_sample/ultralytics_yolo11_seg/` .

## Model Description

- Overview:

Ultralytics YOLO11 is a lightweight object detection and instance segmentation model based on the YOLO series, combining anchor-free and anchor-based ideas with distributional regression. This model is the instance segmentation variant, supporting simultaneous output of bounding boxes, class probabilities, and high-quality pixel-level masks, suitable for multi-object detection and segmentation in real-time scenarios.

- HBM model name: yolo11n_seg_nashe_640x640_nv12.hbm

- HBM model name: yolo11n_seg_nashp_640x640_nv12.hbm

- Input format: NV12 image (Y/UV separated), size 640x640
- Output:

- Object detection results (bounding box + class + score)
- Instance segmentation masks (one mask per object)

## Feature Overview

- Model loading

Load the quantized Ultralytics YOLO11 instance segmentation model and parse runtime metadata.
- Input preprocessing

Scale the input BGR image to 640×640 and convert it to NV12 format (Y and UV planes separated) to meet model input requirements.
- Inference execution

Trigger the forward pass via the `.infer()` method. Outputs include multi-scale class scores, bounding box regression, mask coefficients, and global mask prototype tensors.
- Result post-processing

- Filter detection candidates using thresholds and decode bounding boxes and mask coefficients;
- Merge outputs from all scales and apply NMS to select final targets;
- Reconstruct each object's mask from mask prototypes and coefficients;
- Scale masks and bounding boxes back to the original image size;
- Optional morphological operations (opening) to refine mask edges;
- Final output includes bounding boxes, classes, scores, and pixel-level instance masks.

## Environment Dependencies

Before building and running, ensure the following dependencies are installed:

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Directory Structure

```text
.
|-- CMakeLists.txt                 # CMake build script
|-- README.md                      # Usage instructions (this file)
|-- inc
|   `-- ultralytics_yolo11_seg.hpp # YOLO11_Seg inference wrapper header (load/preprocess/infer/post-process interfaces)
`-- src
    |-- main.cc                    # Program entry: parse arguments, run full pipeline, save visualization
    `-- ultralytics_yolo11_seg.cc  # YOLO11_Seg inference: decoding, NMS, mask generation, scaling, etc.
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
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolo11n_seg_nashe_640x640_nv12.hbm
```

```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ultralytics_YOLO/yolo11n_seg_nashp_640x640_nv12.hbm
```

## Parameter Reference

| Parameter | Description | Default Value 
| `--model_path` | Model file path ( `.hbm` ) | `/opt/hobot/model/s100/basic/yolo11n_seg_nashe_640x640_nv12.hbm` 
| `--test_img` | Input test image path | `/app/res/assets/office_desk.jpg` 
| `--label_file` | Class label file path | `/app/res/labels/coco_classes.names` 
| `--score_thres` | Confidence filter threshold (boxes below this are discarded) | `0.25` 
| `--nms_thres` | IoU threshold (intra-class NMS to remove duplicate detections) | `0.7` 

| Parameter | Description | Default Value 
| `--model_path` | Model file path ( `.hbm` ) | `/opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm` 
| `--test_img` | Input test image path | `/app/res/assets/office_desk.jpg` 
| `--label_file` | Class label file path | `/app/res/labels/coco_classes.names` 
| `--score_thres` | Confidence filter threshold (boxes below this are discarded) | `0.25` 
| `--nms_thres` | IoU threshold (intra-class NMS to remove duplicate detections) | `0.7` 

## Quick Start

- Run the model

- Make sure you are in the `build` directory
- Use default parameters

```bash
./ultralytics_yolo11_seg
```
- Run with custom parameters

```bash
./ultralytics_yolo11_seg \
    --model_path /opt/hobot/model/s100/basic/yolo11n_seg_nashe_640x640_nv12.hbm \
    --test_img /app/res/assets/office_desk.jpg \
    --label_file /app/res/labels/coco_classes.names \
    --score_thres 0.25 \
    --nms_thres 0.7
```

```bash
./ultralytics_yolo11_seg \
    --model_path /opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm \
    --test_img /app/res/assets/office_desk.jpg \
    --label_file /app/res/labels/coco_classes.names \
    --score_thres 0.25 \
    --nms_thres 0.7
```
- View the results

After a successful run, the result is drawn on the original image and saved to `build/result.jpg` .

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
