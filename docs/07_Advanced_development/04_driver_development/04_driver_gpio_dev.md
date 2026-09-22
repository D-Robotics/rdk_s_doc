---
sidebar_position: 4
title: "GPIO 使用"
description: "GPIO 驱动配置、设备树引用与用户态 sysfs 操作，含 gpio-index 计算方法"
---

# GPIO 使用

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

GPIO（General Purpose Input/Output，通用输入输出）是开发板最基础的外设接口，用于读取引脚电平或驱动外部器件。本驱动基于 DesignWare GPIO 控制器实现，每个引脚均可独立配置为输入或输出，并支持中断。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）。适合需要操作 GPIO 引脚电平、中断或调试引脚复用的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 Linux GPIO 子系统与 sysfs/debugfs 基础。

**与其他模块关系**：本驱动是用户态 GPIO 应用（扩展引脚应用）的底层实现；引脚复用依赖 Pinctrl 子系统，见「[Pinctrl 调试指南](./05_driver_pinctrl_dev.md)」。

### 硬件资源

<DocScope products="RDK S100">

S100 共有 4 个 GPIO 控制器，分属 peri、cam、video 三个 sys，每个 GPIO 引脚都支持中断。各控制器规格如下：

| GPIO 控制器 | 引脚数量 | 基地址 | 设备节点 |
|---|---|---|---|
| peri_gpio0 | 32 | 0x394f0000 | peri_port0 |
| peri_gpio1 | 6 | 0x39500000 | peri_port1 |
| cam_gpio0 | 18 | 0x370f5000 | cam_port0 |
| video_gpio0 | 17 | 0x360b0000 | video_port0 |

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/gpio_devs.png" alt="S100 GPIO 设备概览" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

<DocScope products="RDK S600">

S600 共有 5 个 GPIO 控制器，分属 hsi、cam、peri 三个 sys，共声明 110 个 GPIO 引脚，每个 GPIO 引脚都支持中断。各控制器规格如下：

| GPIO 控制器 | 引脚数量 | 基地址 | 设备节点 |
|---|---|---|---|
| hsi_gpio0 | 32 | 0x33810000 | hsi_port0 |
| hsi_gpio1 | 32 | 0x33814000 | hsi_port1 |
| hsi_gpio2 | 3 | 0x33818000 | hsi_port2 |
| cam_gpio0 | 16 | 0x37130000 | cam_port0 |
| peri_gpio0 | 27 | 0x390b0000 | peri_port0 |

</DocScope>

## 驱动代码

```bash
source/kernel/drivers/gpio/gpio-dwapb.c        # DesignWare GPIO 控制器驱动
source/kernel/drivers/gpio/gpiolib.c           # GPIO 框架核心
source/kernel/drivers/gpio/gpiolib-sysfs.c     # sysfs 接口（/sys/class/gpio）
source/kernel/drivers/gpio/gpiolib-cdev.c      # 字符设备接口（新的 ABI）
source/kernel/drivers/gpio/gpiolib-legacy.c    # 经典（legacy）整数接口
source/kernel/drivers/gpio/gpio-tpt2955xa.c    # I2C GPIO 扩展芯片驱动（tpt2955xa）
```

### 内核配置

<DocScope products="RDK S100">
配置文件路径：`source/hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
配置文件路径：`source/hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>

```bash
CONFIG_GPIO_DWAPB=y        # DesignWare GPIO 控制器驱动
CONFIG_GPIO_SYSFS=y        # sysfs 接口，用户态读写引脚依赖此配置
CONFIG_DEBUG_FS=y          # debugfs，调试章节的 gpio/gpio-ranges 节点依赖此配置
CONFIG_GPIO_TPT2955XA=m    # I2C GPIO 扩展芯片驱动（模块）
```

`GPIO_DWAPB` 会自动选中 `CONFIG_GPIOLIB`、`CONFIG_GPIO_GENERIC`、`CONFIG_OF_GPIO` 与 `CONFIG_GPIOLIB_IRQCHIP`，中断支持无需额外配置。

## 设备树配置

