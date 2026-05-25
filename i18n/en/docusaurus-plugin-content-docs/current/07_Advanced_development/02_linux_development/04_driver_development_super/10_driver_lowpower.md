---
sidebar_position: 10
---

# Low Power Mode Debugging Guide

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## Chip Power Domains
There are three internal power domains: AON, MCU, and Main. The AON is a power domain that must remain powered at all times as it cannot be powered off. The MCU power domain supplies power to the Hsm, MCU, and their internal IPs. The Main domain supplies power to the other parts.

## Power State List
Five power states are currently implemented: Off, MCU only, Working, Deep sleep, and Light sleep. Detailed descriptions are as follows:

| Power State  |       Description                             |  AON  |  MCU  |  Main  |  DDR颗粒  |
| --------     | ---------------------------------------| ----  | ----- | -----  | ---------- |
| Off          | Chip completely powered off               | Off   |   Off |   Off  |   Off      |
| MCU only     | MCU Rcore working normally                | On    |   On  |   Off  |   Off      |
| Deep sleep   | Only AON working, wakeable                | On    |   Off |   Off  |   Self-refresh |
| Working      | Normal working mode                       | On    |   On  |   On   |   On       |
| Light sleep  | MCU working normally, Main only supplies DDR self-refresh | On   |   On   |   Off  |   Self-refresh |

## Sleep and Wakeup

:::warning
**Note: The wakeup source APIs and commands described below, as well as the wakeup APIs and commands for Light sleep mode, can only be called within MCU0.**
:::

### Setting Sleep Mode
The default sleep mode is Deep sleep mode.

#### Display Currently Supported Sleep Modes
```Shell
root@ubuntu:~# cat /sys/devices/platform/suspend-mode/suspend_mode/suspend_mode
light deep
```

Currently supported sleep modes are deep and light, with deep being the default.

#### Display Current Sleep Mode
```Shell
root@ubuntu:~# cat /sys/devices/platform/suspend-mode/suspend_mode/current_suspend_mode
deep
```

#### Switch Sleep Mode
```Shell
root@ubuntu:~# cat /sys/devices/platform/suspend-mode/suspend_mode/current_suspend_mode
deep
root@ubuntu:~# echo light > /sys/devices/platform/suspend-mode/suspend_mode/suspend_mode
root@ubuntu:~# cat /sys/devices/platform/suspend-mode/suspend_mode/current_suspend_mode
light
```

### Setting Wakeup Source

<DocScope products="RDK S100">
The default wakeup source is RTC, with a time of 15 seconds.
</DocScope>
<DocScope products="RDK S600">
The default wakeup source is RTC, with a time of 10 seconds.
</DocScope>

#### Setting Wakeup Source via MCU Command

```Shell
D-Robotics:/$ wakeupsource
[01504.149120 0]WakeupSource Usage:
[01504.149349 0]    WakeupSource rtc <time(seconds)>
[01504.149935 0]    WakeupSource can
[01504.150347 0]    WakeupSource gpio <gpio_index> <type> <level>
[01504.151093 0]        type:  0:level other:edge
[01504.151628 0]        level: 0:low   other:high
```
Currently, only RTC and GPIO are supported as wakeup sources. Examples are as follows:

- Set RTC as the wakeup source with a time of 60 seconds
```Shell
D-Robotics:/$ wakeupsource rtc 60
[01620.452562 0]rtc init alarm time 60.
Return: 0, 0x00000000
```

<DocScope products="RDK S100">

- Set GPIO as the wakeup source, AON GPIO 11, active low
```Shell
D-Robotics:/$ wakeupsource gpio 11 0 0
[01680.254419 0]set gpio wakeup source with index 11 type 0 level 0.
Return: 0, 0x00000000
```

</DocScope>
<DocScope products="RDK S600">

- Set GPIO as the wakeup source, AON GPIO 8, active low
```Shell
D-Robotics:/$ wakeupsource gpio 8 0 0
[01680.254419 0]set gpio wakeup source with index 8 type 0 level 0.
Return: 0, 0x00000000
```

</DocScope>

#### Setting Wakeup Source via MCU API

##### RTC Wakeup Time Setting

**SysPower_RtcWakeupSet**

| Attribute | Description |
| ----- | ----- |
| Name | SysPower_RtcWakeupSet |
| Syntax | Std_ReturnType SysPower_RtcWakeupSet (uint32 WakeupTime) |
| Sync/Async | Synchronous |
| Reentrancy | No Reentrant |
| Parameters (in) | WakeupTime: time of rtc alarm (s) |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | Std_ReturnType |
| Description | Set rtc wakeup time |
| Available via | as extern function |

**After setting the RTC wakeup time, timing begins only when the MCU actually initiates the sleep action; i.e., after SysPower_Suspend is called, core0 enters sleep and then timing starts.**

##### GPIO Wakeup Source Setting

**SysPower_GpioWakeupSet**

| Attribute | Description |
| ----- | ----- |
| Name | SysPower_GpioWakeupSet |
| Syntax | Std_ReturnType SysPower_GpioWakeupSet (uint32 GpioIdx, uint32 Type, uint32 Polarity) |
| Sync/Async | Synchronous |
| Reentrancy | No Reentrant |
| Parameters (in) | GpioIdx: index of aon gpio; Type: 0:level other:edge; Polarity: 0:low other:high |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | Std_ReturnType |
| Description | Set gpio wakeup source |
| Available via | as extern function |

##### GPIO Index Definition
<DocScope products="RDK S100">

```Shell
AON GPIO0 ~ GPIO11
```
</DocScope>
<DocScope products="RDK S600">

```Shell
AON GPIO0 ~ GPIO20
```

</DocScope>

**RTC can be set as the sole wakeup source. GPIO cannot be set as the sole wakeup source. When setting GPIO as a wakeup source, RTC must also be set as a wakeup source.**

### Sleep Command

- Sleep via button (SLEEP button) (short press)
- Acore enters `systemctl suspend`

### Wakeup Command

- In Deep sleep mode, automatic wakeup is possible when RTC is set as the wakeup source.

- In Deep sleep mode, if GPIO is set as the wakeup source, short pressing the button (SLEEP button) after sleep can wake the system.

- In Light sleep mode, wakeup can only be achieved by executing a command on the MCU or calling an API interface.

#### Light sleep mode wakeup command
```Shell
D-Robotics:/$ wakefromll
D-Robotics:/$ [0544.238961 0] main on start
...
```

#### Light sleep mode wakeup interface

<DocScope products="RDK S100">

Interface definition:

**Pmu_PerformMainDomainOn**

| Attribute | Description |
| ----- | ----- |
| Name | Pmu_PerformMainDomainOn |
| Syntax | Std_ReturnType Pmu_PerformMainDomainOn (void) |
| Sync/Async | Synchronous |
| Reentrancy | No Reentrant |
| Parameters (in) | None |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | Std_ReturnType |
| Description | main domain power on or resume, and main domain peripherals |
| Available via | Pmu.h |

Example of waking Acore or powering on Acore:
```C
int wakefromll(void)
{
    return Pmu_PerformMainDomainOn();
}
```

</DocScope>
<DocScope products="RDK S600">

Interface definition:

**hb_PM_RequestSt**

| Attribute | Description |
| ----- | ----- |
| Name | hb_PM_RequestSt |
| Syntax | Std_ReturnType hb_PM_RequestSt(PowerManagerState_Type ReqSt) |
| Sync/Async | Asynchronous |
| Reentrancy | No Reentrant |
| Parameters (in) | ReqSt: The target power status requested |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | Std_ReturnType |
| Description | Request for power management state switching |
| Available via | Power_Manager_Cust.h |

**hb_PM_GetCurrSt**

| Attribute | Description |
| ----- | ----- |
| Name | hb_PM_GetCurrSt |
| Syntax | Std_ReturnType hb_PM_GetCurrSt(PowerManagerState_Type *CurrSt_Ptr) |
| Sync/Async | Synchronous |
| Reentrancy | No Reentrant |
| Parameters (in) | None |
| Parameters (inout) | CurrSt_Ptr: current power status |
| Parameters (out) | None |
| Return value | Std_ReturnType |
| Description | get current power management state |
| Available via | Power_Manager_Cust.h |

:::warning
The hb_PM_RequestSt interface does not support multiple consecutive calls. A new state request can only be initiated after the current power state transition is complete. After calling hb_PM_RequestSt, you can query the current power state using the hb_PM_GetCurrSt interface to determine if the state transition is complete.
:::

State definition:
```C
typedef enum {
    MAINSTATE_INIT_ST = 0U,
    MAINSTATE_ON_ST,
    MAINSTATE_OFF_ST,
    MAINSTATE_SLEEP_ST,
#if (MAIN_INITIATE_PWR_SWITCH_ENABLE == STD_ON)
    SYSSTATE_SHUTDOWN_ST,
    MCUSTATE_SLEEP_ST,
    SYSSTATE_SHUTDOWN_ACTTION_IT,
    MAINSTATE_ON2SLEEP_ACTTION_IT,
    MAINSTATE_OFF_ACTTION_IT,
#endif
    MAINSTATE_FORCE_OFF_IT,
    MAINSTATE_RESET_IT,
    ......
} PowerManagerState_Type;
```

Example of waking Acore or powering on Acore:
```C
int wakefromll(void)
{
    return hb_PM_RequestSt(MAINSTATE_ON_ST);
}
```

The sample for calling the above sleep/wakeup APIs is located in ```Service/Cmd_Utility/power_sample_cmd/src/PowerControl.c```

</DocScope>

### Acore Sleep/Wakeup Callback

systemd is used for system service management. Related shutdown or sleep/wakeup callbacks can be used in the form supported by systemd.

- Sleep: When Acore receives a sleep command (systemctl suspend), it calls systemd's suspend interface, which sends signals to all services and waits for them to exit, then calls the kernel's suspend interface to complete the sleep process.

When the system enters or exits sleep, all executable programs in the /usr/lib/systemd/system-sleep/ directory will run. The system passes two parameters to these executable programs. All scripts in the directory are processed in parallel. The system will proceed with subsequent actions only after all programs have completed execution.

| Parameter Type | Value Range               | Explanation       |
|----------|------------------------|-------------------|
| argv[1]   | pre                     | Before sleep      |
|           | post                    | After wakeup      |
| argv[2]   | suspend                 | Suspend to ram    |
|           | hibernate               | Not supported     |
|           | hybrid-sleep            | Not supported     |
|           | suspend-then-hibernate  | Not supported     |

If you need to stop a service before sleep/wakeup and start it afterward, you can add the control logic to /usr/lib/systemd/system-sleep/example.sh
```Shell
#!/bin/bash

PATH=/sbin:/usr/sbin:/bin:/usr/bin

case "$1" in
pre)
        echo "==========handle before suspend==========" > /dev/kmsg
        systemctl stop hobot-example.service
        ;;
post)
        echo "==========handle after wakeup==========" > /dev/kmsg
        systemctl start hobot-example.service
        ;;
*)
        echo "Usage: $0 {pre|post}"
        exit 1
        ;;
esac

exit 0
```

Currently, the callback logic for D-Robotics software sleep/wakeup is implemented in the RDK code at source/hobot-configs/debian/usr/lib/systemd/system-sleep/suspend_resume.sh

:::warning
All upper-layer services must be stopped before sleep; otherwise, the system may not be able to perform sleep/wakeup correctly.
:::