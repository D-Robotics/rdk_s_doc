---
sidebar_position: 1
title: "Camera 接入背景知识"
description: "Camera 接入背景：系统架构、Sensor、SerDes、MIPI-CSI/RX、CIM、曝光同步"
---

# Camera 接入背景知识

在进行 Sensor 调试前，需一定的知识基础，首先要对 SoC 的图像处理子系统及 Camera 内各模块有一定的概念认知。此处简要梳理需要初步了解的背景知识以供参考，便于接入调试工作进行。若已对相关背景知识了解，请直接查看下一章节。

## 系统架构

SoC 的 Sensor 接入属于图像处理子系统中的 Camera 部分，Camera 部分主要包括 SENSOR、DESERIAL、POC、TXSER，系统结构及框架说明见 [视频输入 - Camera](/Advanced_development/multimedia_development/multimedia_api/camera_api#框架)。

系统框架如下：

![系统架构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image11.png)

用户层封装为 libcam，驱动层由各子模块驱动实现，代码位于 `hobot-drivers/camsys`。libcam 内有多个 so 库用于灵活适配多种 Sensor 接入场景：

- `libcam.so`：主体驱动库，封装了 sensor/deserial/poc/txser/gpio/i2c 等公共模块与架构逻辑。
- `lib<sensor>.so`：sensor 驱动库，各 sensor 模组差异化的标准实现，由 `libcam.so` 配置调用。
- `lib<serdes>.so`：serdes 驱动库，各 sensor 所用 serdes 的标准实现，由 `libcam.so` 配置调用。
- `lib_<calib>.so`：sensor 效果库，由 tuning 调试根据 json 生成，由 libcam 配置被 isp 库调用。

:::tip
本调试文档主要用于新 Sensor 接入调试，因此主要关注 sensor libs。需要完成一个 `lib<sensor>.so` 的编写与调试，一般有 2 个源码文件：
- `hobot-camera/drivers/sensor/<sensor>/*.c`：sensor 驱动库主体，生成 `lib<sensor>.so`。
- `hobot-camera/drivers/sensor/<sensor>/inc/*.h`：sensor 驱动库配置序列。
:::

:::tip
调试接入工作主要就是实现一个标准 sensor 库，嵌入到上述流程中被调用，实现接入。
:::

## Sensor

### Camera 结构

以下为一个典型 SerDes 模组的简单结构：

![模组结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image45.png)

主要组成部分：

- **Lens**：模组镜头，直接影响光成像效果，根据场景不同有长焦、广角等各类镜头。
- **Sensor**：图像传感器，模组内核心模块，用于将光信号转换为电信号采集图像信息。
- **ISP**：图像信号处理器，可选模块。SoC 内置 ISP，可直接接入 RAW 类型模组处理，不需 Camera 内置 ISP；若使用内置 ISP 的模组，其输出数据为 YUV，也可直接接入后不经 SoC 内置 ISP 直接使用。
- **SER（Serializers）**：加串器，SerDes 场景下由于模组与 SoC 间有较长距离，因此需 SerDes 转换后输出。
- **COAX**：同轴电缆接口，为方便远距离连接，SerDes 一般使用 COAX 作为物理连接通路。

:::tip 关于模组供电 POC（Power Over COAX）
由于模组远离 SoC 与核心硬件，其供电一般也直接使用 COAX 提供，即：
- 电源从 DES（Deserializers）侧硬件向模组侧供电。
- 模组数据通过 COAX 向后传输：模组侧 SER 调制后输出，再由 DES 解析。
:::

### FOV

模组 Lens 镜头的位置与形状会影响 Sensor 的可视角：

- Sensor 尺寸越大，允许的可视角越大。
- 可视角越大，焦距越短。

![FOV](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image53.png)

模组的 Fov 参数对接入调试无影响，但对效果有影响，接入时需确认模组 Fov 信息。

### Sensor 参数

Sensor 本义为传感器，并不专指图像传感器（Image Sensor）。在 Camera 子系统中，Camera 一般指成型的模组，Camera 模组内主要组成为 Image Sensor。为描述方便，由 Sensor 专指 Camera 模组内的 Image Sensor。

![Sensor](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image62.png)

Sensor 的成像原理简单描述如下：

![成像原理](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image75.png)

- 光源射入传感器前，有一层 Filter layer 滤光，使其底下的传感器只反应该类光的强度。
- 如上 sensor array 传感器的采样值直接输出，即为 RAW data。因此不同的 Filter 阵列排布直接影响对 RAW 数据的采集与处理，见下 bayer pattern。

### bayer pattern

- 根据 Sensor 硬件设计的 CFA 差异，其分为不同的 bayer pattern：CCCC / RGGB / RCCB / RCCC / RBGIR 等。
- 该 bayer pattern 对 ISP 处理成像十分重要，需从硬件信息获取并正确配置，否则会颜色异常。

:::note
上述基于 RGB 三色的 Filter layer 只是 CFA 中常用的一种，并非唯一。
:::

### 分辨率

分辨率是 Sensor 最主要关注的参数指标，为采集后可输出像素点数量。该参数直接影响输出图像的清晰度，同时也影响数据传输带宽，常用分辨率：3840x2160（8.3M pixel）、1920x1080（2M pixel）。

### 帧率

帧率即 1s 内出帧数，常用帧率 30fps。

### 数据类型

主要根据 Camera 输出数据的格式定义，直接关系到调试接入的 SerDes 配置及 pipeline 的处理流程，一般根据 Camera 内是否内置 ISP 分为 2 类：

| 数据类型 | 内置 ISP | 类型                         | 使用 SoC ISP | 是否 tuning 适配 | 备注         |
| -------- | -------- | ---------------------------- | ------------ | ---------------- | ------------ |
| RAW      | 否       | RAW8/RAW10/RAW12/RAW14/RAW16 | 是           | 是               | pattern 差异 |
| YUV      | 是       | YUV422 8-bit                 | 否           | 否               | UYVY         |

上述数据类型主要引用于 MIPI 协议定义。

:::note
RAW 类型模组接入工作除数据接入外，还有 tuning 适配工作，配合 tuning 完成 ISP 调试。YUV 类型模组接入相对简单，但需注意其字节序，只支持 UYVY（或 swap 的 YUYV）。
:::

### 数据宽度

主要指 Sensor 输出的每个 pixel 所占的数据位数：RAW8/RAW10/RAW12/RAW14/RAW16 为 8/10/12/14/16；YUV422 8-bit 为 16。

:::note
Sensor 的 RAW 输出实际就是阵列采集的原始采样值，因此其采样位宽即为 bayer data width，如为 12 即指每个传感器采样范围为 0~4095。但一般所指的 RAW12 只是 MIPI 传输协议上的 RAW 12bit 格式，Sensor 采样输出的 RAW data 未必就是 12bit，此间可能有多道转换，需明确其中差异。
:::

### 数据带宽

数据带宽用于描述传输所有图像数据所需的总线带宽，计算方式：`有效数据带宽 = 像素宽(pixel) × 像素高(line) × 像素数据宽度(bit) × 帧率(fps)`。如 3840x2160 RAW12 30fps：`bandwidth = 3840 × 2160 × 12 × 30 = 2.99 Gbps`。基于此，要求数据通路上各链路都满足该带宽要求（注意还需一定裕量）。

:::note
一般在方案阶段就要进行数据带宽是否满足的确认：
- 单路：`bandwidth = width(pixels) * height(lines) * width(bits/pixel) * fps`。
- 多路：`bandall = bandwidth * channel_num`。
- LINK 速率需满足（大于单路带宽加裕量）：`LinkSpeed >= bandwidth * 1.x`。
- MIPI 速率需满足（总带宽 ×1.2~1.3）：`mipiclk >= bandall * 1.2`（或 1.3）。
:::

### 曝光

一个像点的曝光读出过程：

![像点曝光](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image84.png)

sensor 像点电荷清零，之后开始曝光积累电荷，等待曝光结束后准备读取；将像点放大器输出选择连接到 AD 转换，获取 RAW 值。

**Rolling shutter 曝光**：该方式为 CMOS Sensor 典型的曝光方式，其曝光读出过程如下：

![Rolling shutter](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image93.png)

主要有 2 个时间节点：

- **Row Reset**：清零一行像素，开始曝光（积累电荷）。
- **Row Read**：读出一行像素，开始输出 RAW 数据（如通过 MIPI 发出数据行）。

由上述 2 个时间节点可导出 Sensor 的时间信息：

- **曝光（积分）时间**：Row Reset 到 Row Read 的时间，单位为行数。
- **有效数据 Vact 时间**：首行 Row Read（FS）到末行 Row Read（FE）的时间，可从 MIPI 测量。
- **空行 Vblank 时间**：上帧末行 Row Read 到本帧首行 Row Read 的时间，与 Vact 可计算帧率。

### 读出顺序

Sensor 有默认的 RAW 数据读取顺序，该顺序决定输出图像的方向：

![读出顺序](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image103.png)

一般 Sensor 对该读出方向可配置，可用于输出图像上下/左右翻转，适配不同安装场景。

### HDR

本处 HDR（High Dynamic Range）专指图像采集的 Multi-exposure HDR，是一种对同一物体进行多种不同曝光场景的采集与融合处理的技术。大部分 Sensor 都支持 HDR 多曝模式，可采集不同曝光时长的图像数据输出，最后由 ISP 融合处理后获得一帧亮度适合、细节充分的 HDR 图像：

- 短曝光图像（短帧）重点采集亮部信息。
- 长曝光图像（长帧）重点采集暗部信息。
- 经过一定算法融合处理后，同时还原亮部与暗部信息。

![HDR](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image119.png)

HDR 需 Sensor 输出不同曝光的图像数据，其输出方式也有不同选择：

- 直接将不同曝光的采样数据通过不同 VC 通道输出：数据完整，带宽高。
- Sensor 内嵌线性化功能，可将多曝数据线性化后从 1 个 VC 输出：数据部分损失，带宽低。

由于 HDR 数据线性化后更省带宽，可获得更高帧率，因此一般采用线性化压缩方式的 HDR，该方式要求 ISP 具有线性化反解功能：

![线性化](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image125.png)

上图中将 4 个曝光的 12bit 采样值线性化后压缩为一个 24bit 的数据。该 24bit 还不是最终直接输出的数据，还可以继续压缩转换，见下 COMPANDING。

:::note
Camera 内使用 sensor_mode 定义 Sensor 的 HDR 工作模式：
- 只采样 1 种曝光输出的非 HDR 模式：`NORMAL_M`。
- 通过多路 VC 直接输出不同曝光数据的 HDR 模式：`DOL2_M`/`DOL3_M`/`DOL4_M`。
- 将不同曝光数据线性化（并 PWL 压缩）之后再从 1 路输出的 HDR 模式：`PWL_M`。
:::

### COMPANDING

对于上述 HDR 的 PWL 输出，虽然已将多曝数据线性化后为 24bit（示例），但对于传输仍需占用大量带宽，为降低带宽需求，对该数据进行压缩处理，称之为 COMPANDING。该压缩方式通过一组曲线拐点定义的 PWL（piece-wise linear）曲线实现：

![COMPANDING 曲线](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image134.png)

该转换曲线由 LUT（look-up table）定义，其由一组拐点组成，如下 20-12 的 LUT：

![LUT](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image144.png)

Sensor 内有寄存器可配置该 LUT 表。使能 COMPANDING 后，Sensor 将使用该 LUT 表自动压缩计算后输出，如 20bit->12bit，之后可用 MIPI 的 RAW12 传输该压缩后的 12bit 数据。在 ISP 处理时也需该对应的 LUT 表（必须一致）进行反解，获得压缩前的数据（有一定损失）。

:::tip
对于高分辨率且要求较高帧率的场景，尤其是使用 HDR 模式，使用 PWL 压缩方式十分有必要，但要注意上述几处转换前后的数据位宽区别。
:::

### AE

AE（Auto Exposure）即自动曝光，是相机可根据外界光线的强弱进行自动调整曝光量和增益、防止曝光过度或者不足的一种机制。由于当前帧的感光信息只有在收取分析后才能获得，之后据此调节 Sensor 的曝光参数以趋近期望亮度，如此循环反馈，实现自动曝光调节。

在 SoC 上的实现主要指 SoC 的 ISP 统计亮度信息，之后计算曝光参数，下发给 Sensor 驱动，其根据点亮配置得到寄存器值写入模组内生效，每帧循环往复。对于 AE 控制，Sensor 有多种手段：

- **光圈**：调节光圈大小可控制进光量，但通常 AUTO 场景使用固定光圈的模组。
- **曝光时间**：曝光时间可影响累积电荷，从而达到调节曝光的目的。
- **调节增益**：Sensor 采集原理是累积电荷通过放大器再经 AD 转换实现，因此有：
  - 模拟增益 AGAIN：调节模拟放大器增益系数，一般引入噪声较小，优先使用。
  - 数字增益 DGAIN：数字增益一般精度可较高，主要做辅助调节使用。

:::note
接入调试 RAW 类型的 Camera，需要做 Tuning 适配，为 Sensor 增加 AE 控制功能。
:::

### AWB

AWB（Auto White Balance）即自动白平衡，其主要作用是降低外界光源对物体真实颜色的影响（如低色温光源下白色物体偏红，高色温光源下白色物体偏蓝），理想状态是在任何光源下白色物体都呈现出真正的白色。AWB 的实现方式是 ISP 通过分析图像的 WB 信息，通过白平衡算法，调整 R/G/B 三色通道的增益，实现白平衡。

:::note
接入调试 RAW 类型的 Camera，也需做 AWB 的 Tuning 适配。
:::

### TEST PATTERN

一般 Sensor 都有 Test Pattern 模式支持，该模式下 Sensor 按预定的数据进行输出，不依赖所处的场景与实际拍图，一般有 Color Bar 或灰度图等方式：

![Test Pattern](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image153.png)

该功能主要用于验证 MIPI 等输出通路是否正常，或其他测试使用。一般生产测试可能需要该模式支持，由于其输出固定，可使用图像对比或 md5sum 确认通路是否正常，接入调试时建议增加适配支持。

## SerDes

SerDes 为 SER（Serializer）与 DES（Deserializer）的合称，此处专指 Camera-SoC 通路上使用的图像数据加串器/解串器。以下为 Maxim 的 GMSL 类型 SerDes 结构：

![SerDes 结构](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image163.png)

SerDes 在系统中的结构示意：

![SerDes 系统示意](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image17.png)

**SER（Serializers）的主要功能**：

- 连接 I2C 到 Sensor，并支持 map 新地址访问（以支持多颗同类 Sensor 场景）。
- 接收 Sensor 的图像数据（一般为 MIPI-CSI），并加串后通过 Link 协议送出。
- 连接 Sensor 的部分功能 IO，可实现 GPIO 映射到 DES，实现 RESET/FSYNC 等功能。
- 对于部分 Camera，SER 还需提供 MCLK 输出给 Sensor 使用。

**DES（Deserializers）的主要功能**：

- 接收并解析 Link 协议上传来的图像数据，并通过 MIPI-CSI 转出发送给 SoC。
- 支持多 Sensor 接入，可重新 map 新的 VC 组合输出多路图像。
- 连接 I2C 到 SoC，与 SER 构建控制通道，支持 SoC 直接 I2C 地址访问 DES/SER/Sensor。
- 连接 SoC 的 LPWM 及 GPIO，与 SER 构建 GPIO 通道，支持将 SoC 与 Sensor 间 GPIO 互连。

:::note
SerDes 间的 Link 通信协议为各 SerDes 厂家自定协议标准，一般不通用，如 TI 使用 FPD-Link，Maxim 使用 GMSL。因此不同厂家的 SerDes 不通用，又由于 SER 集成在 Camera 模组内的，某颗模组设计完成后就只能使用其指定解串器来接入。
:::

## MIPI-CSI

### 协议简介

MIPI-CSI 是 MIPI 联盟制定的 Camera Serial Interface 协议，主要用于 Camera 与 SoC 处理器间的图像数据传输。

### 协议结构

该协议为分层设计：

![MIPI-CSI 协议分层](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image184.png)

Sensor 及 DES 侧都是上述 Transmitter，为 MIPI CSI 的发送侧；SER 及 SoC 则是 Receiver，为 MIPI CSI 的接收侧。

### 协议层定义

协议层用于拆解数据收发，该层制定了虚拟通道与数据类型，满足多路不同格式图像的传输：

![协议层](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image193.png)

常用数据类型：

- **RAW12（0x2C）**：由 3 个 byte 传 2 个 pixel 数据，传输时为 LSB：

  ![RAW12](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image203.png)

- **YUV422 8bit（0x1E）**：由 2 个 byte 传 1 个 pixel 数据，字节序为 UYVY，传输时为 LSB：

  ![YUV422](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image217.png)

:::note
更多数据类型可见 VIN 配置。
:::

### PHY 层说明

数据传输最终由 PHY 层完成，该层也是调试接入时主要关注的对象。SoC 可使用 4 lane 的 DPHY，也支持 3 trio 的 CPHY。

- **DPHY**：由 1 对 CLK LANE 与多对 DATA LANE 组成，传输速率由 CLK LANE 频率决定。双边沿采样，单 lane 最大速率 `1.25GHz × 2 = 2.5Gbps/lane`；支持多对 DATA LANE，最大总带宽 `2.5G × 4 = 10Gbps`。受限于 Deserial 性能，实际使用时可能最大只有 2.5Gbps/lane。

  ![DPHY](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image222.png)

- **CPHY**：由 3 线 ABC 组成一个 trio，传输速率由其本身的翻转频率决定。最大支持 3 trio，最大总带宽 `2.5G × 2.28 × 3 = 17.1Gbps`。受限于 Deserial 性能，实际使用时可能最大只有 2.5Gsps/trio。

LANE 的基本状态（调试主要关注，且可示波器测量确认）：

- **LP 状态**：LP0 = 0V，LP1 = 1.2V。
- **HS 状态**：200mV 上的高速差分，HS0 = N>P，HS1 = P>N。
- **SOT（Start-of-Transmission）过程**：LP11 → LP01 → LP00 → SoT。

![LANE 状态](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image232.png)

:::note
关于 MIPI-CSI 协议，更多请详见 MIPI 联盟的协议文档。
:::

## MIPI RX

SoC 的 MIPI RX 设备数量与内部结构因平台而异，S100 与 S600 不同：

:::doc_scope{products="RDK S100"}
S100 有 3 个 RX 设备，其内部结构如下：

![硬件框架](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/s100_hardware_data_path.svg)

各 RX 的共性与差异：

| RX# | 后端模块 | EMB | 入 ISP | 入 PYM | Bypass | 共性 |
| --- | --- | --- | --- | --- | --- | --- |
| RX0 | CIM0: IPI0~3 | 支持 | online ISP0 / offline | yuv 若 online 只能单路 | TX0/TX1 | 独立 4lane/3trio；最大 2.5Gbps/lane 或 2.5Gsps/trio；<br/>有 4 路 IPI(4VC) 接入 |
| RX1 | CIM1: IPI0~3 | 支持 | online ISP1 / offline | yuv 若 online 只能单路 | TX0/TX1 | 同上 |
| RX4 | CMI4: IPI0~3 | 支持 | offline ISP0/1 | yuv offline 可多路 | TX0/TX1 | 同上 |

:::note
S100 上的 3 个 RX 设备并非完全相同，主要差异是其后端连接的模块不同。Sensor 接入调试时，需根据实际所用场景接入情况进行配置使用。默认情况下，tuning 场景使用 RX0。
:::


:::doc_scope{products="RDK S600"}
S600 有 6 个 RX 设备，其内部结构如下：

![硬件框架](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camsys/s600_hardware_framework.png)

各 RX 的共性与差异：

| RX | 后端模块 | EMB | 入 ISP | 入 PYM | Bypass | 共性摘要 |
|---|---|---|---|---|---|---|
| RX0 | CIM0: IPI0~3 | 支持 | online ISP0 / offline | yuv；online 仅单路 | TX0/TX1 | 独立 4lane/3trio；≤2.5Gbps/lane 或 ≤2.5Gsps/trio |
| RX1 | CIM1: IPI0~3 | 支持 | online ISP1 / offline | yuv；online 仅单路 | TX0/TX1 | 同上 |
| RX2 | CIM2: IPI0~3 | 支持 | online ISP2 / offline | yuv；online 仅单路 | TX0/TX1 | 同上 |
| RX3 | CIM3: IPI0~3 | 支持 | online ISP3 / offline | yuv；online 仅单路 | TX0/TX1 | 同上 |
| RX4 | CMI4: IPI0~3 | 支持 | offline ISP0 | yuv；offline 可多路 | TX0/TX1 | 同上 |
| RX5 | CMI5: IPI0~3 | 支持 | offline ISP0 | yuv；offline 可多路 | TX0/TX1 | 同上 |

:::note
S600 上的 6 个 RX 设备并非完全相同，主要差异是其后端连接的模块不同。Sensor 接入调试时，需根据实际所用场景接入情况进行配置使用。默认情况下，tuning 场景使用 RX0。
:::


## CIM

CIM 是接收 MIPI-CSI RX 数据的模块，详细配置和参数查看 [视频输入 - VIN - CIM](/Advanced_development/multimedia_development/multimedia_api/vin_api#cim)。

## 曝光同步

在多路 Camera 接入场景中，为后续融合等图像处理需要，要求各 Sensor 进行曝光同步。该功能是内外多个设备及模块共同协同工作完成的：

![曝光同步](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_background/image25.png)

涉及模块有（从触发的后往前）：

- **GPS**：对于 GPS PPS 方式，GPS 设备产生 PPS 信号输出给 SoC 及 MCU，触发同步。
- **Lidar**：对于 Lidar SYNC 方式，Lidar 设备产生同步信号给 SoC 及 MCU，触发同步。
- **MCU**：对于 AP_SYNC 方式，MCU 可产生 AP_SYNC 信号，输出给 SoC，触发同步。
- **SoC 内部模块**：
  - **ETH PPSx**：对于 ETH PPS 方式，ETH0 可产生 4 个 PPS 信号，输出给 LPWM 用于触发。
  - **LPWM**：

:::doc_scope{products="RDK S100"}
S100 有 3 个 LPWM 模块，每个有 4 路通道，可选上述不同 trigger 方式产生 PWM 输出，用于触发曝光，其 PWM 相关参数（offset/period 等）可配置，用于产生各类场景需要的触发信号。
:::

:::doc_scope{products="RDK S600"}
S600 有 4 个 LPWM 模块，每个有 4 路通道，可选上述不同 trigger 方式产生 PWM 输出，用于触发曝光，其 PWM 相关参数（offset/period 等）可配置，用于产生各类场景需要的触发信号。
:::

- **CIM**：内部有一硬件计数器，在收到数据 Frame Start 时记录其值，为硬件时间戳。
- **DES 芯片**：转发 SoC 的 LPWM（连接到 DES 的 GPIO 上）信号，通过 Link 传输给 SER 侧。
- **SER 芯片**：解析 Link 上传来的信息，并将其转为 GPIO 状态，发给 Sensor，用于触发曝光。
- **Sensor**：运行在 Trigger Slave 模式，等待 FSYNC 信号触发曝光，曝光完成后读取图像发出。

各模块按规则运转，最终使得各 Camera 实现同步曝光。Sensor 的同步方式也有多种，为使得输出图像到 SoC 时的时间一致，一般使用 shutter trigger 模式，主要用于同时读取输出。

:::note
曝光同步需多个模块配合，接入调试时主要工作有：
- **SerDes 配置**：根据硬件选择 GPIO，配置 GPIO 状态转发。
- **Sensor 配置**：Trigger Slave 模式使能，FSYNC 所用 GPIO 配置。
- **VPM JSON 配置**：LPWM 配置使能，并配置好相应参数：trigger_mode、offset、period 等。
- **外设配置**：调试可用 software 的 trigger_mode，实际验证还需连接外设使能同步。
:::
