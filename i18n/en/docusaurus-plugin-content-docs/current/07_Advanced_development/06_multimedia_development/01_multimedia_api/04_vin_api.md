---
sidebar_position: 4
title: "Video Input - VIN"
description: "RDK S100/S600 5.5.1.4 VIN (Video Input)"
---

# Video Input - VIN

> **Level**: This is the **VIN module guide** in the Low-level Multimedia API set. For the full field tables of the generic vnode interfaces see [Framework - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api); for sensor-side configuration see [Camera](/Advanced_development/multimedia_development/multimedia_api/camera_api).

## Overview
VIN (Video In) is a vnode in the HBN framework. It brings camera data into the SoC and hands it to the downstream stages (board header `hbn_vin_cfg.h`, interface prefix `hbn_vnode_*`). It is the first stage of the camera pipeline and is built from four sub-modules: **MIPI RX / CIM / LPWM / VCON**.

<details>
<summary>Expand: glossary</summary>

**Glossary**

The abbreviations and terms used in this document. **Skim these first** — `CPE`, `OTF`, `IPI` and `vnode` run through the whole document.

| Term | Description |
| --- | --- |
| **VIN** | Video In, the subject of this document. Brings camera data into the SoC and passes it downstream |
| **IPI** | The **on-chip** data path between MIPI RX and CIM — not an external protocol. One camera stream occupies one IPI |
| **VC** | Virtual Channel of MIPI CSI-2. One physical link can carry several streams, told apart by VC |
| **hw_id** | The hardware index given when opening VIN — **this is the MIPI RX channel number** |
| **OTF** | On The Fly, a direct hardware connection. Data bypasses DDR and goes straight from CIM to ISP / PYM |
| **Online / Offline** | Online = OTF, the data never lands in DDR; Offline = CIM writes to DDR first and downstream reads it back from memory |
| **CPE** | A physical grouping of camera processing units on the die. **Only a CIM and an ISP / PYM in the same CPE can be connected OTF**; across CPEs only Offline works |
| **vnode** | The HBN framework's abstraction of a functional module. VIN is a vnode, driven with the `hbn_vnode_*` interfaces |
| **HBN** | The application-side module framework providing the generic `hbn_vnode_*` / `hbn_vflow_*` interfaces |
| **SerDes** | Serialiser / deserialiser. Merges several cameras onto one coax link; the SoC side splits them apart again |
| **POC** | Power Over Coax — powering a camera module over the coax cable |
| **EMB** | Embedded Data — line-embedded information (exposure, temperature…) sent alongside the image |
| **ISP** | Image Signal Processor. RAW data has to go through it before it becomes an image |
| **PYM** | Pyramid module, for image downscaling and ROI |
| **YNR** | Noise reduction module |
| **GDC** | Geometric Distortion Correction |
| **DDR** | System memory. In Offline mode the image is written here first and read back downstream |

</details>

### VIN's Four Sub-modules
| Sub-module | Responsibility |
| --- | --- |
| **MIPI RX** | Receives the MIPI CSI-2 stream, D-PHY / C-PHY; each RX supports several virtual channels (VC). Three RX on S100, six on S600 |
| **CIM** | Camera Interface Manager. Distributes images from RX to the next stage (Online) or writes them to DDR (Offline) |
| **LPWM** | Exposure trigger and frame sync pulses, for sensors that need external triggering |
| **VCON** | Connection setup: I2C buses, POC power, GPIOs, PHY mapping and other board-level configuration |

## Hardware Block Diagram

### Where VIN Sits in the Camera Chain
![Where VIN sits in the camera chain](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/en/fig1-vin-position.svg)

### CIM Internals and Configurable Blocks
CIM is one of VIN's four sub-modules and is itself built from several functional blocks. A few of them are user-configurable:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/cim-internal.png" alt="CIM internals" width="100%" />

