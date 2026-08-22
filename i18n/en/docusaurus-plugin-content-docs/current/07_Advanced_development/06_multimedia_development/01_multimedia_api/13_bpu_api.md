---
title: "BPU Low-Level API"
sidebar_position: 13
description: "RDK S100/S600 BPU low-level driver C API (hb_bpu): core/task/memory/power management"
---

# BPU Low-Level API

`hb_bpu` provides the low-level C API (`hb_bpu.h`) based on BPU hardware acceleration, used to manage BPU cores, create and schedule BPU tasks, map memory, and control BPU power and clocks. The companion `hb_bpu_mem.h` provides allocation, copy and cache-coherency interfaces for BPU memory (bpu mem).

> **Level description**: This chapter covers the **low-level API** (BPU driver interface), not the wrapper layer. Model parsing, tensor management and inference wrapping are done by upper layers, e.g. the `hbm_runtime` wrapped by the [Python Inference API](../../../04_Simple_API/02_inference_api/02_python_api.md) (which internally uses hbDNN/hbUCP). `hb_bpu` receives compiled task data (hbdk_task) and executes it on the BPU cores. It is intended for developers who need to drive the BPU hardware directly in C/C++ and finely control core binding and task scheduling.

## Quick Example

Submit a compiled task to the BPU core for execution synchronously:

```c
#include "hb_bpu.h"

int main() {
    hb_bpu_core_t core;
    hb_bpu_task_t task;

    // 1. Open a BPU core (core_mask 0x1 means core 0)
    hb_bpu_core_open(&core, 0x1, CHOOSE_BY_CAP);

    // 2. Allocate a task
    hb_bpu_task_alloc(&task, TASK_TYPE_SYNC);

    // 3. Configure the task data (hbdk_task is the compiled task data)
    hb_bpu_task_config(task, hbdk_task, hbdk_task_num);

    // 4. Submit to the BPU core for execution (TASK_TYPE_SYNC blocks until completion)
    hb_bpu_core_process(core, task);

    // 5. Release
    hb_bpu_task_free(task);
    hb_bpu_core_close(core);
    return 0;
}
```

BPU memory allocation example:

```c
#include "hb_bpu_mem.h"

bpu_addr_t addr = hb_bpu_mem_alloc(size, BPU_CACHEABLE);
/* Use addr ... */
hb_bpu_mem_free(addr);
```

## API List

### Core Management

| Function | Description |
| --- | --- |
| `hb_bpu_core_open` | Open a BPU core and return the core handle |
| `hb_bpu_core_close` | Close and release a BPU core |
| `hb_bpu_core_process` | Submit a task to the BPU core for execution |
| `hb_bpu_core_wait` | Wait for task execution on the core to complete |
| `hb_bpu_core_lock` / `hb_bpu_core_unlock` | Lock / unlock a BPU core |
| `hb_bpu_core_num` | Get the number of BPU cores in the system |
| `hb_bpu_core_type` | Get the core type and firmware version |
| `hb_bpu_core_est_load` | Estimate the remaining time of pending tasks on the core |
| `hb_bpu_core_cap` | Get the remaining fifo capacity of the core |
| `hb_bpu_core_phy_idx` | Get the physical index of the core |
| `hb_bpu_core_alloc_bufcnt` / `hb_bpu_core_free_bufcnt` | Allocate / free core buffer counts |
| `hb_bpu_core_bufcnt_update` / `hb_bpu_core_bufcnt_get` / `hb_bpu_core_bufcnt_index` | Buffer count update / query |

### Task Management

| Function | Description |
| --- | --- |
| `hb_bpu_task_alloc` | Allocate a task instance |
| `hb_bpu_task_free` | Free a task instance |
| `hb_bpu_task_config` | Configure task data (hbdk_task) |
| `hb_bpu_task_pt_config` | Configure pass-through task data |
| `hb_bpu_task_set_prio` | Set the task priority |
| `hb_bpu_task_set_id` / `hb_bpu_task_get_id` | Set / get the task user ID |
| `hb_bpu_task_set_cb` | Bind a task completion callback |
| `hb_bpu_task_set_group` | Bind the task to a group |
| `hb_bpu_task_set_deadline` | Set the task deadline |
| `hb_bpu_task_bind` / `hb_bpu_task_unbind` | Bind / unbind extended memory |
| `hb_bpu_task_set_alias` / `hb_bpu_task_get_alias` | Set / get the task alias |
| `hb_bpu_task_cancel` | Cancel a task |
| `hb_bpu_task_assigned_core` | Get the core index assigned to the task |
| `hb_bpu_task_status` | Get the task status |
| `hb_bpu_task_type` | Get the task type |
| `hb_bpu_task_wait` | Wait for the task to complete |
| `hb_bpu_task_bind_core` | Get the core bound before task execution |
| `hb_bpu_task_set_pre_process_cb` | Set a task preprocessing callback |
| `hb_bpu_task_processing_time` | Get the task processing time |

