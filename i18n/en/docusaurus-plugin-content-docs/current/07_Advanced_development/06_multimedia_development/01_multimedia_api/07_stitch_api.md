---
sidebar_position: 7
title: "Image Stitching - STITCH"
description: "RDK S100/S600 5.5.1.7 STITCH (image stitching module)"
---


# Image Stitching - STITCH

> **Level description**: This chapter is the **STITCH module usage document** in the low-level multimedia API. In the HBN framework, STITCH is a vnode of type `HB_STITCH` (board header `hbn_sth_cfg.h`); it explains **what STITCH is, how to configure it, which interfaces it provides, and how it is typically used**. For the complete field table of the generic vnode interfaces, see [Base Framework - HBN](./01_hbn_api.md); for geometric correction, see [Geometric Distortion Correction - GDC](./08_gdc_api.md).

> **Platform codename note**: In the board-side `hb_vnode_type_e`, `HB_STITCH` is annotated as `Ultra/Super` — Ultra is an earlier-generation upstream platform codename, and Super is the codename of the architecture family shared by this product line.

> **Platform note**: S100 and S600 use the **byte-for-byte identical** STITCH driver source, with fully identical interfaces and specification limits; the only difference between the two boards is the **hardware address** (see [Hardware Specifications and Capability Limits](#hardware-specifications-and-capability-limits)). This document marks such entries with parallel `S100` / `S600` columns, where "same as S100" means the two boards agree. Every conclusion labelled **measured on board** in the body was measured on an **S100** board; the S600 board has not been re-measured item by item.

## Overview

STITCH is a vnode in the HBN framework. It **places multiple input frames into a single output canvas by ROI** and performs Alpha blending in the overlapping regions. A typical scenario is the 360° surround-view bird's-eye image: four fisheye cameras undergo IPM inverse perspective transformation in GDC, and STITCH then stitches them into a single top-down panoramic image.

To grasp its essence in one sentence: **STITCH is a "rectangle transfer + weighted blending in overlap regions" unit, not an image processing unit** — it does not scale, does not perform geometric transformation, and does not perform color conversion; whatever size goes in is the only size that comes out.

<details>
<summary>Expand: glossary</summary>

**Glossary**

| Abbreviation | Description |
| --- | --- |
| **STITCH** | Image stitching module, the subject of this document. Places multiple frames into one canvas by ROI and blends the overlapping regions |
| **ROI** | Region Of Interest, a rectangular area. STITCH uses the ROI as its only processing unit |
| **ichn** | Input channel. STITCH has 4 input channels, each corresponding to one source frame |
| **ochn** | Output channel. STITCH has only 1, which outputs the stitched canvas |
| **Canvas** | The entire image of the output channel. Each source frame lands at a specified position on it through an ROI |
| **Alpha blending** | Blends two source frames by weight in the overlap region. The weights can be generated automatically by the hardware or specified per pixel by a LUT |
| **LUT** | Look-Up Table. Stores the blending weight coefficients, 1 byte per pixel, packed tightly in ROI order |
| **IPM** | Inverse Perspective Mapping. Converts a ground image into a top-down view; performed by GDC |
| **vnode** | The HBN framework's abstraction of a functional module. STITCH is a vnode, operated through the `hbn_vnode_*` interfaces |
| **M2M** | Memory to Memory. STITCH inputs can only be bound in M2M mode; see [Pipeline Binding](#pipeline-binding) |

</details>

### Position of STITCH in the Pipeline

![Where STITCH sits in the camera pipeline](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/stitch/fig1-stitch-position.svg)

STITCH is a **standalone module**: it can either be fed frames directly from user space like `sample_gdc_stitch` (offline replay), or be bound after upstream nodes within a vflow. Both paths go through the same set of `hbn_vnode_*` interfaces.

### Division of Labor with GDC

The responsibilities of the two modules are easy to confuse; distinguishing these two words is enough:

| Module | What it does to the image | In one word |
| --- | --- | --- |
| **GDC** | Geometric correction: turns a distorted fisheye image into a top-down view (IPM) | **Changes the shape** |
| **STITCH** | Layout and blending: places multiple images onto one canvas and mixes the overlap regions by weight | **Places the position** |

So the typical order for surround-view stitching is `Camera → GDC(IPM) → STITCH → display/encode`. **STITCH does not perform distortion correction**; the images fed to it must already be corrected — otherwise the stitched seams will not line up.

> Note that this is a **typical usage** rather than a driver constraint: the STITCH driver does not check what the upstream is, and it will not stop you from connecting something other than GDC.

## Hardware Specifications and Capability Limits

| Item | S100 | S600 | Source |
| --- | --- | --- | --- |
| Input channels | **4** (`stitch0_ich0` ~ `stitch0_ich3`) | Same as S100 | driver source + S100 board sysfs |
| Output channels | **1** (`stitch0_och`) | Same as S100 | driver source + S100 board sysfs |
| ROIs per stitching operation | upper limit **12** (`MAX_STH_ROI_NUMS`) | Same as S100 | driver source (header shared by both boards) |
| Pixel format | **NV12** (dual plane); other formats are rejected at bind time | Same as S100 | driver source (header shared by both boards) |
| Scaling capability | **None**. Only 1:1 transfer and cropping | Same as S100 | driver source + measured on S100 board |
| Hardware IP context | a single IP supports up to **5** pipelines (`max_ctx = 5`) | Same as S100 | driver source (header shared by both boards) |
| `hw_id` | fixed at **0** | Same as S100 | driver source (header shared by both boards) |
| Hardware device node | `37c50000.videostitch` | `37c70000.videostitch` | device tree `reg`; S100 confirmed from the board kernel log |
| Reference clock | 600 MHz | Same as S100 | driver source (header shared by both boards) |

:::warning No scaling is the easiest trap

There is **no scaler** in the STITCH hardware. For each ROI, the source crop window and the destination placement **must have exactly the same size** — it has no ability to "scale 1920×1080 down to 640×480 and place that into the canvas".

To place frames of different sizes on the canvas, you must scale each path to the target cell size **before STITCH** (for example, the PYM node of each path). Measured on board: when the destination size of an ROI was changed to half of the source size, `hbn_vnode_getframe` returned `-41` on every frame, and the kernel reported `hw process faild, reg status = 0x2` and kept dropping frames.

:::

:::note Canvas size limit

The J6X manual *Image Media Module Debugging Manual* states that the maximum input and output size of STITCH is **3840×3840** and the minimum is 16×2 (width aligned to 16 bytes, height even).

Measured on board: a **3840×3840 canvas produces frames normally** (`hbn_vnode_getframe` returns 0, and the output buffer is 14,745,600 bytes = 3840²), so that size is indeed reachable on the RDK side. **Whether it is the actual maximum, and what happens beyond it, has not been measured**; no size limit validation was **found** in the RDK driver source either. Treat measurements as authoritative when planning.

:::

## Configuration Structures

STITCH has no function API of its own; everything is done through the generic HBN vnode interfaces, and the configuration is carried by four structs in `hbn_sth_cfg.h`.

The figure below is the placement result of one real stitching run; every struct field described afterwards can be mapped onto it:

![ROI placement and blending across multiple inputs](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/stitch/fig2-roi-layout.svg)

### stitch_base_attr

Global configuration, set through `hbn_vnode_set_attr`.

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| `mode` | `uint32_t` | Frame submission mode, see [Frame Submission Modes](#frame-submission-modes) | Yes |
| `roi_nums` | `uint32_t` | Number of ROIs in this stitching operation, **upper limit 12** | Yes |
| `img_nums` | `uint32_t` | Number of input images participating in stitching, value range 1~4 | Yes |
| `alpha_lut` | `struct lut_attr` | Alpha weight table; must be provided for the modes that use it | Conditionally required |
| `beta_lut` | `struct lut_attr` | Beta weight table; needed only in `ALPHA_BETA` mode | Conditionally required |
| `blending` | `struct blending_attr[12]` | Blending configuration, **one entry per ROI**, see below | Yes |

### stitch_ch_attr and roi_info

The input channel (`hbn_vnode_set_ichn_attr`) and the output channel (`hbn_vnode_set_ochn_attr`) share the same struct, but their **meanings are asymmetric**.

| Field | Type | Input channel | Output channel |
| --- | --- | --- | --- |
| `width` / `height` | `uint32_t` | Width and height of the source frame of this path, **must exactly match the incoming frame** | Canvas width and height |
| `strid[2]` | `uint32_t` | `strid[0]` = Y line stride, `strid[1]` = UV line stride | Same as above, describing the canvas |
| `rois[12]` | `struct roi_info` | **Only `roi_x` / `roi_y` are read**, used as the crop origin in the source frame | **`roi_x`/`roi_y` are the placement coordinates, `roi_w`/`roi_h` are the transfer block size** |

Both `width` and `strid` must be **16-byte aligned**. Measured on board: a 896×896 canvas (a multiple of 16) produced frames normally; after changing the width/height to 888×896 and setting `strid` to 888 as well (888 is even and *does* equal `width`, so the only rule it breaks is 16-byte alignment), `hbn_vnode_set_ochn_attr` returned `-22` directly. **The enforced rule is the alignment, not the equality between `strid` and `width`.**

:::info Two points that are easy to misunderstand

**1. `roi_w` / `roi_h` are meaningful only on the output channel, and one piece of data serves two purposes.** The driver treats the output channel's `roi_w`/`roi_h` as both "how much to read from the source frame" and "how much to write to the canvas" — there is **no independent source size field** in the configuration words. This is exactly how "no scaler" shows up in the data structure.

The driver **does not read** `roi_w` / `roi_h` on the input channel at all; filling in 0 is enough (the four input channels of the board sample `sample_gdc_stitch` are all filled with 0).

**2. The array index is the ROI number; the `roi_index` field is not read by the driver.** The driver takes `blending[i]`, `och_attr->rois[i]`, and `inch_attr[src].rois[i]` in the index order of `for (i = 0; i < roi_nums; i++)`. `roi_info.roi_index` / `blending_attr.roi_index` are merely descriptive fields for user space to look at; filling them in wrongly does not affect behavior — **but the order does affect the result** (later writes overwrite earlier ones, see [Configurations that raise no error but give a wrong result](#configurations-that-raise-no-error-but-give-a-wrong-result)).

:::

### blending_attr

One entry per ROI, describing "in what way and from which source frames this region is blended".

| Field | Type | Description | Value range |
| --- | --- | --- | --- |
| `blending_mode` | `uint32_t` | Blending mode, see [Blending Modes](#blending-modes) | 0 / 1 / 2 / 3 / 5 |
| `direct` | `uint32_t` | Blending direction, used only in Online mode | 0=top-left 1=bottom-right 2=bottom-left 3=top-right |
| `uv_en` | `uint32_t` | Whether to also transfer the UV components | 0 / 1 |
| `src0_index` | `uint32_t` | **Input channel number** of the first source frame | 0~3 |
| `src1_index` | `uint32_t` | Input channel number of the second source frame | 0~3 |
| `margin` | `uint32_t` | Transition band width (optional) | annotated as 0~127 in the driver source comments |
| `margin_inv` | `uint32_t` | Transition band inverse parameter (optional) | see the board sample values 0 / 128 |
| `gain_src0_yuv[3]` | `uint32_t` | Y/U/V gains for src0, used to balance brightness and chroma between the two paths | scaling: 256 = 1.0× |
| `gain_src1_yuv[3]` | `uint32_t` | Y/U/V gains for src1 | same as above |

`gain_src*_yuv` is an **array** (`[0]`=Y, `[1]`=U, `[2]`=V), not a single integer.

### lut_attr

Descriptor of the blending weight table.

| Field | Type | Description |
| --- | --- | --- |
| `share_id` | `int32_t` | hbmem share ID holding the LUT (return value of `hb_mem_alloc_com_buf`) |
| `offset` | `uint64_t` | Offset after the mapping base address |
| `size` | `uint64_t` | Table size (bytes). **The driver uses it only to decide "whether it exists"**: it is mapped only when `size > 0` |
| `vaddr` | `uint64_t` | User-space virtual address. **Not read by the driver**, for user space's own use only |

**The LUT layout is a hard constraint**: it is **packed tightly** in the array index order of the ROIs, each ROI occupying `roi_w × roi_h` bytes (1 byte per pixel). Only the modes that use a LUT occupy space:

| `blending_mode` | LUT consumed |
| --- | --- |
| `BLENDING_MODE_ONLINE` (0) | none |
| `BLENDING_MODE_ALPHA` (1) | alpha |
| `BLENDING_MODE_ALPHA_BETA` (2) | alpha + beta |
| `BLENDING_MODE_SRC` (3) | none |
| `BLENDING_MODE_ALPHA_SRC` (5) | alpha |

The board sample `sample_gdc_stitch` can serve as a worked example: it has 4 ROIs in `ALPHA` mode, with areas 390×282 + 388×284 + 390×196 + 390×196 = **373052** bytes, exactly matching the size `373052` of the `alpha_lut_apa.bin` file provided with the sample; the 4 `SRC` mode ROIs are not counted.

:::warning A missing LUT does not report an error, but the hardware fails

The driver decides whether to map the LUT solely by `size > 0`, and **does not check that "this mode must have a LUT"**. When `size = 0`, the table address handed to the hardware is `0` — `set_attr` succeeds, and the problem is exposed only at frame output time.

Measured on board: when an ROI was changed from `ALPHA` to `ALPHA_BETA` while the beta table was still empty (the sample's `blend_beta.bin` is 0 bytes), `hbn_vnode_getframe` returned `-41` on every frame, and the kernel reported `hw process faild, reg status = 0x40`.

:::

## Frame Submission Modes

`stitch_base_attr.mode` decides **where the source frames come from** (named `sth_working_mode` in the board header).

| Value | Enum | Description |
| --- | --- | --- |
| 0 | `STH_MODE_FB_EXTERNAL_BUF` | External buffer replay. Source frames are submitted by user space through `hbn_vnode_sendframe` |
| 1 | `STH_MODE_FB_INTERNAL_BUF` | Internal buffer replay |
| 2 | `STH_MODE_FLOW` | flow binding mode. Source frames come from the upstream nodes bound in the vflow; user space does not send frames |

The point where the two behaviors diverge in the driver is the **frame synchronization method**: `FLOW` aligns the multiple inputs by timestamp (threshold 15 ms), while the replay modes trigger as soon as channel 0 arrives. In the replay modes, the driver also moves the input buffer from `FS_COMPLETE` back to `FS_USED` and returns it to user space itself; `FLOW` mode does not do this.

:::caution Passing the `STH_MODE_INVAIL` enum value has no effect

The header also has `STH_MODE_INVAIL = 3`, but **the driver never references it**, nor is there any mode validity check. Passing 3 does not report an error; it silently takes the replay path. Do not rely on "an invalid value will be rejected".

:::

## Blending Modes

`blending_attr.blending_mode` decides **how each individual ROI is blended** (named `sth_blending_mode` in the board header); it is unrelated to the frame submission mode above.

| Value | Enum | Needs LUT | Hardware behavior |
| --- | --- | --- | --- |
| 0 | `BLENDING_MODE_ONLINE` | No | The hardware computes the weights automatically from the transition band width and the `direct` direction. **Requires the ROI width and height to be equal** |
| 1 | `BLENDING_MODE_ALPHA` | alpha | Reads the alpha table for per-pixel weighted blending |
| 2 | `BLENDING_MODE_ALPHA_BETA` | alpha + beta | Reads the alpha and beta tables for weighted blending |
| 3 | `BLENDING_MODE_SRC` | No | **Copies src0 directly**, pixel by pixel unchanged |
| 5 | `BLENDING_MODE_ALPHA_SRC` | alpha | Reads the alpha table and blends with src0 |

> Note that the enum values are `0,1,2,3,5` — **there is no 4**.

The "direct copy" of `BLENDING_MODE_SRC` was verified on board byte by byte: comparing the 4 SRC-mode ROIs of the sample output against the corresponding GDC output pixel by pixel, **MAD = 0, maximum pixel difference = 0, 100% identical**.

## API Call Flow

1. `hbn_vnode_open(HB_STITCH, hw_id, AUTO_ALLOC_ID, &handle)` opens the node; `hw_id` is fixed at 0.
2. Allocate the LUT buffer (`hb_mem_alloc_com_buf`) and write the table data into it; flush the cache with `hb_mem_flush_buf_with_vaddr`; fill `share_id` / `size` / `offset` into `stitch_base_attr`.
3. `hbn_vnode_set_attr(handle, &base_attr)` sets in the global configuration.
4. `hbn_vnode_set_ichn_attr(handle, i, &inch_attr[i])` sets in the input channel attributes path by path.
5. `hbn_vnode_set_ochn_attr(handle, 0, &och_attr)` sets in the output canvas attributes.
6. `hbn_vnode_set_ochn_buf_attr(handle, 0, &alloc_attr)` sets the output buffer allocation method.
7. `hbn_vnode_start(handle)` starts it.
8. Per frame: `hbn_vnode_sendframe` each path's source frame to the corresponding input channel → `hbn_vnode_getframe(handle, 0, ...)` retrieves the stitched result → `hbn_vnode_releaseframe` returns it when done.
9. Cleanup: `hbn_vnode_stop` + `hbn_vnode_close`.

> In internal buffer mode and flow binding mode, the frame submission in step 8 is different (allocated by the driver and supplied directly by upstream nodes respectively); see [Frame Submission Modes](#frame-submission-modes).

## Quick Example

The excerpt below is taken from the board sample `sample_gdc_stitch` and is the core configuration for "stitching four views into a single 896×896 surround-view image". The complete compilable version is on the board at `/app/multimedia_demo/camsys_demo/sample_gdc_stitch/`.

```c
struct stitch_base_attr base_attr = {
	.mode     = STH_MODE_FB_EXTERNAL_BUF,
	.roi_nums = 8,
	.img_nums = 4,
	.alpha_lut = { .share_id = alpha_share_id, .size = 373052 },
	.beta_lut  = { .share_id = 0, .size = 0 },
	.blending = {
		/* ROI0: the whole left view is copied directly, the source is input channel 2 */
		{ .blending_mode = BLENDING_MODE_SRC, .uv_en = 1,
		  .src0_index = 2, .src1_index = 2,
		  .gain_src0_yuv = {256, 256, 256}, .gain_src1_yuv = {256, 256, 256} },
		/* Overlap corner of ROI0 and ROI1: alpha blending */
		{ .blending_mode = BLENDING_MODE_ALPHA, .uv_en = 1,
		  .src0_index = 2, .src1_index = 1, .margin = 10,
		  .gain_src0_yuv = {256, 256, 256}, .gain_src1_yuv = {256, 256, 256} },
		/* ... remaining ROIs ... */
	}
};

/* Input channel: only the crop origin is given; width and height must match the incoming frame */
struct stitch_ch_attr inch_attr[4] = {
	{ .width = 896, .height = 298, .strid = {896, 896},
	  .rois = { [2] = { .roi_x = 0, .roi_y = 0 } } },
	/* ... */
};

/* Output channel: canvas size + the placement and transfer block size of each ROI */
struct stitch_ch_attr och_attr = {
	.width = 896, .height = 896, .strid = {896, 896},
	.rois = {
		[0] = { .roi_x =   0, .roi_y =  16, .roi_w = 390, .roi_h = 778 },
		[1] = { .roi_x = 506, .roi_y =  14, .roi_w = 390, .roi_h = 780 },
		/* ... */
	}
};
```

## Pipeline Binding

When STITCH is bound into a vflow, **only `CHN_BIND_M2M` is supported**; other binding types are rejected by the driver with `-EINVAL`.

Binding happens when the output channel is set: the driver compares the **upstream channel attributes** against the `width`/`height`/`strid[0]` that you configured on the input channel, **field by field for equality** — if any of the three differs, it returns `-EINVAL`; the corresponding log strings are listed under [Configurations that are rejected](#configurations-that-are-rejected).

A typical binding: each path forms an independent chain `VIN → ISP → YNR → PYM`, the PYM at the end scales the frame down to the cell size, and it is then bound to the i-th input channel of STITCH; the STITCH output goes to display.

## Constraints and Notes

### Configurations that are rejected

| Constraint | Symptom |
| --- | --- |
| Binding type is not `CHN_BIND_M2M` | `-EINVAL`, log `stitch only support CHN_BIND_M2M` |
| `roi_nums > 12` | `hbn_vnode_set_attr` returns `-22` |
| `width` / `strid` is not 16-byte aligned | `hbn_vnode_set_ochn_attr` returns `-22` |

### Configurations that raise no error but give a wrong result

These items **do not return an error**, yet the image is wrong; they are more worth checking one by one than the category above:

| Pitfall | Consequence |
| --- | --- |
| **ROI size differs from the source crop size** | The hardware reports `reg status = 0x2` and drops frames; frame retrieval returns `-41`. STITCH will not scale for you |
| **A LUT is not provided for a mode that requires one** | The hardware reports `reg status = 0x40` and drops frames; frame retrieval returns `-41`. No error is reported at the `set_attr` stage |
| **The write order of overlapping ROIs** | ROIs are written in index order `0 → roi_nums-1`, and **later writes overwrite earlier ones**. In an overlap region, the blending ROI must come after the ROI being overlapped, otherwise the blending result is covered by the later direct copy |
| **Incoming frame does not match the channel attributes (`width` / `height` / `strid[0]`, or the format is not NV12)** | `sendframe` still accepts the frame; the driver drops it, `getframe` returns `-8`, and the kernel prints `drop frame, drop_flag = 1` |
| **Areas of the canvas not covered by any ROI are not written** | They keep the buffer as it is. When a newly allocated buffer is uninitialized, Y=U=V=0, and rendering it to RGB gives **pure green** rather than black — do not let that color mislead you during troubleshooting |
| `roi_x` / `roi_y` filled with odd numbers | The UV plane address is computed as an integer division of `roi_y / 2`, so odd rows are rounded down and the driver reports no error. **It is recommended to fill in even numbers** |

## Troubleshooting

### Common Return Codes

STITCH's own error codes are **composite codes**: the module number `HB_STITCH` (= 10) shifted left by 16 bits and OR'ed with a generic error code; what user space sees is its negative value, which is more intuitive written in hexadecimal (starting with `0x0A`).

| Return value | Hexadecimal | Macro | Meaning |
| --- | --- | --- | --- |
| `-655368` | `0x0A0008` | `HBN_STATUS_STH_INVALID_NULL_PTR` | a null pointer was passed |
| `-655369` | `0x0A0009` | `HBN_STATUS_STH_INVALID_PARAMETER` | invalid parameter on the STITCH side |
| `-655389` | `0x0A001D` | `HBN_STATUS_STH_OPEN_OCHN_FAIL` | failed to open the output channel |
| `-655390` | `0x0A001E` | `HBN_STATUS_STH_OPEN_ICHN_FAIL` | failed to open the input channel |
| `-655407` | `0x0A002F` | `HBN_STATUS_STH_INIT_BIND_ERROR` | binding initialization failed |
| `-655411` | `0x0A0033` | `HBN_STATUS_STH_INVALID_VERSION` | version mismatch |

Generic codes (not limited to STITCH):

| Return value | Macro | Meaning and next step |
| --- | --- | --- |
| `-8` | `HBN_STATUS_INVALID_NULL_PTR` | null pointer |
| `-22` | `-EINVAL` | **Watch out for the number collision**: on the driver validation path `-22` is the kernel's `-EINVAL`, not `HBN_STATUS_NOT_INITIALIZED` (that macro also happens to be 22). This is what you see when an attribute is misconfigured |
| `-41` | `HBN_STATUS_NODE_POLL_HUP` | **The most typical signal of a STITCH hardware error**. When hardware processing fails, the driver posts `VIO_FRAME_HUP` to the frame retrieval queue, so the retrieving side gets `-41` instead of an ordinary timeout. When you see it, go straight to `hw process faild` in the kernel log |

### Hardware Error Bits

When hardware processing fails, the kernel log prints a line `hw process faild, reg status = 0x??`, where different errors correspond to different bits. Two have been measured on board:

| `reg status` | Trigger condition | How it was reproduced in the measurement |
| --- | --- | --- |
| `0x2` | invalid ROI size (source and destination sizes do not match) | change an ROI's destination size to half of the source |
| `0x40` | `ALPHA_BETA` mode missing the beta LUT | change an ROI from `ALPHA` to `ALPHA_BETA` and leave the beta table empty |

Typical log sequence (when a hardware error occurs):

```
[E|STITCH|hobot_stitch_ops.c]: [sth_handle_interrupt][C0] hw process faild, reg status = 0x2
[W|STITCH|hobot_stitch_ops.c]: [sth_process_done][C0] drop frame, drop_flag = 2
[E|STITCH|hobot_stitch_ops.c]: [sth_handle_interrupt][C0] reset done, reg status = 0x80
```

### Debug Nodes

The nodes are under `stitch0_ich0` (this group of nodes does not exist under the output channel `stitch0_och`):

```bash
cat /sys/class/vps/stitch0_ich0/loading        # hardware occupancy, 200 ms sampling by default
cat /sys/class/vps/stitch0_ich0/hw_timeout     # hardware timeout, 1000 ms by default
cat /sys/class/vps/stitch0_ich0/debug_switch   # debug switch, 0 by default
cat /sys/class/vps/stitch0_ich0/regdump        # register snapshot (read-only; temporarily enables the clock when read)
```

- `loading` accepts a writable sampling window: `echo 1000 > .../loading` (range `(0, 10000]` ms; filling in 0 falls back to the default).
- After `debug_switch` is set to 1, each trigger prints 16 configuration words × the contents of each ROI, which is most useful when checking whether the ROI configuration actually takes effect.
- The frame rate is not on the STITCH node; look at the flow-level `/sys/class/vps/flow/fps`.

### Kernel Log Switch

```bash
echo "file hobot_stitch_ops.c +p" > /sys/kernel/debug/dynamic_debug/control
echo "file hobot_dev_stitch.c +p" > /sys/kernel/debug/dynamic_debug/control
```

### Common Log Messages

| Log | Meaning |
| --- | --- |
| `hw process faild, reg status = 0x??` | hardware processing failed, see [Hardware Error Bits](#hardware-error-bits) |
| `drop frame, drop_flag = 2` | the frame was dropped by the hardware, and the retrieving side gets `-41` |
| `lost input frame` / `will replace with black frame` | an input path did not arrive on time and the driver substitutes a zero-filled frame (Y=U=V=0, which renders as green rather than black). **The output is still "successful"** at this point; only that path's region shows the substituted content |
| `have no output buffer` | there is no available buffer in the output queue and the whole frame is dropped in software. Check whether `getframe` / `releaseframe` are paired |
| `wrong resolution` / `wrong stride` / `wrong frame format` | bind-time check: the upstream channel attributes differ from the `width` / `height` / `strid[0]` configured on the input channel (see the binding section) |
| `can not get synced_node from kfifo, please check` | multi-path frame synchronization failed |

## FAQ

### Can STITCH do cropping only, without blending?

Yes. Use `BLENDING_MODE_SRC`; all it does is purely "crop a block from the source frame by ROI and transfer it onto the canvas as-is", pixel by pixel unchanged. It was measured on board to be **completely identical** to the source frame.

### How can I output frames at different resolutions?

STITCH does not scale, but you can **change the output content by cropping with ROIs**: the canvas size is determined by `och_attr.width/height`, and only the rectangles covered by the individual ROIs are actually written. To make a given path's frame smaller, you must shrink it upstream (PYM) first.

### How many ROIs can a single input be split into at most?

Bounded by the `roi_nums` upper limit of 12 and by the fact that one ROI blends only two source frames, a canvas can hold at most 12 rectangles. The board sample uses 8 (4 direct copies + 4 overlap corner blends).

### Can it support more than 4 inputs?

No. The hardware input channels are fixed at 4 (`stitch0_ich0` ~ `stitch0_ich3`). When more paths are needed, either stitch in several stages or combine them upstream first.

### Does the output buffer need a cache flush?

Yes. The board sample passes `HB_MEM_USAGE_CACHED` in `hbn_vnode_set_ochn_buf_attr` and performs cache operations after frame retrieval; the application side must ensure cache coherency before reading `virt_addr`, otherwise it will read stale data.

## Correspondence with the J6X Manual API

STITCH knowledge is scattered across two documentation systems. **The J6X *Image Media Module Debugging Manual* describes another set of software interfaces (VAPI `hb_videostitch_*`)**, which is not the same API as the RDK HBN vnode — the hardware semantics, constraints, and debug nodes can be transferred directly, but the interface names do not match, and copying them verbatim will produce errors.

| J6X manual (VAPI) | RDK (HBN vnode) |
| --- | --- |
| `hb_videostitch_init` / `hb_videostitch_deinit` | `hbn_vnode_open(HB_STITCH, ...)` / `hbn_vnode_close` |
| `hb_videostitch_set_cfg(mode, roi_num, roi_cfg, lut, cgp_addr)` | `hbn_vnode_set_attr` + `hbn_vnode_set_ichn_attr` + `hbn_vnode_set_ochn_attr` |
| `hb_videostitch_blending_process(src_frames, dst_frame)` | `hbn_vnode_sendframe` per path + `hbn_vnode_getframe` for the result |
| `hb_videostitch_releaseframe` | `hbn_vnode_releaseframe` |
| `STITCH_MODE_EXTERNAL_BUF` / `STITCH_MODE_INTERNAL_BUF` | `mode = 0` / `mode = 1` |
| (no equivalent) | `mode = 2` (`STH_MODE_FLOW`, the flow binding unique to vnodes) |
| the 5 hardware working modes | the 5 values of `blending_mode`, **in one-to-one correspondence** |

The hardware semantics (the behavior of the 5 blending modes, per-pixel LUT weighting, no scaling) are the same set on both sides; the J6X manual describes them in more detail and can serve as supplementary reading.

## Related Documentation

- [Base Framework - HBN](./01_hbn_api.md) — generic vnode interfaces, channel binding, and the `stitch_*` struct field tables
- [Geometric Distortion Correction - GDC](./08_gdc_api.md) — IPM inverse perspective transformation, the upstream of surround-view stitching
- [Video Processing Framework - VPF/PYM](./06_vpf_pym_api.md) — scaling and pyramid, the upstream of video-wall scenarios
- [Video Input - VIN](./04_vin_api.md) — camera capture
- Board sample: `/app/multimedia_demo/camsys_demo/sample_gdc_stitch/` (offline GDC+STITCH surround view)
