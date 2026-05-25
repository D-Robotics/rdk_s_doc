---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';

# 7.5.13.1 Port使用指南
## 基本概述
Port子系统是MCU上对PIN的功能和属性进行配置的子系统。

## Port_Func模块PIN号对应的PIN名称列表{#pin_list}
下表中各列含义如下：
    - PIN序号：**Port子模块中使用的PIN序号**；
    - PIN Name：PIN的命名；
    - GPIO编号：用于获取GPIO控制器地址偏移及GPIO控制器寄存器偏移的编号；

<DocScope products="RDK S100">
| PIN序号 | PIN Name      | GPIO编号       |
|-------|---------------|--------------|
| 0     | FUSA_ERR0     | GPIO_MCU[0]  |
| 1     | FUSA_ERR1     | GPIO_MCU[1]  |
| 2     | PPS_INOUT     | GPIO_MCU[2]  |
| 3     | LIN1_TXD      | GPIO_MCU[3]  |
| 4     | LIN2_TXD      | GPIO_MCU[4]  |
| 5     | CAN0_TX       | GPIO_MCU[5]  |
| 6     | CAN1_TX       | GPIO_MCU[6]  |
| 7     | CAN2_TX       | GPIO_MCU[7]  |
| 8     | CAN3_TX       | GPIO_MCU[8]  |
| 9     | CAN4_TX       | GPIO_MCU[9]  |
| 10    | CAN5_TX       | GPIO_MCU[10] |
| 11    | CAN6_TX       | GPIO_MCU[11] |
| 12    | CAN7_TX       | GPIO_MCU[12] |
| 13    | CAN8_TX       | GPIO_MCU[13] |
| 14    | CAN9_TX       | GPIO_MCU[14] |
| 15    | SPI2_CSN1     | GPIO_MCU[15] |
| 16    | SPI2_CSN0     | GPIO_MCU[16] |
| 17    | SPI2_MOSI     | GPIO_MCU[17] |
| 18    | SPI2_MISO     | GPIO_MCU[18] |
| 19    | SPI2_SCLK     | GPIO_MCU[19] |
| 20    | SPI3_CSN0     | GPIO_MCU[20] |
| 21    | SPI3_CSN1     | GPIO_MCU[21] |
| 22    | SPI3_MOSI     | GPIO_MCU[22] |
| 23    | SPI3_MISO     | GPIO_MCU[23] |
| 24    | SPI3_SCLK     | GPIO_MCU[24] |
| 25    | SPI4_CSN0     | GPIO_MCU[25] |
| 26    | SPI4_CSN1     | GPIO_MCU[26] |
| 27    | SPI4_MOSI     | GPIO_MCU[27] |
| 28    | SPI4_MISO     | GPIO_MCU[28] |
| 29    | SPI4_SCLK     | GPIO_MCU[29] |
| 30    | SPI5_CSN0     | GPIO_MCU[30] |
| 31    | SPI5_CSN1     | GPIO_MCU[31] |
| 32    | SPI5_MOSI     | GPIO_MCU[32] |
| 33    | SPI5_MISO     | GPIO_MCU[33] |
| 34    | SPI5_SCLK     | GPIO_MCU[34] |
| 35    | SPI6_CSN0     | GPIO_MCU[35] |
| 36    | SPI6_CSN1     | GPIO_MCU[36] |
| 37    | SPI6_MOSI     | GPIO_MCU[37] |
| 38    | SPI6_MISO     | GPIO_MCU[38] |
| 39    | SPI6_SCLK     | GPIO_MCU[39] |
| 40    | XSPI_MOSI_IO0 | GPIO_MCU[40] |
| 41    | XSPI_MISO_IO1 | GPIO_MCU[41] |
| 42    | XSPI_WP_IO2   | GPIO_MCU[42] |
| 43    | XSPI_HOLD_IO3 | GPIO_MCU[43] |
| 44    | XSPI_OCT_IO4  | GPIO_MCU[44] |
| 45    | XSPI_OCT_IO5  | GPIO_MCU[45] |
| 46    | XSPI_OCT_IO6  | GPIO_MCU[46] |
| 47    | XSPI_OCT_IO7  | GPIO_MCU[47] |
| 48    | XSPI_SCLK     | GPIO_MCU[48] |
| 49    | XSPI_SCLK_INV | GPIO_MCU[49] |
| 50    | XSPI_DQS      | GPIO_MCU[50] |
| 51    | EMAC_TX_CLK   | GPIO_MCU[51] |
| 52    | EMAC_TX_EN    | GPIO_MCU[52] |
| 53    | EMAC_TX_D3    | GPIO_MCU[53] |
| 54    | EMAC_TX_D2    | GPIO_MCU[54] |
| 55    | EMAC_TX_D1    | GPIO_MCU[55] |
| 56    | EMAC_TX_D0    | GPIO_MCU[56] |
| 57    | EMAC_RX_CLK   | GPIO_MCU[57] |
| 58    | EMAC_RX_DV    | GPIO_MCU[58] |
| 59    | EMAC_RX_D3    | GPIO_MCU[59] |
| 60    | EMAC_RX_D2    | GPIO_MCU[60] |
| 61    | EMAC_RX_D1    | GPIO_MCU[61] |
| 62    | EMAC_RX_D0    | GPIO_MCU[62] |
| 63    | XSPI_CSN      | GPIO_MCU[63] |
| 64    | XSPI_RST_N    | GPIO_MCU[64] |
| 65    | XSPI_ECC_FAIL | GPIO_MCU[65] |
| 66    | XSPI_HYP_INT  | GPIO_MCU[66] |
| 67    | BIFSPI_CSN    | GPIO_MCU[67] |
| 68    | BIFSPI_SCLK   | GPIO_MCU[68] |
| 69    | BIFSPI_MOSI   | GPIO_MCU[69] |
| 70    | BIFSPI_MISO   | GPIO_MCU[70] |
| 71    | PMIC_ERR0     | GPIO_MCU[71] |
| 72    | JTG_TCK       | GPIO_MCU[72] |
| 73    | JTG_TRSTN     | GPIO_MCU[73] |
| 74    | JTG_TMS       | GPIO_MCU[74] |
| 75    | JTG_TDI       | GPIO_MCU[75] |
| 76    | JTG_TDO       | GPIO_MCU[76] |
| 77    | EMAC_MDC      | GPIO_MCU[77] |
| 78    | EMAC_MDIO     | GPIO_MCU[78] |
| 79    | Reserved      | N/A          |
| 80    | I2C6_SCL      | GPIO_MCU[79] |
| 81    | I2C6_SDA      | GPIO_MCU[80] |
| 82    | I2C7_SCL      | GPIO_MCU[81] |
| 83    | I2C7_SDA      | GPIO_MCU[82] |
| 84    | I2C8_SCL      | GPIO_MCU[83] |
| 85    | I2C8_SDA      | GPIO_MCU[84] |
| 86    | PWM0_IO       | GPIO_MCU[85] |
| 87    | PWM1_IO       | GPIO_MCU[86] |
| 88    | CAN0_RX       | GPIO_AON[0]  |
| 89    | CAN1_RX       | GPIO_AON[1]  |
| 90    | CAN2_RX       | GPIO_AON[2]  |
| 91    | CAN3_RX       | GPIO_AON[3]  |
| 92    | CAN4_RX       | GPIO_AON[4]  |
| 93    | CAN5_RX       | GPIO_AON[5]  |
| 94    | CAN6_RX       | GPIO_AON[6]  |
| 95    | CAN7_RX       | GPIO_AON[7]  |
| 96    | CAN8_RX       | GPIO_AON[8]  |
| 97    | CAN9_RX       | GPIO_AON[9]  |
| 98    | LIN1_RXD      | GPIO_AON[10] |
| 99    | LIN2_RXD      | GPIO_AON[11] |
| 100   | Reserved      | N/A          |
| 101   | Reserved      | N/A          |
| 102   | Reserved      | N/A          |
| 103   | Reserved      | N/A          |
| 104   | Reserved      | N/A          |
| 105   | WAKEUP_IO     | GPIO_AON[12] |

