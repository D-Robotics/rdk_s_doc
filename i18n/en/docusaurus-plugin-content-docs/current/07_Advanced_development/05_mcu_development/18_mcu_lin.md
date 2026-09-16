---
sidebar_position: 18
---

# 7.5.19 LIN User Guide

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK S100">

The S100 MCU chip has 3 LIN channels in total (LIN0~LIN2), among which **LIN1** is routed out through an on-board connector for user development and learning, and is configured as a **Master node**.

| **Configuration Item** | **LIN1** |
|--------------------|----------|
| Node type          | Master |
| Baud rate          | 9600 bps |
| Stop bits          | 1 bit |
| Auto baud rate     | Disabled |
| Wakeup detection   | Disabled |
| Break field length | 13 bit |
| Response timeout   | 14 bit time |
| Header timeout     | 44 bit time |

## Hardware Support

- Maximum number of LIN channels available on the MCU: 3 (LIN0~LIN2)
- LIN channels routed out on the board: 1 (LIN1)
- Supported LIN protocol versions: 1.3, 2.0, 2.1, 2.2
- Supports Master/Slave node modes
- Data buffering: single 8-byte buffer or FIFO mode
- Supports 16 identifiers (Identifier Filters)
- Supports Classic Checksum and Enhanced Checksum
- Baud rate: up to 20 Kbit/s (LIN protocol standard), with support for a fractional baud rate generator
- Power modes: Initialization, Normal, Sleep
- Timeout management: Header timeout, Response timeout, Frame timeout
- Advanced error detection: supports multiple kinds of LIN error detection
- Wakeup support: wakeup on Dominant bit detection
- Interrupt support: maskable interrupts
- External transceiver: an external LIN transceiver chip is required to connect to the LIN bus

</DocScope>
<DocScope products="RDK S600">

The S600 MCU chip has 8 LIN channels in total (LIN0~LIN7), among which **LIN2 and LIN3** are routed out through on-board connectors for user development and learning, and both are configured as **Master nodes**.

| **Configuration Item** | **LIN2** | **LIN3** |
|--------------------|----------|----------|
| Node type          | Master | Master |
| Baud rate          | 9600 bps | 9600 bps |
| Stop bits          | 1 bit | 1 bit |
| Auto baud rate     | Disabled | Disabled |
| Wakeup detection   | Disabled | Disabled |
| Break field length | 13 bit | 13 bit |
| Response timeout   | 14 bit time | 14 bit time |
| Header timeout     | 44 bit time | 44 bit time |

## Hardware Support

- Maximum number of LIN channels available on the MCU: 8 (LIN0~LIN7)
- LIN channels routed out on the board: 2 (LIN2, LIN3)
- Supported LIN protocol versions: 1.3, 2.0, 2.1, 2.2
- Supports Master/Slave node modes
- Data buffering: single 8-byte buffer or FIFO mode
- Supports 16 identifiers (Identifier Filters)
- Supports Classic Checksum and Enhanced Checksum
- Baud rate: up to 20 Kbit/s (LIN protocol standard), with support for a fractional baud rate generator
- Power modes: Initialization, Normal, Sleep
- Timeout management: Header timeout, Response timeout, Frame timeout
- Advanced error detection: supports multiple kinds of LIN error detection
- Wakeup support: wakeup on Dominant bit detection
- Interrupt support: maskable interrupts
- External transceiver: an external LIN transceiver chip is required to connect to the LIN bus

</DocScope>


## Software Architecture

- LIN APP: The LIN application layer code.
- LIN Interface: The LIN interface layer code, which provides standardized LIN operation interfaces.
- LIN LLD: The LIN low-level driver code, which directly operates the LINFLEXD registers and implements core functions such as frame transmission/reception and interrupt handling.
- LIN PBcfg: The LIN PB configuration file, used for peripheral configuration parameters.
- Hardware: The LINFLEXD hardware.



## Code Paths

