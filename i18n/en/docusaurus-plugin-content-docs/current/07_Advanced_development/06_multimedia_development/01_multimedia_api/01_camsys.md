---
sidebar_position: 1
toc_max_heading_level: 4
---

# Camsys Subsystem

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```


## System Overview

The S100 camsys subsystem includes the Camera sensor (including SerDes), VIN (including MIPI, CIM), ISP, PYM, GDC, YNR, and STITCH modules.

| Abbreviation | Full Name                              | Description                                                                 |
|--------------|----------------------------------------|-----------------------------------------------------------------------------|
| MIPI         | Mobile Industry Processor Interface    | Standard defined by the MIPI Alliance for mobile industry processor interfaces |
| CSI          | Camera Serial Interface                | Camera serial interface                                                     |
| IPI          | Image Pixel Interface                  | Image transmission interface between MIPI and CIM                           |
| FOV          | Field of View                          | Field of view                                                               |
| SER          | Serializer                             | Serializer                                                                  |
| SerDes       | Serializer and Deserializer            | Serializer and deserializer                                                 |
| DES          | Deserializer                           | Deserializer                                                                |
| CIM          | Camera Interface Manager               | Camera access management module supporting online or offline operation      |
| VIN          | Video In (CIM+MIPI+LPWM+VCON)          | Video input module                                                          |
| ISP          | Image Signal Processor                 | Image signal processor                                                      |
| PYM          | Pyramid                                | Pyramid processing module: image downscaling and ROI                        |
| GDC          | Geometric Distortion Correction        | Geometric distortion correction module                                      |
| VPF          | Video Process Framework (VIN+ISP+PYM..)| Video processing management module                                          |
| VIO          | Video In/Out (VIN+VPM)                 | Video input/output module                                                   |
| STITCH       | Stitch hardware Module                 | Image stitching processing module                                           |
| CAMSYS       | Camera System (Camera+VPF)             | Camera image system                                                         |

### Camsys Hardware Block Diagram

<DocScope products="RDK-S100">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/b266496271990c1606e5f68485cf3e9d.png" alt="Camsys Hardware Block Diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

</DocScope>
<DocScope products="RDK-S600">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/s600-camsys.PNG" alt="Camsys Hardware Block Diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

</DocScope>

### Submodules

#### MIPI

<DocScope products="RDK-S100">

MIPI (Mobile Industry Processor Interface) is an open standard initiated by the MIPI Alliance for mobile application processor interfaces.
- MIPI CSI RX supports C/DPHY: DPHY rate is 4.5Gbps x 4 lanes = 18Gbps, and CPHY rate is 3.5Gsps x 3 trios = 24Gbps.
- S100 has three MIPI RX blocks: RX0, RX1, and RX4.

</DocScope>
<DocScope products="RDK-S600">

MIPI (Mobile Industry Processor Interface) is an open standard initiated by the MIPI Alliance for mobile application processor interfaces.
- MIPI CSI RX supports C/DPHY: DPHY rate is 4.5Gbps x 4 lanes = 18Gbps, and CPHY rate is 3.5Gsps x 3 trios = 24Gbps.
- S600 has six MIPI RX blocks: RX0 to RX5.

</DocScope>

#### CIM

CIM (Camera Interface Manager) is a dedicated hardware block for receiving MIPI-RX IPI image data. CIM handles simultaneous input of multiple image streams and adjusts the timing of the MIPI IPI interface to match the timing requirements of downstream hardware or DDR, delivering images directly via hardware or through DDR to the ISP and PYM.

<DocScope products="RDK-S100">

- The S100 has three CIM modules: CIM0, CIM1, and CIM4.
- A single CIM supports a maximum input of 4V * 8M * 30fps and supports RAW8, RAW10, RAW12, RAW14, RAW16, RAW20, and YUV422-8Bit image formats.
- S100 CIM supports online output to ISP0/ISP1 (RAW) and PYM0/PYM1 (YUV), and also supports offline output to DDR.
- The maximum input width for IPI0 of CIM0 is 5696; all other IPIs in CIM0 and all IPIs in other CIMs support a maximum input width of 4096.

</DocScope>
<DocScope products="RDK-S600">

- The S600 has six CIM modules: CIM0 to CIM5.
- A single CIM supports a maximum input of 4V * 8M * 30fps and supports RAW8, RAW10, RAW12, RAW14, RAW16, RAW20, and YUV422-8Bit image formats.
- S600 CIM supports online output to ISP0/ISP1/ISP2/ISP3 (RAW) and PYM0/PYM1/PYM2/PYM3 (YUV), and also supports offline output to DDR.
- S600 CIM0~2 support a maximum input width of 5696; the other CIMs support a maximum input width of 4096.

</DocScope>

#### ISP

ISP (Image Signal Processor) is a dedicated engine for image signal processing.  
ISP functions include various algorithmic processing of raw images, image characteristic statistics, color space conversion, and time-division multiplexing control of multiple channels, ultimately producing clearer, more accurate, and higher-quality images.

<DocScope products="RDK-S100">

- Each ISP hardware IP supports up to 12 sensor inputs.
- The S100 has two ISP modules: ISP0 and ISP1.
- Maximum ISP processing resolution is 4096 x 2160.

</DocScope>
<DocScope products="RDK-S600">

- Each ISP hardware IP supports up to 12 sensor inputs.
- The S600 has four ISP modules: ISP0 to ISP3.
- Maximum ISP processing resolution is 5696 x 3328.

</DocScope>
- ISP processing pipeline is shown below:  
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/isp-pipeline-en.png" alt="CIM ISP 3DNR PYM pipeline diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
- **MCFE**:  
  Multi-Context Front End, used for multi-channel scheduling control and buffer management in ISP, processing multi-camera images sequentially (one by one).
- **RAW Domain**:  
  RAW-domain image processing includes input port (with input crop functionality), channel switch, input formatter, sensor offset linear, digital gain, gamma FE (i.e., decompander), gamma_sqrt, raw frontend, static defect correction, sinter, chromatic aberration correction, gamma_sq, gamma BE, static white balance, radial shading correction, mesh shading correction, digital gain iridix, iridix, demosaic, etc.
- **RGB Domain**:  
  RGB-domain image processing includes purple fringe correction, color matrix, gamma RGB forward SQ, crop, CNR, gamma RGB reverse SQ, RGB gamma, etc.
- **Output formatter**:  
  Performs color space (CS) conversion, transforming RGB channel data into formats such as YUV, and handles output control.

#### YNR

YNR is a Digital Noise Reduction module operating in the YUV domain, supporting both 2DNR and 3DNR modes.

<DocScope products="RDK-S100">

- The S100 has one YNR module, YNR1, which only supports the ISP1-online-YNR1-online-PYM1 scenario.
- On S100, the maximum supported width and height are 2048 x 2048 in both 2DNR and 3DNR modes.

</DocScope>
<DocScope products="RDK-S600">

- The S600 has four YNR modules: YNR0 to YNR3. It only supports ISP-online-YNR-online-PYM scenarios, where YNR0~2 support 2DNR only, and YNR3 supports both 2DNR and 3DNR.
- On S600, YNR0-2 support a maximum processing width/height of 5696, while YNR3 supports up to 4096.

</DocScope>

#### PYM

PYM (Pyramid) is a hardware acceleration module that processes input images in pyramid layers and outputs them to DDR.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image.png" alt="PYM photo" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

<DocScope products="RDK-S100">

- The S100 has three PYM modules: PYM0, PYM1, and PYM4.

</DocScope>
<DocScope products="RDK-S600">

- The S600 has five PYM modules: PYM0 to PYM4.

</DocScope>
- SRC layer: Represents the source image layer.
- BL layer: Represents bilinear downsampled layers; BL Base 0~4 correspond to 1/2, 1/4, 1/8, 1/16, and 1/32 of the source image, respectively.
- DS layer: Output layer; each layer can arbitrarily select an input layer (SRC or BL0~4), perform downsampling and ROI processing, and then output to DDR.
- Downscaling ratio: (1/2, 1]; upscaling is not supported.
<DocScope products="RDK-S100">

- The maximum input width and height of each S100 PYM is 4096; the minimum input width and height are 32.
- S100 PYM0/1 support 4K@120fps; PYM4 supports 4K@90fps.

</DocScope>
<DocScope products="RDK-S600">

- The maximum input width and height of each S600 PYM is 5696; the minimum input width and height are 32.
- S600 PYM0~4 support 4K@120fps, where PYM4 does not support online input.

</DocScope>

#### GDC

GDC is a hardware module capable of performing perspective transformation, distortion correction, and rotation at specific angles (0°, 90°, 180°, 270°) on input images.

Typical supported input resolutions include: 3840×2160, 2688×1944, 1920×1080, 1280×720, 640×480, and 480×320.

Hardware specifications:

<DocScope products="RDK-S100">

- Maximum resolution: 3840×2160
- Minimum resolution: 96×96 (odd-numbered rows or columns are not supported)
- Performance: 3840×2160 @ 60fps
- Operating mode: DDR → GDC → DDR
- Input format: YUV420 semi-planar
- Output format: YUV420 semi-planar
- S100 has one GDC module.

</DocScope>
<DocScope products="RDK-S600">

- Maximum resolution: 3840×2160
- Minimum resolution: 96×96 (odd-numbered rows or columns are not supported)
- Performance: 3840×2160 @ 60fps
- Operating mode: DDR → GDC → DDR
- Input format: YUV420 semi-planar
- Output format: YUV420 semi-planar
- S600 has two GDC modules.

</DocScope>

##### Introduction to GDCTool

GDC Tool is a PC-based utility that enables offline simulation of GDC processing effects. Users can prepare JPEG-format images, load them into GDC Tool for offline correction, and then either directly save a `config.bin` file for hardware correction or save a `layout.json` file to generate a `config.bin` for hardware correction.

###### Launching GDC Tool

1. **Windows Environment**
    - **Installation prerequisites**: Requires Node.js. See: https://nodejs.cn/download/
    - **Install dependencies**: Open a Windows command prompt, navigate to the GDC tool directory (e.g., `gdc-tool-gui-xxxx-windows`), and run `npm install express`.
    - **Launch the application**: In the command prompt, navigate to the tool directory and run `node.exe app.js`. Then open Chrome and go to http://localhost:3000/.

2. **Unix Environment**
    - **Installation prerequisites** (MacOS): Run `brew install node`.
    - **Install dependencies**: In the tool directory, run `npm install --production`.
    - **Launch the application**: Run `node app.js` and open http://localhost:3000/ in your browser.

###### Transformation Modes in GDC Tool

Six transformation modes are available: Affine, Equisolid, Equisolid (cylinder), Equidistant, Custom, and Keystone+dewarping. These correspond to transformation modes described in the `transformation_t` section of the GDC Bin API documentation. The following table describes the purpose of each transformation mode:

| Transformation Mode     | Purpose                                                                                             |
|--------------------------|-----------------------------------------------------------------------------------------------------|
| Affine                   | A linear transformation providing simple image rotation without distortion correction               |
| Equisolid                | Panoramic transformation with the largest transformation grid                                       |
| Equisolid (cylinder)     | Cylindrical transformation                                                                          |
| Equidistant              | Equidistant transformation, where distances after transformation remain equidistant                 |
| Custom                   | User-defined custom transformation                                                                  |
| Keystone+dewarping       | Compared to Equidistant, `dewarp_keystone` adds two parameters: `trapezoid_left_angle` and `trapezoid_right_angle`. By default, both are 90°, yielding the same result as Equidistant. |

All transformation types share three common parameters: **Pan**, **Tilt**, and **Zoom**. (Example: Equidistant transformation with input/output resolution of 1280×720.) In the following output images, the blue rectangle indicates the effect when only the specified parameter is set to the given value, while all other parameters remain at their defaults.

* **Pan**

    Horizontally offsets the transformation grid by a given number of pixels within the range (-1280, +1280), as shown below:  
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-1.png" alt="Pan parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

* **Tile**

    Vertically offsets the transformation grid by a given number of pixels within the range (-720, +720), as shown below:  
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-2.png" alt="Tile parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

* **Zoom**

    Scales the transformation output by a given factor within the range (0, +∞), where (0, 1) denotes values greater than 0 and less than 1, as shown below:  
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-3.png" alt="Zoom parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

1. **Affine**
   * **Function Description**

        Provides a linear transformation.

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-4.png" alt="GDC diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

   * **Member Description**

        | Member                   | Description                                                                 |
        | ------------------------ | --------------------------------------------------------------------------- |
        | int32_t pan              | Default: 0; no modification                                                 |
        | int32_t tilt             | Default: 0; no modification                                                 |
        | zoom                     | Scales the transformation output by the provided factor. When rotation angle is 180° or 270°, this value must be ≥1.03 |
        | double angle (rotation)  | Image rotation angle: 0°/90°/180°/270°                                     |

        :::info Note!

        Input and output widths must be aligned to 16-byte boundaries.

        When the rotation angle is 180° or 270°, the zoom parameter must be ≥1.03.
        :::

2. **Equisolid**
   * **Function Description**

        This transformation provides equisolid (panoramic) correction and displays the result as a projection onto a plane.

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-6.png" alt="GDC diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

   * **Member Description**

        | Member                  | Description                                                       |
        | ----------------------- | ----------------------------------------------------------------- |
        | int32_t pan             | Default: 0; no modification                                       |
        | int32_t tilt            | Default: 0; no modification                                       |
        | zoom                    | Scales the transformation output by the provided factor           |
        | double strengthX        | Transformation strength along the X-axis (non-negative parameter) |
        | double strengthY        | Transformation strength along the Y-axis (non-negative parameter) |
        | double angle (rotation) | Image rotation angle: 0°/90°/180°/270°                           |

        strength x adjustment effect: transformation strength along the X-axis, with values in the range (0, +∞), as shown below:<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-7.png" alt="strengthX parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

        strength y debugging effect: the transformation intensity along the Y-axis, with a value range of (0, +∞). As shown below:
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-8.png" alt="strengthY parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

        Rotation debugging effect: value range (-180, 180). As shown below:
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-9.png" alt="Rotation parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

        :::info Note!

        The width of input and output dimensions must be aligned to 16-byte boundaries.

        :::

3. Equisold (cylinder)
   * Function Description

        This transformation provides equirectangular (panoramic) correction and displays the result as a projection onto a plane.

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-10.png" alt="Equisolid(cylinder) panoramic correction diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

   * Member Description
        | Member | Description                                   |
        |-----------------------------|-----------------|
        | int32_t pan                 | default 0, no modification |
        | int32_t tilt                | default 0, no modification |
        | zoom                        | Scales the transformation output by the provided factor |
        | strength                    | Intensity of the transformation |
        | double angle(rotation)      | Image rotation angle: 0/90/180/270 |

        strength debugging effect: transformation intensity (0, +∞). As shown below:

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-11.png" alt="strength parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

        rotation debugging effect: value range (-180, +180). As shown below:

        <img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-12-en.png" alt="rotation parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />


        :::info Note!

        The width of input and output dimensions must be aligned to 16-byte boundaries.

        :::

4. Equidistant
   * Function Description

       The equidistant transformation includes many parameters that allow it to provide a variety of target planes for projection. This gives users greater freedom to select the desired region of the fisheye frame to be transformed.

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-13.png" alt="Equidistant transformation diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

   * Member Description
       | Member | Description                                   |
       |-----------------------------|-----------------|
       | int32_t pan                 | default 0, no modification |
       | int32_t tilt                | default 0, no modification |
       | zoom                        | Scales the transformation output by the provided factor |
       | double angle(rotation)      | Image rotation angle: 0/90/180/270 |
       | double elevation            | Defines the elevation angle of the projection axis, ranging from 0 to 90 |
       | double azimuth              | Defines the azimuth angle of the projection axis. If the elevation parameter is 0, azimuth will have no visible effect |
       | int32_t keep_ratio          | When the "keep ratio" parameter is enabled, the FOV height parameter will be ignored, and its value will be automatically calculated to maintain equal stretching intensity in both horizontal and vertical directions |
       | double FOV_h                | Describes the size (in degrees) of the output field of view in the horizontal dimension. Valid values range from 0 to 180 |
       | double FOV_w                | Describes the size (in degrees) of the output field of view in the vertical dimension. Valid values range from 0 to 180 |
       | double cylindricity_y       | Describes the sphericity of the target projection along the Y-axis. This value ranges from 0 to 1, where 1 represents a spherical shape. If this value is set to 1 while "cylindricity_x" is set to 0, the projection will form a cylinder along the Y-axis |
       | double cylindricity_x       | Describes the sphericity of the target projection along the X-axis. This value ranges from 0 to 1, where 1 represents a spherical shape. If this value is set to 1 while "cylindricity_y" is set to 0, the projection will form a cylinder along the X-axis |

       elevation debugging effect:

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-14.png" alt="elevation parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

       azimuth debugging effect:

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-15.png" alt="azimuth parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

       rotation debugging effect:

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-16.png" alt="rotation parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

       cylindricity x debugging effect:

       Describes the sphericity of the target projection along the X-axis. This value ranges from 0 to 1, where 1 represents a spherical shape. If this value is set to 1 and cylindricity_y is set to 0, the projection will form a cylinder along the X-axis. As shown below:

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-17.png" alt="cylindricityX parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

       cylindricity y debugging effect:

       Describes the sphericity of the target projection along the Y-axis. This value ranges from 0 to 1, where 1 represents a spherical shape. If this value is set to 1 and cylindricity_x is set to 0, the projection will form a cylinder along the Y-axis. As shown below:

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-18.png" alt="cylindricityY parameter debugging effect" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

       :::info Note!

       The width of input and output dimensions must be aligned to 16-byte boundaries.
       Normal human vision is approximately 90 degrees. For transformations where cylindricity (see below) equals "0", setting both FOV width and height to 180 will cause infinite image stretching.
       If both cylindricity_x and cylindricity_y are set to 1, the projection will be spherical. If both are set to 0, the transformation will be rectangular.

       :::




5. Custom
   * Function Description

       After applying the custom transformation, each polygon in the input image is transformed into a square. In other words, any four adjacent input points of any shape become a square after transformation, as shown in the figure below. However, the shape and position of the polygons will change after transformation.

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-19.png" alt="Custom transformation diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

       These are used to create transformations that cannot be described by any of the provided standard types. To correct arbitrary distortion, a special calibration file named config0.txt must be provided to the GDC tool, as shown in the figure below:

       <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-20.png" alt="Custom calibration file config0.txt example" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

   * Member Description
       | Member | Description                                   |
       |-----------------------------|-----------------|
       | int32_t pan                 | default 0, no modification |
       | int32_t tilt                | default 0, no modification |
       | zoom                        | Scales the transformation output by the provided factor |
       | char custom_file[128]       | Name of the config.txt file |
       | custom_tranformation_t custom | Parsed custom transformation structure |

       Rules for the Config file should generally observe the following points:

           1. The first line enables full tile in pixel calculation: 1 means enable, 0 means disable.

           2. The second line specifies the number of pixels to skip if full tile is enabled; these values must be greater than 0. Smaller numbers result in slower libgdc performance (slower performance means a larger config.bin file and longer time for libgdc to generate config.bin).

           3. The third line specifies the number of calibration points in vertical and horizontal directions. The first value Y = 1081 indicates 1081 calibration points vertically, and the second value X = 1921 indicates 1921 calibration points horizontally.

           4. The fourth line specifies the center point of the selected region, typically (Y-1)/2, (X-1)/2.

           5. Calibration points must be non-negative integers or floats, and calibration points in adjacent rows must not be duplicated.
               e.g., The figure below shows a partial excerpt of the data. Rows 5 to 9 contain the coordinate values of calibration points in the source image, formatted as Y: X. In this example, there are a total of 1081x1921 calibration points.

                <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-25.png" alt="Calibration point data format example" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

           6. Since calibration points must be equally spaced, the output image resolution depends on the number of calibration points.

                <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-22.png" alt="Calibration points and output resolution relationship" style={{ width: '50%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

                e.g., Output image Width = 100, Height calculated as 340, calculated as follows: 100/height = (96-1)/(324-1) \
                The figure below shows a simpler example of 3x3 coordinate point transformation:

                <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-23.png" alt="3x3 coordinate point transformation example" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />



6. Keystone + Dewarping
    * Function Description

        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-26.png" alt="Keystone+dewarping transformation diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

    * Member Description
        | Member | Description                                   |
        |-----------------------------|-----------------|
        | int32_t pan                 | default 0, no modification |
        | int32_t tilt                | default 0, no modification |
        | zoom                        | Scales the transformation output by the provided factor |
        | double angle(rotation)      | Image rotation angle: 0/90/180/270 |
        | double elevation            | Defines the elevation angle of the projection axis, ranging from 0 to 90 |
        | double azimuth              | Defines the azimuth angle of the projection axis. If the elevation parameter is 0, azimuth will have no visible effect |
        | int32_t keep_ratio          | When the "keep ratio" parameter is enabled, the FOV height parameter will be ignored, and its value will be automatically calculated to maintain equal stretching intensity in both horizontal and vertical directions |
        | double FOV_h                | Describes the size (in degrees) of the output field of view in the horizontal dimension. Valid values range from 0 to 180 |
        | double FOV_w                | Describes the size (in degrees) of the output field of view in the vertical dimension. Valid values range from 0 to 180 |
        | double cylindricity_y       | Describes the sphericity of the target projection along the Y-axis. This value ranges from 0 to 1, where 1 represents a spherical shape. If this value is set to 1 while "cylindricity_x" is set to 0, the projection will form a cylinder along the Y-axis |
        | double cylindricity_x       | Describes the sphericity of the target projection along the X-axis. This value ranges from 0 to 1, where 1 represents a spherical shape. If this value is set to 1 while "cylindricity_y" is set to 0, the projection will form a cylinder along the X-axis |
        | double trapezoid_left_angle | Default 90; range 0.1 to 90; in the transformation grid, the angle between the left boundary and the bottom boundary—see actual effect |
        | double trapezoid_right_angle| Default 90; range 0.1 to 90; in the transformation grid, the angle between the right boundary and the bottom boundary—see actual effect |


        :::info Note!

        The width of input and output dimensions must be aligned to 16-byte boundaries.

        :::

###### GDC Tool Transformation Mode Parameter Description
The configuration file can be generated by the GDC tool and saved as layout.json. Different transformation modes have different parameters. Taking custom mode and keystone+dewarping mode as examples, the configuration parameters are explained below.

1. keystone+dewarping mode
    ```json
    {
        "inputRes": [
            1920, // Width of the input image resolution
            1080  // Height of the input image resolution
        ],
        "param": {
            "fov": 180,        // Field of view of the input image
            "diameter": 1080,  // Diameter of the input image; controls the overall size of the transformation grid
            "offsetX": 0,      // Horizontal offset of the transformation grid
            "offsetY": 0       // Vertical offset of the transformation grid
        },
        "outputRes": [
            1920, // Width of the output image resolution
            1080  // Height of the output image resolution
        ],
        "transformations": [
            {
                "transformation": "Dewarp_keystone", // Transformation mode"position": [ // ROI region settings for the output image
                    0, // Horizontal offset of the output image's ROI
                    0, // Vertical offset of the output image's ROI
                    1920, // Width of the output image's ROI
                    1080 // Height of the output image's ROI
                ],
                "param": {
                    "left_base_angle": 90, // Default: 90; range: 0.1 to 90; in the transformation mesh, the angle of the left boundary relative to the bottom boundary
                    "right_base_angle": 90, // Default: 90; range: 0.1 to 90; in the transformation mesh, the angle of the right boundary relative to the bottom boundary
                    "azimuth": 90, // Defines the azimuth angle of the projection axis. If the elevation parameter is 0, the azimuth will have no visible effect.
                    "elevation": 0, // Defines the elevation angle of the projection axis, ranging from 0 to 90.
                    "rotation": 0, // Rotation angle to be applied to the output image
                    "fovWidth": 90, // Specifies the horizontal field of view of the output image in degrees. Larger values result in a wider horizontal transformation mesh. Valid range: 0 to 180.
                    "fovHeight": 90, // Specifies the vertical field of view of the output image in degrees. Larger values result in a taller vertical transformation mesh. Valid range: 0 to 180.
                    "keepRatio": 0, // When "keepRatio" is set to 1, the fovHeight parameter is ignored and automatically calculated to maintain uniform stretching intensity in both horizontal and vertical directions.
                    "cylindricityX": 1, // Describes the sphericity of the target projection along the X-axis. Values range from 0 to 1, where 1 represents a fully spherical projection. If set to 1 while "cylindricityY" is 0, the projection forms a cylinder along the X-axis.
                    "cylindricityY": 1 // Describes the sphericity of the target projection along the Y-axis. Values range from 0 to 1, where 1 represents a fully spherical projection. If set to 1 while "cylindricityX" is 0, the projection forms a cylinder along the Y-axis.
                },
                "ptz": [
                    0, // pan parameter
                    0, // tilt parameter
                    1 // zoom parameter
                ],
                "roi": { // Input image ROI region settings
                    "x": 0, // Horizontal offset of the input image's ROI
                    "y": 0, // Vertical offset of the input image's ROI
                    "w": 1920, // Width of the input image's ROI
                    "h": 1080 // Height of the input image's ROI
                }
            }
        ],
        "mode": "semiplanar420", // Processing format setting
        "eccMode": "eccDisabled", // ECC mode for processing
        "colourspace": "yuv" // Data format for processing
    }
    ```

2. Custom mode
    ```json
    {
        "inputRes": [
            1280, // Width of the input image resolution
            720 // Height of the input image resolution
        ],
        "param": {
            "fov": 192, // Field of view of the input image
            "diameter": 720, // Diameter of the input image, controlling the overall size of the transformation mesh
            "offsetX": 0, // Horizontal offset of the transformation mesh
            "offsetY": 0 // Vertical offset of the transformation mesh
        },
        "outputRes": [
            560, // Width of the output image resolution
            258 // Height of the output image resolution
        ],
        "transformations": [
            {
                "transformation": "Custom", // Transformation mode
                "position": [ // ROI region settings for the output image
                    0, // Horizontal offset of the output image's ROI
                    0, // Vertical offset of the output image's ROI
                    560, // Width of the output image's ROI (must be ≤ outputRes width)
                    258 // Height of the output image's ROI (must be ≤ outputRes height)
                ],
                "ptz": [
                    0, // pan parameter
                    0, // tilt parameter
                    1 // zoom parameter
                ],
                "roi": { // Invalid in custom mode
                    "x": 0, // Invalid in custom mode
                    "y": 0, // Invalid in custom mode
                    "w": 0, // Invalid in custom mode
                    "h": 0 // Invalid in custom mode
                },

    "param": {
                    "customTransformation": "/path_to/camera_0_gdc.txt" // Path to the coordinate mapping file on the device
                }
            }
        ],
        "mode": "semiplanar420", // Processing format setting
        "eccMode": "eccDisabled", // ECC mode for processing
        "colourspace": "yuv" // Data format for processing
    }
    ```
    :::info Note!

    1. Always set eccMode to "eccDisabled". Although other ECC modes are selectable, they have no actual effect.
    2. When parameters are fractional, ensure precision of at least 8 decimal places after floating-point computation; otherwise, the generated binary may differ.
    3. When populating the data structure or JSON, users must include all fields shown in the mode examples.
    4. In non-custom modes, the "roi" parameter in the configuration file specifies the ROI of the input image.
    5. The "position" parameter in the configuration file specifies the ROI of the output image.

    :::

3. Affine  
Configuration file content as follows:

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

    Input image with transformation mesh shown below:

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-27.png" alt="Affine mode input image with transformation mesh" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />


    Output image shown below:

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-28.png" alt="Affine mode output image" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />


4. Equisolid Configuration file content as follows:

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
        "mode": "semiplanar420","eccMode": "eccDisabled",
        "colourspace": "yuv"
    }
    ```
    Input image with transformation grid as follows:

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-29.png" alt="Equisolid mode input image with transformation grid" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />


    Output image as follows:

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-30.png" alt="Equisolid mode output image" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />


5. Equisolid (cylinder) Configuration file content as follows:

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
    Input image with transformation grid as follows:

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-31.png" alt="Equisolid(cylinder) mode input image with transformation grid" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

    Output image as follows:

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-32.png" alt="Equisolid(cylinder) mode output image" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

6. Equidistant Configuration file content as follows:

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

    Input image with transformation grid as follows:

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-33.png" alt="Equidistant mode input image with transformation grid" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

    Output image as follows:

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-34.png" alt="Equidistant mode output image" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

7. Custom Input resolution: 1280x720, output resolution: 560x258. Configuration file content as follows:

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

    Input image with transformation grid as follows:

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-35.png" alt="Custom mode input image with transformation grid" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

    Output image as follows:

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-36.png" alt="Custom mode output image" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />


8. Keystone + dewarping Configuration file content as follows:

    ```json
    {"inputRes": [
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

    Input image with transformation grid is shown below:

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-37.png" alt="Keystone+dewarping mode input image with transformation grid" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

    Output image is shown below:

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/image-38.png" alt="Keystone+dewarping mode output image" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />


##### GDC Bin Related API Reference
The following APIs are used for GDC BIN generation. For GDC module control APIs, refer to the HBN API.

1. hb_vio_gen_gdc_cfg

    【Function Declaration】

    int32_t hb_vio_gen_gdc_cfg(param_t *gdc_parm, window_t *wnds, uint32_t wnd_num, void **cfg_buf, uint64_t *cfg_size)

    【Parameter Description】

    * [IN] param_t *gdc_parm: GDC-related parameters, including resolution, format, etc.
    * [IN] window_t *wnds: Parameters for internal regions within GDC.
    * [IN] uint32_t wnd_num: Number of windows.
    * [OUT] uint32_t **cfg_buf: Generated GDC configuration BIN buffer, allocated internally.
    * [OUT] uint64_t *cfg_size: Size of the GDC configuration BIN file.

    【Return Value】

    - Success: E_OK: Success
    - Failure: E_NOT_OK: Fail, return error code; range: [-10000, -1]

    【Function Description】
        Generates the BIN file required for GDC module operation.

2. hb_vio_set_gdc_cfg

    【Function Declaration】

    int32_t hb_vio_set_gdc_cfg(uint32_t pipeline_id, uint32_t *cfg_buf, uint64_t cfg_size)

    【Parameter Description】

    - [IN] uint32_t pipeline_id: Pipeline ID; software channel ID; range: [0, 23], default: 0;
    - [IN] cfg_buf: Configuration buffer of the GDC BIN file.
    - [IN] cfg_size: Size of the GDC BIN file.

    【Return Value】

    - Success: E_OK: Success
    - Failure: E_NOT_OK: Fail, return error code; range: [-10000, -1]

    【Function Description】

    Sets the GDC module's configuration BIN.

3. hb_vio_free_gdc_cfg

    【Function Declaration】

    void hb_vio_free_gdc_cfg(uint32_t *cfg_buf)

    【Parameter Description】

    - [IN] uint32_t* cfg_buf: Buffer of the GDC BIN file.

    【Return Value】

    - NONE

    【Function Description】

    Frees the buffer allocated for the GDC module's configuration BIN.


##### GDC Bin Related Parameter Descriptions

1. typedef struct param_t

    | Name       | Type             | Min Value | Max Value | Default | Description                                                                                              | Required |
    |------------|------------------|-----------|-----------|---------|----------------------------------------------------------------------------------------------------------|----------|
    | format     | frame_format_t   |           |           |         | Image format to be processed                                                                             | Yes      |
    | in         | resolution_t     |           |           |         | Actual input image resolution                                                                            | Yes      |
    | out        | resolution_t     |           |           |         | Actual output image resolution                                                                           | Yes      |
    | x_offset   | int32_t          | 0         |           | 0       | Pixel offset of the input region along the x-axis                                                        | Yes      |
    | y_offset   | int32_t          | 0         |           | 0       | Pixel offset of the input region along the y-axis                                                        | Yes      |
    | diameter   | int32_t          |           |           |         | Pixel diameter of the circular input area containing the actual fisheye image within the rectangular input image. For some cameras, this circular image area may be larger or smaller than the rectangular canvas (sometimes cropped). Typically, diameter should match input.height. | Yes      |
    | fov        | double           | 0         |           |         | Field of view defining the visible angle of the input image, affecting the curvature of the source mesh. Larger FOV results in greater perspective distortion. | Yes      |


2. typedef enum frame_format frame_format_t

    | Name                | Type  | Min Value | Max Value | Default | Description     | Required |
    |---------------------|-------|-----------|-----------|---------|-----------------|----------|
    | FMT_UNKNOWN         | enum  |           |           |         | Unknown format  |          |
    | FMT_LUMINANCE       | enum  |           |           |         | Not supported   |          |
    | FMT_PLANAR_444      | enum  |           |           |         | Not supported   |          |
    | FMT_PLANAR_420      | enum  |           |           |         | Not supported   |          |
    | FMT_SEMIPLANAR_420  | enum  |           |           |         | NV12            |          |
    | FMT_GDC_MAX         | enum  |           |           |         |                 |          |


3. typedef struct resolution_s resolution_t

    | Name | Type       | Min Value | Max Value | Default | Description      | Required |
    |------|------------|-----------|-----------|---------|------------------|----------|
    | w    | uint32_t   |           |           |         | Width (in pixels)|          |
    | h    | uint32_t   |           |           |         | Height (in pixels)|         |


4. typedef struct window_t

    | Name                   | Type                    | Min Value | Max Value | Default | Description                                                                                              | Required |
    |------------------------|-------------------------|-----------|-----------|---------|----------------------------------------------------------------------------------------------------------|----------|
    | out_r                  | rect_t                  |           |           |         | Output data size information                                                                             |          |
    | transform              | transformation_t        | 0         | 6         | 0       | Transformation mode used                                                                                 |          |
    | input_roi_r            | rect_t                  |           |           |         | ROI region                                                                                               |          |
    | pan                    | int32_t                 |           |           |         | Horizontal target displacement (in pixels) centered on the output image                                   |          |
    | tilt                   | int32_t                 |           |           |         | Vertical target displacement (in pixels) centered on the output image                                     |          |
    | zoom                   | double                  |           |           |         | Target zoom factor                                                                                       |          |
    | strengthX              | double                  |           |           |         | Non-negative transformation strength parameter in the X direction                                        |          |
    | strengthY              | double                  |           |           |         | Non-negative transformation strength parameter in the Y direction                                        |          |
    | angle                  | double                  |           |           |         | Rotation angle of the principal projection axis around itself                                            |          |
    | elevation              | double                  |           |           |         | Angle specifying the principal projection axis                                                           |          |
    | azimuth                | double                  |           |           |         | Angle specifying the principal projection axis, measured clockwise from north                            |          |
    | keep_ratio             | int32_t                 |           |           |         | Maintain the same stretch intensity in both horizontal and vertical directions                            |          |
    | FOV_h                  | double                  |           |           |         | Vertical dimension of the output field of view, expressed in degrees                                      |          |
    | FOV_w                  | double                  |           |           |         | Horizontal dimension of the output field of view, expressed in degrees                                    |          |
    | cylindricity_y         | double                  |           |           |         | Cylindricity level of the target projection shape in the vertical direction                               |          |
    | cylindricity_x         | double                  |           |           |         | Cylindricity level of the target projection shape in the horizontal direction                             |          |
    | custom_file[128]       | char                    |           |           |         | Custom transformation description file used in custom mode                                               |          |
    | custom                 | custom_tranformation_t  |           |           |         | Transformation information in custom mode                                                                |          |
    | trapezoid_left_angle   | double                  |           |           |         | Left acute angle between the trapezoid base and its slanted side                                          |          |
    | trapezoid_right_angle  | double                  |           |           |         | Right acute angle between the trapezoid base and its slanted side                                         |          |
    | check_compute          | uint8_t                 |           |           |         | Currently unused                                                                                         |          |


5. typedef struct rect_s rect_t

    | Name | Type      | Min Value | Max Value | Default | Description       | Required |
    |------|-----------|-----------|-----------|---------|-------------------|----------|
    | x    | int32_t   |           |           |         | Starting X coordinate |          |
    | y    | int32_t   |           |           |         | Starting Y coordinate |          |
    | w    | int32_t   |           |           |         | Width             |          |
    | h    | int32_t   |           |           |         | Height            |          |


6. typedef enum gdc_transformation transformation_t

    | Name               | Type  | Min Value | Max Value | Default | Description                                                                                           | Required |
    |--------------------|-------|-----------|-----------|---------|-------------------------------------------------------------------------------------------------------|----------|
    | PANORAMIC         | enum  |       |       |       | Panoramic transformation                                                             ||
    | CYLINDRICAL       | enum  |       |       |       |     NA                                                                   ||
    | STEREOGRAPHIC     | enum  |       |       |       | Same as distortion correction and panoramic transformation, but the output image is a cylindrical panorama instead of a planar image       ||
    | UNIVERSAL         | enum  |       |       |       | Equidistant transformation                                                ||
    | CUSTOM            | enum  |       |       |       | User-defined transformation; allows customization of the transformation mesh                                ||
    | AFFINE            | enum  |       |       |       | Linear transformation                                                             ||
    | DEWARP_KEYSTONE   | enum  |       |       |       | Non-equidistant transformation selectable relative to equidistant transformation; equidistant transformation is a special case of this ||

7. typedef struct point_s point_t
    | Name | Type   | Min | Max | Default | Description   | Required |
    |------|--------|-----|-----|---------|---------------|----------|
    | x    | double |     |     |         | x coordinate  |          |
    | y    | double |     |     |         | y coordinate  |          |

8. typedef struct custom_tranformation_s custom_tranformation_t

    | Name            | Type      | Min | Max | Default | Description                                                                                                  | Required |
    |-----------------|-----------|-----|-----|---------|--------------------------------------------------------------------------------------------------------------|----------|
    | full_tile_calc  | uint8_t   |     |     |         | Whether to enable tile-based calculation; if enabled, libgdcbin performs additional min/max calculations per tile. More tiles yield higher precision and better results but increase bin generation time. |          |
    | tile_incr_x     | uint16_t  |     |     |         | Tile increment in x direction                                                                                |          |
    | tile_incr_y     | uint16_t  |     |     |         | Tile increment in y direction                                                                                |          |
    | w               | int32_t   |     |     |         | Number of points in the horizontal direction of the custom transformation grid                                |          |
    | h               | int32_t   |     |     |         | Number of points in the vertical direction of the custom transformation grid                                  |          |
    | centerx         | double    |     |     |         | Center along the x-axis, typically half the number of horizontal coordinate points                            |          |
    | centery         | double    |     |     |         | Center along the y-axis, typically half the number of vertical coordinate points                              |          |
    | *points         | point_t   |     |     |         | Sequence of transformation points defined in `config.txt`; total count = `w * h`                              |          |


#### STITCH

**Introduction**

Stitch is a configurable image stitching computation unit capable of blending and stitching multiple images together. It is primarily used for 360-degree surround-view image stitching in automated parking scenarios. Stitch operates based on Regions of Interest (ROIs). Each ROI can perform alpha-beta blending between two source images and write the result into a designated ROI of the target image. This blending approach ensures smoother transitions at stitching boundaries. Additionally, Stitch supports gain adjustment for Y, U, and V channels separately, enabling brightness and chrominance balancing between source images to further enhance stitching quality. Moreover, Stitch allows users to input custom per-pixel alpha-beta weight values, enabling various blending effects such as background blur or image watermarking.  
The Stitch hardware supports maximum input and output resolutions of 4096x4096.

**Hardware Operating Modes**

- **Online Blending**: No LUT table input required; hardware automatically performs blending and stitching. Requires ROI width = height (w = h). In this mode, the hardware automatically calculates alpha and beta weights for each pixel based on configured parameters such as transition zone width and direction.
- **Alpha Blending**: Requires an alpha LUT table. The hardware reads alpha weight values from DDR memory for weighted blending. The alpha LUT stores the alpha weight for each pixel within the ROI. For each pixel, the hardware reads Y, UV, and alpha values separately for weighted blending.
- **Alpha-Beta Blending**: Requires both alpha and beta LUT tables. The hardware reads alpha and beta weight values from DDR for weighted blending.
- **Src Copy**: No LUT table required; hardware directly copies src0.
- **Src Alpha Copy**: Requires an alpha LUT table; hardware reads alpha weights from DDR and blends src0 accordingly.

Here, the "LUT table" refers to the buffer storing blending weight parameters.

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch_work-en.jpg" alt="STITCH diagram" style={{ width: '60%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

**Hardware Stitching Diagram**

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch0.png" alt="STITCH diagram" style={{ width: '60%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />  
By using the two source ROIs shown in the image with different blend modes, the corresponding ROI output results are generated.

**Stitching Scheme Overview**

The hardware stitching function can merge and blend multiple images into a single output image. Designed flexibly, it uses ROIs as the basic processing unit and employs the alpha blending algorithm. Different ROI partitions and configurations can be defined via configuration parameters to generate various stitching schemes. Additionally, LUT tables are used to optimize transition zones during stitching. In autonomous driving and ADAS Automated Parking Assist (APA) scenarios, this hardware can stitch four IPM (Inverse Perspective Mapping) images—already distortion-corrected from four cameras—into a single 360-degree surround-view image for parking space detection, allowing users to easily view parking lines and surroundings.

**Typical Scenario**  
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch1-en.jpg" alt="STITCH diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />  
In an APA scenario with four surround-view cameras, GDC fetches four back-projected images and reference points (CFG BIN) from DDR, outputs four IPM images after distortion correction, and then uses the STITCH hardware module with a pre-defined stitching configuration (CPG PARAM) to generate a bird's-eye-view output.

**Placement Layout**  
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch2.png" alt="STITCH diagram" style={{ width: '60%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />  
1. The four IPM images are placed at specified locations in the output buffer using copy mode.  
2. Non-overlapping regions can use direct copy mode.  
3. Overlapping ROI regions use Alpha Blend mode for seamless fusion.

**LUT Table**

The LUT table stores alpha/beta blending coefficients (similar to weight values). Each ROI must generate corresponding per-pixel blending coefficients ranging from 0 to 255, which are sequentially stored in the LUT table memory. When an ROI uses alpha or beta blending mode, these parameters are used for fusion.

For example, in the LUT generation described in the "Coordinate Parameter Example" section:  
ROI-0/1: 256×512, ROI-2/3: 560×256, ROI-4/5: 256×218, ROI-6/7: 256×186  
LUT: ROI-0 + ROI-1 + ROI-2 + ROI-3 + ROI-4 + ROI-5 + ROI-6 + ROI-7  
Currently, the LUT table can be generated using the `convert_tool`.

**Coordinate Parameter Example**

ROI partitioning for hardware stitching is directly related to camera mounting positions. Currently, ROI partitions can be generated using the `convert-tool`. The figure below shows an example of coordinate points for each ROI region.  
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/stitch3.png" alt="STITCH diagram" style={{ width: '60%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

 | ROI | Range               | SRC0             | Start     | Size       | SRC1             | Start      | Size       | Dest Start | Mode         |
 |-----|---------------------|------------------|-----------|------------|------------------|------------|------------|------------|--------------|
 | 0   | Full left view      | Left (frame0)    | (0,0)     | -256,512   | /                | /          | /          | (0,40)     | Direct Copy  |
 | 1   | Full right view     | Right (frame2)   | (0,0)     | -256,512   | /                | /          | /          | (304,40)   | Direct Copy  |
 | 2   | Full rear view      | Rear (frame3)    | (0,0)     | -560,256   | /                | /          | /          | (0,366)    | Direct Copy  |
 | 3   | Full front view     | Front (frame1)   | (0,0)     | -560,256   | /                | /          | /          | (0,0)      | Direct Copy  |
 | 4   | Overlap: Left & Front | Left (frame0)  | (0,0)     | -256,218   | Front (frame1)   | (0,40)     | -256,218   | (0,40)     | AlphaBlend   |
 | 5   | Overlap: Right & Front| Right (frame2) | (0,0)     | -256,218   | Front (frame1)   | (304,40)   | -256,218   | (304,40)   | AlphaBlend   |
 | 6   | Overlap: Left & Rear  | Left (frame0)  | (0,366)   | -256,186   | Rear (frame3)    | (0,0)      | -256,186   | (0,366)    | AlphaBlend   |
 | 7   | Overlap: Right & Rear | Right (frame2) | (0,366)   | -256,186   | Rear (frame3)    | (304,0)    | -256,218   | (-304,366) | AlphaBlend   |


#### LPWM
##### Overview of LPWM
LPWM is a signal source similar to PWM, typically used to trigger sensor exposure in the camsys system. LPWM itself requires an external trigger. Upon receiving a trigger signal, it outputs a square wave based on the configured parameters such as period, high-time, and offset, with a frequency ranging from **1 Hz to 500 kHz**, an effective high-level duration from **0 μs to 4095 μs**, and a default precision of **1 μs**.

The S100 integrates **3 LPWM chips**, each containing **4 LPWM channels**. Configuration should be performed according to the actual hardware connections.

The camera hardware synchronization function of the S100 is mainly implemented by the LPWM module. It supports multiple trigger sources for the S100 and generates multi-channel configurable PWM signals for external cameras (which can be forwarded via SerDes), thereby achieving synchronization between the trigger source and cameras, as well as synchronization among multiple cameras.

##### LPWM Configuration Items
1. **trigger_mode [0, 1]**: LPWM trigger mode
   - 0: Internal software trigger
   - 1: External trigger

2. **trigger_source [0, 10]**: LPWM trigger source.
   To use an external trigger source, set `trigger_mode = 1`.
   In typical scenarios, use **0** with a default trigger period of 1 second.

| trigger_source Value | Corresponding Trigger Source |
|----------------------|-------------------------------|
| 0                    | aon_rtc_pps                   |
| 1                    | reserve                       |
| 2                    | pps0                          |
| 3                    | pps1                          |
| 4                    | pps2                          |
| 5                    | reserve                       |
| 6                    | pcie0_ptm_pps                 |
| 7                    | pcie1_ptm_pps                 |
| 8                    | acore_eth0_pps                |
| 9                    | acore_eth1_pps                |
| 10                   | mcu_eth_pps                   |

3. **period [2, 1000000) μs**: Period of the LPWM output square wave.
4. **offset [0, 1000000) μs**: Offset time of the first waveform within each trigger cycle. Must be smaller than `period`.
5. **duty_time [0, 4096) μs**: Effective high-level duration of the LPWM output waveform. Must be smaller than `period`.
6. **threshold [0, 65535] μs**: Threshold for slow synchronization. Advanced feature; can usually be ignored.
7. **adjust_step [0, 15]**: Adjustment step per cycle.
   `adjust_time = 2^adjust_step`. Advanced feature; can usually be ignored.

##### LPWM Configuration Calculation
The LPWM trigger source is typically PPS with a common period of **1 second**.
After receiving a trigger signal, LPWM first delays by the configured `offset`, then outputs continuous square waves. The waveform period and effective high-level duration are determined by configuration. When the next trigger arrives, the delay and waveform generation repeat.

The `offset` setting depends on the sensor **fps**:
- If 1 second cannot be divided evenly by fps, `offset` must be configured.
- Otherwise, set `offset = 0`.

**Example: 30 fps sensor**

- `period = 1 s / fps = 33333 μs`
- After 30 frames, the total time is 999,990 μs, leaving a **10 μs gap** until the next PPS trigger.
- Therefore, `offset` should be set to **10 μs** (minimum 10 μs, maximum `period - duty_time` μs).
  To be safe, add **1** to the calculated offset; otherwise, LPWM will output 31 pulses within 1 second.

Due to hardware or peripheral differences, PPS may fall in the high-level region.
If slow synchronization is disabled or completed, LPWM must finish the current high-level period before entering the next trigger cycle (and recalculating `offset`).
This may result in fewer waveforms than expected per trigger cycle, causing the sensor frame rate to deviate from the target in exposure-synchronized mode.
In such cases, **increase `offset` appropriately** to ensure PPS always falls in the low-level region and outputs the expected waveform.

```
Period = 1000000 / fps
Offset = 1000000 - Period * fps + 1
```

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/lpwm_01.png" alt="LPWM diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

Recommended Configurations
| Usage Scenario       | trigger_source       | trigger_mode | duty_time | offset | period        |
|----------------------|----------------------|--------------|-----------|--------|---------------|
| All 30 fps           | 8(eth0)/9(eth1)      | 1            | 100       | 11     | 33333         |
| All 25 fps           | 8(eth0)/9(eth1)      | 1            | 100       | 11     | 40000         |
| 12.5/25 fps          | 8(eth0)/9(eth1)      | 1            | 100       | 11     | 80000/40000   |
| 30/10 fps            | 8(eth0)/9(eth1)      | 1            | 100       | 11     | 33333/100000  |

##### Other Notes
When the MCU RTC function is enabled, the CIM hardware automatically latches the timestamp corresponding to the LPWM trigger signal.
Software synchronizes this timestamp with `global_time` and provides it to the user.
When the sensor operates in **exposure synchronization mode**, this timestamp represents the start time of sensor exposure triggering.

When the sensor is in frame-synchronized output or unsynchronized mode, the sensor exposure start time is **not related** to the LPWM signal.
In other words, there is no correlation between CIM frame start (tv) and LPWM trigger (trig_tv) time.
In this case, the timestamp has no reference value and can be ignored.

In actual use, ensure PPS stably falls in the **low-level region** by appropriately increasing `offset` based on debugging results.

### Data Flow and Performance Metrics

After RDK-S100 connects to cameras, the data flows through subsequent processing modules as shown below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/47ab7cc928ceb5b8e03de23bb95d057b.png" alt="Data Flow and Performance Metrics diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

- **MIPI RX**: 3 CDPHY lanes, each supporting either DPHY up to 4.5 Gbps/lane × 4 lanes or CPHY up to 3.5 Gbps/trio × 3 trios. Each lane supports 4 virtual channels (VCs), theoretically allowing up to 12 camera inputs.

| RDK-S100 software is expected to support up to 6 cameras: RX4 can connect up to 4 cameras via SerDes, while RX0 and RX1 each connect to 1 camera. For non-standard configurations, please consult an FAE for confirmation. |
|:---------------------------------------------------------------------------------------------------------------------------------------------------------|


:::tip
The commercial version offers more comprehensive feature support, deeper hardware capability exposure, and exclusive customization options. To ensure compliance and secure delivery, access to the commercial version will be granted through the following process.

**Commercial Version Access Process:**  
1. **Complete a questionnaire**: Submit your organization’s information and intended use case.  
2. **Sign an NDA**: We will contact you based on your submission to finalize and sign a Non-Disclosure Agreement.  
3. **Content release**: After NDA execution, we will provide access to commercial documentation via a private channel.  

If you wish to access the commercial version, please complete the questionnaire below. We will contact you within 3–5 business days:  

Questionnaire link: https://horizonrobotics.feishu.cn/share/base/form/shrcnJQBMIkRm6K79rjXR0hr0Fg  
:::

- **CIM**: Receives input from RX and can output online to ISP0/ISP1 (RAW) or PYM0/PYM1 (YUV), or store offline to DDR for subsequent modules to access via DDR.

- **ISP**: Two ISP units, each supporting 4 online + 8 offline inputs. Each ISP can handle up to 2×4K@60fps.

- **PYM**: Three PYM units—PYM0/PYM1 are full-featured and support both online/offline modes, while PYM4 supports offline only, with 4K@60fps processing capability.

- **GDC**: One GDC unit, supporting offline mode only, with 4K@60fps processing capability.

 |                   | CIM         | ISP0 / ISP1  | PYM0 / PYM1  | PYM4        | GDC         | YNR        | STITCH     |
 |-------------------|-------------|--------------|--------------|-------------|-------------|------------|------------|
 | Per-frame latency at 1080p | 3.7151 ms   | 1.8616 ms    | 2.2373 ms    | 2.7616 ms   | 3.7447 ms   | 1.7774 ms  | 1.5739 ms  |
 | Per-frame latency at 4K    | 14.8606 ms  | 7.4467 ms    | 7.1356 ms    | 10.7018 ms  | 15.0624 ms  | 7.1096 ms  | 5.7349 ms  |

### Camsys Input Capability

The S100 Camsys hardware theoretically supports up to 8×4K RAW @30fps + 4×1536p YUV @30fps.  
Validated maximum input configurations include:  
1. 3×4K RAW (3840×2160) @30fps + 9×1280p RAW (1920×1280) @30fps;  
2. 3×4K RAW (3840×2160) @30fps + 5×1280p RAW (1920×1280) @30fps + 4×1536p YUV (1920×1536) @30fps.

### Supported Sensors

 | Type          | Sensor Name | Notes           |
 |---------------|-------------|-----------------|
 | MIPI sensor   | IMX219      | raw10, 1080p    |
 | GMSL sensor   | 0820c       | yuv, 4K & 1080p |
 |               | OVX3C       | raw12, 1280P    |
 |               | OVX8B       | raw12, 4K       |
## V4L2  
Some modules of the S100 Camsys have already been integrated with V4L2, allowing acquisition of Camsys data streams through standard V4L2 programming and open-source tools.

### Usage

After system boot-up, camsys runs in hbn mode by default. You can switch to V4L2 mode by loading the camsys V4L2 kernel module (ko).

Switching to V4L2 mode:
```c
  # Unload hbn drivers
  rmmod hobot_isp
  rmmod hobot_cim
  rmmod hobot_mipidbg
  rmmod hobot_mipicsi
  rmmod hobot_pym_jplus
  rmmod hobot_gdc
  rmmod hobot_ynr

  # Load V4L2 drivers
  echo ion > /sys/module/hobot_camsys_adapter/parameters/mops # ion or dma optional
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
  modprobe vid_v4l2 scene=[scene num] # See table below for scene num
  or modprobe vid_v4l2 scene_table="xxx"
  nohup isp_service &
