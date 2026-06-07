# 1.1.1.1 Camera Expansion Board

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Quick_start/hardware_introduction/rdk_s100/rdk_s100_camera_expansion_board

![image-rdk_100_camera_expansion_board](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_smooth_hole_support_board.png)The RDK S100 Camera Expansion Board (hereinafter referred to as the "Camera Expansion Board") is a core expansion module of the D-Robotics RDK S100 series developer kit. The Camera Expansion Board is developed based on the RDK S100 Camera Expansion Connector and provides 2 MIPI camera interfaces and 4 GMSL camera interfaces.

warning

1. This product is only compatible with the RDK S100 series motherboard. Do not use it with other models.
2. When in use, place the expansion board on a stable, flat, and non-conductive surface to avoid equipment dropping or short circuits due to unstable support.
3. If incompatible devices are connected to the RDK S100 CAMERA EXPANSION BOARD, this product does not provide repair services for any resulting equipment damage.
4. All peripheral devices used in conjunction (including but not limited to camera modules and power adapters) must comply with the safety and performance standards of the country/region of use and bear compliant certification markings.
5. All peripheral device cables and connectors connected to this expansion board must have sufficient insulation performance to meet electrical safety requirements.

Safety Rules
To avoid malfunction or damage to this expansion board, strictly observe the following:

1. Environmental Requirements: Do not expose to water, moisture, or conductive surfaces during operation. Keep away from heat sources (e.g., heaters, direct sunlight). Ensure the operating environment temperature complies with the product specifications.
2. Assembly Operations: Handle with care during assembly. Avoid applying mechanical pressure or electrical interference (such as electrostatic discharge) to the printed circuit board (PCB) and connectors.
3. Power-On Operations: Do not touch the PCB surface or metal interfaces on the edges of the device while powered on to reduce the risk of electrostatic discharge (ESD) damage.

Note

1. Before connecting a MIPI camera, ensure that the MIPI camera's logic level requirements match the DIP switch positions to prevent communication errors or device damage.
2. If a level-shifting chip is required, pay attention to the supported speed range of the chip and its requirements for external pull-up/pull-down resistors.
3. Note the position and pin definition of pin 1 on the connectors of both the Camera Expansion Board and the camera, and purchase or customize compatible flex cables according to the product form factor.
4. When fabricating FPC cables, ensure the integrity of the MIPI signal reference plane and perform impedance control.

## Product Specifications

| **Name** | **Parameters** 
| Deserializer | Maxim MAX96712 
| MIPI Connector | 2x 22-Pin MIPI CSI-2 
| GMSL Connector | Fakra-Mini 4in1 
| External Power | 12V DC, only required when current demand exceeds 700mA, maximum 2.4A. 
| Operating Temp | 0°C~45°C 

### Topology Diagram

![image-rdk_s100_camera_expansion_board_architecture_diagram.png](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s100_camera_expansion_board_architecture_diagram.png)
### Interface Description

![camera_expansion_board_interface](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_camera_expansion_board_interface.png)
| Reference | Function | Reference | Function 
| J2000 | 100-Pin Connector | J2200 | MIPI Camera Interface 1 
| D2000 | Power Indicator | J2201 | MIPI Camera Interface 2 
| J2001 | DC Power Input | SW2200 | MIPI Camera Interface Function Switch 
| J2100 | GMSL Camera Interface | SW2201 | MIPI Camera Interface Level Switch 

### Camera Installation Guide

| Model | Hardware Interface | Function Switch SW2200 | Level Switch SW2201 
| IMX219 Camera (Raspberry Pi 5 compatible) | J2200 / J2201 | lpwm | Yahboom 1.8V / Waveshare 3.3V 
| SC230AI Dual Camera (V3) | J2200 & J2201 | lpwm | 3.3V 
| SC132GS Dual Camera | J2200 & J2201 | lpwm | 3.3V 
| SG8S-AR0820C-5300-G2A | J2100 | - | - 
| LEC28736A11 (X3C Module) | J2100 | - | - 
| Intel RealSense D457 | J2100 | - | - 
| Intel RealSense D435i | USB | - | - 

### Assembly Instructions

danger

1. Install all components only when the development board is powered off and the DC plug is disconnected.
2. During installation, ensure that **the development board and the daughter board remain parallel** , **the interface is evenly stressed to complete the engagement** , and the connection is tight to avoid damaging the connector.

Camera Expansion Board Notes
Please watch the corresponding expansion board assembly video based on your actual product.

- Threaded Support Pillar Expansion Board: The inner wall of the support pillar has threads.
- Smooth-Hole Support Pillar Expansion Board: The inner wall of the support pillar is smooth without threads.

![Support pillar location diagram](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image_rdk_s100_camera_expansion_board_suppport_location.png)

#### Threaded Support Pillar Expansion Board Assembly Guide

Your browser does not support the video tag.

#### Smooth-Hole Support Pillar Expansion Board Assembly Guide

