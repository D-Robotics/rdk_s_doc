---
title: Image Classification - MobileNetV2 (C/C++)
sidebar_position: 2
description: "Pre-installed sample for deploying MobileNetV2 with C/C++ for image classification"
---

# Image Classification - MobileNetV2 (C/C++)

This sample demonstrates how to deploy the MobileNetV2 model on the BPU with `C/C++`, run image classification inference, and output Top-K results. MobileNetV2 is a lightweight classification network, suitable for scenarios sensitive to compute power/power consumption. For the Python version, see [MobileNetV2 (Python)](./02_mobilenetv2_py.md); for the C++ version of ResNet18, see [ResNet18 (C/C++)](./01_resnet18.md).

The sample code is located in the `/app/cdev_demo/bpu/classification_sample/mobilenetv2/` directory on the board.

## Prerequisites

- The development board is flashed with RDK OS and logged in via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- The board has a compilation toolchain (`cmake`, `make`, `g++`, pre-installed in the image).
- The pre-installed model is in place:
  - S100: `/opt/hobot/model/s100/basic/mobilenetv2_224x224_nv12.hbm`
  - S600: `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm`

## Environment Dependencies

```bash
sudo apt update && sudo apt install libgflags-dev
```

## Build

```bash
cd /app/cdev_demo/bpu/classification_sample/mobilenetv2
mkdir build && cd build
cmake ..
make -j$(nproc)
```

The artifact is `build/mobilenetv2`.

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model_path` | Model file path (.hbm) | S600: `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm`; S100: `/opt/hobot/model/s100/basic/mobilenetv2_224x224_nv12.hbm` |
| `--test_img` | Test image path | `/app/res/assets/zebra_cls.jpg` |
| `--label_file` | Class labels (imagenet) | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` |
| `--top_k` | Number of Top-K results to output | `5` |

## Usage

```bash
./mobilenetv2
```

**Notes**:

- It must be run in the `build` directory. The default paths such as `--test_img` and `--label_file` are given according to the pre-installed directories on the board.
- Before compiling for the first time, install `libgflags-dev` as described in "Environment Dependencies", otherwise `make` will fail.
- The model must be located at the default path (S600: `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm`, S100: `/opt/hobot/model/s100/basic/mobilenetv2_224x224_nv12.hbm`). If missing, `--model_path` must be explicitly specified.

## Execution Results

Actual output on RDK S600 (test image `zebra_cls.jpg`):

```text
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
TOP 0: label=zebra, prob=0.992726
TOP 1: label=tiger, Panthera tigris, prob=0.00401174
TOP 2: label=hartebeest, prob=0.00104985
TOP 3: label=tiger cat, prob=0.000753967
TOP 4: label=impala, Aepyceros melampus, prob=0.000424489
```

**Success indicator**: Top-K lines such as `TOP 0: label=zebra, prob=0.992726` appear at the end, and `zebra` has the highest probability (about 0.993, consistent with the Python version).

## Software Notes

Data flow: read image (BGR) → resize to 224×224 → convert to NV12 → BPU inference → read output tensor → Top-K → map to labels. Model input `1x3x224x224`, normalization `data_mean_and_scale` (mean BGR, scale 0.017).

## FAQ

- **`make` fails with `gflags` not found**: Install `libgflags-dev`.
- **Error that the model cannot be found**: Check `--model_path`; the S600 model is in `/opt/hobot/model/s600/basic/`.
- **Results differ from ResNet18**: The models are different, so the probabilities/rankings differ. This is normal.

## Related Documentation

- [Python version of the MobileNetV2 sample](./02_mobilenetv2_py.md)
- [Image Classification - ResNet18 (C/C++)](./01_resnet18.md)
- [C/C++ Demo Build Guide](../../04_demo_support/02_c_cpp_build.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [C Inference API](../../../04_Simple_API/02_inference_api/01_c_api.md)
