# Software Description

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## API

Non-root users cannot use Hbmem APIs.

| Source File                            | Exported Interface Functions                       | Description                                        |
|----------------------------------------|----------------------------------------------------|----------------------------------------------------|
| Basic interface: hb_mem_manager.c      | hb_mem_get_version                                 | Get version information                            |
|                                        | hb_mem_module_open                                 | Open module                                        |
|                                        | hb_mem_module_close                                | Close module                                       |
| Memory allocation interface: hb_mem_allocator.c | hb_mem_alloc_com_buf                           | Allocate com_buf memory                             |
|                                        | hb_mem_get_com_buf                                 | Get corresponding com_buf info via fd                |
|                                        | hb_mem_alloc_graph_buf                             | Allocate graph_buf memory                           |
|                                        | hb_mem_get_graph_buf                               | Get graph_buf info via fd                             |
|                                        | hb_mem_free_buf                                    | Free corresponding buffer                           |
|                                        | hb_mem_invalidate_buf                              | Invalidate cache corresponding to buffer              |
|                                        | hb_mem_flush_buf                                   | Flush buffer to memory                              |
|                                        | hb_mem_is_valid_buf                                | Check if buffer info is valid                       |
|                                        | hb_mem_get_phys_addr                               | Get physical address of buffer                      |
|                                        | hb_mem_get_buf_info                                | Get buffer related information                      |
|                                        | hb_mem_free_buf_with_vaddr                         | Free buffer memory via virtual address              |
|                                        | hb_mem_invalidate_buf_with_vaddr                   | Invalidate cache via virtual address                  |
|                                        | hb_mem_flush_buf_with_vaddr                        | Flush buffer to memory via virtual address          |
|                                        | hb_mem_get_com_buf_with_vaddr                      | Get com_buf via virtual address                     |
|                                        | hb_mem_get_graph_buf_with_vaddr                    | Get graph_buf via virtual address                   |
|                                        | hb_mem_get_share_info                              | Get shared memory info                              |
|                                        | hb_mem_get_share_info_with_vaddr                   | Get shared info via virtual address                 |
|                                        | hb_mem_wait_share_status                           | Wait to get shared memory info                      |
|                                        | hb_mem_wait_share_status_with_vaddr                | Wait to get shared info via virtual address         |
|                                        | hb_mem_get_buffer_process_info                     | Get PID of process holding buffer via virtual address |
|                                        | hb_mem_get_buffer_process_info_with_share_id       | Get PID of process holding buffer via share_id        |
|                                        | hb_mem_get_consume_info                            | Get consume count of buffer                         |
|                                        | hb_mem_get_consume_info_with_vaddr                 | Get consume count of buffer via virtual address       |
|                                        | hb_mem_wait_consume_status                         | Wait until consume count ≤ specified value          |
|                                        | hb_mem_wait_consume_status_with_vaddr              | Wait via virtual address until consume count ≤ specified value |
|                                        | hb_mem_alloc_graph_buf_group                       | Allocate graphic buffer group                       |
|                                        | hb_mem_get_graph_buf_group                         | Get graphic buffer group via fd                       |
|                                        | hb_mem_get_graph_buf_group_with_vaddr              | Get graphic buffer group via virtual address        |
|                                        | hb_mem_get_buf_and_type_with_vaddr                 | Get buffer and buffer type via virtual address        |
|                                        | hb_mem_get_buf_type_with_vaddr                     | Get buffer type via virtual address                  |
|                                        | hb_mem_get_buf_type_and_buf_with_vaddr             | Get buffer and type, supporting type conversion      |
|                                        | hb_mem_inc_user_consume_cnt                        | Increase userspace reference count via fd             |
|                                        | hb_mem_dec_user_consume_cnt                        | Decrease userspace reference count via fd             |
|                                        | hb_mem_inc_user_consume_cnt_with_vaddr             | Increase userspace reference count via virtual address |
|                                        | hb_mem_dec_user_consume_cnt_with_vaddr             | Decrease userspace reference count via virtual address |
|                                        | hb_mem_get_heap_size                               | Get total size of specified heap                     |
|                                        | hb_mem_scatter_alloc_com_buf_with_label            | Allocate or share memory                            |
|                                        | hb_mem_get_buffer_process_cons_info_with_share_id  | Get consume count process info of specified buffer   |
| Memory pool interface: hb_mem_pool.c   | hb_mem_pool_create                                 | Create memory pool                                  |
|                                        | hb_mem_pool_destroy                                | Destroy memory pool                                 |
|                                        | hb_mem_pool_alloc_buf                              | Allocate buffer from memory pool                    |
|                                        | hb_mem_pool_free_buf                               | Free memory allocated from memory pool              |
|                                        | hb_mem_pool_get_info                               | Get memory pool info                                |
| Shared memory pool interface: hb_mem_share_pool.c | hb_mem_share_pool_create                     | Create shared memory pool                           |
|                                        | hb_mem_share_pool_destroy                          | Destroy shared memory pool                          |
|                                        | hb_mem_share_pool_alloc_buf                        | Allocate buffer from shared memory pool             |
|                                        | hb_mem_share_pool_free_buf                         | Free memory allocated from shared memory pool       |
|                                        | hb_mem_share_pool_get_info                         | Get shared memory pool info                         |
| Memory queue interface: hb_mem_queue.c | hb_mem_create_buf_queue                            | Create queue                                        |
|                                        | hb_mem_destroy_buf_queue                           | Destroy queue                                       |
|                                        | hb_mem_dequeue_buf                                 | Dequeue an available free slot from queue             |
|                                        | hb_mem_queue_buf                                   | Insert buffer into queue                              |
|                                        | hb_mem_request_buf                                 | Request buffer from queue                             |
|                                        | hb_mem_release_buf                                 | Release requested buffer from queue                   |
|                                        | hb_mem_cancel_buf                                  | Cancel queue operation                               |
| Memory sharing interface: hb_mem_share.c | hb_mem_import_com_buf                             | Share com_buf                                       |
|                                        | hb_mem_import_graph_buf                           | Share graph buffer                                  |
|                                        | hb_mem_inc_com_buf_consume_cnt                    | Increase com buffer consume count                   |
|                                        | hb_mem_dec_consume_cnt                             | Decrease consume count                              |
|                                        | hb_mem_dec_consume_cnt_with_vaddr                  | Decrease consume count via virtual address          |
|                                        | hb_mem_inc_graph_buf_consume_cnt                  | Increase graph buffer consume count                 |
|                                        | hb_mem_import_com_buf_with_paddr                  | Import via physical address                          |
|                                        | hb_mem_import_graph_buf_group                     | Share graphic buffer group                          |
|                                        | hb_mem_inc_graph_buf_group_consume_cnt            | Increase graphic buffer group consume count         |
|                                        | hb_mem_dma_copy                                   | DMA copy                                            |

