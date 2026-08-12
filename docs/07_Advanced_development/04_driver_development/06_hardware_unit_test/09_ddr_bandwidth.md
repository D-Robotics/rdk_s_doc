---
sidebar_position: 10---

# 5.4.18.10 DDR 带宽测试

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 测试原理

lmbench 是一套开源的系统微基准测试工具（LMbench - Tools for Performance Analysis），其中的 `bw_mem` 组件专门用于测量内存带宽。它通过在指定大小的内存区域上执行不同的读写操作并计时，计算出内存带宽，单位为 MB/s。

`bw_mem` 支持以下 5 种常用的操作类型：

| 操作 | 含义 | 访问模式 |
|------|------|----------|
| `rd` | 读取（Read） | 每 4 个字（word）读一次，对数组求和 |
| `wr` | 写入（Write） | 每 4 个字写一次，赋值常量 |
| `rdwr` | 读后写（Read-then-Write） | 同一位置先读后写，每 4 个字 |
| `frd` | 全读（Full Read） | 对每个字都求和 |
| `fwr` | 全写（Full Write） | 对每个字都赋值常量 |

其中前 3 种（rd/wr/rdwr）使用跨步（stride）访问模式，每间隔 4 个字访问一次，主要用于测量**纯内存带宽**；`frd`/`fwr` 则是全字访问，能更全面反映内存系统的吞吐能力。**其中`fwr`在lmbench中的实现是链式赋值，每条写指令独立，更能反应系统的DDR最大带宽**

## 准备工作

:::info
如果板端无网络连接，需要在 PC 端拉取源码并交叉编译，再通过 adb 推送至板端。
:::

**1. PC 端拉取 lmbench 源码：**

```shell
git clone https://github.com/intel/lmbench.git
cd lmbench
```

**2. PC 端安装交叉编译工具链：**

```shell
sudo apt install gcc-aarch64-linux-gnu build-essential libtirpc-dev
```

**3. PC 端交叉编译 lmbench：**

```shell
cd lmbench/src
make OS=aarch64-linux-gnu CC=aarch64-linux-gnu-gcc AR=aarch64-linux-gnu-ar build
```

编译成功后，`bw_mem` 可执行文件位于 `bin/aarch64-linux-gnu/bw_mem`。

:::info 编译问题处理
如果遇到 `rpc/rpc.h: No such file or directory` 或 `undefined reference to pmap_set` 错误，编辑 `scripts/build` 文件，找到最后的 `${MAKE}` 行，添加 tirpc 头文件路径和链接库：
```makefile
${MAKE} OS="${OS}" CC="${CC}" CFLAGS="${CFLAGS} -I/usr/include/tirpc" LDLIBS="${LDLIBS} -ltirpc" O="${BINDIR}" $*
```
:::

**4. 推送至板端：**

**方案一：PC 交叉编译后推送二进制**

```shell
adb.exe push bin/aarch64-linux-gnu/bw_mem /app/chip_base_test/08_ddr_bandwidth/
adb.exe push bin/aarch64-linux-gnu/lat_mem_rd /app/chip_base_test/08_ddr_bandwidth/
```

**方案二：推送源码至板端原生编译**

如果 PC 端缺少交叉编译工具链，也可将源码推送至板端后编译（板端需有 gcc 和 make）：

```shell
# 推送源码
adb.exe push lmbench/ /app/chip_base_test/08_ddr_bandwidth/lmbench/

# 添加脚本执行权限
adb.exe shell chmod +x /app/chip_base_test/08_ddr_bandwidth/lmbench/scripts/*

# 板端编译
adb.exe shell "cd /app/chip_base_test/08_ddr_bandwidth/lmbench/src && make"
```

如果板端编译时遇到 `rpc/rpc.h` 找不到，先安装依赖：

```shell
adb.exe shell apt install -y libtirpc-dev
```

然后重新编译。编译出的可执行文件路径参考方案一

**5. 确认 CPU 拓扑（用于绑核）：**

查看每个 policy 的核心分配和频率范围：

```shell
for p in /sys/devices/system/cpu/cpufreq/policy*; do echo $(basename $p): cpus=$(cat $p/affected_cpus) freq=$(cat $p/scaling_cur_freq) governor=$(cat $p/scaling_governor); done
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

## 测试方法

### 命令格式

```shell
bw_mem [选项] <测试大小> <操作类型>
```

**常用选项：**

| 选项 | 说明 |
|------|------|
| `-P <N>` | 并行度（进程/线程数），默认 1 |
| `-W <N>` | 预热迭代次数 |
| `-N <N>` | 测量重复次数 |

**测试大小支持的单位：** `k`=1024B, `m`=1024×1024B, `g`=1024×1024×1024B。建议使用 256M 以超过 cache 大小，测得真实的 DDR 带宽。

### 测试示例（关键步骤）

使用 `taskset -c <核心号>` 将 `bw_mem` 绑定到指定 CPU 核心，避免进程在核间迁移导致测试结果波动。建议绑定不同cluster的核心，充分发挥多个测试核心的并行测试能力，最大程度上占满DDR带宽

**绑核的必要性：** 在测试 DDR 带宽时，如果进程在不同 CPU 核之间迁移，会导致 L1/L2 cache 失效以及 NUMA 访问延迟变化，造成测试结果不稳定。使用 `taskset` 将 `bw_mem` 绑定到固定的 CPU 核心上，可获得稳定、可复现的带宽数据。

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

输出示例：

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

输出示例：

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

## 测试指标

### 理论带宽计算公式

```shell
带宽 (MB/s) = 数据率 (MT/s) × 总线宽度 (bit) / 8
```

<DocScope products="RDK S600">


| 项目 | 参数 |
|------|------|
| DDR 型号 | LPDDR5 |
| 数据率 | 6400 MT/s |
| 总线宽度 | 256 bit（32 Byte） |
| 理论带宽 | 6400 × 32 = **204,800 MB/s**（约 200 GB/s） |

</DocScope>

<DocScope products="RDK S100">


| 项目 | 参数 |
|------|------|
| DDR 型号 | LPDDR5 |
| 数据率 | 6400 MT/s |
| 总线宽度 | 96 bit（12 Byte） |
| 理论带宽 | 6400 × 12 = **76,800 MB/s** |

</DocScope>

### 及格标准

由于DDR系统本身的读写latency和DDR系统给DRAM颗粒发的一些维护命令，也会占用地址和数据总线上的时间片，所以DDR的实际带宽会小于理论带宽，实际带宽的标准应为理论带宽的 70%左右。并且在高温（车规，DRAM 85度以上）下需要给DRAN颗粒发送更多的refresh命令，实际带宽还会进一步降低

## 相关文档

- [5.4.18 驱动功能单元测试](/Advanced_development/driver_development/hardware_unit_test)
- [5.4.18.1 概述](/Advanced_development/driver_development/hardware_unit_test)
- [5.1.1 搭建开发环境](/Advanced_development/environment_build/environment_build)
