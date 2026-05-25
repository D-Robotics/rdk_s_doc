---
sidebar_position: 14
---
# 7.5.15 ICU 使用指南

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK S100">

ICU 模块是基于 S100芯片解决方案的一个软件子模块，在整个系统属于基础服务软件。在 S100整体设计中，ICU 软件主要是对系统内有输入捕获属性的硬件进行软件抽象并统一管理，硬件层 IP 涉及到 PWM 和 GPIO 两个硬件。本文重点介绍 GPIO 中断的配置和实现。

## GPIO 中断使用指南

S100 MCU 中，GPIO 共有四个 IO 组，分别是3个 GPIO0，GPIO1，GPIO2，GPIO_AON。其中，前三组共计提供88个 Pin，而 GPIO_AON 组则提供12个 Pin。该部分可参考 `mcu/Config/McalCdd/gen_s100_sip_B_mcu1/Port/src/Port_PBcfg.c` 。所有的 Pin 支持的中断触发模式包括：上升沿、下降沿、双边沿以及高/低电平触发。

| ISR Function | IRQ | IRQ Define           | Description |
| :----------- | :-- | :------------------- | :---------- |
| Gpio0_ExtIsr | 68  | MCUSYS_GPIO0_INTR    | Gpio Mode   |
| Gpio1_ExtIsr | 69  | MCUSYS_GPIO1_INTR    | Gpio Mode   |
| Gpio2_ExtIsr | 70  | MCUSYS_GPIO2_INTR    | Gpio Mode   |
| Gpio3_ExtIsr | 361 | AON_WAKEUP_GPIO_INTR | Gpio Mode   |

### Port 配置

S100 MCU 上的每个 Pin 支持至少一个功能，因此在使用 GPIO 中断之前需要通过 Port 子系统配置 Pin 的功能和属性，也就是重定义过程。以 `GPIO_MCU[20]` 和 `GPIO_MCU[21]` 为例子，这两个 Pin 的功能如下：

| FUNC0     | IO TYPE0 | FUNC1      | IO TYPE1 | FUNC2   | IO TYPE2 | FUNC3        | IO TYPE3 |
| :-------- | :------- | :--------- | :------- | :------ | :------- | :----------- | :------- |
| SPI3_CSN0 | O        | DEBUG_OUT5 | O        | TRC_CTL | O        | GPIO_MCU[20] | IO       |
| SPI3_CSN1 | IO       | PPS_IN0    | I        | TRC_CLK | O        | GPIO_MCU[21] | IO       |

需要将两个 Pin 配置为 FUNC3，即 GPIO 模式，关于 Port 的介绍和使用可以查阅 [Port使用指南](./12_mcu_port/01_user_manual.md) 和 [Port开发指南](./12_mcu_port/02_development_manual.md) 这两个章节。具体的配置文件为 `mcu/Config/McalCdd/gen_s100_sip_B_mcu1/Port/src/Port_PBcfg.c`。

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

### ICU 配置

ICU 文件列表：

> - mcu/McalCdd/Icu/src/Icu_Lld_Gpio.c
> - mcu/McalCdd/Icu/src/Icu_Lld.c
> - mcu/McalCdd/Icu/src/Icu.c
> - mcu/McalCdd/Icu/inc/Icu_Lld_Gpio.h
> - mcu/McalCdd/Icu/inc/Icu_Lld.h
> - mcu/McalCdd/Icu/inc/Icu_Types.h
> - mcu/McalCdd/Icu/inc/Icu.h

