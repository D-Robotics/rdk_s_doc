---
sidebar_position: 4
title: "Video Input/Output - VIO"
description: "RDK S100/S600 5.5.1.4 VIO (Video Input/Output)"
---

# Video Input/Output - VIO

> **Level description**: This section covers the low-level multimedia API (board-side `hb_vio_interface.h`), a high-level pipeline API (X5 VIN → RDK VIO) that wraps the initialization, start/stop, and frame retrieval of the entire chain from sensor capture through VIN/ISP/PYM/GDC. It is intended for advanced developers who need to directly operate the multimedia pipeline (Mode 3); if you only need the encapsulated capture/codec/display functionality, see Chapter 4 [Simple API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) (Mode 1).

> **Platform codename note**: Compatibility annotations in this document follow the original wording of the underlying header files. XJ3/J3 and Ultra are earlier-generation upstream platform codenames; X5 denotes the current upstream product line (not these two boards); Super/J6 are the codenames of the architecture family shared by this product line (board-verified: S100/S600 share the same family, with S600 in a multi-core form). An `HW:` list indicates the interface's applicable range across upstream platform generations, where the Super generation corresponds to this product line (inherited from upstream annotations, not verified per-interface on board); `SW` is the upstream software version number — for RDK releases see the Release Notes. Interfaces without codenames are inherited from upstream and not individually verified on RDK.

## Overview

VIO (Video Input/Output) is the high-level RDK multimedia pipeline API (board header `hb_vio_interface.h`; X5 calls it VIN, RDK uses VIO). It wraps init, start/stop, parameter config and frame retrieval of the whole pipeline from sensor capture through VIN/ISP/PYM/GDC, as a convenience layer above HBN vnodes.

## Software Abstraction

- **Pipeline**: a VIO pipeline chains VIN->ISP->PYM/GDC stages; initialized by `hb_vio_init`, started by `hb_vio_start_pipeline`.
- **Params & info**: `hb_vio_set_param`/`get_param` configure/query pipeline params; `hb_vio_get_info` queries runtime info.
- **Frame retrieval**: `hb_vio_run_pym`/`run_gdc`/`run_raw` fetch stage outputs; `hb_vio_raw_dump`/`raw_feedback` for feedback debugging.
- **GDC**: `hb_vio_set_gdc_cfg`/`set_gdc_cfg_opt` configure distortion correction.

## API Call Flow

1. `hb_vio_init` initializes the pipeline with a config file.
2. `hb_vio_set_param` configures params (optional); `hb_vio_set_gdc_cfg` configures GDC if needed.
3. `hb_vio_start_pipeline` starts; use `hb_vio_pause_pipeline`/`resume_pipeline` while running.
4. `hb_vio_run_pym`/`run_gdc`/`run_raw` fetch results; `hb_vio_get_info` queries status.
5. `hb_vio_stop_pipeline` stops.

## Quick Example

The following example demonstrates the minimal usage sequence of the high-level pipeline API in `hb_vio_interface.h` (the configuration file defines the whole pipeline including sensor/ISP/PYM, etc.):

```c
#include "hb_vio_interface.h"

// 1. Initialize the pipeline with a configuration file (including CIM/MIPI/ISP/PYM/GDC)
int32_t ret = hb_vio_init("./vio_config.json");
if (ret != 0) {
    /* Handle initialization failure */
}

// 2. Start the pipeline
ret = hb_vio_start_pipeline(0);

// 3. Get the PYM processing result and release it after use
hb_vio_buffer_t pym_data;
ret = hb_vio_get_data(0, HB_VIO_PYM_DATA_V3, &pym_data);
/* Use pym_data ... */
hb_vio_free_pymbuf(0, HB_VIO_PYM_DATA_V3, &pym_data);

// 4. Stop the pipeline and de-initialize it
hb_vio_stop_pipeline(0);
hb_vio_deinit();
```

> Board-side samples such as `get_vin_data`/`get_isp_data` build the pipeline directly with the HBN vnode style (`hbn_vnode_*`); `hb_vio_*` is the high-level interface layered on top of them. For configuration, see the `06_multimedia_sample` chapter and the configuration files of the samples under `/app/multimedia_samples/` on the board.

## API List

