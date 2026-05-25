---
sidebar_position: 07
---

# 7.7 VDSP Development Guide

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

:::warning
**The S600 includes two VDSP cores. The VDSP1 descriptions below are supported on S600 only!**
:::

## Basic Debugging Guide

### CPU-side Development

#### Image Load and Unload

All VDSP cores share one Firmware image; the default name is vdsp0. The second VDSP core (VDSP1, on dual-core platforms such as S600 only) is functionally identical to VDSP0: you set the FW name through remoteproc nodes, load/unload it, and read version and running status through nodes such as `version` and `state`. The only difference is the sysfs node name `remoteproc_vdsp1` (and the instance number in start/stop, log, and other paths described in the sections below). The system does not start VDSP FW (Firmware) by default at boot; users must load and unload FW manually with commands as shown below:

``` shell
echo -n <firmware_path> > /sys/module/firmware_class/parameters/path

# Set VDSP0 FW name:
echo <firmware_name> > /sys/class/remoteproc/remoteproc_vdsp0/firmware
# Load VDSP0 FW:
echo start > /sys/class/remoteproc/remoteproc_vdsp0/state
# Unload VDSP0 FW:
echo stop > /sys/class/remoteproc/remoteproc_vdsp0/state

# Set VDSP1 FW name:
echo <firmware_name> > /sys/class/remoteproc/remoteproc_vdsp1/firmware
# Load VDSP1 FW:
echo start > /sys/class/remoteproc/remoteproc_vdsp1/state
# Unload VDSP1 FW:
echo stop > /sys/class/remoteproc/remoteproc_vdsp1/state
```

Users can change the FW path with the following command (**must be an absolute path**):

``` shell
echo -n <firmware_path> > /sys/module/firmware_class/parameters/path
```

Users can adjust the FW name before loading:

``` shell
# VDSP0
echo <firmware_name> > /sys/class/remoteproc/remoteproc_vdsp0/firmware

# VDSP1
echo <firmware_name> > /sys/class/remoteproc/remoteproc_vdsp1/firmware
```

To auto-load the VDSP image after kernel boot, modify the original image and configure init.rc so the init process loads the VDSP image automatically.

``` shell
# First copy the built FW image (e.g. vdsp0) to /userdata
echo -n <firmware_path> > /sys/module/firmware_class/parameters/path
# VDSP0
echo <firmware_name> > /sys/class/remoteproc/remoteproc_vdsp0/firmware
echo start > /sys/class/remoteproc/remoteproc_vdsp0/state

# VDSP1
echo <firmware_name> > /sys/class/remoteproc/remoteproc_vdsp1/firmware
echo start > /sys/class/remoteproc/remoteproc_vdsp1/state
```

**View FW Version**

``` shell
# S100 VDSP0
cat /sys/class/remoteproc/remoteproc_vdsp0/version # for vdsp0
# S600 VDSP1 (same as VDSP0; only the node differs)
cat /sys/class/remoteproc/remoteproc_vdsp1/version # for vdsp1
```

**View VDSP Running Status**

``` shell
# running means loaded; offline means not loaded
# S100 VDSP0
cat /sys/class/remoteproc/remoteproc_vdsp0/state # for vdsp0
# S600 VDSP1 (same as VDSP0; only the node differs)
cat /sys/class/remoteproc/remoteproc_vdsp1/state # for vdsp1
```

**Heartbeat Monitoring**

Disabled by default. Use the following commands to enable or disable it. Heartbeat monitoring sends every 100 ms; if 7 consecutive heartbeats are lost, a diagnostic is reported and VDSP is reset.

``` shell
# Enable heartbeat monitoring
echo Y > /sys/module/hobot_remoteproc/parameters/heartbeat_enable
# Disable heartbeat monitoring
echo N > /sys/module/hobot_remoteproc/parameters/heartbeat_enable
```

#### Operating VDSP via Function APIs

