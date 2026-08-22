---
sidebar_position: 1
title: "Camera Expansion Board (RDK S100)"
description: Camera Expansion Board (RDK S100)
sidebar_label: "Camera Expansion Board"
sidebar_products: RDK S100
slug: /Quick_start/hardware_introduction/rdk_s100/rdk_camera_expansion_board/rdk_camera_expansion_board
---

# Camera Expansion Board


<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_smooth_hole_support_board.png" alt="RDK S100 Camera Expansion Board" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Product Introduction

The RDK S100 Camera Expansion Board (hereinafter referred to as the "Camera Expansion Board") is a core expansion module of the D-Robotics RDK S100 series developer kit. Developed based on the RDK S100 Camera Expansion Connector, the Camera Expansion Board provides 2 MIPI camera interfaces and 4 GMSL camera interfaces.

:::warning

1. This product is only compatible with the RDK S100 series main boards. Using it with devices of other models is prohibited.
2. When in use, place this expansion board on a stable, flat, and non-conductive surface to avoid equipment dropping or short circuits caused by unstable support.
3. If incompatible devices are connected to the RDK S100 CAMERA EXPANSION BOARD, this product does not provide repair services for any resulting equipment damage.
4. All peripheral devices used in conjunction (including but not limited to camera modules and power adapters) must comply with the safety and performance standards of the country/region of use and bear compliant certification markings.
5. All peripheral device cables and connectors connected to this expansion board must have adequate insulation performance to meet electrical safety requirements.

:::

:::warning Safety Instructions

To avoid malfunction or damage to this expansion board, strictly observe the following:

1. Environmental requirements: Do not expose to water, moisture, or conductive surfaces during operation. Keep away from heat sources (such as heaters and direct sunlight), and ensure the operating environment temperature meets the product specification requirements.
2. Assembly operations: Handle with care during assembly. Avoid applying mechanical pressure or electrical interference (such as electrostatic touch) to the printed circuit board (PCB) and connectors.
3. Power-on operations: Do not touch the PCB surface or the metal interfaces at the edges of the device while powered on, to reduce the risk of electrostatic discharge (ESD) damage.

:::

:::warning Note

1. Before connecting a MIPI camera, ensure that the logic level requirements of the MIPI camera match the DIP switch positions, to prevent communication errors or device damage.
2. If a level-shifting chip needs to be added, pay attention to the speed range supported by the chip and its requirements for external pull-up/pull-down resistors.
3. Note the position and definition of pin 1 on the connectors of the Camera Expansion Board and the camera, and purchase or customize compatible flex cables according to the product structure form.
4. When fabricating FPC flex cables, ensure the integrity of the MIPI signal reference plane and perform impedance control.

:::

## Product Specifications

<div className="table-responsive">

| **Name**       | **Parameters**                                         |
| ----------- | ------------------------------------------------ |
| Deserializer      | Maxim MAX96712                                   |
| MIPI Connector | 2x 22-Pin MIPI CSI-2                             |
| GMSL Connector | Fakra-Mini 4in1                                  |
| External Power    | 12V DC, only used when the current demand exceeds 700mA, maximum 2.4A. |
| Operating Temperature    | 0℃~45℃                                           |

</div>

### Topology Diagram

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s100_camera_expansion_board_architecture_diagram.png" alt="RDK S100 Camera Expansion Board architecture topology diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }}/>

### Interface Description

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_camera_expansion_board_interface.png" alt="RDK S100 Camera Expansion Board interface diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }}/>

<div className="table-responsive">

| Reference  | Function          | Reference   | Function                    |
| :---- | :------------ | ------ | ------------------------- |
| J2000 | 100-Pin connector  | J2200  | MIPI camera interface 1           |
| D2000 | Power indicator LED    | J2201  | MIPI camera interface 2           |
| J2001 | DC power input   | SW2200 | MIPI camera interface function selection switch |
| J2100 | GMSL camera interface | SW2201 | MIPI camera interface level selection switch |

</div>

## Camera Installation Guide

<div className="table-responsive">

| Model                        | Hardware Interface        | Function Switch SW2200 | Level Switch SW2201       |
|-----------------------------|------------------|------------------|------------------------|
| IMX219 camera (Raspberry Pi 5 compatible) | J2200 / J2201     | lpwm             | Yahboom 1.8V / Waveshare 3.3V  |
| SC230AI stereo camera (V3 version)   | J2200 & J2201     | lpwm             | 3.3V                   |
| SC132GS stereo camera           | J2200 & J2201     | lpwm             | 3.3V                   |
| SG8S-AR0820C-5300-G2A       | J2100             | -                | -                      |
| LEC28736A11 (X3C module)      | J2100             | -                | -                      |
| Intel RealSense D457        | J2100             | -                | -                      |
| Intel RealSense D435i       | USB               | -                | -                      |

</div>

## Assembly Instructions

:::danger

1. Please perform the installation with the development board powered off and the DC plug disconnected.
2. During installation, ensure that **the development board and the daughter board remain parallel**, **the interfaces are engaged with even force**, and the connection is tight, so as not to damage the connectors.

:::

:::warning Camera Expansion Board Notes

