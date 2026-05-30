---
sidebar_position: 1
---

# 7.5.2 MCU Quick Start Guide

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## Scope

This section provides an overview of the MCU system, aimed at helping readers quickly understand and master the relevant content to facilitate the development of MCU1. Since MCU0 is responsible for booting Acore, MCU1, and power management, it is not recommended for customers to modify this part. The source code is not released by default, and a verified bin file from Dijia is provided. This section only briefly explains potential conflicts with MCU1, aiming to help users avoid resource contention issues between MCU0 and MCU1 during development.

## Basic Information

1. The MCU compilation toolchain is the GCC toolchain, version gcc-arm-none-eabi-10.3~2021.10.
2. The MCU core is ARM R52+, and the ARM R52 technical reference manual can be used as a reference: [Official Link](https://developer.arm.com/documentation/100026/latest)
3. The operating system running on the MCU is FreeRTOS, version FreeRTOS Kernel V10.0.1.
4. The MCU is mainly divided into two parts: MCU0 and MCU1. MCU0 is responsible for booting Acore, MCU1, and power management, and is currently not open-source. MCU1 is responsible for running business functions and is open-source, allowing customers to modify it according to their needs.

## MCU Framework

<DocScope products="RDK S100">
MCU0 is the starting point for booting the board and is of utmost importance. MCU0 is responsible for booting Acore, MCU1, and power management. The Linux operating system running on Acore is a critical platform for customer development, while the FreeRTOS operating system running on MCU1 ensures real-time task execution.
MCU1 is implemented using Linux's remoteproc framework. Through Acore's sysfs, notifications are sent to MCU0 to control the startup and shutdown of MCU1. Additionally, during the sleep mode of the RDK-S100, Acore notifies MCU0 to operate MCU1, enabling low-power sleep functionality.
</DocScope>
<DocScope products="RDK S600">
MCU0 is the starting point for booting the board and is of utmost importance. MCU0 is responsible for booting Acore, MCU1, and power management. The Linux operating system running on Acore is a critical platform for customer development, while the FreeRTOS operating system running on MCU1 ensures real-time task execution.
MCU1 is implemented using Linux's remoteproc framework. Through Acore's sysfs, notifications are sent to MCU0 to control the startup and shutdown of MCU1. Additionally, during the sleep mode of the RDK-S600, Acore notifies MCU0 to operate MCU1, enabling low-power sleep functionality.
</DocScope>
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_frame-en.jpg" alt="" style={{ width: '100%' }} />

## Development Environment
Cross-compilation refers to developing and building software on a host machine and then deploying the built software to run on the development board. Host machines generally have higher performance and more memory than development boards, enabling efficient code building and the installation of more development tools.

### Host Compilation Environment Requirements

It is recommended to use the Ubuntu 22.04 operating system to maintain the same system version as the RDK S100, reducing dependency issues caused by version differences.

Install the following software packages on Ubuntu 22.04:

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

## Compiling the MCU System

1. Compilation uses python3, and the version of python3 used for RDK S100 development is 3.8.10.
2. The MCU1 image comes in two versions: debug and release. The debug version includes debugging information, while the release version does not.

:::info Toolchain Download Instructions

The first compilation will download the toolchain from the ARM official website and decompress it (about 10 minutes). Poor network conditions may cause the toolchain download to fail or be incomplete. It is recommended to download the compilation toolchain using the following method:
1. Click the [Toolchain Download Link](../../01_Quick_start/download.md#tool-download) to download the compilation toolchain.
2. Move the existing toolchain to /Build/ToolChain/Gcc/. Use the following command to move the toolchain:

    `mv path to toolchain/toolchain-filename path to new code/Build/ToolChain/Gcc/`

3. During compilation, if the toolchain is detected, it will not be downloaded from the official website again.

:::

<DocScope products="RDK S100">
```shell
# Compile MCU1 Debug version
cd mcu/Build/FreeRtos_mcu1
python build_freertos.py lite matrix B s100 mcu1 gcc debug
*/

# Compile MCU1 Release version
cd mcu/Build/FreeRtos_mcu1
python build_freertos.py lite matrix B s100 mcu1 gcc release
```
</DocScope>
<DocScope products="RDK S600">

```shell
# Compile MCU1 Debug version
cd mcu/Build/FreeRtos_mcu1
python build_freertos.py lite matrix B s600 gcc mcu1 debug

# Compile MCU1 Release version
cd mcu/Build/FreeRtos_mcu1
python build_freertos.py lite matrix B s600 gcc mcu1 release
```
</DocScope>

## Compilation Success Indicator
<DocScope products="RDK S100">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/build_success.png" alt="" style={{ width: '100%' }} />
</DocScope>
<DocScope products="RDK S600">
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/02_S600/01_basic_information/build_success.jpg" alt="" style={{ width: '100%' }} />
</DocScope>

### Compilation Output Directory

<DocScope products="RDK S100">

```c
output/
├── debug                               # This folder contains the compiled files for the debug version
|    ├── objs                           # i/s/o files generated during compilation
|    └── S100_MCU_SIP_V2.0              # bin/map/elf files generated during compilation
|         ├── custom_compiler_flags.py
|         ├── S100_MCU_DEBUG.elf        # MCU1 boot file
|         ├── S100_MCU_DEBUG.map
|         ├── S100_MCU_SIP_V2.0.bin
├── objs                                # i/s/o files generated during compilation, varies by version
├── release                             # This folder contains the compiled files for the release version
|    ├── objs                           # i/s/o files generated during compilation
|    └── S100_MCU_SIP_V2.0              # bin/map/elf files generated during compilation
```
</DocScope>
<DocScope products="RDK S600">

```c
output/
├── debug                               # This folder contains the compiled files for the debug version
|    ├── objs                           # i/s/o files generated during compilation
|    └── S600_MCU_Matrix_V2.0           # bin/map/elf files generated during compilation
|         ├── S600_MCU_RAW.bin
|         ├── S600_MCU_DEBUG.elf        # MCU1 boot file
|         ├── S600_MCU_DEBUG.map
|         ├── S600_MCU_Matrix_V2.0.bin
├── objs                                # i/s/o files generated during compilation, varies by version
├── release                             # This folder contains the compiled files for the release version
|    ├── objs                           # i/s/o files generated during compilation
|    └── S600_MCU_Matrix_V2.0           # bin/map/elf files generated during compilation
```
</DocScope>

## MCU1 Startup/Shutdown Process
The startup/shutdown of MCU1 is achieved by Acore passing information to MCU0 via the remoteproc framework, which then starts/shuts down MCU1.
### MCU1 Startup Principle and Steps{#start_mcu1}
#### MCU1 Startup Principle

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/mcu1_start-en.jpg" alt="" style={{ width: '100%' }} />

#### MCU1 Startup Steps
The following startup process uses the debug version as an example. The release version is similar, with fewer log prints.

<DocScope products="RDK S100">
1. After the compilation process described above, compiling the debug version will generate the S100_MCU_DEBUG.elf file in the S100_MCU_SIP_V2.0 folder (similar for the release version). This file is the firmware file for MCU1, so it needs to be pushed to the /lib/firmware directory on the board.
</DocScope>
<DocScope products="RDK S600">
1. After the compilation process described above, compiling the debug version will generate the S600_MCU_DEBUG.elf file in the S600_MCU_Matrix_V2.0 folder (similar for the release version). This file is the firmware file for MCU1, so it needs to be pushed to the /lib/firmware directory on the board.
</DocScope>
Example: (The screenshots in this and subsequent steps use S100 as an example; S600 is similar)

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/push_elf.png" alt="" style={{ width: '100%' }} />

2. Board-side startup process
```c
cd /sys/class/remoteproc/remoteproc_mcu0
echo S100_MCU_DEBUG.elf > firmware
echo start > state
```
After successful startup, the serial log prints as shown below.
Acore-side serial print

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/Acore_start_log.png" alt="" style={{ width: '100%' }} />

MCU-side serial print

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_start_log.png" alt="" style={{ width: '100%' }} />

### MCU1 Shutdown Principle and Steps

#### MCU1 Shutdown Principle

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/mcu1_stop-en.jpg" alt="" style={{ width: '100%' }} />

#### MCU1 Shutdown Steps
The following shutdown process uses the debug version as an example. The release version is similar, with fewer log prints.
(The following examples use S100 as an example; S600 is similar)
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
After successful shutdown, the serial log prints as shown below.
Acore-side serial print

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/Acore_stop_log.png" alt="" style={{ width: '100%' }} />

MCU-side serial print

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_stop_log.png" alt="" style={{ width: '100%' }} />

:::caution
After stopping MCU1, if you need to restart MCU1, you must wait for the system to enter wfi mode before starting MCU1 again, as shown in the figure below. Reason: To avoid the situation where starting MCU1 before the system enters wfi mode reloads the firmware to the MCU SRAM location, overwriting the previous code and causing the system to crash.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/mcu1_enter_wfi.png" alt="" style={{ width: '100%' }} />
:::

## MCU0/MCU1 Module Division
The entire MCU system includes modules such as ICU, RTC, IPC, port, and CAN. However, for user development convenience, the functions have been divided as shown in the figure below.
<DocScope products="RDK S100">
| Module   | Module Location     |
|----------|---------------------|
| ppslcu   | MCU0                |
| port     | MCU0                |
| uart     | MCU0/MCU1           |
| log      | MCU0/MCU1           |
| shell_init | MCU0/MCU1          |
| mDma     | MCU0/MCU1           |
| I2c      | MCU0: i2c6, i2c7 / MCU1: i2c8, i2c9 |
| tca9539  | MCU0                |
| ICU      | MCU0                |
| GPT      | MCU0                |
| pmic     | MCU0                |
| fls_init | MCU0                |
| otaflash | MCU0                |
| ipc      | MCU0: instance8 / MCU1: instance0 (other instances not divided, all available) |
| crypto   | MCU0                |
| pvt      | MCU0                |
| canGW    | MCU1                |
| Rtc      | MCU0                |
| RTC_pps  | MCU0                |
| Eth_Init | MCU1                |
| Scmi     | MCU0                |
</DocScope>
<DocScope products="RDK S600">
| Module   | Module Location     |
|----------|---------------------|
| ppslcu   | MCU0                |
| port     | MCU0                |
| uart     | MCU0/MCU1           |
| log      | MCU0/MCU1           |
| shell_init | MCU0/MCU1          |
| mDma     | MCU0/MCU1           |
| I2c      | MCU0/MCU1           |
| tca9539  | MCU0                |
| ICU      | MCU0                |
| GPT      | MCU0                |
| pmic     | MCU0                |
| fls_init | MCU0                |
| otaflash | MCU0                |
| ipc      | MCU0: instance8 / MCU1: instance0 |
| crypto   | MCU0                |
| pvt      | MCU0                |
| Rtc      | MCU0                |
| RTC_pps  | MCU0                |
| Eth_Init | MCU1                |
| Scmi     | MCU0                |
| Can      | MCU1: Can1, Can2, Can3, Can4, Can10 |
</DocScope>
## Debug Functions of MCU on sysfs
The MCU currently supports viewing system status (alive), system uptime (taskcounter), MCU version (mcu_version), SBL version (sbl_version), and other functions on sysfs.
1. System status (alive): Indicates the status of MCU0/MCU1, which can be either alive or dead. The MCU alive status updates every 1 second, so there is a 1-second delay when retrieving the status.
2. System uptime (taskcounter): Indicates the time elapsed since the MCU started, in seconds.
3. MCU version (mcu_version): Displays MCU version information, including whether it is a debug or release version and the compilation time.
4. SBL version (sbl_version): Displays SBL version information and compilation time, but can only be viewed under remoteproc_mcu0.
5. MCU cpuloads: Provides information such as the task status, priority, remaining stack, execution count (FreeRTOS tick count), and usage rate for each task on MCU0/MCU1, helping users debug. Retrieving cpuloads data requires a 1-second delay because it involves copying a large amount of data to the output buffer under the sysfs file system. Cpuloads can only be retrieved when MCU0/MCU1 are powered on.
6. Firmware name (firmware): The firmware name used by MCU0 to start MCU1 under the remoteproc framework. When MCU0 starts MCU1, Linux looks for the corresponding file in the /lib/firmware directory on the board and loads it to the appropriate location.
7. Node name (name): For example, mcu0 corresponds to soc:remoteproc_mcu0, and mcu1 corresponds to soc:remoteproc_mcu1.
8. Status (state): Refers to the status of the remoteproc subsystem. Starting MCU1 changes the status of the MCU0 remoteproc node to running. When MCU1 is not started, the status is offline.
9. Recovery node: Indicates whether coredump register information can be retrieved if the MCU crashes. This feature is enabled by default. For more information, refer to the [MCU Ramdump section](./13_mcu_ramdump.md).
10. Uevent node: Indicates the device type, which is DEVTYPE=remoteproc.
11. Timesync node: Required for synchronizing the time between master and slave devices. The MCU does not support this feature.

:::info The information in the images may vary with version updates. The examples in this document are for reference only.
:::
1. System status (alive), as shown:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/alive_state.png" alt="" style={{ width: '100%' }} />

2. System uptime (taskcounter), as shown:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/taskcounter_state.png" alt="" style={{ width: '100%' }} />

3. MCU version (mcu_version), as shown:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/mcu_version.png" alt="" style={{ width: '100%' }} />

4. SBL version (sbl_version), as shown:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/sbl_version.png" alt="" style={{ width: '100%' }} />

5. Retrieving MCU serial log, as shown:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/log.png" alt="" style={{ width: '100%' }} />

6. Retrieving MCU cpuloads, as shown:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/cpuload.jpg" alt="" style={{ width: '100%' }} />

## MCU Serial Port Usage

<DocScope products="RDK S100">
If the RDK-S100 has the following connection method, the MCU serial port and the Acore serial port share one serial port. Check: Device Manager -> Ports -> MCU-COM -> Baud rate 921600.
</DocScope>
<DocScope products="RDK S600">
If the RDK-S600 has the following connection method, the MCU serial port and the Acore serial port share one serial port. Check: Device Manager -> Ports -> MCU-COM -> Baud rate 921600.
</DocScope>

<DocScope products="RDK S100">
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_COM1.jpg" alt="" style={{ width: '100%' }} />
</DocScope>
<DocScope products="RDK S600">
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/02_S600/01_basic_information/S600_SerialCOM.jpg" alt="" style={{ width: '100%' }} />
</DocScope>

## MCU0 Flashing Process
### Manual Flashing
#### Non-Empty Board Flashing
1. Power on the board, press and hold Enter on the Acore serial port to enter uboot (must keep pressing).
```c
fastboot 0
```
2. Locate the corresponding MCU0 image in the compiled MCU0 image directory /output_sysmcu/ (MCU0 code is only provided in the commercial version). This example uses the S100 MCU0 image.
```c
fastboot oem interface:mtd
/* Compiled S100 MCU0 image: MCU_S100_SIP_V2.0.img */
/* Compiled S600 MCU0 image: MCU_S600_Matrix_V2.0.img*/
fastboot flash MCU_a "xxx/MCU_S100_SIP_V2.0.img"
fastboot flash MCU_b "xxx/MCU_S100_SIP_V2.0.img"
```

#### Empty Board Flashing
**For empty board flashing, use the Xburn tool to flash a specific area and specify `miniboot_flash`.**

<DocScope products="RDK S100">

For information on using the Xburn tool to flash a specific area, refer to the [Flashing a Specific Area](../../01_Quick_start/02_install_os/rdk_s100/03_xburn/01_windows.md#flashing-specific-partitions) section.

</DocScope>
<DocScope products="RDK S600">

For information on using the Xburn tool to flash a specific area, refer to the [Flashing a Specific Area](../../01_Quick_start/02_install_os/rdk_s600.md#designated-area-flashing) section.

</DocScope>

## MCU1 Undefined/Abort Exception Handling Principle

<DocScope products="RDK S100">

Under normal circumstances, when the system encounters an undefined/abort exception, it eventually enters an infinite loop. Only by re-executing the power-on/power-off process can it return to normal operation. Since the RDK-S100 cannot power on/off MCU1 independently, system process modifications are required to achieve the desired outcome.
</DocScope>
<DocScope products="RDK S600">
Under normal circumstances, when the system encounters an undefined/abort exception, it eventually enters an infinite loop. Only by re-executing the power-on/power-off process can it return to normal operation. Since the RDK-S600 cannot power on/off MCU1 independently, system process modifications are required to achieve the desired outcome.
</DocScope>
Specific principle: When an undefined/abort exception occurs, it eventually enters an infinite loop. Through Acore's sysfs, MCU1 is software-powered off, i.e., notified to enter wfi mode. The next time it is started, MCU1 will reboot via software, achieving the desired outcome.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_exception-en.jpg" alt="" style={{ width: '100%' }} />

The following uses the S100 Undefined exception as an example; the S600 is similar (only the prefix of related function names is S600). When an Undefined exception occurs, the UART serial port outputs the log "EL1_Undefined_Handler" and eventually enters the S100_Exception_Handler function, where it enters an infinite loop based on the exception_on variable. When Acore stops MCU1 via the remoteproc framework, an inter-core interrupt modifies the exception_on variable, shuts down the periodic tick interrupt, and enters WFI mode (STANDBY mode):
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
## Introduction to the MCU1 main Function
The main function is the key code after entering the system. The following code is also critical for the normal startup of MCU1. Do not delete related code arbitrarily, as it may cause startup exceptions.
<DocScope products="RDK S100">
```c
int main(void)
{
    Ipc_MainPowerUp = TRUE;   /* IPC power-on flag, MCU1 is powered on by default because MCU0 is already powered on */
    PpsIcu_Irq_Init();        /* Configure PPS-related interrupts as edge-triggered functions */
    Uart_Init();              /* Initialize UART serial port for debugging */
    Log_Init();               /* Initialize log serial port, allowing Acore to retrieve MCU log information after initialization */
    #ifdef SHELL_ENABLE
    Shell_Init();             /* Initialize shell commands, toggled by the SHELL_ENABLE macro */
    #endif
    Version_into_AonSram();   /* Retrieve MCU version information, allowing Acore to retrieve MCU version information after initialization */
    LogSync("MCU FreeRtos Lite Init Success!\r\n");
    FreeRtos_Irq_Init();      /* Initialize FreeRTOS interrupts */
    FreeRtos_Task_Init();     /* Initialize FreeRTOS tasks and start scheduling */
    for(;;){};
}
```
</DocScope>
<DocScope products="RDK S600">

```c
int main(void)
{
    unsigned long core_id = GetCurrentCoreID(); /* Get the core ID of the current cluster */
    if (core_id == 0) {             /* Core 0 execution logic */
        Ipc_MainPowerUp = TRUE;     /* IPC power-on flag, MCU1 is powered on by default because MCU0 is already powered on */
        Disable_AonTimer();         /* Disable the AON timer */
        Can2Atcm_Init();            /* Move CAN-related data code to ATCM */
        PpsIcu_Irq_Init();          /* Configure PPS-related interrupts as edge-triggered functions */
        Uart_Init();                /* Initialize UART serial port for debugging */
        Log_Init();                 /* Initialize log serial port, allowing Acore to retrieve MCU log information after initialization */
        #if (SHELL_ENABLE)
        Shell_Init();               /* Initialize shell commands, toggled by the SHELL_ENABLE macro */
        #endif
        Version_into_AonSram();     /* Retrieve MCU version information, allowing Acore to retrieve MCU version information after initialization */
        LogSync("MCU1 FreeRtos Lite Init Success!\r\n");
        uint32_t gicr1_waker_addr = 0x22120014; /* Keep only bit3 and bit0 of the WAKER register, clear other control bits */
        uint32_t current_value, target_value;
        current_value = *(volatile uint32_t *)(gicr1_waker_addr);
        target_value = current_value & 0x9;
        *(volatile uint32_t *)(gicr1_waker_addr) = target_value;
        FreeRtos_Irq_Init();         /* Initialize FreeRTOS interrupts */
        SetCanInterruptAffinity(1);  /* Set CAN interrupt affinity to core 1 */
        SetIPCInterruptAffinity(1);  /* Set IPC interrupt affinity to core 1 */
        FreeRtos_Task_Init();        /* Initialize FreeRTOS tasks and start scheduling */

        for(;;){};
   } else if (core_id == 1) {         /* Core 1 execution logic */
        Os_Enable_Can1_DataIsr();     /* Enable Can1-10 interrupts */
        Os_Enable_Can2_DataIsr();
        Os_Enable_Can3_DataIsr();
        Os_Enable_Can4_DataIsr();
        Os_Enable_Can10_DataIsr();
        __asm__ volatile("cpsie i");  /* Enable IRQ interrupts */
        __asm__ volatile("cpsie f");  /* Enable FIQ interrupts */
        while(1) {
            __asm__ volatile("wfe");  /* Enter low-power WFE state when idle */
        }
        for(;;){};
   }
}
```

</DocScope>

## Introduction to MCU Log

The MCU provides basic log output functionality, primarily for debugging and recording runtime status. The current version of the log module supports outputting information via formatted strings, making it easier for developers to quickly locate issues and view variable states during debugging. On the Acore side, log information for MCU0 and MCU1 can be viewed through the `/proc/remoteproc_mcu0` and `/proc/remoteproc_mcu1` nodes.

Example of retrieving MCU1 serial log information, as shown below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/log2.png" alt="" style={{ width: '100%' }} />

Currently, the MCU Log supports the following formatted output types:
- %s — String
- %d — Decimal signed integer
- %u — Decimal unsigned integer
- %x — Hexadecimal lowercase format
- %X — Hexadecimal uppercase format
- %c — Single character

Other formatted output types are not supported at this time. Future versions will gradually expand support for more data types and formats to meet richer debugging needs.