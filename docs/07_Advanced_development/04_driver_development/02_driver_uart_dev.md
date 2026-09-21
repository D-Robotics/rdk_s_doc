---
sidebar_position: 2
title: "UART 驱动调试指南"
description: "UART 驱动调试指南"
---

# UART 驱动调试指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

UART（Universal Asynchronous Receiver/Transmitter，通用异步收发传输器）是 RDK 开发板的基础串行通信外设，本驱动基于 DesignWare 8250 框架实现，支持 DMA 收发与硬件流控。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要改动内核驱动、设备树，或调试板级串口的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 Linux 设备树（DTS）与 pinctrl 基础；如需做串口回环/收发自测，请准备杜邦线或 USB 转 TTL 模块。

**与其他模块关系**：本驱动是用户态串口读写应用 [3.1.1 扩展引脚应用](../../03_Demos/01_peripheral/01_40pin/01_s100/01_40pin_define.md) 的底层实现；调试控制台 uart0 的板级入口见 [2.16 调试串口](../../02_System_configuration/16_debug_serial.md)；内核与 U-Boot 选项配置见 [5.4.1 配置 U-Boot 和 Kernel 选项参数](./01_uboot_kernel_config.md)。

### 硬件资源

<DocScope products="RDK S100">

S100 开发板共有 4 路 UART（uart0~uart3）。uart0 作为调试控制台，不开启 DMA，波特率（115200/921600）由 Bootstrap pin 控制；其余 3 路用于数据传输，支持软件配置波特率（常用 921600）。

设备树默认只给 `uart1` 配置了 DMA 通道，其余通道走中断模式，需要时可在设备树中补充 `dmas` 属性启用。硬件流控方面，仅 `uart0` 定义了 RTS/CTS 引脚。

</DocScope>

<DocScope products="RDK S600">

S600 开发板共有 8 路 UART（uart0~uart7）。uart0 作为调试控制台，不开启 DMA；其余 7 路用于数据传输，支持软件配置波特率（常用 921600）。

设备树默认只给 `uart4` 配置了 DMA 通道，其余通道走中断模式，需要时可在设备树中补充 `dmas` 属性启用。硬件流控方面，`uart0`、`uart1` 定义了 RTS/CTS 引脚。

</DocScope>


## 驱动代码

```bash
source/kernel/drivers/tty/serial/8250/8250_dw.c     # Designware UART 驱动
source/kernel/drivers/tty/serial/8250/8250_port.c   # 8250 端口操作
source/kernel/drivers/tty/serial/8250/8250_core.c   # 8250 驱动核心
source/hobot-drivers/serial/8250_pdma.c             # PDMA 收发实现
```

### 内核配置

<DocScope products="RDK S100">
配置文件路径：`source/hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
配置文件路径：`source/hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>

```bash
CONFIG_SERIAL_8250=y            # 8250 驱动配置
CONFIG_SERIAL_8250_CONSOLE=y    # 8250 console 驱动配置
CONFIG_SERIAL_8250_DW=y         # 使能 Designware 独有的 feature
```

## 设备树配置

UART 控制器在 SoC 级设备树（`drobot-*-soc.dtsi`）中定义，描述寄存器的基地址、中断号、时钟等硬件资源，并绑定引脚复用与 DMA 通道。板级设备树通过覆盖 `status` 属性启用或禁用某个串口。

<DocScope products="RDK S100">

```dts
/* source/hobot-drivers/kernel-dts/drobot-s100-soc.dtsi */
uart1: uart@394A0000 {
    power-domains = <&scmi_smc_pd PD_IDX_LSPERI_TOP>;
    compatible = "snps,dw-apb-uart";
    reg = <0x0 0x394A0000 0x0 0x10000>;
    reg-shift = <2>;
    reg-io-width = <4>;
    interrupts = <GIC_SPI PERISYS_UART0_INTR PERISYS_UART0_INTR_TRIG_TYPE>;
    clock-frequency = <200000000>;
    pinctrl-names = "default";
    pinctrl-0 = <&peri_uart0>;
    dmas = <&pdma0 0>, <&pdma0 1>;
    dma-names = "rx", "tx";
    status = "okay";
    period_num = <64>;
    buf_len = <65536>;
    time_out = <4000>;
};
```

</DocScope>
<DocScope products="RDK S600">

