# CPU-BPU-DDR Stress Test

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Advanced_development/linux_development/hardware_unit_test/bpu_cpu_ddr_stress

Note
This document covers both RDK S100 and RDK S600. The CPU/DDR section ( `stressapptest` ) is identical across both platforms; **the BPU section uses completely different stress testing tools and models for the two platforms** —S100 uses `bpu_os_test` (a raw binary with the group proportion mechanism in `run.sh` ), while S600 uses `hrt_model_exec` (provided by the `hobot-dnn` package)—please switch to your platform using the tabs below. All tabs on this page switch together.

## Test Principles

The test principles of the CPU-BPU-DDR stress test primarily involve evaluating the performance and stability of the CPU, BPU, and DDR under high-load conditions. Below are the basic principles of stress testing for these components:

**1. CPU DDR Stress Test**

- **Test Target** : Use the `stressapptest` tool to simulate a high-load environment, performing extensive calculations, data processing, and memory operations to test system performance under multi-threaded concurrent tasks.
- **Test Purpose** : Verify the stability and performance of the CPU under prolonged high loads, ensuring that the CPU and DDR can maintain normal operation under high load, avoiding crashes, overheating, or performance degradation.
- **`stressapptest` CPU Stress Test Principle** : CPU stress testing is primarily achieved by executing compute-intensive tasks concurrently with multiple threads. These tasks include compute-intensive tasks and multi-threaded parallel execution.

- Thread Creation: `stressapptest` creates multiple threads via `pthread_create()` , each executing computational tasks. The number of threads is typically specified by the user via the `-C` parameter.

```c
for (int i = 0; i < num_threads; i++) {
    pthread_create(&threads[i], NULL, cpu_stress_function, (void*)i);
}
```

- Compute-Intensive Task: Each thread performs compute-intensive operations, such as floating-point calculations and memory reads/writes, which consume CPU resources.

```c
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
- **`stressapptest` DDR Stress Test Principle** : DDR memory stress testing primarily involves extensive memory allocation, access, and data exchange through high memory usage, frequent memory read/write operations, and consumption of memory bandwidth.

- Memory Allocation: In the memory stress test, `stressapptest` allocates memory of a specified size based on the `-M` parameter (e.g., `-M 8192` ).

```c
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

```c
void stress_memory(void* ptr, size_t size) {
    volatile char* data = (volatile char*)ptr;
            for (size_t i = 0; i < size; i++) {
                            data[i] = (char)(i % 256);  // Write data
                            char temp = data[i];  // Read data
            }
}
```

- Thread Memory Access: `stressapptest` uses multiple threads to concurrently access memory, simulating memory usage under high load.
- **Command Analysis** : The call to `stressapptest` inside the stress test script: `stressapptest -s "$stime" -M "$memory_size" -f /tmp/sat.io1 -f /tmp/sat.io2 -i "$io_threads" -m 8 -C 2 -W`

- `-s "$stime"` : Test duration.
- `-M "$memory_size"` : Memory usage (controls `malloc` allocation size).
- `-f /tmp/sat.io1 -f /tmp/sat.io2` : Files used for I/O testing.
- `-i "$io_threads"` : Number of I/O operation threads.
- `-m 8` : Memory stress intensity.
- `-C 2` : Number of CPU cores.
- `-W` : Enables write operations (not only reads but also writes to memory).
**2. BPU Stress Test**

- **Test Target** : Use the `run.sh` script to call the `bpu_os_test` tool, controlling the BPU load percentage (5~100%) via the `-r` parameter, continuously inferring the YOLOv3 model under specified load scenarios to ensure stable BPU operation under high load and achieve expected performance.
- **Test Purpose** : Ensure the BPU can produce correct results when executing computational tasks and does not crash or produce errors under prolonged high-load operation.
- **`bpu_os_test` BPU Stress Test Principle** : Load the YOLOv3 model containing many computational tasks, using the BPU's **group proportion mechanism** to schedule inference tasks, keeping BPU utilization stable at the specified percentage. Workflow:

1. The `stress_test.sh` wrapper layer parses the `-r <portion>` parameter;
2. `run.sh` selects the number of threads (1~8 threads) and group distribution based on the `portion` value;
3. Each thread calls `hb_bpu_set_group_proportion()` to set the BPU quota for its group, then binds the inference task to the corresponding group via `hb_bpu_task_set_group()` ;
4. The sum of proportions of all groups is the final BPU utilization.
- **Command Analysis** : After running the stress test script, the following command is actually executed internally (using `-r 50` as an example):

```shell
bpu_os_test -m ./module/yolov3.hbm \
            -d ./module/input_1.bin,./module/input_2.bin \
            -a yolov3_original_float_model_ \
            -l $l_value -o 0 \
            -n 4 -r "12,12,12,14" -g "1,2,3,4"
```

- `-m <hbm>` : Specifies the BPU model file.
- `-d <bin1,bin2>` : Inference input data (multiple separated by commas).
- `-a <graph_name>` : Name of the graph inside the model.
- `-l <loop_time>` : Number of inference loops (controlled by the outer `-l` parameter, 0 for infinite loop).
- `-o <0|1>` : Whether to output inference results; set to `0` during stress tests to avoid I/O interference.
- `-n <thread>` : Number of concurrent task threads, automatically graded based on the target percentage.
- `-r "<prop1,prop2,...>"` : BPU proportion value for the group corresponding to each thread; **the sum of the values equals the target utilization** .
- `-g "<id1,id2,...>"` : Group ID assigned to each thread.
info
`bpu_os_test --help` shows `-r` as `group_id` and `-g` as `group_prop` , but the actual runtime semantics are the opposite of the help description: **`-r` takes the proportion value, and `-g` takes the group ID** . This is a legacy behavior of the `bpu_os_test` binary; `run.sh` is configured according to the actual effective method, and users calling via `stress_test.sh -r <N>` need not worry about this detail.

- **Test Target** : Use `stress_test.sh` to call the `hrt_model_exec` tool, selecting the BPU cores to stress with `-c` and controlling the load percentage for each core with `-r` , continuously inferring the S600-adapted HBM model ( `resnet50_224x224_nv12.hbm` ) to ensure stable BPU operation under high load and achieve expected performance.
- **Test Purpose** : Ensure the BPU can produce correct results when performing inference computations and does not crash or produce errors under prolonged high-load operation.
- **`hrt_model_exec` BPU Stress Test Principle** : `hrt_model_exec` is the official model inference/performance testing tool from D-Robotics, installed to `/usr/hobot/bin/` by the `hobot-dnn` package. During stress testing, it is started with the `perf` subcommand; at runtime, environment variables `BPU_BUF_GROUP=true` + `_HB_NN_BPU_GROUP_ID_=<core>` + `_HB_NN_BPU_GROUP_PROP_=<percent>` bind the target core to a BPU group and allocate BPU time slice quotas to that group according to the group_prop, achieving steady-state load per core and per percentage. `stress_test.sh` workflow:

1. Parse `-t` (duration), `-r <portion>` (total load 5~100%), `-c <cores>` (list of BPU cores to stress; if omitted, **automatically read from `/sys/class/boardinfo/pg_map` , skipping power-gated cores** );
2. Calculate group_prop per core = `portion / number of selected cores` (minimum 1);
3. After starting `stressapptest` for CPU/DDR, **fork an independent `hrt_model_exec perf` process for each selected core** , each process binding to the corresponding core and setting group_prop via environment variables;
4. Each `hrt_model_exec` continuously infers `resnet50_224x224_nv12.hbm` on its own core, with stdout periodically outputting FPS, average/max/min latency.
- **Command Analysis** : Taking `-c 1,3 -r 100` (stressing only bpu0/bpu2, 50% group_prop per core) as an example, `stress_test.sh` internally executes the following for each core:

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
# Similarly for bpu2: _HB_NN_BPU_GROUP_ID_=3 _HB_NN_BPU_GROUP_PROP_=50 ... --core_id=3
```

- `BPU_BUF_GROUP=true` : Enables BPU buffer-group QoS scheduling.
- `_HB_NN_BPU_GROUP_ID_=<core>` : BPU group ID to which this process's tasks are bound, corresponding to `--core_id` .
- `_HB_NN_BPU_GROUP_PROP_=<percent>` : BPU time slice quota (percentage) for this group on the corresponding core. Value is automatically calculated by `stress_test.sh` as `portion / number of selected cores` .
- `--model_file <hbm>` : Path to the S600-adapted HBM model file.
- `--core_id <id>` : Single core ID (1=bpu0, 2=bpu1, 3=bpu2, 4=bpu3).
- `--thread_num 2` : 2 inference threads per core, sufficient to saturate the single-core pipeline.
- `--perf_time <min>` : Duration of perf mode operation in minutes, converted from `stress_test.sh -t` .

## Preparation

**1.** Before starting the stress test, add a heatsink to the chip; otherwise, the chip may enter over-temperature protection, affecting the test results.

**2.** Ensure the files in the `/app/chip_base_test/01_cpu_bpu_ddr` path are complete:

warning
The dynamic libraries in the `lib/` path and the model and input files in the `module` path are only for **stress testing** scenarios to **load the BPU** and cannot be used for any other purpose.

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

warning
The model files in the `module` path are only for **stress testing** scenarios to **load the BPU** and cannot be used for any other purpose.

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

`hrt_model_exec` is provided by the `hobot-dnn` package (installed by default in the system image) and is located at `/usr/hobot/bin/hrt_model_exec` . The script will call it automatically; manual pre-installation is not required.

## Test Method

The stress test script supports the `-h` suffix to view command parameter descriptions:

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

Parameter descriptions:

- `-t <time>` : Duration of the stress test, supports hours (e.g., `2h` ) or minutes (e.g., `30m` ), default `48h` .
- `-m <size>` : CPU/DDR stress test memory size (MB), default `100` .
- `-i <threads>` : Number of I/O threads for `stressapptest` , default `4` .
- `-r <portion>` : BPU load percentage (%), value range `5-100` , default `100` (full load).
- `-o <directory>` : Log output directory, default `../../log` .
- `-h, --help` : Display help information and exit.
info
The S100 platform has only one BPU core (can be confirmed via `cat /sys/devices/system/bpu/core_num` ), so no BPU core selection parameter is required.

**Example:**`sudo ./stress_test.sh -t 24h -m 200 -i 8 -r 80` runs a 24-hour stress test using 200MB of memory, 8 I/O threads, and 80% BPU load.

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

Parameter descriptions:

- `-t <time>` : Duration of the stress test, supports hours (e.g., `2h` ) or minutes (e.g., `30m` ), default `48h` .
- `-m <size>` : CPU/DDR stress test memory size (MB), default `100` .
- `-i <threads>` : Number of I/O threads for `stressapptest` , default `4` .
- `-r <portion>` : BPU load percentage (%), value range `5-100` , default `100` (full load). The script calculates the group_prop quota per core as `portion / number of selected cores` , and the BPU runtime achieves steady-state load via group QoS scheduling.
- `-c <cores>` : List of BPU cores to stress, numbering rule `1=bpu0 2=bpu1 3=bpu2 4=bpu3` , comma-separated. **If omitted, automatically reads from `/sys/class/boardinfo/pg_map` , skipping power-gated cores** ; only specify explicitly if you want to stress a subset (e.g., to troubleshoot a single core anomaly).
- `-o <directory>` : Log output directory, default `../../log` .
- `-h, --help` : Display help information and exit.
info
The S600 platform has 4 BPU cores (can be confirmed via `cat /sys/devices/system/bpu/core_num` ). `/sys/class/boardinfo/pg_map` is the power-gate bitmap (bit i set means the corresponding core is power-gated); the script skips these cores by default, so there's no need to manually maintain the list of available cores.

**Example:**`sudo ./stress_test.sh -t 24h -m 200 -i 8 -r 80` runs a 24-hour stress test using 200MB of memory, 8 I/O threads, and all available BPU cores stabilized at 80% load.

After ensuring preparations are complete, run the test command:

```shell
cd /app/chip_base_test/01_cpu_bpu_ddr/scripts

