---
sidebar_position: 2
title: "ISP HBN API"
description: "RDK S100/S600 ISP 开发用到的 HBN 框架接口（hbn_vnode_* / hbn_vflow_*）"
---

# ISP HBN API

## 概述

本篇讲的接口是 HBN 框架规定的接口（`hbn_vnode_*` / `hbn_vflow_*`），由所有硬件模块共用。ISP 作为使用 HBN 框架的多媒体子模块，同样需要这些接口来创建自己的 vnode 节点、设置 vnode 节点的属性，并把 vnode 节点和前级 vnode、后级 vnode 绑定起来，共同组成 pipeline——这样就能保证前级模块的视频流送到本模块处理，本模块处理好的视频流再传给后级模块处理。

你可以参考 sample_isp 示例的代码，快速开发一个控制 ISP 的应用；但仍然建议完整阅读本文档——它详细讲解了本模块使用这些接口的技巧和属性解读，对进阶开发会有很大帮助：

:::doc_scope{products="RDK S100"}
- [sample_isp 使用说明](/Advanced_development/multimedia_development/multimedia_sample/sample_isp)
:::

:::doc_scope{products="RDK S600"}
- [sample_isp 使用说明](/Advanced_development/multimedia_development/multimedia_sample_s600/sample_isp)
:::

## API 列表

HBN 框架接口（`hbn_vnode_*` / `hbn_vflow_*`）由所有硬件模块共用，完整说明见 [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)。ISP 开发用到的 11 个接口如下，按使用时序排列：

| 函数 | 说明 |
| --- | --- |
| `hbn_vnode_open` | 初始化模块，打开设备节点，返回 vnode handle |
| `hbn_vnode_set_attr` | 设置模块基本属性（ISP 用 `isp_attr_t`） |
| `hbn_vnode_set_ichn_attr` | 设置模块输入通道属性（ISP 用 `isp_ichn_attr_t`） |
| `hbn_vnode_set_ochn_attr` | 设置模块输出通道属性（ISP 用 `isp_ochn_attr_t`） |
| `hbn_vflow_create` | 创建一条 vflow，返回 vflow handle |
| `hbn_vflow_bind_vnode` | 把两个模块绑定，数据帧自动从源模块流向目的模块 |
| `hbn_vflow_start` | 启动 vflow，流内的 vnode 都会启动 |
| `hbn_vnode_getframe` | 获取模块输出通道的图像（阻塞型） |
| `hbn_vnode_releaseframe` | 释放图像 buffer，归还到输出通道 |
| `hbn_vflow_stop` | 停止 vflow，流内的 vnode 都会停止 |
| `hbn_vnode_close` | 关闭模块设备节点 |


## API 说明

#### hbn_vnode_open

【函数原型】

```c
hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id, int32_t ctx_id, hbn_vnode_handle_t *vnode_fd);
```

【功能描述】

初始化某个模块，打开该模块设备节点，返回该模块的 vnode handle。

【参数】

- [IN] hb_vnode_type vnode_type：vnode 类型，每个硬件模块对应一个 vnode 类型，取值为 HB_VIN、HB_ISP、HB_PYM 等
- [IN] uint32_t hw_id：模块的硬件 id
- [IN] int32_t ctx_id：模块的 context id，软件上的概念；可指定 context id 值，也可设置为 AUTO_ALLOC_ID，由 SDK 自动分配
- [OUT] hbn_vnode_handle_t *vnode_fd：返回模块的 vnode handle

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vnode_set_attr

【函数原型】

```c
hobot_status hbn_vnode_set_attr(hbn_vnode_handle_t vnode_fd, void *attr);
```

【功能描述】

设置模块的基本属性。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] void *attr：模块的基本属性结构体指针。基本属性结构体可以是 vin_attr_t、isp_attr_t、pym_attr_t 等，以「模块名 + _attr_t」结尾

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vnode_set_ichn_attr

【函数原型】

```c
hobot_status hbn_vnode_set_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, void *attr);
```

【功能描述】

设置模块的输入通道属性。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ichn_id：模块的输入通道 id
- [IN] void *attr：模块的输入通道属性结构体指针，以「模块名 + _ichn_attr_t」结尾

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vnode_set_ochn_attr

【函数原型】

```c
hobot_status hbn_vnode_set_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr);
```

【功能描述】

设置模块的输出通道属性。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ochn_id：模块的输出通道 id
- [IN] void *attr：模块的输出通道属性结构体指针，以「模块名 + _ochn_attr_t」结尾

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vflow_create

【函数原型】

```c
hobot_status hbn_vflow_create(hbn_vflow_handle_t *vflow_fd);
```

【功能描述】

