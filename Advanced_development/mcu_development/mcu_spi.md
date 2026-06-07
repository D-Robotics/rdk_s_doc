# 7.5.7 SPI 使用指南

URL: https://developer.d-robotics.cc/rdk_s_doc/Advanced_development/mcu_development/mcu_spi

## 硬件支持

- 如果 SPI 使用 DMA 传输，必须保证以下限制:
- 传输长度需要保证8字节对齐，否则会出现数据越界的问题;
- 发送和接收数据的 buffer 地址必须对齐为64字节;
- Channel 单次传输数据量不能超过4096字节；
- 支持 SPI 作为 Slave 功能;
- Mcu 侧 SPI 做 Slave 时，速率大于9M，只能采用 DMA 模式;
- 当 MCU 作为 SPI 从设备时，其通信时钟由主设备提供。因此，从设备必须对主设备的每一次数据传输请求做出即时响应。若采用中断处理模式，需确保 SPI 中断服务程序的执行时间足够短。若中断被阻塞过久，未能及时处理数据寄存器，将导致接收缓冲区溢出。为此，强烈推荐使用 DMA 传输模式，以硬件方式自动完成数据搬运，从而保障通信的实时性与可靠性。
- Mcu 侧 SPI 在8位模式下工作时，具有以下限制:
- 1个 SPI 并行收发最大速度: 50M;
- 2个 SPI 并行收发最大速度: 33.3M;
- 3个 SPI 并行收发最大速度: 25M;
- 4个 SPI 并行收发最大速度: 20M;
- 5个 SPI 并行收发最大速度: 15.6M;
- 6个 SPI 并行收发最大速度: 12.5M;
- SPI 外设只支持 MSB;
- SPI SpiCsPolarity 和 spitimeclk2c 都不支持配置，SpiCsPolarity 默认为低电平有效。
- SPI SpiCsToggleEnable 配置使能后，Spi 传输完一个 frame 后，会拉高 CS 引脚，仅支持 TRAILING 模式，LEADING 模式不支持。
- SPI DMA 模式相对于非 DMA 模式，消耗 CPU 负载更低。
- 当 SPI 采用非 DMA 方式发送数据时，若系统负载比较大，会因为 SPI 中断响应不及时导致 SPI FIFO 未能及时写入，从而导致 CS 引脚短暂拉高，此时推荐采用 DMA 模式。
- 如果使用场景是多个 Sequence 使用同一个 SPI IP 进行异步传输，且 Sequence 之间并没有传输完成先后顺序，则会存在 Sequence 传输排队的现象，此时需要在 SchM_Spi.c 文件中实现关中断临界区保护。

## 代码路径

- `McalCdd/Spi/inc/Spi.h` ：SPI 驱动程序的头文件
- `McalCdd/Spi/inc/Spi_Lld.h` ：SPI 底层驱动程序的头文件
- `McalCdd/Spi/src/Spi.c` ：SPI 驱动程序的源文件
- `McalCdd/Spi/src/Spi_Lld.c` ：SPI 底层驱动程序的源文件
- `McalCdd/Common/Register/inc/Spi_Register.h` ：SPI 寄存器定义文件
- `Platform/Schm/SchM_Spi.h` ：SPI 模块的调度管理头文件
- `Config/McalCdd/gen_xxx/Spi/inc/Spi_Board.h` ：SPI 板级配置头文件
- `Config/McalCdd/gen_xxx/Spi/inc/Spi_Cfg.h` ：SPI 配置头文件
- `Config/McalCdd/gen_xxx/Spi/inc/Spi_PBcfg.h` ：SPI PB 配置头文件
- `Config/McalCdd/gen_xxx/Spi/src/Spi_board.c` ：SPI 板级配置源文件
- `Config/McalCdd/gen_xxx/Spi/src/Spi_PBcfg.c` ：SPI PB 配置源文件
- `samples/Spi/SPI_sample/Spi_sample.c` ：SPI sample 代码
- `samples/Spi/SPI_sample/Spi_common.c` ：SPI sample 代码

## 应用 sample

### 软件操作流程

一般的软件操作流程如下:

1. 初始化

