---
sidebar_position: 4
title: "视频输入输出 - VIO"
description: "RDK S100/S600 5.5.1.4 VIO（视频输入输出）"
---

# 视频输入输出 - VIO

> **层级说明**：本篇是【底层多媒体 API】（板端 `hb_vio_interface.h`），高层 pipeline API（X5 VIN → RDK VIO），封装 sensor 采集到 VIN/ISP/PYM/GDC 整条链路的初始化/启停/取帧。面向需要直接操作多媒体 pipeline 的进阶开发（模式 3）；若只需跑通采集/编解码/显示的封装功能，见第 4 章 [简易 API](/Simple_API/multimedia_api/cdev/vio_api)（模式 1）。

## 概述

VIO（Video Input/Output）是 RDK 多媒体的高层 pipeline API（板端 `hb_vio_interface.h`；X5 VIN → RDK VIO）。封装从 sensor 采集到 VIN/ISP/PYM/GDC 整条 pipeline 的初始化、启停、参数配置与帧获取，是 HBN vnode 之上的便捷封装层。

## 软件抽象

- **pipeline**：一条 VIO pipeline 串联 VIN→ISP→PYM/GDC 等阶段，由 `hb_vio_init` 初始化、`hb_vio_start_pipeline` 启动。
- **参数与信息**：`hb_vio_set_param`/`get_param` 配置/查询 pipeline 参数；`hb_vio_get_info` 查询运行信息。
- **帧获取**：`hb_vio_run_pym`/`run_gdc`/`run_raw` 获取各阶段输出；`hb_vio_raw_dump`/`raw_feedback` 用于回灌调试。
- **GDC**：`hb_vio_set_gdc_cfg`/`set_gdc_cfg_opt` 配置畸变矫正参数。

## API 调用流程

1. `hb_vio_init` 用配置文件初始化 pipeline。
2. `hb_vio_set_param` 配置参数（可选），`hb_vio_set_gdc_cfg` 配置 GDC（如需）。
3. `hb_vio_start_pipeline` 启动；运行中可用 `hb_vio_pause_pipeline`/`resume_pipeline`。
4. `hb_vio_run_pym`/`run_gdc`/`run_raw` 获取处理结果，`hb_vio_get_info` 查询状态。
5. `hb_vio_stop_pipeline` 停止。

## 快速示例

以下示例演示 `hb_vio_interface.h` 高层 pipeline API 的最小使用序列（配置文件含 sensor/ISP/PYM 等整条 pipeline 定义）：

```c
#include "hb_vio_interface.h"

// 1. 按配置文件初始化 pipeline（含 CIM/MIPI/ISP/PYM/GDC）
int32_t ret = hb_vio_init("./vio_config.json");
if (ret != 0) {
    /* 初始化失败处理 */
}

// 2. 启动 pipeline
ret = hb_vio_start_pipeline(0);

// 3. 获取 PYM 处理结果，用完释放
hb_vio_buffer_t pym_data;
ret = hb_vio_get_data(0, HB_VIO_PYM_DATA_V3, &pym_data);
/* 使用 pym_data ... */
hb_vio_free_pymbuf(0, HB_VIO_PYM_DATA_V3, &pym_data);

// 4. 停止并反初始化
hb_vio_stop_pipeline(0);
hb_vio_deinit();
```

> 板端 `get_vin_data`/`get_isp_data` 等 sample 使用 HBN vnode 风格（`hbn_vnode_*`）直接搭 pipeline；`hb_vio_*` 是封装在其上的高层接口，配置方式见 `06_multimedia_sample` 章节与板端 `/app/multimedia_samples/` 各 sample 的配置文件。

## API 列表

