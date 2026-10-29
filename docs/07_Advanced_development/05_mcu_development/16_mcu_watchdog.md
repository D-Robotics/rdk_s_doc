---
sidebar_position: 16
---
# 7.5.17 MCU 看门狗

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 1. 简介

<DocScope products="RDK S100">
本用户文档旨在提供 WDG 驱动的相关信息，包括功能、配置参数、API。
文档每一处提及的 Wdgx，x 为索引，有效范围为0、1、2。
</DocScope>
<DocScope products="RDK S600">
本用户文档旨在提供 WDG 驱动的相关信息，包括功能、配置参数、API。
文档每一处提及的 Wdgx，x 为索引，有效范围为0、1、2、3、4。
</DocScope>

## 2. 概览
### 2.1 文件列表
#### Lowlevel 接口
这些是 Watchdog 底层驱动的实现和内部公共接口文件，一般用户不需要直接关注：

- McalCdd\Wdg\inc\Wdg_Lld.h
- McalCdd\Wdg\src\Wdg_Lld.c
- McalCdd\Wdg\inc\Wdg_Prv.h
- McalCdd\Wdg\src\Wdg_Common.c

#### Highlevel 接口

<DocScope products="RDK S100">
这些是用于用户调用的 API 实现文件，每一个 Wdg 的 instance 需要一份独立代码文件：

- McalCdd\Wdg\src\Wdg0.c
- McalCdd\Wdg\src\Wdg1.c
- McalCdd\Wdg\src\Wdg2.c
- McalCdd\Wdg\inc\Wdg0.h
- McalCdd\Wdg\inc\Wdg1.h
- McalCdd\Wdg\inc\Wdg2.h
</DocScope>
<DocScope products="RDK S600">
这些是用于用户调用的 API 实现文件，每一个 Wdg 的 instance 需要一份独立代码文件：

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

### 2.2 芯片内 WDG 与 PMIC WDG 的区别

芯片内 WDG 与 PMIC WDG 是互补的两层看门狗：芯片内 WDG 负责 MCU 内部监控和测试，PMIC WDG 作为板级兜底（fail-safe）；即使 MCU 软件异常导致无法正常喂狗，PMIC WDG 超时后仍可执行复位或保护。

RDK S100 的 MCU 侧存在两类看门狗，二者相互独立：

- **芯片内 WDG**：集成在 RDK S100 内部，默认未开启；需要时通过 WDG API 初始化并配置。
- **PMIC WDG**：位于外部 `MCUPWR` PMIC 内部，由 MCU 通过 I2C 喂狗。

| 项目 | 芯片内 WDG | PMIC WDG |
|---|---|---|
| 位置 | SoC 内部 | 外部 `MCUPWR` PMIC |
| 默认状态 | 默认未开启 | `MCU_RELEASE` 下使能，非 release 关闭；MCU1 固定关闭 |
| 控制方式 | MCU 寄存器控制 | MCU 通过 I2C 控制 |
| 喂狗方式 | 通过 WDG API 配置并喂狗 | MCU 周期任务通过 PMIC 驱动喂狗 |
| 复位/中断 | 支持普通中断和复位中断 | 超时由 PMIC 执行 fail-safe/复位 |

#### 驱动与配置文件

- **芯片内 WDG 驱动**
  - 公共底层驱动：`McalCdd/Wdg/src/Wdg_Lld.c`、`McalCdd/Wdg/inc/Wdg_Lld.h`。
  - 公共高层驱动：`McalCdd/Wdg/src/Wdg_Common.c`、`McalCdd/Wdg/inc/Wdg_Prv.h`。
  - 实例接口：`McalCdd/Wdg/src/Wdg0.c`、`Wdg1.c`、`Wdg2.c`，以及 `McalCdd/Wdg/inc/Wdg0.h`、`Wdg1.h`、`Wdg2.h`。
- **PMIC WDG 驱动**
  - 公共驱动：`McalCdd/Pmic/src/Wdg_Ext.c`、`McalCdd/Pmic/inc/Wdg_Ext.h`。
  - 公共底层驱动：`McalCdd/Pmic/src/Pmic_Lld_Wdg.c`、`McalCdd/Pmic/inc/Pmic_Lld_Wdg.h`。
  - RDK S100 设备驱动：`McalCdd/Pmic/devices/src/Pmic_Lld_McuPwrWdg.c`、`McalCdd/Pmic/devices/inc/Pmic_Lld_McuPwrWdg.h`。
