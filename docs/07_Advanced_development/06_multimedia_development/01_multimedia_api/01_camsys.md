---
sidebar_position: 1
toc_max_heading_level: 4
---

# Camsys 子系统

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```


## 系统概述

Camsys 子系统包含 Camera sensor (包括 SerDes)、VIN（包括
MIPI、CIM）、ISP、PYM、GDC、YNR、STITCH 模块。

| 简称   | 全称                                   | 说明                                        |
|--------|----------------------------------------|---------------------------------------------|
| MIPI   | Mobile Industry Processor Interface    | 移动产业处理器接口，MIPI 联盟制定的标准      |
| CSI    | Camera Serial Interface                | Camera 串行接口                              |
| IPI    | Image Pixel Interface                  | MIPI 与 CIM 之间的图像传输接口                 |
| FOV    | Field of View                          | 视场角                                      |
| SER    | Serializer                             | 加串器                                      |
| SerDes | Serializer and Deserializer            | 加串与解串器                                |
| DES    | Deserializer                           | 解串器                                      |
| CIM    | Camera Interface Manger                | Camera 接入管理模块，支持 online 或 offline 工作 |
| VIN    | Video In(CIM+MIPI+LPWM+VCON)           | 视频输入模块                                |
| ISP    | Image Signal Processor                 | 图像信号处理器                              |
| PYM    | Pyramid                                | 金字塔处理模块: 图像缩小及 ROI               |
| GDC    | Geometric Distortion Correction        | 几何畸变校正模块                            |
| LPWM   | Lite Pulse Width Modulation            | 精简版脉宽调制模块                          |
| VPF    | Video Process Framework(VIN+ISP+PYM..) | 视频处理管理模块                            |
| VIO    | Video In/Out (VIN+VPM)                 | 视频输入/输出模块                           |
| STITCH | Stitch hardware Module                 | 图像拼接处理模块                            |
| CAMSYS | Camera System (Camera+VPF)             | 相机图像系统                                |

### camsys 硬件框图

<DocScope products="RDK-S100">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/b266496271990c1606e5f68485cf3e9d.png" alt="S100 Camsys 硬件框图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>
<DocScope products="RDK-S600">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/s600-camsys.PNG" alt="camsys 硬件框图示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

### 子模块



#### MIPI

<DocScope products="RDK-S100">

MIPI（Mobile Industry Processor Interface）移动行业处理器接口，是 MIPI 联盟发起的为移动应用处理器制定的开放标准。
- MIPI CSI RX 支持 C/DPHY，DPHY 速率4.5Gbps x 4lane = 18Gbps，CPHY 速率3.5Gsps x 3trios =24Gbps；
- S100上有3个 MIPI RX，分别为 RX0，RX1，RX4；

</DocScope>
<DocScope products="RDK-S600">

MIPI（Mobile Industry Processor Interface）移动行业处理器接口，是 MIPI 联盟发起的为移动应用处理器制定的开放标准。
- MIPI CSI RX 支持 C/DPHY，DPHY 速率4.5Gbps x 4lane = 18Gbps，CPHY 速率3.5Gsps x 3trios =24Gbps；
- S600上有6个 MIPI RX，分别为 RX0~RX5；

</DocScope>

#### CIM

CIM（Camera Interface Manager）是一种专门用来接收 MIPI-RX IPI 图像数据的硬件。CIM 负责同时接入多路图像数据，并改变 MIPI IPI 接口的时序以匹配后级硬件或 DDR 的输入时序要求，将图像通过硬件直连或 DDR 形式提供给 ISP 和 PYM。

<DocScope products="RDK-S100">

- S100上共有3个 CIM 模块，分别为 CIM0 CIM1 CIM4；
- 单个 CIM 最大支持接入4V * 8M * 30fps，支持接入 RAW8、RAW10、RAW12、RAW14、RAW16、RAW20、YUV422~8Bit 图像；
- S100 CIM 可 online 输出到 ISP0/ISP1(RAW)与 PYM0/PYM1(YUV)，也可 offline 下 DDR。
- S100 CIM0的 IPI0最大接入宽为5696，CIM0其他的 IPI 和其他 CIM 中的 IPI 最大接入宽为4096；

</DocScope>
<DocScope products="RDK-S600">

- S600上共有6个 CIM 模块，分别为 CIM0~CIM5；
- 单个 CIM 最大支持接入4V * 8M * 30fps，支持接入 RAW8、RAW10、RAW12、RAW14、RAW16、RAW20、YUV422~8Bit 图像；
- S600 CIM 可 online 输出到 ISP0/ISP1/ISP2/ISP3(RAW)与 PYM0/PYM1/PYM2/PYM3(YUV)，也可 offline 下 DDR。
- S600 CIM0~2最大接入宽为5696，其他 CIM 接入最大宽为4096

</DocScope>

#### ISP

ISP (Image Signal Processor)图像信号处理器，是一种专门用于图像信号处理的引擎。 ISP 的功能包括对原始图像进行各类算法处理、图像特性统计、色彩空间转换、多路通道分时复用控制等，最终输出更清晰、更准确、高质量的图像。

<DocScope products="RDK-S100">
- 每个 ISP 硬件模块 IP 最大支持12路 sensor 的接入能力；
- S100上共有2个 ISP 模块，分别为 ISP0 ISP1；
- S100 ISP 处理最大分辨率为4096 * 2160;

</DocScope>
<DocScope products="RDK-S600">
- 每个 ISP 硬件模块 IP 最大支持12路 sensor 的接入能力；
- S600上共有4个 ISP 模块，分别为 ISP0~ISP3；
- S600 ISP 处理最大分辨率为5696 * 3328。

</DocScope>
ISP 处理 pipeline 如下图：
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/isp_pipeline.png" alt="ISP示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
- MCFE:
Multi-Context Front End，用于 ISP 多路调度控制与 buffer 管理，one by
one 进行 Multi-camera 图像处理。
- RAW Domain:
RAW 域图像处理，包含 input port (含 input crop 功能)、channel switch、input
formatter、sensor offset linear、digtal gain、gamma
FE(即 decompander)、gamma\_sqrt、raw frontend、static
defected、sinter、chromatic aberration、gamma\_sq、gamma BE、static
white blance、radial shading correction、mesh shading
correction、digital gain iridix、iridix、demosaic 等。
- RGB Domain:
RGB 域图像处理，包含 purple fringe correction、color matrix、gamma RGB
forward SQ、crop、CNR、gamma RGB reverse SQ、RGB gamma 等。
- Output formatter:
CS(color space) coversion，将 RGB 通道数据转换成 YUV 等 format，output
control 进行输出控制。

#### YNR

YNR 为 yuv 域的降噪模块 Digital Noise Reduction，YNR 支持2DNR 与3DNR 模式

<DocScope products="RDK-S100">

- S100上共有一个 YNR 模块，YNR1，只支持 ISP1-online-YNR1-online-PYM1场景；
- S100在2DNR 或3DNR 模式下，处理的最大宽高为2048*2048；

</DocScope>
<DocScope products="RDK-S600">

- S600上共用四个 YNR 模块，YNR0-3，只支持 isp-online-ynr-online-pym 场景，其中 YNR0-2只支持2DNR，YNR3支持2DNR&3DNR；
- S600 YNR0-2支持处理最大宽高为5696，YNR3处理最大宽高为4096；

</DocScope>

#### PYM

PYM（Pyramid）作为一个硬件加速模块，对输入的图像按照金字塔图层的方式处理，并输出到 DDR。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image.png" alt="PYM金字塔处理模块框图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

<DocScope products="RDK-S100">

- S100上共有3个 PYM 模块，分别为 PYM0 PYM1 PYM4；

</DocScope>
<DocScope products="RDK-S600">

- S600上共有5个 PYM 模块，分别为 PYM0~4；

</DocScope>
- SRC 层：代表源图像层；
- BL 层：代表双线性下采样层，BL Base 0~4依次是源图层的1/2，1/4，1/8，1/16，1/32；
- DS 层：输出层，每层能够任意选择输入图层（SRC 或0~4BL），并进行下采样和 ROI 处理后输出到 DDR；
- 缩小 ratio(1/2，1]，不支持放大；
<DocScope products="RDK-S100">

- S100每个最大输入宽度输入高度均为4096，最小输入宽度及高度为32；
- S100 PYM0/1：4K@120fps，PYM4：4K@90fps；

</DocScope>
<DocScope products="RDK-S600">

- S600每个最大输入宽高均为5696，最小输入宽度及高度为32；
- S600 PYM0~4：4K@120fps，其中 PYM4 不支持 online 输入。

</DocScope>

#### GDC

GDC 作为一个硬件模块，可将输入的图像进行视角变换、畸变校正和指定角度（0,90,180,270）旋转。

模式支持的输入图像典型尺寸为3840x2160，2688x1944，1920x1080，1280x720，640x480，480x320。

硬件特性如下：

<DocScope products="RDK-S100">

- 最大分辨率：3840x2160
- 最小分辨率：96x96（奇数行或者列不支持）
- 性能：3840x2160，60fps
- 工作模式：ddr-gdc-ddr
- 输入格式：YUV420 semi-planar
- 输出格式：YUV420 semi-planar
- S100上有1个 GDC 模块。

</DocScope>
<DocScope products="RDK-S600">

- 最大分辨率：3840x2160
- 最小分辨率：96x96（奇数行或者列不支持）
- 性能：3840x2160，60fps
- 工作模式：ddr-gdc-ddr
- 输入格式：YUV420 semi-planar
- 输出格式：YUV420 semi-planar
- S600上有2个 GDC 模块。

</DocScope>

##### GDCTool 简介
GDC Tool 是一种可在 PC 上进行处理效果仿真的工具。用户可准备 jpg 模式的图像，load 到 gdc-tool 中进行离线校正，校正完成后可以直接保存 config.bin 文件用于硬件校正，也可用保存 layout.json 文件生成 config.bin 进行硬件校正

###### GDC Tool 启动
1. window 环境启动

    安装环境：依赖 nodejs 安装，参考：https://nodejs.cn/download/

    安装执行依赖：在 win 命令行，进入 GDC 发布的工具文件（如 gdc-tool-gui-xxxx-windows）目录下，执行 npm install express

    启动应用：在 win 命令行进入文件目录（如 gdc-tool-gui-xxxx-windows），执行 node.exe app.js，Chrome 浏览器登陆 http://localhost:3000/

2. unix 环境启动

    安装环境：mac: brew install node

    安装执行依赖：文件目录下执行 npm install -production

    启动应用：执行 node app.js，登陆 http://localhost:3000/

###### GDC Tool 中的变换模式
变换模式有 Affine，Equisolid，Equisolid(cylinder)，Equidistant， Custom， Keystone+dewarping 六种变换供选择，这些模式与软件中的变换模式对应关系见 GDC Bin API 文档中的 transformation_t 描述，下表是各个变换的用途
| 变换模式 | 用途                                   |
|--------------------------|---------------------------------------------|
| Affine                   | 一种线性变换，简单的图像旋转功能，没有畸变校正 |
| Equisolid                | 全景变换，变换网格最大                        |
| Equisolid(cylinder)      | 圆柱形变换                                   |
| Equidistant              | 等距变换，变换后的距离等距。                  |
| Custom                   | 用户定制变换                                 |
| Keystone+dewarping       | 相对于 Equidistant，dewarp_keystone 多了两个参数 trapezoid_left_angle 和 trapezoid_right_angle。默认情况下这两个参数90度，效果和 Equidistant 一样。                                 |

所有转换类型都有以下三个常用参数 Pan、Tile、Zoom（举例：等距变换，输入/输出分辨率1280x720）： 以下输出图像中的蓝色矩形表示仅将特殊参数设置为该值， 并且一个转换中的其他参数保持默认值。

* Pan

    水平方向 （-1280, +1280）通过给定的像素数，偏移变换网格。如下所示：
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-1.png" alt="Pan参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

* Tile

    垂直方向 （-720, +720）通过给定的像素数，偏移变换网格。如下所示：
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-2.png" alt="Tile参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

* Zoom

    按提供的因子 （0, +∞）缩放变换输出，（0, 1）表示值大于 0 且小于 1。如下所示：
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-3.png" alt="Zoom参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

1. Affine
   * 功能描述

        提供线性的变换

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-4.png" alt="Affine线性变换功能示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

   * 成员说明

        | 成员                   | 含义                                                           |
        | ---------------------- | -------------------------------------------------------------- |
        | int32_t pan            | default 0, 不修改                                              |
        | int32_t tilt           | default 0, 不修改                                              |
        | zoom                   | 按提供的因子缩放转换输出, 当旋转角度为180或270时，该值需>=1.03 |
        | double angle(rotation) | 图像旋转的角度 0/90/180/270                                    |

        :::info 注意！

        输入输出尺寸的宽应保持16字节对齐。

        zoom 参数在旋转角度为180或270时，需>=1.03
        :::

2. Equisolid
   * 功能描述

        此转换提供等实体（全景 panoramic）校正，并将结果显示为平面上的投影。

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-6.png" alt="Equisolid全景校正功能示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

   * 成员说明
        | 成员 | 含义                                   |
        |-----------------------------|-----------------|
        | int32_t pan                 | default 0, 不修改 |
        | int32_t tilt                | default 0, 不修改 |
        | zoom                        | 按提供的因子缩放转换输出 |
        | double strengthX            | 沿 X 轴的变换强度(非负参数)  |
        | double strengthY            | 沿 Y 轴的变换强度(非负参数)  |
        | double angle(rotation)      | 图像旋转的角度 0/90/180/270 |

        strength x 调试效果，在 X 轴的转换强度，取值（0, +∞）。如下所示：
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-7.png" alt="strengthX参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

        strength y 调试效果，在 Y 轴的转换强度，取值（0, +∞）。如下所示：
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-8.png" alt="strengthY参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

        Rotation 调试效果，取值（-180, 180）。如下所示：
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-9.png" alt="Rotation参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

        :::info 注意！

        输入输出尺寸的宽应保持16字节对齐。

        :::

3. Equisold(cylinder)
   * 功能描述

        此转换提供等实体（全景 panoramic）校正，并将结果显示为平面上的投影。

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-10.png" alt="Equisolid(cylinder)圆柱形全景校正功能示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

   * 成员说明
        | 成员 | 含义                                   |
        |-----------------------------|-----------------|
        | int32_t pan                 | default 0, 不修改 |
        | int32_t tilt                | default 0, 不修改 |
        | zoom                        | 按提供的因子缩放转换输出 |
        | strength         | 转换的强度  |
        | double angle(rotation)      | 图像旋转的角度 0/90/180/270 |

        strength 调试效果，转换的强度（0，+∞）。如下所示：

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-11.png" alt="strength参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

        rotation 调试效果，取值范围（-180,+180）。如下所示

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-12.png" alt="rotation参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


        :::info 注意！

        输入输出尺寸的宽应保持16字节对齐。

        :::

4. Equidistant
   * 功能描述

       等距变换包含许多参数，这些参数允许它为投影提供一系列不同的目标平面。这使用户可以更自由地选择要变换的鱼眼帧的所需区域。

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-13.png" alt="Equidistant等距变换功能示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

   * 成员说明
       | 成员 | 含义                                   |
       |-----------------------------|-----------------|
       | int32_t pan                 | default 0, 不修改 |
       | int32_t tilt                | default 0, 不修改 |
       | zoom                        | 按提供的因子缩放转换输出 |
       | double angle(rotation)      | 图像旋转的角度 0/90/180/270 |
       | double elevation         | 定义了投影轴的仰角，范围0到90  |
       | double azimuth         | 定义了投影轴的方位角度。如果仰角参数 elevation 为0，则方位角将没有可见效果  |
       | int32_t keep_ratio         | 转当“保持比率”参数打开时，FOV 高度参数将被忽略，其值将自动计算，以在水平和垂直方向上保持相同的拉伸强度  |
       | double FOV_h         | 描述水平维度中输出视图字段的大小（以度为单位）。有效值的范围是从0到180  |
       | double FOV_w        | 描述垂直维度中输出视图字段的大小（以度为单位）。有效值的范围是从0到180  |
       | double cylindricity_y      | 描述目标投影沿 Y 轴的球面度。此值从0到1，其中1是球形的。如果此值设置为1，而“圆柱度 X”值设置为0，则投影将沿 Y 轴形成圆柱体  |
       | double cylindricity_x      | 描述目标投影沿 X 轴的球面度。此值从0到1，其中1是球形的。如果此值设置为1，并且“圆柱度 Y”值设置为0，则投影将沿 X 轴形成圆柱体  |

       elevation 调试效果：

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-14.png" alt="elevation参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

       azimuth 调试效果：

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-15.png" alt="azimuth参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

       rotation 调试效果：

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-16.png" alt="rotation参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

       cylindricity x 调试效果：

       描述目标投影沿 X 轴的球形程度。该值的范围为0到1，其中1为球形。如果该值设置为1，圆柱度 Y 值设置为0，则投影将沿 X 轴形成圆柱。如下所示：

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-17.png" alt="cylindricityX参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

       cylindricity y 调试效果：

       描述目标投影沿 Y 轴的球形程度。该值的范围为0到1，其中1为球形。如果该值设置为1，圆柱度 X 值设置为0，则投影将沿 Y 轴形成一个圆柱体。如下所示：

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-18.png" alt="cylindricityY参数调试效果示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

       :::info 注意！

       输入输出尺寸的宽应保持16字节对齐。
       正常的视力值大约是90度。对于圆柱度（见下文）等于“0”的变换，视场宽度和高度180的值将导致图像无限拉伸。
       如果 cylindricity_x 和 cylindricity_y 圆柱度值都设置为1，则投影将是球形的。如果两者都是0，则变换将是矩形的。

       :::




5. Custom
   * 功能描述

       采用 custom 变换后，输入图像中的每个多边形都会变换为正方形。换句话说，任何形状的任何四个邻近输入点在转换后都是正方形，如下图所示。但是，多边形的形状和位置在变换后会发生变化。

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-19.png" alt="Custom自定义变换功能示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

       它们用于创建任何提供的转换都无法描述的转换。为了纠正任意失真，必须向 GDC 工具提供一个特殊的校准文件 config0.txt。如下图

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-20.png" alt="Custom校准文件config0.txt示例" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

   * 成员说明
       | 成员 | 含义                                   |
       |-----------------------------|-----------------|
       | int32_t pan                 | default 0, 不修改 |
       | int32_t tilt                | default 0, 不修改 |
       | zoom                        | 按提供的因子缩放转换输出 |
       | char custom_file[128]        | config.txt 文件名称  |
       | custom_tranformation_t custom | 解析的自定义转换结构 |

       Config file 的规则大致需要注意一下几点：

           1. 第一行是在像素计算中使能 full tile， 1是 enable， 0是 disable。

           2. 第二行是如果使能了 full file，则要跳过的像素数量；这些值需要大于 0，数字越小，libgdc 的性能越慢（性能越慢是指 config.bin 的大小更大， libgdc 生成 config.bin 的时间更长）。

           3. 第三行是垂直方向和水平方向标定点的个数， 第一个值 Y = 1081指的是垂直方向有1081个标定点，第二个值 X = 1921指的水平是方向有1921个标定点。

           4. 第四行是选中区域的中心点，通常是(Y-1)/2、(X-1)/2。

           5. 标定点必须是大于等于0的 int 或 float 类型、相邻两行的标定点不能重复。
               eg.下图是截取的其中的一部分数据图片，第五行到第九行就是标定点在源图的坐标值，格式是 Y: X。以下图为例，一共有1081x1921个标定点。

                <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-25.png" alt="标定点数据格式示例图片" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

           6. 由于标定点必须是等距离的，这意味着输出图片的分辨率取决于标定点的点数。

                <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-22.png" alt="标定点与输出分辨率关系示意图" style={{ width: '50%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

                eg. 输出图片的 Width = 100， Height 计算为340，计算过程如下：100/height = (96~1)/(324~1) \
                下图是更简单的3x3坐标点转换的示例图

                <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-23.png" alt="3x3坐标点转换示例图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />



6.  Keystone+dewarping
    * 功能描述

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-26.png" alt="Keystone+dewarping梯形校正与去畸变功能示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

    * 成员说明
        | 成员 | 含义                                   |
        |-----------------------------|-----------------|
        | int32_t pan                 | default 0, 不修改 |
        | int32_t tilt                | default 0, 不修改 |
        | zoom                        | 按提供的因子缩放转换输出 |
        | double angle(rotation)       | 图像旋转的角度 0/90/180/270  |
        | double elevation | 定义了投影轴的仰角，范围0到90 |
        | double azimuth | 定义了投影轴的方位角度。如果仰角参数 elevation 为0，则方位角将没有可见效果 |
        | int32_t keep_ratio |当“保持比率”参数打开时，FOV 高度参数将被忽略，其值将自动计算，以在水平和垂直方向上保持相同的拉伸强度 |
        | double FOV_h | 描述水平维度中输出视图字段的大小（以度为单位）。有效值的范围是从0到180 |
        | double FOV_w| 描述垂直维度中输出视图字段的大小（以度为单位）。有效值的范围是从0到180 |
        | double cylindricity_y | 描述目标投影沿 Y 轴的球面度。此值从0到1，其中1是球形的。如果此值设置为1，而“圆柱度 X”值设置为0，则投影将沿 Y 轴形成圆柱体 |
        | double cylindricity_x | 描述目标投影沿 X 轴的球面度。此值从0到1，其中1是球形的。如果此值设置为1，并且“圆柱度 Y”值设置为0，则投影将沿 X 轴形成圆柱体 |
        | double trapezoid_left_angle| 默认90；0.1到90 ；变换网格中，左边边界相对于底边边界的角度，见实际效果 |
        | double trapezoid_right_angle | 默认90；0.1到90 ；变换网格中，右边边边界相对于底边边界的角度，见实际效果 |


        :::info 注意！

        输入输出尺寸的宽应保持16字节对齐。

        :::

###### GDC Tool 变换模式参数说明
配置文件可由 GDC tool 生成，以 layout.json 存在。不同的变换模式有不同的参数，以 custom 模式和 keystone+dewarping 模式为例，说明配置参数。

1. keystone+dewarping 模式
    ```json
    {
        "inputRes": [
            1920, // 输入图像尺寸的宽
            1080 // 输入图像尺寸的高
        ],
        "param": {
            "fov": 180, // 输入图像的视场角
            "diameter": 1080, // 输入图像的直径，可控制变换网格的整体大小
            "offsetX": 0, // 变换网格在水平方向的偏移
            "offsetY": 0 // 变换网格在垂直方向的偏移
        },
        "outputRes": [
            1920, // 输出图像尺寸的宽
            1080 // 输出图像尺寸的高
        ],
        "transformations": [
            {
                "transformation": "Dewarp_keystone", // 变换模式
                "position": [ // 输出图像的ROI区域设定
                    0, // 输出图像的ROI水平方向的偏移
                    0, // 输出图像的ROI垂直方向的偏移
                    1920, // 输出图像的ROI的宽
                    1080 // 输出图像的ROI的高
                ],
                "param": {
                    "left_base_angle": 90, // 默认90；0.1到90；变换网格中，左边边界相对于底边边界的角度
                    "right_base_angle": 90, // 默认90；0.1到90；变换网格中，右边边界相对于底边边界的角度
                    "azimuth": 90, // 定义了投影轴的方位角度。如果仰角参数elevation为0，则方位角将没有可见效果
                    "elevation": 0, // 定义了投影轴的仰角，范围0到90
                    "rotation": 0, // 输出图像要旋转的角度
                    "fovWidth": 90, // 描述水平维度中输出视图字段的大小（以度为单位）。 数值越大，变换网格水平方向越宽，有效值的范围是从0到180
                    "fovHeight": 90, // 描述垂直维度中输出视图字段的大小（以度为单位）。数值越大，变换网格垂直方向越宽，有效值的范围是从0到180
                    "keepRatio": 0, // 当“保持比率”参数为1时候，fovHeight参数将被忽略，其值将自动计算，以在水平和垂直方向上保持相同的拉伸强度
                    "cylindricityX": 1, // 描述目标投影沿X轴的球面度。此值从0到1，其中1是球形的。如果此值设置为1，并且“圆柱度Y”值设置为0，则投影将沿X轴形成圆柱体。
                    "cylindricityY": 1 // 描述目标投影沿X轴的球面度。此值从0到1，其中1是球形的。如果此值设置为1，并且“圆柱度Y”值设置为0，则投影将沿X轴形成圆柱体。
                },
                "ptz": [
                    0, // pan参数
                    0, // tile参数
                    1 // zoom参数
                ],
                "roi": { // 输入图像ROI区域设定
                    "x": 0, // 输入图像ROI区域的水平方向偏移
                    "y": 0, // 输入图像ROI区域的垂直方向偏移
                    "w": 1920, // 输入图像ROI区域的宽
                    "h": 1080 // 输入图像ROI区域的高
                }
            }
        ],
        "mode": "semiplanar420", // 处理的格式设定
        "eccMode": "eccDisabled", // 处理的ecc模式
        "colourspace": "yuv" // 处理的数据格式
    }
    ```

2. custom 模式
    ```json
    {
        "inputRes": [
            1280, // 输入图像尺寸的宽
            720 // 输入图像尺寸的高
        ],
        "param": {
            "fov": 192, // 输入图像的视场角
            "diameter": 720, // 输入图像的直径，可控制变换网格的整体大小
            "offsetX": 0, // 变换网格在水平方向的偏移
            "offsetY": 0 // 变换网格在垂直方向的偏移
        },
        "outputRes": [
            560, // 输出图像尺寸的宽
            258 // 输出图像尺寸的高
        ],
        "transformations": [
            {
                "transformation": "Custom", // 变换模式
                "position": [ // 输出图像的ROI区域设定
                    0, // 输出图像的ROI水平方向的偏移
                    0, // 输出图像的ROI垂直方向的偏移
                    560, // 输出图像的ROI的宽，小于等于outputRes的宽
                    258 // 输出图像的ROI的高，小于等于outputRes的高
                ],
                "ptz": [
                    0, // pan参数
                    0, // tile参数
                    1 // zoom参数
                ],
                "roi": { // custom模式下无效
                    "x": 0, // custom模式下无效
                    "y": 0, // custom模式下无效
                    "w": 0, // custom模式下无效
                    "h": 0 // custom模式下无效
                },

    "param": {
                    "customTransformation": "/path_to/camera_0_gdc.txt" // 坐标点文件的在板子中的路径
                }
            }
        ],
        "mode": "semiplanar420", // 处理的格式设定
        "eccMode": "eccDisabled", // 处理的ecc模式
        "colourspace": "yuv" // 处理的数据格式
    }
    ```
    :::info 注意！

    1. ecc mode 统一填写 ecc is disable。可选 ecc mode 使能，但没有实际效果。
    2. 当参数为小数时，保证精度为浮点运算以后8位小数及以上，否则可能生成的 bin 不一致。
    3. 用户填充数据结构或者 json 时填充的信息应该包含各种模式示例所有项。
    4. 非 custom 模式，配置文件中的 roi 参数代表输入图片的 roi。
    5. 配置文件中的 position 参数代表输出图片的 roi。

    :::

3. Affine
配置文件内容如下：

    ```json
    {
        "inputRes": [
            1920,
            1080
        ],
        "param": {
            "fov": 160,
            "diameter": 1080,
            "offsetX": 0,
            "offsetY": 0
        },
        "outputRes": [
            1920,
            1080
        ],
        "transformations": [
            {
                "transformation": "Affine",
                "position": [
                    0,
                    0,
                    1920,
                    1080
                ],
                "param": {
                    "rotation": 0
                },
                "ptz": [
                    0,
                    0,
                    1
                ],
                "roi": {
                    "x": 0,
                    "y": 0,
                    "w": 1920,
                    "h": 1080
                }
            }
        ],
        "mode": "semiplanar420",
        "eccMode": "eccDisabled",
        "colourspace": "yuv"
    }
    ```
    输入图片加变换网格如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-27.png" alt="Affine模式输入图片加变换网格示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

    输出图片如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-28.png" alt="Affine模式输出图片效果" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


4. Equisolid
配置文件内容如下：

    ```json
    {
        "inputRes": [
            1920,
            1080
        ],
        "param": {
            "fov": 160,
            "diameter": 1080,
            "offsetX": 0,
            "offsetY": 0
        },
        "outputRes": [
            1920,
            1080
        ],
        "transformations": [
            {
                "transformation": "Panoramic",
                "position": [
                    0,
                    0,
                    1920,
                    1080
                ],
                "param": {
                    "strength": 1,
                    "strengthY": 1,
                    "rotation": 0
                },
                "ptz": [
                    0,
                    0,
                    1
                ],
                "roi": {
                    "x": 0,
                    "y": 0,
                    "w": 1920,
                    "h": 1080
                }
            }
        ],
        "mode": "semiplanar420",
        "eccMode": "eccDisabled",
        "colourspace": "yuv"
    }
    ```
    输入图片加变换网格如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-29.png" alt="Equisolid模式输入图片加变换网格示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

    输出图片如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-30.png" alt="Equisolid模式输出图片效果" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


5. Equisolid(cylinder)
配置文件内容如下：

    ```json
    {
        "inputRes": [
            1920,
            1080
        ],
        "param": {
            "fov": 160,
            "diameter": 1080,
            "offsetX": 0,
            "offsetY": 0
        },
        "outputRes": [
            1920,
            1080
        ],
        "transformations": [
            {
                "transformation": "Stereographic",
                "position": [
                    0,
                    0,
                    1920,
                    1080
                ],
                "param": {
                    "strength": 1,
                    "rotation": 0
                },
                "ptz": [
                    0,
                    0,
                    1
                ],
                "roi": {
                    "x": 0,
                    "y": 0,
                    "w": 1920,
                    "h": 1080
                }
            }
        ],
        "mode": "semiplanar420",
        "eccMode": "eccDisabled",
        "colourspace": "yuv"
    }
    ```
    输入图片加变换网格如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-31.png" alt="Equisolid(cylinder)模式输入图片加变换网格示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

    输出图片如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-32.png" alt="Equisolid(cylinder)模式输出图片效果" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

6. Equidistant
配置文件内容如下：

    ```json
    {
        "inputRes": [
            1920,
            1080
        ],
        "param": {
            "fov": 160,
            "diameter": 1080,
            "offsetX": 0,
            "offsetY": 0
        },
        "outputRes": [
            1920,
            1080
        ],
        "transformations": [
            {
                "transformation": "Universal",
                "position": [
                    0,
                    0,
                    1920,
                    1080
                ],
                "param": {
                    "azimuth": 0,
                    "elevation": 0,
                    "rotation": 0,
                    "fovWidth": 90,
                    "fovHeight": 90,
                    "keepRatio": 0,
                    "cylindricityX": 1,
                    "cylindricityY": 1
                },
                "ptz": [
                    0,
                    0,
                    1
                ],
                "roi": {
                    "x": 0,
                    "y": 0,
                    "w": 1920,
                    "h": 1080
                }
            }
        ],
        "mode": "semiplanar420",
        "eccMode": "eccDisabled",
        "colourspace": "yuv"
    }
    ```

    输入图片加变换网格如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-33.png" alt="Equidistant模式输入图片加变换网格示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

    输出图片如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-34.png" alt="Equidistant模式输出图片效果" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

7. Custom
输入1280x720，输出560x258。配置文件内容如下:

    ```json
    {
        "inputRes": [
            1280,
            720
        ],
        "param": {
            "fov": 192,
            "diameter": 720,
            "offsetX": 0,
            "offsetY": 0
        },
        "outputRes": [
            560,
            258
        ],
        "transformations": [
            {
                "transformation": "Custom",
                "position": [
                    0,
                    0,
                    560,
                    258
                ],
                "ptz": [
                    0,
                    0,
                    1
                ],
                "roi": {
                    "x": 0,
                    "y": 0,
                    "w": 0,
                    "h": 0
                },
                "param": {
                    "customTransformation": "/path_to/camera_0_gdc_config_3.1.txt"
                }
            }
        ],
        "mode": "semiplanar420",
        "eccMode": "eccDisabled",
        "colourspace": "yuv"
    }
    ```

    输入图片加变换网格如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-35.png" alt="Custom模式输入图片加变换网格示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

    输出图片如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-36.png" alt="Custom模式输出图片效果" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


8. Keystone+dewarping
配置文件内容如下：

    ```json
    {
        "inputRes": [
            1920,
            1080
        ],
        "param": {
            "fov": 180,
            "diameter": 1080,
            "offsetX": 0,
            "offsetY": 0
        },
        "outputRes": [
            1920,
            1080
        ],
        "transformations": [
            {
                "transformation": "Dewarp_keystone",
                "position": [
                    0,
                    0,
                    1920,
                    1080
                ],
                "param": {
                    "left_base_angle": 90,
                    "right_base_angle": 90,
                    "azimuth": 0,
                    "elevation": 0,
                    "rotation": 0,
                    "fovWidth": 90,
                    "fovHeight": 90,
                    "keepRatio": 0,
                    "cylindricityX": 1,
                    "cylindricityY": 1
                },
                "ptz": [
                    0,
                    0,
                    1
                ],
                "roi": {
                    "x": 0,
                    "y": 0,
                    "w": 1920,
                    "h": 1080
                }
            }
        ],
        "mode": "semiplanar420",
        "eccMode": "eccDisabled",
        "colourspace": "yuv"
    }
    ```

    输入图片加变换网格如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-37.png" alt="Keystone+dewarping模式输入图片加变换网格示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

    输出图片如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-38.png" alt="Keystone+dewarping模式输出图片效果" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


##### GDC bin 相关 API 参考
以下 API 用于 GDC BIN 生成，GDC 模块控制 API 见 HBN API。

1. hb_vio_gen_gdc_cfg

    【函数声明】

    int32_t hb_vio_gen_gdc_cfg(param_t *gdc_parm, window_t *wnds, uint32_t wnd_num, void **cfg_buf, uint64_t *cfg_size)

    【参数描述】

    * [IN] param_t *gdc_parm：gdc 对应参数，包括分辨率，格式等。
    * [IN] window_t *wnds：gdc 内部区域参数。
    * [IN] uint32_t wnd_num： window 数目。
    * [OUT] uint32_t **cfg_buf：生成的 gdc cfg bin，内部分配。
    * [OUT] uint64_t *cfg_size：gdc cfg bin 文件的大小。

    【返回值】

    - 成功：E_OK: Success
    - 失败：E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

    【功能描述】

    生成 gdc 模块工作所需的 bin 文件。

2. hb_vio_set_gdc_cfg

    【函数声明】

    int32_t hb_vio_set_gdc_cfg(uint32_t pipeline_id, uint32_t *cfg_buf, uint64_t cfg_size)

    【参数描述】

    - [IN] uint32_t pipeline_id:pipeline id ; 软件通道 id;range:[0, 23],default:0；
    - [IN] cfg_buf:config buffer of gdc cfg bin; gdc cfg bin 的 buffer
    - [IN] cfg_size:size of gdc cfg bin ; gdc cfg bin 文件的大小

    【返回值】

    - 成功：E_OK: Success;成功
    - 失败：E_NOT_OK: Fail,return error code;失败,返回错误码;range:[-10000,-1]

    【功能描述】

    设置 gdc 模块的 cfg bin。

3. hbn_free_gdc_bin

    【函数声明】

    void hb_vio_free_gdc_cfg(uint32_t *cfg_buf)

    【参数描述】

    - [IN] uint32_t* cfg_buf:Buffer of gdc cfg bin; gdc cfg bin 的 buffer.

    【返回值】

    - NONE

    【功能描述】

    释放生产 gdc 模块 cfg bin 的 buffer

##### GDC bin 相关参数说明
1. typedef struct param_t

    | 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
    |----- |------|-------|--------|-------|------|------|
    | format | frame_format_t |  |  |  | 处理图像格式 | 是 |
    | in | reso lution_t |  |  |  | 实际输入图像尺寸 | 是 |
    | out | reso lution_t |  |  |  | 实际输出图像尺寸 | 是 |
    | x_offset | int32_t | 0 |  | 0 | 输入区域沿 x 轴的偏移像素数 | 是 |
    | y_offset | int32_t | 0 |  | 0 | 输入区域沿 y 轴的偏移像素数 | 是 |
    | diameter | int32_t | | | | 定义矩形输入图 像上包含实际鱼眼 照片的输入圆形区 域的像素直径。对 于某些相机，此圆 形图像区域的直径 可以大于或小于矩 形画布的尺寸（有 时可能会被裁剪）一般情况下 diameter 应保持与 input.height 一致。 | 是 |
    | fov | double | 0 | | | 视场定 义输入图像的可视 角度，影响源网格 的曲率。视场越大 ,透视变形越大。 | 是 |


2. typedef enum frame_format frame_format_t
    | 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
    |----- |------|-------|--------|-------|------|------|
    | FM T_UNKNOWN | enum |  |  |  | 未知格式 |  |
    | FMT_LUMINANCE | enum |  |  |  | 暂不支持 |  |
    | FMT_P LANAR_444 | enum |  |  |  | 暂不支持 |  |
    | FMT_P LANAR_420 | enum |  |  |  | 暂不支持 |  |
    | FMT_SEMIP LANAR_420 | enum |  |  |  | NV12 |  |
    | FM T_GDC_MAX | enum |  |  |  |  |  |


3. typedef struct resolution_s resolution_t
    | 名称 | 类型     | 最小值 | 最大值 | 默认值 | 含义       | 必选 |
    |------|----------|--------|--------|--------|------------|------|
    | w    | uint32_t |       |       |       | 宽度（像素） |     |
    | h    | uint32_t |       |       |       | 高度（像素） |     |



4. typedef struct window_t
    | 名称                  | 类型                     | 最小值 | 最大值 | 默认值 | 含义                                                   | 必选 |
    |-----------------------|--------------------------|--------|--------|--------|--------------------------------------------------------|------|
    | out_r                 | rect_t                   |        |        |        | 输出数据大小信息                                       |    |
    | transform             | transformation_t         | 0      | 6      | 0      | 使用的转换模式                                         |    |
    | input_roi_r           | rect_t                   |        |        |        | roi 区域                                                |    |
    | pan                   | int32_t                  |        |        |        | 以输出图像为中心的水平方向目标位移（像素单位）        |    |
    | tilt                  | int32_t                  |        |        |        | 以输出图像为中心的垂直方向目标位移（像素单位）        |    |
    | zoom                  | double                   |        |        |        | 目标缩放系数                                           |    |
    | strengthX             | double                   |        |        |        | x 方向变换的非负变换强度参数                           |    |
    | strengthY             | double                   |        |        |        | y 方向变换的非负变换强度参数                           |    |
    | angle                 | double                   |        |        |        | 主投影轴绕自身旋转的角度                              |    |
    | elevation             | double                   |        |        |        | 指定主投影轴的角度                                     |    |
    | azimuth               | double                   |        |        |        | 指定主投影轴的角度，从北方向顺时针计数                |    |
    | keep_ratio            | int32_t                  |        |        |        | 在水平方向和垂直方向保持相同的拉伸强度               |    |
    | FOV_h                 | double                   |        |        |        | 输出视场的垂直尺寸以度数表示                          |    |
    | FOV_w                 | double                   |        |        |        | 输出视场的水平尺寸以度数表示                          |    |
    | cylindricity_y        | double                   |        |        |        | 目标在垂直方向上的投影形状的圆柱度水平                |    |
    | cylindricity_x        | double                   |        |        |        | 目标在水平方向上的投影形状的圆柱度水平                |    |
    | custom_file[128]      | char                     |        |        |        | custom 模式下的自定义转换描述文件                      |    |
    | custom                | custom_tranformation_t   |        |        |        | 自定义模式下的转换信息                                |    |
    | trapezoid_left_angle  | double                   |        |        |        | 梯形底与斜边之间的左锐角                              |    |
    | trapezoid_right_angle | double                   |        |        |        | 梯形底与斜边之间的右锐角                              |    |
    | check_compute         | uint8_t                  |        |        |        | 暂时无用                                               |   |


5. typedef struct rect_s rect_t
    | 名称 | 类型     | 最小值 | 最大值 | 默认值 | 含义         | 必选 |
    |------|----------|--------|--------|--------|--------------|------|
    | x    | int32_t  |        |        |        | 起始点 x 坐标  |      |
    | y    | int32_t  |        |        |        | 起始点 y 坐标  |      |
    | w    | int32_t  |        |        |        | 宽度         |      |
    | h    | int32_t  |        |        |        | 高度         |      |


6. typedef enum gdc_transformation transformation_t

    | 名称              | 类型  | 最小值 | 最大值 | 默认值 | 含    义                                                                 | 必选 |
    |-------------------|-------|--------|--------|--------|    ----------------------------------------------------------------------|------|
    | PANORAMIC         | enum  |       |       |       | 全景变    换                                                             ||
    | CYLINDRICAL       | enum  |       |       |       |     NA                                                                   ||
    | STEREOGRAPHIC     | enum  |       |       |       | 畸变校正与全景变换相同，但输出图像是圆柱全景图，而不是平    面图       ||
    | UNIVERSAL         | enum  |       |       |       | Equidistant 等距变    换                                                ||
    | CUSTOM            | enum  |       |       |       | 用户定制的变换，可定制用于变换的网    格                                ||
    | AFFINE            | enum  |       |       |       | 线性变    换                                                             ||
    | DEWARP_KEYSTONE   | enum  |       |       |       | 相对于等距变换，可选择非等距。等距变换 Equidistant 是其    一种特殊情况 ||

7. typedef struct point_s point_t
    | 名称 | 类型   | 最小值 | 最大值 | 默认值 | 含义   | 必选 |
    |------|--------|--------|--------|--------|--------|------|
    | x    | double |        |        |        | x 坐标 |      |
    | y    | double |        |        |        | y 坐标 |      |

8. typedef struct custom_tranformation_s custom_tranformation_t

    | 名称         | 类型      | 最小值 | 最大值 | 默认值 | 含义                                                                                                  | 必选 |
    |--------------|-----------|--------|--------|--------|-------------------------------------------------------------------------------------------------------|------|
    | full_tile_calc | uint8_t   |        |        |        | 是否开启分块计算；如果使能 fulltile，libgdcbin 会额外分块做 min/max 计算，tile 越多，精度越高，效果越好，但生成 bin 的时间也越长 |      |
    | tile_incr_x  | uint16_t  |        |        |        | tile increase in x                                                                                    |      |
    | tile_incr_y  | uint16_t  |        |        |        | tile increase in y                                                                                    |      |
    | w            | int32_t   |        |        |        | 自定义转换网格中水平方向上的数字或点                                                                 |      |
    | h            | int32_t   |        |        |        | 自定义转换网格中垂直方向上的数字或点                                                                 |      |
    | centerx      | double    |        |        |        | 沿 x 轴的中心，通常是水平方向坐标点数的一半                                                          |      |
    | centery      | double    |        |        |        | 沿 y 轴的中心，通常是垂直方向坐标点数的一半                                                          |      |
    | *points      | point_t   |        |        |        | `config.txt` 中定义的转换点序列，数量 = `w * h`                                                      |      |


#### STITCH

**简介**

stitch 是一个可配置的图像拼接计算单元，可以完成多幅图像之间的融合拼接，主要应用于自动泊车场景下的360度环视图像拼接。stitch 基于 ROI 进行计算，每个 ROI 可以完成两幅源图像的 alpha-beta
blending 融合,
并将其写入目标图像指定的 ROI 中，这种融合拼接方式可以使得拼接过渡更加自然，同时 stitch 还支持 Y、U、V 各通道的增益调节，可以实现源图像间的亮度、色度均衡，进一步提升拼接效果。此外 stitch 支持用户输入自定义像素级 alpha-beta 权重值，基此可实现多种融合效果，如背景虚化、图像水印等。
Stitch 硬件支持最大的输入输出尺寸为4096x4096。
Stitch 输入支持选择最大的 ROI 区域为2000x2000。

**硬件工作模式**

- Online blnding: 无需输入 LUT 表，硬件自动进行融合拼接，要求 ROI
w=h；该模式下硬件依据配置参数中的过渡带宽度、方向等，自动计算出每个像素点的 alpha、beta 权重值。
- Alpha blending: 需要输入 alpha
LUT 表，硬件读取 DDR 中的 alpha 权重值进行加权融合; 其中 alpha
LUT 表中存储着该 ROI 中每个像素点的 alpha 权重值。对于每个像素点硬件会分别读取 y、uv、alpha 的值进行加权融合。
- Alpha-beta blending: 需要输入 alpha、beta
LUT 表，硬件读取 DDR 中的 alpha、beta 权重值进行加权融合。
- Src copy: 不需要输入 LUT 表，硬件直接拷贝 src0。
- Src alpha copy: 需要 alpha
LUT 表，硬件读取 DDR 中的 alpha 权重值并进行融合 src0。
其中，LUT 表指的是融合拼接权重参数 buf

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch_work.png" alt="STITCH示意图" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

**硬件拼接示意图**

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch0.png" alt="STITCH示意图" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
通过使用图片上的两个源 ROI 进行不同 blend mode 的拼接，最终输出对应的 ROI 结果

**拼接方案介绍**

硬件拼接功能可以完成将多张图片拼接融合生成一张图片。硬件上设计灵活，以 ROI 为基本处理单位，基于 alpha
blend 算法，使用不同的配置字参数划分出不同的 ROI 划分区域灵活的配置生成多种不同的拼接方案，并且运用 LUT 表处理拼接的过渡区域优化效果，在自动驾驶以及 ADAS 的 APA 场景下，可以将四路摄像头已经被畸变矫正过后的 IPM 图像数据拼接成一路360环视图，用于停车位的检测，方便用户查看车位线周边情况进行停车。

**典型场景**
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch1.png" alt="STITCH示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
在 APA 场景，四路环视泊车，GDC 从 DDR 中获取4张回灌图片和参考点(CFG
BIN)通过畸变矫正输出4张 IPM 图，然后通过 STITCH 硬件拼接模块使用预先定义好的配置字拼接方案参数(CPG
PARAM)进行硬件拼接输出鸟瞰图。

**摆放位置**

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch2.png" alt="STITCH示意图" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
1. 四张 IPM 图通过 copy 模式放到指定输出地址的指定位置
2. 没有重合的区域可以使用直接拷贝模式
3. ROI 重合区域使用 Alpha Blend 模式进行融合拼接

**LUT 表**

LUT 表存放的是 alpha/beta 融合参数系数，类似权重值，每个 ROI 都要生成对应像素点的融合参数系数，范围0~255，依次存放进 LUT 表的内存中,
当 ROI 的拼接模式使用 alpha 和 beta 融合时候，会使用该参数进行融合。

比如 坐标点参数举例章节中的 LUT 生成：
ROI-0/1: 256*512 ROI-2/3: 560*256 ROI-4/5:256*218 ROI-6/7:256*186
LUT:ROI-0 + ROI-1 + ROI-2 + ROI-3 + ROI-4 + ROI-5 + ROI-6 + ROI-7
目前 LUT 表可以通过 convert_tool 工具生成。

**坐标点参数举例**

硬件拼接的 ROI 的划分与相机的安装位置有直接关系，目前可以通过 convert-tool 工具生成，下图为各 ROI 划分区域坐标点显示示例。
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch3.png" alt="STITCH示意图" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
 | ROI   |范围            | SRC0          | 起点     | 大小      | SRC1          | 起点      | 大小      | 目标起点  | 模式        |
 | ----- |----------------| --------------| ---------| ----------| --------------| ----------| ----------| ----------| ------------|
 | 0     |左视全图        | 左视(frame0)  | (0,0)    | -256,512  | /             | /         | /         | (0,40)    | 直接拷贝    |
 | 1     |右视全图        | 右视(frame2)  | (0,0)    | -256,512  | /             | /         | /         | (304,40)  | 直接拷贝    |
 | 2     |后视全图        | 后视(frame3)  | (0,0)    | -560,256  | /             | /         | /         | (0,366)   | 直接拷贝    |
 | 3     |前视全图        | 前视(frame1)  | (0,0)    | -560,256  | /             | /         | /         | (0,0)     | 直接拷贝    |
 | 4     |左视与前视重合  | 左视(frame0)  | (0,0)    | -256,218  | 前视(frame1)  | (0,40)    | -256,218  | (0,40)    | AlphaBlend  |
 | 5     |右视与前视重合  | 右视(frame2)  | (0,0)    | -256,218  | 前视(frame1)  | (304,40)  | -256,218  | (304,40)  | AlphaBlend  |
 | 6     |左视与后视重合  | 左视(frame0)  | (0,366)  | -256,186  | 后视(frame3)  | (0,0)     | -256,186  | (0,366)   | AlphaBlend  |
 | 7     |右视与后视重合  | 右视(frame2)  | (0,366)  | -256,186  | 后视(frame3)  | (304,0)   | -256,218  | -304,366  | AlphaBlend  |


#### LPWM
##### LPWM 简述

LPWM 为类似 PWM 的信号源，一般用于 camsys 系统中触发 sensor 曝光。LPWM 本身也需要外界触发，在收到 trigger 信号后，按照所配置的 period, high-time, offset 等参数输出 1Hz ~ 500KHz，有效高电平 0us ~ 4095us，默认精度为 1us 的方波。

S100 总共有 3 个 LPWM chip，每个 LPWM chip 下面有 4 个 LPWM 通道，请根据实际的硬件连接使用配置。

S100 的 camera 硬件同步功能的主体实现依赖 LPWM 模块，其支持 S100 多种 trigger 信号源，并产生多通道的可配置 PWM 信号，输出给外部 camera 使用(可经 SerDes 转发)，从而实现 trigger 源与 camera 的同步及所有多 camera 之间的同步。

##### LPWM 配置项说明

1. trigger_mode [0, 1]：LPWM 触发方式，0 为内部软件触发，1 为外部触发。

2. trigger_source [0, 10]：LPWM 触发源，使用外部触发源需将 trigger_mode 设置为1。一般场景下使用 0，触发周期默认为1s。

| trigger_source 的值 | 对应的触发源 |
|-------------------|-------------|
| 0                 |  aon_rtc_pps |
| 1                 |  reserve |
| 2                 |  pps0 |
| 3                 |  pps1 |
| 4                 |  pps2 |
| 5                 |  reserve |
| 6                 |  pcie0_ptm_pps |
| 7                 |  pcie1_ptm_pps |
| 8                 |  acore_eth0_pps |
| 9                 |  acore_eth1_pps |
| 10                |  mcu_eth_pps |

3. period [2, 1000000)us：LPWM 输出的方波周期。
4. offset [0, 1000000)us：LPWM 在每个 trigger 周期内第一个波形的偏移时间，需要小于 period 值。
5. duty_time [0, 4096)us：LPWM 输出波形的有效高电平时间，需要小于 period 值。
6. threshold [0, 65535]us：缓慢同步功能阈值，高阶功能，一般可忽略。
7. adjust_step [0, 15]：每次的调整时间 adjust_time = 2^adjust_step，高阶功能，一般可忽略。

##### LPWM 配置计算说明

LPWM 的 trigger 源为 PPS，常用周期为 1s，在收到 trigger 信号后，首先进行一个 offset 的时间偏移，接着会输出连续方波，方波的周期以及有效电平的时间由配置所得，当下一个 trigger 信号到来，会重复偏移以及出波。

offset 设置依赖于 sensor fps，如果 fps 不能被 1s 整除，则需要设置 offset，反之 offset 设置为 0。

常见场景如接入30fps sensor，period 应设置为 1s/fps = 33333us。sensor 在跑完 30 帧经过 999,990us，与下次 PPS trigger 会有 10us 的间隙，因此 offset 应设为 10us（至少10us，至多（period - duty_time us，为了稳妥，建议在计算出的 offset 基础上再加 1），否则 lpwm 会在1s 内发出 31 个方波）。

由于硬件或者外设差异，PPS 落在了高电平区域，若关闭缓慢同步功能或者缓慢同步成功后需要走完高电平区域才能进入下一个 trigger 周期，即重新计算 offset，此时可能存在 trigger 周期内 LPWM 波形未达到预期数量，导致曝光同步下 sensor 帧率不符合预期，可将 offset 适当增加保证 PPS 每次一定落在低电平区域，输出预期的波形。

```
Period = 1000000 / fps
Offset = 1000000 - Period * fps + 1
```
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/lpwm_01.png" alt="LPWM示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

推荐使用配置
| 使用场景 | trigger_source | trigger_mode | duty_time | offset | period |
|---------|----------------|--------------|-----------|--------|---------|
| 全30fps |  8(eth0)/9(eth1) | 1          |  100      |   11   |   33333 |
| 全25fps |  8(eth0)/9(eth1) | 1          |  100      |   11   |   40000 |
| 12.5/25fps |  8(eth0)/9(eth1) | 1          |  100      |   11   |   80000/40000 |
| 30/10fps |  8(eth0)/9(eth1) | 1          |  100      |   11   |   33333/100000 |

##### 其他说明
当使能 MCU 的 RTC 功能时，CIM 硬件会自动锁存 LPWM trigger 信号对应的时间戳，软件会将该时间与 global_time 同步后提供给用户。当 sensor 工作在曝光同步模式下，此时间戳代表 sensor 触发曝光开始的时间。

当 sensor 工作在同步出图或者未同步的状态下，此时 sensor 曝光起始时间与 LPWM 信号无关，即 CIM 的 frame start(tv) 与 LPWM trigger(trig_tv) 时间之间无关联，此时该值无参考价值，无需关注。

实际使用需要确保 PPS 稳定落在低电平区域，因此可以根据实际调试情况适当调大 offset。

### 数据流和性能指标

RDK-S100 接入 camera 后，进入后级模块处理，其数据流通路如下图所示：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/47ab7cc928ceb5b8e03de23bb95d057b.png" alt="S100 Camsys 数据流通路图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

-   MIPI RX: 3路 CDPHY，每路为 DPHY 最大 4.5Gbps/lane x 4lane 或 CPHY 最大
    3.5Gbps/trio x 3trio，每路支持4VC，理论最多支持 12 路接入 。

| RDK-S100 软件预计最大支持 6路 camera，RX4 通过 serdes 最多可接入 4 路 camera，RX0 和 RX1 各接入 1路 camera，如果不是这种常规接法，请联系 FAE 进行确认。 |
|---------------------------------------------------------------------------------------------------------------------------------------------------------|


:::tip 商业支持
商业版提供更完整的功能支持、更深入的硬件能力开放和专属的定制内容。为确保内容合规、安全交付，我们将通过以下方式开放商业版访问权限。

商业版本获取流程：
1. 填写问卷：提交您的机构信息、使用场景等基本情况
2. 签署保密协议（NDA）：我们将根据提交信息与您联系，双方确认后签署保密协议
3. 内容释放：完成协议签署后，我们将通过私有渠道为您开放商业版本资料
  
如您希望获取商业版内容，请点击下方链接填写问卷，我们将在 3 ～ 5 个工作日内与您联系：
https://horizonrobotics.feishu.cn/share/base/form/shrcnpBby71Y8LlixYF2N3ENbre
:::

-   CIM: RX 接入，可 online 输出到 ISP0/ISP1(RAW) 与 PYM0/PYM1(YUV)，也可
    offline 下 DDR，之后各模块通过 DDR 读取使用数据流。

-   ISP: 2 个 ISP 设备，各支持 4 路 online + 8 路 offline 输入，每个 ISP
    最大支持 2x4K\@60fps 处理。

-   PYM: 3 个 PYM 设备，其中 PYM0/PYM1 为全功能模块支持 online/offline，PYM4
    只支持 offline，4K\@60fps 处理。

-   GDC: 1 个 GDC 设备，只支持 offline 方式，4K\@60fps 处理。

 |                   | CIM         | ISP0 / ISP1  | PYM0 / PYM1  | PYM4        | GDC         | YNR        | STITCH     |
 |-------------------| ------------| -------------| -------------| ------------| ------------| -----------| -----------|
 |1080P 处理每帧耗时  | 3.7151 ms   | 1.8616 ms    | 2.2373 ms    | 2.7616 ms   | 3.7447 ms   | 1.7774 ms  | 1.5739 ms  |
 |4k 处理每帧耗时     | 14.8606 ms  | 7.4467 ms    | 7.1356 ms    | 10.7018 ms  | 15.0624 ms  | 7.1096 ms  | 5.7349 ms  |

### Camsys 接入能力
S100 camsys 硬件设计理论可以最大接入8路4k RAW 30fps + 4路1536p YUV 30fps。
实际验证过最大接入场景为：
1. 3路4k RAW（3840*2160） 30fps + 9路1280p RAW（1920*1280）30fps；
2. 3路4k RAW（3840*2160） 30fps + 5路1280p RAW（1920*1280）30fps + 4路1536p YUV（1920*1536）30fps；

### 已点亮 sensor

 |类型         | sensor name  | 备注            |
 |-------------| -------------| ----------------|
 |MIPI sensor  | IMX219       | raw10 1080p     |
 |GMSL sensor  | 0820c        | yuv 4k & 1080p  |
 |             | OVX3C        | raw12 1280P     |
 |             | OVX8B        | raw12 4K        |
## V4L2

S100 Camsys 部分模块已经接入 V4L2，可以通过标准 V4L2编程及开源工具获取 camsys 数据流

### 使用方式

开机启动后 camsys 默认运行在 hbn 模式，可以通过加载 camsys V4L2 ko，切换到 V4L2模式

切换 v4l2方式：
```c
  #卸载hbn驱动
  rmmod hobot_isp
  rmmod hobot_cim
  rmmod hobot_mipidbg
  rmmod hobot_mipicsi
  rmmod hobot_pym_jplus
  rmmod hobot_gdc
  rmmod hobot_ynr

  #加载v4l2驱动
  echo ion > /sys/module/hobot_camsys_adapter/parameters/mops # ion 或 dma 可选
  modprobe videobuf2-common
  modprobe videobuf2-v4l2
  modprobe videobuf2-memops
  modprobe videobuf2-common
  modprobe videobuf2-dma-contig
  modprobe videobuf2-v4l2
  modprobe v4l2-mem2mem
  modprobe imx219
  modprobe v4l_mipicsi
  modprobe v4l2_cim
  modprobe hobot_isp_v4l2
  modprobe pym_v4l_drv
  modprobe gdc_v4l_drv
  modprobe hobot_ynr_v4l2
  modprobe vid_v4l2 scene=[scene num] #scene num见下表
  或 modprobe vid_v4l2 scene_table="xxx"
  nohup isp_service &
