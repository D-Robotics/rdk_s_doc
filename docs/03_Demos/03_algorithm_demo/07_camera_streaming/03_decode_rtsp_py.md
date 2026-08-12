---
title: RTSP 视频拉流及 YOLOv5x 推理 (Python)
sidebar_position: 7
description: "从 RTSP 流取帧做 YOLOv5x 实时检测推理"
---

# RTSP 视频拉流及 YOLOv5x 推理 (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

基于 `hbm_runtime` 的 Ultralytics YOLOv5x 实时推理示例，从 RTSP 视频流取帧做目标检测，结果可视化。适用于搭载 BPU 的 RDK 设备，需 RTSP 视频源（摄像头/NVR/本地 RTSP 服务）。

:::info 说明
本示例需 RTSP 视频源与显示，本板未实测。命令与参数据板端 README，运行前请确认有可达的 RTSP 流地址。
:::

<DocScope products="RDK-S100">

示例代码位于板端 `/app/pydev_demo/rtsp_yolov5x_display_sample/` 目录下（S100 路径待 S100 板验证）。

</DocScope>
<DocScope products="RDK-S600">

示例代码位于板端 `/app/pydev_demo/rtsp_yolov5x_display_sample/` 目录下。

</DocScope>

## 前置条件

- 可达的 RTSP 流地址（如 `rtsp://<ip>/<stream>`）。
- 桌面/显示环境。
- 预装模型：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--rtsp-urls` / `-u` | RTSP 视频流地址（多路用分号分隔） | `rtsp://127.0.0.1/1080P_test.h264` |
| `--model-path` | BPU 量化模型路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` |
| `--label-file` | 类别标签（COCO） | `/app/res/labels/coco_classes.names` |
| `--nms-thres` | NMS 的 IoU 阈值 | `0.45` |
| `--score-thres` | 检测置信度阈值 | `0.25` |

## 使用方法

```bash
cd /app/pydev_demo/rtsp_yolov5x_display_sample
python rtsp_yolov5x.py --rtsp-urls rtsp://<流地址>
```

默认地址 `rtsp://127.0.0.1/1080P_test.h264` 需本板先起 RTSP 服务（如用 `mediamtx`/`live555` 推 `/app/res/assets/1080P_test.h264`）。

## 常见问题

- **拉流失败/超时**：确认 RTSP 地址可达、网络通；用 `ffprobe rtsp://...` 或 VLC 验证流。
- **无画面**：需显示环境。
- **多路流卡顿**：BPU 多路并行有上限，减少路数或调高 `--bpu-cores`。

## 相关文档

- [USB Camera YOLOv5x 推理 (Python)](./01_usb_camera_py.md)
- [目标检测-YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
- [WebSocket YOLOv5x 推理 (Python)](./04_websocket_py.md)
