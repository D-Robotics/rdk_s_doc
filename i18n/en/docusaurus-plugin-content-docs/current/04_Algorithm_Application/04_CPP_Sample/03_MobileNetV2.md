---
sidebar_position: 3
---

# Image Classification - MobileNetV2

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">

This example shows how to run image classification with a BPU-deployed `MobileNetV2` model using `C/C++` for inference. The sample code is located in `/app/cdev_demo/bpu/01_classification_sample/02_mobilenetv2/`.

</DocScope>
<DocScope products="RDK-S600">

This example shows how to run image classification with a BPU-deployed `MobileNetV2` model using `C/C++` for inference. The sample code is located in `/app/cdev_demo/bpu/classification_sample/mobilenetv2/`.

</DocScope>

## Model Description
- Overview:

    MobileNetV2 is a lightweight convolutional neural network proposed by Google in 2018, designed for efficient image recognition on mobile devices. It introduces Inverted Residual and Linear Bottleneck structures to reduce computation while improving performance. MobileNetV2 is well suited for deployment on edge devices and resource-constrained scenarios for tasks such as image classification and detection. The MobileNetV2 model used in this example is a BPU-quantized model with 224×224 input and NV12 format support.

- HBM model name: mobilenetv2_224x224_nv12.hbm

- Input format: NV12, size 224x224 (Y and UV planes separated)

- Output: Softmax probability distribution over 1000 classes (ImageNet 1000-class standard)

## Feature Overview
- Model loading

    Load the model file and extract metadata such as model name and input/output counts.

- Input preprocessing

    Resize the input image from BGR to 224x224, convert it to the NV12 format required by the hardware (Y and UV separated), and organize it as a dictionary input for the inference interface.

- Inference execution

    Run inference via the `.infer()` method.

- Result post-processing

    Read the output tensor, parse probabilities, and display the top-K (default top-5) predictions with corresponding class names and probabilities.

## Environment Dependencies
Before building and running, ensure the following dependencies are installed:
```bash
sudo apt update
sudo apt install libgflags-dev
```

## Directory Structure

```text
.
├── CMakeLists.txt              # CMake build script
├── README.md                   # Usage instructions
├── inc
│   └── mobilenetv2.hpp         # Model inference header
└── src
    ├── main.cc                 # Main program entry point
    └── mobilenetv2.cc          # Model implementation
```
## Build the Project
- Build the project
    ```bash
    mkdir build && cd build
    cmake ..
    make -j$(nproc)
    ```

## Model Download
If the model is not found at runtime, download it with the following command:

<DocScope products="RDK-S100">

```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/MobileNet/mobilenetv2_224x224_nv12.hbm
```

</DocScope>
<DocScope products="RDK-S600">

```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/MobileNet/mobilenetv2_224x224_nv12.hbm
```

</DocScope>

## Parameter Reference

<DocScope products="RDK-S100">

| Parameter      | Description                              | Default Value                                                  |
| -------------- | ---------------------------------------- | -------------------------------------------------------------- |
| `--model_path` | Model file path (.hbm format)            | `/opt/hobot/model/s100/basic/mobilenetv2_224x224_nv12.hbm`     |
| `--test_img`   | Test image path                          | `/app/res/assets/zebra_cls.jpg`                                |
| `--label_file` | Class label mapping file path (dict format) | `/app/res/labels/imagenet1000_clsidx_to_labels.txt`         |
| `--top_k`      | Number of top-k classification results   | `5`                                                            |

</DocScope>
<DocScope products="RDK-S600">

| Parameter      | Description                              | Default Value                                                  |
| -------------- | ---------------------------------------- | -------------------------------------------------------------- |
| `--model_path` | Model file path (.hbm format)            | `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm`     |
| `--test_img`   | Test image path                          | `/app/res/assets/zebra_cls.jpg`                                |
| `--label_file` | Class label mapping file path (dict format) | `/app/res/labels/imagenet1000_clsidx_to_labels.txt`         |
| `--top_k`      | Number of top-k classification results   | `5`                                                            |

</DocScope>

## Quick Start
- Run the model
    - Make sure you are in the `build` directory
    - Use default parameters
        ```bash
        ./mobilenetv2
        ```
    - Run with custom parameters

        <DocScope products="RDK-S100">

        ```bash
        ./mobilenetv2 \
        --model_path /opt/hobot/model/s100/basic/mobilenetv2_224x224_nv12.hbm \
        --test_img /app/res/assets/zebra_cls.jpg \
        --label_file /app/res/labels/imagenet1000_clsidx_to_labels.txt \
        --top_k 5
        ```

        </DocScope>
        <DocScope products="RDK-S600">

        ```bash
        ./mobilenetv2 \
        --model_path /opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm \
        --test_img /app/res/assets/zebra_cls.jpg \
        --label_file /app/res/labels/imagenet1000_clsidx_to_labels.txt \
        --top_k 5
        ```

        </DocScope>
- View the results
    ```bash
    TOP 0: label=zebra, prob=0.992246
    TOP 1: label=tiger, Panthera tigris, prob=0.00404656
    TOP 2: label=hartebeest, prob=0.00133707
    TOP 3: label=tiger cat, prob=0.000722661
    TOP 4: label=impala, Aepyceros melampus, prob=0.000539704
    ```

## Notes
- The output shows the top-K classes with the highest probabilities.

- For more deployment options or model support information, refer to the official documentation or contact platform technical support.
