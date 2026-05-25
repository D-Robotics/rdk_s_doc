---
sidebar_position: 15
---
# 7.5.16 TIMER User Guide

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## Hardware Support

<DocScope products="RDK S100">
RDK S100 currently has 6 Instances. Each Instance has 4 Channels with 32-bit counters. Each Channel is a timer that can be used for timing and other functions.
</DocScope>
<DocScope products="RDK S600">
RDK S600 currently has 10 Instances. Each Instance has 4 Channels with 32-bit counters. Each Channel is a timer that can be used for timing and other functions.
</DocScope>

Timer configuration is defined in the following macros:

```c
// Path: mcu/McalCdd/Gpt/inc/Gpt_Lld.h

/* Number of instances */
#if ((SOC_TYPE_S100 == SOC_TYPE) || (SOC_TYPE_S100P == SOC_TYPE))
#define GPT_LLD_INSTANCE_NUM                  (6U)
#endif
#if ((SOC_TYPE == SOC_TYPE_S600) || (SOC_TYPE == SOC_TYPE_S300))
#define GPT_LLD_INSTANCE_NUM                  (10U)
#endif

/* Number of channels per instance */
#define GPT_LLD_CHANNEL_NUM_PER_INSTANCE      (4U)

/* Size of each channel */
#define GPT_LLD_CHANNEL_SIZE                  (0x14U)

/* Size of each instance */
#define GPT_LLD_INSTANCE_SIZE                 (0x10000U)

/* Register base address of each instance */
#if ((SOC_TYPE_S100 == SOC_TYPE) || (SOC_TYPE_S100P == SOC_TYPE))
#define GPT_LLD_BASE_OFFSET(n)                ((0X22310000U) + (GPT_LLD_INSTANCE_SIZE) * (n))
#endif
#if ((SOC_TYPE == SOC_TYPE_S600) || (SOC_TYPE == SOC_TYPE_S300))
#define GPT_LLD_BASE_OFFSET(n)                ((0X23570000U) + (GPT_LLD_INSTANCE_SIZE) * (n))
#endif

/* Start address of each channel */
#define GPT_LLD_CHANNEL_OFFEST(n, m)          ((GPT_LLD_BASE_OFFSET(n)) + (GPT_LLD_CHANNEL_SIZE) * (m))
```

Each Channel of the timer can trigger an interrupt. The interrupt numbers for each Channel are shown below:

<DocScope products="RDK S100">

| ISR Name       | Hardware Interrupt Vector |
| :------------- | :------------------------ |
| Gpt_Ins0Ch0Isr | 79                        |
| Gpt_Ins0Ch1Isr | 80                        |
| Gpt_Ins0Ch2Isr | 81                        |
| Gpt_Ins0Ch3Isr | 82                        |
| Gpt_Ins1Ch0Isr | 83                        |
| Gpt_Ins1Ch1Isr | 84                        |
| Gpt_Ins1Ch2Isr | 85                        |
| Gpt_Ins1Ch3Isr | 86                        |
| Gpt_Ins2Ch0Isr | 87                        |
| Gpt_Ins2Ch1Isr | 88                        |
| Gpt_Ins2Ch2Isr | 89                        |
| Gpt_Ins2Ch3Isr | 90                        |
| Gpt_Ins3Ch0Isr | 91                        |
| Gpt_Ins3Ch1Isr | 92                        |
| Gpt_Ins3Ch2Isr | 93                        |
| Gpt_Ins3Ch3Isr | 94                        |
| Gpt_Ins4Ch0Isr | 95                        |
| Gpt_Ins4Ch1Isr | 96                        |
| Gpt_Ins4Ch2Isr | 97                        |
| Gpt_Ins4Ch3Isr | 98                        |
| Gpt_Ins5Ch0Isr | 99                        |
| Gpt_Ins5Ch1Isr | 100                       |
| Gpt_Ins5Ch2Isr | 101                       |
| Gpt_Ins5Ch3Isr | 102                       |