```dts
/* source/hobot-drivers/kernel-dts/drobot-s600-soc.dtsi */
uart4: uart@3484E000 {
    // power-domains = <&scmi_smc_pd PD_IDX_LSPERI_TOP>;
    compatible = "snps,dw-apb-uart";
    reg-shift = <2>;
    reg-io-width = <4>;
    reg = <0x0 0x3484E000 0x0 0x1000>;
    interrupts = <GIC_SPI HSISYS_UART4_INTR IRQ_TYPE_LEVEL_HIGH>;
    clock-frequency = <500000000>;
    pinctrl-names = "default";
    pinctrl-0 = <&hsi_uart4_txd_pcm2_bclk &hsi_uart4_rxd_pcm2_fsync>;
    dmas = <&pdma0 8>, <&pdma0 9>;
    dma-names = "rx", "tx";
    status = "disabled";
};
```

</DocScope>

各属性含义如下：

| 属性                          | 说明                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| `compatible`                  | 驱动匹配标识，`snps,dw-apb-uart` 对应 DesignWare 8250 驱动   |
| `reg`                         | 寄存器基地址与长度                                           |
| `reg-shift` / `reg-io-width`  | 寄存器寻址方式：地址左移 2 位（4 字节对齐），访问宽度 4 字节 |
| `interrupts`                  | 中断号                                                       |
| `clock-frequency`             | 输入时钟频率                                                 |
| `power-domains`               | 所属电源域，系统休眠时随该域断电                             |
| `pinctrl-names` / `pinctrl-0` | 引脚复用配置，`pinctrl-0` 指定该串口占用的引脚               |
| `dmas` / `dma-names`          | DMA 收发通道绑定，不配置则回退为中断模式                     |
| `status`                      | `okay` 启用，`disabled` 禁用；板级设备树可覆盖               |

<DocScope products="RDK S100">

S100 的 `uart1` 节点还额外配置了以下 PDMA 收发参数：

| 属性 | 说明 |
|---|---|
| `period_num` | DMA 缓冲区分段数，决定中断频率 |
| `buf_len` | DMA 接收缓冲区大小（字节） |
| `time_out` | DMA FIFO 超时时间（微秒） |

:::note
这三个是 BSP 为 UART PDMA 收发自定义的属性，非 Linux 8250 标准属性（定义见 `source/hobot-drivers/serial/8250_pdma.c`）。
:::

</DocScope>

:::tip
一般只需在**板级设备树**中修改 `status` 来启用或禁用串口，并按需补充 `dmas` 启用 DMA。其余属性由 SoC 级设备树给出，通常无需改动。
:::

### 为串口启用 DMA

串口默认走中断模式收发，数据量大时可通过 DMA 降低 CPU 占用。设备树默认只为 `uart1`（S100）/ `uart4`（S600）配置了 DMA 通道，如需为其他串口启用，在对应节点中补充 `dmas` 与 `dma-names` 属性即可。

`&pdma0 N` 中的 `N` 为 PDMA 的**通道号**（handshake），不可随意指定。外设与通道号的绑定关系定义在 `drobot-*-pdma.dtsi` 的通道表中，每个通道通过 `dev_name` 声明归属的外设。

PDMA 按外设顺序成对分配通道（偶数为 rx、奇数为 tx），UART 占用的通道号为：

```text
rx 通道号 = 物理 UART 编号 × 2
tx 通道号 = 物理 UART 编号 × 2 + 1
```

<DocScope products="RDK S100">

S100 各串口节点对应的通道号如下：

| 设备树节点 | 物理 UART | rx 通道号 | tx 通道号 |
|---|---|---|---|
| `uart0` | UART1 | 2 | 3 |
| `uart1` | UART0 | 0 | 1 |
| `uart2` | UART2 | 4 | 5 |
| `uart3` | UART3 | 6 | 7 |

例如为 `uart2` 启用 DMA：

```dts
&uart2 {
    dmas = <&pdma0 4>, <&pdma0 5>;
    dma-names = "rx", "tx";
};
```

:::warning
`uart0` 与 `uart1` 节点的编号与物理 UART 编号是错位的（见「Kernel 阶段」的说明），通道号也相应互换。配置前请先对照上表确认。
:::

</DocScope>

<DocScope products="RDK S600">

S600 各串口节点对应的通道号如下：

