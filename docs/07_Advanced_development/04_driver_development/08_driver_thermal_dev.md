---
sidebar_position: 8
title: "Thermal 系统"
description: "温度传感器链路、thermal zone 与 trip point 配置，含散热策略与频率联动"
---

# Thermal 系统

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

Thermal 系统基于内核 Thermal framework。它读取温度传感器数据，并按温度策略联动 CPU 频率、BPU 频率与风扇转速，防止过热降频或关机。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）。适合调整温控策略、trip point，或排查散热与降频问题的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 Linux Thermal framework 与 CPU/BPU 频率管理基础。

**与其他模块关系**：本系统是「Thermal 和 CPU 频率管理」配置的底层实现，与 CPU 调频（cpufreq）联动。

### 温度链路

硬件的温度来源是 SoC 内部的 PVT（Process-Voltage-Temperature）监控器。

<DocScope products="RDK S100">

PVT 监控器由 MCU（Safety Rcore）独占访问。温度由 MCU 采集后经 SCMI（System Control and Management Interface）上报：

```mermaid
flowchart LR
    PVT["PVT Monitor"] -->|"MCU only"| MCU["MCU (Safety Rcore)<br/>SCMI server"]
    MCU -->|"SCMI over IPC"| LINUX["Acore Linux<br/>scmi_sensors"]
    LINUX --> THERMAL["thermal framework"]
    THERMAL --> SYSFS["/sys/class/thermal"]
```

内核侧的温度传感器设备是 `scmi_sensors`。CPU 调频也经 SCMI 请求 MCU 执行。

</DocScope>

<DocScope products="RDK S600">

温度由 `hb_pvt` 内核驱动直接读取：

```mermaid
flowchart LR
    PVT["PVT Monitor"] -->|"hb_pvt driver"| DRV["hb_pvt<br/>9 pvtc nodes"]
    DRV --> THERMAL["thermal framework"]
    THERMAL --> SYSFS["/sys/class/thermal"]
```

</DocScope>

### 硬件资源

<DocScope products="RDK S100">

S100 共注册 5 个 thermal zone（`thermal_zone0`~`thermal_zone4`）：

| 被测域 | zone 类型 | 说明 |
|---|---|---|
| 通用域 | `pvt_cmn_pvtc1_t1`、`pvt_cmn_pvtc1_t2` | 主域温度 |
| MCU 域 | `pvt_mcu_pvtc1_t1`、`pvt_mcu_pvtc1_t2` | MCU 域温度 |
| BPU 域 | `pvt_bpu_pvtc1_t1` | BPU 域温度 |

</DocScope>
<DocScope products="RDK S600">

S600 共注册 19 个 thermal zone（`thermal_zone0`~`thermal_zone18`）：

| 被测域 | 数量 | zone 类型 | 对应 PVT 节点 |
|---|---|---|---|
| 通用域 | 7 | `pvt_cmn_pvtc1_t1` ~ `pvt_cmn_pvtc1_t7` | CMN0 |
| DDR 域 | 4 | `pvt_ddr_pvtc1_t1` ~ `pvt_ddr_pvtc4_t1` | DDR0~DDR3 |
| BPU 域 | 8 | `pvt_bpu_pvtc1_t1` ~ `pvt_bpu_pvtc4_t2` | BPU0~BPU3 |

</DocScope>

## 驱动代码

<DocScope products="RDK S100">

S100 的 PVT 监控器由 MCU 访问，Linux 内核侧没有对应的 PVT 驱动。温度经 SCMI 上报，内核由 SCMI 传感器驱动处理：

```bash
source/kernel/drivers/hwmon/scmi-hwmon.c    # SCMI 传感器驱动，同时实现 hwmon 与 thermal 接口
```

设备树中 `scmi_sensors` 节点（`source/hobot-drivers/kernel-dts/drobot-s100-scmi.dtsi`）声明为温度传感器，各 thermal zone 通过 `thermal-sensors = <&scmi_sensors ...>` 引用。

