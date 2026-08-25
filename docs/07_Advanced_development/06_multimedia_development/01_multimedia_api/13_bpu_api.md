---
title: "BPU 底层 API"
sidebar_position: 13
description: "RDK S100/S600 BPU 底层驱动 C API（hb_bpu）：核/任务/内存/电源管理"
---

# BPU 底层 API

`hb_bpu` 提供基于 BPU 硬件加速的底层 C API（`hb_bpu.h`），用于管理 BPU
核、创建与调度 BPU 任务、映射内存以及控制 BPU 电源与时钟。配套的
`hb_bpu_mem.h` 提供 BPU 内存（bpu mem）的分配、拷贝与缓存一致性接口。

> **层级说明**：本篇是【底层 API】（BPU 驱动接口），不是封装层。模型解析、
> 张量管理与推理封装由上层完成，例如 [Python 推理 API](../../../04_Simple_API/02_inference_api/02_python_api.md)
> 封装的 `hbm_runtime`（内部使用 hbDNN/hbUCP）。`hb_bpu` 接收编译好的任务
> 数据（hbdk_task），在 BPU 核上执行，适用于需要在 C/C++ 中直接驱动 BPU
> 硬件、精细控制核绑定与任务调度的开发者。

> **平台代号说明**：本文兼容性标注沿用底层头文件原始写法——XJ3/J3、Ultra 为更早代上游平台代号，X5 为现行上游产品线代号（非本两板），Super/J6 为本产品线同源架构代号（板端实证：S100/S600 同源，S600 为多核形态）。`HW:` 列表表示该接口在上游多代平台的适用范围，其中 Super 代即对应本产品线（继承自上游标注，未逐一板端验证）；`SW` 为上游软件版本号，RDK 对应版本以 Release Note 为准。未列入代号的接口表示继承自上游、RDK 侧未逐一验证。

## 快速示例

以同步方式提交一个编译好的任务到 BPU 核执行：

```c
#include "hb_bpu.h"

int main() {
    hb_bpu_core_t core;
    hb_bpu_task_t task;

    // 1. 打开 BPU 核（core_mask 0x1 表示核 0）
    hb_bpu_core_open(&core, 0x1, CHOOSE_BY_CAP);

    // 2. 分配任务
    hb_bpu_task_alloc(&task, TASK_TYPE_SYNC);

    // 3. 配置任务数据（hbdk_task 为编译好的任务数据）
    hb_bpu_task_config(task, hbdk_task, hbdk_task_num);

    // 4. 提交到 BPU 核执行（TASK_TYPE_SYNC 会阻塞直到完成）
    hb_bpu_core_process(core, task);

    // 5. 释放
    hb_bpu_task_free(task);
    hb_bpu_core_close(core);
    return 0;
}
```

BPU 内存分配示例：

```c
#include "hb_bpu_mem.h"

bpu_addr_t addr = hb_bpu_mem_alloc(size, BPU_CACHEABLE);
/* 使用 addr ... */
hb_bpu_mem_free(addr);
```

## API 清单

### 核管理

| 函数 | 功能 |
| --- | --- |
| `hb_bpu_core_open` | 打开 BPU 核，返回核句柄 |
| `hb_bpu_core_close` | 关闭并释放 BPU 核 |
| `hb_bpu_core_process` | 提交任务到 BPU 核执行 |
| `hb_bpu_core_wait` | 等待核上任务执行完成 |
| `hb_bpu_core_lock` / `hb_bpu_core_unlock` | 锁定 / 解锁 BPU 核 |
| `hb_bpu_core_num` | 获取系统 BPU 核数量 |
| `hb_bpu_core_type` | 获取核类型与固件版本 |
| `hb_bpu_core_est_load` | 估算核上待处理任务剩余时间 |
| `hb_bpu_core_cap` | 获取核 fifo 剩余容量 |
| `hb_bpu_core_phy_idx` | 获取核物理索引 |
| `hb_bpu_core_alloc_bufcnt` / `hb_bpu_core_free_bufcnt` | 分配 / 释放核缓冲区计数 |
| `hb_bpu_core_bufcnt_update` / `hb_bpu_core_bufcnt_get` / `hb_bpu_core_bufcnt_index` | 缓冲区计数更新 / 查询 |