GPIO 中断功能由 ICU 统一管理，其引脚的详细属性（如中断类型、回调函数等）均需通过 ICU 配置。具体的配置文件为 `mcu/Config/McalCdd/gen_s100_sip_B_mcu1/Icu/src/Icu_PBCfg.c` ，通过修改 `Icu_ConfigType` 、 `Icu_Lld_IpConfigType` 、 `Gpio_Icu_IpConfigType`、 `Icu_Lld_ChannelConfigType` 、 `Icu_ChannelConfigType` 、 `Gpio_Icu_ChannelConfigType` 等结构体实现。 其中， `Gpio_Icu_ChannelConfigType` 是关键结构，负责定义中断回调函数、触发类型及中断屏蔽位等。

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
| nNumInstances        | GPIO 控制器实例数                            |
| NumChannels          | 通道数(或引脚数)                            |
| Icu_ChannelConfigPtr | 指向 `Icu_ChannelConfigType` 结构体的指针 |
| Icu_LldConfigPtr     | 指向 `Icu_Lld_IpConfigType` 结构体的指针  |

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
| instanceNo   | 控制器实例(如0 - GPIO0)                         |
| InstanceMode | GPIO 或者 PWM 模式                                 |
| GpioConfig   | 指向 `Icu_Lld_ChannelConfigType` 结构体的指针 |

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
| NumChannels    | 通道数                                           |
| instanceNo     | 控制器实例(如0 - GPIO0)                          |
| ChannelsConfig | 指向 `Gpio_Icu_ChannelConfigType` 结构体的指针 |

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
| ChannelId               | 通道标识符                                    |
| Icu_LldChannelConfigPtr | 指向 `Icu_Lld_ChannelConfigType` 结构的指针 |

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
| ChannelMode         | GPIO 或者 PWM 模式                                  |
| instanceNo          | 控制器实例(如0 - GPIO0)                          |
| gpioHwChannelConfig | 指向 `Gpio_Icu_ChannelConfigType` 结构体的指针 |

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
| PinId                   | 引脚号(或通道号)                                                                                   |
| instanceNo              | 控制器实例(如0 - GPIO0)                                                                            |
| DefaultStartEdge        | 中断触发方式:<br />1. 下降沿<br />2. 上升沿<br />3. 上升沿或者下降沿<br />4. 高电平<br />5. 低电平 |
| NotificationEnable      | 是否启用回调                                                                                       |
| GpioChannelNotification | 回调函数指针(无传参，无返回值)                                                                     |
| IntEnable               | 是否使能中断:<br />- `TRUE`：使能中断<br />- `FALSE`：禁止中断                                 |
| IntMask                 | 是否屏蔽中断:<br />- `TRUE`：屏蔽中断<br />- `FALSE`：不屏蔽中断                               |

`IntEnable` 与 `IntMask` 均用于中断开关控制，两者区别在于：

- `IntEnable`： 为 `FALSE` 时，从根本上禁止中断产生，中断状态寄存器不会置位。
- `IntMask`： 为 `TRUE` 时，仅阻止中断信号上报至 CPU，但中断事件仍会触发并在状态寄存器中置位。

配置建议:

- 启用中断时：`IntEnable = TRUE` 且 `IntMask = FALSE`。
- 禁用中断时：`IntEnable = FALSE` 且 `IntMask = TRUE`。

回调函数是中断触发后的最终入口，完整流程为：中断函数 -> ICU 中断处理函数 -> 回调函数。
`NotificationEnable` 用于控制是否执行回调函数，将其设为 `FALSE` 会跳过回调，但不影响中断的发生与标志位的产生。若要完整启用中断及回调，必须确保 `NotificationEnable = TRUE`、`IntEnable = TRUE`、`IntMask = FALSE` 且 `GpioChannelNotification` 指向具体的回调函数。建议回调函数名应体现其所属 Instance 与 Channel，如 `Icu_Gpio_Channel_0_20_ISR`。具体的回调函数在文件 `mcu/samples/Interrupt/src/gpio_Interrupt_test.c` 定义:

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

> 值得注意的一点是，用户仅需在回调函数中实现业务逻辑，无需手动清除中断标志位，此操作由 ICU 驱动自动完成。

### 中断实现

