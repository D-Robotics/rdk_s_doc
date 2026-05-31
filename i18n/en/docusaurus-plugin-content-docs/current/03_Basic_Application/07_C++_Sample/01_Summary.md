---
sidebar_position: 1
---

# Sample Overview

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">

This project includes multiple AI sample programs written in C/C++, designed for the RDK S100 platform. They cover common AI tasks such as image classification, object detection, instance segmentation, pose estimation, OCR, and speech recognition. The samples use quantized models in `.hbm` format for inference, helping developers quickly validate model performance and start application development.

</DocScope>
<DocScope products="RDK-S600">

This project includes multiple AI sample programs written in C/C++, designed for the RDK S600 platform. They cover common AI tasks such as image classification, object detection, instance segmentation, pose estimation, and speech recognition. The samples use quantized models in `.hbm` format for inference, helping developers quickly validate model performance and start application development.

</DocScope>

On-board code location for this project: `/app/cdev_demo/bpu`.

## Directory Structure Overview

<DocScope products="RDK-S100">

```text
|-- 01_classification_sample         # Image classification samples (e.g., ResNet18, MobileNet)
|-- 02_detection_sample              # Object detection samples (YOLO, etc.)
|-- 03_instance_segmentation_sample  # Instance segmentation samples
|-- 04_pose_sample                   # Keypoint detection samples
|-- 05_open_instance_seg_sample      # Open-vocabulary instance segmentation samples
|-- 06_lane_detection_sample         # Lane detection samples
|-- 07_speech_sample                 # Speech recognition samples
|-- 08_OCR_sample                    # Optical character recognition samples
|-- 09_usb_camera_sample             # USB camera real-time inference samples
|-- 10_mipi_camera_sample            # MIPI camera real-time inference samples
|-- 11_decode_yolov5x_display_sample # Video decode, inference, and display samples
|-- 12_rtsp_yolov5x_display_sample   # RTSP stream decode, inference, and display samples
|-- utils                            # Common utility functions
`-- README.md                        # Project documentation (this file)
```

</DocScope>
<DocScope products="RDK-S600">

```text
|-- classification_sample            # Image classification samples (e.g., ResNet18, MobileNet)
|-- detection_sample                 # Object detection samples (YOLO, etc.)
|-- instance_segmentation_sample     # Instance segmentation samples
|-- pose_sample                      # Keypoint detection samples
|-- speech_sample                    # Speech recognition samples
|-- usb_camera_sample                # USB camera real-time inference samples
|-- mipi_camera_sample               # MIPI camera real-time inference samples
|-- decode_yolov5x_display_sample    # Video decode, inference, and display samples
|-- rtsp_yolov5x_display_sample      # RTSP stream decode, inference, and display samples
|-- utils                            # Common utility functions
`-- README.md                        # Project documentation (this file)
```

</DocScope>

## Environment Requirements

Before running the samples, ensure your system meets the following requirements:

### Hardware

<DocScope products="RDK-S100">

- S100 development board with BPU support
- Camera (USB or MIPI) if running related samples

</DocScope>
<DocScope products="RDK-S600">

- S600 development board with BPU support
- Camera (USB or MIPI) if running related samples

</DocScope>

### System and Toolchain
This project has been verified to run in the following environments:

- Operating system

    <DocScope products="RDK S100">

    - Ubuntu 22.04.5 LTS (Jammy Jellyfish)

    </DocScope>
    <DocScope products="RDK S600">

    - Distributor ID: Ubuntu
    - Description:    Ubuntu 24.04.3 LTS
    - Release:        24.04
    - Codename:       noble

    </DocScope>

- Build toolchain

    - CMake: 3.22.1

    - GCC: 11.4.0

    - G++: 11.4.0

### Dependencies
Different samples depend on different development packages. Install them as needed.

- Common dependencies
    ```bash
    sudo apt update
    sudo apt install libgflags-dev
    ```

- ASR speech recognition sample
    ```bash
    sudo apt update
    sudo apt install libsndfile1-dev
    sudo apt install libsamplerate0-dev
    ```

<DocScope products="RDK-S100">

- OCR text recognition sample
    ```bash
    sudo apt update
    sudo apt install libpolyclipping-dev
    ```

</DocScope>
<DocScope products="RDK-S600">

<!-- - OCR text recognition sample
    ```bash
    sudo apt update
    sudo apt install libpolyclipping-dev
    ``` -->

</DocScope>

## Build Instructions
Using the ResNet18 image classification sample as an example:

<DocScope products="RDK-S100">

```bash
cd 01_classification_sample/01_resnet18

mkdir build && cd build

cmake ..

make -j$(nproc)
```

</DocScope>
<DocScope products="RDK-S600">

```bash
cd classification_sample/resnet18

mkdir build && cd build

cmake ..

make -j$(nproc)
```

</DocScope>

## Running a Sample
Using the ResNet18 image classification sample as an example:
+ Navigate to the sample's build directory

    <DocScope products="RDK-S100">

    ```bash
    cd 01_classification_sample/01_resnet18/build
    ```

    </DocScope>
    <DocScope products="RDK-S600">

    ```bash
    cd classification_sample/resnet18/build
    ```

    </DocScope>
+ Run the model
    ``` bash
    ./resnet_18
    ```
+ View the results
    ``` bash
    TOP 0: label=zebra, prob=0.99872
    TOP 1: label=cheetah, chetah, Acinonyx jubatus, prob=0.000448407
    TOP 2: label=impala, Aepyceros melampus, prob=0.000398787
    TOP 3: label=gazelle, prob=0.000253181
    TOP 4: label=prairie chicken, prairie grouse, prairie fowl, prob=0.000179423
    ```

## Common Utilities
The `utils` directory contains shared utility functions for BPU C/C++ inference samples, covering image preprocessing, inference post-processing, multimedia processing, and general helpers for reuse across samples.

```bash

utils
├── inc                          # Header files
│   ├── common_utils.hpp         # Common utilities (dequantization, result drawing, data structures, etc.)
│   ├── multimedia_utils.hpp     # Multimedia utilities (video frame decode, pixel format conversion, etc.)
│   ├── postprocess_utils.hpp    # Inference post-processing (NMS, decoding, mask handling, etc.)
│   └── preprocess_utils.hpp     # Input preprocessing (image resize, normalization, format conversion, etc.)
└── src                          # Source code (implementations)
    ├── common_utils.cc
    ├── multimedia_utils.cc
    ├── postprocess_utils.cc
    └── preprocess_utils.cc


```

## Additional Notes
* All sample programs use models in `.hbm` format.

* Note: Each subdirectory includes a `README.md` with detailed information about the required environment, command-line arguments, and how to run the corresponding model.
