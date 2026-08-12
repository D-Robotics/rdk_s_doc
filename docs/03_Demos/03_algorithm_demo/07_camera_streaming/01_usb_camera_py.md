---
title: USB Camera YOLOv5x 推理 (Python)
sidebar_position: 5
description: "USB 摄像头实时 YOLOv5x 检测推理示例"
---

# USB Camera YOLOv5x 推理 (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

基于 `hbm_runtime` 的 Ultralytics YOLOv5x 实时推理示例，通过 USB 摄像头读取画面做目标检测，全屏可视化结果。适用于搭载 BPU 的 RDK 设备，需桌面环境与 USB 摄像头。

:::info 说明
本示例需 USB 摄像头与桌面环境，本板（headless、无 video 设备）未实测。命令与参数据板端 README，运行前请接好 USB 摄像头（`ls /dev/video*` 确认）。
:::

<DocScope products="RDK-S100">

示例代码位于板端 `/app/pydev_demo/09_usb_camera_sample/` 目录下。

</DocScope>
<DocScope products="RDK-S600">

示例代码位于板端 `/app/pydev_demo/usb_camera_sample/` 目录下。

</DocScope>

## 前置条件

- 桌面版镜像（Desktop），或能进入桌面/console 显示。
- USB 摄像头已连接并被识别（`ls /dev/video*` 有设备）。
- 预装模型：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`）。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | BPU 量化模型路径（.hbm） | S100: `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm` |
| `--priority` | 推理优先级（0~255） | `0` |
| `--bpu-cores` | BPU 核心索引列表 | `[0]` |
| `--label-file` | 类别标签（COCO） | `/app/res/labels/coco_classes.names` |
| `--nms-thres` | NMS 的 IoU 阈值 | `0.45` |
| `--score-thres` | 检测置信度阈值 | `0.25` |

## 使用方法

```bash
cd /app/pydev_demo/usb_camera_sample   # S100 改为对应路径
python usb_camera_yolov5x.py
```

运行后从 USB 摄像头实时取帧 → YOLOv5x 推理 → 全屏显示检测框。

## 常见问题

- **`No such file or directory: /dev/video*`**：USB 摄像头未识别，检查 USB 连接、`lsusb` 是否列出、是否为 UVC 摄像头。
- **无画面/黑屏**：需桌面环境（Desktop 镜像或已配置显示），Server 版无法全屏显示。
- **帧率低**：调高 `--bpu-cores` 用多核，或降低输入分辨率。

## 相关文档

- [MIPI Camera YOLOv5x 推理 (Python)](./02_mipi_camera_py.md)
- [目标检测-YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
