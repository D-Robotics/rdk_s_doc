# 4.2 Overview

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/python-api

hbm_runtime is a Python binding built on pybind11 for accessing and operating the underlying libhbucp / libdnn C++ libraries, providing high-performance neural network model loading and inference.

This interface encapsulates low-level model runtime details so Python users can conveniently load single or multiple neural network models, query and manage model input/output metadata, and run inference flexibly. It supports multiple input data formats and, when necessary, automatically converts inputs to C-contiguous storage to ensure correct and efficient low-level access.

In addition, the new interface releases the Python GIL on the C++ side during inference, allowing multiple Python threads to call `run()` concurrently. For multi-model inference, the runtime automatically schedules each model's inference task in parallel using multiple threads to improve throughput.

### Use Cases

- Quickly integrate and call hbm_runtime capabilities in Python environments.
- Applications with high demands on inference efficiency and scheduling flexibility, such as robot vision and intelligent edge computing.
- Scenarios that need to load and manage multiple models simultaneously and configure task scheduling parameters (priority, core binding, device ID, etc.) per inference call as needed.
- Scenarios that need to query compile-time BPU information (for example, compile-time BPU core count) to assist runtime resource configuration and consistency checks.

### Key Features

- Multi-model support
- Supports loading a single model or a group of multiple models; each model can independently expose input/output metadata and run inference.
- `run()` supports one-shot inference over multi-model inputs and returns results keyed by model name (even for a single model, the nested structure `{model_name: {...}}` is returned).
- Flexible input formats
- Single input ( `numpy.ndarray` );
- Single-model multi-input dict ( `Dict[str, np.ndarray]` , keys are input tensor names);
- Multi-model multi-input structure ( `Dict[str, Dict[str, np.ndarray]]` , outer keys are model names, inner keys are input tensor names).
- All inputs are automatically checked for C-contiguous memory layout and copied when necessary to ensure efficient and correct low-level access (non-contiguous inputs may incur extra copy overhead).
- Scheduling parameter configuration: default parameters + per-call overrides (run-local)
- Set model-level default scheduling parameters via `set_scheduling_params(...)` (persisted inside the runtime and reusable across calls).
- Optionally override scheduling on each `run()` call; overrides take precedence over defaults for that call only and do not affect other threads or other `run()` invocations.
- Multi-threaded inference
- Concurrent `run()` from multiple Python threads: the GIL is released inside C++ during inference so multiple Python threads can issue inference calls simultaneously.
- Parallel multi-model inference: when the input is a multi-model structure, the runtime launches a thread per model to run inference in parallel (multi-threaded launch), which can improve throughput on multi-core BPU systems; a single-model case uses one inference thread.

## Installation

The `hbm_runtime` module is a high-performance inference runtime Python interface implemented in C++. It depends on pybind11 and Horizon's underlying inference libraries (such as libdnn, libhbucp, etc.). It can be installed via system DEB packages ( `.deb` ) and supports Python 3.10 and above.

### System Dependencies

| Dependency | Minimum Version | Description 
| Python | ≥ 3.10 | Python 3.10 is recommended 
| pip | ≥ 22.0 | Required for installing wheel packages 
| pybind11 | any | Used at build time; not required when installing the package 
| scikit-build-core | ≥ 0.7 | Used when building wheel packages (source builds only) 
| Horizon base libraries | platform-specific | e.g. libdnn.so, libucp.so, usually provided by the BSP 

### Building Wheel Packages

There are three ways to build a wheel package, described below.

#### Build During DEB Installation

The `hobot-dnn` package install process includes building the `hbm_runtime` wheel. After the DEB install completes, the `hbm-runtime` whl package is generated.

```bash
# Install from apt source
sudo apt-get install hobot-dnn

# Install from a local deb package (package names vary by build; use your actual filename)
dpkg -i hobot-dnn_4.0.4-20250909195426_arm64.deb

# After installation, find the wheel under /tmp on the board
ls /tmp

# Whl package names vary by version; xxx stands for the version
#hbm_runtime-x.x.x-cp310-cp310-manylinux_2_34_aarch64.whl
```

