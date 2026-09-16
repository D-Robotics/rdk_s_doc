---
sidebar_position: 6
title: "视频降噪 - YNR"
description: "RDK S100/S600 YNR（视频降噪）模块"
---

# 视频降噪 - YNR

## 概述

YNR 全称 Y（Luma）Noise Reduction，即亮度降噪，是 VPS 子系统中的一个独立 IP。它是对 ISP 功能的补充，串在 ISP 之后、PYM 之前，对图像做 2D / 3D 降噪处理。

图像降噪分为两种：2DNR 和 3DNR。

2DNR 是空域降噪，只会利用当前帧内的图像信息，对平坦区、运动量大的像素做较强的低通滤波。降噪强度越大，画面越干净；降噪强度太大会引起图像模糊。降噪算法根据实现原理不同可以分成很多类型，如线性/非线性、空域/频域，频域又包括小波变换、傅里叶变换或其他变换。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/ynr-dnr-flow.png" alt="图像降噪基本流程（含噪图像 → 识别噪声 → 抑制噪声 → 高质量图像）" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

3DNR 是时域降噪，它的主要思想是利用多帧图像在时间上的相关性实现降噪，利用邻帧之间图片内容的相关性和噪点的不相关性增强图像信号，抵消噪声信号。在静止的画面上处理效果非常好，但是降噪太强会引起图像拖尾或者拖影。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/ynr-3dnr.png" alt="3DNR 时域降噪原理（多帧融合：静止区域用历史帧，运动区域用当前帧）" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

如上图所示，当前帧的输出会与下一帧一起作为输入，根据检测两帧的 motion（图片的运动信息）进行融合，作为第二帧的输出，在静止区域使用历史帧的成分较大，运动区域使用当前帧的成分较大，以此类推。

简单来说，只使用同帧信息的就是 2D 降噪；需要使用前后帧信息的就是 3D 降噪。

## 硬件框图

视频通路由多个 CPE（Camera Process Engine，相机处理引擎）组成，每个 CPE 由 MIPI RX + CIM + ISP + YNR + PYM 串联成一个连续的 online 处理单元。YNR 串在 ISP 之后、PYM 之前：前级 ISP 输出图像交给 YNR 做降噪，YNR 处理完再交给后级 PYM 继续处理。

YNR 是可选的降噪环节——串 YNR 时走 `ISP → YNR → PYM` 全 online 链路，不串 YNR 时直接 `ISP → PYM` 输出也可以。通路框图如下：

:::doc_scope{products="RDK S100"}
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/video-path-hw.png" alt="S100 视频通路硬件框图（Sensor → MIPI RX → CIM → ISP → YNR → PYM + AXI 总线）" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

- **YNR**：1 个（YNR1），支持 2DNR / 3DNR。
- **链路**：只有 CPE1 这一路的 ISP1 后级才能直接连接 YNR，走 `ISP1 → YNR1 → PYM1` 全 online 链路。
:::

:::doc_scope{products="RDK S600"}
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/s600-video-path-hw.png" alt="S600 视频通路硬件框图（Sensor → MIPI RX → CIM → ISP → YNR → PYM + AXI 总线）" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

- **YNR**：4 个（YNR0 ~ YNR3），只支持 `isp-online-ynr-online-pym` 场景。
- **2D/3DNR**：YNR0 ~ YNR2 只支持 2DNR，YNR3 支持 2DNR & 3DNR。
:::

## YNR 工作模式

YNR 当前仅支持 online 模式：2DNR 和 3DNR 都会走。其中 3DNR 做时域降噪时，YNR 会向 DDR 下载和获取 buffer 用于对比历史帧；此 buffer 不向用户开放，仅 YNR 自身使用。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/ynr-online-ddr.png" alt="YNR online 模式数据流（3DNR 从 DDR 取历史帧做时域降噪）" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

## YNR 硬件规格

