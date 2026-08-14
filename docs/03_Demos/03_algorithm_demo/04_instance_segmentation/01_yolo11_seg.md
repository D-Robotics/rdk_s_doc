---
title: 实例分割-Ultralytics YOLO11 (C/C++)
sidebar_position: 1
description: "用 C/C++ 部署 YOLO11 做实例分割的预装示例"
---

# 实例分割-Ultralytics YOLO11 (C/C++)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何用 `C/C++` 在 BPU 上部署 Ultralytics YOLO11 实例分割模型，对一张图片做实例分割（前处理 + 推理 + 掩码后处理），并把结果保存成图片。Python 版见 [YOLO11 分割 (Python)](./01_yolo11_seg_py.md)。

示例代码位于板端 `/app/cdev_demo/bpu/instance_segmentation_sample/ultralytics_yolo11_seg/` 目录下。

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- 板端有编译工具链（`cmake`、`make`、`g++`，镜像已预装）。
- 预装模型已就位：
  - S100：`/opt/hobot/model/s100/basic/yolo11n_seg_nashp_640x640_nv12.hbm`
  - S600：`/opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm`

## 环境依赖

编译需要 `libgflags-dev`：

```bash
sudo apt update && sudo apt install libgflags-dev
```

## 代码位置

板端路径：`/app/cdev_demo/bpu/instance_segmentation_sample/ultralytics_yolo11_seg/`

:::tip
该目录下的代码已随镜像预装并经过板端验证，可直接编译运行。
:::

目录结构：

```text
.
|-- CMakeLists.txt                 # CMake 构建脚本
|-- README.md                      # 工程说明
|-- inc/
|   `-- ultralytics_yolo11_seg.hpp # YOLO11-Seg 推理类定义
`-- src/
    |-- main.cc                    # 程序入口
    `-- ultralytics_yolo11_seg.cc  # 推理类实现
```

## 编译

```bash
cd /app/cdev_demo/bpu/instance_segmentation_sample/ultralytics_yolo11_seg
mkdir build && cd build
cmake ..
make -j$(nproc)
```

编译产物为 `build/ultralytics_yolo11_seg`。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model_path` | 模型文件路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm`（S100 对应 `s100/basic/`） |
| `--test_img` | 测试图片路径 | `/app/res/assets/office_desk.jpg` |
| `--label_file` | 类别标签（COCO 80 类） | `/app/res/labels/coco_classes.names` |
| `--score_thres` | 置信度阈值 | `0.25` |
| `--nms_thres` | NMS 的 IoU 阈值 | `0.7` |

## 使用方法

确保在 `build` 目录中，使用默认参数运行：

```bash
./ultralytics_yolo11_seg
```

指定参数运行（等价于默认值）：

<DocScope products="RDK-S600">

```bash
./ultralytics_yolo11_seg \
  --model_path /opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm \
  --test_img /app/res/assets/office_desk.jpg \
  --label_file /app/res/labels/coco_classes.names \
  --score_thres 0.25 \
  --nms_thres 0.7
```

</DocScope>

## 运行效果

RDK S600 实测输出（测试图 `office_desk.jpg`）：

```text
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
pre_process finished
infer finished
post_process finished
[Saved] Result saved to: result.jpg
```

**成功标志**：依次出现 `pre_process/infer/post_process finished`，末尾 `[Saved] Result saved to: result.jpg`。打开 `build/result.jpg` 可见叠加的实例分割掩码。

## 软件说明

数据流：读图 → resize 到 640×640 → 转 NV12 → BPU 推理 → 解码检测头 + 分割头 → 置信度过滤 → NMS → 生成实例掩码 → 叠加到原图 → 保存。模型输入 `1x3x640x640`，归一化 `data_scale`。

## 常见问题

- **`make` 报错找不到 `gflags`**：未装 `libgflags-dev`，按"环境依赖"安装。
- **`result.jpg` 掩码缺失**：确认测试图含可识别目标；调低 `--score_thres`。
- **报错找不到模型**：检查 `--model_path`，S600 模型在 `/opt/hobot/model/s600/basic/`。

## 相关文档

- [Python 版 YOLO11 分割示例](./01_yolo11_seg_py.md)
- [目标检测-YOLO11 (C/C++)](../03_detection/02_yolo11.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
- [C 语言推理 API](../../../04_Simple_API/02_inference_api/02_c_api.md)
