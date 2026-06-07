# 音频调试指南

URL: https://developer.d-robotics.cc/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_audio

本章主要是关于 I2S 的规格特性，语音基础知识以及添加 codec、调试声卡的说明。

## 概述

CPU DAI: CPU 侧的数字音频接口，一般是 i2s 接口，控制总线传输

CODEC DAI：即 codec。控制 codec 工作流，提供给 core 层

DAI LINK：绑定 CPU DAI 和 CODEC DAI，指硬件控制器驱动

PLATFORM：指定 CPU 侧的平台驱动，通常是 DMA 驱动，用于传输

DAPM：动态音频电源管理

## 音频开发说明

一个完整的声卡由 cpu dai、codec dai、platform、sound card 构成。

cpu dai driver：一般是 I2S 接口驱动。

codec dai driver：指的是外接 codec 驱动。

platform driver：通常是 dma 驱动，用于完成对音频数据的管理。

sound card driver：用来负责连接 cpu dai 和 codec dai，比如 sound/soc/hobot/hobot-snd-super-ac-fdx-host.c。

### I2S 参数说明

I2S 芯片支持能力说明：

- 通道支持：支持1/2/4/8/16通道；
- 采样率支持：8k/16k/32k/48k/44.1k/96k/192k；
- 采样精度支持：8bit/16bit/24bit/32bit；
- 传输协议支持：I2S/DSP(TDM);
- I2S 支持配置 master 或者 slave 模式；
- I2S 模块的 sysclk 需要为 bclk 的6倍及以上；
- 支持全双工模式。在全双工模式时 sdio0为输入，sdio1为输出，不能更改；
- bclk 输出不能超过25MHz

### 新增 Codec 说明

#### 添加 codec driver

将所添加的 codec 驱动文件增加到 sound/soc/codecs/目录下。

#### 添加编译选项

- 通过修改 sound/soc/codec/Kconfig 以及 Makefile 添加 codec 驱动的编译配置。
其中 Kconfig 添加内容参考如下：

```text
config SND_SOC_ES7210
        tristate "ES7210 Audio Codec"
        depends on I2C
```

Makefile 添加内容参考：

```text
obj-$(CONFIG_SND_SOC_ES7210)   += snd-soc-es7210.o
```

- 通过 menuconfig 修改 config 配置，使能编译

```text
sudo ./mk_kernel.sh menuconfig
```

执行以上命令后，打开 Kernel Configuration 配置界面，输入 `CONFIG_SND_SOC_ES7210` 并使能。

#### 修改 dts

dts 修改一般涉及以下：

- 增加 codec 驱动节点。一般通过 i2c 控制 codec 寄存器，知道 codec 挂载在哪个 i2c 上，在 i2c 对应节点增加 codec 信息即可。参考如下：

```text
i2c5: i2c@39470000 {
    es7210_0: es7210_0@40 {
            compatible = "MicArray_0";
            reg = <0x40>;
            #sound-dai-cells = <1>;
            channels = <8>;
            adc_dev_num = <2>;
            status = "okay";
    };
};
```

- 增加 sound card 节点。建立 codec 与 i2s 的 dai link 绑定关系，参考如下：

