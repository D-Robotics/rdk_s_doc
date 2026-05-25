---
sidebar_position: 16
---
# 7.5.17 MCU Watchdog

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 1. Introduction

<DocScope products="RDK S100">
This user document provides information about the WDG driver, including features, configuration parameters, and APIs.
Wherever `Wdgx` is mentioned in this document, `x` is an index with a valid range of 0, 1, and 2.
</DocScope>
<DocScope products="RDK S600">
This user document provides information about the WDG driver, including features, configuration parameters, and APIs.
Wherever `Wdgx` is mentioned in this document, `x` is an index with a valid range of 0, 1, 2, 3, and 4.
</DocScope>

## 2. Overview
### 2.1 File List
#### Low-Level Interface
These are the Watchdog low-level driver implementation and internal common interface files. General users do not need to focus on them directly:

- McalCdd\Wdg\inc\Wdg_Lld.h
- McalCdd\Wdg\src\Wdg_Lld.c
- McalCdd\Wdg\inc\Wdg_Prv.h
- McalCdd\Wdg\src\Wdg_Common.c

#### High-Level Interface

<DocScope products="RDK S100">
These are the API implementation files for user calls. Each Wdg instance requires a separate code file:

- McalCdd\Wdg\src\Wdg0.c
- McalCdd\Wdg\src\Wdg1.c
- McalCdd\Wdg\src\Wdg2.c
- McalCdd\Wdg\inc\Wdg0.h
- McalCdd\Wdg\inc\Wdg1.h
- McalCdd\Wdg\inc\Wdg2.h
</DocScope>
<DocScope products="RDK S600">
These are the API implementation files for user calls. Each Wdg instance requires a separate code file:

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
</DocScope>

## 3. Application Programming Interface

### 3.1 Types

#### 3.1.1 Imported Types
| Module | Header File | Imported Type |
|---|---|---|
| Std_Types | Std_Types.h | Std_ReturnType |
| Std_Types | Std_Types.h | Std_VersionInfoType |
| Rte_Type | Rte_Type.h | Dem_EventIdType |
| Rte_Type | Rte_Type.h | Dem_EventStatusType |
| WdgIf | WdgIf_Types.h | WdgIf_ModeType |

#### 3.1.2 Type Definitions
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

### 3.2 Function Definitions
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

### 3.3 Interrupt Handling

<DocScope products="RDK S100">
| ISR Name | Hardware Interrupt Vector |
|---|---|
| Wdg_Ins0IntIsr | 71 |
| Wdg_Ins0RstIsr | 72 |
| Wdg_Ins1IntIsr | 73 |
| Wdg_Ins1RstIsr | 74 |
| Wdg_Ins2IntIsr | 75 |
| Wdg_Ins2RstIsr | 76 |
</DocScope>
<DocScope products="RDK S600">
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
</DocScope>

### 3.4 Critical Sections
Use `SchM_Enter_Wdg_ExclusiveZone_XX` and `SchM_Exit_Wdg_ExclusiveZone_XX` to define operations for entering and exiting critical sections. The WDG driver requires users to handle critical sections according to their actual application deployment. These functions are already called in the driver.

Protects `Wdg_LastMode`:
- SchM_Enter_Wdg_ExclusiveZone_00
- SchM_Exit_Wdg_ExclusiveZone_00

Protects `Wdg_CurrMode`:
- SchM_Enter_Wdg_ExclusiveZone_01
- SchM_Exit_Wdg_ExclusiveZone_01

Protects `Wdg_State`:
- SchM_Enter_Wdg_ExclusiveZone_02
- SchM_Exit_Wdg_ExclusiveZone_02

Protects `Wdg_GptPeriod`:
- SchM_Enter_Wdg_ExclusiveZone_03
- SchM_Exit_Wdg_ExclusiveZone_03

Protects `Wdg_Timeout`:
- SchM_Enter_Wdg_ExclusiveZone_04
- SchM_Exit_Wdg_ExclusiveZone_04

Protects `Wdg_PausePtr`:
- SchM_Enter_Wdg_ExclusiveZone_05
- SchM_Exit_Wdg_ExclusiveZone_05

Protects `Wdg_Lld_Rst`:
- SchM_Enter_Wdg_ExclusiveZone_06
- SchM_Exit_Wdg_ExclusiveZone_06

## 4. A-Core Watchdog Timeout MCU Handling Flow

### 4.1 Reset Configuration Enable

Call `Wdg_Enable_RstConfig()` in Target's `main.c` (implementation in `Wdg_Common.c`, declaration in `Wdg_Prv.h`) to complete the low-level enablement related to the watchdog-side and MCU reset/notification link.

| Name | Description |
|---|---|
| Wdg_Enable_RstConfig | Reset configuration |

### 4.2 MCU-Side Handling Flow

When the A-core watchdog times out, an interrupt is sent to MCU0. MCU0 then initiates a reset after a delay so that the A-core can print stack and other information.

The flow is: interrupt sets flag → dedicated task delays → trigger long reset. The responsibility for executing the long reset lies with the OS task.

| Name | Location | Description |
|---|---|---|
| Interrupt (entry) | Target\...\HorizonISR.c: ISR(Wdt_CfIntIsr) | Set `g_need_reset = 1` (`g_need_reset` is in `McalCdd\Wdg\src\Wdg_Common.c`), `Os_Disable_Wdt_CfIntIsr()`; bound to IntRouter and ConfigInterrupts.h |
| OS task (delay + long reset) | Target\...\HorizonTask.c: TASK(OsTask_SysCore_WDG_RST) | When `g_need_reset` is true: log → `vTaskDelay(MS_TO_TICK(5000))` (approx. 5s) → `Rfchm_TriggerSocLongReset()` executes SoC long reset |
