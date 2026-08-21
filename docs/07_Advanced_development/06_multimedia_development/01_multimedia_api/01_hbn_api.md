---
sidebar_position: 1
title: "基础框架 - HBN"
description: "RDK S100/S600 多媒体基础框架 HBN API"
---

# 基础框架 - HBN

> **层级说明**：本篇是【底层多媒体 API】（板端 `hbn_vpf_interface.h`），HBN vnode 抽象层 API，是 Camera 之后各模块（VIN/ISP/PYM/GDC）的统一节点接口。面向需要直接操作多媒体 pipeline 的进阶开发（模式 3）；若只需跑通采集/编解码/显示的封装功能，见第 4 章 [简易 API](/Simple_API/multimedia_api/cdev/vio_api)（模式 1）。


## 概述

在软件上，Camera 是单独一套 API，Camera 之后的模块用 vnode 来抽象，vnode 抽象的模块包括 VIN、ISP、PYM、GDC。
多个 vnode 组成一条 vflow（类似于一条 pipeline）。Camera 和 VIN 通过 attach 接口绑定起来。
用户只需要调用 HBN 接口完成模块的初始化和绑定，vflow 建立并启动后，用户无须关心数据帧的传递，SDK 内部会将数据帧由上游传递到下游。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/28afb7cb9d1a5de6c889657a0e548e82.jpg" alt="HBN Vflow/Vnode 架构图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

一个 vflow 由一个或多个 vnode 组成，一个 vnode 有一个输入通道，一个或多个输出通道。

接口调用示例：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/492ed46bde119b791326f621b9f5b064.png" alt="HBN API 接口调用示例流程图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## 软件抽象

HBN 用 vnode 抽象 Camera 之后的硬件模块（VIN、ISP、PYM、GDC），每个 vnode 对应一个硬件模块；多个 vnode 组成一条 vflow（类 pipeline）。Camera 与 VIN 通过 attach 接口绑定。vflow 建立并启动后，数据帧由 SDK 内部从上游传递到下游，用户无须手动传帧。

## vnode 连接方式

### 输出通道

一个 vnode 有一个输入通道、一个或多个输出通道，输出通道 id 见各模块通道说明。

### 连接方式

通过 `hbn_vflow_bind_vnode` 将上游 vnode 的输出通道绑定到下游 vnode 的输入通道，组成 vflow。

### 参数配置

模块基本属性以 `模块名_attr_t`、扩展属性以 `模块名_attr_ex_t`、通道属性以 `模块名_ochn_attr_t`/`_ichn_attr_t` 结尾的结构体传入。

## API 列表

| 函数 | 说明 |
| --- | --- |
| hbn_vnode_open | 打开模块设备节点，返回 vnode handle |
| hbn_vnode_close | 关闭模块设备节点 |
| hbn_vnode_set_attr / get_attr | 设置/获取模块基本属性 |
| hbn_vnode_set_attr_ex / get_attr_ex | 设置/获取模块扩展属性（运行中可动态设置） |
| hbn_vnode_set_ochn_attr / get_ochn_attr | 设置/获取输出通道属性 |
| hbn_vnode_set_ochn_attr_ex | 设置输出通道扩展属性 |
| hbn_vnode_set_ichn_attr / get_ichn_attr | 设置/获取输入通道属性 |
| hbn_vnode_set_ochn_buf_attr | 设置输出通道 buffer 属性 |
| hbn_vnode_start / stop | 启动/停止模块 |
| hbn_vnode_getframe / releaseframe | 获取/释放输出通道图像（单层） |
| hbn_vnode_getframe_group / releaseframe_group | 获取/释放多层聚合图像（ISP、PYM 输出用） |
| hbn_vnode_sendframe / sendframe_async | 向输入通道发送图像（同步/异步） |
| hbn_vflow_create / destroy | 创建/销毁 vflow |
| hbn_vflow_add_vnode | 将 vnode 加入 vflow |
| hbn_vflow_bind_vnode | 绑定上下游 vnode 通道 |

| hbn_vnode_set_attr_s | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_get_attr_s | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_set_attr_ex_s | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_get_attr_ex_s | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_set_ochn_attr_s | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_set_ochn_attr_ex_s | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_get_ochn_attr_s | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_set_ichn_attr_s | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_set_ichn_attr_ex_s | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_get_ichn_attr_s | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_enable_ichn | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_disable_ichn | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_enable_ochn | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_disable_ochn | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_reset | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_get_fd | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_getframe_cond | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_getframe_group_cond | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_sendframe_async | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vflow_create_cfg | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vflow_del_vnode | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vflow_pause | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vflow_resume | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vflow_get_version | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_set_output_frame | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_set_output_groupframe | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_sendframe_group | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_get_output_groupframe | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_get_output_frame | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vflow_get_fd | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_set_ctrl | 板端扩展（见 hbn_vpf_interface.h） |
| hbn_vnode_get_ctrl | 板端扩展（见 hbn_vpf_interface.h） |
## API 调用流程

### 创建流程

1. `hbn_vnode_open` 打开各模块，获取 vnode handle。
2. `hbn_vnode_set_attr` / `set_ochn_attr` / `set_ichn_attr` 配置模块与通道属性。
3. `hbn_vflow_create` 创建 vflow，`hbn_vflow_add_vnode` 加入各 vnode，`hbn_vflow_bind_vnode` 绑定上下游通道。
4. `hbn_vnode_start` 启动各模块，vflow 开始流转数据帧。
5. `hbn_vnode_getframe` / `getframe_group` 获取输出图像，处理完 `releaseframe` / `releaseframe_group` 归还。

### 销毁流程

1. `hbn_vnode_stop` 停止各模块。
2. `hbn_vflow_destroy` 销毁 vflow（已串入 vflow 的 vnode 无须再单独 `hbn_vnode_close`；独立使用的模块如 GDC 回灌需单独 close）。

## API 接口说明

### hbn_vnode_open

【函数声明】

hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id, int32_t
ctx_id, hbn_vnode_handle_t *vnode_fd)

【参数描述】

[IN] hb_vnode_type
vnode_type：vnode 类型，每个硬件模块对应一个 vnode 类型。取值为 HB_VIN、HB_ISP、HB_PYM 等；

[IN] uint32_t hw_id：模块的硬件 id。

[IN] uint32_t ctx_id：模块的 context id，软件上的概念，可指定 context
id 值，也可设置为 AUTO_ALLOC_ID，由 SDK 自动分配 context id；

[OUT] hbn_vnode_handle_t *vnode_fd：返回模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明。

【功能描述】

初始化某个模块，打开该模块设备节点，返回该模块的 vnode handle。

【注意事项】

无

### hbn_vnode_close

【函数声明】

hobot_status hbn_vnode_close(hbn_vnode_handle_t vnode_fd)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

关闭模块的设备节点。

【注意事项】

调用了 hbn_vflow_destroy 就无须再调用 hbn_vnode_close。

模块单独使用时（例如只是 GDC 回灌）可调用 hbn_vnode_close，模块串在 vflow 中，调用 hbn_vflow_destroy 即可，无须调用 hbn_vnode_close。

