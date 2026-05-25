---
sidebar_position: 3
---

# I2C 调试指南

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 前言

<DocScope products="RDK S100">
S100芯片提供了标准的 I2C 总线，I2C 总线控制器通过串行数据线（SDA）和串行时钟（SCL）线在连接到总线的器件间传递信息。每个器件都有一个唯一的地址（无论是微控制器——MCU、LCD 控制器、存储器或键盘接口），而且都可以作为一个发送器和一个接收器（由器件的功能决定）。
</DocScope>
<DocScope products="RDK S600">
S600芯片提供了标准的 I2C 总线，I2C 总线控制器通过串行数据线（SDA）和串行时钟（SCL）线在连接到总线的器件间传递信息。每个器件都有一个唯一的地址（无论是微控制器——MCU、LCD 控制器、存储器或键盘接口），而且都可以作为一个发送器和一个接收器（由器件的功能决定）。
</DocScope>

I2C 控制器支持以下功能：

- 支持四种速度模式：
    - standard mode(0~100Kb/s)
    - fast mode(100~400Kb/s)
    - fast mode plus(400~1000Kb/s)
    - high-speed mode(1000Kb/s-3.4Mb/s)
- 支持主从模式配置
- 支持7位和10位寻址模式

## 驱动代码

```bash
drivers/i2c/i2c-dev.c # I2C字符设备接口代码
drivers/i2c/i2c-core-base.c  # I2C框架代码
drivers/i2c/busses/i2c-designware-platdrv.c   # I2C驱动代码源文件
```

### 内核配置位置

<DocScope products="RDK S100">
配置文件路径: `hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
配置文件路径: `hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>
```bash
CONFIG_I2C_CHARDEV=y 			# I2C驱动应用层配置宏
CONFIG_I2C_DESIGNWARE_PLATFORM=y 	# DW I2C驱动配置宏
```

### 内核 DTS 节点配置

<DocScope products="RDK S100">

``` {.text}
/*kernel/arch/arm64/boot/dts/hobot/drobot-s100-soc.dtsi*/
i2c0: i2c@39420000 {
        power-domains = <&scmi_smc_pd PD_IDX_LSPERI_TOP>;
        #address-cells = <1>;
        #size-cells = <0>;
        compatible = "snps,designware-i2c";
        reg = <0x0 0x39420000 0x0 0x10000>;
        clocks = <&scmi_smc_clk CLK_IDX_TOP_PERI_I2C0>;
        clock-names = "apb_pclk";
        interrupts = <GIC_SPI PERISYS_I2C0_INTR PERISYS_I2C0_INTR_TRIG_TYPE>;
        clock-frequency = <400000>;
        i2c-sda-hold-time-ns = <50>;
        pinctrl-names = "default", "gpio";
        pinctrl-0 = <&cam_i2c0>;
        pinctrl-1 = <&cam_i2c0_gpio>;
        scl-gpios = <&cam_port0 8 GPIO_ACTIVE_HIGH>;
        sda-gpios = <&cam_port0 9 GPIO_ACTIVE_HIGH>;
        status = "okay";
};
```

</DocScope>
<DocScope products="RDK S600">

