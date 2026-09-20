---
sidebar_position: 1
title: "Base Framework - HBN"
description: "RDK S100/S600 Multimedia Base Framework HBN API"
---

# Base Framework - HBN

> **Level description**: This chapter covers the **low-level multimedia API** (board-side `hbn_vpf_interface.h`) — the HBN vnode abstraction layer API, a unified node interface for all modules after the Camera (VIN/ISP/PYM/GDC). It is intended for advanced developers who need to directly operate the multimedia pipeline (Mode 3). If you only need the encapsulated capture/codec/display functionality, see Chapter 4 [Simple API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) (Mode 1).





> **Platform codename note**: Compatibility annotations in this document follow the original wording of the underlying header files. XJ3/J3 and Ultra are earlier-generation upstream platform codenames; X5 denotes the current upstream product line (not these two boards); Super/J6 are the codenames of the architecture family shared by this product line (board-verified: S100/S600 share the same family, with S600 in a multi-core form). An `HW:` list indicates the interface's applicable range across upstream platform generations, where the Super generation corresponds to this product line (inherited from upstream annotations, not verified per-interface on board); `SW` is the upstream software version number — for RDK releases see the Release Notes. Interfaces without codenames are inherited from upstream and not individually verified on RDK.

## Overview

In software, the Camera uses a dedicated set of APIs. Modules downstream of the Camera are abstracted as vnodes. These vnodes include VIN, ISP, PYM, and GDC.  
Multiple vnodes form a vflow (similar to a pipeline). The Camera and VIN are bound together via the attach interface.  
Users only need to call HBN APIs to initialize and bind modules. Once the vflow is created and started, users do not need to manage frame data transfer—the SDK internally passes frames from upstream to downstream.

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/28afb7cb9d1a5de6c889657a0e548e82-en.jpg" alt="Description diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

A vflow consists of one or more vnodes. Each vnode has one input channel and one or more output channels.

Example API usage:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/492ed46bde119b791326f621b9f5b064-en.jpg" alt="Description diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />



## Software Abstraction

HBN abstracts the hardware modules after the Camera (VIN, ISP, PYM, GDC) as vnodes; each vnode corresponds to one hardware module. Multiple vnodes form a vflow (similar to a pipeline). The Camera and VIN are bound together via the attach interface. Once the vflow is created and started, data frames are passed from upstream to downstream internally by the SDK — no manual frame passing is required.

## vnode Connection

### Output Channel

A vnode has one input channel and one or more output channels; the output channel IDs are described in each module's channel description.

### Connection Method

Use `hbn_vflow_bind_vnode` to bind the output channel of the upstream vnode to the input channel of the downstream vnode, forming a vflow.

### Parameter Configuration

Module basic attributes are passed in structures ending with `<module_name>_attr_t`, extended attributes with `<module_name>_attr_ex_t`, and channel attributes with `<module_name>_ochn_attr_t`/`<module_name>_ichn_attr_t`.

## API List

| Function | Description |
| --- | --- |
| hbn_vnode_open | Open the module device node and return the vnode handle |
| hbn_vnode_close | Close the module device node |
| hbn_vnode_set_attr / get_attr | Set/get module basic attributes |
| hbn_vnode_set_attr_ex / get_attr_ex | Set/get module extended attributes (can be dynamically set at runtime) |
| hbn_vnode_set_ochn_attr / get_ochn_attr | Set/get output channel attributes |
| hbn_vnode_set_ochn_attr_ex | Set output channel extended attributes |
| hbn_vnode_set_ichn_attr / get_ichn_attr | Set/get input channel attributes |
| hbn_vnode_set_ochn_buf_attr | Set output channel buffer attributes |
| hbn_vnode_start / stop | Start/stop the module |
| hbn_vnode_getframe / releaseframe | Get/release the output channel image (single layer) |
| hbn_vnode_getframe_group / releaseframe_group | Get/release multi-layer aggregated images (used by ISP, PYM outputs) |
| hbn_vnode_sendframe / sendframe_async | Send an image to the input channel (synchronous/asynchronous) |
| hbn_vflow_create / destroy | Create/destroy a vflow |
| hbn_vflow_add_vnode | Add a vnode to the vflow |
| hbn_vflow_bind_vnode | Bind upstream/downstream vnode channels |
| hbn_vnode_set_attr_s | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_get_attr_s | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_set_attr_ex_s | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_get_attr_ex_s | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_set_ochn_attr_s | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_set_ochn_attr_ex_s | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_get_ochn_attr_s | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_set_ichn_attr_s | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_set_ichn_attr_ex_s | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_get_ichn_attr_s | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_enable_ichn | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_disable_ichn | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_enable_ochn | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_disable_ochn | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_reset | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_get_fd | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_getframe_cond | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_getframe_group_cond | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_sendframe_async | Board extension (see hbn_vpf_interface.h) |
| hbn_vflow_create_cfg | Board extension (see hbn_vpf_interface.h) |
| hbn_vflow_del_vnode | Board extension (see hbn_vpf_interface.h) |
| hbn_vflow_pause | Board extension (see hbn_vpf_interface.h) |
| hbn_vflow_resume | Board extension (see hbn_vpf_interface.h) |
| hbn_vflow_get_version | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_set_output_frame | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_set_output_groupframe | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_sendframe_group | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_get_output_groupframe | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_get_output_frame | Board extension (see hbn_vpf_interface.h) |
| hbn_vflow_get_fd | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_set_ctrl | Board extension (see hbn_vpf_interface.h) |
| hbn_vnode_get_ctrl | Board extension (see hbn_vpf_interface.h) |

## API Call Flow

### Creation Flow

1. `hbn_vnode_open` opens each module and obtains the vnode handle.
2. `hbn_vnode_set_attr` / `set_ochn_attr` / `set_ichn_attr` configure the module and channel attributes.
3. `hbn_vflow_create` creates the vflow, `hbn_vflow_add_vnode` adds each vnode, and `hbn_vflow_bind_vnode` binds the upstream/downstream channels.
4. `hbn_vnode_start` starts each module; the vflow begins passing data frames.
5. `hbn_vnode_getframe` / `getframe_group` retrieve the output image; return it with `releaseframe` / `releaseframe_group` after processing.

### Destruction Flow

1. `hbn_vnode_stop` stops each module.
2. `hbn_vflow_destroy` destroys the vflow (vnodes already chained into the vflow need no separate `hbn_vnode_close`; independently used modules such as GDC loopback need a separate close).

## Quick Example

The following example follows the minimal call sequence of the board-side `/app/multimedia_samples/sample_isp/get_isp_data/`, demonstrating the creation, start and frame retrieval of a VIN→ISP two-level vflow:

```c
#include "hbn_vpf_interface.h"
#include "hb_mem_mgr.h"

hbn_vnode_handle_t vin_fd, isp_fd;
hbn_vflow_handle_t vflow_fd;

// 1. Open the VIN / ISP modules
hbn_vnode_open(HB_VIN, mipi_rx, AUTO_ALLOC_ID, &vin_fd);
hbn_vnode_open(HB_ISP, 0, AUTO_ALLOC_ID, &isp_fd);

// 2. Configure module attributes and channel attributes
hbn_vnode_set_attr(vin_fd, &vin_attr);
hbn_vnode_set_ichn_attr(vin_fd, 0, &vin_ichn_attr);
hbn_vnode_set_ochn_attr(vin_fd, 0, &vin_ochn_attr);
hbn_vnode_set_attr(isp_fd, &isp_attr);
hbn_vnode_set_ichn_attr(isp_fd, 0, &isp_ichn_attr);
hbn_vnode_set_ochn_attr(isp_fd, 0, &isp_ochn_attr);

// 3. Create the vflow, add vnodes and bind upstream/downstream channels
hbn_vflow_create(&vflow_fd);
hbn_vflow_add_vnode(vflow_fd, vin_fd);
hbn_vflow_add_vnode(vflow_fd, isp_fd);
hbn_vflow_bind_vnode(vflow_fd, vin_fd, 0, isp_fd, 0);

// 4. Start the vflow; data frames automatically flow from VIN to ISP
hbn_vflow_start(vflow_fd);

// 5. Retrieve frames from the ISP output channel and return them after processing
hbn_vnode_image_group_t out_group;
hbn_vnode_getframe_group(isp_fd, 0, 10000, &out_group);
/* Process out_group ... */
hbn_vnode_releaseframe_group(isp_fd, 0, &out_group);

// 6. Stop and destroy
hbn_vflow_stop(vflow_fd);
hbn_vflow_destroy(vflow_fd);
```


## API Interface Description

### hbn_vnode_open

