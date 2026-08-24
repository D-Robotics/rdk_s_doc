---
sidebar_position: 5
title: "Image Signal Processing - ISP"
description: "RDK S100/S600 5.5.1.5 ISP (Image Signal Processing)"
---

# Image Signal Processing - ISP

> **Level note**: This chapter covers the **low-level multimedia API** (board-side `hb_api_isp.h`) — the ISP image signal processing tuning API (functions `hb_isp_*`). It is intended for advanced developers who need to operate the multimedia pipeline directly (Mode 3). If you only need the wrapper features for capture/codec/display, see Chapter 4 [Simple API](../../../04_Simple_API/01_multimedia_api/cdev/01_vio_api.md) (Mode 1).

> **Platform codename note**: Compatibility annotations in this document follow the original wording of the underlying header files. XJ3/J3 and Ultra are earlier-generation upstream platform codenames; X5 denotes the current upstream product line (not these two boards); Super/J6 are the codenames of the architecture family shared by this product line (board-verified: S100/S600 share the same family, with S600 in a multi-core form). An `HW:` list indicates the interface's applicable range across upstream platform generations, where the Super generation corresponds to this product line (inherited from upstream annotations, not verified per-interface on board); `SW` is the upstream software version number — for RDK releases see the Release Notes. Interfaces without codenames are inherited from upstream and not individually verified on RDK.

## Overview

The ISP (Image Signal Processor) image signal processing API (board-side `hb_api_isp.h`, functions `hb_isp_*`). It provides capabilities such as ISP module control, AE/AWB statistics and information query, and retrieval of calibration parameters, hardware parameters, and zone information.

## Software Abstraction

- **Context**: `hb_isp_get_context` retrieves the ISP context.
- **Module control**: `hb_isp_get_module_control` controls the enabling of each ISP sub-module.
- **Statistics & info**: `hb_isp_get_ae_info`/`get_ae_statistics`/`get_awb_info`/`get_awb_statistics`/`get_zone_info`/`get_hist_thresh_info`.
- **Parameters**: `hb_isp_get_calibration_param`/`get_hardware_param`/`get_command_param`/`get_command_range`.
- **Command**: `hb_isp_command` issues ISP commands.

## API Call Flow

1. `hb_isp_get_context` retrieves the ISP context.
2. `hb_isp_get_module_control` configures sub-module enabling.
3. `hb_isp_command` issues tuning commands; `hb_isp_get_ae_info`/`get_awb_info` query statistics.
4. `hb_isp_get_calibration_param`/`get_hardware_param` retrieves calibration and hardware parameters.

## Quick Example

The following example demonstrates the minimal sequence for ISP tuning (based on `hb_api_isp.h`; the pipeline must be started via VIO/HBN first):

```c
#include "hb_api_isp.h"

// 1. Pause the 2A algorithm to enter manual tuning mode
hb_isp_pause_algo(0);

// 2. Query/set the sub-module bypass status
isp_module_ctrl_u mod_ctrl = {0};
hb_isp_get_module_control(0, &mod_ctrl);
mod_ctrl.isp_module_ctrl_reg1.u32Key = 0;   /* disable reg1 sub-module bypass */
hb_isp_set_module_control(0, &mod_ctrl);

// 3. Get the AE statistics and issue manual exposure parameters accordingly
isp_statistics_t ae_stat = {0};
hb_isp_get_ae_statistics(0, &ae_stat, 3000);
/* Calculate exposure/gain based on ae_stat ... */

// 4. Resume the 2A algorithm
hb_isp_run_algo(0);
```

> The board-side tuning tool can be found at `/app/tuning_tool/` (control_tool + scripts); ISP live capture follows the HBN vnode flow (`sample_isp/get_isp_data`). The APIs in this chapter are used for runtime tuning.

## API List

