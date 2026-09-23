---
sidebar_position: 7
title: "图像金字塔 - PYM"
description: "RDK S100/S600 PYM（金字塔下采样模块）"
---

## 概述

PYM（Pyramid，金字塔）是 HBN 框架中的视频处理 vnode（板端头文件 `hbn_pym_cfg.h`，接口前缀 `hbn_vnode_*`）。它是一个硬件加速模块，对输入图像按**金字塔图层**的方式做**下采样与 ROI**：把源图缩放出多路不同尺度的图像输出到 DDR，供算法（检测/跟踪等）做多尺度消费。

## 硬件框图

### PYM 视频通路

视频通路由多个 CPE（Camera Process Engine，相机处理引擎）组成，每个 CPE 由 MIPI RX + CIM + ISP + YNR + PYM 串联成一个连续的 online 处理单元。PYM 串在通路末端，数据通路要点如下：

- **online 输入**（前级硬件直连）：
  - YUV sensor 场景：CIM 直连 PYM
  - RAW sensor 场景：经 ISP（可选 YNR）转接
- **offline 输入**：不走 online 时从 DDR 读入
- **回灌输入**：由用户态把图像写入 PYM 输入 buffer
- **输出**：多尺度输出统一落 DDR

<DocScope products="RDK S100">

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/pym/vps_hardware_S100.png" alt="S100 PYM 在 Camsys 子系统中的数量与位置（3 个 PYM：PYM0 / PYM1 / PYM4）" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

- PYM 共 **3 个**：PYM0 / PYM1 / PYM4
- online 连接：CIM 的 online YUV 输出只能接到 PYM0 / PYM1
- PYM4 只能 offline / 回灌

</DocScope>

<DocScope products="RDK S600">

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/pym/vps_hardware_S600.png" alt="S600 PYM 在 Camsys 子系统中的数量与位置（5 个 PYM：PYM0 ~ PYM4）" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

- PYM 共 **5 个**：PYM0 ~ PYM4
- online 连接：CIM 的 online YUV 输出只能接到 PYM0 ~ PYM3
- PYM4 只能 offline / 回灌

</DocScope>

### PYM 图层结构

PYM 的图层分三类，数据自上而下逐级缩小：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/pym/pym_arch.png" alt="PYM 硬件特性（SRC 层 → BL Base 0~4 双线性下采样 → DS 层 ROI 输出到 DDR）" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

| 层 | 数量 | 说明 |
| --- | --- | --- |
| SRC 层 | 1 | 源图像层，即输入原图 |
| BL 层 | 5（BL Base 0 ~ 4） | 双线性下采样层，依次为源图的 1/2、1/4、1/8、1/16、1/32 |
| DS 层 | 最多 6 | **输出层**。每层任选输入层（SRC 或 BL0~4），再做下采样 + ROI，输出到 DDR |

DS 层是用户真正取帧的输出层，配置集中在 `chn_ctrl_t`：

- `ds_roi_en` 按位使能第 0~5 层（bit0~bit5）
- 每层用 `ds_roi_sel[]` 选输入层（`0` = SRC、`1` = BL）、`ds_roi_layer[]` 选 BL 几层、`ds_roi_info[]` 配置 ROI 与输出尺寸

由于 DS 层可以先取 BL 层再缩小，级联后可获得小于 1/32 的输出（例如取 BL4 即 1/32，再缩小到接近 1/2，即约 1/64）。

## 硬件规格

### 平台规格

<DocScope products="RDK S100">

| 项目 | S100 |
| --- | --- |
| PYM 实例 | 3 个：PYM0 / PYM1 / PYM4 |
| 处理性能 | PYM0 / PYM1：4K@120fps；PYM4：4K@90fps |
| online 输入 | PYM4 **不支持** online 输入，只能 offline / 回灌 |
| 合法 `hw_id` | `0` / `1` / `4` |

</DocScope>

<DocScope products="RDK S600">

| 项目 | S600 |
| --- | --- |
| PYM 实例 | 5 个：PYM0 ~ PYM4 |
| 处理性能 | PYM0 ~ PYM4：4K@120fps |
| online 输入 | PYM4 不支持 online 输入，只能 offline / 回灌 |
| 合法 `hw_id` | `0` ~ `4` |

</DocScope>

多路相机按 `hw_id` 区分，**`hw_id` 就是 PYM 实例号**。把 `hw_id` 写死成板上不存在的实例号，`hbn_vnode_open` 会直接失败。

### 处理能力

<DocScope products="RDK S100">

