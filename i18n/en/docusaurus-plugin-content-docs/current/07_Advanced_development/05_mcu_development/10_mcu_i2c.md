---
sidebar_position: 10
---

# 7.5.11 I2C User Guide

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK S100">
The S100 MCU provides a standard I2C bus. The I2C bus controller transfers information between devices connected to the bus through the serial data line (SDA) and serial clock line (SCL). Each device has a unique address. The main function of the I2C subsystem is to implement serial communication between the microcontroller and peripherals. It can drive MIPI daughter cards, PMIC chips, and other common peripherals.
</DocScope>
<DocScope products="RDK S600">
The S600 MCU provides a standard I2C bus. The I2C bus controller transfers information between devices connected to the bus through the serial data line (SDA) and serial clock line (SCL). Each device has a unique address. The main function of the I2C subsystem is to implement serial communication between the microcontroller and peripherals. It can drive MIPI daughter cards, PMIC chips, and other common peripherals.
</DocScope>

## I2C Controller

The I2C controller supports the following features:
- Three speed mode options (the driver currently does not support HIGH SPEED mode)
  - **Standard Mode**: 0~100 Kb/s
  - **Fast Mode & Fast Mode Plus**:
    - Fast Mode: 0~400 Kb/s
    - Fast Mode Plus: 0~1000 Kb/s
  - **High-Speed Mode**: 0~3.4 Mb/s
- Master/slave mode configuration
- 7-bit and 10-bit addressing modes

The S100 MCU provides 4 I2C controllers (I2C6~9) in total, with Fast Mode Plus as the default speed.

## Code Paths

- `McalCdd/Common/Register/inc/I2c_Register.h`: Register definitions
- `McalCdd/I2c/src/I2c.c`: Driver source code
- `McalCdd/I2c/src/I2c_Lld.c`: Low-level driver source code
- `McalCdd/I2c/inc/I2c.h`: Driver header file
- `McalCdd/I2c/inc/I2c_Lld.h`: Low-level driver header file
- `Config/McalCdd/gen_s100_sip_B_mcu1/I2c/src/I2c_PBcfg.c`: PB configuration file
- `Config/McalCdd/gen_s100_sip_B_mcu1/I2c/inc/I2c_PBcfg.h`: PB configuration header file
- `Config/McalCdd/gen_s100_sip_B_mcu1/I2c/inc/I2c_Board.h`: I2C board-level configuration file
- `samples/I2c/src/I2c_Cmd.c`: I2C sample

### Initialization and Scheduling

General-purpose I/O pin initialization is outside the scope of the I2C driver. The PORT driver should initialize I/O first (`Port_Init(NULL);`), and then the I2C driver can be used. The I2C driver initialization function is `I2c_Init(NULL)`.

## I2C Usage

<DocScope products="RDK S100">
S100 provides a set of MCU-side commands similar to the open-source i2c-tools for user debugging.
</DocScope>
<DocScope products="RDK S600">
S600 provides a set of MCU-side commands similar to the open-source i2c-tools for user debugging.
</DocScope>

<DocScope products="RDK S100">
The S100 MCU domain supports I2C6~I2C9.
</DocScope>
<DocScope products="RDK S600">
The S600 MCU domain supports I2C10~I2C14.
</DocScope>


Code path:
```sh
samples/I2c/src/I2c_Cmd.c
```

Currently supported commands: `i2cdetect`, `i2cget`, `i2cset`.
- `i2cdetect` — Lists I2C buses and all devices on each bus
- `i2cget` — Reads the value of a register on an I2C device
- `i2cset` — Writes a value to a register on an I2C device

<DocScope products="RDK S100">
Test example:
```sh
D-Robotics:/$ i2cdetect 7
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:    -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
10: -- -- 12 -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```
</DocScope>
<DocScope products="RDK S600">
```c
D-Robotics:/$ i2cdetect 13
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:    -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- 18 -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```
</DocScope>



## Application Programming Interface

### void I2c_Init ( const I2c_ConfigType * Config )

```shell
Description：Subsystem driver initialization function.

Sync/Async：Synchronous
Parameters(in)
    Config： Pointer to configuration structure
Parameters(inout)
    None
Parameters(out)
    None
Return value: None
```

### void I2c_DeInit ( void )

```shell
Description：De-initialize of i2c system to reset values.

Sync/Async：Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    None
Return value: None
```

### Std_ReturnType I2c_SyncDataTrans ( uint8 Channel, const I2c_RequestType* RequestPtr )

```shell
Description：Sends or receives an I2C message blocking.

Sync/Async：Synchronous
Parameters(in)
    Channel: I2C Channel.
    RequestPtr: I2C transmit request type
Parameters(inout)
    None
Parameters(out)
    None
Return value:
    E_OK: command has been accepted
    E_NOT_OK: command has not been accepted
```

### Std_ReturnType I2c_SyncMultiDataTrans ( uint8 Channel, const I2c_RequestType* RequestPtr uint8 I2cRequestCnt)

```shell
Description：Sends or receives an I2C message blocking.

Sync/Async：Synchronous
Parameters(in)
    Channel: I2C Channel.
    RequestPtr: I2C transmit request type
    I2cRequestCnt: I2C transmit num
Parameters(inout)
    None
Parameters(out)
    None
Return value:
    E_OK: command has been accepted
    E_NOT_OK: command has not been accepted
```

### Std_ReturnType I2c_AsyncDataTrans ( uint8 Channel, const I2c_RequestType* RequestPtr )

```shell
Description：This function performs Sends or receives an I2C message non-blocking

Sync/Async：Asynchronous
Parameters(in)
    Channel: I2C Channel.
    RequestPtr: I2C transmit request type
Parameters(inout)
    None
Parameters(out)
    None
Return value:
    E_OK: command has been accepted
    E_NOT_OK: command has not been accepted
```

### I2c_StatusType I2c_StatusGet ( uint8 Channel )

```shell
Description：Gets the status of an I2C channel.

Sync/Async：Synchronous
Parameters(in)
    Channel: I2C Channel.
Parameters(inout)
    None
Parameters(out)
    None
Return value: status of an I2C channel
```

### void I2c_GetVersionInfo ( Std_VersionInfoType* VersionInfo )

```shell
Description：This function Gets the version information of this module

Sync/Async：Synchronous
Parameters(in)
    VersionInfo: version information of this module
Parameters(inout)
    None
Parameters(out)
    None
Return value: None
```
