---
title: "Model Acquisition and Placement"
sidebar_position: 1
description: "Model and test resource paths to check before running demos"
---

# Model Acquisition and Placement

Before running algorithm demos, you need to know where the model files (`.hbm`), class labels, and test images are placed on the board. The RDK OS image comes pre-installed with a set of commonly used models and resources, so most demos can be run directly without any additional downloads.

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Pre-installed Models

The models pre-installed in the image are located in `/opt/hobot/model/<product>/basic/`:

<DocScope products="RDK S600">

```text
/opt/hobot/model/s600/basic/
├── resnet18_224x224_nv12.hbm                 # image classification
├── resnet50_224x224_nv12.hbm
├── mobilenetv2_224x224_nv12.hbm
├── efficientnet_lite0_224x224_nv12.hbm
├── vargconvnet_224x224_nv12.hbm
├── centernet_resnet101_512x512_nv12.hbm      # object detection
├── fcos_efficientnetb0_512x512_nv12.hbm
├── ssd_mobilenetv1_300x300_nv12.hbm
├── yolov2_darknet19_608x608_nv12.hbm
├── yolov3_darknet53_416x416_nv12.hbm
├── yolov5x_672x672_nv12.hbm
├── yolov8n_640x640_nv12.hbm
├── yolov10n_640x640_nv12.hbm
├── yolo11n_detect_nashp_640x640_nv12.hbm
├── deeplabv3plus_dilation1248_1024x2048_nv12.hbm   # segmentation
├── deeplabv3plus_efficientnetb0_1024x2048_nv12.hbm
├── fastscnn_efficientnetb0_1024x2048_nv12.hbm
├── unet_mobilenet_1024x2048_nv12.hbm
├── yolov8n_seg_640x640_nv12.hbm
├── yolo11n_seg_nashp_640x640_nv12.hbm
└── yolo11n_pose_nashp_640x640_nv12.hbm        # pose estimation
```

> `asr.hbm` (speech recognition) is not in the pre-installed list; download it from the RDK model zoo, see [ASR example](../03_algorithm_demo/06_speech/01_asr_py.md).

</DocScope>

<DocScope products="RDK S100">

The path is `/opt/hobot/model/s100/basic/`; the model set is similar to S600 (with slight differences according to chip capabilities).

</DocScope>

Some examples (such as `cdev_demo`/`pydev_demo`) also use the models under `/app/model/basic/`, whose content is largely the same as the above.

## Class Labels

The class mapping files for datasets such as ImageNet and COCO are located in `/app/res/labels/`:

```text
/app/res/labels/
├── imagenet1000_clsidx_to_labels.txt   # ImageNet 1000 classes (used by classification demos)
├── coco_classes.names                  # COCO 80 classes (used by detection demos)
├── coco_extended.names
├── ppocr_keys_v1.txt                   # OCR dictionary
└── vocab.json
```

## Test Images and Assets

The test images and videos used for running demos are located in `/app/res/assets/`:

```text
/app/res/assets/
├── zebra_cls.jpg        # zebra (default image for classification demos)
├── bus.jpg, kite.jpg, input.jpg ...   # various test images
├── 1080P_test.h264, nv12_1920x1080.yuv # test videos/raw streams
└── chi_sound.wav        # audio (speech recognition demo)
```

## Pre-Demo Check

Taking the ResNet18 classification demo as an example, confirm that the model and image are in place:

```bash
ls /opt/hobot/model/<product>/basic/resnet18_224x224_nv12.hbm
ls /app/res/assets/zebra_cls.jpg
ls /app/res/labels/imagenet1000_clsidx_to_labels.txt
```

If all three commands return paths, everything is ready and you can run the demo directly (see [ResNet18 (Python)](../03_algorithm_demo/02_classification/01_resnet18_py.md)).

## Supplementary Downloads

If a model is not in the pre-installed list, you can download it from the RDK model zoo (network access required):

```bash
# Example: download ResNet18 for S600
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ResNet/resnet18_224x224_nv12.hbm
```

Place it under `/opt/hobot/model/<product>/basic/` or at the `--model-path` path specified by the demo.

## FAQ

### "Model File Not Found" When Running a Demo

**Symptom**: Running an example reports that the model file does not exist.

**Cause**: The model is not pre-installed, or it is not placed in the correct path.

**Solution**: First check whether the corresponding `.hbm` file exists under `/opt/hobot/model/<product>/basic/`; if not, download it from the RDK model zoo (network required) and put it in that directory, or place it at the `--model-path` specified by the demo.

### The ASR Example Is Missing Its Model

**Symptom**: The ASR example reports that `asr.hbm` cannot be found.

**Cause**: `asr.hbm` is not in the pre-installed model list.

**Solution**: Download it from the RDK model zoo; see [ASR Example](../03_algorithm_demo/06_speech/01_asr_py.md).

### How to Fill In `<product>` in the Model Path

**Symptom**: You are unsure what to put for `<product>` in `/opt/hobot/model/<product>/basic/`.

**Cause**: Models are stored per product directory: `s600` for S600 and `s100` for S100.

**Solution**: Fill it in by product: `/opt/hobot/model/s600/basic/` for S600 and `/opt/hobot/model/s100/basic/` for S100.

## Related Documentation

- [ResNet18 Classification Example](../03_algorithm_demo/02_classification/01_resnet18_py.md)
- [Python Inference API](../../04_Simple_API/02_inference_api/02_python_api.md)
- [Using Your Own Model](./04_custom_model.md)
- [C/C++ Demo Build Guide](./02_c_cpp_build.md)
