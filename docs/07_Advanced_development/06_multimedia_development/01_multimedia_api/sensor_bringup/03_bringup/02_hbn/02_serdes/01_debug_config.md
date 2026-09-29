---
sidebar_position: 1
title: "Serdes 配置设计说明"
description: "Sensor/Deserial/ 配置设计：extra_mode、config_index、调试配置"
---

# Sensor 配置调试说明

## 简述

GMSL camera sensor 驱动需要实现的内容和 MIPI 驱动类似，这里以 ar0820std 为例，解释差异部分。其中 std 是 HBN 后期重构的、长期维护的 sensor 驱动，建议参考 std 驱动增加新模组配置。

对于标准化 Sedes sensor 库，其第一个规范就是对 Sedes sensor 自定义配置字段 `extra_mode` 与 `config_index` 的使用规则，分别用于定义模组信息与功能配置。


### emode_data 配置

![emode_data 命名规则](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/serdes_config/extra_mode_naming.png)


以下为 ar0820std 的定义示例：

```c
static emode_data_t emode_data[MODE_TYPE_MAX] = {
    // ...
    [SENSING_M25F120D4G3_S0R0T7] = {
        .serial_addr = 0x40,       // serial i2c addr
        .sensor_addr = 0x10,       // sensor i2c addr
        .eeprom_addr = 0x50,       // eeprom i2c addr
        .serial_rclk_out = 0,      // 0: serial rclk disable, 1: serial_rclk enable
        .rclk_mfp = 0,             // if serial_rclk_out = 1, rclk output on rclk_mfp
    },
};
```

通常一个解串器会连接多个加串器和 sensor，这些加串器和 sensor 可能是相同的硬件，i2c 地址相同。为了区分各个加串器和 sensor，需要对其 i2c 地址进行重新映射。`emode_data` 中的 `*_addr` 是在 i2c 地址重新映射过程中提供器件的默认 i2c 地址，映射的新地址将由应用程序中 `*_addr` 自定义。

```c
void vp_update_camera_config(const camera_config_t *camera_config_in, camera_config_t *camera_config_out, int link_port){
	camera_config_out->addr = (uint8_t)(camera_config_in->addr + 1 + link_port);
	camera_config_out->serial_addr = (uint8_t)(camera_config_in->serial_addr + 1  + link_port);
	camera_config_out->eeprom_addr = (uint8_t)(camera_config_in->eeprom_addr + 1  + link_port);
}
```

上面是 app src/vp_sensors/vp_sensors.c 的代码
不同的sensor和加串 要重新map成不一样的地址,不然相同的地址解串器没法和他们通讯,所以根据link_port动态设定eeprom_addr serial_addr addr


在 serdes 模组中，sensor 需要的 mclk 可以由加串器来提供，也可以是外部晶振提供：

- 加串器来提供：将 `serial_rclk_out` 配置为 1，且 `rclk_mfp` 配置为对应的 mfp index 目前软件只支持配置 MFP4(通常美信加串也是提供MFP4作为mclk的输出)。
- 外部晶振提供：将 `serial_rclk_out` 和 `rclk_mfp` 都配置为 0 即可。

### emode（extra_mode）配置