```

Scene construction methods:
1. For existing scenes, directly specify using scene num:
```c
modprobe vid_v4l2 scene=[scene num]
```
2. For custom scenes, construct using a scene table:
```c
modprobe vid_v4l2 scene_table="{<pre_module><hw_id>-<ctx_id>,<pad>,<next_module><hw_id>-<ctx_id>,<pad>,1}{...}..."
# Parameter explanation:
# Each {} represents a connection between two modules.
# pre_module and next_module specify the connected modules; valid values include cim, isp, ynr, pym, gdc, video, video-m2c.
# hw_id specifies the hardware ID.
# ctx_id specifies the hardware context ID.
# pad is the pad number, usually 0. For example, pym supports multi-channel output and can be configured from 0 to 5.
# The final next_module in a pipeline must be specified as either video or video-m2m.
# Note: The scene string passed via scene_table must NOT contain spaces.
# Example: scene_table="{cim0-0,0,isp0-0,0,1}{isp0-0,0,video,0,1}" constructs a cim0-otf-isp0-ddr scene.
# Example for scene 9 below: scene_table="{cim0-0,0,isp1-4,0,1}{cim1-0,0,isp1-5,0,1}{isp1-4,0,ynr1-4,0,1}{isp1-5,0,ynr1-5,0,1}{ynr1-4,0,pym1-0,0,1}{ynr1-5,0,pym1-1,0,1}{pym1-0,0,video,0,1}{pym1-1,0,video,0,1}"
```

Scene switching method:
```c
rmmod vid_v4l2
modprobe vid_v4l2  xxx=xxxx### Scene Description
```

### Scene Description
<DocScope products="RDK-S100">

| scene num | Scene Summary                 | Scene Description                   | Corresponding Video Nodes (Relative) |
|-----------|-------------------------------|-------------------------------------|--------------------------------------|
| 0         | CIM-DDR Output                | CIM0 outputs 1 stream to DDR (video0) | video0                             |
|           |                               | CIM1 outputs 1 stream to DDR        | video1                             |
|           |                               | CIM4 outputs 4 streams to DDR (SerDes scenario) | video2~5                     |
| 1         | CIM-OTF-ISP-DDR               | CIM0-OTF-ISP0-DDR                   | video0                             |
|           |                               | CIM1-OTF-ISP1-DDR                   | video1                             |
| 2         | CIM-OTF-ISP-OTF-PYM-DDR (2 streams) | CIM0-OTF-ISP0-OTF-PYM0,         | video0 corresponds to first PYM ds0 |
|           |                               | PYM outputs one channel             |                                    |
|           |                               | CIM1-OTF-ISP1-OTF-PYM1,             | video1 corresponds to second PYM ds0|
|           |                               | PYM outputs one channel             |                                    |
| 3         | CIM-OTF-ISP-OTF-PYM-DDR       | CIM0-OTF-ISP0-OTF-PYM0,             | video0~video5 correspond to ds0~5  |
|           | 2 streams, 6 channels output  | PYM outputs 6 channels              |                                    |
|           |                               | CIM1-OTF-ISP1-OTF-PYM1,             | video6~video11 correspond to ds0~ds5|
|           |                               | PYM outputs 6 channels              |                                    |
| 4         | CIM-DDR-ISP-DDR               | CIM0-DDR-ISP0-DDR                   | video0                             |
|           |                               | CIM1-DDR-ISP1-DDR                   | video1                             |
| 5         | CIM-DDR-ISP-OTF-PYM           | CIM0-DDR-ISP0-OTF-PYM0              | video0                             |
|           |                               | Outputs one channel                 |                                    |
| 6         | CIM-OTF-ISP-DDR-GDC           | CIM0-OTF-ISP-DDR-GDC                | video0                             |
|           |                               | Outputs one channel                 |                                    |
| 7         | DDR-PYM-DDR Loopback Output   | Loopback PYM outputs 6 streams to DDR | video0 ~ 5                       |
|           |                               | Loopback PYM outputs 6 streams to DDR | video6 ~ 11                      |
|           | DDR-GDC-DDR Loopback Output   | Loopback GDC outputs to DDR         | video12                            |
|           |                               | Loopback GDC outputs to DDR         | video13                            |
| 9         | CIM-DDR-ISP-OTF-YNR-PYM       | CIM0-DDR-ISP1-OTF-YNR1-OTF-PYM1     | video0                             |
|           |                               | CIM1-DDR-ISP1-OTF-YNR1-OTF-PYM1     | video1                             |

</DocScope>
<DocScope products="RDK-S600">

| scene num | Scene Summary                          | Scene Description                                      | Corresponding Video Nodes (Relative) |
|-----------|----------------------------------------|--------------------------------------------------------|--------------------------------------|
| 0         | CIM-DDR Output                         | CIM4 outputs 1 stream to DDR (video0)                 | video0                               |
|           |                                        | CIM5 outputs 1 stream to DDR                           | video1                               |
|           |                                        | CIM0 outputs 4 streams to DDR (SerDes scenario)       | video2~5                             |
|           |                                        | CIM1 outputs 4 streams to DDR (SerDes scenario)       | video6~9                             |
|           |                                        | CIM2 outputs 4 streams to DDR (SerDes scenario)       | video10~13                           |
|           |                                        | CIM3 outputs 4 streams to DDR (SerDes scenario)       | video14~17                           |
| 1         | CIM-DDR-ISP-DDR                        | CIM4-DDR-ISP0-DDR                                      | video0                               |
|           |                                        | CIM5-DDR-ISP1-DDR                                      | video1                               |
| 2         | CIM-DDR-ISP-OTF-YNR-OTF-PYM (2 streams)| CIM4-DDR-ISP3-OTF-YNR3-OTF-PYM3-DDR                    | video0                               |
|           |                                        | CIM5-DDR-ISP3-OTF-YNR3-OTF-PYM3-DDR                    | video1                               |
| 3         | CIM-DDR-ISP-OTF-YNR-OTF-PYM            | CIM4-DDR-ISP3-OTF-YNR3-OTF-PYM3, PYM outputs 6 channels | video0~video5                      |
|           | 2 streams, 6-channel output            | CIM5-DDR-ISP3-OTF-YNR3-OTF-PYM3, PYM outputs 6 channels | video6~video11                     |
| 4         | CIM-DDR-ISP-DDR                        | CIM4-DDR-ISP0-DDR                                      | video0                               |
|           |                                        | CIM5-DDR-ISP1-DDR                                      | video1                               |
| 5         | CIM-DDR-ISP-OTF-YNR-OTF-PYM            | CIM4-DDR-ISP3-OTF-YNR3-OTF-PYM3-DDR                    | video0                               |
| 6         | CIM4-OTF-ISP0-DDR-GDC one-channel output | CIM4-OTF-ISP0-DDR-GDC one-channel output             | video0                               |
| 7         | DDR-PYM-DDR loopback output            | Loopback PYM outputs 6 streams to DDR                  | video0 ~ 5                           |
|           |                                        | Loopback PYM outputs 6 streams to DDR                  | video6 ~ 11                          |
|           | DDR-GDC-DDR loopback output            | Loopback GDC outputs to DDR                            | video12                              |
|           |                                        | Loopback GDC outputs to DDR                            | video13                              |
| 9         | CIM-DDR-ISP-OTF-YNR-OTF-PYM            | CIM4-DDR-ISP3-OTF-YNR3-OTF-PYM3                        | video0                               |
|           |                                        | CIM5-DDR-ISP3-OTF-YNR3-OTF-PYM3                        | video1                               |
|           |                                        | CIM0-DDR-ISP0-OTF-YNR0-OTF-PYM0 outputs 4 streams (SerDes scenario) | video2~5                  |
|           |                                        | CIM1-DDR-ISP1-OTF-YNR1-OTF-PYM1 outputs 4 streams (SerDes scenario) | video6~9                  |
|           |                                        | CIM2-DDR-ISP2-OTF-YNR2-OTF-PYM2 outputs 4 streams (SerDes scenario) | video10~13                |
|           |                                        | CIM3-DDR-ISP3-OTF-YNR3-OTF-PYM3 outputs 4 streams (SerDes scenario) | video14~17                |

</DocScope>

(Other link scenarios are currently unsupported and will be continuously updated.)

### v4l2 Buffer Allocation Methods
There are currently two buffer allocation methods: **ion** and **dma**. The **ion** method is used by default.

Supported io_mode for Each Buffer Allocation Method
| Buffer Allocation Method | Supported io_mode         |
|--------------------------|---------------------------|
| ion                      | mmap                      |
| dma                      | mmap dambuf userptr       |

Buffer Allocation Method Switching Procedure

```c
# Unload the vid_v4l2 driver if it is already loaded
rmmod vid_v4l2

