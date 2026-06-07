# 7.5.6 PWM User Guide

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Advanced_development/mcu_development/mcu_pwm

## Hardware Support

- Each channel is independent and supports IRQ request and DMA request.
- Supports configuration of two operating modes: general operating mode (PWM pulse output) and input capture mode.
- Each channel has its own independent clock divider register.
- All channels of each IP share one interrupt.
- When the target edge or pulse type arrives, an interrupt or DMA request is triggered.
- Supports DMA update of period and duty cycle.
- Supports setting the period edge alignment mode, which can be set to edge-aligned or center-aligned.
- Supports configuring the period and duty cycle for each PWM channel, subject to the following constraint:
- Period configuration granularity is clk_PWM, i.e., the PWM peripheral clock, with a maximum clock count value of 4294967295.
The IP configurations for S600 and S100 are as follows:

| Platform | Number of PWM IPs | Number of Channels per IP | Total Number of Channels 
| S600 | 3 | 12 Channels | 36 Channels 
| S100 | 1 | 12 Channels | 12 Channels 

## Software Driver

- Supports CPU update of PWM channel period and duty cycle.
- Supports DMA update of PWM channel period and duty cycle.
- Supports enabling and disabling PWM interrupts, setting the interrupt function for PWM channels, and supporting interrupt types: rising edge, falling edge, both edges.
- Reads the internal state of the PWM output signal and returns it.
- Supports multi-channel synchronous output.

## Code Path

# Description of PWM Module Related Files

- `Config/McalCdd/gen_xxx/Pwm/src/Pwm_PBCfg.c` : Pre-compiled configuration source file for PWM in normal mode, containing specific configuration parameters for channels and instances (such as period, duty cycle, polarity, etc.).
- `Config/McalCdd/gen_xxx/Pwm/inc` : Pre-compiled configuration header file, defining macro switches.
- `McalCdd/Pwm/src/Pwm_Lld.c` : Low-level driver implementation file, directly operating hardware registers and providing low-level interfaces.
- `McalCdd/Pwm/src/Pwm.c` : High-level driver logic implementation, encapsulating API interfaces and handling error detection, state management, and other control logic.
- `McalCdd/Pwm/inc/Pwm_Lld.h` : Low-level driver header file, declaring low-level function prototypes, structures, and enumeration types.
- `McalCdd/Pwm/inc/Pwm_Types.h` : Defining common data types, structures, and callback function pointer types for sharing between upper and lower layers.
- `McalCdd/Pwm/inc/Pwm.h` : Main header file, declaring high-level APIs and core structures.
- `samples/Pwm/inc/Pwm_PBCfg.h` : Header file for PWM test sample.
- `samples/Pwm/src/Pwm_test.c` : Source file for PWM test sample.

## Important Configuration Instructions

The configuration source file in the PWM driver is `Pwm_PBCfg.c` , which supports individual configuration for each channel. The drivers and configurations for S600 and S100 are compatible. The following uses S600 as an example.

1. `Pwm_HwChannelConfig_PB` contains the specific hardware configuration for PWM. Some configurations take effect immediately during PWM initialization.

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

1. The `Pwm_Channels_PB` structure array defines the mapping between logical PWM channels and underlying hardware channels; the `Pwm_HwChannelConfig_PB` structure array defines the default hardware parameters for each PWM channel, such as period, duty cycle, polarity, interrupt enable, etc.

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

## Application Sample

### Usage Example

The S100 development board provides access to PWM for user development and learning. The PIN positions and statuses of the accessible PWM channels are as follows:

| PWM Channel | Board | Pin Status/Multiplexing 
| pwm0 | MCU expansion board | Multiplexed with I2C9 SCL 
| pwm1 | MCU expansion board | NONE 
| pwm6 | Mainboard MCU expansion Header | NONE 
| pwm7 | Mainboard MCU expansion Header | NONE 
| pwm10 | MCU expansion board | Multiplexed with I2C8 SCL 
| pwm11 | MCU expansion board | Multiplexed with I2C8 SDA 

The `pwmtest` command is used to configure and control PWM (Pulse Width Modulation) channels. Below are the instructions and examples for using the `pwmtest` command.

- Usage
Set PWM duty cycle:

```sh
pwmtest <pwm_id> <pwm_channel> <period> <duty_cycle>
```

Stop PWM output:

```sh
pwmtest <pwm_id> stop <pwm_channel>
```

For example, to set the period of PWM channel 0 to 1000us and the duty cycle to 50%:

```text
pwmtest 0 0 0x30d40 0x4000
```

- Parameter Description

```sh
<pwm_channel>: The PWM channel number to configure or stop.
<period>: The period of the PWM signal.
<duty_cycle>: The duty cycle of the PWM signal, must be in the range of 0x0000 (0%) to 0x8000 (100%).
```

- Period Calculation
PWM period = clock source frequency / period register value.

Example: To output a wave with a period of 1000us, and the PWM clock source is 200Mhz by default, write 200000000/1000=200000 (0x30d40) into the register.

### Debug Sample

- Usage

```bash
pwmdumpregs <pwm_id> <pwm_channel>
```

For example, dump the registers of PWM channel 0:

```bash
D-Robotics:/$ pwmdumpregs 0 0
[06915.231597 0]INFO: Pwm_RegDump pwm channel:0
[06915.231967 0]INFO: Pwm_RegDump channel 0
ch[0]                              PERIOD 22370000 60000 # period
ch[0]                              PERIOD 22370000 48000 # duty cycle
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

The S600 development board provides access to PWM0 channel4 and PWM0 channel5 for user development and learning. The interface is located on the MCU daughter board.

### Usage Example

The `pwmtest` command is used to configure and control PWM (Pulse Width Modulation) channels. Below are the instructions and examples for using the `pwmtest` command.

- Usage
Set PWM duty cycle:

```sh
pwmtest <pwm_hwipid> <pwm_hwchid> <period> <duty_cycle>
```

Stop PWM output:

```sh
pwmtest stop <pwm_hwipid> <pwm_hwchid>
```

**Parameter Description****pwm_hwipid:** PWM hardware IP instance ID (0 2) **pwm_hwchid:** PWM hardware channel ID (0 11) **period:** PWM signal period value, 32-bit value **duty_cycle:** PWM signal duty cycle, must be in the range of 0x0000 (0%) to 0x8000 (100%)

For example, to set PWM0 channel4 with a period of 0x600000 and a duty cycle of 0x4000 (50%):

```shell
D-Robotics:/$ pwmtest 0x0 0x4 0x600000 0x4000
PWM0-CH4 pwm_period = 0x00600000 pwm_dutycycle = 0x4000
Set PWM pin function to PWM0-CH4
```

Stop the output of PWM0 channel4:

```shell
D-Robotics:/$ pwmtest stop 0x0 0x4
INFO: Stopping PWM0-Ch0004
```

### Debug Sample

- Usage

```bash
pwmdumpregs <pwm_hwipid> <pwm_hwchid>
```

View the register configuration of PWM0 channel4:

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

### Application Interface

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