**Function Declaration**

hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id, int32_t ctx_id, hbn_vnode_handle_t *vnode_fd)

**Parameter Description**

- [IN] hb_vnode_type vnode_type: Vnode type. Each hardware module corresponds to a specific vnode type, such as HB_VIN, HB_ISP, HB_PYM, etc.

- [IN] uint32_t hw_id: Hardware ID of the module.

- [IN] uint32_t ctx_id: Context ID of the module (a software concept). You can either specify a context ID or set it to AUTO_ALLOC_ID to let the SDK allocate one automatically.

- [OUT] hbn_vnode_handle_t *vnode_fd: Returns the vnode handle of the module.

**Return Value**

Success: HBN_STATUS_SUCESS (0)  
Failure: Negative error code; refer to the Return Value Description table.

**Description**

Initializes a specific module, opens its device node, and returns the module's vnode handle.

**Notes**

None.

### hbn_vnode_close

**Function Declaration**

void hbn_vnode_close(hbn_vnode_handle_t vnode_fd)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: Vnode handle of the module.

**Return Value**

None

**Description**

Closes the module's device node.

**Notes**

If hbn_vflow_destroy has been called, there is no need to call hbn_vnode_close.  
hbn_vnode_close should only be used when a module is used independently (e.g., GDC loopback). If the module is part of a vflow, calling hbn_vflow_destroy is sufficient—do not call hbn_vnode_close.

### hbn_vnode_set_attr

**Function Declaration**

hobot_status hbn_vnode_set_attr(hbn_vnode_handle_t vnode_fd, void *attr)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: Vnode handle of the module.

- [IN] void *attr: Pointer to the module's basic attribute structure. This structure can be vin_attr_t, isp_attr_t, pym_attr_t, etc.—i.e., any structure named \<module_name\>_attr_t.

**Return Value**

Success: HBN_STATUS_SUCESS (0)  
Failure: Negative error code; refer to the Return Value Description table.

**Description**

Sets the basic attributes of a module.

**Notes**

None.

### hbn_vnode_get_attr

**Function Declaration**

hobot_status hbn_vnode_get_attr(hbn_vnode_handle_t vnode_fd, void *attr)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: Vnode handle of the module.

- [OUT] void *attr: Pointer to the module's basic attribute structure (e.g., vin_attr_t, isp_attr_t, pym_attr_t, etc.).*attr: Pointer to the basic attribute structure of the module. The basic attribute structure can be vin_attr_t, isp_attr_t, pym_attr_t, etc.—any attribute structure named with the module name followed by _attr_t.

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Obtains the basic attributes of a module.

**Notes**

None

### hbn_vnode_set_attr_ex

**Function Declaration**

hobot_status hbn_vnode_set_attr_ex(hbn_vnode_handle_t vnode_fd, void *attr)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

- [IN] void *attr: Pointer to the extended attribute structure of the module. The extended attribute structure can be vin_attr_ex_t, etc.—any attribute structure named with the module name followed by _attr_ex_t;

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Sets the extended attributes of a module, which can be dynamically configured during application runtime.

**Notes**

None

### hbn_vnode_get_attr_ex

**Function Declaration**

hobot_status hbn_vnode_get_attr_ex(hbn_vnode_handle_t vnode_fd, void *attr)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

- [OUT] void  
*attr: Pointer to the extended attribute structure of the module. The extended attribute structure can be vin_attr_ex_t, etc.—any attribute structure named with the module name followed by _attr_ex_t;

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Obtains the extended attributes of a module.

**Notes**

None

### hbn_vnode_set_ochn_attr

**Function Declaration**

hobot_status hbn_vnode_set_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t  
ochn_id, void *attr)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

- [IN] uint32_t ochn_id: Output channel ID of the module; refer to the module channel description for valid channel IDs;

- [IN] void *attr: Pointer to the output channel attribute structure of the module. The output channel attribute can be vin_ochn_attr_t, isp_ochn_attr_t, etc.—any attribute structure named with the module name followed by _ochn_attr_t;

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Sets the output channel attributes of a module.

**Notes**

None

### hbn_vnode_get_ochn_attr

**Function Declaration**

hobot_status hbn_vnode_get_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t  
ochn_id, void *attr)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

- [IN] uint32_t ochn_id: Output channel ID of the module; refer to the module channel description for valid channel IDs;

- [OUT] void *attr: Pointer to the output channel attribute structure of the module. The output channel attribute can be vin_ochn_attr_t, isp_ochn_attr_t, etc.—any attribute structure named with the module name followed by _ochn_attr_t;

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Obtains the output channel attributes of a module.

**Notes**

None

### hbn_vnode_set_ochn_attr_ex

**Function Declaration**

hobot_status hbn_vnode_set_ochn_attr_ex(hbn_vnode_handle_t vnode_fd, uint32_t  
ochn_id, void *attr)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

- [IN] uint32_t ochn_id: Output channel ID of the module; refer to the module channel description for valid channel IDs;

- [IN] void *attr: Pointer to the extended output channel attribute structure of the module. The extended output channel attribute can be pym_ochn_attr_ex_t, etc.—any attribute structure named with the module name followed by _ochn_attr_ex_t;

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Sets the extended output channel attributes of a module, which can be dynamically configured during application runtime.

**Notes**

None

### hbn_vnode_set_ichn_attr

**Function Declaration**

hobot_status hbn_vnode_set_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t  
ichn_id, void *attr)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

- [IN] uint32_t ichn_id: Input channel ID of the module; refer to the module channel description for valid channel IDs;

- [IN] void *attr: Pointer to the input channel attribute structure of the module. The input channel attribute can be vin_ichn_attr_t, isp_ichn_attr_t, etc.—any attribute structure named with the module name followed by _ichn_attr_t;

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Sets the input channel attributes of a module.

**Notes**

None

### hbn_vnode_get_ichn_attr

**Function Declaration**

hobot_status hbn_vnode_get_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t  
ichn_id, void *attr)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;[IN] uint32_t ichn_id: Input channel ID of the module; refer to the module channel description for channel IDs.

- [OUT] void *attr: Pointer to the input channel attribute structure of the module. The input channel attributes can be vin_ichn_attr_t, isp_ichn_attr_t, etc.—any attribute ending with the module name followed by _ichn_attr_t.

**Return Value**

Success: HBN_STATUS_SUCCESS 0  
Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Obtain the input channel attributes of the module.

**Notes**

None

### hbn_vnode_set_ochn_buf_attr

**Function Declaration**

hobot_status hbn_vnode_set_ochn_buf_attr(hbn_vnode_handle_t vnode_fd, uint32_t  
ochn_id, hbn_buf_alloc_attr_t *alloc_attr)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

- [IN] uint32_t ochn_id: Output channel ID of the module; refer to the module channel description for channel IDs;

- [IN] hbn_buf_alloc_attr_t *alloc_attr: Buffer allocation attributes;

**Return Value**

Success: HBN_STATUS_SUCCESS 0  
Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Set the buffer attributes for the output channel.

**Notes**

None

### hbn_vnode_start

**Function Declaration**

hobot_status hbn_vnode_start(hbn_vnode_handle_t vnode_fd)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

**Return Value**

Success: HBN_STATUS_SUCCESS 0  
Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Start the module.

**Notes**

The module must be opened before starting.

### hbn_vnode_stop

**Function Declaration**

hobot_status hbn_vnode_stop(hbn_vnode_handle_t vnode_fd)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

**Return Value**

Success: HBN_STATUS_SUCCESS 0  
Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Stop the module.

**Notes**

None

### hbn_vnode_getframe

**Function Declaration**

hobot_status hbn_vnode_getframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,  
uint32_t millisecondTimeout, hbn_vnode_image_t *out_img)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

- [IN] uint32_t ochn_id: Output channel ID of the module; refer to the module channel description for channel IDs;

- [IN] uint32_t millisecondTimeout: Timeout waiting period (in milliseconds);

- [OUT] hbn_vnode_image_t *out_img: Address of the output image buffer structure;

**Return Value**

Success: HBN_STATUS_SUCCESS 0  
Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Retrieve an image from the module's output channel; this is a blocking interface.

**Notes**

None

### hbn_vnode_releaseframe

**Function Declaration**

hobot_status hbn_vnode_releaseframe(hbn_vnode_handle_t vnode_fd, uint32_t  
ochn_id, hbn_vnode_image_t *img)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

- [IN] uint32_t ochn_id: Output channel ID of the module; refer to the module channel description for channel IDs;

- [IN] hbn_vnode_image_t *img: Address of the image buffer structure;

**Return Value**

