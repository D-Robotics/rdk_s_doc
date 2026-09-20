---
sidebar_position: 3
title: "CPU-BPU-DDR Stress Test"
description: "Stability stress test that loads the CPU, BPU, and DDR simultaneously"
---

# CPU-BPU-DDR Stress Test

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Overview

The CPU-BPU-DDR stress test loads the CPU, BPU, and DDR simultaneously to verify board stability under prolonged full load: the CPU and DDR are stressed by `stressapptest`, while the BPU is stressed by running a model continuously with the inference tool.

The entry point is the pre-installed `stress_test.sh`. The script launches the CPU/DDR and BPU load stages in the background at the same time, periodically collecting board temperature, voltage, frequency, and BPU utilization until the configured duration elapses.

:::tip
The stress test script, model, and binary are pre-installed in `/app/chip_base_test/01_cpu_bpu_ddr/scripts/`. They can be run directly with no additional installation.
:::

<DocScope products="RDK S100">

:::info Note
The CPU/DDR section is stressed by `stressapptest`; **the BPU section is stressed by `bpu_os_test`** (a raw binary that uses the group proportion mechanism in `run.sh`).
:::

</DocScope>
<DocScope products="RDK S600">

:::info Note
The CPU/DDR section is stressed by `stressapptest`; **the BPU section is stressed by `hrt_model_exec`** (provided by the `hobot-dnn` package).
:::

</DocScope>

## Test Principles

The test principles of the CPU-BPU-DDR stress test primarily involve evaluating the performance and stability of the CPU, BPU, and DDR under high-load conditions. Below are the basic principles of stress testing for these components. The code fragments below illustrate the principles; they are not `stressapptest` source code.

**1. CPU DDR Stress Test**

- **Test Target**: Use the `stressapptest` tool to simulate a high-load environment, performing extensive calculations, data processing, and memory operations to test system performance under multi-threaded concurrent tasks.
- **Test Purpose**: Verify the stability and performance of the CPU under prolonged high loads, ensuring that the CPU and DDR can maintain normal operation under high load, avoiding crashes, overheating, or performance degradation.

- **`stressapptest` CPU Stress Test Principle**: CPU stress testing is primarily achieved by executing compute-intensive tasks concurrently with multiple threads. These tasks include compute-intensive tasks and multi-threaded parallel execution.
    - Thread Creation: `stressapptest` creates multiple threads via `pthread_create()`, each executing computational tasks. The thread counts are specified separately by `-m` (memory copy), `-i` (memory invert), and `-C` (CPU stress).

    ```C
    for (int i = 0; i < num_threads; i++) {
        pthread_create(&threads[i], NULL, cpu_stress_function, (void*)i);
    }
    ```

    - Compute-Intensive Task: Each thread performs compute-intensive operations, such as floating-point calculations and memory reads/writes, which consume CPU resources.

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

    - Thread Synchronization and Management: Functions like `pthread_join()` ensure correct execution and synchronization of threads.

- **`stressapptest` DDR Stress Test Principle**: DDR memory stress testing primarily involves extensive memory allocation, access, and data exchange through high memory usage, frequent memory read/write operations, and consumption of memory bandwidth.
    - Memory Allocation: In the memory stress test, `stressapptest` allocates memory of a specified size based on the `-M` parameter (e.g., `-M 8192`).

    ```C
    void* allocate_memory(size_t size) {
        void* ptr = malloc(size);  // Allocate memory of specified size
        if (ptr == NULL) {
                perror("Memory allocation failed");
                exit(1);
        }
        return ptr;
    }
    ```

    - Memory Read/Write Operations: `stressapptest` performs a large number of reads and writes in the allocated memory region:

    ```C
    void stress_memory(void* ptr, size_t size) {
        volatile char* data = (volatile char*)ptr;
                for (size_t i = 0; i < size; i++) {
                                data[i] = (char)(i % 256);  // Write data
                                char temp = data[i];  // Read data
                }
    }
    ```

    - Thread Memory Access: `stressapptest` uses multiple threads to concurrently access memory, simulating memory usage under high load.

**Command Analysis**: The call to `stressapptest` inside the stress test script is:

```shell
stressapptest -s "$stime" -M "$memory_size" \
    -f /tmp/sat.io1 -f /tmp/sat.io2 \
    -i "$io_threads" -m 8 -C 2 -W
```