:::doc_scope{products="RDK S100"}
- **接入**：只有 ISP1 接入 YNR，ISP0 未接入；且只有 ISP Online 处理才能启用 YNR。
- **最大分辨率**：只支持 2048 × 2048（单帧耗时约 1ms，可多路分时复用满足多 camera 需求）；更大分辨率（如 4K sensor）不支持，会出现花屏。
- **启用建议**：有人眼视觉需求的客户一定要启用 YNR，最低要启用 2DNR。
:::

:::doc_scope{products="RDK S600"}
- **YNR**：4 个（YNR0 ~ YNR3），只支持 `isp-online-ynr-online-pym` 场景。
- **2D/3DNR**：YNR0 ~ YNR2 只支持 2DNR，YNR3 支持 2DNR & 3DNR。
- **最大分辨率**：YNR0 ~ YNR2 最大支持 5696 × 5696，YNR3 最大支持 4096 × 4096。
:::

YNR 功能的生效需要在配置文件中开启 `nr2d_en` / `nr3d_en` 参数。

## API 列表

YNR 是 HBN 框架下的一个 vnode。快速开发验证 YNR 可以参考 `single_pipe_vin_isp_ynr_pym_vpu` 示例，选用的 sensor 需要在 `vp_sensor_config_t` 里配置 `ynr_attr`，如下（以 sc230ai 为例）：

```c
vp_sensor_config_t sc230ai_linear_1920x1080_raw10_30fps_1lane = {
	.chip_id_reg = 0x3107,
	.chip_id = 0xcb34,
	.sensor_i2c_addr_list = {0x30,0x32},
	.sensor_name = "sc230ai-30fps",
	.config_file = "linear_1920x1080_raw10_30fps_1lane.c",
	.camera_config = &sc230ai_camera_config,
	// .deserial_config = NULL,
	.vin_ichn_attr = &sc230ai_vin_ichn_attr,
	.vin_node_attr = &sc230ai_vin_node_attr,
	.vin_attr_ex = &sc230ai_vin_attr_ex,
	.vin_ochn_attr = &sc230ai_vin_ochn_attr,

	.isp_attr      = &sc230ai_isp_attr,
	.isp_ichn_attr = &sc230ai_isp_ichn_attr,
	.isp_ochn_attr = &sc230ai_isp_ochn_attr,
	.ynr_attr = &sc230ai_ynr_attr,
	.pym_config = &sc230ai_pym_config,
};
```

其中 `.ynr_attr` 指向的 `sc230ai_ynr_attr` 就是 YNR 的配置，对应「数据结构」章节的 `ynr_init_attr`。

除 sensor 配置外，YNR 节点本身的创建、属性设置和数据流绑定通过以下 HBN 框架接口（`hbn_vnode_*` / `hbn_vflow_*`）完成，按使用时序排列；这些是所有硬件模块共用的通用接口，完整说明见 [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)：

| 函数 | 说明 |
| --- | --- |
| `hbn_vnode_open` | 初始化模块，打开设备节点，返回 vnode handle（YNR 用 `HB_YNR`） |
| `hbn_vnode_set_attr` | 设置模块基本属性（YNR 用 `ynr_init_attr`） |
| `hbn_vnode_set_ichn_attr` | 设置模块输入通道属性 |
| `hbn_vnode_set_ochn_attr` | 设置模块输出通道属性 |
| `hbn_vnode_set_ochn_buf_attr` | 设置输出通道 buffer 属性（3DNR 时申请对比帧 buffer） |
| `hbn_vflow_create` | 创建一条 vflow，返回 vflow handle |
| `hbn_vflow_bind_vnode` | 把两个模块绑定，数据帧自动从源模块流向目的模块 |
| `hbn_vflow_start` | 启动 vflow，流内的 vnode 都会启动 |
| `hbn_vflow_stop` | 停止 vflow，流内的 vnode 都会停止 |
| `hbn_vnode_close` | 关闭模块设备节点 |

## API 说明

#### hbn_vnode_open

【函数原型】

```c
hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id, int32_t ctx_id, hbn_vnode_handle_t *vnode_fd);
```