Success: HBN_STATUS_SUCCESS 0  
Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Release the image buffer; the buffer will be returned to the specified output channel.

**Notes**

None

### hbn_vnode_getframe_group

**Function Declaration**

hobot_status hbn_vnode_getframe_group(hbn_vnode_handle_t vnode_fd, uint32_t  
ochn_id, uint32_t millisecondTimeout, hbn_vnode_image_group_t *out_img);

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

- [IN] uint32_t ochn_id: Output channel ID of the module; refer to the module channel description for channel IDs;

- [IN] uint32_t millisecondTimeout: Timeout waiting period (in milliseconds);

- [OUT] hbn_vnode_image_group_t *out_img: Address of the output image buffer structure;

**Return Value**

Success: HBN_STATUS_SUCCESS 0  
Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Retrieve a multi-layer aggregated image from the module's output channel; this is a blocking interface.

**Notes**

This interface must be used to obtain output images from ISP and PYM.

### hbn_vnode_releaseframe_group

**Function Declaration**

hobot_status hbn_vnode_releaseframe_group(hbn_vnode_handle_t vnode_fd, uint32_t  
ochn_id, hbn_vnode_image_group_t *img)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: vnode handle of the module;

- [IN] uint32_t ochn_id: Output channel ID of the module; refer to the module channel description for channel IDs;  
- [IN] hbn_vnode_image_t *img: Address of the image buffer structure;

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Releases a multi-layer aggregated image buffer. The buffer will be returned to the specified output channel.

**Notes**

None

### hbn_vnode_sendframe

**Function Declaration**

hobot_status hbn_vnode_sendframe(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
hbn_vnode_image_t *img)

**Parameter Description**

- [IN] hbn_vnode_handle_t vnode_fd: Vnode handle of the module;

- [IN] uint32_t ichn_id: Input channel ID of the module; refer to the module channel description for channel IDs;

- [IN] hbn_vnode_image_t *img: Address of the input image buffer;

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Sends an image to the input channel of the module, triggering the module to process it. This is a blocking API that waits until hardware processing completes before returning, with a default timeout of 1 second.

**Notes**

None

### hbn_vflow_create

**Function Declaration**

hobot_status hbn_vflow_create(hbn_vflow_handle_t *vflow_fd)

**Parameter Description**

- [OUT] hbn_vflow_handle_t *vflow_fd: Vflow handle;

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Creates a vflow and returns the vflow handle.

**Notes**

None

### hbn_vflow_destroy

**Function Declaration**

void hbn_vflow_destroy(hbn_vflow_handle_t vflow_fd)

**Parameter Description**

- [IN] hbn_vflow_handle_t *vflow_fd: Vflow handle;

**Return Value**

None

**Description**

Destroys a vflow based on the provided vflow handle.

**Notes**

None

### hbn_vflow_add_vnode

**Function Declaration**

hobot_status hbn_vflow_add_vnode(hbn_vflow_handle_t vflow_fd, hbn_vnode_handle_t
vnode_fd)

**Parameter Description**

- [IN] hbn_vflow_handle_t *vflow_fd: Vflow handle;

- [IN] hbn_vnode_handle_t vnode_fd: Vnode handle of the module;

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Adds a module into the vflow for management by the vflow.

**Notes**

None

### hbn_vflow_bind_vnode

**Function Declaration**

hobot_status hbn_vflow_bind_vnode(hbn_vflow_handle_t vflow_fd,
hbn_vnode_handle_t src_vnode_fd, uint32_t out_chn, hbn_vnode_handle_t
dst_vnode_fd, uint32_t in_chn)

**Parameter Description**

- [IN] hbn_vflow_handle_t *vflow_fd: Vflow handle;

- [IN] hbn_vnode_handle_t src_vnode_fd: Vnode handle of the source module;

- [IN] uint32_t out_chn: Output channel ID of the source module; refer to the module channel description for channel IDs;

- [IN] hbn_vnode_handle_t dst_vnode_fd: Vnode handle of the destination module;

- [IN] uint32_t in_chn: Input channel ID of the destination module; refer to the module channel description for channel IDs;

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Binds two modules together. After binding, data frames from the src_vnode_fd module will automatically flow to the dst_vnode_fd module.

**Notes**

The flow must be created, and the modules must be opened.

### hbn_vflow_unbind_vnode

**Function Declaration**

hobot_status hbn_vflow_unbind_vnode(hbn_vflow_handle_t vflow_fd,
hbn_vnode_handle_t src_vnode_fd, uint32_t out_chn, hbn_vnode_handle_t
dst_vnode_fd, uint32_t in_chn)

**Parameter Description**

- [IN] hbn_vflow_handle_t *vflow_fd: Vflow handle;

- [IN] hbn_vnode_handle_t src_vnode_fd: Vnode handle of the source module;

- [IN] uint32_t out_chn: Output channel ID of the source module; refer to the module channel description for channel IDs;

- [IN] hbn_vnode_handle_t dst_vnode_fd: Vnode handle of the destination module;

- [IN] uint32_t in_chn: Input channel ID of the destination module; refer to the module channel description for channel IDs;

**Return Value**

Success: HBN_STATUS_SUCCESS 0

Failure: Negative error code for exceptions; refer to the return value description.

**Description**

Unbinds the src_vnode_fd and dst_vnode_fd modules.

**Notes**

Not supported currently.

### hbn_vflow_start

**Function Declaration**

hobot_status hbn_vflow_start(hbn_vflow_handle_t vflow_fd)

**Parameter Description**

- [IN] hbn_vflow_handle_t vflow_fd: Vflow handle;

**Return Value**

Success: HBN_STATUS_SUCCESS 0  
Failure: Exception indicated by a negative error code; refer to the return value description.

**Description**

Start a vflow. All vnodes contained within the vflow will be started.

**Notes**

The module vnode must be added to the vflow in advance.

### hbn_vflow_stop

**Function Declaration**

hobot_status hbn_vflow_stop(hbn_vflow_handle_t vflow_fd)

**Parameter Description**

- [IN] hbn_vflow_handle_t vflow_fd: vflow handle;

**Return Value**

Success: HBN_STATUS_SUCCESS 0  
Failure: Exception indicated by a negative error code; refer to the return value description.

**Description**

Stop a vflow. All vnodes contained within the vflow will be stopped.

**Notes**

This function should be used in pair with hbn_vflow_start.

### hbn_vflow_get_vnode_handle

**Function Declaration**

hbn_vnode_handle_t hbn_vflow_get_vnode_handle(hbn_vflow_handle_t vflow_fd,  
hb_vnode_type vnode_type, uint32_t index)

**Parameter Description**

- [IN] hbn_vflow_handle_t vflow_fd: vflow handle;  
- [IN] hb_vnode_type vnode_type: module ID;  
- [IN] uint32_t index: context ID, range [0, 7]

**Return Value**

Success: HBN_STATUS_SUCCESS 0  
Failure: Exception indicated by a negative error code; refer to the return value description.

**Description**

Obtain the vnode handle via module ID and context ID.

**Notes**

The module must be opened in advance.



## Board-Extended Functions

The following functions are taken from the board-side `hbn_vpf_interface.h` (no doxygen, signatures only); together with the base set above, they form the complete HBN vnode/vflow API:


### hbn_vnode_set_attr_s

**Function Declaration**

```c
hobot_status hbn_vnode_set_attr_s(hbn_vnode_handle_t vnode_fd, void *attr, size_t size);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_get_attr_s

**Function Declaration**

```c
hobot_status hbn_vnode_get_attr_s(hbn_vnode_handle_t vnode_fd, void *attr, size_t size);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_set_attr_ex_s

**Function Declaration**

```c
hobot_status hbn_vnode_set_attr_ex_s(hbn_vnode_handle_t vnode_fd, void *attr, size_t size);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_get_attr_ex_s

**Function Declaration**

```c
hobot_status hbn_vnode_get_attr_ex_s(hbn_vnode_handle_t vnode_fd, void *attr, size_t size);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_set_ochn_attr_s

**Function Declaration**

```c
hobot_status hbn_vnode_set_ochn_attr_s(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr, size_t size);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_set_ochn_attr_ex_s

**Function Declaration**

```c
hobot_status hbn_vnode_set_ochn_attr_ex_s(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr, size_t size);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_get_ochn_attr_s

**Function Declaration**

```c
hobot_status hbn_vnode_get_ochn_attr_s(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr, size_t size);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_set_ichn_attr_s

**Function Declaration**

```c
hobot_status hbn_vnode_set_ichn_attr_s(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, void *attr, size_t size);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_set_ichn_attr_ex_s

**Function Declaration**

