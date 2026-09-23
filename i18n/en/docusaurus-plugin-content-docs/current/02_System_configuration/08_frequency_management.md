---
sidebar_position: 8
title: "Thermal and CPU Frequency Management"
description: "Thermal control, fan, and CPU frequency management"
---

# Thermal and CPU Frequency Management

During operation, the SoC (System on Chip) generates heat from internal modules such as CPU, BPU (intelligent computing architecture), MCU (Microcontroller Unit), and DDR. To ensure reliability and service life, the RDK platform provides two layers of mechanisms for temperature and frequency management:

- **Temperature monitoring and thermal protection (Thermal)**: collects temperature sensor readings in real time, and automatically adjusts fan speed, reduces CPU and BPU operating frequencies, or shuts down the system for protection when thresholds are exceeded.
- **CPU frequency management (cpufreq)**: regulates the CPU operating frequency by load or to a fixed value via the Linux cpufreq subsystem, balancing performance and power consumption.

Both mechanisms are exposed to users via sysfs and can be queried and configured directly without modifying the kernel or drivers. The working principle is introduced first, followed by configuration.

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Working Principle

The Linux Thermal subsystem is the kernel temperature control framework, maintaining the chip temperature within a safe range through a "measure - judge - cool" closed loop: temperature sensors collect temperature; after judgment by the Thermal Zone and Governor, the Cooling Device performs the cooling action. CPU frequency regulation is independent of Thermal: the cpufreq subsystem's Governor selects an OPP (Operating Performance Points) and dispatches it to the firmware via a clock protocol to complete the frequency change. The Thermal loop is completed by three roles:

| Role | Concept | Responsibility |
| --- | --- | --- |
| Measure | Thermal Zone | Binds a temperature sensor and monitors the point |
| Cool | Cooling Device | Performs cooling actions, including fan speed control and frequency limiting |
| Judge | Governor | Decides the operating state of cooling devices based on temperature |

### Trip Point

Each thermal zone has several **Trip Points**, i.e. rules of "when the temperature reaches X, perform action Y". As the temperature rises from low to high, the cooling action is gradually escalated:

```text
Temperature rises → Fan speed → CPU/BPU limiting → hot warning → Shutdown
```

The Linux Thermal framework defines four trip point types, corresponding to different actions:

| Type | Meaning | Action |
| --- | --- | --- |
| `active` | Active cooling | Start or raise fan gear |
| `passive` | Passive limiting | Reduce CPU or BPU frequency |
| `hot` | High-temperature warning | System issues a warning |
| `critical` | Critical shutdown | System shuts down for protection |

Trip points under a zone are exposed via sysfs as `trip_point_N_temp` (`N` is the index). **The index order has no necessary correlation with the temperature value**; refer to the actual value. Modifying a trip point temperature adjusts the threshold of that rule.

### Thermal Governor

- **`step_wise` (default)**: the system adjusts the cooling state step by step in each polling cycle based on temperature. The state increments when temperature rises and decrements when it falls. It is automatic and gradual, but overrides user-set fan states.
- **`user_space`**: the system only reports temperature and trip point information to user space via uevent, and the user-space program or manual operation decides the state. To fix the fan speed, switch to this policy; otherwise `step_wise` will overwrite the setting automatically.

:::info Non-persistent configuration
All configurations written via sysfs in this document are valid only for the current boot and are restored to defaults after reboot. For persistence, see "Advanced Configuration" below.
:::

<DocScope products="RDK S100">

## Temperature Sensors {#rdk-s100}

The S100 has a built-in PVT (Process-Voltage-Temperature) monitoring unit with 5 temperature sensors across three domains:

| Domain | Count | sysfs label | hwmon node |
| --- | --- | --- | --- |
| MAIN | 2 | `CMN_T1`, `CMN_T2` | `temp1_input`, `temp2_input` |
| MCU | 2 | `MCU_T1`, `MCU_T2` | `temp3_input`, `temp4_input` |
| BPU | 1 | `BPU_T1` | `temp5_input` |

Temperature precision is one-thousandth of a degree Celsius. The sensors are reported via the SCMI Sensor protocol and exposed by the `scmi_sensors` hwmon device at `/sys/class/hwmon/hwmon0/`.