配置中断前，需明确目标引脚（Pin）所绑定的中断号（IRQ）及其中断入口函数。基于本文前述对 MCU GPIO 中断资源的介绍，可知引脚 `GPIO_MCU[20]` 与 `GPIO_MCU[21]` 共享中断入口函数 `Gpio0_ExtIsr` ，其对应的中断号为68。中断的注册、优先级配置及使能过程，均在源文件 `mcu/McalCdd/Icu/src/Icu_Lld_Gpio.c` 中定义。

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

用户只需要调用 `Icu_Gpio_Interrupt_Init` 和 `Icu_Gpio_Interrupt_DeInit` 函数使能和禁止中断即可，相关实现位于 `mcu/samples/Interrupt/src/gpio_Interrupt_test.c`。

```c
/** init interrupt */
Icu_Gpio_Interrupt_Init(0, 30);

/** deinit interrupt */
Icu_Gpio_Interrupt_DeInit(0);
```

## GPIO 中断 sample

在 MCU1串口端初始化 GPIO 中断

```bash
D-Robotics:/$ gpio_interrupt on
[0975.377836 0]INFO: Start gpio_interrupt test...
```

用杜邦线一头接下图的两个 GPIO 引脚，另一头接地

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/gpio_interrupt.png" alt="GPIO接线图" style={{ width: '100%' }} />

此时串口打印如下则表示 GPIO 中断触发成功

```bash
# GPIO_MCU[20] 回调函数 0-instanceNo，20-PinId
[0667.710363 0]INFO: Enter Icu_Gpio_Channel_0_20_ISR!!!

# GPIO_MCU[21] 回调函数 0-instanceNo，21-PinId
[0593.171002 0]INFO: Enter Icu_Gpio_Channel_0_21_ISR!!!
```

通过下面方式关闭 GPIO 中断

```bash
D-Robotics:/$ gpio_interrupt off
[0673.558143 0]INFO: Stop gpio_interrupt test
```

</DocScope>
<DocScope products="RDK S600">

ICU 模块是基于 S600芯片解决方案的一个软件子模块，在整个系统属于基础服务软件。在 S600整体设计中，ICU 软件主要是对系统内有输入捕获属性的硬件进行软件抽象并统一管理，硬件层 IP 涉及到 PWM 和 GPIO 两个硬件。本文重点介绍 GPIO 中断的配置和实现。

## GPIO 中断使用指南

S600 MCU 中，GPIO 共有5个 IO 组，分别是 GPIO0，GPIO1，GPIO2，GPIO3, GPIO_AON。其中，GPIO 组共计提供105个 Pin，而 GPIO_AON 组则提供42个 Pin。该部分可参考 `mcu/Config/McalCdd/gen_S600_sip_B_mcu1/Port/src/Port_PBcfg.c` 。所有的 Pin 支持的中断触发模式包括：上升沿、下降沿、双边沿以及高/低电平触发。

| ISR Function | IRQ | IRQ Define        | Description |
| :----------- | :-- | :---------------- | :---------- |
| Gpio0_ExtIsr | 89  | MCUSYS_GPIO0_INTR | Gpio Mode   |
| Gpio1_ExtIsr | 90  | MCUSYS_GPIO1_INTR | Gpio Mode   |
| Gpio2_ExtIsr | 91  | MCUSYS_GPIO2_INTR | Gpio Mode   |
| Gpio3_ExtIsr | 92  | MCUSYS_GPIO3_INTR | Gpio Mode   |
| Gpio4_ExtIsr | 371 | AON_GPIO_INTR     | Gpio Mode   |

### Port 配置

S600 MCU 上的每个 Pin 支持至少一个功能，因此在使用 GPIO 中断之前需要通过 Port 子系统配置 Pin 的功能和属性，也就是重定义过程。以 `GPIO_MCU[52]` 和 `GPIO_MCU[53]` 为例子，这两个 Pin 的功能如下：

| FUNC0   | IO TYPE0 | FUNC1      | IO TYPE1 | FUNC2     | IO TYPE2 | FUNC3        | IO TYPE3 |
| :------ | :------- | :--------- | :------- | :-------- | :------- | :----------- | :------- |
| PWM4_IO | IO       | SPI11_MISO | I        | USS_PWM17 | IO       | GPIO_MCU[52] | IO       |
| PWM5_IO | IO       | SPI11_SCLK | O        | USS_PWM18 | IO       | GPIO_MCU[53] | IO       |

需要将两个 Pin 配置为 FUNC3，即 GPIO 模式，关于 Port 的介绍和使用可以查阅 [Port使用指南](./12_mcu_port/01_user_manual.md) 和 [Port开发指南](./12_mcu_port/02_development_manual.md) 这两个章节。具体的配置文件为 `mcu/Config/McalCdd/gen_s600_md/Port/src/Port_PBcfg.c`。

```c
static const Port_Lld_PinConfigType Port_McuPinConfigs[PORT_MCU_MAX_NUM]=
{
    ...
    /* Pin Id,  Pin name,      IsUsed,        ModeChang,    SchmittTriger,  InputEnable,     IsUsedGpio,     DirChang,   PinMode,    Config Type,        Pull Type,       Drive Strength,         GpioDir,           GpioData*/
    {(uint8)52, "ICU_GPIO1", (boolean)TRUE, {(boolean)TRUE, (boolean)FALSE, (boolean)TRUE, (boolean)TRUE, (boolean)TRUE, GPIO, PORT_PIN_CONFIG_TYPE0, PORT_PULL_DOWN, PORT_DRIVE_DEFAULT, PORT_PIN_DIR_IN, PORT_PIN_LEVEL_LOW}},
    /* Pin Id,  Pin name,      IsUsed,        ModeChang,    SchmittTriger,  InputEnable,     IsUsedGpio,     DirChang,   PinMode,    Config Type,        Pull Type,       Drive Strength,         GpioDir,           GpioData*/
    {(uint8)53, "ICU_GPIO2", (boolean)TRUE, {(boolean)TRUE, (boolean)FALSE, (boolean)TRUE, (boolean)TRUE, (boolean)TRUE, GPIO, PORT_PIN_CONFIG_TYPE0, PORT_PULL_DOWN, PORT_DRIVE_DEFAULT, PORT_PIN_DIR_IN, PORT_PIN_LEVEL_LOW}},
    ...
}
```

### ICU 配置

ICU 文件列表：

> - mcu/McalCdd/Icu/src/Icu_Lld_Gpio.c
> - mcu/McalCdd/Icu/src/Icu_Lld.c
> - mcu/McalCdd/Icu/src/Icu.c
> - mcu/McalCdd/Icu/inc/Icu_Lld_Gpio.h
> - mcu/McalCdd/Icu/inc/Icu_Lld.h
> - mcu/McalCdd/Icu/inc/Icu_Types.h
> - mcu/McalCdd/Icu/inc/Icu.h

GPIO 中断功能由 ICU 统一管理，其引脚的详细属性（如中断类型、回调函数等）均需通过 ICU 配置。具体的配置文件为 `mcu/Config/McalCdd/gen_s600_md_mcu1/Icu/src/Icu_PBCfg.c` ，通过修改 `Icu_ConfigType` 、 `Icu_Lld_IpConfigType` 、 `Gpio_Icu_IpConfigType`、 `Icu_Lld_ChannelConfigType` 、 `Icu_ChannelConfigType` 、 `Gpio_Icu_ChannelConfigType` 等结构体实现。 其中， `Gpio_Icu_ChannelConfigType` 是关键结构，负责定义中断回调函数、触发类型及中断屏蔽位等。

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
| nNumInstances        | GPIO 控制器实例数                            |
| NumChannels          | 通道数(或引脚数)                            |
| Icu_ChannelConfigPtr | 指向 `Icu_ChannelConfigType` 结构体的指针 |
| Icu_LldConfigPtr     | 指向 `Icu_Lld_IpConfigType` 结构体的指针  |