- `McalCdd/Common/Register/inc/Lin_Register.h`: Register-related content
- `McalCdd/Lin/src/Lin.c`: API layer code
- `McalCdd/Lin/src/Lin_Lld.c`: LLD layer code
- `McalCdd/Lin/src/Linflexd_Lin_Ip.c`: IP layer code
- `McalCdd/Lin/src/Lin_Irq.c`: Interrupt handling code
- `McalCdd/Lin/src/LinIf.c`: LIN Interface callback stubs
- `McalCdd/Lin/inc/Lin.h`: Public API header file
- `McalCdd/Lin/inc/Lin_GeneralTypes.h`: Standard type definitions
- `McalCdd/Lin/inc/Lin_Types.h`: Configuration structure types
- `McalCdd/Lin/inc/Lin_Lld.h`: Low-level driver interface declarations
- `McalCdd/Lin/inc/Linflexd_Lin_Ip.h`: LINFLEXD IP layer interfaces
- `McalCdd/Lin/inc/Lin_Irq.h`: Interrupt handling declarations
- `Config/McalCdd/gen_xxx/Lin/src/Lin_PBcfg.c`: PostBuild configuration file

## Application Sample

<DocScope products="RDK S100">

### Usage Example

The S100 development board routes LIN1 out for user development and learning; the pins are located on the `MCU Port Expansion Header(J22)` on the `Main Board`:

:::tip
LIN1 multiplexes the UART5 pins. Running the `LinTest` command will **automatically mux the corresponding pins to the LIN function**, and the UART function can no longer be used.
To restore it, use the command `uarttest 0 5 921600 0 1 8`, or call `Port_SetFunctionPins(PORT_FUNC_UART5)` to reconfigure the serial pins.
:::

| Signal | Pin |
|------|------|
| LIN1_TX | J22 PIN13 |
| LIN1_RX | J22 PIN15 |

![image-rdk_100_mainboard](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mainboard_interface.png)

- Syntax
    - `case`: Test case ID (required)
    - `channel`: LIN channel number (0=LIN1)
    - `Pid`: Frame ID (0-0x3F)
    - `ChecksumType`: Checksum type (0=ENHANCED, 1=CLASSIC)
    - `ResponseType`: Response type (0=TX, 1=RX)
    - `DataLen`: Data length (1-8)
    - `loop_times`: Number of loops
```
LinTest <case> <channel> <Pid> <ChecksumType> <ResponseType> <DataLen> <loop_times>
```



- `LinTest 1` prints driver version information

```shell
D-Robotics:/$ LinTest 1
[get_Lin_status 113] [INFO]: Lin status: LIN_CH_SLEEP
[LinTest 290] [INFO]: ####################### test_case_num: 1 #######################
vendorID: 0xC4
moduleID: 0x52
sw_major_version: 1
sw_minor_version: 0
sw_patch_version: 0
[LinTest 305] [INFO]: Test case pass.
[LinTest 310] [INFO]: #####################################################################
```

- `LinTest 2 0 16 0 0 8 1` sends data on LIN1

```shell
D-Robotics:/$ LinTest 2 0 16 0 0 8 1
[get_Lin_status 113] [INFO]: Lin status: LIN_CH_SLEEP
[LinTest 290] [INFO]: ####################### test_case_num: 2 #######################
############################# Loop Times: 1 #############################
[Lin_Transfer_Test 214] [INFO]: Transfer success.
[get_Lin_status 86] [INFO]: Lin status: LIN_TX_OK
[LinTest 305] [INFO]: Test case pass.
[LinTest 310] [INFO]: #####################################################################
```

</DocScope>
<DocScope products="RDK S600">

### Usage Example

The S600 development board routes LIN2 and LIN3 out for user development and learning; the pins are located on the connector `J18` on the `Main Board`:

:::tip
LIN2 multiplexes the UART10 pins and LIN3 multiplexes the UART11 pins. Running the `LinTest` command will **automatically mux the corresponding pins to the LIN function**, and the UART function can no longer be used.
To restore it, use the command `uarttest 0 10/11 921600 0 1 8`, or call `Port_SetFunctionPins(PORT_FUNC_UART10/11)` to reconfigure the serial pins.
:::

| Signal | Pin |
|------|------|
| LIN2_TX | J18 PIN2 |
| LIN2_RX | J18 PIN3 |
| LIN3_TX | J18 PIN4 |
| LIN3_RX | J18 PIN5 |

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/rdk_s600_v1p0_main.png" alt="image-rdk_600_mainboard" style={{ width: '100%' }} />

- Syntax
    - `case`: Test case ID (required)
    - `channel`: LIN channel number (0=LIN2, 1=LIN3)
    - `Pid`: Frame ID (0-0x3F)
    - `ChecksumType`: Checksum type (0=ENHANCED, 1=CLASSIC)
    - `ResponseType`: Response type (0=TX, 1=RX)
    - `DataLen`: Data length (1-8)
    - `loop_times`: Number of loops
