---
sidebar_position: 14
---
# ICU User Guide

The ICU module is a software sub-module based on the S100 chip solution and serves as a foundational service software within the overall system. In the overall design of the S100, the ICU software primarily abstracts and uniformly manages hardware with input capture attributes within the system. The hardware layer IP involves two components: PWM and GPIO. This document focuses on the configuration and implementation of GPIO interrupts.

## GPIO Interrupt User Guide

In the S100 MCU, GPIOs are organized into four IO groups, namely three PORTs: GPIO0, GPIO1, GPIO2, and GPIO_AON. Among these, the first three groups provide a total of 88 pins, while the GPIO_AON group provides 12 pins. For this part, refer to `mcu/Config/McalCdd/gen_s100_sip_B_mcu1/Port/src/Port_PBcfg.c`. All pins support interrupt trigger modes including rising edge, falling edge, both edges, and high/low level triggers.

| ISR Function | IRQ | IRQ Define           | Description |
| :----------- | :-- | :------------------- | :---------- |
| Gpio0_ExtIsr | 68  | MCUSYS_GPIO0_INTR    | Gpio Mode   |
| Gpio1_ExtIsr | 69  | MCUSYS_GPIO1_INTR    | Gpio Mode   |
| Gpio2_ExtIsr | 70  | MCUSYS_GPIO2_INTR    | Gpio Mode   |
| Gpio3_ExtIsr | 361 | AON_WAKEUP_GPIO_INTR | Gpio Mode   |

### Port Configuration

Each pin on the S100 MCU supports at least one function. Therefore, before using GPIO interrupts, the pin's function and attributes must be configured through the Port subsystem, which is a redefinition process. Taking `GPIO_MCU[20]` and `GPIO_MCU[21]` as examples, the functions of these two pins are as follows:

| FUNC0     | IO TYPE0 | FUNC1      | IO TYPE1 | FUNC2   | IO TYPE2 | FUNC3        | IO TYPE3 |
| :-------- | :------- | :--------- | :------- | :------ | :------- | :----------- | :------- |
| SPI3_CSN0 | O        | DEBUG_OUT5 | O        | TRC_CTL | O        | GPIO_MCU[20] | IO       |
| SPI3_CSN1 | IO       | PPS_IN0    | I        | TRC_CLK | O        | GPIO_MCU[21] | IO       |

These two pins need to be configured as FUNC3, i.e., GPIO mode. For an introduction and usage of Port, refer to the chapters [Port User Guide](./12_mcu_port/01_user_manual.md) and [Port Development Guide](./12_mcu_port/02_development_manual.md). The specific configuration file is `mcu/Config/McalCdd/gen_s100_sip_B_mcu1/Port/src/Port_PBcfg.c`.

```c
static const Port_Lld_PinConfigType Port_McuPinConfigs[PORT_MCU_MAX_NUM]=
{
    ...
    /* Pin Id,  Pin name,      IsUsed,        ModeChang,    SchmittTriger,  InputEnable,     IsUsedGpio,     DirChang,   PinMode,    Config Type,        Pull Type,       Drive Strength,         GpioDir,           GpioData*/
    {(uint8)20, "SPI3_CSN0", (boolean)TRUE, {(boolean)TRUE, (boolean)FALSE, (boolean)TRUE, (boolean)TRUE, (boolean)FALSE, GPIO, PORT_PIN_CONFIG_TYPE0, PORT_PULL_UP, PORT_DRIVE_DEFAULT, PORT_PIN_DIR_IN, PORT_PIN_LEVEL_LOW}},
    /* Pin Id,  Pin name,      IsUsed,        ModeChang,    SchmittTriger,  InputEnable,     IsUsedGpio,     DirChang,   PinMode,    Config Type,        Pull Type,       Drive Strength,         GpioDir,           GpioData*/
    {(uint8)21, "PWR_SHDN_N", (boolean)TRUE, {(boolean)TRUE, (boolean)FALSE, (boolean)TRUE, (boolean)TRUE, (boolean)FALSE, GPIO, PORT_PIN_CONFIG_TYPE0, PORT_PULL_UP, PORT_DRIVE_DEFAULT, PORT_PIN_DIR_IN, PORT_PIN_LEVEL_LOW}},
    ...
}
```

