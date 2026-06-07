# 8.4 Multimedia Processing and Applications

URL: https://developer.d-robotics.cc/rdk_s_doc/en/FAQ/multimedia

This section answers common questions about video encoding/decoding, audio processing, and other multimedia features on D-Robotics RDK boards.

## Video Encoding and Decoding

### Q1: The board reports an error when decoding an RTSP video stream (as shown below). What could be the cause?

![RTSP decoding error screenshot](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/multimedia/image-20220728110439753.png)**A:** RTSP video stream decoding errors are commonly caused by the following issues and solutions:

1. **The stream is missing PPS and SPS parameter information:**
- **Cause:** RTSP streams pushed by the streaming server (especially H.264 format) must contain `PPS` (Picture Parameter Set) and `SPS` (Sequence Parameter Set) parameter information. The decoder needs this information to parse the video correctly.
- **Solution:**
- If you use `ffmpeg` to stream from a video file (such as `.mp4` or `.avi` ), it is recommended to add the `-bsf:v h264_mp4toannexb` (H.264 Bitstream Filter: MP4 to Annex B) option to the command (note: in newer versions of ffmpeg, `-vbsf` has been replaced by `-bsf:v` ). This filter automatically adds `PPS` and `SPS` information to the stream. **`ffmpeg` streaming command example:**
```text
ffmpeg -re -stream_loop -1 -i xxx.mp4 -c:v copy -bsf:v h264_mp4toannexb -f rtsp rtsp://192.168.1.195:8554/h264_stream
```

(Replace `xxx.mp4` with your video file name, and replace the RTSP server address `rtsp://192.168.1.195:8554/h264_stream` with the actual address.)
2. **Cause:** RTSP streams pushed by the streaming server (especially H.264 format) must contain `PPS` (Picture Parameter Set) and `SPS` (Sequence Parameter Set) parameter information. The decoder needs this information to parse the video correctly.
3. **Solution:**
- If you use `ffmpeg` to stream from a video file (such as `.mp4` or `.avi` ), it is recommended to add the `-bsf:v h264_mp4toannexb` (H.264 Bitstream Filter: MP4 to Annex B) option to the command (note: in newer versions of ffmpeg, `-vbsf` has been replaced by `-bsf:v` ). This filter automatically adds `PPS` and `SPS` information to the stream. **`ffmpeg` streaming command example:**
```text
ffmpeg -re -stream_loop -1 -i xxx.mp4 -c:v copy -bsf:v h264_mp4toannexb -f rtsp rtsp://192.168.1.195:8554/h264_stream
```

(Replace `xxx.mp4` with your video file name, and replace the RTSP server address `rtsp://192.168.1.195:8554/h264_stream` with the actual address.)
4. If you use `ffmpeg` to stream from a video file (such as `.mp4` or `.avi` ), it is recommended to add the `-bsf:v h264_mp4toannexb` (H.264 Bitstream Filter: MP4 to Annex B) option to the command (note: in newer versions of ffmpeg, `-vbsf` has been replaced by `-bsf:v` ). This filter automatically adds `PPS` and `SPS` information to the stream. **`ffmpeg` streaming command example:**
```text
ffmpeg -re -stream_loop -1 -i xxx.mp4 -c:v copy -bsf:v h264_mp4toannexb -f rtsp rtsp://192.168.1.195:8554/h264_stream
```

(Replace `xxx.mp4` with your video file name, and replace the RTSP server address `rtsp://192.168.1.195:8554/h264_stream` with the actual address.)
5. **Resolution support limitations:**
- Currently, RDK boards may only support decoding RTSP video streams up to certain resolutions, such as **1080p (1920x1080)** . Please confirm whether your RTSP stream resolution is within the supported range. Refer to the documentation for your specific board model for the accurate support list.
6. Currently, RDK boards may only support decoding RTSP video streams up to certain resolutions, such as **1080p (1920x1080)** . Please confirm whether your RTSP stream resolution is within the supported range. Refer to the documentation for your specific board model for the accurate support list.
7. **Streaming software compatibility:**
- **VLC direct streaming is not recommended:** Using VLC to push RTSP streams directly may fail to be decoded by RDK, because VLC may not support actively adding or ensuring `PPS` and `SPS` information during streaming in some configurations. It is recommended to use `ffmpeg` or other professional streaming tools that ensure complete stream parameters.
8. **VLC direct streaming is not recommended:** Using VLC to push RTSP streams directly may fail to be decoded by RDK, because VLC may not support actively adding or ensuring `PPS` and `SPS` information during streaming in some configurations. It is recommended to use `ffmpeg` or other professional streaming tools that ensure complete stream parameters.

