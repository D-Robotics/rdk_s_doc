---
sidebar_position: 8
title: "Thermal 和 CPU 频率管理"
description: "Thermal 温控、风扇、CPU 频率管理"
---

# Thermal 和 CPU 频率管理

SoC（System on Chip，系统级芯片）运行时，内部 CPU、BPU（智能计算架构）、MCU（Microcontroller Unit，微控制器）、DDR 等模块会产生热量。为保证可靠性与使用寿命，RDK 平台提供两层机制对温度与频率进行管理：

- **温度监测与热保护（Thermal）**：实时采集 SoC 内温度传感器数值，按温度阈值自动调整风扇转速、降低 CPU 与 BPU 运行频率，温度过高时关机保护。
- **CPU 频率管理（cpufreq）**：通过 Linux cpufreq 子系统，按负载或固定值调节 CPU 运行频率，在性能与功耗之间取得平衡。

两套机制均通过 sysfs 暴露给用户，可直接查询与配置，无需修改内核或驱动。下文先介绍工作原理，再给出配置方法。

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 工作原理

Linux Thermal 子系统是内核的温度控制框架，通过"测温—判断—降温"闭环维持芯片温度在安全区间：温度传感器采集温度，经 Thermal Zone 与 Governor 判定后，由 Cooling Device 执行降温动作。CPU 频率调节独立于 Thermal，由 cpufreq 子系统的 Governor 选定 OPP（Operating Performance Points，运行性能点），经时钟协议下发到固件完成变频。Thermal 闭环由三个角色协作完成：

| 角色 | 概念 | 职责 |
| --- | --- | --- |
| 测温 | Thermal Zone（温区） | 绑定温度传感器，监控该点温度 |
| 降温 | Cooling Device（降温设备） | 执行降温动作，包括风扇调速与频率限制 |
| 判断 | Governor（温控策略） | 依据温度决定降温设备的工作状态 |

### Trip Point 触发机制

每个温区下挂载若干 **Trip Point（触发点）**，即"当温度达到 X 时执行 Y 动作"的规则。随温度从低到高升高，降温动作逐级升级：

```text
温度升高 → 风扇调速 → CPU/BPU 限频 → hot 警告 → 关机保护
```

Linux Thermal 框架定义四种触发点类型，对应不同动作：

| 类型 | 含义 | 触发动作 |
| --- | --- | --- |
| `active` | 主动散热 | 启动或提升风扇档位 |
| `passive` | 被动限频 | 降低 CPU 或 BPU 频率 |
| `hot` | 高温警告 | 系统发出告警 |
| `critical` | 临界关机 | 系统关机保护 |

温区下的触发点以 `trip_point_N_temp` 形式暴露于 sysfs（`N` 为编号）。**编号顺序与温度高低无必然对应关系**，具体阈值以实际数值为准。修改某触发点的温度值，即调整该规则的触发阈值。

### 温控策略（Governor）

- **`step_wise`（默认）**：系统在每个轮询周期依据温度逐级调整降温档位。温度上升则档位递增，回落则逐级收回。该策略自动且渐进，但会覆盖用户手动设置的风扇档位。
- **`user_space`**：系统仅通过 uevent 将温度与触发点信息上报至用户态，由用户态程序或手动操作决定档位。若需固定风扇转速，须切换至该策略，否则 `step_wise` 会按温度自动改写设置。

:::info 配置非持久化
本文所有通过 sysfs 写入的配置仅在本次启动有效，重启后恢复默认。持久化方法见下文「进阶配置」。
:::

<DocScope products="RDK S100">

## 温度传感器 {#rdk-s100}

S100 内置 PVT（Process-Voltage-Temperature，工艺-电压-温度）监测单元，共 5 个温度传感器，分布于三个域：

| 域 | 数量 | sysfs label | hwmon 节点 |
| --- | --- | --- | --- |
| MAIN | 2 | `CMN_T1`、`CMN_T2` | `temp1_input`、`temp2_input` |
| MCU | 2 | `MCU_T1`、`MCU_T2` | `temp3_input`、`temp4_input` |
| BPU | 1 | `BPU_T1` | `temp5_input` |

温度精度为千分之一摄氏度。温度传感器通过 SCMI Sensor 协议上报，由 hwmon 设备 `scmi_sensors` 暴露，位于 `/sys/class/hwmon/hwmon0/`。