#### Build During System Image Compilation

When building the system software image, the `hobot-dnn` deb is installed; during that install the `hbm-runtime` whl is built and copied to `out/product/deb_packages` .

```bash
sudo ./pack_image.sh

ls out/product/deb_packages

# Whl package names vary by version; xxx stands for the version
#hbm_runtime-x.x.x-cp310-cp310-manylinux_2_34_aarch64.whl
```

#### Build on Device

```bash
# Enter the hbm_runtime source tree
cd /usr/hobot/lib/hbm_runtime

# Run the build script
./build.sh

# List built wheel packages
ls dist/

# Whl package names vary by version; xxx stands for the version
#hbm_runtime-x.x.x-cp310-cp310-manylinux_2_34_aarch64.whl
```

### Installation Methods

#### Using a Wheel Package

You can use either of the following wheel install methods.

- Install from a local wheel package

- Locate the `.whl` file built in the Building Wheel Packages section.

```bash
# Example: install local whl with pip (package names vary by version; xxx stands for the version)
pip install hbm_runtime-x.x.x-cp310-cp310-manylinux_2_34_aarch64.whl
```
- Install from PyPI

```bash
pip install hbm_runtime
```

#### Using a .deb Package

You can use either of the following deb install methods.

- Install from a local DEB package

```bash
# Example: install DEB package (package names vary by build; use your actual filename)
sudo dpkg -i hobot-dnn_4.0.2-20250714201215_arm64.deb
```
- Install from apt source

```bash
sudo apt-get install hobot-dnn
```
- FAQ

- If files are not updated after a `.deb` install, check whether other packages block the upgrade (for example, an older `hobot-spdev` ).
- Use `dpkg -L hobot-dnn` to verify deployed files.

### Uninstallation

- Uninstall pip-installed package:

```bash
pip uninstall hbmruntime
```
- Uninstall deb-installed package:

```bash
sudo apt remove hobot-dnn
```

## Quick Start

This section shows how to load models and run inference with `hbm_runtime` . A few lines of code are enough to run a model and obtain outputs.

### Prerequisites

Ensure HBMRuntime is installed correctly (see Installation ) and that you have an HBM model file.

### Examples

#### Single-Threaded Inference

##### Single-Threaded, Single-Model, Single-Input Inference

For models with a single input tensor.

```python
import numpy as np
from hbm_runtime import HB_HBMRuntime

# Load model
model = HB_HBMRuntime("/opt/hobot/model/s600/basic/lanenet256x512.hbm")

# Get model name and input name
model_name = model.model_names[0]
input_name = model.input_names[model_name][0]  # Assume single input

# Get shape for this input
input_shape = model.input_shapes[model_name][input_name]

# Build numpy input
input_tensor = np.ones(input_shape, dtype=np.float32)

# Run inference
outputs = model.run(input_tensor)

# Get output
output_array = outputs[model_name]
print("Output:", output_array)
```

##### Single-Threaded, Single-Model, Multi-Input Inference

For models with multiple input tensors.

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

# Load model
model = HB_HBMRuntime("/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm")

# Get model name (assume one model loaded)
model_name = model.model_names[0]

# Prepare input names and shapes
input_names = model.input_names[model_name]
input_shapes = model.input_shapes[model_name]
input_dtypes = model.input_dtypes[model_name]

# Build input dict
input_tensors = {}
for name in input_names:
    shape = input_shapes[name]
    np_dtype = hb_dtype_map.get(input_dtypes[name].name, np.float32)  # fallback
    input_tensors[name] = np.ones(shape, dtype=np_dtype)

# Optional: set inference priority and BPU device
priority = {model_name: 5}
bpu_cores = {model_name: [0]}

