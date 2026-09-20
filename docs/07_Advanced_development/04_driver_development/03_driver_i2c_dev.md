---
sidebar_position: 3
title: "I2C 调试指南"
description: "I2C 调试指南"
---

# I2C 调试指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

I2C（Inter-Integrated Circuit）是 RDK 开发板上常用的两线制串行总线。I2C 总线控制器通过串行数据线（SDA）和串行时钟（SCL）线在连接到总线的器件间传递信息；每个器件都有一个唯一的地址，并可作为发送器或接收器（由器件功能决定）。Acore 侧基于 Synopsys DesignWare I2C 控制器与 Linux I2C 子系统实现：内核提供 `i2c_adapter`、总线驱动与外设 `i2c_driver`；用户态可通过 `/dev/i2c-*` 字符设备与 `i2c-tools` 直接访问总线。

**模块定位**：本文说明 RDK 平台 I2C 控制器的驱动代码路径、内核配置、设备树节点、Kernel 与用户态下的总线访问方法及 debugfs 抓包手段，用于排查总线扫描异常、速率配置与外设通信故障。具体外设（Codec、传感器等）的寄存器级驱动开发，请结合器件数据手册及对应专题文档。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要调试 I2C 外设驱动、设备树或板级 I2C 器件的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 Linux I2C 子系统与设备树（DTS）基础；如需验证 40-pin 扩展总线，请准备外接 I2C 设备或 Audio Driver HAT。

**与其他模块关系**：本驱动是用户态 I2C 应用（扩展引脚应用）与 `i2c-tools` 的底层实现；引脚复用见「[Pinctrl 调试指南](./05_driver_pinctrl_dev.md)」；GPIO 相关中断/扩展见「[GPIO 使用](./04_driver_gpio_dev.md)」；MCU 侧 I2C 见「[MCU I2C 使用指南](../11_mcu_development/10_mcu_i2c.md)」。

<DocScope products="RDK S100">

用户态 40-pin 示例见 [I2C 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/05_i2c.md)。

</DocScope>

### 硬件资源

DesignWare I2C 控制器支持以下能力：

- **四种速度模式**：
    - standard mode（0～100 kHz）
    - fast mode（100～400 kHz）
    - fast mode plus（400～1000 kHz）
    - high-speed mode（1000 kHz～3.4 MHz）
- **主从模式**配置（RDK 板端总线通常配置为主模式）
- **7 位和 10 位**寻址模式

板端实际速率由 DTS `clock-frequency` 指定，驱动仅接受 100 kHz / 400 kHz / 1 MHz / 3.4 MHz 四档，详见「功能使用 → I2C 速率配置」。

<DocScope products="RDK S100">

S100 Acore 集成 6 路 DesignWare I2C 控制器（`i2c0`～`i2c5`），板端对应 `/dev/i2c-0`～`/dev/i2c-5`。其中 **I2C4 / I2C5** 经 40-pin 引出，须注意与 UART2 的引脚复用及拨码配置。

| 用户态总线 | DTS 节点 | 基地址 | pinctrl | 典型用途 |
|---|---|---|---|---|
| `i2c-0` | `i2c@39420000` | `0x39420000` | `cam_i2c0` | 摄像头、HDMI Bridge 等板载器件 |
| `i2c-1` | `i2c@39430000` | `0x39430000` | `cam_i2c1` | 摄像头域外设 |
| `i2c-2` | `i2c@39440000` | `0x39440000` | `cam_i2c2` | 摄像头域外设 |
| `i2c-3` | `i2c@39450000` | `0x39450000` | `cam_i2c3` | 摄像头域外设 |
| `i2c-4` | `i2c@39460000` | `0x39460000` | `cam_i2c4` | 40-pin **I2C4**（Pin 27/28），RTC/风扇等，扫描常见 `UU` |
| `i2c-5` | `i2c@39470000` | `0x39470000` | `peri_i2c5` | 40-pin **I2C5**（Pin 3/5），扩展 HAT / 外设 |

**I2C5 与 UART2 复用拨码** — 使用 40-pin I2C5 时须拨至 **I2C** 侧（Pin 3、5 作为 I2C5_SCL / I2C5_SDA 输出）：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/Actual_device_diagram.png" alt="S100 40-pin I2C5 与 UART2 拨码开关实物图" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

