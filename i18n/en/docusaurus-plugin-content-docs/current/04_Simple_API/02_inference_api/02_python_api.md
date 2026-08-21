---
sidebar_position: 2
id: python-api
title: "Python Inference API"
sidebar_label: Python Inference API
description: "hbm_runtime Python API: model loading, inference, scheduling parameters"
---
# Python Inference API

hbm_runtime is a pybind11-based Python binding API for accessing and operating the underlying libhbucp / libdnn C++ libraries, providing high-performance neural network model loading and inference capabilities.

This API encapsulates the low-level model runtime details, allowing Python users to conveniently load one or multiple neural network models, query and manage the models' input/output metadata, and perform inference operations flexibly. The API supports multiple input data formats and automatically converts inputs to C-contiguous storage when necessary, to guarantee the correctness and efficiency of low-level access.

In addition, the new API releases the Python GIL on the C++ side during inference, so that multiple Python threads can call run() concurrently. For multi-model inference scenarios, the runtime automatically uses multi-threaded parallel scheduling for the inference tasks of each model to improve throughput.

### Applicable Scenarios
- Quickly integrate and invoke the hbm_runtime runtime capabilities in a Python environment.
- Applications with high requirements on inference efficiency and scheduling flexibility, such as robotic vision and intelligent edge computing.
- Scenarios where multiple models need to be loaded and managed simultaneously, with task scheduling parameters (priority/core binding/device ID, etc.) configured per inference call as needed.
- Scenarios where compile-time BPU information of a model (e.g., the compile-time BPU core count) needs to be queried to assist runtime resource planning and consistency checks.

### Key Features
- Multi-model support
  - Supports loading a single model or a model group composed of multiple models; the input/output metadata of each model can be retrieved independently, and inference can be run on each of them.
  - run() supports one-shot inference over multi-model inputs and returns results keyed by model name (even when running a single model, the nested structure `{model_name: {...}}` is returned).
- Flexible input formats
  - Single input (numpy.ndarray);
  - Single-model multi-input dict (Dict[str, np.ndarray], keys are input tensor names);
  - Multi-model multi-input structure (Dict[str, Dict[str, np.ndarray]], outer keys are model names, inner keys are input tensor names).
  - All inputs are automatically checked for C-contiguous memory layout and copied when necessary to guarantee efficient and correct low-level access (non-contiguous inputs may incur extra copy overhead).
- Scheduling parameter configuration: default parameters + per-call override (run-local)
  - Supports setting model-level default scheduling parameters via set_scheduling_params(...) (persisted inside the runtime and reusable across calls).
  - Also supports overriding the scheduling per run() call via optional parameters (run-time overrides). The override rule is: run() parameters take precedence over the default parameters, and the override only applies to the current call, without affecting other threads / other run() calls.
- Multi-threaded inference capability
  - Concurrent run() calls from multiple Python threads: during inference the GIL is released inside the C++ layer, so that multiple Python threads can issue inference calls simultaneously.
  - Multi-model parallel inference: when the input is a multi-model structure, the runtime launches a thread for each model to run its inference task in parallel (multi-threaded launch), which can improve throughput on multi-core BPU systems; in the single-model scenario there is only one inference thread.

## Installation
The module hbm_runtime is a high-performance inference runtime Python API implemented in C++, depending on pybind11 and the underlying inference libraries provided by Horizon (such as libdnn, libhbucp, etc.). It supports installation via system DEB packages (.deb) and is compatible with Python 3.10 and later.
### System Dependencies
| Dependency   | Minimum Version | Description                                            |
|------------|-----------|--------------------------------------------------------|
| Python     | ≥ 3.10    | Python 3.10 is recommended                             |
| pip        | ≥ 22.0    | Required for installing wheel packages                 |
| pybind11   | any       | Used at build time; not required as a dependency at install time |
| scikit-build-core | ≥ 0.7 | Used when building wheel packages (source builds only) |
| Horizon base libraries | platform-dependent | e.g., libdnn.so, libhbucp.so, usually provided by the BSP |

