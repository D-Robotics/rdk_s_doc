---
title: "ION"
sidebar_position: 2
description: "RDK S100/S600 ION 内存子系统调试：ION 内存区域（heap）与 DDR 内存布局、分配规则、debugfs 查看 heap/client 统计信息、ION 区域大小调整"
---

# ION

## 概述

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

ION 系统是 Linux 内核中用于管理设备之间内存共享的内存管理子系统。hbmem 库即基于 ION 实现（见 [hbmem](01_hbmem.md)）。

RDK S100/S600 系统中 ION 内存主要被以下模块使用：

- 多媒体系统：包含 VIN、ISP、YNR、PYM、GDC、STITCH、VPU、JPU 等硬件加速单元
- BPU 子系统

### ION 内存区域

- ION 内存管理子系统使用独立的内存区域：在设备树中保留的区域，专门作为 ION 系统，详细调整方法见 [ION 区域大小调整](#ion-区域大小调整)
- Linux 系统中通用的内存分配器无法从 ION 内存区域分配内存，比如内核态的 kmalloc 和 vmalloc 以及用户态的 malloc 等
- ION 内存管理子系统为每个区域都起了不同的名字，软件中常用 heap（堆）的数据结构管理动态分配内存的区域，所以本文档和调试日志中每个 ION 区域也称作 heap 区域
- ION 是 Google 在 Android 中实现的开源的内存管理系统，详细介绍见 [The Android ION memory allocator](https://lwn.net/Articles/480055/)
<DocScope products="RDK S100">

- RDK S100/S100P 系统中主要使用 3 个 ION 区域：cma_reserved、carveout、ion_cma
  - cma_reserved 主要为多媒体系统提供内存
  - carveout 主要为 BPU 子系统提供内存
  - ion_cma 作为备用的区域，当上述两个区域没有空间时，ION 管理子系统会自动从 ion_cma 区域中申请内存

</DocScope>
<DocScope products="RDK S600">

- RDK S600 系统中主要使用 5 个 ION 区域：cma_reserved、carveout、ion_cma、ion_uncache、custom（sram）
  - cma_reserved 主要为多媒体系统提供内存
  - carveout 主要为 BPU 子系统提供内存
  - ion_cma 作为备用的区域，当上述两个区域没有空间时，ION 管理子系统会自动从 ion_cma 区域中申请内存
  - ion_uncache 用于 non-cacheable 内存
  - custom（sram）用于 sram 内存

</DocScope>

#### DDR 内存布局（memory map）

<DocScope products="RDK S100">

S100（12G interleave 模式）下的 memory map：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/hbmem/12g_interleave_mem_map.png" alt="S100 12G interleave 模式 memory map 示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

S100P（24G interleave 模式）下的 memory map：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/hbmem/24g_interleave_mem_map.png" alt="S100P 24G interleave 模式 memory map 示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>
<DocScope products="RDK S600">

S600（32G interleave 模式）下的 memory map：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/hbmem/32g_interleave_mem_map.png" alt="S600 32G interleave 模式 memory map 示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

#### ION 区域列表

<DocScope products="RDK S100">

S100/S100P（12G/24G interleave）使用 3 个 ION 区域（两种内存模式下预留大小相同）：

| ION 区域名 | dts 节点 | 默认预留大小 | 用途 |
|---|---|---|---|
| cma_reserved | ion_reserved | 1GiB | 主要为多媒体系统提供内存 |
| carveout | ion_carveout | 512MiB | 主要为 BPU 子系统提供内存 |
| ion_cma | ion_cma | 512MiB | 备用区域，上述区域没有空间时自动从中申请 |

</DocScope>
<DocScope products="RDK S600">

S600（32G interleave）使用 5 个 ION 区域：

| ION 区域名 | dts 节点 | 默认预留大小 | 用途 |
|---|---|---|---|
| cma_reserved | ion_reserved | 2G | 主要为多媒体系统提供内存 |
| carveout | ion_carveout | 2G | 主要为 BPU 子系统提供内存 |
| ion_cma | ion_cma | 1G | 备用区域，上述区域没有空间时自动从中申请 |
| ion_uncache | ion_uncache | 2G | non-cacheable 内存 |
| custom | ion_sram | 24M | sram 内存 |

</DocScope>

#### 指定具体 ION 区域的方法

多媒体系统和 BPU 的软件框架内部指定了首选 ION 区域：

| 模块 | 首选 ION 区域 |
|---|---|
| 多媒体系统 | cma_reserved 区域 |
| BPU 系统 | carveout 区域 |

注意：以上是系统和应用侧的分配原则，**并非硬隔离**，libhbmem 也不会根据 `HB_MEM_USAGE_HW_*` 用途 flag 自动选择 heap。

开发者通过 hbmem 接口分配 ION 内存时，通过 flag 参数（`HB_MEM_USAGE_PRIV_HEAP_*`）可以指定首选 ION 区域，详见 [hbmem](01_hbmem.md)。

#### ION 区域分配规则

ION 管理子系统分配内存时，需要 **指定具体的 ION 区域**，因此可能会出现：ION 整体有空闲内存，但是由于指定的区域已经被分配完导致无法分配的情况。

解决办法：ION 管理子系统支持在指定的区域无法分配内存时自动从其他区域分配内存，分配逻辑如下：

<DocScope products="RDK S100">

- 当指定 cma_reserved 区域并且这个区域没有内存时：优先选择 carveout 区域，其次是 ion_cma 区域
- 当指定 carveout 区域并且这个区域没有内存时：优先选择 cma_reserved 区域，其次是 ion_cma 区域
- 当指定 ion_cma 区域并且这个区域没有内存时：选择 cma_reserved 区域

</DocScope>
<DocScope products="RDK S600">

S600 会先判断内存的 cache 属性：如果申请 non-cacheable 内存，则从 uncache heap 上尝试分配，分配失败直接返回；申请 cacheable 内存时按如下逻辑分配：

（板端实测：开机驱动初始化的分配（bpu0/ispstat/vpu/stitch）多为 non-cacheable 请求，落在 ion_uncache 上，carveout 可能为空）

- 当指定 cma_reserved 区域并且这个区域没有内存时：优先选择 carveout 区域，其次是 ion_cma 区域
- 当指定 carveout 区域并且这个区域没有内存时：优先选择 cma_reserved 区域，其次是 ion_cma 区域
- 当指定 ion_cma 区域并且这个区域没有内存时：选择 cma_reserved 区域
- 如果不带预期 heap，则默认从 ion_cma 区域上分配内存

</DocScope>

注意：ion_cma 区域存在的目的作为其他区域的备选；兜底分配不是把两个区域拼接起来，而是去另一个区域的空间分配，仍受到目标区域总大小的限制。

### ION 内存的特点

| 功能 | 描述 |
|---|---|
| 内存管理 | ION 提供了一套通用的内存管理机制，支持用户态和内核态从 ION 区域申请和释放内存 |
| 连续物理内存分配 | ION 内存管理系统分配的内存是物理地址连续的，可以提供给硬件加速单元（例如 ISP、VPU 等视频硬件单元）直接使用 |
| 设备间内存共享 | ION 允许不同的设备（例如 ISP、VPU 等视频硬件单元）之间共享内存，通过内核实现设备间的通信与数据交换 |
| 进程间内存共享 | 支持多个进程之间共享同一块 ION 内存区域，无需内存拷贝 |
| 零拷贝 | 多个进程可以直接访问共享的内存区域，无需显式的内存拷贝，从而提高内存使用效率和系统整体性能 |

## ION 使用方法

### ION 区域大小调整

ION 区域是在设备树中预留的一段物理地址空间。调整方法：修改对应 SoC 的 dts 文件中 `reserved-memory` 下的 `ion_*` 节点的 `reg`（起始地址和大小），重新编译内核并制作镜像烧写。

<DocScope products="RDK S100">

S100 修改内核 dts 文件 `arch/arm64/boot/dts/hobot/drobot-s100-soc.dtsi`：

```dts
reserved-memory {
    ion_reserved: ion_reserved@C80000000 {
        compatible = "ion-pool";
        reg = <0x4 0x00000000 0x0 0x40000000>;   /* cma_reserved, 1GiB */
        status = "okay";
    };

    ion_carveout: ion_carveout@800000000 {
        compatible = "ion-carveout";
        reg = <0x8 0x00000000 0x0 0x20000000>;   /* carveout, 512MiB */
        status = "okay";
    };

    ion_cma: ion_cma@400000000 {
        compatible = "ion-cma";
        reg = <0xC 0x80000000 0x0 0x20000000>;   /* ion_cma, 512MiB */
        status = "okay";
    };
};
```

</DocScope>
<DocScope products="RDK S600">

S600 修改内核 dts 文件 `arch/arm64/boot/dts/hobot/drobot-s600-soc.dtsi`：

```dts
reserved-memory {
    ion_reserved: ion_reserved@40C000000 {
        compatible = "ion-pool";
        reg = <0x40 0xC0000000 0x0 0x80000000>;  /* cma_reserved, 2G */
        status = "okay";
    };

    ion_carveout: ion_carveout@4140000000 {
        compatible = "ion-carveout";
        reg = <0x41 0x40000000 0x0 0x80000000>;  /* carveout, 2G */
        status = "okay";
    };

    ion_cma: ion_cma@41C0000000 {
        compatible = "ion-cma";
        reg = <0x41 0xC0000000 0x0 0x40000000>;  /* ion_cma, 1G */
        status = "okay";
    };

    ion_uncache: ion_uncache@400000000 {
        compatible = "ion-uncache";
        reg = <0x42 0x00000000 0x0 0x80000000>;  /* ion_uncache, 2GiB */
        status = "okay";
    };

    ion_sram: ion_sram@4000000 {
        compatible = "ion-sram";
        reg = <0x0 0x04000000 0x0 0x01800000>;   /* sram, 24MiB */
        status = "okay";
        no-map;
    };
};
```

</DocScope>

:::info 注意

- 修改 ION 区域大小时需要给系统保留足够的内存，且各预留区域的地址不能重叠
- 调整后可通过「查看各个 ION 区域的统计信息」中的方法验证 `heap total size` 是否生效

:::

### ION 调试手段

RDK S100/S600 提供了从两个角度查看 ION 调试信息的方法：

- **ION 区域（heap）的角度**（内存提供者）：描述每个 ION 区域的信息，比如总共多少、使用了多少，以及每一次具体分配的内存块的信息
- **client 的角度**（内存使用者）：client 表示使用者的身份标识，比如进程 ID、内核模块名等，展示 client 整体占用的大小和每一次具体分配的内存块的信息

#### 查看各个 ION 区域（heap）的统计信息

<DocScope products="RDK S100">

```shell
cat /sys/kernel/debug/ion/heaps/ion_cma
cat /sys/kernel/debug/ion/heaps/cma_reserved
cat /sys/kernel/debug/ion/heaps/carveout
cat /sys/kernel/debug/ion/heaps/all_heap_info
```

</DocScope>
<DocScope products="RDK S600">

```shell
cat /sys/kernel/debug/ion/heaps/ion_cma
cat /sys/kernel/debug/ion/heaps/cma_reserved
cat /sys/kernel/debug/ion/heaps/carveout
cat /sys/kernel/debug/ion/heaps/ion_uncache
cat /sys/kernel/debug/ion/heaps/custom
cat /sys/kernel/debug/ion/heaps/all_heap_info
```

</DocScope>

以 `/sys/kernel/debug/ion/heaps/cma_reserved` 为例（板端实际输出，节选；数值随运行状态变化）：

<DocScope products="RDK S100">

S100 板端输出：

```shell
root@drobot:~# cat /sys/kernel/debug/ion/heaps/cma_reserved
-------------------------------------------------------------------------
the heap id is 6
-------------------------------------------------------------------------
    cma_reserved  heap total size       1073741824
-------------------------------------------------------------------------
       heap name           client              pid             size
-------------------------------------------------------------------------
    cma_reserved         modprobe              538         50069504
    cma_reserved         modprobe              531          3145728
-------------------------------------------------------------------------
allocations (info is from last known client):
------------------------------------------------------------------------------------------------------------------------------------------
          client              pid             tgid             type             size         kmap_cnt            label          shareid            paddr
------------------------------------------------------------------------------------------------------------------------------------------
        modprobe              708              538          ispstat         17694720                1          no-label                7        400e00000
        modprobe              717              538           stitch            65536                1          no-label                4        400300000
        modprobe              531              531              vpu          3145728                1          no-label                2        400000000
 gnome-initial-s             4805             4805            other          4128768                0         no-label               10        4032c0000 orphaned
------------------------------------------------------------------------------------------------------------------------------------------
  total orphaned          4128768
          total          57344000
-------------------------------------------------------------------------
```

</DocScope>
<DocScope products="RDK S600">

S600 板端输出：

```shell
root@drobot:~# cat /sys/kernel/debug/ion/heaps/cma_reserved
-------------------------------------------------------------------------
the heap id is 6
-------------------------------------------------------------------------
    cma_reserved  heap total size       2147483648
-------------------------------------------------------------------------
       heap name           client              pid             size
-------------------------------------------------------------------------
    cma_reserved         modprobe              674          8323072
-------------------------------------------------------------------------
allocations (info is from last known client):
------------------------------------------------------------------------------------------------------------------------------------------
          client              pid             tgid             type             size         kmap_cnt            label          shareid            paddr
------------------------------------------------------------------------------------------------------------------------------------------
 gnome-initial-s             5069             5069            other          4128768                0         no-label               19       40c07f0000 orphaned
        modprobe              757              674           stitch          8323072                1          no-label                7       40c0000000
------------------------------------------------------------------------------------------------------------------------------------------
  total orphaned          4128768
          total          12451840
-------------------------------------------------------------------------
```

</DocScope>

- 第一部分 `heap id`：ION 子系统内部对各类型 ION 区域的编号（见 BSP 源码 `hobot-drivers/ion/uapi/ion.h` 的 `enum ion_heap_type`；板端实测：2=carveout、3=chunk、4=ion_cma、5=custom、6=cma_reserved、10=ion_uncache）
- 第二部分 `heap total size`：当前 ION 区域在系统内预留的总大小（单位 byte，10 进制）
- 第三部分：各 client（进程/模块）占用的汇总。`client` 列为 `modprobe` 时，说明这部分内存是开机自动加载驱动 ko 时、驱动初始化通过 ION 申请的
- 第四部分 `allocations`：每一次具体分配的明细，各列含义：
  - `client`：进程应用名
  - `pid` / `tgid`：发起分配的线程 ID / 线程组 ID（即进程 ID），每次启动可能不同，仅供参考
  - `type`：模块标识符，来源是分配时传递的 flag（`HB_MEM_USAGE_HW_*`），对应关系见下表
  - `size`：分配的大小（单位 byte，10 进制）
  - `kmap_cnt`：buffer 的内核映射（kmap）计数
  - `label`：分配时携带的 label 字符串（仅带 label 参数的分配接口会设置，如 `hb_mem_scatter_alloc_com_buf_with_label`；普通分配未设置时显示 `no-label`）
  - `shareid`：buffer 的 share id（对应 `hb_mem_common_buf_t` 的 `share_id` 成员）
  - `paddr`：分配到的物理地址（16 进制）
  - 行尾 `orphaned` 标记：该 buffer 已无任何句柄引用（典型场景：申请进程已退出但内存未释放），计入 `total orphaned`
- 第五部分：总结
  - `total orphaned`：没有 client 使用、但未被释放的内存大小
  - `total`：当前 heap 总共被分配出去的内存大小（单位 byte，10 进制）

常见模块标识符与 flag 的对应关系（部分模块有多种标识，如 ISP 的 `ispstat`/`isp_yuv`，以板端实际输出为准）：

| 模块标识符 | 对应模块 | 分配时指定的 flag |
|---|---|---|
| ispstat / isp_yuv | ISP | HB_MEM_USAGE_HW_ISP |
| stitch | STITCH 拼接 | HB_MEM_USAGE_HW_STITCH |
| vpu | VPU 视频编解码 | HB_MEM_USAGE_HW_VIDEO_CODEC |
| jpu | JPU 图像编解码 | HB_MEM_USAGE_HW_JPEG_CODEC |
| bpu0 | BPU | HB_MEM_USAGE_HW_BPU |
| cimdma | VIN | HB_MEM_USAGE_HW_CIM |
| gdc | GDC 输出 | HB_MEM_USAGE_HW_GDC_OUT |
| gdcfb | GDC BIN 文件 | HB_MEM_USAGE_HW_GDC |
| other | 未指定模块 flag 的分配 | - |

#### 查看从 ION 申请了内存的 client 的统计信息

`/sys/kernel/debug/ion/clients/` 目录可以查看当前系统申请了 ION 内存的 client，client 的个数和名字根据运行程序对不同模块的使用情况而变化：

<DocScope products="RDK S100">

S100 板端输出（节选）：

```shell
root@drobot:~# ls /sys/kernel/debug/ion/clients/
4013-0  bpu-0            ide_display-12  ide_display-4   jpu0-0         vdsp0-0
4798-0  ide_display-0    ide_display-13  ide_display-5   vpu0-0         vio_driver_ion-0
        ide_display-1    ...             ide_display-6
        ide_display-10                   ide_display-7
        ide_display-11                   ide_display-8
                                       ide_display-9
```

</DocScope>
<DocScope products="RDK S600">

S600 板端输出（节选）：

```shell
root@drobot:~# ls /sys/kernel/debug/ion/clients/
4271-0  bpu-0            ide_display-14  ide_display-2   jpu0-0  jpu2-0  vdsp0-0  vpu0-0
5069-0  ide_display-0    ...             ide_display-3   jpu1-0  vdsp1-0  vpu1-0  vpu2-0
        ide_display-1                    ide_display-4
        ...                              ...
```

</DocScope>

常见 client 的含义：

| client | 说明 |
|---|---|
| `进程名-序号`（如 4013-0、4798-0）| 用户进程（进程 ID-序号）|
| bpu-0 | BPU 子系统 |
| vio_driver_ion-0 | VIO（多媒体采集处理链路）|
| vpu0-0（S600 上有 vpu0~vpu2 多实例）| VPU 视频编解码 |
| jpu0-0（S600 上有 jpu0~jpu2 多实例）| JPU 图像编解码 |
| vdsp0-0（S600 上有 vdsp0/vdsp1 双实例）| vDSP |
| ide_display-N | 显示驱动（按显示通路生成多个 client，用于送显 buffer 的导入管理；其内存分配计入原分配者的统计，故 heap 统计中不会出现 display 条目）|

每个 client 的具体占用使用 `cat /sys/kernel/debug/ion/clients/<client name>` 查看：

<DocScope products="RDK S100">

S100 板端输出：

```shell
root@drobot:~# cat /sys/kernel/debug/ion/clients/vpu0-0
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
    cma_reserved:           300000 :                1 :                1 : ffff000402e29600 :                2:                3 :                1

--------------------------------------------------------------------------
          total            300000
--------------------------------------------------------------------------
```

</DocScope>
<DocScope products="RDK S600">

S600 板端输出：

```shell
root@drobot:~# cat /sys/kernel/debug/ion/clients/vpu0-0
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:           300000 :                1 :                1 : ffff004286a63300 :                2:                2 :                1

--------------------------------------------------------------------------
          total            300000
--------------------------------------------------------------------------
```

</DocScope>

各列含义：

- `heap_name`：该 buffer 所属的 ION 区域
- `size_in_bytes`：该 buffer 的大小（**16 进制**，如 `300000` 即 0x300000 = 3MiB = 3145728 字节）
- `handle refcount`：该 buffer 在本 client 内的句柄引用计数
- `handle import`：该 buffer 是否为 import（导入）所得
- `buffer ptr`：buffer 内核对象的地址（16 进制，**不是物理地址**；物理地址可在 heap 统计的 `paddr` 列查看）
- `buffer refcount`：buffer 的全局引用计数（被多少使用者持有）
- `buffer share id`：buffer 的 share id（对应 hbmem `hb_mem_common_buf_t` 的 `share_id` 成员）
- `buffer share count`：buffer 的共享计数
- `total`：当前 client 占用的 ION 内存总大小（**16 进制**）

## 相关文档

- [hbmem 使用指南](01_hbmem.md)
- [基础框架 - HBN](../01_hbn_api.md)
- [图形处理 - GPU](../14_gpu_api.md)
