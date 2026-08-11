---
sidebar_position: 2
---

# Camera Bring-up

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## HBN MIPI Sensor Bring-up

### Scope

This chapter provides an overview of the camera bring-up process, helping readers quickly understand and master the RDK camera framework, how to quickly add new camera configurations, and bring up the camera.

:::info

- This section uses the RDK S100 development board + IMX219 camera module as an example for configuration explanation. For other hardware platforms or camera modules, refer to the actual situation.
- Most configuration methods for the RDK S600 and RDK S100 are the same; the main focus is on hardware differences.

:::

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_01.png" alt="Scope diagram" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Preparation

Hardware resources: Development board, camera module.

Software resources: System SDK, camera driver source code, sensor datasheet, sensor initialize settings, etc.

<DocScope products="RDK S100">

RDK S100 development board camera-related hardware resources are as follows:

| Interface | MIPI host              | I2C BUS | Pin Description                                          | Other                                                                                                 |
|-----------|------------------------|---------|----------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| S100-RX0  | **0**, 4 lane, DPHY    | **1**   | gpio_0: 502                                              | • LPWM0_DOUT0 (gpio: 456) or mclk 24MHz selectable via DIP switch<br/>• Some modules have external 24M crystal, no need for SoC mclk output<br/>• DIP switch determines I2C/GPIO level 1.8V or 3.3V<br/>• DIP switch determines output LPWM or 24M mclk |
| S100-RX1  | **1**, 4 lane, DPHY    | **2**   | gpio_0: 494                                              | • LPWM0_DOUT1 (gpio: 457) or mclk 24MHz selectable via DIP switch<br/>• Some modules have external 24M crystal, no need for SoC mclk output<br/>• DIP switch determines I2C/GPIO level 1.8V or 3.3V<br/>• DIP switch determines output LPWM or 24M mclk |
| S100-RX4  | **4**, 4 lane, DPHY    | **3**   | poc EN: 433<br/>poc INT: 506<br/>Deserializer PWDNB: 452 | Deserializer MAX96712, addr: 0x29<br/>POC MAX20087, addr: 0x28                                       |

</DocScope>

<DocScope products="RDK S600">

RDK S600 development board camera-related hardware resources are as follows:

| Interface | MIPI host              | I2C BUS | Pin Description                                   | LPWM                                    | Other                              |
|-----------|------------------------|---------|---------------------------------------------------|-----------------------------------------|------------------------------------|
| S600-RX0  | **0**, 4 lane, DPHY    | **0**   | poc EN: 362<br/>Deserializer PWDNB: 406           | LPWM0_DOUT0 → MFP5<br/>LPWM0_DOUT1 → MFP7 | Deserializer MAX96712<br/>POC MAX20087 |
| S600-RX1  | **1**, 4 lane, CPHY    | **1**   | poc EN: 363<br/>Deserializer PWDNB: 407           | LPWM0_DOUT2 → MFP5<br/>LPWM0_DOUT3 → MFP7 | Deserializer MAX96712<br/>POC MAX20087 |
| S600-RX2  | **2**, 4 lane, DPHY    | **2**   | poc EN: 364<br/>Deserializer PWDNB: 408           | LPWM3_DOUT0 → MFP5<br/>LPWM3_DOUT1 → MFP7 | Deserializer MAX96712<br/>POC MAX20087 |
| S600-RX3  | **3**, 4 lane, CPHY    | **3**   | poc EN: 365<br/>Deserializer PWDNB: 409           | LPWM3_DOUT2 → MFP5<br/>LPWM3_DOUT3 → MFP7 | Deserializer MAX96712<br/>POC MAX20087 |
| S600-RX4  | **4**, 4 lane, DPHY    | **4**   | gpio_0: 411                                       | LPWM1_DOUT2                             | For MIPI sensor connection           |
| S600-RX5  | **5**, 4 lane, DPHY    | **5**   | gpio_0: 412                                       | LPWM1_DOUT3                             | For MIPI sensor connection           |

</DocScope>

<DocScope products="RDK S100">

For hardware connections and corresponding DIP switch usage, please refer to [Camera Expansion Board](/Quick_start/hardware_introduction/rdk_s100/rdk_s100_camera_expansion_board/rdk_s100_camera_expansion_board).

</DocScope>
<DocScope products="RDK S600">

For hardware connections and corresponding DIP switch usage, please refer to [Camera Expansion Board](/Quick_start/hardware_introduction/rdk_s600/rdk_s600_camera_expansion_board).

</DocScope>

### Steps to Add New Sensor Bring-up

When adapting **new hardware** and **new camera**, you need to modify the platform device tree (DTS), camera driver library, and related configuration files. System libraries generally do not need to be changed.

#### DTS Modification

##### Sensor GPIO Configuration

Ensure that the sensor GPIO used by the new hardware is configured in the `video_gpio` node under `drobot-s100-pinctrl.dtsi --> pinctrl_video --> video_gpio`. This allows the system to set the corresponding pins as GPIO during boot, enabling user programs to operate the pins.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_03.png" alt="Sensor GPIO Configuration Example" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

`vcon` is the DTS node used by the RDK camera framework to manage sensor hardware. If the sensor requires specific timing to start properly, configure the corresponding GPIO in this node. Please configure according to the actual hardware connections; this information can be obtained from the schematic and pin list.

```c
/* Configure according to actual hardware connections */
// dts: Set GPIO in the corresponding vcon node. Note that vcon port numbers correspond one-to-one with MIPI RX port numbers.
// vcon0 -- RX0
// ....
// vcon3 -- RX3
&vin_vcon0 {
        bus = <2>;
        gpio_poc = <0>;
        gpio_des = <0>;
        sensor_err = <0>;
        //gpio_oth = <444 445>; // Not needed for IMX219, so commented out
        lpwm_chn = <0 1 2 3>;
        rx_phy = <2 0>;
};
```

##### Sensor I2C Configuration

The I2C bus number must be bound to the MIPI RX port in the DTS `vcon`. Please configure according to actual hardware connections; this information can be obtained from the schematic.

```c
/* Configure according to actual hardware connections */
// Set the I2C bus in the corresponding vcon, e.g., set I2C2 for RX0
&vin_vcon0 {
        bus = <2>;
        gpio_poc = <0>;
        gpio_des = <0>;
        sensor_err = <0>;
        lpwm_chn = <0 1 2 3>;
        rx_phy = <2 0>;
};
```

##### MCLK Configuration

<DocScope products="RDK S100">

The RDK S100 baseboard can output mclk via a 24M crystal using a DIP switch.<br />

</DocScope>

<DocScope products="RDK S600">

For RDK S600 with serdes modules, the serializer can output mclk to the sensor.

</DocScope>

##### DTS Modification Verification

Generally, if the DTS configuration is correct and the hardware is properly connected, with normal sensor power and mclk, you can use `i2cdetect` to detect the module's I2C address. Use the `echo` command to control sensor power-on or reset (Note: This explanation uses the IMX219 module which does not require GPIO operations).

```c
/* Configure according to actual hardware connections */
echo 502 > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio502/direction
echo 1 > /sys/class/gpio/gpio502/value
echo 502 > /sys/class/gpio/unexport
```

Use `i2cdetect` to check the sensor's I2C address. If the correct address is detected as shown below, the DTS configuration is correct; otherwise, check the DTS configuration.

| <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_04.png" alt="i2cdetect Correct Address Detected" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} /> | <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_05.png" alt="i2cdetect No Device Detected" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} /> |
|--------------------------------------|--------------------------------------|

#### Adding Sensor Driver Files

Sensors from different manufacturers come with various driver styles and settings. Therefore, you need to convert the manufacturer's sensor driver into the RDK camera driver code, compile it to generate a shared library (.so), and copy the .so to the `/usr/hobot/lib/sensor/` directory on the device. **It should be noted that before MIPI start, the sensor must not be streaming.**

The system SDK directory `hobot-camera/drivers/sensor` provides a sensor driver template file `imx219_utility.c` as well as other adapted sensor drivers. When adding support for a new camera sensor, modify the files accordingly, following the examples.