### Memory Mapping

| Function | Description |
| --- | --- |
| `hb_bpu_map` | Map memory to the BPU core |
| `hb_bpu_unmap` | Unmap |
| `hb_bpu_map_iova_info` | Map and output iova information |
| `hb_bpu_get_map_iova_info` | Get the iova information of memory |
| `hb_bpu_map_mode_set` / `hb_bpu_map_mode_get` | Set / get the map access mode |

### Power / Clock

| Function | Description |
| --- | --- |
| `hb_bpu_set_power` / `hb_bpu_get_power` | Set / get the core power state |
| `hb_bpu_set_clk` / `hb_bpu_get_clk` | Set / get the core clock |
| `hb_bpu_frq_level_num` | Get the number of frequency levels |
| `hb_bpu_set_frq_level` / `hb_bpu_get_frq_level` | Set / get the frequency level |

### group / Others

| Function | Description |
| --- | --- |
| `hb_bpu_set_group_proportion` | Set the BPU usage proportion of a group |
| `hb_bpu_version` | Get the library version number |
| `hb_bpu_fw_get_feature` | Get firmware feature data |

### Memory Management (hb_bpu_mem.h)

| Function | Description |
| --- | --- |
| `hb_bpu_mem_alloc` / `hb_bpu_mem_free` | Allocate / free BPU memory |
| `hb_bpu_cpumem_alloc` / `hb_bpu_cpumem_free` | Allocate / free CPU memory |
| `hb_bpu_mem_alloc_with_label` / `hb_bpu_cpumem_alloc_with_label` | Allocate memory with a label |
| `hb_bpu_mem_register` / `hb_bpu_mem_unregister` | Register / unregister external memory |
| `hb_bpu_memcpy` | Heterogeneous memory copy |
| `hb_bpu_mem_cache_flush` | Cache flush (invalidate / clean) |
| `hb_bpu_mem_phyaddr` | Get the physical address |
| `hb_bpu_mem_device_iova` / `hb_bpu_mem_host_iova` | Get the device / host iova address |
| `hb_bpu_mem_is_cacheable` | Query whether the memory is cacheable |

## API Details

### hb_bpu_version

**Function Prototype**

```c
hb_bpu_err_t hb_bpu_version(uint32_t *major, uint32_t *minor, uint32_t *patch);
```

**Description**

Get the BPU library version number.

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| major | `uint32_t *` | Yes | Output pointer for the major version number |
| minor | `uint32_t *` | Yes | Output pointer for the minor version number |
| patch | `uint32_t *` | Yes | Output pointer for the patch version number |

**Return Value**

`BPU_OK` (0) indicates success; `BPU_INVAL` indicates invalid parameters.

### hb_bpu_core_num

**Function Prototype**

```c
uint32_t hb_bpu_core_num(void);
```

**Description**

Get the number of BPU core devices in the system.

**Return Value**

The number of BPU core devices (`uint32_t`).

### hb_bpu_core_open

**Function Prototype**

```c
hb_bpu_err_t hb_bpu_core_open(hb_bpu_core_t *core, uint32_t core_mask,
                              hb_bpu_choose_t method);
```

**Description**

Create a BPU core instance, open the core device and return the handle, used to process BPU tasks.

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| core | `hb_bpu_core_t *` | Yes | Output pointer for the core handle |
| core_mask | `uint32_t` | Yes | Core bitmask: index 0 corresponds to `0x1`, index 1 to `0x2`, cores 0 and 1 to `0x3`, and so on |
| method | `hb_bpu_choose_t` | Yes | The way to choose the actual execution core on multi-core (`CHOOSE_BY_CAP` / `CHOOSE_BY_EST_LOAD`) |

**Return Value**

`BPU_OK` indicates success; non-`BPU_OK` indicates failure; refer to `hb_bpu_err_t`.

### hb_bpu_core_close

**Function Prototype**

```c
hb_bpu_err_t hb_bpu_core_close(hb_bpu_core_t core);
```

**Description**

Close and release the BPU core opened by `hb_bpu_core_open`.

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| core | `hb_bpu_core_t` | Yes | A valid core handle |

**Return Value**

`BPU_OK` indicates success; non-`BPU_OK` indicates failure.

### hb_bpu_core_process

**Function Prototype**

```c
hb_bpu_err_t hb_bpu_core_process(hb_bpu_core_t core, hb_bpu_task_t task);
```