### Building the Wheel Package
There are three ways to build the wheel package, introduced below respectively.
#### Build During deb Installation
During the installation of the hobot-dnn package, the wheel build of hbm_runtime is included. After the deb package installation completes, the hbm-runtime whl package will be generated.
  ```bash
  # Install from the repository
  sudo apt-get install hobot-dnn

  # Install from a local deb package (note that packages compiled at different times have different names; follow the actual situation)
  dpkg -i hobot-dnn_4.0.4-20250909195426_arm64.deb

  # After installation completes, the wheel package can be found in the /tmp directory on the board
  ls /tmp

  # Note that whl package names differ by version; xxx represents the version
  #hbm_runtime-x.x.x-cp310-cp310-manylinux_2_34_aarch64.whl
  ```

#### Build During System Software Compilation
When compiling the system software image, the hobot-dnn deb is installed; during that installation the hbm-runtime whl package is built and stored in the `out/product/deb_packages` directory
  ```bash
  sudo ./pack_image.sh

  ls out/product/deb_packages

  # Note that whl package names differ by version; xxx represents the version
  #hbm_runtime-x.x.x-cp310-cp310-manylinux_2_34_aarch64.whl
  ```

#### Build On the Device
  ```bash
  # Enter the hbm_runtime source repository
  cd /usr/hobot/lib/hbm_runtime

  # Run the build command
  ./build.sh

  # Check the built wheel package
  ls dist/

  # Note that whl package names differ by version; xxx represents the version
  #hbm_runtime-x.x.x-cp310-cp310-manylinux_2_34_aarch64.whl
  ```

### Installation Methods

#### Using the Wheel Package
There are two ways to install with wheel; choose either one
- Install from a local wheel package
  - Locate the whl file built in the "Building the Wheel Package" section above.

  ```bash
  # Example: install a local whl package with pip (note that whl package names differ by version; xxx represents the version)
  pip install hbm_runtime-x.x.x-cp310-cp310-manylinux_2_34_aarch64.whl
  ```

- Install from the pypi source
  ```bash
  pip install hbm_runtime
  ```

#### Installing with a .deb Package
There are two ways to install with deb; choose either one
- Install from a local DEB package
  ```bash
  # Example: install a DEB package (note that packages compiled at different times have different names; follow the actual situation)
  sudo dpkg -i hobot-dnn_4.0.2-20250714201215_arm64.deb
  ```

- Install from the apt source

  ```bash
  sudo apt-get install hobot-dnn
  ```

- FAQ
  - If files do not take effect after the .deb installation, check whether other dependencies prevent them from being overwritten (e.g., an old version of hobot-spdev already exists).
  - You can use dpkg -L hobot-dnn to verify whether the files were deployed successfully.



### Uninstallation
- Uninstall the pip-installed package:
  ```bash
  pip uninstall hbm_runtime
  ```

- Uninstall the .deb-installed package:
  ```bash
  sudo apt remove hobot-dnn
  ```