```c
 #ifdef CAMERA_FRAMEWORK_HBN
 SENSOR_MODULE_F(imx219, CAM_MODULE_FLAG_A16D8);
 sensor_module_t imx219 = {
         .module = SENSOR_MNAME(imx219),
 #else
 sensor_module_t imx219 = {
         .module = "imx219",
 #endif
         .init = sensor_init,
         .start = sensor_start,
         .stop = sensor_stop,
         .deinit = sensor_deinit,
         .aexp_gain_control = sensor_aexp_gain_control,
         .aexp_line_control = sensor_aexp_line_control,
         .power_on = sensor_poweron,
         .power_off = sensor_poweroff,
         .userspace_control = sensor_userspace_control,
 };
```

As shown in the code above, the sensor driver interface under the RDK camera framework is contained in the `sensor_module_t` structure. The file name, structure name, and `module` field must be consistent. For example, if the file is named `imx219_utility.c`, the structure name and `module` field should be `imx219`. For a new sensor bring-up, the following functions need to be implemented by the user:

• `init`: Sensor initialization and setting configuration

• `deinit`: Sensor de-initialization

• `start`: Start sensor streaming

• `stop`: Stop sensor streaming

• `power on`: Sensor power-on

• `power off`: Sensor power-off

• `aexp_gain_control`: Sensor gain control

• `aexp_line_control`: Sensor exposure line control

• `userspace_control`: User callback function enable control

For 3A control, the system supports both driver registration and application-layer callback methods. The default is the application-layer callback function, with interface definitions as follows:

| Function           | Description             | Input Parameters                                                                                                                                                                             |
|--------------------|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| aexp_gain_control  | Sensor gain control     | info: sensor bus information; mode: sensor operating mode (linear/hdr/pwl); again: sensor again parameters (max 4); dgain: sensor dgain parameters (max 4); gain_num: number of gain parameters |
| aexp_line_control  | Sensor exposure control | info: sensor bus information; mode: sensor operating mode (linear/hdr/pwl); line: sensor line parameters (max 4); line_num: number of line parameters                                        |
| awb_control        | Sensor-side AWB control | info: sensor bus information; mode: sensor operating mode (linear/hdr/pwl); rgain: sensor rgain; bgain: sensor bgain; grgain: sensor grgain; gbgain: sensor gbgain                           |
| userspace_control  | HAL layer control switches | port: sensor port number; enable: enable user callback control switch (all off by default). Bit definitions: #define HAL_LINE_CONTROL 0x00000001; #define HAL_GAIN_CONTROL 0x00000002; #define HAL_AWB_CONTROL 0x00000004 |

The following code initializes the main sensor driver structure and should be filled in according to each sensor's actual specifications.

```c
// Actual sensor output width
turning_data->sensor_data.active_width = 1920;
// Actual sensor output height
turning_data.sensor_data.active_height = 1080;

// Exposure lines per second. Formula: 1/line time or (fps * vts). vts may be named differently (frame_length, vts, etc.) but represents the total lines per frame including active lines and blanking. lines_per_second can also be understood as HMAX. Note that some sensors do not have the HMAX concept.
turning_data.sensor_data.lines_per_second = vts * sensor_info->fps;

// Maximum short exposure time (max short exposure lines per frame). Calculated as (1/fps) / (1/lines_per_second).
turning_data.sensor_data.exposure_time_max = vts;

// Maximum analog gain multiplier. For example, if turning_data.sensor_data.analog_gain_max = 126, the max multiplier is 2^(X/32), where X = 126. This value varies by sensor manufacturer and must be obtained from the datasheet or manufacturer. The max multiplier can also be found by getting the sensor's max gain and looking up the corresponding index in the J5-ISP gain table.
turning_data.sensor_data.analog_gain_max = 109;
turning_data.sensor_data.digital_gain_max = 0;

// Minimum short exposure time (min short exposure lines per frame). Line exposure time can be calculated as 1 second / (frame_rate * (active lines + blanking)), i.e., 1/lines_per_second.
turning_data.sensor_data.exposure_time_min = 1;

// Maximum long exposure time (max long exposure lines per frame)
turning_data.sensor_data.exposure_time_long_max = vts;

// Fill sensor bit width, bayer_start (RGGB pattern start (R/Gr/Gb/B)), and bayer_pattern (RGGB/RCCC/RIrGB/RGIrB) information.
sensor_data_bayer_fill(&turning_data.sensor_data, 10, (uint32_t)BAYER_START_R, (uint32_t)BAYER_PATTERN_RGGB);

// Fill exposure_max_bit_width (pwl mode bits) information.
sensor_data_bits_fill(&turning_data.sensor_data, 12);

// Setting stream control
// Start/stop streaming
turning_data.stream_ctrl.data_length = 1;

// again LUT table. Firmware indexes the LUT to find the corresponding sensor register values. LUT differentiates a_gain/d_gain.
// LUT size: again_lut[again_control_num][256], dgain_lut[dgain_control_num][256]
turning_data.normal.again_lut = malloc(256 * sizeof(uint32_t));
if (turning_data.normal.again_lut != NULL)
{
    memset(turning_data.normal.again_lut, 0xff, 256 * sizeof(uint32_t));
    memcpy(turning_data.normal.again_lut, imx219_gain_lut,
           sizeof(imx219_gain_lut));
}

turning_data.normal.dgain_lut = malloc(256*sizeof(uint32_t));
if (turning_data.normal.dgain_lut != NULL) {
        memset(turning_data.normal.dgain_lut, 0xff, 256*sizeof(uint32_t));
        memcpy(turning_data.normal.dgain_lut, imx219_dgain_lut,
                sizeof(imx219_dgain_lut));
}
```

• `turning_data.sensor_data.active_width`: Actual sensor output width.

• `turning_data.sensor_data.active_height`: Actual sensor output height.

• `turning_data.sensor_data.analog_gain_max`: Maximum analog gain multiplier. For example, if `turning_data.sensor_data.analog_gain_max = 126`, the max multiplier is `2^(X/32)`, where `X = 126`. This value varies by manufacturer and must be obtained from the datasheet.

• `turning_data.sensor_data.digital_gain_max`: Maximum digital gain multiplier.

• `turning_data.sensor_data.exposure_time_min`: Minimum short exposure time (minimum short exposure lines per frame). Line exposure time is `1 second / (frame_rate * (active lines + blanking))`, i.e., `1/lines_per_second`.

• `turning_data.sensor_data.exposure_time_max`: Maximum short exposure time (maximum short exposure lines per frame). Calculated as `(1/fps) / (1/lines_per_second)`.

• `turning_data.sensor_data.exposure_time_long_max`: Maximum long exposure time (maximum long exposure lines per frame). Used for HDR sensors.

• `turning_data.sensor_data.lines_per_second`: Exposure lines per second. Formula: `1/line time` or `(fps * vts)`. `vts` may be named differently (frame_length, vts, etc.) but represents total lines per frame including active and blanking. `lines_per_second` can also be understood as HMAX. Note that some sensors do not have the HMAX concept.

• `turning_data.normal.again_lut`: `again` LUT table. Firmware indexes the LUT to find corresponding sensor register values. Differentiates a_gain/d_gain. LUT size: `again_lut[again_control_num][256]`, `dgain_lut[dgain_control_num][256]`.

Note 1: If a gain value does not exist, fill that entry with `0xffffffff`. During gain allocation, the program searches downward until a valid gain is found. The LUT passed to the kernel must have high/low byte conversion already applied to avoid doing it in the kernel. For example, if `gain = 0x1234`, registers `0x3012` and `0x3013` are written. Some sensors write `0x12` to `0x3012`, others to `0x3013`. The HAL conversion abstracts this difference.

Note 2: The LUT represents 256 gain control points `[0,255]`. The conversion formula is `2^(x/32)`, so actual gain multipliers range from `2^(0/32)` to `2^(255/32)`. The gain control curve is logarithmic, meaning any sensor's gain control is discretized into 256 points. This is because the 3A control algorithm provides 256 control points; more points do not improve gain control accuracy.

Before MIPI start, the sensor must not be streaming. Modify the camera sensor init settings accordingly.

```c
static uint32_t imx219_linear_init_setting[] = {
    ....
    // 0x0100,0x01,  // Do not include the start-streaming configuration at the end of the settings
}
```

After the sensor driver and settings are written, copy `*_utility.c` and `*_setting.h` to the corresponding SDK directory, recompile the SDK to generate the sensor driver library. The output file is located in `out/deploy/rootfs/usr/hobot/lib/sensor`.

Generally, if the code structure is correct, the framework can load the sensor driver even if `tuning_data` parameters have minor issues. If `logcat` shows sensor `.so` check failures or loading failures, check the code structure to ensure it follows the HBN framework.

