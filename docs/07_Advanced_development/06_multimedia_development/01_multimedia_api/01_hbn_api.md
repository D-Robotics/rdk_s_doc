---
sidebar_position: 1
title: "HBN 框架说明"
description: "RDK S100/S600 多媒体基础框架 HBN API"
---

# HBN 框架说明
## 概述
摄像头链路的模块使用统一的HBN API(图中**橙色**部分)，主要有如下三部分组成
1. `HBN Framework API`（图中**红色**部分）：实现对 SOC 中硬件加速单元的软件抽象， 本章将详细描述
2. `Camera API`（图中**绿色**部分）：实现对 SOC 外的硬件模块的抽象，包括摄像头、加串器、解串器
3. `ISP API`（图中**紫色**部分）：实现对 ISP模块参数的动态调整

HBN 框架覆盖了摄像头采集链路中大部分的模块，包括 VIN、ISP、PYM、GDC、STITCH。
其中 `Camera API` 没有包含在 HBN 框架中，但是可以通过对应的 `attach` 函数绑定到 HBN 框架中。
总的来说， HBN 框架覆盖了摄像头采集链路的所有模块，并且提供了简单灵活的 API。

![软件框架](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/soft_framework_hbn_highlight.png)

## 软件抽象

HBN 框架中将 VIN、ISP、PYM、GDC、STITCH 中的每个模块用 vnode 来抽象，多个 ``vnode`` 连接成一个 ``vflow`` （类似于一条流水线）。
由于 `Camera` 使用独立的 API，所以 HBN 框架提供了 attach 接口，实现 Camera 和 VIN 进行绑定， 从而实现了完整的流水线。