``` {.text}
/*kernel/arch/arm64/boot/dts/hobot/drobot-s600-soc.dtsi*/
i2c0: i2c@34840000 {
	power-domains = <&dummy_pd 0>;
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

## I2C 使用

对于 I2C 的使用说明在 kernel/Documentation/i2c 目录下有详细的说明，本文主要列出 S100 I2C 驱动接口特殊的部分。

### Kernel Space

<DocScope products="RDK S100">
S100 I2C 驱动在 Kernel Space 下提供了可以设置 I2C 传输频率的接口，使用方法如下：
</DocScope>
<DocScope products="RDK S600">
S600 I2C 驱动在 Kernel Space 下提供了可以设置 I2C 传输频率的接口，使用方法如下：
</DocScope>
#### I2C 速度配置

默认的 I2C 速率为400K，支持100k/400k/1M/3.4M 四种速率，可通过修改 dts 中相应 i2c 节点的 clock-frequency 完成速率修改。对应到代码中有关实际速率选择代码如下：

``` {.text}
kernel/drivers/i2c/busses/i2c-designware-common.c
I2C支持的速率配置如下：
static const u32 supported_speeds[] = {
	I2C_MAX_HIGH_SPEED_MODE_FREQ,
	I2C_MAX_FAST_MODE_PLUS_FREQ,
	I2C_MAX_FAST_MODE_FREQ,
	I2C_MAX_STANDARD_MODE_FREQ,
};
...
kernel/drivers/i2c/busses/i2c-designware-pcidrv.c
获取设备树中clock-frequency的函数接口如下：
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
验证I2C速率是否有效的函数接口如下：
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

### User Space

通常，I2C 设备由内核驱动程序控制，但也可以从用户态访问总线上的所有设备，通过/dev/i2c-%d 接口来访问，Kernel 下面的 Documentation/i2c/dev-interface.rst 文档里有详细的介绍。

#### Debug 接口

**寄存器信息获取**

查看 I2C 寄存器信息，以 i2c-0为例

<DocScope products="RDK S100">

``` {.text}
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

``` {.text}
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

**reldump_en 接口**

实时 dump 使能接口，可通过 dmesg 查看 I2C 实时传输的数据。

``` {.text}
# enable
echo 1 > /sys/kernel/debug/dw_i2c0/reldump_en

# disable
echo 0 > /sys/kernel/debug/dw_i2c0/reldump_en
```

**fifodump_en 接口**

fifodump 使能接口，可以 dump 最近多次 I2C 读写数据，每个通道单独配置，仅支持 master
7位地址模式。

``` {.text}
# enable
echo 1 > /sys/kernel/debug/dw_i2c0/fifodump_en

# disable
echo 0 > /sys/kernel/debug/dw_i2c0/fifodump_en
```

**fifodump 接口**

临时存储 I2C 数据，fifodump_en 使能条件下通过 cat 打印。

传输正常：

``` {.text}
root@ubuntu:~# i2cdump -f -y 0 0x28
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f    0123456789abcdef
00: 00 1f 21 00 00 00 00 00 00 00 XX XX XX XX XX XX    .?!.......XXXXXX
10: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
20: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
30: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
40: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
50: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
60: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
70: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
80: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
90: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
a0: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
b0: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
c0: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
d0: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
e0: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX
f0: XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX    XXXXXXXXXXXXXXXX

root@ubuntu:~# cat /sys/kernel/debug/dw_i2c0/fifodump
=b[0]-t[1229.799811]-n[2]-me[0]-ce[1]-ae[0x800008]=
m[0]-a[0x28]-f[0x0]:0x84
m[1]-a[0x28]-f[0x1]:0x00
=b[0]-t[1229.799881]-n[2]-me[0]-ce[1]-ae[0x800008]=
m[0]-a[0x28]-f[0x0]:0x85
m[1]-a[0x28]-f[0x1]:0x00
=b[0]-t[1229.799953]-n[2]-me[0]-ce[1]-ae[0x800008]=
m[0]-a[0x28]-f[0x0]:0x86
m[1]-a[0x28]-f[0x1]:0x00
=b[0]-t[1229.800046]-n[2]-me[0]-ce[1]-ae[0x800008]=
m[0]-a[0x28]-f[0x0]:0x87
m[1]-a[0x28]-f[0x1]:0x00
=b[0]-t[1229.800152]-n[2]-me[0]-ce[1]-ae[0x800008]=
m[0]-a[0x28]-f[0x0]:0x88
m[1]-a[0x28]-f[0x1]:0x00
=b[0]-t[1229.800233]-n[2]-me[0]-ce[1]-ae[0x800008]=
m[0]-a[0x28]-f[0x0]:0x89
m[1]-a[0x28]-f[0x1]:0x00
=b[0]-t[1229.800308]-n[2]-me[0]-ce[1]-ae[0x800008]=
m[0]-a[0x28]-f[0x0]:0x8a
m[1]-a[0x28]-f[0x1]:0x00
=b[0]-t[1229.800384]-n[2]-me[0]-ce[1]-ae[0x800008]=
m[0]-a[0x28]-f[0x0]:0x8b
m[1]-a[0x28]-f[0x1]:0x00

 b: bus number.
 t: timestamp.
 n: msg numbers.
 m: msg label.
 a: slave addr.
 f: flags, 0 is write, 1 is read.
```