| 设备树节点 | 物理 UART | rx 通道号 | tx 通道号 |
|---|---|---|---|
| `uart0` | UART2 | 4 | 5 |
| `uart1` | UART0 | 0 | 1 |
| `uart2` | UART1 | 2 | 3 |
| `uart3` | UART3 | 6 | 7 |
| `uart4` | UART4 | 8 | 9 |
| `uart5` | UART5 | 10 | 11 |
| `uart6` | UART6 | 12 | 13 |
| `uart7` | UART7 | 14 | 15 |

例如为 `uart6` 启用 DMA：

```dts
&uart6 {
    dmas = <&pdma0 12>, <&pdma0 13>;
    dma-names = "rx", "tx";
};
```

:::warning
`uart0`~`uart2` 三个节点的编号与物理 UART 编号是错位的（见「Kernel 阶段」的说明），通道号也相应互换。配置前请先对照上表确认。
:::

</DocScope>

## 功能使用

### U-Boot 阶段

串口在 U-Boot 阶段用于早期调试输出，可通过环境变量调整以下参数。

#### 波特率

**默认值**：`CONFIG_BAUDRATE = 921600`（S100/S600 相同），该值同时作为 `baudrate` 环境变量的默认值。

**运行时修改**（`setenv` 修改的是内存中的环境变量，重启后失效）：

```text
Hobot$ setenv baudrate 115200
## Switch baudrate to 115200 bps and press ENTER ...
```

:::warning
执行后硬件波特率立即切换。此时需将**终端也切到相同波特率并按回车**，否则后续输入会因波特率不匹配而变成乱码。
:::

**永久生效**：设置后执行 `saveenv` 将环境变量保存到存储介质：

```text
Hobot$ setenv baudrate 115200
Hobot$ saveenv
Saving Environment to SCSI... Writing to SCSI(0)...done
OK
```

不执行 `saveenv` 时，重启后恢复为 921600。

#### 内核日志级别

`loglevel` 是独立的 U-Boot 环境变量（默认 `1`），启动时由 `board_bootargs_setup()` 拼接进内核 `bootargs`。因此应设置该变量，而非直接改 `bootargs`（后者会被覆盖）：

```text
Hobot$ setenv loglevel 7
```

取值与内核 `console_loglevel` 一致：`0` 只输出紧急信息，数值越大输出越详细，`7` 输出全部调试信息。

#### earlycon

U-Boot 通过 `CONFIG_BOOTARGS` 传给内核，用于内核启动早期的串口日志输出。

<DocScope products="RDK S100">

```bash
CONFIG_BOOTARGS="earlycon=uart8250,mmio32,0x394B0000 no_console_suspend ..."
```

其中 `0x394B0000` 为 uart0 的寄存器基地址。

</DocScope>

<DocScope products="RDK S600">

```bash
CONFIG_BOOTARGS="earlycon=uart8250,mmio32,0x3484C000 no_console_suspend ..."
```

其中 `0x3484C000` 为 uart0 的寄存器基地址。

</DocScope>

### Kernel 阶段

内核启动时，U-Boot 通过 `console` 环境变量指定控制台串口，并拼接进内核命令行。未设置 `console` 时默认为 `ttyS0,<波特率>n8`。

内核按 `CONFIG_SERIAL_8250_NR_UARTS` 预创建 `/dev/ttySx` 设备节点（S100 为 4，S600 为 8），但只有 `status = "okay"` 的控制器才会真正注册并可用。因此设备节点数量不等于可用串口数量：

```bash
dmesg | grep tty
```

<DocScope products="RDK S600">

```text
[    0.357801] 3484c000.uart0: ttyS0 at MMIO 0x3484c000 (irq = 74, base_baud = 31250000) is a 16550A
[    0.358768] 34850000.uart:  ttyS6 at MMIO 0x34850000 (irq = 75, base_baud = 31250000) is a 16550A
[    0.359106] 34851000.uart:  ttyS7 at MMIO 0x34851000 (irq = 76, base_baud = 31250000) is a 16550A
```

S600 的 `/dev/` 下有 `ttyS0`~`ttyS7` 共 8 个节点，但上述日志显示只有 3 个控制器注册成功：

| 设备节点 | 设备树节点 | 物理 UART | 说明 |
|---|---|---|---|
| `/dev/ttyS0` | `uart0` | UART2 | 调试控制台 |
| `/dev/ttyS6` | `uart6` | UART6 | J18 引出的 MAIN 域串口 |
| `/dev/ttyS7` | `uart7` | UART7 | J18 引出的 MAIN 域串口 |