```
场景构建方式：
1. 已有场景，直接通过场景 num 指定
```c
modprobe vid_v4l2 scene=[scene num]
```
2. 特殊场景，通过场景 table 表构建
```c
modprobe vid_v4l2 scene_table="{<pre_module><hw_id>-<ctx_id>,<pad>,<next_module><hw_id>-<ctx_id>,<pad>,1}{...}..."
# 参数含义：
# 一个{}表示两模块的链接关系
# pre_module和next_module指定前后链接的模块，可以填cim、isp、ynr、pym、gdc、video、video-m2c
# hw_id指定硬件hardware id
# ctx_id指定硬件context id
# pad为pad num，一般为0，例如pym支持多通道输出可以配置为0~5
# 一个链路最终的next_module必须指定为video或者video-m2m
# 注意scene_table传入的场景字符串不需要加空格
# 例如scene_table="{cim0-0,0,isp0-0,0,1}{isp0-0,0,video,0,1}" 构建cim0-otf-isp0-ddr场景
# 例如构建下面的场景9：scene_table="{cim0-0,0,isp1-4,0,1}{cim1-0,0,isp1-5,0,1}{isp1-4,0,ynr1-4,0,1}{isp1-5,0,ynr1-5,0,1}{ynr1-4,0,pym1-0,0,1}{ynr1-5,0,pym1-1,0,1}{pym1-0,0,video,0,1}{pym1-1,0,video,0,1}"
```

场景切换方式：
```c
rmmod vid_v4l2
modprobe vid_v4l2  xxx=xxxx### 场景说明
```

### 场景说明
<DocScope products="RDK-S100">

| scene num | 场景简述                      | 场景描述                            | 对应 video 节点（相对）        |
|-----------|-------------------------------|-------------------------------------|------------------------------|
| 0         | CIM-DDR 输出                   | CIM0 输出1路至 DDR （对应 video0）    | video0                       |
|           |                               | CIM1 输出1路至 DDR                   | video1                       |
|           |                               | CIM4 输出4路至 DDR（serdes 场景）     | video2~5                     |
| 1         | CIM-OTF-ISP-DDR               | CIM0-OTF-ISP0-DDR                   | video0                       |
|           |                               | CIM1-OTF-ISP1-DDR                   | video1                       |
| 2         | CIM-OTF-ISP-OTF-PYM-DDR 2路   | CIM0-OTF-ISP0-OTF-PYM0,             | video0对应第一路 pym ds0      |
|           |                               | PYM 输出一个通道                     |                              |
|           |                               | CIM1-OTF-ISP1-OTF-PYM1,             | video1对应第二路 pym ds0      |
|           |                               | PYM 输出一个通道                     |                              |
| 3         | CIM-OTF-ISP-OTF-PYM-DDR       | CIM0-OTF-ISP0-OTF-PYM0,             | video0 ~ video5对应 ds0~5       |
|           | 2路输出6通道                  | PYM 输出6个通道                      |                              |
|           |                               | CIM1-OTF-ISP1-OTF-PYM1,             | video6 ~ video11对应 ds0~ds5    |
|           |                               | PYM 输出6个通道                      |                              |
| 4         | CIM-DDR-ISP-DDR               | CIM0-DDR-ISP0-DDR                   | video0                       |
|           |                               | CIM1-DDR-ISP1-DDR                   | video1                       |
| 5         | CIM-DDR-ISP-OTF-PYM           | CIM0-DDR-ISP0-OTF-PYM0              | video0                       |
|           |                               | 输出一个通道                        |                              |
| 6         | CIM-OTF-ISP-DDR-GDC           | CIM0-OTF-ISP-DDR-GDC                | video0                       |
|           |                               | 输出一个通道                        |                              |
| 7         | DDR-PYM-DDR 回灌输出           | 回灌 PYM 输出6路至 DDR                 | video0 ~ 5                   |
|           |                               | 回灌 PYM 输出6路至 DDR                 | video6 ~ 11                  |
|           | DDR-GDC-DDR 回灌输出           | 回灌 GDC 输出至 DDR                    | video12                      |
|           |                               | 回灌 GDC 输出至 DDR                    | video13                      |
| 9         | CIM-DDR-ISP-OTF-YNR-PYM       | CIM0-DDR-ISP1-OTF-YNR1-OTF-PYM1     | video0                       |
|           |                               | CIM1-DDR-ISP1-OTF-YNR1-OTF-PYM1     | video1                       |

</DocScope>
<DocScope products="RDK-S600">

| scene num | 场景简述                      | 场景描述                            | 对应 video 节点（相对）        |
|-----------|-------------------------------|-------------------------------------|------------------------------|
| 0         | CIM-DDR 输出                   | CIM4 输出1路至 DDR  （对应 video0）   | video0                         |
|           |                               | CIM5 输出1路至 DDR                   | video1                         |
|           |                               | CIM0 输出4路至 DDR（serdes 场景）     | video2~5                       |
|           |                               | CIM1 输出4路至 DDR（serdes 场景）     | video6~9                       |
|           |                               | CIM2 输出4路至 DDR（serdes 场景）     | video10~13                     |
|           |                               | CIM3 输出4路至 DDR（serdes 场景）     | video14~17                     |
| 1         | CIM-DDR-ISP-DDR               | CIM4-DDR-ISP0-DDR                   | video0                       |
|           |                               | CIM5-DDR-ISP1-DDR                   | video1                         |
| 2         | CIM-DDR-ISP-OTF-YNR-OTF-PYM 2路   | CIM4-DDR-ISP3-OTF-YNR3-OTF-PYM3-DDR          | video0      |
|           |                                   | CIM5-DDR-ISP3-OTF-YNR3-OTF-PYM3-DDR          | video1      |
| 3         | CIM-DDR-ISP-OTF-YNR-OTF-PYM 2路输出6通道       | CIM4-DDR-ISP3-OTF-YNR3-OTF-PYM3,PYM 输出6个通道             | video0~video5        |
|           |                                                | CIM5-DDR-ISP3-OTF-YNR3-OTF-PYM3,PYM 输出6个通道             | video6~video11       |
| 4         | CIM-DDR-ISP-DDR               | CIM4-DDR-ISP0-DDR                   | video0                       |
|           |                               | CIM5-DDR-ISP1-DDR                   | video1                         |
| 5         | CIM-DDR-ISP-OTF-YNR-OTF-PYM           | CIM4-DDR-ISP3-OTF-YNR3-OTF-PYM3-DDR              | video0                       |
| 6         | CIM4-OTF-ISP0-DDR-GDC 输出一个通道           | CIM4-OTF-ISP0-DDR-GDC 输出一个通道                | video0                       |
| 7         | DDR-PYM-DDR 回灌输出           | 回灌 PYM 输出6路至 DDR                 | video0 ~ 5                   |
|           |                               | 回灌 PYM 输出6路至 DDR                 | video6 ~ 11                  |
|           | DDR-GDC-DDR 回灌输出           | 回灌 GDC 输出至 DDR                    | video12                      |
|           |                               | 回灌 GDC 输出至 DDR                    | video13                      |
| 9         | CIM-DDR-ISP-OTF-YNR-OTF-PYM   | CIM4-DDR-ISP3-OTF-YNR3-OTF-PYM3                            | video0                           |
|           |                               | CIM5-DDR-ISP3-OTF-YNR3-OTF-PYM3                            | video1                           |
|           |                               | CIM0-DDR-ISP0-OTF-YNR0-OTF-PYM0 输出四路（serdes 场景）     | video2~5                         |
|           |                               | CIM1-DDR-ISP1-OTF-YNR1-OTF-PYM1 输出四路（serdes 场景）     | video6~9                         |
|           |                               | CIM2-DDR-ISP2-OTF-YNR2-OTF-PYM2 输出四路（serdes 场景）     | video10~13                       |
|           |                               | CIM3-DDR-ISP3-OTF-YNR3-OTF-PYM3 输出四路（serdes 场景）     | video14~17                       |

</DocScope>

（其他 link 场景暂不支持，持续更新中）

### v4l2 buffer 分配方式
目前有 ion 和 dma 两种 buffer 分配方式，默认使用 ion 分配

目前两种 buffer 分配方式支持的 io_mode
| buffer 分配方式 | 支持的 io_mode                 |
|----------------|-------------------------------|
|  ion           | mmap                          |
|  dma           | mmap dambuf userptr           |

buffer 分配方式切换流程
```c
#如果已加载vid_v4l2驱动，则卸载
rmmod vid_v4l2