- 修改 `ChannelCfgArrayPtr` , `JobCfgArrayPtr` , `SeqCfgArrayPtr` , `HwCfgPtr` , `PhyCfgPtr` 等配置结构体，将 SPI 对应 instance 配置为自己需要的波特率和传输模式，可参考 SPI 配置说明 [Spi 配置说明](/rdk_s_doc/Advanced_development/mcu_development/mcu_spi#spi_config)
- 调用 `Spi_Init(&Spi_Config)` 或者 `Spi_Init(NULL)` ，当传入为 NULL 时，使用 `Spi_PBcfg.c` 中的默认配置
- 驱动程序遍历 ，根据配置信息初始化内部数据结构（如 `Spi_ChannelState` , `Spi_JobState` , `Spi_HwQueueArray` 等）和物理 SPI 硬件单元（根据 `Spi_PhyCfgType` 和 `Spi_IpCfg` 设置寄存器）
2. 修改 `ChannelCfgArrayPtr` , `JobCfgArrayPtr` , `SeqCfgArrayPtr` , `HwCfgPtr` , `PhyCfgPtr` 等配置结构体，将 SPI 对应 instance 配置为自己需要的波特率和传输模式，可参考 SPI 配置说明 [Spi 配置说明](/rdk_s_doc/Advanced_development/mcu_development/mcu_spi#spi_config)
3. 调用 `Spi_Init(&Spi_Config)` 或者 `Spi_Init(NULL)` ，当传入为 NULL 时，使用 `Spi_PBcfg.c` 中的默认配置
4. 驱动程序遍历 ，根据配置信息初始化内部数据结构（如 `Spi_ChannelState` , `Spi_JobState` , `Spi_HwQueueArray` 等）和物理 SPI 硬件单元（根据 `Spi_PhyCfgType` 和 `Spi_IpCfg` 设置寄存器）
5. 设置传输模式:

- 应用程序通过 `Spi_SetAsyncMode()` 选择使用中断模式还是轮询模式。
6. 应用程序通过 `Spi_SetAsyncMode()` 选择使用中断模式还是轮询模式。
7. 数据准备:

- 应用程序通过 `Spi_WriteIB()` 或 `Spi_SetupEB()` 函数将要发送的数据放入通道关联的缓冲区中。
8. 应用程序通过 `Spi_WriteIB()` 或 `Spi_SetupEB()` 函数将要发送的数据放入通道关联的缓冲区中。
9. 传输请求：

- 应用程序调用 `Spi_AsyncTransmit(sequence)` 或 `Spi_SyncTransmit(sequence)` 来启动一个序列的传输。
10. 应用程序调用 `Spi_AsyncTransmit(sequence)` 或 `Spi_SyncTransmit(sequence)` 来启动一个序列的传输。
11. 驱动处理:

- 驱动程序根据 `sequence ID` 找到对应的 `Spi_SeqCfg`
- 根据 `Spi_SeqCfg.JobIndexList` 获取作业列表。
- 对于序列中的每个作业：
- 根据 `Spi_JobCfg.HWUnit` 确定要使用的物理 SPI 硬件单元。
- 根据 `Spi_JobCfg.HwCfgPtr` 获取该作业对应的外部设备通信参数。
- 根据 `Spi_JobCfg.ChannelIndexList` 获取通道列表。
- 遍历通道列表，从 `Spi_ChannelCfg.BufferDescriptor` 指向的缓冲区中获取发送数据。
- 配置物理 SPI 硬件单元。
- 启动硬件传输。
12. 驱动程序根据 `sequence ID` 找到对应的 `Spi_SeqCfg`
13. 根据 `Spi_SeqCfg.JobIndexList` 获取作业列表。
14. 对于序列中的每个作业：
15. 根据 `Spi_JobCfg.HWUnit` 确定要使用的物理 SPI 硬件单元。
16. 根据 `Spi_JobCfg.HwCfgPtr` 获取该作业对应的外部设备通信参数。
17. 根据 `Spi_JobCfg.ChannelIndexList` 获取通道列表。
18. 遍历通道列表，从 `Spi_ChannelCfg.BufferDescriptor` 指向的缓冲区中获取发送数据。
19. 配置物理 SPI 硬件单元。
20. 启动硬件传输。
21. 传输完成:

- 对于异步传输，硬件完成传输后（通过中断或轮询检测），驱动程序会调用相应的通知函数
- 对于同步传输，函数会等待传输完成。
22. 对于异步传输，硬件完成传输后（通过中断或轮询检测），驱动程序会调用相应的通知函数
23. 对于同步传输，函数会等待传输完成。
24. 状态查询:

- 应用程序可以通过 `Spi_GetJobResult()` , `Spi_GetSequenceResult()` 等函数查询传输状态。
25. 应用程序可以通过 `Spi_GetJobResult()` , `Spi_GetSequenceResult()` 等函数查询传输状态。
提示

- SPI 只需要在 INIT 之后配置一次 `set_AsyncMode()` ，不需要反复调用，反复调用会导致传输异常。
- 当传输发生异常的时候，SPI 的状态机不会自动复位，需要手动调用 `Spi_Cancel()` 函数复位传输状态机。
- Sample 里用了 DMA，但没进行初始化，这是因为在 `Target/Target-hobot-lite-freertos-mcu1/target/HorizonTask.c` 文件中已经完成了初始化。

### 单片选使用示例

spi_test 命令用于测试 SPI（Serial Peripheral Interface，串行外设接口）功能。该命令支持初始化和参数设置、显示当前参数以及执行 SPI 数据传输测试。

**命令语法**

```bash
spi_test <operation> [bus_id] [sync_mode] [trans_mode]
```

**参数说明**

- operation: 指定要执行的操作。
- 0: 初始化和参数设置。
- 1: 显示当前设置的参数。
- 2: 执行 SPI 测试（异步或同步）。
- bus_id (仅当 operation 为 0 时需要): 指定要使用的 SPI 总线。
- 取值范围: 2 到 6，分别对应 SPI2 到 SPI6。
- sync_mode (仅当 operation 为 0 时需要): 指定 SPI 通信的同步模式。
- 0: 异步模式 (async)
- 1: 同步模式 (sync)
- trans_mode (仅当 operation 为 0 时需要): 指定 SPI 数据传输的底层机制。
- 0: 轮询模式 (polling)
- 1: 中断模式 (interrupt)
提示
应用层配置与底层配置应保持一致，否则会出现错误。

以 SPI3 为例，将 SPI3的 MISO 和 MOSI 短接，运行以下命令，设置传输参数

```shell
D-Robotics:/$ spi_test 0 3 0 0
[055.578172 0]Init&&Parameter setting
[055.578428 0]Show Spi parameter
[055.578792 0]spi_bus = 3
[055.579085 0]sync_mode = async
[055.579443 0]trans_mode = polling
```

运行以下命令，测试

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

### 双片选使用示例

SpiTest_Mul_cs 命令用于测试 SPI（Serial Peripheral Interface，串行外设接口）功能。

使用方式和参数解析如下：

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

- 参数解析：
- Case_num (argv[1]): 指定要执行的操作，支持5种模式，如使用中断异步传输， Case_num 设置为4
- Sequences (argv[2]): 指定使用哪路 spi， 如使用 spi4，Sequences 参数设置为4
- Cs (argv[3]): 表示使用哪路 cs， 如使用 cs0， Cs 参数设置为0
- DataWidth (argv[4]): 表示传输数据位宽， 如位宽为8bit，DataWidth 设置为8
- Datalen (argv[5]): 表示传输的数据量，如传输10组数据， Datalen 设置为10
- Loop_times (argv[6]): 表示测试几次， 如测试5次， Loop_times 设置为5
- 举例说明：
- spi4，async interrupt 传输，cs1，8bit 数据宽度， 10组数据， 测试1次： SpiTest_Mul_cs 4 4 1 8 10 1
将 SPI4的 MISO 和 MOSI 短接，运行以下命令

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

### 单片选使用示例

spi_test 命令用于测试 SPI（Serial Peripheral Interface，串行外设接口）功能。该命令支持初始化和参数设置、显示当前参数以及执行 SPI 数据传输测试。

**命令语法**

提示
应用层配置与底层配置应保持一致，否则会出现错误。

**操作0：配置组1的参数**

```bash
spi_test 0 <spi_bus> <sync_mode> <trans_mode> <ch_cfg> <cs_seq0> <cs_seq1> <cs_seq2> <cs_seq3>
```

- bus_id: SPI 总线 ID（可选，默认为4）
- sync_mode: 0=异步(async) 1=同步(sync)
- trans_mode：0=轮询(polling) 1=中断(interrupt)
- ch_cfg: SPI 通道配置
- cs_seq0：cs0 所用的 SPI 序列 id，255=无效
- cs_seq1：cs1 所用的 SPI 序列 id，255=无效
- cs_seq2：cs2 所用的 SPI 序列 id，255=无效
- cs_seq3：cs3 所用的 SPI 序列 id，255=无效
配置 spi 的基础参数配置，参数配置完成后，将参数保存在组1中。

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

**操作1：显示参数信息**

显示当前所有测试参数配置，其中第一组用于存储操作0的自定义配置

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

**操作2：执行 SPI 测试**

```shell
spi_test 2 [bus_id] [cs_id]
```

- bus_id: SPI 总线 ID（可选，默认为4），此处的 busid 必须存在于参数配置组中（即通过 spi_test 1命令显示的参数配置组），否则测试将失败
- cs_id: 芯片选择 ID，范围0 3（可选，默认为0，当前仅支持 cs0的测试，cs1 3需要修改代码后测试）

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

### 双片选使用示例(BMI088 测试)

S600 MCU 子板上搭载了 BMI088传感器，该传感器通过 SPI13总线与 MCU 通信，其中 cs0连接加速度计(acc)，cs1连接陀螺仪(gyr)。

使用方式和参数解析如下：

1. 初始化 BMI088传感器

```shell
D-Robotics:/$ Bmi088_ShellInit
[Bmi088_Init] ACC+GYR initialized.
```

1. BMI088传感器自测

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

1. 多次读取 acc 数据

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

1. 多次读取 gyr 数据

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

### 配置文件说明

配置文件 `Spi_PBcfg.c` 存放着 SPI 的驱动配置，其中 `Spi_ConfigType` 为顶层容器，它将所有配置信息（通道、作业、序列、硬件单元等）组织在一起，形成一个完整的、用于初始化 SPI 驱动程序的配置集。

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

**成员解释**

1. **SpiCoreUse** ：指定哪个 CPU 核心可以使用这个 SPI 配置，单核系统保持原状即可
2. **ChannelCfgArrayPtr** ：指向一个包含所有 Spi_ChannelCfg 配置的数组。这个数组定义了系统中所有可用的 SPI 通道（Channel）的属性，如缓冲区类型（IB/EB）、帧大小、默认值、缓冲区指针等
3. **JobCfgArrayPtr** ：指向一个包含所有 Spi_JobCfg 配置的数组。这个数组定义了系统中所有可用的 SPI 作业（Job）的属性，如包含的通道列表、通知函数、优先级、关联的物理单元（HWUnit）等
4. **SeqCfgArrayPtr** ：指向一个包含所有 Spi_SeqCfg 配置的数组。这个数组定义了系统中所有可用的 SPI 序列（Sequence）的属性，如包含的作业列表、通知函数、是否可中断等
5. **HwCfgPtr** ：指向一个包含所有 Spi_HwCfg 配置的数组。这个数组定义了系统中所有外部设备（External Device）的硬件属性，主要是与通信相关的参数（如波特率、时钟极性、片选等）
6. **PhyCfgPtr** ：指向一个包含所有 Spi_PhyCfgType 配置的数组。这个数组定义了系统中所有物理 SPI 硬件单元（Physical SPI Unit, PhyUnit）的基本工作模式和特性（如主/从模式、DMA 使用、传输模式等）。
7. **SpiMaxChannel** : 配置中定义的通道总数。用于驱动程序内部数组的大小分配和边界检查
8. **SpiMaxJob** ：配置中定义的作业总数。用于驱动程序内部数组的大小分配和边界检查
9. **SpiMaxSequence** ：配置中定义的序列总数。用于驱动程序内部数组的大小分配和边界检查
10. **SpiMaxHwNum** ：配置中涉及的物理 SPI 硬件单元（PhyUnit）的数量。用于驱动程序内部数组的大小分配和边界检查
11. **SpiErrorHwCfg** ：用于配置 SPI 硬件错误的报告参数
**成员之间的关联关系**

应用程序通常通过调用 `Spi_AsyncTransmit()` 或 `Spi_SyncTransmit()` 并传入一个序列 ID 来启动传输，因此序列是用户直接交互的入口点，它与通道、作业、硬件配置和物理单元配置的简略实体关系如下：

`SPI_HWUNIT` 和 `SPI_EXTERNAL_DEVICE` 都需要关联一个硬件实例（Instance），该实例决定了使用哪一个 SPI 接口进行通信。由于 RDKS100平台共提供8个 SPI 控制器，其中 MAIN 域包含2个（SPI0、SPI1），MCU 域包含6个（SPI2 至 SPI7），因此 MCU 域中的 SPI 实际从 SPI2 开始编号。下表 **绿色** 字体部分展示了 SPI 序列配置（Spi SeqCfg）与对应硬件资源（Spi BusId、HWUnit、Instance）之间的映射关系。

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

提示
MCU1 的 SPI 出厂默认参数基于 Spi_PBcfg.c 配置文件，具有一定的时效性，但通常不会发生变更。

### 应用程序接口

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
