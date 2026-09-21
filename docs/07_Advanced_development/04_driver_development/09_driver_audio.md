---
sidebar_position: 9
title: "音频调试指南"
description: "音频调试指南"
---

# 音频调试指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

音频子系统基于 Linux **ALSA**（Advanced Linux Sound Architecture）框架。RDK Acore 侧由 Hobot **Super Audio** 驱动栈接入 SoC **I2S/PCM** 控制器，经设备树将 CPU DAI、Codec DAI、Platform（PDMA）与 Sound Card 绑定为完整声卡，用户态通过 `/dev/snd/*` 与 `arecord`/`aplay`/`amixer` 访问。

**模块定位**：本文说明 RDK 平台 I2S 声卡驱动路径、内核配置、设备树节点、Kernel 与用户态下的录音/播放使用方法及 ALSA 调试方法，用于排查声卡未注册、Codec 不通、采样参数不匹配与 xrun 等问题。PulseAudio/PipeWire 等用户态音频服务配置见系统配置文档；应用层命令示例见 [音频应用](../../03_Demos/01_peripheral/03_audio.md)。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要移植 Codec、定制声卡 DTS 或调试音频通路的 BSP/驱动工程师。

**前置条件**：已烧录 RDK OS 并可登录板端；了解 ALSA 与设备树基础；已接入音频子板、USB 声卡或对应 I2S 外设。

**与其他模块关系**：Codec 控制总线多为 I2C，见「[I2C 调试指南](./03_driver_i2c_dev.md)」；PCM 引脚复用见「[Pinctrl 调试指南](./05_driver_pinctrl_dev.md)」；系统输出设备选择见「[音频配置](../../02_System_configuration/10_audio_output.md)」。

<DocScope products="RDK S100">

用户态录音/播放示例见 [音频应用](../../03_Demos/01_peripheral/03_audio.md)。

</DocScope>

<DocScope products="RDK S600">

用户态 USB 声卡与 14-pin I2S 示例见 [音频应用](../../03_Demos/01_peripheral/03_audio.md)。

</DocScope>

### 硬件资源

ALSA 声卡由以下四部分构成：

| 组件 | 说明 |
|---|---|
| **CPU DAI** | SoC 侧 I2S/PCM 接口驱动（`hobot_cpudai_super`） |
| **Codec DAI** | 外接 Codec 芯片驱动（如 `snd-soc-es7210`、`snd-soc-es8156`） |
| **Platform** | PDMA 传输驱动（合入 `hobot_cpudai_super`） |
| **Sound Card** | 绑定 CPU/Codec 的声卡驱动（如 `hobot_snd_super_ac_fdx_host`） |

**I2S 控制器硬件规格（SoC IP）**：

- **通道**：支持 1 / 2 / 4 / 8 / 16 通道
- **采样率**：8 kHz、16 kHz、32 kHz、44.1 kHz、48 kHz、96 kHz、192 kHz
- **采样精度**：8 / 16 / 24 / 32 bit
- **传输协议**：I2S、DSP（TDM）
- **主从模式**：可配置 Master 或 Slave
- **时钟关系**：I2S 模块 `sysclk` 须为 `bclk` 的 **6 倍及以上**
- **全双工**：支持全双工；全双工时 **SDIO0 为输入、SDIO1 为输出**，不可对调
- **bclk 上限**：输出不超过 **25 MHz**

**驱动已注册能力**（`hobot-cpudai-super.c` / `hobot-i2s-super.h`；`arecord`/`aplay` 实际可选 PCM 参数以此为准）：

- **通道**：1～16（`HOBOT_I2S_CHANNEL_MAX`）
- **采样率**：8 kHz～192 kHz（`SNDRV_PCM_RATE_8000_192000`）
- **采样格式**：S8、S16_LE、S24_3LE、S24_LE、S32_LE（`HOBOT_I2S_FMTS`）
- **帧格式**：DTS `i2s_mode` 常用 `1`（I2S）或 `7`（DSP_A）；`dai-format` 对应 `"i2s"` / `"dsp_a"`
- **双工模式**：I2S / 声卡节点 `work_mode`：`0` 半双工、`1` 全双工
- **PDMA 对齐**：传输长度按 **8 字节**对齐（`HOBOT_PDMA_ALIGN`）；配置 `period-size` 时须满足对齐

<DocScope products="RDK S100">

S100 SoC 提供 **I2S0**、**I2S1** 两路控制器；RDK 板级音频子板方案使用 **I2S0**（`peri_pcm0`）配合 **I2C5** 上的 ES7210/ES8156。