| Block | Where | Purpose | Configuration |
| --- | --- | --- | --- |
| `TPG` | One per IPI | Test pattern generator. Produces frames without a sensor, for path verification | `vin_node_attr.cim_attr.func.enable_pattern` |
| `ROI` | On all three output channels, with a different meaning on each | Cropping. Once enabled on the main channel, both the DDR copy and the ISP copy are cropped; the ROI channel can only output to DDR; on the EMB channel, ROI carves the embedded data out of the image | `vin_ochn_attr[x].roi_en`, `vin_ochn_attr[x].roi_attr` (`roi_x` / `roi_y` / `roi_width` / `roi_height`) |
| `EMB` | The third channel of every IPI | Receives embedded data, either as the `0x12` type or embedded in the image | `vin_ochn_attr[x].emb_en`, `vin_ochn_attr[x].emb_attr` |
| `RAWDS` | The main channel | 2×2 downsampling, halving both width and height | `vin_ochn_attr[x].rawds_en`, `vin_ochn_attr[x].rawds_attr.rawds_mode` |
| `RDMA` | Some IPIs (S100: IPI3 of CIM0; S600: IPI2/IPI3 of CIM3 — check each CIM's `rdma-support`) | DDR feedback, for debugging | `vin_node_attr.cim_attr.rdma_input.rdma_en` |

`TPG`, MIPI input and `RDMA` are **mutually exclusive input sources**; only one can be selected at a time (see [Constraints and Caveats](#constraints-and-caveats)).

## Hardware Specification

### Platform Scale
<DocScope products="RDK S100">

| Item | S100 |
| --- | --- |
| VIN / CIM instances | 3 |
| LPWM instances / channels | 3 / 12 |

</DocScope>

<DocScope products="RDK S600">

| Item | S600 |
| --- | --- |
| VIN / CIM instances | 6 |
| LPWM instances / channels | 4 / 16 |

</DocScope>

Multiple cameras are told apart by `hw_id`, **which is the MIPI RX channel number**.

<DocScope products="RDK S100">

Valid `hw_id` on S100 are `0` / `1` / `4`.

> Code that hard-codes `hw_id` to `2` or `3` fails to open on S100.

</DocScope>

<DocScope products="RDK S600">

Valid `hw_id` on S600 are `0`–`5`.

</DocScope>

### Platform Limits
<DocScope products="RDK S100">

| Item | S100 |
| --- | --- |
| MIPI RX channels | 3 |
| Lanes / trios per RX | D-PHY ≤ 4 lanes; C-PHY ≤ 3 trios |
| Per-lane / per-trio rate range | D-PHY 80–4500 Mbps; C-PHY 80–3500 Msps |
| **PHY ceiling per RX** | **D-PHY 18 Gbps** (4 × 4.5); **C-PHY about 23.94 Gbps** (3 × 3.5 × 2.28) |
| Virtual channels (VC) per RX | 4 |
| IPI channels per CIM | 4 |
| IPI pixel clock (nominal) | 600 MHz |

</DocScope>

<DocScope products="RDK S600">

| Item | S600 |
| --- | --- |
| MIPI RX channels | 6 |
| Lanes / trios per RX | D-PHY ≤ 4 lanes; C-PHY ≤ 3 trios |
| Per-lane / per-trio rate range | D-PHY 80–4500 Mbps; C-PHY 80–3500 Msps |
| **PHY ceiling per RX** | **D-PHY 18 Gbps** (4 × 4.5); **C-PHY about 23.94 Gbps** (3 × 3.5 × 2.28) |
| Virtual channels (VC) per RX | 4 |
| IPI channels per CIM | 4 |
| IPI pixel clock (nominal) | 670 MHz |

</DocScope>

> The PHY rates and pixel clocks in this table come from this platform's driver and board-level hardware specification.

The driver enforces the PHY ceiling per lane at 4.5 Gbps (per trio at 3.5 Gsps for C-PHY); exceeding it makes PHY initialisation fail outright. The 2.28 in the C-PHY row is the protocol's standard coefficient.

> **That ceiling is what the SoC PHY can do, not what the bring-up link can carry.** Modules usually arrive through a deserialiser, and the real ceiling is often the deserialiser's output rate — mainstream ones drive only 2.5 Gbps per lane (10 Gbps per RX), which leaves the 18 Gbps above unused. Check the module datasheet for the deserialiser's rate rather than sizing from 18 / 23.9 directly.

### Maximum Input Width per IPI
Each CIM IPI accepts a different maximum image width, given by `max-width` in the DTS:

<DocScope products="RDK S100">

| CIM | CIM0 | CIM1 | CIM4 |
| --- | --- | --- | --- |
| IPI0 / IPI1 / IPI2 / IPI3 (px) | 5696 / 4096 / 4096 / 4096 | 4096 ×4 | 4096 ×4 |

</DocScope>

<DocScope products="RDK S600">

| CIM | CIM0 | CIM1 | CIM2 | CIM3 | CIM4 | CIM5 |
| --- | --- | --- | --- | --- | --- | --- |
| IPI0 / IPI1 / IPI2 / IPI3 (px) | 5696 ×4 | 5696 ×4 | 5696 ×4 | 4096 ×4 | 4096 ×4 | 4096 ×4 |

</DocScope>

Each cell is laid out as `IPI0 / IPI1 / IPI2 / IPI3`; `×4` means all four are the same.

Input wider than the limit is rejected by CIM at the `set_ichn_attr` stage.

> Note: beyond the CIM layer, the MIPI host has its own check at **width ≤ 4096**. The two layers disagree above 4096 today, so verify on the board before committing to such a bring-up.

<DocScope products="RDK S100">

**To bring up four streams wider than 4096, only IPI0 of CIM0 supports it.**

</DocScope>

<DocScope products="RDK S600">

**To bring up four streams wider than 4096, only CIM0 / CIM1 / CIM2 can be used.**

</DocScope>

## Bring-up Sizing
Before choosing a module, settle two questions: **does the data fit**, and **does the path carry it**.

### Data Volume
The raw data volume of one camera:

```
data rate (bps) = width × height × frame rate × bit depth
```

- 1× 8M RAW12@30fps: `3840 × 2160 × 30 × 12 ≈ 2.99 Gbps`
- 1× 2M RAW12@30fps: `1920 × 1080 × 30 × 12 ≈ 0.75 Gbps`

> This is the **active-pixel** figure. What the links actually carry also includes the sensor's blanking. The [worked examples](#worked-examples) below show the gap between the two — **size your bandwidth from the blanking-inclusive value**.

### IPI Transfer Efficiency
MIPI RX talks to CIM over IPI. On this platform IPI defaults to **48-bit mode**; the nominal pixel clock is in [Platform Limits](#platform-limits). The two data types pack a different number of pixels per clock:

| Data type | Per IPI clock | Note |
| --- | --- | --- |
| RAW (RAW8/10/12/14) | **3 pixels** | 3 × 16 bit exactly fills 48 bit |
| YUV | **1 pixel** | Only one third of the bus is used |

So on the same IPI, RAW gives **three times** the usable bandwidth of YUV. **This matters most when bringing up a YUV module (one whose ISP is inside the sensor)** — IPI often becomes the bottleneck before PHY does.

> The 48-bit mode and the RAW/YUV packing ratios come from this platform's driver; the pixel clock is the driver's nominal value and the real figure follows your bring-up configuration.

### Sizing Method
How many cameras fit on one RX, and in what mix, takes four steps. **PHY, IPI and VC must all pass**; if any fails, adjust. For PHY take the D-PHY or the C-PHY figure, whichever your bring-up uses — only one of the two has to pass.

**Step 1 · Link data volume per camera**

```
data rate per camera (bps) = width × height × frame rate × bit depth × k
```

- Bit depth: `12` for RAW12, `16` for YUV422
- `k` is the blanking-inclusive coefficient. Reference values are about **1.4 for RAW and 1.2 for YUV**, and they move with the module's blanking setting — **take the line/frame totals from the module datasheet**. The values here are for estimation only

Quick reference for common configurations:

| Configuration | Active pixels | Blanking-inclusive |
| --- | --- | --- |
| 8M RAW12@30 | 2.99 Gbps | about 4.18 Gbps |
| 8M RAW12@60 | 5.97 Gbps | about 8.36 Gbps |
| 2M RAW12@30 | 0.75 Gbps | about 1.05 Gbps |
| 8M YUV422@30 | 3.98 Gbps | about 4.78 Gbps |
| 2M YUV422@30 | 1.00 Gbps | about 1.20 Gbps |

**Step 2 · Check every ceiling**

They are all **per RX** — every camera on that RX shares one budget, not one budget each.

<DocScope products="RDK S100">

| Ceiling | Limit (sum over all cameras on the RX must not exceed) |
| --- | --- |
| PHY · D-PHY | 4 lanes × 4.5 Gbps = 18 Gbps |
| PHY · C-PHY | 3 trios × 3.5 Gsps × 2.28 = 23.94 Gbps |
| IPI · RAW only | 600 MHz × 3 pixels × 12 bit = 21.6 Gbps |
| IPI · **any YUV present** | 600 MHz × 1 pixel × 16 bit = **9.6 Gbps** |
| VC count | 4 |

</DocScope>

<DocScope products="RDK S600">

| Ceiling | Limit (sum over all cameras on the RX must not exceed) |
| --- | --- |
| PHY · D-PHY | 4 lanes × 4.5 Gbps = 18 Gbps |
| PHY · C-PHY | 3 trios × 3.5 Gsps × 2.28 = 23.94 Gbps |
| IPI · RAW only | 670 MHz × 3 pixels × 12 bit = 24.1 Gbps |
| IPI · **any YUV present** | 670 MHz × 1 pixel × 16 bit = **10.72 Gbps** |
| VC count | 4 |

</DocScope>

**Step 3 · The tightest one wins**

The sum over all cameras must stay under every ceiling, and **whichever is hit first is your bottleneck**. In the worked examples below, RAW hits PHY first and YUV hits IPI first — that is what this means.

**Step 4 · When it does not fit, adjust in this order**

1. **Compress the module's blanking** — lowers `k` with no configuration change and no image-quality loss; the best value for effort
2. Lower the frame rate or the resolution
3. Move cameras to another RX (S100 has 3, S600 has 6)
4. Switch to C-PHY — **this only loosens PHY, not IPI**, so it does nothing for a YUV scenario

> **The easiest trap**: with a mix, the IPI ceiling is **the whole RX dropping to 9.6 Gbps** (10.72 on S600), not just the YUV camera being limited. So for a mix like "1× YUV + 3× 8M RAW12", the budget is 9.6 and not 21.6 — the three RAW12 streams alone need 12.54 Gbps blanking-inclusive, already over. **Once any YUV is present on an RX, size everything to the YUV figure.**

### Worked Examples
Same 8M@30fps, same single RX: **4× RAW12 fits, 4× YUV422 does not** — the whole difference is IPI packing. Both walk the four steps of the [sizing method](#sizing-method).

#### Example 1: 4× 8M RAW12@30fps
**① Data volume**

| Figure | Per camera | 4 cameras |
| --- | --- | --- |
| Active pixels (`width × height × frame rate × 12`) | 2.99 Gbps | 11.96 Gbps |
| **Blanking-inclusive (×1.4)** | 4.18 Gbps | **16.72 Gbps** |

**② Check each ceiling**

| Ceiling | Limit | 4 cameras | Result |
| --- | --- | --- | --- |
| PHY · D-PHY | 18 Gbps | 16.72 Gbps | ✓ 93% used, 7% left |
| PHY · C-PHY | 23.94 Gbps | 16.72 Gbps | ✓ 70% used |
| IPI (RAW only) | S100 21.6 Gbps / S600 24.1 Gbps | 16.72 Gbps | ✓ 77% used |
| VC count | 4 | 4 | ✓ |

**③ Conclusion**: on D-PHY it runs, but only 7% of PHY is left, so holding four streams at full frame rate needs the sensor's blanking compressed. **On C-PHY there is far more room**: PHY drops to 70% and the bottleneck moves to IPI (77% on S100). That holds only if the module supports C-PHY and the deserialiser output keeps up. Whether it really sustains full frame rate must be measured on the board.

#### Example 2: 4× 8M YUV422@30fps
**① Data volume**

| Figure | Per camera | 4 cameras |
| --- | --- | --- |
| Active pixels (`width × height × frame rate × 16`) | 3.98 Gbps | 15.93 Gbps |
| **Blanking-inclusive (×1.2)** | 4.78 Gbps | **19.11 Gbps** |

**② Check each ceiling**

| Ceiling | Limit | 4 cameras | Result |
| --- | --- | --- | --- |
| PHY · D-PHY | 18 Gbps | 19.11 Gbps | ✗ over |
| PHY · C-PHY | 23.94 Gbps | 19.11 Gbps | ✓ 80% used |
| IPI (YUV present) | S100 9.6 Gbps / S600 10.72 Gbps | 19.11 Gbps | ✗ does not even fit the 15.93 of active pixels |
| VC count | 4 | 4 | ✓ |

**③ Conclusion**: **four do not fit, and IPI is hit first** — 9.6 Gbps cannot even carry the 15.93 Gbps of active pixels, so the PHY problem never comes up.

**Switching to C-PHY buys nothing here**, and this is the one place it is easy to misread: C-PHY does clear the PHY ceiling (19.11 < 23.94 — it would even pass), but the IPI ceiling is set by the pixel clock and the packing ratio, not by which PHY you picked, so 9.6 Gbps stays 9.6 Gbps. **Once YUV is in the mix, no PHY change rescues it.**

**How many do fit**:

| Cameras | Blanking-inclusive total | vs S100's 9.6 | vs S600's 10.72 |
| --- | --- | --- | --- |
| 1 | 4.78 Gbps | ✓ | ✓ |
| 2 | 9.56 Gbps | ✓ under 1% margin | ✓ 11% margin |
| 3 | 14.33 Gbps | ✗ | ✗ |

**At most two 8M YUV@30fps cameras fit on one RX** — and on S100 they run right at the ceiling.

**But three cameras are not off limits: what is expensive is the 8M, not the camera count.**

| Combination | Blanking-inclusive total | vs IPI (S100 9.6 / S600 10.72) |
| --- | --- | --- |
| 2×8M + 1×2M | 10.75 Gbps | ✗ over — the two 8M already take 99.5%, and one more 2M needs 1.19 Gbps |
| 1×8M + 2×2M | 7.17 Gbps | ✓ 74.7% used |
| 1×8M + 3×2M | 8.36 Gbps | ✓ 87.1% used |

To add a third camera, drop one 8M down to a 2M. Four 2M cameras come to 4.78 Gbps, where the four-VC limit binds before IPI does.

> **Size your bring-up from the blanking-inclusive figure, not the active-pixel one**, or the conclusion comes out optimistic. Beyond PHY you must also confirm the deserialiser link rate is sufficient.

## Usage

### Data Paths
| Stage | What happens |
| --- | --- |
| Trigger | LPWM sends a trigger pulse to the sensor (only for modules that need external triggering) |
| Receive | The MIPI CSI-2 stream from the sensor goes through MIPI RX into CIM |
| Capture | Offline: CIM writes the image to DDR; Online: CIM connects directly to the next stage |
| Deliver | Offline: the frame is ready in memory and user space can read it; Online: the frame goes straight into ISP / PYM and user space is not involved |
| Fetch | Offline path only: user space calls `hbn_vnode_getframe` and returns the frame with `hbn_vnode_releaseframe` |

LPWM also records the trigger timestamp, which comes back with the frame information and can be used to align timestamps across cameras.

![Frame lifecycle from trigger to release](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/en/fig2-frame-lifecycle.svg)

The data CIM captures has two possible destinations, decided by three fields in `vin_attr_t`:

| Field | Meaning |
| --- | --- |
| `vin_node_attr.cim_attr.cim_isp_flyby = 1` | CIM connects directly to ISP (Online) |
| `vin_node_attr.cim_attr.cim_pym_flyby = 1` | CIM connects directly to PYM (Online) |
| `vin_ochn_attr[x].ddr_en = 1` | This output channel writes to DDR (Offline) |

`vin_node_attr.cim_attr.cim_isp_flyby` and `vin_node_attr.cim_attr.cim_pym_flyby` are **mutually exclusive** — only one can be 1 at a time. Neither is exclusive with `vin_ochn_attr[x].ddr_en`: the main frame can land in DDR *and* be sent OTF to the ISP at the same time, at the cost of bandwidth.

![The Online OTF and Offline DDR paths](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/en/fig3-otf-vs-ddr.svg)

#### Online (OTF)
Data captured by CIM **never lands in DDR** — it goes straight to the ISP or PYM over a direct hardware connection.

- Pro: no DDR bandwidth consumed, low latency
- Limits: only the main-frame channel supports Online; the ROI and EMB bypasses do not; CIM and the downstream block must be in the same CPE

#### Offline (DDR)
CIM writes the data to DDR and the downstream module or user space reads it back from memory.

- Pro: all three output channels (main frame / ROI / EMB) are available, and cross-CPE works
- Cost: CIM writes it once and downstream reads it once, so bandwidth doubles and latency is higher

#### Choosing Between Them
| Your case | Recommendation | Why |
| --- | --- | --- |
| Single RAW sensor | **Online first** | Lower latency; switch to Offline if you need ROI / EMB or want to store frames |
| Multiple camera sensors | **Offline** | Multiple cameras are usually spread across CPEs, and Online requires CIM and downstream to share a CPE |
| Need embedded data (EMB) | **Offline** | EMB can only go through DDR |
| Need cropped ROI output | **Offline** | The ROI channel does not support Online |
| YUV sensor (ISR done inside the sensor) | Depends on the downstream | With Online it connects directly to PYM, and each PYM takes exactly one input exclusively; multiple YUV streams can only go Offline |

#### Typical Combinations
The four IPIs of one CIM can **mix** Online and Offline, feeding different downstream blocks. Four typical combinations:

| Case | Input | Output mode | Downstream |
| --- | --- | --- | --- |
| 1 | 4× RAW sensor | 4× Online (OTF) | ISP |
| 2 | 4× RAW sensor | 4× Offline (DDR) | ISP |
| 3 | 4× RAW sensor | 1× Online + 3× Offline | Two ISPs |
| 4 | 4× YUV sensor | Offline (DDR) | PYM |

![Case 1 · 4× RAW, all Online (OTF) to the ISP](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/scenes/cim-scene1.png)

**Case 1 · 4× RAW, all Online (OTF) to the ISP**

![Case 2 · 4× RAW, all Offline (DDR) to the ISP](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/scenes/cim-scene2.png)

**Case 2 · 4× RAW, all Offline (DDR) to the ISP**

![Case 3 · 4× RAW, 1× Online + 3× Offline to two ISPs](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/scenes/cim-scene3.png)

**Case 3 · 4× RAW, 1× Online + 3× Offline to two ISPs**

![Case 4 · 4× YUV, Offline (DDR) to the PYM](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/scenes/cim-scene4.png)

**Case 4 · 4× YUV, Offline (DDR) to the PYM**

### API Call Flow
![Typical API call sequence](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/en/fig4-api-sequence.svg)

<details>
<summary>Expand: function call reference</summary>

**Stream creation and configuration**

1. `hbn_vnode_open(HB_VIN, hw_id, AUTO_ALLOC_ID, &handle)` — open one VIN instance; `hw_id` is the MIPI RX channel number
2. `hbn_vnode_set_attr(handle, &vin_attr)` — hand over the whole configuration in one call. `vin_attr_t` holds `vin_node_attr` (`cim_attr` / `vcon_attr` / `lpwm_attr`), `vin_attr_ex`, `vin_ichn_attr`, `vin_ochn_attr[VIN_TYPE_INVALID]` and `vin_ochn_buff_attr[VIN_TYPE_INVALID]`
3. `hbn_vnode_set_ichn_attr(handle, ichn_id, &ichn_attr)` — set the input channel's width, height and format
4. `hbn_vnode_set_ochn_attr(handle, ochn_id, &ochn_attr)` — set output channels one by one; `ochn_id` is `0` main frame / `4` ROI / `3` EMB
5. `hbn_vnode_set_ochn_buf_attr(handle, ochn_id, &alloc_attr)` — give the DDR-bound channels their buffer count and memory attributes

**Stream creation, binding and start**

6. `hbn_vflow_create()` / `hbn_vflow_add_vnode()` / `hbn_vflow_bind_vnode()` — create the flow, put VIN on it, bind the downstream
7. `hbn_camera_attach_to_vin()` — attach the sensor to VIN
8. `hbn_vflow_start()` — start the whole flow. Without vflow, `hbn_vnode_start(handle)` works too

**Per frame**

9. `hbn_vnode_getframe(handle, ochn_id, timeout, &img)` — fetch a frame; return it with `hbn_vnode_releaseframe(handle, ochn_id, &img)` when done
10. For DDR feedback (RDMA), use `hbn_vnode_sendframe(handle, ichn_id, &img)` to push a frame into the input channel instead

**Teardown**

11. `hbn_vflow_stop()` / `hbn_vnode_close(handle)` — stop the flow and release

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

#### Minimal Example
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

### Constraints and Caveats

#### Rejected by the driver
These **return an error** and are easy to spot:

| Constraint | Note |
| --- | --- |
| `vin_node_attr.cim_attr.cim_isp_flyby` and `vin_node_attr.cim_attr.cim_pym_flyby` must not both be 1 | An Online direct connection goes to either ISP or PYM, not both |
| Exactly one of `vin_node_attr.cim_attr.mipi_en` / `...func.enable_pattern` / `...rdma_input.rdma_en` is 1 | The input source must be unique: MIPI, test pattern, or DDR feedback |
| Online binding allows the main-frame channel only, with flyby already set to 1 | No other channel can be the source of an Online binding |
| Offline binding requires the channel's switch to be on | Main frame needs `vin_ochn_attr[x].ddr_en`, EMB needs `.emb_en`, ROI needs `.roi_en` |
| VIN's input node cannot be bound to | It is on the input side |
| YUV422-8bit input may not enable ROI / rawds | Format restriction |
| Online binding requires CIM and the downstream to share a CPE | Across CPEs only Offline works; the check runs on the downstream module's side |

#### No Error, Wrong Result
These **return no error** yet produce a wrong picture — worth checking item by item more than the list above:

| Pitfall | Consequence |
| --- | --- |
| `pack_mode` and `format` in `vin_ochn_attr[x].vin_basic_attr` do not match | `pack_mode = 0` gives every pixel 2 bytes (4 bytes for RAW20, 1 byte for RAW8 / YUV422-8bit); `pack_mode = 1` packs tightly at the actual bit depth (`width × 1.5` for RAW12, `width × 1.25` for RAW10). A mismatch makes `wstride` disagree with reality and **the image in DDR is skewed** |
| `vin_ichn_attr_t.format` does not match the sensor's actual output | Frames still arrive, but **the pixels are interpreted wrongly** and the image is garbage |

## API Reference

### Configuration Struct Reference
The header `hbn_vin_cfg.h` is authoritative; this section is the readable version of it. The **semantics** of each field are covered where they belong — `cim_isp_flyby` / `cim_pym_flyby` in [Data Paths](#data-paths), the `func` pattern / frame-skip fields in [CIM Internals and Configurable Blocks](#cim-internals-and-configurable-blocks), the channel fields in [API Interface Description](#api-interface-description).

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

**`ochn_id`**: VIN exposes three data channels — `0` main frame, `4` ROI, `3` EMB. Per-channel capabilities are in [API Interface Description](#api-interface-description).

**The interfaces live in three libraries**: `hbn_vnode_*` / `hbn_vflow_*` in `libvpf.so`, `hbn_camera_*` in `libcam.so`, `hb_mem_*` in `libhbmem.so`.

#### Top Level

##### vin_attr_t
All of VIN's configuration, handed over in one `hbn_vnode_set_attr` call.

| Field | Type | Description |
| --- | --- | --- |
| `vin_node_attr` | `vin_node_attr_t` | Node level: input mode and board-level connections |
| `vin_attr_ex` | `vin_attr_ex_t` | Extended attributes |
| `vin_ochn_attr` | `vin_ochn_attr_t[]` | Output channels, indexed by `ochn_id` |
| `vin_ichn_attr` | `vin_ichn_attr_t` | Input channel |
| `vin_ochn_buff_attr` | `vin_ochn_buff_attr_t[]` | Buffers of the DDR-bound channels, indexed by `ochn_id` |
| `magicNumber` | `uint32_t` | *framework* |

#### Node Level — Input Mode and Board Connections

##### vin_node_attr_t
| Field | Type | Description |
| --- | --- | --- |
| `cim_attr` | `cim_attr_t` | Input and path selection |
| `lpwm_attr` | `lpwm_attr_t` | Exposure trigger |
| `vcon_attr` | `vcon_attr_t` | I2C / POC / GPIO / PHY and other board connections |
| `flow_id` | `uint32_t` | *framework* |
| `magicNumber` | `uint32_t` | *framework* |

##### cim_attr_t
| Field | Type | Description |
| --- | --- | --- |
| `mipi_en` | `uint32_t` | Input source select, 1 = MIPI |
| `mipi_rx` | `uint32_t` | MIPI RX channel number |
| `vc_index` | `uint32_t` | Virtual channel (VC) index |
| `ipi_channels` | `uint32_t` | How many IPIs are occupied; used in DOL2 scenarios |
| `cim_pym_flyby` | `uint32_t` | 1 = connect directly to PYM (Online) |
| `cim_isp_flyby` | `uint32_t` | 1 = connect directly to ISP (Online) |
| `y_uv_swap` | `uint32_t` | See the header |
| `rdma_input` | `cim_input_rdma_t` | DDR feedback input |
| `tpg_input` | `cim_input_tpg_t` | Test pattern input |
| `func` | `cim_func_desc_t` | Frame ID, frame skip, pattern and so on |

##### cim_func_desc_t
| Field | Type | Description |
| --- | --- | --- |
| `enable_frame_id` | `uint32_t` | Whether to stamp frames with a frame ID |
| `set_init_frame_id` | `uint32_t` | Starting frame ID |
| `enable_pattern` | `uint32_t` | Test pattern enable |
| `skip_frame` | `uint32_t` | Frame skip enable |
| `input_fps` | `uint32_t` | Input frame rate |
| `output_fps` | `uint32_t` | Output frame rate |
| `skip_nums` | `uint32_t` | Frames skipped per step |
| `hw_extract_m` | `uint32_t` | Hardware frame extraction ratio m/n |
| `hw_extract_n` | `uint32_t` | Hardware frame extraction ratio m/n |
| `lpwm_trig_sel` | `uint32_t` | Trigger source select |
| `skip_period_us` | `uint32_t` | Frame-skip period, microseconds |
| `frame_duration_us` | `uint32_t` | Frame duration, microseconds |
| `time_phase_us` | `uint32_t` | Time phase, microseconds |
| `sparate_frames_mode` | `uint32_t` | See the header (spelling as in the header) |
| `endian_mode` | `uint32_t` | Endianness |

##### cim_input_rdma_t
| Field | Type | Description |
| --- | --- | --- |
| `rdma_en` | `uint32_t` | Feedback enable |
| `stride` | `uint32_t` | Read stride |
| `pack_mode` | `uint32_t` | See the header |
| `buff_num` | `uint32_t` | Number of feedback buffers |

##### cim_input_tpg_t
| Field | Type | Description |
| --- | --- | --- |
| `tpg_en` | `uint32_t` | Test pattern enable |
| `fps` | `uint32_t` | Pattern frame rate |

##### vcon_attr_t
| Field | Type | Description |
| --- | --- | --- |
| `attr_valid` | `int32_t` | Whether this group of attributes takes effect |
| `bus_main` | `int32_t` | Primary I2C bus |
| `bus_second` | `int32_t` | Secondary I2C bus |
| `poc_map` | `int32_t` | POC power mapping, taken from the DTS |
| `gpios` | `int32_t[VGPIO_NUM]` | GPIO indices |
| `sensor_err` | `int32_t[SENSOR_ERR_PIN_NUM]` | Sensor err_pin indices |
| `lpwm_chn` | `int32_t[LPWM_CHN_NUM]` | LPWM channel used by each sensor |
| `rx_phy_mode` | `int32_t` | 0 = unused, 1 = D-PHY, 2 = C-PHY |
| `rx_phy_index` | `int32_t` | RX PHY index |
| `rx_phy_link` | `int32_t` | 0 = unused, 1 = CSI, 2 = DSI |
| `tx_phy_mode` | `int32_t` | See the header |
| `tx_phy_index` | `int32_t` | TX PHY index |
| `tx_phy_link` | `int32_t` | TX PHY link index, for composite types |
| `vcon_type` | `int32_t` | 0 = standalone, 1 = composite master, 2 = composite slave |
| `vcon_link` | `int32_t` | VCON link index, for composite types |

##### lpwm_attr_t
| Field | Type | Description |
| --- | --- | --- |
| `lpwm_chn_attr` | `lpwm_chn_attr_t[LPWM_CHN_NUM]` | Per-channel configuration |

##### lpwm_chn_attr_t
| Field | Type | Description |
| --- | --- | --- |
| `enable` | `uint32_t` | Enable this channel |
| `trigger_source` | `uint32_t` | Trigger source select |
| `trigger_mode` | `uint32_t` | Trigger mode |
| `period` | `uint32_t` | Period |
| `offset` | `uint32_t` | Phase offset |
| `duty_time` | `uint32_t` | Pulse width |
| `threshold` | `uint32_t` | See the header |
| `adjust_step` | `uint32_t` | See the header |

#### Extended Attributes

##### vin_attr_ex_t
| Field | Type | Description |
| --- | --- | --- |
| `ex_attr_type` | `vin_attr_ex_type_e` | Which extended attributes take effect |
| `cim_static_attr` | `cim_static_attr_t` | CIM static attributes (watermark interrupt) |
| `mipi_ex_attr` | `mipi_attr_ex_t` | MIPI extended attributes |
| `fps_ctrl` | `dynamic_fps_t` | Frame skip |
| `dynamic_fps_attr` | `lpwm_dynamic_fps_t` | Dynamic frame-rate switching |
| `ipi_reset` | `uint32_t` | MIPI IPI reset |
| `bypass_enable` | `uint32_t` | Bypass enable |

#### Channel Attributes

##### vin_ichn_attr_t
| Field | Type | Description |
| --- | --- | --- |
| `format` | `uint32_t` | Image format |
| `width` | `uint32_t` | Width |
| `height` | `uint32_t` | Height |

##### vin_ochn_attr_t
Indexed by `ochn_id`: `0` main frame / `4` ROI / `3` EMB.

| Field | Type | Description |
| --- | --- | --- |
| `ddr_en` | `uint32_t` | This channel writes to DDR |
| `roi_en` | `uint32_t` | ROI enable |
| `emb_en` | `uint32_t` | EMB enable |
| `rawds_en` | `uint32_t` | 2×2 downsampling enable |
| `pingpong_ring` | `uint32_t` | See the header |
| `ochn_attr_type` | `vin_ochn_attr_type_e` | Which channel attributes take effect |
| `vin_basic_attr` | `vin_basic_attr_t` | Basic attributes for writing DDR |
| `rawds_attr` | `vin_rawds_attr_t` | Downsampling attributes |
| `roi_attr` | `struct vin_roi_attr_s` | Cropping attributes |
| `emb_attr` | `vin_emb_attr_t` | EMB attributes |
| `magicNumber` | `uint32_t` | *framework* |

##### vin_basic_attr_t
| Field | Type | Description |
| --- | --- | --- |
| `pack_mode` | `uint32_t` | How data is written to DDR |
| `wstride` | `uint32_t` | Line stride |
| `vstride` | `uint32_t` | Frame stride |
| `format` | `uint32_t` | Format written to DDR |

##### vin_rawds_attr_t
| Field | Type | Description |
| --- | --- | --- |
| `rawds_mode` | `uint32_t` | Downsampling mode |

##### vin_roi_attr_s
| Field | Type | Description |
| --- | --- | --- |
| `roi_x` | `uint32_t` | Crop origin X |
| `roi_y` | `uint32_t` | Crop origin Y |
| `roi_width` | `uint32_t` | Crop width |
| `roi_height` | `uint32_t` | Crop height |

##### vin_emb_attr_t
| Field | Type | Description |
| --- | --- | --- |
| `embeded_dependence` | `uint32_t` | Whether EMB travels together with the image data |
| `embeded_width` | `uint32_t` | EMB data width |
| `embeded_height` | `uint32_t` | EMB data height |

##### vin_ochn_buff_attr_t
Indexed by `ochn_id`.

| Field | Type | Description |
| --- | --- | --- |
| `buffers_num` | `uint32_t` | Buffer count for this channel |
| `flags` | `int64_t` | Unused by the framework |

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

### API Interface Description
All 13 interfaces below share two conventions, which the individual sections do not repeat.

- **Return value**: `HBN_STATUS_SUCESS` (0) on success, a negative error code on failure (implemented as `-HBN_STATUS_xxx`). The full list is in [Framework - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api#return-value-description) — note that it lists the codes as **positive** (`10`, `13`, …) while the interfaces return them **negated** (`-10`, `-13`, …); the codes VIN actually returns, with what to do about each, are in [Common Return Codes](#common-return-codes).
- **Five macros**: `set_attr` / `set_ichn_attr` / `get_ichn_attr` / `set_ochn_attr` / `get_ochn_attr` forward to the same-named functions with an `_s` suffix, taking the length from `sizeof(*(attr))`. They therefore **cannot take a `void *`**: you must pass a pointer to the concrete type.

#### hbn_vnode_open
Opens the VIN device node and returns the module's vnode handle. Used in pairs with `hbn_vnode_close`.

```c
hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id,
                            int32_t ctx_id, hbn_vnode_handle_t *vnode_fd);
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_type` | `hb_vnode_type` | vnode type; VIN uses `HB_VIN` |
| `hw_id` | `uint32_t` | Hardware id, **the MIPI RX channel number**. Valid values in [Platform Scale](#platform-scale) |
| `ctx_id` | `int32_t` | context id, a software concept; pass a concrete value, or `AUTO_ALLOC_ID` to let the framework allocate one |
| `vnode_fd` | `hbn_vnode_handle_t *` | **Out parameter**, the returned vnode handle |

**Device nodes**: each VIN instance has four nodes under `/dev` — `/dev/vinX_src`, `/dev/vinX_cap`, `/dev/vinX_emb` and `/dev/vinX_roi`, where `X` is the `hw_id`. Going through the `hbn_vnode_*` interfaces normally, you never touch them directly.

#### hbn_vnode_close
Closes the VIN device node and releases the handle. Used in pairs with `hbn_vnode_open`; call `hbn_vflow_stop` first.

```c
hobot_status hbn_vnode_close(hbn_vnode_handle_t vnode_fd);
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | The module's vnode handle |

#### hbn_vnode_set_attr
Sets the module's basic attributes. For VIN this is `vin_attr_t`, which carries the `cim_attr` / `vcon_attr` / `lpwm_attr` sub-module configuration.

```c
/* macro: forwards to hbn_vnode_set_attr_s, length taken from sizeof(*(attr)) */
#define hbn_vnode_set_attr(vnode_fd, attr) \
        hbn_vnode_set_attr_s((vnode_fd), (attr), sizeof(*(attr)))
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | The module's vnode handle |
| `attr` | `vin_attr_t *` | Pointer to the basic attribute structure |

**Key points**

- `magicNumber` inside the attributes must follow the header's convention

#### hbn_vnode_set_ichn_attr
Sets the module's input channel attributes.

```c
/* macro: forwards to hbn_vnode_set_ichn_attr_s, length taken from sizeof(*(attr)) */
#define hbn_vnode_set_ichn_attr(vnode_fd, ichn_id, attr) \
        hbn_vnode_set_ichn_attr_s((vnode_fd), (ichn_id), (attr), sizeof(*(attr)))
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | The module's vnode handle |
| `ichn_id` | `uint32_t` | Input channel id, **fixed to 0 for VIN** |
| `attr` | `vin_ichn_attr_t *` | Input channel attributes (width, height, format) |

**Key points**

- `vin_ichn_attr_t.format` must match the sensor's actual output format

#### hbn_vnode_get_ichn_attr
Reads back the module's input channel attributes.

```c
/* macro: forwards to hbn_vnode_get_ichn_attr_s, length taken from sizeof(*(attr)) */
#define hbn_vnode_get_ichn_attr(vnode_fd, ichn_id, attr) \
        hbn_vnode_get_ichn_attr_s((vnode_fd), (ichn_id), (attr), sizeof(*(attr)))
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | The module's vnode handle |
| `ichn_id` | `uint32_t` | Input channel id, **fixed to 0 for VIN** |
| `attr` | `vin_ichn_attr_t *` | **Out parameter**, the input channel attributes read back |

#### hbn_vnode_set_ochn_attr
Sets the module's output channel attributes.

```c
/* macro: forwards to hbn_vnode_set_ochn_attr_s, length taken from sizeof(*(attr)) */
#define hbn_vnode_set_ochn_attr(vnode_fd, ochn_id, attr) \
        hbn_vnode_set_ochn_attr_s((vnode_fd), (ochn_id), (attr), sizeof(*(attr)))
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | The module's vnode handle |
| `ochn_id` | `uint32_t` | Output channel id, values in the table below |
| `attr` | `vin_ochn_attr_t *` | Output channel attributes (whether to write DDR, packing, width/height strides, format, ROI and EMB parameters) |

**`ochn_id` values**

| Value | Channel | Description |
| --- | --- | --- |
| 0 | `VIN_MAIN_FRAME` | **Data channel**: the main frame, and the only channel that can run Online (OTF) |
| 1 | `VIN_ONLINE` | **Non-data channel**: do not configure it when running Online, and do not fetch frames from it |
| 3 | `VIN_EMB` | **Data channel**: embedded data, DDR only |
| 4 | `VIN_ROI` | **Data channel**: ROI cropping, DDR only |

> Only **three data channels** can hand frames to user space: main frame / EMB / ROI. **Online (OTF) is not a fourth parallel channel — it is an output mode of the main-frame channel**: the main frame can land in DDR and be sent OTF to the ISP or PYM at the same time.

The **EMB channel** carries the line-embedded information the sensor outputs alongside the image (exposure parameters and so on). VIN receives it separately and sends it to DDR separately, without affecting the main frame.

**Key points**

- Channels 3 / 4 are DDR only and do not support Online
- To use a channel in Offline mode, switch it on in the attributes (`vin_ochn_attr[x].ddr_en` / `.emb_en` / `.roi_en`)

#### hbn_vnode_get_ochn_attr
Reads back the module's output channel attributes.

```c
/* macro: forwards to hbn_vnode_get_ochn_attr_s, length taken from sizeof(*(attr)) */
#define hbn_vnode_get_ochn_attr(vnode_fd, ochn_id, attr) \
        hbn_vnode_get_ochn_attr_s((vnode_fd), (ochn_id), (attr), sizeof(*(attr)))
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | The module's vnode handle |
| `ochn_id` | `uint32_t` | Output channel id, same values as `hbn_vnode_set_ochn_attr` |
| `attr` | `vin_ochn_attr_t *` | **Out parameter**, the output channel attributes read back |

#### hbn_vnode_set_ochn_buf_attr
Sets the buffer attributes of an output channel. **This interface is what actually triggers the buffer allocation.**

```c
hobot_status hbn_vnode_set_ochn_buf_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                         hbn_buf_alloc_attr_t *alloc_attr);
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | The module's vnode handle |
| `ochn_id` | `uint32_t` | Output channel id |
| `alloc_attr` | `hbn_buf_alloc_attr_t *` | Holds three members: `buffers_num` / `is_contig` / `flags` |

**Key points**

- Buffers are needed by the channels that write DDR: main frame `vin_ochn_attr[x].ddr_en`, ROI `.roi_en`, EMB `.emb_en`
- In Online mode the main frame does not land in DDR, so no buffer is needed
- **The channel named by `ochn_id` must already be enabled**, otherwise the call returns a not-supported error

#### hbn_vnode_start
Starts the vnode.

```c
hobot_status hbn_vnode_start(hbn_vnode_handle_t vnode_fd);
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | The module's vnode handle |

**Key points**

- Usually `hbn_vflow_start` manages the whole flow, so calling this directly is unnecessary

#### hbn_vnode_stop
Stops the vnode.

```c
hobot_status hbn_vnode_stop(hbn_vnode_handle_t vnode_fd);
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | The module's vnode handle |

**Key points**

- Usually `hbn_vflow_stop` manages the whole flow, so calling this directly is unnecessary

#### hbn_vnode_getframe
Fetches one frame from the given output channel. **Blocking interface.**

```c
hobot_status hbn_vnode_getframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                uint32_t millisecondTimeout, hbn_vnode_image_t *out_img);
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | The module's vnode handle |
| `ochn_id` | `uint32_t` | Output channel id, same values as `hbn_vnode_set_ochn_attr` |
| `millisecondTimeout` | `uint32_t` | Timeout in milliseconds |
| `out_img` | `hbn_vnode_image_t *` | **Out parameter**: frame id, timestamp, and each plane's dma-buf fd and virtual address |

**Key points**

- A fetched frame **must** be returned with `hbn_vnode_releaseframe`, otherwise the buffers run out and fetching stops
- Use `hbn_vnode_getframe_cond` when you need conditional fetching

#### hbn_vnode_releaseframe
Returns one frame.

```c
hobot_status hbn_vnode_releaseframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                    hbn_vnode_image_t *img);
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | The module's vnode handle |
| `ochn_id` | `uint32_t` | Output channel id; must match the one used to fetch |
| `img` | `hbn_vnode_image_t *` | The frame to return |

**Key points**

- Used in pairs with `hbn_vnode_getframe`

#### hbn_vnode_sendframe
Pushes frame data into an input channel, for DDR feedback and similar scenarios.

```c
hobot_status hbn_vnode_sendframe(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
                                 hbn_vnode_image_t *img);
```

| Parameter | Type | Description |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | The module's vnode handle |
| `ichn_id` | `uint32_t` | Input channel id |
| `img` | `hbn_vnode_image_t *` | The frame to push |

**Key points**

- **Blocking interface with a 4 s default timeout**; use `hbn_vnode_sendframe_async` when you do not want to wait
- Not needed for ordinary capture

## Troubleshooting

### Common Return Codes
A failing interface returns a **negative** value — the macro below, negated. These are the codes that **actually come back** when using the `hbn_vnode_*` interfaces:

| Value | Macro | Meaning and next step |
| --- | --- | --- |
| `-8` | `HBN_STATUS_INVALID_NULL_PTR` | A null pointer was passed |
| `-10` | `HBN_STATUS_ILLEGAL_ATTR` | Illegal attribute combination. Most often `vin_node_attr.cim_attr.cim_isp_flyby` and `...cim_pym_flyby` both 1, or the input-source three-way choice not set right; a `vin_ichn_attr.format` that disagrees with the sensor lands here too |
| `-12` | `HBN_STATUS_FLOW_EXIST` | The same stream was created twice |
| `-13` | `HBN_STATUS_FLOW_UNEXIST` | Operation on a stream that does not exist |
| `-20` | `HBN_STATUS_NOT_BINDED` | Binding failed while `hbn_vflow_create` was building the stream |
| `-23` | `HBN_STATUS_NOT_SUPPORT` | The combination is unsupported — operating on a channel that is not enabled, for example |
| `-25` | `HBN_STATUS_NOMEM` | Memory allocation failed |
| `-43` | `HBN_STATUS_NODE_DEQUE_ERROR` | `hbn_vnode_getframe` failed to fetch; a timeout is the most common cause. Usually no frames are arriving at all — check `fs_cnt` in `cim_stat` |
| `-50` | `HBN_STATUS_BIND_NODE_FAIL` | Binding failed: a duplicate binding, or Online binding conditions unmet (not the main-frame channel, or flyby not set to 1) |
| `-786462` | `HBN_STATUS_VIN_OPEN_ICHN_FAIL` | Invalid `hw_id` — `/dev/vin<hw_id>_src` cannot be opened. S100 accepts `0` / `1` / `4` only; S600 accepts `0`–`5` |

> The macros live in `hbn_error.h`. The last row's `HBN_STATUS_VIN_*` is a composite code built by shifting the module number left by 16 bits, which is why the value is so large — `-786462` is `-0xC001E` in hex, easier to read against the header.

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

`status/cfg` confirms whether the board is really running the parameters you set; the error counters in `status/icnt` should all be 0 in normal operation. The nodes are numbered per host: `mipi_host0` / `mipi_host1` / `mipi_host4` (on S600, `mipi_host0`–`mipi_host5`).

Under `param/` are writable debug switches, the common ones being `irq_cnt` (interrupt count threshold, past which the driver disables that interrupt to prevent an interrupt storm), `dbg_value` (turn on debug logging) and `ipi_overst`. **These change the driver's runtime behaviour — do not adjust them on a production configuration.**

## Related Documentation
- [Framework - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api) — generic vnode interfaces and the `vin_attr_t` field tables
- [Camera](/Advanced_development/multimedia_development/multimedia_api/camera_api) — the sensor-side `hbn_camera_*` interfaces
- [Video Processing Framework - VPF/PYM](/Advanced_development/multimedia_development/multimedia_api/vpf_pym_api)
- [Image Signal Processing - ISP](/Advanced_development/multimedia_development/multimedia_api/isp)
