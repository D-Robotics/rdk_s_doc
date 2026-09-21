---
sidebar_position: 6
title: "SPI 调试指南"
description: "SPI 调试指南"
---

# SPI 调试指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

SPI（Serial Peripheral Interface）是 RDK 开发板上常用的同步串行总线，通过 MOSI、MISO、SCLK 与片选（CS）在主机与从设备之间传输数据。Acore 侧基于 Hobot DesignWare SPI 控制器与 Linux SPI 子系统实现：内核提供 `spi_master`、总线驱动与外设 `spi_driver`；用户态可通过 `/dev/spidev*` 字符设备与 `spidev` 库或 `spidev_test` 工具访问总线。

**模块定位**：本文说明 RDK 平台 SPI 控制器的驱动代码路径、内核配置、设备树节点、Kernel 与用户态下的总线访问与回环验证方法，用于排查控制器未注册、速率/时序异常及外设通信故障。具体外设（传感器、Flash 等）的寄存器级驱动开发，请结合器件数据手册及对应专题文档。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要调试 SPI 驱动、设备树或 SPI 外设通信的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 Linux SPI 子系统与设备树（DTS）基础；若验证扩展口回环，请准备杜邦线/跳线帽短接 MISO 与 MOSI。

**与其他模块关系**：本驱动是用户态 SPI 应用（扩展引脚应用）与 `spidev` 的底层实现；引脚复用见「[Pinctrl 调试指南](./05_driver_pinctrl_dev.md)」；GPIO 模拟片选见「[GPIO 使用](./04_driver_gpio_dev.md)」；MCU 侧 SPI 见「[MCU SPI 使用指南](../11_mcu_development/06_mcu_spi.md)」。

<DocScope products="RDK S100">

用户态 40-pin 示例见 [SPI 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/06_spi.md)。

</DocScope>

<DocScope products="RDK S600">

用户态 14-pin SPI1 示例见 [SPI 应用（RDK S600）](../../03_Demos/01_peripheral/01_40pin/02_s600/04_spi.md)。

</DocScope>

### 硬件资源

Hobot DesignWare SPI 控制器（RDK S100/S600 Acore）具备以下能力：

- **片选**：每控制器最多 **2 路**硬件 CS（`num-cs = <2>`），亦可通过 `cs-gpios` 将部分 CS 映射到 GPIO
- **DMA**：经 PDMA 收发（DTS `dmas` / `dma-names`）
- **速率与时序**：`freq-pclk` 为控制器时钟；`spi-max-frequency` 限制外设速率；`sample-delay` 可调整接收采样延迟（见设备树说明）
- **参考速率**：SPI 时钟最高 **50 MHz**（`spi-max-frequency` / 驱动 `DW_SPI_MASTER_MAX_FREQ`）；有效吞吐约 **30 Mbps**，受系统负载影响，以实测为准

- **主从模式**：出厂 DTS 均按 SPI **Master** + `spidev` 配置；本文与 Demo 仅说明 Master 用法（`/dev/spidev*`）。

<DocScope products="RDK S100">

出厂内核 `drobot_s100_defconfig` **未启用** `CONFIG_SPI_SLAVE`。

</DocScope>

<DocScope products="RDK S600">

出厂内核 `drobot_s600_defconfig` **已启用** `CONFIG_SPI_SLAVE=y`，但出厂 DTS 仍为 Master（无 `spi-slave` 节点），RDK 未提供 Slave 侧配置与 Demo。

</DocScope>

<DocScope products="RDK S100">

S100 Acore 集成 **2 路** SPI 控制器（`spi0`、`spi1`）。

| 控制器 | DTS 节点 | 基地址 | pinctrl | 用户态节点（默认 DTS） | 典型用途 |
|---|---|---|---|---|---|
| SPI0 | `spi@39800000` | `0x39800000` | `peri_spi0` | `/dev/spidev0.0` | **40-pin** 扩展口（Pin 19/21/23/24/26），3.3 V |
| SPI1 | `spi@39810000` | `0x39810000` | `peri_spi1` | `/dev/spidev1.0` | 板载/扩展外设 |

