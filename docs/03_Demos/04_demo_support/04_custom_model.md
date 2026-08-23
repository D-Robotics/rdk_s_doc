---
title: "使用自己的模型"
sidebar_position: 4
description: "用自己的模型替换 demo 模型的入口"
---

# 使用自己的模型

板端 demo 自带的模型（`/opt/hobot/model/<产品>/basic/`）已量化为 BPU 可运行的 `.hbm` 格式。要用**自己的模型**跑 demo，需把训练好的浮点模型（ONNX/CAFFE）经算法工具链**量化编译**成 `.hbm`，再放到板端并替换 demo 的 `--model-path`。

## 整体流程

1. 准备浮点模型（导出为 ONNX，或 CAFFE）。
2. 用 RDK 算法工具链量化编译为 `.hbm`（MARCH 与产品匹配：S600 为 `nashp`、S100 为 `nashe`）。
3. 把 `.hbm` 与配套的类别标签文件传到板端。
4. 在 demo 命令里用 `--model-path` 指向新模型、`--label-file` 指向新标签。

量化编译是模式 3（深度定制）的工作，详见第 5 章 [算法工具链开发指南](../../07_Advanced_development/10_algorithm_toolchain/01_algorithm_toolchain/01_overview.md)。

## 替换 demo 模型

以 ResNet18 分类 demo 为例，把自己的模型 `my_model.hbm` 放到板端后：

```bash
scp my_model.hbm root@<板端IP>:/opt/hobot/model/<产品>/basic/

# 板端运行时指定
cd /app/pydev_demo/classification_sample/resnet18
python resnet18.py \
    --model-path /opt/hobot/model/<产品>/basic/my_model.hbm \
    --label-file /app/res/labels/imagenet1000_clsidx_to_labels.txt
```

## 注意事项

- 模型的输入尺寸、归一化方式（mean/scale）、输入格式（NV12 等）必须与 demo 的预处理一致，否则结果错误。可在工具链的模型描述里查看（如 `INPUT_SHAPE`、`NORM_TYPE`、`SCALE_VALUE`）。
- 类别数与标签文件要匹配（如 1000 类用 imagenet 标签，80 类用 COCO 标签）。
- 若模型来自开源仓库，先确认其 License 允许部署。

## 相关文档

- [算法工具链（进阶）](../../07_Advanced_development/10_algorithm_toolchain/01_algorithm_toolchain/01_overview.md)
- [模型获取与放置](./01_model_files.md)
- [ResNet18 (Python) 示例](../03_algorithm_demo/02_classification/01_resnet18_py.md)
