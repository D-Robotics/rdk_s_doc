---
sidebar_position: 1
toc_max_heading_level: 4
---

# Camsys 子系统

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


S100:
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/b266496271990c1606e5f68485cf3e9d.png" alt="" style={{ width: '100%' }} />
S600:
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/s600-camsys.PNG" alt="" style={{ width: '100%' }} />

### 子模块

#### MIPI
MIPI（Mobile Industry Processor Interface）移动行业处理器接口，是 MIPI 联盟发起的为移动应用处理器制定的开放标准。
- S100/600 MIPI CSI RX 支持 C/DPHY，DPHY 速率4.5Gbps x 4lane = 18Gbps，CPHY 速率3.5Gsps x 3trios =24Gbps；
- S100上有3个 MIPI RX，分别为 RX0，RX1，RX4；
- S600上有6个 MIPI RX，分别为 RX0~RX5；

#### CIM

CIM（Camera Interface Manager）是一种专门用来接收 MIPI-RX IPI 图像数据的硬件。CIM 负责同时接入多路图像数据，并改变 MIPI IPI 接口的时序以匹配后级硬件或 DDR 的输入时序要求，将图像通过硬件直连或 DDR 形式提供给 ISP 和 PYM。

- S100上共有3个 CIM 模块，分别为 CIM0 CIM1 CIM4；
- S600上共有6个 CIM 模块，分别为 CIM0~CIM5；
- 单个 CIM 最大支持接入4V * 8M * 30fps，支持接入 RAW8、RAW10、RAW12、RAW14、RAW16、RAW20、YUV422~8Bit 图像；
- S100 CIM 可 online 输出到 ISP0/ISP1(RAW)与 PYM0/PYM1(YUV)，也可 offline 下 DDR。
- S600 CIM 可 online 输出到 ISP0/ISP1/ISP2/ISP3(RAW)与 PYM0/PYM1/PYM2/PYM3(YUV)，也可 offline 下 DDR。
- S100 CIM0的 IPI0最大接入宽为5696，CIM0其他的 IPI 和其他 CIM 中的 IPI 最大接入宽为4096；
- S600 CIM0~2最大接入宽为5696，其他 CIM 接入最大宽为4096

#### ISP

ISP (Image Signal Processor)图像信号处理器，是一种专门用于图像信号处理的引擎。 ISP 的功能包括对原始图像进行各类算法处理、图像特性统计、色彩空间转换、多路通道分时复用控制等，最终输出更清晰、更准确、高质量的图像。

- S100上共有2个 ISP 模块，分别为 ISP0 ISP1；
- S600上共有4个 ISP 模块，分别为 ISP0~ISP3
- 每个 ISP 硬件模块 IP 最大支持12路 sensor 的接入能力；
- S100 ISP 处理最大分辨率为4096 * 2160;
- S600 ISP 处理最大分辨率为5696 * 3328
ISP 处理 pipeline 如下图：
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/isp_pipeline.png" alt="" style={{ width: '100%' }} />
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

- S100上共有一个 YNR 模块，YNR1，只支持 ISP1-online-YNR1-online-PYM1场景；
- S100在2DNR 或3DNR 模式下，处理的最大宽高为2048*2048；
- S600上共用四个 YNR 模块，YNR0~3，只支持 isp-online-ynr-online-pym 场景，其中 YNR0~2只支持2DNR，YNR3支持2DNR&3DNR；
- S600 YNR0~2支持处理最大宽高为5696，YNR3处理最大宽高为4096；

#### PYM

PYM（Pyramid）作为一个硬件加速模块，对输入的图像按照金字塔图层的方式处理，并输出到 DDR。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image.png" alt="alt text" style={{ width: '100%' }} />

- S100上共有3个 PYM 模块，分别为 PYM0 PYM1 PYM4；
- S600上共有5个 PYM 模块，分别为 PYM0~4；
- SRC 层：代表源图像层；
- BL 层：代表双线性下采样层，BL Base 0~4依次是源图层的1/2，1/4，1/8，1/16，1/32；
- DS 层：输出层，每层能够任意选择输入图层（SRC 或0~4BL），并进行下采样和 ROI 处理后输出到 DDR；
- 缩小 ratio(1/2，1]，不支持放大；
- S100每个最大输入宽度输入高度均为4096，S600最大输入宽高均为5696，最小输入宽度及高度为32；
- S100 PYM0/1：4k@120fps，PYM4:4K@90fps，S600 PYM0~4 4K@120fps，PYM4不支持 online 输入；)

#### GDC

GDC 作为一个硬件模块，可将输入的图像进行视角变换、畸变校正和指定角度（0,90,180,270）旋转。

模式支持的输入图像典型尺寸为3840x2160，2688x1944，1920x1080，1280x720，640x480，480x320。

硬件特性如下：
- 最大分辨率：3840x2160
- 最小分辨率：96x96（奇数行或者列不支持）
- 性能：3840x2160，60fps，S100有一个 GDC 模块，S600上有两个
- 工作模式：ddr-gdc-ddr
- 输入格式：YUV420 semi-planar
- 输出格式：YUV420 semi-planar
- S100上有1个 GDC 模块，S600上有两个

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
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-1.png" alt="alt text" style={{ width: '100%' }} />

* Tile

    垂直方向 （-720, +720）通过给定的像素数，偏移变换网格。如下所示：
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-2.png" alt="alt text" style={{ width: '100%' }} />

* Zoom

    按提供的因子 （0, +∞）缩放变换输出，（0, 1）表示值大于 0 且小于 1。如下所示：
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-3.png" alt="alt text" style={{ width: '100%' }} />

1. Affine
   * 功能描述

        提供线性的变换

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-4.png" alt="alt text" style={{ width: '100%' }} />

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

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-6.png" alt="alt text" style={{ width: '100%' }} />

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
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-7.png" alt="alt text" style={{ width: '100%' }} />

        strength y 调试效果，在 Y 轴的转换强度，取值（0, +∞）。如下所示：
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-8.png" alt="alt text" style={{ width: '100%' }} />

        Rotation 调试效果，取值（-180, 180）。如下所示：
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-9.png" alt="alt text" style={{ width: '100%' }} />

        :::info 注意！

        输入输出尺寸的宽应保持16字节对齐。

        :::

3. Equisold(cylinder)
   * 功能描述

        此转换提供等实体（全景 panoramic）校正，并将结果显示为平面上的投影。

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-10.png" alt="alt text" style={{ width: '100%' }} />

   * 成员说明
        | 成员 | 含义                                   |
        |-----------------------------|-----------------|
        | int32_t pan                 | default 0, 不修改 |
        | int32_t tilt                | default 0, 不修改 |
        | zoom                        | 按提供的因子缩放转换输出 |
        | strength         | 转换的强度  |
        | double angle(rotation)      | 图像旋转的角度 0/90/180/270 |

        strength 调试效果，转换的强度（0，+∞）。如下所示：

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-11.png" alt="alt text" style={{ width: '100%' }} />

        rotation 调试效果，取值范围（-180,+180）。如下所示

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-12.png" alt="alt text" style={{ width: '100%' }} />


        :::info 注意！

        输入输出尺寸的宽应保持16字节对齐。

        :::

4. Equidistant
   * 功能描述

       等距变换包含许多参数，这些参数允许它为投影提供一系列不同的目标平面。这使用户可以更自由地选择要变换的鱼眼帧的所需区域。

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-13.png" alt="alt text" style={{ width: '100%' }} />

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

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-14.png" alt="alt text" style={{ width: '100%' }} />

       azimuth 调试效果：

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-15.png" alt="alt text" style={{ width: '100%' }} />

       rotation 调试效果：

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-16.png" alt="alt text" style={{ width: '100%' }} />

       cylindricity x 调试效果：

       描述目标投影沿 X 轴的球形程度。该值的范围为0到1，其中1为球形。如果该值设置为1，圆柱度 Y 值设置为0，则投影将沿 X 轴形成圆柱。如下所示：

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-17.png" alt="alt text" style={{ width: '100%' }} />

       cylindricity y 调试效果：

       描述目标投影沿 Y 轴的球形程度。该值的范围为0到1，其中1为球形。如果该值设置为1，圆柱度 X 值设置为0，则投影将沿 Y 轴形成一个圆柱体。如下所示：

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-18.png" alt="alt text" style={{ width: '100%' }} />

       :::info 注意！

       输入输出尺寸的宽应保持16字节对齐。
       正常的视力值大约是90度。对于圆柱度（见下文）等于“0”的变换，视场宽度和高度180的值将导致图像无限拉伸。
       如果 cylindricity_x 和 cylindricity_y 圆柱度值都设置为1，则投影将是球形的。如果两者都是0，则变换将是矩形的。

       :::




5. Custom
   * 功能描述

       采用 custom 变换后，输入图像中的每个多边形都会变换为正方形。换句话说，任何形状的任何四个邻近输入点在转换后都是正方形，如下图所示。但是，多边形的形状和位置在变换后会发生变化。

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-19.png" alt="alt text" style={{ width: '100%' }} />

       它们用于创建任何提供的转换都无法描述的转换。为了纠正任意失真，必须向 GDC 工具提供一个特殊的校准文件 config0.txt。如下图

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-20.png" alt="alt text" style={{ width: '100%' }} />

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

                <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-25.png" alt="alt text" style={{ width: '100%' }} />

           6. 由于标定点必须是等距离的，这意味着输出图片的分辨率取决于标定点的点数。

                <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-22.png" alt="alt text" style={{ width: '100%' }} />

                eg. 输出图片的 Width = 100， Height 计算为340，计算过程如下：100/height = (96~1)/(324~1) \
                下图是更简单的3x3坐标点转换的示例图

                <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-23.png" alt="alt text" style={{ width: '100%' }} />



6.  Keystone+dewarping
    * 功能描述

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-26.png" alt="alt text" style={{ width: '100%' }} />

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

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-27.png" alt="alt text" style={{ width: '100%' }} />

    输出图片如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-28.png" alt="alt text" style={{ width: '100%' }} />


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

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-29.png" alt="alt text" style={{ width: '100%' }} />

    输出图片如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-30.png" alt="alt text" style={{ width: '100%' }} />


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

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-31.png" alt="alt text" style={{ width: '100%' }} />

    输出图片如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-32.png" alt="alt text" style={{ width: '100%' }} />

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

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-33.png" alt="alt text" style={{ width: '100%' }} />

    输出图片如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-34.png" alt="alt text" style={{ width: '100%' }} />

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

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-35.png" alt="alt text" style={{ width: '100%' }} />

    输出图片如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-36.png" alt="alt text" style={{ width: '100%' }} />


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

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-37.png" alt="alt text" style={{ width: '100%' }} />

    输出图片如下

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-38.png" alt="alt text" style={{ width: '100%' }} />


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

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch_work.png" alt="" style={{ width: '100%' }} />

**硬件拼接示意图**

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch0.png" alt="" style={{ width: '100%' }} />
通过使用图片上的两个源 ROI 进行不同 blend mode 的拼接，最终输出对应的 ROI 结果

**拼接方案介绍**

硬件拼接功能可以完成将多张图片拼接融合生成一张图片。硬件上设计灵活，以 ROI 为基本处理单位，基于 alpha
blend 算法，使用不同的配置字参数划分出不同的 ROI 划分区域灵活的配置生成多种不同的拼接方案，并且运用 LUT 表处理拼接的过渡区域优化效果，在自动驾驶以及 ADAS 的 APA 场景下，可以将四路摄像头已经被畸变矫正过后的 IPM 图像数据拼接成一路360环视图，用于停车位的检测，方便用户查看车位线周边情况进行停车。

**典型场景**
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch1.png" alt="" style={{ width: '100%' }} />
在 APA 场景，四路环视泊车，GDC 从 DDR 中获取4张回灌图片和参考点(CFG
BIN)通过畸变矫正输出4张 IPM 图，然后通过 STITCH 硬件拼接模块使用预先定义好的配置字拼接方案参数(CPG
PARAM)进行硬件拼接输出鸟瞰图。

**摆放位置**

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch2.png" alt="" style={{ width: '100%' }} />
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
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch3.png" alt="" style={{ width: '100%' }} />
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
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/lpwm_01.png" alt="" style={{ width: '100%' }} />

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

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/47ab7cc928ceb5b8e03de23bb95d057b.png" alt="" style={{ width: '100%' }} />

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



