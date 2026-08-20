---
sidebar_position: 1
title: "MCU Port Expansion Board (RDK S100)"
description: MCU Port Expansion Board (RDK S100)
sidebar_label: "MCU Port Expansion Board"
sidebar_products: RDK S100
slug: /Quick_start/hardware_introduction/rdk_mcu_port_expansion_board
---

# MCU Port Expansion Board

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mcu_port_expansion_board.png" alt="RDK S100 MCU Port Expansion Board" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Product Introduction

The RDK S100 MCU Port Expansion Board (including the accompanying FPC) is a core expansion module of the D-Robotics RDK S100 series developer kits. It is mainly used to expand MCU interface capabilities, supporting Ethernet, CAN_FD, ADC, and more.

:::warning

1. This product is compatible only with the RDK S100 series main boards. It must not be used with devices of other models.
2. During use, place this expansion board on a stable, flat, and non-conductive surface to prevent the equipment from falling or short-circuiting due to unstable support.
3. If non-compatible devices are connected to this MCU Expansion Board and are damaged as a result, this product does not provide repair service.
4. All peripheral devices used together with this product (including but not limited to network devices and CAN devices) must comply with the safety and performance standards of the country/region where they are used and carry the corresponding compliance certification markings.
5. All cables and connectors of peripheral devices connected to this expansion board must have sufficient insulation to meet electrical safety requirements.

:::

:::warning Safe Use

To avoid malfunction or damage of this expansion board, strictly observe the following:

1. Environment requirements: During operation, do not expose the board to water, moisture, or conductive surfaces. Keep it away from heat sources (such as heaters and direct sunlight), and ensure that the ambient operating temperature meets the requirements of the product specification.
2. Assembly handling: Handle the board gently during assembly, and avoid applying mechanical pressure or electrical interference (such as electrostatic contact) to the printed circuit board (PCB) and connectors.
3. Powered operation: When the board is powered on, do not directly touch the PCB surface or the metal interfaces at the edges of the board, to reduce the risk of electrostatic discharge (ESD) damage.

:::

## Product Specifications

| **Name** | **Parameter**                                                                              |
| -------- | ------------------------------------------------------------------------------------------ |
| Interfaces | 5 x CAN FD (up to 8Mbps) <br />1 x 30-pin, with up to 7x ADC, 2x I2C, 2x SPI<br />1 x RJ45 |
| Onboard module | IMU: BMI088                                                                          |
| Operating temperature | 0℃~45℃                                                                              |

### Topology Diagram

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s100_mcu_port_expansion_board_architecture_diagram.png" alt="RDK S100 MCU Port Expansion Board architecture topology diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Interface Overview

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mcu_port_expansion_board_interface.png" alt="RDK S100 MCU Port Expansion Board interface diagram" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

| **Ref.** | **Function**                          | Ref. | Function                     |
| -------- | ------------------------------------- | ---- | ---------------------------- |
| J1       | MCU Expansion Board 100-pin connector | J6   | CAN7                         |
| J12      | 30-pin                                | J7   | 120-ohm resistor jumper for CAN7 |
| U4       | RJ45 gigabit Ethernet port of the MCU domain | J8 | CAN8                         |
| J2       | CAN5                                  | J9   | 120-ohm resistor jumper for CAN8 |
| J3       | 120-ohm resistor jumper for CAN5      | J10  | CAN9                         |
| J4       | CAN6                                  | J11  | 120-ohm resistor jumper for CAN9 |
| J5       | 120-ohm resistor jumper for CAN6      |      |                              |

### Assembly Instructions

:::danger

1. Perform installation only when the development board is powered off and the DC plug is disconnected.
2. During installation, make sure that **the connectors remain parallel**, and that **the interfaces are evenly pressed until they lock together** and the connection is tight, so as not to damage the connectors.

:::

:::info Tip

The side of the FPC with the "MAIN" silkscreen label corresponds to the J23 interface of the RDK S100 main board, and the side with the "SUB" label corresponds to the J1 interface of this expansion board.

:::

<video controls width="100%" preload="metadata">
  <source src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/video/mcu_port_expansion_board_assembly_guide.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

## Interface Description

### CAN FD Connectors (J2/J4/J6/J8/J10)

:::info Info

The back of the expansion board labels the `CAN_H`, `CAN_L`, and `GND` of each interface.

:::

The expansion board provides 5 CAN FD interfaces (J2/J4/J6/J8/J10). Each interface is equipped with a 120Ω terminating resistor, which can be enabled by placing a jumper cap on the corresponding pins (J3/J5/J7/J9/J11). The correspondence is as follows:

| CAN FD channel | Connector ref. | 120-ohm resistor jumper ref. |
| -------------- | -------------- | ---------------------------- |
| CAN5           | J2             | J3                           |
| CAN6           | J4             | J5                           |
| CAN7           | J6             | J7                           |
| CAN8           | J8             | J9                           |
| CAN9           | J10            | J11                          |

### Ethernet Connector (U4)

The MCU Expansion Board provides one gigabit Ethernet interface.

### 30-Pin (J12)

Pin definitions: <a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_mcu_port_expansion_board/drobotics_rdk_s100_mcu_port_expansion_board_pinlist_v1p0_0924.xlsx">drobotics_rdk_s100_mcu_port_expansion_board_pinlist_v1p0.xlsx</a>

:::warning Note

1. When the system is in light sleep or deep sleep mode, the VDD_5V, VDD_3V3, and VDD_1V8 power rails remain powered, with maximum output currents of 300mA, 600mA, and 300mA respectively.
2. When the I2C9_SDA_3V3 and I2C9_SCL_3V3 signals are used as GPIOs, connecting external pull-down resistors is not allowed.

:::

### IMU (U8)

:::warning Note

The corresponding functionality is not yet implemented in RDKS100_LNX_SDK_V4.0.2.

:::

Integrates an inertial measurement unit (IMU, model Bosch Sensortec BMI088), which supports communication control over the SPI-5 serial bus.

## Indicator LED

Below the expansion board 100PIN connector (J1), there is one green LED indicator (labeled "CONNECT"), which indicates the power status and the connection status between the MCU Expansion Board and the RDK S100:

- Steady green: The RDK S100 and the MCU Expansion Board are connected properly, and the 5V power supply is normal;
- Off: The connection between the RDK S100 and the MCU Expansion Board is abnormal, and there is no 5V power supply.

## Dimensions

Board dimensions: 70x70x17mm

## Related Documents

- Main board: [Introduction to the Developer Kit (RDK S100)](../../01_rdk_s100.md)
- Expansion board: [RDK S100 Camera Expansion Board](../01_camera/01_rdk_camera_expansion_board.md)
- CAN applications: [CAN Applications](/Demos/peripheral/rcore_can)
