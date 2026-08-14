---
title: "解码→显示"
sidebar_position: 5
description: "RDK S100/S600 视频码流解码→Display 实时显示示例"
---

# 解码→显示

本示例演示将视频码流（H.264/H.265）解码并实时输出到 HDMI 显示器，链路：File → Decoder → Display。

:::tip
示例源码预置在板端 `/app/cdev_demo/decode2display/` 目录，可直接 `make` 编译运行。
:::

## 环境准备

- 开发板已烧录 RDK OS 并启动（见 [开始使用 RDK](../../../01_Quick_start/02_getting_started.md)）
- HDMI 显示器已连接
- 有 H.264/H.265 码流文件（可使用 [采集→编码](./03_vio2encoder.md) 生成的输出，或板端预置的 `/app/res/assets/1080P_test.h264`）

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
./decoder2display -w 1920 -h 1080 -i /app/res/assets/1080P_test.h264
```

参数说明：

| 参数 | 说明 |
| --- | --- |
| `-i` | 输入码流文件路径（H.264/H.265，按扩展名自动识别） |
| `-w` | 输入视频宽度 |
| `-h` | 输入视频高度 |

程序启动后，码流解码画面将实时显示在 HDMI 显示器上。按 `Ctrl+C` 退出。当视频分辨率与显示器分辨率不一致时，示例会自动创建一路 VPS 进行缩放。

## 运行效果

成功标志：日志出现 `sp_start_display success!` 与 `sp_start_decode success!`，显示器播放码流画面。启动日志（实测）：

```text
[UCP]: log level = 3
[UCP]: UCP version = 3.13.6
[VP]: log level = 3
[DNN]: log level = 3
[HPL]: log level = 3
[UCPT]: log level = 6
disp_w=1920, disp_h=1080
2026/08/14 14:25:07.411 !WARN [sp_start_display][0049]Warning: Using vot_chn values 0-3 is deprecated. Defaulting to HDMI mode.
2026/08/14 14:25:07.411 !WARN [sp_start_display][0050]Please use the new method: pass 10 for DisplayPort (DP) or 11 for HDMI.
2026/08/14 14:25:07.411 !INFO [OpenDisplay][0111]Wayland is available, using Wayland for rendering.
2026/08/14 14:25:07.411 !INFO [init][0572]Using default socket path: /run/user/1000/wayland-0
2026/08/14 14:25:07.513 !INFO [init][0449]Renderer::init completed successfully. SP_OVERLAY_SPACE=image
sp_start_display success!
sp_start_decode success!
```

## 代码解读

示例使用简易 API（`sp_codec.h` / `sp_display.h` / `sp_vio.h` / `sp_sys.h`），核心流程：

1. `sp_init_decoder_module` — 初始化解码模块
2. `sp_init_display_module` + `sp_start_display` — 初始化并启动显示
3. `sp_start_decode` — 打开码流文件并启动解码
4. 分辨率不一致时，`sp_open_vps` 创建 VPS 缩放通道
5. `sp_module_bind` — 绑定解码到显示（DECODER → DISPLAY，或 DECODER → VPS → DISPLAY）
6. `sp_stop_decode` / `sp_stop_display` / `sp_release_*_module` — 释放资源

接口详见 [DECODER API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md) 与 [DISPLAY API](../../../04_Simple_API/01_multimedia_api/cdev/04_display_api.md)。

## 常见问题

### 日志出现 `vot_chn values 0-3 is deprecated` 警告

**原因**：示例调用 `sp_start_display` 时传入了旧的通道号，驱动自动按 HDMI 模式处理。

**解决**：该警告不影响功能，可忽略。

### 提示 `sp_start_decode failed`

**原因**：输入码流文件不存在，或 `-w` / `-h` 与码流实际分辨率不符。

**解决**：确认文件路径正确，且宽高参数与码流一致。

## 相关文档

- [采集→编码](./03_vio2encoder.md)（生成码流文件）
- [RTSP→显示](./06_rtsp2display.md)
- [DECODER（解码模块）API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md)
- [DISPLAY（显示模块）API](../../../04_Simple_API/01_multimedia_api/cdev/04_display_api.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
