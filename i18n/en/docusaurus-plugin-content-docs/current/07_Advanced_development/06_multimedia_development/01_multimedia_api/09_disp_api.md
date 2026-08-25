---
sidebar_position: 9
title: "Display Output - DISP"
description: "RDK S100/S600 5.5.1.9 DISP (display output)"
---

# Display Output - DISP

> **Level description**: This chapter covers the [Low-level Multimedia API] (board header `hb_disp_interface.h`), the display output module API (X5 Display → RDK DISP). It is intended for advanced development that directly operates on the multimedia pipeline (Mode 3); if you only need to run the encapsulated capture/codec/display functionality, see Chapter 4 [Simple API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) (Mode 1).

> **Platform codename note**: Compatibility annotations in this document follow the original wording of the underlying header files. XJ3/J3 and Ultra are earlier-generation upstream platform codenames; X5 denotes the current upstream product line (not these two boards); Super/J6 are the codenames of the architecture family shared by this product line (board-verified: S100/S600 share the same family, with S600 in a multi-core form). An `HW:` list indicates the interface's applicable range across upstream platform generations, where the Super generation corresponds to this product line (inherited from upstream annotations, not verified per-interface on board); `SW` is the upstream software version number — for RDK releases see the Release Notes. Interfaces without codenames are inherited from upstream and not individually verified on RDK.

## Overview

DISP (Display, display output; X5 Display → RDK DISP) is the RDK display output module (board header `hb_disp_interface.h`, functions `hb_disp_*`/`hbn_idu_*`). It encapsulates display channel configuration, video buffer validation, display-done synchronization, and display capture, and corresponds to the IDU/MIPI TX hardware.

## Software Abstraction

- Display channel: `hb_disp_set_channel_cfg`/`get_channel_cfg` configure/query a display channel.
- Buffer validation: `hb_disp_check_video_bufaddr_valid` validates the video buffer address.
- Sync: `hb_disp_get_disp_done_sync_id` gets the display-done sync; `hb_disp_get_display_done` queries display completion.
- Capture: `hb_disp_get_capture_buf_id` gets a display capture frame.

## API Call Flow

1. `hb_disp_set_channel_cfg` configures the display channel.
2. `hb_disp_check_video_bufaddr_valid` validates the input buffer.
3. `hb_disp_get_disp_done_sync_id` waits for display-done synchronization.
4. `hb_disp_get_capture_buf_id` captures a frame (if needed); `hb_disp_close` closes the channel.

## Quick Example

The following example demonstrates the minimal usage sequence of DISP (based on the board header `hb_disp_interface.h`, functions `hb_disp_*`):

```c
#include "hb_disp_interface.h"
#include "hbn_idu_cfg.h"

// 1. Initialize the display device (DISP_PRI_1 is defined in hb_disp_interface.h)
int32_t ret = hb_disp_init_dev_cfg(DISP_PRI_1, "");
if (ret != 0) {
    /* handle initialization failure */
}

// 2. Configure the output (output_cfg_t is defined in hbn_idu_cfg.h) and layer
output_cfg_t chn_cfg = {0};
chn_cfg.out_sel = OUTPUT_MIPI;
hb_disp_set_output_cfg_id(&chn_cfg, DISP_PRI_1);

// Layer config uses 6 scalar parameters (layer_no, width, height, x_pos, y_pos, disp_id)
hb_disp_set_layer_cfg_id(1, 1920, 1080, 0, 0, DISP_PRI_1);

// 3. Start the display and enable the layer
hb_disp_start_id(DISP_PRI_1);
hb_disp_layer_on_id(1, DISP_PRI_1);

// 4. Set the video buffer address (Y/C) and wait for display completion
void *addr_y = /* Y address of the image */;
void *addr_c = /* C address of the image */;
hb_disp_set_video_bufaddr_id(DISP_PRI_1, 1, addr_y, addr_c);
hb_disp_get_disp_done_sync_id(DISP_PRI_1, 0);   /* rel_seq is the display sequence number */

// 5. Close
hb_disp_stop_id(DISP_PRI_1);
hb_disp_close_id(DISP_PRI_1);
```

