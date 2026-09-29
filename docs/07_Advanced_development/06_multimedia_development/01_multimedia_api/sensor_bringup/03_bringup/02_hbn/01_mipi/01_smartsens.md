---
sidebar_position: 1
title: "SmartSens Sensor Bring-Up"
description: "SmartSens 系列 sensor 适配流程（以 sc132gs 为例）"
---

# SmartSens Sensor Bring-Up

- 本文以 **sc132gs** 为例，说明适配 SmartSens 系列 Camera Sensor 的完整流程
- 流程包括驱动实现、App 配置与程序验证。通用概念与 dts 配置请先阅读 [Camera 调试指南](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/hbn/overview)。

**源码位置**

- **驱动接口实现**：`source/hobot-camera/drivers/sensor/sc132gs/sc132gs_utility.c`
- **增益表与 Setting 配置**：`source/hobot-camera/drivers/sensor/sc132gs/inc/sc132gs_setting.h`（`gain_lut`、init/stream_on/stream_off 寄存器数组）

---

## dts配置

- 关于dts配置和上电和sensor的id识别验证参考[修改平台设备树](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/hbn/overview#修改平台设备树-dts)

---

## 驱动

### sensor_module_t 与文件命名

- 文件名：`sc132gs_utility.c`；结构体/模块名：`sc132gs`；库名：`libsc132gs.so.1.0.0`，部署到板端 `/usr/hobot/lib/sensor/`。
- 需实现的接口：init、deinit、start、stop、power_on、power_off、aexp_gain_control、aexp_line_control、userspace_control。

```c
#ifdef CAMERA_FRAMEWORK_HBN
SENSOR_MODULE_F(sc132gs, CAM_MODULE_FLAG_A16D8);
sensor_module_t sc132gs = {
        .module = SENSOR_MNAME(sc132gs),
#else
sensor_module_t sc132gs = {
        .module = "sc132gs",
#endif
        .init = sensor_init,
        .start = sensor_start,
        .stop = sensor_stop,
        .deinit = sensor_deinit,
        .power_on = sensor_poweron,
        .power_off = sensor_poweroff,
        .aexp_gain_control = sensor_aexp_gain_control,
        .aexp_line_control = sensor_aexp_line_control,
        .userspace_control = sensor_userspace_control,
};
```

### power_on

1. power_on 通过 GPIO 控制 sensor 上电，需结合 spec 上电时序。
2. sensor_poweron 一般在 sensor_init 中调用，只需要控制 XSHUTDN 即可，以下为 sc132gs power_on的代码实现：

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/smartsens/screenshot-20260210-145501.png)

```c
int sensor_poweron(sensor_info_t *sensor_info)
{
        int gpio, ret = RET_OK;
        if(sensor_info->gpio_num > 0) {
                for(gpio = 0; gpio < sensor_info->gpio_num; gpio++) {
                        if(sensor_info->gpio_pin[gpio] != -1) {
                                ret = vin_power_ctrl(sensor_info->gpio_pin[gpio],
                                                sensor_info->gpio_level[gpio]);
                                usleep(1 * 100 * 1000);  // 100ms
                                ret |= vin_power_ctrl(sensor_info->gpio_pin[gpio],
                                                1 - sensor_info->gpio_level[gpio]);
                                if(ret < 0) {
                                        vin_err("vin_power_ctrl fail\n");
                                        return -HB_CAM_SENSOR_POWERON_FAIL;
                                }
                                usleep(100 * 1000);  // 100ms
                        }
                }
        }
        return ret;
}
```

### power_off

1. power_off 通过 GPIO 控制 sensor 下电，需结合 spec 上电时序。
2. sensor_poweroff 一般在 sensor_deinit 中调用，只需要控制 XSHUTDN 即可，以下为 sc132gs power_off 的代码实现：

```c
int sensor_poweroff(sensor_info_t *sensor_info)
{
        int gpio, ret = RET_OK;
        if(sensor_info->gpio_num > 0) {
                for(gpio = 0; gpio < sensor_info->gpio_num; gpio++) {
                        if(sensor_info->gpio_pin[gpio] != -1) {
                                ret = vin_power_ctrl(sensor_info->gpio_pin[gpio],
                                                                sensor_info->gpio_level[gpio]);
                                if(ret < 0) {
                                        vin_err("vin_power_ctrl fail\n");
                                        return -1;
                                }
                        }
                }
        }
        return ret;
}
```