## Camera API

| 注意，本章节是基于 HBN 架构进行描述和列举内容，非 V4L2 架构。 |
|---------------------------------------------------------------|

### 模块描述

RDK-S100 HBN Camera 包含三个组件：Camera
sensor、解串器(Deserial)、串行器(Serializer)。串行器是对 mipi tx 的封装。
每个组件都有 attach、detach 接口和 vin 绑定或解绑。如 camera 和 vin
绑定，就是确定 camera 使用 SoC 上的哪个 mipi rx、i2c controller 然后初始化
sensor 的过程。

### API 参考

1. **hbn_camera_create**

【函数声明】

int32_t hbn_camera_create(camera_config_t \*cam_config, camera_handle_t
\*cam_fd)

【参数描述】

[IN] camera_config_t \*cam_config：要配置的 camera 对应的参数结构体指针；

[OUT] camera_handle_t \*cam_fd：根据配置参数返回的 fd，作为 camera 的操作 handle；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

根据 camera_config_t 传入的配置创建 camera handle。

【注意事项】

API 里面会对 sensor lib 进行检查，如果 sensor 驱动代码不符合 HBN
框架规范，则会检查报错。

API 里面会对 cam_config 进行检查，如果配置不符合 IP 硬件能力，则会检查报错。

2. **hbn_camera_destroy**

【函数声明】

int32_t hbn_camera_destroy(camera_handle_t cam_fd)

【参数描述】

[IN] camera_handle_t cam_fd：camera 的操作 handle，由 hbn_camera_create 所创建；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

根据 camera handle 销毁对应的软件资源。

【注意事项】

hbn_camera_destroy 需要和 hbn_camera_create 成对使用。

hbn_camera_destroy 会释放 sensor lib, 执行完成后，sensor 将无法正常访问。

hbn_camera_destroy
内部会调用 hbn_camera_detach_from_vin，会触发 sensor 停流操作，所以 hbn_camera_destroy 需要在 hbn_vflow_destroy 之前调用。

3. **hbn_camera_attach_to_vin**

【函数声明】

int32_t hbn_camera_attach_to_vin(camera_handle_t cam_fd, vpf_handle_t vin_fd)

【参数描述】

[IN] camera_handle_t cam_fd：camera handle，由 hbn_camera_create 创建；

[IN] vpf_handle_t vin_fd：由 hbn_vnode_open 接口创建的 vin node handle。

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

通过 camera 和 vin node 的 handle，将两者在 vpf 框架中绑定，并对 camera 的硬件初始化。

【注意事项】

同一个 camera,不能重复执行 hbn_camera_attach_to_vin，否则会报 attach error 错误。

4. **hbn_camera_detach_from_vin**

【函数声明】

int32_t hbn_camera_detach_from_vin(camera_handle_t cam_fd)

【参数描述】

[IN] camera_handle_t cam_fd：camera handle，由 hbn_camera_create 创建；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

将 camera 与 vin node 解绑，并做去初始化操作。

【注意事项】

hbn_camera_detach_from_vin 需要和 hbn_camera_attach_to_vin 成对使用。

hbn_camera_destroy 内部调用了 hbn_camera_detach_from_vin，所以调用了 hbn_camera_destroy 接口，hbn_camera_detach_from_vin 可以不再调用。

5. **hbn_camera_attach_to_deserial**

【函数声明】

int32_t hbn_camera_attach_to_deserial(camera_handle_t cam_fd, deserial_handle_t
des_fd, camera_des_link_t link)

【参数描述】

[IN] camera_handle_t cam_fd：camera handle，由 hbn_camera_create 创建；

[IN] deserial_handle_t des_fd：deserial handle，由 hbn_deserial_create 创建；

[IN] camera_des_link_t
link：camera 与 deserial 的 link 方式，根据 camera 接到哪个 link 决定。

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

通过 camera 和 deserial 的 handle，将两者绑定，并对 deserial 和 camera 硬件初始化。

【注意事项】

硬件上有解串器时才需要调用该接口。

执行 hbn_camera_attach_to_deserial 后，就不需要再执行 hbn_camera_attach_to_vin，而是由 deserial 绑定到 vin
node。

6. **hbn_camera_detach_from_deserial**

【函数声明】

int32_t hbn_camera_detach_from_deserial(camera_handle_t cam_fd)

【参数描述】

[IN] camera_handle_t cam_fd：camera handle，由 hbn_camera_create 创建；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

将 camera 与 deserial 解绑，并做去初始化操作。

【注意事项】

hbn_camera_detach_from_deserial 需要和 hbn_camera_attach_to_deserial 成对使用。

调用该 api 前需要先调用 hbn_deserial_detach_from_vin

7. **hbn_camera_start**

【函数声明】

int32_t hbn_camera_start(camera_handle_t cam_fd)

【参数描述】

[IN] camera_handle_t cam_fd：camera handle，由 hbn_camera_create 创建；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

配置 camera 寄存器，开始出流。

【注意事项】

camera handle attach 到 vflow
后，该接口可以不调用。如果要调用必须先调用 hbn_vflow_start，再调用 hbn_camera_start。

8. **hbn_camera_stop**

【函数声明】

int32_t hbn_camera_stop(camera_handle_t cam_fd)

【参数描述】

[IN] camera_handle_t cam_fd：camera handle，由 hbn_camera_create 创建；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

camera 关流。

【注意事项】

需要和 hbn_camera_start 成对使用。

9. **hbn_camera_reset**

【函数声明】

int32_t hbn_camera_reset(camera_handle_t cam_fd)

【参数描述】

[IN] camera_handle_t cam_fd：camera handle，由 hbn_camera_create 创建；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

通过重新初始化 sensor 来做 reset。

【注意事项】

如果在 camera attach
vin 之前调用该接口，则会通过 camera_attach_to_vin 接口来给 sensor 初始化，达到 reset 效果。如果是在 camera
attach vin 之后调用该接口，则会调用 sensor stop,sensor
deinit，然后初始化再重新 init sensor,start sensor。

10. **hbn_camera_change_fps**

【函数声明】

int32_t hbn_camera_change_fps(camera_handle_t cam_fd, int32_t fps)

【参数描述】

[IN] camera_handle_t cam_fd：camera handle，由 hbn_camera_create 创建；

[IN] int32_t fps：sensor 出图帧率；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

动态切换 sensor 帧率。

【注意事项】

该功能需要在 sensor lib 库中实现相应的回调函数 dynamic_switch_fps。

11. **hbn_camera_read_register**

【函数声明】

int32_t hbn_camera_read_register(camera_handle_t cam_fd, camera_reg_type_t type,
uint32_t reg_addr)

【参数描述】

[IN] camera_handle_t cam_fd：camera handle，由 hbn_camera_create 创建；

[IN] camera_reg_type_t type：读取 sensor 寄存器的类型；

[IN] uint32_t reg_addr：寄存器地址；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

读取 camera 寄存器的值。

【注意事项】

无

12. **hbn_camera_get_handle**

【函数声明】

camera_handle_t hbn_camera_get_handle(vpf_handle_t vin_fd, int32_t camera_index)

【参数描述】

[IN] vpf_handle_t vin_fd：vin node 的 fd；

[IN] int32_t camera_index：camera 的 port index；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

通过 vin node handle 或者 camera port index，获取对应的 camera handle。

【注意事项】

无

13. **hbn_camera_init_cfg**

【函数声明】

int32_t hbn_camera_init_cfg(const char \*cfg_file)

【参数描述】

[IN] const char \*cfg_file：camera 配置文件路径（json）；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

通过传入的配置，创建 camera handle 和 deserial handle 并绑定。

【注意事项】

该 API 是通过解析 json 方式来创建 camera,与 sample 中非 json 方式接口不同，详情请咨询 FAE。

:::tip 商业支持
商业版提供更完整的功能支持、更深入的硬件能力开放和专属的定制内容。为确保内容合规、安全交付，我们将通过以下方式开放商业版访问权限。

商业版本获取流程：
1. 填写问卷：提交您的机构信息、使用场景等基本情况
2. 签署保密协议（NDA）：我们将根据提交信息与您联系，双方确认后签署保密协议
3. 内容释放：完成协议签署后，我们将通过私有渠道为您开放商业版本资料
  
如您希望获取商业版内容，请点击下方链接填写问卷，我们将在 3 ～ 5 个工作日内与您联系：
https://horizonrobotics.feishu.cn/share/base/form/shrcnpBby71Y8LlixYF2N3ENbre
:::

14. **hbn_deserial_create**

【函数声明】

int32_t hbn_deserial_create(deserial_config_t \*des_config, deserial_handle_t
\*des_fd)

【参数描述】

[IN] deserial_config_t \*des_config：deserial 配置参数结构体指针；

[OUT] deserial_handle_t \*des_fd：根据配置创建的 deserial handle；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

根据传入的配置，创建 deserial handle。

【注意事项】

硬件上有解串器时才需要调用该接口。

该接口会对 deserial 的配置进行检查，如果配置超出一定范围，则会报错。

该接口会对 deserial lib 进行检查，如果不符合 HBN 架构规范，则会报错。

15. **hbn_deserial_destroy**

【函数声明】

int32_t hbn_deserial_destroy(deserial_handle_t des_fd)

【参数描述】

[IN] deserial_handle_t des_fd：deserial handle，由 hbn_deserial_create 创建；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

根据 deserial handle 销毁对应的软件资源。

【注意事项】

hbn_deserial_destroy 需要和 hbn_deserial_create 成对使用。

16. **hbn_deserial_attach_to_vin**

【函数声明】

int32_t hbn_deserial_attach_to_vin(deserial_handle_t des_fd, camera_des_link_t
link, vpf_handle_t vin_fd)

【参数描述】

[IN] deserial_handle_t des_fd：deserial handle，由 hbn_deserial_create 创建；

[IN] camera_des_link_t link：deserial 的 link 编号；

[IN] vpf_handle_t vin_fd：要绑定到的 vin node handle；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

将 deserial 与 vin node 绑定。

【注意事项】

硬件上带有解串器，则 camera 与 deserial 进行绑定,deserial 与 vin node 绑定。

17. **hbn_deserial_detach_from_vin**

【函数声明】

int32_t hbn_deserial_detach_from_vin(deserial_handle_t des_fd, camera_des_link_t
link)

【参数描述】

[IN] deserial_handle_t des_fd：deserial handle，由 hbn_deserial_create 创建；

[IN] camera_des_link_t link：deserial 的 link 编号；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

将 deserial 与 vin node 解绑。

【注意事项】

hbn_deserial_detach_from_vin 与 hbn_deserial_attach_to_vin 需要成对使用。

18. **hbn_txser_create**

【函数声明】

int32_t hbn_txser_create(txser_config_t \*txs_config, txser_handle_t \*txs_fd)

【参数描述】

[IN] txser_config_t \*txs_config：tx serial 配置参数结构体指针；

[OUT] txser_handle_t \*txs_fd：根据配置创建的 tx serial handle；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

根据传入的配置，创建串行器句柄 tx serial handle。

【注意事项】

硬件上有串行器时才需要调用该接口。

该接口会对 txser 的配置进行检查，如果配置超出一定范围，则会报错。

该接口会对 txser lib 进行检查，如果不符合 HBN 架构规范，则会报错。

19. **hbn_txser_destroy**

【函数声明】

int32_t hbn_txser_destroy(txser_handle_t txs_fd)

【参数描述】

[IN] txser_handle_t txs_fd：tx serial handle，由 hbn_txser_create 创建；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

根据 tx serial handle 销毁对应的软件资源。

【注意事项】

硬件上有串行器时才需要调用该接口。

hbn_txser_destroy 与 hbn_txser_create 需要成对使用。

20. **hbn_txser_attach_to_vin**

【函数声明】

int32_t hbn_txser_attach_to_vin(txser_handle_t txs_fd, camera_txs_csi_t csi,
vpf_handle_t vin_fd)

【参数描述】

[IN] txser_handle_t txs_fd：tx serialhandle，由 hbn_txser_create 创建；

[IN] camera_txs_csi_t csi：tx csi index；