| Function | Description |
| --- | --- |
| hb_isp_run_algo | Run the 2A algorithm (resume automatic tuning) |
| hb_isp_pause_algo | Pause the 2A algorithm (enter manual tuning) |
| hb_isp_set_module_control | Control whether the ISP sub-modules are bypassed; provide an interface to set the ISP sub-module bypass |
| hb_isp_get_module_control | Get the ISP sub-module bypass status; provide an interface to query the ISP sub-module bypass state |
| hb_isp_get_ae_statistics | Get the AE statistics of the current pipeline |
| hb_isp_release_ae_statistics | Release the AE statistics already obtained for the current pipeline |
| hb_isp_get_awb_statistics | Get the AWB statistics of the current pipeline |
| hb_isp_release_awb_statistics | Release the AWB statistics already obtained for the current pipeline |
| hb_isp_command | Dynamically set the parameters corresponding to the ISP command |
| hb_isp_set_context | Dynamically set the ISP context data |
| hb_isp_get_context | Dynamically get the ISP context data |
| hb_isp_set_ae_info | Set ISP AE-related parameters |
| hb_isp_get_ae_info | Get ISP AE-related parameters |
| hb_isp_set_awb_info | Set ISP AWB-related parameters |
| hb_isp_get_awb_info | Get ISP AWB-related parameters |
| hb_isp_get_version | Get the current system's ISP version, ISP algorithm version, and calibration parameter version |
| hb_isp_get_2a_info | Get ISP 2A-related parameter information |
| hb_isp_get_ae5bin_statistics | Get the AE 5-bin statistics |
| hb_isp_get_zone_info | Get the AE zone information |
| hb_isp_set_hist_thresh_info | Set the histogram interval threshold information |
| hb_isp_get_hist_thresh_info | Get the histogram interval threshold information |
| hb_isp_set_calibration_param | Set a calibration parameter |
| hb_isp_get_calibration_param | Get a calibration parameter |
| hb_isp_set_command_param | Set an ISP command parameter |
| hb_isp_get_command_param | Get an ISP command parameter |
| hb_isp_get_command_range | Get the valid range of an ISP command |
| hb_isp_get_hardware_param | Get a hardware parameter |
| hb_isp_set_hardware_param | Set a hardware parameter |
| hb_isp_get_hardware_range | Get the valid range of a hardware parameter |

## API Interface Description

### hb_isp_run_algo

**Function Declaration**

```c
extern int32_t hb_isp_run_algo(uint32_t pipeline_id);
```

**Description**

Run the 2A algorithm (resume automatic tuning).

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_pause_algo

**Function Declaration**

```c
extern int32_t hb_isp_pause_algo(uint32_t pipeline_id);
```

**Description**

Pause the 2A algorithm (enter manual tuning).

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_module_control

**Function Declaration**

```c
extern int32_t hb_isp_set_module_control(uint32_t pipeline_id, const isp_module_ctrl_u *mod_ctrl);
```

**Description**

Control whether the ISP sub-modules are bypassed; provide an interface to set the ISP sub-module bypass.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_module_control

**Function Declaration**

```c
extern int32_t hb_isp_get_module_control(uint32_t pipeline_id, isp_module_ctrl_u *mod_ctrl);
```

**Description**

Get the ISP sub-module bypass status; provide an interface to query the ISP sub-module bypass state.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_ae_statistics

**Function Declaration**

```c
extern int32_t hb_isp_get_ae_statistics(uint32_t pipeline_id, isp_statistics_t *ae_statistics, int32_t time_out);
```

**Description**

Get the AE statistics of the current pipeline.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_release_ae_statistics

**Function Declaration**

```c
extern int32_t hb_isp_release_ae_statistics(uint32_t pipeline_id, isp_statistics_t *ae_statistics);
```

**Description**

Release the AE statistics already obtained for the current pipeline.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_awb_statistics

**Function Declaration**

```c
extern int32_t hb_isp_get_awb_statistics(uint32_t pipeline_id, isp_statistics_t *awb_statistics, int32_t time_out);
```

**Description**

Get the AWB statistics of the current pipeline.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_release_awb_statistics

**Function Declaration**

```c
extern int32_t hb_isp_release_awb_statistics(uint32_t pipeline_id, isp_statistics_t *awb_statistics);
```

**Description**

Release the AWB statistics already obtained for the current pipeline.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_command

**Function Declaration**

```c
extern int32_t hb_isp_command(uint32_t pipeline_id, isp_cmd_api_t *cmd_api);
```

**Description**

Dynamically set the parameters corresponding to the ISP command.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_context

**Function Declaration**

```c
extern int32_t hb_isp_set_context(uint32_t pipeline_id, const isp_context_t *ptx);
```

**Description**

Dynamically set the ISP context data.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_context

**Function Declaration**

```c
extern int32_t hb_isp_get_context(uint32_t pipeline_id, isp_context_t *ptx);
```

**Description**

Dynamically get the ISP context data.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_ae_info

**Function Declaration**

```c
extern int32_t hb_isp_set_ae_info(uint32_t pipeline_id, const ae_info_t *ae_info);
```