</DocScope>
<DocScope products="RDK S600">

| ISR Name       | Hardware Interrupt Vector |
| :------------- | :------------------------ |
| Gpt_Ins0Ch0Isr | 105                       |
| Gpt_Ins0Ch1Isr | 106                       |
| Gpt_Ins0Ch2Isr | 107                       |
| Gpt_Ins0Ch3Isr | 108                       |
| Gpt_Ins1Ch0Isr | 109                       |
| Gpt_Ins1Ch1Isr | 110                       |
| Gpt_Ins1Ch2Isr | 111                       |
| Gpt_Ins1Ch3Isr | 112                       |
| Gpt_Ins2Ch0Isr | 113                       |
| Gpt_Ins2Ch1Isr | 114                       |
| Gpt_Ins2Ch2Isr | 115                       |
| Gpt_Ins2Ch3Isr | 116                       |
| Gpt_Ins3Ch0Isr | 117                       |
| Gpt_Ins3Ch1Isr | 118                       |
| Gpt_Ins3Ch2Isr | 119                       |
| Gpt_Ins3Ch3Isr | 120                       |
| Gpt_Ins4Ch0Isr | 121                       |
| Gpt_Ins4Ch1Isr | 122                       |
| Gpt_Ins4Ch2Isr | 123                       |
| Gpt_Ins4Ch3Isr | 124                       |
| Gpt_Ins5Ch0Isr | 125                       |
| Gpt_Ins5Ch1Isr | 126                       |
| Gpt_Ins5Ch2Isr | 127                       |
| Gpt_Ins5Ch3Isr | 128                       |
| Gpt_Ins6Ch0Isr | 129                       |
| Gpt_Ins6Ch1Isr | 130                       |
| Gpt_Ins6Ch2Isr | 131                       |
| Gpt_Ins6Ch3Isr | 132                       |
| Gpt_Ins7Ch0Isr | 133                       |
| Gpt_Ins7Ch1Isr | 134                       |
| Gpt_Ins7Ch2Isr | 135                       |
| Gpt_Ins7Ch3Isr | 136                       |
| Gpt_Ins8Ch0Isr | 137                       |
| Gpt_Ins8Ch1Isr | 138                       |
| Gpt_Ins8Ch2Isr | 139                       |
| Gpt_Ins8Ch3Isr | 140                       |
| Gpt_Ins9Ch0Isr | 141                       |
| Gpt_Ins9Ch1Isr | 142                       |
| Gpt_Ins9Ch2Isr | 143                       |
| Gpt_Ins9Ch3Isr | 144                       |

</DocScope>

## Software Driver

Code paths:

- McalCdd\Gpt\src\Gpt_Lld.c
- McalCdd\Gpt\inc\Gpt_Lld.h
- McalCdd\Gpt\inc\Gpt_Types.h
- McalCdd\Gpt\inc\Gpt.h
- McalCdd\Gpt\src\Gpt.c
- Config\McalCdd\gen_xxx\Gpt\inc\Gpt_Cfg.h
- Config\McalCdd\gen_xxx\Gpt\inc\Gpt_PBcfg.h
- Config\McalCdd\gen_xxx\Gpt\src\Gpt_PBcfg.c


## Application Sample

<DocScope products="RDK S100">
The sample program uses Timer2 Channel2 by default. The timer input clock on S100 is configured to 200 MHz by default.
</DocScope>
<DocScope products="RDK S600">
The sample program uses Timer2 Channel2 by default. The timer input clock on S600 is configured to 40 MHz by default.
</DocScope>
The timer supports down-counting only and does not support hardware compare-match functionality. It works in Continuous mode by default, meaning the count value is automatically reloaded each time. For One-Shot behavior, stop the Timer in the interrupt handler and reconfigure the count value as needed. The maximum supported count value is 2^width - 1, where width is the timer bit width. The timer supports 8-, 16-, and 32-bit widths; 32-bit is used by default.

