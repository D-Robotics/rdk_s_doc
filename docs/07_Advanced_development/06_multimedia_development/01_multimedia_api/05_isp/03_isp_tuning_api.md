---
sidebar_position: 3
title: "ISP Tuning API"
description: "RDK S100/S600 ISP 运行时调参接口（hbn_isp_*）"
---

# ISP Tuning API

## 概述

ISP 私有接口（`hbn_isp_*`，板端 `hbn_api_isp.h`）共 26 个函数，在**流跑起来之后**对 ISP 做运行时调参和状态读取。它们**不动数据流，只控制 ISP 本身**，既可与数据流控制同进程使用，也可分进程独立调用。


## API 列表

接口总览如下（说明沿用头文件注释原文）：

| 函数 | 说明 |
| --- | --- |
| `hbn_isp_set_algo` | set isp algo opt mode; 设置 2A 算法开关（自动/手动切换） |
| `hbn_isp_get_algo` | get isp algo opt mode; 获取 2A 算法开关状态 |
| `hbn_isp_set_module_control` | control isp modual bypass or not; 提供设置ISP子模块bypass与否的接口 |
| `hbn_isp_get_module_control` | get isp modual bypass status; 获取设置ISP子模块bypass与否状态的接口 |
| `hbn_isp_get_ae_statistics` | get ae statistics; 获取当前通路的ae统计数据 |
| `hbn_isp_release_ae_statistics` | relese ae statistics; 释放已获取的当前通路的ae统计数据 |
| `hbn_isp_get_awb_statistics` | get awb statistics; 获取当前通路的awb统计数据 |
| `hbn_isp_release_awb_statistics` | release awb statistics; 释放已获取的当前通路的awb统计数据 |
| `hbn_isp_command` | set isp command with api and value; 动态设置ISP cmd的对应的参数 |
| `hbn_isp_set_context` | set isp context value; 动态设置isp ctx数据 |
| `hbn_isp_get_context` | get isp context value; 动态获取isp ctx数据 |
| `hbn_isp_set_ae_info` | set isp ae info value; 设置isp ae相关参数 |
| `hbn_isp_get_ae_info` | get isp ae info value; 获取isp ae相关参数 |
| `hbn_isp_set_awb_info` | set isp awb info value; 设置isp awb相关参数 |
| `hbn_isp_get_awb_info` | get isp awb info value; 获取isp awb相关参数 |
| `hbn_isp_get_version` | get current isp,2a, calibration version; 获取当前系统的ISP版本，ISP算法版本和较准参数版本 |
| `hbn_isp_get_2a_info` | get isp 2a info value; 获取isp 2a相关参数信息 |
| `hbn_isp_get_ae5bin_statistics` | get ae 5bin statustics value; 获取ae 5bin统计数据 |
| `hbn_isp_release_ae5bin_statistics` | release ae 5bin statistics; 释放ae 5bin统计数据 |
| `hbn_isp_get_pixel_consistency` | get pixel consistency; 获取像素一致性统计 |
| `hbn_isp_release_pixel_consistency` | release pixel consistency; 释放像素一致性统计 |
| `hbn_isp_get_zone_info` | get zone info value; 获取ae zone区域信息 |
| `hbn_isp_set_hist_thresh_info` | set histgram thresh info; 设置histgram区间门限信息 |
| `hbn_isp_get_hist_thresh_info` | get histgram thresh info; 获取histgram区间门限信息 |
| `hbn_isp_get_command_range` | get command range; 获取 command 参数范围 |
| `hbn_isp_get_hardware_range` | get hardware range; 获取hardware 参数范围 |


## API 说明

以下按「API 列表」的顺序，逐个给出函数原型、参数、返回值与兼容性：

#### hbn_isp_set_algo

【函数原型】

```c
extern int32_t hbn_isp_set_algo(hbn_vnode_handle_t vnode_fd, isp_algo_type_e algo_type, opt_mode_e opt_mode);
```

【功能描述】

