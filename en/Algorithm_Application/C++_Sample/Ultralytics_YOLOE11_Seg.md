# Instance Segmentation - Ultralytics YOLOE11

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/C++_Sample/Ultralytics_YOLOE11_Seg

S100 only
This sample applies only to RDK S100. The RDK S600 system image does not include the corresponding HBM model, and the related sample code is only shipped with the S100 system image; it is not supported on S600 yet.

This sample shows how to run the Ultralytics YOLOE11 instance segmentation model on the BPU. The program implements the full pipeline from input image preprocessing, model inference, and postprocessing to result visualization. The sample code is located in `/app/cdev_demo/bpu/05_open_instance_seg_sample/01_yoloe11_seg/` .

## Model Description

- Overview:

Ultralytics YOLOE11 is a high-performance edge-side instance segmentation model suitable for open-vocabulary object detection and segmentation tasks. Through multi-scale feature extraction, dense classification, and prototype mask generation, the model effectively identifies objects in images and outputs fine-grained instance segmentation results. This sample uses the lightweight version of Ultralytics YOLOE11 with a 640x640 input image, supporting generalized object classification and segmentation across 4585 classes.
- HBM model name: yoloe_11s_seg_pf_nashe_640x640_nv12.hbm
- Input format: NV12, size 640x640
- Output:

- Detection boxes (xyxy format)
- Class ID and confidence score
- Instance segmentation masks (one independent mask per instance)

## Feature Overview

- Model loading

Load the specified quantized model and parse partial model metadata.
- Input preprocessing

Resize the BGR image to 640x640, convert it to NV12 format (Y and UV separated), and construct the inference input tensor.
- Inference execution

Execute forward inference through the `.infer()` interface.
- Result post-processing

Postprocess multi-scale outputs, including:

- Class confidence filtering (based on score threshold)
- DFL bounding box decoding
- Mask prototype fusion and mask generation
- NMS filtering and result merging
- Scale detection boxes and masks back to the original image size
- Optional mask morphological opening and boundary contour drawing

## Environment Dependencies

Before building and running, ensure the following dependencies are installed:

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Directory Structure

```text
.
|-- CMakeLists.txt                      # CMake build script: target/dependency/include/link configuration
|-- README.md                           # Usage instructions (this file)
|-- inc
|   `-- ultralytics_yoloe11_seg.hpp     # YOLO11E_Seg wrapper header: load/preprocess/infer/postprocess interface declarations
`-- src
    |-- main.cc                         # Program entry: parse args → full pipeline → render and save results
    `-- ultralytics_yoloe11_seg.cc      # Inference implementation: decode, score filter, per-class NMS, mask generation and restoration
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
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yoloe_11s_seg_pf_nashe_640x640_nv12.hbm
```

## Parameter Reference

| Parameter | Description | Default Value 
| `--model_path` | Model file path ( `.hbm` ) | `/opt/hobot/model/s100/basic/yoloe_11s_seg_pf_nashe_640x640_nv12.hbm` 
| `--test_img` | Input test image path | `/app/res/assets/office_desk.jpg` 
| `--label_file` | Class label file (one class name per line) | `/app/res/labels/coco_extended.names` 
| `--score_thres` | Confidence threshold (detections below this are filtered) | `0.25` 
| `--nms_thres` | IoU threshold (intra-class NMS deduplication) | `0.7` 

## Quick Start

- Run the model

- Make sure you are in the `build` directory
- Use default parameters
```bash
./ultralytics_yoloe11_seg
```
- Run with custom parameters
```bash
./ultralytics_yoloe11_seg \
    --model_path /opt/hobot/model/s100/basic/yoloe_11s_seg_pf_nashe_640x640_nv12.hbm \
    --test_img   /app/res/assets/office_desk.jpg \
    --label_file /app/res/labels/coco_extended.names \
    --score_thres 0.25 \
    --nms_thres   0.7
```
- View the results

After successful execution, results are drawn on the original image and saved to `build/result.jpg` .

```bash
[Saved] Result saved to: result.jpg
```

## Notes

- The output is saved as `result.jpg` for manual inspection.
- If the specified model path does not exist, the program will attempt to download the model automatically.
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