#### User Program

Refer to existing SDK user programs, which include CIM and ISP parameter configurations. These configurations must be set according to the specific sensor's resolution, frame rate, and data format. The following lists the parts that need separate configuration; the rest can stay at default values.

##### MIPI Configuration

| Field                             | Description                                                                                                                                                                                                                                                       |
|-----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| rx_enable                         | MIPI RX device enable. Enables the corresponding MIPI RX port. Default is 1. Note: This field does not specify the MIPI RX port number; it only enables the MIPI RX.                                                                                            |
| phy                               | 0: Represents MIPI DPHY.                                                                                                                                                                                                                                         |
| lane                              | Number of MIPI lanes. Currently, each MIPI RX supports 4 lanes by default.                                                                                                                                                                                        |
| datatype                          | MIPI input data format, consistent with sensor configuration. Common values: RAW8: 0x2A, RAW10: 0x2B, RAW12: 0x2C, YUV422 8-bit: 0x1E                                                                                                                           |
| fps                               | Frame rate, used for MIPI configuration calculations. Fill in according to sensor output frame rate (obtainable from FAE).                                                                                                                                       |
| mipiclk                           | Total MIPI transfer rate (all LANES). Obtainable from FAE; usually described in the sensor init settings provided by FAE.                                                                                                                                        |
| width                             | Input image width in pixels.                                                                                                                                                                                                                                     |
| height                            | Input image height in pixels.                                                                                                                                                                                                                                    |
| linelenth                         | MIPI line length. Configure according to the sensor's actual specifications. Can be read from sensor spec registers or measured from hardware.                                                                                                                   |
| framelenth                        | MIPI frame length. Configure according to the sensor's actual specifications. Can be read from sensor spec registers or measured from hardware.                                                                                                                  |
| settle                            | MIPI settle time for PHY. Can be measured from hardware. Adjust if MIPI PHY errors occur; range 0–120.                                                                                                                                                         |
| channel_num                       | Number of MIPI virtual channels. Linear mode: 1, HDR DOL2 mode: 2.                                                                                                                                                                                                |
| channel_sel[MIPIHOST_CHANNEL_NUM] | MIPI virtual channel mapping to IPI channel.                                                                                                                                                                                                                     |

:::tip Commercial Support
The commercial version provides more complete functional support, deeper hardware capability exposure, and exclusive customization. To ensure content compliance and secure delivery, we will provide commercial version access through the following process.

Commercial version acquisition process:
1. Fill out the questionnaire: Submit your organization information, use cases, etc.
2. Sign NDA: We will contact you based on the submitted information and sign the NDA after mutual confirmation.
3. Content release: After the agreement is signed, we will provide commercial version materials through private channels.

If you wish to obtain commercial version content, please click the link below to fill out the questionnaire. We will contact you within 3–5 working days:
https://horizonrobotics.feishu.cn/share/base/form/shrcnpBby71Y8LlixYF2N3ENbre
:::

##### Camera Sensor Configuration

| Field                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| name[CAMERA_MODULE_NAME_LEN] | Camera module name, must match the sensor library name. For example, if the sensor driver is `libimx219.so`, the name is `imx219`.                                                                                                                                                                                                                                                                                                                                                          |
| addr                         | Sensor device address, usually a 7-bit I2C address.                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| sensor_mode                  | Sensor operating mode: 1: NORMAL_M, linear mode; 2: DOL2_M, HDR 2-frame merged to 1; 3: DOL3_M, HDR 3-frame merged to 1; 4: DOL4_M, HDR 4-frame merged to 1; 5: PWL_M, HDR mode with internal sensor merging                                                                                                                                                                                                                                                                               |
| gpio_enable                  | Whether to use GPIO to control camera sensor pins to meet power-up/down timing requirements, e.g., using GPIO to control the sensor XSHUTDN pin. **Note**: The corresponding GPIO number must be configured in the DTS. 0: Do not use GPIO for control. Non-zero: Use GPIO to control the sensor, enabling GPIOs by bit. For example, `0x07` enables 3 GPIOs [a, b, c].                                                                                                                       |
| gpio_level                   | If `gpio_enable_bit` is set, configure `gpio_level` to control sensor pin levels. The relationship between GPIO bits and sensor pin levels is as follows: 0: Output low first, sleep 1s (sleep time can be customized via `usleep` in the sensor driver `power_on` function), then output high. 1: Output high first, sleep 1s, then output low. For example, `0x05 = 101` means bit0 to bit2: GPIO a outputs high then low, GPIO b outputs low then high, GPIO c outputs high then low. **Note**: Customize according to the sensor spec power-up timing. |
| fps                          | Sensor frame rate configuration.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| width                        | Sensor output width in pixels.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| height                       | Sensor output height in pixels.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| format                       | Sensor MIPI data type. Common values: RAW8: 0x2A, RAW10: 0x2B, RAW12: 0x2C, YUV422 8-bit: 0x1E                                                                                                                                                                                                                                                                                                                                                                                            |
| extra_mode                   | Module index configuration, used in some sensor drivers.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| config_index                 | Function configuration, used in some sensor drivers.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| calib_lname                  | Sensor effect library path. Default: `/usr/hobot/lib/sensor`.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| end_flag                     | Fixed to `CAMERA_CONFIG_END_FLAG`.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

##### VIO Configuration

| Field1 | Field2               | Field3                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|--------|----------------------|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| VIN    | cim                  | mipi_en                               | Enable MIPI interface.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|        |                      | mipi_rx                               | MIPI RX port number.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|        |                      | vc_index                              | MIPI virtual channel index. Default is 0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|        |                      | ipi_channel                           | IPI channel number. Linear mode: 1, HDR DOL2 mode: 2.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|        |                      | cim_isp_flyby                         | CIM/SIF online to ISP. 0: SIF offline to ISP (data goes through DDR). 1: SIF online to ISP (data does not go through DDR).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|        | input channel        | format                                | VIN format, sensor output format.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|        |                      | width                                 | Sensor output width in pixels.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|        |                      | height                                | Sensor output height in pixels.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|        | output channel / ddr | ddr_en                                | Whether to dump data to DDR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|        |                      | wstride                               | Set to 0; the driver will automatically calculate wstride.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|        |                      | format                                | Sensor format when dumping to DDR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|        |                      | buffers_num                           | Number of buffers for CIM/SIF DDR dump. Set to 1–6.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|        |                      | flags                                 | Usually set by the program.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|        |                      |                                       | `HB_MEM_USAGE_CPU_READ_OFTEN | HB_MEM_USAGE_CPU_WRITE_OFTEN | HB_MEM_USAGE_CACHED`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ISP    | base                 | hw_id and slot_id                     | When CIM is directly connected to ISP: `hw_id` must correspond one-to-one with the cim `rx_index`. In `sched_mode` 1, CIM online ISP `slot_id` ranges from 0–3, corresponding one-to-one with cim `vc_index`. In `sched_mode` 2, `slot_id` is fixed at 0, and cim `vc_index` can be 0–3 depending on actual sensor connection. When CIM DDR connects to ISP: `hw_id` is unrestricted and can be selected based on actual sensor connections and project needs. `slot_id` only needs to start from 4 to 11. Note: In multi-channel stress scenarios with CIM DDR connection, choose ISP channels with smaller `slot_id` values for high-resolution sensor paths to ensure real-time sensor control.                                                                                                                                                                                                                                                                                                                                               |
|        |                      | sched_mode                            | ISP operating mode. 1: Manual software scheduling mode. 2: Passthru mode, fully online exclusive ISP operating mode.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|        |                      | width                                 | Input image height.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|        |                      | height                                | Input image width.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|        |                      | frame_rate                            | Input frame rate, no actual effect.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|        |                      | algo_state                            | 2A control switch parameter.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|        | output channel       | stream_output_mode and axi_output_mode | ISP mode.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

#### Run the Program on the Board

Execute the corresponding test program.

#### ISP Image Preview

**Add Tuning Program to SDK Code**

Modify `/app/tuning_tool/scripts/tuning_menu.sh` and add the new sensor by following the existing examples.

```c
ITEM_IMX219_RGGB="module:Raw10_IMX219_RDK-S100"
IMX219_RGGB_Raw10_IMX219_RDK-S100()
{
        IDESC="imx219 rggb raw10 RDK-S100"
        setup_case ${folder}/tuning_imx219_cim_isp_1080p
}
```