**Description**

Set ISP AE-related parameters.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_ae_info

**Function Declaration**

```c
extern int32_t hb_isp_get_ae_info(uint32_t pipeline_id, ae_info_t *ae_info);
```

**Description**

Get ISP AE-related parameters.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_awb_info

**Function Declaration**

```c
extern int32_t hb_isp_set_awb_info(uint32_t pipeline_id, const awb_info_t *awb_info);
```

**Description**

Set ISP AWB-related parameters.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_awb_info

**Function Declaration**

```c
extern int32_t hb_isp_get_awb_info(uint32_t pipeline_id, awb_info_t *awb_info);
```

**Description**

Get ISP AWB-related parameters.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_version

**Function Declaration**

```c
extern int32_t hb_isp_get_version(uint32_t pipeline_id, char *isp_ver, char *algo_ver, char *calib_ver);
```

**Description**

Get the current system's ISP version, ISP algorithm version, and calibration parameter version.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_2a_info

**Function Declaration**

```c
extern int32_t hb_isp_get_2a_info(uint32_t pipeline_id, isp_info_t *isp_info, int time_out);
```

**Description**

Get ISP 2A-related parameter information.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_ae5bin_statistics

**Function Declaration**

```c
extern int32_t hb_isp_get_ae5bin_statistics(uint32_t pipeline_id, isp_ae5bin_stats_t *isp_ae5bin_stats);
```

**Description**

Get the AE 5-bin statistics.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_zone_info

**Function Declaration**

```c
extern int32_t hb_isp_get_zone_info(uint32_t pipeline_id, uint8_t type, isp_zone_info_t *zoneinfo);
```

**Description**

Get the AE zone information.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_hist_thresh_info

**Function Declaration**

```c
extern int32_t hb_isp_set_hist_thresh_info(uint32_t pipeline_id, isp_hist_thresh_info_t *isp_hist_thresh_info);
```

**Description**

Set the histogram interval threshold information.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_hist_thresh_info

**Function Declaration**

```c
extern int32_t hb_isp_get_hist_thresh_info(uint32_t pipeline_id, isp_hist_thresh_info_t *isp_hist_thresh_info);
```

**Description**

Get the histogram interval threshold information.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_calibration_param

**Function Declaration**

```c
extern int32_t hb_isp_set_calibration_param(uint32_t pipeline_id, const char *name, uint32_t param_type, uint32_t param_size, void *ptr);
```

**Description**

Set a calibration parameter.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_calibration_param

**Function Declaration**

```c
extern int32_t hb_isp_get_calibration_param(uint32_t pipeline_id, const char *name, uint32_t param_type, uint32_t param_size, void *ptr);
```

**Description**

Get a calibration parameter.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_command_param

**Function Declaration**

```c
extern int32_t hb_isp_set_command_param(uint32_t pipeline_id, uint32_t section, uint32_t command, uint32_t data);
```

**Description**

Set an ISP command parameter.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_command_param

**Function Declaration**

```c
extern int32_t hb_isp_get_command_param(uint32_t pipeline_id, uint32_t section, uint32_t command, uint32_t *data);
```

**Description**

Get an ISP command parameter.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_command_range

**Function Declaration**

```c
extern int32_t hb_isp_get_command_range(uint32_t pipeline_id, uint32_t section, uint32_t command, uint32_t *max, uint32_t *min);
```

**Description**

Get the valid range of an ISP command.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_hardware_param

**Function Declaration**

```c
extern int32_t hb_isp_get_hardware_param(uint32_t pipeline_id, const char *name, uint32_t param_size, uint32_t *ptr);
```

**Description**

Get a hardware parameter.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_hardware_param

**Function Declaration**

```c
extern int32_t hb_isp_set_hardware_param(uint32_t pipeline_id, const char *name, uint32_t param_size, uint32_t *ptr);
```

**Description**

Set a hardware parameter.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_hardware_range

**Function Declaration**

```c
extern int32_t hb_isp_get_hardware_range(uint32_t pipeline_id, const char *name, uint32_t *max, uint32_t *min);
```

**Description**

Get the valid range of a hardware parameter.

**Return Value**

zero: Success
less than zero: Fail, returns an error code

**Compatibility**

HW: Ultra/Super; SW: 1.0.0

## Related Documentation

- [Video Input/Output - VIO](./04_vio_api.md)
- [Video Processing Framework - VPF/PYM](./06_vpf_pym_api.md)