model.set_scheduling_params(
    priority=priority,
    bpu_cores=bpu_cores
)

# Run inference; optional per-call priority and BPU cores
results = model.run(input_tensors)

# Print outputs
for output_name, output_data in results[model_name].items():
    print(f"Output: {output_name}, shape={output_data.shape}")
```

##### Single-Threaded, Multi-Model, Multi-Input Inference

For multiple models each with multiple inputs. "Multi-model" can mean several HBM files or several models inside one HBM file.

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

#### Multi-Threaded Inference

##### Multi-Threaded, Single-Model, Single-Input Inference

For models with a single input tensor.

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

##### Multi-Threaded, Single-Model, Multi-Input Inference

For models with multiple input tensors.

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

##### Multi-Threaded, Multi-Model, Multi-Input Inference

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

| Question | Answer 
| How do I get model names? | Use `model.model_names` to list loaded model names. 
| How do I confirm input dimensions and types? | Use `model.input_shapes` and `model.input_dtypes` . 
| How do I assign BPU cores? | Use the `bpu_cores` parameter with values such as `[0, 1, 2, 3]` ; actual support depends on hardware. 

For advanced usage (multi-input models, reading quantization parameters, etc.), see the API Reference .

## Module, Class, and Function Reference (API Reference)

The Python module `hbm_runtime` is a Horizon HBM model inference interface wrapped with PyBind11, implemented on libdnn and libhbucp. It provides unified model loading, input/output metadata queries, and inference execution, supporting multi-model loading, multi-input inference, per-model selection, BPU core binding, inference task priority, and more.

### Enumerations

#### hbDNNDataType

##### Tensor data type enumeration:

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
- MAX: maximum value (reserved)

##### Example

```python
from hbm_runtime import hbDNNDataType
print(hbDNNDataType.F32)  # Output: hbDNNDataType.F32
```

#### hbDNNQuantiType

##### Tensor quantization type enumeration:

- NONE: non-quantized type
- SCALE: linear scale quantization (scale + zero_point)

##### Example

```python
from hbm_runtime import hbDNNQuantiType
print(hbDNNQuantiType.SCALE)  # Output: hbDNNQuantiType.SCALE
```

### Classes

#### HB_HBMRuntime

Model runtime class that loads one or more HBM model files and provides inference APIs.

##### Constructor

- Function signature

```python
HB_HBMRuntime(model_file: str)
HB_HBMRuntime(model_files: List[str])
```
- Parameters

| Parameter | Type | Description 
| model_file | str | Path to an HBM model file 
| model_files | List[str] | Paths to multiple HBM model files (multi-model)
- Return value

Class instance
- Example

```python
from hbm_runtime import HB_HBMRuntime

model = HB_HBMRuntime("model.hbm")
# Or load multiple models:
model = HB_HBMRuntime(["model1.hbm", "model2.hbm"])
```

##### Properties

All properties below are read-only.

- version: str

- Description:
- Library version string.
- Structure:
- str: version string.
- Example:
```python
print("Version:", HB_HBMRuntime.version)
```
- model_names: List[str]

- Description:
- List of loaded model names.
- Structure:
- List[str]: model name list
- Example:
```python
print(model.model_names)
# Output: ['model_1', 'model_2']
```
- model_count: int

- Description:
- Number of loaded models.
- Structure:
- int: number of loaded models.
- Example:
```python
print(model.model_count)
# Output: 2
```
- model_descs: Dict[str, str]

- Description:
- Per-model description (from embedded model notes).
- Structure:
- Dict[str, str]: keys are model names; values are overall model descriptions, usually from the compiler.
- Example:
```python
# Print descriptions for all models
print(model.model_descs)
# Output: {'yolov5x_672x672_nv12': 'Image classification model based on ResNet-18.'}
```
- hbm_descs: Dict[str, str]

- Description:
- Notes embedded in each HBM file.
- Structure:
- Dict[str, str]: keys are `.hbm` file names (e.g. `"resnet18"` ); values are comment or metadata strings from the HBM file.
- Example:
```python
# Print descriptions for all model files
print(model.hbm_descs)
# Output: {'/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm': 'xxx'}
```
- compile_bpu_core_num: Dict[str, int]

- Description:
- BPU core count specified at compile time for each model. Reflects the BPU core configuration used when the model was compiled into HBM; useful for runtime resource planning or consistency checks against runtime `bpu_cores` settings.
- Structure:
- Dict[str, int]:
- key: model name
- value: compile-time BPU core count for that model
- Example:
```bash
# Query compile-time BPU core count
print(model.compile_bpu_core_num)

