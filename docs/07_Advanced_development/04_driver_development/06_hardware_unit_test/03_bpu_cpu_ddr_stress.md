---
sidebar_position: 3
title: "CPU-BPU-DDR 压力测试"
description: "对 CPU、BPU 与 DDR 同时加载的稳定性压力测试"
---

# CPU-BPU-DDR 压力测试

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 功能概述

CPU-BPU-DDR 压力测试对 CPU、BPU 与 DDR 同时加载，用于验证开发板在长时间满载下的稳定性：CPU 与 DDR 由 `stressapptest` 加压，BPU 由模型推理工具持续跑模型加压。

压测入口是板端预置的 `stress_test.sh`。脚本在后台同时拉起 CPU/DDR 与 BPU 两路负载，并周期采集板级温度、电压、频率与 BPU 占用率，直到设定的测试时长结束。

:::tip
压测脚本、模型与二进制已预置在 `/app/chip_base_test/01_cpu_bpu_ddr/scripts/`，可直接运行，无需额外安装。
:::

<DocScope products="RDK S100">

:::info 说明
CPU/DDR 段使用 `stressapptest` 加压；**BPU 段使用 `bpu_os_test`**（裸 binary，配合 `run.sh` 中的 group proportion 机制）加压。
:::

</DocScope>
<DocScope products="RDK S600">

:::info 说明
CPU/DDR 段使用 `stressapptest` 加压；**BPU 段使用 `hrt_model_exec`**（由 `hobot-dnn` 包提供）加压。
:::

</DocScope>

## 测试原理

CPU-BPU-DDR 压力测试的测试原理主要涉及对 CPU、BPU 和 DDR 在高负荷条件下的性能和稳定性进行评估，以下是这些组件压力测试的一些基本原理。下文代码片段为原理示意，不是 `stressapptest` 源码。

**1. CPU DDR 压力测试**

- **测试目标**：使用 `stressapptest` 工具模拟高负载环境，进行大量计算、数据处理和内存操作，测试系统在多线程并发任务下的性能。
- **测试目的**：验证 CPU 在长时间高负载下的稳定性与性能，确保 CPU 和 DDR 能在高负荷运行时维持正常工作，避免崩溃、过热或性能下降等问题。

- **stressapptest CPU 压测原理**： CPU 压测主要通过多线程并发执行一些计算密集型的任务来实现，这些任务包括：计算密集型任务、多线程并行执行等。
	- 线程创建： `stressapptest` 通过 `pthread_create()` 来创建多个线程，每个线程执行计算任务，线程的数量由 `-m`（内存拷贝）、`-i`（内存翻转）、`-C`（CPU 压力）等参数分别指定。

	```C
	for (int i = 0; i < num_threads; i++) {
		pthread_create(&threads[i], NULL, cpu_stress_function, (void*)i);
	}
	```

	- 计算密集型任务：每个线程会执行一些计算密集型的操作，例如浮点数计算、内存读写等，这会消耗 CPU 资源。

	```C
	void* cpu_stress_function(void* arg) {
		while (true) {
				// Perform some CPU-intensive calculations
				double a = 3.14159265358979;
				for (int i = 0; i < 1000000; i++) {
						a = a * a * 3.14159;  // Simulate a calculation
				}
		}
		return NULL;
	}
	```

	- 线程同步和管理：通过 `pthread_join()` 等函数确保线程的正确执行和同步。

- **stressapptest DDR 压测原理**： DDR 内存的压力测试主要涉及大量的内存分配、访问和数据交换，通过高内存使用、频繁的内存读写操作以及内存带宽的消耗来进行。
	- 内存分配：在内存压力测试中，`stressapptest` 会根据 `-M` 参数（例如 `-M 8192`）来分配指定大小的内存。

	```C
	void* allocate_memory(size_t size) {
		void* ptr = malloc(size);  // 分配指定大小的内存
		if (ptr == NULL) {
				perror("Memory allocation failed");
				exit(1);
		}
		return ptr;
	}
	```

	- 内存读写操作：`stressapptest` 会在分配的内存区域中进行大量的读取和写入：

	```C
	void stress_memory(void* ptr, size_t size) {
		volatile char* data = (volatile char*)ptr;
				for (size_t i = 0; i < size; i++) {
								data[i] = (char)(i % 256);  // 写入数据
								char temp = data[i];  // 读取数据
				}
	}
	```

	- 线程访问内存：`stressapptest` 使用多线程并发对内存进行访问，模拟高负载下内存的使用情况。

**命令分析**： 压测脚本内部对 `stressapptest` 的实际调用为：

```shell
stressapptest -s "$stime" -M "$memory_size" \
    -f /tmp/sat.io1 -f /tmp/sat.io2 \
    -i "$io_threads" -m 8 -C 2 -W
```

各参数含义如下（依据 `stressapptest` 内置 usage）：