| Function | Description |
| --- | --- |
| hb_cam_init | Select the corresponding vin index from the configuration file to initialize the sensor |
| hb_cam_deinit | Select the corresponding vin index from the configuration file to de-initialize the sensor |
| hb_cam_start | Start the sensor data flow of the specified software channel |
| hb_cam_stop | Stop the sensor data flow of the specified software channel |
| hb_cam_start_all | Not support |
| hb_cam_stop_all | Not support |
| hb_cam_reset | Reset the corresponding port cam |
| hb_cam_power_on | Not support |
| hb_cam_power_off | Not support |
| hb_cam_get_fps | Get the fps parameter in the configuration file of the corresponding port |
| hb_cam_get_img | Not support |
| hb_cam_free_img | Not support |
| hb_cam_clean_img | Not support |
| hb_cam_get_data | Get the cim data of the corresponding port |
| hb_cam_free_data | Release the result of hb_cam_get_data of the corresponding port |
| hb_cam_bypass_enable | bypass corresponding sensor port |
| hb_cam_set_fps_ctrl | Set the frame rate of the corresponding port, and whether to select skip frame |
| hb_cam_set_lpwm_ctrl | Set dynamic lpwm attr value |
| hb_cam_get_stat_info | Get corresponding sensor port frame information |
| hb_cam_dynamic_switch_fps | The frame rate switching interface requires the corresponding support of the sensor library |
| hb_cam_dynamic_switch_mode | Not support |
| hb_cam_dynamic_switch | Not support |
| hb_cam_set_mclk | Not support |
| hb_cam_enable_mclk | Not support |
| hb_cam_disable_mclk | Not support |
| hb_cam_extern_isp_reset | Not support |
| hb_cam_extern_isp_poweroff | Not support |
| hb_cam_extern_isp_poweron | Not support |
| hb_cam_i2c_read | Access sensor through i2c |
| hb_cam_i2c_read_byte | Not support |
| hb_cam_i2c_write | Write sensor register through i2c |
| hb_cam_i2c_write_byte | Not support |
| hb_cam_i2c_block_write | Not support |
| hb_cam_i2c_block_read | Not support |
| hb_cam_spi_block_write | Not support |
| hb_cam_spi_block_read | Not support |
| hb_cam_ipi_reset | Reset the ipi path operation of the specified mipi, which can be used to switch the specified ipi data path |
| hb_cam_get_sns_info | Get sensor information |
| hb_cam_get_status | Get sensor information |
| hb_cam_parse_embed_data | Parse camera embed data and obtain sensor exposure parameters, etc. |
| hb_cam_set_event_callback | set event callback function |
| hb_vio_init | Initialize all pipelines configured in the configuration file according to the incoming configuration file, including isp&amp;pym&amp;gdc, CIM and mipi configurations |
| hb_vio_deinit | De-initialize all initialized pipelines and release the resources of the initialization request |
| hb_vio_start_pipeline | Enable corresponding pipeline |
| hb_vio_stop_pipeline | disable corresponding pipeline |
| hb_vio_set_event_callback | set event callback function |
| hb_vio_get_info | Get the parameters of the corresponding pipeline through info_type |
| hb_vio_set_callbacks | Not support |
| hb_vio_set_param | Not support |
| hb_vio_get_param | Get the parameters of the corresponding pipeline through info_type |
| hb_vio_get_data | Obtain the data of the corresponding pipeline through the corresponding datatype |
| hb_vio_get_data_conditional | Get the data of the corresponding pipelineid conditionally through the corresponding datatype and the set times parameter |
| hb_vio_run_pym | Enable pym to process the reinjection data of the corresponding pipeline |
| hb_vio_free_ipubuf | Not support |
| hb_vio_free_ispbuf | Release the isp data corresponding to pipelineid, and hb_vio_get_data is used to obtain the isp data |
| hb_vio_free_pymbuf | Release the pym data corresponding to pipelineid, and hb_vio_get_data is used to obtain the pym data |
| hb_vio_gen_gdc_cfg | Generate the cfg bin file required for the work of the gdc module |
| hb_vio_set_gdc_cfg | Set cfg bin of gdc module |
| hb_vio_set_gdc_cfg_opt | Set cfg bin of gdc module |
| hb_vio_free_gdc_cfg | Release the buffer of the production gdc module cfg bin |
| hb_vio_run_gdc | Enable gdc corresponding to pipelineid to correct the process distortion of src data |
| hb_vio_run_gdc_opt | Enable gdc corresponding to pipelineid to correct the process distortion of src data |
| hb_vio_run_gdc_adv | Enable gdc corresponding to pipelineid to correct the process distortion of src data |
| hb_vio_run_gdc_adv_user | Enable gdc corresponding to pipelineid to correct the process distortion of src data |
| hb_vio_free_gdcbuf | Release the gdc data corresponding to pipelineid, and hb_vio_get_data is used to obtain the gdc data |
| hb_vio_raw_dump | Not support |
| hb_vio_raw_feedback | Not support |
| hb_vio_run_raw | After the video system is initialized, hb_vio_get_data obtain the isp raw reinjection address and reinjection the external RAW image into the acquired address, enabling isp to process the reinjection data. |
| hb_vio_cfg_check | Check whether the vpm&amp;vin configuration file parameters are correct |
| hb_vio_pause_pipeline | pause the CIM data flow of the specified software channel |
| hb_vio_resume_pipeline | resume the CIM data flow of the specified software channel |

