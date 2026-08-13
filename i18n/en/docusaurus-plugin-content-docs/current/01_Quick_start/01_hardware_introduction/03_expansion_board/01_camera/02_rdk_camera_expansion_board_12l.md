---
sidebar_position: 2
sidebar_products: RDK S100
---

# Camera Expansion Board 12L


<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_smooth_hole_support_board_12l.png" alt="Camera Expansion Board 12L" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

The RDK S100 Camera Expansion Board 12L (hereinafter referred to as the "Camera Expansion Board 12L") is a core expansion module of the D-Robotics RDK S100 series developer kit. The Camera Expansion Board 12L is developed based on the RDK S100 Camera Expansion Connector and provides twelve GMSL camera interfaces.

:::warning

1. This product is only compatible with the RDK S100 series motherboard. Do not use it with other models.
2. When in use, place the expansion board on a stable, flat, and non-conductive surface to avoid equipment dropping or short circuits due to unstable support.
3. If incompatible devices are connected to the RDK S100 CAMERA EXPANSION BOARD 12L, this product does not provide repair services for any resulting equipment damage.
4. All peripheral devices used in conjunction (including but not limited to camera modules and power adapters) must comply with the safety and performance standards of the country/region of use and bear compliant certification markings.
5. All peripheral device cables and connectors connected to this expansion board must have sufficient insulation performance to meet electrical safety requirements.

:::

:::warning Safety Rules

To avoid malfunction or damage to this expansion board, strictly observe the following:

1. Environmental Requirements: Do not expose to water, moisture, or conductive surfaces during operation. Keep away from heat sources (e.g., heaters, direct sunlight). Ensure the operating environment temperature complies with the product specifications.
2. Assembly Operations: Handle with care during assembly. Avoid applying mechanical pressure or electrical interference (such as electrostatic discharge) to the printed circuit board (PCB) and connectors.
3. Power-On Operations: Do not touch the PCB surface or metal interfaces on the edges of the device while powered on to reduce the risk of electrostatic discharge (ESD) damage.

:::


## Product Specifications

<div className="table-responsive">

| **Name**       | **Parameters**                                                              |
| -------------- | --------------------------------------------------------------------------- |
| Deserializer   | Maxim MAX96712                                                              |
| GMSL Connector | Fakra-Mini 4in1                                                             |
| External Power | 12V DC, only required when current demand exceeds 700mA, maximum 7.2A.     |
| Operating Temp | 0°C~45°C                                                                    |

</div>

### Topology Diagram

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s100_camera_expansion_board_architecture_diagram_12l.png" alt="Topology Diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Interface Description

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_camera_expansion_board_interface_12l.png" alt="Interface Description" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
<br/><br/>

<div className="table-responsive">

| Reference | Function                              | Reference | Function                                    |
| :-------- | :------------------------------------ | --------- | ------------------------------------------- |
| J2000     | 100-Pin Connector                     | J2100     | GMSL Camera Interface #1                    |
| D2000     | Power Indicator                       | J2200     | GMSL Camera Interface #2                    |
| J2001     | DC Power Input                        | J2300     | GMSL Camera Interface #3                    |

</div>


### Camera Installation Guide

| Model                              | Hardware Interface | 
| ---------------------------------- | ------------------ | 
| SG8S-AR0820C-5300-G2A | J2100 & J2200 & J2300     | 
| LEC28736A11（X3C Module）   | J2100 & J2200 & J2300     | 
| Intel RealSense D457           | J2100 & J2200 & J2300     | 

### Assembly Instructions

:::danger

1. Install all components only when the development board is powered off and the DC plug is disconnected.
2. During installation, ensure that **the development board and the daughter board remain parallel**, **the interface is evenly stressed to complete the engagement**, and the connection is tight to avoid damaging the connector.

:::



#### Camera Expansion Board Assembly Guide

<video controls width="100%" preload="metadata">
  <source src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/video/camera_expansion_board_assembly_guide_12l.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>


## Interface Description

### 100-Pin Connector (J2000)

The connection port between the Camera Expansion Board 12L and the RDK S100, providing functional interfaces (MIPI CSI and GPIO) and power (12V and 3.3V) to the Camera Expansion Board 12L.

:::warning Note

When in use, ensure that the connector between the Camera Expansion Board 12L and the RDK S100 is fully engaged and that the mounting screws are installed to ensure reliable signal connection.

:::

### DC Power Input (J2001)

The Camera Expansion Board 12L is equipped with an external 12V power input interface for GMSL cameras. When the total current demand at 12V for all GMSL cameras connected to this Camera Expansion Board 12L exceeds 700mA, the GMSL cameras must be powered via this DC power jack.

:::info Tip

1. Adapter plug specification: 2.5mm inner diameter, 5.5mm outer diameter.
2. The adapter rated voltage requirement is 12V. Select the appropriate current parameters based on the requirements of the GMSL camera modules to be connected.

:::

### GMSL Camera Interfaces (J2100/J2200/J2300)

The Camera Expansion Board 12L integrates three MAX96712 deserializer chips. Each chip supports connecting up to four GMSL2 cameras and can provide 12V power to the GMSL cameras via coaxial cables.

:::info Tip

1. When the 12V power current demand of the GMSL cameras is within 700mA, an external 12V adapter is not required; the 12V power is then provided by the RDK S100. If the current demand exceeds 700mA, an external 12V adapter must be connected to ensure a stable power supply to the GMSL camera modules.
2. The Camera Expansion Board 12L can provide a maximum current of 550mA@12V per GMSL camera channel. Exceeding this current specification may compromise the stable operation of the GMSL camera modules.
3. The GMSL interface uses a mini Fakra 4-in-1 z code connector. Please use cables and cameras recommended by D-Robotics to ensure stable transmission of GMSL high-speed signals.

:::


## Power Indicator (D2000)

Power indicator, located next to the DC power input interface.

<div className="table-responsive">

| Indicator Status | Description                                                                 |
| :--------------- | :-------------------------------------------------------------------------- |
| Solid Green      | Camera Expansion Board 12L is connected to RDK S100, and RDK S100 is outputting 3.3V power |
| Off              | Camera Expansion Board 12L connection to RDK S100 is abnormal or 3.3V power is abnormal |

</div>

## Connector Models

<div className="table-responsive">

| Connector | Connector Model                 | Manufacturer                |
| :-------- | :------------------------------ | :-------------------------- |
| J2000     | HC-PBB05-2-100-M-H4.0-G1-R-P-04 | Huacan Tianlu               |
| J2001     | DC-044B-D025                    | G-Switch (Pinzan)           |
| J2100     | 112038-161410                   | Xinhann Precision           |
| J2200     | 112038-161410                   | Xinhann Precision           |
| J2201     | 112038-161410                   | Xinhann Precision           |

</div>


## Compatible Modules

Please refer to [7.1.2 Accessory List](/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100_kit#配件清单)