Parameter meanings (based on the built-in `stressapptest` usage):

| Parameter | Meaning | Value source |
|---|---|---|
| `-s "$stime"` | Test duration in seconds | Converted from `-t` |
| `-M "$memory_size"` | Total memory under test in MB | Passed through from `-m` |
| `-f /tmp/sat.io1`, `-f /tmp/sat.io2` | Adds one disk I/O thread each, using the given temporary file | Fixed by the script |
| `-i "$io_threads"` | Number of memory invert threads | Passed through from `-i` |
| `-m 8` | Number of memory copy threads | Fixed at `8` by the script |
| `-C 2` | Number of memory CPU stress threads | Fixed at `2` by the script |
| `-W` | Use more CPU-stressful memory copy | Fixed by the script |

:::note
In `stressapptest`, `-m`, `-i`, and `-C` are the memory copy thread count, the memory invert thread count, and the CPU stress thread count respectively. `-C` is **not** the "number of CPU cores". Of the three, only `-i` can be adjusted via `stress_test.sh -i`; `-m 8` and `-C 2` are hard-coded in the script.

`-i` is labeled "I/O threads" in `stress_test.sh -h`, but the actual disk I/O threads are created by `-f`.
:::

**2. BPU Stress Test**

<DocScope products="RDK S100">

- **Test Target**: Use the `run.sh` script to call the `bpu_os_test` tool, controlling the BPU load percentage (5~100%) via the `-r` parameter, continuously inferring the YOLOv3 model under specified load scenarios to ensure stable BPU operation under high load and achieve expected performance.
- **Test Purpose**: Ensure the BPU can produce correct results when executing computational tasks and does not crash or produce errors under prolonged high-load operation.

- **`bpu_os_test` BPU Stress Test Principle**: Load the YOLOv3 model containing many computational tasks, using the BPU's **group proportion mechanism** to schedule inference tasks, keeping BPU utilization stable at the specified percentage. Workflow:
    1. The `stress_test.sh` wrapper layer parses the `-r <portion>` parameter;
    2. `run.sh` selects the number of threads (1~8 threads) and group distribution based on the `portion` value;
    3. Each thread calls `hb_bpu_set_group_proportion()` to set the BPU quota for its group, then binds the inference task to the corresponding group via `hb_bpu_task_set_group()`;
    4. The sum of proportions of all groups is the final BPU utilization.

- **Command Analysis**: After running the stress test script, the following command is actually executed internally (using `-r 50` as an example):

    ```shell
    bpu_os_test -m ./module/yolov3.hbm \
                -d ./module/input_1.bin,./module/input_2.bin \
                -a yolov3_original_float_model_ \
                -l $l_value -o 0 \
                -n 4 -r "12,12,12,14" -g "1,2,3,4"
    ```

    - `-m <hbm>`: Specifies the BPU model file.
    - `-d <bin1,bin2>`: Inference input data (multiple separated by commas).
    - `-a <graph_name>`: Name of the graph inside the model.
    - `-l <loop_time>`: Number of inference loops (controlled by the outer `-l` parameter, 0 for infinite loop).
    - `-o <0|1>`: Whether to output inference results; set to `0` during stress tests to avoid I/O interference.
    - `-n <thread>`: Number of concurrent task threads, automatically graded based on the target percentage.
    - `-r "<prop1,prop2,...>"`: BPU proportion value for the group corresponding to each thread; **the sum of the values equals the target utilization**.
    - `-g "<id1,id2,...>"`: Group ID assigned to each thread.

</DocScope>
<DocScope products="RDK S600">

- **Test Target**: Use `stress_test.sh` to call the `hrt_model_exec` tool, selecting the BPU cores to stress with `-c`, continuously inferring the S600-adapted HBM model (`resnet50_224x224_nv12.hbm`) to ensure stable BPU operation under high load and achieve expected performance.
- **Test Purpose**: Ensure the BPU can produce correct results when performing inference computations and does not crash or produce errors under prolonged high-load operation.