> For the display layer numbers, priorities, and output mode enums, see `hb_disp_interface.h`; for structures such as `output_cfg_t`/`disp_timing_t`, see `hbn_idu_cfg.h`; for HDMI display on the board, refer to `sample_pipeline/common/vp_display.c` (DRM/KMS path).

## API List

| Function | Description |
| --- | --- |
| hb_disp_init_dev_cfg | Initialize a display device instance |
| hb_disp_init_cfg | Initialize all display device |
| hb_disp_close | Close all display device |
| hb_disp_close_id | Close a display device instance |
| hb_disp_start | Start all display device |
| hb_disp_start_id | Start a display device instance |
| hb_disp_stop | Stop all display device |
| hb_disp_stop_id | Stop a display device instance |
| hb_disp_layer_on | Enable a layer of all display device |
| hb_disp_layer_on_id | Enable a layer of a display device instance |
| hb_disp_layer_off | Close a layer of all display device |
| hb_disp_layer_off_id | Close a layer of a display device instance |
| hb_disp_set_video_bufaddr | Set video buffer address |
| hb_disp_set_video_bufaddr_id | Set video buffer address to a display device instance |
| hb_disp_set_layer_cfg | Set video buffer address |
| hb_disp_set_layer_cfg_id | Set video buffer address for a display device instance |
| hb_disp_set_timing | Set display timing |
| hb_disp_set_timing_id | Set display timing for a display device instance |
| hb_disp_get_gamma_cfg | Get gamma config value |
| hb_disp_get_gamma_cfg_id | Get gamma config value for a display device instance |
| hb_disp_set_gamma_cfg | Set gamma config for a display device instance |
| hb_disp_set_gamma_cfg_id | Set gamma config |
| hb_disp_set_output_dynamic_cfg_id | Set output dynamic config |
| hb_disp_get_output_cfg | Get ouput config |
| hb_disp_get_output_cfg_id | Get ouput config of a display device instance |
| hb_disp_set_output_cfg | Set ouput config |
| hb_disp_set_output_cfg_id | Set ouput config of a display device instance |
| hb_disp_get_upscaling_cfg | Get upscale config |
| hb_disp_get_upscaling_cfg_id | Get upscale config of a display device instance |
| hb_disp_set_upscaling_cfg | Set upscale config of a display device instance |
| hb_disp_set_upscaling_cfg_id | Set upscale config of a display device instance |
| hb_disp_get_channel_cfg | Get channel config parameters |
| hb_disp_get_channel_cfg_id | Get channel config parameters of a display device instance |
| hb_disp_set_channel_cfg | Set channel config parameters of a display device instance |
| hb_disp_set_channel_cfg_id | Set channel config parameters of a display device instance |
| hb_disp_out_upscale | user config up-scale |
| hb_disp_out_upscale_id | user config up-scale for a display device instance |
| hb_disp_get_display_done | user get the display done flag |
| hb_disp_get_display_done_id | user get the display done flag for a display device instance |
| hb_disp_check_video_bufaddr_valid | user check whether the graphic size matches the channel |
| hb_disp_check_video_bufaddr_valid_id | user check whether the graphic size matches the channel |
| hb_disp_get_video_display_done_id | user get layer buffer read done flag |
| hb_disp_get_video_display_done | user get layer buffer read done flag |
| hb_disp_get_disp_done_sync_id | user wait display vsync flag |
| hb_disp_get_capture_buf_id | user get capture buffer |
| hb_disp_release_capture_buf_id | user release capture buffer |
| hb_disp_set_disp_oneshot_trigger_id | user trigger display control oneshot output |

## API Reference

### hb_disp_init_dev_cfg

**Function Prototype**

```c
HB_API int32_t hb_disp_init_dev_cfg(uint32_t disp_id, const char *cfg_file);
```

