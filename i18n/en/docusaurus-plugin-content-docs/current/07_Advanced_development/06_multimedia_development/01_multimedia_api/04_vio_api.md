---
sidebar_position: 4
title: "VIO API"
description: RDK S100/S600 VIO API
---

# VIO API

## Overview

VIO (Video Input/Output) is the high-level RDK multimedia pipeline API (board header `hb_vio_interface.h`; X5 calls it VIN, RDK uses VIO). It wraps init, start/stop, parameter config and frame retrieval of the whole pipeline from sensor capture through VIN/ISP/PYM/GDC, as a convenience layer above HBN vnodes.

## Abstraction

- **Pipeline**: a VIO pipeline chains VIN->ISP->PYM/GDC stages; initialized by `hb_vio_init`, started by `hb_vio_start_pipeline`.
- **Params & info**: `hb_vio_set_param`/`get_param` configure/query pipeline params; `hb_vio_get_info` queries runtime info.
- **Frame retrieval**: `hb_vio_run_pym`/`run_gdc`/`run_raw` fetch stage outputs; `hb_vio_raw_dump`/`raw_feedback` for feedback debugging.
- **GDC**: `hb_vio_set_gdc_cfg`/`set_gdc_cfg_opt` configure distortion correction.

## Call flow

1. `hb_vio_init` initializes the pipeline with a config file.
2. `hb_vio_set_param` configures params (optional); `hb_vio_set_gdc_cfg` configures GDC if needed.
3. `hb_vio_start_pipeline` starts; use `hb_vio_pause_pipeline`/`resume_pipeline` while running.
4. `hb_vio_run_pym`/`run_gdc`/`run_raw` fetch results; `hb_vio_get_info` queries status.
5. `hb_vio_stop_pipeline` stops.


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

【返回值】

E_OK: Success;成功
E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

【兼容性】
HW: Super; SW: 1.0.0