### 控制器节点

<DocScope products="RDK S100">

S100 GPIO 控制器的设备树定义位于 `source/hobot-drivers/kernel-dts/drobot-s100-pinctrl.dtsi`。

:::info 备注
该文件中的节点主要声明 SoC 共有特性，和具体电路板无关，一般情况下不用修改。
:::

</DocScope>
<DocScope products="RDK S600">

S600 GPIO 控制器的设备树定义位于 `source/hobot-drivers/kernel-dts/drobot-s600-pinctrl.dtsi`。

:::info 备注
该文件中的节点主要声明 SoC 共有特性，和具体电路板无关，一般情况下不用修改。
:::

</DocScope>

### 在设备节点中引用 GPIO

用户需要配置特定引脚为 GPIO 功能时，可在设备节点中直接引用预定义的 GPIO 配置。属性名一般形如 `<name>-gpios` 或 `<name>-gpio`，每个条目由「GPIO 控制器 引脚序号 标志」三部分组成，引脚序号从 0 开始。

<DocScope products="RDK S100">

以下摘自板级设备树的实际用法（`source/hobot-drivers/kernel-dts/rdk-v0p5.dtsi`）：

```dts
reset-gpios = <&peri_port0 25 GPIO_ACTIVE_HIGH>;
irq-gpios   = <&video_port0 0 IRQ_TYPE_EDGE_FALLING>;
```

也可以在一个属性中引用多个引脚，每个 `<...>` 对应一个引脚：

```dts
ep-perst-gpios = <&gpio_exp_20 3 GPIO_ACTIVE_LOW>,	/* NVME_PERSTB */
                 <&gpio_exp_24 2 GPIO_ACTIVE_LOW>,	/* WIFI_PERSTB */
                 <&gpio_exp_27 15 GPIO_ACTIVE_LOW>;	/* USBHUB1_PERSTB */
```

</DocScope>
<DocScope products="RDK S600">

以下摘自板级设备树的实际用法（`source/hobot-drivers/kernel-dts/rdk-s600-mcb.dtsi`）：

```dts
reset-gpios = <&hsi_port1 31 GPIO_ACTIVE_HIGH>;
irq-gpios   = <&hsi_port1 15 IRQ_TYPE_EDGE_FALLING>;
```

也可以在一个属性中引用多个引脚，每个 `<...>` 对应一个引脚：

```dts
ep-ponrst-gpios = <&gpio_exp_20 0 GPIO_ACTIVE_LOW>,	/* asm3042 hub 0 power on reset */
                  <&gpio_exp_20 7 GPIO_ACTIVE_LOW>,	/* asm3042 hub 1 power on reset */
                  <&gpio_exp_27 6 GPIO_ACTIVE_LOW>;	/* asm3042 hub 2 power on reset */
```

</DocScope>

标志字段中，`GPIO_ACTIVE_HIGH` / `GPIO_ACTIVE_LOW` 表示高/低电平有效；用作中断时为触发方式（如 `IRQ_TYPE_EDGE_FALLING`）。引脚序号须小于所在控制器的引脚数量（见「概述」中的控制器规格表）。

## 功能使用

### Kernel 阶段

#### 驱动代码接口

```c
/* include/linux/gpio.h */
/* 申请GPIO */
int gpio_request(unsigned gpio, const char *label);
/* GPIO初始化为输出。并设置输出电平*/
int gpio_direction_output(unsigned gpio, int value);
/* GPIO初始化为输入 */
int gpio_direction_input(unsigned gpio);
/* 获取GPIO的电平 */
int gpio_get_value(unsigned int gpio);
/* 设置GPIO的电平 */
void gpio_set_value(unsigned int gpio, int value);
/* 释放GPIO */
void gpio_free(unsigned gpio);
/* 申请GPIO中断，返回的值可以传给request_irq和free_irq */
int gpio_to_irq(unsigned int gpio);
```

:::note
以上为 GPIO 的经典（legacy）接口，声明在 `include/linux/gpio.h`，实现在 `drivers/gpio/gpiolib-legacy.c`，新驱动建议改用下面的描述符接口。
:::

