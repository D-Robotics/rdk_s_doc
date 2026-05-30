---
sidebar_position: 1
---

# 7.5.2 MCU 快速入门指南

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 范围

本章节概述了 MCU 系统，旨在帮助读者快速了解并掌握相关内容，以便开展 MCU1 的开发工作。因为 MCU0负责启动 Acore、MCU1以及电源管理等功能，这部分不建议客户自行修改，默认不释放源码，提供地瓜验证过的 bin 文件。章节中仅对可能与 MCU1 发生冲突的部分进行简要说明，旨在帮助用户在开发过程中规避 MCU0 与 MCU1 之间的资源竞争问题。

## 基础信息

1. MCU 编译工具链为 GCC 工具链，版本为 gcc-arm-none-eabi-10.3~2021.10
2. MCU 核为 ARM R52+，可以用 ARM R52 technical reference manual 文档作为参考：[官网链接](https://developer.arm.com/documentation/100026/latest)
3. MCU 运行的操作系统均为 FreeRTOS，版本为 FreeRTOS Kernel V10.0.1
4. MCU 主要分为两部分：MCU0和 MCU1。MCU0主要负责启动 Acore、MCU1以及电源管理等功能，目前不开源；MCU1主要负责跑业务等功能，开源，客户可根据自己需求进行修改

## MCU 框架

<DocScope products="RDK S100">
MCU0是板子启动的开始，也是重中之重。因为 MCU0负责启动 Acore、MCU1以及电源管理等功能。Acore 所运行的 linux 操作系统是客户开发功能的重要载体，而 MCU1运行的 FreeRTOS 操作系统为客户的实时任务进行保驾护航。
MCU1通过 linux 的 remoteproc 框架实现，在 Acore 的 sysfs 通过向 MCU0发送通知，从而控制 MCU1的启动和关闭。同时在 RDK-S100的休眠模式下，也是通知 Acore 通知 MCU0从而操作 MCU1，实现低功耗休眠功能。
</DocScope>
<DocScope products="RDK S600">
MCU0是板子启动的开始，也是重中之重。因为 MCU0负责启动 Acore、MCU1以及电源管理等功能。Acore 所运行的 linux 操作系统是客户开发功能的重要载体，而 MCU1运行的 FreeRTOS 操作系统为客户的实时任务进行保驾护航。
MCU1通过 linux 的 remoteproc 框架实现，在 Acore 的 sysfs 通过向 MCU0发送通知，从而控制 MCU1的启动和关闭。同时在 RDK-S600的休眠模式下，也是通知 Acore 通知 MCU0从而操作 MCU1，实现低功耗休眠功能。
</DocScope>
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_frame.png" alt="" style={{ width: '100%' }} />

## 开发环境
交叉编译是指在主机上开发和构建软件，然后把构建的软件部署到开发板上运行。主机一般拥有比开发板更高的性能和更多的内存，可以高效完成代码的构建，可以安装更多的开发工具。

### 主机编译环境要求

推荐使用 Ubuntu 22.04 操作系统，保持和 RDK S100相同的系统版本，减少因版本差异产生的依赖问题。

Ubuntu 22.04 系统安装以下软件包：

```c
sudo apt-get install -y build-essential make cmake libpcre3 libpcre3-dev bc bison \
                        flex python3-numpy mtd-utils zlib1g-dev debootstrap \
                        libdata-hexdumper-perl libncurses5-dev zip qemu-user-static \
                        curl repo git liblz4-tool apt-cacher-ng libssl-dev checkpolicy autoconf \
                        android-sdk-libsparse-utils mtools parted dosfstools udev rsync python3-pip scons

pip install "scons>=4.0.0"
pip install ecdsa
pip install tqdm
```

## 编译 MCU 系统

1. 编译会使用 python3，RDK S100开发使用的 python3的版本为3.8.10；
2. MCU1的镜像分为 debug 和 release 两个版本。debug 版本的镜像会有调试信息，而 release 版本不含调试信息。

:::info 工具链下载说明

首次编译会从 arm 官网下载工具链后解压缩（10min 左右），网速不好可能会导致工具链下载不成功或下载不完整的问题，建议通过以下方式下载编译工具链：
1. 点击[工具链下载链接](../../01_Quick_start/download.md#工具下载)，下载编译工具链。
2. 将已有工具链移至 /Build/ToolChain/Gcc/ 内，移动工具链命令如下：

    `mv 工具链存储路径/工具链文件名 新代码/Build/ToolChain/Gcc/`

3. 编译时检测到有工具链，不会再从官网下载。

:::

<DocScope products="RDK S100">
```shell
# 编译MCU1 Debug版本
cd mcu/Build/FreeRtos_mcu1
python build_freertos.py lite matrix B s100 mcu1 gcc debug
*/

# 编译MCU1 Release版本
cd mcu/Build/FreeRtos_mcu1
python build_freertos.py lite matrix B s100 mcu1 gcc release
```
</DocScope>
<DocScope products="RDK S600">

```shell
# 编译MCU1 Debug版本
cd mcu/Build/FreeRtos_mcu1
python build_freertos.py lite matrix B s600 gcc mcu1 debug

# 编译MCU1 Release版本
cd mcu/Build/FreeRtos_mcu1
python build_freertos.py lite matrix B s600 gcc mcu1 release
```
</DocScope>

## 编译成功标志
<DocScope products="RDK S100">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/build_success.png" alt="" style={{ width: '100%' }} />
</DocScope>
<DocScope products="RDK S600">
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/02_S600/01_basic_information/build_success.jpg" alt="" style={{ width: '100%' }} />
</DocScope>

### 编译输出目录

<DocScope products="RDK S100">

```c
output/
├── debug                               # 该文件夹下包含debug版本的编译生成文件
|    ├── objs                           # 编译生成的i/s/o文件
|    └── S100_MCU_SIP_V2.0              # 编译生成的bin/map/elf等文件
|         ├── custom_compiler_flags.py
|         ├── S100_MCU_DEBUG.elf        # MCU1启动文件
|         ├── S100_MCU_DEBUG.map
|         ├── S100_MCU_SIP_V2.0.bin
├── objs                                # 编译生成的i/s/o文件，根据编译的版本变化
├── release                             # 该文件夹下包含release版本的编译生成文件
|    ├── objs                           # 编译生成的i/s/o文件
|    └── S100_MCU_SIP_V2.0              # 编译生成的bin/map/elf等文件
```
</DocScope>
<DocScope products="RDK S600">

```c
output/
├── debug                               # 该文件夹下包含debug版本的编译生成文件
|    ├── objs                           # 编译生成的i/s/o文件
|    └── S600_MCU_Matrix_V2.0           # 编译生成的bin/map/elf等文件
|         ├── S600_MCU_RAW.bin
|         ├── S600_MCU_DEBUG.elf        # MCU1启动文件
|         ├── S600_MCU_DEBUG.map
|         ├── S600_MCU_Matrix_V2.0.bin
├── objs                                # 编译生成的i/s/o文件，根据编译的版本变化
├── release                             # 该文件夹下包含release版本的编译生成文件
|    ├── objs                           # 编译生成的i/s/o文件
|    └── S600_MCU_Matrix_V2.0           # 编译生成的bin/map/elf等文件
```
</DocScope>

## MCU1启动/关闭流程
MCU1的启动/关闭是由 Acore 经过 remoteproc 框架传递信息给 MCU0进而实现启动/关闭 MCU1。
### MCU1启动原理与步骤{#start_mcu1}
#### MCU1启动原理

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/mcu1_start.png" alt="" style={{ width: '100%' }} />

#### MCU1启动步骤
下述启动流程以 debug 版本为例，release 版本与其类似，只是少一些 log 打印。

<DocScope products="RDK S100">
1. 经过上述编译流程，编译 debug 版本会在 S100_MCU_SIP_V2.0文件夹下产生 S100_MCU_DEBUG.elf 文件（release 版本类似），该文件为 MCU1的 firmware 文件，因此需要将该文件推送到板端的/lib/firmware 目录。
</DocScope>
<DocScope products="RDK S600">
1. 经过上述编译流程，编译 debug 版本会在 S600_MCU_Matrix_V2.0文件夹下产生 S600_MCU_DEBUG.elf 文件（release 版本类似），该文件为 MCU1的 firmware 文件，因此需要将该文件推送到板端的/lib/firmware 目录。
</DocScope>
举例子如下：(此处以及后续步骤截图均以 S100为例，S600类似)

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/push_elf.png" alt="" style={{ width: '100%' }} />

2. 板端启动流程
```c
cd /sys/class/remoteproc/remoteproc_mcu0
echo S100_MCU_DEBUG.elf > firmware
echo start > state
```
正常启动后，串口 log 打印下图所示
Acore 侧串口打印

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/Acore_start_log.png" alt="" style={{ width: '100%' }} />

MCU 侧串口打印

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_start_log.png" alt="" style={{ width: '100%' }} />

### MCU1关闭原理与步骤

#### MCU1关闭原理

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/mcu1_stop.png" alt="" style={{ width: '100%' }} />

#### MCU1关闭步骤
下述关闭流程以 debug 版本为例，release 版本与其类似，只是少一些 log 打印。
(后续实例以 S100为例，S600类似)
<DocScope products="RDK S100">
```c
cd /sys/class/remoteproc/remoteproc_mcu0
echo S100_MCU_DEBUG.elf > firmware
echo stop > state
```
</DocScope>
<DocScope products="RDK S600">
```c
cd /sys/class/remoteproc/remoteproc_mcu0
echo S600_MCU_DEBUG.elf > firmware
echo stop > state
```
</DocScope>
正常关闭后，串口 log 打印下图所示
Acore 侧串口打印

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/Acore_stop_log.png" alt="" style={{ width: '100%' }} />

MCU 侧串口打印

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_stop_log.png" alt="" style={{ width: '100%' }} />

:::caution
stop MCU1之后，如果需要再次启动 MCU1，必须等待系统进入 wfi 模式之后，才能再次 start MCU1，见下图所示。原因解释：避免系统还没有进入 wfi 模式时，start MCU1会重新加载 firmware 至 mcu sram 位置导致之前位置代码被覆盖，导致系统运行跑飞挂死

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/mcu1_enter_wfi.png" alt="" style={{ width: '100%' }} />
:::

## MCU0/MCU1模块划分
MCU 整个系统含有 ICU、RTC、IPC、port、CAN 等模块，但是为了用户开发的方便，对于功能进行了划分，划分细节如下图所示。
<DocScope products="RDK S100">
|模块|模块位置|
|----|---------------|
|ppslcu|MCU0|
|port|MCU0|
|uart|MCU0/MCU1|
|log|MCU0/MCU1|
|shell_init|MCU0/MCU1|
|mDma|MCU0/MCU1|
|I2c|MCU0: i2c6, i2c7/MCU1: i2c8, i2c9|
|tca9539|MCU0|
|ICU|MCU0|
|GPT|MCU0|
|pmic|MCU0|
|fls_init|MCU0|
|otaflash|MCU0|
|ipc|MCU0: instance8/MCU1: instance0(其他 instance 未划分, 均可使用)|
|crypto|MCU0|
|pvt|MCU0|
|canGW|MCU1|
|Rtc|MCU0|
|RTC_pps|MCU0|
|Eth_Init|MCU1|
|Scmi|MCU0|
</DocScope>
<DocScope products="RDK S600">
|模块|模块位置|
|----|---------------|
|ppslcu|MCU0|
|port|MCU0|
|uart|MCU0/MCU1|
|log|MCU0/MCU1|
|shell_init|MCU0/MCU1|
|mDma|MCU0/MCU1|
|I2c|MCU0/MCU1|
|tca9539|MCU0|
|ICU|MCU0|
|GPT|MCU0|
|pmic|MCU0|
|fls_init|MCU0|
|otaflash|MCU0|
|ipc|MCU0: instance8/MCU1: instance0|
|crypto|MCU0|
|pvt|MCU0|
|Rtc|MCU0|
|RTC_pps|MCU0|
|Eth_Init|MCU1|
|Scmi|MCU0|
|Can|MCU1:Can1, Can2, Can3, Can4, Can10|
</DocScope>
## MCU 在 sysfs 上 debug 功能介绍
MCU 目前在 sysfs 上支持查看系统状态 alive，系统存活时间 taskcounter，mcu 版本 mcu_version，sbl 版本 sbl_version 等功能。
1. 系统状态 alive：表示 MCU0/MCU1所处状态，分别为 alive 和 dead 两种。mcu alive 状态每1s 更新一次，所以获取状态会有1s 延迟；
2. 系统存活时间 taskcounter：表示 mcu 启动后持续的时间，单位：秒；
3. mcu 版本 mcu_version：可以查看 mcu 版本信息，包括 debug 版本还是 release 版本，以及编译的时间；
4. sbl 版本 sbl_version：可以查看 sbl 版本信息以及编译的时间，但是只有在 remoteproc_mcu0下可以查看;
5. mcu cpuloads: 可以获取到 MCU0/MCU1各任务的任务状态，优先级，剩余栈，运行次数（FreeRtos tickcount）和使用率等信息，帮助用户去 debug。cpuloads 数据获取需要1s 的延迟，因为会涉及到大量数据拷贝至 sysfs 文件系统下的输出 buffer。cpuloads 的获取需要在 MCU0/MCU1**已上电**的情况下才能进行获取。
6. 固件名 firmware：该固件名为 remoteproc 框架下 mcu0启动 mcu1时的，mcu1的固件名字。当 mcu0启动 mcu1时，linux 会去板端/lib/firmware 文件夹下，找相应文件，从而加载至相应位置。
7. 节点名 name：如 mcu0，为 soc:remoteproc_mcu0;mcu1,为 soc:remoteproc_mcu1。
8. 状态 state：指 remoteproc 子系统的状态。启动 mcu1，经过是 mcu0 remoteproc 节点，所以会变为 runing 状态。未启动 mcu1时，状态为 offline。
9. recovery 节点：指当 mcu 挂掉后，是否可以获取 coredump 寄存器信息。该功能正常情况下是使能的，如果用到该功能，请参考[MCU ramdump章节](./13_mcu_ramdump.md)章节。
10. uevent 节点：指设备类型，为 DEVTYPE=remoteproc。
11. timesync 节点：主从设备同步时间需要，MCU 不支持该功能。

:::info 图片中的信息可能因版本更新而有所不同，文中示例仅供参考
:::
1. 系统状态 alive，图示：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/alive_state.png" alt="" style={{ width: '100%' }} />

2. 系统存活时间 taskcounter，图示：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/taskcounter_state.png" alt="" style={{ width: '100%' }} />

3. mcu 版本 mcu_version，图示：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/mcu_version.png" alt="" style={{ width: '100%' }} />

4. sbl 版本 sbl_version，图示：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/sbl_version.png" alt="" style={{ width: '100%' }} />

5. mcu 串口 log 获取，图示：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/log.png" alt="" style={{ width: '100%' }} />

6. mcu cpuloads 获取，图示:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/cpuload.jpg" alt="" style={{ width: '100%' }} />

## MCU 串口使用

<DocScope products="RDK S100">
如果 RDK-S100含有连接方式如下，mcu 串口和 Acore 串口共用一个串口，自行查看：设备管理器 -> 端口 -> MCU-COM -> 波特率921600
</DocScope>
<DocScope products="RDK S600">
如果 RDK-S600含有连接方式如下，mcu 串口和 Acore 串口共用一个串口，自行查看：设备管理器 -> 端口 -> MCU-COM -> 波特率921600
</DocScope>

<DocScope products="RDK S100">
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_COM1.jpg" alt="" style={{ width: '100%' }} />
</DocScope>
<DocScope products="RDK S600">
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/02_S600/01_basic_information/S600_SerialCOM.jpg" alt="" style={{ width: '100%' }} />
</DocScope>

## MCU0烧录流程
### 手动烧录
#### 非空板烧录
1. 打开板子，板端 Acore 串口常按 enter 进入 uboot（一定要一直按）
```c
fastboot 0
```
2. 编译好的 MCU0 镜像/output_sysmcu/目录下找到相应的 MCU0镜像（MCU0代码仅在商业版中提供），这里展示以 S100 MCU0为例。
```c
fastboot oem interface:mtd
/* 编译出来的S100 MCU0镜像：MCU_S100_SIP_V2.0.img */
/* 编译出来的S600 MCU0镜像：MCU_S600_Matrix_V2.0.img*/
fastboot flash MCU_a "xxx/MCU_S100_SIP_V2.0.img"
fastboot flash MCU_b "xxx/MCU_S100_SIP_V2.0.img"
```

#### 空板烧录
**空板烧录请使用 Xburn 工具指定区域烧录，并指定 `miniboot_flash`**

<DocScope products="RDK S100">

关于 Xburn 工具烧录指定区域，请参考[指定区域烧录](../../01_Quick_start/02_install_os/rdk_s100/03_xburn/01_windows.md#指定区域烧录)章节。

</DocScope>
<DocScope products="RDK S600">

关于 Xburn 工具烧录指定区域，请参考[指定区域烧录](../../01_Quick_start/02_install_os/rdk_s600.md#指定区域烧录)章节。

</DocScope>

## MCU1 Undefined/Abort 异常处理原理

<DocScope products="RDK S100">

正常情况下系统在进入 undefined/abort 异常时，最终会进入死循环状态。只有重新执行上下电流程才能再次正常运行。RDK-S100由于不能对 MCU1单独进行上下电，所以需要进行系统流程的修改，以实现上述的预期。
</DocScope>
<DocScope products="RDK S600">
正常情况下系统在进入 undefined/abort 异常时，最终会进入死循环状态。只有重新执行上下电流程才能再次正常运行。RDK-S600由于不能对 MCU1单独进行上下电，所以需要进行系统流程的修改，以实现上述的预期。
</DocScope>
具体原理：当 Undefined/Abort 异常产生时，也会最终进入死循环状态。通过 Acore 的 sysfs 对 MCU1进行软件下电，也即通知 MCU1进入 wfi 模式，等下次再次 start 时，MCU1将重新软件启动，从而实现预期。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_exception.png" alt="" style={{ width: '100%' }} />

下面以 S100 Undefined 异常为例子，S600类似（只是相关函数名称前缀为 S600）。当 Undefined 异常产生时，uart 串口输出 log “EL1_Undefined_Handler”，并进入最终进入 S100_Exception_Handler 处理函数，并根据 exception_on 变量进入死循环状态。当 Acore 通过 remoteproc 框架 stop MCU1后，核间中断修改 exception_on 变量，进而关闭 tick 周期性中断，并进入 WFI 模式（STANDBY 模式）：
```c
void Os_Isr_Cross_Core_Ins0_Isr(void)
{
  LogSync("mcu1 enter WFI mode!\r\n");
  power_on = 0;
  ClearCrossCoreISR0();
  if (exception_on)
  {
    exception_on = 0;
  }
}

void S100_Exception_Handler(void)
{
    LogSync("os enter %s!\r\n", __func__);
    while (exception_on){};
    LogSync("%s enter wfi mode!\r\n", __func__);
    Os_Disable_Millisecond();
    Os_Clear_Millisecond();
    STANDBY();
};

void EL1_Undefined_Handler(void)
{
    int32_t func_ptr;
    *(volatile unsigned int *)(UART_0_BASE) = ('E');
    *(volatile unsigned int *)(UART_0_BASE) = ('L');
    *(volatile unsigned int *)(UART_0_BASE) = ('1');
    *(volatile unsigned int *)(UART_0_BASE) = ('_');
    *(volatile unsigned int *)(UART_0_BASE) = ('U');
    *(volatile unsigned int *)(UART_0_BASE) = ('n');
    *(volatile unsigned int *)(UART_0_BASE) = ('d');
    *(volatile unsigned int *)(UART_0_BASE) = ('e');
    *(volatile unsigned int *)(UART_0_BASE) = ('f');
    *(volatile unsigned int *)(UART_0_BASE) = ('i');
    *(volatile unsigned int *)(UART_0_BASE) = ('n');
    *(volatile unsigned int *)(UART_0_BASE) = ('e');
    *(volatile unsigned int *)(UART_0_BASE) = ('d');
    *(volatile unsigned int *)(UART_0_BASE) = ('_');
    *(volatile unsigned int *)(UART_0_BASE) = ('H');
    *(volatile unsigned int *)(UART_0_BASE) = ('a');
    *(volatile unsigned int *)(UART_0_BASE) = ('n');
    *(volatile unsigned int *)(UART_0_BASE) = ('d');
    *(volatile unsigned int *)(UART_0_BASE) = ('l');
    *(volatile unsigned int *)(UART_0_BASE) = ('e');
    *(volatile unsigned int *)(UART_0_BASE) = ('r');
    *(volatile unsigned int *)(UART_0_BASE) = ('\r');
    *(volatile unsigned int *)(UART_0_BASE) = ('\n');
    LogSync("os enter %s!\r\n", __func__);
    exception_on = 1;

    func_ptr = &S100_Exception_Handler;
    __asm volatile (
        "mov lr, %[func_ptr]\t"
        :
        : [func_ptr] "r" ((uintptr_t)func_ptr)
        : "lr"
    );

    __asm volatile ("ERET");
}
```
## MCU1 main 函数简介
main 函数是进入系统后的关键代码，下述代码也是 MCU1正常启动的关键，请勿随意删除相关代码，删除可能会导致启动异常。
<DocScope products="RDK S100">
```c
int main(void)
{
    Ipc_MainPowerUp = TRUE;   /* IPC 上电标志，MCU1默认上电，因为在MCU0已上电 */
    PpsIcu_Irq_Init();        /* PPS相关中断配置为边沿触发函数 */
    Uart_Init();              /* UART串口初始化，debug用 */
    Log_Init();               /* log串口初始化，初始化后可在Acore获取相应mcu log信息 */
    #ifdef SHELL_ENABLE
    Shell_Init();             /* shell命令初始化，通过SHELL_ENABLE宏进行开关 */
    #endif
    Version_into_AonSram();   /* 获取mcu版本信息，初始化后可在Acore获取相应mcu version信息 */
    LogSync("MCU FreeRtos Lite Init Success!\r\n");
    FreeRtos_Irq_Init();      /* FreeRtos 中断初始化 */
    FreeRtos_Task_Init();     /* FreeRtos 任务初始化以及调度启动 */
    for(;;){};
}
```
</DocScope>
<DocScope products="RDK S600">

```c
int main(void)
{
    unsigned long core_id = GetCurrentCoreID(); /* 获取当前cluster工作的core id */
    if (core_id == 0) {             /* core0执行逻辑 */
        Ipc_MainPowerUp = TRUE;     /* IPC 上电标志，MCU1默认上电，因为在MCU0已上电 */
        Disable_AonTimer();         /* 关闭aon的timer */
        Can2Atcm_Init();            /* 搬运Can相关数据代码到Atcm上 */
        PpsIcu_Irq_Init();          /* PPS相关中断配置为边沿触发函数 */
        Uart_Init();                /* UART串口初始化，debug用 */
        Log_Init();                 /* log串口初始化，初始化后可在Acore获取相应mcu log信息 */
        #if (SHELL_ENABLE)
        Shell_Init();               /* shell命令初始化，通过SHELL_ENABLE宏进行开关 */
        #endif
        Version_into_AonSram();     /* 获取mcu版本信息，初始化后可在Acore获取相应mcu version信息 */
        LogSync("MCU1 FreeRtos Lite Init Success!\r\n");
        uint32_t gicr1_waker_addr = 0x22120014; /* 只保留WAKER寄存器的 bit3 和 bit0，并写回清除其余控制位 */
        uint32_t current_value, target_value;
        current_value = *(volatile uint32_t *)(gicr1_waker_addr);
        target_value = current_value & 0x9;
        *(volatile uint32_t *)(gicr1_waker_addr) = target_value;
        FreeRtos_Irq_Init();         /* FreeRtos 中断初始化 */
        SetCanInterruptAffinity(1);  /* 设置can中断亲和性，绑定到core1运行 */
        SetIPCInterruptAffinity(1);  /* 设置ipc中断亲和性，绑定到core1运行 */
        FreeRtos_Task_Init();        /* FreeRtos 任务初始化以及调度启动 */

        for(;;){};
   } else if (core_id == 1) {         /* core1执行逻辑 */
        Os_Enable_Can1_DataIsr();     /* 使能Can1-10中断 */
        Os_Enable_Can2_DataIsr();
        Os_Enable_Can3_DataIsr();
        Os_Enable_Can4_DataIsr();
        Os_Enable_Can10_DataIsr();
        __asm__ volatile("cpsie i");  /* 使能 IRQ 中断 */
        __asm__ volatile("cpsie f");  /* 使能 FIQ 中断 */
        while(1) {
            __asm__ volatile("wfe");  /* 空闲时进入低功耗wfe状态 */
        }
        for(;;){};
   }
}
```

</DocScope>

## MCU Log 简介{#mcu-log-intro}

MCU 提供了基础的日志（Log）输出功能，主要用于调试与运行状态记录。当前版本的 Log 模块支持通过格式化字符串的方式输出信息，便于开发者在调试过程中快速定位问题和查看变量状态。在 Acore 侧可通过`/proc/remoteproc_mcu0`和`/proc/remoteproc_mcu1`这两个节点可以查看 MCU0和 MCU1的日志信息。

以获取 MCU1串口 log 信息为例，如下图所示：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/log2.png" alt="" style={{ width: '100%' }} />

目前，MCU Log 支持的格式化输出类型包括：
- %s —— 字符串
- %d —— 十进制有符号整数
- %u —— 十进制无符号整数
- %x —— 十六进制小写格式
- %X —— 十六进制大写格式
- %c —— 单个字符

除以上类型外的其他格式化输出暂不支持，后续版本将逐步扩展更多的数据类型与格式支持，以满足更丰富的调试需求。
