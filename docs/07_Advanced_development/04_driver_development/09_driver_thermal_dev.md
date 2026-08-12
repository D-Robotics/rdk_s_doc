---
sidebar_position: 8
title: "5.4.8 Thermal 系统"
description: RDK S100/S600 Thermal 系统调试指南
---

# 5.4.8 Thermal 系统

Thermal 系统负责监测 SoC 温度并根据策略调整 CPU/BPU 频率与风扇转速，防止过热降频或关机。本节介绍 Thermal 系统的调试接口与配置方法。

## 温度查询

板端实时查询 SoC 温度：

```bash
# 查看 CPU 温度
cat /sys/class/thermal/thermal_zone*/temp

# 查看详细
rdkos_info | grep -i temp
```

## Thermal 策略

Thermal 系统通过内核 thermal framework 管理温度，配置文件在设备树和 sysfs 中：

```bash
# 查看冷却设备
ls /sys/class/thermal/cooling_device*/

# 查看 thermal zone
ls /sys/class/thermal/thermal_zone*/

# 查看当前策略
cat /sys/class/thermal/thermal_zone*/policy
```

## CPU 频率管理

Thermal 与 CPU 频率策略联动，高温时自动降频：

```bash
# 查看可用频率
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_frequencies

# 查看当前频率
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq

# 查看调速器
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
```

## S100/S600 差异

<DocScope products="RDK S100">

S100 的 Thermal 详见 [S100 Thermal 系统](/System_configuration/frequency_management#rdk-s100)。

</DocScope>

<DocScope products="RDK S600">

S600 的 Thermal 详见 [S600 Thermal 系统](/System_configuration/frequency_management#rdk-s600)。

</DocScope>

## 相关文档

- [2.8 Thermal 和 CPU 频率管理](/System_configuration/frequency_management)
- [5.4.1 配置 U-Boot 和 Kernel](/Advanced_development/driver_development/uboot_kernel_config)
