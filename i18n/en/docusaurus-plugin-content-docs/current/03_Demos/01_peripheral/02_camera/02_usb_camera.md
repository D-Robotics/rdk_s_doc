---
sidebar_position: 2
title: "Using USB Camera"
description: "USB camera data path test and object detection on RDK"
---

# Using USB Camera

<!--
Video: https://www.bilibili.com/video/BV1rm4y1E73q/?p=18

The development board has the `usb_camera_fcos.py` program installed for testing the USB camera data path. This example captures image data from the USB camera in real time, then runs the object detection algorithm, and finally fuses the image data with the detection results and outputs them through the HDMI interface.

## Environment Preparation

  - Connect the USB camera to the development board and confirm that the `/dev/videoX` device node is generated, where `X` is a number, e.g. `/dev/video0`
  - Connect the development board and the monitor with an HDMI cable

## How to Run
Run the program with the following commands

  ```shell
  sunrise@ubuntu:~$ cd /app/pydev_demo/02_usb_camera_sample/
  sunrise@ubuntu:/app/pydev_demo/02_usb_camera_sample$ python3 usb_camera_fcos.py
  ```

## Expected Result
After the program runs, the monitor displays the camera view and the results of the object detection algorithm (object type, confidence) in real time, as shown below:
  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/01_Image/image/usb_camera/image-20220612110739490.png" alt="USB camera object detection algorithm results" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::tip

For detailed code implementation instructions, refer to the [USB Camera Based Inference](../../03_algorithm_demo/01_summary.md) chapter.
Before connecting two USB cameras, you need to run rmmod uvcvideo;modprobe uvcvideo quirks=128 to limit the bandwidth usage of uvcvideo

:::

-->

The development board comes pre-installed with the `usb_camera_yolov5x.py` script for testing the data path of the USB camera: it captures images from the USB camera in real time, runs YOLOv5X object detection, and displays the results overlaid with detection results on the HDMI interface.

:::tip
The example code of this document is located in the on-board `/app/pydev_demo/usb_camera_sample/` directory and has been verified on the board; the C++ version is located at `/app/cdev_demo/bpu/usb_camera_sample/`.
:::

## Environment Preparation

- Connect the USB camera to the development board and confirm that the `/dev/videoX` device node is generated (`X` is a number, e.g. `/dev/video0`)
- Connect the development board and the monitor with an HDMI cable

## Code Location

On-board path: `/app/pydev_demo/usb_camera_sample/`

```text
usb_camera_sample/
├── usb_camera_yolov5x.py   # YOLOv5X object detection main program
└── README.md               # Usage instructions
```

## How to Run

Run the program with the following commands:

```shell
root@drobot:~# cd /app/pydev_demo/usb_camera_sample
root@drobot:/app/pydev_demo/usb_camera_sample# python3 usb_camera_yolov5x.py
```

After running, the screen displays the object detection image in real time; place the mouse inside the display window and press the `q` key to exit.

## Expected Result

After the program runs, the monitor displays the camera view and the object detection results (object type, confidence) in real time, as shown below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/01_Image/image/usb_camera/image-20220612110739490.png" alt="USB camera object detection algorithm results" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

When no USB camera is detected, the program outputs:

```text
No USB camera found.
```

:::tip

Before connecting two USB cameras, you need to run `rmmod uvcvideo; modprobe uvcvideo quirks=128` to limit the bandwidth usage of uvcvideo.

:::

## Notes on Connecting USB 2.0 Cameras{#usb-2.0-note}

:::tip
1. The USB 2.0 bandwidth is 480Mb/s. The theoretical bandwidth of a 720p30fps USB camera, 1280x720x16x30=442Mb/s, is already close to the theoretical 2.0 bandwidth. In addition, UVC protocol overhead also consumes part of the bandwidth, so the remaining bandwidth actually available for transmitting image data may be around 50%. In theory, two usb2.0 720p30fps cameras cannot be connected to the same host either. As verified, two usb2.0 640x480 20fps cameras can be connected to the same USB host.
2. The s100 development board has two USB hosts; the top and bottom ports belong to the same host. If you need to connect two usb2.0 720p cameras, insert them into the left and right ports so that each usb2.0 camera occupies one host.
:::

## Related Documentation

- [Capture → Display](../../02_multimedia_demo/01_cdev/02_vio2display.md)
- [USB Camera Based Inference](../../03_algorithm_demo/07_camera_streaming/01_usb_camera.md)
- [Camera Object](../../../04_Simple_API/01_multimedia_api/pydev/02_object_camera.md)
- [C/C++ Demo Programming Guide](../../04_demo_support/02_c_cpp_build.md)
