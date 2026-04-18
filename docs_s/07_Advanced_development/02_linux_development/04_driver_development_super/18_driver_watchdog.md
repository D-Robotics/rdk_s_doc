---
sidebar_position: 18
---

# Watchdog

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```


<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

## Watchdog 概述

  Watchdog支持窗口模式和普通模式，普通模式需要在计时器减为0之前喂狗；窗口模式规定需要在窗口期内喂狗，窗口期为第一次Timeout到第二次Timeout之间，可配置在第一次Timeout时产生中断信号，如果在窗口期内没有喂狗或在窗口期外喂狗都会产生看门狗重启信号至MCU，由MCU来控制重启。
  SOC包含13个看门狗，分布如下：Acore共6个、MCU共3个、VDSP共1个、BPU共2个、HSM共1个，Acore Watchdog具体使用情况如下表所示：

<table>
  <tbody>
    <tr>
      <td>Watchdog0</td>
      <td>预留给客户</td>
    </tr>
    <tr>
    <td>Watchdog1</td>
      <td>监控Acore IRQ响应超时，Timeout为161ms</td>
    </tr>
    <tr>
      <td>Watchdog2</td>
      <td>监控Acore Kthread响应超时，Timeout为5162ms</td>
    </tr>
    <tr>
      <td>Watchdog3</td>
      <td>预留给客户</td>
    </tr>
    <tr>
      <td>Watchdog4</td>
      <td>预留给客户</td>
    </tr>
    <tr>
      <td>Watchdog5</td>
      <td>预留给客户</td>
    </tr>
  </tbody>
</table>
</TabItem>
<TabItem value="S600" label="S600">
  Watchdog支持窗口模式和普通模式，普通模式需要在计时器减为0之前喂狗；窗口模式规定需要在窗口期内喂狗，窗口期为第一次Timeout到第二次Timeout之间，可配置在第一次Timeout时产生中断信号，如果在窗口期内没有喂狗或在窗口期外喂狗都会产生看门狗重启信号至MCU，由MCU来控制重启。
  SOC包含18个看门狗，分布如下：Acore共2个、MCU共5个、VDSP共2个、BPU共8个、HSM共1个，Acore Watchdog具体使用情况如下表所示：
<table>
  <tbody>
    <tr>
      <td>Watchdog0</td>
      <td>监控Acore IRQ响应超时，Timeout为161ms</td>
    </tr>
    <tr>
      <td>Watchdog1</td>
      <td>监控Acore Kthread响应超时，Timeout为5162ms</td>
    </tr>
  </tbody>
</table>
</TabItem>
</Tabs>

## 特性

窗口看门狗(window Watchdog)是功能安全产品常用的特殊看门狗。

  - 窗口指的是，如果使能了窗口模式，那么原有的一次Timeout就上报reset信号的机制会发生变更。

  - 第一次Timeout之前，是禁止区域，不允许喂狗操作，否则会上报reset信号。

  - 第一次与第二次Timeout之间，是允许区域，允许喂狗操作，超时不喂狗会上报reset信号。

![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/image-rdk_s100_wdt_window.png)

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

## 设备树

在设备树中增加看门狗的硬件信息描述（位置：code/source/hobot-drivers/kernel-dts/arch/arm64/boot/dts/hobot/drobot-s100-soc.dtsi）
```dts
  watchdog1: wdt@30110000 {
          status = "okay";
          ranges;
          #address-cells = <2>;
          #size-cells = <2>;
          compatible = "snps,hb_wdt";
          reg = <0x0 0x30110000 0x0 0x1000>;  //the register address of the hardware
          interrupt-parent = <&gic>;
          interrupts = <GIC_SPI CPUSYS_CLUSTER_MP4_WWDT_WDT_INTR_1 IRQ_TYPE_LEVEL_HIGH>,
          <GIC_SPI CPUSYS_CLUSTER_MP4_WWDT_SYS_RST_INTR_1 IRQ_TYPE_EDGE_RISING>;
          clocks = <&scmi_smc_clk CLK_IDX_TOP_CPU0_TIMER_WDT>;
          resets = <&smc_reset RST_IDX_IP_CPU0_WWDT_PAUSE1>,
                          <&smc_reset RST_IDX_IP_CPU0_WWDT_1>;
          snps,mode = "sw";
          usage = "irq_mon";
          timeout = <161>;         //  timeout 161ms
          moduleid-ofst = <5>;
          wdt_tee_regmap {
                  compatible = "syscon";
                  services = <&tee_regmap>;
                  reg = <0x0 0x300A0000 0x0 0x10000>;
          };
  };
