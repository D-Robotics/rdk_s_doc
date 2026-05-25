# 硬件信息

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

Hbmem 所有的 heap 大小都可以在 dts 中对其进行修改配置，但是需要给系统保留足够的内存

<DocScope products="RDK S100">

## S100X 支持的内存大小和模式

目前 S100X 支持12G/24G 两种内存大小。如下所示为不同模式下的地址空间：

| model             | 地址空间                                      |
|-------------------|---------------------------------------------|
| 12G interleave    | 0x80000000~0xFFFFFFFF                       |
|                   | 0x400000000~0x4FFFFFFFF                     |
|                   | 0x800000000~0x8FFFFFFFF                     |
|                   | 0xC80000000~0xCFFFFFFFF                     |
| 24G interleave    | 0x80000000~0xFFFFFFFF                       |
|                   | 0x400000000~0x5FFFFFFFF                     |
|                   | 0x800000000~0x9FFFFFFFF                     |
|                   | 0xC80000000~0xDFFFFFFFF                     |

## S100X 默认的 ION 预留内存

对于用户来说，S100X 默认支持3种 heap 类型，carveout/cma/cma_reserved，其均采用预留内存的方式分配，分配速度较快；如下所示为不同内存模式下默认预留的 heap 大小：

| model             | ION_HEAP_TYPE_CMA_RESERVED(cma_reserved)     | ION_HEAP_TYPE_CARVEOUT(carveout)            | ION_HEAP_TYPE_DMA(cma)                     |
|-------------------|----------------------------------------------|---------------------------------------------|--------------------------------------------|
| 12G interleave    | 0x0000000400000000..0x000000043FFFFFFF(1GiB)  | 0x0000000440000000..0x000000045FFFFFFF(512MiB)  | 0x0000000460000000..0x000000047FFFFFFF(512MiB)  |
| 24G interleave    | 0x0000000400000000..0x000000043FFFFFFF(1GiB)  | 0x0000000440000000..0x000000045FFFFFFF(512MiB)  | 0x0000000460000000..0x000000047FFFFFFF(512MiB)  |

ION 的使用说明，请参考[heap介绍](./03_s100_hbmem_software.md#heap介绍)

### 12G interleave 模式下的 memory map

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/hbmem/02_12G_interleve_memory_layout.png" alt="" style={{ width: '100%' }} />

### 24G interleave 模式下的 memory map

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/hbmem/02_24G_interleve_memory_layout.png" alt="" style={{ width: '100%' }} />


</DocScope>
<DocScope products="RDK S600">

## S600X 支持的内存大小和模式

目前 S600仅支持32G 的内存。地址空间如下所示：

| model             | 地址空间                                      |
|-------------------|---------------------------------------------|
| 12G interleave    | 0x80000000~0xFFFFFFFF                       |
|                   | 0x400000000~0x4FFFFFFFF                     |
|                   | 0x800000000~0x8FFFFFFFF                     |
|                   | 0xC80000000~0xCFFFFFFFF                     |


## S600 默认的 ION 预留内存

对于用户来说，S600默认支持5种 heap 类型，carveout/cma/cma_reserved/uncache/sram，其均采用预留内存的方式分配，分配速度较快；如下所示为不同内存模式下默认预留的 heap 大小：

<div style={{ width: '100%', overflowX: 'auto' }}>

<table style={{ width: '100%', minWidth: '980px' }}>
  <thead>
    <tr>
      <th>model</th>
      <th>ION_HEAP_TYPE_CMA_RESERVED<br />(cma_reserved)</th>
      <th>ION_HEAP_TYPE_CARVEOUT<br />(carveout)</th>
      <th>ION_HEAP_TYPE_DMA<br />(cma)</th>
      <th>ION_HEAP_TYPE_CUSTOM<br />(sram)</th>
      <th>ION_HEAP_TYPE_UNCACHE<br />(ion_uncache)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>32G interleave</td>
      <td>0x00000041_40000000.. 0x00000041_BFFFFFFF(2G)</td>
      <td>0x00000040_C0000000.. 0x00000041_3FFFFFFF(2G)</td>
      <td>0x00000041_C0000000.. 0x00000041_FFFFFFFF(1G)</td>
      <td>0x00000000_04000000.. 0x00000000_057FFFFF(24M)</td>
      <td>0x00000042_00000000.. 0x00000042_7FFFFFFF(2G)</td>
    </tr>
  </tbody>
</table>

</div>

ION 的使用说明，请参考[heap介绍](./03_s100_hbmem_software.md#heap介绍)

### 32G interleave 模式下的 memory map

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s600/hbmem/02_32G_interleve_memory_layout.png" alt="" style={{ width: '100%' }} />


</DocScope>
