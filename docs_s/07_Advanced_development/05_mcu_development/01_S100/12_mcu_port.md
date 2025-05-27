---
sidebar_position: 12
---
# Port使用指南
## 基本概述
Port子系统是MCU上对PIN的功能和属性进行配置的子系统。

## Port_Func模块
Port_Func模块是地瓜提供的针对功能模块对该功能模块下属所有PIN进行初始化配置的模块。

### Port_Func模块使用示例
使用示例可以参考`samples/Spi/SPI_sample/Spi_sample.c`，基本使用逻辑为：
``` C
...
#include <Port_Func.h>

...

	/* Configure Pin for SPI5 */
	Port_SetFunctionPins(PORT_FUNC_SPI5);

...
```
### Port_Func模块提供的外设配置
地瓜提供的默认外设PIN配置被记录在：`McalCdd/Port/inc/Port_Func.h`文件内，通过一个由enum类型定义记录：
```C
...

typedef enum PinFunctions {
    PORT_FUNC_UART4,
    PORT_FUNC_UART5,
    PORT_FUNC_UART6,
    PORT_FUNC_SPI2,
    PORT_FUNC_SPI3,
    PORT_FUNC_SPI4,
    PORT_FUNC_SPI5,
    PORT_FUNC_SPI6,
    PORT_FUNC_SPI7,
    PORT_FUNC_CAN0,
    PORT_FUNC_CAN1,
    PORT_FUNC_CAN2,
    PORT_FUNC_CAN3,
    PORT_FUNC_CAN4,
    PORT_FUNC_CAN5,
    PORT_FUNC_CAN6,
    PORT_FUNC_CAN7,
    PORT_FUNC_CAN8,
    PORT_FUNC_CAN9,
    PORT_FUNC_I2C6,
    PORT_FUNC_I2C7,
    PORT_FUNC_I2C8,
    PORT_FUNC_I2C9,
    PORT_FUNC_PWM0,
    PORT_FUNC_PWM1,
    PORT_FUNC_PWM2,
    PORT_FUNC_PWM3,
    PORT_FUNC_PWM4,
    PORT_FUNC_PWM5,
    PORT_FUNC_PWM6,
    PORT_FUNC_PWM7,
    PORT_FUNC_PWM8,
    PORT_FUNC_PWM9,
    PORT_FUNC_PWM10,
    PORT_FUNC_PWM11,
    PORT_FUNC_PPS_IN0,
    PORT_FUNC_PPS_IN1,
    PORT_FUNC_PPS_IN2,
    PORT_FUNC_PPS_OUT,
    PORT_FUNC_EMAC,
    PORT_FUNC_MAX,
} PinFunc_e;

...

```


# Port开发指南
## 基本概述
Port整体分为对外接口和"Low Level Driver(LLD)"两大部分，这里只介绍用户接口开发部分。

## Port_Func模块
地瓜MCU系统提供针对功能整体配置的Port_Func模块。

在McalCdd的路径中，定义了Port_Func模块的对外接口：
``` bash
# Driver source code:
McalCdd/Port/inc/Port_Func.h
McalCdd/Prot/src/Port_Func.c
```
在Config目录下，定义了MCU提供的外设的PIN的具体PinCtrl配置。
```bash
# PIN definition source code:
Config/McalCdd/gen_s100_sip_B_mcu1/Port/inc/Port_FuncCfg.h
Config/McalCdd/gen_s100_sip_B_mcu1/Port/src/Port_FuncCfg.c
```
### PinCtrl配置说明
在`Config/McalCdd/gen_s100_sip_B_mcu1/Port/inc/Port_FuncCfg.h`中，提供了方便定义PIN属性的宏：
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
		(boolean)(FALSE), /**< Direciton change allowed */ \
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
		(boolean)(FALSE), /**< Direciton change allowed */ \
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
地瓜根据各个功能的实际情况，提供了一套默认的PIN属性定义，在`Config/McalCdd/gen_s100_sip_B_mcu1/Port/src/Port_FuncCfg.c`文件内，客户可以根据自己的实际需求进行修改。
