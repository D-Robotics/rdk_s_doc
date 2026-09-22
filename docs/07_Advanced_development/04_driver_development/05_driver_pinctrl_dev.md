---
sidebar_position: 5
title: "Pinctrl 调试指南"
description: "引脚复用与电气属性配置、电压域设置，含 debugfs 节点查询方法"
---

# Pinctrl 调试指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

Pinctrl（Pin Control）子系统负责引脚的功能复用（pinmux）、电气属性配置（pinconf）与电压域（io-domain）管理，是 GPIO、UART、SPI、I2C、PWM 等外设驱动的基础。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）。适合配置引脚复用与上下拉、驱动能力，或排查引脚复用冲突的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 Linux pinctrl 子系统与设备树基础。

**与其他模块关系**：本系统是各外设驱动的引脚复用底座。GPIO 调试见「[GPIO 使用](./04_driver_gpio_dev.md)」，PWM 引脚复用见「[PWM 驱动调试指南](./07_driver_pwm.md)」。

### 硬件资源

引脚按域（sys）划分为多个 Pinctrl 控制器，每个控制器独立管理本域引脚的复用与电气属性。

<DocScope products="RDK S100">

S100 共 3 个 Pinctrl 控制器，合计 75 个可软件控制的引脚：

| 控制器 | 引脚数量 | 基地址 | pctldev-name |
|---|---|---|---|
| peri | 40 | 0x39ff5000 | peri |
| cam | 18 | 0x370f3000 | cam |
| video | 17 | 0x36090000 | video |

</DocScope>

<DocScope products="RDK S600">

S600 共 3 个 Pinctrl 控制器，合计 113 个可软件控制的引脚：

| 控制器 | 引脚数量 | 基地址 | pctldev-name |
|---|---|---|---|
| hsi | 70 | 0x33801000 | hsi |
| cam | 16 | 0x37121000 | cam |
| peri | 27 | 0x39221000 | peri |

</DocScope>

### 功能说明

**Pinmux**：每个引脚可配置为多种复用功能之一，例如同一引脚可用作 I2C5_SCL 或 UART2_RXD。设备树中通过 `pinmux` 子节点的 `function` 与 `pins` 属性指定。

**Pinconf**：配置引脚的电气属性，支持以下几类：

- 上下拉设置
- 驱动强度设置
- 电压模式设置
- 输入使能设置
- 施密特设置
- 压摆率选择

**io-domain**：管理引脚所在的电压域。硬件手册按 IO Power Domain 划分引脚（如 `VDDIO_TOP_1V8`、`VDDIO_TOP_3V3`），不同引脚需要工作在合适的电压域中。驱动侧通过 `low-power-enable` / `low-power-disable` 按引脚组配置电压模式。

## 驱动代码

`pinctrl-hobot.c` 包含 S100/S600 共用的 Pinctrl 主逻辑，负责向 Pinctrl 子系统注册设备，并向下提供 SoC 数据的初始化入口。

<DocScope products="RDK S100">

```bash
source/hobot-drivers/pinctrl/pinctrl-hobot.c                # Pinctrl 公共主逻辑
source/hobot-drivers/pinctrl/pinctrl-hobot.h                # Pinctrl 公共头文件
source/hobot-drivers/pinctrl/pinctrl-hobot-s100.c           # pin、pin group、function 定义
source/hobot-drivers/kernel-dts/drobot-s100-pinctrl.dtsi    # Pinctrl 设备树
```

</DocScope>
<DocScope products="RDK S600">

```bash
source/hobot-drivers/pinctrl/pinctrl-hobot.c                # Pinctrl 公共主逻辑
source/hobot-drivers/pinctrl/pinctrl-hobot.h                # Pinctrl 公共头文件
source/hobot-drivers/pinctrl/pinctrl-hobot-s600.c           # pin、pin group、function 定义
source/hobot-drivers/kernel-dts/drobot-s600-pinctrl.dtsi    # Pinctrl 设备树
```

`pinctrl-hobot-s600.c` 中控制器 `compatible` 为 `drobot,s600-pinctrl`。

</DocScope>

### 内核配置

<DocScope products="RDK S100">

