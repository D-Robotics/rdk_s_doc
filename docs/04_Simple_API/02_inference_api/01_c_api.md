---
title: "C 语言推理 API"
sidebar_position: 1
description: "hbDNN C 推理接口（hb_dnn.h）：模型加载、张量查询与管理、推理执行"
---

# C 语言推理 API

hbDNN 是 RDK 上加载与运行神经网络模型的 C 封装接口（`hb_dnn.h`），覆盖从模型文件加载、输入输出张量查询与内存准备，到提交推理任务并取回结果的完整流程。模型由 AI 工具链编译为 `.hbm` 文件（见「使用自己的模型」），hbDNN 负责解析并在 BPU 上执行。

> **接口层级**：本篇是【封装层简易接口】（模式 1），开箱即用。需要直接管理 BPU 核、任务调度与 BPU 内存等底层原语时，见 [BPU 底层 API](../../07_Advanced_development/06_multimedia_development/01_multimedia_api/12_bpu_api.md)；Python 封装见 [Python 推理 API](./02_python_api.md)。

**适用场景**：在 C/C++ 应用中加载 `.hbm` 模型并执行推理（分类、检测、分割等任务的自建流水线），或需要多模型打包加载、异步任务调度的场景。

**前置条件**：

- 系统已安装 hobot-dnn deb 包（RDK OS 默认预装），提供 `/usr/hobot/lib/libdnn.so`、`/usr/hobot/lib/libhbucp.so` 与头文件 `hobot/dnn/hb_dnn.h`、`hobot/dnn/hb_dnn_status.h`。
- 已准备好 AI 工具链编译的 `.hbm` 模型文件。RDK 预置模型路径见「模型获取与放置」。
- 编译链接 `-ldnn -lhbucp`。

hbDNN 的任务执行构建在 hbUCP（Unified Computing Platform，`hb_ucp.h`/`hb_ucp_sys.h`）之上：推理任务通过 `hbUCPSubmitTask` 提交、`hbUCPWaitTaskDone` 等待，张量内存通过 `hbUCPMallocCached`/`hbUCPFree` 分配释放。这些接口与 hbDNN 同包提供，本篇示例中直接使用。

## 快速示例

