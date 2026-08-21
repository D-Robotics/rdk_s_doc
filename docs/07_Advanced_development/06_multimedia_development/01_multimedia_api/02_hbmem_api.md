---
sidebar_position: 2
title: "共享内存 - Hbmem"
description: "RDK S100/S600 5.5.1.2 Hbmem（共享内存）"
---

# 共享内存 - Hbmem

> **层级说明**：本篇是【底层多媒体 API】（板端 `hbmem.h`），共享内存管理库，提供物理内存分配/映射/跨进程共享/cache 维护，供多媒体各模块与 BPU 共用。面向需要直接操作多媒体 pipeline 的进阶开发（模式 3）；若只需跑通采集/编解码/显示的封装功能，见第 4 章 [简易 API](/Simple_API/multimedia_api/cdev/vio_api)（模式 1）。

## 概述

hbmem 是 RDK 的共享内存管理库（对应板端 `hbmem.h`），提供物理内存分配/映射/释放、跨进程共享、cache 维护与 DMA 拷贝能力，供多媒体各模块（VIO/VPF/Codec 等）共享大块物理内存。

## 软件抽象

- **后端（backend）**：底层内存来源，包括 ION CMA、ION Carveout、ION SRAM。
- **地址与标识**：`hbmem_addr_t`（uint64）表示物理地址；分配时传入 `label` 标识用途，`flag` 指定后端与属性（如 `MEM_CACHEABLE`）。
- **跨进程共享**：通过 `share_id` 在多进程间共享同一段物理内存。

## API 调用流程

1. `hbmem_alloc` 分配物理内存得到 `hbmem_addr_t`（或 `hbmem_mmap` 映射已知物理地址）。
2. `hbmem_cache_invalid` / `hbmem_cache_clean` 维护 cache 一致性，`hbmem_dmacpy` 做 DMA 拷贝。
3. `hbmem_munmap` 解除映射，`hbmem_free` 释放内存。


## API 列表

| 函数 | 说明 |
| --- | --- |
| hbmem_version | get the hbmem version |
| hbmem_alloc | alloc hobot memory |
| hbmem_free | free hobot memory |
| hbmem_mmap | Map the memory space of the known physical address with hbmem |
| hbmem_mmap_with_share_id | Use share_id maps the memory space of the known physical address to hbmem |
| hbmem_munmap | release the hbmem_mmap |
| hbmem_dmacpy | Use the system's dma to complete the copy operation of data in two hbmem memory spaces |
| hbmem_is_cacheable | Get the hidden object type of hbmem space corresponding to hbmem_addr_t |
| hbmem_cache_invalid | Invalid operation on hidden objects in hbmem memory space |
| hbmem_cache_clean | Clean operation on hidden objects in hbmem memory space |
| hbmem_phyaddr | Get the actual ddr physical address corresponding to the hbmem memory space address |
| hbmem_virtaddr | Get the real virtual address corresponding to the hbmem memory space address |
| hbmem_info | Get incoming hbmem_addr_t address value information |
| hbmem_get_share_id | Get the share_id of virtual address |

## API 接口说明

### hbmem_version

【函数声明】

```c
int32_t hbmem_version(uint32_t *major, uint32_t *minor, uint32_t *patch_version);
```

【功能描述】

get the hbmem version

【参数描述】

[OUT] major: Major version number
[OUT] minor: Minor version number
[OUT] patch_version: Patch version number

【返回值】

"0": succeed
"-1": failed

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_alloc

【函数声明】

```c
hbmem_addr_t hbmem_alloc(uint32_t size, uint64_t flag, const char* label);
```

【功能描述】

alloc hobot memory

【参数描述】

[IN] size: Size of memory space to be allocated range: (0, ); default: 0
[IN] flag: Request identifier @hbmem_backends
[IN] lable: String to identify the memory space

【返回值】

"=0": failed
"!=0": succeed

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_free

【函数声明】

```c
void hbmem_free(hbmem_addr_t addr);
```

【功能描述】

free hobot memory

【参数描述】

[IN] addr: the return value of hbmem_alloc range: (0, ); default: 0

【返回值】

None

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_mmap

【函数声明】

```c
hbmem_addr_t hbmem_mmap(uint64_t phyaddr, uint32_t size, uint64_t flag);
```

【功能描述】

Map the memory space of the known physical address with hbmem

【参数描述】

[IN] phyaddr: Start address (page alignment) range: (0, ); default: 0
[IN] size: Size of mmap range: (0, ); default: 0
[IN] flag: Request identifier @hbmem_backends