#设置buffr 分配方式为ion 或 dma
echo ion > /sys/module/hobot_camsys_adapter/parameters/mops
或
echo dma > /sys/module/hobot_camsys_adapter/parameters/mops

#加载刚刚卸载的vid_v4l2驱动
modprobe vid_v4l2  xxx=xxxx
```

查看当前 buffer 分配方式
```c
cat /sys/module/hobot_camsys_adapter/parameters/mops
```

## camsys sample

### imx219 + MIPI + CIM + ISP + PYM：

```c
         // imx219 的sample配置
static mipi_config_t imx219_mipi_config = {
    .rx_enable = 1,
    .rx_attr = {
        .phy = 0,
        .lane = 2,
        .datatype = 0x12b,
        .fps = 30,
        .mclk = 24,
        .mipiclk = 1728,
        .width = 0,
        .height = 0,
        .linelenth = 0,
        .framelenth = 0,
        .settle = 0,
        .channel_num = 0,
        .channel_sel = {0},
    },

    .rx_ex_mask = 0x40,
    .rx_attr_ex = {
        .stop_check_instart = 1,
    },

    .end_flag = MIPI_CONFIG_END_FLAG,
};

static camera_config_t imx219_camera_config = {
        /* 0 */
        .name = "imx219",
        .addr = 0x10,
        .eeprom_addr = 0x51,
        .serial_addr = 0x40,
        .sensor_mode = 1,
        .fps = 30,
        .width = 1920,
        .height = 1080,
        .extra_mode = 0,
        .config_index = 0,
        .mipi_cfg = &imx219_mipi_config, // MIPI配置,NULL自动获取
        .end_flag = CAMERA_CONFIG_END_FLAG,
        .calib_lname = "disable",
};

