---
sidebar_position: 1
---

# 3.1.1 MIPI 摄像头使用

开发板上安装了`mipi_camera_streamer.py`程序用于测试 MIPI 摄像头的数据通路，该示例会实时采集 MIPI 摄像头的图像数据，把图像数据通过 HDMI 接口输出。

## 环境准备

<DocScope versions="<5.1.1">

  - 将 MIPI 摄像头模组连接到开发板 MIPI CSI 接口，具体连接方法可以参考-[硬件简介-MIPI接口](../../01_Quick_start/01_hardware_introduction/01_rdk_s100/02_rdk_s100_camera_expansion_board/01_rdk_s100_camera_expansion_board.md#mipi-相机接口j2200-j2201)
  - 目前该 sample 仅支持 MIPI sensor: IMX219, SC230AI
  - 通过 HDMI 线缆连接开发板和显示器

</DocScope>

<DocScope versions=">=5.1.1">

  - 将 MIPI 摄像头模组连接到开发板 MIPI CSI 接口，具体连接方法可以参考-[硬件简介-MIPI接口](../../01_Quick_start/01_hardware_introduction/01_rdk_s100/02_rdk_s100_camera_expansion_board/01_rdk_s100_camera_expansion_board.md#mipi-相机接口j2200-j2201)
  - 目前该 sample 支持 MIPI sensor: IMX219, SC230AI, shw3hstd_amsl-60fps
  - 通过 HDMI 线缆连接开发板和显示器

</DocScope>

## 运行方式
按照以下命令执行程序

  ```bash
  sunrise@ubuntu:~$ cd /app/pydev_demo/mipi_camera_sample
  sunrise@ubuntu:/app/pydev_demo/mipi_camera_sample$ python 05_mipi_camera_streamer.py -w 1920 -h 1080
  ```

<DocScope versions=">=5.1.1">

执行上述命令后，终端会先列出搜索到的 sensor 配置，并要求选择：

```text
[0] INFO: Found sensor name:imx219-30fps on mipi rx csi 4, i2c addr 0x10, config_file:linear_1920x1080_raw10_30fps_1lane.c
[1] INFO: Found sensor name:shw3hstd_amsl-60fps on mipi rx csi 4, i2c addr 0x10, config_file:linear_1920x1536_60fps_1lane.c
please choose sensor config,the number should small than 2
```

此时输入 `0` 并回车，程序会继续运行。这里的序号与上方 `[x] INFO: Found sensor name` 打印的 sensor 一一对应，例如 `0` 即为 `imx219-30fps` 对应的配置。

</DocScope>

## 预期效果
程序执行后，显示器会实时显示摄像头画面，如下所示：
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/hardware_and_system/mipi_camera_streamer_2025-06-25_12-12-31.png" alt="MIPI摄像头实时画面显示效果" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

<!--
Video: https://www.bilibili.com/video/BV1rm4y1E73q/?p=19

开发板上安装了`mipi_camera.py`程序用于测试 MIPI 摄像头的数据通路，该示例会实时采集 MIPI 摄像头的图像数据，然后运行目标检测算法，最后把图像数据和检测结果融合后通过 HDMI 接口输出。

## 环境准备

  - 将 MIPI 摄像头模组连接到开发板 MIPI CSI 接口，具体连接方法可以参考-[硬件简介-MIPI接口](../../01_Quick_start/01_hardware_introduction/01_rdk_s100/02_rdk_s100_camera_expansion_board/01_rdk_s100_camera_expansion_board.md)
  - 通过 HDMI 线缆连接开发板和显示器

## 运行方式
按照以下命令执行程序

  ```bash
  sunrise@ubuntu:~$ cd /app/pydev_demo/03_mipi_camera_sample/
  sunrise@ubuntu:/app/pydev_demo/03_mipi_camera_sample$ python3 mipi_camera.py
  ```

<details>
  <summary>RDK X5在使用该 demo 的时候会要求选择摄像头的配置，具体可以点击查看</summary>

  在终端中运行之后，会出现“please choose sensor config,xxxx”的要求。

  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/01_Image/image/mipi_camera/screenshot-20241217-115245.png" alt="MIPI摄像头传感器配置选择界面" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  在运行的时候选择 RKD X5支持的配置，上图中选择0或者1都可以。

  启动过程可以参考如下视频：
  <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/01_Image/image/mipi_camera/20241217-115536.gif" alt="MIPI摄像头启动过程演示" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</details>

## 预期效果
程序执行后，显示器会实时显示摄像头画面及目标检测算法的结果(目标类型、置信度)，如下所示：
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/hardware_and_system/image-20220511181747071.png" alt="MIPI摄像头目标检测算法运行结果" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
-->