```text
snd2: snd2 {
        status = "okay";
        model = "s100snd2";
        compatible = "hobot, super-snd-ac-fdx-master";
        i2s_mode = <1>;/*1:i2s mode; 7:dsp_a mode*/
        work_mode = <1>;/*0:hal-duplex; 1:full-duplex*/
        channel_max = <2>;
        mclk_set = <24576000>;
        dai-link@0 {
                dai-format = "dsp_a"; //"i2s"/"dsp_a" //对应SND_SOC_DAIFMT_DSP_A
                // bitclock-master; /配置*-master，对应dai_fmt等价于SND_SOC_DAIFMT_CBM_CFM。表示指定codec作为master提供时钟源
                // frame-master;
                // frame-inversion; //对应SND_SOC_DAIFMT_NB_IF，对应帧同步信号的极性反转。正常情况左声道对应低电平，右声道对应高电平。启动frame-inversion后极性反转
                link-name = "s100dailink0";
                cpu {
                        sound-dai = <&i2s0 0>; //数字音频接口，控制总线传输
                };
                codec {
                        sound-dai = <&es7210_0 0>; //codec芯片接口
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

- 另外，在 dts 中增加了 dummy_codec 节点，在没有外部 codec 或 codec 需要单独配置不依赖 alsa 框架的情况下，通过注册绑定虚拟 codec 的声卡设备方式实现用户空间创建设备节点控制 I2S/DMA。

## 调试说明

### 声卡调试

注意
本节声卡调试基于外接微雪音频子板的方案进行介绍。

声卡模块默认以 ko 形式存在，以动态加载方式挂载。驱动加载命令如下：

```text
modprobe hobot_cpudai_super
modprobe snd-soc-es8156
modprobe snd-soc-es7210
modprobe hobot_snd_super_ac_fdx_host
```

驱动加载后确认声卡是否加载成功的方法：

- 检查/proc/asound/cards 节点

```text
root@ubuntu:/# cat /proc/asound/cards
 0 [s100snd2       ]: s100snd2 - s100snd2
                      s100snd2
```

- 检查/dev/snd/节点

```text
root@ubuntu:/# ls -l /dev/snd
total 0
crw-rw-r--+ 1 root misc 116,  4 Apr 29 19:09 controlC0
crw-rw-r--+ 1 root misc 116,  2 Apr 29 19:09 pcmC0D0c
crw-rw-r--+ 1 root misc 116,  3 Apr 29 19:09 pcmC0D1p
```

声卡加载成功后功能测试参考命令：

```text
arecord -Dhw:0,0 -c 2 -r 16000 -f S16_LE -t wav -d 5 test.wav
aplay -Dhw:0,1 test.wav
```

注意
PDMA 驱动限制数据大小满足64字节对齐。

这里特别强调在配置 period-size 值时，设置值需满足字节对齐要求。

arecord/aplay 对应参数配置：--period-size=X

### 常用调试手段

#### 调整 debug log 等级

```text
echo "8 4 1 7" > /proc/sys/kernel/printk
echo -n "file hhobot-cpudai-super.c +p" > /sys/kernel/debug/dynamic_debug/control
echo -n "file hobot-i2s-super.c +p" > /sys/kernel/debug/dynamic_debug/control
echo -n "file hobot-platform-super.c +p" > /sys/kernel/debug/dynamic_debug/control
```

#### ALSA profs 节点说明

profs 是 linux 的一个文件系统，提供关于内核数据结构的接口。挂载目录为 `/proc` 。

ALSA procfs 挂载目录为： `/proc/asound` ，ALSA 使用 `/proc/asound` 目录下的文件保存设备信息和控制目的。通过 proc 节点，我们可以快速查看某些信息用于定位调试遇到的问题。

##### /proc/asound/cards

已注册声卡的列表。通过查看该节点，检查当前系统注册的声卡列表或者检查声卡是否注册成功

##### /proc/asound/pcm

分配的 pcm 流设备的信息。通过查看该节点，找到当前声卡支持的设备列表。这有助于测试时选择如何设置设备节点的 card/device 值。

##### /proc/asound/cardX/pcmY[c, p]/*

系统中声卡对应的每个 pcm 流设备都有一个类似上面的 procfs 目录。其中 X 代表声卡号， `/proc/asound/cards` 或者 `/dev/snd` 下的设备节点信息可确认； Y 代表设备号， `/proc/asound/pcm或者/dev/snd` 下的设备节点信息可确认。c/p 分别代表 capture/playback。该目录可查看 PCM 设备的信息以及 status。

###### info

pcm 流的一般信息，比如声卡号、设备号、流类型、所绑定的 codec 类型等

###### hw_params

pcm 流打开状态下，可以查看 pcm 的基础参数配置。比如采样率、位宽、通道数、period_size、buffer_size 等。配置的 period_size、buffer_size 可能与这里打印的值不同。实际以这里查看为准，对应的是硬件的实际参数

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

###### sw_params

pcm 流打开状态下，查看 start_threshold、stop_threshold、silence_threshold 等。重点关注 start_threshold、stop_threshold 阈值

start_threshold: 该值设置太大，从开始播放到声音出来延时太长，会导致太短促的声音播不出来

stop_threshold: 判断是否触发 xrun 的条件。当可用空间大小超过该值时，会触发 xrun。

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

###### status

可查看当前 substream 的状态(running、xrun 等)，appl_ptr/hw_ptr 指针的值。其中，hw_ptr 和 app_ptr 可以识别底层硬件无法传输或接收任何数据的情况。 比如，启动测试但是中断未正常触发，数据传输将会停滞。此时，hw_ptr/appl_ptr 指针将持续得不到更新

#### xrun

音频在播放时偶现或者连续某个时间段出现断断续续、声音类似"呲呲"或者"爆破"的杂音， 一般是发生了 xrun。xrun 丢帧受系统性能限制不可避免，在满足使用场景的需求下，允许有一定的丢帧率，只能通过某些方法优化达到尽量规避。如果出现 xrun 频发，无法恢复的情况，就需要排查代码实现上是否有缺陷

##### 可能出现 xrun 的场景

播放时，应用会不断把音频数据填入驱动 buffer，驱动 buffer 经过 i2s fifo 送给 codec 播放。当应用填入慢了，导致驱动 buffer 为空，就会触发 underrun 导致丢帧，可能会有声音异常的现象

录音时，codec 转化的数字信号经过 i2s fifo 填入驱动 buffer ，应用会从驱动 buffer 中读取音频数据。当应用读取的速度赶不上写入的速度，超过 stop_threshold 阈值就会触发 overrun

##### 定位 xrun

检查 xrun 是否由于 IO 操作耗时导致

- 音频文件写入 ram disk 或者特定的设备文件，参考命令

```text
写入ram disk
mkdir /data/audio_test
tinycap /data/audio_test/test.wav

