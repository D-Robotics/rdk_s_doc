---
sidebar_position: 4
---

# 2.4 Thermal 和 CPU 频率管理

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK S100">

## RDK S100
### 温度传感器
在 RDKS100芯片中有5个温度传感器，用于显示 MCU 域/BPU/MAIN 域的温度，其中 MAIN 域和 MCU 各有两个温度传感器，BPU 有一个温度传感器

在/sys/class/hwmon/下有 hwmon0目录下包含温度传感器的相关参数
- temp1_input 是 MAIN 域的第一个温度传感器，temp2_input 是 MAIN 域的第二个温度传感器，
- temp3_input 是 MCU 域的第一个温度传感器，temp4_input 是 MCU 域的第二个温度传感器，
- temp5_input 是 BPU 温度传感器。

温度的精度为0.001摄氏度

```
root@ubuntu:~# cat /sys/class/hwmon/hwmon0/temp1_input
46837
root@ubuntu:~#
```
### Thermal 机制
Linux Thermal 是 Linux 系统下温度控制相关的模块，主要用来控制系统运行过程中芯片产生的热量，使芯片温度和设备外壳温度维持在一个安全、舒适的范围。

要想达到合理控制设备温度，我们需要了解以下三个模块：

  - 获取温度的设备：在 Thermal 框架中被抽象为 Thermal Zone Device，RDK S100上有5个 thermal zone，分别是 thermal_zone0~thermal_zone4，分别绑定5个温度传感器；
  - 进行降温的设备：在 Thermal 框架中被抽象为 Thermal Cooling Device，有 CPU、BPU 和风扇；
    - CPU/BPU 等设备通过调频来进行降温；
    - 风扇则可以控制转速来进行降温；
  - 控制温度策略：在 Thermal 框架中被抽象为 Thermal Governor;

以上模块的信息和控制都可以在 `/sys/class/thermal` 目录下获取。

#### Thermal Zone 简介
获取某一个 thermal_zone 的信息，以 thermal_zone0为例，示例命令如下：
```shell
root@ubuntu:~# cat /sys/class/thermal/thermal_zone0/type
pvt_cmn_pvtc1_t1
```

获取某一个 thermal_zone 的当前的策略，以 thermal_zone0为例，示例命令如下：
```shell
root@ubuntu:~# cat /sys/class/thermal/thermal_zone0/policy
step_wise
```

获取某一个 thermal_zone 支持的策略，以 thermal_zone0为例，示例命令如下：
```shell
root@ubuntu:~# cat /sys/class/thermal/thermal_zone0/available_policies
user_space step_wise
```
可看到 thermal 支持的策略有：`user_space`和`step_wise`
- `user_space`： 是通过 uevent 将温区当前温度，温控触发点等信息上报到用户空间，由用户空间软件制定温控的策略。

- `step_wise`： 是每个轮询周期逐级提高冷却状态，是一种相对温和的温控策略

具体选择哪种策略客户可以根据产品自行选择。可在编译的时候指定或者通过 sysfs 动态切换。
例如：动态切换 thermal_zone0的策略为`user_space`模式
```shell
echo user_space > /sys/class/thermal/thermal_zone0/policy
```

##### thermal_zone0简介
在 thermal_zone0中有4个 trip_point，
- trip_point_0_temp：关机温度，默认设置为120度
- trip_point_1_temp：用于控制风扇转速，默认为43度，风扇档位范围2~5，表示超过43度，风扇将从关闭状态调整为2档，最高可提升到5档。
- trip_point_2_temp：用于控制风扇转速，默认为65度，风扇档位范围6~10，表示超过65度，风扇将调整到6档，最高可提升到10档慢转速。
- trip_point_3_temp：用于控制 CPU Acore 频率，默认为95度，表示超过95度，CPU Acore 会降频。
可通过 sysfs 查看相应的温度设置
```shell
root@ubuntu:~# cat /sys/devices/virtual/thermal/thermal_zone0/trip_point_0_temp
120000
```
若想调整相应的温度，如85度开始 CPU 调频，可通过如下命令：
```shell
echo 85000 > /sys/devices/virtual/thermal/thermal_zone0/trip_point_3_temp
```

