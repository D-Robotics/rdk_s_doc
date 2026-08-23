---
sidebar_position: 1
title: "MIPI 摄像头使用"
description: "RDK MIPI 摄像头数据通路测试与 HDMI 出图"
---

# MIPI 摄像头使用

开发板预置了 `05_mipi_camera_streamer.py` 脚本，用于测试 MIPI 摄像头的数据通路：实时采集 MIPI 摄像头的图像数据，并通过 HDMI 接口输出到显示器。

:::tip
本示例代码位于板端 `/app/pydev_demo/mipi_camera_sample/` 目录，已在板端经过实际验证。
:::

## 环境准备

- 将 MIPI 摄像头模组连接到开发板的 MIPI CSI 接口，具体连接方法参考 [硬件简介 - MIPI 接口](../../../01_Quick_start/01_hardware_introduction/03_expansion_board/01_camera/03_rdk_s600_camera_expansion_board.md)
- MIPI 摄像头接口采用自动检测模式，运行示例时只能接入一个 MIPI 摄像头（任意 MIPI 接口均可），同时接入多个会报错
- 通过 HDMI 线缆连接开发板和显示器

## 代码位置

板端路径：`/app/pydev_demo/mipi_camera_sample/`

```text
mipi_camera_sample/
├── 01_mipi_camera_yolov5x.py    # YOLOv5X 实时目标检测并显示
├── 02_mipi_camera_dump.py       # 抓拍图像帧并保存为 YUV 文件
├── 03_mipi_camera_scale.py      # 对本地 YUV 图像做缩放
├── 04_mipi_camera_crop_scale.py # 对本地 YUV 图像裁剪并缩放
├── 05_mipi_camera_streamer.py   # 图像实时显示到 HDMI（数据通路测试）
└── README.md                    # 使用说明
```

本文以 `05_mipi_camera_streamer.py` 为例说明数据通路测试方法。

## 运行方式

按照以下命令执行程序：

```shell
root@drobot:~# cd /app/pydev_demo/mipi_camera_sample
root@drobot:/app/pydev_demo/mipi_camera_sample# python3 05_mipi_camera_streamer.py -w 1920 -h 1080
```

参数说明：

- `-w`：输出图像宽度
- `-h`：输出图像高度

## 预期效果
程序执行后，显示器会实时显示摄像头画面，如下所示：
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/hardware_and_system/mipi_camera_streamer_2025-06-25_12-12-31.png" alt="MIPI摄像头实时画面显示效果" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

成功运行时，脚本采集约 10 秒后自动结束，并输出：

```text
libsrcampy bind return:0
Test camera streamer done!!!
```

未检测到摄像头时，程序会报错退出：

```text
ERROR [CamInitParam] No camera sensor found, please check whether the camera connection or video_idx is correct.
Error: Failed to open camera.
```

视频演示：https://www.bilibili.com/video/BV1rm4y1E73q/?p=19



## 常见问题

### 运行时提示 `No camera sensor found`

**原因**：MIPI 摄像头未正确连接，或同时接入了多个摄像头。

**解决**：检查摄像头与 MIPI CSI 接口的连接，确认只接入一个摄像头后重试。

## 相关文档

- [采集 → 显示](../../02_multimedia_demo/01_cdev/02_vio2display.md)
- [MIPI 摄像头推理示例](../../03_algorithm_demo/07_camera_streaming/02_mipi_camera.md)
- [Camera 对象](../../../04_Simple_API/01_multimedia_api/pydev/02_object_camera.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
