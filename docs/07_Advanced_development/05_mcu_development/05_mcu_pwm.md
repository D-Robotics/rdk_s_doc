---
sidebar_position: 5
---

# 7.5.6 PWM使用指南


```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```


## 硬件支持



- 每个通道都是独立的，支持irq requset和dma requset
- 支持配置两种工作模式，通用工作模式（PWM脉冲输出），输入捕获模式。
- 每个通道有自己独立的时钟分频寄存器
- 每个IP所有通道共享一个中断
- 当目标边沿或者脉冲类型到来的时候，会触发中断或者dma req
- 支持DMA更新period和duty
- 支持周期边沿对齐方式设置，可以设置为边沿对齐或者中心对齐
- 支持针对每个PWM通道配置其周期和占空比，需要满足如下限制：
    - 周期配置粒度为clk_PWM，即PWM外设时钟，最大时钟计数值为：4294967295。

S600和S100的IP配置如下：

| 平台 | PWM IP数量 | 每个IP的通道数 | 总通道数 |
|------|------------|----------------|----------|
| S600 | 3个        | 12个Channel    | 36个Channel |
| S100 | 1个        | 12个Channel    | 12个Channel |

## 软件驱动

- 支持CPU更新PWM通道的周期和占空比
- 支持DMA更新PWM通道的周期和占空比
- 支持设置开启和关闭PWM中断，设置PWM通道的中断函数，支持中断类型：上升沿，下降沿，双边沿
- 读取PWM输出信号的内部状态并将其返回
- 支持多通道同步输出


## 代码路径

# PWM 模块相关文件说明

- `Config/McalCdd/gen_xxx/Pwm/src/Pwm_PBCfg.c`：正常模式下 PWM 的预编译配置源文件，包含通道和实例的具体配置参数（如周期、占空比、极性等）。
- `Config/McalCdd/gen_xxx/Pwm/inc`：预编译配置头文件，定义宏开关。
- `McalCdd/Pwm/src/Pwm_Lld.c`：底层驱动实现文件，直接操作硬件寄存器，提供底层接口。
- `McalCdd/Pwm/src/Pwm.c`：上层驱动逻辑实现，封装API 接口，并处理错误检测、状态管理等控制逻辑。
- `McalCdd/Pwm/inc/Pwm_Lld.h`：底层驱动头文件，声明底层函数原型、结构体和枚举类型。
- `McalCdd/Pwm/inc/Pwm_Types.h`：定义通用数据类型、结构体和回调函数指针类型，供上下层共享使用。
- `McalCdd/Pwm/inc/Pwm.h`：主头文件，声明高层 API和核心结构体。
- `samples/Pwm/inc/Pwm_PBCfg.h`：Pwm测试sample头文件
- `samples/Pwm/src/Pwm_test.c`：Pwm测试sample源文件。

## 重要配置说明

PWM驱动中的配置源文件是`Pwm_PBCfg.c`，支持对每个channel单独配置，S600和S100的驱动和配置兼容，以下以S600为例。

1. `Pwm_HwChannelConfig_PB` 包含PWM的具体硬件配置，部分配置在pwm初始化时就会立即生效
```c
static Pwm_Lld_ChannelConfigType Pwm_HwChannelConfig_PB[PWM_HW_CONF_MODS_PB][12] = {
    {
        {
            /**< pwm hardware channel PwmHwChId4 */
            .HwChannelId = PwmHwChId4,
            /**< pwm hardware ip id 0 */
            .HwIpId = 0,
            /**< pwm clear mode */
            .ClearMode = FALSE,
            /**< pwm channel clock ratio*/
            .ClockRatio = 0,
            /**< pwm period*/
            .Period = 9900000,
            /**< pwm polarity*/
            .Polarity = PWM_HIGH,
            /**< pwm duty cycle*/
            .DutyCycle = 4950000,
            /**< pwm edge align mode */
            .EdgeAlign = PWM_LLD_GEN_ALIGN_EDGE,
            /**< pwm edge mode */
            .EdgeMode = PWM_LLD_EDGEMODE_RISING,
            /**< hardware triger mask */
            .HwTrigMask = TRUE,
            /**< pwm hardware triger width*/
            .HwTrigWidth = 0,
            /**< the switch of isr notification*/
            .NotificationEnable = FALSE,
            /**< the callback of isr notification */
            .Notification = NULL_PTR,
            /**< the switch of dma complete notification*/
            .DmaCpltCallbackEnable = FALSE,
            /**< the callback of dma complete notification */
            .DmaCpltCallback = NULL_PTR,
        },
        .......
```

2. `Pwm_Channels_PB` 结构体数组定义了逻辑PWM通道与底层硬件通道之间的映射关系; `Pwm_HwChannelConfig_PB`结构体数组定义了每个PWM通道的默认硬件参数，如周期、占空比、极性、中断使能等。
```c
#define PWM_CONF_CHANNELS_PB 2


/** @brief Array of configured Pwm channels */
static Pwm_ChannelConfigType Pwm_Channels_PB[PWM_CONF_CHANNELS_PB] = {
    {
        /* @brief Pwm Channel id */
        .ChannelId = 0,
        /* @brief Pwm Channel Class */
        .PwmChannelClass = PWM_VARIABLE_PERIOD,
        /** @brief Pointer to channel pwm hw channel: pwm 0 - ch 4 */
        .LldChannelCfg = &Pwm_HwChannelConfig_PB[0][0],
    },
    {
        /* @brief Pwm Channel id */
        .ChannelId = 1,
        /* @brief Pwm Channel Class */
        .PwmChannelClass = PWM_VARIABLE_PERIOD,
        /** @brief Pointer to channel pwm hw channel: pwm 0 - ch 5 */
        .LldChannelCfg = &Pwm_HwChannelConfig_PB[0][1],
    },
};

/** @brief Array of configured Pwm channels */
const Pwm_ConfigType Pwm_Config = {
    /** @brief Number of configured Pwm ips */
    .NumInstances = PWM_HW_CONF_MODS_PB,
    /** @brief Number of configured Pwm channels */
    .NumChannels = PWM_CONF_CHANNELS_PB,
    /** @brief Number of configured Pwm channels */
    .PwmChannelsConfig = Pwm_Channels_PB,
    /** @brief Pointer to array of Pwm channels */
    .PwmLldIpConfig = Pwm_Lld_IpConfig_PB,
};

```


## 应用sample


<DocScope products="RDK S100">

### 使用示例
S100 开发板将PWM引出供用户开发学习使用，已引出PWM Channel的PIN脚位置以及状态如下：

| PWM通道 | 所属板子                  | 引脚状态/复用              |
|--------|---------------------------|---------------------------|
| pwm0   | MCU扩展板                 |  与I2C9 SCL复用            |
| pwm1   | MCU扩展板                 |  NONE                     |
| pwm6   | Mainboad板的MCU expansion Header | NONE               |
| pwm7   | Mainboad板的MCU expansion Header | NONE              |
| pwm10  | MCU扩展板                 | 与I2C8 SCL复用            |
| pwm11  | MCU扩展板                 | 与I2C8 SDA复用            |


`pwmtest`命令用于配置和控制PWM（脉冲宽度调制）通道。下面是`pwmtest`命令的使用说明和示例。

- 使用方法

设置PWM占空比：
```sh
pwmtest <pwm_id> <pwm通道> <周期> <占空比>
```

停止PWM输出：
```sh
pwmtest <pwm_id> stop <pwm通道>
```

例如设置PWM通道0的周期为1000us，占空比为50%：
```
pwmtest 0 0 0x30d40 0x4000
```

- 参数说明

```sh
<pwm通道>: 要配置或停止的PWM通道号。
<周期>: PWM信号的周期。
<占空比>: PWM信号的占空比，必须在0x0000（0%）到0x8000（100%）的范围内。
```

- 周期计算

PWM周期=时钟源频率/周期寄存器值​

例：输出周期为1000us的波，pwm时钟源默认为200Mhz，则需要在寄存器中写入 200000000/1000=200000(0x30d40)。


### Debug Sample

- 使用方法

```bash
pwmdumpregs <pwm_id> <pwm通道>
```

例如dump pwm channel0的寄存器
```bash
D-Robotics:/$ pwmdumpregs 0 0
[06915.231597 0]INFO: Pwm_RegDump pwm channel:0
[06915.231967 0]INFO: Pwm_RegDump channel 0
ch[0]                              PERIOD 22370000 60000 # 周期
ch[0]                              PERIOD 22370000 48000 # 占空比
ch[0]                            CAP_TIME 22370004 0
ch[0]                            CAP_TIME 22370004 0
ch[0]               PWM_CTRL_REG.MODE_SEL          0
ch[0]          PWM_CTRL_REG.GEN_ALIGN_SEL          0
ch[0]           PWM_CTRL_REG.GEN_POLARITY          0
ch[0]               PWM_CTRL_REG.INT_MASK          1
ch[0]               PWM_CTRL_REG.DMA_MASK          0
ch[0]           PWM_CTRL_REG.HW_TRIG_MASK          1
ch[0]       PWM_CTRL_REG.GLITCH_FILTER_EN          0
ch[0]       PWM_CTRL_REG.GLITCH_THRESHOLD          0
ch[0]          PWM_CTRL_REG.HW_TRIG_WIDTH          0
ch[0]          PWM_CTRL_REG.CLK_DIV_RATIO          0
ch[0]               PWM_CTRL_REG.EDGE_SEL          0
ch[0]        PWM_CTRL_REG.CPU_HALT_ENABLE          0
ch[0]       PWM_CTRL_REG.TIMER_CLEAR_MODE          0
ch[0]           PWM_CTRL_REG.RESERVED_BIT          0
ch[0]                                  EN 2237000c 1
ch[0]                       COMPARE_STATE 22370010 0
ch[0]                           PIN_STATE 22370014 3
ch[0]                   CAP_CNT_THRESHOLD 22370018 1
ch[0]                             CAP_CNT 2237001c 1539
ch[0]                                 EOI 22370024 0
ch[0]                              INT_ST 22370028 0
ch[0]                                 CNT 2237002c 28991
pwm                                  EOIS 22370300 0
pwm                                INT_ST 22370304 0
pwm                            RAW_INT_ST 22370308 1
pwm                              RESERVED 2237030c 0
pwm                              CAP_MISS 22370310 0
pwm                            CLEAR_MODE 22370314 33c
pwm                             SYNC_MODE 22370318 0
pwm                         CFG_LOCK_MODE 2237031c 0
[06915.263883 0]INFO: Pwm_RegDump end

```


</DocScope>
<DocScope products="RDK S600">
S600 开发板将PWM0 channel4和PWM0 channel5引出供用户开发学习使用，接口位于MCU子板。

### 使用示例

`pwmtest`命令用于配置和控制PWM（脉冲宽度调制）通道。下面是`pwmtest`命令的使用说明和示例。

- 使用方法

设置PWM占空比：
```sh
pwmtest <pwm_hwipid> <pwm_hwchid> <period> <duty_cycle>
```

停止PWM输出：
```sh
pwmtest stop <pwm_hwipid> <pwm_hwchid>
```

**参数说明**
**pwm_hwipid:** PWM硬件IP实例ID (0-2)
**pwm_hwchid:** PWM硬件通道ID (0-11)
**period:** PWM信号周期值，32位数值
**duty_cycle:** PWM信号占空比，必须在0x0000（0%）到0x8000（100%）范围内


例如设置PWM0通道4，周期为0x600000，占空比为0x4000(50%)：
```shell
D-Robotics:/$ pwmtest 0x0 0x4 0x600000 0x4000
PWM0-CH4 pwm_period = 0x00600000 pwm_dutycycle = 0x4000
Set PWM pin function to PWM0-CH4
```
停止PWM0通道4的输出
```shell
D-Robotics:/$ pwmtest stop 0x0 0x4
INFO: Stopping PWM0-Ch0004
```


### Debug Sample

- 使用方法

```bash
pwmdumpregs <pwm_hwipid> <pwm_hwchid>
```

