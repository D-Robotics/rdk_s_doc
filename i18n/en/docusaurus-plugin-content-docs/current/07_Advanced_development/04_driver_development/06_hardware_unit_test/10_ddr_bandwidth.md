---
sidebar_position: 10
title: "DDR Bandwidth Test"
description: "DDR bandwidth test"
---

# DDR Bandwidth Test

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Overview

The DDR bandwidth test measures the actual read and write bandwidth of the board's memory subsystem and verifies that it meets the design expectation. Two tools are pre-installed on the board:

- **STREAM**: the source code is located at `/app/chip_base_test/08_ddr_bandwidth/stream.c`. It contains four memory access kernels (Copy, Scale, Add, and Triad) and is used to evaluate mixed read/write bandwidth under multi-core concurrency. **This is the recommended tool.**
- **lmbench `bw_mem` (optional)**: provides finer-grained metrics for pure read, pure write, and read-then-write bandwidth, as well as memory access latency.

**Scope**: the LPDDR5 memory subsystem of the board. Neither test method is platform-specific; only the CPU core count and the theoretical bandwidth vary by platform.

**Intended readers**: test and development engineers performing hardware unit testing and system-level performance verification.

**Prerequisites**:

- The board has been flashed with an official RDK OS image and boots normally.
- You have logged in to the board over SSH or the debug serial port.
- The `gcc` on the board supports OpenMP (see [Preparation](#preparation)).

## Test Principle

### STREAM Principle

STREAM is an industry-standard memory bandwidth benchmark. It measures the throughput of the memory system with four typical memory access kernels:

| Kernel | Expression | Access pattern | Read : Write |
|---|---|---|---|
| Copy | `c[i] = a[i]` | Reads 1 array, writes 1 array | 1 : 1 |
| Scale | `b[i] = k * c[i]` | Reads 1 array, writes 1 array | 1 : 1 |
| Add | `c[i] = a[i] + b[i]` | Reads 2 arrays, writes 1 array | 2 : 1 |
| Triad | `a[i] = b[i] + k * c[i]` | Reads 2 arrays, writes 1 array | 2 : 1 |

Each kernel runs `NTIMES` times. The bandwidth is computed from the fastest iteration, excluding the first one:

```text
Bandwidth (MB/s) = bytes moved per iteration / time of the fastest iteration
```

Copy and Scale move `2 × N × 8` bytes per iteration, while Add and Triad move `3 × N × 8` bytes (`N` is the number of array elements; `8` is the size of a `double` in bytes).

**Triad best reflects mixed read/write bandwidth**, for two reasons:

- Real workloads (model inference, codec, data movement) mostly access memory in a read-heavy mixed pattern. The 2:1 read-to-write ratio of Triad is closest to this behavior. Copy and Scale have only one read stream, so their access pattern is too idealistic and their measured values are inflated; they cannot represent a mixed read/write workload.
- Triad has two independent read streams and one write stream at the same time, which stresses the memory controller's read/write turnaround, bank conflicts, and prefetch efficiency far more than single-stream kernels.

For this reason, the measured Triad value is commonly used as the representative DDR bandwidth figure.

### lmbench bw_mem Principle (Optional)

lmbench is an open-source system micro-benchmark suite (LMbench - Tools for Performance Analysis). The `bw_mem` component within it is specifically designed to measure memory bandwidth. It works by performing different read/write operations on a memory region of a specified size, timing them, and then calculating the memory bandwidth in MB/s.

`bw_mem` supports the following 5 common operation types:

| Operation | Meaning | Access Pattern |
|-----------|---------|----------------|
| `rd` | Read | Reads every 4th 32-bit word with a 16-byte stride and sums the array |
| `wr` | Write | Writes every 4th 32-bit word with a 16-byte stride, assigning a constant |
| `rdwr` | Read-then-Write | Reads then writes the same location with a 16-byte stride |
| `frd` | Full Read | Sums every 32-bit word |
| `fwr` | Full Write | Assigns a constant to every 32-bit word |

The first three operations (`rd`/`wr`/`rdwr`) use a stride access pattern, accessing every 4th word. They are primarily used to measure **pure memory bandwidth**. `frd`/`fwr` perform full-word accesses, providing a more comprehensive view of the memory system's throughput capacity. **The `fwr` implementation in lmbench uses chained assignment (`p[0]=p[1]=...=p[127]=1`), where each write instruction is independent, making it more indicative of the system's maximum DDR bandwidth.**

:::info
STREAM and lmbench `bw_mem` differ both in access pattern and in bandwidth accounting, so their values cannot be compared directly, and neither can their pass criteria be (see [Test Metrics](#test-metrics)).
:::

## Preparation

- **Hardware**: the board and its power supply. No extra peripherals are required.
- **System**: an official RDK OS image.
- **Dependencies**: the `gcc` on the board must support OpenMP (used to build STREAM). lmbench must be obtained separately; see [Running lmbench bw_mem](#running-lmbench-bw_mem-optional).

Check whether OpenMP is available on the board:

```shell
root@ubuntu:~# gcc --version
gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0
root@ubuntu:~# echo 'int main(void){return 0;}' > /tmp/omp_probe.c && gcc -fopenmp /tmp/omp_probe.c -o /tmp/omp_probe && echo "OpenMP OK"
OpenMP OK
```

:::info
The `gcc` version varies between images; the output above is only an example. As long as the command prints `OpenMP OK`, you can build STREAM on the board.
:::

### Confirm the CPU Topology (for CPU Pinning)

CPU pinning is required when running lmbench. First check the core allocation and frequency of each policy:

```shell
for p in $(ls -d /sys/devices/system/cpu/cpufreq/policy* | sort -V); do echo $(basename $p): cpus=$(cat $p/affected_cpus) freq=$(cat $p/scaling_cur_freq) governor=$(cat $p/scaling_governor); done
```

<DocScope products="RDK S100">

Example output:

```yaml
policy0: cpus=0 1 2 3 freq=1500000 governor=performance
policy4: cpus=4 5 freq=1500000 governor=performance
```

The S100 platform has a total of 6 cores (Cortex-A78AE), divided into 2 policies/clusters:

- policy0 (cluster 0): Cpu0 ~ Cpu3, 4 cores
- policy4 (cluster 1): Cpu4 ~ Cpu5, 2 cores

</DocScope>

<DocScope products="RDK S600">

Example output:

```yaml
policy0: cpus=0 1 freq=2100000 governor=performance
policy2: cpus=2 3 4 5 freq=2100000 governor=performance
policy6: cpus=6 7 8 9 freq=2100000 governor=performance
policy10: cpus=10 11 12 13 freq=2100000 governor=performance
policy14: cpus=14 15 16 17 freq=2100000 governor=performance
```

The S600 platform has a total of 18 cores (Cortex-A78AE), divided into 5 policies/clusters:

- policy0 (cluster 0): Cpu0 ~ Cpu1, 2 cores
- policy2 (cluster 1): Cpu2 ~ Cpu5, 4 cores
- policy6 (cluster 2): Cpu6 ~ Cpu9, 4 cores
- policy10 (cluster 3): Cpu10 ~ Cpu13, 4 cores
- policy14 (cluster 4): Cpu14 ~ Cpu17, 4 cores

</DocScope>

## Code Location

The STREAM test code on the board is located in the `/app/chip_base_test/08_ddr_bandwidth/` directory:

```text
/app/chip_base_test/08_ddr_bandwidth/
├── README.md     # Build and run instructions
└── stream.c      # STREAM test source code (STREAM 5.10)
```

:::note
This directory only provides the source code. **There is no prebuilt `stream` binary**, so you must compile it first as described in [Running the STREAM Test](#running-the-stream-test).
:::

## Usage

### Running the STREAM Test

`STREAM_ARRAY_SIZE` in `stream.c` defaults to 10,000,000, which means 76.3MiB per array and 228.9MiB for all three arrays. This far exceeds the size of any cache level, so the measured value reflects DDR bandwidth rather than cache bandwidth.

**1. Compile.** Build in a writable directory (such as `/userdata`) to avoid consuming space on the system partition:

```shell
mkdir -p /userdata/ddrbw
cp /app/chip_base_test/08_ddr_bandwidth/stream.c /userdata/ddrbw/
cd /userdata/ddrbw
gcc -O3 -fopenmp -DNTIMES=100 stream.c -lgomp -o stream
```

The compilation options are as follows:

| Option | Description |
|---|---|
| `-O3` | Highest optimization level |
| `-fopenmp` | Enables OpenMP multi-threaded parallelism |
| `-DNTIMES=100` | Runs each kernel 100 times and uses the fastest iteration, excluding the first one, to compute the bandwidth |
| `-lgomp` | Links the GCC OpenMP runtime library |

**2. Run:**

```shell
OMP_NUM_THREADS=<core count> ./stream
```

`OMP_NUM_THREADS` sets the number of OpenMP threads. Set it to the number of CPU cores on the board (the output of `nproc`).

:::tip
To compare single-core and multi-core behavior, run `OMP_NUM_THREADS=1 ./stream` as well. The single-core result reflects the capability of one memory pipeline, while the multi-core result reflects the saturated bandwidth of the memory controller. Neither should exceed the theoretical bandwidth.
:::

### Running lmbench bw_mem (Optional)

**1. Get `bw_mem`**

Prepare `bw_mem` before running lmbench. Get the lmbench source first, then compile it one of two ways:

- If the board can reach github, clone it directly on the board:

```shell
git clone https://github.com/intel/lmbench.git /userdata/ddrbw/lmbench
```

- If the board has no network, clone on the PC (both options below use this copy):

```shell
# On the PC
git clone https://github.com/intel/lmbench.git
```

Either way the result lands in `/userdata/ddrbw/lmbench/bin/aarch64-linux-gnu/`, which is where `BENCH_DIR` in the script below points.

:::info Compilation Issue Handling (applies to both options)
If compilation reports `rpc/rpc.h: No such file or directory` or `undefined reference to pmap_set`, edit `scripts/build` in the lmbench source, locate the final `${MAKE}` line, and add the tirpc header path and link library:
```makefile
${MAKE} OS="${OS}" CC="${CC}" CFLAGS="${CFLAGS} -I/usr/include/tirpc" LDLIBS="${LDLIBS} -ltirpc" O="${BINDIR}" $*
```
The tirpc headers and library are provided by `libtirpc-dev` (preinstalled on RDK OS). If it is missing, install it first (`apt install -y libtirpc-dev` on the board; add `sudo` on the PC).
:::

**Option 1: Build on the board** (no cross toolchain needed)

If the source is already on the board, build it directly; if it is on the PC, push it first:

```shell
# Only needed when the source is on the PC
adb push lmbench/ /userdata/ddrbw/lmbench/

chmod +x /userdata/ddrbw/lmbench/scripts/*
cd /userdata/ddrbw/lmbench/src && make
```

The build output goes to `/userdata/ddrbw/lmbench/bin/aarch64-linux-gnu/` (lmbench uses `BINDIR=../bin/$(OS)`, and the OS detected on the board is `aarch64-linux-gnu`), which is where `BENCH_DIR` in the script below points.

**Option 2: Cross-compile on a PC and push** (when building on the board is inconvenient)

Use the source you cloned on the PC above.

**(1) Install the cross-compilation toolchain on the PC:**

```shell
sudo apt install gcc-aarch64-linux-gnu build-essential libtirpc-dev
```

**(2) Cross-compile lmbench on the PC:**

```shell
cd lmbench/src
make OS=aarch64-linux-gnu CC=aarch64-linux-gnu-gcc AR=aarch64-linux-gnu-ar build
```

After successful compilation, the `bw_mem` executable is located at `bin/aarch64-linux-gnu/bw_mem`.

**(3) Push to the board:**

```shell
adb shell mkdir -p /userdata/ddrbw/lmbench/bin/aarch64-linux-gnu
adb push bin/aarch64-linux-gnu/bw_mem /userdata/ddrbw/lmbench/bin/aarch64-linux-gnu/
adb push bin/aarch64-linux-gnu/lat_mem_rd /userdata/ddrbw/lmbench/bin/aarch64-linux-gnu/
```

:::note
If you are already logged in to the board over SSH, you can use `scp` instead of `adb push`. Commands shown as `adb shell <cmd>` can simply be run directly on the board without the `adb shell` wrapper.
:::

**2. Run**

The command format of `bw_mem` is:

```shell
bw_mem [options] <test_size> <operation_type>
```

**Common options:**

| Option | Description |
|--------|-------------|
| `-P <N>` | Parallelism, that is, the number of child processes spawned by lmbench. The default is 1. |
| `-W <N>` | Number of warm-up iterations |
| `-N <N>` | Number of measurement repetitions |

**Supported units for the test size:** `k` = 1024B, `m` = 1024×1024B, `g` = 1024×1024×1024B. Use `256m` so that the working set exceeds the cache size and the measured value reflects true DDR bandwidth.

**Why CPU pinning is necessary:** if the process migrates between CPU cores, L1/L2 caches are invalidated and the memory access latency changes, which makes the results unstable. Use `taskset -c <core_id>` to pin `bw_mem` to fixed cores to obtain stable and reproducible bandwidth data. Pinning cores from different clusters makes full use of the parallel test capability of multiple cores and maximizes DDR bandwidth utilization.

The script below measures all 5 operation types in turn, pinning the core range obtained from [Confirm the CPU Topology](#confirm-the-cpu-topology-for-cpu-pinning); the pinned range for each platform is shown in the script below.

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
The script creates temporary logs such as `srd.log` and `frd.log` in the current directory and removes them when it finishes. Run it from a writable directory (such as `/userdata`) rather than a read-only or nearly full partition.
:::

## Expected Results

### Success Criteria

**STREAM**: a successful run produces output like the following (`NTIMES=100`, fastest iteration per kernel):

<DocScope products="RDK S100">

6 threads (`OMP_NUM_THREADS=6`):

```text
Number of Threads counted = 6
Copy:           52424.7     0.003607     0.003052     0.004098
Scale:          48293.7     0.003620     0.003313     0.004522
Add:            45592.3     0.005981     0.005264     0.006544
Triad:          45096.0     0.005999     0.005322     0.006501
Solution Validates: avg error less than 1.000000e-13 on all three arrays
```

1 thread for comparison (`OMP_NUM_THREADS=1`):

```text
Copy:           26402.1     0.006099     0.006060     0.006402
Scale:          26255.4     0.006141     0.006094     0.006965
Add:            23615.5     0.010206     0.010163     0.011695
Triad:          23550.3     0.010222     0.010191     0.010860
```

</DocScope>

<DocScope products="RDK S600">

18 threads (`OMP_NUM_THREADS=18`):

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

Single-thread comparison (`OMP_NUM_THREADS=1`):

```text
Function    Best Rate MB/s  Avg time     Min time     Max time
Copy:           30389.4     0.005385     0.005265     0.005763
Scale:          30297.5     0.005408     0.005281     0.005671
Add:            26200.8     0.009339     0.009160     0.009630
Triad:          26152.4     0.009344     0.009177     0.010316
```

</DocScope>

Use the following criteria to judge whether the test succeeded:

- `Number of Threads counted` matches the value of `OMP_NUM_THREADS`.
- All four kernels (Copy, Scale, Add, and Triad) print a `Best Rate MB/s` value.
- The last line is `Solution Validates: avg error less than 1.000000e-13 on all three arrays`, which means the result has been validated. If this line is missing, the result is not trustworthy and the measured bandwidth is meaningless.

**lmbench `bw_mem` (optional)**: the script produces output like the following:

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

In the **lmbench `bw_mem`** output, the lines give the bandwidth of the five access operations `rd`, `wr`, `rdwr`, `frd`, and `fwr` in turn (see the `bw_mem` operation table under "Test Principle"), and the last line is the memory access latency for a 512MB region.

Success criteria: all five lines plus the latency line are present, which means the script ran correctly; for whether a bandwidth value passes, see [Test Metrics](#test-metrics) (only `fwr` is compared against the theoretical bandwidth).

:::note
STREAM results are affected by system load and CPU frequency, so repeated runs vary by a few percent. Do not chase the absolute value of a single run; compare against historical results from the same platform and thread count.

<DocScope products="RDK S100">
On the S100, the measured 6-thread Triad value is **45,096MB/s**. Use it as the reference baseline for this platform.
</DocScope>

<DocScope products="RDK S600">
On the S600, the reproduced Triad value falls in the **70,000MB/s to 73,000MB/s** range. Use that range as the reference baseline.
</DocScope>
:::

## Test Metrics

### Theoretical Bandwidth

```text
Bandwidth (MB/s) = Data rate (MT/s) × Bus width (bit) / 8
```

The division by 8 converts bits to bytes: the bus width is measured in bits (for example 256 bit), while the bandwidth unit MB/s is measured in bytes, and 1 Byte = 8 bit.

<DocScope products="RDK S600">

| Item | Parameter |
|------|-----------|
| DDR Type | LPDDR5 |
| Data Rate | 6400 MT/s |
| Bus Width | 256 bits (32 Bytes) |
| Theoretical Bandwidth | 6400 × 256 / 8 = **204,800MB/s** (approximately 200GB/s) |

</DocScope>

<DocScope products="RDK S100">

| Item | Parameter |
|------|-----------|
| DDR Type | LPDDR5 |
| Data Rate | 6400 MT/s |
| Bus Width | 96 bits (12 Bytes) |
| Theoretical Bandwidth | 6400 × 96 / 8 = **76,800MB/s** |

</DocScope>

### Judging the Result

The actual DDR bandwidth is lower than the theoretical bandwidth for two reasons: the read/write latency of the DDR system itself, and the maintenance commands (such as refresh) that the memory controller sends to the DRAM dies, which occupy time slices on the address and data buses. In addition, the share of theoretical bandwidth that can be reached differs greatly between access patterns (pure read, pure write, mixed read/write), so **measurements from different tools or different access patterns must not be compared with each other**, and **dividing a measured value by the theoretical bandwidth is not a valid way to decide whether it passes**.

<DocScope products="RDK S100">

Measured data for the S100:

| Tool and kernel | Access pattern | Measured | Share of that platform's theoretical bandwidth |
|---|---|---|---|
| lmbench `bw_mem fwr` | Pure write | about 45,000MB/s | about 59% of 76,800MB/s |
| STREAM Triad (6 threads) | 2 reads, 1 write | 45,096MB/s | about 59% of 76,800MB/s |

On the S100, **pure write and mixed read/write bandwidth are close**: `fwr` and Triad are both about 45,000MB/s. The gap between this and the theoretical bandwidth is relatively large; the reason (the memory controller, the bus, or the actual DDR operating rate) needs to be confirmed by the development team.

**How to judge**: compare against historical results from the same tool, the same access pattern, and the same parameters. `bw_mem fwr` at about **45,000MB/s** and STREAM Triad at about **45,096MB/s** can serve as reference baselines.

</DocScope>
<DocScope products="RDK S600">

Measured data for the S600:

| Tool and kernel | Access pattern | Measured | Share of that platform's theoretical bandwidth |
|---|---|---|---|
| lmbench `bw_mem fwr` | Pure write | about 161,000MB/s | about 79% of 204,800MB/s |
| lmbench `bw_mem rd` / `frd` | Pure read | about 54,000MB/s | about 26% of 204,800MB/s |
| STREAM Triad (18 threads) | 2 reads, 1 write | about 70,000MB/s to 73,000MB/s | about 35% of 204,800MB/s |

On the S600, the **read bandwidth is significantly lower than the write bandwidth** (pure read is roughly one third of pure write). All four STREAM kernels are mixed read/write, and Add and Triad are read-heavy at a 2:1 ratio. Of the measured 72,000MB/s for Triad, the read portion accounts for about 48,000MB/s, which is already close to the pure read value above. The STREAM result is therefore limited by read bandwidth, and dividing it by the theoretical bandwidth is meaningless. (The root cause of the read/write asymmetry needs to be confirmed by the development team.)

**How to judge**: compare against historical results from the same tool, the same access pattern, and the same parameters. `bw_mem fwr` at about **161,000MB/s** and STREAM Triad at **70,000MB/s to 73,000MB/s** can serve as reference baselines.

</DocScope>

## FAQ

### Compilation fails with No space left on device

**Cause**: The partition holding the output directory is full.

**Solution**: Build in a writable partition such as `/userdata`.

### Number of Threads counted is lower than OMP_NUM_THREADS

**Cause**: `OMP_NUM_THREADS` was not exported to the runtime environment, or the process is limited by a cgroup CPU quota.

**Solution**: Set it inline as `OMP_NUM_THREADS=<N> ./stream`, and check whether `nproc` equals the expected core count.

### The Solution Validates line is missing

**Cause**: The result validation failed.

**Solution**: Investigate memory stability issues; see [CPU-BPU-DDR Stress Test](./03_bpu_cpu_ddr_stress.md) for a long-duration stress test.

### Bandwidth is clearly lower than expected

**Cause**: No CPU pinning, CPU downclocking, or interference from system load.

**Solution**: See [The memory bandwidth result is lower than the theoretical bandwidth](#the-memory-bandwidth-result-is-lower-than-the-theoretical-bandwidth).

### The memory bandwidth result is lower than the theoretical bandwidth

**Cause**: CPU cores are not pinned, the CPU is running at a low frequency, other system load exists, or the working set of the test program is smaller than the cache.

**Solution**: Pin the process to specified cores with `taskset` and retest; confirm the CPU is running at full frequency and reduce background load. Also make sure the test size is at least 256 MB (the default STREAM working set is 228.9MiB) so that the cache does not inflate the result.

<DocScope products="RDK S600">

### The STREAM result is much lower than lmbench fwr

**Cause**: The two tools measure different things. `fwr` is a pure write, while STREAM Triad is a mixed 2-read-1-write access. On the S600 the read bandwidth is clearly lower than the write bandwidth, so the Triad value is inherently lower.

**Solution**: This is expected behavior, not a test failure. See [Test Metrics](#test-metrics) for how to judge the result.

</DocScope>

### The lmbench cross-compiled binary cannot run

**Cause**: The cross-compilation toolchain does not match the target architecture, or execute permission was not granted after pushing the file.

**Solution**: Recompile `lmbench` with an aarch64 cross toolchain, run `chmod +x` after pushing, and then execute it.
## Related Documentation

- [Driver Functional Unit Test](./01_overview.md)
- [CPU-BPU-DDR Stress Test](./03_bpu_cpu_ddr_stress.md)
- [Set Up the Development Environment](../../06_environment_build/01_environment_build.md)