:::note Two hwmon devices
The S100 has 2 hwmon devices: hwmon0 is `scmi_sensors` (temperature sensors), and hwmon1 is `emc2305` (fan controller). Use hwmon0 for temperature.
:::

## Thermal Configuration

The S100 registers 5 thermal zones (`thermal_zone0`~`thermal_zone4`), one-to-one with the 5 sensors:

| Zone | Domain | type | trip count |
| --- | --- | --- | --- |
| `thermal_zone0` | MAIN | `pvt_cmn_pvtc1_t1` | 4 |
| `thermal_zone1` | MAIN | `pvt_cmn_pvtc1_t2` | 1 |
| `thermal_zone2` | MCU | `pvt_mcu_pvtc1_t1` | 1 |
| `thermal_zone3` | MCU | `pvt_mcu_pvtc1_t2` | 1 |
| `thermal_zone4` | BPU | `pvt_bpu_pvtc1_t1` | 2 |

The main zone `thermal_zone0` carries the full thermal chain (fan speed control and CPU limiting); `thermal_zone4` carries BPU limiting; the remaining zones only have shutdown protection. The S100 uses `passive` and `critical` trip point types.

### CPU main zone (thermal_zone0)

| Trip point | Default temp | Type | Action |
| --- | --- | --- | --- |
| `trip_point_0_temp` | 120℃ | critical | System shutdown |
| `trip_point_1_temp` | 43℃ | passive | Fan low gear (2~5) |
| `trip_point_2_temp` | 65℃ | passive | Fan high gear (6~10) |
| `trip_point_3_temp` | 95℃ | passive | CPU limiting |

### BPU main zone (thermal_zone4)

| Trip point | Default temp | Type | Action |
| --- | --- | --- | --- |
| `trip_point_0_temp` | 120℃ | critical | System shutdown |
| `trip_point_1_temp` | 95℃ | passive | BPU limiting |

The remaining zones (`thermal_zone1`, `thermal_zone2`, `thermal_zone3`) have only one `critical` (120℃) trip point.

## Cooling Devices

A cooling device (Cooling Device) is the Thermal framework's abstraction of a device that performs cooling actions. Each cooling device corresponds to a `cooling_device` node in sysfs; it can be a physical fan (cooling by speed control) or the CPU or BPU (cooling by reducing the operating frequency). The S100 has 5 cooling devices (`cooling_device0`~`cooling_device4`), in three categories:

| Cooling device | Count | sysfs type | max_state |
| --- | --- | --- | --- |
| CPU cluster | 2 | `cpufreq-cpu0` / `cpufreq-cpu4` | 1 |
| Fan | 2 | `emc2305_fan` | 10 |
| BPU | 1 | `devfreq-*.bpu` | 1 |

`max_state` is the highest cooling state of the device. The CPU cluster corresponds to 2 frequency points (`max_state=1`), BPU to 2 frequency points (`max_state=1`), and the fan to 11 speed gears (`max_state=10`, 0 is off).

:::note Fan and cluster limiting
When the 95℃ passive trip of `thermal_zone0` triggers, all CPUs of both clusters are frequency-limited. BPU limiting acts on the BPU core. The fan has 2 cooling device entries in sysfs (`cooling_device2` and `cooling_device3`, both `emc2305_fan`), but they map to the same PWM (Pulse Width Modulation) channel (pwm1) and drive the same physical fan; setting either one changes the other synchronously.
:::

## CPU Frequency Management

CPU frequency regulation is independent of Thermal and is managed by the Linux cpufreq subsystem, with nodes at `/sys/devices/system/cpu/cpufreq/policy<N>/`. The S100 CPU has 6 cores (Cortex-A78AE) divided into 2 clusters, each cluster corresponding to one cpufreq policy:

| policy | affected_cpus | Representative core |
| --- | --- | --- |
| `policy0` | 0, 1, 2, 3 | cpu0 |
| `policy4` | 4, 5 | cpu4 |

The two clusters share frequency points, supporting two:

| Frequency | Typical use |
| --- | --- |
| 1,500,000 KHz (1.5 GHz) | Maximum performance |
| 1,125,000 KHz (1.125 GHz) | Low power |

