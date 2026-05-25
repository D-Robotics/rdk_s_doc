---
sidebar_position: 7
---

# 7.5.8 ADC User Guide

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## Hardware Support

| Feature | S100 ADC | S600 ADC |
|------------------------|-----------------------------------------------|-----------------------------------------------|
| **Number of ADC hardware units** | 1 | 2 (independent ADC modules) |
| **Channel configuration** | Channel 0~13 + Channel 15 (15 channels in total; **no Channel 14**) | Per ADC: Channel 0~7; **2 × 8 = 16 channels** in total |
| **Voltage measurement range** | 100 mV – 1700 mV | 100 mV – 1700 mV |
| **Trigger/Inject mode limitation** | In hardware trigger or Inject mode, **only 1 group can be configured** (globally) | Same as left (**group limit shared across ADCs**, still only 1 group) |
| **Temperature calibration condition** | Calibration is required when ambient temperature changes by **> ±20°C** | Same as left |
| **Interface usage prerequisite** | Must be called **after power-on self-test (POST) completes** | Same as left |
| **Software design note** | Designed for basic scenarios; **extensible but does not cover all product requirements** | Same as left |

## Software Driver

The codebase actually contains two ADC drivers, with the following differences:

- Standard ADC Driver (Main ADC Driver)
    - Located under the `McalCdd/Adc` directory, containing the complete ADC module implementation, including files such as `Adc.h`, `Adc.c`, `Adc_Lld.h`, and `Adc_Lld.c`
    - Provides full ADC functionality

- Private ADC Driver (Private ADC Driver)
    - Located under the `McalCdd/Adc` directory, containing `Adc_Private.h` and `Adc_Private.c`
    - Provides simplified interfaces for internal use

### Usage Flow

- General usage flow of the standard ADC driver:
    ```c
    // 1. Initialize the ADC module
    Adc_Init(&Adc_Config);
    // 2. Set up the result buffer
    Adc_SetupResultBuffer(AdcGroup_0, dataBuffer);
    // 3. Start conversion
    Adc_StartGroupConversion(AdcGroup_0);
    // 4. Read results
    Adc_ReadGroup(AdcGroup_0, dataBuffer);
    // 5. Stop conversion
    Adc_StopGroupConversion(AdcGroup_0);
    // 6. Deinitialize
    Adc_DeInit();
    ```

- Private ADC driver usage flow:
    ```c
    // 1. Initialize ADC hardware
    Adc_Private_Init(0);
    // 2. Read a specific channel result
    Adc_Private_ReadChannelResult(0, channel, &result);
    // 3. Deinitialize
    Adc_Private_DeInit(0);
    ```

### Key Differences

| Feature | Standard ADC Driver | Private ADC Driver |
|--------------|----------------------------------------|-------------------------------------|
| Complexity | Complete ADC driver implementation with rich functionality | Simplified interface with limited functionality |
| Configuration method | Uses complete configuration structures (including `Adc_GroupsCfg`) | Directly operates hardware registers |
| API richness | Provides complete ADC functional APIs | Provides only basic initialization and read functions |
| Interrupt support | Complete interrupt and callback mechanism | Does not use interrupts |
| Conversion mode | Single conversion and multiple conversions | Single conversion only |
| Trigger mode | Hardware trigger and software trigger | Software trigger only |
| Threshold check | Software threshold check and hardware threshold check | Threshold check not supported |
| Inject conversion support | Supports inject conversion and normal conversion | Normal conversion only |
| Error handling | Complete error detection and reporting mechanism | Simple error handling |



## Code Paths

| **File Path** | **Description** |
|-----------------------------------------------|--------------------------------------------------------------------------|
| `McalCdd/Adc/inc/Adc.h` | Public API interface for upper-layer calls. |
| `McalCdd/Adc/inc/Adc_Lld.h` | Declares low-level hardware operation functions. |
| `McalCdd/Adc/inc/Adc_Private.h` | Defines private structures, macros, and function declarations. |
| `McalCdd/Adc/src/Adc.c` | Implements public APIs and calls low-level functions. |
| `McalCdd/Adc/src/Adc_Lld.c` | Implements low-level hardware operations and directly configures registers. |
| `McalCdd/Adc/src/Adc_Private.c` | Implements private functions to assist internal driver logic. |
| `McalCdd/Common/Register/inc/Adc_Register.h` | Defines ADC peripheral register addresses and bit fields. |
| `Platform/Schm/SchM_Adc.h` | Manages ADC access permissions and resource protection (such as interrupt safety). |
| `Config/McalCdd/gen_xxxx/Adc/inc/Adc_PBcfg.h` | Defines board-level peripheral configuration parameters (such as channels and sampling rate). |
| `Config/McalCdd/gen_xxxx/Adc/inc/Adc_Cfg.h` | Provides general configuration macros or default configuration parameters (such as maximum channel count and interrupt priority). |
| `Config/McalCdd/gen_xxx/Adc/src/Adc_PBcfg.c` | Implements board-level configuration data (such as channel mapping and hardware parameters). |
| `samples/Adc/xxx/src/Adc_Cmd.c` | Sample code for ADC software-triggered single sampling via `Adc_Private`; can be used directly in simple scenarios. |
| `samples/Adc/S100/src/Adc_SoftTrigerContinuous.c` | S100-specific sample code for ADC software-triggered continuous sampling via standard functions; suitable for complex scenarios. |
| `samples/Adc/S600/src/Adc_Test.c` | S600-specific sample code implemented with standard ADC functions; suitable for complex scenarios; continuous sampling can be enabled by modifying `Adc_PBcfg.h`. |

## Application Sample



<DocScope products="RDK S100">

### ADC Software-Triggered Single Conversion Application

The `AdcTest` application performs ADC single-sampling tests on the device. Implemented via `Adc_Private`, it can read ADC values from a specific channel or multiple channels and display the results in both raw values and millivolt (mV) format.


#### Usage Example


- Syntax

```bash
AdcTest [ADC channel]
```

ADC channel (optional): The specific ADC channel to read. If not provided, the command reads multiple channels.

- Example

Read the ADC value of channel 1:
```bash
D-Robotics:/$ Adc_Test 1
[052.860562 0]--------------Adc_PrivateApiTest start-----------!
[052.876472 0]AdcCurrentValue [1]: 2404 -> 1056 mv
[052.869226 0]--------------Adc_PrivateApiTest end!-----------
```


Read ADC values of all channels:

```bash
D-Robotics:/$ Adc_Test
[038.836359 0]--------------Adc_PrivateApiTest start-----------!
[038.852268 0]AdcCurrentValue [0]: 1117 -> 490 mv
[038.852648 0]BoradIdMsb code: 6!
[038.853028 0]
[038.853212 0]AdcCurrentValue [1]: 2393 -> 1051 mv
[038.854451 0]BoradIdLsb code: 10!
[038.854842 0]
[038.855026 0]AdcCurrentValue [2]: 1754 -> 770 mv
[038.856320 0]DDR TYPE code: 8!
[038.856634 0]
[038.856819 0]AdcCurrentValue [3]: 1725 -> 758 mv
[038.858210 0]
[038.858306 0]AdcCurrentValue [4]: 630 -> 276 mv
[038.858760 0]
[038.858945 0]AdcCurrentValue [5]: 2515 -> 1105 mv
[038.860273 0]
[038.860391 0]AdcCurrentValue [6]: 2492 -> 1095 mv
[038.860925 0]
[038.861109 0]AdcCurrentValue [7]: 2156 -> 947 mv
[038.862341 0]
[038.862525 0]AdcCurrentValue [8]: 2163 -> 950 mv
[038.863067 0]
[038.863252 0]AdcCurrentValue [9]: 2161 -> 949 mv
[038.864483 0]
[038.864667 0]AdcCurrentValue [10]: 2169 -> 953 mv
[038.865220 0]
[038.866262 0]AdcCurrentValue [11]: 2223 -> 977 mv
[038.866665 0]
[038.866850 0]AdcCurrentValue [12]: 1837 -> 807 mv
[038.868234 0]
[038.868331 0]AdcCurrentValue [13]: 2101 -> 923 mv
[038.868825 0]
[038.868999 0]PASS.
[038.869226 0]--------------Adc_PrivateApiTest end!-----------

```

</DocScope>
<DocScope products="RDK S600">

### ADC Private API Test

The private API is a oneshot API used to test the ADC driver.

#### Usage Example


- Syntax

```bash
Adc_Test [instance] [ch_num]
```

**instance:** ADC instance number (required)
**ch_num:** ADC channel number (required)


- Example

```bash
# Test channel 0
D-Robotics:/$ Adc_Test 0 0
Adc[0] channel[0] adcvalue:1117 voltage:490mv

# Test channel 1
D-Robotics:/$ Adc_Test 0 1
Adc[0] channel[1] adcvalue:2393 voltage:1051mv

# Test channel 2
D-Robotics:/$ Adc_Test 0 2
Adc[0] channel[2] adcvalue:1500 voltage:659mv
```


</DocScope>

### ADC Software-Triggered Continuous Conversion Application

The ADC software-triggered continuous sampling application is implemented based on the standard ADC driver. It automatically repeats conversions and starts the next conversion immediately after one completes, without additional triggers. It is suitable for scenarios that require continuous signal monitoring, but power consumption is relatively higher due to continuous operation.


#### Key Configuration
```c
// McalCdd/gen_xxxx/Adc/src/Adc_PBcfg.c
static const Adc_GroupCfg Adc_GroupsCfg[] =
{
    /**< @brief Group0 -- Logical Unit Id 0 -- Hardware Unit ADC0 */
    {
        /**< @brief Index of group */
        0U, /* GroupId */
        /**< @brief ADC Logical Unit Id that the group belongs to */
        (uint8)0, /* UnitId */
        /**< @brief Access mode */
        ADC_ACCESS_MODE_SINGLE, /* AccessMode */
        /**< @brief Conversion mode */
        ADC_CONV_MODE_CONTINUOUS, /* Mode */  // Use continuous conversion mode
        /**< @brief Conversion type */
        ADC_NORMAL_CONV, /* Type */ // Normal conversion or inject conversion can be selected
#if (ADC_PRIORITY_IMPLEMENTATION != ADC_PRIORITY_NONE)
        /**< @brief Priority configured */
        (Adc_GroupPriorityType)ADC_GROUP_PRIORITY(0), /* Priority */
#endif /* ADC_PRIORITY_IMPLEMENTATION != ADC_PRIORITY_NONE */
        /**< @brief Trigger source configured */
        ADC_TRIGG_SRC_SW, /* TriggerSource */  // Software trigger
#if (STD_ON == ADC_HW_TRIGGER_API)
        /**< @brief Hardware trigger source for the group */
        0U, /* HwTriggerSource */
#endif /* (STD_ON == ADC_HW_TRIGGER_API) */
#if (STD_ON == ADC_GRP_NOTIF_CAPABILITY)
        /**< @brief Notification function */
        Adc_TestNormal_Notification_0, /* Notification */ // Notification function to notify upper-layer applications that conversion is complete
#endif /* (STD_ON == ADC_GRP_NOTIF_CAPABILITY) */
    ............
        /**< @brief Enables or Disables the ADC and DMA interrupts */
        (uint8)(STD_ON), /* AdcWithoutInterrupt */  // STD_ON: non-interrupt mode; STD_OFF: interrupt mode; S100 uses non-interrupt mode by default
#if (ADC_ENABLE_LIMIT_CHECK == STD_ON)
        /**< @brief Enables or disables the usage of limit checking for an ADC group. */
        (boolean)FALSE, /* AdcGroupLimitcheck */
#endif /* (STD_ON == ADC_ENABLE_LIMIT_CHECK) */
        { { 0x3FFFU } }, /* AssignedChannelMask */
#if (ADC_SET_ADC_CONV_TIME_ONCE == STD_OFF)
        &AdcLldGroupConfig_0 /* AdcLldGroupConfigPtr */
#endif /* (ADC_SET_ADC_CONV_TIME_ONCE == STD_OFF) */
    }
};
```

#### Usage Example

- Syntax

```
Adc_TestNormal [Action]
```

:::tip
Make sure the `AdcWithoutInterrupt` field in `Adc_GroupsCfg` is configured as `STD_ON`. The example below uses S600.
:::

Step 1: Start ADC continuous acquisition
```
D-Robotics:/$ Adc_TestNormal start
[053.313330 0]Adc test running...
```

Step 2: Read acquisition results
```
D-Robotics:/$ Adc_TestNormal read
[058.068598 0]##############################
[058.069085 0]ADC0 channel: 0, sample: 2466 -> 1083 mv
[058.069692 0]ADC0 channel: 1, sample: 595 -> 261 mv
[058.070278 0]ADC0 channel: 2, sample: 585 -> 257 mv
[058.070864 0]ADC0 channel: 3, sample: 120 -> 52 mv
[058.071439 0]ADC0 channel: 4, sample: 574 -> 252 mv
[058.072025 0]ADC0 channel: 5, sample: 591 -> 259 mv
[058.072630 0]ADC0 channel: 6, sample: 596 -> 261 mv
[058.073216 0]ADC0 channel: 7, sample: 671 -> 294 mv
[058.073802 0]ADC1 channel: 0, sample: 1997 -> 877 mv
[058.074398 0]ADC1 channel: 1, sample: 1955 -> 859 mv
[058.074997 0]ADC1 channel: 2, sample: 112 -> 49 mv
[058.075572 0]ADC1 channel: 3, sample: 214 -> 94 mv
[058.076147 0]ADC1 channel: 4, sample: 384 -> 168 mv
[058.076739 0]ADC1 channel: 5, sample: 504 -> 221 mv
[058.077325 0]ADC1 channel: 6, sample: 612 -> 269 mv
[058.077923 0]ADC1 channel: 7, sample: 695 -> 305 mv
[058.078509 0]==============================

```

Step 3: Stop ADC continuous acquisition
```
D-Robotics:/$ Adc_TestNormal stop
[096.167557 0]Adc test exit.
```


### Application Programming Interface

#### void Adc_Init(const Adc_ConfigType* ConfigPtr)

```shell
Description：Initializes the ADC hardware units and driver.

Sync/Async：Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```



#### Std_ReturnType Adc_SetupResultBuffer(Adc_GroupType Group, const Adc_ValueGroupType* DataBufferPtr)

```shell
Description：Initializes the group specific ADC result buffer pointer as configured
             to point to the pDataBufferPtr address which is passed as parameter.

Sync/Async：Synchronous
Parameters(in)
    Group: Numeric ID of requested ADC channel group.
    DataBufferPtr: pointer to result data buffer.
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: result buffer pointer initialized correctly
    E_NOT_OK: operation failed or development error occurred
```

#### void Adc_DeInit(void)

```shell
Description：Returns all ADC HW Units to a state comparable to their power on reset state.

Sync/Async：Synchronous
Parameters(in)
    ConfigPtr: Pointer to configuration set in Variant PB
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Adc_StartGroupConversion(Adc_GroupType Group)

```shell
Description：Starts the conversion of all channels of the requested ADC Channel group.