:::note 两个 hwmon 设备
S100 共有 2 个 hwmon 设备：hwmon0 为 `scmi_sensors`（温度传感器），hwmon1 为 `emc2305`（风扇控制器）。读取温度统一使用 hwmon0。
:::

## 温控配置

S100 注册 5 个温区（`thermal_zone0`~`thermal_zone4`），与 5 个传感器一一对应：

| 温区 | 域 | type | trip 数 |
| --- | --- | --- | --- |
| `thermal_zone0` | MAIN | `pvt_cmn_pvtc1_t1` | 4 |
| `thermal_zone1` | MAIN | `pvt_cmn_pvtc1_t2` | 1 |
| `thermal_zone2` | MCU | `pvt_mcu_pvtc1_t1` | 1 |
| `thermal_zone3` | MCU | `pvt_mcu_pvtc1_t2` | 1 |
| `thermal_zone4` | BPU | `pvt_bpu_pvtc1_t1` | 2 |

主温区 `thermal_zone0` 承担完整的温控链路（风扇调速与 CPU 降频）；`thermal_zone4` 承担 BPU 降频；其余温区仅配置关机保护。S100 使用 `passive` 与 `critical` 两种触发点类型。

### CPU 主温区（thermal_zone0）

| 触发点 | 默认温度 | 类型 | 动作 |
| --- | --- | --- | --- |
| `trip_point_0_temp` | 120℃ | critical | 系统关机 |
| `trip_point_1_temp` | 43℃ | passive | 风扇低速档（2~5） |
| `trip_point_2_temp` | 65℃ | passive | 风扇高速档（6~10） |
| `trip_point_3_temp` | 95℃ | passive | CPU 降频 |

### BPU 主温区（thermal_zone4）

| 触发点 | 默认温度 | 类型 | 动作 |
| --- | --- | --- | --- |
| `trip_point_0_temp` | 120℃ | critical | 系统关机 |
| `trip_point_1_temp` | 95℃ | passive | BPU 降频 |

其余温区（`thermal_zone1`、`thermal_zone2`、`thermal_zone3`）仅含 1 个 `critical`（120℃）触发点。

## 降温设备

降温设备（Cooling Device）是 Thermal 框架中执行降温动作的设备抽象。每个降温设备对应 sysfs 下的一个 `cooling_device` 节点，既可以是物理风扇（通过调速降温），也可以是 CPU 或 BPU（通过降低运行频率减少发热）。S100 共有 5 个降温设备（`cooling_device0`~`cooling_device4`），分三类：

| 降温设备 | 数量 | sysfs type | max_state |
| --- | --- | --- | --- |
| CPU cluster | 2 | `cpufreq-cpu0` / `cpufreq-cpu4` | 1 |
| 风扇 | 2 | `emc2305_fan` | 10 |
| BPU | 1 | `devfreq-*.bpu` | 1 |

`max_state` 为降温设备可用的最高冷却档位。CPU cluster 对应 2 个频点（`max_state=1`），BPU 对应 2 个频点（`max_state=1`），风扇对应 11 档转速（`max_state=10`，0 为关闭）。

:::note 风扇与集群降频
`thermal_zone0` 的 95℃ passive 触发点触发时，会对两个 cluster 全部 CPU 进行频率限制。BPU 降频作用于 BPU core。风扇在 sysfs 中有 2 个降温设备条目（`cooling_device2` 与 `cooling_device3`，均为 `emc2305_fan`），但二者映射到同一 PWM（Pulse Width Modulation，脉宽调制）通道（pwm1），驱动同一个物理风扇，设置任一个的档位，另一个同步变化。
:::

## CPU 频率管理

CPU 调频独立于 Thermal，由 Linux cpufreq 子系统管理，相关节点位于 `/sys/devices/system/cpu/cpufreq/policy<N>/`。S100 的 CPU 共 6 个核（Cortex-A78AE），划分为 2 个 cluster，每个 cluster 对应一个 cpufreq policy：

| policy | affected_cpus | 代表核 |
| --- | --- | --- |
| `policy0` | 0, 1, 2, 3 | cpu0 |
| `policy4` | 4, 5 | cpu4 |

两个 cluster 共享频点，支持两个频点：

| 频率 | 典型用途 |
| --- | --- |
| 1,500,000 KHz（1.5 GHz） | 最高性能 |
| 1,125,000 KHz（1.125 GHz） | 低功耗 |

