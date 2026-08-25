---
sidebar_position: 3
title: "Camera Interface - Camera"
description: "RDK S100/S600 5.5.1.3 Camera (Camera Interface)"
---

# Camera Interface - Camera

> **Level description**: This chapter covers the low-level multimedia API (board-side `hb_camera_interface.h`), i.e. the Camera capture entry API (function names `hbn_camera_*`), the frontmost stage of the pipeline. It is intended for advanced developers who need to directly operate the multimedia pipeline (Mode 3). If you only need the encapsulated capture/codec/display functionality, see Chapter 4 [Simple API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) (Mode 1).

> **Platform codename note**: Compatibility annotations in this document follow the original wording of the underlying header files. XJ3/J3 and Ultra are earlier-generation upstream platform codenames; X5 denotes the current upstream product line (not these two boards); Super/J6 are the codenames of the architecture family shared by this product line (board-verified: S100/S600 share the same family, with S600 in a multi-core form). An `HW:` list indicates the interface's applicable range across upstream platform generations, where the Super generation corresponds to this product line (inherited from upstream annotations, not verified per-interface on board); `SW` is the upstream software version number — for RDK releases see the Release Notes. Interfaces without codenames are inherited from upstream and not individually verified on RDK.

## Overview

Camera is the capture entry of the RDK multimedia pipeline (board header `hb_camera_interface.h`, functions `hbn_camera_*`). It wraps sensor config, channel initialization and VIN binding, forming a vflow with HBN vnodes (VIN/ISP/PYM).

## Software Abstraction

- `camera_config_t`: sensor config (MIPI/GMSL, resolution, frame rate, etc.).
- `camera_handle_t`: camera handle, used by subsequent APIs after creation.
- Camera binds to VIN via `hbn_camera_attach_to_vin`; after binding, data frames flow into the vflow.

## API Call Flow

1. `hbn_camera_create` creates a camera handle from `camera_config_t`.
2. `hbn_camera_attach_to_vin` binds to a VIN vnode (this interface initializes the hardware when there is no deserializer).
3. `hbn_camera_set_*` / `get_*` configure and retrieve parameters.
4. Once the vflow starts, frames flow automatically; `hbn_camera_destroy` destroys the handle and releases resources.

## Quick Example

The following example follows the minimal call sequence of the board-side `/app/multimedia_samples/sample_vin/get_vin_data/`, demonstrating the creation and binding of a normal sensor (MIPI direct connection):

```c
#include "hb_camera_interface.h"
#include "hbn_vpf_interface.h"

// 1. Prepare the sensor config (resolution, frame rate, MIPI channel, etc., from the sensor lib)
camera_config_t cam_config = {0};
/* Fill cam_config according to the actual sensor ... */

// 2. Open the VIN vnode and create the camera handle
hbn_vnode_handle_t vin_fd;
hbn_vnode_open(HB_VIN, mipi_rx, AUTO_ALLOC_ID, &vin_fd);

camera_handle_t cam_fd;
hbn_camera_create(&cam_config, &cam_fd);

// 3. Bind the camera to the VIN vnode
hbn_camera_attach_to_vin(cam_fd, vin_fd);

// 4. Start the camera output (frames flow automatically once the vflow starts)
hbn_camera_start(cam_fd);

/* At runtime, you can call hbn_camera_change_fps / read_register / write_register ... */

// 5. Stop and destroy
hbn_camera_stop(cam_fd);
hbn_camera_destroy(cam_fd);
```

> For GMSL/SerDes sensors, first call `hbn_deserial_create` to create a deserializer, then bind it in two steps via `hbn_camera_attach_to_deserial` + `hbn_deserial_attach_to_vin`; see `create_deserial_node` in `get_vin_data`.

## API List

| Function | Description |
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

## API Interface Description

### hbn_camera_create

**Function Declaration**

```c
extern int32_t hbn_camera_create(camera_config_t *cam_config, camera_handle_t *cam_fd);
```

**Description**

create camera handle with camera config the camera config should adapt the sensor to be used. the handle returned should be used in APIs of this lib only.

**Parameter Description**

- [IN] cam_config: camera config with camera_config_t struct range: [!NULL, !NULL], default: NA
- [OUT] cam_fd: camera handle fd created return range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_destroy

**Function Declaration**

```c
extern int32_t hbn_camera_destroy(camera_handle_t cam_fd);
```

**Description**

destroy camera handle to exit all handle created should be destroyed at last.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_attach_to_vin

**Function Declaration**

```c
extern int32_t hbn_camera_attach_to_vin(camera_handle_t cam_fd, vpf_handle_t vin_fd);
```

