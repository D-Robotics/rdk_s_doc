---
sidebar_position: 6
title: "SPI 压力测试"
description: "SPI 压力测试"
---

# SPI 压力测试

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 功能概述

SPI 压力测试通过回环（loopback）方式在长时间高负载下收发大量数据，验证 SPI 通信的稳定性与吞吐量。测试由板端预置脚本 `spistress.sh` 驱动，底层调用 `spidev_tc` 可执行程序，代码位于 `/app/chip_base_test/04_spi_test/`。

运行压测脚本后，终端输出与日志示例如下：

```shell
sunrise@ubuntu:/app/chip_base_test/04_spi_test# ./spistress.sh
SPI test starting...
Test configuration:
  Device: /dev/spidev0.0
  Stress Count: 100
  SPI Speed: 12000000 Hz
  Output Directory: /app/chip_base_test/log
  Log file: /app/chip_base_test/log/spi_test_log3.txt
SPI test completed successfully! Log saved to: /app/chip_base_test/log/spi_test_log1.txt
```

**适用读者**：进行硬件单元测试与整机稳定性验证的测试及开发人员。

<DocScope products="RDK S100">

S100 Acore 集成 2 路 SPI 控制器（SPI0、SPI1），均仅支持 SPI Master。SPI 压测默认使用 **SPI0**（40-pin 扩展口，3.3 V），设备节点 `/dev/spidev0.0`。

</DocScope>

<DocScope products="RDK S600">

S600 Acore 集成 4 路 SPI 控制器（SPI0~SPI3）。其中 SPI0 引脚接 CAN 收发器，**不可外接**；SPI2/SPI3 板级 disabled，未引出。SPI 压测默认使用 **SPI1**（14-pin 自锁接口，1.8 V），设备节点 `/dev/spidev1.0`，须先加载 overlay 并重启。

</DocScope>

## 环境准备