常用 sysfs 字段：

| 文件 | 含义 |
| --- | --- |
| `scaling_governor` | 当前调频策略 |
| `scaling_available_governors` | 内核支持的全部策略 |
| `scaling_available_frequencies` | CPU 支持的频点列表（单位 KHz） |
| `scaling_cur_freq` | 当前频率（读取自 cpufreq 缓存） |
| `cpuinfo_cur_freq` | 当前频率（读取自硬件） |
| `scaling_driver` | 当前调频驱动 |
| `scaling_max_freq` / `scaling_min_freq` | 策略允许的最高 / 最低频率 |
| `scaling_setspeed` | 手动设频，仅在 governor 为 `userspace` 时可用 |

支持的调频策略（Governor）：

| 策略 | 行为 |
| --- | --- |
| `performance` | 始终运行于最高频，性能优先（出厂默认） |
| `powersave` | 始终运行于最低频，节能优先 |
| `ondemand` | 依据负载动态调频，负载升高则提速 |
| `conservative` | 类似 `ondemand`，升降频更为平滑 |
| `schedutil` | 依据负载调频，与内核调度器协同 |
| `userspace` | 由用户态设置频率，配合 `scaling_setspeed` 使用 |

:::note
不同芯片型号支持的频点与策略可能不同，以实际 `scaling_available_frequencies` / `scaling_available_governors` 输出为准。
:::

S100 的频点不由内核设备树定义，而由 SoC 固件经 SCMI（System Control and Management Interface，系统控制与管理接口）性能协议动态下发。cpufreq 驱动名为 `scmi`（scmi-cpufreq），它从固件读取 OPP 并经 SCMI 性能协议下发变频请求，最终由固件配置硬件 PLL（Phase-Locked Loop，锁相环）完成变频。

:::note 默认策略
S100 出厂默认调频策略为 `performance`，即开机后两个 cluster 全部运行在 1.5 GHz 最高频。需降低功耗时可切换其他策略，如 `ondemand` 在系统空闲时自动降至 1.125 GHz。
:::

## 配置方法

### 查看温度

```bash
cat /sys/class/hwmon/hwmon0/temp1_input
```

预期输出（示例）：

```text
50598
```

单位 0.001℃，即 50.6℃。查看传感器标签：

```bash
cat /sys/class/hwmon/hwmon0/temp1_label
```

预期输出：

```text
CMN_T1
```

查看 SoC 整体状态（温度、电压等，工具位于 `/usr/hobot/bin/hrut_somstatus`）：

```bash
sudo hrut_somstatus
```

### 查看与切换温控策略

```bash
cat /sys/class/thermal/thermal_zone0/policy # step_wise
cat /sys/class/thermal/thermal_zone0/available_policies # user_space step_wise
```

切换为用户空间策略：

```bash
echo user_space > /sys/class/thermal/thermal_zone0/policy
```

### 调整温度阈值

以"CPU 主温区 85℃ 开始降频"为例，将降频触发点改为 85℃（`thermal_zone0` 的降频 trip 为 `trip_point_3`）：

```bash
echo 85000 > /sys/class/thermal/thermal_zone0/trip_point_3_temp
```

:::warning 阈值调整风险
调高 critical（关机）温度可能损坏硬件，调低 passive（降频）温度会降低性能。请结合产品散热条件谨慎设置。
:::

### 固定风扇档位

风扇档位范围 0~10，0 为关闭，10 为满转速。固定档位须先将 `thermal_zone0` 切换为 `user_space` 策略，再设置档位；否则 `step_wise` 会按温度自动改回：

```bash
# 查看风扇降温设备与当前档位
cat /sys/class/thermal/cooling_device2/type          # emc2305_fan
cat /sys/class/thermal/cooling_device2/max_state     # 10
cat /sys/class/thermal/cooling_device2/cur_state

# 将 CPU 主温区切换为用户空间策略，再设为满转速
echo user_space > /sys/class/thermal/thermal_zone0/policy
echo 10 > /sys/class/thermal/cooling_device2/cur_state
```

:::note
`cooling_device2` 与 `cooling_device3` 同为 `emc2305_fan` 且驱动同一物理风扇，可任选其一设置档位，另一个同步变化。
:::

### 查看 CPU 频点与当前频率