## API Interface Description

### hb_cam_init

**Function Declaration**

```c
int32_t hb_cam_init(uint32_t cfg_index, const char *cfg_file);
```

**Description**

Select the corresponding vin index from the configuration file to initialize the sensor

**Parameter Description**

[IN] uint32_t cfg_index: Cfg of vin in configuration file to be initialized index; range:[0, 2147483647],default:0
[IN] const char *cfg_file:Vin profile absolute path

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_deinit

**Function Declaration**

```c
int32_t hb_cam_deinit(uint32_t cfg_index);
```

**Description**

Select the corresponding vin index from the configuration file to de-initialize the sensor

**Parameter Description**

[IN] uint32_t cfg_index: Config index of vin in the configuration file; range:[0, 2147483647],default:0

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_start

**Function Declaration**

```c
int32_t hb_cam_start(uint32_t port);
```

**Description**

Start the sensor data flow of the specified software channel

**Parameter Description**

[IN] uint32_t port: Indicates the sensor, port and corresponding configuration file port that need to be enabled; range:[0, 23],default:0

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_stop

**Function Declaration**

```c
int32_t hb_cam_stop(uint32_t port);
```

**Description**

Stop the sensor data flow of the specified software channel

**Parameter Description**

[IN] uint32_t port: Indicates the sensor, port and corresponding configuration file port that need to be disanabled; range:[0, 23],default:0

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_start_all

**Function Declaration**

```c
int32_t hb_cam_start_all(void);
```

**Description**

Not support

**Parameter Description**

[IN] None

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_stop_all

**Function Declaration**

```c
int32_t hb_cam_stop_all(void);
```

**Description**

Not support

**Parameter Description**

[IN] None

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_reset

**Function Declaration**

```c
int32_t hb_cam_reset(uint32_t port);
```

**Description**

Reset the corresponding port cam

**Parameter Description**

[IN] uint32_t port: Cam ports to be reset; range:[0, 23],default:0

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_power_on

**Function Declaration**

```c
int32_t hb_cam_power_on(uint32_t port);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_power_off

**Function Declaration**

```c
int32_t hb_cam_power_off(uint32_t port);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_get_fps

**Function Declaration**

```c
int32_t hb_cam_get_fps(uint32_t port, uint32_t *fps);
```

**Description**

Get the fps parameter in the configuration file of the corresponding port

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[OUT] uint32_t *fps: Get the storage address of the frame rate value

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_get_img

**Function Declaration**

```c
int32_t hb_cam_get_img(cam_img_info_t *cam_img_info);
```

**Description**

Not support

**Parameter Description**

[IN] cam_img_info_t *cam_img_info: camera image information

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3; SW: 1.0.0

### hb_cam_free_img

**Function Declaration**

```c
int32_t hb_cam_free_img(cam_img_info_t *cam_img_info);
```

**Description**

Not support

**Parameter Description**

[IN] cam_img_info_t *cam_img_info: camera image information

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3; SW: 1.0.0

### hb_cam_clean_img

**Function Declaration**

```c
int32_t hb_cam_clean_img(cam_img_info_t *cam_img_info);
```

**Description**

Not support

**Parameter Description**

[IN] cam_img_info_t *cam_img_info: camera image information

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3; SW: 1.0.0

### hb_cam_get_data

**Function Declaration**

```c
int32_t hb_cam_get_data(uint32_t port, CAM_DATA_TYPE_E data_type, void *data);
```

**Description**

Get the cim data of the corresponding port

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] CAM_DATA_TYPE_E data_type: Set the required info type; data_type parameter description: HB_CAM_RAW_DATA:get cam raw data(raw sensor) HB_CAM_YUV_DATA:get cam yuv data(yuv sensor) HB_CAM_FEEDBACK_RAW_DATA:get feedback raw buff,used by cim feedback
[OUT] void * data: Output the data result of the corresponding type

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_free_data

**Function Declaration**

```c
int32_t hb_cam_free_data(uint32_t port, CAM_DATA_TYPE_E data_type, void *data);
```

**Description**

Release the result of hb_cam_get_data of the corresponding port

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] CAM_DATA_TYPE_E data_type: Set the released info type,corresponding to hb_cam_get_data
[IN] void * data:The corresponding data is used with hb_cam_get_data

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_bypass_enable

