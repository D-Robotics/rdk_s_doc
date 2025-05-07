---
sidebar_position: 5
---

# PWM 使用指南

## 硬件支持

S100 有1个PWM，每个PWM IP 有12个通道。

- 每个通道都是独立的，支持irq requset和dma requset
- 可以支持硬件触发脉冲输出
- 每个通道有自己独立的时钟分频寄存器
- 每个IP所有通道共享一个中断
- 当目标边沿或者脉冲类型到来的时候，会触发中断或者dma req
- 支持DMA更新 period和duty
- 支持周期边沿对齐方式设置，可以设置为边沿对齐或者中心对齐
- 支持pwm同步输出模式，6通道同步或者12通道同步。

## 软件驱动

- 支持CPU更新PWM通道的周期和占空比
- 支持DMA 更新PWM通道的周期和占空比
- 支持设置开启和关闭PWM中断，设置PWM通道的中断函数，支持中断类型：上升沿，下降沿，双边沿
- 读取PWM输出信号的内部状态并将其返回
- 支持多通道同步输出


## 代码路径

# PWM 模块相关文件说明

- Config/McalCdd/gen_s100_sip_B_mcu1/Pwm/src/Pwm_PBCfg.c: 正常模式下 PWM 的预编译配置源文件，包含通道和实例的具体配置参数（如周期、占空比、极性等）。
- Config/McalCdd/gen_s100_sip_B_mcu1/Pwm/inc: 预编译配置头文件，定义宏开关。
- McalCdd/Pwm/src/Pwm_Lld.c: 底层驱动实现文件，直接操作硬件寄存器，提供底层接口。
- McalCdd/Pwm/src/Pwm.c: 上层驱动逻辑实现，封装API 接口，并处理错误检测、状态管理等控制逻辑。
- McalCdd/Pwm/inc/Pwm_Lld.h: 底层驱动头文件，声明底层函数原型、结构体和枚举类型。
- McalCdd/Pwm/inc/Pwm_Types.h: 定义通用数据类型、结构体和回调函数指针类型，供上下层共享使用。
- McalCdd/Pwm/inc/Pwm.h: 主头文件，声明高层 API和核心结构体。
- samples/Pwm/Pwm_sample/Pwm_test.c: Pwm测试sample。

## 应用sample


### 使用示例
S100 开发板将PWM引出供用户开发学习使用，已引出pwm channel的PIN脚位置以及状态如下：

| PWM通道 | 所属板子                  | 引脚状态/复用              |
|--------|---------------------------|---------------------------|
| pwm0   | MCU扩展板                 | NONE                      |
| pwm1   | MCU扩展板                 | 与I2C9 SCL复用            |
| pwm6   | Mainboad板的MCU expansion Header | NONE               |
| pwm7   | Mainboad板的MCU expansion Header | NONE              |
| pwm10  | MCU扩展板                 | 与I2C8 SCL复用            |
| pwm11  | MCU扩展板                 | 与I2C8 SDA复用            |


`pwmtest`命令用于配置和控制PWM（脉冲宽度调制）通道。下面是`pwmtest`命令的使用说明和示例。

- 使用方法

设置PWM占空比：
```sh
pwmtest <pwm通道> <周期> <占空比>
```

停止PWM输出：
```sh
pwmtest stop <pwm通道>
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