Please check the assembly video corresponding to your actual product.
- Threaded pillar expansion board: the inner wall of the support pillar is threaded.
- Smooth-hole pillar expansion board: the inner wall of the support pillar is smooth without threads.

    <img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image_rdk_s100_camera_expansion_board_suppport_location.png" alt="Support pillar location image" style={{ width: '50%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::

### Threaded Pillar Expansion Board Assembly Guide

<video controls width="100%" preload="metadata">
  <source src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/video/camera_expansion_board_assembly_guide.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

### Smooth-Hole Pillar Expansion Board Assembly Guide

<video controls width="100%" preload="metadata">
  <source src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/video/camera_expansion_board_assembly_guide_smooth_hole_support.mp4" type="video/mp4" />
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

1. Adapter plug specification: inner diameter 2.5mm, outer diameter 6mm.
2. The rated voltage requirement of the adapter is 12V. Select appropriate current parameters according to the requirements of the GMSL camera modules to be connected.

:::

### GMSL Camera Interface (J2100)

The Camera Expansion Board integrates the MAX96712 deserializer chip, which can connect 4 GMSL2 cameras, and can provide 12V power to the GMSL cameras through coaxial cables.

:::info Information

1. When the 12V power current demand of the GMSL cameras is within 700mA, no external 12V adapter is needed; in this case the 12V power is provided by the RDK S100. If the current demand exceeds 700mA, an external 12V adapter must be connected to ensure stable power supply to the GMSL camera modules.
2. The Camera Expansion Board can provide a maximum current of 550mA@12V for each GMSL camera. Exceeding this current specification will not guarantee stable operation of the GMSL camera modules.
3. The GMSL interface uses a mini Fakra 4-in-1 z code connector. Please use the cables recommended by D-Robotics to connect the cameras, to ensure stable transmission of GMSL high-speed signals.

:::

### MIPI Camera Interfaces (J2200, J2201)

Interface definition: <a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/drobotics_rdk_s100_camera_expansion_board_pinlist_v1p0_0924.xlsx">drobotics_rdk_s100_camera_expansion_board_pinlist_v1p0.xlsx</a>

The Camera Expansion Board is equipped with 2×4 Lane MIPI CSI D PHY interfaces, supporting simultaneous connection of two MIPI cameras. The MIPI camera interfaces support both 1.8V and 3.3V logic levels, and provide developers with LPWM synchronization signals or 24MHz MCLK signals.

:::warning Note

1. The maximum supply current of VDD_PERI_3V3 on the two MIPI camera interfaces is 500mA. When the system is in light sleep and deep sleep modes, the VDD_PERI_3V3 power supply is turned off.
2. The MCLK frequency on the two MIPI camera interfaces is 24MHz, provided by the active crystal oscillator on the Camera Expansion Board.

:::

### MIPI Interface Level Selection Switch (SW2201)

The control signals of the MIPI camera interfaces support switching between 1V8 and 3V3 logic levels, making it convenient to connect camera modules with different requirements. The logic level switching is implemented by changing the position of DIP switch SW2201.

<div className="table-responsive">

| Switch No.   | Camera No.    | 3V3                              | 1V8                              |
| ---------- | :---------- | :------------------------------- | :------------------------------- |
| 1 (right side) | MIPI Camera 1 | MIPI Camera 1 interface uses 3.3V logic level | MIPI Camera 1 interface uses 1.8V logic level |
| 2          | MIPI Camera 2 | MIPI Camera 2 interface uses 3.3V logic level | MIPI Camera 2 interface uses 1.8V logic level |

</div>

### MIPI Interface Function Selection Switch (SW2200)

Pin 5 of the MIPI camera interface connector supports switching between the two functions of LPWM and MCLK (24MHz), to meet different development needs. The function switching is implemented by changing the position of DIP switch SW2200.

<div className="table-responsive">

| Switch No.  | Camera No.    | LPWM                                | MCLK                                |
| --------- | :---------- | :---------------------------------- | :---------------------------------- |
| 1 (right side) | MIPI Camera 1 | Pin 5 of MIPI Camera 1 interface is the LPWM signal | Pin 5 of MIPI Camera 1 interface is the MCLK signal |
| 2         | MIPI Camera 2 | Pin 5 of MIPI Camera 2 interface is the LPWM signal | Pin 5 of MIPI Camera 2 interface is the MCLK signal |

</div>

### Power Indicator LED (D2000)

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
| J2001  | ZX-DC-WC2.56.3                  | Zhaoxing Precision Electronics |
| J2100  | 112038-161410                   | Xinhan Precision     |
| J2200  | AFC01-S22FCA-00                 | Jushuo Electronics     |
| J2201  | AFC01-S22FCA-00                 | Jushuo Electronics     |

</div>

## Compatible Modules

Refer to [Accessory List](../../01_rdk_s100.md#accessory-list)

## Related Documentation

- Main board: [Developer Kit Introduction (RDK S100)](../../01_rdk_s100.md)
- Expansion boards: [RDK S100 Camera Expansion Board 12 Channels](./02_rdk_camera_expansion_board_12l.md), [RDK S100 MCU Port Expansion Board](../02_mcu/01_rdk_mcu_port_expansion_board.md)
- Camera usage: [MIPI Camera Usage](/Demos/peripheral/camera/mipi_camera)
