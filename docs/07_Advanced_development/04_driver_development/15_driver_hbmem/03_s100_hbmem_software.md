# 软件说明

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## API

非 root 用户无法使用 Hbmem 的 api。

| 源文件                                 | 提供对外接口函数                                  | 说明                                         |
|----------------------------------------|---------------------------------------------------|----------------------------------------------|
| 基础接口:hb_mem_manager.c              | hb_mem_get_version                                | 获取版本信息                                 |
|                                        | hb_mem_module_open                                | 打开模块                                     |
|                                        | hb_mem_module_close                               | 关闭模块                                     |
| 内存分配功能接口:hb_mem_allocator.c    | hb_mem_alloc_com_buf                              | 申请 com_buf 内存                              |
|                                        | hb_mem_get_com_buf                                | 通过 fd 获取对应的 com_buf 信息                  |
|                                        | hb_mem_alloc_graph_buf                            | 申请 graph_buf 内存                            |
|                                        | hb_mem_get_graph_buf                              | 通过 fd 获取 graph_buf 信息                      |
|                                        | hb_mem_free_buf                                   | 释放对应的 buffer                             |
|                                        | hb_mem_invalidate_buf                             | 使 buffer 对应 cache 无效                        |
|                                        | hb_mem_flush_buf                                  | 将 buffer 刷新到内存中                         |
|                                        | hb_mem_is_valid_buf                               | 判断 buffer 信息是否有效                       |
|                                        | hb_mem_get_phys_addr                              | 获取 buffer 的物理地址                         |
|                                        | hb_mem_get_buf_info                               | 获取 buffer 相关信息                           |
|                                        | hb_mem_free_buf_with_vaddr                        | 通过虚拟地址释放 buffer 内存                   |
|                                        | hb_mem_invalidate_buf_with_vaddr                  | 通过虚拟地址使 buffer 对应 cache 无效            |
|                                        | hb_mem_flush_buf_with_vaddr                       | 通过虚拟地址将 buffer 刷新到内存中             |
|                                        | hb_mem_get_com_buf_with_vaddr                     | 通过虚拟地址获取 com_buf                      |
|                                        | hb_mem_get_graph_buf_with_vaddr                   | 通过虚拟地址获取 graph_buf                    |
|                                        | hb_mem_get_share_info                             | 获取共享内存信息                             |
|                                        | hb_mem_get_share_info_with_vaddr                  | 通过虚拟地址获取共享信息                     |
|                                        | hb_mem_wait_share_status                          | 等待获取共享内存信息                         |
|                                        | hb_mem_wait_share_status_with_vaddr               | 通过虚拟地址等待获取共享信息                 |
|                                        | hb_mem_get_buffer_process_info                    | 通过虚拟地址获取持有该 buffer 的进程 pid        |
|                                        | hb_mem_get_buffer_process_info_with_share_id      | 通过 share_id 获取持有该 buffer 的进程 pid        |
|                                        | hb_mem_get_consume_info                           | 获取 buffer 的 consume count                    |
|                                        | hb_mem_get_consume_info_with_vaddr                | 通过虚拟地址获取 buffer 的 consume count        |
|                                        | hb_mem_wait_consume_status                        | 等待 consume count 小于等于指定值              |
|                                        | hb_mem_wait_consume_status_with_vaddr             | 通过虚拟地址等待 consume count 小于等于指定值  |
|                                        | hb_mem_alloc_graph_buf_group                      | 申请 graphic buffer group                     |
|                                        | hb_mem_get_graph_buf_group                        | 通过 fd 获取 graphic buffer group               |
|                                        | hb_mem_get_graph_buf_group_with_vaddr             | 通过虚拟地址获取 graphic buffer group         |
|                                        | hb_mem_get_buf_and_type_with_vaddr                | 通过虚拟地址获取 buffer 和 buffer 类型           |
|                                        | hb_mem_get_buf_type_with_vaddr                    | 通过虚拟地址获取 buffer 类型                   |
|                                        | hb_mem_get_buf_type_and_buf_with_vaddr            | 获取 buffer 和类型，支持类型转换               |
|                                        | hb_mem_inc_user_consume_cnt                       | 通过 fd 增加 buffer 用户态引用计数               |
|                                        | hb_mem_dec_user_consume_cnt                       | 通过 fd 减少 buffer 用户态引用计数               |
|                                        | hb_mem_inc_user_consume_cnt_with_vaddr            | 通过虚拟地址增加 buffer 用户态引用计数         |
|                                        | hb_mem_dec_user_consume_cnt_with_vaddr            | 通过虚拟地址减少 buffer 用户态引用计数         |
|                                        | hb_mem_get_heap_size                              | 获取指定 heap 的 size 总大小                     |
|                                        | hb_mem_scatter_alloc_com_buf_with_label           | 申请或者共享内存                             |
|                                        | hb_mem_get_buffer_process_cons_info_with_share_id | 获取指定 buffer 的 consume cnt 进程信息          |
| 内存池功能接口:hb_mem_pool.c           | hb_mem_pool_create                                | 创建内存池                                   |
|                                        | hb_mem_pool_destroy                               | 销毁内存池                                   |
|                                        | hb_mem_pool_alloc_buf                             | 在内存池上分配 buffer                         |
|                                        | hb_mem_pool_free_buf                              | 释放在内存池上分配的内存                     |
|                                        | hb_mem_pool_get_info                              | 获取内存池信息                               |
| 共享内存池功能接口:hb_mem_share_pool.c | hb_mem_share_pool_create                          | 创建共享内存池                               |
|                                        | hb_mem_share_pool_destroy                         | 销毁共享内存池                               |
|                                        | hb_mem_share_pool_alloc_buf                       | 在共享内存池上分配 buffer                     |
|                                        | hb_mem_share_pool_free_buf                        | 释放在共享内存池上分配的内存                 |
|                                        | hb_mem_share_pool_get_info                        | 获取共享内存池信息                           |
| 内存队列功能接口:hb_mem_queue.c        | hb_mem_create_buf_queue                           | 创建 queue                                    |
|                                        | hb_mem_destroy_buf_queue                          | 销毁 queue                                    |
|                                        | hb_mem_dequeue_buf                                | 取出 queue 中的空闲可用 slot                    |
|                                        | hb_mem_queue_buf                                  | 在 queue 中插入 buffer                          |
|                                        | hb_mem_request_buf                                | 在 queue 中请求 buffer                          |
|                                        | hb_mem_release_buf                                | 释放 queue 中请求的 buffer                      |
|                                        | hb_mem_cancel_buf                                 | 取消对 queue 的操作                            |
| 内存共享功能接口:hb_mem_share.c        | hb_mem_import_com_buf                             | 共享 com_buf                                 |
|                                        | hb_mem_import_graph_buf                           | 共享 graph buffer                            |
|                                        | hb_mem_inc_com_buf_consume_cnt                    | 增加 com buffer consume count                 |
|                                        | hb_mem_dec_consume_cnt                            | 减少 consume count                            |
|                                        | hb_mem_dec_consume_cnt_with_vaddr                 | 通过虚拟地址减少 consume count                |
|                                        | hb_mem_inc_graph_buf_consume_cnt                  | 增加 graph buffer consume count               |
|                                        | hb_mem_import_com_buf_with_paddr                  | 通过物理地址进行 import 操作                   |
|                                        | hb_mem_import_graph_buf_group                     | 共享 graphic buffer group                    |
|                                        | hb_mem_inc_graph_buf_group_consume_cnt            | 增加 graphic buffer group consume count       |
|                                        | hb_mem_dma_copy                                   | dma 拷贝                                     |

