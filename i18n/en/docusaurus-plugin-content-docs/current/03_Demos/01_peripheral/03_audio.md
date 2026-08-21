---
sidebar_position: 3
title: "Audio Application"
description: "Functional test methods for the RDK audio module alsa-lib"
---

# Audio Application

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```


The audio module is developed based on the standard alsa framework. In user space, the libraries and binary executables provided by the open-source alsa-lib code are used for functional testing. This chapter describes the basic methods for audio functional testing.

## Environment Preparation

- Hardware: connect the corresponding audio device for your product (S100: Audio Driver HAT REV2 audio daughter board; S600: USB sound card, or an I2S audio daughter board connected via 14PIN)
- System: RDK OS is flashed and booted
- Dependencies: alsa-utils is preinstalled in the system (provides the `arecord`/`aplay`/`amixer` tools)

## Code Location

There is no standalone audio demo on the board; the system alsa-lib tools are used directly for testing. The source code of the audio configuration tool is located in the SDK `hobot-audio-config` package (`hobot-audio-config/audio_gadget/audio_gadget.c`).

## alsa-lib Introduction

<DocScope products="RDK-S100">

S100 implements audio based on alsa. The following explains the meanings of commonly used parameter configurations and provides reference commands for testing.

</DocScope>

<DocScope products="RDK-S600">

S600 implements audio based on alsa. The following explains the meanings of commonly used parameter configurations and provides reference commands for testing.

</DocScope>

### arecord/aplay Parameter Introduction

- Description of common parameters

| Parameter              | Description                                                         | Extended meaning                                |
|-------------------|--------------------------------------------------------------|-----------------------------------------|
| -D                | Specifies the device node information. Set via hw:x,x                           | x,x correspond to the sound card number and device number respectively             |
| -c                | Channel: number of channels, including mono and stereo, as well as multi-channel such as 8/16 channels |                                         |
| -r                | Rate: also called sample rate, i.e. the number of samples per second             |                                         |
| -f                | Sample length                                                     | Common bit-width format settings: U8/S16_LE/S32_LE     |
| -t                | File type.                                                   | Includes wav, voc, raw, etc.                   |
| -d                | Recording duration (in seconds). Ends after recording the specified duration                   |                                         |
| --period-size     | Number of frames of audio data processed per hardware interrupt                               |                                         |
| --buffer-size     | Data buffer size                                               |                                         |
| -I                | Non-interleaved mode                                                   |                                         |

- Common commands

  - List sound card and digital audio device information

  ```
  arecord -l
  aplay -l
  ```

  - Hardware support capabilities

  ```
  arecord --dump-hw-params -Dhw:0,0
  aplay --dump-hw-params -Dhw:0,1 /dev/zero
  ```

  - Loopback test command

  ```
  arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 10 | aplay -Dhw:0,1
  ```

  - Data storage in non-interleaved mode. Note: data stored in non-interleaved mode is a raw PCM stream

  ```
  arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 5 -I 0
  aplay -Dhw:0,1 -c 2 -r 48000 -f S16_LE -t wav -I 0
  ```

  - Data storage in interleaved mode

  ```
  arecord -Dhw:0,0 -c 2 -r 16000 -f S16_LE -t wav -d 5 test.wav
  aplay -Dhw:0,1 test.wav
  ```

### Control Commands

- Query all control information of the current codec and their corresponding values

```
amixer scontrols
amixer scontents
```

- Parameter adjustment

For example, adjust the playback volume

```
amixer sset 'DAC' 120 //set
amixer sget 'DAC' //get
```

:::info Note

The default sound card/device number is 0,0. If multiple sound card devices are connected in your scenario, you need to specify the device and sound card numbers with -D and -c.
:::

How to determine the sound card/device number to adjust:

:::tip
If `arecord -l` outputs `no soundcards found...`, it means the audio daughter board is not connected or is not recognized by the system. Please check the hardware connection and DIP switch settings first.
:::

- arecord -l

```
**** List of CAPTURE Hardware Devices ****
card 0: s100snd2 [s100snd2], device 0: s100dailink0 ES7210 4CH ADC 0-0 []
  Subdevices: 1/1
  Subdevice #0: subdevice #0
```

- /proc/asound/cards node

```
root@ubuntu:/userdata# cat /proc/asound/cards
 0 [s100snd2       ]: s100snd2 - s100snd2
                      s100snd2