| 函数 | 说明 |
| --- | --- |
| hb_cam_init | Select the corresponding vin index from the configuration file to initialize the sensor;通过配置文件选择对应 vin index,初始化 sensor |
| hb_cam_deinit | Select the corresponding vin index from the configuration file to de-initialize the sensor;通过配置文件选择对应 vin index,反初始化 sensor; |
| hb_cam_start | Start the sensor data flow of the specified software channel; 启动指定软件通道的sensor数据流 |
| hb_cam_stop | Stop the sensor data flow of the specified software channel; 关闭指定软件通道的sensor数据流 |
| hb_cam_start_all | Not support; 不支持 |
| hb_cam_stop_all | Not support; 不支持 |
| hb_cam_reset | Reset the corresponding port cam; 复位对应port cam |
| hb_cam_power_on | Not support; 不支持 |
| hb_cam_power_off | Not support; 不支持 |
| hb_cam_get_fps | Get the fps parameter in the configuration file of the corresponding port; 获取对应port的配置文件中fps参数 |
| hb_cam_get_img | Not support; 不支持 |
| hb_cam_free_img | Not support; 不支持 |
| hb_cam_clean_img | Not support; 不支持 |
| hb_cam_get_data | Get the cim data of the corresponding port; 获取对应port的cim的数据 |
| hb_cam_free_data | Release the result of hb_cam_get_data of the corresponding port; 释放对应port的hb_cam_get_data 的结果 |
| hb_cam_bypass_enable | bypass corresponding sensor port; bypass 对应的sensor port |
| hb_cam_set_fps_ctrl | Set the frame rate of the corresponding port, and whether to select skip frame; 设置对应port的帧率,是否选择跳帧 |
| hb_cam_set_lpwm_ctrl | Set dynamic lpwm attr value; 动态设置port对应的lpwm 通道的属性值 |
| hb_cam_get_stat_info | Get corresponding sensor port frame information; 获取对应port的帧信息 |
| hb_cam_dynamic_switch_fps | The frame rate switching interface requires the corresponding support of the sensor library; 帧率切换接口,需sensor库对应支持 |
| hb_cam_dynamic_switch_mode | Not support; 不支持 |
| hb_cam_dynamic_switch | Not support; 不支持 |
| hb_cam_set_mclk | Not support; 不支持 |
| hb_cam_enable_mclk | Not support; 不支持 |
| hb_cam_disable_mclk | Not support; 不支持 |
| hb_cam_extern_isp_reset | Not support; 不支持 |
| hb_cam_extern_isp_poweroff | Not support; 不支持 |
| hb_cam_extern_isp_poweron | Not support; 不支持 |
| hb_cam_i2c_read | Access sensor through i2c; 通过i2c访问sensor |
| hb_cam_i2c_read_byte | Not support; 不支持 |
| hb_cam_i2c_write | Write sensor register through i2c; 通过i2c写入sensor寄存器 |
| hb_cam_i2c_write_byte | Not support; 不支持 |
| hb_cam_i2c_block_write | Not support; 不支持 |
| hb_cam_i2c_block_read | Not support; 不支持 |
| hb_cam_spi_block_write | Not support; 不支持 |
| hb_cam_spi_block_read | Not support; 不支持 |
| hb_cam_ipi_reset | Reset the ipi path operation of the specified mipi, which can be used to switch the specified ipi data path; 复位指定mipi的ipi通路操作,可用于开关指定ipi数据通路 |
| hb_cam_get_sns_info | Get sensor information; 获取sensor信息 |
| hb_cam_get_status | Get sensor information; 获取sensor信息 |
| hb_cam_parse_embed_data | parse camera embed data;获取sensor信息曝光参数等 |
| hb_cam_set_event_callback | set event callback function;设置事件回调函数 |
| hb_vio_init | Initialize all pipelines configured in the configuration file according to the incoming configuration file, including isp&amp;pym&amp;gdc, CIM and mipi configurations; 根据传入的配置文件初始化配置文件所配置的所有pipeline,包括 isp &amp; pym &amp; gdc,CIM和mipi配置 |
| hb_vio_deinit | De-initialize all initialized pipelines and release the resources of the initialization request; 对初始化的所有pipeline进行反初始化并释放初始化申请的资源. |
| hb_vio_start_pipeline | Enable corresponding pipeline; 使能对应pipeline |
| hb_vio_stop_pipeline | disable corresponding pipeline; 停止对应pipeline |
| hb_vio_set_event_callback | set event callback function;设置事件回调函数 |
| hb_vio_get_info | Get the parameters of the corresponding pipeline through info_type; 通过info_type获取对应pipeline的参数。 |
| hb_vio_set_callbacks | Not support; 不支持 |
| hb_vio_set_param | Not support; 不支持 |
| hb_vio_get_param | Get the parameters of the corresponding pipeline through info_type; 通过info_type获取对应pipeline的参数。 |
| hb_vio_get_data | Obtain the data of the corresponding pipeline through the corresponding datatype;; 通过对应data_type获取对应pipeline_id的数据; |
| hb_vio_get_data_conditional | Get the data of the corresponding pipelineid conditionally through the corresponding datatype and the set times parameter; 通过对应data_type以及设置的times参数有条件的获取对应pipeline_id的数据; |
| hb_vio_run_pym | Enable pym to process the reinjection data of the corresponding pipeline; 使能pym处理对应pipeline的回灌数据. |
| hb_vio_free_ipubuf | Not support; 不支持 |
| hb_vio_free_ispbuf | Release the isp data corresponding to pipelineid, and hb_vio_get_data is used to obtain the isp data; 释放对应pipeline_id的isp数据,和hb_vio_get_data获取isp数据对应使用. |
| hb_vio_free_pymbuf | Release the pym data corresponding to pipelineid, and hb_vio_get_data is used to obtain the pym data; 释放对应pipeline_id的pym数据,和hb_vio_get_data获取pym数据对应使用. |
| hb_vio_gen_gdc_cfg | Generate the cfg bin file required for the work of the gdc module; 生成gdc模块的工作所需的cfg bin文件 |
| hb_vio_set_gdc_cfg | Set cfg bin of gdc module; 设置gdc模块的cfg bin |
| hb_vio_set_gdc_cfg_opt | Set cfg bin of gdc module; 设置gdc模块的cfg bin |
| hb_vio_free_gdc_cfg | Release the buffer of the production gdc module cfg bin; 释放生产gdc模块cfg bin的buffer |
| hb_vio_run_gdc | Enable gdc corresponding to pipelineid to correct the process distortion of src data; 使能对应pipeline_id的gdc,对src数据进程畸变矫正。 |
| hb_vio_run_gdc_opt | Enable gdc corresponding to pipelineid to correct the process distortion of src data; 使能对应pipeline_id的gdc,对src数据进程畸变矫正。 |
| hb_vio_run_gdc_adv | Enable gdc corresponding to pipelineid to correct the process distortion of src data; 使能对应pipeline_id的gdc,对src数据进程畸变矫正。 |
| hb_vio_run_gdc_adv_user | Enable gdc corresponding to pipelineid to correct the process distortion of src data; 使能对应pipeline_id的gdc,对src数据进程畸变矫正。 |
| hb_vio_free_gdcbuf | Release the gdc data corresponding to pipelineid, and hb_vio_get_data is used to obtain the gdc data; 释放对应pipeline_id的gdc数据,和hb_vio_get_data获取gdc数据对应使用. |
| hb_vio_raw_dump | Not support; 不支持 |
| hb_vio_raw_feedback | Not support; 不支持 |
| hb_vio_run_raw | After the video system is initialized, hb_vio_get_data obtain the isp raw reinjection address and reinjection the external RAW image into the acquired address, enabling isp to process the reinjection data.; 视频系统初始化后,通过hb_vio_get_data获取isp raw 回灌地址并将外部RAW图像回灌到获取的地址中,使能isp 对回灌数据进行处理。 |
| hb_vio_cfg_check | Check whether the vpm&amp;vin configuration file parameters are correct; |
| hb_vio_pause_pipeline | pause the CIM data flow of the specified software channel; 暂停指定软件通道的CIM数据流 |
| hb_vio_resume_pipeline | resume the CIM data flow of the specified software channel; 恢复指定软件通道的CIM数据流 |

