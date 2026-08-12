---
title: "3.4.3 Python demo 编程指南"
sidebar_position: 3
description: "运行/二次开发板端 Python demo 的方法"
---

# 3.4.3 Python demo 编程指南

板端 `/app/pydev_demo` 下的示例是 Python 脚本，**无需编译**，`cd` 进示例目录后直接 `python xxx.py` 运行。镜像预装 `hbm_runtime` 等 Python 包，多数示例开箱即跑。

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 前置条件

- 已通过 SSH 登录开发板（见 [远程登录](../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- Python 与 `hbm_runtime` 已随镜像预装。

## 运行示例

以 ResNet18 分类为例（板端路径见 [ResNet18 (Python)](../03_algorithm_demo/02_classification/01_resnet18_py.md)）：

```bash
cd /app/pydev_demo/classification_sample/resnet18   # S100 改为对应路径
python resnet18.py
```

各示例的参数、运行命令见对应 demo 文档（[算法示例](../03_algorithm_demo/02_classification/01_resnet18_py.md)）。

## 依赖安装

示例依赖 `pydev_demo/utils` 公共工具库与 `requirements.txt` 列出的包。若报 `ModuleNotFoundError`：

<DocScope products="RDK S600">

```bash
cd /app/pydev_demo && pip install -r requirements.txt --break-system-packages
```

</DocScope>

<DocScope products="RDK S100">

```bash
cd /app/pydev_demo && pip install -r requirements.txt
```

</DocScope>

## 注意事项

- Python 示例依赖上级 `utils` 目录，**必须在示例目录内运行**，单独拷贝脚本到别处会找不到 `utils`。
- `--break-system-packages`（S600）用于绕过 PEP 668 的外部环境保护；若用 venv 则无需此参数。

## 相关文档

- [ResNet18 (Python) 示例](../03_algorithm_demo/02_classification/01_resnet18_py.md)
- [模型获取与放置](./01_model_files.md)
- [C/C++ demo 编程指南](./02_c_cpp_build.md)
- [Python 推理 API](../../04_Simple_API/02_inference_api/01_python_api.md)
