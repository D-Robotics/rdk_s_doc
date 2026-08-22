---
title: "Python 多媒体示例"
sidebar_position: 1
description: "RDK S100/S600 Python 多媒体采集/显示/编解码示例"
---

# Python 多媒体示例

本节介绍使用 Python 接口进行多媒体采集、显示和编解码的示例。Python 接口为 `libsrcampy`（包名 `hobot_vio`），提供 `Camera` / `Encoder` / `Decoder` / `Display` 等对象，与 C 语言 cdev 示例对应。

:::tip
示例源码预置在板端 `/app/pydev_demo/` 目录，Python 脚本无需编译，直接运行。
:::

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 环境准备

- 开发板已烧录 RDK OS 并启动（见 [开始使用 RDK](../../../01_Quick_start/02_getting_started.md)）
- MIPI 摄像头或 USB 摄像头已连接（取决于示例）
- HDMI 显示器已连接（显示类示例）
- Python 依赖已安装：

<DocScope products="RDK S600">

```bash
pip install -r /app/pydev_demo/requirements.txt --break-system-packages
```

</DocScope>

<DocScope products="RDK S100">

```bash
pip install -r /app/pydev_demo/requirements.txt
```

</DocScope>

## 代码位置

板端路径：`/app/pydev_demo/`

```
pydev_demo/
├── mipi_camera_sample/           # MIPI 摄像头采集/缩放/裁剪/推流
│   ├── 02_mipi_camera_dump.py    #   采集并保存 YUV
│   ├── 03_mipi_camera_scale.py   #   VPS 缩放
│   ├── 04_mipi_camera_crop_scale.py # VPS 裁剪 + 缩放
│   ├── 05_mipi_camera_streamer.py   # 采集 → HDMI 显示
│   └── 01_mipi_camera_yolov5x.py    # 目标检测（见算法示例）
├── usb_camera_sample/            # USB 摄像头 + 目标检测
├── rtsp_yolov5x_display_sample/  # RTSP 拉流 + 目标检测 + 显示
├── web_display_camera_sample/    # Web 显示 + 目标检测
└── requirements.txt
```

> 目标检测类示例（`01_mipi_camera_yolov5x.py`、`usb_camera_sample` 等）见 [算法示例](../../03_algorithm_demo/01_summary.md)。本节聚焦多媒体采集 / 显示 / 编解码。

## 使用方法

Python 示例无需编译，直接运行：

```bash
# 采集 → HDMI 显示（连通性测试，需桌面环境）
cd /app/pydev_demo/mipi_camera_sample
python3 05_mipi_camera_streamer.py -w 1920 -h 1080

# 采集并保存 YUV
python3 02_mipi_camera_dump.py -f 30 -c 10 -w 1920 -h 1080

# VPS 缩放（输入为 NV12 格式 YUV 文件）
python3 03_mipi_camera_scale.py -i input.yuv -o output.yuv \
  -w 640 -h 360 --iwidth 1920 --iheight 1080

# VPS 裁剪 + 缩放
python3 04_mipi_camera_crop_scale.py -i input.yuv -o output.yuv \
  -w 640 -h 480 --iwidth 1920 --iheight 1080 \
  -x 304 -y 304 --crop_w 896 --crop_h 592
```

## 代码解读

Python 示例使用 `hobot_vio` 的对象接口，核心流程：

```python
from hobot_vio import libsrcampy

# 创建对象
cam = libsrcampy.Camera()      # Camera 对象：采集 + VPS
disp = libsrcampy.Display()    # Display 对象：HDMI 输出

# 采集 → 显示
cam.open_cam(0, -1, 30, 1920, 1080)  # 打开 MIPI 摄像头
disp.display(0, 1920, 1080)          # 打开显示通道
libsrcampy.bind(cam, disp)           # 绑定采集到显示
```

- `Camera` 对象 — 封装 VIO 采集与 VPS，详见 [Camera 对象](../../../04_Simple_API/01_multimedia_api/pydev/02_object_camera.md)
- `Display` 对象 — 封装显示输出，详见 [Display 对象](../../../04_Simple_API/01_multimedia_api/pydev/05_object_display.md)
- `Encoder` / `Decoder` 对象 — 封装编解码，详见 [Encoder 对象](../../../04_Simple_API/01_multimedia_api/pydev/03_object_encoder.md) / [Decoder 对象](../../../04_Simple_API/01_multimedia_api/pydev/04_object_decoder.md)

## 运行效果

- `05_mipi_camera_streamer.py` — HDMI 显示器实时显示摄像头画面
- `02_mipi_camera_dump.py` — 脚本目录生成 `output0.yuv`、`output1.yuv`… 采集文件
- `03_mipi_camera_scale.py` / `04_mipi_camera_crop_scale.py` — 生成缩放 / 裁剪后的 YUV 文件

## 常见问题

### 提示 `Failed to open camera`

**原因**：未连接摄像头，或同时接入了多个 MIPI 摄像头。

**解决**：MIPI 摄像头接口使用自动检测模式，同一时间只能接入一个 MIPI 摄像头，接入多个会报错。

### 显示类示例无画面

**原因**：显示类脚本需运行在桌面环境。

**解决**：使用桌面版镜像，并在桌面会话中运行。

## 相关文档

- [C 语言示例](../01_cdev/01_vio_capture.md)
- [多媒体接口说明](../../../04_Simple_API/01_multimedia_api/pydev/01_pydev_multimedia_api.md)
- [Camera 对象](../../../04_Simple_API/01_multimedia_api/pydev/02_object_camera.md)
- [Display 对象](../../../04_Simple_API/01_multimedia_api/pydev/05_object_display.md)
- [算法示例](../../03_algorithm_demo/01_summary.md)