SoC 默认 DTS 仅为每路控制器配置 `spidev@0`（`reg = <0>`），故出厂镜像通常出现 `/dev/spidev0.0` 与 `/dev/spidev1.0`。硬件虽支持 2 路 CS，若需用户态访问 **CS1**（如 40-pin Pin 26），须在板级 DTS 中额外添加 `spidev@1 { reg = <1>; }` 子节点。

40-pin **SPI0** 引脚对应关系：Pin **19** MOSI、**21** MISO、**23** SCLK、**24** CS0、**26** CS1。上述 **Pin 编号指 40-pin 扩展口物理脚位**，与 [Pinctrl 调试指南](./05_driver_pinctrl_dev.md) debugfs 中的「pin N」（SoC pad 编号，如 pin 21 = SPI0_MOSI）不是同一套编号。回环验证须短接 MISO 与 MOSI，详见 [SPI 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/06_spi.md)。

</DocScope>

<DocScope products="RDK S600">

S600 Acore 集成 **4 路** SPI 控制器（`spi0`～`spi3`）。

| 控制器 | DTS 节点 | 基地址 | 用户态节点 | 板级说明 |
|---|---|---|---|---|
| SPI0 | `spi@34900000` | `0x34900000` | `/dev/spidev0.0`（**不可外接**） | 与 **CAN0/CAN1** 复用引脚，物理线路接 CAN 收发器，勿接外部 SPI 设备 |
| SPI1 | `spi@34910000` | `0x34910000` | `/dev/spidev1.0`（overlay 后） | **14-pin** 自锁接口引出 **CS0**；须加载 overlay 并重启 |
| SPI2 | `spi@34920000` | `0x34920000` | — | 板级 `status = "disabled"`，未引出 |
| SPI3 | `spi@34930000` | `0x34930000` | — | 板级 `status = "disabled"`，未引出 |

:::info 备注

- S600 SPI 引脚电平为 **1.8 V**，外接器件须注意电平匹配。
- 板级 `rdk-s600-mcb.dtsi` 默认 `&spi1 { status = "disabled"; }`；SoC 中 `spi1` 的 `pinctrl-0` 与 **PCM1/I2S1** 复用同一组引脚，启用 14-pin SPI1 须加载 overlay 切换 pinmux（加载后会 `disabled` I2S1）。
- 14-pin 仅引出 **1 路片选**（CS0），对应 `/dev/spidev1.0`；控制器 `num-cs = 2` 为 IP 能力，第二路 CS 未在 14-pin 引出。
- **SPI1 overlay（`s600_v0p2_enable_spi1`）文件位置**——代码端与板端不同，勿混淆：
  - **代码端（S600 BSP/SDK）**：源文件 `${SDK}/source/hobot-io-samples/debian/boot/overlays/s600_v0p2_enable_spi1.dtso`；执行 `mk_debs.sh` 编译 `hobot-io-samples` 时在同目录由 `.dtso` 生成 `s600_v0p2_enable_spi1.dtbo` 并打入 deb。**定制 pinmux 时改的是 SDK 中的 `.dtso`，不是板级主 DTS。**
  - **板端（RDK OS 运行时）**：安装 `hobot-io-samples` deb 后，二进制位于 `/boot/overlays/s600_v0p2_enable_spi1.dtbo`（由镜像/包管理安装，不在 SDK 源码树内）。
  - **启用**：编辑板端 `/boot/config.txt`，写入 `dtbo_file_path=/overlays/s600_v0p2_enable_spi1.dtbo` 并重启（`config.txt` 中为相对 `/boot` 的启动加载路径；完整路径即 `/boot/overlays/s600_v0p2_enable_spi1.dtbo`，可用 `ls` 确认已安装）。
- 使能与回环步骤见 [SPI 应用（RDK S600）](../../03_Demos/01_peripheral/01_40pin/02_s600/04_spi.md)。

:::

</DocScope>

## 驱动代码

Hobot SPI 驱动位于 `hobot-drivers/spi/` 目录，基于 DesignWare IP 实现，并接入 Linux SPI 框架与 `spidev` 字符设备。