其余节点（`ttyS1`~`ttyS5`）对应的控制器在设备树中为 `disabled`，未注册。

:::note
S600 的 `uart0`~`uart2` 三个节点，其编号与物理 UART 编号是错位的：`uart0` 对应物理 UART2，`uart1` 对应物理 UART0，`uart2` 对应物理 UART1。`uart3` 及以上编号与物理 UART 一致。
:::

</DocScope>

<DocScope products="RDK S100">

```text
[    0.599162] 394b0000.uart0: ttyS0 at MMIO 0x394b0000 (irq = 71, base_baud = 12500000) is a 16550A
[    0.599684] 394a0000.uart:  ttyS1 at MMIO 0x394a0000 (irq = 72, base_baud = 12500000) is a 16550A
[    0.600105] 394c0000.uart:  ttyS2 at MMIO 0x394c0000 (irq = 73, base_baud = 12500000) is a 16550A
```

S100 的 `/dev/` 下有 `ttyS0`~`ttyS3` 共 4 个节点，但上述日志显示只有 3 个控制器注册成功：

| 设备节点 | 设备树节点 | 物理 UART | 说明 |
|---|---|---|---|
| `/dev/ttyS0` | `uart0` | UART1 | 调试控制台 |
| `/dev/ttyS1` | `uart1` | UART0 | 已启用，配置了 DMA |
| `/dev/ttyS2` | `uart2` | UART2 | 已启用，对应 40-pin 引出的 UART2 |

其余节点（`ttyS3`）对应的控制器在设备树中为 `disabled`，未注册。

:::note
S100 的 `uart0` 与 `uart1` 两个节点，其编号与物理 UART 编号是错位的：`uart0` 节点对应物理 UART1，`uart1` 节点对应物理 UART0。这两个节点的中断号与 pinctrl 引脚也相应互换。`uart2`、`uart3` 的编号与物理 UART 一致。

S600 通过设备树 `aliases`（`serial0`~`serial7`）固定各串口的编号；S100 仅定义了 `serial0`，其余编号按控制器探测顺序分配。
:::

</DocScope>

:::tip
日志中的 `MMIO` 为该串口的寄存器基地址，与设备树 `reg` 属性对应；`base_baud` 为基准波特率，等于 `clock-frequency / 16`。

判断某个 `/dev/ttySx` 是否真正可用，可查看 `/proc/tty/driver/serial`：`uart:16550A` 表示控制器已注册，`uart:unknown` 表示未启用。

如需查看内核命令行中的完整启动参数，可执行：

```bash
cat /proc/cmdline
```
:::

### 用户态使用

用户态通过 `/dev/ttySx` 设备节点操作串口，常用的收发手段有 `stty`（配置）、`echo`（发送）、`cat`（接收）。

<DocScope products="RDK S100">

40-pin 引出的是 `uart2`，对应 `/dev/ttyS2`。下文以该节点为例。

:::warning
`/dev/ttyS1` 已被蓝牙模块占用（Cypress CYW55560A1，固件下载工具 `mbt` 常驻），不可用于通用串口测试，测试请使用 `/dev/ttyS2`。
:::

#### 查看与配置串口

```bash
# 查看当前配置（波特率、数据位、校验位、流控等）
stty -F /dev/ttyS2 -a

# 配置为 921600 8N1（8 数据位、无校验、1 停止位）
stty -F /dev/ttyS2 speed 921600 cs8 -cstopb -parenb
```

#### 回环测试

将 40-pin 上 UART2 的 TXD 与 RXD 短接，写入的数据会经 TXD 发出、再从 RXD 收回，可用于验证串口收发是否正常。

:::warning
内核 TTY 层默认开启本地回显（termios 的 `ECHO`），写入同一串口后读取会读到回显副本，**不能据此判断串口收发正常**。做回环测试前应先关闭本地回显：
:::

```bash
# 关闭本地回显
stty -F /dev/ttyS2 -echo

# 发送数据
echo "test" > /dev/ttyS2

# 接收数据（按 Ctrl+C 退出）
cat /dev/ttyS2
```

若 TXD 与 RXD 已正确短接，`cat` 会输出 `test`；若无输出，说明短接未生效或串口配置有误。

</DocScope>

<DocScope products="RDK S600">

J18 引出的是 `uart6`/`uart7`，对应 `/dev/ttyS6`、`/dev/ttyS7`。下文以 `/dev/ttyS6` 为例。

