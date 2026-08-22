---
sidebar_position: 6
title: "视频处理框架 - VPF/PYM"
description: "RDK S100/S600 5.5.1.6 VPF/PYM（视频处理框架）"
---

# 视频处理框架 - VPF/PYM

> **层级说明**：本篇是【底层多媒体 API】（板端 `hbn_vpf_interface.h / hbn_pym_cfg.h`），VPF/PYM 视频处理与金字塔下采样 API（X5 VSE → RDK VPF/PYM）。面向需要直接操作多媒体 pipeline 的进阶开发（模式 3）；若只需跑通采集/编解码/显示的封装功能，见第 4 章 [简易 API](/Simple_API/multimedia_api/cdev/vio_api)（模式 1）。

> **平台代号说明**：本文兼容性标注沿用底层头文件原始写法——XJ3/J3、Ultra 为更早代上游平台代号，X5 为现行上游产品线代号（非本两板），Super/J6 为本产品线同源架构代号（板端实证：S100/S600 同源，S600 为多核形态）。`HW:` 列表表示该接口在上游多代平台的适用范围，其中 Super 代即对应本产品线（继承自上游标注，未逐一板端验证）；`SW` 为上游软件版本号，RDK 对应版本以 Release Note 为准。未列入代号的接口表示继承自上游、RDK 侧未逐一验证。

## 概述

VPF/PYM（Video Process Framework / Pyramid；X5 VSE → RDK VPF/PYM）是 RDK 的视频处理与金字塔下采样模块。VPF/PYM 作为 HBN vnode 接入 pipeline，其参数通过 HBN vnode API（`hbn_vnode_set_attr` 设 `pym_attr_t`）配置，配置结构体定义在 `hbn_pym_cfg.h`。本节列出 VPF/PYM 相关辅助接口（独立函数 API 较少，主体为配置结构体 + HBN vnode 调用）。

## 软件抽象

- PYM 通过 `pym_attr_t`（`hbn_pym_cfg.h`）配置金字塔层级与窗口，经 `hbn_vnode_set_attr` 设入。
- GDC 配置生成：`hbn_gen_gdc_cfg`/`hbn_free_gdc_cfg` 生成/释放 GDC 配置 buffer（用于 GDC 拼接等场景）。
- `vnode_get_mode` 查询 vnode 模式。

## API 调用流程

1. `hbn_vnode_open` 打开 PYM vnode（见 5.5.1.1 HBN）。
2. `hbn_gen_gdc_cfg` 生成 GDC 配置（如需 GDC 拼接），经 `hbn_vnode_set_ochn_attr` 设入。
3. `hbn_vnode_set_attr` 设 `pym_attr_t`；`vnode_get_mode` 查询模式。
4. vflow 启动后 PYM 输出经 `hbn_vnode_getframe_group` 获取。

## 快速示例

以下示例参考板端 `/app/multimedia_samples/sample_pym/sample_pym.c`，演示 PYM vnode 回灌模式（feedback）的最小使用序列：

```c
#include "hbn_vpf_interface.h"
#include "hbn_pym_cfg.h"
#include "hb_mem_mgr.h"

// 1. 打开 PYM vnode，配置金字塔参数
hbn_vnode_handle_t pym_fd;
hbn_vnode_open(HB_PYM, 0, AUTO_ALLOC_ID, &pym_fd);

pym_attr_t pym_cfg = {0};
/* 配置金字塔层级/窗口/通道 ... */
hbn_vnode_set_attr(pym_fd, &pym_cfg);
hbn_vnode_set_ichn_attr(pym_fd, 0, &pym_cfg);
hbn_vnode_set_ochn_attr(pym_fd, 0, &pym_cfg);

// 2. 回灌模式：发送输入图像到 PYM 输入通道
hbn_vnode_image_t input_image = {0};
/* 填充 input_image（NV12 或 RAW）... */
hb_mem_flush_buf_with_vaddr((uint64_t)input_image.buffer.virt_addr[0],
                            input_image.buffer.size[0]);
hbn_vnode_sendframe(pym_fd, 0, &input_image);

// 3. 获取金字塔输出组（多层），处理完归还
hbn_vnode_image_group_t out_group = {0};
hbn_vnode_getframe_group(pym_fd, 0, 10000, &out_group);
/* 读取 out_group.buf_group.graph_group[chn_id] 各层 ... */
hbn_vnode_releaseframe_group(pym_fd, 0, &out_group);

// 4. 关闭
hbn_vnode_close(pym_fd);
```

> 回灌模式下 PYM 输入帧由 `hb_mem_alloc_graph_buf` 分配；`vflow` 模式下 PYM 作为 vnode 串入 vflow 自动流转，见 `sample_pipeline`。

## API 列表

| 函数 | 说明 |
| --- | --- |
| hbn_gen_gdc_cfg | 见板端 `hbn_vpf_interface.h` |
| hbn_free_gdc_cfg | 见板端 `hbn_vpf_interface.h` |
| hbn_get_codec_channel_idx | 见板端 `hbn_vpf_interface.h` |
| vnode_get_mode | 见板端 `hbn_vpf_interface.h` |

## API 接口说明

### hbn_gen_gdc_cfg

【函数声明】

```c
int32_t hbn_gen_gdc_cfg(const param_t *gdc_param, const window_t *windows, uint32_t wnd_num, void **cfg_buf, uint64_t *cfg_size);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_free_gdc_cfg

【函数声明】

```c
int32_t hbn_free_gdc_cfg(uint32_t *cfg_buf);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_get_codec_channel_idx

【函数声明】

```c
hobot_status hbn_get_codec_channel_idx(hbn_vnode_handle_t vnode_fd, int32_t encoder, int32_t *channel_idx);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### vnode_get_mode

【函数声明】

```c
int32_t vnode_get_mode(hbn_vnode_handle_t vnode_fd);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

## 相关文档

- [图像信号处理 - ISP](/Advanced_development/multimedia_development/multimedia_api/isp_tune_api)
- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
- [SYS API](/Simple_API/multimedia_api/cdev/sys_api)
