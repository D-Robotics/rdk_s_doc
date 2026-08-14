---
title: "采集→显示"
sidebar_position: 2
description: "RDK S100/S600 摄像头采集→VIO→Display 实时预览示例"
---

# 采集→显示

本示例演示通过 VIO 采集摄像头画面并实时输出到 HDMI 显示器，是多媒体 pipeline 最基础的链路：Camera → VIO → Display。

:::tip
示例源码预置在板端 `/app/cdev_demo/vio2display/` 目录，可直接 `make` 编译运行。
:::

## 环境准备

- 开发板已烧录 RDK OS 并启动（见 [开始使用 RDK](../../../01_Quick_start/02_getting_started.md)）
- MIPI 摄像头已连接（见 [摄像头使用](../../01_peripheral/02_camera/01_mipi_camera.md)）
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
./vio2display -w 1920 -h 1080
```

参数说明：

| 参数 | 说明 |
| --- | --- |
| `-w` | 传感器输出宽度 |
| `-h` | 传感器输出高度 |

程序启动后，摄像头画面将实时显示在 HDMI 显示器上。在终端输入 `q` 并回车退出。

## 运行效果

成功标志：显示器实时显示摄像头画面，日志出现 `sp_open_camera success!`，随后打印 `Press 'q' to Exit !` 等待退出。

失败排查（未连接摄像头，实测输出）：

```text
[UCP]: log level = 3
[UCP]: UCP version = 3.13.6
[VP]: log level = 3
[DNN]: log level = 3
[HPL]: log level = 3
[UCPT]: log level = 6
disp_w=1920, disp_h=1080
2026/08/14 14:25:48.963 !INFO [CamInitParam][0314]set camera fps: -1,width: 1920,height: 1080
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@4 i2c bus: 4 mipi rx phy: 4
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@5 i2c bus: 5 mipi rx phy: 5
2026/08/14 14:25:48.966 ERROR [CamInitParam][0336]No camera sensor found, please check whether the camera connection or video_idx is correct.
2026/08/14 14:25:48.966 ERROR [OpenCamera][0433]CamInitParam failed error(-1)
[Error] sp_open_camera failed!
```

## 代码解读

示例使用简易 API（`sp_vio.h` / `sp_display.h` / `sp_sys.h`），核心流程：

1. `sp_init_vio_module` — 初始化 VIO 模块
2. `sp_open_camera_v2` — 打开摄像头采集通道
3. `sp_init_display_module` + `sp_start_display` — 初始化并启动显示
4. `sp_module_bind` — 绑定采集到显示（VIO → DISPLAY）
5. `sp_vio_close` / `sp_stop_display` / `sp_release_*_module` — 释放资源

接口详见 [VIO API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) 与 [DISPLAY API](../../../04_Simple_API/01_multimedia_api/cdev/04_display_api.md)。

## 常见问题

### 提示 `sp_open_camera failed`

**原因**：未连接 MIPI 摄像头，或传感器初始化失败。

**解决**：断电后重新连接摄像头，确认传感器型号受支持后重试。

## 相关文档

- [视频采集](./01_vio_capture.md)
- [摄像头使用](../../01_peripheral/02_camera/01_mipi_camera.md)
- [VIO（视频输入）API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md)
- [DISPLAY（显示模块）API](../../../04_Simple_API/01_multimedia_api/cdev/04_display_api.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
