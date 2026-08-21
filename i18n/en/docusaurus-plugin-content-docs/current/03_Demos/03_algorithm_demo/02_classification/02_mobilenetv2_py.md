---
title: Image Classification - MobileNetV2 (Python)
sidebar_position: 4
description: "Pre-installed sample for deploying MobileNetV2 with the hbm_runtime Python interface for image classification"
---

# Image Classification - MobileNetV2 (Python)

This sample demonstrates how to deploy the MobileNetV2 model with the Python interface of `hbm_runtime` for image classification inference. MobileNetV2 is a lightweight classification network with few parameters and low latency, suitable for scenarios sensitive to compute power/power consumption. Like [ResNet18 (Python)](./01_resnet18_py.md), it is a classification sample; you can compare accuracy and speed.

The sample code is located in the `/app/pydev_demo/classification_sample/mobilenetv2/` directory on the board.

## Prerequisites

- The development board is flashed with RDK OS and logged in via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- The pre-installed model is in place: S600 `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm`.
- The Python environment and `hbm_runtime` are pre-installed with the image.

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model-path` | Model file path (.hbm) | S600: `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm` |
| `--test-img` | Test image path | `/app/res/assets/zebra_cls.jpg` |
| `--label-file` | Class labels (imagenet 1000 classes) | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` |
| `--priority` | Model scheduling priority | `0` |
| `--bpu-cores` | List of BPU core IDs | `[0]` |

## Usage

```bash
cd /app/pydev_demo/classification_sample/mobilenetv2
python mobilenetv2.py
```

**Notes**:

- You must first `cd` into the sample directory before running it: the script depends on the common `utils` module in the parent directory, and running it in another directory will fail with `No module named 'utils'`.
- The model must be located at the default path `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm`. If missing, `--model-path` must be explicitly specified.

## Execution Results

Actual output on RDK S600 (test image `zebra_cls.jpg`):

```text
Model Description:
 - mobilenetv2_224x224_nv12: {"MARCH": "nash-p", "INPUT_SHAPE": "1x3x224x224",
   "INPUT_TYPE_RT": "nv12", "NORM_TYPE": "data_mean_and_scale",
   "MEAN_VALUE": "[103.94, 116.78, 123.68]", "SCALE_VALUE": "[0.017]", ...}

Top-5 Predictions:
zebra: 0.9927
tiger, Panthera tigris: 0.0040
hartebeest: 0.0010
tiger cat: 0.0008
impala, Aepyceros melampus: 0.0004
```

**Success indicator**: `Top-5 Predictions:` appears at the end and `zebra` has the highest probability (about 0.993). Compared with ResNet18 (zebra 0.9983), MobileNetV2 has a slightly lower probability but a lighter model, which matches the characteristics of lightweight models.

## Software Notes

Data flow: read image (BGR) → resize to 224×224 → convert to NV12 → BPU inference → read output tensor → Top-5 → map to labels. Model input `1x3x224x224`, normalization `data_mean_and_scale` (mean BGR, scale 0.017), trained with BGR.

## FAQ

- **Error that the model cannot be found**: Check `--model-path`; the S600 model is in `/opt/hobot/model/s600/basic/`.
- **Error `No module named 'utils'`**: It must be run inside the sample directory (it depends on the parent `utils`).
- **Results differ slightly from ResNet18**: The models are different, so the Top-5 rankings/probabilities differ. This is normal.

## Related Documentation

- [Image Classification - ResNet18 (Python)](./01_resnet18_py.md)
- [C/C++ version of the MobileNetV2 sample](./02_mobilenetv2.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [Python Inference API](../../../04_Simple_API/02_inference_api/02_python_api.md)
