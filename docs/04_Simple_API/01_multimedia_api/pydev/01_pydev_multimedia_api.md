---
sidebar_position: 1
sidebar_products: RDK-S100
title: "多媒体接口说明"
description: "RDK Python pydev 多媒体接口总览（Camera/Encoder/Decoder/Display）"
---

# 多媒体接口说明

RDK OS 预装了 Python 多媒体模块 `libsrcampy`（包名 `hobot_vio`），提供以下对象，用于完成摄像头采集、视频编解码和显示输出：

| 对象 | 功能 | 详见 |
| --- | --- | --- |
| `Camera` | 摄像头采集（MIPI/USB） | [Camera 对象](./02_object_camera) |
| `Encoder` | 视频编码（H.264/H.265） | [Encoder 对象](./03_object_encoder) |
| `Decoder` | 视频解码 | [Decoder 对象](./04_object_decoder) |
| `Display` | 显示输出（HDMI） | [Display 对象](./05_object_display) |

## 基础使用

```python
from hobot_vio import libsrcampy

# 创建对象
camera = libsrcampy.Camera()
encode = libsrcampy.Encode()
decode = libsrcampy.Decode()
display = libsrcampy.Display()

# 典型 pipeline：采集 → 显示
while True:
    frame = camera.get_frame()
    display.show(frame)
```

## 典型链路

| 链路 | 对象组合 | 对应 C 示例 |
| --- | --- | --- |
| 采集→显示 | Camera → Display | [采集→显示](/Demos/multimedia_demo/cdev/vio2display) |
| 采集→编码 | Camera → Encoder | [采集→编码](/Demos/multimedia_demo/cdev/vio2encoder) |
| 解码→显示 | Decoder → Display | [解码→显示](/Demos/multimedia_demo/cdev/decode2display) |

## 相关文档

- [Camera 对象](./02_object_camera)
- [Encoder 对象](./03_object_encoder)
- [Decoder 对象](./04_object_decoder)
- [Display 对象](./05_object_display)
- [接口使用示例](./06_pydev_api_demo)
- [Python 多媒体示例](/Demos/multimedia_demo/pydev/pydev_multimedia)