## Quick Start
This section introduces how to use hbm_runtime for model loading and inference. With just a few lines of code, you can run a model and get the output results.
### Environment Preparation
Please make sure that HBMRuntime is properly installed (see [Installation](#installation)) and that you have an hbm model file available.
### Examples
#### Single-threaded Inference
##### Single-threaded, Single-model, Single-input Inference
Applicable when the model has only one input tensor.
```python
import numpy as np
from hbm_runtime import HB_HBMRuntime

# Load the model
# Load the model (using a pre-installed S600 model as an example; replace with any .hbm path)
model = HB_HBMRuntime("/opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm")

# Get the model name and input name
model_name = model.model_names[0]
input_name = model.input_names[model_name][0]  # assume the model has only one input

# Get the shape corresponding to this input
input_shape = model.input_shapes[model_name][input_name]

# Construct the numpy input
input_tensor = np.ones(input_shape, dtype=np.float32)

# Run inference
outputs = model.run(input_tensor)

# Get the output result
output_array = outputs[model_name]
print("Output:", output_array)
```
##### Single-threaded, Single-model, Multi-input Inference
Applicable when the model has multiple input tensors.
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

# Load the model
model = HB_HBMRuntime("/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm")

# Get the model name (assuming only one model is loaded)
model_name = model.model_names[0]

# Prepare the input names and shapes
input_names = model.input_names[model_name]
input_shapes = model.input_shapes[model_name]
input_dtypes = model.input_dtypes[model_name]

# Construct the input dict
input_tensors = {}
for name in input_names:
    shape = input_shapes[name]
    np_dtype = hb_dtype_map.get(input_dtypes[name].name, np.float32)  # fallback
    input_tensors[name] = np.ones(shape, dtype=np_dtype)

# Optional: specify the inference priority and BPU device
priority = {model_name: 5}
bpu_cores = {model_name: [0]}

model.set_scheduling_params(
    priority=priority,
    bpu_cores=bpu_cores
)

# Run inference, optionally specifying priority and BPU cores
results = model.run(input_tensors)

# Print the results
for output_name, output_data in results[model_name].items():
    print(f"Output: {output_name}, shape={output_data.shape}")
```
##### Single-threaded, Multi-model, Multi-input Inference
Applicable when multiple models have multiple input tensors. Note that the multiple models here can be multiple HBM files, or a single HBM file containing multiple models.
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

#### Multi-threaded Inference
##### Multi-threaded, Single-model, Single-input Inference
Applicable when the model has only one input tensor.
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
##### Multi-threaded, Single-model, Multi-input Inference
Applicable when the model has multiple input tensors.
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
##### Multi-threaded, Multi-model, Multi-input Inference
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

### FAQ
| Question                 | Description                                                |
|------------------------|------------------------------------------------------------|
| How to get the model names? | Check the list of loaded model names via `model.model_names`. |
| How to check the input dimensions/types? | Use `model.input_shapes` and `model.input_dtypes`. |
| How to check the BPU core allocation? | Use the bpu_cores parameter to specify [0, 1, 2, 3]; the actual options depend on hardware support. |

  For more complex usage (multi-input models, reading quantization parameters, etc.), refer to the [API Reference section](#moduleclassfunction-reference-api-reference).

## Module/Class/Function Reference (API Reference)
The Python module hbm_runtime is a PyBind11-wrapped Horizon HBM model inference API, implemented on top of the underlying libdnn and libhbucp. It provides unified wrappers for model loading, input/output information queries, inference execution, and so on, supporting multi-model loading, multi-input inference, specifying the inference model, BPU Core, inference task priority, etc.

### Enumerated Types
#### hbDNNDataType
##### Tensor data type enum:
- S4: 4-bit signed
- U4: 4-bit unsigned
- S8: 8-bit signed
- U8: 8-bit unsigned
- F16: 16-bit float
- S16: 16-bit signed
- U16: 16-bit unsigned
- F32: 32-bit float
- S32: 32-bit signed
- U32: 32-bit unsigned
- F64: 64-bit float
- S64: 64-bit signed
- U64: 64-bit unsigned
- BOOL8: 8-bit bool type
- MAX: maximum value (reserved field)

##### Example
```python
from hbm_runtime import hbDNNDataType
print(hbDNNDataType.F32)  # Output: hbDNNDataType.F32
```
#### hbDNNQuantiType
##### Tensor quantization type enum:
- NONE: non-quantized type
- SCALE: linear scaling quantization (scale + zero_point)
##### Example
```python
from hbm_runtime import hbDNNQuantiType
print(hbDNNQuantiType.SCALE)  # Output: hbDNNQuantiType.SCALE
```

### Class Reference
#### HB_HBMRuntime
The model runtime class, which loads one or more HBM model files and provides the inference execution interface.
##### Constructor
- Function signature
    ```python
    HB_HBMRuntime(model_file: str)
    HB_HBMRuntime(model_files: List[str])
    ```
- Parameter description

    | Parameter    | Type         | Description                          |
    |------------|--------------|--------------------------------------|
    | model_file | str          | HBM model file path                  |
    | model_files| List[str]    | Multiple HBM model file paths (for multiple models) |
- Return value

  Class object
- Example
    ```python
    from hbm_runtime import HB_HBMRuntime

    model = HB_HBMRuntime("model.hbm")
    # Or load multiple models:
    model = HB_HBMRuntime(["model1.hbm", "model2.hbm"])
    ```

##### Property Reference
All the properties below are read-only.
- version: str
  - Function:
    - Get the library version number.
  - Structure:
    - str: the version number string.
  - Example:
    ```python
    print("Version:", HB_HBMRuntime.version)
    ```
- model_names: List[str]
  - Function:
    - The list of loaded model names.
  - Structure:
    - List[str]: the list of model names
  - Example:
    ```python
    print(model.model_names)
    # Output: ['model_1', 'model_2']
    ```
- model_count: int
  - Function:
    - The number of loaded models.
  - Structure:
    - int: the number of loaded models.
  - Example:
    ```python
    print(model.model_count)
    # Output: 2
    ```
- model_descs: Dict[str, str]
  - Function:
    - The description information of each model (from the notes embedded in the model).
  - Structure:
    - Dict[str, str]: keys are model names, values are the overall description information of the model, usually from the compiler.
  - Example:
    ```python
    # Print the description information of all models
    print(model.model_descs)
    # Output: {'yolov5x_672x672_nv12': 'Image classification model based on ResNet-18.'}
    ```

- hbm_descs: Dict[str, str]
  - Function:
    - The note information in each HBM file.
  - Structure:
    - Dict[str, str]: keys are .hbm file names (e.g., "resnet18"), values are the comment or meta-information strings in the HBM file.
  - Example:
    ```python
    # Print the description information of all model files
    print(model.hbm_descs)
    # Output: {'/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm': 'xxx'}
    ```
- compile_bpu_core_num: Dict[str, int]
  - Function:
    - Get the number of BPU cores specified at compile time for each model. This information reflects the BPU core configuration used when the model was compiled into HBM, and can be used for runtime resource planning or consistency checks against the runtime bpu_cores parameter setting.
  - Structure:
    - Dict[str, int]:
      - key: the model name
      - value: the BPU core count specified for this model at compile time
  - Example:
    ```bash
    # Query the compile-time BPU core count of the models
    print(model.compile_bpu_core_num)

    # Example output
    # {'model_1': 1, 'model_2': 2}
    ```
- input_counts: Dict[str, int]
  - Function:
    - The number of input tensors of each model.
  - Structure:
    - Dict[str, int]: keys are model names, values are the number of input tensors of that model.
  - Example:
    ```python
    # Print the description information of all model files
    print(model.input_counts)
    # Output: {'yolov5x_672x672_nv12': 2}
    ```
- input_names: Dict[str, List[str]]
  - Function:
    - The input tensor name list of each model.
  - Structure:
    - Outer Dict[str, ...]: keys are model names.
    - Inner List[str]: the list of names of all input tensors of that model.
  - Example:
    ```python
    print(model.input_names)
    # Output: {'yolov5x_672x672_nv12': ['data_y', 'data_uv']}
    ```
- input_descs: Dict[str, Dict[str, str]]
  - Function:
    - The description of each input tensor
  - Structure:
    - Outer Dict[str, ...]: model names.
    - Inner Dict[str, str]: keys are input tensor names, values are the description information.
  - Example:
    ```python
    # Print the description information of all model files
    print(model.input_descs)
    # Output: {'yolov5x_672x672_nv12': {'data_uv': 'xxx', 'data_y': 'xxx'}}
    ```
- input_shapes: Dict[str, Dict[str, List[int]]]
  - Function:
    - The shape of each input tensor
  - Structure:
    - Outer Dict[str, ...]: model names.
    - Inner Dict[str, List[int]]: keys are input names, values are the dimensions (shape) of the input tensor.
  - Example:
    ```python
    model.input_shapes
    # Output: {'yolov5x_672x672_nv12': {'data_uv': [1, 336, 336, 2], 'data_y': [1, 672, 672, 1]}}
    ```
- input_dtypes: Dict[str, Dict[str, hbDNNDataType]]
  - Function:
    - The data type of each input tensor
  - Structure:
    - Outer Dict[str, ...]: model names.
    - Inner Dict[str, hbDNNDataType]: keys are input tensor names, values are the data types (e.g., F32, U8).
  - Example:
    ```python
    print(model.input_dtypes)
    # Output: {'yolov5x_672x672_nv12': {'data_uv': <hbDNNDataType.U8: 3>, 'data_y': <hbDNNDataType.U8: 3>}}
    ```

- input_quants: Dict[str, Dict[str, QuantParams]]
  - Function:
    - Provides the quantization parameter information of all input tensors of each model. Used to support preprocessing computations for quantized models, or to understand how tensors are quantized.
  - Structure:
    - Outer Dict[str, ...]: keys are model names, e.g., "resnet50";
    - Inner Dict[str, QuantParams]: keys are input tensor names, values are QuantParams instances;
    - QuantParams class properties:
      - scale: np.ndarray — the quantization scale factors, usually a float array;
      - zero_point: np.ndarray — the zero points, used for symmetric/asymmetric quantization offsets;
      - quant_type: hbDNNQuantiType — the quantization type enum value (e.g., SCALE, NONE);
      - axis: int — for channel-wise quantization, this field indicates which axis the quantization is performed on.
  - Example:
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
  - Function:
    - The stride information of each input tensor
  - Structure:
    - Outer Dict[str, ...]: model names.
    - Inner Dict[str, List[int]]: keys are input names, values are the stride information of the input tensor.
  - Example:
    ```python
    print(model.input_strides)
    # Output: {'yolov5x_672x672_nv12': {'data_uv': [-1, -1, 2, 1], 'data_y': [-1, -1, 1, 1]}}
    ```
    Note: for the detailed meaning of stride, refer to the description of the libdnn library in the [OE documentation](http://j6.doc.oe.hobot.cc/3.0.31/guide/ucp/runtime/bpu_sdk_api/data_structure/hbDNNTensorProperties.html);
- output_counts: Dict[str, int]
  - Function:
    - The number of output tensors of each model.
  - Structure:
    - Dict[str, int]: keys are model names, values are the number of output tensors of that model.
  - Example:
    ```python
    print(model.output_counts)
    # Output: {'yolov5x_672x672_nv12': 3}
    ```
- output_names: Dict[str, List[str]]
  - Function:
    - The output tensor name list of each model.
  - Structure:
    - Outer Dict[str, ...]: keys are model names.
    - Inner List[str]: the list of names of all output tensors of that model.
  - Example:
    ```python
    print(model.output_names)
    # Output: {'yolov5x_672x672_nv12': ['output', '1310', '1312']}
    ```
- output_descs: Dict[str, Dict[str, str]]
  - Function:
    - The description of each output tensor.
  - Structure:
    - Outer Dict[str, ...]: model names.
    - Inner Dict[str, str]: keys are output tensor names, values are the description information.
  - Example:
    ```python
    print(model.output_descs)
    # Output: {'yolov5x_672x672_nv12': {'1310': 'xxx', '1312': 'xxx', 'output': 'xxx'}}
    ```
- output_shapes: Dict[str, Dict[str, List[int]]]
  - Function:
    - The shape of each output tensor.
  - Structure:
    - Outer Dict[str, ...]: model names.
    - Inner Dict[str, List[int]]: keys are output names, values are the dimensions (shape) of the output tensor.
  - Example:
    ```python
    print(model.output_shapes)
    # Output: {'yolov5x_672x672_nv12': {'1310': [1, 42, 42, 255], '1312': [1, 21, 21, 255], 'output': [1, 84, 84, 255]}}
    ```
- output_dtypes: Dict[str, Dict[str, List[int]]]
  - Function:
    - The data type of each output tensor.
  - Structure:
    - Outer Dict[str, ...]: model names.
    - Inner Dict[str, hbDNNDataType]: keys are output tensor names, values are the data types (e.g., F32, U8).
  - Example:
    ```python
    print(model.output_dtypes)
    # Output: {'yolov5x_672x672_nv12': {'1310': <hbDNNDataType.S32: 8>, '1312': <hbDNNDataType.S32: 8>, 'output': <hbDNNDataType.S32: 8>}}
    ```
- output_quants: Dict[str, Dict[str, QuantParams]]
  - Function:
    - Provides the quantization parameter information of all output tensors of each model. Used to support post-processing computations for quantized models (e.g., restoring int8 data back to float32), or to understand how tensors are quantized (scale-based, etc.).
  - Structure:
    - Outer Dict[str, ...]: keys are model names, e.g., "resnet50";
    - Inner Dict[str, QuantParams]: keys are output tensor names, values are QuantParams instances;
    - QuantParams class properties:
      - scale: np.ndarray — the quantization scale factors, usually a float array;
      - zero_point: np.ndarray — the zero points, used for symmetric/asymmetric quantization offsets;
      - quant_type: hbDNNQuantiType — the quantization type enum value (e.g., SCALE, NONE);
      - axis: int — for channel-wise quantization, this field indicates which axis the quantization is performed on.
  - Example:
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
  - Function:
    - The stride information of each output tensor
  - Structure:
    - Outer Dict[str, ...]: model names.
    - Inner Dict[str, List[int]]: keys are output names, values are the stride information of the output tensor.
  - Example:
    ```python
    print(model.output_strides)
    # Output: {'yolov5x_672x672_nv12': {'1310': [1806336, 43008, 1024, 4], '1312': [451584, 21504, 1024, 4], 'output': [7225344, 86016, 1024, 4]}}
    ```
  Note: for the detailed meaning of stride, refer to the description of the libdnn library in the [OE documentation](http://j6.doc.oe.hobot.cc/3.0.31/guide/ucp/runtime/bpu_sdk_api/data_structure/hbDNNTensorProperties.html);

- sched_params: Dict[str, SchedParam]
  - Function:
    sched_params is used to get the current scheduling parameters (Scheduling Parameters) of all models, including for each model:
    - priority
    - custom ID (customId)
    - allocated BPU cores (bpu_cores)
    - device ID it belongs to (deviceId)
    These scheduling parameters affect how the model runs on the hardware, and are especially important in multi-model deployments or multi-core devices.
  - Structure:
    - Outer Dict[str, ...]: model names.
    - Inner SchedParam: an instance of the SchedParam class, containing the scheduling parameters priority, customId, bpu_cores and deviceId of that model;
      ```python
      {
          "model_name": SchedParam(
              priority: int,
              customId: int,
              bpu_cores: List[int],
              deviceId: int
          )
      }
      ```
  - Example:
    ```python
    params = model.sched_params
    for name, sched in params.items():
        print(f"Model: {name}")
        print(f"  priority: {sched.priority}")
        print(f"  customId: {sched.customId}")
        print(f"  bpu_cores: {sched.bpu_cores}")
        print(f"  deviceId: {sched.deviceId}")
    # Output:
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
    Note: a returned value of -1 in bpu_cores means it is automatically allocated by the scheduler;
##### Configuration Functions
- set_scheduling_params
  - Function signature
    ```python
    def set_scheduling_params(
        priority: Optional[Dict[str, int]] = None,
        bpu_cores: Optional[Dict[str, List[int]]] = None,
        custom_id: Optional[Dict[str, int]] = None,
        device_id: Optional[Dict[str, int]] = None
    ) -> None
    ```
  - Function

    Sets the default scheduling parameters (priority / bpu_cores / custom_id / device_id) of the models. This function configures the persistent scheduling parameters at the HB_HBMRuntime instance level, serving as the defaults for subsequent inference calls.

    Relationship with the run() scheduling parameters:
    - set_scheduling_params() sets the **model-level default scheduling parameters**, which are stored in the runtime instance and remain in effect.
    - The run() interface also accepts scheduling configuration passed via parameters, used as a **temporary override for a single inference call (run-local)**.
    - When scheduling parameters are explicitly passed in a run() call, their priority is **higher** than the defaults set via set_scheduling_params().
    - The scheduling parameters passed in run() **only take effect for the current inference call** and do not modify or affect the default scheduling parameters already set.
    - If a scheduling field is not passed in run(), that field automatically falls back to the default value configured via set_scheduling_params().

    Priority relationship: `run() parameters  >  set_scheduling_params() defaults  >  built-in initial defaults`

  - Parameter description

    | Parameter   | Type                             | Description                                                          |
    |-------------|----------------------------------|----------------------------------------------------------------------|
    | priority    | Optional dict (model name -> int) | Sets the scheduling priority of each model. The range is usually 0~255; the higher the value, the higher the priority |
    | bpu_cores   | Optional dict (model name -> List[int]) | Specifies the list of BPU core indices the model is bound to. By default it is automatically allocated; the actual options depend on hardware support |
    | custom_id   | Optional dict (model name -> int) | Custom priority, e.g., timestamp, frame id, etc. The smaller the value, the higher the priority. Priority order: priority > customId. |
    | device_id   | Optional dict (model name -> int) | Specifies on which device the model runs                             |

  - Return value

    None

  - Example:
    ```python
    # Set model-level default scheduling parameters
    model.set_scheduling_params(
        priority={"model1": 200, "model2": 100},
        bpu_cores={"model1": [0, 1], "model2": [0]}
    )

    # Verify that the default parameters take effect
    params = model.sched_params
    print(params["model1"].priority)    # Output: 200
    print(params["model1"].bpu_cores)   # Output: [0, 1]

    # Per-call override in run() (does not modify the defaults)
    outputs = model.run(
        inputs,
        priority={"model1": 50}          # Only effective for this call
    )

    # The default parameters remain unchanged
    print(model.sched_params["model1"].priority)  # Still: 200
    ```

##### Inference Execution Functions

run() provides 3 input forms (single input / single-model multi-input / multi-model multi-input), and each call can individually pass scheduling parameters: priority / bpu_cores / custom_id / device_id.

**Multi-threading Support Notes (Important)**

- Parallelism for multi-model inference: when using `run(multi_input_tensors, ...)` for multi-model inference, the runtime creates one C++ thread for each model in `multi_input_tensors` to run their respective inference pipelines in parallel.
- Concurrent calls from Python threads: it is possible to achieve the throughput improvement of "concurrent run() calls from Python threads + parallel multi-model inference in the runtime" (the actual effect depends on the number of BPU cores, the model configuration and the system load).
- Each call can set its own scheduling parameters: the priority/bpu_cores/custom_id/device_id of run() are temporary overrides for the current call; different threads / different calls can pass different scheduling parameters without affecting each other.

- run (single model · single input)
  - Function signature
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
  - Function

    Applicable to the single-model, single-input inference scenario.
    - When only one model is loaded, `model_name` can be omitted; when multiple models are loaded, `model_name` **must be specified** (otherwise an error is raised).
    - If the input count of the selected model is not 1, an error is raised directly (this overload does not apply).
    - It validates that the input dtype matches the model input type; it validates that the shape matches the model input (dynamic dimensions with model dimension -1 are filled in from the actual input).
    - The inference return structure is: `{model_name: {output_name: np.ndarray}}`

  - Parameter description

    | Parameter    | Type                             | Description                                                          |
    |--------------|----------------------------------|---------------------------------------------------------------------|
    | input_tensor | np.ndarray                       | Single input tensor, only for the single-model, single-input inference scenario. The tensor shape must match the corresponding model input. |
    | model_name   | str (optional)                   | Specifies the model name (can be omitted for a single model, otherwise must be specified) |
    | priority     | Optional dict (model name -> int) | The inference priority of this call (temporary override, does not affect the defaults) |
    | bpu_cores    | Optional dict (model name -> List[int]) | The list of BPU core indices bound to this call |
    | custom_id    | Optional dict (model name -> int) | The custom priority of this call |
    | device_id    | Optional dict (model name -> int) | The device ID specified for this call |

  - Return value
    - Type: Dict[str, Dict[str, np.ndarray]]
    - Outer key: the model name
    - Inner key: the output tensor name
    - value: the corresponding output numpy array (a zero-copy wrapper over the device buffer, automatically released with the array's lifetime)
  - Example: see the Quick Start section, the single-threaded, single-model, single-input inference part.

- run (single model · multi-input)
  - Function signature
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
  - Function

    Applicable to the single-model, multi-input inference scenario.
    - The keys of `input_tensors` must be input names that actually exist in the model (otherwise an error is raised).
    - When only one model is loaded, `model_name` can be omitted; when multiple models are loaded, `model_name` **must be specified** (otherwise an error is raised).
    - Each input tensor is checked for C-contiguous memory layout and automatically copied when it is not.

  - Parameter description

    | Parameter     | Type                             | Description                                                        |
    |---------------|----------------------------------|-------------------------------------------------------------------|
    | input_tensors | Dict[str, np.ndarray]            | Multi-input tensors; keys are input tensor names, values are the corresponding NumPy arrays. |
    | model_name    | str (optional)                   | Specifies the model name (can be omitted for a single model, otherwise must be specified) |
    | priority      | Optional dict (model name -> int) | The inference priority of this call (temporary override, does not affect the defaults) |
    | bpu_cores     | Optional dict (model name -> List[int]) | The list of BPU core indices bound to this call |
    | custom_id     | Optional dict (model name -> int) | The custom priority of this call |
    | device_id     | Optional dict (model name -> int) | The device ID specified for this call |

  - Return value

    Same as above.

  - Example: see the Quick Start section, the single-threaded, single-model, multi-input inference part.

- run (multi-model · multi-input)
  - Function signature
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
  - Function

    Applicable to the multi-model simultaneous inference scenario: outer keys are model names, inner ones are input name -> numpy array for that model.
    - If `model_name` is **not specified**: all models provided in `multi_input_tensors` are inferred.
    - If `model_name` is **specified**: only the inputs corresponding to that model are kept and inference is executed (the inputs of the other models are filtered out).
    - Multi-threaded parallel execution: the runtime creates one thread for each model to run inference in parallel, and releases the GIL during inference, so that higher throughput can be achieved when Python threads call concurrently.

  - Parameter description

    | Parameter           | Type                              | Description |
    |---------------------|-----------------------------------|------|
    | multi_input_tensors | Dict[str, Dict[str, np.ndarray]]  | Multi-model inference; outer keys are model names, inner ones are the input name -> tensor mapping. Supports running multiple models simultaneously (each model can have multiple inputs). |
    | model_name          | str (optional)                    | If specified, only that model is inferred; if not specified, all models with provided inputs are inferred |
    | priority            | Optional dict (model name -> int) | The inference priority of this call (temporary override, does not affect the defaults) |
    | bpu_cores           | Optional dict (model name -> List[int]) | The list of BPU core indices bound to this call |
    | custom_id           | Optional dict (model name -> int) | The custom priority of this call |
    | device_id           | Optional dict (model name -> int) | The device ID specified for this call |

  - Return value

    Same as above

  - Example: see the Quick Start section, the single-threaded, multi-model, multi-input inference part.

- Exception notes
  - If the input tensor dimensions or type do not match the model, a ValueError is raised.
  - If the input tensor is non-contiguous (non C-style), a contiguous copy is automatically made internally.
  - Before inference, make sure the input tensor shape exactly matches input_shapes.
#### QuantParams Class
  Tensor quantization parameter object.
##### Properties
- scale: numpy.ndarray, the array of quantization scale factors
- zero_point: numpy.ndarray, the array of zero points
- quant_type: hbDNNQuantiType type, indicates the quantization mode
- axis: int, the quantization axis (for per-channel quantization)
##### Example:
    ```python
    # Get the quantization parameters of one output of the model
    tensor_qparams = model.output_quants[model_name][output_name]
    print("scale:", tensor_qparams.scale)
    print("zero_point:", tensor_qparams.zero_point)
    print("type:", tensor_qparams.quant_type)
    print("axis:", tensor_qparams.axis)
    ```

#### SchedParam Class
  Model scheduling parameter object, used to describe the default scheduling state of a single model (priority, core binding, etc.). This object is usually used to read the scheduling configuration of the current model, rather than as the primary configuration entry point.
##### Properties
- priority: Dict[str, int]

  The scheduling priority of the model inference task. The value range is 0~255; the higher the value, the higher the priority.

- customId: Dict[str, int]

  A user-defined identifier (e.g., frame id, timestamp, etc.), passed to the low-level scheduler. Priority order: priority > customId.

- bpu_cores: Dict[str, List[int]]

  The list of BPU cores bound to the model; [-1] means ANY, automatically selected by the scheduler. S100 can only take 1, S600 takes 0~3.

- deviceId: Dict[str, int]

  The device ID where the model is deployed (used in multi-device scenarios).

##### Example:
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

## Notes
- Dynamic inputs and outputs have not been tested; use them with caution;

## Related Documents

- [ResNet18 Classification Example (Python)](../../03_Demos/03_algorithm_demo/02_classification/01_resnet18_py.md)
- [YOLOv5x Detection Example (Python)](../../03_Demos/03_algorithm_demo/03_detection/01_yolov5x_py.md)
- [C Inference API](./01_c_api.md)
- [Model Download and Placement](../../03_Demos/04_demo_support/01_model_files.md)
- [Using Your Own Model](../../03_Demos/04_demo_support/04_custom_model.md)
