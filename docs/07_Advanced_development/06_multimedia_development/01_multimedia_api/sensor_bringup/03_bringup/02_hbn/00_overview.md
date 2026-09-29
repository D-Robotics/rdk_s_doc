---
sidebar_position: 0
title: "HBN Camera 调试总览"
description: "HBN camera 点亮流程：dts、sensor_module_t、vp_sensor、效果库、示例"
---

# HBN Camera 调试总览

## 范围

- 本章节概述 Camera Bring-Up 的流程，帮助读者快速掌握 Camera 框架。
- 说明如何新增 Camera 配置并成功点亮 Camera。
- 各 Sensor 厂家具体实现（驱动、App、sample程序验证）与常见问题请参见下方「文档组成」中的对应章节。

## 文档组成

| 章节                                                                                                                               | 说明                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [HBN Camera 调试总览](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/hbn/overview)                 | 流程概览、准备工作、设备树与驱动/App 通用说明、验证概要 |
| [SmartSens Sensor Bring-Up](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/hbn/mipi/smartsens) | SmartSens 系列 sensor sc132gs 驱动、App 配置与程序验证  |
| [Camera Sensor FAQ](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/camera_faq)                 | I2C/MIPI/Sensor 等常见问题与排查方法               |


建议先通读本文掌握整体步骤与通用配置，再按所选用 sensor 厂家阅读对应分章节。

---

## 准备工作

