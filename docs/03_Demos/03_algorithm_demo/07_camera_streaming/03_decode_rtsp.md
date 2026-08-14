---
sidebar_position: 3
title: "RTSP 视频拉流及 YOLOv5x 推理"
description: "从 RTSP 流拉流解码并实时做 YOLOv5x 目标检测的预装示例"
---

# RTSP 视频拉流及 YOLOv5x 推理

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何结合 SP 硬件模块（解码器、VIO、显示）和 BPU，实现 RTSP/H.264 视频流 → 硬件解码（NV12）→ YOLOv5x 推理 → 叠加检测框 → 实时显示的端到端流程。Python 版见 [RTSP 视频拉流及 YOLOv5x 推理 (Python)](./03_decode_rtsp_py.md)。

:::tip
示例代码位于板端 `/app/cdev_demo/bpu/rtsp_yolov5x_display_sample/`，该代码已在板子上经过实际验证，可直接编译运行。
:::

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- 桌面版镜像（Desktop），能进入桌面/console 显示。
- 可达的 RTSP 流地址（如 `rtsp://<ip>/<stream>`）。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`）；若缺失见 [模型获取与放置](../../04_demo_support/01_model_files.md)。

## 环境依赖

编译需要 `libgflags-dev` 与 FFmpeg 开发库：

```bash
sudo apt update
sudo apt install libgflags-dev libavformat-dev libavcodec-dev libavutil-dev
```

## 代码位置

板端路径：`/app/cdev_demo/bpu/rtsp_yolov5x_display_sample/`

目录结构：

```text
.
|-- CMakeLists.txt                 # CMake 构建脚本
|-- README.md                      # 使用说明
|-- inc
|   `-- ultralytics_yolov5x.hpp    # YOLOv5x 封装头文件
`-- src
    |-- main.cc                    # 主程序入口：RTSP 解码→YOLOv5x 推理→显示
    `-- ultralytics_yolov5x.cc     # YOLOv5x 实现：预处理/推理/后处理/NMS
```

## 编译

```bash
cd /app/cdev_demo/bpu/rtsp_yolov5x_display_sample
mkdir build && cd build
cmake ..
make -j$(nproc)
```

编译产物为 `build/rtsp_yolov5x_display`。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--rtsp_url` | RTSP 流 URL | `rtsp://127.0.0.1/assets/1080P_test.h264` |
| `--transfer_type` | RTSP 传输类型（tcp/udp） | `tcp` |
| `--model_path` | YOLOv5x 量化 BPU 模型路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`） |
| `--label_file` | 类别名文件（每行一个类别名） | `/app/res/labels/coco_classes.names` |
| `--score_thres` | 置信度阈值（过滤低分检测框） | `0.25` |
| `--nms_thres` | NMS 的 IoU 阈值 | `0.45` |

## 使用方法

先准备 RTSP 码流。使用系统预置的推流服务，把 `1080P_test.h264` 视频文件处理成 RTSP 流（URL 为 `rtsp://127.0.0.1/assets/1080P_test.h264`）：

```bash
cd /app/res
sudo chmod +x live555MediaServer
sudo ./live555MediaServer &
```

在 `build` 目录中，使用默认参数运行：

```bash
./rtsp_yolov5x_display
```

指定参数运行（等价于默认值）：

<DocScope products="RDK-S600">

```bash
./rtsp_yolov5x_display \
  --rtsp_url rtsp://127.0.0.1/assets/1080P_test.h264 \
  --transfer_type tcp \
  --model_path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
  --label_file /app/res/labels/coco_classes.names \
  --score_thres 0.25 \
  --nms_thres 0.45
```

</DocScope>

退出运行：在命令行输入 `Ctrl+C`。

## 运行效果

以下是 RDK S600 上的实测输出（live555 推流 + 默认参数）：

```text
./rtsp_yolov5x_display
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
rtsp_w:1920, rtsp_h:1080, display_w:1920, display_h:1080
```

**成功标志**：输出 `rtsp_w:1920, rtsp_h:1080` 表示已成功打开 RTSP 流并解析出分辨率；`BPULib verison(2, 2, 15)` 与 `DNN: 3.13.6` 表示 BPU 运行时正常加载。屏幕会实时显示带检测框的画面。

## 软件说明

数据流：FFmpeg 初始化网络栈并打开 RTSP 流（`avformat_network_init`/`avformat_open_input`）→ SP 硬件解码（`sp_start_decode`/`sp_decoder_get_image`）取 NV12 帧 → NV12 转 BGR → letterbox 缩放 → BPU 推理 → NMS → 在 Display 图层叠加检测框（`draw_detections_on_disp`）；若显示分辨率与流分辨率不一致，自动插入 SP VPS 缩放管线。

## 常见问题

- **拉流失败/超时**：确认 RTSP 地址可达、网络通；用 `ffprobe rtsp://...` 或 VLC 验证流；live555 需在 `/app/res` 目录启动。
- **`No video stream found`**：流地址无视频轨，检查推流源。
- **无画面**：需显示环境；确认 `--rtsp_url` 分辨率与显示匹配，否则需 VPS 缩放。
- **报错找不到模型**：检查 `--model_path` 下 `.hbm` 是否存在。

## 相关文档

- [Python 版 RTSP 示例](./03_decode_rtsp_py.md)
- [目标检测-YOLOv5x (C/C++)](../03_detection/01_yolov5x.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
