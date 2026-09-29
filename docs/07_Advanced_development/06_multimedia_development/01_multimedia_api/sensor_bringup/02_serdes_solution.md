---
sidebar_position: 2
title: "SERDES 接入方案及限制说明"
description: "Camera SERDES 接入方案、模块限制与接入评估"
---

# SERDES 接入方案及限制说明

## 简述

:::doc_scope{products="RDK S100"}
S100 有 3 个 MIPI CSI RX 设备，最多支持 12 路模组接入，同时在接入使用时也有不少限制。本文主要描述接入 SoC 在方案设计时需注意的限制条件及原因，同时列举部分典型使用场景。
:::

:::doc_scope{products="RDK S600"}
S600 有 6 个 MIPI CSI RX 设备，最多支持 24 路模组接入，同时在接入使用时也有不少限制。本文主要描述接入 SoC 在方案设计时需注意的限制条件及原因，同时列举部分典型使用场景。
:::

## 模块简介

SoC 内 Camsys 子系统的各模块示意：

<DocScope products="RDK S100">
![硬件框架](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/s100_hardware_data_path.svg)
</DocScope>

<DocScope products="RDK S600">
![硬件框架简易](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/s600_hardware_framework_simple.png)
</DocScope>

Camera 部分包括 Sensor/SerDes/Poc，Pipeline则有 VIN/ISP/PYM/GDC/STITCH。各模块的基本信息如下：

:::doc_scope{products="RDK S100"}

| 模块   | 设备               | 功能描述                                                                                                                                                                                            | 性能指标                                                                                                                                                                                                               |
| ------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Camera | Sensor             | RAW 模组：内部无 ISP，输出 RAW 数据，内部 HDR(PWL)，可同步；<br/>YUV 模组：内部有 ISP，输出 YUV 数据，可同步                                                                                        | 典型分辨率 8M/2M；典型帧率 30fps；数据格式 RAW12/YUV422；<br/>数据量 `width * height * fps * bit/pixel`                                                                                                                |
| SerDes | MAXIM: GMSL1/GMSL2 | MAX9296A（3G/6G，2 路一体）<br/>MAX96718（3G/6G，2 路独立）<br/>MAX96712（3G/6G，4 路独立）<br/>MAX96724（3G/6G，4 路独立）<br/>MAX96722（3G，4 路）<br/>TI: FPD-Link III（UB954 2 路、UB960 4 路） | Link 速率 3G/6G（MAXIM）/ 3.8G（TI）                                                                                                                                                                                   |
| Pipeline   | MIPI RX            | MIPI CSI-2 CDPHY                                                                                                                                                                                    | 3 路 RX，最多 12 路 Sensor<br/>支持 RAW/YUV 接入同一 RX<br/>CPHY 2.5Gbps×3trio、DPHY 2.5Gbps×4lane<br/>每 RX 支持 4VC(4xIPI)，最多 12 路<br/>最大行长 4096 pixel<br/>若有 1 个 YUV sensor 接入，该 RX 理论带宽 9.6Gbps |
| Pipeline   | MIPI TX            | MIPI CSI-2 V2.1 DPHY                                                                                                                                                                                | 2 路 TX，支持 bypass/idu 输出；2.5Gbps×4lane；<br/>bypass 可任选 RX，idu 最大 2880x2160                                                                                                                                |
| Pipeline   | CIM                | 接入 RX0/RX1/RX4，每个 CIM 有 4 路 IPI                                                                                                                                                              | 仅支持 online 到 ISP0/1 或 PYM0/1，也支持 offline 到 DDR；<br/>若接入 YUV 可直连 PYM0/PYM1，但只能接入 1 路并需独占该 PYM                                                                                              |
| Pipeline   | ISP                | ISP0+ISP1，支持 raw dump，pass through/manual 模式                                                                                                                                                  | 2 x 4K@120fps                                                                                                                                                                                                          |
| Pipeline   | PYM                | PYM0+PYM1 全功能；PYM2 部分功能（仅 offline）                                                                                                                                                       | 2 x 4K@120fps + 1 x 4K@60fps；src 最大 4096x4096                                                                                                                                                                       |
| Pipeline   | GDC                | 仅 1 个 GDC，仅 offline                                                                                                                                                                             | 3840x2160@60fps；最大 3840x2160；最小 100x100                                                                                                                                                                          |
:::