static isp_cfg_t imx219_isp_config = {
    .isp_attr = {
        .channel = {
            .hw_id = 0,
            .slot_id = 4,
            .ctx_id = -1, //#define AUTO_ALLOC_ID -1
        },
        .work_mode = 0,
        .hdr_mode = 1,
        .size = {
            .width = 1920,
            .height = 1080,
        },
        .frame_rate = 30,
        .sched_mode = 1,
        .algo_state = 1,
        .isp_combine = {
            .isp_channel_mode = 0, //ISP_CHANNEL_MODE_NORMAL
            .bind_channel = {
                .bind_hw_id = 0,
                .bind_slot_id = 0,
            },
        },
        .clear_record = 0, //json和代码中未拿到，设置为0
        .isp_sw_ctrl = {
            .ae_stat_buf_en = 1,
            .awb_stat_buf_en = 1,
            .ae5bin_stat_buf_en = 1,
            .ctx_buf_en = 0,
            .pixel_consistency_en = 0,
        },
    },
    .ichn_attr = {
        .input_crop_cfg = {
            .enable = 0,
            .rect = {
                .x = 0,
                .y = 0,
                .width = 0,
                .height = 0,
            },
        },
        .in_buf_noclean = 1,
        .in_buf_noncached = 0,
    },
    .ochn_attr = {
        .output_crop_cfg = {
            .enable = 0,
            .rect = {
                .x = 0,
                .y = 0,
                .width = 0,
                .height = 0,
            },
        },
        .out_buf_noinvalid = 1,
        .out_buf_noncached = 0,
        .output_raw_level = 0, //ISP_OUTPUT_RAW_LEVEL_SENSOR_DATA
        .stream_output_mode = 0, //convert_isp_stream_output(1),
        .axi_output_mode = 9, //convert_isp_axi_output(0),
        .buf_num = 3,
    }
};

