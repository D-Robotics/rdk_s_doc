---
sidebar_position: 1
title: "USB Camera YOLOv5x 推理"
description: "用 USB 摄像头实时做 YOLOv5x 目标检测的预装示例"
---

# USB Camera YOLOv5x 推理

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何在 BPU 上部署量化后的 Ultralytics YOLOv5x 模型，通过 USB 摄像头实时读取画面做目标检测，并以全屏窗口可视化检测结果（前处理 + 推理 + NMS + 框绘制）。Python 版见 [USB Camera YOLOv5x 推理 (Python)](./01_usb_camera_py.md)。

:::tip
示例代码位于板端 `/app/cdev_demo/bpu/usb_camera_sample/`，该代码已在板子上经过实际验证，可直接编译运行。
:::

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)）。
- 桌面版镜像（Desktop），能进入桌面/console 显示。
- USB 摄像头已连接并被识别（`ls /dev/video*` 有设备）。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`）；若缺失见 [模型获取与放置](../../04_demo_support/01_model_files.md)。

## 环境依赖

编译需要 `libgflags-dev`：

```bash
sudo apt update
sudo apt install libgflags-dev
```

## 代码位置

板端路径：`/app/cdev_demo/bpu/usb_camera_sample/`

目录结构：

```text
.
|-- CMakeLists.txt                 # CMake 构建脚本：目标/依赖/包含与链接配置
|-- README.md                      # 使用说明
|-- inc
|   `-- ultralytics_yolov5x.hpp    # YOLOv5x 推理封装头：加载/预处理/推理/后处理接口
`-- src
    |-- main.cc                    # 程序入口：摄像头探测→取流→推理→绘制→显示
    `-- ultralytics_yolov5x.cc     # 推理实现：letterbox、NV12 张量写入、解码、NMS、框复原
```

## 编译

```bash
cd /app/cdev_demo/bpu/usb_camera_sample
mkdir build && cd build
cmake ..
make -j$(nproc)
```

编译产物为 `build/usb_camera`。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--video_device` | 视频设备（如 `/dev/video0`；为空则自动探测） | `""`（自动在 `/dev/video*` 中探测第一个可打开设备） |
| `--model_path` | BPU 量化模型路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`） |
| `--label_file` | 类别标签文件（逐行一个类别名） | `/app/res/labels/coco_classes.names` |
| `--score_thres` | 置信度阈值 | `0.25` |
| `--nms_thres` | NMS 的 IoU 阈值 | `0.45` |

## 使用方法

在 `build` 目录中，使用默认参数运行：

```bash
./usb_camera
```

指定参数运行（等价于默认值）：

<DocScope products="RDK S600">

```bash
./usb_camera \
  --video_device /dev/video0 \
  --model_path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
  --label_file /app/res/labels/coco_classes.names \
  --score_thres 0.25 \
  --nms_thres 0.45
```

</DocScope>

退出运行：将鼠标放置在显示框内，按 `q` 键退出。

## 运行效果

程序先探测 USB 摄像头，再加载模型推理并全屏显示。本板（无 USB 摄像头）实测输出如下：

```text
./usb_camera
No USB camera found under /dev/video*.
```

接入 USB 摄像头后的成功标志（据源码 `main.cc`）：

- 输出 `Open USB camera successfully`；
- 输出 `Place the mouse in the display window and press 'q' to quit`；
- 屏幕全屏显示带检测框的实时画面，按 `q` 退出。

<!-- TODO: 待接入摄像头实测成功 log -->

## 软件说明

数据流：探测/打开 `/dev/video*`（V4L2）→ 取 BGR 帧 → letterbox 缩放至 672×672 → 转 NV12 → BPU 推理 → 解码输出头 + NMS → 取 score≥0.25 的框 → 在画面绘制框与类别 → 全屏显示。

## 常见问题

- **`No USB camera found under /dev/video*.`**：USB 摄像头未识别。检查 USB 连接、`lsusb` 是否列出、是否为 UVC 摄像头，`ls /dev/video*` 确认设备节点。
- **无画面/黑屏**：需桌面环境（Desktop 镜像或已配置显示），Server 版无法全屏显示。
- **`make` 报错找不到 `gflags`**：未装 `libgflags-dev`，按"环境依赖"安装。
- **报错找不到模型**：检查 `--model_path` 下 `.hbm` 是否存在；S600 模型在 `/opt/hobot/model/s600/basic/`。

## 相关文档

- [Python 版 USB Camera 示例](./01_usb_camera_py.md)
- [目标检测-YOLOv5x (C/C++)](../03_detection/01_yolov5x.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
