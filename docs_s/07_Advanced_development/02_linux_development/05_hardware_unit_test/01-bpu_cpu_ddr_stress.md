---
sidebar_position: 1
---

# CPU-BPU-DDR 压力测试

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

:::info 说明
本文档同时覆盖 RDK S100 与 RDK S600。CPU/DDR 段（`stressapptest`）两平台一致；**BPU 段两平台使用了完全不同的压测工具与模型**——S100 使用 `bpu_os_test`（裸 binary，配合 `run.sh` 中的 group proportion 机制），S600 使用 `hrt_model_exec`（由 `hobot-dnn` 包提供）——请通过下方 Tabs 切换至所用平台查看。页内所有 Tabs 联动切换。
:::

## 测试原理

CPU-BPU-DDR 压力测试的测试原理主要涉及对 CPU、BPU 和 DDR 在高负荷条件下的性能和稳定性进行评估，以下是这些组件压力测试的一些基本原理：

**1. CPU DDR 压力测试**

- **测试目标**：使用 `stressapptest` 工具模拟高负载环境，进行大量计算、数据处理和内存操作，测试系统在多线程并发任务下的性能。
- **测试目的**：验证 CPU 在长时间高负载下的稳定性与性能，确保 CPU 和 DDR 能在高负荷运行时维持正常工作，避免崩溃、过热或性能下降等问题。

- **stressapptest CPU 压测原理：** CPU 压测主要通过多线程并发执行一些计算密集型的任务来实现，这些任务包括：计算密集型任务、多线程并行执行等。
	- 线程创建： `stressapptest` 通过 `pthread_create()` 来创建多个线程，每个线程执行计算任务，线程的数量通常由用户通过 -C 参数指定。

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

- **stressapptest DDR 压测原理：** DDR 内存的压力测试主要涉及大量的内存分配、访问和数据交换，通过高内存使用、频繁的内存读写操作以及内存带宽的消耗来进行。
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

- **命令分析：** 压测脚本内部对 `stressapptest` 的调用：`stressapptest -s "$stime" -M "$memory_size" -f /tmp/sat.io1 -f /tmp/sat.io2 -i "$io_threads" -m 8 -C 2 -W`
	- `-s "$stime"`：测试持续时间。
	- `-M "$memory_size"`：内存使用量（控制 `malloc` 分配大小）。
	- `-f /tmp/sat.io1 -f /tmp/sat.io2`：用于 I/O 测试的文件。
	- `-i "$io_threads"`：I/O 操作线程数。
	- `-m 8`：内存压力强度。
	- `-C 2`：CPU 核心数。
	- `-W`：启用写操作（不仅读取还会写入内存）。

**2. BPU 压力测试**

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

- **测试目标：** 通过 `run.sh` 脚本调用 `bpu_os_test` 工具，用 `-r` 参数控制 BPU 负载比例（5~100%），在指定负载场景下持续推理 YOLOv3 模型，确保 BPU 在高负载下稳定工作并达到预期性能。
- **测试目的：** 确保 BPU 在执行计算任务时能够输出正确结果，长时间高负载运行下不出现崩溃或错误。

- **bpu_os_test BPU 压测原理：** 通过加载包含大量计算任务的 YOLOv3 模型，利用 BPU 的 **group proportion 机制**调度推理任务，使 BPU 占用率稳定在指定比例。工作流程：
    1. `stress_test.sh` 包装层解析 `-r <portion>` 参数；
    2. `run.sh` 根据 `portion` 值分档选择线程数（1-8 线程）和 group 分布；
    3. 每个线程调用 `hb_bpu_set_group_proportion()` 设置其所在 group 的 BPU 配额，再通过 `hb_bpu_task_set_group()` 将推理任务绑定到对应 group；
    4. 所有 group 的 proportion 之和即最终的 BPU 占用率。

- **命令分析：** 运行压测脚本后，内部实际执行如下命令（以 `-r 50` 为例）：

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

	:::info
	`bpu_os_test --help` 显示 `-r` 为 `group_id`、`-g` 为 `group_prop`，但实际运行时语义与 help 描述相反：**`-r` 传入的数值是 proportion、`-g` 传入的是 group ID**。这是 `bpu_os_test` 二进制的历史遗留行为，`run.sh` 已按实际生效方式配置，使用者通过 `stress_test.sh -r <N>` 调用无需关心此细节。
	:::

</TabItem>
<TabItem value="S600" label="S600">