[IN] vpf_handle_t vin_fd：要绑定到的 vin node handle；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

将 tx serial 与 vin node 绑定。

【注意事项】

硬件上有串行器时才需要调用该接口。

该接口会对 txser 硬件进行初始化。

硬件上带有串行器，则 camera 与 txser 进行绑定,txser 与 vin node 绑定。

21. **hbn_txser_detach_from_vin**

【函数声明】

int32_t hbn_txser_detach_from_vin(txser_handle_t txs_fd, camera_txs_csi_t csi)

【参数描述】

[IN] txser_handle_t txs_fd：tx serial handle，由 hbn_txser_create 创建；

[IN] camera_txs_csi_t csi：tx csi index；

【返回值】

成功：RET_OK 0

失败：异常为负值错误码

【功能描述】

将 tx serial 与 vin node 解绑。

【注意事项】

hbn_txser_detach_from_vin 需要与 hbn_txser_attach_to_vin 成对使用。

### 参数说明

**typedef struct camera_config_s**

| **名称**                     | **类型**      | **最小值** | **最大值**                  | **默认值** | **含义**                                                                                                                                                                                                                                                                                                                                                                                                  | **必选** |
|------------------------------|---------------|------------|-----------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| name[CAMERA_MODULE_NAME_LEN] | char          | \-         | CAMERA_MODULE_NAME_LEN(108) | \-         | camera 模组名称，需要和 sensor lib 名称对应，如：sensor 驱动名称为：libimx219.so，那么 name 为 imx219                                                                                                                                                                                                                                                                                                     | 是       |
| addr                         | uint32_t      | 0x00       | 0x7f                        | 0x00       | sensor 设备地址，一般是 i2c 7位地址                                                                                                                                                                                                                                                                                                                                                                       | 是       |
| isp_addr                     | uint32_t      | 0x00       | 0x7f                        | 0x00       | isp 设备地址(如有)，默认无                                                                                                                                                                                                                                                                                                                                                                                | 否       |
| eeprom_addr                  | uint32_t      | 0x00       | 0x7f                        | 0x00       | eeprom 设备地址(如有)，默认无                                                                                                                                                                                                                                                                                                                                                                             | 否       |
| serial_addr                  | uint32_t      | 0x00       | 0x7f                        | 0x00       | serdes 设备地址(如有)，默认无                                                                                                                                                                                                                                                                                                                                                                             | 否       |
| sensor_mode                  | uint32_t      | 1          | 5                           | 1          | sensor 工作模式，可以使用 enum sensor_mode_e 枚举，定义如下：                                                                                                                                                                                                                                                                                                                                             | 是       |
|                              |               |            |                             |            | 1：NORMAL_M，linear 模式；                                                                                                                                                                                                                                                                                                                                                                                |          |
|                              |               |            |                             |            | 2：DOL2_M，hdr2帧合成1帧；                                                                                                                                                                                                                                                                                                                                                                                |          |
|                              |               |            |                             |            | 3：DOL3_M，hdr3帧合成1帧；                                                                                                                                                                                                                                                                                                                                                                                |          |
|                              |               |            |                             |            | 4：DOL4_M，hdr4帧合成1帧；                                                                                                                                                                                                                                                                                                                                                                                |          |
|                              |               |            |                             |            | 5：PWL_M，hdr 模式 sensor 内部合成                                                                                                                                                                                                                                                                                                                                                                        |          |
| sensor_clk                   | uint32_t      | \-         | \-                          | 0x00       | sensor 一些 clk 时钟配置，目前未生效，备用                                                                                                                                                                                                                                                                                                                                                                | 否       |
| gpio_enable                  | uint32_t      | 0          | 0xFFFFFFFF                  | 0          | 是否使用 X5 gpio 控制 camera sensor 的引脚，以满足 sensor 上下电的时序要求。                                                                                                                                                                                                                                                                                                                              | 是       |
|                              |               |            |                             |            | 如：使用 gpio 来控制 sensor XSHUTDN 引脚。                                                                                                                                                                                                                                                                                                                                                                |          |
|                              |               |            |                             |            | 注意：需要在 dts 中配置对应的 gpio number。                                                                                                                                                                                                                                                                                                                                                               |          |
|                              |               |            |                             |            | 0：不使用 gpio 来控制；                                                                                                                                                                                                                                                                                                                                                                                   |          |
|                              |               |            |                             |            | 非0：使用 gpio 来控制 sensor，按照 bit 来使能 gpio。比如: 0x07 则代表使能 [gpio_a, gpio_b, gpio_c] 3 个 gpio。                                                                                                                                                                                                                                                                                            |          |
| gpio_level                   | uint32_t      | 0          | 1                           | 0          | 如果选择 gpio_enablet，则可以配置 gpio_level bit 来控制 sensor 引脚高低电平。某个 gpio bit 与 sensor 管脚高低电平关系如下：                                                                                                                                                                                                                                                                               | 是       |
|                              |               |            |                             |            | 0: 先输出低电平， sleep 1s，再输出高电平；                                                                                                                                                                                                                                                                                                                                                                |          |
|                              |               |            |                             |            | 1: 先输出高电平，sleep 1s，再输出低电平。                                                                                                                                                                                                                                                                                                                                                                 |          |
|                              |               |            |                             |            | 比如：0x05 = 101，从 bit0 到 bit2 分别代表 gpio_a 先输出高电平，再输出低电平，gpio_b 先输出低电平，再输出高电平，gpio_c 先输出高电平，再输出低电平。                                                                                                                                                                                                                                                      |          |
|                              |               |            |                             |            | 需要根据 sensor spec 上电时序来自定义。                                                                                                                                                                                                                                                                                                                                                                   |          |
| bus_select                   | uint32_t      | 0          | 6                           | 0          | sensor i2c number 选择，一般硬件固定后，对应的 i2c 也是固定的，所以建议在 dts 中配置，这里可以省去。                                                                                                                                                                                                                                                                                                      | 否       |
|                              |               |            |                             |            | dts 中绑定 sensor i2c，详情见：camera 点亮说明文档。                                                                                                                                                                                                                                                                                                                                                      |          |
| bus_timeout                  | uint32_t      | 0          | \-                          | 0          | I2C 的 timeout 时间配置。配置了 bus_select，才需要配置。                                                                                                                                                                                                                                                                                                                                                  | 否       |
| fps                          | uint32_t      | 0          | 120                         | 0          | sensor 帧率配置。                                                                                                                                                                                                                                                                                                                                                                                         | 是       |
| width                        | uint32_t      | 0          | 8192                        | 0          | sensor 出图宽度（pixel）                                                                                                                                                                                                                                                                                                                                                                                  | 是       |
| height                       | uint32_t      | 0          | 4096                        | 0          | sensor 出图高度（pixel）                                                                                                                                                                                                                                                                                                                                                                                  | 是       |
| format                       | uint32_t      | \-         | \-                          | \-         | sensor 数据类型，常见的如下：                                                                                                                                                                                                                                                                                                                                                                             | 是       |
|                              |               |            |                             |            | RAW8: 0x2A；                                                                                                                                                                                                                                                                                                                                                                                              |          |
|                              |               |            |                             |            | RAW10: 0x2B；                                                                                                                                                                                                                                                                                                                                                                                             |          |
|                              |               |            |                             |            | RAW12: 0x2C；                                                                                                                                                                                                                                                                                                                                                                                             |          |
|                              |               |            |                             |            | YUV422 8-bit: 0x1E                                                                                                                                                                                                                                                                                                                                                                                        |          |
| flags                        | uint32_t      | 0          | \-                          | 0          | 可选功能:诊断，恢复，debug 等                                                                                                                                                                                                                                                                                                                                                                             | 否       |
| extra_mode                   | uint32_t      | 0          | \-                          | 0          | 各 sensor 库内部定制配置: 多用于区分模组与功能开关                                                                                                                                                                                                                                                                                                                                                        | 是       |
| config_index                 | uint32_t      | 0          | \-                          | 0          | 各 sensor 库内部定制配置: 多用于区分模组与功能开关                                                                                                                                                                                                                                                                                                                                                        | 是       |
| ts_compensate                | uint32_t      | 0          | \-                          | 0          | 预留参数，备用                                                                                                                                                                                                                                                                                                                                                                                            | 否       |
| mipi_cfg                     | mipi_config_t | \-         | \-                          | \-         | MIPI 配置， 置为 NULL 自动从 sensor 驱动中获取配置（get_csi_attr）。                                                                                                                                                                                                                                                                                                                                      | 是       |
| calib_lname                  | char          | \-         | \-                          | \-         | sensor 效果库路径，默认路径为 /usr/hobot/lib/sensor                                                                                                                                                                                                                                                                                                                                                       | 是       |
| sensor_param                 | char          | \-         | \-                          | \-         | sensor 自定义数据                                                                                                                                                                                                                                                                                                                                                                                         | 否       |
| iparam_mode                  | uint32_t      | \-         | \-                          | \-         | 预留参数，备用                                                                                                                                                                                                                                                                                                                                                                                            | 否       |
| end_flag                     | uint32_t      | \-         | \-                          | \-         | 结构体配置的结束标志，默认为 CAMERA_CONFIG_END_FLAG                                                                                                                                                                                                                                                                                                                                                       | 是       |

**typedef struct deserial_config_s**

| **名称**       | **类型**                                          | **最小值** | **最大值**          | **默认值** | **含义**                                              | **必选** |
|----------------|---------------------------------------------------|------------|---------------------|------------|-------------------------------------------------------|----------|
| name           | char[CAMERA_MODULE_NAME_LEN]                      | \-         | \-                  | \-         | Deserial 的名称，例如 max9296。                       | 是       |
| addr           | uint32_t                                          | 0          | \-                  | \-         | Deserial 设备的地址。                                 | 是       |
| gpio_enable    | uint32_t                                          | 0          | \-                  | \-         | GPIO 操作使能位，索引自 VCON。                        | 是       |
| gpio_level     | uint32_t                                          | 0          | \-                  | \-         | GPIO 工作状态位，表示当前 GPIO 状态。                 | 是       |
| gpio_mfp       | uint8_t[CAMERA_DES_GPIO_MAX]                      | 0          | CAMERA_DES_GPIO_MAX | 0x0        | MFP 的 GPIO 功能选择，用于指定 GPIO 的多功能配置。    | 是       |
| bus_select     | uint32_t                                          | 0          | \-                  | \-         | I2C 总线选择，索引自 VCON。                           | 是       |
| bus_timeout    | uint32_t                                          | 0          | \-                  | \-         | I2C 超时时间设置，单位为毫秒。                        | 是       |
| lane_mode      | uint32_t                                          | 0          | \-                  | \-         | PHY 配置的 lane 模式选择。                            | 是       |
| lane_speed     | uint32_t                                          | 0          | \-                  | \-         | PHY 配置的 lane 速率。                                | 是       |
| link_map       | uint32_t                                          | 0          | \-                  | \-         | Link 和 CSI/VC 的映射关系配置。                       | 是       |
| link_desp      | char[CAMERA_DES_LINKMAX][CAMERA_DES_PORTDESP_LEN] | \-         | \-                  | \-         | 各 Link 连接模组的配置描述，用于多进程使用。          | 是       |
| reset_delay    | uint32_t                                          | 0          | \-                  | \-         | Reset 操作的延迟时间，单位为毫秒。                    | 是       |
| flags          | uint32_t                                          | 0          | \-                  | \-         | 可选功能标志，例如诊断、调试等。                      | 否       |
| poc_cfg        | poc_config_t\*                                    | \-         | \-                  | NULL       | POC 配置指针，若为 NULL 则无 POC 功能。               | 否       |
| mipi_cfg       | mipi_config_t\*                                   | \-         | \-                  | NULL       | MIPI 配置指针，若为 NULL 则自动获取配置。             | 否       |
| deserial_param | char\*                                            | \-         | \-                  | NULL       | Deserial 自定义数据指针。                             | 否       |
| end_flag       | uint32_t                                          | 0          | 0xFFFFFFFF          | \-         | 结构体配置的结束标志，默认为 DESERIAL_CONFIG_END_FLAG | 是       |

**typedef struct poc_config_s**