**Function Declaration**

```c
int32_t hb_cam_bypass_enable(uint32_t port, int32_t enable);
```

**Description**

bypass corresponding sensor port

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] int32_t enable[0, 1]:if enable bypass function for this port; range:[0, 1],default:0

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_set_fps_ctrl

**Function Declaration**

```c
int32_t hb_cam_set_fps_ctrl(uint32_t port, uint32_t skip_frame, uint32_t in_fps, uint32_t out_fps);
```

**Description**

Set the frame rate of the corresponding port, and whether to select skip frame

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] int32_t skip_frame[0, 1]:if skip frame enable,0-no skip,1-skip; range:[0, 1],default:0
[IN] uint32_t in_fps:sensor input fps; range:[1, 480],default:30
[IN] uint32_t out_fps:sensor output fps; range:[1, 480],default:30

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_set_lpwm_ctrl

**Function Declaration**

```c
int32_t hb_cam_set_lpwm_ctrl(uint32_t port, uint32_t lpwn_chn, lpwm_dynamic_t *lpwm_dynamic_attr);
```

**Description**

Set dynamic lpwm attr value

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint32_t lpwn_chn:lpwn channel id
[IN] lpwm_dynamic_t *lpwm_dynamic_attr: lpwm_dynamic_attr channel attribute value

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_get_stat_info

**Function Declaration**

```c
int32_t hb_cam_get_stat_info(uint32_t port, struct vio_statinfo *info);
```

**Description**

Get corresponding sensor port frame information

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[OUT] vio_statinfo *statinfo:address of statinfo

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: Ultra/X5/Super; SW: 1.0.0

### hb_cam_dynamic_switch_fps

**Function Declaration**

```c
int32_t hb_cam_dynamic_switch_fps(uint32_t port, uint32_t fps);
```

**Description**

The frame rate switching interface requires the corresponding support of the sensor library

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint32_t fps:Indicates the frame rate to switch; range:[1, 480],default:30

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_dynamic_switch_mode

**Function Declaration**

```c
int32_t hb_cam_dynamic_switch_mode(uint32_t port, uint32_t mode);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint32_t mode: camera work mode; range:[0, 100],default:0

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_dynamic_switch

**Function Declaration**

```c
int32_t hb_cam_dynamic_switch(uint32_t port, uint32_t fps, uint32_t resolution);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint32_t fps:Indicates the frame rate to switch; range:[1, 480],default:30
[IN] uint32_t resolution:image resolution; range:[1, 8294400],default:0

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_set_mclk

**Function Declaration**

```c
int32_t hb_cam_set_mclk(uint32_t entry_num, uint32_t mclk);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t entry_num:Mipi host index; range:[0, 3],default:0
[IN] uint32_t mclk:sensor clock; range:[1, 3000000],default:0

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_enable_mclk

**Function Declaration**

```c
int32_t hb_cam_enable_mclk(uint32_t entry_num);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t entry_num:Mipi host index; range:[0, 3],default:0

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_disable_mclk

**Function Declaration**

```c
int32_t hb_cam_disable_mclk(uint32_t entry_num);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t entry_num:Mipi host index; range:[0, 3],default:0

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_extern_isp_reset

**Function Declaration**

```c
int32_t hb_cam_extern_isp_reset(uint32_t port);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_extern_isp_poweroff

**Function Declaration**

```c
int32_t hb_cam_extern_isp_poweroff(uint32_t port);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_extern_isp_poweron

**Function Declaration**

```c
int32_t hb_cam_extern_isp_poweron(uint32_t port);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_i2c_read

**Function Declaration**

```c
int32_t hb_cam_i2c_read(uint32_t port, uint32_t reg_addr);
```

**Description**

Access sensor through i2c

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint32_t reg_addr:i2c address to access

**Return Value**

&gt; 0: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_i2c_read_byte

**Function Declaration**

```c
int32_t hb_cam_i2c_read_byte(uint32_t port, uint32_t reg_addr);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint32_t reg_addr:i2c address to access

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_i2c_write

**Function Declaration**

```c
int32_t hb_cam_i2c_write(uint32_t port, uint32_t reg_addr, uint16_t value);
```

**Description**

Write sensor register through i2c

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint32_t reg_addr:i2c address to access
[IN] uint16_t value:Indicates the value written

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_i2c_write_byte

**Function Declaration**

```c
int32_t hb_cam_i2c_write_byte(uint32_t port, uint32_t reg_addr, uint8_t value);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint32_t reg_addr:i2c address to access
[IN] uint16_t value:Indicates the value written

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_i2c_block_write

