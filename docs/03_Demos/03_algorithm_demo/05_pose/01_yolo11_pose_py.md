---
title: 姿态估计-Ultralytics YOLO11 (Python)
sidebar_position: 2
description: "用 hbm_runtime Python 接口部署 YOLO11 做人体姿态估计的预装示例"
---

# 姿态估计-Ultralytics YOLO11 (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何用 `hbm_runtime` 的 Python 接口在 BPU 上部署 Ultralytics YOLO11 姿态估计模型，对一张图片做人体检测 + 关键点估计，并把骨架绘制到图上保存。本示例使用 `yolo11n-pose`（nano）版本。

<DocScope products="RDK-S100">

示例代码位于板端 `/app/pydev_demo/04_pose_sample/01_ultralytics_yolo11_pose/` 目录下。

</DocScope>
<DocScope products="RDK-S600">

示例代码位于板端 `/app/pydev_demo/pose_sample/ultralytics_yolo11_pose/` 目录下。

</DocScope>

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm`。
- Python 环境与 `hbm_runtime` 已随镜像预装。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | 模型文件路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm` |
| `--test-img` | 测试图片路径 | `/app/res/assets/bus.jpg` |
| `--label-file` | 类别标签（COCO，人） | `/app/res/labels/coco_classes.names` |
| `--img-save-path` | 结果图保存路径 | `result.jpg` |
| `--nms-thres` | NMS 的 IoU 阈值 | `0.7` |
| `--score-thres` | 置信度阈值 | `0.25` |

## 使用方法

<DocScope products="RDK-S600">

```bash
cd /app/pydev_demo/pose_sample/ultralytics_yolo11_pose
python ultralytics_yolo11_pose.py
```

</DocScope>

运行成功后，人体边界框与关键点骨架会绘制在原图上并保存为 `result.jpg`。

## 运行效果

以下是 RDK S600 上的实测输出（测试图 `bus.jpg`）：

```text
Model Description:
 - yolo11n_pose_nashp_640x640_nv12_debug: {"MARCH": "nash-p",
   "INPUT_SHAPE": "1x3x640x640", "INPUT_TYPE_RT": "nv12",
   "NORM_TYPE": "data_scale", "SCALE_VALUE": "[0.003921568627451]", ...}

=== Scheduling Parameters ===
  priority    : 0
  bpu_cores   : [0]

[Saved] Result saved to: result.jpg
```

**成功标志**：末尾出现 `[Saved] Result saved to: result.jpg`。打开 `result.jpg` 可见人体框与关键点骨架（`bus.jpg` 中的人物）。

## 软件说明

数据流：读图 → resize 到 640×640 → 转 NV12 → BPU 推理 → 解码检测头 + 关键点头 → 置信度过滤（score≥0.25）→ NMS（IoU 0.7）→ 绘制人体框与关键点骨架 → 保存。模型输入 `1x3x640x640`，归一化 `data_scale`（scale≈1/255）。

## 常见问题

- **`result.jpg` 看不到骨架**：确认图中有清晰可识别人体；调低 `--score-thres`。
- **报错找不到模型**：检查 `--model-path`，S600 模型在 `/opt/hobot/model/s600/basic/`。
- **报错 `No module named 'utils'`**：须在示例目录内运行（依赖上级 `utils`）。

## 相关文档

- [C/C++ 版 YOLO11 姿态示例](./01_yolo11_pose.md)
- [目标检测-YOLO11 (Python)](../03_detection/02_yolo11_py.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