配置文件路径：`source/hobot-drivers/configs/drobot_s100_defconfig`

```bash
CONFIG_PINCTRL=y                # Linux Pinctrl 子系统
CONFIG_PINCTRL_HOBOT_S100=y     # Pinctrl 驱动
```

</DocScope>
<DocScope products="RDK S600">

配置文件路径：`source/hobot-drivers/configs/drobot_s600_defconfig`

```bash
CONFIG_PINCTRL=y                # Linux Pinctrl 子系统
CONFIG_PINCTRL_HOBOT_S600=y     # Pinctrl 驱动
```

</DocScope>


## 设备树配置

### 控制器节点

<DocScope products="RDK S100">

S100 的 Pinctrl 控制器定义位于 `source/hobot-drivers/kernel-dts/drobot-s100-pinctrl.dtsi`。

</DocScope>
<DocScope products="RDK S600">

S600 的 Pinctrl 控制器定义位于 `source/hobot-drivers/kernel-dts/drobot-s600-pinctrl.dtsi`。

</DocScope>

:::info 备注
该文件中的节点主要声明 SoC 共有特性，和具体电路板无关，一般情况下不用修改。
:::

### Pinmux 与 Pinconf 配置

引脚复用与电气属性在引脚组节点中配置。每个引脚组包含 `pinmux` 与 `pinconf` 两个子节点：

- `pinmux`：`function` 指定复用功能，`pins` 指定该功能涉及的引脚。每个引脚的可选功能数量因引脚而异，可用 `pinmux-functions` 查看。
- `pinconf`：`pins` 指定要配置的引脚，其余属性为配置内容。使用默认值时可以省略 `pinconf` 子节点。

<DocScope products="RDK S100">

以下为 `drobot-s100-pinctrl.dtsi` 中的 `peri_i2c5` 引脚组，将两个引脚复用为 I2C5，并配置驱动强度与上下拉：

```dts
peri_i2c5: peri_i2c5_func {
    pinmux {
        function = "peri_i2c5";
        pins = "peri_i2c5_scl", "peri_i2c5_sda";
    };
    pinconf {
        pins = "peri_i2c5_scl", "peri_i2c5_sda";
        drive-strength = <1>;
        bias-disable;
    };
};
```

</DocScope>
<DocScope products="RDK S600">

以下为 `drobot-s600-pinctrl.dtsi` 中的 `hsi_spi3_mosi` 引脚组：

```dts
hsi_spi3_mosi_spi3_mosi: hsi_spi3_mosi_spi3_mosi_func {
    pinmux {
        function = "hsi_spi3_mosi_spi3_mosi";
        pins = "hsi_spi3_mosi";
    };
    pinconf {
        pins = "hsi_spi3_mosi";
        drive-strength = <1>;
    };
};
```

:::note
S600 的功能名与引脚同名时会重复，如 `hsi_spi3_mosi_spi3_mosi`；不同名时为「域名_功能名_引脚名」，如 `hsi_uart0_txd_spi3_mosi`；另有 `hsi_bpu2`、`hsi_gpio` 这类短名。
:::

</DocScope>

功能名以控制器的实际定义为准，可用 `pinmux-functions` 节点查询，不要自行拼写。

### Pinconf 支持的属性

| 关键字 | 属性 |
| --- | --- |
| bias-pull-up | 上拉设置 |
| bias-pull-down | 下拉设置 |
| bias-disable | 悬空设置 |
| drive-strength | 驱动强度 |
| low-power-disable | 高电压模式（3.3V） |
| low-power-enable | 低电压模式（1.8V） |
| input-disable | 输入不使能 |
| input-enable | 输入使能 |
| input-schmitt-enable | 施密特触发使能 |
| input-schmitt-disable | 施密特触发不使能 |

### 电压域设置

io-domain 设置直接影响模块功能能否正常运行。设置错误可能损坏元器件，导致电路板无法工作。

实践中按以下流程确认硬件电压值与软件 io-domain 设置一致：