Common sysfs fields:

| File | Meaning |
| --- | --- |
| `scaling_governor` | Current frequency policy |
| `scaling_available_governors` | All policies supported by the kernel |
| `scaling_available_frequencies` | List of supported frequency points (KHz) |
| `scaling_cur_freq` | Current frequency (from cpufreq cache) |
| `cpuinfo_cur_freq` | Current frequency (from hardware) |
| `scaling_driver` | Current frequency driver |
| `scaling_max_freq` / `scaling_min_freq` | Maximum / minimum frequency allowed by the policy |
| `scaling_setspeed` | Manual frequency setting, only available when governor is `userspace` |

Supported frequency policies (governors):

| Policy | Behavior |
| --- | --- |
| `performance` | Always run at the highest frequency, performance first (factory default) |
| `powersave` | Always run at the lowest frequency, power saving first |
| `ondemand` | Dynamic frequency by load; raises frequency when load increases |
| `conservative` | Similar to `ondemand`, with smoother transitions |
| `schedutil` | Frequency by load, coordinated with the kernel scheduler |
| `userspace` | Frequency set by user space, used with `scaling_setspeed` |

:::note
Supported frequency points and policies may differ across chip models; refer to the actual `scaling_available_frequencies` / `scaling_available_governors` output.
:::

The S100 frequency points are not defined by the kernel device tree, but dynamically dispatched by the SoC firmware via the SCMI (System Control and Management Interface) performance protocol. The cpufreq driver is named `scmi` (scmi-cpufreq); it reads OPPs from the firmware and dispatches frequency change requests via the SCMI performance protocol, and the firmware finally configures the hardware PLL (Phase-Locked Loop) to change the frequency.

:::note Default policy
The S100 factory default policy is `performance`, i.e. both clusters run at the 1.5 GHz maximum frequency after boot. To reduce power consumption, switch to other policies, e.g. `ondemand` automatically drops to 1.125 GHz when the system is idle.
:::

## Configuration

### View temperature

```bash
cat /sys/class/hwmon/hwmon0/temp1_input
```

Expected output (example):

```text
50598
```

Unit 0.001℃, i.e. 50.6℃. View the sensor label:

```bash
cat /sys/class/hwmon/hwmon0/temp1_label
```

Expected output:

```text
CMN_T1
```

View the overall SoC status (temperature, voltage, etc.; the tool is at `/usr/hobot/bin/hrut_somstatus`):

```bash
sudo hrut_somstatus
```

### View and switch thermal policy

```bash
cat /sys/class/thermal/thermal_zone0/policy # step_wise
cat /sys/class/thermal/thermal_zone0/available_policies # user_space step_wise
```

Switch to user-space policy:

```bash
echo user_space > /sys/class/thermal/thermal_zone0/policy
```

### Adjust temperature threshold

To start CPU limiting at 85℃ in the CPU main zone, set the limiting trip to 85℃ (the limiting trip of `thermal_zone0` is `trip_point_3`):

```bash
echo 85000 > /sys/class/thermal/thermal_zone0/trip_point_3_temp
```

:::warning Threshold adjustment risk
Raising the critical (shutdown) temperature may damage hardware; lowering the passive (limiting) temperature reduces performance. Adjust carefully according to the product's cooling conditions.
:::

### Fix fan gear

The fan gear range is 0~10, where 0 is off and 10 is full speed. To fix the gear, first switch `thermal_zone0` to `user_space`, then set the gear; otherwise `step_wise` will override it by temperature:

```bash
# View the fan cooling device and current gear
cat /sys/class/thermal/cooling_device2/type          # emc2305_fan
cat /sys/class/thermal/cooling_device2/max_state     # 10
cat /sys/class/thermal/cooling_device2/cur_state

# Switch the CPU main zone to user-space policy, then set to full speed
echo user_space > /sys/class/thermal/thermal_zone0/policy
echo 10 > /sys/class/thermal/cooling_device2/cur_state
```

:::note
`cooling_device2` and `cooling_device3` are both `emc2305_fan` and drive the same physical fan; you may set either one, and the other changes synchronously.
:::