以下示例加载单个 `.hbm` 模型，查询输入输出张量属性，分配张量内存并执行一次推理。调用序列与板端示例代码（`/app` 下推理类 sample）一致。

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

	/* 1. 加载模型文件（支持一次加载多个） */
	ret = hbDNNInitializeFromFiles(&packed_handle, model_files, 1);
	if (ret != HB_DNN_SUCCESS) {
		printf("hbDNNInitializeFromFiles failed: %d\n", ret);
		return -1;
	}

	/* 2. 获取模型句柄（多模型时按模型名取） */
	const char **model_names;
	int32_t model_count;
	hbDNNGetModelNameList(&model_names, &model_count, packed_handle);
	hbDNNGetModelHandle(&dnn_handle, packed_handle, model_names[0]);

	/* 3. 查询输入张量属性，准备输入数据 */
	hbDNNTensorProperties input_props;
	hbDNNGetInputTensorProperties(&input_props, dnn_handle, 0);
	hbDNNTensor input;
	memset(&input, 0, sizeof(input));
	input.properties = input_props;
	hbUCPMallocCached(&input.sysMem, input_props.alignedByteSize, 0);
	/* TODO: 将预处理后的数据写入 input.sysMem.virAddr，
	 * 量化关系见 input_props.scale（scale/zeroPoint） */

	/* 4. 按输出属性分配输出张量内存 */
	hbDNNTensorProperties output_props;
	hbDNNGetOutputTensorProperties(&output_props, dnn_handle, 0);
	hbDNNTensor output;
	memset(&output, 0, sizeof(output));
	output.properties = output_props;
	hbUCPMallocCached(&output.sysMem, output_props.alignedByteSize, 0);

	/* 5. 提交推理并等待完成 */
	ret = hbDNNInferV2(&task_handle, &output, &input, dnn_handle);
	if (ret == HB_DNN_SUCCESS && task_handle) {
		hbUCPSchedParam sched_param;
		HB_UCP_INITIALIZE_SCHED_PARAM(&sched_param);
		hbUCPSubmitTask(task_handle, &sched_param);
		hbUCPWaitTaskDone(task_handle, 0);  /* 0 = 无限等待 */
		hbUCPReleaseTask(task_handle);
	}

	/* 6. 处理 output.sysMem.virAddr 中的推理结果（反量化见
	 * output.properties.scale），然后释放资源 */
	hbUCPFree(&input.sysMem);
	hbUCPFree(&output.sysMem);
	hbDNNRelease(packed_handle);
	return 0;
}
```

**运行效果**：成功标志为各调用返回 `HB_DNN_SUCCESS`（0）。以下为 hbDNN 推理链路的板端实测输出（RDK S600，Ubuntu 24.04，2026-08-20 实测）：运行板端预置的 ResNet18 分类示例（hbDNN 的 Python 绑定 `hbm_runtime` 与本篇 C API 共享同一底层库 `libdnn.so`/`libhbucp.so`；板端 C/C++ 示例为源码，编译方法见第 3 章），输出含 hbUCP/hbDNN 版本、模型加载与张量属性查询、调度参数和推理结果：

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

成功标志：日志出现 `[DNN]: 3.13.6_(4.7.5 HBRT)`（hbDNN 初始化成功）、`Model Description` 与 `Scheduling Parameters` 查询输出，最终给出 Top-K 推理结果。板端预置的完整示例见第 3 章算法示例（`/app/cdev_demo/bpu`、`/app/pydev_demo`）。

## API 清单

### 模型加载与释放

| 函数 | 说明 |
|---|---|
| `hbDNNGetVersion` | 获取 hbDNN 版本字符串 |
| `hbDNNInitializeFromFiles` | 从 `.hbm` 文件列表加载模型（支持多模型打包） |
| `hbDNNInitializeFromDDR` | 从内存数据加载模型（不经过文件系统） |
| `hbDNNRelease` | 释放 packed handle 内的全部模型及资源 |

### 模型句柄与信息查询

| 函数 | 说明 |
|---|---|
| `hbDNNGetModelNameList` | 获取 packed handle 内全部模型名 |
| `hbDNNGetModelHandle` | 按模型名取单模型句柄 |
| `hbDNNGetModelDesc` | 获取模型描述信息 |
| `hbDNNGetHBMDesc` | 获取指定 hbm 模型的描述信息 |
| `hbDNNGetCompileBpuCoreNum` | 获取模型编译时指定的 BPU 核数 |

### 输入输出张量查询

| 函数 | 说明 |
|---|---|
| `hbDNNGetInputCount` | 获取模型输入张量个数 |
| `hbDNNGetInputName` | 获取输入张量名 |
| `hbDNNGetInputTensorProperties` | 获取输入张量属性（shape/类型/量化参数/对齐字节数） |
| `hbDNNGetInputDesc` | 获取输入张量描述信息 |
| `hbDNNGetOutputCount` | 获取模型输出张量个数 |
| `hbDNNGetOutputName` | 获取输出张量名 |
| `hbDNNGetOutputTensorProperties` | 获取输出张量属性 |
| `hbDNNGetOutputDesc` | 获取输出张量描述信息 |

### 推理执行

| 函数 | 说明 |
|---|---|
| `hbDNNInferV2` | 执行推理，创建或追加任务 |
| `hbDNNGetTaskOutputTensorProperties` | 获取任务的输出张量属性（动态输出场景） |

## 接口详解

### hbDNNGetVersion

```c
char const *hbDNNGetVersion();
```

返回 hbDNN 版本信息字符串，可用于运行环境自检。

### hbDNNInitializeFromFiles

```c
int32_t hbDNNInitializeFromFiles(hbDNNPackedHandle_t *dnnPackedHandle,
                                 char const **modelFileNames,
                                 int32_t modelFileCount);
```

| 参数 | 方向 | 说明 |
|---|---|---|
| `dnnPackedHandle` | out | 指向多模型的 packed handle |
| `modelFileNames` | in | `.hbm` 模型文件路径数组 |
| `modelFileCount` | in | 模型文件个数 |

从文件加载一个或多个模型。成功返回 `HB_DNN_SUCCESS`；文件不存在返回 `HB_DNN_CAN_NOT_OPEN_FILE`，模型不合法返回 `HB_DNN_INVALID_MODEL`。

### hbDNNInitializeFromDDR

```c
int32_t hbDNNInitializeFromDDR(hbDNNPackedHandle_t *dnnPackedHandle,
                               const void **modelData,
                               int32_t *modelDataLengths,
                               int32_t modelDataCount);
```

从内存加载模型（模型数据已读入内存、不经文件系统），参数含义与 `hbDNNInitializeFromFiles` 对应。

### hbDNNRelease

```c
int32_t hbDNNRelease(hbDNNPackedHandle_t dnnPackedHandle);
```

释放 packed handle 内的全部模型与相关资源。应在所有推理任务完成后调用。

### hbDNNGetModelNameList

```c
int32_t hbDNNGetModelNameList(char const ***modelNameList,
                              int32_t *modelNameCount,
                              hbDNNPackedHandle_t dnnPackedHandle);
```

获取 packed handle 内全部模型的名称列表与个数，用于多模型场景区分句柄。

### hbDNNGetModelHandle

```c
int32_t hbDNNGetModelHandle(hbDNNHandle_t *dnnHandle,
                            hbDNNPackedHandle_t dnnPackedHandle,
                            char const *modelName);
```

按模型名从 packed handle 中取单模型句柄 `hbDNNHandle_t`，后续张量查询与推理均以该句柄为参数。

### hbDNNGetModelDesc / hbDNNGetHBMDesc

```c
int32_t hbDNNGetModelDesc(char const **desc, uint32_t *size, int32_t *type,
                          hbDNNHandle_t dnnHandle);
int32_t hbDNNGetHBMDesc(char const **desc, uint32_t *size, int32_t *type,
                        hbDNNPackedHandle_t dnnPackedHandle, int32_t index);
```

获取模型/指定 hbm 文件的描述信息，`type` 取值见 `hbDNNDescType`。`hbDNNGetHBMDesc` 的 `index` 为加载时的文件序号（0 ~ 文件数-1）。

### hbDNNGetCompileBpuCoreNum

```c
int32_t hbDNNGetCompileBpuCoreNum(int32_t *bpuCoreNum, hbDNNHandle_t dnnHandle);
```

获取模型在工具链编译时指定的 BPU 核数。多核模型的调度由 hbUCP 完成。

### hbDNNGetInputCount / hbDNNGetOutputCount

```c
int32_t hbDNNGetInputCount(int32_t *inputCount, hbDNNHandle_t dnnHandle);
int32_t hbDNNGetOutputCount(int32_t *outputCount, hbDNNHandle_t dnnHandle);
```

获取模型输入/输出张量个数，用于按索引遍历张量。

### hbDNNGetInputName / hbDNNGetOutputName

```c
int32_t hbDNNGetInputName(char const **name, hbDNNHandle_t dnnHandle,
                          int32_t inputIndex);
int32_t hbDNNGetOutputName(char const **name, hbDNNHandle_t dnnHandle,
                           int32_t outputIndex);
```

按索引获取输入/输出张量名。

### hbDNNGetInputTensorProperties / hbDNNGetOutputTensorProperties

```c
int32_t hbDNNGetInputTensorProperties(hbDNNTensorProperties *properties,
                                      hbDNNHandle_t dnnHandle,
                                      int32_t inputIndex);