### ICU Configuration

ICU file list:

> - mcu/McalCdd/Icu/src/Icu_Lld_Gpio.c
> - mcu/McalCdd/Icu/src/Icu_Lld.c
> - mcu/McalCdd/Icu/src/Icu.c
> - mcu/McalCdd/Icu/inc/Icu_Lld_Gpio.h
> - mcu/McalCdd/Icu/inc/Icu_Lld.h
> - mcu/McalCdd/Icu/inc/Icu_Types.h
> - mcu/McalCdd/Icu/inc/Icu.h

GPIO interrupt functionality is uniformly managed by the ICU, and detailed attributes of its pins (such as interrupt type, callback function, etc.) must be configured through the ICU. The specific configuration file is `mcu/Config/McalCdd/gen_s100_sip_B_mcu1/Icu/src/Icu_PBCfg.c`, achieved by modifying structures such as `Icu_ConfigType`, `Icu_Lld_IpConfigType`, `Gpio_Icu_IpConfigType`, `Icu_Lld_ChannelConfigType`, `Icu_ChannelConfigType`, and `Gpio_Icu_ChannelConfigType`. Among these, `Gpio_Icu_ChannelConfigType` is the key structure responsible for defining the interrupt callback function, trigger type, and interrupt mask bit, etc.

#### Icu_ConfigType

```c
#define ICU_CONF_IPS_PB 1
#define ICU_CONF_CHS_PB 2

/** @brief Array of configured Icu channels */
const Icu_ConfigType Icu_Config = {
    /** @brief Number of configured Icu ips */
    .nNumInstances = ICU_CONF_IPS_PB,
    /** @brief Number of configured Icu channels */
    .NumChannels = ICU_CONF_CHS_PB,
    /** @brief Number of configured Icu channels */
    .Icu_ChannelConfigPtr = Icu_ChConfig_PB,
    /** @brief Pointer to array of Icu channels */
    .Icu_LldConfigPtr = Icu_Lld_IpConfig_PB,
};
```

| Parameter            | Description                                 |
| :------------------- | :------------------------------------------ |
| nNumInstances        | Number of GPIO controller instances         |
| NumChannels          | Number of channels (or pins)                |
| Icu_ChannelConfigPtr | Pointer to `Icu_ChannelConfigType` structure|
| Icu_LldConfigPtr     | Pointer to `Icu_Lld_IpConfigType` structure |

#### Icu_Lld_IpConfigType

```c
#define ICU_CONF_IPS_PB 1

/** @brief Array of high level Icu channel Config Type*/
static Icu_Lld_IpConfigType Icu_Lld_IpConfig_PB[ICU_CONF_IPS_PB] = {
    /** @brief gpio module 0 */
    {
        /**< id of gpio icu module in the Icu configuration */
        .instanceNo = 0,
        /**< The IP type used. */
        .InstanceMode = ICU_GPIO_MODULE,
        /**< gpio IP configure type. */
        .GpioConfig = &Icu_Gpio_IpConfig_PB[0],
    },
};
```

| Parameter    | Description                                     |
| :----------- | :---------------------------------------------- |
| instanceNo   | Controller instance (e.g., 0 - GPIO0)           |
| InstanceMode | GPIO or PWM mode                                |
| GpioConfig   | Pointer to `Icu_Lld_ChannelConfigType` structure|

#### Gpio_Icu_IpConfigType

```c
#define ICU_GPIO_CONF_MODS_PB 1

/** @brief Array of gpio Icu ip Config Type channels */
static Gpio_Icu_IpConfigType Icu_Gpio_IpConfig_PB[ICU_GPIO_CONF_MODS_PB] = {
    /** @brief gpio module 1 */
    {
        /**< Number of gpio channels in the Icu configuration */
        .NumChannels = 2,
        /**< The Instance index used for the configuration of channel */
        .instanceNo = 0,
        /**< id of gpio icu module in the Icu configuration */
        .ChannelsConfig = Icu_Gpio_ChannelConfig_PB[0],
    },
};
```

| Parameter      | Description                                      |
| :------------- | :----------------------------------------------- |
| NumChannels    | Number of channels                               |
| instanceNo     | Controller instance (e.g., 0 - GPIO0)            |
| ChannelsConfig | Pointer to `Gpio_Icu_ChannelConfigType` structure|