### View CPU frequency points and current frequency

```bash
# Supported frequency points (KHz)
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_available_frequencies
# Current frequency (from cpufreq cache)
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_cur_freq
# Current frequency driver
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_driver
# Current frequency policy
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_governor
```

### Switch CPU frequency policy

```bash
echo ondemand > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
```

:::note Policy scope
Switching the governor on cpu0 actually applies to all CPUs covered by `policy0` (`affected_cpus`). To adjust cluster1, operate the cpufreq directory of cpu4.
:::

### Fix CPU frequency

First switch to `userspace`, then set the target frequency:

```bash
echo userspace > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo 1125000 > /sys/devices/system/cpu/cpufreq/policy0/scaling_setspeed
```

## Verification

```bash
# Outputs should match the values set above
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_governor
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_cur_freq
cat /sys/class/thermal/thermal_zone0/trip_point_3_temp
```

Expected output (example):

```text
userspace
1125000
85000
```

## Advanced Configuration

### Persistent configuration

The above sysfs modifications are valid only for the current boot and are restored to defaults after reboot. For persistence, write the configuration commands into a systemd service or `/etc/rc.local` to execute at boot; see [boot auto-start configuration](./06_self_start.md).

### Adjust shutdown temperature

To change the shutdown temperature from 120℃ to 105℃, modify the critical trip of all zones. The shutdown trip of all S100 zones is `trip_point_0`:

```bash
for z in 0 1 2 3 4; do
  echo 105000 > /sys/class/thermal/thermal_zone${z}/trip_point_0_temp
done
```

:::warning Shutdown temperature is a hardware safety fallback
Raising the shutdown temperature risks hardware damage. Adjust only after fully evaluating the cooling capability, and do not go below the vendor-recommended value.
:::

## FAQ

### Modified trip temperature lost after reboot

**Cause**: sysfs modifications exist only in runtime memory and are not persisted; they are restored to defaults after reboot.

**Solution**: Write the configuration commands to a boot auto-start script; see "Advanced Configuration > Persistent configuration" above.

### Fixed fan gear overridden automatically

**Cause**: The corresponding zone is still in `step_wise`; the governor adjusts the fan automatically by temperature, overriding the manual setting.

**Solution**: Switch the main zone `thermal_zone0` to `user_space` before setting the gear.

### CPU frequency unchanged after switching governor

**Cause**: The target CPU is offline, or the policy does not cover the core.

**Solution**: First confirm the CPU is online (`cat /sys/devices/system/cpu/cpu0/online`), and check that `affected_cpus` includes the target core.

### Cannot fix CPU to a specified frequency

**Cause**: `scaling_setspeed` is only available when the governor is `userspace`.

**Solution**: First run `echo userspace > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor`, then write the target frequency to `scaling_setspeed`.

</DocScope>

<DocScope products="RDK S600">

## Temperature Sensors {#rdk-s600}

The S600 has a built-in PVT (Process-Voltage-Temperature) monitoring unit with 19 temperature sensors covering the CPU, DDR, and BPU domains. Each sensor can be looked up via the `_label` node:

| Domain | Count | sysfs label | hwmon node |
| --- | --- | --- | --- |
| CPU | 7 | `CMN0-TS0` ~ `CMN0-TS6` | `temp1_input` ~ `temp7_input` |
| DDR | 4 | `DDR0-TS0` ~ `DDR3-TS0` | `temp8_input` ~ `temp11_input` |
| BPU | 8 | `BPU0-TS00` ~ `BPU3-TS01` | `temp12_input` ~ `temp19_input` |

Temperature precision is one-thousandth of a degree Celsius, range -40~125℃. All PVT sensors are reported via the hwmon subsystem at `/sys/class/hwmon/hwmon1/`.

:::note Four hwmon devices
The S600 has 4 hwmon devices: hwmon0 is `emc2305` (fan controller), hwmon1 is `pvt_hwmon` (temperature sensors), and hwmon2 and hwmon3 are Ethernet PHYs (Physical Layer). Use hwmon1 for temperature.
:::

## Thermal Configuration