### Configuration

1. The sample code runs on MCU1. Configure the `Gpt_ConfigType` structure first for module initialization:

```c
Config/McalCdd/gen_xxx/Gpt/src/Gpt_PBcfg.c
```

Related structure definitions:

```c
/* Channel configuration structure */
typedef struct
{
    Gpt_ChannelType u8ChannelTotalNum; /* Total number of channels */
    Gpt_PerChanneInfoType (*pChannelCfg)[]; /* Channel configuration array */
    const uint8 (*pChannelId2IdxMap)[]; /* Channel ID to array index mapping (starting from 0) */
} Gpt_ConfigType;

/* Channel configuration type */
typedef struct
{
    Gpt_NotificationType pfChNotification; /* Callback function pointer */
    Gpt_ValueType u32ChMaxTickVal; /* Maximum tick value supported by the channel */
    Gpt_ChannelModeType eChMode; /* Channel mode (CONTINUOUS / ONESHOT) */
    uint8 u8HwInstance; /* Instance ID */
    uint8 u8HwChannel; /* Channel ID */
} Gpt_PerChanneInfoType;

```

2. The sample uses Timer2_Channel2. Add the channel configuration to the `pChannelCfg` array; add the Channel ID → index mapping in `pChannelId2IdxMap`; increment the `GPT_CHANNEL_TOTAL_NUM` macro by 1 to reflect the new channel count.
3. Configure the callback for the corresponding channel. When a timer interrupt occurs, the driver automatically calls the callback registered in `Gpt_PerChanneInfoType` based on Instance ID and Channel ID. Configuration example:

```c

void Timer2ch2_Cbk_GptNotification(void)
{
	LogNotice("Enter Timer2ch2_Cbk_GptNotification\r\n");
	/* User code */
}

Gpt_PerChanneInfoType Gpt_ChannelConfig[GPT_CHANNEL_TOTAL_NUM] =
{
    {
        &Timer2ch2_Cbk_GptNotification,
        (Gpt_ValueType)(4000000000U),
        (GPT_CHANNEL_MODE_CONTINUOUS),
        2,
        2,
    }
};
```

### Application Programming Interface

- Gpt_Init

```c
/**
 * @brief   Initializes the GPT driver.
 *
 * @param[in] ConfigPtr: Pointer to a selected Gpt configuration.
 * @param[out] None
 *
 * @retval None
 */
void Gpt_Init(const Gpt_ConfigType * ConfigPtr)
```

- Gpt_StartTimer

```c
/**
 * @brief  Starts a timer channel.
 *
 * @param[in] Channel: Numeric identifier of the GPT channel
 * @param[in] Value: Target time in number of ticks
 * @param[out] None
 *
 * @retval None
 */
void Gpt_StartTimer(Gpt_ChannelType Channel, Gpt_ValueType Value)
```

- Gpt_DeInit

```c
/**
 * @brief   Deinitializes the GPT driver.
 *
 * @param[in] None
 * @param[out] None
 *
 * @retval None
 * @design
 */
void Gpt_DeInit(void)
```

- Gpt_StartTimer_S

```c
/**
 * @brief   Starts a timer channel.
 *
 * @param[in] Channel: Numeric identifier of the GPT channel
 * @param[in] Value: Target time in number of seconds
 * @param[out] None
 *
 * @retval None
 */
void Gpt_StartTimer_S(Gpt_ChannelType Channel, Gpt_ValueType Seconds)
```

- Gpt_StartTimer_MS

```c
/**
 * @brief   Starts a timer channel.
 *
 * @param[in] Channel: Numeric identifier of the GPT channel
 * @param[in] Value: Target time in number of milliseconds
 * @param[out] None
 *
 * @retval None
 */
void Gpt_StartTimer_MS(Gpt_ChannelType Channel, Gpt_ValueType Milliseconds)
```