### 任务管理

| 函数 | 功能 |
| --- | --- |
| `hb_bpu_task_alloc` | 分配任务实例 |
| `hb_bpu_task_free` | 释放任务实例 |
| `hb_bpu_task_config` | 配置任务数据（hbdk_task） |
| `hb_bpu_task_pt_config` | 配置 pass-through 任务数据 |
| `hb_bpu_task_set_prio` | 设置任务优先级 |
| `hb_bpu_task_set_id` / `hb_bpu_task_get_id` | 设置 / 获取任务用户 ID |
| `hb_bpu_task_set_cb` | 绑定任务完成回调 |
| `hb_bpu_task_set_group` | 绑定任务到 group |
| `hb_bpu_task_set_deadline` | 设置任务截止时间 |
| `hb_bpu_task_bind` / `hb_bpu_task_unbind` | 绑定 / 解绑扩展内存 |
| `hb_bpu_task_set_alias` / `hb_bpu_task_get_alias` | 设置 / 获取任务别名 |
| `hb_bpu_task_cancel` | 取消任务 |
| `hb_bpu_task_assigned_core` | 获取任务分配到的核索引 |
| `hb_bpu_task_status` | 获取任务状态 |
| `hb_bpu_task_type` | 获取任务类型 |
| `hb_bpu_task_wait` | 等待任务完成 |
| `hb_bpu_task_bind_core` | 获取任务执行前绑定的核 |
| `hb_bpu_task_set_pre_process_cb` | 设置任务预处理回调 |
| `hb_bpu_task_processing_time` | 获取任务处理耗时 |

### 内存映射

| 函数 | 功能 |
| --- | --- |
| `hb_bpu_map` | 映射内存到 BPU 核 |
| `hb_bpu_unmap` | 解除映射 |
| `hb_bpu_map_iova_info` | 映射并输出 iova 信息 |
| `hb_bpu_get_map_iova_info` | 获取内存 iova 信息 |
| `hb_bpu_map_mode_set` / `hb_bpu_map_mode_get` | 设置 / 获取映射访问模式 |

### 电源 / 时钟

| 函数 | 功能 |
| --- | --- |
| `hb_bpu_set_power` / `hb_bpu_get_power` | 设置 / 获取核电源状态 |
| `hb_bpu_set_clk` / `hb_bpu_get_clk` | 设置 / 获取核时钟 |
| `hb_bpu_frq_level_num` | 获取频率档位数量 |
| `hb_bpu_set_frq_level` / `hb_bpu_get_frq_level` | 设置 / 获取频率档位 |

### group / 其他

| 函数 | 功能 |
| --- | --- |
| `hb_bpu_set_group_proportion` | 设置 group 的 BPU 使用比例 |
| `hb_bpu_version` | 获取库版本号 |
| `hb_bpu_fw_get_feature` | 获取固件特性数据 |

### 内存管理（hb_bpu_mem.h）

| 函数 | 功能 |
| --- | --- |
| `hb_bpu_mem_alloc` / `hb_bpu_mem_free` | 分配 / 释放 BPU 内存 |
| `hb_bpu_cpumem_alloc` / `hb_bpu_cpumem_free` | 分配 / 释放 CPU 内存 |
| `hb_bpu_mem_alloc_with_label` / `hb_bpu_cpumem_alloc_with_label` | 带标签分配内存 |
| `hb_bpu_mem_register` / `hb_bpu_mem_unregister` | 注册 / 注销外部内存 |
| `hb_bpu_memcpy` | 异构内存拷贝 |
| `hb_bpu_mem_cache_flush` | 缓存刷新（invalidate / clean） |
| `hb_bpu_mem_phyaddr` | 获取物理地址 |
| `hb_bpu_mem_device_iova` / `hb_bpu_mem_host_iova` | 获取 device / host iova 地址 |
| `hb_bpu_mem_is_cacheable` | 查询内存是否可缓存 |

