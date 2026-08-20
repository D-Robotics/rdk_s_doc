---
title: "Audio Configuration"
sidebar_position: 10
description: "Audio output device selection and basic control"
---

# Audio Configuration

The RDK board audio can be output from the 3.5mm headphone jack, HDMI, or a USB sound card. Select the output device and adjust the volume via the desktop settings or the command line.

:::info Note
This RDK S600 board has no audio output device connected (no audio codec/sound card). Both `aplay -l` and `arecord -l` report no soundcards; the following commands assume a board with an audio device connected.
:::

## Checking Audio Devices

```bash
aplay -l                  # List playback devices
amixer scontrols          # List adjustable volume controls
```

Measured on RDK S600 (no audio device):

```text
$ aplay -l
aplay: device_list:277: no soundcards found...
$ arecord -l
arecord: device_list:277: no soundcards found...
```

Once an audio device is connected, `aplay -l` will list card/device entries such as `hw:0,0`.

## Selecting the Output Device

On the Desktop edition, select the output device in "Settings → Sound". Command line:

```bash
# List the current default device
pactl info | grep "Default Sink"

# Set the default output (example)
pactl set-default-sink alsa_output.pci-0000_00_01.0
```

Without PulseAudio, use ALSA directly:

```bash
aplay -D hw:0,0 test.wav     # Play on the specified device
```

## Volume Control

```bash
amixer set Master 50%        # Set master volume to 50%
amixer set Master unmute     # Unmute
alsamixer                    # Interactive mixer
```

## Playback Test

```bash
speaker-test -t sine -f 440 -l 1   # Play a 1-second sine test tone
aplay /app/res/assets/chi_sound.wav
```

## FAQ

- **No sound**: Check whether `aplay -l` lists the device; check whether the output is muted (`amixer`); for HDMI audio, you need to select the HDMI sink.
- **USB sound card not recognized**: Verify with `lsusb`, and check the driver loading with `dmesg`.
- **Noise/crackling**: Lower the sample rate, and check the buffer/period settings.

## Related Documents

- [Display Configuration](./09_display_config.md)
- [Bluetooth Configuration](./02_bluetooth_config.md)
- [Package Management apt](./03_system_update/01_apt_usage.md)
