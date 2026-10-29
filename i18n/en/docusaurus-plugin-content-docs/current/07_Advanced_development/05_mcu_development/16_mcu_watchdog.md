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

<DocScope products="RDK S100" versions=">= 4.1.0">

### 2.2 Difference Between On-Chip WDG and PMIC WDG

The on-chip WDG and PMIC WDG are complementary watchdog layers. The on-chip WDG is used for MCU internal monitoring and testing, while the PMIC WDG acts as a board-level fail-safe backup; if the MCU software cannot feed the watchdog properly, the PMIC WDG can still perform a reset or protection action after timeout.

There are two independent watchdogs on the RDK S100 MCU side:

- **On-chip WDG**: Integrated inside the RDK S100. It is disabled by default; initialize and configure it through the WDG APIs when needed.
- **PMIC WDG**: Located inside the external `MCUPWR` PMIC and fed by the MCU over I2C.

| Item | On-chip WDG | PMIC WDG |
|---|---|---|
| Location | Inside the SoC | External `MCUPWR` PMIC |
| Default state | Disabled by default | Enabled in `MCU_RELEASE` builds, disabled in non-release builds; fixed disabled on MCU1 |
| Control method | MCU register control | MCU control through I2C |
| Feed method | Configure and feed through the WDG APIs | Periodic MCU task feeds through the PMIC driver |
| Reset/interrupt | Supports normal and reset interrupts | PMIC performs fail-safe/reset on timeout |

#### Driver and Configuration Files

- **On-chip WDG driver**
  - Common low-level driver: `McalCdd/Wdg/src/Wdg_Lld.c`, `McalCdd/Wdg/inc/Wdg_Lld.h`.
  - Common high-level driver: `McalCdd/Wdg/src/Wdg_Common.c`, `McalCdd/Wdg/inc/Wdg_Prv.h`.
  - Instance interfaces: `McalCdd/Wdg/src/Wdg0.c`, `Wdg1.c`, `Wdg2.c`, together with `McalCdd/Wdg/inc/Wdg0.h`, `Wdg1.h`, `Wdg2.h`.
- **PMIC WDG driver**
  - Common driver: `McalCdd/Pmic/src/Wdg_Ext.c`, `McalCdd/Pmic/inc/Wdg_Ext.h`.
  - Common low-level driver: `McalCdd/Pmic/src/Pmic_Lld_Wdg.c`, `McalCdd/Pmic/inc/Pmic_Lld_Wdg.h`.
  - RDK S100 device driver: `McalCdd/Pmic/devices/src/Pmic_Lld_McuPwrWdg.c`, `McalCdd/Pmic/devices/inc/Pmic_Lld_McuPwrWdg.h`.
- **On-chip WDG configuration**
  - MCU0: `Config/McalCdd/gen_s100_sip_B/Wdg/src/Wdg_Cfg.c`, together with `Wdg0_PBcfg.c`, `Wdg1_PBcfg.c`, and `Wdg2_PBcfg.c`.
  - MCU1: `Config/McalCdd/gen_s100_sip_B_mcu1/Wdg/src/Wdg_Cfg.c`, together with `Wdg0_PBcfg.c`, `Wdg1_PBcfg.c`, and `Wdg2_PBcfg.c`.
- **PMIC WDG configuration**
  - MCU0: `Config/McalCdd/gen_s100_sip_B/PwrIf/src/PwrM_Cfg.c`.
  - MCU1: `Config/McalCdd/gen_s100_sip_B_mcu1/PwrIf/src/PwrM_Cfg.c`.
</DocScope>

<DocScope products="RDK S600" versions=">= 5.1.1">

### 2.2 Difference Between On-Chip WDG and PMIC WDG

The on-chip WDG and PMIC WDG are complementary watchdog layers. The on-chip WDG is used for MCU internal monitoring and testing, while the PMIC WDG acts as a board-level fail-safe backup; if the MCU software cannot feed the watchdog properly, the PMIC WDG can still perform a reset or protection action after timeout.

There are two independent watchdogs on the RDK S600 MCU side:

- **On-chip WDG**: Integrated inside the RDK S600. It is disabled by default; initialize and configure it through the WDG APIs when needed. The RDK S600 supports five instances, `Wdg0` through `Wdg4`. The current MCU0 default configuration mounts `Wdg0` through `Wdg2`, and the MCU1 default configuration also mounts `Wdg0` through `Wdg2`.
- **PMIC WDG**: Located inside the external `VR5510` PMIC and controlled/fed by the MCU over I2C. It is enabled on MCU0 by default, while the `VR5510` device-level watchdog is disabled on MCU1 by default.

| Item | On-chip WDG | PMIC WDG |
|---|---|---|
| Location | Inside the SoC | External `VR5510` PMIC |
| Default state | Disabled by default | Enabled on MCU0 by default; `VR5510` device-level disabled on MCU1 by default |
| Control method | MCU register control | MCU control through I2C |
| Feed method | Configure and feed through the WDG APIs | Periodic MCU task feeds through the PMIC driver |
| Reset/interrupt | Supports normal and reset interrupts | PMIC performs fail-safe/reset on timeout |

#### Driver and Configuration Files

- **On-chip WDG driver**
  - Common low-level driver: `McalCdd/Wdg/src/Wdg_Lld.c`, `McalCdd/Wdg/inc/Wdg_Lld.h`.
  - Common high-level driver: `McalCdd/Wdg/src/Wdg_Common.c`, `McalCdd/Wdg/inc/Wdg_Prv.h`.
  - Instance interfaces: `McalCdd/Wdg/src/Wdg0.c`, `Wdg1.c`, `Wdg2.c`, `Wdg3.c`, `Wdg4.c`, together with `McalCdd/Wdg/inc/Wdg0.h`, `Wdg1.h`, `Wdg2.h`, `Wdg3.h`, `Wdg4.h`.
- **PMIC WDG driver**
  - Common driver: `McalCdd/Pmic/src/Wdg_Ext.c`, `McalCdd/Pmic/inc/Wdg_Ext.h`.
  - Common low-level driver: `McalCdd/Pmic/src/Pmic_Lld_Wdg.c`, `McalCdd/Pmic/inc/Pmic_Lld_Wdg.h`.
  - RDK S600 device driver: `McalCdd/Pmic/devices/src/Pmic_Lld_Vr5510Wdg.c`, `McalCdd/Pmic/devices/inc/Pmic_Lld_Vr5510Wdg.h`.
- **On-chip WDG configuration**
  - MCU0: `Config/McalCdd/gen_s600_md/Wdg/src/Wdg_Cfg.c`, together with `Wdg0_PBcfg.c`, `Wdg1_PBcfg.c`, `Wdg2_PBcfg.c`, `Wdg3_PBcfg.c`, and `Wdg4_PBcfg.c`.
  - MCU1: `Config/McalCdd/gen_s600_md_mcu1/Wdg/src/Wdg_Cfg.c`, together with `Wdg0_PBcfg.c`, `Wdg1_PBcfg.c`, `Wdg2_PBcfg.c`, `Wdg3_PBcfg.c`, and `Wdg4_PBcfg.c`.
- **PMIC WDG configuration**
  - MCU0: `Config/McalCdd/gen_s600_md/PwrIf/src/PwrM_Cfg.c`.
  - MCU1: `Config/McalCdd/gen_s600_md_mcu1/PwrIf/src/PwrM_Cfg.c`.
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

<DocScope products="RDK S100" versions=">= 4.1.0">

#### 3.2.5 Wdg_Lld_SetRstCallback
| Service Name | Wdg_Lld_SetRstCallback |
|---|---|
| Syntax | Std_ReturnType Wdg_Lld_SetRstCallback(const Wdg_Lld_InstanceType Instance, Wdg_CallbackPtrType Callback) |
| Sync/Async | Synchronous |
| Reentrancy | Non Reentrant |
| Parameters (in) | Instance:watchdog instance index; Callback:Reset interrupt callback, NULL_PTR can be used to clear |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | Std_ReturnType |
| Description | Registers or clears the reset interrupt callback of the specified watchdog instance. |
| Available via | Wdg_Lld.h |

