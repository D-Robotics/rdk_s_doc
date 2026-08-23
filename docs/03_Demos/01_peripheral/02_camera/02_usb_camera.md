---
sidebar_position: 2
title: "USB 摄像头使用"
description: "RDK USB 摄像头数据通路测试与目标检测"
---

# USB 摄像头使用

视频演示：https://www.bilibili.com/video/BV1rm4y1E73q/?p=18



开发板预置了 `usb_camera_yolov5x.py` 脚本，用于测试 USB 摄像头的数据通路：实时采集 USB 摄像头图像，运行 YOLOv5X 目标检测，并将检测结果叠加后显示到 HDMI 接口。

:::tip
本示例代码位于板端 `/app/pydev_demo/usb_camera_sample/` 目录，已在板端经过实际验证；C++ 版本位于 `/app/cdev_demo/bpu/usb_camera_sample/`。
:::

## 环境准备

- USB 摄像头接入到开发板上，确认生成 `/dev/videoX` 设备节点（`X` 为数字，例如 `/dev/video0`）
- 通过 HDMI 线缆连接开发板和显示器

## 代码位置

板端路径：`/app/pydev_demo/usb_camera_sample/`

```text
usb_camera_sample/
├── usb_camera_yolov5x.py   # YOLOv5X 目标检测主程序
└── README.md               # 使用说明
```

## 运行方式

按照以下命令执行程序：

```shell
root@drobot:~# cd /app/pydev_demo/usb_camera_sample
root@drobot:/app/pydev_demo/usb_camera_sample# python3 usb_camera_yolov5x.py
```

运行后屏幕会实时显示目标检测图像；将鼠标放置在显示框内，按 `q` 键退出。

## 预期效果

程序执行后，显示器会实时显示摄像头画面及目标检测结果（目标类型、置信度），如下所示：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/01_Image/image/usb_camera/image-20220612110739490.png" alt="USB摄像头目标检测算法运行结果" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

未检测到 USB 摄像头时，程序会输出：

```text
No USB camera found.
```

:::tip

对接两个 USB 摄像头前，需要通过 `rmmod uvcvideo; modprobe uvcvideo quirks=128` 限制 uvcvideo 带宽占用。

:::

## USB 2.0 摄像头接入说明{#usb-2.0-note}

:::tip
1. USB 2.0带宽为480Mb/s，720p30fps 的 USB camera 理论带宽1280x720x16x30=442Mb/s 已经接近2.0理论带宽，另外 UVC 协议开销也会占用一部分带宽，实际剩余传输图像数据的带宽可能在五成左右，本身理论上也不能在同一个 host 接入两路 USB 2.0 720p30fps 的 camera，经验证，同一个 USB host 上可以接入两路 USB 2.0 640x480 20fps。
2. RDK S100 开发板有两个 USB host，上下两个口为同一个 host，如果接入两个 USB 2.0 720p camera，需要左右两个口插入，每个 USB 2.0 相机占用一个 host 的方式。
:::

## 相关文档

- [采集 → 显示](../../02_multimedia_demo/01_cdev/02_vio2display.md)
- [基于 USB 摄像头推理](../../03_algorithm_demo/07_camera_streaming/01_usb_camera.md)
- [Camera 对象](../../../04_Simple_API/01_multimedia_api/pydev/02_object_camera.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
