---
sidebar_position: 2
title: "AutoTest Usage Guide"
description: "How to use the AutoTest automated stress testing tool: configure test items in config.ini and launch them with startup.sh"
---

# AutoTest Usage Guide

AutoTest is an automated test solution pre-installed on the development board. It chains multiple driver functional unit tests into a single unattended stability or stress test run. The configuration file `config/config.ini` selects which test items to run and how long to run them, and you can extend the list with your own test items using the same format.

AutoTest is built on top of the driver functional unit test scripts and reuses them directly. The two are independent of each other: you can either orchestrate them with `startup.sh` or run a single test script on its own.

:::tip
The pre-installed code is located in `/app/chip_base_test/`. The scripts in this directory have been verified on the development board and can be used directly.
:::

## Prerequisites

- Hardware: one development board, with the `/app/chip_base_test/` directory pre-installed by the image.
- System: an officially released RDK OS image is flashed and the board boots and logs in normally.
- Dependencies: none. Executables such as `stressapptest` and `bpu_os_test` are pre-installed in the directory; `uart_test` and `spidev_tc` are not on the board by default and must be compiled before running the UART and SPI tests, see the corresponding test pages.

:::note
Stress testing occupies the CPU, BPU, DDR, eMMC, and peripherals at full load for a long time. Make sure the board has a stable power supply and adequate cooling, and avoid running it on a board that carries production workloads.
:::

## Code Location

- Board path: `/app/chip_base_test/`
- Directory structure:

```text
/app/chip_base_test/
├── 01_cpu_bpu_ddr/
│   └── scripts/
│       ├── stress_test.sh              # CPU-BPU-DDR stress test
│       ├── stop_test.sh                # Stop a running stress test
│       ├── stressapptest               # Memory stress test program
│       ├── Readme.md
│       └── module/
│           └── resnet50_224x224_nv12.hbm
├── 02_emmc/
│   ├── emmc_stability_test.sh          # eMMC stability test
│   ├── emmc_performance_test.sh        # eMMC performance test
│   └── Readme.md
├── 03_uart_test/
│   ├── uartstress.sh                   # UART stress test
│   ├── uart_test.c
│   ├── Makefile
│   └── Readme.md
├── 04_spi_test/
│   ├── spistress.sh                    # SPI stress test
│   ├── spidev_tc.c
│   ├── Makefile
│   └── Readme.md
├── 07_cpu_performance/
│   └── coremark-main/                  # CoreMark source, must be built manually
├── 08_ddr_bandwidth/
│   ├── stream.c                        # STREAM source, must be built manually
│   └── README.md
├── 10_gpu_3d_test/
│   └── clpeak/                         # clpeak patch and build instructions, build manually
├── config/
│   └── config.ini                      # AutoTest configuration file
├── log/                                # Test log directory, created by startup.sh
├── startup.sh                          # AutoTest launcher script
└── README.md
```