</DocScope>
<DocScope products="RDK S600">
| PIN序号 | PIN Name               | GPIO编号       |
|-------|------------------------|--------------|
| 0     | PPS_IN0                | GPIO_MCU[0]  |
| 1     | PPS_OUT                | GPIO_MCU[1]  |
| 2     | PPS_IN1                | GPIO_MCU[2]  |
| 3     | VALEO_USS_DATA_F0_EN   | GPIO_MCU[3]  |
| 4     | CAN1_TX                | GPIO_MCU[4]  |
| 5     | CAN2_TX                | GPIO_MCU[5]  |
| 6     | CAN3_TX                | GPIO_MCU[6]  |
| 7     | CAN4_TX                | GPIO_MCU[7]  |
| 8     | CAN5_TX                | GPIO_MCU[8]  |
| 9     | CAN6_TX                | GPIO_MCU[9]  |
| 10    | CAN7_TX                | GPIO_MCU[10] |
| 11    | UART8_TX               | GPIO_MCU[11] |
| 12    | VALEO_USS_DATA_F2_EN   | GPIO_MCU[12] |
| 13    | CAN_1042_STB           | GPIO_MCU[13] |
| 14    | UART11_TX              | GPIO_MCU[14] |
| 15    | CAN10_TX               | GPIO_MCU[15] |
| 16    | VALEO_USS_DATA_R5_EN   | GPIO_MCU[16] |
| 17    | VALEO_USS_DATA_R2_EN   | GPIO_MCU[17] |
| 18    | POC_BOOST_PWR_EN       | GPIO_MCU[18] |
| 19    | USS_PWM4               | GPIO_MCU[19] |
| 20    | VALEO_USS_DATA_R3_EN   | GPIO_MCU[20] |
| 21    | SPI13_MISO             | GPIO_MCU[21] |
| 22    | SPI13_SCLK             | GPIO_MCU[22] |
| 23    | VALEO_USS_DATA_F3_EN   | GPIO_MCU[23] |
| 24    | MCU_PERI_PWR           | GPIO_MCU[24] |
| 25    | CAN5_STB               | GPIO_MCU[25] |
| 26    | VALEO_USS_NINT         | GPIO_MCU[26] |
| 27    | CAN8_TX                | GPIO_MCU[27] |
| 28    | CAN9_TX                | GPIO_MCU[28] |
| 29    | SPI6_CSN0              | GPIO_MCU[29] |
| 30    | SPI6_MOSI              | GPIO_MCU[30] |
| 31    | SPI6_MISO              | GPIO_MCU[31] |
| 32    | SPI6_SCLK              | GPIO_MCU[32] |
| 33    | VALEO_USS_SPI_SDI      | GPIO_MCU[33] |
| 34    | VALEO_USS_SPI_CSN      | GPIO_MCU[34] |
| 35    | VALEO_USS_SPI_SCLK     | GPIO_MCU[35] |
| 36    | VALEO_USS_SPI_SDO      | GPIO_MCU[36] |
| 37    | SPI13_CSN1             | GPIO_MCU[37] |
| 38    | SPI13_CSN0             | GPIO_MCU[38] |
| 39    | SPI13_MOSI             | GPIO_MCU[39] |
| 40    | MCU_GPS_RESET          | GPIO_MCU[40] |
| 41    | SPI4_CSN0              | GPIO_MCU[41] |
| 42    | SPI4_CSN1              | GPIO_MCU[42] |
| 43    | SPI4_MOSI              | GPIO_MCU[43] |
| 44    | SPI4_MISO              | GPIO_MCU[44] |
| 45    | SPI4_SCLK              | GPIO_MCU[45] |
| 46    | HSM_UART_RXD           | GPIO_MCU[46] |
| 47    | HSM_UART_TXD           | GPIO_MCU[47] |
| 48    | BYPASS_MUX_EN          | GPIO_MCU[48] |
| 49    | MCU_EXIO_RST           | GPIO_MCU[49] |
| 50    | DES4_POC_EN            | GPIO_MCU[50] |
| 51    | PWM3_IO                | GPIO_MCU[51] |
| 52    | BY_ADAS_DES_PWR_EN     | GPIO_MCU[52] |
| 53    | ADAS_DES_PWR_EN        | GPIO_MCU[53] |
| 54    | PMIC_ERR7              | GPIO_MCU[54] |
| 55    | PMIC_ERR8              | GPIO_MCU[55] |
| 56    | PMIC_ERR9              | GPIO_MCU[56] |
| 57    | LEDPWR_EN              | GPIO_MCU[57] |
| 58    | PMIC_ERR0              | GPIO_MCU[58] |
| 59    | PMIC_ERR1              | GPIO_MCU[59] |
| 60    | PMIC_ERR2              | GPIO_MCU[60] |
| 61    | PMIC_ERR3              | GPIO_MCU[61] |
| 62    | PMIC_ERR4              | GPIO_MCU[62] |
| 63    | SYS_MONO_INT           | GPIO_MCU[63] |
| 64    | EXT_MON_INT            | GPIO_MCU[64] |
| 65    | I2C10_SCL              | GPIO_MCU[65] |
| 66    | I2C10_SDA              | GPIO_MCU[66] |
| 67    | MCU_EXIO_INT           | GPIO_MCU[67] |
| 68    | TMP_ALERT              | GPIO_MCU[68] |
| 69    | I2C12_SCL              | GPIO_MCU[69] |
| 70    | I2C12_SDA              | GPIO_MCU[70] |
| 71    | I2C13_SCL              | GPIO_MCU[71] |
| 72    | I2C13_SDA              | GPIO_MCU[72] |
| 73    | I2C14_SCL              | GPIO_MCU[73] |
| 74    | I2C14_SDA              | GPIO_MCU[74] |
| 75    | XSPI_CSN               | GPIO_MCU[75] |
| 76    | XSPI_RST_N             | GPIO_MCU[76] |
| 77    | XSPI_ECC_FAIL          | GPIO_MCU[77] |
| 78    | DDR_PWROK              | GPIO_MCU[78] |
| 79    | EMAC_MDC               | GPIO_MCU[79] |
| 80    | EMAC_MDIO              | GPIO_MCU[80] |
| 81    | Reserved               | N/A          |
| 82    | EMAC2_TX_CLK           | GPIO_MCU[82] |
| 83    | EMAC2_TX_EN            | GPIO_MCU[83] |
| 84    | EMAC2_TX_D3            | GPIO_MCU[84] |
| 85    | EMAC2_TX_D2            | GPIO_MCU[85] |
| 86    | EMAC2_TX_D1            | GPIO_MCU[86] |
| 87    | EMAC2_TX_D0            | GPIO_MCU[87] |
| 88    | EMAC2_RX_CLK           | GPIO_MCU[88] |
| 89    | EMAC2_RX_DV            | GPIO_MCU[89] |
| 90    | EMAC2_RX_D3            | GPIO_MCU[90] |
| 91    | EMAC2_RX_D2            | GPIO_MCU[91] |
| 92    | EMAC2_RX_D1            | GPIO_MCU[92] |
| 93    | EMAC2_RX_D0            | GPIO_MCU[93] |
| 94    | XSPI_SCLK              | GPIO_MCU[94] |
| 95    | XSPI_SCLK_INV          | GPIO_MCU[95] |
| 96    | XSPI_DQS               | GPIO_MCU[96] |
| 97    | XSPI_MOSI_IO0          | GPIO_MCU[97] |
| 98    | XSPI_MISO_IO1          | GPIO_MCU[98] |
| 99    | XSPI_WP_IO2            | GPIO_MCU[99] |
| 100   | XSPI_HOLD_IO3          | GPIO_MCU[100] |
| 101   | XSPI_OCT_IO4           | GPIO_MCU[101] |
| 102   | XSPI_OCT_IO5           | GPIO_MCU[102] |
| 103   | XSPI_OCT_IO6           | GPIO_MCU[103] |
| 104   | XSPI_OCT_IO7           | GPIO_MCU[104] |
| 105   | WAKE_INH               | GPIO_AON[0]  |
| 106   | IMUPWR_EN              | GPIO_AON[1]  |
| 107   | MCU_PWR_KEEPIO         | GPIO_AON[2]  |
| 108   | MCUPWR_VR5510_INT      | GPIO_AON[3]  |
| 109   | EFUSE_PWR_EN           | GPIO_AON[4]  |
| 110   | CAN8_RX                | GPIO_AON[5]  |
| 111   | CAN9_RX                | GPIO_AON[6]  |
| 112   | CAN10_RX               | GPIO_AON[7]  |
| 113   | SPI8_CSN1              | GPIO_AON[8]  |
| 114   | MAIN_PWR_EN_M          | GPIO_AON[9]  |
| 115   | MAIN_PRE_PWR_EN_M      | GPIO_AON[10] |
| 116   | DRAM_PWR_EN_M          | GPIO_AON[11] |
| 117   | MAIN_DRAM_PRE_PWR_EN_M | GPIO_AON[12] |
| 118   | SPI8_CSN0              | GPIO_AON[13] |
| 119   | SPI8_SCLK              | GPIO_AON[14] |
| 120   | SPI8_MOSI              | GPIO_AON[15] |
| 121   | SPI8_MISO              | GPIO_AON[16] |
| 122   | VALEO_USS_PWR_CH_EN    | GPIO_AON[17] |
| 123   | USSPWR_EN              | GPIO_AON[18] |
| 124   | GPSPWR_EN              | GPIO_AON[19] |
| 125   | UART11_RX              | GPIO_AON[20] |
| 126   | Reserved               | N/A          |
| 127   | Reserved               | N/A          |
| 128   | Reserved               | N/A          |
| 129   | Reserved               | N/A          |
| 130   | UART8_RX               | GPIO_AON[25] |
| 131   | CAN1_RX                | GPIO_AON[26] |
| 132   | CAN2_RX                | GPIO_AON[27] |
| 133   | CAN3_RX                | GPIO_AON[28] |
| 134   | Reserved               | N/A          |
| 135   | Reserved               | N/A          |
| 136   | Reserved               | N/A          |
| 137   | Reserved               | N/A          |
| 138   | Reserved               | N/A          |
| 139   | Reserved               | N/A          |
| 140   | Reserved               | N/A          |
| 141   | CAN4_RX                | GPIO_AON[36] |
| 142   | CAN5_RX                | GPIO_AON[37] |
| 143   | CAN6_RX                | GPIO_AON[38] |
| 144   | CAN7_RX                | GPIO_AON[39] |
| 145   | FUSA_ERR0              | GPIO_AON[40] |
| 146   | FUSA_ERR1              | GPIO_AON[41] |