- **芯片内 WDG 配置**
  - MCU0：`Config/McalCdd/gen_s100_sip_B/Wdg/src/Wdg_Cfg.c`，以及 `Wdg0_PBcfg.c`、`Wdg1_PBcfg.c`、`Wdg2_PBcfg.c`。
  - MCU1：`Config/McalCdd/gen_s100_sip_B_mcu1/Wdg/src/Wdg_Cfg.c`，以及 `Wdg0_PBcfg.c`、`Wdg1_PBcfg.c`、`Wdg2_PBcfg.c`。
- **PMIC WDG 配置**
  - MCU0：`Config/McalCdd/gen_s100_sip_B/PwrIf/src/PwrM_Cfg.c`。
  - MCU1：`Config/McalCdd/gen_s100_sip_B_mcu1/PwrIf/src/PwrM_Cfg.c`。
</DocScope>

<DocScope products="RDK S600" versions=">= 5.1.1">

### 2.2 芯片内 WDG 与 PMIC WDG 的区别

芯片内 WDG 与 PMIC WDG 是互补的两层看门狗：芯片内 WDG 负责 MCU 内部监控和测试，PMIC WDG 作为板级兜底（fail-safe）；即使 MCU 软件异常导致无法正常喂狗，PMIC WDG 超时后仍可执行复位或保护。

RDK S600 的 MCU 侧存在两类看门狗，二者相互独立：

- **芯片内 WDG**：集成在 RDK S600 内部，默认未开启；需要时通过 WDG API 初始化并配置。RDK S600 支持 `Wdg0`~`Wdg4` 共 5 个实例；当前 MCU0 默认配置挂载 `Wdg0`~`Wdg2`，MCU1 默认配置挂载 `Wdg0`~`Wdg2`。
- **PMIC WDG**：位于外部 `VR5510` PMIC 内部，由 MCU 通过 I2C 控制/喂狗。MCU0 侧默认使能，MCU1 侧 `VR5510` 设备级看门狗默认关闭。

| 项目 | 芯片内 WDG | PMIC WDG |
|---|---|---|
| 位置 | SoC 内部 | 外部 `VR5510` PMIC |
| 默认状态 | 默认未开启 | MCU0 默认使能，MCU1 `VR5510` 设备级默认关闭 |
| 控制方式 | MCU 寄存器控制 | MCU 通过 I2C 控制 |
| 喂狗方式 | 通过 WDG API 配置并喂狗 | MCU 周期任务通过 PMIC 驱动喂狗 |
| 复位/中断 | 支持普通中断和复位中断 | 超时由 PMIC 执行 fail-safe/复位 |

#### 驱动与配置文件

- **芯片内 WDG 驱动**
  - 公共底层驱动：`McalCdd/Wdg/src/Wdg_Lld.c`、`McalCdd/Wdg/inc/Wdg_Lld.h`。
  - 公共高层驱动：`McalCdd/Wdg/src/Wdg_Common.c`、`McalCdd/Wdg/inc/Wdg_Prv.h`。
  - 实例接口：`McalCdd/Wdg/src/Wdg0.c`、`Wdg1.c`、`Wdg2.c`、`Wdg3.c`、`Wdg4.c`，以及 `McalCdd/Wdg/inc/Wdg0.h`、`Wdg1.h`、`Wdg2.h`、`Wdg3.h`、`Wdg4.h`。
- **PMIC WDG 驱动**
  - 公共驱动：`McalCdd/Pmic/src/Wdg_Ext.c`、`McalCdd/Pmic/inc/Wdg_Ext.h`。
  - 公共底层驱动：`McalCdd/Pmic/src/Pmic_Lld_Wdg.c`、`McalCdd/Pmic/inc/Pmic_Lld_Wdg.h`。
  - RDK S600 设备驱动：`McalCdd/Pmic/devices/src/Pmic_Lld_Vr5510Wdg.c`、`McalCdd/Pmic/devices/inc/Pmic_Lld_Vr5510Wdg.h`。
- **芯片内 WDG 配置**
  - MCU0：`Config/McalCdd/gen_s600_md/Wdg/src/Wdg_Cfg.c`，以及 `Wdg0_PBcfg.c`、`Wdg1_PBcfg.c`、`Wdg2_PBcfg.c`、`Wdg3_PBcfg.c`、`Wdg4_PBcfg.c`。
  - MCU1：`Config/McalCdd/gen_s600_md_mcu1/Wdg/src/Wdg_Cfg.c`，以及 `Wdg0_PBcfg.c`、`Wdg1_PBcfg.c`、`Wdg2_PBcfg.c`、`Wdg3_PBcfg.c`、`Wdg4_PBcfg.c`。
