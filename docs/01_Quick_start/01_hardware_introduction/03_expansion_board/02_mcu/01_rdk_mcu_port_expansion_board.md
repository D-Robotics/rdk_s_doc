---
sidebar_position: 1
title: "MCU 接口扩展板（RDK S100）"
description: "RDK S100 MCU 接口扩展板的产品介绍、主要功能、接口布局与使用说明"
sidebar_label: "MCU 接口扩展板"
sidebar_products: RDK S100
slug: /Quick_start/hardware_introduction/rdk_mcu_port_expansion_board
---

# MCU 接口扩展板

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mcu_port_expansion_board.png" alt="RDK S100 MCU Port Expansion Board" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::warning 警告

1. 用电安全：与本扩展板连接的所有外围设备电缆及连接器需具备充足绝缘性能，确保满足电气安全要求。
2. 散热要求：运行时请勿接触水、湿气或导电物体表面，远离热源（如暖气、阳光直射），确保工作环境温度符合产品规格书要求。
3. 机械安全：使用时需将本扩展板放置于稳固、平坦且不导电的表面，避免因支撑不稳导致设备跌落或短路。
4. 装配操作：装配过程中需轻拿轻放，避免对印刷电路板（PCB）及连接器施加机械压力或电气干扰（如静电触碰）。
5. 适配限制：本产品仅适配 RDK S100 系列主板使用，禁止与其他型号设备兼容；若将非兼容设备与本扩展板连接，由此造成的设备损坏，本产品不提供维修服务。
6. 设备合规：所有配套使用的外围设备（包括但不限于网络设备、CAN 设备）须符合使用国家/地区的安全与性能标准，并标注合规认证信息。
7. 防静电：通电状态下禁止直接触摸 PCB 板面或设备边缘金属接口，降低静电放电（ESD）损坏风险。
8. 上电顺序：对于有独立外部供电的外设，请先给开发板上电，再给外设上电，避免外设向本扩展板倒灌供电。

:::

## 产品介绍

RDK S100 MCU 接口扩展板（含配套 FPC）是地瓜机器人 RDK S100 系列开发者套件的扩展模块，用于扩展 MCU 域接口。该板通过 J1 100-Pin 连接器与主板对接，提供 CAN FD、以太网、ADC 等外设接入能力，适合需要在 MCU 域接入多路总线外设的开发者。

## 主要功能

| 分类 | 参数 |
| --- | --- |
| 互联接口 | 5 x CAN FD（最高 8Mbps）<br />1 x 30-Pin，最多支持 7 路 ADC、2 路 I2C、2 路 SPI<br />1 x RJ45 千兆以太网（MCU 域） |
| 板载模组 | IMU：Bosch Sensortec BMI088（SPI-5） |
| 供电 | 由 RDK S100 主板经 J1 100-Pin 连接器提供 5V |
| 工作温度 | 0℃ ~ 45℃ |

### 拓扑图

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s100_mcu_port_expansion_board_architecture_diagram.png" alt="RDK S100 MCU Port Expansion Board architecture topology diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## 接口与布局

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mcu_port_expansion_board_interface.png" alt="RDK S100 MCU Port Expansion Board interface diagram" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

