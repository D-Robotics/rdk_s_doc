# Lane Detection - LaneNet

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/C++_Sample/LaneNet

S100 only
This sample applies only to RDK S100. The RDK S600 system image does not include the corresponding HBM model, and the related sample code is only shipped with the S100 system image; it is not supported on S600 yet.

This sample runs the LaneNet model on the BPU to perform instance segmentation and binary segmentation of lane lines, and saves the result images locally. The sample code is located in `/app/cdev_demo/bpu/06_lane_detection_sample/01_lanenet/` .

## Model Description

- Overview:

LaneNet is a semantic segmentation model for real-time lane detection. LaneNet uses normalization and standardization in image preprocessing, making it suitable for road scene analysis in autonomous driving and ADAS systems. This sample uses the quantized model `lanenet256x512.hbm` with BPU inference acceleration.
- HBM model name: lanenet256x512.hbm
- Input format: RGB, size 256x512, normalized to [0,1] and then standardized
- Output:

- instance_seg_logits: 3-channel map for distinguishing different lane lines
- binary_seg_pred: binary segmentation result indicating lane region locations

## Feature Overview

- Model loading

Load the LaneNet model and automatically parse partial model metadata.
- Input preprocessing

Convert the input image to RGB format, resize it to 256x512, and apply ImageNet mean and standard deviation for normalization and standardization. Finally convert to NCHW format and add a batch dimension.
- Inference execution

Run inference with the `.infer()` method. Outputs include instance feature maps and binary mask maps.
- Result post-processing

Reshape and normalize output tensors:

- instance_seg_logits: output a three-channel image to visualize each lane instance
- binary_seg_pred: output a single-channel binary map to extract lane regions

## Environment Dependencies

Before building and running, ensure the following dependencies are installed:

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Directory Structure

```text
.
|-- CMakeLists.txt            # CMake build script: target/dependency/include/link configuration
|-- README.md                 # Usage instructions (this file)
|-- inc
|   `-- lanenet.hpp           # LaneNet inference wrapper header: load/preprocess/infer/postprocess interfaces
`-- src
    |-- lanenet.cc            # LaneNet inference implementation: pre/postprocessing and inference calls
    `-- main.cc               # Program entry: parse args → full pipeline → save instance/binary results
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
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/Lanenet/lanenet256x512.hbm
```

## Parameter Reference

| Parameter | Description | Default Value 
| `--model_path` | Model file path ( `.hbm` format) | `/opt/hobot/model/s100/basic/lanenet256x512.hbm` 
| `--test_img` | Input test image path | `/app/res/assets/input.jpg` 

## Quick Start

- Run the model

- Make sure you are in the `build` directory
- Use default parameters
```bash
./lanenet
```
- Run with custom parameters
```bash
./lanenet \
    --model_path /opt/hobot/model/s100/basic/lanenet256x512.hbm \
    --test_img   /app/res/assets/input.jpg
```
- View the results

After successful execution, results are drawn and saved to `instance_pred.png` and `binary_pred.png` .

```bash
Results saved to: instance_pred.png and binary_pred.png
```

## Notes

- The output is saved as `instance_pred.png` and `binary_pred.png` for manual inspection.
- For more deployment options or model support information, refer to the official documentation or contact platform technical support.
