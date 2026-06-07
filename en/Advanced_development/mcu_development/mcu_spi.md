# 7.5.7 SPI User Guide

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Advanced_development/mcu_development/mcu_spi

## Hardware Support

- If SPI uses DMA transfer, the following restrictions must be observed:
- The transfer length must be 8-byte aligned, otherwise data boundary crossing issues may occur;
- The buffer addresses for sending and receiving data must be 64-byte aligned;
- The amount of data transferred in a single channel must not exceed 4096 bytes;
- SPI as Slave function is supported;
- When the MCU-side SPI acts as a Slave and the rate exceeds 9M, only DMA mode can be used;
- When the MCU acts as an SPI slave device, its communication clock is provided by the master device. Therefore, the slave device must respond immediately to every data transmission request from the master device. If interrupt handling mode is used, the execution time of the SPI interrupt service routine must be kept sufficiently short. If interrupts are blocked for too long and the data register is not serviced in time, the receive buffer will overflow. For this reason, the use of DMA transfer mode is strongly recommended, as it uses hardware to automatically handle data movement, thereby ensuring the real-time performance and reliability of communication.
- When the MCU-side SPI operates in 8-bit mode, the following restrictions apply:
- Maximum speed for 1 SPI parallel transmit/receive: 50M;
- Maximum speed for 2 SPI parallel transmit/receive: 33.3M;
- Maximum speed for 3 SPI parallel transmit/receive: 25M;
- Maximum speed for 4 SPI parallel transmit/receive: 20M;
- Maximum speed for 5 SPI parallel transmit/receive: 15.6M;
- Maximum speed for 6 SPI parallel transmit/receive: 12.5M;
- The SPI peripheral only supports MSB;
- Neither SpiCsPolarity nor spitimeclk2c support configuration; SpiCsPolarity defaults to active low.
- When SpiCsToggleEnable configuration is enabled, the CS pin will be pulled high after the SPI transmits one frame. Only TRAILING mode is supported; LEADING mode is not supported.
- SPI DMA mode consumes lower CPU load compared to non-DMA mode.
- When SPI transmits data in non-DMA mode and the system load is high, the SPI FIFO may not be written in time due to delayed SPI interrupt response, causing the CS pin to be briefly pulled high. In this case, DMA mode is recommended.
- If the use case involves multiple sequences performing asynchronous transfers using the same SPI IP, and there is no requirement for the order of transfer completion among the sequences, sequence transmission queuing may occur. In this case, critical section protection with interrupts disabled needs to be implemented in the SchM_Spi.c file.

## Code Paths

- `McalCdd/Spi/inc/Spi.h` : Header file for the SPI driver
- `McalCdd/Spi/inc/Spi_Lld.h` : Header file for the SPI low-level driver
- `McalCdd/Spi/src/Spi.c` : Source file for the SPI driver
- `McalCdd/Spi/src/Spi_Lld.c` : Source file for the SPI low-level driver
- `McalCdd/Common/Register/inc/Spi_Register.h` : SPI register definition file
- `Platform/Schm/SchM_Spi.h` : Scheduling management header file for the SPI module
- `Config/McalCdd/gen_xxx/Spi/inc/Spi_Board.h` : SPI board configuration header file
- `Config/McalCdd/gen_xxx/Spi/inc/Spi_Cfg.h` : SPI configuration header file
- `Config/McalCdd/gen_xxx/Spi/inc/Spi_PBcfg.h` : SPI PB configuration header file
- `Config/McalCdd/gen_xxx/Spi/src/Spi_board.c` : SPI board configuration source file
- `Config/McalCdd/gen_xxx/Spi/src/Spi_PBcfg.c` : SPI PB configuration source file
- `samples/Spi/SPI_sample/Spi_sample.c` : SPI sample code
- `samples/Spi/SPI_sample/Spi_common.c` : SPI sample code

## Application Sample

### Software Operation Flow

The general software operation flow is as follows:

1. Initialization