</DocScope>


## Port_Func模块
Port_Func模块是地瓜提供的针对功能模块对该功能模块下属所有PIN进行初始化配置/操作GPIO的模块。

### Port_Func模块配置PIN功能使用示例
#### 代码示例
使用示例可以参考`samples/Spi/SPI_sample/Spi_sample.c`，基本使用逻辑为：
``` C
...
#include <Port_Func.h>

...

	/* Configure Pin for SPI5 */
	Port_SetFunctionPins(PORT_FUNC_SPI5);

...
```

#### Port_Func模块提供的外设配置
地瓜提供的默认外设PIN配置被记录在：`McalCdd/Port/inc/Port_Func.h`文件内，通过一个由enum类型定义记录：
<DocScope products="RDK S100">
```C
...

typedef enum PinFunctions {
    PORT_FUNC_UART4,
    PORT_FUNC_UART5,
    PORT_FUNC_UART6,
    PORT_FUNC_SPI2,
    PORT_FUNC_SPI3,
    PORT_FUNC_SPI4,
    PORT_FUNC_SPI5,
    PORT_FUNC_SPI6,
    PORT_FUNC_SPI7,
    PORT_FUNC_CAN0,
    PORT_FUNC_CAN1,
    PORT_FUNC_CAN2,
    PORT_FUNC_CAN3,
    PORT_FUNC_CAN4,
    PORT_FUNC_CAN5,
    PORT_FUNC_CAN6,
    PORT_FUNC_CAN7,
    PORT_FUNC_CAN8,
    PORT_FUNC_CAN9,
    PORT_FUNC_I2C6,
    PORT_FUNC_I2C7,
    PORT_FUNC_I2C8,
    PORT_FUNC_I2C9,
    PORT_FUNC_PWM0,
    PORT_FUNC_PWM1,
    PORT_FUNC_PWM2,
    PORT_FUNC_PWM3,
    PORT_FUNC_PWM4,
    PORT_FUNC_PWM5,
    PORT_FUNC_PWM6,
    PORT_FUNC_PWM7,
    PORT_FUNC_PWM8,
    PORT_FUNC_PWM9,
    PORT_FUNC_PWM10,
    PORT_FUNC_PWM11,
    PORT_FUNC_PPS_IN0,
    PORT_FUNC_PPS_IN1,
    PORT_FUNC_PPS_IN2,
    PORT_FUNC_PPS_OUT,
    PORT_FUNC_EMAC,
    PORT_FUNC_MAX,
} PinFunc_e;

...

```

