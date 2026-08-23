---
sidebar_position: 5
title: "图像信号处理 - ISP"
description: "RDK S100/S600 5.5.1.5 ISP（图像信号处理）"
---

# 图像信号处理 - ISP

> **层级说明**：本篇是【底层多媒体 API】（板端 `hb_api_isp.h`），ISP 图像信号处理调参 API（函数 `hb_isp_*`）。面向需要直接操作多媒体 pipeline 的进阶开发（模式 3）；若只需跑通采集/编解码/显示的封装功能，见第 4 章 [简易 API](/Simple_API/multimedia_api/cdev/vio_api)（模式 1）。

> **平台代号说明**：本文兼容性标注沿用底层头文件原始写法——XJ3/J3、Ultra 为更早代上游平台代号，X5 为现行上游产品线代号（非本两板），Super/J6 为本产品线同源架构代号（板端实证：S100/S600 同源，S600 为多核形态）。`HW:` 列表表示该接口在上游多代平台的适用范围，其中 Super 代即对应本产品线（继承自上游标注，未逐一板端验证）；`SW` 为上游软件版本号，RDK 对应版本以 Release Note 为准。未列入代号的接口表示继承自上游、RDK 侧未逐一验证。

## 概述

ISP（Image Signal Processor）图像信号处理 API（板端 `hb_api_isp.h`，函数 `hb_isp_*`）。提供 ISP 模块控制、AE/AWB 统计与信息查询、标定参数、硬件参数与分区信息获取等能力。

## 软件抽象

- **context**：`hb_isp_get_context` 获取 ISP 上下文。
- **模块控制**：`hb_isp_get_module_control` 控制 ISP 各子模块使能。
- **统计与信息**：`hb_isp_get_ae_info`/`get_ae_statistics`/`get_awb_info`/`get_awb_statistics`/`get_zone_info`/`get_hist_thresh_info`。
- **参数**：`hb_isp_get_calibration_param`/`get_hardware_param`/`get_command_param`/`get_command_range`。
- **命令**：`hb_isp_command` 下发 ISP 命令。

## API 调用流程

1. `hb_isp_get_context` 获取 ISP context。
2. `hb_isp_get_module_control` 配置子模块使能。
3. `hb_isp_command` 下发调参命令；`hb_isp_get_ae_info`/`get_awb_info` 等查询统计。
4. `hb_isp_get_calibration_param`/`get_hardware_param` 获取标定与硬件参数。

## 快速示例

以下示例演示 ISP 调参的最小序列（基于 `hb_api_isp.h`；pipeline 需先经 VIO/HBN 启动）：

```c
#include "hb_api_isp.h"

// 1. 暂停 2A 算法，进入手动调参模式
hb_isp_pause_algo(0);

// 2. 查询/设置子模块 bypass 状态
isp_module_ctrl_u mod_ctrl = {0};
hb_isp_get_module_control(0, &mod_ctrl);
mod_ctrl.isp_module_ctrl_reg1.u32Key = 0;   /* 关闭 reg1 各子模块 bypass */
hb_isp_set_module_control(0, &mod_ctrl);

// 3. 获取 AE 统计，据此下发手动曝光参数
isp_statistics_t ae_stat = {0};
hb_isp_get_ae_statistics(0, &ae_stat, 3000);
/* 根据 ae_stat 计算曝光/增益 ... */

// 4. 恢复 2A 算法
hb_isp_run_algo(0);
```

> 板端调参工具见 `/app/tuning_tool/`（control_tool + scripts）；ISP 实况取流走 HBN vnode 流程（`sample_isp/get_isp_data`），本篇 API 用于运行期调参。

## API 列表