1. 软硬件负责人拉通，确认相关引脚适用的 io-domain 范围。将参考值输出到《引脚 io-domain 设置手册》（文档名仅供参考）。
2. 按第一步确认的信息，在设备树中进行相应的 io-domain 设置。
3. 在样板上抓取所有引脚的 io-domain 值，填入手册的实际值部分，识别存在的 gap。
4. 同一电压域下的引脚共享电压设置，单个引脚的设置可能影响同域其它引脚。因此需拉通对齐会议，按第三步识别出的 gap 讨论并修复，直到 gap 消除。

## 功能使用

### 在设备节点中引用 Pinctrl 状态

外设驱动使用引脚前，需在其设备节点中引用上一步定义的引脚组。驱动 probe 时会把 `default` 状态写入寄存器，其他状态可在代码中显式切换。

<DocScope products="RDK S100">

以下为 `rdk-v0p5.dtsi` 中 `ethernet0` 的引用方式：

```dts
&ethernet0 {
    pinctrl-names = "default";
    pinctrl-0 = <&peri_emac>;
};
```

</DocScope>
<DocScope products="RDK S600">

以下为 `rdk-s600-mcb.dtsi` 中 `i2s1` 的引用方式：

```dts
&i2s1 {
    status = "okay";
    pinctrl-0 = <&hsi_pcm1>;
};
```

</DocScope>

`pinctrl-names` 与 `pinctrl-N` 一一对应，可声明多个状态（如 `default`、`sleep`）。切换状态需调用 `pinctrl_select_state()`：

```c
/**
 * pinctrl_select_state() - select/activate/program a pinctrl state to HW
 * @p: the pinctrl handle for the device that requests configuration
 * @state: the state handle to select/activate/program
 */
int pinctrl_select_state(struct pinctrl *p, struct pinctrl_state *state);
```

### 运行时可用的状态

引脚组除 `default` 外，部分控制器（如 I2C）还注册了 `gpio` 状态，可在两种功能间切换。以 I2C 控制器为例：

<DocScope products="RDK S100">

```bash
device: 39420000.i2c current state: default
  state: default
    type: MUX_GROUP controller cam group: cam_i2c0_scl (8) function: cam_i2c0 (6)
  state: gpio
    type: MUX_GROUP controller cam group: cam_i2c0_scl (8) function: cam_gpio (1)
```

即 `cam_i2c0_scl` 可在 I2C0 功能与 GPIO 功能之间切换。

</DocScope>
<DocScope products="RDK S600">

```bash
device: 34840000.i2c current state: default
  state: default
    type: MUX_GROUP controller hsi group: hsi_i2c0_scl (16) function: hsi_i2c0 (42)
    type: MUX_GROUP controller hsi group: hsi_i2c0_sda (17) function: hsi_i2c0 (42)
    type: CONFIGS_GROUP controller hsi group hsi_i2c0_scl (16)config 00000109
  state: gpio
    type: MUX_GROUP controller hsi group: hsi_i2c0_scl (16) function: hsi_gpio (3)
    type: MUX_GROUP controller hsi group: hsi_i2c0_sda (17) function: hsi_gpio (3)
    type: CONFIGS_GROUP controller hsi group hsi_i2c0_scl (16)config 00000109
```

即 `hsi_i2c0_scl` 与 `hsi_i2c0_sda` 可在 I2C0 功能与 GPIO 功能之间切换。

</DocScope>

切换状态需调用 `pinctrl_select_state()`，用法见上一节。

## 调试

:::info 注意
非 root 用户需要在命令前添加 `sudo`。
:::

Pinctrl 的调试接口位于 `/sys/kernel/debug/pinctrl/`。除 `pinctrl-devices`、`pinctrl-handles`、`pinctrl-maps` 三个全局节点外，其余节点位于各控制器的子目录下，下文记作 `<pinctrl_dev>`。

<DocScope products="RDK S100">

S100 的三个控制器目录为 `39ff5000.pinctrl-peri`、`370f3000.pinctrl-cam`、`36090000.pinctrl-video`。

</DocScope>
<DocScope products="RDK S600">

S600 的三个控制器目录为 `33801000.pinctrl-hsi`、`37121000.pinctrl-cam`、`39221000.pinctrl-peri`。

</DocScope>

下文各节点示例中，S100 取 `peri` 域，S600 取 `hsi` 域。实际输出以设备端为准。

