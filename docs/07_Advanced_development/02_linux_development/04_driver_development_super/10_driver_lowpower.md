---
sidebar_position: 10
---

# 低功耗模式调试指南

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 芯片电源域
内部有 AON、MCU 和 Main 域三个电源域。其中 AON 为非下电状态需要一直供电的电源域，MCU 电源域用于给 Hsm 和 MCU 及其内部 IP 供电，Main 域给其他部分供电。

## 电源状态列表
目前实现了 Off，MCU only，Working，Deep sleep 和 Light sleep 五种电源状态，详细说明如下：

| 电源状态    |       描述                             |  AON  |  MCU  |  Main  |  DDR 颗粒  |
| --------   | ---------------------------------------| ----  | ----- | -----  | ---------- |
| Off        | 芯片完全下电                            | Off   |   Off |   Off  |   Off      |
| MCU only   | MCU Rcore 正常工作                       | On   |   On   |   Off  |   Off      |
| Deep sleep | 只有 AON 工作，可被唤醒                    | On   |   Off  |   Off  |   自刷新    |
| Working    | 正常工作模式                            | On    |   On  |   On   |   On    |
| Light sleep | MCU 正常工作，Main 仅 DDR 颗粒供电维持自刷新  | On   |   On   |   Off  |   自刷新    |


## 休眠唤醒

:::warning
**注意：以下介绍的唤醒源的 API 及命令，Light sleep 模式下的唤醒 API 及命令，只能在 MCU0内调用**
:::

### 设置休眠模式
休眠模式默认为 Deep sleep 模式

#### 显示当前支持的休眠模式
```Shell
root@ubuntu:~# cat /sys/devices/platform/suspend-mode/suspend_mode/suspend_mode
light deep
```

当前支持的休眠模式有 deep 和 light，默认是 deep

#### 显示当前的休眠模式
```Shell
root@ubuntu:~# cat /sys/devices/platform/suspend-mode/suspend_mode/current_suspend_mode
deep
```

#### 切换休眠模式
```Shell
root@ubuntu:~# cat /sys/devices/platform/suspend-mode/suspend_mode/current_suspend_mode
deep
root@ubuntu:~# echo light > /sys/devices/platform/suspend-mode/suspend_mode/suspend_mode
root@ubuntu:~# cat /sys/devices/platform/suspend-mode/suspend_mode/current_suspend_mode
light
```

### 设置唤醒源

<DocScope products="RDK S100">
唤醒源默认是 RTC，时间为15秒。
</DocScope>
<DocScope products="RDK S600">
唤醒源默认是 RTC，时间为10秒。
</DocScope>

#### 通过 MCU 命令设置唤醒源

```Shell
D-Robotics:/$ wakeupsource
[01504.149120 0]WakeupSource Usage:
[01504.149349 0]    WakeupSource rtc <time(seconds)>
[01504.149935 0]    WakeupSource can
[01504.150347 0]    WakeupSource gpio <gpio_index> <type> <level>
[01504.151093 0]        type:  0:level other:edge
[01504.151628 0]        level: 0:low   other:high
```
目前仅支持设置 RTC 和 GPIO 作为唤醒源，以下是使用示例：

- 设置 RTC 作为唤醒源，时间是60秒
```Shell
D-Robotics:/$ wakeupsource rtc 60
[01620.452562 0]rtc init alarm time 60.
Return: 0, 0x00000000
```

<DocScope products="RDK S100">

- 设置 GPIO 为唤醒源，AON GPIO 11，低电平有效
```Shell
D-Robotics:/$ wakeupsource gpio 11 0 0
[01680.254419 0]set gpio wakeup source with index 11 type 0 level 0.
Return: 0, 0x00000000
```

</DocScope>
<DocScope products="RDK S600">

- 设置 GPIO 为唤醒源，AON GPIO 8，低电平有效
```Shell
D-Robotics:/$ wakeupsource gpio 8 0 0
[01680.254419 0]set gpio wakeup source with index 8 type 0 level 0.
Return: 0, 0x00000000
```

</DocScope>

#### 通过 MCU API 设置唤醒源

##### RTC 唤醒时间设置

**SysPower_RtcWakeupSet**

| 属性 | 描述 |
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

**RTC 唤醒时间设置后，从 MCU 实际开始做休眠动作才会计时；即 SysPower_Suspend 调用后，core0进入休眠再开始计时**

##### GPIO 唤醒源设置

**SysPower_GpioWakeupSet**

| 属性 | 描述 |
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

##### GPIO Index 定义
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

