---
title: "Algorithm Demo Overview"
sidebar_position: 1
description: "How the Chapter 3 algorithm demos are organized and how to run them"
---

# Algorithm Demo Overview

The algorithm demos in this chapter cover common BPU intelligent application scenarios. Each demo corresponds to pre-installed sample code under `/app` on the board, **with C/C++ and Python side by side**, ready to be compiled/run directly on the board for verification.

## Demo Categories

| Category | Demos | On-board Code |
|---|---|---|
| Image Classification | [ResNet18](./02_classification/01_resnet18_py.md) · [MobileNetV2](./02_classification/02_mobilenetv2_py.md) | `/app/cdev_demo/bpu/classification_sample` · `/app/pydev_demo/classification_sample` |
| Object Detection | [YOLOv5x](./03_detection/01_yolov5x_py.md) · [YOLO11](./03_detection/02_yolo11_py.md) | `.../detection_sample` |
| Instance Segmentation | [YOLO11-Seg](./04_instance_segmentation/01_yolo11_seg_py.md) | `.../instance_segmentation_sample` |
| Pose Estimation | [YOLO11-Pose](./05_pose/01_yolo11_pose_py.md) | `.../pose_sample` |
| Automatic Speech Recognition | [ASR](./06_speech/01_asr_py.md) | `.../speech_sample` |
| Camera + Inference | [USB Camera](./07_camera_streaming/01_usb_camera_py.md) · [MIPI](./07_camera_streaming/02_mipi_camera_py.md) · [RTSP](./07_camera_streaming/03_decode_rtsp_py.md) · [Video Decoding](./07_camera_streaming/04_decode.md) · [WebSocket](./07_camera_streaming/04_websocket_py.md) | `.../usb_camera_sample` etc. |

Most demos provide both C/C++ and Python versions (C++ under `/app/cdev_demo`, Python under `/app/pydev_demo`). The documentation lists them side by side as "Demo Name (C/C++)" and "Demo Name (Python)", so you can choose by language; a few demos provide only one version (Video Decoding is C/C++ only, WebSocket is Python only).

## Prerequisites for Running

Before running a demo, confirm that models and test resources are in place. See [Model Acquisition and Placement](../04_demo_support/01_model_files.md):

- Pre-installed models are in `/opt/hobot/model/<product>/basic/` (e.g., `resnet18_224x224_nv12.hbm`).
- Class labels are in `/app/res/labels/` (e.g., `imagenet1000_clsidx_to_labels.txt`, `coco_classes.names`).
- Test images/videos are in `/app/res/assets/` (e.g., `zebra_cls.jpg`, `bus.jpg`, `1080P_test.h264`).

For compilation/execution instructions, see the [C/C++ Demo Build Guide](../04_demo_support/02_c_cpp_build.md) and the [Python Demo Build Guide](../04_demo_support/03_python_build.md).

## BPU and Model Zoo

RDK Model Zoo is a collection of BPU-runnable model samples and tools provided by D-Robotics for RDK boards, covering classification/detection/segmentation/pose/multimodal and more. It provides complete references from the original model (PyTorch/ONNX) → quantization conversion → inference execution → result parsing → sample verification.

:::tip
Model Zoo GitHub: https://github.com/D-Robotics/rdk_model_zoo
User manual: https://developer.d-robotics.cc/model_zoo_doc/model_zoo_intro
:::

Community contributions of new models/optimizations/documentation (Pull Requests) are welcome.

## Using Your Own Model

The models bundled with the demos are already quantized to `.hbm`. To use your own model, it must be quantized and compiled with the algorithm toolchain. See [Using Your Own Model](../04_demo_support/04_custom_model.md) and Chapter 5 [Algorithm Toolchain](../../07_Advanced_development/10_algorithm_toolchain/01_algorithm_toolchain/01_overview.md).

## Related Documentation

- [Model Acquisition and Placement](../04_demo_support/01_model_files.md)
- [C/C++ Demo Build Guide](../04_demo_support/02_c_cpp_build.md)
- [Python Demo Build Guide](../04_demo_support/03_python_build.md)
- [Using Your Own Model](../04_demo_support/04_custom_model.md)
- [C Inference API](../../04_Simple_API/02_inference_api/01_c_api.md)
- [Python Inference API](../../04_Simple_API/02_inference_api/02_python_api.md)
