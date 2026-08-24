---
sidebar_position: 2
title: "Instance Segmentation - Ultralytics YOLOE11 (C/C++)"
description: Instance Segmentation - Ultralytics YOLOE11
sidebar_products: RDK S100
---

# Instance Segmentation - Ultralytics YOLOE11 (C/C++)

:::info S100 only
This sample applies only to RDK S100. The RDK S600 image does not include the corresponding hbm model, and the related sample code is only shipped with the system image on S100; it is not supported on S600 yet.
:::

This sample shows how to run the Ultralytics YOLOE11 instance segmentation model on the BPU. The program implements the complete pipeline from input image preprocessing, model inference, and post-processing to result visualization. The sample code is located in the `/app/cdev_demo/bpu/05_open_instance_seg_sample/01_yoloe11_seg/` directory.

## Model Description
- Introduction:

    Ultralytics YOLOE11 is a high-performance edge-side instance segmentation model, suitable for open-vocabulary object detection and segmentation tasks. Through multi-scale feature extraction, dense classification, and prototype mask generation, the model effectively recognizes objects in images and outputs fine-grained instance segmentation results. This sample uses the lightweight version of Ultralytics YOLOE11, with a 640x640 input image, supporting generalized object classification and segmentation with 4585 classes.

- HBM model name: yoloe_11s_seg_pf_nashe_640x640_nv12.hbm

- Input format: NV12, size 640x640

- Outputs:

    - Detection boxes (xyxy format)

    - Class IDs and confidence scores

    - Instance segmentation masks (one independent mask per instance)

## Feature Description
- Model loading

    Loads the specified quantized model and parses some of the model's meta information.

- Input preprocessing

    Resizes the BGR image to 640x640, converts it to NV12 format (Y and UV separated), and constructs the inference input tensor.

- Inference execution

    Calls the .infer() interface to perform forward inference.

- Result post-processing

    Post-processes the multi-scale outputs, including:

    - Classification confidence filtering (based on the score threshold)

    - DFL box decoding

    - Mask prototype fusion and mask generation

    - NMS filtering and result fusion

    - Scaling the detection boxes and masks back to the original image size

    - Supporting optional mask opening operation (morphological processing) and boundary contour drawing

## Environment Dependencies
Before building and running, make sure the following dependencies are installed:
```bash
sudo apt update
sudo apt install libgflags-dev
```

## Directory Structure
```text
.
|-- CMakeLists.txt                      # CMake build script: target/dependency/include path/linked library configuration
|-- README.md                           # Usage instructions (current file)
|-- inc
|   `-- ultralytics_yoloe11_seg.hpp     # YOLOE11_Seg wrapper header: load/preprocess/inference/post-process interface declarations
`-- src
    |-- main.cc                         # Program entry: parse arguments → complete pipeline → render and save results
    `-- ultralytics_yoloe11_seg.cc      # Inference implementation: decoding, score filtering, per-class NMS, mask generation and restoration
```

## Build the Project
- Configure and build
    ```bash
    mkdir build && cd build
    cmake ..
    make -j$(nproc)
    ```

## Model Download
If the model is not found when the program runs, download it with the following command:
```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yoloe_11s_seg_pf_nashe_640x640_nv12.hbm
```

## Parameters
| Parameter          | Description                                              | Default value                                                             |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| `--model_path`    | Model file path (`.hbm`)                                  | `/opt/hobot/model/s100/basic/yoloe_11s_seg_pf_nashe_640x640_nv12.hbm`    |
| `--test_img`      | Input test image path                                     | `/app/res/assets/office_desk.jpg`                                        |
| `--label_file`    | Class label file (one class name per line)                | `/app/res/labels/coco_extended.names`                                    |
| `--score_thres`   | Confidence threshold (detections below this value are filtered) | `0.25`                                                              |
| `--nms_thres`     | IoU threshold (per-class NMS deduplication)               | `0.7`                                                                    |

## Quick Start
- Run the model
    - Make sure you are in the `build` directory
    - With default parameters
        ```bash
        ./ultralytics_yoloe11_seg
        ```
    - Run with specified parameters
        ```bash
        ./ultralytics_yoloe11_seg \
            --model_path /opt/hobot/model/s100/basic/yoloe_11s_seg_pf_nashe_640x640_nv12.hbm \
            --test_img   /app/res/assets/office_desk.jpg \
            --label_file /app/res/labels/coco_extended.names \
            --score_thres 0.25 \
            --nms_thres   0.7
        ```
- View the results

    After running successfully, the results are drawn on the original image and saved to build/result.jpg
    ```bash
    [Saved] Result saved to: result.jpg
    ```

    **Success indicator**: `[Saved] Result saved to: result.jpg` appears at the end. Open `build/result.jpg` to see the segmentation masks and detection boxes of the objects.

## Notes
- The output result is saved as result.jpg; you can view it yourself.
- If the specified model path does not exist, the program will attempt to download the model automatically.
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

## FAQ

### Can This Example Run on RDK S600

**Symptom**: Compiling or running this example on RDK S600 fails, or the model cannot be found.

**Cause**: The RDK S600 image does not include the corresponding hbm model, and the example code is only released with the S100 system image.

**Solution**: This example only applies to RDK S100; it is not supported on S600.

### Build Fails With Missing gflags Dependency

**Symptom**: The build reports a missing gflags-related header or link error.

**Cause**: The `libgflags-dev` dependency is not installed.

**Solution**: Run `sudo apt update && sudo apt install libgflags-dev`.

### Model Not Found at Runtime

**Symptom**: The program reports that the model file is not found at runtime.

**Cause**: The specified model path does not exist.

**Solution**: The program downloads the model automatically, or you can download it manually with `wget` to the default path.

## Related Documentation

- [Python version of the YOLOE11 segmentation sample](./02_yoloe11_seg_py.md)
- [C/C++ Demo Build Guide](../../04_demo_support/02_c_cpp_build.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [C Inference API](../../../04_Simple_API/02_inference_api/01_c_api.md)
