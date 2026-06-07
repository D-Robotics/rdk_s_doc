# 3.2.1 Audio User Guide

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Basic_Application/audio/audio_board_super

The audio module is developed based on the standard ALSA framework. In user space, the open-source code libraries and binaries provided by `alsa-lib` are used for functional testing. This section describes the basic methods for testing audio functionality based on this framework.

## Introduction to alsa-lib

The S100 is implemented based on ALSA. The following explains the meaning of common parameter configurations and provides reference commands for testing.

The S600 is implemented based on ALSA. The following explains the meaning of common parameter configurations and provides reference commands for testing.

### arecord/aplay Parameter Introduction

- Common Parameters Description

| Parameter | Description | Extended Meaning 
| -D | Specifies the device node information. Set via `hw:x,x` | `x,x` corresponds to the sound card number and device number respectively 
| -c | Channel: number of channels, including mono, stereo, and multi-channel such as 8/16 channels |  
| -r | Rate: also known as sample rate, the number of samples per second |  
| -f | Sample format | Common bit width format settings: U8/S16_LE/S32_LE 
| -t | File type | Includes wav, voc, raw, etc. 
| -d | Recording duration (in seconds). Ends after the specified duration |  
| --period-size | Number of frames for each hardware interrupt to process audio data |  
| --buffer-size | Size of the data buffer |  
| -I | Non-interleaved mode |  

- Common Commands

- List sound card and digital audio device information

```text
arecord -l
aplay -l
```

- Hardware capabilities

```text
arecord --dump-hw-params -Dhw:0,0
aplay --dump-hw-params -Dhw:0,1 /dev/zero
```

- Loopback test command

```text
arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 10 | aplay -Dhw:0,1
```

- Non-interleaved data storage. Note: Non-interleaved stored data is raw PCM stream

```text
arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 5 -I 0
aplay -Dhw:0,1 -c 2 -r 48000 -f S16_LE -t wav -I 0
```

- Interleaved data storage

```text
arecord -Dhw:0,0 -c 2 -r 16000 -f S16_LE -t wav -d 5 test.wav
aplay -Dhw:0,1 test.wav
```

### Control Commands

- Query all control information and corresponding values of the current codec

```text
amixer scontrols
amixer scontents
```

- Parameter adjustment
For example, adjust the playback volume value

```text
amixer sset 'DAC' 120 // set
amixer sget 'DAC' // get
```

Note
The default sound card/device number is 0,0. If multiple sound card devices are connected in the actual scenario, you need to specify the device and sound card number via -D, -c.

Methods to confirm the sound card/device number to be adjusted:

- `arecord -l`

```text
**** List of CAPTURE Hardware Devices ****
card 0: s100snd2 [s100snd2], device 0: s100dailink0 ES7210 4CH ADC 0-0 []
  Subdevices: 1/1
  Subdevice #0: subdevice #0
```

- `/proc/asound/cards` node

```text
root@ubuntu:/userdata# cat /proc/asound/cards
 0 [s100snd2       ]: s100snd2 - s100snd2
                      s100snd2
```

### Application Space Interface

For API descriptions and usage, refer to the official documentation: [https://www.alsa-project.org/alsa-doc/alsa-lib/pcm_2pcm_8c.html](https://www.alsa-project.org/alsa-doc/alsa-lib/pcm_2pcm_8c.html)

## Introduction to the Adapted Audio Daughter Board

### S100

#### Audio Driver HAT REV2

##### Preparation for Use

The S100 is adapted to the audio adapter board produced by Waveshare Electronics, connected via the 40-pin interface to the S100 development board. For daughter board introduction and specific connection methods, refer to: [Audio Daughter Board User Guide](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_audio#audio-daughter-board-user-guide)

##### Device Nodes

After connecting this audio board to the S100 and loading the driver, the following device nodes are generated:

- `pcmC0D0c` : Recording
- `pcmC0D1p` : Playback
- `controlC0` : Control

##### Functional Testing

- Recording

```text
arecord -Dhw:0,0 -c 2 -r 48000 -f S16_LE -t wav -d 5 test.wav
```

This records a 5-second wav audio file with 48k/2ch/16bit bit width. Users can adjust the data format according to their needs.

- Playback

```text
aplay -Dhw:0,1 test.wav
```

This plays a wav file. The data format is parsed from the wav file header and written to the driver.

## Audio Loopback Capture Test

The audio loopback capture function can be used to capture signals from the playback channel, facilitating echo cancellation, etc. The following uses the Audio Driver HAT REV2 audio board as an example.

- **8-channel Microphone Recording (including loopback)** The loopback signal of the Audio Driver HAT REV2 audio board is mapped to recording channels 7 and 8. An 8-channel recording command is required (if using the same I2S, the number of channels, bit depth, and sample rate must be aligned; this adapter board fixes one I2S line via DIP switches):

```shell
arecord -Dhw:0,0 -c 8 -r 48000 -f S16_LE -t wav -d 5 ./8chn_test.wav --period-size=256 --buffer-size=1024
```
- **Simultaneously start format-aligned 8-channel audio playback**

```shell
aplay -Dhw:0,1 1khz.wav --period-size=1024 --buffer-size=1024
```

The `1khz.wav` file can be a self-made format-aligned sine wave audio file for easier analysis.
- **Analyze the loopback signal** After recording, use audio analysis software such as Audacity to open the `8chn_test.wav` file and check whether the spectral frequencies of channels 7 and 8 meet expectations, verifying that the loopback function is working properly.

## Common Issue Troubleshooting

- If the sound card is not detected, please check whether the hardware connection and DIP switch settings are correct.
- If recording or playback is silent, please confirm that the audio file format and number of channels match the command parameters.
- If there is no signal on the loopback channel, please confirm that the 8-channel recording command was used correctly. If the same I2S line is used, please confirm that the data formats are consistent.

## S600

### USB Sound Card

Official user guide for the adapted USB sound card: [https://wiki.seeedstudio.com/respeaker_xvf3800_introduction](https://wiki.seeedstudio.com/respeaker_xvf3800_introduction)

Instructions for verifying the USB sound card:

1. No additional driver compilation or configuration enabling is required.
2. Refer to the official documentation to connect the device to the S600.
3. Functional verification instructions: Run `ls /dev/snd` to check for `pcmC*D*` nodes. Their presence indicates the USB sound card loaded successfully.
Check the sound card's supported properties

```text
arecord -Dhw:1,0 --dump-hw-params
```

Through this step, we can understand the channel count/sample rate/bit width property values supported by this USB sound card, and then specify relevant parameters when testing recording/playback functions.

Recording command

```text
arecord -Dhw:1,0 -c 2 -r 16000 -f S16_LE -t wav -d 10 test.wav
```

Playback command

```text
aplay -Dhw:1,0 test.wav
```

### Other Sound Cards

The S600 provides a 14-pin interface, including I2S/I2C interfaces.

Currently, only connection via jumper wires to an audio daughter board is supported. Please note the following when connecting:

1. The IO voltage of the 14-pin interface is 1.8V. If the IO voltage used by the audio daughter board is 3.3V, a level shifter or power conversion chip must be used for adaptation to avoid direct connection that could damage components.
2. In addition to the I2S/I2C signal lines, GND and VCC must also be correctly connected to ensure the normal operation of the audio daughter board.
