---
sidebar_position: 2
title: "AutoTest 使用方法"
description: "AutoTest 自动化压测工具的使用方法：通过 config.ini 配置测试项，由 startup.sh 统一启动"
---

# AutoTest 使用方法

AutoTest 是预置在开发板上的一套自动化测试方案，用于把多个驱动功能单元测试串联成一次无人值守的稳定性或压力测试。它通过配置文件 `config/config.ini` 选择测试项并指定压测时长，用户也可以按同样的格式扩展自己的测试项。

AutoTest 在驱动功能单元测试脚本的基础上开发，二者相互独立：既可以用 `startup.sh` 统一编排，也可以单独运行某一个测试脚本。

:::tip
板端预置代码位于 `/app/chip_base_test/`，该目录下的脚本已在开发板上验证通过，可直接使用。
:::

## 环境准备

- 硬件：开发板一台，`/app/chip_base_test/` 目录已随镜像预置。
- 系统：已烧录官方发布的 RDK OS 镜像，可正常启动并登录。
- 依赖：无需额外安装。`stressapptest`、`bpu_os_test` 等可执行文件已随目录预置；`uart_test`、`spidev_tc` 默认不在板端，运行 UART 与 SPI 测试前需先编译，见各测试项章节。

:::note
压测会长时间占满 CPU、BPU、DDR、eMMC 与外设资源，请确认开发板供电稳定、散热正常，并避免在承载业务的板卡上执行。
:::

## 代码位置

- 板端路径：`/app/chip_base_test/`
- 目录结构：

```text
/app/chip_base_test/
├── 01_cpu_bpu_ddr/
│   └── scripts/
│       ├── stress_test.sh              # CPU-BPU-DDR 压力测试
│       ├── stop_test.sh                # 停止正在进行的压力测试
│       ├── stressapptest               # 内存压力测试程序
│       ├── Readme.md
│       └── module/
│           └── resnet50_224x224_nv12.hbm
├── 02_emmc/
│   ├── emmc_stability_test.sh          # eMMC 稳定性测试
│   ├── emmc_performance_test.sh        # eMMC 性能测试
│   └── Readme.md
├── 03_uart_test/
│   ├── uartstress.sh                   # 串口压力测试
│   ├── uart_test.c
│   ├── Makefile
│   └── Readme.md
├── 04_spi_test/
│   ├── spistress.sh                    # SPI 压力测试
│   ├── spidev_tc.c
│   ├── Makefile
│   └── Readme.md
├── 07_cpu_performance/
│   └── coremark-main/                  # CoreMark 源码，需自行编译
├── 08_ddr_bandwidth/
│   ├── stream.c                        # STREAM 源码，需自行编译
│   └── README.md
├── 10_gpu_3d_test/
│   └── clpeak/                         # clpeak 补丁与编译说明，需自行编译
├── config/
│   └── config.ini                      # AutoTest 配置文件
├── log/                                # 测试日志目录，运行 startup.sh 时自动创建
├── startup.sh                          # AutoTest 启动脚本
└── README.md
```