```

### Application Space Interfaces

For API descriptions and usage, refer to the official documentation: https://www.alsa-project.org/alsa-doc/alsa-lib/pcm_2pcm_8c.html





<DocScope products="RDK-S100">

## Adapted Audio Daughter Board Introduction

### S100

#### Audio Driver HAT REV2

##### Usage Preparation

S100 adapts the audio adapter board manufactured by Waveshare Electronics, connecting to the S100 development board via 40PIN. For the daughter board introduction and specific connection methods, refer to: [Audio Daughter Board Usage Instructions](../../07_Advanced_development/04_driver_development/09_driver_audio.md#audio-daughter-board-usage-instructions)

##### Device Nodes

After this audio board is connected to S100 and the driver is loaded, the generated device nodes are:

- pcmC0D0c: recording

- pcmC0D1p: playback

- controlC0: control

##### Functional Testing

- Recording

```
arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 5 test.wav
```

This records a 5-second wav audio file with 48k/2ch/16bit bit width. The data format can be adjusted and set according to user requirements.

- Playback

```
aplay -Dhw:0,1 test.wav
```

This plays a wav file. The data format is parsed from the wav file header and written to the driver.



## Audio Loopback Capture Test

The audio loopback capture feature can be used to capture the signal of the playback channel, which is useful for echo cancellation, etc. The following introduces this using the Audio Driver HAT REV2 audio board as an example.

- **8-channel microphone recording (with loopback capture)**
  The loopback capture signal of the Audio Driver HAT REV2 audio board is mapped to recording channels 7 and 8. The 8-channel recording command must be used (if the same I2S is used, the channel count, bit depth and sample rate must be aligned; this adapter board fixes one I2S channel according to the DIP switches):

  ```shell
  arecord -Dhw:0,0 -c 8 -r 48000 -f S16_LE -t wav -d 5 ./8chn_test.wav --period-size=256 --buffer-size=1024
  ```

- **Start format-aligned 8-channel audio playback simultaneously**

  ```shell
  aplay -Dhw:0,1 1khz.wav --period-size=1024 --buffer-size=1024
  ```
  This `1khz.wav` can be a format-aligned sine wave audio file you create yourself, which makes analysis easier.

- **Analyze the loopback capture signal**
  After recording completes, use audio analysis software such as Audacity to open `8chn_test.wav` and check whether the spectrum frequency of channels 7 and 8 meets expectations, to verify whether the loopback capture feature works properly.

## Common Issue Troubleshooting

- If no sound card is detected, check that the hardware connection and DIP switch settings are correct.
- If recording or playback is silent, confirm that the audio file format and channel count match the command parameters.
- If there is no signal on the loopback capture channels, confirm that the 8-channel recording command is used correctly. If the same I2S group is used, confirm whether the data formats are consistent.

</DocScope>

<DocScope products="RDK S600">


## S600

### USB Sound Card

Official usage documentation for the adapted USB sound card: https://wiki.seeedstudio.com/respeaker_xvf3800_introduction

USB sound card verification notes:
1. No extra driver compilation or configuration enablement is required.
2. Refer to the official documentation to connect the device to the S600.
3. Functional verification is as follows:
Run ls /dev/snd to check whether there are `pcmC*D*` nodes. If so, the USB sound card is loaded successfully.

Check the attributes supported by the sound card
```
arecord -Dhw:1,0 --dump-hw-params
```
From this step, we can learn the channel count/sample rate/bit width attribute values that this USB sound card supports, and then specify the relevant parameters when testing the recording/playback functions.

Recording command
```
arecord -Dhw:1,0 -c 2 -r 16000 -f S16_LE -t wav -d 10 test.wav
```
Playback command
```
aplay -Dhw:1,0 test.wav
```

### Other Sound Cards

S600 provides a reserved 14PIN header, containing I2S/I2C interfaces.

Currently only dupont wire connection to the audio daughter board is supported. When connecting, note the following:

1. The IO voltage of the 14PIN interface is 1.8V. If the audio daughter board uses 3.3V IO voltage, level shifting or a power conversion chip must be used for adaptation to avoid component damage caused by direct connection.

2. In addition to the I2S/I2C signal lines, GND and VCC must also be connected correctly to ensure the audio daughter board works properly.

</DocScope>

## Related Documents

- [Audio Configuration](../../02_System_configuration/10_audio_output.md)
- [Audio Debugging Guide](../../07_Advanced_development/04_driver_development/09_driver_audio.md)
- [C/C++ Demo Programming Guide](../04_demo_support/02_c_cpp_build.md)