static vin_attr_t imx219_vin_attr = {
    .vin_node_attr = {
        .vcon_attr = {
            .bus_main = 2,
            .bus_second = 2,
        },

        .cim_attr = {
            .mipi_en = 1,
            .cim_isp_flyby = 0,
            .cim_pym_flyby = 0,
            .mipi_rx = 0,
            .vc_index = 0,
            .ipi_channels = 1,
            .y_uv_swap = 0, //(uint32_t)vpf_get_json_value(p_node_mipi, "y_uv_swap");
            .func = {
                .enable_frame_id = 1,
                .set_init_frame_id = 1,
                .enable_pattern = 0,
            },
            .rdma_input = {
                .rdma_en = 0,
                .stride = 0,
                .pack_mode = 1,
                .buff_num = 6,
            },
        },
    },

    .vin_ichn_attr = {
        .width =  1920,
        .height = 1080,
        .format = 43,
    },

    .vin_attr_ex = {
        .cim_static_attr = {
            .water_level_mark = 0,
        },
    },

    .vin_ochn_attr = {
        [VIN_MAIN_FRAME] = { //vin_ochn0_attr
            .ddr_en = 1,
            .vin_basic_attr = {
                .format = 43,
                .wstride = 0,
                .pack_mode = 1,
            },
            .pingpong_ring = 1,
            .roi_en = 0,
            .roi_attr = {
                .roi_x = 1280,
                .roi_y = 720,
                .roi_width = 64,
                .roi_height = 64,
            },
            .rawds_en = 0,
            .rawds_attr = {
                .rawds_mode = 0,
            },
        },
    },
    .vin_ochn_buff_attr = {
        [VIN_MAIN_FRAME] = { //vin_ochn0_buff_attr
            .buffers_num = 6,
        },
        [VIN_EMB] = { //vin_ochn3_buff_attr
            .buffers_num = 6,
        },
        [VIN_ROI] = { //vin_ochn4_buff_attr
            .buffers_num = 6,
        },
    },
    .magicNumber = MAGIC_NUMBER,
};

pym_cfg_t pym_common_config = {
        .hw_id = 1,
        .pym_mode = 3,
        .slot_id = 0,
        .pingpong_ring = 0,
        .output_buf_num = 6,
        .fb_buf_num = 2,
        .timeout = 0,
        .threshold_time = 0,
        .layer_num_trans_next = 0,
        .layer_num_share_prev = -1,
        .out_buf_noinvalid = 1,
        .out_buf_noncached = 0,
        .in_buf_noclean = 1,
        .in_buf_noncached = 0,
        .chn_ctrl = {
            .pixel_num_before_sol = DEF_PIX_NUM_BF_SOL,
            .invalid_head_lines = 0,
            .src_in_width = 1920,
            .src_in_height = 1080,
            .src_in_stride_y = 1920,
            .src_in_stride_uv = 1920,
            .suffix_hb_val = DEF_SUFFIX_HB,
            .prefix_hb_val = DEF_PREFIX_HB,
            .suffix_vb_val = DEF_SUFFIX_VB,
            .prefix_vb_val = DEF_PREFIX_VB,
            .ds_roi_en = 1,
            .bl_max_layer_en = DEF_BL_MAX_EN,
            .ds_roi_uv_bypass = 0,
            .ds_roi_sel = {
                [0] = 0,
            },
            .ds_roi_layer = {
                [0] = 0,
            },
            .ds_roi_info = {
                [0] = {
                    .start_left = 0,
                    .start_top = 0,
                    .region_width = 1920,
                    .region_height = 1080,
                    .wstride_uv = 1920,
                    .wstride_y = 1920,
                    .out_width = 1920,
                    .out_height = 1080,
                    .vstride = 1080, //.out_height,
                },
            },
        },
    .magicNumber = MAGIC_NUMBER,
};

         // imx219初始化