Create a folder `tuning_imx219_cim_isp_1080p` under `/app/tuning_tool/cfg/matrix` and add the corresponding `hb_j6dev.json`, `mipi.json`, and `vpm_config.json` files.

Compile the SDK system code to ensure the board includes the modified and added files.

**Execute the Tuning Program on the Board**

```c
cd /app/tuning_tool/scripts
bash run_tuning.sh
# Follow the interactive prompts to select the corresponding sensor.
```

**Image Preview**

1. [Click here](../../../01_Quick_start/download.md#tool-downloads) to download the image browsing tool `hbplayer`.
2. Open `hbplayer` and set the network address (PC must be able to ping the board), click `Apply` to apply the settings, and click `Connect` to see the real-time video stream. The real-time preview operation is shown below.

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_06.png" alt="hbplayer Real-time Preview" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Error Codes

Below are common sensor error codes and simple debugging directions:

| Error Code | Definition                 | Debugging Direction                                                                               |
|------------|----------------------------|---------------------------------------------------------------------------------------------------|
| 203        | HB_CAM_INIT_FAIL           | Sensor initialization failed. Possibly I2C not working or configured sensor mode not supported.   |
| 205        | HB_CAM_START_FAIL          | Sensor start failed. Possibly I2C not working or configured sensor mode not supported.            |
| 207        | HB_CAM_I2C_WRITE_FAIL      | Sensor I2C not working.                                                                           |
| 217        | HB_CAM_SENSOR_POWERON_FAIL | Sensor power-on failed. Possibly GPIO configuration error.                                        |
| 218        | HB_CAM_SENSOR_POWEROFF_FAIL| Sensor power-off failed. Possibly GPIO configuration error.                                       |

### FAQ

**control-tool Usage Instructions**

Enter the tuning directory: `cd /app/tuning_tool/control_tool`.

Follow the interactive prompts to run the startup script: `sh server_isp*_8000.sh`. The ISP hardware has two IP cores, each can run independently. To start ISP control, run `sh server_isp0_8000.sh`.

Startup method is shown below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_07.png" alt="control-tool Startup Method" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

The script automatically detects the board's IP address, defaulting to the `eth1` network card IP. To change to `eth0`, modify the script variable `eth_id=eth0`. The modification location is shown below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_08.png" alt="Modify Network Interface Configuration" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

Modifying the communication address is shown below.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_09.png" alt="Modify Communication Address" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## HBN GMSL Sensor Bring-up

### GMSL Sensor Driver Writing Guide
This section builds on the MIPI camera bring-up description and adds the differences specific to GMSL. Readers are expected to have a basic understanding of the MIPI camera bring-up and GMSL.

:::info

This section uses the RDK S100 development board + AR0820 (SG8S-AR0820C-5300-G2A) module as an example. The RDK S600 is largely similar; other hardware platforms or camera modules should be adapted based on the actual situation.

:::

### Resource Preparation
Hardware resources: RDK-S100 development board, camera module.

Software resources: System SDK, camera driver source code, sensor datasheet, sensor initialize settings, serdes datasheet, etc.

Refer to the corresponding MIPI camera section for RDK development board camera hardware resources.

### Steps to Add New Sensor Bring-up
Refer to the MIPI camera bring-up steps; only the differences are described here.

#### DTS Modification
1. Sensor mclk configuration: GMSL sensor mclk is typically output by the serializer. HBN requires configuring this in the sensor driver code; details will be covered in the sensor driver file section.
2. `gpio_poc`, `gpio_des`, `lpwm_chn`, and other vcon configurations: If using RDK-S100 hardware, these do not need attention as the DTS is already configured. Only for new hardware should modifications be made according to the actual hardware, following the same approach as MIPI camera.

#### Adding Sensor Driver Files
Code location:<br />
Sensor driver directory: `hobot-camera/drivers/sensor`<br />
AR0820 driver directory: `hobot-camera/drivers/sensor/ar0820std`<br />
Serial driver directory: `hobot-camera/drivers/sensor/serial`<br />
Deserial driver directory: `hobot-camera/drivers/deserial`<br />
The GMSL camera sensor driver needs to implement similar content to the MIPI driver. Here, `ar0820std` is used as an example to explain the differences.<br />
`std` refers to the HBN later-reconstructed, long-term maintained sensor driver, so it is recommended to reference the `std` driver when adding new module configurations.

```
static emode_data_t emode_data[MODE_TYPE_MAX] = {
...
    [SENSING_M25F120D4G3_S0R0T7] = {
        .serial_addr = 0x40,            // Serializer I2C address
        .sensor_addr = 0x10,            // Sensor I2C address
        .eeprom_addr = 0x50,            // EEPROM I2C address
        .serial_rclk_out = 0,           // 0: serial rclk disabled, 1: serial rclk enabled
        .rclk_mfp = 0,                  // If serial_rclk_out = 1, rclk output on rclk_mfp
    },
};
```

Typically, one deserializer connects to multiple serializers and sensors. These may be identical hardware with the same I2C addresses, requiring I2C address remapping to distinguish them. The `*_addr` fields in `emode_data` provide the default I2C addresses of the devices during the remapping process. The new mapped addresses are defined by `*_addr` in the user program.

In serdes modules, the sensor's mclk can be provided by the serializer or by an external crystal. In the former case, set `serial_rclk_out = 1` and configure `rclk_mfp` to the corresponding MFP index. Currently, the software only supports MFP4; consult D-Robotics for other cases. In the latter case, set both `serial_rclk_out` and `rclk_mfp` to 0.

**emode (extra_mode) Configuration**
```
static const sensor_emode_type_t sensor_emode[MODE_TYPE_NUM] = {
        SENSOR_EMADD(SUNNY_M25F120D12G3_S1R8T2, "0.0.1", "lib_CA82GB_pwl12_WS_Fov120.so", "0.22.10.20", &emode_data[SUNNY_M25F120D
12G3_S1R8T2]),
        SENSOR_EMADD(SENSING_M27F120D12G3_S0R0T7, "0.0.1", "lib_ar0820RGGB_pwl12_Sens_Fov30.so", "0.22.9.13", &emode_data[SENSING_
M27F120D12G3_S0R0T7]),
        SENSOR_EMADD(SUNNY_M25F120D12G3_S0R8T7E0, "0.0.1", "lib_CA82GB_pwl12_WS_Fov120.so", "0.22.10.20", &emode_data[SUNNY_M25F12
0D12G3_S0R8T7E0]),
        SENSOR_EMADD(GALAXY_M25F120D12G2_S1R5T3E0, "0.0.1", "lib_CW_A82GB_A120_065_L_W20.so", "0.24.4.24", &emode_data[GALAXY_M25F
120D12G2_S1R5T3E0]),
        SENSOR_EMADD(GALAXY_M25F30D12G2_S1R5T3E0, "0.0.1", "lib_CW_A82GB_A30_017_L_W20.so", "0.24.4.28", &emode_data[GALAXY_M25F30
D12G2_S1R5T3E0]),
        //D4: YUV422, S0: MAX9295A, R0: sensor module isp reset MFP0 T7: sensor frame sync MFP7
        SENSOR_EMADD(SENSING_M25F120D4G3_S0R0T7, "0.0.1", "lib_ar0820RGGB_pwl12_Sens_Fov30.so", "0.22.9.13", &emode_data[SENSING_M
25F120D4G3_S0R0T7]),
        SENSOR_EMEND(),
};
```

In the HBN code, fields similar to `SENSING_M25F120D4G3_S0R0T7` are used to parse basic module information, so this field must be filled in according to the actual module. The parsing rules are as follows:
- Text before the first "_" is the module manufacturer name (customizable).
- After the first "_", parsing is based on key characters:
  1. `M`: Frequency of mclk output from serializer to sensor in MHz. E.g., `M25` means 25 MHz mclk, provided `serial_rclk_out` and `rclk_mfp` are correctly enabled and configured.
  2. `F`: Lens FOV size, typically used for logic decisions based on different lenses in the driver.
  3. `S`: Differentiates serializer type: `S0` = MAX9295A, `S1` = MAX96717, `S2` = MAX96717F.
  4. `D`: Differentiates sensor output datatype: `D4` = YUV422 (MIPI type 0x1e), `D8` = RAW8 (0x2a), `D10` = RAW10 (0x2b), `D12` = RAW12 (0x2c).
  5. `N`: Configures the number of MIPI lanes for the serializer; default is 4 lanes.
  6. `R`: Configures the serializer's MFP GPIO for resetting the sensor or internal ISP. E.g., `R0` means MFP0 is used for reset.
  7. `T`: Configures the serializer's MFP for triggering sensor synchronization exposure. E.g., `T7` means MFP7 is used for trigger.
  8. `L`: Configures the serializer link rate, choose 3Gbps or 6Gbps based on hardware. E.g., `L3` means 3Gbps. If not configured, the software automatically sets the maximum supported rate based on the serializer model.
  9. `I`: Indicates the sensor interface: `I1` means DVP interface; `I0` or not configured means MIPI interface.
  10. Other characters are generally not used; consult D-Robotics for special cases.

`"0.0.1"` and `"0.22.9.13"` are the sensor driver version and ISP effect library `.so` version, respectively. These can be ignored during the initial bring-up phase.

`"lib_ar0820RGGB_pwl12_Sens_Fov30.so"` is the default ISP effect library `.so` for the selected emode. Note that in the user program, `calib_lname` can override this with a higher priority.

**config_index Configuration**
The HBN framework uses the `config_index` field to configure various functions, such as writing embedded data, setting mirror/flip, and sensor exposure settings.
```
static SENSOR_CONFIG_FUNC sensor_config_index_funcs[B_CONFIG_INDEX_MAX] = {
        [B_EMBEDDED_MODE] = sensor_config_index_embed_setting,
        [B_TEST_PATTERN] = sensor_config_index_test_pattern,
        [B_FLIP] = sensor_config_index_filp_setting,
        [B_MIRROR] = sensor_config_index_mirror_setting,
        [B_TRIG_STANDARD] = sensor_config_index_trig_mode,
        [B_TRIG_SHUTTER_SYNC] = sensor_config_index_trig_shutter_mode,
};

typedef enum CONFIG_INDEX_B {
        B_AE_DISABLE,
        B_AWB_DISABLE,
        B_TEST_PATTERN,
        B_DPHY_PORTB,
        B_DPHY_COPY,
        B_EMBEDDED_MODE,
        B_EMBEDDED_DATA,
        B_TRIG_SOURCE,
        B_TRIG_STANDARD,
        B_TRIG_SHUTTER_SYNC,
        B_TRIG_EXTERNAL,
        B_DUAL_ROI,
        B_MIRROR,
        B_FLIP,
        B_PWL_24BIT,
        B_CONFIG_INDEX_MAX,
} camera_sensor_config_index_t;
```
In the user program, the `config_index` field indicates which functions the module selects, with values set as `1 << CONFIG_INDEX_B`. For example, selecting `B_TRIG_STANDARD` means `config_index = 256`.

#### User Program
Refer to the MIPI camera configuration, focusing on deserial configuration. The `deserial` fields below are for common settings.

**Deserial Configuration**
| Field | Description |
|------|------|
|name[CAMERA_MODULE_NAME_LEN]  | Deserializer name, e.g., `max96712`. |
| addr  |   Deserializer device address. |
| gpio_mfp[CAMERA_DES_GPIO_MAX] | MFP GPIO function selection. Common values:<br /> `CAMERA_DES_GPIO_TRIG0 = 0`,<br /> `CAMERA_DES_GPIO_TRIG1 = 1`,<br /> `CAMERA_DES_GPIO_TRIG2 = 2`,<br /> `CAMERA_DES_GPIO_TRIG3 = 3`. <br /> E.g., `.gpio_mfp[CAMERA_DES_GPIO_TRIG0] = 5` means the LPWM trigger signal from the SoC is connected to deserializer MFP5.|
|link_desp[CAMERA_DES_LINKMAX][CAMERA_DES_PORTDESP_LEN] | Configuration description for each Link-connected module. Required for multi-process; optional for single process. Format: `name:extra_mode@config_index`<br /> E.g., `strcpy(g_deserial_config[0].link_desp[0], "ar0820std:5@256");`<br /> Means port0 uses the `ar0820` module with `emode=5` and `config_index=256`.|
| poc_cfg_t | See POC configuration. |
| mipi_config_t | See corresponding MIPI camera configuration. Note `extra_mode` and `config_index`. |
| end_flag | Fixed to `DESERIAL_CONFIG_END_FLAG`. |

**POC Configuration**
| Field | Description |
|------|------|
|name[CAMERA_MODULE_NAME_LEN] | POC name, e.g., `max20087`. |
| addr | POC device I2C address. |
| poc_map | POC-to-link mapping, configured according to the hardware schematic. For SDK hardware: `0x1320`. |
| end_flag | Fixed to `POC_CONFIG_END_FLAG`. |

For board-side program execution and ISP image preview, refer to the MIPI camera bring-up section.

## V4L2 Sensor Bring-up

### V4L2 Sensor Driver Writing Guide

:::info

The RDK S100 and RDK S600 platforms are largely identical in software, only differing in paths, nodes, etc. The following uses the RDK S100 platform as an example.

:::

The RDK S100 Camsys sensor V4L2 driver software framework is a standard V4L2 sub-device driver.
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_10.png" alt="V4L2 Sensor Driver Framework" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
The following uses the IMX219 driver as an example to describe the V4L2 driver development process for a MIPI directly connected sensor. The IMX219 driver source is located at: `kernel/drivers/media/i2c/imx219.c`.

#### Define the Sensor Private Structure
The IMX219 private structure is as follows:
```c
struct imx219 {
        struct v4l2_subdev sd;
        struct media_pad pad;
        struct i2c_client *i2c_client;
        ...
        struct v4l2_ctrl *xxx_ctrl;
        ...
};
```
- `sd`: V4L2 sub-device handle for subdev ops operations.
- `pad`: Media pad for establishing media link relationships with downstream modules.
- `i2c_client`: I2C client handle for interacting with the sensor via the I2C bus.
- `xxx_ctrl`: V4L2 control attributes, e.g., exposure, flip, blank control (optional).

#### V4L2 Callback Functions Implementation

A V4L2-compliant sensor driver must implement certain `ops` functions, which the V4L2 framework uses to control the sensor.
```c
static const struct v4l2_subdev_ops imx219_subdev_ops = {
        .core = &imx219_core_ops,
        .video = &imx219_video_ops,
        .pad = &imx219_pad_ops,
};
```
Implement the V4L2 subdev ops callbacks, including core ops, video ops, and pad ops.
```c
static const struct v4l2_subdev_pad_ops imx219_pad_ops = {
        .enum_mbus_code = imx219_enum_mbus_code,
        .get_fmt = imx219_get_pad_format,
        .set_fmt = imx219_set_pad_format,
        .enum_frame_size = imx219_enum_frame_size,
};
```
Pad ops define format configuration and negotiation callbacks and must be implemented.
```c
static const struct v4l2_subdev_video_ops imx219_video_ops = {
        .s_stream = imx219_set_stream,
};
```
Video ops mainly define stream on/off interfaces and must be implemented.
```c
static const struct v4l2_subdev_core_ops imx219_core_ops = {
        .subscribe_event = v4l2_ctrl_subdev_subscribe_event,
        .unsubscribe_event = v4l2_event_subdev_unsubscribe,
};
```
Core ops define things like ioctl event handling (optional).

```c
static const struct v4l2_subdev_internal_ops imx219_internal_ops = {
        .open = imx219_open,
};
```
Internal ops manage the sub-device lifecycle (open, close, release callbacks) as needed.

#### Sensor probe Function
```c
static int imx219_probe(struct i2c_client *client)
{
        imx219 = devm_kzalloc(&client->dev, sizeof(*imx219), GFP_KERNEL); // 1
        if (!imx219)
                return -ENOMEM;
        ...
        v4l2_i2c_subdev_init(&imx219->sd, client, &imx219_subdev_ops);  // 2

        imx219->sd.flags |= V4L2_SUBDEV_FL_HAS_DEVNODE |
                        ┆   V4L2_SUBDEV_FL_HAS_EVENTS;
        imx219->sd.entity.function = MEDIA_ENT_F_CAM_SENSOR;
        imx219->pad.flags = MEDIA_PAD_FL_SOURCE;
        ret = media_entity_pads_init(&imx219->sd.entity, 1, &imx219->pad);  // 3

        ret = v4l2_async_register_subdev_sensor(&imx219->sd);  // 4

        ...
}
```
1. Initialize the sensor structure and allocate memory.
2. Initialize a V4L2 subdev and bind it to the I2C client.
3. Initialize the media entity pad information so the media controller knows the sensor has one output pad that can connect to downstream modules.
4. Asynchronously register the sensor subdev with the V4L2 framework.

#### Sensor Device Tree
RDK S100 loads the IMX219 device tree by default. The device tree format is shown below. For other MIPI sensors, use a DTS overlay to override the IMX219 DTS.
```c
&i2c1 {
        status = "okay";

        imx219@10 {
                status = "okay";
                compatible = "sony,imx219";
                ...
                reg = <0x10>; // Sensor I2C address
                ...
                port {
                        cam_to_mipi_csi0: endpoint {  // MIPI-related properties
                                remote-endpoint = <&rdk_s100_mipi_csi0_from_cam>;  // Connect to MIPI RX0
                                clock-lanes = <0>;
                                data-lanes = <1 2>;
                                link-frequencies =
                                        /bits/ 64 <456000000>;
                                virtual-channel = <0>;
                        };
                };
        };
};

&mipi_host0 {
        ports {
                port@0 {
                        rdk_s100_mipi_csi0_from_sensor0: endpoint {
                                remote-endpoint = <&sensor0_to_mipi_csi0>;
                                clock-lanes = <0>;
                                data-lanes = <1 2>;    // MIPI data lanes: 2 lanes
                                lane-rate = <1728>;    // MIPI rate
                                vc_id = <0>;            // Sensor output virtual channel
                                emb-en = <1>;            // Whether sensor output includes embedded data
                        };
                };
        };
};
```

### V4L2 GMSL SerDes Interface Call Description
Camsys supports sensors connected via Maxim serializers. The camera sub-board comes with a Maxim deserializer MAX96712 by default. The GMSL sensor is registered as a V4L2 subdev in the V4L2 framework. The serializer and deserializer drivers provide operation function sets for the GMSL sensor driver and are not implemented as V4L2 subdevs themselves.
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_11.png" alt="GMSL SerDes Interface Framework" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

Serdes-related data structures and callback functions are defined in `kernel/include/media/i2c/serdes_core.h`; include this header: `#include <media/i2c/serdes_core.h>`.
This section uses the 0820C GMSL sensor as an example to describe Camsys GMSL sensor development.

#### Adding Members to the Sensor Structure
```c
struct ar0820 {
        ...
        struct serdes_device *ser_dev;
        struct serdes_device *dser_dev;
        struct serdes_ctx g_ctx;
        ..
};
```

The sensor driver must include `ser_dev` and `dser_dev` structures to operate the serializer and deserializer. It also needs the `serdes_ctx` member `g_ctx` to store serdes-related attributes. Key members of `serdes_ctx`:
```c
struct serdes_ctx {
        u32 serdes_csi_link;    // Stores the deserializer port value in the sensor driver
        u32 ser_reg;            // Mapped I2C address target for the serializer
        u32 sdev_reg;           // Actual sensor I2C address
        u32 sdev_def;           // Mapped I2C address target for the sensor
        struct device *sen_dev;
        u32 lane_num;           // Number of MIPI data lanes between sensor and serializer
        u32 data_type;          // Sensor output data type
        u32 dst_vc;             // Sensor output virtual channel
};
```

#### Serdes Callback Functions
Both the serializer and deserializer provide the following callback functions for the sensor driver to call using the `SERDES_OP` macro.
```c
/* Return value >= 0 indicates success, < 0 indicates failure */
struct serdes_ops {
        /* Initialize serializer/deserializer with basic configuration */
        int (*init)(struct serdes_device *serdes_dev);
        /* Extra initialization for e.g., d457 -> max9295a, enabling all 4 pipes */
        int (*init_ex)(struct serdes_device *serdes_dev);
        /* Reserved */
        int (*reset)(struct serdes_device *dev);
        /* Pass parsed DTS values via serdes_ctx to serializer and deserializer */
        int (*set_ctx)(struct serdes_device *serdes_dev,
                ┆      struct serdes_ctx *ctx);
        /* Used by deserializer to establish link; default settings do not enable link */
        int (*setup_link)(struct serdes_device *serdes_dev,
                        ┆ struct device *sen_dev);
        /* remote_contrl_get -> map_addr -> remote_contrl_put: used together during I2C address remapping to ensure device stability */
        int (*remote_contrl_get)(struct serdes_device *serdes_dev,
                                ┆struct device *sen_dev);
        int (*remote_contrl_put)(struct serdes_device *serdes_dev);
        /* Serializer call to remap I2C addresses of serializer and sensor */
        int (*map_addr)(struct serdes_device *serdes_dev);
        /* Serializer: pull up a specific MFP */
        int (*enable_mfp)(struct serdes_device *serdes_dev, uint8_t gpio_index);
        /* Serializer: pull down a specific MFP */
        int (*clear_mfp)(struct serdes_device *serdes_dev, uint8_t gpio_index);
        /* Deserializer: enable MIPI TX to start streaming (serializer is enabled by default) */
        int (*set_stream)(struct serdes_device *serdes_dev,
                        struct device *sen_dev, int enable);
        /* Configure GMSL video pipe properties from DTS; default configures pipe-z */
        int (*set_pipe)(struct serdes_device *serdes_dev,
                        struct device *sen_dev);
        /* For complex scenarios: flexible per-pipe configuration of GMSL video pipe data */
        int (*set_pipe_ex)(struct serdes_device *serdes_dev, struct device *sen_dev,
                        uint8_t pipe, uint8_t vc_id, uint8_t data_type);
        /* Check available deserializer pipes by virtual channel; returns available pipe id (0-3).
           Used by d457 sensor before streaming, paired with release_pipe_id */
        int (*get_pipe_id)(struct serdes_device *serdes_dev,
                        uint8_t vc_id);
        /* Release a deserializer video pipe after use */
        int (*release_pipe_id)(struct serdes_device *serdes_dev,
                        uint8_t pipe_id);
};
```

1. During sensor `probe`, call some serdes ops for software initialization, parse DTS values, and pass them via `set_ctx` to the serializer and deserializer drivers.
```c
ret = SERDES_OP(priv->ser_dev, set_ctx, priv->ser_dev, &priv->g_ctx);
ret = SERDES_OP(priv->dser_dev, set_ctx, priv->dser_dev, &priv->g_ctx);
```
This establishes the software link relationship with the serializer and deserializer.

```c
        ret = SERDES_OP(priv->dser_dev, init, priv->dser_dev);
        ret = SERDES_OP(priv->dser_dev, setup_link, priv->dser_dev, sen_dev);
        ret = SERDES_OP(priv->dser_dev, remote_contrl_get, priv->dser_dev,
        ret = SERDES_OP(priv->ser_dev, map_addr, priv->ser_dev);
        ret = SERDES_OP(priv->dser_dev, remote_contrl_put, priv->dser_dev);
        ret = SERDES_OP(priv->ser_dev, init, priv->ser_dev);
        ret = SERDES_OP(priv->ser_dev, set_pipe, priv->ser_dev, sen_dev);
        ret = SERDES_OP(priv->dser_dev, set_pipe, priv->dser_dev, sen_dev);
        ret = SERDES_OP(priv->ser_dev, clear_mfp, priv->ser_dev,
                        priv->mfp_reset);
        ret = SERDES_OP(priv->ser_dev, enable_mfp, priv->ser_dev,
                        priv->mfp_reset);
```
Call ops for serializer/deserializer link, address, pipe, and MFP initialization.

2. In `s_stream`, configure the deserializer to start streaming and enable serializer MFP:
```c
SERDES_OP(priv->ser_dev, enable_mfp, priv->ser_dev,priv->mfp_trigger);
SERDES_OP(priv->dser_dev, set_stream, priv->dser_dev, sen_dev, 1);
```

#### Sensor Device Tree
RDK S100 V4L2 GMSL sensor loads the 0820c DTS by default. The GMSL sensor device tree format is as follows:
```c
ar0820@11 {
                compatible="d-robotics,ar0820";
                reg = <0x11>;     // Mapped address
                addr = <0x10>;    // Actual sensor I2C address
                ......
                mfp-reset = <0>;  // Reset connected to serializer MFP
                mfp-trigger = <7>;// Trigger pin connected to serializer MFP
                d-robotics,serdes-ser-device = <&ser_a>;  // Link to serializer on link A
                d-robotics,serdes-dser-device = <&dser>;  // Connected to deserializer
                status = "okay";

                port {
                        cam_0_to_mipi_csi4: endpoint {    // Connected to MIPI RX4
                                remote-endpoint = <&mipi_csi4_from_cam_0>;
                                virtual-channel = <0>;
                        };
                };
};
```

### Sensor dtbo File Writing and Configuration
U-Boot supports DTB Overlay, allowing modification/addition (but not deletion) to the currently used DTB file by writing corresponding dtbo files without modifying the original DTS.

#### Generating sensor dtbo Files
1. Write a dtso file.
```c
/* Note: node names and addresses may differ across platforms */
#include <dt-bindings/gpio/gpio.h>

/dts-v1/;
/plugin/;

/ {
    fragment@1 {
        target-path = "/soc/i2c@39450000/";
            __overlay__ {
                status = "okay";
                d457@11 {
                    compatible="intel,d4xx";
                    reg = <0x11>;
                    def-addr = <0x10>;
                    width = <640>;
                    height = <480>;
                    cam-type = "Depth";
                    data_type = <0x2e>;
                    lane_num = <2>;
                    vc_id = <0>;
                    d-robotics,serdes-ser-device = <&ser_a>;
                    d-robotics,serdes-dser-device = <&dser>;
                    status = "okay";

                    port {
                        sensor_0_to_mipi_csi4: endpoint {
                            remote-endpoint = <&mipi_csi4_from_sensor_0>;
                            virtual-channel = <0>;
                        };
                    };
                };
           };
      };
};
```
2. Compile the dtbo on the board.
   - Install dtc:
```c
sudo apt install device-tree-compiler -y
```
   - Preprocess the dtso file (if includes or definitions are used):
```c
HEADER_DIR=$(find /usr/src -maxdepth 1 -type d -name "linux-headers-*" | sort -Vr | head -n 1)
DTS_HEAD_PATH="$HEADER_DIR/include"

cpp -nostdinc -I "$DTS_HEAD_PATH" sample.dtso > sample.dtbi
```
   - Compile the dtbo file:
     If there is a dtbi file:
```c
dtc -q -@ -I dts -O dtb -o sample.dtbo sample.dtbi
```
     If there is no dtbi file:
```c
dtc -q -@ -I dts -O dtb -o sample.dtbo sample.dtso
```

#### Automatic Application of sensor dtbo on Boot
1. Place the compiled dtbo file in `/boot/overlays`.
   If the directory does not exist, create it manually, or install `hobot-camera.deb` to get `/boot/overlays` and the d457 sensor dtbo file.
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_12.png" alt="dtbo Files in overlays Directory" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

2. Modify `config.txt` to specify the dtbo file to add.
   If `config.txt` does not exist, create it.
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_13.png" alt="config.txt Configuration Example" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
   Modify `config.txt` as follows:
`dtbo_file_path=/overlays/v0p5_d457_2v_depth_color.dtbo`

3. Reboot the board to apply the dtbo. In the debug version U-Boot log, you can check the dtbo loading status.
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_14.png" alt="U-Boot dtbo Loading Log" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Sensor Gain LUT Table Writing Guide
For RAW format sensors connected to the S100 ISP image system, in addition to writing the sensor V4L2 driver, you need to create a `.so` file containing the sensor gain LUT conversion table, including `again_lut`, `dgain_lut`, etc. Human perception of brightness is closer to a logarithmic scale than linear; dB units align with this perception. The S100 ISP gain LUT stores sensor gain register configuration values in dB-continuous order, allowing the ISP to find the corresponding sensor register values when adjusting sensor gain and apply them to the sensor. The following uses IMX219 as an example to describe how to create a V4L2 sensor LUT `.so`.

The IMX219 sensor gain LUT directory in the SDK is `hobot-camera/v4l2/v4l2_helper/imx219_v4l2`.

1. Add `<sensor_name>_camera_helper.c`, Makefile, and version file `version.mk`.
```
imx219_v4l2
├── imx219_camera_helper.c
├── Makefile
└── version.mk
```

2. In `xxx_helper.c`, create the `again_lut` and `dgain_lut` arrays. Each is a `uint32_t` array with a maximum of 256 members. Each member is a gain register configuration value; consecutive members must correspond to continuous dB values. Example for IMX219:
```c
static uint32_t imx219_again_lut[] = {
        0x00,   // 0 dB
        0x05,   // ~0.2 dB
        0x0B,   // ~0.4 dB
        0x0F,   // ~0.6 dB
        0x15,   // ~0.8 dB
        ......
        0xE7,   // ~20.4 dB
        0xE8,   // ~20.6 dB
        0xffff, // End flag
};

static uint32_t imx219_dgain_lut[] = {
        0x0100,  // 0 dB
        0x0106,  // ~0.2 dB
        0x010c,  // ~0.4 dB
        0x0112,  // ~0.6 dB
        ......
        0x0f53,  // ~23.6 dB
        0x0fa9,  // ~23.8 dB
        0x0fd9,  // ~24.0 dB
        0xffff,  // End flag
};
```
The last member of each LUT must be `0xffff`.

3. Implement `again index to reg` and `dgain index to reg` callback functions, and an interface to retrieve them. The IMX219 implementation can be reused:
```c
typedef uint32_t (*AGainIndexToReg_t)(uint8_t);  // Input uint8 index, output uint32 sensor register value
typedef uint32_t (*DGainIndexToReg_t)(uint8_t);  // Same

typedef struct {
        AGainIndexToReg_t again_index_to_reg_callback;
        DGainIndexToReg_t dgain_index_to_reg_callback;
} Callbacks;   // Callback structure; no changes needed

uint32_t again_index_to_reg_function(uint8_t isp_index)
{
        if (isp_index >= sizeof(imx219_again_lut)/sizeof(uint32_t))
                isp_index = sizeof(imx219_again_lut)/sizeof(uint32_t) - 1;
        return imx219_again_lut[isp_index];
}

uint32_t dgain_index_to_reg_function(uint8_t isp_index)
{
        if (isp_index >= sizeof(imx219_dgain_lut)/sizeof(uint32_t))
                isp_index = sizeof(imx219_dgain_lut)/sizeof(uint32_t) - 1;

        return imx219_dgain_lut[isp_index];
}

Callbacks cb = {again_index_to_reg_function,
                dgain_index_to_reg_function,};

//get_index_to_reg_callbacks
Callbacks* get_index_to_reg_callbacks() {
        return &cb;
}
```

The generated `.so` should be named `lib<sensor_name>_v4l2.so`. At runtime, it will be automatically matched and loaded via `dlopen`, and the symbol will be called to obtain the LUT.

### Exposure Synchronization Sensor Driver Description
The S100/S600 Camsys serdes provides trigger-related interfaces that sensor drivers can call to configure LPWM hardware and enable LPWM.
Hardware exposure synchronization is currently supported only for GMSL sensors. The sensor DTS must have the correct trigger MFP pin configured.
```c
SERDES_OP(priv->dser_dev, trigger_cfg, priv->dser_dev, sen_dev, period, duty);
```
Call `trigger_cfg` during sensor initialization format configuration to apply LPWM settings.
- `period` in ns: calculated as `(1000000/fps) * 1000`.
- `duty` in ns: can be set to 10000 if no special requirements.
```c
SERDES_OP(priv->dser_dev, trigger_enable, priv->dser_dev, sen_dev, enable);
```
Call `trigger_enable` during stream start/stop to enable or disable LPWM output.

### Depth Camera Bring-up Notes
Currently, the camera supports two GMSL depth cameras: RealSense D457 and Orbbec Gemini 335Lg. This section describes differences between these depth cameras and other GMSL cameras.

#### Limitations
1. Only supports depth and color data; **IR data is not supported**.
   - Gemini 335Lg can obtain IMU data through the official SDK.
   - D457 does not support IMU data in this solution.
2. Each data stream occupies one input port of the deserializer.
   - The RDK S100 camera sub-board comes with one deserializer, supporting up to 4 data streams (e.g., depth + color = 2 streams).
   - The RDK S600 camera sub-board supports up to 4 deserializers, supporting up to 16 data streams.
3. When connecting different numbers of cameras or mixing D457 and 335Lg, you need to adapt the dtb overlay to ensure correct I2C addresses, virtual channels (VC), and port bindings for each stream.
4. There are known issues with the D457 and 335Lg firmware; refer to the official documentation and release notes for specific issues.

The following uses connecting 2 D457 units, generating V4L2 video nodes, and previewing with the official SDK as an example to highlight important points.

#### Writing and Adding dtb Overlay Files
Refer to the dtbo writing method described earlier: [dtbo Writing Instructions](./02_camera_bringup.md#sensor-dtbo-file-writing-and-configuration).
Key points are annotated in the code below:
```c
 d457@11 {
                compatible="intel,d4xx";
                reg = <0x11>;    // Mapped I2C address
                def-addr = <0x10>;    // Actual D457 I2C physical address
                width = <640>;
                height = <480>;
                cam-type = "Depth";    // Data type: currently Depth or RGB
                data_type = <0x2e>;    // Corresponding datatype: Depth -> 0x2e, RGB -> 0x1e
                lane_num = <2>;    // D457 MIPI lanes fixed at 2
                vc_id = <0>;    // MIPI virtual channel assigned to the SoC by the deserializer
                d-robotics,serdes-ser-device = <&ser_a>;     // Connected to port_a for depth data
                d-robotics,serdes-dser-device = <&dser>;
                status = "okay";

                port {
                        d457_0_to_mipi_csi4: endpoint {
                                remote-endpoint = <&mipi_csi4_from_d457_0>;
                                virtual-channel = <0>;
                        };
                };
        };
 d457@12 {
                compatible="intel,d4xx";
                reg = <0x12>;
                def-addr = <0x10>;
                width = <640>;
                height = <480>;
                cam-type = "RGB";
                data_type = <0x1e>;
                lane_num = <2>;
                vc_id = <1>;
                d-robotics,serdes-ser-device = <&ser_a>;  // Connected to port_a for RGB data
                d-robotics,serdes-dser-device = <&dser>;
                status = "okay";

                port {
                        d457_1_to_mipi_csi4: endpoint {
                                remote-endpoint = <&mipi_csi4_from_d457_1>;
                                virtual-channel = <1>;
                        };
                };
        };
d457@13 {
        compatible="intel,d4xx";
        reg = <0x13>;
        def-addr = <0x10>;
        width = <640>;
        height = <480>;
        cam-type = "Depth";
        data_type = <0x2e>;
        lane_num = <2>;
        vc_id = <2>;
        d-robotics,serdes-ser-device = <&ser_c>;
        d-robotics,serdes-dser-device = <&dser>;
        status = "okay";

        port {
                d457_2_to_mipi_csi4: endpoint {
                        remote-endpoint = <&mipi_csi4_from_d457_2>;
                        virtual-channel = <2>;
                };
        };
};

d457@14 {
        compatible="intel,d4xx";
        reg = <0x14>;
        def-addr = <0x10>;
        width = <640>;
        height = <480>;
        cam-type = "RGB";
        data_type = <0x1e>;
        lane_num = <2>;
        vc_id = <3>;
        d-robotics,serdes-ser-device = <&ser_c>;
        d-robotics,serdes-dser-device = <&dser>;
        status = "okay";

        port {
                d457_3_to_mipi_csi4: endpoint {
                        remote-endpoint = <&mipi_csi4_from_d457_3>;
                        virtual-channel = <3>;
                };
        };
};
```
- `cam-type` and `data_type` must match, otherwise Depth/RGB parsing will fail.
- `vc_id` planning must match the number of depth/color streams to avoid contention.
- Ensure `d-robotics,serdes-ser-device` (`ser_a`/`ser_c`) corresponds to the physical wiring.

Supported dtb overlays on the board:
1. `s100_d457_rx4_4v_dpeth.dtbo`: RDK S100 official camera expansion board, via MIPI RX4, supports 4 D457 units, providing 4 depth streams.
2. `s100_12v_camera_board_d457_rx4_portAC_rx1_portAC_depth_color.dtbo`: RDK S100 12-channel GMSL camera expansion board, via MIPI RX4 and RX1, supports 4 D457 units, providing 4 depth and 4 RGB streams.
3. `s100_335lg_rx4_2v_portA_portB_depth_color.dtbo`: RDK S100 official camera expansion board, via MIPI RX4, supports 2 335Lg units, providing 2 depth and 2 RGB streams.
4. `s600_335lg_rx2_portAC_rx3_portAC_depth_color.dtbo`: RDK S600 official camera expansion board, via MIPI RX2 and RX3, supports 4 335Lg units, providing 4 depth and 4 RGB streams.
5. `s600_d457_rx2_portAC_rx3_portAC_depth_color.dtbo`: RDK S600 official camera expansion board, via MIPI RX2 and RX3, supports 4 D457 units, providing 4 depth and 4 RGB streams.

#### Switching to V4L2 Mode
Refer to [V4L2 Usage](./01_camsys.md#usage) to load the Camsys V4L2 kernel modules. Note that you need to load the depth camera kernel module: `d457.ko` for D457, `g300.ko` for 335Lg.

#### Modifying the Official SDK
The official SDKs for D457 and 335Lg are adapted for other platforms, so modifications are needed for RDK S100.
D457 SDK: [D457](https://github.com/realsenseai/librealsense), 335Lg SDK: [335Lg](https://github.com/orbbec/OrbbecSDK_v2).

D457 modification diff:
```c
diff --git a/src/linux/backend-v4l2.cpp b/src/linux/backend-v4l2.cpp
index 974827d48..9e7472e9c 100644
--- a/src/linux/backend-v4l2.cpp
+++ b/src/linux/backend-v4l2.cpp
@@ -1745,7 +1745,12 @@ namespace librealsense
             std::string driver_str = reinterpret_cast<char*>(cap.driver);
             // checking if "tegra" is part of the driver string
             size_t pos = driver_str.find("tegra");
-            return pos != std::string::npos;
+            size_t pos_vs = driver_str.find("vs");
+            // return pos != std::string::npos;
+            if (pos != std::string::npos || pos_vs != std::string::npos) {
+                return true;
+            }
+            return false;
         }

         void v4l_uvc_device::acquire_metadata(buffers_mgr& buf_mgr,fd_set &, bool compressed_format)
```
335Lg modification diff:
```c
git diff .
diff --git a/src/platform/usb/uvc/ObV4lGmslDevicePort.cpp b/src/platform/usb/uvc/ObV4lGmslDevicePort.cpp
index 7b561e79..864ff72d 100644
--- a/src/platform/usb/uvc/ObV4lGmslDevicePort.cpp
+++ b/src/platform/usb/uvc/ObV4lGmslDevicePort.cpp
@@ -1779,7 +1779,7 @@ int ObV4lGmslDevicePort::resetGmslDriver() {
 }

 // bus_info:platform:tegra-capture-vi:0
-#define GMSL_MIPI_DEVICE_TAG "platform:tegra-capture-vi"
+#define GMSL_MIPI_DEVICE_TAG "platform"
 bool is_gmsl_mipi_device(const std::string bus_info) {
     return bus_info.find(GMSL_MIPI_DEVICE_TAG) != std::string::npos;
 }
 ```
Refer to the official documentation for SDK compilation.

#### Creating Soft Links for D457
> Note: The D457 official SDK matches devices by fixed `/dev/video-rs-*` names, so manual soft links are required.
> Adjust links when the number of streams or video node numbers change.

Example: RDK S100 with 2 depth + 2 color streams:
```c
# modprobe vid_v4l2 scene=0, MIPI RX4 starts from video2.
ln -s /dev/video2 /dev/video-rs-depth-0
ln -s /dev/video3 /dev/video-rs-color-0
ln -s /dev/video4 /dev/video-rs-depth-1
ln -s /dev/video5 /dev/video-rs-color-1
# video0 and video1 are RX0/RX1, not used.
# IMU soft links for librealsense adaptation on RDK S100
ln -s /dev/video0 /dev/video-rs-imu-0
ln -s /dev/video0 /dev/video-rs-imu-1
```
For `scene` number descriptions, refer to [Scene Description](./01_camsys.md#scene-description).

#### Preview Images
After compiling the D457 SDK, run `realsense-viewer` in the terminal, add the D457 device, and preview. Example:
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_16.png" alt="D457 Preview" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
The viewer shows one D457 by default; click "Add Source" to display multiple streams.

After compiling the 335Lg SDK, start the viewer and check depth and color images.
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_17.png" alt="335Lg Preview" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />