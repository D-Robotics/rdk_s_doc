---
sidebar_position: 4
title: "Video Input - VIN"
description: "RDK S100/S600 5.5.1.4 VIN (Video Input)"
---

# Video Input - VIN

## Overview
VIN (Video In) is a vnode in the HBN framework. It brings camera data into the SoC and hands it to the downstream stages. It is the first stage of the camera pipeline and is built from four sub-modules:

- **MIPI RX** — receives the MIPI CSI-2 stream, D-PHY / C-PHY; each RX supports several virtual channels (VC)
- **CIM** — Camera Interface Manager. Distributes images from RX to the next stage (Online) or writes them to DDR (Offline)
- **LPWM** — exposure trigger and frame sync pulses, for sensors that need external triggering
- **VCON** — a virtual device describing the hardware interfaces (I2C buses / POC / GPIO / MIPI PHY type). It offers a standardised connection view upward, with the differences realised in the dts

The responsibilities and bring-up limits of MIPI RX and the CIM are in [Hardware Block Diagram](#hardware-block-diagram) and [Hardware Specification](#hardware-specification).

## Hardware Block Diagram

<DocScope products="RDK S100">

![Media pipeline hardware overview: Camera → MIPI Host → CIM → CPE (ISP / PYM / GDC / STITCH) → IDU](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/media-pipeline-overview.jpeg)

</DocScope>

<DocScope products="RDK S600">

![S600 media pipeline hardware overview: 6 cameras, MIPI RX0-5, CIM0-5, CPE0-3 (ISP / PYM) and CPElite, offline via DDR](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/media-pipeline-overview-s600.png)

</DocScope>

*Media pipeline hardware overview — VIN is the input segment of it: MIPI RX and the CIM.*

![Structure of MIPI RX and the CIM](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/mipi-cim-structure.png)

*On the MIPI-RX side, IPI0-3 feed the CIM, whose four channels each carry input select, ROI, DEC, RAWDS and outputs.*

The MIPI side, from the physical layer up to the interface:

- **C-PHY / D-PHY** — the MIPI physical layer
- **CSI2 Host** — the CSI-2 protocol controller; parses packets and splits them by virtual channel
- **VC0 – VC3** — the MIPI CSI-2 virtual channels. One physical link tells several streams apart by VC
- **IPI0 – IPI3** — the **on-chip** data path between MIPI RX and the CIM, not an external protocol; one camera stream occupies one IPI
- **IDI** — the Image Data Interface

The CIM is only about taking data in and sending it out: the input is four IPIs, and the output maps to the software output channels — main frame, ROI and EMB. Per-channel limits are in [Hardware Specification](#hardware-specification).

## Hardware Specification

### MIPI RX
<DocScope products="RDK S100">

- MIPI RX ports: 3
- Lanes / trios per RX: D-PHY ≤ 4 lanes; C-PHY ≤ 3 trios
- Rate per lane / trio: D-PHY 80–4500 Mbps; C-PHY 80–3500 Msps
- PHY ceiling per RX: **D-PHY 18 Gbps** (4 × 4.5); **C-PHY about 23.94 Gbps** (3 × 3.5 × 2.28)
- Virtual channels (VC) per RX: 4

</DocScope>

<DocScope products="RDK S600">

- MIPI RX ports: 6
- Lanes / trios per RX: D-PHY ≤ 4 lanes; C-PHY ≤ 3 trios
- Rate per lane / trio: D-PHY 80–4500 Mbps; C-PHY 80–3500 Msps
- PHY ceiling per RX: **D-PHY 18 Gbps** (4 × 4.5); **C-PHY about 23.94 Gbps** (3 × 3.5 × 2.28)
- Virtual channels (VC) per RX: 4

</DocScope>

How the MIPI RX ports map to the CIM instances is in the [Hardware Block Diagram](#hardware-block-diagram).

### CIM
One CIM per MIPI RX — three on S100, six on S600.

<DocScope products="RDK S100">

- IPI channels per CIM: 4
- IPI pixel clock (nominal): 600 MHz
- Max input width per IPI: **CIM0** `IPI0` 5696 px, the rest 4096 px; **CIM1** / **CIM4** all 4096 px

</DocScope>

<DocScope products="RDK S600">

- IPI channels per CIM: 4
- IPI pixel clock (nominal): 670 MHz
- Max input width per IPI: **CIM0** / **CIM1** / **CIM2** all 5696 px; **CIM3** / **CIM4** / **CIM5** all 4096 px

</DocScope>

### LPWM
<DocScope products="RDK S100">

- LPWM instances / channels: 3 / 12

</DocScope>

<DocScope products="RDK S600">

- LPWM instances / channels: 4 / 16

</DocScope>

## Usage

### Bring-up Sizing

Complete the bandwidth assessment before bring-up:

- **Per-camera data rate** = width × height × fps × bit depth × k. Bit depth: 12 for RAW12, 16 for YUV422. k is the blanking factor; use 1.4 for RAW and 1.2 for YUV as estimates, and the exact line/frame totals from the module datasheet
- **Ceilings** are per-RX budgets shared by all cameras on the same RX:

<DocScope products="RDK S100">

| Check | Ceiling (sum over all cameras on the RX) |
| --- | --- |
| PHY · D-PHY | 4 lanes × 4.5 Gbps = 18 Gbps |
| PHY · C-PHY | 3 trios × 3.5 Gsps × 2.28 = 23.94 Gbps |
| IPI · RAW only | 600 MHz × 3 pixels/clock × 12 bit = 21.6 Gbps |
| IPI · any YUV camera | 600 MHz × 1 pixel/clock × 16 bit = **9.6 Gbps** |
| VC count | 4 |

</DocScope>

<DocScope products="RDK S600">

| Check | Ceiling (sum over all cameras on the RX) |
| --- | --- |
| PHY · D-PHY | 4 lanes × 4.5 Gbps = 18 Gbps |
| PHY · C-PHY | 3 trios × 3.5 Gsps × 2.28 = 23.94 Gbps |
| IPI · RAW only | 670 MHz × 3 pixels/clock × 12 bit = 24.1 Gbps |
| IPI · any YUV camera | 670 MHz × 1 pixel/clock × 16 bit = **10.72 Gbps** |
| VC count | 4 |

</DocScope>

- The IPI ceiling is independent of the PHY type: RAW transfers 3 pixels per clock, YUV only 1. When any YUV camera is present on the RX, the IPI ceiling follows the YUV figure; switching to C-PHY then relaxes only the PHY limit and leaves the IPI ceiling unchanged
- **When a ceiling is exceeded, adjust in this order**: compress the module blanking to lower k, with no configuration change or quality loss → reduce the frame rate or resolution → move cameras to another RX, available counts in [MIPI RX](#mipi-rx) → switch to C-PHY, effective for all-RAW cases only

**Worked example: 4× 8M RAW12@30fps**

8M counts as 3840 × 2160: bit depth 12, k = 1.4 — per camera = 3840 × 2160 × 30 × 12 × 1.4 ≈ **4.18 Gbps**, four in total **16.72 Gbps**, against the ceilings:

<DocScope products="RDK S100">

| Check | Ceiling | 4 cameras | Used |
| --- | --- | --- | --- |
| PHY · D-PHY | 18 Gbps | 16.72 Gbps | 93% |
| PHY · C-PHY | 23.94 Gbps | 16.72 Gbps | 70% |
| IPI · RAW only | 21.6 Gbps | 16.72 Gbps | 77% |

</DocScope>

<DocScope products="RDK S600">

| Check | Ceiling | 4 cameras | Used |
| --- | --- | --- | --- |
| PHY · D-PHY | 18 Gbps | 16.72 Gbps | 93% |
| PHY · C-PHY | 23.94 Gbps | 16.72 Gbps | 70% |
| IPI · RAW only | 24.1 Gbps | 16.72 Gbps | 69% |

</DocScope>

**Conclusion**: four RAW12 cameras run under D-PHY at 93% occupancy; that is tight, and holding full frame rates takes shrinking blanking. Under C-PHY occupancy drops to 70%.

> Size with **blanking included**, never with active-pixel figures; and confirm the deserialiser link rate on top of the PHY. This section only sizes bandwidth — output paths are covered in [Usage](#usage).

![Frame lifecycle from trigger to release](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/fig2-frame-lifecycle.svg)

The data CIM captures has two possible destinations, decided by three fields in `vin_attr_t`:

| Field | Meaning |
| --- | --- |
| `vin_node_attr.cim_attr.cim_isp_flyby = 1` | CIM connects directly to ISP (Online) |
| `vin_node_attr.cim_attr.cim_pym_flyby = 1` | CIM connects directly to PYM (Online) |
| `vin_ochn_attr[x].ddr_en = 1` | This output channel writes to DDR (Offline) |

`vin_node_attr.cim_attr.cim_isp_flyby` and `vin_node_attr.cim_attr.cim_pym_flyby` are **mutually exclusive** — only one can be 1 at a time. The main frame can land in DDR *and* be sent OTF to the ISP at the same time, at the cost of bandwidth.

#### Online (OTF)
Data captured by CIM **never lands in DDR** — it goes straight to the ISP or PYM over a direct hardware connection.

- Pro: no DDR bandwidth consumed, low latency
- Limits: only the main-frame channel supports Online; the ROI and EMB bypasses do not; CIM and the downstream block must be in the same CPE

#### Offline (DDR)
CIM writes the data to DDR and the downstream module or user space reads it back from memory.

- Pro: all three output channels (main frame / ROI / EMB) are available, and cross-CPE works
- Cost: CIM writes it once and downstream reads it once, so bandwidth doubles and latency is higher

#### Selection Criteria
| Your case | Recommendation | Why |
| --- | --- | --- |
| Single RAW sensor | **Online first** | Lower latency; switch to Offline if you need ROI / EMB or want to store frames |
| Multiple camera sensors | **Offline** | Multiple cameras are usually spread across CPEs, and Online requires CIM and downstream to share a CPE |
| Need embedded data (EMB) | **Offline** | EMB can only go through DDR |
| Need cropped ROI output | **Offline** | The ROI channel does not support Online |
| YUV sensor (ISR done inside the sensor) | Depends on the downstream | With Online it connects directly to PYM, and each PYM takes exactly one input exclusively; multiple YUV streams can only go Offline |

#### Typical Combinations
The four IPIs of one CIM can **mix** Online and Offline, feeding different downstream blocks. Four typical combinations:

![Typical CIM combinations: four scenarios](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/scenes/cim-scenes-zh.png)

### API Call Flow
![API call flow: 11 grouped calls from opening the module to closing the vnode, with the per-frame loop](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/fig4-api-flow.png)

<details>
<summary>Expand: function call reference</summary>

The 12 steps of the diagram above, in the order the application calls them:

1. `hb_mem_module_open()` — open the hb_mem module; required before allocating or importing frame buffers
2. `hbn_camera_create(camera_config)` — create the camera object
3. `hbn_vnode_open(HB_VIN, hw_id, AUTO_ALLOC_ID, &handle)` — open one VIN instance; `hw_id` is the MIPI RX channel number
4. `hbn_vnode_set_attr(handle, &vin_attr)` — hand over the whole configuration in one call. `vin_attr_t` holds `vin_node_attr` (`cim_attr` / `vcon_attr` / `lpwm_attr`), `vin_attr_ex`, `vin_ichn_attr`, `vin_ochn_attr[VIN_TYPE_INVALID]` and `vin_ochn_buff_attr[VIN_TYPE_INVALID]`
5. Channel attributes and buffers, three calls:
   - `hbn_vnode_set_ichn_attr(handle, ichn_id, &ichn_attr)` — set the input channel's width, height and format
   - `hbn_vnode_set_ochn_attr(handle, ochn_id, &ochn_attr)` — set output channels one by one; `ochn_id` is `0` main frame / `4` ROI / `3` EMB
   - `hbn_vnode_set_ochn_buf_attr(handle, ochn_id, &alloc_attr)` — give the DDR-bound channels their buffer count and memory attributes
6. `hbn_vflow_create()` / `hbn_vflow_add_vnode()` / `hbn_vflow_bind_vnode()` — create the flow, put VIN on it, bind the downstream
7. `hbn_camera_attach_to_vin()` — attach the sensor to VIN
8. `hbn_vflow_start()` — start the whole flow. Without vflow, `hbn_vnode_start(handle)` works too
9. `hbn_vnode_getframe(handle, ochn_id, timeout, &img)` — fetch a frame
   - Between fetching and returning runs the **user's own logic** (inference, encoding, display and so on, on that frame)
10. `hbn_vnode_releaseframe(handle, ochn_id, &img)` — return it when done
11. `hbn_vflow_stop()` — stop the flow
12. `hbn_vnode_close(handle)` — release the vnode

> For DDR feedback (RDMA), use `hbn_vnode_sendframe(handle, ichn_id, &img)` to push a frame into the input channel instead.

</details>

### Quick Example
For how to build and run the complete board samples, their command-line arguments and expected output, see the sample documents:

<DocScope products="RDK S100">

- [sample_vin](../02_multimedia_sample/02_sample_vin.md) — single and multiple stream capture
- [sample_pipeline](../02_multimedia_sample/09_sample_pipeline.md) — a full VIN → ISP → YNR → PYM → GDC / codec path

</DocScope>

<DocScope products="RDK S600">

- [sample_vin](../02_multimedia_sample_s600/02_sample_vin.md) — single and multiple stream capture
- [sample_pipeline](../02_multimedia_sample_s600/09_sample_pipeline.md) — a full VIN → ISP → YNR → PYM → GDC / codec path

</DocScope>

```c
#include <stdio.h>
#include "hbn_vpf_interface.h"
#include "hbn_vin_cfg.h"
#include "hb_mem_mgr.h"

#define AUTO_ALLOC_ID  (-1)   /* the framework allocates */

#define VIN_HW_ID 0     /* the MIPI RX channel number */
#define OCHN_MAIN 0     /* VIN_MAIN_FRAME */

static vin_attr_t vin_attr = {
    .vin_node_attr = {
        .cim_attr = {
            .mipi_en      = 1,       /* input source: MIPI */
            .mipi_rx      = VIN_HW_ID,
            .vc_index     = 0,
            .ipi_channels = 1,
            .func = { .enable_frame_id = 1, .set_init_frame_id = 1 },
        },
        .vcon_attr = { .bus_main = 2, .bus_second = 2 },
        .magicNumber = 0x12345678,
    },
    .vin_ichn_attr = {
        .width  = 1920,
        .height = 1080,
        .format = 43,               /* use the sensor's actual output format */
    },
    .vin_ochn_attr = {
        [OCHN_MAIN] = {
            .ddr_en = 1,            /* main frame to DDR (Offline) */
            .vin_basic_attr = { .format = 43, .wstride = 0, .pack_mode = 1 },
            .magicNumber = 0x12345678,
        },
    },
    .vin_ochn_buff_attr = { [OCHN_MAIN] = { .buffers_num = 6 } },  /* read only by the JSON stream-creation path; this example relies on set_ochn_buf_attr */
    .magicNumber = 0x12345678,
};

int main(void)
{
    hbn_vnode_handle_t vin_fd;
    hbn_vflow_handle_t vflow_fd;
    hbn_buf_alloc_attr_t alloc_attr = {0};
    hbn_vnode_image_t img;
    int32_t ret;

    hb_mem_module_open();

    ret = hbn_vnode_open(HB_VIN, VIN_HW_ID, AUTO_ALLOC_ID, &vin_fd);
    if (ret < 0) return ret;

    ret = hbn_vnode_set_attr(vin_fd, &vin_attr);
    if (ret < 0) return ret;
    ret = hbn_vnode_set_ichn_attr(vin_fd, 0, &vin_attr.vin_ichn_attr);
    if (ret < 0) return ret;
    ret = hbn_vnode_set_ochn_attr(vin_fd, OCHN_MAIN, &vin_attr.vin_ochn_attr[OCHN_MAIN]);
    if (ret < 0) return ret;

    alloc_attr.buffers_num = 6;   /* the buffer count that actually takes effect is set here */
    alloc_attr.is_contig   = 1;
    alloc_attr.flags = HB_MEM_USAGE_CPU_READ_OFTEN | HB_MEM_USAGE_CPU_WRITE_OFTEN | HB_MEM_USAGE_CACHED;
    ret = hbn_vnode_set_ochn_buf_attr(vin_fd, OCHN_MAIN, &alloc_attr);
    if (ret < 0) return ret;

    hbn_vflow_create(&vflow_fd);
    hbn_vflow_add_vnode(vflow_fd, vin_fd);
    hbn_vflow_start(vflow_fd);

    if (hbn_vnode_getframe(vin_fd, OCHN_MAIN, 10000, &img) == 0) {
        printf("frame_id=%u, fd=%d\n", img.info.frame_id, img.buffer.fd[0]);
        hbn_vnode_releaseframe(vin_fd, OCHN_MAIN, &img);
    }

    hbn_vflow_stop(vflow_fd);
    hbn_vflow_destroy(vflow_fd);
    hbn_vnode_close(vin_fd);
    hb_mem_module_close();
    return 0;
}
```

## API Reference

### API List
VIN reuses the generic HBN vnode interfaces and has no private ioctl of its own. The commonly used interfaces:

| Interface | Purpose |
| --- | --- |
| [`hbn_vnode_open`](#hbn_vnode_open) | Open a VIN vnode |
| [`hbn_vnode_close`](#hbn_vnode_close) | Close a VIN vnode |
| [`hbn_vnode_set_attr`](#hbn_vnode_set_attr) | Set the module's basic attributes (`vin_attr_t`) |
| [`hbn_vnode_set_ichn_attr`](#hbn_vnode_set_ichn_attr) | Set input channel attributes (`vin_ichn_attr_t`) |
| [`hbn_vnode_get_ichn_attr`](#hbn_vnode_get_ichn_attr) | Read input channel attributes |
| [`hbn_vnode_set_ochn_attr`](#hbn_vnode_set_ochn_attr) | Set output channel attributes (`vin_ochn_attr_t`) |
| [`hbn_vnode_get_ochn_attr`](#hbn_vnode_get_ochn_attr) | Read output channel attributes |
| [`hbn_vnode_set_ochn_buf_attr`](#hbn_vnode_set_ochn_buf_attr) | Set output channel buffer attributes |
| [`hbn_vnode_start`](#hbn_vnode_start) | Start the vnode |
| [`hbn_vnode_stop`](#hbn_vnode_stop) | Stop the vnode |
| [`hbn_vnode_getframe`](#hbn_vnode_getframe) | Fetch a frame |
| [`hbn_vnode_releaseframe`](#hbn_vnode_releaseframe) | Release a frame |
| [`hbn_vnode_sendframe`](#hbn_vnode_sendframe) | Push a frame into an input channel (DDR feedback) |

Stream creation and binding use `hbn_vflow_create` / `hbn_vflow_add_vnode` / `hbn_vflow_bind_vnode` / `hbn_vflow_start` / `hbn_vflow_stop` / `hbn_vflow_destroy`; see [Framework - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api).

### Interface Reference
All 13 interfaces below share two conventions, which the individual sections do not repeat.

- **Return value**: `HBN_STATUS_SUCESS` (0) on success, a negative error code on failure (implemented as `-HBN_STATUS_xxx`). The full list is in [Framework - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api#return-value-description) — note that it lists the codes as **positive** (`10`, `13`, …) while the interfaces return them **negated** (`-10`, `-13`, …); the codes VIN actually returns, with what to do about each, are in [Return Values](#return-values).
- **Five macros**: `set_attr` / `set_ichn_attr` / `get_ichn_attr` / `set_ochn_attr` / `get_ochn_attr` forward to the same-named functions with an `_s` suffix, taking the length from `sizeof(*(attr))`. They therefore **cannot take a `void *`**: you must pass a pointer to the concrete type.

#### hbn_vnode_open

**【Function Prototype】**

```c
hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id,
                            int32_t ctx_id, hbn_vnode_handle_t *vnode_fd);
```

**【Description】**

Opens the VIN device node and returns the module's vnode handle. Used in pairs with `hbn_vnode_close`.

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_type` | `hb_vnode_type` | yes | — | vnode type; VIN uses `HB_VIN` |
| `hw_id` | `uint32_t` | yes | — | Hardware id, **the MIPI RX channel number**. Valid values in [MIPI RX](#mipi-rx) |
| `ctx_id` | `int32_t` | yes | `AUTO_ALLOC_ID` | context id, a software concept; pass a concrete value, or `AUTO_ALLOC_ID` to let the framework allocate one |
| `vnode_fd` | `hbn_vnode_handle_t *` | yes | — | **Out parameter**, the returned vnode handle |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

- each VIN instance has four nodes under `/dev` — `/dev/vinX_src`, `/dev/vinX_cap`, `/dev/vinX_emb` and `/dev/vinX_roi`, where `X` is the `hw_id`. Going through the `hbn_vnode_*` interfaces normally, you never touch them directly.

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

```c
/* Follows the minimal call sequence of /app/multimedia_samples/sample_vin/ on the board */
hbn_vnode_handle_t vin_fd;
hbn_vnode_open(HB_VIN, hw_id, AUTO_ALLOC_ID, &vin_fd);
```

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

#### hbn_vnode_close

**【Function Prototype】**

```c
hobot_status hbn_vnode_close(hbn_vnode_handle_t vnode_fd);
```

**【Description】**

Closes the VIN device node and releases the handle. Used in pairs with `hbn_vnode_open`; call `hbn_vflow_stop` first.

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | yes | — | The module's vnode handle |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

None

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

#### hbn_vnode_set_attr

**【Function Prototype】**

```c
/* macro: forwards to hbn_vnode_set_attr_s, length taken from sizeof(*(attr)) */
#define hbn_vnode_set_attr(vnode_fd, attr) \
        hbn_vnode_set_attr_s((vnode_fd), (attr), sizeof(*(attr)))
```

**【Description】**

Sets the module's basic attributes. For VIN this is `vin_attr_t`, which carries the `cim_attr` / `vcon_attr` / `lpwm_attr` sub-module configuration.

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | yes | — | The module's vnode handle |
| `attr` | `vin_attr_t *` | yes | — | Pointer to the basic attribute structure |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

- `magicNumber` in `vin_node_attr_t` / `vin_ochn_attr_t` **must be filled in by the caller as `0x12345678`**; the driver's `set_attr` / `set_ochn_attr` validates it and fails the call on a mismatch
- The framework does not fill this in for you: the `MAGIC_NUMBER` macro lives in the driver-internal header `camsys/vpf/vio_config.h` and is absent from the published `hbn_vin_cfg.h`, so hard-code `0x12345678` as the board samples do

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

```c
hbn_vnode_set_attr(vin_fd, &vin_attr);          /* vin_attr is in Quick Example */
```

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

#### hbn_vnode_set_ochn_attr

**【Function Prototype】**

```c
/* macro: forwards to hbn_vnode_set_ochn_attr_s, length taken from sizeof(*(attr)) */
#define hbn_vnode_set_ochn_attr(vnode_fd, ochn_id, attr) \
        hbn_vnode_set_ochn_attr_s((vnode_fd), (ochn_id), (attr), sizeof(*(attr)))
```

**【Description】**

Sets the module's output channel attributes.

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | yes | — | The module's vnode handle |
| `ochn_id` | `uint32_t` | yes | — | Output channel id, values in the table below |
| `attr` | `vin_ochn_attr_t *` | yes | — | Output channel attributes (whether to write DDR, packing, width/height strides, format, ROI and EMB parameters) |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

**`ochn_id` values**

| Value | Channel | Description |
| --- | --- | --- |
| 0 | `VIN_MAIN_FRAME` | **Data channel**: the main frame, and the only channel that can run Online (OTF) |
| 1 | `VIN_ONLINE` | **Non-data channel**: do not configure it when running Online, and do not fetch frames from it |
| 3 | `VIN_EMB` | **Data channel**: embedded data, DDR only |
| 4 | `VIN_ROI` | **Data channel**: ROI cropping, DDR only |

> Only **three data channels** can hand frames to user space: main frame / EMB / ROI. **Online (OTF) is not a fourth parallel channel — it is an output mode of the main-frame channel**: the main frame can land in DDR and be sent OTF to the ISP or PYM at the same time.

The **EMB channel** carries the line-embedded information the sensor outputs alongside the image (exposure parameters and so on). VIN receives it separately and sends it to DDR separately, without affecting the main frame.

- Channels 3 / 4 are DDR only and do not support Online
- To use a channel in Offline mode, switch it on in the attributes (`vin_ochn_attr[x].ddr_en` / `.emb_en` / `.roi_en`)

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

```c
hbn_vnode_set_ochn_attr(vin_fd, OCHN_MAIN, &vin_attr.vin_ochn_attr[OCHN_MAIN]);
```

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

#### hbn_vnode_get_ochn_attr

**【Function Prototype】**

```c
/* macro: forwards to hbn_vnode_get_ochn_attr_s, length taken from sizeof(*(attr)) */
#define hbn_vnode_get_ochn_attr(vnode_fd, ochn_id, attr) \
        hbn_vnode_get_ochn_attr_s((vnode_fd), (ochn_id), (attr), sizeof(*(attr)))
```

**【Description】**

Reads back the module's output channel attributes.

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | yes | — | The module's vnode handle |
| `ochn_id` | `uint32_t` | yes | — | Output channel id, same values as `hbn_vnode_set_ochn_attr` |
| `attr` | `vin_ochn_attr_t *` | yes | — | **Out parameter**, the output channel attributes read back |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

None

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

#### hbn_vnode_set_ichn_attr

**【Function Prototype】**

```c
/* macro: forwards to hbn_vnode_set_ichn_attr_s, length taken from sizeof(*(attr)) */
#define hbn_vnode_set_ichn_attr(vnode_fd, ichn_id, attr) \
        hbn_vnode_set_ichn_attr_s((vnode_fd), (ichn_id), (attr), sizeof(*(attr)))
```

**【Description】**

Sets the module's input channel attributes.

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | yes | — | The module's vnode handle |
| `ichn_id` | `uint32_t` | yes | — | Input channel id, **fixed to 0 for VIN** |
| `attr` | `vin_ichn_attr_t *` | yes | — | Input channel attributes (width, height, format) |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

- `vin_ichn_attr_t.format` must match the sensor's actual output format

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

```c
hbn_vnode_set_ichn_attr(vin_fd, 0, &vin_attr.vin_ichn_attr);
```

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

#### hbn_vnode_get_ichn_attr

**【Function Prototype】**

```c
/* macro: forwards to hbn_vnode_get_ichn_attr_s, length taken from sizeof(*(attr)) */
#define hbn_vnode_get_ichn_attr(vnode_fd, ichn_id, attr) \
        hbn_vnode_get_ichn_attr_s((vnode_fd), (ichn_id), (attr), sizeof(*(attr)))
```

**【Description】**

Reads back the module's input channel attributes.

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | yes | — | The module's vnode handle |
| `ichn_id` | `uint32_t` | yes | — | Input channel id, **fixed to 0 for VIN** |
| `attr` | `vin_ichn_attr_t *` | yes | — | **Out parameter**, the input channel attributes read back |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

None

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

#### hbn_vnode_set_ochn_buf_attr

**【Function Prototype】**

```c
hobot_status hbn_vnode_set_ochn_buf_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                         hbn_buf_alloc_attr_t *alloc_attr);
```

**【Description】**

Sets the buffer attributes of an output channel. **This interface is what actually triggers the buffer allocation.**

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | yes | — | The module's vnode handle |
| `ochn_id` | `uint32_t` | yes | — | Output channel id |
| `alloc_attr` | `hbn_buf_alloc_attr_t *` | yes | — | Holds three members: `buffers_num` / `is_contig` / `flags` |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

- Buffers are needed by the channels that write DDR: main frame `vin_ochn_attr[x].ddr_en`, ROI `.roi_en`, EMB `.emb_en`
- In Online mode the main frame does not land in DDR, so no buffer is needed
- **The channel named by `ochn_id` must already be enabled**, otherwise the call returns a not-supported error

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

#### hbn_vnode_start

**【Function Prototype】**

```c
hobot_status hbn_vnode_start(hbn_vnode_handle_t vnode_fd);
```

**【Description】**

Starts the vnode.

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | yes | — | The module's vnode handle |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

- Usually `hbn_vflow_start` manages the whole flow, so calling this directly is unnecessary

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

#### hbn_vnode_stop

**【Function Prototype】**

```c
hobot_status hbn_vnode_stop(hbn_vnode_handle_t vnode_fd);
```

**【Description】**

Stops the vnode.

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | yes | — | The module's vnode handle |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

- Usually `hbn_vflow_stop` manages the whole flow, so calling this directly is unnecessary

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

#### hbn_vnode_getframe

**【Function Prototype】**

```c
hobot_status hbn_vnode_getframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                uint32_t millisecondTimeout, hbn_vnode_image_t *out_img);
```

**【Description】**

Fetches one frame from the given output channel. **Blocking interface.**

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | yes | — | The module's vnode handle |
| `ochn_id` | `uint32_t` | yes | — | Output channel id, same values as `hbn_vnode_set_ochn_attr` |
| `millisecondTimeout` | `uint32_t` | yes | — | Timeout in milliseconds |
| `out_img` | `hbn_vnode_image_t *` | yes | — | **Out parameter**: frame id, timestamp, and each plane's dma-buf fd and virtual address |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

- A fetched frame **must** be returned with `hbn_vnode_releaseframe`, otherwise the buffers run out and fetching stops
- Use `hbn_vnode_getframe_cond` when you need conditional fetching

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

```c
hbn_vnode_image_t img;
hbn_vnode_getframe(vin_fd, OCHN_MAIN, 1000, &img);   /* 1 s timeout */
```

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

#### hbn_vnode_sendframe

**【Function Prototype】**

```c
hobot_status hbn_vnode_sendframe(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
                                 hbn_vnode_image_t *img);
```

**【Description】**

Pushes frame data into an input channel, for DDR feedback and similar scenarios.

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | yes | — | The module's vnode handle |
| `ichn_id` | `uint32_t` | yes | — | Input channel id |
| `img` | `hbn_vnode_image_t *` | yes | — | The frame to push |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

- **Blocking interface with a 4 s default timeout**; use `hbn_vnode_sendframe_async` when you do not want to wait
- Not needed for ordinary capture

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

#### hbn_vnode_releaseframe

**【Function Prototype】**

```c
hobot_status hbn_vnode_releaseframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                    hbn_vnode_image_t *img);
```

**【Description】**

Returns one frame.

**【Parameters】**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | yes | — | The module's vnode handle |
| `ochn_id` | `uint32_t` | yes | — | Output channel id; must match the one used to fetch |
| `img` | `hbn_vnode_image_t *` | yes | — | The frame to return |

**【Return Value】**

Returns `HBN_STATUS_SUCESS` (`0`) on success; on failure a negative error code — the ones VIN actually returns are listed in [Return Values](#return-values).

**【Notes】**

- Used in pairs with `hbn_vnode_getframe`

**【Compatibility】**

Hardware: RDK S100 / RDK S600.

**【Example】**

```c
hbn_vnode_releaseframe(vin_fd, OCHN_MAIN, &img);
```

A complete runnable version is in [Quick Example](#quick-example) and on the board at `/app/multimedia_samples/sample_vin/`.

### Data Structures
The header `hbn_vin_cfg.h` is authoritative; this section is the readable version of it. The **semantics** of each field are covered where they belong — `cim_isp_flyby` / `cim_pym_flyby` in [Usage](#usage), the `func` pattern / frame-skip fields in [Constraints and Caveats](#constraints-and-caveats), the channel fields in [Interface Reference](#interface-reference).

Fields marked *framework* are filled in by the framework; you do not set them.

#### Type Overview
VIN presents itself as a vnode. All configuration is carried in `vin_attr_t` and handed over in one call (`hbn_vnode_set_attr`); stream creation and binding go through `hbn_vflow_*`.

| Type | Role | Key members |
| --- | --- | --- |
| `vin_attr_t` | All of VIN's configuration | `vin_node_attr`, `vin_attr_ex`, `vin_ichn_attr`, `vin_ochn_attr[VIN_TYPE_INVALID]`, `vin_ochn_buff_attr[VIN_TYPE_INVALID]`, `magicNumber` |
| `vin_attr_ex_t` | Extended attributes | `cim_static_attr`, `mipi_ex_attr`, `fps_ctrl` (frame skip), `dynamic_fps_attr` (dynamic frame rate), `ipi_reset`, `bypass_enable` |
| `vin_node_attr_t` | Node-level attributes | `cim_attr`, `vcon_attr`, `lpwm_attr`, `flow_id` |
| `cim_attr_t` | Capture and path configuration | `mipi_en` / `mipi_rx` / `vc_index` / `ipi_channels`, `cim_isp_flyby`, `cim_pym_flyby`, `rdma_input`, `tpg_input`, `func` |
| `vcon_attr_t` | Board-level connection | `bus_main` / `bus_second`, `poc_map`, `gpios[]`, `lpwm_chn[]`, `rx_phy_mode` / `rx_phy_index` |
| `vin_ichn_attr_t` | Input channel attributes | `width`, `height`, `format` |
| `vin_ochn_attr_t` | Output channel attributes, indexed by `ochn_id` | `ddr_en` / `roi_en` / `emb_en` / `rawds_en`, `vin_basic_attr`, `roi_attr`, `emb_attr` |
| `vin_ochn_buff_attr_t` | Buffer attributes of an output channel | `buffers_num`, `flags` |

**`hw_id`**: the hardware index given when opening VIN — **the MIPI RX channel number**.

**`ochn_id`**: VIN exposes three data channels — `0` main frame, `4` ROI, `3` EMB. Per-channel capabilities are in [Interface Reference](#interface-reference).

**The interfaces live in three libraries**: `hbn_vnode_*` / `hbn_vflow_*` in `libvpf.so`, `hbn_camera_*` in `libcam.so`, `hb_mem_*` in `libhbmem.so`.

#### Top Level

##### vin_attr_t
All of VIN's configuration, handed over in one `hbn_vnode_set_attr` call.

| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `vin_node_attr` | `vin_node_attr_t` | Node level: input mode and board-level connections | — | — | — |
| `vin_attr_ex` | `vin_attr_ex_t` | Extended attributes | — | — | — |
| `vin_ochn_attr` | `vin_ochn_attr_t[VIN_TYPE_INVALID]` | Output channels, indexed by `ochn_id` | — | — | — |
| `vin_ichn_attr` | `vin_ichn_attr_t` | Input channel | — | — | — |
| `vin_ochn_buff_attr` | `vin_ochn_buff_attr_t[VIN_TYPE_INVALID]` | Buffers of the DDR-bound channels, indexed by `ochn_id` | — | — | — |
| `magicNumber` | `uint32_t` | `0x12345678` | `0x12345678` | — | — |

#### Node-Level Attributes

##### vin_node_attr_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `cim_attr` | `cim_attr_t` | Input and path selection | — | — | — |
| `lpwm_attr` | `lpwm_attr_t` | Exposure trigger | — | — | — |
| `vcon_attr` | `vcon_attr_t` | I2C / POC / GPIO / PHY and other board connections | — | — | — |
| `flow_id` | `uint32_t` | *framework* | — | — | filled in by the framework |
| `magicNumber` | `uint32_t` | **Required: `0x12345678`**. The driver's `set_attr` validates it and fails the call on a mismatch | `0x12345678` | — | must equal the driver-internal macro `MAGIC_NUMBER` |

##### cim_attr_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `mipi_en` | `uint32_t` | Input source select, 1 = MIPI | 1 | 0 | `0` / `1`; exactly one of this, `func.enable_pattern` and `rdma_input.rdma_en` |
| `mipi_rx` | `uint32_t` | MIPI RX channel number | 0 | — | S100 `0` / `1` / `4`; S600 `0`–`5` |
| `vc_index` | `uint32_t` | Virtual channel (VC) index | 0 | 0 | `0`–`3` |
| `ipi_channels` | `uint32_t` | How many IPIs this bring-up occupies: `1` for a single camera, `2` for DOL2. The limit is 2; anything higher is rejected | 1 | — | `1`–`2`; 2 for DOL2 |
| `cim_pym_flyby` | `uint32_t` | 1 = connect directly to PYM (Online) | 0 | 0 | `0` / `1`; mutually exclusive with `cim_isp_flyby` |
| `cim_isp_flyby` | `uint32_t` | 1 = connect directly to ISP (Online) | 0 | 0 | `0` / `1`; mutually exclusive with `cim_pym_flyby` |
| `y_uv_swap` | `uint32_t` | Y / UV byte-order swap for YUV422 input: `0` keep (default), `1` swap. Enable it only when the sensor's YUV byte order does not match the platform; RAW input is unaffected | 0 | 0 | `0` / `1` |
| `rdma_input` | `cim_input_rdma_t` | DDR feedback input | — | — | — |
| `tpg_input` | `cim_input_tpg_t` | Test pattern input | — | — | — |
| `func` | `cim_func_desc_t` | Frame ID, frame skip, pattern and so on | — | — | — |

##### cim_func_desc_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `enable_frame_id` | `uint32_t` | Whether to stamp frames with a frame ID | 1 | 0 | `0` / `1` |
| `set_init_frame_id` | `uint32_t` | Starting frame ID | 0 | 0 | from `0` |
| `enable_pattern` | `uint32_t` | Test pattern enable | 0 | 0 | `0` / `1`; exactly one of this, MIPI input and `rdma_en` |
| `skip_frame` | `uint32_t` | **A mode selector, not an on/off switch**: `0` no skip, `1` ratio by frame rate, `2` skip the first N frames, `3` hardware extraction, `4` software sync, `5` `6` software timer. `7` or above is invalid; frame skipping is not allowed in TPG mode | 0 | 0 | `0`–`6` |
| `input_fps` | `uint32_t` | For modes `1` `4`: the input frame rate, **must exceed** `output_fps` | — | 0 | must exceed `output_fps` in modes `1` and `4` |
| `output_fps` | `uint32_t` | For modes `1` `4`: the output frame rate, **must be below** `input_fps` | — | 0 | must be below `input_fps` in modes `1` and `4` |
| `skip_nums` | `uint32_t` | For mode `2`: how many frames to drop after power-up | — | 0 | used in mode `2` |
| `hw_extract_m` | `uint32_t` | For mode `3`: the extraction ratio — **one of m / n must be 1**, the other at most 63 | — | 0 | `0`–`63`; in mode `3` one of m / n must be 1 |
| `hw_extract_n` | `uint32_t` | For mode `3`: as above | — | 0 | `0`–`63`; as above |
| `lpwm_trig_sel` | `uint32_t` | Which LPWM channel to trigger against, in `[0, 12)`; `0xffff` means none | `0xffff` | `0xffff` | `0`–`11`, or `0xffff` for none |
| `skip_period_us` | `uint32_t` | For modes `5` `6`: the skip period in µs, **must be ≥ `frame_duration_us`** | — | 0 | must be ≥ `frame_duration_us` in modes `5` and `6` |
| `frame_duration_us` | `uint32_t` | For modes `5` `6`: the frame duration in µs, cannot be 0 | — | 0 | cannot be 0 in modes `5` and `6` |
| `time_phase_us` | `uint32_t` | For modes `5` `6`: the phase alignment window in µs | — | — | — |
| `sparate_frames_mode` | `uint32_t` | Unused by the driver (spelling as in the header); fill `0` | 0 | 0 | unused by the driver |
| `endian_mode` | `uint32_t` | Endianness when writing to DDR | — | — | — |

##### cim_input_rdma_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `rdma_en` | `uint32_t` | Feedback enable | 0 | 0 | `0` / `1`; exactly one of this, MIPI input and `enable_pattern` |
| `stride` | `uint32_t` | Read stride | — | — | — |
| `pack_mode` | `uint32_t` | Packing used for the replayed data, same convention as `vin_basic_attr_t.pack_mode`; `stride` is derived from it and the format | 1 | 0 | `0` / `1` |
| `buff_num` | `uint32_t` | Number of feedback buffers | — | — | — |

##### cim_input_tpg_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `tpg_en` | `uint32_t` | Test pattern enable | 0 | 0 | `0` / `1` |
| `fps` | `uint32_t` | Pattern frame rate | — | — | — |

##### vcon_attr_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `attr_valid` | `int32_t` | Whether this group of attributes takes effect | 1 | 0 | `0` / `1` |
| `bus_main` | `int32_t` | Primary I2C bus | — | — | — |
| `bus_second` | `int32_t` | Secondary I2C bus | — | — | — |
| `poc_map` | `int32_t` | POC power mapping, taken from the DTS | — | — | — |
| `gpios` | `int32_t[VGPIO_NUM]` | GPIO indices | — | — | — |
| `sensor_err` | `int32_t[SENSOR_ERR_PIN_NUM]` | Sensor err_pin indices | — | — | — |
| `lpwm_chn` | `int32_t[LPWM_CHN_NUM]` | LPWM channel used by each sensor | — | — | — |
| `rx_phy_mode` | `int32_t` | 0 = unused, 1 = D-PHY, 2 = C-PHY | 0 | 0 | `0` none / `1` D-PHY / `2` C-PHY |
| `rx_phy_index` | `int32_t` | RX PHY index | — | — | — |
| `rx_phy_link` | `int32_t` | 0 = unused, 1 = CSI, 2 = DSI | 0 | 0 | `0` none / `1` CSI / `2` DSI |
| `tx_phy_mode` | `int32_t` | Whether this vcon uses a MIPI transmit (TX) PHY: `0` no, `1` as CSI, `2` as DSI. When non-zero it registers as a TX-side device under `tx_phy_index`, for bypass links to find | 0 | 0 | `0` none / `1` CSI / `2` DSI |
| `tx_phy_index` | `int32_t` | TX PHY index | — | — | — |
| `tx_phy_link` | `int32_t` | TX PHY link index, for composite types | — | — | — |
| `vcon_type` | `int32_t` | 0 = standalone, 1 = composite master, 2 = composite slave | 0 | 0 | `0` independent / `1` composite master / `2` composite slave |
| `vcon_link` | `int32_t` | VCON link index, for composite types | — | — | — |

##### lpwm_attr_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `lpwm_chn_attr` | `lpwm_chn_attr_t[LPWM_CHN_NUM]` | Per-channel configuration | — | — | — |

##### lpwm_chn_attr_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `enable` | `uint32_t` | Enable this channel | 0 | 0 | `0` / `1` |
| `trigger_source` | `uint32_t` | Trigger source select | 0 | 0 | `0` / `1` |
| `trigger_mode` | `uint32_t` | Trigger mode | 0 | 0 | `0` / `1` |
| `period` | `uint32_t` | Period | — | — | — |
| `offset` | `uint32_t` | Phase offset | — | — | — |
| `duty_time` | `uint32_t` | Pulse width | — | — | — |
| `threshold` | `uint32_t` | Phase-error threshold for slow sync, in microseconds, range 0–65535. `0` disables slow sync; when non-zero the trigger phase is walked towards the sync source in `adjust_step` steps, and **`offset` must be smaller than `period`** | 0 | 0 | `0`–`65535` in µs; `0` disables slow sync |
| `adjust_step` | `uint32_t` | Step size for each slow-sync adjustment, range 0–15. Only takes effect when `threshold` is non-zero | 0 | 0 | `0`–`15` |

#### Extended Attributes

##### vin_attr_ex_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `ex_attr_type` | `vin_attr_ex_type_e` | Which extended attributes take effect | — | — | — |
| `cim_static_attr` | `cim_static_attr_t` | CIM static attributes (watermark interrupt) | — | — | — |
| `mipi_ex_attr` | `mipi_attr_ex_t` | MIPI extended attributes | — | — | — |
| `fps_ctrl` | `dynamic_fps_t` | Frame skip | — | — | — |
| `dynamic_fps_attr` | `lpwm_dynamic_fps_t` | Dynamic frame-rate switching | — | — | — |
| `ipi_reset` | `uint32_t` | MIPI IPI reset | — | — | — |
| `bypass_enable` | `uint32_t` | Bypass enable | — | — | — |

#### Channel Attributes

##### vin_ichn_attr_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `format` | `uint32_t` | Image format | `HW_FORMAT_RAW10` | — | see `HW_FORMAT_*` in `hb_vpm_data_info.h` |
| `width` | `uint32_t` | Width | — | — | — |
| `height` | `uint32_t` | Height | — | — | — |

##### vin_ochn_attr_t
Indexed by `ochn_id`: `0` main frame / `4` ROI / `3` EMB.

| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `ddr_en` | `uint32_t` | This channel writes to DDR | 0 | 0 | `0` / `1` |
| `roi_en` | `uint32_t` | ROI enable | 0 | 0 | `0` / `1`; `roi_width` ≥ 32 and a multiple of 4 |
| `emb_en` | `uint32_t` | EMB enable | 0 | 0 | `0` / `1` |
| `rawds_en` | `uint32_t` | 2×2 downsampling enable | 0 | 0 | `0` / `1`; main frame channel only |
| `pingpong_ring` | `uint32_t` | Low-level buffer retention: `0` keep none — output pauses once the application stops returning buffers; `1` the driver keeps 2 buffers rotating so the hardware streams continuously. The VIN main frame normally uses `1` | — | — | — |
| `ochn_attr_type` | `vin_ochn_attr_type_e` | Which channel attributes take effect | `VIN_BASIC_ATTR` | — | `VIN_BASIC_ATTR` / `VIN_EMB_ATTR` / `VIN_ROI_ATTR` / `VIN_RAWDS_ATTR` |
| `vin_basic_attr` | `vin_basic_attr_t` | Basic attributes for writing DDR | — | — | — |
| `rawds_attr` | `vin_rawds_attr_t` | Downsampling attributes | — | — | — |
| `roi_attr` | `struct vin_roi_attr_s` | Cropping attributes | — | — | — |
| `emb_attr` | `vin_emb_attr_t` | EMB attributes | — | — | — |
| `magicNumber` | `uint32_t` | **Required: `0x12345678`**. The driver's `set_ochn_attr` validates it and fails the call on a mismatch | `0x12345678` | — | must equal the driver-internal macro `MAGIC_NUMBER` |

##### vin_basic_attr_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `pack_mode` | `uint32_t` | How data is written to DDR | 1 | 0 | `0` / `1` |
| `wstride` | `uint32_t` | Line stride | — | — | — |
| `vstride` | `uint32_t` | Frame stride | — | — | — |
| `format` | `uint32_t` | Format written to DDR | — | — | — |

##### vin_rawds_attr_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `rawds_mode` | `uint32_t` | Downsampling mode | 0 | 0 | `0` / `1` |

##### vin_roi_attr_s
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `roi_x` | `uint32_t` | Crop origin X | — | — | — |
| `roi_y` | `uint32_t` | Crop origin Y | — | — | — |
| `roi_width` | `uint32_t` | Crop width | — | — | — |
| `roi_height` | `uint32_t` | Crop height | — | — | — |

##### vin_emb_attr_t
| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `embeded_dependence` | `uint32_t` | Whether EMB travels together with the image data | 0 | 0 | `0` / `1` |
| `embeded_width` | `uint32_t` | EMB data width | — | — | — |
| `embeded_height` | `uint32_t` | EMB data height | — | — | — |

##### vin_ochn_buff_attr_t
Indexed by `ochn_id`.

| Field | Type | Description | Typical | Default | Range |
| --- | --- | --- | --- | --- | --- |
| `buffers_num` | `uint32_t` | Buffer count for this channel | 6 | — | depends on the path |
| `flags` | `int64_t` | Unused by the driver; fill `0` | 0 | 0 | unused by the driver |
### Return Values
A failing interface returns a **negative** value — the macro below, negated. These are the codes that **actually come back** when using the `hbn_vnode_*` interfaces:

| Error Code | Macro | Description | Common Cause | Resolution |
| --- | --- | --- | --- | --- |
| `-8` | `HBN_STATUS_INVALID_NULL_PTR` | A null pointer was passed | A required pointer is `NULL` | Check the struct pointers you pass in |
| `-10` | `HBN_STATUS_ILLEGAL_ATTR` | Illegal attribute combination | `cim_isp_flyby` and `cim_pym_flyby` both 1; the input-source three-way choice set wrong; `vin_ichn_attr.format` disagreeing with the sensor's actual output | Work through [Constraints and Caveats](#constraints-and-caveats) item by item |
| `-12` | `HBN_STATUS_FLOW_EXIST` | The same stream was created twice | `hbn_vflow_create` called twice on the same `hw_id` | Reuse the existing stream, or `hbn_vflow_destroy` first |
| `-13` | `HBN_STATUS_FLOW_UNEXIST` | Operation on a stream that does not exist | The stream was destroyed and the handle is stale | Review the handle's lifetime |
| `-20` | `HBN_STATUS_NOT_BINDED` | Binding failed while the stream was being created | `hbn_vflow_create` was not bound, or bound out of order | Create and bind in the order given in "API Call Flow" |
| `-23` | `HBN_STATUS_NOT_SUPPORT` | The combination is unsupported | Fetching from or configuring a channel that is not enabled | Turn on the channel first (`ddr_en` / `roi_en` / `emb_en`) |
| `-25` | `HBN_STATUS_NOMEM` | Memory allocation failed | `buffers_num` or the resolution exceeds available memory | Reduce `buffers_num` or the resolution |
| `-43` | `HBN_STATUS_NODE_DEQUE_ERROR` | `hbn_vnode_getframe` failed to fetch | A timeout is most common, and usually means no frames are arriving at all | Check `fs_cnt` in `cim_stat`, then work upstream to MIPI and the sensor |
| `-50` | `HBN_STATUS_BIND_NODE_FAIL` | Binding failed | A duplicate binding, or the Online binding conditions unmet (not the main-frame channel, or flyby not set to 1) | Check that `ochn_id` is `0` and flyby is set to 1 |
| `-786462` | `HBN_STATUS_VIN_OPEN_ICHN_FAIL` | Invalid `hw_id` | `/dev/vin<hw_id>_src` cannot be opened | Use a valid `hw_id` from [MIPI RX](#mipi-rx) |

> The macros live in `hbn_error.h`. The last row's `HBN_STATUS_VIN_*` is a composite code built by shifting the module number left by 16 bits, which is why the value is so large — `-786462` is `-0xC001E` in hex, easier to read against the header.

## Troubleshooting

### Constraints and Caveats

The following combinations are rejected outright by the driver and easy to spot:

- `cim_isp_flyby` and `cim_pym_flyby` must not both be 1 — the Online direct link targets either the ISP or the PYM, never both
- exactly one of `mipi_en`, `func.enable_pattern` and `rdma_input.rdma_en` must be 1 — the input source must be unique
- Online binding is allowed on the main frame channel only, with flyby set to 1; Offline binding requires the channel switch on — `ddr_en` for the main frame, `.emb_en` for EMB, `.roi_en` for ROI
- YUV422-8bit input cannot enable ROI or RAWDS
- frame skip is not allowed in TPG mode; `func.skip_frame` must be `0`
- `vin_ichn_attr.width`, `roi_attr.roi_x` and `roi_attr.roi_width` must be 4-aligned; `roi_width` at least 32, and `roi_x + roi_width` / `roi_y + roi_height` must stay inside the input image
- `cim_attr.mipi_rx`, `vc_index` and `ipi_channels` must not exceed their ceilings (see the range column in [Data Structures](#data-structures))
- Online binding requires the CIM and its downstream in the same CPE — cross-CPE links must go Offline

The following combinations return no error yet produce wrong output; check them item by item:

- a `pack_mode` / `format` mismatch in `vin_basic_attr` makes `wstride` wrong, and the image in DDR lands misaligned
- when `vin_ichn_attr_t.format` disagrees with the sensor's actual output, frames still arrive, but the pixels are interpreted wrongly


:::warning Note

`hw_id` is the MIPI RX channel number: the `hw_id` passed when opening VIN is which MIPI RX that camera sits on.

- Valid values on S100: `0` / `1` / `4` — code that hard-codes `hw_id` to `2` or `3` fails to open on S100
- Valid values on S600: `0`–`5`

:::

### CIM Status Nodes
Every CIM exposes a group of read-only nodes under sysfs; `cim_stat` is the first place to look when debugging capture. The node name comes from the DTS address — swap it for whichever CIM you want:

<DocScope products="RDK S100">

```bash
cat /sys/devices/platform/soc/37430000.cim/cim_stat
```

CIM0 / CIM1 / CIM4 are `37430000.cim` / `37630000.cim` / `37c30000.cim`.

</DocScope>

<DocScope products="RDK S600">

```bash
cat /sys/devices/platform/soc/37430000.cim/cim_stat
```

CIM0 ~ CIM5 are `37430000.cim` / `37630000.cim` / `37830000.cim` / `37a30000.cim` / `37c30000.cim` / `37c50000.cim`.

</DocScope>

The same information is reachable from the VIN side: `/sys/class/vps/vin<hw_id>_src/cim_stat`.

`cim_stat` prints in blocks, one per input path, headed `CIM IPI0 INFO` through `CIM IPI3 INFO`; an IPI with no input source configured is omitted entirely:

| Group | Fields | What to look at |
| --- | --- | --- |
| `source_input` | `mipi` / `test_pattern` / `ddr_in`, `mipi_rx`, `vc_index`, `ipi_channels`, `input_size`, `format` | Which of the three sources is active; whether `input_size` matches the sensor's actual output |
| `online_output` | `isp_flyby`, `pym_flyby` | Whether the Online direct connection is on as intended |
| `main_channel` | `ddr_en`, `rawds_en`, `format`, `pack_mode`, ROI parameters | Whether the main frame is writing to DDR |
| `roi_channel` / `emb_channel` | `emb_en`, `emb_dep`, `emb_width`, `emb_height`, ROI parameters | Whether the two bypass channels are enabled and cropping where they should |
| `statistics` | `fs_cnt` / `fe_cnt`, `ipi_drop_cnt`, `drop_done_cnt`, `w_err_cnt` / `h_err_cnt`, `emb_size_error_cnt` | Read them against the table below |
| | `dma_done_cnt` / `dma_drop_cnt` / `dma_disable_cnt` for main / `roi` / `emb`, plus the `buf queue`'s `free` / `request` / `process` / `done` / `used` (a `rdma` line appears when `ddr_in` feedback is active) | How each path is moving data, and the five buffer states |

How to read them:

| Symptom | Meaning and next step |
| --- | --- |
| `fs_cnt` / `fe_cnt` not increasing | No frames are arriving. Look upstream at MIPI and the sensor |
| `w_err_cnt` / `h_err_cnt` increasing | The actual image width/height disagrees with `vin_ichn_attr`. Compare `input_size` against the sensor output |
| `drop_done_cnt` increasing | Most likely an IPI overflow, i.e. not enough IPI bandwidth. Recompute in [Bring-up Sizing](#bring-up-sizing) |
| `ipi_drop_cnt` increasing | Frames dropped on the IPI side |
| The `buf queue`'s `used` never comes down | The application is not returning frames — check that `hbn_vnode_getframe` / `hbn_vnode_releaseframe` are paired |

The same directory also has `cim_capability` (the width ceiling of each IPI on that CIM) and `regdump` (a register snapshot).

### MIPI Status Nodes
```bash
cat /sys/class/vps/mipi_host0/status/cfg    # the MIPI configuration actually in effect
cat /sys/class/vps/mipi_host0/status/icnt   # interrupt error counters
cat /sys/class/vps/mipi_host0/status/regs   # register snapshot
```

`status/cfg` confirms whether the board is really running the parameters you set; the error counters in `status/icnt` should all be 0 in normal operation. The nodes are numbered per host: `mipi_host<hw_id>` (valid `hw_id` values in [MIPI RX](#mipi-rx)).

Under `param/` are writable debug switches, the common ones being `irq_cnt` (interrupt count threshold, past which the driver disables that interrupt to prevent an interrupt storm), `dbg_value` (turn on debug logging) and `ipi_overst`. **These change the driver's runtime behaviour — do not adjust them on a production configuration.**

## Related Documentation
- [Framework - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api) — generic vnode interfaces and the `vin_attr_t` field tables
- [Camera](/Advanced_development/multimedia_development/multimedia_api/camera_api) — the sensor-side `hbn_camera_*` interfaces
- [Video Processing Framework - VPF/PYM](/Advanced_development/multimedia_development/multimedia_api/vpf_pym_api) — the `hbn_vflow_*` create-and-bind interfaces
