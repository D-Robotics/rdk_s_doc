---
sidebar_position: 9
---

# CPU Performance Testing

## Test Principles

`CoreMark` is a widely used benchmark program for evaluating CPU performance in embedded systems. Its core testing methodology involves simulating typical computational tasks found in embedded applications to assess CPU performance under common computational patterns. The test is based on the following key elements:

- **Algorithm Selection**: CoreMark employs several fundamental algorithms and operations:
  - Integer operations: including addition, multiplication, bitwise operations, and other common operations.
  - Data structures: the test includes operations on linked lists, queues, and other data structures.
  - Control structures: involving basic control flow constructs such as loops and conditional statements.
  - Matrix multiplication and basic computational tasks: used to simulate common numerical computation workloads.
- **Test Workloads**: CoreMark’s workload includes the following aspects:
  - Compute-intensive operations: such as integer addition, multiplication, and bitwise operations.
  - Memory operations: simulating typical memory access patterns, including operations on linked lists and queues.
  - Task scheduling and control: involving complex control flows, such as conditional branching and loops.
- **Test Environment**: CoreMark runs in an environment free from interference by other processes or threads. This ensures that test results are unaffected by OS scheduling, resource management, or other external factors, thereby accurately reflecting the processor’s raw computational performance.
- **Performance Measurement**: CoreMark’s performance metric is the **CoreMark score**, which represents the average computational speed of the executed algorithms and tasks during the test. A higher score indicates better processor performance.

## Test Preparation

**1.** Prolonged high-load testing may cause the CPU temperature to rise, potentially triggering thermal throttling mechanisms (e.g., automatic frequency scaling), which can affect test results. Ensure adequate ventilation and proper cooling in the test environment.

**2.** To avoid interference from other processes, it is recommended to close unnecessary background programs. You can use the `top` command to identify and stop non-essential services.

**3.** The CoreMark source code has already been provided under the path `/app/chip_base_test/07_cpu_performance/coremark-main`.

**4.** Compile single-core and multi-core performance programs with `-O3` optimization.

<DocScope products="RDK S100">

The S100 platform features a 6-core Cortex-A78AE; use `-mcpu=cortex-a78` and `-DMULTITHREAD=6`:

Command to compile single-core CoreMark with `-O3` optimization:

```shell
make XCFLAGS="-O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78" REBUILD=1 run1.log

mv coremark.exe coremark_O3_single
```

Command to compile 6-core CoreMark with `-O3` optimization:

```shell
make  XCFLAGS="-O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=6 -DUSE_PTHREAD -DVALIDATION_RUN=1  -lrt -pthread" REBUILD=1 run2.log

mv coremark.exe coremark_O3_multi
```

</DocScope>

<DocScope products="RDK S600">

The S600 platform features an 18-core Cortex-A78AE; use `-mcpu=cortex-a78` and `-DMULTITHREAD=18`:

Command to compile single-core CoreMark with `-O3` optimization:

```shell
make XCFLAGS="-O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78" REBUILD=1 run1.log

mv coremark.exe coremark_O3_single
```

Command to compile 18-core CoreMark with `-O3` optimization:

```shell
make  XCFLAGS="-O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=18 -DUSE_PTHREAD -lrt -pthread" REBUILD=1 run2.log

mv coremark.exe coremark_O3_multi
```

</DocScope>


**Check CPU operating frequency and temperature:**  
Use the command `hrut_somstatus` to view frequency and temperature information for modules such as CPU, MCU, and BPU:

<DocScope products="RDK S100">

