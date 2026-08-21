---
sidebar_position: 18
---

# 7.5.19 LIN使用指南

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

S100 MCU芯片共有3路LIN（LIN0~LIN2），其中 **LIN1** 已通过板载接口引出供用户开发学习使用，配置为 **Master 节点**。

| **配置项**         | **LIN1** |
|--------------------|----------|
| 节点类型           | Master |
| 波特率             | 9600 bps |
| 停止位             | 1 位 |
| 自动波特率         | 关闭 |
| 唤醒检测           | 关闭 |
| Break 域长度       | 13 bit |
| 响应超时           | 14 bit time |
| 头部超时           | 44 bit time |

## 硬件支持

- MCU最大可用LIN数量: 3个（LIN0~LIN2）
- 板载引出LIN: 1个（LIN1）
- 支持LIN协议版本: 1.3、2.0、2.1、2.2
- 支持Master/Slave节点模式
- 数据缓冲: 单个8字节缓冲或FIFO模式
- 支持16个标识符（Identifier Filters）
- 支持经典校验（Classic Checksum）和增强校验（Enhanced Checksum）
- 波特率: 最高20 Kbit/s（LIN协议标准），支持分数波特率生成器
- 功耗模式: 初始化（Initialization）、正常（Normal）、睡眠（Sleep）
- 超时管理: Header超时、Response超时、Frame超时
- 高级错误检测: 支持多种LIN错误检测
- 唤醒支持: Dominant bit检测唤醒
- 中断支持: 可屏蔽中断
- 外部收发器: 需要外部LIN收发器芯片连接到LIN总线

</TabItem>
<TabItem value="S600" label="S600">

S600 MCU芯片共有8路LIN（LIN0~LIN7），其中 **LIN2 和 LIN3** 已通过板载接口引出供用户开发学习使用，均配置为 **Master 节点**。

| **配置项**         | **LIN2** | **LIN3** |
|--------------------|----------|----------|
| 节点类型           | Master | Master |
| 波特率             | 9600 bps | 9600 bps |
| 停止位             | 1 位 | 1 位 |
| 自动波特率         | 关闭 | 关闭 |
| 唤醒检测           | 关闭 | 关闭 |
| Break 域长度       | 13 bit | 13 bit |
| 响应超时           | 14 bit time | 14 bit time |
| 头部超时           | 44 bit time | 44 bit time |

## 硬件支持

- MCU最大可用LIN数量: 8个（LIN0~LIN7）
- 板载引出LIN: 2个（LIN2、LIN3）
- 支持LIN协议版本: 1.3、2.0、2.1、2.2
- 支持Master/Slave节点模式
- 数据缓冲: 单个8字节缓冲或FIFO模式
- 支持16个标识符（Identifier Filters）
- 支持经典校验（Classic Checksum）和增强校验（Enhanced Checksum）
- 波特率: 最高20 Kbit/s（LIN协议标准），支持分数波特率生成器
- 功耗模式: 初始化（Initialization）、正常（Normal）、睡眠（Sleep）
- 超时管理: Header超时、Response超时、Frame超时
- 高级错误检测: 支持多种LIN错误检测
- 唤醒支持: Dominant bit检测唤醒
- 中断支持: 可屏蔽中断
- 外部收发器: 需要外部LIN收发器芯片连接到LIN总线

</TabItem>
</Tabs>


## 软件架构

- LIN APP: Lin的应用层代码。
- LIN Interface: Lin的接口层代码，提供标准化的LIN操作接口。
- LIN LLD: Lin的底层驱动代码，直接操作LINFLEXD寄存器，实现帧收发、中断处理等核心功能。
- LIN PBcfg: Lin的PB配置文件，用于外设的配置参数。
- Hardware: LINFLEXD硬件。



## 代码路径

- `McalCdd/Common/Register/inc/Lin_Register.h`：寄存器相关内容
- `McalCdd/Lin/src/Lin.c`：API层代码
- `McalCdd/Lin/src/Lin_Lld.c`：LLD层代码
- `McalCdd/Lin/src/Linflexd_Lin_Ip.c`：IP层代码
- `McalCdd/Lin/src/Lin_Irq.c`：中断处理代码
- `McalCdd/Lin/src/LinIf.c`：LIN Interface回调桩
- `McalCdd/Lin/inc/Lin.h`：对外公共API头文件
- `McalCdd/Lin/inc/Lin_GeneralTypes.h`：标准类型定义
- `McalCdd/Lin/inc/Lin_Types.h`：配置结构类型
- `McalCdd/Lin/inc/Lin_Lld.h`：底层驱动接口声明
- `McalCdd/Lin/inc/Linflexd_Lin_Ip.h`：LINFLEXD IP层接口
- `McalCdd/Lin/inc/Lin_Irq.h`：中断处理声明
- `Config/McalCdd/gen_xxx/Lin/src/Lin_PBcfg.c`：PostBuild配置文件