:::doc_scope{products="RDK S600"}

| 模块   | 设备               | 功能描述                                                                                                                                                                                            | 性能指标                                                                                                                                                                                                                 |
| ------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Camera | Sensor             | RAW 模组：内部无 ISP，输出 RAW 数据，内部 HDR(PWL)，可同步；<br/>YUV 模组：内部有 ISP，输出 YUV 数据，可同步                                                                                        | 典型分辨率 8M/2M；典型帧率 30fps；数据格式 RAW12/YUV422；<br/>数据量 `width * height * fps * bit/pixel`                                                                                                                  |
| SerDes | MAXIM: GMSL1/GMSL2 | MAX9296A（3G/6G，2 路一体）<br/>MAX96718（3G/6G，2 路独立）<br/>MAX96712（3G/6G，4 路独立）<br/>MAX96724（3G/6G，4 路独立）<br/>MAX96722（3G，4 路）<br/>TI: FPD-Link III（UB954 2 路、UB960 4 路） | Link 速率 3G/6G（MAXIM）/ 3.8G（TI）                                                                                                                                                                                     |
| Pipeline   | MIPI RX            | MIPI CSI-2 CDPHY                                                                                                                                                                                    | 6 路 RX，最多 24 路 Sensor<br/>支持 RAW/YUV 接入同一 RX<br/>CPHY 2.5Gbps×3trio、DPHY 2.5Gbps×4lane<br/>每 RX 支持 4VC(4xIPI)，最多 24 路<br/>最大行长 4096 pixel<br/>若有 1 个 YUV sensor 接入，该 RX 理论带宽 10.72Gbps |
| Pipeline   | MIPI TX            | MIPI CSI-2 V2.1 DPHY                                                                                                                                                                                | 2 路 TX，支持 bypass/idu 输出；2.5Gbps×4lane                                                                                                                                                                             |
| Pipeline   | CIM                | 接入 RX0/RX1/RX3/RX4，每个 CIM 有 4 路 IPI                                                                                                                                                          | 仅支持 online 到 ISP0/1/3 或 PYM0/1/3，也支持 offline 到 DDR<br/>；若接入 YUV 可直连 PYM0/PYM1/PYM3，但只能接入 1 路并需独占该 PYM                                                                                       |
| Pipeline   | ISP                | ISP0+ISP1+ISP2+ISP3，支持 raw dump，pass through/manual 模式                                                                                                                                        | 4 x 4K@120fps                                                                                                                                                                                                            |
| Pipeline   | PYM                | PYM0+PYM1+PYM2+PYM3 全功能；PYM4 部分功能（仅 offline）                                                                                                                                             | 4 x 4K@120fps + 1 x 4K@60fps；src 最大 4096x4096                                                                                                                                                                         |
| Pipeline   | GDC                | 有 2 个 GDC，仅 offline                                                                                                                                                                             | 3840x2160@60fps；最大 3840x2160；最小 100x100                                                                                                                                                                            |
:::

## 使用限制

在接入方案设计时，需注意部分模块的使用限制，避免出现不能满足需求的场景使用。

### SERDES

#### SER: MAX96717F

只支持 3G 速率，普遍用于 2M 模组。若接入 MAX9296A，需注意其只能使用 3G，不能与 6G 混用。只有 PipeZ 可用，点亮配置时需注意。

#### SER: MAX96717

支持 3G/6G，普遍用于 8M 模组。只有 PipeZ 可用，点亮配置时需注意（与 MAX9295A 的主要差异）。

