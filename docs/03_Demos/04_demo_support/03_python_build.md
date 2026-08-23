---
title: "Python demo 编程指南"
sidebar_position: 3
description: "运行/二次开发板端 Python demo 的方法"
---

# Python demo 编程指南

板端 `/app/pydev_demo` 下的示例是 Python 脚本，**无需编译**，`cd` 进示例目录后直接 `python xxx.py` 运行。镜像预装 `hbm_runtime` 等 Python 包，多数示例开箱即跑。

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 前置条件

- 已通过 SSH 登录开发板（见 [远程登录](../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)）。
- Python 与 `hbm_runtime` 已随镜像预装。

## 运行示例

以 ResNet18 分类为例（板端路径见 [ResNet18 (Python)](../03_algorithm_demo/02_classification/01_resnet18_py.md)）：

```bash
cd /app/pydev_demo/classification_sample/resnet18
python resnet18.py
```

运行成功后，先打印模型描述，末尾输出 Top-5 分类结果：

```text
Top-5 Predictions:
zebra: 0.9983
cheetah, chetah, Acinonyx jubatus: 0.0004
impala, Aepyceros melampus: 0.0004
gazelle: 0.0003
prairie chicken, prairie grouse, prairie fowl: 0.0002
```

各示例的参数、运行命令见对应 demo 文档（[算法示例概述](../03_algorithm_demo/01_summary.md)）。

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

## 常见问题

### 运行示例报 ModuleNotFoundError

**现象**：运行 Python 示例时输出 `ModuleNotFoundError`。

**原因**：依赖包未安装或环境不满足。

**解决**：执行 `cd /app/pydev_demo && pip install -r requirements.txt`（S600 需加 `--break-system-packages`；使用 venv 时无需该参数）。

### 单独拷贝示例脚本后找不到 utils

**现象**：把单个脚本拷贝到别处运行，报找不到 `utils`。

**原因**：Python 示例依赖上级 `utils` 公共工具库目录。

**解决**：必须在示例目录内运行，不要单独拷贝脚本到其它位置。

### pip install 被 PEP 668 外部环境保护拦截

**现象**：S600 上 pip 安装依赖时报外部环境管理相关错误。

**原因**：PEP 668 的外部环境管理保护。

**解决**：安装命令加 `--break-system-packages` 绕过，或改用 venv。

## 相关文档

- [ResNet18 (Python) 示例](../03_algorithm_demo/02_classification/01_resnet18_py.md)
- [模型获取与放置](./01_model_files.md)
- [C/C++ demo 编程指南](./02_c_cpp_build.md)
- [Python 推理 API](../../04_Simple_API/02_inference_api/02_python_api.md)
