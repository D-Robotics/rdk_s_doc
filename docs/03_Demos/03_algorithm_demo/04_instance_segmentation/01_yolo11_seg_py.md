---
title: 实例分割-Ultralytics YOLO11 (Python)
sidebar_position: 1
description: 用 hbm_runtime Python 接口部署 YOLO11 做实例分割的预装示例
---

# 实例分割-Ultralytics YOLO11 (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何用 `hbm_runtime` 的 Python 接口在 BPU 上部署 Ultralytics YOLO11 实例分割模型，对一张图片做实例分割（前处理 + 推理 + 掩码后处理），并把带掩码的结果保存成图片。

<DocScope products="RDK-S100">

示例代码位于板端 `/app/pydev_demo/03_instance_segmentation_sample/02_ultralytics_yolo11_seg/` 目录下。

</DocScope>
<DocScope products="RDK-S600">

示例代码位于板端 `/app/pydev_demo/instance_segmentation_sample/ultralytics_yolo11_seg/` 目录下。

</DocScope>

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm`。
- Python 环境与 `hbm_runtime` 已随镜像预装。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | 模型文件路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm` |
| `--test-img` | 测试图片路径 | `/app/res/assets/office_desk.jpg` |
| `--label-file` | 类别标签（COCO 80 类） | `/app/res/labels/coco_classes.names` |
| `--img-save-path` | 输出结果图保存路径 | `result.jpg` |

## 使用方法

<DocScope products="RDK-S600">

```bash
cd /app/pydev_demo/instance_segmentation_sample/ultralytics_yolo11_seg
python ultralytics_yolo11_seg.py
```

</DocScope>

运行成功后，实例分割掩码会叠加到原图并保存为 `result.jpg`。

## 运行效果

以下是 RDK S600 上的实测输出（测试图 `office_desk.jpg`）：

```text
Model Description:
 - yolo11n_seg_nashp_640x640_nv12_debug: {"MARCH": "nash-p",
   "INPUT_SHAPE": "1x3x640x640", "INPUT_TYPE_RT": "nv12",
   "NORM_TYPE": "data_scale", "SCALE_VALUE": "[0.003921568627451]", ...}

=== Scheduling Parameters ===
  priority    : 0
  bpu_cores   : [0]

[Saved] Result saved to: result.jpg
```

**成功标志**：末尾出现 `[Saved] Result saved to: result.jpg`。打开 `result.jpg` 可见叠加的实例分割掩码。

## 软件说明

数据流：读图 → resize 到 640×640 → 转 NV12 → BPU 推理 → 解码检测头与分割头 → NMS → 生成实例掩码 → 叠加到原图 → 保存。模型输入 `1x3x640x640`，归一化 `data_scale`（scale≈1/255）。

## 常见问题

- **`result.jpg` 掩码缺失**：确认测试图含可识别目标；调低置信度阈值（若脚本支持）。
- **报错找不到模型**：检查 `--model-path`，S600 模型在 `/opt/hobot/model/s600/basic/`。
- **报错 `No module named 'utils'`**：须在示例目录内运行（依赖上级 `utils`）。

## 相关文档

- [C/C++ 版 YOLO11 分割示例](./01_yolo11_seg.md)
- [目标检测-YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
