---
title: WebSocket YOLOv5x 推理 (Python)
sidebar_position: 4
description: 通过 WebSocket 推送 YOLOv5x 检测结果供浏览器查看
---

# WebSocket YOLOv5x 推理 (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

基于 `hbm_runtime` 的 Ultralytics YOLOv5x 推理示例，把检测结果通过 WebSocket 推给浏览器前端实时查看。无需板端桌面，结果在 PC 浏览器里看，适合无显示的 Server 板。

:::info 说明
本示例需安装 `websockets`/`protobuf` 依赖；推理输入默认走板端相机/视频。本板（headless）未完整实测，命令与参数据板端 README。
:::

<DocScope products="RDK-S100">

示例代码位于板端 `/app/pydev_demo/web_display_camera_sample/` 目录下（S100 路径待 S100 板验证）。

</DocScope>
<DocScope products="RDK-S600">

示例代码位于板端 `/app/pydev_demo/web_display_camera_sample/` 目录下。

</DocScope>

## 前置条件

- 摄像头（USB/MIPI）或视频源作为推理输入。
- 安装依赖：

```bash
pip install websockets==15.0.1 protobuf==3.20.3 --break-system-packages
```

- 预装模型：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`。
- PC 浏览器（接收并显示结果）。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | BPU 量化模型路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` |
| `--label-file` | 类别标签（COCO） | `/app/res/labels/coco_classes.names` |
| `--port` | WebSocket 服务端口（见 README） | 板端 README 默认 |
| `--nms-thres` | NMS 的 IoU 阈值 | `0.45` |
| `--score-thres` | 检测置信度阈值 | `0.25` |

## 使用方法

```bash
cd /app/pydev_demo/web_display_camera_sample
python web_display_camera_yolov5x.py
```

启动后板端起 WebSocket 服务，PC 浏览器打开配套前端页面（见示例目录），实时查看检测画面。

## 常见问题

- **`No module named 'websockets'`**：按"前置条件"装 `websockets`/`protobuf`。
- **浏览器连不上**：确认板端与 PC 同网段、端口开放、前端地址指向板端 IP。
- **无推理画面**：确认摄像头/视频源已接入。

## 相关文档

- [USB Camera YOLOv5x 推理 (Python)](./01_usb_camera_py.md)
- [RTSP 视频拉流及 YOLOv5x 推理 (Python)](./03_decode_rtsp_py.md)
- [目标检测-YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
