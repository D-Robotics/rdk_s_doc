---
sidebar_position: 1
title: "GDC 概述"
description: "RDK S100/S600 GDC 几何畸变矫正概述与使用流程"
---

# GDC 概述

## 概述

- GDC（Geometrical Distortion Correction，几何畸变矫正）用于相机图像的畸变矫正、视角变换和指定角度（0/90/180/270）旋转。作为 HBN 框架的一个 vnode，可与其他 vnode 连接形成 vflow，关于 HBN 框架见 [HBN 框架](../01_hbn_api.md)。
- GDC 只支持 offline 模式：从 DDR 读数据，处理完再写回 DDR。
- 使用 GDC 前需先准备 GDC 配置参数文件（gdc.bin），该文件可由 GDC Tool 仿真直接生成，或由 GDC bin 生成接口解析 layout.json 生成。

使用 GDC 模块主要涉及以下三个部分：

| 模块 | 功能描述 |
|---|---|
| [GDC API](./02_gdc_api.md) | 遵循 HBN 框架，打开/关闭 GDC 节点、配置属性、收发帧。 |
| [GDC Bin 生成 API](./03_gdc_bin_api.md) | 生成 GDC bin 文件。 |
| [GDC Tool](./04_gdc_tool.md) | PC 端效果仿真，生成 GDC 配置参数文件（layout.json 或 config.bin）。提供 Affine、Equisolid、Equisolid(cylinder)、Equidistant、Custom、Keystone+dewarping 六种变换模式。 |


下图是两种 GDC 场景的 vflow 示例（场景 1 中"回灌"指数据源来自 DDR）：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_vflow_topo.png?v=20260921" alt="GDC vflow 两种场景" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## 使用方法

生成并使用 GDC bin 的常用方法：

1. **方法 1**：GDC Tool 生成 layout.json → `gdc_cfg_bin_gen` 解析 json 生成 gdc.bin 文件 → 读入 hbmem 内存，`hbn_vnode_set_attr` 设入 GDC 节点。
2. **方法 2**：GDC Tool 生成 layout.json → `gdc_cfg_bin_gen` 解析 json 生成 bin 到内存 buf → `hbn_vnode_set_attr` 设入 GDC 节点（不落盘）。
3. **方法 3**：由 param_t/window_t 直接调 `hbn_gen_gdc_cfg` 生成 bin 到内存 buf → `hbn_vnode_set_attr` 设入（无需 json）。
4. **方法 4**：GDC Tool 直接生成 config.bin → 读入 hbmem 内存，`hbn_vnode_set_attr` 设入（不走 bin 生成接口）。

### 场景推荐

- **固定效果场景**：效果简单且固定（如鱼眼矫正），用方法 1 或方法 4 提前生成 gdc.bin，读入内存设入节点。
- **动态效果场景**：如果场景需要每帧动态调整效果，建议使用 GDC bin API 实时生成配置文件 [GDC Bin 生成 API](./03_gdc_bin_api.md)）。

## 相关文档

- [GDC Bin 生成 API](./03_gdc_bin_api.md)
- [GDC Tool](./04_gdc_tool.md)
- [GDC API](./02_gdc_api.md)
- [HBN 框架](../01_hbn_api.md)

:::doc_scope{products="RDK S100"}
- [sample_gdc 使用说明](../../02_multimedia_sample/05_sample_gdc.md)
:::

:::doc_scope{products="RDK S600"}
- [sample_gdc 使用说明](../../02_multimedia_sample_s600/05_sample_gdc.md)
:::