```bash
hobot-drivers/spi/spi_drv/spi-dw.c           # SPI 驱动核心
hobot-drivers/spi/spi_drv/spi-dw-mmio.c      # MMIO 平台接入
hobot-drivers/spi/spi_drv/spi-dw-mmio-dma.c  # PDMA 传输
kernel/drivers/spi/spi.c                     # SPI 框架
kernel/drivers/spi/spidev.c                  # 用户态 spidev 字符设备
kernel/tools/spi/spidev_test.c               # 开源测试工具源码
```

控制器 `compatible` 为 `"hobot,hb-dw-spi"`。

### 软件架构

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/image-spi_software.png" alt="SPI 软件架构图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

从下到上分为硬件 IP 层、内核层与用户空间层：

- **硬件 IP 层**：DesignWare SPI 控制器。
- **内核层**：
  - **SPI driver 层**：实现对 SPI 硬件 IP 的操作，并实现 SPI framework 定义的接口。
  - **SPI framework 层**：SPI driver 的适配层，对下定义 driver 需实现的接口，对上提供通用 API。
  - **SPI 字符设备层**：`spidev` 为用户空间提供 `/dev/spidev*` 节点。
- **用户空间**：应用程序或 `spidev_test` / Python `spidev` 通过字符设备与内核交换数据。

### 内核配置

<DocScope products="RDK S100">
配置文件路径：`hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
配置文件路径：`hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>

```bash
CONFIG_SPI=y                    # Linux SPI 子系统
CONFIG_SPI_SPIDEV=m             # 用户态 spidev 字符设备
CONFIG_HOBOT_SPI_DRIVER=m       # Hobot DesignWare SPI 驱动
CONFIG_HOBOT_SPI_MMIO=y         # MMIO 平台驱动
CONFIG_HOBOT_SPI_MMIO_DMA=y     # PDMA 支持
```

<DocScope products="RDK S600">

```bash
CONFIG_SPI_SLAVE=y              # SPI Slave 框架
```

</DocScope>

## 设备树配置

SPI 控制器节点定义在 SoC DTS 中；板级可通过 `spidev@N` 子节点暴露用户态设备，或通过 `cs-gpios` 将片选映射到 GPIO。

<DocScope products="RDK S100">

相关 DTS 文件：

- `hobot-drivers/kernel-dts/drobot-s100-soc.dtsi` — SPI 控制器节点
- `hobot-drivers/kernel-dts/drobot-s100-pinctrl.dtsi` — pinctrl
- `hobot-drivers/kernel-dts/drobot-s100-pdma.dtsi` — PDMA 通道

**spi0 控制器示例：**

```dts
spi0: spi@39800000 {
	compatible = "hobot,hb-dw-spi";
	reg-io-width = <4>;
	#address-cells = <1>;
	#size-cells = <0>;
	reg = <0x0 0x39800000 0x0 0x1000>;
	interrupts = <GIC_SPI PERISYS_SPI0_SSI_INTR PERISYS_SPI0_SSI_INTR_TRIG_TYPE>;
	status = "okay";
	num-cs = <2>;
	resets = <&smc_reset RST_IDX_IP_PERI_SPIM0>,
				<&smc_reset RST_IDX_IP_PERI_SPIM0_APB>;
	reset-names = "spi_reset";
	clocks = <&scmi_smc_clk CLK_IDX_TOP_PERI_SPI_M0>;
	clock-names = "spi_pclk";
	power-domains = <&scmi_smc_pd PD_IDX_LSPERI_TOP>;
	freq-pclk = <200000000>;
	sample-delay = <1>;
	pinctrl-names = "default";
	pinctrl-0 = <&peri_spi0>;
	dmas = <&pdma0 8			/* read channel */
			&pdma0 9	>;		/* write channel */
	dma-names = "rx", "tx";
	spidev@0 {
		compatible = "rohm,dh2228fv";
		spi-max-frequency = <50000000>;
		reg = <0>;
	};
};
```

**spi1 控制器示例：**

