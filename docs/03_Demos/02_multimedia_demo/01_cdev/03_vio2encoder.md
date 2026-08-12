---
title: "3.2.1.3 采集→编码"
sidebar_position: 3
description: RDK S100/S600 摄像头采集→VIO→编码保存示例
---

# 3.2.1.3 采集→编码

本示例演示通过 VIO 采集摄像头画面并实时编码（H.264/H.265）保存到文件，链路：Camera → VIO → Encoder → File。

## 环境准备

- 开发板已烧录 RDK OS 并启动
- MIPI 摄像头已连接
- 有可写存储空间（用于保存编码输出文件）

## 代码位置

板端路径：`/app/cdev_demo/vio2encoder/`

```
vio2encoder/
├── Makefile
└── vio2encoder.c
```

## 编译与运行

```bash
cd /app/cdev_demo/vio2encoder
make
./vio2encoder -o output.h264 -W 1920 -H 1080
```

参数说明：

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `-o` | 输出文件路径 | output.h264 |
| `-W` | 输出宽度 | 1920 |
| `-H` | 输出高度 | 1080 |

按 `Ctrl+C` 停止编码。输出文件可用 `ffprobe` 或 VLC 播放验证。

## 代码解读

示例使用简易 API（`sp_vio.h`/`sp_codec.h`/`sp_sys.h`），核心流程：

1. `sp_vio_open` — 打开 VIO 采集通道
2. `sp_codec_create_encoder` — 创建编码器（H.264/H.265）
3. 循环 `sp_vio_get_frame` → `sp_codec_send_frame` — 采集帧送编码器
4. `sp_codec_get_stream` — 获取编码码流写入文件
5. `sp_vio_close`/`sp_codec_close` — 释放资源

简易 API 的完整接口说明见 [4.1 多媒体 API](/Simple_API/multimedia_api/cdev/vio_api)。

## 效果

运行结束后，生成 H.264 编码文件（如 `output.h264`），可用 `ffprobe output.h264` 查看编码信息，或用 VLC 播放。

## 相关文档

- [3.2.1.1 视频采集](./01_vio_capture.md)
- [4.1 多媒体 API](/Simple_API/multimedia_api/cdev/vio_api)
- [3.4.2 C/C++ demo 编程指南](/Demos/demo_support/c_cpp_build)