Load the DSP program through the libvdsp.so shared library to load, start, stop, reset, and query DSP status. For API details, see
[VDSP Boot/Stop Control APIs](#vdsp_boot_api).

#### Message Connection and Sending

Currently users can only use system-predefined service names. Available service names are listed below:

| VDSP   | Service Name                                                      | Purpose                                   | Must Be Started          | Started by Default on VDSP Side |
| ------ | --------------------------------------------------------- | ------------------------------------ | --------------- | ------------ |
| DSP0/1 | dcore0_device_op/dcore1_device_op                     | Internal system software debug control for the DSP; already used by system software; users cannot register or use it again | Yes               | Yes            |
| DSP0/1 | dcore0_acore_heart/dcore1_acore_heart                 | Used for heartbeat; currently unused; users may repurpose it               | No               | No            |
| DSP0/1 | dcore0_rpmsg_bpu/dcore1_rpmsg_bpu                     | BPU-related control; currently unused; users may repurpose it             | No               | No            |
| DSP0/1 | dcore0_rpmsg_op/dcore1_rpmsg_op                       | Toolchain operator-related control; currently unused; users may repurpose it           | No               | No            |

Available APIs are listed below:

| API                            | Function   | Header File          | Library         |
| ----------------------------- | ---- | ------------ | ----------- |
| hb_rpmsg_connect_server    | Connect to service | rpmsg_lib.h | librpmsg.so |
| hb_rpmsg_disconnect_server | Disconnect from service | rpmsg_lib.h | librpmsg.so |
| hb_rpmsg_send               | Send message | rpmsg_lib.h | librpmsg.so |
| hb_rpmsg_recv               | Receive message | rpmsg_lib.h | librpmsg.so |

Concurrent receive or send from multiple processes or threads on the same service channel is not supported.

#### Heap-related Development

VDSP provides dynamic heap allocation and release APIs, supports custom memory alignment, and supports querying current heap status. When the VDSP side needs dynamic heap allocation, use the following APIs.

| **API**                      | **Function**             | **Header File**            |
| --------------------------- | ------------------ | -------------------- |
| hb_mem_heap_initialize   | Initialize memory allocator APIs  | hb_mem_allocator.h |
| hb_mem_heap_deinitialize | Deinitialize memory allocator APIs | hb_mem_allocator.h |
| hb_mem_heap_alloc        | Allocate heap space           | hb_mem_allocator.h |
| hb_mem_heap_free         | Free allocated heap space       | hb_mem_allocator.h |
| hb_mem_heap_get_status  | Get current heap status         | hb_mem_allocator.h |

### VDSP-side Development

Follow these steps to obtain the source code:

``` shell
(1) Obtain the release package and verify that VDSP source code is included after extraction. If not, contact D-Robotics personnel.
(2) VDSP source code is available under the vdsp path.
```

#### Linux Environment Setup

:::tip
Obtain the build package to set up the build environment. Contact D-Robotics personnel to obtain the build package.

This document only describes Linux environment setup and build instructions. For debugging documentation in Xplorer mentioned in this document, contact D-Robotics personnel.
:::

Command to install the build package in Linux:

``` shell
tar -zxvf Vision_Q8_linux.tgz \
   && mv RI-2023.11-linux/Vision_Q8/ /opt/xtensa/XtDevTools/install/builds/RI-2023.11-linux/ \
   && rm -rf RI-2023.11-linux

/opt/xtensa/XtDevTools/install/builds/RI-2023.11-linux/Vision_Q8/install --xtensa-tools \
   /opt/xtensa/XtDevTools/install/tools/RI-2023.11-linux/XtensaTools/
```

#### Build

After obtaining the source code, build as follows:

``` shell
(1) cd vdsp_fw
(2) bash make.sh
```

Static libraries are generated in the library directory

``` shell
library/libvdsp0.a
```

Binary images are generated in the samples directory

``` shell
samples/{subdir}/vdsp0
```

### Debugging Guide

#### Viewing Logs

VDSP FW logs are output through the serial port.

Note that VDSP FW shares a serial port with other modules such as BL31 and OP-TEE. Excessive VDSP FW logging may block log output from those modules and trigger the watchdog.
VDSP FW logs and kernel logs are both output to the serial port and may interfere with each other. Users can reduce the kernel log level to avoid interference:

``` shell
echo 0 > /proc/sys/kernel/printk
```

When no serial port is available, users can log in to the board via SSH. The hrut_remoteproc_log service starts by default in the background:

``` shell
# Default startup command for VDSP0 at boot; log path: /log/dsp0/message
hrut_remoteproc_log -b /sys/class/remoteproc/remoteproc_vdsp0/log -f /log/dsp0/message -r 2048 -n 200
# VDSP1 (same usage as VDSP0; only the remoteproc node and log path change to dsp1)
hrut_remoteproc_log -b /sys/class/remoteproc/remoteproc_vdsp1/log -f /log/dsp1/message -r 2048 -n 200
```

VDSP FW logs are also written to shared memory and stored in the file system by the CPU-side log service. Users can view logs from the following paths, but note that these logs are not real-time.

``` shell
# VDSP0 log paths:
/log/dsp0/message
/log/dsp0/archive/
# VDSP1 log paths:
/log/dsp1/message
/log/dsp1/archive/
# message is a temporary file; when full, logs are written to archive/. When the number of files in that directory reaches a threshold, older files are deleted
```

#### Log Print APIs

Using the printf API outputs logs through the serial port.

DSP_ERR, DSP_WARN, DSP_INFO, and DSP_DBG are recommended. In addition to serial output, these APIs write logs to shared memory, and the CPU-side log service stores them in the file system.

Notes for DSP_* APIs:

1. Header file: ``hb_vdsp_log.h``
2. Example usage. For example, when entering an error branch, use DSP_ERR: ``DSP_ERR("Input parameter invalid.\n");``

#### Viewing Thread Status

Use the following commands to view VDSP-side thread status in the serial port. Note that collecting and printing this data may affect VDSP performance.

Usage: first enable ``#define THREAD_STACK_CHECK (1)`` in code, then enable stack tracking before starting a new thread as shown below:

``` shell
(void)hb_enable_stack_track(dev_thread_stack, sizeof(dev_thread_stack)/sizeof(dev_thread_stack[0]));
# S100 VDSP0:
echo on > /sys/devices/virtual/misc/vdsp0/vdsp_ctrl/dspthread
echo off > /sys/devices/virtual/misc/vdsp0/vdsp_ctrl/dspthread
# S600 VDSP1 (same as VDSP0; only the misc device node is vdsp1):
echo on > /sys/devices/virtual/misc/vdsp1/vdsp_ctrl/dspthread
echo off > /sys/devices/virtual/misc/vdsp1/vdsp_ctrl/dspthread
```

#### Viewing Coredump

System software initialization related to coredump has two main parts: register exceptions and enable the watchdog.

``` shell
hb_wdt_on();
hb_enable_coredump();
```

The exception types currently handled by XOS are as follows:

``` shell
/*  EXCCAUSE register values:  */
/*  General Exception causes (Bits 3:0 of EXCCAUSE register)  */

/* No exception */
#define EXCCAUSE_NONE                   UINT32_C(0)
/* Instruction usage */
#define EXCCAUSE_INSTRUCTION            UINT32_C(1)
/* Addressing usage */
#define EXCCAUSE_ADDRESS                UINT32_C(2)
/* External causes */
#define EXCCAUSE_EXTERNAL               UINT32_C(3)
/* Debug exception */
#define EXCCAUSE_DEBUG                  UINT32_C(4)
/* Syscall exception */
#define EXCCAUSE_SYSCALL                UINT32_C(5)
/* Hardware failure */
#define EXCCAUSE_HARDWARE               UINT32_C(6)
/* Memory management */
#define EXCCAUSE_MEMORY                 UINT32_C(7)
/* Coprocessor */
#define EXCCAUSE_CP_DISABLED            UINT32_C(8)
/*  Reserved 9-15  */
```

Do not register exception handlers on VQ8 for exception causes 4 (debug exception), 5 (SYSCALL exception), or 8 (coprocessor exception); these are reserved for system use.
Note: causes 9~15 are reserved and should also be skipped.

Offline debugging procedure:
When VDSP coredumps, Acore writes all potentially used VDSP memory spaces (iram/dram0/dram1/reserved ddr) to the file system at the following path:

``` shell
# vdsp0 and vdsp1 use the same dump directory; dump file names are prefixed with vdsp0_* or vdsp1_* to distinguish instances
/log/coredump/
```

Create a restore.script.sh script. Set the paths of the four memory dump files according to your project layout, and copy the obtained CPU register values into the corresponding places in the script as shown below:

``` shell
python import thread_aware_rtos
python thread_aware_rtos.k.rtos_support.dump_analysis_mode = True
b main
run

restore vdsp0_ddr_2024-05-06-02-50-03.hex binary 0xf0000000
restore vdsp0_iram_2024-05-06-02-50-03.hex binary 0x08080000
restore vdsp0_dram0_2024-05-06-02-50-03.hex binary 0x08000000
restore vdsp0_dram1_2024-05-06-02-50-03.hex binary 0x08040000
# VDSP1: debugging steps are the same as VDSP0; replace the files above with the generated vdsp1_ddr_*.hex, vdsp1_iram_*.hex, etc.

set $ar0 = 0xf00502a8
set $ar1 = 0xf3fdded0
set $ar2 = 0xf3fddd00
set $ar3 = 0x34
set $ar4 = 0x1b
set $ar5 = 0x5d
set $ar6 = 0x53
set $ar7 = 0x58
set $ar8 = 0xf0050192
set $ar9 = 0xf3fddeb0
set $ar10 = 0x4f
set $ar11 = 0xf3fddd00
set $ar12 = 0x0
set $ar13 = 0xf3fddee0
set $ar14 = 0xf3fddce0
set $ar15 = 0xf3fddd1b
set $ar16 = 0xf0065978
set $ar17 = 0xf3fddb60
set $ar18 = 0x4f
set $ar19 = 0xf002bea4
set $ar20 = 0x0
set $ar21 = 0xffffffb1
set $ar22 = 0x4f
set $ar23 = 0xffffffff
set $ar24 = 0x808100f
set $ar25 = 0xf3fddf00
set $ar26 = 0xf3fddf10
set $ar27 = 0x53113
set $ar28 = 0xf0050280
set $ar29 = 0xffffffff
set $ar30 = 0x0
set $ar31 = 0xf3fddf70
set $ps = 0x68
set $wb = 0x40000311
set $pc = 0xf0050057
python thread_aware_rtos.k.rtos_support.XOS_initialized = True
```

Open the xt-gdb command line (Xplorer or command-line mode), then execute the following steps in order:

``` shell
xt-gdb vdsp0 (target file of the executable)
(xt-gdb) >> source restore.script.sh
(xt-gdb) >> run
ctrl+c // cancel execution
(xt-gdb) >> stepi
(xt-gdb) >> info threads
(xt-gdb) >> bt
```

Backtrace debug output looks like this:

``` shell
(xt-gdb) bt
#0  _RMCDump () at /vdsp/bsp_project/coredump/RegDump.S:90
#1  0xf0050192 in Exc_Dump_Regs () at bsp_project/coredump/Exc_Dump_Regs.c:110
#2  0xf00502a8 in dafault_exchandler (frame=0xf3fddf10) at bsp_project/coredump/coredump.c:125
#3  0x0808100f in _GeneralException (cause=..., exccause=...) at ./xos_vectors_xea3_v2.S
#4  0xf00504b8 in hb_platform_init () at bsp_project/driver/devcontrol/devcontrol.c:152
#5  0xf0030306 in main (argc=1, argv=0xf0073704) at main.c:68
```

#### Viewing Stack Usage

For Stack usage details, see the Xtensa® XOS Reference Manual: \<VDSP install path\>/xtensa/XtDevTools/downloads/\<version\>/docs/xos_rm.pdf.

#### MPU Configuration

The deployed MPU serves two main purposes: limit the address range VDSP can access (access beyond the allowed MPU range triggers a coredump), and configure address segment attributes. For details, see the Xtensa® System Software Reference Manual: \<VDSP install path\>/xtensa/XtDevTools/downloads/\<version\>/docs/xos_rm.pdf.

VDSP address mapping and MPU protection are shown below. Access outside the MPU-protected address range triggers a coredump.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/07_vdsp_development/image_2.png" alt="VDSP development diagram 2" style={{ width: '100%' }} />

The error log is shown below. Error address 0x0 indicates access to a disallowed address:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/07_vdsp_development/image_3.png" alt="VDSP development diagram 3" style={{ width: '100%' }} />

Current VDSP address attribute configuration includes three parts:

(1) ION space attribute: XTHAL_MEM_WRITEBACK

(2) Two shared memory regions: XTHAL_MEM_NON_CACHEABLE

(3) All other segments except (1) and (2): XTHAL_MEM_WRITEBACK

#### Cadence Documentation Location

After installing Xplorer, downloaded documentation is available at \<VDSP install path\>/xtensa/XtDevTools/downloads/RI-2023.11/docs.

### FAQ

#### How to Measure Elapsed Time on the VDSP Side?

Users can call gettimeofday() directly or use XT_RSR_CCOUNT() to read cycle counts and convert them to time. The former requires ``#include <sys/time.h>``. The latter is recommended for timing because it is more accurate. Avoid logging in latency-sensitive paths.

Users can also refer to the Xtensa® Software Development Toolkit User's Guide: \<VDSP install path\>/xtensa/XtDevTools/downloads/\<version\>/docs/sw_dev_toolkit_ug.pdf.

#### How to Modify the LSP?

(1) Copy an LSP template

(2) Edit memmap.xmm

(3) Regenerate memmap with: xt-genldscripts -b custom_lsp/q8-min-rt/

:::tip
If the XOS tool cannot find the toolchain during debugging, first confirm that the XOS build environment is set up.
If it is, configure the environment variable, for example: ``export PATH=$PATH:[*]/XtensaTools/bin``
:::

#### Start/Stop FW Load or Unload Fails on the CPU Side?

This may happen because the service was not started when stop was issued, or because the service was already started when start was issued.

#### How to Add User Threads on the VDSP Side?

Example code:

``` C
ret = xos_thread_create(&dev_thread_tcb, 0, dev_thread_func, 0, "dev_control", dev_thread_stack, STACK_SIZE_1, TRACE_THREAD_PRIO, 0, 0);
```

dev_thread_func is the thread entry function that implements user logic. dev_thread_stack points to the start of the thread stack (allocated by the user). STACK_SIZE_1 is the stack size. TRACE_THREAD_PRIO is the thread priority in the range 0~15; smaller values mean higher priority.

#### How to Get the Device ID on the VDSP Side?

Use xthal_get_prid().

#### Which Library Should Be Used for IDMA on the VDSP Side?

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/07_vdsp_development/image_5.png" alt="VDSP development diagram 5" style={{ width: '100%' }} />

Use libidma-os or libidma-debug-os because we use XOS.

#### Printing int64_t/uint64_t/float Variables Shows Incorrect Values?

If variables defined as int64_t/uint64_t/float print incorrect values but behave correctly in comparisons and other operations:

This happens because xtensa/xtutil.h replaces printf, vsnprintf, and similar functions with xt_printf and xt_vsnprintf. Comment out xtutil.h and use the native printf and vsnprintf APIs.

:::danger
Standard C library printf and similar functions cannot be used in interrupt handlers; doing so will hang the system.
:::

#### VDSP Hangs During Runtime

Check whether variable pointer addresses are aligned:

(1) int64_t * pointers must be 8-byte aligned

(2) int32_t * pointers must be 4-byte aligned

(3) int16_t * pointers must be 2-byte aligned

Confirm whether standard C library printf or similar functions are used in interrupt handlers; they are not supported.

#### Segment Overflow During SIM Soft Simulation

Modify the SIM xmm file at xtensa/xtensa/XtDevTools/install/builds/RI-2023.11-win32/Vision_Q8/xtensa-elf/lib/sim/memmap.xmm.
Increase the size of the overflowing segment, then open cmd in Xplorer:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/07_vdsp_development/image_6.png" alt="VDSP development diagram 6" style={{ width: '100%' }} />

Go to the xtensa-elf/lib path:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/07_vdsp_development/image_7.png" alt="VDSP development diagram 7" style={{ width: '100%' }} />

Run xt-genldscripts -b sim. The message below indicates success:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/07_vdsp_development/image_8.png" alt="VDSP development diagram 8" style={{ width: '100%' }} />

Rebuild the VDSP project and run SIM soft simulation again.

#### IDMA Transfer Stops Abnormally

If this happens, check whether a runtime limit is set in the IDMA init function. Set it to 0 to disable the time limit:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/07_vdsp_development/image_9.png" alt="VDSP development diagram 9" style={{ width: '100%' }} />

#### Windows-built Image Reports dcore0_rpmsg_op Server Not Started

Manually add CONFIG_TEST_CASE in Build Properties:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/07_vdsp_development/image_10.png" alt="VDSP development diagram 10" style={{ width: '100%' }} />

#### Thread Status Viewing Does Not Work When Total Threads Exceed 32

The thread dump implementation uses a default array size of 32 for thread information. Increase the array size to support viewing status for more than 32 threads.

The example below supports viewing status for up to 64 threads:

``` C
static int32_t cycle_check(void * arg, int32_t unused)
{
    const int32_t countMax = 64;
```

#### VDSP Exit Flow Adaptation Notes

The system depends on the dev_control thread running normally. Users control whether hb_platform_init starts it with the CONFIG_PLATFORM_INIT_BUILTIN_THREADS macro. If not enabled, create the corresponding thread yourself. User threads must follow this flow:

(1) Add exit logic in the user task loop by calling hb_is_thread_stop; a return value of 1 means the thread should exit immediately

#### VDSP Log Usage Restrictions

(1) Interrupt handlers do not support direct or indirect use of standard C library printf; doing so will hang VDSP

(2) Direct or indirect use of standard C library printf before hb_platform_init is not supported and may cause low-probability boot failures

#### VDSP Build Notes

(1) Define the platform macro. Platform macros include CONFIG_ARCH_HOBOT_SOC_SIGIE, CONFIG_ARCH_HOBOT_SOC_SIGIP, and CONFIG_ARCH_HOBOT_SOC_SIGIB

(2) By default, different VDSP cores can load the same FW, so CONFIG_VDSP is not required (CONFIG_VDSP0/CONFIG_VDSP1 are no longer used)

#### Safe Power-off and Sleep Flow

(1) During safe power-off and sleep, the driver checks VDSP Firmware status and continues only after it has stopped. Implement the VDSP exit flow in the application as well.

## VDSP Sample

### Overview

This section introduces a VDSP sample for S-series SoC platforms. It demonstrates VDSP start/stop, inter-core message send/receive, and VDSP image processing.

### Software Architecture

Development is required on both the ARM side and the VDSP side. Client/server business logic is implemented using the RPMSG IPC mechanism.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/07_vdsp_development/vdsp1.png" alt="VDSP sample diagram 1" style={{ width: '100%' }} />

#### ARM-side Development Flow

On the ARM side, users mainly load VDSP Firmware, connect to VDSP-side services, and send RPMSG compute requests to VDSP as the client.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/07_vdsp_development/vdsp2.png" alt="VDSP sample diagram 2" style={{ width: '100%' }} />

#### VDSP-side Development Flow

On the VDSP side, initialize the runtime environment and start related services (VDSP acts as the server and can start multiple one-to-one services),
receive and reply to client messages through RPMSG, and start additional threads for application development.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/07_vdsp_development/vdsp3.png" alt="VDSP sample diagram 3" style={{ width: '100%' }} />

#### Sample Flow Description:

The interaction flow between the ARM side and VDSP is shown below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/07_vdsp_development/vdsp4.png" alt="VDSP sample diagram 4" style={{ width: '100%' }} />

ARM side:

1) Start VDSP
2) Connect to RPMSG server (dcore0_rpmsg_op)
3) Send RPMSG to VDSP
4) Receive RPMSG from VDSP
5) Disconnect from RPMSG server
6) Stop VDSP

