---
sidebar_position: 3
---

# 1.1.2.2 MCU 接口扩展板

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_mcu_port_expansion_board_v0p2.png" alt="image-rdk_s600_mcu_port_expansion_board" style={{ width: '100%' }} />

RDK S600 MCU Port Expansion Board（含配套 FPC）是地瓜机器人 RDK S600 系列开发者套件的核心扩展模块，主要用于扩展 MCU 接口功能，支持 CAN_FD、ADC 等。

:::danger 注意

1. 本产品仍处于研发阶段，所述内容可能会有变更。
2. 对于 RDK S600 Early Access 用户，请先阅读：[**RDK S600 早期试用说明（Early Access Note）**](https://horizonrobotics.feishu.cn/wiki/IHX3wmvS8iWM5vkEcIqcBmY7nAd?from=from_copylink)
3. 使用前请先阅读 [**RDK S600 早期样机情况说明**](https://horizonrobotics.feishu.cn/wiki/LyjewVlbZiUOdSkBGdocgdxhngd)，获取硬件相关情况。

:::

:::warning

1. 本产品仅适配 RDK S600 系列主板使用，禁止与其他型号设备兼容。
2. 使用时需将本扩展板放置于稳固、平坦且不导电的表面，避免因支撑不稳导致设备跌落或短路。
3. 若将非兼容设备与本 MCU 扩展板连接，由此造成的设备损坏，本产品不提供维修服务。
4. 所有配套使用的外围设备（包括但不限于 CAN 设备）须符合使用国家/地区的安全与性能标准，并标注合规认证信息。
5. 与本扩展板连接的所有外围设备电缆及连接器需具备充足绝缘性能，确保满足电气安全要求。

:::

:::warning 安全使用

为避免本扩展板故障或损坏，请严格遵守以下事项：

1. 环境要求 ​：运行时请勿接触水、湿气或导电物体表面，远离热源（如暖气、阳光直射），确保工作环境温度符合产品规格书要求。
2. 装配操作 ​：装配过程中需轻拿轻放，避免对印刷电路板（PCB）及连接器施加机械压力或电气干扰（如静电触碰）。
3. 通电操作 ​：通电状态下禁止直接触摸 PCB 板面或设备边缘金属接口，降低静电放电（ESD）损坏风险。

:::

:::danger

1. 请在开发板电源关闭，且 DC 插头断开的情景下进行安装。
2. 安装时请确保**连接器保持平行**，**接口均匀受力完成扣合**，且连接紧密，以免损坏连接器。

:::

:::info 提示

FPC 正面丝印"CB"标识侧对应 RDK S600 主板的 J15 接口，"SUB"标识侧对应本扩展板的 J301 接口。

:::

## 产品规格  
:::warning 注意

在 V0P1 硬件版本中，2x SPI 接口暂时无法使用。

:::

| **名称** | **参数**                                                                        |
| -------- | ------------------------------------------------------------------------------- |
| 接口     | 5 x CAN FD（最高 8Mbps） <br />1 x 30-pin，具有最多 7x ADC, 2x IIC, 2x SPI<br/> |
| 板载模组 | IMU：BMI088（SPI）                                                              |
| 工作温度 | 0℃~65℃                                                                          |
| 尺寸     | 70x70x17mm                                                                      |

### 拓扑图

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_mcu_port_expansion_board_architecture_diagram.png" alt="image-rdk_s600_mcu_port_expansion_board_architecture_diagram.png" style={{ width: '100%' }} />

### 接口描述

**V0P2 接口图**
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_mcu_port_expansion_board_v0p2_interface.png" alt="image-rdk_s600_mcu_expansionboard" style={{ width: '100%' }} />

**V0P3 接口图**
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_mcu_port_expansion_board_v0p3_interface.png" alt="image-rdk_s600_mcu_expansionboard" style={{ width: '100%' }} />



| 位号  | 功能                     |
| ----- | ------------------------ |
| J301  | MCU 扩展板 80-pin 连接器 |
| J401  | MCU-CAN1 接口            |
| J402  | MCU-CAN2 接口            |
| J403  | MCU-CAN3 接口            |
| J404  | MCU-CAN4 接口            |
| J405  | MCU-CAN10 接口           |
| J501  | 30-Pin 接口              |
| SW401 | MCU CAN 120Ω 开关        |

## 接口说明

### CAN FD 连接器（J401/J402/J403/J403/J405）

:::info 提示

扩展板背面标注了每个接口的`CAN_H`、`CAN_L`和`GND`

:::

扩展板提供 5 路 CAN FD 接口（CAN-1 ~ CAN-4,CAN-10），每路接口配备 120Ω 终端电阻，可通过开关（SW401）进行切换。

### 30-Pin（J501）

接口定义: <a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600/rdk_s600_mcu_port_expansion_board/drobotics_rdk_s600_mcu_port_expansion_board_pinlist_v0p2.xlsx">drobotics_rdk_s600_mcu_port_expansion_board_pinlist_v0p2.xlsx</a>

:::info 提示
30-Pin Connector 中如下 5 个 IQ 接外设使用时，必须保证外设对应管脚上电默认高/低状态与 Pin 定义文件中的 Pull Up/Down 状态保持一致，不允许添加/连接额外上下拉：

- PIN11: MCU_GPIO0_3V3
- PIN15: MCU_SPI4_CSN0_3V3
- PIN19: MCU_SPI4_MOSI_3V3
- PIN16: MCU_SPI6_CSN0_3V3
- PIN20: MCU_SPI6_MOSI_3V3
- PIN13: MCU_SPI4_CSN1_3V3

:::

### IMU（U301）

集成惯性测量单元（IMU，型号 Bosch Sensortec BMI088），支持通过 SPI-13 串行总线实现通信控制。

## 指示灯

扩展板 5 路开关（SW401）下方设有 1 颗绿色 LED 指示灯（标记为"LINK"），用于指示电源状态和 MCU 扩展板与 RDK S600 的连接状态：

- 绿灯常亮：RDK S600 和 MCU 扩展板连接正常，5V 电源已正常供电；
- 绿灯熄灭：RDK S600 和 MCU 扩展板连接异常，无 5V 供电。
