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

<DocScope products="RDK-S100">

示例代码位于板端 `/app/cdev_demo/bpu/03_instance_segmentation_sample/02_ultralytics_yolo11_seg/` 目录下。

</DocScope>
<DocScope products="RDK-S600">

示例代码位于板端 `/app/cdev_demo/bpu/instance_segmentation_sample/ultralytics_yolo11_seg/` 目录下。

</DocScope>

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- 板端有编译工具链（`cmake`、`make`、`g++`，镜像已预装）。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm`。

## 环境依赖

```bash
sudo apt update && sudo apt install libgflags-dev
```

## 编译

```bash
cd /app/cdev_demo/bpu/instance_segmentation_sample/ultralytics_yolo11_seg   # S100 改为对应路径
mkdir build && cd build
cmake ..
make -j$(nproc)
```

产物为 `build/ultralytics_yolo11_seg`。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | 模型路径（.hbm） | S600: `/opt/hobot/model/s600/basic/yolo11n_seg_nashp_640x640_nv12.hbm` |
| `--test-img` | 测试图片路径 | `/app/res/assets/office_desk.jpg` |
| `--label-file` | 类别标签（COCO） | `/app/res/labels/coco_classes.names` |
| `--img-save-path` | 结果图保存路径 | `result.jpg` |

## 使用方法

```bash
./ultralytics_yolo11_seg
```

## 运行效果

RDK S600 实测输出（测试图 `office_desk.jpg`）：

```text
[DNN]: 3.13.6_(4.7.5 HBRT)
pre_process finished
infer finished
post_process finished
[Saved] Result saved to: result.jpg
```

**成功标志**：依次出现 `pre_process/infer/post_process finished`，末尾 `[Saved] Result saved to: result.jpg`。打开 `build/result.jpg` 可见叠加的实例分割掩码。

## 软件说明

数据流：读图 → resize 到 640×640 → 转 NV12 → BPU 推理 → 解码检测头 + 分割头 → 生成实例掩码 → 叠加到原图 → 保存。模型输入 `1x3x640x640`，归一化 `data_scale`。

## 常见问题

- **`make` 报错找不到 `gflags`**：装 `libgflags-dev`。
- **`result.jpg` 掩码缺失**：确认图含可识别目标。
- **报错找不到模型**：检查 `--model-path`，S600 模型在 `/opt/hobot/model/s600/basic/`。

## 相关文档

- [Python 版 YOLO11 分割示例](./01_yolo11_seg_py.md)
- [目标检测-YOLO11 (C/C++)](../03_detection/02_yolo11.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
