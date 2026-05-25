# Hardware Information

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

All Hbmem heap sizes can be modified and configured in the dts, but sufficient memory must be reserved for the system.

<DocScope products="RDK S100">

## Supported Memory Sizes and Modes for S100X

Currently, the S100X supports two memory sizes: 12G and 24G. The address spaces for different modes are shown below:

| model             | Address Space                                      |
|-------------------|----------------------------------------------------|
| 12G interleave    | 0x80000000~0xFFFFFFFF                       |
|                   | 0x400000000~0x4FFFFFFFF                     |
|                   | 0x800000000~0x8FFFFFFFF                     |
|                   | 0xC80000000~0xCFFFFFFFF                     |
| 24G interleave    | 0x80000000~0xFFFFFFFF                       |
|                   | 0x400000000~0x5FFFFFFFF                     |
|                   | 0x800000000~0x9FFFFFFFF                     |
|                   | 0xC80000000~0xDFFFFFFFF                     |

## Default ION Reserved Memory for S100X

For users, the S100X supports three heap types by default: carveout/cma/cma_reserved, all of which use reserved memory allocation for faster allocation. The default reserved heap sizes for different memory modes are shown below:

| model             | ION_HEAP_TYPE_CMA_RESERVED(cma_reserved)     | ION_HEAP_TYPE_CARVEOUT(carveout)            | ION_HEAP_TYPE_DMA(cma)                     |
|-------------------|----------------------------------------------|---------------------------------------------|--------------------------------------------|
| 12G interleave    | 0x0000000400000000..0x000000043FFFFFFF(1GiB)  | 0x0000000440000000..0x000000045FFFFFFF(512MiB)  | 0x0000000460000000..0x000000047FFFFFFF(512MiB)  |
| 24G interleave    | 0x0000000400000000..0x000000043FFFFFFF(1GiB)  | 0x0000000440000000..0x000000045FFFFFFF(512MiB)  | 0x0000000460000000..0x000000047FFFFFFF(512MiB)  |

For instructions on using ION, please refer to [Heap Introduction](./03_s100_hbmem_software.md#heap-introduction)

### Memory Map in 12G Interleave Mode

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/hbmem/02_12G_interleve_memory_layout-en.jpg" alt="" style={{ width: '100%' }} />

### Memory Map in 24G Interleave Mode

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/hbmem/02_24G_interleve_memory_layout-en.jpg" alt="" style={{ width: '100%' }} />

</DocScope>
<DocScope products="RDK S600">

## Supported Memory Sizes and Modes for S600X

Currently, the S600 only supports 32G of memory. The address space is shown below:

| model             | Address Space                                      |
|-------------------|----------------------------------------------------|
| 12G interleave    | 0x80000000~0xFFFFFFFF                       |
|                   | 0x400000000~0x4FFFFFFFF                     |
|                   | 0x800000000~0x8FFFFFFFF                     |
|                   | 0xC80000000~0xCFFFFFFFF                     |

## Default ION Reserved Memory for S600

For users, the S600 supports five heap types by default: carveout/cma/cma_reserved/uncache/sram, all of which use reserved memory allocation for faster allocation. The default reserved heap sizes for different memory modes are shown below:

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

For instructions on using ION, please refer to [Heap Introduction](./03_s100_hbmem_software.md#heap-introduction)

### Memory Map in 32G Interleave Mode

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s600/hbmem/02_32G_interleve_memory_layout.png" alt="" style={{ width: '100%' }} />

</DocScope>