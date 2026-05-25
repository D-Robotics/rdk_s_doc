# sunrise camera User Manual

## Functional Overview

sunrise camera is an official application designed to facilitate rapid evaluation of modules such as Camera, VIO, Codec, and BPU. Users can conveniently configure program parameters via a web browser on a PC and preview video streams, algorithm rendering results, and other information in real time. The main features of the program are as follows:

- Supports smart camera function mode, with support for up to 2 Camera Sensors
- Supports smart multi-channel decoding analysis box function mode  
  - Encoding/decoding capability: Supports encoding or decoding of up to 12 channels of 1080p@30 video streams
  - Box mode decodes video files first and then encodes them for transmission, so box mode supports up to 6 channels of 1080p@30
- Supports parameter configuration through a PC browser, such as Camera sensor, encoding bitrate, algorithm model, video source, etc.
- Supports image preview through PC browser, VLC streaming, HDMI output, and other methods
- Supports switching between multiple algorithm models, such as mobilenet_v2, yolov5s, fcos, etc.

## Hardware Environment Preparation

- Before running sunrise camera, prepare the following accessories:
  - Development board compatible camera, such as SC230AI, SC132GS, F37, etc.
  - One Ethernet cable to ensure connectivity between PC and development board
  - One Micro USB cable (when no Ethernet port is available) for communication between the development board and PC via USB virtual network port

The overall connection method is shown in the figure below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/hardware_connection_diagram.png" alt="hardware_connection_diagram" style={{ width: '100%' }} />

### Network Connection Requirements

To ensure stability during `4K` encoding streaming, it is recommended to directly connect the development board and PC using a Gigabit Ethernet port.

## Compilation and Execution

### Compilation

Enter the directory: `/app/multimedia_samples/sunrise_camera`
Execute the command: `make`
Generated target file: `sunrise_camera`
```sh
root@ubuntu:/app/multimedia_samples/sunrise_camera# ls sunrise_camera/bin/
log  sunrise_camera  www
```

### Execution

sunrise camera supports the following two execution methods:
1. Manual start: Suitable for debugging phase
2. Power-on auto-start: Suitable for deployment in formal scenarios after program debugging is stable

**Manual Start:**

After compiling sunrise camera, execute `sh ./start_app.sh` to start.

**Power-on Auto-start:**
1. Deploy the auto-start file (only needs to be executed once)
```sh
cp sunrise_camera.service /etc/systemd/system/sunrise_camera.service
```

2. Enable power-on auto-start
```sh
# Reload systemd configuration
sudo systemctl daemon-reload

# Start in background
sudo systemctl start sunrise_camera

# Check status: Confirm sunrise_camera has started successfully in background
sudo systemctl status sunrise_camera

# Enable power-on auto-start
sudo systemctl enable sunrise_camera

# Reboot
sync
reboot
```

3. Other commands
```sh
# Disable power-on auto-start
sudo systemctl disable sunrise_camera

# Stop sunrise_camera running in background
sudo systemctl stop sunrise_camera

# Command to view logs after background startup
journalctl -u sunrise_camera.service -f --output=cat
```

## Web Client User Manual

### Main Interface

After sunrise camera starts normally, enter the IP address (default development board IP is 192.168.1.10) in the address bar of Chrome browser to log in to the user control main interface, for example: http://192.168.1.10

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/login_method.png" alt="login_method" style={{ width: '100%' }} />

The interface after successful login is shown below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/home_page.png" alt="home_page" style={{ width: '100%' }} />

The detailed description of the interface menu is as follows:

| Function Number | Description                                                         |
| -------- | ------------------------------------------------------------ |
| 1        | Configure application solution, click to open solution selection and parameter configuration page |
| 2        | Display currently running scenario information               |
| 3        | Display main information of current application solution, such as sensor model, encoding/decoding parameters, algorithm model |
| 4        | Application solution block diagram, understand the data flow of current application solution, click to enlarge for a bigger view |
| 5        | Main video display area, automatically adjust the number of displayed screens based on the number of video channels running in the application solution |
| 6        | Real-time frame rate of preview video                        |
| 7        | Real-time frame rate of algorithm computation                |