- **PMIC WDG 配置**
  - MCU0：`Config/McalCdd/gen_s600_md/PwrIf/src/PwrM_Cfg.c`。
  - MCU1：`Config/McalCdd/gen_s600_md_mcu1/PwrIf/src/PwrM_Cfg.c`。
</DocScope>

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

<DocScope versions=">= 4.1.0">

#### 3.2.5 Wdg_Lld_SetRstCallback
| Service Name | Wdg_Lld_SetRstCallback |
|---|---|
| Syntax | Std_ReturnType Wdg_Lld_SetRstCallback(const Wdg_Lld_InstanceType Instance, Wdg_CallbackPtrType Callback) |
| Sync/Async | Synchronous |
| Reentrancy | Non Reentrant |
| Parameters (in) | Instance:Watchdog instance index; Callback:Reset interrupt callback, NULL_PTR can be used to clear |
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
| Parameters (in) | Instance:Watchdog instance index |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | None |
| Description | Handles the watchdog reset interrupt and invokes the callback registered by Wdg_Lld_SetRstCallback. |
| Available via | Wdg_Lld.h |
</DocScope>

### 3.3 中断处理

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

<DocScope versions=">= 4.1.0">

普通 WDG 中断和复位中断的处理链路如下：

| ISR | 处理函数 | 说明 |
|---|---|---|
| Wdg_InsXIntIsr | WdgX_IrqHandler | 普通 WDG 中断，最终调用 Wdg_Lld_IrqHandler |
| Wdg_InsXRstIsr | Wdg_Lld_RstIrqHandler | WDG 复位中断，最终调用 Wdg_Lld_SetRstCallback 注册的回调 |

:::note
`WdgX_RstIrqHandler()` 是 Target 工程提供的实例级入口，与 `Wdg_Lld_RstIrqHandler(X)` 等价；没有实例级入口的实例直接调用 `Wdg_Lld_RstIrqHandler()`。
:::
</DocScope>

### 3.4 临界区
使用`SchM_Enter_Wdg_ExclusiveZone_XX`和`SchM_Exit_Wdg_ExclusiveZone_XX`来定义进入和退出临界区的操作，WDG 驱动程序需要用户结合实际应用部署情况来处理临界区，其函数已在驱动中调用。

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

<DocScope products="RDK S600">

## 4. Acore 看门狗超时 MCU 处理流程

### 4.1 复位配置使能

在 Target 的 `main.c` 调用 `Wdg_Enable_RstConfig()`（实现见 `Wdg_Common.c`，声明见 `Wdg_Prv.h`），完成看门狗侧与 MCU 复位/通知链路相关的底层使能。

| Name | Description |
|---|---|
| Wdg_Enable_RstConfig | 复位配置 |

### 4.2 MCU 侧处理流程

Acore 侧看门狗超时触发中断送到 MCU0侧，由 MCU0侧在延时后发起复位，以便 Acore 打印栈等信息。

流程为 中断置标志 → 专用任务里延时 → 触发长复位，执行长复位的责任在 OS 任务。

| Name | Location | Description |
|---|---|---|
| 中断（入口） | Target\...\HorizonISR.c：ISR(Wdt_CfIntIsr) | 置 g_need_reset = 1（g_need_reset 在 McalCdd\Wdg\src\Wdg_Common.c），Os_Disable_Wdt_CfIntIsr()；与 IntRouter、ConfigInterrupts.h 绑定 |
| OS 任务（延时 + 长复位） | Target\...\HorizonTask.c：TASK(OsTask_SysCore_WDG_RST) | g_need_reset 为真时：日志 → vTaskDelay(MS_TO_TICK(5000))（约 5s）→ Rfchm_TriggerSocLongReset() 执行 SoC 长复位 |

</DocScope>

<DocScope products="RDK S100" versions=">= 4.1.0">

## 5. WDG 复位中断测试说明

本节说明在测试环境中如何验证 WDG 超时后的复位中断回调路径。驱动侧已提供复位中断回调接口，相关 API 参见 3.2.5 和 3.2.6，中断处理链路参见 3.3。

### 测试环境配置

以下配置用于使测试代码所在核能够控制 WDG 并接收复位中断。

