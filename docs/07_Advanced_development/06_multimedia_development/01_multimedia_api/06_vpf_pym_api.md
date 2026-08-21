---
sidebar_position: 6
title: "视频处理框架 - VPF/PYM"
description: "RDK S100/S600 5.5.1.6 VPF/PYM（视频处理框架）"
---

# 视频处理框架 - VPF/PYM

> **层级说明**：本篇是【底层多媒体 API】（板端 `hbn_vpf_interface.h / hbn_pym_cfg.h`），VPF/PYM 视频处理与金字塔下采样 API（X5 VSE → RDK VPF/PYM）。面向需要直接操作多媒体 pipeline 的进阶开发（模式 3）；若只需跑通采集/编解码/显示的封装功能，见第 4 章 [简易 API](/Simple_API/multimedia_api/cdev/vio_api)（模式 1）。

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
