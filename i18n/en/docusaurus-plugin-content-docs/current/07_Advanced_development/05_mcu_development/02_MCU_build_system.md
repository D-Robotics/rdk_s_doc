---
sidebar_position: 2
---

# 7.5.3 MCU System Description

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## Basic Description of the Compilation System
The MCU compilation system is based on Scons 3.0.0 ([Scons 3.0.0 User Manual Official Website](https://scons.org/doc/3.0.0/HTML/scons-user.html)).

## MCU1 Compilation System
<DocScope products="RDK S100">

The MCU1 compilation system is located at mcu/Build/FreeRtos_mcu1. The specific directory structure is shown in the following figure:
```c
FreeRtos_mcu1
├── build_freertos.py                   # Compilation entry script
├── SConstruct                          # Scons build definition file (unified entry)
├── build_config                        # YAML files used for compilation folder control
│    └── S100
│         └── lite-matrix-B-mcu1.yaml
├── setting_files                       # gcc compile/link parameter files
│    └── gcc
│         └── settings_lite_freertos.py
├── site_scons                          # Scons compile/link command definitions
│    └── site_tools
│         └── gcc_arm.py
└── Linker                              # Linker script directory
     └── gcc
          └── S100
              └── link_freertos_mcu1.ld
```
</DocScope>
<DocScope products="RDK S600">
The MCU1 compilation system is located at mcu/Build/FreeRtos_mcu1. The specific directory structure is shown in the following figure:
```c
FreeRtos_mcu1
├── build_freertos.py                   # Compilation entry script
├── SConstruct                          # Scons build definition file (S600 unified entry)
├── build_config                        # YAML files for adding/removing compilation folders
     └── S600
         └── lite-matrix-B-mcu1.yaml
├── settings_files                      # gcc compilation and linking parameters
     └── gcc
         └── settings_lite_freertos.py
├── site_scons                          # Scons compilation and linking command files
     └── site_tools
         └── gcc_arm.py
└── Linker                              # Linker script directory
     └── gcc
         └── S600
             └── link_freertos_mcu1.ld
```
</DocScope>

## Introduction to the Compilation Process
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/MCU_build_system/build_freertos-en.jpg" alt="" style={{ width: '100%' }} />

## Introduction to the Relationships Among Key Files in the Compilation Process
<DocScope products="RDK S100">

build_freertos.py is the overall entry point for compilation. However, when actually dispatching to scons, the following can influence the scons compilation environment/process:
1. SConstruct file: The SConstruct file is the definition file for scons compilation. Together with the Sconscript file within each module, it forms the equivalent of the Cmakefile in CMake or the makefile in the Make system.
2. settings_lite_freertos.py: The effective entry is initialization of the `Variables` class in `SConstruct`. This file provides statically defined compilation environment variables. Variable names and values are loaded into `Variables`, then consumed by the `Environment` used for scons compilation.
3. gcc_arm.py: This file defines actual compile/link commands. Its effective entry is the `COMPILER_TOOL` field defined in `settings_lite_freertos.py`, which is added in `SConstruct` via `Variables` and finally retrieved from `env`.
4. `build_config/S100/lite-matrix-B-mcu1.yaml`: YAML config file used by S100 MCU1 lite builds. In this file, `SettingFile` points to `Build/FreeRtos_mcu1/setting_files/__COMPILER__/settings_lite_freertos.py`; `LinkFIle` points to `Build/FreeRtos_mcu1/Linker/__COMPILER__/S100/link_freertos_mcu1.ld`; fields such as `BuildPath`, `StaticLibCommonPath`, `StaticLibMcalCddPath`, `StaticLibPlatformPath`, and `StaticLibServicePath` control which directories are included in compilation.

</DocScope>
<DocScope products="RDK S600">
build_freertos.py is the overall entry point for compilation. However, when actually dispatching to scons, the following can influence the scons compilation environment/process:
1. SConstruct file: The SConstruct file is the definition file for scons compilation. Together with the Sconscript file within each module, it forms the equivalent of the Cmakefile in CMake or the makefile in the Make system.
2. settings_lite_freertos.py: The entry point for this file is actually the initialization of the "Variables" class within SConstruct. Its core function is to introduce a series of statically defined compilation environment variables. The variable names in the environment variables correspond to those in settings_lite_freertos.py, and their values correspond to the values of those variable names. The instantiated object of the "Variables" class is then used by the Environment class for scons compilation.
3. gcc_arm.py: This file actually defines the compilation commands. The effective entry point is the "COMPILER_TOOL" field defined in settings_lite_freertos.py. The COMPILER_TOOL field is further added by the Variables of the SConstruct file and finally retrieved by the env, including configurations such as "CC".
4. lite-matrix-B-mcu1.yaml: The folders to be compiled. Add or remove compilation folders in this file. The `LinkFIle` field points to `Linker/gcc/S600/link_freertos_mcu1.ld`.
</DocScope>

## MCU1 Image Layout
<DocScope products="RDK S100">
| Region Name | Start Address | Size | Purpose |
|-------------|---------------|------|---------|
| FLASH_STARTUP | 0x0CAB0000 | 2K | Startup code and exception vector table |
| FLASH | 0x0CAB0800 | 2154K | Area used for code, data, stack, etc. (excluding CAN) |
| FREERTOS_HEAP | 0x0CCCB000 | 512K | FreeRTOS heap space |
| CAN_Reserved | 0x0CD4B000 | 64K | Loading area for CAN module code and data |
| LOG_SHARE_Reserved | 0x0CD5B000 | 8K | Space for MCU1 logs, logs will be overwritten cyclically |
| SCMI_IPC_Reserved | 0x0CD5D000 | 12K | Space required for SCMI IPC communication, used for buffers and critical data |
| ATCM_Reserved | 0x0A000000 | 64K | Runtime area for CAN module code and data |

In the above memory layout, it is strongly recommended that customers do not modify **LOG_SHARE_Reserved**, **SCMI_IPC_Reserved**, **FREERTOS_HEAP**, and other areas, as well as **MCU_STATE_START_ADDR** (`0x0C800800`) and other critical MCU0/MCU1 shared addresses defined in the linker script. ATCM_Reserved is used for CAN runtime data; modify with caution. If you need to adjust FLASH, CAN_Reserved, or other areas, please consult D-Robotics support personnel first.

Below is the linker file from the D-Robotics version (`Linker/gcc/S100/link_freertos_mcu1.ld`), explaining the roles of some variables provided in the linker script:
```c
MEMORY
{
    FLASH_STARTUP(rx)       : org = 0x0CAB0000, len = 2K
    FLASH(rw)               : org = 0x0CAB0800, len = 2154K
    FREERTOS_HEAP(rw)       : org = 0x0CCCB000, len = 512K
    CAN_Reserved(rw)        : org = 0x0CD4B000, len = 64K
    LOG_SHARE_Reserved(rw)  : org = 0x0CD5B000, len = 8K
    SCMI_IPC_Reserved(rw)   : org = 0x0CD5D000, len = 12K
    ATCM_Reserved(rw)       : org = 0x0A000000, len = 64K
}

/* Define output sections */
SECTIONS
{
    .EL2_core_exceptions_table :
    {
        . = ALIGN(32);
        _start = .;
        *(.EL2_core_exceptions_table)
        . = ALIGN(32);
    } > FLASH_STARTUP

    .EL2_Reset_Handler :
    {
        . = ALIGN(32);
        *(.EL2_Reset_Handler)
        . = ALIGN(32);
    } > FLASH_STARTUP

    .EL1_core_exceptions_table :
    {
		. = ALIGN(32);
        *(.EL1_core_exceptions_table)
        . = ALIGN(32);
    } > FLASH_STARTUP

    .EL1_core_exceptions_table_MCU2 :
    {
        . = ALIGN(32);
        *(.EL1_core_exceptions_table_MCU2)
        . = ALIGN(32);
    } > FLASH_STARTUP

    .text :
    {
        . = ALIGN(4);
        *(.text .text.*)          /* .text sections (code) */
        . = ALIGN(4);
    } > FLASH

    .shell :
    {
        _shell_command_start = .;
        KEEP (*(shellCommand))
        _shell_command_end = .;
    } > FLASH

    .mcal_text :
    {
        *(.mcal_text)
    } > FLASH

    .mcal_const_cfg :
    {
        *(.mcal_const_cfg)
    } > FLASH

    .mcal_const :
    {
        *(.mcal_const)
    } > FLASH

    .common_text :
    {
        *(.common_text)
        PROVIDE(__TEXT_END = .);
    } > FLASH
    /******************text end******************/

    .const :
    {
        . = ALIGN(32);
        *(.const)
        *(.rodata .rodata.*)
    } > FLASH


    .heap :
    {
        . = ALIGN(64);
        __HEAP_START = .;
        __end__ = .;
        __heap_start__ = .;
        PROVIDE(end = .);
        PROVIDE(_end = .);
        PROVIDE(__end = .);
        __HeapBase = .;
        . += HEAP_SIZE;
        __HeapLimit = .;
        __heap_limit = .;
        __heap_end__ = .;
    } > FLASH

    .u_boot_list :
    {
        . = ALIGN(4);
        *(SORT(.u_boot_list*))
        . = ALIGN(4);
     } > FLASH

    .global_data :
    {
        . = ALIGN(64);
        __DATA_RAM = .;
        __data_start__ = .;      /* Create a global symbol at data start. */
        *(.data .data.*)         /* .data sections */
        . = ALIGN(64);
        __data_end__ = .;        /* Define a global symbol at data end. */
        PROVIDE(__DATA_END = .);
        PROVIDE(__DATA_ROM = .);
    } > FLASH

    .stack (NOLOAD) :
    {
        . = ALIGN(64);
        __STACK_START = .;
        __StackLimit = .;
        __stack_start__ = .;
        . += STACK_SIZE;
        __stack_end__ = .;
        __StackTop = .;
    } > FLASH

    .stack_mcu2 (NOLOAD) :
    {
        . = ALIGN(64);
        __STACK_START_MCU2 = .;
        __StackLimit_MCU2 = .;
        __stack_start_mcu2__ = .;
        . += STACK_SIZE_MCU2;
        __stack_end_mcu2__ = .;
        __StackTop_MCU2 = .;
    } > FLASH

    .stack_exc (NOLOAD) :
    {
        . = ALIGN(64);
        __StackLimit_exc = .;
        __stack_start_exc__ = .;
        . += STACK_SIZE_EXC;
        __stack_end_exc__ = .;
        __StackTop_exc = .;
        __STACK_END = .;
    } > FLASH

    .stack_exc_mcu2 (NOLOAD) :
    {
        . = ALIGN(64);
        __StackLimit_exc_MCU2 = .;
        __stack_start_exc_mcu2__ = .;
        . += STACK_SIZE_EXC_MCU2;
        __stack_end_exc_mcu2__ = .;
        __StackTop_exc_MCU2 = .;
        __STACK_END_MCU2 = .;
    } > FLASH

    .init_table :
    {
      . = ALIGN(64);
      __COPY_TABLE = .;
      KEEP(*(.init_table))
    } > FLASH

    .zero_table :
    {
      . = ALIGN(64);
      __ZERO_TABLE = .;
      KEEP(*(.zero_table))
    } > FLASH

    .interrupts :
    {
        __VECTOR_TABLE = .;
        __interrupts_start__ = .;
        . = ALIGN(4);
        KEEP(*(.isr_vector))     /* Startup code */
        __interrupts_end__ = .;
        . = ALIGN(4);
    } > FLASH

  __VECTOR_RAM = __VECTOR_TABLE;
  __RAM_VECTOR_TABLE_SIZE = 0x0;
  __VECTOR_TABLE_COPY_END = __VECTOR_TABLE + __RAM_VECTOR_TABLE_SIZE;


    .interrupt_drv_shared_memory :
    {
      *(.interrupt_drv_shared_memory)
    } > FLASH

    .handlers :
    {
        . = ALIGN(32);
      *(.handlers)
    } > FLASH

    .mcal_data :
    {
        *(.mcal_data)
    } > FLASH

    .mcal_shared_data :
    {
        *(.mcal_shared_data)
    } > FLASH

    .bss (NOLOAD) :
    {
        . = ALIGN(64);
        __BSS_START = .;
        __bss_start__ = .;
        *(.bss .bss.*)
    } > FLASH

    .mcal_bss (NOLOAD) :
    {
        . = ALIGN(64);
        *(.mcal_bss)
    } > FLASH

    .mcal_shared_bss (NOLOAD) :
    {
        . = ALIGN(64);
        *(.mcal_shared_bss)
        __DATA_RAM_END = .;
        __m_ram_init_end = .;
        __bss_end__ = .;
        __BSS_END = .;
    } > FLASH

    .ipc_mdma :
    {
        *(.ipc_mdma)
    } > FLASH

    .ucheap_section (NOLOAD) :
    {
        . = ALIGN(64);
        KEEP(*(.ucheap_section))
        . = ALIGN(64);
    } > FREERTOS_HEAP

    .log (NOLOAD) :
    {
        *(.log)
    } > LOG_SHARE_Reserved

    .tcm_code :
    {
        KEEP(*(.tcm_code))
        KEEP(*(.tcm_data))
    } > ATCM_Reserved

    /*-------- LABELS USED IN CODE -------------------------------*/
    SRAM_START_ADDR         = ORIGIN(FLASH_STARTUP);
    FLASH_STARTUP_LEN       = LENGTH(FLASH_STARTUP);
    FLASH_SEC_ADDR          = ORIGIN(FLASH);
    MCU_LOG_START_ADDR      = ORIGIN(LOG_SHARE_Reserved);
    MCU_LOG_SIZE            = LENGTH(LOG_SHARE_Reserved);
    __SCMI_IPC_START_ADDR   = ORIGIN(SCMI_IPC_Reserved);
    __SCMI_IPC_SIZE         = LENGTH(SCMI_IPC_Reserved);
    NON_SECURE_START_ADDR   = ORIGIN(LOG_SHARE_Reserved);
    CAN_START_ADDR          = ORIGIN(CAN_Reserved);
    ATCM_START_ADDR         = ORIGIN(ATCM_Reserved);
    ATCM_SIZE               = LENGTH(ATCM_Reserved);
    OS_HEAP_START_ADDR      = ORIGIN(FREERTOS_HEAP);
    OS_HEAP_SIZE            = LENGTH(FREERTOS_HEAP);

    PROVIDE(SRAM_SIZE = 0x34FFFF);
    PROVIDE(MCU0_LOG_START_ADDR = 0x0CAAB000); /* Base addr from MCU0 link region "LOG_SHARE_Reserved" */
    PROVIDE(MCU_STATE_START_ADDR = 0x0C800800);/* Base addr from MCU0 link region "MCU_STATE_Reserved" */
}
```
</DocScope>
<DocScope products="RDK S600">
| Region Name | Start Address | Size | Purpose |
|-------------|---------------|------|---------|
| FLASH_STARTUP | 0x0CAB0000 | 2K | Startup code and exception vector table |
| FLASH | 0x0CAB0800 | 2666K | Area used for code, data, stack, etc. (excluding CAN) |
| CAN_Reserved | 0x0CD4B000 | 64K | Loading area for CAN module code and data |
| LOG_SHARE_Reserved | 0x0CD5B000 | 8K | Space for MCU1 logs, logs will be overwritten cyclically |
| SCMI_IPC_Reserved | 0x0CD5D000 | 12K | Space required for SCMI IPC communication, used for buffers and critical data |
| FREERTOS_HEAP | 0x0CE00000 | 512K | FreeRTOS heap space |
| ATCM_Reserved | 0x0A000000 | 64K | Runtime area for CAN module code and data |

In the above memory layout, it is strongly recommended that customers do not modify **LOG_SHARE_Reserved**, **SCMI_IPC_Reserved**, **FREERTOS_HEAP**, and other regions, as well as **MCU_STATE_START_ADDR** (`0x0C800800`) and other MCU0/MCU1 shared critical addresses defined in the linker script. ATCM_Reserved is used for CAN runtime data; modify with caution. To adjust FLASH, CAN_Reserved, or other regions, please consult D-Robotics support first.

Below is the linker file from the D-Robotics version (`Linker/gcc/S600/link_freertos_mcu1.ld`), explaining the roles of some variables provided in the linker script:
```c
MEMORY
{
    FLASH_STARTUP(rx)       : org = 0x0CAB0000, len = 2K
    FLASH(rw)               : org = 0x0CAB0800, len = 2666K
    CAN_Reserved(rw)        : org = 0x0CD4B000, len = 64K
    LOG_SHARE_Reserved(rw)  : org = 0x0CD5B000, len = 8K
    SCMI_IPC_Reserved(rw)   : org = 0x0CD5D000, len = 12K
    FREERTOS_HEAP(rw)       : org = 0x0CE00000, len = 512K
    ATCM_Reserved(rw)       : org = 0x0A000000, len = 64K
}

/* Define output sections */
SECTIONS
{
    .EL2_core_exceptions_table :
    {
        . = ALIGN(32);
        _start = .;
        *(.EL2_core_exceptions_table)
        . = ALIGN(32);
    } > FLASH_STARTUP

    .EL2_Reset_Handler :
    {
        . = ALIGN(32);
        *(.EL2_Reset_Handler)
        . = ALIGN(32);
    } > FLASH_STARTUP

    .EL1_core_exceptions_table :
    {
		. = ALIGN(32);
        *(.EL1_core_exceptions_table)
        . = ALIGN(32);
    } > FLASH_STARTUP

    .EL1_core_exceptions_table_MCU2 :
    {
        . = ALIGN(32);
        *(.EL1_core_exceptions_table_MCU2)
        . = ALIGN(32);
    } > FLASH_STARTUP

    .text :
    {
        . = ALIGN(4);
        *(.text .text.*)          /* .text sections (code) */
        . = ALIGN(4);
    } > FLASH

    .shell :
    {
        _shell_command_start = .;
        KEEP (*(shellCommand))
        _shell_command_end = .;
    } > FLASH

    .mcal_text :
    {
        *(.mcal_text)
    } > FLASH

    .mcal_const_cfg :
    {
        *(.mcal_const_cfg)
    } > FLASH

    .mcal_const :
    {
        *(.mcal_const)
    } > FLASH

    .common_text :
    {
        *(.common_text)
        PROVIDE(__TEXT_END = .);
    } > FLASH
    /******************text end******************/

    .const :
    {
        . = ALIGN(32);
        *(.const)
        *(.rodata .rodata.*)
    } > FLASH


    .heap :
    {
        . = ALIGN(64);
        __HEAP_START = .;
        __end__ = .;
        __heap_start__ = .;
        PROVIDE(end = .);
        PROVIDE(_end = .);
        PROVIDE(__end = .);
        __HeapBase = .;
        . += HEAP_SIZE;
        __HeapLimit = .;
        __heap_limit = .;
        __heap_end__ = .;
    } > FLASH

    .u_boot_list :
    {
        . = ALIGN(4);
        *(SORT(.u_boot_list*))
        . = ALIGN(4);
     } > FLASH

    .global_data :
    {
        . = ALIGN(64);
        __DATA_RAM = .;
        __data_start__ = .;      /* Create a global symbol at data start. */
        *(.data .data.*)         /* .data sections */
        . = ALIGN(64);
        __data_end__ = .;        /* Define a global symbol at data end. */
        PROVIDE(__DATA_END = .);
        PROVIDE(__DATA_ROM = .);
    } > FLASH

    .stack (NOLOAD) :
    {
        . = ALIGN(64);
        __STACK_START = .;
        __StackLimit = .;
        __stack_start__ = .;
        . += STACK_SIZE;
        __stack_end__ = .;
        __StackTop = .;
    } > FLASH

    .stack_mcu2 (NOLOAD) :
    {
        . = ALIGN(64);
        __STACK_START_MCU2 = .;
        __StackLimit_MCU2 = .;
        __stack_start_mcu2__ = .;
        . += STACK_SIZE_MCU2;
        __stack_end_mcu2__ = .;
        __StackTop_MCU2 = .;
    } > FLASH

    .stack_exc (NOLOAD) :
    {
        . = ALIGN(64);
        __StackLimit_exc = .;
        __stack_start_exc__ = .;
        . += STACK_SIZE_EXC;
        __stack_end_exc__ = .;
        __StackTop_exc = .;
        __STACK_END = .;
    } > FLASH

    .stack_exc_mcu2 (NOLOAD) :
    {
        . = ALIGN(64);
        __StackLimit_exc_MCU2 = .;
        __stack_start_exc_mcu2__ = .;
        . += STACK_SIZE_EXC_MCU2;
        __stack_end_exc_mcu2__ = .;
        __StackTop_exc_MCU2 = .;
        __STACK_END_MCU2 = .;
    } > FLASH

    .init_table :
    {
      . = ALIGN(64);
      __COPY_TABLE = .;
      KEEP(*(.init_table))
    } > FLASH

    .zero_table :
    {
      . = ALIGN(64);
      __ZERO_TABLE = .;
      KEEP(*(.zero_table))
    } > FLASH

    .interrupts :
    {
        __VECTOR_TABLE = .;
        __interrupts_start__ = .;
        . = ALIGN(4);
        KEEP(*(.isr_vector))     /* Startup code */
        __interrupts_end__ = .;
        . = ALIGN(4);
    } > FLASH

  __VECTOR_RAM = __VECTOR_TABLE;
  __RAM_VECTOR_TABLE_SIZE = 0x0;
  __VECTOR_TABLE_COPY_END = __VECTOR_TABLE + __RAM_VECTOR_TABLE_SIZE;


    .interrupt_drv_shared_memory :
    {
      *(.interrupt_drv_shared_memory)
    } > FLASH

    .handlers :
    {
        . = ALIGN(32);
      *(.handlers)
    } > FLASH

    .mcal_data :
    {
        *(.mcal_data)
    } > FLASH

    .mcal_shared_data :
    {
        *(.mcal_shared_data)
    } > FLASH

    .bss (NOLOAD) :
    {
        . = ALIGN(64);
        __BSS_START = .;
        __bss_start__ = .;
        *(.bss .bss.*)
    } > FLASH

    .mcal_bss (NOLOAD) :
    {
        . = ALIGN(64);
        *(.mcal_bss)
    } > FLASH

    .mcal_shared_bss (NOLOAD) :
    {
        . = ALIGN(64);
        *(.mcal_shared_bss)
        __DATA_RAM_END = .;
        __m_ram_init_end = .;
        __bss_end__ = .;
        __BSS_END = .;
    } > FLASH

    .ipc_mdma :
    {
        *(.ipc_mdma)
    } > FLASH

    .ucheap_section (NOLOAD) :
    {
        . = ALIGN(64);
        KEEP(*(.ucheap_section))
        . = ALIGN(64);
    } > FREERTOS_HEAP

    .log (NOLOAD) :
    {
        *(.log)
    } > LOG_SHARE_Reserved

    .tcm_code :
    {
        KEEP(*(.tcm_code))
        KEEP(*(.tcm_data))
    } > ATCM_Reserved

    /*-------- LABELS USED IN CODE -------------------------------*/
    SRAM_START_ADDR         = ORIGIN(FLASH_STARTUP);
    FLASH_STARTUP_LEN       = LENGTH(FLASH_STARTUP);
    FLASH_SEC_ADDR          = ORIGIN(FLASH);
    MCU_LOG_START_ADDR      = ORIGIN(LOG_SHARE_Reserved);
    MCU_LOG_SIZE            = LENGTH(LOG_SHARE_Reserved);
    __SCMI_IPC_START_ADDR   = ORIGIN(SCMI_IPC_Reserved);
    __SCMI_IPC_SIZE         = LENGTH(SCMI_IPC_Reserved);
    NON_SECURE_START_ADDR   = ORIGIN(LOG_SHARE_Reserved);
    CAN_START_ADDR          = ORIGIN(CAN_Reserved);
    ATCM_START_ADDR         = ORIGIN(ATCM_Reserved);
    ATCM_SIZE               = LENGTH(ATCM_Reserved);
    OS_HEAP_START_ADDR      = ORIGIN(FREERTOS_HEAP);
    OS_HEAP_SIZE            = LENGTH(FREERTOS_HEAP);

    PROVIDE(SRAM_SIZE = 0x34FFFF);
    PROVIDE(MCU0_LOG_START_ADDR = 0x0CAAB000);
    PROVIDE(MCU_STATE_START_ADDR = 0x0C800800);
}
```

</DocScope>
## Introduction to startup.s Startup Code
<DocScope products="RDK S100">
1. The first instruction executed during startup enters the EL2_core_exceptions_table vector table.
```c
    .text
    .align 4
    .section ".EL2_core_exceptions_table", "ax"
    .globl  EL2_core_exceptions_table
    .type   EL2_core_exceptions_table, %function
EL2_core_exceptions_table:
    b   EL2_Reset_Handler             /* Reset Handler */
    b   EL2_Undefined_Handler         /* Undefined Handler */
    b   EL2_HVC_Handler               /* SVCall Handler */
    b   EL2_Prefetch_Handler          /* Prefetch Handler */
    b   EL2_Abort_Handler             /* Abort Handler */
    b   EL2_Trap_Handler              /* Reserved */
    b   EL2_IRQ_Handler               /* IRQ Handler */
    b   EL2_FIQ_Handler               /* FIQ Handler */
```
2. This then enters the EL2_Reset_Handler function, officially starting the boot process.
```c
EL2_Reset_Handler:
    mov r0, #0
    mov r1, r0
    mov r2, r0
    mov r3, r0
    mov r4, r0
    mov r5, r0
    mov r6, r0
    mov r7, r0
    mov r8, r0
    mov r9, r0
    mov r10, r0
    mov r11, r0
    mov r12, r0
    ldr r0, =0x23000003
    MCR p15, 0, r0, c15, c0, 0

    b MPU_Init
```
3. Before other operations, configure the address spaces needed later through the MPU. In the current S100 `startup.s`, `MPU_Init` configures region 0 through region 10. Region 1 to region 5 partition MCU SRAM into cacheable/non-cacheable areas by linker symbols (`__HEAP_START`, `__STACK_START`, `__COPY_TABLE`); region 6 to region 10 cover fixed spaces such as GIC, peripheral registers, CPUSYS, DDR, and XSPI. If SRAM partitioning needs adjustment, update both linker script and MPU configuration, and refer to the previous MCU1 image layout section.
4. Description of important MPU regions in the D-Robotics version:

:::caution
- The ARM R52 background region and the actual memory map implemented on RDK-S100 are different. For example, `0x22000000` may default to normal memory in ARM background settings, but on RDK-S100 it maps to MCU GIC and other device register space. Therefore, MPU memory attributes must match the chip implementation before access, or access exceptions may occur.

- Keep fixed peripheral/DDR/XSPI regions consistent with the D-Robotics reference code. If SRAM partitioning is adjusted, both linker script and MPU configuration must be updated together.
:::

| MPU region | Start Address | End Address | Memory Type | Description |
| --- | --- | --- | --- | --- |
| 0 | `0x08000000` | `0x0AFFFFFF` | normal memory (non-cacheable) | cluster0/cluster1 TCM |
| 1 | `0x0C800000` | `0x0CAAFFFF` | normal memory (non-cacheable) | lower MCU SRAM |
| 2 | `0x0CAB0000` | `__HEAP_START - 64` | normal memory (cacheable, read-only) | startup, code, and const sections |
| 3 | `__HEAP_START` | `__STACK_START - 64` | normal memory (non-cacheable) | heap to stack range |
| 4 | `__STACK_START` | `__COPY_TABLE - 64` | normal memory (cacheable) | stack to copy table range |
| 5 | `__COPY_TABLE` | `0x0CDFFFFF` | normal memory (non-cacheable) | upper SRAM, including log/SCMI regions |
| 6 | `0x22000000` | `0x223FFFFF` | device memory | MCU GIC related registers |
| 7 | `0x23000000` | `0x2FFFFFFF` | device memory | MCU peripheral register space |
| 8 | `0x30000000` | `0x3FFFFFFF` | device memory | CPUSYS related register space |
| 9 | `0x80000000` | `0xFFFFFFFF` | normal memory (non-cacheable) | DDR space |
| 10 | `0x18000000` | `0x1FFFFFFF` | device memory | XSPI register space |

5. The startup code then performs operations such as enable_prefetch/enable_peri_secure, enabling VFP, configuring SYSCNT registers, etc. It is recommended that customers keep this code.
6. Next, make the current core jump from hypervisor mode to el1.
```c
     /* Init ELR_hyp with stack_initialization address - init the return address when jumping from EL2 into EL1 */
     ldr r0, =EL1_Reset_Handler
     msr ELR_hyp, r0

     //Omitted some code

     /* Exception return - will jump to address pointed by ELR_hyp (main) */
     eret /* When executed in Hyp mode, ERET loads the PC from ELR_hyp and loads the CPSR from SPSR_hyp */
```
7. Next is stack initialization. In the current RDK S100 startup code, stack regions are selected by Core ID for MCU1 core0/core1, and stack pointers are configured for SVC, FIQ, IRQ, ABORT, UNDEF, and SYSTEM modes. If stack size or layout needs adjustment, check linker script symbols `STACK_SIZE`, `STACK_SIZE_EXC`, `STACK_SIZE_MCU2`, and `STACK_SIZE_EXC_MCU2`, together with the corresponding stack init logic in `startup.s`.

```asm
EL1_Reset_Handler:
    mrc p15, 0, r0, c0, c0, 5
    and r0, r0, #0x03

    mov r12, r0
    cmp r0, #0
    beq setup_mcu1_stack
    cmp r0, #1
    beq setup_mcu2_stack

setup_mcu1_stack:
    ldr         r3, =__StackTop
    ldr         r2, =__StackLimit
    ...
    /* Setup the stack for supervisor mode */
    ...
    /* Go to FIQ mode and set stack */
    ...
    /* Go to IRQ mode and set stack */
    ...
    /* Go to ABORT mode and set stack */
    ...
    /* Go to UNDEF mode and set stack */
    ...
    /* Go to SYSTEM mode and set stack */
```
8. Jump to main.
```c
    /* Enable IRQ and FIQ interrupts for the system/user mode */
    cpsie   i               /* Unmask interrupts (IRQ)*/
    cpsie   f               /* Unmask fast interrupts (FIQ)*/

    /* Go to supervisor mode */
    /* mrs         r0, cpsr */
    /* and         r0, r0, #~0x00FF */
    /* orr         r0, r0, #0x0033 */
    /* msr         cpsr_c, r0 */

    /* Jump to the main() method */
    bl main

	/* Should never get here */
	b .
    .end
```
</DocScope>
<DocScope products="RDK S600">
1. The first instruction executed during startup enters the EL2_core_exceptions_table vector table.
```c
    .text
    .align 4
    .section ".EL2_core_exceptions_table", "ax"
    .globl  EL2_core_exceptions_table
    .type   EL2_core_exceptions_table, %function
EL2_core_exceptions_table:
    b   EL2_Reset_Handler             /* Reset Handler */
    b   EL2_Undefined_Handler         /* Undefined Handler */
    b   EL2_HVC_Handler               /* SVCall Handler */
    b   EL2_Prefetch_Handler          /* Prefetch Handler */
    b   EL2_Abort_Handler             /* Abort Handler */
    b   EL2_Trap_Handler              /* Reserved */
    b   EL2_IRQ_Handler               /* IRQ Handler */
    b   EL2_FIQ_Handler               /* FIQ Handler */
```
2. This then enters the EL2_Reset_Handler function, officially starting the boot process.
```c
EL2_Reset_Handler:
    mov r0, #0
    mov r1, r0
    mov r2, r0
    mov r3, r0
    mov r4, r0
    mov r5, r0
    mov r6, r0
    mov r7, r0
    mov r8, r0
    mov r9, r0
    mov r10, r0
    mov r11, r0
    mov r12, r0
    ldr r0, =0x23000003
    MCR p15, 0, r0, c15, c0, 0

    b MPU_Init
```
3. Before performing other operations, configure the various address spaces that may be used later via the MPU at the `MPU_Init` label, configuring **regions 0 through 9** in total. **Regions 1 through 5** partition MCU SRAM into cacheable / non-cacheable areas based on linker script symbols (`__HEAP_START`, `__STACK_START`, `__COPY_TABLE`); **regions 6 through 9** cover fixed address spaces such as GIC, main-domain registers, DDR, and XSPI. See the full implementation in `Target/Target_S600/Target-hobot-lite-freertos-mcu1/target/OsAssembly/gcc/startup.s`. To adjust SRAM partitioning, update both the linker script and MPU configuration, and refer to the previous section on MCU1 image layout.

```c
MPU_Init:
          /* region 0: cluster0/cluster1 TCM, 0x04000000 ~ 0x0BFFFFFF */
          /* region 2~5: MCU SRAM partitioned by __HEAP_START / __STACK_START / __COPY_TABLE */
          /* region 7~9: main-domain registers / DDR / XSPI, see startup.s */

          /*---------------region 1 mcu sram (uncacheable)---------------*/
          ldr r0, =1                /* Region 1 */
          mcr p15, 4, r0, c6, c2, 1 /* Write HPRSELR */
          mcr p15, 0, r0, c6, c2, 1 /* Write PRSELR */

          ldr r0, =0x0C800000       /* Start address */
          orr r0, r0, #0x2          /* SH=0, AP=1, XN=0*/
          mcr p15, 4, r0, c6, c3, 0 /* Write HPRBAR */
          mcr p15, 0, r0, c6, c3, 0 /* Write PRBAR */

          ldr r0, =0x0CAAFFFF       /* End address */
          and r0, r0, #0xFFFFFFC0
          orr r0, r0, #0x3          /* AttrIndex=1, non-cacheable, enable region */
          mcr p15, 4, r0, c6, c3, 1 /* Write HPRLAR */
          mcr p15, 0, r0, c6, c3, 1 /* Write PRLAR */

          /*---------------region 6 internal gic & peripheral---------------*/
          /* device memory attribute */
          ldr r0, =6                /* Region 6 */
          mcr p15, 4, r0, c6, c2, 1 /* Write HPRSELR */
          mcr p15, 0, r0, c6, c2, 1 /* Write PRSELR */

          ldr r0, =0x22000000       /* Start address */
          orr r0, r0, #0x13         /* SH=2, AP=1, XN=1*/
          mcr p15, 4, r0, c6, c3, 0 /* Write HPRBAR */
          mcr p15, 0, r0, c6, c3, 0 /* Write PRBAR */

          ldr r0, =0x23FFFFFF       /* End address */
          sub r0, r0, #1            /* HPRLAR: (end-1), then 64B align */
          and r0, r0, #0xFFFFFFC0
          orr r0, r0, #0x7          /* AttrIndex=3, device memory, enable region */
          mcr p15, 4, r0, c6, c3, 1 /* Write HPRLAR */
          mcr p15, 0, r0, c6, c3, 1 /* Write PRLAR */

          //.....regions 0, 2~5, 7~9 and others omitted, see startup.s
```
4. Description of important MPU regions in the D-Robotics version (refer to `startup.s`):

:::caution
There are differences between the ARM R52 background region and the actual memory map implemented on the RDK-S600 chip.

For example, 0x2200_0000 belongs to normal memory space by default in the ARM background region, but on the RDK-S600 chip corresponds to **device** register space such as GIC.

Therefore, before accessing such areas, you must use the MPU to make the memory type consistent with the actual chip implementation; otherwise, access exceptions will occur. Keep regions 6 through 9 and other fixed peripheral/DDR regions consistent with the D-Robotics code. If you need to adjust regions 1 through 5 SRAM partitioning, update both the linker script and MPU configuration.
:::

| MPU region | Start Address | End Address | Memory Type | Description |
|------------|---------------|-------------|-------------|-------------|
| 0 | 0x0400_0000 | 0x0BFF_FFFF | normal memory (non-cacheable) | cluster0/cluster1 TCM |
| 1 | 0x0C80_0000 | 0x0CAA_FFFF | normal memory (non-cacheable) | MCU SRAM lower segment |
| 2 | 0x0CAB_0000 | __HEAP_START - 64 | normal memory (cacheable, read-only) | startup/code/const |
| 3 | __HEAP_START | __STACK_START - 64 | normal memory (non-cacheable) | heap to stack |
| 4 | __STACK_START | __COPY_TABLE - 64 | normal memory (cacheable) | stack to copy table |
| 5 | __COPY_TABLE | 0x0CEF_FFFF | normal memory (non-cacheable) | SRAM upper segment (log/SCMI, etc.) |
| 6 | 0x2200_0000 | 0x23FF_FFFF | device memory | MCU GIC and MCU peripheral registers |
| 7 | 0x2500_0000 | 0x7FFF_FFFF | device memory | Main-domain registers (DDRSYS/CPUSYS/BPUSYS, etc.) |
| 8 | 0x8000_0000 | 0xFFFF_FFFF | normal memory (non-cacheable) | DDR space |
| 9 | 0x1800_0000 | 0x1FFF_FFFF | device memory | XSPI register space |

5. The startup code then configures the EL2 and EL1 exception interrupt vector tables, selecting and setting the EL1 exception vector table based on the Core ID.
```c
/* Init HVBAR (Hypervisor Vector Base Address Register) */
    ldr r0, =EL2_core_exceptions_table
    mcr p15, 4, r0, c12, c0, 0 /* Move to Coprocessor from ARM Register */

/* Init VBAR (Vector Base Address Register) */
    mrc p15, 0, r1, c0, c0, 5
    and r1, r1, #0x03

    cmp r1, #0
    beq set_mcu1_vbar
    cmp r1, #1
    beq set_mcu2_vbar

set_mcu1_vbar:
    ldr r0, =EL1_core_exceptions_table
    b vbar_set_done

set_mcu2_vbar:
    ldr r0, =EL1_core_exceptions_table_MCU2

vbar_set_done:
    mcr p15, 0, r0, c12, c0, 0 /* Move to Coprocessor from ARM Register */
```
6. Initialize the stack pointer at the EL2 stage, select the stack top address based on the Core ID, and set the SP.
```c
    mrc p15, 0, r1, c0, c0, 5
    and r1, r1, #0x03

    cmp r1, #0
    beq init_mcu1_stack
    cmp r1, #1
    beq init_mcu2_stack

    b init_mcu1_stack

init_mcu1_stack:
    ldr r3, =__StackTop
    b stack_init_done

init_mcu2_stack:
    ldr r3, =__StackTop_MCU2
    b stack_init_done

init_default_stack:
    ldr r3, =__StackTop

stack_init_done:
    mov SP, r3
```
7. Perform system initialization operations, including GIC/FPU/DATA segment/BSS segment/CPSR, etc., switch to EL1, and jump to EL1_Reset_Handler.
```c
/* Call System Init */
    bl SystemInit
    bl init_data_bss
/* Init CPRS (Current Program Status Register) with the desired Mode (User, System, SVC, ..) */
    mrs r0, cpsr /* Move to ARM register from system coprocessor register */
    and r0, r0, #~0x0010 /* clear mode 10 - usr, 1f - system */
    orr r0, r0, #0x0010 /* Software executing in System mode executes at PL1. System mode has the same registers available as User mode, and is not entered by any exception. An operating system runs applications in User mode to restrict the use of system resources. Software executing in User mode executes at PL0. Execution in User mode is sometimes described as unprivileged execution. */
    msr cpsr, r0
/* Init ELR_hyp with stack_initialization address - init the return address when jumping from EL2 into EL1 */
    ldr r0, =EL1_Reset_Handler
    msr ELR_hyp, r0

    mrs r0, SPSR_hyp
    and r0, r0, #~0x00FF        /* r0 = r0 & FFFF FFE0. Clear SPSR_hyp bits [4:0] -> Execution state bit + Mode bits. */

    /* Software executing in System mode executes at PL1. System mode has the same registers available as User mode, and is not entered by any exception. An operating system runs applications in User mode to restrict the use of system resources. Software executing in User mode executes at PL0. Execution in User mode is sometimes described as unprivileged execution. */
    /* 10 - usr, 1f - system */
    orr r0, r0, #0x1f         /* r0 = r0 | 0x1df set to system mode with AIF mask */
    bic r0, r0, #(0x1 << 5)
    msr SPSR_hyp, r0
/* Configure the GIC CPU Interface */
   /* Disable group 0 interrupts */
   mov r0, #0x00
   mcr p15, 0, r0, c12, c12, 6 /* Write to ICC_IGRPEN0 */

   /* Enable group 1 interrupts */
   mov r0, #0x01
   mcr p15, 0, r0, c12, c12, 7 /* Write to ICC_IGRPEN1 */

   /* Set the interrupt priority mask to biggest value - 0x1F */
   /* Interrupts with all priorities are allowed. */

   mov r0, #0xF8 /* The priority bitfield is shifted with 3 bits - 0x1F becomes 0xF8 */
   mcr p15, 0, r0, c4, c6, 0 /* Write to ICC_PMR */

   /* Set the binary point for group 0 and group 1 interrupts */
   mov r0, #0
   mcr p15, 0, r0, c12, c8, 3  /* Write to ICC_BPR0 */
   mcr p15, 0, r0, c12, c12, 3 /* Write to ICC_BPR1 */

/* Exception return - will jump to address pointed by ELR_hyp (main) */
    eret /* When executed in Hyp mode, ERET loads the PC from ELR_hyp and loads the CPSR from SPSR_hyp */
```
8. Next is stack initialization. Each core has its own stack area. The startup code selects stack configuration based on the Core ID and sets stack pointers for SVC, FIQ, IRQ, ABORT, UNDEF, and SYSTEM modes.
```c
EL1_Reset_Handler:
    mrc p15, 0, r0, c0, c0, 5
    and r0, r0, #0x03

    mov r12, r0
    cmp r0, #0
    beq setup_mcu1_stack
    cmp r0, #1
    beq setup_mcu2_stack

     //.....Subsequent omitted code
```
9. Jump to main.
```c
    /* Enable IRQ and FIQ interrupts for the system/user mode */
    cpsie   i               /* Unmask interrupts (IRQ)*/
    cpsie   f               /* Unmask fast interrupts (FIQ)*/

    /* Go to supervisor mode */
    /* mrs         r0, cpsr */
    /* and         r0, r0, #~0x00FF */
    /* orr         r0, r0, #0x0033 */
    /* msr         cpsr_c, r0 */

    /* Jump to the main() method */
    bl main

	/* Should never get here */
	b .
    .end
```
</DocScope>