- **`hrt_model_exec` BPU Stress Test Principle**: `hrt_model_exec` is the official model inference/performance testing tool from D-Robotics, installed to `/usr/hobot/bin/` by the `hobot-dnn` package. During stress testing it is started with the `perf` subcommand: `--core_id` sets the list of BPU cores to stress in one go, `--thread_num` sets the number of concurrent inference threads, and `--perf_time` sets the duration, so that all selected cores run inference at full load simultaneously. `stress_test.sh` workflow:
    1. Parse `-t` (duration), `-m` (memory size), `-i` (I/O threads), and `-c <cores>` (list of BPU cores to stress, default `1,2,3,4`);
    2. After starting `stressapptest` for CPU/DDR in the background, start a **single** `hrt_model_exec perf` process; `--core_id=<cores>` lets inference tasks be scheduled across the cores and fill all selected cores;
    3. Periodically collect BPU utilization (`/sys/devices/system/bpu/ratio` and the per-core `bpuN/ratio`) plus `hrut_somstatus` temperature/voltage/frequency into `monitor-stressN.log`;
    4. When `stressapptest` finishes, the script `SIGTERM`s `hrt_model_exec` and ends the test.

- **Command Analysis**: The script runs the following for CPU/DDR and BPU respectively:

    ```shell
    # CPU/DDR stress: stressapptest
    stressapptest -s <seconds> -M <memory_size> \
        -f /tmp/sat.io1 -f /tmp/sat.io2 \
        -i <io_threads> -m 8 -C 2 -W

    # BPU stress: a single hrt_model_exec perf, --core_id selects the cores
    hrt_model_exec perf \
        --model_file=./module/resnet50_224x224_nv12.hbm \
        --core_id=<bpu_cores> \
        --thread_num=16 \
        --perf_time=<minutes>
    ```

    - `--model_file <hbm>`: Path to the S600-adapted HBM model file.
    - `--core_id <ids>`: Comma-separated list of BPU cores to stress. Numbering is `1=bpu0 2=bpu1 3=bpu2 4=bpu3` (consistent with the built-in `hrt_model_exec` help: `1 for core 0, 2 for core 1 and etc`), passed through from `stress_test.sh -c`.
    - `--thread_num 16`: Number of concurrent inference threads (fixed at 16 by the script, enough to saturate the pipeline of all 4 cores; the tool allows 1~32).
    - `--perf_time <min>`: Duration of perf mode operation in minutes, converted from `stress_test.sh -t` with rounding up.

</DocScope>

## Preparation

- Hardware: a heatsink must be installed on the board. The stress test keeps the CPU and BPU at full load for a long time; without a heatsink the chip may enter over-temperature protection, affecting the test results.
- System: flash an RDK OS system image. The stress test script and binary are pre-installed under `/app/chip_base_test/`, so no additional installation is required.

<DocScope products="RDK S600">

- Dependency: `hrt_model_exec` is provided by the `hobot-dnn` package (installed by default in the system image) and is located at `/usr/hobot/bin/hrt_model_exec`. The script calls it automatically; manual pre-installation is not required.

</DocScope>

Ensure the files in the `/app/chip_base_test/01_cpu_bpu_ddr` path are complete:

<DocScope products="RDK S100">

:::warning
The dynamic libraries in the `lib/` path and the model and input files in the `module` path are only for **stress testing** scenarios to **load the BPU** and cannot be used for any other purpose.
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
The model file in the `module` path is only for **stress testing** scenarios to **load the BPU** and cannot be used for any other purpose.
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

## Code Location

- Board path: `/app/chip_base_test/01_cpu_bpu_ddr/`
- Log directory: `/app/chip_base_test/log/` (created automatically by the script)

Purpose of each file:

- `scripts/stress_test.sh`: Stress test entry script. Parses parameters, starts the CPU/DDR and BPU load stages, and collects monitoring data.
- `scripts/stop_test.sh`: Stop script, used to end a running stress test early.
- `scripts/stressapptest`: CPU/DDR stress test binary.
- `scripts/Readme.md`: Brief notes on running and stopping a single stress test.

<DocScope products="RDK S100">

The S100 `scripts/` directory also contains `run.sh` (the BPU stress sub-script), `bpu_os_test` (the BPU stress binary), `lib/` (dependent dynamic libraries), and `module/` (the YOLOv3 model and input data).

</DocScope>
<DocScope products="RDK S600">

The S600 `scripts/module/` directory contains the BPU stress model `resnet50_224x224_nv12.hbm`.

</DocScope>

## Test Method

The stress test script supports the `-h` suffix to view command parameter descriptions:

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

Parameter descriptions:

- `-t <time>`: Duration of the stress test. Supports the hours (`h`), minutes (`m`), and seconds (`s`) suffixes; a bare number is interpreted as minutes. Default `48h`. On an invalid value (e.g., `-t abc`) the script prints `Error: invalid -t value 'abc'. Use forms like 30s, 30m, 2h, or bare minutes.` and falls back to the default `48h`; the duration actually in effect after a fallback is the number of seconds shown in parentheses in the configuration echo.
- `-m <size>`: CPU/DDR stress test memory size (MB), default `100`.
- `-i <threads>`: Number of I/O threads for `stressapptest`, default `4`.
- `-r <portion>`: BPU load percentage (%), value range `5-100`, default `100` (full load). The value must be an integer, otherwise the script prints `Error: -r must be an integer. Got '<value>'.` and exits; if it is outside `5-100`, it prints `Error: -r must be in range 5-100. Got <value>.` and exits.
- `-o <directory>`: Log output directory, default `../../log`.
- `-h, --help`: Display help information and exit.

:::info
The S100 platform has only one BPU core (can be confirmed via `cat /sys/devices/system/bpu/core_num`), so no BPU core selection parameter is required.
:::

**Example:** `sudo ./stress_test.sh -t 24h -m 200 -i 8 -r 80` runs a 24-hour stress test using 200MB of memory, 8 I/O threads, and 80% BPU load.

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

Parameter descriptions:

- `-t <time>`: Duration of the stress test, supports hours (e.g., `2h`), minutes (e.g., `30m`), seconds (e.g., `30s`), or a bare number (interpreted as minutes). Default `48h`. If an invalid value is given (e.g., `-t abc`), the script prints a warning and falls back to the default `48h`.
- `-m <size>`: CPU/DDR stress test memory size (MB), default `100`.
- `-i <threads>`: Number of I/O threads for `stressapptest`, default `4`.
- `-c <cores>`: Comma-separated list of BPU cores to stress, numbering rule `1=bpu0 2=bpu1 3=bpu2 4=bpu3`, default `1,2,3,4` (all 4 cores). Values must be within `1~4`, otherwise the script reports an error and exits. Only specify this explicitly when you want to stress a subset (e.g., to troubleshoot a single core anomaly).
- `-o <directory>`: Log output directory, default `../../log` (that is, `/app/chip_base_test/log`).
- `-h, --help`: Display help information and exit.

:::info
The S600 platform has 4 BPU cores (can be confirmed via `cat /sys/devices/system/bpu/core_num`). By default the script stresses all 4 cores at full load; to stress only some of them, specify the core list explicitly with `-c`.
:::

**Example:** `sudo ./stress_test.sh -t 24h -m 200 -i 8` runs a 24-hour stress test using 200MB of memory, 8 I/O threads, and full load on all 4 BPU cores.

</DocScope>

After ensuring preparations are complete, run the test command:

```shell
cd /app/chip_base_test/01_cpu_bpu_ddr/scripts

sudo ./stress_test.sh
```

The script first prints the configuration for this run, then starts the CPU/DDR and BPU load stages in turn.

<DocScope products="RDK S100">

Actual output of a short run with `sudo ./stress_test.sh -t 1m -o /userdata/utlog`:

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

`Stress Time` echoes back the time string you passed, and the number of seconds in parentheses is the converted duration; if the two disagree, the seconds value is authoritative.

</DocScope>
<DocScope products="RDK S600">

The configuration block is as follows (default parameters, printed by the script itself):

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

### Stopping the Test

The stress test runs for 48 hours by default. To end it early, use either of the following:

- Press `Ctrl+C` in the terminal running the stress test. The script catches `INT` and cleans up the child processes.
- Run the stop script from another terminal:

```shell
cd /app/chip_base_test/01_cpu_bpu_ddr/scripts

sudo ./stop_test.sh
```

<DocScope products="RDK S100">

The contents of `stop_test.sh` are:

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

It matches by process name: it first sends `SIGTERM` to the stress test entry point `stress_test.sh`, the CPU/DDR stress process `stressapptest`, the BPU stress process `bpu_os_test`, and the BPU sub-script `run.sh`, waits one second, then uses `SIGKILL` to clean up any remaining `stressapptest` and `bpu_os_test` processes, for **manually terminating a running stress test before the duration elapses**.

