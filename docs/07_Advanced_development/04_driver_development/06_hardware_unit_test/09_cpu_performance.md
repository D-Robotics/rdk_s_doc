---
sidebar_position: 9
title: "CPU 性能测试"
description: "CPU 性能测试"
---

# CPU 性能测试

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 测试原理

`CoreMark` 是一个广泛用于评估嵌入式系统 CPU 性能的基准测试程序。其测试核心是通过模拟一些典型的嵌入式应用计算任务，来评估 CPU 在常见计算模式下的表现，测试的核心是基于以下几个要素：

- 算法选择： CoreMark 使用了以下几种基础的算法和操作：
  - 整数运算：包括加法、乘法、位操作等常见操作。
  - 数据结构：测试包含了链表、队列等数据结构的操作。
  - 控制结构：涉及循环、条件判断等基本的控制结构。
  - 矩阵乘法和基本计算任务：用来模拟常见的数值计算任务。
- 测试任务： CoreMark 测试的工作负载包括了下列几个方面：
  - 计算密集型操作：例如整数加法、乘法和位运算。
  - 内存操作：模拟典型的内存访问模式，包括链表和队列的操作。
  - 任务调度和控制：涉及复杂的控制流，例如条件判断和循环。
- 测试环境： CoreMark 的测试运行是在没有其他进程或线程干预的环境中执行的，这种方式确保了测试结果不受操作系统调度、资源管理等因素的影响，从而真实反映处理器的计算性能。
- 性能测量： CoreMark 的性能指标是 CoreMark 分数 (CoreMark score) ，这个分数反映了在测试期间执行的算法和任务的平均计算速度，分数越高，表示处理器的性能越好。

## 测试准备工作

**1.** 长时间高负载测试可能导致 CPU 温度升高，从而触发温控机制（如自动降频），影响测试结果。确保测试环境通风良好，散热正常。

**2.** 为避免其他进程干扰，建议关闭无关的后台程序，可以使用 `top` 命令查看并停止不必要的服务。

**3.** 在 /app/chip_base_test/07_cpu_performance/coremark-main 路径下，已经提供了 coremark 的源码。

**4.** 编译 O3 优化下的多核与单核性能程序

<DocScope products="RDK S100">

S100 平台为 Cortex-A78AE、6 核，编译参数应使用 `-mcpu=cortex-a78`、`-DMULTITHREAD=6`：

编译单核开启 `-O3` 的 coremark 命令：

```shell
make XCFLAGS="-O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78" REBUILD=1 run1.log

mv coremark.exe coremark_O3_single
```

编译 6 核开启 `-O3` 的 coremark 命令：

```shell
make  XCFLAGS="-O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=6 -DUSE_PTHREAD -DVALIDATION_RUN=1  -lrt -pthread" REBUILD=1 run2.log

mv coremark.exe coremark_O3_multi
```

</DocScope>
<DocScope products="RDK S600">

S600 平台为 Cortex-A78AE、18 核，编译参数应使用 `-mcpu=cortex-a78`、`-DMULTITHREAD=18`：

编译单核开启 `-O3` 的 coremark 命令：

```shell
make XCFLAGS="-O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78" REBUILD=1 run1.log

mv coremark.exe coremark_O3_single
```

编译 18 核开启 `-O3` 的 coremark 命令：

```shell
make  XCFLAGS="-O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=18 -DUSE_PTHREAD -lrt -pthread" REBUILD=1 run2.log

mv coremark.exe coremark_O3_multi
```

</DocScope>

**检测 CPU 工作频率与温度：**
使用命令 hrut_somstatus 来查看 CPU、MCU、BPU 等模块的频率与温度信息：

<DocScope products="RDK S100">

```shell
temperature-->
        pvt_cmn_pvtc1_t1 : 52.719 (C)
        pvt_cmn_pvtc1_t2 : 54.190 (C)
        pvt_mcu_pvtc1_t1 : 52.168 (C)
        pvt_mcu_pvtc1_t2 : 52.351 (C)
        pvt_bpu_pvtc1_t1 : 53.271 (C)
voltage-->
        VDD_CPU  : 776.0 (mV)
        VDD_BPU  : 737.0 (mV)
        VDD_MCU  : 748.0 (mV)
        ...
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

**手动设置 CPU 频率：**

<DocScope products="RDK S100">

设置 CPU 运行在性能模式下，命令如下：

```shell
echo userspace >/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo 1500000 >/sys/devices/system/cpu/cpufreq/policy0/scaling_setspeed
```

</DocScope>
<DocScope products="RDK S600">

设置 CPU 运行在性能模式下，命令如下（S600 各 policy 最高频率为 2100000 kHz）：

```shell
echo performance >/sys/devices/system/cpu/cpufreq/policy0/scaling_governor
```

</DocScope>

## 测试方法

<DocScope products="RDK S100">

**1. 执行单核测试（coremark_O3_single）**

确保准备工作部分的一致性后，执行命令：

```shell
./coremark_O3_single
```

等待 10 秒后得到以下结果（以下为旧参数 `-mcpu=cortex-a55` 时期的板端实测输出，保留原始记录；编译命令已更新为 `cortex-a78`，新参数实测值待复测回填）：

```yaml
2K performance run parameters for coremark.
CoreMark Size    : 666
Total ticks      : 13811
Total time (secs): 13.811000
Iterations/Sec   : 14481.210629
Iterations       : 200000
Compiler version : GCC11.3.1 20220712
Compiler flags   :  -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a55  -lrt
Memory location  : Please put data memory location here
                        (e.g. code in flash, data on heap etc)