## 内存分配属性说明

| 数据项                                     | 描述                                                                                                                         |
|-------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| HB_MEM_USAGE_CPU_READ_NEVER               | CPU 不会读该内存，内存将不会被分配读属性                                                                                     |
| HB_MEM_USAGE_CPU_READ_OFTEN               | CPU 经常读该内存，内存将被分配读属性                                                                                         |
| HB_MEM_USAGE_CPU_READ_MASK                | 用于获取 read 相关属性的掩码，HB_MEM_USAGE_CPU_READ_OFTEN 属性优先级高于 HB_MEM_USAGE_CPU_READ_NEVER                            |
| HB_MEM_USAGE_CPU_WRITE_NEVER              | CPU 不会写该内存，内存将不会被分配写属性                                                                                     |
| HB_MEM_USAGE_CPU_WRITE_OFTEN              | CPU 经常写该内存，内存将被分配写属性，该属性会自动添加读属性                                                                 |
| HB_MEM_USAGE_CPU_WRITE_MASK               | 用于获取 write 相关属性的掩码，HB_MEM_USAGE_CPU_WRITE_OFTEN 属性优先级高于 HB_MEM_USAGE_CPU_WRITE_NEVER                         |
| HB_MEM_USAGE_HW_CIM                       | 表明该内存用于 camera interface module 相关模块，不影响内存分配，用于 debug 信息                                               |
| HB_MEM_USAGE_HW_PYRAMID                   | 表明该内存用于 pyramid 相关模块，不影响内存分配，用于 debug 信息                                                                |
| HB_MEM_USAGE_HW_GDC                       | 表明该内存用于 geometric distortion correction 相关模块输入 buffer，不影响内存分配，用于 debug 信息                              |
| HB_MEM_USAGE_HW_GDC_OUT                   | 表明该内存用于 geometric distortion correction 相关模块输出 buffer，不影响内存分配，用于 debug 信息                              |
| HB_MEM_USAGE_HW_STITCH                    | 表明该内存用于 stitch 相关模块，不影响内存分配，用于 debug 信息                                                                 |
| HB_MEM_USAGE_HW_OPTICAL_FLOW              | 表明该内存用于 optical flow 相关模块，不影响内存分配，用于 debug 信息                                                           |
| HB_MEM_USAGE_HW_BPU                       | 表明该内存用于 BPU 模块，不影响内存分配，用于 debug 信息                                                                        |
| HB_MEM_USAGE_HW_ISP                       | 表明该内存用于 ISP 模块，不影响内存分配，用于 debug 信息                                                                        |
| HB_MEM_USAGE_HW_DISPLAY                   | 表明该内存用于 Display 相关模块，不影响内存分配，用于 debug 信息                                                                |
| HB_MEM_USAGE_HW_VIDEO_CODEC               | 表明该内存用于 video codec 相关模块，不影响内存分配，用于 debug 信息                                                            |
| HB_MEM_USAGE_HW_JPEG_CODEC                | 表明该内存用于 jpeg codec 相关模块，不影响内存分配，用于 debug 信息                                                             |
| HB_MEM_USAGE_HW_VDSP                      | 表明该内存用于 vdsp 相关模块，不影响内存分配，用于 debug 信息                                                                   |
| HB_MEM_USAGE_HW_IPC                       | 表明该内存用于 ipc 相关模块，不影响内存分配，用于 debug 信息                                                                    |
| HB_MEM_USAGE_HW_PCIE                      | 表明该内存用于 PCIe 相关模块，不影响内存分配，用于 debug 信息                                                                   |
| HB_MEM_USAGE_HW_YNR                       | 表明该内存用于 YNR 相关模块，不影响内存分配，用于 debug 信息                                                                    |
| HB_MEM_USAGE_HW_MASK                      | 用于获取硬件相关属性的掩码，该掩码下的属性互斥，从上到下优先级依次降低，当指定多个属性或指定为非上述值时，默认指定成"other"  |
| HB_MEM_USAGE_MAP_INITIALIZED              | 需要初始化该内存，内存分配后被初始化为0，当未指定 MAP_INITIALIZED 和 MAP_UNINITIALIZED 时， DMA heap 会被默认初始化，RESERVED heap 不会被初始化，该属性和 HB_MEM_USAGE_MAP_UNINITIALIZED 互斥，且优先级较高 |
| HB_MEM_USAGE_MAP_UNINITIALIZED            | 不需要初始化该内存，内存分配后不被初始化为0，该属性和 HB_MEM_USAGE_MAP_INITIALIZED 互斥，且优先级较低                           |
| HB_MEM_USAGE_CACHED                       | 表明该块 buffer 具有 cache 属性                                                                                                 |
| HB_MEM_USAGE_GRAPHIC_CONTIGUOUS_BUF       | 指定 graph_buf 分配连续的物理内存                                                                                             |
| HB_MEM_USAGE_MEM_POOL                     | 用于表明该 buffer 用于 memory pool，用户分配 buffer 时无需指定该参数，即使指定该参数，内部默认忽略                               |
| HB_MEM_USAGE_MEM_SHAREPOOL                | 用于表明该 buffer 用于 memory share pool，用户分配 buffer 时无需指定该参数，即使指定该参数，内部默认忽略                         |
| HB_MEM_USAGE_TRIVIAL_MASK                 | 用于获取杂项相关属性的掩码，该掩码下的属性，除了 HB_MEM_USAGE_MAP_INITIALIZED 和 HB_MEM_USAGE_MAP_UNINITIALIZED 互斥，其他可以并存 |
| HB_MEM_USAGE_PRIV_HEAP_DMA                | 指定从 DMA heap 分配内存                                                                                                      |
| HB_MEM_USAGE_PRIV_HEAP_RESERVERD          | 指定从 Carveout heap 分配内存，原始定义（兼容客户已使用的枚举），不建议使用                                                    |
| HB_MEM_USAGE_PRIV_HEAP_RESERVED           | 指定从 Carveout heap 分配内存，最新定义，建议使用                                                                              |
| HB_MEM_USAGE_PRIV_HEAP_2_RESERVERD        | 指定从 Carveout heap2分配内存，是原始定义（兼容客户已使用的枚举），不建议使用                                                 |
| HB_MEM_USAGE_PRIV_HEAP_2_RESERVED         | 指定从 Carveout heap2分配内存，最新定义，建议使用                                                                             |
| HB_MEM_USAGE_PRIV_MASK                    | 用于获取私有属性的掩码，该掩码下的属性互斥，从上到下优先级依次降低，当指定多个属性时，默认选用高优属性，当指定为非上述值时，默认从 DMA heap 分配 buffer |

