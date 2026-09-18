---
sidebar_position: 4
title: "视频输入 - VIN"
description: "RDK S100/S600 5.5.1.4 VIN（视频输入模块）"
---

# 视频输入 - VIN

> **层级说明**：本篇是【底层多媒体 API】中的 **VIN 模块使用文档**。VIN 在 HBN 框架里是 `HB_VIN` 类型的 vnode，本篇讲清它**是什么、怎么接、有哪些接口、典型怎么用**，读完即可上手开发。通用 vnode 接口的完整字段表见 [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)；Sensor 侧配置见 [相机接口 - Camera](/Advanced_development/multimedia_development/multimedia_api/camera_api)。


## 概述

VIN（Video In）是 HBN 框架中的一个 vnode，负责把相机数据接入 SoC 并交给后级处理（板端头文件 `hbn_vin_cfg.h`，接口前缀 `hbn_vnode_*`）。它是相机通路的第一个环节，由 **MIPI RX / CIM / LPWM / VCON** 四个子模块构成。

<details>
<summary>展开：术语表</summary>

**术语表**

本文档用到的缩写与专有名词。**第一次读建议先扫一眼这几条**——`CPE`、`OTF`、`IPI`、`vnode` 会贯穿全文。

| 缩写 | 说明 |
| --- | --- |
| **VIN** | 视频输入模块，本文档的主题。负责把相机数据接进 SoC 并交给后级 |
| **CIM** | VIN 的子模块。接收 MIPI RX 送来的图像数据，分发给 ISP / PYM 或写入 DDR |
| **MIPI RX** | 接收 MIPI CSI-2 数据的物理接口。S100 有 3 路、S600 有 6 路 |
| **IPI** | 芯片**内部** MIPI RX 与 CIM 之间的数据通路，不是对外协议。1 路相机数据占 1 路 IPI |
| **VC** | MIPI CSI-2 的虚拟通道。一条物理链路可传多路数据，靠 VC 区分 |
| **hw_id** | 打开 VIN 时指定的硬件编号，**即 MIPI RX 通道号** |
| **OTF** | On The Fly，硬件直连。数据不经过 DDR，由 CIM 直接送给 ISP / PYM |
| **Online / Offline** | Online = 走 OTF，数据不落 DDR；Offline = CIM 先把数据写进 DDR，下游再从内存读 |
| **CPE** | 芯片内相机处理单元的物理分组。**只有属于同一 CPE 的 CIM 与 ISP / PYM 之间才能 OTF 直连**，跨 CPE 只能走 Offline |
| **vnode** | HBN 框架对功能模块的抽象。VIN 就是一个 vnode，用 `hbn_vnode_*` 接口操作 |
| **HBN** | 应用侧的模块框架，提供 `hbn_vnode_*` / `hbn_vflow_*` 这组通用接口 |
| **SerDes** | 加串器 / 解串器。把多路相机的数据合并到一条同轴链路传输，SoC 侧再解开 |
| **POC** | Power Over Coax，通过同轴电缆给相机模组供电 |
| **LPWM** | 产生曝光触发脉冲的模块，供需要外部触发的相机使用 |
| **VCON** | 板级连接配置：I2C 总线、POC 供电、GPIO、PHY 映射 |
| **EMB** | Embedded Data，相机随图像一起输出的内嵌数据（曝光、温度等） |
| **ISP** | 图像信号处理器。RAW 数据要经过它才能出图 |
| **PYM** | 金字塔模块，做图像缩小与 ROI |
| **YNR** | 降噪模块 |
| **GDC** | 几何畸变校正 |
| **DDR** | 内存。Offline 模式下图像先写到这里，下游再读 |



</details>

### VIN 在链路中的位置

![VIN 在相机链路中的位置与上下游](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/fig1-vin-position.svg)

### VIN 的四个子模块

| 子模块 | 职责 |
| --- | --- |
| **MIPI RX** | 接收 MIPI CSI-2 数据流，支持 D-PHY / C-PHY，每路 RX 支持多虚拟通道（VC） |
| **CIM** | Camera Interface Manager，把 RX 送来的图像写 DDR（Offline）或直连后级（Online） |
| **LPWM** | 曝光触发与帧同步信号，供需要外部触发的 Sensor 使用 |
| **VCON** | 连接编排：I2C 总线、POC 供电、GPIO、PHY 映射等板级配置 |

### 平台规格

<DocScope products="RDK S100">

| 项目 | S100 |
| --- | --- |
| VIN / CIM 实例 | 3 个 |
| MIPI RX 数量 | 3 个 |
| 每路 RX 虚拟通道（VC） | 4 路 |
| ISP 实例与最大分辨率 | 2 个，4096 × 2160 |
| PYM 实例 | 3 个 |
| YNR 实例 | 1 个 |
| GDC 实例 | 1 个 |
| LPWM 实例 / 通道 | 3 个 / 12 通道 |

</DocScope>

<DocScope products="RDK S600">

| 项目 | S600 |
| --- | --- |
| VIN / CIM 实例 | 6 个 |
| MIPI RX 数量 | 6 个 |
| 每路 RX 虚拟通道（VC） | 4 路 |
| ISP 实例与最大分辨率 | 4 个，5696 × 3328 |
| PYM 实例 | 5 个 |
| YNR 实例 | 4 个 |
| GDC 实例 | 2 个 |
| LPWM 实例 / 通道 | 4 个 / 16 通道 |

</DocScope>

多路相机按 `hw_id` 区分，**`hw_id` 就是 MIPI RX 通道号**。

<DocScope products="RDK S100">

S100 合法的 `hw_id` 为 `0` / `1` / `4`。

> 把 `hw_id` 写死成 `2` 或 `3` 的代码在 S100 上会打开失败。

</DocScope>

<DocScope products="RDK S600">

S600 合法的 `hw_id` 为 `0`–`5`。

</DocScope>


## 软件抽象

VIN 对外是一个 vnode，全部配置集中在 `vin_attr_t` 里一次性下发（`hbn_vnode_set_attr`）；建流与绑定交给 `hbn_vflow_*`。

| 类型 | 作用 | 关键成员 |
| --- | --- | --- |
| `vin_attr_t` | VIN 的全部配置 | `vin_node_attr`、`vin_attr_ex`、`vin_ichn_attr`、`vin_ochn_attr[VIN_TYPE_INVALID]`、`vin_ochn_buff_attr[VIN_TYPE_INVALID]`、`magicNumber` |
| `vin_attr_ex_t` | 扩展属性 | `cim_static_attr`、`mipi_ex_attr`、`fps_ctrl`（跳帧）、`dynamic_fps_attr`（动态帧率）、`ipi_reset`、`bypass_enable` |
| `vin_node_attr_t` | 节点级属性 | `cim_attr`、`vcon_attr`、`lpwm_attr`、`flow_id` |
| `cim_attr_t` | 接入与通路配置 | `mipi_en` / `mipi_rx` / `vc_index` / `ipi_channels`、`cim_isp_flyby`、`cim_pym_flyby`、`rdma_input`、`tpg_input`、`func` |
| `vcon_attr_t` | 板级连接配置 | `bus_main` / `bus_second`、`poc_map`、`gpios[]`、`lpwm_chn[]`、`rx_phy_mode` / `rx_phy_index` |
| `vin_ichn_attr_t` | 输入通道属性 | `width`、`height`、`format` |
| `vin_ochn_attr_t` | 输出通道属性，按 `ochn_id` 索引 | `ddr_en` / `roi_en` / `emb_en` / `rawds_en`、`vin_basic_attr`、`roi_attr`、`emb_attr` |
| `vin_ochn_buff_attr_t` | 输出通道的 buffer 属性 | `buffers_num`、`flags` |