### 查看系统中的 Pinctrl 设备

```bash
cat /sys/kernel/debug/pinctrl/pinctrl-devices
```

输出中 `[pinmux]`、`[pinconf]` 表示该控制器是否注册了对应功能。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# cat /sys/kernel/debug/pinctrl/pinctrl-devices
name [pinmux] [pinconf]
peri yes yes
cam yes yes
video yes yes
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# cat /sys/kernel/debug/pinctrl/pinctrl-devices
name [pinmux] [pinconf]
hsi yes yes
cam yes yes
peri yes yes
```

</DocScope>

### 查看引脚配置映射

```bash
cat /sys/kernel/debug/pinctrl/pinctrl-handles
```

列出已被申请的引脚配置，包括每个设备当前处于哪个状态、各引脚被复用为什么功能。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# cat /sys/kernel/debug/pinctrl/pinctrl-handles
Requested pin control handlers their pinmux maps:
device: 394e0000.sdhc current state: default
  state: default
    type: MUX_GROUP controller peri group: peri_sd_wprot (16) function: peri_sd (4)
    type: CONFIGS_GROUP controller peri group peri_sd_wprot (16)config 00000809
device: 39420000.i2c current state: default
  state: default
    type: MUX_GROUP controller cam group: cam_i2c0_scl (8) function: cam_i2c0 (6)
  state: gpio
    type: MUX_GROUP controller cam group: cam_i2c0_scl (8) function: cam_gpio (1)
...
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# cat /sys/kernel/debug/pinctrl/pinctrl-handles
Requested pin control handlers their pinmux maps:
device: 3484c000.uart0 current state: default
  state: default
    type: MUX_GROUP controller hsi group: hsi_uart2_txd (59) function: hsi_uart2 (117)
    type: MUX_GROUP controller hsi group: hsi_uart2_rxd (60) function: hsi_uart2 (117)
    type: CONFIGS_GROUP controller hsi group hsi_uart2_txd (59)config 00000209
device: 34840000.i2c current state: default
  state: default
    type: MUX_GROUP controller hsi group: hsi_i2c0_scl (16) function: hsi_i2c0 (42)
  state: gpio
    type: MUX_GROUP controller hsi group: hsi_i2c0_scl (16) function: hsi_gpio (3)
...
```

</DocScope>

### 查看引脚映射表

```bash
cat /sys/kernel/debug/pinctrl/pinctrl-maps
```

按设备分组列出每个引脚映射，包含使用该引脚的设备、所处状态、控制器、引脚组与复用功能。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# cat /sys/kernel/debug/pinctrl/pinctrl-maps
Pinctrl maps:
device 394e0000.sdhc
state default
type MUX_GROUP (2)
controlling device 39ff5000.pinctrl
group peri_sd_wprot
function peri_sd
...
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# cat /sys/kernel/debug/pinctrl/pinctrl-maps
Pinctrl maps:
device 3484c000.uart0
state default
type MUX_GROUP (2)
controlling device 33801000.pinctrl
group hsi_uart2_txd
function hsi_uart2
...
```

</DocScope>

### 查看 GPIO 与引脚的对应关系

```bash
cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/gpio-ranges
```

列出该域引脚与 GPIO 控制器的映射范围。每行格式如下：

```text
<gpio 本地起始>: <gpio 设备> GPIOS [全局起始 - 全局结束] PINS [引脚起始 - 引脚结束]
```

GPIO 的全局编号即 `gpio-index`，其起始值由内核动态分配，无法从设备树推得。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# cat /sys/kernel/debug/pinctrl/39ff5000.pinctrl-peri/gpio-ranges
GPIO ranges handled:
0: 394f0000.gpio GPIOS [480 - 511] PINS [2 - 33]
0: 39500000.gpio GPIOS [474 - 479] PINS [34 - 39]
```