其中 `07_cpu_performance`、`08_ddr_bandwidth`、`10_gpu_3d_test` 只提供源码和编译说明，不是可直接调用的压测脚本，因此没有配置在 `config.ini` 中。三者的独立测试方法见「[相关文档](#相关文档)」。

## 使用方法

### 配置 config.ini

`startup.sh` 通过 `config/config.ini` 决定运行哪些测试项、以及每个测试项怎么跑。每个测试项以 `[测试项名称]` 开头，包含以下字段：

- **`Status`**：启用状态，设置为 `enabled` 表示启用，设置为 `disabled` 表示禁用。
- **`Description`**：测试项的简要描述。
- **`ExecStart`**：测试脚本的绝对路径及其运行参数。

配置示例：

```bash
[CpuAndBpu]
Status=enabled
Description=CPU, BPU, and DDR stress test
ExecStart=/app/chip_base_test/01_cpu_bpu_ddr/scripts/stress_test.sh -t 24h

[EmmcStablity]
Status=enabled
Description=eMMC stability test
ExecStart=/app/chip_base_test/02_emmc/emmc_stability_test.sh -t 24h

[UART]
Status=enabled
Description=UART stress test
ExecStart=/app/chip_base_test/03_uart_test/uartstress.sh -b 115200 -d /dev/ttyS2 -c 1000000

[SPI]
Status=enabled
Description=SPI stress test
ExecStart=/app/chip_base_test/04_spi_test/spistress.sh -d /dev/spidev0.0 -c 1000000
```

按需调整 `ExecStart` 中的参数即可改变测试行为，例如把 `-t 24h` 改为 `-t 30m` 缩短压测时长，或把 `/dev/ttyS2`、`/dev/spidev0.0` 换成实际使用的设备节点。所有测试脚本都支持 `-h` 查看各自的参数说明。

### 启动测试

启动前先确认启用测试项的可执行文件已在对应目录下编译好。`stressapptest`、`bpu_os_test` 已随镜像预置；`uart_test`、`spidev_tc` 默认不在板端，需分别在 `03_uart_test`、`04_spi_test` 目录下执行 `make` 生成（编译方法见各测试项章节）：

```bash
ls /app/chip_base_test/01_cpu_bpu_ddr/scripts/stressapptest
ls /app/chip_base_test/03_uart_test/uart_test
ls /app/chip_base_test/04_spi_test/spidev_tc
```

任一文件缺失时，对应测试项会启动失败；用不到 UART 或 SPI 测试时，也可把 `config.ini` 中对应段的 `Status` 改为 `disabled`。

完成 `config.ini` 配置后，执行以下命令启动测试：

```bash
/app/chip_base_test/startup.sh
# 或者
cd /app/chip_base_test
./startup.sh
```

不指定 `-t` 时，`startup.sh` 会按 `config.ini` 中的先后顺序，依次运行所有 `Status=enabled` 的测试项。

:::note
运行测试前，`startup.sh` 会先把 CPU 调频策略固定为 `performance`：

```bash
echo performance > /sys/devices/system/cpu/cpufreq/policy0/scaling_governor
```

这是保证多次压测结果可比的前提，测试期间请勿改回其他调频策略。
:::

### 选择测试项

`startup.sh` 支持 `-h/--help` 与 `-t/--test <测试项名称>`，后者可重复使用以依次运行多项：

```shell
root@drobot:/app/chip_base_test# ./startup.sh -h
Usage: ./startup.sh [OPTIONS]

Options:
  -h, --help              Show this help message and exit
  -t, --test TEST_NAME    Specify the test to execute (can be used multiple times)

Available tests:
  CpuAndBpu            CPU, BPU, and DDR stress test
  EmmcStablity         eMMC stability test
  UART                 UART stress test
  SPI                  SPI stress test
```

```bash
cd /app/chip_base_test
./startup.sh -t CpuAndBpu -t SPI   # 只运行 CpuAndBpu 和 SPI 两项
```

`-t` 指定的测试项必须已启用。若名称不存在或该项的 `Status` 不是 `enabled`，脚本会输出 `Test '<名称>' not found or not enabled in config.ini` 并以非 0 状态退出。

### 查看测试日志

`startup.sh` 所在目录下的 `log/` 是统一的日志目录，即 `/app/chip_base_test/log`。该目录由 `startup.sh` 在启动时自动创建，各测试脚本默认也把日志写入同一目录。

- `log/status`：`startup.sh` 的进度记录，每完成一项追加一行 `Running <测试项名称>...finish`，全部完成后追加 `All tests completed successfully.`。
- `01_cpu_bpu_ddr`：`bpu-stress<N>.log`、`cpu-stress<N>.log`、`monitor-stress<N>.log`（记录温度与占用率）。
- `02_emmc`：`test_iozone_emmc_stability.log`。
- `03_uart_test`：`uart_test_log<N>.txt`。
- `04_spi_test`：`spi_test_log<N>.txt`。

文件名中的 `<N>` 是脚本自动递增的序号，重复运行时不会覆盖上一次的日志。

如需把日志写到其他位置，有两种方式：

1. **移动整个目录**：脚本内部用自身路径推导日志目录，把 `chip_base_test` 整体移动到新位置后，日志会自动跟随，例如：

   ```bash
   mv /app/chip_base_test /userdata/chip_base_test
   ```

   此后日志保存到 `/userdata/chip_base_test/log`，无需修改 `config.ini`。

2. **用 `-o` 指定输出目录**：所有测试脚本都支持 `-o <目录>`，在 `config.ini` 中对应测试项的 `ExecStart` 里加上该参数即可，例如：

   ```text
   ExecStart=/app/chip_base_test/01_cpu_bpu_ddr/scripts/stress_test.sh -t 24h -o /userdata/logs
   ```

### 配置开机自启动

测试项配置完成并调试通过后，可以把 `startup.sh` 加入 `rc.local`，让开发板上电后自动开始测试。

### 新增测试项

AutoTest 通过 `config.ini` 与脚本扩展测试项，步骤如下。

1. **编写测试脚本**。脚本需要能独立运行，并满足：

   - 有明确的输入参数（如测试时长、设备路径等）。
   - 支持 `-o` 参数自定义日志输出目录。

   把脚本放到合适的路径，例如 `/app/chip_base_test/new_test/new_test.sh`。

2. **在 `config.ini` 中新增配置段**，示例：

   ```text
   [NewTest]
   Status=enabled
   Description=New feature stability or stress test
   ExecStart=/app/chip_base_test/new_test/new_test.sh -t 12h -o /userdata/new_test_logs
   ```

   其中 `-t 12h` 指定测试时长为 12 小时，`-o /userdata/new_test_logs` 指定日志目录。

3. **启动并验证**。重新运行 `startup.sh`，确认新测试项被加载；检查日志文件是否按预期生成、参数是否正确生效、测试结果是否符合功能预期。

## 运行效果

- 运行命令：`./startup.sh -t <测试项名称>`，或直接执行 `./startup.sh` 运行全部启用项。
- 成功标志：控制台逐项打印 `Executing <测试项名称>...`；`log/` 下生成对应日志文件；各脚本在日志末尾输出自己的成功文案，例如 UART 的 `UART test completed successfully!`、SPI 的 `SPI test completed successfully!`、eMMC 的 `Test loop <N> succeeded!`；全部结束后 `log/status` 中出现 `All tests completed successfully.`。
- 结果预览：`log/status` 的内容形如：

  ```text
  Running CpuAndBpu...finish
  Running EmmcStablity...finish
  All tests completed successfully.
  ```

- 失败排查：日志中出现 `failed`、`error` 等关键字，或 `log/status` 缺少 `All tests completed successfully.`，说明有测试项未正常结束。此时按测试项名称查看 `log/` 下对应的日志文件定位原因，也可单独运行该测试脚本复现。

:::note
以上成功判据来自各脚本内置的日志文案。压测耗时较长，实际输出内容会随硬件状态与测试参数变化，请以板端运行结果为准。
:::

## 常见问题

### 提示 Test 'xxx' not found or not enabled in config.ini

**原因**：`-t` 指定的测试项名称拼写有误，或该项的 `Status` 不是 `enabled`。

**解决**：先执行 `./startup.sh -h` 查看可用的测试项名称，再用 `-t` 指定；若该项需要运行，请把 `config.ini` 中对应的 `Status` 改为 `enabled`。

### 启动后未产生测试日志

**原因**：日志目录不存在或不可写，或 `-o` 指定的路径有误。

**解决**：确认 `startup.sh` 所在目录可写，`log/` 会由脚本自动创建；若在 `ExecStart` 中使用了 `-o`，请确认该目录存在且可写。

## 相关文档

- [驱动功能单元测试](./01_overview.md)
- [搭建开发环境](../../06_environment_build/01_environment_build.md)
- [CPU-BPU-DDR 压力测试](./03_bpu_cpu_ddr_stress.md)
- [eMMC 稳定性测试](./04_emmc_stress.md)
- [UART 压力测试](./05_uart_stress.md)
- [SPI 压力测试](./06_spi_stress.md)
- [CPU 性能测试](./09_cpu_performance.md)
- [DDR 带宽测试](./10_ddr_bandwidth.md)
- [3D GPU 性能测试](./12_3d_gpu.md)
