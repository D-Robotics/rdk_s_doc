---
title: 图像分类-MobileNetV2 (C/C++)
sidebar_position: 2
description: "用 C/C++ 部署 MobileNetV2 做图像分类的预装示例"
---

# 图像分类-MobileNetV2 (C/C++)

本示例演示如何用 `C/C++` 在 BPU 上部署 MobileNetV2 模型做图像分类推理并输出 Top-K 结果。MobileNetV2 是轻量级分类网络，适合算力/功耗敏感场景。Python 版见 [MobileNetV2 (Python)](./02_mobilenetv2_py.md)，C++ 版 ResNet18 见 [ResNet18 (C/C++)](./01_resnet18.md)。

示例代码位于板端 `/app/cdev_demo/bpu/classification_sample/mobilenetv2/` 目录下。

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- 板端有编译工具链（`cmake`、`make`、`g++`，镜像已预装）。
- 预装模型已就位：S600 `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm`。

## 环境依赖

```bash
sudo apt update && sudo apt install libgflags-dev
```

## 编译

```bash
cd /app/cdev_demo/bpu/classification_sample/mobilenetv2
mkdir build && cd build
cmake ..
make -j$(nproc)
```

产物为 `build/mobilenetv2`。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model_path` | 模型文件路径（.hbm） | S600: `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm` |
| `--test_img` | 测试图片路径 | `/app/res/assets/zebra_cls.jpg` |
| `--label_file` | 类别标签（imagenet） | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` |
| `--top_k` | 输出 Top-K 数 | `5` |

## 使用方法

```bash
./mobilenetv2
```

**注意事项**：

- 须在 `build` 目录中运行，`--test_img`、`--label_file` 等默认路径均按板端预装目录给出。
- 首次编译前需按"环境依赖"安装 `libgflags-dev`，否则 `make` 会报错。
- 模型须位于默认路径 `/opt/hobot/model/s600/basic/mobilenetv2_224x224_nv12.hbm`，缺失时 `--model_path` 需显式指定。

## 运行效果

RDK S600 实测输出（测试图 `zebra_cls.jpg`）：

```text
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
TOP 0: label=zebra, prob=0.992726
TOP 1: label=tiger, Panthera tigris, prob=0.00401174
TOP 2: label=hartebeest, prob=0.00104985
TOP 3: label=tiger cat, prob=0.000753967
TOP 4: label=impala, Aepyceros melampus, prob=0.000424489
```

**成功标志**：末尾 `TOP 0: label=zebra, prob=0.992726` 等 Top-K 行，`zebra` 概率最高（约 0.993，与 Python 版一致）。

## 软件说明

数据流：读图（BGR）→ resize 到 224×224 → 转 NV12 → BPU 推理 → 读输出 tensor → Top-K → 映射标签。模型输入 `1x3x224x224`，归一化 `data_mean_and_scale`（mean BGR、scale 0.017）。

## 常见问题

- **`make` 报错找不到 `gflags`**：装 `libgflags-dev`。
- **报错找不到模型**：检查 `--model_path`，S600 模型在 `/opt/hobot/model/s600/basic/`。
- **与 ResNet18 结果不同**：模型不同，概率/排序有差异，正常。

## 相关文档

- [Python 版 MobileNetV2 示例](./02_mobilenetv2_py.md)
- [图像分类-ResNet18 (C/C++)](./01_resnet18.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
- [C 语言推理 API](../../../04_Simple_API/02_inference_api/01_c_api.md)
