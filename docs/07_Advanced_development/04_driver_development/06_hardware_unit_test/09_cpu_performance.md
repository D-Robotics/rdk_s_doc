---
sidebar_position: 9
title: "CPU 性能测试"
description: "CPU 性能测试"
---

# CPU 性能测试

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 功能概述

本测试使用 CoreMark 基准程序评估 CPU 的整数计算性能，分别记录单核与多核模式下的 CoreMark 分数（`Iterations/Sec`），用于对比优化级别、核数与工作频率对计算性能的影响。

CoreMark 源码已预置在开发板 `/app/chip_base_test/07_cpu_performance/coremark-main/` 目录下，按本文「使用方法」编译后即可运行。

:::tip
板端只提供 CoreMark 源码，**没有**预编译好的 `coremark_O3_single`、`coremark_O3_multi` 等可执行程序。这两类程序需要按本文命令自行编译生成。
:::

## 测试原理

`CoreMark` 是一个广泛用于评估嵌入式系统 CPU 性能的基准测试程序。其测试核心是通过模拟典型的嵌入式应用计算任务，来评估 CPU 在常见计算模式下的表现。测试的核心基于以下几个要素：

- 算法选择：CoreMark 使用了以下几种基础的算法和操作。
  - 整数运算：包括加法、乘法、位操作等常见操作。
  - 数据结构：测试包含了链表、队列等数据结构的操作。
  - 控制结构：涉及循环、条件判断等基本的控制结构。
  - 矩阵乘法和基本计算任务：用来模拟常见的数值计算任务。
- 测试任务：CoreMark 测试的工作负载包括下列几个方面。
  - 计算密集型操作：例如整数加法、乘法和位运算。
  - 内存操作：模拟典型的内存访问模式，包括链表和队列的操作。
  - 任务调度和控制：涉及复杂的控制流，例如条件判断和循环。
- 测试环境：CoreMark 的测试运行在没有其他进程或线程干预的环境中执行。这种方式确保了测试结果不受操作系统调度、资源管理等因素的影响，从而真实反映处理器的计算性能。
- 性能测量：CoreMark 的性能指标是 CoreMark 分数（CoreMark score），这个分数反映了在测试期间执行的算法和任务的平均计算速度。分数越高，表示处理器的性能越好。

## 环境准备

- 硬件：开发板一台，散热条件良好。
- 系统：RDK OS 镜像，已通过 SSH 或调试串口登录板端。
- 依赖：板端预装 `gcc` 与 `make`，无需额外安装软件包。

长时间高负载测试会导致 CPU 温度升高，从而触发温控机制（如自动降频），影响测试结果。测试前请确认以下三点：

- 测试环境通风良好、散热正常。
- 关闭无关的后台程序，可以使用 `top` 命令查看并停止不必要的服务。
- 板端处于空闲状态。`top` 只能看出占用 CPU 的进程；若板上有持续的磁盘读写（例如同时有人在跑存储压测），跑分会被明显拉低。用 `vmstat 1 3` 确认 `id` 接近 100、`wa` 接近 0 后再开始测试。

### 检测 CPU 工作频率与温度

使用命令 `hrut_somstatus` 查看 CPU、MCU、BPU 等模块的频率与温度信息：

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

### 手动设置 CPU 频率

<DocScope products="RDK S100">

设置 CPU 运行在性能模式下，命令如下：

```shell
echo userspace >/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo 1500000 >/sys/devices/system/cpu/cpufreq/policy0/scaling_setspeed
```

</DocScope>
<DocScope products="RDK S600">

设置 CPU 运行在性能模式下，命令如下（S600 各 policy 最高频率为 2100000kHz）：

```shell
echo performance >/sys/devices/system/cpu/cpufreq/policy0/scaling_governor
```

</DocScope>

:::note 注意
`hrut_somstatus` 输出的 `cpu frequency` 中，`cur` 列应等于 `max` 列（即 CPU 未被降频）。若 `cur` 明显低于 `max`，请先按上面的命令切换性能模式并确认散热正常，再开始测试。
:::

