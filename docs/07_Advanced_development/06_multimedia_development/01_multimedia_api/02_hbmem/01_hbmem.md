---
title: "hbmem"
sidebar_position: 1
slug: /Advanced_development/multimedia_development/multimedia_api/hbmem_api
description: "RDK S100/S600 hbmem 共享内存使用指南：模块描述、参考示例、API 参考、接口说明、数据结构、内存分配属性、图像格式、返回值与常见问题"
---

# hbmem

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 模块描述

S100/S600 SoC 提供了多种硬件加速单元，包括 ISP、PYM、GDC、STITCH、VPU、JPU、BPU 等。这些硬件加速单元之间以及与 CPU 之间的数据传输依赖 DDR。由于硬件加速单元在访问 DDR 数据时需要物理地址连续，而 Linux 系统用户空间的内存分配接口（如 malloc）仅能保证虚拟地址连续，且随着系统运行，即使物理内存充足，由于内存碎片问题也可能导致无法分配大块连续的物理内存，因此在设备树中为这些硬件加速单元预留了物理内存（详见 [ION](02_ion.md)）。

Hbmem 模块在应用层提供了丰富的接口，支持对系统预留内存的五种管理方式：**内存分配**、**内存共享**、**内存队列管理**、**内存池管理** 以及 **共享内存池管理**。

| 功能名称 | 功能描述 |
|---|---|
| 内存分配 | 从系统预留内存上分配连续物理内存，并且支持 DMA 拷贝 |
| 内存共享 | 支持用户使用内存 handle 在不同的线程或进程间共享内存空间，且自动管理内存引用计数，保证使用中的内存不被意外释放 |
| 内存队列管理 | 提供输入输出队列管理，内存分配端将内存送入输入队列供内存消费端使用，内存消费端将不再使用的内存送入输出队列由分配端释放（**注意** 不支持多进程） |
| 内存池 | 支持用户通过内存分配功能创建本地内存池，再从该内存池中分配和释放小块的内存 |
| 共享内存池 | 支持多进程共享，但是从共享内存池上分配的 buffer 大小相同，且 buffer 的大小只能在创建共享内存池时指定 |

### 内存分配

内存分配是 hbmem 功能的基础，其他四种管理功能（内存共享、内存队列管理、内存池以及共享内存池）都与内存分配功能相关。内存分配相关接口主要实现了连续物理内存的分配、释放和刷新等功能，主要实现：