**Function Declaration**

```c
int32_t hb_cam_i2c_block_write(uint32_t port, uint32_t subdev, uint32_t reg_addr, char *buffer, uint32_t size);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint32_t subdev: device; 0 sensor;1 eeprom,default:0
[IN] uint32_t reg_addr:i2c address to access
[IN] char *buffer:address to access
[IN] uint32_t size:Indicates the value written

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_i2c_block_read

**Function Declaration**

```c
int32_t hb_cam_i2c_block_read(uint32_t port, uint32_t subdev, uint32_t reg_addr, char *buffer, uint32_t size);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint32_t subdev: device; 0 sensor;1 eeprom,default:0
[IN] uint32_t reg_addr:i2c address to access
[IN] uint32_t size:Indicates the value written
[OUT] char *buffer:address to access

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_spi_block_write

**Function Declaration**

```c
int32_t hb_cam_spi_block_write(uint32_t port, uint32_t subdev, uint32_t reg_addr, char *buffer, uint32_t size);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint32_t subdev: device; range:[0, 3000000],default:0
[IN] uint32_t reg_addr:spi address to access
[IN] char *buffer:address to access
[IN] uint32_t size:Indicates the value written

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_spi_block_read

**Function Declaration**

```c
int32_t hb_cam_spi_block_read(uint32_t port, uint32_t subdev, uint32_t reg_addr, char *buffer, uint32_t size);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint32_t subdev: device; range:[0, 3000000],default:0
[IN] uint32_t reg_addr:spi address to access
[IN] uint32_t size:Indicates the value written
[OUT] char *buffer:address to access

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_ipi_reset

**Function Declaration**

```c
int32_t hb_cam_ipi_reset(uint32_t entry_num, uint32_t ipi_index, uint32_t enable);
```

**Description**

Reset the ipi path operation of the specified mipi, which can be used to switch the specified ipi data path

**Parameter Description**

[IN] uint32_t entry_num:Mipi host index; range:[0, 3],default:0
[IN] uint32_t ipi_index:ipi index inside of Mipi host; range:[0, 3],default:0
[IN] uint32_t enable:Ipi switch status: 0-off, 1-on; range:[0, 1],default:0

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_cam_get_sns_info

**Function Declaration**

```c
int32_t hb_cam_get_sns_info(uint32_t port, cam_parameter_t *sp, uint8_t type);
```

**Description**

Get sensor information

**Parameter Description**

[IN] uint32_t port:Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] uint8_t type:Type of parameter
[OUT] cam_parameter_t *sp:Gets the address of the parameter

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: Ultra/X5/Super; SW: 1.0.0

### hb_cam_get_status

**Function Declaration**

```c
int32_t hb_cam_get_status(uint32_t port, struct cam_statinfo *info);
```

**Description**

Get sensor information

**Parameter Description**

[IN] uint32_t port:Corresponding to the port set in the configuration file; range:[0, 23],default:0
[OUT] struct cam_statinfo *info:Gets the address of the parameter

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: Ultra/X5/Super; SW: 1.0.0

### hb_cam_parse_embed_data

**Function Declaration**

```c
int32_t hb_cam_parse_embed_data(uint32_t port, char *embed_raw, struct embed_data_info_s *embed_info);
```

**Description**

Parse camera embed data and obtain sensor exposure parameters, etc.

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] char* embed_raw: data to be parsed
[OUT] struct embed_data_info_s *embed_info: parsed data information

**Return Value**

zero: Success
less than zero: Fail, return error code

### hb_cam_set_event_callback

**Function Declaration**

```c
int32_t hb_cam_set_event_callback(uint32_t port, void (*event_callback)(cam_event_t *fault_info));
```

**Description**

set event callback function

**Parameter Description**

[IN] uint32_t port: Corresponding to the port set in the configuration file; range:[0, 23],default:0
[IN] void (*event_callback)(cam_event_t* fault_info): callback function handler

**Return Value**

zero: Success
less than zero: Fail, return error code; range:[-10000,-1]

**Compatibility**
HW: Ultra/X5/Super; SW: 1.0.0

### hb_vio_init

**Function Declaration**

```c
int32_t hb_vio_init(const char *cfg_file);
```

**Description**

Initialize all pipelines configured in the configuration file according to the incoming configuration file, including isp&amp;pym&amp;gdc, CIM and mipi configurations

**Parameter Description**

[IN] const char *cfg_file: The absolute path of the vpm configuration file. The path length should not exceed 256 bytes

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_deinit

**Function Declaration**

```c
int32_t hb_vio_deinit(void);
```

**Description**

De-initialize all initialized pipelines and release the resources of the initialization request