| 组件 | DTS 节点 | 基地址 | 控制/数据 | 说明 |
|---|---|---|---|---|
| I2S0 | `i2s@39480000` | `0x39480000` | `peri_pcm0` | 接 Audio HAT；`work_mode = <1>` 全双工 |
| I2S1 | `i2s@39490000` | `0x39490000` | `peri_pcm1` | SoC 默认使能；板级 HAT 方案未使用 |
| Codec（录音） | `es7210_0@40` | — | **I2C5** `0x40` / `0x42` | 2× ES7210，8 路 ADC |
| Codec（播放） | `es8156@8` | — | **I2C5** `0x08` | ES8156 DAC |
| 声卡 | `snd2` | — | `model = "s100snd2"` | `compatible = "hobot, super-snd-ac-fdx-master"` |

**40-pin PCM 与 Wi-Fi 复用**：扩展口 PCM 引脚（SoC `peri_pcm0`，pinctrl pin 35～39）与 PCIe Wi-Fi 模组复用，使用 Audio Driver HAT 时须将拨码切至 **PCM**（40 PIN 拨码左拨、PCM 拨码右拨），详见 [音频子板与开发板连接](#音频子板与开发板连接)。

出厂 SoC DTS 中 `snd2` 为 `status = "okay"`，但声卡相关内核模块**默认不随开机自动加载**；须 `modprobe` 后才会出现 `/dev/snd/*`（见「功能使用」）。

</DocScope>

<DocScope products="RDK S600">

S600 SoC 提供 **I2S0～I2S3** 四路控制器；RDK 板级默认使能 **I2S1**、**I2S2**（`hsi_pcm1` / `hsi_pcm2`），Codec 挂在 **I2C7**。

| 组件 | DTS 节点 | 基地址 | 板级状态 | 说明 |
|---|---|---|---|---|
| I2S0 | `i2s@34852000` | `0x34852000` | disabled | `hsi_pcm0` |
| I2S1 | `i2s@34853000` | `0x34853000` | SoC disabled；板级 okay | 14-pin I2S / `snd2` 录音+播放 CPU 侧 |
| I2S2 | `i2s@34854000` | `0x34854000` | SoC okay；板级配置 pinctrl | `snd3` 播放链路 CPU 侧 |
| I2S3 | `i2s@34855000` | `0x34855000` | disabled | `hsi_pcm3` |
| Codec | `es7210_0@40` 等 | — | **I2C7** `0x40`/`0x42`/`0x08` | 与 S100 同类 ES7210×2 + ES8156 |
| 声卡 `snd2` | — | — | okay | `model = "s600snd2"`，I2S1 全双工 |
| 声卡 `snd3` | — | — | okay | `model = "s600snd3"`，I2S1 录 + I2S2 放（半双工 `work_mode`） |

:::info 备注

- RDK S600 **出厂未接板载 Codec 时**，`arecord -l` / `aplay -l` 会提示 `no soundcards found...`；可接 **USB 声卡**（`CONFIG_SND_USB_AUDIO`）或经 **14-pin** 连接 I2S 音频子板。
- **I2S1 与 SPI1** 共用 `hsi_pcm1` 引脚组，启用 SPI1 overlay 可能与 I2S 音频冲突，见 [SPI 调试指南](./07_driver_spi_dev.md)。
- 14-pin I2S 接口 IO 为 **1.8 V**，外接 3.3 V 子板须电平转换；Audio HAT 接线见 [音频子板与开发板连接（S600）](#s600-音频子板与开发板连接)。

:::

</DocScope>

## 驱动代码

Hobot 音频驱动位于 `hobot-drivers/sound/soc/` 目录：

```bash
hobot-drivers/sound/soc/hobot/hobot-cpudai-super.c           # CPU DAI
hobot-drivers/sound/soc/hobot/hobot-audio-driver.c           # 音频驱动公共层
hobot-drivers/sound/soc/hobot/hobot-i2s-super.c              # I2S 控制器
hobot-drivers/sound/soc/hobot/hobot-i2s-dma-super.c          # I2S DMA
hobot-drivers/sound/soc/hobot/hobot-platform-super.c         # Platform（PDMA）
hobot-drivers/sound/soc/hobot/hobot-snd-super-ac-fdx-host.c  # 全双工声卡 snd2（模块 hobot_snd_super_ac_fdx_host）
hobot-drivers/sound/soc/hobot/hobot-snd-super-loop.c         # 环回声卡 snd_loop
hobot-drivers/sound/soc/codecs/es7210.c                      # ES7210 Codec（模块 snd-soc-es7210）
hobot-drivers/sound/soc/codecs/es8156.c                      # ES8156 Codec（模块 snd-soc-es8156）
hobot-drivers/sound/soc/codecs/dummy_codec.c                 # dummy codec
kernel/sound/soc/soc-core.c                                  # ASoC 框架
```

`hobot_cpudai_super` 模块由 `hobot-cpudai-super.o`、`hobot-audio-driver.o`、`hobot-i2s-super.o`、`hobot-i2s-dma-super.o`、`hobot-platform-super.o` 链接而成（见 `hobot-drivers/sound/soc/hobot/Makefile`）。

### 内核配置

<DocScope products="RDK S100">
配置文件路径：`hobot-drivers/configs/drobot_s100_defconfig`
</DocScope>
<DocScope products="RDK S600">
配置文件路径：`hobot-drivers/configs/drobot_s600_defconfig`
</DocScope>

```bash
CONFIG_SND_SOC=m                  # ASoC 框架
CONFIG_HOBOT_SUPER_AUDIO=m        # CPU DAI / I2S / Platform
CONFIG_HOBOT_AC_SND=m             # AC 系列声卡驱动
CONFIG_SND_SOC_ES7210=m           # ES7210 Codec
CONFIG_SND_SOC_ES8156=m           # ES8156 Codec
CONFIG_SND_SOC_DUMMY_CODEC=m      # dummy codec（环回测试）
```

<DocScope products="RDK S600">

```bash
CONFIG_SND_USB_AUDIO=m            # USB 声卡（UAC）
```

</DocScope>

对应内核模块（须按下列顺序手动加载，步骤见「功能使用」）：

| 模块名 | 说明 |
|---|---|
| `hobot_cpudai_super` | CPU DAI + I2S + PDMA |
| `snd-soc-es7210` | ES7210 Codec |
| `snd-soc-es8156` | ES8156 Codec |
| `hobot_snd_super_ac_fdx_host` | 全双工声卡 `snd2`（`s100snd2` / `s600snd2`） |

## 设备树配置

声卡节点定义在 SoC DTS（`drobot-s100-soc.dtsi` / `drobot-s600-soc.dtsi`）；Codec 挂在 I2C 控制器子节点；板级 DTS 可覆盖 `i2s`/`i2c` 的 `status` 与 `pinctrl-0`。

<DocScope products="RDK S100">

相关 DTS 文件：

- `hobot-drivers/kernel-dts/drobot-s100-soc.dtsi` — I2S、声卡、Codec 节点
- `hobot-drivers/kernel-dts/drobot-s100-pinctrl.dtsi` — `peri_pcm0`
- `hobot-drivers/kernel-dts/drobot-s100-pdma.dtsi` — I2S0 PDMA 通道

**I2S0 控制器示例：**

```dts
i2s0: i2s@39480000 {
	compatible = "hobot, super-i2s0";
	reg = <0x0 0x39480000 0x0 0x10000>;
	interrupt-parent = <&gic>;
	interrupts = <0 151 4>;
	clocks = <&scmi_smc_clk CLK_IDX_TOP_PERI_PERI_PCM0>;
	clock-names = "i2s-sysclk";
	status = "okay";
	dmas = <&pdma0 12			/* read channel */
			&pdma0 13	>;		/* write channel */
	dma-names = "rx", "tx";
	work_mode = <1>; //hal 0 //fall 1
	fifo_depth = <32>;
	pinctrl-names = "default";
	pinctrl-0 = <&peri_pcm0>;
	peri_clk = <24000000 162000000 216000000 307200000 1300000000>;
	peri_clk_num = <5>;
	pcm_ws_len = <0>;
	#sound-dai-cells = <1>;
};
```

**I2C5 Codec 节点示例**（摘自 `drobot-s100-soc.dtsi` 中 `i2c5` 子节点）：

```dts
es7210_0: es7210_0@40 {
	compatible = "MicArray_0";
	reg = <0x40>;
	#sound-dai-cells = <1>;
	channels = <8>;
	adc_dev_num = <2>;
	status = "okay";
};

es7210_1@42 {
	compatible = "MicArray_2";
	reg = <0x42>;
	channels = <8>;
	adc_dev_num = <2>;
	status = "okay";
};

es8156: es8156@8 {
	compatible = "everest,es8156";
	reg = <0x8>;
	#sound-dai-cells = <0>;
	status = "okay";
};
```

**声卡 snd2 节点示例：**

```dts
snd2: snd2 {
	status = "okay";
	model = "s100snd2";
	compatible = "hobot, super-snd-ac-fdx-master";
	i2s_mode = <1>;/*1:i2s mode; 7:dsp_a mode*/
	work_mode = <1>;/*0:hal-duplex; 1:full-duplex*/
	channel_max = <2>;
	mclk_set = <24576000>;
	dai-link@0 {
		dai-format = "dsp_a"; //"i2s"/"dsp_a"
		link-name = "s100dailink0";
		cpu {
			sound-dai = <&i2s0 0>;
		};
		codec {
			sound-dai = <&es7210_0 0>;
		};
	};

	dai-link@1 {
		dai-format = "dsp_a";
		link-name = "s100dailink1";
		cpu {
			sound-dai = <&i2s0 1>;
		};
		codec {
			sound-dai = <&es8156>;
		};
	};
};
```

</DocScope>

<DocScope products="RDK S600">

相关 DTS 文件：

- `hobot-drivers/kernel-dts/drobot-s600-soc.dtsi`
- `hobot-drivers/kernel-dts/drobot-s600-pinctrl.dtsi`
- `hobot-drivers/kernel-dts/rdk-s600-mcb.dtsi` — 板级 `&i2s1` / `&i2s2` / `&i2c7`

板级默认使能 I2S1/I2S2：

```dts
&i2s1 {
	status = "okay";
	pinctrl-0 = <&hsi_pcm1>;
};

&i2s2 {
	status = "okay";
	pinctrl-0 = <&hsi_pcm2>;
};
```

**I2C7 Codec 节点示例**（摘自 `drobot-s600-soc.dtsi` 中 `i2c7` 子节点）：

```dts
es7210_0: es7210_0@40 {
	compatible = "MicArray_0";
	reg = <0x40>;
	#sound-dai-cells = <1>;
	channels = <8>;
	adc_dev_num = <2>;
	status = "okay";
};

es7210_1@42 {
	compatible = "MicArray_2";
	reg = <0x42>;
	channels = <8>;
	adc_dev_num = <2>;
	status = "okay";
};

es8156: es8156@8 {
	compatible = "everest,es8156";
	reg = <0x8>;
	#sound-dai-cells = <0>;
	status = "okay";
};
```

**声卡 snd2 节点示例（I2S1 全双工，model `s600snd2`）：**

```dts
snd2: snd2 {
	status = "okay";
	model = "s600snd2";
	compatible = "hobot, super-snd-ac-fdx-master";
	i2s_mode = <1>;/*1:i2s mode; 7:dsp_a mode*/
	work_mode = <1>;/*0:hal-duplex; 1:full-duplex*/
	channel_max = <2>;
	mclk_set = <24576000>;
	dai-link@0 {
		dai-format = "dsp_a"; //"i2s"/"dsp_a"
		link-name = "s600dailink0";
		cpu {
			sound-dai = <&i2s1 0>;
		};
		codec {
			sound-dai = <&es7210_0 0>;
		};
	};

	dai-link@1 {
		dai-format = "dsp_a";
		link-name = "s600dailink1";
		cpu {
			sound-dai = <&i2s1 1>;
		};
		codec {
			sound-dai = <&es8156>;
		};
	};
};
```

**声卡 snd3 节点示例（半双工，model `s600snd3`）：**

```dts
snd3: snd3 {
	status = "okay";
	model = "s600snd3";
	compatible = "hobot, super-snd-ac-master";
	i2s_mode = <1>;/*1:i2s mode; 7:dsp_a mode*/
	work_mode = <0>;/*0:hal-duplex; 1:full-duplex*/
	channel_max = <2>;
	mclk_set = <24576000>;
	dai-link@0 {
		dai-format = "dsp_a"; //"i2s"/"dsp_a"
		link-name = "s600dailink0";
		cpu {
			sound-dai = <&i2s1 0>;
		};
		codec {
			sound-dai = <&es7210_0 0>;
		};
	};

	dai-link@1 {
		dai-format = "dsp_a";
		link-name = "s600dailink1";
		cpu {
			sound-dai = <&i2s2 1>;
		};
		codec {
			sound-dai = <&es8156>;
		};
	};
};
```

Codec 挂在 **I2C7**（板级 `rdk-s600-mcb.dtsi` 中 `&i2c7 { status = "okay"; }`），节点结构与 S100 I2C5 相同。

</DocScope>

关键属性说明：

| 属性 | 说明 |
|---|---|
| `i2s_mode` | I2S 帧格式：1 = I2S，7 = DSP_A |
| `work_mode` | 0 = 半双工，1 = 全双工 |
| `mclk_set` | 主时钟频率（Hz），常用 24576000 |
| `dai-format` | DAI 链路格式：`"i2s"` / `"dsp_a"` 等 |
| `channel_max` | 声卡最大通道数 |
| `#sound-dai-cells` | Codec 节点须声明；CPU I2S 为 `<1>` |

### dummy_codec 与环回声卡

SoC DTS 提供 `dummy_codec` 与 `snd_loop` 节点：无外接 Codec、或 Codec 需脱离 ALSA 单独配置时，可绑定虚拟 Codec 环回声卡，用于验证 I2S/PDMA 通路。

<DocScope products="RDK S100">

```dts
dummy_codec: dummy_codec {
	compatible = "drobot,super-dummy-codec";
	status = "okay";
	#sound-dai-cells = <0>;
};

snd_loop: snd_loop {
	status = "okay";
	model = "s100-loop";
	compatible = "hobot, super-snd-loop";
	work_mode = <1>;/*0:hal-duplex; 1:full-duplex*/
	mclk_set = <24576000>;
	mono_mode = <1>;
	dai-link@0 {
		dai-format = "dsp_a"; //"i2s"/"dsp_a"
		link-name = "s100dailink0";
		cpu {
			sound-dai = <&i2s0 0>;
		};
		codec {
			sound-dai = <&dummy_codec>;
		};
	};
};
```

</DocScope>

<DocScope products="RDK S600">

```dts
snd_loop: snd_loop {
	status = "okay";
	model = "s600-loop";
	compatible = "hobot, super-snd-loop";
	work_mode = <1>;/*0:hal-duplex; 1:full-duplex*/
	mclk_set = <24576000>;
	mono_mode = <1>;
	dai-link@0 {
		dai-format = "dsp_a"; //"i2s"/"dsp_a"
		link-name = "s600dailink0";
		cpu {
			sound-dai = <&i2s1 0>;
		};
		codec {
			sound-dai = <&dummy_codec>;
		};
	};
};
```

</DocScope>

### 新增 Codec

1. **添加驱动**：将 Codec 驱动源文件放入 `hobot-drivers/sound/soc/codecs/`（或内核 `sound/soc/codecs/`），在 `Kconfig` / `Makefile` 中增加编译项，例如：

```kconfig
config SND_SOC_ES7210
	tristate "ES7210 Audio Codec"
	depends on I2C
```

```makefile
obj-$(CONFIG_SND_SOC_ES7210) += snd-soc-es7210.o
```

2. **使能配置**：在 SDK 内核目录执行 menuconfig 并打开对应 `CONFIG_SND_SOC_*`：

```bash
./mk_kernel.sh menuconfig
```

在 Kernel Configuration 界面搜索并启用目标选项（例如 `CONFIG_SND_SOC_ES7210`）。

3. **修改 DTS**：
   - 在挂载 Codec 的 **I2C 总线**下增加 Codec 子节点（`reg`、`compatible`、`#sound-dai-cells`）。
   - 在 `sndN` 节点中增加 `dai-link@M`，用 `cpu { sound-dai = <&i2sX Y>; }` 与 `codec { sound-dai = <&codec>; }` 建立绑定。

可选 DAI 格式属性：`bitclock-master` / `frame-master`（时钟主从）、`frame-inversion`（帧极性反转）等，对应 `SND_SOC_DAIFMT_*` 标志。

## 功能使用

### Kernel 阶段

<DocScope products="RDK S100">

声卡模块以 `.ko` 形式提供，**须手动按序加载**（本板实测重新上电后不会自动注册声卡）：

```bash
modprobe hobot_cpudai_super
modprobe snd-soc-es8156
modprobe snd-soc-es7210
modprobe hobot_snd_super_ac_fdx_host
```

加载前可先执行 `i2cdetect -y -r 5` 检查子板 Codec 是否在 I2C5 上应答（`0x08`/`0x40`/`0x42`）；模块加载后上述地址可能显示 `UU`（驱动已占用），属正常现象。

`i2cdetect` 加载前正常输出示例：

```text
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

模块加载后同一总线可能变为：

```text
00:                         UU -- -- -- -- -- -- --
40: UU -- UU -- -- -- -- -- -- -- -- -- -- -- -- --
```

确认声卡已注册：

```bash
cat /proc/asound/cards
ls -l /dev/snd/
arecord -l
aplay -l
```

`cat /proc/asound/cards` 正常输出示例：

```text
root@ubuntu:~# cat /proc/asound/cards
 0 [s100snd2       ]: s100snd2 - s100snd2
                      s100snd2
```

`ls -l /dev/snd/` 正常输出示例：

```text
root@ubuntu:~# ls -l /dev/snd/
total 0
crw-rw-r--+ 1 root misc 116,  4 Apr 29 19:09 controlC0
crw-rw-r--+ 1 root misc 116,  2 Apr 29 19:09 pcmC0D0c
crw-rw-r--+ 1 root misc 116,  3 Apr 29 19:09 pcmC0D1p
```

`arecord -l` / `aplay -l` 正常输出示例：

```text
root@ubuntu:~# arecord -l
**** List of CAPTURE Hardware Devices ****
card 0: s100snd2 [s100snd2], device 0: s100dailink0 ES7210 4CH ADC 0-0 []
  Subdevices: 1/1
  Subdevice #0: subdevice #0

root@ubuntu:~# aplay -l
**** List of PLAYBACK Hardware Devices ****
card 0: s100snd2 [s100snd2], device 1: s100dailink1 ES8156 HiFi-1 []
  Subdevices: 1/1
  Subdevice #0: subdevice #0
```

正常情况下声卡名为 `s100snd2`，设备映射如下：

| 功能 | ALSA 设备 | 节点 |
|---|---|---|
| 录音 | `hw:0,0` | `/dev/snd/pcmC0D0c` |
| 播放 | `hw:0,1` | `/dev/snd/pcmC0D1p` |

</DocScope>

<DocScope products="RDK S600">

**USB 声卡**：插入后由 `snd-usb-audio` 自动注册，执行 `arecord -l` / `aplay -l` 查看 card/device 号（常见为 `hw:1,0`）。

**14-pin I2S 子板（ES7210/ES8156）**：加载顺序与 S100 相同：

```bash
modprobe hobot_cpudai_super
modprobe snd-soc-es8156
modprobe snd-soc-es7210
modprobe hobot_snd_super_ac_fdx_host
```

加载前可先执行 `i2cdetect -y -r 7` 检查 Codec 是否在 I2C7 上应答。加载成功后确认声卡已注册：

```bash
cat /proc/asound/cards
ls -l /dev/snd/
arecord -l
aplay -l
```

`cat /proc/asound/cards` 正常输出示例：

```text
root@ubuntu:~# cat /proc/asound/cards
 0 [s600snd2       ]: s600snd2 - s600snd2
                      s600snd2
```

`arecord -l` / `aplay -l` 正常输出示例：

```text
root@ubuntu:~# arecord -l
**** List of CAPTURE Hardware Devices ****
card 0: s600snd2 [s600snd2], device 0: s600dailink0 ES7210 4CH ADC 0-0 []
  Subdevices: 1/1
  Subdevice #0: subdevice #0

root@ubuntu:~# aplay -l
**** List of PLAYBACK Hardware Devices ****
card 0: s600snd2 [s600snd2], device 1: s600dailink1 ES8156 HiFi-1 []
  Subdevices: 1/1
  Subdevice #0: subdevice #0
```

`arecord`/`aplay` 的详细使用案例见 [音频应用](../../03_Demos/01_peripheral/03_audio.md)。

</DocScope>

:::info PDMA 对齐

I2S DMA 驱动按 **8 字节**对齐传输长度（`HOBOT_PDMA_ALIGN`，见 `hobot-i2s-super.h`）。配置 `period-size` 时须满足对齐；`arecord`/`aplay` 对应参数 `--period-size=X`。

:::

### 用户态使用

```bash
# 录音（示例参数须落在硬件能力范围内）
arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 3 test.wav

# 播放
aplay -Dhw:0,1 test.wav

# 音量/通路
amixer scontrols
amixer sset 'HP' on
```

`arecord` / `aplay` 正常执行时的终端反馈示例：

```text
root@ubuntu:~# arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 3 test.wav
Recording WAVE 'test.wav' : Signed 16 bit Little Endian, Rate 48000 Hz, Stereo

root@ubuntu:~# aplay -Dhw:0,1 test.wav
Playing WAVE 'test.wav' : Signed 16 bit Little Endian, Rate 48000 Hz, Stereo
```

<DocScope products="RDK S100">

本板播放前通常需要执行 `amixer sset 'HP' on` 打开耳机通路；录音设备为 `hw:0,0`，播放设备为 `hw:0,1`。详细使用案例与 `amixer` 控件说明见 [音频应用](../../03_Demos/01_peripheral/03_audio.md)。

</DocScope>

<DocScope products="RDK S600">

USB 声卡设备号以 `arecord -l` 为准；14-pin I2S 子板与 S100 类似，录音为 `hw:0,0`、播放为 `hw:0,1`（声卡名 `s600snd2`）。详细使用案例见 [音频应用](../../03_Demos/01_peripheral/03_audio.md)。

</DocScope>

<DocScope products="RDK S100">

### 音频子板与开发板连接 {#音频子板与开发板连接}

以 **Audio Driver HAT REV2** 与 RDK S100 40-pin 叠接为例：

- **ES7210×2**（I2C `0x40`/`0x42`）：8 路录音（4 路模拟 Mic + 2 路 AEC 回采等）
- **ES8156**（I2C `0x08`）：2 路播放

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/audio1.png" alt="音频子板实物图" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

叠接与接线：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/audio2.png" alt="音频子板与开发板连接示意图" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

**PCM / Wi-Fi 拨码**：40-pin PCM 与 PCIe Wi-Fi 复用；使用音频子板时 **40 PIN 拨码左拨、PCM 拨码右拨**：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/audio3.png" alt="PCM 与 Wi-Fi 拨码开关" style={{ width: '50%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

Codec 与 I2C5 扫描方法见 [I2C 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/05_i2c.md)。

</DocScope>

<DocScope products="RDK S600">

### 音频子板与开发板连接 {#s600-音频子板与开发板连接}

以 **Audio Driver HAT** 经 **14-pin** 排线连接 RDK S600 为例（Codec 为 ES7210×2 + ES8156，挂在 **I2C7**）：

- **ES7210×2**（I2C `0x40` / `0x42`）：录音
- **ES8156**（I2C `0x08`）：播放
- 14-pin 接口 IO 为 **1.8 V**；子板为 3.3 V 时须电平转换，并正确连接 **GND** 与 **VCC**

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s600/S600_connect_audio_HAT_1.png" alt="RDK S600 Audio HAT 14-pin 连接示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

加载声卡模块与 `arecord`/`aplay` 的详细使用案例见 [音频应用](../../03_Demos/01_peripheral/03_audio.md)。

</DocScope>

## 调试

### 确认驱动与声卡

```bash
lsmod | grep -E 'hobot|snd|es7210|es8156'
dmesg | grep -iE 'snd|i2s|es7210|es8156|asoc'
cat /proc/asound/cards
ls /dev/snd/
```

声卡 probe 失败时，`dmesg` 可能出现：

```text
soc:sndcard@0: BUG: Can't get codec
soc:sndcard@0: BUG: Can't get cpu
probe of soc:sndcard@0 failed with error -22
```

请检查 DTS 各节点是否为 `status = "okay"`、I2C 地址是否正确，以及上文内核模块是否已按序加载。模块与 DTS 正常时，`dmesg` 中可见类似成功注册信息：

```text
success register cpu dai0 driver
```

（具体序号与 `i2s` 节点编号以板端 `dmesg` 为准。）

### 调整 debug 日志

```bash
echo "8 4 1 7" > /proc/sys/kernel/printk
echo -n "file hobot-cpudai-super.c +p" > /sys/kernel/debug/dynamic_debug/control
echo -n "file hobot-i2s-super.c +p" > /sys/kernel/debug/dynamic_debug/control
echo -n "file hobot-platform-super.c +p" > /sys/kernel/debug/dynamic_debug/control
echo -n "file pcm_lib.c +p" > /sys/kernel/debug/dynamic_debug/control
```

### ALSA procfs 节点

挂载目录：`/proc/asound`。

| 节点 | 用途 |
|---|---|
| `/proc/asound/cards` | 已注册声卡列表 |
| `/proc/asound/pcm` | PCM 流设备列表 |
| `/proc/asound/cardX/pcmYc/sub0/hw_params` | 打开流后的采样率、位宽、通道、period/buffer |
| `/proc/asound/cardX/pcmYc/sub0/sw_params` | `start_threshold`、`stop_threshold` 等 |
| `/proc/asound/cardX/pcmYp/sub0/status` | 流状态、`hw_ptr`/`appl_ptr` 是否推进 |

PCM 流打开后，在 `/proc/asound/cardX/pcmY[c,p]/sub0/` 下查看（`X` 为声卡号，`Y` 为设备号，`c`/`p` 表示 capture/playback）。

`hw_params` 示例（`cat /proc/asound/card0/pcm0c/sub0/hw_params`）：

```text
root@ubuntu:/proc/asound/card0/pcm0c/sub0# cat hw_params
access: RW_INTERLEAVED
format: S16_LE
subformat: STD
channels: 2
rate: 48000 (48000/1)
period_size: 1024
buffer_size: 4096
```

`sw_params` 示例（`cat /proc/asound/card0/pcm0c/sub0/sw_params`）：

```text
root@ubuntu:/proc/asound/card0/pcm0c/sub0# cat sw_params
tstamp_mode: ENABLE
period_step: 1
avail_min: 1
start_threshold: 1
stop_threshold: 40960
silence_threshold: 0
silence_size: 0
boundary: 4611686018427387904
```

`start_threshold` 过大时，从开始播放到出声延迟变长，过短促的声音可能听不到；`stop_threshold` 用于判断是否触发 xrun（可用空间超过该阈值时触发 overrun）。

`status` 示例（`cat /proc/asound/card0/pcm0c/sub0/status`）可查看 substream 状态（`running`、`xrun` 等）以及 `hw_ptr`/`appl_ptr`。若启动测试后中断未正常触发，数据传输停滞时这两个指针会持续不更新。

### xrun 排查

播放 **underrun**、录音 **overrun** 会导致断续、爆破音或 `pcm_read`/`pcm_write` 返回 **-32**。

定位思路：

1. 排除存储 I/O 影响：将录音写入 ramdisk 或丢弃到空设备，参考命令：

```bash
# 写入 ramdisk
mkdir -p /data/audio_test
tinycap /data/audio_test/test.wav

# 写入空设备（仅用于定位，不能作为长期方案）
tinycap /dev/null
```

以上命令仅用于判断 xrun 是否由存储 I/O 耗时引起，不能作为根治手段。

2. 应用层读写与文件 I/O 分线程，中间加 ring buffer（ring buffer 大小可按需调整）。以录音为例：`pcm_read` 写入 ring buffer，写文件线程从 ring buffer 读取；只要写文件阻塞时间不超过 ring buffer 容量，可避免 xrun。

3. 开启 xrun 调试。若 `/proc/asound/cardX/pcmYp/sub0/xrun_debug` 不存在，须在内核配置中启用后重新编译烧录：

```text
CONFIG_SND_PCM_XRUN_DEBUG=y
CONFIG_SND_VERBOSE_PROCFS=y
CONFIG_SND_DEBUG=y
```

向 `xrun_debug` 写入 `3` 可启用基本调试与堆栈打印，用于查看 PCM 流是否异常停止：

```bash
# 节点路径：/proc/asound/cardX/pcmY[c,p]/xrun_debug
echo 3 > /proc/asound/card0/pcm0p/xrun_debug
```

缓解手段：提高线程优先级、增大 `period_size`、异步 I/O。

### 引脚与时钟

声卡已注册但无声音或波形异常时，用示波器测量 I2S **MCLK/BCLK/LRCK/DATA**；检查主从模式与 DTS 中 `mclk_set` 是否与 Codec 手册一致。Codec 作 Slave 时，主机侧 BCLK/LRCLK 须稳定输出，否则易出现噪声或录音异常。

## 常见问题

### open 设备失败或找不到声卡

**原因**：内核模块未加载、card/device 号错误、DTS `status` 非 `okay`、I2C 不通。

常见报错示例：

```text
Unable to open PCM device (cannot open device '/dev/snd/pcmC0D3c': No such file or directory)
```

声卡未加载时，`arecord -l` 可能显示：

```text
arecord: device_list:274: no soundcards found...
```

**解决**：按「Kernel 阶段」加载模块；`arecord -l` / `aplay -l` 确认设备号；S100 先 `i2cdetect -y -r 5` 确认 Codec。

### cannot set hw params: Unknown error -22

**原因**：采样率、格式或通道数超出 I2S 与 Codec 驱动 `snd_soc_dai_driver` 支持范围的交集。

常见报错示例：

```text
Unable to open PCM device (cannot set hw params: Unknown error -22)
```

**解决**：`arecord --dump-hw-params -Dhw:x,y` 查询能力后重新指定 `-f`/`-c`/`-r`。

### 打开设备卡住

**原因**：同一 PCM 设备被占用；ALSA 单开单占。

**解决**：确认无残留 `arecord`/`aplay` 进程。

### pcm_read/pcm_write 返回 -5

**原因**：DMA 或中断异常。

**解决**：加大 dynamic_debug（见「调整 debug 日志」）；`dmesg` 或终端可能出现：

```text
write error (DMA or IRQ trouble?)
```

出现上述打印说明未产生有效中断，需检查寄存器配置与硬件连接。

### pcm_read 返回 -16

<DocScope products="RDK S100">

**原因**：Slave 模式下时钟突然丢失或链路中断（S100 作 Slave 录音场景）。

</DocScope>

<DocScope products="RDK S600">

**原因**：Slave 模式下时钟突然丢失或链路中断（S600 作 Slave 录音场景）。

</DocScope>

### 录音全 0 或播放无声

**原因**：I2S 时钟未输出、Codec 未初始化、播放通路未打开（S100 常见 `HP` 为 off）、功放未使能。

**解决**：按下列顺序排查：

1. 用示波器测量 I2S 时钟线频率是否正常，DATA 线是否有数据输出。
2. 若时钟频率不符合预期，或某个时钟信号持续为低电平，检查 I2S 寄存器配置是否符合预期（主从模式、时钟比值等）。
3. 若 I2S 侧正常，播放正弦波并测量 Codec 侧模拟输出；若无输出，确认 Codec 时钟比值配置与硬件接口（S100 Audio HAT 为 J5 端）是否匹配，以及 S100 侧时钟比值是否在 Codec 支持范围内。
4. 若 Codec 模拟输出正常，检查功放芯片各管脚幅值是否正常。

软件侧：S100 播放前执行 `amixer sset 'HP' on`；更多命令示例见 [音频应用](../../03_Demos/01_peripheral/03_audio.md)。

### 录制/播放噪声

**原因**：Codec Slave 时 BCLK/LRCLK 与 Codec 内部时钟不同源；接地或布线问题。

**解决**：确认时钟同源与 `dai-format`；检查模拟链路。

<DocScope products="RDK S100">

### 扣合子板但 arecord -l 无设备

**原因**：仅硬件连通不够；声卡 `.ko` 未加载，或 PCM 拨码仍在 Wi-Fi 侧。

**解决**：切换 PCM 拨码；按序 `modprobe` 四个模块；与「仅 I2C 能扫到地址」区分见 [音频应用 — 环境准备](../../03_Demos/01_peripheral/03_audio.md#环境准备)。

</DocScope>

<DocScope products="RDK S600">

### 出厂无内置声卡

**原因**：板载未焊接 Codec；`i2s0`/`i2s3` 默认 disabled。

**解决**：接 USB 声卡，或 14-pin I2S 子板 + 上文模块加载流程；勿与 SPI1 overlay 同时占用 `hsi_pcm1`。

</DocScope>

## 相关文档

- [I2C 调试指南](./03_driver_i2c_dev.md)
- [Pinctrl 调试指南](./05_driver_pinctrl_dev.md)
- [音频配置](../../02_System_configuration/10_audio_output.md)

<DocScope products="RDK S100">

- [I2C 应用（40-pin）](../../03_Demos/01_peripheral/01_40pin/01_s100/05_i2c.md)
- [音频应用](../../03_Demos/01_peripheral/03_audio.md)

</DocScope>

<DocScope products="RDK S600">

- [音频应用](../../03_Demos/01_peripheral/03_audio.md)
- [SPI 调试指南](./07_driver_spi_dev.md)（I2S1 与 SPI1 引脚复用）

</DocScope>
