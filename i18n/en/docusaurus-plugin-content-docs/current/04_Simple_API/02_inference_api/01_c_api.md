---
title: "C Inference API"
sidebar_position: 1
description: "hbDNN C inference API (hb_dnn.h): model loading, tensor query and management, inference execution"
---

# C Inference API

hbDNN is a C wrapper API on RDK for loading and running neural network models (`hb_dnn.h`), covering the complete flow from loading model files, querying input/output tensors and preparing memory, to submitting inference tasks and retrieving the results. Models are compiled into `.hbm` files by the AI toolchain (see "Using Your Own Model"); hbDNN parses them and executes them on the BPU.

> **Interface level**: this page is the encapsulated simple API(mode 1), ready to use out of the box. When you need to directly manage low-level primitives such as BPU cores, task scheduling and BPU memory, see [BPU Low-level API](../../07_Advanced_development/06_multimedia_development/01_multimedia_api/13_bpu_api.md); for the Python wrapper, see [Python Inference API](./02_python_api.md).

**Applicable scenarios**: loading a `.hbm` model in a C/C++ application and performing inference (custom pipelines for tasks such as classification, detection and segmentation), or scenarios that need multi-model batch loading or asynchronous task scheduling.

**Prerequisites**:

- The hobot-dnn deb package is installed on the system (pre-installed by default on RDK OS), providing `/usr/hobot/lib/libdnn.so`, `/usr/hobot/lib/libhbucp.so` and the headers `hobot/dnn/hb_dnn.h`, `hobot/dnn/hb_dnn_status.h`.
- A `.hbm` model file compiled by the AI toolchain is ready. For the pre-installed model paths on RDK, see "Model Download and Placement".
- Link with `-ldnn -lhbucp` when compiling.

hbDNN's task execution is built on top of hbUCP (Unified Computing Platform, `hb_ucp.h`/`hb_ucp_sys.h`): inference tasks are submitted via `hbUCPSubmitTask` and waited on via `hbUCPWaitTaskDone`, and tensor memory is allocated and freed via `hbUCPMallocCached`/`hbUCPFree`. These interfaces are shipped in the same package as hbDNN and are used directly in the examples on this page.

## Quick Example

The example below loads a single `.hbm` model, queries the input/output tensor properties, allocates tensor memory and performs one inference. The call sequence matches the on-board sample code (the inference-related samples under `/app`).

```c
#include <stdio.h>
#include <string.h>
#include "hobot/dnn/hb_dnn.h"
#include "hobot/dnn/hb_dnn_status.h"

int main(void) {
	hbDNNPackedHandle_t packed_handle = NULL;
	hbDNNHandle_t dnn_handle = NULL;
	hbUCPTaskHandle_t task_handle = NULL;
	const char *model_files[] = {"/opt/hobot/model/your_model.hbm"};
	int32_t ret;

	/* 1. Load the model files (multiple files can be loaded at once) */
	ret = hbDNNInitializeFromFiles(&packed_handle, model_files, 1);
	if (ret != HB_DNN_SUCCESS) {
		printf("hbDNNInitializeFromFiles failed: %d\n", ret);
		return -1;
	}

	/* 2. Get the model handle (pick by model name when multiple models are loaded) */
	const char **model_names;
	int32_t model_count;
	hbDNNGetModelNameList(&model_names, &model_count, packed_handle);
	hbDNNGetModelHandle(&dnn_handle, packed_handle, model_names[0]);

	/* 3. Query the input tensor properties and prepare the input data */
	hbDNNTensorProperties input_props;
	hbDNNGetInputTensorProperties(&input_props, dnn_handle, 0);
	hbDNNTensor input;
	memset(&input, 0, sizeof(input));
	input.properties = input_props;
	hbUCPMallocCached(&input.sysMem, input_props.alignedByteSize, 0);
	/* TODO: write the preprocessed data into input.sysMem.virAddr;
	 * see input_props.scale (scale/zeroPoint) for the quantization mapping */

	/* 4. Allocate the output tensor memory according to the output properties */
	hbDNNTensorProperties output_props;
	hbDNNGetOutputTensorProperties(&output_props, dnn_handle, 0);
	hbDNNTensor output;
	memset(&output, 0, sizeof(output));
	output.properties = output_props;
	hbUCPMallocCached(&output.sysMem, output_props.alignedByteSize, 0);

	/* 5. Submit the inference and wait for completion */
	ret = hbDNNInferV2(&task_handle, &output, &input, dnn_handle);
	if (ret == HB_DNN_SUCCESS && task_handle) {
		hbUCPSchedParam sched_param;
		HB_UCP_INITIALIZE_SCHED_PARAM(&sched_param);
		hbUCPSubmitTask(task_handle, &sched_param);
		hbUCPWaitTaskDone(task_handle, 0);  /* 0 = wait indefinitely */
		hbUCPReleaseTask(task_handle);
	}

	/* 6. Process the inference result in output.sysMem.virAddr (see
	 * output.properties.scale for dequantization), then free the resources */
	hbUCPFree(&input.sysMem);
	hbUCPFree(&output.sysMem);
	hbDNNRelease(packed_handle);
	return 0;
}
```