**Parameter Description**

[IN] None

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_start_pipeline

**Function Declaration**

```c
int32_t hb_vio_start_pipeline(uint32_t pipeline_id);
```

**Description**

Enable corresponding pipeline

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_stop_pipeline

**Function Declaration**

```c
int32_t hb_vio_stop_pipeline(uint32_t pipeline_id);
```

**Description**

disable corresponding pipeline

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_set_event_callback

**Function Declaration**

```c
int32_t hb_vio_set_event_callback(uint32_t pipeline_id, VIO_MODULE_TYPE_E module_type, VIO_EVENT_TYPE_E event_type, void (*event_callback)(void *event_info));
```

**Description**

set event callback function

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] VIO_MODULE_TYPE_E module_type: Module type ID
[IN] IO_EVENT_TYPE_E event_type: Event type
[IN] void (*event_callback)(void* fault_info): callback function handler

**Return Value**

zero: Success
less than zero: Fail, return error code; range:[-10000,-1]

**Compatibility**
HW: Ultra/X5/Super; SW: 1.0.0

### hb_vio_get_info

**Function Declaration**

```c
int32_t hb_vio_get_info(uint32_t pipeline_id, VIO_MODULE_TYPE_E module_type, VIO_INFO_E info_type, void *info);
```

**Description**

Get the parameters of the corresponding pipeline through info_type

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] VIO_MODULE_TYPE_E module_type: Module type ID
[IN] VIO_INFO_E info_type: Info type
[OUT] void *info:Parameters to be obtained

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_set_callbacks

**Function Declaration**

```c
int32_t hb_vio_set_callbacks(uint32_t pipeline_id, VIO_CALLBACK_TYPE_E type, data_cb cb);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] VIO_CALLBACK_TYPE_E type: callback type
[IN] data_cb cb:call back function

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_set_param

**Function Declaration**

```c
int32_t hb_vio_set_param(uint32_t pipeline_id, VIO_INFO_TYPE_E info_type, void *info);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] VIO_INFO_TYPE_E info_type:type to set
[IN] void *info:information to be set

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_get_param

**Function Declaration**

```c
int32_t hb_vio_get_param(uint32_t pipeline_id, VIO_INFO_TYPE_E info_type, void *info);
```

**Description**

Get the parameters of the corresponding pipeline through info_type

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] VIO_INFO_TYPE_E info_type:Parameter type to obtain, type description: HB_VIO_ISP_IMG_INFO, ISP memory information; HB_VIO_PYM_V3_IMG_INFO, PYM memory information
[OUT] void *info:Parameters to be obtained

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_get_data

**Function Declaration**

```c
int32_t hb_vio_get_data(uint32_t pipeline_id, VIO_DATA_TYPE_E data_type, void *data);
```

**Description**

Obtain the data of the corresponding pipeline through the corresponding datatype

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] VIO_DATA_TYPE_E data_type:The type of data to be obtained; data_ Type description: HB_VIO_PYM_DATA_V3 Get pym processing results. Super is the most commonly used type; HB_VIO_ISP_YUV_DATA To obtain the yuv data output by the isp, you need to cooperate with isp_dma_output_format parameter settings in the configuration file; HB_VIO_ISP_RAW_DATA To obtain the raw data output by the isp, you need to cooperate with isp_dma_output_format parameter settings in the configuration file;
[OUT] void *data:The data to be obtained, and the data type corresponds to the datatype

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_get_data_conditional

**Function Declaration**

```c
int32_t hb_vio_get_data_conditional(uint32_t pipeline_id, VIO_DATA_TYPE_E data_type, void *data, int32_t times);
```

**Description**

Get the data of the corresponding pipelineid conditionally through the corresponding datatype and the set times parameter

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] VIO_DATA_TYPE_E data_type:The type of data to be obtained; data_ Type description: HB_VIO_PYM_DATA_V3,Get pym processing results. Super is the most commonly used type;
[IN] int32_t times:Set the relative time to acquire frames; Time parameter description: times = 0:Clear the current cache frame and wait for the next frame; times > 0:Find the earliest frame in the cache that meets the current time-time requirement; times < 0:Clear the current cache frame and wait for the frame after the current time – time; range:[-1056, 1056],default:0
[OUT] void *data:The data to be obtained, and the data type corresponds to the datatype

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_run_pym

**Function Declaration**

```c
int32_t hb_vio_run_pym(uint32_t pipeline_id, hb_vio_buffer_t *src_img_info);
```

**Description**

Enable pym to process the reinjection data of the corresponding pipeline

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] hb_vio_buffer_t * src_img_info:Pym memory to be processed

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_free_ipubuf