## API 接口说明

### hb_cam_init

【函数声明】

```c
int32_t hb_cam_init(uint32_t cfg_index, const char *cfg_file);
```

【功能描述】

Select the corresponding vin index from the configuration file to initialize the sensor;通过配置文件选择对应 vin index,初始化 sensor

【参数描述】

[IN] uint32_t cfg_index: Cfg of vin in configuration file to be initialized index;需要初始化的vin在配置文件中的cfg_index; range:[0, 2147483647],default:0
[IN] const char *cfg_file:Vin profile absolute path;vin 配置文件绝对路径

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_deinit

【函数声明】

```c
int32_t hb_cam_deinit(uint32_t cfg_index);
```

【功能描述】

Select the corresponding vin index from the configuration file to de-initialize the sensor;通过配置文件选择对应 vin index,反初始化 sensor;

【参数描述】

[IN] uint32_t cfg_index: Config index of vin in the configuration file;vin在配置文件中的cfg_index; range:[0, 2147483647],default:0

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_start

【函数声明】

```c
int32_t hb_cam_start(uint32_t port);
```

【功能描述】

Start the sensor data flow of the specified software channel; 启动指定软件通道的sensor数据流

【参数描述】

[IN] uint32_t port: Indicates the sensor, port and corresponding configuration file port that need to be enabled; 表示需要使能的sensor,port和对应配置文件port_*对应;range:[0, 23],default:0

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_stop

【函数声明】

```c
int32_t hb_cam_stop(uint32_t port);
```

【功能描述】

Stop the sensor data flow of the specified software channel; 关闭指定软件通道的sensor数据流

【参数描述】

[IN] uint32_t port: Indicates the sensor, port and corresponding configuration file port that need to be disanabled; 表示需要关闭的sensor,port和对应配置文件port_*对应;range:[0, 23],default:0

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_start_all

【函数声明】

```c
int32_t hb_cam_start_all(void);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] None

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_stop_all

【函数声明】

```c
int32_t hb_cam_stop_all(void);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] None

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_reset

【函数声明】

```c
int32_t hb_cam_reset(uint32_t port);
```

【功能描述】

Reset the corresponding port cam; 复位对应port cam

【参数描述】

[IN] uint32_t port: Cam ports to be reset; 需要复位的cam port;range:[0, 23],default:0

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_power_on

【函数声明】

```c
int32_t hb_cam_power_on(uint32_t port);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_power_off

【函数声明】

```c
int32_t hb_cam_power_off(uint32_t port);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_get_fps

【函数声明】

```c
int32_t hb_cam_get_fps(uint32_t port, uint32_t *fps);
```

【功能描述】

Get the fps parameter in the configuration file of the corresponding port; 获取对应port的配置文件中fps参数

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[OUT] uint32_t *fps:Get the storage address of the frame rate value 取得帧率值的存储地址

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_get_img

【函数声明】

```c
int32_t hb_cam_get_img(cam_img_info_t *cam_img_info);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] cam_img_info_t *cam_img_info: camera image information; camera图像数据

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3; SW: 1.0.0

### hb_cam_free_img

【函数声明】

```c
int32_t hb_cam_free_img(cam_img_info_t *cam_img_info);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] cam_img_info_t *cam_img_info: camera image information; camera图像数据

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3; SW: 1.0.0

### hb_cam_clean_img

【函数声明】