该驱动对 SCMI 上报的每个温度传感器逐个调用 `devm_thermal_of_zone_register()`。若某传感器的 ID 没有被任何 thermal zone 引用，注册返回 `-ENODEV`，该传感器被跳过。

</DocScope>
<DocScope products="RDK S600">

PVT 温度/电压监控驱动位于 `hobot-drivers/pvt/` 目录：

```bash
source/hobot-drivers/pvt/hb_pvt.c    # PVT 温度/电压监控驱动（模块 hb_pvt）
```

该驱动同时实现 hwmon 接口和 thermal zone 接口，向内核 Thermal framework 注册温度传感器。设备树中 `pvt` 节点（`source/hobot-drivers/kernel-dts/drobot-s600-soc.dtsi`）声明 `compatible = "snps,hb_pvt"`，其下按域划分多个 `pvtc@` 子节点。各 thermal zone 通过 `thermal-sensors = <&pvt N>` 引用。

</DocScope>

### 内核配置

<DocScope products="RDK S100">

配置文件路径：`source/hobot-drivers/configs/drobot_s100_defconfig`

```bash
CONFIG_SENSORS_ARM_SCMI=y      # SCMI 传感器驱动（温度来源）
CONFIG_THERMAL=y               # Thermal framework
CONFIG_CPU_THERMAL=y           # CPU 调频作为冷却设备
CONFIG_SENSORS_EMC2305=y       # 风扇转速控制
```

</DocScope>
<DocScope products="RDK S600">

配置文件路径：`source/hobot-drivers/configs/drobot_s600_defconfig`

```bash
CONFIG_HOBOT_PVT=m             # PVT 驱动（模块）
CONFIG_HOBOT_PVT_DEBUG=y       # PVT 调试信息
CONFIG_THERMAL=y               # Thermal framework
CONFIG_CPU_THERMAL=y           # CPU 调频作为冷却设备
CONFIG_SENSORS_EMC2305=y       # 风扇转速控制
```

</DocScope>

## 设备树配置

### 温度传感器节点

<DocScope products="RDK S100">

温度传感器由 SCMI 提供，节点定义在 `source/hobot-drivers/kernel-dts/drobot-s100-scmi.dtsi`：

```dts
scmi_sensors: scmi_sensors@15 {
    reg = <0x15>;
    #thermal-sensor-cells = <1>;
};
```

各 thermal zone 通过 `thermal-sensors = <&scmi_sensors <sensor_idx>>` 引用，其中 `sensor_idx` 定义在 `kernel-dts/include/drobot_s100_sensor.h`。

</DocScope>
<DocScope products="RDK S600">

PVT 控制器节点定义在 `source/hobot-drivers/kernel-dts/drobot-s600-soc.dtsi`，按域划分 `pvtc@` 子节点：

```dts
pvt: pvt {
    status = "okay";
    compatible = "snps,hb_pvt";
    #thermal-sensor-cells = <1>;
    sram = <0x0 0x0CDF0400 0x0 0x200>;

    pvtccmn0: pvtc@30490000 {
        status = "okay";
        pvtc_name = "CMN0";
        reg = <0x0 0x30490000 0x0 0x10000>;
        ts_num = <7>;         /* 7 个温度传感器 */
        vm_num = <2>;         /* 2 个电压监控 */
    };

    pvtcddr0: pvtc@42C40000 {
        status = "okay";
        pvtc_name = "DDR0";
        ts_num = <1>;
    };
    /* DDR1~DDR3、BPU0~BPU3 同理 */
};
```

各子节点的 `ts_num` 之和即 thermal zone 总数：`7 + 1×4 + 2×4 = 19`。

</DocScope>

### Thermal zone 与 Trip point