`07_cpu_performance`, `08_ddr_bandwidth`, and `10_gpu_3d_test` only provide source code and build instructions rather than ready-to-run stress scripts, so they are not configured in `config.ini`. See [Related Documentation](#related-documentation) for how to test them individually.

## Usage

### Configuring config.ini

`startup.sh` uses `config/config.ini` to decide which test items to run and how to run each one. Every test item starts with `[Test Item Name]` and contains the following fields:

- **`Status`**: Enable status. Set to `enabled` to activate the item, or `disabled` to deactivate it.
- **`Description`**: A brief description of the test item.
- **`ExecStart`**: The absolute path to the test script plus its runtime parameters.

Example configuration:

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

Adjust the parameters in `ExecStart` to change the test behavior. For example, change `-t 24h` to `-t 30m` to shorten the run, or replace `/dev/ttyS2` and `/dev/spidev0.0` with the device nodes actually in use. Every test script supports `-h` for its own parameter reference.

### Launching the Test

Before starting, confirm that the executables of the enabled test items have been built in their directories. `stressapptest` and `bpu_os_test` ship with the image, while `uart_test` and `spidev_tc` are not on the board by default and must be generated by running `make` in the `03_uart_test` and `04_spi_test` directories respectively (see the corresponding test pages for how to build them):

```bash
ls /app/chip_base_test/01_cpu_bpu_ddr/scripts/stressapptest
ls /app/chip_base_test/03_uart_test/uart_test
ls /app/chip_base_test/04_spi_test/spidev_tc
```

If any of these files is missing, the corresponding test item will fail to start; if you do not need the UART or SPI tests, you can also set `Status` to `disabled` for those sections in `config.ini`.

After configuring `config.ini`, start the test with:

```bash
/app/chip_base_test/startup.sh
# or
cd /app/chip_base_test
./startup.sh
```

Without `-t`, `startup.sh` runs every test item whose `Status` is `enabled`, in the order they appear in `config.ini`.

:::note
Before running the tests, `startup.sh` first pins the CPU frequency governor to `performance`:

```bash
echo performance > /sys/devices/system/cpu/cpufreq/policy0/scaling_governor
```

This is a prerequisite for comparable results across repeated runs. Do not switch back to another governor during the test.
:::

### Selecting Test Items

`startup.sh` supports `-h/--help` and `-t/--test <test name>`, and the latter can be repeated to run several items in sequence:

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
./startup.sh -t CpuAndBpu -t SPI   # Run only CpuAndBpu and SPI
```

An item passed to `-t` must be enabled. If the name does not exist, or its `Status` is not `enabled`, the script prints `Test '<name>' not found or not enabled in config.ini` and exits with a non-zero status.

### Viewing Test Logs

The `log/` directory next to `startup.sh`, that is `/app/chip_base_test/log`, is the shared log directory. It is created automatically by `startup.sh` at launch, and each test script writes its logs there by default.

- `log/status`: progress records written by `startup.sh`. Each completed item appends a `Running <test name>...finish` line, and the final line is `All tests completed successfully.`
- `01_cpu_bpu_ddr`: `bpu-stress<N>.log`, `cpu-stress<N>.log`, `monitor-stress<N>.log` (temperature and utilization).
- `02_emmc`: `test_iozone_emmc_stability.log`.
- `03_uart_test`: `uart_test_log<N>.txt`.
- `04_spi_test`: `spi_test_log<N>.txt`.

`<N>` is a sequence number incremented automatically by the script, so repeated runs do not overwrite previous logs.

To store logs elsewhere, use one of the following two methods:

1. **Move the whole directory.** The scripts derive the log directory from their own path, so the logs follow `chip_base_test` when you move it:

   ```bash
   mv /app/chip_base_test /userdata/chip_base_test
   ```

   Logs are then saved to `/userdata/chip_base_test/log` without editing `config.ini`.

2. **Set the output directory with `-o`.** Every test script supports `-o <directory>`. Add it to the `ExecStart` of the corresponding test item in `config.ini`:

   ```text
   ExecStart=/app/chip_base_test/01_cpu_bpu_ddr/scripts/stress_test.sh -t 24h -o /userdata/logs
   ```

### Auto-Starting on Boot

Once the test items are configured and verified, add `startup.sh` to `rc.local` to start testing automatically after the board powers on.

### Adding New Test Items

AutoTest can be extended with new test items through `config.ini` and scripts. Follow these steps.

1. **Write the test script.** It must run standalone and satisfy the following:

   - It has clear input parameters (test duration, device path, and so on).
   - It supports the `-o` parameter to customize the log output directory.

   Place the script at a suitable path, for example `/app/chip_base_test/new_test/new_test.sh`.

2. **Add a configuration block in `config.ini`**, for example:

   ```text
   [NewTest]
   Status=enabled
   Description=New feature stability or stress test
   ExecStart=/app/chip_base_test/new_test/new_test.sh -t 12h -o /userdata/new_test_logs
   ```

   Here `-t 12h` sets a 12-hour run and `-o /userdata/new_test_logs` sets the log directory.

3. **Launch and verify.** Run `startup.sh` again and confirm the new item is loaded. Check that log files are generated as expected, that the configured parameters take effect, and that the results meet expectations.

## Expected Results

- Command: `./startup.sh -t <test name>`, or `./startup.sh` to run all enabled items.
- Success indicators: the console prints `Executing <test name>...` for each item; the corresponding log files appear under `log/`; each script prints its own success message at the end of its log, such as `UART test completed successfully!` for UART, `SPI test completed successfully!` for SPI, and `Test loop <N> succeeded!` for eMMC; after everything finishes, `log/status` contains `All tests completed successfully.`
- Result preview: the contents of `log/status` look like:

  ```text
  Running CpuAndBpu...finish
  Running EmmcStablity...finish
  All tests completed successfully.
  ```

- Troubleshooting: keywords such as `failed` or `error` in a log, or a missing `All tests completed successfully.` line in `log/status`, indicate that a test item did not finish normally. Locate the cause in the log file for that item under `log/`, or run that test script alone to reproduce the issue.

:::note
The success criteria above come from the log messages built into each script. A stress run takes a long time and its actual output varies with hardware state and test parameters, so always rely on the results from the board.
:::

## FAQ

### Test 'xxx' not found or not enabled in config.ini

**Cause**: The test name passed to `-t` is misspelled, or that item's `Status` is not `enabled`.

**Solution**: Run `./startup.sh -h` first to list the available test names, then pass one to `-t`. If the item needs to run, set its `Status` to `enabled` in `config.ini`.

### No test logs are generated after startup

**Cause**: The log directory does not exist or is not writable, or the path given to `-o` is wrong.

**Solution**: Confirm that the directory containing `startup.sh` is writable; the `log/` directory is created automatically by the script. If you used `-o` in `ExecStart`, confirm that the directory exists and is writable.

## Related Documentation

- [Driver Functional Unit Test](./01_overview.md)
- [Set Up the Development Environment](../../06_environment_build/01_environment_build.md)
- [CPU-BPU-DDR Stress Test](./03_bpu_cpu_ddr_stress.md)
- [eMMC Stress Test](./04_emmc_stress.md)
- [UART Stress Test](./05_uart_stress.md)
- [SPI Stress Test](./06_spi_stress.md)
- [CPU Performance Testing](./09_cpu_performance.md)
- [DDR Bandwidth Testing](./10_ddr_bandwidth.md)
- [3D GPU Performance Testing](./12_3d_gpu.md)