- Modify the configuration structures such as `ChannelCfgArrayPtr` , `JobCfgArrayPtr` , `SeqCfgArrayPtr` , `HwCfgPtr` , `PhyCfgPtr` , etc., to configure the SPI instance with your desired baud rate and transfer mode. Refer to the SPI configuration instructions [SPI Configuration Instructions](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_spi#spi_config) .
- Call `Spi_Init(&Spi_Config)` or `Spi_Init(NULL)` . When NULL is passed, the default configuration in `Spi_PBcfg.c` is used.
- The driver iterates and initializes internal data structures (such as `Spi_ChannelState` , `Spi_JobState` , `Spi_HwQueueArray` , etc.) and physical SPI hardware units (setting registers based on `Spi_PhyCfgType` and `Spi_IpCfg` ) according to the configuration information.
2. Modify the configuration structures such as `ChannelCfgArrayPtr` , `JobCfgArrayPtr` , `SeqCfgArrayPtr` , `HwCfgPtr` , `PhyCfgPtr` , etc., to configure the SPI instance with your desired baud rate and transfer mode. Refer to the SPI configuration instructions [SPI Configuration Instructions](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_spi#spi_config) .
3. Call `Spi_Init(&Spi_Config)` or `Spi_Init(NULL)` . When NULL is passed, the default configuration in `Spi_PBcfg.c` is used.
4. The driver iterates and initializes internal data structures (such as `Spi_ChannelState` , `Spi_JobState` , `Spi_HwQueueArray` , etc.) and physical SPI hardware units (setting registers based on `Spi_PhyCfgType` and `Spi_IpCfg` ) according to the configuration information.
5. Set Transfer Mode:

- The application selects interrupt mode or polling mode using `Spi_SetAsyncMode()` .
6. The application selects interrupt mode or polling mode using `Spi_SetAsyncMode()` .
7. Data Preparation:

- The application uses `Spi_WriteIB()` or `Spi_SetupEB()` to place data to be sent into the buffer associated with the channel.
8. The application uses `Spi_WriteIB()` or `Spi_SetupEB()` to place data to be sent into the buffer associated with the channel.
9. Transfer Request:

- The application calls `Spi_AsyncTransmit(sequence)` or `Spi_SyncTransmit(sequence)` to start a sequence transmission.
10. The application calls `Spi_AsyncTransmit(sequence)` or `Spi_SyncTransmit(sequence)` to start a sequence transmission.
11. Driver Processing:

- The driver finds the corresponding `Spi_SeqCfg` based on the `sequence ID` .
- Retrieves the job list based on `Spi_SeqCfg.JobIndexList` .
- For each job in the sequence:
- Determines the physical SPI hardware unit to use based on `Spi_JobCfg.HWUnit` .
- Obtains the communication parameters for the external device corresponding to the job based on `Spi_JobCfg.HwCfgPtr` .
- Retrieves the channel list based on `Spi_JobCfg.ChannelIndexList` .
- Iterates through the channel list, obtaining the data to send from the buffer pointed to by `Spi_ChannelCfg.BufferDescriptor` .
- Configures the physical SPI hardware unit.
- Starts the hardware transfer.
12. The driver finds the corresponding `Spi_SeqCfg` based on the `sequence ID` .
13. Retrieves the job list based on `Spi_SeqCfg.JobIndexList` .
14. For each job in the sequence:
15. Determines the physical SPI hardware unit to use based on `Spi_JobCfg.HWUnit` .
16. Obtains the communication parameters for the external device corresponding to the job based on `Spi_JobCfg.HwCfgPtr` .
17. Retrieves the channel list based on `Spi_JobCfg.ChannelIndexList` .
18. Iterates through the channel list, obtaining the data to send from the buffer pointed to by `Spi_ChannelCfg.BufferDescriptor` .
19. Configures the physical SPI hardware unit.
20. Starts the hardware transfer.
21. Transfer Completion:

- For asynchronous transfers, after the hardware completes the transfer (detected via interrupt or polling), the driver calls the corresponding notification function.
- For synchronous transfers, the function waits for the transfer to complete.
22. For asynchronous transfers, after the hardware completes the transfer (detected via interrupt or polling), the driver calls the corresponding notification function.
23. For synchronous transfers, the function waits for the transfer to complete.
24. Status Query:

- The application can query the transfer status using functions like `Spi_GetJobResult()` , `Spi_GetSequenceResult()` , etc.
25. The application can query the transfer status using functions like `Spi_GetJobResult()` , `Spi_GetSequenceResult()` , etc.
tip

- SPI only needs to configure `set_AsyncMode()` once after INIT; repeated calls may cause transfer anomalies.
- When a transfer anomaly occurs, the SPI state machine does not reset automatically. You need to manually call the `Spi_Cancel()` function to reset the transfer state machine.
- DMA is used in the sample but not initialized because it is already initialized in the `Target/Target-hobot-lite-freertos-mcu1/target/HorizonTask.c` file.

### Single Chip Select Usage Example

The `spi_test` command is used to test SPI (Serial Peripheral Interface) functionality. This command supports initialization and parameter setting, displaying current parameters, and executing SPI data transfer tests.

**Command Syntax**

```bash
spi_test <operation> [bus_id] [sync_mode] [trans_mode]
```

**Parameter Description**

- operation: Specifies the operation to perform.
- 0: Initialization and parameter setting.
- 1: Display currently set parameters.
- 2: Execute SPI test (asynchronous or synchronous).
- bus_id (Required only when operation is 0): Specifies the SPI bus to use.
- Value range: 2 to 6, corresponding to SPI2 to SPI6 respectively.
- sync_mode (Required only when operation is 0): Specifies the synchronous mode for SPI communication.
- 0: Asynchronous mode (async)
- 1: Synchronous mode (sync)
- trans_mode (Required only when operation is 0): Specifies the underlying mechanism for SPI data transfer.
- 0: Polling mode (polling)
- 1: Interrupt mode (interrupt)
tip
The application layer configuration and the underlying configuration must be consistent; otherwise, errors will occur.

Take SPI3 as an example, short the MISO and MOSI pins of SPI3, and run the following command to set the transfer parameters.

```shell
D-Robotics:/$ spi_test 0 3 0 0
[055.578172 0]Init&&Parameter setting
[055.578428 0]Show Spi parameter
[055.578792 0]spi_bus = 3
[055.579085 0]sync_mode = async
[055.579443 0]trans_mode = polling
```

Run the following command to test.

```shell
D-Robotics:/$ spi_test 2
[059.643996 0]Sequence: 1, transfer_length = 128 spi_framesize = 16
[059.673978 0]
RxChBuf0 (256 bytes):
0CBD2A80: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  | ................
0CBD2A90: 10 11 12 13 14 15 16 17 18 19 1A 1B 1C 1D 1E 1F  | ................
0CBD2AA0: 20 21 22 23 24 25 26 27 28 29 2A 2B 2C 2D 2E 2F  |  !"#$%&'()*+,-./
0CBD2AB0: 30 31 32 33 34 35 36 37 38 39 3A 3B 3C 3D 3E 3F  | 0123456789:;<=>?
0CBD2AC0: 40 41 42 43 44 45 46 47 48 49 4A 4B 4C 4D 4E 4F  | @ABCDEFGHIJKLMNO
0CBD2AD0: 50 51 52 53 54 55 56 57 58 59 5A 5B 5C 5D 5E 5F  | PQRSTUVWXYZ[\]^_
0CBD2AE0: 60 61 62 63 64 65 66 67 68 69 6A 6B 6C 6D 6E 6F  | `abcdefghijklmno
0CBD2AF0: 70 71 72 73 74 75 76 77 78 79 7A 7B 7C 7D 7E 7F  | pqrstuvwxyz{|}~.
0CBD2B00: 80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F  | ................
0CBD2B10: 90 91 92 93 94 95 96 97 98 99 9A 9B 9C 9D 9E 9F  | ................
0CBD2B20: A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE AF  | ................
0CBD2B30: B0 B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF  | ................
0CBD2B40: C0 C1 C2 C3 C4 C5 C6 C7 C8 C9 CA CB CC CD CE CF  | ................
0CBD2B50: D0 D1 D2 D3 D4 D5 D6 D7 D8 D9 DA DB DC DD DE DF  | ................
0CBD2B60: E0 E1 E2 E3 E4 E5 E6 E7 E8 E9 EA EB EC ED EE EF  | ................
0CBD2B70: F0 F1 F2 F3 F4 F5 F6 F7 F8 F9 FA FB FC FD FE FF  | ................
[059.687954 0]
TxChBuf0 (256 bytes):
0CBD2B80: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  | ................
0CBD2B90: 10 11 12 13 14 15 16 17 18 19 1A 1B 1C 1D 1E 1F  | ................
0CBD2BA0: 20 21 22 23 24 25 26 27 28 29 2A 2B 2C 2D 2E 2F  |  !"#$%&'()*+,-./
0CBD2BB0: 30 31 32 33 34 35 36 37 38 39 3A 3B 3C 3D 3E 3F  | 0123456789:;<=>?
0CBD2BC0: 40 41 42 43 44 45 46 47 48 49 4A 4B 4C 4D 4E 4F  | @ABCDEFGHIJKLMNO
0CBD2BD0: 50 51 52 53 54 55 56 57 58 59 5A 5B 5C 5D 5E 5F  | PQRSTUVWXYZ[\]^_
0CBD2BE0: 60 61 62 63 64 65 66 67 68 69 6A 6B 6C 6D 6E 6F  | `abcdefghijklmno
0CBD2BF0: 70 71 72 73 74 75 76 77 78 79 7A 7B 7C 7D 7E 7F  | pqrstuvwxyz{|}~.
0CBD2C00: 80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F  | ................
0CBD2C10: 90 91 92 93 94 95 96 97 98 99 9A 9B 9C 9D 9E 9F  | ................
0CBD2C20: A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE AF  | ................
0CBD2C30: B0 B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF  | ................
0CBD2C40: C0 C1 C2 C3 C4 C5 C6 C7 C8 C9 CA CB CC CD CE CF  | ................
0CBD2C50: D0 D1 D2 D3 D4 D5 D6 D7 D8 D9 DA DB DC DD DE DF  | ................
0CBD2C60: E0 E1 E2 E3 E4 E5 E6 E7 E8 E9 EA EB EC ED EE EF  | ................
0CBD2C70: F0 F1 F2 F3 F4 F5 F6 F7 F8 F9 FA FB FC FD FE FF  | ................
[059.702104 0]=====SPI ASYNC TEST SUCCESS=====
```

### Dual Chip Select Usage Example

The `SpiTest_Mul_cs` command is used to test SPI (Serial Peripheral Interface) functionality.

Usage and parameter parsing are as follows:

```shell
########################## support test case: ##########################
usag: SpiTest_Mul_cs Case_num Sequences Cs DataWidth DataLen Loop_times
[1]: SpiTest_Mul_cs 1 1 0 8 1 1 -- get versioninfo
[2]: SpiTest_Mul_cs 2 5 0 8 10 1 -- InterruptMode Sync Transfer
[3]: SpiTest_Mul_cs 3 5 0 8 10 1 -- PollingMode Sync Transfer
[4]: SpiTest_Mul_cs 4 5 0 8 10 1 -- InterruptMode Async Transfer
[5]: SpiTest_Mul_cs 5 5 0 8 10 1 -- PollingMode Async Transfer
other: SpiTest 110  -- help
```

- Parameter parsing:
- Case_num (argv[1]): Specifies the operation to perform, supports 5 modes. For example, to use interrupt asynchronous transfer, set Case_num to 4.
- Sequences (argv[2]): Specifies which SPI to use. For example, to use SPI4, set Sequences parameter to 4.
- Cs (argv[3]): Indicates which CS to use. For example, to use cs0, set Cs parameter to 0.
- DataWidth (argv[4]): Indicates the data width for transfer. For example, for 8-bit width, set DataWidth to 8.
- Datalen (argv[5]): Indicates the amount of data to transfer. For example, to transfer 10 data sets, set Datalen to 10.
- Loop_times (argv[6]): Indicates how many times to test. For example, to test 5 times, set Loop_times to 5.
- Example:
- SPI4, async interrupt transfer, cs1, 8-bit data width, 10 data sets, test 1 time: SpiTest_Mul_cs 4 4 1 8 10 1
Short the MISO and MOSI pins of SPI4, and run the following command.

```shell
Robotics:/$ SpiTest_Mul_cs 4 4 1 8 10 1
[get_spi_status 98] [INFO]: SPI status: SPI_IDLE
[SpiTest_Mul_cs 450] [INFO]: ####################### test_case_num: 4 #######################
############################# Loop Times: 1 #############################
[Spi_Trans_Test 231] [INFO]: data_tx: 0xcbccc40, data_rx: 0xcbcca40
[Spi_Trans_Test 238] [INFO]: len = 10, check_data_len = 10
[get_spi_sequence_result 122] [INFO]: SPI result: SPI_SEQ_PENDING
TX | 00 01 02 03 04 05 06 07 08 09 __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __
RX | 00 01 02 03 04 05 06 07 08 09 __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __
[check_data 81] [INFO]: check data success.
[Spi_Interrupt_Async_Transfer_Test 353] [INFO]: Transfer success.
[SpiTest_Mul_cs 474] [INFO]: Test case pass.
[SpiTest_Mul_cs 479] [INFO]: #####################################################################
```

### Single Chip Select Usage Example

The `spi_test` command is used to test SPI (Serial Peripheral Interface) functionality. This command supports initialization and parameter setting, displaying current parameters, and executing SPI data transfer tests.

**Command Syntax**

tip
The application layer configuration and the underlying configuration must be consistent; otherwise, errors will occur.

**Operation 0: Configure parameters for Group 1**

```bash
spi_test 0 <spi_bus> <sync_mode> <trans_mode> <ch_cfg> <cs_seq0> <cs_seq1> <cs_seq2> <cs_seq3>
```

- bus_id: SPI bus ID (optional, default is 4)
- sync_mode: 0=async, 1=sync
- trans_mode: 0=polling, 1=interrupt
- ch_cfg: SPI channel configuration
- cs_seq0: SPI sequence ID used by cs0, 255 = invalid
- cs_seq1: SPI sequence ID used by cs1, 255 = invalid
- cs_seq2: SPI sequence ID used by cs2, 255 = invalid
- cs_seq3: SPI sequence ID used by cs3, 255 = invalid
Configure the basic parameters of SPI. After the parameters are configured, they are saved in group 1.

```shell
D-Robotics:/$ spi_test 0 13 0 1 10 2 3 255 255
[046.803972 0]Init&&Parameter setting
[046.804397 0]Test parameters configured successfully:
[046.804991 0]Test Parameter at index 0:
[046.805447 0]  spi_bus: 13
[046.805762 0]  sync_mode: ASYNC
[046.806132 0]  trans_mode: INTERRUPT
[046.806555 0]  ch_cfg: 10
[046.806859 0]  cs_seq: [2, 3, 255, 255]
```

**Operation 1: Display parameter information**

Display all current test parameter configurations, where the first group is used to store the custom configuration from operation 0.

```bash
spi_test 1
```

```shell
D-Robotics:/$ spi_test 1
[06649.837117 0]Test Parameter at index 0:
[06649.837581 0]  spi_bus: 255
[06649.837928 0]  sync_mode: ASYNC
[06649.838327 0]  trans_mode: INTERRUPT
[06649.838772 0]  ch_cfg: 255
[06649.839123 0]  cs_seq: [255, 255, 255, 255]
[06649.839644 0]Test Parameter at index 1:
[06649.840121 0]  spi_bus: 6
[06649.840447 0]  sync_mode: ASYNC
[06649.840837 0]  trans_mode: INTERRUPT
[06649.841282 0]  ch_cfg: 0
[06649.841597 0]  cs_seq: [0, 255, 255, 255]
[06649.842096 0]Test Parameter at index 2:
[06649.842573 0]  spi_bus: 4
[06649.842899 0]  sync_mode: SYNC
[06649.843295 0]  trans_mode: POLLING
[06649.843718 0]  ch_cfg: 4
[06649.844032 0]  cs_seq: [4, 255, 255, 255]
```

**Operation 2: Execute SPI test**

```shell
spi_test 2 [bus_id] [cs_id]
```

- bus_id: SPI bus ID (optional, default is 4). The busid here must exist in the parameter configuration group (i.e., the parameter configuration group displayed by the `spi_test 1` command); otherwise, the test will fail.
- cs_id: Chip select ID, range 0 3 (optional, default is 0. Currently, only cs0 testing is supported; cs1 3 require code modification for testing).

```shell
D-Robotics:/$ spi_test 2 4 0
[0323.134926 0]Using SPI Bus ID: 4, CS ID: 0
[0323.135502 0]spi channel: 4, transfer_length = 256 spi_framesize = 8
[0323.138358 0]
RxChBuf0 (256 bytes):
 | ................
 | ................
 |  !"#$%&'()*+,-./
 | 0123456789:;<=>?
 | @ABCDEFGHIJKLMNO
 | PQRSTUVWXYZ[\]^_
 | `abcdefghijklmno
 | pqrstuvwxyz{|}~.
 | ................
 | ................
 | ................
 | ................
 | ................
 | ................
 | ................
 | ................
[0323.145129 0]
TxChBuf0 (256 bytes):
 | ................
 | ................
 |  !"#$%&'()*+,-./
 | 0123456789:;<=>?
 | @ABCDEFGHIJKLMNO
 | PQRSTUVWXYZ[\]^_
 | `abcdefghijklmno
 | pqrstuvwxyz{|}~.
 | ................
 | ................
 | ................
 | ................
 | ................
 | ................
 | ................
 | ................
[0323.151786 0]=====SPI SYNC TEST SUCCESS=====
```

### Dual Chip Select Usage Example (BMI088 Test)

The S600 MCU daughter board is equipped with a BMI088 sensor, which communicates with the MCU via the SPI13 bus. cs0 is connected to the accelerometer (acc), and cs1 is connected to the gyroscope (gyr).

Usage and parameter parsing are as follows:

1. Initialize the BMI088 sensor

```shell
D-Robotics:/$ Bmi088_ShellInit
[Bmi088_Init] ACC+GYR initialized.
```

1. BMI088 sensor self-test

```shell
D-Robotics:/$ Bmi088_SelfTestGyr
[Bmi088_SelfTestGyr] SELF_TEST=0x12 (rdy=1 fail=0)
[Bmi088_SelfTestGyr] PASS

D-Robotics:/$ Bmi088_SelfTestAcc
ACC_RANGE=0x03 (expect 0x03)
ACC_CONF=0xAC (expect 0xA7)
[Bmi088_SelfTestAcc] self_test(+)=0x0D
[Bmi088_SelfTestAcc] x_pos=12386 mg, y_pos=12346 mg, z_pos=12851 mg
[Bmi088_SelfTestAcc] self_test(-)=0x09
[Bmi088_SelfTestAcc] x_neg=-13513 mg, y_neg=-13787 mg, z_neg=-9556 mg
[Bmi088_SelfTestAcc] dx=25899 mg, dy=26133 mg, dz=22407 mg
[Bmi088_SelfTestAcc] PASS
```

1. Read acc data multiple times

```shell
D-Robotics:/$ Bmi088_TestAcc 50
[Bmi088_TestAcc] acc_id(raw)=0x1E
[Bmi088_TestAcc] ACC RANGE readback=0x03 (expect 0x01)
ACC ax:     3 ay:    -3 az:  1378
ACC ax:0.000 ay:0.000 az:0.252
ACC ax:    -7 ay:    -7 az:  1368
ACC ax:0.001 ay:0.001 az:0.250
ACC ax:     9 ay:   -15 az:  1379
ACC ax:0.001 ay:0.002 az:0.252
ACC ax:    -1 ay:    -8 az:  1383
ACC ax:0.000 ay:0.001 az:0.253
ACC ax:   -65 ay:    16 az:  1356
ACC ax:0.011 ay:0.002 az:0.248
ACC ax:   113 ay:   -88 az:  2027
....
```

1. Read gyr data multiple times

```shell
D-Robotics:/$ Bmi088_TestGyr 50
[Bmi088_TestGyr] gyr_id(raw)=0x0F
[Bmi088_TestGyr] GYR RANGE readback=0x03 (expect 0x03)
GYR gx:    22 gy:    13 gz:   -14
GYR gx:0.167 gy:0.099 gz:0.106
GYR gx:    78 gy:    61 gz:  1114
GYR gx:0.595 gy:0.465 gz:8.499
GYR gx:    89 gy:   120 gz:  1197
GYR gx:0.679 gy:0.915 gz:9.132
GYR gx:    69 gy:   102 gz:   853
GYR gx:0.526 gy:0.778 gz:6.507
GYR gx:  -321 gy:  -538 gz:  1482
GYR gx:-2.449 gy:-4.104 gz:11.306
```

### Configuration File Description

The configuration file `Spi_PBcfg.c` contains the SPI driver configuration. `Spi_ConfigType` is the top-level container that organizes all configuration information (channels, jobs, sequences, hardware units, etc.) into a complete configuration set used to initialize the SPI driver.

```c
/**
 * @struct Spi_ConfigType
 * @NO{S01E17C01}
 * @brief This is the top level structure containing all the
 *         needed parameters for the SPI Handler Driver.
 */
typedef struct
{
    uint32 SpiCoreUse;                                  /**< CoreID used*/
    const Spi_ChannelCfgArray *ChannelCfgArrayPtr;      /**< Pointer to Array of channels defined in the configuration.*/
    const Spi_JobCfgArray *JobCfgArrayPtr;              /**< Pointer to Array of jobs defined in the configuration.*/
    const Spi_SeqCfgArray *SeqCfgArrayPtr;              /**< Pointer to Array of sequences defined in the configuration.*/
    const Spi_HwCfgArray *HwCfgPtr;                     /**< External device unit attributes.*/
    const Spi_PhyCfgArray *PhyCfgPtr;                   /**< Pointer to Array of device instances.*/
    Spi_ChannelType SpiMaxChannel;                      /**< Number of channels defined in the configuration.*/
    Spi_JobType SpiMaxJob;                              /**< Number of jobs defined in the configuration.*/
    Spi_SequenceType SpiMaxSequence;                    /**< Number of sequences defined in the configuration.*/
    Spi_HwNumType SpiMaxHwNum;                          /**< Number of Spi HW defined in the configuration.*/
#if (SPI_DISABLE_DEM_REPORT_ERROR_STATUS == STD_OFF)
    const Mcal_DemErrorType SpiErrorHwCfg;        /**< SPI Driver DEM Error: SPI_E_HARDWARE_ERROR.*/
#endif
} Spi_ConfigType;
```

**Member Explanation**

1. **SpiCoreUse** : Specifies which CPU core can use this SPI configuration. Leave unchanged for single-core systems.
2. **ChannelCfgArrayPtr** : Pointer to an array containing all `Spi_ChannelCfg` configurations. This array defines the properties of all available SPI channels in the system, such as buffer type (IB/EB), frame size, default value, buffer pointer, etc.
3. **JobCfgArrayPtr** : Pointer to an array containing all `Spi_JobCfg` configurations. This array defines the properties of all available SPI jobs in the system, such as the list of channels included, notification function, priority, associated physical unit (HWUnit), etc.
4. **SeqCfgArrayPtr** : Pointer to an array containing all `Spi_SeqCfg` configurations. This array defines the properties of all available SPI sequences in the system, such as the list of jobs included, notification function, whether it is interruptible, etc.
5. **HwCfgPtr** : Pointer to an array containing all `Spi_HwCfg` configurations. This array defines the hardware properties of all external devices in the system, primarily communication-related parameters (such as baud rate, clock polarity, chip select, etc.).
6. **PhyCfgPtr** : Pointer to an array containing all `Spi_PhyCfgType` configurations. This array defines the basic operating modes and characteristics of all physical SPI hardware units (Physical SPI Unit, PhyUnit) in the system (such as master/slave mode, DMA usage, transfer mode, etc.).
7. **SpiMaxChannel** : The total number of channels defined in the configuration. Used for size allocation and boundary checking of internal driver arrays.
8. **SpiMaxJob** : The total number of jobs defined in the configuration. Used for size allocation and boundary checking of internal driver arrays.
9. **SpiMaxSequence** : The total number of sequences defined in the configuration. Used for size allocation and boundary checking of internal driver arrays.
10. **SpiMaxHwNum** : The number of physical SPI hardware units (PhyUnit) involved in the configuration. Used for size allocation and boundary checking of internal driver arrays.
11. **SpiErrorHwCfg** : Used to configure reporting parameters for SPI hardware errors.
**Relationships between members**

Applications typically initiate a transfer by calling `Spi_AsyncTransmit()` or `Spi_SyncTransmit()` with a sequence ID. Therefore, the sequence is the entry point for direct user interaction. The simplified entity relationship between it and channels, jobs, hardware configurations, and physical unit configurations is as follows:

Both `SPI_HWUNIT` and `SPI_EXTERNAL_DEVICE` need to be associated with a hardware instance, which determines which SPI interface is used for communication. Since the RDKS100 platform provides a total of 8 SPI controllers, with the MAIN domain containing 2 (SPI0, SPI1) and the MCU domain containing 6 (SPI2 to SPI7), the SPI in the MCU domain actually starts numbering from SPI2. The table below shows the mapping between SPI sequence configurations (Spi SeqCfg) and the corresponding hardware resources (Spi BusId, HWUnit, Instance) in **green** font.

| **SPI SeqCfg** | **Spi BusId** | **HWUnit** | **Instance** | **Spi Baudrate** | **Spi Cs** | **Frame size** 
| SpiSequence_0 | SPI2 | CSIB0 | 0 | 2000000 | CS0 | 16 bit 
| SpiSequence_1 | SPI3 | CSIB1 | 1 | 2000000 | CS0 | 16 bit 
| SpiSequence_2 | SPI4 | CSIB2 | 2 | 1000000 | CS0 | 8 bit 
| SpiSequence_3 | SPI5 | CSIB3 | 3 | 1000000 | CS0 | 8 bit 
| SpiSequence_4 | SPI5 | CSIB3 | 3 | 1000000 | CS0 | 16 bit 
| SpiSequence_5 | SPI6 | CSIB4 | 4 | 1000000 | CS0 | 8 bit 
| SpiSequence_6 | SPI7 | CSIB5 | 5 | 1000000 | CS0 | 8 bit 
| SpiSequence_7 | SPI2 | CSIB0 | 0 | 2000000 | CS1 | 16 bit 
| SpiSequence_8 | SPI3 | CSIB1 | 1 | 2000000 | CS1 | 16 bit 
| SpiSequence_9 | SPI4 | CSIB2 | 2 | 1000000 | CS1 | 8 bit 
| SpiSequence_10 | SPI5 | CSIB3 | 3 | 1000000 | CS1 | 8 bit 
| SpiSequence_11 | SPI5 | CSIB3 | 3 | 1000000 | CS1 | 16 bit 
| SpiSequence_12 | SPI6 | CSIB4 | 4 | 1000000 | CS1 | 8 bit 
| SpiSequence_13 | SPI7 | CSIB5 | 5 | 1000000 | CS1 | 8 bit 

| **SPI SeqCfg** | **Spi BusId** | **HWUnit** | **Instance** | **Spi Baudrate** | **Spi Cs** | **Frame size** 
| SpiSequence_0 | SPI6 | CSIB2 | 2 | 2000000 | CS0 | 16 bit 
| SpiSequence_1 | SPI6 | CSIB2 | 2 | 2000000 | CS1 | 16 bit 
| SpiSequence_2 | SPI13 | CSIB9 | 9 | 1000000 | CS0 | 8 bit 
| SpiSequence_3 | SPI13 | CSIB9 | 9 | 1000000 | CS1 | 8 bit 
| SpiSequence_4 | SPI4 | CSIB0 | 0 | 1000000 | CS0 | 8 bit 
| SpiSequence_5 | SPI4 | CSIB0 | 0 | 1000000 | CS1 | 8 bit 

tip
The factory default parameters for MCU1's SPI are based on the `Spi_PBcfg.c` configuration file, which is time-sensitive but generally not subject to change.

### Application Interface

#### void Spi_Init(const Spi_ConfigType* ConfigPtr)

```shell
Description：Service for SPI initialization.

Parameters(in)
    ConfigPtr: Pointer to configuration set
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### Std_ReturnType Spi_WriteIB(Spi_ChannelType Channel, const Spi_DataBufferType* DataBufferPtr)

```shell
Description：Service for SPI de-initialization.

Parameters(in)
    Channel: Channel ID.
    DataBufferPtr: Source data buffer pointer
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: Spi write IB buffer success.
    E_NOT_OK: Spi write IB buffer failed.
```

#### Std_ReturnType Spi_AsyncTransmit(Spi_SequenceType Sequence)

```shell
Description：Service to transmit data on the SPI bus.

Sync/Async:Asynchronous
Parameters(in)
    Sequence: Sequence ID.
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: set success
    E_NOT_OK: set failed
```

#### Std_ReturnType Spi_ReadIB(Spi_ChannelType Channel, Spi_DataBufferType* DataBufferPtr)

```shell
Description：Service for reading synchronously one or more data from an IB SPI
             Handler/Driver Channel specified by parameter.

Sync/Async:Synchronous
Parameters(in)
    Channel: Channel ID.
Parameters(inout)
    None
Parameters(out)
    DataBufferPtr: Pointer to destination data buffer in RAM
Return value：Std_ReturnType
    E_OK: set success
    E_NOT_OK: set failed
```

#### Std_ReturnType Spi_SetupEB(Spi_ChannelType Channel, const Spi_DataBufferType* SrcDataBufferPtr, Spi_DataBufferType* DesDataBufferPtr, Spi_NumberOfDataType Length)

```shell
Description：Service to setup the buffers and the length of data for the EB SPI
             Handler/Driver Channel specified.

Sync/Async:Synchronous
Parameters(in)
    Channel: Channel ID.
    SrcDataBufferPtr: Pointer to the memory location that will hold the transmitted data
    Length: Length (number of data elements) of the data to be transmitted
Parameters(inout)
    None
Parameters(out)
    DesDataBufferPtr: Pointer to the memory location that will hold the received data
Return value：Std_ReturnType
    E_OK: Spi Setup EB buffer success.
    E_NOT_OK: Spi Setup EB buffer failed.
```

#### Spi_StatusType Spi_GetStatus(const Spi_ConfigType* ConfigPtr)

```shell
Description：Service returns the SPI Handler/Driver software module status.

Sync/Async:Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    None
Return value：Spi_StatusType
    Spi_StatusType
```

#### Spi_JobResultType Spi_GetJobResult(Spi_JobType Job)

```shell
Description：This service returns the last transmission result of the specified Job.

Sync/Async:Synchronous
Parameters(in)
    Job: Job ID. An invalid job ID will return an undefined result.
Parameters(inout)
    None
Parameters(out)
    None
Return value：Spi_JobResultType
    Spi_JobResultType
```

#### Spi_SeqResultType Spi_GetSequenceResult(Spi_SequenceType Sequence)

```shell
Description：This service returns the last transmission result of the specified Sequence.

Sync/Async:Synchronous
Parameters(in)
    Sequence: Sequence ID. An invalid sequence ID will return an undefined result.
Parameters(inout)
    None
Parameters(out)
    None
Return value：Spi_JobResultType
    Spi_JobResultType
```

#### void Spi_GetVersionInfo(Std_VersionInfoType* versioninfo)

```shell
Description：This service returns the version information of this module.

Sync/Async:Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    versioninfo: Pointer to where to store the version information of this module.
Return value：None
```

#### Std_ReturnType Spi_SyncTransmit(Spi_SequenceType Sequence)

```shell
Description：Service to transmit data on the SPI bus.

Sync/Async:Synchronous
Parameters(in)
    Sequence: Sequence ID.
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: Transmission command has been accepted
    E_NOT_OK: Transmission command has not been accepted
```

#### Spi_StatusType Spi_GetHWUnitStatus(Spi_HWUnitType HWUnit)

```shell
Description：This service returns the status of the specified SPI Hardware
             microcontroller peripheral.

Sync/Async:Synchronous
Parameters(in)
    HWUnit: SPI Hardware microcontroller peripheral (unit) ID.
Parameters(inout)
    None
Parameters(out)
    None
Return value：Spi_StatusType
    Spi_StatusType
```

#### void Spi_Cancel(Spi_SequenceType Sequence)

```shell
Description：Service cancels the specified on-going sequence transmission.

Sync/Async:Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### Std_ReturnType Spi_SetAsyncMode(Spi_AsyncModeType Mode)

```shell
Description：Service to set the asynchronous mechanism mode for SPI
             busses handled asyn-chronously.

Sync/Async:Synchronous
Parameters(in)
    Mode: New mode required.
Parameters(inout)
    None
Parameters(out)
    None
Return value：    Std_ReturnType:
    E_OK: Setting command has been accepted
    E_NOT_OK: Setting command has not been accepted
```

#### void Spi_MainFunction_Handling(void)

```shell
Description：This function shall polls the SPI interrupts linked to HW Units
             allocated to the transmission of SPI sequences to enable the evolution
             of transmission state machine.

Sync/Async:Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```
