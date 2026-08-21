---
sidebar_position: 8
title: "畸变矫正 - GDC"
description: "RDK S100/S600 GDC 畸变矫正配置"
---

# 畸变矫正 - GDC

> **层级说明**：本篇是【底层多媒体 API】（板端 `hb_gdc_cfg.h / hbn_vpf_interface.h`），GDC 几何畸变矫正，通过配置结构体实现，无独立函数 API。面向需要直接操作多媒体 pipeline 的进阶开发（模式 3）；若只需跑通采集/编解码/显示的封装功能，见第 4 章 [简易 API](/Simple_API/multimedia_api/cdev/vio_api)（模式 1）。

## 概述

GDC（Geometric Distortion Correction，畸变矫正）用于相机图像的几何畸变矫正与拼接。GDC 无独立函数 API，通过配置结构体（板端 `hb_gdc_cfg.h` 的 `gdc_config_t`/`gdc_settings_t`）描述输入/输出几何，配置 binary 由 `hbn_gen_gdc_cfg` 生成（见 5.5.1.6 VPF/PYM），经 HBN vnode 的 GDC 通道（`hbn_vnode_set_ochn_attr`）设入。

## 软件抽象

- `gdc_config_t`：GDC 单路配置——输入/输出宽高、stride、plane 数、分割模式（`div_width`/`div_height`）、`sequential_mode` 等。
- `gdc_settings_t`：GDC 设置——`gdc_config_t` 数组 + 配置 binary 的 ion share id（`binary_ion_id`）与物理地址偏移（`binary_offset`）。
- 配置 binary 由 `hbn_gen_gdc_cfg`（`hbn_vpf_interface.h`）根据 `param_t`/`window_t` 生成，`hbn_free_gdc_cfg` 释放。

## API 调用流程

1. 准备 `gdc_config_t`/`gdc_settings_t`（输入/输出几何参数）。
2. `hbn_gen_gdc_cfg` 生成配置 binary（见 5.5.1.6 VPF/PYM）。
3. 经 HBN vnode 打开 GDC 模块，`hbn_vnode_set_ochn_attr` 设入配置。
4. `hbn_vnode_start` 启动，输出帧经 `hbn_vnode_getframe` 获取；用完 `hbn_free_gdc_cfg` 释放 binary。

## 快速示例

GDC 无独立函数 API，通过「生成配置 binary → 经 HBN vnode 设入」的配置流程使用。生成配置 binary 的最小流程如下（参考板端 `/app/multimedia_samples/sample_gdc/2-generate_bin/`）：

```c
#include "gdc_cfg.h"
#include "gdc_bin_cfg.h"

// 1. 解析 JSON 配置（输入/输出几何、畸变映射等）
gdc_bin_custom_config_t cfg = {0};
parse_json_config("./gdc_bin_custom_config.json", &cfg);

// 2. 生成 GDC 配置 binary，写入文件（板端 hbn_gen_gdc_cfg 同源实现）
uint32_t *cfg_buf = NULL;
uint64_t config_size = 0;
gdc_cfg_bin_gen(json_str, NULL, (void **)&cfg_buf, &config_size);
save_to_file("./gdc.bin", cfg_buf, config_size);

// 3. 释放生成 buffer
hbn_free_gdc_cfg(cfg_buf);
```

设入 pipeline 时，将 binary 的 ion share id 与物理偏移填入 `gdc_settings_t`（`binary_ion_id`/`binary_offset`），经 `hbn_vnode_set_ochn_attr` 设入 GDC vnode 即可：

```c
hbn_vnode_handle_t gdc_fd;
hbn_vnode_open(HB_GDC, 0, AUTO_ALLOC_ID, &gdc_fd);

gdc_settings_t gdc_settings = {0};
gdc_settings.binary_ion_id  = cfg_buf_share_id;   /* 配置 binary 的 ion share id */
gdc_settings.binary_offset  = cfg_buf_offset;     /* 物理地址偏移 */
hbn_vnode_set_ochn_attr(gdc_fd, 0, &gdc_settings);

hbn_vnode_start(gdc_fd);
/* 取帧 hbn_vnode_getframe ... */
```

> 板端 GDC 相关示例：`sample_gdc/3-gdc_static_valid`（静态畸变矫正验证）、`4-gdc_stress_test`（压测）、`5-gdc_equisolid`（等距投影）、`6-gdc_transformation`（几何变换）。

## 相关文档

- [VPF/PYM](/Advanced_development/multimedia_development/multimedia_api/vpf_pym_api)（`hbn_gen_gdc_cfg`/`hbn_free_gdc_cfg`）
- [HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)（vnode 通道绑定）
