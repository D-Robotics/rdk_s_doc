# 1.1.1 Developer Kit

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Quick_start/hardware_introduction/rdk_s100

![RDK S100 Developer Kit](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mainboard_overview.png)Warning

1. The RDK S100 uses an external power supply and must comply with relevant regional regulatory standards.
2. This product should be used in a well-ventilated environment. When used in an enclosed space, appropriate heat dissipation measures must be taken.
3. During use, the product should be placed on a stable, flat, non-conductive surface.
4. Damage caused by connecting incompatible devices to the RDK S100 will not be covered for repair.
5. All peripheral devices used with this product must comply with the relevant standards of the country of use and be clearly marked to ensure safety and performance requirements are met. Peripheral devices include, but are not limited to, keyboards, monitors, and mice used in conjunction with the RDK S100.
6. Cables and connectors for all peripheral devices used with this product must have adequate insulation to meet relevant safety requirements.

Safety Instructions
To avoid malfunction or damage to this product, please observe the following:

1. During operation, do not expose to water or moisture, place on conductive surfaces, or contact any heat source, to ensure reliable operation within normal ambient temperatures.
2. During assembly, avoid mechanical or electrical damage to printed circuit boards and connectors.
3. When powered on, avoid touching the printed circuit board and board edges to reduce the risk of electrostatic discharge damage.

Tip
For peripherals with an independent external power supply, the development board should be powered on first, followed by the peripherals. If a peripheral is powered on before the S100 development board and causes reverse current to the main board, the development board may trigger a protection state and fail to start.

## Product Introduction

The D-Robotics RDK S100 series developer kit is equipped with the S100 intelligent computing chip, with the BPU delivering up to 80/128 TOPS of computing power. It is a development board designed for intelligent computing and robotics applications, featuring rich interfaces, extreme ease of use, and a unique heterogeneous design that can simultaneously meet the demands of perception, inference, and real-time motion control, reducing the size and complexity of the control system.

### Main Specifications

| Category | Specifications 
| Core Specs | CPU: 6x ARM® Cortex®-A78AE
MCU: 4x ARM® Cortex®-R52+ (1× DCLS, 1× Split-Lock)
BPU: 1x BPU Nash
GPU: ARM Mali-G78AE
RAM: 12/24GB 96bit LPDDR5, Up to 6400Mbps 
| Storage | Onboard 64GB EMMC
M.2 Key M connector for SSD 
| Connectivity | 4 x USB 3.0 Type-A ports
1 x USB 2.0 Type-C (image flashing, MCU/Main Domain serial debugging)
1 x JTAG debug interface (Main & MCU Domain)
1 x 40-Pin GPIO (SPI, I2C, I2S, PWM, UART, etc.)
1 x MCU port expansion (for MCU Domain) 
| Display | 1 x HDMI Type-A port, up to 2560x1440@60Hz 
| Camera | 1 x camera expansion interface, providing 3x 4lane MIPI CSI-2 
| Audio | 1 x I2S/PCM 
| Network | 2 x RJ45 ports (1000M Ethernet)
M.2 Key E (for Wi-Fi & BT modules) 
| Power | Power adapter: 90W power adapter included in the package
Power input: board supports 12~20V DC, Max 150W 
| Temperature | 0℃ ~ 45℃ 

### Model Description

| **Product Name** | **Model** | **SOC** | **CPU Frequency** | **Memory** | **BPU** | **Core Board Power Consumption** 
| RDK S100 | KS1E55Y | S100E | 1.5GHz | 12GB LPDDR5 | 80 TOPS | Refer to [power consumption data](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100/S100_SIP_Typical_Scenario_Power_Consumption_V1P0_20251015.xlsx) 
| RDK S100P | KS1P75Y | S100P | 2.0GHz | 24GB LPDDR5 | 128 TOPS | Refer to [power consumption data](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100/S100_SIP_Typical_Scenario_Power_Consumption_V1P0_20251015.xlsx) 

### Topology Diagram

![RDK S100 Topology Diagram](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s100_architecture_diagram.png)
### Interface Diagram