**可以单独设置 RTC 为唤醒源，不能单独设置 GPIO 为唤醒源。设置 GPIO 为唤醒源时必须同时设置 RTC 作为唤醒源**

### 休眠命令

- 通过按键（SLEEP 按键）休眠（短按）
- Acore 输入`systemctl suspend`

### 唤醒命令

- Deep sleep 模式下，RTC 作为唤醒源时可以自动唤醒

- Deep sleep 模式下，设置 GPIO 作为唤醒源，休眠之后短按按键（SLEEP 按键）可以唤醒

- Light sleep 模式下，只能通过在 MCU 执行命令或者调用 API 接口唤醒

#### Light sleep 模式唤醒命令
```Shell
D-Robotics:/$ wakefromll
D-Robotics:/$ [0544.238961 0] main on start
...
```

#### Light sleep 模式唤醒接口

<DocScope products="RDK S100">

接口定义：

**Pmu_PerformMainDomainOn**

| 属性 | 描述 |
| ----- | ----- |
| Name | Pmu_PerformMainDomainOn |
| Syntax | Std_ReturnType Pmu_PerformMainDomainOn (void) |
| Sync/Async | Synchronous |
| Reentrancy | No Reentrant |
| Parameters (in) | None |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | Std_ReturnType |
| Description | main domain power on or resume, and main domain periperals |
| Available via | Pmu.h |

以下是唤醒 Acore 或对 Acore 上电的示例：
```C
int wakefromll(void)
{
    return Pmu_PerformMainDomainOn();
}
```

</DocScope>
<DocScope products="RDK S600">

接口定义：

**hb_PM_RequestSt**

| 属性 | 描述 |
| ----- | ----- |
| Name | hb_PM_RequestSt |
| Syntax | Std_ReturnType hb_PM_RequestSt(PowerManagerState_Type ReqSt) |
| Sync/Async | Asynchronou |
| Reentrancy | No Reentrant |
| Parameters (in) | ReqSt: The target power status requested |
| Parameters (inout) | None |
| Parameters (out) | None |
| Return value | Std_ReturnType |
| Description | Request for power management state switching |
| Available via | Power_Manager_Cust.h |

**hb_PM_GetCurrSt**

| 属性 | 描述 |
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
hb_PM_RequestSt 接口不支持连续多次调用。只有在当前电源状态切换完成后，才允许再次发起新的状态请求。在调用 hb_PM_RequestSt 之后，可通过 hb_PM_GetCurrSt 接口查询当前电源状态，以判断状态切换是否已完成。
:::

状态定义：
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

以下是唤醒 Acore 或对 Acore 上电的示例：
```C
int wakefromll(void)
{
    return hb_PM_RequestSt(MAINSTATE_ON_ST);
}
```

以上休眠唤醒 API 调用 sample 在```Service/Cmd_Utility/power_sample_cmd/src/PowerControl.c```

</DocScope>

### Acore 休眠唤醒回调

使用 systemd 来进行系统服务管理，相关的关机或休眠唤醒回调均可以使用 systemd 支持的形式来使用。

- 休眠：当 Acore 收到休眠指令(systemctl suspend)时，会调用 systemd 的 suspend 接口，该接口会向所有服务发送信号，并等待服务退出，然后调用 kernel 的 suspend 接口，完成休眠流程。

当系统进入或退出休眠时, 所有在/usr/lib/systemd/system-sleep/目录下的可执行程序将会运行，系统会传递两个参数给这些可执行程序。目录下所有的脚本都是并行处理的，只有当所有的程序都执行完成之后，系统才会进行接下来的动作。

| 参数类型 	| 取值范围               	| 解释           	|
|----------	|------------------------	|----------------	|
| argv[1]  	| pre                    	| 休眠前         	|
|          	| post                   	| 唤醒之后       	|
| argv[2]  	| suspend                	| Suspend to ram 	|
|          	| hibernate              	| 不支持         	|
|          	| hybrid-sleep           	| 不支持         	|
|          	| suspend-then-hibernate 	| 不支持         	|

如果需要在休眠唤醒前关闭 service，在休眠唤醒后打开 service，可以将控制逻辑添加到/usr/lib/systemd/system-sleep/example.sh 下
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

目前在 RDK 代码 source/hobot-configs/debian/usr/lib/systemd/system-sleep/suspend_resume.sh 中实现了地瓜软件休眠唤醒的回调逻辑

:::warning
在休眠前要关闭所有上层服务，否则可能导致系统无法正常进行休眠唤醒。
:::