1. vnode 是对硬件加速单元的抽象，在 HBN 框架中 VIN、ISP、PYM、GDC、STITCH ，都会抽象成 vnode 的概念， vnode 包含如下属性 ：
   - 硬件加速单元本身的属性，[ 比如 isp_attr_t](#isp_attr_t--isp-基本属性)
   - 硬件加速单元输入通道的属性，[ 比如 isp_ichn_attr_t](#isp_ichn_attr_t--isp-输入通道属性)
   - 硬件加速单元输出通道的属性，[ 比如 isp_ochn_attr_t](#isp_ochn_attr_t--isp-输出通道属性)
2. 多个 vnode 连接起来形成 1 个 vflow, 支持同时创建多条 vflow, 不同 vflow 之间是完全独立的 , 连接 vnode 的流程如下：
    - 创建 vflow 的接口：[hbn_vflow_create](#hbn_vflow_create)
    - vflow 中添加 vnode 节点的接口：[hbn_vflow_add_vnode](#hbn_vflow_add_vnode)
    - 在 vflow 中绑定两个 vnode 的接口：[hbn_vflow_bind_vnode](#hbn_vflow_bind_vnode)
    - 启动 vflow 的接口：[hbn_vflow_start](#hbn_vflow_start)
3. 对于 ``HBN API`` 中非 ``HBN Framework API`` 的模块，比如 Camera 支持使用 attach 接口绑定到 vflow 中
4. 对于非 ``HBN API`` 中的模块， 比如 BPU 和 Display 等，通过接口 ``hbn_vnode_get_output_frame`` 从 vflow 中获取视频帧然后调用对应的接口送入到硬件单元中

下图是三种场景的 vflow 例子（场景 1 中 **回灌** 的含义：数据源来自 DDR 的情况）：

![软件抽象](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/hbn_framework_abstract.png)

1. 场景 1 ：单路 vflow( 回灌 )
   - 场景描述：视频帧来自 DDR ( 比如读取视频文件到 DDR)，使用 GDC 对视频帧进行畸变矫正
   - 数据源：数据源没有包含在 vflow 中，需要在线程中主动将 DDR 中的视频帧送入到 vflow 中
   - vflow 中至少有 1 个 vnode，可以有多个，只有 1 个节点时可以不绑定到 vflow 中，多个 vnode 节点并且需要连接起来时，必须绑定到 vflow
   - ISP、 GDC、STITCH 都支持回灌的方式
2. 场景 2 ：单路 vflow
   - 场景描述：接入 1 路 Camera, 分别经过 VIN、 ISP、 GDC、 PYM，在 PYM 中输出 3 个通道，分别进行如下处理，
     - 通道 0 ：交给 CODEC 进行编码
     - 通道 1 ：交给 Display 进行显示
     - 通道 2 ：交给 BPU 进行推理
   - 数据源：通过 mipi 接口接入的 Camera Sensor
   - vflow 中包含数据源， vflow 启动后， HBN 框架会自动调度完成数据流的传递，不需要开发者介入
   - vflow 启动后，可以从末尾节点持续获取视频帧，并传递到非 HBN API 中的加速单元，比如图中 虚线框中的设备 (Codec、 Display、 BPU)
3. 场景 3 ：多路 vflow
   - 场景描述：接入 2 路 Camera, 分别经过不同的处理链路
   - 数据源：每个 vflow 中各接入 1 个 Camera
   - 使用两个 vflow 完成两路视频链路的采集
   - 两个 vflow 之间是完全独立

## vnode 连接
vnode 之间通过输入通道和输出通道进行连接 :

- 每个 vnode 节点，有一个输入通道和多个输出通道
- 上游 vnode 的输出通道和下游 vnode 的输入通道连接 , 多个 vnode 连接成一个 vflow
- 上游 vnode 节点的输出通道决定了 vnode 的连接方式

下面从三个方面展开描述：输入通道、输出通道、连接方式

### 输入通道

每个 vnode 只有一个输入通道，分三种情况描述
1. 源节点(VIN)：数据源来自 camera, 通过 `hbn_camera_attach_to_vin` 把 camera 与 VIN 绑定后，框架自动把camera 中的输入送入到 VIN 节点
2. 中间节点：`hbn_vflow_bind_vnode` 函数决定上游节点的那个输出与下游节点的输入通道绑定
3. 回灌场景：vnode 的输入没有与任何元素绑定，需要用户主动调用 `hbn_vnode_sendframe` 接口给 vnode的输入通道送数据

### 输出通道

- 输出通道按照两种情况进行划分：连接方式和输出的数据内容，比如 VIN节点
  - 连接方式不同：通道0 和通道1输出的都是 camera 帧，不同的是与下一个 vnode 的连接方式
  - 输出的数据内容不同：通道0、通道3、通道4的连接方式都是offline, 不同的是数据内容
- 连接方式，支持 online 模式和 offline 模式，详细见 [ 系统概述 ](./00_system_overview.md#数据交互)

- 只有 `VIN 到 ISP/PYM` 和 `ISP 到 YNR/PYM` 支持 online 通道，其他模块之间只支持 offline 通道

| 模块 | 输出通道编号 | 通道功能                            |
|------|--------------|-------------------------------------|
| VIN  | 0            | offline 通道，输出 camera 帧到 ddr      |
|      | 1            | online 通道，连接到 isp 或 pym               |
|      | 3            | offline 通道，只输出 emb data 到 ddr    |
|      | 4            | offline 通道，对 camera 帧进行裁剪后输到 ddr    |
| ISP  | 0            | offline 通道，输出 isp 处理后的帧到 ddr |
|      | 1            | online 通道，连接到ynr或pym               |
| PYM  | 0            | offline通道，输出pym图像至ddr           |
| GDC  | 0            | offline 通道，输出 gdc 处理后的帧到 ddr |


### 连接方式

#### 使用说明
只有 `VIN 到 ISP/PYM` 和 `ISP 到 YNR/PYM` 支持 online 通道，其他模块之间只支持 offline 通道，所以针对 VIN、 ISP、 PYM、YNR 之间的组合，描述如下：

| 模块组合  | 连接方式                                     | 说明                                                            |
|-----------|----------------------------------------------|-----------------------------------------------------------------|
| VIN - ISP | VIN online ISP， ISP 工作模式 PASSTHROUGH_MODE | VIN 和 ISP 之间是硬件连接，中间不经过 DDR，每个硬件实例最多支持 1 路使用该连接方式  |
|           | VIN offline ISP， ISP 工作模式 DDR_MODE        | 中间需要经过 DDR，每个硬件实例最多支持 8 路使用该连接方式                      |
| VIN - PYM | VIN online PYM                                | VIN 和 PYM 间是硬件连接，中间不经过 DDR，每个硬件实例最多支持 1 路使用该连接方式|
|           | VIN offline PYM                               | 中间需要经过 DDR，每个硬件实例最多支持 1 路使用该连接方式|
| ISP/YNR - PYM | ISP/YNR online PYM                        | ISP/YNR 和 PYM 间是硬件连接，中间不经过 DDR，每个硬件实例最多支持 8 路使用该连接方式|
|           | ISP/YNR offline PYM                           | 中间需要经过 DDR，每个硬件实例最多支持 8 路使用该连接方式|

#### 参数配置
函数 `hbn_vflow_bind_vnode` 绑定两个 vnode 节点时，通过函数参数确定模块间的连接方式，同时需要 VIN 和 ISP 节点设置为对应的配置，具体如下：

##### 通用配置
1. `hbn_vflow_bind_vnode` 需要做如下区分：
  - online: `src_out_channel=1` `dst_input_channel=0`
  - offline: `src_out_channel=0` `dst_input_channel=0`
2. vnode 设置成offline的方式连接下一个 vnode 时，必须调用函数 `hbn_vnode_set_ochn_buf_attr`来配置输出buffer

##### VIN 与 ISP
| 连接方式 | vin_node_attr 结构体 | isp_node_attr 结构体 |
|----------|----------------------|----------------------|
| online | `cim_isp_flyby=1` | `sched_mode=2` `slot_id=0` `hw_id=同VIN` |
| offline | `ddr_en=1` `cim_isp_flyby=0` | `sched_mode=1` `slot_id=4-11` `hw_id可选` |

##### VIN 与 PYM

|连接方式 | vin_node_attr 结构体 | pym_cfg_t 结构体 |
|----------|----------------------|------------------|
| online | `cim_isp_flyby=1` | `pym_mode=2` `slot_id=0` `hw_id=同VIN` |
| offline | `ddr_en=1` `cim_isp_flyby=0` | `pym_mode=3` `slot_id=4-11` `hw_id可选` |

##### ISP 与 PYM

| 连接方式 | isp_node_attr 结构体 | isp_ochn_attr_t 结构体 | pym_cfg_t 结构体 |
|----------|----------------------|------------------------|------------------|
| 单路 online | `sched_mode=2` `slot_id=0` `hw_id=同VIN` | `axi_output_mode=0` | `pym_mode=1` `slot_id=同ISP` `hw_id=同ISP` |
| 多路 online | `sched_mode=1` `slot_id=4-11` `hw_id可选` | `axi_output_mode=0` | `pym_mode=2` `slot_id=同ISP` `hw_id=同ISP` |
| offline | `sched_mode=1` `slot_id=4-11` `hw_id可选` | `axi_output_mode=9` | `pym_mode=3` `slot_id=4-11` `hw_id可选` |

单路 online 与 多路 online 都是 ISP online 到 PYM，但是存在却别， 如下描述：
1. 多路 online： VIN 到 ISP是 offline 并且是多路，然后 ISP online 到 PYM
2. 单路 online: VIN 到 ISP是 online 是单路，然后 ISP online 到 PYM
##### ISP 与 YNR 
由于 YNR 的输入不支持读取DDR 输出也不能写到DDR，所以使能 YNR后，必须使能PYM, 并且 ISP 必须 online 到 YNR，YNR 必须 online 到 pym。由于 ynr 的模式与ISP模式相关，ISP的模式与VIN的模式相关，所以分两种情况描述：

情景1：VIN 和 ISP online 的情况：
1. Vin online 到 ISP
  - `vin_node_attr` 的 `cim_isp_flyby=1`
  - `isp_node_attr` 的 `sched_mode=2`
  - `isp_node_attr` 的 `hw_id=同VIN`
2. ISP 必须 online 到 YNR
  - `isp_node_attr` 的 `slot_id=0`
  - `isp_ochn_attr_t` 的 `axi_output_mode=0`
  - `ynr_init_attr` 的 `slot_id=同ISP`
  - `ynr_init_attr` 的 `work_mode=1`
3. YNR 必须 online 到 PYM
  - `pym_cfg_t` 的 `pym_mode=2`
  - `pym_cfg_t` 的 `slot_id=同ISP`
  - `pym_cfg_t` 的 `hw_id=同ISP`

情景2：VIN 和 ISP offline 的情况：
1. Vin offline 到 ISP
  - `vin_node_attr` 的 `ddr_en=1`
  - `vin_node_attr` 的 `cim_isp_flyby=0`
  - `isp_node_attr` 的 `sched_mode=1`
  - `isp_node_attr` 的 `hw_id=选择的ISP硬件的ID`
2. ISP 必须 online 到 YNR
  - `isp_node_attr` 的 `slot_id=4-11`
  - `isp_ochn_attr_t` 的 `axi_output_mode=0`
  - `ynr_init_attr` 的 `slot_id=同ISP`
  - `ynr_init_attr` 的 `slot_id=同ISP`
  - `ynr_init_attr` 的 `work_mode=1`
3. YNR 必须 online 到 PYM
  - `pym_cfg_t` 的 `pym_mode=1`
  - `pym_cfg_t` 的 `slot_id=同ISP`
  - `pym_cfg_t` 的 `hw_id=同ISP`

表格中部分数字的含义解释：
- `isp_node_attr` 中 sched_mode 数字对应的枚举变量
  - `SCHED_MODE_MANUAL`（1）: ISP 分时复用的模式 
  - `SCHED_MODE_PASS_THRU`（2）: CIM 模块独占 ISP

- `isp_ochn_attr_t` 中 stream_output_mode 数字对应的枚举变量
  - `STREAM_OUTPUT_MODE_DISABLE`(0) ： ISP 不通过 online 的方式连接到下游模块
  - `STREAM_OUTPUT_MODE_ENABLE`(1) ： ISP 直接 online 连接到下游模块

- `isp_ochn_attr_t` 中 axi_output_mode 数字对应的枚举变量（常用的）
  - `AXI_OUTPUT_MODE_DISABLE`(0): 关闭ISP写DDR
  - `AXI_OUTPUT_MODE_RAW8`(1) ：按照 RAW8 的格式写DDR
  - `AXI_OUTPUT_MODE_RAW10`(3) ：按照 RAW10 的格式写DDR
  - `AXI_OUTPUT_MODE_YUV420`(9) ：按照 YUV420 的格式写DDR 

- `pym_cfg_t`中 pym_mode 数字对应的枚举变量
  - `PYM_MANUAL_MODE`(1): 和ISP直连，并且ISP是 SCHED_MODE_MANUAL （VIN 与 PYM 连接时不能配置这个选项）
  - `PYM_OTF_MODE`(2): 和VIN/ISP直连， 如果和ISP直连接时 `isp_node_attr` 的 `sched_mode` 必须是SCHED_MODE_PASS_THRU
  - `PYM_M2M_MODE`(3): PYM 的输入数据来自DDR

## API 调用流程

### 创建流程
#### MIPI 接口的相机模组
![创建流程](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/hbn_software_framework_api_flow_create_and_start.png)

- `hbn_vnode_open` 打开各模块，获取 vnode handle。
- `hbn_vnode_set_attr` / `set_ochn_attr` / `set_ichn_attr` 配置模块与通道属性。
- `hbn_vflow_create` 创建 vflow，`hbn_vflow_add_vnode` 加入各 vnode，`hbn_vflow_bind_vnode` 绑定上下游通道。
- `hbn_camera_create` 和 `hbn_camera_attach_to_vin` 创建 camera 然后 绑定到 VIN
- `hbn_vnode_start` 启动各模块，vflow 开始流转数据帧。

#### Serdes 接口的相机模组
![创建流程](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/hbn_software_framework_api_flow_create_and_start_serdes.png)

- `hbn_vnode_open` 打开各模块，获取 vnode handle。
- `hbn_vnode_set_attr` / `set_ochn_attr` / `set_ichn_attr` 配置模块与通道属性。
- `hbn_vflow_create` 创建 vflow，`hbn_vflow_add_vnode` 加入各 vnode，`hbn_vflow_bind_vnode` 绑定上下游通道。
- `hbn_camera_create` 和 `hbn_deserial_create` 创建 camera 和 Deserial
- `hbn_camera_attach_to_vin` 和 `hbn_deserial_attach_to_vin` 把 camera、deserial、vin 三个模块按照顺序绑定
- `hbn_vnode_start` 启动各模块，vflow 开始流转数据帧。
### 循环处理流程
![创建流程](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/hbn_software_framework_api_flow_loop_process.png)

### 销毁流程
销毁流程是创建流程的反操作，但是有如下几点需要注意：
- 调用了 `hbn_vflow_destroy` 就不需要再调用 hbn_vnode_close 和 hbn_vflow_unbind_vnode
- 调用了 `hbn_camera_destroy` 就不需要再调用 hbn_camera_detach_from_vin

![创建流程](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/hbn_software_framework_api_flow_stop_and_destroy.png)

- `hbn_vnode_stop` 停止各模块。
- `hbn_vflow_destroy` 销毁 vflow（已串入 vflow 的 vnode 无须再单独 `hbn_vnode_close`；独立使用的模块如 GDC 回灌需单独 close）。

## 快速示例

以下示例参考板端 `/app/multimedia_samples/sample_isp/get_isp_data/` 的最小调用序列，演示 VIN→ISP 两级 vflow 的创建、启动与取帧：

```c
#include "hbn_vpf_interface.h"
#include "hb_mem_mgr.h"

hbn_vnode_handle_t vin_fd, isp_fd;
hbn_vflow_handle_t vflow_fd;

// 1. 打开 VIN / ISP 模块
hbn_vnode_open(HB_VIN, mipi_rx, AUTO_ALLOC_ID, &vin_fd);
hbn_vnode_open(HB_ISP, 0, AUTO_ALLOC_ID, &isp_fd);

// 2. 配置模块属性与通道属性
hbn_vnode_set_attr(vin_fd, &vin_attr);
hbn_vnode_set_ichn_attr(vin_fd, 0, &vin_ichn_attr);
hbn_vnode_set_ochn_attr(vin_fd, 0, &vin_ochn_attr);
hbn_vnode_set_attr(isp_fd, &isp_attr);
hbn_vnode_set_ichn_attr(isp_fd, 0, &isp_ichn_attr);
hbn_vnode_set_ochn_attr(isp_fd, 0, &isp_ochn_attr);

// 3. 创建 vflow，加入 vnode 并绑定上下游通道
hbn_vflow_create(&vflow_fd);
hbn_vflow_add_vnode(vflow_fd, vin_fd);
hbn_vflow_add_vnode(vflow_fd, isp_fd);
hbn_vflow_bind_vnode(vflow_fd, vin_fd, 0, isp_fd, 0);

// 4. 启动 vflow，数据帧自动由 VIN 流转到 ISP
hbn_vflow_start(vflow_fd);

// 5. 从 ISP 输出通道取帧，处理完归还
hbn_vnode_image_group_t out_group;
hbn_vnode_getframe_group(isp_fd, 0, 10000, &out_group);
/* 处理 out_group ... */
hbn_vnode_releaseframe_group(isp_fd, 0, &out_group);

// 6. 停止并销毁
hbn_vflow_stop(vflow_fd);
hbn_vflow_destroy(vflow_fd);
```

## API 列表

| API 接口 | 接口功能 |
| --- | --- |
| [hbn_vnode_open](#hbn_vnode_open) | 打开模块设备节点，返回 vnode handle |
| [hbn_vnode_close](#hbn_vnode_close) | 关闭模块的设备节点 |
| [hbn_vnode_set_attr](#hbn_vnode_set_attr) | 设置 vnode 属性 |
| [hbn_vnode_get_attr](#hbn_vnode_get_attr) | 获取 vnode 属性 |
| [hbn_vnode_set_attr_ex](#hbn_vnode_set_attr_ex) | 设置 vnode 扩展属性 |
| [hbn_vnode_get_attr_ex](#hbn_vnode_get_attr_ex) | 获取 vnode 扩展属性 |
| [hbn_vnode_set_ochn_attr](#hbn_vnode_set_ochn_attr) | 设置模块的输出通道属性 |
| [hbn_vnode_get_ochn_attr](#hbn_vnode_get_ochn_attr) | 获取模块的输出通道属性 |
| [hbn_vnode_set_ochn_attr_ex](#hbn_vnode_set_ochn_attr_ex) | 设置模块的输出通道扩展属性，可在应用运行中动态设置 |
| [hbn_vnode_set_ichn_attr](#hbn_vnode_set_ichn_attr) | 设置模块的输入通道属性 |
| [hbn_vnode_get_ichn_attr](#hbn_vnode_get_ichn_attr) | 获取模块的输入通道属性 |
| [hbn_vnode_set_ichn_attr_ex](#hbn_vnode_set_ichn_attr_ex) | 设置模块的输入通道扩展属性，可在应用运行中动态设置 |
| [hbn_vnode_set_ochn_buf_attr](#hbn_vnode_set_ochn_buf_attr) | 设置输出通道 buffer 属性 |
| [hbn_vnode_start](#hbn_vnode_start) | 启动 vnode，启动前需要先打开模块 |
| [hbn_vnode_stop](#hbn_vnode_stop) | 停止 vnode |
| [hbn_vnode_getframe](#hbn_vnode_getframe) | 获取模块输出通道的图像，阻塞型接口 |
| [hbn_vnode_releaseframe](#hbn_vnode_releaseframe) | 释放图像 buffer，buffer 会归还到指定的输出通道 |
| [hbn_vnode_sendframe](#hbn_vnode_sendframe) | 发送图像到模块的输入通道，会触发模块进行处理。阻塞型接口，等待硬件处理完再返回，默认超时时间为 1 秒 |
| [hbn_vnode_sendframe_async](#hbn_vnode_sendframe_async) | 发送图像到模块的输入通道，会触发模块进行处理。非阻塞型接口 |
| [hbn_vnode_set_output_frame](#hbn_vnode_set_output_frame) | 设置模块输出通道的图像 buffer，非阻塞型接口，外部设置输出 buffer |
| [hbn_vnode_get_output_frame](#hbn_vnode_get_output_frame) | 获取模块处理后的图像 buffer，和 hbn_vnode_set_output_frame 配合使用，非阻塞型接口 |
| [hbn_vflow_create](#hbn_vflow_create) | 创建一个 vflow，返回 vflow handle |
| [hbn_vflow_destroy](#hbn_vflow_destroy) | 根据 vflow handle，销毁一个 vflow |
| [hbn_vflow_add_vnode](#hbn_vflow_add_vnode) | 把模块添加到 vflow 里面，用 vflow 管理起来 |
| [hbn_vflow_bind_vnode](#hbn_vflow_bind_vnode) | 把两个模块绑定到一起，绑定后 src_vnode_fd 模块的数据帧会自动流向 dst_vnode_fd 模块 |
| [hbn_vflow_unbind_vnode](#hbn_vflow_unbind_vnode) | 解绑 src_vnode_fd 和 dst_vnode_fd 模块 |
| [hbn_vflow_start](#hbn_vflow_start) | 启动一条 vflow，vflow 里包含的 vnode 都会启动 |
| [hbn_vflow_stop](#hbn_vflow_stop) | 停止一条 vflow，vflow 里包含的 vnode 都会停止 |
| [hbn_vflow_get_vnode_handle](#hbn_vflow_get_vnode_handle) | 通过模块 id 和 context id 获取 vnode handle |
| [hbn_vflow_get_version](#hbn_vflow_get_version) | 获取 hbn api 的版本信息 |
| [hbn_vnode_getframe_group](#hbn_vnode_getframe_group) | 获取模块输出通道的多层聚合图像（hbn_vnode_image_group_t），阻塞型接口，ISP 和 PYM 输出图像需要调用该接口获取 |
| [hbn_vnode_releaseframe_group](#hbn_vnode_releaseframe_group) | 释放多层聚合图像 buffer，buffer 会归还到指定的输出通道 |
| [hbn_vnode_getframe_cond](#hbn_vnode_getframe_cond) | 带时间条件获取模块输出通道的图像：自动丢弃时间戳早于设定条件的旧帧，返回足够新的帧，阻塞型接口 |
| [hbn_vnode_getframe_group_cond](#hbn_vnode_getframe_group_cond) | hbn_vnode_getframe_cond 的多层聚合图像版本，带时间条件获取 group 图像，阻塞型接口 |
| [hbn_vnode_sendframe_group](#hbn_vnode_sendframe_group) | 发送多层聚合图像到模块的输入通道，会触发模块进行处理（group 回灌场景） |
| [hbn_vnode_set_output_groupframe](#hbn_vnode_set_output_groupframe) | 为模块输出通道设置外部的多层聚合图像 buffer |
| [hbn_vnode_get_output_groupframe](#hbn_vnode_get_output_groupframe) | 获取模块处理后的多层聚合图像 buffer，和 hbn_vnode_set_output_groupframe 配合使用 |
| [hbn_vnode_get_fd](#hbn_vnode_get_fd) | 获取模块输出通道的设备文件描述符，可用于用户自定义 poll 监听 |
| [hbn_vflow_del_vnode](#hbn_vflow_del_vnode) | 把 vnode 从 vflow 中移除，解除 vflow 对该模块的管理 |
| [hbn_vflow_pause](#hbn_vflow_pause) | 暂停一条 vflow 的数据流转 |
| [hbn_vflow_resume](#hbn_vflow_resume) | 恢复一条已暂停的 vflow 的数据流转 |
| [hbn_vflow_get_fd](#hbn_vflow_get_fd) | 获取当前已创建 vflow 的 fd 数组（拷贝全局 vflow 句柄表） |

## API 接口说明

### hbn_vnode_open

【函数原型】

hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id, int32_t
ctx_id, hbn_vnode_handle_t *vnode_fd)

【参数】

- [IN] hb_vnode_type
vnode_type：vnode 类型，每个硬件模块对应一个 vnode 类型。取值为 HB_VIN、HB_ISP、HB_PYM 等；

- [IN] uint32_t hw_id：模块的硬件 id。

- [IN] uint32_t ctx_id：模块的 context id，软件上的概念，可指定 context
id 值，也可设置为 AUTO_ALLOC_ID，由 SDK 自动分配 context id；

- [OUT] hbn_vnode_handle_t *vnode_fd：返回模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明。

【功能描述】

初始化某个模块，打开该模块设备节点，返回该模块的 vnode handle。

【注意事项】

无

### hbn_vnode_close

【函数原型】

hobot_status hbn_vnode_close(hbn_vnode_handle_t vnode_fd)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

关闭模块的设备节点。

【注意事项】

调用了 hbn_vflow_destroy 就无须再调用 hbn_vnode_close。

模块单独使用时（例如只是 GDC 回灌）可调用 hbn_vnode_close，模块串在 vflow 中，调用 hbn_vflow_destroy 即可，无须调用 hbn_vnode_close。

### hbn_vnode_set_attr

【函数原型】

hobot_status hbn_vnode_set_attr(hbn_vnode_handle_t vnode_fd, void *attr)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] void
*attr：模块的基本属性结构体指针。基本属性结构体可以是 vin_attr_t、isp_attr_t、pym_attr_t 等，以模块名+_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的基本属性。

【注意事项】

无

### hbn_vnode_get_attr

【函数原型】

hobot_status hbn_vnode_get_attr(hbn_vnode_handle_t vnode_fd, void *attr)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [OUT] void
*attr：模块的基本属性结构体指针。基本属性结构体可以是 vin_attr_t、isp_attr_t、pym_attr_t 等，以模块名+_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块的基本属性。

【注意事项】

无

### hbn_vnode_set_attr_ex

【函数原型】

hobot_status hbn_vnode_set_attr_ex(hbn_vnode_handle_t vnode_fd, void *attr)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] void
*attr：模块的扩展属性结构体指针。扩展属性结构体可以是 vin_attr_ex_t 等，以模块名+_attr_ex_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的扩展属性，可在应用运行中动态设置。

【注意事项】

无

### hbn_vnode_get_attr_ex

【函数原型】

hobot_status hbn_vnode_get_attr_ex(hbn_vnode_handle_t vnode_fd, void *attr)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [OUT] void
*attr：模块的扩展属性结构体指针。扩展属性结构体可以是 vin_attr_ex_t 等，以模块名+_attr_ex_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块的扩展属性。

【注意事项】

无

### hbn_vnode_set_ochn_attr

【函数原型】

hobot_status hbn_vnode_set_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, void *attr)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；；

- [IN] void
*attr：模块的输出通道属性结构体指针。输出通道属性可以是 vin_ochn_attr_t、isp_ochn_attr_t 等，以模块名+_ochn_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的输出通道属性。

【注意事项】

无

### hbn_vnode_get_ochn_attr

【函数原型】

hobot_status hbn_vnode_get_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, void *attr)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [OUT] void
*attr：模块输出通道属性结构体指针。输出通道属性可以是 vin_ochn_attr_t、isp_ochn_attr_t 等，以模块名+_ochn_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块的输出通道属性。

【注意事项】

无

### hbn_vnode_set_ochn_attr_ex

【函数原型】

hobot_status hbn_vnode_set_ochn_attr_ex(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, void *attr)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [IN] void
*attr：模块的输出通道扩展属性结构体指针。输出通道扩展属性可以是 pym_ochn_attr_ex_t 等，以模块名+_ochn_attr_ex_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的输出通道扩展属性，可在应用运行中动态设置。

【注意事项】

无

### hbn_vnode_set_ichn_attr

【函数原型】

hobot_status hbn_vnode_set_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ichn_id, void *attr)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ichn_id：模块的输入通道 id，通道 id 见模块通道说明；

- [IN] void
*attr：模块的输入通道属性结构体指针。输入通道属性可以是 vin_ichn_attr_t、isp_ichn_attr_t 等，以模块名+_ichn_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的输入通道属性。

【注意事项】

无

### hbn_vnode_get_ichn_attr

【函数原型】

hobot_status hbn_vnode_get_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ichn_id, void *attr)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ichn_id：模块的输入通道 id，通道 id 见模块通道说明；

- [OUT] void
*attr：模块的输入通道属性结构体指针。输入通道属性可以是 vin_ichn_attr_t、isp_ichn_attr_t 等，以模块名+_ichn_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块的输入通道属性。

【注意事项】

无

### hbn_vnode_set_ichn_attr_ex

【函数原型】

hobot_status hbn_vnode_set_ichn_attr_ex(hbn_vnode_handle_t vnode_fd, uint32_t
ichn_id, void *attr)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ichn_id：模块的输入通道 id，通道 id 见模块通道说明；

- [IN] void
*attr：模块的输入通道扩展属性结构体指针。输入通道扩展属性以模块名+_ichn_attr_ex_t 结尾；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的输入通道扩展属性，可在应用运行中动态设置。

【注意事项】

无

### hbn_vnode_set_ochn_buf_attr

【函数原型】

hobot_status hbn_vnode_set_ochn_buf_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, hbn_buf_alloc_attr_t *alloc_attr)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [IN] hbn_buf_alloc_attr_t *alloc_attr：buffer 分配属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置输出通道 buffer 属性。

【注意事项】

无

### hbn_vnode_start

【函数原型】

hobot_status hbn_vnode_start(hbn_vnode_handle_t vnode_fd)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

模块启动。

【注意事项】

启动前需要先打开模块。

### hbn_vnode_stop

【函数原型】

hobot_status hbn_vnode_stop(hbn_vnode_handle_t vnode_fd)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

模块停止。

【注意事项】

无

### hbn_vnode_getframe

【函数原型】

hobot_status hbn_vnode_getframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
uint32_t millisecondTimeout, hbn_vnode_image_t *out_img)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [IN] uint32_t millisecondTimeout：超时等待时间；

- [OUT] hbn_vnode_image_t *out_img：输出图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块输出通道的图像，阻塞型接口。

【注意事项】

无

### hbn_vnode_releaseframe

【函数原型】

hobot_status hbn_vnode_releaseframe(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, hbn_vnode_image_t *img)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [IN] hbn_vnode_image_t *img：图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

释放图像 buffer，buffer 会归还到指定的输出通道。

【注意事项】

无

### hbn_vnode_getframe_group

【函数原型】

hobot_status hbn_vnode_getframe_group(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, uint32_t millisecondTimeout,hbn_vnode_image_group_t *out_img);

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [IN] uint32_t millisecondTimeout：超时等待时间；

- [OUT] hbn_vnode_image_group_t *out_img：输出图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块输出通道的多层聚合图像，阻塞型接口。

【注意事项】

ISP 和 PYM 输出图像需要调用该接口获取

### hbn_vnode_releaseframe_group

【函数原型】

hobot_status hbn_vnode_releaseframe_group(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, hbn_vnode_image_group_t*img)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [IN] hbn_vnode_image_group_t *img_group：多层聚合图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

释放多层聚合图像 buffer，buffer 会归还到指定的输出通道。

【注意事项】

无

### hbn_vnode_sendframe

【函数原型】

hobot_status hbn_vnode_sendframe(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
hbn_vnode_image_t *img)

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ichn_id：模块的输入通道 id，通道 id 见模块通道说明；

- [IN] hbn_vnode_image_t *img：输入图像 buffer 地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

发送图像到模块的输入通道，会触发模块进行处理。阻塞型接口，等待硬件处理完再返回，默认超时时间为1秒。

【注意事项】

无

### hbn_vflow_create

【函数原型】

hobot_status hbn_vflow_create(hbn_vflow_handle_t *vflow_fd)

【参数】

- [OUT] hbn_vflow_handle_t *vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

创建一个 vflow，返回 vflow handle。

【注意事项】

无

### hbn_vflow_destroy

【函数原型】

hobot_status hbn_vflow_destroy(hbn_vflow_handle_t vflow_fd)

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

根据 vflow handle，销毁一个 vflow。

【注意事项】

无

### hbn_vflow_add_vnode

【函数原型】

hobot_status hbn_vflow_add_vnode(hbn_vflow_handle_t vflow_fd, hbn_vnode_handle_t
vnode_fd)

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle；

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

把模块添加到 vflow 里面，用 vflow 管理起来。

【注意事项】

无

### hbn_vflow_bind_vnode

【函数原型】

hobot_status hbn_vflow_bind_vnode(hbn_vflow_handle_t vflow_fd,
hbn_vnode_handle_t src_vnode_fd, uint32_t out_chn, hbn_vnode_handle_t
dst_vnode_fd, uint32_t in_chn)

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle；

- [IN] hbn_vnode_handle_t src_vnode_fd：源模块的 vnode handle；

- [IN] uint32_t out_chn：源模块的输出通道 id，通道 id 见模块通道说明；

- [IN] hbn_vnode_handle_t dst_vnode_fd：目的模块的 vnode handle；

- [IN] uint32_t in_chn：目的模块的输入通道 id，通道 id 见模块通道说明；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

把两个模块绑定到一起。绑定后 src_vnode_fd 模块的数据帧会自动流向 dst_vnode_fd 模块。

【注意事项】

flow 需要创建，模块需要 open。

### hbn_vflow_unbind_vnode

【函数原型】

hobot_status hbn_vflow_unbind_vnode(hbn_vflow_handle_t vflow_fd,
hbn_vnode_handle_t src_vnode_fd, uint32_t out_chn, hbn_vnode_handle_t
dst_vnode_fd, uint32_t in_chn)

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle；

- [IN] hbn_vnode_handle_t src_vnode_fd：源模块的 vnode handle；

- [IN] uint32_t out_chn：源模块的输出通道 id，通道 id 见模块通道说明；

- [IN] hbn_vnode_handle_t dst_vnode_fd：目的模块的 vnode handle；

- [IN] uint32_t in_chn：目的模块的输入通道 id，通道 id 见模块通道说明；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

解绑 src_vnode_fd 和 dst_vnode_fd 模块。

【注意事项】

暂不支持。

### hbn_vflow_start

【函数原型】

hobot_status hbn_vflow_start(hbn_vflow_handle_t vflow_fd)

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

启动一条 vflow。vflow 里包含的 vnode 都会启动。

【注意事项】

模块 vnode 需要事先添加到 vflow 中。

### hbn_vflow_stop

【函数原型】

hobot_status hbn_vflow_stop(hbn_vflow_handle_t vflow_fd)

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

停止一条 vflow。vflow 里包含的 vnode 都会停止。

【注意事项】

和 hbn_vflow_start 成对使用。

### hbn_vflow_get_vnode_handle

【函数原型】

hbn_vnode_handle_t hbn_vflow_get_vnode_handle(hbn_vflow_handle_t vflow_fd,
hb_vnode_type vnode_type, uint32_t index)

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle；

- [IN] hb_vnode_type vnode_type：模块 id；

- [IN] uint32_t index：context id，范围为[0, 7]

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

通过模块 id 和 context id 获取 vnode handle。

【注意事项】

模块需要事先 open。

### hbn_vnode_get_fd

【函数原型】

```c
hobot_status hbn_vnode_get_fd(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, int32_t *fd);
```

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [OUT] int32_t *fd：返回输出通道的设备文件描述符；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块输出通道的设备文件描述符 fd，可用于用户自定义 poll/epoll 监听帧到达事件。

【注意事项】

输出通道需要已配置激活，否则返回 HBN_STATUS_NOT_SUPPORT。

### hbn_vnode_getframe_cond

【函数原型】

```c
hobot_status hbn_vnode_getframe_cond(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, uint32_t millisecondTimeout, int32_t cond_time, hbn_vnode_image_t *out_img); // block function;
```

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [IN] uint32_t millisecondTimeout：超时等待时间；

- [IN] int32_t cond_time：时间条件，单位毫秒。为 0 时先丢弃通道中缓存的旧帧再取帧；大于 0 时循环取帧，直到获得时间戳晚于（起始时间 - cond_time）的帧；

- [OUT] hbn_vnode_image_t *out_img：输出图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

带时间条件获取模块输出通道的图像，自动丢弃过旧的帧、返回足够新的帧。阻塞型接口。

【注意事项】

无

### hbn_vnode_getframe_group_cond

【函数原型】

```c
hobot_status hbn_vnode_getframe_group_cond(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, uint32_t millisecondTimeout, int32_t cond_time, hbn_vnode_image_group_t *out_img); // block function;
```

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [IN] uint32_t millisecondTimeout：超时等待时间；

- [IN] int32_t cond_time：时间条件，单位毫秒，语义同 hbn_vnode_getframe_cond；

- [OUT] hbn_vnode_image_group_t *out_img：输出的多层聚合图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

hbn_vnode_getframe_cond 的多层聚合图像版本，按时间条件丢弃过旧帧后返回足够新的 group 图像。阻塞型接口。

【注意事项】

ISP 和 PYM 输出图像需要调用 group 接口获取。

### hbn_vnode_sendframe_async

【函数原型】

```c
hobot_status hbn_vnode_sendframe_async(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, hbn_vnode_image_t *img); // no block function
```

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ichn_id：模块的输入通道 id，通道 id 见模块通道说明；

- [IN] hbn_vnode_image_t *img：输入图像 buffer 地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

发送图像到模块的输入通道，会触发模块进行处理。非阻塞型接口，调用后立即返回，不等待硬件处理完成。

【注意事项】

无

### hbn_vflow_del_vnode

【函数原型】

```c
hobot_status hbn_vflow_del_vnode(hbn_vflow_handle_t vflow_fd, hbn_vnode_handle_t vnode_fd);
```

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle；

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

把 vnode 从 vflow 中移除，解除 vflow 对该模块的管理。

【注意事项】

无

### hbn_vflow_pause

【函数原型】

```c
hobot_status hbn_vflow_pause(hbn_vflow_handle_t vflow_fd);
```

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

暂停一条 vflow 的数据流转。

【注意事项】

vflow 中需要包含 VIN 节点，内部通过 VIN 节点下发暂停命令。

### hbn_vflow_resume

【函数原型】

```c
hobot_status hbn_vflow_resume(hbn_vflow_handle_t vflow_fd);
```

【参数】

- [IN] hbn_vflow_handle_t vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

恢复一条已暂停的 vflow 的数据流转。

【注意事项】

vflow 中需要包含 VIN 节点，内部通过 VIN 节点下发恢复命令。

### hbn_vflow_get_version

【函数原型】

```c
hobot_status hbn_vflow_get_version(hbn_version_t *version);
```

【参数】

- [OUT] hbn_version_t *version：返回版本信息；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取 HBN API（vpf）的版本信息。

【注意事项】

无

### hbn_vnode_set_output_frame

【函数原型】

```c
hobot_status hbn_vnode_set_output_frame(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_t *img);
```

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [IN] hbn_vnode_image_t *img：外部设置的输出图像 buffer 地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块输出通道的图像 buffer，输出 buffer 由外部提供，非阻塞型接口。

【注意事项】

无

### hbn_vnode_set_output_groupframe

【函数原型】

```c
hobot_status hbn_vnode_set_output_groupframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_group_t *img_group);
```

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [IN] hbn_vnode_image_group_t *img_group：外部设置的输出多层聚合图像 buffer 地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

为模块输出通道设置外部的多层聚合图像 buffer。

【注意事项】

无

### hbn_vnode_sendframe_group

【函数原型】

```c
hobot_status hbn_vnode_sendframe_group(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, hbn_vnode_image_group_t *img_group);
```

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ichn_id：模块的输入通道 id，通道 id 见模块通道说明；

- [IN] hbn_vnode_image_group_t *img_group：输入的多层聚合图像 buffer 地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

发送多层聚合图像到模块的输入通道，会触发模块进行处理，用于 group 回灌场景。

【注意事项】

无

### hbn_vnode_get_output_groupframe

【函数原型】

```c
hobot_status hbn_vnode_get_output_groupframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_group_t *img_group);
```

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [OUT] hbn_vnode_image_group_t *img_group：返回处理后的多层聚合图像 buffer；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块处理后的多层聚合图像 buffer，和 hbn_vnode_set_output_groupframe 配合使用。

【注意事项】

无

### hbn_vnode_get_output_frame

【函数原型】

```c
hobot_status hbn_vnode_get_output_frame(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_t *img);
```

【参数】

- [IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

- [IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

- [OUT] hbn_vnode_image_t *img：返回处理后的图像 buffer；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块处理后的图像 buffer，和 hbn_vnode_set_output_frame 配合使用，非阻塞型接口。

【注意事项】

无

### hbn_vflow_get_fd

【函数原型】

```c
hobot_status hbn_vflow_get_fd(hbn_vflow_handle_t *vflow_fd);
```

【参数】

- [OUT] hbn_vflow_handle_t *vflow_fd：返回 vflow fd 数组（共 HBN_VFLOW_PIPELINE_MAX 个）；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取当前进程已创建 vflow 的 fd 数组（拷贝全局 vflow 句柄表，共 HBN_VFLOW_PIPELINE_MAX 个）。

【注意事项】

无

## 数据结构

### 公共

#### hbn_vnode_image_t —— 单层图像 buffer

用于 `hbn_vnode_getframe` / `hbn_vnode_releaseframe` / `hbn_vnode_sendframe`（及其 `_async`、`_cond` 变体）的 `img` / `out_img` 参数：

| 名称 | 类型 | 含义 |
| --- | --- | --- |
| info | hbn_frame_info_t | 帧信息（帧号、时间戳等），见下 |
| buffer | hb_mem_graphic_buf_t | 图像 buffer（宽高、格式、stride、地址等），见下 |
| metadata | void * | 附加元数据 |

#### hbn_frame_info_t —— 帧信息

`hbn_vnode_image_t` 的 `info` 成员：

| 名称 | 类型 | 含义 |
| --- | --- | --- |
| frame_id | uint32_t | 帧号 |
| timestamps | uint64_t | 系统时间戳 |
| tv | struct timeval | 硬件时间戳 |
| trig_tv | struct timeval | 外部触发的硬件时间戳 |
| bufferindex | int32_t | buffer 索引 |

#### hb_mem_graphic_buf_t —— 图像内存

`hbn_vnode_image_t` 的 `buffer` 成员，由 HB_MEM 管理，基于 dmabuf 实现跨模块零拷贝传递（完整定义见 `hb_mem_mgr.h`）：

| 名称 | 类型 | 含义 |
| --- | --- | --- |
| fd[MAX_GRAPHIC_BUF_COMP] | int32_t | 各 plane 的 dmabuf 文件描述符 |
| plane_cnt | int32_t | plane 个数 |
| format | int32_t | 图像格式 |
| width | int32_t | 图像宽度 |
| height | int32_t | 图像高度 |
| stride | int32_t | 宽度 stride |
| vstride | int32_t | 高度 stride |
| is_contig | int32_t | buffer 物理地址是否连续 |
| share_id[MAX_GRAPHIC_BUF_COMP] | int32_t | 共享 id |
| flags | int64_t | 标志位 |
| size[MAX_GRAPHIC_BUF_COMP] | uint64_t | 各 plane 的 buffer 大小 |
| virt_addr[MAX_GRAPHIC_BUF_COMP] | uint8_t * | 各 plane 的虚拟地址 |
| phys_addr[MAX_GRAPHIC_BUF_COMP] | uint64_t | 各 plane 的物理地址 |
| offset[MAX_GRAPHIC_BUF_COMP] | uint64_t | 各 plane 的内存偏移 |

#### hbn_vnode_image_group_t —— 多层聚合图像 buffer

用于 `hbn_vnode_getframe_group` / `hbn_vnode_releaseframe_group` / `hbn_vnode_sendframe_group` 等 group 接口的 `img_group` / `out_img` 参数。ISP、PYM 输出为多层图像，需要使用 group 结构获取：

| 名称 | 类型 | 含义 |
| --- | --- | --- |
| info | hbn_frame_info_t | 帧信息，同 hbn_frame_info_t |
| buf_group | hb_mem_graphic_buf_group_t | group 图像内存，见下 |
| metadata | void * | 附加元数据 |

#### hb_mem_graphic_buf_group_t —— group 图像内存

`hbn_vnode_image_group_t` 的 `buf_group` 成员：

| 名称 | 类型 | 含义 |
| --- | --- | --- |
| graph_group[HB_MEM_MAXIMUM_GRAPH_BUF] | hb_mem_graphic_buf_t | 各层图像内存 |
| group_id | int32_t | group id 号 |
| bit_map | uint32_t | 按 bit 标识 graph_group 中可用的层 |

### VIN

#### vin_attr_t —— VIN 节点属性

用于 `hbn_vnode_set_attr`（vnode 类型 `HB_VIN`）：

| 名称 | 类型 | 含义 | 必选 |
| --- | --- | --- | --- |
| vin_node_attr | vin_node_attr_t | VIN 节点属性，见下 | 是 |
| magicNumber | uint32_t | 属性结构体校验值，固定填 MAGIC_NUM | 是 |

#### vin_node_attr_t

`vin_attr_t` 的主体，聚合 CIM 等子模块参数：

| 名称 | 类型 | 含义 | 必选 |
| --- | --- | --- | --- |
| cim_attr | cim_attr_t | CIM 参数，见下 | 是 |
| lpwm_attr | lpwm_attr_t | LPWM 参数 | 否 |
| vcon_attr | vcon_attr_t | VCON 参数 | 否 |
| magicNumber | uint32_t | 属性结构体校验值，固定填 MAGIC_NUM | 是 |

#### cim_attr_t —— CIM 接入属性

配置 MIPI RX 接入与硬件直连（online）通路：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| mipi_en | uint32_t | 0 | 1 | - | 是否使能 MIPI 输入 | 是 |
| mipi_rx | uint32_t | 0 | 4 | - | MIPI RX 索引，常用取值 0、1、4 | 是 |
| vc_index | uint32_t | 0 | 3 | - | 虚拟通道（VC）索引 | 是 |
| cim_pym_flyby | uint32_t | 0 | 1 | - | CIM 与 PYM 硬件直连（online）使能 | 是 |
| cim_isp_flyby | uint32_t | 0 | 1 | - | CIM 与 ISP 硬件直连（online）使能 | 是 |

#### vin_ichn_attr_t —— VIN 输入通道属性

用于 `hbn_vnode_set_ichn_attr`（VIN），描述 MIPI 输入图像：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| format | uint32_t | 0x1E | 0x27 | - | MIPI 输入图像格式，如 raw12 对应 0x2c | 是 |
| width | uint32_t | 32 | 4096 | - | MIPI 输入图像宽 | 是 |
| height | uint32_t | 32 | 2160 | - | MIPI 输入图像高 | 是 |

#### vin_ochn_attr_t —— VIN 输出通道属性

用于 `hbn_vnode_set_ochn_attr`（VIN）。输出通道编号与功能的对应关系见「vnode 连接」章节的「输出通道」小节：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| ddr_en | uint32_t | 0 | 1 | - | 使能 CIM 主通路写 DDR（offline 输出） | 否 |
| roi_en | uint32_t | 0 | 1 | - | 使能 ROI 通道输出 | 否 |
| emb_en | uint32_t | 0 | 1 | - | 使能 embedded data 通道输出 | 否 |
| rawds_en | uint32_t | 0 | 1 | - | 使能 raw scaler | 否 |
| pingpong_ring | uint32_t | 0 | 1 | - | 使能乒乓 buffer | 否 |
| ochn_attr_type | vin_ochn_attr_type_e | - | - | - | 输出通道类型：VIN_MAIN_FRAME（主数据通路）、VIN_ONLINE（online 通路）、VIN_EMB（embedded 数据通路）、VIN_ROI（ROI 数据通路） | 是 |
| vin_basic_attr | vin_basic_attr_t | - | - | - | 基础属性，见下 | 是 |
| rawds_attr | vin_rawds_attr_t | - | - | - | raw scaler 属性 | 否 |
| roi_attr | struct vin_roi_attr_s | - | - | - | ROI 属性 | 否 |
| emb_attr | vin_emb_attr_t | - | - | - | embedded 属性 | 否 |
| magicNumber | uint32_t | - | - | - | 属性结构体校验值，固定填 MAGIC_NUM | 是 |

#### vin_basic_attr_t

`vin_ochn_attr_t` 的 `vin_basic_attr` 成员：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| pack_mode | uint32_t | 0 | 1 | 1 | pack 使能，不配置默认 pack | 否 |
| wstride | uint32_t | 0 | 1 | 1 | 输出宽 stride，置 0 内部自动计算 | 否 |
| vstride | uint32_t | 0 | 1 | 1 | 输出高 stride，置 0 内部自动计算 | 否 |
| format | uint32_t | 0x1E | 0x27 | - | 输出图像格式，如 raw12 对应 0x2c | 是 |

### ISP

#### isp_attr_t —— ISP 基本属性

用于 `hbn_vnode_set_attr`（vnode 类型 `HB_ISP`）：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| channel | isp_channel_t | - | - | - | ISP 通道属性（hw_id / slot_id），见下 | 是 |
| sched_mode | sched_mode_e | 0 | 2 | - | 调度模式：SCHED_MODE_TDMF（0）、SCHED_MODE_MANUAL（1，分时复用，常用）、SCHED_MODE_PASS_THRU（2，CIM 直连独占）。串接 YNR / PYM 时，其 work_mode / pym_mode 与 slot_id 需与 ISP 一致 | 是 |
| work_mode | isp_work_mode_e | 0 | 2 | 0 | 工作模式：ISP_WORK_MODE_NOMAL（0，正常）、ISP_WORK_MODE_TPG（1，ISP 输出测试图案）、ISP_WORK_MODE_CIM_TPG（2，CIM 输出测试图案） | 否 |
| hdr_mode | hdr_mode_e | 0 | 7 | - | HDR 合成模式：LINEAR（0，线性）、NATIVE（1，sensor 侧合成）、2To1 / 3To1 / 4To1 的 _LINE 与 _FRAME（2\~7） | 否 |
| size | image_size_t | - | - | - | ISP 处理尺寸，见下 | 否 |
| frame_rate | uint32_t | 1 | 120 | - | 帧率 | 否 |
| isp_combine | isp_combine_t | - | - | - | ISP 主从模式 | 否 |
| algo_state | uint32_t | 0 | 1 | - | 2A 算法使能：1 = 自动运行（常用），0 = 关闭 | 否 |

#### isp_channel_t

`isp_attr_t` 的 `channel` 成员：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| hw_id | uint32_t | 0 | 1（S100）/ 3（S600） | - | ISP 硬件 id，选择第几个 ISP | 是 |
| slot_id | uint32_t | 0 | 11 | 0 | 硬件通道槽位：online（CIM 直连）输入取 0\~3，offline（经 DDR）输入取 4\~11，多路时各路不能重复 | 是 |

#### image_size_t

`isp_attr_t` 的 `size` 成员：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| width | uint32_t | 32 | 4096 | - | ISP 处理宽度 | 是 |
| height | uint32_t | 32 | 2160 | - | ISP 处理高度 | 是 |

#### isp_ichn_attr_t —— ISP 输入通道属性

用于 `hbn_vnode_set_ichn_attr`（HB_ISP）：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| input_crop_cfg | crop_cfg_t | - | - | 不裁剪 | 输入裁剪配置，见下 | 否 |
| in_buf_noclean | uint32_t | 0 | 1 | - | 输入 buffer 是否做 cache clean | 否 |
| in_buf_noncached | uint32_t | 0 | 1 | - | 输入 buffer 是否分配为 non-cache 内存 | 否 |

#### crop_cfg_t —— 裁剪配置

用于 `isp_ichn_attr_t` / `isp_ochn_attr_t` 的裁剪字段：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| rect | image_rect_t | - | - | - | 裁剪矩形，见下 | 否 |
| enable | HB_BOOL | 0 | 1 | 0 | 是否使能裁剪 | 否 |

#### image_rect_t —— 矩形

`crop_cfg_t` 的 `rect` 成员：

| 名称 | 类型 | 含义 |
| --- | --- | --- |
| x | uint32_t | 起点 x 坐标 |
| y | uint32_t | 起点 y 坐标 |
| width | uint32_t | 矩形宽度 |
| height | uint32_t | 矩形高度 |

#### isp_ochn_attr_t —— ISP 输出通道属性

用于 `hbn_vnode_set_ochn_attr`（HB_ISP）：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| stream_output_mode | isp_stream_output_mode_e | 0 | 1 | 0 | online（OTF）直通输出开关：STREAM_OUTPUT_MODE_ENABLE（1）/ STREAM_OUTPUT_MODE_DISABLE（0） | 是 |
| axi_output_mode | isp_axi_output_mode_e | 0 | 21 | 0 | 写 DDR 的输出格式：DISABLE（0）、RGB888（1）、RAW8/10/12/16/24（2\~6）、YUV444/422/420（7\~9）、IR8（10）、YUV 与 RAW 组合输出（11\~17）、YUV420/422 的 10_8_8 与 12_8_8（18\~21） | 是 |
| output_crop_cfg | crop_cfg_t | - | - | - | 输出裁剪配置，见 crop_cfg_t | 是 |
| out_buf_noinvalid | uint32_t | 0 | 1 | 0 | 输出 buffer 是否做 cache invalid | 否 |
| out_buf_noncached | uint32_t | 0 | 1 | 0 | 输出 buffer 是否分配为 non-cache 内存 | 否 |
| buf_num | uint32_t | 3 | 16 | - | 分配输出 buffer 的个数 | 是 |

### YNR

#### ynr_init_attr —— YNR 初始化属性

用于 YNR 节点（HB_YNR）的属性配置。YNR 只支持 online 方式，输入与 ISP 直连、输出与 PYM 直连：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| work_mode | uint32_t | 1 | 2 | - | 工作模式：1 = Manual（online 连接，前级模块为 sw trigger）；2 = 单路 Online（与前级硬件直连） | 是 |
| slot_id | uint32_t | 0 | 7 | - | YNR 硬件通道 id，与 ISP 直连时需与 ISP 的 slot_id 一致 | 是 |
| width | uint32_t | 32 | 2048 | - | YNR 处理宽度 | 是 |
| height | uint32_t | 32 | 2048 | - | YNR 处理高度 | 是 |
| nr_static_switch | uint32_t | - | - | - | 噪声抑制开关组合：(nr3d_en \<\< 1) \| nr2d_en | - |
| in_stride | uint32_t | - | - | - | Y 与 UV 的输入 stride | 是 |
| nr2d_en | uint32_t | 0 | 1 | - | 2D NR 使能 | 是 |
| nr3d_en | uint32_t | 0 | 1 | - | 3D NR 使能 | 是 |
| dma_output_en | uint32_t | 0 | 1 | - | DMA 输出使能；使能 3D NR 时需要使能 DMA 输出 | 是 |
| debug_en | uint32_t | 0 | 1 | - | debug 调试开关 | 否 |

#### hobot_ynr_channel_input_config —— YNR 通道输入配置

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| ch_img_width | uint32_t | 32 | 4096 | - | YNR 输入宽度 | 是 |
| ch_img_height | uint32_t | 32 | 2160 | - | YNR 输入高度 | 是 |

#### hobot_ynr_channel_output_config —— YNR 通道输出配置

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| ch_nr3d_pix_out_dma_byps | uint32_t | 32 | 4096 | - | 3D NR 像素输出 DMA 旁路，建议配置为 0 | 是 |
| ch_nr3d_debug_en | uint32_t | 0 | 1 | - | debug 开关，建议配置为 0 | 是 |

### PYM

#### roi_box_t —— 单个 ds 图层配置

`chn_ctrl_t` 的 `ds_roi_info[]` 数组元素，描述一个图层的 ROI 截取与缩放输出：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| start_top | uint32_t | - | - | - | 从原始图像中截取 ROI 的 Y 轴位置，ds 层需 ≤ region_height，bl 层需 ≤ bl_base_height | 是 |
| start_left | uint32_t | - | - | - | 从原始图像中截取 ROI 的 X 轴位置，约束同 start_top | 是 |
| region_width | uint32_t | - | - | - | 截取 ROI 的宽度 | 是 |
| region_height | uint32_t | - | - | - | 截取 ROI 的高度 | 是 |
| wstride_uv | uint32_t | - | - | - | 输出 UV 层 stride | 是 |
| wstride_y | uint32_t | - | - | - | 输出 Y 层 stride | 是 |
| vstride | uint32_t | - | - | out_height | 高度 stride，隐藏参数，不建议配置 | 是 |
| step_v | uint32_t | - | - | (1\<\<16)\*(out_height-region_height)/out_height | 垂直缩放步进，默认按 ROI 与输出尺寸自动计算 | 否 |
| step_h | uint32_t | - | - | (1\<\<16)\*(out_width-region_width)/out_width | 水平缩放步进，默认按 ROI 与输出尺寸自动计算 | 否 |
| out_width | uint32_t | - | - | - | 输出图像的宽度 | 是 |
| out_height | uint32_t | - | - | - | 输出图像的高度 | 是 |
| phase_y_v | uint32_t | - | - | 0 | 垂直缩放初始相位 | 否 |
| phase_y_h | uint32_t | - | - | 0 | 水平缩放初始相位 | 否 |

#### chn_ctrl_t —— PYM 通道控制

`pym_cfg_t` 的 `chn_ctrl` 成员，设置输入输出格式与图层配置。ds 层共 6 层（MAX_DS_NUM = 6）：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| pixel_num_before_sol | uint32_t | - | - | 2 | SOL 前的像素个数 | 是 |
| invalid_head_lines | uint32_t | - | - | - | 无效头行数 | 否 |
| src_in_width | uint32_t | 32 | 4096 | - | 输入宽度，2 对齐 | 是 |
| src_in_height | uint32_t | 32 | 4096 | - | 输入高度，2 对齐 | 是 |
| src_in_stride_y | uint32_t | src_in_width | 4096 | - | 输入 Y plane stride，16 对齐 | 是 |
| src_in_stride_uv | uint32_t | src_in_width | 4096 | - | 输入 UV stride，16 对齐 | 是 |
| suffix_hb_val | uint32_t | 16 | 152 | 100 | 水平消隐（后缀） | 是 |
| prefix_hb_val | uint32_t | 0 | 2 | 2 | 水平消隐（前缀） | 是 |
| suffix_vb_val | uint32_t | 0 | 20 | 10 | 垂直消隐（后缀） | 是 |
| prefix_vb_val | uint32_t | 0 | 2 | 0 | 垂直消隐（前缀） | 是 |
| bl_max_layer_en | uint8_t | ds_roi_layer | - | 5 | 使能的 bl 层数，选择 bl 层时配置 | 是 |
| ds_roi_en | uint8_t | - | \< (1\<\<6) | - | ds 层输出使能，共 6 层，按 bit 位使能 | 是 |
| ds_roi_uv_bypass | uint8_t | - | \< (1\<\<6) | - | ds 层 UV plane 输出 bypass，按 bit 位使能 | 否 |
| ds_roi_sel[MAX_DS_NUM] | uint8_t | - | \< 3 | - | 图层选择：0 = src 层，1 = bl 层 | 是 |
| ds_roi_layer[MAX_DS_NUM] | uint8_t | - | - | - | 参与缩放的图层序号，ds_roi_sel = 0 时只能为 0 | 是 |
| ds_roi_info[MAX_DS_NUM] | roi_box_t | - | - | - | 各 ds 图层配置，见上 | 是 |

#### pym_cfg_t —— PYM 节点属性

用于 `hbn_vnode_set_attr`（vnode 类型 `HB_PYM`）：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| hw_id | uint8_t | - | - | - | PYM 硬件模块 id，取值 0、1、4 | 是 |
| pym_mode | uint8_t | 1 | 3 | - | 工作模式：PYM_MANUAL_MODE（1，online 连接，前级为 sw trigger）、PYM_OTF_MODE（2，与 VIN/ISP 硬件直连）、PYM_M2M_MODE（3，离线模式，输入/输出 YUV420SP） | 是 |
| slot_id | uint8_t | 0 | 7 | - | PYM 硬件通道 id，与 ISP 直连时需与 ISP 的 slot_id 一致 | 否 |
| out_buf_noinvalid | uint8_t | 0 | 1 | 1 | 输出 buf 内部是否执行 invalid cache 操作 | 是 |
| out_buf_noncached | uint8_t | 0 | 1 | - | 输出 buf 是否使能 non-cache 内存分配 | 否 |
| in_buf_noclean | uint8_t | 0 | 1 | 1 | 输入 buf 是否做 cache clean | 是 |
| in_buf_noncached | uint8_t | 0 | 1 | - | 输入 buf（一般回灌 buf）是否使能 non-cache 内存分配 | 否 |
| buf_consecutive | uint8_t | 0 | 1 | - | 内存是否连续 | 否 |
| pingpong_ring | uint8_t | 0 | 1 | - | 是否开启乒乓 buffer | 否 |
| output_buf_num | uint32_t | 0 | 64 | - | 输出 buf 数目；离线模式时回灌 buf 按该数目分配 | 是 |
| timeout | uint32_t | - | 10000 | - | 超时时间 | 否 |
| threshold_time | uint32_t | - | - | - | 阈值时间 | 否 |
| layer_num_trans_next | int32_t | - | \< 6 | -1 | 传输到后级模块的层数 | 是 |
| layer_num_share_prev | int32_t | - | \< 6 | -1 | 与前级模块共享的层数 | 是 |
| chn_ctrl | chn_ctrl_t | - | - | - | 输入输出格式与图层配置，见上 | 是 |
| fb_buf_num | uint32_t | - | 16 | 2 | 回灌 buffer 个数 | 是 |
| reserved[6] | uint32_t | - | - | - | 保留字段 | 否 |
| magicNumber | uint32_t | - | - | - | 属性结构体校验值，固定填 MAGIC_NUM | 是 |

### GDC

#### gdc_cfg_t —— GDC 节点属性

用于 `hbn_vnode_set_attr`（vnode 类型 `HB_GDC`）。GDC 只支持 offline（回灌）方式：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| input_width | uint32_t | 96 | 3840 | - | 输入图像宽度，2 对齐 | 是 |
| input_height | uint32_t | 96 | 2160 | - | 输入图像高度，2 对齐 | 是 |
| output_width | uint32_t | 96 | 3840 | - | 输出图像宽度 | 是 |
| output_height | uint32_t | 96 | 2160 | - | 输出图像高度 | 是 |
| buf_num | uint32_t | 0 | 32 | 6 | 正常输入 buf 数量 | 是 |
| fb_buf_num | uint32_t | 0 | 32 | 2 | 回灌 buf 数量 | 是 |
| in_buf_noclean | uint32_t | 0 | 1 | 1 | 输入 buf 是否做 cache clean | 否 |
| in_buf_noncached | uint32_t | 0 | 1 | - | 输入 buf（一般回灌 buf）是否使能 non-cache 内存分配 | 否 |
| out_buf_noinvalid | uint32_t | 0 | 1 | 1 | 输出 buf 内部是否执行 invalid cache 操作 | 否 |
| out_buf_noncached | uint32_t | 0 | 1 | - | 输出 buf 是否使能 non-cache 内存分配 | 否 |
| gdc_pipeline | uint32_t | - | - | - | 管线配置 | 否 |

### STITCH

#### stitch_base_attr —— STITCH 基本属性

STITCH 节点的基础配置：

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| mode | uint32_t | 0 | 2 | - | 工作模式：0 = 外部 buffer 回灌、1 = 内部 buffer 回灌、2 = flow 绑定 | 否 |
| roi_nums | uint32_t | 1 | 12 | - | ROI 区域个数 | 是 |
| img_nums | uint32_t | 1 | - | - | 输入图像的数量 | 是 |
| alpha_lut | lut_attr | - | - | - | alpha 查找表，见下 | 否 |
| beta_lut | lut_attr | - | - | - | beta 查找表，见下 | 否 |
| blending | blending_attr | - | - | - | 融合属性，见下 | 是 |

#### lut_attr —— 查找表

STITCH 的 alpha / beta 查找表，lut buffer 需通过 hbmem 申请：

| 名称 | 类型 | 含义 | 必选 |
| --- | --- | --- | --- |
| share_id | int32_t | hbmem buffer 的 share id | - |
| vaddr | uint64_t | lut 虚拟地址 | 否 |
| offset | uint64_t | 偏移 | 否 |
| size | uint64_t | 大小 | 否 |

#### blending_attr —— 融合属性

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| roi_index | uint32_t | - | - | - | ROI 索引 | 是 |
| blending_mode | uint32_t | 0 | 5 | - | 融合模式：ONLINE（0）、ALPHA（1）、ALPHA_BETA（2）、SRC（3，src copy）、ALPHA_SRC（5） | 是 |
| direct | uint32_t | 0 | 3 | - | 融合方向：LT（0，左上）、RB（1，右下）、LB（2，左下）、RT（3，右上） | 是 |
| uv_en | uint32_t | 0 | 1 | - | 输入图像是否包含 UV | 是 |
| src0_index | uint32_t | - | - | - | src0 对应的输入源索引 | 是 |
| src1_index | uint32_t | - | - | - | src1 对应的输入源索引 | 是 |
| margin | uint32_t | - | - | - | 融合边距，可不配置 | 否 |
| margin_inv | uint32_t | - | - | - | 融合边距倒数，可不配置 | 否 |
| gain_src0_yuv | uint32_t | - | - | 256 | src0 增益，固定 256（0:Y 1:U 2:V） | 是 |
| gain_src1_yuv | uint32_t | - | - | 256 | src1 增益，固定 256（0:Y 1:U 2:V） | 是 |

#### roi_info —— ROI 区域描述

`stitch_ch_attr` 的 `rois[]` 数组元素：

| 名称 | 类型 | 含义 | 必选 |
| --- | --- | --- | --- |
| roi_index | uint32_t | ROI 索引 | 是 |
| roi_x | uint32_t | 起始 x 坐标 | 是 |
| roi_y | uint32_t | 起始 y 坐标 | 是 |
| roi_w | uint32_t | 宽度 | 是 |
| roi_h | uint32_t | 高度 | 是 |

#### stitch_ch_attr —— STITCH 通道属性

| 名称 | 类型 | 含义 | 必选 |
| --- | --- | --- | --- |
| width | uint32_t | 输入或输出宽 | 是 |
| height | uint32_t | 输入或输出高 | 是 |
| stride[MAX_STH_FRAME_PLAN] | uint32_t | 各 plane 的 stride | 是 |
| rois[MAX_STH_ROI_NUMS] | struct roi_info | ROI 区域描述，见上 | 是 |


## 返回值说明

| 错误码 | 宏定义                           | 描述                                         |
|--------|----------------------------------|----------------------------------------------|
| 0      | HBN_STATUS_SUCESS                | 成功                                         |
| 1      | HBN_STATUS_INVALID_NODE          | vnode 无效，找不到对应的 vnode                 |
| 2      | HBN_STATUS_INVALID_NODETYPE      | vnode 类型无效，找不到对应的 vnode             |
| 3      | HBN_STATUS_INVALID_HWID          | 无效的硬件模块 id                             |
| 4      | HBN_STATUS_INVALID_CTXID         | 无效的 context id                             |
| 5      | HBN_STATUS_INVALID_OCHNID        | 无效的输出通道 id                             |
| 6      | HBN_STATUS_INVALID_ICHNID        | 无效的输入通道 id                             |
| 7      | HBN_STATUS_INVALID_FORMAT        | 无效的格式                                   |
| 8      | HBN_STATUS_INVALID_NULL_PTR      | 空指针                                       |
| 9      | HBN_STATUS_INVALID_PARAMETER     | 无效的参数，版本检查失败                     |
| 10     | HBN_STATUS_ILLEGAL_ATTR          | 无效的参数                                   |
| 11     | HBN_STATUS_INVALID_FLOW          | 无效的 flow，找不到对应的 flow                 |
| 12     | HBN_STATUS_FLOW_EXIST            | flow 已经存在                                 |
| 13     | HBN_STATUS_FLOW_UNEXIST          | flow 不存在                                   |
| 14     | HBN_STATUS_NODE_EXIST            | node 已经存在                                 |
| 15     | HBN_STATUS_NODE_UNEXIST          | node 不存在                                   |
| 16     | HBN_STATUS_NOT_CONFIG            | 预留                                         |
| 17     | HBN_STATUS_CHN_NOT_ENABLED       | 通道未使能                                   |
| 18     | HBN_STATUS_CHN_ALREADY_ENABLED   | 通道已使能                                   |
| 19     | HBN_STATUS_ALREADY_BINDED        | node 已经绑定                                 |
| 20     | HBN_STATUS_NOT_BINDED            | node 未绑定                                   |
| 21     | HBN_STATUS_TIMEOUT               | 超时                                         |
| 22     | HBN_STATUS_NOT_INITIALIZED       | 未初始化                                     |
| 23     | HBN_STATUS_NOT_SUPPORT           | 通道不支持或未激活                           |
| 24     | HBN_STATUS_NOT_PERM              | 操作不允许                                   |
| 25     | HBN_STATUS_NOMEM                 | 内存不足                                     |
| 26     | HBN_STATUS_INVALID_VNODE_FD      | 无效的 node 文件描述符                         |
| 27     | HBN_STATUS_INVALID_ICHNID_FD     | 无效的输入通道文件描述符                     |
| 28     | HBN_STATUS_INVALID_OCHNID_FD     | 无效的输出通道文件描述符                     |
| 29     | HBN_STATUS_OPEN_OCHN_FAIL        | 打开输出通道失败                             |
| 30     | HBN_STATUS_OPEN_ICHN_FAIL        | 打开输入通道失败                             |
| 31     | HBN_STATUS_JSON_PARSE_FAIL       | json 解析失败                                 |
| 32     | HBN_STATUS_REQ_BUF_FAIL          | 请求 buffer 失败                               |
| 33     | HBN_STATUS_QUERY_BUF_FAIL        | 查询 buffer 信息失败                           |
| 34     | HBN_STATUS_SET_CONTROL_FAIL      | 模块控制、调节 参数（如 ISP 效果参数）设置失败 |
| 35     | HBN_STATUS_GET_CONTROL_FAIL      | 模块控制、调节 参数（如 ISP 效果参数）获取失败 |
| 36     | HBN_STATUS_NODE_START_FAIL       | node 开启失败                                 |
| 37     | HBN_STATUS_NODE_STOP_FAIL        | node 停止失败                                 |
| 38     | HBN_STATUS_NODE_POLL_ERROR       | node 通道 poll 错误                             |
| 39     | HBN_STATUS_NODE_POLL_TIMEOUT     | node 通道 poll 超时                             |
| 40     | HBN_STATUS_NODE_POLL_FRAME_DROP  | node 通道 poll 时发生丢帧                       |
| 41     | HBN_STATUS_NODE_POLL_HUP         | node 通道 poll 时描述符挂起                     |
| 42     | HBN_STATUS_NODE_ILLEGAL_EVENT    | node 通道 poll 时事件非法                       |
| 43     | HBN_STATUS_NODE_DEQUE_ERROR      | node 通道 dequeue buffer 错误                   |
| 44     | HBN_STATUS_ILLEGAL_BUF_INDEX     | 无效的 buffer 索引                             |
| 45     | HBN_STATUS_NODE_QUE_ERROR        | node 通道 queue buffer 错误                     |
| 46     | HBN_STATUS_FLUSH_FRAME_ERROR     | node 通道帧 flush 错误                          |
| 47     | HBN_STATUS_INIT_BIND_ERROR       | 用 json 解析并绑定时发生错误                   |
| 48     | HBN_STATUS_ADD_NODE_FAIL         | 向 flow 中添加 node 失败                         |
| 49     | HBN_STATUS_WRONG_CONFIG_ID       | 系统不支持的 node id                          |
| 50     | HBN_STATUS_BIND_NODE_FAIL        | flow 绑定 node 时发生错误                       |
| 51     | HBN_STATUS_INVALID_VERSION       | 底层驱动模块和上层 库版本号不匹配错误        |
| 52     | HBN_STATUS_GET_VERSION_ERROR     | 获取底层驱动模块版本号错误                   |
| 53     | HBN_STATUS_MEM_INIT_FAIL         | hbmem 内存初始化失败                          |
| 54     | HBN_STATUS_MEM_IMPORT_FAIL       | hbmem 内存引入失败                            |
| 55     | HBN_STATUS_MEM_FREE_FAIL         | hbmem 内存释放失败                            |
| 56     | HBN_STATUS_SYSFS_OPEN_FAIL       | 系统文件打开失败                             |
| 57     | HBN_STATUS_STRUCT_SIZE_NOT_MATCH | hal 层结构体大小与 kernel 层不匹配              |
| 58     | HBN_STATUS_RGN_UNEXIST           | 获取不到对应的 rgn 数据                        |
| 59     | HBN_STATUS_RGN_INVALID_OPERATION | rgn 操作无效                                  |
| 60     | HBN_STATUS_RGN_OPEN_FILE_FAIL    | rgn 模块打开文件失败                          |
| 128    | HBN_STATUS_ERR_UNKNOW            | 未知错误                                     |

## 相关文档

- [VIO API](/Simple_API/multimedia_api/cdev/vio_api)
- [共享内存 - Hbmem](/Advanced_development/multimedia_development/multimedia_api/hbmem_api)
- [视频采集](/Demos/multimedia_demo/cdev/vio_capture)
