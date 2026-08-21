---
title: Image Classification - ResNet18 (C/C++)
sidebar_position: 1
description: "Pre-installed sample for deploying ResNet18 with C/C++ for image classification inference"
---

# Image Classification - ResNet18 (C/C++)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates how to deploy the ResNet18 model with `C/C++`, run image classification inference on a single image, and output Top-K results. It applies to RDK devices equipped with a BPU and is a typical example of running the pre-installed demo with the C/C++ interface. For the Python version, see [ResNet18 (Python)](./01_resnet18_py.md).

The sample code is located in the `/app/cdev_demo/bpu/classification_sample/resnet18/` directory on the board.

## Prerequisites

- The development board is flashed with RDK OS and can be logged in via SSH (see [OS Installation and Configuration](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- The board has a compilation toolchain (`cmake`, `make`, `g++`, pre-installed in the image).
- The pre-installed model is in place (exists at the default path):
  - S100: `/opt/hobot/model/s100/basic/resnet18_224x224_nv12.hbm`
  - S600: `/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm`

## Environment Dependencies

Compilation requires `libgflags-dev` (argument parsing):

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Code Location

On-board path: `/app/cdev_demo/bpu/classification_sample/resnet18/`

Directory structure:

```text
.
|-- CMakeLists.txt    # CMake build script
|-- README.md         # Project documentation
|-- inc/
|   `-- resnet18.hpp  # ResNet18 inference class definition
`-- src/
    |-- main.cc      # Program entry point
    `-- resnet18.cc  # Inference class implementation
```

## Build

```bash
cd /app/cdev_demo/bpu/classification_sample/resnet18
mkdir build && cd build
cmake ..
make -j$(nproc)
```

The build artifact is `build/resnet_18`.

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model_path` | Model file path (`.hbm` format) | S600: `/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm` (S100 corresponds to `s100/basic/`) |
| `--test_img` | Test image path | `/app/res/assets/zebra_cls.jpg` |
| `--label_file` | ImageNet class mapping (one `index\tlabel` per line) | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` |
| `--top_k` | Number of Top-K classification results to output | `5` |

## Usage

Make sure you are in the `build` directory, then run with default parameters:

```bash
./resnet_18
```

Run with specified parameters (equivalent to the defaults):

<DocScope products="RDK-S600">

```bash
./resnet_18 \
  --model_path /opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm \
  --test_img   /app/res/assets/zebra_cls.jpg \
  --label_file /app/res/labels/imagenet1000_clsidx_to_labels.txt \
  --top_k 5
```

</DocScope>

**Notes**:

- It must be run in the `build` directory. The default paths such as `--test_img` and `--label_file` are given according to the pre-installed directories on the board.
- Before compiling for the first time, install `libgflags-dev` as described in "Environment Dependencies", otherwise `make` will fail.
- The model must be located at the default path (for S600 it is `/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm`; S100 corresponds to `s100/basic/`). If missing, `--model_path` must be explicitly specified.

## Execution Results

After loading the model and completing one inference, the program outputs the Top-K classification results. The following is actual output on RDK S600 (test image is the zebra `zebra_cls.jpg`):

```text
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
TOP 0: label=zebra, prob=0.998747
TOP 1: label=cheetah, chetah, Acinonyx jubatus, prob=0.000424569
TOP 2: label=impala, Aepyceros melampus, prob=0.000400993
TOP 3: label=gazelle, prob=0.000257577
TOP 4: label=prairie chicken, prairie grouse, prairie fowl, prob=0.000169584
```

**Success indicator**: Top-K lines such as `TOP 0: label=zebra, prob=0.998747` appear at the end, and `zebra` has the highest probability (about 0.999). The leading `BPULib verison(2, 2, 15)` and `DNN: 3.13.6` indicate that the BPU runtime is loaded properly.

## Software Notes

Data flow: read image (BGR) → resize to 224×224 → convert to NV12 → BPU inference → read output tensor → take Top-K → map to ImageNet labels. The `Resnet18` class encapsulates model loading, I/O parsing, inference execution, and post-processing.

## FAQ

- **`make` fails with `gflags` not found**: `libgflags-dev` is not installed. Install it as described in "Environment Dependencies".
- **Error that the model cannot be found**: Check whether the `.hbm` exists under `--model_path`; if missing, you can download it with `wget` as described in the README (internet connection required).
- **`cmake ..` cannot find OpenCV/toolchain**: OpenCV 4.6 is pre-installed in the image. If it has been uninstalled, reinstall it; regular images do not require manual installation.
- **Classification results differ slightly from the Python version**: The preprocessing/runtime implementations of C++ and Python have subtle differences (e.g., zebra probability 0.9987 in C++ vs 0.9983 in Python), which is normal.

## Related Documentation

- [Python version of the ResNet18 sample](./01_resnet18_py.md)
- [C/C++ Demo Build Guide](../../04_demo_support/02_c_cpp_build.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [C Inference API](../../../04_Simple_API/02_inference_api/01_c_api.md)
- [Using Your Own Model](../../04_demo_support/04_custom_model.md)