## 接口详解

### hb_bpu_version

【函数原型】

```c
hb_bpu_err_t hb_bpu_version(uint32_t *major, uint32_t *minor, uint32_t *patch);
```

【功能描述】

获取 BPU 库版本号。

【参数】

- [OUT] uint32_t *major: major version value pointer
- [OUT] uint32_t *minor: minor version value pointer
- [OUT] uint32_t *patch: patch version value pointer

【返回值】

`BPU_OK`（0）表示成功；`BPU_INVAL` 表示参数无效。

### hb_bpu_core_num

【函数原型】

```c
uint32_t hb_bpu_core_num(void);
```

【功能描述】

获取系统中 BPU 核设备数量。

【参数】

- [IN] None

【返回值】

BPU 核设备数量（`uint32_t`）。

### hb_bpu_core_open

【函数原型】

```c
hb_bpu_err_t hb_bpu_core_open(hb_bpu_core_t *core, uint32_t core_mask,
                              hb_bpu_choose_t method);
```

【功能描述】

创建 BPU 核实例，打开核设备并返回句柄，用于处理 BPU 任务。

【参数】

- [OUT] hb_bpu_core_t *core: bpu core handle pointer use to assign return value
- [IN] uint32_t core_mask: the bitmask which bpu core dev use (as index 0 -> 0x1; index 1-> 0x2, index 0&1->0x3...)
- [IN] hb_bpu_choose_t method: when bpu core dev number > 1, how to choose the real process task core, reference hb_bpu_choose_t

【返回值】

`BPU_OK` 表示成功；非 `BPU_OK` 表示失败，参考 `hb_bpu_err_t`。

### hb_bpu_core_close

【函数原型】

```c
hb_bpu_err_t hb_bpu_core_close(hb_bpu_core_t core);
```

【功能描述】

关闭并释放由 `hb_bpu_core_open` 打开的 BPU 核。

【参数】

- [IN] hb_bpu_core_t core: valid bpu core handle

【返回值】

`BPU_OK` 表示成功；非 `BPU_OK` 表示失败。

### hb_bpu_core_process

【函数原型】

```c
hb_bpu_err_t hb_bpu_core_process(hb_bpu_core_t core, hb_bpu_task_t task);
```

【功能描述】

将任务提交到 BPU 核执行。当任务类型为 `TASK_TYPE_SYNC` 时，本接口阻塞
直到任务执行完成或被取消。

【参数】

- [IN] hb_bpu_core_t core: valid bpu core handle
- [IN] hb_bpu_task_t task: valid bpu task handle

【返回值】

`BPU_OK` 表示成功；非 `BPU_OK` 表示失败。

### hb_bpu_task_alloc

【函数原型】

```c
hb_bpu_err_t hb_bpu_task_alloc(hb_bpu_task_t *task, hb_task_type_t type);
```

【功能描述】

分配 BPU 任务实例并返回任务句柄。

【参数】

- [OUT] hb_bpu_task_t *task: the space pointer to assign the bpu task handle, should not be NULL
- [IN] hb_task_type_t type: task type, reference hb_task_type_t

【返回值】

`BPU_OK` 表示成功；非 `BPU_OK` 表示失败。

### hb_bpu_task_config

【函数原型】

```c
hb_bpu_err_t hb_bpu_task_config(hb_bpu_task_t task, void *hbdk_task,
                                uint32_t hbdk_task_num);
```

【功能描述】

使用来自 hbdk runtime 的模块信息配置 BPU 任务。

【参数】