set isp algo opt mode; 设置 2A 算法开关（自动/手动）

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] isp_algo_type_e algo_type: algo type; 算法类型（如 AE/AWB）
- [IN] opt_mode_e opt_mode: opt mode; 开关模式（自动/手动）

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_algo

【函数原型】

```c
extern int32_t hbn_isp_get_algo(hbn_vnode_handle_t vnode_fd, isp_algo_type_e algo_type, opt_mode_e *opt_mode);
```

【功能描述】

get isp algo opt mode; 获取 2A 算法开关状态

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] isp_algo_type_e algo_type: algo type; 算法类型（如 AE/AWB）
- [OUT] opt_mode_e *opt_mode: opt mode; 开关模式（自动/手动）

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_set_module_control

【函数原型】

```c
extern int32_t hbn_isp_set_module_control(hbn_vnode_handle_t vnode_fd, const isp_module_ctrl_u *mod_ctrl);
```

【功能描述】

control isp modual bypass or not; 提供设置ISP子模块bypass与否的接口

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] const isp_module_ctrl_u *mod_ctrl: module control value; 设置ISP内部模块运行与否状态

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_module_control

【函数原型】

```c
extern int32_t hbn_isp_get_module_control(hbn_vnode_handle_t vnode_fd, isp_module_ctrl_u *mod_ctrl);
```

【功能描述】

get isp modual bypass status; 获取设置ISP子模块bypass与否状态的接口

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [OUT] isp_module_ctrl_u *mod_ctrl: module control value; 获取ISP内部模块运行与否状态

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_ae_statistics

【函数原型】

```c
extern int32_t hbn_isp_get_ae_statistics(hbn_vnode_handle_t vnode_fd, isp_statistics_t *ae_statistics, int32_t time_out);
```

【功能描述】

get ae statistics; 获取当前通路的ae统计数据

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] int32_t time_out: timeout value; 接口超时时间; range:[0, 2147483647],default:3000
- [OUT] isp_statistics_t *ae_statistics: ae statistics; ae统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_release_ae_statistics

【函数原型】

```c
extern int32_t hbn_isp_release_ae_statistics(hbn_vnode_handle_t vnode_fd, isp_statistics_t *ae_statistics);
```

【功能描述】

relese ae statistics; 释放已获取的当前通路的ae统计数据

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] isp_statistics_t *ae_statistics: ae statistics; ae统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_awb_statistics

【函数原型】

```c
extern int32_t hbn_isp_get_awb_statistics(hbn_vnode_handle_t vnode_fd, isp_statistics_t *awb_statistics, int32_t time_out);
```

【功能描述】

get awb statistics; 获取当前通路的awb统计数据

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] int32_t time_out: timeout value; 接口超时时间; range:[0, 2147483647],default:3000
- [OUT] isp_statistics_t *awb_statistics: awb statistics; awb统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_release_awb_statistics

【函数原型】

```c
extern int32_t hbn_isp_release_awb_statistics(hbn_vnode_handle_t vnode_fd, isp_statistics_t *awb_statistics);
```

【功能描述】

release awb statistics; 释放已获取的当前通路的awb统计数据

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] isp_statistics_t *awb_statistics: awb statistics; awb统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_command

【函数原型】

```c
extern int32_t hbn_isp_command(hbn_vnode_handle_t vnode_fd, isp_cmd_api_t *cmd_api);
```

【功能描述】

set isp command with api and value; 动态设置ISP cmd的对应的参数

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] isp_cmd_api_t *cmd_api: isp cmd api and data vale; 对应isp提供的cmd的id值和对应的参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_set_context

【函数原型】

```c
extern int32_t hbn_isp_set_context(hbn_vnode_handle_t vnode_fd, const isp_context_t *ptx);
```

【功能描述】

set isp context value; 动态设置isp ctx数据

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] const isp_context_t *ptx: store context data point; isp ctx数据对应的地址，需外部提前申请好

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_context

【函数原型】