新接口基于描述符（`struct gpio_desc *`），声明在 `include/linux/gpio/consumer.h`：

```c
/* 申请 GPIO，con_id 对应设备树中的 <con_id>-gpios 属性名，如 "reset" 对应 reset-gpios */
struct gpio_desc *gpiod_get(struct device *dev, const char *con_id,
                            enum gpiod_flags flags);

/* 申请可选的 GPIO（属性不存在时返回 NULL 而非错误）*/
struct gpio_desc *gpiod_get_optional(struct device *dev, const char *con_id,
                                     enum gpiod_flags flags);

/* 释放 GPIO */
void gpiod_put(struct gpio_desc *desc);

/* GPIO 初始化为输入 / 输出并设置电平 */
int gpiod_direction_input(struct gpio_desc *desc);
int gpiod_direction_output(struct gpio_desc *desc, int value);

/* 获取 / 设置 GPIO 电平 */
int gpiod_get_value(const struct gpio_desc *desc);
void gpiod_set_value(struct gpio_desc *desc, int value);

/* 获取 GPIO 对应的中断号 */
int gpiod_to_irq(const struct gpio_desc *desc);
```

另有 `devm_gpiod_get()` / `devm_gpiod_get_optional()` 等托管版本，设备卸载时自动释放，推荐在驱动中使用。

### 用户态使用

#### 控制接口

用户态可通过 `/sys/class/gpio` 下的节点操作 GPIO，各节点用法如下：

```bash
# 申请 GPIO
echo <gpio_num> > /sys/class/gpio/export
# 释放 GPIO
echo <gpio_num> > /sys/class/gpio/unexport
# 设为输出；dir 为 out 时，可向 value 写入 1/0 输出高/低电平
echo out > /sys/class/gpio/gpio<gpio_num>/direction
# 输出高电平
echo 1 > /sys/class/gpio/gpio<gpio_num>/value
# 输出低电平
echo 0 > /sys/class/gpio/gpio<gpio_num>/value

# 设为输入；dir 为 in 时，cat value 读回输入电平（0 为低，1 为高）
echo in > /sys/class/gpio/gpio<gpio_num>/direction
# 读取 GPIO 的输入值
cat /sys/class/gpio/gpio<gpio_num>/value
```

#### sysfs 接口介绍

**export 和 unexport**

`/sys/class/gpio/export` 和 `/sys/class/gpio/unexport` 这两个节点只能写不能读。

用户程序写入 GPIO 编号，即可向内核申请将该 GPIO 的控制权导出到用户空间。前提是该 GPIO 未被内核代码申请。例如申请编号为 480 的 GPIO：

```bash
echo 480 > export
```

上述操作会为 480 号 GPIO 创建节点 gpio480，此时 `/sys/class/gpio` 目录下会生成一个 gpio480 目录。

`/sys/class/gpio/unexport` 的效果与导出相反。移除 gpio480 节点的命令：

```bash
echo 480 > unexport    # 移除 gpio480 节点，释放序号为 480 的 GPIO
```

**direction**

direction 表示 GPIO 端口的方向，读取结果是 in 或 out。也可以对该文件写操作。写入 out 时该 GPIO 设为输出，写入 in 时设为输入。

**value**

当 dir 为 in 时，`cat value` 表示输入的值（0 为低，1 为高）。

当 dir 为 out 时，可以向 value 中 `echo 1` 或 `echo 0`，分别表示输出高电平和低电平。

**edge**

用户层设置中断时，direction 需要设置为 in，然后向 edge 中设置相应的值。

| edge 的值 | 含义 |
| --- | --- |
| none | 表示引脚为输入，不是中断引脚 |
| rising | 表示引脚为中断输入，上升沿触发 |
| falling | 表示引脚为中断输入，下降沿触发 |
| both | 表示引脚为中断输入，边沿触发 |

## 调试

:::note
`cat /sys/kernel/debug/gpio` 的输出中，`parent` 字段可用于区分两类 gpiochip：