**Description**

Initialize a display device instance

**Parameters**

- [IN] uint32_t disp_id: display device id
- [IN] const char *cfg_file: path of the config json file

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_init_cfg

**Function Prototype**

```c
HB_API int32_t hb_disp_init_cfg(const char *cfg_file);
```

**Description**

Initialize all display device

**Parameters**

- [IN] const char *cfg_file: path of the config json file

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_close

**Function Prototype**

```c
HB_API int32_t hb_disp_close(void);
```

**Description**

Close all display device

**Parameters**

- [IN] None

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_close_id

**Function Prototype**

```c
HB_API int32_t hb_disp_close_id(uint32_t disp_id);
```

**Description**

Close a display device instance

**Parameters**

- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_start

**Function Prototype**

```c
HB_API int32_t hb_disp_start(void);
```

**Description**

Start all display device

**Parameters**

- [IN] None

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_start_id

**Function Prototype**

```c
HB_API int32_t hb_disp_start_id(uint32_t disp_id);
```

**Description**

Start a display device instance

**Parameters**

<!-- TODO(Sx): 参数待头文件/板端核实 -->

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_stop

**Function Prototype**

```c
HB_API int32_t hb_disp_stop(void);
```

**Description**

Stop all display device

**Parameters**

- [IN] None

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_stop_id

**Function Prototype**

```c
HB_API int32_t hb_disp_stop_id(uint32_t disp_id);
```

**Description**

Stop a display device instance

**Parameters**

<!-- TODO(Sx): 参数待头文件/板端核实 -->

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_layer_on

**Function Prototype**

```c
HB_API int32_t hb_disp_layer_on(uint32_t layer_number);
```

**Description**

Enable a layer of all display device

**Parameters**

- [IN] uint32_t layer_number: the number of layer

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_layer_on_id

**Function Prototype**

```c
HB_API int32_t hb_disp_layer_on_id(uint32_t layer_number, uint32_t disp_id);
```

**Description**

Enable a layer of a display device instance

**Parameters**

- [IN] uint32_t layer_number: layer id
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_layer_off

**Function Prototype**

```c
HB_API int32_t hb_disp_layer_off(uint32_t layer_number);
```

**Description**

Close a layer of all display device

**Parameters**

- [IN] uint32_t layer_number: layer id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_layer_off_id

**Function Prototype**

```c
HB_API int32_t hb_disp_layer_off_id(uint32_t layer_number, uint32_t disp_id);
```

**Description**

Close a layer of a display device instance

**Parameters**

- [IN] uint32_t layer_number: layer id
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_video_bufaddr

**Function Prototype**

```c
HB_API int32_t hb_disp_set_video_bufaddr(uint32_t layer_no, void *addr_y, void *addr_c);
```

**Description**

Set video buffer address

**Parameters**

<!-- TODO(Sx): 参数待头文件/板端核实 -->

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Super; SW: 0.0.1

### hb_disp_set_video_bufaddr_id

**Function Prototype**

```c
HB_API int32_t hb_disp_set_video_bufaddr_id(uint32_t disp_id, uint32_t layer_no, void *addr_y, void *addr_c);
```

**Description**

Set video buffer address to a display device instance

**Parameters**

<!-- TODO(Sx): 参数待头文件/板端核实 -->

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Super; SW: 0.0.1

### hb_disp_set_layer_cfg

**Function Prototype**

```c
HB_API int32_t hb_disp_set_layer_cfg(uint32_t layer_no, uint32_t width, uint32_t height, uint32_t x_pos, uint32_t y_pos);
```

**Description**

Set video buffer address

**Parameters**

- [IN] uint32_t layer_no: display layer id
- [IN] uint32_t width: width of the layer
- [IN] uint32_t height: height of the layer
- [IN] uint32_t x_pos: x position of the layer
- [IN] uint32_t y_pos: y position of the layer

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_layer_cfg_id

**Function Prototype**

