---
title: "C/C++ demo 编程指南"
sidebar_position: 2
description: "板端编译 C/C++ demo 的方法（cmake/make）"
---

# C/C++ demo 编程指南

板端 `/app/cdev_demo` 下的 C/C++ 示例均为源码，需在板端编译后运行。RDK OS 镜像已预装 `gcc/g++`、`cmake`、`make` 与 OpenCV，多数示例可板端直接编译，无需交叉编译。

## 前置条件

- 已通过 SSH 登录开发板（见 [远程登录](../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- 镜像预装工具链可用：`cmake`、`make`、`g++`（用 `which cmake make g++` 确认）。

## 板端直接编译

以 ResNet18 分类示例为例（板端路径见 [ResNet18 (C/C++)](../03_algorithm_demo/02_classification/01_resnet18.md)）：

```bash
cd /app/cdev_demo/bpu/classification_sample/resnet18
mkdir build && cd build
cmake ..
make -j$(nproc)
```

`cmake ..` 关键输出（自动发现 OpenCV）：

```text
-- Found OpenCV: /usr (found version "4.6.0")
-- Build files have been written to: ...
```

`make` 结束关键输出：

```text
[100%] Linking CXX executable resnet_18
[100%] Built target resnet_18
```

编译产物为 `build/resnet_18`，直接运行：

```bash
./resnet_18
```

实测输出见 [ResNet18 (C/C++)](../03_algorithm_demo/02_classification/01_resnet18.md#运行效果)。

`cmake ..` 会自动发现板端 OpenCV（实测版本 4.6.0）与 BPU 相关库，无需额外配置。

## 依赖补充

多数示例所需的 `gflags`、OpenCV 等库已随镜像预装，无需额外安装。若编译时报找不到某个库，再按提示安装。例如缺少 gflags 时：

```bash
sudo apt update
sudo apt install libgflags-dev
```

## 交叉编译（可选）

板端编译最简单。如需在 PC 上交叉编译（节省板端资源、批量构建），使用 RDK 交叉工具链，详见第 5 章进阶开发的 [开发环境与编译](../../07_Advanced_development/06_environment_build/01_environment_build.md)。

## 常见问题

- **`make` 报错找不到头文件**：确认在示例目录的 `build/` 下执行、`cmake ..` 成功；部分示例依赖上级 `utils` 目录，不要单独拷贝源码到别处编译。
- **`cmake` 找不到 OpenCV**：常规镜像已预装；若被卸载用 `sudo apt install libopencv-dev` 重装。
- **编译慢**：`make -j$(nproc)` 已用满核；板端内存有限，超大型工程建议交叉编译。

## 相关文档

- [ResNet18 (C/C++) 示例](../03_algorithm_demo/02_classification/01_resnet18.md)
- [模型获取与放置](./01_model_files.md)
- [开发环境与编译（进阶）](../../07_Advanced_development/06_environment_build/01_environment_build.md)