- `parent: platform/xxxxxxxx.gpio`：SoC 内置的 GPIO 控制器，即「概述 → 硬件资源」中列出的控制器。
- `parent: i2c/<bus>-<addr>`（如 `i2c/0-0024`）：板级 GPIO 扩展芯片，经 I2C 挂载。

扩展芯片不属于 SoC 控制器。它的引脚号在 SoC 控制器之后由内核动态分配。受 I2C 访问速度限制，扩展芯片通常只用于复位、使能等低频控制。

导出扩展芯片的引脚时，应以输出中 `GPIOs <base>-<base+n>` 给出的 base 为准，不要按引脚在板上的物理顺序推算。
:::

:::note
设备树中的 `gpio-ranges` 属性与 `/sys/kernel/debug/pinctrl/<pinctrl_dev>/gpio-ranges` 节点含义不同：

- 设备树属性 `gpio-ranges`：描述 Pinctrl 引脚编号与 GPIO 控制器本地编号的映射关系。格式为 `<phandle gpio_offset pin_offset count>`，例如 `<&pinctrl_cam 0 0 16>` 表示 Pinctrl 引脚 0~15 依次映射到 GPIO 本地编号 0~15。
- debugfs 节点 `gpio-ranges`：打印运行时已注册的 GPIO 范围，用于查看控制器与引脚分组的对应关系。

两者描述的都是**本地编号**之间的映射。gpio-index 中的 base 由内核动态分配，取不到这个属性里。
:::

### 查看 GPIO 使用状态

```bash
cat /sys/kernel/debug/gpio
```

查询上述节点，可以获取到当前系统中正在使用的 GPIO 及其状态（in、out、IRQ）。

也可以查看引脚分组与 GPIO 编号的对应关系：

```bash
cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/gpio-ranges
```

<DocScope products="RDK S100">

```bash
root@ubuntu:~# cat /sys/kernel/debug/gpio
gpiochip6: GPIOs 407-422, parent: i2c/0-0027, tpt29555a, can sleep:
gpio-407 (40PIN_GPIO0         )
gpio-408 (40PIN_GPIO1         )
gpio-409 (40PIN_GPIO2         )
gpio-410 (40PIN_GPIO3         )
gpio-411 (40PIN_GPIO4         )
gpio-412 (40PIN_GPIO5         )
gpio-413 (40PIN_GPIO6         )
gpio-414 (40PIN_GPIO7         )
gpio-415 (40PIN_GPIO8         )
gpio-416 (40PIN_GPIO9         )
gpio-417 (ALTER_3v3_N         )
gpio-418 (DES2_POC_EN         )
gpio-419 (DES3_POC_EN         )
gpio-420 (UPE_CLKREQ3         )
gpio-421 (ASM2806_PCIE_RST    |switch-perst        ) out hi ACTIVE LOW
gpio-422 (ASM3042_PCIE_RSTN0  |ep-perst            ) out hi ACTIVE LOW

gpiochip5: GPIOs 423-430, parent: i2c/0-0024, tpt29554a, can sleep:
gpio-423 (SGMII0_PHYRSTB      |reset               ) out hi ACTIVE LOW
gpio-424 (SGMII1_PHYRSTB      |reset               ) out hi ACTIVE LOW
gpio-425 (M2.E_PCIE_RST       |ep-perst            ) out hi ACTIVE LOW
gpio-426 (M2.E_WIFI_REG       |ep-ponrst           ) out hi ACTIVE LOW
gpio-427 (M2.E_BT_REG         |sysfs               ) out hi
gpio-428 (M2.E_SDIO_RST       )
gpio-429 (M2.E_BT_DEVICE_WAKE )

gpiochip4: GPIOs 431-438, parent: i2c/0-0020, tpt29554a, can sleep:
gpio-431 (AMS3042_PORSTN0     |ep-ponrst           ) out hi ACTIVE LOW
gpio-432 (DES3_PWRON          )
gpio-433 (DES1_POC_EN         )
gpio-434 (M2.M_PCIE_RST       |ep-perst            ) out hi ACTIVE LOW
gpio-435 (DES2_PWRON          )
gpio-436 (ASM3042_PCIE_RSTN1  |ep-perst            ) out hi ACTIVE LOW
gpio-437 (M2.M_ALERT          )
gpio-438 (AMS3042_PORSTN1     |ep-ponrst           ) out hi ACTIVE LOW

gpiochip3: GPIOs 439-455, parent: platform/360b0000.gpio, 360b0000.gpio:
gpio-439 (                    |irq                 ) in  hi IRQ

gpiochip2: GPIOs 456-473, parent: platform/370f5000.gpio, 370f5000.gpio:
gpio-463 (                    |io-ext-reset        ) out lo
gpio-464 (                    |scl                 ) out lo
gpio-465 (                    |sda                 ) in  lo
gpio-466 (                    |scl                 ) out lo
gpio-467 (                    |sda                 ) in  lo
gpio-468 (                    |scl                 ) out lo
gpio-469 (                    |sda                 ) in  lo
gpio-470 (                    |scl                 ) out lo
gpio-471 (                    |sda                 ) in  lo
gpio-472 (                    |scl                 ) out lo
gpio-473 (                    |sda                 ) in  lo

gpiochip1: GPIOs 474-479, parent: platform/39500000.gpio, 39500000.gpio:

gpiochip0: GPIOs 480-511, parent: platform/394f0000.gpio, 394f0000.gpio:
gpio-505 (                    |reset               ) out hi
root@ubuntu:~#
```