#### 3.2.6 Wdg_Lld_RstIrqHandler
| Service Name | Wdg_Lld_RstIrqHandler |
|---|---|
| Syntax | void Wdg_Lld_RstIrqHandler(uint32 Instance) |
| Sync/Async | Synchronous |
| Reentrancy | Non Reentrant |
| Parameters (in) | Instance:watchdog instance index |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | None |
| Description | Handles the watchdog reset interrupt and invokes the callback registered by Wdg_Lld_SetRstCallback. |
| Available via | Wdg_Lld.h |
</DocScope>

<DocScope products="RDK S600" versions=">= 5.1.1">

#### 3.2.5 Wdg_Lld_SetRstCallback
| Service Name | Wdg_Lld_SetRstCallback |
|---|---|
| Syntax | Std_ReturnType Wdg_Lld_SetRstCallback(const Wdg_Lld_InstanceType Instance, Wdg_CallbackPtrType Callback) |
| Sync/Async | Synchronous |
| Reentrancy | Non Reentrant |
| Parameters (in) | Instance:watchdog instance index; Callback:Reset interrupt callback, NULL_PTR can be used to clear |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | Std_ReturnType |
| Description | Registers or clears the reset interrupt callback of the specified watchdog instance. |
| Available via | Wdg_Lld.h |

#### 3.2.6 Wdg_Lld_RstIrqHandler
| Service Name | Wdg_Lld_RstIrqHandler |
|---|---|
| Syntax | void Wdg_Lld_RstIrqHandler(uint32 Instance) |
| Sync/Async | Synchronous |
| Reentrancy | Non Reentrant |
| Parameters (in) | Instance:watchdog instance index |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | None |
| Description | Handles the watchdog reset interrupt and invokes the callback registered by Wdg_Lld_SetRstCallback. |
| Available via | Wdg_Lld.h |
</DocScope>

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

<DocScope products="RDK S100" versions=">= 4.1.0">

The handling paths for normal WDG interrupts and reset interrupts are as follows:

| ISR | Handler | Description |
|---|---|---|
| Wdg_InsXIntIsr | WdgX_IrqHandler | Normal WDG interrupt; finally calls Wdg_Lld_IrqHandler |
| Wdg_InsXRstIsr | Wdg_Lld_RstIrqHandler | WDG reset interrupt; finally calls the callback registered by Wdg_Lld_SetRstCallback |

:::note
`WdgX_RstIrqHandler()` wraps `Wdg_Lld_RstIrqHandler(X)` in the Target project and is equivalent to it; `Wdg0` through `Wdg2` all provide an instance-level entry.
:::
</DocScope>

<DocScope products="RDK S600" versions=">= 5.1.1">

The handling paths for normal WDG interrupts and reset interrupts are as follows:

| ISR | Handler | Description |
|---|---|---|
| Wdg_InsXIntIsr | WdgX_IrqHandler | Normal WDG interrupt; finally calls Wdg_Lld_IrqHandler |
| Wdg_InsXRstIsr | Wdg_Lld_RstIrqHandler | WDG reset interrupt; finally calls the callback registered by Wdg_Lld_SetRstCallback |

:::note
`WdgX_RstIrqHandler()` wraps `Wdg_Lld_RstIrqHandler(X)` in the Target project and is equivalent to it; `Wdg0` through `Wdg2` all provide an instance-level entry, while `Wdg3`/`Wdg4` have none and call `Wdg_Lld_RstIrqHandler(3U)`/`Wdg_Lld_RstIrqHandler(4U)` directly.
:::
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

<DocScope products="RDK S100" versions=">= 4.1.0">

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

</DocScope>

<DocScope products="RDK S600" versions=">= 5.1.0">

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

</DocScope>

<DocScope products="RDK S100" versions=">= 4.1.0">

## 5. WDG Reset Interrupt Test Environment Configuration

This section describes the test environment configuration required to verify the WDG reset interrupt callback path after a timeout. The driver already provides the reset interrupt callback interface; see 3.2.5 and 3.2.6 for the related APIs and 3.3 for the interrupt handling path.

### 5.1 Test Environment Configuration

The following configuration is used to allow the core running the test code to control the WDG and receive reset interrupts.

#### 5.1.1 Reset Interrupt Handler
- File: `Target/Target_S100/Target-hobot-lite-freertos/target/HorizonISR.c`
- Location: `Wdg_Ins0RstIsr`, `Wdg_Ins1RstIsr`, `Wdg_Ins2RstIsr`.
- Default behavior: The reset interrupt entries call `WdgX_IrqHandler()`, so the driver reset interrupt callback path is not entered.
- Test configuration: Change the three reset interrupt entries to call `WdgX_RstIrqHandler()` so that the driver reset interrupt callback path is entered.