:::note
Trip point 的 `type` 字段含义：`active` 触发主动散热设备（如风扇），`passive` 触发被动降温（如降频），`hot` 仅上报用户态，`critical` 触发系统保护关断。
:::

<DocScope products="RDK S100">

thermal zone 定义在 `source/hobot-drivers/kernel-dts/drobot-s100-thermal.dtsi`。以 `pvt_cmn_pvtc1_t1` 为例：

```dts
pvt_cmn_pvtc1_t1 {
    thermal-sensors = <&scmi_sensors SENSOR_IDX_PVT_CMN_PVTC1_T1_SENSOR>;
    polling-delay-passive = <5000>;
    polling-delay = <5000>;

    trips {
        trip-point0 {
            temperature = <120000>;
            hysteresis = <2000>;
            type = "critical";
        };
        fan_start: fan-start {
            temperature = <43000>;
            hysteresis = <2000>;
            type = "passive";
        };
        /* fan-alert、cpu-alert1 同理 */
    };
};
```

板级设备树 `rdk-s100-v1-2.dts` 在 `&thermal_zones` 下为这些 trip 挂载冷却设备：

```dts
&thermal_zones {
    pvt_cmn_pvtc1_t1 {
        cooling-maps {
            fan_map0: fan-map0 {
                trip = <&fan_start>;
                cooling-device = <&emc2301 2 5>;
            };
            cpu_map0: cpu-map0 {
                trip = <&cpu_alert1>;
                cooling-device = <&cpu0 THERMAL_NO_LIMIT THERMAL_NO_LIMIT>,
                                 /* cpu1~cpu5 同理 */;
            };
        };
    };
};
```

:::note
`drobot-s100-thermal.dtsi` 中定义了 54 个 zone，但其中**只有 5 个定义了 `trips` 子节点**。内核在 `thermal_of_zone_register()` 中要求 zone 必须有 `trips`，否则返回 `-EINVAL` 并不予注册。因此实际注册的正是这 5 个。
:::

</DocScope>
<DocScope products="RDK S600">

thermal zone 定义在 `source/hobot-drivers/kernel-dts/drobot-s600-thermal.dtsi`。多数 zone 只定义 `critical`：

```dts
pvt_cmn_pvtc1_t1 {
    thermal-sensors = <&pvt 0>;
    polling-delay-passive = <1000>;
    polling-delay = <5000>;

    trips {
        cpu_crit {
            temperature = <115000>;
            hysteresis = <3000>;
            type = "critical";
        };
    };
};
```

带风扇与降频控制的 trip 定义在 `pvt_cmn_pvtc1_t3`（CPU）与 `pvt_bpu_pvtc3_t2`（BPU）上。这两个 zone 各定义 5 级 trip：

| 温度 | 类型 | 冷却设备 |
|---|---|---|
| 45000 | `active` | `emc2301` 风扇（档位 2~5） |
| 65000 | `active` | `emc2301` 风扇（档位 6~10） |
| 95000 | `passive` | CPU / BPU 降频 |
| 110000 | `hot` | 上报用户态 |
| 115000 | `critical` | 系统保护关断 |

板级设备树 `rdk-s600-mcb.dtsi` 为这两个 zone 挂载冷却设备：

```dts
&thermal_zones {
    pvt_cmn_pvtc1_t3 {
        cooling-maps {
            cpu_fan_map0: cpu_fan_map0 {
                trip = <&cpu_fan_start>;
                cooling-device = <&emc2301 2 5>;
            };
            cpu_map0: cpu-map0 {
                trip = <&cpu_alert1>;
                cooling-device = <&cpu0 THERMAL_NO_LIMIT THERMAL_NO_LIMIT>,
                                 /* cpu2、cpu6、cpu10、cpu14 同理 */;
            };
        };
    };
    pvt_bpu_pvtc3_t2 {
        cooling-maps {
            bpu_map0: bpu-map {
                trip = <&bpu_alert1>;
                cooling-device = <&bpu0 THERMAL_NO_LIMIT THERMAL_NO_LIMIT>,
                                 /* bpu1~bpu3 同理 */;
            };
        };
    };
};
```