## Memory Allocation Attribute Description

| Data Item                                  | Description                                                                                                                         |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| HB_MEM_USAGE_CPU_READ_NEVER               | CPU will never read this memory; memory will not be allocated with read attribute                                                   |
| HB_MEM_USAGE_CPU_READ_OFTEN               | CPU frequently reads this memory; memory will be allocated with read attribute                                                      |
| HB_MEM_USAGE_CPU_READ_MASK                | Mask for obtaining read-related attributes; HB_MEM_USAGE_CPU_READ_OFTEN has higher priority than HB_MEM_USAGE_CPU_READ_NEVER          |
| HB_MEM_USAGE_CPU_WRITE_NEVER              | CPU will never write to this memory; memory will not be allocated with write attribute                                              |
| HB_MEM_USAGE_CPU_WRITE_OFTEN              | CPU frequently writes to this memory; memory will be allocated with write attribute; read attribute automatically added            |
| HB_MEM_USAGE_CPU_WRITE_MASK               | Mask for obtaining write-related attributes; HB_MEM_USAGE_CPU_WRITE_OFTEN has higher priority than HB_MEM_USAGE_CPU_WRITE_NEVER       |
| HB_MEM_USAGE_HW_CIM                       | Indicates memory used for camera interface module; does not affect allocation, used for debug info                                  |
| HB_MEM_USAGE_HW_PYRAMID                   | Indicates memory used for pyramid module; does not affect allocation, used for debug info                                           |
| HB_MEM_USAGE_HW_GDC                       | Indicates memory used as input buffer for geometric distortion correction module; does not affect allocation, used for debug info     |
| HB_MEM_USAGE_HW_GDC_OUT                   | Indicates memory used as output buffer for geometric distortion correction module; does not affect allocation, used for debug info    |
| HB_MEM_USAGE_HW_STITCH                    | Indicates memory used for stitch module; does not affect allocation, used for debug info                                            |
| HB_MEM_USAGE_HW_OPTICAL_FLOW              | Indicates memory used for optical flow module; does not affect allocation, used for debug info                                      |
| HB_MEM_USAGE_HW_BPU                       | Indicates memory used for BPU module; does not affect allocation, used for debug info                                               |
| HB_MEM_USAGE_HW_ISP                       | Indicates memory used for ISP module; does not affect allocation, used for debug info                                               |
| HB_MEM_USAGE_HW_DISPLAY                   | Indicates memory used for Display module; does not affect allocation, used for debug info                                           |
| HB_MEM_USAGE_HW_VIDEO_CODEC               | Indicates memory used for video codec module; does not affect allocation, used for debug info                                       |
| HB_MEM_USAGE_HW_JPEG_CODEC                | Indicates memory used for jpeg codec module; does not affect allocation, used for debug info                                        |
| HB_MEM_USAGE_HW_VDSP                      | Indicates memory used for vdsp module; does not affect allocation, used for debug info                                              |
| HB_MEM_USAGE_HW_IPC                       | Indicates memory used for ipc module; does not affect allocation, used for debug info                                               |
| HB_MEM_USAGE_HW_PCIE                      | Indicates memory used for PCIe module; does not affect allocation, used for debug info                                              |
| HB_MEM_USAGE_HW_YNR                       | Indicates memory used for YNR module; does not affect allocation, used for debug info                                               |
| HB_MEM_USAGE_HW_MASK                      | Mask for obtaining hardware-related attributes; attributes under this mask are mutually exclusive; priority decreases from top to bottom; if multiple attributes specified or none of above, defaults to "other" |
| HB_MEM_USAGE_MAP_INITIALIZED              | Memory needs initialization; memory is zero-initialized after allocation; when neither MAP_INITIALIZED nor MAP_UNINITIALIZED is specified, DMA heap is initialized by default, RESERVED heap is not; mutually exclusive with HB_MEM_USAGE_MAP_UNINITIALIZED, higher priority |
| HB_MEM_USAGE_MAP_UNINITIALIZED            | Memory does not need initialization; memory is not zero-initialized after allocation; mutually exclusive with HB_MEM_USAGE_MAP_INITIALIZED, lower priority |
| HB_MEM_USAGE_CACHED                       | Indicates buffer has cache attribute                                                                                                |
| HB_MEM_USAGE_GRAPHIC_CONTIGUOUS_BUF       | Specifies graph_buf to allocate contiguous physical memory                                                                         |
| HB_MEM_USAGE_MEM_POOL                     | Indicates buffer used for memory pool; users do not need to specify; internal default ignores if specified                         |
| HB_MEM_USAGE_MEM_SHAREPOOL                | Indicates buffer used for memory share pool; users do not need to specify; internal default ignores if specified                   |
| HB_MEM_USAGE_TRIVIAL_MASK                 | Mask for obtaining miscellaneous attributes; attributes under this mask can coexist except HB_MEM_USAGE_MAP_INITIALIZED and HB_MEM_USAGE_MAP_UNINITIALIZED are mutually exclusive |
| HB_MEM_USAGE_PRIV_HEAP_DMA                | Specifies memory allocation from DMA heap                                                                                          |
| HB_MEM_USAGE_PRIV_HEAP_RESERVERD          | Specifies memory allocation from Carveout heap; original definition (for compatibility with existing customer enums); not recommended |
| HB_MEM_USAGE_PRIV_HEAP_RESERVED           | Specifies memory allocation from Carveout heap; latest definition; recommended                                                     |
| HB_MEM_USAGE_PRIV_HEAP_2_RESERVERD        | Specifies memory allocation from Carveout heap2; original definition (for compatibility with existing customer enums); not recommended |
| HB_MEM_USAGE_PRIV_HEAP_2_RESERVED         | Specifies memory allocation from Carveout heap2; latest definition; recommended                                                    |
| HB_MEM_USAGE_PRIV_MASK                    | Mask for obtaining private attributes; attributes under this mask are mutually exclusive; priority decreases from top to bottom; if multiple attributes specified, higher priority selected; if none of above, buffer allocated from DMA heap by default |