```c
ISR(Wdg_Ins0RstIsr){
    LogSync("Enter Wdg_Ins0RstIsr\\r\\n");
    Wdg0_RstIrqHandler();
}
ISR(Wdg_Ins1RstIsr){
    LogSync("Enter Wdg_Ins1RstIsr\\r\\n");
    Wdg1_RstIrqHandler();
}
ISR(Wdg_Ins2RstIsr){
    LogSync("Enter Wdg_Ins2RstIsr\\r\\n");
    Wdg2_RstIrqHandler();
}
```

#### 5.1.2 WDG Core Binding
- File: `Config/McalCdd/gen_s100_sip_B/Wdg/src/Wdg_Cfg.c`
- Location: `Wdg_CoreIdConfig` array.
- Configuration: Bind the WDG instances to be tested to the core where the test code runs.

```c
const uint16 Wdg_CoreIdConfig[WDG_NUM] =
{
    0U,
    0U,
    0U,
};
```

#### 5.1.3 Interrupt Routing
- File: `Target/Target_S100/Target-hobot-lite-freertos/target/main.c`
- Location: After `FreeRtos_Irq_Init();`.
- Configuration: Route the WDG interrupts and reset interrupts to the core where the test code runs.

```c
OS_R52_GICD_IROUTER[MCUSYS_WWDT0_SYS_RST_INTR] = WDG_IRQ_AFFINITY_NS | 0U;
OS_R52_GICD_IROUTER[MCUSYS_WWDT0_INTR]         = WDG_IRQ_AFFINITY_NS | 0U;
OS_R52_GICD_IROUTER[MCUSYS_WWDT1_SYS_RST_INTR] = WDG_IRQ_AFFINITY_NS | 0U;
OS_R52_GICD_IROUTER[MCUSYS_WWDT1_INTR]         = WDG_IRQ_AFFINITY_NS | 0U;
OS_R52_GICD_IROUTER[MCUSYS_WWDT2_SYS_RST_INTR] = WDG_IRQ_AFFINITY_NS | 0U;
OS_R52_GICD_IROUTER[MCUSYS_WWDT2_INTR]         = WDG_IRQ_AFFINITY_NS | 0U;
```

#### 5.1.4 Enable Shell
- File: `Target/Target_S100/Target-hobot-lite-freertos/target/Target.h`
- Location: `SHELL_ENABLE` macro definition.
- Configuration: Enable the Shell if test commands are executed through the Shell.

```c
#define SHELL_ENABLE TRUE
```
</DocScope>

<DocScope products="RDK S600" versions=">= 5.1.1">

## 5. WDG Reset Interrupt Test Environment Configuration

This section describes the test environment configuration required to verify the WDG reset interrupt callback path after a timeout. The driver already provides the reset interrupt callback interface; see 3.2.5 and 3.2.6 for the related APIs and 3.3 for the interrupt handling path.

The current RDK S600 MCU0 Target project has wired up the `Wdg_InsXIntIsr`/`Wdg_InsXRstIsr` reset interrupt test path. When testing from an unmodified source tree, apply the following test environment configuration before testing.

### 5.1 Test Environment Configuration

The following configuration is used to verify the reset interrupt callback path for `Wdg0` through `Wdg4` from the Shell on Core0 of RDK S600 MCU0. The driver already supports the `Wdg0` through `Wdg4` reset interrupt interfaces.

#### 5.1.1 WDG Configuration Expansion

The RDK S600 MCU0 test configuration expands the WDG instance count from three to five, adds the `Wdg3/4` timeout, mode, and state entries, and binds all five instances to MCU0 Core0 so that the core running the test code can receive the corresponding interrupts.

##### `Wdg_Cfg_Defines.h`

- File: `Config/McalCdd/gen_s600_md/Wdg/inc/Wdg_Cfg_Defines.h`
- Change `WDG_NUM` from `3U` to `5U`.

```c
#define WDG_NUM            (5U)
```

- Add the `WDG3/4` timeout parameters:

```c
#define WDG3_INITIAL_TIMEOUT ((uint16)5000)
#define WDG3_MAX_TIMEOUT ((uint16)65535)
#define WDG4_INITIAL_TIMEOUT ((uint16)5000)
#define WDG4_MAX_TIMEOUT ((uint16)65535)
```

- Add two entries to `WDG_TIMEOUT_VALUE_ARRAY`, `WDG_INIT_LAST_MODE_ARRAY`, and `WDG_INIT_STATE_ARRAY` for `Wdg3` and `Wdg4`, increasing the array length from 3 to 5:

```c
#define WDG_TIMEOUT_VALUE_ARRAY { \
    {(uint32)0,(uint32)200, (uint32)100}, \
    {(uint32)0,(uint32)200, (uint32)100}, \
    {(uint32)0,(uint32)200, (uint32)100}, \
    {(uint32)0,(uint32)200, (uint32)100}, \
    {(uint32)0,(uint32)200, (uint32)100}, \
}

#define WDG_INIT_LAST_MODE_ARRAY { \
    WDGIF_OFF_MODE, \
    WDGIF_OFF_MODE, \
    WDGIF_OFF_MODE, \
    WDGIF_OFF_MODE, \
    WDGIF_OFF_MODE, \
}

#define WDG_INIT_STATE_ARRAY { \
    WDG_UNINIT, \
    WDG_UNINIT, \
    WDG_UNINIT, \
    WDG_UNINIT, \
    WDG_UNINIT, \
}
```

##### `Wdg_Cfg.c`

- File: `Config/McalCdd/gen_s600_md/Wdg/src/Wdg_Cfg.c`
- Add `&Wdg_Config_3` and `&Wdg_Config_4` to `Wdg_Config[]`.
- Add the `WDG3/4` timeout macros to `Wdg_CfgInitialTimeout[]` and `Wdg_CfgMaxTimeout[]`.

```c
const Wdg_ConfigType * const Wdg_Config[WDG_NUM] =
{
    &Wdg_Config_0,
    &Wdg_Config_1,
    &Wdg_Config_2,
    &Wdg_Config_3,
    &Wdg_Config_4,
};

const uint16 Wdg_CfgInitialTimeout[WDG_NUM] =
{
    WDG0_INITIAL_TIMEOUT,
    WDG1_INITIAL_TIMEOUT,
    WDG2_INITIAL_TIMEOUT,
    WDG3_INITIAL_TIMEOUT,
    WDG4_INITIAL_TIMEOUT,
};

const uint16 Wdg_CfgMaxTimeout[WDG_NUM] =
{
    WDG0_MAX_TIMEOUT,
    WDG1_MAX_TIMEOUT,
    WDG2_MAX_TIMEOUT,
    WDG3_MAX_TIMEOUT,
    WDG4_MAX_TIMEOUT,
};
```

- Expand `Wdg_CoreIdConfig[]` to five entries. When testing on MCU0 Core0, set all entries to `0U` so that all five WDGs are bound to Core0:

```c
const uint16 Wdg_CoreIdConfig[WDG_NUM] =
{
    0U,
    0U,
    0U,
    0U,
    0U,
};
```

#### 5.1.2 Reset Interrupt Handlers
- File: `Target/Target_S600/Target-hobot-lite-freertos/target/HorizonISR.c`
- Configuration: Add `Wdg_Ins0RstIsr` through `Wdg_Ins4RstIsr`. The reset interrupt entries call `Wdg_Lld_RstIrqHandler(0U)` through `Wdg_Lld_RstIrqHandler(4U)`. `Wdg0` through `Wdg2` also provide `WdgX_RstIrqHandler()`; `Wdg3`/`Wdg4` call `Wdg_Lld_RstIrqHandler(3U)/(4U)` directly. If normal WDG interrupts are also required, add `Wdg_InsXIntIsr` entries that call `Wdg_Lld_IrqHandler(0U)` through `Wdg_Lld_IrqHandler(4U)`.

