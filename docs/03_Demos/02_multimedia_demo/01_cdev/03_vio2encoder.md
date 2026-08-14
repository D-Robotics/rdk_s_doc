---
title: "采集→编码"
sidebar_position: 3
description: "RDK S100/S600 摄像头采集→VIO→编码保存示例"
---

# 采集→编码

本示例演示通过 VIO 采集摄像头画面并实时编码为 H.264 码流保存到文件，链路：Camera → VIO → Encoder → File。

:::tip
示例源码预置在板端 `/app/cdev_demo/vio2encoder/` 目录，可直接 `make` 编译运行。
:::

## 环境准备

- 开发板已烧录 RDK OS 并启动（见 [开始使用 RDK](../../../01_Quick_start/02_getting_started.md)）
- MIPI 摄像头已连接（见 [摄像头使用](../../01_peripheral/02_camera/01_mipi_camera.md)）
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
./vio2encoder -w 1920 -h 1080 --iwidth 1920 --iheight 1080 -o stream.h264
```

参数说明：

| 参数 | 说明 |
| --- | --- |
| `-w` / `-h` | 编码输出视频宽度 / 高度 |
| `--iwidth` / `--iheight` | 传感器输出宽度 / 高度 |
| `-o` | 编码输出文件路径 |
| `-f` | 传感器帧率（可选，默认自动探测） |

程序持续编码直到按 `Ctrl+C` 停止。当前示例编码格式固定为 H.264。

## 运行效果

成功标志：日志依次出现 `sp_open_camera success!`、`sp_start_encode success!`、`sp_module_bind(vio -> encoder) success!`，按 `Ctrl+C` 后打印 `recv:2,Stoping...`，并生成 `stream.h264` 文件。

失败排查：未连接摄像头时，程序打印 `[Error] sp_open_camera failed!` 后退出。

## 代码解读

示例使用简易 API（`sp_vio.h` / `sp_codec.h` / `sp_sys.h`），核心流程：

1. `sp_init_vio_module` / `sp_init_encoder_module` — 初始化 VIO 与编码模块
2. `sp_open_camera_v2` — 打开摄像头采集通道
3. `sp_start_encode`（`SP_ENCODER_H264`）— 启动 H.264 编码
4. `sp_module_bind` — 绑定采集到编码（VIO → ENCODER）
5. 循环 `sp_encoder_get_stream` — 取码流写入文件
6. `sp_module_unbind` / `sp_stop_encode` / `sp_vio_close` — 停止并释放资源

接口详见 [VIO API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) 与 [ENCODER API](../../../04_Simple_API/01_multimedia_api/cdev/02_encoder_api.md)。

## 常见问题

### 提示 `sp_open_camera failed`

**原因**：未连接 MIPI 摄像头，或传感器初始化失败。

**解决**：断电后重新连接摄像头，确认传感器型号受支持后重试。

## 相关文档

- [视频采集](./01_vio_capture.md)
- [VIO（视频输入）API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md)
- [ENCODER（编码模块）API](../../../04_Simple_API/01_multimedia_api/cdev/02_encoder_api.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