```c
extern int32_t hbn_isp_get_context(hbn_vnode_handle_t vnode_fd, isp_context_t *ptx);
```

【功能描述】

get isp context value; 动态获取isp ctx数据

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [OUT] isp_context_t *ptx: store context data point; isp ctx数据对应的地址，需外部提前申请好

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_set_ae_info

【函数原型】

```c
extern int32_t hbn_isp_set_ae_info(hbn_vnode_handle_t vnode_fd, const ae_info_t *ae_info);
```

【功能描述】

set isp ae info value; 设置isp ae相关参数

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] const ae_info_t *ae_info: ae info value; ae info 参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_ae_info

【函数原型】

```c
extern int32_t hbn_isp_get_ae_info(hbn_vnode_handle_t vnode_fd, ae_info_t *ae_info);
```

【功能描述】

get isp ae info value; 获取isp ae相关参数

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [OUT] ae_info_t *ae_info: ae info value; ae info参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_set_awb_info

【函数原型】

```c
extern int32_t hbn_isp_set_awb_info(hbn_vnode_handle_t vnode_fd, const awb_info_t *awb_info);
```

【功能描述】

set isp awb info value; 设置isp awb相关参数

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] const awb_info_t *awb_info: awb info value; awb参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_awb_info

【函数原型】

```c
extern int32_t hbn_isp_get_awb_info(hbn_vnode_handle_t vnode_fd, awb_info_t *awb_info);
```

【功能描述】

get isp awb info value; 获取isp awb相关参数

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [OUT] awb_info_t *awb_info: awb info value; awb参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_version

【函数原型】

```c
extern int32_t hbn_isp_get_version(hbn_vnode_handle_t vnode_fd, char *isp_ver, char *algo_ver, char *calib_ver);
```

【功能描述】

get current isp,2a, calibration version; 获取当前系统的ISP版本，ISP算法版本和较准参数版本

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [OUT] char *isp_ver: isp系统软件版本
- [OUT] char *algo_ver: 2a算法版本
- [OUT] char *calib_ver: tuning参数的版本号，尺寸必须大于100byte

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_2a_info

【函数原型】

```c
extern int32_t hbn_isp_get_2a_info(hbn_vnode_handle_t vnode_fd, isp_info_t *isp_info, int time_out);
```

【功能描述】

get isp 2a info value; 获取isp 2a相关参数信息

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] int32_t time_out: timeout value; 接口超时时间; range:[0, 2147483647],default:3000
- [OUT] isp_info_t *isp_info: isp 2a info; isp 2a统计数据信息

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_ae5bin_statistics

【函数原型】

```c
extern int32_t hbn_isp_get_ae5bin_statistics(hbn_vnode_handle_t vnode_fd, isp_statistics_t *isp_ae5bin_stats, int32_t time_out);
```

【功能描述】

get ae 5bin statustics value; 获取ae 5bin统计数据

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] int32_t time_out: timeout value; 接口超时时间; range: [0, 2147483647], default: 3000
- [OUT] isp_statistics_t *isp_ae5bin_stats: ae 5bin statistics value; ae5bin统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_release_ae5bin_statistics

【函数原型】

```c
extern int32_t hbn_isp_release_ae5bin_statistics(hbn_vnode_handle_t vnode_fd, isp_statistics_t *isp_ae5bin_stats);
```

【功能描述】

release ae 5bin statistics; 释放ae 5bin统计数据

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] isp_statistics_t *isp_ae5bin_stats: ae 5bin statistics value; ae5bin统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_pixel_consistency

【函数原型】

```c
extern int32_t hbn_isp_get_pixel_consistency(hbn_vnode_handle_t vnode_fd, isp_statistics_t *pixel_consistency, int32_t time_out);
```

【功能描述】

get pixel consistency; 获取像素一致性统计

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] int32_t time_out: timeout value; 接口超时时间; range: [0, 2147483647], default: 3000
- [OUT] isp_statistics_t *pixel_consistency: pixel consistency; 像素一致性统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_release_pixel_consistency

