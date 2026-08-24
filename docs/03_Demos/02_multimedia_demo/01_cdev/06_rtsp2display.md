---
title: "RTSP→显示"
sidebar_position: 6
description: "RDK S100/S600 RTSP 网络拉流→解码→Display 实时显示示例"
---

# RTSP→显示

本示例演示从 RTSP 网络地址拉取视频码流，解码并实时输出到 HDMI 显示器，链路：RTSP → Decoder → Display。

:::tip
示例源码预置在板端 `/app/cdev_demo/rtsp2display/` 目录，可直接 `make` 编译运行。
:::

## 环境准备

- 开发板已烧录 RDK OS 并启动（见 [开始使用 RDK](../../../01_Quick_start/02_getting_started.md)）
- HDMI 显示器已连接
- 有 RTSP 码流源。可使用板端预置的 `live555MediaServer` 推流，将 `1080P_test.h264` 处理成 RTSP 流（地址 `rtsp://127.0.0.1/assets/1080P_test.h264`）：

```bash
cd /app/res
sudo chmod +x live555MediaServer
sudo ./live555MediaServer &
```

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
./rtsp2display -i rtsp://127.0.0.1/assets/1080P_test.h264 -t tcp
```

参数说明：

| 参数 | 说明 |
| --- | --- |
| `-i` | RTSP 拉流地址 |
| `-t` | 传输类型，可选 `tcp` / `udp` |

程序启动后，RTSP 码流解码画面将实时显示在 HDMI 显示器上。按 `Ctrl+C` 退出。

## 运行效果

成功标志：日志出现 `avformat_open_input ok!`、`sp_open_vps success!`，显示器播放 RTSP 码流画面。运行日志（实测）：

```text
[UCP]: log level = 3
[UCP]: UCP version = 3.13.6
[VP]: log level = 3
[DNN]: log level = 3
[HPL]: log level = 3
[UCPT]: log level = 6
avformat_open_input ok!
avformat_find_stream_info ok!
Input #0, rtsp, from 'rtsp://127.0.0.1/assets/1080P_test.h264':
  Metadata:
    title           : H.264 Video, streamed by the LIVE555 Media Server
    comment         : assets/1080P_test.h264
  Duration: N/A, start: 0.040000, bitrate: N/A
  Stream #0:0: Video: h264 (High), yuv420p(progressive), 1920x1080 [SAR 1:1 DAR 16:9], 25 fps, 25 tbr, 90k tbn
av_dump_format ok!
rtsp_w:1920,rtsp_h:1080
display_w:1920,dispaly_h:1080
2026/08/14 14:25:42.161 !WARN [sp_start_display][0049]Warning: Using vot_chn values 0-3 is deprecated. Defaulting to HDMI mode.
2026/08/14 14:25:42.161 !WARN [sp_start_display][0050]Please use the new method: pass 10 for DisplayPort (DP) or 11 for HDMI.
2026/08/14 14:25:42.161 !INFO [OpenDisplay][0111]Wayland is available, using Wayland for rendering.
2026/08/14 14:25:42.161 !INFO [init][0572]Using default socket path: /run/user/1000/wayland-0
2026/08/14 14:25:42.257 !INFO [init][0449]Renderer::init completed successfully. SP_OVERLAY_SPACE=image
2026/08/14 14:25:42.257 !INFO [CamInitPymParam][0277]Setting PYM channel:0: crop_x:0, crop_y:0, input_width:1920, input_height:1080, dst_w:1920, dst_h:1080
sp_open_vps success!

recv:2,Stoping...
```

## 代码解读

示例使用 ffmpeg（`libavformat`）拉流 + 简易 API（`sp_codec.h` / `sp_display.h` / `sp_vio.h` / `sp_sys.h`）解码显示，核心流程：

1. `avformat_open_input` 等 — 打开并解析 RTSP 码流
2. `sp_init_decoder_module` / `sp_init_display_module` / `sp_init_vio_module` — 初始化模块
3. `sp_start_decode` / `sp_start_display` / `sp_open_vps` — 启动解码、显示与 VPS 缩放
4. `sp_module_bind` — 绑定 DECODER → VPS → DISPLAY
5. `sp_stop_decode` / `sp_stop_display` / `sp_release_*_module` — 释放资源

接口详见 [DECODER API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md) 与 [DISPLAY API](../../../04_Simple_API/01_multimedia_api/cdev/04_display_api.md)。

## 常见问题

### UDP 传输出现花屏

**原因**：UDP 传输下网络丢包会导致花屏。

**解决**：切换为 TCP 传输（`-t tcp`），TCP 更稳定但延迟略高。

### 提示 `Could not open input file` / Connection refused

**原因**：RTSP 地址不可达，或端口不正确。

**解决**：确认推流服务已启动，并根据 `live555MediaServer` 打印的端口信息调整地址。

## 相关文档

- [Python 示例](../02_pydev/01_pydev_multimedia.md)
- [解码→显示](./05_decode2display.md)（本地文件版）
- [DECODER（解码模块）API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md)
- [DISPLAY（显示模块）API](../../../04_Simple_API/01_multimedia_api/cdev/04_display_api.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