seedcrc          : 0xe9f5
[0]crclist       : 0xe714
[0]crcmatrix     : 0x1fd7
[0]crcstate      : 0x8e3a
[0]crcfinal      : 0x4983
Correct operation validated. See README.md for run and reporting rules.
CoreMark 1.0 : 14481.210629 / GCC11.3.1 20220712  -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a55  -lrt / Heap
```

**2. 执行多核测试（coremark_O3_multi）**

确保准备工作部分的一致性后，执行命令：

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
Correct operation validated. See README.md for run and reporting rules.
CoreMark 1.0 : 84290.380360 / GCC11.3.1 20220712  -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a55 -DMULTITHREAD=8 -DUSE_PTHREAD -DVALIDATION_RUN=1  -lrt -pthread  -lrt / Heap / 8:PThreads
```

</DocScope>
<DocScope products="RDK S600">

**1. 执行单核测试（coremark_O3_single）**

确保准备工作部分的一致性后，执行命令：

```shell
./coremark_O3_single
```

板端实测结果如下：

```yaml
2K performance run parameters for coremark.
CoreMark Size    : 666
Total ticks      : 16431
Total time (secs): 16.431000
Iterations/Sec   : 18258.170531
Iterations       : 300000
Compiler version : GCC13.3.0
Compiler flags   :  -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78  -lrt
Memory location  : Please put data memory location here
                        (e.g. code in flash, data on heap etc)
seedcrc          : 0xe9f5
[0]crclist       : 0xe714
[0]crcmatrix     : 0x1fd7
[0]crcstate      : 0x8e3a
[0]crcfinal      : 0xcc42
Correct operation validated. See README.md for run and reporting rules.
CoreMark 1.0 : 18258.170531 / GCC13.3.0 -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78  -lrt / Heap
```

**2. 执行多核测试（coremark_O3_multi）**

确保准备工作部分的一致性后，执行命令：

```shell
./coremark_O3_multi -c18
```

板端实测结果如下：

```yaml
2K performance run parameters for coremark.
CoreMark Size    : 666
Total ticks      : 16839
Total time (secs): 16.839000
Iterations/Sec   : 320684.126136
Iterations       : 5400000
Compiler version : GCC13.3.0
Compiler flags   :  -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=18 -DUSE_PTHREAD -lrt -pthread  -lrt
Parallel PThreads : 18
Memory location  : Please put data memory location here
                        (e.g. code in flash, data on heap etc)
seedcrc          : 0xe9f5
Correct operation validated. See README.md for run and reporting rules.
CoreMark 1.0 : 320684.126136 / GCC13.3.0 -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=18 -DUSE_PTHREAD -lrt -pthread  -lrt / Heap / 18:PThreads
```

</DocScope>

**结果参数解析说明：**

- **`CoreMark Size`**：表示 CoreMark 基准测试的代码和数据大小，单位是字节。
- **`Total ticks`**：表示测试过程中 CPU 使用的总时钟周期数。
- **`Total time (secs)`**：表示测试所用的总时间，单位是秒。
- **`Iterations/Sec`**：每秒执行的迭代次数，即单位时间内程序运行的次数，即评分公式的 `coremark` 分数。
- **`Iterations`**：表示整个测试过程中执行的总迭代次数。
- **`seedcrc`**：CRC 校验，用于验证测试的正确性。
- **`Compiler flags`**：编译器标志。
- **`CoreMark 1.0`**：对关键信息的汇总，其数值是 CoreMark 性能得分，表示每秒迭代次数，这个值越高，表示处理器性能越强。

## 测试指标

