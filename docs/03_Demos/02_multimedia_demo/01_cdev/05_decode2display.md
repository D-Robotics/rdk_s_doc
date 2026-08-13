---
title: "解码→显示"
sidebar_position: 5
description: "RDK S100/S600 视频码流解码→Display 实时显示示例"
---

# 解码→显示

本示例演示将视频码流（H.264/H.265）解码并实时输出到 HDMI 显示器，链路：File → Decoder → Display。

## 环境准备

- 开发板已烧录 RDK OS 并启动
- HDMI 显示器已连接
- 有 H.264/H.265 码流文件（可使用 [采集→编码](./03_vio2encoder.md) 生成的输出）

## 代码位置

板端路径：`/app/cdev_demo/decode2display/`

```
decode2display/
├── Makefile
└── decoder2display.c
```

## 编译与运行

```bash
cd /app/cdev_demo/decode2display
make
./decoder2display -i input.h264
```

参数说明：

| 参数 | 说明 |
| --- | --- |
| `-i` | 输入码流文件路径（H.264/H.265） |

程序启动后，码流解码画面将实时显示在 HDMI 显示器上。按 `Ctrl+C` 退出。

## 代码解读

示例使用简易 API（`sp_codec.h`/`sp_display.h`/`sp_sys.h`），核心流程：

1. `sp_codec_create_decoder` — 创建解码器
2. `sp_display_open` — 打开显示通道
3. 循环：读文件 → `sp_codec_send_stream`（送解码）→ `sp_codec_get_frame`（取解码帧）→ `sp_display_send_frame`（送显）
4. `sp_codec_close`/`sp_display_close` — 释放资源

## 效果

HDMI 显示器上播放输入码流文件的解码画面。

## 相关文档

- [采集→编码](./03_vio2encoder.md)（生成码流文件）
- [RTSP→显示](./06_rtsp2display.md)
- [多媒体 API](/Simple_API/multimedia_api/cdev/decoder_api)
- [C/C++ demo 编程指南](/Demos/demo_support/c_cpp_build)