【功能描述】

初始化某个模块，打开该模块设备节点，返回该模块的 vnode handle。

【参数】

- [IN] hb_vnode_type vnode_type：vnode 类型，YNR 填 `HB_YNR`
- [IN] uint32_t hw_id：模块的硬件 id
- [IN] int32_t ctx_id：模块的 context id，可指定 context id 值，也可设置为 AUTO_ALLOC_ID，由 SDK 自动分配
- [OUT] hbn_vnode_handle_t *vnode_fd：返回模块的 vnode handle

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vnode_set_attr

【函数原型】

```c
hobot_status hbn_vnode_set_attr(hbn_vnode_handle_t vnode_fd, void *attr);
```

【功能描述】

设置模块的基本属性。YNR 的 `attr` 为 `ynr_init_attr`（见「数据结构」）。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] void *attr：模块的基本属性结构体指针，YNR 用 `ynr_init_attr`

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vnode_set_ichn_attr

【函数原型】

```c
hobot_status hbn_vnode_set_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, void *attr);
```

【功能描述】

设置模块的输入通道属性。YNR 的 `attr` 为 `hobot_ynr_channel_input_config`，通常对通道 0、1 各设一次。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ichn_id：模块的输入通道 id
- [IN] void *attr：输入通道属性结构体指针，YNR 用 `hobot_ynr_channel_input_config`

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vnode_set_ochn_attr

【函数原型】

```c
hobot_status hbn_vnode_set_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr);
```

【功能描述】

设置模块的输出通道属性。YNR 的 `attr` 为 `hobot_ynr_channel_output_config`。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ochn_id：模块的输出通道 id
- [IN] void *attr：输出通道属性结构体指针，YNR 用 `hobot_ynr_channel_output_config`

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vnode_set_ochn_buf_attr

【函数原型】

```c
hobot_status hbn_vnode_set_ochn_buf_attr(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_buf_alloc_attr_t *alloc_attr);
```

【功能描述】

设置输出通道 buffer 属性。开启 3DNR 时需要额外申请对比帧 buffer。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle
- [IN] uint32_t ochn_id：模块的输出通道 id
- [IN] hbn_buf_alloc_attr_t *alloc_attr：buffer 分配属性

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vflow_create

【函数原型】

```c
hobot_status hbn_vflow_create(hbn_vflow_handle_t *vflow_fd);
```

【功能描述】

创建一个 vflow，返回 vflow handle。

【参数】

- [OUT] hbn_vflow_handle_t *vflow_fd：vflow handle

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

#### hbn_vflow_bind_vnode

【函数原型】

```c
hobot_status hbn_vflow_bind_vnode(hbn_vflow_handle_t vflow_fd, hbn_vnode_handle_t src_vnode_fd, uint32_t out_chn, hbn_vnode_handle_t dst_vnode_fd, uint32_t in_chn);
```

【功能描述】

把两个模块绑定到一起。绑定后 src_vnode_fd 模块的数据帧会自动流向 dst_vnode_fd 模块。

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle
- [IN] hbn_vnode_handle_t src_vnode_fd：源模块的 vnode handle
- [IN] uint32_t out_chn：源模块的输出通道 id
- [IN] hbn_vnode_handle_t dst_vnode_fd：目的模块的 vnode handle
- [IN] uint32_t in_chn：目的模块的输入通道 id

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- vflow 需要先创建，模块需要先 open。

#### hbn_vflow_start

【函数原型】

```c
hobot_status hbn_vflow_start(hbn_vflow_handle_t vflow_fd);
```

【功能描述】

启动一条 vflow。vflow 里包含的 vnode 都会启动。

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- 模块 vnode 需要事先添加到 vflow 中。

#### hbn_vflow_stop

【函数原型】

```c
hobot_status hbn_vflow_stop(hbn_vflow_handle_t vflow_fd);
```

【功能描述】

停止一条 vflow。vflow 里包含的 vnode 都会停止。

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- 和 hbn_vflow_start 成对使用。