**Description**

Submit a task to the BPU core for execution. When the task type is `TASK_TYPE_SYNC`, this interface blocks until the task completes or is cancelled.

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| core | `hb_bpu_core_t` | Yes | A valid core handle |
| task | `hb_bpu_task_t` | Yes | A valid task handle |

**Return Value**

`BPU_OK` indicates success; non-`BPU_OK` indicates failure.

### hb_bpu_task_alloc

**Function Prototype**

```c
hb_bpu_err_t hb_bpu_task_alloc(hb_bpu_task_t *task, hb_task_type_t type);
```

**Description**

Allocate a BPU task instance and return the task handle.

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| task | `hb_bpu_task_t *` | Yes | Output pointer for the task handle |
| type | `hb_task_type_t` | Yes | Task type, see `hb_task_type_t` (e.g. `TASK_TYPE_SYNC`) |

**Return Value**

`BPU_OK` indicates success; non-`BPU_OK` indicates failure.

### hb_bpu_task_config

**Function Prototype**

```c
hb_bpu_err_t hb_bpu_task_config(hb_bpu_task_t task, void *hbdk_task,
                                uint32_t hbdk_task_num);
```

**Description**

Configure a BPU task using the module information from the hbdk runtime.

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| task | `hb_bpu_task_t` | Yes | A valid task handle |
| hbdk_task | `void *` | Yes | Pointer to the task data from the hbdk runtime |
| hbdk_task_num | `uint32_t` | Yes | Number of task data items |

**Return Value**

`BPU_OK` indicates success; non-`BPU_OK` indicates failure.

### hb_bpu_task_free

**Function Prototype**

```c
hb_bpu_err_t hb_bpu_task_free(hb_bpu_task_t task);
```

**Description**

Free the task instance allocated by `hb_bpu_task_alloc`.

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| task | `hb_bpu_task_t` | Yes | A valid task handle |

**Return Value**

`BPU_OK` indicates success; non-`BPU_OK` indicates failure.

### hb_bpu_set_group_proportion

**Function Prototype**

```c
hb_bpu_err_t hb_bpu_set_group_proportion(uint32_t group, uint32_t prop);
```

**Description**

Set the BPU usage proportion of a group, used to limit the task occupancy of a specific group. Group 0 has a default proportion of 100 and needs no initialization.

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| group | `uint32_t` | Yes | The group value |
| prop | `uint32_t` | Yes | BPU usage proportion, max 100; setting it to 0 deletes the group record |

**Return Value**

`BPU_OK` indicates success; non-`BPU_OK` indicates failure.

### hb_bpu_task_set_group

**Function Prototype**

```c
hb_bpu_err_t hb_bpu_task_set_group(hb_bpu_task_t task, uint32_t group);
```

**Description**

Bind the BPU task to the specified group. Tasks are bound to group 0 by default; before binding to a non-0 group, the proportion of that group must first be set to a value greater than 0 via `hb_bpu_set_group_proportion`.

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| task | `hb_bpu_task_t` | Yes | A valid task handle |
| group | `uint32_t` | Yes | The group id |

**Return Value**

`BPU_OK` indicates success; non-`BPU_OK` indicates failure.

### hb_bpu_mem_alloc

**Function Prototype**

```c
bpu_addr_t hb_bpu_mem_alloc(uint64_t size, uint32_t flag);
```

**Description**

Allocate memory usable by the BPU.

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| size | `uint64_t` | Yes | Size of the memory to allocate |
| flag | `uint32_t` | Yes | Allocation attributes (cacheable / coherence, etc.), see the `BPU_*` macros in `hb_bpu_mem.h` |

**Return Value**

Returns an accessible address (`> 0`) on success; returns `0` on failure.

### hb_bpu_mem_free

**Function Prototype**

```c
void hb_bpu_mem_free(bpu_addr_t addr);
```

**Description**

Free the memory allocated by `hb_bpu_mem_alloc`.

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| addr | `bpu_addr_t` | Yes | A valid memory address |

### hb_bpu_memcpy

**Function Prototype**

```c
int32_t hb_bpu_memcpy(bpu_addr_t dst_addr, bpu_addr_t src_addr,
                      uint64_t size, uint32_t direction);
```

**Description**

Heterogeneous memory data copy (between CPU and BPU memory).

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| dst_addr | `bpu_addr_t` | Yes | Base address of the destination memory |
| src_addr | `bpu_addr_t` | Yes | Base address of the source memory |
| size | `uint64_t` | Yes | Copy size |
| direction | `uint32_t` | Yes | Copy direction: `CPU_TO_BPU` (0) or `BPU_TO_CPU` (1) |

