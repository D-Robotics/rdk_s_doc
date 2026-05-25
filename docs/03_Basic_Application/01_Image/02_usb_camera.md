---
sidebar_position: 2
---

# 3.1.2 USB 摄像头使用

<!--
Video: https://www.bilibili.com/video/BV1rm4y1E73q/?p=18

开发板上安装了 `usb_camera_fcos.py` 程序用于测试 USB 摄像头的数据通路，该示例会实时采集 USB 摄像头的图像数据，然后运行目标检测算法，最后把图像数据和检测结果融合后通过 HDMI 接口输出。

## 环境准备

  - USB 摄像头接入到开发板上，确认生成 `/dev/videoX` 设备节点，`X` 代表数字，例如 `/dev/video0`
  - 通过 HDMI 线缆连接开发板和显示器

## 运行方式
按照以下命令执行程序

  ```shell
  sunrise@ubuntu:~$ cd /app/pydev_demo/02_usb_camera_sample/
  sunrise@ubuntu:/app/pydev_demo/02_usb_camera_sample$ python3 usb_camera_fcos.py
  ```

## 预期效果
程序执行后，显示器会实时显示摄像头画面及目标检测算法的结果(目标类型、置信度)，如下所示：
  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/01_Image/image/usb_camera/image-20220612110739490.png" alt="image-20220612110739490" style={{ width: '100%' }} />

:::tip

详细代码实现说明请查阅[基于 USB 摄像头推理](../../04_model_zoo_intro.md)章节。
对接两个 USB 摄像头前，需要通过 rmmod uvcvideo;modprobe uvcvideo quirks=128 限制 uvcvideo 带宽占用

:::

-->

开发板上安装了 `usb_camera_snap.py` 程序用于测试 USB 摄像头的数据通路，该示例会实时采集 USB 摄像头的图像数据, 并保存到本地 img.jpg 文件中。

## 环境准备

  - USB 摄像头接入到开发板上，确认生成 `/dev/videoX` 设备节点，`X` 代表数字，例如 `/dev/video0`
  - 通过 HDMI 线缆连接开发板和显示器

## 运行方式
按照以下命令执行程序

  ```shell
  sunrise@ubuntu:~$ cd /app/pydev_demo/09_usb_camera_sample
  sunrise@ubuntu:/app/pydev_demo/09_usb_camera_sample$ python usb_camera_snap.py
  ```

## 预期效果
程序执行后，显示器会抓取当前摄像头画面，如下所示：
  <img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/01_Image/image/usb_camera/usbsnap_2025-06-24_15-50-26.png" alt="usbsnap_2025-06-24_15-50-26" style={{ width: '100%' }} />

:::tip

对接两个 USB 摄像头前，需要通过 rmmod uvcvideo;modprobe uvcvideo quirks=128 限制 uvcvideo 带宽占用

:::

## USB 2.0摄像头接入说明{#USB 2.0摄像头接入说明}
:::tip
1. USB 2.0带宽为480Mb/s，720p30fps 的 usb camera 理论带宽1280x720x16x30=442Mb/s 已经接近2.0理论带宽，另外 uvc 协议开销也会占用一部分带宽，实际剩余传输图像数据的带宽可能在五成左右，本身理论上也不能在同一个 host 接入两路 usb2.0 720p30fps 的 camera，经验证，同一个 usb host 上可以接入两路 usb2.0 640x480 20fps。
2. s100开发板有两个 usb host，上下两个口为同一个 host，如果接入两个 usb2.0 720p camera，需要左右两个口插入，每个 usb2.0相机占用一个 host 的方式。
:::
