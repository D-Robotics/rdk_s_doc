# Semantic Segmentation - UNetMobileNet

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/Python_Sample/UNetMobileNet

This example shows how to run the UNet-MobileNet semantic segmentation model on the BPU using `hbm_runtime` . It supports image preprocessing, inference, and post-processing (parsing output and overlaying a colored segmentation mask). The sample code is located in `/app/pydev_demo/03_instance_segmentation_sample/01_unetmobilenet/` .

This example shows how to run the UNet-MobileNet semantic segmentation model on the BPU using `hbm_runtime` . It supports image preprocessing, inference, and post-processing (parsing output and overlaying a colored segmentation mask). The sample code is located in `/app/pydev_demo/instance_segmentation_sample/unetmobilenet/` .

## Model Description

- Overview:

UNet is a classic semantic segmentation network with an encoder-decoder architecture that performs well in domains such as medical image analysis. This example uses MobileNet as the encoder backbone to reduce model complexity and improve inference speed, making it suitable for real-time segmentation on edge devices. The model outputs a class label for each pixel, enabling applications such as urban street scene segmentation.
- HBM model name: unet_mobilenet_1024x2048_nv12.hbm
- Input format: NV12, size 1024x2048 (Y and UV planes separated)
- Output: Segmentation map with the same dimensions as the input, where each pixel corresponds to a class index from 0 to 18 (19 classes total)

## Features

- Model loading

Loads the quantized semantic segmentation model using `hbm_runtime` and extracts metadata such as model name, input and output tensor names, shapes, and quantization information.
- Input preprocessing

Loads the original image in BGR format, scales it to 1024×2048, converts it to NV12 format (Y/UV separated), and wraps it in the input dictionary structure required by the inference interface.
- Inference execution

Executes model forward inference using the `.run()` method, with support for scheduling parameters such as BPU core assignment and priority. The output is a class logits tensor.
- Post-processing

- Applies argmax to the output tensor to obtain the class for each pixel;
- Resizes the prediction map to the input image size;
- Restores the original image size and maps classes to a specified color palette;
- Blends with the original image using the configured alpha fusion coefficient to generate a segmentation visualization;
- The final image contains an intuitive overlay of the segmentation result and can be saved or displayed.

- Model download URL (automatically downloaded by the program):

```bash
https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/unet_mobilenet/unet_mobilenet_1024x2048_nv12.hbm
```

- Model download URL (automatically downloaded by the program):

```bash
https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/unet_mobilenet/unet_mobilenet_1024x2048_nv12.hbm
```

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
├── unet_mobilenet.py           # Main inference script
└── README.md                   # Usage instructions
```

## Parameters

| Parameter | Description | Default Value 
| `--model-path` | Model file path (.hbm format) | `/opt/hobot/model/s100/basic/unet_mobilenet_1024x2048_nv12.hbm` 
| `--test-img` | Input test image path | `/app/res/assets/segmentation.png` 
| `--img-save-path` | Path to save the inference result image | `result.jpg` 
| `--priority` | Model priority (0~255; higher values mean higher priority) | `0` 
| `--bpu-cores` | List of BPU core IDs to run the model on (e.g. `--bpu-cores 0 1` ) | `[0]` 
| `--alpha-f` | Visualization blend factor; `0.0=mask only` , `1.0=original image only` | `0.75` 

| Parameter | Description | Default Value 
| `--model-path` | Model file path (.hbm format) | `/opt/hobot/model/s600/basic/unet_mobilenet_1024x2048_nv12.hbm` 
| `--test-img` | Input test image path | `/app/res/assets/segmentation.png` 
| `--img-save-path` | Path to save the inference result image | `result.jpg` 
| `--priority` | Model priority (0~255; higher values mean higher priority) | `0` 
| `--bpu-cores` | List of BPU core IDs to run the model on (e.g. `--bpu-cores 0 1` ) | `[0]` 
| `--alpha-f` | Visualization blend factor; `0.0=mask only` , `1.0=original image only` | `0.75` 

## Quick Start

- Run the model

- With default parameters

```bash
python unet_mobilenet.py
```
- Run with specified parameters

```bash
python unet_mobilenet.py \
--model-path /opt/hobot/model/s100/basic/unet_mobilenet_1024x2048_nv12.hbm \
--test-img /app/res/assets/segmentation.png \
--img-save-path result.jpg \
--alpha-f 0.75 \
--priority 0 \
--bpu-cores 0
```

```bash
python unet_mobilenet.py \
--model-path /opt/hobot/model/s600/basic/unet_mobilenet_1024x2048_nv12.hbm \
--test-img /app/res/assets/segmentation.png \
--img-save-path result.jpg \
--alpha-f 0.75 \
--priority 0 \
--bpu-cores 0
```
- View results

After a successful run, the result is drawn on the original image and saved to the path specified by `--img-save-path` .

```bash
[Saved] Result saved to: result.jpg
```