| 参数 | 含义 | 取值来源 |
|---|---|---|
| `-s "$stime"` | 测试持续时间，单位为秒 | 由 `-t` 换算得到 |
| `-M "$memory_size"` | 参与测试的内存总量，单位为 MB | 由 `-m` 透传 |
| `-f /tmp/sat.io1`、`-f /tmp/sat.io2` | 各新增一个磁盘 I/O 线程，使用指定的临时文件 | 脚本固定 |
| `-i "$io_threads"` | 内存翻转（invert）线程数 | 由 `-i` 透传 |
| `-m 8` | 内存拷贝（copy）线程数 | 脚本固定为 `8` |
| `-C 2` | 内存 CPU 压力线程数 | 脚本固定为 `2` |
| `-W` | 内存拷贝时使用更消耗 CPU 的模式（Use more CPU-stressful memory copy） | 脚本固定 |

:::note 注意
`-m`、`-i` 与 `-C` 在 `stressapptest` 中分别是内存拷贝线程数、内存翻转线程数和 CPU 压力线程数，`-C` **不是**"CPU 核心数"。三个参数中只有 `-i` 可通过 `stress_test.sh -i` 调整，`-m 8` 与 `-C 2` 由脚本写死。

`-i` 在 `stress_test.sh -h` 中被称为 "I/O threads"，实际的磁盘 I/O 线程由 `-f` 创建。
:::

**2. BPU 压力测试**

<DocScope products="RDK S100">

- **测试目标**： 通过 `run.sh` 脚本调用 `bpu_os_test` 工具，用 `-r` 参数控制 BPU 负载比例（5~100%），在指定负载场景下持续推理 YOLOv3 模型，确保 BPU 在高负载下稳定工作并达到预期性能。
- **测试目的**： 确保 BPU 在执行计算任务时能够输出正确结果，长时间高负载运行下不出现崩溃或错误。

- **bpu_os_test BPU 压测原理**： 通过加载包含大量计算任务的 YOLOv3 模型，利用 BPU 的 **group proportion 机制**调度推理任务，使 BPU 占用率稳定在指定比例。工作流程：
    1. `stress_test.sh` 包装层解析 `-r <portion>` 参数；
    2. `run.sh` 根据 `portion` 值分档选择线程数（1~8 线程）和 group 分布；
    3. 每个线程调用 `hb_bpu_set_group_proportion()` 设置其所在 group 的 BPU 配额，再通过 `hb_bpu_task_set_group()` 将推理任务绑定到对应 group；
    4. 所有 group 的 proportion 之和即最终的 BPU 占用率。

- **命令分析**： 运行压测脚本后，内部实际执行如下命令（以 `-r 50` 为例）：

	```shell
	bpu_os_test -m ./module/yolov3.hbm \
	            -d ./module/input_1.bin,./module/input_2.bin \
	            -a yolov3_original_float_model_ \
	            -l $l_value -o 0 \
	            -n 4 -r "12,12,12,14" -g "1,2,3,4"
	```

	- `-m <hbm>`：指定 BPU 模型文件。
	- `-d <bin1,bin2>`：推理输入数据（多个用逗号分隔）。
	- `-a <graph_name>`：模型内部图名称。
	- `-l <loop_time>`：推理循环次数（由 `-l` 外层参数控制，0 表示无限循环）。
	- `-o <0|1>`：是否输出推理结果，压测时为 `0` 避免 I/O 干扰。
	- `-n <thread>`：并发任务线程数，由目标比例自动分档。
	- `-r "<prop1,prop2,...>"`：每个线程对应 group 的 BPU proportion 值，**各值之和等于目标占用率**。
	- `-g "<id1,id2,...>"`：每个线程分配到的 group ID。

</DocScope>
<DocScope products="RDK S600">

- **测试目标**： 通过 `stress_test.sh` 调用 `hrt_model_exec` 工具，用 `-c` 选择要加压的 BPU 核心，持续推理 S600 适配的 HBM 模型（`resnet50_224x224_nv12.hbm`），确保 BPU 在高负载下稳定工作并达到预期性能。
- **测试目的**： 确保 BPU 在执行推理计算时能够输出正确结果，长时间高负载运行下不出现崩溃或错误。

- **hrt_model_exec BPU 压测原理**： `hrt_model_exec` 是 D-Robotics 官方提供的模型推理 / 性能测试工具，由 `hobot-dnn` 包安装到 `/usr/hobot/bin/`。压测时以 `perf` 子命令启动，用 `--core_id` 一次性指定要加压的 BPU 核列表、`--thread_num` 指定并发推理线程数、`--perf_time` 指定运行时长，使选中的多个核同时满载推理，实现多核稳态加压。`stress_test.sh` 工作流程：
    1. 解析 `-t`（时长）、`-m`（内存大小）、`-i`（I/O 线程）、`-c <cores>`（要压的 BPU 核心列表，缺省为 `1,2,3,4`）；
    2. 后台启动 `stressapptest` 跑 CPU/DDR 后，启动**单个** `hrt_model_exec perf` 进程，`--core_id=<cores>` 让推理任务在多核间调度、填满所有选中的核；
    3. 循环采集 BPU 占用率（`/sys/devices/system/bpu/ratio` 及各核 `bpuN/ratio`）与 `hrut_somstatus` 温度/电压/频率，写入 `monitor-stressN.log`；
    4. `stressapptest` 结束后脚本 `SIGTERM` 停止 `hrt_model_exec`，结束测试。