The S600 registers 19 thermal zones (`thermal_zone0`~`thermal_zone18`), one-to-one with the 19 sensors, grouped by domain. Each domain has a main zone that carries the fan and limiting rules; the remaining zones only have shutdown protection:

| Domain | Zone range | Main zone | Main zone trip count |
| --- | --- | --- | --- |
| CPU | zone0~6 | `thermal_zone2` | 5 |
| DDR | zone7~10 | — (no cooling device) | 2 each |
| BPU | zone11~18 | `thermal_zone16` | 5 |

### CPU main zone (thermal_zone2)

| Trip point | Default temp | Type | Action |
| --- | --- | --- | --- |
| `trip_point_0_temp` | 45℃ | active | Fan low gear (2~5) |
| `trip_point_1_temp` | 65℃ | active | Fan high gear (6~10) |
| `trip_point_2_temp` | 95℃ | passive | CPU limiting |
| `trip_point_3_temp` | 110℃ | hot | High-temperature warning |
| `trip_point_4_temp` | 115℃ | critical | System shutdown |

The remaining CPU zones (zone0/1/3/4/5/6) have only one `critical` (115℃) trip point.

### DDR zones (thermal_zone7~10)

Each DDR zone has 2 trip points:

| Trip point | Default temp | Type | Action |
| --- | --- | --- | --- |
| `trip_point_0_temp` | 110℃ | hot | High-temperature warning |
| `trip_point_1_temp` | 115℃ | critical | System shutdown |

### BPU main zone (thermal_zone16)

| Trip point | Default temp | Type | Action |
| --- | --- | --- | --- |
| `trip_point_0_temp` | 45℃ | active | Fan low gear (2~5) |
| `trip_point_1_temp` | 65℃ | active | Fan high gear (6~10) |
| `trip_point_2_temp` | 95℃ | passive | BPU limiting |
| `trip_point_3_temp` | 110℃ | hot | High-temperature warning |
| `trip_point_4_temp` | 115℃ | critical | System shutdown |

The remaining BPU zones (zone11~15, 17, 18) have only one `critical` (115℃) trip point.

## Cooling Devices

A cooling device (Cooling Device) is the Thermal framework's abstraction of a device that performs cooling actions. Each cooling device corresponds to a `cooling_device` node in sysfs; it can be a physical fan (cooling by speed control) or the CPU or BPU (cooling by reducing the operating frequency). The S600 has 11 cooling devices (`cooling_device0`~`cooling_device10`), in three categories, of which the fan category has 2 sysfs entries corresponding to the same physical fan (see the note below):

| Cooling device | Count | sysfs type | max_state |
| --- | --- | --- | --- |
| CPU cluster | 5 | `cpufreq-cpu0` / `cpu2` / `cpu6` / `cpu10` / `cpu14` | 2 |
| Fan | 2 | `emc2305_fan` | 10 |
| BPU core | 4 | `devfreq-*.bpu` | 1 |

`max_state` is the highest cooling state of the device. The CPU cluster corresponds to 3 frequency points (`max_state=2`), BPU to 2 frequency points (`max_state=1`), and the fan to 11 speed gears (`max_state=10`, 0 is off).

:::note Fan and cluster limiting
The fan has 2 cooling device entries in sysfs (`cooling_device5` and `cooling_device6`, both `emc2305_fan`), which map to the same PWM (Pulse Width Modulation) channel (pwm1) and drive the same physical fan; setting either one changes the other synchronously.

The fan is referenced by the active trips of both the CPU main zone (`thermal_zone2`) and the BPU main zone (`thermal_zone16`); a temperature rise in either domain triggers the fan to speed up.

CPU limiting selects one representative core per cluster to limit; CPUs in the same cluster share the OPP table, and the entire cluster is limited accordingly. BPU limiting acts on the 4 BPU cores.
:::

## CPU Frequency Management

CPU frequency regulation is independent of Thermal and is managed by the Linux cpufreq subsystem, with nodes at `/sys/devices/system/cpu/cpufreq/policy<N>/`. The S600 CPU has 18 cores divided into 5 clusters, each cluster corresponding to one cpufreq policy, sharing one OPP table, supporting three frequency points:

| Frequency | Typical use |
| --- | --- |
| 2,100,000 KHz (2.1 GHz) | Maximum performance |
| 1,050,000 KHz (1.05 GHz) | Balanced |
| 525,000 KHz (525 MHz) | Low power |

The 5 policies and their clusters:

| policy | affected_cpus | Representative core |
| --- | --- | --- |
| `policy0` | 0, 1 | cpu0 |
| `policy2` | 2, 3, 4, 5 | cpu2 |
| `policy6` | 6, 7, 8, 9 | cpu6 |
| `policy10` | 10, 11, 12, 13 | cpu10 |
| `policy14` | 14, 15, 16, 17 | cpu14 |

Common sysfs fields:

| File | Meaning |
| --- | --- |
| `scaling_governor` | Current frequency policy |
| `scaling_available_governors` | All policies supported by the kernel |
| `scaling_available_frequencies` | List of supported frequency points (KHz) |
| `scaling_cur_freq` | Current frequency (from cpufreq cache) |
| `cpuinfo_cur_freq` | Current frequency (from hardware) |
| `scaling_driver` | Current frequency driver |
| `scaling_max_freq` / `scaling_min_freq` | Maximum / minimum frequency allowed by the policy |
| `scaling_setspeed` | Manual frequency setting, only available when governor is `userspace` |

Supported frequency policies (governors):

| Policy | Behavior |
| --- | --- |
| `performance` | Always run at the highest frequency, performance first (factory default) |
| `powersave` | Always run at the lowest frequency, power saving first |
| `ondemand` | Dynamic frequency by load; raises frequency when load increases |
| `conservative` | Similar to `ondemand`, with smoother transitions |
| `schedutil` | Frequency by load, coordinated with the kernel scheduler |
| `userspace` | Frequency set by user space, used with `scaling_setspeed` |

:::note
Supported frequency points and policies may differ across chip models; refer to the actual `scaling_available_frequencies` / `scaling_available_governors` output.
:::

The cpufreq driver is named `cpufreq-dt`, which reads the OPP table from the device tree and dispatches to the secure firmware via the SCMI (System Control and Management Interface) clock protocol, which configures the hardware PLL (Phase-Locked Loop) to change the frequency.

:::note Default policy
The S600 factory default policy is `performance`, i.e. all 5 clusters run at the 2.1 GHz maximum frequency after boot. To reduce power consumption, switch to other policies, e.g. `ondemand` automatically drops to 525 MHz when the system is idle.
:::

## Configuration

### View temperature

```bash
cat /sys/class/hwmon/hwmon1/temp1_input
```

Expected output (example):

```text
56339
```

Unit 0.001℃, i.e. 56.3℃. View the sensor label:

```bash
cat /sys/class/hwmon/hwmon1/temp1_label
```

Expected output:

```text
CMN0-TS0
```

View the overall SoC status (temperature, voltage, etc.; the tool is at `/usr/hobot/bin/hrut_somstatus`):

```bash
sudo hrut_somstatus
```

### View and switch thermal policy

```bash
cat /sys/class/thermal/thermal_zone2/policy # step_wise
cat /sys/class/thermal/thermal_zone2/available_policies # user_space step_wise
```

Switch to user-space policy:

```bash
echo user_space > /sys/class/thermal/thermal_zone2/policy
```

### Adjust temperature threshold

To start CPU limiting at 85℃ in the CPU main zone, set the limiting trip to 85℃ (the limiting trip of `thermal_zone2` is `trip_point_2`):

```bash
echo 85000 > /sys/class/thermal/thermal_zone2/trip_point_2_temp
```

:::warning Threshold adjustment risk
Raising the critical (shutdown) temperature may damage hardware; lowering the passive (limiting) temperature reduces performance. Adjust carefully according to the product's cooling conditions.
:::

### Fix fan gear

The fan gear range is 0~10, where 0 is off and 10 is full speed. The S600 fan is controlled by both `thermal_zone2` and `thermal_zone16`; to fix the gear, **both zones must be switched to `user_space`** — switching only one will still be overridden by the other zone by temperature:

```bash
# View the fan cooling device and current gear
cat /sys/class/thermal/cooling_device5/type          # emc2305_fan
cat /sys/class/thermal/cooling_device5/max_state     # 10
cat /sys/class/thermal/cooling_device5/cur_state

# Switch both main zones to user-space policy, then set to full speed
echo user_space > /sys/class/thermal/thermal_zone2/policy
echo user_space > /sys/class/thermal/thermal_zone16/policy
echo 10 > /sys/class/thermal/cooling_device5/cur_state
```

:::note
`cooling_device5` and `cooling_device6` are both `emc2305_fan` and drive the same physical fan; you may set either one, and the other changes synchronously.
:::

### View CPU frequency points and current frequency

```bash
# Supported frequency points (KHz)
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_available_frequencies
# Current frequency (from cpufreq cache)
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_cur_freq
# Current frequency driver
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_driver
# Current frequency policy
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_governor
```

### Switch CPU frequency policy

```bash
echo ondemand > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
```

:::note Policy scope
Switching the governor on cpu0 actually applies to all CPUs covered by `policy0` (`affected_cpus`). To adjust another cluster, operate the cpufreq directory of any CPU in that cluster.
:::

### Fix CPU frequency

First switch to `userspace`, then set the target frequency:

```bash
echo userspace > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo 1050000 > /sys/devices/system/cpu/cpufreq/policy0/scaling_setspeed
```

## Verification

```bash
# Outputs should match the values set above
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_governor
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_cur_freq
cat /sys/class/thermal/thermal_zone2/trip_point_2_temp
```

Expected output (example):

```text
userspace
1050000
85000
```

## Advanced Configuration

### Persistent configuration

The above sysfs modifications are valid only for the current boot and are restored to defaults after reboot. For persistence, write the configuration commands into a systemd service or `/etc/rc.local` to execute at boot; see [boot auto-start configuration](./06_self_start.md).

### Adjust shutdown temperature

To change the shutdown temperature from 115℃ to 105℃, modify the critical trip of all zones. The shutdown trip index differs per zone: the main zone is `trip_point_4`, the DDR zone is `trip_point_1`, and the single-trip zone is `trip_point_0`.

```bash
# CPU main zone
echo 105000 > /sys/class/thermal/thermal_zone2/trip_point_4_temp
# BPU main zone
echo 105000 > /sys/class/thermal/thermal_zone16/trip_point_4_temp
# DDR zones
for z in 7 8 9 10; do
  echo 105000 > /sys/class/thermal/thermal_zone${z}/trip_point_1_temp
done
# Other single-trip zones
for z in 0 1 3 4 5 6 11 12 13 14 15 17 18; do
  echo 105000 > /sys/class/thermal/thermal_zone${z}/trip_point_0_temp
done
```

:::warning Shutdown temperature is a hardware safety fallback
Raising the shutdown temperature risks hardware damage. Adjust only after fully evaluating the cooling capability, and do not go below the vendor-recommended value.
:::

## FAQ

### Modified trip temperature lost after reboot

**Cause**: sysfs modifications exist only in runtime memory and are not persisted; they are restored to defaults after reboot.

**Solution**: Write the configuration commands to a boot auto-start script; see "Advanced Configuration > Persistent configuration" above.

### Fixed fan gear overridden automatically

**Cause**: The corresponding zone is still in `step_wise`; the governor adjusts the fan automatically by temperature, overriding the manual setting.

**Solution**: The fan is controlled by both `thermal_zone2` and `thermal_zone16`; both zones must be switched to `user_space` before setting the gear.

### CPU frequency unchanged after switching governor

**Cause**: The target CPU is offline, or the policy does not cover the core.

**Solution**: First confirm the CPU is online (`cat /sys/devices/system/cpu/cpu0/online`), and check that `affected_cpus` includes the target core.

### Cannot fix CPU to a specified frequency

**Cause**: `scaling_setspeed` is only available when the governor is `userspace`.

**Solution**: First run `echo userspace > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor`, then write the target frequency to `scaling_setspeed`.

</DocScope>

## Related Documentation

- [Boot auto-start configuration](./06_self_start.md)
- [Display configuration](./09_display_config.md)
- [Screen sleep and power management](./11_screen_sleep.md)
- [Thermal driver development (advanced)](../07_Advanced_development/04_driver_development/08_driver_thermal_dev.md)
