---
sidebar_position: 2
title: "Camera Expansion Board 12 Channels (RDK S100)"
description: Camera Expansion Board 12 Channels (RDK S100)
sidebar_label: "Camera Expansion Board 12 Channels"
sidebar_products: RDK S100
---

# Camera Expansion Board 12 Channels


<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_smooth_hole_support_board_12l.png" alt="RDK S100 Camera Expansion Board 12 Channels" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Product Introduction

The D-Robotics RDK S100 Camera Expansion Board (12 channels) is the Camera Expansion Board, a core expansion module of the RDK S100 developer kit. Developed based on the RDK S100 Camera Expansion Connector, it provides 12 GMSL camera interfaces.

:::warning

1. This product is only compatible with the RDK S100 series main boards. Using it with devices of other models is prohibited.
2. When in use, place this expansion board on a stable, flat, and non-conductive surface to avoid equipment dropping or short circuits caused by unstable support.
3. If incompatible devices are connected to the RDK S100 CAMERA EXPANSION BOARD 12L, this product does not provide repair services for any resulting equipment damage.
4. All peripheral devices used in conjunction (including but not limited to camera modules and power adapters) must comply with the safety and performance standards of the country/region of use and bear compliant certification markings.
5. All peripheral device cables and connectors connected to this expansion board must have adequate insulation performance to meet electrical safety requirements.

:::

:::warning Safety Instructions

To avoid malfunction or damage to this expansion board, strictly observe the following:

1. Environmental requirements: Do not expose to water, moisture, or conductive surfaces during operation. Keep away from heat sources (such as heaters and direct sunlight), and ensure the operating environment temperature meets the product specification requirements.
2. Assembly operations: Handle with care during assembly. Avoid applying mechanical pressure or electrical interference (such as electrostatic touch) to the printed circuit board (PCB) and connectors.
3. Power-on operations: Do not touch the PCB surface or the metal interfaces at the edges of the device while powered on, to reduce the risk of electrostatic discharge (ESD) damage.

:::


## Product Specifications

<div className="table-responsive">

| **Name**       | **Parameters**                                         |
| ----------- | ------------------------------------------------ |
| Deserializer      | Maxim MAX96712                                   |
| GMSL Connector | Fakra-Mini 4in1                                  |
| External Power    | 12V DC, only used when the current demand exceeds 700mA, maximum 7.2A. |
| Operating Temperature    | 0℃ ~ 45℃                                           |

</div>

### Topology Diagram

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s100_camera_expansion_board_architecture_diagram_12l.png" alt="RDK S100 Camera Expansion Board 12 Channels architecture topology diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Interface Description

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_camera_expansion_board_interface_12l.png" alt="RDK S100 Camera Expansion Board 12 Channels interface diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
<br/><br/>

<div className="table-responsive">

| Reference  | Function          | Reference   | Function                    |
| :---- | :------------ | ------ | ------------------------- |
| J2000 | 100-Pin connector  | J2100 | GMSL camera interface #1         |
| D2000 | Power indicator LED    | J2200  | GMSL camera interface #2           |
| J2001 | DC power input   | J2300 | GMSL camera interface #3|

</div>


### Camera Installation Guide

<div className="table-responsive">

| Model                        | Hardware Interface        | 
|-----------------------------|------------------|
| SG8S-AR0820C-5300-G2A | J2100 & J2200 & J2300     | 
| LEC28736A11 (X3C module)   | J2100 & J2200 & J2300     | 
| Intel RealSense D457           | J2100 & J2200 & J2300     | 


</div>

### Assembly Instructions

:::danger

1. Please perform the installation with the development board powered off and the DC plug disconnected.
2. During installation, ensure that **the development board and the daughter board remain parallel**, **the interfaces are engaged with even force**, and the connection is tight, so as not to damage the connectors.

:::


#### Expansion Board Assembly Guide

<video controls width="100%" preload="metadata">
  <source src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/video/camera_expansion_board_assembly_guide_12l.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>


## Interface Description

### 100Pin Connector (J2000)

The connection port between the Camera Expansion Board and the RDK S100, providing function interfaces (MIPI CSI and GPIO) and power (12V and 3.3V) to the Camera Expansion Board.

:::warning Note

When in use, ensure that the connector between the Camera Expansion Board and the RDK S100 is fully engaged and that the fixing screws are installed, to ensure reliable signal connection.

:::

### DC Power Input (J2001)

The Camera Expansion Board is equipped with an external 12V power input interface for GMSL cameras. When the power current demand at 12V of all GMSL cameras connected to this Camera Expansion Board exceeds 700mA, the GMSL cameras must be powered through this DC power jack.

:::info Information

1. Adapter plug specification: inner diameter 2.5mm, outer diameter 5.5mm.
2. The rated voltage requirement of the adapter is 12V. Select appropriate current parameters according to the requirements of the GMSL camera modules to be connected.

:::

### GMSL Camera Interfaces (J2100/J2200/J2300)

The Camera Expansion Board integrates 3 MAX96712 deserializer chips, each of which can connect 4 GMSL2 cameras, and can provide 12V power to the GMSL cameras through coaxial cables.

:::info Information

1. When the 12V power current demand of the GMSL cameras is within 700mA, no external 12V adapter is needed; in this case the 12V power is provided by the RDK S100. If the current demand exceeds 700mA, an external 12V adapter must be connected to ensure stable power supply to the GMSL camera modules.
2. The Camera Expansion Board can provide a maximum current of 550mA@12V for each GMSL camera. Exceeding this current specification will not guarantee stable operation of the GMSL camera modules.
3. The GMSL interface uses a mini Fakra 4-in-1 z code connector. Please use the cables recommended by D-Robotics to connect the cameras, to ensure stable transmission of GMSL high-speed signals.

:::


## Power Indicator LED (D2000)

The power indicator LED, located next to the DC power input interface.

<div className="table-responsive">

| LED Status | Description                                                       |
| :--------- | :--------------------------------------------------------- |
| Solid green   | The Camera Expansion Board is connected to the RDK S100, and the RDK S100 is outputting 3.3V power |
| Off       | The connection between the Camera Expansion Board and the RDK S100 is abnormal, or the 3.3V power is abnormal          |

</div>

## Connector Models

<div className="table-responsive">

| Connector | Connector Model                      | Manufacturer   |
| :----- | :------------------------------ | :----------- |
| J2000  | HC-PBB05-2-100-M-H4.0-G1-R-P-04 | Huacan Tianlu     |
| J2001  | DC-044B-D025                  | G-Switch (Pinzan) |
| J2100  | 112038-161410                   | Xinhan Precision     |
| J2200  | 112038-161410                   | Xinhan Precision     |
| J2201  | 112038-161410                   | Xinhan Precision     |

</div>


## Compatible Modules

Refer to [Accessory List](../../01_rdk_s100.md#accessory-list)

## Related Documentation

- Main board: [Developer Kit Introduction (RDK S100)](../../01_rdk_s100.md)
- Expansion boards: [RDK S100 Camera Expansion Board](./01_rdk_camera_expansion_board.md), [RDK S100 MCU Port Expansion Board](../02_mcu/01_rdk_mcu_port_expansion_board.md)