Your browser does not support the video tag.

## Interface Description

### 100-Pin Connector (J2000)

The connection port between the Camera Expansion Board and the RDK S100, providing functional interfaces (MIPI CSI and GPIO) and power (12V and 3.3V) to the Camera Expansion Board.

Note
When in use, ensure that the connector between the Camera Expansion Board and the RDK S100 is fully engaged and that the mounting screws are installed to ensure reliable signal connection.

### DC Power Input (J2001)

The Camera Expansion Board is equipped with an external 12V power input interface for GMSL cameras. When the total current demand at 12V for all GMSL cameras connected to this Camera Expansion Board exceeds 700mA, the GMSL cameras must be powered via this DC power jack.

Tip

1. Adapter plug specification: 2.5mm inner diameter, 6mm outer diameter.
2. The adapter rated voltage requirement is 12V. Select the appropriate current parameters based on the requirements of the GMSL camera modules to be connected.

### GMSL Camera Interface (J2100)

The Camera Expansion Board integrates the MAX96712 deserializer chip, supports connecting 4 GMSL2 cameras, and can provide 12V power to the GMSL cameras via coaxial cables.

Tip

1. When the 12V power current demand of the GMSL cameras is within 700mA, an external 12V adapter is not required; the 12V power is then provided by the RDK S100. If the current demand exceeds 700mA, an external 12V adapter must be connected to ensure a stable power supply to the GMSL camera modules.
2. The Camera Expansion Board can provide a maximum current of 550mA@12V per GMSL camera channel. Exceeding this current specification may compromise the stable operation of the GMSL camera modules.
3. The GMSL interface uses a mini Fakra 4-in-1 z code connector. Please use cables and cameras recommended by D-Robotics to ensure stable transmission of GMSL high-speed signals.

### MIPI Camera Interfaces (J2200, J2201)

Pin definition: [drobotics_rdk_s100_camera_expansion_board_pinlist_v1p0.xlsx](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/drobotics_rdk_s100_camera_expansion_board_pinlist_v1p0_0924.xlsx)

The Camera Expansion Board is equipped with 2×4 Lane MIPI CSI D PHY interfaces, supporting simultaneous connection of two MIPI cameras. The MIPI camera interfaces support both 1.8V and 3.3V logic levels, and provide developers with LPWM synchronization signals or 24MHz MCLK signals.

Note

1. The maximum supply current of VDD_PERI_3V3 on both MIPI camera interfaces is 500mA. When the system is in light sleep or deep sleep mode, the VDD_PERI_3V3 power is turned off.
2. The MCLK frequency on both MIPI camera interfaces is 24MHz, provided by the active crystal on the Camera Expansion Board.

### MIPI Interface Level Switch (SW2201)

The control signals of the MIPI camera interfaces support switching between 1V8 and 3V3 logic levels, making it easy to connect camera modules with different requirements. Logic level switching is achieved by changing the position of DIP switch SW2201.

| Switch No. | Camera No. | 3V3 | 1V8 
| 1 (Right) | MIPI Camera 1 | MIPI Camera 1 interface uses 3.3V logic level | MIPI Camera 1 interface uses 1.8V logic level 
| 2 | MIPI Camera 2 | MIPI Camera 2 interface uses 3.3V logic level | MIPI Camera 2 interface uses 1.8V logic level 

### MIPI Interface Function Switch (SW2200)

Pin 5 of the MIPI camera interface connector supports switching between LPWM and MCLK (24MHz) functions to meet different development requirements. Function switching is achieved by changing the position of DIP switch SW2200.

| Switch No. | Camera No. | LPWM | MCLK 
| 1 (Right) | MIPI Camera 1 | Pin 5 of MIPI Camera 1 interface is LPWM signal | Pin 5 of MIPI Camera 1 interface is MCLK signal 
| 2 | MIPI Camera 2 | Pin 5 of MIPI Camera 2 interface is LPWM signal | Pin 5 of MIPI Camera 2 interface is MCLK signal 

## Power Indicator (D2000)

Power indicator, located next to the DC power input interface.

| Indicator Status | Description 
| Solid Green | Camera Expansion Board is connected to RDK S100, and RDK S100 is outputting 3.3V power 
| Off | Camera Expansion Board connection to RDK S100 is abnormal or 3.3V power is abnormal 

## Connector Models

| Connector | Connector Model | Manufacturer 
| J2000 | HC-PBB05-2-100-M-H4.0-G1-R-P-04 | Huacan Tianlu 
| J2001 | ZX-DC-WC2.56.3 | Zhaoxing Precision Electronics 
| J2100 | 112038-161410 | Xinhann Precision 
| J2200 | AFC01-S22FCA-00 | Jushuo Electronics 
| J2201 | AFC01-S22FCA-00 | Jushuo Electronics 

## Compatible Modules

Please refer to [7.1.2 Accessory List](/rdk_s_doc/en/Advanced_development/hardware_development/accessory)