| **名称**    | **类型**                     | **最小值** | **最大值** | **默认值** | **含义**                                                        | **必选** |
|-------------|------------------------------|------------|------------|------------|-----------------------------------------------------------------|----------|
| name        | char[CAMERA_MODULE_NAME_LEN] | \-         | \-         | \-         | POC 的名称，例如 max20087。                                     | 是       |
| addr        | uint32_t                     | 0          | \-         | \-         | POC 设备的地址。                                                | 是       |
| gpio_enable | uint32_t                     | 0          | \-         | \-         | GPIO 操作使能位，索引自 VCON。                                  | 是       |
| gpio_level  | uint32_t                     | 0          | \-         | \-         | GPIO 工作状态位，表示当前 GPIO 状态。                           | 是       |
| poc_map     | uint32_t                     | 0          | \-         | \-         | POC 与 Link 的映射关系。                                        | 是       |
| power_delay | uint32_t                     | 0          | \-         | \-         | POC 开关操作的延迟时间，单位为毫秒。                            | 是       |
| end_flag    | uint32_t                     | 0          | 0xFFFFFFFF | \-         | 结构体配置的结束标志,用于校验完整性，默认为 POC_CONFIG_END_FLAG | 是       |

**返回值说明**

| **错误码** | **宏定义**                    | **描述**                                      | **常见原因及解决方法**                      |
|------------|-------------------------------|-----------------------------------------------|---------------------------------------------|
| 0          | HBN_STATUS_SUCESS             | 成功                                          |                                             |
| 1          | HBN_STATUS_INVALID_NODE       | vnode 无效，找不到对应的 vnode                |                                             |
| 2          | HBN_STATUS_INVALID_NODETYPE   | vnode 类型无效，找不到对应的 vnode            | 对于 VIN，vnode 类型为 HB_VIN               |
| 3          | HBN_STATUS_INVALID_HWID       | 无效的硬件模块 id                             | 对于 VIN，hw_id 取值为 0                    |
| 4          | HBN_STATUS_INVALID_CTXID      | 无效的 context id                             | 可设置为 AUTO_ALLOC_ID，由 HBN 框架自动分配 |
| 8          | HBN_STATUS_INVALID_NULL_PTR   | 空指针                                        |                                             |
| 9          | HBN_STATUS_INVALID_PARAMETER  | 无效的参数，版本检查失败                      |                                             |
| 10         | HBN_STATUS_ILLEGAL_ATTR       | 无效的参数                                    |                                             |
| 11         | HBN_STATUS_INVALID_FLOW       | 无效的 flow，找不到对应的 flow                |                                             |
| 12         | HBN_STATUS_FLOW_EXIST         | flow 已经存在                                 |                                             |
| 13         | HBN_STATUS_FLOW_UNEXIST       | flow 不存在                                   |                                             |
| 14         | HBN_STATUS_NODE_EXIST         | node 已经存在                                 |                                             |
| 15         | HBN_STATUS_NODE_UNEXIST       | node 不存在                                   |                                             |
| 16         | HBN_STATUS_NOT_CONFIG         | 预留                                          |                                             |
| 19         | HBN_STATUS_ALREADY_BINDED     | node 已经绑定                                 |                                             |
| 20         | HBN_STATUS_NOT_BINDED         | node 未绑定                                   |                                             |
| 21         | HBN_STATUS_TIMEOUT            | 超时                                          |                                             |
| 22         | HBN_STATUS_NOT_INITIALIZED    | 未初始化                                      |                                             |
| 23         | HBN_STATUS_NOT_SUPPORT        | 通道不支持或未激活                            |                                             |
| 24         | HBN_STATUS_NOT_PERM           | 操作不允许                                    |                                             |
| 25         | HBN_STATUS_NOMEM              | 内存不足                                      |                                             |
| 31         | HBN_STATUS_JSON_PARSE_FAIL    | json 解析失败                                 |                                             |
| 34         | HBN_STATUS_SET_CONTROL_FAIL   | 模块控制、调节参数（如 ISP 效果参数）设置失败 |                                             |
| 35         | HBN_STATUS_GET_CONTROL_FAIL   | 模块控制、调节参数（如 ISP 效果参数）获取失败 |                                             |
| 36         | HBN_STATUS_NODE_START_FAIL    | node 开启失败                                 |                                             |
| 37         | HBN_STATUS_NODE_STOP_FAIL     | node 停止失败                                 |                                             |
| 42         | HBN_STATUS_NODE_ILLEGAL_EVENT | node 通道 poll 时事件非法                     |                                             |
| 43         | HBN_STATUS_NODE_DEQUE_ERROR   | node 通道 dequeue buffer 错误                 |                                             |
| 51         | HBN_STATUS_INVALID_VERSION    | 底层驱动模块和上层库版本号不匹配错误          |                                             |
| 52         | HBN_STATUS_GET_VERSION_ERROR  | 获取底层驱动模块版本号错误                    |                                             |
| 128        | HBN_STATUS_ERR_UNKNOW         | 未知错误                                      |                                             |

**Camera 点亮**



## HBN API

### 描述

在软件上，Camera 是单独一套 API，Camera 之后的模块用 vnode 来抽象，vnode 抽象的模块包括 VIN、ISP、PYM、GDC。
多个 vnode 组成一条 vflow（类似于一条 pipeline）。Camera 和 VIN 通过 attach 接口绑定起来。
用户只需要调用 HBN 接口完成模块的初始化和绑定，vflow 建立并启动后，用户无须关心数据帧的传递，SDK 内部会将数据帧由上游传递到下游。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/28afb7cb9d1a5de6c889657a0e548e82.jpg" alt="" style={{ width: '100%' }} />

一个 vflow 由一个或多个 vnode 组成，一个 vnode 有一个输入通道，一个或多个输出通道。

接口调用示例：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/492ed46bde119b791326f621b9f5b064.png" alt="" style={{ width: '100%' }} />

### API 参考

1. **hbn_vnode_open**

【函数声明】

hobot_status hbn_vnode_open(hb_vnode_type vnode_type, uint32_t hw_id, int32_t
ctx_id, hbn_vnode_handle_t \*vnode_fd)

【参数描述】

[IN] hb_vnode_type
vnode_type：vnode 类型，每个硬件模块对应一个 vnode 类型。取值为 HB_VIN、HB_ISP、HB_PYM 等；

[IN] uint32_t hw_id：模块的硬件 id。

[IN] uint32_t ctx_id：模块的 context id，软件上的概念，可指定 context
id 值，也可设置为 AUTO_ALLOC_ID，由 SDK 自动分配 context id；

[OUT] hbn_vnode_handle_t \*vnode_fd：返回模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明。

【功能描述】

初始化某个模块，打开该模块设备节点，返回该模块的 vnode handle。

【注意事项】

无

2. **hbn_vnode_close**

【函数声明】

void hbn_vnode_close(hbn_vnode_handle_t vnode_fd)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

无

【功能描述】

关闭模块的设备节点。

【注意事项】

调用了 hbn_vflow_destroy 就无须再调用 hbn_vnode_close。

模块单独使用时（例如只是 GDC 回灌）可调用 hbn_vnode_close，模块串在 vflow 中，调用 hbn_vflow_destroy 即可，无须调用 hbn_vnode_close。

3. **hbn_vnode_set_attr**

【函数声明】

hobot_status hbn_vnode_set_attr(hbn_vnode_handle_t vnode_fd, void \*attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] void
\*attr：模块的基本属性结构体指针。基本属性结构体可以是 vin_attr_t、isp_attr_t、pym_attr_t 等，以模块名+_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的基本属性。

【注意事项】

无

4. **hbn_vnode_get_attr**

【函数声明】