</DocScope>
<DocScope products="RDK S600">

```bash
root@drobot:~# cat /sys/kernel/debug/gpio
gpiochip7: GPIOs 362-377, parent: i2c/9-0027, tpt29555a, can sleep:
gpio-362 (DES0_POC_EN         )
gpio-363 (DES1_POC_EN         )
gpio-364 (DES2_POC_EN         )
gpio-365 (DES3_POC_EN         )
gpio-366 (NC_4                )
gpio-367 (NC_5                )
gpio-368 (AMS3042_PORSTN2     |ep-ponrst           ) out hi ACTIVE LOW
gpio-369 (MAIN_CAN_STB        |sysfs               ) out hi
gpio-370 (DES3_POC_INT        )
gpio-371 (DES2_POC_INT        )
gpio-372 (ALERT               )
gpio-373 (DES1_POC_INT        )
gpio-374 (DES0_POC_INT        )
gpio-375 (UPE_CLKREQ3         )
gpio-376 (ASM2806_PCIE_RST    |switch-perst        ) out hi ACTIVE LOW
gpio-377 (ASM3042_PCIE_RSTN0  |ep-perst            ) out hi ACTIVE LOW

gpiochip6: GPIOs 378-393, parent: i2c/9-0024, tpt29555a, can sleep:
gpio-378 (88X3520_P0_RESET    )
gpio-379 (88X3520_P1_RESET    )
gpio-380 (M2.E_PCIE_RST       |ep-perst            ) out hi ACTIVE LOW
gpio-381 (M2.E_WIFI_REG       |ep-ponrst           ) out hi ACTIVE LOW
gpio-382 (M2.E_BT_REG         )
gpio-383 (M2.E_SDIO_RST       )
gpio-384 (M2.E_BT_DEVICE_WAKE )
gpio-385 (RTL8211_PHY3_PHYRSTB|reset               ) out hi ACTIVE LOW
gpio-386 (RTL8211_PHY2_PHYRSTB|reset               ) out hi ACTIVE LOW
gpio-387 (NC_11               )
gpio-388 (NC_12               )
gpio-389 (NC_13               )
gpio-390 (NC_14               )
gpio-391 (NC_15               )
gpio-392 (NC_16               )
gpio-393 (NC_17               )

gpiochip5: GPIOs 394-401, parent: i2c/9-0020, tpt29554a, can sleep:
gpio-394 (ASM3042_PORSTN0     |ep-ponrst           ) out hi ACTIVE LOW
gpio-395 (SL6243A_RESET       )
gpio-396 (M.2M_PCIE_CLKREQ    )
gpio-397 (M.2M_PCIE_RST       |ep-perst            ) out hi ACTIVE LOW
gpio-398 (ASM3042_PCIE_RSTN2  |ep-perst            ) out hi ACTIVE LOW
gpio-399 (ASM3042_PCIE_RSTN1  |ep-perst            ) out hi ACTIVE LOW
gpio-400 (M2.M_ALERT          )
gpio-401 (ASM3042_PORSTN1     |ep-ponrst           ) out hi ACTIVE LOW

gpiochip4: GPIOs 402-428, parent: platform/390b0000.gpio, 390b0000.gpio:

gpiochip3: GPIOs 429-444, parent: platform/37130000.gpio, 37130000.gpio:

gpiochip2: GPIOs 445-447, parent: platform/33818000.gpio, 33818000.gpio:

gpiochip1: GPIOs 448-479, parent: platform/33814000.gpio, 33814000.gpio:
gpio-448 (                    |scl                 ) out lo
gpio-449 (                    |sda                 ) in  lo
gpio-450 (                    |scl                 ) out lo
gpio-451 (                    |sda                 ) in  lo
gpio-479 (                    |reset               ) out hi

gpiochip0: GPIOs 480-511, parent: platform/33810000.gpio, 33810000.gpio:
gpio-496 (                    |scl                 ) out lo
gpio-497 (                    |sda                 ) in  lo
gpio-498 (                    |scl                 ) out lo
gpio-499 (                    |sda                 ) in  lo
gpio-500 (                    |scl                 ) out lo
gpio-501 (                    |sda                 ) in  lo
gpio-502 (                    |scl                 ) out lo
gpio-503 (                    |sda                 ) in  lo
gpio-504 (                    |scl                 ) out lo
gpio-505 (                    |sda                 ) in  lo
gpio-506 (                    |scl                 ) out lo
gpio-507 (                    |sda                 ) in  lo
gpio-510 (                    |scl                 ) out lo
gpio-511 (                    |sda                 ) in  lo
root@drobot:~#
```