**`hw_id`**：打开 VIN 时指定的硬件编号，**即 MIPI RX 通道号**。

**`ochn_id`**：VIN 对外有 3 个数据通道——`0` 主帧、`4` ROI、`3` EMB。各通道能力见 [API 接口说明](#api-接口说明)。

**接口分属三个库**：`hbn_vnode_*` / `hbn_vflow_*` 在 `libvpf.so`，`hbn_camera_*` 在 `libcam.so`，`hb_mem_*` 在 `libhbmem.so`。

## 一帧数据的流转

| 阶段 | 做什么 |
| --- | --- |
| 触发 | LPWM 产生触发脉冲送给 Sensor（需要外部触发的模组才用） |
| 接收 | Sensor 输出的 MIPI CSI-2 像素流经 MIPI RX 送入 CIM |
| 抓取 | Offline：CIM 把图像写入 DDR；Online：CIM 直连后级 |
| 送出 | Offline：帧在内存中就绪，用户态可读；Online：帧直接进了 ISP / PYM，用户态不参与 |
| 取帧 | 仅 Offline 路径：用户态用 `hbn_vnode_getframe` 拿到帧，用完 `hbn_vnode_releaseframe` 归还 |

LPWM 同时记录触发时刻，随帧信息一起返回，可用于多路相机之间的时间戳对齐。

![一帧数据的完整生命周期](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/fig2-frame-lifecycle.svg)

## CIM 内部结构与可配功能块

CIM 是 VIN 的四个子模块之一，其内部又由若干功能块组成。其中几个功能块对用户是可配的：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/cim-internal.png" alt="CIM 内部结构" width="100%" />

| 功能块 | 位置 | 作用 | 对应配置 |
| --- | --- | --- | --- |
| `TPG` | 每个 IPI 一个 | 测试图案发生器。不接 Sensor 也能出图，用于通路验证 | `vin_node_attr.cim_attr.func.enable_pattern` |
| `ROI` | 三条输出通道上，语义各不相同 | 裁剪。主通道使能后，落 DDR 与送 ISP 的图都会被裁；ROI 通道只能出 DDR；EMB 通道的 ROI 用于从图像里裁出 embedded data | `vin_ochn_attr[x].roi_en`、`vin_ochn_attr[x].roi_attr`（`roi_x` / `roi_y` / `roi_width` / `roi_height`） |
| `EMB` | 每个 IPI 的第三条通道 | 接收 embedded data，支持 `0x12` 类型与嵌入图像内两种形态 | `vin_ochn_attr[x].emb_en`、`vin_ochn_attr[x].emb_attr` |
| `RAWDS` | 主通道 | 2×2 下采样，宽高各减半 | `vin_ochn_attr[x].rawds_en`、`vin_ochn_attr[x].rawds_attr.rawds_mode` |
| `RDMA` | 部分 IPI（S100：CIM0 的 IPI3；S600：CIM3 的 IPI2/IPI3，以各 CIM 的 `rdma-support` 为准） | DDR 回灌，用于调试 | `vin_node_attr.cim_attr.rdma_input.rdma_en` |

`TPG`、MIPI 接入、`RDMA` 三者是**互斥的输入源**，同一时刻只能选一个（见[约束与注意事项](#约束与注意事项)）。

## 通路选择：Online 与 Offline

CIM 抓到的数据有两条出路，由 `vin_attr_t` 里的三个字段决定：

| 字段 | 含义 |
| --- | --- |
| `vin_node_attr.cim_attr.cim_isp_flyby = 1` | CIM 直连 ISP（Online） |
| `vin_node_attr.cim_attr.cim_pym_flyby = 1` | CIM 直连 PYM（Online） |
| `vin_ochn_attr[x].ddr_en = 1` | 该输出通道写 DDR（Offline） |

`vin_node_attr.cim_attr.cim_isp_flyby` 与 `vin_node_attr.cim_attr.cim_pym_flyby` **互斥**，同一时刻只能有一个为 1；而它与 `vin_ochn_attr[x].ddr_en` **不互斥**——主帧可以既落 DDR、同时又 OTF 送一份给 ISP，代价是带宽。

![Online OTF 与 Offline DDR 两条通路](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/fig3-otf-vs-ddr.svg)

### Online（OTF）

CIM 抓到的数据**不落 DDR**，以硬件直连方式送给 ISP 或 PYM。

- 优点：不占 DDR 带宽、延迟低
- 限制：只有主帧通道支持 Online；ROI / EMB 两条旁路不支持；CIM 与下游必须在同一个 CPE 内

### Offline（DDR）

CIM 把数据写进 DDR，下游模块或用户态再从内存读。

- 优点：三条输出通道（主帧 / ROI / EMB）都可用，支持跨 CPE
- 代价：CIM 写一遍、下游读一遍，带宽翻倍，延迟更高

### 怎么选

| 你的场景 | 推荐 | 原因 |
| --- | --- | --- |
| 单路 RAW Sensor | **优先 Online** | 延迟低；需要 ROI / EMB 或存图时改用 Offline |
| 多路 Camera Sensor | **Offline** | 多路通常分布在多个 CPE，而 Online 要求 CIM 与下游同 CPE |
| 需要内嵌数据（EMB） | **Offline** | EMB 只能走 DDR |
| 需要 ROI 裁剪输出 | **Offline** | ROI 通道不支持 Online |
| YUV Sensor（Sensor 内部已做 ISP） | 按下游需求选 | Online 时直连 PYM，且每路 PYM 只能接 1 路并被独占；多路 YUV 只能走 Offline |

### 典型组合

同一颗 CIM 的 4 路 IPI 可以**混合**使用 Online 与 Offline，分给不同的后级。四种典型组合：

| 场景 | 输入 | 输出方式 | 后级 |
| --- | --- | --- | --- |
| 1 | 4 路 RAW Sensor | 4 路 Online（OTF） | ISP |
| 2 | 4 路 RAW Sensor | 4 路 Offline（DDR） | ISP |
| 3 | 4 路 RAW Sensor | 1 路 Online + 3 路 Offline | 两个 ISP |
| 4 | 4 路 YUV Sensor | Offline（DDR） | PYM |

![场景 1　4 路 RAW，全部 Online（OTF）输出至 ISP](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/scenes/cim-scene1.png)

**场景 1　4 路 RAW，全部 Online（OTF）输出至 ISP**

![场景 2　4 路 RAW，全部 Offline（DDR）输出至 ISP](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/scenes/cim-scene2.png)

**场景 2　4 路 RAW，全部 Offline（DDR）输出至 ISP**

![场景 3　4 路 RAW，1 路 Online + 3 路 Offline，分送两个 ISP](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/scenes/cim-scene3.png)

**场景 3　4 路 RAW，1 路 Online + 3 路 Offline，分送两个 ISP**

![场景 4　4 路 YUV，Offline（DDR）输出至 PYM](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/scenes/cim-scene4.png)

**场景 4　4 路 YUV，Offline（DDR）输出至 PYM**

## API 调用流程

![API 典型调用时序](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/fig4-api-sequence.svg)

<details>
<summary>展开：函数调用参考</summary>

**建流与配置**

1. `hbn_vnode_open(HB_VIN, hw_id, AUTO_ALLOC_ID, &handle)` —— 打开一路 VIN，`hw_id` 即 MIPI RX 通道号
2. `hbn_vnode_set_attr(handle, &vin_attr)` —— 一次性下发全局配置。`vin_attr_t` 里含 `vin_node_attr`（`cim_attr` / `vcon_attr` / `lpwm_attr`）、`vin_attr_ex`、`vin_ichn_attr`、`vin_ochn_attr[VIN_TYPE_INVALID]`、`vin_ochn_buff_attr[VIN_TYPE_INVALID]`
3. `hbn_vnode_set_ichn_attr(handle, ichn_id, &ichn_attr)` —— 设输入通道的宽、高、格式
4. `hbn_vnode_set_ochn_attr(handle, ochn_id, &ochn_attr)` —— 逐条设输出通道，`ochn_id` 取 `0` 主帧 / `4` ROI / `3` EMB
5. `hbn_vnode_set_ochn_buf_attr(handle, ochn_id, &alloc_attr)` —— 给落 DDR 的通道配 buffer 数量与内存属性

**建流、绑定与启动**

6. `hbn_vflow_create()` / `hbn_vflow_add_vnode()` / `hbn_vflow_bind_vnode()` —— 建流、把 VIN 挂上去、绑定下游
7. `hbn_camera_attach_to_vin()` —— 把 Sensor 挂到 VIN
8. `hbn_vflow_start()` —— 启动整条流。不用 vflow 统一管理时，也可直接 `hbn_vnode_start(handle)`

**每帧**

9. `hbn_vnode_getframe(handle, ochn_id, timeout, &img)` —— 取帧；用完 `hbn_vnode_releaseframe(handle, ochn_id, &img)` 归还
10. 回灌（RDMA）场景改用 `hbn_vnode_sendframe(handle, ichn_id, &img)` 往输入通道送帧

**收尾**

11. `hbn_vflow_stop()` / `hbn_vnode_close(handle)` —— 停流并释放

</details>

## 快速示例

板上完整样例的编译方法、运行命令、参数说明与运行效果，见示例专题文档：

<DocScope products="RDK S100">

- [sample_vin 使用说明](../02_multimedia_sample/02_sample_vin.md) —— 单路 / 多路取流
- [sample_pipeline 使用说明](../02_multimedia_sample/09_sample_pipeline.md) —— VIN → ISP → YNR → PYM → GDC / 编码的完整通路

</DocScope>

<DocScope products="RDK S600">

- [sample_vin 使用说明](../02_multimedia_sample_s600/02_sample_vin.md) —— 单路 / 多路取流
- [sample_pipeline 使用说明](../02_multimedia_sample_s600/09_sample_pipeline.md) —— VIN → ISP → YNR → PYM → GDC / 编码的完整通路

</DocScope>

### 最小示例

```c
#include <stdio.h>
#include "hbn_vpf_interface.h"
#include "hbn_vin_cfg.h"
#include "hb_mem_mgr.h"

#define AUTO_ALLOC_ID  (-1)   /* 框架自动分配 */

#define VIN_HW_ID 0     /* 即 MIPI RX 通道号 */
#define OCHN_MAIN 0     /* VIN_MAIN_FRAME */

static vin_attr_t vin_attr = {
    .vin_node_attr = {
        .cim_attr = {
            .mipi_en      = 1,       /* 输入源：MIPI */
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
        .format = 43,               /* 以实际 Sensor 输出格式为准 */
    },
    .vin_ochn_attr = {
        [OCHN_MAIN] = {
            .ddr_en = 1,            /* 主帧落 DDR（Offline） */
            .vin_basic_attr = { .format = 43, .wstride = 0, .pack_mode = 1 },
            .magicNumber = 0x12345678,
        },
    },
    .vin_ochn_buff_attr = { [OCHN_MAIN] = { .buffers_num = 6 } },  /* 仅 JSON 建流路径读取；本示例走 set_ochn_buf_attr 生效 */
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

    alloc_attr.buffers_num = 6;   /* 实际生效的 buffer 数在这里 */
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

## 配置结构体定义

完整字段以 SDK 头文件 `hbn_vin_cfg.h` 为准，本节是它的阅读版。字段的**语义**按功能分散在各节——`cim_isp_flyby` / `cim_pym_flyby` 见[通路选择](#通路选择online-与-offline)，`func` 里的 pattern / 跳帧见 [CIM 内部结构与可配功能块](#cim-内部结构与可配功能块)，通道字段见 [API 接口说明](#api-接口说明)。

标「框架填」的字段不用自己设。

### 顶层

#### vin_attr_t

VIN 的全部配置，一次下发给 `hbn_vnode_set_attr`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `vin_node_attr` | `vin_node_attr_t` | 节点级：接入方式与板级连接 |
| `vin_attr_ex` | `vin_attr_ex_t` | 扩展属性 |
| `vin_ochn_attr` | `vin_ochn_attr_t[]` | 输出通道，按 `ochn_id` 索引 |
| `vin_ichn_attr` | `vin_ichn_attr_t` | 输入通道 |
| `vin_ochn_buff_attr` | `vin_ochn_buff_attr_t[]` | 落 DDR 通道的 buffer，按 `ochn_id` 索引 |
| `magicNumber` | `uint32_t` | 框架填 |

### 节点级 —— 接入方式与板级连接

#### vin_node_attr_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `cim_attr` | `cim_attr_t` | 接入与通路选择 |
| `lpwm_attr` | `lpwm_attr_t` | 曝光触发 |
| `vcon_attr` | `vcon_attr_t` | I2C / POC / GPIO / PHY 等板级连接 |
| `flow_id` | `uint32_t` | 框架填 |
| `magicNumber` | `uint32_t` | 框架填 |

#### cim_attr_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `mipi_en` | `uint32_t` | 输入源选择，1 = MIPI |
| `mipi_rx` | `uint32_t` | MIPI RX 通道号 |
| `vc_index` | `uint32_t` | 虚拟通道（VC）号 |
| `ipi_channels` | `uint32_t` | 占用几路 IPI；DOL2 场景用 |
| `cim_pym_flyby` | `uint32_t` | 1 = 直连 PYM（Online） |
| `cim_isp_flyby` | `uint32_t` | 1 = 直连 ISP（Online） |
| `y_uv_swap` | `uint32_t` | 见头文件 |
| `rdma_input` | `cim_input_rdma_t` | DDR 回灌输入 |
| `tpg_input` | `cim_input_tpg_t` | 测试图案输入 |
| `func` | `cim_func_desc_t` | 帧号、跳帧、pattern 等 |

#### cim_func_desc_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `enable_frame_id` | `uint32_t` | 是否给帧打帧号 |
| `set_init_frame_id` | `uint32_t` | 起始帧号 |
| `enable_pattern` | `uint32_t` | 测试图案使能 |
| `skip_frame` | `uint32_t` | 跳帧使能 |
| `input_fps` | `uint32_t` | 输入帧率 |
| `output_fps` | `uint32_t` | 输出帧率 |
| `skip_nums` | `uint32_t` | 每跳几帧 |
| `hw_extract_m` | `uint32_t` | 硬件抽帧比 m/n |
| `hw_extract_n` | `uint32_t` | 硬件抽帧比 m/n |
| `lpwm_trig_sel` | `uint32_t` | 触发源选择 |
| `skip_period_us` | `uint32_t` | 跳帧周期，微秒 |
| `frame_duration_us` | `uint32_t` | 帧周期，微秒 |
| `time_phase_us` | `uint32_t` | 时间相位，微秒 |
| `sparate_frames_mode` | `uint32_t` | 见头文件（原头文件拼写如此） |
| `endian_mode` | `uint32_t` | 字节序 |

#### cim_input_rdma_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `rdma_en` | `uint32_t` | 回灌使能 |
| `stride` | `uint32_t` | 读 stride |
| `pack_mode` | `uint32_t` | 见头文件 |
| `buff_num` | `uint32_t` | 回灌 buffer 数 |

#### cim_input_tpg_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `tpg_en` | `uint32_t` | 测试图案使能 |
| `fps` | `uint32_t` | 图案帧率 |

#### vcon_attr_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `attr_valid` | `int32_t` | 该组属性是否生效 |
| `bus_main` | `int32_t` | 主 I2C 总线 |
| `bus_second` | `int32_t` | 次 I2C 总线 |
| `poc_map` | `int32_t` | POC 供电映射，取自 DTS |
| `gpios` | `int32_t[VGPIO_NUM]` | GPIO 序号 |
| `sensor_err` | `int32_t[SENSOR_ERR_PIN_NUM]` | Sensor err_pin 序号 |
| `lpwm_chn` | `int32_t[LPWM_CHN_NUM]` | 各路 Sensor 用的 LPWM 通道 |
| `rx_phy_mode` | `int32_t` | 0=不用 1=D-PHY 2=C-PHY |
| `rx_phy_index` | `int32_t` | RX PHY 序号 |
| `rx_phy_link` | `int32_t` | 0=不用 1=CSI 2=DSI |
| `tx_phy_mode` | `int32_t` | 见头文件 |
| `tx_phy_index` | `int32_t` | TX PHY 序号 |
| `tx_phy_link` | `int32_t` | TX PHY link 序号，复合类型用 |
| `vcon_type` | `int32_t` | 0=独立 1=复合主 2=复合从 |
| `vcon_link` | `int32_t` | VCON link 序号，复合类型用 |

#### lpwm_attr_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `lpwm_chn_attr` | `lpwm_chn_attr_t[LPWM_CHN_NUM]` | 逐通道配置 |

#### lpwm_chn_attr_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `enable` | `uint32_t` | 该通道使能 |
| `trigger_source` | `uint32_t` | 触发源选择 |
| `trigger_mode` | `uint32_t` | 触发模式 |
| `period` | `uint32_t` | 周期 |
| `offset` | `uint32_t` | 相位偏移 |
| `duty_time` | `uint32_t` | 脉冲宽度 |
| `threshold` | `uint32_t` | 见头文件 |
| `adjust_step` | `uint32_t` | 见头文件 |

### 扩展属性

#### vin_attr_ex_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ex_attr_type` | `vin_attr_ex_type_e` | 哪些扩展属性生效 |
| `cim_static_attr` | `cim_static_attr_t` | CIM 静态属性（水位线中断） |
| `mipi_ex_attr` | `mipi_attr_ex_t` | MIPI 增强属性 |
| `fps_ctrl` | `dynamic_fps_t` | 跳帧 |
| `dynamic_fps_attr` | `lpwm_dynamic_fps_t` | 动态帧率切换 |
| `ipi_reset` | `uint32_t` | MIPI IPI 复位 |
| `bypass_enable` | `uint32_t` | bypass 使能 |

### 通道属性

#### vin_ichn_attr_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `format` | `uint32_t` | 图像格式 |
| `width` | `uint32_t` | 宽 |
| `height` | `uint32_t` | 高 |

#### vin_ochn_attr_t

按 `ochn_id` 索引，`0` 主帧 / `4` ROI / `3` EMB。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ddr_en` | `uint32_t` | 该通道写 DDR |
| `roi_en` | `uint32_t` | ROI 使能 |
| `emb_en` | `uint32_t` | EMB 使能 |
| `rawds_en` | `uint32_t` | 2×2 下采样使能 |
| `pingpong_ring` | `uint32_t` | 见头文件 |
| `ochn_attr_type` | `vin_ochn_attr_type_e` | 哪些通道属性生效 |
| `vin_basic_attr` | `vin_basic_attr_t` | 写 DDR 的基本属性 |
| `rawds_attr` | `vin_rawds_attr_t` | 下采样属性 |
| `roi_attr` | `struct vin_roi_attr_s` | 裁剪属性 |
| `emb_attr` | `vin_emb_attr_t` | EMB 属性 |
| `magicNumber` | `uint32_t` | 框架填 |

#### vin_basic_attr_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `pack_mode` | `uint32_t` | 写 DDR 的方式 |
| `wstride` | `uint32_t` | 行 stride |
| `vstride` | `uint32_t` | 帧 stride |
| `format` | `uint32_t` | 写 DDR 的格式 |

#### vin_rawds_attr_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `rawds_mode` | `uint32_t` | 下采样模式 |

#### vin_roi_attr_s

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `roi_x` | `uint32_t` | 裁剪起点 X |
| `roi_y` | `uint32_t` | 裁剪起点 Y |
| `roi_width` | `uint32_t` | 裁剪宽 |
| `roi_height` | `uint32_t` | 裁剪高 |

#### vin_emb_attr_t

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `embeded_dependence` | `uint32_t` | EMB 是否与图像数据在一起 |
| `embeded_width` | `uint32_t` | EMB 数据宽 |
| `embeded_height` | `uint32_t` | EMB 数据高 |

#### vin_ochn_buff_attr_t

按 `ochn_id` 索引。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `buffers_num` | `uint32_t` | 该通道 buffer 数量 |
| `flags` | `int64_t` | 框架未使用 |


## API 列表

VIN 复用 HBN 的通用 vnode 接口，没有自己的私有 ioctl。常用接口如下：

| 接口 | 功能 |
| --- | --- |
| [`hbn_vnode_open`](#hbn_vnode_open) | 打开 VIN vnode |
| [`hbn_vnode_close`](#hbn_vnode_close) | 关闭 VIN vnode |
| [`hbn_vnode_set_attr`](#hbn_vnode_set_attr) | 设置模块基本属性（`vin_attr_t`） |
| [`hbn_vnode_set_ichn_attr`](#hbn_vnode_set_ichn_attr) | 设置输入通道属性（`vin_ichn_attr_t`） |
| [`hbn_vnode_get_ichn_attr`](#hbn_vnode_get_ichn_attr) | 获取输入通道属性 |
| [`hbn_vnode_set_ochn_attr`](#hbn_vnode_set_ochn_attr) | 设置输出通道属性（`vin_ochn_attr_t`） |
| [`hbn_vnode_get_ochn_attr`](#hbn_vnode_get_ochn_attr) | 获取输出通道属性 |
| [`hbn_vnode_set_ochn_buf_attr`](#hbn_vnode_set_ochn_buf_attr) | 设置输出通道 buffer 属性 |
| [`hbn_vnode_start`](#hbn_vnode_start) | 启动 vnode |
| [`hbn_vnode_stop`](#hbn_vnode_stop) | 停止 vnode |
| [`hbn_vnode_getframe`](#hbn_vnode_getframe) | 获取帧数据 |
| [`hbn_vnode_releaseframe`](#hbn_vnode_releaseframe) | 释放帧数据 |
| [`hbn_vnode_sendframe`](#hbn_vnode_sendframe) | 向输入通道送入帧数据（回灌场景） |

建流与绑定使用 `hbn_vflow_create` / `hbn_vflow_add_vnode` / `hbn_vflow_bind_vnode` / `hbn_vflow_start` / `hbn_vflow_stop` / `hbn_vflow_destroy`，详见 [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)。

## API 接口说明

下文 13 个接口有两条共性约定，各小节不再重复。

- **返回值**：成功返回 `HBN_STATUS_SUCESS`（0），失败返回负值错误码（实现为 `-HBN_STATUS_xxx`）。完整清单见[基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api#返回值说明)——注意那张表按**正值**列出（`10`、`13`…），而接口返回的是它的**负值**（`-10`、`-13`…）；VIN 上实际会遇到的返回码及处理建议见[常见返回码](#常见返回码)。
- **五个宏**：`set_attr` / `set_ichn_attr` / `get_ichn_attr` / `set_ochn_attr` / `get_ochn_attr` 转发到带 `_s` 后缀的同名函数，长度由 `sizeof(*(attr))` 自动取得，因此**不能传 `void *`**，必须传指向具体类型的指针。

### hbn_vnode_open

打开 VIN 的设备节点，返回该模块的 vnode handle。与 `hbn_vnode_close` 成对使用。

```c
hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id,
                            int32_t ctx_id, hbn_vnode_handle_t *vnode_fd);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_type` | `hb_vnode_type` | vnode 类型，VIN 取 `HB_VIN` |
| `hw_id` | `uint32_t` | 硬件 id，**即 MIPI RX 通道号**。合法取值见[平台规模](#平台规格) |
| `ctx_id` | `int32_t` | context id，软件概念；可指定具体值，或传 `AUTO_ALLOC_ID` 由框架自动分配 |
| `vnode_fd` | `hbn_vnode_handle_t *` | **出参**，返回的 vnode handle |


**设备节点**：每个 VIN 实例在 `/dev` 下对应 `/dev/vinX_src`、`/dev/vinX_cap`、`/dev/vinX_emb`、`/dev/vinX_roi` 四个节点，其中 `X` 即 `hw_id`。正常走 `hbn_vnode_*` 接口时不需要直接操作它们。

### hbn_vnode_close

关闭 VIN 设备节点，释放该 handle。需与 `hbn_vnode_open` 成对使用，建议先 `hbn_vflow_stop` 再关闭。

```c
hobot_status hbn_vnode_close(hbn_vnode_handle_t vnode_fd);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |

### hbn_vnode_set_attr

设置模块的基本属性。VIN 的属性为 `vin_attr_t`，其中包含 `cim_attr` / `vcon_attr` / `lpwm_attr` 三段子模块配置。

```c
/* 宏：转发到 hbn_vnode_set_attr_s，长度由 sizeof(*(attr)) 自动取得 */
#define hbn_vnode_set_attr(vnode_fd, attr) \
        hbn_vnode_set_attr_s((vnode_fd), (attr), sizeof(*(attr)))
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `attr` | `vin_attr_t *` | 基本属性结构体指针 |

**要点**

- 属性中的 `magicNumber` 需按头文件约定填写

### hbn_vnode_set_ichn_attr

设置模块的输入通道属性。

```c
/* 宏：转发到 hbn_vnode_set_ichn_attr_s，长度由 sizeof(*(attr)) 自动取得 */
#define hbn_vnode_set_ichn_attr(vnode_fd, ichn_id, attr) \
        hbn_vnode_set_ichn_attr_s((vnode_fd), (ichn_id), (attr), sizeof(*(attr)))
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ichn_id` | `uint32_t` | 输入通道 id，**VIN 固定为 0** |
| `attr` | `vin_ichn_attr_t *` | 输入通道属性（宽、高、格式） |

**要点**

- `vin_ichn_attr_t.format` 需与 Sensor 实际输出格式一致

### hbn_vnode_get_ichn_attr

获取模块的输入通道属性。

```c
/* 宏：转发到 hbn_vnode_get_ichn_attr_s，长度由 sizeof(*(attr)) 自动取得 */
#define hbn_vnode_get_ichn_attr(vnode_fd, ichn_id, attr) \
        hbn_vnode_get_ichn_attr_s((vnode_fd), (ichn_id), (attr), sizeof(*(attr)))
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ichn_id` | `uint32_t` | 输入通道 id，**VIN 固定为 0** |
| `attr` | `vin_ichn_attr_t *` | **出参**，回读到的输入通道属性 |

### hbn_vnode_set_ochn_attr

设置模块的输出通道属性。

```c
/* 宏：转发到 hbn_vnode_set_ochn_attr_s，长度由 sizeof(*(attr)) 自动取得 */
#define hbn_vnode_set_ochn_attr(vnode_fd, ochn_id, attr) \
        hbn_vnode_set_ochn_attr_s((vnode_fd), (ochn_id), (attr), sizeof(*(attr)))
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 输出通道 id，取值见下表 |
| `attr` | `vin_ochn_attr_t *` | 输出通道属性（是否落 DDR、打包方式、宽高 stride、格式、ROI 与 EMB 参数等） |

**`ochn_id` 取值**

| 值 | 通道 | 说明 |
| --- | --- | --- |
| 0 | `VIN_MAIN_FRAME` | **数据通道**：主帧，也是唯一可走 Online（OTF）的通道 |
| 1 | `VIN_ONLINE` | **非数据通道**：走 Online 时不需要配置它，也不要对它取帧 |
| 3 | `VIN_EMB` | **数据通道**：内嵌数据，只能走 DDR |
| 4 | `VIN_ROI` | **数据通道**：ROI 裁剪，只能走 DDR |

> 能给用户取帧的只有 **3 个数据通道**：主帧 / EMB / ROI。**Online（OTF）不是并列的第四个通道，而是主帧通道的一种输出方式**——主帧可以既落 DDR、同时又 OTF 送一份给 ISP 或 PYM。

**EMB 通道**承载的是 Sensor 随图像一起输出的行内信息（曝光参数等）。VIN 单独接收、单独送 DDR，不影响主帧数据。

**要点**

- 通道 3 / 4 只能走 DDR，不支持 Online
- Offline 使用某通道时，需在属性中打开对应开关（`vin_ochn_attr[x].ddr_en` / `.emb_en` / `.roi_en`）

### hbn_vnode_get_ochn_attr

获取模块的输出通道属性。

```c
/* 宏：转发到 hbn_vnode_get_ochn_attr_s，长度由 sizeof(*(attr)) 自动取得 */
#define hbn_vnode_get_ochn_attr(vnode_fd, ochn_id, attr) \
        hbn_vnode_get_ochn_attr_s((vnode_fd), (ochn_id), (attr), sizeof(*(attr)))
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 输出通道 id，取值同 `hbn_vnode_set_ochn_attr` |
| `attr` | `vin_ochn_attr_t *` | **出参**，回读到的输出通道属性 |

### hbn_vnode_set_ochn_buf_attr

设置输出通道的 buffer 属性，**真正发起 buffer 分配的是本接口**。

```c
hobot_status hbn_vnode_set_ochn_buf_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                         hbn_buf_alloc_attr_t *alloc_attr);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 输出通道 id |
| `alloc_attr` | `hbn_buf_alloc_attr_t *` | 含 `buffers_num` / `is_contig` / `flags` 三个成员 |

