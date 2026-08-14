---
sidebar_position: 1
title: "视频采集"
description: "RDK S100/S600 摄像头采集→本地保存 RAW/YUV 示例"
---

# 视频采集

本示例演示通过 VIO 采集 MIPI 摄像头画面，并将 RAW 和 YUV 两种格式的图像保存到本地文件，链路：Camera → VIO → File。

:::tip
示例源码预置在板端 `/app/cdev_demo/vio_capture/` 目录，可直接 `make` 编译运行。
:::

## 环境准备

- 开发板已烧录 RDK OS 并启动（见 [开始使用 RDK](../../../01_Quick_start/02_getting_started.md)）
- MIPI 摄像头已连接（见 [摄像头使用](../../01_peripheral/02_camera/01_mipi_camera.md)）

## 代码位置

板端路径：`/app/cdev_demo/vio_capture/`

```
vio_capture/
├── Makefile
└── capture.c
```

## 编译与运行

```bash
cd /app/cdev_demo/vio_capture
make
./capture -b 10 -c 10 -w 1920 -h 1080
```

参数说明：

| 参数 | 说明 |
| --- | --- |
| `-w` / `-h` | 传感器输出宽度 / 高度 |
| `-b` | RAW 图像位深，一般为 10（IMX219），IMX477 为 12 |
| `-c` | 采集帧数 |
| `-f` | 传感器帧率（可选，默认自动探测） |

## 运行效果

程序运行后，在当前目录生成 `2 × count` 个文件：`yuv_0.yuv`、`yuv_1.yuv`…（YUV 格式）与 `raw_0.raw`、`raw_1.raw`…（RAW 格式）。运行过程中按帧打印采集进度：

```text
capture time :0
capture time :1
...
capture time :9
```

失败排查：未连接摄像头时，程序打印 `[Error] sp_open_camera failed!` 后退出。

## 常见问题

### 提示 `sp_open_camera failed`

**原因**：未连接 MIPI 摄像头，或摄像头初始化失败。

**解决**：断电后重新连接摄像头，确认传感器型号受支持后重试。

## 相关文档

- [VIO（视频输入）API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md)
- [采集→显示](./02_vio2display.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
