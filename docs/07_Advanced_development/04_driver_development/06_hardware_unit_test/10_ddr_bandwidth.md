---
sidebar_position: 10
title: "DDR 带宽测试"
description: "DDR 带宽测试"
---

# DDR 带宽测试

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

DDR 带宽测试用于测量开发板内存子系统的实际读写带宽，验证其是否达到设计预期。板端预置了两种测试手段：

- **STREAM**：源码位于 `/app/chip_base_test/08_ddr_bandwidth/stream.c`，包含 Copy、Scale、Add、Triad 四个访存内核，用于评估多核并发下的混合读写带宽。**推荐使用**。
- **lmbench `bw_mem`（可选）**：提供纯读、纯写、读后写等更细分的带宽指标，以及访存延迟指标。

**适用范围**：开发板的 LPDDR5 内存子系统。两种测试方法均不区分平台，仅 CPU 核心数与理论带宽因平台而异。

**适用读者**：进行硬件单元测试与整机性能验证的测试及开发人员。

**前置条件**：

- 开发板已烧录官方发布的 RDK OS 镜像，且已正常启动。
- 已通过 SSH 或调试串口登录开发板。
- 板端 `gcc` 支持 OpenMP（见[环境准备](#环境准备)）。

## 测试原理

### STREAM 原理

STREAM 是业界通用的内存带宽基准测试程序，通过四个典型访存内核测量内存系统的吞吐能力：

| 内核 | 计算表达式 | 访存模式 | 读 : 写 |
|---|---|---|---|
| Copy | `c[i] = a[i]` | 读 1 个数组，写 1 个数组 | 1 : 1 |
| Scale | `b[i] = k * c[i]` | 读 1 个数组，写 1 个数组 | 1 : 1 |
| Add | `c[i] = a[i] + b[i]` | 读 2 个数组，写 1 个数组 | 2 : 1 |
| Triad | `a[i] = b[i] + k * c[i]` | 读 2 个数组，写 1 个数组 | 2 : 1 |

每个内核执行 `NTIMES` 次，取除首次迭代外最快一次的时间计算带宽：

```text
带宽 (MB/s) = 每次迭代搬运的字节数 / 最快一次迭代的耗时
```

其中 Copy 与 Scale 每次迭代搬运 `2 × N × 8` 字节，Add 与 Triad 搬运 `3 × N × 8` 字节（`N` 为数组元素个数，`8` 为每个 `double` 的字节数）。

**Triad 最能反映混合读写带宽**，原因有两点：

- 真实业务（模型推理、编解码、数据搬运）的内存访问以“读多写少”的混合模式为主，Triad 的 2:1 读写比最接近这一特征；Copy 与 Scale 只有 1 个读流，访存模式过于理想，测得的值偏高，不能代表混合读写场景。
- Triad 同时包含两个独立读流和一个写流，对内存控制器的读写切换（bus turnaround）、Bank 冲突与预取效率的考验比单流内核更充分。

因此，业界通常以 Triad 的实测值作为 DDR 带宽的代表指标。

### lmbench bw_mem 原理（可选）

lmbench 是一套开源的系统微基准测试工具（LMbench - Tools for Performance Analysis），其中的 `bw_mem` 组件专门用于测量内存带宽。它通过在指定大小的内存区域上执行不同的读写操作并计时，计算出内存带宽，单位为 MB/s。

`bw_mem` 支持以下 5 种常用的操作类型：

| 操作 | 含义 | 访问模式 |
|------|------|----------|
| `rd` | 读取（Read） | 每 4 个 32 位字读一次，对数组求和，步长 16 字节 |
| `wr` | 写入（Write） | 每 4 个 32 位字写一次，赋值常量，步长 16 字节 |
| `rdwr` | 读后写（Read-then-Write） | 同一位置先读后写，步长 16 字节 |
| `frd` | 全读（Full Read） | 对每个 32 位字都求和 |
| `fwr` | 全写（Full Write） | 对每个 32 位字都赋值常量 |

前 3 种（`rd`/`wr`/`rdwr`）使用跨步（stride）访问模式，每间隔 4 个字访问一次，主要用于测量**纯内存带宽**；`frd`/`fwr` 则是全字访问，能更全面反映内存系统的吞吐能力。**其中 `fwr` 在 lmbench 中的实现是链式赋值（`p[0]=p[1]=...=p[127]=1`），每条写指令相互独立、没有依赖，更能反映系统的 DDR 最大带宽。**

:::info
STREAM 与 lmbench `bw_mem` 的访存模式和带宽统计口径都不同，两者的数值不可直接对比，判定标准也不同（见[测试指标](#测试指标)）。
:::

## 环境准备

- **硬件**：开发板与配套电源，无需额外外设。
- **系统**：官方发布的 RDK OS 镜像。
- **依赖**：板端 `gcc` 需支持 OpenMP（用于编译 STREAM）。lmbench 需自行获取，见[运行 lmbench bw_mem](#运行-lmbench-bw_mem可选)。

确认板端 OpenMP 是否可用：

```shell
root@ubuntu:~# gcc --version
gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0
root@ubuntu:~# echo 'int main(void){return 0;}' > /tmp/omp_probe.c && gcc -fopenmp /tmp/omp_probe.c -o /tmp/omp_probe && echo "OpenMP OK"
OpenMP OK
```

:::info
不同镜像的 `gcc` 版本可能不同，上例仅为示例。只要命令回显 `OpenMP OK`，即可在板端编译 STREAM。
:::

### 确认 CPU 拓扑（用于绑核）

运行 lmbench 时需要绑核，先查看每个 policy 的核心分配与频率：

```shell
for p in $(ls -d /sys/devices/system/cpu/cpufreq/policy* | sort -V); do echo $(basename $p): cpus=$(cat $p/affected_cpus) freq=$(cat $p/scaling_cur_freq) governor=$(cat $p/scaling_governor); done
```

<DocScope products="RDK S100">

输出示例：

```yaml
policy0: cpus=0 1 2 3 freq=1500000 governor=performance
policy4: cpus=4 5 freq=1500000 governor=performance
```

S100 平台共 6 核（Cortex-A78AE），分为 2 个 policy/集群：

- policy0（cluster 0）：Cpu0 ~ Cpu3，4 核
- policy4（cluster 1）：Cpu4 ~ Cpu5，2 核

</DocScope>

<DocScope products="RDK S600">

输出示例：

```yaml
policy0: cpus=0 1 freq=2100000 governor=performance
policy2: cpus=2 3 4 5 freq=2100000 governor=performance
policy6: cpus=6 7 8 9 freq=2100000 governor=performance
policy10: cpus=10 11 12 13 freq=2100000 governor=performance
policy14: cpus=14 15 16 17 freq=2100000 governor=performance
```

S600 平台共 18 核（Cortex-A78AE），分为 5 个 policy/集群：

- policy0（cluster 0）：Cpu0 ~ Cpu1，2 核
- policy2（cluster 1）：Cpu2 ~ Cpu5，4 核
- policy6（cluster 2）：Cpu6 ~ Cpu9，4 核
- policy10（cluster 3）：Cpu10 ~ Cpu13，4 核
- policy14（cluster 4）：Cpu14 ~ Cpu17，4 核

</DocScope>

## 代码位置

板端 STREAM 测试代码位于 `/app/chip_base_test/08_ddr_bandwidth/` 目录：

```text
/app/chip_base_test/08_ddr_bandwidth/
├── README.md     # 编译与运行说明
└── stream.c      # STREAM 测试源码（STREAM 5.10）
```

:::note
该目录只提供源码，**没有预编译的 `stream` 可执行文件**，需按[运行 STREAM 测试](#运行-stream-测试)先编译再运行。
:::

## 使用方法

### 运行 STREAM 测试

`stream.c` 中 `STREAM_ARRAY_SIZE` 默认为 10,000,000，即每个数组 76.3MiB、三个数组共 228.9MiB，远超各级 cache，可保证测得的是 DDR 带宽而非 cache 带宽。

**1. 编译**。建议在可写目录（如 `/userdata`）下编译，避免占用系统分区空间：

```shell
mkdir -p /userdata/ddrbw
cp /app/chip_base_test/08_ddr_bandwidth/stream.c /userdata/ddrbw/
cd /userdata/ddrbw
gcc -O3 -fopenmp -DNTIMES=100 stream.c -lgomp -o stream
```

各编译参数含义：

| 参数 | 说明 |
|---|---|
| `-O3` | 最高优化等级 |
| `-fopenmp` | 启用 OpenMP 多线程并行 |
| `-DNTIMES=100` | 每个内核重复执行 100 次，取除首次迭代外的最快一次计算带宽 |
| `-lgomp` | 链接 GCC 的 OpenMP 运行时库 |

**2. 运行**：

```shell
OMP_NUM_THREADS=<核心数> ./stream
```

`OMP_NUM_THREADS` 指定 OpenMP 线程数，建议设置为板端的 CPU 核心数（即 `nproc` 的输出）。

:::tip
需要对比单核与多核的差异时，可另跑一次 `OMP_NUM_THREADS=1 ./stream`。单核结果反映单条访存流水线的能力，多核结果反映内存控制器的饱和带宽，两者都不应超过理论带宽。
:::

### 运行 lmbench bw_mem（可选）

**1. 获取 `bw_mem`**

运行 lmbench 前需先准备好 `bw_mem`。先取得 lmbench 源码，再按下文二选一编译：

- 板端可访问 github 时，直接在板端拉取：

```shell
git clone https://github.com/intel/lmbench.git /userdata/ddrbw/lmbench
```

- 板端无网络时，先在 PC 端拉取（两种方案都会用到这份源码）：

```shell
# PC 端
git clone https://github.com/intel/lmbench.git
```

两种方案的产物都位于 `/userdata/ddrbw/lmbench/bin/aarch64-linux-gnu/`，下文脚本中的 `BENCH_DIR` 已指向该路径。

:::info 编译问题处理（两种方案通用）
如果编译时遇到 `rpc/rpc.h: No such file or directory` 或 `undefined reference to pmap_set`，编辑 lmbench 源码中的 `scripts/build`，找到最后的 `${MAKE}` 行，添加 tirpc 头文件路径和链接库：
```makefile
${MAKE} OS="${OS}" CC="${CC}" CFLAGS="${CFLAGS} -I/usr/include/tirpc" LDLIBS="${LDLIBS} -ltirpc" O="${BINDIR}" $*
```
tirpc 的头文件与库由 `libtirpc-dev` 提供（RDK OS 默认已装）；若系统未装，需先安装（板端 `apt install -y libtirpc-dev`，PC 端加 `sudo`）。
:::

**方案一：在板端编译**（不需要交叉编译工具链）

源码在板端时直接编译；源码在 PC 时，先推送再编译：

```shell
# 仅当源码在 PC 端时需要
adb push lmbench/ /userdata/ddrbw/lmbench/

chmod +x /userdata/ddrbw/lmbench/scripts/*
cd /userdata/ddrbw/lmbench/src && make
```

编译产物位于 `/userdata/ddrbw/lmbench/bin/aarch64-linux-gnu/`（lmbench 用 `BINDIR=../bin/$(OS)`，板端探测到的 OS 即为 `aarch64-linux-gnu`），下文脚本中的 `BENCH_DIR` 已指向该路径。

**方案二：在 PC 端交叉编译后推送**（板端不方便编译时）

用上面 PC 端已拉取的源码。

**（1）PC 端安装交叉编译工具链**：

```shell
sudo apt install gcc-aarch64-linux-gnu build-essential libtirpc-dev
```

**（2）PC 端交叉编译 lmbench**：

```shell
cd lmbench/src
make OS=aarch64-linux-gnu CC=aarch64-linux-gnu-gcc AR=aarch64-linux-gnu-ar build
```

编译成功后，`bw_mem` 可执行文件位于 `bin/aarch64-linux-gnu/bw_mem`。

**（3）推送至板端**：

```shell
adb shell mkdir -p /userdata/ddrbw/lmbench/bin/aarch64-linux-gnu
adb push bin/aarch64-linux-gnu/bw_mem /userdata/ddrbw/lmbench/bin/aarch64-linux-gnu/
adb push bin/aarch64-linux-gnu/lat_mem_rd /userdata/ddrbw/lmbench/bin/aarch64-linux-gnu/
```

:::note
若板端已通过 SSH 登录，也可用 `scp` 代替 `adb push`；`adb shell` 中的命令直接在板端执行即可，无需再包一层 `adb shell`。
:::

**2. 运行**

`bw_mem` 的命令格式：

```shell
bw_mem [选项] <测试大小> <操作类型>
```

**常用选项**：

| 选项 | 说明 |
|------|------|
| `-P <N>` | 并行度，即 lmbench 派生出的子进程数，默认 1 |
| `-W <N>` | 预热迭代次数 |
| `-N <N>` | 测量重复次数 |

**测试大小支持的单位**：`k`=1024B，`m`=1024×1024B，`g`=1024×1024×1024B。建议使用 `256m` 以超过 cache 大小，测得真实的 DDR 带宽。

**绑核的必要性**：如果进程在不同 CPU 核之间迁移，会导致 L1/L2 cache 失效以及访存延迟变化，造成测试结果不稳定。使用 `taskset -c <核心号>` 将 `bw_mem` 绑定到固定核心，可获得稳定、可复现的带宽数据。绑定不同 cluster 的核心，可充分发挥多核的并行测试能力，最大程度占满 DDR 带宽。

以下脚本依次测量 5 种操作类型，并按[确认 CPU 拓扑](#确认-cpu-拓扑用于绑核)得到的核心范围绑核，各平台的绑定范围见下方脚本。

<DocScope products="RDK S100">

```shell
#!/bin/bash

BENCH_DIR=/userdata/ddrbw/lmbench/bin/aarch64-linux-gnu
out_put_file=$1
mem_bench_func() {
    echo "-----------------------mem bench begin-----------------------" >> $out_put_file
    # rd
    taskset -c 0-5 $BENCH_DIR/bw_mem -W 2 -N 5 -P 6 256m rd > srd.log 2>&1
    srd=`cat srd.log | awk '{print $2}'`
    srd_result="rd (256m): $srd(MB/s)"
    echo $srd_result >> $out_put_file
    rm srd.log
    # wr
    taskset -c 0-5 $BENCH_DIR/bw_mem -W 2 -N 5 -P 6 256m wr > swr.log 2>&1
    swr=`cat swr.log | awk '{print $2}'`
    swr_result="wr (256m): $swr(MB/s)"
    echo $swr_result >> $out_put_file
    rm swr.log
    # Read && Write
    taskset -c 0-5 $BENCH_DIR/bw_mem -W 2 -N 5 -P 6 256m rdwr > rdwr.log 2>&1
    rdwr=`cat rdwr.log | awk '{print $2}'`
    srdwr_result="rdwr (256m): $rdwr(MB/s)"
    echo $srdwr_result >> $out_put_file
    rm rdwr.log
    # frd
    taskset -c 0-5 $BENCH_DIR/bw_mem -W 2 -N 5 -P 6 256m frd > frd.log 2>&1
    frd=`cat frd.log | awk '{print $2}'`
    frd_result="frd (256m): $frd(MB/s)"
    echo $frd_result >> $out_put_file
    rm frd.log
    # fwr
    taskset -c 0-5 $BENCH_DIR/bw_mem -W 2 -N 5 -P 6 256m fwr > fwr.log 2>&1
    fwr=`cat fwr.log | awk '{print $2}'`
    fwr_result="fwr (256m): $fwr(MB/s)"
    echo $fwr_result >> $out_put_file
    rm fwr.log
    # latency test
    taskset -c 1 $BENCH_DIR/lat_mem_rd -P 1 -W 2 -N 5 -t 512MB 1024 > latency.log 2>&1
    latency=`cat latency.log | grep 512. | awk {'print $2'}`
    latency_result="512MB latency is: $latency ns"
    echo $latency_result >> $out_put_file
    rm latency.log
    echo "-----------------------mem bench end-----------------------" >> $out_put_file
    echo "" >> $out_put_file
}

mem_bench_func
```

</DocScope>

<DocScope products="RDK S600">

```shell
#!/bin/bash

out_put_file=$1
BENCH_DIR=/userdata/ddrbw/lmbench/bin/aarch64-linux-gnu
mem_bench_func() {
    echo "-----------------------mem bench begin-----------------------" >> $out_put_file
    # rd
    taskset -c 0-1,4-5,8-9,12-13,16-17 $BENCH_DIR/bw_mem -W 2 -N 5 -P 10 256m rd > srd.log 2>&1
    srd=`cat srd.log | awk '{print $2}'`
    srd_result="rd (256m): $srd(MB/s)"
    echo $srd_result >> $out_put_file
    rm srd.log
    # wr
    taskset -c 0-1,4-5,8-9,12-13,16-17 $BENCH_DIR/bw_mem -W 2 -N 5 -P 10 256m wr > swr.log 2>&1
    swr=`cat swr.log | awk '{print $2}'`
    swr_result="wr (256m): $swr(MB/s)"
    echo $swr_result >> $out_put_file
    rm swr.log
    # Read && Write
    taskset -c 0-1,4-5,8-9,12-13,16-17 $BENCH_DIR/bw_mem -W 2 -N 5 -P 10 256m rdwr > rdwr.log 2>&1
    rdwr=`cat rdwr.log | awk '{print $2}'`
    srdwr_result="rdwr (256m): $rdwr(MB/s)"
    echo $srdwr_result >> $out_put_file
    rm rdwr.log
    # frd
    taskset -c 0-1,4-5,8-9,12-13,16-17 $BENCH_DIR/bw_mem -W 2 -N 5 -P 10 256m frd > frd.log 2>&1
    frd=`cat frd.log | awk '{print $2}'`
    frd_result="frd (256m): $frd(MB/s)"
    echo $frd_result >> $out_put_file
    rm frd.log
    # fwr
    taskset -c 0-1,4-5,8-9,12-13,16-17 $BENCH_DIR/bw_mem -W 2 -N 5 -P 10 256m fwr > fwr.log 2>&1
    fwr=`cat fwr.log | awk '{print $2}'`
    fwr_result="fwr (256m): $fwr(MB/s)"
    echo $fwr_result >> $out_put_file
    rm fwr.log
    # latency test
    taskset -c 1 $BENCH_DIR/lat_mem_rd -P 1 -W 2 -N 5 -t 512MB 1024 > latency.log 2>&1
    latency=`cat latency.log | grep 512. | awk {'print $2'}`
    latency_result="512MB latency is: $latency ns"
    echo $latency_result >> $out_put_file
    rm latency.log
    echo "-----------------------mem bench end-----------------------" >> $out_put_file
    echo "" >> $out_put_file
}

mem_bench_func
```

</DocScope>

:::tip
脚本会在当前目录下生成 `srd.log`、`frd.log` 等临时日志（结束时自动删除），请在可写目录（如 `/userdata`）下执行，避免在只读或空间紧张的分区运行。
:::

## 运行效果

### 成功标志

**STREAM** 运行成功后输出如下（`NTIMES=100`，取各内核最快一次）：

<DocScope products="RDK S100">

6 线程（`OMP_NUM_THREADS=6`）：

```text
Number of Threads counted = 6
Copy:           52424.7     0.003607     0.003052     0.004098
Scale:          48293.7     0.003620     0.003313     0.004522
Add:            45592.3     0.005981     0.005264     0.006544
Triad:          45096.0     0.005999     0.005322     0.006501
Solution Validates: avg error less than 1.000000e-13 on all three arrays
```

1 线程对照（`OMP_NUM_THREADS=1`）：

```text
Copy:           26402.1     0.006099     0.006060     0.006402
Scale:          26255.4     0.006141     0.006094     0.006965
Add:            23615.5     0.010206     0.010163     0.011695
Triad:          23550.3     0.010222     0.010191     0.010860
```

</DocScope>

<DocScope products="RDK S600">

18 线程（`OMP_NUM_THREADS=18`）：

```text
-------------------------------------------------------------
STREAM version $Revision: 5.10 $
-------------------------------------------------------------
This system uses 8 bytes per array element.
-------------------------------------------------------------
Array size = 10000000 (elements), Offset = 0 (elements)
Memory per array = 76.3 MiB (= 0.1 GiB).
Total memory required = 228.9 MiB (= 0.2 GiB).
Each kernel will be executed 100 times.
 The *best* time for each kernel (excluding the first iteration)
 will be used to compute the reported bandwidth.
-------------------------------------------------------------
Number of Threads requested = 18
Number of Threads counted = 18
-------------------------------------------------------------
Function    Best Rate MB/s  Avg time     Min time     Max time
Copy:           89633.9     0.001952     0.001785     0.002350
Scale:          90908.8     0.001902     0.001760     0.002532
Add:            72310.4     0.003488     0.003319     0.003956
Triad:          72859.9     0.003479     0.003294     0.004133
-------------------------------------------------------------
Solution Validates: avg error less than 1.000000e-13 on all three arrays
-------------------------------------------------------------
```

1 线程对照（`OMP_NUM_THREADS=1`）：

```text
Function    Best Rate MB/s  Avg time     Min time     Max time
Copy:           30389.4     0.005385     0.005265     0.005763
Scale:          30297.5     0.005408     0.005281     0.005671
Add:            26200.8     0.009339     0.009160     0.009630
Triad:          26152.4     0.009344     0.009177     0.010316
```

</DocScope>

判断测试是否成功的依据：

- `Number of Threads counted` 与 `OMP_NUM_THREADS` 设置一致；
- Copy、Scale、Add、Triad 四个内核均打印出 `Best Rate MB/s`；
- 最后一行出现 `Solution Validates: avg error less than 1.000000e-13 on all three arrays`，表示计算结果校验通过。该行缺失说明结果不可信，此时测得带宽没有参考价值。

**lmbench `bw_mem`（可选）** 脚本输出如下：

<DocScope products="RDK S100">

```yaml
-----------------------mem bench begin-----------------------
rd (256m): 54989.97(MB/s)
wr (256m): 15431.34(MB/s)
rdwr (256m): 32749.03(MB/s)
frd (256m): 44279.83(MB/s)
fwr (256m): 59645.31(MB/s)
512MB latency is: 151.415 ns
-----------------------mem bench end-----------------------
```

</DocScope>
<DocScope products="RDK S600">

```yaml
-----------------------mem bench begin-----------------------
rd (256m): 53849.95(MB/s)
wr (256m): 45503.63(MB/s)
rdwr (256m): 45016.76(MB/s)
frd (256m): 53822.56(MB/s)
fwr (256m): 161014.81(MB/s)
512MB latency is: 167.837 ns
-----------------------mem bench end-----------------------
```

</DocScope>

**lmbench `bw_mem`** 输出中的各行依次为 `rd`、`wr`、`rdwr`、`frd`、`fwr` 五种访存操作的带宽（各操作含义见「测试原理」的 `bw_mem` 操作类型表），最后一行为 512MB 区域的访存延迟。

判断依据：上述五行与延迟行均有输出，即脚本执行正常；带宽值是否达标见[测试指标](#测试指标)（只有 `fwr` 与理论带宽比较）。

:::note
STREAM 的结果受系统负载与 CPU 频率影响，重复运行会有数个百分点波动，不必追求单次结果的绝对值，应与同平台、同线程数的历史结果对比。

<DocScope products="RDK S100">
S100 的 6 线程 Triad 实测为 **45,096MB/s**，可作为该平台的参考基线。
</DocScope>

<DocScope products="RDK S600">
S600 复测的 Triad 落在 **70,000MB/s ~ 73,000MB/s** 区间，可将该区间作为参考基线。
</DocScope>
:::

## 测试指标

### 理论带宽

```text
带宽 (MB/s) = 数据率 (MT/s) × 总线宽度 (bit) / 8
```

其中「除以 8」是把 bit 换算成 Byte：总线宽度以 bit 计（如 256 bit），而带宽单位 MB/s 以字节计，1 Byte = 8 bit。

<DocScope products="RDK S600">

| 项目 | 参数 |
|------|------|
| DDR 型号 | LPDDR5 |
| 数据率 | 6400 MT/s |
| 总线宽度 | 256 bit（32 Byte） |
| 理论带宽 | 6400 × 256 / 8 = **204,800MB/s**（约 200GB/s） |

</DocScope>

<DocScope products="RDK S100">

| 项目 | 参数 |
|------|------|
| DDR 型号 | LPDDR5 |
| 数据率 | 6400 MT/s |
| 总线宽度 | 96 bit（12 Byte） |
| 理论带宽 | 6400 × 96 / 8 = **76,800MB/s** |

</DocScope>

### 结果判定

DDR 的实际带宽低于理论带宽，原因有二：一是 DDR 系统自身的读写延迟，二是内存控制器向 DRAM 颗粒发送的维护命令（如刷新）会占用地址与数据总线的时间片。此外，不同访存模式（纯读、纯写、混合读写）能达到的比例差别很大，因此**不同工具、不同访存模式的实测值不能互相比较**，也**不宜直接把实测值除以理论带宽来判断是否达标**。

<DocScope products="RDK S100">

S100 实测数据：

| 工具与内核 | 访存模式 | 实测值 | 占本平台理论带宽 |
|---|---|---|---|
| lmbench `bw_mem fwr` | 纯写 | 约 45,000MB/s | 76,800MB/s 的约 59% |
| STREAM Triad（6 线程） | 2 读 1 写 | 45,096MB/s | 76,800MB/s 的约 59% |

S100 上**纯写与混合读写的带宽接近**：`fwr` 与 Triad 均约 45,000MB/s。该特征与理论带宽的差距较大，具体原因（内存控制器、总线，或 DDR 实际工作速率）需研发确认。

**判定方法**：与同工具、同访存模式、同参数下的历史结果对比，`bw_mem fwr` 约 **45,000MB/s**、STREAM Triad 约 **45,096MB/s** 可作参考基线。

</DocScope>
<DocScope products="RDK S600">

S600 实测数据：

| 工具与内核 | 访存模式 | 实测值 | 占本平台理论带宽 |
|---|---|---|---|
| lmbench `bw_mem fwr` | 纯写 | 约 161,000MB/s | 204,800MB/s 的约 79% |
| lmbench `bw_mem rd` / `frd` | 纯读 | 约 54,000MB/s | 204,800MB/s 的约 26% |
| STREAM Triad（18 线程） | 2 读 1 写 | 约 70,000MB/s ~ 73,000MB/s | 204,800MB/s 的约 35% |

S600 的**读带宽显著低于写带宽**（纯读约为纯写的 1/3）。STREAM 的四个内核都是“读 + 写”的混合模式，Add 与 Triad 更是 2 读 1 写的读密集型：Triad 实测 72,000MB/s 中，读部分约 48,000MB/s，已接近上表的纯读水平。这说明 STREAM 的实测值受读带宽限制，把它的结果与理论带宽直接相除没有意义（读/写带宽不对称的根因需研发确认）。

**判定方法**：与同工具、同访存模式、同参数下的历史结果对比，`bw_mem fwr` 约 **161,000MB/s**、STREAM Triad **70,000MB/s ~ 73,000MB/s** 可作参考基线。

</DocScope>

## 常见问题

### 编译报 No space left on device

**原因**：编译输出所在分区空间不足。

**解决**：换到 `/userdata` 等可写分区编译。

### Number of Threads counted 小于 OMP_NUM_THREADS

**原因**：`OMP_NUM_THREADS` 未导出到运行环境，或进程受 cgroup CPU 配额限制。

**解决**：用 `OMP_NUM_THREADS=<N> ./stream` 的形式在同一条命令中设置；并检查 `nproc` 是否等于预期核心数。

### 输出中缺少 Solution Validates 行

**原因**：计算结果校验未通过。

**解决**：排查内存稳定性问题，可结合 [CPU-BPU-DDR 压力测试](./03_bpu_cpu_ddr_stress.md) 做长时压测。

### 带宽明显低于预期

**原因**：未绑核、CPU 降频，或系统负载干扰。

**解决**：见[内存带宽测试结果低于理论带宽](#内存带宽测试结果低于理论带宽)。

### 内存带宽测试结果低于理论带宽

**原因**：未绑定 CPU 核心、CPU 处于低频、系统存在其他负载，或测试程序的工作集小于 cache 大小。

**解决**：用 `taskset` 绑定指定核心后重测，确认 CPU 处于满频率并降低后台负载；同时确认测试大小不小于 256MB（STREAM 默认工作集为 228.9MiB），避免结果被 cache 抬高。

<DocScope products="RDK S600">

### STREAM 结果远低于 lmbench 的 `fwr`

**原因**：两者口径不同。`fwr` 是纯写，STREAM 的 Triad 是 2 读 1 写的混合访问，而 S600 的读带宽明显低于写带宽，因此 Triad 数值天然更低。

**解决**：这是正常现象，不是测试故障。判定方法见[测试指标](#测试指标)。

</DocScope>

### lmbench 交叉编译产物无法运行

**原因**：交叉编译工具链与目标架构不匹配，或推送后未添加可执行权限。

**解决**：使用 aarch64 交叉工具链重新编译 `lmbench`，推送后执行 `chmod +x` 再运行。
## 相关文档

- [驱动功能单元测试](./01_overview.md)
- [CPU-BPU-DDR 压力测试](./03_bpu_cpu_ddr_stress.md)
- [搭建开发环境](../../06_environment_build/01_environment_build.md)
