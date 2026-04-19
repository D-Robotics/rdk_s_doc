---
sidebar_position: 16
---
# 7.5.17 MCU 看门狗

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

## 1. 简介

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">
本用户文档旨在提供WDG驱动的相关信息，包括功能、配置参数、API。
文档每一处提及的Wdgx，x为索引，有效范围为0、1、2。
</TabItem>
<TabItem value="S600" label="S600">
本用户文档旨在提供WDG驱动的相关信息，包括功能、配置参数、API。
文档每一处提及的Wdgx，x为索引，有效范围为0、1、2、3、4。
</TabItem>
</Tabs>

## 2. 概览
### 2.1 文件列表
#### Lowlevel接口
这些是Watchdog底层驱动的实现和内部公共接口文件，一般用户不需要直接关注：

- McalCdd\Wdg\inc\Wdg_Lld.h
- McalCdd\Wdg\src\Wdg_Lld.c
- McalCdd\Wdg\inc\Wdg_Prv.h
- McalCdd\Wdg\src\Wdg_Common.c

#### Highlevel接口

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">
这些是用于用户调用的API实现文件，每一个Wdg的instance需要一份独立代码文件：

- McalCdd\Wdg\src\Wdg0.c
- McalCdd\Wdg\src\Wdg1.c
- McalCdd\Wdg\src\Wdg2.c
- McalCdd\Wdg\inc\Wdg0.h
- McalCdd\Wdg\inc\Wdg1.h
- McalCdd\Wdg\inc\Wdg2.h
</TabItem>
<TabItem value="S600" label="S600">
这些是用于用户调用的API实现文件，每一个Wdg的instance需要一份独立代码文件：

- McalCdd\Wdg\src\Wdg0.c
- McalCdd\Wdg\src\Wdg1.c
- McalCdd\Wdg\src\Wdg2.c
- McalCdd\Wdg\src\Wdg3.c
- McalCdd\Wdg\src\Wdg4.c
- McalCdd\Wdg\inc\Wdg0.h
- McalCdd\Wdg\inc\Wdg1.h
- McalCdd\Wdg\inc\Wdg2.h
- McalCdd\Wdg\inc\Wdg3.h
- McalCdd\Wdg\inc\Wdg4.h
</TabItem>
</Tabs>

## 3. 应用程序接口

### 3.1 类型

#### 3.1.1 导入类型
| Module | Header File | Imported Type |
|---|---|---|
| Std_Types | Std_Types.h | Std_ReturnType |
| Std_Types | Std_Types.h | Std_VersionInfoType |
| Rte_Type | Rte_Type.h | Dem_EventIdType |
| Rte_Type | Rte_Type.h | Dem_EventStatusType |
| WdgIf | WdgIf_Types.h | WdgIf_ModeType |

#### 3.1.2 类型定义
##### Wdg_ApiIdType
| Name | Wdg_ApiIdType | Analysis |
|---|---|---|
| Type | Enumeration |
| Element | 0x00  WDG_INIT_API_ID | API Id of Wdg_Init |
| | 0x01 WDG_SETMODE_API_ID | API Id of Wdg_SetMode |
| | 0x02 WDG_SETTRIGGERCONDITION_API_ID | API Id of Wdg_SetTriggerCondition |
| | 0x03 WDG_GETVERSION_API_ID | API Id of Wdg_GetVersionInfo |
| Description | WDG ApiId Enumeration |
| Available via | Wdg_Prv.h |

##### Wdg_ErrIdType
| Name | Wdg_ErrIdType | Analysis |
|---|---|---|
| Type | Enumeration |
| Element | 0x10 WDG_E_DRIVER_STATE | Error ID of wrong driver state |
| | 0x11 WDG_E_PARAM_MODE | Error ID of wrong mode |
| | 0x12 WDG_E_PARAM_CONFIG | Error ID of wrong config |
| | 0x13 WDG_E_PARAM_TIMEOUT | Error ID of wrong timeout |
| | 0x14 WDG_E_PARAM_POINTER | Error ID of wrong pointer |
| | 0x15 WDG_E_INIT_FAILED | Error ID of init failed |
| Description | WDG ErrId Enumeration |
| Available via | Wdg_Prv.h |