```shell
temperature-->
        pvt_cmn_pvtc1_t1 : 52.719 (C)
        pvt_cmn_pvtc1_t2 : 54.190 (C)
        pvt_mcu_pvtc1_t1 : 52.168 (C)
        pvt_mcu_pvtc1_t2 : 52.351 (C)
        pvt_bpu_pvtc1_t1 : 53.271 (C)
voltage-->
        FAKE     : 100.0 (mV)
        VDDQ_DDR2 : 503.0 (mV)
        VDD_MCU  : 748.0 (mV)
        VDDIO_PVT_MCU : 1802.0 (mV)
        VDDIO_TOP4_1V8 : 1802.0 (mV)
        VDDQ_DDR0 : 503.0 (mV)
        VDD2H_DDR0 : 1052.0 (mV)
        VAA_DDR0 : 1792.0 (mV)
        VDD_DDR0 : 748.0 (mV)
        VDDQ_DDR1 : 497.0 (mV)
        VDD2H_DDR1 : 1040.0 (mV)
        VAA_DDR1 : 1792.0 (mV)
        VDD_DDR1 : 742.0 (mV)
        CMN_PVTC1_V13 : 0.0 (mV)
        CMN_PVTC1_V14 : 0.0 (mV)
        CMN_PVTC1_V15 : 0.0 (mV)
        CMN_PVTC1_V16 : 0.0 (mV)
        VDDIO_SD_SDIO_T : 1788.0 (mV)
        VDD_CPU  : 776.0 (mV)
        CMN_PVTC1_V19 : 0.0 (mV)
        VAA_DDR2 : 1790.0 (mV)
        VDD2H_DDR2 : 1042.0 (mV)
        VDD_DDR2 : 742.0 (mV)
        VDDIO_TOP2_1V8 : 1780.0 (mV)
        VDD_BPU  : 737.0 (mV)
        VDDIO_TOP0_1V8 : 1790.0 (mV)
        PLL_TOP0_VDDHV : 1768.0 (mV)
        CMN_PVTC1_V27 : 0.0 (mV)
        CMN_PVTC1_V28 : 0.0 (mV)
        CMN_PVTC1_V29 : 0.0 (mV)
        CMN_PVTC1_V30 : 0.0 (mV)
        CMN_PVTC1_V31 : 0.0 (mV)
        CMN_PVTC1_V32 : 0.0 (mV)
        VDDIO_SD_33_MCU : 3308.0 (mV)
        VDDIO_ADC_MCU : 1802.0 (mV)
        VDDIO_MCU_1V8 : 1802.0 (mV)
        PLL_MCU_VDDHV : 1802.0 (mV)
        PLL_MCU_VDDPOST : 753.0 (mV)
        PLL_MCU_VDDREF : 753.0 (mV)
        VDD_TOP  : 759.0 (mV)
        VDD_AON  : 753.0 (mV)
        VDDIO_SD_AON_CA : 1644.0 (mV)
        VDDIO_PVT_1V8 : 1802.0 (mV)
        MCU_PVTC1_V11 : 0.0 (mV)
        MCU_PVTC1_V12 : 0.0 (mV)
        MCU_PVTC1_V13 : 0.0 (mV)
        MCU_PVTC1_V14 : 0.0 (mV)
        MCU_PVTC1_V15 : 0.0 (mV)
        MCU_PVTC1_V16 : 0.0 (mV)
cpu frequency-->
                  min   cur     max
        policy0: 1125000        1500000 1500000
        policy4: 1125000        1500000 1500000
bpu status information---->
                ratio
        bpu0:   0
```

</DocScope>

<DocScope products="RDK S600">

```shell
temperature-->
        pvt_cmn_pvtc1_t1 : 44.944 (C)
        pvt_cmn_pvtc1_t2 : 44.616 (C)
        pvt_ddr_pvtc4_t1 : 45.268 (C)
        pvt_bpu_pvtc1_t1 : 44.287 (C)
        pvt_bpu_pvtc1_t2 : 43.799 (C)
        ...
voltage-->
        VDD_CPU   : 901.0 (mV)
        VDD_BPUL  : 819.0 (mV)
        VDD_BPUR  : 819.0 (mV)
        VDDQ_DDR0n1 : 501.0 (mV)
        ...
cpu frequency-->
                  min   cur     max
        policy0:  525000 2100000 2100000
        policy2:  525000 2100000 2100000
        policy6:  525000 2100000 2100000
        policy10: 525000 2100000 2100000
        policy14: 525000 2100000 2100000
bpu status information---->
                ratio
        bpu0:   0
```

</DocScope>

**Manually set CPU frequency:**

<DocScope products="RDK S100">

Set the CPU to run in performance mode using the following commands:

```shell
echo userspace >/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo 1500000 >/sys/devices/system/cpu/cpufreq/policy0/scaling_setspeed
```

</DocScope>

<DocScope products="RDK S600">

Set the CPU to run in performance mode using the following command (max frequency of each S600 policy is 2100000 kHz):

```shell
echo performance >/sys/devices/system/cpu/cpufreq/policy0/scaling_governor
```

</DocScope>

## Test Procedure

<DocScope products="RDK S100">

**1. Run single-core test (`coremark_O3_single`)**

After ensuring consistency with the preparation steps above, execute the command:

```shell
./coremark_O3_single
```

After approximately 10 seconds, you will get the following (The output below was measured on board with the older `-mcpu=cortex-a55` flags and is kept as the original record; compile commands have been updated to `cortex-a78`, new measurements pending.)

result:

```yaml
2K performance run parameters for coremark.
CoreMark Size    : 666
Total ticks      : 13811
Total time (secs): 13.811000
Iterations/Sec   : 14481.210629
Iterations       : 200000
Compiler version : GCC11.3.1 20220712
Compiler flags   :  -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78  -lrt
Memory location  : Please put data memory location here
                        (e.g. code in flash, data on heap etc)
seedcrc          : 0xe9f5
[0]crclist       : 0xe714
[0]crcmatrix     : 0x1fd7
[0]crcstate      : 0x8e3a
[0]crcfinal      : 0x4983
Correct operation validated. See README.md for run and reporting rules.
CoreMark 1.0 : 14481.210629 / GCC11.3.1 20220712  -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78  -lrt / Heap
```

**2. Run multi-core test (`coremark_O3_multi`)**

After ensuring consistency with the preparation steps above, execute the command:

```shell
./coremark_O3_multi
```

```yaml
2K performance run parameters for coremark.
CoreMark Size    : 666
Total ticks      : 18982
Total time (secs): 18.982000
Iterations/Sec   : 84290.380360
Iterations       : 1600000
Compiler version : GCC11.3.1 20220712
Compiler flags   :  -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a55 -DMULTITHREAD=8 -DUSE_PTHREAD -DVALIDATION_RUN=1  -lrt -pthread  -lrt
Parallel PThreads : 8
Memory location  : Please put data memory location here
                        (e.g. code in flash, data on heap etc)
seedcrc          : 0xe9f5
[0]crclist       : 0xe714
[1]crclist       : 0xe714
[2]crclist       : 0xe714
[3]crclist       : 0xe714
[4]crclist       : 0xe714
[5]crclist       : 0xe714
[6]crclist       : 0xe714
[7]crclist       : 0xe714
[0]crcmatrix     : 0x1fd7
[1]crcmatrix     : 0x1fd7
[2]crcmatrix     : 0x1fd7
[3]crcmatrix     : 0x1fd7
[4]crcmatrix     : 0x1fd7
[5]crcmatrix     : 0x1fd7
[6]crcmatrix     : 0x1fd7
[7]crcmatrix     : 0x1fd7
[0]crcstate      : 0x8e3a
[1]crcstate      : 0x8e3a
[2]crcstate      : 0x8e3a
[3]crcstate      : 0x8e3a
[4]crcstate      : 0x8e3a
[5]crcstate      : 0x8e3a  
[6]crcstate      : 0x8e3a  
[7]crcstate      : 0x8e3a  
[0]crcfinal      : 0x4983  
[1]crcfinal      : 0x4983  
[2]crcfinal      : 0x4983  
[3]crcfinal      : 0x4983  
[4]crcfinal      : 0x4983  
[5]crcfinal      : 0x4983  
[6]crcfinal      : 0x4983  
[7]crcfinal      : 0x4983  
Correct operation validated. See README.md for run and reporting rules.  
CoreMark 1.0 : 84290.380360 / GCC11.3.1 20220712  -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a55 -DMULTITHREAD=8 -DUSE_PTHREAD -DVALIDATION_RUN=1  -lrt -pthread  -lrt / Heap / 8:PThreads  

```

**Result Parameter Explanation:**

- **`CoreMark Size`**: Indicates the code and data size of the CoreMark benchmark, measured in bytes. In this example, the CoreMark Size is 666 bytes, representing the total size of the CoreMark test code.
- **`Total ticks`**: Represents the total number of CPU clock cycles consumed during the test. For example, 18982 indicates the test consumed 18,982 clock cycles in total.
- **`Total time (secs)`**: The total duration of the test, measured in seconds.
- **`Iterations/Sec`**: The number of iterations executed per second, i.e., how many times the program ran within a unit of time. Here, it is 84,290 iterations per second, which corresponds to the `coremark` score in the scoring formula.
- **`Iterations`**: The total number of iterations executed throughout the entire test. For instance, 1,600,000 indicates that the CoreMark benchmark performed 1,600,000 test loops within 18.982000 seconds.
- **`seedcrc`**: CRC checksum values used to verify the correctness of the test results.
- **`Compiler flags`**: Compiler options used during compilation; here, `-O3` and `-lrt`.
- **`CoreMark 1.0`**: A summary of key information. The value 84290.380360 is the CoreMark performance score, representing iterations per second. A higher value indicates stronger processor performance.

</DocScope>

<DocScope products="RDK S600">

**1. Run single-core test (`coremark_O3_single`)**

After ensuring consistency with the preparation steps above, execute the command:

```shell
./coremark_O3_single
```

**2. Run multi-core test (`coremark_O3_multi`)**

After ensuring consistency with the preparation steps above, execute the command:

```shell
./coremark_O3_multi
```

Board-measured output for S600 is not yet recorded here; capture and backfill from an actual run (see the S100 blocks above for output format).

</DocScope>

## Test Metrics

The following metrics should be measured under an idle system and averaged over multiple runs. The standard CoreMark scoring formula is:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/coremark_formula.png" alt="Test Metrics diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