VDSP side:

1) Initialize environment
2) Start RPMSG server (dcore0_rpmsg_op)
3) Receive RPMSG from ARM
4) Parse received RPMSG data and run the corresponding image processing function
5) Reply to ARM with RPMSG containing the execution result

#### Code Location and Directory Structure

Code paths

1. Code location:
``` shell
  ARM side: {sdk_dir}/source/hobot-multimedia-samples/debian/app/vdsp_demo/
  DSP side: {sdk_dir}/vdsp_fw/samples/libxi-sample/
```

2. Directory structure:
``` shell
# Source and binary directory structure, excluding build framework files (Makefile, Kconfig, etc.)
  ARM:
     └── src
         └── vdsp_sample.c

  DSP:
     └── main.c
```

### Build

#### Build Instructions

Build commands

``` bash
# The ARM-side sample can be built directly on the board. On-board path:
/app/vdsp_demo/vdsp_sample
# Build command
cd /app/vdsp_demo/vdsp_sample && make

# VDSP build command
cd vdsp_fw
export HR_TARGET_PROJECT=S100 (options: S100/S600)
./make.sh

# VDSP-side output file:
{sdk_dir}/vdsp_fw/samples/libxi-sample/vdsp0-{build_type}
```

### Run

### Supported Platforms

S100/S600

#### Hardware Setup

NA

#### Run Parameters

The table below lists supported vdsp sample input parameters. Use `--help` for full parameter descriptions.

| Parameter | Usage | Default |
| :--- | :--- | :--- |
| `dsp_id` | `-d` / `--dsp_id=<id>`, specify VDSP core ID (consistent with `hb_vdsp_*`, `dcore<id>_rpmsg_op`, etc.) | `0` |
| `dsp_pathname` | `-p` / `--dsp_pathname=<path>`, specify VDSP Firmware path (passed to `hb_vdsp_start`) | `/app/vdsp_demo/vdsp_sample/res/q8sample` |
| `sample-type` | `-t` / `--sample-type=<0\|1>`, sample type: `0` basic, `1` full pipeline | `1` |
| `case` | `-c` / `--case=<name>`, case name (e.g. `xi-sample-flip`; code also branches to `flip_stress`, `flops_stress`, etc.) | `xi-sample-flip` |
| `test_time` | `--test_time=<seconds>`, duration for stress cases in seconds (for `flip_stress` / `flops_stress`, etc.) | `5` |
| `loading` | `--loading=<0-100>`, load percentage for stress cases | `80` |
| `help` | `-h` / `--help`, print usage and exit (unknown arguments also call `usage()`) | (none) |

### Run Result Description

``` bash
root@ubuntu:/app/vdsp_demo/vdsp_sample# ./vdsp_sample -d 1 -p /app/vdsp_demo/vdsp_sample/res/q8sample -t 0
vdsp_sample_cxt:
        vdsp_id:1
        case_name:xi-sample-flip
        dsp_pathname:/app/vdsp_demo/vdsp_sample/res/q8sample
vdsp_call_params:
        cmd:xi-sample-flip
        type:0
        buf_width:128
        buf_height:128
        vdsp_buf0:0xfffd0000
        vdsp_buf1:0xfffc0000
result: 0
```

After execution, the log output above is produced. recv_buf returning 0 indicates success.

## VDSP API Reference

### Inter-core Communication RPMSG APIs

#### RPMSG Inter-core Communication Headers and Libraries

  - VDSP side

    Header file: hb_rpmsg_interface.h

    Library: none

  - Acore side

    Header file: hb_rpmsg_interface.h

    Library: librpmsg.so

#### RPMSG Inter-core Communication API Return Values {#rpmsg_api_return_value}

VDSP side

``` c
#define RPMSG_ERR_INVALID_ARG               (-1)
#define RPMSG_ERR_PATH_NOT_LINK             (-2)
#define RPMSG_ERR_SERVER_NOT_CONNECT        (-3)
#define RPMSG_ERR_OUT_OF_RES                (-4)
#define RPMSG_ERR_SEND_BUF_OVERSIZE         (-5)
#define RPMSG_ERR_NO_MEM                    (-6)
#define RPMSG_ERR_TIMEOUT                   (-7)
#define RPMSG_ERR_RECV_BUF_OVERFLOW         (-8)
#define RPMSG_ERR_INVALID_SERVER            (-9)
#define RPMSG_ERR_CRC_CHECK                 (-10)
```

Acore side

``` c
#define RPMSG_ERR_INVALID_ARG           (-1)
#define RPMSG_ERR_INVALID_SERVER        (-2)
#define RPMSG_ERR_OUT_OF_RES            (-3)
#define RPMSG_ERR_KER_USR_TRANS         (-4)
#define RPMSG_ERR_SEND_BUF_OVERSIZE     (-5)
#define RPMSG_ERR_NO_MEM                (-6)
#define RPMSG_ERR_TIMEOUT               (-7)
#define RPMSG_ERR_SIGNAL_STOP           (-8)
#define RPMSG_ERR_RECV_BUF_OVERFLOW     (-9)
#define RPMSG_ERR_NOT_START_SERVER      (-10)
#define RPMSG_ERR_CRC_CHECK             (-11)
#define RPMSG_ERR_DRV_VERSION           (-12)
#define RPMSG_ERR_UNKNOWN_ERR           (-13)
```

#### RPMSG Inter-core Communication (VDSP-side) APIs

##### hb_rpmsg_start_server

**Function Declaration**

``int32_t hb_rpmsg_start_server(const char* server_name, uint32_t flags, rl_ept_rx_cb_t rx_cb, void* rx_cb_data, uint32_t timeout, rpmsg_handle** handle);``

**Parameters**

  - [IN] server_name: Service name
  - [IN] flags: Communication flags
  - [IN] rx_cb: Callback function for received messages
  - [IN] rx_cb_data: Callback argument
  - [IN] timeout: Receive timeout (unit: ms)
  - [OUT] handle: RPMSG communication handle

Available service names:

VDSP0

  - dcore0_acore_heart.
  - dcore0_rpmsg_bpu.
  - dcore0_rpmsg_op.

VDSP1

  - dcore1_acore_heart.
  - dcore1_rpmsg_bpu.
  - dcore1_rpmsg_op.

:::warning
S100 does not have VDSP1. Keep this in mind when using these APIs.
:::

**Notes**

Flags usage (use bitwise operators):

  - RPMSG_F_BLOCK: blocking transfer
  - RPMSG_F_NONBLOCK: non-blocking transfer
  - RPMSG_F_CRC_CHECK: enable CRC check

**Return Value**

  - Success: 0
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)

**Description**

Start the RPMSG communication service

**Example**

``` c
#include <hb_rpmsg_interface.h>
#include <hb_vdsp_log.h>
#include <platform.h>

#ifdef CNFIG_VDSP0
static char test_server_name[] = "dcore0_rpmsg_op";
#elif CNFIG_VDSP1
static char test_server_name[] = "dcore1_rpmsg_op";
#endif
#define CORE_COM_TX_RX_PAYLOAD_SIZE     (240)
#define MAX_PAYLAD (CORE_COM_TX_RX_PAYLOAD_SIZE)
static char buffer_rev[MAX_PAYLAD] = {0};
static char temp_hope[MAX_PAYLAD] ="I am test string,hope you can see me";

int32_t mycallback(void *payload, uint32_t payload_len, uint32_t src, void *priv)
{
    printf("[vdsp0],mycallback test! payload is 0x%x ,payload_len is %d, \
        src is %d\n",payload,payload_len,src);
    memcpy((void*)buffer_rev, payload, payload_len);
}

int32_t rpmsg_test()
{
    int32_t ret;
    rpmsg_handle *handle = NULL;

    //recv, block
    ret = hb_rpmsg_start_server(test_server_name, RPMSG_F_BLOCK |
    RPMSG_F_QUEUE_RECV, mycallback, NULL,0, &handle);
    if(ret != 0) {
        DSP_ERR("hb_rpmsg_start_server fail!,ret = %d\n", ret);
        hb_rpmsg_stop_server(handle);
        return -1;
    }
    DSP_INF("%s server start,(block/recv) way!!\n", test_server_name);
    ret = hb_rpmsg_recv(handle, buffer_rev, MAX_PAYLAD);
    if (ret < 0) {
        DSP_ERR("hb_rpmsg_recv(block/recv) failed, ret = %d\n", ret);
        hb_rpmsg_stop_server(handle);
        return -1;
    }
    DSP_INF("hb_rpmsg_recv(block/recv), buffer_rev : %s\n", buffer_rev);
    ret = hb_rpmsg_send(handle, buffer_rev, MAX_PAYLAD);
    if (ret < 0) {
        DSP_ERR("rpmsg_send error [[[%d]]]\n", ret);
        hb_rpmsg_stop_server(handle);
        return -1;
    }
    ret = hb_rpmsg_stop_server(handle);
    if (ret < 0) {
        DSP_ERR("server:%s stop error [[[%d]]]\n", test_server_name, ret);
        return -1;
    }
    DSP_INF("%s server stop(block/recv)!!\n", test_server_name);
    return 0;
}
```

##### hb_rpmsg_stop_server

**Function Declaration**

``int32_t hb_rpmsg_stop_server(rpmsg_handle* handle);``

**Parameters**

  - [IN] handle: RPMSG communication handle

**Return Value**

  - Success: 0
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)

**Description**

Stop the RPMSG communication service

**Example**

See [hb_rpmsg_start_server](#hb_rpmsg_start_server)

##### hb_rpmsg_send

**Function Declaration**

``int32_t hb_rpmsg_send(const rpmsg_handle* handle, char *buf, uint32_t len);``

**Parameters**

  - [IN] handle: RPMSG communication handle
  - [IN] buf: Address of data to send
  - [IN] len: Length of data to send; valid range: 1 ~ 240

**Return Value**

  - Success: number of bytes actually sent
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)

**Description**

Send communication service frame data

**Example**

See [hb_rpmsg_start_server](#hb_rpmsg_start_server)

##### hb_rpmsg_recv

**Function Declaration**

``int32_t hb_rpmsg_recv(rpmsg_handle* handle, char* buf, uint32_t len);``

**Parameters**

  - [IN] handle: RPMSG communication handle
  - [OUT] buf: Address of receive buffer
  - [IN] len: Length of data to receive; valid range: 1 ~ 240

**Return Value**

  - Success: number of bytes actually received
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)
**Description**

Receive communication service frame data

**Example**

See [hb_rpmsg_start_server](#hb_rpmsg_start_server)

##### hb_rpmsg_send_timeout

**Function Declaration**

``int32_t hb_rpmsg_send_timeout(const rpmsg_handle* handle, char* buf, uint32_t len, uint32_t timeout);``

**Parameters**

  - [IN] handle: RPMSG communication handle
  - [IN] buf: Address of data to send
  - [IN] len: Length of data to send; valid range: 1 ~ 240
  - [IN] timeout: Send blocking duration

**Return Value**

  - Success: number of bytes actually sent
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)

**Description**

Send communication service frame data with a timeout parameter

**Example**