##### Wdg_StateType
| Name | Wdg_StateType |
|---|---|
| Type | Enumeration |
| Element | 0x01 WDG_UNINIT(The wdg’s state is uninitialized) |
| | 0x02 WDG_IDLE(The wdg’s state is idle) |
| | 0x03 WDG_BUSY(The wdg’s state is busy) |
| Description | WDG State Enumeration |
| Available via | Wdg_Prv.h |

##### Wdg_ModeType
| Name | Wdg_ModeType | Analysis |
|---|---|---|
| Type | Structure |
| Element | uint32 Wdg_GptPeriod | Timeout period of GPT used by WDG |
| | const Wdg_Lld_ConfigType * Wdg_Lld_ConfigPtr | Pointer to WDG Low-Level Driver Config |
| Description | WDG Mode Structure |
| Available via | Wdg_Prv.h |

##### Wdg_ConfigType
| Name | Wdg_ConfigType | Analysis |
|---|---|---|
| Type | Structure |
| Element | Wdg_Lld_InstanceType Wdg_InstanceId | WDG’s instance id |
| | WdgIf_ModeType Wdg_DefaultModeSetting | WDG’s default mode setting |
| | const Wdg_ModeType Wdg_ModeSettings | WDG Specific mode settings |
| | Gpt_ChannelType Wdg_GptChannel | Channel of GPT used by WDG |
| | uint32 Wdg_GptFreq | Frequency of GPT used by WDG |
| Description | WDG Configuration  Structure |
| Available via | Wdg_Prv.h |

### 3.2 函数定义
#### 3.2.1 Wdgx_Init
| Service Name | Wdgx_Init |
|---|---|
| Syntax | void Wdgx_Init(const Wdg_ConfigType *ConfigPtr) |
| Sync/Async | Synchronous |
| Reentrancy | Non Reentrant |
| Parameters (in) | ConfigPtr:Pointer to configuration set |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | None |
| Description | Initializes the module |
| Available via | Wdgx.h |

#### 3.2.2 Wdgx_SetMode
| Service Name | Wdgx_SetMode |
|---|---|
| Syntax | Std_ReturnType Wdgx_SetMode(WdgIf_ModeType Mode) |
| Sync/Async | Synchronous |
| Reentrancy | Non Reentrant |
| Parameters (in) | Mode:WDGIF_OFF_MODE/WDGIF_SLOW_MODE/WDGIF_FAST_MODE |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | Std_ReturnType |
| Description | Switches the Watchdog into the mode Mode. |
| Available via | Wdgx.h |

#### 3.2.3 Wdgx_SetTriggerCondition
| Service Name | Wdgx_SetTriggerCondition |
|---|---|
| Syntax | void Wdgx_SetTriggerCondition(uint16 timeout) |
| Sync/Async | Synchronous |
| Reentrancy | Non Reentrant |
| Parameters (in) | Timeout:Timeout value (milliseconds) for setting the trigger counter. |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | None |
| Description | Sets the timeout value for the trigger counter. |
| Available via | Wdgx.h |

#### 3.2.4 Wdgx_GetVersionInfo
| Service Name | Wdgx_GetVersionInfo |
|---|---|
| Syntax | void Wdgx_GetVersionInfo(Std_VersionInfoType *VersionInfoPtr) |
| Sync/Async | Synchronous |
| Reentrancy | Reentrant |
| Parameters (in) | None |
| Parameters (inout) | None |
| Parameters (out) | VersionInfoPtr:Pointer to where to store the version information of this module. |
| Return value | None |
| Description | Returns the version information of the module. |
| Available via | Wdgx.h |