```bash
# 支持的频点列表（单位 KHz）
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_available_frequencies
# 当前频率（读取自 cpufreq 缓存）
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_cur_freq
# 当前调频驱动
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_driver
# 当前调频策略
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_governor
```

### 切换 CPU 调频策略

```bash
echo ondemand > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
```

:::note 策略作用范围
对 cpu0 切换 governor 时，实际作用于 `policy0` 覆盖的全部 CPU（`affected_cpus`）。如需对 cluster1 调整，操作 cpu4 的 cpufreq 目录即可。
:::

### 固定 CPU 频率

先切换为 `userspace` 策略，再设置目标频率：

```bash
echo userspace > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo 1125000 > /sys/devices/system/cpu/cpufreq/policy0/scaling_setspeed
```

## 验证

```bash
# 输出应与上述所设值一致
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_governor
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_cur_freq
cat /sys/class/thermal/thermal_zone0/trip_point_3_temp
```

预期输出（示例）：

```text
userspace
1125000
85000
```

## 进阶配置

### 持久化配置

上述 sysfs 修改仅在本次启动有效，重启后恢复默认。需持久化时，将配置命令写入 systemd 服务或 `/etc/rc.local`，开机自动执行，参见[开机自启动配置](./06_self_start.md)。

### 调整关机温度

如需将关机温度从 120℃ 调整为 105℃，需修改所有温区的 critical 触发点。S100 所有温区的关机 trip 均为 `trip_point_0`：

```bash
for z in 0 1 2 3 4; do
  echo 105000 > /sys/class/thermal/thermal_zone${z}/trip_point_0_temp
done
```

:::warning 关机温度为硬件安全兜底
调高关机温度有损坏硬件风险。建议仅在充分评估散热能力后调整，且不低于厂商建议值。
:::

## 常见问题

### 修改 trip 温度后重启失效

**原因**：sysfs 修改仅存于运行时内存，不落盘，重启后恢复默认。

**解决**：将配置命令写入开机自启动脚本，参见上文「进阶配置 > 持久化配置」。

### 固定风扇档位后被自动改回

**原因**：对应温区仍为 `step_wise` 策略，Governor 按温度自动调节风扇，覆盖手动设置。

**解决**：将主温区 `thermal_zone0` 切换为 `user_space` 后再设置档位。

### 切换 governor 后 CPU 频率未变化

**原因**：目标 CPU 处于 offline，或 policy 未覆盖该核。

**解决**：先确认 CPU 在线（`cat /sys/devices/system/cpu/cpu0/online`），并检查 `affected_cpus` 是否包含目标核。

### CPU 无法固定至指定频率

**原因**：`scaling_setspeed` 仅在 governor 为 `userspace` 时可用。

**解决**：先执行 `echo userspace > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor`，再向 `scaling_setspeed` 写入目标频率。

</DocScope>

<DocScope products="RDK S600">

## 温度传感器 {#rdk-s600}

S600 内置 PVT（Process-Voltage-Temperature，工艺-电压-温度）监测单元，共 19 个温度传感器，覆盖 CPU、DDR、BPU 三个域。每个传感器可通过 `_label` 节点反查归属：

| 域 | 数量 | sysfs label | hwmon 节点 |
| --- | --- | --- | --- |
| CPU | 7 | `CMN0-TS0` ~ `CMN0-TS6` | `temp1_input` ~ `temp7_input` |
| DDR | 4 | `DDR0-TS0` ~ `DDR3-TS0` | `temp8_input` ~ `temp11_input` |
| BPU | 8 | `BPU0-TS00` ~ `BPU3-TS01` | `temp12_input` ~ `temp19_input` |

温度精度为千分之一摄氏度，量程 -40~125℃。所有 PVT 温度传感器统一通过 hwmon 子系统上报，位于 `/sys/class/hwmon/hwmon1/`。

:::note 四个 hwmon 设备
S600 共有 4 个 hwmon 设备：hwmon0 为 `emc2305`（风扇控制器），hwmon1 为 `pvt_hwmon`（温度传感器），hwmon2 与 hwmon3 为以太网 PHY（Physical Layer，物理层）。读取温度统一使用 hwmon1。
:::

## 温控配置

S600 注册 19 个温区（`thermal_zone0`~`thermal_zone18`），与 19 个传感器一一对应，按域分组。每个域设有一个主控温区挂载风扇与限频规则，其余温区仅配置关机保护：