- **命令分析**： 脚本内部对 CPU/DDR 与 BPU 分别执行：

	```shell
	# CPU/DDR 压测：stressapptest
	stressapptest -s <seconds> -M <memory_size> \
	    -f /tmp/sat.io1 -f /tmp/sat.io2 \
	    -i <io_threads> -m 8 -C 2 -W

	# BPU 压测：单个 hrt_model_exec perf，--core_id 指定要压的核列表
	hrt_model_exec perf \
	    --model_file=./module/resnet50_224x224_nv12.hbm \
	    --core_id=<bpu_cores> \
	    --thread_num=16 \
	    --perf_time=<minutes>
	```

	- `--model_file <hbm>`：S600 适配的 HBM 模型文件路径。
	- `--core_id <ids>`：要加压的 BPU 核列表（逗号分隔），编号规则 `1=bpu0 2=bpu1 3=bpu2 4=bpu3`（与 `hrt_model_exec` 内置说明一致：`1 for core 0, 2 for core 1 and etc`），由 `stress_test.sh -c` 透传。
	- `--thread_num 16`：并发推理线程数（脚本固定为 16，足以填满全部 4 核的流水线；工具允许范围为 1~32）。
	- `--perf_time <min>`：perf 模式运行时长，单位为分钟，由 `stress_test.sh -t` 向上取整换算得到。

</DocScope>

## 准备工作

- 硬件：开发板需加装散热片。压测会让 CPU、BPU 长时间满载，缺少散热时芯片可能进入过温保护，影响测试结果。
- 系统：烧录 RDK OS 系统镜像即可，压测脚本与二进制由 `/app/chip_base_test/` 预置提供，无需额外安装。

<DocScope products="RDK S600">

- 依赖：`hrt_model_exec` 由 `hobot-dnn` 包提供（系统镜像默认安装），位于 `/usr/hobot/bin/hrt_model_exec`，脚本会自动调用，无需手动预装。

</DocScope>

确认在 `/app/chip_base_test/01_cpu_bpu_ddr` 路径下存在的文件是否完整：

<DocScope products="RDK S100">

:::warning
下方路径中的 `lib/` 路径内的动态库以及 `module` 路径下的模型文件及输入文件，仅限于**压力测试**场景用于**给 BPU 加压**场景，不能用于其他任何用途。
:::

```shell
01_cpu_bpu_ddr/
└── scripts
    ├── Readme.md
    ├── bpu_os_test
    ├── lib
    │   ├── libhbrt4.so
    │   └── libhbtl.so
    ├── module
    │   ├── input_1.bin
    │   ├── input_2.bin
    │   └── yolov3.hbm
    ├── run.sh
    ├── stop_test.sh
    ├── stress_test.sh
    └── stressapptest

3 directories, 11 files
```

</DocScope>
<DocScope products="RDK S600">

:::warning
`module` 路径下的模型文件，仅限于**压力测试**场景用于**给 BPU 加压**场景，不能用于其他任何用途。
:::

```shell
01_cpu_bpu_ddr/
└── scripts
    ├── Readme.md
    ├── module
    │   └── resnet50_224x224_nv12.hbm
    ├── stop_test.sh
    ├── stress_test.sh
    └── stressapptest

3 directories, 5 files
```

</DocScope>

## 代码位置

- 板端路径：`/app/chip_base_test/01_cpu_bpu_ddr/`
- 日志目录：`/app/chip_base_test/log/`（由脚本自动创建）

各文件用途：

- `scripts/stress_test.sh`：压测入口脚本，负责参数解析、拉起 CPU/DDR 与 BPU 两路负载、采集监控数据。
- `scripts/stop_test.sh`：停止脚本，用于提前结束正在运行的压测。
- `scripts/stressapptest`：CPU/DDR 压测二进制。
- `scripts/Readme.md`：单次运行 / 单次停止的简要说明。

<DocScope products="RDK S100">

S100 的 `scripts/` 下还包括 `run.sh`（BPU 压测子脚本）、`bpu_os_test`（BPU 压测二进制）、`lib/`（依赖动态库）和 `module/`（YOLOv3 模型及输入数据）。

</DocScope>
<DocScope products="RDK S600">

S600 的 `scripts/module/` 下是 BPU 压测模型 `resnet50_224x224_nv12.hbm`。

</DocScope>

## 使用方法

