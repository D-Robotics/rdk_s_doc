---
title: 姿态估计-Ultralytics YOLO11 (C/C++)
sidebar_position: 1
description: "用 C/C++ 部署 YOLO11 做人体姿态估计的预装示例"
---

# 姿态估计-Ultralytics YOLO11 (C/C++)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何用 `C/C++` 在 BPU 上部署 Ultralytics YOLO11 姿态估计模型，对一张图片做人体检测 + 关键点估计，并把骨架绘制到图上保存。Python 版见 [YOLO11 姿态 (Python)](./01_yolo11_pose_py.md)。

示例代码位于板端 `/app/cdev_demo/bpu/pose_sample/ultralytics_yolo11_pose/` 目录下。

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- 板端有编译工具链（`cmake`、`make`、`g++`，镜像已预装）。
- 预装模型已就位：
  - S100：`/opt/hobot/model/s100/basic/yolo11n_pose_nashp_640x640_nv12.hbm`
  - S600：`/opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm`

## 环境依赖

编译需要 `libgflags-dev`：

```bash
sudo apt update && sudo apt install libgflags-dev
```

## 代码位置

板端路径：`/app/cdev_demo/bpu/pose_sample/ultralytics_yolo11_pose/`

:::tip
该目录下的代码已随镜像预装并经过板端验证，可直接编译运行。
:::

目录结构：

```text
.
|-- CMakeLists.txt                     # CMake 构建脚本
|-- README.md                          # 工程说明
|-- inc/
|   `-- ultralytics_yolo11_pose.hpp    # YOLO11-Pose 推理类定义
`-- src/
    |-- main.cc                        # 程序入口
    `-- ultralytics_yolo11_pose.cc     # 推理类实现
```

## 编译

```bash
cd /app/cdev_demo/bpu/pose_sample/ultralytics_yolo11_pose
mkdir build && cd build
cmake ..
make -j$(nproc)
```

编译产物为 `build/ultralytics_yolo11_pose`。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model_path` | 模型文件路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm`（S100 对应 `s100/basic/`） |
| `--test_img` | 测试图片路径 | `/app/res/assets/bus.jpg` |
| `--label_file` | 类别标签（COCO 80 类） | `/app/res/labels/coco_classes.names` |
| `--score_thres` | 置信度阈值 | `0.25` |
| `--nms_thres` | NMS 的 IoU 阈值 | `0.7` |
| `--kpt_conf_thres` | 关键点可视化置信度阈值 | `0.5` |

## 使用方法

确保在 `build` 目录中，使用默认参数运行：

```bash
./ultralytics_yolo11_pose
```

指定参数运行（等价于默认值）：

<DocScope products="RDK-S600">

```bash
./ultralytics_yolo11_pose \
  --model_path /opt/hobot/model/s600/basic/yolo11n_pose_nashp_640x640_nv12.hbm \
  --test_img /app/res/assets/bus.jpg \
  --label_file /app/res/labels/coco_classes.names \
  --score_thres 0.25 \
  --nms_thres 0.7 \
  --kpt_conf_thres 0.5
```

</DocScope>

## 运行效果

RDK S600 实测输出（测试图 `bus.jpg`）：

```text
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
[Saved] Result saved to: result.jpg
```

**成功标志**：末尾出现 `[Saved] Result saved to: result.jpg`，`BPULib verison(2, 2, 15)` 与 `DNN: 3.13.6` 表示 BPU 运行时正常。打开 `build/result.jpg` 可见人体框与关键点骨架。

## 软件说明

数据流：读图 → resize 到 640×640 → 转 NV12 → BPU 推理 → 解码检测头 + 关键点头 → 置信度过滤 → NMS → 绘制人体框与骨架 → 保存。模型输入 `1x3x640x640`，归一化 `data_scale`。

## 常见问题

- **`make` 报错找不到 `gflags`**：未装 `libgflags-dev`，按"环境依赖"安装。
- **`result.jpg` 看不到骨架**：确认图含清晰人体；调低 `--score_thres` 或 `--kpt_conf_thres`。
- **报错找不到模型**：检查 `--model_path`，S600 模型在 `/opt/hobot/model/s600/basic/`。

## 相关文档

- [Python 版 YOLO11 姿态示例](./01_yolo11_pose_py.md)
- [目标检测-YOLO11 (C/C++)](../03_detection/02_yolo11.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
- [C 语言推理 API](../../../04_Simple_API/02_inference_api/02_c_api.md)
