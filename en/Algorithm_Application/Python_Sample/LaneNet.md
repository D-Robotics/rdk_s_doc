# Lane Detection - LaneNet

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/Python_Sample/LaneNet

S100 only
This sample applies only to RDK S100. The RDK S600 system image does not include the corresponding HBM model, and the related sample code is only shipped with the S100 system image; it is not supported on S600 yet.

This sample runs the LaneNet model based on `hbm_runtime` to perform instance segmentation and binary segmentation of lane lines, and saves the result images locally. The sample code is located in `/app/pydev_demo/06_lane_detection_sample/01_lanenet/` .

## Model Description

- Introduction:

LaneNet is a semantic segmentation model for real-time lane detection. LaneNet uses normalization and standardization in image preprocessing, making it suitable for road scene analysis in autonomous driving and ADAS systems. This sample uses the quantized model `lanenet256x512.hbm` with BPU inference acceleration.
- HBM model name: `lanenet256x512.hbm`
- Input format: `RGB` , size `256x512` , normalized to `[0,1]` and then standardized
- Output:

- `instance_seg_logits` : 3-channel map for distinguishing different lane lines
- `binary_seg_pred` : binary segmentation result indicating lane region locations
- Model download URL (automatically downloaded by the program):

```bash
https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/Lanenet/lanenet256x512.hbm
```

## Features

- Model loading

Use `hbm_runtime` to load the LaneNet model and automatically parse input/output information and quantization parameters.
- Input preprocessing

Convert the input image to RGB format, resize it to `256x512` , and apply ImageNet mean and standard deviation for normalization and standardization. Finally convert to NCHW format and add a batch dimension.
- Inference execution

Run inference with the `.run()` method. Outputs include instance feature maps and binary mask maps. Priority and BPU core scheduling settings are supported.
- Output postprocessing

Reshape and normalize output tensors:

- `instance_seg_logits` : output a three-channel image to visualize each lane instance
- `binary_seg_pred` : output a single-channel binary map to extract lane regions

## Environment Dependencies

This sample has no special environment requirements. You only need to ensure the dependencies in `pydev` are installed.

```bash
pip install -r ../../requirements.txt
```

## Directory Structure

```text
.
├── lanenet.py                  # Main inference script
└── README.md                   # Usage instructions
```

## Parameter Description

| Parameter | Description | Default Value 
| `--model-path` | Model file path ( `.hbm` format) | `/opt/hobot/model/s100/basic/lanenet256x512.hbm` 
| `--priority` | Model running priority, range `0~255` ; larger is higher | `0` 
| `--bpu-cores` | BPU core IDs used to run the model | `[0]` 
| `--test-img` | Test image path | `/app/res/assets/input.jpg` 

## Quick Start

- Run the model

- Use default parameters
```bash
python lanenet.py
```
- Run with specified parameters
```bash
python lanenet.py \
--model-path /opt/hobot/model/s100/basic/lanenet256x512.hbm \
--priority 0 \
--bpu-cores 0 \
--test-img /app/res/assets/input.jpg
```
- View the result

After successful execution, results will be drawn and saved to `instance_pred.png` and `binary_pred.png` .

```bash
Results saved to: instance_pred.png and binary_pred.png
```

## Notes

- If the specified model path does not exist, the program will attempt to download the model automatically.
