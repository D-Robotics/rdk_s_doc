---
sidebar_position: 3
title: "5.5.1.3 相机接口 - Camera"
description: RDK S100/S600 5.5.1.3 Camera（相机接口）
---

# 5.5.1.3 相机接口 - Camera

## 概述

Camera 是 RDK 多媒体 pipeline 的采集入口（板端 `hb_camera_interface.h`，函数名 `hbn_camera_*`）。封装 sensor 配置、通道初始化与 VIN 绑定，与 HBN vnode（VIN/ISP/PYM）组成 vflow。

## 软件抽象

- `camera_config_t`：sensor 配置（mipi/gmsl、分辨率、帧率等）。
- `camera_handle_t`：camera handle，创建后用于后续 API。
- Camera 与 VIN 通过 `hbn_camera_attach_to_vin` 绑定，绑定后数据帧流入 vflow。

## API 调用流程

1. `hbn_camera_create` 用 `camera_config_t` 创建 camera handle。
2. `hbn_camera_attach_to_vin` 绑定到 VIN vnode（无 deserializer 时由此接口初始化硬件）。
3. `hbn_camera_set_*` / `get_*` 配置与获取参数。
4. vflow 启动后帧自动流转；`hbn_camera_destroy` 销毁 handle 释放资源。


## API 列表

| 函数 | 说明 |
| --- | --- |
| hbn_camera_create | create camera handle with camera config |
| hbn_camera_destroy | destroy camera handle to exit |
| hbn_camera_attach_to_vin | attach camera handle to handle of vin node in vpf |
| hbn_camera_detach_from_vin | detach camera handle from handle of vin node in vpf |
| hbn_camera_attach_to_deserial | attach camera handle to handle of deserial link |
| hbn_camera_detach_from_deserial | detach camera handle from deserial handle |
| hbn_camera_start | camera start stream to enable sensor output |
| hbn_camera_stop | camera stop stream to disable sensor output |
| hbn_camera_reset | camera reset operation |
| hbn_camera_change_fps | change frame frequency of camera sensor output |
| hbn_camera_read_register | read register value from camera hardware |
| hbn_camera_write_register | write register value to camera hardware |
| hbn_camera_read_registers | read registers array value from camera hardware |
| hbn_camera_write_registers | write registers array value to camera hardware |
| hbn_camera_parse_emb | parse the embedded raw data to embed_info struct |
| hbn_camera_update_ae_info | update ae info to camera sensor driver |
| hbn_camera_get_sns_info | get parameter info of camera sensor |
| hbn_camera_set_event_callback | set camera event callback func |
| hbn_camera_get_status | get camera runtime status |
| hbn_camera_get_version | get version info of camera library |
| hbn_camera_get_handle | get camera handle by vin handle attached or camera port |
| hbn_camera_init_cfg | camera init with config json file |

## API 接口说明

### hbn_camera_create

【函数声明】

```c
extern int32_t hbn_camera_create(camera_config_t *cam_config, camera_handle_t *cam_fd);
```

【功能描述】

create camera handle with camera config the camera config should adapt the sensor to be used. the handle returned should be used in APIs of this lib only.

【参数描述】

[IN] cam_config: camera config with camera_config_t struct range: [!NULL, !NULL], default: NA
[OUT] cam_fd: camera handle fd created return range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_destroy

【函数声明】

```c
extern int32_t hbn_camera_destroy(camera_handle_t cam_fd);
```

【功能描述】

destroy camera handle to exit all handle created should be destroyed at last.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_attach_to_vin

【函数声明】

```c
extern int32_t hbn_camera_attach_to_vin(camera_handle_t cam_fd, vpf_handle_t vin_fd);
```

【功能描述】

attach camera handle to handle of vin node in vpf get connection info from vin and initializ the camera hardware. use it only if there is no deserial here.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[IN] vin: vpf handle of vin node which vpf create returned range_fd: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_detach_from_vin

【函数声明】

```c
extern int32_t hbn_camera_detach_from_vin(camera_handle_t cam_fd);
```

【功能描述】

detach camera handle from handle of vin node in vpf do deinitialization of camera hardware and detach from vin. use it only if there is no deserial here.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_attach_to_deserial

【函数声明】