#### 复位中断处理函数
- 文件：`Target/Target_S100/Target-hobot-lite-freertos/target/HorizonISR.c`
- 位置：`Wdg_Ins0RstIsr`、`Wdg_Ins1RstIsr`、`Wdg_Ins2RstIsr`。
- 默认情况：复位中断入口调用的是 `WdgX_IrqHandler()`，不会进入驱动复位中断回调路径。
- 测试配置：将三个复位中断入口改为调用 `WdgX_RstIrqHandler()`，才能进入驱动复位中断回调路径。

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

#### WDG Core 绑定
- 文件：`Config/McalCdd/gen_s100_sip_B/Wdg/src/Wdg_Cfg.c`
- 位置：`Wdg_CoreIdConfig` 数组。
- 配置：将需要测试的 WDG 实例绑定到测试代码运行的核。

```c
const uint16 Wdg_CoreIdConfig[WDG_NUM] =
{
    0U,
    0U,
    0U,
};
```

#### 中断路由
- 文件：`Target/Target_S100/Target-hobot-lite-freertos/target/main.c`
- 位置：`FreeRtos_Irq_Init();` 之后。
- 配置：将 WDG 中断和复位中断固定路由到测试代码运行的核。

```c
OS_R52_GICD_IROUTER[MCUSYS_WWDT0_SYS_RST_INTR] = WDG_IRQ_AFFINITY_NS | 0U;
OS_R52_GICD_IROUTER[MCUSYS_WWDT0_INTR]         = WDG_IRQ_AFFINITY_NS | 0U;
OS_R52_GICD_IROUTER[MCUSYS_WWDT1_SYS_RST_INTR] = WDG_IRQ_AFFINITY_NS | 0U;
OS_R52_GICD_IROUTER[MCUSYS_WWDT1_INTR]         = WDG_IRQ_AFFINITY_NS | 0U;
OS_R52_GICD_IROUTER[MCUSYS_WWDT2_SYS_RST_INTR] = WDG_IRQ_AFFINITY_NS | 0U;
OS_R52_GICD_IROUTER[MCUSYS_WWDT2_INTR]         = WDG_IRQ_AFFINITY_NS | 0U;
```

#### Shell 开启
- 文件：`Target/Target_S100/Target-hobot-lite-freertos/target/Target.h`
- 位置：`SHELL_ENABLE` 宏定义处。
- 配置：如果测试命令通过 Shell 执行，需要开启 Shell。

```c
#define SHELL_ENABLE TRUE
```
</DocScope>

<DocScope products="RDK S600" versions=">= 5.1.1">

## 5. WDG 复位中断测试说明

本节说明在测试环境中如何验证 WDG 超时后的复位中断回调路径。驱动侧已提供复位中断回调接口，相关 API 参见 3.2.5 和 3.2.6，中断向量参见 3.3。

当前 MCU0 Target 工程已接入 `Wdg_InsXIntIsr`/`Wdg_InsXRstIsr` 复位中断测试路径；若基于未改动的源码测试，需要按下面的测试环境配置接入后再进行测试。

### 测试环境配置

以下配置用于在 RDK S600 MCU0 的 Core0 上通过 Shell 测试 `Wdg0`~`Wdg4` 的复位中断回调路径。驱动层已支持 `Wdg0`、`Wdg1`、`Wdg2`、`Wdg3`、`Wdg4` 复位中断接口；当前 RDK S600 MCU0 Target 工程已按以下配置接入 WDG 中断/复位中断入口，若基于未改动的源码测试，需按相同步骤检查或补全。

#### WDG 配置扩展

RDK S600 MCU0 测试配置已将 WDG 实例个数从 3 个扩展为 5 个，补齐 `Wdg3/4` 的超时、模式和状态配置，并把 5 个实例都绑定到 MCU0 Core0，确保测试代码所在核能接收对应中断。

##### `Wdg_Cfg_Defines.h`

- 文件：`Config/McalCdd/gen_s600_md/Wdg/inc/Wdg_Cfg_Defines.h`
- 将 `WDG_NUM` 由 `3U` 改为 `5U`。

```c
#define WDG_NUM            (5U)
```

- 新增 `WDG3/4` 超时参数：

```c
#define WDG3_INITIAL_TIMEOUT ((uint16)5000)
#define WDG3_MAX_TIMEOUT ((uint16)65535)
#define WDG4_INITIAL_TIMEOUT ((uint16)5000)
#define WDG4_MAX_TIMEOUT ((uint16)65535)
```