```c
int32_t hb_cam_clean_img(cam_img_info_t *cam_img_info);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] cam_img_info_t *cam_img_info: camera image information; camera图像数据

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3; SW: 1.0.0

### hb_cam_get_data

【函数声明】

```c
int32_t hb_cam_get_data(uint32_t port, CAM_DATA_TYPE_E data_type, void *data);
```

【功能描述】

Get the cim data of the corresponding port; 获取对应port的cim的数据

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file;和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] CAM_DATA_TYPE_E data_type: Set the required info type; data_type parameter description: HB_CAM_RAW_DATA:get cam raw data（raw sensor） HB_CAM_YUV_DATA:get cam yuv data（yuv sensor） HB_CAM_FEEDBACK_RAW_DATA:get feedback raw buff,used by cim feedback
[IN] CAM_DATA_TYPE_E data_type: 设置需要获取的info type; data_type参数说明: HB_CAM_RAW_DATA:获取cam raw 数据（raw sensor） HB_CAM_YUV_DATA:获取cam yuv 数据（yuv sensor） HB_CAM_FEEDBACK_RAW_DATA:获取回灌raw buff,用于cim 回灌
[OUT] void * data:Output the data result of the corresponding type 输出对应type的数据结果

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_free_data

【函数声明】

```c
int32_t hb_cam_free_data(uint32_t port, CAM_DATA_TYPE_E data_type, void *data);
```

【功能描述】

Release the result of hb_cam_get_data of the corresponding port; 释放对应port的hb_cam_get_data 的结果

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] CAM_DATA_TYPE_E data_type: Set the released info type,corresponding to hb_cam_get_data; 设置需要释放的info type,和hb_cam_get_data对应
[IN] void * data:The corresponding data is used with hb_cam_get_data; 对应的数据,和hb_cam_get_data 对应使用

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_bypass_enable

【函数声明】

```c
int32_t hb_cam_bypass_enable(uint32_t port, int32_t enable);
```

【功能描述】

bypass corresponding sensor port; bypass 对应的sensor port

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] int32_t enable[0, 1]:if enable bypass function for this port; 是否使能bypass对应port;range:[0, 1],default:0

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_set_fps_ctrl

【函数声明】

```c
int32_t hb_cam_set_fps_ctrl(uint32_t port, uint32_t skip_frame, uint32_t in_fps, uint32_t out_fps);
```

【功能描述】

Set the frame rate of the corresponding port, and whether to select skip frame; 设置对应port的帧率,是否选择跳帧

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] int32_t skip_frame[0, 1]:if skip frame enable,0-no skip,1-skip; 是否使能跳帧功能,0-不跳帧,1-跳帧;range:[0, 1],default:0
[IN] uint32_t in_fps:sensor input fps; 输入的帧率;range:[1, 480],default:30
[IN] int32_t skip_frame:sensor output fps; 输出的帧率;range:[1, 480],default:30

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_set_lpwm_ctrl

【函数声明】

```c
int32_t hb_cam_set_lpwm_ctrl(uint32_t port, uint32_t lpwn_chn, lpwm_dynamic_t *lpwm_dynamic_attr);
```

【功能描述】

Set dynamic lpwm attr value; 动态设置port对应的lpwm 通道的属性值

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint32_t lpwn_chn:lpwn channel id; port对应的lpwn channel 通道
[IN] lpwm_dynamic_t *lpwm_dynamic_attr; lpwm_dynamic_attr通道属性值

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_get_stat_info

【函数声明】

```c
int32_t hb_cam_get_stat_info(uint32_t port, struct vio_statinfo *info);
```

【功能描述】

Get corresponding sensor port frame information; 获取对应port的帧信息

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[OUT] vio_statinfo *statinfo:address of statinfo;帧信息地址

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: Ultra/X5/Super; SW: 1.0.0

### hb_cam_dynamic_switch_fps

【函数声明】

```c
int32_t hb_cam_dynamic_switch_fps(uint32_t port, uint32_t fps);
```

【功能描述】

The frame rate switching interface requires the corresponding support of the sensor library; 帧率切换接口,需sensor库对应支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint32_t fps:Indicates the frame rate to switch; 表示要切换的帧率range;[1, 480],default:30

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_dynamic_switch_mode

【函数声明】

```c
int32_t hb_cam_dynamic_switch_mode(uint32_t port, uint32_t mode);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint32_t mode: camera work mode; sersor工作模式;range:[0, 100],default:0

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_dynamic_switch

【函数声明】

```c
int32_t hb_cam_dynamic_switch(uint32_t port, uint32_t fps, uint32_t resolution);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint32_t fps:Indicates the frame rate to switch; 表示要切换的帧率range;[1, 480],default:30
[IN] uint32_t resolution:image resolution; 表示要切换的分辨率range;[1, 8294400],default:0

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_set_mclk

【函数声明】

```c
int32_t hb_cam_set_mclk(uint32_t entry_num, uint32_t mclk);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t entry_num:Mipi host index; mipi host索引;range:[0, 3],default:0
[IN] uint32_t mclk:senosr clock; sensor工作时钟;range:[1, 3000000],default:0

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_enable_mclk

【函数声明】

```c
int32_t hb_cam_enable_mclk(uint32_t entry_num);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t entry_num:Mipi host index; mipi host索引;range:[0, 3],default:0

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_disable_mclk

【函数声明】

```c
int32_t hb_cam_disable_mclk(uint32_t entry_num);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t entry_num:Mipi host index; mipi host索引;range:[0, 3],default:0

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_extern_isp_reset

【函数声明】

```c
int32_t hb_cam_extern_isp_reset(uint32_t port);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_extern_isp_poweroff

【函数声明】

```c
int32_t hb_cam_extern_isp_poweroff(uint32_t port);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_extern_isp_poweron

【函数声明】

```c
int32_t hb_cam_extern_isp_poweron(uint32_t port);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_i2c_read

【函数声明】

```c
int32_t hb_cam_i2c_read(uint32_t port, uint32_t reg_addr);
```

【功能描述】

Access sensor through i2c; 通过i2c访问sensor

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint32_t reg_addr:i2c address to access; 表示要读取的寄存器地址

【返回值】

&gt; 0: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_i2c_read_byte

【函数声明】

```c
int32_t hb_cam_i2c_read_byte(uint32_t port, uint32_t reg_addr);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint32_t reg_addr:i2c address to access; 表示要读取的寄存器地址

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_i2c_write

【函数声明】

```c
int32_t hb_cam_i2c_write(uint32_t port, uint32_t reg_addr, uint16_t value);
```

【功能描述】

Write sensor register through i2c; 通过i2c写入sensor寄存器

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint32_t reg_addr:i2c address to access; 表示要写入的寄存器地址
[IN] uint16_t value:Indicates the value written;表示写入的值

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_i2c_write_byte

【函数声明】

```c
int32_t hb_cam_i2c_write_byte(uint32_t port, uint32_t reg_addr, uint8_t value);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint32_t reg_addr:i2c address to access; 表示要写入的寄存器地址
[IN] uint16_t value:Indicates the value written;表示写入的值

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_i2c_block_write

【函数声明】

```c
int32_t hb_cam_i2c_block_write(uint32_t port, uint32_t subdev, uint32_t reg_addr, char *buffer, uint32_t size);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint32_t subdev: device; 写入的设备;0 sensor;1 eeprom,default:0
[IN] uint32_t reg_addr:i2c address to access; 表示要写入的寄存器地址
[IN] char *buffer:address to access; 表示写入的值
[IN] uint32_t size:Indicates the value written;表示写入的大小

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_i2c_block_read