## Buffer Type Description

| Type                           | Meaning                |
|--------------------------------|------------------------|
| HB_MEM_BUFFER_TYPE_COMMON        | common buffer        |
| HB_MEM_BUFFER_TYPE_GRAPHIC       | graphic buffer       |
| HB_MEM_BUFFER_TYPE_GRAPHIC_GROUP | graphic buffer group |

## Heap Description

| dts_name     | dts_compatible | heap_mask                       | heap_id                    | flag_mask                                                            | debug_node   |
|--------------|----------------|---------------------------------|----------------------------|----------------------------------------------------------------------|--------------|
| ion_carveout | ion-carveout   | ION_HEAP_CARVEOUT_MASK          | ION_HEAP_TYPE_CARVEOUT     | HB_MEM_USAGE_PRIV_HEAP_RESERVERD/HB_MEM_USAGE_PRIV_HEAP_RESERVED     | carveout     |
| ion_reserved | ion-pool       | ION_HEAP_TYPE_CMA_RESERVED_MASK | ION_HEAP_TYPE_CMA_RESERVED | HB_MEM_USAGE_PRIV_HEAP_2_RESERVERD/HB_MEM_USAGE_PRIV_HEAP_2_RESERVED | cma_reserved |
| ion_cma      | ion-cma        | ION_HEAP_TYPE_DMA_MASK          | ION_HEAP_TYPE_DMA          | HB_MEM_USAGE_PRIV_HEAP_DMA                                           | ion_cma      |