#### DES: MAX9296A

有 2 路 Link，但 2 个 Link 的速率（3G/6G）不能分开配置，只能都 3G 或 6G 使用。若有 2M(3G)+8M(3G/6G) 混合接入场景，需注意若只能 3G，传 8M 可能带宽不足，需降帧使用；若有 2M(3G)+8M(6G) 混合接入满帧率需求，可替换使用 MAX96718A 或 MAX96712。有 2 路 CSI 输出，但 CSI 的 CLK 不完全独立，会有互相影响，若分开使用需注意时序及可能有断帧影响。

#### DES: MAX96718

有 2 路 Link，与 MAX9296A 基本兼容，支持 2 个 Link 的速率单独配置（参见 MAX96718 寄存器手册 0x1, 0x4）。与 MAX9296A 主要差异，PipeY 与 PipeZ 的数据源需配置选择（参见 0x161）。

#### DES: MAX96712

有 4 路 Link，4 路 Link 的速率 3G/6G 都可独立配置。有 2 路 CSI 输出，但 CSI 的 CLK 不完全独立，会有互相影响，若分开使用需注意时序及可能有断帧影响。

#### DES: MAX96722

有 4 路 Link，与 MAX96712 基本兼容，但只支持 3G 速率。

#### DES: MAX96724

有 4 路 Link，与 MAX96712 功能类同，但只有 4 个 pipe，同时 GPIO 数量更少。

:::note SerDes 速率说明
Maxim 的 SerDes 的 Link 速率有 3G/6G，为传输速率 Gbps，实际有效带宽大概为 2.6G/5.2G，接入 Sensor 时需注意满足带宽需求。
- 8M@30fps 带宽需求：`3840 * 2160 * 30 * 12(raw12) = 2.99Gbps`。
- 2M@30fps 带宽需求：`1920 * 1080 * 30 * 12(raw12) = 746.50Mbps`。
:::

:::tip SerDes 方案设计主要关注点
- 接入场景的模组使用与速率的匹配关系（需满足带宽需求，注意混合接入方式）。
- 各 DES 的 I2C 尽量各自独立，不要挂载其他设备，避免冲突。
- Link 接口排序设计尽量与建议同序，若有差异提前标明。
:::

### MIPI-CSI

#### MIPI RX

:::doc_scope{products="RDK S100"}
S100 RX 使用注意事项：

- 3 路 RX 都是独立的 4lane/3trio，最大 DPHY 2.5Gbps/lane 或 CPHY 2.5Gbps/trio，理论每路 RX 最大可接入 4x8M，受限于 deserial 速率，目前最大只能支持 3 个 8M + 1 个 2M。
- RX 接入 CIM，只支持 online 到本 CPE 内的 ISP（raw）或 PYM（yuv）。
- 不管 raw 还是 yuv 类型模组，每个 RX 都可接入 4 路。

:::note 方案设计主要关注点
- YUV 模组接入若 online 使用则有限制：要独占 PYM。
- CIM 可 online 使用 ISP0/ISP1 的 pass through 模式，但此模式下独占 ISP 设备。
- 每个 ISP 的输入通路为 4(online)+8(offline)，若有 ISP 被独占，尤其注意不能超限。
:::


:::doc_scope{products="RDK S600"}
S600 RX 使用注意事项：

- 6 路 RX 都是独立的 4lane/3trio，最大 DPHY 2.5Gbps/lane 或 CPHY 2.5Gbps/trio，理论每路 RX 最大可接入 4x8M，受限于 deserial 速率，目前最大只能支持 3 个 8M + 1 个 2M。
- 若接入 yuv 类型模组，该 RX 的接入理论带宽为 10.72Gbps。
- RX 接入 CIM，只支持 online 到本 CPE 内的 ISP（raw）或 PYM（yuv）。
- 不管 raw 还是 yuv 类型模组，每个 RX 都可接入 4 路。