1. 提供最基本的连续物理内存的分配、释放接口，详见 [API 参考](#api-参考)
2. 内存分配成功后，用户可获得对应的文件句柄（fd），基于该文件句柄，用户可对相关的物理内存进行 Cache 操作（invalidate/flush）、DMA 拷贝、获取 buffer 信息等操作；同时该模块也支持使用虚拟地址进行 invalidate/flush、获取 buffer 信息等操作（接口名带 `_with_vaddr` 的系列接口）
3. 支持设置多种属性配置，包括 Cache 属性、内存 heap 属性、硬件加速单元标识属性，详见 [内存分配属性说明](#内存分配属性说明hb_mem_usage_)
4. 提供三种类别的内存单元：整块连续内存单元（com_buf，适用于语音、纯 featuremap 等场景）、图像数据内存单元（graph_buf，用于 RGB、RAW 和 YUV 图像的内存分配，适用于 PYM 输出 buffer 等场景）、图像数据内存组单元（支持一次性申请多个 graphic buffer，并组成一个 group 返回），详见 [内存分配单元说明](#内存分配单元说明)

**注意**：不建议用户直接对物理地址进行 mmap 或传递等操作，这些操作 **不会增加该内存的引用计数**，存在内存释放后用户仍在访问的情况。

#### 内存分配单元说明

| 内存类别 | 结构体 | 场景 | 特点 |
|---|---|---|---|
| 整块连续内存 | `hb_mem_common_buf_t` | 编码器输出的码流或 BPU 使用的纯 featuremap | 简单的一段连续的物理空间 |
| 图像数据内存 | `hb_mem_graphic_buf_t` | ISP、GDC、PYM 使用的图像数据 | 支持多个 plane 的多个连续空间 |
| 图像数据内存组 | `hb_mem_graphic_buf_group_t` | PYM 模块使用多层图像数据 | 多个图像数据存储到 1 个数组中 |

#### Cache 操作说明

现代 CPU 为了加速数据访问，引入了 Cache，用于存储主存（DDR）中的部分数据以提升访问速度：

1. CPU 写 DDR 操作：当 CPU 修改某块数据时，通常不会立即将数据写回 DDR，而是先更新 Cache 中的副本。这种机制称为「写回缓存」，有效减少了对 DDR 的直接写操作，提高性能。
2. CPU 读 DDR 操作：当 CPU 从 DDR 中读取数据时，会优先检查 Cache。如果 Cache 中已经存在目标数据的副本，将直接从 Cache 中读取，而无需访问 DDR。这种机制显著提升了读操作效率。

Cache 是专属于 CPU 的硬件单元，在仅有 CPU 访问 DDR 时，数据的一致性由 CPU 内部机制自动保障，不会出现问题。然而，当其他硬件加速单元（如 ISP、PYM、GDC、GPU 等）也需要访问 DDR 时，由于这些单元无法感知 CPU 的 Cache 状态，会引发数据一致性问题。

因此 hbmem 模块提供了两种 API 接口，实现在应用层主动操作 CPU Cache：

1. Cache 刷新：`hb_mem_flush_buf`——将 Cache 中已经缓存了 DDR 的数据回写到 DDR 中
2. Cache 无效：`hb_mem_invalidate_buf`——将 Cache 中已缓存的 DDR 数据丢弃，使其进入未命中状态，后续访问将强制从 DDR 读取最新数据

##### Cache 刷新

Cache 刷新的操作是将 Cache 中已经缓存了 DDR 的数据，回写到 DDR 中。

下面针对从 eMMC 中读取视频帧到 DDR，然后交给 PYM 处理的场景举例：

1. 左图：没有调用 Cache 刷新的情况
2. 右图：在合适的时机调用 Cache 刷新的情况（`hb_mem_flush_buf`）

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/hbmem/hbm_cache_flush.png" alt="Cache 刷新（hb_mem_flush_buf）场景示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

左图流程解释（存在缓存一致性的问题）：

- 步骤 1：CPU 从 eMMC 读取视频数据，数据传输过程中经过 Cache 缓存
- 步骤 2：读取的视频数据被存储到 DDR 中。然而，在视频数据读取完成后，部分数据可能仍在 Cache 中未完全写入 DDR
- 步骤 3：PYM 从 DDR 读取视频数据进行处理，但由于数据不完整（部分数据在 Cache 中），导致 PYM 处理后的数据是错误的

右图流程解释（解决缓存一致性的问题）：

- 步骤 1：同左图
- 步骤 2：同左图
- 步骤 3：调用 Cache 刷新接口 `hb_mem_flush_buf`，将 Cache 中的数据回写到 DDR 中
- 步骤 4：PYM 从 DDR 中读取视频数据，进行处理，可以读到完整的视频数据

##### Cache 无效

Cache 无效化操作指的是将 Cache 中已缓存的 DDR 数据丢弃，使其进入未命中状态。当后续访问 DDR 时，系统将不再使用 Cache 中的旧数据，而是强制从 DDR 读取最新数据。

下面针对 PYM 从 DDR 读取视频数据处理后保存到 eMMC 的场景举例：

1. 左图：没有调用 Cache 无效接口的情况
2. 右图：在合适的时机调用 Cache 无效接口的情况（`hb_mem_invalidate_buf`）

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/hbmem/hbm_cache_invalidate.png" alt="Cache 无效（hb_mem_invalidate_buf）场景示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

左图流程解释（存在缓存一致性的问题）：

- 步骤 1：CPU 读取 DDR 中的视频数据进行某种算法处理后，此时 Cache 中缓存了部分 DDR 中的数据
- 步骤 2：PYM 从 DDR 中读取视频数据
- 步骤 3：PYM 内部进行处理（如 OSD 叠加文字）后，继续回写到 DDR 中
- 步骤 4：CPU 继续读取 DDR 中的视频数据。由于步骤 3 中 PYM 写入了新的数据，但 Cache 中还缓存着步骤 1 时的部分旧数据，因此 CPU 只会读到 Cache 中的旧数据，而读不到 PYM 写入的新数据
- 步骤 5：CPU 将读取的数据写入到 eMMC 中。由于步骤 4 只读取到了部分新数据，导致写入 eMMC 中的数据是错误的

右图流程解释（解决缓存一致性的问题）：

- 步骤 1：同左图
- 步骤 2：同左图
- 步骤 3：同左图
- 步骤 4：调用 Cache 无效接口 `hb_mem_invalidate_buf`，将 Cache 中的旧数据丢弃，使其进入未命中状态
- 步骤 5：CPU 读取 DDR 中的视频数据。由于步骤 4 将 Cache 中的旧数据丢弃了，CPU 会从 DDR 中读取全部的最新视频数据
- 步骤 6：CPU 将读取的数据写入到 eMMC 中。由于步骤 5 读取的数据全部是最新的，写入 eMMC 的数据没有问题

:::info 注意

仅 cacheable 属性的 buffer 需要 invalidate/flush 操作；non-cacheable 的 buffer 调用时会产生 "No need to invalidate for uncached buffer" 警告。

:::

### 内存共享

内存共享模块相关接口实现了多个线程/进程之间的内存安全共享。用户可直接传递 com_buf 或 graph_buf 类型的 buffer 到另一个线程或进程中，再通过相关 import 接口导入该 buffer，进而获取该 buffer 的相关信息以及增加对该 buffer 的引用计数，防止被其他模块释放，从而实现 buffer 的安全共享。graphic buffer group 也支持多线程/进程之间的内存安全共享，使用方法与 graphic buffer 类似。使用流程如下：

1. 用户可直接传递内存分配单元对应的结构体到另一个线程或进程中
2. 另外一个进程接收到结构体信息后，通过 `hb_mem_import_xxx` 接口完成导入，实现 buffer 的安全共享

内存分配单元对应的结构体和导入接口如下所示：

| 内存类别 | 结构体 | 导入接口 |
|---|---|---|
| 整块连续内存 | `hb_mem_common_buf_t` | `hb_mem_import_com_buf` |
| 图像数据内存 | `hb_mem_graphic_buf_t` | `hb_mem_import_graph_buf` |
| 图像数据内存组 | `hb_mem_graphic_buf_group_t` | `hb_mem_import_graph_buf_group` |

导入（import）操作的本质是增加对应 buffer 的引用计数，并为本进程生成新的虚拟地址映射；配套的 `hb_mem_free_buf` 则是减少引用计数。

下图展示多进程之间内存共享的流程（以 `hb_mem_common_buf_t` 在多进程之间共享举例）：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/hbmem/hbm_share_flow.png" alt="多进程内存共享流程示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### 内存队列管理

内存队列管理模块提供了一种通用的队列管理机制，该机制支持生产者和消费者以 **FREE / DEQUEUE / QUEUE / REQUEST** 4 种状态操作队列元素：

1. **FREE**：生产者可获取该队列空间并填充元素信息
2. **DEQUEUE**：该元素被生产者获取并尚未归还
3. **QUEUE**：生产者已填充该队列元素并可被消费者获取
4. **REQUEST**：该元素被消费者获取并尚未释放

生产者和消费者通过各自的接口保证 buffer 元素在两者之间正常轮转。

:::info 注意

- 该队列只支持单进程内操作
- 内存队列采用固定 slot 状态管理：没有 FREE slot 可供 dequeue，或没有 QUEUE 状态的 slot 可供 request 时，timeout 为 0 立即返回 `HB_MEM_ERR_QUEUE_NO_AVAILABLE_SLOT`，timeout 大于 0 且等待超时则返回 `HB_MEM_ERR_TIMEOUT`；对不处于 DEQUEUE 状态的 slot 执行 queue 操作返回 `HB_MEM_ERR_QUEUE_WRONG_SLOT`

:::

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/hbmem/hbm_queue.png" alt="内存队列管理示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### 内存池

内存池模块相关接口支持用户通过内存分配功能创建本地内存池，再从该内存池中分配和释放小块的内存。

使用内存池模块可以保证用户不经过内核态快速分配内存 ，从而实现更高效的内存管理。

目前用户程序（hbrt、dnn等）中常有自身实现的内存管理模块来提高内存分配速度，造成代码重复，开发和维护不便，因此用户可使用内存池模块来进行内存管理，可提高模块的复用性。

在系统启动过程中，提前为用户申请一块大内存，这样用户在申请内存时，可以直接使用内存池中的内存，绕过了陷入内核态申请内存的步骤，或者说是提前将该步骤实现了。 

需要注意的是，普通内存池的创建、分配、释放和销毁只支持在创建进程内管理；从普通内存池分配得到的buffer可以传递给其他进程，并通过hb_mem_import_com_buf导入后共享。若需要多个进程直接从同一个内存池分配和释放buffer，请使用共享内存池接口。

### 共享内存池

共享内存池功能同内存池，不同在于共享内存池分配的内存支持多进程共享，但是从共享内存池上分配的 buffer 大小相同，且 buffer 的大小只能在创建共享内存池时指定。

由于支持多进程共享，共享内存池分配的内存在做 import、free 时，效率略低于普通内存。

## 参考示例

- hbmem 部分示例代码可以参考板端 `/app/communication_demo/hbmem_demo/sample_hbmem/` 章节（含分配/共享/队列/池四类示例），详细说明见 [hbmem sample 使用说明](../../02_multimedia_sample/12_hbmem_sample_guide.md)

## API 参考

1. 链接库：libhbmem.so（`-lhbmem`）
2. 头文件：`hb_mem_mgr.h`、`hb_mem_err.h`

### 基础接口

| API 接口 | 接口功能 |
|---|---|
| hb_mem_get_version | 获取模块版本号 |
| hb_mem_module_open | 打开内存模块 |
| hb_mem_module_close | 关闭内存模块 |

### 内存分配接口

| API 接口 | 接口功能 |
|---|---|
| hb_mem_alloc_com_buf | 分配 common buffer |
| hb_mem_get_com_buf | 通过 fd 获取 common buffer 信息 |
| hb_mem_alloc_graph_buf | 分配 graphic buffer |
| hb_mem_get_graph_buf | 通过 fd 获取 graphic buffer 信息 |
| hb_mem_free_buf | 通过 fd 释放 buffer |
| hb_mem_invalidate_buf | 使 fd 对应的缓冲区 cache 无效 |
| hb_mem_flush_buf | 将 fd 对应的缓冲区 cache 刷新回内存 |
| hb_mem_is_valid_buf | 判断输入的虚拟地址是否为从 memory module 分配的有效地址 |
| hb_mem_get_phys_addr | 获取输入虚拟地址对应的物理地址信息 |
| hb_mem_get_buf_info | 获取输入虚拟地址对应的起始虚拟地址和 buffer 大小信息 |
| hb_mem_invalidate_buf_with_vaddr | 使虚拟地址对应的缓冲区 cache 无效 |
| hb_mem_flush_buf_with_vaddr | 将虚拟地址对应的缓冲区 cache 刷新回内存 |
| hb_mem_get_com_buf_with_vaddr | 通过虚拟地址获取 common buffer 信息 |
| hb_mem_get_graph_buf_with_vaddr | 通过虚拟地址获取 graphic buffer 信息 |
| hb_mem_free_buf_with_vaddr | 通过虚拟地址释放 buffer |
| hb_mem_alloc_graph_buf_group | 申请一组 graphic buffer |
| hb_mem_get_graph_buf_group | 通过 fd（group 中任意一个有效 fd）获取 graphic buffer group |
| hb_mem_get_graph_buf_group_with_vaddr | 通过虚拟地址（group 中任意一个有效虚拟地址）获取 graphic buffer group |
| hb_mem_scatter_alloc_com_buf_with_label | 申请或者共享内存（支持携带 label） |
| hb_mem_dma_copy | 将源地址的数据通过 DMA 拷贝到目的地址 |

### 内存共享接口

| API 接口 | 接口功能 |
|---|---|
| hb_mem_import_com_buf | 导入 common buffer 的共享内存，获取新的 common buffer 信息 |
| hb_mem_import_com_buf_with_paddr | 通过物理地址共享内存，只能用于 hbmem 申请的内存 |
| hb_mem_import_graph_buf | 导入 graphic buffer 的共享内存，获取新的 graphic buffer 信息 |
| hb_mem_import_graph_buf_group | 共享一组 graphic buffer |
| hb_mem_get_share_info | 通过 fd 获取对应 buffer 的共享客户端的个数 |
| hb_mem_get_share_info_with_vaddr | 通过虚拟地址获取对应 buffer 的共享客户端的个数 |
| hb_mem_wait_share_status | 等待 fd 对应 buffer 的共享客户端个数小于等于目标值 |
| hb_mem_wait_share_status_with_vaddr | 等待虚拟地址对应 buffer 的共享客户端个数小于等于目标值 |

### 内存队列管理接口

| API 接口 | 接口功能 |
|---|---|
| hb_mem_create_buf_queue | 创建内存队列 |
| hb_mem_destroy_buf_queue | 销毁内存队列 |
| hb_mem_dequeue_buf | 生产者获取可用的 slot 信息 |
| hb_mem_queue_buf | 生产者填充元素信息后将其入队到该 slot 中 |
| hb_mem_request_buf | 消费者从队列中获取生产者入队的元素信息 |
| hb_mem_release_buf | 消费者释放使用完的元素索引 |
| hb_mem_cancel_buf | 生产者取消 dequeue 获得的 slot 或消费者取消 request 获得的 slot 信息 |

### 内存池接口

| API 接口 | 接口功能 |
|---|---|
| hb_mem_pool_create | 创建一个内存池 |
| hb_mem_pool_destroy | 销毁一个内存池 |
| hb_mem_pool_alloc_buf | 从内存池中分配一块 common buffer |
| hb_mem_pool_free_buf | 释放从内存池中分配的 buffer |
| hb_mem_pool_get_info | 获取内存池的实时信息 |

### 共享内存池接口

| API 接口 | 接口功能 |
|---|---|
| hb_mem_share_pool_create | 创建一个共享内存池 |
| hb_mem_share_pool_destroy | 销毁一个共享内存池 |
| hb_mem_share_pool_alloc_buf | 从共享内存池中分配一块 common buffer |
| hb_mem_share_pool_free_buf | 释放从共享内存池中分配的 buffer |
| hb_mem_share_pool_get_info | 获取共享内存池的实时信息 |

### 通用信息获取或设置接口

| API 接口 | 接口功能 |
|---|---|
| hb_mem_get_buf_type_with_vaddr | 获取虚拟地址对应 buffer 的类型 |
| hb_mem_get_buf_type_and_buf_with_vaddr | 获取虚拟地址对应 buffer 的类型，并将其转换成 com buf 或 graph buf |
| hb_mem_get_buf_and_type_with_vaddr | 通过虚拟地址获取对应 buffer 的类型和对应的 buffer（可以获取 graphic buffer group）|
| hb_mem_get_buffer_process_info | 通过虚拟地址获取持有该 buffer 的进程 pid |
| hb_mem_get_buffer_process_info_with_share_id | 通过 share_id 获取持有对应 buffer 的进程 pid |
| hb_mem_get_buffer_process_cons_info_with_share_id | 获取指定 buffer 持有 consume cnt 的所有进程 pid 及其 consume cnt |
| hb_mem_get_consume_info | 通过 fd 获取对应 buffer 的 consume cnt |
| hb_mem_get_consume_info_with_vaddr | 通过虚拟地址获取对应 buffer 的 consume cnt |
| hb_mem_wait_consume_status | 等待 fd 对应 buffer 的 consume cnt 变成目标值，超时时间为 timeout |
| hb_mem_wait_consume_status_with_vaddr | 等待虚拟地址对应 buffer 的 consume cnt 变成目标值，超时时间为 timeout |
| hb_mem_inc_com_buf_consume_cnt | 增加对应 common buffer 的 consume cnt |
| hb_mem_inc_graph_buf_consume_cnt | 增加对应 graphic buffer 的 consume cnt |
| hb_mem_inc_graph_buf_group_consume_cnt | 增加 graphic buffer group 中所有 buffer 的 consume cnt |
| hb_mem_dec_consume_cnt | 通过 fd 减少对应 buffer 的 consume cnt |
| hb_mem_dec_consume_cnt_with_vaddr | 通过虚拟地址减少对应 buffer 的 consume cnt |
| hb_mem_inc_user_consume_cnt | 通过 fd 增加指定 buffer 的用户态引用计数 |
| hb_mem_dec_user_consume_cnt | 通过 fd 减少指定 buffer 的用户态引用计数 |
| hb_mem_inc_user_consume_cnt_with_vaddr | 通过虚拟地址增加指定 buffer 的用户态引用计数 |
| hb_mem_dec_user_consume_cnt_with_vaddr | 通过虚拟地址减少指定 buffer 的用户态引用计数 |
| hb_mem_get_heap_size | 获取指定 heap 的 size 总大小 |

### 兼容性接口（新功能开发时不建议使用）

| API 接口 | 接口功能 |
|---|---|
| hbmem_version | 获取当前使用 hbmem 库的版本情况 |
| hbmem_alloc | 分配物理连续的内存空间 |
| hbmem_free | 释放由 hbmem_alloc 分配的内存空间 |
| hbmem_mmap | 将已知物理地址的内存空间进行 hbmem 映射，只允许落在 ion heap 中的内存调用该接口 |
| hbmem_mmap_with_share_id | 使用 share_id 将已知物理地址的内存空间进行 hbmem 映射 |
| hbmem_munmap | 释放由 hbmem_mmap 的映射 |
| hbmem_dmacpy | 使用系统的 DMA，完成两块 hbmem 内存空间内数据的 copy 操作 |
| hbmem_is_cacheable | 获取 hbmem_addr_t 对应 hbmem 空间的 cache 类型 |
| hbmem_cache_invalid | 对 hbmem 内存空间的 cache 进行 invalid 操作 |
| hbmem_cache_clean | 对 hbmem 内存空间的 cache 进行 clean 操作 |
| hbmem_phyaddr | 获取 hbmem 内存空间地址对应的实际 DDR 物理地址 |
| hbmem_virtaddr | 获取 hbmem 内存空间地址对应的实际虚拟地址 |
| hbmem_info | 获取传入 hbmem_addr_t 地址值的信息 |
| hbmem_get_share_id | 获取虚拟地址的 share_id |

### 内存分配属性说明（HB_MEM_USAGE_*）

| 数据项 | 描述 |
|---|---|
| HB_MEM_USAGE_CPU_READ_NEVER | CPU 不会读该内存，内存将不会被分配读属性 |
| HB_MEM_USAGE_CPU_READ_OFTEN | CPU 经常读该内存，内存将被分配读属性 |
| HB_MEM_USAGE_CPU_READ_MASK | 用于获取 read 相关属性的掩码，HB_MEM_USAGE_CPU_READ_OFTEN 属性优先级高于 HB_MEM_USAGE_CPU_READ_NEVER |
| HB_MEM_USAGE_CPU_WRITE_NEVER | CPU 不会写该内存，内存将不会被分配写属性 |
| HB_MEM_USAGE_CPU_WRITE_OFTEN | CPU 经常写该内存，内存将被分配写属性，该属性会自动添加读属性 |
| HB_MEM_USAGE_CPU_WRITE_MASK | 用于获取 write 相关属性的掩码，HB_MEM_USAGE_CPU_WRITE_OFTEN 属性优先级高于 HB_MEM_USAGE_CPU_WRITE_NEVER |
| HB_MEM_USAGE_HW_CIM | 表明该内存用于 camera interface module 相关模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_PYRAMID | 表明该内存用于 pyramid 相关模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_GDC | 表明该内存用于 geometric distortion correction 相关模块输入 buffer，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_GDC_OUT | 表明该内存用于 geometric distortion correction 相关模块输出 buffer，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_STITCH | 表明该内存用于 stitch 相关模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_OPTICAL_FLOW | 表明该内存用于 optical flow 相关模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_BPU | 表明该内存用于 BPU 模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_ISP | 表明该内存用于 ISP 模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_DISPLAY | 表明该内存用于 Display 相关模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_VIDEO_CODEC | 表明该内存用于 video codec 相关模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_JPEG_CODEC | 表明该内存用于 jpeg codec 相关模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_VDSP | 表明该内存用于 vdsp 相关模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_IPC | 表明该内存用于 ipc 相关模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_PCIE | 表明该内存用于 PCIe 相关模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_YNR | 表明该内存用于 YNR 相关模块，不影响内存分配，用于 debug 信息 |
| HB_MEM_USAGE_HW_MASK | 用于获取硬件相关属性的掩码，该掩码下的属性互斥，从上到下优先级依次降低，当指定多个属性或指定为非上述值时，默认指定成 "other" |
| HB_MEM_USAGE_MAP_INITIALIZED | 需要初始化该内存，内存分配后被初始化为 0，当未指定 MAP_INITIALIZED 和 MAP_UNINITIALIZED 时，DMA heap 会被默认初始化，RESERVED heap 不会被初始化，该属性和 HB_MEM_USAGE_MAP_UNINITIALIZED 互斥，且优先级较高 |
| HB_MEM_USAGE_MAP_UNINITIALIZED | 不需要初始化该内存，内存分配后不被初始化为 0，该属性和 HB_MEM_USAGE_MAP_INITIALIZED 互斥，且优先级较低 |
| HB_MEM_USAGE_CACHED | 表明该块 buffer 具有 cache 属性 |
| HB_MEM_USAGE_GRAPHIC_CONTIGUOUS_BUF | 指定 graph_buf 分配连续的物理内存 |
| HB_MEM_USAGE_MEM_POOL | 用于表明该 buffer 用于 memory pool，用户分配 buffer 时无需指定该参数，即使指定该参数，内部默认忽略 |
| HB_MEM_USAGE_MEM_SHARE_POOL | 用于表明该 buffer 用于 memory share pool，用户分配 buffer 时无需指定该参数，即使指定该参数，内部默认忽略 |
| HB_MEM_USAGE_STRICT_RW_PERMISSION | 导入 buffer 时只允许输入更低的读写权限 |
| HB_MEM_USAGE_SG | scatter list 内存分配（仅 sram heap）|
| HB_MEM_USAGE_ALLOC_ALIGN_0x10 ~ 0x100 | 分配对齐大小：16B/32B/64B/128B/256B（互斥，默认 16B 对齐）|
| HB_MEM_USAGE_ALIGN_MASK | 用于获取对齐属性的掩码 |
| HB_MEM_USAGE_PRIV_HEAP_DMA | 指定从 ion_cma（DMA heap）分配内存 |
| HB_MEM_USAGE_PRIV_HEAP_RESERVERD | 指定从 carveout heap 分配内存，原始定义（兼容客户已使用的枚举），不建议使用 |
| HB_MEM_USAGE_PRIV_HEAP_RESERVED | 指定从 carveout heap 分配内存，最新定义，建议使用 |
| HB_MEM_USAGE_PRIV_HEAP_2_RESERVERD | 指定从 cma_reserved（Carveout heap2）分配内存，原始定义（兼容客户已使用的枚举），不建议使用 |
| HB_MEM_USAGE_PRIV_HEAP_2_RESERVED | 指定从 cma_reserved（Carveout heap2）分配内存，最新定义，建议使用 |
| HB_MEM_USAGE_PRIV_HEAP_SRAM | 指定从 sram heap（custom）分配内存（S600）|
| HB_MEM_USAGE_PRIV_HEAP_SRAM_LIMIT | 指定从 sram limit heap 分配内存（S600）|
| HB_MEM_USAGE_PRIV_HEAP_INLINE_ECC | 指定从 inline ecc heap 分配内存（S600）|
| HB_MEM_USAGE_PRIV_MASK | 用于获取私有属性的掩码，该掩码下的属性互斥，从上到下优先级依次降低，当指定多个属性时，默认选用高优属性，当指定为非上述值时，默认从 DMA heap 分配 buffer |

### hbmem 图像格式

graph_buf 分配时 format 参数的可选值（`mem_pixel_format_t` 枚举）：

| 数据项 | 描述 |
|---|---|
| MEM_PIX_FMT_NONE | 无效格式 |
| MEM_PIX_FMT_RGB565 | packed RGB 5:6:5, 16bpp |
| MEM_PIX_FMT_RGB24 | packed RGB 8:8:8, 24bpp |
| MEM_PIX_FMT_BGR24 | packed RGB 8:8:8, 24bpp |
| MEM_PIX_FMT_ARGB | packed ARGB 8:8:8:8, 32bpp |
| MEM_PIX_FMT_RGBA | packed RGBA 8:8:8:8, 32bpp |
| MEM_PIX_FMT_ABGR | packed ABGR 8:8:8:8, 32bpp |
| MEM_PIX_FMT_BGRA | packed BGRA 8:8:8:8, 32bpp |
| MEM_PIX_FMT_YUV420P | planar YUV 4:2:0, 12bpp |
| MEM_PIX_FMT_NV12 | planar YUV 4:2:0, 12bpp（Y 与 UV 两 plane）|
| MEM_PIX_FMT_NV21 | 同 NV12，U/V 顺序互换 |
| MEM_PIX_FMT_YUV422P | planar YUV 4:2:2, 16bpp |
| MEM_PIX_FMT_NV16 | YUV 4:2:2，UV interleaved |
| MEM_PIX_FMT_NV61 | YUV 4:2:2，VU interleaved |
| MEM_PIX_FMT_NV24 | YUV 4:4:4，UV interleaved |
| MEM_PIX_FMT_NV42 | YUV 4:4:4，VU interleaved |
| MEM_PIX_FMT_YUYV422 | packed YUV 4:2:2, 16bpp, Y0 Cb Y1 Cr |
| MEM_PIX_FMT_YVYU422 | packed YUV 4:2:2, 16bpp, Y0 Cr Y1 Cb |
| MEM_PIX_FMT_UYVY422 | packed YUV 4:2:2, 16bpp, Cb Y0 Cr Y1 |
| MEM_PIX_FMT_VYUY422 | packed YUV 4:2:2, 16bpp, Cr Y0 Cb Y1 |
| MEM_PIX_FMT_YUV444 | packed YUV 4:4:4, 24bpp |
| MEM_PIX_FMT_YUV444P | planar YUV 4:4:4, 24bpp |
| MEM_PIX_FMT_YUV440P | planar YUV 4:4:0 |
| MEM_PIX_FMT_YUV400 | Gray Y, YUV 4:0:0 |
| MEM_PIX_FMT_RAW8 / RAW10 / RAW12 / RAW14 / RAW16 / RAW20 / RAW24 | RAW 格式，位深 8~24bit |
| MEM_PIX_FMT_YUV420P_10_8_8 | planar YUV 4:2:0, 10bit 8bit 8bit |
| MEM_PIX_FMT_YUV420P_12_8_8 | planar YUV 4:2:0, 12bit 8bit 8bit |

## 接口说明

以下接口说明提取自 S100 板端头文件 `hb_mem_mgr.h` 的接口注释，并翻译为中文（参数/返回值以头文件为准）。

### 基础接口

#### hb_mem_get_version

【函数声明】

```c
int32_t hb_mem_get_version(uint32_t *major, uint32_t *minor, uint32_t *patch_version);
```

【功能描述】

获取内存模块的版本号。

【参数描述】

- [OUT] major：主版本号
- [OUT] minor：次版本号
- [OUT] patch_version：补丁版本号

【返回值】

- 0：成功
- HB_MEM_ERR_INVALID_PARAMS：无效参数

#### hb_mem_module_open

【函数声明】

```c
int32_t hb_mem_module_open(void);
```

【功能描述】

打开内存模块。

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_OPEN_FAIL：内存模块打开失败
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足

#### hb_mem_module_close

【函数声明】

```c
int32_t hb_mem_module_close(void);
```

【功能描述】

关闭内存模块。

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开

### 内存分配接口

#### hb_mem_alloc_com_buf

【函数声明】

```c
int32_t hb_mem_alloc_com_buf(uint64_t size, int64_t flags, hb_mem_common_buf_t * buf);
```

【功能描述】
分配 common buffer

【参数描述】

- [IN] size：buffer 大小，取值范围 (0, )，默认 0
- [IN] flags：buffer 属性，见内存分配属性说明
- [OUT] buf：common buffer 结构体

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足
- HB_MEM_ERR_INVALID_FD：文件句柄异常
- HB_MEM_ERR_TOO_MANY_FD：文件句柄个数超过上限

#### hb_mem_get_com_buf

【函数声明】

```c
int32_t hb_mem_get_com_buf(int32_t fd, hb_mem_common_buf_t *buf);
```

【功能描述】
通过 fd 获取 common buffer 信息

【参数描述】

- [IN] fd：文件描述符 fd，取值 [0, )，默认 0
- [OUT] buf：common buffer 结构体

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常

#### hb_mem_alloc_graph_buf

【函数声明】

```c
int32_t hb_mem_alloc_graph_buf(int32_t w, int32_t h, int32_t format, int64_t flags, int32_t stride, int32_t vstride, hb_mem_graphic_buf_t * buf);
```

【功能描述】
分配 graphic buffer

【参数描述】

- [IN] w：图像宽度，取值范围 (0, )，默认 0
- [IN] h：图像高度，取值范围 (0, )，默认 0
- [IN] format：图像格式，见 hbmem 图像格式
- [IN] flags：buffer 属性，见内存分配属性说明
- [IN] stride：图像水平跨距，取值范围 (0, )，默认 0
- [IN] vstride：图像垂直跨距，取值范围 (0, )，默认 0
- [OUT] buf：graphic buffer 结构体

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足
- HB_MEM_ERR_INVALID_FD：文件句柄异常
- HB_MEM_ERR_TOO_MANY_FD：文件句柄个数超过上限

#### hb_mem_get_graph_buf

【函数声明】

```c
int32_t hb_mem_get_graph_buf(int32_t fd, hb_mem_graphic_buf_t *buf);
```

【功能描述】
通过 fd 获取 graphic buffer 信息

【参数描述】

- [IN] fd：文件描述符 fd，取值 [0, )，默认 0
- [OUT] buf：graphic buffer 结构体

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常

#### hb_mem_free_buf

【函数声明】

```c
int32_t hb_mem_free_buf(int32_t fd);
```

【功能描述】
通过 fd 释放 buffer

【参数描述】

- [IN] fd：文件描述符 fd，取值 [0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常

#### hb_mem_invalidate_buf

【函数声明】

```c
int32_t hb_mem_invalidate_buf(int32_t fd, uint64_t offset, uint64_t size);
```

【功能描述】
通过 fd 使 buffer 对应的 Cache 无效

【参数描述】

- [IN] fd：文件描述符 fd，取值 [0, )，默认 0
- [IN] offset：buffer 内的地址偏移，取值 [0, )，默认 0
- [IN] size：无效化大小，取值范围 (0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常

#### hb_mem_flush_buf

【函数声明】

```c
int32_t hb_mem_flush_buf(int32_t fd, uint64_t offset, uint64_t size);
```

【功能描述】
通过 fd 将 buffer 对应的 Cache 刷新回内存

【参数描述】

- [IN] fd：文件描述符 fd，取值 [0, )，默认 0
- [IN] offset：buffer 内的地址偏移，取值 [0, )，默认 0
- [IN] size：刷新大小，取值范围 (0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常

#### hb_mem_is_valid_buf

【函数声明】

```c
int32_t hb_mem_is_valid_buf(uint64_t virt_addr, uint64_t size, int32_t *valid);
```

【功能描述】
通过 fd 将 buffer 对应的 Cache 刷新回内存

【参数描述】

- [IN] virt_addr：虚拟地址，取值范围 (0, )，默认 0
- [IN] size：buffer 大小，取值范围 (0, )，默认 0
- [OUT] valid：虚拟地址是否有效：0 无效，1 有效

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数

#### hb_mem_get_phys_addr

【函数声明】

```c
int32_t hb_mem_get_phys_addr(uint64_t virt_addr, uint64_t * phys_addr);
```

【功能描述】
获取输入虚拟地址对应的物理地址信息

【参数描述】

- [IN] virt_addr：虚拟地址（可为偏移后虚拟地址），取值范围 (0, )，默认 0
- [OUT] phys_addr：对应的物理地址

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_TOO_MANY_FD：文件句柄个数超过上限

#### hb_mem_get_buf_info

【函数声明】

```c
int32_t hb_mem_get_buf_info(uint64_t virt_addr, uint64_t *start, uint64_t *size, int64_t *flags);
```

【功能描述】
获取输入虚拟地址对应的起始虚拟地址和 buffer 大小信息

【参数描述】

- [IN] virt_addr：虚拟地址（可为偏移后虚拟地址），取值范围 (0, )，默认 0
- [OUT] start：对应的起始虚拟地址
- [OUT] size：buffer 大小
- [OUT] flags：buffer 属性

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_free_buf_with_vaddr

【函数声明】

```c
int32_t hb_mem_free_buf_with_vaddr(uint64_t virt_addr);
```

【功能描述】
通过虚拟地址释放 buffer

【参数描述】

- [IN] virt_addr：虚拟地址（可为偏移后虚拟地址），取值范围 (0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_invalidate_buf_with_vaddr

【函数声明】

```c
int32_t hb_mem_invalidate_buf_with_vaddr(uint64_t virt_addr, uint64_t size);
```

【功能描述】
通过虚拟地址使 buffer 对应的 Cache 无效

【参数描述】

- [IN] virt_addr：虚拟地址（可为偏移后虚拟地址），取值范围 (0, )，默认 0
- [IN] size：无效化的 buffer 大小，取值范围 (0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_flush_buf_with_vaddr

【函数声明】

```c
int32_t hb_mem_flush_buf_with_vaddr(uint64_t virt_addr, uint64_t size);
```

【功能描述】
通过虚拟地址将 buffer 对应的 Cache 刷新回内存

【参数描述】

- [IN] virt_addr：虚拟地址（可为偏移后虚拟地址），取值范围 (0, )，默认 0
- [IN] size：刷新的 buffer 大小，取值范围 (0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_get_com_buf_with_vaddr

【函数声明】

```c
int32_t hb_mem_get_com_buf_with_vaddr(uint64_t virt_addr, hb_mem_common_buf_t *buf);
```

【功能描述】
通过虚拟地址获取 common buffer

【参数描述】

- [IN] virt_addr：虚拟地址（可为偏移后虚拟地址），取值范围 (0, )，默认 0
- [OUT] buf：common buffer 结构体

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_get_graph_buf_with_vaddr

【函数声明】

```c
int32_t hb_mem_get_graph_buf_with_vaddr(uint64_t virt_addr, hb_mem_graphic_buf_t *buf);
```

【功能描述】
通过虚拟地址获取 graphic buffer

【参数描述】

- [IN] virt_addr：虚拟地址（可为偏移后虚拟地址），取值范围 (0, )，默认 0
- [OUT] buf：graphic buffer 结构体

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_alloc_graph_buf_group

【函数声明】

```c
int32_t hb_mem_alloc_graph_buf_group(int32_t *w, int32_t *h, int32_t *format, int64_t *flags, int32_t *stride, int32_t *vstride, hb_mem_graphic_buf_group_t * buf_group, uint32_t bitmap);
```

【功能描述】
分配一组 graphic buffer

【参数描述】

- [IN] w：图像宽度数组
- [IN] h：图像高度数组
- [IN] format：图像格式数组，见 hbmem 图像格式
- [IN] flags：buffer 属性数组，见内存分配属性说明
- [IN] stride：图像水平跨距数组
- [IN] vstride：图像垂直跨距数组
- [OUT] buf_group：graphic buffer group 结构体
- [IN] bitmap：the bitmap for graphic buffer group

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足
- HB_MEM_ERR_INVALID_FD：文件句柄异常
- HB_MEM_ERR_TOO_MANY_FD：文件句柄个数超过上限

#### hb_mem_get_graph_buf_group

【函数声明】

```c
int32_t hb_mem_get_graph_buf_group(int32_t fd, hb_mem_graphic_buf_group_t *buf_group);
```

【功能描述】
通过 fd 获取 graphic buffer group 信息

【参数描述】

- [IN] fd：the file description
- [OUT] buf_group：graphic buffer group

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常

#### hb_mem_get_graph_buf_group_with_vaddr

【函数声明】

```c
int32_t hb_mem_get_graph_buf_group_with_vaddr(uint64_t virt_addr, hb_mem_graphic_buf_group_t *buf_group);
```

【功能描述】
通过虚拟地址获取 graphic buffer group 信息

【参数描述】

- [IN] virt_addr：graphic buffer group 中的虚拟地址
- [OUT] buf_group：graphic buffer group

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_scatter_alloc_com_buf_with_label

【函数声明】

```c
int32_t hb_mem_scatter_alloc_com_buf_with_label(uint64_t* sizes, int64_t* flags,
		uint32_t num, const char* label, bool shared, hb_mem_common_buf_t * buf);
```

【功能描述】
申请或者共享内存（支持携带 label）

#### hb_mem_dma_copy

【函数声明】

```c
int32_t hb_mem_dma_copy(uint64_t dst_vaddr, uint64_t src_vaddr, uint64_t size);
```

【功能描述】
使用系统的 DMA 完成两块 hbmem 内存空间内数据的拷贝

【参数描述】

- [IN] dst_vaddr：目标 hbmem 空间的起始地址，取值范围 (0, )，默认 0
- [IN] src_vaddr：源 hbmem 空间的起始地址，取值范围 (0, )，默认 0
- [IN] size：拷贝的内存空间大小，取值范围 (0, )，默认 0

【返回值】

- =0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

### 内存共享接口

#### hb_mem_import_com_buf

【函数声明】

```c
int32_t hb_mem_import_com_buf(hb_mem_common_buf_t * buf, hb_mem_common_buf_t * out_buf);
```

【功能描述】
导入 common buffer 的共享内存，获取新的 common buffer 信息。

【参数描述】

- [IN] buf：输入的 common buffer
- [OUT] out_buf：输出的 common buffer

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足
- HB_MEM_ERR_TOO_MANY_FD：文件句柄个数超过上限

#### hb_mem_import_com_buf_with_paddr

【函数声明】

```c
int32_t hb_mem_import_com_buf_with_paddr(uint64_t phys_addr, uint64_t size, int64_t flags, hb_mem_common_buf_t *buf);
```

【功能描述】
通过物理地址导入 common buffer 的共享内存，获取新的 common buffer 信息。注意：本接口仅用于非 hbmem 分配的内存；使用本接口访问共享内存时，请确保内存使用的生命周期。

【参数描述】

- [IN] phys_addr：物理地址
- [IN] size：buffer 大小
- [IN] flags：内存属性
- [OUT] buf：输出的 common buffer

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足
- HB_MEM_ERR_TOO_MANY_FD：文件句柄个数超过上限

#### hb_mem_import_graph_buf

【函数声明】

```c
int32_t hb_mem_import_graph_buf(hb_mem_graphic_buf_t * buf, hb_mem_graphic_buf_t * out_buf);
```

【功能描述】
导入 graphic buffer 的共享内存，获取新的 graphic buffer 信息。

【参数描述】

- [IN] buf：输入的 graphic buffer
- [OUT] out_buf：输出的 graphic buffer

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足
- HB_MEM_ERR_TOO_MANY_FD：文件句柄个数超过上限

#### hb_mem_import_graph_buf_group

【函数声明】

```c
int32_t hb_mem_import_graph_buf_group(hb_mem_graphic_buf_group_t *in_group, hb_mem_graphic_buf_group_t *out_group);
```

【功能描述】
导入一组 graphic buffer

【参数描述】

- [IN] in_group：输入的 graphic buffer group
- [OUT] out_group：导入输出的 graphic buffer group

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足
- HB_MEM_ERR_TOO_MANY_FD：文件句柄个数超过上限

#### hb_mem_get_share_info

【函数声明】

```c
int32_t hb_mem_get_share_info(int32_t fd, int32_t * share_client_cnt);
```

【功能描述】
通过 fd 获取对应 buffer 的共享客户端个数

【参数描述】

- [IN] fd：文件描述符 fd，取值 [0, )，默认 0
- [OUT] share_client_cnt：fd 对应 buffer 的共享客户端个数

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常

#### hb_mem_get_share_info_with_vaddr

【函数声明】

```c
int32_t hb_mem_get_share_info_with_vaddr(uint64_t virt_addr, int32_t * share_client_cnt);
```

【功能描述】
通过虚拟地址获取对应 buffer 的共享客户端个数

【参数描述】

- [IN] virt_addr：Virtual address, which can be the offset virtual address range: (0, )
- [OUT] share_client_cnt：fd 对应 buffer 的共享客户端个数

【返回值】

- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_wait_share_status

【函数声明】

```c
int32_t hb_mem_wait_share_status(int32_t fd, int32_t share_client_cnt, int64_t timeout);
```

【功能描述】
等待 fd 对应 buffer 的共享客户端个数小于等于目标值

【参数描述】

- [IN] fd：文件描述符 fd，取值 [0, )，默认 0
- [IN] share_client_cnt：The number of shared clients corresponding to the buffer of fd 取值 [0, )，默认 0
- [IN] timeout：超时时间（毫秒） 取值 [0, )，默认 0

【返回值】

- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常
- HB_MEM_ERR_TIMEOUT：等待超时

#### hb_mem_wait_share_status_with_vaddr

【函数声明】

```c
int32_t hb_mem_wait_share_status_with_vaddr(uint64_t virt_addr, int32_t share_client_cnt, int64_t timeout);
```

【功能描述】
等待虚拟地址对应 buffer 的共享客户端个数小于等于目标值

【参数描述】

- [IN] virt_addr：虚拟地址（可为偏移后虚拟地址），取值范围 [0, )，默认 0
- [IN] share_client_cnt：The number of shared clients corresponding to the buffer of fd 取值 [0, )，默认 0
- [IN] timeout：超时时间（毫秒） 取值 [0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常
- HB_MEM_ERR_TIMEOUT：等待超时

### 内存队列管理接口

#### hb_mem_create_buf_queue

【函数声明】

```c
int32_t hb_mem_create_buf_queue(hb_mem_buf_queue_t *queue);
```

【功能描述】
创建一个内存队列。

【参数描述】

- [IN] queue：内存队列结构体

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足

#### hb_mem_destroy_buf_queue

【函数声明】

```c
int32_t hb_mem_destroy_buf_queue(hb_mem_buf_queue_t *queue);
```

【功能描述】
销毁一个内存队列。

【参数描述】

- [IN] queue：内存队列

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_QUEUE_NOT_FOUND：找不到指定的内存队列
- HB_MEM_ERR_POOL_DESTROYED：内存池已销毁

#### hb_mem_dequeue_buf

【函数声明】

```c
int32_t hb_mem_dequeue_buf(hb_mem_buf_queue_t * queue, int32_t *slot, void * buf, int64_t timeout);
```

【功能描述】
生产者获取可用的 slot 信息

【参数描述】

- [IN] queue：内存队列
- [OUT] slot：内存队列元素索引
- [OUT] buf：元素信息
- [IN] timeout：超时时间（毫秒） 取值 [0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_QUEUE_NOT_FOUND：找不到指定的内存队列
- HB_MEM_ERR_QUEUE_DESTROYED：内存队列已销毁
- HB_MEM_ERR_QUEUE_NO_AVAILABLE_SLOT：没有可用的 slot
- HB_MEM_ERR_TIMEOUT：等待超时

#### hb_mem_queue_buf

【函数声明】

```c
int32_t hb_mem_queue_buf(hb_mem_buf_queue_t * queue, int32_t slot, const void * buf);
```

【功能描述】
生产者填充元素信息后将其入队到该 slot

【参数描述】

- [IN] queue：内存队列
- [IN] slot：内存队列元素索引，取值 [0, )，默认 0
- [IN] buf：元素信息

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_QUEUE_NOT_FOUND：找不到指定的内存队列
- HB_MEM_ERR_QUEUE_DESTROYED：内存队列已销毁
- HB_MEM_ERR_QUEUE_WRONG_SLOT：slot 错误

#### hb_mem_request_buf

【函数声明】

```c
int32_t hb_mem_request_buf(hb_mem_buf_queue_t * queue, int32_t *slot, void * buf, int64_t timeout);
```

【功能描述】
消费者从队列中获取生产者入队的元素信息

【参数描述】

- [IN] queue：内存队列
- [OUT] slot：内存队列元素索引
- [OUT] buf：元素信息
- [IN] timeout：超时时间（毫秒） 取值 [0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_QUEUE_NOT_FOUND：找不到指定的内存队列
- HB_MEM_ERR_QUEUE_DESTROYED：内存队列已销毁
- HB_MEM_ERR_QUEUE_NO_AVAILABLE_SLOT：没有可用的 slot
- HB_MEM_ERR_TIMEOUT：等待超时

#### hb_mem_release_buf

【函数声明】

```c
int32_t hb_mem_release_buf(hb_mem_buf_queue_t * queue, int32_t slot);
```

【功能描述】
消费者释放已使用完的元素索引。

【参数描述】

- [IN] queue：内存队列
- [IN] slot：内存队列元素索引，取值 [0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_QUEUE_NOT_FOUND：找不到指定的内存队列
- HB_MEM_ERR_QUEUE_DESTROYED：内存队列已销毁
- HB_MEM_ERR_QUEUE_WRONG_SLOT：slot 错误

#### hb_mem_cancel_buf

【函数声明】

```c
int32_t hb_mem_cancel_buf(hb_mem_buf_queue_t * queue, int32_t slot);
```

【功能描述】
生产者取消 dequeue 获得的 slot，或消费者取消 request 获得的 slot。

【参数描述】

- [IN] queue：内存队列
- [IN] slot：内存队列元素索引，取值 [0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_QUEUE_NOT_FOUND：找不到指定的内存队列
- HB_MEM_ERR_QUEUE_DESTROYED：内存队列已销毁
- HB_MEM_ERR_QUEUE_WRONG_SLOT：slot 错误

### 内存池接口

#### hb_mem_pool_create

【函数声明】

```c
int32_t hb_mem_pool_create(uint64_t size, int64_t flags, hb_mem_pool_t * pool);
```

【功能描述】
创建一个内存池。

【参数描述】

- [IN] size：内存池大小，取值范围 (0, )，默认 0
- [IN] flags：内存池 buffer 属性，见内存分配属性说明
- [OUT] pool：内存池

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足
- HB_MEM_ERR_INVALID_FD：文件句柄异常
- HB_MEM_ERR_TOO_MANY_FD：文件句柄个数超过上限

#### hb_mem_pool_destroy

【函数声明】

```c
int32_t hb_mem_pool_destroy(int32_t fd);
```

【功能描述】
销毁一个内存池。

【参数描述】

- [IN] fd：内存池的 fd，取值 [0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常
- HB_MEM_ERR_POOL_DESTROYED：内存池已销毁
- HB_MEM_ERR_POOL_BUSY：内存池无法销毁，池中仍有未释放的内存块

#### hb_mem_pool_alloc_buf

【函数声明】

```c
int32_t hb_mem_pool_alloc_buf(int32_t fd, uint64_t size, hb_mem_common_buf_t * buf);
```

【功能描述】
从内存池中分配一块内存 buffer。

【参数描述】

- [IN] fd：内存池的 fd，取值 [0, )，默认 0
- [IN] size：the buffer 大小 取值范围 (0, )，默认 0
- [OUT] buf：common buffer 结构体

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足
- HB_MEM_ERR_POOL_DESTROYED：内存池已销毁
- HB_MEM_ERR_POOL_NOT_FOUND：找不到内存池

#### hb_mem_pool_free_buf

【函数声明】

```c
int32_t hb_mem_pool_free_buf(uint64_t virt_addr);
```

【功能描述】
将内存 buffer 释放回内存池。

【参数描述】

- [IN] virt_addr：虚拟地址，取值范围 (0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常
- HB_MEM_ERR_POOL_DESTROYED：内存池已销毁
- HB_MEM_ERR_POOL_NOT_FOUND：找不到内存池

#### hb_mem_pool_get_info

【函数声明】

```c
int32_t hb_mem_pool_get_info(int32_t fd, hb_mem_pool_t * pool);
```

【功能描述】
获取内存池的实时信息

【参数描述】

- [IN] fd：内存池的 fd，取值 [0, )，默认 0
- [OUT] pool：内存池

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_POOL_DESTROYED：内存池已销毁
- HB_MEM_ERR_POOL_NOT_FOUND：找不到内存池

### 共享内存池接口

#### hb_mem_share_pool_create

【函数声明】

```c
int32_t hb_mem_share_pool_create(uint32_t num, uint64_t size, int64_t flags, hb_mem_share_pool_t * pool);
```

【功能描述】
创建一个共享内存池。

【参数描述】

- [IN] num：共享内存池的 buffer 数量，取值范围 (0, )，默认 0
- [IN] size：the buffer 大小. 取值范围 (0, )，默认 0
- [IN] flags：分配属性，见内存分配属性说明
- [OUT] pool：the share memory pool structure.@hb_mem_share_pool_t

【返回值】

- 0：成功
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数

#### hb_mem_share_pool_destroy

【函数声明】

```c
int32_t hb_mem_share_pool_destroy(int32_t fd);
```

【功能描述】
销毁一个共享内存池。

【参数描述】

- [IN] fd：共享内存池 buffer 的任意一个 fd，取值 [0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常
- HB_MEM_ERR_POOL_DESTROYED：内存池已销毁
- HB_MEM_ERR_POOL_BUSY：内存池无法销毁，池中仍有未释放的内存块

#### hb_mem_share_pool_alloc_buf

【函数声明】

```c
int32_t hb_mem_share_pool_alloc_buf(int32_t fd, hb_mem_common_buf_t * buf);
```

【功能描述】
从共享内存池中分配一块内存 buffer。

【参数描述】

- [IN] fd：内存池的 fd，取值 [0, )，默认 0
- [OUT] buf：common buffer @hb_mem_common_buf_t

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INSUFFICIENT_MEM：内存不足
- HB_MEM_ERR_POOL_DESTROYED：内存池已销毁
- HB_MEM_ERR_POOL_NOT_FOUND：找不到内存池

#### hb_mem_share_pool_free_buf

【函数声明】

```c
int32_t hb_mem_share_pool_free_buf(uint64_t virt_addr);
```

【功能描述】
通过虚拟地址释放从共享内存池分配的内存 buffer。

【参数描述】

- [IN] virt_addr：虚拟地址，取值范围 (0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常
- HB_MEM_ERR_POOL_NOT_FOUN：找不到共享内存池

#### hb_mem_share_pool_get_info

【函数声明】

```c
int32_t hb_mem_share_pool_get_info(int32_t fd, hb_mem_share_pool_t * pool);
```

【功能描述】
获取共享内存池的实时信息。

【参数描述】

- [IN] fd：the file discriptor. 取值 [0, )，默认 0
- [OUT] pool：the share memory pool structure.@hb_mem_share_pool_t

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_POOL_DESTROYED：内存池已销毁
- HB_MEM_ERR_POOL_NOT_FOUN：找不到内存池

### 通用信息获取或设置接口

#### hb_mem_get_buf_type_with_vaddr

【函数声明】

```c
int32_t hb_mem_get_buf_type_with_vaddr(uint64_t virt_addr, hb_mem_buffer_type_t *type);
```

【功能描述】
通过虚拟地址获取 buffer 类型

【参数描述】

- [IN] virt_addr：虚拟地址（可为偏移后虚拟地址），取值范围 (0, )，默认 0

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_get_buf_type_and_buf_with_vaddr

【函数声明】

```c
int32_t hb_mem_get_buf_type_and_buf_with_vaddr(uint64_t virt_addr, hb_mem_buffer_type_t *type, hb_mem_common_buf_t *com_buf, hb_mem_graphic_buf_t *graph_buf);
```

【功能描述】
通过虚拟地址获取 buffer 类型及 buffer 结构体，并可进行类型转换。type 不可为空。使用场景：case1：com_buf 与 graph_buf 均为 NULL，返回错误；case2：仅传入 graph_buf 且虚拟地址属于 common buffer，返回由 common buffer 转换来的 graphic buffer；case3：仅传入 com_buf 且虚拟地址属于 common buffer，仅返回 common buffer；case4：同时传入且虚拟地址属于 common buffer，返回 common buffer 及由其转换的 graphic buffer；case5：仅传入 graph_buf 且虚拟地址属于 graphic buffer，仅返回 graphic buffer；case6：仅传入 com_buf 且虚拟地址属于 graphic buffer，返回由 graphic buffer 转换的 common buffer（源 graphic buffer 物理地址不连续时返回错误）；case7：同时传入且虚拟地址属于 graphic buffer，返回 graphic buffer 及由其转换的 common buffer（源 graphic buffer 物理地址不连续时返回错误）

【参数描述】

- [IN] virt_addr：虚拟地址（可为偏移后虚拟地址），取值范围 (0, )，默认 0
- [OUT] type：the buffer type
- [OUT] com_buf：返回的 common buffer 结构体
- [OUT] graph_buf：返回的 graphic buffer 结构体

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_get_buf_and_type_with_vaddr

【函数声明】

```c
int32_t hb_mem_get_buf_and_type_with_vaddr(uint64_t virt_addr, hb_mem_buffer_type_t *type, hb_mem_common_buf_t *com_buf, hb_mem_graphic_buf_t *graph_buf, hb_mem_graphic_buf_group_t *graph_group);
```

【功能描述】
通过虚拟地址获取 buffer 类型及 buffer 结构体

【参数描述】

- [IN] virt_addr：虚拟地址
- [OUT] type：the buffer type
- [OUT] com_buf：common buffer 结构体
- [OUT] graph_buf：graphic buffer 结构体
- [OUT] graph_group：graphic buffer group 结构体

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_VADDR：无效虚拟地址
- HB_MEM_ERR_INVALID_PARAMS：无效参数

#### hb_mem_get_buffer_process_info

【函数声明】

```c
int32_t hb_mem_get_buffer_process_info(uint64_t virt_addr, int32_t *pid, int32_t num, int32_t *ret_num);
```

【功能描述】
获取持有该 buffer 的所有进程 pid

【参数描述】

- [IN] virt_addr：虚拟地址（对应 hb_mem_common_buf_t）
- [OUT] pid：持有该 buffer 的进程 pid
- [IN] num：目标进程数量上限
- [OUT] ret_num：持有该 buffer 的进程总数

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_get_buffer_process_info_with_share_id

【函数声明】

```c
int32_t hb_mem_get_buffer_process_info_with_share_id(int32_t share_id, int32_t *pid, int32_t num, int32_t *ret_num);
```

【功能描述】
通过 share id 获取持有该 buffer 的所有进程 pid

【参数描述】

- [IN] share_id：buffer 的 share id（对应 hb_mem_common_buf_t）
- [OUT] pid：持有该 buffer 的进程 pid
- [IN] num：目标进程数量上限
- [OUT] ret_num：持有该 buffer 的进程总数

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_get_buffer_process_cons_info_with_share_id

【函数声明】

```c
int32_t hb_mem_get_buffer_process_cons_info_with_share_id(int32_t share_id, int32_t *hb_pid, int32_t *cnt, int32_t num, int32_t *ret_num);
```

【功能描述】
获取该 buffer 持有 consume count 的所有进程 pid 及计数

【参数描述】

- [IN] share_id：buffer 的 share id
- [OUT] hb_pid：持有该 buffer consume count 的进程 pid
- [OUT] cnt：持有该 buffer 的进程 pid
- [IN] num：目标进程数量上限
- [OUT] ret_num：持有该 buffer 的进程总数

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数

#### hb_mem_get_consume_info

【函数声明】

```c
int32_t hb_mem_get_consume_info(int32_t fd, int32_t * share_consume_cnt);
```

【功能描述】
通过 fd 获取 buffer 的 consume count

【参数描述】

- [IN] fd：fd 描述符
- [IN] share_consume_cnt：buffer 的目标 consume count

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常

#### hb_mem_get_consume_info_with_vaddr

【函数声明】

```c
int32_t hb_mem_get_consume_info_with_vaddr(uint64_t virt_addr, int32_t * share_consume_cnt);
```

【功能描述】
通过虚拟地址获取对应 buffer 的 consume count

【参数描述】

- [IN] virt_addr：虚拟地址
- [OUT] share_consume_cnt：buffer 的 consume count

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_wait_consume_status

【函数声明】

```c
int32_t hb_mem_wait_consume_status(int32_t fd, int32_t share_consume_cnt, int64_t timeout);
```

【功能描述】
等待 fd 对应 buffer 的 consume count 达到目标值

【参数描述】

- [IN] fd：fd 描述符
- [IN] share_consume_cnt：buffer 的目标 consume count
- [IN] timeout：the wait time

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常

#### hb_mem_wait_consume_status_with_vaddr

【函数声明】

```c
int32_t hb_mem_wait_consume_status_with_vaddr(uint64_t virt_addr, int32_t share_consume_cnt, int64_t timeout);
```

【功能描述】
等待虚拟地址对应 buffer 的 consume count 达到目标值

【参数描述】

- [IN] virt_addr：buffer 虚拟地址
- [IN] share_consume_cnt：buffer 的目标 consume count
- [IN] timeout：the wait time

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_inc_com_buf_consume_cnt

【函数声明】

```c
int32_t hb_mem_inc_com_buf_consume_cnt(hb_mem_common_buf_t * buf);
```

【功能描述】
增加 common buffer 的 consume count

【参数描述】

- [IN] buf：common buffer 结构体

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数

#### hb_mem_inc_graph_buf_consume_cnt

【函数声明】

```c
int32_t hb_mem_inc_graph_buf_consume_cnt(hb_mem_graphic_buf_t * buf);
```

【功能描述】
增加 graphic buffer 的 consume count

【参数描述】

- [IN] buf：graphic buffer 结构体

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数

#### hb_mem_inc_graph_buf_group_consume_cnt

【函数声明】

```c
int32_t hb_mem_inc_graph_buf_group_consume_cnt(hb_mem_graphic_buf_group_t * buf_group);
```

【功能描述】
增加 graphic buffer group 中所有 buffer 的 consume count

【参数描述】

- [IN] buf_group：graphic buffer group

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数

#### hb_mem_dec_consume_cnt

【函数声明】

```c
int32_t hb_mem_dec_consume_cnt(int32_t fd);
```

【功能描述】
通过 fd 减少 buffer 的 consume count

【参数描述】

- [IN] fd：buffer 的 fd

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_FD：文件句柄异常

#### hb_mem_dec_consume_cnt_with_vaddr

【函数声明】

```c
int32_t hb_mem_dec_consume_cnt_with_vaddr(uint64_t virt_addr);
```

【功能描述】
通过虚拟地址减少 buffer 的 consume count

【参数描述】

- [IN] virt_addr：buffer 的虚拟地址

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_PARAMS：无效参数
- HB_MEM_ERR_INVALID_VADDR：虚拟地址异常

#### hb_mem_inc_user_consume_cnt

【函数声明】

```c
int32_t hb_mem_inc_user_consume_cnt(int32_t hb_fd);
```

【功能描述】
通过 fd 增加 buffer 的用户 consume 计数（不支持 graphic buffer group、内存池 buffer 和共享内存池 buffer）

【参数描述】

- [IN] hb_fd：the file description

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_FD：无效 fd
- HB_MEM_ERR_INVALID_PARAMS：无效参数

#### hb_mem_dec_user_consume_cnt

【函数声明】

```c
int32_t hb_mem_dec_user_consume_cnt(int32_t hb_fd);
```

【功能描述】
通过 fd 减少 buffer 的用户 consume 计数（不支持 graphic buffer group、内存池 buffer 和共享内存池 buffer）

【参数描述】

- [IN] hb_fd：the file description

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_FD：无效 fd
- HB_MEM_ERR_INVALID_PARAMS：无效参数

#### hb_mem_inc_user_consume_cnt_with_vaddr

【函数声明】

```c
int32_t hb_mem_inc_user_consume_cnt_with_vaddr(uint64_t virt_addr);
```

【功能描述】
通过 fd 增加 buffer 的用户 consume 计数（不支持 graphic buffer group、内存池 buffer 和共享内存池 buffer）

【参数描述】

- [IN] virt_addr：虚拟地址

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_VADDR：无效虚拟地址
- HB_MEM_ERR_INVALID_PARAMS：无效参数

#### hb_mem_dec_user_consume_cnt_with_vaddr

【函数声明】

```c
int32_t hb_mem_dec_user_consume_cnt_with_vaddr(uint64_t virt_addr);
```

【功能描述】
通过 fd 减少 buffer 的用户 consume 计数（不支持 graphic buffer group、内存池 buffer 和共享内存池 buffer）

【参数描述】

- [IN] virt_addr：虚拟地址

【返回值】

- 0：成功
- HB_MEM_ERR_MODULE_NOT_FOUND：内存模块未打开
- HB_MEM_ERR_INVALID_VADDR：无效虚拟地址
- HB_MEM_ERR_INVALID_PARAMS：无效参数

#### hb_mem_get_heap_size

【函数声明】

```c
int32_t hb_mem_get_heap_size(uint64_t flag, uint64_t *size);
```

【功能描述】
获取指定 heap 的 size 总大小

## 数据结构

### hb_mem_common_buf_t

```c
typedef struct hb_mem_common_buf_t {
    int32_t fd;          /* File descriptors of the buffer */
    int32_t share_id;    /* Share id of the buffer */
    int64_t flags;       /* Buffer flags for allocation */
    uint64_t size;       /* Total buffer size specified by user during allocation */
    uint8_t *virt_addr;  /* Buffer starting virtual address */
    uint64_t phys_addr;  /* Buffer starting physical address（不建议直接使用/传递物理地址） */
    uint64_t offset;     /* Buffer offset，用于进程间传输时附带透传偏移信息 */
} hb_mem_common_buf_t;
```

### hb_mem_graphic_buf_t

```c
typedef struct hb_mem_graphic_buf_t {
    int32_t fd[MAX_GRAPHIC_BUF_COMP];   /* File descriptors of the buffer for each component（MAX_GRAPHIC_BUF_COMP = 3）*/
    int32_t plane_cnt;                  /* Plane count of this graphic buffer，取值 [1, MAX_GRAPHIC_BUF_COMP] */
    int32_t format;                     /* Buffer format for allocation，见 hbmem 图像格式 */
    int32_t width;                      /* Buffer width */
    int32_t height;                     /* Buffer height */
    int32_t stride;                     /* Buffer horizontal stride */
    int32_t vstride;                    /* Buffer vertical stride */
    int32_t is_contig;                  /* Buffer physical memory is contiguous */
    int32_t share_id[MAX_GRAPHIC_BUF_COMP]; /* Share id of the buffer */
    int64_t flags;                      /* Buffer flags for allocation */
    uint64_t size[MAX_GRAPHIC_BUF_COMP];    /* Total buffer size for each component */
    uint8_t *virt_addr[MAX_GRAPHIC_BUF_COMP]; /* Buffer virtual address for each component */
    uint64_t phys_addr[MAX_GRAPHIC_BUF_COMP]; /* Buffer physical address for each component */
    uint64_t offset[MAX_GRAPHIC_BUF_COMP];    /* Buffer offset for each component */
} hb_mem_graphic_buf_t;
```

### hb_mem_graphic_buf_group_t

```c
typedef struct hb_mem_graphic_buf_group_t {
    hb_mem_graphic_buf_t graph_group[HB_MEM_MAXIMUM_GRAPH_BUF]; /* graphic buffer array */
    int32_t group_id;   /* graphic buffer group id which alloc from ION driver */
    uint32_t bit_map;   /* graphic buffer group bitmap */
} hb_mem_graphic_buf_group_t;
```

### hb_mem_buf_queue_t

```c
typedef struct hb_mem_buf_queue_t {
    uint64_t unique_id; /* Unique id specified by memory manager. Should not be modified */
    uint32_t count;     /* Total items of the buffer queue */
    uint32_t item_size; /* Size of each item */
} hb_mem_buf_queue_t;
```

### hb_mem_pool_t

```c
typedef struct hb_mem_pool_t {
    int64_t flags;          /* Buffer flags for allocation（默认 0）*/
    uint64_t size;          /* 创建时用户指定的 buffer 总大小 */
    int32_t fd;             /* 内存池的文件描述符 */
    int32_t page_size;      /* 页大小（字节）*/
    int32_t total_page_cnt; /* 总页数 */
    int32_t avail_page_cnt; /* 可用页数 */
    int32_t cur_client_cnt; /* 当前内存池客户端计数 */
    int32_t reserved;       /* 保留字段 */
} hb_mem_pool_t;
```

### hb_mem_share_pool_t

```c
typedef struct hb_mem_share_pool_t {
    int64_t flags;          /* Buffer flags for allocation（默认 0）*/
    uint32_t size;          /* 创建时用户指定的 buffer 大小（共享内存池内各 buffer 大小相同）*/
    int32_t fd;             /* 内存池的文件描述符 */
    int32_t total_buf_cnt;  /* buffer 总数 */
    int32_t avail_buf_cnt;  /* 可用 buffer 计数 */
    int32_t reserved;       /* 保留字段 */
} hb_mem_share_pool_t;
```

## hbmem 返回值

错误码定义见 `hb_mem_err.h`：

| 错误码 | 宏定义 | 描述 |
|---|---|---|
| 0xFF000001 | HB_MEM_ERR_UNKNOWN | 未知的错误 |
| 0xFF000002 | HB_MEM_ERR_INVALID_PARAMS | 无效参数 |
| 0xFF000003 | HB_MEM_ERR_INVALID_FD | 无效 fd |
| 0xFF000004 | HB_MEM_ERR_INVALID_VADDR | 无效虚拟地址 |
| 0xFF000005 | HB_MEM_ERR_INSUFFICIENT_MEM | 内存资源不足 |
| 0xFF000006 | HB_MEM_ERR_TOO_MANY_FD | 文件句柄打开超过上限 |
| 0xFF000007 | HB_MEM_ERR_TIMEOUT | 超时 |
| 0xFF000008 | HB_MEM_ERR_MODULE_NOT_FOUND | 内存模块未打开 |
| 0xFF000009 | HB_MEM_ERR_MODULE_OPEN_FAIL | 内存模块打开失败 |
| 0xFF00000A | HB_MEM_ERR_QUEUE_NOT_FOUND | 内存队列未创建 |
| 0xFF00000B | HB_MEM_ERR_QUEUE_DESTROYED | 内存队列已销毁 |
| 0xFF00000C | HB_MEM_ERR_QUEUE_WRONG_SLOT | 错误的内存队列索引 |
| 0xFF00000D | HB_MEM_ERR_QUEUE_NO_AVAILABLE_SLOT | 无法获得可用的内存队列索引 |
| 0xFF00000E | HB_MEM_ERR_QUEUE_ALREADY_EXIST | 内存队列已经创建 |
| 0xFF00000F | HB_MEM_ERR_POOL_NOT_FOUND | 内存池未打开 |
| 0xFF000010 | HB_MEM_ERR_POOL_DESTROYED | 内存池已销毁 |
| 0xFF000011 | HB_MEM_ERR_POOL_BUSY | 内存池中仍有 buffer 未释放 |
| 0xFF000012 | HB_MEM_ERR_WAIT_SHARE_FAILURE | 等待 share client 状态失败 |
| 0xFF000013 | HB_MEM_ERR_NOT_ALLOW | 该操作不允许 |
| 0xFF000014 | HB_MEM_ERR_CHECK_VER_FAIL | 版本检查失败 |
| 0xFF000015 | HB_MEM_ERR_REGISTER_FAIL | register graphic buffer group 失败 |
| 0xFF000016 | HB_MEM_ERR_INVALID_GROUPID | 无效的 group ID |

## 调试方法

ION 内存的调试手段（heap/client 两个视角的统计信息查看、ION 区域大小调整）统一见 [ION](02_ion.md)。

## FAQ

**问：进程打开的 fd 数量有上限吗？不够用了怎么办？**

答：有。buffer 的 fd 会占用进程 fd 配额，可通过 `ulimit -n <目标值>` 提高上限；若 fd 持续增长，应优先检查 import/free 等接口是否配对调用。

**问：`hb_mem_invalidate_buf` / `hb_mem_flush_buf` 是阻塞接口吗？会死锁或超时吗？**

答：是阻塞接口。函数内部会处理并发问题，不会死锁；也没有超时机制，直到操作完成才返回。

**问：hbmem 分配的 buffer 支持自动格式转换吗？**

答：不支持。硬件格式转换可使用 CIM、PYM 等硬件单元完成。

**问：`hb_mem_dma_copy` 对内存有什么要求？**

答：要求两块内存均为 hbmem 分配的 buffer（可直接使用虚拟地址）；非 hbmem 分配的内存调用时内部会退化为 memcpy，没有 DMA 加速。

**问：如何查看某个 buffer 的内存属性（cache、heap 等）？**

答：持有 com_buf/graph_buf 结构体时，直接查看其中的 `flags` 成员；只有虚拟地址时，可通过 `hb_mem_get_buf_info` 接口获取对应 flags。

**问：import 接口为什么需要 in_buf 和 out_buf 两个参数？**

答：导入时会对该 buffer 重新创建 dma_buf 并关联新的 fd；同时共享的内存并不一定占用整个 buffer 的大小；导入操作还会增加底层 buffer 的引用计数。

**问：如何确认拿到的 buffer 是有效的？**

答：同一进程内（含多线程）可通过 `hb_mem_get_com_buf` / `hb_mem_get_graph_buf` 获取 libhbmem 中保存的 buffer 信息，比对判断是否为本进程申请的 buffer；跨进程场景下，不同进程的 libhbmem 信息相互独立，无法通过接口确认。

**问：不确定虚拟地址对应的是 common buffer 还是 graphic buffer 怎么办？**

答：可通过 `hb_mem_get_buf_type_and_buf_with_vaddr` 获取类型和结构体后再导入；同一个 buffer 支持多次 import。

**问：进程 A 分配内存共享给 B 后销毁 A，内存会被泄漏吗？**

答：不会泄漏，属正常行为。B 进程 import 持有引用计数，A 销毁时不会释放这部分内存，会保留至 B 进程释放后才真正回收。

**问：graph_buf 的虚拟地址为什么是 `uint8_t *` 类型？**

答：为兼容 32/64 位系统的写法，使用时按实际格式做指针转换即可。

**问：内存队列里只能存 buffer 吗？**

答：不是。队列中存储的内容不强制是 buffer 信息，也可以是其他数据（用法类似消息队列）。

**问：Camera、PYM 等模块输出的都是 com_buf 吗？**

答：对。当前系统上各硬件模块输出的都是 com_buf，内存连续。

## 相关文档

- [ION 系统调试指南](02_ion.md)
- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
- [多媒体处理与应用 FAQ](../../../../08_FAQ/04_multimedia.md)
