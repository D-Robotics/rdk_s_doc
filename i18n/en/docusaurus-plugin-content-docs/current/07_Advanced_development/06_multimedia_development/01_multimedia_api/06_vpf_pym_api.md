---
sidebar_position: 6
title: "VPF/PYM API"
description: RDK S100/S600 VPF/PYM API
---

# VPF/PYM API

## Overview

VPF/PYM (Video Process Framework / Pyramid; X5 VSE -> RDK VPF/PYM) is the RDK video processing and pyramid downsample module. It attaches to the pipeline as an HBN vnode; its params are set via the HBN vnode API (`hbn_vnode_set_attr` with `pym_attr_t`), and config structs live in `hbn_pym_cfg.h`. This section lists the VPF/PYM helper interfaces (few standalone functions; mostly config structs + HBN vnode calls).

## Abstraction

- PYM is configured via `pym_attr_t` (`hbn_pym_cfg.h`) set through `hbn_vnode_set_attr`.
- GDC config: `hbn_gen_gdc_cfg`/`hbn_free_gdc_cfg` generate/free a GDC config buffer (for GDC stitch etc.).
- `vnode_get_mode` queries the vnode mode.

## Call flow

1. `hbn_vnode_open` opens the PYM vnode (see 5.5.1.1 HBN).
2. `hbn_gen_gdc_cfg` generates GDC config (if GDC stitch needed), set via `hbn_vnode_set_ochn_attr`.
3. `hbn_vnode_set_attr` sets `pym_attr_t`; `vnode_get_mode` queries mode.
4. PYM output is fetched via `hbn_vnode_getframe_group` once the vflow starts.


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