``` c
#include <hb_rpmsg_interface.h>
#include <hb_vdsp_log.h>
#include <platform.h>

#ifdef CNFIG_VDSP0
static char test_server_name[] = "dcore0_rpmsg_op";
#elif CNFIG_VDSP1
static char test_server_name[] = "dcore1_rpmsg_op";
#endif
#define CORE_COM_TX_RX_PAYLOAD_SIZE     (240)
#define MAX_PAYLAD (CORE_COM_TX_RX_PAYLOAD_SIZE)
static char buffer_rev[MAX_PAYLAD] = {0};
static char temp_hope[MAX_PAYLAD] ="I am test string,hope you can see me";

int32_t mycallback(void *payload, uint32_t payload_len, uint32_t src, void *priv)
{
    printf("[vdsp0],mycallback test! payload is 0x%x ,payload_len is %d, \
        src is %d\n",payload,payload_len,src);
    memcpy((void*)buffer_rev, payload, payload_len);
}

int32_t rpmsg_test()
{
    int32_t ret;
    rpmsg_handle *handle = NULL;

    //recv, block
    ret = hb_rpmsg_start_server(test_server_name, RPMSG_F_BLOCK |
    RPMSG_F_QUEUE_RECV, mycallback, NULL,0, &handle);
    if(ret != 0) {
        DSP_ERR("hb_rpmsg_start_server fail!,ret = %d\n", ret);
        hb_rpmsg_stop_server(handle);
        return -1;
    }
    DSP_INF("%s server start,(block/recv) way!!\n", test_server_name);
    ret = hb_rpmsg_recv_timeout(handle, buffer_rev, MAX_PAYLAD, 1000u);
    if (ret < 0) {
        DSP_ERR("hb_rpmsg_recv(block/recv) failed, ret = %d\n", ret);
        hb_rpmsg_stop_server(handle);
        return -1;
    }
    DSP_INF("hb_rpmsg_recv(block/recv), buffer_rev : %s\n", buffer_rev);
    ret = hb_rpmsg_send_timeout(handle, buffer_rev, MAX_PAYLAD, 1000u);
    if (ret < 0) {
        DSP_ERR("rpmsg_send error [[[%d]]]\n", ret);
        hb_rpmsg_stop_server(handle);
        return -1;
    }
    ret = hb_rpmsg_stop_server(handle);
    if (ret < 0) {
        DSP_ERR("server:%s stop error [[[%d]]]\n", test_server_name, ret);
        return -1;
    }
    DSP_INF("%s server stop(block/recv)!!\n", test_server_name);
    return 0;
}
```

##### hb_rpmsg_recv_timeout

**Function Declaration**

int32_t hb_rpmsg_recv_timeout(rpmsg_handle* handle, char* buf,
uint32_t len, uint32_t timeout);

**Parameters**

  - [IN] handle: RPMSG communication handle
  - [OUT] buf: Address of receive buffer
  - [IN] len: Length of data to receive; valid range: 1 ~ 240
  - [IN] timeout: Receive blocking duration

**Return Value**

  - Success: number of bytes actually received
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)

**Description**

Receive communication service frame data with a timeout parameter

**Example**

See [hb_rpmsg_send_timeout](#hb_rpmsg_send_timeout)

#### RPMSG Inter-core Communication (Acore-side) APIs

##### hb_rpmsg_connect_server

**Function Declaration**

``int32_t hb_rpmsg_connect_server(char *server_name, int flags, int timeout, rpmsg_handle **handle);``

**Parameters**

  - [IN] server_name: Service name
  - [IN] flags: Communication flags
  - [IN] timeout: Timeout in blocking mode (unit: ms)
  - [OUT] handle: Returned RPMSG communication handle

**Notes**

Flags usage (use bitwise operators):

  - RPMSG_F_BLOCK: blocking transfer
  - RPMSG_F_NONBLOCK: non-blocking transfer
  - RPMSG_F_CRC_CHECK: enable CRC check

**Return Value**

  - Success: 0
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)

**Description**

Connect to the communication service

**Example**

``` c
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <rpmsg_lib.h>
void usage(char *s)
{
    printf("usage: %s server_name timeout(ms)\n", s);
}
int main(int argc, char *argv[])
{
    int ret = 0;
    struct rpmsg_handle *handle = NULL;
    char buffer[240] = {0};
    int timeout = 0;
    int cnt_max_connect = 10;
    uint32_t major, minor, patch;
    char *p;

    if (argc != 3) {
        usage(argv[0]);
        return -1;
    }
    timeout = atoi(argv[2]);
    if (timeout < 0) {
        printf("invalid timeout: %d\n", timeout);
        usage(argv[0]);
        return -1;
    }
    ret = hb_rpmsg_get_version(&major, &minor, &patch);
    if (ret < 0) {
        printf("rpmsg get version failed\n");
        return ret;
    } else {
        printf("rpmsg verion: %u.%u.%u\n", major, minor, patch);
    }
    reconnect:
    ret = hb_rpmsg_connect_server(argv[1], RPMSG_F_BLOCK, timeout,
    &handle);
    if (ret < 0) {
        --cnt_max_connect;
        if ((ret == RPMSG_ERR_NOT_START_SERVER) && (cnt_max_connect)) {
            printf("rpmsg_connect_server error[%d]: %s\n", ret,
                hb_rpmsg_error_message(ret));
            usleep(100 * 1000);
            goto reconnect;
        } else {
            printf("rpmsg_connect_server error[%d]: %s\n", ret,
                hb_rpmsg_error_message(ret));
            return -1;
        }
    }
    while (1) {
        ret = hb_rpmsg_send(handle, buffer, 240);
        if (ret < 0) {
            printf("rpmsg_send error[%d]: %s\n", ret,
                hb_rpmsg_error_message(ret));
            hb_rpmsg_disconnect_server(handle);
            return -1;
        } else
            printf("recv log: %s\n", buffer);
            ret = hb_rpmsg_recv(handle, buffer, 240);
            if (ret < 0) {
                printf("rpmsg_recv error[%d]: %s\n", ret,
                    hb_rpmsg_error_message(ret));
                hb_rpmsg_disconnect_server(handle);
                return -1;
            }
        }
    }
    return 0;
}
```

##### hb_rpmsg_disconnect_server

**Function Declaration**

``int32_t hb_rpmsg_disconnect_server(rpmsg_handle* handle);``

**Parameters**

  - [IN] handle: RPMSG communication handle

**Return Value**

  - Success: 0
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)

**Description**

Disconnect from the communication service

**Example**

See [hb_rpmsg_connect_server](#hb_rpmsg_connect_server)

##### hb_rpmsg_send

**Function Declaration**

``int32_t hb_rpmsg_send(const rpmsg_handle* handle, char *buf, int32_t len);``

**Parameters**

  - [IN] handle: RPMSG communication handle
  - [IN] buf: Address of data to send
  - [IN] len: Length of data to send; valid range: 1 ~ 240

**Return Value**

  - Success: number of bytes actually sent
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)

**Description**

Send communication service frame data for a specific service

**Example**

See [hb_rpmsg_connect_server](#hb_rpmsg_connect_server)

##### hb_rpmsg_recv

**Function Declaration**

``int32_t hb_rpmsg_recv(rpmsg_handle* handle, char* buf, int32_t  len);``

**Parameters**

  - [IN] handle: RPMSG communication handle
  - [OUT] buf: Address of receive buffer
  - [IN] len: Length of data to receive; valid range: 1 ~ 240

**Return Value**

  - Success: number of bytes actually received
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)

**Description**

Receive communication service frame data

##### hb_rpmsg_send_timeout

**Function Declaration**

``int32_t hb_rpmsg_send_timeout(const rpmsg_handle* handle, char *buf, int32_t len, int32_t timeout);``

**Parameters**

  - [IN] handle: RPMSG communication handle
  - [IN] buf: Address of data to send
  - [IN] len: Length of data to send; valid range: 1 ~ 240
  - [IN] timeout: Send blocking duration

**Return Value**

  - Success: number of bytes actually sent
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)

**Description**

Send communication service frame data with a timeout parameter

**Example**

``` c
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <rpmsg_lib.h>
void usage(char *s)
{
    printf("usage: %s server_name timeout(ms)\n", s);
}
int main(int argc, char *argv[])
{
    int ret = 0;
    struct rpmsg_handle *handle = NULL;
    char buffer[240] = {0};
    int timeout = 0;
    int cnt_max_connect = 10;
    if (argc != 3) {
        usage(argv[0]);
        return -1;
    }
    timeout = atoi(argv[2]);
    if (timeout < 0) {
        printf("invalid timeout: %d\n", timeout);
        usage(argv[0]);
        return -1;
    }
    reconnect:
    ret = hb_rpmsg_connect_server(argv[1], RPMSG_F_BLOCK, timeout,
    &handle);
    if (ret < 0) {
        --cnt_max_connect;
        if ((ret == RPMSG_ERR_NOT_START_SERVER) && (cnt_max_connect)) {
            printf("rpmsg_connect_server error[%d]: %s\n", ret,
                hb_rpmsg_error_message(ret));
            usleep(100 * 1000);
            goto reconnect;
        } else {
            printf("rpmsg_connect_server error[%d]: %s\n", ret,
                hb_rpmsg_error_message(ret));
            return -1;
        }
    }
    while (1) {
        ret = hb_rpmsg_send_timeout(handle, buffer, 240, 1000);
        if (ret < 0) {
            printf("rpmsg_send error[%d]: %s\n", ret,
                hb_rpmsg_error_message(ret));
            hb_rpmsg_disconnect_server(handle);
            return -1;
        } else
            printf("recv log: %s\n", buffer);
            ret = hb_rpmsg_recv_timeout(handle, buffer, 240, 1000);
            if (ret < 0) {
                printf("rpmsg_recv error[%d]: %s\n", ret,
                    hb_rpmsg_error_message(ret));
                hb_rpmsg_disconnect_server(handle);
                return -1;
            }
        }
    }
    return 0;
}
```

##### hb_rpmsg_recv_timeout

**Function Declaration**

``int32_t hb_rpmsg_recv_timeout(rpmsg_handle* handle, char* buf, int32_t len, int32_t timeout);``

**Parameters**

  - [IN] handle: RPMSG communication handle
  - [OUT] buf: Address of receive buffer
  - [IN] len: Length of data to receive; valid range: 1 ~ 240
  - [IN] timeout: Receive blocking duration

**Return Value**

  - Success: number of bytes actually received
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)

**Description**

Receive communication service frame data with a timeout parameter

**Example**

See [hb_rpmsg_send_timeout](#hb_rpmsg_send_timeout)

##### hb_rpmsg_get_version

**Function Declaration**

``int32_t hb_rpmsg_get_version(uint32_t* major, uint32_t* minor, uint32_t* patch);``

**Parameters**

  - [OUT] major: Major version number
  - [OUT] minor: Minor version number
  - [OUT] patch: Patch version number

**Return Value**

  - Success: 0
  - Failure: negative error code; see [RPMSG Inter-core Communication API Return Values](#rpmsg_api_return_value)

**Description**

Get the RPMSG shared library version

**Example**

See [hb_rpmsg_connect_server](#hb_rpmsg_connect_server)

##### hb_rpmsg_error_message

**Function Declaration**

``const char* hb_rpmsg_error_message(int32_t error_code);``

**Parameters**

  - [IN] error_code: Error code

**Return Value**

  - Success: error description string
  - Failure: NULL

**Description**

Convert an error code to an error description string

**Example**

See [hb_rpmsg_connect_server](#hb_rpmsg_connect_server)

### Inter-core Communication IPCFHAL APIs

#### IPCFHAL Inter-core Communication Headers and Libraries

  - VDSP side

    Header file: hb_ipcfhal_interface.h ipcf_hal_errno.h

    Library: none

  - Acore side

    Header file: hb_ipcfhal_interface.h ipcf_hal_errno.h

    Library: libhbipcfhal.so

#### IPCFHAL Inter-core Communication API Return Values {#vdsp_ipcfhal_api_return}

``` c
#define IPCF_HAL_E_OK           0/**< General OK*/
#define IPCF_HAL_E_NOK          1/**< General Not OK*/
#define IPCF_HAL_E_CONFIG_FAIL      2/**< Config fail*/
#define IPCF_HAL_E_WRONG_CONFIGURATION  3/**< Wrong configuration*/
#define IPCF_HAL_E_NULL_POINTER     4/**< A null pointer was passed as an argument*/
#define IPCF_HAL_E_PARAM_INVALID    5/**< A parameter was invalid*/
#define IPCF_HAL_E_LENGTH_TOO_SMALL 6/**< Length too small*/
#define IPCF_HAL_E_INIT_FAILED      7/**< Initialization failed*/
#define IPCF_HAL_E_UNINIT       8/**< Called before initialization*/
#define IPCF_HAL_E_BUFFER_OVERFLOW  9/**< Source address or destination address Buffer overflow*/
#define IPCF_HAL_E_ALLOC_FAIL       10/**< Source alloc fail*/
#define IPCF_HAL_E_TIMEOUT      11/**< Expired the time out*/
#define IPCF_HAL_E_REINIT       12/**< Re initilize*/
#define IPCF_HAL_E_BUSY         13/**< Busy*/
#define IPCF_HAL_E_CHANNEL_INVALID  14/**< Channel is invalid*/
```

API return values are the negated values of the macros above.

#### IPCFHAL Inter-core Communication (VDSP-side) APIs

##### hb_ipcfhal_init

**Function Declaration**

`int32_t hb_ipcfhal_init(ipcfhal_chan_t *channel);`

**Parameters**

  - [IN] channel: IPCFHAL channel information

**Return Value**

  - Success: 0
  - Failure: \<0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Initialize IPCFHAL

**IPCFHAL Initialization Example**

:::info
For full build and run instructions, see `/app/vdsp_demo/vdsp_ipcfhal_sample/READTME.md`
:::

``` c
#define CFG_FILE "config.json"
#define DATA_LEN 1024

static int32_t ipcfhal_thread_func(void *arg, int32_t unused) {
	int32_t ret;
	char *ch_name = "cpu-vdsp-ins0ch0";
	ipcfhal_chan_t channel;
	uint8_t rx_data[DATA_LEN] = {0};
	uint8_t tx_data[DATA_LEN] = {0};
	int32_t timeout = -1;
	uint32_t major, minor, patch;

	ret = vdsp_server_ready(BOOT_COMPLETE_EVENT_MASK_BIT1 | BOOT_COMPLETE_EVENT_MASK_BIT2);

	ret = hb_ipcfhal_get_version(&major, &minor, &patch);
	if (ret < 0) {
		return ret;
	} else {
		printf("ipcfhal verion: %u.%u.%u\n", major, minor, patch);
	}

	ret = hb_ipcfhal_getchan_byjson(ch_name, &channel, CFG_FILE);
	if (ret < 0)
		return ret;
	ret = hb_ipcfhal_init(&channel);
	if (ret < 0)
		return ret;
	ret = hb_ipcfhal_config(&channel);
	if (ret < 0)
		return ret;

	while (hb_is_thread_stop() != 1) {
		memset(tx_data, 0x55, DATA_LEN);
		ret = hb_ipcfhal_send(tx_data, DATA_LEN, &channel);
		if (ret < 0)
			continue;

		memset((void *)rx_data, 0, DATA_LEN);
		ret = hb_ipcfhal_recv(rx_data, DATA_LEN, timeout, &channel);
		if (ret < 0)
			continue;
		for (int i = 0; i < DATA_LEN; i++) {
			if (rx_data[i] != 0x55) {
				DSP_ERR("recv rx_data[%d] err. 0x%x\n", i, rx_data[i]);
				break;
			}
		}
		xos_thread_sleep_msec(2);
	}

	return ret;
}
```

##### hb_ipcfhal_getchan_byjson

**Function Declaration**

`int32_t hb_ipcfhal_getchan_byjson(const char *name, ipcfhal_chan_t *channel, const char *json_file);`

**Parameters**

  - [IN] name: IPCFHAL channel name
  - [IN] json_file: IPCFHAL JSON configuration file
  - [OUT] channel: IPCFHAL channel information

**Return Value**

  - Success: channel ID
  - Failure: \<0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Get a channel from the IPCFHAL JSON configuration file

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init)

##### hb_ipcfhal_config

**Function Declaration**

int32_t hb_ipcfhal_config(ipcfhal_chan_t *channel);

**Parameters**

  - [IN] channel: IPCFHAL channel information

**Return Value**

  - Success: \>=0
  - Failure: \<0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Configure an IPCFHAL channel

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init)

##### hb_ipcfhal_send

**Function Declaration**

`int32_t hb_ipcfhal_send(const uint8_t *data, int16_t length, ipcfhal_chan_t *channel);`

**Parameters**

  - [IN] data: Send data buffer
  - [IN] length: Send buffer length
  - [IN] channel: IPCFHAL channel information

**Return Value**

  - Success: number of bytes actually sent
  - Failure: \<0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Send an IPCFHAL message

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init)

##### hb_ipcfhal_recv

**Function Declaration**

``int32_t hb_ipcfhal_recv(uint8_t *data, int16_t length, int32_t  timeout, ipcfhal_chan_t *channel);``

**Parameters**

  - [IN] length: Maximum buffer length
  - [IN] timeout: 0 = non-blocking, >0 = blocking timeout in ms, -1 = blocking
  - [IN] channel: IPCFHAL channel information
  - [OUT] data: Receive data buffer

**Return Value**

  - Success: number of bytes actually received
  - Failure: \<0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Receive an IPCFHAL message

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init)

##### hb_ipcfhal_deinit

**Function Declaration**

``int32_t hb_ipcfhal_deinit(ipcfhal_chan_t *channel);``

**Parameters**

  - [IN] channel: IPCFHAL channel information

**Return Value**

  - Success: 0
  - Failure: \<0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Deinitialize IPCFHAL

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init)

##### hb_ipcfhal_trans_err

**Function Declaration**

``int32_t hb_ipcfhal_trans_err(int32_t err_code, char **err_str);``

**Parameters**

  - [IN] err_code: Return value error code
  - [OUT] err_str: Converted error string

**Return Value**

  - Success: 0
  - Failure: \<0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Convert an IPCFHAL error code to an error string

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init)

##### hb_ipcfhal_get_version

**Function Declaration**

``int32_t hb_ipcfhal_get_version(uint32_t *major, uint32_t *minor, uint32_t *patch);``

**Parameters**

  - [OUT] major: libhbipcfhal major version number
  - [OUT] minor: libhbipcfhal minor version number
  - [OUT] patch: libhbipcfhal patch version number

**Return Value**

  - Success: 0
  - Failure: \<0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Get the IPCFHAL library version

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init)

##### hb_ipcfhal_register_callback

**Function Declaration**

``int32_t hb_ipcfhal_register_callback(uint8_t *user_data, user_cb_t user_cb, ipcfhal_chan_t *channel);``

**Parameters**

  - [IN] user_data: User data
  - [IN] user_cb: User callback function
  - [IN] channel: IPCFHAL channel information

**Return Value**

  - Success: 0
  - Failure: !=0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Register an IPCFHAL callback function. On the VDSP side, the receive mode is configured as callback mode. When the parameters are NULL, the callback is unregistered and the VDSP-side receive mode is configured as recv mode. When multiple channels in the same instance use callbacks, execution is blocking; callbacks across channels in different instances run concurrently.

**IPCFHAL Register Callback Example**

``` c
static void test_ipcfhal_callback_func(uint8_t *userdata, int32_t instance, int32_t chan_id,
            uint8_t *buf, uint64_t size)
{
    printf("userdata[0x%llx] ins[%d] ch[%d] buf[0x%llx] size[%llu]\n",
        (uint64_t)userdata, instance, chan_id, (uint64_t)buf, size);
    *userdata = 1u;
}

static int32_t hb_libipchal_register_callback_func(void)
{
    int32_t ret = 0;
    uint8_t user_flag = 0;
    uint32_t cnt = 100u;
    uint8_t rx_data[1024] = {0};
    ipcfhal_chan_t channel;

    printf("hb_libipchal_register_callback_func start\n");
    (void)hb_ipcfhal_getchan_byjson("cpu-vdsp-ch0", &channel, "ipcf_config.json");
    (void)hb_ipcfhal_init(&channel);
    (void)hb_ipcfhal_config(&channel);
    (void)hb_ipcfhal_register_callback(&user_flag, test_ipcfhal_callback_func, &channel);

    while ((user_flag == 0) && (cnt--) ) {
        xos_thread_sleep_msec(100);
    }

    (void)hb_ipcfhal_register_callback(NULL, NULL, &channel);
    (void)hb_ipcfhal_deinit(&channel);
    printf("hb_libipchal_register_callback_func end\n");

    return 0;
}
```

#### IPCFHAL Inter-core Communication (Acore-side) APIs

##### hb_ipcfhal_init {#hb_ipcfhal_init_arm}

**Function Declaration**

``int32_t hb_ipcfhal_init(ipcfhal_chan_t *channel);``

**Parameters**

-   [IN] channel: IPCFHAL channel

**Return Value**

-   Success: 0
-   Failure: !=0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Initialize IPCFHAL

**IPCFHAL Initialization Example**

:::info
For full build and run instructions, see ``/app/vdsp_demo/vdsp_ipcfhal_sample/READTME.md``
:::