#### hbn_vnode_close

【函数原型】

```c
hobot_status hbn_vnode_close(hbn_vnode_handle_t vnode_fd);
```

【功能描述】

关闭模块的设备节点。

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle

【返回值】

- 成功：HBN_STATUS_SUCESS 0
- 失败：异常为负值错误码

【注意事项】

- 模块串在 vflow 中时，调用 hbn_vflow_destroy 即可，无须再逐个调用 hbn_vnode_close。

## 数据结构

YNR 用到的数据结构定义在板端 `hbn_ynr_cfg.h`。

#### ynr_info_t —— YNR 通道配置

YNR 的配置结构，由用户填写。

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| hw_id | uint32_t | 0 | - | - | 用第几个 YNR，见「硬件框图」 | 是 |
| link_mode | uint32_t | 0 | 2 | - | 工作模式（对应 `ynr_init_attr.work_mode`） | 是 |
| slot_id | uint32_t | 0 | 11 | - | 与上游 ISP 的 slot_id 保持一致 | 是 |
| ch_img_width | uint32_t | 8 | 4096 | - | 图像宽，2 的倍数 | 是 |
| ch_img_height | uint32_t | 8 | 4096 | - | 图像高，2 的倍数 | 是 |
| nr2d_en | uint32_t | 0 | 1 | - | 2D 降噪开关，1 开启 / 0 关闭 | 是 |
| nr3d_en | uint32_t | 0 | 1 | - | 3D 降噪开关，1 开启 / 0 关闭 | 是 |
| debug_en | uint32_t | 0 | 1 | - | 调试开关 | 否 |

#### ynr_init_attr —— YNR set_attr 属性

用于 `hbn_vnode_set_attr` 的 `attr` 参数。

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| work_mode | uint32_t | 1 | 2 | - | ynr 工作模式：1 = Manual（online 链接，前级模块 sw trigger）；2 = 单路 Online（前级 PYM 硬件直连） | 是 |
| slot_id | uint32_t | 0 | 7 | - | ynr 硬件通道 id | 是 |
| width | uint32_t | 32 | 2048 | - | ynr 处理宽度 | 是 |
| height | uint32_t | 32 | 2048 | - | ynr 处理高度 | 是 |
| nr_static_switch | uint32_t | - | - | - | 静态降噪开关位组合：`nr3d_en << 1 \| nr2d_en` | 是 |
| in_stride[2] | uint32_t | - | - | - | y stride 和 uv stride | 是 |
| nr2d_en | uint32_t | 0 | 1 | - | 2dnr 使能 | 是 |
| nr3d_en | uint32_t | 0 | 1 | - | 3dnr 使能 | 是 |
| dma_output_en | uint32_t | 0 | 1 | - | dma 输出使能（使能 3dnr 时需要使能 dma 输出） | 是 |
| debug_en | uint32_t | 0 | 1 | - | 是否打开 debug 调试 | 否 |

#### hobot_ynr_channel_input_config —— 输入通道配置

用于 `hbn_vnode_set_ichn_attr` 的 `attr` 参数。

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| ch_img_width | uint32_t | 32 | 4096 | - | ynr 输入宽度 | 是 |
| ch_img_height | uint32_t | 32 | 2160 | - | ynr 输入高度 | 是 |

#### hobot_ynr_channel_output_config —— 输出通道配置

用于 `hbn_vnode_set_ochn_attr` 的 `attr` 参数。

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| ch_nr3d_pix_out_dma_byps | uint32_t | 32 | 4096 | - | dma 输出数，建议配置为 0 | 是 |
| ch_nr3d_debug_en | uint32_t | 0 | 1 | - | debug 开关，建议配置为 0 | 是 |

## 相关文档

- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
- [图像信号处理 - ISP](/Advanced_development/multimedia_development/multimedia_api/isp)
- [视频处理框架 - VPF/PYM](/Advanced_development/multimedia_development/multimedia_api/vpf_pym_api)