sudo ./stress_test.sh
```

The stress test script periodically collects board-level temperature, voltage, CPU frequency, and BPU utilization using the `hrut_somstatus` command. Output example (only key sections shown):

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

`hrut_somstatus` command result explanation:

- `temperature` : Current onboard, MCU, BPU temperatures.
- `voltage` : Main power rail voltages ( `VDD_CPU` , `VDD_BPU` , `VDD_MCU` , `VDD_DDR*` , etc.; S100 has many voltage points, and the raw output also includes various PLL/IO sub-rails).
- `cpu frequency` : Minimum, current, and maximum operating frequency (kHz) for each CPU policy. S100 has 6 CPU cores, divided into 2 policies ( `policy0/policy4` ).
- `bpu status information` : Current BPU utilization (percentage). S100 has only 1 BPU core ( `bpu0` ), and during stress tests, it should stabilize near the target percentage.
tip
BPU utilization can also be read directly via sysfs nodes, which is more lightweight and programmable:

```shell
cat /sys/devices/system/bpu/ratio           # Single sample
watch -n1 cat /sys/devices/system/bpu/ratio # Real-time observation with 1-second refresh
```

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
            min    cur    max
    policy0:    525000    2100000    2100000
    policy2:    525000    2100000    2100000
    policy6:    525000    2100000    2100000
    policy10:    525000    2100000    2100000
    policy14:    525000    2100000    2100000
bpu status information---->
        ratio
    bpu0:     99
    bpu1:     98
    bpu2:     98
    bpu3:     97
```

`hrut_somstatus` command result explanation:

- `temperature` : Current onboard, DDR, BPU (each BPU core has two `pvtc` temperature points: `pvt_bpu_pvtcN_t1/t2` ) temperatures.
- `voltage` : Main power rail voltages ( `VDD_CPU` , `VDD_BPUL` / `VDD_BPUR` left and right BPU cluster voltages, DDR series).
- `cpu frequency` : Minimum, current, and maximum operating frequency (kHz) for each CPU policy. S600 has 18 CPU cores, divided into 5 policies ( `policy0/2/6/10/14` ).
- `bpu status information` : Current utilization (percentage) of the 4 BPU cores. During concurrent CPU/BPU/DDR stress testing, because `stressapptest` also competes for memory bandwidth, the measured peak for each BPU core typically falls within the 85-100% range (can approach 100% when only running BPU).
tip
BPU utilization can also be read directly via sysfs nodes, which is more lightweight and programmable:

```shell
cat /sys/devices/system/bpu/ratio            # Overall utilization (single sample)
cat /sys/devices/system/bpu/bpu0/ratio       # Single-core utilization
for i in 0 1 2 3; do
    echo -n "bpu$i: "; cat /sys/devices/system/bpu/bpu$i/ratio
done                                         # Sample all 4 cores one by one
watch -n1 cat /sys/devices/system/bpu/ratio  # Real-time observation with 1-second refresh
```

Execute the `htop` command to view CPU utilization

![Htop](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/Htop.png)Each line shows the status of a CPU core in the format:

```shell
CpuX  [ progress bar ]
```

- `[########...]` : Real-time load progress bar for each core.
- `#` : Indicates user space percentage.
- `*` : Indicates kernel space percentage.
- `Load average: 7.10 9.56 9.57` : Indicates the system's average load over 1, 5, and 15 minutes.
The numbering range of `CpuX` corresponds to the number of CPU cores on the platform:

`Cpu0` ~ `Cpu5` : 6 cores on the S100 platform.

`Cpu0` ~ `Cpu17` : 18 cores on the S600 platform.

## Test Metrics

After the test program starts, two log files, `bpu-stressX.log` and `cpu-stressX.log` , will be generated in the `/app/chip_base_test/log` directory to record the status during the stress test. Ensure the following during the stress test:

- Stable operation for 48 hours without restarting or hanging.
- Check for anomalies in the log files using the following command:

```shell
cd /app/chip_base_test/log/ && \
    grep -iE '(^.*Error:|FAILED|\bTimeout\b|\b[1-9][0-9]* errors)' \
         bpu-stress*.log cpu-stress*.log
```

warning
Do not simply use `grep -iE 'error|fail|timeout'` : `stressapptest` will inevitably print `with 0 hardware incidents, 0 errors` and `Status: PASS - please verify no corrected errors` upon normal completion, and these lines will be matched by the naive grep above, causing false positives. You must match "actual anomaly" patterns as shown above.

- BPU utilization can be continuously observed via `cat /sys/devices/system/bpu/ratio` (or `bpuN/ratio` ); the normal utilization range during stress testing varies by platform:

S100 has a single BPU core; during full-load stress testing, it should stabilize in the 98-100% range.

When concurrently stressing CPU/DDR on the S600's 4 BPU cores, the measured peak for each core typically falls within the 85-100% range.
- Use `top` / `htop` to view CPU utilization and check whether the throughput/latency data output by the BPU inference tool in `bpu-stressX.log` is stable.

### Test Results

Normal log output examples:

```shell
# stressapptest normal completion status (this line is not an error)
cpu-stress1.log:2025/05/19-22:01:32(CST) Status: PASS - please verify no corrected errors

# bpu-stress*.log output from bpu_os_test without Error/Fail/Timeout keywords is normal
```

```shell
# stressapptest normal completion status (this line is not an error)
cpu-stress1.log:2026/04/22-20:21:52(CST) Stats: Completed: 5554832.00M in 120.87s 45957.99MB/s, with 0 hardware incidents, 0 errors
cpu-stress1.log:2026/04/22-20:21:52(CST) Status: PASS - please verify no corrected errors

# Streaming output from a normally running hrt_model_exec (last few lines of bpu-stressX.log)
# stress_test.sh SIGTERMs hrt_model_exec when stressapptest ends, so the final
# "Perf result" summary block will not be seen; as long as Frame count continues
# to grow and FPS values are stable, it is considered normal.
Frame count: 421400,  Thread Average: 3.761208 ms,  thread max latency: 21.313000 ms,  thread min latency: 0.743000 ms,  FPS: 3771.641357
Frame count: 421600,  Thread Average: 3.760553 ms,  thread max latency: 21.313000 ms,  thread min latency: 0.743000 ms,  FPS: 3772.408447
Frame count: 421800,  Thread Average: 3.759908 ms,  thread max latency: 21.313000 ms,  thread min latency: 0.743000 ms,  FPS: 3773.171387
Frame count: 422000,  Thread Average: 3.759271 ms,  thread max latency: 21.313000 ms,  thread min latency: 0.743000 ms,  FPS: 3773.928223
Frame count: 422200,  Thread Average: 3.758635 ms,  thread max latency: 21.313000 ms,  thread min latency: 0.743000 ms,  FPS: 3774.684570
Frame count: 422400,  Thread Average: 3.757990 ms,  thread max latency: 21.313000 ms,  thread min latency: 0.743000 ms,  FPS: 3775.449951
```

- If there is **no output** from the recommended anomaly grep command, it means no errors were detected during the stress test, and the result is normal.
- If the output contains `Error:` , `FAILED` , `Timeout` , or `N errors` (N ≥ 1), further investigation is required.
- Also check for runtime anomalies on the kernel side:

```shell
# Look for BPU-related error/fault/oops/panic (use \b word boundaries to avoid false positives like default/found)
dmesg -T | grep -iE 'bpu.*\b(error|fault|fail|timeout|oops|panic|hung)\b'

# Or filter by log level, looking only for err/warn added during the stress test
dmesg -T --level=err,warn,crit | tail -n 50
```

info
During the startup phase, there will be some normal BPU driver info logs (e.g., `arm-smmu-v3 28c00000.bpu_smmu: hobot_smmu_clk_get: miss clk:...` ), which are **not** stress test anomalies. The grep pattern above with `bpu.*error` already excludes them and will only match when there is a real issue.