以下标准需要在系统无工作任务时且多次取平均值测试得到， CoreMark 标准评分公式为 :

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/coremark_formula.png" alt="测试指标示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- `CoreMark Iterations/Sec`：表示每秒执行的 CoreMark 基准测试迭代次数，通常反映处理器的性能。越高的迭代次数意味着更强的计算能力。
- `CPU Clock (MHz)`：处理器的时钟频率，单位是 MHz（兆赫兹）。它反映了处理器运行的速度。
- `CPU Cores`：处理器的核心数， CoreMark 可以在单核或多核模式下进行测试。

### 分数标准

<DocScope products="RDK S100">

- `O3` 编译优化的 CoreMark ：在 S100 平台上，单核分数应达到 X > 4.2 。
- `O2` 编译优化的 CoreMark ：在 S100 平台上，单核分数应达到 X > 4.2 。

根据 O3 优化下单核测试的评分结果计算， CoreMark Iterations/Sec = 14481 次 / 秒， CPU Clock (MHz) = 1500 MHz， CPU Cores = 1 核（单核测试），根据公式计算 `CoreMark Score = 14481 /（ 1500 x 1 ） = 9.65`, 性能远高于常规 O3 优化基准（4.2），表现优秀。

根据 O3 优化下多核测试的评分结果计算， CoreMark Iterations/Sec = 84290 次 / 秒， CPU Clock (MHz) = 1500 MHz， CPU Cores = 8 核（多核测试，旧 8×A55 参数时期实测值；S100 实为 6×A78AE，新参数复测后更新），根据公式计算 `CoreMark Score = 84290 /（ 1500 x 8 ） ≈ 7.03`（旧口径）, 同样远高于 O3 多核基准（4.2），系统整体计算能力强。

</DocScope>
<DocScope products="RDK S600">

S600 平台为 Cortex-A78AE、18 核（CPU Clock = 2100 MHz）。板端实测：

根据 O3 优化下单核测试的评分结果计算， CoreMark Iterations/Sec = 18258 次 / 秒， CPU Clock (MHz) = 2100 MHz， CPU Cores = 1 核（单核测试），根据公式计算 `CoreMark Score = 18258 /（ 2100 x 1 ） ≈ 8.69`。

根据 O3 优化下多核测试的评分结果计算， CoreMark Iterations/Sec = 320684 次 / 秒， CPU Clock (MHz) = 2100 MHz， CPU Cores = 18 核（多核测试），根据公式计算 `CoreMark Score = 320684 /（ 2100 x 18 ） ≈ 8.48`。

</DocScope>

### 如何理解评分标准

这两个评分标准（-O3 和 -O2 ）实际上为不同优化级别下处理器的性能表现设定了最低要求。这个评分的意义在于：

- O3 优化是 GCC 和其他编译器中的最高优化级别，通过激进的优化策略来提高执行速度。-O3 优化级别会开启很多性能优化特性，如循环展开、内联函数等，目标是获得更高的计算性能。
- O2 优化 是相对较为保守的优化级别。相比于 -O3 ，-O2 优化不会启用一些可能导致代码大小增加的激进优化。因此，-O2 优化通常会得到更平衡的性能表现，并且能兼顾性能和可移植性。

## 常见问题

**1. 问**：需要测试多核怎样开启 `-O2` 编译优化情况下的 coremark 指标 ?

**1. 答**：测试多核以及开启 `-O2` 编译优化情况下的 coremark 指标，需要重新编译 coremark 源码，通过设置编译选项参数得到需要的 coremark 程序。在 `/app/chip_base_test/07_cpu_performance/coremark-main` 路径下，可以按照以下命令进行重新编译。

<DocScope products="RDK S100">

编译单核开启 `-O2` 的 coremark 命令：

```shell
make XCFLAGS="-O2 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78" REBUILD=1 run1.log

mv coremark.exe coremark_O2_single
```

编译 18 核开启 `-O2` 的 coremark 命令：

```shell
make XCFLAGS="-O2 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=18 -DUSE_PTHREAD -DVALIDATION_RUN=1  -lrt -pthread" REBUILD=1 run2.log

mv coremark.exe coremark_O2_mutli
```

</DocScope>
<DocScope products="RDK S600">

编译单核开启 `-O2` 的 coremark 命令：

```shell
make XCFLAGS="-O2 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78" REBUILD=1 run1.log

mv coremark.exe coremark_O2_single
```

编译 18 核开启 `-O2` 的 coremark 命令：

```shell
make XCFLAGS="-O2 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=18 -DUSE_PTHREAD -lrt -pthread" REBUILD=1 run2.log

mv coremark.exe coremark_O2_mutli
```

</DocScope>

## 相关文档

- [驱动功能单元测试](/Advanced_development/driver_development/hardware_unit_test)
- [概述](/Advanced_development/driver_development/hardware_unit_test)
- [搭建开发环境](/Advanced_development/environment_build/environment_build)
