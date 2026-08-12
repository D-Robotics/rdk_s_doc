---
title: 图像分类-ResNet18 (Python)
sidebar_position: 3
description: "用 hbm_runtime Python 接口部署 ResNet18 做图像分类推理的预装示例"
---

# 图像分类-ResNet18 (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何使用 `hbm_runtime` 的 Python 接口部署 ResNet18 模型，对一张图片做图像分类推理并输出 Top-5 结果。适用于搭载 BPU 的 RDK 设备，是模式 1（直接使用）下最快跑通预装 demo 的路径之一。

<DocScope products="RDK-S100">

示例代码位于板端 `/app/pydev_demo/01_classification_sample/01_resnet18/` 目录下。

</DocScope>
<DocScope products="RDK-S600">

示例代码位于板端 `/app/pydev_demo/classification_sample/resnet18/` 目录下。

</DocScope>

## 前置条件

- 开发板已烧录 RDK OS 并能通过 SSH 登录（见 [1.3 烧录系统与配置](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- 预装模型已就位（默认路径下存在，无需手动下载）：
  - S100：`/opt/hobot/model/s100/basic/resnet18_224x224_nv12.hbm`
  - S600：`/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm`
- Python 环境与 `hbm_runtime` 已随镜像预装，无需额外安装。

## 环境依赖

本示例依赖 `pydev_demo` 目录下的公共工具库（`utils`）。若提示缺少依赖：

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

## 代码位置

<DocScope products="RDK-S100">

板端路径：`/app/pydev_demo/01_classification_sample/01_resnet18/`

</DocScope>
<DocScope products="RDK-S600">

板端路径：`/app/pydev_demo/classification_sample/resnet18/`

</DocScope>

目录结构：

```text
.
├── resnet18.py     # 主程序，用 hbm_runtime 调用 ResNet18 做分类
└── README.md       # 使用说明
```

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | 模型文件路径（.hbm 格式） | S600: `/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm`（S100 对应 `s100/basic/`） |
| `--test-img` | 测试图片路径 | `/app/res/assets/zebra_cls.jpg` |
| `--label-file` | 类别标签映射文件（imagenet 1000 类） | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` |
| `--priority` | 模型调度优先级（0~255，越大越高） | `0` |
| `--bpu-cores` | 推理使用的 BPU 核心编号列表（如 `--bpu-cores 0 1`） | `[0]` |

## 使用方法

进入示例目录后直接运行（默认参数即可跑通）：

<DocScope products="RDK-S100">

```bash
cd /app/pydev_demo/01_classification_sample/01_resnet18
python resnet18.py
```

</DocScope>
<DocScope products="RDK-S600">

```bash
cd /app/pydev_demo/classification_sample/resnet18
python resnet18.py
```

</DocScope>

指定参数运行（等价于默认值）：

<DocScope products="RDK-S600">

```bash
python resnet18.py \
  --model-path /opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm \
  --test-img /app/res/assets/zebra_cls.jpg \
  --label-file /app/res/labels/imagenet1000_clsidx_to_labels.txt
```

</DocScope>

## 运行效果

程序加载模型、完成一次推理后，输出 Top-5 分类结果。以下是 RDK S600 上的实测输出（测试图为斑马 `zebra_cls.jpg`）：

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

**成功标志**：末尾出现 `Top-5 Predictions:` 且 `zebra` 概率最高（约 0.998）。`Model Description` 中 `MARCH` 与芯片一致（S600 为 `nash-p`）即模型与板端匹配。

## 软件说明

数据流：读图（BGR）→ resize 到 224×224 → 转 NV12 → `hbm_runtime` 推理 → 读输出 tensor → 取 Top-5 → 映射 imagenet 标签。`Resnet18` 类封装了模型加载、I/O 名解析、调度参数（优先级/核心绑定）与推理执行。

## 常见问题

- **报错找不到模型**：检查 `--model-path` 路径下 `.hbm` 是否存在；缺失时程序会尝试自动下载，但需联网。
- **报错 `No module named 'utils'`**：未在示例目录下运行，`resnet18.py` 依赖上级 `utils`，须 `cd` 进示例目录后再跑。
- **分类结果与预期不符**：确认测试图与模型匹配（本示例用 `zebra_cls.jpg` + ResNet18）；换图后结果随之变化属正常。

## 相关文档

- [C/C++ 版 ResNet18 示例](./01_resnet18.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
- [Python 推理 API](../../../04_Simple_API/02_inference_api/01_python_api.md)
- [使用自己的模型](../../04_demo_support/04_custom_model.md)