**Function Declaration**

```c
int32_t hb_vio_free_ipubuf(uint32_t pipeline_id, hb_vio_buffer_t *dst_img_info);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] hb_vio_buffer_t * dst_img_info:ipu memory to be freed

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_free_ispbuf

**Function Declaration**

```c
int32_t hb_vio_free_ispbuf(uint32_t pipeline_id, hb_vio_buffer_t *dst_img_info);
```

**Description**

Release the isp data corresponding to pipelineid, and hb_vio_get_data is used to obtain the isp data

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] hb_vio_buffer_t * dst_img_info:isp memory to be freed

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_free_pymbuf

**Function Declaration**

```c
int32_t hb_vio_free_pymbuf(uint32_t pipeline_id, VIO_DATA_TYPE_E data_type, void *img_info);
```

**Description**

Release the pym data corresponding to pipelineid, and hb_vio_get_data is used to obtain the pym data

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] VIO_DATA_TYPE_E data_type:Released data type, type description: HB_VIO_PYM_DATA_V3, Super most commonly used type;
[IN] void * dst_img_info:pym memory to be freed

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_gen_gdc_cfg

**Function Declaration**

```c
int32_t hb_vio_gen_gdc_cfg(param_t *gdc_parm, window_t *wnds, uint32_t wnd_num, void **cfg_buf, uint64_t *cfg_size);
```

**Description**

Generate the cfg bin file required for the work of the gdc module

**Parameter Description**

[OUT] cfg_buf: Generated gdc cfg bin, internal allocation
[OUT] cfg_size: Size of gdc cfg bin file

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_set_gdc_cfg

**Function Declaration**

```c
int32_t hb_vio_set_gdc_cfg(uint32_t pipeline_id, uint32_t *cfg_buf, uint64_t cfg_size);
```

**Description**

Set cfg bin of gdc module

**Parameter Description**

[IN] cfg_buf: config buffer of gdc cfg bin
[IN] cfg_size: size of gdc cfg bin

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_set_gdc_cfg_opt

**Function Declaration**

```c
int32_t hb_vio_set_gdc_cfg_opt(uint32_t pipeline_id, uint32_t gdc_id, uint32_t *cfg_buf, uint64_t cfg_size); //comp xj3
```

**Description**

Set cfg bin of gdc module

**Parameter Description**

[IN] cfg_buf: config buffer of gdc cfg bin
[IN] cfg_size: size of gdc cfg bin

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_free_gdc_cfg

**Function Declaration**

```c
void hb_vio_free_gdc_cfg(uint32_t *cfg_buf);
```

**Description**

Release the buffer of the production gdc module cfg bin

**Parameter Description**

[IN] uint32_t* cfg_buf:Buffer of gdc cfg bin

**Return Value**

None

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_run_gdc

**Function Declaration**

```c
int32_t hb_vio_run_gdc(uint32_t pipeline_id, hb_vio_buffer_t *src_img_info, hb_vio_buffer_t *dst_img_info, int32_t rotate);
```

**Description**

Enable gdc corresponding to pipelineid to correct the process distortion of src data

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] hb_vio_buffer_t * src_img_info:Input image memory needed to process gdc
[IN] int32_t rotate:Indicates the rotation angle to be processed, and supports an angle of 0,90,180,270
[OUT] hb_vio_buffer_t * dst_img_info:Out image memory of gdc after process

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_run_gdc_opt

**Function Declaration**

```c
int32_t hb_vio_run_gdc_opt(uint32_t pipeline_id, uint32_t gdc_id, hb_vio_buffer_t *src_img_info, hb_vio_buffer_t *dst_img_info, int32_t rotate);
```

**Description**

Enable gdc corresponding to pipelineid to correct the process distortion of src data

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] uint32_t gdc_id:gdc hardware id; range:[0, 1],default:0
[IN] hb_vio_buffer_t * src_img_info:Input image memory needed to process gdc
[IN] int32_t rotate:Indicates the rotation angle to be processed, and supports an angle of 0,90,180,270
[OUT] hb_vio_buffer_t * dst_img_info:Out image memory of gdc after process

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_run_gdc_adv

**Function Declaration**

```c
int32_t hb_vio_run_gdc_adv(uint32_t pipeline_id, uint32_t gdc_id, const gdc_config_t *gdc_cfg, hb_vio_buffer_t *src_img_info, hb_vio_buffer_t *dst_img_info, int32_t rotate);
```

**Description**

Enable gdc corresponding to pipelineid to correct the process distortion of src data

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] uint32_t gdc_id:gdc hardware id; range:[0, 1],default:0
[IN] const gdc_config_t *gdc_cfg:User's gdc configuration
[IN] hb_vio_buffer_t * src_img_info:Input image memory needed to process gdc
[IN] int32_t rotate:Indicates the rotation angle to be processed, and supports an angle of 0,90,180,270
[OUT] hb_vio_buffer_t * dst_img_info:Out image memory of gdc after process

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_run_gdc_adv_user

**Function Declaration**

```c
int32_t hb_vio_run_gdc_adv_user(uint32_t pipeline_id, uint32_t gdc_id, const gdc_config_t *gdc_cfg, const hb_vio_buffer_t *src_img_info, hb_vio_buffer_t *dst_img_info, int32_t rotate);
```

**Description**

Enable gdc corresponding to pipelineid to correct the process distortion of src data

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] uint32_t gdc_id]:gdc hardware id; range:[0, 1],default:0
[IN] const gdc_config_t *gdc_cfg:User's gdc configuration
[IN] hb_vio_buffer_t * src_img_info:Input image memory needed to process gdc
[IN] int32_t rotate:Indicates the rotation angle to be processed, and supports an angle of 0,90,180,270
[OUT] hb_vio_buffer_t * dst_img_info:Out image memory of gdc after process,allocated by user

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_free_gdcbuf

**Function Declaration**

```c
int32_t hb_vio_free_gdcbuf(uint32_t pipeline_id, hb_vio_buffer_t *dst_img_info);
```

**Description**

Release the gdc data corresponding to pipelineid, and hb_vio_get_data is used to obtain the gdc data

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] hb_vio_buffer_t * dst_img_info:gdc memory to be freed

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_raw_dump

**Function Declaration**

```c
int32_t hb_vio_raw_dump(uint32_t pipeline_id, hb_vio_buffer_t *raw_img, hb_vio_buffer_t *yuv);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[OUT] hb_vio_buffer_t * raw_img:raw memory to be dump
[OUT] hb_vio_buffer_t * yuv:yuv memory to be dump

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_raw_feedback