【返回值】

"=0": failed
"!=0": succeed

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_mmap_with_share_id

【函数声明】

```c
hbmem_addr_t hbmem_mmap_with_share_id(uint64_t phyaddr, uint32_t size, uint64_t flag, int32_t share_id);
```

【功能描述】

Use share_id maps the memory space of the known physical address to hbmem

【参数描述】

[IN] phyaddr: Start address (page alignment) range: (0, ); default: 0
[IN] size: Map Size range: (0, ); default: 0
[IN] flag: Request identifier @hbmem_backends
[IN] share_id: the share id range: [0, ); default: 0

【返回值】

"=0": failed
"!=0": succeed

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_munmap

【函数声明】

```c
void hbmem_munmap(hbmem_addr_t addr);
```

【功能描述】

release the hbmem_mmap

【参数描述】

[IN] addr: the return value of hbmem_alloc range: (0, ); default: 0

【返回值】

None

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_dmacpy

【函数声明】

```c
int32_t hbmem_dmacpy(hbmem_addr_t dst, hbmem_addr_t src, uint32_t size);
```

【功能描述】

Use the system's dma to complete the copy operation of data in two hbmem memory spaces

【参数描述】

[IN] dst: Start address of target hbmem space range: (0, ); default: 0
[IN] src: Start address of source hbmem space range: (0, ); default: 0
[IN] size: Memory space size to be copied range: (0, ); default: 0

【返回值】

"=0": succeed
"&lt;0": failed

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_is_cacheable

【函数声明】

```c
int32_t hbmem_is_cacheable(hbmem_addr_t addr);
```

【功能描述】

Get the hidden object type of hbmem space corresponding to hbmem_addr_t

【参数描述】

[IN] addr: the return value of hbmem_alloc range: (0, ); default: 0

【返回值】

"=0": uncacheable
"&gt;0": cacheable
"&lt;0": invalid hbmem_addr_t

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_cache_invalid

【函数声明】

```c
void hbmem_cache_invalid(hbmem_addr_t addr, uint32_t size);
```

【功能描述】

Invalid operation on hidden objects in hbmem memory space

【参数描述】

[IN] addr: the return value of hbmem_alloc range: (0, ); default: 0
[IN] size: the invalid size range: (0, ); default: 0

【返回值】

None

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_cache_clean

【函数声明】

```c
void hbmem_cache_clean(hbmem_addr_t addr, uint32_t size);
```

【功能描述】

Clean operation on hidden objects in hbmem memory space

【参数描述】

[IN] addr: the return value of hbmem_alloc range: (0, ); default: 0
[IN] size: the clean size range: (0, ); default: 0

【返回值】

None

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_phyaddr

【函数声明】

```c
uint64_t hbmem_phyaddr(hbmem_addr_t addr);
```

【功能描述】

Get the actual ddr physical address corresponding to the hbmem memory space address

【参数描述】

[IN] addr: valid hbmem_addr_t range: (0, ); default: 0

【返回值】

"=0": failed
"!=0": succeed,physical address

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_virtaddr

【函数声明】

```c
uint64_t hbmem_virtaddr(hbmem_addr_t addr);
```

【功能描述】

Get the real virtual address corresponding to the hbmem memory space address

【参数描述】

[IN] addr: the return value of hbmem_alloc range: (0, ); default: 0

【返回值】

"=0": Invalid virtual address
"!=0": virtual address

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_info

【函数声明】

```c
int32_t hbmem_info(hbmem_addr_t addr, hbmem_addr_t *start, uint32_t *size);
```

【功能描述】

Get incoming hbmem_addr_t address value information

【参数描述】

[IN] addr: the return value of hbmem_alloc range: (0, ); default: 0
[OUT] start: Corresponding starting virtual address
[OUT] size: the hbmem alloc size

【返回值】

"=0": succeed
"&lt;0": the hbmem_addr_t is not in hbmem space

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_get_share_id

【函数声明】

```c
int32_t hbmem_get_share_id(hbmem_addr_t addr, int32_t *share_id);
```

【功能描述】

Get the share_id of virtual address

【参数描述】

[IN] addr: the return value of hbmem_alloc range: (0, ); default: 0
[OUT] share_id: the share_id

【返回值】

"=0": succeed
"&lt;0": Virtual address not found

【兼容性】
HW: XJ3/Ultra/Super; SW: 0.1.1

## 相关文档

- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
- [VIO API](/Simple_API/multimedia_api/cdev/vio_api)