压测脚本支持输入后缀 `-h` 查看命令参数的说明：

<DocScope products="RDK S100">

```shell
./stress_test.sh -h

Usage: ./stress_test.sh [options]

Options:
  -t <time>        Set the test duration (e.g., 2h for hours, 30m for minutes; default: 48h).
  -m <size>        Set the memory size for stress test in MB (default: 100).
  -i <threads>     Set the I/O threads for stress test (default: 4).
  -r <portion>     Set the BPU load portion in percent (5-100, default: 100).
  -o <directory>   Set the output directory for logs (default: ../../log).
  -h, --help       Show this help message and exit.

Example:
  ./stress_test.sh -t 24h -m 200 -i 8 -r 80
  This runs a 24h stress test with 200MB memory, 8 I/O threads, and 80% BPU load.
```

各参数解析如下：

- `-t <time>`：压力测试持续时间，支持小时（`h`）、分钟（`m`）、秒（`s`）后缀，纯数字按分钟计，默认 `48h`。传入非法值（如 `-t abc`）时脚本会打印 `Error: invalid -t value 'abc'. Use forms like 30s, 30m, 2h, or bare minutes.`，并回退到默认的 `48h`；回退后实际生效的时长以配置回显中括号内的秒数为准。
- `-m <size>`：CPU/DDR 压测内存大小（MB），默认 `100`。
- `-i <threads>`：`stressapptest` 的 I/O 线程数，默认 `4`。
- `-r <portion>`：BPU 负载比例（百分比），取值 `5-100`，默认 `100`（满载）。取值必须为整数，否则脚本打印 `Error: -r must be an integer. Got '<值>'.` 并退出；不在 `5-100` 范围内则打印 `Error: -r must be in range 5-100. Got <值>.` 并退出。
- `-o <directory>`：日志输出目录，默认 `../../log`。
- `-h, --help`：显示帮助信息并退出。

:::info
S100 平台只有一个 BPU core（可通过 `cat /sys/devices/system/bpu/core_num` 确认），因此无需提供 BPU 核心选择参数。
:::

**示例**： `sudo ./stress_test.sh -t 24h -m 200 -i 8 -r 80` 运行一个 24 小时的压力测试，使用 200MB 内存、8 个 I/O 线程、80% 的 BPU 负载。

</DocScope>
<DocScope products="RDK S600">

```shell
./stress_test.sh -h

Usage: ./stress_test.sh [options]

Options:
  -t <time>        Set the test duration (e.g., 2h for hours, 30m for minutes; default: 48h).
  -m <size>        Set the memory size for stress test in MB (default: 100).
  -i <threads>     Set the I/O threads for stress test (default: 4).
  -c <cores>       Set the BPU core id list to stress (hrt_model_exec --core_id;
                   1=bpu0 2=bpu1 3=bpu2 4=bpu3; comma separated; default: "1,2,3,4").
  -o <directory>   Set the output directory for logs (default: ../../log).
  -h, --help       Show this help message and exit.

Examples:
  ./stress_test.sh -t 24h -m 200 -i 8 -c 1,2,3,4
      Run a 24h stress test with 200MB memory, 8 I/O threads, and all 4 BPU cores.
  ./stress_test.sh -t 30m -c 1,3
      Run a 30min stress test against bpu0 and bpu2 only (bpu1/bpu3 stay idle).
```

各参数解析如下：

- `-t <time>`：压力测试持续时间，支持小时（如 `2h`）、分钟（如 `30m`）、秒（如 `30s`）或纯数字（按分钟计），默认 `48h`。传入非法值（如 `-t abc`）时脚本会打印告警并回退到默认的 `48h`。
- `-m <size>`：CPU/DDR 压测内存大小（MB），默认 `100`。
- `-i <threads>`：`stressapptest` 的 I/O 线程数，默认 `4`。
- `-c <cores>`：要加压的 BPU 核心列表，编号规则 `1=bpu0 2=bpu1 3=bpu2 4=bpu3`，逗号分隔，默认 `1,2,3,4`（全部 4 核）。取值必须在 `1~4` 之间，否则脚本报错退出。想只压子集（如排错单核异常）才显式指定。
- `-o <directory>`：日志输出目录，默认 `../../log`（即 `/app/chip_base_test/log`）。
- `-h, --help`：显示帮助信息并退出。

:::info
S600 平台有 4 个 BPU core（可通过 `cat /sys/devices/system/bpu/core_num` 确认）。脚本默认对全部 4 核满载加压；如需只压部分核，用 `-c` 显式指定核列表即可。
:::

**示例**： `sudo ./stress_test.sh -t 24h -m 200 -i 8` 运行一个 24 小时的压力测试，使用 200MB 内存、8 个 I/O 线程，对全部 4 个 BPU 核满载加压。

</DocScope>

确保已完成准备工作后，运行测试命令：