- [IN] hb_bpu_task_t task: the valid bpu task handle
- [IN] void *hbdk_task: the task data pointer which from hbdk runtime
- [IN] uint32_t hbdk_task_num: the task data number which from hbdk runtime

【返回值】

`BPU_OK` 表示成功；非 `BPU_OK` 表示失败。

### hb_bpu_task_free

【函数原型】

```c
hb_bpu_err_t hb_bpu_task_free(hb_bpu_task_t task);
```

【功能描述】

释放由 `hb_bpu_task_alloc` 分配的任务实例。

【参数】

- [IN] hb_bpu_task_t task: the valid bpu task handle

【返回值】

`BPU_OK` 表示成功；非 `BPU_OK` 表示失败。

### hb_bpu_set_group_proportion

【函数原型】

```c
hb_bpu_err_t hb_bpu_set_group_proportion(uint32_t group, uint32_t prop);
```

【功能描述】

设置某个 group 的 BPU 使用比例，用于限制特定 group 的任务占用。group 0
默认比例为 100，无需初始化设置。

【参数】

- [IN] uint32_t group: group value
- [IN] uint32_t prop: bpu use proportion, max 100, if set 0, delete the group record from bpu software

【返回值】

`BPU_OK` 表示成功；非 `BPU_OK` 表示失败。

### hb_bpu_task_set_group

【函数原型】

```c
hb_bpu_err_t hb_bpu_task_set_group(hb_bpu_task_t task, uint32_t group);
```

【功能描述】

将 BPU 任务绑定到指定 group。任务默认绑定 group 0；绑定到非 0 group 前，
必须先通过 `hb_bpu_set_group_proportion` 为该 group 设置大于 0 的比例。

【参数】

- [IN] hb_bpu_task_t task: the valid bpu task handle
- [IN] uint32_t group: group id

【返回值】

`BPU_OK` 表示成功；非 `BPU_OK` 表示失败。

### hb_bpu_mem_alloc

【函数原型】

```c
bpu_addr_t hb_bpu_mem_alloc(uint64_t size, uint32_t flag);
```

【功能描述】

分配 BPU 可用的内存。

【参数】

- [IN] uint64_t size: allocate memory size
- [IN] uint32_t flag: allocate memory flag(cacheable/coherence)

【返回值】

成功返回可访问地址（`> 0`）；失败返回 `0`。

### hb_bpu_mem_free

【函数原型】

```c
void hb_bpu_mem_free(bpu_addr_t addr);
```

【功能描述】

释放由 `hb_bpu_mem_alloc` 分配的内存。

【参数】

- [IN] bpu_addr_t addr: the valid memory address

### hb_bpu_memcpy

【函数原型】

```c
int32_t hb_bpu_memcpy(bpu_addr_t dst_addr, bpu_addr_t src_addr,
                      uint64_t size, uint32_t direction);
```

【功能描述】

异构内存数据拷贝（CPU 与 BPU 内存之间）。

【参数】

- [IN] bpu_addr_t dst_addr: target memory range base address
- [IN] bpu_addr_t src_addr: source memory range base address
- [IN] uint64_t size: copy memory size
- [IN] uint32_t direction: cpu->bpu or bpu->cpu

【返回值】

`0` 表示成功；`< 0` 表示失败。

### hb_bpu_mem_cache_flush

【函数原型】

```c
void hb_bpu_mem_cache_flush(bpu_addr_t addr, uint64_t size, uint32_t flag);
```

【功能描述】

对可缓存内存执行缓存操作（写后读前使用）。

【参数】

- [IN] bpu_addr_t addr: cache operation memory range base
- [IN] uint64_t size: cache operation memory range size
- [IN] uint32_t flag: cache invalid or clean

## 数据结构

### hb_bpu_err_t（错误码）