```c
HB_API int32_t hb_disp_set_layer_cfg_id(uint32_t layer_no, uint32_t width, uint32_t height, uint32_t x_pos, uint32_t y_pos, uint32_t disp_id);
```

**Description**

Set video buffer address for a display device instance

**Parameters**

- [IN] uint32_t layer_no: display layer id
- [IN] uint32_t width: width of the layer
- [IN] uint32_t height: height of the layer
- [IN] uint32_t x_pos: x position of the layer
- [IN] uint32_t y_pos: y position of the layer
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_timing

**Function Prototype**

```c
HB_API int32_t hb_disp_set_timing(disp_timing_t *user_timing);
```

**Description**

Set display timing

**Parameters**

- [IN] disp_timing_t *user_timing: the timing parameter user want to set

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_timing_id

**Function Prototype**

```c
HB_API int32_t hb_disp_set_timing_id(disp_timing_t *user_timing, uint32_t	    disp_id);
```

**Description**

Set display timing for a display device instance

**Parameters**

- [IN] disp_timing_t *user_timing: the timing parameter user want to set
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_gamma_cfg

**Function Prototype**

```c
HB_API int32_t hb_disp_get_gamma_cfg(float32_t *gamma_val);
```

**Description**

Get gamma config value

**Parameters**

- [OUT] float32_t *gamma_val: input gamma value pointer, store result

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_gamma_cfg_id

**Function Prototype**

```c
HB_API int32_t hb_disp_get_gamma_cfg_id(float32_t *gamma_val, uint32_t disp_id);
```

**Description**

Get gamma config value for a display device instance

**Parameters**

- [OUT] float32_t *gamma_val: input gamma value pointer, store result
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_gamma_cfg

**Function Prototype**

```c
HB_API int32_t hb_disp_set_gamma_cfg(float32_t gamma_user);
```

**Description**

Set gamma config for a display device instance

**Parameters**

- [IN] float32_t gamma_user: gamma value user want to set

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_gamma_cfg_id

**Function Prototype**

```c
HB_API int32_t hb_disp_set_gamma_cfg_id(float32_t gamma_user, uint32_t disp_id);
```

**Description**

Set gamma config

**Parameters**

- [IN] float32_t gamma_user: gamma value user want to set
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_output_dynamic_cfg_id

**Function Prototype**

```c
HB_API int32_t hb_disp_set_output_dynamic_cfg_id(output_dynamic_cfg_t *dynamic_cfg, uint32_t disp_id);
```

**Description**

Set output dynamic config

**Parameters**

- [IN] output_dynamic_cfg_t *dynamic_cfg: output dynamic value user want to set
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Super; SW: 0.0.1

### hb_disp_get_output_cfg

**Function Prototype**

```c
HB_API int32_t hb_disp_get_output_cfg(output_cfg_t *cfg);
```

**Description**

Get ouput config

**Parameters**

- [OUT] output_cfg_t *cfg: the output config parameters struct that user gets

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_output_cfg_id

**Function Prototype**

```c
HB_API int32_t hb_disp_get_output_cfg_id(output_cfg_t *cfg, uint32_t disp_id);
```

**Description**

Get ouput config of a display device instance

**Parameters**

- [OUT] output_cfg_t *cfg: the output config parameters struct that user gets
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_output_cfg

**Function Prototype**

```c
HB_API int32_t hb_disp_set_output_cfg(output_cfg_t *cfg);
```

**Description**

Set ouput config

**Parameters**

- [IN] output_cfg_t *cfg: the output config parameters struct that user sets

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_output_cfg_id

**Function Prototype**

```c
HB_API int32_t hb_disp_set_output_cfg_id(output_cfg_t *cfg, uint32_t	     disp_id);
```

**Description**

Set ouput config of a display device instance

**Parameters**

- [IN] output_cfg_t *cfg: the output config parameters struct that user sets
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_upscaling_cfg

**Function Prototype**