【函数声明】

```c
int32_t hb_cam_i2c_block_read(uint32_t port, uint32_t subdev, uint32_t reg_addr, char *buffer, uint32_t size);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint32_t subdev: device; 写入的设备;0 sensor;1 eeprom,default:0
[IN] uint32_t reg_addr:i2c address to access; 表示要写入的寄存器地址
[IN] uint32_t size:Indicates the value written;表示写入的大小
[OUT] char *buffer:address to access; 表示读取的值

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_spi_block_write

【函数声明】

```c
int32_t hb_cam_spi_block_write(uint32_t port, uint32_t subdev, uint32_t reg_addr, char *buffer, uint32_t size);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint32_t subdev: device; 写入的设备;range:[0, 3000000],default:0
[IN] uint32_t reg_addr:spi address to access; 表示要写入的寄存器地址
[IN] char *buffer:address to access; 表示写入的值
[IN] uint32_t size:Indicates the value written;表示写入的大小

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_spi_block_read

【函数声明】

```c
int32_t hb_cam_spi_block_read(uint32_t port, uint32_t subdev, uint32_t reg_addr, char *buffer, uint32_t size);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint32_t subdev: device; 写入的设备;range:[0, 3000000],default:0
[IN] uint32_t reg_addr:spi address to access; 表示要写入的寄存器地址
[IN] uint32_t size:Indicates the value written;表示写入的大小
[OUT] char *buffer:address to access; 表示读取的值

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_ipi_reset

【函数声明】

```c
int32_t hb_cam_ipi_reset(uint32_t entry_num, uint32_t ipi_index, uint32_t enable);
```

【功能描述】

Reset the ipi path operation of the specified mipi, which can be used to switch the specified ipi data path; 复位指定mipi的ipi通路操作,可用于开关指定ipi数据通路

【参数描述】

[IN] uint32_t entry_num:Mipi host index; mipi host索引;range:[0, 3],default:0
[IN] uint32_t ipi_index:ipi index inside of Mipi host ; mipi host内ipi索引;range:[0, 3],default:0
[IN] uint32_t enable:Ipi switch status: 0-off, 1-on; ipi开关状态: 0-关, 1-开;range:[0, 1],default:0

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_get_sns_info

【函数声明】

```c
int32_t hb_cam_get_sns_info(uint32_t port, cam_parameter_t *sp, uint8_t type);
```

【功能描述】

Get sensor information; 获取sensor信息

【参数描述】

[IN] uint32_t port:Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] uint8_t type:Type of parameter; 参数的类型
[OUT] cam_parameter_t *sp:Gets the address of the parameter;获取的参数的地址

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: Ultra/X5/Super; SW: 1.0.0

### hb_cam_get_status

【函数声明】

```c
int32_t hb_cam_get_status(uint32_t port, struct cam_statinfo *info);
```

【功能描述】

Get sensor information; 获取sensor信息

【参数描述】

[IN] uint32_t port:Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[OUT] camera_staus_t *statinfo:Gets the address of the parameter;获取的参数的地址

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: Ultra/X5/Super; SW: 1.0.0

### hb_cam_parse_embed_data

【函数声明】

```c
int32_t hb_cam_parse_embed_data(uint32_t port, char *embed_raw, struct embed_data_info_s *embed_info);
```

【功能描述】

parse camera embed data;获取sensor信息曝光参数等

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] char* embed_raw: data to be parsed;待解析的数据
[OUT] struct embed_data_info_s *embed_info: pared data information;解析好的数据信息

【返回值】

zero: Success
less than zero: Fail, return error code

### hb_cam_set_event_callback

【函数声明】

```c
int32_t hb_cam_set_event_callback(uint32_t port, void (*event_callback)(cam_event_t *fault_info));
```

【功能描述】

set event callback function;设置事件回调函数

【参数描述】

[IN] uint32_t port: Corresponding to the port set in the configuration file; 和配置文件中设置的port 相对应;range:[0, 23],default:0
[IN] void (*event_callback)(cam_event_t* fault_info): callback function handler;回调函数指针

【返回值】

zero: Success;成功
less than zero: Fail, return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: Ultra/X5/Super; SW: 1.0.0

### hb_vio_init

【函数声明】

```c
int32_t hb_vio_init(const char *cfg_file);
```

【功能描述】

Initialize all pipelines configured in the configuration file according to the incoming configuration file, including isp&amp;pym&amp;gdc, CIM and mipi configurations; 根据传入的配置文件初始化配置文件所配置的所有pipeline,包括 isp &amp; pym &amp; gdc,CIM和mipi配置

【参数描述】

[IN] const char *cfg_file: The absolute path of the vpm configuration file. The path length should not exceed 256 bytes;vpm 配置文件绝对路径,路径长度不要超过256字节.

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_deinit

【函数声明】

```c
int32_t hb_vio_deinit(void);
```

【功能描述】

De-initialize all initialized pipelines and release the resources of the initialization request; 对初始化的所有pipeline进行反初始化并释放初始化申请的资源.

【参数描述】

[IN] None

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_start_pipeline

【函数声明】

```c
int32_t hb_vio_start_pipeline(uint32_t pipeline_id);
```

【功能描述】

Enable corresponding pipeline; 使能对应pipeline

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_stop_pipeline

【函数声明】

```c
int32_t hb_vio_stop_pipeline(uint32_t pipeline_id);
```

【功能描述】

disable corresponding pipeline; 停止对应pipeline

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_set_event_callback

【函数声明】

```c
int32_t hb_vio_set_event_callback(uint32_t pipeline_id, VIO_MODULE_TYPE_E module_type, VIO_EVENT_TYPE_E event_type, void (*event_callback)(void *event_info));
```

【功能描述】

set event callback function;设置事件回调函数

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] VIO_MODULE_TYPE_E module_type: 模块类型编号
[IN] IO_EVENT_TYPE_E event_type：事件类型
[IN] void (*event_callback)(void* fault_info): callback function handler;回调函数指针

【返回值】

zero: Success;成功
less than zero: Fail, return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: Ultra/X5/Super; SW: 1.0.0

### hb_vio_get_info

【函数声明】

```c
int32_t hb_vio_get_info(uint32_t pipeline_id, VIO_MODULE_TYPE_E module_type, VIO_INFO_E info_type, void *info);
```

【功能描述】

Get the parameters of the corresponding pipeline through info_type; 通过info_type获取对应pipeline的参数。

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] VIO_MODULE_TYPE_E module_type：模块类型编号
[IN] VIO_INFO_E info_type 信息类型
[OUT] void *info:Parameters to be obtained; 需要获取的参数。

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_set_callbacks

【函数声明】

```c
int32_t hb_vio_set_callbacks(uint32_t pipeline_id, VIO_CALLBACK_TYPE_E type, data_cb cb);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] VIO_CALLBACK_TYPE_E type: callback type;回调类型
[IN] data_cb cb:call back function;回调函数指针

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_set_param