```c
extern int32_t hbn_camera_attach_to_deserial(camera_handle_t cam_fd, deserial_handle_t des_fd, camera_des_link_t link);
```

【功能描述】

attach camera handle to handle of deserial link camera connection info inherit from deserial and initializ hardware. use it if there is a deserial which camera connected to.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[IN] des_fd: deserial handle which create returned range: [!NULL, !NULL], default: NA
[IN] link: the link index of deerial to attach range: [0, 3], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_detach_from_deserial

【函数声明】

```c
extern int32_t hbn_camera_detach_from_deserial(camera_handle_t cam_fd);
```

【功能描述】

detach camera handle from deserial handle do deinitialization of camera hardware and detach from deserial

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_start

【函数声明】

```c
extern int32_t hbn_camera_start(camera_handle_t cam_fd);
```

【功能描述】

camera start stream to enable sensor output only operate camera sensor hardware, and not affect internal hardware.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_stop

【函数声明】

```c
extern int32_t hbn_camera_stop(camera_handle_t cam_fd);
```

【功能描述】

camera stop stream to disable sensor output only operate camera sensor hardware, and not affect internal hardware.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_reset

【函数声明】

```c
extern int32_t hbn_camera_reset(camera_handle_t cam_fd);
```

【功能描述】

camera reset operation do stop deinit and init start again to reset the camera sensor.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_change_fps

【函数声明】

```c
extern int32_t hbn_camera_change_fps(camera_handle_t cam_fd, int32_t fps);
```

【功能描述】

change frame frequency of camera sensor output only valid if sensor lib support corresponding function.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[IN] fps: frame frequency per second range: [1, 120], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_read_register

【函数声明】

```c
extern int32_t hbn_camera_read_register(camera_handle_t cam_fd, camera_reg_type_t type, uint32_t reg_addr);
```

【功能描述】

read register value from camera hardware the hardware info should configed in camera_config when created. the type should adapt the camera sensor used.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[IN] type: device type of camera sensor range: [CAMERA_SENSOR_REG], CAMERA_EEPROM_REG], default: NA
[IN] reg_addr: address of register to read range: [0x0, 0xFFFF], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_write_register

【函数声明】

```c
extern int32_t hbn_camera_write_register(camera_handle_t cam_fd, camera_reg_type_t type, uint32_t reg_addr, uint32_t reg_value);
```

【功能描述】

write register value to camera hardware the hardware info should configed in camera_config when created. the type should adapt the camera sensor used.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[IN] type: device type of camera sensor range: [CAMERA_SENSOR_REG], CAMERA_EEPROM_REG], default: NA
[IN] reg_addr: address of register to write range: [0x0, 0xFFFF], default: NA
[IN] reg_value: value of register to write range: [0x0, 0xFFFF], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_read_registers

【函数声明】

```c
extern int32_t hbn_camera_read_registers(camera_handle_t cam_fd, camera_reg_type_t type, uint32_t *reg_addr, uint32_t *reg_value, uint32_t size_addr, uint32_t size_value);
```

【功能描述】

read registers array value from camera hardware the hardware info should configed in camera_config when created. the type should adapt the camera sensor used.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[IN] type: device type of camera sensor range: [CAMERA_SENSOR_REG], CAMERA_EEPROM_REG], default: NA
[IN] reg_addr: address array of register to read range: [0x0, 0xFFFF], default: NA
[OUT] reg_value: value array of register to read range: [0x0, 0xFFFF], default: NA
[IN] size_addr: size of reg_addr array: 0:as block, &gt;0:as count of reg_addr range: [0x0, 64], default: NA
[IN] size_value: size of reg_value array: 0:not read, &gt;0: count to read range: [0x0, 64], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_write_registers

【函数声明】

```c
extern int32_t hbn_camera_write_registers(camera_handle_t cam_fd, camera_reg_type_t type, uint32_t *reg_addr, uint32_t *reg_value, uint32_t *reg_hist, uint32_t acount, uint32_t vcount);
```

【功能描述】