:::note 方案设计主要关注点
- YUV 模组接入若 online 使用则有限制：要独占 PYM。
- CIM 可 online 使用 ISP0/ISP1/ISP2/ISP3 的 pass through 模式，但此模式下独占 ISP 设备。
:::


## 接入评估

:::doc_scope{products="RDK S100"}

### 接入带宽计算

Camera 接入时，需评估链路上各模块之间的理论要求和限制。接入通路一般涉及加解串器、MIPI、CIM、ISP（RAW）、PYM、GDC/STITCH（可选）等。接入模组一般分为 RAW/YUV Sensor，RAW Sensor 一般在通路上需要 ISP 处理，对处理性能有要求的需同时考虑通路中相关模块性能以及限制；对于数据接入，前端解串器、MIPI、CIM 的影响更明显。

- **在 DES 侧**：其输出 MIPI 速率需满足总带宽需求，同时还要满足 Camera 输出 timing，S100 上主流的美信解串器最大速率为 2.5G，其他厂商或大速率需额外适配。
- **在 MIPI 侧**：需满足 IPI 总带宽大于 mipiclk 输入数据带宽，否则可能出现 IPI overflow：
  - 其 FIFO 较小，对于有数据累积情况：行长越大，累积时间越长，越容易出现。
  - 若满足 IPI 速率大于 mipiclk 输入速率，则理论上不会产生 IPI overflow。
- 其他的硬件模块的限制可以参考模块规格。

带宽计算，此处均按 RAW16 计算，其他 RAW 尺寸按对应比例换算。Camera 接入实际数据量：

- 1 路 8M RAW16：`3840x2160*2*8*30 ≈ 4Gbps`。
- 1 路 2M YUV：`1920x1080*16*30 ≈ 1Gbps`。

### 平台模块带宽

:::doc_scope{products="RDK S100"}
S100：CIM 的 IPI 速率 600M，48bit，IPI 带宽：600 × 48bit = 28.8Gbps。

| 模块带宽                   | 计算方法                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| MIPI 带宽                  | DPHY：4×2.5G/lane = 10Gbps<br/>CPHY：2.5Gbps × 2.28 × 3trio = 17Gbps                                      |
| IPI 带宽（DPHY/CPHY 共用） | RAW 带宽：600M × 3 × 16 = 28.8Gbps<br/>YUV422-8bit 带宽：600M × 1 × 16 = 9.6Gbps<br/> |

MIPI IPI 传输 RAW 与 YUV 的区别（默认 IPI 使用 48bit 模式）：传 YUV 时一个 IPI clock 只能传 1 个 pixel；传 RAW（位宽 ≤ 16）时一个 IPI clock 可传 3 个 pixel。CIM 的 IPI 速率（pix_clk）为 600M 频率上限，因此 IPI 传输 YUV 带宽限制为 9.6Gbps，RAW 传输 28.8Gbps。S100 通用的解串器最大支持速率是 2.5G，下图按此规格理论计算。CPHY：2.28bits/symbol，计算时需乘以系数。同一个 RX 上混合接入时，由于有 YUV 数据，最大 IPI 传输限制变成 9.6Gbps。
:::

:::doc_scope{products="RDK S600"}
S600：CIM 的 IPI 速率 670M，48bit，IPI 带宽：670 × 48bit = 32.16Gbps。

| 模块带宽                   | 计算方法                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| MIPI 带宽                  | DPHY：4×2.5G/lane = 10Gbps<br/>CPHY：2.5Gbps × 2.28 × 3trio = 17Gbps                                          |
| IPI 带宽（DPHY/CPHY 共用） | RAW 带宽：670M × 3 × 16 = 32.16Gbps<br/>YUV422-8bit 带宽：670M × 1 × 16 = 10.72Gbps<br/> |