查看PWM0通道4的寄存器配置
```shell
D-Robotics:/$ pwmdumpregs 0 4
[064961.196947 0]INFO: #####Get Version for Pwm
[064961.197466 0]INFO: Pwm moduleID 121
[064961.197926 0]INFO: Pwm vendorID 196
[064961.198371 0]INFO: Pwm sw_major_version 1
[064961.198885 0]INFO: Pwm sw_minor_version 0
[064961.199395 0]INFO: Pwm sw_patch_version 0
[064961.199906 0]INFO: Pwm_RegDump instance 0 channel 4
[064961.200524 0]ch[4]                              PERIOD 234a00c0 0
[064961.201300 0]ch[4]                              PERIOD 234a00c0 0
[064961.202070 0]ch[4]                            CAP_TIME 234a00c4 0
[064961.202841 0]ch[4]                            CAP_TIME 234a00c4 0
[064961.203632 0]ch[4]               PWM_CTRL_REG.MODE_SEL          0
[064961.204402 0]ch[4]          PWM_CTRL_REG.GEN_ALIGN_SEL          0
[064961.205174 0]ch[4]           PWM_CTRL_REG.GEN_POLARITY          0
[064961.205948 0]ch[4]               PWM_CTRL_REG.INT_MASK          0
[064961.206718 0]ch[4]               PWM_CTRL_REG.DMA_MASK          0
[064961.207491 0]ch[4]           PWM_CTRL_REG.HW_TRIG_MASK          0
[064961.208274 0]ch[4]       PWM_CTRL_REG.GLITCH_FILTER_EN          0
[064961.209049 0]ch[4]       PWM_CTRL_REG.GLITCH_THRESHOLD          0
[064961.209819 0]ch[4]          PWM_CTRL_REG.HW_TRIG_WIDTH          0
[064961.210589 0]ch[4]          PWM_CTRL_REG.CLK_DIV_RATIO          0
[064961.211366 0]ch[4]               PWM_CTRL_REG.EDGE_SEL          0
[064961.212136 0]ch[4]        PWM_CTRL_REG.CPU_HALT_ENABLE          0
[064961.212927 0]ch[4]       PWM_CTRL_REG.TIMER_CLEAR_MODE          0
[064961.213698 0]ch[4]           PWM_CTRL_REG.RESERVED_BIT          0
[064961.214468 0]ch[4]                                  EN 234a00cc 0
[064961.215240 0]ch[4]                       COMPARE_STATE 234a00d0 0
[064961.216014 0]ch[4]                           PIN_STATE 234a00d4 0
[064961.216784 0]ch[4]                   CAP_CNT_THRESHOLD 234a00d8 1
[064961.217557 0]ch[4]                             CAP_CNT 234a00dc 0
[064961.218340 0]ch[4]                                 EOI 234a00e4 0
[064961.219114 0]ch[4]                              INT_ST 234a00e8 0
[064961.219885 0]ch[4]                                 CNT 234a00ec 0
[064961.220659 0]pwm                                  EOIS 234a0300 0
[064961.221432 0]pwm                                INT_ST 234a0304 0
[064961.222202 0]pwm                            RAW_INT_ST 234a0308 0
[064961.222993 0]pwm                              RESERVED 234a030c 0
[064961.223763 0]pwm                              CAP_MISS 234a0310 0
[064961.224534 0]pwm                            CLEAR_MODE 234a0314 fff
[064961.225328 0]pwm                             SYNC_MODE 234a0318 0
[064961.226101 0]pwm                         CFG_LOCK_MODE 234a031c 0
[064961.226872 0]INFO: Pwm_RegDump end

```


</DocScope>


### 应用程序接口

#### void Pwm_Init(const Pwm_ConfigType* ConfigPtr)

```shell
Description：Service for PWM initialization

Sync/Async：Synchronous
Parameters(in)
    ConfigPtr： Pointer to configuration set
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```



#### void Pwm_DeInit(void)

```shell
Description：Service for PWM De-Initialization.

Sync/Async：Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Pwm_SetDutyCycle(Pwm_ChannelType ChannelNumber, uint16 DutyCycle)

```shell
Description：Service sets the duty cycle of the PWM channel.
Sync/Async：Asynchronous
Parameters(in)
    ChannelNumber: Numeric identifier of PWM
    DutyCycle: Min=0x0000 Max=0x8000
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Pwm_SetPeriodAndDuty(Pwm_ChannelType ChannelNumber, Pwm_PeriodType Period, uint16 DutyCycle)

```shell
Description：Service sets the duty cycle of the PWM channel.
Sync/Async：Asynchronous
Parameters(in)
    ChannelNumber: Numeric identifier of PWM
    Period: Period of the PWM signal
    DutyCycle: Min=0x0000 Max=0x8000
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Pwm_SetOutputToIdle(Pwm_ChannelType ChannelNumber)

```shell
Description：Service sets the PWM output to the configured Idle state.
Sync/Async：Asynchronous
Parameters(in)
    ChannelNumber: Numeric identifier of PWM
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### Pwm_OutputStateType Pwm_GetOutputState(Pwm_ChannelType ChannelNumber)

```shell
Description：Service to read the internal state of the PWM output signal.
Sync/Async：Asynchronous
Parameters(in)
    ChannelNumber: Numeric identifier of PWM
Parameters(inout)
    None
Parameters(out)
    None

Return value：Pwm_OutputStateType
    PWM_HIGH: The PWM output state is high
    PWM_LOW: The PWM output state is low
```

#### void Pwm_DisableNotification(Pwm_ChannelType ChannelNumber)

```shell
Description：Service to disable the PWM signal edge notification.
Sync/Async：Asynchronous
Parameters(in)
    ChannelNumber: Numeric identifier of PWM
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Pwm_EnableNotification(Pwm_ChannelType ChannelNumber, Pwm_EdgeNotificationType Notification)

```shell
Description：Service to enable the PWM signal edge notification.
Sync/Async：Asynchronous
Parameters(in)
    ChannelNumber: Numeric identifier of PWM
    Notification: Notification type to be enabled
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Pwm_GetVersionInfo(Std_VersionInfoType* versioninfo)

```shell
Description：Service returns the version information of this module.
Sync/Async：Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    versioninfo: Pointer to where to store the version information of this module.
Return value：None
```