hbn_camera_create(camera_config, &cam_fd);

// cim 初始化
hbn_vnode_open(HB_VIN, hw_id, AUTO_ALLOC_ID, &vin_node_handle);
hbn_vnode_set_attr(vin_node_handle, vin_attr);
hbn_vnode_set_ichn_attr(vin_node_handle, 0, vin_ichn_attr);
hbn_vnode_set_ochn_attr(vin_node_handle, (uint32_t)VIN_MAIN_FRAME, vin_ochn_attr);
if (vin_ochn_attr->ddr_en) {
    memset(&alloc_attr, 0, sizeof(hbn_buf_alloc_attr_t));
    alloc_attr.buffers_num = vin_attr->vin_ochn_buff_attr[VIN_MAIN_FRAME].buffers_num;
    alloc_attr.is_contig = 1;
    alloc_attr.flags = (int64_t)((uint64_t)HB_MEM_USAGE_CPU_READ_OFTEN |         (uint64_t)HB_MEM_USAGE_CPU_WRITE_OFTEN | (uint64_t)HB_MEM_USAGE_CACHED);
    hbn_vnode_set_ochn_buf_attr(vin_node_handle, (uint32_t)VIN_MAIN_FRAME, &alloc_attr);
}

// isp 初始化
hbn_vnode_open(HB_ISP, hw_id, ctx_id, &isp_node_handle);
hbn_vnode_set_attr(isp_node_handle, &isp_config->isp_attr);
hbn_vnode_set_ichn_attr(isp_node_handle, 0, &isp_config->ichn_attr);
hbn_vnode_set_ochn_attr(isp_node_handled, 0, &isp_config->ochn_attr);

// pym 初始化
hbn_vnode_open(HB_PYM, pym_cfg->hw_id, AUTO_ALLOC_ID, &pym_node_handle);
hbn_vnode_set_attr(pym_node_handle, pym_cfg);
hbn_vnode_set_ichn_attr(pym_node_handle, 0, pym_cfg);
hbn_vnode_set_ochn_attr(pym_node_handle, 0, pym_cfg);
if (pym_cfg->output_buf_num > 0u) {
    memset(&alloc_attr, 0, sizeof(hbn_buf_alloc_attr_t));
    alloc_attr.buffers_num = pym_cfg->output_buf_num;
    alloc_attr.is_contig = 1;
    alloc_attr.flags = (int64_t)((uint64_t)HB_MEM_USAGE_CPU_READ_OFTEN | (uint64_t)HB_MEM_USAGE_CPU_WRITE_OFTEN);
    if (pym_cfg->out_buf_noncached == 0u) {
        alloc_attr.flags |= (uint64_t)HB_MEM_USAGE_CACHED;
    }
        ret = hbn_vnode_set_ochn_buf_attr(pym_node_handle, 0, &alloc_attr);
}

// vflow 初始化
hbn_vflow_create(&vflow_fd);
hbn_vflow_add_vnode(vflow_fd, vin_node_handle);
hbn_vflow_add_vnode(vflow_fd, isp_node_handle);
hbn_vflow_add_vnode(vflow_fd, pym_node_handle);
hbn_camera_attach_to_vin(cam_fd, vin_node_handle);
hbn_vflow_bind_vnode(vflow_fd, vin_node_handle, 0, isp_node_handle, 0);
hbn_vflow_bind_vnode(vflow_fd, isp_node_handle, 0, pym_node_handle, 0);
hbn_vflow_start(vflow_fd);

// 从pym获取图像并返还buffer
hbn_vnode_getframe_group(pym_node_handle, 0, VP_GET_FRAME_TIMEOUT, out_image_group);
fill_image_frame_from_vnode_image_group(frame, ochn_id);
memcpy(frame_buffer, frame.data[0], frame.data_size[0]); //frame_buffer 即为获取到的完成图像
if (frame.plane_count > 1)
    memcpy(frame_buffer + frame.data_size[0], frame.data[1], frame.data_size[1]);
hbn_vnode_releaseframe_group(pym_node_handle, 0, out_image_group);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
```

### 0820c + 96712解串 + MIPI + CIM + PYM:

```c
// 0820c 的sample 配置
static mipi_config_t ar0820std_mipi_config = {
    .rx_enable = 1,
    .rx_attr = {
        .phy = 0,
        .lane = 1,
        .datatype = 30,
        .fps = 30,
        .mclk = 24,
        .mipiclk = 810,
        .width = 3840,
        .height = 2160,
        .linelenth = 2149,
        .framelenth = 1125 * 2,
        .settle = 22,
        .channel_num = 1,
        .channel_sel = {0},
    },
};

static camera_config_t ar0820std_camera_config = {
        /* 0 */
        .name = "ar0820std",
        .addr = 0x10,
        .eeprom_addr = 0x51,
        .serial_addr = 0x40,
        .sensor_mode = 0x5,
        .fps = 30,
        .width = 3840,
        .height = 2160,
        .extra_mode = 5,
        .config_index = 512,
        .end_flag = CAMERA_CONFIG_END_FLAG,
        .calib_lname = "disable",
};

static poc_config_t g_poc_cfg[] = {
    {
        .addr = 0x28,
        .poc_map = 0x2013,
        .end_flag = POC_CONFIG_END_FLAG,
    },
};

static deserial_config_t ar0820std_deserial_config = {
    .name = "max96712",
    .addr = 0x29,
    .poc_cfg = &g_poc_cfg[0],
    .end_flag = DESERIAL_CONFIG_END_FLAG,
};

static vin_attr_t ar0820std_vin_attr = {
    .vin_node_attr = {
        .cim_attr = {
            .cim_isp_flyby = 0,
            .cim_pym_flyby = 0,
            .mipi_en = 1,
            .mipi_rx = 4,
            .vc_index = 0,
            .ipi_channels = 1,
            .y_uv_swap = 0, //(uint32_t)vpf_get_json_value(p_node_mipi, "y_uv_swap");
            .func = {
                .enable_frame_id = 1,
                .set_init_frame_id = 1,
                .enable_pattern = 0,
                .skip_frame = 0,
                .input_fps = 0,
                .output_fps = 0,
                .skip_nums = 0,
                .hw_extract_m = 0,
                .hw_extract_n = 0,
                .lpwm_trig_sel = (int32_t)LPWM_CHN_INVALID,
            },
            .rdma_input = {
                .rdma_en = 0,
                .stride = 0,
                .pack_mode = 1,
                .buff_num = 6,
            },
        },
    },

    .vin_ichn_attr = {
        .width =  3840,
        .height = 2160,
        .format = 30,
    },

    .vin_attr_ex = {
        .cim_static_attr = {
            .water_level_mark = 0,
        },
    },

    .vin_ochn_attr = {
        [VIN_MAIN_FRAME] = { //vin_ochn0_attr
            .ddr_en = 1,
            .vin_basic_attr = {
                .format = 30,
                .wstride = 0,
                .vstride = 0,
                .pack_mode = 1,
            },
            .pingpong_ring = 1,
            .roi_en = 0,
            .roi_attr = {
                .roi_x = 1280,
                .roi_y = 720,
                .roi_width = 64,
                .roi_height = 64,
            },
            .rawds_en = 0,
            .rawds_attr = {
                .rawds_mode = 0,
            },
        },
    },

    .vin_ochn_buff_attr = {
        [VIN_MAIN_FRAME] = { //vin_ochn0_buff_attr
            .buffers_num = 6,
        },
        [VIN_EMB] = { //vin_ochn3_buff_attr
            .buffers_num = 6,
        },
        [VIN_ROI] = { //vin_ochn4_buff_attr
            .buffers_num = 6,
        },
    },
    .magicNumber = MAGIC_NUMBER,
};

pym_cfg_t pym_common_config = {
        .hw_id = 1,
        .pym_mode = 3,
        .slot_id = 0,
        .pingpong_ring = 0,
        .output_buf_num = 6,
        .fb_buf_num = 2,
        .timeout = 0,
        .threshold_time = 0,
        .layer_num_trans_next = 0,
        .layer_num_share_prev = -1,
        .out_buf_noinvalid = 1,
        .out_buf_noncached = 0,
        .in_buf_noclean = 1,
        .in_buf_noncached = 0,
        .chn_ctrl = {
            .pixel_num_before_sol = DEF_PIX_NUM_BF_SOL,
            .invalid_head_lines = 0,
            .src_in_width = 1920,
            .src_in_height = 1080,
            .src_in_stride_y = 1920,
            .src_in_stride_uv = 1920,
            .suffix_hb_val = DEF_SUFFIX_HB,
            .prefix_hb_val = DEF_PREFIX_HB,
            .suffix_vb_val = DEF_SUFFIX_VB,
            .prefix_vb_val = DEF_PREFIX_VB,
            .ds_roi_en = 1,
            .bl_max_layer_en = DEF_BL_MAX_EN,
            .ds_roi_uv_bypass = 0,
            .ds_roi_sel = {
                [0] = 0,
            },
            .ds_roi_layer = {
                [0] = 0,
            },
            .ds_roi_info = {
                [0] = {
                    .start_left = 0,
                    .start_top = 0,
                    .region_width = 1920,
                    .region_height = 1080,
                    .wstride_uv = 1920,
                    .wstride_y = 1920,
                    .out_width = 1920,
                    .out_height = 1080,
                    .vstride = 1080, //.out_height,
                },
            },
        },
    .magicNumber = MAGIC_NUMBER,
};

 // 0820c初始化
hbn_camera_create(camera_config, &cam_fd);

// 96712 解串初始化
hbn_deserial_create(deserial_config, &des_fd);

// cim 初始化
hbn_vnode_open(HB_VIN, hw_id, AUTO_ALLOC_ID, &vin_node_handle);
hbn_vnode_set_attr(vin_node_handle, vin_attr);
hbn_vnode_set_ichn_attr(vin_node_handle, 0, vin_ichn_attr);
hbn_vnode_set_ochn_attr(vin_node_handle, (uint32_t)VIN_MAIN_FRAME, vin_ochn_attr);
if (vin_ochn_attr->ddr_en) {
    memset(&alloc_attr, 0, sizeof(hbn_buf_alloc_attr_t));
    alloc_attr.buffers_num = vin_attr->vin_ochn_buff_attr[VIN_MAIN_FRAME].buffers_num;
    alloc_attr.is_contig = 1;
    alloc_attr.flags = (int64_t)((uint64_t)HB_MEM_USAGE_CPU_READ_OFTEN |         (uint64_t)HB_MEM_USAGE_CPU_WRITE_OFTEN | (uint64_t)HB_MEM_USAGE_CACHED);
    hbn_vnode_set_ochn_buf_attr(vin_node_handle, (uint32_t)VIN_MAIN_FRAME, &alloc_attr);
}

// pym 初始化
hbn_vnode_open(HB_PYM, pym_cfg->hw_id, AUTO_ALLOC_ID, &pym_node_handle);
hbn_vnode_set_attr(pym_node_handle, pym_cfg);
hbn_vnode_set_ichn_attr(pym_node_handle, 0, pym_cfg);
hbn_vnode_set_ochn_attr(pym_node_handle, 0, pym_cfg);
if (pym_cfg->output_buf_num > 0u) {
    memset(&alloc_attr, 0, sizeof(hbn_buf_alloc_attr_t));
    alloc_attr.buffers_num = pym_cfg->output_buf_num;
    alloc_attr.is_contig = 1;
    alloc_attr.flags = (int64_t)((uint64_t)HB_MEM_USAGE_CPU_READ_OFTEN | (uint64_t)HB_MEM_USAGE_CPU_WRITE_OFTEN);
    if (pym_cfg->out_buf_noncached == 0u) {
        alloc_attr.flags |= (uint64_t)HB_MEM_USAGE_CACHED;
    }
        ret = hbn_vnode_set_ochn_buf_attr(pym_node_handle, 0, &alloc_attr);
}

// vflow 初始化
hbn_vflow_create(&vflow_fd);
hbn_vflow_add_vnode(vflow_fd, vin_node_handle);
hbn_vflow_add_vnode(vflow_fd, pym_node_handle);
hbn_camera_attach_to_deserial(cam_fd, des_fd, 0);
hbn_deserial_attach_to_vin(des_fd, 0, vin_node_handle);
hbn_vflow_bind_vnode(vflow_fd, vin_node_handle, 0, pym_node_handle, 0);
hbn_vflow_start(vp_vflow_contex->vflow_fd);

// 从pym获取图像并返还buffer
hbn_vnode_getframe_group(pym_node_handle, 0, VP_GET_FRAME_TIMEOUT, out_image_group);
fill_image_frame_from_vnode_image_group(frame, ochn_id);
memcpy(frame_buffer, frame.data[0], frame.data_size[0]); //frame_buffer 即为获取到的完成图像
if (frame.plane_count > 1)
    memcpy(frame_buffer + frame.data_size[0], frame.data[1], frame.data_size[1]);
hbn_vnode_releaseframe_group(pym_node_handle, 0, out_image_group);