【函数原型】

```c
extern int32_t hbn_isp_release_pixel_consistency(hbn_vnode_handle_t vnode_fd, isp_statistics_t *pixel_consistency);
```

【功能描述】

release pixel consistency; 释放像素一致性统计

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] isp_statistics_t *pixel_consistency: pixel consistency; 像素一致性统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_zone_info

【函数原型】

```c
extern int32_t hbn_isp_get_zone_info(hbn_vnode_handle_t vnode_fd, uint8_t type, isp_zone_info_t *zoneinfo);
```

【功能描述】

get zone info value; 获取ae zone区域信息

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] uint8_t type: isp zone type; isp统计信息的类型
- [OUT] isp_zone_info_t *zoneinfo: isp zone inof; isp 统计区域范围信息; range:[0, 15],default:0

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_set_hist_thresh_info

【函数原型】

```c
extern int32_t hbn_isp_set_hist_thresh_info(hbn_vnode_handle_t vnode_fd, isp_hist_thresh_info_t *isp_hist_thresh_info);
```

【功能描述】

set histgram thresh info; 设置histgram区间门限信息

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] isp_hist_thresh_info_t *isp_hist_thresh_info: isp hist thresh info; isp hist分区门限参数; range:[0, 255],default:0

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_hist_thresh_info

【函数原型】

```c
extern int32_t hbn_isp_get_hist_thresh_info(hbn_vnode_handle_t vnode_fd, isp_hist_thresh_info_t *isp_hist_thresh_info);
```

【功能描述】

get histgram thresh info; 获取histgram区间门限信息

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [OUT] isp_hist_thresh_info_t *isp_hist_thresh_info: isp hist thresh info; isp hist分区门限参数; range:[0, 255],default:0

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_command_range

【函数原型】

```c
extern int32_t hbn_isp_get_command_range(hbn_vnode_handle_t vnode_fd, uint32_t section, uint32_t command, uint32_t *max, uint32_t *min);
```

【功能描述】

get command range; 获取 command 参数范围

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] uint32_t section: api section(not used); api section(目前没有实际使用)
- [IN] uint32_t command: command value; command参数
- [OUT] uint32_t *max: ptr max; command max 数据指针
- [OUT] uint32_t *min: ptr min; command min 数据指针

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

#### hbn_isp_get_hardware_range

【函数原型】

```c
extern int32_t hbn_isp_get_hardware_range(hbn_vnode_handle_t vnode_fd, const char *name, uint32_t *max, uint32_t *min);
```

【功能描述】

get hardware range; 获取hardware 参数范围

【参数】

- [IN] hbn_vnode_handle_t vnode_fd: vnode fd; vnode设备节点fd值; range: [0, 2147483647], default: 0
- [IN] const char *name: param name; 参数名称
- [OUT] uint32_t *max: ptr max; command max 数据指针
- [OUT] uint32_t *min: ptr min; command min 数据指针

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0



## 数据结构

`hbn_isp_*` 接口用到的数据结构定义在板端 `hb_comm_isp.h`，逐个说明如下。

#### isp_algo_type_e / opt_mode_e —— 2A 算法与开关模式

用于 `hbn_isp_set_algo` / `hbn_isp_get_algo` 的两个枚举。

**isp_algo_type_e**：

| 名称 | 值 | 含义 |
| --- | --- | --- |
| ISP_ALGO_AE | 0 | AE 算法 |
| ISP_ALGO_AWB | 1 | AWB 算法 |

**opt_mode_e**：

| 名称 | 值 | 含义 |
| --- | --- | --- |
| OPT_MODE_AUTO | 0 | 自动 |
| OPT_MODE_MANUAL | 1 | 手动 |

#### ae_info_t —— AE 曝光参数