``` c
{
  "log_level": 0,
  "config_num": 2,
  "config_num_max":256,
  "config_0": {
    "name": "cpu2vdsp_ins22ch0",
    "instance": 22,
    "channel": 0,
    "pkg_size_max": 4096,
    "fifo_size": 64000,
    "fifo_type": 0,
    "ipcf_dev_path":"/dev/ipcdrv",
    "ipcf_dev_name":"ipcdrv"
  },
  "config_1": {
    "name": "cpu2vdsp_ins22ch1",
    "instance": 22,
    "channel": 1,
    "pkg_size_max": 4096,
    "fifo_size": 64000,
    "fifo_type": 0,
    "ipcf_dev_path":"/dev/ipcdrv",
    "ipcf_dev_name":"ipcdrv"
  }
}

/*************************************************************************
 *                     COPYRIGHT NOTICE
 *            Copyright 2022-2024, D-Robotics Co., Ltd.
 *                   All rights reserved.
 *************************************************************************/

/******************************************************************************/
/*----------------------------------Includes----------------------------------*/
/******************************************************************************/
#include <sys/time.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>
#include <getopt.h>
#include <pthread.h>
#include <semaphore.h>
#include <signal.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <logging.h>
#include <hb_vdsp_mgr.h>
#include "hb_ipcf_hal.h"
#include "ipcf_hal_errno.h"
/******************************************************************************/
/*-----------------------------------Macros-----------------------------------*/
/******************************************************************************/
#define SMP_1KB_LEN		(1024)/**< sample send and recv data length*/
#define SMP_TIMEOUT_VAL		(1000)/**< sample recv timeout value*/
#define SMP_USLEEP_1MS		(1000u)/**< sample sleep 1ms*/
#define SMP_USLEEP_10MS		(10000u)/**< sample sleep 10ms*/
#define SMP_SLEEP_1S		(1u)/**< sample sleep 1s*/
#define SMP_RUN_TIME		(10l)/**< sample run time, unit: s*/
#define SMP_100CNT		(100u)/**< sample 100 counts*/
#define SMP_CHAN_NUM		(1)/**< sample channel number*/
#define SMP_THREAD_NUM		(SMP_CHAN_NUM * 2)/**< sample thread number*/
#define SMP_ROLL_POS		(4)/**< sample rolling count position*/
#define SMP_CFG_FILE	"/app/vdsp_demo/vdsp_ipcfhal_sample/ipcfhal_config.json"

/******************************************************************************/
/*-------------------------Function Prototypes--------------------------------*/
/******************************************************************************/
void *send_pthread(void *argv);
void *recv_pthread(void *argv);

/******************************************************************************/
/*---------------------------- Local Function -------------------------------*/
/******************************************************************************/
/*thread arg*/
struct th_arg_t {
  ipcfhal_chan_t ch;/**< ipcfhal channel*/
  bool Is_Enable;/**< thread status*/
  uint32_t data_len;/**< send data length*/
  uint32_t sleep_time;/**< send period*/
  bool result;/**< thread running result*/
};

volatile sig_atomic_t g_running = true;

void signal_handler(int sig) {
  if (sig == SIGINT)
    g_running = false;
}

static void *tx_pthread(void *argv)
{
  int32_t ret = 0;
  struct th_arg_t *pth_arg = (struct th_arg_t *)argv;
  uint8_t tx_data[SMP_1KB_LEN] = {0u};

  if (pth_arg == NULL) {
    return NULL;
  }

  while (pth_arg->Is_Enable) {
    memset(tx_data, 0x55, SMP_1KB_LEN);
    ret = hb_ipcfhal_send(tx_data, pth_arg->data_len, &pth_arg->ch);
    if (ret != (int32_t)pth_arg->data_len) {/*return data_len*/
      pr_err("Ins[%u]Ch[%u] send failed\n",
        pth_arg->ch.instance, pth_arg->ch.id);
      pth_arg->result = false;
    }
    usleep(pth_arg->sleep_time);
  }

  pr_info("[%s End]Ins[%u]Ch[%u]\n",
    __func__, pth_arg->ch.instance, pth_arg->ch.id);

  return NULL;
}

static void *rx_pthread(void *argv)
{
  int32_t ret = 0;
  struct th_arg_t *pth_arg = (struct th_arg_t *)argv;
  uint8_t data[SMP_1KB_LEN] = {0u};
  int32_t timeout = SMP_TIMEOUT_VAL;

  if (pth_arg == NULL) {
    return NULL;
  }

  while (pth_arg->Is_Enable) {
    memset(data, 0u, pth_arg->data_len);
    ret = hb_ipcfhal_recv(data, SMP_1KB_LEN, timeout, &pth_arg->ch);
    if (ret != -IPCF_HAL_E_TIMEOUT && ret < 0) {
      pr_err("Ins[%u]Ch[%u] recv failed: %d\n",
        pth_arg->ch.instance, pth_arg->ch.id, ret);
      pth_arg->Is_Enable = false;
      pth_arg->result = false;
      break;
    }

    if (ret >= 0) {
      for (int i = 0; i < SMP_1KB_LEN; i++) {
        if (data[i] != 0x55) {
          pr_err("recv data[%d] err. 0x%x\n", i, data[i]);
          break;
        }
      }
    } else if (ret == -IPCF_HAL_E_TIMEOUT) {
      pth_arg->result = false;
    }

    usleep(pth_arg->sleep_time);
  }
  pr_info("[%s End]Ins[%u]Ch[%u]\n",
    __func__, pth_arg->ch.instance, pth_arg->ch.id);

  return NULL;
}

/******************************************************************************/
/*---------------------------- Global Function -------------------------------*/
/******************************************************************************/
int main(int argc, char *argv[])
{
  const char *json_path = SMP_CFG_FILE;
  struct timespec test_start_time, test_cur_time;
  int32_t ret = 0;
  bool result = true;
  pthread_t thread_tid[SMP_THREAD_NUM];
  struct th_arg_t thread_arg[SMP_CHAN_NUM];
  const char *chan_name[SMP_CHAN_NUM] = {
    "cpu2vdsp_ins22ch0"
  };
  int32_t vdsp_id = 0;
  int32_t timeout = 1000;
  const char *vdsp_pathname = "/app/vdsp_demo/vdsp_ipcfhal_sample/res/q8sample";

  signal(SIGINT, signal_handler);

  ret = hb_vdsp_init(vdsp_id);
  if (ret) {
    pr_err("vdsp init failed, ret %d\n", ret);
    return ret;
  }

  ret = hb_vdsp_start(vdsp_id, timeout, vdsp_pathname);
  if (ret) {
    pr_err("vdsp start failed, ret %d\n", ret);
    return ret;
  }

  for (int32_t i = 0; i < SMP_CHAN_NUM; i++) {
    /*step1: get channel info by json file*/
    ret = hb_ipcfhal_getchan_byjson(chan_name[i], &thread_arg[i].ch, json_path);
    if (ret < 0) {/* return channel id*/
      pr_err("%s not found, ret %d\n", chan_name[i], ret);
      hb_vdsp_stop(vdsp_id);
      hb_vdsp_deinit(vdsp_id);
      return ret;
    }

    /*step2: init channel*/
    ret = hb_ipcfhal_init(&thread_arg[i].ch);
    if (ret < 0) {
      pr_err("%s init failed, ret %d\n", thread_arg[i].ch.name, ret);
      for (int32_t j = 0; j < i; j++) {
        hb_ipcfhal_deinit(&thread_arg[j].ch);
      }
      hb_vdsp_stop(vdsp_id);
                        hb_vdsp_deinit(vdsp_id);
      return ret;
    }

    /*step3: config channel*/
    ret = hb_ipcfhal_config(&thread_arg[i].ch);
    if (ret < 0) {
      pr_err("%s config failed, ret %d\n", thread_arg[i].ch.name, ret);
      for (int32_t j = 0; j <= i; j++) {
        hb_ipcfhal_deinit(&thread_arg[j].ch);
      }
      hb_vdsp_stop(vdsp_id);
                        hb_vdsp_deinit(vdsp_id);
      return ret;
    }

    /*step4: set thread arg*/
    thread_arg[i].sleep_time = SMP_USLEEP_10MS;
    thread_arg[i].data_len = SMP_1KB_LEN;
    thread_arg[i].Is_Enable = true;
    thread_arg[i].result = true;
    (void)pthread_create(&thread_tid[i], NULL, rx_pthread, &thread_arg[i]);
    (void)pthread_create(&thread_tid[i+1], NULL, tx_pthread, &thread_arg[i]);
  }

  /*step5: run send and recv thread*/
  clock_gettime(CLOCK_MONOTONIC, &test_start_time);
  clock_gettime(CLOCK_MONOTONIC, &test_cur_time);
  while (g_running) {
    for (int32_t i = 0; i < SMP_CHAN_NUM; i++) {
      if (thread_arg[i].Is_Enable == false)
        break;
    }
    if (test_cur_time.tv_sec - test_start_time.tv_sec > SMP_RUN_TIME)
      break;

    sleep(SMP_SLEEP_1S);
    clock_gettime(CLOCK_MONOTONIC, &test_cur_time);
  }

  /*step6: deinit channel*/
  for (int32_t i = 0; i < SMP_CHAN_NUM; i++) {
    void *ret;
    thread_arg[i].Is_Enable = false;//stop thread
    usleep(SMP_USLEEP_10MS);
    pthread_join(thread_tid[i], &ret);
    pthread_join(thread_tid[i+1], &ret);
    (void)hb_ipcfhal_deinit(&thread_arg[i].ch);

    result = (result && thread_arg[i].result);
  }

  if (result == false) {
    pr_err("[ipc-sample] ipc sample running failed\n");
  } else {
    pr_info("[ipc-sample] ipc sample running success\n");
  }

  ret = hb_vdsp_stop(vdsp_id);
  if (ret) {
    pr_err("vdsp stop failed, ret %d\n", ret);
    return ret;
  }

  ret = hb_vdsp_deinit(vdsp_id);
  if (ret) {
    pr_err("vdsp deinit failed, ret %d\n", ret);
    return ret;
  }
  return ret;
}
```

##### hb_ipcfhal_getchan_byjson

**Function Declaration**

``int32_t hb_ipcfhal_getchan_byjson(const char *name, ipcfhal_chan_t *channel, const char *json_file);``

**Parameters**

-   [IN] name: IPCFHAL channel name
-   [IN] json_file: IPCFHAL JSON configuration file
-   [OUT] channel: IPCFHAL channel information

**Return Value**

-   Success: \>=0
-   Failure: \<0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Get a channel from the IPCFHAL JSON configuration file. After channel initialization, modifying structure member values is not supported.

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init_arm)

##### hb_ipcfhal_config

**Function Declaration**

``int32_t hb_ipcfhal_config(ipcfhal_chan_t *channel);``

**Parameters**

-   [IN] channel: IPCFHAL channel information

**Return Value**

-   Success: \>=0
-   Failure: \<0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Configure an IPCFHAL channel

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init_arm)

##### hb_ipcfhal_send

**Function Declaration**

``int32_t hb_ipcfhal_send(const uint8_t *data, uint32_t length, ipcfhal_chan_t *channel);``

**Parameters**

-   [IN] data: Send data buffer
-   [IN] length: Send buffer length
-   [IN] channel: Channel information

**Return Value**

-   Success: number of bytes actually sent
-   Failure: \<0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Send an IPCFHAL message

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init_arm)

##### hb_ipcfhal_recv

**Function Declaration**

``int32_t hb_ipcfhal_recv(uint8_t *data, uint32_t length, int32_t timeout, ipcfhal_chan_t *channel);``

**Parameters**

-   [IN] length: Maximum buffer length
-   [IN] timeout: 0 = non-blocking, >0 = blocking timeout in ms, -1 = blocking
-   [IN] channel: Channel information
-   [OUT] data: Receive data buffer

**Return Value**

-   Success: number of bytes actually received
-   Failure: \<0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Receive an IPCFHAL message

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init_arm)

##### hb_ipcfhal_deinit

**Function Declaration**

``int32_t hb_ipcfhal_deinit(ipcfhal_chan_t *channel);``

**Parameters**

-   [IN] channel: Channel information

**Return Value**

-   Success: 0
-   Failure: !=0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Deinitialize IPCFHAL

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init_arm)

##### hb_ipcfhal_trans_err

**Function Declaration**

``int32_t hb_ipcfhal_trans_err(int32_t err_code, char **err_str);``

**Parameters**

-   [IN] err_code: Return value error code
-   [OUT] err_str: Converted error string

**Return Value**

-   Success: 0
-   Failure: !=0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Convert an IPCFHAL error code to an error string

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init_arm)

##### hb_ipcfhal_get_version

**Function Declaration**

``int32_t hb_ipcfhal_get_version(uint32_t *major, uint32_t *minor, uint32_t *patch);``

**Parameters**

-   [OUT] major: libhbipcfhal major version number
-   [OUT] minor: libhbipcfhal minor version number
-   [OUT] patch: libhbipcfhal patch version number

**Return Value**