【函数声明】

```c
int32_t hb_vio_set_param(uint32_t pipeline_id, VIO_INFO_TYPE_E info_type, void *info);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] VIO_INFO_TYPE_E info_type:type to set;要设置的参数类型;
[IN] void *info:information to be set;要设置的参数信息

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_get_param

【函数声明】

```c
int32_t hb_vio_get_param(uint32_t pipeline_id, VIO_INFO_TYPE_E info_type, void *info);
```

【功能描述】

Get the parameters of the corresponding pipeline through info_type; 通过info_type获取对应pipeline的参数。

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] VIO_INFO_TYPE_E info_type:Parameter type to obtain, type description: HB_VIO_ISP_IMG_INFO, ISP memory information; HB_VIO_PYM_V3_IMG_INFO, PYM memory information
[IN] VIO_INFO_TYPE_E info_type:要获取的参数类型,类型说明:HB_VIO_ISP_IMG_INFO, ISP内存信息;HB_VIO_PYM_V3_IMG_INFO,PYM内存信息
[OUT] void *info:Parameters to be obtained; 需要获取的参数。

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_get_data

【函数声明】

```c
int32_t hb_vio_get_data(uint32_t pipeline_id, VIO_DATA_TYPE_E data_type, void *data);
```

【功能描述】

Obtain the data of the corresponding pipeline through the corresponding datatype;; 通过对应data_type获取对应pipeline_id的数据;

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] VIO_DATA_TYPE_E data_type:需要获取的数据类型;data_type类型说明: HB_VIO_PYM_DATA_V3 获取 pym 处理结果,SUPER最常用类型; HB_VIO_ISP_YUV_DATA 获取isp输出yuv数据,需要配合配置文件中isp_dma_output_format参数设置; HB_VIO_ISP_RAW_DATA 获取isp输出raw数据,需要配合配置文件中isp_dma_output_format参数设置;
[IN] VIO_DATA_TYPE_E data_type:The type of data to be obtained; data_ Type description: HB_VIO_PYM_DATA_V3 Get pym processing results. Super is the most commonly used type; HB_VIO_ISP_YUV_DATA To obtain the yuv data output by the isp, you need to cooperate with isp_dma_output_format parameter settings in the configuration file; HB_VIO_ISP_RAW_DATA To obtain the raw data output by the isp, you need to cooperate with isp_dma_output_format parameter settings in the configuration file;
[OUT] void *data:The data to be obtained, and the data type corresponds to the datatype; 需要获取的数据,数据类型和data_type对应

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_get_data_conditional

【函数声明】

```c
int32_t hb_vio_get_data_conditional(uint32_t pipeline_id, VIO_DATA_TYPE_E data_type, void *data, int32_t times);
```

【功能描述】

Get the data of the corresponding pipelineid conditionally through the corresponding datatype and the set times parameter; 通过对应data_type以及设置的times参数有条件的获取对应pipeline_id的数据;

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] VIO_DATA_TYPE_E data_type:需要获取的数据类型:data_type类型说明:HB_VIO_PYM_DATA_V3:获取 pym 处理结果,SUPER最常用类型;
[IN] VIO_DATA_TYPE_E data_type:The type of data to be obtained; data_ Type description: HB_VIO_PYM_DATA_V3,Get pym processing results. Super is the most commonly used type;
[IN] int32_t times:设置需要获取帧的相对时间; times参数说明: times = 0:清空当前缓存帧,等待下一帧; times > 0:查找缓存帧中满足当前时间-time要求的最早帧; times < 0:清空当前缓存帧,等待当前时间 – time之后的那一帧;
[IN] int32_t times:Set the relative time to acquire frames; Time parameter description: times = 0:Clear the current cache frame and wait for the next frame; times > 0:Find the earliest frame in the cache that meets the current time-time requirement; times < 0:Clear the current cache frame and wait for the frame after the current time – time; range:[-1056, 1056],default:0
[OUT] void *data:The data to be obtained, and the data type corresponds to the datatype; 需要获取的数据,数据类型和data_type对应

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_run_pym

【函数声明】

```c
int32_t hb_vio_run_pym(uint32_t pipeline_id, hb_vio_buffer_t *src_img_info);
```

【功能描述】

Enable pym to process the reinjection data of the corresponding pipeline; 使能pym处理对应pipeline的回灌数据.

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] hb_vio_buffer_t * src_img_info:Pym memory to be processed; 需要处理的pym内存;

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_free_ipubuf

【函数声明】

```c
int32_t hb_vio_free_ipubuf(uint32_t pipeline_id, hb_vio_buffer_t *dst_img_info);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] hb_vio_buffer_t * dst_img_info:ipu memory to be freed; 需要free的ipu内存;

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_free_ispbuf