Sync/Async：Synchronous
Parameters(in)
    Group: Numeric ID of requested ADC Channel group.
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### Std_ReturnType Adc_ReadGroup(Adc_GroupType Group, Adc_ValueGroupType* DataBufferPt)

```shell
Description：Reads the group conversion result of the last completed conversion round of the requested group
             and stores the channel values starting at the DataBufferPtr address.
             The group channel values are stored in ascending channel number order
             (in contrast to the storage layout of the result buffer if streaming access is configured).

Sync/Async：Synchronous
Parameters(in)
    Group: Numeric ID of requested ADC Channel group.
Parameters(inout)
    None
Parameters(out)
    DataBufferPtr: ADC results of all channels of the selected group are stored in the data buffer
                   addressed with the pointer.
Return value：Std_ReturnType
    E_OK: Aresults are available and written to the data buffer
    E_NOT_OK: no results are available or development error occurred
```

#### void Adc_EnableHardwareTrigger(Adc_GroupType Group)

```shell
Description：Enables the hardware trigger for the requested ADC Channel group.

Sync/Async：Asynchronous
Parameters(in)
    Group: Numeric ID of requested ADC Channel group.
Parameters(inout)
    None
Parameters(out)
    DataBufferPtr: ADC results of all channels of the selected group are stored
                   in the data buffer addressed with the pointer.
Return value：None
```

#### void Adc_DisableHardwareTrigger(Adc_GroupType Group)

```shell
Description：Disables the hardware trigger for the requested ADC Channel group.

Sync/Async：Asynchronous
Parameters(in)
    Group: Numeric ID of requested ADC Channel group.
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Adc_EnableGroupNotification(Adc_GroupType Group)

```shell
Description：Enables the notification mechanism for the requested ADC Channel group.

Sync/Async：Asynchronous
Parameters(in)
    Group: Numeric ID of requested ADC Channel group.
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Adc_DisableGroupNotification(Adc_GroupType Group)

```shell
Description：Disables the notification mechanism for the requested ADC Channel group.

Sync/Async：Asynchronous
Parameters(in)
    Group: Numeric ID of requested ADC Channel group.
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### Adc_StatusType Adc_GetGroupStatus(Adc_GroupType Group)

```shell
Description：Returns the conversion status of the requested ADC Channel group.

Sync/Async：Asynchronous
Parameters(in)
    Group: Numeric ID of requested ADC Channel group.
Parameters(inout)
    None
Parameters(out)
    None
Return value：Adc_StatusType
	Conversion status for the requested group.
```

#### Adc_StreamNumSampleType Adc_GetStreamLastPointer(Adc_GroupType Group, Adc_ValueGroupType** PtrToSamplePtr)

```shell
Description：Returns the number of valid samples per channel, stored in the result buffer.
             Reads a pointer, pointing to a position in the group result buffer.
             With the pointer position, the results of all group channels of the last
             completed conversion round can be accessed.
             With the pointer and the return value, all valid group conversion results can
             be accessed.

Sync/Async：Synchronous
Parameters(in)
    Group: Numeric ID of requested ADC Channel group.
Parameters(inout)
    None
Parameters(out)
    PtrToSamplePtr: Pointer to result buffer pointer.
Return value：Adc_StreamNum SampleType
	Number of valid samples per channel.
```

#### void Adc_GetVersionInfo(Std_VersionInfoType* versioninfo)

```shell
Description：Returns the version information of this module.

Sync/Async：Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    versioninfo: Pointer to where to store the version information of this module.
Return value：None

```

#### Std_ReturnType Adc_SetPowerState(Adc_PowerStateRequestResultType* Result)

```shell
Description：This API configures the Adc module so that it enters the already prepared
             power state, chosen between a predefined set of configured ones.

