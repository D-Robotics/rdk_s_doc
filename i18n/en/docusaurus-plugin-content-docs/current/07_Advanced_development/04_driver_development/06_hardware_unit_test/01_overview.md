---
sidebar_position: 1
title: "Overview"
description: "Scope, code location, execution method, and objectives of the driver functional unit tests"
---
# Overview

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

Driver functional unit testing verifies the functionality, stability, and performance of the various hardware interfaces and system drivers. This chapter covers each test item in turn, giving its test code location, parameter usage, expected results, and pass/fail criteria.

The test code ships with the image and is pre-installed on the development board under `/app/chip_base_test/`; some test items need their executables compiled first, see the corresponding test pages.

## Test Code Storage Path{#Deploy_test_program}

The test code, scripts, and tools described in this chapter ship with the RDK OS image. After the board is flashed with an officially released RDK OS image, the test programs are located at the following path by default:

- **Development board path**: `/app/chip_base_test`

The corresponding source is located in the project directory: `{rdk_dir}/source/hobot-multimedia-samples/debian/app/chip_base_test`.

The on-board directory structure is as follows:

```text
/app/chip_base_test/
├── 01_cpu_bpu_ddr/          # CPU-BPU-DDR stress test
├── 02_emmc/                 # eMMC stability and performance test
├── 03_uart_test/            # UART stress test
├── 04_spi_test/             # SPI stress test
├── 07_cpu_performance/      # CoreMark source, must be compiled manually
├── 08_ddr_bandwidth/        # STREAM source, must be compiled manually
├── 10_gpu_3d_test/          # clpeak patch and build notes, must be compiled manually
├── config/
│   └── config.ini           # AutoTest configuration file
├── log/                     # Test log directory, created automatically by startup.sh
├── startup.sh               # AutoTest launch script
└── README.md
```

Of these, `07_cpu_performance`, `08_ddr_bandwidth`, and `10_gpu_3d_test` provide source code and build notes only. They are not directly runnable stress test scripts, so they are not configured in `config.ini`.

## Test Items at a Glance

<DocScope products="RDK S100">

| Test item | What it covers |
|---|---|
| [AutoTest Usage](./02_auto_test.md) | Orchestrate and run multiple test items automatically via `config.ini` |
| [CPU-BPU-DDR Stress Test](./03_bpu_cpu_ddr_stress.md) | Stability stress test loading the CPU, BPU, and DDR simultaneously |
| [eMMC Stress Test](./04_emmc_stress.md) | eMMC stability and performance |
| [UART Stress Test](./05_uart_stress.md) | Sustained UART transmit and receive |
| [SPI Stress Test](./06_spi_stress.md) | Sustained SPI transmit and receive |
| [Wi-Fi Performance Test](./07_wifi_performance.md) | Wi-Fi throughput |
| [Ethernet Performance Test](./08_ethernet_performance.md) | Ethernet throughput |
| [CPU Performance Test](./09_cpu_performance.md) | CoreMark single-core and multi-core scores |
| [DDR Bandwidth Test](./10_ddr_bandwidth.md) | STREAM and lmbench bandwidth, memory latency |
| [USB Bus Speed Test](./11_usb_performance.md) | USB bus speed |
| [3D GPU Performance Test](./12_3d_gpu.md) | GPU compute and bandwidth |

</DocScope>
<DocScope products="RDK S600">

| Test item | What it covers |
|---|---|
| [AutoTest Usage](./02_auto_test.md) | Orchestrate and run multiple test items automatically via `config.ini` |
| [CPU-BPU-DDR Stress Test](./03_bpu_cpu_ddr_stress.md) | Stability stress test loading the CPU, BPU, and DDR simultaneously |
| [UART Stress Test](./05_uart_stress.md) | Sustained UART transmit and receive |
| [SPI Stress Test](./06_spi_stress.md) | Sustained SPI transmit and receive |
| [Wi-Fi Performance Test](./07_wifi_performance.md) | Wi-Fi throughput |
| [Ethernet Performance Test](./08_ethernet_performance.md) | Ethernet throughput |
| [CPU Performance Test](./09_cpu_performance.md) | CoreMark single-core and multi-core scores |
| [DDR Bandwidth Test](./10_ddr_bandwidth.md) | STREAM and lmbench bandwidth, memory latency |
| [USB Bus Speed Test](./11_usb_performance.md) | USB bus speed |
| [3D GPU Performance Test](./12_3d_gpu.md) | GPU compute and bandwidth |

</DocScope>

## Test Environment Preparation

1. The board is flashed with an officially released RDK OS image, and the test code and tools are pre-installed with the image.

2. Confirm the storage path of the test tools and scripts on the development board:

   ```bash
   ls /app/chip_base_test
   ```

3. Follow the steps described for each test item in this chapter, and record and analyze the results.

## Test Execution Method

1. Log in to the development board via the debug serial port or SSH.

2. Navigate to the test program directory:

   ```bash
   cd /app/chip_base_test
   ```

3. Run the corresponding test script or program. For example, to run the CPU-BPU-DDR stress test:

   ```bash
   cd /app/chip_base_test/01_cpu_bpu_ddr/scripts
   ./stress_test.sh
   ```

Most test items can also be orchestrated through AutoTest; see [AutoTest Usage](./02_auto_test.md).

## Test Objectives and Criteria

Driver functional unit testing aims to cover the following core objectives:

- **Functional verification**: Ensure the driver correctly implements its designed functionality.
- **Stability testing**: Validate driver stability through extended runtime and boundary condition testing.
- **Performance testing**: Measure performance metrics of the driver and hardware to ensure they meet system requirements.
- **Compatibility testing**: Verify driver compatibility across different hardware configurations or software versions.

Detailed test methods, procedures, and pass/fail criteria for each test item are given in the corresponding section.

## Related Documentation

- [AutoTest Usage](./02_auto_test.md)
- [CPU-BPU-DDR Stress Test](./03_bpu_cpu_ddr_stress.md)
- [CPU Performance Test](./09_cpu_performance.md)
- [DDR Bandwidth Test](./10_ddr_bandwidth.md)
- [Set Up the Development Environment](../../06_environment_build/01_environment_build.md)