## buffer 类型说明

| 类型                             | 含义                 |
|----------------------------------|----------------------|
| HB_MEM_BUFFER_TYPE_COMMON        | common buffer        |
| HB_MEM_BUFFER_TYPE_GRAPHIC       | graphic buffer       |
| HB_MEM_BUFFER_TYPE_GRAPHIC_GROUP | graphic buffer group |

## heap 介绍

| dts_name     | dts_compatible | heap_mask                       | heap_id                    | flag_mask                                                            | debug_node   |
|--------------|----------------|---------------------------------|----------------------------|----------------------------------------------------------------------|--------------|
| ion_carveout | ion-carveout   | ION_HEAP_CARVEOUT_MASK          | ION_HEAP_TYPE_CARVEOUT     | HB_MEM_USAGE_PRIV_HEAP_RESERVERD/HB_MEM_USAGE_PRIV_HEAP_RESERVED     | carveout     |
| ion_reserved | ion-pool       | ION_HEAP_TYPE_CMA_RESERVED_MASK | ION_HEAP_TYPE_CMA_RESERVED | HB_MEM_USAGE_PRIV_HEAP_2_RESERVERD/HB_MEM_USAGE_PRIV_HEAP_2_RESERVED | cma_reserved |
| ion_cma      | ion-cma        | ION_HEAP_TYPE_DMA_MASK          | ION_HEAP_TYPE_DMA          | HB_MEM_USAGE_PRIV_HEAP_DMA                                           | ion_cma      |