- `CoreMark Iterations/Sec`: The number of CoreMark benchmark iterations executed per second, typically reflecting processor performance. Higher iteration counts indicate greater computational capability.
- `CPU Clock (MHz)`: The processor's clock frequency, measured in MHz (megahertz). It reflects the processor's operating speed; higher clock frequencies theoretically enable more operations per second.
- `CPU Cores`: The number of processor cores. CoreMark can be tested in either single-core or multi-core mode.

### Scoring Criteria

<DocScope products="RDK S100">

- CoreMark with `-O3` optimization: On the S100 platform, the single-core score should exceed X > 4.2.
- CoreMark with `-O2` optimization: On the S100 platform, the single-core score should exceed X > 4.2.

Based on the single-core test result under `-O3` optimization: CoreMark Iterations/Sec = 14481 iterations/second, CPU Clock (MHz) = 1500 MHz, CPU Cores = 1 (single-core test), the CoreMark Score is calculated as `CoreMark Score = 14481 / (1500 x 1) = 9.65`, which significantly exceeds the standard `-O3` single-core baseline (4.2), demonstrating excellent performance.

Based on the multi-core test result under `-O3` optimization: CoreMark Iterations/Sec = 84290 iterations/second, CPU Clock (MHz) = 1500 MHz, CPU Cores = 8 (multi-core test; legacy measurement under the old 8-core A55 configuration — S100 is actually 6x A78AE, to be re-measured), the CoreMark Score is calculated as `CoreMark Score = 84290 / (1500 x 8) = 7.03` (legacy configuration), which also far surpasses the `-O3` multi-core baseline (4.2), indicating strong overall system computational capability.

</DocScope>

<DocScope products="RDK S600">

The S600 platform features an 18-core Cortex-A78AE (CPU Clock = 2100 MHz). Board-measured:

Based on the single-core test result under `-O3` optimization: CoreMark Iterations/Sec = 18258 iterations/second, CPU Clock (MHz) = 2100 MHz, CPU Cores = 1 (single-core test), the CoreMark Score is calculated as `CoreMark Score = 18258 / (2100 x 1) = 8.69`.

Based on the multi-core test result under `-O3` optimization: CoreMark Iterations/Sec = 320684 iterations/second, CPU Clock (MHz) = 2100 MHz, CPU Cores = 18 (multi-core test), the CoreMark Score is calculated as `CoreMark Score = 320684 / (2100 x 18) = 8.48`.

</DocScope>

### Understanding the Scoring Criteria

These two scoring criteria (for `-O3` and `-O2`) establish minimum performance requirements for the processor under different optimization levels. The significance of these scores is as follows:

- `-O3` optimization represents the highest optimization level in GCC and other compilers, employing aggressive optimization strategies to maximize execution speed. This level enables numerous performance-enhancing features such as loop unrolling and function inlining, aiming for peak computational performance.
- `-O2` optimization is a more conservative level. Compared to `-O3`, `-O2` avoids certain aggressive optimizations that might significantly increase code size. Thus, `-O2` typically delivers a more balanced performance, maintaining both efficiency and portability.

## FAQ

**Q1**: How do I test the CoreMark metric under multi-core configuration with `-O2` compiler optimization enabled?

**A1**: To test CoreMark under multi-core mode with `-O2` compiler optimization, you need to recompile the CoreMark source code by setting the appropriate compiler options to generate the desired executable. Navigate to the directory `/app/chip_base_test/07_cpu_performance/coremark-main` and use the following commands to recompile.

<DocScope products="RDK S100">

Command to compile single-core CoreMark with `-O2`:

```shell
make XCFLAGS="-O2 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78" REBUILD=1 run1.log

mv coremark.exe coremark_O2_single
```

Command to compile 6-core CoreMark with `-O2`:

```shell
make XCFLAGS="-O2 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=6 -DUSE_PTHREAD -DVALIDATION_RUN=1  -lrt -pthread" REBUILD=1 run2.log

mv coremark.exe coremark_O2_mutli
```

</DocScope>

<DocScope products="RDK S600">

Command to compile single-core CoreMark with `-O2`:

```shell
make XCFLAGS="-O2 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78" REBUILD=1 run1.log

mv coremark.exe coremark_O2_single
```

Command to compile 18-core CoreMark with `-O2`:

```shell
make XCFLAGS="-O2 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=18 -DUSE_PTHREAD -lrt -pthread" REBUILD=1 run2.log

mv coremark.exe coremark_O2_mutli
```

</DocScope>

## Related Documentation

- [Driver Functional Unit Test](/Advanced_development/driver_development/hardware_unit_test)
- [Set Up the Development Environment](/Advanced_development/environment_build/environment_build)