### hbn_vnode_set_attr

【函数声明】

hobot_status hbn_vnode_set_attr(hbn_vnode_handle_t vnode_fd, void *attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] void
*attr：模块的基本属性结构体指针。基本属性结构体可以是 vin_attr_t、isp_attr_t、pym_attr_t 等，以模块名+_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的基本属性。

【注意事项】

无

### hbn_vnode_get_attr

【函数声明】

hobot_status hbn_vnode_get_attr(hbn_vnode_handle_t vnode_fd, void *attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[OUT] void
*attr：模块的基本属性结构体指针。基本属性结构体可以是 vin_attr_t、isp_attr_t、pym_attr_t 等，以模块名+_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块的基本属性。

【注意事项】

无

### hbn_vnode_set_attr_ex

【函数声明】

hobot_status hbn_vnode_set_attr_ex(hbn_vnode_handle_t vnode_fd, void *attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] void
*attr：模块的扩展属性结构体指针。扩展属性结构体可以是 vin_attr_ex_t 等，以模块名+_attr_ex_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的扩展属性，可在应用运行中动态设置。

【注意事项】

无

### hbn_vnode_get_attr_ex

【函数声明】

hobot_status hbn_vnode_get_attr_ex(hbn_vnode_handle_t vnode_fd, void *attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[OUT] void
*attr：模块的扩展属性结构体指针。扩展属性结构体可以是 vin_attr_ex_t 等，以模块名+_attr_ex_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块的扩展属性。

【注意事项】

无

### hbn_vnode_set_ochn_attr

【函数声明】

hobot_status hbn_vnode_set_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, void *attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；；

[IN] void
*attr：模块的输出通道属性结构体指针。输出通道属性可以是 vin_ochn_attr_t、isp_ochn_attr_t 等，以模块名+_ochn_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的输出通道属性。

【注意事项】

无

### hbn_vnode_get_ochn_attr

【函数声明】

hobot_status hbn_vnode_get_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, void *attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[OUT] void
*attr：模块输出通道属性结构体指针。输出通道属性可以是 vin_ochn_attr_t、isp_ochn_attr_t 等，以模块名+_ochn_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块的输出通道属性。

【注意事项】

无

### hbn_vnode_set_ochn_attr_ex

【函数声明】

hobot_status hbn_vnode_set_ochn_attr_ex(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, void *attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[IN] void
*attr：模块的输出通道扩展属性结构体指针。输出通道扩展属性可以是 pym_ochn_attr_ex_t 等，以模块名+_ochn_attr_ex_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的输出通道扩展属性，可在应用运行中动态设置。

【注意事项】

无

### hbn_vnode_set_ichn_attr

【函数声明】

hobot_status hbn_vnode_set_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ichn_id, void *attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ichn_id：模块的输入通道 id，通道 id 见模块通道说明；

[IN] void
*attr：模块的输入通道属性结构体指针。输入通道属性可以是 vin_ichn_attr_t、isp_ichn_attr_t 等，以模块名+_ichn_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的输入通道属性。

【注意事项】

无

### hbn_vnode_get_ichn_attr

【函数声明】

hobot_status hbn_vnode_get_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ichn_id, void *attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ichn_id：模块的输入通道 id，通道 id 见模块通道说明；

[OUT] void
*attr：模块的输入通道属性结构体指针。输入通道属性可以是 vin_ichn_attr_t、isp_ichn_attr_t 等，以模块名+_ichn_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块的输入通道属性。

【注意事项】

无

### hbn_vnode_set_ochn_buf_attr

【函数声明】

hobot_status hbn_vnode_set_ochn_buf_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, hbn_buf_alloc_attr_t *alloc_attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[IN] hbn_buf_alloc_attr_t *alloc_attr：buffer 分配属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置输出通道 buffer 属性。

【注意事项】

无

### hbn_vnode_start

【函数声明】

hobot_status hbn_vnode_start(hbn_vnode_handle_t vnode_fd)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

模块启动。

【注意事项】

启动前需要先打开模块。

### hbn_vnode_stop

【函数声明】

hobot_status hbn_vnode_stop(hbn_vnode_handle_t vnode_fd)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

模块停止。

【注意事项】

无

### hbn_vnode_getframe

【函数声明】

hobot_status hbn_vnode_getframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
uint32_t millisecondTimeout, hbn_vnode_image_t *out_img)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[IN] uint32_t millisecondTimeout：超时等待时间；

[OUT] hbn_vnode_image_t *out_img：输出图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块输出通道的图像，阻塞型接口。

【注意事项】

无

### hbn_vnode_releaseframe

【函数声明】

hobot_status hbn_vnode_releaseframe(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, hbn_vnode_image_t *img)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[IN] hbn_vnode_image_t *img：图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

释放图像 buffer，buffer 会归还到指定的输出通道。

【注意事项】

无

### hbn_vnode_getframe_group

【函数声明】

hobot_status hbn_vnode_getframe_group(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, uint32_t millisecondTimeout,hbn_vnode_image_group_t *out_img);

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[IN] uint32_t millisecondTimeout：超时等待时间；

[OUT] hbn_vnode_image_group_t *out_img：输出图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块输出通道的多层聚合图像，阻塞型接口。

【注意事项】

ISP 和 PYM 输出图像需要调用该接口获取

### hbn_vnode_releaseframe_group

【函数声明】

hobot_status hbn_vnode_releaseframe_group(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, hbn_vnode_image_group_t*img)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[IN] hbn_vnode_image_group_t *img_group：多层聚合图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

释放多层聚合图像 buffer，buffer 会归还到指定的输出通道。

【注意事项】

无

### hbn_vnode_sendframe

【函数声明】

hobot_status hbn_vnode_sendframe(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
hbn_vnode_image_t *img)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ichn_id：模块的输入通道 id，通道 id 见模块通道说明；

[IN] hbn_vnode_image_t *img：输入图像 buffer 地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

发送图像到模块的输入通道，会触发模块进行处理。阻塞型接口，等待硬件处理完再返回，默认超时时间为1秒。

【注意事项】

无

### hbn_vflow_create

【函数声明】

hobot_status hbn_vflow_create(hbn_vflow_handle_t *vflow_fd)

【参数描述】

[OUT] hbn_vflow_handle_t *vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

创建一个 vflow，返回 vflow handle。

【注意事项】

无

### hbn_vflow_destroy

【函数声明】

hobot_status hbn_vflow_destroy(hbn_vflow_handle_t vflow_fd)

【参数描述】

[IN] hbn_vflow_handle_t vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

根据 vflow handle，销毁一个 vflow。

【注意事项】

无

### hbn_vflow_add_vnode

【函数声明】

hobot_status hbn_vflow_add_vnode(hbn_vflow_handle_t vflow_fd, hbn_vnode_handle_t
vnode_fd)

【参数描述】

[IN] hbn_vflow_handle_t vflow_fd：vflow handle；

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

把模块添加到 vflow 里面，用 vflow 管理起来。

【注意事项】

无

### hbn_vflow_bind_vnode

【函数声明】

hobot_status hbn_vflow_bind_vnode(hbn_vflow_handle_t vflow_fd,
hbn_vnode_handle_t src_vnode_fd, uint32_t out_chn, hbn_vnode_handle_t
dst_vnode_fd, uint32_t in_chn)

【参数描述】

[IN] hbn_vflow_handle_t vflow_fd：vflow handle；

[IN] hbn_vnode_handle_t src_vnode_fd：源模块的 vnode handle；

[IN] uint32_t out_chn：源模块的输出通道 id，通道 id 见模块通道说明；

[IN] hbn_vnode_handle_t dst_vnode_fd：目的模块的 vnode handle；

[IN] uint32_t in_chn：目的模块的输入通道 id，通道 id 见模块通道说明；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

把两个模块绑定到一起。绑定后 src_vnode_fd 模块的数据帧会自动流向 dst_vnode_fd 模块。

【注意事项】

flow 需要创建，模块需要 open。

### hbn_vflow_unbind_vnode

【函数声明】

hobot_status hbn_vflow_unbind_vnode(hbn_vflow_handle_t vflow_fd,
hbn_vnode_handle_t src_vnode_fd, uint32_t out_chn, hbn_vnode_handle_t
dst_vnode_fd, uint32_t in_chn)

【参数描述】

[IN] hbn_vflow_handle_t vflow_fd：vflow handle；

[IN] hbn_vnode_handle_t src_vnode_fd：源模块的 vnode handle；

[IN] uint32_t out_chn：源模块的输出通道 id，通道 id 见模块通道说明；

[IN] hbn_vnode_handle_t dst_vnode_fd：目的模块的 vnode handle；

[IN] uint32_t in_chn：目的模块的输入通道 id，通道 id 见模块通道说明；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

解绑 src_vnode_fd 和 dst_vnode_fd 模块。

【注意事项】

暂不支持。

### hbn_vflow_start

【函数声明】

hobot_status hbn_vflow_start(hbn_vflow_handle_t vflow_fd)

【参数描述】

[IN] hbn_vflow_handle_t vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

启动一条 vflow。vflow 里包含的 vnode 都会启动。

【注意事项】

模块 vnode 需要事先添加到 vflow 中。

### hbn_vflow_stop

【函数声明】

hobot_status hbn_vflow_stop(hbn_vflow_handle_t vflow_fd)

【参数描述】

[IN] hbn_vflow_handle_t vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

停止一条 vflow。vflow 里包含的 vnode 都会停止。

【注意事项】

和 hbn_vflow_start 成对使用。

### hbn_vflow_get_vnode_handle

【函数声明】

hbn_vnode_handle_t hbn_vflow_get_vnode_handle(hbn_vflow_handle_t vflow_fd,
hb_vnode_type vnode_type, uint32_t index)

【参数描述】

[IN] hbn_vflow_handle_t vflow_fd：vflow handle；

[IN] hb_vnode_type vnode_type：模块 id；

[IN] uint32_t index：context id，范围为[0, 7]

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

通过模块 id 和 context id 获取 vnode handle。

【注意事项】

模块需要事先 open。

## 板端扩展函数

以下函数取自板端 `hbn_vpf_interface.h`（无 doxygen，仅签名），与上方基础集组成完整 HBN vnode/vflow API：

### hbn_vnode_set_attr_s

【函数声明】

```c
hobot_status hbn_vnode_set_attr_s(hbn_vnode_handle_t vnode_fd, void *attr, size_t size);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_get_attr_s

【函数声明】

```c
hobot_status hbn_vnode_get_attr_s(hbn_vnode_handle_t vnode_fd, void *attr, size_t size);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_set_attr_ex_s

【函数声明】

```c
hobot_status hbn_vnode_set_attr_ex_s(hbn_vnode_handle_t vnode_fd, void *attr, size_t size);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_get_attr_ex_s

【函数声明】

```c
hobot_status hbn_vnode_get_attr_ex_s(hbn_vnode_handle_t vnode_fd, void *attr, size_t size);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_set_ochn_attr_s

【函数声明】

```c
hobot_status hbn_vnode_set_ochn_attr_s(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr, size_t size);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_set_ochn_attr_ex_s

【函数声明】

```c
hobot_status hbn_vnode_set_ochn_attr_ex_s(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr, size_t size);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_get_ochn_attr_s

【函数声明】

```c
hobot_status hbn_vnode_get_ochn_attr_s(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr, size_t size);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_set_ichn_attr_s

【函数声明】

```c
hobot_status hbn_vnode_set_ichn_attr_s(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, void *attr, size_t size);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_set_ichn_attr_ex_s

【函数声明】

```c
hobot_status hbn_vnode_set_ichn_attr_ex_s(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr, size_t size);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_get_ichn_attr_s

【函数声明】

```c
hobot_status hbn_vnode_get_ichn_attr_s(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, void *attr, size_t size);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_enable_ichn

【函数声明】

```c
hobot_status hbn_vnode_enable_ichn(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_disable_ichn

【函数声明】

```c
hobot_status hbn_vnode_disable_ichn(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_enable_ochn

【函数声明】

```c
hobot_status hbn_vnode_enable_ochn(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_disable_ochn

【函数声明】

```c
hobot_status hbn_vnode_disable_ochn(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_reset

【函数声明】

```c
hobot_status hbn_vnode_reset(hbn_vnode_handle_t vnode_fd);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_get_fd

【函数声明】

```c
hobot_status hbn_vnode_get_fd(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, int32_t *fd);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_getframe_cond

【函数声明】

```c
hobot_status hbn_vnode_getframe_cond(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, uint32_t millisecondTimeout, int32_t cond_time, hbn_vnode_image_t *out_img); // block function;
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_getframe_group_cond

【函数声明】

```c
hobot_status hbn_vnode_getframe_group_cond(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, uint32_t millisecondTimeout, int32_t cond_time, hbn_vnode_image_group_t *out_img); // block function;
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_sendframe_async

【函数声明】

```c
hobot_status hbn_vnode_sendframe_async(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, hbn_vnode_image_t *img); // no block function
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vflow_create_cfg

【函数声明】

```c
hobot_status hbn_vflow_create_cfg(const char *cfg_file, hbn_vflow_handle_t *vflow_fd);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vflow_del_vnode

【函数声明】

```c
hobot_status hbn_vflow_del_vnode(hbn_vflow_handle_t vflow_fd, hbn_vnode_handle_t vnode_fd);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vflow_pause

【函数声明】

```c
hobot_status hbn_vflow_pause(hbn_vflow_handle_t vflow_fd);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vflow_resume

【函数声明】

```c
hobot_status hbn_vflow_resume(hbn_vflow_handle_t vflow_fd);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vflow_get_version

【函数声明】

```c
hobot_status hbn_vflow_get_version(hbn_version_t *version);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_set_output_frame

【函数声明】

```c
hobot_status hbn_vnode_set_output_frame(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_t *img);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_set_output_groupframe

【函数声明】

```c
hobot_status hbn_vnode_set_output_groupframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_group_t *img_group);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_sendframe_group

【函数声明】

```c
hobot_status hbn_vnode_sendframe_group(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, hbn_vnode_image_group_t *img_group);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_get_output_groupframe

【函数声明】

```c
hobot_status hbn_vnode_get_output_groupframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_group_t *img_group);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_get_output_frame

【函数声明】

```c
hobot_status hbn_vnode_get_output_frame(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_t *img);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vflow_get_fd

【函数声明】

```c
hobot_status hbn_vflow_get_fd(hbn_vflow_handle_t *vflow_fd);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_set_ctrl

【函数声明】

```c
hobot_status hbn_vnode_set_ctrl(hbn_vnode_handle_t vnode_fd, vpf_ext_ctrl_t *ext_ctrl);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。

### hbn_vnode_get_ctrl

【函数声明】

```c
hobot_status hbn_vnode_get_ctrl(hbn_vnode_handle_t vnode_fd, vpf_ext_ctrl_t *ext_ctrl);
```

【功能描述】

见板端 `hbn_vpf_interface.h`（无 doxygen，签名取自头文件）。


## 参数说明

**公共**

hbn_vnode_image_t

| 名称     | 类型                 | 含义         | 最大值 | 最小值 | 默认值 | 是否必选 |
|----------|----------------------|--------------|--------|--------|--------|----------|
| info     | hbn_frame_info_t     | 图像信息结构 | \-     | \-     | \-     | \-       |
| buffer   | hb_mem_graphic_buf_t | 图像内存信息 | \-     | \-     | \-     | \-       |
| metadata | void *              | meta 数据     | \-     | \-     | \-     | \-       |

hbn_frame_info_t

| 名称        | 类型           | 含义                 | 最大值 | 最小值 | 默认值 | 是否必选 |
|-------------|----------------|----------------------|--------|--------|--------|----------|
| frame_id    | uint32_t       | 帧号                 | \-     | \-     | \-     | \-       |
| timestamps  | uint64_t       | 系统时间             | \-     | \-     | \-     | \-       |
| tv          | struct timeval | 硬件时间戳           | \-     | \-     | \-     | \-       |
| trig_tv     | struct timeval | 外部触发的硬件时间戳 | \-     | \-     | \-     | \-       |
| bufferindex | int32_t        | buffer 索引           | \-     | \-     | \-     | \-       |

hb_mem_graphic_buf_t

| 名称                            | 类型       | 含义                   | 最大值 | 最小值 | 默认值 | 是否必选 |
|---------------------------------|------------|------------------------|--------|--------|--------|----------|
| fd[MAX_GRAPHIC_BUF_COMP]        | int32_t    | 文件描述符             | \-     | \-     | \-     | \-       |
| plane_cnt                       | int32_t    | plane 个数              | \-     | \-     | \-     | \-       |
| format                          | int32_t    | 图像格式               | \-     | \-     | \-     | \-       |
| width                           | int32_t    | 宽度                   | \-     | \-     | \-     | \-       |
| height                          | int32_t    | 高度                   | \-     | \-     | \-     | \-       |
| stride                          | int32_t    | 宽度 stride             | \-     | \-     | \-     | \-       |
| vstride                         | int32_t    | 高度 stride             | \-     | \-     | \-     | \-       |
| is_contig                       | int32_t    | buffer 物理地址是否连续 | \-     | \-     | \-     | \-       |
| share_id[MAX_GRAPHIC_BUF_COMP]  | int32_t    | 共享 id                 | \-     | \-     | \-     | \-       |
| flags                           | int64_t    | 标识                   | \-     | \-     | \-     | \-       |
| size[MAX_GRAPHIC_BUF_COMP]      | uint64_t   | buffer size            | \-     | \-     | \-     | \-       |
| virt_addr[MAX_GRAPHIC_BUF_COMP] | uint8_t * | 虚拟地址               | \-     | \-     | \-     | \-       |
| phys_addr[MAX_GRAPHIC_BUF_COMP] | uint64_t   | 物理地址               | \-     | \-     | \-     | \-       |
| offset[MAX_GRAPHIC_BUF_COMP]    | uint64_t   | 内存偏移               | \-     | \-     | \-     | \-       |

hbn_vnode_image_group_t

| 名称      | 类型                       | 含义              | 最大值 | 最小值 | 默认值 | 是否必选 |
|-----------|----------------------------|-------------------|--------|--------|--------|----------|
| info      | hbn_frame_info_t           | 图像信息结构      | \-     | \-     | \-     | \-       |
| buf_group | hb_mem_graphic_buf_group_t | group 图像内存信息 | \-     | \-     | \-     | \-       |
| metadata  | void *                    | meta 数据          | \-     | \-     | \-     | \-       |

hb_mem_graphic_buf_group_t

| 名称                                   | 类型                 | 含义                           | 最大值 | 最小值 | 默认值 | 是否必选 |
|----------------------------------------|----------------------|--------------------------------|--------|--------|--------|----------|
| graph_group[HB_MEM_MAXIMUM_GRAPH_BUF]; | hb_mem_graphic_buf_t | 图像内存信息                   | \-     | \-     | \-     | \-       |
| group_id                               | int32_t              | group id 号                     | \-     | \-     | \-     | \-       |
| bit_map                                | uint32_t             | 用 bit 标识 graph_group 中可用的层 | \-     | \-     | \-     | \-       |

**VIN**

vin_attr_t

| 名称          | 类型            | 含义                                  | 最大值 | 最小值 | 默认值 | 是否必选 |
|---------------|-----------------|---------------------------------------|--------|--------|--------|----------|
| vin_node_attr | vin_node_attr_t | vin node 节点属性结构                  | \-     | \-     | \-     | 是       |
| magicNumber   | uint32_t        | 属性结构体校验值，需要填写为 MAGIC_NUM | \-     | \-     | \-     | 是       |

vin_node_attr_t

| 名称        | 类型        | 含义                                  | 最大值 | 最小值 | 默认值 | 是否必选 |
|-------------|-------------|---------------------------------------|--------|--------|--------|----------|
| cim_attr    | cim_attr_t  | cim 参数                               | \-     | \-     | \-     | 是       |
| lpwm_attr   | lpwm_attr_t | lpwm 参数                              | \-     | \-     | \-     | 否       |
| vcon_attr   | vcon_attr_t | vcon 参数                              | \-     | \-     | \-     | 否       |
| magicNumber | uint32_t    | 属性结构体校验值，需要填写为 MAGIC_NUM | \-     | \-     | \-     | 是       |

cim_attr_t

| 名称          | 类型     | 含义                       | 最大值 | 最小值 | 默认值 | 是否必选 |
|---------------|----------|----------------------------|--------|--------|--------|----------|
| mipi_en       | uint32_t | 是否使能 mipi 输入           | 1      | 0      | \-     | 是       |
| mipi_rx       | uint32_t | mipi rx 索引，可选值为0,1,4 | 4      | 0      | \-     | 是       |
| vc_index      | uint32_t | cim ipi 索引                | 3      | 0      | \-     | 是       |
| cim_pym_flyby | uint32_t | 是否使能 cim pym 硬件直连    | 1      | 0      | \-     | 是       |
| cim_isp_flyby | uint32_t | 是否使能 cim isp 硬件直连    | 1      | 0      | \-     | 是       |

vin_ichn_attr_t

| 名称   | 类型     | 含义                              | 最大值 | 最小值 | 默认值 | 是否必选 |
|--------|----------|-----------------------------------|--------|--------|--------|----------|
| format | uint32_t | mipi 输入图像格式，例 raw12对应0x2c | 0x27   | 0x1E   | \-     | 是       |
| width  | uint32_t | mipi 输入图像宽                    | 4096   | 32     | \-     | 是       |
| height | uint32_t | mipi 输入图像高                    | 2160   | 32     | \-     | 是       |

vin_ochn_attr_t

| 名称           | 类型                  | 含义                                                                                                           | 最大值 | 最小值 | 默认值 | 是否必选 |
|----------------|-----------------------|----------------------------------------------------------------------------------------------------------------|--------|--------|--------|----------|
| ddr_en         | uint32_t              | 是否使能 cim ddr 输出                                                                                            | 1      | 0      | \-     | 否       |
| roi_en         | uint32_t              | 是否使能 cim roi 通道输出                                                                                        | 1      | 0      | \-     | 否       |
| emb_en         | uint32_t              | 是否使能 cim emb 通道输出                                                                                        | 1      | 0      | \-     | 否       |
| rawds_en       | uint32_t              | 是否使能 raw scaler                                                                                             | 1      | 0      | \-     | 否       |
| pingpong_ring  | uint32_t              | 是否使能乒乓 buffer                                                                                             | 1      | 0      | \-     | 否       |
| ochn_attr_type | vin_ochn_attr_type_e  | 输出通道类型： VIN_MAIN_FRAME 主数据通路 VIN_ONLINE online 输出通路 VIN_EMB embeded 数据通路 VIN_ROI roi 数据通路 | \-     | \-     | \-     | 是       |
| vin_basic_attr | vin_basic_attr_t      | vin 基础属性                                                                                                    | \-     | \-     | \-     | 是       |
| rawds_attr     | vin_rawds_attr_t      | vin raw scaler 属性                                                                                             | \-     | \-     | \-     | 否       |
| roi_attr       | struct vin_roi_attr_s | vin roi 属性                                                                                                   | \-     | \-     | \-     | 否       |
| emb_attr       | vin_emb_attr_t        | vin embeded 属性                                                                                                | \-     | \-     | \-     | 否       |
| magicNumber    | uint32_t              | 属性结构体校验值，需要填写为固定值 MAGIC_NUM                                                                    | \-     | \-     | \-     | 是       |

vin_basic_attr_t

| 名称      | 类型     | 含义                          | 最大值 | 最小值 | 默认值 | 是否必选 |
|-----------|----------|-------------------------------|--------|--------|--------|----------|
| pack_mode | uint32_t | pack 使能，不配置默认 pack      | 1      | 0      | 1      | 否       |
| wstride   | uint32_t | 输出宽 stride，置0内部自动计算 | 1      | 0      | 1      | 否       |
| vstride   | uint32_t | 输出高 stride，置0内部自动计算 | 1      | 0      | 1      | 否       |
| format    | uint32_t | 输出图像格式，例 raw12对应0x2c | 0x27   | 0x1E   | \-     | 是       |

**ISP**

isp_attr_t

| 名称        | 类型            | 含义                                                                                                                                 | 最大值 | 最小值 | 默认值 | 是否必选 |
|-------------|-----------------|--------------------------------------------------------------------------------------------------------------------------------------|--------|--------|--------|----------|
| channel     | isp_channel_t   | isp 通道属性                                                                                                                          | \-     | \-     | \-     | 是       |
| sched_mode  | sched_mode_e    | isp 调度模式 1 SCHED_MODE_MANUAL manual 模式 2 SCHED_MODE_PASS_THRU 全 online 模式                                                       | 2      | 1      | \-     | 是       |
| work_mode   | isp_work_mode_e | isp 工作模式 0 ISP_WORK_MODE_NOMAL 普通模式 1 ISP_WORK_MODE_TPG isp 输出 testpattern 模式 2 ISP_WORK_MODE_CIM_TPG cim 输出 testpattern 模式 | 2      | 0      | \-     | 否       |
| hdr_mode    | hdr_mode_e      | isp hdr 模式使能                                                                                                                      | 1      | 0      | \-     | 否       |
| size        | image_size_t    | isp 处理尺寸                                                                                                                          | \-     | \-     | \-     | 否       |
| frame_rate  | uint32_t        | isp 帧率                                                                                                                              | 120    | 1      | \-     | 否       |
| isp_combine | isp_combine_t   | isp 主从模式                                                                                                                          | \-     | \-     | \-     | 否       |
| algo_state  | uint32_t        | 2A 算法使能                                                                                                                           | 1      | 0      | \-     | 否       |

isp_channel_t

| 名称    | 类型     | 含义                                                         | 最大值 | 最小值 | 默认值 | 是否必选 |
|---------|----------|--------------------------------------------------------------|--------|--------|--------|----------|
| hw_id   | uint32_t | isp 硬件 id                                                    | 1      | 0      | -     | 是       |
| slot_id | uint32_t | isp 内部硬件通道 online 输入时配置0\~3，offline 输入时配置4\~11 | 11     | 0      | 0      | 是       |

image_size_t

| 名称   | 类型     | 含义        | 最大值 | 最小值 | 默认值 | 是否必选 |
|--------|----------|-------------|--------|--------|--------|----------|
| width  | uint32_t | isp 处理宽度 | 4096   | 32     | -     | 是       |
| height | uint32_t | isp 处理高度 | 2160   | 32     | -     | 是       |

isp_ichn_attr_t

| 名称               | 类型         | 含义                              | 最大值 | 最小值 | 默认值 | 是否必选 |
| -------------------- | -------------- | ----------------------------------- | -------- | -------- | -------- | ---------- |
| input_crop_cfg   | crop_cfg_t | 输入裁剪配置                      | -      | -      | -      | 否       |
| in_buf_noclean   | uint32_t    | 输入 buffer 是否做 cache clean       | 1      | 0      | -      | 否       |
| in_buf_noncached | uint32_t    | 输入 buffer 是否分配为 non cache 内存 | 1      | 0      | -      | 否       |

crop_cfg_t

| 名称   | 类型           | 含义         | 最大值 | 最小值 | 默认值 | 是否必选 |
| -------- | ---------------- | -------------- | -------- | -------- | -------- | ---------- |
| rect   | image_rect_t | 输入裁剪尺寸 | -      | -      | -      | 否       |
| enable | HB_BOOL       | 是否是能 crop | 1      | 0      | -      | 否       |

image_rect_t

| 名称   | 类型      | 含义     | 最大值 | 最小值 | 默认值 | 是否必选 |
| -------- | ----------- | ---------- | -------- | -------- | -------- | ---------- |
| x      | uint32_t | x 坐标    | -      | -      | -      | 否       |
| y      | uint32_t | y 坐标    | -      | -      | -      | 否       |
| width  | uint32_t | rect 宽度 | -      | -      | -      | 否       |
| height | uint32_t | rect 高度 | -      | -      | -      | 否       |

isp_ochn_attr_t

| 名称                 | 类型                          | 含义                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 最大值 | 最小值 | 默认值 | 是否必选 |
| ---------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------- | -------- | ---------- |
| stream_output_mode | isp_stream_output_mode_e | 是否 otf 输出：1-enable0-disable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 1      | 0      | 0      | 是       |
| axi_output_mode    | isp_axi_output_mode_e     | ddr 输出类型：AXI_OUTPUT_MODE_DISABLE = 0, | 14     | 0      | 0      | 是       |
|||AXI_OUTPUT_MODE_RGB888 = 1,|||||
|||AXI_OUTPUT_MODE_RAW8 = 2,
|||AXI_OUTPUT_MODE_RAW10 = 3,
|||AXI_OUTPUT_MODE_RAW12 = 4,
|||AXI_OUTPUT_MODE_RAW16 = 5,
|||AXI_OUTPUT_MODE_RAW24 = 6,
|||AXI_OUTPUT_MODE_YUV444 = 7,
|||AXI_OUTPUT_MODE_YUV422 = 8, /* yuv422 */
|||AXI_OUTPUT_MODE_YUV420 = 9, /* yuv420 */
|||AXI_OUTPUT_MODE_IR8 = 10,
|||AXI_OUTPUT_MODE_YUV420_RAW12 = 11,/* yuv420 & raw12*/
|||AXI_OUTPUT_MODE_YUV422_RAW12 = 12,/* yuv422 & raw12 */
|||AXI_OUTPUT_MODE_YUV420_RAW16 = 13, /* yuv420 & raw16 */
|||AXI_OUTPUT_MODE_YUV422_RAW16 = 14, /* yuv422 & raw16 */
| output_crop_cfg    | crop_cfg_t                  | 输出裁剪配置                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | -      | -      | -      | 是       |
| out_buf_noinvalid  | uint32_t                     | 输出 buffer 是否做 cacha invalid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 1      | 0      | 0      | 否       |
| out_buf_noncached  | uint32_t                     | 输出 buffer 是否分配为 non cached                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 1      | 0      | 0      | 否       |
| buf_num             | uint32_t                     | 分配输出 buffer 的个数                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 16     | 3      | 0      | 是       |



**YNR**

ynr_init_attr

| 名称            | 类型          | 含义               | 最大值 | 最小值 | 默认值 | 是否必选 |
|-----------------|---------------|--------------------|--------|--------|--------|----------|
| work_mode       | uint32_t      | ynr 工作模式        | 2      | 1      | \-     | 是       |
|                 |               | 1：Manual 模式      |        |        |        |          |
|                 |               | ，online 链接，     |        |        |        |          |
|                 |               | 前级模块是 sw       |        |        |        |          |
|                 |               | trigger;           |        |        |        |          |
|                 |               | 2：单路 Online      |        |        |        |          |
|                 |               | （前级 PYM 硬件      |        |        |        |          |
|                 |               | 直连）模式；       |        |        |        |          |
| slot_id         | uint32_t      | ynr 硬件通道 id      | 7      | 0      | \-     | 是       |
| width           | uint32_t      | ynr 处理宽度        | 2048   | 32     |        | 是       |
| height          | uint32_t      | ynr 处理高度        | 2048   | 32     |        | 是       |
| nr_static_switch| uint32_t      | nr3den\<\<1\|nr2d_en |        |        |        |          |
| in_stride       | uint32_t      | y stride 和 uv stride|        |        |        | 是       |
| nr2d_en         | uint32_t      | 2dnr 使能           | 1      | 0      |        | 是       |
| nr3d_en         | uint32_t      | 3dnr 使能           | 1      | 0      |        | 是       |
| dma_output_en   | uint32_t      | dma 输出使能        | 1      | 0      |        | 是       |
|                 |               | 如果使能3dnr，需   |        |        |        |          |
|                 |               | 要使能 dma 输出      |        |        |        |          |
| debug_en        | uint32_t      | 是否打开 debug 调试  | 1      | 0      |        | 否       |

hobot_ynr_channel_input_config

 |名称              |类型        |含义          |最大值  | 最小值  | 默认值  | 是否必选  |
 |----------------- |----------- |------------- |--------| --------| --------| ----------|
 |ch_img_width    |uint32_t   |ynr 输入宽度   |4096    | 32      | \-      | 是        |
 |ch_img_height   |uint32_t   |ynr 输入高度   |2160    | 32      | \-      | 是        |

hobot_ynr_channel_output_config

  |名称                           | 类型       | 含义                    | 最大值  | 最小值  | 默认值  | 是否必选  |
  |-------------------------------| -----------| ------------------------| --------| --------| --------| ----------|
  |ch_nr3d_pix_out_dma_byps  | uint32_t  | dma 输出数，建议配置为0  | 4096    | 32      | \-      | 是        |
  |ch_nr3d_debug_en            | uint32_t  | debug 开关，建议配置为0  | 1       | 0       | \-      | 是        |


**PYM**

roi_box_t

| 名称          | 类型     | 含义                          | 最大值                                                                                                   | 最小值                                                                     | 默认值                                                   | 是否必选 |
|---------------|----------|-------------------------------|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|----------------------------------------------------------|----------|
| start_top     | uint32_t | 从原始图像中截取图像的 Y 轴位置 | ds 层：\<= region_height bl 层：\<= bl_base_height bl_base_height = region_width \>\> (ds_roi_layer + 1) | ds 层：\>= region_height - out_height bl 层：\>= bl_base_height - out_height | \-                                                       | 是       |
| start_left    | uint32_t | 从原始图像中截取图像的 X 轴位置 | ds 层：\<= region_width bl 层：\<= bl_base_width bl_base_width = region_width \>\> (ds_roi_layer + 1)      | ds 层：\>= region_width - out_width bl 层：\>= bl_base_width - out_width     | \-                                                       | 是       |
| region_width  | uint32_t | 截取图像的宽度                | \-                                                                                                       | \-                                                                         | \-                                                       | 是       |
| region_height | uint32_t | 截取图像的高度                | \-                                                                                                       | \-                                                                         | \-                                                       | 是       |
| wstride_uv    | uint32_t | 输出的 uv 层 stride              |                                                                                                          |                                                                            | \-                                                       | 是       |
| wstride_y     | uint32_t | 输出的 y 层 stride               | \-                                                                                                       | \-                                                                         | \-                                                       | 是       |
| vstride       | uint32_t | 高度 stride，隐藏参数，不建议配置                 | \-                                                                                                       | \-                                                                         | out_height                                               | 是       |
| step_v        | uint32_t |                               | \-                                                                                                       | \-                                                                         | (1 \<\< 16) * (out_height - region_height) / out_height | 否       |
| step_h        | uint32_t |                               | \-                                                                                                       | \-                                                                         | (1 \<\< 16) * (out_width - region_width) / out_width    | 否·      |
| out_width     | uint32_t | 输出图像的宽度                | \-                                                                                                       | \-                                                                         | \-                                                       | 是       |
| out_height    | uint32_t | 输出图像的高度                | \-                                                                                                       | \-                                                                         | \-                                                       | 是       |
| phase_y_v     | uint32_t |                               |                                                                                                          |                                                                            | 0                                                        | 否       |
| phase_y_h     | uint32_t |                               |                                                                                                          |                                                                            | 0                                                        | 否       |

chn_ctrl_t

| 名称                     | 类型      | 含义                                    | 最大值                    | 最小值                | 默认值 | 是否必选 |
|--------------------------|-----------|-----------------------------------------|---------------------------|-----------------------|--------|----------|
| pixel_num_before_sol     | uint32_t  |                                         | \-                        | \-                    | 2      | 是       |
| invalid_head_lines       | uint32_t  |                                         | \-                        | \-                    | \-     | 否       |
| src_in_width             | uint32_t  | 输入宽度，且2对齐                       | \< 4096                   | \> 32                 | \-     | 是       |
| src_in_height            | uint32_t  | 输入高度，且2对齐                       | \< 4096                   | \> 32                 | \-     | 是       |
| src_in_stride_y          | uint32_t  | 输入 y plane stride, 且16对齐            | \< 4096                   | \> src_in_width       | \-     | 是       |
| src_in_stride_uv         | uint32_t  | 输入 uv stride，且16对齐                 | \< 4096                   | \> src_in_width       | \-     | 是       |
| suffix_hb_val            | uint32_t  |                                         | \<= 152                   | \>= 16                | 100    | 是       |
| prefix_hb_val            | uint32_t  |                                         | \<= 2                     | \>= 0                 | 2      | 是       |
| suffix_vb_val            | uint32_t  |                                         | \<= 20                    | \>= 0                 | 10     | 是       |
| prefix_vb_val            | uint32_t  |                                         | \<= 2                     | \>= 0                 | 0      | 是       |
| bl_max_layer_en          | uint8_t   | 选择 bl 层时，使能 bl 层数                  |                           | \> ds_roi_layer[chn]  | 5      | 是       |
| ds_roi_en                | uint8_t   | ds 层输出使能，总共6层，按 bit 位使能      | \< (1 \<\< 6)             | \-                    | \-     | 是       |
| ds_roi_uv_bypass         | uint8_t   | ds 层 uv plane 输出 bypass 使能，按 bit 位使能 | \< (1 \<\< 6)             | \-                    | \-     | 否       |
| ds_roi_sel[MAX_DS_NUM]   | uint8_t   | 图层选择，0 src 层；1 bl 层               | \< 3                      | \-                    | \-     | 是       |
| ds_roi_layer[MAX_DS_NUM] | uint8_t   |                                         | ds_roi_sel = 0时, 只能为0 | \-                    | \-     | 是       |
| ds_roi_info[MAX_DS_NUM]  | roi_box_t | ds 层配置                                | \-                        | \-                    | \-     | 是       |

pym_cfg_t

| 名称                 | 类型       | 含义                                                                                                                                                 | 最大值    | 最小值 | 默认值 | 是否必选 |
|----------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|--------|--------|----------|
| hw_id                | uint8_t    | pym 硬件模块 id (0, 1 , 4)                                                                                                                            | \-        | \-     | \-     | 是       |
| pym_mode             | uint8_t    | pym 工作模式 *1*：Manual 模式，online 链接，前级模块是 sw trigger； 2：单路 Online（前级-PYM 硬件直连）模式； 3：离线模式（输入:YUV420SP，输出:YUV420SP） | \<= 3     | \>= 1  | \-     | 是       |
| slot_id              | uint8_t    | pym 硬件通道 id                                                                                                                                       | 7         | 0      | \-     | 否       |
| out_buf_noinvalid    | uint8_t    | 模块输出 buf 内部是否会执行 invaild cache 操作                                                                                                           | 1         | 0      | 1      | 是       |
| out_buf_noncached    | uint8_t    | 模块输出 buf 是否使能 non-cache 内存分配                                                                                                                 | 1         | 0      | \-     | 否       |
| in_buf_noclean       | uint8_t    | 输入 buf 是否做 cache clean                                                                                                                             | 1         | 0      | 1      | 是       |
| in_buf_noncached     | uint8_t    | 模块输入 buf（一般回灌 buf）是否使能 non-cache 内存分配                                                                                                  | 1         | 0      | \-     | 否       |
| buf_consecutive      | uint8_t    | 内存是否连续                                                                                                                                         | 1         | 0      | \-     | 否       |
| pingpong_ring        | uint8_t    | 是否开启乒乓 buffer                                                                                                                                   |           |        | \-     | 否       |
| output_buf_num       | uint32_t   | 输出 buf 数目，当 PYM 离线模式时，回灌 buf 数目按照该数目默认分配                                                                                          | \<= 64    | 0      | \-     | 是       |
| timeout              | uint32_t   | 超时时间                                                                                                                                             | \<= 10000 |        | \-     | 否       |
| threshold_time       | uint32_t   |                                                                                                                                                      |           |        | \-     | 否       |
| layer_num_trans_next | int32_t    | 传输到后级模块的层数                                                                                                                                 | \< 6      | \-     | \-1    | 是       |
| layer_num_share_prev | int32_t    |                                                                                                                                                      | \< 6      | \-     | \-1    | 是       |
| chn_ctrl             | chn_ctrl_t | 设置输入输出格式大小                                                                                                                                 |           |        |        |          |
| fb_buf_num           | uint32_t   | 回灌 buffer 个数                                                                                                                                       | \<= 16    | \-     | 2      | 是       |
| reserved[6]          | uint32_t   | 保留位置                                                                                                                                             | \-        | \-     | \-     | 否       |
| magicNumber          | uint32_t   | 属性结构体校验值，需要填写为固定值 MAGIC_NUM                                                                                                          | \-        | \-     | \-     | 是       |

**GDC**

gdc_cfg_t

| 名称              | 类型     | 含义                                                | 最大值   | 最小值 | 默认值 | 是否必选 |
|-------------------|----------|-----------------------------------------------------|----------|--------|--------|----------|
| input_width       | uint32_t | 输入图像宽度, 且2对齐                               | \<= 3840 | \>= 96 | \-     | 是       |
| input_height      | uint32_t | 输入图像高度，且2对齐                               | \<= 2160 | \>= 96 | \-     | 是       |
| output_width      | uint32_t | 输出图像宽度                                        | \<= 3840 | \>= 96 | \-     | 是       |
| output_height     | uint32_t | 输出图像高度                                        | \<= 2160 | \>= 96 | \-     | 是       |
| buf_num           | uint32_t | 正常输入 buf 数量                                     | \<= 32   | 0      | 6      | 是       |
| fb_buf_num        | uint32_t | 回灌 buf 数量                                         | \<= 32   | 0      | 2      | 是       |
| in_buf_noclean    | uint32_t | 输入 buf 是否做 cache clean                            | 1        | 0      | 1      | 否       |
| in_buf_noncached  | uint32_t | 模块输入 buf（一般回灌 buf）是否使能 non-cache 内存分配 | \-       | \-     | \-     | 否       |
| out_buf_noinvalid | uint32_t | 模块输出 buf 内部是否会执行 invaild cache 操作          | \-       | \-     | 1      | 否       |
| out_buf_noncached | uint32_t | 模块输出 buf 是否使能 non-cache 内存分配                | \-       | \-     | \-     | 否       |
| gdc_pipeline      | uint32_t |                                                     | \-       | \-     | \-     | 否       |

**STITCH**

stitch_base_attr

| 名称               | 类型            | 含义                    | 最大值 | 最小值 | 默认值 | 是否必选  |
|--------------------|-----------------|-------------------------|--------|--------|--------|-----------|
| mode               | uint32_t        |工作模式                 |        |        |        | 否        |
|                    |                 | 0-外部 buffer 回灌模式    |        |        |        |           |
|                    |                 | 1-内部 buffer 回灌模式    |        |        |        |           |
|                    |                 | 2-flow 绑定模式          |        |        |        |           |
| roi_nums           | uint32_t        | roi 区域个数             | 12     | 1      |        | 是        |
| img_nums           | uint32_t        | 输入图像的数量          | \-     | 1      |        | 是        |
| alpha_lut          | struct          | alpha lookup table      |        |        |        | 否        |
|                    | lut_attr        |                         |        |        |        |           |
| beta_lut           | struct          | beta lookup table       |        |        |        | 否        |
|                    | lut_attr        |                         |        |        |        |           |
| blending           | struct          | 融合属性                |        |        |        | 是        |
|                    | blending_attr   |                         |        |        |        |           |

lut_attr

| 名称    | 类型    | 含义                      | 最大值 | 最小值 | 默认值 |是否必选 |
|---------|---------|---------------------------|--------|--------|--------|---------|
| share_id| int32_t | hbmem buffer 的 shareid     |        |        |        |         |
|         |         | 存放 lut buffer 需要        |        |        |        |         |
|         |         | 通过 hbmem 申请             |        |        |        |         |
| vaddr   | uint64_t| lut 虚拟地址               |        |        |        | 否      |
| offset  | uint64_t| 偏移                      |        |        |        | 否      |
| size    | uint64_t| 大小                      |        |        |        | 否      |

blending_attr

| 名称           | 类型      | 含义                                                | 最大值 | 最小值 | 默认值 |是否必选 |
|----------------|-----------|-----------------------------------------------------|--------|--------|--------|---------|
| roi_index      | uint32_t  | roi 索引                                             |        |        |        | 是      |
| blending_mode  | uint32_t  | 融合模式：                                          |        |        |        | 是      |
|                |           | BLENDING_MODE_ONLINE = 0, //online mode             |        |        |        |         |
|                |           | BLENDING_MODE_ALPHA = 1, //alpha mode               |        |        |        |         |
|                |           | BLENDING_MODE_ALPH = 2, //alpha beda mode           |        |        |        |         |
|                |           | BLENDING_MODE_SRC = 3, //src copy mode              |        |        |        |         |
|                |           | BLENDING_MODE_ALPHA_SRC = 5 //arpha src0 mode       |        |        |        |         |
| direct         | uint32_t  | 融合方向：                                          |        |        |        | 是      |
|                |           | BLENDING_DIRECT_LT = 0, //left and top direct       |        |        |        |         |
|                |           | BLENDING_DIRECT_RB = 1, //right and bottom direct   |        |        |        |         |
|                |           | BLENDING_DIRECT_LB = 2, //left and bottom direct    |        |        |        |         |
|                |           | BLENDING_DIRECT_RT = 3, //right and top direct      |        |        |        |         |
| uv_en          | uint32_t  | 输入图像是否包含 uv                                  |        |        |        | 是      |
| src0_index     | uint32_t  | src0对应输源                                        |        |        |        | 是      |
| src1_index     | uint32_t  | src1对应输源                                        |        |        |        | 是      |
| margin         | uint32_t  | 可选参数，可不配置                                  |        |        |        | 否      |
| margin_inv     | uint32_t  | 可选参数，可不配置                                  |        |        |        | 否      |
| gain_src0_yuv  | uint32_t  | 固定256 //0:y 1:u 2:v                               |        |        |        | 是      |
| gain_src1_yuv  | uint32_t  | 固定256 //0:y 1:u 2:v                               |        |        |        | 是      |

roi_info

  |名称        | 类型       | 含义       | 最大值   |最小值   |默认值   |是否必选  |
  |------------| -----------| -----------| -------- |-------- |-------- |----------|
  |roi_index   |uint32_t   |roi 索引     |          |         |         |是        |
  |roi_x       |uint32_t   |坐标起始 x   |          |         |         |是        |
  |roi_y       |uint32_t   |坐标起始 y   |          |         |         |是        |
  |roi_w       |uint32_t   |宽度        |          |         |         |是        |
  |roi_h       |uint32_t   |高度        |          |         |         |是        |

stitch_ch_attr

  |名称                            | 类型              | 含义          | 最大值  | 最小值  | 默认值  | 是否必选  |
  |--------------------------------| ------------------| --------------| --------| --------| --------| ----------|
  |width                           | uint32_t         | 输入或输出宽  |         |         |         | 是        |
  |height                          | uint32_t         | 输入或输出高  |         |         |         | 是        |
  |strid\[MAX_STH_FRAME_PLAN\]  | uint32_t         | stride        |         |         |         | 是        |
  |rois\[MAX_STH_ROI_NUMS\]     | struct roi_info  | roi 区域描述   |         |         |         | 是        |


## 通道绑定说明

| 模块 | 输出通道编号 | 通道功能                            |
|------|--------------|-------------------------------------|
| VIN  | 0            | offline 通道，输出 camera 帧到 ddr      |
|      | 1            | online 通道，连接到 isp 或 pym          |
| ISP  | 0            | offline 通道，输出 isp 处理后的帧到 ddr |
|      | 1            | online 通道，连接到 pym or ynr        |
| YNR  | 1            | online 通道，连接到 pym               |
| PYM  | 0            | offline 通道，输出 pym 图像至 ddr       |
| GDC  | 0            | offline 通道，输出 gdc 处理后的帧到 ddr |

online 表示硬件直连，offline 表示输出至 ddr 缓存

## SLOT_ID 与调试模式说明

1. ISP 的 slot_id 参数用来选择 isp 的硬件 context，cim 直连 isp 场景，slot_id 可以选择0\~3，cim-ddr-isp 模式下，slot_id 可以选择为4\~11，不同路需要选择不同的 slot_id；在 isp-online-ynr-online-pym 或者 isp-online-pym 场景下，ynr 与 pym 的 slot_id 需要配置与 isp 的 slot_id 一致。
2. PYM 的 sched_mode 参数用来选择 isp 的调度模式，在 cim-isp 硬件直连的场景下选择2 passthrough 模式，在其他场景下选择1 manual 模式；在 isp-online-ynr-online-pym 或者 isp-online-pym 场景下，ynr 的 work_mode、pym 的 pym_mode 需要和 isp 的 sched_mode 保持一致。

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