-   Success: 0
-   Failure: !=0; see [IPCFHAL Inter-core Communication API Return Values](#vdsp_ipcfhal_api_return)

**Description**

Get the IPCFHAL library version

**Example**

See [hb_ipcfhal_init](#hb_ipcfhal_init_arm)

### HEAP Allocation APIs

#### HEAP Allocation Headers and Libraries

  - VDSP side

    Header file: hb_mem_allocator.h

    Library: none

#### HEAP Allocation API Return Values {#vdsp_heap_api_return}

``` c
#define HB_MEM_OK                                    0
#define HB_MEM_ERR_INVALID_PARAMS                    (-16777215)
#define HB_MEM_ERR_REPEAT_INIT                       (-16777214)
#define HB_MEM_ERR_HEAP_BUSY                         (-16777213)
#define HB_MEM_ERR_INSUFFICIENT_MEM                  (-16777212)
```

#### HEAP Allocation APIs

##### hb_mem_heap_initialize

**Function Declaration**

``int32_t hb_mem_heap_initialize(hb_mem_heap_t heap_id, void *start_vaddr, size_t heap_size, uint32_t align);``

**Parameters**

  - [IN] heap_id: Valid heap index; valid values: 0, 1
  - [IN] start_vaddr: Heap start address
  - [IN] heap_size: Heap size
  - [IN] align: Heap alignment size

**Return Value**

  - Success: 0
  - Failure: \<0; see [HEAP Allocation API Return Values](#vdsp_heap_api_return)

**Description**

Initialize the heap allocation APIs

**Example**

``` c
int32_t ret;
void *start_vaddr[2] = {(void *)heapDRAM0, heapDRAM1};
size_t heap_size[2] = {sizeof(heapDRAM0), sizeof(heapDRAM1)};
ret = hb_mem_heap_initialize(HB_MEMRY_HEAP_DRAM_0, start_vaddr[0],
    heap_size[0], 0x10000);
if (ret < 0) {
    printf("hb_mem_heap_initialize failed ret = %d\n", ret);
    return ret;
}
ret = hb_mem_heap_deinitialize(HB_MEMRY_HEAP_DRAM_0);
if (ret < 0) {
    printf("hb_mem_heap_deinitialize failed ret = %d\n", ret);
    return ret;
}
return 0;
```

##### hb_mem_heap_deinitialize

**Function Declaration**

``int32_t hb_mem_heap_deinitialize(hb_mem_heap_t heap_id);``

**Parameters**

  - [IN] heap_id: Valid heap index; valid values: 0, 1

**Return Value**

  - Success: 0
  - Failure: \<0; see [HEAP Allocation API Return Values](#vdsp_heap_api_return)

**Description**

Deinitialize the heap allocation APIs

**Example**

``` c
int32_t ret;
void *start_vaddr[2] = {(void *)heapDRAM0, heapDRAM1};
size_t heap_size[2] = {sizeof(heapDRAM0), sizeof(heapDRAM1)};
ret = hb_mem_heap_initialize(HB_MEMRY_HEAP_DRAM_0, start_vaddr[0],
    heap_size[0], 0x10000);
if (ret < 0) {
    printf("hb_mem_heap_initialize failed ret = %d\n", ret);
    return ret;
}
ret = hb_mem_heap_deinitialize(HB_MEMRY_HEAP_DRAM_0);
if (ret < 0) {
    printf("hb_mem_heap_deinitialize failed ret = %d\n", ret);
    return ret;
}
return 0;
```

##### hb_mem_heap_alloc

**Function Declaration**

``int32_t hb_mem_heap_alloc(hb_mem_heap_t heap_id, size_t req_size, uint32_t align, void ** vaddr);``

**Parameters**

  - [IN] heap_id: Valid heap index; valid values: 0, 1
  - [IN] req_size: Number of bytes to allocate
  - [IN] align: Heap alignment size
  - [OUT] vaddr: Start address of allocated buffer

**Return Value**

  - Success: 0
  - Failure: \<0; see [HEAP Allocation API Return Values](#vdsp_heap_api_return)

**Description**

Heap allocation API

**Example**

``` c
int32_t ret;
void *start_vaddr[2] = {(void *)heapDRAM0, heapDRAM1};
size_t heap_size[2] = {sizeof(heapDRAM0), sizeof(heapDRAM1)};
uint32_t malloc_alignment = 64;
void *vaddr = NULL;
ret = hb_mem_heap_initialize(HB_MEMRY_HEAP_DRAM_0, start_vaddr[0],
heap_size[0], 0x10000);
if (ret < 0) {
    printf("hb_mem_heap_initialize failed ret = %d\n", ret);
    return ret;
}
ret = hb_mem_heap_alloc(HB_MEMRY_HEAP_DRAM_0, heap_size[0],
    malloc_alignment, &vaddr);
if (ret < 0) {
    printf("hb_mem_heap_alloc failed ret = %d\n", ret);
    hb_mem_heap_deinitialize(HB_MEMRY_HEAP_DRAM_0);
    return ret;
}
ret = hb_mem_heap_free(HB_MEMRY_HEAP_DRAM_0, vaddr);
if (ret < 0) {
    printf("hb_mem_heap_free failed ret = %d\n", ret);
    hb_mem_heap_deinitialize(HB_MEMRY_HEAP_DRAM_0);
    return ret;
}
ret = hb_mem_heap_deinitialize(HB_MEMRY_HEAP_DRAM_0);
return 0;
```

##### hb_mem_heap_free

**Function Declaration**

``int32_t hb_mem_heap_free(hb_mem_heap_t heap_id, void *vaddr);``

**Parameters**

  - [IN] heap_id: Valid heap index; valid values: 0, 1
  - [IN] vaddr: Start address of allocated buffer

**Return Value**

  - Success: 0
  - Failure: \<0; see [HEAP Allocation API Return Values](#vdsp_heap_api_return)

**Description**

Free allocated heap space

**Example**

``` c
int32_t ret;
void *start_vaddr[2] = {(void *)heapDRAM0, heapDRAM1};
size_t heap_size[2] = {sizeof(heapDRAM0), sizeof(heapDRAM1)};
uint32_t malloc_alignment = 64;
void *vaddr = NULL;
ret = hb_mem_heap_initialize(HB_MEMRY_HEAP_DRAM_0, start_vaddr[0],
heap_size[0], 0x10000);
if (ret < 0) {
    printf("hb_mem_heap_initialize failed ret = %d\n", ret);
    return ret;
}
ret = hb_mem_heap_alloc(HB_MEMRY_HEAP_DRAM_0, heap_size[0],
    malloc_alignment, &vaddr);
if (ret < 0) {
    printf("hb_mem_heap_alloc failed ret = %d\n", ret);
    hb_mem_heap_deinitialize(HB_MEMRY_HEAP_DRAM_0);
    return ret;
}
ret = hb_mem_heap_free(HB_MEMRY_HEAP_DRAM_0, vaddr);
if (ret < 0) {
    printf("hb_mem_heap_free failed ret = %d\n", ret);
    hb_mem_heap_deinitialize(HB_MEMRY_HEAP_DRAM_0);
    return ret;
}
ret = hb_mem_heap_deinitialize(HB_MEMRY_HEAP_DRAM_0);
if (ret < 0) {
    printf("hb_mem_heap_deinitialize failed ret = %d\n", ret);
    return ret;
}
return 0;
```

##### hb_mem_heap_get_status

**Function Declaration**

``int32_t hb_mem_heap_get_status(hb_mem_heap_t heap_id, hb_mem_heap_status_t *heap_status);``

**Parameters**

  - [IN] heap_id: Valid heap index; valid values: 0, 1
  - [OUT] heap_status: Heap status information

**Return Value**

  - Success: 0
  - Failure: \<0; see [HEAP Allocation API Return Values](#vdsp_heap_api_return)

**Description**

Get heap allocation status

**Example**

``` c
int32_t ret;
void *start_vaddr[2] = {(void *)heapDRAM0, heapDRAM1};
size_t heap_size[2] = {sizeof(heapDRAM0), sizeof(heapDRAM1)};
hb_mem_heap_status_t heap_status = {0, };
ret = hb_mem_heap_initialize(HB_MEMRY_HEAP_DRAM_0, start_vaddr[0],
    heap_size[0], 0x10000);
if (ret < 0) {
    printf("hb_mem_heap_initialize failed ret = %d\n", ret);
    return ret;
}
ret = hb_mem_heap_get_status(HB_MEMRY_HEAP_DRAM_0, &heap_status);
if (ret < 0) {
    printf("hb_mem_heap_get_status failed ret = %d\n", ret);
    hb_mem_heap_deinitialize(HB_MEMRY_HEAP_DRAM_0);
    return ret;
}
ret = hb_mem_heap_deinitialize(HB_MEMRY_HEAP_DRAM_0);
if (ret < 0) {
    printf("hb_mem_heap_deinitialize failed ret = %d\n", ret);
    return ret;
}
return 0;
```

### VDSP Boot/Stop Control APIs {#vdsp_boot_api}

#### VDSP Boot/Stop Control Headers and Libraries

  - Acore side

    Header file: hb_vdsp_mgr.h

    Library: libvdsp.so

#### VDSP Boot/Stop Control API Return Values {#vdsp_boot_api_return}

``` c
#define HB_VDSP_OK                      (0)
#define HB_VDSP_OPEN_DEV_ERR                    (-1)
#define HB_VDSP_START_IOCTL_ERR                 (-2)
#define HB_VDSP_STOP_IOCTL_ERR                  (-4)
#define HB_VDSP_GET_STATUS_IOCTL_ERR                (-5)
#define HB_VDSP_RESET_IOCTL_ERR                 (-6)
#define HB_VDSP_PARAM_INVALID                   (-7)
#define HB_VDSP_SET_PATH_ERR                    (-8)
#define HB_VDSP_SET_NAME_ERR                    (-9)
#define HB_VDSP_CLOSE_DEV_ERR                   (-10)
#define HB_VDSP_ERR_IOC_GET_VERSION_INFO            (-11)
#define HB_VDSP_ERR_IOC_MEM_ALLOC               (-12)
#define HB_VDSP_ERR_IOC_MEM_FREE                (-13)
#define HB_VDSP_ERR_IOC_SMMU_MAP                (-14)
#define HB_VDSP_ERR_IOC_SMMU_UNMAP              (-15)
#define HB_VDSP_ERR_INIT                    (-16)
#define HB_VDSP_ERR_DEINIT                  (-17)
#define HB_VDSP_ERR_NOT_INITED                  (-18)
#define HB_VDSP_ERR_ALLOC_COM_BUF               (-19)
#define HB_VDSP_ERR_FREE_MEMBUF                 (-20)
#define HB_VDSP_ERR_GET_COM_BUF_WITH_VADDR          (-21)
#define HB_VDSP_ERR_SMMU_MAP                    (-22)
#define HB_VDSP_ERR_SMMU_UNMAP                  (-23)
#define HB_VDSP_ERR_CHECK_VERSION               (-24)
#define HB_VDSP_ERR_INSUFFICIENT_MEM                (-25)
#define HB_VDSP_ERR_MISMATCH_INTERFACE              (-26)
#define HB_VDSP_ERR_RBTREE_CREATE_NODE              (-27)
#define HB_VDSP_ERR_RBTREE_INSERT_NODE              (-28)
#define HB_VDSP_ERR_RBTREE_SEARCH_NODE              (-29)
```

#### VDSP Boot/Stop Control APIs

##### hb_vdsp_get_version

**Function Declaration**

``int32_t hb_vdsp_get_version(uint32_t *major, uint32_t *minor, uint32_t *patch);``

**Parameters**

  - [OUT] major: libvdsp major version number
  - [OUT] minor: libvdsp minor version number
  - [OUT] patch: libvdsp patch version number

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Get the VDSP boot/stop control library version

**Get VDSP Library Version Example**

``` c
#include <hb_vdsp_mgr.h>

int32_t boot_lib_version_test(int32_t dsp_id)
{
    int32_t ret = 0;
    uint32_t major, minor, patch;

    ret = hb_vdsp_get_version(&major, &minor, &patch);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_get_version ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    printf("%s Get version %d.%d.%d.\n", TAG, major, minor, patch);

    return ret;
}
```

##### hb_vdsp_init

**Function Declaration**

``int32_t hb_vdsp_init(int32_t dsp_id);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Initialize the VDSP boot/stop control library

**Initialize VDSP Library Example**

``` c
#include <hb_vdsp_mgr.h>

int32_t boot_lib_init_test(int32_t dsp_id)
{
    int32_t ret = 0;

    ret = hb_vdsp_init(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_init ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    ret = hb_vdsp_deinit(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_deinit ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    return ret;
}
```

##### hb_vdsp_deinit

**Function Declaration**

``int32_t hb_vdsp_deinit(int32_t dsp_id);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Release the VDSP boot/stop control library

**Example**

See [hb_vdsp_init](#hb_vdsp_init)

##### hb_vdsp_start

**Function Declaration**

``int32_t hb_vdsp_start(int32_t dsp_id, int32_t timeout, const char *pathname);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1
  - [IN] timeout: 0 = asynchronous; -1 = synchronous; >0 = synchronous timeout wait time in ms
  - [IN] pathname: Full VDSP image path, including the image name

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Start VDSP

**Synchronously Start VDSP Example**

``` c
#include <hb_vdsp_mgr.h>

#define VDSP_BOOT_MODE_ASYNC        (0)
#define VDSP_BOOT_MODE_SYNC         (-1)

int32_t boot_lib_sync_test(int32_t dsp_id, const char* pathname)
{
    int32_t ret = 0;
    int32_t status = 0;

    ret = hb_vdsp_init(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_init ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    ret = hb_vdsp_start(dsp_id, VDSP_BOOT_MODE_SYNC, pathname);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_start ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_get_status(dsp_id, &status);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_get_status ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_stop(dsp_id);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_stop(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_stop ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_deinit(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_deinit ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    printf("%s dsp%d boot sync pass !\n", __func__, dsp_id);
    return ret;
}

boot_lib_sync_test(0, "/app/vdsp_demo/vdsp_sample/res/q8sample");
boot_lib_sync_test(1, "/app/vdsp_demo/vdsp_sample/res/q8sample");
```

**Asynchronously Start VDSP Example**

``` c
#include <hb_vdsp_mgr.h>
#include <poll.h>

#define VDSP_BOOT_MODE_ASYNC        (0)
#define VDSP_BOOT_MODE_SYNC         (-1)

int32_t boot_lib_async_test(int32_t dsp_id, const char* pathname)
{
    int32_t ret = 0;
    struct pollfd pollfds;
    int32_t fd;

    ret = hb_vdsp_init(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_init ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    ret = hb_vdsp_start(dsp_id, VDSP_BOOT_MODE_ASYNC, pathname);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_start ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_get_fd(dsp_id, &fd);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_get_fd ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_stop(dsp_id);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    pollfds.fd = fd;
    pollfds.events = POLLIN | POLLRDNORM;

    printf("%s dsp%d poll entry pollfds.events=0x%x fd-%d.\n", __func__, dsp_id, pollfds.events, fd);

    ret = poll(&pollfds, 1, 600);
    printf("%s dsp%d poll return pollfds.revents=0x%x ret-%d.\n", __func__, dsp_id, pollfds.revents, ret);
    if (ret <= 0) {
        printf("%s dev poll err: %d, %s\n", __func__, errno, strerror(errno));
        hb_vdsp_close_fd(fd);
        hb_vdsp_stop(dsp_id);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_close_fd(fd);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_close_fd ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_stop(dsp_id);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_stop(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_stop ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_deinit(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_deinit ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    printf("%s dsp%d boot async pass !\n", __func__, dsp_id);
    return ret;
}

boot_lib_async_test(0, "/app/vdsp_demo/vdsp_sample/res/q8sample");
boot_lib_async_test(1, "/app/vdsp_demo/vdsp_sample/res/q8sample");
```

##### hb_vdsp_stop

**Function Declaration**

``int32_t hb_vdsp_stop(int32_t dsp_id);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Stop VDSP

**Example**

See [hb_vdsp_start](#hb_vdsp_start)

##### hb_vdsp_get_status

**Function Declaration**

``int32_t hb_vdsp_get_status(int32_t dsp_id, int32_t *status);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1
  - [OUT] status: VDSP running status

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Get VDSP running status

::: tip
This API does not support concurrent use from multiple processes or threads.
:::

**Example**

See [hb_vdsp_start](#hb_vdsp_start)

##### hb_vdsp_reset

**Function Declaration**

``int32_t hb_vdsp_reset(int32_t dsp_id);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Reset VDSP

**Example**

``` c
#include <hb_vdsp_mgr.h>

#define VDSP_BOOT_MODE_ASYNC        (0)
#define VDSP_BOOT_MODE_SYNC         (-1)

int32_t boot_lib_reset_test(int32_t dsp_id, const char* pathname)
{
    int32_t ret = 0;
    int32_t status = RPROC_OFFLINE;

    ret = hb_vdsp_init(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_init ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    ret = hb_vdsp_start(dsp_id, VDSP_BOOT_MODE_SYNC, pathname);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_start ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_get_status(dsp_id, &status);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_get_status ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_stop(dsp_id);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_reset(dsp_id);
    if (ret != HB_VDSP_OK) {
        ALOGE("%s dsp%d hb_vdsp_reset ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_stop(dsp_id);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_stop(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_stop ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_deinit(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_deinit ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    printf("%s dsp%d reset pass !\n", __func__, dsp_id);
    return ret;
}

boot_lib_reset_test(0, "/app/vdsp_demo/vdsp_sample/res/q8sample");
boot_lib_reset_test(1, "/app/vdsp_demo/vdsp_sample/res/q8sample");
```

##### hb_vdsp_set_path

**Function Declaration**

``int32_t hb_vdsp_set_path(int32_t dsp_id, const char* path);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1
  - [IN] path: Full VDSP image path, excluding the image name

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Set the VDSP image path

**Example**

``` c
#include <hb_vdsp_mgr.h>

#define VDSP_BOOT_MODE_ASYNC        (0)
#define VDSP_BOOT_MODE_SYNC         (-1)

int32_t boot_lib_set_pathname_test(int32_t dsp_id, const char* path, const char* name)
{
    int32_t ret = 0;
    int32_t status = 0;

    ret = hb_vdsp_init(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_init ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    ret = hb_vdsp_set_path(dsp_id, path);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_set_path ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_set_name(dsp_id, name);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_set_name ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_start(dsp_id, VDSP_BOOT_MODE_SYNC, NULL);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_start ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_get_status(dsp_id, &status);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_get_status ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_stop(dsp_id);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_stop(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_stop ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_deinit(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_deinit ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    printf("%s dsp%d set path & name pass !\n", __func__, dsp_id);
    return ret;
}

boot_lib_set_pathname_test(0, "/app/testcase/S05_VDSP/testsuite", "q8sample");
boot_lib_set_pathname_test(1, "/app/testcase/S05_VDSP/testsuite", "q8sample");
```

##### hb_vdsp_set_name

**Function Declaration**

``int32_t hb_vdsp_set_name(int32_t dsp_id, const char* name);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1
  - [IN] name: VDSP image name

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Set the VDSP image name

**Example**

See [hb_vdsp_set_path](#hb_vdsp_set_path)

##### hb_vdsp_get_fd

**Function Declaration**

``int32_t hb_vdsp_get_fd(int32_t dsp_id, int32_t *retfd);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1
  - [OUT] retfd: VDSP device file descriptor

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Open and return the VDSP device file descriptor

**Example**

See [hb_vdsp_start](#hb_vdsp_start)

##### hb_vdsp_close_fd

**Function Declaration**

``int32_t hb_vdsp_close_fd(int32_t fd);``

**Parameters**

  - [IN] fd: VDSP device file descriptor

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Close the VDSP device

**Example**

See [hb_vdsp_start](#hb_vdsp_start)

##### hb_vdsp_mem_alloc

**Function Declaration**

``int32_t hb_vdsp_mem_alloc(int32_t dsp_id, uint64_t size, int64_t flags, uint64_t *va, uint64_t *iova);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1
  - [IN] size: Requested memory size
  - [IN] flags: Flags for memory allocation via libhbmem
  - [OUT] va: Virtual address of memory allocated via libhbmem
  - [OUT] iova: Mapped VDSP device address

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Allocate memory via libvdsp and map it to a device address accessible by VDSP

**Allocate Memory and Map Example**

``` c
#include <hb_vdsp_mgr.h>

int32_t boot_lib_mem_alloc_test(int32_t dsp_id)
{
    int32_t ret = 0;
    uint64_t usize = 64 * 1024;
    int64_t hbmem_flags = HB_MEM_USAGE_CPU_READ_OFTEN | HB_MEM_USAGE_CPU_WRITE_OFTEN;
    uint64_t p_va=0;
    uint64_t p_iova=0;

    ret = hb_vdsp_init(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_init ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    ret = hb_vdsp_mem_alloc(dsp_id, usize, hbmem_flags, &p_va, &p_iova);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_mem_alloc ret-%d fail !\n", __func__, dsp_id, ret);
    hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_mem_free(dsp_id, p_va);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_mem_free ret-%d fail !\n", __func__, dsp_id, ret);
    hb_vdsp_deinit(dsp_id);
        return ret;
    }

    ret = hb_vdsp_deinit(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_deinit ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    return ret;
}
```

##### hb_vdsp_mem_free

**Function Declaration**

``int32_t hb_vdsp_mem_free(int32_t dsp_id, uint64_t va);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1
  - [IN] va: Virtual address of memory allocated via libhbmem

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Unmap the VDSP device address and free memory via libvdsp

**Example**

See [hb_vdsp_mem_alloc](#hb_vdsp_mem_alloc)

##### hb_vdsp_mmu_map

**Function Declaration**

``int32_t hb_vdsp_mmu_map(int32_t dsp_id, uint64_t va, uint64_t size, uint64_t *iova);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1
  - [IN] va: Virtual address of memory allocated via libhbmem
  - [IN] size: Memory size to map
  - [OUT] iova: Mapped VDSP device address

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Map a virtual address to a device address accessible by VDSP via libvdsp. map supports multiple mappings of the same address. map and unmap must be used in pairs. The range specified by input parameters va and size must not exceed the actual allocated buffer size.

**Map Memory to Device Address Example**

``` c
#include <hb_vdsp_mgr.h>

int32_t boot_lib_mem_map_test(int32_t dsp_id)
{
    int32_t ret = 0;
    int64_t flags = HB_MEM_USAGE_CPU_READ_OFTEN | HB_MEM_USAGE_CPU_WRITE_OFTEN;
    hb_mem_common_buf_t com_buf = {0, };
    hb_mem_common_buf_t info = {0, };
    uint64_t usize = 64 * 1024;
    uint64_t p_iova=0;

    ret = hb_mem_module_open();
    if (ret != 0) {
        printf("%s dsp%d hb_mem_module_open ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    ret = hb_mem_alloc_com_buf(usize, flags, &com_buf);
    if (ret != 0) {
        printf("%s dsp%d hb_mem_alloc_com_buf ret-%d fail !\n", __func__, dsp_id, ret);
        hb_mem_module_close();
        return ret;
    }
    if (com_buf.fd < 0) {
        printf("%s dsp%d com_buf.fd %d fail !\n", __func__, dsp_id, com_buf.fd);
        hb_mem_module_close();
        return ret;
    }

    ret = hb_mem_get_com_buf(com_buf.fd, &info);
    if (ret != 0) {
        printf("%s dsp%d hb_mem_get_com_buf ret-%d fail !\n", __func__, dsp_id, ret);
        hb_mem_free_buf(com_buf.fd);
        hb_mem_module_close();
        return ret;
    }

    ret = hb_vdsp_init(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_init ret-%d fail !\n", __func__, dsp_id, ret);
        hb_mem_free_buf(com_buf.fd);
        hb_mem_module_close();
        return ret;
    }

    ret = hb_vdsp_mmu_map(dsp_id, (uint64_t)com_buf.virt_addr, usize, &p_iova);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_mmu_map ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_deinit(dsp_id);
        hb_mem_free_buf(com_buf.fd);
        hb_mem_module_close();
        return ret;
    }

    ret = hb_vdsp_mmu_unmap(g_i_vdsp_id, (uint64_t)com_buf.virt_addr);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_mmu_unmap ret-%d fail !\n", __func__, dsp_id, ret);
        hb_vdsp_deinit(dsp_id);
        hb_mem_free_buf(com_buf.fd);
        hb_mem_module_close();
        return ret;
    }

    ret = hb_vdsp_deinit(dsp_id);
    if (ret != HB_VDSP_OK) {
        printf("%s dsp%d hb_vdsp_deinit ret-%d fail !\n", __func__, dsp_id, ret);
        hb_mem_free_buf(com_buf.fd);
        hb_mem_module_close();
        return ret;
    }

    ret = hb_mem_free_buf(com_buf.fd);
    if (ret != 0) {
        printf("%s dsp%d hb_mem_free_buf ret-%d fail !\n", __func__, dsp_id, ret);
    hb_mem_module_close();
        return ret;
    }

    ret = hb_mem_module_close();
    if (ret != 0) {
        printf("%s dsp%d hb_mem_module_close ret-%d fail !\n", __func__, dsp_id, ret);
        return ret;
    }

    return ret;
}
```

##### hb_vdsp_mmu_unmap

**Function Declaration**

``int32_t hb_vdsp_mmu_unmap(int32_t dsp_id, uint64_t va);``

**Parameters**

  - [IN] dsp_id: DSP index; valid values: 0, 1, corresponding to dsp0 and dsp1
  - [IN] va: Virtual address of memory allocated via libhbmem

**Return Value**

  - Success: 0
  - Failure: negative error code; see [VDSP Boot/Stop Control API Return Values](#vdsp_boot_api_return)

**Description**

Unmap the VDSP device address via libvdsp

**Example**

See [hb_vdsp_mmu_map](#hb_vdsp_mmu_map)