# Set the buffer allocation method to ion or dma
echo ion > /sys/module/hobot_camsys_adapter/parameters/mops
or
echo dma > /sys/module/hobot_camsys_adapter/parameters/mops

# Reload the previously unloaded vid_v4l2 driver
modprobe vid_v4l2  xxx=xxxx
```

#### Check the Current Buffer Allocation Method
```c
cat /sys/module/hobot_camsys_adapter/parameters/mops
```


## camsys sample

### imx219 + MIPI + CIM + ISP + PYM:

```c
         // Sample configuration for imx219
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
        .mipi_cfg = &imx219_mipi_config, // MIPI configuration; NULL means auto-detection
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
        .clear_record = 0, // Not obtained from JSON or code; set to 0
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

         // imx219 initialization
hbn_camera_create(camera_config, &cam_fd);

// cim initialization
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

// isp initialization
hbn_vnode_open(HB_ISP, hw_id, ctx_id, &isp_node_handle);
hbn_vnode_set_attr(isp_node_handle, &isp_config->isp_attr);
hbn_vnode_set_ichn_attr(isp_node_handle, 0, &isp_config->ichn_attr);
hbn_vnode_set_ochn_attr(isp_node_handled, 0, &isp_config->ochn_attr);

  
// pym initialization
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

// vflow initialization
hbn_vflow_create(&vflow_fd);
hbn_vflow_add_vnode(vflow_fd, vin_node_handle);
hbn_vflow_add_vnode(vflow_fd, isp_node_handle);
hbn_vflow_add_vnode(vflow_fd, pym_node_handle);
hbn_camera_attach_to_vin(cam_fd, vin_node_handle);
hbn_vflow_bind_vnode(vflow_fd, vin_node_handle, 0, isp_node_handle, 0);
hbn_vflow_bind_vnode(vflow_fd, isp_node_handle, 0, pym_node_handle, 0);
hbn_vflow_start(vflow_fd);