`peri` 域的前 32 个引脚（引脚 2~33）对应 `peri_gpio0`，起始 `gpio-index` 为 480。

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# cat /sys/kernel/debug/pinctrl/33801000.pinctrl-hsi/gpio-ranges
GPIO ranges handled:
0: 33810000.gpio GPIOS [480 - 511] PINS [0 - 31]
0: 33814000.gpio GPIOS [448 - 471] PINS [32 - 55]
24: 33814000.gpio GPIOS [472 - 479] PINS [59 - 66]
0: 33818000.gpio GPIOS [445 - 447] PINS [67 - 69]
```

`hsi` 域共 70 个引脚，分属 3 个 GPIO 控制器。注意第 3 行的本地起始为 24，与引脚起始 59 不成线性关系——这正是不能自行推算 `gpio-index` 的原因。

</DocScope>

### 查看引脚的复用与 GPIO 归属

```bash
cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/pins
```

逐行列出该域全部引脚，格式为 `pin <本地编号> (<引脚名>) <gpio 本地编号>:<gpio 设备>`。`?` 表示该引脚未映射到 GPIO。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# cat /sys/kernel/debug/pinctrl/39ff5000.pinctrl-peri/pins
registered pins: 40
pin 0 (UFS_REF_CLK) 0:?
pin 1 (UFS_RSTO) 0:?
pin 2 (EMAC_MDC_HSI0) 0:394f0000.gpio
pin 3 (EMAC_MDIO_HSI0) 1:394f0000.gpio
...
```

`UFS_REF_CLK` 与 `UFS_RSTO` 不占 GPIO 编号，故显示 `?`。

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# cat /sys/kernel/debug/pinctrl/33801000.pinctrl-hsi/pins
registered pins: 70
pin 0 (SPI3_MOSI) 0:33810000.gpio
pin 1 (SPI3_MISO) 1:33810000.gpio
pin 2 (SPI3_CSN0) 2:33810000.gpio
pin 3 (SPI3_SCLK) 3:33810000.gpio
...
```

</DocScope>

### 查看引脚组

```bash
cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/pingroups
```

列出该域所有引脚组。本驱动中每个引脚即一个引脚组，组名格式为 `<域>_<引脚名小写>`。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# cat /sys/kernel/debug/pinctrl/39ff5000.pinctrl-peri/pingroups
registered pin groups:
group: peri_ufs_ref_clk
pin 0 (UFS_REF_CLK)

group: peri_ufs_rsto
pin 1 (UFS_RSTO)

group: peri_emac_mdc_hsi0
pin 2 (EMAC_MDC_HSI0)
...
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# cat /sys/kernel/debug/pinctrl/33801000.pinctrl-hsi/pingroups
registered pin groups:
group: hsi_spi3_mosi
pin 0 (SPI3_MOSI)

group: hsi_spi3_miso
pin 1 (SPI3_MISO)

group: hsi_spi3_csn0
pin 2 (SPI3_CSN0)
...
```

</DocScope>

### 查看复用功能列表

```bash
cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/pinmux-functions
```

