---
sidebar_position: 8
title: "Thermal 系统"
description: "RDK S100/S600 Thermal 系统调试指南"
---

# Thermal 系统

Thermal 系统基于内核 Thermal framework，通过读取 SoC 内部的 PVT（Process-Voltage-Temperature）监控器获取温度，并根据温度策略联动 CPU 频率、BPU 频率与风扇转速，防止过热降频或关机。本节介绍 Thermal 系统的驱动、调试接口与配置方法。

## 驱动代码

温度监控驱动位于 `hobot-drivers/pvt/` 目录：

```bash
hobot-drivers/pvt/hb_pvt.c   # PVT 温度/电压监控驱动（模块 hb_pvt）
```

该驱动同时实现了 hwmon 接口和 thermal zone 接口，向内核 Thermal framework 注册温度传感器。

### 内核配置

```bash
CONFIG_HOBOT_PVT=m         # PVT 驱动（模块）
CONFIG_HOBOT_PVT_DEBUG=y   # PVT 调试信息
```

## 温度查询

板端实时查询温度：

```bash
# 查看所有 thermal zone 的温度（单位：毫摄氏度）
cat /sys/class/thermal/thermal_zone*/temp

# 查看 thermal zone 类型
cat /sys/class/thermal/thermal_zone*/type
```

板端实测（RDK S600）thermal zone 类型共 19 个，分为 `pvt_cmn`（通用域）、`pvt_ddr`（DDR 域）、`pvt_bpu`（BPU 域）三类：

```bash
root@drobot:~# cat /sys/class/thermal/thermal_zone*/type
pvt_cmn_pvtc1_t1
pvt_cmn_pvtc1_t2
pvt_ddr_pvtc4_t1
pvt_bpu_pvtc1_t1
pvt_bpu_pvtc1_t2
...
```

## Thermal 策略

Thermal 系统通过内核 Thermal framework 管理温度，策略为 `step_wise`（阶梯式降频）。

```bash
# 查看 thermal zone 策略
cat /sys/class/thermal/thermal_zone0/policy
# step_wise

# 查看 trip point（单位：毫摄氏度）
cat /sys/class/thermal/thermal_zone0/trip_point_0_type
# critical
cat /sys/class/thermal/thermal_zone0/trip_point_0_temp
# 115000
```

### 冷却设备

当温度超过阈值时，Thermal framework 会通过冷却设备进行降温。板端实测的冷却设备如下：

```bash
root@drobot:~# for c in /sys/class/thermal/cooling_device*/type; do \
  echo "$c = $(cat $c)"; done
/sys/class/thermal/cooling_device0/type = cpufreq-cpu0
/sys/class/thermal/cooling_device1/type = cpufreq-cpu2
/sys/class/thermal/cooling_device5/type = emc2305_fan
/sys/class/thermal/cooling_device6/type = emc2305_fan
/sys/class/thermal/cooling_device7/type = devfreq-28108000.bpu
...
```

冷却设备分为三类：

| 冷却设备 | 作用 |
|---|---|
| `cpufreq-cpu*` | 降低 CPU 频率 |
| `devfreq-*.bpu` | 降低 BPU 频率 |
| `emc2305_fan` | 调节风扇转速 |

## CPU 频率管理

Thermal 与 CPU 频率策略联动，高温时自动降频。

```bash
# 查看可用频率
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_frequencies
# 525000 1050000 2100000

# 查看当前频率
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq

# 查看调速器
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
# performance
```

## S100/S600 差异

<DocScope products="RDK S100">

S100 的 Thermal 详见 [S100 Thermal 系统](/System_configuration/frequency_management#rdk-s100)。

</DocScope>

<DocScope products="RDK S600">

S600 的 Thermal 详见 [S600 Thermal 系统](/System_configuration/frequency_management#rdk-s600)。

</DocScope>

## 相关文档

- [Thermal 和 CPU 频率管理](/System_configuration/frequency_management)
- [配置 U-Boot 和 Kernel](/Advanced_development/driver_development/uboot_kernel_config)
