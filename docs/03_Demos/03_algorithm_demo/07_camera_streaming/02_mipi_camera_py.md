---
title: MIPI Camera YOLOv5x 推理 (Python)
sidebar_position: 6
description: MIPI 摄像头实时 YOLOv5x 检测推理示例
---

# MIPI Camera YOLOv5x 推理 (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

基于 `hbm_runtime` 的 Ultralytics YOLOv5x 实时推理示例，通过 MIPI 摄像头（板载相机接口）读取画面做目标检测并可视化。需 MIPI 摄像头模块与显示。

:::info 说明
本示例需 MIPI 摄像头模块与显示，本板（未接 MIPI 摄像头）未实测。命令与参数据板端 README，运行前请确认 MIPI 摄像头已连接、被 `hobot-camera` 识别。
:::

<DocScope products="RDK-S100">

示例代码位于板端 `/app/pydev_demo/10_mipi_camera_sample/` 目录下。

</DocScope>
<DocScope products="RDK-S600">

示例代码位于板端 `/app/pydev_demo/mipi_camera_sample/` 目录下。

</DocScope>

## 前置条件

- MIPI 摄像头模块已连接到板载 MIPI 接口，并被 `hobot-camera` 识别。
- 桌面环境或可显示。
- 预装模型：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`）。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | BPU 量化模型路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` |
| `--priority` | 推理优先级 | `0` |
| `--bpu-cores` | BPU 核心索引列表 | `[0]` |
| `--label-file` | 类别标签（COCO） | `/app/res/labels/coco_classes.names` |
| `--nms-thres` | NMS 的 IoU 阈值 | `0.45` |
| `--score-thres` | 检测置信度阈值 | `0.25` |

## 使用方法

```bash
cd /app/pydev_demo/mipi_camera_sample   # S100 改为对应路径
python mipi_camera_yolov5x.py
```

运行后从 MIPI 摄像头实时取帧 → YOLOv5x 推理 → 显示检测框。

## 常见问题

- **取不到画面**：MIPI 摄像头未识别，`dmesg | grep -i sensor` 查 sensor，确认 `hobot-camera` 包已装、相机排线接好。
- **无画面显示**：需桌面/显示环境。
- **帧率低**：调高 `--bpu-cores` 或降低分辨率。

## 相关文档

- [USB Camera YOLOv5x 推理 (Python)](./01_usb_camera_py.md)
- [目标检测-YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