| 项目 | S100 |
| --- | --- |
| 最大输入宽 × 高 | 4096 × 4096 |
| 最小输入宽 × 高 | 32 × 32 |
| online 输入格式 | YUV422 / YUV420 |
| offline 输入格式 | YUV420SP（NV12） |
| 输出格式 | YUV420SP（NV12） |
| 缩放范围 | 缩小 ratio ∈ (1/2, 1]，**不支持放大** |
| DS 层输出能力 | 6 层独立配置；每层支持 ROI crop、UV 平面单独 bypass、输出 stride 可配、垂直/水平相位可配 |

</DocScope>

<DocScope products="RDK S600">

| 项目 | S600 |
| --- | --- |
| 最大输入宽 × 高 | 5696 × 5696 |
| 最小输入宽 × 高 | 32 × 32 |
| online 输入格式 | YUV422 / YUV420 |
| offline 输入格式 | YUV420SP（NV12） |
| 输出格式 | YUV420SP（NV12） |
| 缩放范围 | 缩小 ratio ∈ (1/2, 1]，**不支持放大** |
| DS 层输出能力 | 6 层独立配置；每层支持 ROI crop、UV 平面单独 bypass、输出 stride 可配、垂直/水平相位可配 |

</DocScope>

> 输入宽高需 **2 对齐**、输入 stride 需 **16 对齐**，完整取值约束见[约束与注意事项](#约束与注意事项)。

## API 调用流程

**回灌模式（`pym_mode = 3`，offline）**——每帧由应用主动送入：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/pym/pym_feedback.png" alt="PYM API 调用流程（回灌模式）" width="600" />

**vflow 链路模式（`pym_mode = 1 / 2`，online）**——帧由前级自动流入：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/pym/pym_flow.png" alt="PYM API 调用流程（vflow 链路）" width="600" />

## 快速示例

板上完整样例的编译方法、运行命令、参数说明与运行效果，见示例专题文档：

<DocScope products="RDK S100">

- [sample_pym 使用说明](../02_multimedia_sample/04_sample_pym.md) —— PYM offline 回灌模式
- [sample_pipeline 使用说明](../02_multimedia_sample/09_sample_pipeline.md) —— VIN → ISP → PYM / 编码的完整通路

</DocScope>

<DocScope products="RDK S600">

- [sample_pym 使用说明](../02_multimedia_sample_s600/04_sample_pym.md) —— PYM offline 回灌模式
- [sample_pipeline 使用说明](../02_multimedia_sample_s600/09_sample_pipeline.md) —— VIN → ISP → PYM / 编码的完整通路

</DocScope>

### 最小示例

offline 回灌（M2M）模式的最小使用序列：1080p NV12 输入，使能 DS 层 0 输出 720p：

```c
#include <stdio.h>
#include "hbn_vpf_interface.h"
#include "hbn_pym_cfg.h"
#include "hb_mem_mgr.h"

#define AUTO_ALLOC_ID  (-1)   /* 框架自动分配 */

static pym_cfg_t pym_cfg = {
    .hw_id = 0,
    .pym_mode = 3,             /* offline（M2M）模式：输入 YUV420SP，输出 YUV420SP */
    .slot_id = 0,
    .output_buf_num = 6,       /* 输出 buf 数目（offline 模式回灌 buf 按此分配） */
    .fb_buf_num = 2,           /* 回灌 buffer 个数 */
    .timeout = 0,
    .chn_ctrl = {
        .src_in_width = 1920,      /* 输入宽，2 对齐 */
        .src_in_height = 1080,     /* 输入高，2 对齐 */
        .src_in_stride_y = 1920,   /* 输入 y stride，16 对齐 */
        .src_in_stride_uv = 1920,
        .bl_max_layer_en = 5,
        .ds_roi_en = 0x1,          /* 使能 DS 层 0（bit0~5 对应第 0~5 层） */
        .ds_roi_sel = { 0 },       /* 每层选输入层：0 = SRC */
        .ds_roi_layer = { 0 },     /* ds_roi_sel = 0 时只能为 0 */
        .ds_roi_info = {
            [0] = {
                .start_top = 0, .start_left = 0,
                .region_width = 1920, .region_height = 1080,
                .out_width = 1280, .out_height = 720,  /* 缩小 ratio ∈ (1/2, 1] */
                .wstride_y = 1280, .wstride_uv = 1280,
            },
        },
    },
    .magicNumber = 0x12345678, /* 固定值 MAGIC_NUMBER，库下发时会自动重填，填错也会被覆盖 */
};

int main(void)
{
    hbn_vnode_handle_t pym_fd;
    hbn_buf_alloc_attr_t alloc_attr = {0};
    hbn_vnode_image_t in_img = {0};
    hbn_vnode_image_group_t out_group = {0};
    int32_t ret;

    hb_mem_module_open();

    /* 1. 打开 PYM vnode 并下发配置 */
    ret = hbn_vnode_open(HB_PYM, pym_cfg.hw_id, AUTO_ALLOC_ID, &pym_fd);
    if (ret < 0) return ret;

    hbn_vnode_set_attr(pym_fd, &pym_cfg);
    /* 输入/输出通道均传同一个 pym_cfg_t */
    hbn_vnode_set_ichn_attr(pym_fd, 0, &pym_cfg);
    hbn_vnode_set_ochn_attr(pym_fd, 0, &pym_cfg);

    /* 2. 分配输出 buffer */
    alloc_attr.buffers_num = pym_cfg.output_buf_num;
    alloc_attr.is_contig = 1;
    alloc_attr.flags = (int64_t)((uint64_t)HB_MEM_USAGE_CPU_READ_OFTEN |
                                 (uint64_t)HB_MEM_USAGE_CPU_WRITE_OFTEN |
                                 (uint64_t)HB_MEM_USAGE_CACHED);
    ret = hbn_vnode_set_ochn_buf_attr(pym_fd, 0, &alloc_attr);
    if (ret < 0) return ret;

    hbn_vnode_start(pym_fd);

    /* 3. 回灌一帧输入（NV12）。
       in_img.buffer 由 hb_mem_alloc_graph_buf 分配并填充图像数据后，
       Y/UV 两个 plane 都先做 cache flush 再送帧 */
    hb_mem_flush_buf_with_vaddr((uint64_t)in_img.buffer.virt_addr[0],
                                in_img.buffer.size[0]);
    hb_mem_flush_buf_with_vaddr((uint64_t)in_img.buffer.virt_addr[1],
                                in_img.buffer.size[1]);
    hbn_vnode_sendframe(pym_fd, 0, &in_img);

    /* 4. 取一组多层输出，处理完归还。
       out_group.buf_group 内含各 DS 层的图像 buffer，
       完整定义见 hb_mem_mgr.h 的 hb_mem_graphic_buf_group_t */
    if (hbn_vnode_getframe_group(pym_fd, 0, 10000, &out_group) == 0) {
        hbn_vnode_releaseframe_group(pym_fd, 0, &out_group);
    }

    /* 5. 收尾 */
    hbn_vnode_stop(pym_fd);
    hbn_vnode_close(pym_fd);
    hb_mem_module_close();
    return 0;
}
```

> online 链路（`pym_mode = 1/2`）时省去步骤 3 的 `hbn_vnode_sendframe`，改为 `hbn_vflow_bind_vnode` 把前级（CIM / ISP / YNR）的 online 通道绑到 PYM 输入，帧自动流入；完整链路写法见 sample_pipeline。

## API 列表

PYM 复用 HBN 的通用 vnode 接口，没有自己的私有 ioctl。开发用到的接口按使用时序排列（完整说明见 [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)）：

| 接口 | 功能 |
| --- | --- |
| `hbn_vnode_open` | 打开 PYM vnode（`HB_PYM`） |
| `hbn_vnode_set_attr` | 设置模块基本属性（PYM 用 `pym_cfg_t`） |
| `hbn_vnode_set_ichn_attr` | 设置输入通道属性（PYM 用 `pym_cfg_t`） |
| `hbn_vnode_set_ochn_attr` | 设置输出通道属性（PYM 用 `pym_cfg_t`） |
| `hbn_vnode_set_ochn_buf_attr` | 设置输出通道 buffer 属性（分配输出 buffer） |
| `hbn_vflow_create` / `hbn_vflow_bind_vnode` / `hbn_vflow_start` | 建流、绑定前级、启动（详见 HBN 篇） |
| `hbn_vnode_getframe_group` | 获取一组多层输出（阻塞型） |
| `hbn_vnode_releaseframe_group` | 归还一组多层输出 |
| `hbn_vnode_sendframe` | 向输入通道送帧（回灌场景） |
| `hbn_vflow_stop` / `hbn_vflow_destroy` / `hbn_vnode_close` | 停流并释放 |

## API 接口说明

PYM 作为 HBN vnode 接入 pipeline，**独立函数 API 较少，主体为配置结构体 + HBN vnode 调用**：

- 配置：全部集中在 `pym_cfg_t` 一个结构体（输入尺寸、图层选择、每层 ROI），经 `hbn_vnode_set_attr` 一次性下发；层级关系 `pym_cfg_t` → `chn_ctrl_t` → `roi_box_t`，见[数据结构](#数据结构)
- 接口：`hbn_vnode_*` / `hbn_vflow_*` 由所有硬件模块共用，位于 `libvpf.so`，完整说明见 [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
- 返回码：PYM 上实际会遇到的见[常见返回码](#常见返回码)

下文各小节有一条共性约定，不再逐节重复：

- **`pym_cfg_t` 单结构体**：PYM 的 `set_attr` / `set_ichn_attr` / `set_ochn_attr` 传的都是**同一个 `pym_cfg_t` 指针**（区别于 VIN/ISP 的分体结构体），字段完整定义见[数据结构](#数据结构)。

#### hbn_vnode_open

【函数原型】

```c
hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id,
                            int32_t ctx_id, hbn_vnode_handle_t *vnode_fd);
```

【功能描述】

初始化 PYM 模块，打开该模块设备节点，返回该模块的 vnode handle。与 hbn_vnode_close 成对使用。

【参数】

- [IN] hb_vnode_type vnode_type：vnode 类型，每个硬件模块对应一个 vnode 类型，PYM 取 HB_PYM（枚举定义见 `hbn_vpf_data_info.h`）
- [IN] uint32_t hw_id：模块的硬件 id，即 PYM 实例号。S100 合法值 0/1/4；S600 合法值 0~4
- [IN] int32_t ctx_id：模块的 context id，软件上的概念；可指定 context id 值，也可设置为 AUTO_ALLOC_ID，由 SDK 自动分配
- [OUT] hbn_vnode_handle_t *vnode_fd：返回模块的 vnode handle

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- hw_id 写板上不存在的实例号会直接打开失败

#### hbn_vnode_set_attr

【函数原型】

```c
hobot_status hbn_vnode_set_attr(hbn_vnode_handle_t vnode_fd, void *attr);
```

【功能描述】

设置模块的基本属性，PYM 的全部配置集中于此。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] void *attr：模块的基本属性结构体指针，PYM 用 pym_cfg_t，见[数据结构](#数据结构)

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- pym_cfg_t 的 magicNumber 固定为 MAGIC_NUMBER（0x12345678），库在下发属性时会自动重填该字段（用户填写的值会被覆盖），无需关心
- 字段取值范围与对齐要求见[约束与注意事项](#约束与注意事项)

#### hbn_vnode_set_ichn_attr

【函数原型】

```c
hobot_status hbn_vnode_set_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, void *attr);
```

【功能描述】

设置模块的输入通道属性。PYM 的该接口传 pym_cfg_t，通道 id 固定取 0。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ichn_id：PYM 输入通道 id，固定为 0
- [IN] void *attr：与 hbn_vnode_set_attr 相同的属性结构体指针

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vnode_set_ochn_attr

【函数原型】

```c
hobot_status hbn_vnode_set_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr);
```

【功能描述】

设置模块的输出通道属性。PYM 的该接口传 pym_cfg_t，通道 id 固定取 0。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ochn_id：PYM 输出通道 id，固定为 0
- [IN] void *attr：与 hbn_vnode_set_attr 相同的属性结构体指针

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vnode_set_ochn_buf_attr

【函数原型】

```c
hobot_status hbn_vnode_set_ochn_buf_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                         hbn_buf_alloc_attr_t *alloc_attr);
```

【功能描述】

设置输出通道的 buffer 属性，真正发起输出 buffer 分配的是本接口。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ochn_id：输出通道 id，固定为 0
- [IN] hbn_buf_alloc_attr_t *alloc_attr：buffer 分配属性，含 buffers_num / is_contig / flags，buffers_num 一般取 pym_cfg_t.output_buf_num

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- offline（回灌）模式下，回灌 buffer 也会按该数目默认分配

#### hbn_vnode_getframe_group

【函数原型】

```c
hobot_status hbn_vnode_getframe_group(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                      uint32_t millisecondTimeout, hbn_vnode_image_group_t *out_img);
```

【功能描述】

从输出通道获取一组多层金字塔输出（对应 chn_ctrl_t 使能的各 DS 层），阻塞型接口。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ochn_id：输出通道 id，固定为 0
- [IN] uint32_t millisecondTimeout：超时等待时间
- [OUT] hbn_vnode_image_group_t *out_img：输出图像组结构体地址，一组多层输出（帧信息 + `hb_mem_graphic_buf_group_t`）

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- 取到的 group 必须通过 hbn_vnode_releaseframe_group 归还，否则 buffer 耗尽后无法继续取帧
- 只取单层时可用 hbn_vnode_getframe；需要条件取帧时用 hbn_vnode_getframe_group_cond

#### hbn_vnode_releaseframe_group

【函数原型】

```c
hobot_status hbn_vnode_releaseframe_group(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
                                          hbn_vnode_image_group_t *img_group);
```

【功能描述】

归还 hbn_vnode_getframe_group 取到的一组多层输出，与取帧接口成对使用。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ochn_id：输出通道 id，固定为 0
- [IN] hbn_vnode_image_group_t *img_group：hbn_vnode_getframe_group 返回的输出组

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- 归还的输出组 bufferindex 越界时返回 -44（HBN_STATUS_ILLEGAL_BUF_INDEX）
- 只取单层时用 hbn_vnode_releaseframe 归还

#### hbn_vnode_sendframe

【函数原型】

```c
hobot_status hbn_vnode_sendframe(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
                                 hbn_vnode_image_t *img);
```

【功能描述】

向输入通道送入一帧，用于 offline / 回灌（pym_mode = 3）场景。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ichn_id：输入通道 id，固定为 0
- [IN] hbn_vnode_image_t *img：要送入的帧（NV12，尺寸与 chn_ctrl 配置一致）

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- 送入前需对输入 buffer 做 cache flush（如 `hb_mem_flush_buf_with_vaddr`）
- online 链路场景不需要调用本接口，帧由前级自动流入
- 阻塞接口；不需要等待的场景用 hbn_vnode_sendframe_async

#### hbn_vnode_close

【函数原型】

```c
hobot_status hbn_vnode_close(hbn_vnode_handle_t vnode_fd);
```

【功能描述】

关闭 PYM 模块的设备节点。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- PYM 串在 vflow 中时，调用 hbn_vflow_destroy 即可，无须再单独调用 hbn_vnode_close

## 数据结构

以下结构体定义在板端 `hbn_pym_cfg.h`，字段语义与取值范围综合头文件与上游手册整理。完整定义以头文件为准。

### pym_cfg_t —— PYM 顶层配置

用于 `hbn_vnode_set_attr` / `set_ichn_attr` / `set_ochn_attr` 的 `attr` 参数。

<DocScope products="RDK S100">

| 名称 | 类型 | 含义 | 取值范围/默认值 | 必选 |
| --- | --- | --- | --- | --- |
| `hw_id` | `uint8_t` | PYM 硬件模块 id | 0 / 1 / 4 | 是 |
| `pym_mode` | `uint8_t` | 工作模式：1 Manual（online，前级 sw trigger）；2 单路 online（前级硬件直连）；3 offline（M2M，用户态回灌，输入/输出 YUV420SP） | 1 ~ 3 | 是 |
| `slot_id` | `uint8_t` | PYM 硬件通道 id | 0 ~ 7 | 否 |
| `axi_burst_len` | `uint8_t` | AXI 突发长度（保留调优项） | 见头文件 | 否 |
| `in_linebuff_watermark` | `uint8_t` | 行 buffer 水位（保留调优项） | 见头文件 | 否 |
| `out_buf_noinvalid` | `uint8_t` | 输出 buf 是否执行 invalid cache 操作 | 0/1，默认 1 | 是 |
| `out_buf_noncached` | `uint8_t` | 输出 buf 是否按 non-cache 内存分配 | 0/1 | 否 |
| `in_buf_noclean` | `uint8_t` | 输入 buf 是否做 cache clean | 0/1，默认 1 | 是 |
| `in_buf_noncached` | `uint8_t` | 输入 buf（回灌 buf）是否按 non-cache 内存分配 | 0/1 | 否 |
| `buf_consecutive` | `uint8_t` | 内存是否连续分配 | 0/1 | 否 |
| `pingpong_ring` | `uint8_t` | 是否开启乒乓 buffer | 0/1 | 否 |
| `output_buf_num` | `uint32_t` | 输出 buf 数目；offline 模式时回灌 buf 按此数目默认分配 | ≤ 64 | 是 |
| `timeout` | `uint32_t` | 超时时间 | ≤ 10000（ms） | 否 |
| `threshold_time` | `uint32_t` | 门限时间（保留） | - | 否 |
| `layer_num_trans_next` | `int32_t` | 传输到后级模块的层数 | &lt; 6，默认 -1 | 是 |
| `layer_num_share_prev` | `int32_t` | 与前级模块共享的层数 | &lt; 6，默认 -1 | 是 |
| `chn_ctrl` | `chn_ctrl_t` | 输入尺寸与图层配置，见下表 | - | 是 |
| `fb_buf_num` | `uint32_t` | 回灌 buffer 个数 | ≤ 16，默认 2 | 是 |
| `reserved` | `uint32_t[6]` | 保留字段 | - | 否 |
| `magicNumber` | `uint32_t` | 属性结构体校验值，固定 `MAGIC_NUMBER`（`0x12345678`），库自动重填 | `0x12345678` | 是 |

</DocScope>

<DocScope products="RDK S600">

> 下表S600多出的 3 个字段（`indata_type` / `outdata_type` / `expand_layer_en`）

| 名称 | 类型 | 含义 | 取值范围/默认值 | 必选 |
| --- | --- | --- | --- | --- |
| `hw_id` | `uint8_t` | PYM 硬件模块 id | 0 ~ 4 | 是 |
| `pym_mode` | `uint8_t` | 工作模式：1 Manual（online，前级 sw trigger）；2 单路 online（前级硬件直连）；3 offline（M2M，用户态回灌，输入/输出 YUV420SP） | 1 ~ 3 | 是 |
| `slot_id` | `uint8_t` | PYM 硬件通道 id | 0 ~ 7 | 否 |
| `axi_burst_len` | `uint8_t` | AXI 突发长度（保留调优项） | 见头文件 | 否 |
| `in_linebuff_watermark` | `uint8_t` | 行 buffer 水位（保留调优项） | 见头文件 | 否 |
| `out_buf_noinvalid` | `uint8_t` | 输出 buf 是否执行 invalid cache 操作 | 0/1，默认 1 | 是 |
| `out_buf_noncached` | `uint8_t` | 输出 buf 是否按 non-cache 内存分配 | 0/1 | 否 |
| `in_buf_noclean` | `uint8_t` | 输入 buf 是否做 cache clean | 0/1，默认 1 | 是 |
| `in_buf_noncached` | `uint8_t` | 输入 buf（回灌 buf）是否按 non-cache 内存分配 | 0/1 | 否 |
| `buf_consecutive` | `uint8_t` | 内存是否连续分配 | 0/1 | 否 |
| `pingpong_ring` | `uint8_t` | 是否开启乒乓 buffer | 0/1 | 否 |
| `output_buf_num` | `uint32_t` | 输出 buf 数目；offline 模式时回灌 buf 按此数目默认分配 | ≤ 64 | 是 |
| `timeout` | `uint32_t` | 超时时间 | ≤ 10000（ms） | 否 |
| `threshold_time` | `uint32_t` | 门限时间（保留） | - | 否 |
| `layer_num_trans_next` | `int32_t` | 传输到后级模块的层数 | &lt; 6，默认 -1 | 是 |
| `layer_num_share_prev` | `int32_t` | 与前级模块共享的层数 | &lt; 6，默认 -1 | 是 |
| `chn_ctrl` | `chn_ctrl_t` | 输入尺寸与图层配置，见下表 | - | 是 |
| `fb_buf_num` | `uint32_t` | 回灌 buffer 个数 | ≤ 16，默认 2 | 是 |
| `indata_type` | `uint8_t` | 输入数据位宽：0 = 8bit（默认）、1 = 10bit、2 = 12bit | 0 ~ 2 | 否 |
| `outdata_type` | `uint8_t` | 输出数据位宽，取值同上 | 0 ~ 2 | 否 |
| `expand_layer_en` | `uint8_t` | 扩展层使能 | 0/1 | 否 |
| `reserved` | `uint8_t[1]` + `uint32_t[5]` | 保留字段（`reserved_u8` 与 `reserved`） | - | 否 |
| `magicNumber` | `uint32_t` | 属性结构体校验值，固定 `MAGIC_NUMBER`（`0x12345678`），库自动重填 | `0x12345678` | 是 |

</DocScope>

### chn_ctrl_t —— 通道控制（输入尺寸 + 图层选择）

`pym_cfg_t.chn_ctrl`，配置输入图像参数与金字塔图层。

| 名称 | 类型 | 含义 | 取值范围/默认值 | 必选 |
| --- | --- | --- | --- | --- |
| `pixel_num_before_sol` | `uint32_t` | 行起始前像素数 | 默认 2 | 是 |
| `invalid_head_lines` | `uint32_t` | 无效头行数 | - | 否 |
| `src_in_width` | `uint32_t` | 输入宽度，**2 对齐** | [32, 4096]；S600 上限 5696 | 是 |
| `src_in_height` | `uint32_t` | 输入高度，**2 对齐** | [32, 4096]；S600 上限 5696 | 是 |
| `src_in_stride_y` | `uint32_t` | 输入 y plane stride，**16 对齐** | ≥ `src_in_width`，≤ 上限（同输入宽） | 是 |
| `src_in_stride_uv` | `uint32_t` | 输入 uv stride，**16 对齐** | ≥ `src_in_width`，≤ 上限（同输入宽） | 是 |
| `suffix_hb_val` | `uint32_t` | 行尾 blanking | [16, 152]，默认 100 | 是 |
| `prefix_hb_val` | `uint32_t` | 行首 blanking | [0, 2]，默认 2 | 是 |
| `suffix_vb_val` | `uint32_t` | 帧尾 blanking | [0, 20]，默认 10 | 是 |
| `prefix_vb_val` | `uint32_t` | 帧首 blanking | [0, 2]，默认 0 | 是 |
| `bl_max_layer_en` | `uint8_t` | 使能的 BL 层数 | > `ds_roi_layer[chn]`，默认 5 | 是 |
| `ds_roi_en` | `uint8_t` | DS 层输出使能，第 0~5 层按 bit 置位 | &lt; (1 &lt;&lt; 6) | 是 |
| `ds_roi_uv_bypass` | `uint8_t` | DS 层 uv plane 输出 bypass，按 bit 置位 | &lt; (1 &lt;&lt; 6) | 否 |
| `ds_roi_sel[MAX_DS_NUM]` | `uint8_t[]` | 每层选输入图层：0 = SRC 层、1 = BL 层 | &lt; 2 | 是 |
| `ds_roi_layer[MAX_DS_NUM]` | `uint8_t[]` | 每层选的 BL 层号 | `ds_roi_sel = 0` 时只能为 0 | 是 |
| `ds_roi_info[MAX_DS_NUM]` | `roi_box_t[]` | 每层（DS 通道）的 ROI 配置，见下表 | - | 是 |
| `pre_int_set_y[MAX_PRE_INT]` / `pre_int_set_uv[MAX_PRE_INT]` | `uint32_t[]` | 预积分配置（保留） | 见头文件 | 否 |

### roi_box_t —— 单层 ROI 配置

`chn_ctrl_t.ds_roi_info[]` 的元素类型，描述一个 DS 层的裁剪与缩放输出。

| 名称 | 类型 | 含义 | 取值范围/默认值 | 必选 |
| --- | --- | --- | --- | --- |
| `start_top` | `uint32_t` | 从原图截取图像的 Y 轴位置 | ds 层：`[region_height - out_height, region_height]`；bl 层：`[bl_base_height - out_height, bl_base_height]`，其中 `bl_base_height = region_height >> (ds_roi_layer + 1)` | 是 |
| `start_left` | `uint32_t` | 从原图截取图像的 X 轴位置 | ds 层：`[region_width - out_width, region_width]`；bl 层：`[bl_base_width - out_width, bl_base_width]`，其中 `bl_base_width = region_width >> (ds_roi_layer + 1)` | 是 |
| `region_width` | `uint32_t` | 截取图像的宽度 | - | 是 |
| `region_height` | `uint32_t` | 截取图像的高度 | - | 是 |
| `wstride_uv` | `uint32_t` | 输出的 uv 层 stride | - | 是 |
| `wstride_y` | `uint32_t` | 输出的 y 层 stride | - | 是 |
| `vstride` | `uint32_t` | 高度 stride，隐藏参数，不建议配置 | 默认 `out_height` | 否 |
| `step_v` | `uint32_t` | 垂直缩放步进（不配则按默认公式计算） | 默认 `(1 << 16) * (out_height - region_height) / out_height` | 否 |
| `step_h` | `uint32_t` | 水平缩放步进（不配则按默认公式计算） | 默认 `(1 << 16) * (out_width - region_width) / out_width` | 否 |
| `out_width` | `uint32_t` | 输出图像的宽度 | 缩小 ratio ∈ (1/2, 1] | 是 |
| `out_height` | `uint32_t` | 输出图像的高度 | 缩小 ratio ∈ (1/2, 1] | 是 |
| `phase_y_v` | `uint32_t` | 垂直相位 | 默认 0 | 否 |
| `phase_y_h` | `uint32_t` | 水平相位 | 默认 0 | 否 |

### 模式宏与常量

`pym_mode` 的取值与语义：

| 值 | 宏 | 模式 | 说明 |
| --- | --- | --- | --- |
| 0 | `PYM_AUTO_MODE` | 自动 | 头文件保留值 |
| 1 | `PYM_MANUAL_MODE` | Manual | online 链路，前级模块 sw trigger |
| 2 | `PYM_OTF_MODE` | 单路 online | 前级与 PYM 硬件直连 |
| 3 | `PYM_M2M_MODE` | offline（M2M） | 输入/输出 YUV420SP，用户态回灌 |

> 在 `isp-online-(ynr-)online-pym` 场景下，PYM 的 `pym_mode`、`slot_id` 需与 ISP 的 `sched_mode`、`slot_id` 保持一致。

其他常量定义在 `hbn_pym_cfg.h` / `pym_cfg.h`（板端 `libvpf` 源码树）：

| 宏 | 值 | 说明 |
| --- | --- | --- |
| `MAX_DS_NUM` | 6 | DS 层最大数 |
| `MAX_BL_NUM` | 5 | BL 层最大数 |
| `MAX_PRE_INT` | 8 | 预积分配置数组长度 |
| `PYM_MIN_WIDTH` / `PYM_MIN_HEIGHT` | 32 | 最小输入宽/高 |
| `PYM_MAX_WIDTH` / `PYM_MAX_HEIGHT` | S100：4096；S600：5696 | 最大输入宽/高 |
| `PYM_MAX_TIMEOUT` | 10000 | `timeout` 上限（ms） |
| `PYM_MAX_BUF_NUM` | 64 | `output_buf_num` 上限 |

## 约束与注意事项

字段取值约束已在[数据结构](#数据结构)各字段表中标注，此处汇总高频核对项（综合板端 `hbn_pym_cfg.h` 与上游 API 参考手册整理）：

| 约束项 | 要求 |
| --- | --- |
| `hw_id` | S100：`0` / `1` / `4`；S600：`0` ~ `4` |
| `pym_mode` | 1 ~ 3（`0` 为头文件保留值） |
| `src_in_width` / `src_in_height` | ≥ 32 且 ≤ 上限（S100 4096 / S600 5696），**2 对齐** |
| `src_in_stride_y` / `src_in_stride_uv` | **16 对齐**，且 ≥ `src_in_width`、≤ 上限 |
| `bl_max_layer_en` | > `ds_roi_layer[chn]` |
| `ds_roi_sel = 0` 时 `ds_roi_layer` | 只能为 `0` |
| `output_buf_num` / `fb_buf_num` / `timeout` | ≤ 64 / ≤ 16 / ≤ 10000 |
| `magicNumber` | 固定值 `MAGIC_NUMBER`（`0x12345678`），库下发属性时自动重填，用户填写的值会被覆盖 |
| PYM4 | 不支持 online 输入，只能 offline / 回灌 |

## 常见返回码

接口失败返回**负值**，值为宏取负（宏定义在 `hbn_error.h`，完整清单见 [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api#返回值说明)）：

| 返回值 | 宏 | 含义 |
| --- | --- | --- |
| `-3` | `HBN_STATUS_INVALID_HWID` | 无效的硬件 id |
| `-8` | `HBN_STATUS_INVALID_NULL_PTR` | 空指针 |
| `-10` | `HBN_STATUS_ILLEGAL_ATTR` | 非法的属性 |
| `-43` | `HBN_STATUS_NODE_DEQUE_ERROR` | node 通道 dequeue buffer 错误 |

## 相关文档

- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api) —— vnode/vflow 通用接口与返回值清单
- [SYS API](/Simple_API/multimedia_api/cdev/sys_api) —— 封装层模块绑定接口（模式 1）
- [视频输入 - VIN](/Advanced_development/multimedia_development/multimedia_api/vin_api) —— CIM 直连 PYM 的 online 输入侧
- [图像信号处理 - ISP](/Advanced_development/multimedia_development/multimedia_api/isp) —— `ISP → PYM` 链路
- [视频降噪 - YNR](/Advanced_development/multimedia_development/multimedia_api/ynr_api) —— `ISP → YNR → PYM` 链路
- [畸变矫正 - GDC](/Advanced_development/multimedia_development/multimedia_api/gdc_api) —— VPF 同级模块，GDC 输入常接 PYM 的输出