### init

1. 将 sensor 初始化寄存器列表通过i2c写函数写入 sensor；不同分辨率使用不同 setting 数组
2. sc132gs_linear_data_init 用于填充turning_data信息。
3. sensor_init 调用时机为 hbn_camera_attach_to_vin

```c
int sensor_init(sensor_info_t *sensor_info)
{
        int ret = RET_OK;
        int setting_size = 0;

        ret = sensor_poweron(sensor_info);
        if (ret < 0) {
                vin_err("%d : sensor reset %s fail\n", __LINE__, sensor_info->sensor_name);
                return ret;
        }
        switch(sensor_info->sensor_mode) {
        case NORMAL_M:
                vin_info("sc132gs in normal mode\n");
                setting_size = sizeof(sc132gs_linear_init_1088x1280_30fps_2lane_setting_master) / sizeof(uint32_t) / 2;
                ret = sensor_configure(sensor_info, sc132gs_linear_init_1088x1280_30fps_2lane_setting_master, setting_size);
                if (ret < 0) {
                        vin_err("%d : init %s fail\n", __LINE__, sensor_info->sensor_name);
                        return ret;
                }
                ret = sc132gs_linear_data_init_1088x1280(sensor_info);
                if (ret < 0) {
                        vin_err("%d : linear data init %s fail\n", __LINE__, sensor_info->sensor_name);
                        return ret;
                }
                break;
        case SLAVE_M:
                vin_info("sc132gs in slave mode\n");
                setting_size = sizeof(sc132gs_linear_init_1088x1280_30fps_setting_slave) / sizeof(uint32_t) / 2;
                ret = sensor_configure(sensor_info, sc132gs_linear_init_1088x1280_30fps_setting_slave, setting_size);
                if (ret < 0) {
                        vin_err("%d : init %s fail\n", __LINE__, sensor_info->sensor_name);
                        return ret;
                }
                ret = sc132gs_linear_data_init_1088x1280(sensor_info);
                if (ret < 0) {
                        vin_err("%d : linear data init %s fail\n", __LINE__, sensor_info->sensor_name);
                        return ret;
                }
                break;
        default:
                vin_err("not support mode %d\n", sensor_info->sensor_mode);
                ret = -RET_ERROR;
                break;
        }
        vin_info("sc132gs config success under %d mode\n\n", sensor_info->sensor_mode);
        return ret;
}
```

其中 `sensor_configure` 内部调用 `vin_write_array` 写寄存器。

### deinit

1. deinit 一般调用于 sensor的反初始化，直接调用 power_off 下电即可。
2. sensor_deinit 调用时机为 hbn_camera_destroy 或者 hbn_camera_detach_from_vin。

```c
int sensor_deinit(sensor_info_t *sensor_info)
{
        int ret = RET_OK;
        ret = sensor_poweroff(sensor_info);
        if (ret < 0) {
                vin_err("%d : deinit %s fail\n", __LINE__, sensor_info->sensor_name);
                return ret;
        }
        return ret;
}
```

### start

1. start 实现下发开流寄存器0x0100 为0x01，使 sensor 出流。
2. sensor_start 调用时机为 上层调用 hbn_vflow_start。

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/smartsens/screenshot-20260210-204357.png)

```c
int sensor_start(sensor_info_t *sensor_info)
{
        int ret = RET_OK;
        int setting_size = 0;

        switch(sensor_info->sensor_mode) {
        case NORMAL_M:
        case SLAVE_M:
                setting_size = sizeof(sc132gs_stream_on_setting)/sizeof(uint32_t)/2;
                vin_info(" start linear mode, sensor_name %s, setting_size = %d\n", sensor_info->sensor_name, setting_size);
                ret = vin_write_array(sensor_info->bus_num, sensor_info->sensor_addr, 2,
                                setting_size, sc132gs_stream_on_setting);
                if(ret < 0) {
                        vin_err("start %s fail\n", sensor_info->sensor_name);
                        return ret;
                }
                break;
        }
        return ret;
}
```