- **测试目标：** 通过 `stress_test.sh` 调用 `hrt_model_exec` 工具，用 `-c` 选择要加压的 BPU 核心、`-r` 控制每个核的负载比例，持续推理 S600 适配的 HBM 模型（`resnet50_224x224_nv12.hbm`），确保 BPU 在高负载下稳定工作并达到预期性能。
- **测试目的：** 确保 BPU 在执行推理计算时能够输出正确结果，长时间高负载运行下不出现崩溃或错误。

- **hrt_model_exec BPU 压测原理：** `hrt_model_exec` 是 D-Robotics 官方提供的模型推理 / 性能测试工具，由 `hobot-dnn` 包安装到 `/usr/hobot/bin/`。压测时以 `perf` 子命令启动；运行时通过环境变量 `BPU_BUF_GROUP=true` + `_HB_NN_BPU_GROUP_ID_=<core>` + `_HB_NN_BPU_GROUP_PROP_=<percent>` 把目标核绑定到一个 BPU group，并按 group_prop 给该 group 分配 BPU 时间片配额，从而实现按核、按比例的稳态加压。`stress_test.sh` 工作流程：
    1. 解析 `-t`（时长）、`-r <portion>`（总负载 5-100%）、`-c <cores>`（要压的 BPU 核心列表，缺省时**自动从 `/sys/class/boardinfo/pg_map` 读取，跳过被掉电(power-gate)的核**）；
    2. 计算每核 group_prop = `portion / 选中核数`（最少 1）；
    3. 启动 `stressapptest` 跑 CPU/DDR 后，**为选中的每一个核 fork 一个独立的 `hrt_model_exec perf` 进程**，每个进程通过环境变量绑定到对应核 + 设置 group_prop；
    4. 每个 `hrt_model_exec` 在自己的核上持续推理 `resnet50_224x224_nv12.hbm`，stdout 周期性输出 FPS、平均/最大/最小延迟。

- **命令分析：** 以 `-c 1,3 -r 100`（只压 bpu0/bpu2，每核 50% group_prop）为例，`stress_test.sh` 内部对每个核执行：

	```shell
	BPU_BUF_GROUP=true \
	HB_NN_LOG_LEVEL=4 \
	_HB_NN_BPU_GROUP_ID_=1 \
	_HB_NN_BPU_GROUP_PROP_=50 \
	hrt_model_exec perf \
	    --model_file=./module/resnet50_224x224_nv12.hbm \
	    --core_id=1 \
	    --thread_num=2 \
	    --log_level=1 \
	    --perf_time=$looptime_min
	# bpu2 同理：_HB_NN_BPU_GROUP_ID_=3 _HB_NN_BPU_GROUP_PROP_=50 ... --core_id=3
	```

	- `BPU_BUF_GROUP=true`：开启 BPU buffer-group QoS 调度。
	- `_HB_NN_BPU_GROUP_ID_=<core>`：本进程任务绑定的 BPU group ID，对应 `--core_id`。
	- `_HB_NN_BPU_GROUP_PROP_=<percent>`：本 group 在对应核上的 BPU 时间片配额（百分比）。值由 `stress_test.sh` 按 `-r portion / 选中核数` 自动算出。
	- `--model_file <hbm>`：S600 适配的 HBM 模型文件路径。
	- `--core_id <id>`：单核 ID（1=bpu0、2=bpu1、3=bpu2、4=bpu3）。
	- `--thread_num 2`：每核 2 个推理线程，足以填满单核流水线。
	- `--perf_time <min>`：perf 模式运行时长，单位为分钟，由 `stress_test.sh -t` 换算得到。

</TabItem>
</Tabs>

## 准备工作

**1.** 开始压力测试前，需要在芯片上添加散热片，否则芯片可能会进入过温保护影响测试结果。

**2.** 确认在 `/app/chip_base_test/01_cpu_bpu_ddr` 路径下存在的文件是否完整：

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

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

</TabItem>
<TabItem value="S600" label="S600">

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

`hrt_model_exec` 由 `hobot-dnn` 包提供（系统镜像默认安装），位于 `/usr/hobot/bin/hrt_model_exec`，脚本会自动调用，无需手动预装。

</TabItem>
</Tabs>

## 测试方法