```dts
spi1: spi@39810000 {
	compatible = "hobot,hb-dw-spi";
	reg-io-width = <4>;
	#address-cells = <1>;
	#size-cells = <0>;
	reg = <0x0 0x39810000 0x0 0x1000>;
	interrupts = <GIC_SPI PERISYS_SPI1_SSI_INTR PERISYS_SPI1_SSI_INTR_TRIG_TYPE>;
	status = "okay";
	num-cs = <2>;
	resets = <&smc_reset RST_IDX_IP_PERI_SPIM1>,
				<&smc_reset RST_IDX_IP_PERI_SPIM1_APB>;
	reset-names = "spi_reset";
	clocks = <&scmi_smc_clk CLK_IDX_TOP_PERI_SPI_M1>;
	clock-names = "spi_pclk";
	power-domains = <&scmi_smc_pd PD_IDX_LSPERI_TOP>;
	freq-pclk = <200000000>;
	sample-delay = <1>;
	pinctrl-names = "default";
	pinctrl-0 = <&peri_spi1>;
	dmas = <&pdma0 10			/* read channel */
			&pdma0 11	>;		/* write channel */
	dma-names = "rx", "tx";
	spidev@0 {
		compatible = "rohm,dh2228fv";
		spi-max-frequency = <50000000>;
		reg = <0>;
	};
};
```

出厂 SoC DTS 仅含 `spidev@0`。若需用户态访问 CS1，在对应控制器下增加：

```dts
spidev@1 {
	compatible = "rohm,dh2228fv";
	spi-max-frequency = <50000000>;
	reg = <1>;
};
```

</DocScope>

<DocScope products="RDK S600">

相关 DTS 文件：

- `hobot-drivers/kernel-dts/drobot-s600-soc.dtsi`
- `hobot-drivers/kernel-dts/drobot-s600-pinctrl.dtsi`
- `hobot-drivers/kernel-dts/drobot-s600-pdma.dtsi`

**spi0 控制器示例：**

```dts
spi0: spi@34900000 {
	compatible = "hobot,hb-dw-spi";
	reg-io-width = <4>;
	#address-cells = <1>;
	#size-cells = <0>;
	reg = <0x0 0x34900000 0x0 0x1000>;
	interrupts = <GIC_SPI  HSISYS_SPI0_SSI_INTR  IRQ_TYPE_LEVEL_HIGH>;
	status = "okay";
	num-cs = <2>;
	//resets = <&smc_reset 0>,
	//			<&smc_reset 0>;
	//reset-names = "spi_reset";
	//clocks = <&scmi_smc_0>;
	//clock-names = "spi_pclk";
	//power-domains = <&scmi_smc_pd 0>;
	freq-pclk = <200000000>;
	sample-delay = <1>;
	pinctrl-names = "default";
	pinctrl-0 = <&hsi_spi0_csn0_spi0_csn0 &hsi_spi0_mosi_spi0_mosi\
			&hsi_spi0_miso_spi0_miso &hsi_spi0_sclk_spi0_sclk>;
	dmas = <&pdma0 16            /* read channel */
				&pdma0 17    >;      /* write channel */
	dma-names = "rx", "tx";
	spidev@0 {
		compatible = "rohm,dh2228fv";
		spi-max-frequency = <50000000>;
		reg = <0>;
	};
};

spi1: spi@34910000 {
	compatible = "hobot,hb-dw-spi";
	reg-io-width = <4>;
	#address-cells = <1>;
	#size-cells = <0>;
	reg = <0x0 0x34910000 0x0 0x1000>;
	interrupts = <GIC_SPI  HSISYS_SPI1_SSI_INTR  IRQ_TYPE_LEVEL_HIGH>;
	status = "okay";
	num-cs = <2>;
	//resets = <&smc_reset 0>,
	//			<&smc_reset 0>;
	//reset-names = "spi_reset";
	//clocks = <&scmi_smc_clk 0>;
	//clock-names = "spi_pclk";
	//power-domains = <&scmi_smc_pd 0>;
	freq-pclk = <200000000>;
	sample-delay = <1>;
	pinctrl-names = "default";
	pinctrl-0 = <&hsi_spi1_csn0_pcm1_bclk &hsi_spi1_mosi_pcm1_fsync
				 &hsi_spi1_miso_pcm1_data0 &hsi_spi1_sclk_pcm1_data1>;

	dmas = <&pdma0 18			/* read channel */
			&pdma0 19	>;		/* write channel */
	dma-names = "rx", "tx";
	spidev@0 {
		compatible = "rohm,dh2228fv";
		spi-max-frequency = <50000000>;
		reg = <0>;
	};
};

spi2: spi@34920000 {
	compatible = "hobot,hb-dw-spi";
	reg-io-width = <4>;
	#address-cells = <1>;
	#size-cells = <0>;
	reg = <0x0 0x34920000 0x0 0x1000>;
	interrupts = <GIC_SPI HSISYS_SPI2_SSI_INTR IRQ_TYPE_LEVEL_HIGH>;
	status = "okay";
	num-cs = <2>;
	//resets = <&smc_reset 0>,
	//			<&smc_reset 0>;
	//reset-names = "spi_reset";
	//clocks = <&scmi_smc_clk 0>;
	//clock-names = "spi_pclk";
	//power-domains = <&scmi_smc_pd 0>;
	freq-pclk = <200000000>;
	sample-delay = <1>;
	pinctrl-names = "default";
	pinctrl-0 = <&hsi_spi2_csn0_pcm2_bclk &hsi_spi2_mosi_pcm2_fsync
				 &hsi_spi2_miso_pcm2_data0 &hsi_spi2_sclk_pcm2_data1>;
	dmas = <&pdma0 20			/* read channel */
			&pdma0 21	>;		/* write channel */
	dma-names = "rx", "tx";
	spidev@0 {
		compatible = "rohm,dh2228fv";
		spi-max-frequency = <50000000>;
		reg = <0>;
	};
};

spi3: spi@34930000 {
	compatible = "hobot,hb-dw-spi";
	reg-io-width = <4>;
	#address-cells = <1>;
	#size-cells = <0>;
	reg = <0x0 0x34930000 0x0 0x1000>;
	interrupts = <GIC_SPI HSISYS_SPI3_SSI_INTR IRQ_TYPE_LEVEL_HIGH>;
	status = "okay";
	num-cs = <2>;
	//resets = <&smc_reset 0>,
	//			<&smc_reset 0>;
	//reset-names = "spi_reset";
	//clocks = <&scmi_smc_clk 0>;
	//clock-names = "spi_pclk";
	//power-domains = <&scmi_smc_pd 0>;
	freq-pclk = <200000000>;
	sample-delay = <1>;
	//pinctrl-names = "default";
	//pinctrl-0 = <&hsi_spi3>;
	dmas = <&pdma0 22			/* read channel */
			&pdma0 23	>;		/* write channel */
	dma-names = "rx", "tx";
	spidev@0 {
		compatible = "rohm,dh2228fv";
		spi-max-frequency = <50000000>;
		reg = <0>;
	};
};
```

