---
sidebar_position: 8
title: "5.5.1.8 畸变矫正 - GDC"
description: RDK S100/S600 GDC 畸变矫正配置
---

# 5.5.1.8 畸变矫正 - GDC

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

## 相关文档

- [5.5.1.6 VPF/PYM](/Advanced_development/multimedia_development/multimedia_api/vpf_pym_api)（`hbn_gen_gdc_cfg`/`hbn_free_gdc_cfg`）
- [5.5.1.1 HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)（vnode 通道绑定）
