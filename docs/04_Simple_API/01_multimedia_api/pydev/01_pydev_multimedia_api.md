---
sidebar_position: 1
title: "多媒体接口说明"
description: "RDK Python pydev 多媒体接口总览（Camera/Encoder/Decoder/Display）"
---

# 多媒体接口说明

RDK OS 预装了 Python 多媒体模块 `libsrcampy`（包名 `hobot_vio`），提供以下对象，用于完成摄像头采集、视频编解码和显示输出：

- **接口层级**：封装层简易接口（模式 1）。

| 对象 | 功能 | 详见 |
| --- | --- | --- |
| `Camera` | 摄像头采集（MIPI/USB） | [Camera 对象](./02_object_camera.md) |
| `Encoder` | 视频编码（H.264/H.265） | [Encoder 对象](./03_object_encoder.md) |
| `Decoder` | 视频解码 | [Decoder 对象](./04_object_decoder.md) |
| `Display` | 显示输出（HDMI） | [Display 对象](./05_object_display.md) |

## 基础使用

```python
from hobot_vio import libsrcampy

# 创建对象
camera = libsrcampy.Camera()
encode = libsrcampy.Encoder()
decode = libsrcampy.Decoder()
display = libsrcampy.Display()

# 典型 pipeline：采集 → 显示
while True:
    frame = camera.get_img()
    display.set_img(frame)
```

## 注意事项

- 各对象的方法调用存在前置依赖：`get_img`/`set_img` 等数据处理方法需在对应对象使能（`open_cam`/`open_vps`/`encode`/`decode`/`display`）之后调用，具体见各对象文档。
- 退出程序前需调用各对象的关闭接口（`close_cam`/`close`）释放资源，避免资源泄漏。
- 使用 `libsrcampy.bind` 绑定模块后数据自动流转，退出前需调用 `libsrcampy.unbind` 解绑并关闭各对象。

## 典型链路

| 链路 | 对象组合 | 对应 C 示例 |
| --- | --- | --- |
| 采集→显示 | Camera → Display | [采集→显示](/Demos/multimedia_demo/cdev/vio2display) |
| 采集→编码 | Camera → Encoder | [采集→编码](/Demos/multimedia_demo/cdev/vio2encoder) |
| 解码→显示 | Decoder → Display | [解码→显示](/Demos/multimedia_demo/cdev/decode2display) |

## 常见问题

### 调用 get_img/set_img 返回 None 或报错

**现象**：调用 `get_img`/`set_img` 等数据处理方法返回 `None` 或报错。

**原因**：这些方法需在对应对象使能（`open_cam`/`open_vps`/`encode`/`decode`/`display`）之后调用。

**解决**：先调用对应对象的使能接口，再调用数据处理方法。

### 程序退出后资源未释放

**现象**：程序退出后资源未被释放或下次运行异常。

**原因**：退出前未调用各对象的关闭接口，或模块绑定后未解绑。

**解决**：退出前调用 `close_cam`/`close` 释放资源；使用 `libsrcampy.bind` 绑定的模块需先调用 `libsrcampy.unbind` 解绑。

## 相关文档

- [Camera 对象](./02_object_camera.md)
- [Encoder 对象](./03_object_encoder.md)
- [Decoder 对象](./04_object_decoder.md)
- [Display 对象](./05_object_display.md)
- [接口使用示例](./06_pydev_api_demo.md)
- [Python 多媒体示例](/Demos/multimedia_demo/pydev/pydev_multimedia)