| 函数 | 说明 |
| --- | --- |
| hb_isp_run_algo | run 2a algorithm; 恢复 2A 算法（自动调参） |
| hb_isp_pause_algo | pause 2a algorithm; 暂停 2A 算法（进入手动调参） |
| hb_isp_set_module_control | control isp modual bypass or not; 提供设置ISP子模块bypass与否的接口 |
| hb_isp_get_module_control | get isp modual bypass status; 获取设置ISP子模块bypass与否状态的接口 |
| hb_isp_get_ae_statistics | get ae statistics; 获取当前通路的ae统计数据 |
| hb_isp_release_ae_statistics | relese ae statistics; 释放已获取的当前通路的ae统计数据 |
| hb_isp_get_awb_statistics | get awb statistics; 获取当前通路的awb统计数据 |
| hb_isp_release_awb_statistics | release awb statistics; 释放已获取的当前通路的awb统计数据 |
| hb_isp_command | set isp command with api and value; 动态设置ISP cmd的对应的参数 |
| hb_isp_set_context | set isp context value; 动态设置isp ctx数据 |
| hb_isp_get_context | get isp context value; 动态获取isp ctx数据 |
| hb_isp_set_ae_info | set isp ae info value; 设置isp ae相关参数 |
| hb_isp_get_ae_info | get isp ae info value; 获取isp ae相关参数 |
| hb_isp_set_awb_info | set isp awb info value; 设置isp awb相关参数 |
| hb_isp_get_awb_info | get isp awb info value; 获取isp awb相关参数 |
| hb_isp_get_version | get current isp,2a, calibration version; 获取当前系统的ISP版本，ISP算法版本和较准参数版本 |
| hb_isp_get_2a_info | get isp 2a info value; 获取isp 2a相关参数信息 |
| hb_isp_get_ae5bin_statistics | get ae 5bin statustics value; 获取ae 5bin统计数据 |
| hb_isp_get_zone_info | get zone info value; 获取ae zone区域信息 |
| hb_isp_set_hist_thresh_info | set histgram thresh info; 设置histgram区间门限信息 |
| hb_isp_get_hist_thresh_info | get histgram thresh info; 获取histgram区间门限信息 |
| hb_isp_set_calibration_param | set calibration param; 设置 calibration 参数 |
| hb_isp_get_calibration_param | get calibration param; 获取 calibration 参数 |
| hb_isp_set_command_param | set command param; 设置 command 参数 |
| hb_isp_get_command_param | get command param; 获取 command 参数 |
| hb_isp_get_command_range | get command range; 获取 command 参数范围 |
| hb_isp_get_hardware_param | get hardware param; 获取 hardware 参数 |
| hb_isp_set_hardware_param | set hardware param; 设置hardware参数 |
| hb_isp_get_hardware_range | get hardware range; 获取hardware 参数范围 |

## API 接口说明

### hb_isp_run_algo

【函数声明】

```c
extern int32_t hb_isp_run_algo(uint32_t pipeline_id);
```

【功能描述】

run 2a algorithm; 恢复 2A 算法（自动调参）

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_pause_algo

【函数声明】

```c
extern int32_t hb_isp_pause_algo(uint32_t pipeline_id);
```

【功能描述】

pause 2a algorithm; 暂停 2A 算法（进入手动调参）

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_module_control

【函数声明】

```c
extern int32_t hb_isp_set_module_control(uint32_t pipeline_id, const isp_module_ctrl_u *mod_ctrl);
```

【功能描述】

control isp modual bypass or not; 提供设置ISP子模块bypass与否的接口

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_module_control

【函数声明】

```c
extern int32_t hb_isp_get_module_control(uint32_t pipeline_id, isp_module_ctrl_u *mod_ctrl);
```

【功能描述】

get isp modual bypass status; 获取设置ISP子模块bypass与否状态的接口

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_ae_statistics

【函数声明】

```c
extern int32_t hb_isp_get_ae_statistics(uint32_t pipeline_id, isp_statistics_t *ae_statistics, int32_t time_out);
```

【功能描述】

get ae statistics; 获取当前通路的ae统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_release_ae_statistics

【函数声明】

```c
extern int32_t hb_isp_release_ae_statistics(uint32_t pipeline_id, isp_statistics_t *ae_statistics);
```

【功能描述】

relese ae statistics; 释放已获取的当前通路的ae统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_awb_statistics

【函数声明】

```c
extern int32_t hb_isp_get_awb_statistics(uint32_t pipeline_id, isp_statistics_t *awb_statistics, int32_t time_out);
```

【功能描述】

get awb statistics; 获取当前通路的awb统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_release_awb_statistics

【函数声明】

```c
extern int32_t hb_isp_release_awb_statistics(uint32_t pipeline_id, isp_statistics_t *awb_statistics);
```

【功能描述】

release awb statistics; 释放已获取的当前通路的awb统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_command

【函数声明】

```c
extern int32_t hb_isp_command(uint32_t pipeline_id, isp_cmd_api_t *cmd_api);
```

【功能描述】

set isp command with api and value; 动态设置ISP cmd的对应的参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_context

【函数声明】

```c
extern int32_t hb_isp_set_context(uint32_t pipeline_id, const isp_context_t *ptx);
```

【功能描述】

set isp context value; 动态设置isp ctx数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_context

【函数声明】

```c
extern int32_t hb_isp_get_context(uint32_t pipeline_id, isp_context_t *ptx);
```

【功能描述】

get isp context value; 动态获取isp ctx数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_ae_info

【函数声明】

```c
extern int32_t hb_isp_set_ae_info(uint32_t pipeline_id, const ae_info_t *ae_info);
```

【功能描述】

set isp ae info value; 设置isp ae相关参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_ae_info

【函数声明】

