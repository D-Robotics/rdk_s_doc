# 1.1.1.2 MCU Port Expansion Board

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Quick_start/hardware_introduction/rdk_s100/rdk_s100_mcu_port_expansion_board

![image-rdk_100_mcu_port_expansion_board](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mcu_port_expansion_board.png)

The RDK S100 MCU Port Expansion Board (including the matching FPC) is a core expansion module for the D-Robotics RDK S100 series developer kit. It is mainly used to expand MCU interface functions, supporting Ethernet, CAN_FD, ADC, and more.

warning

1. This product is only compatible with the RDK S100 series mainboard. Do not use it with other device models.
2. During use, place the expansion board on a stable, flat, and non-conductive surface to avoid the device falling or short-circuiting due to unstable support.
3. If an incompatible device is connected to this MCU expansion board, this product does not provide repair services for any resulting device damage.
4. All peripheral devices used with this product (including but not limited to network devices and CAN devices) must comply with the safety and performance standards of the country/region of use and bear appropriate compliance certification marks.
5. All cables and connectors of peripheral devices connected to this expansion board must have sufficient insulation performance to meet electrical safety requirements.

Safe Usage
To avoid malfunction or damage to this expansion board, strictly follow these guidelines:

1. **Environmental Requirements** : Do not expose to water, moisture, or conductive surfaces during operation. Keep away from heat sources (e.g., heaters, direct sunlight). Ensure the operating environment temperature complies with the product specification requirements.
2. **Assembly Operations** : Handle with care during assembly. Avoid applying mechanical pressure or electrical interference (such as electrostatic discharge) to the printed circuit board (PCB) and connectors.
3. **Power-On Operations** : Do not touch the PCB surface or metal interfaces on the edge of the device while powered on to reduce the risk of electrostatic discharge (ESD) damage.

## Product Specifications

| **Item** | **Parameters** 
| Interfaces | 5 x CAN FD (up to 8Mbps)
1 x 30-pin, supporting up to 7x ADC, 2x IIC, 2x SPI
1 x RJ45 
| Onboard Module | IMU: BMI088 
| Operating Temp | 0℃~45℃ 

### Topology Diagram

![image-rdk_s100_mcu_port_expansion_board_architecture_diagram.png](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s100_mcu_port_expansion_board_architecture_diagram.png)

### Interface Description

![image-rdk_100_cam_expansionboard](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mcu_port_expansion_board_interface.png)

| **Reference** | **Function** | Reference | Function 
| J1 | MCU expansion board 100-pin connector | J6 | CAN7 
| J12 | 30-pin | J7 | CAN7 120Ω resistor jumper 
| U4 | MCU domain RJ45 Gigabit Ethernet port | J8 | CAN8 
| J2 | CAN5 | J9 | CAN8 120Ω resistor jumper 
| J3 | CAN5 120Ω resistor jumper | J10 | CAN9 
| J4 | CAN6 | J11 | CAN9 120Ω resistor jumper 
| J5 | CAN6 120Ω resistor jumper |  |  

### Assembly Instructions

danger

1. Install the board only when the development board is powered off and the DC plug is disconnected.
2. During installation, ensure the **connectors remain parallel** , **the interface is evenly engaged** , and the connection is tight to avoid damaging the connector.

Tip
The side with the "MAIN" silkscreen on the front of the FPC corresponds to the J23 interface on the RDK S100 mainboard, and the side with the "SUB" silkscreen corresponds to the J1 interface on this expansion board.

Your browser does not support the video tag.

## Interface Details

### CAN FD Connectors (J2/J4/J6/J8/J10)

Tip
The back of the expansion board indicates `CAN_H` , `CAN_L` , and `GND` for each interface.

The expansion board provides 5 CAN FD interfaces (J2/J4/J6/J8/J10). Each interface is equipped with a 120Ω terminal resistor, which can be enabled by connecting a jumper cap to the corresponding pins (J3/J5/J7/J9/J11). The mapping is as follows:

| CAN FD Channel | Connector Reference | 120Ω Resistor Jumper Reference 
| CAN5 | J2 | J3 
| CAN6 | J4 | J5 
| CAN7 | J6 | J7 
| CAN8 | J8 | J9 
| CAN9 | J10 | J11 

### Ethernet Connector (U4)

The MCU expansion board provides one Gigabit Ethernet interface.

### 30-Pin (J12)

Pin definition: [drobotics_rdk_s100_mcu_port_expansion_board_pinlist_v1p0.xlsx](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_mcu_port_expansion_board/drobotics_rdk_s100_mcu_port_expansion_board_pinlist_v1p0_0924.xlsx)

Note

1. When the system is in light sleep or deep sleep mode, the VDD_5V, VDD_3V3, and VDD_1V8 power rails remain powered, with maximum output currents of 300mA, 600mA, and 300mA respectively.
2. When I2C9_SDA_3V3 and I2C9_SCL_3V3 signals are used as GPIO, do not connect external pull-down resistors.

### IMU (U8)

Note
RDKS100_LNX_SDK_V4.0.2 does not yet implement the corresponding functionality.

Integrated Inertial Measurement Unit (IMU, model Bosch Sensortec BMI088), supporting communication control via the SPI-5 serial bus.

## Indicator Light

Below the expansion board 100-pin connector (J1), there is one green LED indicator (labeled "CONNECT") used to indicate the power status and the connection status between the MCU expansion board and the RDK S100:

- Green light constantly on: The RDK S100 and MCU expansion board are connected normally, and 5V power is being supplied correctly.
- Green light off: The connection between the RDK S100 and MCU expansion board is abnormal, with no 5V power supply.

## Dimensions

Board dimensions: 70x70x17mm
