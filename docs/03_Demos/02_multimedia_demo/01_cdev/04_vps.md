---
title: "视频处理"
sidebar_position: 4
description: "RDK S100/S600 VPS 视频处理示例（文件/解码输入→缩放→输出）"
---

# 视频处理

本示例演示通过 VPS（Video Process Subsystem）对图像进行缩放处理。支持两种输入模式：YUV 文件输入和 H.264 码流解码输入。

:::tip
示例源码预置在板端 `/app/cdev_demo/vps/` 目录，可直接 `make` 编译运行。
:::

## 环境准备

- 开发板已烧录 RDK OS 并启动（见 [开始使用 RDK](../../../01_Quick_start/02_getting_started.md)）
- 示例自带测试数据：`input_1080p.h264`、`input_1080p.yuv`

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

模式 1：码流解码输入（H.264 → 解码 → VPS 缩放 → 输出 YUV 文件）

```bash
./vps -m 1 -i input_1080p.h264 -o output.yuv \
  --iheight 1080 --iwidth 1920 --oheight 720 --owidth 1280
```

模式 2：YUV 文件输入（YUV → VPS 缩放 → 输出 YUV 文件）

```bash
./vps -m 2 -i input_1080p.yuv -o output.yuv \
  --iheight 1080 --iwidth 1920 --oheight 720 --owidth 1280
```

参数说明：

| 参数 | 说明 |
| --- | --- |
| `-m` | 输入模式：1=码流（H.264），2=文件（YUV） |
| `-i` | 输入文件路径 |
| `-o` | 输出文件路径 |
| `--iwidth` / `--iheight` | 输入宽 / 高 |
| `--owidth` / `--oheight` | 输出宽 / 高（缩放目标） |
| `--skip` | 码流模式下跳过的帧数（可选） |

## 运行效果

程序运行后生成缩放后的 YUV 文件（示例将 1920×1080 缩放到 1280×720），输出日志如下（实测）：

```text
[UCP]: log level = 3
[UCP]: UCP version = 3.13.6
[VP]: log level = 3
[DNN]: log level = 3
[HPL]: log level = 3
[UCPT]: log level = 6
2026/08/14 14:24:34.807 !INFO [CamInitPymParam][0277]Setting PYM channel:0: crop_x:0, crop_y:0, input_width:1920, input_height:1080, dst_w:1280, dst_h:720
```

成功标志：当前目录生成 `output.yuv`（1280×720 尺寸为 1382400 字节）。模式 1 还会额外生成 `origin.yuv`（解码出的第一帧原始图像）。

可用 `ffplay -f rawvideo -pixel_format yuv420p -video_size 1280x720 output.yuv` 预览结果。

## 代码解读

示例使用简易 API（`sp_vio.h` / `sp_codec.h` / `sp_sys.h`），核心流程：

1. 模式 1（码流）：`sp_init_decoder_module` + `sp_start_decode` 启动解码，`sp_decoder_get_image` 取解码帧
2. 模式 2（文件）：直接读入 YUV 文件
3. `sp_open_vps`（`SP_VPS_SCALE`）— 打开 VPS 缩放通道
4. `sp_vio_set_frame` 送入图像 → `sp_vio_get_frame` 取缩放后图像
5. 写入输出文件并释放资源

接口详见 [VIO API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) 与 [DECODER API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md)。

## 常见问题

### 提示 `file2vps` / `decoder2vps` 报错

**原因**：输入文件路径不存在，或输入分辨率与实际不符。

**解决**：确认输入文件存在，且 `--iwidth` / `--iheight` 与输入数据分辨率一致。

## 相关文档

- [视频采集](./01_vio_capture.md)
- [VIO（视频输入）API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md)
- [DECODER（解码模块）API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