【函数声明】

```c
int32_t hb_vio_free_ispbuf(uint32_t pipeline_id, hb_vio_buffer_t *dst_img_info);
```

【功能描述】

Release the isp data corresponding to pipelineid, and hb_vio_get_data is used to obtain the isp data; 释放对应pipeline_id的isp数据,和hb_vio_get_data获取isp数据对应使用.

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] hb_vio_buffer_t * dst_img_info:isp memory to be freed; 需要free的isp内存;

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_free_pymbuf

【函数声明】

```c
int32_t hb_vio_free_pymbuf(uint32_t pipeline_id, VIO_DATA_TYPE_E data_type, void *img_info);
```

【功能描述】

Release the pym data corresponding to pipelineid, and hb_vio_get_data is used to obtain the pym data; 释放对应pipeline_id的pym数据,和hb_vio_get_data获取pym数据对应使用.

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] VIO_DATA_TYPE_E data_type:Released data type, type description: HB_VIO_PYM_DATA_V3, Super most commonly used type;
[IN] VIO_DATA_TYPE_E data_type:释放的数据类型, 类型说明: HB_VIO_PYM_DATA_V3, SUPER常用;
[IN] void * dst_img_info:pym memory to be freed; 需要free的pym内存;

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_gen_gdc_cfg

【函数声明】

```c
int32_t hb_vio_gen_gdc_cfg(param_t *gdc_parm, window_t *wnds, uint32_t wnd_num, void **cfg_buf, uint64_t *cfg_size);
```

【功能描述】

Generate the cfg bin file required for the work of the gdc module; 生成gdc模块的工作所需的cfg bin文件

【参数描述】

[OUT] cfg_buf: Generated gdc cfg bin, internal allocation; 生成的gdc cfg bin,内部分配
[OUT] cfg_size: Size of gdc cfg bin file; gdc cfg bin文件的大小

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_set_gdc_cfg

【函数声明】

```c
int32_t hb_vio_set_gdc_cfg(uint32_t pipeline_id, uint32_t *cfg_buf, uint64_t cfg_size);
```

【功能描述】

Set cfg bin of gdc module; 设置gdc模块的cfg bin

【参数描述】

[IN] cfg_buf: config buffer of gdc cfg bin; gdc cfg bin 的buffer
[IN] cfg_size: size of gdc cfg bin ; gdc cfg bin文件的大小

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_set_gdc_cfg_opt

【函数声明】

```c
int32_t hb_vio_set_gdc_cfg_opt(uint32_t pipeline_id, uint32_t gdc_id, uint32_t *cfg_buf, uint64_t cfg_size); //comp xj3
```

【功能描述】

Set cfg bin of gdc module; 设置gdc模块的cfg bin

【参数描述】

[IN] cfg_buf: config buffer of gdc cfg bin; gdc cfg bin 的buffer
[IN] cfg_size: size of gdc cfg bin ; gdc cfg bin文件的大小

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_free_gdc_cfg

【函数声明】

```c
void hb_vio_free_gdc_cfg(uint32_t *cfg_buf);
```

【功能描述】

Release the buffer of the production gdc module cfg bin; 释放生产gdc模块cfg bin的buffer

【参数描述】

[IN] uint32_t* cfg_buf:Buffer of gdc cfg bin; gdc cfg bin的buffer.

【返回值】

None

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_run_gdc

【函数声明】

```c
int32_t hb_vio_run_gdc(uint32_t pipeline_id, hb_vio_buffer_t *src_img_info, hb_vio_buffer_t *dst_img_info, int32_t rotate);
```

【功能描述】

Enable gdc corresponding to pipelineid to correct the process distortion of src data; 使能对应pipeline_id的gdc,对src数据进程畸变矫正。

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] hb_vio_buffer_t * src_img_info:Input image memory needed to process gdc;需要处理gdc的输入图像内存;
[IN] int32_t rotate:Indicates the rotation angle to be processed, and supports an angle of 0,90,180,270;表示需要处理的旋转角度,支持角度0,90,180,270;
[OUT] hb_vio_buffer_t * dst_img_info:Out image memory of gdc after process;需要处理gdc的输出图像内存;

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_run_gdc_opt

【函数声明】

```c
int32_t hb_vio_run_gdc_opt(uint32_t pipeline_id, uint32_t gdc_id, hb_vio_buffer_t *src_img_info, hb_vio_buffer_t *dst_img_info, int32_t rotate);
```

【功能描述】

Enable gdc corresponding to pipelineid to correct the process distortion of src data; 使能对应pipeline_id的gdc,对src数据进程畸变矫正。

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] uint32_t gdc_id:gdc hardware id ; gdc 硬件id;range:[0, 1],default:0
[IN] hb_vio_buffer_t * src_img_info:Input image memory needed to process gdc;需要处理gdc的输入图像内存;
[IN] int32_t rotate:Indicates the rotation angle to be processed, and supports an angle of 0,90,180,270;表示需要处理的旋转角度,支持角度0,90,180,270;
[OUT] hb_vio_buffer_t * dst_img_info:Out image memory of gdc after process;需要处理gdc的输出图像内存;

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_run_gdc_adv

【函数声明】

```c
int32_t hb_vio_run_gdc_adv(uint32_t pipeline_id, uint32_t gdc_id, const gdc_config_t *gdc_cfg, hb_vio_buffer_t *src_img_info, hb_vio_buffer_t *dst_img_info, int32_t rotate);
```

