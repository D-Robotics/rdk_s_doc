---
sidebar_position: 4
id: python-api
title: Python 接口手册
sidebar_label: 4.1 Python 接口
---
# 4.2 简介（Overview）
hbm_runtime 是基于 pybind11 的 Python 绑定接口，用于访问和操作底层 libhbucp / libdnn C++ 库，提供高性能的神经网络模型加载与推理能力。

该接口封装了底层模型运行时细节，使 Python 用户能够方便地加载单个或多个神经网络模型，查询并管理模型的输入/输出元信息，并灵活执行推理操作。接口支持多种输入数据格式，并在必要时自动将输入转换为 C 连续（C-contiguous）存储，以保证底层访问正确性与效率。

此外，新版接口在推理阶段会在 C++ 侧释放 Python GIL，使 Python 多线程可并发调用 run()；对多模型推理场景，底层会自动使用多线程并行调度各模型推理任务，以提升吞吐。

### 适用场景
- 在 Python 环境中快速集成和调用 hbm_runtime 运行时能力。
- 机器人视觉、智能边缘计算等对推理效率和调度灵活性有较高要求的应用。
- 需要同时加载和管理多个模型，并在不同推理调用中按需配置任务调度参数（优先级/核心绑定/设备 ID 等）的场景。
- 需要查询模型编译期 BPU 相关信息（例如编译期 BPU core 数）以辅助运行时资源配置与一致性检查的场景。

### 关键特性
- 多模型支持
  - 支持加载单个模型或多个模型组成的模型组；每个模型均可独立获取输入/输出元信息并进行推理。
  - run() 支持对多模型输入进行一次性推理，并按模型名返回结果（即使只跑单个模型也返回 `{model_name: {...}}` 的嵌套结构）。
- 灵活输入格式
  - 支持单输入（numpy.ndarray）；
  - 支持单模型多输入字典（Dict[str, np.ndarray]，key 为 input tensor name）；
  - 支持多模型多输入结构（Dict[str, Dict[str, np.ndarray]]，外层 key 为 model name，内层 key 为 input tensor name）。
  - 所有输入均自动检查是否为 C 连续内存格式，必要时进行拷贝，以保证底层高效正确访问（非连续输入可能带来额外拷贝开销）。
- 调度参数配置：默认参数 + 单次调用覆盖（run-local）
  - 支持通过 set_scheduling_params(...) 设置模型级默认调度参数（持久化在 runtime 内部，可多次复用）。
  - 同时支持在每次 run() 调用时，通过可选参数对调度进行单次覆盖（run-time overrides），覆盖规则为：run() 参数优先于默认参数，且该覆盖仅作用于本次调用，不影响其他线程/其他 run() 调用。
- 多线程推理能力
  - Python 多线程并发调用 run()：推理阶段在 C++ 内部释放 GIL，使多个 Python 线程可同时发起推理调用。
  - 多模型并行推理：当输入为多模型结构时，底层会为每个模型启动线程并行执行推理任务（multi-threaded launch），在多核 BPU 系统上可提升吞吐；单模型场景则仅对应一个推理线程。

## 安装说明（Installation）
本模块 hbm_runtime 是基于 C++ 实现的高性能推理运行时 Python 接口，依赖 pybind11 和地平线提供的底层推理库（如 libdnn, libhbucp 等）。支持通过系统 DEB 包（.deb） 的方式进行安装，适用于 Python 3.10 及以上版本。
### 系统依赖
| 依赖项       | 最低版本  | 说明                                                   |
|------------|-----------|--------------------------------------------------------|
| Python     | ≥ 3.10    | 推荐使用 Python 3.10                                   |
| pip        | ≥ 22.0    | 安装 wheel 包所需                                      |
| pybind11   | 任意      | 构建时使用，安装包时不需要依赖                         |
| scikit-build-core | ≥ 0.7 | 构建 wheel 包时使用（仅源码构建）                    |
| 地平线基础库 | 根据平台 | 如 libdnn.so、libucp.so 等，通常由 BSP 提供           |

### 构建wheel包
构建wheel包的方式有三种下面分别介绍。
#### 安装deb时构建
在hobot-dnn包的安装过程中添加了hbm_runtime的wheel构建，deb包安装完成后就会生成hbm-runtime的whl包。
  ```bash
  #通过源安装
  sudo apt-get install hobot-dnn

  #通过本地deb包安装（注意不同时间编译的包名称，以实际情况为准）
  dpkg -i hobot-dnn_4.0.4-20250909195426_arm64.deb

  #安装完成后可在板端的/tmp目录下找到wheel包
  ls /tmp

  #注意不同版本号whl包名称不同，xxx代表版本
  #hbm_runtime-x.x.x-cp310-cp310-manylinux_2_34_aarch64.whl
  ```

#### 编译系统软件时构建
在系统软件的镜像编译时会安装hobot-dnn的deb，安装的过程中会构建hbm-runtime的whl包，并转存到`out/product/deb_packages`目录
  ```bash
  sudo ./pack_image.sh

  ls out/product/deb_packages

  #注意不同版本号whl包名称不同，xxx代表版本
  #hbm_runtime-x.x.x-cp310-cp310-manylinux_2_34_aarch64.whl
  ```