```
</TabItem>
<TabItem value="S600" label="S600">

## 设备树

在设备树中增加看门狗的硬件信息描述（位置：code/source/hobot-drivers/kernel-dts/arch/arm64/boot/dts/hobot/drobot-s600-soc.dtsi）
```dts
  watchdog0: wdt@32260000 {
          status = "okay";
          ranges;
          #address-cells = <2>;
          #size-cells = <2>;
          compatible = "snps,hb_wdt";
          reg = <0x0 0x32260000 0x0 0x1000>;
          interrupt-parent = <&gic>;
          interrupts = <GIC_SPI CPUSYS_MP2_CLUSTER_MP2_WWDT_WDT_INTR_0 IRQ_TYPE_LEVEL_HIGH>,
          <GIC_SPI CPUSYS_MP2_CLUSTER_MP2_WWDT_SYS_RST_INTR_0 IRQ_TYPE_EDGE_RISING>;
          clocks = <&clk_26m>;
          resets = <&smc_reset RST_IDX_WWDT_PAUSE_MP2_0>,
              <&smc_reset RST_IDX_WWDT_SOFT_RESET_MP2_0>;
          snps,mode = "sw";
          usage = "irq_mon";
          timeout = <161>;
          moduleid-ofst = <5>;
          wdt_tee_regmap {
            compatible = "syscon";
            services = <&tee_regmap>;
            reg = <0x0 0x32220000 0x0 0x10000>;
          };
		};
```
</TabItem>
</Tabs>

## Watchdog 驱动代码

Watchdog 模块的驱动代码位于 `/hobot-drivers/watchdog`。

## Watchdog Timeout

当监控Acore的Watchdog Timeout时，会触发中断发送到MCU0侧，由MCU的任务触发Acore重启，在任务中会等待5s，使Acore侧完成堆栈的打印。
![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/image-rdk_s100_wdt_timeout.png)


## 用户开发

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

目前WDT1用于监控内核关中断超时，WDT2用于监控内核线程，其余WDT0、WDT3、WDT4和WDT5均支持在用户态通过ioctl接口对Watchdog进行操作，使用方式如下。
</TabItem>
<TabItem value="S600" label="S600">
目前WDT0用于监控内核关中断超时，WDT1用于监控内核线程
</TabItem>
</Tabs>

### hb_wdt_ioctl.h 说明

用户态程序使用本文中的 `ioctl` 接口前，需自备头文件 `hb_wdt_ioctl.h`。头文件中：

- **`WDT_MAGIC_NUM`**：取值为字符 **`'W'`**，用来标记「下面这组 `ioctl` 命令是给 watchdog 用的」。不同外设/驱动会用不同标记，这样内核不会把别的设备的命令和看门狗搞混（不必修改该值，与驱动保持一致即可）。
- **`HB_WDT_START`、`HB_WDT_RESTART` 等**：在 `'W'` 这一标记下再区分的具体命令编号，对应下文各小节。

上述定义须与内核 watchdog 字符设备驱动保持一致。

**文件内容**

可将以下内容保存为 `hb_wdt_ioctl.h`：

```c
#ifndef DRIVERS_WATCHDOG_HB_WDT_IOCTL_H_
#define DRIVERS_WATCHDOG_HB_WDT_IOCTL_H_

#define WDT_MAGIC_NUM 'W'  /**< ioctl magic num*/
#define HB_WDT_START					_IO(WDT_MAGIC_NUM, 1)  /**< ioctl cmd to start*/
#define HB_WDT_STOP						_IO(WDT_MAGIC_NUM, 2)  /**< ioctl cmd to stop*/
#define HB_WDT_RESTART					_IO(WDT_MAGIC_NUM, 3)  /**< ioctl cmd to restart*/
#define HB_WDT_GETSTATUS			    _IO(WDT_MAGIC_NUM, 4)  /**< ioctl cmd to get status*/
#define HB_WDT_SETTIMEOUT				_IO(WDT_MAGIC_NUM, 5)  /**< ioctl cmd to set timeout*/
#define HB_WDT_GETTIMEOUT				_IO(WDT_MAGIC_NUM, 6)  /**< ioctl cmd to get timeout*/
#define HB_WDT_GETTIMELEFT				_IO(WDT_MAGIC_NUM, 7)  /**< ioctl cmd to get timeleft*/
#define HB_WDT_SETMODE			        _IO(WDT_MAGIC_NUM, 8)  /**< ioctl cmd to set mode*/
#define HB_WDT_GETMODE			        _IO(WDT_MAGIC_NUM, 9)  /**< ioctl cmd to get mode*/
#define HB_WDT_PAUSE        			_IO(WDT_MAGIC_NUM, 10)  /**< ioctl cmd to pause*/
#define HB_WDT_PROCEED          		_IO(WDT_MAGIC_NUM, 11)  /**< ioctl cmd to proceed*/