#### Icu_ChannelConfigType

```c
#define ICU_CONF_CHS_PB 2

/** @brief Array of high level Icu channel Config Type*/
static Icu_ChannelConfigType Icu_ChConfig_PB[ICU_CONF_CHS_PB] = {
    /** @brief icu CH 0 */
    {
        /** Assigned ICU channel id*/
        .ChannelId = 0,
        /** @brief Pointer to the lld gpio channel pointer configuration, gpio 4 channel 0 */
        .Icu_LldChannelConfigPtr = &Icu_Lld_Gpio_ChannelConfig_PB[0][0],
    },
    /** @brief icu CH 1 */
    {
        /** Assigned ICU channel id*/
        .ChannelId = 1,
        /** @brief Pointer to the lld gpio channel pointer configuration, gpio 4 channel 1 */
        .Icu_LldChannelConfigPtr = &Icu_Lld_Gpio_ChannelConfig_PB[0][1],
    },
};
```

| Parameter               | Description                                   |
| :---------------------- | :-------------------------------------------- |
| ChannelId               | Channel identifier                            |
| Icu_LldChannelConfigPtr | Pointer to `Icu_Lld_ChannelConfigType` structure|

#### Icu_Lld_ChannelConfigType

```c
#define ICU_GPIO_CONF_MODS_PB 1

/** @brief Array of Gpio Channel ConfigType channels*/
static Icu_Lld_ChannelConfigType Icu_Lld_Gpio_ChannelConfig_PB[ICU_GPIO_CONF_MODS_PB][32] = {
    /** @brief gpio module 0 */
    {
        /** @brief gpio mod 0 channel 20 */
        {
            .ChannelMode = ICU_GPIO_MODULE,
            .instanceNo = 0,
            .gpioHwChannelConfig = &Icu_Gpio_ChannelConfig_PB[0][0],
        },
        /** @brief gpio mod 0 channel 21 */
        {
            .ChannelMode = ICU_GPIO_MODULE,
            .instanceNo = 0,
            .gpioHwChannelConfig = &Icu_Gpio_ChannelConfig_PB[0][1],
        },
    },
};
```

| Parameter           | Description                                      |
| :------------------ | :----------------------------------------------- |
| ChannelMode         | GPIO or PWM mode                                 |
| instanceNo          | Controller instance (e.g., 0 - GPIO0)            |
| gpioHwChannelConfig | Pointer to `Gpio_Icu_ChannelConfigType` structure|

#### `Gpio_Icu_ChannelConfigType`

```c
#define ICU_GPIO_CONF_MODS_PB 1

extern void Icu_Gpio_Channel_0_20_ISR(void);
extern void Icu_Gpio_Channel_0_21_ISR(void);

/** @brief Array of Gpio Channel ConfigType channels*/
static Gpio_Icu_ChannelConfigType Icu_Gpio_ChannelConfig_PB[ICU_GPIO_CONF_MODS_PB][32] = {
    /** @brief gpio module 0 */
    {
        /** @brief gpio mod 0 channel 20 */
        {
            /**< Assigned GPIO channel id*/
            .PinId = 20,
            /**< Assigned GPIO ip id*/
            .instanceNo = 0,
            /**< GPIO Default Start Edge */
            .DefaultStartEdge = GPIO_ICU_FALLING_EDGE,
            /**< Notification Enable.*/
            .NotificationEnable = TRUE,
            /**< The notification functions shall have no parameters and no return value.*/
            .GpioChannelNotification = Icu_Gpio_Channel_0_20_ISR,
            /**< Interrupt Enable or Disable . */
            .IntEnable = TRUE,
            /**< Interrupt Mask or Umask . */
            .IntMask = FALSE,
        },
        /** @brief gpio mod 0 channel 21 */
        {
            /**< Assigned GPIO channel id*/
            .PinId = 21,
            /**< Assigned GPIO ip id*/
            .instanceNo = 0,
            /**< GPIO Default Start Edge */
            .DefaultStartEdge = GPIO_ICU_FALLING_EDGE,
            /**< Notification Enable.*/
            .NotificationEnable = TRUE,
            /**< The notification functions shall have no parameters and no return value.*/
            .GpioChannelNotification = Icu_Gpio_Channel_0_21_ISR,
            /**< Interrupt Enable or Disable . */
            .IntEnable = TRUE,
            /**< Interrupt Mask or Umask . */
            .IntMask = FALSE,
        },
    },
};
```

| Parameter               | Description                                                                                        |
| :---------------------- | :------------------------------------------------------------------------------------------------- |
| PinId                   | Pin number (or channel number)                                                                     |
| instanceNo              | Controller instance (e.g., 0 - GPIO0)                                                              |
| DefaultStartEdge        | Interrupt trigger mode:<br />1. Falling edge<br />2. Rising edge<br />3. Rising or falling edge<br />4. High level<br />5. Low level |
| NotificationEnable      | Whether to enable the callback                                                                     |
| GpioChannelNotification | Callback function pointer (no parameters, no return value)                                         |
| IntEnable               | Whether to enable interrupt:<br />- `TRUE`: Enable interrupt<br />- `FALSE`: Disable interrupt     |
| IntMask                 | Whether to mask interrupt:<br />- `TRUE`: Mask interrupt<br />- `FALSE`: Do not mask interrupt     |

Both `IntEnable` and `IntMask` are used for interrupt on/off control. The difference between them is:

- `IntEnable`: When `FALSE`, it fundamentally prevents interrupt generation, and the interrupt status register will not be set.
- `IntMask`: When `TRUE`, it only prevents the interrupt signal from being reported to the CPU, but the interrupt event still triggers and sets the bit in the status register.

Configuration suggestions:

- When enabling interrupt: `IntEnable = TRUE` and `IntMask = FALSE`.
- When disabling interrupt: `IntEnable = FALSE` and `IntMask = TRUE`.

The callback function is the final entry point after an interrupt is triggered. The complete flow is: Interrupt function -> ICU interrupt handler -> Callback function.
`NotificationEnable` is used to control whether to execute the callback function. Setting it to `FALSE` will skip the callback but does not affect the occurrence of the interrupt or the generation of the status flag. To fully enable the interrupt and callback, you must ensure `NotificationEnable = TRUE`, `IntEnable = TRUE`, `IntMask = FALSE`, and `GpioChannelNotification` points to a specific callback function. It is recommended that the callback function name reflects its Instance and Channel, e.g., `Icu_Gpio_Channel_0_20_ISR`. The specific callback functions are defined in the file `mcu/samples/Interrupt/src/gpio_Interrupt_test.c`:

```c
/** GPIO_MCU[20] interrupt callback function */
void Icu_Gpio_Channel_0_20_ISR(void)
{
    LogSync("enter Icu_Gpio_Channel_0_20_ISR!!!\r\n");
    /** Add user code here */
}

/** GPIO_MCU[21] interrupt callback function */
void Icu_Gpio_Channel_0_21_ISR(void)
{
    LogSync("enter Icu_Gpio_Channel_0_21_ISR!!!\r\n");
    /** Add user code here */
}
```

> One important point to note is that users only need to implement business logic in the callback function; there is no need to manually clear the interrupt flag, as this operation is automatically handled by the ICU driver.

### Interrupt Implementation

Before configuring an interrupt, it is necessary to identify the interrupt number (IRQ) bound to the target pin and its corresponding interrupt entry function. Based on the introduction to MCU GPIO interrupt resources earlier in this document, it can be seen that pins `GPIO_MCU[20]` and `GPIO_MCU[21]` share the interrupt entry function `Gpio0_ExtIsr`, which corresponds to interrupt number 68. The registration, priority configuration, and enabling process of the interrupt are defined in the source file `mcu/McalCdd/Icu/src/Icu_Lld_Gpio.c`.

```c
void Icu_Gpio_Interrupt_Init(uint8 Instance, uint8 priority)
{
    uint8 cmd = Instance;

    switch (cmd) {
    case 0:
        INT_SYS_InstallHandler(MCUSYS_GPIO0_INTR, Gpio0_ExtIsr, 0);
        INT_SYS_SetPriority(MCUSYS_GPIO0_INTR, priority);
        INT_SYS_EnableIRQ(MCUSYS_GPIO0_INTR);
        break;
    case 1:
        INT_SYS_InstallHandler(MCUSYS_GPIO1_INTR, Gpio1_ExtIsr, 0);
        INT_SYS_SetPriority(MCUSYS_GPIO1_INTR, priority);
        INT_SYS_EnableIRQ(MCUSYS_GPIO1_INTR);
        break;
    case 2:
        INT_SYS_InstallHandler(MCUSYS_GPIO2_INTR, Gpio2_ExtIsr, 0);
        INT_SYS_SetPriority(MCUSYS_GPIO2_INTR, priority);
        INT_SYS_EnableIRQ(MCUSYS_GPIO2_INTR);
        break;
    case 3:
        INT_SYS_InstallHandler(AON_WAKEUP_GPIO_INTR, Gpio3_ExtIsr, 0);
        INT_SYS_SetPriority(AON_WAKEUP_GPIO_INTR, priority);
        INT_SYS_EnableIRQ(AON_WAKEUP_GPIO_INTR);
        break;
    default:
        break;
    }
}

void Icu_Gpio_Interrupt_DeInit(uint8 Instance)
{
    uint8 cmd = Instance;

    switch (cmd) {
    case 0:
        INT_SYS_DisableIRQ(MCUSYS_GPIO0_INTR);
        break;
    case 1:
        INT_SYS_DisableIRQ(MCUSYS_GPIO1_INTR);
        break;
    case 2:
        INT_SYS_DisableIRQ(MCUSYS_GPIO2_INTR);
        break;
    case 3:
        INT_SYS_DisableIRQ(AON_WAKEUP_GPIO_INTR);
        break;
    default:
        break;
    }
}
```

Users only need to call the `Icu_Gpio_Interrupt_Init` and `Icu_Gpio_Interrupt_DeInit` functions to enable and disable interrupts. The relevant implementation is located in `mcu/samples/Interrupt/src/gpio_Interrupt_test.c`.

```c
/** init interrupt */
Icu_Gpio_Interrupt_Init(0, 30);

/** deinit interrupt */
Icu_Gpio_Interrupt_DeInit(0);
```

## GPIO Interrupt Sample

Initialize GPIO interrupt on the MCU1 serial port terminal.

```bash
D-Robotics:/$ gpio_interrupt on
[0975.377836 0]INFO: Start gpio_interrupt test...
```

Connect one end of a jumper wire to the two GPIO pins shown in the figure below, and connect the other end to ground.

![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s100_mcu_gpio_interrupt.png)

If the serial port prints the following, it indicates that the GPIO interrupt was triggered successfully.

```bash
# GPIO_MCU[20] callback function 0-instanceNo，20-PinId
[0667.710363 0]INFO: Enter Icu_Gpio_Channel_0_20_ISR!!!

# GPIO_MCU[21] callback function 0-instanceNo，21-PinId
[0593.171002 0]INFO: Enter Icu_Gpio_Channel_0_21_ISR!!!
```

Disable the GPIO interrupt using the following command:

```bash
D-Robotics:/$ gpio_interrupt off
[0673.558143 0]INFO: Stop gpio_interrupt test
```

## PWM输入捕获使用指南

S100 有 3 个 PWM 控制器，每个 PWM IP 支持 12 个通道。PWM 硬件通道可配置为 Input Capture Mode，在该模式下可通过 ICU 完成外部信号周期、占空比等参数测量。

### Port配置

PWM 输入捕获引脚与 GPIO 中断类似，均需通过 Port 子系统完成引脚复用重定义。以 `PWM1_IO` 为例，Pin 功能如下：

| FUNC0 | IO TYPE0 | FUNC1 | IO TYPE1 | FUNC2 | IO TYPE2 | FUNC3 | IO TYPE3 |
| :---- | :------: | :---- | :------: | :---- | :------: | :---- | :------: |
| PWM1_IO | IO | I2C9_SCL | O | reserved | reserved | GPIO_MCU[85] | IO |

需要将该 Pin 配置为 `FUNC0`（PWM 模式）。关于 Port 的使用可参考 [Port使用指南](./12_mcu_port/01_user_manual.md) 和 [Port开发指南](./12_mcu_port/02_development_manual.md)。对应配置文件为 `mcu/Config/McalCdd/gen_s100_sip_B_mcu1/Port/src/Port_PBcfg.c`。

### ICU配置

PWM 输入捕获由 ICU 统一管理。捕获边沿、测量类型、通知回调等属性需要在 `mcu/Config/McalCdd/gen_s100_sip_B_mcu1/Icu/src/Icu_PBCfg.c` 中完成配置，主要涉及：

- `Icu_ConfigType`
- `Icu_Lld_IpConfigType`
- `Pwm_Icu_IpConfigType`
- `Icu_Lld_ChannelConfigType`
- `Icu_ChannelConfigType`
- `Pwm_Icu_ChannelConfigType`

其中，`Pwm_Icu_ChannelConfigType` 是关键结构，决定捕获边沿、测量类型、中断与回调行为。
#### Icu_Lld_IpConfigType
```c
#define ICU_CONF_IPS_PB 1

/** @brief Array of high level Icu channel Config Type*/
static Icu_Lld_IpConfigType Icu_Lld_IpConfig_PB[ICU_CONF_IPS_PB] = {
    /** @brief pwm module 0 */
    {
        /**< id of pwm icu module in the Icu configuration */
        .instanceNo = 0,
        /**< The operation core. */
        .Core_ID = MCU_CORE_0,
        /**< The IP type used. */
        .InstanceMode = ICU_PWM_MODULE,
        /**< pwm IP configure type. */
        .PwmConfig = &Icu_Pwm_IpConfig_PB[0],
    },
};
```
| Parameter | Description |
| :-------- | :---------- |
| instanceNo | 控制器实例号 |
| Core_ID | 核 ID |
| InstanceMode | IP 工作模式（此处应为 `ICU_PWM_MODULE`） |
| PwmConfig | 指向 `Pwm_Icu_IpConfigType` 结构体的指针 |