#### 在端侧构建
  ```bash
  #进入hbm_runtime的源码库
  cd /usr/hobot/lib/hbm_runtime

  #运行构建命令
  ./build.sh

  #查看构建好的wheel包
  ls dist/

  #注意不同版本号whl包名称不同，xxx代表版本
  #hbm_runtime-x.x.x-cp310-cp310-manylinux_2_34_aarch64.whl
  ```

### 安装方式

#### 使用 wheel 包
使用wheel 安装的方式有两种，选其一即可
- 通过本地 wheel 包安装
  - 找到通过“构建wheel包”小节中构建的whl文件。

  ```bash
  #示例：使用 pip 安装本地whl包(注意不同版本号whl包名称不同，xxx代表版本)
  pip install hbm_runtime-x.x.x-cp310-cp310-manylinux_2_34_aarch64.whl
  ```

- 从pypi源安装
  ```bash
  pip install hbm_runtime
  ```

#### 使用 .deb 包安装
  使用deb安装的方式有两种，选其一即可
- 通过本地 DEB 包安装
  ```bash
  # 示例：安装 DEB 包（注意不同时间编译的包名称，以实际情况为准）
  sudo dpkg -i hobot-dnn_4.0.2-20250714201215_arm64.deb
  ```

- 通过apt源安装

  ```bash
  sudo apt-get install hobot-dnn
  ```

- 常见问题
  - 如果 .deb 安装后文件未生效，检查是否有其他依赖阻止其覆盖（如已有老版本 hobot-spdev）。
  - 可使用 dpkg -L hobot-dnn 查看文件是否成功部署。



### 卸载说明
- 卸载 pip 安装的包：
  ```bash
  pip uninstall hbmruntime
  ```

- 卸载 .deb 安装的包：
  ```bash
  sudo apt remove hobot-dnn
  ```

## 快速开始（Quick Start）
  本节介绍如何使用hbm_runtime进行模型加载和推理。只需几行代码，即可运行模型并获取输出结果。