# Example output
# {'model_1': 1, 'model_2': 2}
```
- input_counts: Dict[str, int]

- Description:
- Number of input tensors per model.
- Structure:
- Dict[str, int]: keys are model names; values are input tensor counts.
- Example:
```python
print(model.input_counts)
# Output: {'yolov5x_672x672_nv12': 2}
```
- input_names: Dict[str, List[str]]

- Description:
- Input tensor name list per model.
- Structure:
- Outer Dict[str, ...]: keys are model names.
- Inner List[str]: input tensor names for that model.
- Example:
```python
print(model.input_names)
# Output: {'yolov5x_672x672_nv12': ['data_y', 'data_uv']}
```
- input_descs: Dict[str, Dict[str, str]]

- Description:
- Description per input tensor.
- Structure:
- Outer Dict[str, ...]: model name.
- Inner Dict[str, str]: keys are input tensor names; values are descriptions.
- Example:
```python
print(model.input_descs)
# Output: {'yolov5x_672x672_nv12': {'data_uv': 'xxx', 'data_y': 'xxx'}}
```
- input_shapes: Dict[str, Dict[str, List[int]]]

- Description:
- Shape of each input tensor.
- Structure:
- Outer Dict[str, ...]: model name.
- Inner Dict[str, List[int]]: keys are input names; values are tensor dimensions (shape).
- Example:
```python
model.input_shapes
# Output: {'yolov5x_672x672_nv12': {'data_uv': [1, 336, 336, 2], 'data_y': [1, 672, 672, 1]}}
```
- input_dtypes: Dict[str, Dict[str, hbDNNDataType]]

- Description:
- Data type of each input tensor.
- Structure:
- Outer Dict[str, ...]: model name.
- Inner Dict[str, hbDNNDataType]: keys are input tensor names; values are data types (e.g. F32, U8).
- Example:
```python
print(model.input_dtypes)
# Output: {'yolov5x_672x672_nv12': {'data_uv': <hbDNNDataType.U8: 3>, 'data_y': <hbDNNDataType.U8: 3>}}
```
- input_quants: Dict[str, Dict[str, QuantParams]]

- Description:
- Quantization parameters for all input tensors of each model. Used for pre-processing of quantized models or to inspect how tensors are quantized.
- Structure:
- Outer Dict[str, ...]: model name, e.g. `"resnet50"` ;
- Inner Dict[str, QuantParams]: keys are input tensor names; values are `QuantParams` instances;
- `QuantParams` attributes:
- scale: np.ndarray — scale factors, usually a float array;
- zero_point: np.ndarray — zero points for symmetric/asymmetric quantization;
- quant_type: hbDNNQuantiType — quantization type enum (e.g. SCALE, NONE);
- axis: int — for per-channel quantization, the axis along which quantization applies.
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

- Description:
- Stride information per input tensor.
- Structure:
- Outer Dict[str, ...]: model name.
- Inner Dict[str, List[int]]: keys are input names; values are stride arrays.
- Example:
```python
print(model.input_strides)
# Output: {'yolov5x_672x672_nv12': {'data_uv': [-1, -1, 2, 1], 'data_y': [-1, -1, 1, 1]}}
```

Note: For stride semantics, see the libdnn description in the [OE documentation](http://j6.doc.oe.hobot.cc/3.0.31/guide/ucp/runtime/bpu_sdk_api/data_structure/hbDNNTensorProperties.html) .
- output_counts: Dict[str, int]

- Description:
- Number of output tensors per model.
- Structure:
- Dict[str, int]: keys are model names; values are output tensor counts.
- Example:
```python
print(model.output_counts)
# Output: {'yolov5x_672x672_nv12': 3}
```
- output_names: Dict[str, List[str]]

- Description:
- Output tensor name list per model.
- Structure:
- Outer Dict[str, ...]: keys are model names.
- Inner List[str]: output tensor names for that model.
- Example:
```python
print(model.output_names)
# Output: {'yolov5x_672x672_nv12': ['output', '1310', '1312']}
```
- output_descs: Dict[str, Dict[str, str]]

- Description:
- Description per output tensor.
- Structure:
- Outer Dict[str, ...]: model name.
- Inner Dict[str, str]: keys are output tensor names; values are descriptions.
- Example:
```python
print(model.output_descs)
# Output: {'yolov5x_672x672_nv12': {'1310': 'xxx', '1312': 'xxx', 'output': 'xxx'}}
```
- output_shapes: Dict[str, Dict[str, List[int]]]

- Description:
- Shape of each output tensor.
- Structure:
- Outer Dict[str, ...]: model name.
- Inner Dict[str, List[int]]: keys are output names; values are tensor dimensions (shape).
- Example:
```python
print(model.output_shapes)
# Output: {'yolov5x_672x672_nv12': {'1310': [1, 42, 42, 255], '1312': [1, 21, 21, 255], 'output': [1, 84, 84, 255]}}
```
- output_dtypes: Dict[str, Dict[str, List[int]]]

- Description:
- Data type of each output tensor.
- Structure:
- Outer Dict[str, ...]: model name.
- Inner Dict[str, hbDNNDataType]: keys are output tensor names; values are data types (e.g. F32, U8).
- Example:
```python
print(model.output_dtypes)
# Output: {'yolov5x_672x672_nv12': {'1310': <hbDNNDataType.S32: 8>, '1312': <hbDNNDataType.S32: 8>, 'output': <hbDNNDataType.S32: 8>}}
```
- output_quants: Dict[str, Dict[str, QuantParams]]

- Description:
- Quantization parameters for all output tensors of each model. Used for post-processing of quantized models (e.g. dequantizing int8 to float32) or to inspect quantization (scale-based, etc.).
- Structure:
- Outer Dict[str, ...]: model name, e.g. `"resnet50"` ;
- Inner Dict[str, QuantParams]: keys are output tensor names; values are `QuantParams` instances;
- `QuantParams` attributes:
- scale: np.ndarray — scale factors, usually a float array;
- zero_point: np.ndarray — zero points for symmetric/asymmetric quantization;
- quant_type: hbDNNQuantiType — quantization type enum (e.g. SCALE, NONE);
- axis: int — for per-channel quantization, the quantization axis.
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

- Description:
- Stride information per output tensor.
- Structure:
- Outer Dict[str, ...]: model name.
- Inner Dict[str, List[int]]: keys are output names; values are stride arrays.
- Example:
```python
print(model.output_strides)
# Output: {'yolov5x_672x672_nv12': {'1310': [1806336, 43008, 1024, 4], '1312': [451584, 21504, 1024, 4], 'output': [7225344, 86016, 1024, 4]}}
```
Note: For stride semantics, see the libdnn description in the [OE documentation](http://j6.doc.oe.hobot.cc/3.0.31/guide/ucp/runtime/bpu_sdk_api/data_structure/hbDNNTensorProperties.html) .
- sched_params: Dict[str, SchedParam]

- Description: `sched_params` returns the current scheduling parameters for all models, including per model:
- priority
- custom ID (customId)
- assigned BPU cores (bpu_cores)
- device ID (deviceId) These parameters affect how models run on hardware, especially in multi-model or multi-core deployments.
- Structure:
- Outer Dict[str, ...]: model name.
- Inner SchedParam: instance with priority, customId, bpu_cores, and deviceId for that model;
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

Note: `bpu_cores` returning `-1` means the scheduler assigns cores automatically.

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
- Description

Sets default scheduling parameters per model (priority / bpu_cores / custom_id / device_id). Configures persistent, instance-level defaults on `HB_HBMRuntime` for subsequent inference calls.

Relationship to `run()` scheduling parameters:

- `set_scheduling_params()` sets **model-level default** scheduling parameters stored on the runtime instance.
- `run()` also accepts scheduling arguments for **per-call temporary overrides (run-local)** .
- Explicit scheduling arguments on `run()`**override** defaults from `set_scheduling_params()` .
- `run()` overrides apply **only to that inference call** and do not change stored defaults.
- If a scheduling field is omitted on `run()` , the default from `set_scheduling_params()` is used.
Precedence: `run()` arguments > `set_scheduling_params()` defaults > built-in initial defaults
- Parameters

| Parameter | Type | Description 
| priority | optional dict (model name → int) | Scheduling priority per model, typically 0–255; higher values mean higher priority 
| bpu_cores | optional dict (model name → List[int]) | BPU core index list per model; default means auto-assignment; depends on hardware support 
| custom_id | optional dict (model name → int) | Custom tie-breaker (e.g. timestamp, frame id); smaller values win when priority is equal. Precedence: priority > customId. 
| device_id | optional dict (model name → int) | Device on which the model runs
- Return value

None
- Example:

```python
# Set model-level default scheduling parameters
model.set_scheduling_params(
    priority={"model1": 200, "model2": 100},
    bpu_cores={"model1": [0, 1], "model2": [0]}
)

