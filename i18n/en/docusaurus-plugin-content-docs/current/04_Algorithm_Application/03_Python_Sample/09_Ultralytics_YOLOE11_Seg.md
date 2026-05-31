---
sidebar_position: 9
sidebar_products: RDK-S100
---

# Instance Segmentation - Ultralytics YOLOE11

:::info S100 only
This sample applies only to RDK S100. The RDK S600 system image does not include the corresponding HBM model, and the related sample code is only shipped with the S100 system image; it is not supported on S600 yet.
:::

This sample shows how to run the Ultralytics YOLOE11 instance segmentation model on BPU using `hbm_runtime`. The program implements the full pipeline from input image preprocessing, model inference, and postprocessing to result visualization. The sample code is located in `/app/pydev_demo/05_open_instance_seg_sample/01_yoloe11_seg/`.

## Model Description
- Introduction:

    Ultralytics YOLOE11 is a high-performance edge-side instance segmentation model suitable for open-vocabulary object detection and segmentation tasks. Through multi-scale feature extraction, dense classification, and prototype mask generation, the model effectively identifies objects in images and outputs fine-grained instance segmentation results. This sample uses the lightweight version of Ultralytics YOLOE11 with a `640x640` input image, supporting generalized object classification and segmentation across 4585 classes.

- HBM model name: `yoloe_11s_seg_pf_nashe_640x640_nv12.hbm`

- Input format: `NV12`, size `640x640`

- Output:

    - Detection boxes (xyxy format)

    - Class ID and confidence score

    - Instance segmentation masks (one independent mask per instance)

- Model download URL (automatically downloaded by the program):

    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yoloe_11s_seg_pf_nashe_640x640_nv12.hbm
    ```
## Features
- Model loading

    Use `hbm_runtime` to load the specified quantized model and parse metadata such as input/output names, shapes, and quantization parameters.

- Input preprocessing

    Resize the BGR image to `640x640`, convert it to NV12 format (Y and UV separated), and construct the inference input tensor.

- Inference execution

    Execute forward inference through the `.run()` interface. Scheduling policies such as running priority and BPU core binding are supported.

- Output postprocessing

    Postprocess multi-scale outputs, including:

    - Class confidence filtering (based on score threshold)

    - DFL bounding box decoding

    - Mask prototype fusion and mask generation

    - NMS filtering and result merging

    - Scale detection boxes and masks back to the original image size

    - Optional mask morphological opening and boundary contour drawing

## Environment Dependencies
This sample has no special environment requirements. You only need to ensure the dependencies in `pydev` are installed.
```bash
pip install -r ../../requirements.txt
```

## Directory Structure
```text
.
├── yoloe11_seg.py              # Main inference script
└── README.md                   # Usage instructions
```

## Parameter Description
| Parameter         | Description                                              | Default Value                         |
| ----------------- | -------------------------------------------------------- | ------------------------------------- |
| `--model-path`    | BPU quantized model path (`*.hbm`)                       | `/opt/hobot/model/s100/basic/yoloe_11s_seg_pf_nashe_640x640_nv12.hbm` |
| `--test-img`      | Input test image path                                    | `/app/res/assets/office_desk.jpg`     |
| `--label-file`    | Class label file path (one class per line)               | `/app/res/labels/coco_extended.names` |
| `--img-save-path` | Inference result image save path                         | `result.jpg`                          |
| `--priority`      | Model scheduling priority (`0~255`)                      | `0`                                   |
| `--bpu-cores`     | BPU core IDs to use (for example, `--bpu-cores 0 1`)     | `[0]`                                 |
| `--nms-thres`     | IoU threshold for non-maximum suppression (NMS)          | `0.7`                                 |
| `--score-thres`   | Object detection confidence threshold                    | `0.25`                                |
| `--is-open`       | Whether to apply morphological opening to masks          | `False`                               |
| `--is-point`      | Whether to draw mask boundary contour points             | `False`                               |


## Quick Start
- Run the model
    - Use default parameters
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
- View the result

    After successful execution, results will be drawn on the original image and saved to the path specified by `--img-save-path`.
    ```bash
    [Saved] Result saved to: result.jpg
    ```

## Notes
- If the specified model path does not exist, the program will attempt to download the model automatically.

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
