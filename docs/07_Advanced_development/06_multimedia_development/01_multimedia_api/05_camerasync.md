---
sidebar_position: 12
title: "多路 Camera 及与 Lidar 同步"
description: "多路 Camera 及与 Lidar 同步"
---

# 多路 Camera 及与 Lidar 同步

> **层级说明**：本篇是【底层多媒体 API】（板端 `Camera 同步框架`），多路 Camera 时间戳同步机制说明。面向需要直接操作多媒体 pipeline 的进阶开发（模式 3）；若只需跑通采集/编解码/显示的封装功能，见第 4 章 [简易 API](/Simple_API/multimedia_api/cdev/vio_api)（模式 1）。

## 简述

在多路 Camera 接入使用场景中，为满足算法或应用需求，一般有多路 Camera 同步需要，同时还有与 Lidar 同步的要求，可通过 ETH PPS 等方式进行同步。

S100上 LPWM 模块主要是给 Camera trigger 使用，能提供具有延时输出能力的 PWM 波形，用于校准 sensor 的曝光同步，同时其有多个外部 trigger 源可选，可支持与 MCU 或 GPS 设备时间同步。

本文档主要基于该 LPWM 模块的基本功能，描述其原理与使用方法，提供多路 Camera 与 Lidar 典型场景的同步方案，便于实际项目中参考使用。

:::info 注意

  本文档只基于一种 Camera 与 Lidar 的硬件连接方案，提供推荐方案作为参考，若使用其他硬件可参考本文档中的配置使用方式自行适配。
:::

## 硬件通路

### LPWM 模块

S100总共有3个 LPWM chip，每个 LPWM chip 下面有4个 LPWM 通道，请根据实际的硬件连接使用配置。

S100的 Camera 同步功能的主体实现依赖 LPWM 模块，其支持 S100多种 trigger 信号源，并产生多通道的可配置 PWM 信号，输出给外部 Camera 使用(可经 SerDes 转发)，从而实现 trigger 源与 Camera 的同步及所有多 Camera 之间的同步。

使用 LPWM 时主要需注意的是：

- 实际硬件连接配置使用的通道。

- LPWM 的同步触发源选择: 支持 MCU RTC/PPS0/PPS1/ETH PPS0/ETH PPS1/MCU ETH PPS 等。

- LPWM 基于同步触发源的 offset 偏移配置: 需求根据帧率要求、PPS 周期、相位要求等适配。

- LPWM 目标信号波形: period，duty\_time 等参数。

- LPWM 的扩展功能: 缓慢同步 threshold，adjust\_step 配置。

