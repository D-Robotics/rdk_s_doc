---
title: Image Classification - ResNet18 (Python)
sidebar_position: 3
description: "Pre-installed sample for deploying ResNet18 with the hbm_runtime Python interface for image classification inference"
---

# Image Classification - ResNet18 (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates how to deploy the ResNet18 model using the Python interface of `hbm_runtime`, run image classification inference on a single image, and output Top-5 results. It applies to RDK devices equipped with a BPU and is one of the fastest paths to running the pre-installed demo in Mode 1 (direct use).

The sample code is located in the `/app/pydev_demo/classification_sample/resnet18/` directory on the board.

## Prerequisites

- The development board is flashed with RDK OS and can be logged in via SSH (see [OS Installation and Configuration](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)).
- The pre-installed model is in place (exists at the default path, no manual download needed):
  - S100: `/opt/hobot/model/s100/basic/resnet18_224x224_nv12.hbm`
  - S600: `/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm`
- The Python environment and `hbm_runtime` are pre-installed with the image; no extra installation is required.

## Environment Dependencies

This sample depends on the common utility library (`utils`) under the `pydev_demo` directory. If it reports missing dependencies:

<DocScope products="RDK-S100">

```bash
cd /app/pydev_demo && pip install -r requirements.txt
```

</DocScope>
<DocScope products="RDK-S600">

```bash
cd /app/pydev_demo && pip install -r requirements.txt --break-system-packages
```

</DocScope>

## Code Location

On-board path: `/app/pydev_demo/classification_sample/resnet18/`

Directory structure:

```text
.
├── resnet18.py     # Main program; calls ResNet18 with hbm_runtime for classification
└── README.md       # Usage instructions
```

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model-path` | Model file path (.hbm format) | S600: `/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm` (S100 corresponds to `s100/basic/`) |
| `--test-img` | Test image path | `/app/res/assets/zebra_cls.jpg` |
| `--label-file` | Class label mapping file (imagenet 1000 classes) | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` |
| `--priority` | Model scheduling priority (0~255, higher means higher priority) | `0` |
| `--bpu-cores` | List of BPU core IDs used for inference (e.g., `--bpu-cores 0 1`) | `[0]` |

## Usage

Enter the sample directory and run it directly (default parameters are enough to run it):

```bash
cd /app/pydev_demo/classification_sample/resnet18
python resnet18.py
```

Run with specified parameters (equivalent to the defaults):

<DocScope products="RDK-S600">

```bash
python resnet18.py \
  --model-path /opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm \
  --test-img /app/res/assets/zebra_cls.jpg \
  --label-file /app/res/labels/imagenet1000_clsidx_to_labels.txt
```

</DocScope>

**Notes**:

- You must first `cd` into the sample directory before running it: the script depends on the common `utils` module in the parent directory, and running it in another directory will fail with `No module named 'utils'`.
- The model must be located at the default path (for S600 it is `/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm`; S100 corresponds to `s100/basic/`). If missing, `--model-path` must be explicitly specified.

## Execution Results

After loading the model and completing one inference, the program outputs the Top-5 classification results. The following is actual output on RDK S600 (test image is the zebra `zebra_cls.jpg`):

```text
Model Description:
 - resnet18_224x224_nv12: {"MARCH": "nash-p", "INPUT_SHAPE": "1x3x224x224",
   "INPUT_TYPE_RT": "nv12", "MEAN_VALUE": "[123.675, 116.28, 103.53]",
   "SCALE_VALUE": "[0.01712475, 0.017507, 0.01742919]", ...}

=== Scheduling Parameters ===
resnet18_224x224_nv12:
  priority    : 0
  bpu_cores   : [0]
  deviceId    : 0

Top-5 Predictions:
zebra: 0.9983
cheetah, chetah, Acinonyx jubatus: 0.0004
impala, Aepyceros melampus: 0.0004
gazelle: 0.0003
prairie chicken, prairie grouse, prairie fowl: 0.0002
```

**Success indicator**: `Top-5 Predictions:` appears at the end and `zebra` has the highest probability (about 0.998). If `MARCH` in `Model Description` matches the chip (`nash-p` for S600), the model matches the board.

## Software Notes

Data flow: read image (BGR) → resize to 224×224 → convert to NV12 → `hbm_runtime` inference → read output tensor → take Top-5 → map to imagenet labels. The `Resnet18` class encapsulates model loading, I/O name parsing, scheduling parameters (priority/core binding), and inference execution.

## FAQ

- **Error that the model cannot be found**: Check whether the `.hbm` exists under the `--model-path` path; when missing, the program will try to download it automatically, but an internet connection is required.
- **Error `No module named 'utils'`**: It is not running in the sample directory. `resnet18.py` depends on the parent `utils`, so you must `cd` into the sample directory before running it.
- **Classification results differ from expectations**: Confirm that the test image matches the model (this sample uses `zebra_cls.jpg` + ResNet18); it is normal that results change when the image is changed.

## Related Documentation

- [C/C++ version of the ResNet18 sample](./01_resnet18.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [Python Inference API](../../../04_Simple_API/02_inference_api/02_python_api.md)
- [Using Your Own Model](../../04_demo_support/04_custom_model.md)
