---
title: MIPI Camera YOLOv5x 推理 (Python)
sidebar_position: 6
description: "用 hbm_runtime Python 接口做 MIPI 摄像头实时 YOLOv5x 检测的预装示例"
---

# MIPI Camera YOLOv5x 推理 (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何用 `hbm_runtime` 的 Python 接口部署量化后的 Ultralytics YOLOv5x 模型，通过 MIPI 摄像头（板载相机接口）实时读取画面做目标检测并可视化。适用于搭载 BPU 的 RDK 设备，需 MIPI 摄像头模块与显示。C++ 版见 [MIPI Camera YOLOv5x 推理](./02_mipi_camera.md)。

:::tip
示例代码位于板端 `/app/pydev_demo/mipi_camera_sample/`，该代码已在板子上经过实际验证。
:::

## 前置条件

- MIPI 摄像头模块已连接到板载 MIPI 接口，并被识别。
- 桌面环境或可显示。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`）。

## 环境依赖

依赖 `pydev_demo` 公共工具库（`utils`）。若提示缺少依赖：

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

板端路径：`/app/pydev_demo/mipi_camera_sample/`

目录结构：

```text
.
├── 01_mipi_camera_yolov5x.py    # 主程序：MIPI 摄像头实时目标检测与显示
├── 02_mipi_camera_dump.py       # 采集图像帧保存为 YUV 文件
├── 03_mipi_camera_scale.py      # 本地 YUV 图像缩放
├── 04_mipi_camera_crop_scale.py # 本地 YUV 图像裁剪缩放
├── 05_mipi_camera_streamer.py   # 摄像头 HDMI 实时回显
└── README.md                    # 使用说明
```

本文以 `01_mipi_camera_yolov5x.py` 为例说明目标检测推理。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | BPU 量化模型路径（.hbm） | 按 soc 自动选择：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`） |
| `--priority` | 推理优先级（0~255，255 最高） | `0` |
| `--bpu-cores` | BPU 核心索引列表（如 `--bpu-cores 0 1`） | `[0]` |
| `--label-file` | 类别标签（COCO） | `/app/res/labels/coco_classes.names` |
| `--nms-thres` | NMS 的 IoU 阈值 | `0.45` |
| `--score-thres` | 检测置信度阈值 | `0.25` |

## 使用方法

```bash
cd /app/pydev_demo/mipi_camera_sample
python 01_mipi_camera_yolov5x.py
```

运行后从 MIPI 摄像头实时取帧 → YOLOv5x 推理 → 显示检测框，按 `Ctrl+C` 退出。

## 运行效果

本板（未接 MIPI 摄像头）实测输出如下：

```text
No camera sensor found, please check whether the camera connection or video_idx is correct.
[OpenCamera] CamInitParam failed error(-1)
```

接入 MIPI 摄像头后的成功标志（据源码 `01_mipi_camera_yolov5x.py`）：初始化摄像头成功后加载模型，屏幕实时显示带检测框的画面。

<!-- TODO: 待接入摄像头实测成功 log -->

## 常见问题

- **`No camera sensor found`**：MIPI 摄像头未识别，`dmesg | grep -i sensor` 查 sensor，确认排线接好、摄像头被识别。
- **无画面显示**：需桌面/显示环境。
- **帧率低**：调高 `--bpu-cores` 或降低分辨率。
- **报错 `No module named 'utils'`**：未在示例目录下运行，须 `cd` 进 `mipi_camera_sample/` 再跑（依赖上级 `utils`）。

## 相关文档

- [C++ 版 MIPI Camera 示例](./02_mipi_camera.md)
- [目标检测-YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
