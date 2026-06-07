# Image Classification - ResNet18

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/Python_Sample/ResNet18

This example demonstrates how to deploy the `ResNet18` model for image classification inference using the Python interface of `hbm_runtime` . It is intended for RDK S100 devices equipped with a BPU chip. The sample code is located in `/app/pydev_demo/01_classification_sample/01_resnet18/` .

This example demonstrates how to deploy the `ResNet18` model for image classification inference using the Python interface of `hbm_runtime` . It is intended for RDK S600 devices equipped with a BPU chip. The sample code is located in `/app/pydev_demo/classification_sample/resnet18/` .

## Model Description

- Overview:

ResNet (Residual Network) is a deep convolutional neural network architecture proposed by Microsoft Research. Its core idea is to introduce "residual connections," which use skip connections across layers to mitigate the vanishing gradient problem in deep networks, enabling effective training of networks with dozens or even hundreds of layers. The ResNet18 variant used in this example is a lightweight version with 18 layers, widely used for image classification, feature extraction, and similar tasks.
- HBM model name: resnet18_224x224_nv12.hbm
- Input format: NV12, size 224x224
- Output: Softmax probability distribution over 1000 classes
- Model download URL (automatically downloaded by the program):

```bash
https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ResNet/resnet18_224x224_nv12.hbm
```

```bash
https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ResNet/resnet18_224x224_nv12.hbm
```

## Features

- Model loading

Loads the specified model using `hbm_runtime` , parses input and output names and shapes, and prepares them for subsequent inference.
- Input preprocessing

Resizes the BGR image to 224x224 and converts it to NV12 format (Y and UV planes separated).
- Inference execution

Performs model forward inference through the `.run()` method, with optional scheduling parameters (priority and core binding).
- Post-processing

Reads the output tensor, parses top-K classification results (Top-5), and displays class labels and probability values.

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
├── resnet18.py                 # Main program; uses `hbm_runtime` to run ResNet18 classification
└── README.md                   # Usage instructions
```

## Parameters

| Parameter | Description | Default Value 
| `--model-path` | Model file path (.hbm format) | `/opt/hobot/model/s100/basic/resnet18_224x224_nv12.hbm` 
| `--test-img` | Test image path | `/app/res/assets/zebra_cls.jpg` 
| `--label-file` | Class label mapping file path | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` 
| `--priority` | Model priority (0~255; higher values mean higher priority) | `0` 
| `--bpu-cores` | List of BPU core IDs used for inference (e.g. `--bpu-cores 0 1` ) | `[0]` 

| Parameter | Description | Default Value 
| `--model-path` | Model file path (.hbm format) | `/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm` 
| `--test-img` | Test image path | `/app/res/assets/zebra_cls.jpg` 
| `--label-file` | Class label mapping file path | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` 
| `--priority` | Model priority (0~255; higher values mean higher priority) | `0` 
| `--bpu-cores` | List of BPU core IDs used for inference (e.g. `--bpu-cores 0 1` ) | `[0]` 

## Quick Start

- Run the model

- With default parameters

```bash
python resnet18.py
```
- Run with specified parameters

```bash
python resnet18.py \
--model-path /opt/hobot/model/s100/basic/resnet18_224x224_nv12.hbm \
--test-img /app/res/assets/zebra_cls.jpg \
--label-file /app/res/labels/imagenet1000_clsidx_to_labels.txt
```

```bash
python resnet18.py \
--model-path /opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm \
--test-img /app/res/assets/zebra_cls.jpg \
--label-file /app/res/labels/imagenet1000_clsidx_to_labels.txt
```
- View results

```bash
Top-5 Predictions:
zebra: 0.9979
impala, Aepyceros melampus: 0.0005
cheetah, chetah, Acinonyx jubatus: 0.0005
gazelle: 0.0004
prairie chicken, prairie grouse, prairie fowl: 0.0002
```

## Notes

- If the specified model path does not exist, the program will attempt to download the model automatically.