## Common Audio Issues

### Q2: The examples use tinyalsa. What do the parameters mean and how do I use them?

**A:**`tinyalsa` is a lightweight audio library mainly used for Android and embedded Linux systems. It provides a simplified interface to ALSA (Advanced Linux Sound Architecture), making audio development easier for developers. The following are commonly used `tinyalsa` commands and their parameter meanings:

1. **List all sound cards:**
```bash
tinymix -l
```

This command lists all recognized sound cards and their controls in the system. If `tinymix -l` does not work, you can run `cat /proc/asound/cards` directly to check.
2. **List controls for a specific sound card:**
```bash
tinymix -c <card_number> -l
```

Where `<card_number>` is the sound card index. This command lists all controls for the specified sound card. Depending on the tinymix version, the required command may differ; you can also try commands such as `tinymix -D <card_number> controls` .
3. **Get the value of a specific control:**
```bash
tinymix -c <card_number> <control_name>
```

This command displays the current value of a control on the specified sound card. For example:
```bash
tinymix -c 0 'ADC PGA Gain'
```

This displays the current value of the control named `ADC PGA Gain` on sound card 0.
4. **Set the value of a specific control:**
```bash
tinymix -c <card_number> <control_name> <value>
```

This command sets the value of a control on the specified sound card. For example:
```bash
tinymix -c 0 'ADC PGA Gain' 80%
```

This sets the control named `ADC PGA Gain` on sound card 0 to 80%.
5. **View the current audio status:**
```bash
tinymix -c <card_number> -s
```

This command displays the current audio status of the specified sound card, including the current values of all controls.
6. **Play an audio file:**
```bash
tinyplay <file_name>
```

This command plays the specified audio file. `<file_name>` is the path and name of the audio file. For example:
```bash
tinyplay /path/to/audio.wav
```

This plays the specified audio file.
7. **Record audio:**
```bash
tinycap <file_name> -D <card_number> -d <device_number> -c <channels> -b <bit_depth> -r <sample_rate> -p <period_size> -n <periods> -t <duration>
```

This command records audio and saves it to the specified file. Parameter meanings:
- `<file_name>` : Name of the recorded audio file.
- `-D <card_number>` : Specify the sound card index.
- `-d <device_number>` : Specify the device index (usually the PCM device).
- `-c <channels>` : Specify the number of recording channels (for example, 2 for stereo, 4 for four channels).
- `-b <bit_depth>` : Specify the audio bit depth (for example, 16 for 16-bit).
- `-r <sample_rate>` : Specify the sample rate (for example, 48000 for 48 kHz).
- `-p <period_size>` : Specify the period size (in frames).
- `-n <periods>` : Specify the number of periods.
- `-t <duration>` : Specify the recording duration (in seconds).
- **Example:**

```bash
tinycap ./recorded_audio.wav -D 0 -d 1 -c 2 -b 16 -r 48000 -p 512 -n 4 -t 5
```

This command uses device 1 on sound card 0 to record 2-channel 16-bit 48 kHz audio for 5 seconds and saves it as `recorded_audio.wav` .
8. `<file_name>` : Name of the recorded audio file.
9. `-D <card_number>` : Specify the sound card index.
10. `-d <device_number>` : Specify the device index (usually the PCM device).
11. `-c <channels>` : Specify the number of recording channels (for example, 2 for stereo, 4 for four channels).
12. `-b <bit_depth>` : Specify the audio bit depth (for example, 16 for 16-bit).
13. `-r <sample_rate>` : Specify the sample rate (for example, 48000 for 48 kHz).
14. `-p <period_size>` : Specify the period size (in frames).
15. `-n <periods>` : Specify the number of periods.
16. `-t <duration>` : Specify the recording duration (in seconds).
17. **Example:**

### Q3: How do I distinguish and use USB sound cards and onboard sound cards on RDK boards, especially when multiple audio devices are connected?

**A:** When both an onboard sound card (for example, via an audio expansion board) and a USB sound card are connected to an RDK board, the Linux audio system (ALSA) assigns different sound card indices to them. You need to know the correct sound card index to control a specific audio device precisely.

