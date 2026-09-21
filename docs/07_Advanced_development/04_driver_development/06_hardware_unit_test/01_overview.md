---
sidebar_position: 1
title: "概述"
description: "驱动功能单元测试的测试范围、代码位置、执行方式与判定目标"
---

# 概述

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

驱动功能单元测试用于验证各类硬件接口与系统驱动的功能、稳定性与性能。本章按测试项逐个给出测试代码位置、参数用法、运行效果与判定标准。

测试代码随镜像预置在开发板的 `/app/chip_base_test/` 目录，无需额外安装；部分测试项的可执行文件需先编译，见各测试项章节。

## 测试代码的存放路径{#Deploy_test_program}

本章所述测试代码、脚本与工具随 RDK OS 镜像预置。开发板烧录官方发布的 RDK OS 镜像后，测试程序默认位于以下路径：

- **开发板路径**：`/app/chip_base_test`

对应的源码位于工程目录：`{rdk_dir}/source/hobot-multimedia-samples/debian/app/chip_base_test`。

板端目录结构如下：

```text
/app/chip_base_test/
├── 01_cpu_bpu_ddr/          # CPU-BPU-DDR 压力测试
├── 02_emmc/                 # eMMC 稳定性与性能测试
├── 03_uart_test/            # 串口压力测试
├── 04_spi_test/             # SPI 压力测试
├── 07_cpu_performance/      # CoreMark 源码，需自行编译
├── 08_ddr_bandwidth/        # STREAM 源码，需自行编译
├── 10_gpu_3d_test/          # clpeak 补丁与编译说明，需自行编译
├── config/
│   └── config.ini           # AutoTest 配置文件
├── log/                     # 测试日志目录，运行 startup.sh 时自动创建
├── startup.sh               # AutoTest 启动脚本
└── README.md
```

其中 `07_cpu_performance`、`08_ddr_bandwidth`、`10_gpu_3d_test` 只提供源码与编译说明，不是可直接执行的压测脚本，因此没有配置在 `config.ini` 中。

## 测试项一览

<DocScope products="RDK S100">

| 测试项 | 测试内容 |
|---|---|
| [AutoTest 使用方法](./02_auto_test.md) | 通过 `config.ini` 编排并自动运行多个测试项 |
| [CPU-BPU-DDR 压力测试](./03_bpu_cpu_ddr_stress.md) | CPU、BPU 与 DDR 同时满载的稳定性压测 |
| [eMMC 压力测试](./04_emmc_stress.md) | eMMC 稳定性与性能 |
| [串口压力测试](./05_uart_stress.md) | UART 长时间收发 |
| [SPI 压力测试](./06_spi_stress.md) | SPI 长时间收发 |
| [Wi-Fi 性能测试](./07_wifi_performance.md) | Wi-Fi 吞吐性能 |
| [以太网性能测试](./08_ethernet_performance.md) | 以太网吞吐性能 |
| [CPU 性能测试](./09_cpu_performance.md) | CoreMark 单核与多核跑分 |
| [DDR 带宽测试](./10_ddr_bandwidth.md) | STREAM 与 lmbench 带宽、访存延迟 |
| [USB 总线速率测试](./11_usb_performance.md) | USB 总线速率 |
| [3D GPU 性能测试](./12_3d_gpu.md) | GPU 算力与带宽 |

</DocScope>
<DocScope products="RDK S600">

| 测试项 | 测试内容 |
|---|---|
| [AutoTest 使用方法](./02_auto_test.md) | 通过 `config.ini` 编排并自动运行多个测试项 |
| [CPU-BPU-DDR 压力测试](./03_bpu_cpu_ddr_stress.md) | CPU、BPU 与 DDR 同时满载的稳定性压测 |
| [串口压力测试](./05_uart_stress.md) | UART 长时间收发 |
| [SPI 压力测试](./06_spi_stress.md) | SPI 长时间收发 |
| [Wi-Fi 性能测试](./07_wifi_performance.md) | Wi-Fi 吞吐性能 |
| [以太网性能测试](./08_ethernet_performance.md) | 以太网吞吐性能 |
| [CPU 性能测试](./09_cpu_performance.md) | CoreMark 单核与多核跑分 |
| [DDR 带宽测试](./10_ddr_bandwidth.md) | STREAM 与 lmbench 带宽、访存延迟 |
| [USB 总线速率测试](./11_usb_performance.md) | USB 总线速率 |
| [3D GPU 性能测试](./12_3d_gpu.md) | GPU 算力与带宽 |

</DocScope>

## 测试环境准备

1. 开发板已烧录官方发布的 RDK OS 镜像，测试代码与工具已随镜像预置。

2. 在开发板上确认测试工具与脚本的存放路径：

   ```bash
   ls /app/chip_base_test
   ```

3. 按本章各测试项描述的步骤执行，并记录与分析结果。

## 测试执行方式

1. 通过调试串口或 SSH 登录开发板。

2. 进入测试程序目录：

   ```bash
   cd /app/chip_base_test
   ```

3. 执行对应的测试脚本或程序。例如运行 CPU-BPU-DDR 压力测试：

   ```bash
   cd /app/chip_base_test/01_cpu_bpu_ddr/scripts
   ./stress_test.sh
   ```

多数测试项也可以通过 AutoTest 统一编排运行，见 [AutoTest 使用方法](./02_auto_test.md)。

## 测试目标与标准

驱动功能单元测试旨在覆盖以下几个核心目标：

- **功能验证**：确保驱动程序正确实现设计功能。
- **稳定性测试**：通过长时间运行及边界条件测试，验证驱动的稳定性。
- **性能测试**：测量驱动与硬件的性能指标，确保满足系统需求。
- **兼容性测试**：验证驱动在不同硬件配置或软件版本下的兼容性。

各测试项的具体测试方法、步骤及判定标准见对应章节。

## 相关文档

- [AutoTest 使用方法](./02_auto_test.md)
- [CPU-BPU-DDR 压力测试](./03_bpu_cpu_ddr_stress.md)
- [CPU 性能测试](./09_cpu_performance.md)
- [DDR 带宽测试](./10_ddr_bandwidth.md)
- [搭建开发环境](../../06_environment_build/01_environment_build.md)