```c
static const sensor_emode_type_t sensor_emode[MODE_TYPE_NUM] = {
    SENSOR_EMADD(SUNNY_M25F120D12G3_S1R8T2, "0.0.1", "lib_CA82GB_pwl12_WS_Fov120.so", "0.22.10.20", &emode_data[SUNNY_M25F120D12G3_S1R8T2]),
    SENSOR_EMADD(SENSING_M27F120D12G3_S0R0T7, "0.0.1", "lib_ar0820RGGB_pwl12_Sens_Fov30.so", "0.22.9.13", &emode_data[SENSING_M27F120D12G3_S0R0T7]),
    SENSOR_EMADD(SUNNY_M25F120D12G3_S0R8T7E0, "0.0.1", "lib_CA82GB_pwl12_WS_Fov120.so", "0.22.10.20", &emode_data[SUNNY_M25F120D12G3_S0R8T7E0]),
    SENSOR_EMADD(GALAXY_M25F120D12G2_S1R5T3E0, "0.0.1", "lib_CW_A82GB_A120_065_L_W20.so", "0.24.4.24", &emode_data[GALAXY_M25F120D12G2_S1R5T3E0]),
    SENSOR_EMADD(GALAXY_M25F30D12G2_S1R5T3E0, "0.0.1", "lib_CW_A82GB_A30_017_L_W20.so", "0.24.4.28", &emode_data[GALAXY_M25F30D12G2_S1R5T3E0]),
    // D4: YUV422, S0: MAX9295A, R0: sensor module isp reset MFP0, T7: sensor frame sync MFP7
    SENSOR_EMADD(SENSING_M25F120D4G3_S0R0T7, "0.0.1", "lib_ar0820RGGB_pwl12_Sens_Fov30.so", "0.22.9.13", &emode_data[SENSING_M25F120D4G3_S0R0T7]),
    SENSOR_EMEND(),
};
```

:::note
上述实现中，即表示 ar0820std 驱动库支持 5 种 ar0820 的模组，对于其 `extra_mode=0` 配置时（`SUNNY_M25F120D12G3_S1R8T2`）：

- 供应商为 SUNNY：MCLK=25M，Fov=120，Datetype=RAW12，TrigGPIO=GPIO3
- 加串为 MAX96717：ResetPIN=MFP8，TrigPIN=MFP2
- 驱动库的该模组实现版本信息：0.0.1
- 该模组适配的效果库：`lib_CA82GB_pwl12_WS_Fov120.so`，其最低版本要求：0.22.10.20
- 扩展信息为结构，位于：`&emode_data[SUNNY_M25F120D12G3_S1R8T2]`
:::


在 HBN 代码中，将利用类似 `SENSING_M25F120D4G3_S0R0T7` 的 emode 字段来解析出模组的基本信息。该字段需要根据模组实际情况填写，解析的基本规则如下：

第一个 `*` 前面是模组厂名称，可以自定义。第一个 `*` 后面将根据关键字符进行解析：

| 字段 | 含义                                                                                                                         | 示例        |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- |
| M    | 加串器给 sensor 输出 mclk 的频率（MHz），且 serial_rclk_out 及 rclk_mfp 使能且配置正确后加串器将输出对应 mclk                | M25 = 25MHz |
| F    | 模组 lens 的 FOV 大小，方便驱动中根据不同 lens 做逻辑判断                                                                    | F30         |
| S    | 区分加串器类型：S0 = MAX9295A, S1 = MAX96717, S2 = MAX96717F                                                                 | S0          |
| D    | 区分 sensor 输出 datatype：D4 = YUV422 (0x1e), D8 = RAW8 (0x2a), D10 = RAW10 (0x2b), D12 = RAW12 (0x2c)                      | D12         |
| N    | 配置加串器 mipi lane 数目，默认 4 lane                                                                                       | N4          |
| R    | 配置加串器 reset sensor 或模组内部 ISP 等器件。如 R0 代表加串器使用 MFP0 gpio 进行 reset                                     | R0          |
| T    | 配置加串器触发 sensor 同步曝光。如 T7 代表加串器使用 MFP7 去触发 sensor 进行同步曝光                                         | T7          |
| L    | 配置加串器 link 速率，可选 3Gbps 或 6Gbps，需根据实际硬件配置选择。如 L3 = 3Gbps。未配置则软件根据加串器型号自动配置最大速率 | L3          |
| I    | 表示 sensor 接口是否为 DVP 接口。I1 = DVP 接口，I0 或不配置 = MIPI 接口                                                      | I0          |

:::note
"0.0.1" 和 "0.22.9.13" 分别为 sensor 驱动版本号及 isp 效果库 so 的版本号，前期点亮阶段可以忽略。

"lib_ar0820RGGB_pwl12_Sens_Fov30.so" 为选择 emode 的默认 isp 效果库 so。用户程序中也可以通过 calib_lname 指定效果库名称，且优先级高于 emode 中的配置。
:::

### config_index 配置

HBN 框架通过 config_index 字段来配置一些功能，如写 emb data、配置 mirror/flip、设置 sensor 曝光等。