**要点**

- 需要分配 buffer 的是落 DDR 的通道：主帧 `vin_ochn_attr[x].ddr_en`、ROI `.roi_en`、EMB `.emb_en`
- Online 模式下主帧不落 DDR，可不分配 buffer
- **`ochn_id` 对应的通道必须先使能**，否则返回不支持错误


### hbn_vnode_start

启动 vnode。

```c
hobot_status hbn_vnode_start(hbn_vnode_handle_t vnode_fd);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |

**要点**

- 通常直接用 `hbn_vflow_start` 统一管理整条流，不必单独调用

### hbn_vnode_stop

停止 vnode。

```c
hobot_status hbn_vnode_stop(hbn_vnode_handle_t vnode_fd);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |

**要点**

- 通常直接用 `hbn_vflow_stop` 统一管理整条流，不必单独调用

### hbn_vnode_getframe

从指定输出通道获取一帧，**阻塞接口**。

```c
hobot_status hbn_vnode_getframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                uint32_t millisecondTimeout, hbn_vnode_image_t *out_img);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 输出通道 id，取值同 `hbn_vnode_set_ochn_attr` |
| `millisecondTimeout` | `uint32_t` | 超时时间（毫秒） |
| `out_img` | `hbn_vnode_image_t *` | **出参**，含帧号、时间戳、各 plane 的 dma-buf fd 与虚拟地址 |

**要点**

- 获取到的帧**必须**通过 `hbn_vnode_releaseframe` 归还，否则缓冲区耗尽后无法继续取帧
- 需要按条件取帧时可用 `hbn_vnode_getframe_cond`

### hbn_vnode_releaseframe

归还一帧。

```c
hobot_status hbn_vnode_releaseframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                    hbn_vnode_image_t *img);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 输出通道 id，需与取帧时一致 |
| `img` | `hbn_vnode_image_t *` | 要归还的帧 |