#endif
```

**使用方式**

- Linux 用户态中，`_IO` 定义在 `<sys/ioctl.h>`。若编译提示 `_IO` 未定义，须在包含 `hb_wdt_ioctl.h` 之前增加 `#include <sys/ioctl.h>`，或将该 include 写在 `hb_wdt_ioctl.h` 内、且位于 `#define WDT_MAGIC_NUM` 之前。
- 在已对 watchdog 字符设备 `open` 成功并得到有效文件描述符 `fd` 后，包含 `hb_wdt_ioctl.h`，按手册下文各小节调用 `ioctl(fd, HB_WDT_xxx, &flags)`。
- 若驱动侧变更 `ioctl` 命令编号，须同步修改本头文件中的宏定义。

```c
#include <sys/ioctl.h>
#include "hb_wdt_ioctl.h"

/* fd 为 watchdog 字符设备已打开的文件描述符 */
int flags = 0;
ret = ioctl(fd, HB_WDT_START, &flags);
```

### HB_WDT_START
```c
int flags = 0;
ret = ioctl(fd, HB_WDT_START, &flags);
```

  功能描述:
  - 开启看门狗

  参数描述:
  - [IN] fd：WDT文件描述符
  - [IN] HB_WDT_START：WDT START的ioctl宏
  - [IN/OUT] flags：保留参数传入 0 即可

  返回值:
  - 0: 成功
  - 小于0: 失败

### HB_WDT_STOP
```c
int flags = 0;
ret = ioctl(fd, HB_WDT_STOP, &flags);
```

  功能描述:
  - 停止看门狗

  参数描述:
  - [IN] fd：WDT文件描述符
  - [IN] HB_WDT_STOP：WDT STOP的ioctl宏
  - [IN/OUT] flags：保留参数传入 0 即可

  返回值:
  - 0: 成功
  - 小于0: 失败

### HB_WDT_RESTART
```c
int flags = 0;
ret = ioctl(fd, HB_WDT_RESTART, &flags);
```
  功能描述:
  - 对看门狗进行喂狗操作

  参数描述:
  - [IN] fd：WDT文件描述符
  - [IN] HB_WDT_RESTART：WDT RESTART的ioctl宏
  - [IN/OUT] flags：保留参数传入 0 即可

  返回值:
  - 0: 成功
  - 小于0: 失败

### HB_WDT_PAUSE
```c
int flags = 0;
ret = ioctl(fd, HB_WDT_PAUSE, &flags);
```
  功能描述:
  - 暂停看门狗

  参数描述:
  - [IN] fd：WDT文件描述符
  - [IN] HB_WDT_PAUSE：WDT PAUSE的ioctl宏
  - [IN/OUT] flags：保留参数传入 0 即可

  返回值:
  - 0: 成功
  - 小于0: 失败

### HB_WDT_PROCEED
```c
int flags = 0;
ret = ioctl(fd, HB_WDT_PROCEED, &flags);
```
  功能描述:
  - 在暂停看门狗后使看门狗继续运行

  参数描述:
  - [IN] fd：WDT文件描述符
  - [IN] HB_WDT_PROCEED：WDT PROCEED的ioctl宏
  - [IN/OUT] flags：保留参数传入 0 即可

  返回值:
  - 0: 成功
  - 小于0: 失败

### HB_WDT_SETTIMEOUT
```c
int flags = 50;// Input: timeout value in milliseconds (e.g., 50)
ret = ioctl(fd, HB_WDT_SETTIMEOUT, &flags);
```
  功能描述:
  - 设置看门狗的timeout，单位为ms

  参数描述:
  - [IN] fd：WDT文件描述符
  - [IN] HB_WDT_SETTIMEOUT：WDT SETTIMEOUT的ioctl宏
  - [IN] flags：设置的Timeout值，单位为ms

  返回值:
  - 0: 成功
  - 小于0: 失败

### HB_WDT_GETTIMEOUT
```c
int flags = 0;
ret = ioctl(fd, HB_WDT_GETTIMEOUT, &flags);
```
  功能描述:
  - 获取看门狗的超时时间，单位为ms

  参数描述:
  - [IN] fd：WDT文件描述符
  - [IN] HB_WDT_GETTIMEOUT：WDT GETTIMEOUT的ioctl宏
  - [OUT] flags：获取的看门狗的超时时间，单位为ms

  返回值:
  - 0: 成功
  - 小于0: 失败

### HB_WDT_GETTIMELEFT
```c
int flags = 0;
ret = ioctl(fd, HB_WDT_GETTIMELEFT, &flags);
```
  功能描述:
  - 获取看门狗的本次喂狗周期的剩余timeout，单位为ms

  参数描述:
  - [IN] fd：WDT文件描述符
  - [IN] HB_WDT_GETTIMELEFT：WDT GETTIMELEFT的ioctl宏
  - [OUT] flags：获取的看门狗的本次喂狗周期的剩余超时时间，单位为ms

  返回值:
  - 0: 成功
  - 小于0: 失败

### HB_WDT_SETMODE
```c
int flags = 34;
ret = ioctl(fd, HB_WDT_SETMODE, &flags);
```
  功能描述:
  - 设置看门狗的模式

  参数描述:
  - [IN] fd：WDT文件描述符
  - [IN] HB_WDT_SETMODE：WDT SETMODE的ioctl宏
  - [IN] flags：要设置的看门狗的模式，34表示有第一次Timeout中断的窗口狗模式，2表示没有第一次Timeout中断的窗口狗模式，0表示普通狗模式

  返回值:
  - 0: 成功
  - 小于0: 失败

### HB_WDT_GETMODE
```c
int flags = 0;
ret = ioctl(fd, HB_WDT_GETMODE, &flags);
```
  功能描述:
  - 获取看门狗的模式

  参数描述:
  - [IN] fd：WDT文件描述符
  - [IN] HB_WDT_GETMODE：WDT GETMODE的ioctl宏
  - [OUT] flags： 获取的看门狗的模式，34表示有第一次Timeout中断的窗口狗模式，2表示没有第一次Timeout中断的窗口狗模式，0表示普通狗模式

  返回值:
  - 0: 成功
  - 小于0: 失败

### HB_WDT_GETSTATUS
```c
int flags = 0;
ret = ioctl(fd, HB_WDT_GETSTATUS, &flags);
```
  功能描述:
  - 获取看门狗状态

  参数描述:
  - [IN] fd：WDT文件描述符
  - [IN] HB_WDT_GETSTATUS：WDT GETSTATUS的ioctl宏
  - [OUT] flags：获取的看门狗的状态，其中bit0为1代表Watchdog已使能，bit0为0代表Watchdog未使能；bit1为1代表Watchdog处于暂停状态，bit1为0代表Watchdog处于非暂停状态，bit2为1代表Watchdog设置了nowayout，bit2为0代表Watchdog未设置nowayout

  返回值:
  - 0: 成功
  - 小于0: 失败

## Watchdog 监控方案
<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

### HardLockup监控
  HardLockup监控基于Watchdog模块实现，使用Watchdog1配置成窗口模式，在驱动中实现监控逻辑。当系统正常运行时监控逻辑如下图：
![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/image-rdk_s100_wdt_hardlockup.png)

  1. 初始化Watchdog硬件。

  2. 开始Watchdog定时。

  3. 当第一次Timeout到来时产生一个中断，Watchdog重新开始计数，某个core响应中断后给其它核发送IPI，记录一张此时在线的CPU位图，每当一个core收到IPI中断或者下线时，会将位图对应的bit清除，当整个位图为empty时，说明本次监控任务完成，则允许喂狗。

  4. 喂狗后，Watchdog重新开始下一个周期的计数。

![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/image-rdk_s100_wdt_irq.png)

  1. 初始化Watchdog硬件。

  2. 开始Watchdog定时。

  3. 当第一次Timeout到来产生一个中断，Watchdog重新开始计数，某个core响应中断后给其它core发送IPI，若CPU位图不为empty，说明有core无法正常响应IRQ中断，不允许喂狗。

  4. Watchdog计数器继续递减，当第二次Timeout到来产生两个中断，一个中断发送到Acore的GIC中断，在中断中进行打栈，另一个为看门狗重启中断发送至MCU，由MCU控制重启。MCU会在第一次接收到狗叫对应的看门狗重启中断后，刷新一次狗的超时时间为2581ms，预留给Acore进行打栈，当再次触发狗叫对应的看门狗重启中断后，进行重启。

### SoftLockup监控

  SoftLockup监控基于Watchdog模块实现，使用Watchdog2配置成窗口模式，在驱动中实现监控逻辑，整体监控思路与HardLockup监控一致。

  1. 初始化Watchdog硬件。

  2. 初始化Per-CPU的Watchdog监控Kthread线程，即每个CPU上都跑一个Watchdog监控Kthread线程。

  3. 开始Watchdog定时。

  4. 当第一次Timeout到来产生一个中断，Watchdog重新开始计数，某个core响应中断后将置起一个标志位，跑在其上的Watchdog监控Kthread线程检测到标志位被置起后，将自己对应的CPU位图中的bit清零，并给其它core发送IPI，让其他核执行相同的逻辑，记录一张此时在线的CPU位图，每当一个核收到IPI执行该逻辑或者下线时，会将位图对应的bit清除，当整个位图为empty时，说明本次监控任务完成，则允许喂狗。

  5. 若在第二次Timeout之前CPU位图仍不为empty，则当第二次Timeout到来产生两个中断，一个中断发送到Acore的GIC中断，在中断中进行打栈，另一个为看门狗重启中断发送至MCU，由MCU控制重启。MCU会在第一次接收到狗叫对应的看门狗重启中断后，刷新一次狗的超时时间为2581ms，预留给Acore进行打栈，当再次触发狗叫对应的看门狗重启中断后，进行重启。
</TabItem>
<TabItem value="S600" label="S600">

### HardLockup监控
  HardLockup监控基于Watchdog模块实现，使用Watchdog0配置成窗口模式，在驱动中实现监控逻辑。当系统正常运行时监控逻辑如下图：
![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/image-rdk_s100_wdt_hardlockup.png)

  1. 初始化Watchdog硬件。

  2. 开始Watchdog定时。

  3. 当第一次Timeout到来时产生一个中断，Watchdog重新开始计数，某个core响应中断后给其它核发送IPI，记录一张此时在线的CPU位图，每当一个core收到IPI中断或者下线时，会将位图对应的bit清除，当整个位图为empty时，说明本次监控任务完成，则允许喂狗。

  4. 喂狗后，Watchdog重新开始下一个周期的计数。

![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/image-rdk_s100_wdt_irq.png)

  1. 初始化Watchdog硬件。

  2. 开始Watchdog定时。

  3. 当第一次Timeout到来产生一个中断，Watchdog重新开始计数，某个core响应中断后给其它core发送IPI，若CPU位图不为empty，说明有core无法正常响应IRQ中断，不允许喂狗。

  4. Watchdog计数器继续递减，当第二次Timeout到来产生两个中断，一个中断发送到Acore的GIC中断，在中断中进行打栈，另一个为看门狗重启中断发送至MCU，由MCU控制重启。MCU会在第一次接收到狗叫对应的看门狗重启中断后，刷新一次狗的超时时间为2581ms，预留给Acore进行打栈，当再次触发狗叫对应的看门狗重启中断后，进行重启。

### SoftLockup监控

  SoftLockup监控基于Watchdog模块实现，使用Watchdog1配置成窗口模式，在驱动中实现监控逻辑，整体监控思路与HardLockup监控一致。

  1. 初始化Watchdog硬件。

  2. 初始化Per-CPU的Watchdog监控Kthread线程，即每个CPU上都跑一个Watchdog监控Kthread线程。

  3. 开始Watchdog定时。

  4. 当第一次Timeout到来产生一个中断，Watchdog重新开始计数，某个core响应中断后将置起一个标志位，跑在其上的Watchdog监控Kthread线程检测到标志位被置起后，将自己对应的CPU位图中的bit清零，并给其它core发送IPI，让其他核执行相同的逻辑，记录一张此时在线的CPU位图，每当一个核收到IPI执行该逻辑或者下线时，会将位图对应的bit清除，当整个位图为empty时，说明本次监控任务完成，则允许喂狗。

  5. 若在第二次Timeout之前CPU位图仍不为empty，则当第二次Timeout到来产生两个中断，一个中断发送到Acore的GIC中断，在中断中进行打栈，另一个为看门狗重启中断发送至MCU，由MCU控制重启。MCU会在第一次接收到狗叫对应的看门狗重启中断后，刷新一次狗的超时时间为2581ms，预留给Acore进行打栈，当再次触发狗叫对应的看门狗重启中断后，进行重启。
</TabItem>
</Tabs>


## 注意事项

  1. 喂狗超时的重启方式由看门狗重启寄存器配置决定，目前重启由看门狗重启中断上报MCU驱动软件处理。
  2. 非窗口期喂狗会直接导致狗叫。