```

### GDC STITCH 拼接 sample

当前 sample 采用回灌流程，即从系统存储中读取文件作为 GDC 的输入图像，调用 hbn
API，基于 GDC 配置 bin 文件完成 GDC 处理，再通过 stitch
API 和对应的拼接 LUT 表文件实现对 GDC 输出图像的拼接，得到鸟瞰图。

后视图原图及经过 gdc 处理后的输出：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch0.png" alt="GDC STITCH 拼接 sample示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
<br/>
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch1.png" alt="GDC STITCH 拼接 sample示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

前视图原图及经过 gdc 处理后的输出

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch2.png" alt="GDC STITCH 拼接 sample示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
<br/>
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch3.png" alt="GDC STITCH 拼接 sample示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

左视图原图及经过 gdc 处理后的输出

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch4.png" alt="GDC STITCH 拼接 sample示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
<br/>
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch5.png" alt="GDC STITCH 拼接 sample示意图" style={{ width: '40%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

右视图原图及经过 gdc 处理后的输出

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch6.png" alt="GDC STITCH 拼接 sample示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
<br/>
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch7.png" alt="GDC STITCH 拼接 sample示意图" style={{ width: '40%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

最终 stitch 拼接输出图像：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch8.png" alt="GDC STITCH 拼接 sample示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

对应 stitch 的 ROI 区域划分：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch9.png" alt="GDC STITCH 拼接 sample示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

  |ROI   |范围                    | SRC0     | 起点       | 大小        | SRC1     | 起点       | 大小        | 目标起点    | 模式           | 方向    |
  |----- |------------------------| ---------| -----------| ------------| ---------| -----------| ------------| ------------| ---------------| --------|
  |0     |左视图 frame2           | frame 2  | (10, 0)    | (390, 778)  |          |            |             | (0, 16)     | 3 直接拷贝     |         |
  |1     |右视图 frame3           | frame 3  | (10, 0)    | (390, 780)  |          |            |             | (506, 14)   | 3 直接拷贝     |         |
  |2     |后视图 frame0           | frame 0  | (0, 0)     | (896, 298)  |          |            |             | (0, 598)    | 3 直接拷贝     |         |
  |3     |前视图 frame1           | frame 1  | (4, 0)     | (892, 298)  |          |            |             | (0, 0)      | 3 直接拷贝     |         |
  |4     |左视图和前视图重合部分  | frame 2  | (10, 0)    | (390, 282)  | frame 1  | (2, 16)    | (390, 282)  | (0, 16)     | 1 alpha blend  | 0 左上  |
  |5     |右视图和前视图重合部分  | frame 3  | (10, 0)    | (388, 284)  | frame 1  | (508, 14)  | (388, 284)  | (506, 14)   | 1 alpha blend  | 3 右上  |
  |6     |左视图和后视图重合部分  | frame 2  | (10, 582)  | (390, 196)  | frame 0  | (0, 0)     | (390, 196)  | (0, 598)    | 1 alpha blend  | 2 左下  |
  |7     |右视图和右视图重合部分  | frame 3  | (10, 584)  | (390, 196)  | frame 0  | (506, 0)   | (390, 196)  | (506, 598)  | 1 alpha blend  | 1 右下  |


STITCH 配置参数：
```c
struct stitch_ch_attr inch_attr[4] = {
        {
                .width = 896,
                .height = 298,
                .strid = {896, 896},
                .rois = {
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 2, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 6, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 7, .roi_x = 506, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },

                }
        },
        {
                .width = 896,
                .height = 298,
                .strid = {896, 896},
                .rois = {
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 3, .roi_x = 4, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 4, .roi_x = 2, .roi_y = 16, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 5, .roi_x = 508, .roi_y = 14, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },

                }
        },
        {
                .width = 400,
                .height = 778,
                .strid = {400, 400},
                .rois = {
                        { .roi_index = 0, .roi_x = 10, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 4, .roi_x = 10, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 6, .roi_x = 10, .roi_y = 582, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0, .roi_y = 0, .roi_w = 0, .roi_h = 0  },

                }

        },
        {
                .width = 400,
                .height = 780,
                .strid = {400, 400},
                .rois = {
                        { .roi_index = 0, .roi_x = 0,  .roi_y = 0,   .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 1, .roi_x = 10, .roi_y = 0,   .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0,  .roi_y = 0,   .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0,  .roi_y = 0,   .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0,  .roi_y = 0,   .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 5, .roi_x = 10, .roi_y = 0,   .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0,  .roi_y = 0,   .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 7, .roi_x = 10, .roi_y = 584, .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0,  .roi_y = 0,   .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0,  .roi_y = 0,   .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0,  .roi_y = 0,   .roi_w = 0, .roi_h = 0  },
                        { .roi_index = 0, .roi_x = 0,  .roi_y = 0,   .roi_w = 0, .roi_h = 0  },

                }
        }
};

struct stitch_ch_attr och_attr = {
        .width = 896,
        .height = 896,
        .strid = {896, 896},
        .rois = {
                { .roi_index = 0, .roi_x =   0, .roi_y =  16, .roi_w = 390, .roi_h = 778  },
                { .roi_index = 1, .roi_x = 506, .roi_y =  14, .roi_w = 390, .roi_h = 780  },
                { .roi_index = 2, .roi_x =   0, .roi_y = 598, .roi_w = 896, .roi_h = 298  },
                { .roi_index = 3, .roi_x =   0, .roi_y =   0, .roi_w = 892, .roi_h = 298  },
                { .roi_index = 4, .roi_x =   0, .roi_y =  16, .roi_w = 390, .roi_h = 282  },
                { .roi_index = 5, .roi_x = 506, .roi_y =  14, .roi_w = 388, .roi_h = 284  },
                { .roi_index = 6, .roi_x =   0, .roi_y = 598, .roi_w = 390, .roi_h = 196  },
                { .roi_index = 7, .roi_x = 506, .roi_y = 598, .roi_w = 390, .roi_h = 196  },
                { .roi_index = 0, .roi_x =   0, .roi_y =   0, .roi_w =   0, .roi_h =   0  },
                { .roi_index = 0, .roi_x =   0, .roi_y =   0, .roi_w =   0, .roi_h =   0  },
                { .roi_index = 0, .roi_x =   0, .roi_y =   0, .roi_w =   0, .roi_h =   0  },
                { .roi_index = 0, .roi_x =   0, .roi_y =   0, .roi_w =   0, .roi_h =   0  },

        }
```


STITCH 初始化
```c
int32_t init_stitch(test_ctx_t *test_ctx)
{
        int32_t ret = 0, i;
        hbn_buf_alloc_attr_t alloc_attr = {0};
        char res_file_name[128] = {0};
        struct stat fileStat;

        ret = hbn_vnode_open(HB_STITCH, 0, -1, &test_ctx->sth_handle);
        if (ret < 0) {
                printf("STH vnode open fail\n");
                return -1;
        }

        memset(res_file_name, 0, sizeof(res_file_name));
        sprintf(res_file_name, "%s/%s", g_res_path, "alpha_lut_apa.bin");
        if(stat(res_file_name, &fileStat) != 0) {
                printf("Failed to get file stats. cfg file = %s\n", res_file_name);
                return -1;
        }

        ret = hb_mem_alloc_com_buf(fileStat.st_size, HB_MEM_USAGE_MAP_INITIALIZED |
                                                        HB_MEM_USAGE_PRIV_HEAP_2_RESERVERD | HB_MEM_USAGE_CPU_READ_OFTEN |
                                                        HB_MEM_USAGE_CPU_WRITE_OFTEN | HB_MEM_USAGE_CACHED, &alpha_buffer);
        if (ret < 0) {
                printf("hb_mem_alloc_com_buf alpha_lut faild, ret = %d\n", ret);
                return -1;
        }

        load_file_2_buff(res_file_name, (char *)alpha_buffer.virt_addr, fileStat.st_size);
        hb_mem_flush_buf_with_vaddr((uint64_t)alpha_buffer.virt_addr, fileStat.st_size);

        base_attr.alpha_lut.share_id = alpha_buffer.share_id;
        base_attr.alpha_lut.vaddr = (uint64_t)alpha_buffer.virt_addr;
        base_attr.alpha_lut.size = fileStat.st_size;

        ret = hbn_vnode_set_attr(test_ctx->sth_handle, &base_attr);
        if (ret < 0) {
                printf("STH vnode set attr fail\n");
                return -1;
        }

        for (i = 0; i < SENSOR_NUMS; i++) {
                ret = hbn_vnode_set_ichn_attr(test_ctx->sth_handle, i, &inch_attr[i]);
                if (ret < 0) {
                        printf("STH vnode set ichn attr fail\n");
                        return -1;
                }
        }

        ret = hbn_vnode_set_ochn_attr(test_ctx->sth_handle, 0, &och_attr);
        if (ret < 0) {
                printf("STH vnode set ochn attr fail\n");
                return -1;
        }

        memset(&alloc_attr, 0, sizeof(hbn_buf_alloc_attr_t));
        alloc_attr.buffers_num = 3;
        alloc_attr.is_contig = 1;
        alloc_attr.flags = (int64_t)((uint64_t)HB_MEM_USAGE_CPU_READ_OFTEN |
                        (uint64_t)HB_MEM_USAGE_CPU_WRITE_OFTEN | (uint64_t)HB_MEM_USAGE_MAP_INITIALIZED);
        alloc_attr.flags |= (uint64_t)HB_MEM_USAGE_CACHED;

        ret = hbn_vnode_set_ochn_buf_attr(test_ctx->sth_handle, 0, &alloc_attr);
        if (ret < 0) {
                printf("STH vnode set ochn buf attr fail\n");
                return -1;
        }

        ret = hbn_vnode_start(test_ctx->sth_handle);
        if (ret < 0) {
                printf("STH vnode start fail\n");
                return -1;
        }

        return 0;
}
```

### 2v imx219 + MIPI + CIM + ISP + PYM + STITCH 拼接后编码 sample

当前 sample 从两路 imx219 sensor CIM ISP PYM 等模块组成的 pipeline 中获取两路图像，再将两路图像经过 STITCH CODEC 模块上下拼接成一个 h264文件 cim-isp-pym-stitch.h264

测试步骤:

安装两路 imx219 sensor 后开机, 执行以下命令

sunrise@ubuntu:~$ cd /app/multimedia_demo/camsys_demo/sample_2v_219_stitch_codec/
sunrise@ubuntu:/app/multimedia_demo/camsys_demo/sample_2v_219_stitch_codec$ make
sunrise@ubuntu:/app/multimedia_demo/camsys_demo/sample_2v_219_stitch_codec$ ./sample_2v_219_stitch_codec

生成的 cim-isp-pym-stitch.h264 文件播放如下

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sth_codec_2025-06-24_20-37-19.png" alt="2v imx219 + MIPI + CIM + ISP + PYM + ...示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />


STITCH 配置参数：
```c
struct stitch_base_attr sth_base_attr = {
		  .mode = 2,
		  .roi_nums = 2,
		  .img_nums = 2,
		  .alpha_lut = {
			.share_id = 0,
			.vaddr = 0,
			.offset = 0,
			.size = 0
		  },
		  .beta_lut = {
			.share_id = 0,
			.vaddr = 0,
			.offset = 0,
			.size = 0
		  },
		  .blending = { {
			  .roi_index = 0,
			  .blending_mode = 3,
			  .direct = 0,
			  .uv_en = 1,
			  .src0_index = 0,
			  .src1_index = 1,
			  .margin = 0,
			  .margin_inv = 128,
			  .gain_src0_yuv = {256, 256, 256},
			  .gain_src1_yuv = {256, 256, 256}
			}, {
			  .roi_index = 1,
			  .blending_mode = 3,
			  .direct = 0,
			  .uv_en = 1,
			  .src0_index = 1,
			  .src1_index = 0,
			  .margin = 0,
			  .margin_inv = 128,
			  .gain_src0_yuv = {256, 256, 256},
			  .gain_src1_yuv = {256, 256, 256}
			}, {
			  .roi_index = 0,
			  .blending_mode = 0,
			  .direct = 0,
			  .uv_en = 0,
			  .src0_index = 0,
			  .src1_index = 0,
			  .margin = 0,
			  .margin_inv = 0,
			  .gain_src0_yuv = {0, 0, 0},
			  .gain_src1_yuv = {0, 0, 0}
			}, {
			  .roi_index = 0,
			  .blending_mode = 0,
			  .direct = 0,
			  .uv_en = 0,
			  .src0_index = 0,
			  .src1_index = 0,
			  .margin = 0,
			  .margin_inv = 0,
			  .gain_src0_yuv = {0, 0, 0},
			  .gain_src1_yuv = {0, 0, 0}
			}, {
			  .roi_index = 0,
			  .blending_mode = 0,
			  .direct = 0,
			  .uv_en = 0,
			  .src0_index = 0,
			  .src1_index = 0,
			  .margin = 0,
			  .margin_inv = 0,
			  .gain_src0_yuv = {0, 0, 0},
			  .gain_src1_yuv = {0, 0, 0}
			}, {
			  .roi_index = 0,
			  .blending_mode = 0,
			  .direct = 0,
			  .uv_en = 0,
			  .src0_index = 0,
			  .src1_index = 0,
			  .margin = 0,
			  .margin_inv = 0,
			  .gain_src0_yuv = {0, 0, 0},
			  .gain_src1_yuv = {0, 0, 0}
			}, {
			  .roi_index = 0,
			  .blending_mode = 0,
			  .direct = 0,
			  .uv_en = 0,
			  .src0_index = 0,
			  .src1_index = 0,
			  .margin = 0,
			  .margin_inv = 0,
			  .gain_src0_yuv = {0, 0, 0},
			  .gain_src1_yuv = {0, 0, 0}
			}, {
			  .roi_index = 0,
			  .blending_mode = 0,
			  .direct = 0,
			  .uv_en = 0,
			  .src0_index = 0,
			  .src1_index = 0,
			  .margin = 0,
			  .margin_inv = 0,
			  .gain_src0_yuv = {0, 0, 0},
			  .gain_src1_yuv = {0, 0, 0}
			}, {
			  .roi_index = 0,
			  .blending_mode = 0,
			  .direct = 0,
			  .uv_en = 0,
			  .src0_index = 0,
			  .src1_index = 0,
			  .margin = 0,
			  .margin_inv = 0,
			  .gain_src0_yuv = {0, 0, 0},
			  .gain_src1_yuv = {0, 0, 0}
			}, {
			  .roi_index = 0,
			  .blending_mode = 0,
			  .direct = 0,
			  .uv_en = 0,
			  .src0_index = 0,
			  .src1_index = 0,
			  .margin = 0,
			  .margin_inv = 0,
			  .gain_src0_yuv = {0, 0, 0},
			  .gain_src1_yuv = {0, 0, 0}
			}, {
			  .roi_index = 0,
			  .blending_mode = 0,
			  .direct = 0,
			  .uv_en = 0,
			  .src0_index = 0,
			  .src1_index = 0,
			  .margin = 0,
			  .margin_inv = 0,
			  .gain_src0_yuv = {0, 0, 0},
			  .gain_src1_yuv = {0, 0, 0}
			}, {
			  .roi_index = 0,
			  .blending_mode = 0,
			  .direct = 0,
			  .uv_en = 0,
			  .src0_index = 0,
			  .src1_index = 0,
			  .margin = 0,
			  .margin_inv = 0,
			  .gain_src0_yuv = {0, 0, 0},
			  .gain_src1_yuv = {0, 0, 0}
			} }
};

struct stitch_ch_attr sth_inch_attr[] = {
           {
			.width = 1920,
			.height = 1080,
			.strid = {1920, 1920},
			.rois = { {
				.roi_index = 0,
				.roi_x = 0,
				.roi_y = 0,
				.roi_w = 1920,
				.roi_h = 1080
			  }, {
				.roi_index = 1,
				.roi_x = 0,
				.roi_y = 0,
				.roi_w = 1920,
				.roi_h = 1080
			  },
			}
		  }, {
			.width = 1920,
			.height = 1080,
			.strid = {1920, 1920},
			.rois = { {
				.roi_index = 0,
				.roi_x = 0,
				.roi_y = 0,
				.roi_w = 1920,
				.roi_h = 1080
			  }, {
				.roi_index = 1,
				.roi_x = 0,
				.roi_y = 0,
				.roi_w = 1920,
				.roi_h = 1080
			  },
			}
		  }, {
			.width = 0,
			.height = 0,
			.strid = {0, 0},
		  }, {
			.width = 0,
			.height = 0,
			.strid = {0, 0},
		  }
};

struct stitch_ch_attr sth_och_attr = {
		  .width = 1920,
		  .height = 2160,
		  .strid = {1920, 1920},
		  .rois = { {
			  .roi_index = 0,
			  .roi_x = 0,
			  .roi_y = 0,
			  .roi_w = 1920,
			  .roi_h = 1080
			}, {
			  .roi_index = 1,
			  .roi_x = 0,
			  .roi_y = 1080,
			  .roi_w = 1920,
			  .roi_h = 1080
			},
		  }
};
```

创建一路 vflow:
```c
	int i = 0;
	ret = hbn_vflow_create(&vflow_fd[i]);
	if (ret < 0) {
		printf("hbn_vflow_create[%d]:%d error\n", i, __LINE__);
		goto err;
	}