```
LinTest <case> <channel> <Pid> <ChecksumType> <ResponseType> <DataLen> <loop_times>
```



- `LinTest 1` prints driver version information

```shell
D-Robotics:/$ LinTest 1
[get_Lin_status 113] [INFO]: Lin status: LIN_CH_SLEEP
[LinTest 290] [INFO]: ####################### test_case_num: 1 #######################
vendorID: 0xC4
moduleID: 0x52
sw_major_version: 1
sw_minor_version: 0
sw_patch_version: 0
[LinTest 305] [INFO]: Test case pass.
[LinTest 310] [INFO]: #####################################################################
```

- `LinTest 2 0 16 0 0 8 1` sends data on LIN2

```shell
D-Robotics:/$ LinTest 2 0 16 0 0 8 1
[get_Lin_status 113] [INFO]: Lin status: LIN_CH_SLEEP
[LinTest 290] [INFO]: ####################### test_case_num: 2 #######################
############################# Loop Times: 1 #############################
[Lin_Transfer_Test 214] [INFO]: Transfer success.
[get_Lin_status 86] [INFO]: Lin status: LIN_TX_OK
[LinTest 305] [INFO]: Test case pass.
[LinTest 310] [INFO]: #####################################################################
```

</DocScope>


## Application Programming Interface

#### void Lin_Init(const Lin_ConfigType *Config)

```shell
Description：LIN driver initialization. Pass NULL to use the default configuration in Lin_PBcfg.c.

Parameters(in)
    Config: Pointer to LIN configuration (NULL = use default PostBuild configuration)
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```


#### Std_ReturnType Lin_SendFrame(uint8 Channel, const Lin_PduType *PduInfoPtr)

```shell
Description：Master starts a frame transfer on the given channel (TX: send data / RX: send header and receive the slave response).

Parameters(in)
    Channel: LIN channel
    PduInfoPtr: Pointer to the frame descriptor (Pid / Cs / Drc / Dl / SduPtr)
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: transfer started successfully
    E_NOT_OK: failed
```

#### Lin_StatusType Lin_GetStatus(uint8 Channel, uint8 \*\*Lin_SduPtr)

```shell
Description：Get the transfer status of a channel; on receive completion the received data buffer is returned through Lin_SduPtr.

Parameters(in)
    Channel: LIN channel
Parameters(inout)
    None
Parameters(out)
    Lin_SduPtr: Pointer to the received data buffer (valid when RX completes)
Return value：Lin_StatusType
    Current channel status (LIN_TX_OK / LIN_RX_OK / LIN_TX_BUSY / LIN_RX_BUSY, etc.)
```

#### Std_ReturnType Lin_GoToSleep(uint8 Channel)

```shell
Description：Send a go-to-sleep command on the channel and enter sleep.

Parameters(in)
    Channel: LIN channel
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: success
    E_NOT_OK: failed
```

#### Std_ReturnType Lin_GoToSleepInternal(uint8 Channel)

```shell
Description：Set the channel to sleep directly, without sending a command on the bus.

Parameters(in)
    Channel: LIN channel
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: success
    E_NOT_OK: failed
```

#### Std_ReturnType Lin_Wakeup(uint8 Channel)

```shell
Description：Send a wakeup pulse on the bus.

Parameters(in)
    Channel: LIN channel
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: success
    E_NOT_OK: failed
```

#### Std_ReturnType Lin_WakeupInternal(uint8 Channel)

```shell
Description：Set the channel to operational, without sending a wakeup pulse.

Parameters(in)
    Channel: LIN channel
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: success
    E_NOT_OK: failed
```

#### Std_ReturnType Lin_CheckWakeup(uint8 Channel)

```shell
Description：Check the wakeup event of the given channel.

Parameters(in)
    Channel: LIN channel
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: success
    E_NOT_OK: failed
```

#### void Lin_GetVersionInfo(Std_VersionInfoType *versioninfo)

```shell
Description：Get LIN driver version information.

Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    versioninfo: Version information struct (vendorID / moduleID / sw version)
Return value：None
```

#### Std_ReturnType Port_SetFunctionPins(PinFunc_e PinFunc)

```shell
Description：Configure the pin mux for the given function. Must be called before using LIN.

Parameters(in)
    PinFunc: Pin function (S100: PORT_FUNC_LIN1 / S600: PORT_FUNC_LIN2, PORT_FUNC_LIN3)
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: set success
    E_NOT_OK: set failed
```
