---
sidebar_position: 2
title: "MCU 接口扩展板（RDK S600）"
description: "RDK S600 MCU 接口扩展板的产品介绍、主要功能、接口布局与使用说明"
sidebar_label: "MCU 接口扩展板"
sidebar_products: RDK S600
---

# MCU 接口扩展板

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_mcu_port_expansion_board_v0p2.png" alt="RDK S600 MCU Port Expansion Board" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::warning 警告

1. 用电安全：与本扩展板连接的所有外围设备电缆及连接器需具备充足绝缘性能，确保满足电气安全要求。
2. 散热要求：运行时请勿接触水、湿气或导电物体表面，远离热源（如暖气、阳光直射），确保工作环境温度符合产品规格书要求。
3. 机械安全：使用时需将本扩展板放置于稳固、平坦且不导电的表面，避免因支撑不稳导致设备跌落或短路。
4. 装配操作：装配过程中需轻拿轻放，避免对印刷电路板（PCB）及连接器施加机械压力或电气干扰（如静电触碰）。
5. 适配限制：本产品仅适配 RDK S600 系列主板使用，禁止与其他型号设备兼容；若将非兼容设备与本扩展板连接，由此造成的设备损坏，本产品不提供维修服务。
6. 设备合规：所有配套使用的外围设备（包括但不限于 CAN 设备）须符合使用国家/地区的安全与性能标准，并标注合规认证信息。
7. 防静电：通电状态下禁止直接触摸 PCB 板面或设备边缘金属接口，降低静电放电（ESD）损坏风险。
8. 上电顺序：对于有独立外部供电的外设，请先给开发板上电，再给外设上电，避免外设向本扩展板倒灌供电。

:::

## 产品介绍

RDK S600 MCU 接口扩展板（含配套 FPC）是地瓜机器人 RDK S600 系列开发者套件的扩展模块，用于扩展 MCU 域接口。该板通过 J301 80-Pin 连接器与主板对接，提供 CAN FD、ADC 等外设接入能力，适合需要在 MCU 域接入多路总线外设的开发者。

## 主要功能

| 分类 | 参数 |
| --- | --- |
| 互联接口 | 5 x CAN FD（最高 8Mbps，CAN1 ~ CAN4、CAN10）<br />1 x 30-Pin，最多支持 7 路 ADC、2 路 I2C、2 路 SPI |
| 板载模组 | IMU：Bosch Sensortec BMI088（SPI-13） |
| 供电 | 由 RDK S600 主板经 J301 80-Pin 连接器提供 5V |
| 工作温度 | 0℃ ~ 65℃ |

### 拓扑图

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_mcu_port_expansion_board_architecture_diagram.png" alt="RDK S600 MCU Port Expansion Board architecture topology diagram" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## 接口与布局

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/rdk_s600_mcu_board.png" alt="RDK S600 MCU Port Expansion Board interface diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

| 编号 | 接口 | 功能 | 状态指示 | 测试方法 |
| --- | --- | --- | --- | --- |
| J301 | 80-Pin 连接器 | 与 RDK S600 主板的 J15 接口对接（经配套 FPC），为扩展板供电并引出 MCU 域信号 | 绿色 LED“LINK”（位于 SW401 下方）：常亮表示连接正常且 5V 供电正常；熄灭表示连接异常或无 5V 供电 | 观察“LINK”指示灯是否常亮 |
| J401 | MCU-CAN1 接口 | CAN FD 通道，最高 8Mbps | 无 | 运行板端 CAN 示例收发一帧数据，也可用 `candump can0` 观察收包 |
| J402 | MCU-CAN2 接口 | CAN FD 通道，最高 8Mbps | 无 | 运行板端 CAN 示例收发一帧数据 |
| J403 | MCU-CAN3 接口 | CAN FD 通道，最高 8Mbps | 无 | 运行板端 CAN 示例收发一帧数据 |
| J404 | MCU-CAN4 接口 | CAN FD 通道，最高 8Mbps | 无 | 运行板端 CAN 示例收发一帧数据 |
| J405 | MCU-CAN10 接口 | CAN FD 通道，最高 8Mbps | 无 | 运行板端 CAN 示例收发一帧数据 |
| J501 | 30-Pin 扩展接口 | 引出最多 7 路 ADC、2 路 I2C、2 路 SPI | 无 | 按 Pin 定义文件接入外设；I2C 可用 `i2cdetect` 扫描从设备地址 |
| SW401 | MCU CAN 120Ω 开关 | 切换 5 路 CAN FD 接口的 120Ω 终端电阻 | 无 | 切换后随对应 CAN 通道一并验证 |
| U301 | IMU（BMI088） | 板载惯性测量单元，经 SPI-13 通信 | 无 | 运行板端示例读取一帧加速度与角速度数据 |

### CAN FD 接口（J401/J402/J403/J404/J405）

:::tip 提示

扩展板背面标注了每个接口的 `CAN_H`、`CAN_L` 和 `GND`。

:::

扩展板提供 5 路 CAN FD 接口（CAN1 ~ CAN4、CAN10），每路接口配备 120Ω 终端电阻，可通过开关（SW401）进行切换。

### 30-Pin 扩展接口（J501）

接口定义：<a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600/rdk_s600_mcu_port_expansion_board/drobotics_rdk_s600_mcu_port_expansion_board_pinlist_v1p0.xlsx">drobotics_rdk_s600_mcu_port_expansion_board_pinlist_v1p0.xlsx</a>

:::note 注意

30-Pin 连接器中如下 6 个 IO 接外设使用时，必须保证外设对应管脚上电默认高/低状态与 Pin 定义文件中的 Pull Up/Down 状态保持一致，不允许添加/连接额外上下拉：

- PIN11：MCU_GPIO0_3V3
- PIN15：MCU_SPI4_CSN0_3V3
- PIN19：MCU_SPI4_MOSI_3V3
- PIN16：MCU_SPI6_CSN0_3V3
- PIN20：MCU_SPI6_MOSI_3V3
- PIN13：MCU_SPI4_CSN1_3V3

:::

### IMU（U301）

集成惯性测量单元（IMU，型号 Bosch Sensortec BMI088），支持通过 SPI-13 串行总线实现通信控制。

## 组装说明

:::danger 危险

1. 请在开发板电源关闭，且 DC 插头断开的情景下进行安装。
2. 安装时请确保**连接器保持平行**，**接口均匀受力完成扣合**，且连接紧密，以免损坏连接器。

:::

:::tip 提示

FPC 正面丝印“CB”标识侧对应 RDK S600 主板的 J15 接口，“SUB”标识侧对应本扩展板的 J301 接口。

:::

## 机械尺寸

- 板卡尺寸：70x70x17mm

## 相关文档

- 主板：[开发者套件简介（RDK S600）](../../02_rdk_s600.md)
- 扩展板：[RDK S600 相机扩展板](../01_camera/03_rdk_s600_camera_expansion_board.md)
- CAN 应用：[CAN 应用](/Demos/peripheral/rcore_can)