#### 查看与配置串口

```bash
# 查看当前配置（波特率、数据位、校验位、流控等）
stty -F /dev/ttyS6 -a

# 配置为 921600 8N1（8 数据位、无校验、1 停止位）
stty -F /dev/ttyS6 speed 921600 cs8 -cstopb -parenb
```

#### 回环测试

将 J18 上对应串口的 TXD 与 RXD 短接，写入的数据会经 TXD 发出、再从 RXD 收回，可用于验证串口收发是否正常。

:::warning
内核 TTY 层默认开启本地回显（termios 的 `ECHO`），写入同一串口后读取会读到回显副本，**不能据此判断串口收发正常**。做回环测试前应先关闭本地回显：
:::

```bash
# 关闭本地回显
stty -F /dev/ttyS6 -echo

# 发送数据
echo "test" > /dev/ttyS6

# 接收数据（按 Ctrl+C 退出）
cat /dev/ttyS6
```

若 TXD 与 RXD 已正确短接，`cat` 会输出 `test`；若无输出，说明短接未生效或串口配置有误。

</DocScope>

## 调试

### 查看串口状态

```bash
cat /proc/tty/driver/serial
```

该文件由内核 `serial_core` 提供，用于查看各串口的寄存器基地址、中断号与收发统计。

<DocScope products="RDK S100">

```text
0: uart:16550A mmio:0x394B0000 irq:71 tx:841 rx:0 RTS|CTS|DTR|DSR|CD
1: uart:16550A mmio:0x394A0000 irq:72 tx:32 rx:0 RTS|DTR|DSR|CD
2: uart:16550A mmio:0x394C0000 irq:73 tx:0 rx:0 CTS|DSR|CD
3: uart:unknown port:00000000 irq:0
```

S100 的 `ttyS0`~`ttyS2` 已注册（`uart:16550A`），`ttyS3` 未启用（`uart:unknown`）。

</DocScope>

<DocScope products="RDK S600">

```text
0: uart:16550A mmio:0x3484C000 irq:74 tx:852 rx:63 RTS|CTS|DTR|DSR|CD
1: uart:unknown port:00000000 irq:0
2: uart:unknown port:00000000 irq:0
3: uart:unknown port:00000000 irq:0
4: uart:unknown port:00000000 irq:0
5: uart:unknown port:00000000 irq:0
6: uart:16550A mmio:0x34850000 irq:75 tx:0 rx:0 CTS|DSR|CD
7: uart:16550A mmio:0x34851000 irq:76 tx:0 rx:0 CTS|DSR|CD
```

S600 的 `ttyS0`、`ttyS6`、`ttyS7` 已注册（`uart:16550A`），其余为 `uart:unknown`。

</DocScope>

各字段含义：

| 字段 | 说明 |
|---|---|
| `mmio` | 寄存器基地址，与设备树 `reg` 对应 |
| `irq` | 中断号 |
| `tx` / `rx` | 累计发送/接收的字节数 |
| `fe` / `pe` / `oe` | 帧错误 / 校验错误 / 溢出错误计数（无错误时不显示）|
| `brk` | 收到的 break 信号计数 |
| `bo` | 接收缓冲区溢出计数，大于 0 说明应用读取不及时 |
| `RTS` / `DTR` | **输出**信号当前状态 |
| `CTS` / `DSR` / `CD` / `RI` | **输入**信号当前状态 |

:::note
`tx`/`rx` 等统计字段需要 root 权限才会显示；`uart:unknown` 表示该通道未注册控制器，`port:00000000` 是未初始化时的占位值。
:::

### 检查串口是否被占用

串口同一时刻只能被一个进程打开，读写前建议先确认是否已被占用。

<DocScope products="RDK S100">

```bash
lsof /dev/ttyS1
```

`lsof` 会先输出若干 `fuse.gvfsd-fuse`、`fuse.portal` 的 WARNING，这是桌面环境下挂载点权限导致的，不影响结果。输出示例如下：

```text
lsof: WARNING: can't stat() fuse.gvfsd-fuse file system /run/user/1000/gvfs
      Output information may be incomplete.
COMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
mbt     5868 root    3u   CHR   4,65      0t0  150 /dev/ttyS1
```

上例中 `mbt` 是蓝牙固件下载进程，常驻占用 `/dev/ttyS1`（见「用户态使用」节的说明）。