```c
static SENSOR_CONFIG_FUNC sensor_config_index_funcs[B_CONFIG_INDEX_MAX] = {
    [B_EMBEDDED_MODE] = sensor_config_index_embed_setting,
    [B_TEST_PATTERN] = sensor_config_index_test_pattern,
    [B_FLIP] = sensor_config_index_filp_setting,
    [B_MIRROR] = sensor_config_index_mirror_setting,
    [B_TRIG_STANDARD] = sensor_config_index_trig_mode,
    [B_TRIG_SHUTTER_SYNC] = sensor_config_index_trig_shutter_mode,
};
```

```c
typedef enum CONFIG_INDEX_B {
    B_AE_DISABLE,
    B_AWB_DISABLE,
    B_TEST_PATTERN,
    B_DPHY_PORTB,
    B_DPHY_COPY,
    B_EMBEDDED_MODE,
    B_EMBEDDED_DATA,
    B_TRIG_SOURCE,
    B_TRIG_STANDARD,
    B_TRIG_SHUTTER_SYNC,
    B_TRIG_EXTERNAL,
    B_DUAL_ROI,
    B_MIRROR,
    B_FLIP,
    B_PWL_24BIT,
    B_CONFIG_INDEX_MAX,
} camera_sensor_config_index_t;
```

在用户程序中，config_index 字段表示模组选择哪些功能，对应的赋值按照 `1 << CONFIG_INDEX_B` 值来配置。如选择 `B_TRIG_STANDARD`，则 config_index 赋值为 256。


`config_index` 配置在标准化后，将按 bit 来配置非常规用的可选的通用功能，其主要特征是：

- 功能适用于大部分的模组。
- 为可选功能，影响主要是增加相关的配置操作。

| BIT   | HEX    | NUM   | NAME              | MACRO             | 描述                                 | FUNCTION                                                                  |
| ----- | ------ | ----- | ----------------- | ----------------- | ------------------------------------ | ------------------------------------------------------------------------- |
| 0     | 0x1    | 1     | ae_disable        | AE_DISABLE        | 关闭用户空间的 AE 控制功能           | 0: enable AE control<br/>1: disable AE control                            |
| 1     | 0x2    | 2     | awb_disable       | AWB_DISABLE       | 关闭用户空间的 AWB 控制功能          | 0: enable AWB control<br/>1: disable AWB control                          |
| 2     | 0x4    | 4     | test_pattern      | TEST_PATTERN      | 使能 Sensor 的 testpattern 输出      | 0: disable test pattern<br/>1: enable test pattern                        |
| 3     | 0x8    | 8     | dphy_portb        | DPHY_PORTB        | 使能 DES 的 DPHY 拷贝到 PORTB        | 0: disable csi PORTB (default PORTA)<br/>1: enable csi PORTB (only PORTB) |
| 4     | 0x10   | 16    | dphy_copy         | DPHY_COPY         | 使能 DES 的 DPHY 拷贝使能            | 0: disable csi copy (only one csi)<br/>1: enable csi copy (PORTA+PORTB)   |
| 5     | 0x20   | 32    | embedded_mode     | EMBEDDED_MODE     | Sensor 的 embedded data 数据模式使能 | 0: embedded mode disable<br/>1: embedded mode enable (EEMB)               |
| 6     | 0x40   | 64    | embedded_data     | EMBEDDED_DATA     | Sensor 的 embedded data 使能         | 0: disable embedded data output<br/>1: enable embedded data output        |
| 7     | 0x80   | 128   | trig_source       | TRIG_SOURCE       | 同步源选择                           | 0: trigger source from SoC<br/>1: trigger source from MCU                 |
| 8     | 0x100  | 256   | trig_standard     | TRIG_STANDARD     | 标准同步模式使能                     | 0: disable standard sync<br/>1: enable standard sync                      |
| 9     | 0x200  | 512   | trig_shutter_sync | TRIG_SHUTTER_SYNC | shutter 同步模式使能                 | 0: disable shutter sync<br/>1: enable shutter sync                        |
| 10    | 0x400  | 1024  | trig_external     | TRIG_EXTERNAL     | 外部同步模式使能                     | 0: disable external sync<br/>1: enable external sync                      |
| 11    | 0x800  | 2048  | dual_roi          | DUAL_ROI          | 使能 ROI 功能双 VC 输出              | 0: disable sensor dual roi output<br/>1: enable sensor dual roi output    |
| 12    | 0x1000 | 4096  | mirror            | MIRROR            | Sensor 图像左右镜像使能              | 0: disable mirror<br/>1: enable mirror                                    |
| 13    | 0x2000 | 8192  | flip              | FLIP              | Sensor 图像上下颠倒使能              | 0: disable flip<br/>1: enable flip                                        |
| 14    | 0x4000 | 16384 | pwl_24bit         | PWL_24BIT         | Sensor 特殊位宽 24bit 使能           | 0: disable 24bit PWL<br/>1: enable 24bit PWL                              |
| 15    | 0x8000 | 32768 | pdaf              | PDAF              | PDAF 功能使能                        | 0: disable PDAF<br/>1: enable PDAF                                        |
| 16-31 | ...    |       |                   |                   |                                      |                                                                           |