```c
extern int32_t hb_isp_get_ae_info(uint32_t pipeline_id, ae_info_t *ae_info);
```

【功能描述】

get isp ae info value; 获取isp ae相关参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_awb_info

【函数声明】

```c
extern int32_t hb_isp_set_awb_info(uint32_t pipeline_id, const awb_info_t *awb_info);
```

【功能描述】

set isp awb info value; 设置isp awb相关参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_awb_info

【函数声明】

```c
extern int32_t hb_isp_get_awb_info(uint32_t pipeline_id, awb_info_t *awb_info);
```

【功能描述】

get isp awb info value; 获取isp awb相关参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_version

【函数声明】

```c
extern int32_t hb_isp_get_version(uint32_t pipeline_id, char *isp_ver, char *algo_ver, char *calib_ver);
```

【功能描述】

get current isp,2a, calibration version; 获取当前系统的ISP版本，ISP算法版本和较准参数版本

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_2a_info

【函数声明】

```c
extern int32_t hb_isp_get_2a_info(uint32_t pipeline_id, isp_info_t *isp_info, int time_out);
```

【功能描述】

get isp 2a info value; 获取isp 2a相关参数信息

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_ae5bin_statistics

【函数声明】

```c
extern int32_t hb_isp_get_ae5bin_statistics(uint32_t pipeline_id, isp_ae5bin_stats_t *isp_ae5bin_stats);
```

【功能描述】

get ae 5bin statustics value; 获取ae 5bin统计数据

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_zone_info

【函数声明】

```c
extern int32_t hb_isp_get_zone_info(uint32_t pipeline_id, uint8_t type, isp_zone_info_t *zoneinfo);
```

【功能描述】

get zone info value; 获取ae zone区域信息

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_hist_thresh_info

【函数声明】

```c
extern int32_t hb_isp_set_hist_thresh_info(uint32_t pipeline_id, isp_hist_thresh_info_t *isp_hist_thresh_info);
```

【功能描述】

set histgram thresh info; 设置histgram区间门限信息

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_hist_thresh_info

【函数声明】

```c
extern int32_t hb_isp_get_hist_thresh_info(uint32_t pipeline_id, isp_hist_thresh_info_t *isp_hist_thresh_info);
```

【功能描述】

get histgram thresh info; 获取histgram区间门限信息

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_calibration_param

【函数声明】

```c
extern int32_t hb_isp_set_calibration_param(uint32_t pipeline_id, const char *name, uint32_t param_type, uint32_t param_size, void *ptr);
```

【功能描述】

set calibration param; 设置 calibration 参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_calibration_param

【函数声明】

```c
extern int32_t hb_isp_get_calibration_param(uint32_t pipeline_id, const char *name, uint32_t param_type, uint32_t param_size, void *ptr);
```

【功能描述】

get calibration param; 获取 calibration 参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_command_param

【函数声明】

```c
extern int32_t hb_isp_set_command_param(uint32_t pipeline_id, uint32_t section, uint32_t command, uint32_t data);
```

【功能描述】

set command param; 设置 command 参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_command_param

【函数声明】

```c
extern int32_t hb_isp_get_command_param(uint32_t pipeline_id, uint32_t section, uint32_t command, uint32_t *data);
```

【功能描述】

get command param; 获取 command 参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_command_range

【函数声明】

```c
extern int32_t hb_isp_get_command_range(uint32_t pipeline_id, uint32_t section, uint32_t command, uint32_t *max, uint32_t *min);
```

【功能描述】

get command range; 获取 command 参数范围

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_hardware_param

【函数声明】

```c
extern int32_t hb_isp_get_hardware_param(uint32_t pipeline_id, const char *name, uint32_t param_size, uint32_t *ptr);
```

【功能描述】

get hardware param; 获取 hardware 参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_set_hardware_param

【函数声明】

```c
extern int32_t hb_isp_set_hardware_param(uint32_t pipeline_id, const char *name, uint32_t param_size, uint32_t *ptr);
```

【功能描述】

set hardware param; 设置hardware参数

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

### hb_isp_get_hardware_range

【函数声明】

```c
extern int32_t hb_isp_get_hardware_range(uint32_t pipeline_id, const char *name, uint32_t *max, uint32_t *min);
```

【功能描述】

get hardware range; 获取hardware 参数范围

【返回值】

zero: Success；成功
less than zero: Fail，return error code；失败，返回错误码

【兼容性】
HW: Ultra/Super; SW: 1.0.0

## 相关文档

- [视频输入输出 - VIO](/Advanced_development/multimedia_development/multimedia_api/vio_api)
- [视频处理框架 - VPF/PYM](/Advanced_development/multimedia_development/multimedia_api/vpf_pym_api)
