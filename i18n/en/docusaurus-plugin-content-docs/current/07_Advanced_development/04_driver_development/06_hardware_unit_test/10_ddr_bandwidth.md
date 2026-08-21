---
sidebar_position: 10
---

# DDR Bandwidth Test

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Test Principle

lmbench is an open-source system micro-benchmark suite (LMbench - Tools for Performance Analysis). The `bw_mem` component within it is specifically designed to measure memory bandwidth. It works by performing different read/write operations on a memory region of a specified size, timing them, and then calculating the memory bandwidth in MB/s.

`bw_mem` supports the following 5 common operation types:

| Operation | Meaning | Access Pattern |
|-----------|---------|----------------|
| `rd` | Read | Reads every 4 words, sums array values |
| `wr` | Write | Writes every 4 words, assigns a constant value |
| `rdwr` | Read-then-Write | Reads then writes the same location, every 4 words |
| `frd` | Full Read | Sums every word |
| `fwr` | Full Write | Assigns a constant to every word |

The first three operations (`rd`/`wr`/`rdwr`) use a stride access pattern, accessing every 4th word. They are primarily used to measure **pure memory bandwidth**. `frd`/`fwr` perform full-word accesses, providing a more comprehensive view of the memory system's throughput capacity. **The `fwr` implementation in lmbench uses chained assignments, where each write instruction is independent, making it more indicative of the system's maximum DDR bandwidth.**

## Preparation

:::info
If the board does not have network access, you need to pull the source code on the PC, cross-compile it, and then push the binaries to the board via adb.
:::

**1. Pull the lmbench source code on the PC:**

```shell
git clone https://github.com/intel/lmbench.git
cd lmbench
```

**2. Install the cross-compilation toolchain on the PC:**

```shell
sudo apt install gcc-aarch64-linux-gnu build-essential libtirpc-dev
```

**3. Cross-compile lmbench on the PC:**

```shell
cd lmbench/src
make OS=aarch64-linux-gnu CC=aarch64-linux-gnu-gcc AR=aarch64-linux-gnu-ar build
```

After successful compilation, the `bw_mem` executable is located at `bin/aarch64-linux-gnu/bw_mem`.

:::info Compilation Issue Handling
If you encounter errors such as `rpc/rpc.h: No such file or directory` or `undefined reference to pmap_set`, edit the `scripts/build` file, locate the final `${MAKE}` line, and add the tirpc header file path and link library:
```makefile
${MAKE} OS="${OS}" CC="${CC}" CFLAGS="${CFLAGS} -I/usr/include/tirpc" LDLIBS="${LDLIBS} -ltirpc" O="${BINDIR}" $*
```
:::

**4. Push to the board:**

**Option 1: Cross-compile on PC then push binaries**

```shell
adb.exe push bin/aarch64-linux-gnu/bw_mem /app/chip_base_test/08_ddr_bandwidth/
adb.exe push bin/aarch64-linux-gnu/lat_mem_rd /app/chip_base_test/08_ddr_bandwidth/
```

**Option 2: Push source code to the board and compile natively**

If the PC lacks the cross-compilation toolchain, you can also push the source code to the board and compile it there (the board must have gcc and make):

```shell
# Push source code
adb.exe push lmbench/ /app/chip_base_test/08_ddr_bandwidth/lmbench/

# Add execute permissions for scripts
adb.exe shell chmod +x /app/chip_base_test/08_ddr_bandwidth/lmbench/scripts/*

# Compile on the board
adb.exe shell "cd /app/chip_base_test/08_ddr_bandwidth/lmbench/src && make"
```

If the board encounters `rpc/rpc.h` not found during compilation, install the dependency first:

```shell
adb.exe shell apt install -y libtirpc-dev
```

Then recompile. The resulting executable paths are the same as in Option 1.

**5. Confirm CPU topology (for CPU pinning):**

Check the core allocation and frequency range for each policy:

```shell
for p in /sys/devices/system/cpu/cpufreq/policy*; do echo $(basename $p): cpus=$(cat $p/affected_cpus) freq=$(cat $p/scaling_cur_freq) governor=$(cat $p/scaling_governor); done
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

## Test Method

### Command Format

```shell
bw_mem [options] <test_size> <operation_type>
```

**Common Options:**

| Option | Description |
|--------|-------------|
| `-P <N>` | Parallelism (number of processes/threads), default is 1 |
| `-W <N>` | Number of warm-up iterations |
| `-N <N>` | Number of measurement repetitions |

**Supported Units for Test Size:** `k` = 1024B, `m` = 1024×1024B, `g` = 1024×1024×1024B. It is recommended to use 256M to exceed the cache size and measure true DDR bandwidth.

### Test Example (Key Steps)

Use `taskset -c <core_id>` to pin `bw_mem` to a specific CPU core, preventing process migration between cores which can cause fluctuating test results. It is recommended to pin cores from different clusters to fully leverage parallel test capability across multiple test cores, maximizing DDR bandwidth utilization.

**Why CPU Pinning is Necessary:** When testing DDR bandwidth, if the process migrates between different CPU cores, it can lead to L1/L2 cache invalidation and changes in NUMA access latency, resulting in unstable test outcomes. Using `taskset` to pin `bw_mem` to fixed CPU cores yields stable and reproducible bandwidth data.

<DocScope products="RDK S100">

```shell
#!/bin/bash

out_put_file=$1
mem_bench_func() {
    echo "-----------------------mem bench begin-----------------------" >> $out_put_file
    # rd
    taskset -c 0-1,4-5,8-9,12-13,16-17 /app/chip_base_test/08_ddr_bandwidth/bw_mem -W 2 -N 5 -P 10 256m rd > srd.log 2>&1
    srd=`cat srd.log | awk '{print $2}'`
    srd_result="rd (256m): $srd(MB/s)"
    echo $srd_result >> $out_put_file
    rm srd.log
    # wr
    taskset -c 0-1,4-5,8-9,12-13,16-17 /app/chip_base_test/08_ddr_bandwidth/bw_mem -W 2 -N 5 -P 10 256m wr > swr.log 2>&1
    swr=`cat swr.log | awk '{print $2}'`
    swr_result="wr (256m): $swr(MB/s)"
    echo $swr_result >> $out_put_file
    rm swr.log
    # Read && Write
    taskset -c 0-1,4-5,8-9,12-13,16-17 /app/chip_base_test/08_ddr_bandwidth/bw_mem -W 2 -N 5 -P 10 256m rdwr > rdwr.log 2>&1
    rdwr=`cat rdwr.log | awk '{print $2}'`
    srdwr_result="rdwr (256m): $rdwr(MB/s)"
    echo $srdwr_result >> $out_put_file
    rm rdwr.log
    # frd
    taskset -c 0-1,4-5,8-9,12-13,16-17 /app/chip_base_test/08_ddr_bandwidth/bw_mem -W 2 -N 5 -P 10 256m frd > frd.log 2>&1
    frd=`cat frd.log | awk '{print $2}'`
    frd_result="frd (256m): $frd(MB/s)"
    echo $frd_result >> $out_put_file
    rm frd.log
    # fwr
    taskset -c 0-1,4-5,8-9,12-13,16-17 /app/chip_base_test/08_ddr_bandwidth/bw_mem -W 2 -N 5 -P 10 256m fwr > fwr.log 2>&1
    fwr=`cat fwr.log | awk '{print $2}'`
    fwr_result="fwr (256m): $fwr(MB/s)"
    echo $fwr_result >> $out_put_file
    rm fwr.log
    # latency test
    taskset -c 1 ./lat_mem_rd -P 1 -W 2 -N 5 -t 512MB 1024 > latency.log 2>&1
    latency=`cat latency.log | grep 512. | awk {'print $2'}`
    latency_result="512MB latency is: $latency ns"
    echo $latency_result >> $out_put_file
    rm latency.log
    echo "-----------------------mem bench end-----------------------" >> $out_put_file
    echo "" >> $out_put_file
}

mem_bench_func

```

Example Output:

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

```shell
#!/bin/bash