int32_t hbDNNGetOutputTensorProperties(hbDNNTensorProperties *properties,
                                       hbDNNHandle_t dnnHandle,
                                       int32_t outputIndex);
```

获取输入/输出张量属性（`hbDNNTensorProperties`），包括有效 shape、数据类型、量化 scale/zeroPoint 与 `alignedByteSize`（按此值分配张量内存）。

### hbDNNGetInputDesc / hbDNNGetOutputDesc

```c
int32_t hbDNNGetInputDesc(char const **desc, uint32_t *size, int32_t *type,
                          hbDNNHandle_t dnnHandle, int32_t inputIndex);
int32_t hbDNNGetOutputDesc(char const **desc, uint32_t *size, int32_t *type,
                           hbDNNHandle_t dnnHandle, int32_t outputIndex);
```

获取输入/输出张量的描述信息，`type` 取值见 `hbDNNDescType`。

### hbDNNInferV2

```c
int32_t hbDNNInferV2(hbUCPTaskHandle_t *taskHandle, hbDNNTensor *output,
                     hbDNNTensor const *input, hbDNNHandle_t dnnHandle);
```

| 参数 | 方向 | 说明 |
|---|---|---|
| `taskHandle` | in/out | 任务句柄，三种用法见下 |
| `output` | out | 输出张量数组，元素个数须等于 `hbDNNGetOutputCount` 返回值 |
| `input` | in | 输入张量数组，元素个数须等于 `hbDNNGetInputCount` 返回值 |
| `dnnHandle` | in | 模型句柄 |

`taskHandle` 三种用法（按头文件约定）：

1. 传入指向 `NULL` 的句柄：创建新任务；
2. 传入已创建、未提交未释放的句柄：把本次推理追加为该任务的子任务（多模型任务）；
3. 传入 `NULL`：同步模式，使用默认调度参数直接执行。

异步模式下，`hbDNNInferV2` 返回后任务尚未执行完毕，需经 `hbUCPSubmitTask` 提交、`hbUCPWaitTaskDone` 等待、`hbUCPReleaseTask` 释放（见快速示例第 5 步）。

### hbDNNGetTaskOutputTensorProperties

```c
int32_t hbDNNGetTaskOutputTensorProperties(hbDNNTensorProperties *properties,
                                           hbUCPTaskHandle_t taskHandle,
                                           int32_t subTaskIndex,
                                           int32_t outputIndex);