// Get image from pym and return buffer
hbn_vnode_getframe_group(pym_node_handle, 0, VP_GET_FRAME_TIMEOUT, out_image_group);
fill_image_frame_from_vnode_image_group(frame, ochn_id);
memcpy(frame_buffer, frame.data[0], frame.data_size[0]); // frame_buffer is the obtained complete image
if (frame.plane_count > 1)
    memcpy(frame_buffer + frame.data_size[0], frame.data[1], frame.data_size[1]);
hbn_vnode_releaseframe_group(pym_node_handle, 0, out_image_group);                                                                                                                                                                                          |
```

### 0820c + 96712 deserializer + MIPI + CIM + PYM:

```c
// Sample configuration for 0820c
static mipi_config_t ar0820std_mipi_config = {.rx_enable = 1,
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

 // AR0820C initialization
hbn_camera_create(camera_config, &cam_fd);

// MAX96712 deserializer initialization
hbn_deserial_create(deserial_config, &des_fd);

// CIM initialization
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
}// pym initialization
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

// vflow initialization
hbn_vflow_create(&vflow_fd);
hbn_vflow_add_vnode(vflow_fd, vin_node_handle);
hbn_vflow_add_vnode(vflow_fd, pym_node_handle);
hbn_camera_attach_to_deserial(cam_fd, des_fd, 0);
hbn_deserial_attach_to_vin(des_fd, 0, vin_node_handle);
hbn_vflow_bind_vnode(vflow_fd, vin_node_handle, 0, pym_node_handle, 0);
hbn_vflow_start(vp_vflow_contex->vflow_fd);