Normally there is no need to run it manually: `stress_test.sh` defines a `cleanup()` function and registers it with `trap cleanup INT TERM EXIT`, so when the test duration elapses, on `Ctrl+C` / `SIGTERM`, or when the script exits for any reason, both `stressapptest` and `bpu_os_test` are cleaned up automatically (`SIGTERM` first, then `SIGKILL` after a one-second wait).

The BPU stage in particular is always stopped automatically: the `bpu_os_test` process started by `run.sh` runs with `-l 0` (infinite loop), so once the CPU/DDR stage (`stressapptest`) finishes, the script explicitly sends `kill -TERM` to the BPU stage and follows up with `pkill -KILL -f bpu_os_test` as a safety net, then prints `CPU, BPU, and DDR stress tests completed!` and lists the three log files produced by this run.

You only need `stop_test.sh` when the stress test is still running and you want to end it early.

</DocScope>
<DocScope products="RDK S600">

`stop_test.sh` first sends `SIGTERM` to `stress_test.sh`, `stressapptest`, and `hrt_model_exec`, waits one second, then uses `SIGKILL` to clean up any remaining processes.

</DocScope>

## Result

During the stress test, the script collects BPU utilization (`/sys/devices/system/bpu/ratio`) and the board temperature, voltage, and CPU frequency from `hrut_somstatus` once per second, writing the results to `monitor-stressN.log`. This behavior is the same on both platforms.

<DocScope products="RDK S100">

On S100 the collected data is written to `monitor-stressN.log`, once per second. This collection loop runs as long as `stressapptest` is alive and ends when `stressapptest` exits. Each round writes the timestamp and BPU utilization first, then the full `hrut_somstatus` output. Output example (only key sections shown):

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

`hrut_somstatus` command result explanation:

- `temperature`: Current onboard, MCU, BPU temperatures.
- `voltage`: Main power rail voltages (`VDD_CPU`, `VDD_BPU`, `VDD_MCU`, `VDD_DDR*`, etc.; S100 has many voltage points, and the raw output also includes various PLL/IO sub-rails).
- `cpu frequency`: Minimum, current, and maximum operating frequency (kHz) for each CPU policy. S100 has 6 CPU cores, divided into 2 policies (`policy0/policy4`).
- `bpu status information`: Current BPU utilization (percentage). S100 has only 1 BPU core (`bpu0`), and during stress tests, it should stabilize near the target percentage.

:::tip
BPU utilization can also be read directly via sysfs nodes, which is more lightweight and programmable:

```shell
cat /sys/devices/system/bpu/ratio           # Single sample
watch -n1 cat /sys/devices/system/bpu/ratio # Real-time observation with 1-second refresh
```
:::

</DocScope>
<DocScope products="RDK S600">

On S600 the collected data is written to `monitor-stressN.log`, once per second. Each round writes the timestamp, the overall BPU utilization and the per-core utilization first, then the full `hrut_somstatus` output. Output example (only key sections shown):

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

`hrut_somstatus` command result explanation:

- `temperature`: Current onboard, DDR, and BPU temperatures (each BPU core has two `pvtc` temperature points: `pvt_bpu_pvtcN_t1/t2`).
- `voltage`: Main power rail voltages (`VDD_CPU`, the `VDD_BPUL`/`VDD_BPUR` left and right BPU cluster voltages, and the DDR series).
- `cpu frequency`: Minimum, current, and maximum operating frequency (kHz) for each CPU policy. S600 has 18 CPU cores, divided into 5 policies (`policy0/2/6/10/14`).
- `bpu status information`: Current utilization (percentage) of the 4 BPU cores. When idle, all 4 cores are listed with a ratio of `0`; under full-load stress testing, all 4 cores stabilize at a high level. Measured on RDK S600 (RDK OS 5.1.1, `stress_test.sh -t 1m` with all 4 cores at full load): bpu0~bpu3 stay between **93% and 99%**, and the overall sysfs `bpu_ratio` also stays between **93% and 98%**, essentially the same as the per-core readings.

:::tip
BPU utilization can also be read directly via sysfs nodes, which is more lightweight and programmable:

```shell
cat /sys/devices/system/bpu/ratio            # Overall utilization (single sample)
cat /sys/devices/system/bpu/bpu0/ratio       # Single-core utilization
for i in 0 1 2 3; do
    echo -n "bpu$i: "; cat /sys/devices/system/bpu/bpu$i/ratio
done                                         # Sample all 4 cores one by one
watch -n1 cat /sys/devices/system/bpu/ratio  # Real-time observation with 1-second refresh
```
:::