## 内存分配原则

<DocScope products="RDK S100">

Hbmem 在 ION 驱动中分配内存时，首先会去预期的 heap 上查询是否剩余足够内存。如果没有，则需要从其他 heap 进行分配。具体分配逻辑如下：
（cma_reserved=>carveout=>cma or carveout=>cma_reserved =>cma or cma=>cma_reserved）。

</DocScope>
<DocScope products="RDK S600">

Hbmem 在 ION 驱动中分配内存时，首先会判断 cache 属性。**如果申请 non-cacheable 内存，则从 uncache heap 上尝试分配内存**，分配失败直接返回；如果申请 cacheable 内存，首先会去预期的 heap 上查询是否剩余足够内存。如果没有，则需要从其他 heap 进行分配。具体分配逻辑如下： （cma_reserved=>carveout=>cma or carveout=>cma_reserved =>cma or cma=>cma_reserved）。 如果不带预期 heap，则默认从 ion cma 上分配内存。

</DocScope>

## 头文件说明

libhbmem 的对外头文件为 hb_mem_mgr.h，hbmem.h 和 hb_mem_err.h。
其中 hb_mem_mgr.h 为 libhbmem 主要的对外接口文件，其中定义了 libhbmem 相关操作的所有接口；hbmem.h 中为一些兼容接口，新开发应用推荐使用对外头文件 hb_mem_mgr.h；
hb_mem_err.h 中定义了 libhbmem 返回的错误码。

## 静态库和动态库说明

libhbmem 编译输出一个静态库文件 libhbmem.a，和三个动态库文件 libhbmem.so.1.0.0，libhbmem.so.1，libhbmem.so。
其中 libhbmem.so.1，libhbmem.so 为动态软链接；libhbmem.so.1.0.0为本体，数字后缀为版本号。
默认开启 runtime 包编译，其中包含 libhbmem.so.1；
默认开启 dev 包编译，其中包含 libhbmem.so.1.0.0，libhbmem.so.1，libhbmem.so。