```c
ISR(Wdg_Ins0RstIsr) {
    LogSync("Enter Wdg_Ins0RstIsr\\r\\n");
    Wdg_Lld_RstIrqHandler(0U);
}
ISR(Wdg_Ins1RstIsr) {
    LogSync("Enter Wdg_Ins1RstIsr\\r\\n");
    Wdg_Lld_RstIrqHandler(1U);
}
ISR(Wdg_Ins2RstIsr) {
    LogSync("Enter Wdg_Ins2RstIsr\\r\\n");
    Wdg_Lld_RstIrqHandler(2U);
}
ISR(Wdg_Ins3RstIsr) {
    LogSync("Enter Wdg_Ins3RstIsr\\r\\n");
    Wdg_Lld_RstIrqHandler(3U);
}
ISR(Wdg_Ins4RstIsr) {
    LogSync("Enter Wdg_Ins4RstIsr\\r\\n");
    Wdg_Lld_RstIrqHandler(4U);
}
```

#### 5.1.3 Interrupt Declaration, Registration, and Enablement

The reset interrupt handlers are defined in `HorizonISR.c`, but the interrupts cannot reach those handlers until the following four files are wired up in this order: function declaration, interrupt-number mapping, priority mask, and interrupt-table registration. After registration, `FreeRtos_Irq_Init()` installs and enables these interrupts and routes the SPI to the current Core0, so no additional `IROUTER` entries are needed in `main.c`.

##### `Os.h`

- File: `Target/Target_S600/Target-hobot-lite-freertos/target/FreeRtosOsHal/Os.h`
- Add function declarations for `Wdg_Ins0IntIsr/RstIsr` through `Wdg_Ins4IntIsr/RstIsr`:

```c
extern void Os_Isr_Wdg_Ins0IntIsr(void);
extern void Os_Isr_Wdg_Ins0RstIsr(void);
extern void Os_Isr_Wdg_Ins1IntIsr(void);
extern void Os_Isr_Wdg_Ins1RstIsr(void);
extern void Os_Isr_Wdg_Ins2IntIsr(void);
extern void Os_Isr_Wdg_Ins2RstIsr(void);
extern void Os_Isr_Wdg_Ins3IntIsr(void);
extern void Os_Isr_Wdg_Ins3RstIsr(void);
extern void Os_Isr_Wdg_Ins4IntIsr(void);
extern void Os_Isr_Wdg_Ins4RstIsr(void);
```

##### `ConfigInterrupts.h`

- File: `Target/Target_S600/Target-hobot-lite-freertos/target/FreeRtosOsHal/ConfigInterrupts.h`
- Define the interrupt-channel macros that map `Os_IntChannel_Wdg_InsX*` to the RDK S600 normal interrupt vectors `MCUSYS_WWDT0..4_INTR` and reset interrupt vectors `MCUSYS_WWDT0..4_SYS_RST_INTR`:

```c
#define Os_IntChannel_Wdg_Ins0IntIsr (MCUSYS_WWDT0_INTR)
#define Os_IntChannel_Wdg_Ins0RstIsr (MCUSYS_WWDT0_SYS_RST_INTR)
#define Os_IntChannel_Wdg_Ins1IntIsr (MCUSYS_WWDT1_INTR)
#define Os_IntChannel_Wdg_Ins1RstIsr (MCUSYS_WWDT1_SYS_RST_INTR)
#define Os_IntChannel_Wdg_Ins2IntIsr (MCUSYS_WWDT2_INTR)
#define Os_IntChannel_Wdg_Ins2RstIsr (MCUSYS_WWDT2_SYS_RST_INTR)
#define Os_IntChannel_Wdg_Ins3IntIsr (MCUSYS_WWDT3_INTR)
#define Os_IntChannel_Wdg_Ins3RstIsr (MCUSYS_WWDT3_SYS_RST_INTR)
#define Os_IntChannel_Wdg_Ins4IntIsr (MCUSYS_WWDT4_INTR)
#define Os_IntChannel_Wdg_Ins4RstIsr (MCUSYS_WWDT4_SYS_RST_INTR)
```

##### `Isr_cfg.h`

- File: `Target/Target_S600/Target-hobot-lite-freertos/target/FreeRtosOsHal/Isr_cfg.h`
- Add the `OS_IMASK_FOR_Wdg_InsX*` priority-mask macros:

```c
#define OS_IMASK_FOR_Wdg_Ins0IntIsr (8)
#define OS_IMASK_FOR_Wdg_Ins0RstIsr (8)
#define OS_IMASK_FOR_Wdg_Ins1IntIsr (8)
#define OS_IMASK_FOR_Wdg_Ins1RstIsr (8)
#define OS_IMASK_FOR_Wdg_Ins2IntIsr (8)
#define OS_IMASK_FOR_Wdg_Ins2RstIsr (8)
#define OS_IMASK_FOR_Wdg_Ins3IntIsr (8)
#define OS_IMASK_FOR_Wdg_Ins3RstIsr (8)
#define OS_IMASK_FOR_Wdg_Ins4IntIsr (8)
#define OS_IMASK_FOR_Wdg_Ins4RstIsr (8)
```

##### `Isr_Hal.c`

- File: `Target/Target_S600/Target-hobot-lite-freertos/target/FreeRtosOsHal/Isr_Hal.c`
- Register `Wdg_InsXIntIsr/RstIsr` in `Interrupt_McuConfigs[]` using the tuple `{interrupt number, handler, priority, enable flag}` and set them to `ENABLE`:

```c
{Os_IntChannel_Wdg_Ins0IntIsr, Os_Isr_Wdg_Ins0IntIsr, OS_IMASK_FOR_Wdg_Ins0IntIsr/8, ENABLE},
{Os_IntChannel_Wdg_Ins0RstIsr, Os_Isr_Wdg_Ins0RstIsr, OS_IMASK_FOR_Wdg_Ins0RstIsr/8, ENABLE},
{Os_IntChannel_Wdg_Ins1IntIsr, Os_Isr_Wdg_Ins1IntIsr, OS_IMASK_FOR_Wdg_Ins1IntIsr/8, ENABLE},
{Os_IntChannel_Wdg_Ins1RstIsr, Os_Isr_Wdg_Ins1RstIsr, OS_IMASK_FOR_Wdg_Ins1RstIsr/8, ENABLE},
{Os_IntChannel_Wdg_Ins2IntIsr, Os_Isr_Wdg_Ins2IntIsr, OS_IMASK_FOR_Wdg_Ins2IntIsr/8, ENABLE},
{Os_IntChannel_Wdg_Ins2RstIsr, Os_Isr_Wdg_Ins2RstIsr, OS_IMASK_FOR_Wdg_Ins2RstIsr/8, ENABLE},
{Os_IntChannel_Wdg_Ins3IntIsr, Os_Isr_Wdg_Ins3IntIsr, OS_IMASK_FOR_Wdg_Ins3IntIsr/8, ENABLE},
{Os_IntChannel_Wdg_Ins3RstIsr, Os_Isr_Wdg_Ins3RstIsr, OS_IMASK_FOR_Wdg_Ins3RstIsr/8, ENABLE},
{Os_IntChannel_Wdg_Ins4IntIsr, Os_Isr_Wdg_Ins4IntIsr, OS_IMASK_FOR_Wdg_Ins4IntIsr/8, ENABLE},
{Os_IntChannel_Wdg_Ins4RstIsr, Os_Isr_Wdg_Ins4RstIsr, OS_IMASK_FOR_Wdg_Ins4RstIsr/8, ENABLE},
```

#### 5.1.4 Enable Shell
- File: `Target/Target_S600/Target-hobot-lite-freertos/target/Target.h`
- Configuration: MCU0 defaults to `SHELL_ENABLE FALSE`; change it to `TRUE` for Shell-based testing.

```c
#define SHELL_ENABLE TRUE
```

#### 5.1.5 Enable Shell UART Input
- File: `Target/Target_S600/Target-hobot-lite-freertos/target/FreeRtosOsHal/Isr_Hal.c`
- Configuration: Register `Uart0_Isr` in `Interrupt_McuConfigs[]` with `ENABLE`; otherwise the MCU0 Shell can only print output and cannot receive UART input.

```c
{Os_IntChannel_Uart0_Isr, Os_Isr_Uart0_Isr, OS_IMASK_FOR_Uart0_Isr / 8, ENABLE},
```

:::note
On RDK S600, `Uart8` is the shared debug console for MCU0/MCU1. If MCU1 also registers and owns `Uart0_Isr`, input will be contended. When testing the MCU0 serial Shell, ensure only MCU0 owns this UART, or disable the MCU1 Shell/UART0 receive path.
:::
</DocScope>
