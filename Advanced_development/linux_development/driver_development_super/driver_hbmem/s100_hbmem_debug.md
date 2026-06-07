# debug 信息

URL: https://developer.d-robotics.cc/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_hbmem/s100_hbmem_debug

Hbmem 支持通过 sys 节点查询相关 debug 信息。

## 如何查看当前 ION 内存分配情况

```shell
cat /sys/kernel/debug/ion/heaps/ion_cma
cat /sys/kernel/debug/ion/heaps/cma_reserved
cat /sys/kernel/debug/ion/heaps/carveout
cat /sys/kernel/debug/ion/heaps/all_heap_info
```

```shell
cat /sys/kernel/debug/ion/heaps/ion_cma
cat /sys/kernel/debug/ion/heaps/cma_reserved
cat /sys/kernel/debug/ion/heaps/carveout
cat /sys/kernel/debug/ion/heaps/ion_uncache
cat /sys/kernel/debug/ion/heaps/custom
cat /sys/kernel/debug/ion/heaps/all_heap_info
```

## 如何查看当前的 ION 预留内存的情况

其中 ION_HEAP_TYPE_CARVEOUT（HB_MEM_USAGE_PRIV_HEAP_RESERVED）、ION_HEAP_TYPE_CMA_RESERVED（HB_MEM_USAGE_PRIV_HEAP_2_RESERVED）和 ION_HEAP_TYPE_DMA（HB_MEM_USAGE_PRIV_HEAP_DMA）heap 的预留情况也可以查看启动日志，如下所示，第一行代表 ION_HEAP_TYPE_CARVEOUT 的起始地址和大小，第二行代表 ION_HEAP_TYPE_CMA_RESERVED 的起始地址和大小，第三行代表 ION_HEAP_TYPE_DMA 的起始地址和大小：

![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/hbmem/03_ion_region_kernel_print.png)
其中 ION_HEAP_TYPE_CARVEOUT（HB_MEM_USAGE_PRIV_HEAP_RESERVED）、ION_HEAP_TYPE_CMA_RESERVED（HB_MEM_USAGE_PRIV_HEAP_2_RESERVED）、 ION_HEAP_TYPE_DMA（HB_MEM_USAGE_PRIV_HEAP_DMA）heap、ION_HEAP_TYPE_CUSTOM（HB_MEM_USAGE_PRIV_HEAP_SRAM）和 uncache heap 的预留情况也可以查看启动日志， 如下所示，第一行代表 ION_HEAP_TYPE_CARVEOUT 的起始地址和大小，第二行代表 ION_HEAP_TYPE_CMA_RESERVED 的起始地址和大小，第三行代表 ION_HEAP_TYPE_CUSTOM 的起始地址和大小，第四行 ION_HEAP_TYPE_DMA 的起始地址和大小，第五行 uncache heap 的起始地址和大小：

![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s600/hbmem/03_ion_region_kernel_print.png)

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

### 读取内存

```shell
root@ubuntu:~# devmem 0xE0000000
0x12345678
root@ubuntu:~#
```
