---
title: "RTSP→显示"
sidebar_position: 6
description: "RDK S100/S600 RTSP 网络拉流→解码→Display 实时显示示例"
---

# RTSP→显示

本示例演示从 RTSP 网络地址拉取视频码流，解码并实时输出到 HDMI 显示器，链路：RTSP → Decoder → Display。

## 环境准备

- 开发板已烧录 RDK OS 并启动
- HDMI 显示器已连接
- 开发板与 RTSP 源在同一网络（可 ping 通）
- RTSP 源地址（如 `rtsp://192.168.1.100:8554/test`）

## 代码位置

板端路径：`/app/cdev_demo/rtsp2display/`

```
rtsp2display/
├── Makefile
└── rtsp2display.c
```

## 编译与运行

```bash
cd /app/cdev_demo/rtsp2display
make
./rtsp2display -u rtsp://192.168.1.100:8554/test
```

参数说明：

| 参数 | 说明 |
| --- | --- |
| `-u` | RTSP 拉流地址 |

程序启动后，RTSP 码流解码画面将实时显示在 HDMI 显示器上。按 `Ctrl+C` 退出。

## 代码解读

示例使用简易 API（`sp_codec.h`/`sp_display.h`/`sp_sys.h`），核心流程：

1. `sp_sys_init` — 初始化系统
2. 建立 RTSP 连接，拉取码流数据
3. `sp_codec_create_decoder` — 创建解码器
4. `sp_display_open` — 打开显示通道
5. 循环：收码流 → `sp_codec_send_stream`（送解码）→ `sp_codec_get_frame`（取帧）→ `sp_display_send_frame`（送显）
6. `sp_codec_close`/`sp_display_close` — 释放资源

## 效果

HDMI 显示器上实时播放 RTSP 网络码流画面，延迟取决于网络与码流参数。

## 相关文档

- [解码→显示](./05_decode2display.md)（本地文件版）
- [多媒体 API](/Simple_API/multimedia_api/cdev/decoder_api)
- [C/C++ demo 编程指南](/Demos/demo_support/c_cpp_build)