**Description**

attach camera handle to handle of vin node in vpf get connection info from vin and initializ the camera hardware. use it only if there is no deserial here.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [IN] vin_fd: vpf handle of vin node which vpf create returned; range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_detach_from_vin

**Function Declaration**

```c
extern int32_t hbn_camera_detach_from_vin(camera_handle_t cam_fd);
```

**Description**

detach camera handle from handle of vin node in vpf do deinitialization of camera hardware and detach from vin. use it only if there is no deserial here.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_attach_to_deserial

**Function Declaration**

```c
extern int32_t hbn_camera_attach_to_deserial(camera_handle_t cam_fd, deserial_handle_t des_fd, camera_des_link_t link);
```

**Description**

attach camera handle to handle of deserial link camera connection info inherit from deserial and initializ hardware. use it if there is a deserial which camera connected to.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [IN] des_fd: deserial handle which create returned range: [!NULL, !NULL], default: NA
- [IN] link: the link index of deserial to attach range: [0, 3], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_detach_from_deserial

**Function Declaration**

```c
extern int32_t hbn_camera_detach_from_deserial(camera_handle_t cam_fd);
```

**Description**

detach camera handle from deserial handle do deinitialization of camera hardware and detach from deserial

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_start

**Function Declaration**

```c
extern int32_t hbn_camera_start(camera_handle_t cam_fd);
```

**Description**

camera start stream to enable sensor output only operate camera sensor hardware, and not affect internal hardware.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_stop

**Function Declaration**

```c
extern int32_t hbn_camera_stop(camera_handle_t cam_fd);
```

**Description**

camera stop stream to disable sensor output only operate camera sensor hardware, and not affect internal hardware.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_reset

**Function Declaration**

```c
extern int32_t hbn_camera_reset(camera_handle_t cam_fd);
```

**Description**

camera reset operation do stop deinit and init start again to reset the camera sensor.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_change_fps

**Function Declaration**

```c
extern int32_t hbn_camera_change_fps(camera_handle_t cam_fd, int32_t fps);
```

**Description**

change frame frequency of camera sensor output only valid if sensor lib support corresponding function.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [IN] fps: frame frequency per second range: [1, 120], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_read_register

**Function Declaration**

```c
extern int32_t hbn_camera_read_register(camera_handle_t cam_fd, camera_reg_type_t type, uint32_t reg_addr);
```

**Description**

read register value from camera hardware the hardware info should configed in camera_config when created. the type should adapt the camera sensor used.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [IN] type: device type of camera sensor range: [CAMERA_SENSOR_REG], CAMERA_EEPROM_REG], default: NA
- [IN] reg_addr: address of register to read range: [0x0, 0xFFFF], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_write_register

**Function Declaration**

```c
extern int32_t hbn_camera_write_register(camera_handle_t cam_fd, camera_reg_type_t type, uint32_t reg_addr, uint32_t reg_value);
```

**Description**

write register value to camera hardware the hardware info should configed in camera_config when created. the type should adapt the camera sensor used.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [IN] type: device type of camera sensor range: [CAMERA_SENSOR_REG], CAMERA_EEPROM_REG], default: NA
- [IN] reg_addr: address of register to write range: [0x0, 0xFFFF], default: NA
- [IN] reg_value: value of register to write range: [0x0, 0xFFFF], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_read_registers

**Function Declaration**

```c
extern int32_t hbn_camera_read_registers(camera_handle_t cam_fd, camera_reg_type_t type, uint32_t *reg_addr, uint32_t *reg_value, uint32_t size_addr, uint32_t size_value);
```

**Description**

read registers array value from camera hardware the hardware info should configed in camera_config when created. the type should adapt the camera sensor used.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [IN] type: device type of camera sensor range: [CAMERA_SENSOR_REG], CAMERA_EEPROM_REG], default: NA
- [IN] reg_addr: address array of register to read range: [0x0, 0xFFFF], default: NA
- [OUT] reg_value: value array of register to read range: [0x0, 0xFFFF], default: NA
- [IN] size_addr: size of reg_addr array: 0:as block, &gt;0:as count of reg_addr range: [0x0, 64], default: NA
- [IN] size_value: size of reg_value array: 0:not read, &gt;0: count to read range: [0x0, 64], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_write_registers

**Function Declaration**

```c
extern int32_t hbn_camera_write_registers(camera_handle_t cam_fd, camera_reg_type_t type, uint32_t *reg_addr, uint32_t *reg_value, uint32_t *reg_hist, uint32_t acount, uint32_t vcount);
```

**Description**