```shell
cd /app/chip_base_test/01_cpu_bpu_ddr/scripts

sudo ./stress_test.sh
```

脚本启动后会先打印本次运行的配置，再依次拉起 CPU/DDR 与 BPU 负载。

<DocScope products="RDK S100">

以 `sudo ./stress_test.sh -t 1m -o /userdata/utlog` 短测为例的实跑输出：

```shell
Running stress test with the following configuration:
  Stress Time:  1m (60 seconds)
  Memory Size:  100 MB
  I/O Threads:  4
  BPU Portion:  100%
  Output dir:   /userdata/utlog
Starting CPU/DDR stress test...
Starting BPU stress test (portion=100%)...
```

`Stress Time` 原样回显传入的时间字符串，括号内为换算后的秒数，两者不一致时以秒数为准。

</DocScope>
<DocScope products="RDK S600">

配置段的内容如下（默认参数，脚本自身打印）：

```shell
Running stress test with the following configuration:
  Stress Time:  48h (172800 seconds)
  Memory Size:  100 MB
  I/O Threads:  4
  BPU Cores:    1,2,3,4  (1=bpu0 2=bpu1 3=bpu2 4=bpu3)
  Output dir:   /app/chip_base_test/log
Starting CPU/DDR stress test...
Starting BPU stress test (cores=1,2,3,4)...
```

</DocScope>

### 停止压测

压测默认持续 48 小时。需要提前结束时，用以下任一方式：

- 在压测所在终端按 `Ctrl+C`，脚本捕获 `INT` 后会清理子进程。
- 另开终端执行停止脚本：

```shell
cd /app/chip_base_test/01_cpu_bpu_ddr/scripts

sudo ./stop_test.sh
```

<DocScope products="RDK S100">

`stop_test.sh` 的内容为：

```shell
#!/bin/sh

# Stop CPU/BPU/DDR stress tests cleanly
pkill -TERM -f stress_test.sh 2>/dev/null
pkill -TERM -f stressapptest 2>/dev/null
pkill -TERM -f bpu_os_test 2>/dev/null
pkill -TERM -f 'run\.sh -r' 2>/dev/null

# Give them a second to exit cleanly
sleep 1

# Force-kill stragglers
pkill -KILL -f stressapptest 2>/dev/null
pkill -KILL -f bpu_os_test 2>/dev/null

exit 0
```

它按进程名匹配：先以 `SIGTERM` 结束压测入口 `stress_test.sh`、CPU/DDR 压测进程 `stressapptest`、BPU 压测进程 `bpu_os_test` 与 BPU 子脚本 `run.sh`，等待 1 秒后再用 `SIGKILL` 清理 `stressapptest` 与 `bpu_os_test` 的残留进程。用于**在时长到达前手动终止**正在运行的压测。

正常情况下无需手动执行：`stress_test.sh` 内置 `cleanup()` 函数，并通过 `trap cleanup INT TERM EXIT` 注册，压测时长到达、收到 `Ctrl+C` / `SIGTERM`、或脚本因任何原因退出时，都会自动清理 `stressapptest` 与 `bpu_os_test`（先 `SIGTERM`，等待 1 秒后再 `SIGKILL`）。

其中 BPU 段一定会被自动停止：`run.sh` 拉起的 `bpu_os_test` 以 `-l 0`（无限循环）运行，因此 CPU/DDR 段（`stressapptest`）结束后，脚本会显式 `kill -TERM` 结束 BPU 段，并补一次 `pkill -KILL -f bpu_os_test` 兜底，随后打印 `CPU, BPU, and DDR stress tests completed!` 并列出本次产生的三份日志路径。

只有在压测仍在运行、需要提前结束时，才需要执行 `stop_test.sh`。

</DocScope>
<DocScope products="RDK S600">

`stop_test.sh` 会先以 `SIGTERM` 结束 `stress_test.sh`、`stressapptest` 与 `hrt_model_exec`，等待 1 秒后再用 `SIGKILL` 清理残留进程。

</DocScope>

## 运行效果

压测运行期间，脚本每秒采集一次 BPU 占用率（`/sys/devices/system/bpu/ratio`）与 `hrut_somstatus` 的板级温度、电压、CPU 频率，写入 `monitor-stressN.log`。两平台行为一致。

<DocScope products="RDK S100">

S100 的采集结果写入 `monitor-stressN.log`，每秒记录一次。该采集循环在 `stressapptest` 存活期间持续执行，`stressapptest` 退出后即结束。每轮采集先写入时间戳与 BPU 占用率，再附上 `hrut_somstatus` 的完整输出。输出示例（只保留关键段）：