#### Icu_Lld_IpConfigType

```c
#define ICU_CONF_IPS_PB 1

/** @brief Array of high level Icu channel Config Type*/
static Icu_Lld_IpConfigType Icu_Lld_IpConfig_PB[ICU_CONF_IPS_PB] = {
    /** @brief gpio module 1 */
    {
        /**< id of gpio icu module in the Icu configuration */
        .instanceNo = 1,
        /**< The IP type used. */
        .InstanceMode = ICU_GPIO_MODULE,
        /**< gpio IP configure type. */
        .GpioConfig = &Icu_Gpio_IpConfig_PB[0],
    },
};
```

| Parameter    | Description                                     |
| :----------- | :---------------------------------------------- |
| instanceNo   | 控制器实例(如1 - GPIO1)                         |
| InstanceMode | GPIO 或者 PWM 模式                                 |
| GpioConfig   | 指向 `Icu_Lld_ChannelConfigType` 结构体的指针 |

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
        .instanceNo = 1,
        /**< id of gpio icu module in the Icu configuration */
        .ChannelsConfig = Icu_Gpio_ChannelConfig_PB[0],
    },
};
```

| Parameter      | Description                                      |
| :------------- | :----------------------------------------------- |
| NumChannels    | 通道数                                           |
| instanceNo     | 控制器实例(如0 - GPIO0)                          |
| ChannelsConfig | 指向 `Gpio_Icu_ChannelConfigType` 结构体的指针 |

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
| ChannelId               | 通道标识符                                    |
| Icu_LldChannelConfigPtr | 指向 `Icu_Lld_ChannelConfigType` 结构的指针 |

#### Icu_Lld_ChannelConfigType

```c
#define ICU_GPIO_CONF_MODS_PB 1

/** @brief Array of Gpio Channel ConfigType channels*/
static Icu_Lld_ChannelConfigType Icu_Lld_Gpio_ChannelConfig_PB[ICU_GPIO_CONF_MODS_PB][32] = {
    /** @brief gpio module 1 */
    {
        /** @brief gpio mod 1 channel 20 */
        {
            .ChannelMode = ICU_GPIO_MODULE,
            .instanceNo = 1,
            .gpioHwChannelConfig = &Icu_Gpio_ChannelConfig_PB[0][0],
        },
        /** @brief gpio mod 1 channel 21 */
        {
            .ChannelMode = ICU_GPIO_MODULE,
            .instanceNo = 1,
            .gpioHwChannelConfig = &Icu_Gpio_ChannelConfig_PB[0][1],
        },
    },
};
```

| Parameter           | Description                                      |
| :------------------ | :----------------------------------------------- |
| ChannelMode         | GPIO 或者 PWM 模式                                  |
| instanceNo          | 控制器实例(如1 - GPIO1)                          |
| gpioHwChannelConfig | 指向 `Gpio_Icu_ChannelConfigType` 结构体的指针 |

#### `Gpio_Icu_ChannelConfigType`

```c
#define ICU_GPIO_CONF_MODS_PB 1

extern void Icu_Gpio_Channel_0_20_ISR(void);
extern void Icu_Gpio_Channel_0_21_ISR(void);

