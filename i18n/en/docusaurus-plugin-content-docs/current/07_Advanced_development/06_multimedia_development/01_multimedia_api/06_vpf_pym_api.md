---
sidebar_position: 6
title: "Video Processing Framework - VPF/PYM"
description: "RDK S100/S600 5.5.1.6 VPF/PYM (Video Processing Framework)"
---

# Video Processing Framework - VPF/PYM

> **Level description**: This chapter covers the [low-level multimedia APIs] (board-side `hbn_vpf_interface.h / hbn_pym_cfg.h`), i.e. the VPF/PYM video processing and pyramid downsampling APIs (X5 VSE -> RDK VPF/PYM). It is intended for advanced developers who need to directly operate the multimedia pipeline (Mode 3). If you only need to get the encapsulated capture/codec/display functionality running, see Chapter 4 [Simple APIs](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) (Mode 1).

> **Platform codename note**: Compatibility annotations in this document follow the original wording of the underlying header files. XJ3/J3 and Ultra are earlier-generation upstream platform codenames; X5 denotes the current upstream product line (not these two boards); Super/J6 are the codenames of the architecture family shared by this product line (board-verified: S100/S600 share the same family, with S600 in a multi-core form). An `HW:` list indicates the interface's applicable range across upstream platform generations, where the Super generation corresponds to this product line (inherited from upstream annotations, not verified per-interface on board); `SW` is the upstream software version number — for RDK releases see the Release Notes. Interfaces without codenames are inherited from upstream and not individually verified on RDK.

## Overview

VPF/PYM (Video Process Framework / Pyramid; X5 VSE -> RDK VPF/PYM) is the RDK video processing and pyramid downsampling module. VPF/PYM attaches to the pipeline as an HBN vnode, and its parameters are configured through the HBN vnode API (`hbn_vnode_set_attr` with `pym_attr_t`); the configuration structs are defined in `hbn_pym_cfg.h`. This section lists the VPF/PYM-related helper interfaces (there are few standalone function APIs; the bulk is configuration structs + HBN vnode calls).

## Software Abstraction

- PYM is configured with `pym_attr_t` (`hbn_pym_cfg.h`), which sets the pyramid levels and windows, via `hbn_vnode_set_attr`.
- GDC config generation: `hbn_gen_gdc_cfg`/`hbn_free_gdc_cfg` generate/free a GDC config buffer (used for scenarios such as GDC stitching).
- `vnode_get_mode` queries the vnode mode.

## API Call Flow

1. `hbn_vnode_open` opens the PYM vnode (see 5.5.1.1 HBN).
2. `hbn_gen_gdc_cfg` generates the GDC config (if GDC stitching is needed), set via `hbn_vnode_set_ochn_attr`.
3. `hbn_vnode_set_attr` sets `pym_attr_t`; `vnode_get_mode` queries the mode.
4. After the vflow starts, the PYM output is fetched via `hbn_vnode_getframe_group`.

## Quick Example

The following example is based on the board-side `/app/multimedia_samples/sample_pym/sample_pym.c` and demonstrates the minimal usage sequence of the PYM vnode feedback mode:

```c
#include "hbn_vpf_interface.h"
#include "hbn_pym_cfg.h"
#include "hb_mem_mgr.h"

// 1. Open the PYM vnode and configure the pyramid parameters
hbn_vnode_handle_t pym_fd;
hbn_vnode_open(HB_PYM, 0, AUTO_ALLOC_ID, &pym_fd);

pym_attr_t pym_cfg = {0};
/* Configure pyramid levels/windows/channels ... */
hbn_vnode_set_attr(pym_fd, &pym_cfg);
hbn_vnode_set_ichn_attr(pym_fd, 0, &pym_cfg);
hbn_vnode_set_ochn_attr(pym_fd, 0, &pym_cfg);

// 2. Feedback mode: send the input image to the PYM input channel
hbn_vnode_image_t input_image = {0};
/* Fill input_image (NV12 or RAW) ... */
hb_mem_flush_buf_with_vaddr((uint64_t)input_image.buffer.virt_addr[0],
                            input_image.buffer.size[0]);
hbn_vnode_sendframe(pym_fd, 0, &input_image);

// 3. Fetch the pyramid output group (multiple levels), return it after processing
hbn_vnode_image_group_t out_group = {0};
hbn_vnode_getframe_group(pym_fd, 0, 10000, &out_group);
/* Read each level of out_group.buf_group.graph_group[chn_id] ... */
hbn_vnode_releaseframe_group(pym_fd, 0, &out_group);

// 4. Close
hbn_vnode_close(pym_fd);
```

> In feedback mode, PYM input frames are allocated by `hb_mem_alloc_graph_buf`; in `vflow` mode, PYM is chained into the vflow as a vnode and flows automatically — see `sample_pipeline`.

## API List

| Function | Description |
| --- | --- |
| hbn_gen_gdc_cfg | See board-side `hbn_vpf_interface.h` |
| hbn_free_gdc_cfg | See board-side `hbn_vpf_interface.h` |
| hbn_get_codec_channel_idx | See board-side `hbn_vpf_interface.h` |
| vnode_get_mode | See board-side `hbn_vpf_interface.h` |

## API Interface Description

### hbn_gen_gdc_cfg

**Function Prototype**

```c
int32_t hbn_gen_gdc_cfg(const param_t *gdc_param, const window_t *windows, uint32_t wnd_num, void **cfg_buf, uint64_t *cfg_size);
```

**Description**

See board-side `hbn_vpf_interface.h` (no doxygen; the signature is taken from the header file).

**Parameters**

<!-- TODO(Sx): 参数待头文件/板端核实 -->


### hbn_free_gdc_cfg

**Function Prototype**

```c
int32_t hbn_free_gdc_cfg(uint32_t *cfg_buf);
```

**Description**

See board-side `hbn_vpf_interface.h` (no doxygen; the signature is taken from the header file).

**Parameters**

<!-- TODO(Sx): 参数待头文件/板端核实 -->


### hbn_get_codec_channel_idx

**Function Prototype**

```c
hobot_status hbn_get_codec_channel_idx(hbn_vnode_handle_t vnode_fd, int32_t encoder, int32_t *channel_idx);
```

**Description**

See board-side `hbn_vpf_interface.h` (no doxygen; the signature is taken from the header file).

**Parameters**

<!-- TODO(Sx): 参数待头文件/板端核实 -->


### vnode_get_mode

**Function Prototype**

```c
int32_t vnode_get_mode(hbn_vnode_handle_t vnode_fd);
```

**Description**

See board-side `hbn_vpf_interface.h` (no doxygen; the signature is taken from the header file).

**Parameters**

<!-- TODO(Sx): 参数待头文件/板端核实 -->


## Related Documentation

- [Image Signal Processing - ISP](./05_isp_tune_api.md)
- [Basic Framework - HBN](./01_hbn_api.md)
- [SYS API](../../../04_Simple_API/01_multimedia_api/cdev/05_sys_api.md)