---
title: 目标检测-Ultralytics YOLO11 (Python)
sidebar_position: 4
description: "用 hbm_runtime Python 接口部署 YOLO11 做目标检测的预装示例"
---

# 目标检测-Ultralytics YOLO11 (Python)

本示例演示如何用 `hbm_runtime` 的 Python 接口在 BPU 上部署 Ultralytics YOLO11 模型，对一张图片做目标检测（前处理 + 推理 + 解码 + NMS），并把检测结果保存成图片。YOLO11 是 Ultralytics 较新一代检测模型，本示例使用 `yolo11n`（nano）版本。

示例代码位于板端 `/app/pydev_demo/detection_sample/ultralytics_yolo11/` 目录下。

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)）。
- 预装模型已就位：
  - S100：`/opt/hobot/model/s100/basic/yolo11n_detect_nashe_640x640_nv12.hbm`
  - S600：`/opt/hobot/model/s600/basic/yolo11n_detect_nashp_640x640_nv12.hbm`
- Python 环境与 `hbm_runtime` 已随镜像预装。

## 代码位置

示例代码位于板端 `/app/pydev_demo/detection_sample/ultralytics_yolo11/` 目录，结构如下：

```text
/app/pydev_demo/detection_sample/ultralytics_yolo11/
├── README.md
└── ultralytics_yolo11.py
```

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | 模型文件路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolo11n_detect_nashp_640x640_nv12.hbm`；S100: `/opt/hobot/model/s100/basic/yolo11n_detect_nashe_640x640_nv12.hbm` |
| `--test-img` | 测试图片路径 | `/app/res/assets/kite.jpg` |
| `--label-file` | 类别标签（COCO 80 类） | `/app/res/labels/coco_classes.names` |
| `--img-save-path` | 检测结果图保存路径 | `result.jpg` |
| `--nms-thres` | NMS 的 IoU 阈值 | `0.45` |
| `--score-thres` | 置信度过滤阈值 | `0.25` |

## 使用方法

```bash
cd /app/pydev_demo/detection_sample/ultralytics_yolo11
python ultralytics_yolo11.py
```

运行成功后，检测框绘制在原图上并保存为 `result.jpg`。

**注意事项**：

- 须先 `cd` 进示例目录再运行：脚本依赖上级目录的公共 `utils` 模块，在其他目录运行会报 `No module named 'utils'`。
- 检测结果图 `result.jpg` 保存在当前工作目录（即示例目录），在其他目录运行会找不到结果图。
- 模型须位于默认路径（S600 为 `/opt/hobot/model/s600/basic/yolo11n_detect_nashp_640x640_nv12.hbm`，S100 为 `/opt/hobot/model/s100/basic/yolo11n_detect_nashe_640x640_nv12.hbm`），缺失时 `--model-path` 需显式指定。

## 运行效果

以下是 RDK S600 上的实测输出（节选，测试图 `kite.jpg`）：

```text
Model Description:
 - yolo11n_detect_nashp_640x640_nv12_beta: {"MARCH": "nash-p",
   "INPUT_SHAPE": "1x3x640x640", "INPUT_TYPE_RT": "nv12",
   "NORM_TYPE": "data_scale", "SCALE_VALUE": "[0.003921568627451]"}

=== Scheduling Parameters ===
  priority    : 0
  bpu_cores   : [0]

[Saved] Result saved to: result.jpg
```

**成功标志**：末尾出现 `[Saved] Result saved to: result.jpg`。打开 `result.jpg` 可见检测框（如 `kite.jpg` 中的人与风筝）。

## 软件说明

数据流：读图 → resize 到 640×640 → 转 NV12 → BPU 推理 → 解码检测头 → 置信度过滤（score≥0.25）→ NMS（IoU 0.45）→ 绘制框与类别 → 保存。模型输入 `1x3x640x640`，归一化 `data_scale`（scale≈1/255）。

## 常见问题

- **`result.jpg` 看不到框**：确认测试图含可识别目标；调低 `--score-thres`（如 0.1）。
- **报错找不到模型**：检查 `--model-path`，S600 模型在 `/opt/hobot/model/s600/basic/`。
- **报错 `No module named 'utils'`**：须在示例目录内运行（依赖上级 `utils`）。

## 相关文档

- [C/C++ 版 YOLO11 检测示例](./02_yolo11.md)
- [目标检测-YOLOv5x (Python)](./01_yolov5x_py.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
- [Python 推理 API](../../../04_Simple_API/02_inference_api/02_python_api.md)