关于 LPWM 模块的功能及使用，更多可参考: [LPWM使用](#lpwm)

### LPWM 同步源

LPWM 工作原理：LPWM 受 PPS 触发源 trigger，其作为 Trigger Bus 的 Target 侧设备，每个 LPWM 设备可独立配置选择 trigger 源。

收到 PPS 信号传输给 cam-trig 的过程如下图所示，PPS trigger 会连接到 LPWM 模块，触发 LPWM 输出，LPWM 的输出连接到 camera：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_01.png" alt="PPS信号传输至cam-trig流程示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

关于同步源 PPS 的功能说明，更多可参考: [PPS说明](../../03_system_software/11_driver_timesync.md#PPS)

:::info 注意

关于 LPWM 的 trigger 源使用，有注意如下：

- 多种外部 trigger 源为多选1，一个 LPWM 模块只能选其中一种使用。

- 不同的 LPWM 间通过外部 trigger 源来同步，选用同一源后可同步。

- 同一 LPWM 模块的不同 channel 使用同一 trigger 源，可配不同的 offset/period/duty 参数。
:::

### 多路 Camera 同步连接

对于单 S100的 Camera 接入场景，其一般连接方式如下：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_02.png" alt="多路Camera同步连接示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

其中：

- S100的 trigger 源可来自外部 GPS 设备，或网络 ETH PPS。

- MCU 与 S100之间也可同步。

- 同 S100内的不同 LPWM 之间可选同一同步源实现。

- 不同的 DES 可以连接不同的 LPWM 通道。

- SerDes 可通过 Link 线缆上的反向通道将 LPWM 信号透传到 Sensor 侧，连接为 FSYNC，做同步触发。

### 与 Lidar 连接配合

在有 Lidar 使用的场景中，有连接方案有如下:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_03.png" alt="Lidar连接方案示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

其中:

- S100的 trigger 源可来自外部 GPS 设备，或通过网络授时等方式

- Lidar 设备可以通过相应的授时(如 gPTP)方式，实现与 S100同源时钟对齐

- Camera 同步是由通过 S100的 LPWM 输出触发给 DES，再分发给各 Camera 实现同步曝光/出图

- Camera 数据输入到 S100内 CIM 模块时，会在 Frame Start 时刻打上时间戳记录该帧时间。

## 软件方案

### Camera 与 Lidar 时间对齐需求

对于 Camera 与 Lidar 同时使用且有同步对齐的场景，其一般的功能需求有如下:

- Lidar 与 S100间有时间同步，在同源时间轴上工作;

- Lidar 可基于同步时间按需求启动周期性扫描，此处以10Hz(100ms 周期)为例，可在整百 ms 处开始扫描。

- Camera 通过 LPWM 基于同步时间 PPS 作为触发源，触发每帧图像的曝光/读出，实现与 Lidar 扫描时间的对齐，此处以30fs 为例。

- Camera 图像数据的时间戳需与 Lidar 数据的时间戳在同一时间轴，并有一定的对齐关系，以便融合使用。

其期望的时间对齐目标有如下:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_04.png" alt="Camera与Lidar时间对齐目标示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

在 PPS 整秒开始: LPWM 输出并曝光(若 offset 设为0)、Lidar 开始扫描(若 start 为0)。

此处软件方案适配上述连接图中实线连接的硬件方案：

- S100与 Lidar 设备都连接网络交换机，通过网络实现时间同步。

- Lidar 扫描频率为10Hz，在整百 ms 时刻开始扫描，数据带对齐时间戳。

- 多个 Camera 通过 SerDes 连接 S100,同时接有 LPWM，用于 Camera 的曝光同步的触发。

- LPWM 的触发源使用 Acore 的 ETH PPS0。

### LPWM 触发源选择

LPWM 模块有多种触发源可选，对于上述硬件连接方式，仍可有多种源可以选择，可参考: [LPWM 推荐使用配置]

本方案中使用 Acore ETH PPS0作为 LPWM 的触发源：

- 其与 Lidar 都使用网络同步，可使用 PHC 时间作为统一时间轴。

- Acore ETH PPS 误差最小，建议优先使用。

对于使用 Acore ETH PPS0同步源，使用 fixed mode 时，其上升沿基于 PPS 整秒时间有一固定偏移536.871ms，需要在使用时按需求进行 offset 计算与配置，更多可参考: [Acore ETH PPS说明](../../03_system_software/11_driver_timesync.md#Acore\_Eth\_PPS)

### Camera 同步模式选择

Sensor 曝光输出一般有 Master 模式(主动曝光输出，按配置，只要开流自动出帧)与 Slave 模式(等待触发曝光输出、需 trigger 后才输出)，对于一般运行默认使用 Master 模式运行，而要同步输出则使用 Slave 模式。

以下为 AR0820模组的 Slave 模式说明：以下以 AR0820为例说明。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_05.png" alt="AR0820模组Slave模式时序示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

同样的 slave 模式，还有多种同步方式，其中常用的为 shutter sync: 该模式在 trigger 后固定时间出图(可保证 FS 时间戳对齐)，且下不会丢失 trigger 信号(即在出图过程中来了 trigger 信号，不会被忽略)。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_06.png" alt="shutter sync同步模式时序示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

配置有如下:

```
// 参见: source/hobot-camera/drivers/sensor/ar0820/inc/ar0820_setting.h
uint16_t ar0820_trigger_standard_setting[] = {
    //0x301A, 0x0058, // RESET_REGISTER_RESET,RESET_REGISTER_STDBY_EOF
    0x301A, 0x0958, // RESET_REGISTER_GPI_EN, FORCED_PLL_ON
    0x31C6, 0x2000, // MASK_FRAMER_STANDBY
    0x30B0, 0x8100, // PIXCLK_ON
    0x30CE, 0x0000, // TRIGGER STANDARD MODE
    0x30CE, 0x0000, // TRIGGER STANDARD MODE
};
uint16_t ar0820_trigger_shutter_sync_setting[] = {
    //0x301A, 0x0058, // RESET_REGISTER_RESET,RESET_REGISTER_STDBY_EOF
    0x301A, 0x095C, // RESET_REGISTER_GPI_EN, FORCED_PLL_ON, STREAM
    0x31C6, 0x2000, // MASK_FRAMER_STANDBY
    0x30B0, 0x8100, // PIXCLK_ON
    0x30CE, 0x0120, // TRIGGER SHUTTER SYNC MODE
    0x30CE, 0x0120, // TRIGGER SHUTTER SYNC MODE
};
uint16_t ar0820_trigger_gpio_setting[][8] = {
    {
        0x340A, 0x00EE, // GPIO0_INPUT_ENABLE
        0x340A, 0x00EE, // GPIO0_INPUT_ENABLE
        0x340C, 0x0002, // GPIO_ISEL
        0x340E, 0x2100, // GPIO_OSEL
    },
    {
        0x340A, 0x00DD, // GPIO1_INPUT_ENABLE
        0x340A, 0x00DD, // GPIO1_INPUT_ENABLE
        0x340C, 0x0008, // GPIO_ISEL
        0x340E, 0x2100, // GPIO_OSEL
    },
    {
        0x340A, 0x00BB, // GPIO2_INPUT_ENABLE
        0x340A, 0x00BB, // GPIO2_INPUT_ENABLE
        0x340C, 0x0020, // GPIO_ISEL
        0x340E, 0x2010, // GPIO_OSEL
    },
    {
        0x340A, 0x0077, // GPIO3_INPUT_ENABLE
        0x340A, 0x0077, // GPIO3_INPUT_ENABLE
        0x340C, 0x0080, // GPIO_ISEL
        0x340E, 0x0210, // GPIO_OSEL
    },
};
```

在实际使用时，根据 config\_index 的使能同步功能(需要 sensor 库有相应的实现)。

:::info 注意

此上仅为 AR0820的示例，其它 Camera 类似，此处 Camera 同步功能主要需配置:

Slave 模式：根据实际需要配置模组的 SYNC 模式。

FSYNC 选择: 根据模组实际硬件连接，选用正常的 GPIO 作为 FSYNC 使用。有的模组包含 ISP，只需要配置好 FSYNC 即可，不需要配置 Sensor 为 Slave 模式。
:::

对于 Camera 的 FSYNC 信号输出，不同的模组可能有不同的特性，如：

- FSYNC 信号只用于对齐曝光输出，并不能控制帧率，因此 LPWM 的周期需与实际帧率匹配设置。

- 可能是纯 Slave 模式，没有 FSYNC 信号就不出帧，也可能只是用于对齐，就算无 FSYNC 也会出帧。

- 需注意同步模式的选择，是同步曝光，还是同步出图？

- 若为同步曝光，则是曝光时刻同步，曝光完成后直接读图输出，出图时间受曝光时间影响，可能时间戳不完全一致。

- 若为出图同步，即曝光后在指定的同一时刻读图输出，可保证时间戳一致，本方案中使用出图同步方式。

- 不同的模组其曝光时间可能不同，因此在同步完成后输出的时间戳可能不一致。

## 推荐方案

### Camera 与 Lidar 同步对齐方案

基于上述硬件连接与软件方案，有同步方案如下：

- 使用 Acore ETH PPS0触发。

- Lidar 在整百 ms 时刻开始扫描，数据带对齐时间戳。

- Camera(以 AR0820为例)使用 SHUTTER SYNC 出图同步，自动曝光。

- 通过 LPWM 的 offset 调整相位整百 ms，如30fps 适配 offset=463.129ms 对33.333ms 取余数=29.8ms。

- Camera 在经 offset 正确配置后，可在整百 ms(每3帧)同步输出，与 Lidar 数据对齐。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_07.png" alt="Camera与Lidar同步对齐方案示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Camera 配置

对于以下为单路 AR0820的同步配置:

```
{
             "deserial_0": {
             "deserial_name": "max96712",
             "deserial_addr": "0x29",
             "deserial_gpio": {
                     "camerr_pin": [4, 6, 8, 10],
                     "trig_pin": [5]
             },
             "poc": {
                     "poc_addr": "0x28",
                     "poc_map": "0x1320"
             }
     },
             "port_0": {
             "sensor_name": "ar0820std",
             "serial_addr": "0x41",
             "sensor_addr": "0x11",
             "eeprom_addr": "0x51",
             "sensor_mode": 5,
             "fps": 30,
             "width": 3840,
             "height": 2160,
             "extra_mode": 5,
             "config_index": 512,
             "deserial_index": 0,
             "deserial_port": 0
     }
}
```

此处同步的使能，主要通过 config\_index 的 bit9(+512)完成：

```
{
    "config_0":{
        "port_0":{
            "config_index":512,
        },
    }
}
```

Deserial 下的 trig\_pin 是对硬件连接上 LPWM 连接的 MFP 索引的配置，需 deserial 库中进行相应的支持，同时在 json 中配置使用:

```
"deserial_gpio": {
        "trig_pin": [5]
},
```

- 若一路 LPWM 同时触发多路 Camera，则只需配置一个索引值，如 MFP5：[5]。

- 若多路 LPWM 分别触发不同路 Camera，则需配置多个索引值对应多个 Link，如 MFP5-A,MFP14-B：[5,14]。

### trigger 配置

LPWM 的配置由 json 完成，配置示例如下，更多可参考: [LPWM JSON 配置]

```
{
    "lpwm_chn0": {
        "trigger_source": 8,
        "trigger_mode": 1,
        "period": 33333,
        "offset": 29800,
        "duty_time": 100,
        "threshold": 0,
        "adjust_step": 0
    },
    "lpwm_chn1": {
        "trigger_source": 8,
        "trigger_mode": 1,
        "period": 33333,
        "offset": 29800,
        "duty_time": 100,
        "threshold": 0,
        "adjust_step": 0
    },
    "lpwm_chn2": {
        "trigger_source": 8,
        "trigger_mode": 1,
        "period": 33333,
        "offset": 29800,
        "duty_time": 100,
        "threshold": 0,
        "adjust_step": 0
    },
    "lpwm_chn3": {
        "trigger_source": 8,
        "trigger_mode": 1,
        "period": 33333,
        "offset": 29800,
        "duty_time": 100,
        "threshold": 0,
        "adjust_step": 0
    }
}
```

若使用 trigger\_mode 为1，trigger\_source 为8，则使用的是 ETH PPS0进行同步。

## 快速示例

Camera 同步无独立函数 API，通过传感器配置文件 + LPWM 配置下发实现。最小配置流程如下（以 AR0820 + ETH PPS0 触发、30fps 为例）：

1. **配置 Camera 为 Slave/Shutter Sync 模式**：传感器配置中 `config_index` 加 512（bit9）使能同步；`deserial_gpio.trig_pin` 配置 LPWM 所接 MFP 索引。
2. **配置 LPWM 输出**：按 `trigger_source=8`（ETH PPS0）、`trigger_mode=1`（外部触发）、`period=33333us`（1s/30fps）、`offset` 按计算式 `1000000 - period * fps + 1` 配置。
3. **加载配置并出流**：配置文件随 sensor 库加载，LPWM 按 PPS 触发输出方波，多路 Camera 同步曝光/出图。

```json
{
    "port_0": {
        "sensor_name": "ar0820std",
        "config_index": 512,
        "fps": 30,
        "deserial_port": 0
    },
    "deserial_0": {
        "deserial_gpio": { "trig_pin": [5] }
    },
    "lpwm_chn0": {
        "trigger_source": 8, "trigger_mode": 1,
        "period": 33333, "offset": 29800, "duty_time": 100,
        "threshold": 0, "adjust_step": 0
    }
}
```

> 板端样例：`get_vin_data` 对 SerDes sensor 通过 `vp_deserial_config_update` 将 `lpwm_chn_attr_t`（`hbn_vin_cfg.h`）同步到 camera 配置；LPWM 各字段含义见本篇「LPWM 配置项说明」。

## 总结

S100上多 Camera 同步主要通过 LPWM 模块的硬件连接与软件配置共同实现。

在硬件设计时即需考虑不同帧率的场景需求，不同 Camera 模组的同步要求，及外部 trigger 信号的选择。

在模组点亮配置时，也需进行 SerDes 上的 LPWM 同步透传，同时 Sensor 配置为 Slave 模式，选择相应的 GPIO 作为 FSYNC 信号，实现同步触发输出。

在与 Lidar 设备同步场景，使用 ETH PPS0同步源，使用 fixed mode，需要正确计算并配置 LPWM 的 offset，以达到完全相位对齐的要求。

## LPWM
### LPWM 简述

LPWM 为类似 PWM 的信号源，一般用于 camsys 系统中触发 sensor 曝光。LPWM 本身也需要外界触发，在收到 trigger 信号后，按照所配置的 period, high-time, offset 等参数输出 1Hz ~ 500KHz，有效高电平 0us ~ 4095us，默认精度为 1us 的方波。

S100 总共有 3 个 LPWM chip，每个 LPWM chip 下面有 4 个 LPWM 通道，请根据实际的硬件连接使用配置。

S100 的 camera 硬件同步功能的主体实现依赖 LPWM 模块，其支持 S100 多种 trigger 信号源，并产生多通道的可配置 PWM 信号，输出给外部 camera 使用(可经 SerDes 转发)，从而实现 trigger 源与 camera 的同步及所有多 camera 之间的同步。

### LPWM 配置项说明

1. trigger_mode [0, 1]：LPWM 触发方式，0 为内部软件触发，1 为外部触发。

2. trigger_source [0, 10]：LPWM 触发源，使用外部触发源需将 trigger_mode 设置为1。一般场景下使用 0，触发周期默认为1s。

| trigger_source 的值 | 对应的触发源 |
|-------------------|-------------|
| 0                 |  aon_rtc_pps |
| 1                 |  reserve |
| 2                 |  pps0 |
| 3                 |  pps1 |
| 4                 |  pps2 |
| 5                 |  reserve |
| 6                 |  pcie0_ptm_pps |
| 7                 |  pcie1_ptm_pps |
| 8                 |  acore_eth0_pps |
| 9                 |  acore_eth1_pps |
| 10                |  mcu_eth_pps |

3. period [2, 1000000)us：LPWM 输出的方波周期。
4. offset [0, 1000000)us：LPWM 在每个 trigger 周期内第一个波形的偏移时间，需要小于 period 值。
5. duty_time [0, 4096)us：LPWM 输出波形的有效高电平时间，需要小于 period 值。
6. threshold [0, 65535]us：缓慢同步功能阈值，高阶功能，一般可忽略。
7. adjust_step [0, 15]：每次的调整时间 adjust_time = 2^adjust_step，高阶功能，一般可忽略。

### LPWM 配置计算说明

LPWM 的 trigger 源为 PPS，常用周期为 1s，在收到 trigger 信号后，首先进行一个 offset 的时间偏移，接着会输出连续方波，方波的周期以及有效电平的时间由配置所得，当下一个 trigger 信号到来，会重复偏移以及出波。

offset 设置依赖于 sensor fps，如果 fps 不能被 1s 整除，则需要设置 offset，反之 offset 设置为 0。

常见场景如接入30fps sensor，period 应设置为 1s/fps = 33333us。sensor 在跑完 30 帧经过 999,990us，与下次 PPS trigger 会有 10us 的间隙，因此 offset 应设为 10us（至少10us，至多（period - duty_time us，为了稳妥，建议在计算出的 offset 基础上再加 1），否则 lpwm 会在1s 内发出 31 个方波）。

由于硬件或者外设差异，PPS 落在了高电平区域，若关闭缓慢同步功能或者缓慢同步成功后需要走完高电平区域才能进入下一个 trigger 周期，即重新计算 offset，此时可能存在 trigger 周期内 LPWM 波形未达到预期数量，导致曝光同步下 sensor 帧率不符合预期，可将 offset 适当增加保证 PPS 每次一定落在低电平区域，输出预期的波形。

```
Period = 1000000 / fps
Offset = 1000000 - Period * fps + 1
```
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/lpwm_01.png" alt="LPWM示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

推荐使用配置
| 使用场景 | trigger_source | trigger_mode | duty_time | offset | period |
|---------|----------------|--------------|-----------|--------|---------|
| 全30fps |  8(eth0)/9(eth1) | 1          |  100      |   11   |   33333 |
| 全25fps |  8(eth0)/9(eth1) | 1          |  100      |   11   |   40000 |
| 12.5/25fps |  8(eth0)/9(eth1) | 1          |  100      |   11   |   80000/40000 |
| 30/10fps |  8(eth0)/9(eth1) | 1          |  100      |   11   |   33333/100000 |

### 其他说明
当使能 MCU 的 RTC 功能时，CIM 硬件会自动锁存 LPWM trigger 信号对应的时间戳，软件会将该时间与 global_time 同步后提供给用户。当 sensor 工作在曝光同步模式下，此时间戳代表 sensor 触发曝光开始的时间。

当 sensor 工作在同步出图或者未同步的状态下，此时 sensor 曝光起始时间与 LPWM 信号无关，即 CIM 的 frame start(tv) 与 LPWM trigger(trig_tv) 时间之间无关联，此时该值无参考价值，无需关注。

实际使用需要确保 PPS 稳定落在低电平区域，因此可以根据实际调试情况适当调大 offset。

## 相关文档

- [图像信号处理 - ISP](/Advanced_development/multimedia_development/multimedia_api/isp_tune_api)
- [时间同步方案](/Advanced_development/system_software/driver_timesync)
- [摄像头使用](/Demos/peripheral/camera/mipi_camera)
