---
sidebar_position: 3
title: "Camera Expansion Board (RDK S600)"
description: Camera Expansion Board (RDK S600)
sidebar_label: "Camera Expansion Board"
sidebar_products: RDK S600
---

# Camera Expansion Board

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_camera_expansion_board_v0p2.png" alt="RDK S600 Camera Expansion Board" style={{ width: '90%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Product Introduction

The RDK S600 Camera Expansion Board (hereinafter referred to as the "Camera Expansion Board") is a core expansion module of the D-Robotics RDK S600 series developer kits. The Camera Expansion Board is developed based on the RDK S600 Camera Expansion Connector and provides 8 GMSL camera interfaces.

:::warning

1. This product is compatible only with the RDK S600 series main boards. It must not be used with devices of other models.
2. During use, place this expansion board on a stable, flat, and non-conductive surface to prevent the equipment from falling or short-circuiting due to unstable support.
3. If non-compatible devices are connected to the RDK S600 CAMERA EXPANSION BOARD and are damaged as a result, this product does not provide repair service.
4. All peripheral devices used together with this product (including but not limited to camera modules and power adapters) must comply with the safety and performance standards of the country/region where they are used and carry the corresponding compliance certification markings.
5. All cables and connectors of peripheral devices connected to this expansion board must have sufficient insulation to meet electrical safety requirements.

:::

:::warning Safety Guidelines

To avoid malfunction or damage of this expansion board, strictly observe the following:

1. Environment requirements: During operation, do not expose the board to water, moisture, or conductive surfaces. Keep it away from heat sources (such as heaters and direct sunlight), and ensure that the ambient operating temperature meets the requirements of the product specification.
2. Assembly handling: Handle the board gently during assembly, and avoid applying mechanical pressure or electrical interference (such as electrostatic contact) to the printed circuit board (PCB) and connectors.
3. Powered operation: When the board is powered on, do not directly touch the PCB surface or the metal interfaces at the edges of the board, to reduce the risk of electrostatic discharge (ESD) damage.

:::

:::danger

1. Install components only when the development board is powered off and the DC plug is disconnected.
2. During installation, make sure that **the development board and the daughter board remain parallel**, and that **the interfaces are evenly pressed until they lock together** and the connection is tight, so as not to damage the connectors.

:::

## Product Specifications

| **Name**    | **Parameter**                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Deserializer | 2x Maxim MAX96712                                                                                    |
| GMSL connectors | 2x FAKRA-Mini 4in1                                                                              |
| External power supply | 12V DC, used only when the current demand is greater than 700mA, maximum 4.8A.               |
| Operating temperature | 0℃~65℃                                                                                          |

### Topology Diagram

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image_s600_camera_expansion_board.png" alt="RDK S600 Camera Expansion Board architecture topology diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Interface Overview

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image_s600_camera_board.png" alt="RDK S600 Camera Expansion Board interface diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

| No. | Function              |
| ----- | ----------------- |
| 1 | GMSL camera interface    |
| 2 | GMSL camera interface    |
| 3 | DC power input |
| 4  | Board-to-board connector |
| 5 | Power indicator   |

## Interface Description

### GMSL Camera Interfaces (Interface 1/Interface 2)

The Camera Expansion Board integrates 2 MAX96712 deserializer chips and can connect up to 8 GMSL2 cameras. It can also provide 12V power to GMSL cameras over coaxial cables.

The S600 can be equipped with 2 Camera Expansion Boards, one installed on the left and one on the right, supporting up to 16 GMSL2 cameras in total. The table below shows the correspondence between `GMSL Interface Position`, `MIPI_HOST`, `I2C_BUS`, and `PHY_TYPE` after installing 2 expansion boards.

<div className="table-responsive">

| GMSL Camera Interface | Position | MIPI_HOST | I2C BUS | PHY TYPE |
| :---- | :---  | :------ | :---------- | :---------- |
| GMSL Camera Interface 1 | Left rear  | MIPI_RX0 | I2C0 | DPHY |
| GMSL Camera Interface 2 | Left front  | MIPI_RX1 | I2C1 | CPHY |
| GMSL Camera Interface 3 | Right front  | MIPI_RX2 | I2C2 | CPHY |
| GMSL Camera Interface 4 | Right rear  | MIPI_RX3 | I2C3 | DPHY |

</div>

The relationship between the `Port` and `Position` of each GMSL interface is as follows:

<div className="table-responsive">

| GMSL Interface | Position |
| :---- | :---  |
| GMSLA | Upper right  |
| GMSLB | Lower right  |
| GMSLC | Lower left  |
| GMSLD | Upper left  |

</div>

:::warning Note

The GMSL interfaces use mini Fakra 4-in-1 z code connectors. Use the cables recommended by D-Robotics to connect cameras, in order to ensure stable transmission of the high-speed GMSL signals.

:::

:::info Tip

1. When the 12V power demand of a GMSL camera is within 700mA, no external 12V adapter is needed; the 12V power is supplied by the RDK S600. If the current demand exceeds 700mA, an external 12V adapter must be connected to ensure stable power supply to the GMSL camera module.
2. The Camera Expansion Board can supply up to 550mA@12V of current per GMSL camera channel. If this current specification is exceeded, stable operation of the GMSL camera module cannot be guaranteed.

:::

### DC Power Input (Interface 3)

The Camera Expansion Board is equipped with an external 12V power input interface for GMSL cameras. When the total power-supply current demand of all GMSL cameras connected to this Camera Expansion Board at 12V exceeds 700mA, the GMSL cameras must be powered through this DC power jack.

:::info Tip

1. Adapter plug specification: 2.5mm inner diameter, 5.5mm outer diameter.
2. The rated voltage of the adapter must be 12V. Select an appropriate current rating according to the requirements of the GMSL camera modules to be connected.

:::

### Board-to-Board Connector (Interface 4)

The connection port between the Camera Expansion Board and the RDK S600, providing the Camera Expansion Board with functional interfaces (MIPI CSI and GPIO) as well as power (12V, 3.3V, and 1.8V).

:::warning Note

During use, make sure that the connector between the Camera Expansion Board and the RDK S600 is fully locked, and install the fixing screws to ensure reliable signal connection.

:::

### Power Indicator (Interface 5)

The power indicator, located next to the DC power input interface.

| Indicator state | Description                                                                  |
| :-------------- | :--------------------------------------------------------------------------- |
| Steady green    | The Camera Expansion Board is connected to the RDK S600, and the RDK S600 is outputting 3.3V power |
| Off             | The connection between the Camera Expansion Board and the RDK S600 is abnormal, or the 3.3V power supply is abnormal |

## Connector Models

| Interface | Connector model | Connector manufacturer |
| :-------- | :-------------- | :--------------------- |
| Interface 3      | DC-044B-D025    | G-Switch (Pinzan)               |
| Interface 4      | DY11-080SB-1    | KEL                    |
| Interface 1      | 112038-161410   | SYNCONN (Xinhan Precision)                |
| Interface 2      | 112038-161410   | SYNCONN (Xinhan Precision)                |

## Compatible Modules

See [Accessory List](https://horizonrobotics.feishu.cn/wiki/NMBEwLysUiDHFYk547BcgA9QnIf)

## Related Documentation

- Main board: [Introduction to the Developer Kit (RDK S600)](../../02_rdk_s600.md)
- Expansion board: [RDK S600 MCU Port Expansion Board](../02_mcu/02_rdk_s600_mcu_port_expansion_board.md)
- Camera usage: [MIPI Camera Usage](../../../../03_Demos/01_peripheral/02_camera/01_mipi_camera.md)
