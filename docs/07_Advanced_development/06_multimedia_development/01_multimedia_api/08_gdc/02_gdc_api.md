---
sidebar_position: 2
title: "GDC API"
description: "RDK S100/S600 GDC vnode 接口、属性结构体与返回值"
---

# GDC API

## 模块描述

- GDC（Geometrical Distortion Correction）模块可将输入图像进行畸变校正、视角变换和指定角度（0/90/180/270）的旋转。
- GDC API 遵循 HBN 框架，用于打开/关闭 GDC 节点、配置属性、收发帧。关于 HBN 框架见 [HBN 框架](../01_hbn_api.md)。

### 基础规格

:::doc_scope{products="RDK S100"}

| 项 | 规格 |
|---|---|
| 最大分辨率 | 3840×2160 |
| 最小分辨率 | 96×96（奇数行或列不支持） |
| 性能 | 3840x2160，60fps |
| 工作模式 | ddr-gdc-ddr |
| 输入格式 | YUV420 semi-planar |
| 输出格式 | YUV420 semi-planar |
| GDC 模块个数 | 1个 |

:::

:::doc_scope{products="RDK S600"}

| 项 | 规格 |
|---|---|
| 最大分辨率 | 3840×2160 |
| 最小分辨率 | 96×96（奇数行或列不支持） |
| 性能 | 3840x2160，60fps |
| 工作模式 | ddr-gdc-ddr |
| 输入格式 | YUV420 semi-planar |
| 输出格式 | YUV420 semi-planar |
| GDC 模块个数 | 2个 |

:::

## 参考示例

GDC 部分示例代码可参考：

:::doc_scope{products="RDK S100"}
- [sample_gdc 使用说明](../../02_multimedia_sample/05_sample_gdc.md)
:::

:::doc_scope{products="RDK S600"}
- [sample_gdc 使用说明](../../02_multimedia_sample_s600/05_sample_gdc.md)
:::

## API 参考

GDC vnode 复用通用 HBN vnode 接口，GDC 特化取值见各接口说明。