## Memory Allocation Principle

<DocScope products="RDK S100">

When Hbmem allocates memory in the ION driver, it first checks the expected heap for sufficient remaining memory. If not, it allocates from other heaps. The specific allocation logic is as follows:
(cma_reserved => carveout => cma or carveout => cma_reserved => cma or cma => cma_reserved).

</DocScope>
<DocScope products="RDK S600">

When Hbmem allocates memory in the ION driver, it first checks the cache attribute. **If allocating non-cacheable memory, it attempts to allocate from the uncache heap**; if allocation fails, it returns immediately. If allocating cacheable memory, it first checks the expected heap for sufficient remaining memory. If not, it allocates from other heaps. The specific allocation logic is as follows: (cma_reserved => carveout => cma or carveout => cma_reserved => cma or cma => cma_reserved). If no expected heap is specified, it defaults to allocating memory from ion cma.

</DocScope>

## Header File Description

The external header files of libhbmem are hb_mem_mgr.h, hbmem.h, and hb_mem_err.h.
Among them, hb_mem_mgr.h is the main external interface file of libhbmem, which defines all interfaces for libhbmem operations; hbmem.h contains some compatibility interfaces; for new application development, it is recommended to use the external header file hb_mem_mgr.h.
hb_mem_err.h defines the error codes returned by libhbmem.

## Static Library and Dynamic Library Description

libhbmem compilation outputs one static library file libhbmem.a, and three dynamic library files libhbmem.so.1.0.0, libhbmem.so.1, libhbmem.so.
Among them, libhbmem.so.1 and libhbmem.so are dynamic soft links; libhbmem.so.1.0.0 is the main binary, with the numeric suffix representing the version number.
Runtime package compilation is enabled by default, which includes libhbmem.so.1.
Dev package compilation is enabled by default, which includes libhbmem.so.1.0.0, libhbmem.so.1, libhbmem.so.