```shell
=== 2026-09-20 15:42:52 ===
bpu_ratio: 99
=====================1=====================
temperature-->
	pvt_cmn_pvtc1_t1 : 57.031 (C)
	pvt_cmn_pvtc1_t2 : 53.175 (C)
	pvt_mcu_pvtc1_t1 : 54.645 (C)
	pvt_mcu_pvtc1_t2 : 53.735 (C)
	pvt_bpu_pvtc1_t1 : 57.047 (C)
voltage-->
	VDD_CPU  : 774.0 (mV)
	VDD_BPU  : 848.0 (mV)
	VDD_MCU  : 749.0 (mV)
	VDD_DDR0 : 743.0 (mV)
	VDD_DDR1 : 743.0 (mV)
	VDD_DDR2 : 746.0 (mV)
	...
cpu frequency-->
			min	cur	max
	policy0:	1125000	1500000	1500000
	policy4:	1125000	1500000	1500000
bpu status information---->
		ratio
	bpu0: 	98
```

`hrut_somstatus` 命令结果解析如下：

- `temperature`：当前板载、MCU、BPU 温度。
- `voltage`：主要供电轨电压（`VDD_CPU`、`VDD_BPU`、`VDD_MCU`、`VDD_DDR*` 等；S100 上的电压点较多，原始输出还包括各路 PLL/IO 子轨）。
- `cpu frequency`：每个 CPU policy 的最小、当前、最大运行频率（kHz）。S100 有 6 个 CPU 核心，按簇分为 2 个 policy（`policy0/policy4`）。
- `bpu status information`：BPU 当前占用率（百分比）。S100 仅 1 个 BPU core（`bpu0`），压测时应稳定在目标比例附近。

:::tip
BPU 占用率也可以通过 sysfs 节点直接读取，更轻量、可编程：

```shell
cat /sys/devices/system/bpu/ratio           # 一次采样
watch -n1 cat /sys/devices/system/bpu/ratio # 1 秒刷新实时观测
```
:::

</DocScope>
<DocScope products="RDK S600">

S600 的采集结果写入 `monitor-stressN.log`，每秒记录一次。每轮采集先写入时间戳、整体 BPU 占用率与各核占用率，再附上 `hrut_somstatus` 的完整输出。输出示例（只保留关键段）：

```shell
=== 2026-09-20 15:44:58 ===
bpu_ratio: 95
bpu0_ratio: 95
bpu1_ratio: 95
bpu2_ratio: 95
bpu3_ratio: 95
=====================1=====================
temperature-->
	pvt_cmn_pvtc1_t1 : 63.590 (C)
	pvt_cmn_pvtc1_t2 : 64.053 (C)
	pvt_ddr_pvtc4_t1 : 61.191 (C)
	pvt_bpu_pvtc1_t1 : 62.021 (C)
	pvt_bpu_pvtc1_t2 : 62.589 (C)
	pvt_bpu_pvtc2_t1 : 62.687 (C)
	pvt_bpu_pvtc2_t2 : 62.547 (C)
	pvt_bpu_pvtc3_t1 : 62.573 (C)
	pvt_bpu_pvtc3_t2 : 62.159 (C)
	pvt_bpu_pvtc4_t1 : 61.286 (C)
	pvt_bpu_pvtc4_t2 : 62.252 (C)
	...
voltage-->
	VDD_CPU  : 898.0 (mV)
	VDD_BPUL : 821.0 (mV)
	VDD_BPUR : 821.0 (mV)
	VDD_DDR0n1 : 747.0 (mV)
	...
cpu frequency-->
			min	cur	max
	policy0:	525000	2100000	2100000
	policy10:	525000	2100000	2100000
	policy14:	525000	2100000	2100000
	policy2:	525000	2100000	2100000
	policy6:	525000	2100000	2100000
bpu status information---->
		ratio
	bpu0: 	97
	bpu1: 	97
	bpu2: 	97
	bpu3: 	97
```

`hrut_somstatus` 命令结果解析如下：

- `temperature`：当前板载、DDR、BPU（每个 BPU core 有两个 `pvtc` 温度点：`pvt_bpu_pvtcN_t1/t2`）温度。
- `voltage`：主要供电轨电压（`VDD_CPU`、`VDD_BPUL`/`VDD_BPUR` 左右两组 BPU 簇电压、DDR 系列）。
- `cpu frequency`：每个 CPU policy 的最小、当前、最大运行频率（kHz）。S600 有 18 个 CPU 核心，按簇分为 5 个 policy（`policy0/2/6/10/14`）。
- `bpu status information`：4 个 BPU core 的当前占用率（百分比）。空闲时 4 个核都会列出且比值为 `0`；满负载压测时 4 个核的占用率稳定在高位。RDK S600 实测（RDK OS 5.1.1，`stress_test.sh -t 1m` 对 4 核满载）：bpu0~bpu3 占用率稳定在 **93%~99%**，sysfs 整体 `bpu_ratio` 同样在 **93%~98%**，与单核读数基本一致。

:::tip
BPU 占用率也可以通过 sysfs 节点直接读取，更轻量、可编程：