/** @brief Array of Gpio Channel ConfigType channels*/
static Gpio_Icu_ChannelConfigType Icu_Gpio_ChannelConfig_PB[ICU_GPIO_CONF_MODS_PB][32] = {
    /** @brief gpio module 1 */
    {
        /** @brief gpio mod 1 channel 20 */
        {
            /**< Assigned GPIO channel id*/
            .PinId = 20,
            /**< Assigned GPIO ip id*/
            .instanceNo = 1,
            /**< GPIO Default Start Edge */
            .DefaultStartEdge = GPIO_ICU_BOTH_EDGES,
            /**< Notification Enable.*/
            .NotificationEnable = TRUE,
            /**< The notification functions shall have no parameters and no return value.*/
            .GpioChannelNotification = Icu_Gpio_Channel_1_20_ISR,
            /**< Interrupt Enable or Disable . */
            .IntEnable = TRUE,
            /**< Interrupt Mask or Umask . */
            .IntMask = FALSE,
        },
        /** @brief gpio mod 1 channel 21 */
        {
            /**< Assigned GPIO channel id*/
            .PinId = 21,
            /**< Assigned GPIO ip id*/
            .instanceNo = 1,
            /**< GPIO Default Start Edge */
            .DefaultStartEdge = GPIO_ICU_BOTH_EDGES,
            /**< Notification Enable.*/
            .NotificationEnable = TRUE,
            /**< The notification functions shall have no parameters and no return value.*/
            .GpioChannelNotification = Icu_Gpio_Channel_1_21_ISR,
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
| PinId                   | 引脚号(或通道号)                                                                                   |
| instanceNo              | 控制器实例(如0 - GPIO0)                                                                            |
| DefaultStartEdge        | 中断触发方式:<br />1. 下降沿<br />2. 上升沿<br />3. 上升沿或者下降沿<br />4. 高电平<br />5. 低电平 |
| NotificationEnable      | 是否启用回调                                                                                       |
| GpioChannelNotification | 回调函数指针(无传参，无返回值)                                                                     |
| IntEnable               | 是否使能中断:<br />- `TRUE`：使能中断<br />- `FALSE`：禁止中断                                 |
| IntMask                 | 是否屏蔽中断:<br />- `TRUE`：屏蔽中断<br />- `FALSE`：不屏蔽中断                               |

`IntEnable` 与 `IntMask` 均用于中断开关控制，两者区别在于：

- `IntEnable`： 为 `FALSE` 时，从根本上禁止中断产生，中断状态寄存器不会置位。
- `IntMask`： 为 `TRUE` 时，仅阻止中断信号上报至 CPU，但中断事件仍会触发并在状态寄存器中置位。

配置建议:

- 启用中断时：`IntEnable = TRUE` 且 `IntMask = FALSE`。
- 禁用中断时：`IntEnable = FALSE` 且 `IntMask = TRUE`。

回调函数是中断触发后的最终入口，完整流程为：中断函数 -> ICU 中断处理函数 -> 回调函数。
`NotificationEnable` 用于控制是否执行回调函数，将其设为 `FALSE` 会跳过回调，但不影响中断的发生与标志位的产生。若要完整启用中断及回调，必须确保 `NotificationEnable = TRUE`、`IntEnable = TRUE`、`IntMask = FALSE` 且 `GpioChannelNotification` 指向具体的回调函数。建议回调函数名应体现其所属 Instance 与 Channel，如 `Icu_Gpio_Channel_0_20_ISR`。具体的回调函数在文件 `mcu/samples/Interrupt/src/gpio_Interrupt_test.c` 定义:

```c
/** GPIO_MCU[52] interrupt callback function */
void Icu_Gpio_Channel_1_20_ISR(void)
{
    LogSync("enter Icu_Gpio_Channel_1_20_ISR!!!\r\n");
    /** Add user code here */
}

/** GPIO_MCU[53] interrupt callback function */
void Icu_Gpio_Channel_1_21_ISR(void)
{
    LogSync("enter Icu_Gpio_Channel_1_21_ISR!!!\r\n");
    /** Add user code here */
}
```

> 值得注意的一点是，用户仅需在回调函数中实现业务逻辑，无需手动清除中断标志位，此操作由 ICU 驱动自动完成。

### 中断实现

配置中断前，需明确目标引脚（Pin）所绑定的中断号（IRQ）及其中断入口函数。基于本文前述对 MCU GPIO 中断资源的介绍，可知引脚 `GPIO_MCU[52]` 与 `GPIO_MCU[53]` 共享中断入口函数 `Gpio1_ExtIsr` ，其对应的中断号为90。中断的注册、优先级配置及使能过程，均在源文件 `mcu/McalCdd/Icu/src/Icu_Lld_Gpio.c` 中定义。

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
#if ((SOC_TYPE == SOC_TYPE_S100) || (SOC_TYPE == SOC_TYPE_S100P))
    case 3:
        INT_SYS_InstallHandler(AON_WAKEUP_GPIO_INTR, Gpio3_ExtIsr, 0);
        INT_SYS_SetPriority(AON_WAKEUP_GPIO_INTR, priority);
        INT_SYS_EnableIRQ(AON_WAKEUP_GPIO_INTR);
        break;
#endif
#if ((SOC_TYPE == SOC_TYPE_S600) || (SOC_TYPE == SOC_TYPE_S300))
    case 3:
        INT_SYS_InstallHandler(MCUSYS_GPIO3_INTR, Gpio3_ExtIsr, 0);
        INT_SYS_SetPriority(MCUSYS_GPIO3_INTR, priority);
        INT_SYS_EnableIRQ(MCUSYS_GPIO3_INTR);
        break;
    case 4:
        INT_SYS_InstallHandler(AON_GPIO_INTR, Gpio4_ExtIsr, 0);
        INT_SYS_SetPriority(AON_WAKEUP_GPIO_INTR, priority);
        INT_SYS_EnableIRQ(AON_WAKEUP_GPIO_INTR);
        break;
#endif
    default:
        break;
    }
}

// coverity[misra_c_2012_rule_8_7_violation:SUPPRESS], ## violation reason
// SYSSW_V_8.7_02
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
#if ((SOC_TYPE == SOC_TYPE_S100) || (SOC_TYPE == SOC_TYPE_S100P))
    case 3:
        INT_SYS_DisableIRQ(AON_WAKEUP_GPIO_INTR);
        break;
#endif
#if ((SOC_TYPE == SOC_TYPE_S600) || (SOC_TYPE == SOC_TYPE_S300))
    case 3:
        INT_SYS_DisableIRQ(MCUSYS_GPIO3_INTR);
        break;
    case 4:
        INT_SYS_DisableIRQ(AON_WAKEUP_GPIO_INTR);
        break;
#endif
    default:
        break;
    }
}
```

用户只需要调用 `Icu_Gpio_Interrupt_Init` 和 `Icu_Gpio_Interrupt_DeInit` 函数使能和禁止中断即可，相关实现位于 `mcu/samples/Interrupt/src/gpio_Interrupt_test.c`。

```c
/** init interrupt */
Icu_Gpio_Interrupt_Init(1, 30);

/** deinit interrupt */
Icu_Gpio_Interrupt_DeInit(1);
```

## GPIO 中断 sample

在 MCU1串口端初始化 GPIO 中断

```bash
D-Robotics:/$ gpio_interrupt on
[0975.377836 0]INFO: Start gpio_interrupt test...
```

用杜邦线一头接下图的两个 GPIO 引脚，另一头接地

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/02_S600/gpio_interrupt.png" alt="GPIO接线图" style={{ width: '100%' }} />

此时串口打印如下则表示 GPIO 中断触发成功

```bash
# GPIO_MCU[52] 回调函数 1-instanceNo，20-PinId
[0667.710363 0]INFO: Enter Icu_Gpio_Channel_1_20_ISR!!!

# GPIO_MCU[53] 回调函数 1-instanceNo，21-PinId
[0593.171002 0]INFO: Enter Icu_Gpio_Channel_1_21_ISR!!!
```

通过下面方式关闭 GPIO 中断

```bash
D-Robotics:/$ gpio_interrupt off
[0673.558143 0]INFO: Stop gpio_interrupt test
```

</DocScope>