MIPI IPI 传输 RAW 与 YUV 的区别（默认 IPI 使用 48bit 模式）：传 YUV 时一个 IPI clock 只能传 1 个 pixel；传 RAW（位宽 ≤ 16）时一个 IPI clock 可传 3 个 pixel。CIM 的 IPI 速率（pix_clk）为 670M 频率上限，因此 IPI 传输 YUV 带宽限制为 10.72Gbps，RAW 传输 32.16Gbps。S600 通用的解串器最大支持速率是 2.5G，下图按此规格理论计算。CPHY：2.28bits/symbol，计算时需乘以系数。同一个 RX 上混合接入时，由于有 YUV 数据，最大 IPI 传输限制变成 9.6Gbps。
:::


:::doc_scope{products="RDK S100"}
### 接入规格支持

S100 系统总共 3 个 RX，每个 RX 有 4 个 IPI，理论可支持 12 路 Camera 接入，支持 CPHY 和 DPHY，不同形态 PHY 带宽限制：C-PHY 17.1Gbps、D-PHY 10Gbps。单个 RX 的接入规格（以 RAW12 计算）：

**RAW 摄像头接入**：

| 配置方案               | 带宽需求 | C-PHY(17.1G)             | D-PHY(10G)               | 可行性                 |
| ---------------------- | -------- | ------------------------ | ------------------------ | ---------------------- |
| 4×8M RAW12 @30fps      | 16.72G   | ✓（PHY 极限）            | ✗（超 PHY）              | 需调整 sensor blanking |
| 3×8M+1×2M RAW12 @30fps | 13.59G   | ✓（PHY:79.5% IPI:47.2%） | ✗（超 PHY）              | 仅 C-PHY               |
| 3×8M RAW12 @30fps      | 12.54G   | ✓（PHY:73.3% IPI:43.5%） | ✗（超 PHY）              | 仅 C-PHY               |
| 2×8M+1×2M RAW12 @30fps | 9.41G    | ✓（PHY:55.0% IPI:32.7%） | ✓（PHY:94.1% IPI:32.7%） | 均可                   |

**YUV 摄像头接入**：

| 配置方案                | 带宽需求 | C-PHY(17.1G)             | D-PHY(10G)               | 可行性         |
| ----------------------- | -------- | ------------------------ | ------------------------ | -------------- |
| 2×8M+1×2M YUV422 @30fps | 10.77G   | ✗（超 IPI）              | ✗（超 IPI+PHY）          | 不可行         |
| 2×8M YUV422 @30fps      | 9.58G    | ✓（PHY:56.0% IPI:99.8%） | ✓（D-PHY 极限）          | 均行，接近极限 |
| 1×8M+3×2M YUV422 @30fps | 8.36G    | ✓（PHY:50.7% IPI:87.1%） | ✓（PHY:83.6% IPI:87.1%） | 均可           |
| 1×8M+2×2M YUV422 @30fps | 7.17G    | ✓（PHY:41.9% IPI:74.7%） | ✓（PHY:71.7% IPI:74.7%） | 均可           |

**混合接入（RAW+YUV）**：

| 配置方案            | 带宽需求 | C-PHY(17.1G)  | D-PHY(10G)      | 可行性                                  |
| ------------------- | -------- | ------------- | --------------- | --------------------------------------- |
| 1×8M RAW + 1×8M YUV | 8.97G    | ✓             | ✓（D-PHY 极限） | 均行，接近极限                          |
| 2×8M RAW + 1×2M YUV | 9.36G    | ✓（IPI 极限） | ✓（IPI 极限）   | 均接近 IPI 极限，需调整 sensor blanking |

此外 S100 的 Camera 通路还支持 RAW8/RAW10/RAW16/RAW20，可根据上述方法计算相应接入组合方案。
:::

:::doc_scope{products="RDK S600"}
<!-- TODO: S600 接入评估（上游 J6P 文档未提供此段，待补充带宽计算与接入规格表） -->
:::