压测脚本支持输入后缀 `-h` 查看命令参数的说明：

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

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
```

各参数解析如下：

- `-t <time>`：压力测试持续时间，支持小时（如 `2h`）或分钟（如 `30m`），默认 `48h`。
- `-m <size>`：CPU/DDR 压测内存大小（MB），默认 `100`。
- `-i <threads>`：`stressapptest` 的 I/O 线程数，默认 `4`。
- `-r <portion>`：BPU 负载比例（百分比），取值 `5-100`，默认 `100`（满载）。
- `-o <directory>`：日志输出目录，默认 `../../log`。
- `-h, --help`：显示帮助信息并退出。

:::info
S100 平台只有一个 BPU core（可通过 `cat /sys/devices/system/bpu/core_num` 确认），因此无需提供 BPU 核心选择参数。
:::

**示例：** `sudo ./stress_test.sh -t 24h -m 200 -i 8 -r 80` 运行一个 24 小时的压力测试，使用 200MB 内存、8 个 I/O 线程、80% 的 BPU 负载。

</TabItem>
<TabItem value="S600" label="S600">

```shell
./stress_test.sh -h

Usage: ./stress_test.sh [options]

Options:
  -t <time>        Test duration (e.g., 2h, 30m, default: 48h).
  -m <size>        stressapptest memory size in MB (default: 100).
  -i <threads>     stressapptest I/O threads (default: 4).
  -r <portion>     BPU load portion in percent, 5-100 (default: 100).
                   Capped per-core via _HB_NN_BPU_GROUP_PROP_; the runtime
                   schedules BPU time so each active core stays at ~portion%.
  -c <cores>       BPU core id list (1=bpu0..4=bpu3, comma separated).
                   Default: auto-detect available cores from
                   /sys/class/boardinfo/pg_map (skip power-gated cores).
  -o <directory>   Log output directory (default: ../../log).
  -h, --help       Show this help message and exit.

Examples:
  ./stress_test.sh -t 24h -m 200 -i 8 -r 80
      24h stress test with 200MB memory, 8 I/O threads, all available BPU cores
      capped at 80% load each.
  ./stress_test.sh -t 30m -c 1,3 -r 100
      30min stress test against bpu0 and bpu2 only (bpu1/bpu3 stay idle), each
      core at full load.
```

各参数解析如下：

- `-t <time>`：压力测试持续时间，支持小时（如 `2h`）或分钟（如 `30m`），默认 `48h`。
- `-m <size>`：CPU/DDR 压测内存大小（MB），默认 `100`。
- `-i <threads>`：`stressapptest` 的 I/O 线程数，默认 `4`。
- `-r <portion>`：BPU 负载比例（百分比），取值 `5-100`，默认 `100`（满载）。脚本按 `portion / 选中核数` 算出每核 group_prop 配额，由 BPU runtime 通过 group QoS 调度实现稳态加压。
- `-c <cores>`：要加压的 BPU 核心列表，编号规则 `1=bpu0 2=bpu1 3=bpu2 4=bpu3`，逗号分隔。**省略时自动从 `/sys/class/boardinfo/pg_map` 读取，跳过被掉电（power-gate）的核**；想只压子集（如排错单核异常）才显式指定。
- `-o <directory>`：日志输出目录，默认 `../../log`。
- `-h, --help`：显示帮助信息并退出。

:::info
S600 平台有 4 个 BPU core（可通过 `cat /sys/devices/system/bpu/core_num` 确认）。`/sys/class/boardinfo/pg_map` 是 power-gate 位图（bit i 置位表示对应核被关电源），脚本默认会跳过这些核，无需手动维护可用核列表。
:::

**示例：** `sudo ./stress_test.sh -t 24h -m 200 -i 8 -r 80` 运行一个 24 小时的压力测试，使用 200MB 内存、8 个 I/O 线程，所有可用 BPU 核稳定在 80% 负载。

</TabItem>
</Tabs>

确保已完成准备工作后，运行测试命令：

```shell
cd /app/chip_base_test/01_cpu_bpu_ddr/scripts

sudo ./stress_test.sh
```

压测脚本通过 `hrut_somstatus` 命令周期性采集板级温度、电压、CPU 频率和 BPU 占用率，输出示例（只保留关键段）：

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

```shell
#hrut_somstatus
temperature-->
	pvt_cmn_pvtc1_t1 : 66.322 (C)
	pvt_cmn_pvtc1_t2 : 65.771 (C)
	pvt_mcu_pvtc1_t1 : 67.976 (C)
	pvt_mcu_pvtc1_t2 : 68.344 (C)
	pvt_bpu_pvtc1_t1 : 68.712 (C)