用于 `hbn_isp_set_ae_info` / `hbn_isp_get_ae_info`。

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| ae_exposure | uint32_t | 0 | 0xFFFF | FFFF | 曝光值 | 是 |
| again | uint32_t | 0 | 255 | 0 | 模拟增益 | 是 |
| dgain | uint32_t | 0 | 255 | 0 | 数字增益 | 是 |
| ispgain | uint32_t | 0 | 255 | 0 | ISP 增益 | 是 |
| sys_exposure | uint32_t | 0 | 0x7FFF,FFFF | FFFF | 系统曝光值 | 是 |
| status_info_exp_log2 | uint32_t | - | - | - | 曝光对数（只读） | 否 |
| cur_lux | uint32_t | - | - | - | 当前照度（只读） | 否 |

#### awb_info_t —— AWB 白平衡参数

用于 `hbn_isp_set_awb_info` / `hbn_isp_get_awb_info`。

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
| --- | --- | --- | --- | --- | --- | --- |
| rgain | uint32_t | 0 | 4095 | - | 红通道增益（4.8 定点，实际作用于图像） | 是 |
| bgain | uint32_t | 0 | 4095 | - | 蓝通道增益（4.8 定点，实际作用于图像） | 是 |
| cct | uint32_t | 0 | 4095 | - | 色温 | 是 |

:::note 增益误差
增益不走浮点运算，set 之后再 get，读回值与设定值会有小于 2 的误差（例如设 100 读回 99），属正常现象。
:::

#### isp_statistics_t —— 统计数据句柄

用于 `hbn_isp_get_ae_statistics` / `get_awb_statistics` / `get_ae5bin_statistics` / `get_pixel_consistency` 及对应的 `hbn_isp_release_*`。

| 名称 | 类型 | 读/写 | 含义 | 必选 |
| --- | --- | --- | --- | --- |
| crc_en | HB_BOOL | RW | 统计内部 CRC 校验开关 | 否 |
| data | void* | RO | 统计数据起始地址 | 是 |
| len | uint32_t | RO | 统计数据长度（字节） | 是 |
| frame_id | uint32_t | RO | 统计对应的帧号 | 是 |
| timestamp | uint64_t | RO | 统计时间戳 | 是 |
| buf_idx | uint32_t | RO | buffer 索引，release 时据此归还对应 buffer | 是 |

get 拿到的 buffer 用完后，把**同一个结构体**原样传给对应的 `hbn_isp_release_*`，按 `buf_idx` 归还。

#### isp_cmd_api_t —— 在线调参命令

用于 `hbn_isp_command`。

| 名称 | 类型 | 读/写 | 含义 | 必选 |
| --- | --- | --- | --- | --- |
| cmd_type | isp_cmd_type_e | RW | cmd 分类，见下表 | 是 |
| cmd | isp_cmd_e | RW | 具体命令 id，取值见 `hb_comm_isp.h` 的 `isp_cmd_e` 枚举 | 是 |
| set_value | uint32_t | RW | 写入值，范围 [0, 0xffffffff] | dir=SET 时必填 |
| dir | isp_cmd_dir_e | RW | 方向：`ISP_CMD_DIR_SET`(0) 写 / `ISP_CMD_DIR_GET`(1) 读 | 是 |
| ret_value | uint32_t | RW | 读回值，范围 [0, 0xffffffff] | dir=GET 时有效 |

**isp_cmd_type_e**：

| 名称 | 值 | 含义 |
| --- | --- | --- |
| ISP_CMD_TYPE_TSELFTEST | 0 | 自检 |
| ISP_CMD_TYPE_TGENERAL | 1 | 通用 |
| ISP_CMD_TYPE_TSENSOR | 2 | sensor 相关 |
| ISP_CMD_TYPE_TSYSTEM | 3 | 系统 |
| ISP_CMD_TYPE_TIMAGE | 4 | 图像 |
| ISP_CMD_TYPE_TALGORITHMS | 5 | 算法 |
| ISP_CMD_TYPE_TREGISTERS | 6 | 寄存器 |
| ISP_CMD_TYPE_TSTATUS | 7 | 状态 |
| ISP_CMD_TYPE_TISP_MODULES | 8 | ISP 子模块 |