:::note
上述配置在代码中定义：`inc/develop/camera_mod_sensor_data.h`、`inc/develop/camera_mod_sensor_cfbit.h`

关于 EMBEDDED_MODE / EMBEDDED_DATA 定义的说明，功能适配可按如下建议：

| EMBEDDED_MODE | EMBEDDED_DATA | 说明                                  |
| ------------- | ------------- | ------------------------------------- |
| 0             | 0             | 正常出图无 EMB 模式                   |
| 1             | 0             | EEMB 默认模式                         |
| 1             | 1             | EEMB 扩展模式（如果有，可自定义增加） |
| 0             | 1             | IEMB 模式                             |
:::


:::note
- 模组硬件通常与 `extra_mode` 一一对应。
- 同类模组但硬件连接不同（如 PIN 不同）→ 视为不同硬件，新增 extra_mode。
- 同一模组但 Datatype 配置不同 → 视为不同硬件，新增 extra_mode。
- 同一模组但配置需求/运行代码路径不同：
  - 用 `config_index` 区分配置。
:::

## 用户程序

该部分可以参考 MIPI camera 配置，侧重于 deserial 的一些配置说明。

### deserial 配置

| 字段                                                   | 描述                                                                                                                                                                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name[CAMERA_MODULE_NAME_LEN]                           | deserial 名称，如 max96712                                                                                                                                                                                                |
| addr                                                   | deserial 设备地址                                                                                                                                                                                                         |
| gpio_mfp[CAMERA_DES_GPIO_MAX]                          | MFP 的 GPIO 功能选择。常见值：CAMERA_DES_GPIO_TRIG0=0, TRIG1=1, TRIG2=2, TRIG3=3。如 .gpio_mfp[CAMERA_DES_GPIO_TRIG0] = 5 表示 SoC 输出的 LPWM 触发信号连接到了解串器 MFP5 管脚上                                         |
| link_desp[CAMERA_DES_LINKMAX][CAMERA_DES_PORTDESP_LEN] | 各 Link 连接模组的配置描述，多进程需要使用，单进程可选。格式为 name:extra_mode@config_index。如 strcpy(g_deserial_config[0].link_desp[0], "ar0820std:5@256") 代表 port0 选择 ar0820 模组，emode 为 5，config_index 为 256 |
| poc_cfg_t                                              | 参见 poc 配置                                                                                                                                                                                                             |
| mipi_config_t                                          | 参见 MIPI camera 对应的配置，注意 extra_mode 和 config_index 配置                                                                                                                                                         |
| end_flag                                               | 固定为 DESERIAL_CONFIG_END_FLAG                                                                                                                                                                                           |


#### Soc lpwm 配置 解释

### lpwm_attr_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `lpwm_chn_attr` | `lpwm_chn_attr_t[LPWM_CHN_NUM]` | 逐通道配置 | — | — | — |