扣合 Audio Driver HAT 等扩展子板时，叠接示意见 [I2C 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/05_i2c.md#外设连接) 或 [Audio 使用](../../03_Demos/01_peripheral/03_audio.md#外设连接与拨码)。

</DocScope>

<DocScope products="RDK S600">

S600 Acore 集成 6 路 DesignWare I2C 控制器（`i2c0`～`i2c5`），位于 HSI 域，板端对应 `/dev/i2c-0`～`/dev/i2c-5`（以 `ls /sys/class/i2c-dev/` 为准；部分板级配置可能额外出现 `i2c-7`～`i2c-9`）。

| 用户态总线 | DTS 节点 | 基地址 | pinctrl | 说明 |
|---|---|---|---|---|
| `i2c-0` | `i2c@34840000` | `0x34840000` | `hsi_i2c0` | HSI I2C0 |
| `i2c-1` | `i2c@34841000` | `0x34841000` | `hsi_i2c1` | HSI I2C1 |
| `i2c-2` | `i2c@34842000` | `0x34842000` | `hsi_i2c2` | HSI I2C2 |
| `i2c-3` | `i2c@34843000` | `0x34843000` | `hsi_i2c3` | HSI I2C3 |
| `i2c-4` | `i2c@34844000` | `0x34844000` | `hsi_i2c4` | HSI I2C4 |
| `i2c-5` | `i2c@34845000` | `0x34845000` | `hsi_i2c5` | HSI I2C5 |

</DocScope>

## 驱动代码

```bash
kernel/drivers/i2c/i2c-dev.c                          # I2C 字符设备接口
kernel/drivers/i2c/i2c-core-base.c                    # I2C 框架核心
kernel/drivers/i2c/busses/i2c-designware-platdrv.c    # DesignWare 平台驱动
kernel/drivers/i2c/busses/i2c-designware-common.c     # 速率与时序解析
kernel/Documentation/i2c/dev-interface.rst            # 用户态接口说明
```

### 内核配置

<DocScope products="RDK S100">
配置文件路径：`hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
配置文件路径：`hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>

```bash
CONFIG_I2C_CHARDEV=y                 # 使能 /dev/i2c-* 字符设备
CONFIG_I2C_DESIGNWARE_PLATFORM=y     # DesignWare I2C 平台驱动
```

## 设备树配置

I2C 控制器节点定义在 SoC DTS 中，板级 DTS 通过 `&i2cN { ... }` 挂载具体外设子节点。总线速率由 `clock-frequency` 指定，仅支持 100 kHz / 400 kHz / 1 MHz / 3.4 MHz 四档（详见下文「I2C 速率配置」）。

<DocScope products="RDK S100">

SoC 节点文件：`hobot-drivers/kernel-dts/drobot-s100-soc.dtsi`  
40-pin / 音频子板相关板级配置：`hobot-drivers/kernel-dts/rdk-v0p5.dtsi`（及其他 `rdk-s100-*.dts`）

**I2C0 控制器示例（板载域）：**

```dts
i2c0: i2c@39420000 {
    power-domains = <&scmi_smc_pd PD_IDX_LSPERI_TOP>;
    #address-cells = <1>;
    #size-cells = <0>;
    compatible = "snps,designware-i2c";
    reg = <0x0 0x39420000 0x0 0x10000>;
    clocks = <&scmi_smc_clk CLK_IDX_TOP_PERI_I2C0>;
    clock-names = "apb_pclk";
    interrupts = <GIC_SPI PERISYS_I2C0_INTR PERISYS_I2C0_INTR_TRIG_TYPE>;
    clock-frequency = <400000>;          /* 400 kHz */
    i2c-sda-hold-time-ns = <50>;
    pinctrl-names = "default", "gpio";
    pinctrl-0 = <&cam_i2c0>;
    pinctrl-1 = <&cam_i2c0_gpio>;
    scl-gpios = <&cam_port0 8 GPIO_ACTIVE_HIGH>;
    sda-gpios = <&cam_port0 9 GPIO_ACTIVE_HIGH>;
    status = "okay";
};
```

**I2C5 控制器示例（40-pin I2C5，扣合 Audio Driver HAT 时常见子节点）：**

```dts
i2c5: i2c@39470000 {
    compatible = "snps,designware-i2c";
    reg = <0x0 0x39470000 0x0 0x10000>;
    clock-frequency = <400000>;
    pinctrl-0 = <&peri_i2c5>;
    status = "okay";

    es8156: es8156@8 {
        compatible = "everest,es8156";
        reg = <0x08>;
        status = "okay";
    };

    es7210_0: es7210_0@40 {
        compatible = "MicArray_0";
        reg = <0x40>;
        status = "okay";
    };

    es7210_1@42 {
        compatible = "MicArray_2";
        reg = <0x42>;
        status = "okay";
    };
};
```

</DocScope>

<DocScope products="RDK S600">

SoC 节点文件：`hobot-drivers/kernel-dts/drobot-s600-soc.dtsi`

**I2C0 控制器示例：**

```dts
i2c0: i2c@34840000 {
    #address-cells = <1>;
    #size-cells = <0>;
    compatible = "snps,designware-i2c";
    reg = <0x0 0x34840000 0x0 0x1000>;
    clocks = <&clk_500m>;
    clock-names = "apb_pclk";
    interrupts = <GIC_SPI HSISYS_I2C0_INTR IRQ_TYPE_LEVEL_HIGH>;
    clock-frequency = <400000>;
    i2c-sda-hold-time-ns = <50>;
    pinctrl-names = "default", "gpio";
    pinctrl-0 = <&hsi_i2c0>;
    pinctrl-1 = <&hsi_i2c0_gpio>;
    scl-gpios = <&hsi_port0 16 GPIO_ACTIVE_HIGH>;
    sda-gpios = <&hsi_port0 17 GPIO_ACTIVE_HIGH>;
    resets = <&smc_reset RST_IDX_I2C0>;
    reset-names = "i2c_rst";
    status = "okay";
};
```

</DocScope>

关键属性说明：

| 属性 | 说明 |
|---|---|
| `clock-frequency` | 总线速率（Hz），仅支持 100k / 400k / 1M / 3.4M |
| `i2c-sda-hold-time-ns` | SDA 保持时间，影响高速模式稳定性 |
| `pinctrl-0` | 引脚复用为 I2C 功能 |
| `reg`（子节点） | 7 位 I2C 从地址 |

## 功能使用

对于 I2C 的通用使用说明，请参阅 `kernel/Documentation/i2c/` 目录；本文主要列出 RDK DesignWare I2C 驱动接口的特殊部分。

### Kernel 阶段

内核加载 DesignWare I2C 驱动后，在 `/sys/class/i2c-dev/` 下注册适配器，并对外设子节点加载对应 `i2c_driver`。

**检查适配器是否就绪：**

<DocScope products="RDK S100">

```bash
root@ubuntu:~# ls /sys/class/i2c-dev/
i2c-0  i2c-1  i2c-2  i2c-3  i2c-4  i2c-5

root@ubuntu:~# cat /sys/class/i2c-dev/i2c-0/name
Synopsys DesignWare I2C adapter
```

</DocScope>

<DocScope products="RDK S600">

```bash
root@drobot:~# ls /sys/class/i2c-dev/
i2c-0  i2c-1  i2c-2  i2c-3  i2c-4  i2c-5  i2c-7  i2c-8  i2c-9

root@drobot:~# cat /sys/class/i2c-dev/i2c-0/name
Synopsys DesignWare I2C adapter
```

</DocScope>

#### I2C 速率配置

默认 I2C 速率为 400 kHz，支持 100 kHz / 400 kHz / 1 MHz / 3.4 MHz 四种速率，可通过修改 DTS 中相应 `i2c` 节点的 `clock-frequency` 完成速率修改。对应到驱动代码中的速率选择与校验逻辑如下：

```text
kernel/drivers/i2c/busses/i2c-designware-common.c
I2C 支持的速率配置如下：
static const u32 supported_speeds[] = {
	I2C_MAX_HIGH_SPEED_MODE_FREQ,
	I2C_MAX_FAST_MODE_PLUS_FREQ,
	I2C_MAX_FAST_MODE_FREQ,
	I2C_MAX_STANDARD_MODE_FREQ,
};
```

```text
kernel/drivers/i2c/busses/i2c-designware-platdrv.c
获取设备树中 clock-frequency 的函数接口如下：
i2c_parse_fw_timings(&pdev->dev, t, false);
展开为：
void i2c_parse_fw_timings(struct device *dev, struct i2c_timings *t, bool use_defaults)
{
	bool u = use_defaults;
	u32 d;

	i2c_parse_timing(dev, "clock-frequency", &t->bus_freq_hz,
			 I2C_MAX_STANDARD_MODE_FREQ, u);

	d = t->bus_freq_hz <= I2C_MAX_STANDARD_MODE_FREQ ? 1000 :
	    t->bus_freq_hz <= I2C_MAX_FAST_MODE_FREQ ? 300 : 120;
	i2c_parse_timing(dev, "i2c-scl-rising-time-ns", &t->scl_rise_ns, d, u);

	d = t->bus_freq_hz <= I2C_MAX_FAST_MODE_FREQ ? 300 : 120;
	i2c_parse_timing(dev, "i2c-scl-falling-time-ns", &t->scl_fall_ns, d, u);

	i2c_parse_timing(dev, "i2c-scl-internal-delay-ns",
			 &t->scl_int_delay_ns, 0, u);
	i2c_parse_timing(dev, "i2c-sda-falling-time-ns", &t->sda_fall_ns,
			 t->scl_fall_ns, u);
	i2c_parse_timing(dev, "i2c-sda-hold-time-ns", &t->sda_hold_ns, 0, u);
	i2c_parse_timing(dev, "i2c-digital-filter-width-ns",
			 &t->digital_filter_width_ns, 0, u);
	i2c_parse_timing(dev, "i2c-analog-filter-cutoff-frequency",
			 &t->analog_filter_cutoff_freq_hz, 0, u);
}
```

```text
验证 I2C 速率是否有效的函数接口如下：
i2c_dw_validate_speed(dev);
展开为：
int i2c_dw_validate_speed(struct dw_i2c_dev *dev)
{
	struct i2c_timings *t = &dev->timings;
	unsigned int i;

	/*
	 * Only standard mode at 100kHz, fast mode at 400kHz,
	 * fast mode plus at 1MHz and high speed mode at 3.4MHz are supported.
	 */
	for (i = 0; i < ARRAY_SIZE(supported_speeds); i++) {
		if (t->bus_freq_hz == supported_speeds[i])
			return 0;
	}

	dev_err(dev->dev,
		"%d Hz is unsupported, only 100kHz, 400kHz, 1MHz and 3.4MHz are supported\n",
		t->bus_freq_hz);

	return -EINVAL;
}
```

修改速率示例：将对应 `i2cN` 节点的 `clock-frequency` 改为 `<100000>` 或 `<1000000>`，重新编译内核/设备树并烧录。若填入非四档之一的值，probe 阶段将打印上述 `unsupported` 错误。

### 用户态使用

通常 I2C 设备由内核驱动程序控制，但也可以从用户态访问总线上的设备，通过 `/dev/i2c-%d` 接口访问。Kernel 文档详见 `Documentation/i2c/dev-interface.rst`。

#### 检查字符设备节点

```bash
ls /dev/i2c-*
# /dev/i2c-0  /dev/i2c-1  /dev/i2c-2  /dev/i2c-3  /dev/i2c-4  /dev/i2c-5
```

若节点缺失，可执行 `modprobe i2c-dev`，并确认 DTS 中对应控制器 `status = "okay"`。

#### 使用 i2c-tools 扫描与读写

`i2c-tools` 已交叉编译并包含在 RDK OS rootfs 中，常用命令：

| 命令 | 作用 |
|---|---|
| `i2cdetect` | 列举总线及总线上的设备地址 |
| `i2cdump` | 显示从设备寄存器 |
| `i2cget` | 读取指定寄存器 |
| `i2cset` | 写入指定寄存器 |

<DocScope products="RDK S100">

板载 bus `0` 扫描（驱动已占用的地址显示为 `UU`）：

```bash
root@ubuntu:~# i2cdetect -y -r 0
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: UU -- -- -- UU -- -- UU -- -- -- UU -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- 44 -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```

40-pin **I2C5**（bus `5`）在扣合 Audio Driver HAT REV2 后，应看到 `08`、`40`、`42`：

```bash
root@ubuntu:~# i2cdetect -y -r 5
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         08 -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: 40 -- 42 -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```

读取示例（以扫描到的地址为准）：

```bash
i2cget -y 5 0x08 0x00    # 读 ES8156 寄存器 0x00
i2cget -y 5 0x42 0x00    # 读 ES7210 寄存器 0x00
```

#### 示例使用

板端示例脚本：`/app/40pin_samples/test_i2c.py`（SDK：`hobot-io-samples/debian/app/40pin_samples/test_i2c.py`）。

```bash
cd /app/40pin_samples
python3 test_i2c.py
```

交互流程：输入 bus 号（默认 `0`）→ `i2cdetect` 扫描 → 输入十六进制地址（支持 `08` 或 `0x08`）→ 读取 1 字节并打印 `read value=`。

扣合 Audio Driver HAT 后，bus `5` + 地址 `08` 的典型输出：

```text
Please input I2C BUS num (default 0):5
...
Please input I2C device num(Hex, e.g. 51):08
Read data from device 0x8 on I2C bus 5
read value= b'\x1c'
```

完整交互日志与接线说明见 [I2C 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/05_i2c.md)。

</DocScope>

## 调试

DesignWare I2C 驱动在 debugfs 下提供寄存器与 FIFO 抓包接口。板端可见 `dw_i2c0`～`dw_i2c5` 调试目录（以 S100 为例）：

```bash
ls /sys/kernel/debug/ | grep dw_i2c
# dw_i2c0  dw_i2c1  dw_i2c2  dw_i2c3  dw_i2c4  dw_i2c5
```

### 寄存器 dump

查看 I2C 寄存器信息，以 `i2c-0` 为例：

<DocScope products="RDK S100">

```text
root@ubuntu:/# cat /sys/kernel/debug/dw_i2c0/registers
39420000.i2c registers:
=================================
CON:            0x00000065
SAR:            0x00000055
DATA_CMD:       0x00000800
INTR_STAT:      0x00000000
INTR_MASK:      0x00000000
RX_TL:          0x00000000
TX_TL:          0x00000002
STATUS:         0x00000006
TXFLR:          0x00000000
RXFLR:          0x00000000
SDA_HOLD:       0x0001000c
TX_ABRT:        0x00000000
EN_STATUS:      0x00000000
CLR_RESTA:      0x00000000
PARAM:          0x000303ee
VERSION:        0x3230322a
TYPE:           0x44570140
=================================
```

</DocScope>

<DocScope products="RDK S600">

```text
root@ubuntu:/# cat /sys/kernel/debug/dw_i2c0/registers
34840000.i2c registers:
=================================
CON:            0x00000075
SAR:            0x00000055
DATA_CMD:       0x00000000
INTR_STAT:      0x00000000
INTR_MASK:      0x00000000
RX_TL:          0x00000000
TX_TL:          0x00000010
STATUS:         0x00000006
TXFLR:          0x00000000
RXFLR:          0x00000000
SDA_HOLD:       0x00010019
TX_ABRT:        0x00000000
EN_STATUS:      0x00000000
CLR_RESTA:      0x00000000
PARAM:          0x001f1fee
VERSION:        0x3230342a
TYPE:           0x44570140
=================================
```

</DocScope>

### 实时传输 dump（reldump_en）

实时 dump 使能接口，可通过 `dmesg` 查看 I2C 实时传输的数据。

```bash
# 使能
echo 1 > /sys/kernel/debug/dw_i2c0/reldump_en
# 关闭
echo 0 > /sys/kernel/debug/dw_i2c0/reldump_en
```

### FIFO 历史 dump（fifodump_en / fifodump）

`fifodump` 可 dump 最近多次 I2C 读写数据，每个通道单独配置，仅支持 master 7 位地址模式。

```bash
# 使能
echo 1 > /sys/kernel/debug/dw_i2c0/fifodump_en
# 关闭
echo 0 > /sys/kernel/debug/dw_i2c0/fifodump_en
```

`fifodump_en` 使能条件下，执行 I2C 访问后通过 `cat` 打印 FIFO 历史记录：

```bash
i2cdump -f -y 0 0x28          # 触发一次访问
cat /sys/kernel/debug/dw_i2c0/fifodump
```

传输正常示例：

```text
=b[0]-t[1229.799811]-n[2]-me[0]-ce[1]-ae[0x800008]=
m[0]-a[0x28]-f[0x0]:0x84
m[1]-a[0x28]-f[0x1]:0x00
=b[0]-t[1229.799881]-n[2]-me[0]-ce[1]-ae[0x800008]=
m[0]-a[0x28]-f[0x0]:0x85
m[1]-a[0x28]-f[0x1]:0x00
...
```

字段含义：

| 字段 | 说明 |
|---|---|
| `b` | bus number |
| `t` | timestamp |
| `n` | msg numbers |
| `m` | msg label |
| `a` | slave addr |
| `f` | flags，`0` 为写，`1` 为读 |
| `me` | msg_err；正常传输为 `0`，地址/长度不匹配为 `-EINVAL` |
| `ce` | cmd_err；正常传输为 `0`，发送终止错误为 `DW_IC_ERR_TX_ABRT (0x1)` |
| `ae` | abort_source |

传输异常示例：

```text
=b[1]-t[32991.050148]-n[2]-me[0]-ce[1]-ae[0x800001]=
m[0]-a[0x10]-f[0x0]:0xfa
m[1]-a[0x10]-f[0x1]:0x13
```

### 地址白名单（whitelist）

```bash
echo 08 40 42 > /sys/kernel/debug/dw_i2c5/whitelist
cat /sys/kernel/debug/dw_i2c5/whitelist
# whitelist: 08 40 42
```

1. 通过 `echo` 命令可设置白名单，`cat` 命令可打印白名单。
2. 白名单支持 `reldump` 以及 `fifodump` 的地址过滤。
3. 默认为 16 进制，输入异常数据或者超过 128 的地址会报错；写入 `0` 会关闭白名单。

## 常见问题

### i2cdetect 扫描结果全为 --

**原因**：外设未上电、SDA/SCL 无上拉、引脚复用未切到 I2C，或扫描了未接设备的总线。

**解决**：确认外设供电与 40-pin 拨码（I2C5 须切至 I2C 而非 UART2）；用示波器/万用表确认空闲时 SCL/SDA 为高；对扩展场景使用 `i2cdetect -y -r 5` 重新扫描。

### 扫描到 UU 或访问报 Remote I/O error

**原因**：`UU` 表示该地址已有内核驱动占用，用户态不可裸读；`Remote I/O error` 常见于地址错误、总线未就绪或器件无应答。

**解决**：`UU` 地址应通过对应内核驱动或 debug 接口调试，勿用 `i2cdev` 强读；用户态验证优先选择无驱动占用的外设总线（如 40-pin I2C5 + HAT）；确认输入地址与扫描矩阵一致。

### 找不到 /dev/i2c-N 设备节点

**原因**：`i2c-dev` 未加载，或 DTS 中控制器 `status` 非 `okay`。

**解决**：`ls /sys/class/i2c-dev/` 确认适配器；缺失时 `modprobe i2c-dev` 并检查设备树。

### 配置了不支持的 clock-frequency

**原因**：DTS 中 `clock-frequency` 不是 100k / 400k / 1M / 3.4M 四档之一。

**解决**：按「I2C 速率配置」节修改 `clock-frequency`；查看 `dmesg` 是否出现 `only 100kHz, 400kHz, 1MHz and 3.4MHz are supported` 报错。

<DocScope products="RDK S100">

### 误用 I2C4 与 I2C5

**原因**：S100 40-pin 上 I2C4（Pin 27/28）接板载 RTC/风扇等，I2C5（Pin 3/5）接扩展子板；二者 bus 号不同。

**解决**：扩展外设示例使用 bus `5`；板载器件使用 bus `4` 并由内核驱动管理。详见 [I2C 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/05_i2c.md)。

</DocScope>

## 相关文档

- [GPIO 使用](./04_driver_gpio_dev.md)
- [Pinctrl 调试指南](./05_driver_pinctrl_dev.md)
- [MCU I2C 使用指南](../11_mcu_development/10_mcu_i2c.md)

<DocScope products="RDK S100">

- [I2C 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/05_i2c.md)
- [音频调试指南](./09_driver_audio.md)

</DocScope>