SoC 中 `spi1` 默认 `pinctrl-0` 绑定 **PCM1** 复用组（见上例）；RDK 板级默认关闭 `spi1` 并启用 I2S1。14-pin **SPI1** 不在主设备树中直接使能，须加载 overlay：**源文件在 SDK**（`${SDK}/source/hobot-io-samples/debian/boot/overlays/s600_v0p2_enable_spi1.dtso`），**运行时二进制在板端** `/boot/overlays/s600_v0p2_enable_spi1.dtbo`（`hobot-io-samples` 包安装）；`spi2`/`spi3` 在板级 DTS 中为 `status = "disabled"`。

</DocScope>

关键属性说明：

| 属性 | 说明 |
|---|---|
| `freq-pclk` | SPI 控制器工作时钟（Hz） |
| `spi-max-frequency` | 外设子节点允许的最大 SPI 时钟 |
| `sample-delay` | Master 接收采样延迟；出现 data bit 错位时可调整 |
| `num-cs` | 硬件 CS 个数，Master 模式最多 2 路 |
| `dmas` / `dma-names` | PDMA 收发通道 |
| `cs-gpios` | 将指定 CS 映射到 GPIO（见下文） |

### 配置 GPIO 片选（cs-gpios）

以 spi0 的 CS1 为例，在设备树中为 `spi0` 节点添加 `cs-gpios`，将 CS1 映射到指定 GPIO：

```dts
spi0: spi@39800000 {
	...
	pinctrl-0 = <&peri_spi0>;
	cs-gpios = <0>,                                    /* CS0：SPI 控制器原生控制 */
			<&peri_port0 18 GPIO_ACTIVE_LOW>;       /* CS1：GPIO 模拟 */
	...
};
```