| 域 | 温区范围 | 主控温区 | 主控温区 trip 数 |
| --- | --- | --- | --- |
| CPU | zone0~6 | `thermal_zone2` | 5 |
| DDR | zone7~10 | —（无降温设备） | 各 2 |
| BPU | zone11~18 | `thermal_zone16` | 5 |

### CPU 主温区（thermal_zone2）

| 触发点 | 默认温度 | 类型 | 动作 |
| --- | --- | --- | --- |
| `trip_point_0_temp` | 45℃ | active | 风扇低速档（2~5） |
| `trip_point_1_temp` | 65℃ | active | 风扇高速档（6~10） |
| `trip_point_2_temp` | 95℃ | passive | CPU 限频 |
| `trip_point_3_temp` | 110℃ | hot | 高温警告 |
| `trip_point_4_temp` | 115℃ | critical | 系统关机 |

其余 CPU 温区（zone0/1/3/4/5/6）仅含 1 个 `critical`（115℃）触发点。

### DDR 温区（thermal_zone7~10）

每个 DDR 温区含 2 个触发点：

| 触发点 | 默认温度 | 类型 | 动作 |
| --- | --- | --- | --- |
| `trip_point_0_temp` | 110℃ | hot | 高温警告 |
| `trip_point_1_temp` | 115℃ | critical | 系统关机 |

### BPU 主温区（thermal_zone16）

| 触发点 | 默认温度 | 类型 | 动作 |
| --- | --- | --- | --- |
| `trip_point_0_temp` | 45℃ | active | 风扇低速档（2~5） |
| `trip_point_1_temp` | 65℃ | active | 风扇高速档（6~10） |
| `trip_point_2_temp` | 95℃ | passive | BPU 限频 |
| `trip_point_3_temp` | 110℃ | hot | 高温警告 |
| `trip_point_4_temp` | 115℃ | critical | 系统关机 |

其余 BPU 温区（zone11~15、17、18）仅含 1 个 `critical`（115℃）触发点。

## 降温设备

降温设备（Cooling Device）是 Thermal 框架中执行降温动作的设备抽象。每个降温设备对应 sysfs 下的一个 `cooling_device` 节点，既可以是物理风扇（通过调速降温），也可以是 CPU 或 BPU（通过降低运行频率减少发热）。S600 共有 11 个降温设备（`cooling_device0`~`cooling_device10`），分三类，其中风扇类为 2 个 sysfs 条目，对应同一物理风扇（详见下文）：

| 降温设备 | 数量 | sysfs type | max_state |
| --- | --- | --- | --- |
| CPU cluster | 5 | `cpufreq-cpu0` / `cpu2` / `cpu6` / `cpu10` / `cpu14` | 2 |
| 风扇 | 2 | `emc2305_fan` | 10 |
| BPU core | 4 | `devfreq-*.bpu` | 1 |

`max_state` 为降温设备可用的最高冷却档位。CPU cluster 对应 3 个频点（`max_state=2`），BPU 对应 2 个频点（`max_state=1`），风扇对应 11 档转速（`max_state=10`，0 为关闭）。

:::note 风扇与集群降频
风扇在 sysfs 中有 2 个降温设备条目（`cooling_device5` 与 `cooling_device6`，均为 `emc2305_fan`），二者映射到同一 PWM（Pulse Width Modulation，脉宽调制）通道（pwm1），驱动同一个物理风扇，设置任一个另一个同步变化。

该风扇同时被 CPU 主温区（`thermal_zone2`）与 BPU 主温区（`thermal_zone16`）的 active 触发点引用，任一域温度升高都会触发风扇提速。

CPU 限频时对 5 个 cluster 各选一个代表核限频，同一 cluster 内 CPU 共享 OPP 表，整个 cluster 随之降频。BPU 降频同理作用于 4 个 BPU core。
:::

## CPU 频率管理

CPU 调频独立于 Thermal，由 Linux cpufreq 子系统管理，相关节点位于 `/sys/devices/system/cpu/cpufreq/policy<N>/`。S600 的 CPU 共 18 个核，划分为 5 个 cluster，每个 cluster 对应一个 cpufreq policy，共享一张 OPP 表，支持三个频点：