## 代码位置

CoreMark 源码位于板端 `/app/chip_base_test/07_cpu_performance/coremark-main/` 目录：

```text
/app/chip_base_test/07_cpu_performance/
└── coremark-main/
    ├── Makefile
    ├── README.md
    ├── LICENSE.md
    ├── coremark.md5
    ├── core_main.c
    ├── core_list_join.c
    ├── core_matrix.c
    ├── core_state.c
    ├── core_util.c
    ├── coremark.h
    ├── aarch64/
    │   ├── core_portme.c
    │   ├── core_portme.h
    │   ├── core_portme.mak
    │   └── core_portme_posix_overrides.h
    ├── linux/
    │   └── core_portme.mak
    ├── posix/
    │   ├── core_portme.c
    │   ├── core_portme.h
    │   ├── core_portme.mak
    │   └── core_portme_posix_overrides.h
    ├── barebones/
    ├── cygwin/
    ├── freebsd/
    ├── macos/
    ├── rtems/
    ├── simple/
    └── docs/
```

板端编译默认走 `linux` 端口，该端口的 `core_portme.mak` 会引用 `posix/` 下的端口实现，因此实际参与编译的端口源码在 `posix/` 目录。

## 使用方法

### 编译单核与多核程序

在 `/app/chip_base_test/07_cpu_performance/coremark-main` 路径下编译。下面的命令会先编译再自动跑一次基准测试，因此耗时包含一次完整运行。

<DocScope products="RDK S100">

S100 平台为 Cortex-A78AE、6 核，编译参数应使用 `-mcpu=cortex-a78`、`-DMULTITHREAD=6`：

编译单核开启 `-O3` 的 coremark 命令：

```shell
make XCFLAGS="-O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78" REBUILD=1 run1.log

mv coremark.exe coremark_O3_single
```

编译 6 核开启 `-O3` 的 coremark 命令：

```shell
make  XCFLAGS="-O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=6 -DUSE_PTHREAD -lrt -pthread" REBUILD=1 run2.log

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

:::note 注意
以上命令没有显式指定 `PORT_DIR`，板端 Linux 环境下会自动使用 `linux` 端口。该端口的 `PORT_CFLAGS` 为 `-O2`，会与 `XCFLAGS` 中的 `-O3` 一并出现在输出的 `Compiler flags` 行（呈现为 `-O2 -O3 ...`）。GCC 以最后一个 `-O` 选项为准（`PORT_CFLAGS` 排在 `XCFLAGS` 之前），实际生效的仍是 `-O3`，多出来的这条 `-O2` 不会改变跑分结果。
:::

### 运行测试

<DocScope products="RDK S100">

**1. 执行单核测试（coremark_O3_single）**

确保准备工作部分的一致性后，执行命令：

```shell
./coremark_O3_single
```

等待约 10 秒后，板端实测结果如下：

```yaml
2K performance run parameters for coremark.
CoreMark Size    : 666
Total ticks      : 12879
Total time (secs): 12.879000
Iterations/Sec   : 15529.155990
Iterations       : 200000
Compiler version : GCC11.4.0
Compiler flags   : -O2 -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78  -lrt
Memory location  : Please put data memory location here
			(e.g. code in flash, data on heap etc)
seedcrc          : 0xe9f5
[0]crclist       : 0xe714
[0]crcmatrix     : 0x1fd7
[0]crcstate      : 0x8e3a
[0]crcfinal      : 0x4983
Correct operation validated. See README.md for run and reporting rules.
CoreMark 1.0 : 15529.155990 / GCC11.4.0 -O2 -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78  -lrt / Heap
```

**2. 执行多核测试（coremark_O3_multi）**

确保准备工作部分的一致性后，执行命令：

```shell
./coremark_O3_multi
```

板端实测结果如下：

```yaml
2K performance run parameters for coremark.
CoreMark Size    : 666
Total ticks      : 13254
Total time (secs): 13.254000
Iterations/Sec   : 90538.705297
Iterations       : 1200000
Compiler version : GCC11.4.0
Compiler flags   : -O2 -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=6 -DUSE_PTHREAD -lrt -pthread  -lrt
Parallel PThreads : 6
Memory location  : Please put data memory location here
			(e.g. code in flash, data on heap etc)