hobot_status hbn_vnode_get_attr(hbn_vnode_handle_t vnode_fd, void \*attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[OUT] void
\*attr：模块的基本属性结构体指针。基本属性结构体可以是 vin_attr_t、isp_attr_t、pym_attr_t 等，以模块名+_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块的基本属性。

【注意事项】

无

5. **hbn_vnode_set_attr_ex**

【函数声明】

hobot_status hbn_vnode_set_attr_ex(hbn_vnode_handle_t vnode_fd, void \*attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] void
\*attr：模块的扩展属性结构体指针。扩展属性结构体可以是 vin_attr_ex_t 等，以模块名+_attr_ex_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的扩展属性，可在应用运行中动态设置。

【注意事项】

无

6. **hbn_vnode_get_attr_ex**

【函数声明】

hobot_status hbn_vnode_get_attr_ex(hbn_vnode_handle_t vnode_fd, void \*attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[OUT] void
\*attr：模块的扩展属性结构体指针。扩展属性结构体可以是 vin_attr_ex_t 等，以模块名+_attr_ex_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块的扩展属性。

【注意事项】

无

7. **hbn_vnode_set_ochn_attr**

【函数声明】

hobot_status hbn_vnode_set_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, void \*attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；；

[IN] void
\*attr：模块的输出通道属性结构体指针。输出通道属性可以是 vin_ochn_attr_t、isp_ochn_attr_t 等，以模块名+_ochn_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的输出通道属性。

【注意事项】

无

8. **hbn_vnode_get_ochn_attr**

【函数声明】

hobot_status hbn_vnode_get_ochn_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, void \*attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[OUT] void
\*attr：模块输出通道属性结构体指针。输出通道属性可以是 vin_ochn_attr_t、isp_ochn_attr_t 等，以模块名+_ochn_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块的输出通道属性。

【注意事项】

无

9. **hbn_vnode_set_ochn_attr_ex**

【函数声明】

hobot_status hbn_vnode_set_ochn_attr_ex(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, void \*attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[IN] void
\*attr：模块的输出通道扩展属性结构体指针。输出通道扩展属性可以是 pym_ochn_attr_ex_t 等，以模块名+_ochn_attr_ex_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的输出通道扩展属性，可在应用运行中动态设置。

【注意事项】

无

10. **hbn_vnode_set_ichn_attr**

【函数声明】

hobot_status hbn_vnode_set_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ichn_id, void \*attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ichn_id：模块的输入通道 id，通道 id 见模块通道说明；

[IN] void
\*attr：模块的输入通道属性结构体指针。输入通道属性可以是 vin_ichn_attr_t、isp_ichn_attr_t 等，以模块名+_ichn_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置模块的输入通道属性。

【注意事项】

无

11. **hbn_vnode_get_ichn_attr**

【函数声明】

hobot_status hbn_vnode_get_ichn_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ichn_id, void \*attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ichn_id：模块的输入通道 id，通道 id 见模块通道说明；

[OUT] void
\*attr：模块的输入通道属性结构体指针。输入通道属性可以是 vin_ichn_attr_t、isp_ichn_attr_t 等，以模块名+_ichn_attr_t 结尾的属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块的输入通道属性。

【注意事项】

无

12. **hbn_vnode_set_ochn_buf_attr**

【函数声明】

hobot_status hbn_vnode_set_ochn_buf_attr(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, hbn_buf_alloc_attr_t \*alloc_attr)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[IN] hbn_buf_alloc_attr_t \*alloc_attr：buffer 分配属性；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

设置输出通道 buffer 属性。

【注意事项】

无

13. **hbn_vnode_start**

【函数声明】

hobot_status hbn_vnode_start(hbn_vnode_handle_t vnode_fd)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

模块启动。

【注意事项】

启动前需要先打开模块。

14. **hbn_vnode_stop**

【函数声明】

hobot_status hbn_vnode_stop(hbn_vnode_handle_t vnode_fd)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

模块停止。

【注意事项】

无

15. **hbn_vnode_getframe**

【函数声明】

hobot_status hbn_vnode_getframe(hbn_vnode_handle_t vnode_fd, uint32_t ochn_id,
uint32_t millisecondTimeout, hbn_vnode_image_t \*out_img)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[IN] uint32_t millisecondTimeout：超时等待时间；

[OUT] hbn_vnode_image_t \*out_img：输出图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块输出通道的图像，阻塞型接口。

【注意事项】

无

16. **hbn_vnode_releaseframe**

【函数声明】

hobot_status hbn_vnode_releaseframe(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, hbn_vnode_image_t \*img)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[IN] hbn_vnode_image_t \*img：图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

释放图像 buffer，buffer 会归还到指定的输出通道。

【注意事项】

无

17. **hbn_vnode_getframe_group**

【函数声明】

hobot_status hbn_vnode_getframe_group(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, uint32_t millisecondTimeout,hbn_vnode_image_group_t \*out_img);

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[IN] uint32_t millisecondTimeout：超时等待时间；

[OUT] hbn_vnode_image_group_t \*out_img：输出图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

获取模块输出通道的多层聚合图像，阻塞型接口。

【注意事项】

ISP 和 PYM 输出图像需要调用该接口获取

18. **hbn_vnode_releaseframe_group**

【函数声明】

hobot_status hbn_vnode_releaseframe_group(hbn_vnode_handle_t vnode_fd, uint32_t
ochn_id, hbn_vnode_image_group_t\*img)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ochn_id：模块的输出通道 id，通道 id 见模块通道说明；

[IN] hbn_vnode_image_t \*img：图像 buffer 结构体地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

释放多层聚合图像 buffer，buffer 会归还到指定的输出通道。

【注意事项】

无

19. **hbn_vnode_sendframe**

【函数声明】

hobot_status hbn_vnode_sendframe(hbn_vnode_handle_t vnode_fd, uint32_t ichn_id,
hbn_vnode_image_t \*img)

【参数描述】

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

[IN] uint32_t ichn_id：模块的输入通道 id，通道 id 见模块通道说明；

[IN] hbn_vnode_image_t \*img：输入图像 buffer 地址；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

发送图像到模块的输入通道，会触发模块进行处理。阻塞型接口，等待硬件处理完再返回，默认超时时间为1秒。

【注意事项】

无

20. **hbn_vflow_create**

【函数声明】

hobot_status hbn_vflow_create(hbn_vflow_handle_t \*vflow_fd)

【参数描述】

[OUT] hbn_vflow_handle_t \*vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

创建一个 vflow，返回 vflow handle。

【注意事项】

无

21. **hbn_vflow_destroy**

【函数声明】

void hbn_vflow_destroy(hbn_vflow_handle_t vflow_fd)

【参数描述】

[IN] hbn_vflow_handle_t \*vflow_fd：vflow handle；

【返回值】

无

【功能描述】

根据 vflow handle，销毁一个 vflow。

【注意事项】

无

22. **hbn_vflow_add_vnode**

【函数声明】

hobot_status hbn_vflow_add_vnode(hbn_vflow_handle_t vflow_fd, hbn_vnode_handle_t
vnode_fd)

【参数描述】

[IN] hbn_vflow_handle_t \*vflow_fd：vflow handle；

[IN] hbn_vnode_handle_t vnode_fd：模块的 vnode handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

把模块添加到 vflow 里面，用 vflow 管理起来。

【注意事项】

无

23. **hbn_vflow_bind_vnode**

【函数声明】

hobot_status hbn_vflow_bind_vnode(hbn_vflow_handle_t vflow_fd,
hbn_vnode_handle_t src_vnode_fd, uint32_t out_chn, hbn_vnode_handle_t
dst_vnode_fd, uint32_t in_chn)

【参数描述】

[IN] hbn_vflow_handle_t \*vflow_fd：vflow handle；

[IN] hbn_vnode_handle_t src_vnode_fd：源模块的 vnode handle；

[IN] uint32_t out_chn：源模块的输出通道 id，通道 id 见模块通道说明；

[IN] hbn_vnode_handle_t dst_vnode_fd：目的模块的 vnode handle；

[IN] uint32_t in_chn：目的模块的输入通道 id，通道 id 见模块通道说明；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

把两个模块绑定到一起。绑定后 src_vnode_fd 模块的数据帧会自动流向 dst_vnode_fd 模块。

【注意事项】

flow 需要创建，模块需要 open。

24. **hbn_vflow_unbind_vnode**

【函数声明】

hobot_status hbn_vflow_unbind_vnode(hbn_vflow_handle_t vflow_fd,
hbn_vnode_handle_t src_vnode_fd, uint32_t out_chn, hbn_vnode_handle_t
dst_vnode_fd, uint32_t in_chn)

【参数描述】

[IN] hbn_vflow_handle_t \*vflow_fd：vflow handle；

[IN] hbn_vnode_handle_t src_vnode_fd：源模块的 vnode handle；

[IN] uint32_t out_chn：源模块的输出通道 id，通道 id 见模块通道说明；

[IN] hbn_vnode_handle_t dst_vnode_fd：目的模块的 vnode handle；

[IN] uint32_t in_chn：目的模块的输入通道 id，通道 id 见模块通道说明；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

解绑 src_vnode_fd 和 dst_vnode_fd 模块。

【注意事项】

暂不支持。

25. **hbn_vflow_start**

【函数声明】

hobot_status hbn_vflow_start(hbn_vflow_handle_t vflow_fd)

【参数描述】

[IN] hbn_vflow_handle_t vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

启动一条 vflow。vflow 里包含的 vnode 都会启动。

【注意事项】

模块 vnode 需要事先添加到 vflow 中。

26. **hbn_vflow_stop**

【函数声明】

hobot_status hbn_vflow_stop(hbn_vflow_handle_t vflow_fd)

【参数描述】

[IN] hbn_vflow_handle_t vflow_fd：vflow handle；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

停止一条 vflow。vflow 里包含的 vnode 都会停止。

【注意事项】

和 hbn_vflow_start 成对使用。

27. **hbn_vflow_get_vnode_handle**

【函数声明】

hbn_vnode_handle_t hbn_vflow_get_vnode_handle(hbn_vflow_handle_t vflow_fd,
hb_vnode_type vnode_type, uint32_t index)

【参数描述】

[IN] hbn_vflow_handle_t vflow_fd：vflow handle；

[IN] hb_vnode_type vnode_type：模块 id；

[IN] uint32_t index：context id，范围为[0, 7]

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

通过模块 id 和 context id 获取 vnode handle。

【注意事项】

模块需要事先 open。

### ISP API

1. **hbn_isp_get_ae_statistics**

【函数声明】

int32_t hbn_isp_get_ae_statistics(hbn_vnode_handle_t vnode_fd, isp_statistics_t *ae_statistics, int32_t time_out)

【参数描述】

[IN] hbn_vflow_handle_t vflow_fd：vflow handle；

[IN] int32_t time_out：等待超时时间；

[OUT] isp_statistics_t *ae_statistics：ae 统计数据；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

通过 ISP 模块的 vflow_fd 来获取 AE 统计数据1024bin，固定为2096个字节，数据排布如下图：


<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/isp_1024_bin.png" alt="" style={{ width: '100%' }} />

2. **hbn_isp_release_ae_statistics**

【函数声明】

int32_t hbn_isp_release_ae_statistics(hbn_vnode_handle_t vnode_fd, isp_statistics_t *ae_statistics)

【参数描述】

[IN] hbn_vflow_handle_t vflow_fd：vflow handle；

[IN] isp_statistics_t *ae_statistics：ae 统计数据；

【返回值】

成功：HBN_STATUS_SUCESS 0

失败：异常为负值错误码，参考返回值说明

【功能描述】

释放获取到的 AE 统计数据，需要和 hbn_isp_get_ae_statistics 成对使用


### 参数说明

**公共**

hbn_vnode_image_t

| 名称     | 类型                 | 含义         | 最大值 | 最小值 | 默认值 | 是否必选 |
|----------|----------------------|--------------|--------|--------|--------|----------|
| info     | hbn_frame_info_t     | 图像信息结构 | \-     | \-     | \-     | \-       |
| buffer   | hb_mem_graphic_buf_t | 图像内存信息 | \-     | \-     | \-     | \-       |
| metadata | void \*              | meta 数据     | \-     | \-     | \-     | \-       |

hbn_frame_info_t

| 名称        | 类型           | 含义                 | 最大值 | 最小值 | 默认值 | 是否必选 |
|-------------|----------------|----------------------|--------|--------|--------|----------|
| frame_id    | uint32_t       | 帧号                 | \-     | \-     | \-     | \-       |
| timestamps  | uint64_t       | 系统时间             | \-     | \-     | \-     | \-       |
| tv          | struct timeval | 硬件时间戳           | \-     | \-     | \-     | \-       |
| trig_tv     | struct timeval | 外部触发的硬件时间戳 | \-     | \-     | \-     | \-       |
| bufferindex | int32_t        | buffer 索引           | \-     | \-     | \-     | \-       |

hb_mem_graphic_buf_t

| 名称                            | 类型       | 含义                   | 最大值 | 最小值 | 默认值 | 是否必选 |
|---------------------------------|------------|------------------------|--------|--------|--------|----------|
| fd[MAX_GRAPHIC_BUF_COMP]        | int32_t    | 文件描述符             | \-     | \-     | \-     | \-       |
| plane_cnt                       | int32_t    | plane 个数              | \-     | \-     | \-     | \-       |
| format                          | int32_t    | 图像格式               | \-     | \-     | \-     | \-       |
| width                           | int32_t    | 宽度                   | \-     | \-     | \-     | \-       |
| height                          | int32_t    | 高度                   | \-     | \-     | \-     | \-       |
| stride                          | int32_t    | 宽度 stride             | \-     | \-     | \-     | \-       |
| vstride                         | int32_t    | 高度 stride             | \-     | \-     | \-     | \-       |
| is_contig                       | int32_t    | buffer 物理地址是否连续 | \-     | \-     | \-     | \-       |
| share_id[MAX_GRAPHIC_BUF_COMP]  | int32_t    | 共享 id                 | \-     | \-     | \-     | \-       |
| flags                           | int64_t    | 标识                   | \-     | \-     | \-     | \-       |
| size[MAX_GRAPHIC_BUF_COMP]      | uint64_t   | buffer size            | \-     | \-     | \-     | \-       |
| virt_addr[MAX_GRAPHIC_BUF_COMP] | uint8_t \* | 虚拟地址               | \-     | \-     | \-     | \-       |
| phys_addr[MAX_GRAPHIC_BUF_COMP] | uint64_t   | 物理地址               | \-     | \-     | \-     | \-       |
| offset[MAX_GRAPHIC_BUF_COMP]    | uint64_t   | 内存偏移               | \-     | \-     | \-     | \-       |

hbn_vnode_image_group_t

| 名称      | 类型                       | 含义              | 最大值 | 最小值 | 默认值 | 是否必选 |
|-----------|----------------------------|-------------------|--------|--------|--------|----------|
| info      | hbn_frame_info_t           | 图像信息结构      | \-     | \-     | \-     | \-       |
| buf_group | hb_mem_graphic_buf_group_t | group 图像内存信息 | \-     | \-     | \-     | \-       |
| metadata  | void \*                    | meta 数据          | \-     | \-     | \-     | \-       |

hb_mem_graphic_buf_group_t

| 名称                                   | 类型                 | 含义                           | 最大值 | 最小值 | 默认值 | 是否必选 |
|----------------------------------------|----------------------|--------------------------------|--------|--------|--------|----------|
| graph_group[HB_MEM_MAXIMUM_GRAPH_BUF]; | hb_mem_graphic_buf_t | 图像内存信息                   | \-     | \-     | \-     | \-       |
| group_id                               | int32_t              | group id 号                     | \-     | \-     | \-     | \-       |
| bit_map                                | uint32_t             | 用 bit 标识 graph_group 中可用的层 | \-     | \-     | \-     | \-       |

**VIN**

vin_attr_t

| 名称          | 类型            | 含义                                  | 最大值 | 最小值 | 默认值 | 是否必选 |
|---------------|-----------------|---------------------------------------|--------|--------|--------|----------|
| vin_node_attr | vin_node_attr_t | vin node 节点属性结构                  | \-     | \-     | \-     | 是       |
| magicNumber   | uint32_t        | 属性结构体校验值，需要填写为 MAGIC_NUM | \-     | \-     | \-     | 是       |

vin_node_attr_t

| 名称        | 类型        | 含义                                  | 最大值 | 最小值 | 默认值 | 是否必选 |
|-------------|-------------|---------------------------------------|--------|--------|--------|----------|
| cim_attr    | cim_attr_t  | cim 参数                               | \-     | \-     | \-     | 是       |
| lpwm_attr   | lpwm_attr_t | lpwm 参数                              | \-     | \-     | \-     | 否       |
| vcon_attr   | vcon_attr_t | vcon 参数                              | \-     | \-     | \-     | 否       |
| magicNumber | uint32_t    | 属性结构体校验值，需要填写为 MAGIC_NUM | \-     | \-     | \-     | 是       |

cim_attr_t

| 名称          | 类型     | 含义                       | 最大值 | 最小值 | 默认值 | 是否必选 |
|---------------|----------|----------------------------|--------|--------|--------|----------|
| mipi_en       | uint32_t | 是否使能 mipi 输入           | 1      | 0      | \-     | 是       |
| mipi_rx       | uint32_t | mipi rx 索引，可选值为0,1,4 | 4      | 0      | \-     | 是       |
| vc_index      | uint32_t | cim ipi 索引                | 3      | 0      | \-     | 是       |
| cim_pym_flyby | uint32_t | 是否使能 cim pym 硬件直连    | 1      | 0      | \-     | 是       |
| cim_isp_flyby | uint32_t | 是否使能 cim isp 硬件直连    | 1      | 0      | \-     | 是       |

vin_ichn_attr_t

| 名称   | 类型     | 含义                              | 最大值 | 最小值 | 默认值 | 是否必选 |
|--------|----------|-----------------------------------|--------|--------|--------|----------|
| format | uint32_t | mipi 输入图像格式，例 raw12对应0x2c | 0x27   | 0x1E   | \-     | 是       |
| width  | uint32_t | mipi 输入图像宽                    | 4096   | 32     | \-     | 是       |
| height | uint32_t | mipi 输入图像高                    | 2160   | 32     | \-     | 是       |

vin_ochn_attr_t

| 名称           | 类型                  | 含义                                                                                                           | 最大值 | 最小值 | 默认值 | 是否必选 |
|----------------|-----------------------|----------------------------------------------------------------------------------------------------------------|--------|--------|--------|----------|
| ddr_en         | uint32_t              | 是否使能 cim ddr 输出                                                                                            | 1      | 0      | \-     | 否       |
| roi_en         | uint32_t              | 是否使能 cim roi 通道输出                                                                                        | 1      | 0      | \-     | 否       |
| emb_en         | uint32_t              | 是否使能 cim emb 通道输出                                                                                        | 1      | 0      | \-     | 否       |
| rawds_en       | uint32_t              | 是否使能 raw scaler                                                                                             | 1      | 0      | \-     | 否       |
| pingpong_ring  | uint32_t              | 是否使能乒乓 buffer                                                                                             | 1      | 0      | \-     | 否       |
| ochn_attr_type | vin_ochn_attr_type_e  | 输出通道类型： VIN_MAIN_FRAME 主数据通路 VIN_ONLINE online 输出通路 VIN_EMB embeded 数据通路 VIN_ROI roi 数据通路 | \-     | \-     | \-     | 是       |
| vin_basic_attr | vin_basic_attr_t      | vin 基础属性                                                                                                    | \-     | \-     | \-     | 是       |
| rawds_attr     | vin_rawds_attr_t      | vin raw scaler 属性                                                                                             | \-     | \-     | \-     | 否       |
| roi_attr       | struct vin_roi_attr_s | vin roi 属性                                                                                                   | \-     | \-     | \-     | 否       |
| emb_attr       | vin_emb_attr_t        | vin embeded 属性                                                                                                | \-     | \-     | \-     | 否       |
| magicNumber    | uint32_t              | 属性结构体校验值，需要填写为固定值 MAGIC_NUM                                                                    | \-     | \-     | \-     | 是       |

vin_basic_attr_t

| 名称      | 类型     | 含义                          | 最大值 | 最小值 | 默认值 | 是否必选 |
|-----------|----------|-------------------------------|--------|--------|--------|----------|
| pack_mode | uint32_t | pack 使能，不配置默认 pack      | 1      | 0      | 1      | 否       |
| wstride   | uint32_t | 输出宽 stride，置0内部自动计算 | 1      | 0      | 1      | 否       |
| vstride   | uint32_t | 输出高 stride，置0内部自动计算 | 1      | 0      | 1      | 否       |
| format    | uint32_t | 输出图像格式，例 raw12对应0x2c | 0x27   | 0x1E   | \-     | 是       |

**ISP**

isp_attr_t

| 名称        | 类型            | 含义                                                                                                                                 | 最大值 | 最小值 | 默认值 | 是否必选 |
|-------------|-----------------|--------------------------------------------------------------------------------------------------------------------------------------|--------|--------|--------|----------|
| channel     | isp_channel_t   | isp 通道属性                                                                                                                          | \-     | \-     | \-     | 是       |
| sched_mode  | sched_mode_e    | isp 调度模式 1 SCHED_MODE_MANUAL manual 模式 2 SCHED_MODE_PASS_THRU 全 online 模式                                                       | 2      | 1      | \-     | 是       |
| work_mode   | isp_work_mode_e | isp 工作模式 0 ISP_WORK_MODE_NOMAL 普通模式 1 ISP_WORK_MODE_TPG isp 输出 testpattern 模式 2 ISP_WORK_MODE_CIM_TPG cim 输出 testpattern 模式 | 2      | 0      | \-     | 否       |
| hdr_mode    | hdr_mode_e      | isp hdr 模式使能                                                                                                                      | 1      | 0      | \-     | 否       |
| size        | image_size_t    | isp 处理尺寸                                                                                                                          | \-     | \-     | \-     | 否       |
| frame_rate  | uint32_t        | isp 帧率                                                                                                                              | 120    | 1      | \-     | 否       |
| isp_combine | isp_combine_t   | isp 主从模式                                                                                                                          | \-     | \-     | \-     | 否       |
| algo_state  | uint32_t        | 2A 算法使能                                                                                                                           | 1      | 0      | \-     | 否       |

isp_channel_t

| 名称    | 类型     | 含义                                                         | 最大值 | 最小值 | 默认值 | 是否必选 |
|---------|----------|--------------------------------------------------------------|--------|--------|--------|----------|
| hw_id   | uint32_t | isp 硬件 id                                                    | 1      | 0      | -     | 是       |
| slot_id | uint32_t | isp 内部硬件通道 online 输入时配置0\~3，offline 输入时配置4\~11 | 11     | 0      | 0      | 是       |

image_size_t

| 名称   | 类型     | 含义        | 最大值 | 最小值 | 默认值 | 是否必选 |
|--------|----------|-------------|--------|--------|--------|----------|
| width  | uint32_t | isp 处理宽度 | 4096   | 32     | -     | 是       |
| height | uint32_t | isp 处理高度 | 2160   | 32     | -     | 是       |

isp_ichn_attr_t

| 名称               | 类型         | 含义                              | 最大值 | 最小值 | 默认值 | 是否必选 |
| -------------------- | -------------- | ----------------------------------- | -------- | -------- | -------- | ---------- |
| input_crop_cfg   | crop_cfg_t | 输入裁剪配置                      | -      | -      | -      | 否       |
| in_buf_noclean   | uint32_t    | 输入 buffer 是否做 cache clean       | 1      | 0      | -      | 否       |
| in_buf_noncached | uint32_t    | 输入 buffer 是否分配为 non cache 内存 | 1      | 0      | -      | 否       |

crop_cfg_t

| 名称   | 类型           | 含义         | 最大值 | 最小值 | 默认值 | 是否必选 |
| -------- | ---------------- | -------------- | -------- | -------- | -------- | ---------- |
| rect   | image_rect_t | 输入裁剪尺寸 | -      | -      | -      | 否       |
| enable | HB_BOOL       | 是否是能 crop | 1      | 0      | -      | 否       |

image_rect_t

| 名称   | 类型      | 含义     | 最大值 | 最小值 | 默认值 | 是否必选 |
| -------- | ----------- | ---------- | -------- | -------- | -------- | ---------- |
| x      | uint32_t | x 坐标    | -      | -      | -      | 否       |
| y      | uint32_t | y 坐标    | -      | -      | -      | 否       |
| width  | uint32_t | rect 宽度 | -      | -      | -      | 否       |
| height | uint32_t | rect 高度 | -      | -      | -      | 否       |

isp_ochn_attr_t

| 名称                 | 类型                          | 含义                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 最大值 | 最小值 | 默认值 | 是否必选 |
| ---------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------- | -------- | ---------- |
| stream_output_mode | isp_stream_output_mode_e | 是否 otf 输出：1-enable0-disable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 1      | 0      | 0      | 是       |
| axi_output_mode    | isp_axi_output_mode_e     | ddr 输出类型：AXI_OUTPUT_MODE_DISABLE = 0, | 14     | 0      | 0      | 是       |
|||AXI_OUTPUT_MODE_RGB888 = 1,|||||
|||AXI_OUTPUT_MODE_RAW8 = 2,
|||AXI_OUTPUT_MODE_RAW10 = 3,
|||AXI_OUTPUT_MODE_RAW12 = 4,
|||AXI_OUTPUT_MODE_RAW16 = 5,
|||AXI_OUTPUT_MODE_RAW24 = 6,
|||AXI_OUTPUT_MODE_YUV444 = 7,
|||AXI_OUTPUT_MODE_YUV422 = 8, /* yuv422 */
|||AXI_OUTPUT_MODE_YUV420 = 9, /* yuv420 */
|||AXI_OUTPUT_MODE_IR8 = 10,
|||AXI_OUTPUT_MODE_YUV420_RAW12 = 11,/* yuv420 & raw12*/
|||AXI_OUTPUT_MODE_YUV422_RAW12 = 12,/* yuv422 & raw12 */
|||AXI_OUTPUT_MODE_YUV420_RAW16 = 13, /* yuv420 & raw16 */
|||AXI_OUTPUT_MODE_YUV422_RAW16 = 14, /* yuv422 & raw16 */
| output_crop_cfg    | crop_cfg_t                  | 输出裁剪配置                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | -      | -      | -      | 是       |
| out_buf_noinvalid  | uint32_t                     | 输出 buffer 是否做 cacha invalid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 1      | 0      | 0      | 否       |
| out_buf_noncached  | uint32_t                     | 输出 buffer 是否分配为 non cached                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 1      | 0      | 0      | 否       |
| buf_num             | uint32_t                     | 分配输出 buffer 的个数                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 16     | 3      | 0      | 是       |



**YNR**

ynr_init_attr

| 名称            | 类型          | 含义               | 最大值 | 最小值 | 默认值 | 是否必选 |
|-----------------|---------------|--------------------|--------|--------|--------|----------|
| work_mode       | uint32_t      | ynr 工作模式        | 2      | 1      | \-     | 是       |
|                 |               | 1：Manual 模式      |        |        |        |          |
|                 |               | ，online 链接，     |        |        |        |          |
|                 |               | 前级模块是 sw       |        |        |        |          |
|                 |               | trigger;           |        |        |        |          |
|                 |               | 2：单路 Online      |        |        |        |          |
|                 |               | （前级 PYM 硬件      |        |        |        |          |
|                 |               | 直连）模式；       |        |        |        |          |
| slot_id         | uint32_t      | ynr 硬件通道 id      | 7      | 0      | \-     | 是       |
| width           | uint32_t      | ynr 处理宽度        | 2048   | 32     |        | 是       |
| height          | uint32_t      | ynr 处理高度        | 2048   | 32     |        | 是       |
| nr_static_switch| uint32_t      | nr3den\<\<1\|nr2d_en |        |        |        |          |
| in_stride       | uint32_t      | y stride 和 uv stride|        |        |        | 是       |
| nr2d_en         | uint32_t      | 2dnr 使能           | 1      | 0      |        | 是       |
| nr3d_en         | uint32_t      | 3dnr 使能           | 1      | 0      |        | 是       |
| dma_output_en   | uint32_t      | dma 输出使能        | 1      | 0      |        | 是       |
|                 |               | 如果使能3dnr，需   |        |        |        |          |
|                 |               | 要使能 dma 输出      |        |        |        |          |
| debug_en        | uint32_t      | 是否打开 debug 调试  | 1      | 0      |        | 否       |

hobot_ynr_channel_input_config

 |名称              |类型        |含义          |最大值  | 最小值  | 默认值  | 是否必选  |
 |----------------- |----------- |------------- |--------| --------| --------| ----------|
 |ch\_img\_width    |uint32\_t   |ynr 输入宽度   |4096    | 32      | \-      | 是        |
 |ch\_img\_height   |uint32\_t   |ynr 输入高度   |2160    | 32      | \-      | 是        |

hobot_ynr_channel_output_config

  |名称                           | 类型       | 含义                    | 最大值  | 最小值  | 默认值  | 是否必选  |
  |-------------------------------| -----------| ------------------------| --------| --------| --------| ----------|
  |ch\_nr3d\_pix\_out\_dma\_byps  | uint32\_t  | dma 输出数，建议配置为0  | 4096    | 32      | \-      | 是        |
  |ch\_nr3d\_debug\_en            | uint32\_t  | debug 开关，建议配置为0  | 1       | 0       | \-      | 是        |


**PYM**

roi_box_t

| 名称          | 类型     | 含义                          | 最大值                                                                                                   | 最小值                                                                     | 默认值                                                   | 是否必选 |
|---------------|----------|-------------------------------|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|----------------------------------------------------------|----------|
| start_top     | uint32_t | 从原始图像中截取图像的 Y 轴位置 | ds 层：\<= region_height bl 层：\<= bl_base_height bl_base_height = region_width \>\> (ds_roi_layer + 1) | ds 层：\>= region_height - out_height bl 层：\>= bl_base_height - out_height | \-                                                       | 是       |
| start_left    | uint32_t | 从原始图像中截取图像的 X 轴位置 | ds 层：\<= region_width bl 层：\<= bl_base_width bl_base_width = region_width \>\> (ds_roi_layer + 1)      | ds 层：\>= region_width - out_width bl 层：\>= bl_base_width - out_width     | \-                                                       | 是       |
| region_width  | uint32_t | 截取图像的宽度                | \-                                                                                                       | \-                                                                         | \-                                                       | 是       |
| region_height | uint32_t | 截取图像的高度                | \-                                                                                                       | \-                                                                         | \-                                                       | 是       |
| wstride_uv    | uint32_t | 输出的 uv 层 stride              |                                                                                                          |                                                                            | \-                                                       | 是       |
| wstride_y     | uint32_t | 输出的 y 层 stride               | \-                                                                                                       | \-                                                                         | \-                                                       | 是       |
| vstride       | uint32_t | 高度 stride，隐藏参数，不建议配置                 | \-                                                                                                       | \-                                                                         | out_height                                               | 是       |
| step_v        | uint32_t |                               | \-                                                                                                       | \-                                                                         | (1 \<\< 16) \* (out_height - region_height) / out_height | 否       |
| step_h        | uint32_t |                               | \-                                                                                                       | \-                                                                         | (1 \<\< 16) \* (out_width - region_width) / out_width    | 否·      |
| out_width     | uint32_t | 输出图像的宽度                | \-                                                                                                       | \-                                                                         | \-                                                       | 是       |
| out_height    | uint32_t | 输出图像的高度                | \-                                                                                                       | \-                                                                         | \-                                                       | 是       |
| phase_y_v     | uint32_t |                               |                                                                                                          |                                                                            | 0                                                        | 否       |
| phase_y_h     | uint32_t |                               |                                                                                                          |                                                                            | 0                                                        | 否       |

chn_ctrl_t

| 名称                     | 类型      | 含义                                    | 最大值                    | 最小值                | 默认值 | 是否必选 |
|--------------------------|-----------|-----------------------------------------|---------------------------|-----------------------|--------|----------|
| pixel_num_before_sol     | uint32_t  |                                         | \-                        | \-                    | 2      | 是       |
| invalid_head_lines       | uint32_t  |                                         | \-                        | \-                    | \-     | 否       |
| src_in_width             | uint32_t  | 输入宽度，且2对齐                       | \< 4096                   | \> 32                 | \-     | 是       |
| src_in_height            | uint32_t  | 输入高度，且2对齐                       | \< 4096                   | \> 32                 | \-     | 是       |
| src_in_stride_y          | uint32_t  | 输入 y plane stride, 且16对齐            | \< 4096                   | \> src_in_width       | \-     | 是       |
| src_in_stride_uv         | uint32_t  | 输入 uv stride，且16对齐                 | \< 4096                   | \> src_in_width       | \-     | 是       |
| suffix_hb_val            | uint32_t  |                                         | \<= 152                   | \>= 16                | 100    | 是       |
| prefix_hb_val            | uint32_t  |                                         | \<= 2                     | \>= 0                 | 2      | 是       |
| suffix_vb_val            | uint32_t  |                                         | \<= 20                    | \>= 0                 | 10     | 是       |
| prefix_vb_val            | uint32_t  |                                         | \<= 2                     | \>= 0                 | 0      | 是       |
| bl_max_layer_en          | uint8_t   | 选择 bl 层时，使能 bl 层数                  |                           | \> ds_roi_layer[chn]  | 5      | 是       |
| ds_roi_en                | uint8_t   | ds 层输出使能，总共6层，按 bit 位使能      | \< (1 \<\< 6)             | \-                    | \-     | 是       |
| ds_roi_uv_bypass         | uint8_t   | ds 层 uv plane 输出 bypass 使能，按 bit 位使能 | \< (1 \<\< 6)             | \-                    | \-     | 否       |
| ds_roi_sel[MAX_DS_NUM]   | uint8_t   | 图层选择，0 src 层；1 bl 层               | \< 3                      | \-                    | \-     | 是       |
| ds_roi_layer[MAX_DS_NUM] | uint8_t   |                                         | ds_roi_sel = 0时, 只能为0 | \-                    | \-     | 是       |
| ds_roi_info[MAX_DS_NUM]  | roi_box_t | ds 层配置                                | \-                        | \-                    | \-     | 是       |

pym_cfg_t

| 名称                 | 类型       | 含义                                                                                                                                                 | 最大值    | 最小值 | 默认值 | 是否必选 |
|----------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|--------|--------|----------|
| hw_id                | uint8_t    | pym 硬件模块 id (0, 1 , 4)                                                                                                                            | \-        | \-     | \-     | 是       |
| pym_mode             | uint8_t    | pym 工作模式 *1*：Manual 模式，online 链接，前级模块是 sw trigger； 2：单路 Online（前级-PYM 硬件直连）模式； 3：离线模式（输入:YUV420SP，输出:YUV420SP） | \<= 3     | \>= 1  | \-     | 是       |
| slot_id              | uint8_t    | pym 硬件通道 id                                                                                                                                       | 7         | 0      | \-     | 否       |
| out_buf_noinvalid    | uint8_t    | 模块输出 buf 内部是否会执行 invaild cache 操作                                                                                                           | 1         | 0      | 1      | 是       |
| out_buf_noncached    | uint8_t    | 模块输出 buf 是否使能 non-cache 内存分配                                                                                                                 | 1         | 0      | \-     | 否       |
| in_buf_noclean       | uint8_t    | 输入 buf 是否做 cache clean                                                                                                                             | 1         | 0      | 1      | 是       |
| in_buf_noncached     | uint8_t    | 模块输入 buf（一般回灌 buf）是否使能 non-cache 内存分配                                                                                                  | 1         | 0      | \-     | 否       |
| buf_consecutive      | uint8_t    | 内存是否连续                                                                                                                                         | 1         | 0      | \-     | 否       |
| pingpong_ring        | uint8_t    | 是否开启乒乓 buffer                                                                                                                                   |           |        | \-     | 否       |
| output_buf_num       | uint32_t   | 输出 buf 数目，当 PYM 离线模式时，回灌 buf 数目按照该数目默认分配                                                                                          | \<= 64    | 0      | \-     | 是       |
| timeout              | uint32_t   | 超时时间                                                                                                                                             | \<= 10000 |        | \-     | 否       |
| threshold_time       | uint32_t   |                                                                                                                                                      |           |        | \-     | 否       |
| layer_num_trans_next | int32_t    | 传输到后级模块的层数                                                                                                                                 | \< 6      | \-     | \-1    | 是       |
| layer_num_share_prev | int32_t    |                                                                                                                                                      | \< 6      | \-     | \-1    | 是       |
| chn_ctrl             | chn_ctrl_t | 设置输入输出格式大小                                                                                                                                 |           |        |        |          |
| fb_buf_num           | uint32_t   | 回灌 buffer 个数                                                                                                                                       | \<= 16    | \-     | 2      | 是       |
| reserved[6]          | uint32_t   | 保留位置                                                                                                                                             | \-        | \-     | \-     | 否       |
| magicNumber          | uint32_t   | 属性结构体校验值，需要填写为固定值 MAGIC_NUM                                                                                                          | \-        | \-     | \-     | 是       |

**GDC**

gdc_cfg_t

| 名称              | 类型     | 含义                                                | 最大值   | 最小值 | 默认值 | 是否必选 |
|-------------------|----------|-----------------------------------------------------|----------|--------|--------|----------|
| input_width       | uint32_t | 输入图像宽度, 且2对齐                               | \<= 3840 | \>= 96 | \-     | 是       |
| input_height      | uint32_t | 输入图像高度，且2对齐                               | \<= 2160 | \>= 96 | \-     | 是       |
| output_width      | uint32_t | 输出图像宽度                                        | \<= 3840 | \>= 96 | \-     | 是       |
| output_height     | uint32_t | 输出图像高度                                        | \<= 2160 | \>= 96 | \-     | 是       |
| buf_num           | uint32_t | 正常输入 buf 数量                                     | \<= 32   | 0      | 6      | 是       |
| fb_buf_num        | uint32_t | 回灌 buf 数量                                         | \<= 32   | 0      | 2      | 是       |
| in_buf_noclean    | uint32_t | 输入 buf 是否做 cache clean                            | 1        | 0      | 1      | 否       |
| in_buf_noncached  | uint32_t | 模块输入 buf（一般回灌 buf）是否使能 non-cache 内存分配 | \-       | \-     | \-     | 否       |
| out_buf_noinvalid | uint32_t | 模块输出 buf 内部是否会执行 invaild cache 操作          | \-       | \-     | 1      | 否       |
| out_buf_noncached | uint32_t | 模块输出 buf 是否使能 non-cache 内存分配                | \-       | \-     | \-     | 否       |
| gdc_pipeline      | uint32_t |                                                     | \-       | \-     | \-     | 否       |

**STITCH**

stitch_base_attr

| 名称               | 类型            | 含义                    | 最大值 | 最小值 | 默认值 | 是否必选  |
|--------------------|-----------------|-------------------------|--------|--------|--------|-----------|
| mode               | uint32_t        |工作模式                 |        |        |        | 否        |
|                    |                 | 0-外部 buffer 回灌模式    |        |        |        |           |
|                    |                 | 1-内部 buffer 回灌模式    |        |        |        |           |
|                    |                 | 2-flow 绑定模式          |        |        |        |           |
| roi_nums           | uint32_t        | roi 区域个数             | 12     | 1      |        | 是        |
| img_nums           | uint32_t        | 输入图像的数量          | \-     | 1      |        | 是        |
| alpha_lut          | struct          | alpha lookup table      |        |        |        | 否        |
|                    | lut_attr        |                         |        |        |        |           |
| beta_lut           | struct          | beta lookup table       |        |        |        | 否        |
|                    | lut_attr        |                         |        |        |        |           |
| blending           | struct          | 融合属性                |        |        |        | 是        |
|                    | blending_attr   |                         |        |        |        |           |

lut_attr

| 名称    | 类型    | 含义                      | 最大值 | 最小值 | 默认值 |是否必选 |
|---------|---------|---------------------------|--------|--------|--------|---------|
| share_id| int32_t | hbmem buffer 的 shareid     |        |        |        |         |
|         |         | 存放 lut buffer 需要        |        |        |        |         |
|         |         | 通过 hbmem 申请             |        |        |        |         |
| vaddr   | uint64_t| lut 虚拟地址               |        |        |        | 否      |
| offset  | uint64_t| 偏移                      |        |        |        | 否      |
| size    | uint64_t| 大小                      |        |        |        | 否      |

blending_attr

| 名称           | 类型      | 含义                                                | 最大值 | 最小值 | 默认值 |是否必选 |
|----------------|-----------|-----------------------------------------------------|--------|--------|--------|---------|
| roi_index      | uint32_t  | roi 索引                                             |        |        |        | 是      |
| blending_mode  | uint32_t  | 融合模式：                                          |        |        |        | 是      |
|                |           | BLENDING_MODE_ONLINE = 0, //online mode             |        |        |        |         |
|                |           | BLENDING_MODE_ALPHA = 1, //alpha mode               |        |        |        |         |
|                |           | BLENDING_MODE_ALPH = 2, //alpha beda mode           |        |        |        |         |
|                |           | BLENDING_MODE_SRC = 3, //src copy mode              |        |        |        |         |
|                |           | BLENDING_MODE_ALPHA_SRC = 5 //arpha src0 mode       |        |        |        |         |
| direct         | uint32_t  | 融合方向：                                          |        |        |        | 是      |
|                |           | BLENDING_DIRECT_LT = 0, //left and top direct       |        |        |        |         |
|                |           | BLENDING_DIRECT_RB = 1, //right and bottom direct   |        |        |        |         |
|                |           | BLENDING_DIRECT_LB = 2, //left and bottom direct    |        |        |        |         |
|                |           | BLENDING_DIRECT_RT = 3, //right and top direct      |        |        |        |         |
| uv_en          | uint32_t  | 输入图像是否包含 uv                                  |        |        |        | 是      |
| src0_index     | uint32_t  | src0对应输源                                        |        |        |        | 是      |
| src1_index     | uint32_t  | src1对应输源                                        |        |        |        | 是      |
| margin         | uint32_t  | 可选参数，可不配置                                  |        |        |        | 否      |
| margin_inv     | uint32_t  | 可选参数，可不配置                                  |        |        |        | 否      |
| gain_src0_yuv  | uint32_t  | 固定256 //0:y 1:u 2:v                               |        |        |        | 是      |
| gain_src1_yuv  | uint32_t  | 固定256 //0:y 1:u 2:v                               |        |        |        | 是      |

roi_info

  |名称        | 类型       | 含义       | 最大值   |最小值   |默认值   |是否必选  |
  |------------| -----------| -----------| -------- |-------- |-------- |----------|
  |roi_index   |uint32\_t   |roi 索引     |          |         |         |是        |
  |roi_x       |uint32\_t   |坐标起始 x   |          |         |         |是        |
  |roi_y       |uint32\_t   |坐标起始 y   |          |         |         |是        |
  |roi_w       |uint32\_t   |宽度        |          |         |         |是        |
  |roi_h       |uint32\_t   |高度        |          |         |         |是        |

stitch_ch_attr

  |名称                            | 类型              | 含义          | 最大值  | 最小值  | 默认值  | 是否必选  |
  |--------------------------------| ------------------| --------------| --------| --------| --------| ----------|
  |width                           | uint32\_t         | 输入或输出宽  |         |         |         | 是        |
  |height                          | uint32\_t         | 输入或输出高  |         |         |         | 是        |
  |strid\[MAX\_STH\_FRAME\_PLAN\]  | uint32\_t         | stride        |         |         |         | 是        |
  |rois\[MAX\_STH\_ROI\_NUMS\]     | struct roi\_info  | roi 区域描述   |         |         |         | 是        |


### 通道绑定说明

| 模块 | 输出通道编号 | 通道功能                            |
|------|--------------|-------------------------------------|
| VIN  | 0            | offline 通道，输出 camera 帧到 ddr      |
|      | 1            | online 通道，连接到 isp 或 pym          |
| ISP  | 0            | offline 通道，输出 isp 处理后的帧到 ddr |
|      | 1            | online 通道，连接到 pym or ynr        |
| YNR  | 1            | online 通道，连接到 pym               |
| PYM  | 0            | offline 通道，输出 pym 图像至 ddr       |
| GDC  | 0            | offline 通道，输出 gdc 处理后的帧到 ddr |

online 表示硬件直连，offline 表示输出至 ddr 缓存

### SLOT_ID 与调试模式说明

1. ISP 的 slot_id 参数用来选择 isp 的硬件 context，cim 直连 isp 场景，slot_id 可以选择0\~3，cim-ddr-isp 模式下，slot_id 可以选择为4\~11，不同路需要选择不同的 slot_id；在 isp-online-ynr-online-pym 或者 isp-online-pym 场景下，ynr 与 pym 的 slot_id 需要配置与 isp 的 slot_id 一致。
2. PYM 的 sched_mode 参数用来选择 isp 的调度模式，在 cim-isp 硬件直连的场景下选择2 passthrough 模式，在其他场景下选择1 manual 模式；在 isp-online-ynr-online-pym 或者 isp-online-pym 场景下，ynr 的 work_mode、pym 的 pym_mode 需要和 isp 的 sched_mode 保持一致。

### 返回值说明

| 错误码 | 宏定义                           | 描述                                         |
|--------|----------------------------------|----------------------------------------------|
| 0      | HBN_STATUS_SUCESS                | 成功                                         |
| 1      | HBN_STATUS_INVALID_NODE          | vnode 无效，找不到对应的 vnode                 |
| 2      | HBN_STATUS_INVALID_NODETYPE      | vnode 类型无效，找不到对应的 vnode             |
| 3      | HBN_STATUS_INVALID_HWID          | 无效的硬件模块 id                             |
| 4      | HBN_STATUS_INVALID_CTXID         | 无效的 context id                             |
| 5      | HBN_STATUS_INVALID_OCHNID        | 无效的输出通道 id                             |
| 6      | HBN_STATUS_INVALID_ICHNID        | 无效的输入通道 id                             |
| 7      | HBN_STATUS_INVALID_FORMAT        | 无效的格式                                   |
| 8      | HBN_STATUS_INVALID_NULL_PTR      | 空指针                                       |
| 9      | HBN_STATUS_INVALID_PARAMETER     | 无效的参数，版本检查失败                     |
| 10     | HBN_STATUS_ILLEGAL_ATTR          | 无效的参数                                   |
| 11     | HBN_STATUS_INVALID_FLOW          | 无效的 flow，找不到对应的 flow                 |
| 12     | HBN_STATUS_FLOW_EXIST            | flow 已经存在                                 |
| 13     | HBN_STATUS_FLOW_UNEXIST          | flow 不存在                                   |
| 14     | HBN_STATUS_NODE_EXIST            | node 已经存在                                 |
| 15     | HBN_STATUS_NODE_UNEXIST          | node 不存在                                   |
| 16     | HBN_STATUS_NOT_CONFIG            | 预留                                         |
| 17     | HBN_STATUS_CHN_NOT_ENABLED       | 通道未使能                                   |
| 18     | HBN_STATUS_CHN_ALREADY_ENABLED   | 通道已使能                                   |
| 19     | HBN_STATUS_ALREADY_BINDED        | node 已经绑定                                 |
| 20     | HBN_STATUS_NOT_BINDED            | node 未绑定                                   |
| 21     | HBN_STATUS_TIMEOUT               | 超时                                         |
| 22     | HBN_STATUS_NOT_INITIALIZED       | 未初始化                                     |
| 23     | HBN_STATUS_NOT_SUPPORT           | 通道不支持或未激活                           |
| 24     | HBN_STATUS_NOT_PERM              | 操作不允许                                   |
| 25     | HBN_STATUS_NOMEM                 | 内存不足                                     |
| 26     | HBN_STATUS_INVALID_VNODE_FD      | 无效的 node 文件描述符                         |
| 27     | HBN_STATUS_INVALID_ICHNID_FD     | 无效的输入通道文件描述符                     |
| 28     | HBN_STATUS_INVALID_OCHNID_FD     | 无效的输出通道文件描述符                     |
| 29     | HBN_STATUS_OPEN_OCHN_FAIL        | 打开输出通道失败                             |
| 30     | HBN_STATUS_OPEN_ICHN_FAIL        | 打开输入通道失败                             |
| 31     | HBN_STATUS_JSON_PARSE_FAIL       | json 解析失败                                 |
| 32     | HBN_STATUS_REQ_BUF_FAIL          | 请求 buffer 失败                               |
| 33     | HBN_STATUS_QUERY_BUF_FAIL        | 查询 buffer 信息失败                           |
| 34     | HBN_STATUS_SET_CONTROL_FAIL      | 模块控制、调节 参数（如 ISP 效果参数）设置失败 |
| 35     | HBN_STATUS_GET_CONTROL_FAIL      | 模块控制、调节 参数（如 ISP 效果参数）获取失败 |
| 36     | HBN_STATUS_NODE_START_FAIL       | node 开启失败                                 |
| 37     | HBN_STATUS_NODE_STOP_FAIL        | node 停止失败                                 |
| 38     | HBN_STATUS_NODE_POLL_ERROR       | node 通道 poll 错误                             |
| 39     | HBN_STATUS_NODE_POLL_TIMEOUT     | node 通道 poll 超时                             |
| 40     | HBN_STATUS_NODE_POLL_FRAME_DROP  | node 通道 poll 时发生丢帧                       |
| 41     | HBN_STATUS_NODE_POLL_HUP         | node 通道 poll 时描述符挂起                     |
| 42     | HBN_STATUS_NODE_ILLEGAL_EVENT    | node 通道 poll 时事件非法                       |
| 43     | HBN_STATUS_NODE_DEQUE_ERROR      | node 通道 dequeue buffer 错误                   |
| 44     | HBN_STATUS_ILLEGAL_BUF_INDEX     | 无效的 buffer 索引                             |
| 45     | HBN_STATUS_NODE_QUE_ERROR        | node 通道 queue buffer 错误                     |
| 46     | HBN_STATUS_FLUSH_FRAME_ERROR     | node 通道帧 flush 错误                          |
| 47     | HBN_STATUS_INIT_BIND_ERROR       | 用 json 解析并绑定时发生错误                   |
| 48     | HBN_STATUS_ADD_NODE_FAIL         | 向 flow 中添加 node 失败                         |
| 49     | HBN_STATUS_WRONG_CONFIG_ID       | 系统不支持的 node id                          |
| 50     | HBN_STATUS_BIND_NODE_FAIL        | flow 绑定 node 时发生错误                       |
| 51     | HBN_STATUS_INVALID_VERSION       | 底层驱动模块和上层 库版本号不匹配错误        |
| 52     | HBN_STATUS_GET_VERSION_ERROR     | 获取底层驱动模块版本号错误                   |
| 53     | HBN_STATUS_MEM_INIT_FAIL         | hbmem 内存初始化失败                          |
| 54     | HBN_STATUS_MEM_IMPORT_FAIL       | hbmem 内存引入失败                            |
| 55     | HBN_STATUS_MEM_FREE_FAIL         | hbmem 内存释放失败                            |
| 56     | HBN_STATUS_SYSFS_OPEN_FAIL       | 系统文件打开失败                             |
| 57     | HBN_STATUS_STRUCT_SIZE_NOT_MATCH | hal 层结构体大小与 kernel 层不匹配              |
| 58     | HBN_STATUS_RGN_UNEXIST           | 获取不到对应的 rgn 数据                        |
| 59     | HBN_STATUS_RGN_INVALID_OPERATION | rgn 操作无效                                  |
| 60     | HBN_STATUS_RGN_OPEN_FILE_FAIL    | rgn 模块打开文件失败                          |
| 128    | HBN_STATUS_ERR_UNKNOW            | 未知错误                                     |


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
S100:
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

S600:
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

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch0.png" alt="" style={{ width: '100%' }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch1.png" alt="" style={{ width: '100%' }} />

前视图原图及经过 gdc 处理后的输出

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch2.png" alt="" style={{ width: '100%' }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch3.png" alt="" style={{ width: '100%' }} />

左视图原图及经过 gdc 处理后的输出

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch4.png" alt="" style={{ width: '100%' }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch5.png" alt="" style={{ width: '100%' }} />

右视图原图及经过 gdc 处理后的输出

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch6.png" alt="" style={{ width: '100%' }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch7.png" alt="" style={{ width: '100%' }} />

最终 stitch 拼接输出图像：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch8.png" alt="" style={{ width: '100%' }} />

对应 stitch 的 ROI 区域划分：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch9.png" alt="" style={{ width: '100%' }} />

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

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sth_codec_2025-06-24_20-37-19.png" alt="" style={{ width: '100%' }} />


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