```c
HB_API int32_t hb_disp_get_upscaling_cfg(upscaling_cfg_t *cfg);
```

**Description**

Get upscale config

**Parameters**

- [OUT] upscaling_cfg_t *cfg: the up scale config parameters struct that user gets

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_upscaling_cfg_id

**Function Prototype**

```c
HB_API int32_t hb_disp_get_upscaling_cfg_id(upscaling_cfg_t *cfg, uint32_t	     disp_id);
```

**Description**

Get upscale config of a display device instance

**Parameters**

- [OUT] upscaling_cfg_t *cfg: the up scale config parameters struct that user gets
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_upscaling_cfg

**Function Prototype**

```c
HB_API int32_t hb_disp_set_upscaling_cfg(const upscaling_cfg_t *cfg);
```

**Description**

Set upscale config of a display device instance

**Parameters**

- [IN] const upscaling_cfg_t *cfg: the up scale config parameters struct that user Sets

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_upscaling_cfg_id

**Function Prototype**

```c
HB_API int32_t hb_disp_set_upscaling_cfg_id(const upscaling_cfg_t *cfg, uint32_t		   disp_id);
```

**Description**

Set upscale config of a display device instance

**Parameters**

- [IN] const upscaling_cfg_t *cfg: the up scale config parameters struct that user Sets
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_channel_cfg

**Function Prototype**

```c
HB_API int32_t hb_disp_get_channel_cfg(uint32_t chn, channel_base_cfg_t *cfg);
```

**Description**

Get channel config parameters

**Parameters**

- [IN] uint32_t chn: the layer number user want to get
- [OUT] channel_base_cfg_t *cfg: the up scale config parameters struct that user Sets

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_channel_cfg_id

**Function Prototype**

```c
HB_API int32_t hb_disp_get_channel_cfg_id(uint32_t chn, channel_base_cfg_t *cfg, uint32_t disp_id);
```

**Description**

Get channel config parameters of a display device instance

**Parameters**

- [IN] uint32_t chn: the layer number user want to get
- [OUT] channel_base_cfg_t *cfg: the channel config parameters struct that user Gets
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_channel_cfg

**Function Prototype**

```c
HB_API int32_t hb_disp_set_channel_cfg(uint32_t			 chn, channel_base_cfg_t *cfg);
```

**Description**

Set channel config parameters of a display device instance

**Parameters**

- [IN] uint32_t chn: the layer number user want to set
- [IN] channel_base_cfg_t *cfg: the up scale config parameters struct that user sets

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_channel_cfg_id

**Function Prototype**

```c
HB_API int32_t hb_disp_set_channel_cfg_id(uint32_t		    chn, channel_base_cfg_t *cfg, uint32_t		    disp_id);
```

**Description**

Set channel config parameters of a display device instance

**Parameters**

- [IN] uint32_t chn: the layer number user want to set
- [IN] channel_base_cfg_t *cfg: the up scale config parameters struct that user sets
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_out_upscale

**Function Prototype**

```c
HB_API int32_t hb_disp_out_upscale(uint32_t src_w, uint32_t src_h, uint32_t tag_w, uint32_t tag_h);
```

**Description**

user config up-scale

**Parameters**

- [IN] uint32_t src_w: width of the source graphic
- [IN] uint32_t src_h: height of the source graphic
- [IN] uint32_t tag_w: width of the target graphic
- [IN] uint32_t tag_h: height of the target graphic

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_out_upscale_id

**Function Prototype**

```c
HB_API int32_t hb_disp_out_upscale_id(uint32_t src_w, uint32_t src_h, uint32_t tag_w, uint32_t tag_h, uint32_t disp_id);
```

**Description**

user config up-scale for a display device instance

**Parameters**

- [IN] uint32_t src_w: width of the source graphic
- [IN] uint32_t src_h: height of the source graphic
- [IN] uint32_t tag_w: width of the target graphic
- [IN] uint32_t tag_h: height of the target graphic
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_display_done

