---
title: 算法示例概述
sidebar_position: 1
description: 第3章算法示例的组织方式与运行入口
---

# 3.3.1 算法示例概述

本章的算法示例覆盖 BPU 常见智能应用场景，每个示例都对应板端 `/app` 下的预装示例代码，**C/C++ 与 Python 对照**，可直接在板端编译/运行验证。

## 示例分类

| 类别 | 示例 | 板端代码 |
|---|---|---|
| 图像分类 | [ResNet18](./02_classification/01_resnet18_py.md) · [MobileNetV2](./02_classification/02_mobilenetv2_py.md) | `/app/cdev_demo/bpu/classification_sample` · `/app/pydev_demo/classification_sample` |
| 目标检测 | [YOLOv5x](./03_detection/01_yolov5x_py.md) · [YOLO11](./03_detection/02_yolo11_py.md) | `.../detection_sample` |
| 实例分割 | [YOLO11-Seg](./04_instance_segmentation/01_yolo11_seg_py.md) | `.../instance_segmentation_sample` |
| 姿态估计 | [YOLO11-Pose](./05_pose/01_yolo11_pose_py.md) | `.../pose_sample` |
| 自动语音识别 | [ASR](./06_speech/01_asr_py.md) | `.../speech_sample` |
| 摄像头+推理 | [USB Camera](./07_camera_streaming/01_usb_camera_py.md) · [MIPI](./07_camera_streaming/02_mipi_camera_py.md) · [RTSP](./07_camera_streaming/03_decode_rtsp_py.md) · [WebSocket](./07_camera_streaming/04_websocket_py.md) | `.../usb_camera_sample` 等 |

每个示例同时提供 C/C++ 与 Python 两版（C++ 在 `/app/cdev_demo`、Python 在 `/app/pydev_demo`），文档以"示例名 (C/C++)"与"示例名 (Python)"对照列出，可按语言选读。

## 运行前置

跑示例前先确认模型与测试资源就位，见 [模型获取与放置](../04_demo_support/01_model_files.md)：

- 预装模型在 `/opt/hobot/model/<产品>/basic/`（如 `resnet18_224x224_nv12.hbm`）。
- 类别标签在 `/app/res/labels/`（如 `imagenet1000_clsidx_to_labels.txt`、`coco_classes.names`）。
- 测试图/视频在 `/app/res/assets/`（如 `zebra_cls.jpg`、`bus.jpg`、`1080P_test.h264`）。

编译/运行方法见 [C/C++ demo 编程指南](../04_demo_support/02_c_cpp_build.md) 与 [Python demo 编程指南](../04_demo_support/03_python_build.md)。

## BPU 与 Model Zoo

RDK Model Zoo 是 D-Robotics 面向 RDK 板提供的 BPU 可运行模型示例与工具集合，覆盖分类/检测/分割/姿态/多模态等，提供从原始模型（PyTorch/ONNX）→ 量化转换 → 推理运行 → 结果解析 → 示例验证的完整参考。

:::tip
Model Zoo GitHub：https://github.com/D-Robotics/rdk_model_zoo
用户手册：https://developer.d-robotics.cc/model_zoo_doc/model_zoo_intro
:::

欢迎社区贡献新模型/优化/文档（Pull Request）。

## 用自己的模型

示例自带模型已量化为 `.hbm`。要用自己的模型，需经算法工具链量化编译，见 [使用自己的模型](../04_demo_support/04_custom_model.md) 与第 5 章 [算法工具链](../../07_Advanced_development/10_algorithm_toolchain/01_algorithm_toolchain/01_overview.md)。

## 相关文档

- [模型获取与放置](../04_demo_support/01_model_files.md)
- [C/C++ demo 编程指南](../04_demo_support/02_c_cpp_build.md)
- [Python demo 编程指南](../04_demo_support/03_python_build.md)
- [使用自己的模型](../04_demo_support/04_custom_model.md)
- [Python 推理 API](../../04_Simple_API/02_inference_api/01_python_api.md)