- `WDG_TIMEOUT_VALUE_ARRAY`、`WDG_INIT_LAST_MODE_ARRAY`、`WDG_INIT_STATE_ARRAY` 各增加 2 个元素，分别对应 `Wdg3`、`Wdg4`，数组长度由 3 变为 5：

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

- 文件：`Config/McalCdd/gen_s600_md/Wdg/src/Wdg_Cfg.c`
- `Wdg_Config[]` 增加 `&Wdg_Config_3`、`&Wdg_Config_4`。
- `Wdg_CfgInitialTimeout[]`、`Wdg_CfgMaxTimeout[]` 增加 `WDG3/4` 超时宏。

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

- `Wdg_CoreIdConfig[]` 增加到 5 个元素。测试运行在 MCU0 Core0 时全部填 `0U`，使 5 个 WDG 均绑定到 Core0：

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

#### 复位中断处理函数
- 文件：`Target/Target_S600/Target-hobot-lite-freertos/target/HorizonISR.c`
- 配置：新增 `Wdg_Ins0RstIsr`~`Wdg_Ins4RstIsr`，复位中断入口调用 `Wdg_Lld_RstIrqHandler(0U)`~`Wdg_Lld_RstIrqHandler(4U)`。`Wdg0`~`Wdg2` 已有 `WdgX_RstIrqHandler()` 也可使用；`Wdg3`/`Wdg4` 直接调用 `Wdg_Lld_RstIrqHandler(3U)/(4U)`。普通 WDG 中断如需使用，可同时新增 `Wdg_InsXIntIsr` 并调用 `Wdg_Lld_IrqHandler(0U)`~`Wdg_Lld_IrqHandler(4U)`。

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

#### 中断声明、注册与使能

复位中断处理函数定义在 `HorizonISR.c`，但要让中断真正进入处理函数，还需要按“函数声明 → 中断号映射 → 优先级掩码 → 注册到中断表”的链路补全下面 4 个文件。完成注册后，`FreeRtos_Irq_Init()` 会安装并使能这些中断，并将 SPI 路由到当前 Core0，无需在 `main.c` 额外写 `IROUTER`。

##### `Os.h`

- 文件：`Target/Target_S600/Target-hobot-lite-freertos/target/FreeRtosOsHal/Os.h`
- 增加 `Wdg_Ins0IntIsr/RstIsr` ~ `Wdg_Ins4IntIsr/RstIsr` 的函数声明：

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

- 文件：`Target/Target_S600/Target-hobot-lite-freertos/target/FreeRtosOsHal/ConfigInterrupts.h`
- 定义中断通道宏，将 `Os_IntChannel_Wdg_InsX*` 映射到 RDK S600 的普通中断向量 `MCUSYS_WWDT0..4_INTR` 和复位中断向量 `MCUSYS_WWDT0..4_SYS_RST_INTR`：

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

- 文件：`Target/Target_S600/Target-hobot-lite-freertos/target/FreeRtosOsHal/Isr_cfg.h`
- 增加 `OS_IMASK_FOR_Wdg_InsX*` 优先级掩码宏：

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

- 文件：`Target/Target_S600/Target-hobot-lite-freertos/target/FreeRtosOsHal/Isr_Hal.c`
- 在 `Interrupt_McuConfigs[]` 中按 `{中断号, 处理函数, 优先级, 使能标志}` 注册 `Wdg_InsXIntIsr/RstIsr` 并置 `ENABLE`：

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

#### Shell 开启
- 文件：`Target/Target_S600/Target-hobot-lite-freertos/target/Target.h`
- 配置：MCU0 默认 `SHELL_ENABLE FALSE`，测试时改为 `TRUE`。

```c
#define SHELL_ENABLE TRUE
```

#### Shell 串口输入使能
- 文件：`Target/Target_S600/Target-hobot-lite-freertos/target/FreeRtosOsHal/Isr_Hal.c`
- 配置：在 `Interrupt_McuConfigs[]` 注册 `Uart0_Isr` 并置 `ENABLE`，否则 MCU0 Shell 只能输出、无法接收串口输入。

```c
{Os_IntChannel_Uart0_Isr, Os_Isr_Uart0_Isr, OS_IMASK_FOR_Uart0_Isr / 8, ENABLE},
```

:::note
RDK S600 的 `Uart8` 为 MCU0/MCU1 共用调试串口。若 MCU1 同时注册并占用 `Uart0_Isr`，会造成输入竞争；测试 MCU0 串口 Shell 时需确保仅 MCU0 占用该串口，或关闭 MCU1 的 Shell/UART0 接收。
:::
</DocScope>
