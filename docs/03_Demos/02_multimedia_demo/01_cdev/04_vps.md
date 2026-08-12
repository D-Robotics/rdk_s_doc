---
title: "3.2.1.4 视频处理"
sidebar_position: 4
description: "RDK S100/S600 VPS 视频处理示例（文件/解码输入→处理→输出）"
---

# 3.2.1.4 视频处理

本示例演示通过 VPS（Video Process Subsystem）对视频进行缩放、裁剪等处理。支持两种输入模式：文件输入和码流解码输入。

## 环境准备

- 开发板已烧录 RDK OS 并启动
- 示例自带测试数据（`input_1080p.h264`、`input_1080p.yuv`）

## 代码位置

板端路径：`/app/cdev_demo/vps/`

```
vps/
├── Makefile
├── vps.c
├── input_1080p.h264    # 测试 H.264 码流
└── input_1080p.yuv     # 测试 YUV 数据
```

## 编译与运行

```bash
cd /app/cdev_demo/vps
make
```

**模式 1：文件输入**（YUV 文件 → VPS 处理 → 输出 YUV 文件）

```bash
./vps -m 0 -i input_1080p.yuv -o output.yuv -w 1920 -h 1080 -W 1280 -H 720
```

**模式 2：码流解码输入**（H.264 文件 → 解码 → VPS 处理 → 输出 YUV 文件）

```bash
./vps -m 1 -i input_1080p.h264 -o output.yuv -w 1920 -h 1080 -W 1280 -H 720
```

参数说明：

| 参数 | 说明 |
| --- | --- |
| `-m` | 模式：0=文件输入，1=解码输入 |
| `-i` | 输入文件路径 |
| `-o` | 输出文件路径 |
| `-w`/`-h` | 输入宽/高 |
| `-W`/`-H` | 输出宽/高（缩放目标） |

## 代码解读

示例使用简易 API（`sp_vio.h`/`sp_codec.h`/`sp_sys.h`），核心流程：

1. `sp_sys_init` — 初始化系统
2. 根据模式：`sp_vio_feed_file`（文件输入）或 `sp_codec_create_decoder` + `sp_codec_send_stream`（解码输入）
3. `sp_vio_get_frame` — 获取 VPS 处理后的帧（缩放/裁剪到目标尺寸）
4. 写入输出文件
5. 释放资源

## 效果

运行后生成处理后的 YUV 文件（如 `output.yuv`），分辨率从 1920×1080 缩放到 1280×720（示例参数）。可用 `ffplay -f rawvideo -pixel_format yuv420p -video_size 1280x720 output.yuv` 预览。

## 相关文档

- [3.2.1.1 视频采集](./01_vio_capture.md)
- [4.1 多媒体 API](/Simple_API/multimedia_api/cdev/vio_api)
- [3.4.2 C/C++ demo 编程指南](/Demos/demo_support/c_cpp_build)