// Get image from pym and return the buffer
hbn_vnode_getframe_group(pym_node_handle, 0, VP_GET_FRAME_TIMEOUT, out_image_group);
fill_image_frame_from_vnode_image_group(frame, ochn_id);
memcpy(frame_buffer, frame.data[0], frame.data_size[0]); // frame_buffer is the obtained complete image
if (frame.plane_count > 1)
    memcpy(frame_buffer + frame.data_size[0], frame.data[1], frame.data_size[1]);
hbn_vnode_releaseframe_group(pym_node_handle, 0, out_image_group);

```

### GDC STITCH Stitching Sample

This sample uses a data-replay workflow: it reads files from system storage as input images for GDC, calls hbn APIs, performs GDC processing based on the GDC configuration binary file, and then stitches the GDC output images using the stitch API along with the corresponding stitching LUT table file to generate a bird's-eye-view image.

Original rear-view image and its GDC-processed output:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch0.png" alt="GDC STITCH Stitching Sample diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch1.png" alt="GDC STITCH Stitching Sample diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

Original front-view image and its GDC-processed output:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch2.png" alt="GDC STITCH Stitching Sample diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch3.png" alt="GDC STITCH Stitching Sample diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

Original left-view image and its GDC-processed output:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch4.png" alt="GDC STITCH Stitching Sample diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch5.png" alt="GDC STITCH Stitching Sample diagram" style={{ width: '40%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

Original right-view image and its GDC-processed output:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch6.png" alt="GDC STITCH Stitching Sample diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch7.png" alt="GDC STITCH Stitching Sample diagram" style={{ width: '40%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

Final stitched output image:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch8.png" alt="GDC STITCH Stitching Sample diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

Corresponding ROI region division for stitching:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sample_stitch9-en.jpg" alt="GDC STITCH Stitching Sample diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

  |ROI   |Range                              | SRC0     | Start Point | Size        | SRC1     | Start Point | Size        | Destination Start | Mode           | Direction    |
  |----- |-----------------------------------| ---------| -----------| ------------| ---------| -----------| ------------| ------------------| ---------------| --------|
  |0     |Left-view frame2                   | frame 2  | (10, 0)    | (390, 778)  |          |            |             | (0, 16)           | 3 Direct copy  |         |
  |1     |Right-view frame3                  | frame 3  | (10, 0)    | (390, 780)  |          |            |             | (506, 14)         | 3 Direct copy  |         |
  |2     |Rear-view frame0                   | frame 0  | (0, 0)     | (896, 298)  |          |            |             | (0, 598)          | 3 Direct copy  |         |
  |3     |Front-view frame1                  | frame 1  | (4, 0)     | (892, 298)  |          |            |             | (0, 0)            | 3 Direct copy  |         |
  |4     |Overlap between left and front views| frame 2  | (10, 0)    | (390, 282)  | frame 1  | (2, 16)    | (390, 282)  | (0, 16)           | 1 Alpha blend  | 0 Top-left |
  |5     |Overlap between right and front views| frame 3 | (10, 0)    | (388, 284)  | frame 1  | (508, 14)  | (388, 284)  | (506, 14)         | 1 Alpha blend  | 3 Top-right|
  |6     |Overlap between left and rear views | frame 2  | (10, 582)  | (390, 196)  | frame 0  | (0, 0)     | (390, 196)  | (0, 598)          | 1 Alpha blend  | 2 Bottom-left|
  |7     |Overlap between right and rear views| frame 3  | (10, 584)  | (390, 196)  | frame 0  | (506, 0)   | (390, 196)  | (506, 598)        | 1 Alpha blend  | 1 Bottom-right|


STITCH configuration parameters:
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


STITCH initialization
```c
int32_t init_stitch(test_ctx_t *test_ctx)
{
        int32_t ret = 0, i;
        hbn_buf_alloc_attr_t alloc_attr = {0};
        char res_file_name[128] = {0};
        struct stat fileStat;

        ret = hbn_vnode_open(HB_STITCH, 0, -1, &test_ctx->sth_handle);```c
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

### 2v imx219 + MIPI + CIM + ISP + PYM + STITCH stitching and encoding sample

This sample acquires two video streams from a pipeline consisting of two IMX219 sensors, CIM, ISP, PYM, and other modules, then stitches the two streams vertically via the STITCH CODEC module into a single H.264 file named `cim-isp-pym-stitch.h264`.

Test procedure:

After installing two IMX219 sensors, power on the device and execute the following commands:

```bash
sunrise@ubuntu:~$ cd /app/multimedia_demo/camsys_demo/sample_2v_219_stitch_codec/
sunrise@ubuntu:/app/multimedia_demo/camsys_demo/sample_2v_219_stitch_codec$ make
sunrise@ubuntu:/app/multimedia_demo/camsys_demo/sample_2v_219_stitch_codec$ ./sample_2v_219_stitch_codec
```

The generated `cim-isp-pym-stitch.h264` file playback is shown below:

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/sth_codec_2025-06-24_20-37-19.png" alt="2v imx219 + MIPI + CIM + ISP + PYM + STITCH sti... diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />


STITCH configuration parameters:
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


Create a vflow pipeline:
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
```Create another vflow and bind both vflows to the same stitch:
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

Configure the CODEC encoding module:
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

Continuously fetch frames, send them to the CODEC for encoding, then retrieve encoded frames from the CODEC and save them as an H.264 file:
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
### imx219 + MIPI + CIM + ISP + PYM:
```c
v4l2-ctl -d 0 --set-fmt-video=width=1920,height=1080,pixelformat=NV12 --stream-mmap --stream-count=120 --stream-to=/userdata/test.yuv
```

### imx219 + MIPI + CIM + ISP + GDC:
```c
The v4l2 GDC application currently cannot generate config bin files from JSON files, so v4l2 GDC testing can only be performed using pre-generated config bin files.
Compared with the original v4l2 stream capture code, the v4l2 GDC stream capture code requires the following additional configurations:

# Need to add GDC input image width and height parameter configuration
if (TestContext[i].gdc_cfg) {
    TestContext[i].pic_width = 1920;
    TestContext[i].pic_height = 1080;
    TestContext[i].in_pic_width = 1920;  // Newly added input image width
    TestContext[i].in_pic_height = 1080; // Newly added input image height
}

# Need to add GDC config configuration
// Allocate memory for GDC config bin
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

// ioctl interface to send configuration to GDC v4l2 driver
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
    // Get GDC config bin size
    ret = fstat(fileno(file), &fileStat);
    if (ret) {
        perror("Error getting file status");
        goto err;
    }

    vio_gtest_info("File size: %ld bytes\n", fileStat.st_size);
    // Allocate memory to store GDC config bin
    ret = map_gdc_config_buffer(&hb_common_buf, fileStat.st_size);
    if (ret)
        goto err;
    // Copy GDC config bin content into the allocated memory
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
    // GDC input image width and height
    gpm[winfo->pipe_id].gdc_config.output_width = ptc->pic_width;
    gpm[winfo->pipe_id].gdc_config.output_height = ptc->pic_height;
    gpm[winfo->pipe_id].gdc_config.output_stride = ALIGN_UP(ptc->pic_width, STRIDE_ALIGN);
    // GDC output image width and height
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

    // Send configuration to GDC v4l2 driver
    ret = v4l2_set_ext_ctrl(winfo->priv_fd, V4L2_CID_DR_GDC_ATTR, &gpm[winfo->pipe_id]);
    if (ret) {
        vio_gtest_err("v4l2_set_ext_ctrl error!!!\n");
        goto err;
    }

err:
    fclose(file);
    return ret;

}

# Release GDC config bin
void v4l2_gdc_deinit (vpm_test_context *ptc)
{
    work_info_t *winfo = &ptc->work_info;
    hb_mem_free_buf_with_vaddr((uint64_t)gpm[winfo->pipe_id].gdc_config.config_addr);
}
```