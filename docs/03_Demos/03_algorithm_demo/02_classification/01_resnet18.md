---
title: 图像分类-ResNet18 (C/C++)
sidebar_position: 1
description: "用 C/C++ 部署 ResNet18 做图像分类推理的预装示例"
---

# 图像分类-ResNet18 (C/C++)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何用 `C/C++` 部署 ResNet18 模型，对一张图片做图像分类推理并输出 Top-K 结果。适用于搭载 BPU 的 RDK 设备，是 C/C++ 接口跑通预装 demo 的典型示例。Python 版见 [ResNet18 (Python)](./01_resnet18_py.md)。

示例代码位于板端 `/app/cdev_demo/bpu/classification_sample/resnet18/` 目录下。

## 前置条件

- 开发板已烧录 RDK OS 并能通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)）。
- 板端有编译工具链（`cmake`、`make`、`g++`，镜像已预装）。
- 预装模型已就位（默认路径下存在）：
  - S100：`/opt/hobot/model/s100/basic/resnet18_224x224_nv12.hbm`
  - S600：`/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm`

## 环境依赖

编译需要 `libgflags-dev`（参数解析）：

```bash
sudo apt update
sudo apt install libgflags-dev
```

## 代码位置

板端路径：`/app/cdev_demo/bpu/classification_sample/resnet18/`

目录结构：

```text
.
|-- CMakeLists.txt    # CMake 构建脚本
|-- README.md         # 工程说明
|-- inc/
|   `-- resnet18.hpp  # ResNet18 推理类定义
`-- src/
    |-- main.cc      # 程序入口
    `-- resnet18.cc  # 推理类实现
```

## 编译

```bash
cd /app/cdev_demo/bpu/classification_sample/resnet18
mkdir build && cd build
cmake ..
make -j$(nproc)
```

编译产物为 `build/resnet_18`。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model_path` | 模型文件路径（`.hbm` 格式） | S600: `/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm`（S100 对应 `s100/basic/`） |
| `--test_img` | 测试图片路径 | `/app/res/assets/zebra_cls.jpg` |
| `--label_file` | ImageNet 类别映射（每行 `index\tlabel`） | `/app/res/labels/imagenet1000_clsidx_to_labels.txt` |
| `--top_k` | 输出 Top-K 分类结果数 | `5` |

## 使用方法

确保在 `build` 目录中，使用默认参数运行：

```bash
./resnet_18
```

指定参数运行（等价于默认值）：

<DocScope products="RDK S600">

```bash
./resnet_18 \
  --model_path /opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm \
  --test_img   /app/res/assets/zebra_cls.jpg \
  --label_file /app/res/labels/imagenet1000_clsidx_to_labels.txt \
  --top_k 5
```

</DocScope>

**注意事项**：

- 须在 `build` 目录中运行，`--test_img`、`--label_file` 等默认路径均按板端预装目录给出。
- 首次编译前需按"环境依赖"安装 `libgflags-dev`，否则 `make` 会报错。
- 模型须位于默认路径（S600 为 `/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm`，S100 对应 `s100/basic/`），缺失时 `--model_path` 需显式指定。

## 运行效果

程序加载模型、完成一次推理后，输出 Top-K 分类结果。以下是 RDK S600 上的实测输出（测试图为斑马 `zebra_cls.jpg`）：

```text
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
TOP 0: label=zebra, prob=0.998747
TOP 1: label=cheetah, chetah, Acinonyx jubatus, prob=0.000424569
TOP 2: label=impala, Aepyceros melampus, prob=0.000400993
TOP 3: label=gazelle, prob=0.000257577
TOP 4: label=prairie chicken, prairie grouse, prairie fowl, prob=0.000169584
```

**成功标志**：末尾出现 `TOP 0: label=zebra, prob=0.998747` 等 Top-K 行，且 `zebra` 概率最高（约 0.999）。开头的 `BPULib verison(2, 2, 15)` 与 `DNN: 3.13.6` 表示 BPU 运行时已正常加载。

## 软件说明

数据流：读图（BGR）→ resize 到 224×224 → 转 NV12 → BPU 推理 → 读输出 tensor → 取 Top-K → 映射 ImageNet 标签。`Resnet18` 类封装模型加载、I/O 解析、推理执行与后处理。

## 常见问题

- **`make` 报错找不到 `gflags`**：未装 `libgflags-dev`，按"环境依赖"安装。
- **报错找不到模型**：检查 `--model_path` 下 `.hbm` 是否存在；缺失可按 README 用 `wget` 下载（需联网）。
- **`cmake ..` 找不到 OpenCV/工具链**：镜像已预装 OpenCV 4.6，若被卸载需重装；常规镜像无需手动装。
- **分类结果与 Python 版略有差异**：C++ 与 Python 的预处理/运行时实现存在细微差别（如 zebra 概率 C++ 0.9987 vs Python 0.9983），属正常。

## 相关文档

- [Python 版 ResNet18 示例](./01_resnet18_py.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
- [C 语言推理 API](../../../04_Simple_API/02_inference_api/01_c_api.md)
- [使用自己的模型](../../04_demo_support/04_custom_model.md)
