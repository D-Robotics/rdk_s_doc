---
sidebar_position: 1
title: "Using MIPI Camera"
description: "MIPI camera data path test and HDMI display on RDK"
---

# Using MIPI Camera

The development board comes pre-installed with the `05_mipi_camera_streamer.py` script for testing the data path of the MIPI camera: it captures image data from the MIPI camera in real time and outputs it to a monitor through the HDMI interface.

:::tip
The example code of this document is located in the on-board `/app/pydev_demo/mipi_camera_sample/` directory and has been verified on the board.
:::

## Environment Preparation

- Connect the MIPI camera module to the MIPI CSI interface of the development board. For the specific connection method, refer to [Hardware Introduction - MIPI Interface](../../../01_Quick_start/01_hardware_introduction/03_expansion_board/01_camera/03_rdk_s600_camera_expansion_board.md)
- The MIPI camera interface uses auto-detection mode; only one MIPI camera can be connected when running the example (any MIPI interface is acceptable). Connecting multiple cameras at the same time will cause an error
- Connect the development board and the monitor with an HDMI cable

## Code Location

On-board path: `/app/pydev_demo/mipi_camera_sample/`

```text
mipi_camera_sample/
├── 01_mipi_camera_yolov5x.py    # Real-time object detection with YOLOv5X and display
├── 02_mipi_camera_dump.py       # Capture image frames and save them as YUV files
├── 03_mipi_camera_scale.py      # Scale local YUV images
├── 04_mipi_camera_crop_scale.py # Crop and scale local YUV images
├── 05_mipi_camera_streamer.py   # Real-time display of images on HDMI (data path test)
└── README.md                    # Usage instructions
```

This document takes `05_mipi_camera_streamer.py` as an example to describe the data path testing method.

## How to Run

Run the program with the following commands:

```shell
root@drobot:~# cd /app/pydev_demo/mipi_camera_sample
root@drobot:/app/pydev_demo/mipi_camera_sample# python3 05_mipi_camera_streamer.py -w 1920 -h 1080
```

Parameter description:

- `-w`: output image width
- `-h`: output image height

## Expected Result
After the program runs, the monitor displays the camera view in real time, as shown below:
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/hardware_and_system/mipi_camera_streamer_2025-06-25_12-12-31.png" alt="Real-time MIPI camera display effect" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

When it runs successfully, the script automatically ends after capturing for about 10 seconds and outputs:

```text
libsrcampy bind return:0
Test camera streamer done!!!
```

When no camera is detected, the program reports an error and exits:

```text
ERROR [CamInitParam] No camera sensor found, please check whether the camera connection or video_idx is correct.
Error: Failed to open camera.
```

<!--
Video: https://www.bilibili.com/video/BV1rm4y1E73q/?p=19

The development board has the `mipi_camera.py` program installed for testing the MIPI camera data path. This example captures image data from the MIPI camera in real time, then runs the object detection algorithm, and finally fuses the image data with the detection results and outputs them through the HDMI interface.

## Environment Preparation

  - Connect the MIPI camera module to the MIPI CSI interface of the development board. For the specific connection method, refer to [Hardware Introduction - MIPI Interface](/Quick_start/hardware_introduction/rdk_s100/rdk_camera_expansion_board/rdk_camera_expansion_board)
  - Connect the development board and the monitor with an HDMI cable

## How to Run
Run the program with the following commands

  ```bash
  sunrise@ubuntu:~$ cd /app/pydev_demo/03_mipi_camera_sample/
  sunrise@ubuntu:/app/pydev_demo/03_mipi_camera_sample$ python3 mipi_camera.py
  ```

<details>
  <summary>When using this demo on the RDK X5, you are asked to choose the camera configuration; click to view details</summary>

  After running in the terminal, a "please choose sensor config,xxxx" prompt appears.

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/01_Image/image/mipi_camera/screenshot-20241217-115245.png" alt="MIPI camera sensor configuration selection screen" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  Choose a configuration supported by the RDK X5 at runtime; in the figure above, choosing either 0 or 1 is fine.

  Refer to the following video for the startup process:
  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/01_Image/image/mipi_camera/20241217-115536.gif" alt="MIPI camera startup process demonstration" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</details>

## Expected Result
After the program runs, the monitor displays the camera view and the results of the object detection algorithm (object type, confidence) in real time, as shown below:
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/hardware_and_system/image-20220511181747071.png" alt="MIPI camera object detection algorithm results" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
-->

## FAQ

### `No camera sensor found` is reported when running

**Reason**: The MIPI camera is not connected correctly, or multiple cameras are connected at the same time.

**Solution**: Check the connection between the camera and the MIPI CSI interface, confirm that only one camera is connected, and try again.

## Related Documents

- [Capture → Display](../../02_multimedia_demo/01_cdev/02_vio2display.md)
- [MIPI Camera Inference Example](../../03_algorithm_demo/07_camera_streaming/02_mipi_camera.md)
- [Camera Object](../../../04_Simple_API/01_multimedia_api/pydev/02_object_camera.md)
- [C/C++ Demo Programming Guide](../../04_demo_support/02_c_cpp_build.md)