</DocScope>
<DocScope products="RDK S600">
```C
typedef enum PinFunctions {
    /* uart8 - uart11*/
    PORT_FUNC_UART8,
    PORT_FUNC_UART9,
    PORT_FUNC_UART10,
    PORT_FUNC_UART11,
    /* spi4 - spi13*/
    PORT_FUNC_SPI4,
    PORT_FUNC_SPI5,
    PORT_FUNC_SPI6,
    PORT_FUNC_SPI7,
    PORT_FUNC_SPI8,
    PORT_FUNC_SPI9,
    PORT_FUNC_SPI10,
    PORT_FUNC_SPI11,
    PORT_FUNC_SPI12,
    PORT_FUNC_SPI13,
    /* can0 - can15*/
    PORT_FUNC_CAN0,
    ...
    PORT_FUNC_CAN15,
    /* i2c10 - i2c14*/
    PORT_FUNC_I2C10,
    PORT_FUNC_I2C11,
    PORT_FUNC_I2C12,
    PORT_FUNC_I2C13,
    PORT_FUNC_I2C14,
    /* pwm0 - pwm31*/
    PORT_FUNC_PWM0,
    ...
    PORT_FUNC_PWM31,
    /* PPS_IN0 - PPS_OUT */
    PORT_FUNC_PPS_IN0,
    PORT_FUNC_PPS_IN1,
    PORT_FUNC_PPS_IN2,
    PORT_FUNC_PPS_OUT,
    PORT_FUNC_EMAC,
    PORT_FUNC_MAX,
} PinFunc_e;
```