【功能描述】

Enable gdc corresponding to pipelineid to correct the process distortion of src data; 使能对应pipeline_id的gdc,对src数据进程畸变矫正。

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] uint32_t gdc_id:gdc hardware id ; gdc 硬件id;range:[0, 1],default:0
[IN] const gdc_config_t *gdc_cfg:User's gdc configuration ; 用户的gdc配置
[IN] hb_vio_buffer_t * src_img_info:Input image memory needed to process gdc;需要处理gdc的输入图像内存;
[IN] int32_t rotate:Indicates the rotation angle to be processed, and supports an angle of 0,90,180,270;表示需要处理的旋转角度,支持角度0,90,180,270;
[OUT] hb_vio_buffer_t * dst_img_info:Out image memory of gdc after process;需要处理gdc的输出图像内存;

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_run_gdc_adv_user

【函数声明】

```c
int32_t hb_vio_run_gdc_adv_user(uint32_t pipeline_id, uint32_t gdc_id, const gdc_config_t *gdc_cfg, const hb_vio_buffer_t *src_img_info, hb_vio_buffer_t *dst_img_info, int32_t rotate);
```

【功能描述】

Enable gdc corresponding to pipelineid to correct the process distortion of src data; 使能对应pipeline_id的gdc,对src数据进程畸变矫正。

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] uint32_t gdc_id]:gdc hardware id ; gdc 硬件id;range:[0, 1],default:0
[IN] const gdc_config_t *gdc_cfg:User's gdc configuration ; 用户的gdc配置
[IN] hb_vio_buffer_t * src_img_info:Input image memory needed to process gdc;需要处理gdc的输入图像内存;
[IN] int32_t rotate:Indicates the rotation angle to be processed, and supports an angle of 0,90,180,270;表示需要处理的旋转角度,支持角度0,90,180,270;
[OUT] hb_vio_buffer_t * dst_img_info:Out image memory of gdc after process,allocated by user;需要处理gdc的输出图像内存,用户自行分配;

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_free_gdcbuf

【函数声明】

```c
int32_t hb_vio_free_gdcbuf(uint32_t pipeline_id, hb_vio_buffer_t *dst_img_info);
```

【功能描述】

Release the gdc data corresponding to pipelineid, and hb_vio_get_data is used to obtain the gdc data; 释放对应pipeline_id的gdc数据,和hb_vio_get_data获取gdc数据对应使用.

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] hb_vio_buffer_t * dst_img_info:gdc memory to be freed; 需要free的gdc内存;

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_raw_dump

【函数声明】

```c
int32_t hb_vio_raw_dump(uint32_t pipeline_id, hb_vio_buffer_t *raw_img, hb_vio_buffer_t *yuv);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[OUT] hb_vio_buffer_t * raw_img:raw memory to be dump; 需要dump的图像;
[OUT] hb_vio_buffer_t * yuv:yuv memory to be dump; 需要dump的图像;

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_raw_feedback

【函数声明】

```c
int32_t hb_vio_raw_feedback(uint32_t pipeline_id, hb_vio_buffer_t *feedback_src, hb_vio_buffer_t *isp_dst_yuv);
```

【功能描述】

Not support; 不支持

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[OUT] hb_vio_buffer_t * feedback_src:feedback_src memory to be feedback; 需要回灌的图像;
[OUT] hb_vio_buffer_t * isp_dst_yuv:isp_dst_yuv memory to be feedback; 需要回灌的图像;

【返回值】

E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_run_raw

【函数声明】

```c
int32_t hb_vio_run_raw(uint32_t pipeline_id, hb_vio_buffer_t *feedback_src, int32_t timeout);
```

【功能描述】

After the video system is initialized, hb_vio_get_data obtain the isp raw reinjection address and reinjection the external RAW image into the acquired address, enabling isp to process the reinjection data.; 视频系统初始化后,通过hb_vio_get_data获取isp raw 回灌地址并将外部RAW图像回灌到获取的地址中,使能isp 对回灌数据进行处理。

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0
[IN] hb_vio_buffer_t * feedback_src:Input image memory needed to process isp;需要处理isp的输入图像内存;
[IN] int32_t timeout: timeout of process ; 处理的容忍时间;range:[0, 2147483647],default:0

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_cfg_check

【函数声明】

```c
int32_t hb_vio_cfg_check(const char *vpm_file, const char *vin_file, uint32_t cfg_index);
```

【功能描述】

Check whether the vpm&amp;vin configuration file parameters are correct;

【参数描述】

[IN] const char* vpm_file: The absolute path of the vpm configuration file
[IN] const char* vin_file: The absolute path of the vin configuration file
[IN] uint32_t cfg_index:  The configure index of vin configuration file

【返回值】

zero: Success
less than zero: Fail, return error code

【兼容性】
HW: Ultra/X5/Super; SW: 1.0.0

### hb_vio_pause_pipeline

【函数声明】

```c
int32_t hb_vio_pause_pipeline(uint32_t pipeline_id);
```

【功能描述】

pause the CIM data flow of the specified software channel; 暂停指定软件通道的CIM数据流

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: Super; SW: 1.0.0

### hb_vio_resume_pipeline

【函数声明】

```c
int32_t hb_vio_resume_pipeline(uint32_t pipeline_id);
```

【功能描述】

resume the CIM data flow of the specified software channel; 恢复指定软件通道的CIM数据流

【参数描述】

[IN] uint32_t pipeline_id:pipeline id ; 软件通道id;range:[0, 23],default:0

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: Super; SW: 1.0.0

## 相关文档

- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
- [VIO API](/Simple_API/multimedia_api/cdev/vio_api)
- [视频采集](/Demos/multimedia_demo/cdev/vio_capture)