</DocScope>

### 计算 gpio-index

kernel_index = base + offset，offset 通过设备树获取，base 通过 `/sys/kernel/debug/gpio` 获取。

<DocScope products="RDK S100">

以引脚 `sensor8_err` 为例。查 `drobot-s100-pinctrl.dtsi` 可知它对应的控制器是 `video_port0: gpio@360b0000`，offset 为 13。再查 `/sys/kernel/debug/gpio`，该控制器对应的 base 是 439。因此该引脚的 gpio-index 为：439 + 13 = 452。

</DocScope>
<DocScope products="RDK S600">

以引脚 `cam_sensor0_err` 为例。查 `drobot-s600-pinctrl.dtsi` 可知它对应的控制器是 `cam_port0: gpio@37130000`，offset 为 8。再查 `/sys/kernel/debug/gpio`，该控制器对应的 base 是 429。因此该引脚的 gpio-index 为：429 + 8 = 437。

</DocScope>

### 从设备树获取 offset

在控制器的 GPIO 功能引脚列表中，引脚的序号即其在列表中的位置（从 0 开始计数）。

<DocScope products="RDK S100">

`video_sensor8_err` 对应 `video_port0: gpio@360b0000` 这个控制器。在 `video_gpio` 的 pins 列表中，它从 0 起数是第 13 个（列表第 14 项），因此 offset 为 13。列表中首项 `video_gnss_int` 的 offset 为 0，其后依次递增。