</DocScope>
### Port_Func操作GPIO使用示例
Port_Func提供的GPIO接口，使用的PinIdx为[Port_Func模块PIN号对应的PIN名称列表](#pin_list)

#### 代码示例
使用示例可以参考`samples/Gpio/src/Gpio_sample.c`，基本使用逻辑为：
```C
    /* 配置"PinIdx" PIN为GPIO功能 */
    RetVal = Port_SetGpioByIndex(PinIdx);

    /* 配置"PinIdx" PIN方向为 OUTPUT 并配置输出电平为Level */
    RetVal = Port_GpioDirectionOutput(PinIdx, Level);

    /* 配置"PinIdx" PIN方向为 INPUT */
    RetVal = Port_GpioDirectionInput(PinIdx);

    /* 读取"PinIdx" PIN的值 */
    RetVal = Port_GpioGetValue(PinIdx);

...

```

:::info 注意

    - "Port_GpioGetValue"函数返回的值，在外部PIN脚悬空时，会受到PinCtrl的配置影响，从而读出来的值可能有变化；
    - Port_Func模块提供的GPIO接口，会对具体操作的GPIO进行检查，部分PIN不允许操作，具体请参考`McalCdd/Port/src/Port_Func.c`文件内的`Gpio_Blacklist`数组：
        <DocScope products="RDK S100">
        ```C
        const uint8_t Gpio_Blacklist[] = {
            0,  /* S100 Power related pins */
            5,  /* S100 debug uart tx */
            38, /* S100 Power related pins */
            15, /* S100 Power related pins */
            68, /* S100 Power related pins */
            69, /* S100 Power related pins */
            71, /* S100 Power related pins */
            80, /* S100 Power related pins */
            81, /* S100 Power related pins */
            82, /* S100 Power related pins */
            83, /* S100 Power related pins */
            AON_PIN_NUM(0),  /* S100 debug uart rx */
            AON_PIN_NUM(12), /* S100 Power related pins */
        };
        ```

        </DocScope>
        <DocScope products="RDK S600">

        ```C
        const uint8_t Gpio_Blacklist[] = {
            29, 16, 30, 31, 32,      /* V0P1 limit: SPI6 group */
            11, 16, 18, 34, 36,      /* debug/power related */
            67, 68,                  /* power related */
            46, 47,                  /* hsm uart rx/tx */
            54, 55, 56, 58, 59, 60, 61, 62, 63, 64, 65, 66,
            75, 76, 77, 78, 81,
            94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104,
            AON_PIN_NUM(0), AON_PIN_NUM(1), AON_PIN_NUM(2),
            AON_PIN_NUM(3), AON_PIN_NUM(4),
            AON_PIN_NUM(21), AON_PIN_NUM(22), AON_PIN_NUM(29),
            AON_PIN_NUM(35), AON_PIN_NUM(40), AON_PIN_NUM(41),
            AON_PIN_NUM(8),  /* sleep key pin */
            AON_PIN_NUM(25), /* debug uart rx */
        };
        ```

        </DocScope>
:::