</DocScope>

## 功能使用

### Kernel 阶段

温度传感器驱动向内核 Thermal framework 注册后，framework 按 zone 的 `polling-delay` 周期读取温度，并在越过 trip point 时触发对应的冷却设备。

<DocScope products="RDK S100">

`scmi-hwmon` 驱动对 SCMI 上报的每个温度传感器逐个调用 `devm_thermal_of_zone_register()`。若某传感器的 ID 没有被任何 thermal zone 引用，注册返回 `-ENODEV`，该传感器被跳过。

</DocScope>
<DocScope products="RDK S600">

`hb_pvt` 驱动注册 hwmon 与 thermal zone 两套接口，按 `pvtc@` 子节点读取各域温度。

</DocScope>

### 用户态使用

#### 温度查询

板端实时查询温度：

```bash
# 查看所有 thermal zone 的温度（单位：毫摄氏度）
cat /sys/class/thermal/thermal_zone*/temp

# 查看 thermal zone 类型
cat /sys/class/thermal/thermal_zone*/type
```

<DocScope products="RDK S100">

```bash
root@ubuntu:~# for z in /sys/class/thermal/thermal_zone*; do
>   echo "$z  type=$(cat $z/type)  temp=$(cat $z/temp)"
> done
/sys/class/thermal/thermal_zone0  type=pvt_cmn_pvtc1_t1  temp=42875
/sys/class/thermal/thermal_zone1  type=pvt_cmn_pvtc1_t2  temp=43245
/sys/class/thermal/thermal_zone2  type=pvt_mcu_pvtc1_t1  temp=41405
/sys/class/thermal/thermal_zone3  type=pvt_mcu_pvtc1_t2  temp=39760
/sys/class/thermal/thermal_zone4  type=pvt_bpu_pvtc1_t1  temp=41595
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# for z in /sys/class/thermal/thermal_zone*; do
>   echo "$z  type=$(cat $z/type)  temp=$(cat $z/temp)"
> done
/sys/class/thermal/thermal_zone0  type=pvt_cmn_pvtc1_t1  temp=41301
/sys/class/thermal/thermal_zone1  type=pvt_cmn_pvtc1_t2  temp=41587
/sys/class/thermal/thermal_zone7  type=pvt_ddr_pvtc1_t1  temp=41097
/sys/class/thermal/thermal_zone10 type=pvt_ddr_pvtc4_t1  temp=41672
/sys/class/thermal/thermal_zone11 type=pvt_bpu_pvtc1_t1  temp=41156
/sys/class/thermal/thermal_zone18 type=pvt_bpu_pvtc4_t2  temp=40902
...
```

</DocScope>

#### 散热策略

所有 thermal zone 的默认策略均为 `step_wise`（阶梯式降频）。

```bash
# 查看 thermal zone 策略
cat /sys/class/thermal/thermal_zone0/policy
# step_wise
```

查看某个 zone 的全部 trip point：

```bash
for t in /sys/class/thermal/thermal_zone0/trip_point_*; do
  echo "$t = $(cat $t)"
done
```

<DocScope products="RDK S100">

`thermal_zone0` 定义了 1 个 `critical` 与 3 个 `passive` trip：