| 频率 | 典型用途 |
| --- | --- |
| 2,100,000 KHz（2.1 GHz） | 最高性能 |
| 1,050,000 KHz（1.05 GHz） | 平衡 |
| 525,000 KHz（525 MHz） | 低功耗 |

5 个 policy 与 cluster 的对应关系：

| policy | affected_cpus | 代表核 |
| --- | --- | --- |
| `policy0` | 0, 1 | cpu0 |
| `policy2` | 2, 3, 4, 5 | cpu2 |
| `policy6` | 6, 7, 8, 9 | cpu6 |
| `policy10` | 10, 11, 12, 13 | cpu10 |
| `policy14` | 14, 15, 16, 17 | cpu14 |

常用 sysfs 字段：

| 文件 | 含义 |
| --- | --- |
| `scaling_governor` | 当前调频策略 |
| `scaling_available_governors` | 内核支持的全部策略 |
| `scaling_available_frequencies` | CPU 支持的频点列表（单位 KHz） |
| `scaling_cur_freq` | 当前频率（读取自 cpufreq 缓存） |
| `cpuinfo_cur_freq` | 当前频率（读取自硬件） |
| `scaling_driver` | 当前调频驱动 |
| `scaling_max_freq` / `scaling_min_freq` | 策略允许的最高 / 最低频率 |
| `scaling_setspeed` | 手动设频，仅在 governor 为 `userspace` 时可用 |

支持的调频策略（Governor）：

| 策略 | 行为 |
| --- | --- |
| `performance` | 始终运行于最高频，性能优先（出厂默认） |
| `powersave` | 始终运行于最低频，节能优先 |
| `ondemand` | 依据负载动态调频，负载升高则提速 |
| `conservative` | 类似 `ondemand`，升降频更为平滑 |
| `schedutil` | 依据负载调频，与内核调度器协同 |
| `userspace` | 由用户态设置频率，配合 `scaling_setspeed` 使用 |

:::note
不同芯片型号支持的频点与策略可能不同，以实际 `scaling_available_frequencies` / `scaling_available_governors` 输出为准。
:::

cpufreq 驱动名为 `cpufreq-dt`，从设备树读取 OPP 表，经 SCMI（System Control and Management Interface，系统控制与管理接口）时钟协议下发到安全固件，由安全固件配置硬件 PLL（Phase-Locked Loop，锁相环）完成变频。

:::note 默认策略
S600 出厂默认调频策略为 `performance`，即开机后 5 个 cluster 全部运行在 2.1 GHz 最高频。需降低功耗时可切换其他策略，如 `ondemand` 在系统空闲时自动降至 525 MHz。
:::

## 配置方法

### 查看温度

```bash
cat /sys/class/hwmon/hwmon1/temp1_input
```

预期输出（示例）：

```text
56339
```

单位 0.001℃，即 56.3℃。查看传感器标签：

```bash
cat /sys/class/hwmon/hwmon1/temp1_label
```

预期输出：

```text
CMN0-TS0
```

查看 SoC 整体状态（温度、电压等，工具位于 `/usr/hobot/bin/hrut_somstatus`）：

```bash
sudo hrut_somstatus
```

### 查看与切换温控策略

```bash
cat /sys/class/thermal/thermal_zone2/policy # step_wise
cat /sys/class/thermal/thermal_zone2/available_policies # user_space step_wise
```

切换为用户空间策略：

```bash
echo user_space > /sys/class/thermal/thermal_zone2/policy
```

### 调整温度阈值

以"CPU 主温区 85℃ 开始降频"为例，将降频触发点改为 85℃（`thermal_zone2` 的降频 trip 为 `trip_point_2`）：

```bash
echo 85000 > /sys/class/thermal/thermal_zone2/trip_point_2_temp
```

:::warning 阈值调整风险
调高 critical（关机）温度可能损坏硬件，调低 passive（降频）温度会降低性能。请结合产品散热条件谨慎设置。
:::

### 固定风扇档位

风扇档位范围 0~10，0 为关闭，10 为满转速。S600 的风扇同时受 `thermal_zone2` 与 `thermal_zone16` 两个温区控制，固定档位时**两个温区均须切换为 `user_space` 策略**，仅切换其一仍会被另一温区按温度改回：