	ret = hbn_camera_create(&cam_cfg[i], &cam_vnode_fd[i]);
	if (ret < 0) {
		printf("hbn_camera_create[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	vin_vnode_fd[i] = vin_vnode_create(&vin_attr[i]);
	if (vin_vnode_fd[i] < 0) {
		ret = (int32_t)vin_vnode_fd[i];
		printf("vin_vnode_init[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_add_vnode(vflow_fd[i], vin_vnode_fd[i]);
	if (ret < 0) {
		printf("hbn_vflow_add_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	isp_vnode_fd[i] = isp_vnode_create(&isp_cfg[i]);
	if (isp_vnode_fd[i] < 0) {
		ret = (int32_t)isp_vnode_fd[i];
		printf("isp_vnode_init[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_add_vnode(vflow_fd[i], isp_vnode_fd[i]);
	if (ret < 0) {
		printf("hbn_vflow_add_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ynr_vnode_fd[i] = ynr_vnode_create(&ynr_info[i]);
	if (ynr_vnode_fd[i] < 0) {
		ret = (int32_t)ynr_vnode_fd[i];
		printf("ynr_vnode_init[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_add_vnode(vflow_fd[i], ynr_vnode_fd[i]);
	if (ret < 0) {
		printf("hbn_vflow_add_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	pym_vnode_fd[i] = pym_vnode_create(&pym_cfg[i]);
	if (pym_vnode_fd[i] < 0) {
		ret = (int32_t)pym_vnode_fd[i];
		printf("pym_vnode_init[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_add_vnode(vflow_fd[i], pym_vnode_fd[i]);
	if (ret < 0) {
		printf("hbn_vflow_add_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	sth_vnode_fd = sth_vnode_create();
	if (sth_vnode_fd < 0) {
		ret = (int32_t)sth_vnode_fd;
		printf("sth_vnode_init[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_add_vnode(vflow_fd[i], sth_vnode_fd);
	if (ret < 0) {
		printf("hbn_vflow_add_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_camera_attach_to_vin(cam_vnode_fd[i], vin_vnode_fd[i]);
	if (ret < 0) {
		printf("hbn_vflow_bind_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_bind_vnode(vflow_fd[i], vin_vnode_fd[i], 0, isp_vnode_fd[i], 0);
	if (ret < 0) {
		printf("hbn_vflow_bind_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_bind_vnode(vflow_fd[i], isp_vnode_fd[i], 1, ynr_vnode_fd[i], 0);
	if (ret < 0) {
		printf("hbn_vflow_bind_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_bind_vnode(vflow_fd[i], ynr_vnode_fd[i], 1, pym_vnode_fd[i], 0);
	if (ret < 0) {
		printf("hbn_vflow_bind_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_bind_vnode(vflow_fd[i], pym_vnode_fd[i], 0, sth_vnode_fd, 0);
	if (ret < 0) {
		printf("hbn_vflow_bind_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}
```

创建另一路 vflow，并且两路 vflow 绑定在同一 stitch 上:
```c
	i = 1;
	ret = hbn_vflow_create(&vflow_fd[i]);
	if (ret < 0) {
		printf("hbn_vflow_create[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_camera_create(&cam_cfg[i], &cam_vnode_fd[i]);
	if (ret < 0) {
		printf("hbn_camera_create[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	vin_vnode_fd[i] = vin_vnode_create(&vin_attr[i]);
	if (vin_vnode_fd[i] < 0) {
		ret = (int32_t)vin_vnode_fd[i];
		printf("vin_vnode_init[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_add_vnode(vflow_fd[i], vin_vnode_fd[i]);
	if (ret < 0) {
		printf("hbn_vflow_add_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	isp_vnode_fd[i] = isp_vnode_create(&isp_cfg[i]);
	if (isp_vnode_fd[i] < 0) {
		ret = (int32_t)isp_vnode_fd[i];
		printf("isp_vnode_init[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_add_vnode(vflow_fd[i], isp_vnode_fd[i]);
	if (ret < 0) {
		printf("hbn_vflow_add_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ynr_vnode_fd[i] = ynr_vnode_create(&ynr_info[i]);
	if (ynr_vnode_fd[i] < 0) {
		ret = (int32_t)ynr_vnode_fd[i];
		printf("ynr_vnode_init[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_add_vnode(vflow_fd[i], ynr_vnode_fd[i]);
	if (ret < 0) {
		printf("hbn_vflow_add_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}
	pym_vnode_fd[i] = pym_vnode_create(&pym_cfg[i]);;
	if (pym_vnode_fd[i] < 0) {
		ret = (int32_t)pym_vnode_fd[i];
		printf("pym_vnode_init[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_add_vnode(vflow_fd[i], pym_vnode_fd[i]);
	if (ret < 0) {
		printf("bn_vflow_add_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_add_vnode(vflow_fd[i], sth_vnode_fd);
	if (ret < 0) {
		printf("hbn_vflow_add_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_camera_attach_to_vin(cam_vnode_fd[i], vin_vnode_fd[i]);
	if (ret < 0) {
		printf("hbn_camera_attach_to_vin[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_bind_vnode(vflow_fd[i], vin_vnode_fd[i], 0, isp_vnode_fd[i], 0);
	if (ret < 0) {
		printf("hbn_vflow_bind_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_bind_vnode(vflow_fd[i], isp_vnode_fd[i], 1, ynr_vnode_fd[i], 0);
	if (ret < 0) {
		printf("hbn_vflow_bind_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_bind_vnode(vflow_fd[i], ynr_vnode_fd[i], 1, pym_vnode_fd[i], 0);
	if (ret < 0) {
		printf("hbn_vflow_bind_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}

	ret = hbn_vflow_bind_vnode(vflow_fd[i], pym_vnode_fd[i], 0, sth_vnode_fd, 1);
	if (ret < 0) {
		printf("hbn_vflow_bind_vnode[%d]:%d error\n", i, __LINE__);
		goto err1;
	}
```

配置 CODEC 编码模块:
```c
	//config codec
	ret = codec_config_param(&context, MEDIA_CODEC_ID_H264, sth_och_attr.width, sth_och_attr.height);
	if (ret < 0) {
		printf("codec_config_param error!!!\n");
		goto err1;
	}

	ret = codec_init(&context);
	if (ret < 0) {
		printf("codec_init error!!!\n");
		goto err1;
	}

	ret = codec_start(&context);
	if (ret < 0) {
		printf("codec_init error!!!\n");
		goto err2;
	}

	h264fd = fopen(H264_FNAME, "w+");
    if (h264fd == NULL) {
        printf("open(%s) fail", H264_FNAME);
		ret = -1;
        goto err3;
    }

	ret = hbn_vflow_start(vflow_fd[0]);
	ret |= hbn_vflow_start(vflow_fd[1]);
	if (ret < 0) {
		printf("codec_init error!!!\n");
		goto err3;
	}
```

循环取图并发送个 CODEC 编码，再从 CODEC 中取图保存为 h264文件
```c
	while (imgframe.cnt < 30 * TIMEOUT) {
		ret = hbn_vnode_getframe(sth_vnode_fd, 0, 1000, &imgframe.vnode_buffer);
		printf("sth_worker, ret = %d\n", ret);
		if (ret == 0) {
			ret = codec_set_input(&context, &imgframe);
			if (ret < 0) {
				printf("codec_set_input error!!!\n");
				goto err4;
			}

			ret = codec_get_output(&context, &imgframe);
			if (ret < 0) {
				printf("codec_get_output error!!!\n");
				goto err4;
			}

            ret = write_output_h264(&imgframe, h264fd);
			if (ret < 0) {
				printf("write_output_h264 error!!!\n");
				goto err4;
			}

			ret = codec_release_output(&context, &imgframe);
			if (ret < 0) {
				printf("codec_release_output error!!!\n");
				goto err4;
			}

			hbn_vnode_releaseframe(sth_vnode_fd, 0, &imgframe.vnode_buffer);
		} else {
			printf("hbn_vnode_getframe fail, ret = %d\n", ret);
			goto err4;
		}

		imgframe.cnt++;
	}
```

## V4L2 Sample

### imx219 + MIPI + CIM + ISP + PYM：
```c
v4l2-ctl -d 0 --set-fmt-video=width=1920,height=1080,pixelformat=NV12 --stream-mmap --stream-count=120 --stream-to=/userdata/test.yuv
```

### imx219 + MIPI + CIM + ISP + GDC：
```c
v4l2 gdc 应用目前无法使用json文件生成config bin文件，所以目前v4l2 gdc 测试只用已生成好的config bin来进行测试
与原v4l2 取流代码相比，v4l2 gdc 取流代码需增加以下配置

#需增加gdc 输入图像宽高的参数配置
if (TestContext[i].gdc_cfg) {
    TestContext[i].pic_width = 1920;
    TestContext[i].pic_height = 1080;
    TestContext[i].in_pic_width = 1920;  //新增的输入图像宽度
    TestContext[i].in_pic_height = 1080; //新增的输入图像高度
}

#需增加gdc config的配置
// 为gdc config bin申请内存
int map_gdc_config_buffer(hb_mem_common_buf_t *hb_common_buf, uint32_t size)
{
    int64_t alloc_flags = 0;
    int ret;

    alloc_flags = HB_MEM_USAGE_PRIV_HEAP_2_RESERVED | HB_MEM_USAGE_CPU_READ_OFTEN | HB_MEM_USAGE_CPU_WRITE_OFTEN | HB_MEM_USAGE_CACHED;
    memset(hb_common_buf, 0, sizeof(hb_mem_common_buf_t));
    ret = hb_mem_alloc_com_buf(size, alloc_flags, hb_common_buf);
    if (ret < 0) {
        vio_gtest_err("hb_mem_alloc_com_buf size %u failed \n", size);
        return ret;
    }

    return 0;
}

// 向gdc v4l2 驱动下发配置的ioctl接口
int v4l2_set_ext_ctrl(int fd, uint32_t cmd, void *arg)
{
    int rc;
    struct v4l2_ext_controls ext_ctrl = {0};
    struct v4l2_ext_control ctrl = {0};

    ext_ctrl.controls = &ctrl;
    ext_ctrl.controls->id = cmd;
    ext_ctrl.controls->ptr = arg;
    ext_ctrl.count = 1;

    rc = ioctl(fd, VIDIOC_S_EXT_CTRLS, &ext_ctrl);
    if (rc < 0)
        vio_gtest_err("%s, cmd=%d, rc=%d\n", strerror(errno), cmd, rc);
    return rc;
}

int v4l2_gdc_init(vpm_test_context *ptc)
{
    int fd, ret;
    FILE *file = NULL;
    struct stat fileStat;
    hb_mem_common_buf_t hb_common_buf;
    gdc_config_t gdc_user_cfg;
    work_info_t *winfo = &ptc->work_info;

    if (!ptc->gdc_cfg || !winfo->priv_fd)
        return -1;

    file = fopen(ptc->gdc_cfg, "r");
    if (file == NULL) {
        perror("Error opening file\n");
        return -1;
    }
    //获取gdc config bin 大小
    ret = fstat(fileno(file), &fileStat);
    if (ret) {
        perror("Error getting file status");
        goto err;
    }

    vio_gtest_info("File size: %ld bytes\n", fileStat.st_size);
    // 申请存放gdc config bin的内存
    ret = map_gdc_config_buffer(&hb_common_buf, fileStat.st_size);
    if (ret)
        goto err;
    //将gdc config bin内容复制到刚刚申请的内存中
    if (fread(hb_common_buf.virt_addr, 1, fileStat.st_size, file) != fileStat.st_size) {
        vio_gtest_err("failed to read gdc config file!\n");
        ret = -1;
        goto err;
    }
    vio_gtest_info("gdc config bin buffer phy_addr:%p virt_addr:%p size:%d\n",
        hb_common_buf.phys_addr, hb_common_buf.virt_addr, hb_common_buf.size);

    ret = hb_mem_flush_buf_with_vaddr((uint64_t)hb_common_buf.virt_addr, fileStat.st_size);
    if (ret) {
        vio_gtest_err("failed to hb_mem_flush_buf_with_vaddr!\n");
        goto err;
    }

    gpm[winfo->pipe_id].gdc_config.config_addr = (uint64_t)hb_common_buf.virt_addr;
    gpm[winfo->pipe_id].gdc_config.config_size = hb_common_buf.size;
    //gdc 输入图像宽高
    gpm[winfo->pipe_id].gdc_config.output_width = ptc->pic_width;
    gpm[winfo->pipe_id].gdc_config.output_height = ptc->pic_height;
    gpm[winfo->pipe_id].gdc_config.output_stride = ALIGN_UP(ptc->pic_width, STRIDE_ALIGN);
    //gdc 输出图像宽高
    gpm[winfo->pipe_id].gdc_config.input_width = ptc->in_pic_width;
    gpm[winfo->pipe_id].gdc_config.input_height = ptc->in_pic_height;
    gpm[winfo->pipe_id].gdc_config.input_stride = ALIGN_UP(ptc->in_pic_width, STRIDE_ALIGN);

    gpm[winfo->pipe_id].gdc_config.div_width = 0;
    gpm[winfo->pipe_id].gdc_config.div_height = 0;
    gpm[winfo->pipe_id].gdc_config.sequential_mode = 0;
    gpm[winfo->pipe_id].gdc_config.total_planes = 2;

    gpm[winfo->pipe_id].binary_ion_id = hb_common_buf.share_id;
    gpm[winfo->pipe_id].binary_offset = hb_common_buf.offset;

    gpm[winfo->pipe_id].magicNumber = 0x12345678;

    // 将配置下发到gdc v4l2 驱动中
    ret = v4l2_set_ext_ctrl(winfo->priv_fd, V4L2_CID_DR_GDC_ATTR, &gpm[winfo->pipe_id]);
    if (ret) {
        vio_gtest_err("v4l2_set_ext_ctrl error!!!\n");
        goto err;
    }

err:
    fclose(file);
    return ret;

}

#释放gdc config bin
void v4l2_gdc_deinit (vpm_test_context *ptc)
{
    work_info_t *winfo = &ptc->work_info;
    hb_mem_free_buf_with_vaddr((uint64_t)gpm[winfo->pipe_id].gdc_config.config_addr);
}


```