- 开发板已烧录官方发布的 RDK OS 镜像，且已正常启动。
- 板端 `/app/chip_base_test/04_spi_test/` 下存在测试源码与脚本（`spistress.sh`、`spidev_tc.c`、`Makefile`、`Readme.md`）；`spidev_tc` 可执行文件需按[编译执行文件](#编译执行文件)步骤生成。
- 回环测试需先用杜邦线短接所测 SPI 的 **MISO 与 MOSI**。

<DocScope products="RDK S100">

### S100 硬件连接

S100 在 **40-pin 扩展口** 上引出了 SPI0（Pin 19 MOSI、Pin 21 MISO、Pin 23 SCLK、Pin 24 CS0），IO 电平 3.3 V。

**1.** 查看 RDK S100 原理图并找到 SPI0_MOSI 和 SPI0_MISO 对应的引脚与连接器位置，如图：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/Spi_Schematic_diagram.png" alt="引脚与连接器位置" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

**2.** 用双母头杜邦线将 SPI0_MOSI 与 SPI0_MISO 相连，位置如图：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/Spi_Connection_diagram.png" alt="连接示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::caution 注意
RDK S100 Acore 支持 2 路 SPI，且 SPI0、SPI1 只能做 SPI Master。SPI 内部回环测试仅 SPI Master 支持，其原理是 SPI 硬件 IP 的 TX FIFO 将数据发给 RX FIFO 从而形成回环。
:::

</DocScope>

<DocScope products="RDK S600">

### S600 硬件连接

S600 在 **14-pin 自锁接口** 上引出了 SPI1（仅 CS0），IO 电平 **1.8 V**，外接器件须注意电平匹配。

**1.** 确认板端 overlay 已安装：

```shell
root@ubuntu:~# ls /boot/overlays/s600_v0p2_enable_spi1.dtbo
/boot/overlays/s600_v0p2_enable_spi1.dtbo
```

**2.** 编辑 `/boot/config.txt`（不存在则创建），写入 overlay 加载路径：

```text
dtbo_file_path=/overlays/s600_v0p2_enable_spi1.dtbo
```

`config.txt` 中为启动加载路径（相对 `/boot`）；实际文件位于 `/boot/overlays/`。

**3.** 重启开发板：

```shell
root@ubuntu:~# sudo reboot
```

**4.** 重启后确认 `/dev/spidev1.0` 已出现：

```shell
root@ubuntu:~# ls /dev/spidev*
/dev/spidev0.0  /dev/spidev1.0
```

:::caution 注意
列表中 `/dev/spidev0.0` 对应 SPI0，其引脚接 CAN 收发器，**不可用于外接 SPI 设备**。压测请使用 `/dev/spidev1.0`（SPI1，14-pin）。
:::

**5.** 在 14-pin 接口上短接 SPI1 的 MISO 与 MOSI：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/03_40pin_user_guide/image/40pin_user_guide/image-rdk_s600_spi.png" alt="RDK S600 SPI 回环测试硬件连接示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

完整接线步骤见 [SPI 应用（RDK S600）](../../../03_Demos/01_peripheral/01_40pin/02_s600/04_spi.md)。

</DocScope>

## 代码位置

本测试代码位于板端 `/app/chip_base_test/04_spi_test/` 目录：

```text
/app/chip_base_test/04_spi_test/
├── Makefile
├── Readme.md
├── spidev_tc.c        # SPI 压测源码
└── spistress.sh       # 压测脚本
```

## 使用方法

### 测试原理

SPI 压力测试（SPI stress test）通过回环测试进行数据的传输和接收，验证 SPI 总线的稳定性、吞吐量、延迟、错误率等关键性能指标。底层工具 `spidev_tc` 通过配置不同的参数来模拟高负载环境。

**1. 测试过程**：

- **数据传输测试**：使用 `transfer_buf` 和 `transfer_read_write` 函数分别进行纯数据发送、读取和验证。数据包长度由 `transfer_size` 参数控制，测试会多次循环进行（由 `iterations` 控制）。
- **吞吐量和速率计算**：通过全局变量 `_read_count` 和 `_write_count` 记录读取和写入的字节数，并周期性计算和输出传输速率。`show_transfer_rate` 函数用于计算并输出吞吐量（单位：kbps）。
- **传输模式切换**：通过 SPI 模式、位数和速度等参数的不同组合，测试 SPI 设备在不同条件下的性能表现。例如，可以设置数据 buffer 的大小或 SPI 总线速度（`speed`），测试设备在不同条件下的稳定性和性能。

**2. 命令解析**：

- 测试命令：`"${script_dir}/spidev_tc" -D "$Device" -s "$spi_speed" -I "$StressCount" -e 3 -S 32 > "$spi_test_log_file" 2>&1`
- 参数解析：
  - `-D "$Device"`：指定要操作的 SPI 设备文件（如 `/dev/spidev0.0`）。
  - `-s "$spi_speed"`：指定 SPI 总线的通信速度（单位：Hz）。
  - `-I "$StressCount"`：指定测试的次数。
  - `-e 3`：该选项指定了测试模式或类型，`-e` 后面的数字通常表示不同的测试类型，例如脚本中 `3` 代表读写回环测试。
  - `-S 32`：指定每次测试的传输数据大小，单位是字节。
  - `> "$spi_test_log_file" 2>&1`：这是命令行的输出重定向部分。
    - `> "$spi_test_log_file"`：将标准输出（stdout）重定向到指定的日志文件（`$spi_test_log_file`）。
    - `2>&1`：将标准错误输出也会重定向到同一个日志文件，这样所有输出（包括错误信息）都会被记录到日志文件中。

### 压测脚本使用说明

SPI 压测支持输入后缀 `-h` 查看命令参数的说明，例如：

```shell
sunrise@ubuntu:/app/chip_base_test/04_spi_test# ./spistress.sh -h
Usage: ./spistress.sh [options]

Options:
  -d <device>      Set the SPI device to test (default: /dev/spidev0.0).
  -c <count>       Set the stress test count (default: 100).
  -s <speed>       Set the SPI speed in Hz (default: 12000000).
  -o <directory>   Set the output directory for logs (default: '../log').
  -h               Show this help message and exit.
```

各参数解析如下：

- `-d <device>`：指定要测试的 SPI 设备，默认设备路径为 `/dev/spidev0.0`。
- `-c <count>`：设置压力测试的次数。
- `-s <speed>`：设置 SPI 的速度，单位是 Hz，默认值为 12000000（即 12 MHz）。
- `-o <directory>`：设置日志输出目录，默认值为 `../log`。

<DocScope products="RDK S100">

S100 默认设备为 `/dev/spidev0.0`，可直接运行 `./spistress.sh` 或通过 `-d` 指定其他 SPI 设备。

**示例**：

```shell
./spistress.sh -d /dev/spidev0.0 -c 500 -s 24000000 -o /userdata/spi_test_logs
```

上述命令测试 SPI 设备 `/dev/spidev0.0`，设置传输速度为 24 MHz，进行 500 次测试，输出目录为 `/userdata/spi_test_logs`。

</DocScope>

<DocScope products="RDK S600">

S600 须通过 `-d` 指定 `/dev/spidev1.0`（SPI1，14-pin）。**勿使用默认的 `/dev/spidev0.0`**，该节点对应 SPI0/CAN 引脚，不可外接。

**示例**：

```shell
./spistress.sh -d /dev/spidev1.0 -c 500 -s 12000000 -o /userdata/spi_test_logs
```

上述命令测试 SPI 设备 `/dev/spidev1.0`，设置传输速度为 12 MHz，进行 500 次测试，输出目录为 `/userdata/spi_test_logs`。

</DocScope>

### 执行程序使用说明

`spidev_tc` 源码中的详细参数与设置命令解析如下：

```shell
-D --device: 指定使用的 SPI 设备。
-s, --speed: 设置最大速度（Hz）。
-d, --delay: 设置延迟（微秒）。
-b, --bpw: 设置每字的位数。
-i, --input: 从文件中输入数据（例如："test.bin"）。
-o, --output: 将数据输出到文件（例如："results.bin"）。
-l, --loop: 启用回环测试。
-H, --cpha: 时钟相位。
-O, --cpol: 时钟极性。
-L, --lsb: 低位优先。
-C, --cs-high: 片选信号为高电平有效。
-3, --3wire: SI/SO 信号共享。
-v, --verbose: 详细模式（显示发送缓冲区）。
-p : 发送数据（例如："1234\xde\xad"）。
-N, --no-cs: 禁用片选信号。
-R, --ready: 从机拉低以暂停。
-2, --dual: 双线传输。
-4, --quad: 四线传输。
-S, --size: 指定测试的数据大小（字节）。
-I, --iter: 迭代次数，当设置 `-e` 扩展测试模式时，默认是无限循环。
-e, --mode: 指定测试模式，1: 读取，2: 写入，3: 读和写。
-h, --help: 显示帮助信息。
```

### 编译执行文件

**1.** 确认在 `/app/chip_base_test/04_spi_test` 路径下存在 `spistress.sh`、`spidev_tc.c`、`Makefile`、`Readme.md` 四个文件；`spidev_tc` 可执行文件默认不在板端，需按下一步编译生成。

```shell
root@drobot:/app/chip_base_test/04_spi_test# tree
.
├── Makefile
├── Readme.md
├── spidev_tc.c
└── spistress.sh
```

**2.** 如果用户需要自定义测试模式和功能，建议在 SDK 编译环境中，使用编译命令重新生成执行文件，命令如下：

```shell
gcc -o spidev_tc spidev_tc.c
```

## 运行效果

确保完成环境准备与编译后，运行测试命令：

<DocScope products="RDK S100">

```shell
./spistress.sh
```

</DocScope>

<DocScope products="RDK S600">

```shell
./spistress.sh -d /dev/spidev1.0
```

</DocScope>

运行一段时间后，日志打印结果如下：

```shell
sunrise@ubuntu:/app/chip_base_test/04_spi_test# ./spistress.sh
SPI test starting...
Test configuration:
  Device: /dev/spidev0.0
  Stress Count: 100
  SPI Speed: 12000000 Hz
  Output Directory: /app/chip_base_test/log
  Log file: /app/chip_base_test/log/spi_test_log3.txt
SPI test completed successfully! Log saved to: /app/chip_base_test/log/spi_test_log1.txt
```

此时日志中没有打印其他信息，可直接在 `/app/chip_base_test/log/` 路径下查看 `spi_test_log1` 日志：

```shell
sunrise@ubuntu:/app/chip_base_test# cat log/spi_test_log1.txt
spi mode: 0x0
bits per word: 8
max speed: 12000000 Hz (12000 kHz)
Userspace spi read and write test, test_len=32 iterations=100
Test times: 0 Data verification Successful
Test times: 1 Data verification Successful
Test times: 2 Data verification Successful
Test times: 3 Data verification Successful
.....
Test times: 98 Data verification Successful
Test times: 99 Data verification Successful
```

- **成功标志**：每轮均打印 `Data verification Successful`，无 `fail`、`error`、`timeout` 等异常信息。
- **失败排查**：若日志中出现 `Data verification Failed` 或 `FIFO overrun/underrun`，检查 MISO/MOSI 是否短接、通信速率是否过高。

### 压测结果与判定

测试程序启动后会在 `/app/chip_base_test/log/` 目录下生成文件如下：

- `spi_test_log*.txt`：记录压测时的打印信息与当前状态。

测试目标是确保系统能够在 48 小时内稳定运行，不发生重启或挂死的情况。为确保测试过程中的稳定性，可通过以下命令检查日志文件中是否存在 `fail`、`error`、`timeout` 等异常信息：

```shell
cd "/app/chip_base_test/log/" && grep -iE 'error|fail|timeout' spi_test_log*.txt
```

运行测试脚本结束后检测 log 日志，并未出现异常状态信息，说明压测合格：

```shell
Test times: 97 Data verification Successful
Test times: 98 Data verification Successful
Test times: 99 Data verification Successful
```

### 其他测试模式

#### 内部回环测试

SPI 内部回环测试只需将脚本 `./spistress.sh` 中 `-e` 改成其他测试模式的参数即可，例如（SPI 读写模式测试）：

```shell
./spidev_tc -D /dev/spidev0.0 -s 12000000 -I 1 -e 3 -S 32 -v
spi mode: 0x0
bits per word: 8
max speed: 12000000 Hz (12000 kHz)
Userspace spi read and write test, test_len=32 iterations=1
TX | 67 C6 69 73 51 FF 4A EC 29 CD BA AB F2 FB E3 46 7C C2 54 F8 1B E8 E7 8D 76 5A 2E 63 33 9F C9 9A  |g.isQ.J.)......F|.T.....vZ.c3...|
RX | 67 C6 69 73 51 FF 4A EC 29 CD BA AB F2 FB E3 46 7C C2 54 F8 1B E8 E7 8D 76 5A 2E 63 33 9F C9 9A  |g.isQ.J.)......F|.T.....vZ.c3...|
Test times: 0 Data verification Successful
```

#### 外部回环测试

外部回环测试需要一块 RDK 开发板作为 SPI Master，另接一个 SPI Slave 设备（如 MCU 或支持 SPI Slave 的外部板卡），将 SPI 的 4 根线（MOSI、MISO、SCLK、CS）飞线连接。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/SPI_wiring_diagram.png" alt="SPI 外部回环测试示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::caution 注意
RDK S100 出厂内核 **未启用** `CONFIG_SPI_SLAVE`，只能作为 SPI Master，不能作为 SPI Slave。RDK S600 出厂内核已启用 `CONFIG_SPI_SLAVE=y`，但出厂 DTS 仍为 Master 配置，RDK 未提供 Slave 侧 DTS 与 Demo。因此：

- **S100 / S600 出厂状态只能做 Master 侧**，Slave 侧须由外部设备承担。
- 若需将 S600 配置为 SPI Slave，须自行修改 DTS 添加 `slave` 属性与 `slave@0x00` 子节点，具体配置方式参考 RDK X5 SPI 调试指南。
:::

Master 侧（RDK 开发板）发送数据，使用写模式（`-e 2`）：

```shell
./spidev_tc -D /dev/spidev0.0 -s 12000000 -I 1 -e 2 -S 32 -v
bits per word: 8
max speed: 1000000 Hz (1000 KHz)
userspace spi write test, len=10 times=1
test, times=0
TX | 67 C6 69 73 51 FF 4A EC 29 CD __ __ __ __ __ __ __ __ __ __ __ __ __ __ __
```

Slave 侧（外部设备）接收数据，须由外部设备的 SPI Slave 程序完成。若外部设备也运行 Linux + spidev，可用读模式（`-e 1`）：

```shell
./spidev_tc -D /dev/spidev0.0 -s 12000000 -I 10 -e 1 -S 32 -v
spi mode: 0x0
bits per word: 8
max speed: 1000000 Hz (1000 KHz)
userspace spi read test, len=10 times=1
test, times=0
RX | 67 C6 69 73 51 FF 4A EC 29 CD __ __ __ __ __ __ __ __ __ __ __ __ __ __ __
```

:::caution 注意
性能说明：SPI 最大通信速率参考值是 30Mbps，实际可能受到系统压力等综合因素影响而上下浮动，因此建议以实测为准。如果测试出现 FIFO overrun/underrun 提示，建议尝试降低通信速率。

注：在进行外部回环测试时，需要先启动 SPI Slave 侧程序，再启动 SPI Master 侧程序。假如先执行 Master 程序，后执行 Slave 程序，可能会由于 Master 与 Slave 不同步导致 SPI 接收数据出现丢失。
:::

<DocScope products="RDK S600">

S600 SPI0 引脚接 CAN 收发器，无法外接 SPI 线；外部回环须在 **14-pin SPI1**（overlay 后）上接线，使用 `/dev/spidev1.0`，见 [SPI 应用（RDK S600）](../../../03_Demos/01_peripheral/01_40pin/02_s600/04_spi.md)。

</DocScope>

## 常见问题

### SPI 外部回环测试接收数据丢失

**原因**：先执行了 SPI Master 程序、后执行 Slave 程序，导致 Master 与 Slave 不同步。

**解决**：先执行 SPI Slave 程序，再执行 SPI Master 程序。

### 测试出现 FIFO overrun/underrun 提示

**原因**：通信速率设置过高，超出系统实际处理能力。

**解决**：降低通信速率重试；最大通信速率参考值约 30Mbps，建议以实测为准。

<DocScope products="RDK S600">

### S600 压测报 `no such device` 或找不到 `/dev/spidev1.0`

**原因**：SPI1 overlay 未加载或未重启。

**解决**：确认 `/boot/overlays/s600_v0p2_enable_spi1.dtbo` 已安装，在 `/boot/config.txt` 写入 `dtbo_file_path=/overlays/s600_v0p2_enable_spi1.dtbo` 后重启；详见 [SPI 应用（RDK S600）](../../../03_Demos/01_peripheral/01_40pin/02_s600/04_spi.md)。

### S600 误用 `/dev/spidev0.0` 压测失败

**原因**：`/dev/spidev0.0` 对应 SPI0，其引脚接 CAN 收发器，未引到 14-pin 扩展口，无法外接回环。

**解决**：改用 `/dev/spidev1.0`（SPI1，14-pin），并按 [S600 硬件连接](#s600-硬件连接) 加载 overlay 并短接 MISO/MOSI。

</DocScope>

## 相关文档

- [概述](./01_overview.md)
- [SPI 调试指南](../07_driver_spi_dev.md)
- [AutoTest 使用方法](./02_auto_test.md)
- [搭建开发环境](../../06_environment_build/01_environment_build.md)

<DocScope products="RDK S100">

- [SPI 应用（40-pin）](../../../03_Demos/01_peripheral/01_40pin/01_s100/06_spi.md)

</DocScope>

<DocScope products="RDK S600">

- [SPI 应用（RDK S600）](../../../03_Demos/01_peripheral/01_40pin/02_s600/04_spi.md)

</DocScope>