## 应用sample

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

### 使用示例

S100 开发板将 LIN1 引出供用户开发学习使用，引脚位于 `Main Board` 板上的 `MCU Port Expansion Header(J22)`：

| 信号 | 引脚 |
|------|------|
| LIN1_TX | J22 PIN13 |
| LIN1_RX | J22 PIN15 |

![image-rdk_100_mainboard](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mainboard_interface.png)

- 语法格式
    - `case`: 测试用例ID（必需）
    - `channel`: LIN通道编号（0=LIN1）
    - `Pid`: 帧ID（0-0x3F）
    - `ChecksumType`: 校验类型（0=ENHANCED, 1=CLASSIC）
    - `ResponseType`: 响应类型（0=TX, 1=RX）
    - `DataLen`: 数据长度（1-8）
    - `loop_times`: 循环次数
```
qa_LinTest <case> <channel> <Pid> <ChecksumType> <ResponseType> <DataLen> <loop_times>
```



- `qa_LinTest 1` 打印驱动版本信息

```shell
D-Robotics:/$ qa_LinTest 1
[qa_get_Lin_status 92] [INFO]: Lin status: LIN_CH_SLEEP
[qa_LinTest 275] [INFO]: ####################### test_case_num: 1 #######################
vendorID: 0xC4
moduleID: 0x52
sw_major_version: 1
sw_minor_version: 0
sw_patch_version: 0
[qa_LinTest 290] [INFO]: Test case pass.
[qa_LinTest 295] [INFO]: #####################################################################
```

- `qa_LinTest 2 0 16 0 0 8 1` LIN1发送数据

```shell
D-Robotics:/$ qa_LinTest 2 0 16 0 0 8 1
[qa_get_Lin_status 94] [INFO]: Lin status: LIN_CH_SLEEP
[qa_LinTest 263] [INFO]: ####################### test_case_num: 2 #######################
############################# Loop Times: 1 #############################
[qa_Lin_Transfer_Test 193] [INFO]: Transfer success.
[qa_get_Lin_status 67] [INFO]: Lin status: LIN_TX_OK
[qa_LinTest 278] [INFO]: Test case pass.
[qa_LinTest 283] [INFO]: #####################################################################
```

</TabItem>
<TabItem value="S600" label="S600">

### 使用示例

S600开发板将LIN2和LIN3引出供用户开发学习使用，引脚位于 `Main Board` 板上的连接器 `J18`：

| 信号 | 引脚 |
|------|------|
| LIN2_TX | J18 PIN2 |
| LIN2_RX | J18 PIN3 |
| LIN3_TX | J18 PIN4 |
| LIN3_RX | J18 PIN5 |

![image-rdk_600_mainboard](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_v0p1_mainboard_interface.png)

- 语法格式
    - `case`: 测试用例ID（必需）
    - `channel`: LIN通道编号（0=LIN2, 1=LIN3）
    - `Pid`: 帧ID（0-0x3F）
    - `ChecksumType`: 校验类型（0=ENHANCED, 1=CLASSIC）
    - `ResponseType`: 响应类型（0=TX, 1=RX）
    - `DataLen`: 数据长度（1-8）
    - `loop_times`: 循环次数
```
qa_LinTest <case> <channel> <Pid> <ChecksumType> <ResponseType> <DataLen> <loop_times>
```



- `qa_LinTest 1` 打印驱动版本信息

```shell
D-Robotics:/$ qa_LinTest 1
[qa_get_Lin_status 92] [INFO]: Lin status: LIN_CH_SLEEP
[qa_LinTest 275] [INFO]: ####################### test_case_num: 1 #######################
vendorID: 0xC4
moduleID: 0x52
sw_major_version: 1
sw_minor_version: 0
sw_patch_version: 0
[qa_LinTest 290] [INFO]: Test case pass.
[qa_LinTest 295] [INFO]: #####################################################################
```

- `qa_LinTest 2 0 16 0 0 8 1` LIN2发送数据

```shell
D-Robotics:/$ qa_LinTest 2 0 16 0 0 8 1
[qa_get_Lin_status 94] [INFO]: Lin status: LIN_CH_SLEEP
[qa_LinTest 263] [INFO]: ####################### test_case_num: 2 #######################
############################# Loop Times: 1 #############################
[qa_Lin_Transfer_Test 193] [INFO]: Transfer success.
[qa_get_Lin_status 67] [INFO]: Lin status: LIN_TX_OK
[qa_LinTest 278] [INFO]: Test case pass.
[qa_LinTest 283] [INFO]: #####################################################################
```

</TabItem>
</Tabs>


## 应用程序接口

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