**Result**: the success criterion is that each call returns `HB_DNN_SUCCESS` (0). Below is the actual on-board output of the hbDNN inference pipeline (RDK S600, Ubuntu 24.04, measured on 2026-08-20): running the pre-installed ResNet18 classification sample on the board (hbDNN's Python binding `hbm_runtime` and this C API share the same underlying libraries `libdnn.so`/`libhbucp.so`; the on-board C/C++ samples are shipped as source code, see Chapter 3 for how to compile them). The output covers the hbUCP/hbDNN versions, model loading and tensor property queries, scheduling parameters, and the inference result:

```text
[UCP]: log level = 3
[UCP]: UCP version = 3.13.6
[VP]: log level = 3
[DNN]: log level = 3
[HPL]: log level = 3
[UCPT]: log level = 6
[BPU][[BPU_MONITOR]][281465365546592][INFO]BPULib verison(2, 2, 20)[b1c59d0]!
[DNN]: 3.13.6_(4.7.5 HBRT)
Model already exists: /opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm
=== Model Name List ===
['resnet18_224x224_nv12']

=== Model Count ===
1

=== Input Counts ===
resnet18_224x224_nv12: 2

=== Input Names ===
resnet18_224x224_nv12:
  - input_y
  - input_uv

=== Input Tensor Shapes ===
resnet18_224x224_nv12:
  input_uv -> shape: [1, 112, 112, 2]
  input_y -> shape: [1, 224, 224, 1]

=== Input Tensor Types ===
resnet18_224x224_nv12:
  input_uv -> dtype: U8
  input_y -> dtype: U8

=== Input Quantization Info ===
resnet18_224x224_nv12:
  input_uv:
    quanti_type: NONE
    quantize_axis: 0
    scale_data: []
    zero_point_data: []
  input_y:
    quanti_type: NONE
    quantize_axis: 0
    scale_data: []
    zero_point_data: []

=== Input Tensor Stride ===
resnet18_224x224_nv12:
  input_uv -> stride: [-1, -1, 2, 1]
  input_y -> stride: [-1, -1, 1, 1]
[Input] resnet18_224x224_nv12.input_uv desc: 
[Input] resnet18_224x224_nv12.input_y desc: 

================ OUTPUT TESTS ================

=== Output Counts ===
resnet18_224x224_nv12: 1

=== Output Names ===
resnet18_224x224_nv12:
  - output

=== Output Tensor Shapes ===
resnet18_224x224_nv12:
  output -> shape: [1, 1000]

=== Output Tensor Types ===
resnet18_224x224_nv12:
  output -> dtype: F32

=== Output Quantization Info ===
resnet18_224x224_nv12:
  output:
    quanti_type: NONE
    quantize_axis: 0
    scale_data: []
    zero_point_data: []

=== Output Tensor Stride ===
resnet18_224x224_nv12:
  output -> stride: [4000, 4]
[Output] resnet18_224x224_nv12.output desc: 

Model Description:
 - resnet18_224x224_nv12: {"BUILDER_VERSION": "3.5.3", "HBDK_VERSION": "4.7.5", "HBDK_RUNTIME_VERSION": null, "HMCT_VERSION": "2.6.5", "CAFFE_MODEL": null, "PROTOTXT": null, "ONNX_MODEL": "/home/jenkins/agent/workspace/Release_Job_j6-3.5.6-py310-4-all/j6_toolchain/samples/01_common/model_zoo/mapper/classification/resnet18/resnet18.onnx", "MARCH": "nash-p", "LAYER_OUT_DUMP": "False", "LOG_LEVEL": null, "WORKING_DIR": "/home/jenkins/agent/workspace/Release_Job_j6-3.5.6-py310-4-all/j6_toolchain/samples/03_classification/13_resnet18/model_output", "MODEL_PREFIX": "resnet18_224x224_nv12", "OUTPUT_NODES": "", "REMOVE_NODE_TYPE": "", "REMOVE_NODE_NAME": "", "DEBUG_MODE": "", "NODE_INFO": "{}", "INPUT_NAMES": "input", "INPUT_SPACE_AND_RANGE": "regular", "INPUT_TYPE_RT": "nv12", "INPUT_TYPE_TRAIN": "rgb", "INPUT_LAYOUT_TRAIN": "NCHW", "INPUT_LAYOUT_RT": "", "NORM_TYPE": "data_mean_and_scale", "MEAN_VALUE": "[123.675, 116.28, 103.53]", "SCALE_VALUE": "[0.01712475, 0.017507, 0.01742919]", "STD_VALUE": "[]", "INPUT_SHAPE": "1x3x224x224", "INPUT_BATCH": "", "SEPARATE_BATCH": "False", "SEPARATE_NAME": "", "CUSTOM_OP_METHOD": null, "CUSTOM_OP_DIR": null, "CUSTOM_OP_REGISTER_FILES": "", "OPTIMIZATION": "", "CALI_TYPE": "default", "CAL_DATA_DIR": "/home/jenkins/agent/workspace/Release_Job_j6-3.5.6-py310-4-all/j6_toolchain/samples/03_classification/13_resnet18/calibration_data_bgr", "PER_CHANNEL": "False", "MAX_PERCENTILE": "None", "RUN_ON_CPU": "", "RUN_ON_BPU": "", "QUANT_CONFIG": null, "ADVICE": 0.0, "DEBUG": "True", "OPTIMIZE_LEVEL": "O2", "COMPILE_MODE": "latency", "CORE_NUM": 1, "MAX_TIME_PER_FC": 0, "BALANCE_FACTOR": 100, "ABILITY_ENTRY": null, "INPUT_SOURCE": {"input": "pyramid"}, "hbdk3_compatible_mode": null, "cache_mode": "disable", "cache_path": "", "max_l2m_size": 0, "CALI_EXTRA_PARAM": {}, "EXTRA_PARAMS": {}}

HBM Description:
 - /opt/hobot/model/s600/basic/resnet18_224x224_nv12.hbm: 

=== Scheduling Parameters ===
resnet18_224x224_nv12:
  priority    : 0
  customId    : 0
  bpu_cores   : [0]
  deviceId    : 0
Top-5 Predictions:
zebra: 0.9983
cheetah, chetah, Acinonyx jubatus: 0.0004
impala, Aepyceros melampus: 0.0004
gazelle: 0.0003
prairie chicken, prairie grouse, prairie fowl: 0.0002
```

Success criteria: the log shows `[DNN]: 3.13.6_(4.7.5 HBRT)` (hbDNN initialized successfully), the `Model Description` and `Scheduling Parameters` query outputs appear, and finally the Top-K inference results are given. For the complete pre-installed samples on the board, see the Chapter 3 algorithm demos (`/app/cdev_demo/bpu`, `/app/pydev_demo`).

## API Overview

### Model Loading and Release

| Function | Description |
|---|---|
| `hbDNNGetVersion` | Get the hbDNN version string |
| `hbDNNInitializeFromFiles` | Load models from a list of `.hbm` files (multi-model packing supported) |
| `hbDNNInitializeFromDDR` | Load models from in-memory data (without going through the file system) |
| `hbDNNRelease` | Release all models and resources inside the packed handle |

### Model Handles and Information Query

| Function | Description |
|---|---|
| `hbDNNGetModelNameList` | Get the names of all models inside the packed handle |
| `hbDNNGetModelHandle` | Get a single-model handle by model name |
| `hbDNNGetModelDesc` | Get the model description information |
| `hbDNNGetHBMDesc` | Get the description information of the specified hbm model |
| `hbDNNGetCompileBpuCoreNum` | Get the BPU core count specified when the model was compiled |

### Input/Output Tensor Query

| Function | Description |
|---|---|
| `hbDNNGetInputCount` | Get the number of input tensors of the model |
| `hbDNNGetInputName` | Get the input tensor name |
| `hbDNNGetInputTensorProperties` | Get the input tensor properties (shape/type/quantization parameters/aligned byte size) |
| `hbDNNGetInputDesc` | Get the input tensor description information |
| `hbDNNGetOutputCount` | Get the number of output tensors of the model |
| `hbDNNGetOutputName` | Get the output tensor name |
| `hbDNNGetOutputTensorProperties` | Get the output tensor properties |
| `hbDNNGetOutputDesc` | Get the output tensor description information |

### Inference Execution

| Function | Description |
|---|---|
| `hbDNNInferV2` | Perform inference, creating or appending a task |
| `hbDNNGetTaskOutputTensorProperties` | Get the output tensor properties of a task (dynamic output scenarios) |

## Interface Details

### hbDNNGetVersion

```c
char const *hbDNNGetVersion();
```

Returns the hbDNN version information string, which can be used for a runtime environment self-check.

**Note**:

No model needs to be loaded first; this interface can be called directly for a runtime environment self-check.

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNInitializeFromFiles

```c
int32_t hbDNNInitializeFromFiles(hbDNNPackedHandle_t *dnnPackedHandle,
                                 char const **modelFileNames,
                                 int32_t modelFileCount);
```

| Parameter | Direction | Description |
|---|---|---|
| `dnnPackedHandle` | out | Packed handle pointing to the multiple models |
| `modelFileNames` | in | Array of `.hbm` model file paths |
| `modelFileCount` | in | Number of model files |

Loads one or more models from files. Returns `HB_DNN_SUCCESS` on success; returns `HB_DNN_CAN_NOT_OPEN_FILE` when a file does not exist, and `HB_DNN_INVALID_MODEL` when a model is invalid.

**Note**:

The model must be a `.hbm` file compiled by the AI toolchain for the target platform; `HB_DNN_CAN_NOT_OPEN_FILE` is returned when a file does not exist, and `HB_DNN_INVALID_MODEL` is returned when a model is invalid.

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNInitializeFromDDR

```c
int32_t hbDNNInitializeFromDDR(hbDNNPackedHandle_t *dnnPackedHandle,
                               const void **modelData,
                               int32_t *modelDataLengths,
                               int32_t modelDataCount);
```

Loads models from memory (the model data has already been read into memory, without going through the file system). The parameter meanings correspond to those of `hbDNNInitializeFromFiles`.

**Note**:

The model data must already have been read into memory (without going through the file system); the parameter meanings correspond to those of `hbDNNInitializeFromFiles`.

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNRelease

```c
int32_t hbDNNRelease(hbDNNPackedHandle_t dnnPackedHandle);
```

Releases all models and related resources inside the packed handle. It should be called after all inference tasks are completed.

**Note**:

It should be called after all inference tasks are completed, to release all models and related resources inside the packed handle.

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNGetModelNameList

```c
int32_t hbDNNGetModelNameList(char const ***modelNameList,
                              int32_t *modelNameCount,
                              hbDNNPackedHandle_t dnnPackedHandle);
```

Gets the name list and count of all models inside the packed handle, used to distinguish handles in multi-model scenarios.

**Note**:

Used to distinguish handles in multi-model scenarios; the returned model name list is used by `hbDNNGetModelHandle` to obtain a handle by name.

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNGetModelHandle

```c
int32_t hbDNNGetModelHandle(hbDNNHandle_t *dnnHandle,
                            hbDNNPackedHandle_t dnnPackedHandle,
                            char const *modelName);
```

Gets the single-model handle `hbDNNHandle_t` from the packed handle by model name. All subsequent tensor queries and inference take this handle as a parameter.

**Note**:

All subsequent tensor queries and inference take the returned `hbDNNHandle_t` handle as a parameter.

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNGetModelDesc / hbDNNGetHBMDesc

```c
int32_t hbDNNGetModelDesc(char const **desc, uint32_t *size, int32_t *type,
                          hbDNNHandle_t dnnHandle);
int32_t hbDNNGetHBMDesc(char const **desc, uint32_t *size, int32_t *type,
                        hbDNNPackedHandle_t dnnPackedHandle, int32_t index);
```

Gets the description information of a model / a specified hbm file; see `hbDNNDescType` for the values of `type`. The `index` of `hbDNNGetHBMDesc` is the file sequence number at load time (0 ~ file count - 1).

**Note**:

See `hbDNNDescType` for the values of `type`; the `index` of `hbDNNGetHBMDesc` is the file sequence number at load time (0 ~ file count - 1).

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNGetCompileBpuCoreNum

```c
int32_t hbDNNGetCompileBpuCoreNum(int32_t *bpuCoreNum, hbDNNHandle_t dnnHandle);
```

Gets the BPU core count specified when the model was compiled by the toolchain. Scheduling of multi-core models is handled by hbUCP.

**Note**:

Returns the BPU core count specified when the model was compiled by the toolchain; scheduling of multi-core models is handled by hbUCP.

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNGetInputCount / hbDNNGetOutputCount

```c
int32_t hbDNNGetInputCount(int32_t *inputCount, hbDNNHandle_t dnnHandle);
int32_t hbDNNGetOutputCount(int32_t *outputCount, hbDNNHandle_t dnnHandle);
```

Gets the number of input/output tensors of the model, used to iterate over tensors by index.

**Note**:

Used to iterate over tensors by index; the index range is determined by the return value.

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNGetInputName / hbDNNGetOutputName

```c
int32_t hbDNNGetInputName(char const **name, hbDNNHandle_t dnnHandle,
                          int32_t inputIndex);
int32_t hbDNNGetOutputName(char const **name, hbDNNHandle_t dnnHandle,
                           int32_t outputIndex);
```

Gets the input/output tensor name by index.

**Note**:

Gets the input/output tensor name by index; the index range is determined by the return values of `hbDNNGetInputCount`/`hbDNNGetOutputCount`.

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNGetInputTensorProperties / hbDNNGetOutputTensorProperties

```c
int32_t hbDNNGetInputTensorProperties(hbDNNTensorProperties *properties,
                                      hbDNNHandle_t dnnHandle,
                                      int32_t inputIndex);
int32_t hbDNNGetOutputTensorProperties(hbDNNTensorProperties *properties,
                                       hbDNNHandle_t dnnHandle,
                                       int32_t outputIndex);
```

Gets the input/output tensor properties (`hbDNNTensorProperties`), including the valid shape, data type, quantization scale/zeroPoint, and `alignedByteSize` (allocate tensor memory according to this value).

**Note**:

Allocate tensor memory according to the returned `alignedByteSize` (e.g. via `hbUCPMallocCached`); `scale`/`zeroPoint` are used for quantization/dequantization.

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNGetInputDesc / hbDNNGetOutputDesc

```c
int32_t hbDNNGetInputDesc(char const **desc, uint32_t *size, int32_t *type,
                          hbDNNHandle_t dnnHandle, int32_t inputIndex);
int32_t hbDNNGetOutputDesc(char const **desc, uint32_t *size, int32_t *type,
                           hbDNNHandle_t dnnHandle, int32_t outputIndex);
```

Gets the description information of the input/output tensors; see `hbDNNDescType` for the values of `type`.

**Note**:

See `hbDNNDescType` for the values of `type`.

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNInferV2

```c
int32_t hbDNNInferV2(hbUCPTaskHandle_t *taskHandle, hbDNNTensor *output,
                     hbDNNTensor const *input, hbDNNHandle_t dnnHandle);
```

| Parameter | Direction | Description |
|---|---|---|
| `taskHandle` | in/out | Task handle; three usage patterns, see below |
| `output` | out | Output tensor array; the element count must equal the return value of `hbDNNGetOutputCount` |
| `input` | in | Input tensor array; the element count must equal the return value of `hbDNNGetInputCount` |
| `dnnHandle` | in | Model handle |

The three usage patterns of `taskHandle` (as specified by the header file):

1. Pass a handle pointing to `NULL`: a new task is created;
2. Pass an already created, not-yet-submitted and not-yet-released handle: this inference is appended as a subtask of that task (multi-model task);
3. Pass `NULL`: synchronous mode, executed directly with the default scheduling parameters.

In asynchronous mode, after `hbDNNInferV2` returns the task has not finished yet; it must be submitted via `hbUCPSubmitTask`, waited on via `hbUCPWaitTaskDone`, and released via `hbUCPReleaseTask` (see step 5 of the Quick Example).

**Note**:

The element counts of the `input`/`output` tensor arrays must equal the return values of `hbDNNGetInputCount`/`hbDNNGetOutputCount` respectively; in asynchronous mode the task has not finished when this interface returns, so it must be submitted via `hbUCPSubmitTask`, waited on via `hbUCPWaitTaskDone`, and released via `hbUCPReleaseTask`.

**Compatibility**:

Supports RDK S100 and RDK S600.

### hbDNNGetTaskOutputTensorProperties

```c
int32_t hbDNNGetTaskOutputTensorProperties(hbDNNTensorProperties *properties,
                                           hbUCPTaskHandle_t taskHandle,
                                           int32_t subTaskIndex,
                                           int32_t outputIndex);
```

Gets the tensor properties of the specified subtask and output index within a task, used for dynamic output scenarios. Tasks executed synchronously cannot obtain a taskHandle, so this interface is not supported for them.

**Note**:

Used for dynamic output scenarios; tasks executed synchronously cannot obtain a taskHandle, so this interface is not supported for them.

**Compatibility**:

Supports RDK S100 and RDK S600.

## Data Structures

### Handle Types

| Type | Description |
|---|---|
| `hbDNNPackedHandle_t` | Points to the multi-model set loaded at once |
| `hbDNNHandle_t` | Single-model handle |
| `hbUCPTaskHandle_t` | Inference task handle (defined by hbUCP) |

### hbDNNTensor (Tensor)

```c
typedef struct hbDNNTensor {
	hbUCPSysMem sysMem;              /* tensor memory (physical address/virtual address/size) */
	hbDNNTensorProperties properties; /* tensor properties */
} hbDNNTensor;
```

`hbUCPSysMem` is allocated by `hbUCPMallocCached`/`hbUCPMalloc` and contains the three fields `phyAddr`, `virAddr` and `memSize`; data is read and written through `virAddr`.

### hbDNNTensorProperties (Tensor Properties)

| Field | Description |
|---|---|
| `validShape` | Valid shape: `dimensionSize[]` + dimension count `numDimensions` (up to 10 dimensions) |
| `tensorType` | Data type; see `hbDNNDataType` for values |
| `scale` | Quantization parameter `hbDNNQuantiScale` (scale array + zeroPoint array) |
| `quantiType` | Quantization type: `NONE` (not quantized) / `SCALE` |
| `quantizeAxis` | Quantization axis |
| `alignedByteSize` | Aligned memory size in bytes; call `hbUCPMallocCached` with this value to allocate tensor memory |
| `stride` | stride of each dimension |

**Quantization/Dequantization** (per the `hbDNNQuantiScale` convention):

- Dequantization: when `zeroPointLen == 0`, `f(x) = x * scale`; when `zeroPointLen > 0`, `f(x) = (x - zeroPoint) * scale`.
- Quantization: `f(x) = clip(nearbyint(x / scale))` (with zeroPoint added back afterwards when present); U8 is clamped to 0~255, S8 to -128~127.

### hbDNNDataType (Data Types)

`HB_DNN_TENSOR_TYPE_S4/U4/S8/U8/F16/S16/U16/F32/S32/U32/F64/S64/U64/BOOL8`, covering the common quantized and floating-point tensor types.

### hbDNNDescType (Description Info Types)

| Value | Description |
|---|---|
| `HB_DNN_DESC_TYPE_UNKNOWN` | Unknown |
| `HB_DNN_DESC_TYPE_STRING` | The description info is a string |

## Error Codes (hb_dnn_status.h)

`hbDNNStatus` is defined in `hb_dnn_status.h` (mapped from the hbUCP error codes). Common entries:

| Error Code | Meaning |
|---|---|
| `HB_DNN_SUCCESS` | Success |
| `HB_DNN_INVALID_ARGUMENT` | Invalid argument (including invalid packed/dnn handle) |
| `HB_DNN_INVALID_MODEL` | Invalid model |
| `HB_DNN_CAN_NOT_OPEN_FILE` | The model file cannot be opened |
| `HB_DNN_OUT_OF_MEMORY` | Memory allocation failed |
| `HB_DNN_TIMEOUT` | Task wait timed out |
| `HB_DNN_MODEL_IS_RUNNING` | The model is currently running |
| `HB_DNN_INCOMPATIBLE_MODEL` | The model is incompatible with the current platform |
| `HB_DNN_TASK_NUM_EXCEED_LIMIT` | The number of tasks exceeds the limit |

For the complete list, see `hobot/dnn/hb_dnn_status.h`.

## FAQ

**Q: Loading a model returns `HB_DNN_CAN_NOT_OPEN_FILE`?**
Check the `.hbm` file path and permissions. For the pre-installed model paths, see "Model Download and Placement".

**Q: Loading a model returns `HB_DNN_INCOMPATIBLE_MODEL`?**
The model must match the target platform: models for RDK S100 and RDK S600 are not interchangeable; recompile with the AI toolchain for the target platform (see "Using Your Own Model").

**Q: The inference output values do not match the expected ones?**
Check that the input is correctly quantized according to `hbDNNTensorProperties.scale` and that the output is dequantized with the same parameters; confirm that the input shape and data type (`tensorType`) match what was used when the model was compiled.

**Q: How do I specify BPU cores or priority after submitting a task?**
Via `hbUCPSchedParam` (initialize with the `HB_UCP_INITIALIZE_SCHED_PARAM` macro and then modify the `backend`/`priority` fields; core definitions such as `HB_UCP_BPU_CORE_0`). For more low-level core management, see [BPU Low-level API](../../07_Advanced_development/06_multimedia_development/01_multimedia_api/13_bpu_api.md).

## Related Documentation

- [Python Inference API](./02_python_api.md)
- [BPU Low-level API](../../07_Advanced_development/06_multimedia_development/01_multimedia_api/13_bpu_api.md)
- [Algorithm Demos](../../03_Demos/03_algorithm_demo/01_summary.md)
- [Model Download and Placement](../../03_Demos/04_demo_support/01_model_files.md)
- [Using Your Own Model](../../03_Demos/04_demo_support/04_custom_model.md)