write registers array value to camera hardware the hardware info should configed in camera_config when created. the type should adapt the camera sensor used.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [IN] type: device type of camera sensor range: [CAMERA_SENSOR_REG], CAMERA_EEPROM_REG], default: NA
- [IN] reg_addr: address array of register to write range: [0x0, 0xFFFF], default: NA
- [IN] reg_value: value array of register to write range: [0x0, 0xFFFF], default: NA
[IN/OUT] reg_hist: histroy value array of register to compare and store if optimize range: [0x0, 0xFFFF], default: NA
- [IN] acount: size of reg_addr array: 0:as block, &gt;0:as count of reg_addr range: [0x0, ~], default: NA
- [IN] vcount: size of reg_value array: 0:not write, &gt;0: count to write range: [0x0, ~], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_parse_emb

**Function Declaration**

```c
extern int32_t hbn_camera_parse_emb(camera_handle_t cam_fd, char* embed_raw, struct embed_data_info_s *embed_info);
```

**Description**

parse the embedded raw data to embed_info struct only valid if sensor lib support corresponding function.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [IN] embed_raw: raw data buffer to parse range: [!NULL, !NULL], default: NA
- [OUT] embed_info: embedded info struct to store range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_update_ae_info

**Function Declaration**

```c
extern int32_t hbn_camera_update_ae_info(camera_handle_t cam_fd, camera_ae_info_t *ae_info);
```

**Description**

update ae info to camera sensor driver only valid if sensor lib support corresponding function.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [IN] ae_info: ae info struct to update range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_get_sns_info

**Function Declaration**

```c
extern int32_t hbn_camera_get_sns_info(camera_handle_t cam_fd, camera_param_type_t type, cam_parameter_t *sp);
```

**Description**

get parameter info of camera sensor the base param from config and the internal param from eeprom hardware. only valid if sensor lib support corresponding function.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [IN] type: the param type as camera_param_type_t range: [CAMERA_SENSOR_PARAM, CAMERA_EEPROM_FULL_PARAM], default: NA
- [OUT] sp: camera param struct to store range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_set_event_callback

**Function Declaration**

```c
extern int32_t hbn_camera_set_event_callback(camera_handle_t cam_fd, void (*event_callback)(cam_event_t* fault_info));
```

**Description**

set camera event callback func

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [IN] event_callback: camera event callback func range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

### hbn_camera_get_status

**Function Declaration**

```c
extern int32_t hbn_camera_get_status(camera_handle_t cam_fd, camera_staus_t *status);
```

**Description**

get camera runtime status get the status as init status, start status, link status, recovery status, etc.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [OUT] status: camera runtime status struct to store range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_get_version

**Function Declaration**

```c
extern int32_t hbn_camera_get_version(camera_handle_t cam_fd, camera_version_type_t type, char *name, char *version);
```

**Description**

get version info of camera library version info store as sting buff with size mast larger then CAMERA_VERSON_LEN_MAX.

**Parameter Description**

- [IN] cam_fd: camera handle which create returned range: [!NULL, !NULL], default: NA
- [IN] type: library type as camera_version_type_t range: [CAMERA_CAM_VERSION, CAMERA_TXSER_VERSION], default: NA
- [OUT] name: library name string buffer to store, NULL ignore range: [NULL, !NULL], default: NA
- [OUT] version: library version string buffer to store range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_get_handle

**Function Declaration**

```c
extern camera_handle_t hbn_camera_get_handle(vpf_handle_t vin_fd, int32_t camera_port);
```

**Description**

get camera handle by vin handle attached or camera port get by vin handle if valid, else get by camera index.

**Parameter Description**

- [IN] vin_fd: vin handle if attached to get range: [NULL, !NULL], default: NA
- [IN] camera_port: camera port index range: [0, NA], default: NA

**Return Value**

!NULL-camera handle point matched, NULL-not found

**Compatibility**
HW: Super; SW: 1.0.0

### hbn_camera_init_cfg

**Function Declaration**

```c
extern int32_t hbn_camera_init_cfg(const char *cfg_file);
```

**Description**

camera init with config json file all camera and deserial config should included in json file. it will auto create camera handle and attach them.

**Parameter Description**

- [IN] cfg_file: camera config json file path range: [!NULL, !NULL], default: NA

**Return Value**

0:Success, &lt;0:Failure

**Compatibility**
HW: Super; SW: 1.0.0

## Related Documentation

- [Video Input/Output - VIO](./04_vio_api.md)
- [Camera Usage](../../../03_Demos/01_peripheral/02_camera/01_mipi_camera.md)
- [Camera Object](../../../04_Simple_API/01_multimedia_api/pydev/02_object_camera.md)