```c
hobot_status hbn_vnode_set_ichn_attr_ex_s(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, void *attr, size_t size);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_get_ichn_attr_s

**Function Declaration**

```c
hobot_status hbn_vnode_get_ichn_attr_s(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, void *attr, size_t size);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_enable_ichn

**Function Declaration**

```c
hobot_status hbn_vnode_enable_ichn(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_disable_ichn

**Function Declaration**

```c
hobot_status hbn_vnode_disable_ichn(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_enable_ochn

**Function Declaration**

```c
hobot_status hbn_vnode_enable_ochn(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_disable_ochn

**Function Declaration**

```c
hobot_status hbn_vnode_disable_ochn(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_reset

**Function Declaration**

```c
hobot_status hbn_vnode_reset(hbn_vnode_handle_t vnode_fd);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_get_fd

**Function Declaration**

```c
hobot_status hbn_vnode_get_fd(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, int32_t *fd);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_getframe_cond

**Function Declaration**

```c
hobot_status hbn_vnode_getframe_cond(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, uint32_t millisecondTimeout, int32_t cond_time, hbn_vnode_image_t *out_img); // block function;
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_getframe_group_cond

**Function Declaration**

```c
hobot_status hbn_vnode_getframe_group_cond(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, uint32_t millisecondTimeout, int32_t cond_time, hbn_vnode_image_group_t *out_img); // block function;
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_sendframe_async

**Function Declaration**

```c
hobot_status hbn_vnode_sendframe_async(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, hbn_vnode_image_t *img); // no block function
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vflow_create_cfg

**Function Declaration**

```c
hobot_status hbn_vflow_create_cfg(const char *cfg_file, hbn_vflow_handle_t *vflow_fd);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vflow_del_vnode

**Function Declaration**

```c
hobot_status hbn_vflow_del_vnode(hbn_vflow_handle_t vflow_fd, hbn_vnode_handle_t vnode_fd);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vflow_pause

**Function Declaration**

```c
hobot_status hbn_vflow_pause(hbn_vflow_handle_t vflow_fd);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vflow_resume

**Function Declaration**

```c
hobot_status hbn_vflow_resume(hbn_vflow_handle_t vflow_fd);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vflow_get_version

**Function Declaration**

```c
hobot_status hbn_vflow_get_version(hbn_version_t *version);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_set_output_frame

**Function Declaration**

```c
hobot_status hbn_vnode_set_output_frame(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_t *img);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_set_output_groupframe

**Function Declaration**

```c
hobot_status hbn_vnode_set_output_groupframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_group_t *img_group);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_sendframe_group

**Function Declaration**

```c
hobot_status hbn_vnode_sendframe_group(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id, hbn_vnode_image_group_t *img_group);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_get_output_groupframe

**Function Declaration**

```c
hobot_status hbn_vnode_get_output_groupframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_group_t *img_group);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_get_output_frame

**Function Declaration**

```c
hobot_status hbn_vnode_get_output_frame(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id, hbn_vnode_image_t *img);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vflow_get_fd

**Function Declaration**

```c
hobot_status hbn_vflow_get_fd(hbn_vflow_handle_t *vflow_fd);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_set_ctrl

**Function Declaration**