#### Pwm_Icu_IpConfigType
```c
#define ICU_PWM_CONF_MODS_PB 1

/** @brief Array of Pwm Icu ip Config Type channels */
static Pwm_Icu_IpConfigType Icu_Pwm_IpConfig_PB[ICU_PWM_CONF_MODS_PB] = {
    /** @brief pwm module 0 */
    {
        /**< Number of pwm icu channels in the Icu configuration */
        .NumChannels = 1,
        /**< id of pwm icu module in the Icu configuration */
        .instanceNo = 0,
        /**< id of pwm icu module in the Icu configuration */
        .ChannelsConfig = Icu_Pwm_ChannelConfig_PB[0],
    },
};
```
| Parameter | Description |
| :-------- | :---------- |
| NumChannels | 当前 PWM 实例参与 ICU 捕获的通道数 |
| instanceNo | 控制器实例号 |
| ChannelsConfig | 指向 `Pwm_Icu_ChannelConfigType` 数组首元素 |
#### Icu_Lld_ChannelConfigType
```c
/** @brief Array of Pwm Icu Channel Config Type channels */
static Icu_Lld_ChannelConfigType Icu_Lld_Pwm_ChannelConfig_PB[ICU_PWM_CONF_MODS_PB][2] = {
    /** @brief pwm module 0 */
    {
        /** @brief pwm 0 channel 0 */
        {
            .ChannelMode = ICU_PWM_MODULE,
            .instanceNo = 0,
            .pwmHwChannelConfig = &Icu_Pwm_ChannelConfig_PB[0][0],
        },
    },
};
```
| Parameter | Description |
| :-------- | :---------- |
| ChannelMode | 通道模式（此处应为 `ICU_PWM_MODULE`） |
| instanceNo | 控制器实例号 |
| pwmHwChannelConfig | 指向 `Pwm_Icu_ChannelConfigType` 结构体的指针 |
#### Icu_ChannelConfigType
```c
#define ICU_CONF_CHS_PB 1

/** @brief Array of high level Icu channel Config Type*/
static Icu_ChannelConfigType Icu_ChConfig_PB[ICU_CONF_CHS_PB] = {
    /** @brief icu CH 0 */
    {
        /** Assigned ICU channel id*/
        .ChannelId = 0,
        /** @brief Pointer to the lld pwm channel pointer configuration, pwm 0 channel 0 */
        .Icu_LldChannelConfigPtr = &Icu_Lld_Pwm_ChannelConfig_PB[0][0],
    },
};
```
| Parameter | Description |
| :-------- | :---------- |
| ChannelId | ICU 逻辑通道 ID |
| Icu_LldChannelConfigPtr | 指向 `Icu_Lld_ChannelConfigType` 结构体的指针 |
#### Pwm_Icu_ChannelConfigType
```c
/** @brief Array of Pwm Icu Channel Config Type channels */
static Pwm_Icu_ChannelConfigType Icu_Pwm_ChannelConfig_PB[ICU_PWM_CONF_MODS_PB][2] = {
    /** @brief pwm module 0 */
    {
        /** @brief pwm 0 channel 1 */
        {
            /** Assigned pwm channel id*/
            .HwChannelId = 1,
            /** Assigned pwm channel id*/
            .HwIpId = 0,
            /**< pwm channel capture mode glitch filter enable or disable */
            .GlitchFilterEn = FALSE,
            /**< pwm channel capture mode the threshold of capture glitch threshold*/
            .GlitchThreshold = 0,
            /**< pwm channel capture mode the threshold of capture count threshold*/
            .CapCntThreshold = 1,
            /**< pwm channel capture mode the threshold of clock ratio */
            .ClockRatio = 0,
            /**< pwm channel capture mode interrupt request mask */
            .EnableInt = TRUE,
            /**< pwm channel capture mode dma request mask */
            .EnableDma = FALSE,
            /**< pwm channel capture mode dma request mask */
            .HwTrigMask = TRUE,
            /**< pwm channel capture mode the threshold of hardware trig width */
            .HwTrigWidth = 0,
            /**< pwm channel capture mode Default Start Edge */
            .Edge = PWM_ICU_BOTH_EDGES,
            /**< pwm channel capture mode notification enable or disable */
            .NotificationEnable = FALSE,
            /**< The notification functions shall have no parameters and no return value.*/
            .Notification = NULL_PTR,
            /**< The measurement type of pwm channel */
            .MeasurementType = PWM_ICU_PERIOD_TIME,
            /**< Decide whether to update timestamp during interruption  */
            .UpdateTimeStampIndexInIsr = FALSE,
            /** Time stamp Buffer type, linear or cyclic*/
            .TimeStampBufferType = ICU_LINEAR_BUFFER,
            /**< dma complete callback enable or disable */
            .DmaCpltCallbackEnable = FALSE,
            /**< The functions of dma complete callback */
            .DmaCpltCallback = NULL_PTR,
        },
    },
};
```
| Parameter | Description |
| :-------- | :---------- |
| HwChannelId | PWM 硬件通道号 |
| HwIpId | PWM 控制器实例号 |
| GlitchFilterEn | 捕获去抖使能 |
| GlitchThreshold | 去抖阈值 |
| CapCntThreshold | 捕获计数阈值 |
| ClockRatio | 捕获时钟比配置 |
| EnableInt | 捕获中断使能 |
| EnableDma | 捕获 DMA 使能 |
| HwTrigMask | 硬件触发屏蔽控制 |
| HwTrigWidth | 硬件触发宽度阈值 |
| Edge | 默认捕获边沿 |
| NotificationEnable | 回调通知使能 |
| Notification | 回调函数指针 |
| MeasurementType | 测量类型（周期/高电平时间/占空比等） |
| UpdateTimeStampIndexInIsr | 是否在 ISR 中更新时间戳索引 |
| TimeStampBufferType | 时间戳缓冲区类型（线性/环形） |
| DmaCpltCallbackEnable | DMA 完成回调使能 |
| DmaCpltCallback | DMA 完成回调函数指针 |

### PWM输入捕获使用说明
用户在完成上述配置后，即可通过调用 ICU 提供的 API 来启用 PWM 输入捕获功能。 API接口如下：
1. 调用 `Icu_Init` 初始化 ICU 模块。
2. 调用 `Icu_EnableEdgeCount` 启用边沿计数功能。
3. 调用 `Icu_GetEdgeNumbers` 获取捕获到的边沿数量。
4. 调用 `Icu_ResetEdgeCount` 重置边沿计数。
5. 调用 `Icu_StartSignalMeasurement` 启动信号测量。
6. 调用 `Icu_GetDutyCycleValues` 获取占空比值和周期值。
7. 调用 `Icu_StopSignalMeasurement` 停止信号测量。
```c
