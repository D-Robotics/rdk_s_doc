---
title: 图像分类-MobileNetV2 (Python)
sidebar_position: 4
description: "用 hbm_runtime Python 接口部署 MobileNetV2 做图像分类的预装示例"
---

# 图像分类-MobileNetV2 (Python)

本示例演示如何用 `hbm_runtime` 的 Python 接口部署 MobileNetV2 模型做图像分类推理。MobileNetV2 是轻量级分类网络，参数少、延迟低，适合对算力/功耗敏感的场景。与 [ResNet18 (Python)](./01_resnet18_py.md) 同为分类示例，可对比精度与速度。

示例代码位于板端 `/app/pydev_demo/classification_sample/mobilenetv2/` 目录下。

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)）。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm`。
- Python 环境与 `hbm_runtime` 已随镜像预装。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | 模型文件路径（.hbm） | S600: `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm` |
| `--test-img` | 测试图片路径 | `/app/res/assets/zebra_cls.jpg` |
| `--label-file` | 类别标签（imagenet 1000 类） | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` |
| `--priority` | 模型调度优先级 | `0` |
| `--bpu-cores` | BPU 核心编号列表 | `[0]` |

## 使用方法

```bash
cd /app/pydev_demo/classification_sample/mobilenetv2
python mobilenetv2.py
```

**注意事项**：

- 须先 `cd` 进示例目录再运行：脚本依赖上级目录的公共 `utils` 模块，在其他目录运行会报 `No module named 'utils'`。
- 模型须位于默认路径 `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm`，缺失时 `--model-path` 需显式指定。

## 运行效果

RDK S600 实测输出（测试图 `zebra_cls.jpg`）：

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

**成功标志**：末尾出现 `Top-5 Predictions:` 且 `zebra` 概率最高（约 0.993）。与 ResNet18（zebra 0.9983）相比，MobileNetV2 概率略低但模型更轻，符合轻量模型特性。

## 软件说明

数据流：读图（BGR）→ resize 到 224×224 → 转 NV12 → BPU 推理 → 读输出 tensor → Top-5 → 映射标签。模型输入 `1x3x224x224`，归一化 `data_mean_and_scale`（mean BGR、scale 0.017），训练用 BGR。

## 常见问题

- **报错找不到模型**：检查 `--model-path`，S600 模型在 `/opt/hobot/model/s600/basic/`。
- **报错 `No module named 'utils'`**：须在示例目录内运行（依赖上级 `utils`）。
- **与 ResNet18 结果略有差异**：模型不同，Top-5 排序/概率有差异，正常。

## 相关文档

- [图像分类-ResNet18 (Python)](./01_resnet18_py.md)
- [C/C++ 版 MobileNetV2 示例](./02_mobilenetv2.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
- [Python 推理 API](../../../04_Simple_API/02_inference_api/02_python_api.md)