##### thermal_zone1/2/3简介
在 thermal_zone1/2/3中有1个 trip_point，都表示的是关机温度，默认为120度

在 thermal_zone4中有两个 trip_point,其中
- trip_point_0_temp 为关机温度，默认为120度。
- trip_point_1_temp 为 BPU 的调频温度，默认为95度

例如想要结温到85摄氏度，BPU 开始调频：
```shell
echo 85000 > /sys/devices/virtual/thermal/thermal_zone4/trip_point_1_temp
```

如果想要调整关机温度为105摄氏度， 可通过修改所有 thermal_zone 的 trip_point_0_temp 来实现
```shell
echo 105000 > /sys/devices/virtual/thermal/thermal_zone0/trip_point_0_temp
echo 105000 > /sys/devices/virtual/thermal/thermal_zone1/trip_point_0_temp
echo 105000 > /sys/devices/virtual/thermal/thermal_zone2/trip_point_0_temp
echo 105000 > /sys/devices/virtual/thermal/thermal_zone3/trip_point_0_temp
echo 105000 > /sys/devices/virtual/thermal/thermal_zone4/trip_point_0_temp
```

:::info
PS：以上设置只在当前启动有效，<ins>重启后</ins>需要**重新**设置。
:::

#### 降温设备
在 RDK S100中一共有四个 cooling(降温)设备：

- cooling_device0: cpu cluster 0， 通过调整频率控制温度
- cooling_device1: cpu cluster 1， 通过调整频率控制温度
- cooling_device2: emc2305 fan，通过调整风扇转速档位来控制温度，档位从0~10，0表示关闭，10表示风扇满转速。
- cooling_device3: bpu， 通过调整频率控制温度

其中，cooling 设备 CPU 和风扇与 thermal_zone0关联，cooling 设备 BPU 与 thermal_zone4关联，thermal_zone1/2/3没有绑定 cooling 设备

目前默认的策略用的是`step_wise`。

##### 风扇调节
RDK S100开发板上的 emc2305风扇控制器，可以通过设备节点获取设备基本信息及控制转速：
1. 获取降温设备信息：
    ```shell
    root@ubuntu:~# cat /sys/class/thermal/cooling_device2/type
    emc2305_fan
    ```
2. 获取可配置的风扇档位：
    ```shell
    root@ubuntu:~# cat /sys/class/thermal/cooling_device2/max_state
    10
    ```
3. 获取当前风扇档位
   ```shell
   root@ubuntu:~# cat /sys/class/thermal/cooling_device2/cur_state
   5
   ```
4. 配置 thermal_zone0的策略为`userspace`：
    ```
    echo user_space > /sys/class/thermal/thermal_zone0/policy
    ```
5. 配置当前风扇档位为10：
   ```shell
   root@ubuntu:~# echo 10 > /sys/class/thermal/cooling_device2/cur_state
   ```

