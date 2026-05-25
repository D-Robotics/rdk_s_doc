---
sidebar_position: 2
---

# 1.1.2.1 Camera Expansion Board

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_camera_expansion_board_v0p2.png" alt="image-rdk_s600_camera_expansion_board" style={{ width: '100%' }} />

The RDK S600 Camera Expansion Board (hereinafter referred to as the "Camera Expansion Board") is a core expansion module of the D-Robotics RDK S600 series developer kit. The Camera Expansion Board is developed based on the RDK S600 Camera Expansion Connector and provides 8 GMSL camera interfaces.

:::danger Note

1. This product is still in the R&D phase, and the content described is subject to change.
2. For RDK S600 Early Access users, please read first: [**RDK S600 Early Access Note**](https://horizonrobotics.feishu.cn/wiki/IHX3wmvS8iWM5vkEcIqcBmY7nAd?from=from_copylink)
3. Please read [**RDK S600 Early Prototype Status Description**](https://horizonrobotics.feishu.cn/wiki/LyjewVlbZiUOdSkBGdocgdxhngd) before use to obtain hardware-related information.

:::

:::warning

1. This product is only compatible with the RDK S600 series motherboard. Do not use it with other models.
2. When in use, place the expansion board on a stable, flat, and non-conductive surface to avoid equipment dropping or short circuits due to unstable support.
3. If incompatible devices are connected to the RDK S600 CAMERA EXPANSION BOARD, this product does not provide repair services for any resulting equipment damage.
4. All peripheral devices used in conjunction (including but not limited to camera modules and power adapters) must comply with the safety and performance standards of the country/region of use and bear compliant certification markings.
5. All peripheral device cables and connectors connected to this expansion board must have sufficient insulation performance to meet electrical safety requirements.

:::

:::warning Safety Rules

To avoid malfunction or damage to this expansion board, strictly observe the following:

1. Environmental Requirements: Do not expose to water, moisture, or conductive surfaces during operation. Keep away from heat sources (e.g., heaters, direct sunlight). Ensure the operating environment temperature complies with the product specifications.
2. Assembly Operations: Handle with care during assembly. Avoid applying mechanical pressure or electrical interference (such as electrostatic discharge) to the printed circuit board (PCB) and connectors.
3. Power-On Operations: Do not touch the PCB surface or metal interfaces on the edges of the device while powered on to reduce the risk of electrostatic discharge (ESD) damage.

:::

:::danger

1. Install all components only when the development board is powered off and the DC plug is disconnected.
2. During installation, ensure that **the development board and the daughter board remain parallel**, **the interface is evenly stressed to complete the engagement**, and the connection is tight to avoid damaging the connector.

:::

## Product Specifications

| **Name**       | **Parameters**                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| Deserializer   | 2x Maxim MAX96712                                                                                                |
| GMSL Connector | 2x FAKRA-Mini 4in1                                                                                               |
| External Power | 12V DC, only required when current demand exceeds 2.4A, maximum 4.8A.                                            |
| Operating Temp | 0°C~65°C                                                                                                         |

### Topology Diagram

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_camera_expansion_board_architecture_diagram.png" alt="image-rdk_s600_camera_expansion_board_architecture_diagram.png" style={{ width: '100%' }} />

### Interface Description

**V0P2 Interface Diagram**
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_camera_expansion_board_v0p2_interface%20.png" alt="s600_camera_expansion_board_interface" style={{ width: '100%' }} />

**V0P3 Interface Diagram**
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_camera_expansion_board_v0p2_interface-V0P3.png" alt="s600_camera_expansion_board_interface" style={{ width: '100%' }} />

| Reference | Function             |
| --------- | -------------------- |
| J402      | Board-to-Board Connector |
| J401      | DC Power Input       |
| J501      | GMSL Camera Interface #0 |
| J601      | GMSL Camera Interface #1 |
| D2000     | Power Indicator      |

## Interface Description

### Board-to-Board Connector (J402)

The connection port between the Camera Expansion Board and the RDK S600, providing functional interfaces (MIPI CSI and GPIO) and power (12V, 3.3V, and 1.8V) to the Camera Expansion Board.

:::warning Note

When in use, ensure that the connector between the Camera Expansion Board and the RDK S600 is fully engaged and that the mounting screws are installed to ensure reliable signal connection.

:::

### DC Power Input (J401)

The Camera Expansion Board is equipped with an external 12V power input interface for GMSL cameras. When the total current demand at 12V for all GMSL cameras connected to this expansion board exceeds 700mA, the GMSL cameras must be powered via this DC power jack.

:::info Tip

1. Adapter plug specification: 2.5mm inner diameter, 5.5mm outer diameter.
2. The adapter rated voltage requirement is 12V. Select the appropriate current parameters based on the requirements of the GMSL camera modules to be connected.

:::

### GMSL Camera Interfaces (J501/J601)

The Camera Expansion Board integrates the MAX96712 deserializer chip, supports connecting 4 GMSL2 cameras, and can provide 12V power to the GMSL cameras via coaxial cables.

:::warning Note

The GMSL interface uses a mini Fakra 4-in-1 z code connector. Please use cables and cameras recommended by D-Robotics to ensure stable transmission of GMSL high-speed signals.

:::

:::info Tip

1. When the 12V power current demand of the GMSL cameras is within 700mA, an external 12V adapter is not required; the 12V power is then provided by the RDK S600. If the current demand exceeds 700mA, an external 12V adapter must be connected to ensure a stable power supply to the GMSL camera modules.
2. The Camera Expansion Board can provide a maximum current of 550mA@12V per GMSL camera channel. Exceeding this current specification may compromise the stable operation of the GMSL camera modules.

:::

### Power Indicator (D2000)

Power indicator, located next to the DC power input interface.

| Indicator Status | Description                                                              |
| :--------------- | :----------------------------------------------------------------------- |
| Solid Green      | Camera Expansion Board is connected to RDK S600, and RDK S600 is outputting 3.3V power |
| Off              | Camera Expansion Board connection to RDK S600 is abnormal or 3.3V power is abnormal |

## Connector Models

| Connector | Connector Model | Manufacturer       |
| :-------- | :-------------- | :----------------- |
| J401      | DC-044B-D025    | G-Switch           |
| J402      | DY11-080SB-1    | KEL                |
| J501      | 112038-161410   | SYNCONN            |
| J601      | 112038-161410   | SYNCONN            |

## Compatible Modules

Please refer to the [Accessory List](https://horizonrobotics.feishu.cn/wiki/NMBEwLysUiDHFYk547BcgA9QnIf)