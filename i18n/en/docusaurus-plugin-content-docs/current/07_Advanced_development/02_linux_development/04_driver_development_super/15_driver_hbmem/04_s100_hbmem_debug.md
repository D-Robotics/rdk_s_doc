# debug information

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

Hbmem supports querying relevant debug information through sys nodes.

## How to view current ION memory allocation status

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

## How to view current ION reserved memory status

<DocScope products="RDK S100">

The reservation status of ION_HEAP_TYPE_CARVEOUT (HB_MEM_USAGE_PRIV_HEAP_RESERVED), ION_HEAP_TYPE_CMA_RESERVED (HB_MEM_USAGE_PRIV_HEAP_2_RESERVED), and ION_HEAP_TYPE_DMA (HB_MEM_USAGE_PRIV_HEAP_DMA) heaps can also be viewed in the boot log, as shown below. The first line represents the starting address and size of ION_HEAP_TYPE_CARVEOUT, the second line represents the starting address and size of ION_HEAP_TYPE_CMA_RESERVED, and the third line represents the starting address and size of ION_HEAP_TYPE_DMA:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/hbmem/03_ion_region_kernel_print.png" alt="" style={{ width: '100%' }} />

</DocScope>
<DocScope products="RDK S600">

The reservation status of ION_HEAP_TYPE_CARVEOUT (HB_MEM_USAGE_PRIV_HEAP_RESERVED), ION_HEAP_TYPE_CMA_RESERVED (HB_MEM_USAGE_PRIV_HEAP_2_RESERVED), ION_HEAP_TYPE_DMA (HB_MEM_USAGE_PRIV_HEAP_DMA) heap, ION_HEAP_TYPE_CUSTOM (HB_MEM_USAGE_PRIV_HEAP_SRAM), and uncache heap can also be viewed in the boot log, as shown below. The first line represents the starting address and size of ION_HEAP_TYPE_CARVEOUT, the second line represents the starting address and size of ION_HEAP_TYPE_CMA_RESERVED, the third line represents the starting address and size of ION_HEAP_TYPE_CUSTOM, the fourth line represents the starting address and size of ION_HEAP_TYPE_DMA, and the fifth line represents the starting address and size of the uncache heap:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s600/hbmem/03_ion_region_kernel_print.png" alt="" style={{ width: '100%' }} />

</DocScope>

## How to directly read and write memory

### Use the devmem tool to directly access memory

```shell
root@ubuntu:~# devmem -h
BusyBox v1.30.1 (Ubuntu 1:1.30.1-7ubuntu3.1) multi-call binary.

Usage: devmem ADDRESS [WIDTH [VALUE]]

Read/write from physical address

        ADDRESS Address to act upon
        WIDTH   Width (8/16/...)
        VALUE   Data to be written
```

### Directly write to memory

```shell
root@ubuntu:~# devmem 0xE0000000 32 0x12345678
root@ubuntu:~#
```

### Read memory

```shell
root@ubuntu:~# devmem 0xE0000000
0x12345678
root@ubuntu:~#
```