**Return Value**

`0` indicates success; `< 0` indicates failure.

### hb_bpu_mem_cache_flush

**Function Prototype**

```c
void hb_bpu_mem_cache_flush(bpu_addr_t addr, uint64_t size, uint32_t flag);
```

**Description**

Perform a cache operation on cacheable memory (used after a write and before a read).

**Parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| addr | `bpu_addr_t` | Yes | Base address of the memory |
| size | `uint64_t` | Yes | Size of the memory range |
| flag | `uint32_t` | Yes | Cache operation type: `BPU_MEM_INVALIDATE` (1) or `BPU_MEM_CLEAN` (2) |

## Data Structures

### hb_bpu_err_t (Error Codes)

| Enum Value | Value | Description |
| --- | --- | --- |
| `BPU_OK` | 0 | No error |
| `BPU_NO_CORE` | -1 | No BPU core |
| `BPU_INVAL` | -2 | Invalid data |
| `BPU_NOMEM` | -3 | Out of memory |
| `BPU_TIMEOUT` | -4 | Timeout error |
| `BPU_NODATA` | -5 | No data error |
| `BPU_NOGRP` | -6 | Group not initialized |
| `BPU_NOTSPT` | -7 | Unsupported data |
| `BPU_NOPERMISSION` | -8 | No permission |
| `BPU_BUSY` | -9 | Too busy |
| `BPU_CANCEL` | -10 | Task cancelled |
| `BPU_UNKNOW` | -11 | Unknown error |
| `BPU_IOCTL` | -12 | ioctl error |

### hb_task_type_t (Task Type)

| Enum Value | Value | Description |
| --- | --- | --- |
| `TASK_TYPE_SYNC` | 0x0000 | Synchronous type; `hb_bpu_core_process` blocks until completion |
| `TASK_TYPE_TRIG_TASK` | 0x0001 | Trigger-task type; `hb_bpu_task_wait` returns after completion |
| `TASK_TYPE_TRIG_CORE` | 0x0002 | Trigger-core type; `hb_bpu_core_wait` returns after completion |
| `TASK_TYPE_GRAPH` | 0x0004 | Graph type; waits for dependency conditions to trigger |

### Other Enums and Handles

| Type | Description |
| --- | --- |
| `hb_bpu_core_t` | BPU core handle (opaque) |
| `hb_bpu_task_t` | BPU task handle (opaque) |
| `hb_bpu_map_t` | BPU map handle (`base` / `size`) |
| `hb_bpu_core_type_t` | Core type: `CORE_TYPE_UNKNOWN` / `CORE_TYPE_4PE` / `CORE_TYPE_1PE` / `CORE_TYPE_2PE` / `CORE_TYPE_ANY` / `CORE_TYPE_INVALID` |
| `hb_bpu_choose_t` | Core selection method: `CHOOSE_BY_CAP` (0) / `CHOOSE_BY_EST_LOAD` / `CHOOSE_BY_UNKNOWN` |
| `hb_task_status_t` | Task status: `TASK_IDLE` (0) → `TASK_DONE` / `TASK_ERR` etc. |
| `hb_bpu_map_mode_t` | Map access mode: `BPU_RD` / `BPU_WR` / `BPU_SR` / `BPU_SG` |
| `hb_bpu_core_lock_flag_t` | Core lock flags: `BPU_CORE_LOCK_DEFAULT` / `BPU_CORE_LOCK_NO_BLOCK` / `BPU_CORE_LOCK_ALLOW_OTHER_PROCESS_TASK` |
| `bpu_addr_t` | BPU memory address type (`uint64_t`) |

> The complete enums, structs and macro definitions are in the doxygen comments of `/usr/hobot/include/hb_bpu.h` and `/usr/hobot/include/hb_bpu_mem.h` on the board.

## Build

The header files `hb_bpu.h` and `hb_bpu_mem.h` are located in `/usr/hobot/include`; the linked library is `libbpu.so` (in `/usr/hobot/lib`).

```bash
gcc -o inference_demo demo.c \
    -I/usr/hobot/include \
    -L/usr/hobot/lib -lbpu
```

## Related Documentation

- [Python Inference API](../../../04_Simple_API/02_inference_api/02_python_api.md)
- [Algorithm Examples](../../../03_Demos/03_algorithm_demo/01_summary.md)
- [Model Acquisition and Placement](../../../03_Demos/04_demo_support/01_model_files.md)
- [Use Your Own Model](../../../03_Demos/04_demo_support/04_custom_model.md)
- [BPU/CPU/DDR Stress Test](../../04_driver_development/06_hardware_unit_test/03_bpu_cpu_ddr_stress.md)