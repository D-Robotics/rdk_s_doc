---
sidebar_position: 4
title: "视频解码及 YOLOv5x 推理"
description: "解码本地 H.264 文件并实时做 YOLOv5x 目标检测的预装示例"
---

# 视频解码及 YOLOv5x 推理

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何使用 SP 解码/显示/VIO 与 BPU 组合，完成本地 H.264 文件 → 硬件解码（NV12）→ YOLOv5x 推理 → 叠加框到显示图层 的端到端流程。WebSocket 版见 [WebSocket YOLOv5x 推理 (Python)](./04_websocket_py.md)。

:::tip
示例代码位于板端 `/app/cdev_demo/bpu/decode_yolov5x_display_sample/`，该代码已在板子上经过实际验证，可直接编译运行。
:::

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)）。
- 桌面版镜像（Desktop），能进入桌面/console 显示。
- 输入视频文件已就位：`/app/res/assets/1080P_test.h264`。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`）；若缺失见 [模型获取与放置](../../04_demo_support/01_model_files.md)。

## 环境依赖

编译需要 `libgflags-dev`：

```bash
sudo apt update
sudo apt install libgflags-dev
```

## 代码位置

板端路径：`/app/cdev_demo/bpu/decode_yolov5x_display_sample/`

目录结构：

```text
.
|-- CMakeLists.txt                 # CMake 构建脚本（目标/依赖/包含与链接）
|-- README.md                      # 使用说明
|-- inc
|   `-- ultralytics_yolov5x.hpp    # YOLOv5x 封装头：加载/预处理/推理/后处理接口
`-- src
    |-- main.cc                    # 程序入口：H.264 解码→推理→显示叠加（Ctrl+C 退出）
    `-- ultralytics_yolov5x.cc     # YOLOv5x 实现：letterbox、NV12 张量写入、解码、NMS、还原坐标
```

## 编译

```bash
cd /app/cdev_demo/bpu/decode_yolov5x_display_sample
mkdir build && cd build
cmake ..
make -j$(nproc)
```

编译产物为 `build/decode_yolov5x_display`。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--width` | 源码流/解码期望宽度（像素） | `1920` |
| `--height` | 源码流/解码期望高度（像素） | `1080` |
| `--input_path` | 输入 H.264 文件路径 | `/app/res/assets/1080P_test.h264` |
| `--model_path` | YOLOv5x 量化模型路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`） |
| `--label_file` | 类别名列表文件（逐行一个类别名） | `/app/res/labels/coco_classes.names` |
| `--score_thres` | 置信度阈值（过滤低分框） | `0.25` |
| `--nms_thres` | NMS 的 IoU 阈值 | `0.45` |

## 使用方法

在 `build` 目录中，使用默认参数运行：

```bash
./decode_yolov5x_display
```

指定参数运行（等价于默认值）：

<DocScope products="RDK-S600">

```bash
./decode_yolov5x_display \
  --width 1920 --height 1080 \
  --input_path /app/res/assets/1080P_test.h264 \
  --model_path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
  --label_file /app/res/labels/coco_classes.names \
  --score_thres 0.25 \
  --nms_thres 0.45
```

</DocScope>

退出运行：在命令行输入 `Ctrl+C`。

## 运行效果

以下是 RDK S600 上的实测输出（默认参数，`1080P_test.h264`）：

```text
./decode_yolov5x_display
disp_w=1920, disp_h=1080
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
sp_start_decode success!
sp_start_display success!
```

**成功标志**：输出 `sp_start_decode success!` 表示已成功打开解码通道，`sp_start_display success!` 表示显示通道就绪；`BPULib verison(2, 2, 15)` 与 `DNN: 3.13.6` 表示 BPU 运行时正常加载。屏幕会实时显示带检测框的画面。

## 软件说明

数据流：SP 解码器打开 H.264 文件（`sp_init_decoder_module`/`sp_start_decode`）→ `sp_decoder_get_image` 取 NV12 帧 → NV12 转 BGR → letterbox 缩放 → BPU 推理 → NMS → 在 Display 图层叠加检测框（`draw_detections_on_disp`）；若显示分辨率与视频分辨率不一致，自动插入 SP VPS 缩放管线；文件解码到结尾后自动循环重播。

## 常见问题

- **`sp_start_decode failed`**：`--input_path` 指定的文件不存在或非 H.264 码流，检查文件路径。
- **无画面**：需显示环境；确认 `--width`/`--height` 与视频实际分辨率一致，否则需 VPS 缩放。
- **`make` 报错找不到 `gflags`**：未装 `libgflags-dev`，按"环境依赖"安装。
- **报错找不到模型**：检查 `--model_path` 下 `.hbm` 是否存在。

## 相关文档

- [WebSocket YOLOv5x 推理 (Python)](./04_websocket_py.md)
- [目标检测-YOLOv5x (C/C++)](../03_detection/01_yolov5x.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