传输异常：

``` {.text}
=b[1]-t[32991.050148]-n[2]-me[0]-ce[1]-ae[0x800001]=
m[0]-a[0x10]-f[0x0]:0xfa
m[1]-a[0x10]-f[0x1]:0x13
=b[1]-t[32991.050257]-n[2]-me[0]-ce[1]-ae[0x800001]=
m[0]-a[0x10]-f[0x0]:0xfb
m[1]-a[0x10]-f[0x1]:0x13

me: msg_err. Normal transmission is equal to "0", ddress/length mismatch will equal "-EINVAL".
ce: cmd_err. Normal transmission is equal to "0", the error was "DW_IC_ERR_TX_ABRT (0x1u)" transmit termination error.
ae: abort_source.
```

**whitelist 接口**

``` {.text}
root@ubuntu:~# echo 01 02 > /sys/kernel/debug/dw_i2c0/whitelist
root@ubuntu:~# cat /sys/kernel/debug/dw_i2c0/whitelist
whitelist: 01 02
```

1.  通过 echo 命令可设置白名单，cat 命令可打印白名单。
2.  白名单支持 reldump 以及 fifodump 的地址过滤。
3.  默认为16进制，输入异常数据或者超过128的地址会报错；写入0会关闭白名单。

### i2c-tools

<DocScope products="RDK S100">
i2c-tools 是一套开源工具，该工具已经被交叉编译并包含在 S100系统软件的 rootfs 中，客户可以直接使用：
</DocScope>
<DocScope products="RDK S600">
i2c-tools 是一套开源工具，该工具已经被交叉编译并包含在 S600系统软件的 rootfs 中，客户可以直接使用：
</DocScope>

-   i2cdetect --- 用来列举 I2C bus 及该 bus 上的所有设备
-   i2cdump --- 显示 i2c 设备的所有 register 值
-   i2cget --- 读取 i2c 设备某个 register 的值
-   i2cset --- 写入 i2c 设备某个 register 的值

## I2C 测试

### 检查 i2cdev 节点

查看是否产生 i2c-dev 节点，以下设备均配置为主设备

<DocScope products="RDK S100">

``` {.text}
root@ubuntu:~# ls /sys/class/i2c-dev/
i2c-0  i2c-1  i2c-2  i2c-3  i2c-4  i2c-5

root@ubuntu:~# cat /sys/class/i2c-dev/i2c-0/name
Synopsys DesignWare I2C adapter
```

</DocScope>
<DocScope products="RDK S600">

``` {.text}
root@ubuntu:~# ls /sys/class/i2c-dev/
i2c-0  i2c-2  i2c-3  i2c-4  i2c-5  i2c-7  i2c-9

root@ubuntu:~# cat /sys/class/i2c-dev/i2c-0/name
Synopsys DesignWare I2C adapter
```

</DocScope>

查看 i2c 设备节点是否产生

``` {.text}
root@ubuntu:~# ls /sys/class/i2c-dev/i2c-0/device/
delete_device  device  i2c-dev  name  new_device  of_node  power  subsystem  uevent
```

### 测试步骤

- 测试命令：i2cdetect -y -r 3
- 测试示例如下

``` {.text}
root@ubuntu:~# i2cdetect -r -y 3
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```
