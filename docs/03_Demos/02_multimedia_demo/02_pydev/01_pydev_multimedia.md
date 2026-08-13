---
title: "Python 多媒体示例"
sidebar_position: 1
description: "RDK S100/S600 Python 多媒体采集/显示/编解码示例"
---

# Python 多媒体示例

本节介绍使用 Python pydev 接口进行多媒体采集、显示和编解码的示例。Python 示例使用 [Python 接口](/Simple_API/multimedia_api/pydev/object_camera)（Camera/Encoder/Decoder/Display 对象），与 C 语言 cdev 示例对应。

## 环境准备

- 开发板已烧录 RDK OS 并启动
- MIPI 摄像头或 USB 摄像头已连接（取决于示例）
- HDMI 显示器已连接（显示类示例）
- Python 3 + pydev 依赖已安装：`pip install -r /app/pydev_demo/requirements.txt`

## 代码位置

板端路径：`/app/pydev_demo/`

```
pydev_demo/
├── mipi_camera_sample/       # MIPI 摄像头采集
├── usb_camera_sample/        # USB 摄像头采集
├── web_display_camera_sample # Web 显示摄像头
├── rtsp_yolov5x_display_sample # RTSP 拉流 + 推理 + 显示
├── classification_sample/    # 图像分类（算法示例，见 3.3）
├── detection_sample/         # 目标检测
├── instance_segmentation_sample/ # 实例分割
├── pose_sample/             # 姿态估计
├── speech_sample/            # 语音识别
├── models/                   # 模型文件
├── utils/                    # 公共工具
└── requirements.txt
```

> 算法类示例（classification/detection/segmentation/pose/speech）见 [算法示例](/Demos/algorithm_demo/)。本节聚焦多媒体采集/显示/编解码。

## 编译与运行

Python 示例无需编译，直接运行：

```bash
# MIPI 摄像头采集 + 显示
cd /app/pydev_demo/mipi_camera_sample
python3 main.py

# USB 摄像头采集 + 显示
cd /app/pydev_demo/usb_camera_sample
python3 main.py

# RTSP 拉流 + 显示
cd /app/pydev_demo/rtsp_yolov5x_display_sample
python3 main.py
```

## 代码解读

Python 示例使用 pydev 对象 API，核心流程：

```python
from spdev import Camera, Display, Encoder, Decoder

# 创建对象
cam = Camera(sensor_id=0, width=1920, height=1080)
disp = Display()

# 采集 → 显示
while True:
    frame = cam.get_frame()
    disp.show(frame)
```

- `Camera` 对象 — 封装 VIO 采集，详见 [Camera 对象](/Simple_API/multimedia_api/pydev/object_camera)
- `Display` 对象 — 封装显示输出，详见 [Display 对象](/Simple_API/multimedia_api/pydev/object_display)
- `Encoder`/`Decoder` 对象 — 封装编解码，详见 [4.1.2.3](/Simple_API/multimedia_api/pydev/object_encoder) / [4.1.2.4](/Simple_API/multimedia_api/pydev/object_decoder)

## 效果

- `mipi_camera_sample` / `usb_camera_sample` — HDMI 显示器实时显示摄像头画面
- `rtsp_yolov5x_display_sample` — HDMI 显示 RTSP 拉流画面 + 推理结果叠加

## 相关文档

- [C 语言示例](../01_cdev/01_vio_capture.md)
- [Python 接口](/Simple_API/multimedia_api/pydev/object_camera)
- [算法示例](/Demos/algorithm_demo/summary)
