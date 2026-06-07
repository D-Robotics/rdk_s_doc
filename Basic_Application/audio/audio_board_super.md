# 3.2.1 音频使用指南

URL: https://developer.d-robotics.cc/rdk_s_doc/Basic_Application/audio/audio_board_super

音频模块基于标准 alsa 框架进行开发，用户空间使用开源代码 alsa-lib 提供的库和二进制 bin 进行功能测试。该章节基于此说明音频功能测试的基本方法。

## alsa-lib 介绍

S100 基于 alsa 实现，以下说明常用参数配置含义以及测试参考命令。

S600 基于 alsa 实现，以下说明常用参数配置含义以及测试参考命令。

### arecord/aplay 参数介绍

- 常用参数说明

| 参数 | 说明 | 引申含义 
| -D | 指定设备节点信息。通过 hw :x ,x 设置 | x,x 分别对应声卡号和设备号 
| -c | Channel：声道数，分为单声道 mono 和立体声 stereo，还有多声道如 8/16 通道通道数 |  
| -r | Rate：又称 sample rate，采样率，即每秒的采样次数 |  
| -f | 样本长度 | 常见位宽格式设置：U8/S16_LE/S32_LE 
| -t | 文件类型。 | 包含 wav、voc、raw 等 
| -d | 录音时间（以秒为单位）。录制指定时长后结束 |  
| --period-size | 每次硬件中断处理音频数据的帧数 |  
| --buffer-size | 数据缓冲区大小 |  
| -I | 非交错方式 |  

- 常用命令

- 列出声卡和数字音频设备信息

```text
arecord -l
aplay -l
```

- 硬件支持能力

```text
arecord --dump-hw-params -Dhw:0,0
aplay --dump-hw-params -Dhw:0,1 /dev/zero
```

- 回环测试命令

```text
arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 10 | aplay -Dhw:0,1
```

- 非交错方式数据存储。注意：非交错存储的数据是 PCM 裸流

```text
arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 5 -I 0
aplay -Dhw:0,1 -c 2 -r 48000 -f S16_LE -t wav -I 0
```

- 交错方式数据存储

```text
arecord -Dhw:0,0 -c 2 -r 16000 -f S16_LE -t wav -d 5 test.wav
aplay -Dhw:0,1 test.wav
```

### 控制命令

- 查询当前 codec 的所有 control 信息以及对应值

```text
amixer scontrols
amixer scontents
```

- 参数调整
比如调整播放音量值

```text
amixer sset 'DAC' 120 //设置
amixer sget 'DAC' //获取
```

注意
默认声卡/设备号是0,0，如果实际场景接入多个声卡设备，需要通过-D，-c 指定设备、声卡号。

确认当前要调整的声卡/设备号方法：

- arecord -l

```text
**** List of CAPTURE Hardware Devices ****
card 0: s100snd2 [s100snd2], device 0: s100dailink0 ES7210 4CH ADC 0-0 []
  Subdevices: 1/1
  Subdevice #0: subdevice #0
```

- /proc/asound/cards 节点

```text
root@ubuntu:/userdata# cat /proc/asound/cards
 0 [s100snd2       ]: s100snd2 - s100snd2
                      s100snd2
```

### 应用空间接口

API 描述及使用参考官方文档介绍： [https://www.alsa-project.org/alsa-doc/alsa-lib/pcm_2pcm_8c.html](https://www.alsa-project.org/alsa-doc/alsa-lib/pcm_2pcm_8c.html)

## 适配音频子板介绍

### S100

#### Audio Driver HAT REV2

##### 使用准备

S100适配微雪电子生产的音频转接板，通过40PIN 实现和 S100开发板连接。子板介绍和具体连接方法参考： [音频子板使用说明](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_audio#%E9%9F%B3%E9%A2%91%E5%AD%90%E6%9D%BF%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E)

##### 设备节点

该音频板接入 S100加载驱动后，生成的设备节点：

- pcmC0D0c：录音
- pcmC0D1p：播放
- controlC0：控制

##### 功能测试

- 录音

```text
arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 5 test.wav
```

表示录制5s，48k/2ch/16bit 位宽的 wav 音频文件。数据格式用户可以根据自己的需求调整并设置。

- 播放

```text
aplay -Dhw:0,1 test.wav
```

表示播放一个 wav 文件，数据格式会解析 wav 文件头获取并写入驱动

## 音频回采测试

音频回采功能可用于采集播放通道的信号，便于做回声消除等。以下介绍以 Audio Driver HAT REV2音频板为示例说明。

- **8通道麦克风录音（含回采）** Audio Driver HAT REV2音频板的回采信号映射在录音通道 7 和 8 。需使用 8 通道录音命令（如果使用同一个 I2S ，需要保持通道数、位深、采样率对齐，这款转接板根据拨码开关固定了一路 I2S）：

```shell
arecord -Dhw:0,0 -c 8 -r 48000 -f S16_LE -t wav -d 5 ./8chn_test.wav --period-size=256 --buffer-size=1024
```
- **同时启动格式对齐的8通道音频播放**

```shell
aplay -Dhw:0,1 1khz.wav --period-size=1024 --buffer-size=1024
```

这个 `1khz.wav` 可以是自己制作的格式对齐的正弦波音频文件，这样方便分析。
- **分析回采信号** 录制完成后，可使用如 Audacity 等音频分析软件，打开 `8chn_test.wav` ，查看第 7 、 8 通道的频谱频率是否符合预期，验证回采功能是否正常。

## 常见问题排查

- 若未检测到声卡，请检查硬件连接和拨码开关设置是否正确。
- 若录音或播放无声，请确认音频文件格式、通道数与命令参数一致。
- 若回采通道无信号，请确认已正确使用 8 通道录音命令，如果是使用了同一组 I2S ，请确认数据格式是否一致。

## S600

### USB 声卡

适配的 USB 声卡官网使用说明文档： [https://wiki.seeedstudio.com/respeaker_xvf3800_introduction](https://wiki.seeedstudio.com/respeaker_xvf3800_introduction)

USB 声卡验证说明：

1. 无需额外编译驱动和使能配置项。
2. 参考官网说明文档，将设备和 S600连接。
3. 功能验证说明如下： ls /dev/snd 查看是否有 `pcmC*D*` 节点。有说明 usb 声卡加载成功
查看声卡支持属性

```text
arecord -Dhw:1,0 --dump-hw-params
```

通过这一步，我们可以了解到该 USB 声卡支持配置的通道数/采样率/位宽属性值，进而在测试录音/播放功能时指定相关参数。

录音命令

```text
arecord -Dhw:1,0 -c 2 -r 16000 -f S16_LE -t wav -d 10 test.wav
```

播放命令

```text
aplay -Dhw:1,0 test.wav
```

### 其他声卡

S600预留了14PIN，包含 I2S/I2C 接口。

当前仅支持通过杜邦线方式与音频子板进行连接。连接时请注意以下事项：

1. 14PIN 接口的 IO 电压为1.8V。若音频子板使用 IO 电压是3.3V，需通过电平转换或电源转换芯片进行适配，避免直接连接导致器件损坏。
2. 除 I2S/I2C 信号线外，还必须正确连接 GND 及 VCC，以确保音频子板正常工作。