```bash
root@ubuntu:~# for t in /sys/class/thermal/thermal_zone0/trip_point_*; do
>   echo "$t = $(cat $t)"; done
/sys/class/thermal/thermal_zone0/trip_point_0_hyst = 2000
/sys/class/thermal/thermal_zone0/trip_point_0_temp = 120000
/sys/class/thermal/thermal_zone0/trip_point_0_type = critical
/sys/class/thermal/thermal_zone0/trip_point_1_hyst = 2000
/sys/class/thermal/thermal_zone0/trip_point_1_temp = 43000
/sys/class/thermal/thermal_zone0/trip_point_1_type = passive
/sys/class/thermal/thermal_zone0/trip_point_2_hyst = 2000
/sys/class/thermal/thermal_zone0/trip_point_2_temp = 65000
/sys/class/thermal/thermal_zone0/trip_point_2_type = passive
/sys/class/thermal/thermal_zone0/trip_point_3_hyst = 2000
/sys/class/thermal/thermal_zone0/trip_point_3_temp = 95000
/sys/class/thermal/thermal_zone0/trip_point_3_type = passive
```

`thermal_zone0` 的 trip 挂载的冷却设备：

| 温度 | 类型 | 冷却设备 |
|---|---|---|
| 43000 | passive | `emc2301` 风扇（档位 2~5） |
| 65000 | passive | `emc2301` 风扇（档位 6~10） |
| 95000 | passive | CPU 降频（cpu0~cpu5） |
| 120000 | critical | 系统保护关断 |

另有 `pvt_bpu_pvtc1_t1` 在 95000 触发 BPU 降频（bpu0~bpu1）。

</DocScope>
<DocScope products="RDK S600">

`thermal_zone0` 只定义了 1 个 `critical` trip：

```bash
root@drobot:~# for t in /sys/class/thermal/thermal_zone0/trip_point_*; do
>   echo "$t = $(cat $t)"; done
/sys/class/thermal/thermal_zone0/trip_point_0_hyst = 3000
/sys/class/thermal/thermal_zone0/trip_point_0_temp = 115000
/sys/class/thermal/thermal_zone0/trip_point_0_type = critical
```

带风扇与降频控制的 trip 定义在 `pvt_cmn_pvtc1_t3`（CPU）与 `pvt_bpu_pvtc3_t2`（BPU）两个 zone 上：

| 温度 | 类型 | 冷却设备 |
|---|---|---|
| 45000 | active | `emc2301` 风扇 |
| 65000 | active | `emc2301` 风扇 |
| 95000 | passive | CPU / BPU 降频 |
| 110000 | hot | 上报用户态 |
| 115000 | critical | 系统保护关断 |

:::note
S600 的 `critical` 阈值为 115000，比硬件手册建议的 TJ 上限 120℃ 提前 5℃，用于留出保护裕量。
:::

</DocScope>

#### 冷却设备

温度超过 trip point 后，Thermal framework 通过冷却设备降温。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# for c in /sys/class/thermal/cooling_device*/type; do
>   echo "$c = $(cat $c)"; done
/sys/class/thermal/cooling_device0/type = cpufreq-cpu0
/sys/class/thermal/cooling_device1/type = cpufreq-cpu4
/sys/class/thermal/cooling_device2/type = emc2305_fan
/sys/class/thermal/cooling_device3/type = emc2305_fan
/sys/class/thermal/cooling_device4/type = devfreq-28108000.bpu
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# for c in /sys/class/thermal/cooling_device*/type; do
>   echo "$c = $(cat $c)"; done
/sys/class/thermal/cooling_device0/type = cpufreq-cpu0
/sys/class/thermal/cooling_device1/type = cpufreq-cpu2
/sys/class/thermal/cooling_device2/type = cpufreq-cpu6
/sys/class/thermal/cooling_device3/type = cpufreq-cpu10
/sys/class/thermal/cooling_device4/type = cpufreq-cpu14
/sys/class/thermal/cooling_device5/type = emc2305_fan
/sys/class/thermal/cooling_device6/type = emc2305_fan
/sys/class/thermal/cooling_device7/type = devfreq-28108000.bpu
/sys/class/thermal/cooling_device8/type = devfreq-29108000.bpu
/sys/class/thermal/cooling_device9/type = devfreq-2a108000.bpu
/sys/class/thermal/cooling_device10/type = devfreq-2b108000.bpu
```

</DocScope>

冷却设备分为三类：

| 冷却设备 | 作用 |
|---|---|
| `cpufreq-cpu*` | 降低 CPU 频率 |
| `devfreq-*.bpu` | 降低 BPU 频率 |
| `emc2305_fan` | 调节风扇转速 |

#### CPU 频率管理

Thermal 与 CPU 频率策略联动，高温时自动降频。

```bash
# 查看可用频率
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_frequencies

