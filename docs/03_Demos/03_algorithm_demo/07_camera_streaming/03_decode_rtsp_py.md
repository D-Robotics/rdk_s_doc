---
title: RTSP 视频拉流及 YOLOv5x 推理 (Python)
sidebar_position: 7
description: "用 hbm_runtime Python 接口从 RTSP 流取帧做 YOLOv5x 实时检测"
---

# RTSP 视频拉流及 YOLOv5x 推理 (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何用 `hbm_runtime` 的 Python 接口部署量化后的 Ultralytics YOLOv5x 模型，从 RTSP 视频流取帧做目标检测并显示结果。适用于搭载 BPU 的 RDK 设备，需 RTSP 视频源（摄像头/NVR/本地 RTSP 服务）。C++ 版见 [RTSP 视频拉流及 YOLOv5x 推理](./03_decode_rtsp.md)。

:::tip
示例代码位于板端 `/app/pydev_demo/rtsp_yolov5x_display_sample/`，该代码已在板子上经过实际验证。
:::

## 前置条件

- 可达的 RTSP 流地址（如 `rtsp://<ip>/<stream>`）。
- 桌面/显示环境。
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

板端路径：`/app/pydev_demo/rtsp_yolov5x_display_sample/`

目录结构：

```text
.
├── README.md                 # 使用说明
└── rtsp_yolov5x_display.py   # 主程序
```

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--rtsp-urls` / `-u` | RTSP 视频流地址（多路用分号分隔，如 `rtsp://192.168.1.10/s1;rtsp://192.168.1.11/s2`） | `rtsp://127.0.0.1/assets/1080P_test.h264` |
| `--model-path` | BPU 量化模型路径（.hbm） | 按 soc 自动选择：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`） |
| `--priority` | 推理优先级（0~255，255 最高） | `0` |
| `--bpu-cores` | BPU 核心索引列表（如 `--bpu-cores 0 1`） | `[0]` |
| `--label-file` | 类别标签（COCO） | `/app/res/labels/coco_classes.names` |
| `--nms-thres` | NMS 的 IoU 阈值 | `0.45` |
| `--score-thres` | 检测置信度阈值 | `0.25` |

## 使用方法

使用默认地址前，先起本地 RTSP 推流服务（把 `/app/res/assets/1080P_test.h264` 处理成 RTSP 流）：

```bash
cd /app/res
sudo chmod +x live555MediaServer
sudo ./live555MediaServer &
```

然后运行：

```bash
cd /app/pydev_demo/rtsp_yolov5x_display_sample
python rtsp_yolov5x_display.py
```

指定流地址运行：

```bash
python rtsp_yolov5x_display.py --rtsp-urls rtsp://<流地址>
```

运行后从 RTSP 流取帧 → YOLOv5x 推理 → 显示检测框，按 `Ctrl+C` 退出。

## 运行效果

以下是 RDK S600 上的实测输出（live555 推流 + 默认参数）：

```text
['rtsp://127.0.0.1/assets/1080P_test.h264']
RTSP stream frame_width:1920, frame_height:1080
Decoder(0, 1) return:0
Camera vps return:0
Model already exists: /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm
=== Model Name List ===
['yolov5x_672x672_nv12']
```

**成功标志**：输出 `RTSP stream frame_width:1920, frame_height:1080` 表示已成功打开 RTSP 流，随后加载模型（打印 `Model Name List`），屏幕实时显示带检测框的画面。

## 常见问题

- **拉流失败/超时**：确认 RTSP 地址可达、网络通；用 `ffprobe rtsp://...` 或 VLC 验证流。
- **无画面**：需显示环境。
- **多路流卡顿**：BPU 多路并行有上限，减少路数或调高 `--bpu-cores`。
- **报错找不到模型**：检查 `--model-path` 下 `.hbm` 是否存在。

## 相关文档

- [C++ 版 RTSP 示例](./03_decode_rtsp.md)
- [目标检测-YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
- [WebSocket YOLOv5x 推理 (Python)](./04_websocket_py.md)
- [Python 推理 API](../../../04_Simple_API/02_inference_api/02_python_api.md)
- [DECODER（解码模块）API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md)