**Function Declaration**

```c
int32_t hb_vio_raw_feedback(uint32_t pipeline_id, hb_vio_buffer_t *feedback_src, hb_vio_buffer_t *isp_dst_yuv);
```

**Description**

Not support

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[OUT] hb_vio_buffer_t * feedback_src:feedback_src memory to be feedback
[OUT] hb_vio_buffer_t * isp_dst_yuv:isp_dst_yuv memory to be feedback

**Return Value**

E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_run_raw

**Function Declaration**

```c
int32_t hb_vio_run_raw(uint32_t pipeline_id, hb_vio_buffer_t *feedback_src, int32_t timeout);
```

**Description**

After the video system is initialized, hb_vio_get_data obtain the isp raw reinjection address and reinjection the external RAW image into the acquired address, enabling isp to process the reinjection data.

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0
[IN] hb_vio_buffer_t * feedback_src:Input image memory needed to process isp
[IN] int32_t timeout: timeout of process; range:[0, 2147483647],default:0

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: X3/J3/Ultra/X5/Super; SW: 1.0.0

### hb_vio_cfg_check

**Function Declaration**

```c
int32_t hb_vio_cfg_check(const char *vpm_file, const char *vin_file, uint32_t cfg_index);
```

**Description**

Check whether the vpm&amp;vin configuration file parameters are correct;

**Parameter Description**

[IN] const char* vpm_file: The absolute path of the vpm configuration file
[IN] const char* vin_file: The absolute path of the vin configuration file
[IN] uint32_t cfg_index:  The configure index of vin configuration file

**Return Value**

zero: Success
less than zero: Fail, return error code

**Compatibility**
HW: Ultra/X5/Super; SW: 1.0.0

### hb_vio_pause_pipeline

**Function Declaration**

```c
int32_t hb_vio_pause_pipeline(uint32_t pipeline_id);
```

**Description**

pause the CIM data flow of the specified software channel

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: Super; SW: 1.0.0

### hb_vio_resume_pipeline

**Function Declaration**

```c
int32_t hb_vio_resume_pipeline(uint32_t pipeline_id);
```

**Description**

resume the CIM data flow of the specified software channel

**Parameter Description**

[IN] uint32_t pipeline_id:pipeline id; range:[0, 23],default:0

**Return Value**

E_OK: Success
E_NOT_OK: Fail,return error code; range:[-10000,-1]

**Compatibility**
HW: Super; SW: 1.0.0

## Related Documentation

- [Basic Framework - HBN](./01_hbn_api.md)
- [VIO API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md)
- [Video Capture](../../../03_Demos/02_multimedia_demo/01_cdev/01_vio_capture.md)