Sync/Async：Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    Result: If the API returns E_OK:
        ADC_SERVICE_ACCEPTED: Power state change executed.
    If the API returns E_NOT_OK:
        ADC_NOT_INIT: ADC Module not initialized.
        ADC_SEQUENCE_ERROR: wrong API call sequence.
        ADC_HW_FAILURE: the HW module has a failure which prevents it to enter the required power state.
Return value：Std_ReturnType
    E_OK: Power Mode changed
    E_NOT_OK: request rejected
```

#### Std_ReturnType Adc_GetCurrentPowerState(Adc_PowerStateType* CurrentPowerState, Adc_PowerStateRequestResultType* Result)

```shell
Description：This API returns the current power state of the ADC HW unit.


Sync/Async：Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    CurrentPowerState: The current power mode of the ADC HW Unit is returned in this parameter
    Result: If the API returns E_OK: ADC_SERVICE_ACCEPTED: Current power mode was returned
            If the API returns E_NOT_OK: ADC_NOT_INIT: ADC Module not initialized.
Return value：Std_ReturnType
    E_OK: Mode could be read
    E_NOT_OK: request rejected
```

#### Std_ReturnType Adc_GetTargetPowerState(Adc_PowerStateType* TargetPowerState, Adc_PowerStateRequestResultType* Result)

```shell
Description：This API returns the Target power state of the ADC HW unit.


Sync/Async：Synchronous
Parameters(in)
    None
Parameters(inout)
    None
Parameters(out)
    CurrentPowerState: The current power mode of the ADC HW Unit is returned in this parameter
    Result: If the API returns E_OK: ADC_SERVICE_ACCEPTED: Current power mode was returned
            If the API returns E_NOT_OK: ADC_NOT_INIT: ADC Module not initialized.
Return value：Std_ReturnType
    E_OK: Mode could be read
    E_NOT_OK: request rejected
```

#### Std_ReturnType Adc_PreparePowerState(Adc_PowerStateType PowerState, Adc_PowerStateRequestResultType* Result)

```shell
Description：This API returns the Target power state of the ADC HW unit.

Sync/Async：Synchronous
Parameters(in)
    PowerState: The target power state intended to be attained
Parameters(inout)
    None
Parameters(out)
    Result:
    If the API returns E_OK:
        ADC_SERVICE_ACCEPTED: ADC Module power state preparation was started.
    If the API returns E_NOT_OK:
        ADC_NOT_INIT: ADC Module not initialized.
        ADC_SEQUENCE_ERROR: wrong API call sequence (Current Power State = Target Power State).
        ADC_POWER_STATE_NOT_SUPP: ADC Module does not support the requested power state.
        ADC_TRANS_NOT_POSSIBLE: ADC Module cannot transition directly from the current power
                                state to the requested power state or the HW peripheral is still busy.
Return value：Std_ReturnType
    E_OK: Mode could be read
    E_NOT_OK: request rejected
```

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

#### void Adc_EnableWdgNotification(Adc_ChannelType ChannelId)

```shell
Description：Enable notification of a channel that has watchdog functionality
             configured at initialization

Parameters(in)
    Adc_ChannelType: Symbolic name of channel
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Adc_DisableWdgNotification(Adc_ChannelType ChannelId)

```shell
Description：Disable notification of a channel that has watchdog functionality
             configured at initialization

Parameters(in)
    Adc_ChannelType: Symbolic name of channel
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```


</TabItem>
<TabItem value="S600" label="S600">

#### void Adc_EnableWdgNotification(Adc_ChannelType ChannelId, uint8 Instance)

```shell
Description：Enable notification of a channel that has watchdog functionality configured at initialization

Parameters(in)
    ChannelId: The channel ID of ADC
    Instance: Index of ADC
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### void Adc_DisableWdgNotification(Adc_ChannelType ChannelId, uint8 Instance)

```shell
Description：Disable notification of a channel that has watchdog functionality configured at initialization

Parameters(in)
    ChannelId: The channel ID of ADC
    Instance: Index of ADC
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```
</TabItem>
</Tabs>