:::tip

各 SPI 片选引脚对应的 GPIO 编号见下表，可直接填入 `cs-gpios`。若 CS 改由 GPIO 控制，须在 `drobot-*-pinctrl.dtsi` 的 `peri_spi0`（或对应 pinctrl 组）中**移除**该 CS 引脚的 pinmux/pinconf，避免与 GPIO 配置冲突。

:::

<DocScope products="RDK S100">

| 引脚 | GPIO | 设备树 |
|---|---|---|
| SPI0_CSN0 | GPIO0[17] | `<&peri_port0 17>` |
| SPI0_CSN1 | GPIO0[18] | `<&peri_port0 18>` |
| SPI1_CSN0 | GPIO0[22] | `<&peri_port0 22>` |
| SPI1_CSN1 | GPIO0[23] | `<&peri_port0 23>` |

`peri_spi0_1cs`（仅保留 CS0）pinctrl 示例（摘自 `drobot-s100-pinctrl.dtsi`）：

```dts
peri_spi0_1cs: peri_spi0_1cs_func {
	pinmux {
		function = "peri_spi0";
		pins = "peri_spi0_csn0", "peri_spi0_mosi",
		       "peri_spi0_miso", "peri_spi0_sclk";
	};
	pinconf {
		pins = "peri_spi0_csn0", "peri_spi0_mosi",
		       "peri_spi0_miso", "peri_spi0_sclk";
		drive-strength = <1>;
	};
};
```

</DocScope>

<DocScope products="RDK S600">

| 引脚 | GPIO | 设备树 |
|---|---|---|
| SPI0_CSN0 | GPIO1[30] | `<&hsi_port1 30>` |
| SPI0_CSN1 | GPIO1[31] | `<&hsi_port1 31>` |
| SPI1_CSN0 | GPIO1[10] | `<&hsi_port1 10>` |
| SPI1_CSN1 | GPIO1[20] | `<&hsi_port1 20>` |
| SPI2_CSN0 | GPIO1[16] | `<&hsi_port1 16>` |
| SPI2_CSN1 | GPIO0[30] | `<&hsi_port0 30>` |
| SPI3_CSN0 | GPIO1[0]  | `<&hsi_port1 0>`  |
| SPI3_CSN1 | GPIO0[31] | `<&hsi_port0 31>` |

</DocScope>

## 功能使用

### Kernel 阶段

内核加载 Hobot SPI 驱动并为 DTS 中使能的 `spidev` 子节点创建字符设备。

**检查 spidev 节点：**

<DocScope products="RDK S100">

```bash
root@ubuntu:~# ls /dev/spidev*
/dev/spidev0.0  /dev/spidev1.0
```

40-pin 回环测试使用 **SPI0**（`bus 0`）、片选 `0`（`/dev/spidev0.0`）。默认 DTS 仅注册 CS0；若板级已添加 `spidev@1`，还会出现 `/dev/spidev0.1` 供 CS1（40-pin Pin 26）使用。

</DocScope>

<DocScope products="RDK S600">

未加载 SPI1 overlay 时，可能仅见 `/dev/spidev0.0`——该节点对应 SPI0，**引脚接 CAN 收发器，不可用于外接 SPI**。启用 14-pin **SPI1** 步骤：

1. 确认板端已安装 overlay 文件：`ls /boot/overlays/s600_v0p2_enable_spi1.dtbo`（来自 `hobot-io-samples` 包）
2. 在 `/boot/config.txt` 写入并重启：

```text
dtbo_file_path=/overlays/s600_v0p2_enable_spi1.dtbo
```

验收：

```bash
ls /boot/overlays/s600_v0p2_enable_spi1.dtbo
ls /dev/spidev*
dmesg | grep -i spi1
```

重启后应出现 `/dev/spidev1.0`（及可能仍存在的 `/dev/spidev0.0`）。用户态回环请使用 **SPI1** / `bus 1` / `cs 0`。完整步骤见 [SPI 应用（RDK S600）](../../03_Demos/01_peripheral/01_40pin/02_s600/04_spi.md)。

</DocScope>

### 用户态使用