列出该域全部复用功能，格式为 `function <编号>: <功能名>, groups = [ ... ]`。`groups` 中的引脚组可被复用为该功能。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# cat /sys/kernel/debug/pinctrl/39ff5000.pinctrl-peri/pinmux-functions
function 0: peri_ufs, groups = [ peri_ufs_ref_clk peri_ufs_rsto ]
function 1: peri_emac, groups = [ peri_emac_mdc_hsi0 peri_emac_mdio_hsi0 ]
function 2: peri_clkout, groups = [ peri_emac_mdc_hsi0 ]
function 3: peri_gpio, groups = [ peri_emac_mdc_hsi0 peri_emac_mdio_hsi0 ... ]
...
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# cat /sys/kernel/debug/pinctrl/33801000.pinctrl-hsi/pinmux-functions
function 0: hsi_spi3_mosi_spi3_mosi, groups = [ hsi_spi3_mosi ]
function 1: hsi_uart0_txd_spi3_mosi, groups = [ hsi_spi3_mosi ]
function 2: hsi_bpu2, groups = [ hsi_spi3_mosi ]
function 3: hsi_gpio, groups = [ hsi_spi3_mosi hsi_spi3_miso ... ]
...
```

同一引脚组可对应多个功能，例如 `hsi_spi3_mosi` 可用作 SPI3_MOSI、UART0_TXD 或 BPU2。

</DocScope>

### 查看引脚当前复用状态

```bash
cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/pinmux-pins
```

格式为 `pin <编号> (<引脚名>): <占用者> <gpio 归属> <hog 标记>`。`(MUX UNCLAIMED)` 表示该引脚尚未被任何驱动占用。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# cat /sys/kernel/debug/pinctrl/39ff5000.pinctrl-peri/pinmux-pins
Pinmux settings per pin
Format: pin (name): mux_owner gpio_owner hog?
pin 0 (UFS_REF_CLK): (MUX UNCLAIMED) (GPIO UNCLAIMED)
pin 1 (UFS_RSTO): (MUX UNCLAIMED) (GPIO UNCLAIMED)
pin 2 (EMAC_MDC_HSI0): 330f0000.ethernet (GPIO UNCLAIMED) function peri_emac group peri_emac_mdc_hsi0
pin 3 (EMAC_MDIO_HSI0): 330f0000.ethernet (GPIO UNCLAIMED) function peri_emac group peri_emac_mdio_hsi0
...
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# cat /sys/kernel/debug/pinctrl/33801000.pinctrl-hsi/pinmux-pins
Pinmux settings per pin
Format: pin (name): mux_owner gpio_owner hog?
pin 0 (SPI3_MOSI): (MUX UNCLAIMED) (GPIO UNCLAIMED)
pin 1 (SPI3_MISO): (MUX UNCLAIMED) (GPIO UNCLAIMED)
pin 4 (EMAC_MDC_HSI4): 33140000.xgmac1 (GPIO UNCLAIMED) function hsi_emac_mdc_hsi4_emac_mdc_hsi4 group hsi_emac_mdc_hsi4
...
```

</DocScope>

### 查看引脚电气属性

```bash
cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/pinconf-pins
```

按引脚打印电气属性实际值。每项独占一行，格式为 `键=值`。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# cat /sys/kernel/debug/pinctrl/39ff5000.pinctrl-peri/pinconf-pins
Pin config settings per pin
Format: pin (name): configs
pin 0 (UFS_REF_CLK):
  bias-pull-up=0
  bias-pull-down=1
  bias-disable=0
  drive-strength=2
  low-power-enable=0 (3.3v)
  input-enable=1
  input-schmitt-enable=0
...
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# cat /sys/kernel/debug/pinctrl/33801000.pinctrl-hsi/pinconf-pins
Pin config settings per pin
Format: pin (name): configs
pin 0 (SPI3_MOSI):
  bias-pull-up=0
  bias-pull-down=1
  bias-disable=0
  drive-strength=2
  low-power-enable=0 (3.3v)
  input-enable=1
  input-schmitt-enable=0
...
```

</DocScope>

### 查看引脚组电气属性

```bash
cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/pinconf-groups
```

按引脚组打印电气属性。与 `pinconf-pins` 的差异有两处：字段名不同（如 `input bias pull up` 对应 `bias-pull-up`）；字段集也不同，本节点额外输出 `slew rate`，而 `pinconf-pins` 额外输出 `low-power-enable`。

<DocScope products="RDK S100">

```bash
root@ubuntu:~# cat /sys/kernel/debug/pinctrl/39ff5000.pinctrl-peri/pinconf-groups
Pin config settings per pin group
Format: group (name): configs
0 (peri_ufs_ref_clk):
  input bias disabled=0
  input bias pull down=1
  input bias pull up=0
  output drive strength=2
  input enabled=1
  input schmitt enabled=0
  slew rate=0
...
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# cat /sys/kernel/debug/pinctrl/33801000.pinctrl-hsi/pinconf-groups
Pin config settings per pin group
Format: group (name): configs
0 (hsi_spi3_mosi):
  input bias disabled=0
  input bias pull down=1
  input bias pull up=0
  output drive strength=2
  input enabled=1
  input schmitt enabled=0
  slew rate=0