```bash
pinctrl_video: pinctrl@36090000 {
   compatible = "drobot,s100-pinctrl";
   reg = <0x0 0x36090000 0x0 0x1000>,
         <0x0 0x360a0000 0x0 0x1000>;
   pctldev-name = "video";
   status = "okay";

   video_gpio: video_gpio_func {
      pinmux {
         function = "video_gpio";
         pins = "video_gnss_int", "video_peri_rsto",
                  "video_cam_pint", "video_sd_1v8", "video_sd_bus_pow",
                  "video_sensor0_err", "video_sensor1_err",
                  "video_sensor2_err", "video_sensor3_err", "video_sensor4_err",
                  "video_sensor5_err", "video_sensor6_err",
                  "video_sensor7_err", "video_sensor8_err",
                  "video_sensor9_err", "video_sensor10_err", "video_sensor11_err";
      };
      pinconf {
         pins = "video_gnss_int", "video_peri_rsto",
                  "video_cam_pint", "video_sd_1v8", "video_sd_bus_pow",
                  "video_sensor0_err", "video_sensor1_err",
                  "video_sensor2_err", "video_sensor3_err", "video_sensor4_err",
                  "video_sensor5_err", "video_sensor6_err",
                  "video_sensor7_err", "video_sensor8_err",
                  "video_sensor9_err", "video_sensor10_err", "video_sensor11_err";
         drive-strength = <1>;
      };
   };
}
```

</DocScope>

<DocScope products="RDK S600">

`cam_sensor0_err` 使用 `cam_lpwm2_dout0` 引脚，对应 `cam_port0: gpio@37130000` 这个控制器。在 `cam_gpio` 的 pins 列表中，它从 0 起数是第 8 个（列表第 9 项），因此 offset 为 8。

```bash
pinctrl_cam: pinctrl@37121000 {
   compatible = "drobot,s600-pinctrl";
   reg = <0x0 0x37121000 0x0 0x1000>,
         <0x0 0x37125000 0x0 0x1000>;
   pctldev-name = "cam";
   status = "okay";

   cam_gpio: cam_gpio_func {
      pinmux {
         function = "cam_gpio";
         pins = "cam_lpwm0_dout0", "cam_lpwm0_dout1",
                "cam_lpwm0_dout2", "cam_lpwm0_dout3", "cam_lpwm1_dout0",
                "cam_lpwm1_dout1", "cam_lpwm1_dout2",
                "cam_lpwm1_dout3", "cam_lpwm2_dout0", "cam_lpwm2_dout1",
                "cam_lpwm2_dout2", "cam_lpwm2_dout3", "cam_lpwm3_dout0",
                "cam_lpwm3_dout1", "cam_lpwm3_dout2",
                "cam_lpwm3_dout3";
      };
      pinconf {
         pins = "cam_lpwm0_dout0", "cam_lpwm0_dout1",
                "cam_lpwm0_dout2", "cam_lpwm0_dout3", "cam_lpwm1_dout0",
                "cam_lpwm1_dout1", "cam_lpwm1_dout2",
                "cam_lpwm1_dout3", "cam_lpwm2_dout0", "cam_lpwm2_dout1",
                "cam_lpwm2_dout2", "cam_lpwm2_dout3", "cam_lpwm3_dout0",
                "cam_lpwm3_dout1", "cam_lpwm3_dout2",
                "cam_lpwm3_dout3";
         drive-strength = <1>;
      };
   };

   cam_sensor0_err: cam_sensor0_err_func {
      pinmux {
         function = "cam_sensor0_err";
         pins = "cam_lpwm2_dout0";
      };
      pinconf {
         pins = "cam_lpwm2_dout0";
         drive-strength = <1>;
      };
   };
}
```

</DocScope>

## 常见问题

### GPIO 输出电平与预期不符

**原因**：方向未设置为 `out`、引脚复用未切换到 GPIO 功能，或计算得到的 `gpio-index` 有误。

**解决**：`cat /sys/kernel/debug/gpio` 查看当前使用状态，`echo out > direction` 设置方向。再按「计算 gpio-index」一节用 `kernel_index = base + offset` 重新核对索引。

### 读取 GPIO 值始终不变

**原因**：方向仍为 `out`（输出态读取的是输出电平），或引脚实际电平确实固定。

**解决**：`echo in > direction` 切换为输入后再读 `value`；仍不变则用万用表实测引脚电平。

## 相关文档

- [扩展引脚应用](/Demos/peripheral/40pin)
- [Pinctrl 调试指南](/Advanced_development/driver_development/driver_pinctrl_dev)
