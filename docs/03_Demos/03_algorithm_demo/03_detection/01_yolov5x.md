---
title: 目标检测-Ultralytics YOLOv5x (C/C++)
sidebar_position: 1
description: "用 C/C++ 部署 YOLOv5x 做目标检测的预装示例"
---

# 目标检测-Ultralytics YOLOv5x (C/C++)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何用 `C/C++` 在 BPU 上部署量化后的 Ultralytics YOLOv5x 模型，对一张图片做目标检测（前处理 + 推理 + NMS + 框绘制），并把结果保存成图片。Python 版见 [YOLOv5x (Python)](./01_yolov5x_py.md)。

<DocScope products="RDK-S100">

示例代码位于板端 `/app/cdev_demo/bpu/02_detection_sample/01_ultralytics_yolov5x/` 目录下。

</DocScope>
<DocScope products="RDK-S600">

示例代码位于板端 `/app/cdev_demo/bpu/detection_sample/ultralytics_yolov5x/` 目录下。

</DocScope>

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- 板端有编译工具链（`cmake`、`make`、`g++`，镜像已预装）。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm`（S100 对应 `s100/basic/`）。

## 环境依赖

编译需要 `libgflags-dev`：

```bash
sudo apt update
sudo apt install libgflags-dev
```

## 代码位置

<DocScope products="RDK-S100">

板端路径：`/app/cdev_demo/bpu/02_detection_sample/01_ultralytics_yolov5x/`

</DocScope>
<DocScope products="RDK-S600">

板端路径：`/app/cdev_demo/bpu/detection_sample/ultralytics_yolov5x/`

</DocScope>

## 编译

```bash
cd /app/cdev_demo/bpu/detection_sample/ultralytics_yolov5x   # S100 改为对应路径
mkdir build && cd build
cmake ..
make -j$(nproc)
```

编译产物为 `build/ultralytics_yolov5x`。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | 模型文件路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` |
| `--test-img` | 测试图片路径 | `/app/res/assets/kite.jpg` |
| `--label-file` | 类别标签（COCO 80 类） | `/app/res/labels/coco_classes.names` |
| `--score-thres` | 置信度阈值（过滤低分框） | `0.25` |
| `--nms-thres` | IoU 阈值（NMS） | `0.45` |

## 使用方法

在 `build` 目录中运行：

```bash
./ultralytics_yolov5x
```

指定参数运行（等价于默认值）：

<DocScope products="RDK-S600">

```bash
./ultralytics_yolov5x \
  --model-path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
  --test-img   /app/res/assets/kite.jpg \
  --label-file /app/res/labels/coco_classes.names \
  --score-thres 0.25 \
  --nms-thres 0.45
```

</DocScope>

## 运行效果

程序加载模型、推理、NMS、绘制框并保存。以下是 RDK S600 上的实测输出（测试图 `kite.jpg`）：

```text
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
[Saved] Result saved to: result.jpg
```

**成功标志**：末尾出现 `[Saved] Result saved to: result.jpg`，`BPULib verison(2, 2, 15)` 与 `DNN: 3.13.6` 表示 BPU 运行时正常加载。用图片查看器打开 `build/result.jpg` 可见检测框（如 `kite.jpg` 中的人与风筝）。

## 软件说明

数据流：读图（BGR）→ resize 到 672×672 → 转 NV12 → BPU 推理 → 解码输出头 → NMS 去重 → 取 score≥0.25 的框 → 在原图绘制框与类别 → 保存。模型输入 `1x3x672x672`，归一化 `data_scale`（scale≈1/255）。

## 常见问题

- **`result.jpg` 看不到框**：确认测试图含可识别目标；调低 `--score-thres`（如 0.1）。
- **`make` 报错找不到 `gflags`**：未装 `libgflags-dev`，按"环境依赖"安装。
- **报错找不到模型**：检查 `--model-path` 下 `.hbm` 是否存在；S600 模型在 `/opt/hobot/model/s600/basic/`。

## 相关文档

- [Python 版 YOLOv5x 示例](./01_yolov5x_py.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
