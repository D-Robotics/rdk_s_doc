---
sidebar_position: 2
title: "MIPI Camera YOLOv5x 推理"
description: "用 MIPI 摄像头实时做 YOLOv5x 目标检测的预装示例"
---

# MIPI Camera YOLOv5x 推理

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何在 BPU 上部署量化后的 Ultralytics YOLOv5x 模型，通过 MIPI 摄像头（板载相机接口）实时读取画面做目标检测，并以全屏方式可视化检测结果（VIO 取流 + 前处理 + 推理 + NMS + 框绘制）。Python 版见 [MIPI Camera YOLOv5x 推理 (Python)](./02_mipi_camera_py.md)。

:::tip
示例代码位于板端 `/app/cdev_demo/bpu/mipi_camera_sample/`，该代码已在板子上经过实际验证，可直接编译运行。
:::

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)）。
- 桌面版镜像（Desktop），能进入桌面/console 显示。
- MIPI 摄像头已连接到板载相机接口并被识别。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`）；若缺失见 [模型获取与放置](../../04_demo_support/01_model_files.md)。

## 环境依赖

编译需要 `libgflags-dev`：

```bash
sudo apt update
sudo apt install libgflags-dev
```

## 硬件环境

- MIPI 相机的接口使用自动检测模式，该示例运行时只能接入一个 MIPI 摄像头（任意 MIPI 接口均可），同时接入多个会报错。

<DocScope products="RDK-S100">
- MIPI 摄像头安装方法可参考 [相机扩展板（RDK S100）](../../../01_Quick_start/01_hardware_introduction/03_expansion_board/01_camera/01_rdk_camera_expansion_board.md)。
</DocScope>

<DocScope products="RDK-S600">
- MIPI 摄像头安装方法可参考 [MIPI 相机接口（J11/J13）](../../../01_Quick_start/01_hardware_introduction/02_rdk_s600.md#mipi-camera-interfaces-j11j13)。
</DocScope>

## 代码位置

板端路径：`/app/cdev_demo/bpu/mipi_camera_sample/`

目录结构：

```text
.
|-- CMakeLists.txt                 # CMake 构建脚本：目标/依赖/包含与链接
|-- README.md                      # 使用说明
|-- inc
|   `-- ultralytics_yolov5x.hpp    # YOLOv5x 推理封装头：加载/预处理/推理/后处理接口
`-- src
    |-- main.cc                    # 程序入口：VIO 取流→推理→在 Display 图层绘制
    `-- ultralytics_yolov5x.cc     # 推理实现：letterbox、NV12 张量写入、解码、NMS、复原坐标
```

## 编译

```bash
cd /app/cdev_demo/bpu/mipi_camera_sample
mkdir build && cd build
cmake ..
make -j$(nproc)
```

编译产物为 `build/mipi_camera`。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--width` | 传感器原始宽度（用于 VIO 参数/显示缩放） | `1920` |
| `--height` | 传感器原始高度（用于 VIO 参数/显示缩放） | `1080` |
| `--model_path` | BPU 量化模型路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`） |
| `--label_file` | 类别标签文件（逐行一个类别名） | `/app/res/labels/coco_classes.names` |
| `--score_thres` | 置信度阈值 | `0.25` |
| `--nms_thres` | NMS 的 IoU 阈值 | `0.45` |

## 使用方法

在 `build` 目录中，使用默认参数运行：

```bash
./mipi_camera
```

指定参数运行（等价于默认值）：

<DocScope products="RDK-S600">

```bash
./mipi_camera \
  --width 1920 --height 1080 \
  --model_path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
  --label_file /app/res/labels/coco_classes.names \
  --score_thres 0.25 \
  --nms_thres 0.45
```

</DocScope>

退出运行：在命令行输入 `Ctrl+C`。

## 运行效果

程序先初始化 VIO 摄像头，再加载模型推理并叠加显示。本板（未接 MIPI 摄像头）实测输出如下：

```text
disp_w=1920, disp_h=1080
set camera fps: -1,width: 1920,height: 1080
No camera sensor found, please check whether the camera connection or video_idx is correct.
[OpenCamera] CamInitParam failed error(-1)
[Error] sp_open_camera failed!
```

接入 MIPI 摄像头后的成功标志（据源码 `main.cc`）：

- 输出 `disp_w=..., disp_h=...` 与 `sp_open_camera success!`；
- 屏幕显示带检测框的实时画面，按 `Ctrl+C` 退出。

<!-- TODO: 待接入摄像头实测成功 log -->

## 软件说明

数据流：VIO 初始化并打开 sensor（NV12 1920×1080）→ `sp_vio_get_yuv` 取帧 → NV12 转 BGR → letterbox 缩放至 672×672 → 转 NV12 → BPU 推理 → 解码输出头 + NMS → 在 Display 图层绘制框与类别 → 实时显示。

## 常见问题

- **`No camera sensor found`**：MIPI 摄像头未识别。用 `dmesg | grep -i sensor` 查 sensor，确认排线接好、摄像头被识别。
- **`sp_open_camera failed!`**：sensor 初始化失败，检查摄像头连接与供电。
- **无画面显示**：需桌面/显示环境。
- **`make` 报错找不到 `gflags`**：未装 `libgflags-dev`，按"环境依赖"安装。

## 相关文档

- [Python 版 MIPI Camera 示例](./02_mipi_camera_py.md)
- [目标检测-YOLOv5x (C/C++)](../03_detection/01_yolov5x.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
