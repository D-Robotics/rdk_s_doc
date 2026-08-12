---
title: "4.2.1 C 语言推理 API"
sidebar_position: 1
description: RDK S100/S600 BPU 推理 C API（hb_bpu）
---

# 4.2.1 C 语言推理 API

RDK 提供基于 BPU 硬件加速的模型推理 C API（`hb_bpu.h`），支持加载量化后的 `.bin` 模型，在 BPU 上执行前向推理。

> Python 推理 API 见 [4.2.2 Python 推理 API](./python-api)。算法示例见 [3.3 算法示例](/Demos/algorithm_demo/summary)。

## 快速示例

```c
#include "hb_bpu.h"

int main() {
    // 1. 加载模型
    bpu_handle_t handle;
    hb_bpu_init();
    hb_bpu_load_model("/app/model/resnet18.bin", &handle);

    // 2. 准备输入
    bpu_tensor_t input = {
        .data = input_data,
        .width = 224,
        .height = 224,
        .type = BPU_TYPE_UINT8,
    };

    // 3. 执行推理
    bpu_tensor_t output;
    hb_bpu_run(handle, &input, &output);

    // 4. 读取输出
    // output.data 包含推理结果

    // 5. 释放
    hb_bpu_unload_model(handle);
    return 0;
}
```

## API 清单

| 函数 | 说明 |
| --- | --- |
| `hb_bpu_init` | 初始化 BPU 运行时 |
| `hb_bpu_load_model` | 加载 `.bin` 量化模型 |
| `hb_bpu_run` | 执行单次推理 |
| `hb_bpu_get_output` | 获取推理输出张量 |
| `hb_bpu_unload_model` | 卸载模型 |
| `hb_bpu_deinit` | 反初始化 BPU 运行时 |

> 完整 API 函数签名见板端 `/usr/hobot/include/hb_bpu.h`。

## 编译

```bash
gcc -o inference_demo demo.c -I/usr/hobot/include -L/usr/lib -lhb_bpu
```

## 相关文档

- [4.2.2 Python 推理 API](./python-api)
- [3.3 算法示例](/Demos/algorithm_demo/summary)
- [3.4.1 模型获取与放置](/Demos/demo_support/model_files)
- [3.4.4 使用自己的模型](/Demos/demo_support/custom_model)