### 3.3 中断处理

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">
| ISR Name | Hardware Interrupt Vector |
|---|---|
| Wdg_Ins0IntIsr | 71 |
| Wdg_Ins0RstIsr | 72 |
| Wdg_Ins1IntIsr | 73 |
| Wdg_Ins1RstIsr | 74 |
| Wdg_Ins2IntIsr | 75 |
| Wdg_Ins2RstIsr | 76 |
</TabItem>
<TabItem value="S600" label="S600">
| ISR Name | Hardware Interrupt Vector |
|---|---|
| Wdg_Ins0IntIsr | 93 |
| Wdg_Ins0RstIsr | 94 |
| Wdg_Ins1IntIsr | 95 |
| Wdg_Ins1RstIsr | 96 |
| Wdg_Ins2IntIsr | 97 |
| Wdg_Ins2RstIsr | 98 |
| Wdg_Ins3IntIsr | 99 |
| Wdg_Ins3RstIsr | 100 |
| Wdg_Ins4IntIsr | 101 |
| Wdg_Ins4RstIsr | 102 |
</TabItem>
</Tabs>

### 3.4 临界区
使用`SchM_Enter_Wdg_ExclusiveZone_XX`和`SchM_Exit_Wdg_ExclusiveZone_XX`来定义进入和退出临界区的操作，WDG驱动程序需要用户结合实际应用部署情况来处理临界区，其函数已在驱动中调用。

保护`Wdg_LastMode`:
- SchM_Enter_Wdg_ExclusiveZone_00
- SchM_Exit_Wdg_ExclusiveZone_00

保护`Wdg_CurrMode`:
- SchM_Enter_Wdg_ExclusiveZone_01
- SchM_Exit_Wdg_ExclusiveZone_01

保护`Wdg_State`:
- SchM_Enter_Wdg_ExclusiveZone_02
- SchM_Exit_Wdg_ExclusiveZone_02

保护`Wdg_GptPeriod`:
- SchM_Enter_Wdg_ExclusiveZone_03
- SchM_Exit_Wdg_ExclusiveZone_03

保护`Wdg_Timeout`:
- SchM_Enter_Wdg_ExclusiveZone_04
- SchM_Exit_Wdg_ExclusiveZone_04

保护`Wdg_PausePtr`:
- SchM_Enter_Wdg_ExclusiveZone_05
- SchM_Exit_Wdg_ExclusiveZone_05

保护`Wdg_Lld_Rst`:
- SchM_Enter_Wdg_ExclusiveZone_06
- SchM_Exit_Wdg_ExclusiveZone_06

## 4. Acore看门狗超时MCU处理流程

### 4.1 复位配置使能

在 Target 的 `main.c` 调用 `Wdg_Enable_RstConfig()`（实现见 `Wdg_Common.c`，声明见 `Wdg_Prv.h`），完成看门狗侧与 MCU 复位/通知链路相关的底层使能。

| Name | Description |
|---|---|
| Wdg_Enable_RstConfig | 复位配置 |

### 4.2 MCU侧处理流程

Acore侧看门狗超时触发中断送到MCU0侧，由MCU0侧在延时后发起复位，以便Acore打印栈等信息。

流程为 中断置标志 → 专用任务里延时 → 触发长复位，执行长复位的责任在 OS 任务。

| Name | Location | Description |
|---|---|---|
| 中断（入口） | Target\...\HorizonISR.c：ISR(Wdt_CfIntIsr) | 置 g_need_reset = 1（g_need_reset 在 McalCdd\Wdg\src\Wdg_Common.c），Os_Disable_Wdt_CfIntIsr()；与 IntRouter、ConfigInterrupts.h 绑定 |
| OS 任务（延时 + 长复位） | Target\...\HorizonTask.c：TASK(OsTask_SysCore_WDG_RST) | g_need_reset 为真时：日志 → vTaskDelay(MS_TO_TICK(5000))（约 5s）→ Rfchm_TriggerSocLongReset() 执行 SoC 长复位 |
