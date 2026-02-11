---
sidebar_position: 15
---
# TIMER使用指南

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

## 硬件支持

目前RDK S100有6个Instance，每个Instance有4个32bit计数的Channel，每个Channel都是一个定时器，可用于定时等功能。

定时器(Timer)的具体配置信息在如下宏中定义:

```c
//路径: mcu/McalCdd/Gpt/inc/Gpt_Lld.h

/* instance的数量 */
#define GPT_LLD_INSTANCE_NUM                  (6U)

/* 每个instance的channel数量 */
#define GPT_LLD_CHANNEL_NUM_PER_INSTANCE      (4U)

/* 每个channel的大小 */
#define GPT_LLD_CHANNEL_SIZE                  (0x14U)

/* 每个instance的大小 */
#define GPT_LLD_INSTANCE_SIZE                 (0x10000U)

/* 每个instance的寄存器基地址 */
#define GPT_LLD_BASE_OFFSET(n)                ((0X22310000U) + (GPT_LLD_INSTANCE_SIZE) * (n))

/* 每个channel的起始地址 */
#define GPT_LLD_CHANNEL_OFFEST(n, m)          ((GPT_LLD_BASE_OFFSET(n)) + (GPT_LLD_CHANNEL_SIZE) * (m))
```

定时器的每个Channel均能触发中断，Channel对应的中断号如下所示：

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

## 软件驱动

代码路径：

- McalCdd\Gpt\src\Gpt_Lld.c
- McalCdd\Gpt\inc\Gpt_Lld.h
- McalCdd\Gpt\inc\Gpt_Types.h
- McalCdd\Gpt\inc\Gpt.h
- McalCdd\Gpt\src\Gpt.c
- Config\McalCdd\gen_xxx\Gpt\inc\Gpt_Cfg.h
- Config\McalCdd\gen_xxx\Gpt\inc\Gpt_PBcfg.h
- Config\McalCdd\gen_xxx\Gpt\src\Gpt_PBcfg.c

## 应用sample

sample 程序默认使用定时器2的通道2（Timer2 Channel2），S100上的定时器输入时钟默认配置为 200MHz。
定时器只支持向下计数，无法支持设置一个比较值然后计数比较的硬件功能，默认工作在Continue模式下，即每次都会自动重装计数值。如果需要One-Shot的形式，则需要在中断函数中停止Timer，然后自己根据需要重配计数值。定时器最大支持的计数值为2^width-1，其中width表示定时器的位宽。定时器支持8、16、32bit三种格式的位宽，默认使用32bit。

### 配置说明

1. sample代码在MCU1上运行，需要先配置 `Gpt_ConfigType` 结构体用于模块初始化

```c
Config/McalCdd/gen_xxx/Gpt/src/Gpt_PBcfg.c
```

相关结构体定义如下：

```c
/* 通道配置结构体 */
typedef struct
{
    Gpt_ChannelType u8ChannelTotalNum; /* 通道总数  */
    Gpt_PerChanneInfoType (*pChannelCfg)[]; /* 通道配置信息数组 */
    const uint8 (*pChannelId2IdxMap)[]; /* 通道 ID 到数组下标的映射（从 0 开始） */
} Gpt_ConfigType;

/* 通道配置类型 */
typedef struct
{
    Gpt_NotificationType pfChNotification; /* 回调函数指针 */
    Gpt_ValueType u32ChMaxTickVal; /* 通道支持的最大 tick 值 */
    Gpt_ChannelModeType eChMode; /* 通道模式（CONTINUOUS / ONESHOT） */
    uint8 u8HwInstance; /* Instance ID */
    uint8 u8HwChannel; /* Channel ID */
} Gpt_PerChanneInfoType;

```

2. sample使用的定时器为Timer2_Channel2，需要将该通道的配置信息添加到 `pChannelCfg`数组中；并在 `pChannelId2IdxMap`中添加Channel ID -> 下标映射；将宏 `GPT_CHANNEL_TOTAL_NUM`的值加1，以反映新增通道数量。
3. 配置对应通道的回调函数，当定时器中断触发后，驱动会自动根据Instance ID和Channel ID调用 `Gpt_PerChanneInfoType` 中注册的回调函数。配置方式如下所示：

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

### 应用程序接口

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

### 使用示例

命令语法：

```shell
timer_interrupt <operation> <load/type> [irq]
```

- operation：指定要执行的操作
  - on - 启动定时器通道
  - off - 关闭定时器通道
  - gettime - 读取当前定时器剩余计数值
- load: 定时器装载值（计数初值），仅在 on 操作时有效
  在S100上默认的时钟频率为200MHz，时钟频率和装载值的关系如下：
  ```c
  load_value = timer_clk(Hz) × period(s)
  ```

  例如：timer_clk = 200MHz时，计时1s对应的load_value为200000000
  此外，load还支持以秒/毫秒/微秒为单位的时间输入
- type：读取剩余时间，仅在 gettime 操作下有效
  - 0 - 读取寄存器装载值
  - 1 - 以秒为单位读取剩余时间
  - 2 - 以毫秒为单位读取剩余时间
  - 3 - 以微秒为单位读取剩余时间
- irq：
  - 0 - 关闭定时器中断
  - 1 - 启动定时器中断

**示例1**：启动定时器，并设置周期为1s的定时中断

```shell
timer_interrupt on 1s 1
```

输出结果:

![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/mcu_timer_case1.png)

**示例2**：启动定时器，并设置周期为100us的定时中断

```shell
timer_interrupt on 100us 1
```

输出结果:

![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/mcu_timer_case2.png)

**示例3**：启动定时器，并获取当前剩余计数值

设置计数周期为20秒

```shell
timer_interrupt on 20s 0
```

按照不同的类型读取剩余时间

```shell
timer_interrupt gettime 0

timer_interrupt gettime 1

timer_interrupt gettime 2

timer_interrupt gettime 3
```

输出结果:

![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/mcu_timer_case3.png)
