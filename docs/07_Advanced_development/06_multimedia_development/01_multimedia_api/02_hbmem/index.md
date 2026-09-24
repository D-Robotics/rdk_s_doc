---
title: 内存管理 - hbmem/ION
description: ION 系统调试与 hbmem 共享内存使用指南
---

Hbmem 是 RDK 的共享内存管理库（libhbmem），基于内核 ION 驱动管理系统预留内存，为需要连续物理内存的硬件加速单元提供内存分配、共享、队列管理和内存池功能。

hbmem 与 ION 关系图：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/hbmem/hbmem_ion_framework.png" alt="hbmem 与 ION 关系图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


| 文档 | 说明 | 链接 |
|---|---|---|
| hbmem 使用指南 | hbmem 库的 API、数据结构、使用方法与常见问题 | [hbmem](/Advanced_development/multimedia_development/multimedia_api/hbmem_api) |
| ION 系统 | ION 内存区域划分、分配规则、debugfs 调试手段与区域大小调整 | [ION](/Advanced_development/multimedia_development/multimedia_api/hbmem/ion) |