#### isp_module_ctrl_u —— 子模块 bypass 控制

用于 `hbn_isp_set_module_control` / `hbn_isp_get_module_control`。

一个 32 位 union：整体可按 `u32Key` 读写；按位域逐位控制，每个 `bitBypass<子模块名>` 置 1 即让对应处理环节 **bypass（直通不处理）**。位域摘录：

| 名称（位域） | bit 位 | 含义 | 必选 |
| --- | --- | --- | --- |
| bitBypassInputFormatter | [2] | bypass 输入格式化 | 否 |
| bitBypassChannelSwitch | [3] | bypass 通道切换 | 否 |
| bitBypassVideoTest | [4] | bypass 测试图案 | 否 |
| bitBypassRawFrontend | [5] | bypass RAW 前处理 | 否 |
| bitBypassDefectPixel | [6] | bypass 坏点校正 | 否 |
| bitBypassGammaFe | [8] | bypass gamma FE | 否 |

完整位定义（数字增益、sinter、去马赛克等 30 余位）见 `hb_comm_isp.h` 的 `tag_isp_module_ctrl_u`。

#### isp_context_t —— ISP context 数据

用于 `hbn_isp_set_context` / `hbn_isp_get_context`。

| 名称 | 类型 | 读/写 | 含义 | 必选 |
| --- | --- | --- | --- | --- |
| frame_id | uint32_t | RO | 帧号 | 是 |
| timestamp | uint64_t | RO | 时间戳 | 是 |
| crc16 | uint16_t | RO | CRC16 校验值 | 否 |
| ptr | void* | RW | context 数据缓冲地址，用户提前分配（最大 128KB / LEN_ADDR_ISP） | 是 |
| len | uint32_t | RO | 实际寄存器数据字节数 | 是 |

#### isp_info_t —— 2A 综合信息

用于 `hbn_isp_get_2a_info`，一次查询 AE / AWB / 统计数据的地址。

| 名称 | 类型 | 含义 | 必选 |
| --- | --- | --- | --- |
| frame_id | uint32_t | 帧号 | 是 |
| timestamp | uint64_t | 时间戳 | 是 |
| ae_info | ae_info_t | 当前 AE 参数 | 是 |
| awb_info | awb_info_t | 当前 AWB 参数 | 是 |
| isp_context | isp_context_t | context 信息 | 是 |
| ae_ptr | void* | AE 统计数据地址 | 是 |
| ae_5bin_ptr | void* | AE 5bin 统计数据地址 | 是 |
| lumvar_ptr | void* | lumvar 数据地址 | 是 |
| awb_ptr | void* | AWB 统计数据地址 | 是 |
| af_ptr | void* | AF 数据地址 | 是 |

#### isp_zone_info_t —— 统计区域划分

用于 `hbn_isp_get_zone_info`，返回统计区域的 `h × v` 网格划分。

| 名称 | 类型 | 含义 | 必选 |
| --- | --- | --- | --- |
| h | uint8_t | 水平方向 zone 数 | 是 |
| v | uint8_t | 垂直方向 zone 数 | 是 |

#### isp_hist_thresh_info_t —— 直方图区间门限

用于 `hbn_isp_set_hist_thresh_info` / `hbn_isp_get_hist_thresh_info`。

| 名称 | 类型 | 含义 | 必选 |
| --- | --- | --- | --- |
| hist_01 | uint16_t | 直方图区间 0-1 门限 | 是 |
| hist_12 | uint16_t | 直方图区间 1-2 门限 | 是 |
| hist_34 | uint16_t | 直方图区间 3-4 门限 | 是 |
| hist_45 | uint16_t | 直方图区间 4-5 门限 | 是 |


## 相关文档

- [基础框架 - HBN](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
- [ISP概览](./overview)
- [ISP HBN API](./isp_hbn_api)
