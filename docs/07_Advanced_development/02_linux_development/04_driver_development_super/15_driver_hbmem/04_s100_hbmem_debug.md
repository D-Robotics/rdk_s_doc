# debug 信息

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

Hbmem 支持通过 sys 节点查询相关 debug 信息。

## 如何查看当前 ION 内存分配情况

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

## 如何查看当前的 ION 预留内存的情况

<DocScope products="RDK S100">

其中 ION_HEAP_TYPE_CARVEOUT（HB_MEM_USAGE_PRIV_HEAP_RESERVED）、ION_HEAP_TYPE_CMA_RESERVED（HB_MEM_USAGE_PRIV_HEAP_2_RESERVED）和 ION_HEAP_TYPE_DMA（HB_MEM_USAGE_PRIV_HEAP_DMA）heap 的预留情况也可以查看启动日志，如下所示，第一行代表 ION_HEAP_TYPE_CARVEOUT 的起始地址和大小，第二行代表 ION_HEAP_TYPE_CMA_RESERVED 的起始地址和大小，第三行代表 ION_HEAP_TYPE_DMA 的起始地址和大小：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/hbmem/03_ion_region_kernel_print.png" alt="如何查看当前的 ION 预留内存的情况截图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>
<DocScope products="RDK S600">

其中 ION_HEAP_TYPE_CARVEOUT（HB_MEM_USAGE_PRIV_HEAP_RESERVED）、ION_HEAP_TYPE_CMA_RESERVED（HB_MEM_USAGE_PRIV_HEAP_2_RESERVED）、 ION_HEAP_TYPE_DMA（HB_MEM_USAGE_PRIV_HEAP_DMA）heap、ION_HEAP_TYPE_CUSTOM（HB_MEM_USAGE_PRIV_HEAP_SRAM）和 uncache heap 的预留情况也可以查看启动日志， 如下所示，第一行代表 ION_HEAP_TYPE_CARVEOUT 的起始地址和大小，第二行代表 ION_HEAP_TYPE_CMA_RESERVED 的起始地址和大小，第三行代表 ION_HEAP_TYPE_CUSTOM 的起始地址和大小，第四行 ION_HEAP_TYPE_DMA 的起始地址和大小，第五行 uncache heap 的起始地址和大小：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s600/hbmem/03_ion_region_kernel_print.png" alt="如何查看当前的 ION 预留内存的情况截图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

## 如何直接读写内存

### 使用 devmem 工具可以直接访问内存

```shell
root@ubuntu:~# devmem -h
BusyBox v1.30.1 (Ubuntu 1:1.30.1-7ubuntu3.1) multi-call binary.

Usage: devmem ADDRESS [WIDTH [VALUE]]

Read/write from physical address

        ADDRESS Address to act upon
        WIDTH   Width (8/16/...)
        VALUE   Data to be written
```

### 直接写入内存

```shell
root@ubuntu:~# devmem 0xE0000000 32 0x12345678
root@ubuntu:~#
```

:::warning

上文示例中的 `0xE0000000` 仅用于演示 `devmem` 的命令格式，**并非开发板上真实可写的地址**。实际使用时必须将其替换为真实存在且当前可访问的物理地址，否则 `mmap` 映射失败，命令会直接报错：

```shell
root@ubuntu:~# devmem 0xE0000000 32 0x12345678
devmem: mmap: Operation not permitted
root@ubuntu:~#
```

写入前应先确认目标地址的有效性，例如参考上文介绍的 ION 预留内存信息、`/proc/iomem` 中的内存映射或芯片手册中的地址规划。地址正确但属于受保护区域时，同样会出现上述报错。

:::

### 读取内存

```shell
root@ubuntu:~# devmem 0xE0000000
0x12345678
root@ubuntu:~#
```