```c
hobot_status hbn_vnode_set_ctrl(hbn_vnode_handle_t vnode_fd, vpf_ext_ctrl_t *ext_ctrl);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).

### hbn_vnode_get_ctrl

**Function Declaration**

```c
hobot_status hbn_vnode_get_ctrl(hbn_vnode_handle_t vnode_fd, vpf_ext_ctrl_t *ext_ctrl);
```

**Description**

See the board-side `hbn_vpf_interface.h` (no doxygen; signature taken from the header).


## Parameter Description

**Common**

hbn_vnode_image_t

| Name     | Type                 | Description          | Max Value | Min Value | Default | Required |
|----------|----------------------|----------------------|-----------|-----------|---------|----------|
| info     | hbn_frame_info_t     | Image info structure | –         | –         | –       | –        |
| buffer   | hb_mem_graphic_buf_t | Image memory info    | –         | –         | –       | –        |
| metadata | void *               | Metadata             | –         | –         | –       | –        |

hbn_frame_info_t

| Name        | Type           | Description                    | Max Value | Min Value | Default | Required |
|-------------|----------------|--------------------------------|-----------|-----------|---------|----------|
| frame_id    | uint32_t       | Frame ID                       | –         | –         | –       | –        |
| timestamps  | uint64_t       | System timestamp               | –         | –         | –       | –        |
| tv          | struct timeval | Hardware timestamp             | –         | –         | –       | –        |
| trig_tv     | struct timeval | External-triggered hardware timestamp | –   | –         | –       | –        |
| bufferindex | int32_t        | Buffer index                   | –         | –         | –       | –        |

hb_mem_graphic_buf_t

| Name                            | Type       | Description                          | Max Value | Min Value | Default | Required |
|---------------------------------|------------|--------------------------------------|-----------|-----------|---------|----------|
| fd[MAX_GRAPHIC_BUF_COMP]        | int32_t    | File descriptor                      | –         | –         | –       | –        |
| plane_cnt                       | int32_t    | Number of planes                     | –         | –         | –       | –        |
| format                          | int32_t    | Image format                         | –         | –         | –       | –        |
| width                           | int32_t    | Width                                | –         | –         | –       | –        |
| height                          | int32_t    | Height                               | –         | –         | –       | –        |
| stride                          | int32_t    | Width stride                         | –         | –         | –       | –        |
| vstride                         | int32_t    | Height stride                        | –         | –         | –       | –        |
| is_contig                       | int32_t    | Whether buffer physical address is contiguous | – | – | – | – |
| share_id[MAX_GRAPHIC_BUF_COMP]  | int32_t    | Share ID                             | –         | –         | –       | –        |
| flags                           | int64_t    | Flags                                | –         | –         | –       | –        |
| size[MAX_GRAPHIC_BUF_COMP]      | uint64_t   | Buffer size                          | –         | –         | –       | –        |
| virt_addr[MAX_GRAPHIC_BUF_COMP] | uint8_t *  | Virtual address                      | –         | –         | –       | –        |
| phys_addr[MAX_GRAPHIC_BUF_COMP] | uint64_t   | Physical address                     | –         | –         | –       | –        |
| offset[MAX_GRAPHIC_BUF_COMP]    | uint64_t   | Memory offset                        | –         | –         | –       | –        |

hbn_vnode_image_group_t

| Name      | Type                       | Description               | Max Value | Min Value | Default | Required |
|-----------|----------------------------|---------------------------|-----------|-----------|---------|----------|
| info      | hbn_frame_info_t           | Image info structure      | –         | –         | –       | –        |
| buf_group | hb_mem_graphic_buf_group_t | Group image memory info   | –         | –         | –       | –        |
| metadata  | void *                     | Metadata                  | –         | –         | –       | –        |

hb_mem_graphic_buf_group_t

| Name                                   | Type                 | Description                                    | Max Value | Min Value | Default | Required |
|----------------------------------------|----------------------|------------------------------------------------|-----------|-----------|---------|----------|
| graph_group[HB_MEM_MAXIMUM_GRAPH_BUF]; | hb_mem_graphic_buf_t | Image memory info                              | –         | –         | –       | –        |
| group_id                               | int32_t              | Group ID                                       | –         | –         | –       | –        |
| bit_map                                | uint32_t             | Bitmask indicating available layers in graph_group | –      | –         | –       | –        |

**VIN**

vin_attr_t

| Name          | Type            | Description                                      | Max Value | Min Value | Default | Required |
|---------------|-----------------|--------------------------------------------------|-----------|-----------|---------|----------|
| vin_node_attr | vin_node_attr_t | VIN node attribute structure                     | –         | –         | –       | Yes      |
| magicNumber   | uint32_t        | Magic number for attribute structure validation; must be set to MAGIC_NUM | – | – | – | Yes |

vin_node_attr_t

| Name        | Type        | Description                                      | Max Value | Min Value | Default | Required |
|-------------|-------------|--------------------------------------------------|-----------|-----------|---------|----------|
| cim_attr    | cim_attr_t  | CIM parameters                                   | –         | –         | –       | Yes      |
| lpwm_attr   | lpwm_attr_t | LPWM parameters                                  | –         | –         | –       | No       |
| vcon_attr   | vcon_attr_t | VCON parameters                                  | –         | –         | –       | No       |
| magicNumber | uint32_t    | Magic number for attribute structure validation; must be set to MAGIC_NUM | – | – | – | Yes |

cim_attr_t

| Name          | Type     | Description                      | Max Value | Min Value | Default | Required |
|---------------|----------|----------------------------------|-----------|-----------|---------|----------|
| mipi_en       | uint32_t | Enable MIPI input                | 1         | 0         | –       | Yes      |
| mipi_rx       | uint32_t | MIPI RX index; options: 0, 1, 4  | 4         | 0         | –       | Yes      |
| vc_index      | uint32_t | CIM IPI index                    | 3         | 0         | –       | Yes      |
| cim_pym_flyby | uint32_t | Enable CIM PYM hardware bypass   | 1         | 0         | –       | Yes      |
| cim_isp_flyby | uint32_t | Enable CIM ISP hardware bypass   | 1         | 0         | –       | Yes      |vin_ichn_attr_t

| Name   | Type     | Description                                      | Max    | Min    | Default | Required |
|--------|----------|--------------------------------------------------|--------|--------|---------|----------|
| format | uint32_t | MIPI input image format, e.g., raw12 corresponds to 0x2c | 0x27   | 0x1E   | \-      | Yes      |
| width  | uint32_t | MIPI input image width                           | 4096   | 32     | \-      | Yes      |
| height | uint32_t | MIPI input image height                          | 2160   | 32     | \-      | Yes      |

vin_ochn_attr_t

| Name           | Type                  | Description                                                                                                           | Max | Min | Default | Required |
|----------------|-----------------------|-----------------------------------------------------------------------------------------------------------------------|-----|-----|---------|----------|
| ddr_en         | uint32_t              | Enable CIM DDR output                                                                                                 | 1   | 0   | \-      | No       |
| roi_en         | uint32_t              | Enable CIM ROI channel output                                                                                         | 1   | 0   | \-      | No       |
| emb_en         | uint32_t              | Enable CIM EMB channel output                                                                                         | 1   | 0   | \-      | No       |
| rawds_en       | uint32_t              | Enable RAW scaler                                                                                                     | 1   | 0   | \-      | No       |
| pingpong_ring  | uint32_t              | Enable ping-pong buffer                                                                                               | 1   | 0   | \-      | No       |
| ochn_attr_type | vin_ochn_attr_type_e  | Output channel type: VIN_MAIN_FRAME (main data path), VIN_ONLINE (online output path), VIN_EMB (embedded data path), VIN_ROI (ROI data path) | \-  | \-  | \-      | Yes      |
| vin_basic_attr | vin_basic_attr_t      | Basic VIN attributes                                                                                                  | \-  | \-  | \-      | Yes      |
| rawds_attr     | vin_rawds_attr_t      | VIN RAW scaler attributes                                                                                             | \-  | \-  | \-      | No       |
| roi_attr       | struct vin_roi_attr_s | VIN ROI attributes                                                                                                    | \-  | \-  | \-      | No       |
| emb_attr       | vin_emb_attr_t        | VIN embedded attributes                                                                                               | \-  | \-  | \-      | No       |
| magicNumber    | uint32_t              | Attribute structure checksum; must be set to the fixed value MAGIC_NUM                                                | \-  | \-  | \-      | Yes      |

vin_basic_attr_t

| Name      | Type     | Description                                      | Max | Min | Default | Required |
|-----------|----------|--------------------------------------------------|-----|-----|---------|----------|
| pack_mode | uint32_t | Enable packing; packing enabled by default if not configured | 1   | 0   | 1       | No       |
| wstride   | uint32_t | Output width stride; if set to 0, calculated internally | 1   | 0   | 1       | No       |
| vstride   | uint32_t | Output height stride; if set to 0, calculated internally | 1   | 0   | 1       | No       |
| format    | uint32_t | Output image format, e.g., raw12 corresponds to 0x2c | 0x27| 0x1E| \-      | Yes      |

**ISP**

isp_attr_t

| Name        | Type            | Description                                                                                                                                 | Max | Min | Default | Required |
|-------------|-----------------|---------------------------------------------------------------------------------------------------------------------------------------------|-----|-----|---------|----------|
| channel     | isp_channel_t   | ISP channel attributes                                                                                                                      | \-  | \-  | \-      | Yes      |
| sched_mode  | sched_mode_e    | ISP scheduling mode: 1 = SCHED_MODE_MANUAL (manual mode), 2 = SCHED_MODE_PASS_THRU (fully online mode)                                      | 2   | 1   | \-      | Yes      |
| work_mode   | isp_work_mode_e | ISP working mode: 0 = ISP_WORK_MODE_NORMAL (normal mode), 1 = ISP_WORK_MODE_TPG (ISP outputs test pattern), 2 = ISP_WORK_MODE_CIM_TPG (CIM outputs test pattern) | 2   | 0   | \-      | No       |
| hdr_mode    | hdr_mode_e      | Enable ISP HDR mode                                                                                                                         | 1   | 0   | \-      | No       |
| size        | image_size_t    | ISP processing resolution                                                                                                                   | \-  | \-  | \-      | No       |
| frame_rate  | uint32_t        | ISP frame rate                                                                                                                              | 120 | 1   | \-      | No       |
| isp_combine | isp_combine_t   | ISP master-slave mode                                                                                                                       | \-  | \-  | \-      | No       |
| algo_state  | uint32_t        | Enable 2A algorithms                                                                                                                        | 1   | 0   | \-      | No       |

isp_channel_t

| Name    | Type     | Description                                                         | Max | Min | Default | Required |
|---------|----------|---------------------------------------------------------------------|-----|-----|---------|----------|
| hw_id   | uint32_t | ISP hardware ID                                                     | 1   | 0   | \-      | Yes      |
| slot_id | uint32_t | ISP internal hardware channel: configure 0~3 for online input, 4~11 for offline input | 11  | 0   | 0       | Yes      |

image_size_t

| Name   | Type     | Description        | Max  | Min | Default | Required |
|--------|----------|--------------------|------|-----|---------|----------|
| width  | uint32_t | ISP processing width | 4096 | 32  | \-      | Yes      |
| height | uint32_t | ISP processing height| 2160 | 32  | \-      | Yes      |

isp_ichn_attr_t

| Name               | Type         | Description                              | Max | Min | Default | Required |
|--------------------|--------------|------------------------------------------|-----|-----|---------|----------|
| input_crop_cfg     | crop_cfg_t   | Input crop configuration                 | \-  | \-  | \-      | No       |
| in_buf_noclean     | uint32_t     | Whether to perform cache clean on input buffer | 1   | 0   | \-      | No       |
| in_buf_noncached   | uint32_t     | Whether to allocate input buffer as non-cacheable memory | 1   | 0   | \-      | No       |

crop_cfg_t

| Name   | Type         | Description         | Max | Min | Default | Required |
|--------|--------------|---------------------|-----|-----|---------|----------|
| rect   | image_rect_t | Input crop rectangle| \-  | \-  | \-      | No       |
| enable | HB_BOOL      | Enable crop         | 1   | 0   | \-      | No       |

image_rect_t

| Name   | Type      | Description | Max | Min | Default | Required |
|--------|-----------|-------------|-----|-----|---------|----------|
| x      | uint32_t  | X coordinate| \-  | \-  | \-      | No       |
| y      | uint32_t  | Y coordinate| \-  | \-  | \-      | No       |
| width  | uint32_t  | Rect width  | \-  | \-  | \-      | No       |
| height | uint32_t  | Rect height | \-  | \-  | \-      | No       |

isp_ochn_attr_t

| Name                 | Type                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Max | Min | Default | Required |
|----------------------|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----|-----|---------|----------|
| stream_output_mode   | isp_stream_output_mode_e      | Whether to enable OTF output: 1 = enable, 0 = disable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 1   | 0   | 0       | Yes      |
| axi_output_mode      | isp_axi_output_mode_e         | DDR output type: AXI_OUTPUT_MODE_DISABLE = 0,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 14  | 0   | 0       | Yes      |
|                      |                               | AXI_OUTPUT_MODE_RGB888 = 1,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_RAW8 = 2,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_RAW10 = 3,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_RAW12 = 4,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_RAW16 = 5,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_RAW24 = 6,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_YUV444 = 7,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_YUV422 = 8, /* yuv422 */                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_YUV420 = 9, /* yuv420 */                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_IR8 = 10,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_YUV420_RAW12 = 11, /* yuv420 & raw12 */                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_YUV422_RAW12 = 12, /* yuv422 & raw12 */                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_YUV420_RAW16 = 13, /* yuv420 & raw16 */                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |     |     |         |          |
|                      |                               | AXI_OUTPUT_MODE_YUV422_RAW16 = 14, /* yuv422 & raw16 */                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |     |     |         |          |
| output_crop_cfg      | crop_cfg_t                    | Output crop configuration                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | \-  | \-  | \-      | Yes      |
| out_buf_noinvalid    | uint32_t                      | Whether to perform cache invalidate on output buffer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 1   | 0   | 0       | No       |
| out_buf_noncached    | uint32_t                      | Whether to allocate output buffer as non-cacheable memory                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 1   | 0   | 0       | No       |
| buf_num              | uint32_t                      | Number of output buffers to allocate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 16  | 3   | 0       | Yes      |

**YNR**

ynr_init_attr

| Name               | Type       | Description                                                                 | Max | Min | Default | Required |
|--------------------|------------|-----------------------------------------------------------------------------|-----|-----|---------|----------|
| work_mode          | uint32_t   | YNR working mode                                                            | 2   | 1   | \-      | Yes      |
|                    |            | 1: Manual mode, online link, previous module is SW trigger;                 |     |     |         |          |
|                    |            | 2: Single-channel online mode (previous PYM hardware directly connected);   |     |     |         |          |
| slot_id            | uint32_t   | YNR hardware channel ID                                                     | 7   | 0   | \-      | Yes      |
| width              | uint32_t   | YNR processing width                                                        | 2048| 32  |         | Yes      |
| height             | uint32_t   | YNR processing height                                                       | 2048| 32  |         | Yes      |
| nr_static_switch   | uint32_t   | nr3den \<\<1    \| nr2d_en                                                      |     |     |         |          |
| in_stride          | uint32_t   | Y stride and UV stride                                                      |     |     |         | Yes      |
| nr2d_en            | uint32_t   | Enable 2D NR                                                                | 1   | 0   |         | Yes      |
| nr3d_en            | uint32_t   | Enable 3D NR                                                                | 1   | 0   |         | Yes      |
| dma_output_en      | uint32_t   | Enable DMA output                                                           | 1   | 0   |         | Yes      |
|                    |            | If 3D NR is enabled, DMA output must be enabled                             |     |     |         |          |
| debug_en           | uint32_t   | Enable debug mode                                                           | 1   | 0   |         | No       |

hobot_ynr_channel_input_config

| Name            | Type       | Description     | Max  | Min | Default | Required |
|-----------------|------------|-----------------|------|-----|---------|----------|
| ch_img_width    | uint32_t   | YNR input width | 4096 | 32  | \-      | Yes      |
| ch_img_height   | uint32_t   | YNR input height| 2160 | 32  | \-      | Yes      |

hobot_ynr_channel_output_config

| Name                        | Type       | Description                     | Max  | Min | Default | Required |
|-----------------------------|------------|---------------------------------|------|-----|---------|----------|
| ch_nr3d_pix_out_dma_byps    | uint32_t   | DMA output count; recommended to set to 0 | 4096 | 32  | \-      | Yes      |
| ch_nr3d_debug_en            | uint32_t   | Debug switch; recommended to set to 0     | 1    | 0   | \-      | Yes      |

**PYM**

roi_box_t

| Name          | Type      | Description                                                                 | Max                                                                                                      | Min                                                                                                      | Default                                                  | Required |
|---------------|-----------|-----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------|----------|
| start_top     | uint32_t  | Y-axis position to crop from original image                                 | DS layer: \<= region_height<br/>BL layer:\<= bl_base_height<br/>bl_base_height \= region_width \>\> (ds_roi_layer + 1) | DS layer: \>= region_height - out_height<br/>BL layer: \>= bl_base_height - out_height                     | \-                                                       | Yes      |
| start_left    | uint32_t  | X-axis position to crop from original image                                 | DS layer: \<= region_width<br/>BL layer: \<= bl_base_width<br/>bl_base_width = region_width \>\> (ds_roi_layer + 1)  | DS layer: \>= region_width - out_width<br/>BL layer: \>= bl_base_width - out_width                         | \-                                                       | Yes      |
| region_width  | uint32_t  | Width of cropped region                                                     | \-                                                                                                       | \-                                                                                                       | \-                                                       | Yes      |
| region_height | uint32_t  | Height of cropped region                                                    | \-                                                                                                       | \-                                                                                                       | \-                                                       | Yes      |
| wstride_uv    | uint32_t  | Output UV plane stride                                                      |                                                                                                          |                                                                                                          | \-                                                       | Yes      |
| wstride_y     | uint32_t  | Output Y plane stride                                                       | \-                                                                                                       | \-                                                                                                       | \-                                                       | Yes      |
| vstride       | uint32_t  | Height stride (hidden parameter; not recommended to configure)              | \-                                                                                                       | \-                                                                                                       | out_height                                               | Yes      |
| step_v        | uint32_t  |                                                                             | \-                                                                                                       | \-                                                                                                       | (1 \<\< 16) * (out_height - region_height) / out_height    | No       |
| step_h        | uint32_t  |                                                                             | \-                                                                                                       | \-                                                                                                       | (1 \<\< 16) * (out_width - region_width) / out_width       | No       |
| out_width     | uint32_t  | Output image width                                                          | \-                                                                                                       | \-                                                                                                       | \-                                                       | Yes      |
| out_height    | uint32_t  | Output image height                                                         | \-                                                                                                       | \-                                                                                                       | \-                                                       | Yes      |
| phase_y_v     | uint32_t  |                                                                             |                                                                                                          |                                                                                                          | 0                                                        | No       |
| phase_y_h     | uint32_t  |                                                                             |                                                                                                          |                                                                                                          | 0                                                        | No       |

chn_ctrl_t

| Name                     | Type      | Description                                    | Max                    | Min                | Default | Required |
|--------------------------|-----------|------------------------------------------------|------------------------|--------------------|---------|----------|
| pixel_num_before_sol     | uint32_t  |                                                | \-                     | \-                 | 2       | Yes      |
| invalid_head_lines       | uint32_t  |                                                | \-                     | \-                 | \-      | No       |
| src_in_width             | uint32_t  | Input width, aligned to 2                      | \< 4096                 | \> 32               | \-      | Yes      |
| src_in_height            | uint32_t  | Input height, aligned to 2                     | \< 4096                 | \> 32               | \-      | Yes      |
| src_in_stride_y          | uint32_t  | Input Y plane stride, aligned to 16            | \< 4096                 | \> src_in_width     | \-      | Yes      |
| src_in_stride_uv         | uint32_t  | Input UV stride, aligned to 16                 | \< 4096                 | \> src_in_width     | \-      | Yes      |
| suffix_hb_val            | uint32_t  |                                                | \<= 152                 | \>= 16              | 100     | Yes      |
| prefix_hb_val            | uint32_t  |                                                | \<= 2                   | \>= 0               | 2       | Yes      |
| suffix_vb_val            | uint32_t  |                                                | \<= 20                  | \>= 0               | 10      | Yes      |
| prefix_vb_val            | uint32_t  |                                                | \<= 2                   | \>= 0               | 0       | Yes      |
| bl_max_layer_en          | uint8_t   | When selecting BL layer, enable number of BL layers |                        | \> ds_roi_layer[chn]| 5       | Yes      |
| ds_roi_en                | uint8_t   | Enable DS layer output (total 6 layers, enabled per bit) | \< (1 \<\< 6)           | \-                 | \-      | Yes      |
| ds_roi_uv_bypass         | uint8_t   | Enable DS layer UV plane output bypass (enabled per bit) | \< (1 \<\< 6)           | \-                 | \-      | No       |
| ds_roi_sel[MAX_DS_NUM]   | uint8_t   | Layer selection: 0 = SRC layer; 1 = BL layer   | \< 3                    | \-                 | \-      | Yes      |
| ds_roi_layer[MAX_DS_NUM] | uint8_t   |                                                | When ds_roi_sel = 0, must be 0 | \-                 | \-      | Yes      |
| ds_roi_info[MAX_DS_NUM]  | roi_box_t | DS layer configuration                         | \-                     | \-                 | \-      | Yes      |

pym_cfg_t

| Name                 | Type       | Description                                                                                                                                                 | Max     | Min | Default | Required |
|----------------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|-----|---------|----------|
| hw_id                | uint8_t    | pym hardware module ID (0, 1, 4)                                                                                                                     | \-        | \-     | \-     | Yes      |
| pym_mode             | uint8_t    | pym operation mode: *1*: Manual mode, online link, with preceding module as SW trigger; 2: Single-channel Online mode (direct hardware connection between preceding module and PYM); 3: Offline mode (input: YUV420SP, output: YUV420SP) | \<= 3     | \>= 1  | \-     | Yes      |
| slot_id              | uint8_t    | pym hardware channel ID                                                                                                                              | 7         | 0      | \-     | No       |
| out_buf_noinvalid    | uint8_t    | Whether the module's output buffer internally performs an "invalidate cache" operation                                                               | 1         | 0      | 1      | Yes      |
| out_buf_noncached    | uint8_t    | Whether non-cacheable memory allocation is enabled for the module's output buffer                                                                   | 1         | 0      | \-     | No       |
| in_buf_noclean       | uint8_t    | Whether cache clean is performed on the input buffer                                                                                                 | 1         | 0      | 1      | Yes      |
| in_buf_noncached     | uint8_t    | Whether non-cacheable memory allocation is enabled for the module's input buffer (typically feedback buffer)                                         | 1         | 0      | \-     | No       |
| buf_consecutive      | uint8_t    | Whether memory is contiguous                                                                                                                         | 1         | 0      | \-     | No       |
| pingpong_ring        | uint8_t    | Whether ping-pong buffer is enabled                                                                                                                  |           |        | \-     | No       |
| output_buf_num       | uint32_t   | Number of output buffers; when PYM is in offline mode, the number of feedback buffers is allocated by default according to this value               | \<= 64    | 0      | \-     | Yes      |
| timeout              | uint32_t   | Timeout duration                                                                                                                                     | \<= 10000 |        | \-     | No       |
| threshold_time       | uint32_t   |                                                                                                                                                      |           |        | \-     | No       |
| layer_num_trans_next | int32_t    | Number of layers transferred to the subsequent module                                                                                                | \< 6      | \-     | \-1    | Yes      |
| layer_num_share_prev | int32_t    |                                                                                                                                                      | \< 6      | \-     | \-1    | Yes      |
| chn_ctrl             | chn_ctrl_t | Configure input/output format and size                                                                                                               |           |        |        |          |
| fb_buf_num           | uint32_t   | Number of feedback buffers                                                                                                                           | \<= 16    | \-     | 2      | Yes      |
| reserved[6]          | uint32_t   | Reserved field                                                                                                                                       | \-        | \-     | \-     | No       |
| magicNumber          | uint32_t   | Attribute structure verification value; must be set to the fixed value MAGIC_NUM                                                                      | \-        | \-     | \-     | Yes      |

**GDC**

gdc_cfg_t

| Name              | Type       | Description                                         | Max      | Min    | Default | Required |
|-------------------|------------|-----------------------------------------------------|----------|--------|---------|----------|
| input_width       | uint32_t   | Input image width, aligned to 2                     | \<= 3840 | \>= 96 | \-      | Yes      |
| input_height      | uint32_t   | Input image height, aligned to 2                    | \<= 2160 | \>= 96 | \-      | Yes      |
| output_width      | uint32_t   | Output image width                                  | \<= 3840 | \>= 96 | \-      | Yes      |
| output_height     | uint32_t   | Output image height                                 | \<= 2160 | \>= 96 | \-      | Yes      |
| buf_num           | uint32_t   | Number of normal input buffers                      | \<= 32   | 0      | 6       | Yes      |
| fb_buf_num        | uint32_t   | Number of feedback buffers                          | \<= 32   | 0      | 2       | Yes      |
| in_buf_noclean    | uint32_t   | Whether cache clean is performed on the input buffer| 1        | 0      | 1       | No       |
| in_buf_noncached  | uint32_t   | Whether non-cacheable memory allocation is enabled for the module's input buffer (typically feedback buffer) | \-       | \-     | \-      | No       |
| out_buf_noinvalid | uint32_t   | Whether the module's output buffer internally performs an "invalidate cache" operation | \-       | \-     | 1       | No       |
| out_buf_noncached | uint32_t   | Whether non-cacheable memory allocation is enabled for the module's output buffer   | \-       | \-     | \-      | No       |
| gdc_pipeline      | uint32_t   |                                                     | \-       | \-     | \-      | No       |

**STITCH**

stitch_base_attr

| Name               | Type            | Description                              | Max | Min | Default | Required |
|--------------------|-----------------|------------------------------------------|-----|-----|---------|----------|
| mode               | uint32_t        | Operation mode                           |     |     |         | No       |
|                    |                 | 0 - External buffer feedback mode        |     |     |         |          |
|                    |                 | 1 - Internal buffer feedback mode        |     |     |         |          |
|                    |                 | 2 - Flow binding mode                    |     |     |         |          |
| roi_nums           | uint32_t        | Number of ROI regions                    | 12  | 1   |         | Yes      |
| img_nums           | uint32_t        | Number of input images                   | \-  | 1   |         | Yes      |
| alpha_lut          | struct          | Alpha lookup table                       |     |     |         | No       |
|                    | lut_attr        |                                          |     |     |         |          |
| beta_lut           | struct          | Beta lookup table                        |     |     |         | No       |
|                    | lut_attr        |                                          |     |     |         |          |
| blending           | struct          | Blending attributes                      |     |     |         | Yes      |
|                    | blending_attr   |                                          |     |     |         |          |

lut_attr

| Name     | Type      | Description                                     | Max | Min | Default | Required |
|----------|-----------|-------------------------------------------------|-----|-----|---------|----------|
| share_id | int32_t   | Share ID of hbmem buffer                        |     |     |         |          |
|          |           | Required for storing LUT buffer                 |     |     |         |          |
|          |           | Must be allocated via hbmem                     |     |     |         |          |
| vaddr    | uint64_t  | LUT virtual address                             |     |     |         | No       |
| offset   | uint64_t  | Offset                                          |     |     |         | No       |
| size     | uint64_t  | Size                                            |     |     |         | No       |

blending_attr

| Name               | Type      | Description                                             | Max | Min | Default | Required |
|--------------------|-----------|---------------------------------------------------------|-----|-----|---------|----------|
| roi_index          | uint32_t  | ROI index                                               |     |     |         | Yes      |
| blending_mode      | uint32_t  | Blending mode:                                          |     |     |         | Yes      |
|                    |           | BLENDING_MODE_ONLINE = 0, // online mode                |     |     |         |          |
|                    |           | BLENDING_MODE_ALPHA = 1, // alpha mode                  |     |     |         |          |
|                    |           | BLENDING_MODE_ALPH = 2, // alpha beta mode              |     |     |         |          |
|                    |           | BLENDING_MODE_SRC = 3, // src copy mode                 |     |     |         |          |
|                    |           | BLENDING_MODE_ALPHA_SRC = 5 // alpha src0 mode          |     |     |         |          |
| direct             | uint32_t  | Blending direction:                                     |     |     |         | Yes      |
|                    |           | BLENDING_DIRECT_LT = 0, // left and top direction       |     |     |         |          |
|                    |           | BLENDING_DIRECT_RB = 1, // right and bottom direction   |     |     |         |          |
|                    |           | BLENDING_DIRECT_LB = 2, // left and bottom direction    |     |     |         |          |
|                    |           | BLENDING_DIRECT_RT = 3, // right and top direction      |     |     |         |          |
| uv_en              | uint32_t  | Whether input image contains UV                         |     |     |         | Yes      |
| src0_index         | uint32_t  | Source index corresponding to src0                      |     |     |         | Yes      |
| src1_index         | uint32_t  | Source index corresponding to src1                      |     |     |         | Yes      |
| margin             | uint32_t  | Optional parameter; may be omitted                      |     |     |         | No       |
| margin_inv         | uint32_t  | Optional parameter; may be omitted                      |     |     |         | No       |
| gain_src0_yuv      | uint32_t  | Fixed to 256 // 0: Y, 1: U, 2: V                        |     |     |         | Yes      |
| gain_src1_yuv      | uint32_t  | Fixed to 256 // 0: Y, 1: U, 2: V                        |     |     |         | Yes      |

roi_info

| Name       | Type        | Description       | Max    | Min | Default | Required |
|------------|-------------|-------------------|--------|-----|---------|----------|
| roi_index  | uint32_t    | ROI index         |        |     |         | Yes      |
| roi_x      | uint32_t    | Starting X coordinate |      |     |         | Yes      |
| roi_y      | uint32_t    | Starting Y coordinate |      |     |         | Yes      |
| roi_w      | uint32_t    | Width             |        |     |         | Yes      |
| roi_h      | uint32_t    | Height            |        |     |         | Yes      |

stitch_ch_attr

| Name                              | Type              | Description         | Max | Min | Default | Required |
|-----------------------------------|-------------------|---------------------|-----|-----|---------|----------|
| width                             | uint32_t          | Input or output width |   |     |         | Yes      |
| height                            | uint32_t          | Input or output height|   |     |         | Yes      |
| strid[MAX_STH_FRAME_PLAN]         | uint32_t          | Stride              |     |     |         | Yes      |
| rois[MAX_STH_ROI_NUMS]            | struct roi_info   | ROI region description |   |     |         | Yes      |



## Channel Binding Description

| Module | Output Channel ID | Channel Function                                      |
|--------|-------------------|-------------------------------------------------------|
| VIN    | 0                 | Offline channel, outputs camera frames to DDR         |
|        | 1                 | Online channel, connects to ISP or PYM                |
| ISP    | 0                 | Offline channel, outputs ISP-processed frames to DDR  |
|        | 1                 | Online channel, connects to PYM or YNR                |
| YNR    | 1                 | Online channel, connects to PYM                       |
| PYM    | 0                 | Offline channel, outputs PYM images to DDR            |
| GDC    | 0                 | Offline channel, outputs GDC-processed frames to DDR  |

"Online" indicates direct hardware connection; "Offline" indicates output to DDR buffer.



## SLOT_ID and Debug Mode Description

1. The ISP's `slot_id` parameter selects the ISP hardware context. In CIM-direct-to-ISP scenarios, `slot_id` can be 0–3; in CIM-DDR-ISP scenarios, `slot_id` can be 4–11. Different channels must use distinct `slot_id` values. In ISP-online-YNR-online-PYM or ISP-online-PYM scenarios, the `slot_id` of YNR and PYM must match that of the ISP.
2. The PYM's `sched_mode` parameter selects the ISP scheduling mode. In CIM-ISP direct hardware connection scenarios, select mode 2 (passthrough); in other scenarios, select mode 1 (manual). In ISP-online-YNR-online-PYM or ISP-online-PYM scenarios, the YNR `work_mode` and PYM `pym_mode` must be consistent with the ISP `sched_mode`.



## Return Value Description

| Error Code | Macro Definition                    | Description                                                                 |
|------------|-------------------------------------|-----------------------------------------------------------------------------|
| 0          | HBN_STATUS_SUCESS                   | Success                                                                     |
| 1          | HBN_STATUS_INVALID_NODE             | Invalid vnode; corresponding vnode not found                                |
| 2          | HBN_STATUS_INVALID_NODETYPE         | Invalid vnode type; corresponding vnode not found                           |
| 3          | HBN_STATUS_INVALID_HWID             | Invalid hardware module ID                                                  |
| 4          | HBN_STATUS_INVALID_CTXID            | Invalid context ID                                                          |
| 5          | HBN_STATUS_INVALID_OCHNID           | Invalid output channel ID                                                   |
| 6          | HBN_STATUS_INVALID_ICHNID           | Invalid input channel ID                                                    |
| 7          | HBN_STATUS_INVALID_FORMAT           | Invalid format                                                              |
| 8          | HBN_STATUS_INVALID_NULL_PTR         | Null pointer                                                                |
| 9          | HBN_STATUS_INVALID_PARAMETER        | Invalid parameter; version check failed                                     |
| 10         | HBN_STATUS_ILLEGAL_ATTR             | Invalid parameter                                                           |
| 11         | HBN_STATUS_INVALID_FLOW             | Invalid flow; corresponding flow not found                                  |
| 12         | HBN_STATUS_FLOW_EXIST               | Flow already exists                                                         |
| 13         | HBN_STATUS_FLOW_UNEXIST             | Flow does not exist                                                         |
| 14         | HBN_STATUS_NODE_EXIST               | Node already exists                                                         |
| 15         | HBN_STATUS_NODE_UNEXIST             | Node does not exist                                                         |
| 16         | HBN_STATUS_NOT_CONFIG               | Reserved                                                                    |
| 17         | HBN_STATUS_CHN_NOT_ENABLED          | Channel not enabled                                                         |
| 18         | HBN_STATUS_CHN_ALREADY_ENABLED      | Channel already enabled                                                     |
| 19         | HBN_STATUS_ALREADY_BINDED           | Node already bound                                                          |
| 20         | HBN_STATUS_NOT_BINDED               | Node not bound                                                              |
| 21         | HBN_STATUS_TIMEOUT                  | Timeout                                                                     |
| 22         | HBN_STATUS_NOT_INITIALIZED          | Not initialized                                                             |
| 23         | HBN_STATUS_NOT_SUPPORT              | Channel not supported or not activated                                      |
| 24         | HBN_STATUS_NOT_PERM                 | Operation not permitted                                                     |
| 25         | HBN_STATUS_NOMEM                    | Insufficient memory                                                         |
| 26         | HBN_STATUS_INVALID_VNODE_FD         | Invalid node file descriptor                                                |
| 27         | HBN_STATUS_INVALID_ICHNID_FD        | Invalid input channel file descriptor                                       |
| 28         | HBN_STATUS_INVALID_OCHNID_FD        | Invalid output channel file descriptor                                      |
| 29         | HBN_STATUS_OPEN_OCHN_FAIL           | Failed to open output channel                                               |
| 30         | HBN_STATUS_OPEN_ICHN_FAIL           | Failed to open input channel                                                |
| 31         | HBN_STATUS_JSON_PARSE_FAIL          | JSON parsing failed                                                         |
| 32         | HBN_STATUS_REQ_BUF_FAIL             | Buffer request failed                                                       |
| 33         | HBN_STATUS_QUERY_BUF_FAIL           | Buffer query failed                                                         |
| 34         | HBN_STATUS_SET_CONTROL_FAIL         | Failed to set module control or tuning parameters (e.g., ISP effect parameters) |
| 35         | HBN_STATUS_GET_CONTROL_FAIL         | Failed to get module control or tuning parameters (e.g., ISP effect parameters) |
| 36         | HBN_STATUS_NODE_START_FAIL          | Node start failed                                                           |
| 37         | HBN_STATUS_NODE_STOP_FAIL           | Node stop failed                                                            |
| 38         | HBN_STATUS_NODE_POLL_ERROR          | Node channel poll error                                                     |
| 39         | HBN_STATUS_NODE_POLL_TIMEOUT        | Node channel poll timeout                                                   |
| 40         | HBN_STATUS_NODE_POLL_FRAME_DROP     | Frame drop occurred during node channel poll                                |
| 41         | HBN_STATUS_NODE_POLL_HUP            | Node channel poll descriptor hang-up                                        |
| 42         | HBN_STATUS_NODE_ILLEGAL_EVENT       | Illegal event during node channel poll                                      |
| 43         | HBN_STATUS_NODE_DEQUE_ERROR         | Node channel dequeue buffer error                                           |
| 44         | HBN_STATUS_ILLEGAL_BUF_INDEX        | Invalid buffer index                                                        |
| 45         | HBN_STATUS_NODE_QUE_ERROR           | Node channel queue buffer error                                             |
| 46         | HBN_STATUS_FLUSH_FRAME_ERROR        | Node channel frame flush error                                              |
| 47         | HBN_STATUS_INIT_BIND_ERROR          | Error occurred during JSON parsing and binding                              |
| 48         | HBN_STATUS_ADD_NODE_FAIL            | Failed to add node to flow                                                  |
| 49         | HBN_STATUS_WRONG_CONFIG_ID          | Unsupported node ID by the system                                           |
| 50         | HBN_STATUS_BIND_NODE_FAIL           | Error occurred during flow binding to node                                  |
| 51         | HBN_STATUS_INVALID_VERSION          | Version mismatch between lower-level driver module and upper-layer library  |
| 52         | HBN_STATUS_GET_VERSION_ERROR        | Error retrieving lower-level driver module version                          |
| 53         | HBN_STATUS_MEM_INIT_FAIL            | hbmem memory initialization failed                                          |
| 54         | HBN_STATUS_MEM_IMPORT_FAIL          | hbmem memory import failed                                                  |
| 55         | HBN_STATUS_MEM_FREE_FAIL            | hbmem memory release failed                                                 |
| 56         | HBN_STATUS_SYSFS_OPEN_FAIL          | System file open failed                                                     |
| 57         | HBN_STATUS_STRUCT_SIZE_NOT_MATCH    | HAL-layer structure size mismatch with kernel layer                         |
| 58         | HBN_STATUS_RGN_UNEXIST              | Corresponding RGN data not found                                            |
| 59         | HBN_STATUS_RGN_INVALID_OPERATION    | Invalid RGN operation                                                       |
| 60         | HBN_STATUS_RGN_OPEN_FILE_FAIL       | RGN module file open failed                                                 |
| 128        | HBN_STATUS_ERR_UNKNOW               | Unknown error                                                               |



## Related Documentation

- [VIO API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md)
- [Shared Memory - Hbmem](./02_hbmem_api.md)
- [Video Capture](../../../03_Demos/02_multimedia_demo/01_cdev/01_vio_capture.md)