</DocScope>

<DocScope products="RDK S600">

```bash
lsof /dev/ttyS6
```

`lsof` 会先输出若干 `fuse.gvfsd-fuse`、`fuse.portal` 的 WARNING，这是桌面环境下挂载点权限导致的，不影响结果。输出示例如下：

```text
lsof: WARNING: can't stat() fuse.gvfsd-fuse file system /run/user/1000/gvfs
      Output information may be incomplete.
COMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
cat     6744 root    3r   CHR   4,70      0t0  111 /dev/ttyS6
```

</DocScope>

输出中 `COMMAND` 列即占用该串口的进程名，`PID` 为进程号。确认无用后可结束该进程再继续操作。

### 查看内核日志

驱动加载、波特率设置、DMA 通道申请结果都会输出到内核日志：

```bash
dmesg | grep -i tty
```

若 DMA 申请失败，会打印 `failed to request DMA`，此时该通道回退为中断模式。

### 打开驱动动态调试

内核已开启 `CONFIG_DYNAMIC_DEBUG` 与 `CONFIG_DEBUG_FS`，可通过 debugfs 按需打开 `8250_pdma.c` 内部的调试日志。

先查看该文件中已有的调试点及其当前状态：

```bash
grep 8250_pdma /sys/kernel/debug/dynamic_debug/control
```

```text
../hobot-drivers/serial/8250_pdma.c:470 [8250_pdma]serial8250_release_dma =_ "dma channels released\n"
../hobot-drivers/serial/8250_pdma.c:398 [8250_pdma]serial8250_request_dma =_ "got both dma channels\n"
../hobot-drivers/serial/8250_pdma.c:108 [8250_pdma]__dma_rx_complete =_ "index:%d byte:%d max:%d\n"
../hobot-drivers/serial/8250_pdma.c:98 [8250_pdma]__dma_rx_complete =_ "Get new lli index:%d!\n"
```

每行的 `=_` 表示该调试点当前为关闭状态；打开后变为 `=p`。

```bash
# 打开 8250_pdma.c 的全部调试日志
echo 'file 8250_pdma.c +p' > /sys/kernel/debug/dynamic_debug/control

# 关闭
echo 'file 8250_pdma.c -p' > /sys/kernel/debug/dynamic_debug/control
```

启用后进行串口收发（如对 `/dev/ttyS2` 执行 `echo`），内核日志会打印 DMA 通道申请与描述符使用情况。

## 注意事项

<DocScope products="RDK S100">

- RDK S100 硬件设计上，40PIN GPIO 使用了 TI TXS 系列电平转换芯片，将 1.8V IO 转成 3.3V IO。
- 为保证信号质量与可靠性，通信对端尽量不要再次使用电平转换芯片。若必须使用多级转换，请关注实际硬件信号质量。

</DocScope>
<DocScope products="RDK S600">

- RDK S600 硬件设计上，仅将 UART6 和 UART7 通过拓展引脚排引出，并使用了 TI TXB 系列电平转换芯片，将 1.8V IO 转成 3.3V IO。**RDK S600 V0P1 开发板由于硬件限制，UART6 和 UART7 无法使用**。

</DocScope>

## 常见问题

### 串口通信数据异常或信号质量差

**原因**：RDK S100/S600 的 40PIN GPIO 都经过 TI TXS/TXB 系列电平转换芯片，将 1.8V IO 转为 3.3V IO。通信对端若再做一级电平转换，会引入信号畸变，影响通信质量与可靠性。

**解决**：通信对端尽量不叠加电平转换芯片；若必须多级转换，实测关注线路信号质量（边沿、幅值）。

<DocScope products="RDK S600">

### 无法对 /dev/ttyS1 等节点做串口读写测试

**原因**：S600 的 `/dev/ttyS1`~`/dev/ttyS5` 对应的控制器在设备树中为 `disabled`，未注册，因此无法收发数据。

**解决**：先通过 `cat /proc/tty/driver/serial` 确认哪些通道已注册（`uart:16550A`），再用已注册的节点做测试（S600 可用 `ttyS0`、`ttyS6`、`ttyS7`）。

</DocScope>

## 相关文档

- [扩展引脚应用](/Demos/peripheral/40pin)
- [dpkg-deb 命令](/Appendix/linux-command-manual/dpkg-deb)
- [调试串口](/System_configuration/debug_serial)