...
```

</DocScope>

### 运行时修改引脚复用

`pinmux-select` 节点仅可写，格式为 `echo "<group> <function>" > pinmux-select`。先用 `pinmux-functions` 查得目标功能的 group 与 function 名，再写入。

:::note
`pinmux-pins` 不会因该操作而改变。它只反映 `pinctrl_select_state` 的占用状态，而 `pinmux-select` 直接写寄存器，不更新占用记录。确认结果需读 MUX 寄存器。

MUX 寄存器地址为 `<控制器基地址> + 0x60 + 引脚组编号 * 4`，功能槽位占低 2 位。引脚组编号即 `pingroups` 输出中的序号。
:::

<DocScope products="RDK S100">

本例改用 `video` 域，因为 `peri` 域的多功能引脚均已被外设占用，改动会影响正在工作的设备。

以 `video` 域的 `video_peri_rsto` 引脚为例。该引脚未被占用，可复用为 `video_peri_rsto`（槽位 0）或 `video_gpio`（槽位 3）。其引脚组编号为 1，`video` 域基地址为 `0x36090000`，故目标地址为 `0x36090064`：

```bash
root@ubuntu:~# cd /sys/kernel/debug/pinctrl/36090000.pinctrl-video/
root@ubuntu:~# devmem 0x36090064 32     # 初始（PERI_RSTO，槽位 0）
0x00000000
root@ubuntu:~# echo "video_peri_rsto video_gpio" > pinmux-select
root@ubuntu:~# devmem 0x36090064 32     # GPIO，槽位 3
0x00000003
root@ubuntu:~# echo "video_peri_rsto video_peri_rsto" > pinmux-select
root@ubuntu:~# devmem 0x36090064 32     # 改回 PERI_RSTO，槽位 0
0x00000000
```

</DocScope>
<DocScope products="RDK S600">

以 `hsi` 域的 `hsi_spi3_mosi` 引脚为例。该引脚可复用为 `hsi_spi3_mosi_spi3_mosi`（槽位 0）、`hsi_uart0_txd_spi3_mosi`（槽位 1）、`hsi_bpu2`（槽位 2）或 `hsi_gpio`（槽位 3）。其引脚组编号为 0，`hsi` 域基地址为 `0x33801000`，故目标地址为 `0x33801060`：

```bash
root@drobot:~# devmem 0x33801060 32     # 初始（SPI3_MOSI，槽位 0）
0x00000000
root@drobot:~# echo "hsi_spi3_mosi hsi_gpio" > pinmux-select
root@drobot:~# devmem 0x33801060 32     # GPIO，槽位 3
0x00000003
root@drobot:~# echo "hsi_spi3_mosi hsi_bpu2" > pinmux-select
root@drobot:~# devmem 0x33801060 32     # BPU2，槽位 2
0x00000002
root@drobot:~# echo "hsi_spi3_mosi hsi_spi3_mosi_spi3_mosi" > pinmux-select
root@drobot:~# devmem 0x33801060 32     # 改回 SPI3_MOSI，槽位 0
0x00000000
```

</DocScope>

:::danger 危险
该操作**不检查引脚是否被占用**，会直接改写复用寄存器。对正在使用的引脚执行会导致对应外设立即失效。仅在调试未占用的引脚时使用。

该操作也不会同步更新设备树配置，重启后失效。
:::

:::note
写入失败时，`dmesg` 会输出以下错误之一：

| 错误信息 | 原因 |
|---|---|
| `invalid function <name> in map table` | function 名不在 `pinmux-functions` 列表中 |
| `invalid group <name>` | group 不属于该 function |
| `can't find the function!` | 该引脚不支持所选功能（对应槽位为 `na`） |
:::

## 常见问题

### 引脚复用后外设无功能

**原因**：设备树 `pinmux` 的 `function`/`pins` 配置错误，或节点 `status` 未设置为 `okay`。

**解决**：用 debugfs `pinmux-pins`/`pins` 查看当前复用状态，核对「Pinmux 与 Pinconf 配置」中的 `function` 与 `pins` 是否正确。

### 上下拉/驱动能力设置不生效

**原因**：`pinconf` 属性名与驱动支持的关键字不一致。

**解决**：对照「Pinconf 支持的属性」中的关键字表，核对设备树中属性拼写与取值。

## 相关文档

- [GPIO 使用](/Advanced_development/driver_development/driver_gpio_dev)
- [扩展引脚应用](/Demos/peripheral/40pin)
