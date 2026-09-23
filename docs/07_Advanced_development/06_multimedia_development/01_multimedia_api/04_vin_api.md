---
sidebar_position: 4
title: "视频输入 - VIN"
description: "RDK S100/S600 5.5.1.4 VIN（视频输入模块）"
toc_max_heading_level: 4
---

# 视频输入 - VIN

## 概述
VIN（Video In）是 HBN 框架中的一个 vnode，负责把相机数据接入 SoC 并交给后级处理。它是相机通路的第一个环节，由四个子模块构成：

- **MIPI RX**：接收 MIPI CSI-2 数据流，支持 D-PHY / C-PHY；每路 RX 支持多虚拟通道（VC）
- **CIM**：Camera Interface Manager，把 RX 送来的图像分发给后级（Online）或写入 DDR（Offline）
- **LPWM**：曝光触发与帧同步信号，供需要外部触发的 Sensor 使用
- **VCON**：虚拟设备，用于描述硬件接口信息（I2C 总线 / POC / GPIO / MIPI PHY 类型）。向上提供标准化的连接关系，差异由 dts 实现

MIPI RX 与 CIM 的职责与接入能力见[硬件框图](#硬件框图)与[硬件规格](#硬件规格)。

## 硬件框图

<DocScope products="RDK S100">

![整机媒体链路硬件总览：Camera → MIPI Host → CIM → CPE（ISP / PYM / GDC / STITCH）→ IDU](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/media-pipeline-overview.jpeg)

</DocScope>

<DocScope products="RDK S600">

![S600 整机媒体链路硬件总览：Camera×6 → MIPI RX0-5 → CIM0-5 → CPE0-3（ISP / PYM）与 CPElite，offline 经 DDR](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/media-pipeline-overview-s600.png)

</DocScope>

*整机媒体链路硬件总览——VIN 对应其中的接入段：MIPI RX 与 CIM。*

![MIPI RX 与 CIM 的模块结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/mipi-cim-structure.png)

*MIPI-RX 侧的 IPI0-3 送入 CIM，CIM 内四通道各含输入选择、ROI、DEC、RAWDS 与输出。*

MIPI 侧从物理层到接口层：

- **C-PHY / D-PHY** —— MIPI 的物理层
- **CSI2 Host** —— CSI-2 协议控制器，解析数据包并按虚拟通道分流
- **VC0 ~ VC3** —— MIPI CSI-2 的虚拟通道。一条物理链路靠 VC 区分多路数据
- **IPI0 ~ IPI3** —— 芯片**内部** MIPI RX 与 CIM 之间的数据通路，不是对外协议；1 路相机数据占 1 路 IPI
- **IDI** —— 图像数据接口

CIM 侧只有接入与送出的关系：输入为 4 路 IPI，输出对应软件的输出通道——主帧、ROI、EMB。各通道的能力上限见[硬件规格](#硬件规格)。

## 硬件规格

### MIPI RX
<DocScope products="RDK S100">

- MIPI RX 路数：3 个
- 每路 RX 的 lane / trio：D-PHY ≤ 4 lane；C-PHY ≤ 3 trio
- 单 lane / 单 trio 速率范围：D-PHY 80–4500 Mbps；C-PHY 80–3500 Msps
- 每路 RX 的 PHY 承载上限：**D-PHY 18 Gbps**（4 × 4.5）；**C-PHY 约 23.94 Gbps**（3 × 3.5 × 2.28）
- 每路 RX 的虚拟通道（VC）：4 个

</DocScope>

<DocScope products="RDK S600">

- MIPI RX 路数：6 个
- 每路 RX 的 lane / trio：D-PHY ≤ 4 lane；C-PHY ≤ 3 trio
- 单 lane / 单 trio 速率范围：D-PHY 80–4500 Mbps；C-PHY 80–3500 Msps
- 每路 RX 的 PHY 承载上限：**D-PHY 18 Gbps**（4 × 4.5）；**C-PHY 约 23.94 Gbps**（3 × 3.5 × 2.28）
- 每路 RX 的虚拟通道（VC）：4 个

</DocScope>

各路 MIPI RX 与 CIM 的对应关系及可用路数见[硬件框图](#硬件框图)。

### CIM
一个 MIPI RX 对应一个 CIM——S100 共 3 个，S600 共 6 个。

<DocScope products="RDK S100">

- 每个 CIM 的 IPI 通道数：4 个
- IPI 像素时钟（标称）：600 MHz
- 各 IPI 最大接入宽：**CIM0** `IPI0` 5696 px、其余 4096 px；**CIM1** / **CIM4** 均为 4096 px

</DocScope>

<DocScope products="RDK S600">

- 每个 CIM 的 IPI 通道数：4 个
- IPI 像素时钟（标称）：670 MHz
- 各 IPI 最大接入宽：**CIM0** / **CIM1** / **CIM2** 均为 5696 px；**CIM3** / **CIM4** / **CIM5** 均为 4096 px

</DocScope>

### LPWM
<DocScope products="RDK S100">

- LPWM 实例 / 通道：3 个 / 12 通道

</DocScope>

<DocScope products="RDK S600">

- LPWM 实例 / 通道：4 个 / 16 通道

</DocScope>

## 使用说明

### 接入评估

接入前完成带宽评估：

- **单路数据量** = 宽 × 高 × 帧率 × 位深 × k。位深：RAW12 取 12，YUV422 取 16。k 为 blanking 系数，估算取 RAW 1.4、YUV 1.2；精确值以模组手册给出的行/帧总长为准
- **各道上限**均为 RX 级预算，同一 RX 上所有相机共享：

<DocScope products="RDK S100">

| 卡口 | 上限（该 RX 上各路合计不得超过） |
| --- | --- |
| PHY · D-PHY | 4 lane × 4.5 Gbps = 18 Gbps |
| PHY · C-PHY | 3 trio × 3.5 Gsps × 2.28 = 23.94 Gbps |
| IPI · 纯 RAW | 600 MHz × 3 pixel/clock × 12 bit = 21.6 Gbps |
| IPI · 含任一路 YUV | 600 MHz × 1 pixel/clock × 16 bit = **9.6 Gbps** |
| VC 路数 | 4 路 |

</DocScope>

<DocScope products="RDK S600">

| 卡口 | 上限（该 RX 上各路合计不得超过） |
| --- | --- |
| PHY · D-PHY | 4 lane × 4.5 Gbps = 18 Gbps |
| PHY · C-PHY | 3 trio × 3.5 Gsps × 2.28 = 23.94 Gbps |
| IPI · 纯 RAW | 670 MHz × 3 pixel/clock × 12 bit = 24.1 Gbps |
| IPI · 含任一路 YUV | 670 MHz × 1 pixel/clock × 16 bit = **10.72 Gbps** |
| VC 路数 | 4 路 |

</DocScope>

- IPI 上限与 PHY 类型无关：RAW 每 clock 传输 3 个 pixel，YUV 仅 1 个。同一 RX 上存在任一路 YUV 时，IPI 上限即按含 YUV 的口径计算；此时改用 C-PHY 仅放宽 PHY 限制，IPI 上限不变
- **超出上限时依次调整**：压缩模组 blanking 以降低 k，不改变配置、不影响画质 → 降低帧率或分辨率 → 迁移至其他 RX，可用路数见 [MIPI RX](#mipi-rx) → 改用 C-PHY，仅对纯 RAW 场景有效

**算例：4 颗 8M RAW12@30fps**

8M 按 3840 × 2160 算，位深 12、k 取 1.4，单路 = 3840 × 2160 × 30 × 12 × 1.4 ≈ **4.18 Gbps**，四路合计 **16.72 Gbps**，对照上限：

<DocScope products="RDK S100">

| 卡口 | 上限 | 4 路合计 | 占用 |
| --- | --- | --- | --- |
| PHY · D-PHY | 18 Gbps | 16.72 Gbps | 93% |
| PHY · C-PHY | 23.94 Gbps | 16.72 Gbps | 70% |
| IPI · 纯 RAW | 21.6 Gbps | 16.72 Gbps | 77% |

</DocScope>

<DocScope products="RDK S600">

| 卡口 | 上限 | 4 路合计 | 占用 |
| --- | --- | --- | --- |
| PHY · D-PHY | 18 Gbps | 16.72 Gbps | 93% |
| PHY · C-PHY | 23.94 Gbps | 16.72 Gbps | 70% |
| IPI · 纯 RAW | 24.1 Gbps | 16.72 Gbps | 69% |

</DocScope>

**结论**：四路 RAW12 在 D-PHY 下可以跑，占用 93%，余量很小，稳满帧要压缩 blanking；换 C-PHY 后降到 70%。

> 规划接入按**含 blanking** 的口径核算，别用有效像素值；除 PHY 外还需确认解串器链路速率够不够。本节只算带宽，输出方式另见[选型依据](#选型依据)。

### 选型依据
| 你的场景 | 推荐 | 原因 |
| --- | --- | --- |
| 单路 RAW Sensor | **优先 Online** | 延迟低；需要 ROI / EMB 或存图时改用 Offline |
| 多路 Camera Sensor | **Offline** | 多路通常分布在多个 CPE，而 Online 要求 CIM 与下游同 CPE |
| 需要内嵌数据（EMB） | **Offline** | EMB 只能走 DDR |
| 需要 ROI 裁剪输出 | **Offline** | ROI 通道不支持 Online |
| YUV Sensor（Sensor 内部已做 ISP） | 按下游需求选 | Online 时直连 PYM，且每路 PYM 只能接 1 路并被独占；多路 YUV 只能走 Offline |

输出方式由 `vin_attr_t` 的三个字段决定：

- `vin_node_attr.cim_attr.cim_isp_flyby = 1` —— CIM 直连 ISP（Online）
- `vin_node_attr.cim_attr.cim_pym_flyby = 1` —— CIM 直连 PYM（Online）；与 `cim_isp_flyby` 互斥，同一时刻只能有一个为 1
- `vin_ochn_attr[x].ddr_en = 1` —— 该输出通道写 DDR（Offline）；主帧可同时使能两者，落 DDR 之外再 OTF 送一份给 ISP，代价是带宽

### 典型组合
同一颗 CIM 的 4 路 IPI 可以**混合**使用 Online 与 Offline，分给不同的后级。四种典型组合：
![CIM 典型组合：四种场景](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/scenes/cim-scenes-zh.png)

### API 调用流程
![API 调用流程：从打开模块到关闭 vnode 的 11 组调用，含每帧循环](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/vin/fig4-api-flow.png)

<details>
<summary>展开：函数调用参考</summary>

对应上图 12 步，应用程序侧依次调用：

1. `hb_mem_module_open()` —— 打开 hb_mem 内存模块；分配或导入帧缓冲前必须先调
2. `hbn_camera_create(camera_config)` —— 创建 Camera 对象
3. `hbn_vnode_open(HB_VIN, hw_id, AUTO_ALLOC_ID, &handle)` —— 打开一路 VIN，`hw_id` 即 MIPI RX 通道号
4. `hbn_vnode_set_attr(handle, &vin_attr)` —— 一次性下发全局配置。`vin_attr_t` 里含 `vin_node_attr`（`cim_attr` / `vcon_attr` / `lpwm_attr`）、`vin_attr_ex`、`vin_ichn_attr`、`vin_ochn_attr[VIN_TYPE_INVALID]`、`vin_ochn_buff_attr[VIN_TYPE_INVALID]`
5. 通道属性与缓冲，三条调用：
   - `hbn_vnode_set_ichn_attr(handle, ichn_id, &ichn_attr)` —— 设输入通道的宽、高、格式
   - `hbn_vnode_set_ochn_attr(handle, ochn_id, &ochn_attr)` —— 逐条设输出通道，`ochn_id` 取 `0` 主帧 / `4` ROI / `3` EMB
   - `hbn_vnode_set_ochn_buf_attr(handle, ochn_id, &alloc_attr)` —— 给落 DDR 的通道配 buffer 数量与内存属性
6. `hbn_vflow_create()` / `hbn_vflow_add_vnode()` / `hbn_vflow_bind_vnode()` —— 建流、把 VIN 挂上去、绑定下游
7. `hbn_camera_attach_to_vin()` —— 把 Sensor 挂到 VIN
8. `hbn_vflow_start()` —— 启动整条流。不用 vflow 统一管理时，也可直接 `hbn_vnode_start(handle)`
9. `hbn_vnode_getframe(handle, ochn_id, timeout, &img)` —— 取帧
   - 取到帧之后、归还之前，是**用户自己的处理逻辑**（对这一帧做推理、编码、送显等）
10. `hbn_vnode_releaseframe(handle, ochn_id, &img)` —— 用完归还
11. `hbn_vflow_stop()` —— 停流
12. `hbn_vnode_close(handle)` —— 释放 vnode

> 回灌（RDMA）场景改用 `hbn_vnode_sendframe(handle, ichn_id, &img)` 往输入通道送帧。

</details>

### 快速示例
板上完整样例的编译方法、运行命令、参数说明与运行效果，见示例专题文档：

<DocScope products="RDK S100">

- [sample_vin 使用说明](../02_multimedia_sample/02_sample_vin.md) —— 单路 / 多路取流
- [sample_pipeline 使用说明](../02_multimedia_sample/09_sample_pipeline.md) —— VIN → ISP → YNR → PYM → GDC / 编码的完整通路

</DocScope>

<DocScope products="RDK S600">

- [sample_vin 使用说明](../02_multimedia_sample_s600/02_sample_vin.md) —— 单路 / 多路取流
- [sample_pipeline 使用说明](../02_multimedia_sample_s600/09_sample_pipeline.md) —— VIN → ISP → YNR → PYM → GDC / 编码的完整通路

</DocScope>

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

## API 参考

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

## 接口说明
下文 13 个接口有两条共性约定，各小节不再重复。

- **返回值**：成功返回 `HBN_STATUS_SUCESS`（0），失败返回负值错误码（实现为 `-HBN_STATUS_xxx`）。完整清单见[基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api#返回值说明)——注意那张表按**正值**列出（`10`、`13`…），而接口返回的是它的**负值**（`-10`、`-13`…）；VIN 上实际会遇到的返回码及处理建议见[返回值说明](#返回值说明)。
- **五个宏**：`set_attr` / `set_ichn_attr` / `get_ichn_attr` / `set_ochn_attr` / `get_ochn_attr` 转发到带 `_s` 后缀的同名函数，长度由 `sizeof(*(attr))` 自动取得，因此**不能传 `void *`**，必须传指向具体类型的指针。

### hbn_vnode_open

**【函数原型】**

```c
hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id,
                            int32_t ctx_id, hbn_vnode_handle_t *vnode_fd);
```

**【功能描述】**

打开 VIN 的设备节点，返回该模块的 vnode handle。与 `hbn_vnode_close` 成对使用。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_type` | `hb_vnode_type` | 是 | — | vnode 类型，VIN 取 `HB_VIN` |
| `hw_id` | `uint32_t` | 是 | — | 硬件 id，**即 MIPI RX 通道号**。合法取值见 [MIPI RX](#mipi-rx) |
| `ctx_id` | `int32_t` | 是 | `AUTO_ALLOC_ID` | context id，软件概念；可指定具体值，或传 `AUTO_ALLOC_ID` 由框架自动分配 |
| `vnode_fd` | `hbn_vnode_handle_t *` | 是 | — | **出参**，返回的 vnode handle |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

- 每个 VIN 实例在 `/dev` 下对应 `/dev/vinX_src`、`/dev/vinX_cap`、`/dev/vinX_emb`、`/dev/vinX_roi` 四个节点，其中 `X` 即 `hw_id`。正常走 `hbn_vnode_*` 接口时不需要直接操作它们。

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

```c
/* 参考板端 /app/multimedia_samples/sample_vin/ 的最小调用序列 */
hbn_vnode_handle_t vin_fd;
hbn_vnode_open(HB_VIN, hw_id, AUTO_ALLOC_ID, &vin_fd);
```

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

### hbn_vnode_close

**【函数原型】**

```c
hobot_status hbn_vnode_close(hbn_vnode_handle_t vnode_fd);
```

**【功能描述】**

关闭 VIN 设备节点，释放该 handle。需与 `hbn_vnode_open` 成对使用，建议先 `hbn_vflow_stop` 再关闭。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 是 | — | 模块的 vnode handle |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

### hbn_vnode_set_attr

**【函数原型】**

```c
/* 宏：转发到 hbn_vnode_set_attr_s，长度由 sizeof(*(attr)) 自动取得 */
#define hbn_vnode_set_attr(vnode_fd, attr) \
        hbn_vnode_set_attr_s((vnode_fd), (attr), sizeof(*(attr)))
```

**【功能描述】**

设置模块的基本属性。VIN 的属性为 `vin_attr_t`，其中包含 `cim_attr` / `vcon_attr` / `lpwm_attr` 三段子模块配置。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 是 | — | 模块的 vnode handle |
| `attr` | `vin_attr_t *` | 是 | — | 基本属性结构体指针 |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

- `vin_node_attr_t` / `vin_ochn_attr_t` 的 `magicNumber` **要调用方自己填 `0x12345678`**；驱动 `set_attr` / `set_ochn_attr` 会校验，不符直接返回失败
- 这个值不是框架替你填的：`MAGIC_NUMBER` 宏只在驱动内部头 `camsys/vpf/vio_config.h`，发布的 `hbn_vin_cfg.h` 里没有，照板端 sample 写死 `0x12345678` 即可

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

```c
hbn_vnode_set_attr(vin_fd, &vin_attr);          /* vin_attr 见「快速示例」 */
```

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

### hbn_vnode_set_ochn_attr

**【函数原型】**

```c
/* 宏：转发到 hbn_vnode_set_ochn_attr_s，长度由 sizeof(*(attr)) 自动取得 */
#define hbn_vnode_set_ochn_attr(vnode_fd, ochn_id, attr) \
        hbn_vnode_set_ochn_attr_s((vnode_fd), (ochn_id), (attr), sizeof(*(attr)))
```

**【功能描述】**

设置模块的输出通道属性。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 是 | — | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 是 | — | 输出通道 id，取值见下表 |
| `attr` | `vin_ochn_attr_t *` | 是 | — | 输出通道属性（是否落 DDR、打包方式、宽高 stride、格式、ROI 与 EMB 参数等） |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

**`ochn_id` 取值**

| 值 | 通道 | 说明 |
| --- | --- | --- |
| 0 | `VIN_MAIN_FRAME` | **数据通道**：主帧，也是唯一可走 Online（OTF）的通道 |
| 1 | `VIN_ONLINE` | **非数据通道**：走 Online 时不需要配置它，也不要对它取帧 |
| 3 | `VIN_EMB` | **数据通道**：内嵌数据，只能走 DDR |
| 4 | `VIN_ROI` | **数据通道**：ROI 裁剪，只能走 DDR |

> 能给用户取帧的只有 **3 个数据通道**：主帧 / EMB / ROI。**Online（OTF）不是并列的第四个通道，而是主帧通道的一种输出方式**——主帧可以既落 DDR、同时又 OTF 送一份给 ISP 或 PYM。

**EMB 通道**承载的是 Sensor 随图像一起输出的行内信息（曝光参数等）。VIN 单独接收、单独送 DDR，不影响主帧数据。

- 通道 3 / 4 只能走 DDR，不支持 Online
- Offline 使用某通道时，需在属性中打开对应开关（`vin_ochn_attr[x].ddr_en` / `.emb_en` / `.roi_en`）

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

```c
hbn_vnode_set_ochn_attr(vin_fd, OCHN_MAIN, &vin_attr.vin_ochn_attr[OCHN_MAIN]);
```

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

### hbn_vnode_get_ochn_attr

**【函数原型】**

```c
/* 宏：转发到 hbn_vnode_get_ochn_attr_s，长度由 sizeof(*(attr)) 自动取得 */
#define hbn_vnode_get_ochn_attr(vnode_fd, ochn_id, attr) \
        hbn_vnode_get_ochn_attr_s((vnode_fd), (ochn_id), (attr), sizeof(*(attr)))
```

**【功能描述】**

获取模块的输出通道属性。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 是 | — | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 是 | — | 输出通道 id，取值同 `hbn_vnode_set_ochn_attr` |
| `attr` | `vin_ochn_attr_t *` | 是 | — | **出参**，回读到的输出通道属性 |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

### hbn_vnode_set_ichn_attr

**【函数原型】**

```c
/* 宏：转发到 hbn_vnode_set_ichn_attr_s，长度由 sizeof(*(attr)) 自动取得 */
#define hbn_vnode_set_ichn_attr(vnode_fd, ichn_id, attr) \
        hbn_vnode_set_ichn_attr_s((vnode_fd), (ichn_id), (attr), sizeof(*(attr)))
```

**【功能描述】**

设置模块的输入通道属性。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 是 | — | 模块的 vnode handle |
| `ichn_id` | `uint32_t` | 是 | — | 输入通道 id，**VIN 固定为 0** |
| `attr` | `vin_ichn_attr_t *` | 是 | — | 输入通道属性（宽、高、格式） |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

- `vin_ichn_attr_t.format` 需与 Sensor 实际输出格式一致

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

```c
hbn_vnode_set_ichn_attr(vin_fd, 0, &vin_attr.vin_ichn_attr);
```

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

### hbn_vnode_get_ichn_attr

**【函数原型】**

```c
/* 宏：转发到 hbn_vnode_get_ichn_attr_s，长度由 sizeof(*(attr)) 自动取得 */
#define hbn_vnode_get_ichn_attr(vnode_fd, ichn_id, attr) \
        hbn_vnode_get_ichn_attr_s((vnode_fd), (ichn_id), (attr), sizeof(*(attr)))
```

**【功能描述】**

获取模块的输入通道属性。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 是 | — | 模块的 vnode handle |
| `ichn_id` | `uint32_t` | 是 | — | 输入通道 id，**VIN 固定为 0** |
| `attr` | `vin_ichn_attr_t *` | 是 | — | **出参**，回读到的输入通道属性 |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

无

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

### hbn_vnode_set_ochn_buf_attr

**【函数原型】**

```c
hobot_status hbn_vnode_set_ochn_buf_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                         hbn_buf_alloc_attr_t *alloc_attr);
```

**【功能描述】**

设置输出通道的 buffer 属性，**真正发起 buffer 分配的是本接口**。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 是 | — | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 是 | — | 输出通道 id |
| `alloc_attr` | `hbn_buf_alloc_attr_t *` | 是 | — | 含 `buffers_num` / `is_contig` / `flags` 三个成员 |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

- 需要分配 buffer 的是落 DDR 的通道：主帧 `vin_ochn_attr[x].ddr_en`、ROI `.roi_en`、EMB `.emb_en`
- Online 模式下主帧不落 DDR，可不分配 buffer
- **`ochn_id` 对应的通道必须先使能**，否则返回不支持错误

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

### hbn_vnode_start

**【函数原型】**

```c
hobot_status hbn_vnode_start(hbn_vnode_handle_t vnode_fd);
```

**【功能描述】**

启动 vnode。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 是 | — | 模块的 vnode handle |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

- 通常直接用 `hbn_vflow_start` 统一管理整条流，不必单独调用

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

### hbn_vnode_stop

**【函数原型】**

```c
hobot_status hbn_vnode_stop(hbn_vnode_handle_t vnode_fd);
```

**【功能描述】**

停止 vnode。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 是 | — | 模块的 vnode handle |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

- 通常直接用 `hbn_vflow_stop` 统一管理整条流，不必单独调用

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

### hbn_vnode_getframe

**【函数原型】**

```c
hobot_status hbn_vnode_getframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                uint32_t millisecondTimeout, hbn_vnode_image_t *out_img);
```

**【功能描述】**

从指定输出通道获取一帧，**阻塞接口**。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 是 | — | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 是 | — | 输出通道 id，取值同 `hbn_vnode_set_ochn_attr` |
| `millisecondTimeout` | `uint32_t` | 是 | — | 超时时间（毫秒） |
| `out_img` | `hbn_vnode_image_t *` | 是 | — | **出参**，含帧号、时间戳、各 plane 的 dma-buf fd 与虚拟地址 |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

- 获取到的帧**必须**通过 `hbn_vnode_releaseframe` 归还，否则缓冲区耗尽后无法继续取帧
- 需要按条件取帧时可用 `hbn_vnode_getframe_cond`

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

```c
hbn_vnode_image_t img;
hbn_vnode_getframe(vin_fd, OCHN_MAIN, 1000, &img);   /* 超时 1s */
```

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

### hbn_vnode_sendframe

**【函数原型】**

```c
hobot_status hbn_vnode_sendframe(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
                                 hbn_vnode_image_t *img);
```

**【功能描述】**

向输入通道送入帧数据，用于回灌等场景。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 是 | — | 模块的 vnode handle |
| `ichn_id` | `uint32_t` | 是 | — | 输入通道 id |
| `img` | `hbn_vnode_image_t *` | 是 | — | 要送入的帧 |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

- **阻塞接口，默认超时 4 s**；不需要等待的场景用 `hbn_vnode_sendframe_async`
- 普通采集场景不需要调用

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

### hbn_vnode_releaseframe

**【函数原型】**

```c
hobot_status hbn_vnode_releaseframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                    hbn_vnode_image_t *img);
```

**【功能描述】**

归还一帧。

**【参数】**

| 参数 | 类型 | 必选 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `vnode_fd` | `hbn_vnode_handle_t` | 是 | — | 模块的 vnode handle |
| `ochn_id` | `uint32_t` | 是 | — | 输出通道 id，需与取帧时一致 |
| `img` | `hbn_vnode_image_t *` | 是 | — | 要归还的帧 |

**【返回值】**

成功返回 `HBN_STATUS_SUCESS`（`0`）；失败返回负值错误码，VIN 上实际会遇到的见[返回值说明](#返回值说明)。

**【注意事项】**

- 与 `hbn_vnode_getframe` 成对使用

**【兼容性】**

硬件：RDK S100 / RDK S600。

**【示例代码】**

```c
hbn_vnode_releaseframe(vin_fd, OCHN_MAIN, &img);
```

完整可运行版本见[快速示例](#快速示例)与板端 `/app/multimedia_samples/sample_vin/`。

## 数据结构
完整字段以 SDK 头文件 `hbn_vin_cfg.h` 为准，本节是它的阅读版。字段的**语义**按功能分散在各节——`cim_isp_flyby` / `cim_pym_flyby` 见[使用说明](#使用说明)，`func` 里的 pattern / 跳帧见 [注意事项与约束](#注意事项与约束)，通道字段见 [接口说明](#接口说明)。

标「框架填」的字段不用自己设。

### 类型总览
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

**`ochn_id`**：VIN 对外有 3 个数据通道——`0` 主帧、`4` ROI、`3` EMB。各通道能力见 [接口说明](#接口说明)。

**接口分属三个库**：`hbn_vnode_*` / `hbn_vflow_*` 在 `libvpf.so`，`hbn_camera_*` 在 `libcam.so`，`hb_mem_*` 在 `libhbmem.so`。

### 顶层

#### vin_attr_t
VIN 的全部配置，一次下发给 `hbn_vnode_set_attr`。

| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `vin_node_attr` | `vin_node_attr_t` | 节点级属性 | — | — | — |
| `vin_attr_ex` | `vin_attr_ex_t` | 扩展属性 | — | — | — |
| `vin_ochn_attr` | `vin_ochn_attr_t[VIN_TYPE_INVALID]` | 输出通道，按 `ochn_id` 索引 | — | — | — |
| `vin_ichn_attr` | `vin_ichn_attr_t` | 输入通道 | — | — | — |
| `vin_ochn_buff_attr` | `vin_ochn_buff_attr_t[VIN_TYPE_INVALID]` | 落 DDR 通道的 buffer，按 `ochn_id` 索引 | — | — | — |
| `magicNumber` | `uint32_t` | 填 `0x12345678` | `0x12345678` | — | — |

### 节点级属性

#### vin_node_attr_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `cim_attr` | `cim_attr_t` | 接入与通路选择 | — | — | — |
| `lpwm_attr` | `lpwm_attr_t` | 曝光触发 | — | — | — |
| `vcon_attr` | `vcon_attr_t` | I2C / POC / GPIO / PHY 等板级连接 | — | — | — |
| `flow_id` | `uint32_t` | 框架填 | — | — | 框架回填 |
| `magicNumber` | `uint32_t` | **必填 `0x12345678`**。驱动 `set_attr` 校验这个值，不符直接返回失败 | `0x12345678` | — | 必须等于驱动内部宏 `MAGIC_NUMBER` |

#### cim_attr_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `mipi_en` | `uint32_t` | 输入源选择，1 = MIPI | 1 | 0 | `0` / `1`，与 `func.enable_pattern`、`rdma_input.rdma_en` 三选一 |
| `mipi_rx` | `uint32_t` | MIPI RX 通道号 | 0 | — | S100 `0` / `1` / `4`；S600 `0`~`5` |
| `vc_index` | `uint32_t` | 虚拟通道（VC）号 | 0 | 0 | `0`~`3` |
| `ipi_channels` | `uint32_t` | 这次接入占用几路 IPI：单路取 `1`，DOL2 取 `2`。上限 2，超过会被驱动拒绝 | 1 | — | `1`~`2`，DOL2 取 2 |
| `cim_pym_flyby` | `uint32_t` | 1 = 直连 PYM（Online） | 0 | 0 | `0` / `1`，与 `cim_isp_flyby` 互斥 |
| `cim_isp_flyby` | `uint32_t` | 1 = 直连 ISP（Online） | 0 | 0 | `0` / `1`，与 `cim_pym_flyby` 互斥 |
| `y_uv_swap` | `uint32_t` | YUV422 输入的 Y / UV 字节序交换开关：`0` 不换（默认）、`1` 交换。Sensor 输出的 YUV 字节序与平台不一致时才开；RAW 输入不受影响 | 0 | 0 | `0` / `1` |
| `rdma_input` | `cim_input_rdma_t` | DDR 回灌输入 | — | — | — |
| `tpg_input` | `cim_input_tpg_t` | 测试图案输入 | — | — | — |
| `func` | `cim_func_desc_t` | 帧号、跳帧、pattern 等 | — | — | — |

#### cim_func_desc_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `enable_frame_id` | `uint32_t` | 是否给帧打帧号 | 1 | 0 | `0` / `1` |
| `set_init_frame_id` | `uint32_t` | 起始帧号 | 0 | 0 | `0` 起 |
| `enable_pattern` | `uint32_t` | 测试图案使能 | 0 | 0 | `0` / `1`，与 MIPI 输入、`rdma_en` 三选一 |
| `skip_frame` | `uint32_t` | **跳帧模式，不是开关**：`0` 不跳、`1` 按帧率比跳、`2` 跳前 N 帧、`3` 硬件抽帧、`4` 软同步、`5` `6` 软件定时。≥ `7` 非法；TPG 模式下不允许跳帧 | 0 | 0 | `0`~`6` |
| `input_fps` | `uint32_t` | 模式 `1` `4` 用，输入帧率，**必须大于** `output_fps` | — | 0 | 模式 `1` `4` 时须大于 `output_fps` |
| `output_fps` | `uint32_t` | 模式 `1` `4` 用，输出帧率，**必须小于** `input_fps` | — | 0 | 模式 `1` `4` 时须小于 `input_fps` |
| `skip_nums` | `uint32_t` | 模式 `2` 用，上电先跳掉几帧 | — | 0 | 模式 `2` 用 |
| `hw_extract_m` | `uint32_t` | 模式 `3` 用，硬件抽帧比：**m / n 二者之一是 1**，另一个 ≤ 63 | — | 0 | `0`~`63`，模式 `3` 时 m / n 之一是 1 |
| `hw_extract_n` | `uint32_t` | 模式 `3` 用，同上 | — | 0 | `0`~`63`，同上 |
| `lpwm_trig_sel` | `uint32_t` | 用哪路 LPWM 做触发对齐，取值 `[0, 12)`；填 `0xffff` 表示不用 | `0xffff` | `0xffff` | `0`~`11`，或 `0xffff` 表示不用 |
| `skip_period_us` | `uint32_t` | 模式 `5` `6` 用，跳帧周期（微秒），**必须 ≥ `frame_duration_us`** | — | 0 | 模式 `5` `6` 时必须 ≥ `frame_duration_us` |
| `frame_duration_us` | `uint32_t` | 模式 `5` `6` 用，帧周期（微秒），不能为 0 | — | 0 | 模式 `5` `6` 时不能为 0 |
| `time_phase_us` | `uint32_t` | 模式 `5` `6` 用，相位对齐窗口（微秒） | — | — | — |
| `sparate_frames_mode` | `uint32_t` | 驱动未使用（头文件拼写如此），填 `0` | 0 | 0 | 驱动未使用 |
| `endian_mode` | `uint32_t` | 写 DDR 时的字节序 | — | — | — |

#### cim_input_rdma_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `rdma_en` | `uint32_t` | 回灌使能 | 0 | 0 | `0` / `1`，与 MIPI 输入、`enable_pattern` 三选一 |
| `stride` | `uint32_t` | 读 stride | — | — | — |
| `pack_mode` | `uint32_t` | 回灌数据的打包方式，口径同 `vin_basic_attr_t.pack_mode`；`stride` 由它与格式算出 | 1 | 0 | `0` / `1` |
| `buff_num` | `uint32_t` | 回灌 buffer 数 | — | — | — |

#### cim_input_tpg_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `tpg_en` | `uint32_t` | 测试图案使能 | 0 | 0 | `0` / `1` |
| `fps` | `uint32_t` | 图案帧率 | — | — | — |

#### vcon_attr_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `attr_valid` | `int32_t` | 该组属性是否生效 | 1 | 0 | `0` / `1` |
| `bus_main` | `int32_t` | 主 I2C 总线 | — | — | — |
| `bus_second` | `int32_t` | 次 I2C 总线 | — | — | — |
| `poc_map` | `int32_t` | POC 供电映射，取自 DTS | — | — | — |
| `gpios` | `int32_t[VGPIO_NUM]` | GPIO 序号 | — | — | — |
| `sensor_err` | `int32_t[SENSOR_ERR_PIN_NUM]` | Sensor err_pin 序号 | — | — | — |
| `lpwm_chn` | `int32_t[LPWM_CHN_NUM]` | 各路 Sensor 用的 LPWM 通道 | — | — | — |
| `rx_phy_mode` | `int32_t` | 0=不用 1=D-PHY 2=C-PHY | 0 | 0 | `0` 不用 / `1` D-PHY / `2` C-PHY |
| `rx_phy_index` | `int32_t` | RX PHY 序号 | — | — | — |
| `rx_phy_link` | `int32_t` | 0=不用 1=CSI 2=DSI | 0 | 0 | `0` 不用 / `1` CSI / `2` DSI |
| `tx_phy_mode` | `int32_t` | 这个 vcon 是否用 MIPI 发送（TX）PHY：`0` 不用、`1` 按 CSI、`2` 按 DSI。非 0 时配合 `tx_phy_index` 注册为 TX 侧设备，供旁路（bypass）链路查找 | 0 | 0 | `0` 不用 / `1` CSI / `2` DSI |
| `tx_phy_index` | `int32_t` | TX PHY 序号 | — | — | — |
| `tx_phy_link` | `int32_t` | TX PHY link 序号，复合类型用 | — | — | — |
| `vcon_type` | `int32_t` | 0=独立 1=复合主 2=复合从 | 0 | 0 | `0` 独立 / `1` 复合主 / `2` 复合从 |
| `vcon_link` | `int32_t` | VCON link 序号，复合类型用 | — | — | — |

#### lpwm_attr_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `lpwm_chn_attr` | `lpwm_chn_attr_t[LPWM_CHN_NUM]` | 逐通道配置 | — | — | — |

#### lpwm_chn_attr_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `enable` | `uint32_t` | 该通道使能 | 0 | 0 | `0` / `1` |
| `trigger_source` | `uint32_t` | 触发源选择 | 0 | 0 | `0` / `1` |
| `trigger_mode` | `uint32_t` | 触发模式 | 0 | 0 | `0` / `1` |
| `period` | `uint32_t` | 周期 | — | — | — |
| `offset` | `uint32_t` | 相位偏移 | — | — | — |
| `duty_time` | `uint32_t` | 脉冲宽度 | — | — | — |
| `threshold` | `uint32_t` | 缓慢同步的相位误差门限（微秒），取值 0~65535。`0` 表示关闭缓慢同步；非 0 时按 `adjust_step` 逐步把触发相位拉向同步源，**并要求 `offset` 小于 `period`** | 0 | 0 | `0`~`65535`，单位 µs；`0` 关闭缓慢同步 |
| `adjust_step` | `uint32_t` | 缓慢同步每次调整的步进量，取值 0~15。仅在 `threshold` 非 0 时起作用 | 0 | 0 | `0`~`15` |

### 扩展属性

#### vin_attr_ex_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `ex_attr_type` | `vin_attr_ex_type_e` | 哪些扩展属性生效 | — | — | — |
| `cim_static_attr` | `cim_static_attr_t` | CIM 静态属性（水位线中断） | — | — | — |
| `mipi_ex_attr` | `mipi_attr_ex_t` | MIPI 增强属性 | — | — | — |
| `fps_ctrl` | `dynamic_fps_t` | 跳帧 | — | — | — |
| `dynamic_fps_attr` | `lpwm_dynamic_fps_t` | 动态帧率切换 | — | — | — |
| `ipi_reset` | `uint32_t` | MIPI IPI 复位 | — | — | — |
| `bypass_enable` | `uint32_t` | bypass 使能 | — | — | — |

### 通道属性

#### vin_ichn_attr_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `format` | `uint32_t` | 图像格式 | `HW_FORMAT_RAW10` | — | 见 `hb_vpm_data_info.h` 的 `HW_FORMAT_*` |
| `width` | `uint32_t` | 宽 | — | — | — |
| `height` | `uint32_t` | 高 | — | — | — |

#### vin_ochn_attr_t
按 `ochn_id` 索引，`0` 主帧 / `4` ROI / `3` EMB。

| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `ddr_en` | `uint32_t` | 该通道写 DDR | 0 | 0 | `0` / `1` |
| `roi_en` | `uint32_t` | ROI 使能 | 0 | 0 | `0` / `1`，`roi_width` ≥ 32 且 4 对齐 |
| `emb_en` | `uint32_t` | EMB 使能 | 0 | 0 | `0` / `1` |
| `rawds_en` | `uint32_t` | 2×2 下采样使能 | 0 | 0 | `0` / `1`，仅主帧通道生效 |
| `pingpong_ring` | `uint32_t` | 底层 buffer 保留模式：`0` 不保留，应用层不归还就暂停输出；`1` 底层自留 2 块轮转，硬件持续出帧。VIN 主帧通常配 `1` | — | — | — |
| `ochn_attr_type` | `vin_ochn_attr_type_e` | 哪些通道属性生效 | `VIN_BASIC_ATTR` | — | `VIN_BASIC_ATTR` / `VIN_EMB_ATTR` / `VIN_ROI_ATTR` / `VIN_RAWDS_ATTR` |
| `vin_basic_attr` | `vin_basic_attr_t` | 写 DDR 的基本属性 | — | — | — |
| `rawds_attr` | `vin_rawds_attr_t` | 下采样属性 | — | — | — |
| `roi_attr` | `struct vin_roi_attr_s` | 裁剪属性 | — | — | — |
| `emb_attr` | `vin_emb_attr_t` | EMB 属性 | — | — | — |
| `magicNumber` | `uint32_t` | **必填 `0x12345678`**。驱动 `set_ochn_attr` 校验这个值，不符直接返回失败 | `0x12345678` | — | 必须等于驱动内部宏 `MAGIC_NUMBER` |

#### vin_basic_attr_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `pack_mode` | `uint32_t` | 写 DDR 的方式 | 1 | 0 | `0` / `1` |
| `wstride` | `uint32_t` | 行 stride | — | — | — |
| `vstride` | `uint32_t` | 帧 stride | — | — | — |
| `format` | `uint32_t` | 写 DDR 的格式 | — | — | — |

#### vin_rawds_attr_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `rawds_mode` | `uint32_t` | 下采样模式 | 0 | 0 | `0` / `1` |

#### vin_roi_attr_s
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `roi_x` | `uint32_t` | 裁剪起点 X | — | — | — |
| `roi_y` | `uint32_t` | 裁剪起点 Y | — | — | — |
| `roi_width` | `uint32_t` | 裁剪宽 | — | — | — |
| `roi_height` | `uint32_t` | 裁剪高 | — | — | — |

#### vin_emb_attr_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `embeded_dependence` | `uint32_t` | EMB 是否与图像数据在一起 | 0 | 0 | `0` / `1` |
| `embeded_width` | `uint32_t` | EMB 数据宽 | — | — | — |
| `embeded_height` | `uint32_t` | EMB 数据高 | — | — | — |

#### vin_ochn_buff_attr_t
按 `ochn_id` 索引。

| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `buffers_num` | `uint32_t` | 该通道 buffer 数量 | 6 | — | 按通路缓冲需求 |
| `flags` | `int64_t` | 驱动未使用，填 `0` | 0 | 0 | 驱动未使用 |
## 返回值说明
接口失败返回**负值**，值为下表的宏取负。下表是走 `hbn_vnode_*` 接口时**实际会返回**的码：

| 错误码 | 宏定义 | 描述 | 常见原因 | 解决方法 |
| --- | --- | --- | --- | --- |
| `-8` | `HBN_STATUS_INVALID_NULL_PTR` | 传了空指针 | 必填参数传了 `NULL` | 检查传入的结构体指针 |
| `-10` | `HBN_STATUS_ILLEGAL_ATTR` | 属性组合非法 | `cim_isp_flyby` 与 `cim_pym_flyby` 同时为 1；输入源三选一没配对；`vin_ichn_attr.format` 与 Sensor 实际输出不符 | 按[注意事项与约束](#注意事项与约束)逐项核对 |
| `-12` | `HBN_STATUS_FLOW_EXIST` | 同一路重复建流 | 对同一 `hw_id` 重复 `hbn_vflow_create` | 复用已有流，或先 `hbn_vflow_destroy` |
| `-13` | `HBN_STATUS_FLOW_UNEXIST` | 对不存在的流做操作 | 流已销毁，句柄失效 | 核对句柄的生命周期 |
| `-20` | `HBN_STATUS_NOT_BINDED` | 建流时绑定失败 | `hbn_vflow_create` 未绑定或绑定顺序不对 | 按「API 调用流程」的顺序建流与绑定 |
| `-23` | `HBN_STATUS_NOT_SUPPORT` | 该组合不支持 | 对未使能的通道取帧或设属性 | 先打开对应通道开关（`ddr_en` / `roi_en` / `emb_en`） |
| `-25` | `HBN_STATUS_NOMEM` | 内存申请失败 | 缓冲数量或分辨率超出可用内存 | 调小 `buffers_num` 或分辨率 |
| `-43` | `HBN_STATUS_NODE_DEQUE_ERROR` | `hbn_vnode_getframe` 取帧失败 | 超时最常见，多半根本没有帧进来 | 查 `cim_stat` 的 `fs_cnt`，往上游查 MIPI 与 Sensor |
| `-50` | `HBN_STATUS_BIND_NODE_FAIL` | 绑定失败 | 重复绑定；Online 绑定条件不满足（非主帧通道，或 flyby 未置 1） | 核对 `ochn_id` 是否为 `0`、flyby 是否已置 1 |
| `-786462` | `HBN_STATUS_VIN_OPEN_ICHN_FAIL` | `hw_id` 无效 | 打不开 `/dev/vin<hw_id>_src` | 用 [MIPI RX](#mipi-rx) 里的合法 `hw_id` |

> 宏定义在 `hbn_error.h`。最后一行的 `HBN_STATUS_VIN_*` 是复合码，由模块号左移 16 位拼出，所以数值很大——`-786462` 写成十六进制是 `-0xC001E`，对照时看后者更直观。

## 排障

### 注意事项与约束

以下组合会被驱动直接拒绝，容易发现：

- `cim_isp_flyby` 与 `cim_pym_flyby` 不得同时为 1——Online 直连只能选 ISP 或 PYM 之一
- `mipi_en`、`func.enable_pattern`、`rdma_input.rdma_en` 三者有且仅有一个为 1——输入源必须唯一
- Online 绑定只允许主帧通道，且 flyby 已置 1；Offline 绑定要求对应通道开关已打开——主帧需 `ddr_en`、EMB 需 `.emb_en`、ROI 需 `.roi_en`
- YUV422-8bit 输入不允许开 ROI 或 RAWDS
- TPG 模式下不允许跳帧，`func.skip_frame` 必须为 `0`
- `vin_ichn_attr.width`、`roi_attr.roi_x`、`roi_attr.roi_width` 必须 4 对齐；`roi_width` 至少 32，且 `roi_x + roi_width`、`roi_y + roi_height` 不得超出输入图
- `cim_attr.mipi_rx`、`vc_index`、`ipi_channels` 不得超过上限（见[数据结构](#数据结构)的范围列）
- Online 绑定要求 CIM 与下游在同一 CPE 内——跨 CPE 只能走 Offline

以下组合不报错、但结果不对，逐项核对：

- `vin_basic_attr` 里 `pack_mode` 与 `format` 不匹配会让 `wstride` 与实际不符，DDR 里的图像错位
- `vin_ichn_attr_t.format` 与 Sensor 实际输出不符时能取到帧，但像素解释错

:::warning 注意

`hw_id` 就是 MIPI RX 通道号，打开 VIN 时传入的 `hw_id` 即该路相机接在哪条 MIPI RX 上。

- S100 合法取值：`0` / `1` / `4`——把 `hw_id` 写死成 `2` 或 `3` 的代码在 S100 上会打开失败
- S600 合法取值：`0`–`5`

:::

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

`status/cfg` 用于确认板上跑的到底是不是你配的那份参数；`status/icnt` 的报错计数正常情况下应全为 0。节点按 host 编号区分，即 `mipi_host<hw_id>`（`hw_id` 合法值见 [MIPI RX](#mipi-rx)）。

`param/` 下是可写的调试开关，常用的有 `irq_cnt`（中断计数阈值，超过后驱动会关闭该路中断以防中断风暴）、`dbg_value`（打开调试日志）、`ipi_overst`。**这些参数会改变驱动的运行行为，不要在生产配置上随意调整。**

## 相关文档
- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api) —— vnode 通用接口与 `vin_attr_t` 字段表
- [相机接口 - Camera](/Advanced_development/multimedia_development/multimedia_api/camera_api) —— Sensor 侧 `hbn_camera_*` 接口
- [视频处理框架 - VPF/PYM](/Advanced_development/multimedia_development/multimedia_api/vpf_pym_api) —— `hbn_vflow_*` 建流与绑定接口
