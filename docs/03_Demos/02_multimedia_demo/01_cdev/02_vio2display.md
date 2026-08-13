---
title: "采集→显示"
sidebar_position: 2
description: "RDK S100/S600 摄像头采集→VIO→Display 实时预览示例"
---

# 采集→显示

本示例演示通过 VIO 采集摄像头画面并实时输出到 HDMI 显示器，是多媒体 pipeline 最基础的链路：Camera → VIO → Display。

## 环境准备

- 开发板已烧录 RDK OS 并启动（见 [开始使用 RDK](/Quick_start/getting_started)）
- MIPI 摄像头已连接（见 [摄像头使用](/Demos/peripheral/camera/mipi_camera)）
- HDMI 显示器已连接

## 代码位置

板端路径：`/app/cdev_demo/vio2display/`

```
vio2display/
├── Makefile
└── vio2display.c
```

## 编译与运行

```bash
cd /app/cdev_demo/vio2display
make
./vio2display
```

程序启动后，摄像头画面将实时显示在 HDMI 显示器上。按 `Ctrl+C` 退出。

## 代码解读

示例使用简易 API（`sp_vio.h`/`sp_display.h`/`sp_sys.h`），核心流程：

1. `sp_vio_open` — 打开 VIO，初始化摄像头采集通道
2. `sp_display_open` — 打开显示通道
3. 循环 `sp_vio_get_frame` → `sp_display_send_frame` — 采集帧送显
4. `sp_vio_close`/`sp_display_close` — 释放资源

简易 API 的完整接口说明见 [多媒体 API](/Simple_API/multimedia_api/cdev/vio_api)。

## 效果

HDMI 显示器上实时显示摄像头画面，延迟约 1~2 帧。

## 相关文档

- [视频采集](./01_vio_capture.md)
- [摄像头使用](/Demos/peripheral/camera/mipi_camera)
- [多媒体 API](/Simple_API/multimedia_api/cdev/vio_api)
- [C/C++ demo 编程指南](/Demos/demo_support/c_cpp_build)
