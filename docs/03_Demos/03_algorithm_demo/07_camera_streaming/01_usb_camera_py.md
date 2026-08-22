---
title: USB Camera YOLOv5x 推理 (Python)
sidebar_position: 5
description: "用 hbm_runtime Python 接口做 USB 摄像头实时 YOLOv5x 检测的预装示例"
---

# USB Camera YOLOv5x 推理 (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何用 `hbm_runtime` 的 Python 接口部署量化后的 Ultralytics YOLOv5x 模型，通过 USB 摄像头实时读取画面做目标检测，并全屏可视化结果。适用于搭载 BPU 的 RDK 设备，需桌面环境与 USB 摄像头。C++ 版见 [USB Camera YOLOv5x 推理](./01_usb_camera.md)。

:::tip
示例代码位于板端 `/app/pydev_demo/usb_camera_sample/`，该代码已在板子上经过实际验证。
:::

## 前置条件

- 桌面版镜像（Desktop），或能进入桌面/console 显示。
- USB 摄像头已连接并被识别（`ls /dev/video*` 有设备）。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`）。

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

板端路径：`/app/pydev_demo/usb_camera_sample/`

目录结构：

```text
.
├── usb_camera_yolov5x.py   # 主程序
└── README.md               # 使用说明
```

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | BPU 量化模型路径（.hbm） | 按 soc 自动选择：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`） |
| `--priority` | 推理优先级（0~255，255 最高） | `0` |
| `--bpu-cores` | BPU 核心索引列表（如 `--bpu-cores 0 1`） | `[0]` |
| `--label-file` | 类别标签（COCO） | `/app/res/labels/coco_classes.names` |
| `--resize-type` | 缩放方式（0 直接缩放，1 letterbox） | `1` |
| `--classes-num` | 检测类别数 | `80` |
| `--nms-thres` | NMS 的 IoU 阈值 | `0.45` |
| `--score-thres` | 检测置信度阈值 | `0.25` |

## 使用方法

```bash
cd /app/pydev_demo/usb_camera_sample
python usb_camera_yolov5x.py
```

运行后从 USB 摄像头实时取帧 → YOLOv5x 推理 → 全屏显示检测框，将鼠标放入显示框内按 `q` 键退出。

## 运行效果

本板（无 USB 摄像头）实测输出如下：

```text
No USB camera found.
```

接入 USB 摄像头后的成功标志（据源码 `usb_camera_yolov5x.py`）：

- 输出 `Opening video device: /dev/videoN` 与 `Open USB camera successfully`；
- 全屏窗口实时显示带检测框的画面。

<!-- TODO: 待接入摄像头实测成功 log -->

## 常见问题

- **`No USB camera found.`**：USB 摄像头未识别，检查 USB 连接、`lsusb` 是否列出、是否为 UVC 摄像头。
- **无画面/黑屏**：需桌面环境（Desktop 镜像或已配置显示），Server 版无法全屏显示。
- **帧率低**：调高 `--bpu-cores` 用多核，或降低输入分辨率。
- **报错 `No module named 'utils'`**：未在示例目录下运行，须 `cd` 进 `usb_camera_sample/` 再跑（依赖上级 `utils`）。

## 相关文档

- [C++ 版 USB Camera 示例](./01_usb_camera.md)
- [目标检测-YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