### 环境准备
  请确保已正确安装 HBMRuntime（详见[安装说明](#安装说明installation)），并已具备模型文件 hbm 模型。
### 示例
#### 单线程推理
##### 单线程单模型单输入推理
适用于模型只有一个输入张量的情况。
```python
import numpy as np
from hbm_runtime import HB_HBMRuntime

# 加载模型
model = HB_HBMRuntime("/opt/hobot/model/s600/basic/lanenet256x512.hbm")

# 获取模型名与输入名
model_name = model.model_names[0]
input_name = model.input_names[model_name][0]  # 假设模型只有一个输入

# 获取该输入对应的 shape
input_shape = model.input_shapes[model_name][input_name]

# 构造 numpy 输入
input_tensor = np.ones(input_shape, dtype=np.float32)

# 执行推理
outputs = model.run(input_tensor)

# 获取输出结果
output_array = outputs[model_name]
print("Output:", output_array)
```
##### 单线程单模型多输入推理
适用于模型有多个输入张量的情况。
```python
import numpy as np
from hbm_runtime import HB_HBMRuntime

hb_dtype_map = {
    "U8": np.uint8,
    "S8": np.int8,
    "F32": np.float32,
    "F16": np.float16,
    "U16": np.uint16,
    "S16": np.int16,
    "S32": np.int32,
    "U32": np.uint32,
    "BOOL8": np.bool_,
}

# 加载模型
model = HB_HBMRuntime("/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm")

# 获取模型名（假设只加载了一个模型）
model_name = model.model_names[0]

# 准备输入名和 shape
input_names = model.input_names[model_name]
input_shapes = model.input_shapes[model_name]
input_dtypes = model.input_dtypes[model_name]

# 构造输入字典
input_tensors = {}
for name in input_names:
    shape = input_shapes[name]
    np_dtype = hb_dtype_map.get(input_dtypes[name].name, np.float32)  # fallback
    input_tensors[name] = np.ones(shape, dtype=np_dtype)

# 可选：指定推理优先级和 BPU 设备
priority = {model_name: 5}
bpu_cores = {model_name: [0]}

model.set_scheduling_params(
    priority=priority,
    bpu_cores=bpu_cores
)

# 执行推理，可选指定优先级和 BPU 核
results = model.run(input_tensors)

# 输出结果
for output_name, output_data in results[model_name].items():
    print(f"Output: {output_name}, shape={output_data.shape}")
```
##### 单线程多模型多输入推理
适用于多模型有多个输入张量的情况，注意这里的多模型可以是多个 HBM 文件，也可以是单个 HBM 文件里面包含多个模型。
```python
"""Multi-model inference quick start."""
import numpy as np
from hbm_runtime import HB_HBMRuntime

MODEL_PATHS = [
    "/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm",
    "/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm",
]

DTYPE_MAP = {
    "U8": np.uint8, "S8": np.int8,
    "F16": np.float16, "F32": np.float32,
}

# Load models
rt = HB_HBMRuntime(MODEL_PATHS)

# Build inputs from model metadata
inputs = {
    m: {
        inp: np.random.rand(*rt.input_shapes[m][inp]).astype(
            DTYPE_MAP.get(rt.input_dtypes[m][inp].name, np.float32)
        )
        for inp in rt.input_names[m]
    }
    for m in rt.model_names
}

# Optional: default scheduling params
rt.set_scheduling_params(
    priority={m: 5 for m in rt.model_names},
    bpu_cores={m: [0] for m in rt.model_names},
)

# Run inference (multi-model, parallel internally)
outputs = rt.run(inputs)

# Print results
for m, outs in outputs.items():
    print(f"[{m}]")
    for name, arr in outs.items():
        print(f"  {name}: {arr.shape}, {arr.dtype}")
```

#### 多线程推理
##### 多线程单模型单输入推理
适用于模型只有一个输入张量的情况。
```python
import threading
import numpy as np
from hbm_runtime import HB_HBMRuntime

# Load model
model = HB_HBMRuntime("/opt/hobot/model/s600/basic/asr.hbm")

model_name = model.model_names[0]
input_name = model.input_names[model_name][0]
input_shape = model.input_shapes[model_name][input_name]

# Shared input (read-only)
input_tensor = np.ones(input_shape, dtype=np.float32)

def worker(core_id: int):
    outputs = model.run(
        input_tensor,
        model_name=model_name,
        priority={model_name: 5},
        bpu_cores={model_name: [core_id]},
        custom_id={model_name: core_id},  # optional
    )
    # Print minimal info
    outs = outputs[model_name]
    first_name, first_arr = next(iter(outs.items()))
    print(f"[T{core_id}] {first_name}: shape={first_arr.shape}, dtype={first_arr.dtype}")

threads = [threading.Thread(target=worker, args=(i,)) for i in range(4)]
for t in threads: t.start()
for t in threads: t.join()
```
##### 多线程单模型多输入推理
适用于模型有多个输入张量的情况。
```python
import threading
import numpy as np
from hbm_runtime import HB_HBMRuntime

hb_dtype_map = {
    "U8": np.uint8, "S8": np.int8,
    "F16": np.float16, "F32": np.float32,
    "U16": np.uint16, "S16": np.int16,
    "U32": np.uint32, "S32": np.int32,
    "BOOL8": np.bool_,
}

# Load single model
model = HB_HBMRuntime("/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm")
model_name = model.model_names[0]

# Build input tensors (shared, read-only)
input_tensors = {
    name: np.ones(
        model.input_shapes[model_name][name],
        dtype=hb_dtype_map.get(model.input_dtypes[model_name][name].name, np.float32)
    )
    for name in model.input_names[model_name]
}

def worker(core_id: int):
    results = model.run(
        input_tensors,
        model_name=model_name,
        priority={model_name: 5},
        bpu_cores={model_name: [core_id]},
        custom_id={model_name: core_id},   # optional, for tracing
    )

    out_name, out_arr = next(iter(results[model_name].items()))
    print(f"[T{core_id}] {out_name}: {out_arr.shape}, {out_arr.dtype}")

# Launch 4 threads, bind to BPU cores 0~3
threads = [threading.Thread(target=worker, args=(i,)) for i in range(4)]
for t in threads: t.start()
for t in threads: t.join()
```
##### 多线程多模型多输入推理
```python
"""4-thread demo: each thread runs inference on a dedicated BPU core."""
import threading
import numpy as np
from hbm_runtime import HB_HBMRuntime

MODEL_PATHS = [
    "/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm",
    "/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm",
]

DTYPE_MAP = {
    "U8": np.uint8, "S8": np.int8,
    "F16": np.float16, "F32": np.float32,
}

rt = HB_HBMRuntime(MODEL_PATHS)

# Build one shared input package (read-only in each thread)
inputs = {
    m: {
        inp: np.random.rand(*rt.input_shapes[m][inp]).astype(
            DTYPE_MAP.get(rt.input_dtypes[m][inp].name, np.float32)
        )
        for inp in rt.input_names[m]
    }
    for m in rt.model_names
}

def worker(core_id: int):
    # Per-run scheduling override: bind this run to a specific BPU core
    outputs = rt.run(
        inputs,
        priority={m: 5 for m in rt.model_names},
        bpu_cores={m: [core_id] for m in rt.model_names},
        custom_id={m: core_id for m in rt.model_names},  # optional, for tracing
    )
    # Print one line per model to keep it simple
    for m, outs in outputs.items():
        first_out = next(iter(outs.values()))
        print(f"[T{core_id}][{m}] first_out: {first_out.shape}, {first_out.dtype}")

threads = [threading.Thread(target=worker, args=(i,)) for i in range(4)]
for t in threads: t.start()
for t in threads: t.join()
```

### 常见问题
| 问题                     | 说明                                                       |
|------------------------|------------------------------------------------------------|
| 模型名称如何获取？       | 可通过 `model.model_names` 查看加载的模型名列表。          |
| 输入维度/类型如何确认？  | 使用 `model.input_shapes`、`model.input_dtypes`。           |
| 如何确认 BPU 核心分配？  | 使用 bpu_cores 参数指定 [0, 1, 2, 3]，具体需看硬件的支持情况。|

  如需更复杂用法（多输入模型、量化参数读取等），请参考[API部分](#模块类函数说明api-reference)。

## 模块/类/函数说明（API Reference）
Python 模块 hbm_runtime 是通过 PyBind11 封装的地平线 HBM 模型推理接口，基于底层 libdnn 和 libhbucp 实现。提供统一封装的模型加载、输入输出信息查询、推理执行等功能，支持多模型加载、多输入推理、指定推理模型，BPU Core、推理任务优先级等。

### 枚举类型
#### hbDNNDataType
##### 张量数据类型枚举：
- S4：4-bit signed
- U4：4-bit unsigned
- S8：8-bit signed
- U8：8-bit unsigned
- F16：16-bit float
- S16：16-bit signed
- U16：16-bit unsigned
- F32：32-bit float
- S32：32-bit signed
- U32：32-bit unsigned
- F64：64-bit float
- S64：64-bit signed
- U64：64-bit unsigned
- BOOL8：8-bit bool 类型
- MAX：最大值（保留字段）

##### 示例
```python
from hbm_runtime import hbDNNDataType
print(hbDNNDataType.F32)  # 输出: hbDNNDataType.F32
```
#### hbDNNQuantiType
##### 张量量化类型枚举：
- NONE：非量化类型
- SCALE：线性缩放量化（scale + zero_point）
##### 示例
```python
from hbm_runtime import hbDNNQuantiType
print(hbDNNQuantiType.SCALE)  # 输出: hbDNNQuantiType.SCALE
```

### 类说明
#### HB_HBMRuntime
模型运行时类，加载一个或多个 HBM 模型文件，并提供推理执行接口。
##### 构造函数
- 函数签名
    ```python
    HB_HBMRuntime(model_file: str)
    HB_HBMRuntime(model_files: List[str])
    ```
- 参数说明

    | 参数名       | 类型         | 说明                                 |
    |------------|--------------|--------------------------------------|
    | model_file | str          | HBM 模型文件路径                     |
    | model_files| List[str]    | 多个 HBM 模型文件路径（用于多模型） |
- 返回值

  类对象
- 示例
    ```python
    from hbm_runtime import HB_HBMRuntime

    model = HB_HBMRuntime("model.hbm")
    # 或加载多个模型：
    model = HB_HBMRuntime(["model1.hbm", "model2.hbm"])
    ```

##### 属性说明
以下所有属性均为只读。
- version: str
  - 功能说明：
    - 获取库版本号。
  - 结构说明：
    - str：版本号字符串。
  - 示例：
    ```python
    print("版本:", HB_HBMRuntime.version)
    ```
- model_names: List[str]
  - 功能说明：
    - 加载的模型名称列表。
  - 结构说明：
    - List[str]: 模型名称列表
  - 示例：
    ```python
    print(model.model_names)
    # 输出：['model_1', 'model_2']
    ```
- model_count: int
  - 功能说明：
    - 加载的模型数量。
  - 结构说明：
    - int :加载的模型数量。
  - 示例：
    ```python
    print(model.model_count)
    # 输出：2
    ```
- model_descs: Dict[str, str]
  - 功能说明：
    - 每个模型的描述信息（来自模型内嵌的备注）。
  - 结构说明：
    - Dict[str, str]: 键为模型名称，值为模型的整体描述信息，通常来自编译器。
  - 示例：
    ```python
    #打印所有模型的描述信息
    print(model.model_descs)
    # 输出：{'yolov5x_672x672_nv12': 'Image classification model based on ResNet-18.'}
    ```

- hbm_descs: Dict[str, str]
  - 功能说明：
    - 每个 HBM 文件中的备注信息。
  - 结构说明：
    - Dict[str, str]：键为 .hbm 文件名（例如 "resnet18"），值为 HBM 文件中的注释或元信息字符串。
  - 示例：
    ```python
    #打印所有模型文件的描述信息
    print(model.hbm_descs)
    # 输出：{'/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm': 'xxx'}
    ```
- compile_bpu_core_num: Dict[str, int]
  - 功能说明：
    - 获取各模型在编译阶段指定的 BPU core 数量。该信息反映模型在 HBM 编译时所使用的 BPU 核配置，可用于运行时进行资源规划或与运行时 bpu_cores 参数设置进行一致性校验。
  - 结构说明：
    - Dict[str, int]：
      - key：模型名称（model name）
      - value：该模型在编译期指定的 BPU core 数
  - 示例：
    ```bash
    # 查询模型编译期 BPU core 数
    print(model.compile_bpu_core_num)

    # 示例输出
    # {'model_1': 1, 'model_2': 2}
    ```
- input_counts: Dict[str, int]
  - 功能说明：
    - 每个模型输入张量数量。
  - 结构说明：
    - Dict[str, int]：键为模型名称，值为该模型的输入张量个数。
  - 示例：
    ```python
    #打印所有模型文件的描述信息
    print(model.input_counts)
    # 输出：{'yolov5x_672x672_nv12': 2}
    ```
- input_names: Dict[str, List[str]]
  - 功能说明：
    - 每个模型的输入张量名称列表。
  - 结构说明：
    - 外层 Dict[str, ...]：键为模型名称。
    - 内层 List[str]：为该模型所有输入张量的名称列表。
  - 示例：
    ```python
    print(model.input_names)
    # 输出：{'yolov5x_672x672_nv12': ['data_y', 'data_uv']}
    ```
- input_descs: Dict[str, Dict[str, str]]
  - 功能说明：
    - 每个输入张量的描述
  - 结构说明：
    - 外层 Dict[str, ...]：模型名称。
    - 内层 Dict[str, str]：键为输入张量名称，值为描述信息。
  - 示例：
    ```python
    #打印所有模型文件的描述信息
    print(model.input_descs)
    # 输出：{'yolov5x_672x672_nv12': {'data_uv': 'xxx', 'data_y': 'xxx'}}
    ```
- input_shapes: Dict[str, Dict[str, List[int]]]
  - 功能说明：
    -  每个输入张量的 shape
  - 结构说明：
    - 外层 Dict[str, ...]：模型名称。
    - 内层 Dict[str, List[int]]：键为输入名，值为输入张量的维度（形状）。
  - 示例：
    ```python
    model.input_shapes
    # 输出：{'yolov5x_672x672_nv12': {'data_uv': [1, 336, 336, 2], 'data_y': [1, 672, 672, 1]}}
    ```
- input_dtypes: Dict[str, Dict[str, hbDNNDataType]]
  - 功能说明：
    -  每个输入张量的数据类型
  - 结构说明：
    - 外层 Dict[str, ...]：模型名称。
    - 内层 Dict[str, hbDNNDataType]：键为输入张量名，值为数据类型（例如 F32、U8）。
  - 示例：
    ```python
    print(model.input_dtypes)
    # 输出：{'yolov5x_672x672_nv12': {'data_uv': <hbDNNDataType.U8: 3>, 'data_y': <hbDNNDataType.U8: 3>}}
    ```

- input_quants: Dict[str, Dict[str, QuantParams]]
  - 功能说明：
    - 提供每个模型所有输入张量的量化参数信息。用于支持量化模型的前处理计算，或者了解张量的量化方式。
  - 结构说明：
    - 外层 Dict[str, ...]：键是模型名称（model name），例如 "resnet50";
    - 内层 Dict[str, QuantParams]：键是输入张量名，值为 QuantParams 实例；
    - QuantParams 类属性：
      - scale: np.ndarray — 量化比例因子，通常为浮点数数组；
      - zero_point: np.ndarray — 零点，用于对称/非对称量化偏移；
      - quant_type: hbDNNQuantiType — 量化类型枚举值（如 SCALE、NONE）；
      - axis: int — 如果是通道量化，则该字段表示在哪个轴上量化。
  - 示例：
    ```python
    quanti_info = model.input_quants
    for model, inputs in quanti_info.items():
        print(f"{model}:")
        for name, info in inputs.items():
            print(f"  {name}:")
            print(f"    quant_type: {info.quant_type.name}")
            print(f"    quantize_axis: {info.axis}")
            print(f"    scale_data: {info.scale.tolist()}")
            print(f"    zero_point_data: {info.zero_point.tolist()}")
    ```
- input_strides: Dict[str, Dict[str, List[int]]]
  - 功能说明：
    - 每个输入张量的 stride 步长信息
  - 结构说明：
    - 外层 Dict[str, ...]：模型名称。
    - 内层Dict[str, List[int]]：键为输入名，值为输入张量的stride信息。
  - 示例：
    ```python
    print(model.input_strides)
    # 输出：{'yolov5x_672x672_nv12': {'data_uv': [-1, -1, 2, 1], 'data_y': [-1, -1, 1, 1]}}
    ```
    注意：stride的详细含义可参考[OE文档](http://j6.doc.oe.hobot.cc/3.0.31/guide/ucp/runtime/bpu_sdk_api/data_structure/hbDNNTensorProperties.html)中libdnn库中的描述；
- output_counts: Dict[str, int]
  - 功能说明：
    - 每个模型输出张量数量。
  - 结构说明：
    - Dict[str, int]：键为模型名称，值为该模型的输出张量个数。
  - 示例：
    ```python
    print(model.output_counts)
    # 输出：{'yolov5x_672x672_nv12': 3}
    ```
- output_names: Dict[str, List[str]]
  - 功能说明：
    - 每个模型的输出张量名称列表。
  - 结构说明：
    - 外层 Dict[str, ...]：键为模型名称。
    - 内层 List[str]：为该模型所有输出张量的名称列表。
  - 示例：
    ```python
    print(model.output_names)
    # 输出：{'yolov5x_672x672_nv12': ['output', '1310', '1312']}
    ```
- output_descs: Dict[str, Dict[str, str]]
  - 功能说明：
    - 每个输出张量的描述。
  - 结构说明：
    - 外层 Dict[str, ...]：模型名称。
    - 内层 Dict[str, str]：键为输出张量名称，值为描述信息。
  - 示例：
    ```python
    print(model.output_descs)
    # 输出：{'yolov5x_672x672_nv12': {'1310': 'xxx', '1312': 'xxx', 'output': 'xxx'}}
    ```
- output_shapes: Dict[str, Dict[str, List[int]]]
  - 功能说明：
    -  每个输出张量的 shape。
  - 结构说明：
    - 外层 Dict[str, ...]：模型名称。
    - 内层 Dict[str, List[int]]：键为输出名，值为输出张量的维度（形状）。
  - 示例：
    ```python
    print(model.output_shapes)
    # 输出：{'yolov5x_672x672_nv12': {'1310': [1, 42, 42, 255], '1312': [1, 21, 21, 255], 'output': [1, 84, 84, 255]}}
    ```
- output_dtypes: Dict[str, Dict[str, List[int]]]
  - 功能说明：
    -  每个输出张量的数据类型。
  - 结构说明：
    - 外层 Dict[str, ...]：模型名称。
    - 内层 Dict[str, hbDNNDataType]：键为输出张量名，值为数据类型（例如 F32、U8）。
  - 示例：
    ```python
    print(model.output_dtypes)
    # 输出：{'yolov5x_672x672_nv12': {'1310': <hbDNNDataType.S32: 8>, '1312': <hbDNNDataType.S32: 8>, 'output': <hbDNNDataType.S32: 8>}}
    ```
- output_quants: Dict[str, Dict[str, QuantParams]]
  - 功能说明：
    - 提供每个模型所有输出张量的量化参数信息。用于支持量化模型的后处理计算（如将 int8 数据还原为 float32），或者了解张量的量化方式（scale-based 等）。
  - 结构说明：
    - 外层 Dict[str, ...]：键是模型名称（model name），例如 "resnet50";
    - 内层 Dict[str, QuantParams]：键是输出张量名，值为 QuantParams 实例；
    - QuantParams 类属性：
      - scale: np.ndarray — 量化比例因子，通常为浮点数数组；
      - zero_point: np.ndarray — 零点，用于对称/非对称量化偏移；
      - quant_type: hbDNNQuantiType — 量化类型枚举值（如 SCALE、NONE）；
      - axis: int — 如果是通道量化，则该字段表示在哪个轴上量化。
  - 示例：
    ```python
    output_quanti = model.output_quants
    for model, outputs in output_quanti.items():
        print(f"{model}:")
        for name, info in outputs.items():
            print(f"  {name}:")
            print(f"    quant_type: {info.quant_type.name}")
            print(f"    quantize_axis: {info.axis}")
            print(f"    scale_data: {info.scale}")
            print(f"    zero_point_data: {info.zero_point}")
    ```
- output_strides: Dict[str, Dict[str, List[int]]]
  - 功能说明：
    -  每个输出张量的 stride 步长信息
  - 结构说明：
    - 外层 Dict[str, ...]：模型名称。
    - 内层Dict[str, List[int]]：键为输出名，值为输出张量的stride信息。
  - 示例：
    ```python
    print(model.output_strides)
    # 输出：{'yolov5x_672x672_nv12': {'1310': [1806336, 43008, 1024, 4], '1312': [451584, 21504, 1024, 4], 'output': [7225344, 86016, 1024, 4]}}
    ```
  注意：stride的详细含义可参考[OE文档](http://j6.doc.oe.hobot.cc/3.0.31/guide/ucp/runtime/bpu_sdk_api/data_structure/hbDNNTensorProperties.html)中libdnn库中的描述；

- sched_params: Dict[str, SchedParam]
  - 功能说明：
    sched_params是用于获取当前所有模型的调度参数（Scheduling Parameters），包括每个模型的：
    - 优先级（priority）
    - 自定义 ID（customId）
    - 分配的 BPU 核心（bpu_cores）
    - 所属设备 ID（deviceId）
    这些调度参数用于影响模型在硬件上运行的方式，尤其在多模型部署或多核设备上尤为重要。
  - 结构说明：
    - 外层 Dict[str, ...]：模型名称。
    - 内层SchedParam ：为SchedParam 类的实例，包含该模型的调度参数priority、customId、bpu_cores和deviceId；
      ```python
      {
          "模型名": SchedParam(
              priority: int,
              customId: int,
              bpu_cores: List[int],
              deviceId: int
          )
      }
      ```
  - 示例：
    ```python
    params = model.sched_params
    for name, sched in params.items():
        print(f"Model: {name}")
        print(f"  priority: {sched.priority}")
        print(f"  customId: {sched.customId}")
        print(f"  bpu_cores: {sched.bpu_cores}")
        print(f"  deviceId: {sched.deviceId}")
    # 输出：
    # Model: yolo12s_detect_nashe_640x640_nv12
    #   priority: 10
    #   customId: 0
    #   bpu_cores: [0]
    #  deviceId: 0
    # Model: yolov5nu_detect_nashe_640x640_nv12
    #   priority: 66
    #   customId: 0
    #   bpu_cores: [-1]
    #   deviceId: 0
    ```
    注意：bpu_cores返回-1表示由调度器自动分配；
##### 配置函数
- set_scheduling_params
  - 函数签名
    ```python
    def set_scheduling_params(
        priority: Optional[Dict[str, int]] = None,
        bpu_cores: Optional[Dict[str, List[int]]] = None,
        custom_id: Optional[Dict[str, int]] = None,
        device_id: Optional[Dict[str, int]] = None
    ) -> None
    ```
  - 功能说明

    设置模型的默认调度参数（priority / bpu_cores / custom_id / device_id）。该函数用于配置 HB_HBMRuntime 实例级别的持久化调度参数，作为后续推理调用的默认值。

    与 run() 调度参数的关系说明：
    - set_scheduling_params() 设置的是**模型级默认调度参数**，会保存在运行时实例中，持续生效。
    - run() 接口同样支持通过参数传入调度配置，用于**单次推理调用的临时覆盖（run-local）**。
    - 当 run() 调用中显式传入调度参数时，其优先级**高于** set_scheduling_params() 中设置的默认值。
    - run() 中传入的调度参数**仅对当前一次推理调用生效**，不会修改或影响已设置的默认调度参数。
    - 若 run() 中未传入某一调度字段，则该字段将自动使用 set_scheduling_params() 中配置的默认值。

    优先级关系：`run() 参数  >  set_scheduling_params() 默认值  >  内置初始默认值`

  - 参数说明

    | 参数名      | 类型                             | 说明                                                                 |
    |-------------|----------------------------------|----------------------------------------------------------------------|
    | priority    | 可选字典（模型名 -> int）        | 设置每个模型的调度优先级，范围通常为 0～255，数值越高优先级越高       |
    | bpu_cores   | 可选字典（模型名 -> List[int]）  | 指定模型绑定的 BPU 核心索引列表，默认表示自动分配，具体需看硬件支持情况 |
    | custom_id   | 可选字典（模型名 -> int）        | 自定义优先级，例如：时间戳、frame id 等，数值越小优先级越高。优先级：priority > customId。|
    | device_id   | 可选字典（模型名 -> int）        | 指定模型运行在哪个设备上                                             |

  - 返回值

    无（None）

  - 示例：
    ```python
    # 设置模型级默认调度参数
    model.set_scheduling_params(
        priority={"model1": 200, "model2": 100},
        bpu_cores={"model1": [0, 1], "model2": [0]}
    )

    # 验证默认参数是否生效
    params = model.sched_params
    print(params["model1"].priority)    # 输出: 200
    print(params["model1"].bpu_cores)   # 输出: [0, 1]

    # 在 run() 中进行单次调用覆盖（不会修改默认值）
    outputs = model.run(
        inputs,
        priority={"model1": 50}          # 仅本次调用生效
    )

    # 默认参数仍然保持不变
    print(model.sched_params["model1"].priority)  # 仍为: 200
    ```

##### 推理执行函数

run() 提供 3 种输入形态（单输入 / 单模型多输入 / 多模型多输入），并且每次调用都可以单独传入调度参数：priority / bpu_cores / custom_id / device_id。

**多线程支持说明（重要）**

- 多模型推理的并行方式：当使用 `run(multi_input_tensors, ...)` 进行多模型推理时，底层会为 `multi_input_tensors` 中的每个模型创建一个 C++ 线程，并行执行各自的推理流程。
- Python 多线程可并发调用：可以实现"Python 多线程并发调用 run + 底层多模型并行推理"的吞吐提升（实际效果与 BPU 核数、模型配置、系统负载有关）。
- 每次调用可设置自己的调度参数：run() 的 priority/bpu_cores/custom_id/device_id 属于本次调用的临时覆盖，不同线程/不同调用可以传入不同调度参数，互不影响。

- run（单模型 · 单输入）
  - 函数签名
    ```python
    run(
        input_tensor: np.ndarray,
        model_name: Optional[str] = None,
        priority: Optional[Dict[str, int]] = None,
        bpu_cores: Optional[Dict[str, List[int]]] = None,
        custom_id: Optional[Dict[str, int]] = None,
        device_id: Optional[Dict[str, int]] = None,
    ) -> Dict[str, Dict[str, np.ndarray]]
    ```
  - 功能说明

    适用于单模型、单输入的推理场景。
    - 当仅加载一个模型时 `model_name` 可省略；当加载多个模型时**必须指定** `model_name`（否则报错）。
    - 若选中的模型输入数不为 1，会直接报错（该重载不适用）。
    - 会校验输入 dtype 与模型输入类型一致；校验 shape 与模型输入一致（支持模型维度为 -1 的动态维度按实际输入补全）。
    - 推理返回结构为：`{model_name: {output_name: np.ndarray}}`

  - 参数说明

    | 参数名       | 类型                             | 说明                                                                |
    |--------------|----------------------------------|---------------------------------------------------------------------|
    | input_tensor | np.ndarray                       | 单输入张量，仅用于单模型且单输入的推理场景。张量 shape 必须与模型对应输入一致。 |
    | model_name   | str（可选）                      | 指定模型名称（若为单个模型可省略，否则需指定）                       |
    | priority     | 可选字典（模型名 -> int）        | 本次调用的推理优先级（临时覆盖，不影响默认值）                       |
    | bpu_cores    | 可选字典（模型名 -> List[int]）  | 本次调用绑定的 BPU 核心索引列表                                      |
    | custom_id    | 可选字典（模型名 -> int）        | 本次调用的自定义优先级                                               |
    | device_id    | 可选字典（模型名 -> int）        | 本次调用指定的设备 ID                                                |

  - 返回值
    - 类型：Dict[str, Dict[str, np.ndarray]]
    - 外层 key：模型名称
    - 内层 key：输出张量名称
    - value：对应输出 numpy 数组（零拷贝封装 device buffer，随数组生命周期自动释放）
  - 示例：参考快速开始章节，单线程单模型单输入推理部分。

- run（单模型 · 多输入）
  - 函数签名
    ```python
    run(
        input_tensors: Dict[str, np.ndarray],
        model_name: Optional[str] = None,
        priority: Optional[Dict[str, int]] = None,
        bpu_cores: Optional[Dict[str, List[int]]] = None,
        custom_id: Optional[Dict[str, int]] = None,
        device_id: Optional[Dict[str, int]] = None,
    ) -> Dict[str, Dict[str, np.ndarray]]
    ```
  - 功能说明

    适用于单模型、多输入的推理场景。
    - `input_tensors` 的 key 必须是该模型真实存在的输入名（否则报错）。
    - 当仅加载一个模型时 `model_name` 可省略；当加载多个模型时**必须指定** `model_name`（否则报错）。
    - 每个输入张量都会检查是否为 C 连续内存，不满足时会自动拷贝。

  - 参数说明

    | 参数名        | 类型                             | 说明                                                              |
    |---------------|----------------------------------|-------------------------------------------------------------------|
    | input_tensors | Dict[str, np.ndarray]            | 多输入张量，键为输入张量名称，值为对应的 NumPy 数组。              |
    | model_name    | str（可选）                      | 指定模型名称（若为单个模型可省略，否则需指定）                     |
    | priority      | 可选字典（模型名 -> int）        | 本次调用的推理优先级（临时覆盖，不影响默认值）                     |
    | bpu_cores     | 可选字典（模型名 -> List[int]）  | 本次调用绑定的 BPU 核心索引列表                                    |
    | custom_id     | 可选字典（模型名 -> int）        | 本次调用的自定义优先级                                             |
    | device_id     | 可选字典（模型名 -> int）        | 本次调用指定的设备 ID                                              |

  - 返回值

    同上。

  - 示例：参考快速开始章节，单线程单模型多输入推理部分。

- run（多模型 · 多输入）
  - 函数签名
    ```python
    run(
        multi_input_tensors: Dict[str, Dict[str, np.ndarray]],
        model_name: Optional[str] = None,
        priority: Optional[Dict[str, int]] = None,
        bpu_cores: Optional[Dict[str, List[int]]] = None,
        custom_id: Optional[Dict[str, int]] = None,
        device_id: Optional[Dict[str, int]] = None,
    ) -> Dict[str, Dict[str, np.ndarray]]
    ```
  - 功能说明

    适用于多模型同时推理场景：外层 key 为模型名，内层为该模型的 输入名 -> numpy 数组。
    - 若**不指定** `model_name`：推理 `multi_input_tensors` 中提供的全部模型。
    - 若**指定** `model_name`：会仅保留该模型对应输入并执行推理（其余模型输入会被过滤掉）。
    - 多线程并行执行：底层会为每个模型创建一个线程并行推理，并在推理阶段释放 GIL，从而支持 Python 多线程并发调用时获得更高吞吐。

  - 参数说明

    | 参数名              | 类型                              | 说明 |
    |---------------------|-----------------------------------|------|
    | multi_input_tensors | Dict[str, Dict[str, np.ndarray]]  | 多模型推理，外层键为模型名称，内层是输入名 → 张量的映射。支持同时运行多个模型（每个模型可多输入）。 |
    | model_name          | str（可选）                       | 若指定，则只推理该模型；若不指定，则推理所有提供输入的模型 |
    | priority            | 可选字典（模型名 -> int）         | 本次调用的推理优先级（临时覆盖，不影响默认值）             |
    | bpu_cores           | 可选字典（模型名 -> List[int]）   | 本次调用绑定的 BPU 核心索引列表                            |
    | custom_id           | 可选字典（模型名 -> int）         | 本次调用的自定义优先级                                     |
    | device_id           | 可选字典（模型名 -> int）         | 本次调用指定的设备 ID                                      |

  - 返回值

    同上

  - 示例：参考快速开始章节，单线程多模型多输入推理部分。

- 异常说明
  - 若输入张量维度、类型与模型不匹配，会抛出 ValueError。
  - 若输入张量非连续（非 C-style），内部会自动 copy 一份连续张量。
  - 推理前需确保输入张量 shape 与 input_shapes 完全一致。
#### QuantParams 类
  张量量化参数对象。
##### 属性
- scale: numpy.ndarray，量化比例因子数组
- zero_point: numpy.ndarray，零点数组
- quant_type: hbDNNQuantiType 类型，表示量化模式
- axis: int，量化轴（若为 per-channel 量化）
##### 示例：
    ```python
    # 获取模型某个输出的量化参数
    tensor_qparams = model.output_quants[model_name][output_name]
    print("scale:", tensor_qparams.scale)
    print("zero_point:", tensor_qparams.zero_point)
    print("type:", tensor_qparams.quant_type)
    print("axis:", tensor_qparams.axis)
    ```

#### SchedParam 类
  模型调度参数对象，用于描述单个模型的默认调度状态（优先级、核心绑定等）。该对象通常用于读取当前模型的调度配置，而不是作为主要的配置入口。
##### 属性
- priority: Dict[str, int]

  模型推理任务的调度优先级，取值范围 0~255，数值越大优先级越高。

- customId: Dict[str, int]

  用户自定义标识（如 frame id、时间戳等），用于传递给底层调度器。优先级：priority > customId。

- bpu_cores: Dict[str, List[int]]

  模型绑定的 BPU core 列表；[-1] 表示 ANY，由调度器自动选择。S100 只能取 1，S600 取 0~3。

- deviceId: Dict[str, int]

  模型部署的设备 ID（多设备场景使用）。

##### 示例：
  ```python
  from hbm_runtime import HB_HBMRuntime

  runtime = HB_HBMRuntime("model.hbm")

  sched_params = runtime.sched_params   # Dict[str, SchedParam]
  for model_name, sp in sched_params.items():
      print(
          model_name,
          sp.priority,
          sp.customId,
          sp.bpu_cores,
          sp.deviceId
      )
  ```

## 注意事项
- 动态输入和输出未经测试，谨慎使用；