# Verify defaults
params = model.sched_params
print(params["model1"].priority)    # Output: 200
print(params["model1"].bpu_cores)   # Output: [0, 1]

# Per-call override in run() (does not change defaults)
outputs = model.run(
    inputs,
    priority={"model1": 50}          # Applies only to this call
)

# Defaults unchanged
print(model.sched_params["model1"].priority)  # Still: 200
```

##### Inference Functions

`run()` accepts three input shapes (single input / single-model multi-input / multi-model multi-input). Each call can pass scheduling parameters: priority / bpu_cores / custom_id / device_id.

**Multi-threading (important)**

- Multi-model parallelism: with `run(multi_input_tensors, ...)` , the runtime creates one C++ thread per model in `multi_input_tensors` and runs inference in parallel.
- Concurrent Python threads: you can combine "multiple Python threads calling `run()` " with "parallel multi-model inference" for higher throughput (actual gain depends on BPU core count, model config, and system load).
- Per-call scheduling: `run()` priority/bpu_cores/custom_id/device_id are temporary for that call; different threads or calls can use different values independently.
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
- Description

For single-model, single-input inference.

- When only one model is loaded, `model_name` may be omitted; with multiple models, **`model_name` is required** (otherwise an error is raised).
- If the selected model does not have exactly one input, an error is raised (this overload does not apply).
- Input dtype must match the model input type; shape must match the model input (dynamic dimensions marked `-1` in the model are filled from the actual input).
- Return structure: `{model_name: {output_name: np.ndarray}}`
- Parameters

| Parameter | Type | Description 
| input_tensor | np.ndarray | Single input tensor; only for single-model, single-input inference. Shape must match the model input. 
| model_name | str (optional) | Target model name (optional if only one model is loaded; required otherwise) 
| priority | optional dict (model name → int) | Inference priority for this call (temporary override) 
| bpu_cores | optional dict (model name → List[int]) | BPU core indices for this call 
| custom_id | optional dict (model name → int) | Custom priority for this call 
| device_id | optional dict (model name → int) | Device ID for this call
- Return value

- Type: Dict[str, Dict[str, np.ndarray]]
- Outer key: model name
- Inner key: output tensor name
- Value: output numpy array (zero-copy wrapper over device buffer; released with the array lifetime)
- Example: see Single-Threaded, Single-Model, Single-Input Inference in Quick Start.
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
- Description

For single-model, multi-input inference.

- Keys in `input_tensors` must be valid input names for the model (otherwise an error is raised).
- When only one model is loaded, `model_name` may be omitted; with multiple models, **`model_name` is required** .
- Each input is checked for C-contiguous memory and copied if needed.
- Parameters

| Parameter | Type | Description 
| input_tensors | Dict[str, np.ndarray] | Multi-input dict: input tensor name → NumPy array 
| model_name | str (optional) | Target model name (optional if only one model is loaded; required otherwise) 
| priority | optional dict (model name → int) | Inference priority for this call (temporary override) 
| bpu_cores | optional dict (model name → List[int]) | BPU core indices for this call 
| custom_id | optional dict (model name → int) | Custom priority for this call 
| device_id | optional dict (model name → int) | Device ID for this call
- Return value

Same as above.
- Example: see Single-Threaded, Single-Model, Multi-Input Inference in Quick Start.
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
- Description

For simultaneous multi-model inference: outer keys are model names; inner dicts map input names to numpy arrays.

- If **`model_name` is omitted** : infer all models present in `multi_input_tensors` .
- If **`model_name` is set** : only that model's inputs are kept and inferred (other models' inputs are filtered out).
- Parallel execution: one thread per model; GIL is released during inference so concurrent Python `run()` calls can achieve higher throughput.
- Parameters

| Parameter | Type | Description 
| multi_input_tensors | Dict[str, Dict[str, np.ndarray]] | Multi-model inputs: model name → (input name → tensor). Supports multiple models, each with multiple inputs. 
| model_name | str (optional) | If set, infer only this model; if omitted, infer all models with provided inputs 
| priority | optional dict (model name → int) | Inference priority for this call (temporary override) 
| bpu_cores | optional dict (model name → List[int]) | BPU core indices for this call 
| custom_id | optional dict (model name → int) | Custom priority for this call 
| device_id | optional dict (model name → int) | Device ID for this call
- Return value

Same as above.
- Example: see Single-Threaded, Multi-Model, Multi-Input Inference in Quick Start.
- Exceptions

- `ValueError` if input tensor shape or dtype does not match the model.
- Non-contiguous (non C-style) inputs are copied internally to a contiguous buffer.
- Input tensor shape must match `input_shapes` before inference.

#### QuantParams Class

Tensor quantization parameter object.

##### Properties

- scale: numpy.ndarray, scale factor array
- zero_point: numpy.ndarray, zero-point array
- quant_type: hbDNNQuantiType, quantization mode
- axis: int, quantization axis (for per-channel quantization)

##### Example:

```python
# Get quantization params for a model output
tensor_qparams = model.output_quants[model_name][output_name]
print("scale:", tensor_qparams.scale)
print("zero_point:", tensor_qparams.zero_point)
print("type:", tensor_qparams.quant_type)
print("axis:", tensor_qparams.axis)
```

#### SchedParam Class

Model scheduling parameter object describing default scheduling state for a single model (priority, core binding, etc.). Typically used to read current scheduling configuration rather than as the primary configuration API.

##### Properties

- priority: Dict[str, int]

Inference task scheduling priority, range 0–255; higher values mean higher priority.
- customId: Dict[str, int]

User-defined identifier (e.g. frame id, timestamp) passed to the low-level scheduler. Precedence: priority > customId.
- bpu_cores: Dict[str, List[int]]

BPU core list bound to the model; `[-1]` means ANY (scheduler auto-selects). S100 allows 1 core; S600 allows 0–3.
- deviceId: Dict[str, int]

Device ID for model deployment (multi-device scenarios).

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

- Dynamic inputs and outputs are untested; use with caution.