**要点**

- 与 `hbn_vnode_getframe` 成对使用

### hbn_vnode_sendframe

向输入通道送入帧数据，用于回灌等场景。

```c
hobot_status hbn_vnode_sendframe(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
                                 hbn_vnode_image_t *img);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 模块的 vnode handle |
| `ichn_id` | `uint32_t` | 输入通道 id |
| `img` | `hbn_vnode_image_t *` | 要送入的帧 |

**要点**

- **阻塞接口，默认超时 4 s**；不需要等待的场景用 `hbn_vnode_sendframe_async`
- 普通采集场景不需要调用

## 接入评估

选型前先算两笔账：**数据量能不能传**、**通路能不能扛**。

### 数据量计算

一路相机的原始数据量：

```
数据量(bps) = 宽 × 高 × 帧率 × 位深
```

- 1 路 8M RAW12@30fps：`3840 × 2160 × 30 × 12 ≈ 2.99 Gbps`
- 1 路 2M RAW12@30fps：`1920 × 1080 × 30 × 12 ≈ 0.75 Gbps`

> 这是**有效像素**口径。链路实际承载的还要加上 Sensor 的 blanking（消隐期），后文[算例](#算例)给出两者的差距——**核算带宽用含 blanking 的值**。

### IPI 的传输效率

MIPI RX 与 CIM 之间走 IPI 接口。本平台 IPI 默认为 **48bit 模式**，像素时钟标称值见[平台能力上限](#平台能力上限)。两种数据类型每个 clock 能打包的像素数不同：

| 数据类型 | 每个 IPI clock 可传 | 说明 |
| --- | --- | --- |
| RAW（RAW8/10/12/14） | **3 个 pixel** | 3 × 16bit 刚好填满 48bit |
| YUV | **1 个 pixel** | 总线利用率只有 1/3 |

因此同一个 IPI，传 RAW 的可用带宽是传 YUV 的 **3 倍**。**接入 YUV 模组（Sensor 内部已做 ISP）时尤其要注意这条**——它往往先于 PHY 带宽成为瓶颈。

> 48bit 模式与 RAW/YUV 打包比例均取自本平台驱动；像素时钟为驱动标称值，实际按接入配置计算。

### 平台能力上限

<DocScope products="RDK S100">

| 项目 | S100 |
| --- | --- |
| MIPI RX 路数 | 3 个 |
| 每路 RX 的 lane / trio | D-PHY ≤ 4 lane；C-PHY ≤ 3 trio |
| 单 lane / 单 trio 速率范围 | D-PHY 80–4500 Mbps；C-PHY 80–3500 Msps |
| **每路 RX 的 PHY 承载上限** | **D-PHY 18 Gbps**（4 × 4.5）；**C-PHY 约 23.94 Gbps**（3 × 3.5 × 2.28） |
| 每路 RX 的虚拟通道（VC） | 4 个 |
| 每个 CIM 的 IPI 通道数 | 4 个 |
| IPI 像素时钟（标称） | 600 MHz |

</DocScope>

<DocScope products="RDK S600">

| 项目 | S600 |
| --- | --- |
| MIPI RX 路数 | 6 个 |
| 每路 RX 的 lane / trio | D-PHY ≤ 4 lane；C-PHY ≤ 3 trio |
| 单 lane / 单 trio 速率范围 | D-PHY 80–4500 Mbps；C-PHY 80–3500 Msps |
| **每路 RX 的 PHY 承载上限** | **D-PHY 18 Gbps**（4 × 4.5）；**C-PHY 约 23.94 Gbps**（3 × 3.5 × 2.28） |
| 每路 RX 的虚拟通道（VC） | 4 个 |
| 每个 CIM 的 IPI 通道数 | 4 个 |
| IPI 像素时钟（标称） | 670 MHz |

</DocScope>

> 本表的 PHY 速率与像素时钟取自本平台驱动与板级硬件规格。

表里的 PHY 上限由驱动按单 lane 4.5 Gbps（C-PHY 按单 trio 3.5 Gsps）卡校验，超限时 PHY 初始化直接返回失败；C-PHY 的 2.28 是协议标准系数。

> **这是 SoC 侧 PHY 的能力，不是接入链路的实际上限。** 模组多经解串器接入，真实天花板常常是解串器的输出速率——业界主流解串器单 lane 只到 2.5 Gbps（对应单 RX 10 Gbps），此时上面这 18 Gbps 就用不满。规划时按模组规格确认解串器侧速率，别直接拿 18 / 23.9 去算。

### 每个 IPI 的最大接入宽

CIM 每个 IPI 能接收的最大图像宽度不同，由 DTS 的 `max-width` 给出：

<DocScope products="RDK S100">

| CIM | CIM0 | CIM1 | CIM4 |
| --- | --- | --- | --- |
| IPI0 / IPI1 / IPI2 / IPI3（px） | 5696 / 4096 / 4096 / 4096 | 4096 ×4 | 4096 ×4 |

</DocScope>

<DocScope products="RDK S600">

| CIM | CIM0 | CIM1 | CIM2 | CIM3 | CIM4 | CIM5 |
| --- | --- | --- | --- | --- | --- | --- |
| IPI0 / IPI1 / IPI2 / IPI3（px） | 5696 ×4 | 5696 ×4 | 5696 ×4 | 4096 ×4 | 4096 ×4 | 4096 ×4 |

</DocScope>

表中每格按 `IPI0 / IPI1 / IPI2 / IPI3` 排列，`×4` 表示四路相同。

输入宽超过该上限时，CIM 在 `set_ichn_attr` 阶段直接拒绝。

> 注意：除 CIM 层外，MIPI host 的配置校验另有 **width ≤ 4096** 的上限。宽于 4096 的接入两层限制目前不一致，实际接入前需以板端验证为准。

<DocScope products="RDK S100">

**接 4 路宽于 4096 的图像时，只有 CIM0 的第一路 IPI 支持。**

</DocScope>

<DocScope products="RDK S600">

**接 4 路宽于 4096 的图像时，只能用 CIM0 / CIM1 / CIM2。**

</DocScope>

### 搭配计算方法

一张 RX 上挂几路、怎么搭配，按四步算。**PHY、IPI、VC 三道都要过**，任一不过就得调整；PHY 那道按实际用的是 D-PHY 还是 C-PHY 取对应值，两条只需过一条。

**第 1 步 · 单路链路数据量**

```
单路数据量(bps) = 宽 × 高 × 帧率 × 位深 × k
```

- 位深：RAW12 填 `12`，YUV422 填 `16`
- `k` 是含 blanking 的系数。参考值 **RAW 约 1.4、YUV 约 1.2**，随模组 blanking 设置变化——**以模组手册给出的行/帧总长为准**，这里的系数只用于估算

常用配置速查：

| 配置 | 有效像素 | 含 blanking |
| --- | --- | --- |
| 8M RAW12@30 | 2.99 Gbps | 约 4.18 Gbps |
| 8M RAW12@60 | 5.97 Gbps | 约 8.36 Gbps |
| 2M RAW12@30 | 0.75 Gbps | 约 1.05 Gbps |
| 8M YUV422@30 | 3.98 Gbps | 约 4.78 Gbps |
| 2M YUV422@30 | 1.00 Gbps | 约 1.20 Gbps |

**第 2 步 · 三个卡口逐个校验**

这些上限都是 **RX 级**——同一 RX 上所有相机共享同一份预算，不是每路各自一份。

<DocScope products="RDK S100">

| 卡口 | 上限（该 RX 上各路合计不得超过） |
| --- | --- |
| PHY · D-PHY | 4 lane × 4.5 Gbps = 18 Gbps |
| PHY · C-PHY | 3 trio × 3.5 Gsps × 2.28 = 23.94 Gbps |
| IPI · 纯 RAW12 | 600 MHz × 3 pixel × 12 bit = 21.6 Gbps |
| IPI · **含任一路 YUV** | 600 MHz × 1 pixel × 16 bit = **9.6 Gbps** |
| VC 路数 | 4 路 |

</DocScope>

<DocScope products="RDK S600">

| 卡口 | 上限（该 RX 上各路合计不得超过） |
| --- | --- |
| PHY · D-PHY | 4 lane × 4.5 Gbps = 18 Gbps |
| PHY · C-PHY | 3 trio × 3.5 Gsps × 2.28 = 23.94 Gbps |
| IPI · 纯 RAW12 | 670 MHz × 3 pixel × 12 bit = 24.1 Gbps |
| IPI · **含任一路 YUV** | 670 MHz × 1 pixel × 16 bit = **10.72 Gbps** |
| VC 路数 | 4 路 |

</DocScope>

**第 3 步 · 取最紧的那个**

各路数据量之和要同时小于各道上限，**先撞哪个哪个就是瓶颈**。算例一节里 RAW 先撞 PHY、YUV 先撞 IPI，就是这个意思。

**第 4 步 · 不过时按这个顺序调**

1. **压缩模组 blanking**——把 `k` 降下来，不改配置、不损失画质，性价比最高
2. 降帧率或降分辨率
3. 拆到另一个 RX（S100 有 3 个、S600 有 6 个）
4. 改 C-PHY——**只放宽 PHY，不放宽 IPI**，所以 YUV 场景换 C-PHY 没有用

> **最容易踩的一条**：混接时 IPI 上限是**整条 RX 一起掉到 9.6 Gbps**（S600 是 10.72），不是只有那一路 YUV 受这个限制。所以「1 路 YUV + 3 路 8M RAW12」这种搭配，预算按 9.6 算而不是 21.6——光是 3 路 RAW12 含 blanking 就要 12.54 Gbps，已经超了。同一个 RX 上**有 YUV 就按 YUV 的口径算全部**。

### 算例

同样 8M@30fps、同样接在一路 RX 上，**RAW12 能接 4 颗，YUV422 只能接 2 颗**——差别全在 IPI 的打包率。下面按[搭配计算方法](#搭配计算方法)的四步各走一遍。

#### 算例 1：4 颗 8M RAW12@30fps

**① 算数据量**

| 口径 | 单路 | 4 路合计 |
| --- | --- | --- |
| 有效像素（`宽 × 高 × 帧率 × 12`） | 2.99 Gbps | 11.96 Gbps |
| **含 blanking（×1.4）** | 4.18 Gbps | **16.72 Gbps** |

**② 逐个卡口校验**

| 卡口 | 上限 | 4 路合计 | 结论 |
| --- | --- | --- | --- |
| PHY · D-PHY | 18 Gbps | 16.72 Gbps | ✓ 已占 93%，只剩 7% |
| PHY · C-PHY | 23.94 Gbps | 16.72 Gbps | ✓ 占 70% |
| IPI（纯 RAW12） | S100 21.6 Gbps / S600 24.1 Gbps | 16.72 Gbps | ✓ 占 77% |
| VC 路数 | 4 路 | 4 路 | ✓ |

**③ 结论**：D-PHY 下跑得起来，但 PHY 只剩 7% 余量，要稳住 4 路满帧得压缩 Sensor 的 blanking。**改走 C-PHY 则宽裕得多**：PHY 占用降到 70%，瓶颈随之转到 IPI（S100 77%）。成立的前提是模组支持 C-PHY 且解串器输出速率跟得上。实际能否跑满以板端实测为准。

#### 算例 2：4 颗 8M YUV422@30fps

**① 算数据量**

| 口径 | 单路 | 4 路合计 |
| --- | --- | --- |
| 有效像素（`宽 × 高 × 帧率 × 16`） | 3.98 Gbps | 15.93 Gbps |
| **含 blanking（×1.2）** | 4.78 Gbps | **19.11 Gbps** |

**② 逐个卡口校验**

| 卡口 | 上限 | 4 路合计 | 结论 |
| --- | --- | --- | --- |
| PHY · D-PHY | 18 Gbps | 19.11 Gbps | ✗ 超 |
| PHY · C-PHY | 23.94 Gbps | 19.11 Gbps | ✓ 占 80% |
| IPI（含 YUV） | S100 9.6 Gbps / S600 10.72 Gbps | 19.11 Gbps | ✗ 连有效像素的 15.93 都装不下 |
| VC 路数 | 4 路 | 4 路 | ✓ |

**③ 结论**：**4 颗走不通，先撞的是 IPI**——9.6 Gbps 连 4 路的有效像素（15.93）都装不下，PHY 的问题还没轮到。

**这里换 C-PHY 是没用的**，也是它唯一容易误会的地方：C-PHY 把 PHY 那关买通了（19.11 < 23.94，反而过了），但 IPI 上限由像素时钟和打包率决定，和选哪种 PHY 无关，9.6 Gbps 还是 9.6 Gbps。**只要含 YUV，换 PHY 救不了。**

**往下试几颗能行**：

| 颗数 | 含 blanking 合计 | 对 S100 的 9.6 | 对 S600 的 10.72 |
| --- | --- | --- | --- |
| 1 颗 | 4.78 Gbps | ✓ | ✓ |
| 2 颗 | 9.56 Gbps | ✓ 余量不到 1% | ✓ 余 11% |
| 3 颗 | 14.33 Gbps | ✗ | ✗ |

**同一 RX 上最多接 2 颗 8M YUV@30fps**——S100 上还是贴着上限跑的。

**但三路本身不是禁区：贵的是 8M，不是路数。**

| 组合 | 含 blanking 合计 | 对 IPI（S100 9.6 / S600 10.72） |
| --- | --- | --- |
| 2×8M + 1×2M | 10.75 Gbps | ✗ 超——2 颗 8M 已占掉 99.5%，再挂一路 2M 要 1.19 Gbps |
| 1×8M + 2×2M | 7.17 Gbps | ✓ 占 74.7% |
| 1×8M + 3×2M | 8.36 Gbps | ✓ 占 87.1% |

要挂第三路，得先把其中一路 8M 降成 2M。全上 2M 的话 4 路也才 4.78 Gbps，那时先撞的是 VC 的 4 路上限，不是 IPI。

> **规划接入时请按含 blanking 的口径核算，不要用有效像素值**，否则结论会偏乐观。除 PHY 外还必须确认解串器链路速率够不够。

## 约束与注意事项

### 配错会被驱动拒绝

下面这些会**直接返回错误**，容易发现：

| 约束 | 说明 |
| --- | --- |
| `vin_node_attr.cim_attr.cim_isp_flyby` 与 `vin_node_attr.cim_attr.cim_pym_flyby` 不得同时为 1 | Online 直连只能选 ISP 或 PYM 之一 |
| `vin_node_attr.cim_attr.mipi_en` / `...func.enable_pattern` / `...rdma_input.rdma_en` 三者有且仅有一个为 1 | 输入源必须唯一：MIPI、测试图案、DDR 回灌 |
| Online 绑定只允许主帧通道，且 flyby 已置 1 | 其他通道不能作为 Online 绑定的源 |
| Offline 绑定要求对应通道开关已打开 | 主帧需 `vin_ochn_attr[x].ddr_en`、EMB 需 `.emb_en`、ROI 需 `.roi_en` |
| VIN 的输入节点不支持被绑定 | 它是输入侧 |
| YUV422-8bit 输入不允许开 ROI / rawds | 格式限制 |
| Online 绑定要求 CIM 与下游在同一 CPE 内 | 跨 CPE 只能走 Offline；校验在下游模块侧执行 |

### 不报错、但结果不对

下面这些**不会返回错误**，图却出不对——比上面那类更值得逐项核对：

| 坑 | 后果 |
| --- | --- |
| `vin_ochn_attr[x].vin_basic_attr` 里 `pack_mode` 与 `format` 不匹配 | `pack_mode = 0` 让每 pixel 占 2 字节（RAW20 占 4 字节，RAW8 / YUV422-8bit 占 1 字节），`pack_mode = 1` 按实际位深紧凑打包（RAW12 为 `width × 1.5`，RAW10 为 `width × 1.25`）。配错会让 `wstride` 与实际不符，**DDR 里的图像错位** |
| `vin_ichn_attr_t.format` 与 Sensor 实际输出不符 | 能取到帧，但**像素解释错**，图是花的 |

## 排障

### 常见返回码

接口失败返回**负值**，值为下面这些宏取负。下表是走 `hbn_vnode_*` 接口时**实际会返回**的码：

| 返回值 | 宏 | 含义与下一步 |
| --- | --- | --- |
| `-8` | `HBN_STATUS_INVALID_NULL_PTR` | 传了空指针 |
| `-10` | `HBN_STATUS_ILLEGAL_ATTR` | 属性组合非法。最常见是 `vin_node_attr.cim_attr.cim_isp_flyby` 与 `...cim_pym_flyby` 同时为 1，或输入源三选一没配对；`vin_ichn_attr.format` 与 Sensor 实际输出不符也走这里 |
| `-12` | `HBN_STATUS_FLOW_EXIST` | 同一路重复建流 |
| `-13` | `HBN_STATUS_FLOW_UNEXIST` | 对不存在的流做操作 |
| `-20` | `HBN_STATUS_NOT_BINDED` | `hbn_vflow_create` 建流时绑定失败 |
| `-23` | `HBN_STATUS_NOT_SUPPORT` | 该组合不支持。例如对未使能的通道操作 |
| `-25` | `HBN_STATUS_NOMEM` | 内存申请失败 |
| `-43` | `HBN_STATUS_NODE_DEQUE_ERROR` | `hbn_vnode_getframe` 取帧失败，超时是最常见的一种。多半是根本没有帧进来，查 `cim_stat` 的 `fs_cnt` |
| `-50` | `HBN_STATUS_BIND_NODE_FAIL` | 绑定失败：重复绑定、Online 绑定条件不满足（非主帧通道或 flyby 未置 1）都走这里 |
| `-786462` | `HBN_STATUS_VIN_OPEN_ICHN_FAIL` | `hw_id` 无效，打不开 `/dev/vin<hw_id>_src`。S100 只接受 `0` / `1` / `4`，S600 接受 `0`–`5` |

> 宏定义在 `hbn_error.h`。最后一行的 `HBN_STATUS_VIN_*` 是复合码，由模块号左移 16 位拼出，所以数值很大——`-786462` 写成十六进制是 `-0xC001E`，对照时看后者更直观。

### CIM 状态节点

每个 CIM 在 sysfs 下暴露一组只读节点，`cim_stat` 是接入侧排障的第一入口。节点名取自 DTS 地址，读哪颗 CIM 就换成对应地址：

<DocScope products="RDK S100">

```bash
cat /sys/devices/platform/soc/37430000.cim/cim_stat
```

CIM0 / CIM1 / CIM4 分别为 `37430000.cim` / `37630000.cim` / `37c30000.cim`。

</DocScope>

<DocScope products="RDK S600">

```bash
cat /sys/devices/platform/soc/37430000.cim/cim_stat
```

CIM0 ~ CIM5 分别为 `37430000.cim` / `37630000.cim` / `37830000.cim` / `37a30000.cim` / `37c30000.cim` / `37c50000.cim`。

</DocScope>

同一组节点也可从 VIN 侧读：`/sys/class/vps/vin<hw_id>_src/cim_stat`。

`cim_stat` 按输入通路分块打印，块头形如 `CIM IPI0 INFO` ~ `CIM IPI3 INFO`，一块对应一路 IPI；未配置输入源的 IPI 整块不出现：

| 分组 | 字段 | 看什么 |
| --- | --- | --- |
| `source_input` | `mipi` / `test_pattern` / `ddr_in`、`mipi_rx`、`vc_index`、`ipi_channels`、`input_size`、`format` | 接入源是三者中的哪一个；`input_size` 与 Sensor 实际输出是否一致 |
| `online_output` | `isp_flyby`、`pym_flyby` | Online 直连是否按预期打开 |
| `main_channel` | `ddr_en`、`rawds_en`、`format`、`pack_mode`、ROI 参数 | 主帧是否在往 DDR 写 |
| `roi_channel` / `emb_channel` | `emb_en`、`emb_dep`、`emb_width`、`emb_height`、ROI 参数 | 两条旁路通道是否使能、裁剪位置是否正确 |
| `statistics` | `fs_cnt` / `fe_cnt`、`ipi_drop_cnt`、`drop_done_cnt`、`w_err_cnt` / `h_err_cnt`、`emb_size_error_cnt` | 见下表判读 |
| | 主 / `roi` / `emb` 各自的 `dma_done_cnt` / `dma_drop_cnt` / `dma_disable_cnt`，及 `buf queue` 的 `free` / `request` / `process` / `done` / `used`（`ddr_in` 回灌时另有 `rdma` 行） | 各通路搬运情况与 buffer 五态 |

判读：

| 现象 | 含义与下一步 |
| --- | --- |
| `fs_cnt` / `fe_cnt` 不涨 | 帧没进来。往上游查 MIPI 与 Sensor |
| `w_err_cnt` / `h_err_cnt` 增长 | 实际图像宽高与 `vin_ichn_attr` 不符，核对 `input_size` 与 Sensor 输出 |
| `drop_done_cnt` 增长 | 多半是 IPI overflow，即 IPI 带宽不足。回到[接入评估](#接入评估)重算 |
| `ipi_drop_cnt` 增长 | IPI 侧丢帧 |
| `buf queue` 的 `used` 长期不回落 | 应用侧帧未归还，检查 `hbn_vnode_getframe` / `hbn_vnode_releaseframe` 是否配对 |

同目录下另有 `cim_capability`（该 CIM 各 IPI 的宽度上限）与 `regdump`（寄存器快照）可用。

### MIPI 状态节点

```bash
cat /sys/class/vps/mipi_host0/status/cfg    # 实际生效的 MIPI 配置
cat /sys/class/vps/mipi_host0/status/icnt   # 中断错误分类计数
cat /sys/class/vps/mipi_host0/status/regs   # 寄存器快照
```

`status/cfg` 用于确认板上跑的到底是不是你配的那份参数；`status/icnt` 的报错计数正常情况下应全为 0。节点按 host 编号区分，即 `mipi_host0` / `mipi_host1` / `mipi_host4`（S600 为 `mipi_host0`~`mipi_host5`）。

`param/` 下是可写的调试开关，常用的有 `irq_cnt`（中断计数阈值，超过后驱动会关闭该路中断以防中断风暴）、`dbg_value`（打开调试日志）、`ipi_overst`。**这些参数会改变驱动的运行行为，不要在生产配置上随意调整。**

## 相关文档

- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api) —— vnode 通用接口与 `vin_attr_t` 字段表
- [相机接口 - Camera](/Advanced_development/multimedia_development/multimedia_api/camera_api) —— Sensor 侧 `hbn_camera_*` 接口
- [视频处理框架 - VPF/PYM](/Advanced_development/multimedia_development/multimedia_api/vpf_pym_api)
- [图像信号处理 - ISP](/Advanced_development/multimedia_development/multimedia_api/isp)