| 枚举值 | 值 | 说明 |
| --- | --- | --- |
| `BPU_OK` | 0 | 无错误 |
| `BPU_NO_CORE` | -1 | 没有 BPU 核 |
| `BPU_INVAL` | -2 | 数据无效 |
| `BPU_NOMEM` | -3 | 内存不足 |
| `BPU_TIMEOUT` | -4 | 超时错误 |
| `BPU_NODATA` | -5 | 无数据错误 |
| `BPU_NOGRP` | -6 | 未初始化 group |
| `BPU_NOTSPT` | -7 | 不支持的数据 |
| `BPU_NOPERMISSION` | -8 | 无权限 |
| `BPU_BUSY` | -9 | 太忙 |
| `BPU_CANCEL` | -10 | 任务已取消 |
| `BPU_UNKNOW` | -11 | 未知错误 |
| `BPU_IOCTL` | -12 | ioctl 错误 |

### hb_task_type_t（任务类型）

| 枚举值 | 值 | 说明 |
| --- | --- | --- |
| `TASK_TYPE_SYNC` | 0x0000 | 同步类型，`hb_bpu_core_process` 阻塞直到完成 |
| `TASK_TYPE_TRIG_TASK` | 0x0001 | 触发任务类型，完成后 `hb_bpu_task_wait` 返回 |
| `TASK_TYPE_TRIG_CORE` | 0x0002 | 触发核类型，完成后 `hb_bpu_core_wait` 返回 |
| `TASK_TYPE_GRAPH` | 0x0004 | 图类型，等待依赖条件触发 |

### 其他枚举与句柄

| 类型 | 说明 |
| --- | --- |
| `hb_bpu_core_t` | BPU 核句柄（不透明） |
| `hb_bpu_task_t` | BPU 任务句柄（不透明） |
| `hb_bpu_map_t` | BPU 映射句柄（`base` / `size`） |
| `hb_bpu_core_type_t` | 核类型：`CORE_TYPE_UNKNOWN` / `CORE_TYPE_4PE` / `CORE_TYPE_1PE` / `CORE_TYPE_2PE` / `CORE_TYPE_ANY` / `CORE_TYPE_INVALID` |
| `hb_bpu_choose_t` | 核选择方式：`CHOOSE_BY_CAP`（0）/ `CHOOSE_BY_EST_LOAD` / `CHOOSE_BY_UNKNOWN` |
| `hb_task_status_t` | 任务状态：`TASK_IDLE`（0）→ `TASK_DONE` / `TASK_ERR` 等 |
| `hb_bpu_map_mode_t` | 映射访问模式：`BPU_RD` / `BPU_WR` / `BPU_SR` / `BPU_SG` |
| `hb_bpu_core_lock_flag_t` | 核锁标志：`BPU_CORE_LOCK_DEFAULT` / `BPU_CORE_LOCK_NO_BLOCK` / `BPU_CORE_LOCK_ALLOW_OTHER_PROCESS_TASK` |
| `bpu_addr_t` | BPU 内存地址类型（`uint64_t`） |

> 完整枚举、结构体与宏定义见板端 `/usr/hobot/include/hb_bpu.h`、
> `/usr/hobot/include/hb_bpu_mem.h` 的 doxygen 注释。

## 编译

头文件 `hb_bpu.h`、`hb_bpu_mem.h` 位于 `/usr/hobot/include`，链接库为
`libbpu.so`（位于 `/usr/hobot/lib`）。

```bash
gcc -o inference_demo demo.c \
    -I/usr/hobot/include \
    -L/usr/hobot/lib -lbpu
```

## 相关文档

- [Python 推理 API](../../../04_Simple_API/02_inference_api/02_python_api.md)
- [算法示例](../../../03_Demos/03_algorithm_demo/01_summary.md)
- [模型获取与放置](../../../03_Demos/04_demo_support/01_model_files.md)
- [使用自己的模型](../../../03_Demos/04_demo_support/04_custom_model.md)
- [BPU/CPU/DDR 压力测试](../../04_driver_development/06_hardware_unit_test/03_bpu_cpu_ddr_stress.md)