| 编号 | 接口 | 功能 | 状态指示 | 测试方法 |
| --- | --- | --- | --- | --- |
| J1 | 100-Pin 连接器 | 与 RDK S100 主板的 J23 接口对接（经配套 FPC），为扩展板供电并引出 MCU 域信号 | 绿色 LED“CONNECT”（位于 J1 下方）：常亮表示连接正常且 5V 供电正常；熄灭表示连接异常或无 5V 供电 | 观察“CONNECT”指示灯是否常亮 |
| J12 | 30-Pin 扩展接口 | 引出最多 7 路 ADC、2 路 I2C、2 路 SPI | 无 | 按 Pin 定义文件接入外设；I2C 可用 `i2cdetect` 扫描从设备地址 |
| U4 | RJ45 千兆网口（MCU 域） | MCU 域千兆以太网 | 无 | 接入网线后 `ping` 对端地址，确认链路连通 |
| J2 | CAN5 接口 | CAN FD 通道，最高 8Mbps | 无 | 运行板端 CAN 示例收发一帧数据，也可用 `candump can0` 观察收包 |
| J3 | CAN5 的 120Ω 终端电阻跳线 | 短接后为 CAN5 接入 120Ω 终端电阻 | 无 | 随 CAN5 通道一并验证 |
| J4 | CAN6 接口 | CAN FD 通道，最高 8Mbps | 无 | 运行板端 CAN 示例收发一帧数据 |
| J5 | CAN6 的 120Ω 终端电阻跳线 | 短接后为 CAN6 接入 120Ω 终端电阻 | 无 | 随 CAN6 通道一并验证 |
| J6 | CAN7 接口 | CAN FD 通道，最高 8Mbps | 无 | 运行板端 CAN 示例收发一帧数据 |
| J7 | CAN7 的 120Ω 终端电阻跳线 | 短接后为 CAN7 接入 120Ω 终端电阻 | 无 | 随 CAN7 通道一并验证 |
| J8 | CAN8 接口 | CAN FD 通道，最高 8Mbps | 无 | 运行板端 CAN 示例收发一帧数据 |
| J9 | CAN8 的 120Ω 终端电阻跳线 | 短接后为 CAN8 接入 120Ω 终端电阻 | 无 | 随 CAN8 通道一并验证 |
| J10 | CAN9 接口 | CAN FD 通道，最高 8Mbps | 无 | 运行板端 CAN 示例收发一帧数据 |
| J11 | CAN9 的 120Ω 终端电阻跳线 | 短接后为 CAN9 接入 120Ω 终端电阻 | 无 | 随 CAN9 通道一并验证 |
| U8 | IMU（BMI088） | 板载惯性测量单元，经 SPI-5 通信 | 无 | 暂不支持（`RDKS100_LNX_SDK_V4.0.2` 尚未实现对应功能） |

### CAN FD 接口（J2/J4/J6/J8/J10）

:::info 说明

扩展板背面标注了每个接口的 `CAN_H`、`CAN_L` 和 `GND`。

:::

扩展板提供 5 路 CAN FD 接口（J2/J4/J6/J8/J10），每路接口配备 120Ω 终端电阻，可通过跳帽连接对应插针（J3/J5/J7/J9/J11）实现选通。具体对应关系如下：

| CAN FD 通道 | 连接器位号 | 120Ω 电阻跳线位号 |
| --- | --- | --- |
| CAN5 | J2 | J3 |
| CAN6 | J4 | J5 |
| CAN7 | J6 | J7 |
| CAN8 | J8 | J9 |
| CAN9 | J10 | J11 |

### 千兆网口（U4）

MCU 扩展板提供 1 个千兆以太网接口。

### 30-Pin 扩展接口（J12）

接口定义：<a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_mcu_port_expansion_board/drobotics_rdk_s100_mcu_port_expansion_board_pinlist_v1p0_0924.xlsx">drobotics_rdk_s100_mcu_port_expansion_board_pinlist_v1p0.xlsx</a>

:::note 注意

1. 当系统处于 light sleep 和 deep sleep 模式时，VDD_5V、VDD_3V3、VDD_1V8 电源保持供电，最大输出电流分别为 300mA、600mA、300mA。
2. I2C9_SDA_3V3、I2C9_SCL_3V3 信号作为 GPIO 使用时不允许接外部下拉电阻。

:::

### IMU（U8）

:::note 注意

`RDKS100_LNX_SDK_V4.0.2` 暂未实现对应功能。

:::

集成惯性测量单元（IMU，型号 Bosch Sensortec BMI088），支持通过 SPI-5 串行总线实现通信控制。

## 组装说明

:::danger 危险

1. 请在开发板电源关闭，且 DC 插头断开的情景下进行安装。
2. 安装时请确保**连接器保持平行**，**接口均匀受力完成扣合**，且连接紧密，以免损坏连接器。

:::

:::tip 提示

FPC 正面丝印“MAIN”标识侧对应 RDK S100 主板的 J23 接口，“SUB”标识侧对应本扩展板的 J1 接口。

:::

<video controls width="100%" preload="metadata">
  <source src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/video/mcu_port_expansion_board_assembly_guide.mp4" type="video/mp4" />
  您的浏览器不支持 video 标签。
</video>

## 机械尺寸

- 板卡尺寸：70x70x17mm

## 相关文档

- 主板：[开发者套件简介（RDK S100）](../../01_rdk_s100.md)
- 扩展板：[RDK S100 相机扩展板](../01_camera/01_rdk_camera_expansion_board.md)
- CAN 应用：[CAN 应用](/Demos/peripheral/rcore_can)
