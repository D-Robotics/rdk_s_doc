# 3.1.1 Using MIPI Camera

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Basic_Application/Image/mipi_camera

The `mipi_camera_streamer.py` program is installed on the development board to test the MIPI camera data pipeline. This example captures image data from the MIPI camera in real time and outputs the image data via the HDMI interface.

## Environment Setup

- Connect the MIPI camera module to the MIPI CSI interface on the development board. For specific connection instructions, please refer to - [Hardware Introduction - MIPI Interface](/rdk_s_doc/en/Quick_start/hardware_introduction/rdk_s100/rdk_s100_camera_expansion_board#mipi-camera-interfaces-j2200-j2201)
- Currently, this sample only supports MIPI sensors: IMX219, SC230AI
- Connect the development board to a display using an HDMI cable

## How to Run

Execute the program with the following commands:

```bash
sunrise@ubuntu:~$ cd /app/pydev_demo/mipi_camera_sample
sunrise@ubuntu:/app/pydev_demo/10_mipi_camera_sample$ python 05_mipi_camera_streamer.py -w 1920 -h 1080
```

## Expected Result

After running the program, the display will show the live camera feed in real time, as shown below: ![mipi_camera_streamer_2025-06-25_12-12-31](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/hardware_and_system/mipi_camera_streamer_2025-06-25_12-12-31.png)