```bash
# 查看风扇降温设备与当前档位
cat /sys/class/thermal/cooling_device5/type          # emc2305_fan
cat /sys/class/thermal/cooling_device5/max_state     # 10
cat /sys/class/thermal/cooling_device5/cur_state

# 将两个主温区都切换为用户空间策略，再设为满转速
echo user_space > /sys/class/thermal/thermal_zone2/policy
echo user_space > /sys/class/thermal/thermal_zone16/policy
echo 10 > /sys/class/thermal/cooling_device5/cur_state
```

:::note
`cooling_device5` 与 `cooling_device6` 同为 `emc2305_fan` 且驱动同一物理风扇，可任选其一设置档位，另一个同步变化。
:::

### 查看 CPU 频点与当前频率

```bash
# 支持的频点列表（单位 KHz）
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_available_frequencies
# 当前频率（读取自 cpufreq 缓存）
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_cur_freq
# 当前调频驱动
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_driver
# 当前调频策略
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_governor
```

### 切换 CPU 调频策略

```bash
echo ondemand > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
```

:::note 策略作用范围
对 cpu0 切换 governor 时，实际作用于 `policy0` 覆盖的全部 CPU（`affected_cpus`）。如需对其他 cluster 调整，操作该 cluster 内任意一个 CPU 的 cpufreq 目录即可。
:::

### 固定 CPU 频率

先切换为 `userspace` 策略，再设置目标频率：

```bash
echo userspace > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo 1050000 > /sys/devices/system/cpu/cpufreq/policy0/scaling_setspeed
```

## 验证

```bash
# 输出应与上述所设值一致
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_governor
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_cur_freq
cat /sys/class/thermal/thermal_zone2/trip_point_2_temp
```

预期输出（示例）：

```text
userspace
1050000
85000
```

## 进阶配置

### 持久化配置

上述 sysfs 修改仅在本次启动有效，重启后恢复默认。需持久化时，将配置命令写入 systemd 服务或 `/etc/rc.local`，开机自动执行，参见[开机自启动配置](./06_self_start.md)。

### 调整关机温度

如需将关机温度从 115℃ 调整为 105℃，需修改所有温区的 critical 触发点。各温区的关机触发点编号不同：主控温区为 `trip_point_4`，DDR 温区为 `trip_point_1`，单触发点温区为 `trip_point_0`。

```bash
# CPU 主温区
echo 105000 > /sys/class/thermal/thermal_zone2/trip_point_4_temp
# BPU 主温区
echo 105000 > /sys/class/thermal/thermal_zone16/trip_point_4_temp
# DDR 温区
for z in 7 8 9 10; do
  echo 105000 > /sys/class/thermal/thermal_zone${z}/trip_point_1_temp
done
# 其余单触发点温区
for z in 0 1 3 4 5 6 11 12 13 14 15 17 18; do
  echo 105000 > /sys/class/thermal/thermal_zone${z}/trip_point_0_temp
done
```

:::warning 关机温度为硬件安全兜底
调高关机温度有损坏硬件风险。建议仅在充分评估散热能力后调整，且不低于厂商建议值。
:::

## 常见问题

### 修改 trip 温度后重启失效

**原因**：sysfs 修改仅存于运行时内存，不落盘，重启后恢复默认。

**解决**：将配置命令写入开机自启动脚本，参见上文「进阶配置 > 持久化配置」。

### 固定风扇档位后被自动改回

**原因**：对应温区仍为 `step_wise` 策略，Governor 按温度自动调节风扇，覆盖手动设置。

**解决**：风扇同时受 `thermal_zone2` 与 `thermal_zone16` 控制，须将两个温区都切换为 `user_space` 后再设置档位。

### 切换 governor 后 CPU 频率未变化

**原因**：目标 CPU 处于 offline，或 policy 未覆盖该核。

**解决**：先确认 CPU 在线（`cat /sys/devices/system/cpu/cpu0/online`），并检查 `affected_cpus` 是否包含目标核。

### CPU 无法固定至指定频率

**原因**：`scaling_setspeed` 仅在 governor 为 `userspace` 时可用。

**解决**：先执行 `echo userspace > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor`，再向 `scaling_setspeed` 写入目标频率。

</DocScope>

## 相关文档

- [开机自启动配置](./06_self_start.md)
- [显示配置](./09_display_config.md)
- [屏幕休眠与电源管理](./11_screen_sleep.md)
- [Thermal 驱动开发（进阶）](../07_Advanced_development/04_driver_development/08_driver_thermal_dev.md)