这里表示使用哪个 lpwm chn,板端 LPWM 的输出通道,根据原理图确认链接到对应的 解串器的 MFP 管脚，下面 gpio_mfp 用于配置 库板端 LPWM 触发信号物理接到 MAX96712 的哪根 MFP 引脚上
lpwm_chn_attr_t 是 每个lpwm chn 的配置参数


### lpwm_chn_attr_t
| 字段 | 类型 | 描述 | 典型值 | 默认值 | 范围 |
| --- | --- | --- | --- | --- | --- |
| `enable` | `uint32_t` | 该通道使能 | 0 | 0 | `0` / `1` |
| `trigger_source` | `uint32_t` | 触发源选择 | 0 | 0 | `0` / `1` |
| `trigger_mode` | `uint32_t` | 触发模式 | 0 | 0 | `0` / `1` |
| `period` | `uint32_t` | 周期 | — | — | — |
| `offset` | `uint32_t` | 相位偏移 | — | — | — |
| `duty_time` | `uint32_t` | 脉冲宽度 | — | — | — |
| `threshold` | `uint32_t` | 缓慢同步的相位误差门限（微秒），取值 0~65535。`0` 表示关闭缓慢同步；非 0 时按 `adjust_step` 逐步把触发相位拉向同步源，**并要求 `offset` 小于 `period`** | 0 | 0 | `0`~`65535`，单位 µs；`0` 关闭缓慢同步 |
| `adjust_step` | `uint32_t` | 缓慢同步每次调整的步进量，取值 0~15。仅在 `threshold` 非 0 时起作用 | 0 | 0 | `0`~`15` |


#### **gpio_mfp 配置解释**

gpio_mfp 常用于 sensor 多路相机同步曝光

告诉 deserial 库板端 LPWM 触发信号物理接到 MAX96712 的哪根 MFP 引脚上，以便把 SOC 输出的曝光触发波形经 SerDes 反向通道透传到 sensor 侧的 FSYNC，实现多路相机同步曝光

#### **link_desp 配置解释**

link_desp 用于描述多路的连接关系,为字符串数组，用户程序需要描述每个link的对应的 extra_mode 和config_index去跑对应的模组配置
以下是几个常见的情况，link 和VC的映射关系

**连接场景一**：四路 serial camera 连接到 max96712的PortA、PortB、PortC、PortD

| Port 口 | 模组        | extra_mode | config_index |
| ------- | ----------- | ---------- | ------------ |
| PortA   | ar0820std   | 5          | 512          |
| PortB   | ovx3cstd    | 4          | 16896        |
| PortC   | ar0820std   | 5          | 512          |
| PortD   | sc1336_gmsl | 0          | 256          |


link_desp的配置：

```c
static deserial_config_t deserial_config = {
    .name = "max96712",
    .link_desp[0] = "ar0820std:5@512",
    .link_desp[1] = "ovx3cstd:4@16896",
    .link_desp[2] = "ar0820std:5@512",
    .link_desp[3] = "sc1336_gmsl:0@256",
    ...
};
```

VC的分配情况:

| Port口 | 模组        | VC |
| ------ | ----------- | -- |
| PortA  | ar0820std   | 0  |
| PortB  | ovx3cstd    | 1  |
| PortC  | ar0820std   | 2  |
| PortD  | sc1336_gmsl | 3  |


**连接场景二**：两路 serial camera 连接到 max96712的PortB和PortD

| Port口 | 模组        | extra_mode | config_index |
| ------ | ----------- | ---------- | ------------ |
| PortB  | ovx3cstd    | 4          | 16896        |
| PortD  | sc1336_gmsl | 0          | 256          |


link_desp的配置:

```c
static deserial_config_t deserial_config = {
    .name = "max96712",
    .link_desp[1] = "ovx3cstd:4@16896",
    .link_desp[3] = "sc1336_gmsl:0@256",
    ...
};
```

VC的分配情况:

| Port口 | 模组        | VC |
| ------ | ----------- | -- |
| PortB  | ovx3cstd    | 0  |
| PortD  | sc1336_gmsl | 1  |


**连接场景三**：两路 serial camera 连接到 max96712的PortA和PortC


