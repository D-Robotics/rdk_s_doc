---
sidebar_position: 2
title: "Shared Memory - Hbmem"
description: "RDK S100/S600 5.5.1.2 Hbmem (Shared Memory)"
---

# Shared Memory - Hbmem

> **Level description**: This chapter covers the **low-level multimedia API** (board-side `hbmem.h`) — the shared memory management library, providing physical memory allocation/mapping, cross-process sharing and cache maintenance, shared by all multimedia modules and the BPU. It is intended for advanced developers who need to directly operate the multimedia pipeline (Mode 3). If you only need the encapsulated capture/codec/display functionality, see Chapter 4 [Simple API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) (Mode 1).

> **Platform codename note**: Compatibility annotations in this document follow the original wording of the underlying header files. XJ3/J3 and Ultra are earlier-generation upstream platform codenames; X5 denotes the current upstream product line (not these two boards); Super/J6 are the codenames of the architecture family shared by this product line (board-verified: S100/S600 share the same family, with S600 in a multi-core form). An `HW:` list indicates the interface's applicable range across upstream platform generations, where the Super generation corresponds to this product line (inherited from upstream annotations, not verified per-interface on board); `SW` is the upstream software version number — for RDK releases see the Release Notes. Interfaces without codenames are inherited from upstream and not individually verified on RDK.

## Overview

hbmem is the RDK shared memory management library (board header `hbmem.h`), providing physical memory allocation/mapping/release, cross-process sharing, cache maintenance and DMA copy, so that multimedia modules (VIO/VPF/Codec, etc.) can share large blocks of physical memory.

## Software Abstraction

- **Backend**: underlying memory source, including ION CMA, ION Carveout, ION SRAM.
- **Address & identifier**: `hbmem_addr_t` (uint64) represents a physical address; pass a `label` to identify the purpose at allocation time, and `flag` to select the backend and attributes (e.g. `MEM_CACHEABLE`).
- **Cross-process sharing**: share the same physical memory region across processes via `share_id`.

## API Call Flow

1. `hbmem_alloc` allocates physical memory and returns an `hbmem_addr_t` (or `hbmem_mmap` maps a known physical address).
2. `hbmem_cache_invalid` / `hbmem_cache_clean` maintain cache coherency; `hbmem_dmacpy` performs DMA copy.
3. `hbmem_munmap` unmaps, `hbmem_free` frees the memory.

## Quick Example

The following example demonstrates the minimal usage sequence of hbmem: allocate → cache operations → free:

```c
#include "hbmem.h"

// 1. Allocate 4MB cacheable physical memory (BACKEND_ION_CMA)
hbmem_addr_t addr = hbmem_alloc(4 * 1024 * 1024,
                                BACKEND_ION_CMA | MEM_CACHEABLE,
                                "demo_buf");
if (addr == 0) {
    /* Handle allocation failure */
}

// 2. Invalidate cache before writing, clean cache after writing, to make data visible to DMA
hbmem_cache_invalid(addr, 4 * 1024 * 1024);
/* Write data ... */
hbmem_cache_clean(addr, 4 * 1024 * 1024);

// 3. Query physical/virtual address (use share_id for cross-process sharing)
uint64_t phy = hbmem_phyaddr(addr);
int32_t share_id = 0;
hbmem_get_share_id(addr, &share_id);

// 4. Free
hbmem_free(addr);
```

> Board-side similar examples can be found in `/app/communication_demo/hbmem_demo/sample_hbmem/` (`sample_alloc.c` demonstrates multi-backend allocation, `sample_share.c` demonstrates cross-process sharing).

## API List

| Function | Description |
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

## API Interface Description

### hbmem_version

**Function Declaration**

```c
int32_t hbmem_version(uint32_t *major, uint32_t *minor, uint32_t *patch_version);
```

**Description**

get the hbmem version

**Parameter Description**

- [OUT] major: Major version number
- [OUT] minor: Minor version number
- [OUT] patch_version: Patch version number

**Return Value**

"0": succeed
"-1": failed

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_alloc

**Function Declaration**

```c
hbmem_addr_t hbmem_alloc(uint32_t size, uint64_t flag, const char* label);
```

**Description**

alloc hobot memory

**Parameter Description**

- [IN] size: Size of memory space to be allocated range: (0, ); default: 0
- [IN] flag: Request identifier @hbmem_backends
- [IN] label: String to identify the memory space

**Return Value**

"=0": failed
"!=0": succeed

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_free

**Function Declaration**

```c
void hbmem_free(hbmem_addr_t addr);
```

**Description**

free hobot memory

**Parameter Description**

- [IN] addr: the return value of hbmem_alloc range: (0, ); default: 0

**Return Value**

None

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_mmap

**Function Declaration**

```c
hbmem_addr_t hbmem_mmap(uint64_t phyaddr, uint32_t size, uint64_t flag);
```

**Description**