### Parameter Configuration Method
1. sunrise camera supports two application solutions: `Smart Camera` and `Smart Analysis Box` (default application solution is `Single-channel Video Analysis Box`)
2. sunrise camera supports online modification of application solutions, selection of camera sensor models, setting decoding/encoding parameters, and selection of algorithm models via the Web interface

#### Smart Camera Configuration Method
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/camera_page.png" alt="camera_page" style={{ width: '100%' }} />

Specific modification steps are as follows:

1. Start the sunrise_camera program, open Chrome browser and enter the device's IP address, for example: http://192.168.1.10
2. Click the `Configure Application Solution` button, marked as `1` in the figure above
3. View current device information, including chip type, software version, rtsp stream link (this link supports pulling rtsp video streams in VLC software, supporting recording, screenshots, etc.), marked as `2` in the figure above
4. Select the application solution, marked as `3` in the figure above. For parameter settings and precautions for each application solution, click the `question mark` button to learn more.
5. Click the `Submit` button to immediately switch the application solution. (Note: Clicking submit alone will not modify the development board's configuration file; it can be used for temporary parameter adjustment during debugging)
6. Click the `Save Current Configuration` button to write the configured settings to the configuration file on the development board. The next time sunrise_camera is restarted, it will start with the current configuration.
7. Click `Restore Default Configuration` to reset user configuration and revert to the `Single-channel Video Analysis Box` configuration.

Note:
1. Camera interfaces correspond one-to-one with CSI interfaces on the circuit board. Only cameras that are actually connected to the hardware and adapted will appear in the enabled Camera interface display
2. If you click the `Save Current Configuration` button but replace the camera during the next power-on, the newly inserted camera will be disabled by default

#### Smart Analysis Box Configuration Method
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/box_page.png" alt="box_page" style={{ width: '100%' }} />

Specific modification steps are as follows:

1. Start the sunrise_camera program, open Chrome browser and enter the device's IP address, for example: http://192.168.1.10
2. Click the `Configure Application Solution` button, marked as `1` in the figure above
3. View current device information, including chip type, software version, rtsp stream link (this link supports pulling rtsp video streams in VLC software, supporting recording, screenshots, etc.), marked as `2` in the figure above
4. Select the application solution, marked as `3` in the figure above. For parameter settings and precautions for each application solution, click the `question mark` button to learn more.
5. Click the `Submit` button to immediately switch the application solution. (Note: Clicking submit alone will not modify the development board's configuration file; it can be used for temporary parameter adjustment during debugging)
6. Click the `Save Current Configuration` button to write the configured settings to the configuration file on the development board. The next time sunrise_camera is restarted, it will start with the current configuration.
7. Click `Restore Default Configuration` to reset user configuration and revert to the `Single-channel Video Analysis Box` configuration.

## Smart Camera Configuration

The smart camera solution implements functions such as Camera sensor image capture, processing, encoding, rtsp streaming, and intelligent computation, helping users quickly experience multimedia image and algorithm effects. The solution function block diagram is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/camera_solution.png" alt="camera_solution" style={{ width: '100%' }} />

The smart camera solution provides the following functions:

- Real-time video monitoring
- Run specified algorithms
- When multiple Camera Sensors are connected, support for enabling multi-channel video preview

### Parameter Description

The smart camera solution has the following adjustable parameters:

- Enable Camera Interface: Displays the list of CSI interfaces that actually have cameras connected, and different interfaces can be enabled as needed
- Sensor Model: The program detects usable Camera Sensor models connected to the device, configure as needed
- Encoding Type: Controls video encoding format, supports H264/H265/Mjpeg, may vary based on hardware capabilities and software support
- Encoding Bitrate: Controls video encoding bitrate. Reference bitrates for different resolutions are as follows:
  - Standard definition video (480p): 256, 512, 768, 1024, 1536, 2048
  - High definition video (720p): 512, 1024, 2048, 3072, 4096, 6144
  - Full HD video (1080p): 1024, 2048, 4096, 6144, 8192, 12288
  - 2K video: 2048, 4096, 8192, 12288, 16384, 24576
  - 4K video: 4096, 8192, 16384, 24576, 32768, 49152
- Algorithm Model: Select the algorithm model to run

### Precautions

When using the smart camera solution, please note the following:

- Ensure stable connection between the Camera Sensor and the development board
- Adjust encoding bitrate as needed to balance video quality and network bandwidth

## Smart Analysis Box Configuration

The smart box solution implements single-channel and four-channel 1080p video decoding, stitching, encoding, rtsp streaming, and intelligent computation. Users can preview effects via Web interface, HDMI, or streaming. The solution function block diagram is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/box_solution.png" alt="box_solution" style={{ width: '100%' }} />

The smart analysis box solution provides the following functions:

- Run algorithms on decoded streams and re-encode for streaming
  - Supports reading local video stream files on the development board
  - Supports using RTSP streams
  - Supports scaling decoded video files before re-encoding
  - Supports controlling bitrate and frame rate
- Run specified algorithms

### Parameter Description

The smart analysis box solution has the following adjustable parameters:

- Number of Video Channels: Select how many video analysis channels to enable
  - Total decoding and encoding capability of enabled channels cannot exceed 4K@90fps (hardware limitation)
  - The default ION memory allocated for encoding/decoding and algorithms is 1408MB. If too many channels are enabled, memory insufficiency may occur, requiring ION memory size adjustment
- Video Data Stream (stream): Supports reading local video stream files and RTSP streams on the development board
- Decode Type (decode_type): Controls video decoding format, supports H264/H265/Mjpeg
- Decode Width (decode_width): Controls video decoding width
- Decode Height (decode_height): Controls video decoding height
- Decode Frame Rate (decode_frame_rate): Controls video decoding frame rate
- Encode Type (encode_type): Controls video encoding format, supports H264/H265/Mjpeg
- Encode Width (encode_width): Controls video encoding width
- Encode Height (encode_height): Controls video encoding height
- Encode Frame Rate (encode_frame_rate): Controls video encoding frame rate
- Encode Bitrate (encode_bitrate): Controls video encoding bitrate. Reference bitrates for different resolutions are as follows:
  - Standard definition video (480p): 256, 512, 768, 1024, 1536, 2048
  - High definition video (720p): 512, 1024, 2048, 3072, 4096, 6144
  - Full HD video (1080p): 1024, 2048, 4096, 6144, 8192, 12288
  - 2K video: 2048, 4096, 8192, 12288, 16384, 24576
  - 4K video: 4096, 8192, 16384, 24576, 32768, 49152
- Algorithm Model (model): Select the algorithm model to run

### Precautions

When using the smart analysis box solution, please note the following:

- Ensure stable network connection and sufficient network bandwidth for data transmission requirements
- Adjust the number of analysis channels and analysis algorithms as needed to meet application requirements
- Total decoding and encoding capability of enabled channels cannot exceed 4K@90fps (hardware limitation)
- The default ION memory allocated for encoding/decoding and algorithms is 1GB. If too many channels are enabled, memory insufficiency may occur, requiring ION memory size to be increased

## Playing RTSP Streams with VLC Player

When the sunrise camera program runs, it simultaneously pushes rtsp video streams. Users can play RTSP streams using the VLC player to achieve functions such as video preview, recording, and screenshots.

### Playback Method

Open the VLC player, select the `Media` menu, then select the `Open Network Stream` option.

Enter the URL address in the `Open Media` dialog box, click the `Play` button to start playback, as shown below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/vlc_play_method.png" alt="vlc_play_method" style={{ width: '100%' }} />

The RTSP stream network URL link can be viewed in the device information on the web interface. The default supported stream link is: rtsp://192.168.1.10/stream_chn0.h264

### 4K@30fps Streaming Configuration Instructions

1. For 4K@30fps with high bitrate configuration (above 8192Kbps), to ensure smooth video playback without frame loss, it is recommended to use a Gigabit network; otherwise, video macroblocking and screen tearing may easily occur.

2. VLC buffer_size setting: Modify VLC receive buffer. The default is 250000, recommended to change to 1200000.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/vlc_rtsp_buffer_size.png" alt="vlc_rtsp_buffer_size" style={{ width: '100%' }} />

3. Using HTTP mode can effectively solve screen tearing caused by playback frame loss.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/vlc_http_mode.png" alt="vlc_http_mode" style={{ width: '100%' }} />

4. Disable clock synchronization in advanced settings

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/vlc_disable_clock_sync.png" alt="vlc_disable_clock_sync" style={{ width: '100%' }} />