**Function Prototype**

```c
HB_API int32_t hb_disp_get_display_done(void);
```

**Description**

user get the display done flag

**Parameters**

- [IN] None

**Return Value**

0:not done;1:done

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_display_done_id

**Function Prototype**

```c
HB_API int32_t hb_disp_get_display_done_id(uint32_t disp_id);
```

**Description**

user get the display done flag for a display device instance

**Parameters**

- [IN] uint32_t disp_id: display device id

**Return Value**

0:not done;1:done

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_check_video_bufaddr_valid

**Function Prototype**

```c
HB_API int32_t hb_disp_check_video_bufaddr_valid(size_t	  graphic_size, uint32_t disp_layer_no);
```

**Description**

user check whether the graphic size matches the channel

**Parameters**

- [IN] size_t graphic_size: the graphic size
- [IN] uint32_t disp_layer_no: layer number of DISP

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_check_video_bufaddr_valid_id

**Function Prototype**

```c
HB_API int32_t hb_disp_check_video_bufaddr_valid_id(size_t   graphic_size, uint32_t disp_layer_no, uint32_t  disp_id);
```

**Description**

user check whether the graphic size matches the channel

**Parameters**

- [IN] size_t graphic_size: the graphic size
- [IN] uint32_t disp_layer_no: layer number of DISP
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_video_display_done_id

**Function Prototype**

```c
HB_API int32_t hb_disp_get_video_display_done_id(uint32_t layer, uint32_t disp_id);
```

**Description**

user get layer buffer read done flag

**Parameters**

- [IN] uint32_t layer: layer id
- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_video_display_done

**Function Prototype**

```c
HB_API int32_t hb_disp_get_video_display_done(uint32_t layer);
```

**Description**

user get layer buffer read done flag

**Parameters**

- [IN] uint32_t layer: layer id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_disp_done_sync_id

**Function Prototype**

```c
HB_API int32_t hb_disp_get_disp_done_sync_id(uint32_t disp_id, uint64_t rel_seq);
```

**Description**

user wait display vsync flag

**Parameters**

- [IN] uint32_t disp_id: display device id
- [IN] uint64_t rel_seq: user request vsync count

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Super; SW: 0.0.1

### hb_disp_get_capture_buf_id

**Function Prototype**

```c
HB_API int32_t hb_disp_get_capture_buf_id(uint32_t disp_id, uint32_t timeout, struct hb_mem_graphic_buf_t *out_buf);
```

**Description**

user get capture buffer

**Parameters**

- [IN] uint32_t disp_id: display device id
- [IN] uint32_t timeout: wait timeout(ms)
- [OUT] struct hb_mem_graphic_buf_t *out_buf: user import graphic buffer

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Super; SW: 0.0.1

### hb_disp_release_capture_buf_id

**Function Prototype**

```c
HB_API int32_t hb_disp_release_capture_buf_id(uint32_t disp_id, struct hb_mem_graphic_buf_t *out_buf);
```

**Description**

user release capture buffer

**Parameters**

- [IN] uint32_t disp_id: display device id
- [OUT] struct hb_mem_graphic_buf_t *out_buf: user import graphic buffer

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Super; SW: 0.0.1

### hb_disp_set_disp_oneshot_trigger_id

**Function Prototype**

```c
HB_API int32_t hb_disp_set_disp_oneshot_trigger_id(uint32_t disp_id);
```

**Description**

user trigger display control oneshot output

**Parameters**

- [IN] uint32_t disp_id: display device id

**Return Value**

"= 0" success
&lt;0 failed

**Compatibility**
HW: Super; SW: 0.0.1

## Related Documentation

- [DISPLAY API](../../../04_Simple_API/01_multimedia_api/cdev/04_display_api.md)
- [Display Object](../../../04_Simple_API/01_multimedia_api/pydev/05_object_display.md)
- [Capture→Display](../../../03_Demos/02_multimedia_demo/01_cdev/02_vio2display.md)