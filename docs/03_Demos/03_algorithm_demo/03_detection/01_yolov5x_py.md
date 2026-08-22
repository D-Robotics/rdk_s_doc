---
title: 目标检测-Ultralytics YOLOv5x (Python)
sidebar_position: 3
description: "用 hbm_runtime Python 接口部署 YOLOv5x 做目标检测的预装示例"
---

# 目标检测-Ultralytics YOLOv5x (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何在 BPU 上用 `hbm_runtime` 的 Python 接口部署量化后的 Ultralytics YOLOv5x 模型，对一张图片做目标检测（前处理 + 推理 + NMS + 框绘制），并把检测结果保存成图片。适用于搭载 BPU 的 RDK 设备。

示例代码位于板端 `/app/pydev_demo/detection_sample/ultralytics_yolov5x/` 目录下。

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)）。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`）。
- Python 环境与 `hbm_runtime` 已随镜像预装。

## 环境依赖

依赖 `pydev_demo` 公共工具库（`utils`）。若提示缺少依赖：

<DocScope products="RDK S100">

```bash
cd /app/pydev_demo && pip install -r requirements.txt
```

</DocScope>
<DocScope products="RDK S600">

```bash
cd /app/pydev_demo && pip install -r requirements.txt --break-system-packages
```

</DocScope>

## 代码位置

板端路径：`/app/pydev_demo/detection_sample/ultralytics_yolov5x/`

目录结构：

```text
.
├── ultralytics_yolov5x.py   # 主推理脚本
└── README.md                # 使用说明
```

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | 模型文件路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` |
| `--test-img` | 测试图片路径 | `/app/res/assets/kite.jpg` |
| `--label-file` | 类别标签（每行一个类，COCO 80 类） | `/app/res/labels/coco_classes.names` |
| `--img-save-path` | 检测结果图保存路径 | `result.jpg` |
| `--priority` | 模型调度优先级（0~255） | `0` |
| `--bpu-cores` | BPU 核心编号列表（如 `--bpu-cores 0 1`） | `[0]` |
| `--nms-thres` | NMS 阈值 | `0.45` |
| `--score-thres` | 置信度阈值 | `0.25` |

## 使用方法

进入示例目录后直接运行：

```bash
cd /app/pydev_demo/detection_sample/ultralytics_yolov5x
python ultralytics_yolov5x.py
```

运行成功后，检测框会绘制在原图上并保存为 `result.jpg`。

**注意事项**：

- 须先 `cd` 进示例目录再运行：脚本依赖上级目录的公共 `utils` 模块，在其他目录运行会报 `No module named 'utils'`。
- 检测结果图 `result.jpg` 保存在当前工作目录（即示例目录），在其他目录运行会找不到结果图。
- 模型须位于默认路径（S600 为 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`，S100 对应 `s100/basic/`），缺失时 `--model-path` 需显式指定。

## 运行效果

程序加载模型、推理、NMS 后处理、绘制框并保存。以下是 RDK S600 上的实测输出（节选，测试图 `kite.jpg`）：

```text
Model Description:
 - yolov5x_672x672_nv12: {"MARCH": "nash-p", "INPUT_SHAPE": "1x3x672x672",
   "INPUT_TYPE_RT": "nv12", "NORM_TYPE": "data_scale",
   "SCALE_VALUE": "[0.003921568627451]"}

=== Scheduling Parameters ===
yolov5x_672x672_nv12:
  priority    : 0
  bpu_cores   : [0]
  deviceId    : 0

[Saved] Result saved to: result.jpg
```

**成功标志**：末尾出现 `[Saved] Result saved to: result.jpg`。用图片查看器打开 `result.jpg`，能看到检测到的目标框（如 `kite.jpg` 中的人与风筝）。

## 软件说明

数据流：读图（BGR）→ resize 到 672×672 → 转 NV12 → BPU 推理 → 解码输出头 → NMS 去重 → 取 score≥0.25 的框 → 在原图上绘制框与类别 → 保存。模型输入 `1x3x672x672`，归一化用 `data_scale`（scale≈1/255）。

## 常见问题

- **`result.jpg` 看不到框**：确认测试图含可识别目标；调低 `--score-thres`（如 0.1）或 `--nms-thres` 看更多候选框。
- **报错找不到模型**：检查 `--model-path` 下 `.hbm` 是否存在；S600 模型在 `/opt/hobot/model/s600/basic/`。
- **报错 `No module named 'utils'`**：未在示例目录下运行，须 `cd` 进 `ultralytics_yolov5x/` 再跑（依赖上级 `utils`）。

## 相关文档

- [C/C++ 版 YOLOv5x 示例](./01_yolov5x.md)
- [图像分类-ResNet18 (Python)](../02_classification/01_resnet18_py.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
- [Python 推理 API](../../../04_Simple_API/02_inference_api/02_python_api.md)