### stop

1. stop 实现下发关流寄存器 0x0100 为0x00，使 sensor 关流。
2. sensor_stop 调用时机为 上层调用 hbn_vflow_stop

```c
int sensor_stop(sensor_info_t *sensor_info)
{
        int ret = RET_OK;
        int setting_size = 0;

        setting_size = sizeof(sc132gs_stream_off_setting) / sizeof(uint32_t) / 2;
        vin_info("sensor stop sensor_name %s, setting_size = %d\n", sensor_info->sensor_name, setting_size);
        ret = vin_write_array(sensor_info->bus_num, sensor_info->sensor_addr, 2,
                        setting_size, sc132gs_stream_off_setting);
        if (ret < 0) {
                vin_err("start %s fail\n", sensor_info->sensor_name);
                return ret;
        }
        return ret;
}
```

### ISP 配置与 linear_data_init

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/smartsens/screenshot-20260210-151023.png)

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/smartsens/screenshot-20260210-145837.png)


在 `sc132gs_linear_data_init` 中填充 tuning 参数：
- 从 sensor 读 VTS（寄存器 0x320e/0x320f），计算 lines_per_second；
- exposure_time_max/min、analog_gain_max、digital_gain_max；
- 填充 bayer（sensor_data_bayer_fill、sensor_data_bits_fill）；
- 设置 stream_ctrl；将 **again_lut** 从 `sc132gs_setting.h` 中的 `sc132gs_gain_lut` 拷贝到 `turning_data.normal.again_lut`，再通过 ioctl 下发。


关键参数配置：

- `lines_per_second = vts * sensor_info->fps`
- `exposure_time_max = vts - 8`  文档中为FRM_LENGTH_LINES - 8 即 VTS - 8
- `analog_gain_max = 128 * 8192`：gain 量化基准为 8192（2^13），表示最大可用到 LUT 索引 128。ISP AE 下发的 gain 值 / 8192 取整后作为索引查表。
- `digital_gain_max = 0`：表示该配置不使用 digital gain。若需启用，填 `索引值 * 8192`（如 `159 * 8192`）。
- `exposure_time_min = 1` 默认最小配置为 1，spec无限制
- `sensor_data_bayer_fill(..., 10, BAYER_START_B, BAYER_PATTERN_RGGB)`；`sensor_data_bits_fill(..., 12)`，0,0位置BAYER_START是 BAYER_START_B，BAYER_PATTERN是RGGB，raw10格式,sensor_data_bits_fill pwl mode 才会用到，这里配置12即可
### aexp_gain_control


- 对于 SmartSens 的sensor gain控制，一般采用的是 离散档位 + 精细调节,通常查表是最快的，根据表生成直接填写 agin_lut 和 dgain_lut即可（不需要使用 gain_table.xlsx），比较方便快捷
- SmartSens 使用 **again + dgain** 两路 LUT，寄存器为 AGAIN 0x3e08/0x3e09、DGAIN 0x3e06/0x3e07。根据 ISP 下发的 again[0]/dgain[0] 索引查表.

**参考文档：**

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/smartsens/screenshot-20260116-103909.png)