- **软件资源**：系统 BSP、sensor datasheet、sensor 的初始化序列。
- **硬件资源**：RDK 开发板及待适配的 Camera 模组、原理图和 PCB，详见 [模组硬件信息](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/module_check#模组硬件信息)。的备注信息

各平台 MIPI RX 路数、I2C/LPWM/GPIO 资源不同：

:::doc_scope{products="RDK S100"}
S100：3 路 MIPI RX（RX0/RX1/RX4），每路 4VC，最多 12 路接入；I2C1/2/3、LPWM0/1/2。
:::

:::doc_scope{products="RDK S600"}
S600：6 路 MIPI RX（RX0-RX5），每路 4VC，最多 24 路接入；I2C0-5、LPWM0/1/2/3。
:::

---

## 新 sensor 点亮步骤

适配新 Camera 时，需完成以下步骤（具体操作与示例见各厂家 bringup 文档）：

1. **修改平台设备树 (dts)**：按硬件设计配置 sensor 上电 GPIO、I2C、MCLK、LPWM。
2. **添加 sensor 驱动代码**：实现 `sensor_module_t` 的初始化/反初始化、开流/关流、上下电、增益/曝光控制等接口。
3. **添加 camera App 代码**：配置 MIPI、SIF、camera sensor、LPWM、ISP 等参数。
4. **示例程序运行**：用 get_vin_data / get_isp_data 查看 raw 图、帧率与 ISP 图像是否符合预期。
5. **ISP 图像调试预览**：连接 hbplayer，验证驱动增益与曝光控制，搭建 ISP 调试环境。

---

## 修改平台设备树 (dts)

dts 代码位于 BSP 的 `source/hobot-drivers/kernel-dts/`

设备树需根据实际硬件选择对应 dts，S100 与 S600 的 camsys dts 文件、vcon/host 数量、I2C/LPWM 编号均不同，按平台选择：

:::doc_scope{products="RDK S100"}
S100 有 3 路 MIPI RX 对应 3 个 vcon `vin_vcon0/1/4`、I2C1/2/3、LPWM0/1/2。vcon0 配置示例：

```dts
&i2c1 { 
        status = "okay";         
};
&lpwm0 { 
        
        status = "okay"; 
};

&vin_vcon0 {
        status = "okay";
        bus = <1>;          // i2c1
        gpio_oth = <502>;   // reset gpio（SPI1_CSN0 -> sensor0_gpio_en）
        lpwm_chn = <0>;     // lpwm0 channel0
        rx_phy = <1 0>;     // 1=dphy, 2=cphy
};
```
:::

:::doc_scope{products="RDK S600"}
S600 有 6 路 MIPI RX（`mipi_host0-5`）、6 个 vcon（`vin_vcon0-5`）、I2C0-5、LPWM0/1/2/3。vcon0 配置示例：

```dts
&i2c4 { 
        status = "okay"; 
};
&lpwm0 { 
        status = "okay"; 
};          // lpwm0

&vin_vcon0 {
        status = "okay";
        bus = <0>;                   // i2c0
        lpwm_chn = <0 1>;            // 双 channel
        gpio_poc = <0 362 374>;      // POC 供电/回读
        gpio_des = <0 406>;          // deserial
        poc_map = <0x0213>;          // POC 与 link 映射
        rx_phy = <1 0>;
};
```
:::

### 1. sensor GPIO 配置

- GPIO number 需要在 dts vcon 中与 MIPI RX 端口进行绑定。
- GPIO 编号配置参考 [GPIO 驱动调试指南](/Advanced_development/driver_development/driver_gpio_dev) 和 [GPIO 应用 hb_gpioinfo 工具介绍](/Advanced_development/driver_development/driver_gpio_dev#查看-gpio-使用状态)。

### 2. sensor I2C 配置

- I2C bus number 需要在 dts vcon 中与 MIPI RX 端口进行绑定。
- I2C 配置参考 [I2C 驱动调试指南](/Advanced_development/driver_development/driver_i2c_dev) [设备树配置](/Advanced_development/driver_development/driver_i2c_dev#设备树配置)。


### 4. sensor LPWM 配置

- lpwm channel number 需要在 dts vcon 中与 MIPI RX 端口进行绑定。
- lpwm 配置参考 [PWM 驱动调试指南](/Advanced_development/driver_development/driver_pwm) [设备树配置](/Advanced_development/driver_development/driver_pwm#设备树配置)。

dts 配置正确，并且硬件 sensor 正确连接后，手动输入命令供电 便可以使用 i2cdetect 检测到模组的 i2c 地址。

详细步骤参考 [硬件状态确认](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/module_check#硬件状态确认)。

## 添加 sensor 驱动代码

不同厂家 Sensor 驱动风格不同，需统一适配到 Camera 驱动框架。

### 驱动位置与命名

- **源码路径**：`source/hobot-camera/drivers/sensor/`
- **部署路径**：编译生成的 `lib<sensor_name>.so` 拷贝到设备 `/usr/hobot/lib/sensor/`
- **文件命名**：`<sensor_name>_utility.c`；**结构体/模块名**：与 `<sensor_name>` 一致（如 sc132gs、os08c10、imx586 等），详见各厂家 bringup。

### sensor_module_t 接口

- `sensor_module_t` 只承载 sensor 自身 ops（init/start/stop/3A/寄存器访问等），
- GMSL 与 MIPI 驱动差异：GMSL 驱动用 `SENSOR_MODULE_ECF` 宏（带入 `sensor_emode` 表和 `sensor_config_index_funcs` 表两个 GMSL 专有机制），MIPI 驱动用 `SENSOR_MODULE_F`（只带 flag）。

**1. sensor_module_t 命名规则**

| 项目       | 命名要求                  | 示例                |
| ---------- | ------------------------- | ------------------- |
| 文件名     | `<sensor_name>_utility.c` | `sc132gs_utility.c` |
| 结构体名   | `<sensor_name>`           | `sc132gs`           |
| module字段 | `<sensor_name>`           | `"sc132gs"`         |

**2. sensor_module_t 接口实现**

驱动需实现 `sensor_module_t`，并实现以下接口：

| 函数接口            | 功能描述                         | 调用时机                                        |
| ------------------- | -------------------------------- | ----------------------------------------------- |
| `init`              | Sensor 初始化、Setting 下发      | hbn_camera_attach_to_vin                        |
| `deinit`            | Sensor 去初始化                  | hbn_camera_destroy / hbn_camera_detach_from_vin |
| `start`             | Sensor 开流                      | hbn_vflow_start                                 |
| `stop`              | Sensor 关流                      | hbn_vflow_stop                                  |
| `power_on`          | Sensor 上电                      | hbn_camera_attach_to_vin                        |
| `power_off`         | Sensor 下电                      | hbn_camera_destroy / hbn_camera_detach_from_vin |
| `aexp_gain_control` | 增益控制                         | ISP 算法调用                                    |
| `aexp_line_control` | 曝光控制                         | ISP 算法调用                                    |
| `userspace_control` | 用户回调控制开关（AE/AWB/AF 等） | 用户控制                                        |

**3. 3A 控制**

对于 3A 控制，即userspace_control，本平台支持驱动注册和应用层回调两种方式，默认使用应用层回调函数的方式，接口定义如下：

| 函数                | 功能               | 传入参数                                                                                                                                                                                        |
| ------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aexp_gain_control` | sensor 增益控制    | info：sensor 总线信息<br />mode：sensor 运行模式；linear/hdr/pwl<br />again：sensor again 参数，最大4个<br />dgain：sensor dgain 参数，最大4个<br />gain_num：sensor gain 参数个数              |
| `aexp_line_control` | sensor 曝光控制    | info：sensor 总线信息<br />mode：sensor 运行模式；linear/hdr/pwl<br />line：sensor line 参数，最大4个<br />line_num：sensor line 参数个数                                                       |
| `awb_control`       | sensor 端 awb 控制 | info：sensor 总线信息<br />mode：sensor 运行模式；linear/hdr/pwl<br />rgain：sensor rgain<br />bgain：sensor bgain<br />grgain：sensor rrgain<br />gbgain：sensor gbgain                        |
| `userspace_control` | hal 层各类控制开关 | port：sensor 端口号<br />enable：使能用户回调控制开关，默认全部关闭<br />位定义：<br />- `HAL_LINE_CONTROL` 0x00000001<br />- `HAL_GAIN_CONTROL` 0x00000002<br />- `HAL_AWB_CONTROL` 0x00000004 |

### 关键概念

1. **vts/framelength**：每帧总行数（有效行 + 消隐行），不同 sensor 命名可能不同，是计算曝光 / 行时间的核心参数。
2. **lines_per_second**：每秒曝光总行数，可通过 1/每行时间 或 fps×vts 计算。
3. **gain lut 表**：ISP 3A 算法输出的增益索引值与 sensor 硬件寄存器值的映射表，分为 analog gain 和 digital gain 两类，共 256 个控制点（索引 0-255）。这个映射表需要用户自己生成，后面会对不同厂家提供生成方式举例。
4. **gain 倍率转换**：所有 gain 索引值（X）对应的实际倍率计算公式为 2^(X/32)，控制曲线为对数型。
5. **gain 量化基准 8192**：ISP AE 算法下发的 gain 值以 **8192（2^13）** 为最小步进的定点数，实际倍率 = gain 值 / 8192。sensor 驱动收到后 `gain值 / 8192` 取整作为 LUT 索引查表。因此 `analog_gain_max` / `digital_gain_max` 必须写成 `索引值 × 8192`（如 `128 * 8192`），表示最大可用到索引 128；填 0 表示该路 gain 不使用。
6. **analog_gain_max / digital_gain_max**：a_gain / d_gain 最大倍率，格式为 `索引值 × 8192`。与 gain_lut 最大索引对应，ISP 在此范围内分配 gain。
7. **exposure_time_min / exposure_time_max**： 分别为短曝光每帧最小/最大曝光行数。
8. **exposure_time_long_max**：长曝光每帧最大曝光行数，HDR sensor 会用到。
9. **sensor 初始增益曝光值**，供isp ae算法使用，影响前几帧图像的亮度。如果关心前几帧图像亮度需要配置，配置值为sensor setting的寄存器初始值的index值和曝光行数。

    - **analog_gain_init**: sensor analog gain 初始值。可选配置。
    - **digital_gain_init**：sensor digital gain 初始值。可选配置。
    - **exposure_time_init**: sensor 曝光初始值。可选配置。

10. **bayer 格式**：sensor 输出的原始图像像素排列模式，核心参数包括 `bayer_pattern`（像素排列类型，如 RGGB/RCCC/RIrGB/RGIrB）和 `bayer_start`（RGGB 模式的起始像素，如 R/Gr/Gb/B），一般 sensor Spec 中有描述。
    - 在 Bayer 模式中，图像传感器的每个像素点上放置了一个滤光片，只允许特定颜色的光通过，滤光片按照特定的图案排列，以 sc230ai 中描述 `bayer_start` 为 B(0,0) 为例。

 ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/hbn_overview/image_20260105-143431.png)


### Gain LUT 表 生成方式

- 为了快速生成 gain_lut 表，BSP 提供了 gain_table.xlsx 表格，只需要填写 C4 的 增益倍数推导寄存器值的公式，即可快速生成 gain_lut 表
- gain_lut 表一般适用于 OmniVision 的sensor（gain控制一般以整数+小数线性组合）和Sony 的 sensor （gain控制一般以线性公式进行控制）
- SmartSens 的sensor gain控制，一般采用的是 离散档位 + 精细调节,通常查表是最快的，不需要使用gain_table.xlsx 表格生成
- gain_table.xlsx 表格的存放位置在系统 BSP 源码包的 `source/hobot-camera/drivers/sensor` 下

### 驱动部署流程

1. 进入 `source/hobot-camera/drivers` 目录，执行 `make` 编译 sensor 库。
2. 将 `source/hobot-camera/debian/usr/hobot/lib/sensor` 下生成的 `lib<sensor_name>.so.*` 拷贝到板端 `/usr/hobot/lib/sensor/`。

**各sensor厂家具体实现（init/start/stop/power、linear_data_init、gain_lut 生成、aexp_gain/line/userspace_control）请参见：**

- [SmartSens Sensor Bring-Up](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/hbn/mipi/smartsens)

---

## 添加 camera App 代码

参考 BSP 中 `source/hobot-spdev/src/vp_sensors`，配置 MIPI、SIF、camera sensor、LPWM、ISP 等。需根据 sensor 分辨率、帧率、数据格式填写`vp_sensor_config_t`。

- **源码路径**：`source/hobot-spdev/src/vp_sensors`
- **部署**：将编译得到的 get_vin_data、get_isp_data 等拷贝到设备执行测试。编译方法见对应平台示例概览：

:::doc_scope{products="RDK S100"}
- [示例概览](/Advanced_development/multimedia_development/multimedia_sample/overview)
:::

:::doc_scope{products="RDK S600"}
- [示例概览](/Advanced_development/multimedia_development/multimedia_sample_s600/overview)
:::

### vp_sensor_config_t 配置项

vp_sensor_config_t 参数配置 主要包含：mipi 配置、camera sensor 配置、SIF 配置、LPWM 配置 和 ISP 配置，详细参照[数据结构](/Advanced_development/multimedia_development/multimedia_api/hbn_api)。

---

## 板端示例程序运行

- **get_vin_data**：查看 raw 图质量与帧率，确认无严重偏色、与实物颜色一致。用法见对应平台 sample_vin：

:::doc_scope{products="RDK S100"}
- [sample_vin 使用说明](/Advanced_development/multimedia_development/multimedia_sample/sample_vin)
:::

:::doc_scope{products="RDK S600"}
- [sample_vin 使用说明](/Advanced_development/multimedia_development/multimedia_sample_s600/sample_vin)
:::
- **get_isp_data**：查看 YUV 图像，确认无严重偏色、无反色；精细效果由 ISP 调试。用法见对应平台 sample_isp：

:::doc_scope{products="RDK S100"}
- [sample_isp 使用说明](/Advanced_development/multimedia_development/multimedia_sample/sample_isp)
:::

:::doc_scope{products="RDK S600"}
- [sample_isp 使用说明](/Advanced_development/multimedia_development/multimedia_sample_s600/sample_isp)
:::

---

## ISP 图像调试预览与 2A 验证

- 在能正常 get_vin_data / get_isp_data 后，可连接 **hbplayer** 预览 YUV，并使用 **tuning_tool** 进行 ISP 调试。详见 [hbplayer 和 tuning_tool 工具使用指南](/Advanced_development/multimedia_development/multimedia_api/isp_tuning_guide/hbplayer_tuning_tool)。
- **2A 验证（AE/AWB）**：确认写入 Sensor 的曝光与增益寄存器符合 Spec；将 AE 切为 Manual 后设置 aGain、dGain、integrationTime，通过驱动打印或 i2ctransfer 读寄存器核对。

---

## 小结

- 本文为 Camera 调试的**总览**：准备硬件与软件资源 → 配置 dts → 实现并部署 sensor 驱动 → 配置并运行 App → 板端抓 raw/ISP 图 → ISP 预览与 2A 验证。
- 按 sensor 厂家阅读对应分章节可得到连贯、可操作的驱动/App/验证说明；遇到 I2C、MIPI、Sensor 等问题可查 [Camera Sensor FAQ](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/camera_faq)。