# 查看当前频率
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq

# 查看调速器
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
# performance
```

<DocScope products="RDK S100">

```bash
root@ubuntu:~# cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_frequencies
1125000 1500000
root@ubuntu:~# cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq
1500000
```

S100 的 CPU 频率经 SCMI 请求 MCU 调整，内核侧没有 CPU 的 `operating-points` 表。

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_frequencies
525000 1050000 2100000
root@drobot:~# cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq
2100000
```

</DocScope>

## 调试

### 查看驱动加载状态

<DocScope products="RDK S100">

```bash
dmesg | grep -iE "scmi|thermal"
```

正常时应能看到 SCMI 控制器与传感器注册的日志。若某传感器未被任何 thermal zone 引用，其注册返回 `-ENODEV` 并被跳过。

</DocScope>
<DocScope products="RDK S600">

```bash
dmesg | grep -i pvt
```

正常时应能看到 `hb_pvt` 驱动加载与 thermal zone 注册的日志。

</DocScope>

### 查看温度与策略

```bash
# 各 zone 的温度（毫摄氏度）
cat /sys/class/thermal/thermal_zone*/temp

# 各 zone 的策略
cat /sys/class/thermal/thermal_zone*/policy

# 各冷却设备的当前状态
cat /sys/class/thermal/cooling_device*/cur_state
```

### 查看设备树中的温度链路

<DocScope products="RDK S100">

```bash
# 确认 temperature 类传感器节点（SCMI 提供）
ls /proc/device-tree/firmware/scmi/scmi_sensors@15/

# 确认 thermal zone 的引用（每个 zone 的 thermal-sensors 属性）
ls /proc/device-tree/thermal-zones/
```

</DocScope>
<DocScope products="RDK S600">

```bash
# 确认 PVT 控制器节点存在
ls /proc/device-tree/soc/ | grep pvt

# 查看 pvtc 子节点
ls /proc/device-tree/soc/pvt/
```

</DocScope>

## 常见问题

### CPU/BPU 频率被限制（降频）

**原因**：温度超过 trip point 后，Thermal 策略（如 `step_wise`）触发 cooling device 限制 CPU/BPU 频率。

**解决**：用「温度查询」查看各 thermal zone 当前温度与 trip point（单位为毫摄氏度），确认是否越限；改善散热或调整 trip point 后观察频率恢复。

### 读取不到 thermal zone 温度

<DocScope products="RDK S100">

**原因**：SCMI 传感器通信异常，或设备树中 zone 引用的传感器 ID 与 MCU 上报的不一致。

**解决**：`dmesg | grep -iE "scmi|thermal"` 查看加载日志，确认 `scmi-hwmon` 已注册且无 `not attached to any thermal zone` 之外的报错；再 `ls /sys/class/thermal/` 确认 thermal zone 已注册。

</DocScope>
<DocScope products="RDK S600">

**原因**：`hb_pvt` 驱动模块未加载，未向内核 Thermal framework 注册 thermal zone。

**解决**：`dmesg | grep -i pvt` 查看驱动加载日志；缺失时 `modprobe hb_pvt`，再 `ls /sys/class/thermal/` 确认 thermal zone 已注册。

</DocScope>

## 相关文档

- [Thermal 和 CPU 频率管理](/System_configuration/frequency_management)：用户层的温度查询、策略与频率配置
- [配置 U-Boot 和 Kernel](/Advanced_development/driver_development/uboot_kernel_config)