seedcrc          : 0xe9f5
[0]crclist       : 0xe714
[0]crcmatrix     : 0x1fd7
[0]crcstate      : 0x8e3a
[0]crcfinal      : 0x4983
...
Correct operation validated. See README.md for run and reporting rules.
CoreMark 1.0 : 90538.705297 / GCC11.4.0 -O2 -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=6 -DUSE_PTHREAD -lrt -pthread  -lrt / Heap / 6:PThreads
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
Compiler flags   : -O2 -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78  -lrt
Memory location  : Please put data memory location here
			(e.g. code in flash, data on heap etc)
seedcrc          : 0xe9f5
[0]crclist       : 0xe714
[0]crcmatrix     : 0x1fd7
[0]crcstate      : 0x8e3a
[0]crcfinal      : 0xcc42
Correct operation validated. See README.md for run and reporting rules.
CoreMark 1.0 : 18258.170531 / GCC13.3.0 -O2 -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78  -lrt / Heap
```

**2. 执行多核测试（coremark_O3_multi）**

确保准备工作部分的一致性后，执行命令：

```shell
./coremark_O3_multi
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
Compiler flags   : -O2 -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=18 -DUSE_PTHREAD -lrt -pthread  -lrt
Parallel PThreads : 18
Memory location  : Please put data memory location here
			(e.g. code in flash, data on heap etc)