</DocScope>

Execute the `htop` command to view CPU utilization

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/Htop.png" alt="Test Method diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

Each line shows the status of a CPU core in the format:

```shell
CpuX  [ progress bar ]
```

- `[########...]`: Real-time load progress bar for each core.
- `#`: Indicates user space percentage.
- `*`: Indicates kernel space percentage.
- `Load average: 7.10 9.56 9.57`: Indicates the system's average load over 1, 5, and 15 minutes.

The numbering range of `CpuX` corresponds to the number of CPU cores on the platform:

<DocScope products="RDK S100">

`Cpu0` ~ `Cpu5`: 6 cores on the S100 platform.

</DocScope>
<DocScope products="RDK S600">

`Cpu0` ~ `Cpu17`: 18 cores on the S600 platform.

</DocScope>

### Success Criteria

After the test program starts, log files are generated in the `/app/chip_base_test/log` directory. The following conditions indicate a normal run:

<DocScope products="RDK S100">

S100 generates **three** log files:

- `bpu-stressX.log`: records the BPU stress state (output of `bpu_os_test`).
- `cpu-stressX.log`: records the CPU/DDR stress state (output of `stressapptest`).
- `monitor-stressX.log`: records BPU utilization and `hrut_somstatus` temperature/voltage/frequency once per second.

When the test duration elapses, the script stops both the CPU/DDR and BPU stages automatically (see "Stopping the Test"); no extra step is required.

</DocScope>
<DocScope products="RDK S600">

S600 generates **three** log files:

- `bpu-stressX.log`: records the BPU stress state.
- `cpu-stressX.log`: records the CPU/DDR stress state.
- `monitor-stressX.log`: records BPU utilization and `hrut_somstatus` temperature/voltage/frequency once per second.

</DocScope>

- Stable operation for 48 hours without restarting or hanging.
- Check for anomalies in the log files with the following command; **no output** means no errors were detected:

```shell
cd /app/chip_base_test/log/ && \
    grep -iE '(^.*Error:|FAILED|\bTimeout\b|\b[1-9][0-9]* errors)' \
         bpu-stress*.log cpu-stress*.log
```

- The normal BPU utilization range varies by platform:

    <DocScope products="RDK S100">

    S100 has a single BPU core; during full-load stress testing, it should stabilize in the 98-100% range.

    </DocScope>
    <DocScope products="RDK S600">

    During full-load stress testing of the S600's 4 BPU cores, each core should stabilize at a high level. Measured on RDK S600 (RDK OS 5.1.1, `stress_test.sh -t 1m` at full load): bpu0~bpu3 stay between **93% and 99%**, stabilizing around 95%.

    </DocScope>

- Use `top` / `htop` to view CPU utilization and check whether the throughput/latency data output by the BPU inference tool in `bpu-stressX.log` is stable.

Normal log output examples:

<DocScope products="RDK S100">

```shell
# stressapptest normal completion status (this line is not an error)
cpu-stress1.log:2025/05/19-22:01:32(CST) Status: PASS - please verify no corrected errors

# bpu-stress*.log output from bpu_os_test without Error/Fail/Timeout keywords is normal
```

</DocScope>
<DocScope products="RDK S600">

```shell
# stressapptest normal completion status (short verification run; this line is not an error)
cpu-stress1.log:2026/08/14-19:44:06(CST) Stats: Completed: 561648.00M in 10.18s 55158.57MB/s, with 0 hardware incidents, 0 errors
cpu-stress1.log:2026/08/14-19:44:06(CST) Status: PASS - please verify no corrected errors

# Real output from a short hrt_model_exec perf verification run
# (--core_id=1 --thread_num=2 --frame_count=400)
# stress_test.sh SIGTERMs hrt_model_exec when stressapptest ends, so a long
# stress run will not show the final "Perf result" summary block; as long as
# Frame count keeps growing and FPS values are stable, it is considered normal.
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

## FAQ

### The anomaly grep produces output

**Cause**: The logs really do contain an "actual anomaly" pattern such as `Error:`, `FAILED`, `Timeout`, or `N errors` (N ≥ 1).

**Solution**: Check for runtime anomalies on the kernel side:

```shell
# Look for BPU-related error/fault/oops/panic (use \b word boundaries to avoid false positives like default/found)
dmesg -T | grep -iE 'bpu.*\b(error|fault|fail|timeout|oops|panic|hung)\b'

