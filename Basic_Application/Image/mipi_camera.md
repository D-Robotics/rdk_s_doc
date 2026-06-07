# 3.1.1 MIPI 摄像头使用

URL: https://developer.d-robotics.cc/rdk_s_doc/Basic_Application/Image/mipi_camera

开发板上安装了 `mipi_camera_streamer.py` 程序用于测试 MIPI 摄像头的数据通路，该示例会实时采集 MIPI 摄像头的图像数据，把图像数据通过 HDMI 接口输出。

## 环境准备

- 将 MIPI 摄像头模组连接到开发板 MIPI CSI 接口，具体连接方法可以参考- [硬件简介-MIPI接口](/rdk_s_doc/Quick_start/hardware_introduction/rdk_s100/rdk_s100_camera_expansion_board#mipi-%E7%9B%B8%E6%9C%BA%E6%8E%A5%E5%8F%A3j2200-j2201)
- 目前该 sample 仅支持 MIPI sensor: IMX219, SC230AI
- 通过 HDMI 线缆连接开发板和显示器

## 运行方式

按照以下命令执行程序

```bash
sunrise@ubuntu:~$ cd /app/pydev_demo/mipi_camera_sample
sunrise@ubuntu:/app/pydev_demo/10_mipi_camera_sample$ python 05_mipi_camera_streamer.py -w 1920 -h 1080
```

## 预期效果

程序执行后，显示器会实时显示摄像头画面，如下所示：

![mipi_camera_streamer_2025-06-25_12-12-31](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/hardware_and_system/mipi_camera_streamer_2025-06-25_12-12-31.png)