用户态通过 `/dev/spidevB.C`（B=总线号，C=片选号）访问 SPI，或使用内核自带的 `spidev_test` 工具。Python 侧可使用 `spidev` 库，板端示例见下文「示例使用」。

#### spidev_test 工具

`spidev_test` 为 Linux 源码自带工具，路径：`kernel/tools/spi/spidev_test.c`，交叉编译后可在板端使用。

```bash
root@ubuntu:/map# ./spidev_test -h
./spidev_test: invalid option -- 'h'
Usage: ./spidev_test [-DsbdlHOLC3vpNR24SI]
   -D --device   device to use (default /dev/spidev1.1)
   -s --speed    max speed (Hz)
   -d --delay    delay (usec)
   -b --bpw      bits per word
   -i --input    input data from a file (e.g. "test.bin")
   -o --output   output data to a file (e.g. "results.bin")
   -l --loop     loopback
   -H --cpha     clock phase
   -O --cpol     clock polarity
   -L --lsb      least significant bit first
   -C --cs-high  chip select active high
   -3 --3wire    SI/SO signals shared
   -v --verbose  Verbose (show tx buffer)
   -p            Send data (e.g. "1234\xde\xad")
   -N --no-cs    no chip select
   -R --ready    slave pulls low to pause
   -2 --dual     dual transfer
   -4 --quad     quad transfer
   -8 --octal    octal transfer
   -S --size     transfer size
   -I --iter     iterations
```

#### 内部回环测试

仅 SPI Master 支持：硬件将 TX FIFO 数据环回到 RX FIFO（`-l` 参数），无需外接线。

<DocScope products="RDK S100">

```bash
root@ubuntu:/map# ./spidev_test -D /dev/spidev0.0 -s 1000000 -S 100 -l -v -p "\x01\x02\x03\x04"
spi mode: 0x20
bits per word: 8
max speed: 1000000 Hz (1000 kHz)
TX | 01 02 03 04 __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __  |....|
RX | 01 02 03 04 __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __  |....|
```

</DocScope>

<DocScope products="RDK S600">

```bash
root@ubuntu:/map# ./spidev_test -D /dev/spidev1.0 -s 1000000 -S 100 -l -v -p "\x01\x02\x03\x04"
spi mode: 0x20
bits per word: 8
max speed: 1000000 Hz (1000 kHz)
TX | 01 02 03 04 __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __  |....|
RX | 01 02 03 04 __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __  |....|
```

须先加载 SPI1 overlay；勿对 `/dev/spidev0.0` 做板级引脚相关测试。

</DocScope>

#### 外部回环测试

<DocScope products="RDK S100">

SPI Master 连接外部 SPI Slave，或由 **MISO 与 MOSI 短接**模拟回环（与 `test_spi.py` 相同）。

```bash
root@ubuntu:/map# ./spidev_test -D /dev/spidev0.0 -s 1000000 -S 100  -v -p "\x01\x02\x03\x04"
spi mode: 0x0
bits per word: 8
max speed: 1000000 Hz (1000 kHz)
TX | 01 02 03 04 __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __  |....|
RX | FF FF FF FF __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __  |....|
```

在 Slave 设备侧将收到 S100侧 Master 发送的数据。

**注：在进行外部回环测试时，需要先执行 SPI Slave 程序，再执行 SPI Master 程序。假如先执行 SPI Master 程序，后执行 SPI Slave 程序，可能会由于 Master 与 Slave 不同步导致 SPI 接收数据出现丢失。**

</DocScope>

<DocScope products="RDK S600">

SPI0 引脚接 CAN 收发器，无法外接 SPI 线；外部回环须在 **14-pin SPI1**（overlay 后）上将 MISO/MOSI 短接，使用 `spidev1.0`，见「示例使用」。

</DocScope>

<DocScope products="RDK S100">

#### 示例使用

40-pin **SPI0** 回环：短接 MISO（Pin 21）与 MOSI（Pin 19）后运行板端脚本：

```bash
cd /app/40pin_samples
python3 test_spi.py
```

交互输入 `bus 0`、`cs 0`，短接正确时应持续打印 `0x55 0xAA`。默认 DTS 仅注册 CS0；使用 CS1 前须在板级 DTS 添加 `spidev@1`。接线与参数见 [SPI 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/06_spi.md)。