创建一个 vflow，返回 vflow handle。

【参数】

- [OUT] hbn_vflow_handle_t *vflow_fd：vflow handle

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vflow_bind_vnode

【函数原型】

```c
hobot_status hbn_vflow_bind_vnode(hbn_vflow_handle_t vflow_fd, hbn_vnode_handle_t src_vnode_fd, uint32_t out_chn, hbn_vnode_handle_t dst_vnode_fd, uint32_t in_chn);
```

【功能描述】

把两个模块绑定到一起。绑定后 src_vnode_fd 模块的数据帧会自动流向 dst_vnode_fd 模块。

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle
- [IN] hbn_vnode_handle_t src_vnode_fd：源模块的 vnode handle
- [IN] uint32_t out_chn：源模块的输出通道 id
- [IN] hbn_vnode_handle_t dst_vnode_fd：目的模块的 vnode handle
- [IN] uint32_t in_chn：目的模块的输入通道 id

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- vflow 需要先创建，模块需要先 open。

#### hbn_vflow_start

【函数原型】

```c
hobot_status hbn_vflow_start(hbn_vflow_handle_t vflow_fd);
```

【功能描述】

启动一条 vflow。vflow 里包含的 vnode 都会启动。

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- 模块 vnode 需要事先添加到 vflow 中。

#### hbn_vnode_getframe

【函数原型】

```c
hobot_status hbn_vnode_getframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, uint32_t millisecondTimeout, hbn_vnode_image_t *out_img);
```

【功能描述】

获取模块输出通道的图像，阻塞型接口。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ochn_id：模块的输出通道 id
- [IN] uint32_t millisecondTimeout：超时等待时间
- [OUT] hbn_vnode_image_t *out_img：输出图像 buffer 结构体地址

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vnode_releaseframe

【函数原型】

```c
hobot_status hbn_vnode_releaseframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_t *img);
```

【功能描述】

释放图像 buffer，buffer 会归还到指定的输出通道。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ochn_id：模块的输出通道 id
- [IN] hbn_vnode_image_t *img：图像 buffer 结构体地址

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vflow_stop

【函数原型】

```c
hobot_status hbn_vflow_stop(hbn_vflow_handle_t vflow_fd);
```

【功能描述】

停止一条 vflow。vflow 里包含的 vnode 都会停止。

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- 和 hbn_vflow_start 成对使用。

#### hbn_vnode_close

【函数原型】

```c
hobot_status hbn_vnode_close(hbn_vnode_handle_t vnode_fd);
```

【功能描述】

关闭模块的设备节点。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- 模块串在 vflow 中时，调用 hbn_vflow_destroy 即可，无须再逐个调用 hbn_vnode_close。


## 数据结构

#### hb_vnode_type —— vnode 类型枚举

用于 `hbn_vnode_open` 的 vnode_type 参数，指定创建哪种硬件节点。ISP 开发用到：

| 名称 | 含义 |
| --- | --- |
| HB_VIN | VIN（含 CIM）节点 |
| HB_ISP | ISP 节点 |
| HB_YNR | YNR 降噪节点 |
| HB_PYM | PYM 节点 |

其余类型（HB_GDC、HB_VSE、HB_N2D 等）见 `hbn_vpf_data_info.h`。

#### isp_cfg_t —— ISP 配置容器

`isp_cfg_t` 是 ISP 配置的总容器（定义在 `hbn_isp_cfg.h`），成员如下：

| 名称 | 类型 | 含义 | 必选 |
| --- | --- | --- | --- |
| isp_attr | isp_attr_t | ISP 基本属性，见下 | 是 |
| module_ctrl | isp_module_ctrl_u | 子模块 bypass 控制，见「ISP 私有接口用到的数据结构」 | 否 |
| ochn_attr | isp_ochn_attr_t | 输出通道属性，见下 | 是 |
| ichn_attr | isp_ichn_attr_t | 输入通道属性，见下 | 是 |
| fb_buf_num | uint32_t | framebuffer 数量 | 否 |

使用时，分别把 `isp_attr` / `ochn_attr` / `ichn_attr` 传给 `hbn_vnode_set_attr` / `hbn_vnode_set_ochn_attr` / `hbn_vnode_set_ichn_attr`。

#### isp_attr_t —— ISP 基本属性

用于 `hbn_vnode_set_attr`（`isp_cfg_t` 的主体部分）。

**channel** —— 用哪个 ISP、哪路通道：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| hw_id | uint32_t | 0 | 1（S100）/ 3（S600） | - | 用第几个 ISP，见「硬件框图」 | 是 |
| slot_id | uint32_t | 0 | 11 | - | 通道槽位：online（CIM 直连）取 0 至 3，offline（经 DDR）取 4 至 11；多路时各路不能重复 | 是 |
| ctx_id | int32_t | -1 | - | -1 | 上下文编号，AUTO_ALLOC_ID(-1) 由库自动分配 | 是 |