```c
static int sensor_aexp_gain_control(hal_control_info_t *info, uint32_t mode, uint32_t *again, uint32_t *dgain, uint32_t gain_num)
{
        const uint16_t AGAIN_LOW = 0x3e08;
        const uint16_t AGAIN_HIGH = 0x3e09;
        const uint16_t DGAIN_LOW = 0x3e06;
        const uint16_t DGAIN_HIGH = 0x3e07;
        char ana_gain = 0, ana_fine_gain = 0;
        char dig_gain = 0, dig_fine_gain = 0;
        int again_index = 0, dgain_index = 0;

        if (mode == NORMAL_M || mode == DOL2_M || mode == SLAVE_M) {
                if (again[0] >= sizeof(sc132gs_gain_lut)/sizeof(uint32_t))
                        again_index = sizeof(sc132gs_gain_lut)/sizeof(uint32_t) - 1;
                else
                        again_index = again[0];
                if (dgain[0] >= sizeof(sc132gs_dgain_lut)/sizeof(uint32_t))
                        dgain_index = sizeof(sc132gs_dgain_lut)/sizeof(uint32_t) - 1;
                else
                        dgain_index = dgain[0];

                ana_gain = (sc132gs_gain_lut[again_index] >> 8) & 0xFF;
                ana_fine_gain = sc132gs_gain_lut[again_index] & 0xFF;
                dig_gain = (sc132gs_dgain_lut[dgain_index] >> 8) & 0xFF;
                dig_fine_gain = sc132gs_dgain_lut[dgain_index] & 0xFF;

                vin_i2c_write8(info->bus_num, 16, info->sensor_addr, AGAIN_LOW, ana_gain);
                vin_i2c_write8(info->bus_num, 16, info->sensor_addr, AGAIN_HIGH, ana_fine_gain);
                vin_i2c_write8(info->bus_num, 16, info->sensor_addr, DGAIN_LOW, dig_gain);
                vin_i2c_write8(info->bus_num, 16, info->sensor_addr, DGAIN_HIGH, dig_fine_gain);
                if (mode == DOL2_M) {
                        vin_i2c_write8(info->bus_num, 16, info->sensor_addr, 0x3e12, ana_gain);
                        vin_i2c_write8(info->bus_num, 16, info->sensor_addr, 0x3e13, ana_fine_gain);
                        vin_i2c_write8(info->bus_num, 16, info->sensor_addr, 0x3e10, dig_gain);
                        vin_i2c_write8(info->bus_num, 16, info->sensor_addr, 0x3e11, dig_fine_gain);
                }
        } else {
                vin_err(" unsupport mode %d\n", mode);
        }
        return 0;
}
```

### aexp_line_control

`aexp_line_control`这个函数是主要实现了曝光的控制，主要负责：
1. 接收ISP 3A算法计算的下发的曝光的行数
2. 将曝光的行数转换为sensor寄存器值
3. 配置通过i2c下发给sensor 曝光寄存器
4. 这里曝光寄存器为  0x3e00、0x3e01、0x3e02。

```c
static int sc132gs_ae_set(uint32_t bus, uint32_t addr, uint32_t line)
{
        const uint16_t EXP_LINE0 = 0x3e00;
        const uint16_t EXP_LINE1 = 0x3e01;
        const uint16_t EXP_LINE2 = 0x3e02;
        char temp0 = 0, temp1 = 0, temp2 = 0;
        uint32_t sline = line;
        if (sline >= 2560) sline = 2560;

        temp0 = (sline & 0xF000) >> 12;
        temp1 = (sline & 0x0FF0) >> 4;
        temp2 = (sline & 0x000F) << 4;
        vin_i2c_write8(bus, 16, addr, EXP_LINE0, temp0);
        vin_i2c_write8(bus, 16, addr, EXP_LINE1, temp1);
        vin_i2c_write8(bus, 16, addr, EXP_LINE2, temp2);
        return 0;
}

static int sensor_aexp_line_control(hal_control_info_t *info, uint32_t mode, uint32_t *line, uint32_t line_num)
{
        uint32_t val;
        if (mode == NORMAL_M || mode == SLAVE_M) {
                val = line[0];
                sc132gs_ae_set(info->bus_num, info->sensor_addr, val);
        } else if (mode == DOL2_M) {
                //todo
        } else {
                vin_err(" unsupport mode %d\n", mode);
        }
        return 0;
}
```

### userspace_control

- 这里 sensor_userspace_control 用于 Gain Control 与 Exposure Control开关。
- 用于 hbplayer 调试时排查 flicker 或画面异常，可开关 HAL_GAIN_CONTROL / HAL_LINE_CONTROL确认问题。

```c
static int sensor_userspace_control(uint32_t port, uint32_t *enable)
{
        vin_info("enable userspace gain control and line control\n");
        *enable = HAL_GAIN_CONTROL | HAL_LINE_CONTROL;
        return 0;
}
```

### 驱动部署

1. 进入 `source/hobot-camera/drivers` 目录，执行 `make` 编译。
2. 将 `source/hobot-camera/debian/usr/hobot/lib/sensor/libsc132gs.so.1.0.0` 拷贝到板端 `/usr/hobot/lib/sensor/`。

