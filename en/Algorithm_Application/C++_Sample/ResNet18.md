# Image Classification - ResNet18

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/C++_Sample/ResNet18

This example demonstrates how to deploy the `ResNet18` model for image classification inference using `C/C++` . It is intended for RDK S100 devices equipped with a BPU chip. The sample code is located in `/app/cdev_demo/bpu/01_classification_sample/01_resnet18/` .

This example demonstrates how to deploy the `ResNet18` model for image classification inference using `C/C++` . It is intended for RDK S600 devices equipped with a BPU chip. The sample code is located in `/app/cdev_demo/bpu/classification_sample/resnet18/` .

## Model Description

- Overview:

ResNet (Residual Network) is a deep convolutional neural network architecture proposed by Microsoft Research. Its core idea is to introduce "residual connections," which use skip connections across layers to mitigate the vanishing gradient problem in deep networks, enabling effective training of networks with dozens or even hundreds of layers. The ResNet18 variant used in this example is a lightweight version with 18 layers, widely used for image classification, feature extraction, and similar tasks.
- HBM model name: resnet18_224x224_nv12.hbm
- Input format: NV12, size 224x224
- Output: Softmax probability distribution over 1000 classes

## Feature Overview

- Model loading

Load the specified model and parse input/output names and shapes for subsequent inference.
- Input preprocessing

Resize the BGR image to 224x224 and convert it to NV12 format (Y and UV planes separated).
- Inference execution

Perform the forward pass via the `.infer()` method.
- Result post-processing

Read the output tensor, parse the top-K classification results (Top-5), and display class labels and probability values.

## Environment Dependencies

Before building and running, ensure the following dependencies are installed:

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Directory Structure

```text
.
|-- CMakeLists.txt         # CMake build script
|-- README.md              # Project documentation
|-- inc/                   # Header files
|   `-- resnet18.hpp       # ResNet18 model inference class definition
`-- src/                   # Source code
    |-- main.cc            # Program entry point; invokes the ResNet18 inference pipeline
    `-- resnet18.cc        # ResNet18 inference class implementation
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
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ResNet/resnet18_224x224_nv12.hbm
```

```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ResNet/resnet18_224x224_nv12.hbm
```

## Parameter Reference

| Parameter | Description | Default Value 
| `--model_path` | Model file path ( `.hbm` format) | `/opt/hobot/model/s100/basic/resnet18_224x224_nv12.hbm` 
| `--test_img` | Test image path | `/app/res/assets/zebra_cls.jpg` 
| `--label_file` | ImageNet class mapping (dict, one `index\tlabel` per line) | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` 
| `--top_k` | Number of top-K classification results to output | `5` 

| Parameter | Description | Default Value 
| `--model_path` | Model file path ( `.hbm` format) | `/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm` 
| `--test_img` | Test image path | `/app/res/assets/zebra_cls.jpg` 
| `--label_file` | ImageNet class mapping (dict, one `index\tlabel` per line) | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` 
| `--top_k` | Number of top-K classification results to output | `5` 

## Quick Start

- Run the model

- Make sure you are in the `build` directory
- Use default parameters

```bash
./resnet_18
```
- Run with custom parameters

```bash
./resnet_18 \
--model_path /opt/hobot/model/s100/basic/resnet18_224x224_nv12.hbm \
--test_img   /app/res/assets/zebra_cls.jpg \
--label_file /app/res/labels/imagenet1000_clsidx_to_labels.txt \
--top_k 5
```

```bash
./resnet_18 \
--model_path /opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm \
--test_img   /app/res/assets/zebra_cls.jpg \
--label_file /app/res/labels/imagenet1000_clsidx_to_labels.txt \
--top_k 5
```
- View the results

```bash
Top-5 Predictions:
zebra: 0.9979
impala, Aepyceros melampus: 0.0005
cheetah, chetah, Acinonyx jubatus: 0.0005
gazelle: 0.0004
prairie chicken, prairie grouse, prairie fowl: 0.0002
```

## Notes

- The output shows the top-K classes with the highest probabilities.
- For more deployment options or model support information, refer to the official documentation or contact platform technical support.
