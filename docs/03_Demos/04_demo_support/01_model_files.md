---
title: 模型获取与放置
sidebar_position: 1
description: 跑 demo 前的模型与测试资源路径说明
---

# 3.4.1 模型获取与放置

跑算法 demo 前，需要知道模型文件（`.hbm`）、类别标签、测试图片放在板端哪里。RDK OS 镜像已预装一批常用模型与资源，多数 demo 可直接跑、无需额外下载。

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 预装模型

镜像预装的模型位于 `/opt/hobot/model/<产品>/basic/`：

<DocScope products="RDK S600">

```text
/opt/hobot/model/s600/basic/
├── resnet18_224x224_nv12.hbm          # 图像分类
├── resnet50_224x224_nv12.hbm
├── mobilenetv2_224x224_nv12.hbm
├── centernet_resnet101_512x512_nv12.hbm   # 目标检测
├── fcos_efficientnetb0_512x512_nv12.hbm
├── ssd_mobilenetv1_300x300_nv12.hbm
├── deeplabv3plus_*.hbm                # 语义分割
├── fastscnn_efficientnetb0_1024x2048_nv12.hbm
└── efficientnet_lite0_224x224_nv12.hbm
```

</DocScope>

<DocScope products="RDK S100">

路径为 `/opt/hobot/model/s100/basic/`，模型集合与 S600 类似（按芯片能力略有差异）。

</DocScope>

部分示例（如 `cdev_demo`/`pydev_demo`）也会用到 `/app/model/basic/` 下的模型，内容与上述基本一致。

## 类别标签

ImageNet、COCO 等数据集的类别映射文件位于 `/app/res/labels/`：

```text
/app/res/labels/
├── imagenet1000_clsidx_to_labels.txt   # ImageNet 1000 类（分类 demo 用）
├── coco_classes.names                  # COCO 80 类（检测 demo 用）
├── coco_extended.names
├── ppocr_keys_v1.txt                   # OCR 字典
└── vocab.json
```

## 测试图片与素材

跑 demo 用的测试图片、视频位于 `/app/res/assets/`：

```text
/app/res/assets/
├── zebra_cls.jpg        # 斑马（分类 demo 默认图）
├── bus.jpg, kite.jpg, input.jpg ...   # 各类测试图
├── 1080P_test.h264, nv12_1920x1080.yuv # 测试视频/裸流
└── chi_sound.wav        # 音频（语音识别 demo）
```

## 跑 demo 前的检查

以 ResNet18 分类 demo 为例，确认模型与图片就位：

```bash
ls /opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm
ls /app/res/assets/zebra_cls.jpg
ls /app/res/labels/imagenet1000_clsidx_to_labels.txt
```

三条都返回路径即就绪，可直接跑 demo（见 [ResNet18 (Python)](../03_algorithm_demo/02_classification/01_resnet18_py.md)）。

## 补充下载

若某模型不在预装列表中，可从 RDK 模型库下载（需联网）：

```bash
# 示例：下载 S600 的 ResNet18
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ResNet/resnet18_224x224_nv12.hbm
```

放到 `/opt/hobot/model/<产品>/basic/` 或 demo 指定的 `--model-path` 路径即可。

## 相关文档

- [ResNet18 分类示例](../03_algorithm_demo/02_classification/01_resnet18_py.md)
- [Python 推理 API](../../04_Simple_API/02_inference_api/01_python_api.md)
- [使用自己的模型](./04_custom_model.md)
- [C/C++ demo 编程指南](./02_c_cpp_build.md)
