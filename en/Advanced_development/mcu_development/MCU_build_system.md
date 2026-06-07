# 7.5.3 MCU System Description

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Advanced_development/mcu_development/MCU_build_system

## Basic Description of the Compilation System

The MCU compilation system is based on Scons 3.0.0 ( [Scons 3.0.0 User Manual Official Website](https://scons.org/doc/3.0.0/HTML/scons-user.html) ).

## MCU1 Compilation System

The MCU1 compilation system is located at mcu/Build/FreeRtos_mcu1. The specific directory structure is shown in the following figure:

```c
FreeRtos_mcu1
├── build_freertos.py                   # Compilation entry script
├── SConstruct_Lite_FRtos_S100_sip_B    # Scons compilation folders and output directory
├── settings_freertos.py                # Scons compilation command parameter related file
└── Linker                              # Directory containing compilation link scripts
     └── gcc
          └── S100.ld
```

The MCU1 compilation system is located at mcu/Build/FreeRtos_mcu1. The specific directory structure is shown in the following figure:

```c
FreeRtos_mcu1
├── build_config                        # YAML files required for compilation, add/remove compilation folders
     └── S600
         └── lite-matrix-B-mcu1.yaml
├── settings_files                      # Parameters for gcc compilation and linking, etc.
     └── gcc
         └── settings_lite_freertos.py
├── site_scons                          # Scons compilation and linking command files
     └── site_tools
         └── gcc_arm.py
├── Linker                              # Directory containing compilation link scripts
     └── gcc
         └── S600.ld
└── build_freertos.py                   # Compilation entry script
```

## Introduction to the Compilation Process

![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/MCU_build_system/build_freertos-en.jpg)
## Introduction to the Relationships Among Key Files in the Compilation Process

build_freertos.py is the overall entry point for compilation. However, when actually dispatching to scons, the following can influence the scons compilation environment/process:

1. SConstruct file: The SConstruct file is the definition file for scons compilation. Together with the Sconscript file within each module, it forms the equivalent of the Cmakefile in CMake or the makefile in the Make system.
2. settings_freertos.py: The entry point for this file is actually the initialization of the "Variables" class within SConstruct. Its core function is to introduce a series of statically defined compilation environment variables. The variable names in the environment variables correspond to those in settings_freertos.py, and their values correspond to the values of those variable names. The instantiated object of the "Variables" class is then used by the Environment class for scons compilation.
3. gcc_arm.py: This file actually defines the compilation commands. The effective entry point is the "COMPILER_TOOL" field defined in settings_freertos.py. The COMPILER_TOOL field is further added by the Variables of the SConstruct file and finally retrieved by the env, including configurations such as "CC".

build_freertos.py is the overall entry point for compilation. However, when actually dispatching to scons, the following can influence the scons compilation environment/process:

1. SConstruct file: The SConstruct file is the definition file for scons compilation. Together with the Sconscript file within each module, it forms the equivalent of the Cmakefile in CMake or the makefile in the Make system.
2. settings_freertos.py: The entry point for this file is actually the initialization of the "Variables" class within SConstruct. Its core function is to introduce a series of statically defined compilation environment variables. The variable names in the environment variables correspond to those in settings_freertos.py, and their values correspond to the values of those variable names. The instantiated object of the "Variables" class is then used by the Environment class for scons compilation.
3. gcc_arm.py: This file actually defines the compilation commands. The effective entry point is the "COMPILER_TOOL" field defined in settings_freertos.py. The COMPILER_TOOL field is further added by the Variables of the SConstruct file and finally retrieved by the env, including configurations such as "CC".
4. lite-matrix-B-mcu1.yaml: The folders to be compiled. Add or remove compilation folders in this file.

## MCU1 Image Layout

| Region Name | Start Address | Size | Purpose 
| FLASH_STARTUP | 0x0CAB0000 | 1K | Startup code location 
| FLASH | 0x0CAB0400 | 2731K | Area used for code, data, stack, etc. 
| FREERTOS_HEAP | 0x0CD5B000 | 512K | Heap space 
| LOG_SHARE_Reserved | 0x0CDDB000 | 8K | Space for MCU1 logs, logs will be overwritten cyclically 
| SCMI_IPC_Reserved | 0x0CDDD000 | 12K | Space required for SCMI IPC communication, used for buffers and critical data 

In the above SRAM layout, it is strongly recommended that customers do not modify the SCMI_IPC_Reserved area and the areas after it. Most of these parts are critical locations that will definitely be used by other domains. Modifying them may lead to exceptions. If modification is necessary, please consult D-Robotics support personnel first.

Below is the linker file from the D-Robotics version, explaining the roles of some variables provided in the linker script:

```c
MEMORY
{
    FLASH_STARTUP(rx)       : org = 0x0CAB0000, len = 1K
    FLASH(rw)               : org = 0x0CAB0400, len = 2731K
    FREERTOS_HEAP(rw)       : org = 0x0CD5B000, len = 512K
    LOG_SHARE_Reserved(rw)  : org = 0x0CDDB000, len = 8K
    SCMI_IPC_Reserved(rw)   : org = 0x0CDDD000, len = 12K
}

/* Define output sections */
SECTIONS {
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

     .text :
     {
          . = ALIGN(4);
          *(.text)                 /* .text sections (code) */
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
          *(.rodata)
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
          *(.data)                 /* .data sections */
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
          *(.bss)
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

     /*-------- LABELS USED IN CODE -------------------------------*/
     SRAM_START_ADDR         = ORIGIN(FLASH_STARTUP);
     MCU_LOG_START_ADDR      = ORIGIN(LOG_SHARE_Reserved);
     __SCMI_IPC_START_ADDR   = ORIGIN(SCMI_IPC_Reserved);
     NON_SECURE_START_ADDR   = ORIGIN(LOG_SHARE_Reserved);

     PROVIDE(SRAM_SIZE = 0x34FFFF);
}
```

| Region Name | Start Address | Size | Purpose 
| FLASH_STARTUP | 0x0CAB0000 | 1K | Startup code location 
| FLASH | 0x0CAB0400 | 2667K | Area used for code, data, stack, etc. (excluding CAN) 
| CAN_Reserved | 0x0CD4B000 | 64K | Loading area for CAN module code and data 
| FREERTOS_HEAP | 0x0CD5B000 | 512K | Heap space 
| LOG_SHARE_Reserved | 0x0CDDB000 | 8K | Space for MCU1 logs, logs will be overwritten cyclically 
| SCMI_IPC_Reserved | 0x0CDDD000 | 12K | Space required for SCMI IPC communication, used for buffers and critical data 
| ATCM_Reserved | 0x0A000000 | 64K | Runtime area for CAN module code and data 

In the above SRAM layout, it is strongly recommended that customers do not modify the SCMI_IPC_Reserved area and the areas after it. Most of these parts are critical locations that will definitely be used by other domains. Modifying them may lead to exceptions. If modification is necessary, please consult D-Robotics support personnel first.

Below is the linker file from the D-Robotics version, explaining the roles of some variables provided in the linker script:

```c
MEMORY
{
    FLASH_STARTUP(rx)       : org = 0x0CAB0000, len = 1K
    FLASH(rw)               : org = 0x0CAB0400, len = 2667K
    CAN_Reserved(rw)        : org = 0x0CD4B000, len = 64K
    FREERTOS_HEAP(rw)       : org = 0x0CD5B000, len = 512K
    LOG_SHARE_Reserved(rw)  : org = 0x0CDDB000, len = 8K
    SCMI_IPC_Reserved(rw)   : org = 0x0CDDD000, len = 12K
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
        *(.text)                 /* .text sections (code) */
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
        *(.rodata)
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
        *(.data)                 /* .data sections */
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
        *(.bss)
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
    MCU_LOG_START_ADDR      = ORIGIN(LOG_SHARE_Reserved);
    __SCMI_IPC_START_ADDR   = ORIGIN(SCMI_IPC_Reserved);
    NON_SECURE_START_ADDR   = ORIGIN(LOG_SHARE_Reserved);
    CAN_START_ADDR          = ORIGIN(CAN_Reserved);
    ATCM_START_ADDR         = ORIGIN(ATCM_Reserved);

    PROVIDE(SRAM_SIZE = 0x34FFFF);
}
```

## Introduction to startup.s Startup Code

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

1. This then enters the EL2_Reset_Handler function, officially starting the boot process.

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

1. Before performing other operations, configure the various address spaces that may be used later via the MPU at the MPU_Init label. MPU region 1 is the MCU SRAM area. Users can partition the SRAM according to their needs and configure the attributes of each partition, such as shareability/non-cache, etc. The configuration in the startup code is for reference only. For the partitioning of the MCU SRAM area, refer to the previous section on MCU1 image layout. The partitioning of MCU0-related areas is not shown due to MCU0 constraints.

```c
MPU_Init:
          //.....Other omitted code

          /*-----region 1 MCU sram example configuration, modify according to your needs-------*/
          /*---------------region 1 mcu sram---------------*/
          /* normal memory attribute */
          ldr r0, =1                /* Region 1 */
          mcr p15, 4, r0, c6, c2, 1 /* Write HPRSELR */
          mcr p15, 0, r0, c6, c2, 1 /* Write PRSELR */

          ldr r0, =0x0C800000       /* Start address */
          orr r0, r0, #0x2          /* SH=0, AP=1, XN=0*/
          mcr p15, 4, r0, c6, c3, 0 /* Write HPRBAR */
          mcr p15, 0, r0, c6, c3, 0 /* Write PRBAR */

          ldr r0, =0x0CDFFFFF      /* End address */
          and r0, r0, #0xFFFFFFC0
          orr r0, r0, #0x3          /* AttrIndex=1, non-cacheable, enable region */
          mcr p15, 4, r0, c6, c3, 1 /* Write HPRLAR */
          mcr p15, 0, r0, c6, c3, 1 /* Write PRLAR */

          /*---------------region 5 internal gic & peripheral---------------*/
          /* device memory attribute            */
          ldr r0, =5                /* Region 5 */
          mcr p15, 4, r0, c6, c2, 1 /* Write HPRSELR */
          mcr p15, 0, r0, c6, c2, 1 /* Write PRSELR */

          ldr r0, =0x22000000       /* Start address */
          orr r0, r0, #0x13         /* SH=2, AP=1, XN=1*/
          mcr p15, 4, r0, c6, c3, 0 /* Write HPRBAR */
          mcr p15, 0, r0, c6, c3, 0 /* Write PRBAR */

          ldr r0, =0x223FFFFF       /* End address */
          sub r0, r0, #1
          and r0, r0, #0xFFFFFFC0
          orr r0, r0, #0x7          /* AttrIndex=3, device memory, enable region */
          mcr p15, 4, r0, c6, c3, 1 /* Write HPRLAR */
          mcr p15, 0, r0, c6, c3, 1 /* Write PRLAR */

          //.....Subsequent omitted code
```

1. Description of important MPU regions in the D-Robotics version:
caution
There are differences between the ARM R52 background region and the actual memory map implemented on the RDK-S100 chip.

For example, 0x2200_0000 belongs to normal memory space by default in the ARM background region, but on the RDK-S100 chip, this address space corresponds to device-class register space like GIC.

Therefore, for areas where the actual chip implementation differs from the background region, before accessing them, you must use the MPU to make the memory type consistent with the actual implementation of the RDK-S100 chip; otherwise, access exceptions will occur.

These areas are spaces that the MCU may need to access for normal operation. Lack of configuration for these spaces may lead to runtime exceptions. In your own version, please maintain the same address space attribute configuration as the code provided by D-Robotics. For the SRAM area, customers can partition it differently according to their project needs.

| MPU region | Start Address | End Address | Memory Type | Description 
| 0 | 0x0800_0000 | 0x0AFF_FFFF | normal memory | Space containing vdsp tcm and MCU TCM; SPL execution uses vdsp tcm 
| 7 | 0x2200_0000 | 0x223F_FFFF | device memory | Address space for MCU GIC registers, affects access to GIC registers 
| 8 | 0x2300_0000 | 0x25FF_FFFF | device memory | Space for MCU peri registers, affects access to peri registers on the MCU 
| 9 | 0x2600_0000 | 0x7FFF_FFFF | device memory | Space for various CPUSYS registers, affects MCU access to Acore-side registers 
| 10 | 0x8000_0000 | 0xFFFF_FFFF | normal memory | DDR address space, affects MCU access to DDR 
| 11 | 0x1800_0000 | 0x1FFF_FFFF | device memory | XSPI address space, affects MCU usage of flash 

1. The startup code then performs operations such as enable_prefetch/enable_peri_secure, enabling VFP, configuring SYSCNT registers, etc. It is recommended that customers keep this code.
2. Next, make the current core jump from hypervisor mode to el1.

```c
/* Init ELR_hyp with stack_initialization address - init the return address when jumping from EL2 into EL1 */
     ldr r0, =EL1_Reset_Handler
     msr ELR_hyp, r0

     //Omitted some code

     /* Exception return - will jump to address pointed by ELR_hyp (main) */
     eret /* When executed in Hyp mode, ERET loads the PC from ELR_hyp and loads the CPSR from SPSR_hyp */
```

1. Next is stack initialization. Each core has its own stack area. The startup code only initializes the stack registers for abort/undefined/system modes on the R52+, but does not initialize stack registers for irq/fiq modes, etc. Customers need to determine whether the stack registers for each mode of the R52+ need to be initialized based on their own OS situation.

```c
/* Setup the stack for supervisor mode (entered from reset) */
     mrs         r0, cpsr
     and         r0, r0, #~0x00FF
     orr         r0, r0, #0x0033
     msr         cpsr_c, r0
     sub         r3, r3, r1
     mov         SP, r3         /* top of stack to SP_svc */

     ldr         r3, =__StackTop_exc
     ldr         r2, =__StackLimit_exc
     sub         r2, r3, r2     /* r2 : size in bytes */
     mov         r4, #4
     udiv        r1, r2, r4     /* r1 : size divided by 4 */
     and         r1, r1, #~0x0f /* r1 size alligned to 16 bytes */

     /* Go to FIQ mode and set stack (below the previous one) */
     mrs         r0, cpsr
     and         r0, r0, #~0x003F
     orr         r0, r0, #0x0031
     msr         cpsr_c, r0
     sub         r3, r3, r1
     mov         SP, r3

     //.....Subsequent omitted code
```

1. Jump to main.

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

1. This then enters the EL2_Reset_Handler function, officially starting the boot process.

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

1. Before performing other operations, configure the various address spaces that may be used later via the MPU at the MPU_Init label. MPU region 1 is the MCU SRAM area. Users can partition the SRAM according to their needs and configure the attributes of each partition, such as shareability/non-cache, etc. The configuration in the startup code is for reference only. For the partitioning of the MCU SRAM area, refer to the previous section on MCU1 image layout. The partitioning of MCU0-related areas is not shown due to MCU0 constraints.

```c
MPU_Init:
          //.....Other omitted code

          /*-----region 1 MCU sram example configuration, modify according to your needs-------*/
          /*---------------region 1 mcu sram---------------*/
          /* normal memory attribute */
          ldr r0, =1                /* Region 1 */
          mcr p15, 4, r0, c6, c2, 1 /* Write HPRSELR */
          mcr p15, 0, r0, c6, c2, 1 /* Write PRSELR */

          ldr r0, =0x0C800000       /* Start address */
          orr r0, r0, #0x2          /* SH=0, AP=1, XN=0*/
          mcr p15, 4, r0, c6, c3, 0 /* Write HPRBAR */
          mcr p15, 0, r0, c6, c3, 0 /* Write PRBAR */

          ldr r0, =0x0CDFFFFF      /* End address */
          and r0, r0, #0xFFFFFFC0
          orr r0, r0, #0x3          /* AttrIndex=1, non-cacheable, enable region */
          mcr p15, 4, r0, c6, c3, 1 /* Write HPRLAR */
          mcr p15, 0, r0, c6, c3, 1 /* Write PRLAR */

          /*---------------region 5 internal gic & peripheral---------------*/
          /* device memory attribute            */
          ldr r0, =5                /* Region 5 */
          mcr p15, 4, r0, c6, c2, 1 /* Write HPRSELR */
          mcr p15, 0, r0, c6, c2, 1 /* Write PRSELR */

          ldr r0, =0x22000000       /* Start address */
          orr r0, r0, #0x13         /* SH=2, AP=1, XN=1*/
          mcr p15, 4, r0, c6, c3, 0 /* Write HPRBAR */
          mcr p15, 0, r0, c6, c3, 0 /* Write PRBAR */

          ldr r0, =0x223FFFFF       /* End address */
          sub r0, r0, #1
          and r0, r0, #0xFFFFFFC0
          orr r0, r0, #0x7          /* AttrIndex=3, device memory, enable region */
          mcr p15, 4, r0, c6, c3, 1 /* Write HPRLAR */
          mcr p15, 0, r0, c6, c3, 1 /* Write PRLAR */

          //.....Subsequent omitted code
```

1. Description of important MPU regions in the D-Robotics version:
caution
There are differences between the ARM R52 background region and the actual memory map implemented on the RDK-S600 chip.

For example, 0x2200_0000 belongs to normal memory space by default in the ARM background region, but on the RDK-S600 chip, this address space corresponds to device-class register space like GIC.

Therefore, for areas where the actual chip implementation differs from the background region, before accessing them, you must use the MPU to make the memory type consistent with the actual implementation of the RDK-S600 chip; otherwise, access exceptions will occur.

These areas are spaces that the MCU may need to access for normal operation. Lack of configuration for these spaces may lead to runtime exceptions. In your own version, please maintain the same address space attribute configuration as the code provided by D-Robotics. For the SRAM area, customers can partition it differently according to their project needs.

| MPU region | Start Address | End Address | Memory Type | Description 
| 0 | 0x4000_0000 | 0x0BFF_FFFF | normal memory | Space containing vdsp tcm and MCU TCM 
| 1 | 0x1800_0000 | 0x1FFF_FFFF | device memory | XSPI address space, affects MCU usage of flash 
| 2 | 0x2200_0000 | 0x23FF_FFFF | device memory | Address space for MCU GIC registers, affects access to GIC registers 
| 3 | 0x8000_0000 | 0x8000_03FF | normal memory | DDR needed for suspend/resume functionality 
| 4 | 0xB400_0000 | 0xB5FF_FFFF | normal memory | DDR space possibly needed for IPC functionality 
| 5 | 0xCF00_0000 | 0xCF4F_FFFF | normal memory | DDR needed for vspi flash functionality 
| 6 | 0x2500_0000 | 0x5FFF_FFFF | device memory | Acore register area, affects MCU access to Acore registers 

1. The startup code then configures the EL2 and EL1 exception interrupt vector tables, selecting and setting the EL1 exception vector table based on the Core ID.

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

1. Initialize the stack pointer at the EL2 stage, select the stack top address based on the Core ID, and set the SP.

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

1. Perform system initialization operations, including GIC/FPU/DATA segment/BSS segment/CPSR, etc., switch to EL1, and jump to EL1_Reset_Handler.

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

1. Next is stack initialization. Each core has its own stack area. The startup code selects stack configuration based on the Core ID and sets stack pointers for SVC, FIQ, IRQ, ABORT, UNDEF, and SYSTEM modes.

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

1. Jump to main.

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