| Port口 | 模组      | extra_mode | config_index |
| ------ | --------- | ---------- | ------------ |
| PortA  | ar0820std | 5          | 512          |
| PortC  | ar0820std | 5          | 512          |

```c
static deserial_config_t deserial_config = {
    .name = "max96712",
    .link_desp[0] = "ar0820std:5@512",
    .link_desp[2] = "ar0820std:5@512",
    ...
};
```

VC的分配情况:

| Port口 | 模组      | VC |
| ------ | --------- | -- |
| PortA  | ar0820std | 0  |
| PortC  | ar0820std | 1  |

### poc 配置

| 字段                         | 描述                                                             |
| ---------------------------- | ---------------------------------------------------------------- |
| name[CAMERA_MODULE_NAME_LEN] | poc 名称，如 max20087                                            |
| addr                         | poc 设备 i2c 地址                                                |
| poc_map                      | poc 与 link 的 map 关系，需根据硬件原理图配置，RDK 硬件为 0x1320 |
| end_flag                     | 固定为 POC_CONFIG_END_FLAG                                       |

板端运行程序、ISP 图像预览等部分请参考 [MIPI camera 点亮](../00_overview.md) 说明。

**link 和 POC 通道在硬件上各是什么？**

- link：MAX96712 的物理 port（A/B/C/D），也link（0/1/2/3） 也叫 对应板上的 4 个 GMSL 同轴连接器 J0~J3，同轴电缆传输高速串行数据到远端 加串和sensor，link port数据的传输需要需要POC进行供电。
- POC 通道：MAX20087 的 4 个 power output（OUT1~OUT4），每条给一根同轴馈电，对应 CONFIG 寄存器 bit0~bit3（EN1~EN4）。
  - poc_map 就是用来告诉软件 96712 的 link N 这根线，它的电是从 20087 的哪条 OUT 来的

### poc_map 是什么？如何配置？

poc_map 本身不是 MAX20087 的寄存器，是相机驱动侧定义的一个 16 位编码，规则只有两条：

1. 16 位分成 4 段，每段 4 bit，从低位到高位依次对应 link0、link1、link2、link3。
2. 每段填的值 = 该 link 接的那条 MAX20087 输出通道在 CONFIG 寄存器（0x01）里的 EN bit 位置——OUT1 填 0、OUT2 填 1、OUT3 填 2、OUT4 填
  3。也就是 OUT 号 − 1。


![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/serdes_config/poc_register0.png)
![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/serdes_config/poc_register1.png)

由 MAX20087 的寄存器手册 POC 使能寄存器 0x01 可知：

| 寄存器 Bit | 字段名 | 对应输出通道 | 说明                          |
| ---------- | ------ | ------------ | ----------------------------- |
| BIT 0      | EN1    | OUT1         | 1 = 使能 OUT1（EN 引脚为高时） |
| BIT 1      | EN2    | OUT2         | 1 = 使能 OUT2（EN 引脚为高时） |
| BIT 2      | EN3    | OUT3         | 1 = 使能 OUT3（EN 引脚为高时） |
| BIT 3      | EN4    | OUT4         | 1 = 使能 OUT4（EN 引脚为高时） |


![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/serdes_config/poc.png)

由原理图可知 当前 POC 使能寄存器0x01的 bit 位和 96712 link 的映设关系


| link (96712 port)  | link D = link3 | link C = link2 | link B = link1 | link A = link0 |
| ------------------ | -------------- | -------------- | -------------- | -------------- |
| 接到的 POC 输出     | OUT2           | OUT4           | OUT3           | OUT1           |
| EN bit 位          | 1              | 3              | 2              | 0              |
 
 将最后一行扩展成一个 16bit 即是 当前硬件的 poc_map 

`poc_map = (1 << 12) | (3 << 8) | (2 << 4) | (0 << 0) = 0x1320`

:::note
1. 解码侧也是同一套：port = (poc_map >> (link × 4)) & 0xf，软件拿到 port 后去置 CONFIG 的对应 EN bit。
2. poc_map 如果 app配置优先使用 app 的poc_map的值，poc_map 为 0 才回退去读 dts 的 vcon poc_map
:::