```

获取任务中指定子任务、指定输出索引的张量属性，用于动态输出场景。同步执行任务无法取得 taskHandle，不支持本接口。

## 数据结构

### 句柄类型

| 类型 | 说明 |
|---|---|
| `hbDNNPackedHandle_t` | 指向一次加载的多模型集合 |
| `hbDNNHandle_t` | 单模型句柄 |
| `hbUCPTaskHandle_t` | 推理任务句柄（hbUCP 定义） |

### hbDNNTensor（张量）

```c
typedef struct hbDNNTensor {
	hbUCPSysMem sysMem;              /* 张量内存（物理地址/虚拟地址/大小） */
	hbDNNTensorProperties properties; /* 张量属性 */
} hbDNNTensor;
```

`hbUCPSysMem` 由 `hbUCPMallocCached`/`hbUCPMalloc` 分配，含 `phyAddr`、`virAddr`、`memSize` 三个字段；读写数据使用 `virAddr`。

### hbDNNTensorProperties（张量属性）

| 字段 | 说明 |
|---|---|
| `validShape` | 有效 shape：`dimensionSize[]` + 维数 `numDimensions`（最多 10 维） |
| `tensorType` | 数据类型，取值见 `hbDNNDataType` |
| `scale` | 量化参数 `hbDNNQuantiScale`（scale 数组 + zeroPoint 数组） |
| `quantiType` | 量化类型：`NONE`（未量化）/ `SCALE` |
| `quantizeAxis` | 量化轴 |
| `alignedByteSize` | 对齐后的内存字节数，按此值调用 `hbUCPMallocCached` 分配张量内存 |
| `stride` | 各维 stride |

**量化/反量化**（按 `hbDNNQuantiScale` 约定）：

- 反量化：`zeroPointLen == 0` 时 `f(x) = x * scale`；`zeroPointLen > 0` 时 `f(x) = (x - zeroPoint) * scale`。
- 量化：`f(x) = clip(nearbyint(x / scale))`（有 zeroPoint 时再加回），U8 截断到 0~255、S8 截断到 -128~127。

### hbDNNDataType（数据类型）

`HB_DNN_TENSOR_TYPE_S4/U4/S8/U8/F16/S16/U16/F32/S32/U32/F64/S64/U64/BOOL8`，覆盖常见量化与浮点张量类型。

### hbDNNDescType（描述信息类型）

| 取值 | 说明 |
|---|---|
| `HB_DNN_DESC_TYPE_UNKNOWN` | 未知 |
| `HB_DNN_DESC_TYPE_STRING` | 描述信息为字符串 |

## 错误码（hb_dnn_status.h）

`hbDNNStatus` 定义于 `hb_dnn_status.h`（映射自 hbUCP 错误码），常见项：

| 错误码 | 含义 |
|---|---|
| `HB_DNN_SUCCESS` | 成功 |
| `HB_DNN_INVALID_ARGUMENT` | 参数非法（含非法的 packed/dnn handle） |
| `HB_DNN_INVALID_MODEL` | 模型不合法 |
| `HB_DNN_CAN_NOT_OPEN_FILE` | 模型文件无法打开 |
| `HB_DNN_OUT_OF_MEMORY` | 内存分配失败 |
| `HB_DNN_TIMEOUT` | 任务等待超时 |
| `HB_DNN_MODEL_IS_RUNNING` | 模型正在运行中 |
| `HB_DNN_INCOMPATIBLE_MODEL` | 模型与当前平台不兼容 |
| `HB_DNN_TASK_NUM_EXCEED_LIMIT` | 任务数超出上限 |

完整列表见 `hobot/dnn/hb_dnn_status.h`。

## 常见问题

**Q：加载模型返回 `HB_DNN_CAN_NOT_OPEN_FILE`？**
检查 `.hbm` 文件路径与权限。预置模型路径见「模型获取与放置」。

**Q：加载模型返回 `HB_DNN_INCOMPATIBLE_MODEL`？**
模型需与目标平台匹配：RDK S100 与 RDK S600 的模型不通用，须用 AI 工具链针对目标平台重新编译（见「使用自己的模型」）。

**Q：推理输出数值与预期不符？**
检查输入是否按 `hbDNNTensorProperties.scale` 正确量化、输出是否按同一参数反量化；确认输入 shape、数据类型（`tensorType`）与模型编译时一致。

**Q：任务提交后如何指定 BPU 核或优先级？**
通过 `hbUCPSchedParam`（`HB_UCP_INITIALIZE_SCHED_PARAM` 宏初始化后修改 `backend`/`priority` 字段，核定义如 `HB_UCP_BPU_CORE_0`）。更底层的核管理见 [BPU 底层 API](../../07_Advanced_development/06_multimedia_development/01_multimedia_api/12_bpu_api.md)。

## 相关文档

- [Python 推理 API](./02_python_api.md)
- [BPU 底层 API](../../07_Advanced_development/06_multimedia_development/01_multimedia_api/12_bpu_api.md)
- [算法示例](../../03_Demos/03_algorithm_demo/01_summary.md)
- [模型获取与放置](../../03_Demos/04_demo_support/01_model_files.md)
- [使用自己的模型](../../03_Demos/04_demo_support/04_custom_model.md)