out_put_file=$1
mem_bench_func() {
    echo "-----------------------mem bench begin-----------------------" >> $out_put_file
    # rd
    taskset -c 0-1,4-5,8-9,12-13,16-17 /app/chip_base_test/08_ddr_bandwidth/bw_mem -W 2 -N 5 -P 10 256m rd > srd.log 2>&1
    srd=`cat srd.log | awk '{print $2}'`
    srd_result="rd (256m): $srd(MB/s)"
    echo $srd_result >> $out_put_file
    rm srd.log
    # wr
    taskset -c 0-1,4-5,8-9,12-13,16-17 /app/chip_base_test/08_ddr_bandwidth/bw_mem -W 2 -N 5 -P 10 256m wr > swr.log 2>&1
    swr=`cat swr.log | awk '{print $2}'`
    swr_result="wr (256m): $swr(MB/s)"
    echo $swr_result >> $out_put_file
    rm swr.log
    # Read && Write
    taskset -c 0-1,4-5,8-9,12-13,16-17 /app/chip_base_test/08_ddr_bandwidth/bw_mem -W 2 -N 5 -P 10 256m rdwr > rdwr.log 2>&1
    rdwr=`cat rdwr.log | awk '{print $2}'`
    srdwr_result="rdwr (256m): $rdwr(MB/s)"
    echo $srdwr_result >> $out_put_file
    rm rdwr.log
    # frd
    taskset -c 0-1,4-5,8-9,12-13,16-17 /app/chip_base_test/08_ddr_bandwidth/bw_mem -W 2 -N 5 -P 10 256m frd > frd.log 2>&1
    frd=`cat frd.log | awk '{print $2}'`
    frd_result="frd (256m): $frd(MB/s)"
    echo $frd_result >> $out_put_file
    rm frd.log
    # fwr
    taskset -c 0-1,4-5,8-9,12-13,16-17 /app/chip_base_test/08_ddr_bandwidth/bw_mem -W 2 -N 5 -P 10 256m fwr > fwr.log 2>&1
    fwr=`cat fwr.log | awk '{print $2}'`
    fwr_result="fwr (256m): $fwr(MB/s)"
    echo $fwr_result >> $out_put_file
    rm fwr.log
    # latency test
    taskset -c 1 ./lat_mem_rd -P 1 -W 2 -N 5 -t 512MB 1024 > latency.log 2>&1
    latency=`cat latency.log | grep 512. | awk {'print $2'}`
    latency_result="512MB latency is: $latency ns"
    echo $latency_result >> $out_put_file
    rm latency.log
    echo "-----------------------mem bench end-----------------------" >> $out_put_file
    echo "" >> $out_put_file
}

mem_bench_func

```

Example Output:

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

## Test Metrics

### Theoretical Bandwidth Calculation Formula

```shell
Bandwidth (MB/s) = Data Rate (MT/s) × Bus Width (bits) / 8
```

<DocScope products="RDK S600">

Taking S600 as an example:

| Item | Parameter |
|------|-----------|
| DDR Type | LPDDR5 |
| Data Rate | 6400 MT/s |
| Bus Width | 256 bits (32 Bytes) |
| Theoretical Bandwidth | 6400 × 32 = **204,800 MB/s** (approximately 200 GB/s) |

</DocScope>

<DocScope products="RDK S100">

Taking S100 as an example:

| Item | Parameter |
|------|-----------|
| DDR Type | LPDDR5 |
| Data Rate | 6400 MT/s |
| Bus Width | 96 bits (12 Bytes) |
| Theoretical Bandwidth | 6400 × 12 = **76,800 MB/s** |

</DocScope>

### Passing Criteria

Due to the read/write latency of the DDR system itself and the maintenance commands sent to DRAM particles, which also occupy time slices on the address and data buses, the actual DDR bandwidth will be lower than the theoretical bandwidth. The practical bandwidth standard should be approximately 70% of the theoretical bandwidth. Additionally, under high temperatures (automotive grade, DRAM above 85°C), more refresh commands must be sent to the DRAM particles, further reducing the actual bandwidth.