Map the memory space of the known physical address with hbmem

**Parameter Description**

- [IN] phyaddr: Start address (page alignment) range: (0, ); default: 0
- [IN] size: Size of mmap range: (0, ); default: 0
- [IN] flag: Request identifier @hbmem_backends

**Return Value**

"=0": failed
"!=0": succeed

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_mmap_with_share_id

**Function Declaration**

```c
hbmem_addr_t hbmem_mmap_with_share_id(uint64_t phyaddr, uint32_t size, uint64_t flag, int32_t share_id);
```

**Description**

Use share_id maps the memory space of the known physical address to hbmem

**Parameter Description**

- [IN] phyaddr: Start address (page alignment) range: (0, ); default: 0
- [IN] size: Map Size range: (0, ); default: 0
- [IN] flag: Request identifier @hbmem_backends
- [IN] share_id: the share id range: [0, ); default: 0

**Return Value**

"=0": failed
"!=0": succeed

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_munmap

**Function Declaration**

```c
void hbmem_munmap(hbmem_addr_t addr);
```

**Description**

release the hbmem_mmap

**Parameter Description**

- [IN] addr: the return value of hbmem_alloc range: (0, ); default: 0

**Return Value**

None

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_dmacpy

**Function Declaration**

```c
int32_t hbmem_dmacpy(hbmem_addr_t dst, hbmem_addr_t src, uint32_t size);
```

**Description**

Use the system's dma to complete the copy operation of data in two hbmem memory spaces

**Parameter Description**

- [IN] dst: Start address of target hbmem space range: (0, ); default: 0
- [IN] src: Start address of source hbmem space range: (0, ); default: 0
- [IN] size: Memory space size to be copied range: (0, ); default: 0

**Return Value**

"=0": succeed
"&lt;0": failed

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_is_cacheable

**Function Declaration**

```c
int32_t hbmem_is_cacheable(hbmem_addr_t addr);
```

**Description**

Get the hidden object type of hbmem space corresponding to hbmem_addr_t

**Parameter Description**

- [IN] addr: the return value of hbmem_alloc range: (0, ); default: 0

**Return Value**

"=0": uncacheable
"&gt;0": cacheable
"&lt;0": invalid hbmem_addr_t

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_cache_invalid

**Function Declaration**

```c
void hbmem_cache_invalid(hbmem_addr_t addr, uint32_t size);
```

**Description**

Invalid operation on hidden objects in hbmem memory space

**Parameter Description**

- [IN] addr: the return value of hbmem_alloc range: (0, ); default: 0
- [IN] size: the invalid size range: (0, ); default: 0

**Return Value**

None

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_cache_clean

**Function Declaration**

```c
void hbmem_cache_clean(hbmem_addr_t addr, uint32_t size);
```

**Description**

Clean operation on hidden objects in hbmem memory space

**Parameter Description**

- [IN] addr: the return value of hbmem_alloc range: (0, ); default: 0
- [IN] size: the clean size range: (0, ); default: 0

**Return Value**

None

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_phyaddr

**Function Declaration**

```c
uint64_t hbmem_phyaddr(hbmem_addr_t addr);
```

**Description**

Get the actual ddr physical address corresponding to the hbmem memory space address

**Parameter Description**

- [IN] addr: valid hbmem_addr_t range: (0, ); default: 0

**Return Value**

"=0": failed
"!=0": succeed,physical address

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_virtaddr

**Function Declaration**

```c
uint64_t hbmem_virtaddr(hbmem_addr_t addr);
```

**Description**

Get the real virtual address corresponding to the hbmem memory space address

**Parameter Description**

- [IN] addr: the return value of hbmem_alloc range: (0, ); default: 0

**Return Value**

"=0": Invalid virtual address
"!=0": virtual address

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_info

**Function Declaration**

```c
int32_t hbmem_info(hbmem_addr_t addr, hbmem_addr_t *start, uint32_t *size);
```

**Description**

Get incoming hbmem_addr_t address value information

**Parameter Description**

- [IN] addr: the return value of hbmem_alloc range: (0, ); default: 0
- [OUT] start: Corresponding starting virtual address
- [OUT] size: the hbmem alloc size

**Return Value**

"=0": succeed
"&lt;0": the hbmem_addr_t is not in hbmem space

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

### hbmem_get_share_id

**Function Declaration**

```c
int32_t hbmem_get_share_id(hbmem_addr_t addr, int32_t *share_id);
```

**Description**

Get the share_id of virtual address

**Parameter Description**

- [IN] addr: the return value of hbmem_alloc range: (0, ); default: 0
- [OUT] share_id: the share_id

**Return Value**

"=0": succeed
"&lt;0": Virtual address not found

**Compatibility**
HW: XJ3/Ultra/Super; SW: 0.1.1

## Related Documentation

- [Base Framework - HBN](./01_hbn_api.md)
- [VIO API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md)