| API 接口 | 接口功能 |
|---|---|
| [hbn_vnode_open](#hbn_vnode_open) | 打开 vnode |
| [hbn_vnode_close](#hbn_vnode_close) | 关闭 vnode |
| [hbn_vnode_set_attr](#hbn_vnode_set_attr) | 设置 vnode 属性 |
| [hbn_vnode_set_ichn_attr](#hbn_vnode_set_ichn_attr) | 设置输入通道属性 |
| [hbn_vnode_get_ichn_attr](#hbn_vnode_set_ichn_attr) | 获取输入通道属性 |
| [hbn_vnode_set_ochn_attr](#hbn_vnode_set_ochn_attr) | 设置输出通道属性 |
| [hbn_vnode_get_ochn_attr](#hbn_vnode_set_ochn_attr) | 获取输出通道属性 |
| [hbn_vnode_set_ochn_buf_attr](#hbn_vnode_set_ochn_buf_attr) | 设置输出 buffer 属性 |
| [hbn_vnode_start](#hbn_vnode_start) | 启动 vnode |
| [hbn_vnode_stop](#hbn_vnode_start) | 停止 vnode |
| [hbn_vnode_getframe](#hbn_vnode_getframe) | 从 vnode 获取帧 |
| [hbn_vnode_sendframe](#hbn_vnode_sendframe) | 向 vnode 发送帧 |
| [hbn_vnode_releaseframe](#hbn_vnode_releaseframe) | 释放帧 |

## 接口说明

### hbn_vnode_open {#hbn_vnode_open}

#### 【函数声明】

```c
hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id,
                            int32_t ctx_id, hbn_vnode_handle_t *vnode_fd);
```

#### 【功能描述】

初始化 vnode，打开设备节点，返回 vnode handle。

#### 【参数描述】

- [IN] `hb_vnode_type vnode_type`：vnode 类型，GDC 取 `HB_GDC`。
- [IN] `uint32_t hw_id`：硬件 id，GDC 取 0。
- [IN] `int32_t ctx_id`：context id，软件概念；可指定，或设 `AUTO_ALLOC_ID` 由框架自动分配。
- [OUT] `hbn_vnode_handle_t *vnode_fd`：返回 vnode handle。

#### 【返回值】

- 成功：0。
- 失败：负值错误码，参考 [返回值说明](#返回值说明)。

### hbn_vnode_close {#hbn_vnode_close}

#### 【函数声明】

```c
void hbn_vnode_close(hbn_vnode_handle_t vnode_fd);
```

#### 【功能描述】

关闭模块设备节点。需与 `hbn_vnode_open` 成对使用。

#### 【参数描述】

- [IN] `hbn_vnode_handle_t vnode_fd`：vnode handle。

#### 【返回值】

无。

### hbn_vnode_set_attr {#hbn_vnode_set_attr}

#### 【函数声明】

```c
hobot_status hbn_vnode_set_attr(hbn_vnode_handle_t vnode_fd, void *attr);
```

#### 【功能描述】

设置模块基本属性。

#### 【参数描述】

- [IN] `hbn_vnode_handle_t vnode_fd`：vnode handle。
- [IN] `void *attr`：属性结构体指针，GDC 为 [gdc_settings_t](#gdc_settings_t)。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

### hbn_vnode_set_ichn_attr / get_ichn_attr {#hbn_vnode_set_ichn_attr}

#### 【函数声明】

```c
hobot_status hbn_vnode_set_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, void *attr);
hobot_status hbn_vnode_get_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, void *attr);
```

#### 【功能描述】

设置/获取输入通道属性。GDC 仅 1 个输入通道，`ichn_id` 取 0；属性结构体为 [gdc_settings_t](#gdc_settings_t)。

#### 【参数描述】

- [IN] `hbn_vnode_handle_t vnode_fd`：vnode handle。
- [IN] `uint32_t ichn_id`：输入通道 id，GDC 取 0。
- [IN/OUT] `void *attr`：属性结构体指针（`gdc_settings_t`）。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

### hbn_vnode_set_ochn_attr / get_ochn_attr {#hbn_vnode_set_ochn_attr}

#### 【函数声明】

```c
hobot_status hbn_vnode_set_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr);
hobot_status hbn_vnode_get_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr);
```

#### 【功能描述】

设置/获取输出通道属性。GDC 输出通道 `ochn_id` 取 0；属性结构体为 [gdc_settings_t](#gdc_settings_t)。

#### 【参数描述】

- [IN] `hbn_vnode_handle_t vnode_fd`：vnode handle。
- [IN] `uint32_t ochn_id`：输出通道 id，GDC 取 0。
- [IN/OUT] `void *attr`：属性结构体指针（`gdc_settings_t`）。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

### hbn_vnode_set_ochn_buf_attr {#hbn_vnode_set_ochn_buf_attr}

#### 【函数声明】

```c
hobot_status hbn_vnode_set_ochn_buf_attr(hbn_vnode_handle_t vnode_fd,
                                         uint32_t ochn_id, hbn_buf_alloc_attr_t *alloc_attr);
```

#### 【功能描述】

设置输出通道 buffer 属性（buffer 数量、地址是否连续、cache 策略等）。GDC `ochn_id` 取 0。

#### 【参数描述】

- [IN] `hbn_vnode_handle_t vnode_fd`：vnode handle。
- [IN] `uint32_t ochn_id`：输出通道 id，GDC 取 0。
- [IN] `hbn_buf_alloc_attr_t *alloc_attr`：buffer 分配属性。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

### hbn_vnode_start / stop {#hbn_vnode_start}

#### 【函数声明】

```c
hobot_status hbn_vnode_start(hbn_vnode_handle_t vnode_fd);
hobot_status hbn_vnode_stop(hbn_vnode_handle_t vnode_fd);
```

#### 【功能描述】

启动/停止 vnode。启动前需先 open 并完成属性设置。

#### 【参数描述】

- [IN] `hbn_vnode_handle_t vnode_fd`：vnode handle。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

### hbn_vnode_getframe {#hbn_vnode_getframe}

#### 【函数声明】

```c
hobot_status hbn_vnode_getframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                uint32_t millisecondTimeout, hbn_vnode_image_t *out_img);
```

#### 【功能描述】

获取输出通道图像，阻塞型。GDC `ochn_id` 取 0。

#### 【参数描述】

- [IN] `hbn_vnode_handle_t vnode_fd`：vnode handle。
- [IN] `uint32_t ochn_id`：输出通道 id，GDC 取 0。
- [IN] `uint32_t millisecondTimeout`：超时等待时间。
- [OUT] `hbn_vnode_image_t *out_img`：输出图像 buffer 结构体地址。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

### hbn_vnode_sendframe {#hbn_vnode_sendframe}

#### 【函数声明】

```c
hobot_status hbn_vnode_sendframe(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
                                 hbn_vnode_image_t *img);
```

#### 【功能描述】

向输入通道发送图像，触发处理，阻塞型（默认超时 1 秒）。GDC `ichn_id` 取 0。

#### 【参数描述】

- [IN] `hbn_vnode_handle_t vnode_fd`：vnode handle。
- [IN] `uint32_t ichn_id`：输入通道 id，GDC 取 0。
- [IN] `hbn_vnode_image_t *img`：输入图像 buffer 地址。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

### hbn_vnode_releaseframe {#hbn_vnode_releaseframe}

#### 【函数声明】

```c
hobot_status hbn_vnode_releaseframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                    hbn_vnode_image_t *img);
```

#### 【功能描述】

释放图像 buffer，归还到指定输出通道。GDC `ochn_id` 取 0。

#### 【参数描述】

- [IN] `hbn_vnode_handle_t vnode_fd`：vnode handle。
- [IN] `uint32_t ochn_id`：输出通道 id，GDC 取 0。
- [IN] `hbn_vnode_image_t *img`：图像 buffer 结构体地址。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

## 数据结构

### gdc_settings_t {#gdc_settings_t}

GDC vnode 的属性结构体，`hbn_vnode_set_attr` / `set_ichn_attr` / `set_ochn_attr` 均使用它。

| 名称 | 类型 | 含义 | 最大值 | 最小值 | 默认值 | 是否必选 |
|---|---|---|---|---|---|---|
| gdc_config | gdc_config_t | gdc 图像相关参数 | - | - | - | 是 |
| binary_ion_id | int32_t | gdc config bin 文件物理地址对应的 share id | - | - | - | 是 |
| binary_offset | uint64_t | gdc config bin 文件物理地址偏移 | - | - | - | 是 |
| reserved[8] | uint32_t | 保留位置 | - | - | - | 否 |
| magicNumber | uint32_t | 属性结构体校验值，需要填写为固定值 MAGIC_NUM | - | - | - | 是 |

### gdc_config_t {#gdc_config_t}

| 名称 | 类型 | 含义 | 最大值 | 最小值 | 默认值 | 是否必选 |
|---|---|---|---|---|---|---|
| config_addr | uint64_t | gdc config bin 文件虚拟地址 | - | - | - | 是 |
| config_size | uint32_t | gdc config bin 文件大小 | - | - | - | 是 |
| input_width | uint32_t | gdc 图像输入宽度，2 对齐 | 3840 | 96 | - | 是 |
| input_height | uint32_t | gdc 图像输入高度，2 对齐 | 2160 | 96 | - | 是 |
| input_stride | uint32_t | gdc 图像输入跨度，16 对齐 | 3840 | 96 | - | 是 |
| output_width | uint32_t | gdc 图像输出宽度，2 对齐 | 3840 | 96 | - | 是 |
| output_height | uint32_t | gdc 图像输出高度，2 对齐 | 2160 | 96 | - | 是 |
| output_stride | uint32_t | gdc 图像输出跨度，16 对齐 | 2160 | 96 | - | 是 |
| div_width | uint8_t | 宽度除数 | - | - | 0 | 否 |
| div_height | uint8_t | 高度除数 | - | - | 0 | 否 |
| total_planes | uint32_t | plane 数量 | - | - | 2 | 是 |
| sequential_mode | uint8_t | gdc 处理模式 | - | - | 0 | 否 |

### gdc_cfg_t {#gdc_cfg_t}

json 配置层结构体（板端 vflow json 节点解析使用），字段供 `gdc_node_parser_config` 解析。

| 名称 | 类型 | 含义 | 最大值 | 最小值 | 默认值 | 是否必选 |
|---|---|---|---|---|---|---|
| input_width | uint32_t | 输入宽度 | - | - | - | 是 |
| input_height | uint32_t | 输入高度 | - | - | - | 是 |
| output_width | uint32_t | 输出宽度 | - | - | - | 是 |
| output_height | uint32_t | 输出高度 | - | - | - | 是 |
| buf_num | uint32_t | 输出 buffer 数量 | - | - | - | 是 |
| fb_buf_num | uint32_t | 回灌 buffer 数量 | - | - | - | 否 |
| time_out | uint32_t | 取帧超时（毫秒） | - | - | - | 是 |
| in_buf_noclean | uint32_t | 输入 buffer 不清零 | - | - | - | 否 |
| in_buf_noncached | uint32_t | 输入 buffer 不 cache | - | - | - | 否 |
| out_buf_noinvalid | uint32_t | 输出 buffer 不 invalidate | - | - | - | 否 |
| out_buf_noncached | uint32_t | 输出 buffer 不 cache | - | - | - | 否 |
| gdc_pipeline | uint32_t | pipeline 参数 | - | - | - | 否 |
| hw_id | uint32_t | 硬件 id | - | - | - | 是 |
| format | uint32_t | 像素位宽（Y 平面）：0=8bit、1=10bit、2=12bit，UV 固定 8bit | 2 | 0 | 0 | 是 |

## 返回值说明 {#返回值说明}

GDC 接口返回 `hobot_status`，0 为成功，负值为错误码。GDC 专属错误码（`HB_GDC` 前缀组合）：

| 错误码 | 宏定义 | 描述 | 常见原因 |
|---|---|---|---|
| 0 | HBN_STATUS_SUCESS | 成功 | - |
| 0x060008 | HBN_STATUS_GDC_INVALID_NULL_PTR | 空指针 | attr 或 image 指针为空 |
| 0x060009 | HBN_STATUS_GDC_INVALID_PARAMETER | 无效参数 | 参数/版本检查失败 |
| 0x06000f | HBN_STATUS_GDC_NODE_UNEXIST | 节点不存在 | `/dev/gdc*_src` 或 `_cap` 打开失败 |
| 0x060032 | HBN_STATUS_GDC_BIND_NODE_FAIL | 绑定失败 | context 绑定失败 |
| 0x060033 | HBN_STATUS_GDC_INVALID_VERSION | 版本不匹配 | 库与底层驱动版本不一致 |
| 0x060081 | HBN_STATUS_GDC_GEN_CFG_FAIL | 生成配置失败 | `hbn_gen_gdc_cfg` 生成 bin 失败 |

通用 HBN 错误码（INVALID_NODE / INVALID_OCHNID / TIMEOUT / NOMEM 等）见 [HBN 框架](../01_hbn_api.md) 返回值说明。

## 快速示例

GDC 无独立函数 API，通过「生成配置 bin → 经 HBN vnode 设入」的配置流程使用。生成 bin（参考板端 `sample_gdc/2-generate_bin`）：

```c
#include <stdio.h>
#include "hbn_vpf_interface.h"

/* 从 layout.json 生成 GDC bin，cfg_buf 由内部分配 */
void *cfg_buf = NULL;
uint64_t cfg_size = 0;
gdc_cfg_bin_gen("./gdc_bin_custom_config.json", "./gdc.bin", &cfg_buf, &cfg_size);

/* 落盘（若 gdc_cfg_bin_gen 第二参传 NULL 则跳过此步） */
FILE *fp = fopen("./gdc.bin", "wb");
fwrite(cfg_buf, 1, cfg_size, fp);
fclose(fp);
```

设入 pipeline 并取帧（参考 `sample_gdc/3-gdc_static_valid`）：

```c
hbn_vnode_handle_t gdc_fd;
hbn_vnode_open(HB_GDC, 0, AUTO_ALLOC_ID, &gdc_fd);

gdc_settings_t gdc_setting = {0};
gdc_setting.gdc_config.input_width   = 1920;
gdc_setting.gdc_config.input_height  = 1080;
gdc_setting.gdc_config.input_stride  = 1920;
gdc_setting.gdc_config.output_width  = 1920;
gdc_setting.gdc_config.output_height = 1080;
gdc_setting.gdc_config.output_stride  = 1920;
gdc_setting.gdc_config.total_planes   = 2;
gdc_setting.binary_ion_id = cfg_buf_share_id;   /* bin 的 ion share id */
gdc_setting.binary_offset = cfg_buf_offset;     /* bin 的物理地址偏移 */

hbn_vnode_set_attr(gdc_fd, &gdc_setting);
hbn_vnode_set_ichn_attr(gdc_fd, 0, &gdc_setting);
hbn_vnode_set_ochn_attr(gdc_fd, 0, &gdc_setting);
hbn_vnode_start(gdc_fd);

hbn_vnode_image_t in_img = {0}, out_img = {0};
/* 填充 in_img ... */
hbn_vnode_sendframe(gdc_fd, 0, &in_img);
hbn_vnode_getframe(gdc_fd, 0, 1000, &out_img);
/* 使用 out_img ... */
hbn_vnode_releaseframe(gdc_fd, 0, &out_img);

hbn_vnode_stop(gdc_fd);
hbn_vnode_close(gdc_fd);
hbn_free_gdc_cfg((uint32_t *)cfg_buf);   /* 释放 bin buf */
```

板端 GDC 相关示例：`sample_gdc/2-generate_bin`（生成 bin）、`3-gdc_static_valid`（静态矫正验证）、`4-gdc_stress_test`（压测）、`5-gdc_equisolid`（等距投影）、`6-gdc_transformation`（几何变换）。详见：

:::doc_scope{products="RDK S100"}
- [sample_gdc 使用说明](../../02_multimedia_sample/05_sample_gdc.md)
:::

:::doc_scope{products="RDK S600"}
- [sample_gdc 使用说明](../../02_multimedia_sample_s600/05_sample_gdc.md)
:::

## 相关文档

- [GDC 概述](./01_gdc_overview.md)
- [GDC Bin 生成 API](./03_gdc_bin_api.md)
- [GDC Tool](./04_gdc_tool.md)
- [HBN 框架](../01_hbn_api.md)