seedcrc          : 0xe9f5
[0]crclist       : 0xe714
[0]crcmatrix     : 0x1fd7
[0]crcstate      : 0x8e3a
[0]crcfinal      : 0xcc42
...
Correct operation validated. See README.md for run and reporting rules.
CoreMark 1.0 : 320684.126136 / GCC13.3.0 -O2 -O3 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=18 -DUSE_PTHREAD -lrt -pthread  -lrt / Heap / 18:PThreads
```

</DocScope>

### 多核线程数说明

多核测试的并行线程数由**编译期**的 `-DMULTITHREAD=N` 决定，可执行程序本身不提供 `-c` 一类的线程数选项。运行 `./coremark_O3_multi -c<N>` 时，`-c<N>` 不会被识别为线程数参数，程序仍按编译时写入的线程数运行（板端实测输出与不带参数运行一致）。因此直接执行 `./coremark_O3_multi` 即可。

如需在运行时减少并行线程数（不得超过编译时的 `MULTITHREAD` 值），使用 `M<线程数>` 作为第一个参数。板端实测 `./coremark_O3_multi M4` 的输出为 `Parallel PThreads : 4`。

## 运行效果

### 成功标志

测试正常完成时，输出末尾应包含以下内容：

- `Correct operation validated. See README.md for run and reporting rules.`
- 不出现 `Errors detected`。
- 出现 `CoreMark 1.0 : <分数> / ...` 行。该行仅在 `2K performance run` 口径下打印，`<分数>` 即评分用的 `Iterations/Sec`。

`2K performance run` 口径下（`seedcrc` 为 `0xe9f5`），各个线程的算法校验值应为：

| 字段 | 期望值 |
|---|---|
| `[N]crclist` | `0xe714` |
| `[N]crcmatrix` | `0x1fd7` |
| `[N]crcstate` | `0x8e3a` |

:::note 注意
`[N]crcfinal` 不是有效性判据。它由实际执行的迭代次数决定，而 `Iterations` 默认（`ITERATIONS=0`）由 CoreMark 在运行时**试跑标定**：先按 10、100、1000…… 递增试跑，直到单次运行超过 1 秒，再按该轮实测耗时把次数放大到约 10 秒。因此单核速度不同的平台会得到不同的 `Iterations`，`crcfinal` 也随之不同；同一平台上单核与多核的每线程迭代次数相同，`crcfinal` 相同。CoreMark 只校验 `crclist`、`crcmatrix`、`crcstate` 三项。

多核运行时，每个线程都会各打印一组 `[N]crc*` 行。上面两段多核实测输出只保留 `[0]` 组并以 `...` 略去其余线程，各线程数值与 `[0]` 相同。
:::

### 结果参数解析

- **`CoreMark Size`**：表示 CoreMark 基准测试的代码和数据大小，单位是字节。
- **`Total ticks`**：表示测试过程中 CPU 使用的总时钟周期数。
- **`Total time (secs)`**：表示测试所用的总时间，单位是秒。结果有效的前提是该值不小于 10 秒。
- **`Iterations/Sec`**：每秒执行的迭代次数，即评分公式的 `CoreMark` 分数。
- **`Iterations`**：表示整个测试过程中执行的总迭代次数。
- **`Parallel PThreads`**：多核测试实际使用的并行线程数，等于编译期 `-DMULTITHREAD` 的值（运行时用 `M<n>` 参数可调小）。
- **`seedcrc`**：种子校验值，用于判定测试口径。`0xe9f5` 对应 `2K performance run`。
- **`Compiler flags`**：编译器标志。
- **`CoreMark 1.0`**：对关键信息的汇总，其数值是 CoreMark 性能得分，表示每秒迭代次数。这个值越高，表示处理器性能越强。

:::note 注意
同一块板卡、同一空闲状态下重复测试时，`Iterations/Sec` 通常在 5% 以内波动。对比不同优化级别或不同核数的结果时，请在同一散热条件、同一频率下多次取平均值；若板上有后台负载（尤其是磁盘读写），跑分会明显偏低，不宜跨状态对比。
:::

## 测试指标

以下标准需要在系统无工作任务时且多次取平均值测试得到，CoreMark 标准评分公式为：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/coremark_formula.png" alt="测试指标示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- `CoreMark Iterations/Sec`：表示每秒执行的 CoreMark 基准测试迭代次数，通常反映处理器的性能。越高的迭代次数意味着更强的计算能力。
- `CPU Clock (MHz)`：处理器的时钟频率，单位是 MHz（兆赫兹）。它反映了处理器运行的速度。
- `CPU Cores`：处理器的核心数，CoreMark 可以在单核或多核模式下进行测试。

### 分数标准

- `O3` 编译优化的 CoreMark：单核分数应达到 X > 4.2。
- `O2` 编译优化的 CoreMark：单核分数应达到 X > 4.2。

<DocScope products="RDK S100">

S100 平台为 Cortex-A78AE、6 核（CPU Clock = 1500MHz）。板端实测：

根据 O3 优化下单核测试的评分结果计算，CoreMark Iterations/Sec = 15529 次/秒，CPU Clock (MHz) = 1500MHz，CPU Cores = 1 核（单核测试），根据公式计算 `CoreMark Score = 15529 /（1500 x 1） ≈ 10.35`，性能远高于常规 O3 优化基准（4.2），表现优秀。

根据 O3 优化下多核测试的评分结果计算，CoreMark Iterations/Sec = 90538 次/秒，CPU Clock (MHz) = 1500MHz，CPU Cores = 6 核（多核测试），根据公式计算 `CoreMark Score = 90538 /（1500 x 6） ≈ 10.06`，同样远高于 O3 多核基准（4.2），系统整体计算能力强。

</DocScope>
<DocScope products="RDK S600">

S600 平台为 Cortex-A78AE、18 核（CPU Clock = 2100MHz）。板端实测：

根据 O3 优化下单核测试的评分结果计算，CoreMark Iterations/Sec = 18258 次/秒，CPU Clock (MHz) = 2100MHz，CPU Cores = 1 核（单核测试），根据公式计算 `CoreMark Score = 18258 /（2100 x 1） ≈ 8.69`，性能远高于常规 O3 优化基准（4.2），表现优秀。

根据 O3 优化下多核测试的评分结果计算，CoreMark Iterations/Sec = 320684 次/秒，CPU Clock (MHz) = 2100MHz，CPU Cores = 18 核（多核测试），根据公式计算 `CoreMark Score = 320684 /（2100 x 18） ≈ 8.48`，同样远高于 O3 多核基准（4.2），系统整体计算能力强。

</DocScope>

### 如何理解评分标准

这两个评分标准（-O3 和 -O2）实际上为不同优化级别下处理器的性能表现设定了最低要求。这个评分的意义在于：

- O3 优化是 GCC 和其他编译器中的最高优化级别，通过激进的优化策略来提高执行速度。-O3 优化级别会开启很多性能优化特性，如循环展开、内联函数等，目标是获得更高的计算性能。
- O2 优化是相对较为保守的优化级别。相比于 -O3，-O2 优化不会启用一些可能导致代码大小增加的激进优化。因此，-O2 优化通常会得到更平衡的性能表现，并且能兼顾性能和可移植性。

## 常见问题

### 报错 Must execute for at least 10 secs for a valid result

**原因**：测试时长不足 10 秒，结果无效。

**解决**：不要显式指定过小的 `ITERATIONS`，使用默认的自动确定模式（`ITERATIONS=0`）。

### 报错 list crc / crcmatrix / crcstate - should be ...，末尾输出 Errors detected

**原因**：算法校验值不匹配，测试结果不可信。

**解决**：确认编译参数与本文一致；确认没有其他进程抢占 CPU；重新编译后重试。

### 报错 Cannot validate operation for these seed values

**原因**：传入的种子组合不属于任何已知口径。

**解决**：按本文命令不带位置参数运行 `./coremark_O3_single` 或 `./coremark_O3_multi`。

### Iterations/Sec 明显低于预期

**原因**：CPU 被温控降频，或存在后台负载。

**解决**：用 `hrut_somstatus` 确认 `cpu frequency` 的 `cur` 等于 `max`，必要时切换到性能模式；并用 `vmstat 1 3` 确认 `wa` 接近 0，排除磁盘读写等后台负载。

### 多核输出的 Parallel PThreads 不是期望的核数

**原因**：线程数由编译期 `-DMULTITHREAD` 决定，可执行程序本身不提供线程数选项。

**解决**：按目标核数重新编译，不要依赖运行参数。

### 需要测试多核怎样开启 -O2 编译优化情况下的 coremark 指标？

需要注意多核以及开启 `-O2` 编译优化情况下的 coremark 指标，需要重新编译 coremark 源码，通过设置编译选项参数得到需要的 coremark 程序。在 `/app/chip_base_test/07_cpu_performance/coremark-main` 路径下，可以按照以下命令进行重新编译。

<DocScope products="RDK S100">

编译单核开启 `-O2` 的 coremark 命令：

```shell
make XCFLAGS="-O2 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78" REBUILD=1 run1.log

mv coremark.exe coremark_O2_single
```

编译 6 核开启 `-O2` 的 coremark 命令：

```shell
make XCFLAGS="-O2 -funroll-all-loops -static --param max-inline-insns-auto=550 -DPERFORMANCE_RUN=1 -mcpu=cortex-a78 -DMULTITHREAD=6 -DUSE_PTHREAD -lrt -pthread" REBUILD=1 run2.log

mv coremark.exe coremark_O2_multi
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

mv coremark.exe coremark_O2_multi
```

</DocScope>

:::note 注意
`-O2` 编译时，`linux` 端口的 `PORT_CFLAGS` 同样是 `-O2`，因此 `Compiler flags` 行会呈现为 `-O2 -O2 ...`，属于正常现象。
:::

## 相关文档

- [概述](./01_overview.md)
- [CPU-BPU-DDR 压力测试](./03_bpu_cpu_ddr_stress.md)
- [DDR 带宽测试](./10_ddr_bandwidth.md)
- [开发环境搭建及编译说明](../../06_environment_build/01_environment_build.md)
