---
sidebar_position: 3
title: "音频应用"
description: "RDK 音频模块 alsa-lib 功能测试方法"
---

# 音频应用

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 功能概述

本示例基于 Linux **ALSA** 框架，通过板端预装的 **alsa-utils**（`arecord` / `aplay` / `amixer`）完成录音、播放与音量调节验证。板端无独立 Python demo，直接使用命令行工具测试。

<DocScope products="RDK S100">

RDK S100 使用 **Audio Driver HAT REV2** 音频子板（2× ES7210 录音 + 1× ES8156 播放），经 40-pin 叠接；须完成 **PCM 拨码**配置，并按序 **加载声卡内核模块** 后，系统才会注册声卡 `s100snd2`。

完成 [环境准备](#环境准备) 与 [加载声卡驱动](#加载声卡驱动) 后，执行 `arecord -l` / `aplay -l` 应能列出录音与播放设备：

```shell
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

</DocScope>

<DocScope products="RDK S600">

RDK S600 可接入 **USB 声卡**（如 ReSpeaker XVF3800）或通过 **14PIN I2S** 连接音频子板。USB 声卡加载成功后，`ls /dev/snd` 应出现 `pcmC*D*` 节点。

```shell
root@ubuntu:~# ls /dev/snd
controlC1  pcmC1D0c  pcmC1D0p  seq  timer
```

</DocScope>

:::tip
以下命令中的声卡号、设备号（`hw:x,y`）因硬件接入方式而异，以 `arecord -l` / `aplay -l` 实际列出为准。S100 仅扣合子板但**未加载声卡驱动**时，`arecord -l` 仍会提示 `no soundcards found...`（与未扣合子板现象相同，须结合 [加载声卡驱动](#加载声卡驱动) 与 I2C5 扫描区分）。
:::

## 环境准备

<DocScope products="RDK S100">

### 硬件清单

| 物品 | 说明 |
|------|------|
| RDK S100 开发板（40-pin） | 已烧录 RDK OS |
| Audio Driver HAT REV2 | 微雪音频子板，经 40-pin 叠接；Codec 为 ES7210×2 + ES8156 |
| 耳机或喇叭（推荐） | 接子板播放输出；本板实测须打开 `HP` 控件后才有耳机声 |
| 麦克风 | 子板自带 4 路模拟 Mic；亦可外接 |

### 外设连接与拨码

将 Audio Driver HAT REV2 **对准扣合**在 40-pin 排针上（与 [I2C 应用](./01_40pin/01_s100/05_i2c.md) 为同一子板）：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_funcreuse_40pin_i2c_demo_connect.png" alt="Audio Driver HAT 与 40-pin 叠接示意" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

音频功能须将 **40-pin PCM 与 Wi-Fi 复用拨码**切至 PCM 侧：**40 PIN 拨码左拨、PCM 拨码右拨**（详见 [音频调试指南 — 音频子板与开发板连接](../../07_Advanced_development/04_driver_development/09_driver_audio.md#音频子板与开发板连接)）：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/audio3.png" alt="PCM 与 Wi-Fi 拨码开关" style={{ width: '50%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### 上电前检查

1. 子板已完全扣入 40-pin，无浮空引脚。
2. PCM 拨码已切至 PCM 模式（非 Wi-Fi 复用）。
3. 开发板已上电启动至 shell。

### 系统与软件

- **系统**：已烧录 RDK OS，可登录 `root@ubuntu`
- **依赖**：`alsa-utils`（`arecord`、`aplay`、`amixer`）、`ffmpeg`（回采测试生成测试音），系统已预装

上电后、**加载声卡驱动之前**，可用 **I2C5 扫描**确认子板 Codec 已被识别（**本板实测**；仅验证硬件连通，不代表 ALSA 声卡已注册）：

```shell
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

若矩阵全为 `--`，请检查扣合与 I2C5 拨码（见 [I2C 应用 — 环境准备](./01_40pin/01_s100/05_i2c.md#环境准备)）。出现 `08`/`40`/`42` 后，还须执行 [加载声卡驱动](#加载声卡驱动) 才能使用 `arecord`/`aplay`。

:::info

完成 `modprobe` 并加载声卡驱动后，再次执行 `i2cdetect -y -r 5` 时，`0x08`/`0x40`/`0x42` 可能显示为 **`UU`**（驱动已占用），属正常现象；**预检请在 `modprobe` 之前进行**，以数字地址为准。

:::

</DocScope>

<DocScope products="RDK S600">

### 硬件清单（USB 声卡）

| 物品 | 说明 |
|------|------|
| RDK S600 开发板 | 已烧录 RDK OS |
| USB 声卡 | 如 [ReSpeaker XVF3800](https://wiki.seeedstudio.com/respeaker_xvf3800_introduction)，经 USB 接入 |

### 硬件清单（14PIN I2S 子板）

| 物品 | 说明 |
|------|------|
| RDK S600 开发板 | 已烧录 RDK OS |
| I2S 音频子板 | 经 14PIN 杜邦线连接 |

**注意**：14PIN 接口 IO 为 **1.8V**；若子板为 3.3V，须电平转换后再连接。除 I2S/I2C 信号外，须正确连接 **GND** 与 **VCC**。

### 系统与软件

- **系统**：已烧录 RDK OS，可登录 `root@ubuntu`
- **依赖**：`alsa-utils`（`arecord`、`aplay`、`amixer`），系统已预装

</DocScope>

## 代码位置

板端无独立 audio demo，直接使用系统 **alsa-utils** 命令测试。

<DocScope products="RDK S100">

| 类型 | 路径 / 节点 |
|------|-------------|
| 录音设备 | `hw:0,0` → `/dev/snd/pcmC0D0c`（ES7210） |
| 播放设备 | `hw:0,1` → `/dev/snd/pcmC0D1p`（ES8156） |
| 控制节点 | `/dev/snd/controlC0` |
| 声卡信息 | `/proc/asound/cards` |

声卡驱动以内核模块（`.ko`）形式提供，须手动 `modprobe` 加载（见 [加载声卡驱动](#加载声卡驱动)）。

</DocScope>

<DocScope products="RDK S600">

- USB 声卡设备号以 `arecord -l` 为准（常见为 `hw:1,0`）
- 节点目录：`/dev/snd/`

</DocScope>

- SDK 音频配置工具（可选）：`hobot-audio-config/audio_gadget/audio_gadget.c`

```text
# 板端主要使用系统命令，无 /app 预置 audio 脚本
arecord / aplay / amixer    # alsa-utils，系统预装
```

## 使用方法

<DocScope products="RDK S100">

### 加载声卡驱动

S100 声卡驱动**默认不随开机自动加载**（本板重新上电后实测：扣合子板且 I2C5 已识别 `08`/`40`/`42`，但 `arecord -l` 仍报 `no soundcards found...`）。须按下列顺序加载内核模块：

```shell
root@ubuntu:~# modprobe hobot_cpudai_super
root@ubuntu:~# modprobe snd-soc-es8156
root@ubuntu:~# modprobe snd-soc-es7210
root@ubuntu:~# modprobe hobot_snd_super_ac_fdx_host
```

加载成功后验证：

```shell
root@ubuntu:~# cat /proc/asound/cards
 0 [s100snd2       ]: s100snd2 - s100snd2
                      s100snd2

root@ubuntu:~# ls /dev/snd/
by-path  controlC0  pcmC0D0c  pcmC0D1p  seq  timer
```

注意：模块加载顺序与 [音频调试指南](../../07_Advanced_development/04_driver_development/09_driver_audio.md) 一致；若跳过此步，后续 `arecord`/`aplay`/`amixer` 均无法使用。加载完成后 I2C5 扫描可能变为 `UU`（见 [环境准备](#环境准备) 说明）。

</DocScope>

### 确认声卡设备

列出录音与播放设备，确认声卡号与设备号：

```shell
root@ubuntu:~# arecord -l
root@ubuntu:~# aplay -l
```

<DocScope products="RDK S100">

S100 典型映射：

| 功能 | `hw` 设备 | ALSA 设备名 | 芯片 |
|------|-----------|-------------|------|
| 录音 | `hw:0,0` | `pcmC0D0c` | ES7210 4CH ADC |
| 播放 | `hw:0,1` | `pcmC0D1p` | ES8156 HiFi-1 |

查看硬件支持的采样率、声道与格式（**本板实测**摘录）：

```shell
root@ubuntu:~# arecord --dump-hw-params -Dhw:0,0 2>&1 | grep -E 'CHANNELS|RATE|FORMAT'
FORMAT:  S16_LE S24_LE S32_LE
CHANNELS: [1 16]
RATE: [8000 96000]
```

```shell
root@ubuntu:~# aplay --dump-hw-params -Dhw:0,1 /dev/zero 2>&1 | grep -E 'CHANNELS|RATE|FORMAT'
FORMAT:  S16_LE S24_LE S32_LE
CHANNELS: [1 8]
RATE: [8000 96000]
```

注意：上表为能力查询摘录（`grep` 过滤输出）；实际录音/播放时须通过 `-f`/`-c`/`-r` 指定在能力范围内的参数。

</DocScope>

<DocScope products="RDK S600">

USB 声卡场景可先确认节点存在：

```shell
root@ubuntu:~# ls /dev/snd
root@ubuntu:~# arecord -Dhw:1,0 --dump-hw-params
```

</DocScope>

### 录制音频

<DocScope products="RDK S100">

在录音设备 `hw:0,0` 上录制 3 s、48 kHz、立体声、16 bit WAV（**本板实测**）：

```shell
root@ubuntu:~# arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 3 test.wav
Recording WAVE 'test.wav' : Signed 16 bit Little Endian, Rate 48000 Hz, Stereo

root@ubuntu:~# ls -la test.wav
-rw-r--r-- 1 root root 576044 test.wav
```

注意：`-c`/`-r`/`-f` 须在 [硬件能力](#确认声卡设备) 范围内；3 s 立体声 48 kHz/16 bit 文件约 **576 KB**（含 WAV 头），可作为录音成功的辅助判据。

</DocScope>

<DocScope products="RDK S600">

```shell
root@ubuntu:~# arecord -Dhw:1,0 -c 2 -r 16000 -f S16_LE -t wav -d 10 test.wav
```

</DocScope>

### 播放音频

<DocScope products="RDK S100">

播放前须先打开耳机通路（本板实测 `HP` 默认为 `off`，见 [调节音量](#调节音量)），再在 `hw:0,1` 上回放录音文件：

```shell
root@ubuntu:~# amixer sset 'HP' on
root@ubuntu:~# aplay -Dhw:0,1 test.wav
Playing WAVE 'test.wav' : Signed 16 bit Little Endian, Rate 48000 Hz, Stereo
```

注意：`aplay` 从 WAV 头解析格式；命令无报错但耳机无声时，检查 `amixer sget 'HP'` 是否为 `off`，以及 `DAC` 音量是否过低。

</DocScope>

<DocScope products="RDK S600">

```shell
root@ubuntu:~# aplay -Dhw:1,0 test.wav
```

</DocScope>

### 调节音量

查询 Codec 控制项：

```shell
root@ubuntu:~# amixer scontrols
root@ubuntu:~# amixer scontents
```

<DocScope products="RDK S100">

本板实测与播放相关的关键控件：

| 控件 | 本板默认状态 | 说明 |
|------|--------------|------|
| `DAC` | `152/255`（约 60%，-20 dB） | 播放数字音量 |
| `HP` | **`Playback [off]`** | 耳机/喇叭通路开关，**播放前须打开** |

打开耳机通路并确认：

```shell
root@ubuntu:~# amixer sset 'HP' on
Simple mixer control 'HP',0
  Capabilities: pswitch pswitch-joined
  Playback channels: Mono
  Mono: Playback [on]

root@ubuntu:~# amixer sget 'DAC'
Simple mixer control 'DAC',0
  Capabilities: pvolume pvolume-joined
  Playback channels: Mono
  Limits: Playback 0 - 255
  Mono: Playback 152 [60%] [-20.00dB]
```

按需提高播放音量：

```shell
root@ubuntu:~# amixer sset 'DAC' 200
```

注意：控件名以 `amixer scontrols` 实际输出为准；录音侧另有 `ADC*_DIRECT_GAIN` 等控件可调 Mic 增益。

</DocScope>

### 常用参数说明

| 参数 | 说明 |
|------|------|
| `-D hw:x,y` | 指定声卡号 `x`、设备号 `y` |
| `-c` | 声道数（S100 录音最高 16 ch，播放最高 8 ch） |
| `-r` | 采样率（Hz）；S100 支持 8 kHz～96 kHz |
| `-f` | 样本格式（`S16_LE` / `S24_LE` / `S32_LE`） |
| `-t` | 文件类型（如 `wav`） |
| `-d` | 录音时长（秒） |
| `--period-size` | 每次中断处理的帧数（须满足 64 字节对齐，见 [音频调试指南](../../07_Advanced_development/04_driver_development/09_driver_audio.md)） |
| `--buffer-size` | 缓冲区大小 |

<DocScope products="RDK S100">

### 音频回采测试（进阶）

Audio Driver HAT REV2 的回采信号映射在录音通道 **7、8**。回采测试须使用 **8 通道、16 kHz、16 bit（`S16_LE`）** 录音，且播放文件在**采样率、位深、通道数**上与录音参数对齐（同一组 I2S 须格式一致）。

**1. 生成 8 通道 16 kHz 测试音**（**本板实测**，板端预装 `ffmpeg`）：

```shell
root@ubuntu:~# ffmpeg -y -f lavfi -i 'sine=frequency=1000:duration=3' -ac 8 -ar 16000 -sample_fmt s16 1khz_16k_8ch.wav
```

**2. 打开耳机通路**（见 [调节音量](#调节音量)）：

```shell
root@ubuntu:~# amixer sset 'HP' on
```

**3. 边播边录**（播放与录音均为 **16 kHz / 8 ch / S16_LE**）：

```shell
root@ubuntu:~# aplay -Dhw:0,1 1khz_16k_8ch.wav --period-size=1024 --buffer-size=1024 &
root@ubuntu:~# sleep 0.5
root@ubuntu:~# arecord -Dhw:0,0 -c 8 -r 16000 -f S16_LE -t wav -d 3 8chn_test.wav --period-size=256 --buffer-size=1024
Recording WAVE '8chn_test.wav' : Signed 16 bit Little Endian, Rate 16000 Hz, Channels 8

root@ubuntu:~# wait
root@ubuntu:~# ls -la 8chn_test.wav 1khz_16k_8ch.wav
-rw-rw-rw- 1 root root 768102 1khz_16k_8ch.wav
-rw-r--r-- 1 root root 768044 8chn_test.wav
```

注意：`aplay` 须在后台运行（`&`），再启动 `arecord`；仅 8 通道录音、不播放时，可省略步骤 1～2 与 `aplay`，单独执行 `arecord` 命令即可（**本板实测** 3 s 文件约 **768 KB**）。

录制完成后，可用 Audacity 等工具打开 `8chn_test.wav`，查看第 **7、8** 通道是否出现约 **1 kHz** 频谱，验证回采是否正常。

</DocScope>

## 运行效果

<DocScope products="RDK S100">

- **运行命令**：加载驱动 → `arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 3 test.wav` → `amixer sset 'HP' on` → `aplay -Dhw:0,1 test.wav`
- **成功标志**：`i2cdetect -y -r 5` 见 `08`/`40`/`42`；`modprobe` 后 `arecord -l`/`aplay -l` 列出 `s100snd2`；生成约 **576 KB** 的 `test.wav`；`aplay` 打印 `Playing WAVE` 且耳机可听到回放
- **失败排查**：`no soundcards found` 且 I2C5 有器件 → 未 `modprobe`；I2C5 全 `--` → 子板/拨码问题；`aplay` 无报错但无声 → `amixer sget 'HP'` 是否为 `off`；参数报错 → 对照 `--dump-hw-params`
- **结果预览**：扣合 Audio Driver HAT REV2 后，本板完整实测会话如下（含驱动加载、I2C5 预检、录音、开 HP、播放）；硬件见 [环境准备](#环境准备)

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

root@ubuntu:~# arecord -l
arecord: device_list:274: no soundcards found...

root@ubuntu:~# modprobe hobot_cpudai_super
root@ubuntu:~# modprobe snd-soc-es8156
root@ubuntu:~# modprobe snd-soc-es7210
root@ubuntu:~# modprobe hobot_snd_super_ac_fdx_host

root@ubuntu:~# i2cdetect -y -r 5
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         UU -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: UU -- UU -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --

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

root@ubuntu:~# arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 3 test.wav
Recording WAVE 'test.wav' : Signed 16 bit Little Endian, Rate 48000 Hz, Stereo

root@ubuntu:~# ls -la test.wav
-rw-r--r-- 1 root root 576044 test.wav

root@ubuntu:~# amixer sget 'HP'
  Mono: Playback [off]

root@ubuntu:~# amixer sset 'HP' on
  Mono: Playback [on]

root@ubuntu:~# aplay -Dhw:0,1 test.wav
Playing WAVE 'test.wav' : Signed 16 bit Little Endian, Rate 48000 Hz, Stereo
```

</DocScope>

<DocScope products="RDK S600">

- **运行命令**：`arecord -Dhw:1,0 -c 2 -r 16000 -f S16_LE -t wav -d 10 test.wav`，随后 `aplay -Dhw:1,0 test.wav`（设备号以实际为准）
- **成功标志**：`ls /dev/snd` 出现 `pcmC*D*`；`arecord --dump-hw-params` 能列出支持的通道/采样率/位宽；录音生成 `test.wav`，播放无报错
- **失败排查**：无 `/dev/snd` 节点 → 检查 USB 连接或 14PIN 接线；参数错误 → 对照 `--dump-hw-params` 调整 `-c`/`-r`/`-f`
- **结果预览**：USB 声卡加载后 `ls /dev/snd` 应列出 `pcmC*D*` 等节点；录音/播放命令执行无报错即为通路正常

</DocScope>

## 常见问题

### `no soundcards found...` 但 I2C5 已识别子板

**原因**：子板硬件连通正常，但**声卡内核模块未加载**（本板重新上电后实测现象）。

**解决**：先 `i2cdetect -y -r 5` 确认 `08`/`40`/`42`；再按 [加载声卡驱动](#加载声卡驱动) 执行四条 `modprobe`；最后 `arecord -l` 应列出 `s100snd2`。

### 未检测到声卡（I2C5 也为空）

**原因**：音频子板未扣合、接触不良，或 PCM 拨码仍在 Wi-Fi 侧。

**解决**：按 [环境准备](#环境准备) 检查扣合与拨码；在 **`modprobe` 之前** I2C5 扫描应出现 `08`/`40`/`42`（加载驱动后可能变为 `UU`，不能据此判断子板未接）。

### `aplay` 无报错但耳机无声

**原因**：本板实测 **`HP` 控件默认为 `off`**，耳机通路未打开；或 `DAC` 音量过低。

**解决**：执行 `amixer sset 'HP' on`；必要时 `amixer sset 'DAC' 200`；确认耳机插入子板播放接口。

### 录音或播放参数报错

**原因**：`-c`/`-r`/`-f` 超出硬件支持范围，或 WAV 格式与命令不一致。

**解决**：用 `arecord --dump-hw-params -Dhw:0,0` / `aplay --dump-hw-params -Dhw:0,1` 核对；录音推荐 `-f S16_LE`。

### 参数写入失败或断续杂音

**原因**：`--period-size` 未满足 64 字节对齐等 DMA 约束。

**解决**：调整 `--period-size` / `--buffer-size`；详见 [音频调试指南](../../07_Advanced_development/04_driver_development/09_driver_audio.md) 中 PDMA 对齐说明。

<DocScope products="RDK S100">

### 回采通道无信号

**原因**：未使用 8 通道录音，或播放与录音的通道数、位深、采样率未对齐。

**解决**：改用 **8 通道、16 kHz、`S16_LE`** 的 `arecord`（回采在通道 7、8）；播放文件须同为 **16 kHz / 8 ch / S16_LE**（可用上文 `ffmpeg` 生成 `1khz_16k_8ch.wav`）；本板实测 3 s 录音约 **768 KB**。

</DocScope>

## 相关文档

- 用到的接口：[音频调试指南](../../07_Advanced_development/04_driver_development/09_driver_audio.md)
- 系统配置：[音频配置](../../02_System_configuration/10_audio_output.md)
- 同类示例：[I2C 应用](./01_40pin/01_s100/05_i2c.md)（同一 Audio HAT 的 I2C5 扫描）
- 板端工具：`arecord` / `aplay` / `amixer`（`alsa-utils`）
- ALSA 官方 API：https://www.alsa-project.org/alsa-doc/alsa-lib/pcm.html