write registers array value to camera hardware the hardware info should configed in camera_config when created. the type should adapt the camera sensor used.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[IN] type: device type of camera sensor range: [CAMERA_SENSOR_REG], CAMERA_EEPROM_REG], default: NA
[IN] reg_addr: address array of register to write range: [0x0, 0xFFFF], default: NA
[IN] reg_value: value array of register to write range: [0x0, 0xFFFF], default: NA
[IN] size_addr: size of reg_addr array: 0:as block, &gt;0:as count of reg_addr range: [0x0, ~], default: NA
[IN] size_value: size of reg_value array: 0:not write, &gt;0: count to write range: [0x0, ~], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_parse_emb

【函数声明】

```c
extern int32_t hbn_camera_parse_emb(camera_handle_t cam_fd, char* embed_raw, struct embed_data_info_s *embed_info);
```

【功能描述】

parse the embedded raw data to embed_info struct only valid if sensor lib support corresponding function.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[IN] embed_raw: raw data buffer to parse range: [!NULL, !NULL], default: NA
[OUT] embed_info: embedded info struct to store range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_update_ae_info

【函数声明】

```c
extern int32_t hbn_camera_update_ae_info(camera_handle_t cam_fd, camera_ae_info_t *ae_info);
```

【功能描述】

update ae info to camera sensor driver only valid if sensor lib support corresponding function.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[IN] ae_info: ae info struct to update range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_get_sns_info

【函数声明】

```c
extern int32_t hbn_camera_get_sns_info(camera_handle_t cam_fd, camera_param_type_t type, cam_parameter_t *sp);
```

【功能描述】

get parameter info of camera sensor the base param from config and the internal param from eeprom hardware. only valid if sensor lib support corresponding function.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[IN] type: the param type as camera_param_type_t range: [CAMERA_SENSOR_PARAM, CAMERA_EEPROM_FULL_PARAM], default: NA
[OUT] sp: camera param struct to store range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_set_event_callback

【函数声明】

```c
extern int32_t hbn_camera_set_event_callback(camera_handle_t cam_fd, void (*event_callback)(cam_event_t* fault_info));
```

【功能描述】

set camera event callback func

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[IN] event_callback: camera event callback func range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

### hbn_camera_get_status

【函数声明】

```c
extern int32_t hbn_camera_get_status(camera_handle_t cam_fd, camera_staus_t *status);
```

【功能描述】

get camera runtime status get the status as init status, start status, link status, recovery status, etc.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[OUT] status: camera runtime status struct to store range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_get_version

【函数声明】

```c
extern int32_t hbn_camera_get_version(camera_handle_t cam_fd, camera_version_type_t type, char *name, char *version);
```

【功能描述】

get version info of camera library version info store as sting buff with size mast larger then CAMERA_VERSON_LEN_MAX.

【参数描述】

[IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
[IN] type: library type as camera_version_type_t range: [CAMERA_CAM_VERSION, CAMERA_TXSER_VERSION], default: NA
[OUT] name: library name string buffer to store, NULL ignore range: [NULL, !NULL], default: NA
[OUT] version: library version string buffer to store range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_get_handle

【函数声明】

```c
extern camera_handle_t hbn_camera_get_handle(vpf_handle_t vin_fd, int32_t camera_port);
```

【功能描述】

get camera handle by vin handle attached or camera port get by vin handle if valid, else get by camera index.

【参数描述】

[IN] vin_fd: vin handle if attached to get range: [NULL, !NULL], default: NA
[IN] camera_port: camera port index range: [0, NA], default: NA

【返回值】

!NULL-camera handle point matched, NULL-not found

【兼容性】
HW: Super; SW: 1.0.0

### hbn_camera_init_cfg

【函数声明】

```c
extern int32_t hbn_camera_init_cfg(const char *cfg_file);
```

【功能描述】

camera init with config json file all camera and deserial config should included in json file. it will auto create camera handle and attach them.

【参数描述】

[IN] cfg_file: camera config json file path range: [!NULL, !NULL], default: NA

【返回值】

0:Success, &lt;0:Failure

【兼容性】
HW: Super; SW: 1.0.0

## 相关文档

- [5.5.1.4 视频输入输出 - VIO](/Advanced_development/multimedia_development/multimedia_api/vio_api)
- [3.1.2 摄像头使用](/Demos/peripheral/camera/mipi_camera)
- [4.1.2.2 Camera 对象](/Simple_API/multimedia_api/pydev/object_camera)
