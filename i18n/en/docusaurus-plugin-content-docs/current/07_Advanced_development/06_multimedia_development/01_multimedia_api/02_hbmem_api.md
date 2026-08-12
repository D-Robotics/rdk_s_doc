---
sidebar_position: 2
title: "Hbmem API"
description: RDK S100/S600 Hbmem API
---

# Hbmem API

## Overview

hbmem is the RDK shared memory library (board header `hbmem.h`): physical memory alloc/map/free, cross-process sharing, cache maintenance and DMA copy for multimedia modules (VIO/VPF/Codec).

## Abstraction

- **Backend**: underlying memory source — ION CMA, ION Carveout, ION SRAM.
- **Address & label**: `hbmem_addr_t` (uint64) for physical address; `label` identifies purpose, `flag` selects backend and attributes (e.g. `MEM_CACHEABLE`).
- **Cross-process sharing**: share the same physical region via `share_id`.

## Call flow

1. `hbmem_alloc` allocates physical memory and returns `hbmem_addr_t` (or `hbmem_mmap` maps a known physical address).
2. `hbmem_cache_invalid` / `hbmem_cache_clean` maintain cache coherency; `hbmem_dmacpy` does DMA copy.
3. `hbmem_munmap` unmaps, `hbmem_free` frees.


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

