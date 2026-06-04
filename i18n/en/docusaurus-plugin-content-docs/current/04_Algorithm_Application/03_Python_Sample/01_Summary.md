---
sidebar_position: 1
---

# Example Overview

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">
This project includes multiple AI example programs written in Python for the RDK S100 platform, covering common AI tasks such as image classification, object detection, instance segmentation, pose estimation, OCR, and speech recognition. The examples run inference with quantized models in `.hbm` format so developers can quickly validate model performance and start application development.

</DocScope>
<DocScope products="RDK-S600">
This project includes multiple AI example programs written in Python for the RDK S600 platform, covering common AI tasks such as image classification, object detection, instance segmentation, pose estimation, and speech recognition. The examples run inference with quantized models in `.hbm` format so developers can quickly validate model performance and start application development.

</DocScope>

On-device code for this project is located at: `/app/pydev_demo/`.

## Overview
### Environment Requirements
This project is written in Python and depends on several third-party libraries. Make sure your environment meets the following requirements:

#### Python Environment
- Python version: Python 3.10.x is recommended (currently tested on Python 3.10.12)

#### Dependencies
- Dependency list
    | Library        | Description                                      | Recommended Version |
    |----------------|--------------------------------------------------|---------------------|
    | numpy          | Scientific computing for tensors and matrices    | >=1.26.4            |
    | opencv-python  | Image processing and visualization (cv2)         | >=4.11.0.86         |
    | scipy          | Math utilities such as softmax                   | >=1.15.3            |
- Installing dependencies

    <DocScope products="RDK-S100">
    ```bash
    # Install dependencies
    pip install -r requirements.txt
    ```

    </DocScope>
    <DocScope products="RDK-S600">
    ```bash
    # Install dependencies
    pip install -r requirements.txt --break-system-packages
    ```

    </DocScope>

- Note

    **The dependency list and install file above only cover the basic libraries required to run the models. Some examples need additional third-party libraries; see each example's README.md or the corresponding section in this document.**

#### Other Components
- hbm_runtime: Loads and runs `.hbm` models. Installed by default on the system. For manual installation, see the [Python API](../02_Python_API.md#module-class-and-function-reference-api-reference) section.

- Hobot VIO: Accesses camera image streams (hobot_vio, e.g. libsrcampy)


### Directory Structure

<DocScope products="RDK-S100">
```text
.
├── 01_classification_sample/        # Image classification examples
├── 02_detection_sample/             # Object detection examples
├── 03_instance_segmentation_sample/ # Instance segmentation examples
├── 04_pose_sample/                  # Pose estimation examples
├── 05_open_instance_seg_sample/     # Open-vocabulary instance segmentation examples
├── 06_lane_detection_sample/        # Lane detection examples
├── 07_speech_sample/                # Speech recognition examples
├── 08_OCR_sample/                   # OCR examples
├── 09_usb_camera_sample/            # USB camera + object detection examples
├── 10_mipi_camera_sample/           # MIPI camera + object detection examples
├── 11_web_display_camera_sample/    # Camera + Web + object detection examples
├── utils/                           # Shared preprocessing and postprocessing utilities
├── requirements.txt                 # Python dependencies
└── README.md                        # Top-level usage guide (this file)
```

</DocScope>
<DocScope products="RDK-S600">
```text
.
├── classification_sample/           # Image classification examples
├── detection_sample/                # Object detection examples
├── instance_segmentation_sample/    # Instance segmentation examples
├── pose_sample/                     # Pose estimation examples
├── speech_sample/                   # Speech recognition examples
├── usb_camera_sample/               # USB camera + object detection examples
├── mipi_camera_sample/              # MIPI camera + object detection examples
├── web_display_camera_sample/       # Camera + Web + object detection examples
├── rtsp_yolov5x_display_sample/     # RTSP stream + object detection examples
├── utils/                           # Shared preprocessing and postprocessing utilities
├── requirements.txt                 # Python dependencies
└── README.md                        # Top-level usage guide (this file)
```

</DocScope>

### Quick Start
Using the ResNet18 image classification example:

- Enter the sample directory

    <DocScope products="RDK-S100">
    ```bash
    cd 01_classification_sample/01_resnet18
    ```

    </DocScope>
    <DocScope products="RDK-S600">
    ```bash
    cd classification_sample/resnet18
    ```

    </DocScope>

- Run the model

    <DocScope products="RDK-S100">
    ``` bash
    python3 resnet18.py \
    --model-path /opt/hobot/model/s100/basic/resnet18_224x224_nv12.hbm \
    --test-img /app/res/assets/zebra_cls.jpg
    ```

    </DocScope>
    <DocScope products="RDK-S600">
    ``` bash
    python3 resnet18.py \
    --model-path /opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm \
    --test-img /app/res/assets/zebra_cls.jpg
    ```

    </DocScope>

- View results
    ``` bash
    Top-5 Predictions:
    zebra: 0.9979
    impala, Aepyceros melampus: 0.0005
    cheetah, chetah, Acinonyx jubatus: 0.0005
    gazelle: 0.0004
    prairie chicken, prairie grouse, prairie fowl: 0.0002
    ```

### Common Utilities
The project uses shared utility modules under `utils/` to simplify example development:

* preprocess_utils.py: Image preprocessing such as resize and color format conversion

* postprocess_utils.py: Postprocessing such as NMS and box transforms

* draw_utils.py: Drawing detection boxes, keypoints, segmentation masks, etc.

* common_utils.py: Model info printing, color definitions, etc.

### Notes
* All examples use `.hbm` models and require the platform `hbm_runtime` Python inference interface.

* Each subdirectory includes a `README.md` with environment requirements, command-line arguments, and run instructions for that model.