```shell
cat /sys/devices/system/bpu/ratio            # 整体占用率（一次采样）
cat /sys/devices/system/bpu/bpu0/ratio       # 单核占用率
for i in 0 1 2 3; do
    echo -n "bpu$i: "; cat /sys/devices/system/bpu/bpu$i/ratio
done                                         # 4 核逐一采样
watch -n1 cat /sys/devices/system/bpu/ratio  # 1 秒刷新实时观测
```
:::

</DocScope>

执行 `htop` 命令查看 `CPU` 的占用率

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/Htop.png" alt="测试方法示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

其中每一行显示了一个 CPU 核心的状态，格式为：

```shell
CpuX  [ 进度条 ]
```

- `[########...]`：每个核心的实时负载进度条。
- `#`：表示用户态（user）占比。
- `*`：表示内核态（system）占比。
- `Load average: 7.10 9.56 9.57`：表示系统在 1 分钟、5 分钟、15 分钟内的平均负载。

`CpuX` 的编号范围与平台 CPU 核数对应：

<DocScope products="RDK S100">

`Cpu0` ~ `Cpu5`：S100 平台 6 核。

</DocScope>
<DocScope products="RDK S600">

`Cpu0` ~ `Cpu17`：S600 平台 18 核。

</DocScope>

### 成功标志

测试程序启动后，会在 `/app/chip_base_test/log` 目录下产生日志文件，压测中保持如下状态即为正常：

<DocScope products="RDK S100">

S100 产生**三份**日志文件：

- `bpu-stressX.log`：记录 BPU 压测状态（`bpu_os_test` 的输出）。
- `cpu-stressX.log`：记录 CPU/DDR 压测状态（`stressapptest` 的输出）。
- `monitor-stressX.log`：每秒记录一次 BPU 占用率与 `hrut_somstatus` 温度/电压/频率。

测试时长到达后脚本会自动结束 CPU/DDR 与 BPU 两路负载（详见「停止压测」），无需额外操作。

</DocScope>
<DocScope products="RDK S600">

S600 产生**三份**日志文件：

- `bpu-stressX.log`：记录 BPU 压测状态。
- `cpu-stressX.log`：记录 CPU/DDR 压测状态。
- `monitor-stressX.log`：每秒记录一次 BPU 占用率与 `hrut_somstatus` 温度/电压/频率。

</DocScope>

- 能稳定运行 48 小时，不出现重启或挂死的情况。
- 使用以下命令检查日志文件中是否存在异常，**没有任何输出**表示未检测到错误：

```shell
cd /app/chip_base_test/log/ && \
    grep -iE '(^.*Error:|FAILED|\bTimeout\b|\b[1-9][0-9]* errors)' \
         bpu-stress*.log cpu-stress*.log
```

- BPU 占用率正常范围因平台不同：

	<DocScope products="RDK S100">

    S100 单 BPU core，满载压测时应稳定在 98~100% 区间。

    </DocScope>
    <DocScope products="RDK S600">

    S600 4 个 BPU core 满载压测时每个核占用率应稳定在高位。RDK S600 实测（RDK OS 5.1.1，`stress_test.sh -t 1m` 满载）：bpu0~bpu3 占用率 **93%~99%**，稳定在 95% 附近。

    </DocScope>

- 使用 `top` / `htop` 查看 CPU 占用情况，并关注 `bpu-stressX.log` 中 BPU 推理工具输出的吞吐 / 延迟数据是否稳定。

正常情况下日志输出示例：

<DocScope products="RDK S100">

```shell
# stressapptest 正常完成的状态（这条不是错误）
cpu-stress1.log:2025/05/19-22:01:32(CST) Status: PASS - please verify no corrected errors

# bpu-stress*.log 中 bpu_os_test 输出无 Error/Fail/Timeout 关键字即为正常
```

</DocScope>
<DocScope products="RDK S600">

```shell
# stressapptest 正常完成的状态（短时验证，这条不是错误）
cpu-stress1.log:2026/08/14-19:44:06(CST) Stats: Completed: 561648.00M in 10.18s 55158.57MB/s, with 0 hardware incidents, 0 errors
cpu-stress1.log:2026/08/14-19:44:06(CST) Status: PASS - please verify no corrected errors

# hrt_model_exec perf 短时验证的真实输出（--core_id=1 --thread_num=2 --frame_count=400）
# stress_test.sh 在 stressapptest 结束时 SIGTERM hrt_model_exec，长时压测不会
# 看到 "Perf result" 最终汇总块；只要 Frame count 持续增长且 FPS 数值稳定
# 即视为正常。
Frame count: 200,  Thread Average: 0.721070 ms,  thread max latency: 1.122000 ms,  thread min latency: 0.698000 ms,  FPS: 2720.089111
Frame count: 400,  Thread Average: 0.719145 ms,  thread max latency: 1.122000 ms,  thread min latency: 0.694000 ms,  FPS: 2731.494141

Running condition:
  Thread number is: 2
  Frame count   is: 400
  Program run time: 146.581 ms
Perf result:
  Frame totally latency is: 287.658 ms
  Average    latency    is: 0.719 ms
  Frame      rate       is: 2731.494 FPS
```