- Gpt_StartTimer_US

```c
/**
 * @brief   Starts a timer channel.
 *
 * @param[in] Channel: Numeric identifier of the GPT channel
 * @param[in] Value: Target time in number of microseconds
 * @param[out] None
 *
 * @retval None
 */
void Gpt_StartTimer_US(Gpt_ChannelType Channel, Gpt_ValueType Microseconds)
```

- Gpt_StopTimer

```c
/**
 * @brief   Stops a timer channel.
 *
 * @param[in] Channel: Numeric identifier of the GPT channel
 * @param[out] None
 *
 * @retval None
 */
void Gpt_StopTimer(Gpt_ChannelType Channel)
```

- Gpt_EnableNotification

```c
/**
 * @brief   Enables the interrupt notification for a channel (relevant in normal mode).
 *
 * @param[in] Channel: Numeric identifier of the GPT channel
 * @param[out] None
 *
 * @retval None
 */
void Gpt_EnableNotification(Gpt_ChannelType Channel)
```

- Gpt_DisableNotification

```c
/**
 * @brief   Disables the interrupt notification for a channel (relevant in normal mode).
 *
 * @param[in] Channel: Numeric identifier of the GPT channel
 * @param[out] None
 *
 * @retval None
 */
void Gpt_DisableNotification(Gpt_ChannelType Channel)
```

- Gpt_GetTimeRemaining

```c
/**
 * @brief   Returns the time remaining until the target time is reached.
 *
 * @param[in] Channel: Numeric identifier of the GPT channel
 * @param[out] None
 *
 * @retval None
 */
/*coverity[misra_c_2012_rule_8_7_violation:SUPPRESS] ## violation reason SYSSW_V_8.7_01*/
Gpt_ValueType Gpt_GetTimeRemaining(Gpt_ChannelType Channel)
```

### Usage Example

Command syntax:

```shell
timer_interrupt <operation> <load/type> [irq]
```

- operation: Specifies the operation to perform
    - on - Start the timer channel
    - off - Stop the timer channel
    - gettime - Read the current remaining count value
- load: Timer reload value (initial count), valid only for the on operation
    <DocScope products="RDK S100">
    On S100, the default clock frequency is 200 MHz. The relationship between clock frequency and load value is:
    </DocScope>
    <DocScope products="RDK S600">
    On S600, the default clock frequency is 40 MHz. The relationship between clock frequency and load value is:
    </DocScope>
    ```c
    load_value = timer_clk(Hz) × period(s)
    ```
    For example: when timer_clk = 200 MHz, a 1 s period corresponds to load_value = 200000000.
    In addition, load also supports time input in seconds/milliseconds/microseconds.
- type: Read remaining time, valid only for the gettime operation
    - 0 - Read the register reload value
    - 1 - Read remaining time in seconds
    - 2 - Read remaining time in milliseconds
    - 3 - Read remaining time in microseconds
- irq:
    - 0 - Disable timer interrupt
    - 1 - Enable timer interrupt

**Example 1**: Start the timer with a 1 s periodic interrupt

```shell
timer_interrupt on 1s 1
```

Output:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/mcu_timer_case1.png" alt="" style={{ width: '100%' }} />

**Example 2**: Start the timer with a 100 us periodic interrupt

```shell
timer_interrupt on 100us 1
```

Output:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/mcu_timer_case2.png" alt="" style={{ width: '100%' }} />

**Example 3**: Start the timer and read the current remaining count value

Set the count period to 20 seconds:

```shell
timer_interrupt on 20s 0
```

Read remaining time with different types:

```shell
timer_interrupt gettime 0

timer_interrupt gettime 1

timer_interrupt gettime 2

timer_interrupt gettime 3
```

Output:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/mcu_timer_case3.png" alt="" style={{ width: '100%' }} />
