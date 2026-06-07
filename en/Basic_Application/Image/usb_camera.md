# 3.1.2 Using USB Cameras

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Basic_Application/Image/usb_camera

The development board has the `usb_camera_snap.py` program installed to test the data pipeline of USB cameras. This example captures real-time image data from a USB camera and saves it locally as `img.jpg` .

## Environment Setup

- Connect the USB camera to the development board and confirm that the `/dev/videoX` device node is created, where `X` is a number (e.g., `/dev/video0` ).
- Connect the development board to a display using an HDMI cable.

## How to Run

Execute the program with the following commands:

```shell
sunrise@ubuntu:~$ cd /app/pydev_demo/09_usb_camera_sample/
sunrise@ubuntu:/app/pydev_demo/09_usb_camera_sample$ python3 usb_camera_snap.py
```

## Expected Result

After running the program, the display will capture and show the current camera frame, as shown below: ![usbsnap_2025-06-24_15-50-26](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/01_Image/image/usb_camera/usbsnap_2025-06-24_15-50-26.png)

tip
Before connecting two USB cameras, you need to limit the bandwidth usage of the `uvcvideo` driver by running:
`rmmod uvcvideo; modprobe uvcvideo quirks=128` .

## Notes on Connecting USB 2.0 Cameras

tip

1. USB 2.0 has a bandwidth of 480 Mb/s. A 720p30fps USB camera theoretically requires 1280×720×16×30 = 442 Mb/s, which is already close to the theoretical limit of USB 2.0. Additionally, UVC protocol overhead consumes part of the bandwidth, leaving only about 50% available for actual image data transmission. Therefore, in theory, it's not feasible to connect two 720p30fps USB 2.0 cameras to the same USB host. However, testing has shown that two 640×480@20fps USB 2.0 cameras can operate simultaneously on the same USB host.
2. The S100 development board has two USB hosts. The top and bottom USB ports belong to the same host. To connect two USB 2.0 720p cameras, you must plug them into the left and right ports respectively, so that each USB 2.0 camera uses a separate host.