</DocScope>

<DocScope products="RDK S600">

#### 示例使用

在板端配置 `/boot/config.txt` 加载 `/boot/overlays/s600_v0p2_enable_spi1.dtbo` 并重启后，短接 SPI1 的 MISO/MOSI，运行：

```bash
python3 /app/40pin_samples/test_spi.py
```

选择 `bus 1`、`cs 0`（对应 `/dev/spidev1.0`），成功时打印 `0x55 0xAA`。详见 [SPI 应用（RDK S600）](../../03_Demos/01_peripheral/01_40pin/02_s600/04_spi.md)。

</DocScope>

## 调试

### 确认驱动与设备节点

```bash
lsmod | grep -i spi
ls /dev/spidev*
dmesg | grep -i spi
```

节点缺失时检查 DTS 中控制器 `status = "okay"` 及 `spidev@N` 子节点是否存在；亦可查看 `ls /sys/bus/spi/devices/`。S600 SPI1 还须确认 `/boot/overlays/s600_v0p2_enable_spi1.dtbo` 已安装，且 `/boot/config.txt` 已配置 `dtbo_file_path` 并重启。

### 查看引脚复用

若 `spidev` 打开成功但无波形或数据异常，检查 SPI 引脚是否复用为 `peri_spi*` / `hsi_spi*`：

```bash
cat /sys/kernel/debug/pinctrl/*/pinmux-pins | grep -i spi
```

### 调整 sample-delay

接收数据 bit 错位时，可在对应 SPI 控制器节点增大或减小 `sample-delay`，重新编译设备树并烧录后复测。

## 常见问题

### open spi failed 或找不到 spidev 节点

**原因**：控制器未使能、总线/片选号错误、DTS 未注册对应 `spidev@N`，或 S600 未加载 SPI1 overlay。

**解决**：`ls /dev/spidev*` 确认节点。S100 40-pin 回环使用 `spidev0.0`（`bus 0` / `cs 0`）；访问 CS1 须板级添加 `spidev@1`。S600 14-pin 使用 `spidev1.0`（`bus 1` / `cs 0`），须配置 `dtbo_file_path` 并重启；勿将 `/dev/spidev0.0` 当作外接 SPI 使用。

### SPI 外部回环测试时接收数据丢失

**原因**：先执行了 Master、后执行 Slave，主从不同步。

**解决**：外部 Master/Slave 联调时先启动 Slave，再执行 Master；MISO/MOSI 短接回环无此顺序要求。

### SPI 测试出现 FIFO overrun/underrun

**原因**：通信速率过高，超出系统实际处理能力。

**解决**：降低 `-s` 速率重试；时钟上限 50 MHz，有效吞吐约 30 Mbps，以实测为准。

### 读回数据与发送不一致（短接回环）

**原因**：MISO 与 MOSI 未短接，MISO 浮空常为 `0xFF`。

**解决**：按 Demo 文档短接后重试；`test_spi.py` 成功时应为 `0x55 0xAA`。

<DocScope products="RDK S600">

### SPI0 无法接外部设备

**原因**：SPI0 与 CAN0/CAN1 复用，板级线路接 CAN 收发器；SoC DTS 虽可能创建 `/dev/spidev0.0`，但引脚未接到 14-pin 扩展口。

**解决**：使用 14-pin 引出的 **SPI1**（`/dev/spidev1.0`）。先在板端确认 `/boot/overlays/s600_v0p2_enable_spi1.dtbo` 已安装（来自 `hobot-io-samples` 包），并在 `/boot/config.txt` 配置 `dtbo_file_path` 后重启；勿在 SPI0 引脚或 `spidev0.0` 上接外部 SPI 从设备。

</DocScope>

## 相关文档

- [GPIO 使用](./04_driver_gpio_dev.md)
- [Pinctrl 调试指南](./05_driver_pinctrl_dev.md)
- [MCU SPI 使用指南](../11_mcu_development/06_mcu_spi.md)

<DocScope products="RDK S100">

- [SPI 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/06_spi.md)

</DocScope>

<DocScope products="RDK S600">

- [SPI 应用（RDK S600）](../../03_Demos/01_peripheral/01_40pin/02_s600/04_spi.md)

</DocScope>
