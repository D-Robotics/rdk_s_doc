---
sidebar_position: 8
title: "Thermal System"
description: "RDK S100/S600 Thermal System Debugging Guide"
---

# Thermal System

The Thermal system is based on the kernel Thermal framework. It obtains the temperature through the PVT (Process-Voltage-Temperature) monitor inside the SoC, and acts on CPU frequency, BPU frequency and fan speed according to temperature policies to prevent overheating-induced frequency throttling or shutdown. This section introduces the Thermal system driver, debugging interfaces and configuration methods.

## Driver Code

The temperature monitoring driver is located in the `hobot-drivers/pvt/` directory:

```bash
hobot-drivers/pvt/hb_pvt.c   # PVT temperature/voltage monitoring driver (module hb_pvt)
```

The driver implements both the hwmon interface and the thermal zone interface, registering temperature sensors with the kernel Thermal framework.

### Kernel Configuration

```bash
CONFIG_HOBOT_PVT=m         # PVT driver (module)
CONFIG_HOBOT_PVT_DEBUG=y   # PVT debug information
```

## Temperature Query

Query the temperature in real time on the board:

```bash
# View the temperature of all thermal zones (unit: millidegree Celsius)
cat /sys/class/thermal/thermal_zone*/temp

# View the thermal zone types
cat /sys/class/thermal/thermal_zone*/type
```

Measured on the board (RDK S600), there are 19 thermal zone types in total, divided into three categories: `pvt_cmn` (common domain), `pvt_ddr` (DDR domain), and `pvt_bpu` (BPU domain):

```bash
root@drobot:~# cat /sys/class/thermal/thermal_zone*/type
pvt_cmn_pvtc1_t1
pvt_cmn_pvtc1_t2
pvt_ddr_pvtc4_t1
pvt_bpu_pvtc1_t1
pvt_bpu_pvtc1_t2
...
```

## Thermal Policy

The Thermal system manages temperature through the kernel Thermal framework; the policy is `step_wise` (stepwise frequency throttling).

```bash
# View the thermal zone policy
cat /sys/class/thermal/thermal_zone0/policy
# step_wise

# View the trip point (unit: millidegree Celsius)
cat /sys/class/thermal/thermal_zone0/trip_point_0_type
# critical
cat /sys/class/thermal/thermal_zone0/trip_point_0_temp
# 115000
```

### Cooling Devices

When the temperature exceeds the threshold, the Thermal framework cools the system through cooling devices. Cooling devices measured on the board:

```bash
for c in /sys/class/thermal/cooling_device*/type; do \
  echo "$c = $(cat $c)"; done
/sys/class/thermal/cooling_device0/type = cpufreq-cpu0
/sys/class/thermal/cooling_device1/type = cpufreq-cpu2
/sys/class/thermal/cooling_device5/type = emc2305_fan
/sys/class/thermal/cooling_device6/type = emc2305_fan
/sys/class/thermal/cooling_device7/type = devfreq-28108000.bpu
...
```

The cooling devices fall into three categories:

| Cooling Device | Function |
|---|---|
| `cpufreq-cpu*` | Lower the CPU frequency |
| `devfreq-*.bpu` | Lower the BPU frequency |
| `emc2305_fan` | Adjust the fan speed |

## CPU Frequency Management

Thermal is linked with the CPU frequency policy; the frequency is automatically throttled at high temperature.

```bash
# View the available frequencies
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_frequencies
# 525000 1050000 2100000

# View the current frequency
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq

# View the governor
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
# performance
```

## S100/S600 Differences

<DocScope products="RDK S100">

The Thermal system of the S100 is described in [S100 Thermal System](../../02_System_configuration/08_frequency_management.md#rdk-s100).

</DocScope>

<DocScope products="RDK S600">

The Thermal system of the S600 is described in [S600 Thermal System](../../02_System_configuration/08_frequency_management.md#rdk-s600).

</DocScope>

## Related Documentation

- [Thermal and CPU Frequency Management](../../02_System_configuration/08_frequency_management.md)
- [Configure U-Boot and Kernel](./01_uboot_kernel_config.md)