---
title: WebSocket YOLOv5x 推理 (Python)
sidebar_position: 8
description: "通过 WebSocket 推送 YOLOv5x 检测结果供浏览器查看的预装示例"
---

# WebSocket YOLOv5x 推理 (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何用 `hbm_runtime` 的 Python 接口部署量化后的 Ultralytics YOLOv5x 模型，把 MIPI 摄像头的检测结果（JPEG 图像 + 检测框）通过 WebSocket 推给浏览器前端实时查看。无需板端桌面，结果在 PC 浏览器里看，适合无显示的 Server 板。

:::tip
示例代码位于板端 `/app/pydev_demo/web_display_camera_sample/`，该代码已在板子上经过实际验证。
:::

## 前置条件

- MIPI 摄像头模块已连接到板载 MIPI 接口，并被识别。
- PC 浏览器（与板端同网段，接收并显示结果）。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`）。

## 环境依赖

依赖 `pydev_demo` 公共工具库（`utils`），并需安装 WebSocket 相关包：

<DocScope products="RDK S100">

```bash
cd /app/pydev_demo && pip install -r requirements.txt
pip install websockets==15.0.1 protobuf==3.20.3
```

</DocScope>
<DocScope products="RDK S600">

```bash
cd /app/pydev_demo && pip install -r requirements.txt --break-system-packages
pip install websockets==15.0.1 protobuf==3.20.3 --break-system-packages
```

</DocScope>

## 代码位置

板端路径：`/app/pydev_demo/web_display_camera_sample/`

目录结构：

```text
.
├── mipi_camera_web_yolov5x.py   # 主程序：MIPI 取流 + 推理 + WebSocket 推送
├── x3_pb2.py                    # protobuf 生成代码（检测结果序列化）
├── start_nginx.sh               # 前端 nginx 启动脚本
├── webservice/                  # nginx + 前端页面（html/modules/protos 等）
└── README.md                    # 使用说明
```

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | BPU 量化模型路径（.hbm） | 按 soc 自动选择：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`） |
| `--priority` | 推理优先级（0~255，255 最高） | `0` |
| `--bpu-cores` | BPU 核心索引列表（如 `--bpu-cores 0 1`） | `[0]` |
| `--label-file` | 类别标签（COCO） | `/app/res/labels/coco_classes.names` |
| `--nms-thres` | NMS 的 IoU 阈值 | `0.45` |
| `--score-thres` | 检测置信度阈值 | `0.25` |

> WebSocket 服务端口固定为 `8080`（源码内硬编码），不通过命令行参数配置。

## 使用方法

1. 启动前端 nginx（在 `webservice/` 目录下）：

```bash
cd /app/pydev_demo/web_display_camera_sample/webservice
sudo ./sbin/nginx -p .
```

2. 回到示例目录，启动推理 + WebSocket 服务：

```bash
cd /app/pydev_demo/web_display_camera_sample
python mipi_camera_web_yolov5x.py
```

3. PC 浏览器访问 `http://<板端IP>`，实时查看检测画面。按 `Ctrl+C` 退出。

## 运行效果

以下是 RDK S600 上的实测输出（本板未接 MIPI 摄像头，仅验证到服务启动）：

```text
No camera sensor found, please check whether the camera connection or video_idx is correct.
[OpenCamera] CamInitParam failed error(-1)
Model already exists: /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm
=== Model Name List ===
['yolov5x_672x672_nv12']
WebSocket server started on ws://0.0.0.0:8080
```

**成功标志**：末尾输出 `WebSocket server started on ws://0.0.0.0:8080`，表示 WebSocket 服务已就绪。接入 MIPI 摄像头后，浏览器打开 `http://<板端IP>` 可看到实时检测画面；若未接摄像头，仅输出 `No camera sensor found` 且浏览器无画面。

<!-- TODO: 待接入摄像头实测完整推理画面 log -->

## 常见问题

- **`No module named 'websockets'`**：按"环境依赖"安装 `websockets`/`protobuf`。
- **浏览器连不上**：确认板端与 PC 同网段、`8080`/`80` 端口开放、前端地址指向板端 IP；确认 nginx 已在 `webservice/` 目录启动。
- **无推理画面**：确认 MIPI 摄像头已接入并被识别（`dmesg | grep -i sensor`）。

## 相关文档

- [视频解码及 YOLOv5x 推理 (C/C++)](./04_decode.md)
- [目标检测-YOLOv5x (Python)](../03_detection/01_yolov5x_py.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
- [Python 推理 API](../../../04_Simple_API/02_inference_api/02_python_api.md)
- [Camera 对象](../../../04_Simple_API/01_multimedia_api/pydev/02_object_camera.md)