**主体字段**：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| sched_mode | sched_mode_e | 0 | 2 | 1 | 调度模式：0 = TDMF，1 = manual 分时复用（常用），2 = passthrough（CIM 直连独占）。串 YNR / PYM 时，它们的 work_mode / pym_mode 和 slot_id 要与 ISP 的一致 | 是 |
| work_mode | isp_work_mode_e | 0 | 2 | 0 | 工作模式：ISP_WORK_MODE_NOMAL（0，正常，常用）、TPG / CIM_TPG（测试图案） | 是 |
| hdr_mode | hdr_mode_e | 0 | 7 | - | HDR 合成模式：LINEAR（0，线性）、NATIVE（1，sensor 侧合成）、2To1/3To1/4To1_LINE（2/4/6）及对应 _FRAME（3/5/7） | 是 |
| size | image_size_t | - | 4096 × 2560 | - | 输入图像宽高，与 sensor 输出一致 | 是 |
| frame_rate | uint32_t | 0 | 120 | - | 帧率 | 是 |
| isp_sw_ctrl | isp_sw_ctrl_t | - | - | - | 统计使能开关组，见下表 | 否 |
| algo_state | uint32_t | 0 | 1 | 1 | 2A 算法总开关：1 = 自动运行（常用），0 = 关闭 | 是 |

**isp_sw_ctrl** —— 统计使能（想取哪种统计就开哪个）：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| ae_stat_buf_en | uint32_t | 0 | 1 | 0 | AE 统计使能。不开则 hbn_isp_get_ae_statistics 取不到数据 | 否 |
| awb_stat_buf_en | uint32_t | 0 | 1 | 0 | AWB 统计使能，对应 hbn_isp_get_awb_statistics | 否 |
| ae5bin_stat_buf_en | uint32_t | 0 | 1 | 0 | AE 5bin 统计使能，对应 hbn_isp_get_ae5bin_statistics | 否 |
| ctx_buf_en | uint32_t | 0 | 1 | 0 | ISP context 使能 | 否 |
| pixel_consistency_en | uint32_t | 0 | 1 | 0 | 像素一致性统计使能 | 否 |

#### isp_ochn_attr_t —— 输出通道属性

用于 `hbn_vnode_set_ochn_attr`（`isp_cfg_t` 的输出部分）。

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| stream_output_mode | isp_stream_output_mode_e | 0 | 1 | - | online 直通输出开关：STREAM_OUTPUT_MODE_ENABLE（1）/ DISABLE（0） | 是 |
| axi_output_mode | isp_axi_output_mode_e | 0 | 21 | - | 写 DDR 的输出格式：YUV420（示例值）、YUV422、RAW8/10/12/16/24 等 | 是 |
| output_raw_level | isp_output_raw_level_e | 0 | 5 | - | RAW 输出取哪一级：SENSOR_DATA（0，sensor 原始数据，示例值），另有帧拼接后、gamma FE 后等层级 | 是 |
| buf_num | uint32_t | 0 | - | 3 | 输出 buffer 个数 | 否 |

#### isp_ichn_attr_t —— 输入通道属性

用于 `hbn_vnode_set_ichn_attr`（`isp_cfg_t` 的输入部分）。

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| input_crop_cfg | crop_cfg_t | - | - | 不裁剪 | 输入裁剪配置：enable = 0 不裁剪 | 否 |

#### hbn_vnode_image_t —— 输出图像 buffer

用于 `hbn_vnode_getframe` / `hbn_vnode_releaseframe` 的 `out_img` / `img` 参数：

| 名称 | 类型 | 含义 |
| --- | --- | --- |
| info | hbn_frame_info_t | 帧信息（frame_id、时间戳等） |
| buffer | hb_mem_graphic_buf_t | 图像 buffer（宽高、格式、stride、各 plane 地址等） |
| metadata | void* | 附加元数据 |

`buffer`（`hb_mem_graphic_buf_t`）的关键字段：`width` / `height` 为图像宽高，`format` 为像素格式，`stride` / `vstride` 为水平 / 垂直 stride，`plane_cnt` 为 plane 数，`size[]` 为各 plane 大小，`virt_addr[]` / `phys_addr[]` 为各 plane 的虚拟 / 物理地址（完整定义见 `hb_mem_mgr.h`）。


## 相关文档

- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
- [ISP概览](./overview)
- [ISP Tuning API](./isp_tuning_api)