voltage-->
	VDD_CPU  : 776.0 (mV)
	VDD_BPU  : 731.0 (mV)
	VDD_MCU  : 748.0 (mV)
	VDD_DDR0 : 742.0 (mV)
	VDD_DDR1 : 742.0 (mV)
	VDD_DDR2 : 737.0 (mV)
	...
cpu frequency-->
				min     cur     max
	policy0:  1125000 1500000 1500000
	policy4:  1125000 1500000 1500000
bpu status information---->
				ratio
	bpu0:    99
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

</TabItem>
<TabItem value="S600" label="S600">

```shell
#hrut_somstatus
temperature-->
	pvt_cmn_pvtc1_t1 : 56.839 (C)
	pvt_cmn_pvtc1_t2 : 57.775 (C)
	pvt_ddr_pvtc4_t1 : 54.862 (C)
	pvt_bpu_pvtc1_t1 : 55.504 (C)
	pvt_bpu_pvtc1_t2 : 55.949 (C)
	pvt_bpu_pvtc2_t1 : 55.921 (C)
	pvt_bpu_pvtc2_t2 : 56.105 (C)
	pvt_bpu_pvtc3_t1 : 55.872 (C)
	pvt_bpu_pvtc3_t2 : 56.282 (C)
	pvt_bpu_pvtc4_t1 : 55.540 (C)
	pvt_bpu_pvtc4_t2 : 56.046 (C)
	...
voltage-->
	VDD_CPU   : 897.0 (mV)
	VDD_BPUL  : 820.0 (mV)
	VDD_BPUR  : 820.0 (mV)
	VDD_DDR0n1 : 746.0 (mV)
	...
cpu frequency-->
				min	cur	max
	policy0:	525000	2100000	2100000
	policy2:	525000	2100000	2100000
	policy6:	525000	2100000	2100000
	policy10:	525000	2100000	2100000
	policy14:	525000	2100000	2100000
bpu status information---->
		ratio
	bpu0: 	99
	bpu1: 	98
	bpu2: 	98
	bpu3: 	97
```

`hrut_somstatus` 命令结果解析如下：

- `temperature`：当前板载、DDR、BPU（每个 BPU core 有两个 `pvtc` 温度点：`pvt_bpu_pvtcN_t1/t2`）温度。
- `voltage`：主要供电轨电压（`VDD_CPU`、`VDD_BPUL`/`VDD_BPUR` 左右两组 BPU 簇电压、DDR 系列）。
- `cpu frequency`：每个 CPU policy 的最小、当前、最大运行频率（kHz）。S600 有 18 个 CPU 核心，按簇分为 5 个 policy（`policy0/2/6/10/14`）。
- `bpu status information`：4 个 BPU core 的当前占用率（百分比）。CPU/BPU/DDR 三路并发压测时，由于 `stressapptest` 也在抢内存带宽，每个 BPU core 的实测峰值通常落在 85-100% 区间内（仅跑 BPU 时可逼近 100%）。

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

</TabItem>
</Tabs>

执行 `htop` 命令查看 `CPU` 的占用率

![Htop](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/Htop.png)

其中每一行显示了一个 CPU 核心的状态，格式为：

```shell
CpuX  [ 进度条 ]
```

- `[########...]`：每个核心的实时负载进度条。
- `#`：表示用户态（user）占比。
- `*`：表示内核态（system）占比。
- `Load average: 7.10 9.56 9.57`：表示系统在 1 分钟、5 分钟、15 分钟内的平均负载。

`CpuX` 的编号范围与平台 CPU 核数对应：

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

`Cpu0` ~ `Cpu5`：S100 平台 6 核。

</TabItem>
<TabItem value="S600" label="S600">

`Cpu0` ~ `Cpu17`：S600 平台 18 核。

</TabItem>
</Tabs>

## 测试指标

测试程序启动后，会在 `/app/chip_base_test/log` 目录下产生 `bpu-stressX.log` 和 `cpu-stressX.log` 两份日志文件用来记录压测时的状态，确保能够在压测中保持如下内容：

- 能稳定运行 48 小时，不出现重启或挂死的情况。
- 使用以下命令检查日志文件中是否存在异常：

```shell
cd /app/chip_base_test/log/ && \
    grep -iE '(^.*Error:|FAILED|\bTimeout\b|\b[1-9][0-9]* errors)' \
         bpu-stress*.log cpu-stress*.log
```

