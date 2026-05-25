---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';

# 7.5.13.2 Port Development Guide
## Basic Overview
The Port is generally divided into two parts: the external interface and the "Low Level Driver (LLD)". This section only covers the development of the user interface part.

## Port_Func Module
The D-Robotics MCU system provides the Port_Func module for overall function configuration.

The external interface of the Port_Func module is defined in the McalCdd path:
``` bash
# Driver source code:
McalCdd/Port/inc/Port_Func.h
McalCdd/Port/src/Port_Func.c
```
The specific PinCtrl configuration for the peripherals provided by the MCU is defined in the Config directory.
<DocScope products="RDK S100">
```bash
# PIN definition source code:
Config/McalCdd/gen_s100_sip_B_mcu1/Port/inc/Port_FuncCfg.h
Config/McalCdd/gen_s100_sip_B_mcu1/Port/src/Port_FuncCfg.c
```
</DocScope>
<DocScope products="RDK S600">

```bash
# PIN definition source code:
Config/McalCdd/gen_s600_md_mcu1/Port/inc/Port_FuncCfg.h
Config/McalCdd/gen_s600_md_mcu1/Port/src/Port_FuncCfg.c
```
</DocScope>
### PinCtrl Configuration Instructions
In the configuration header file, macros are provided to facilitate the definition of PIN properties:
<DocScope products="RDK S100">
`Config/McalCdd/gen_s100_sip_B_mcu1/Port/inc/Port_FuncCfg.h`
</DocScope>
<DocScope products="RDK S600">
`Config/McalCdd/gen_s600_md_mcu1/Port/inc/Port_FuncCfg.h`
</DocScope>

```C
#define PORT_FUNC_MCU_PIN(Pin_Idx, Pin_Name, Pin_Func, Schmitt, Input_En, SlewRate, Pull_Type, Drive_Strength) { \
	(uint8)(Pin_Idx), /**< Pin Id */ \
	(Pin_Name), /**< Pin name */ \
	(boolean)(TRUE), /**< IsUsed */ \
	{ \
		(boolean)(TRUE), /**< ModeChang */ \
		(boolean)(Schmitt), /**< Schmitt Trigger */ \
		(boolean)(Input_En), /**< Input Enable*/ \
		(boolean)(FALSE), /**< Is Used GPIO */ \
		(boolean)(FALSE), /**< Direction change allowed */ \
		(Pin_Func), /**< Pin Function */ \
		(SlewRate), /**< Slew Rate */ \
		(Pull_Type), /**< Pin Pull Type */ \
		(Drive_Strength), /**< Pin Drive Strength */ \
		(PORT_PIN_DIR_IN), /**< GPIO Direction */ \
		(PORT_PIN_LEVEL_LOW) /**< GPIO Output Value */ \
	} \
}

...


#define PORT_FUNC_AON_PIN(Pin_Idx, Pin_Name, Pin_Func, Schmitt, Input_En, SlewRate, Pull_Type, Drive_Strength) { \
	(uint8)((Pin_Idx) + (S100_PORT_MCU_PIN_NUM)), /**< Pin Id Converted */ \
	(Pin_Name), /**< Pin name */ \
	(boolean)(TRUE), /**< IsUsed */ \
	{ \
		(boolean)(TRUE), /**< ModeChang */ \
		(boolean)(Schmitt), /**< Schmitt Trigger */ \
		(boolean)(Input_En), /**< Input Enable*/ \
		(boolean)(FALSE), /**< Is Used GPIO */ \
		(boolean)(FALSE), /**< Direction change allowed */ \
		(Pin_Func), /**< Pin Function */ \
		(SlewRate), /**< Slew Rate */ \
		(Pull_Type), /**< Pin Pull Type */ \
		(Drive_Strength), /**< Pin Drive Strength */ \
		(PORT_PIN_DIR_IN), /**< GPIO Direction */ \
		(PORT_PIN_LEVEL_LOW) /**< GPIO Output Value */ \
	} \
}

...
```
D-Robotics provides a set of default PIN property definitions based on the actual needs of each function. Customers can modify them according to their own requirements:

<DocScope products="RDK S100">
`Config/McalCdd/gen_s100_sip_B_mcu1/Port/src/Port_FuncCfg.c`
</DocScope>
<DocScope products="RDK S600">
`Config/McalCdd/gen_s600_md_mcu1/Port/src/Port_FuncCfg.c`
</DocScope>

## Port Module
The Port module is the underlying PinCtrl module of the D-Robotics MCU. General users can use the Port_Func module to initialize the configuration of the peripherals they need. The following content is for advanced Port development, and some features are only available in the commercial version of the code.

### Pin Initial State Configuration
When MCU0 starts, it schedules the `Port_Init()` interface to configure the initial state of all MCU pins. By default, MCU1 does not call the `Port_Init()` interface again when it starts.
:::warning
It is not recommended for users to call the `Port_Init()` interface again on MCU1. Reinitializing the pin state may cause abnormalities in basic functions such as power supply on the S100 SIP.
:::

The initial state of each pin is defined in `Port_PBcfg.c`, as shown in the example below:

<DocScope products="RDK S100">

`Config/McalCdd/gen_s100_sip_B/Port/src/Port_PBCfg.c`

```c
...
    /* Pin Id,  Pin name,      IsUsed,        ModeChang,    SchmittTriger,  InputEnable,     IsUsedGpio,     DirChang,   PinMode,    Config Type,        Pull Type,       Drive Strength,         GpioDir,           GpioData*/
    {(uint8)51, "EMAC2_TX_CLK", (boolean)TRUE, {(boolean)TRUE, (boolean)FALSE, (boolean)TRUE, (boolean)TRUE, (boolean)TRUE, GPIO, PORT_PIN_CONFIG_TYPE0, PORT_PULL_NONE, PORT_DRIVE_STRENGTH_5, PORT_PIN_DIR_IN, PORT_PIN_LEVEL_LOW}},
...
```
</DocScope>
<DocScope products="RDK S600">

`Config/McalCdd/gen_s600_md_mcu1/Port/src/Port_PBCfg.c`

```c
...
    /* Pin Id,  Pin name,      IsUsed,        ModeChang,    SchmittTriger,  InputEnable,     IsUsedGpio,    DirChang,   PinMode,    Config Type,        Pull Type,       Drive Strength,         GpioDir,           GpioData*/
    {(uint8)0, "PPS_IN0", (boolean)TRUE, {(boolean)TRUE, (boolean)TRUE, (boolean)TRUE, (boolean)FALSE, (boolean)FALSE, PPS_IN0_FUNC0, PORT_PIN_CONFIG_TYPE0, PORT_PULL_NONE, PORT_DRIVE_DEFAULT, PORT_PIN_DIR_IN, PORT_PIN_LEVEL_LOW}},
...
```
</DocScope>

The code consists of two lines:
- The first line, a "comment line," indicates the meaning of each parameter in the code line;
- The second line, the "code line," defines the state of each pin. Below are several key configurations:
  - `PinMode`: Defines the specific function of the pin. For function definitions, refer to `Port_PBcfg.h` for the corresponding platform.
  - `Config Type`: Defines the SlewRate control of the pin. For specific definitions, refer to `Port/Inc/Port_Lld.h` for the commercial version, or `Include/Port_Lld.h` for the community version.
  - `IsUsed`: Defines whether the Port module will configure the pin during initialization;
  - `ModeChange`: Defines whether the pin's function can be modified at runtime when scheduling the Port module API (excluding the Port_Func module);
  - `IsUsedGpio`: Defines whether the Port module will configure the GPIO direction and output for the pin during initialization;

Customers can define the initial state of pins as needed.