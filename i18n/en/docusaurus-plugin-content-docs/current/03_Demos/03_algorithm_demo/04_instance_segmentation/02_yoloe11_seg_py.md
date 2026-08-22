---
sidebar_position: 4
title: "Instance Segmentation - Ultralytics YOLOE11 (Python)"
description: Instance Segmentation - Ultralytics YOLOE11
sidebar_products: RDK S100
---

# Instance Segmentation - Ultralytics YOLOE11 (Python)

:::info S100 only
This sample applies only to RDK S100. The RDK S600 image does not include the corresponding hbm model, and the related sample code is only shipped with the system image on S100; it is not supported on S600 yet.
:::

This sample shows how to run the Ultralytics YOLOE11 instance segmentation model on the BPU using `hbm_runtime`. The program implements the complete pipeline from input image preprocessing, model inference, and post-processing to result visualization. The sample code is located in the `/app/pydev_demo/05_open_instance_seg_sample/01_yoloe11_seg/` directory.

## Model Description
- Introduction:

    Ultralytics YOLOE11 is a high-performance edge-side instance segmentation model, suitable for open-vocabulary object detection and segmentation tasks. Through multi-scale feature extraction, dense classification, and prototype mask generation, the model effectively recognizes objects in images and outputs fine-grained instance segmentation results. This sample uses the lightweight version of Ultralytics YOLOE11, with a 640x640 input image, supporting generalized object classification and segmentation with 4585 classes.

- HBM model name: yoloe_11s_seg_pf_nashe_640x640_nv12.hbm

- Input format: NV12, size 640x640

- Outputs:

    - Detection boxes (xyxy format)

    - Class IDs and confidence scores

    - Instance segmentation masks (one independent mask per instance)

- Model download URL (automatically downloaded by the program):

    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yoloe_11s_seg_pf_nashe_640x640_nv12.hbm
    ```
## Feature Description
- Model loading

    Uses `hbm_runtime` to load the specified quantized model and parse meta information such as input/output names, shapes, and quantization parameters.

- Input preprocessing

    Resizes the BGR image to 640x640, converts it to NV12 format (Y and UV separated), and constructs the inference input tensor.

- Inference execution

    Calls the .run() interface to perform forward inference, supporting scheduling strategies such as runtime priority and BPU core binding.

- Result post-processing

    Post-processes the multi-scale outputs, including:

    - Classification confidence filtering (based on the score threshold)

    - DFL box decoding

    - Mask prototype fusion and mask generation

    - NMS filtering and result fusion

    - Scaling the detection boxes and masks back to the original image size

    - Supporting optional mask opening operation (morphological processing) and boundary contour drawing

## Environment Dependencies
This sample has no special environment requirements. Just make sure the dependencies in pydev are installed.
```bash
pip install -r ../../requirements.txt
```

## Directory Structure
```text
.
├── yoloe11_seg.py              # Main inference script
└── README.md                   # Usage instructions
```

## Parameters
| Parameter         | Description                                        | Default value                                                       |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| `--model-path`    | BPU quantized model path (\*.hbm)                   | `/opt/hobot/model/s100/basic/yoloe_11s_seg_pf_nashe_640x640_nv12.hbm` |
| `--test-img`      | Input test image path                               | `/app/res/assets/office_desk.jpg`                                   |
| `--label-file`    | Class label file path (one class per line)          | `/app/res/labels/coco_extended.names`                               |
| `--img-save-path` | Save path of the inference result image             | `result.jpg`                                                        |
| `--priority`      | Model scheduling priority (0\~255)                  | `0`                                                                 |
| `--bpu-cores`     | BPU core IDs to use (e.g., `--bpu-cores 0 1`)       | `[0]`                                                               |
| `--nms-thres`     | IoU threshold for Non-Maximum Suppression (NMS)     | `0.7`                                                               |
| `--score-thres`   | Confidence threshold for object detection           | `0.25`                                                              |
| `--is-open`       | Whether to apply morphological operation (opening) to the masks | `False`                                                |
| `--is-point`      | Whether to draw mask edge contour points            | `False`                                                             |


## Quick Start
- Run the model
    - With default parameters
        ```bash
        python yoloe11_seg.py
        ```
    - Run with specified parameters
        ```bash
        python yoloe11_seg.py \
        --model-path /opt/hobot/model/s100/basic/yoloe_11s_seg_pf_nashe_640x640_nv12.hbm \
        --priority 0 \
        --bpu-cores 0 \
        --test-img /app/res/assets/office_desk.jpg \
        --label-file /app/res/labels/coco_extended.names \
        --img-save-path result.jpg \
        --nms-thres 0.7 \
        --score-thres 0.25 \
        --is-open False \
        --is-point False
        ```
- View the results

    After running successfully, the results are drawn on the original image and saved to the path specified by --img-save-path
    ```bash
    [Saved] Result saved to: result.jpg
    ```

## Notes
- If the specified model path does not exist, the program will attempt to download the model automatically.

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

## Related Documentation

- [C/C++ version of the YOLOE11 segmentation sample](./02_yoloe11_seg.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [Python Inference API](../../../04_Simple_API/02_inference_api/02_python_api.md)