:::warning
请不要简单地 `grep -iE 'error|fail|timeout'`：`stressapptest` 正常完成时必然打印 `with 0 hardware incidents, 0 errors` 和 `Status: PASS - please verify no corrected errors`，这两行会被上述朴素 grep 匹配而造成误报。必须像上面那样匹配"实际异常"模式。
:::

- BPU 占用率可通过 `cat /sys/devices/system/bpu/ratio`（或 `bpuN/ratio`）持续观察；正常压测下的占用率范围因平台不同：

    <Tabs groupId="soc_type">
    <TabItem value="S100" label="S100">

    S100 单 BPU core，满载压测时应稳定在 98-100% 区间。

    </TabItem>
    <TabItem value="S600" label="S600">

    S600 4 个 BPU core 并发 CPU/DDR 压测时每个核的实测峰值通常在 85-100% 区间。

    </TabItem>
    </Tabs>

- 使用 `top` / `htop` 查看 CPU 占用情况，并关注 `bpu-stressX.log` 中 BPU 推理工具输出的吞吐 / 延迟数据是否稳定。

### 测试结果

正常情况下日志输出示例：

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">

```shell
# stressapptest 正常完成的状态（这条不是错误）
cpu-stress1.log:2025/05/19-22:01:32(CST) Status: PASS - please verify no corrected errors

# bpu-stress*.log 中 bpu_os_test 输出无 Error/Fail/Timeout 关键字即为正常
```

</TabItem>
<TabItem value="S600" label="S600">

```shell
# stressapptest 正常完成的状态（这条不是错误）
cpu-stress1.log:2026/04/22-20:21:52(CST) Stats: Completed: 5554832.00M in 120.87s 45957.99MB/s, with 0 hardware incidents, 0 errors
cpu-stress1.log:2026/04/22-20:21:52(CST) Status: PASS - please verify no corrected errors

# hrt_model_exec 正常运行的流式输出（bpu-stressX.log 末尾若干行）
# stress_test.sh 在 stressapptest 结束时 SIGTERM hrt_model_exec，因此不会
# 看到 "Perf result" 最终汇总块；只要 Frame count 持续增长且 FPS 数值稳定
# 即视为正常。
Frame count: 421400,  Thread Average: 3.761208 ms,  thread max latency: 21.313000 ms,  thread min latency: 0.743000 ms,  FPS: 3771.641357
Frame count: 421600,  Thread Average: 3.760553 ms,  thread max latency: 21.313000 ms,  thread min latency: 0.743000 ms,  FPS: 3772.408447
Frame count: 421800,  Thread Average: 3.759908 ms,  thread max latency: 21.313000 ms,  thread min latency: 0.743000 ms,  FPS: 3773.171387
Frame count: 422000,  Thread Average: 3.759271 ms,  thread max latency: 21.313000 ms,  thread min latency: 0.743000 ms,  FPS: 3773.928223
Frame count: 422200,  Thread Average: 3.758635 ms,  thread max latency: 21.313000 ms,  thread min latency: 0.743000 ms,  FPS: 3774.684570
Frame count: 422400,  Thread Average: 3.757990 ms,  thread max latency: 21.313000 ms,  thread min latency: 0.743000 ms,  FPS: 3775.449951
```

</TabItem>
</Tabs>

- 用上面推荐的异常 grep 命令，如果**没有任何输出**，表示压测期间未检测到错误，结果正常。
- 若输出包含 `Error:`、`FAILED`、`Timeout` 或 `N errors`（N ≥ 1）等内容，需进一步排查。
- 同时检查内核侧是否有运行期异常：

```shell
# 看 BPU 相关的 error/fault/oops/panic（用 \b 词边界避免匹配 default/found 等假阳）
dmesg -T | grep -iE 'bpu.*\b(error|fault|fail|timeout|oops|panic|hung)\b'

# 或按日志级别过滤，只看压测期间新增的 err/warn
dmesg -T --level=err,warn,crit | tail -n 50
```

:::info
启动阶段会有一些 BPU 驱动正常的 info 日志（`arm-smmu-v3 28c00000.bpu_smmu: hobot_smmu_clk_get: miss clk:...` 等），这些**不是**压测异常。上面的 grep 用 `bpu.*error` 的组合模式已将它们排除，只在真出问题时才会匹配到。
:::