:::info
**注意**：当 thermal_zone0的策略为`step_wise`时，用户配置的风扇档位会被系统自动根据当前温度进行调节。如果客户需要将风扇固定为特定档位，请参考[Thermal Zone](#thermal-zone简介)章节，将 thermal_zone0的策略改为`user_space`
:::

### CPU 频率管理

在 linux 内核中，自带了 cpufreq 子系统用来控制 cpu 的频率和频率控制策略。

进入目录`/sys/devices/system/cpu/cpufreq/policy0`，`ls` 一下，会看到目录中有如下文件：

```shell
affected_cpus						// 当前控制影响的CPU核(没有显示处于offline状态的cpu)
cpuinfo_cur_freq					// 当前CPU频率(单位: KHz）
cpuinfo_max_freq					// 当前调频策略下CPU可用的最高频率(单位: KHz）
cpuinfo_min_freq					// 当前调频策略下CPU可用的最低频率(单位: KHz）
cpuinfo_transition_latency			// 处理器切换频率所需要的时间(单位:ns)
related_cpus						// 该控制策略影响到哪些CPU核(包括了online+offline的所有cpu)
scaling_available_frequencies		// CPU支持的主频率列表(单位: KHz）
scaling_available_governors			// 当前内核中支持的所有 governor(调频)类型
scaling_cur_freq					// 保存着 cpufreq 模块缓存的当前 CPU 频率，不会对 CPU 硬件寄存器进行检查。
scaling_driver						// 当前使用的调频驱动
scaling_governor					// governor(调频)策略
scaling_max_freq					// 当前调频策略下CPU可用的最高频率（从cpufreq模块缓存中读取）
scaling_min_freq					// 当前调频策略下CPU可用的最低频率（从cpufreq模块缓存中读取）
scaling_setspeed					// 需将governor切换为userspace才能使用，往这个文件echo数值，会切换频率
```

目前支持的频率包括
```shell
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_available_frequencies
1500000 2000000
```

注：支持的频点可能在不同类型的芯片上有所差异。
RDK S100系统使用的 linux 内核支持以下种类的调频策略:

- 性能（performance）：总是将 CPU 置于最高能耗也是最高性能的状态，即硬件所支持的最高频。
- performance：以最高频率执行
- ondemand：按照负载调整频率
- userspace：根据用户的设置频率
- powersave：以最低频率执行
- schedutil：按照负载调整频率，它是与 CPU 调度器结合来使用
- conservative：类似 Ondemand，不过频率调节的会平滑一下，不会有忽然调整为最大值又忽然调整为最小值的现象

用户可以通过控制目录`/sys/devices/system/cpu/cpu0/cpufreq/`下的对应设置来控制 CPU 的调频策略。

例如让 CPU 运行在性能模式：

```shell
echo performance >/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
```

或者控制 CPU 运行在一个固定的频率（1.5GHz）：

```shell
echo userspace >/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo 1500000 >/sys/devices/system/cpu/cpufreq/policy0/scaling_setspeed
```

可通过`sudo hrut_somstatus`命令查看当前芯片工作频率、温度等状态

</DocScope>

<DocScope products="RDK S600">

## RDK S600
### 温度传感器
在 RDKS600芯片中有19个温度传感器，用于显示 BPU/CPU/DDR 的温度，其中 BPU 有8个温度传感器，CPU 有7个温度传感器，DDR 有4个温度传感器。

在/sys/class/hwmon/下有 hwmon1目录下包含温度传感器的相关参数
- temp1_input 到 temp7_input 是 CPU 的温度传感器，对应的 label 为 CMN0-TS[0~6]
- temp8_input 到 temp11_input 是 DDR 的温度传感器，对应的 label 为 DDR[0~3]-TS0
- temp12_input 到 temp19_input 是 BPU 的温度传感器，对应的 label 为 BPU[0~3]-TS0[0~1]

温度的精度为千分之一摄氏度，范围为-40~125摄氏度

```
root@ubuntu:~# cat /sys/class/hwmon/hwmon1/temp1_label
CMN0-TS0
root@ubuntu:~# cat /sys/class/hwmon/hwmon1/temp1_input
56339
```
以上是 CPU 第一个温度传感器的示例，名字为'CMN0-TS0'，温度为56.339摄氏度

### Thermal 机制
Linux Thermal 是 Linux 系统下温度控制相关的模块，主要用来控制系统运行过程中芯片产生的热量，使芯片温度和设备外壳温度维持在一个安全、舒适的范围。

要想达到合理控制设备温度，我们需要了解以下三个模块：

  - 获取温度的设备：在 Thermal 框架中被抽象为 Thermal Zone Device，RDK S600上有19个 thermal zone，分别是 thermal_zone0~thermal_zone18，分别绑定19个温度传感器；
  - 进行降温的设备：在 Thermal 框架中被抽象为 Thermal Cooling Device，有 CPU、BPU 和风扇；
    - CPU/BPU 等设备通过调频来进行降温；
    - 风扇则可以控制转速来进行降温；
  - 控制温度策略：在 Thermal 框架中被抽象为 Thermal Governor;

以上模块的信息和控制都可以在 `/sys/class/thermal` 目录下获取。

#### Thermal Zone 简介
获取某一个 thermal_zone 的信息，以 thermal_zone0为例，示例命令如下：
```shell
root@ubuntu:~# cat /sys/class/thermal/thermal_zone0/type
pvt_cmn_pvtc1_t1
```

获取某一个 thermal_zone 的当前的策略，以 thermal_zone0为例，示例命令如下：
```shell
root@ubuntu:~# cat /sys/class/thermal/thermal_zone0/policy
step_wise
```

获取某一个 thermal_zone 支持的策略，以 thermal_zone0为例，示例命令如下：
```shell
root@ubuntu:~# cat /sys/class/thermal/thermal_zone0/available_policies
user_space step_wise
```
可看到 thermal 支持的策略有：`user_space`和`step_wise`
- `user_space`： 是通过 uevent 将温区当前温度，温控触发点等信息上报到用户空间，由用户空间软件制定温控的策略。

- `step_wise`： 是每个轮询周期逐级提高冷却状态，是一种相对温和的温控策略

具体选择哪种策略客户可以根据产品自行选择。可在编译的时候指定或者通过 sysfs 动态切换。
例如：动态切换 thermal_zone0的策略为`user_space`模式
```shell
echo user_space > /sys/class/thermal/thermal_zone0/policy
```

##### CPU thermal_zone 简介

CPU thermal_zone 包含 thermal_zone0到 thermal_zone6

在 thermal_zone2中有5个 trip_point，
- trip_point_0_temp：用于控制风扇转速，默认为45度，风扇档位范围2~5，表示超过45度，风扇将从关闭状态调整为2档，最高可提升到5档。
- trip_point_1_temp：用于控制风扇转速，默认为65度，风扇档位范围6~10，表示超过65度，风扇将调整到6档，最高可提升到10档转速。
- trip_point_2_temp：用于控制 CPU Acore 频率，默认为95度，表示超过95度，CPU Acore 会降频。
- trip_point_3_temp：hot 温度，默认设置为110度，表示超过110度，系统发出 hot 警告。
- trip_point_4_temp：关机温度，默认设置为115度，表示超过115度，系统将关机。

可通过 sysfs 查看相应的温度设置
```shell
root@ubuntu:~# cat /sys/class/thermal/thermal_zone2/trip_point_0_temp
45000
```
若想调整相应的温度，如85度开始 CPU 调频，可通过如下命令：
```shell
echo 85000 > /sys/class/thermal/thermal_zone2/trip_point_2_temp
```

其他 thermal_zone 中有1个 trip_point，都表示的是关机温度，默认为115度

##### DDR thermal_zone 简介

DDR thermal_zone 包含 thermal_zone7到 thermal_zone10

thermal_zone 中有2个 trip_point，
- trip_point_0_temp：hot 温度，默认设置为110度，表示超过110度，系统发出 hot 警告。
- trip_point_1_temp：关机温度，默认设置为115度，表示超过115度，系统将关机。

##### BPU thermal_zone 简介

BPU thermal_zone 包含 thermal_zone11到 thermal_zone18

在 thermal_zone16中有4个 trip_point,其中
- trip_point_0_temp：用于控制风扇转速，默认为45度，风扇档位范围2~5，表示超过45度，风扇将从关闭状态调整为2档，最高可提升到5档。
- trip_point_1_temp：用于控制风扇转速，默认为65度，风扇档位范围6~10，表示超过65度，风扇将调整到6档，最高可提升到10档转速。
- trip_point_2_temp：用于控制 BPU 频率，默认为95度，表示超过95度，BPU 会降频。
- trip_point_3_temp：hot 温度，默认设置为110度，表示超过110度，系统发出 hot 警告。
- trip_point_4_temp：关机温度，默认设置为115度，表示超过115度，系统将关机。

例如想要结温到85摄氏度，BPU 开始调频：
```shell
echo 85000 > /sys/class/thermal/thermal_zone16/trip_point_2_temp
```

其他 thermal_zone 中有1个 trip_point，都表示的是关机温度，默认为115度

如果想要调整关机温度为105摄氏度， 可通过修改所有 thermal_zone 的 trip_point_0_temp 来实现
```shell
echo 105000 > /sys/class/thermal/thermal_zone0/trip_point_0_temp
echo 105000 > /sys/class/thermal/thermal_zone1/trip_point_0_temp
echo 105000 > /sys/class/thermal/thermal_zone2/trip_point_4_temp
echo 105000 > /sys/class/thermal/thermal_zone3/trip_point_0_temp
echo 105000 > /sys/class/thermal/thermal_zone4/trip_point_0_temp
echo 105000 > /sys/class/thermal/thermal_zone5/trip_point_0_temp
echo 105000 > /sys/class/thermal/thermal_zone6/trip_point_0_temp
echo 105000 > /sys/class/thermal/thermal_zone7/trip_point_1_temp
echo 105000 > /sys/class/thermal/thermal_zone8/trip_point_1_temp
echo 105000 > /sys/class/thermal/thermal_zone9/trip_point_1_temp
echo 105000 > /sys/class/thermal/thermal_zone10/trip_point_1_temp
echo 105000 > /sys/class/thermal/thermal_zone11/trip_point_0_temp
echo 105000 > /sys/class/thermal/thermal_zone12/trip_point_0_temp
echo 105000 > /sys/class/thermal/thermal_zone13/trip_point_0_temp
echo 105000 > /sys/class/thermal/thermal_zone14/trip_point_0_temp
echo 105000 > /sys/class/thermal/thermal_zone15/trip_point_0_temp
echo 105000 > /sys/class/thermal/thermal_zone16/trip_point_4_temp
echo 105000 > /sys/class/thermal/thermal_zone17/trip_point_0_temp
echo 105000 > /sys/class/thermal/thermal_zone18/trip_point_0_temp
```

:::info
PS：以上设置只在当前启动有效，<ins>重启后</ins>需要**重新**设置。
:::

#### 降温设备
在 RDK S600中一共有10个 cooling(降温)设备：

- cooling_device0: cpu cluster 0， 通过调整频率控制温度
- cooling_device1: cpu cluster 1， 通过调整频率控制温度
- cooling_device2: cpu cluster 2， 通过调整频率控制温度
- cooling_device3: cpu cluster 3， 通过调整频率控制温度
- cooling_device4: cpu cluster 4， 通过调整频率控制温度
- cooling_device5: emc2305 fan，通过调整风扇转速档位来控制温度，档位从0~10，0表示关闭，10表示风扇满转速。
- cooling_device6: emc2305 fan，通过调整风扇转速档位来控制温度，档位从0~10，0表示关闭，10表示风扇满转速。
- cooling_device7: bpu core 0， 通过调整频率控制温度
- cooling_device8: bpu core 1， 通过调整频率控制温度
- cooling_device9: bpu core 2， 通过调整频率控制温度
- cooling_device10: bpu core 3， 通过调整频率控制温度

目前默认的策略用的是`step_wise`。

##### 风扇调节
RDK S600开发板上的 emc2305风扇控制器，可以通过设备节点获取设备基本信息及控制转速：
1. 获取降温设备信息：
    ```shell
    root@ubuntu:~# cat /sys/class/thermal/cooling_device5/type
    emc2305_fan
    ```
2. 获取可配置的风扇档位：
    ```shell
    root@ubuntu:~# cat /sys/class/thermal/cooling_device5/max_state
    10
    ```
3. 获取当前风扇档位
   ```shell
   root@ubuntu:~# cat /sys/class/thermal/cooling_device5/cur_state
   5
   ```
4. 配置 thermal_zone2的策略为`userspace`：
    ```
    # thermal_zone2和thermal_zone16会通过控制风扇
    echo user_space > /sys/class/thermal/thermal_zone2/policy
    echo user_space > /sys/class/thermal/thermal_zone16/policy
    ```
5. 配置当前风扇档位为10：
   ```shell
   root@ubuntu:~# echo 10 > /sys/class/thermal/cooling_device5/cur_state
   ```

:::info
**注意**：当 thermal_zone2或 thermal_zone16的策略为`step_wise`时，用户配置的风扇档位会被系统自动根据当前温度进行调节。如果客户需要将风扇固定为特定档位，请参考[Thermal Zone](#thermal-zone简介-1)章节，将 thermal_zone2和 thermal_zone16的策略改为`user_space`
:::

### CPU 频率管理

在 linux 内核中，自带了 cpufreq 子系统用来控制 cpu 的频率和频率控制策略。

进入目录`/sys/devices/system/cpu/cpufreq/policy0`，`ls` 一下，会看到目录中有如下文件：

```shell
affected_cpus						// 当前控制影响的CPU核(没有显示处于offline状态的cpu)
cpuinfo_cur_freq					// 当前CPU频率(单位: KHz）
cpuinfo_max_freq					// 当前调频策略下CPU可用的最高频率(单位: KHz）
cpuinfo_min_freq					// 当前调频策略下CPU可用的最低频率(单位: KHz）
cpuinfo_transition_latency			// 处理器切换频率所需要的时间(单位:ns)
related_cpus						// 该控制策略影响到哪些CPU核(包括了online+offline的所有cpu)
scaling_available_frequencies		// CPU支持的主频率列表(单位: KHz）
scaling_available_governors			// 当前内核中支持的所有 governor(调频)类型
scaling_cur_freq					// 保存着 cpufreq 模块缓存的当前 CPU 频率，不会对 CPU 硬件寄存器进行检查。
scaling_driver						// 当前使用的调频驱动
scaling_governor					// governor(调频)策略
scaling_max_freq					// 当前调频策略下CPU可用的最高频率（从cpufreq模块缓存中读取）
scaling_min_freq					// 当前调频策略下CPU可用的最低频率（从cpufreq模块缓存中读取）
scaling_setspeed					// 需将governor切换为userspace才能使用，往这个文件echo数值，会切换频率
```

目前支持的频率包括
```shell
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_available_frequencies
525000 1050000 2100000
```

注：支持的频点可能在不同类型的芯片上有所差异。
RDK S600系统使用的 linux 内核支持以下种类的调频策略:

- 性能（performance）：总是将 CPU 置于最高能耗也是最高性能的状态，即硬件所支持的最高频。
- performance：以最高频率执行
- ondemand：按照负载调整频率
- userspace：根据用户的设置频率
- powersave：以最低频率执行
- schedutil：按照负载调整频率，它是与 CPU 调度器结合来使用
- conservative：类似 Ondemand，不过频率调节的会平滑一下，不会有忽然调整为最大值又忽然调整为最小值的现象

用户可以通过控制目录`/sys/devices/system/cpu/cpu0/cpufreq/`下的对应设置来控制 CPU 的调频策略。

例如让 CPU 运行在性能模式：

```shell
echo performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
```

或者控制 CPU 运行在一个固定的频率（1.05GHz）：

```shell
echo userspace > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo 1050000 > /sys/devices/system/cpu/cpufreq/policy0/scaling_setspeed
```

可通过`sudo hrut_somstatus`命令查看当前芯片工作频率、温度等状态

</DocScope>