# Or filter by log level, looking only for err/warn added during the stress test
dmesg -T --level=err,warn,crit | tail -n 50
```

:::info

During the startup phase, there are some normal BPU driver info logs. These are **not** stress test anomalies.

<DocScope products="RDK S100">
For example `arm-smmu-v3 28c00000.bpu_smmu: no cmd-sync irq - cmd-sync irq will not return!`.
</DocScope>

<DocScope products="RDK S600">
For example `arm-smmu-v3 28c00000.bpu0_smmu: no cmd-sync irq - cmd-sync irq will not return!` (S600 has one per bpu core: bpu0~bpu3, at `28c00000`/`29c00000`/`2ac00000`/`2bc00000`).
</DocScope>

The grep pattern above with `bpu.*(error|fault|fail|timeout|oops|panic|hung)` already excludes them and will only match when there is a real issue.

:::

### The script fails immediately at startup

**Cause**: Missing dependencies or invalid parameters.

**Solution**: Check the following according to your platform:

<DocScope products="RDK S100">

- `Error: Invalid option -<opt>`: an unsupported option was passed to the script.
- `Error: Option -<opt> requires an argument.`: an option is missing its required argument value.
- `Error: -r must be an integer. Got '<value>'.` / `Error: -r must be in range 5-100. Got <value>.`: `-r` is not an integer or is outside `5-100`; the script exits immediately.
- `Error: invalid -t value '<value>'. Use forms like 30s, 30m, 2h, or bare minutes.`: the `-t` value is invalid (the script warns and falls back to the default `48h` instead of exiting).

</DocScope>
<DocScope products="RDK S600">

- `Error: /usr/hobot/bin/hrt_model_exec not found (provided by hobot-dnn package)`: the `hobot-dnn` package is not installed.
- `Error: missing BPU stress model ...`: the model file under `scripts/module/` is missing.
- `Error: -c entries must be in 1..4`: `-c` contains a core number outside `1~4`.

</DocScope>

### grep error/fail produces false positives

**Cause**: On normal completion, `stressapptest` also prints `with 0 hardware incidents, 0 errors` and `Status: PASS`; matching on the `error|fail|timeout` keywords alone hits both lines and produces false positives.

**Solution**: Use the anomaly grep pattern recommended in the Result section (`Error:`/`FAILED`/`Timeout`/`N errors`) to filter and avoid false positives.

### BPU utilization is lower than expected

<DocScope products="RDK S100">

**Cause**: The stress test is not truly at full load, or the stress test has already ended (the duration elapsed, or it was stopped early with `stop_test.sh`) and `bpu_os_test` has exited.

**Solution**: Observe continuously via `cat /sys/devices/system/bpu/ratio`; it should stabilize between 98% and 100% under full load. If the ratio is 0, `bpu_os_test` has exited—just run `stress_test.sh` again.

</DocScope>
<DocScope products="RDK S600">

**Cause**: The stress test is not truly at full load, or `hrt_model_exec` has already exited.

**Solution**: Observe continuously via `cat /sys/devices/system/bpu/ratio` (or `bpuN/ratio`); each core should stabilize between 93% and 99%. If the ratio is 0, check whether `bpu-stressN.log` has stopped printing `Frame count`.

</DocScope>

### The log number keeps increasing and the current result is hard to find

**Cause**: The script numbers logs by the next free slot and does not overwrite historical logs.

**Solution**: Use the highest-numbered set of files, or locate them by modification time:

```shell
ls -lt /app/chip_base_test/log/
```

<DocScope products="RDK S600">

### Cores specified by `-c` do not run

**Cause**: In the current version, the default for `-c` is the fixed value `1,2,3,4`, and the script does not automatically skip power-gated cores.

**Solution**: First check the available cores with `cat /sys/class/boardinfo/pg_map`, then specify them explicitly with `-c`.

</DocScope>

## Related Documentation

- [Driver Functional Unit Test](/Advanced_development/driver_development/hardware_unit_test)
- [Overview](./01_overview.md)
- [AutoTest Usage](./02_auto_test.md)
- [Set Up the Development Environment](../../06_environment_build/01_environment_build.md)
