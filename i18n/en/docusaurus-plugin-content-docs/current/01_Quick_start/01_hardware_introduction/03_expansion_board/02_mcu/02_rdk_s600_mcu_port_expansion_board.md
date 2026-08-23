---
sidebar_position: 2
title: "MCU Port Expansion Board (RDK S600)"
description: MCU Port Expansion Board (RDK S600)
sidebar_label: "MCU Port Expansion Board"
sidebar_products: RDK S600
---

# MCU Port Expansion Board

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_mcu_port_expansion_board_v0p2.png" alt="RDK S600 MCU Port Expansion Board" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Product Introduction

The RDK S600 MCU Port Expansion Board (including the accompanying FPC) is a core expansion module of the D-Robotics RDK S600 series developer kits. It is mainly used to expand MCU interface capabilities, supporting CAN_FD, ADC, and more.

:::warning

1. This product is compatible only with the RDK S600 series main boards. It must not be used with devices of other models.
2. During use, place this expansion board on a stable, flat, and non-conductive surface to prevent the equipment from falling or short-circuiting due to unstable support.
3. If non-compatible devices are connected to this MCU Expansion Board and are damaged as a result, this product does not provide repair service.
4. All peripheral devices used together with this product (including but not limited to CAN devices) must comply with the safety and performance standards of the country/region where they are used and carry the corresponding compliance certification markings.
5. All cables and connectors of peripheral devices connected to this expansion board must have sufficient insulation to meet electrical safety requirements.

:::

:::warning Safe Use

To avoid malfunction or damage of this expansion board, strictly observe the following:

1. Environment requirements: During operation, do not expose the board to water, moisture, or conductive surfaces. Keep it away from heat sources (such as heaters and direct sunlight), and ensure that the ambient operating temperature meets the requirements of the product specification.
2. Assembly handling: Handle the board gently during assembly, and avoid applying mechanical pressure or electrical interference (such as electrostatic contact) to the printed circuit board (PCB) and connectors.
3. Powered operation: When the board is powered on, do not directly touch the PCB surface or the metal interfaces at the edges of the board, to reduce the risk of electrostatic discharge (ESD) damage.

:::

:::danger

1. Perform installation only when the development board is powered off and the DC plug is disconnected.
2. During installation, make sure that **the connectors remain parallel**, and that **the interfaces are evenly pressed until they lock together** and the connection is tight, so as not to damage the connectors.

:::

:::info Tip

The side of the FPC with the "CB" silkscreen label corresponds to the J15 interface of the RDK S600 main board, and the side with the "SUB" label corresponds to the J301 interface of this expansion board.

:::

## Product Specifications  

| **Name** | **Parameter**                                                                        |
| -------- | ----------------------------------------------------------------------------------- |
| Interfaces | 5 x CAN FD (up to 8Mbps) <br />1 x 30-pin, with up to 7x ADC, 2x I2C, 2x SPI |
| Onboard module | IMU: BMI088 (SPI)                                                            |
| Operating temperature | 0℃~65℃                                                                    |
| Dimensions | 70x70x17mm                                                                       |

### Topology Diagram

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_mcu_port_expansion_board_architecture_diagram.png" alt="RDK S600 MCU Port Expansion Board architecture topology diagram" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Interface Overview

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/rdk_s600_mcu_board.png" alt="RDK S600 MCU Port Expansion Board interface diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

| Ref.  | Function                     |
| ----- | ---------------------------- |
| J301  | MCU Expansion Board 80-pin connector |
| J401  | MCU-CAN1 interface           |
| J402  | MCU-CAN2 interface           |
| J403  | MCU-CAN3 interface           |
| J404  | MCU-CAN4 interface           |
| J405  | MCU-CAN10 interface          |
| J501  | 30-Pin interface             |
| SW401 | MCU CAN 120Ω switch          |

## Interface Description

### CAN FD Connectors (J401/J402/J403/J404/J405)

:::info Tip

The back of the expansion board labels the `CAN_H`, `CAN_L`, and `GND` of each interface.

:::

The expansion board provides 5 CAN FD interfaces (CAN1 ~ CAN4 and CAN10). Each interface is equipped with a 120Ω terminating resistor, which can be switched via the switch (SW401).

### 30-Pin (J501)

Pin definitions: <a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600/rdk_s600_mcu_port_expansion_board/drobotics_rdk_s600_mcu_port_expansion_board_pinlist_v1p0.xlsx">drobotics_rdk_s600_mcu_port_expansion_board_pinlist_v1p0.xlsx</a>

:::info Tip
When the following 6 IOs of the 30-Pin Connector are connected to external devices, you must ensure that the default high/low state of the corresponding external device pins at power-on is consistent with the Pull Up/Down status in the Pin definition file, and adding/connecting extra pull-up/pull-down resistors is not allowed:

- PIN11: MCU_GPIO0_3V3
- PIN15: MCU_SPI4_CSN0_3V3
- PIN19: MCU_SPI4_MOSI_3V3
- PIN16: MCU_SPI6_CSN0_3V3
- PIN20: MCU_SPI6_MOSI_3V3
- PIN13: MCU_SPI4_CSN1_3V3

:::

### IMU (U301)

Integrates an inertial measurement unit (IMU, model Bosch Sensortec BMI088), which supports communication control over the SPI-13 serial bus.

## Indicator LED

Below the 5-position switch (SW401) of the expansion board, there is one green LED indicator (labeled "LINK"), which indicates the power status and the connection status between the MCU Expansion Board and the RDK S600:

- Steady green: The RDK S600 and the MCU Expansion Board are connected properly, and the 5V power supply is normal;
- Off: The connection between the RDK S600 and the MCU Expansion Board is abnormal, and there is no 5V power supply.

## Related Documentation

- Main board: [Introduction to the Developer Kit (RDK S600)](../../02_rdk_s600.md)
- Expansion board: [RDK S600 Camera Expansion Board](../01_camera/03_rdk_s600_camera_expansion_board.md)
- CAN applications: [CAN Applications](/Demos/peripheral/rcore_can)
