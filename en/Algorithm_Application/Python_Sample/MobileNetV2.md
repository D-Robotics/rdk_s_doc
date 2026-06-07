# Image Classification - MobileNetV2

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/Python_Sample/MobileNetV2

This example shows how to perform image classification using a BPU-deployed `MobileNetV2` model with `hbm_runtime` for inference. The sample code is located in `/app/pydev_demo/01_classification_sample/02_mobilenetv2/` .

This example shows how to perform image classification using a BPU-deployed `MobileNetV2` model with `hbm_runtime` for inference. The sample code is located in `/app/pydev_demo/classification_sample/mobilenetv2/` .

## Model Description

- Overview:

MobileNetV2 is a lightweight convolutional neural network proposed by Google in 2018, designed for efficient image recognition on mobile devices. It introduces inverted residual and linear bottleneck structures to reduce computation while improving performance. MobileNetV2 is well suited for deployment on edge devices and resource-constrained environments for tasks such as image classification and detection. The MobileNetV2 model used in this example is a BPU-quantized model with 224×224 input and NV12 format support.
- HBM model name: mobilenetv2_224x224_nv12.hbm
- Input format: NV12, size 224x224 (Y and UV planes separated)
- Output: Softmax probability distribution over 1000 classes (ImageNet 1000-class standard)
- Model download URL (automatically downloaded by the program):

```bash
https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/MobileNet/mobilenetv2_224x224_nv12.hbm
```

```bash
https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/MobileNet/mobilenetv2_224x224_nv12.hbm
```

## Features

- Model loading

Loads the model file using `hbm_runtime` and extracts the model name, input and output names, and their corresponding shape information.
- Input preprocessing

Resizes the input image from BGR format to 224x224, converts it to the hardware-required NV12 format (Y and UV separated), and forms a dictionary input structure compatible with the inference interface.
- Inference execution

Executes inference by calling the `.run()` method, with support for setting BPU cores (such as core0/core1) and inference priority (0~255).
- Post-processing

Retrieves the model output tensor, parses softmax probabilities, and displays top-K (default top-5) predictions with corresponding class names and probabilities.

## Environment Dependencies

This sample has no special environment requirements. Just ensure that the dependencies in pydev are installed.

```bash
pip install -r ../../requirements.txt
```

```bash
pip install -r ../../requirements.txt --break-system-packages
```

## Directory Structure

```text
.
├── mobilenetv2.py              # Main inference script
└── README.md                   # Usage instructions
```

## Parameters

| Parameter | Description | Default Value 
| `--model-path` | Model file path (.hbm format) | `/opt/hobot/model/s100/basic/mobilenetv2_224x224_nv12.hbm` 
| `--test-img` | Test image path | `/app/res/assets/zebra_cls.jpg` 
| `--label-file` | Class label mapping file path | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` 
| `--priority` | Model priority (0~255; higher values mean higher priority) | `0` 
| `--bpu-cores` | List of BPU core IDs used for inference (e.g. `--bpu-cores 0 1` ) | `[0]` 

| Parameter | Description | Default Value 
| `--model-path` | Model file path (.hbm format) | `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm` 
| `--test-img` | Test image path | `/app/res/assets/zebra_cls.jpg` 
| `--label-file` | Class label mapping file path | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` 
| `--priority` | Model priority (0~255; higher values mean higher priority) | `0` 
| `--bpu-cores` | List of BPU core IDs used for inference (e.g. `--bpu-cores 0 1` ) | `[0]` 

## Quick Start

- Run the model

- With default parameters

```bash
python mobilenetv2.py
```
- Run with specified parameters

```bash
python mobilenetv2.py \
--model-path /opt/hobot/model/s100/basic/mobilenetv2_224x224_nv12.hbm \
--test-img /app/res/assets/zebra_cls.jpg \
--label-file /app/res/labels/imagenet1000_clsidx_to_labels.txt
```

```bash
python mobilenetv2.py \
--model-path /opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm \
--test-img /app/res/assets/zebra_cls.jpg \
--label-file /app/res/labels/imagenet1000_clsidx_to_labels.txt
```
- View results

```bash
Top-5 Predictions:
zebra: 0.8916
tiger, Panthera tigris: 0.0028
hartebeest: 0.0018
jaguar, panther, Panthera onca, Felis onca: 0.0016
tiger cat: 0.0016
```

## Notes

- If the specified model path does not exist, the program will attempt to download the model automatically.