![RDK S100 Interface Diagram](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mainboard_interface.png)
| Ref. | Function | Ref. | Function 
| J1 | Main board power interface | J22 | 16-Pin interface for MCU domain 
| J2 | Main board function connector | J23 | MCU expansion board 100-Pin interface 
| J3 | RTC battery interface | J24 | 40-Pin interface 
| J8 | Fan control interface | J25 | Camera expansion board 100-Pin interface 
| J15 | JTAG interface for Main and MCU domains | K1 | Reset button 
| J16 | Type-C port for flashing, Main and MCU domain debugging | K2 | Sleep button 
| J17 | M.2 Key E interface | SW1 | Power switch 
| J18 | M.2 Key M interface | SW2 | Flashing mode switch 
| J19&J20 | 4x USB 3.0 Type-A ports | SW3&SW6 | Pin function selection DIP switch 
| J21 | HDMI interface | U43&U45 | 2x Gigabit RJ45 ports 

### Wi-Fi and SSD Installation

danger
Please perform installation with the development board powered off and the DC plug disconnected.

Your browser does not support the video tag.

## Interface Description

Interface Definition: [drobotics_rdk_s100_pinlist_v1p0.xlsx](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100/drobotics_rdk_s100_pinlist_v1p0_0924.xlsx)

### DC Jack (J1)

info
The rated voltage is 20V and the rated current is 10A. The S100 main board accepts 12~20V power input. You can use an adapter with an inner diameter of 2.5mm and an outer diameter of 6mm to power the S100 system.

- For typical scenarios, a 70W power supply ( [12V@5.5A](mailto:12V@5.5A) ) is recommended.
- For extreme scenarios, a 150W power supply ( [20V@7.5A](mailto:20V@7.5A) ) is recommended.

### Automatic EXT CTRL Connector (J2)

The RDK S100 main board has an Automatic EXT CTRL Connector 12-Pin connector, mainly used for:

- Extending the system operation LED and power indicator LED on the main board to the outside for easy observation of the board's operating status.
- Extending the flash switch, sleep button, reset button, and power switch to the outside for manual operation after complete assembly.
Tip

1. The green LED indicates whether the main board's small system is powered on, and the orange LED indicates whether the Main domain system of the main board is operating normally.
2. The Automatic EXT CTRL Connector 12-Pin interface power supply is only allowed to connect circuits involved in the function description. Connecting high-power loads is prohibited.
3. When the system is in light sleep and deep sleep modes, the VDD_AON_PERI_5V and DCIN_CONN power supplies remain on, while the VDD_PERI_3V3 power supply is turned off. When connecting an external daughter board, a short-circuit protection circuit should be reserved to prevent power supply anomalies on the main board due to short circuits on the external daughter board.
4. The maximum output currents for VDD_AON_PERI_5V, DCIN_CONN, and VDD_PERI_3V3 are 50mA, 5mA, and 100mA respectively.

### RTC (J3)

Commercial Support
The commercial version provides more complete feature support, deeper hardware capability access, and exclusive customized content. To ensure content compliance and secure delivery, commercial version access will be granted through the following process.

Commercial version access process:

1. Complete the questionnaire: Submit basic information such as your organization and use case
2. Sign a Non-Disclosure Agreement (NDA): We will contact you based on the submitted information, and both parties will sign the NDA after confirmation
3. Content release: After the agreement is signed, we will provide commercial version materials through a private channel
If you would like to obtain commercial version content, please click the link below to complete the questionnaire. We will contact you within 3 to 5 business days: [https://horizonrobotics.feishu.cn/share/base/form/shrcnpBby71Y8LlixYF2N3ENbre](https://horizonrobotics.feishu.cn/share/base/form/shrcnpBby71Y8LlixYF2N3ENbre)

### FAN Connector (J8)

The FAN Connector is used to connect a cooling fan and supports fan speed control.

Tip

1. The maximum supply current for 12V is 200mA. When the system is in light sleep and deep sleep modes, the VDD_PERI_12V power supply is turned off.

### Type-C (J16)

USB Type-C (J16) is only used for flashing and debugging. It is not a standard full-featured USB Type-C port and includes the following functions:

- Debug serial port. Hardware uses two `CH340` chips to convert the debug serial ports of the Main domain and MCU domain of the core module to a USB interface. Users can use this interface for various debugging tasks. The first time you use this interface, you need to install the CH340 driver on your computer. You can search for the `CH340 serial driver` keyword to download and install. The parameters of the computer's serial tool should be configured as follows:

- Baud rate: 921600
- Data bits: 8
- Parity: None
- Stop bits: 1
- Flow Control: None
- USB download interface. The download interface provided by the RDK S100 development board is used for firmware download. For details, please refer to [1.2 System Flashing](/rdk_s_doc/en/Quick_start/install_os/rdk_s100/instruction)
tip
The USB Type-C port provided by the RDK S100 development board only supports Device mode.

### M.2 Key E Expansion Slot (J17)

Default configuration for connecting PCIe Wi-Fi and 4-wire UART BT modules. PCIe supports Gen3x1. USB and SDIO interfaces are not provided. No LED and ALERT signals.

info

1. If you need to support Wi-Fi/Bluetooth wake-up of the S100, please contact D-Robotics engineers for support.
2. When the system is in light sleep and deep sleep modes, the VDD_AON_PERI_3V3 power supply remains on, with a maximum supply current of 750mA.

### M.2 Key M Expansion Slot (J18)

Used for connecting PCIe solid-state drives, supports Gen3x1, has ALERT signal, no LED signal.

info

1. Wake-up function is not supported.
2. I2C4 is default used for communication with the M.2 KEY M interface, RTC IC, and Fan speed control IC. The I2C addresses of the RTC IC and Fan speed control IC are 0X32 and 0X2F respectively (excluding read/write bit).
3. When the system is in light sleep and deep sleep modes, the VDD_PERI_3V3 power supply is turned off, with a maximum supply current of 700mA.

### MCU Expansion Header (J22)

The RDK S100 main board includes a 16-pin expansion interface MCU Expansion Header, hereinafter referred to as 16-Pin Header.

- Power signals: VDD_AON_PERI_MCU_3V3, VDD_AON_PERI_MCU_5V.
- Communication interfaces:
- I2C9, configured with equivalent 3.2K pull-up resistors on the motherboard
- SPI3
- UART5
- PWM signals: PWM6, PWM7.
- GPIO signals: GPIO_MCU_36_3V3, GPIO_MCU_37_3V3.
Tip

1. When the system is in light sleep and deep sleep modes, the VDD_AON_PERI_MCU_3V3 and VDD_AON_PERI_MCU_5V power supplies remain on. The maximum supply currents for VDD_AON_PERI_MCU_3V3 and VDD_AON_PERI_MCU_5V are 300mA and 200mA respectively.
2. When GPIO_MCU_36_3V3 and GPIO_MCU_37_3V3 on the 16-Pin Header are used with external peripherals, the corresponding pins on the peripherals must default to a low state at power-on.
3. When I2C9_SDA_3V3 and I2C9_SCL_3V3 signals are used as GPIO, external pull-down resistors are not allowed.

### MCU Expansion Connector (J23)

The RDK S100 main board includes a 100-Pin expansion interface MCU Expansion Connector, hereinafter referred to as MCU 100-Pin Connector.

- Power signals: VDD_AON_PERI_MCU_5V, VDD_AON_PERI_MCU_3V3, VDDIO_MCU_3V3, VDDIO_MCU_1V8.
- Network interface: EMAC RGMII interface signals.
- Communication interfaces:
- I2C8, configured with equivalent 4.7K pull-up resistors on the motherboard.
- I2C9, configured with equivalent 3.2K pull-up resistors on the motherboard.
- SPI2, SPI4, SPI5
- CAN interfaces: CAN5, CAN6, CAN7, CAN8, CAN9
- Other signals: GPIO, PWM, ADC signals.
Tip

1. The MCU 100-Pin Connector includes IOs with two logic levels: 1.8V and 3.3V. For detailed information, please refer to the pin definition file.
2. When the following 14 IOs on the MCU 100-Pin Connector are used with external peripherals, the default high/low state of the corresponding pins at power-on must match the Pull Up/Down state in the pin definition file: SPI5_CSN1_3V3, GPIO_MCU_36_3V3, GPIO_MCU_37_3V3, GPIO_MCU_35_3V3, SPI5_MOSI_3V3, GPIO_MCU_9_3V3, CAN5_TX_3V3, CAN6_TX_3V3, CAN9_TX_3V3, CAN8_TX_3V3, SPI5_CSN0_3V3, CAN7_TX_3V3, GPIO_MCU_6_3V3, GPIO_MCU_7_3V3.
3. When the system is in light sleep and deep sleep modes, the VDD_AON_PERI_MCU_5V and VDD_AON_PERI_MCU_3V3 power supplies remain on, with a maximum supply current of 1000mA each.
4. The maximum supply current for VDDIO_MCU_3V3 and VDDIO_MCU_1V8 is 50mA each, only for low-power applications such as level shifting, pull-up/down resistors, ADC voltage division, etc. When the system is in light sleep mode, the VDDIO_MCU_3V3 and VDDIO_MCU_1V8 power supplies remain on. When the system is in deep sleep mode, the VDDIO_MCU_3V3 and VDDIO_MCU_1V8 power supplies are turned off.

### Main Expansion Header (J24)

The RDK S100 main board includes a 40-pin expansion interface Main Expansion Header, hereinafter referred to as 40-Pin Header.

- Power signals: VDD_PERI_3V3, VDD_PERI_5V.
- Communication interfaces:
- I2C5, configured with 4K pull-up resistors on the motherboard.
- UART2, configured with 4K pull-up resistors on the motherboard.
- SPI0, master mode only.
- LPWM (GPIO_CAM_4_3V3 and GPIO_CAM_5_3V3).
- Audio interface: PCM0 related signals are shared with the PCM interface of the Wi-Fi module.
- GPIO signals: 10 GPIOs from 40PIN_GPIO0_3V3 to 40PIN_GPIO9_3V3, provided by a GPIO expansion IC with default 100K internal pull-up resistors.
Tip

1. I2C4 is default used for communication with the M.2 KEY M interface, RTC IC, and Fan speed control IC. The I2C addresses of the RTC IC and Fan speed control IC are 0X32 and 0X2F respectively (excluding read/write bit).
2. I2C5 and UART2 interface pins are multiplexed. The 40-Pin Header and M.2 KEY E connector share the PCM0 interface, which can be switched via the SW6 DIP switch.
3. When the system is in light sleep and deep sleep modes, the VDD_PERI_3V3 and VDD_PERI_5V power supplies are turned off. The maximum supply current for VDD_PERI_3V3 and VDD_PERI_5V is 1000mA each.
4. When I2C4_SDA_3V3, I2C4_SCL_3V3, I2C5_SDA_3V3, I2C5_SCL_3V3, UART2_TX_3V3, and UART2_RX_3V3 signals are used as GPIO, external pull-down resistors are not allowed.

### Camera Expansion Connector (J25)

The RDK S100 main board includes a 100-pin expansion interface Camera Expansion Connector, hereinafter referred to as CAM 100-Pin Connector.

- Power signals: VDD_PERI_3V3, VDD_PERI_12V, VDDIO_TOP_1V8.
- Image interface: includes 3 groups of 4lane MIPI RX signals.
- Communication interfaces:
- I2C1, configured with equivalent 4.7K pull-up resistors on the motherboard.
- I2C2, configured with equivalent 4.7K pull-up resistors on the motherboard.
- I2C3, configured with equivalent 2.2K pull-up resistors on the motherboard.
- Other signals: includes LPWM signals, ADC detection signals, Camera Board ID signals, GPIO signals, etc.
Tip

1. The CAM 100-Pin Connector includes IOs with two logic levels: 1.8V and 3.3V. For detailed information, please refer to the pin definition file.
2. The maximum supply current for VDDIO_TOP_1V8 is 50mA, only for low-power applications such as level shifting, pull-up/down resistors, ADC voltage division, etc.
3. When the system is in light sleep and deep sleep modes, the VDD_PERI_3V3, VDD_PERI_12V, and VDDIO_TOP_1V8 power supplies are turned off. The maximum supply current for the 3.3V power supply is 1700mA, and the maximum supply current for the 12V power supply is 800mA.

### Wired Ethernet Ports (U43/U45)

The development board is equipped with two Gigabit Ethernet interfaces, compatible with 1000BASE-T and 100BASE-T standards, supporting auto-negotiation for rate switching.

| Ref. | Label | Function Description | IP Configuration Method | Default IP Address 
| U43 | eth0 | General Ethernet interface, requires user IP configuration | External DHCP assignment or manual static configuration | None 
| U45 | eth1 | Management or dedicated communication interface, built-in static IP address | Fixed static IP | 192.168.127.10 

### HDMI Interface (J21)

The RDK S100 development board provides one HDMI display interface, supporting up to 2K 60fps display mode. After power-on, the development board outputs the Ubuntu graphical interface through the HDMI interface. With specific sample programs, it also supports preview display functions for camera and video stream feeds.

### USB Interfaces (J19/J20)

The RDK S100 development board provides four PCIe-expanded USB 3.0 standard interfaces, allowing up to 4 USB peripherals to be connected simultaneously. Each USB 3.0 interface supports a maximum output power of 5V/1A.

tip

1. The USB 3.0 interfaces provided by the RDK S100 development board only support Host mode.
2. Note the [USB 2.0 Camera Access Limitation](/rdk_s_doc/en/Basic_Application/Image/usb_camera#notes-on-connecting-usb-20-cameras) .

## Switches, Buttons, and LEDs Description

### Buttons (K1/K2)

| Ref. | Name | Description | Usage 
| K1 | RESET | Reset the S100 system | Press the button to reset the system 
| K2 | SLEEP | Control the S100 system to enter sleep or wake up | Single-press button interrupt triggers sleep and wake-up functions 

### Switches (SW1/SW2)

| Ref. | Name | Description | Usage 
| SW1 | ON/OFF | Power switch | ▽: ON, ↑: OFF 
| SW2 | DOWNLOAD | DFU flashing mode switch | ▽: Normal boot mode, ↑: DFU flashing mode 

### DIP Switches (SW3/SW6)

#### Boot Device Selection (SW3)

info
Currently only eMMC boot is supported

| D13 | D12 | Boot Medium | Description 
| 0 | 1 | eMMC | Boot from onboard eMMC 
| 1 | 0 | NVMe | Boot from M.2 NVMe solid-state drive 

#### Function Selection (SW6)

I2C5 and UART2 interface pins are multiplexed on the 40-Pin header. The 40-Pin (J24) and M.2 KEY E connector (J17) share the PCM0 interface, which can be switched via the SW6 DIP switch.

Recommendation
For PCM0, if you do not need the Bluetooth audio function of the Wi-Fi module, you can default to switching the DIP switch to the right.

| DIP Switch Name | 1 | 0 
| 40 PIN | Pins 3 and 5 on 40-Pin are active, for I2C5 | Pins 8 and 10 on 40-Pin are active, for UART2 
| PCM0 | PCM0 used for M.2 E Key | PCM0 used for 40PIN 

### Indicator LEDs

The RDK S100 main board has three indicator LEDs beside the J8 connector: POWER, DOWNLOAD, and SYSTEM, used to indicate main board power status, DFU flashing mode, and system operating status respectively.

#### POWER (Green)

| Status | Status Description 
| Steady On | Power on 
| Off | Power off 

#### DOWNLOAD (Red)

| Status | Status Description 
| Steady On | DFU flashing mode 
| Off | Normal boot mode 

#### SYSTEM (Orange)

| Status | Status Description 
| Blinking | System running normally 
| Steady On, Off | System running abnormally 

## Connector Models

| Connector | Connector Model | Manufacturer 
| J1 | DC-044B-D025 | Pinzan 
| J2 | HX JN1.27-2x6P ZZ H4.9 | Hanxia 
| J3 | HDGC1002WV-S-2P | HDGC (Huade Gongchuang) 
| J8 | 470531000 | Molex 
| J15 | 356-110A0CMBB1 | Guangdezhong Electronics 
| J16 | XUBF-0316-FS458 | Lianxin Technology 
| J17 | APCI0108-P001A | Lianxin Technology 
| J18 | APCI0079-P002A | Lianxin Technology 
| J22 | PZ254V-12-16P | Xingfei Connector 
| J23 | HC-PBB05-2-100-F-H2.2-G1-R-P-04 | Huacan Tianlu 
| J24 | 313240SK24011160A4P | Lianxiang Electronics 
| J25 | HC-PBB05-2-100-F-H4.0-G1-R-P-04 | Huacan Tianlu