---

## App 配置

- 在路径 `source/hobot-spdev/src/vp_sensors/sc132gs/` 中为 sc132gs 添加配置，
- 需配置 mipi（lane、datatype、mipiclk、linelenth、framelenth、settle）、camera（name、addr、sensor_mode、gpio、fps、width、height、format）、vin_node_attr（mipi_rx、cim_isp_flyby 等）、vin_ichn_attr、vin_ochn_attr（wstride 等）、isp_attr、isp_ichn_attr、isp_ochn_attr。

- HTS/VTS 可从寄存器 0x342/0x343、0x340/0x341 读取或咨询 Sensor FAE 提供或者使用示波器测量，测量方法参考 [mipi-参数确定](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/camera_faq)
- mipiclk 一般询问 Sensor FAE即可，计算方法参考 [MIPI CLK](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/camera_faq)
- 其他的都为通用配置，参考文档 [数据结构](/Advanced_development/multimedia_development/multimedia_api/hbn_api)。 进行配置即可

### vp_sensor 配置文件：linear_1088x1280_raw10_30fps_2lane.c

- 配置文件路径：`source/hobot-spdev/src/vp_sensors/sc132gs/linear_1088x1280_raw10_30fps_2lane.c`。
- 配置结构体名：`sc132gs_linear_1088x1280_raw10_30fps_2lane`（需在 vp_sensor_config_list 中注册）。主要参数如下：

| 配置项       | 参数名 / 位置                | 取值说明                                      |
| ------------ | ---------------------------- | --------------------------------------------- |
| **顶层**     | `config_file`                | `"linear_1088x1280_raw10_30fps_2lane.c"`      |
|              | `sensor_name`                | `"sc132gs-30fps"`                             |
|              | `chip_id_reg` / `chip_id`    | 0x3107 / 0x0132                               |
|              | `sensor_i2c_addr_list`       | {0x30, 0x33}                                  |
|              | `sensor_type`                | SLAVE_M（sensor_mode=6，驱动内部转 NORMAL_M） |
| **MIPI**     | `lane`                       | 2                                             |
|              | `datatype`                   | RAW10 (0x2B)                                  |
|              | `fps`                        | 30                                            |
|              | `mipiclk`                    | 2400（Mbps）                                  |
|              | `width` / `height`           | 1088 / 1280                                   |
|              | `linelenth` / `framelenth`   | 1400 / 1500（与 sensor HTS/VTS）              |
|              | `settle`                     | 20                                            |
|              | `channel_num`                | 1                                             |
| **Camera**   | `name` / `addr`              | "sc132gs" / 0x33                              |
|              | `sensor_mode`                | 6 (SLAVE_M)                                   |
|              | `format`                     | RAW10                                         |
|              | `gpio_enable` / `gpio_level` | 不配置（注释掉，无 GPIO 控制）                |
|              | `calib_lname`                | "lib_sc132gs_linear.so"                       |
| **VIN**      | `mipi_rx`                    | 0                                             |
|              | `cim_isp_flyby`              | 0（offline）                                  |
| **VIN 输出** | `wstride`                    | 1376                                          |
| **ISP**      | `hw_id` / `slot_id`          | 1 / 4                                         |
|              | `sched_mode`                 | 1（manual 调度）                              |
|              | `ddr_en`                     | 1                                             |


---

## 程序验证

1. **get_vin_data**：确认 raw 图无严重偏色、帧率符合配置。
2. **get_isp_data**：准备 确认 YUV 正常 出图，无偏色等。
3. **hbplayer**：连接板端预览，见 [hbplayer 和 tuning_tool 工具使用指南](/Advanced_development/multimedia_development/multimedia_api/isp_tuning_guide/hbplayer_tuning_tool)。
4. **tuning_tool**：使用tuning_tool连接hbplayer后，输入命令 e，配置 Manual AE，设置 aGain、integrationTime，看驱动打印核对 0x3e08/0x3e09、0x3e06/0x3e07、0x3e00~0x3e02 与 spec 一致。

常见问题见 [Camera Sensor FAQ](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/camera_faq)。