</DocScope>

## 常见问题

### 异常 grep 有输出

**原因**：日志中确实出现了 `Error:`、`FAILED`、`Timeout` 或 `N errors`（N ≥ 1）这类"实际异常"模式。

**解决**：进一步检查内核侧是否有运行期异常：

```shell
# 看 BPU 相关的 error/fault/oops/panic（用 \b 词边界避免匹配 default/found 等假阳）
dmesg -T | grep -iE 'bpu.*\b(error|fault|fail|timeout|oops|panic|hung)\b'

# 或按日志级别过滤，只看压测期间新增的 err/warn
dmesg -T --level=err,warn,crit | tail -n 50
```

:::info

启动阶段会有一些 BPU 驱动正常的 info 日志，这些**不是**压测异常。

<DocScope products="RDK S100">
例如 `arm-smmu-v3 28c00000.bpu_smmu: no cmd-sync irq - cmd-sync irq will not return!`。
</DocScope>

<DocScope products="RDK S600">
例如 `arm-smmu-v3 28c00000.bpu0_smmu: no cmd-sync irq - cmd-sync irq will not return!`（S600 的 bpu0~bpu3 各有一条，地址依次为 `28c00000`/`29c00000`/`2ac00000`/`2bc00000`）。
</DocScope>

上面的 grep 用 `bpu.*(error|fault|fail|timeout|oops|panic|hung)` 的组合模式已将它们排除，只在真出问题时才会匹配到。

:::

### 脚本启动即报错

**原因**：依赖缺失或参数非法。

**解决**：按平台核对以下几项：

<DocScope products="RDK S100">

- `Error: Invalid option -<opt>`：传入了脚本不支持的选项。
- `Error: Option -<opt> requires an argument.`：选项后缺少必需的参数值。
- `Error: -r must be an integer. Got '<值>'.` / `Error: -r must be in range 5-100. Got <值>.`：`-r` 取值非整数或超出 `5~100`，脚本直接退出。
- `Error: invalid -t value '<值>'. Use forms like 30s, 30m, 2h, or bare minutes.`：`-t` 取值非法（告警后回退默认 `48h`，不会退出）。

</DocScope>
<DocScope products="RDK S600">

- `Error: /usr/hobot/bin/hrt_model_exec not found (provided by hobot-dnn package)`：`hobot-dnn` 包未安装。
- `Error: missing BPU stress model ...`：`scripts/module/` 下的模型文件缺失。
- `Error: -c entries must be in 1..4`：`-c` 传入了 `1~4` 之外的核编号。

</DocScope>

### grep error/fail 出现误报

**原因**：`stressapptest` 正常完成时也会打印 `with 0 hardware incidents, 0 errors` 与 `Status: PASS`；只按 `error|fail|timeout` 关键字匹配会命中这两行，造成误报。

**解决**：使用「运行效果」推荐的异常 grep 模式（`Error:`/`FAILED`/`Timeout`/`N errors`）过滤，避免误报。

### BPU 占用率低于预期

<DocScope products="RDK S100">

**原因**：压测未真正满载，或压测已经结束（时长到达、或已用 `stop_test.sh` 提前停止），`bpu_os_test` 已退出。

**解决**：用 `cat /sys/devices/system/bpu/ratio` 持续观察，满载应稳定在 98~100%。若占用率为 0，说明 `bpu_os_test` 已经退出，重新执行 `stress_test.sh` 即可。

</DocScope>
<DocScope products="RDK S600">

**原因**：压测未真正满载，或 `hrt_model_exec` 已经退出。

**解决**：用 `cat /sys/devices/system/bpu/ratio`（或 `bpuN/ratio`）持续观察，各核应稳定在 93%~99%。若占用率为 0，检查 `bpu-stressN.log` 是否已停止输出 `Frame count`。

</DocScope>

### 日志编号一直增大，找不到本次结果

**原因**：脚本按空闲槽位自增编号，不会覆盖历史日志。

**解决**：取编号最大的一组文件，或按修改时间定位：

```shell
ls -lt /app/chip_base_test/log/
```

<DocScope products="RDK S600">

### `-c` 指定的核没有跑起来

**原因**：当前版本 `-c` 缺省为固定值 `1,2,3,4`，脚本不会自动跳过被 power-gate 的核。

**解决**：先用 `cat /sys/class/boardinfo/pg_map` 确认可用核，再用 `-c` 显式指定。

</DocScope>

## 相关文档

- [驱动功能单元测试](/Advanced_development/driver_development/hardware_unit_test)
- [概述](./01_overview.md)
- [AutoTest 使用方法](./02_auto_test.md)
- [搭建开发环境](../../06_environment_build/01_environment_build.md)