1. **View recognized sound cards and their indices:** Use the following command to list all recognized sound cards in the system along with their indices and names:

```bash
cat /proc/asound/cards
```

**Example output (assuming the USB sound card registers first and the onboard sound card registers second):**

```text
0 [RC08          ]: USB-Audio - ROCWARE RC08
                      ROCWARE RC08 at usb-xhci-hcd.2.auto-1.2, high speed
 1 [duplexaudio   ]: simple-card - duplex-audio
                      duplex-audio
```

In this example:

- USB sound card `ROCWARE RC08` is assigned sound card index **0** .
- Onboard sound card `duplexaudio` (this is usually the name of the RDK audio expansion board) is assigned sound card index **1** .
- **Note:** Sound card index assignment may change depending on device insertion order, driver loading order, and other factors. If the USB sound card is inserted after system boot, it may receive a larger index.
2. USB sound card `ROCWARE RC08` is assigned sound card index **0** .
3. Onboard sound card `duplexaudio` (this is usually the name of the RDK audio expansion board) is assigned sound card index **1** .
4. **Note:** Sound card index assignment may change depending on device insertion order, driver loading order, and other factors. If the USB sound card is inserted after system boot, it may receive a larger index.
5. **Use `amixer` or `tinymix` to operate on a specific sound card:**

- When you use tools such as `amixer` (ALSA Mixer command-line utility) or `tinymix` to view or adjust audio parameters, if you do not specify the card and device numbers, they usually operate on sound card 0 by default.
- To operate on a specific sound card, use the `-c <card_number>` (or `-c<card_number>` ) parameter to specify the sound card index, and possibly `-D hw:<card_number>` or `-d <device_number>` as needed.
- **View controls for a specific sound card (for example, the onboard sound card with index 1 in the example above):**
```bash
amixer -c 1 controls
# Or use the hardware device name: amixer -D hw:1 controls
```
- **Get or set the value of a control on a specific sound card (for example, get the value of the first control named 'ADC PGA Gain' on onboard sound card 1):**
```bash
amixer -c 1 sget 'ADC PGA Gain',0
```

To set a value, use `sset` instead of `sget` , for example: `amixer -c 1 sset 'ADC PGA Gain',0 80%` .
6. When you use tools such as `amixer` (ALSA Mixer command-line utility) or `tinymix` to view or adjust audio parameters, if you do not specify the card and device numbers, they usually operate on sound card 0 by default.
7. To operate on a specific sound card, use the `-c <card_number>` (or `-c<card_number>` ) parameter to specify the sound card index, and possibly `-D hw:<card_number>` or `-d <device_number>` as needed.
8. **View controls for a specific sound card (for example, the onboard sound card with index 1 in the example above):**
```bash
amixer -c 1 controls
# Or use the hardware device name: amixer -D hw:1 controls
```
9. **Get or set the value of a control on a specific sound card (for example, get the value of the first control named 'ADC PGA Gain' on onboard sound card 1):**
```bash
amixer -c 1 sget 'ADC PGA Gain',0
```

To set a value, use `sset` instead of `sget` , for example: `amixer -c 1 sset 'ADC PGA Gain',0 80%` .
Using the methods above, you can accurately identify and control different audio devices connected to RDK boards.

### Q4: How does RDK S100 support audio features through the graphical interface?

1. Modify the PulseAudio configuration file: `/etc/pulse/default.pa`

The default `fragment_size` set when the PulseAudio server starts does not meet the PDMA requirement of 64-byte alignment, so the default configuration must be modified to ensure the PulseAudio service loads successfully.

Reference configuration changes:

```text
.ifexists module-udev-detect.so
    load-module module-alsa-sink device=hw:0,1 mmap=false tsched=0 fragments=2 fragment_size=1920 rate=48000 channels=2 // add
    load-module module-alsa-source device=hw:0,0 mmap=false tsched=0 fragments=2 fragment_size=1920 rate=48000 channels=2 // add
    # load-module module-udev-detect // comment out
```

tip
In the configuration above, `X` in `device=hw:X,Y` represents the sound card number and `Y` represents the device number. Configure them according to your actual requirements. For how to confirm sound card/device numbers, see [Control Commands](/rdk_s_doc/en/Basic_Application/audio/audio_board_super#control-commands) .
2. After saving the configuration, restart the system. Once the audio driver is loaded, the graphical interface features will work normally.