特定的设备文件
tinycap /dev/null
```

注意，以上只能用于定位 xrun 是否由于 IO 操作耗时导致，不能作为解决 xrun 的方案

- 优化应用程序测试
使用独立的线程访问媒体存储和读写 PCM 设备。 以录音为例，写文件创建单独的线程和创建 ring buffer(ring buffer 大小可自由调整)，pcm_read 的 buffer 写入 ring buffer，fwrite 从 ring buffer 读取数据。只要 fwrite 陷入时间不超过 ring buffer 的限制，就不会发生 xrun 导  致数据。

- 依靠/proc 下配置功能查看信息
开启编译 xrun_debug 的 config 配置项。编译并重新烧写镜像。（如果 xrun_debug 存在，表示该功能处于使能状态，不需要执行这一步）

```text
CONFIG_SND_PCM_XRUN_DEBUG=y
CONFIG_SND_VERBOSE_PROCFS=y
CONFIG_SND_DEBUG=y
```

proc 节点对应位置 `/proc/asound/cardX/pcmY[c,p]/xrun_debug`

比如，往 xrun_debug 写入3，也就是启用基本调试和堆栈功能，可以查看 PCM 流是否由于某种原因而停止

```text
# Enable basic debugging and dump stack
# Usefull to just see, if PCM stream is stopped for a reason (usually wrong audio process timing from scheduler)
echo 3 > /proc/asound/card0/pcm0p/xrun_debug
```

##### 修复 xrun

- 提高线程优先级(设置实时线程+优先权值)
- 调大 period_size，改变 DMA 传输数据量
- 异步实现 I/O 读写和 ALSA 设备读写

### 通用问题

#### 打开设备节点报错

- Unable to open PCM device (cannot open device '/dev/snd/pcmC0D3c': No such file or director)

- 驱动加载失败，导致/dev/snd 下没有生成设备节点；
- 设置的 card/device 值错误导致找不到对应的设备节点；
其中，/dev/snd 下没有生成设备节点的可能原因：

- i2s/codec 驱动加载失败，可以通过 dmesg 看是否有以下信息打印

```text
soc:sndcard@0: BUG: Can't get codec
soc:sndcard@0: BUG: Can't get cpu
probe of soc:sndcard@0 failed with error -22
```

- dts 中各驱动节点的 status 属性未设置"okay"状态，导致驱动加载时不会执行任何操作。可以在驱动加载后，通过 dmesg 查看是否有类似 success register cpu dai0 driver 信息打印
- Unable to open PCM device (cannot set hw params: Unknown error -22)
当前测试设置的参数值，超过 i2s 和 codec 驱动中对于 snd_soc_dai_driver 定义的 rate、format、channel 最值范围交集

- 打开设备节点卡住，应用无任何 log 日志打印
ALSA 框架允许单个设备同一时刻只能打开一次。检查应用实现上，是否存在上次执行还未退出的情况下，又启动应用

##### 录制/播放问题

- pcm_read/pcm_write 返回异常值为-5
调整 ALSA 框架 log 打印等级，检查是否由于中断或者硬件链接导致中断没有产生引起异常

```text
echo "8 4 1 7" > /proc/sys/kernel/printk
echo -n "file pcm_lib.c +p" > /sys/kernel/debug/dynamic_debug/control
```

出现 `write error (DMA or IRQ trouble?)` 打印，说明没有中断。需要检查寄存器配置以及硬件链接情况

- pcm_read/pcm_write 返回异常值为-32
一般  是发生了 xrun

- pcm_read 返回异常值为-16
正常录音(S100做 slave)时，时钟突然断掉或者硬件连接中断会发生该异常

正常录音(S600做 slave)时，时钟突然断掉或者硬件连接中断会发生该异常

- 录制数据均为0或者播放没有声音

- 示波器测量 i2s 的时钟线频率是否正常，data 线是否有数据输出。
- 如果时钟频率不符合预期或者量到某个时钟信号持续保持低电平的情况，检查 i2s 寄存器的配置是否符合预期。比如主从模式、时钟比值状态
- 如果以上没有问题，就需要检查 codec 芯片是否正常工作。播放一个正弦波，测量 codec 侧模拟信号的输出，如果这里没有输出，确认 codec 的时钟比值配置和 J5端是否匹配，以及当前 S100端的时钟比值是否在 codec 可支持范围。
- 如果 codec 的输出也能量到准确的信号，检查功放芯片是否正常工作。确认功放芯片各管脚幅值是否正常
- 录制/播放噪声
一些 codec 设计的时候，codec 做 slave 时，需要芯片的驱动时钟和 bclk/lrclk 时钟同源，否则在录音的时候会出现数据跳变或者重复的问题，导致产生噪声

## 音频子板使用说明

### 音频子板介绍

这里以 Audio Driver HAT REV2音频子板与 **S100** 开发板连接为例进行说明。

音频子板包含2颗 es7210芯片，I2C 地址为0x40/0x42，可以录制8通道音频，其中4路接收模拟 mic，2路 aec 回采喇叭数据；

包含1颗 es8156芯片，I2C 地址为0x8，可以播放2通道音频，连接耳机或者喇叭最终播放声音；

实物如下图所示，其中红圈为 es7210，黄圈为 es8156，绿圈为4mic。

![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/audio1.png)
### 音频子板与开发板连接

连接方式如下图：

![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/audio2.png)**注意事项** ：40pin 上的 PCM pin 脚与 PCIE 的 Wi-Fi 模组复用，硬件上提供了拨码开关实现 pin 脚功能切换。

拨码开关切换 pin 脚功时，将上面的 40 PIN 拨码左拨，下面的 PCM 拨码右拨。如下图：

![](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/audio3.png)
