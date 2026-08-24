---
sidebar_position: 8
title: "Thermal 系统"
description: "RDK S100/S600 Thermal 系统调试指南"
---

# Thermal 系统

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

Thermal 系统基于内核 Thermal framework，通过读取 SoC 内部的 PVT（Process-Voltage-Temperature）监控器获取温度，并根据温度策略联动 CPU 频率、BPU 频率与风扇转速，防止过热降频或关机。

<DocScope products="RDK S100">
S100 共 5 个温度传感器（MCU 域 2 个、BPU 1 个、MAIN 域 2 个），对应 5 个 thermal zone（`thermal_zone0`~`thermal_zone4`）。
</DocScope>

<DocScope products="RDK S600">
S600 对应 19 个 thermal zone（`thermal_zone0`~`thermal_zone18`），类型覆盖 `pvt_cmn`、`pvt_ddr`、`pvt_bpu` 等域。
</DocScope>

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要调整温控策略、trip point 或排查散热/降频问题的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 Linux Thermal framework 与 CPU/BPU 频率管理基础。

**与其他模块关系**：本系统是「Thermal 和 CPU 频率管理」配置的底层实现，与 CPU 调频（cpufreq）联动；S100 与 S600 的策略/trip point 差异见「S100/S600 差异」。

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

## 常见问题

### CPU/BPU 频率被限制（降频）

**原因**：温度超过 trip point 后，Thermal 策略（如 `step_wise`）触发 cooling device 限制 CPU/BPU 频率。

**解决**：用「温度查询」查看各 thermal zone 当前温度与 trip point（单位为毫摄氏度），确认是否越限；改善散热或调整 trip point 后观察频率恢复。

### 读取不到 thermal zone 温度

**原因**：`hb_pvt` 驱动模块未加载，未向内核 Thermal framework 注册 thermal zone。

**解决**：`dmesg | grep -i pvt` 查看驱动加载日志；缺失时 `modprobe hb_pvt`，再 `ls /sys/class/thermal/` 确认 thermal zone 已注册。

## 相关文档

- [Thermal 和 CPU 频率管理](/System_configuration/frequency_management)
- [配置 U-Boot 和 Kernel](/Advanced_development/driver_development/uboot_kernel_config)
