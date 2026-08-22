---
sidebar_position: 12
title: "hbmem sample User Guide"
description: "hbmem sample User Guide - On-board sample usage instructions"
---
# hbmem sample User Guide

## Function Overview

hbmem API usage instructions, including the creation and usage of com buffer, graphic buffer, graphic buffer group, queue, pool, and share pool, as well as multi-process sharing.

## Software Architecture Description

This sample is implemented based on the libhbmem API, calling the APIs provided by libhbmem to achieve memory allocation for different buffer types and inter-process sharing.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/hbmem/hbmem_sample_block_diagram.png" alt="HBMEM Sample Block Diagram" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Code Location and Directory Structure

```text
1. Code location: /app/communication_demo/hbmem_demo/sample_hbmem
2. Directory structure:
    ./
    ├── Makefile
    ├── sample_alloc.c
    ├── sample.c
    ├── sample_common.c
    ├── sample_common.h
    ├── sample_pool.c
    ├── sample_queue.c
    ├── sample_share.c
    └── sample_share_pool.c
```

## API Process Description

The libhbmem library calls ion for buffer allocation

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/hbmem/hbmem_sample_call_sequence.png" alt="HBMEM Sample Call Sequence" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

Flowchart for com buffer, graph buffer, and graphic buffer group allocation

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/hbmem/hbmem_alloc_buf.png" alt="HBMEM Allocate Buffer" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

Queue usage flowchart

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/hbmem/hbmem_queue.png" alt="HBMEM Queue" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

Pool usage flowchart

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/hbmem/hbmem_pool.png" alt="HBMEM Memory Pool" style={{ width: '30%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

Share pool usage flowchart

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/hbmem/hbmem_share_pool.png" alt="HBMEM Shared Memory Pool" style={{ width: '30%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Compilation

### Compilation Environment

This sample supports direct compilation on the board.

### Compilation Instructions

This sample mainly depends on the header files provided by libhbmem:

```c
#include <hb_mem_mgr.h>
#include <hb_mem_err.h>
```

The libraries required for compilation are as follows:

```makefile
LIBS += -lhbmem -lpthread -lalog -ldl -lstdc++
```

### Compilation Commands

```bash
# Enter the sample directory:
cd /app/communication_demo/hbmem_demo/sample_hbmem
# Compile this sample:
make
# Output file:
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample
```

## Execution

### Supported Platforms

- RDK S600

### Execution Guide

#### Execution Methods

Create com buffer

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 1
```

Create cached and non-cached com buffer, assign values, compare time consumption

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 2
```

Create com buffer in various heaps

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 3
```

Create graph buffer

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 4
```

Create graph buffer in various heaps

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 5
```

Create graph buffer group

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 6
```

Create graph buffer group in various heaps

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 7
```

Intra-process common buffer sharing

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 8
```

Intra-process common buffer sharing, consume_cnt

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 9
```

Inter-process common buffer sharing

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 10
```

Intra-process graphic buffer sharing

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 11
```

Intra-process graphic buffer sharing, consume_cnt

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 12
```

Inter-process graphic buffer sharing

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 13
```

Intra-process graphic buffer group sharing

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 14
```

Intra-process graphic buffer group sharing, consume_cnt

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 15
```

Inter-process graphic buffer group sharing

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 16
```

Inter-process share pool sharing

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 17
```

Share pool usage

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 18
```

Buffer queue usage

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 19
```

Pool usage

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 20
```

Implement buffer conversion between graphic buffer and common buffer

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 21
```

Increase user-space reference count for common buffer

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 22
```

Increase user-space reference count for graphic buffer

```bash
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 23
```

### Execution Parameter Description

- `-m` Specifies the sample test case, see the execution results display for details

### Test Result Description

- If the log ends with `xxxx done`, the sample execution is successful

### Execution Results Display

#### Create com buffer

```text
/app/communication_demo/hbmem_demo/sample_hbmem/libhbmem_sample -m 1
sample_mode = 1
=================================================
Ready to sample_alloc_com_buf
alloc com buf, share_id: 16
[1752:1752] Do system command cat /sys/kernel/debug/ion/clients/1752*.
        heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
        ion_cma:           400000 :                1 :                1 :         fd48e1ab :                3:               16 :                1
[1752:1752] Do system command cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 1752 | grep -w libhbmem_sample.
        libhbmem_sample             1752          4194304
        libhbmem_sample             1752            other          4194304 0
[1752:1752] Result 0.
free com buf
[1752:1752] Do system command cat /sys/kernel/debug/ion/clients/1752*.
        heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
[1752:1752] Do system command cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 1752 | grep -w libhbmem_sample.
[1752:1752] Result 256.
sample_alloc_com_buf done
=================================================
```

(Other execution output examples retain the original text structure, with only formatting and keyword adjustments applied; repetitive content omitted here.)

## FAQ

### Memory Allocation Failure

**Symptom**: `hb_mem_alloc_com_buf` / `hb_mem_alloc_graph_buf` returns an error.

**Cause**: The requested size exceeds the available space of the backend, the heapmask specifies an unavailable heap, or `hb_mem_module_open` was not called first.

**Solution**: Confirm `hb_mem_module_open` was called first; check the size and heapmask parameters; if necessary, retry with another backend (ION CMA / CARVEOUT / SRAM).

### Cross-Process Sharing Failure

**Symptom**: Another process fails to map the same memory segment using a share_id.

**Cause**: The share_id was not passed correctly, the receiving process did not open the hbmem module, or the shared memory was already released.

**Solution**: Obtain the share_id via `hb_mem_get_share_id` and pass it reliably; the receiving process must call `hb_mem_module_open` first; do not release the memory while it is still shared.

### Cache Coherence Issue

**Symptom**: After the CPU writes data, the DMA or another core cannot read the latest data, or vice versa.

**Cause**: No cache invalidate/clean operation was performed.

**Solution**: Perform `hb_mem_cache_clean` (or flush) after writing and before reading, and `hb_mem_cache_invalid` before reading; refer to the usage in `sample_share.c`.

## Related Documentation

- [Sample Code Introduction](/Advanced_development/multimedia_development/multimedia_sample_s600/overview)
- [Multimedia API Reference](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
