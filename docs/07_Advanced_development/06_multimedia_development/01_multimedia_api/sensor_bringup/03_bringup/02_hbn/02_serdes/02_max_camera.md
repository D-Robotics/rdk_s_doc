---
sidebar_position: 2
title: "MAXIM camera Bring-Up"
description: "MAXIM sensor 点亮流程（以 AR0820[max9295a] + MAX96712 为例）"
---


#  MAXIM GMSL camera Bring-Up

## 范围

- 本文以 **AR0820(max9295a) + MAX96712** yuv sensor 为例，说明适配 MAXIM 系列 GMSL Sensor 的完整流程
- 流程包括驱动实现、App 配置与程序验证。通用概念与 dts 配置请先阅读 [Camera 调试指南](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/hbn/overview)。

:::note
该部分内容以 RDK S100 开发板 + AR0820（SG8S-AR0820C-5300-G2A）模组为例进行讲解，RDK S600 基本一致，其他硬件平台或者 camera 模组以实际情况为准。
:::

**源码位置**

- sensor 驱动目录：`source/hobot-camera/drivers/sensor`
- ar0820 驱动目录：`source/hobot-camera/drivers/sensor/ar0820std`
- serial 驱动目录：`source/hobot-camera/drivers/sensor/serial`
- deserial 驱动目录：`source/hobot-camera/drivers/deserial`

GMSL camera sensor 驱动需要实现的内容和 MIPI 驱动类似，这里以 ar0820std 为例，解释差异部分。其中 std 是 HBN 后期重构的、长期维护的 sensor 驱动，建议参考 std 驱动增加新模组配置。

## dts配置

- GMSL dts 涉及 vcon GMSL RX、poc_map、deserial 节点等，配置方法参考 [修改平台设备树](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/hbn/overview#修改平台设备树-dts)。

## 驱动

### sensor_module_t 与文件命名

- 文件名：`ar0820std_utility.c`；结构体/模块名：`ar0820std`；库名：`libar0820std.so.1.2.0`，部署到板端 `/usr/hobot/lib/sensor/`。
- 需实现的接口：`init`、`deinit`、`start`、`stop`、`power_on`、`power_off`。
- `CAM_MODULE_FLAG_A16D16` 表示寄存器 16 位地址 / 16 位值（`REG16_VAL16`）。

```c
SENSOR_MODULE_ECF(ar0820std, sensor_emode, sensor_config_index_funcs, CAM_MODULE_FLAG_A16D16);
sensor_module_t ar0820std = {
	.module = SENSOR_MNAME(ar0820std),
	.init = sensor_init,
	.start = sensor_start,
	.stop = sensor_stop,
	.deinit = sensor_deinit,
	.power_on = sensor_poweron,
	.power_off = sensor_poweroff,
	.get_sns_params = get_sns_info,
#ifdef CAM_DIAG
	.diag_nodes_init = sensor_diag_nodes_init,
#endif
};
```

注意 `ar0820std` 模块**未注册** `aexp_gain_control` / `aexp_line_control` / `userspace_control`，原因见后文 aexp 三段说明。

### sensor_emode

GMSL 多模组可复用一个驱动，靠 `sensor_emode` 表区分模组差异（serial/sensor/eeprom i2c 地址、tuning lib、mclk 等）。`extra_mode & 0xff` 作索引。

`emode_data[]` 每模组一条，本例 `extra_mode=5` 对应 `SENSING_M25F120D4G3_S0R0T7`：

```c
static emode_data_t emode_data[MODE_TYPE_MAX] = {
	// ... 其他模组省略
	[SENSING_M25F120D4G3_S0R0T7] = {
		.serial_addr = 0x40,		// serial i2c addr
		.sensor_addr = 0x10,		// sensor i2c addr
		.eeprom_addr = 0x50,		// eeprom i2c addr
		.serial_rclk_out = 0,		// 0: serial rclk disabl, 1: serial_rclk enable
		.rclk_mfp = 0,			// if serial_rclk_out = 1, the rclk output on rclk_mfp
	},
};
```

`sensor_emode[]` 用 `SENSOR_EMADD` 宏注册，含版本/tuning lib/lib 版本/emode_data 指针：

```c
static const sensor_emode_type_t sensor_emode[MODE_TYPE_NUM] = {
	// ... 其他模组省略
	//D4: YUV422, S0: MAX9295A, R0: sensor module isp reset MFP0 T7: sensor frame sync MFP7
	SENSOR_EMADD(SENSING_M25F120D4G3_S0R0T7, "0.0.1", "lib_ar0820RGGB_pwl12_Sens_Fov30.so", "0.22.9.13", &emode_data[SENSING_M25F120D4G3_S0R0T7]),
	SENSOR_EMEND(),
};
```

命名规则（如 `D4`/`S0`/`R0`/`T7` 含义）见 [Serdes 配置设计说明](./01_debug_config.md) 的 emode_data 段。

![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/serdes_config/extra_mode_naming.png)

#### sensor_config_index_funcs

`config_index` 用位运算一次性下发多个可选配置（embedded data / test pattern / flip / trigger 模式）。每个 bit 位映射到一个配置函数，`sensor_config_do` 按 mask 中的 bit 位逐个调用。

```c
#define CONFIG_INDEX_INIT ( \
		EMBEDDED_MODE | \
		TEST_PATTERN | \
		FLIP | \
		TRIG_STANDARD | \
		TRIG_SHUTTER_SYNC \
		)

static SENSOR_CONFIG_FUNC sensor_config_index_funcs[B_CONFIG_INDEX_MAX] = {
	[B_EMBEDDED_MODE] = sensor_config_index_embed_setting,
	[B_TEST_PATTERN] = sensor_config_index_test_pattern,
	[B_FLIP] = sensor_config_index_filp_setting,
	[B_MIRROR] = sensor_config_index_mirror_setting,
	[B_TRIG_STANDARD] = sensor_config_index_trig_mode,
	[B_TRIG_SHUTTER_SYNC] = sensor_config_index_trig_shutter_mode,
};
```

`ar0820_init` 末尾调用 `sensor_config_do(sensor_info, CONFIG_INDEX_INIT, sensor_config_index_funcs)` 完成下发。`sensor_config_do` 遍历每个 bit，当某 bit 在 mask 与 config_index 中同时置位时调用对应函数。

本例 app `config_index=512 (0x200)` = **bit9 = B_TRIG_SHUTTER_SYNC**，对应 `sensor_config_index_trig_shutter_mode`，走 shutter-sync 触发路径（见下节）。各 bit 位含义见 [config_index 配置](./01_debug_config.md#config_index-配置)。

#### sensor_config_index_trig_shutter_mode

`sensor_config_index_trig_shutter_mode` 是 `sensor_config_index_funcs[B_TRIG_SHUTTER_SYNC]` 的实现，当 `config_index` 的 bit9 置位时由 `sensor_config_do` 调用。作用：配置 deserial 与 serial 的 mfp，建立 shutter-sync。

本例 YUV 模组（`SENSING_M25F120D4G3_S0R0T7`）只做 mfp 配置，不写 sensor trigger 寄存器，配置完即 return：

```c
static int32_t sensor_config_index_trig_shutter_mode(sensor_info_t *sensor_info)
{
	deserial_info_t *deserial_if = sensor_info->deserial_info;
	uint32_t trig_pin_num = 0;
	int32_t ser_trig_mfp;
	uint8_t gpio_id;
	maxdes_ops_t *maxops;
	uint8_t serial_addr = sensor_info->serial_addr & SHIFT_8BIT;

	// 1. 取 maxim deserial 操作集
	maxops = DESERIAL_MAXOPS(deserial_if);
	// 2. 从 emode 解析 serial 的 trigger mfp 编号（如 T7 → 7）
	ser_trig_mfp = vin_sensor_emode_parse(sensor_info, 'T');
	// 3. 统计已配置触发 pin 数，决定 gpio_id
	for (int32_t i = 0; i < DES_LINK_NUM_MAX; i++)
		if (TRIG_PIN(deserial_if, i) >= 0)
			trig_pin_num++;
	gpio_id = (trig_pin_num == 1) ? 1 : sensor_info->deserial_port;
	// 4. deserial TX mfp 配置（发触发）
	maxops->mfp_cfg(deserial_if, GPIO_TX_GMSL, gpio_id, sensor_info->deserial_port);
	// 5. serial RX mfp 配置（收触发）
	max_serial_mfp_config(sensor_info->bus_num, serial_addr,
			ser_trig_mfp, GPIO_RX_GMSL, gpio_id);

	return RET_OK;
}
```

下面逐个说明流程中用到的通用层接口。

**vin_sensor_emode_parse**

- 功能：从 emode 字符串按字符解析运行时参数。
- 含义：由通用层提供（非 ar0820 提供），驱动调用它拿到 trigger mfp / gpio / serial type / mclk 等值。签名 `vin_sensor_emode_parse(sensor_info_t *, char)`。

| 字符 | 含义 |
| --- | --- |
| `T` | serial trigger mfp（如 T7 → 7） |
| `G` | sensor trigger gpio |
| `S` | serial type（MAX9295A 等） |
| `M` | mclk（25 或 27） |

- 示例（本例取 `T` 拿 serial 触发 mfp）：

```c
ser_trig_mfp = vin_sensor_emode_parse(sensor_info, 'T');
if (ser_trig_mfp < 0) {
	vin_err("sensor_mode_parse trig pin fail\n");
	return ser_trig_mfp;
}
```

**DESERIAL_MAXOPS**

- 功能：从 `deserial_info_t` 取 maxim deserial 操作集指针（`maxdes_ops_t *`）。
- 含义：宏 `#define DESERIAL_MAXOPS(di) (&(DESERIAL_OPS(di)->max))`。`maxdes_ops_t` 含 `mfp_cfg` / `link_enable` / `remote_control` / `get_pipe_info` 等 maxim 专有操作。非 maxim deserial 调用会返回 NULL，需判空。
- 示例：

```c
maxdes_ops_t *maxops = DESERIAL_MAXOPS(deserial_if);
if (maxops == NULL) {
	vin_err("maxops is NULL\n");
	return -1;
}
maxops->mfp_cfg(deserial_if, GPIO_TX_GMSL, gpio_id, sensor_info->deserial_port);
```

**TRIG_PIN**

- 功能：取 deserial 第 i 条 link 的触发 gpio pin。
- 含义：宏 `#define TRIG_PIN(d, i) (d->deserial_gpio[TRIG_GPIOARR_INDEX+(i)])`，`i` 范围 `0..DES_LINK_NUM_MAX-1`（`DES_LINK_NUM_MAX = 4`）。返回 gpio 编号，未配置时 `< 0`。驱动用它统计当前有几条 link 配了触发，以决定 `gpio_id`。
- 示例：

```c
uint32_t trig_pin_num = 0;
for (int32_t i = 0; i < DES_LINK_NUM_MAX; i++)
	if (TRIG_PIN(deserial_if, i) >= 0)
		trig_pin_num++;
```

**mfp_cfg**

- 功能：配置 deserial 的 mfp（触发链路 TX 侧）。
- 含义：`maxdes_ops_t` 的函数指针，签名 `int32_t (*mfp_cfg)(deserial_info_t *deserial_if, uint8_t mfp_mode, uint8_t gpio_id, uint8_t deserial_link)`。`mfp_mode` 选方向：`GPIO_TX_GMSL = BIT(1)` 表示 TX 往 gmsl 发触发，`GPIO_RX_GMSL = BIT(2)` 表示 RX。max96712 实现为 `max96712_mfp_cfg`。
- 示例：

```c
// deserial TX：把触发信号发往 serial
maxops->mfp_cfg(deserial_if, GPIO_TX_GMSL, gpio_id, sensor_info->deserial_port);
```

**max_serial_mfp_config**

- 功能：配置 serial（如 MAX9295A）的 gpio/mfp（触发链路 RX 侧）。
- 含义：`int32_t max_serial_mfp_config(uint32_t bus, uint8_t slave_addr, uint8_t gpio_num, uint8_t gpio_mode, uint8_t gpio_id)`。
  - `gpio_num`：要配置的 serial mfp 编号（即 `vin_sensor_emode_parse('T')` 的返回值）。
  - `gpio_mode`：bit[0] output en、bit[1] tx-to-gmsl en、bit[2] rx-from-gmsl en、bit[4] output value。本例用 `GPIO_RX_GMSL = BIT(2)`（从 serial 收触发）。
  - `gpio_id`：当 bit[1]/bit[2] 置位时需设的 gpio_id，与 deserial 侧 `gpio_id` 对应。
- 示例（start 时开启，stop 时关闭）：

```c
// serial RX：从 gmsl 收触发
max_serial_mfp_config(sensor_info->bus_num, serial_addr,
		ser_trig_mfp, GPIO_RX_GMSL, gpio_id);
// stop 时关闭 serial 触发 mfp（mode=0、gpio_id=0）
max_serial_mfp_config(sensor_info->bus_num, serial_addr,
		ser_trig_mfp, 0x00u, 0u);
```

### power_on

1. power_on 通过 GPIO 控制 sensor 上电，需结合 spec 上电时序。
2. `power_mode` 控制是否执行；`power_delay`（单位 ms）控制延时。sensor_poweron 一般在 sensor_init 中调用。

```c
static int32_t sensor_poweron(sensor_info_t *sensor_info)
{
	uint32_t gpio;
	int32_t ret = RET_OK;

	if(sensor_info->power_mode) {
		for(gpio = 0; gpio < sensor_info->gpio_num; gpio++) {
			if(sensor_info->gpio_pin[gpio] != -1) {
				ret = vin_power_ctrl((uint32_t)sensor_info->gpio_pin[gpio],
							sensor_info->gpio_level[gpio]);
				usleep(sensor_info->power_delay *1000);
				ret =  (int32_t)((uint32_t)ret | (uint32_t)vin_power_ctrl((uint32_t)sensor_info->gpio_pin[gpio],
							1-sensor_info->gpio_level[gpio]));
				if(ret < 0) {
					vin_err("vin_power_ctrl fail\n");
					return -HB_CAM_SENSOR_POWERON_FAIL;
				}
				usleep(100*1000);
			}
		}
	}
	return ret;
}
```

### power_off

power_off 调用 sensor_deinit 完成 GPIO 下电：

```c
static int32_t sensor_poweroff(sensor_info_t *sensor_info)
{
	int32_t gpio, ret = RET_OK;

	ret = sensor_deinit(sensor_info);
	if (ret < 0) {
		vin_err("%s %s deinit failed\n", sensor_info->sensor_name, __func__);
	}

	return ret;
}
```

sensor_deinit 内部按 power_mode 走 vin_power_ctrl 下电：

```c
static int32_t sensor_deinit(sensor_info_t *sensor_info)
{
	int32_t ret = RET_OK;
	uint32_t gpio;

	if(sensor_info->power_mode) {
		for(gpio = 0; gpio < sensor_info->gpio_num; gpio++) {
			if(sensor_info->gpio_pin[gpio] != -1) {
				ret = vin_power_ctrl((uint32_t)sensor_info->gpio_pin[gpio],
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

1. init 流程：sensor_poweron → max_serial_init → YUV 模组判断。
2. 本例 `extra_mode=5 (SENSING_M25F120D4G3_S0R0T7)` 为 YUV 模组，在 `max_serial_init` 之后直接 return，**不调用** sensor_mode_config_init，即不写 sensor init setting、不填 tuning data。原因：YUV sensor 端自带 ISP，板端无需初始化寄存器与 tuning。
3. sensor_init 调用时机为 hbn_camera_attach_to_vin。

```c
static int32_t sensor_init(sensor_info_t *sensor_info)
{
	int32_t ret = RET_OK;
	int32_t setting_size = 0, i;
	pthread_t t1;

	ret = sensor_poweron(sensor_info);
	if (ret < 0) {
		vin_err("%d : sensor_poweron %s fail\n", __LINE__, sensor_info->sensor_name);
		return ret;
	}

	// serial init setting,i2cmap,
	ret = max_serial_init(sensor_info);
	if (ret < 0) {
		vin_err("serial init fail!\n");
		return ret;
	}

	/* RDK-S100 SENSING_M25F120D4G3_S0R0T7 no errb mfp link.
	 * And not need vlotage setting. */
	if ((sensor_info->extra_mode & 0xff) == SENSING_M25F120D4G3_S0R0T7) {
		return ret;
	}
	return ret;
}
```

这是 YUV GMSL 与 RAW MIPI 驱动的核心差异：RAW sensor 通常需要下发 setting 里要写 init setting 数组 + 填充 linear_data tuning，YUV sensor 通常包含固件和自带isp芯片 两者都省。

### deinit

1. deinit 反初始化，走 GPIO 下电。sensor_deinit 调用时机为 hbn_camera_destroy 或 hbn_camera_detach_from_vin。

代码见 [power_off](#power_off) 段的 sensor_deinit 实现。

### start

1. start 使 sensor 出流。本例 `config_index=512 = B_TRIG_SHUTTER_SYNC`，走 TRIG 分支，由 `sensor_config_do` 调用 `sensor_config_index_trig_shutter_mode` 完成 deserial/serial mfp 配置（见 [sensor_config_index_trig_shutter_mode](#sensor_config_index_trig_shutter_mode)）。
2. YUV 模组在 mfp 配置后直接 return，**不写 stream_on 寄存器**——出流由硬件 shutter-sync 触发驱动，不靠软件写 0x0100。
3. sensor_start 调用时机为 hbn_vflow_start。

```c
static int32_t sensor_start(sensor_info_t *sensor_info)
{
	deserial_info_t *deserial_if = sensor_info->deserial_info;
	int32_t bus;

	if (deserial_if == NULL) {
		vin_err("no deserial here\n");
		return -1;
	}
	bus = deserial_if->bus_num;

	if (sensor_info->config_index & TRIG_STANDARD ||
	    sensor_info->config_index & TRIG_SHUTTER_SYNC) {
		// 本例 config_index=512 命中 TRIG_SHUTTER_SYNC，进入此分支
		ret = sensor_config_do(sensor_info, TRIG_STANDARD | TRIG_SHUTTER_SYNC,
				sensor_config_index_funcs);
		// → 只调用 sensor_config_index_trig_shutter_mode（bit9）
		// → YUV 模组：配 mfp 后 return，不写 stream_on 寄存器
	}
	return ret;
}
```

### stop

1. stop 使 sensor 关流。本例 `config_index=512 = B_TRIG_SHUTTER_SYNC`，走 TRIG 分支。
2. YUV 模组在 TRIG 分支里走特殊路径：**不写 stream_off 寄存器**（代码注释 "no stream off setting"），只调用 `max_serial_mfp_config` 关闭 serial 触发 mfp。
3. sensor_stop 调用时机为 hbn_vflow_stop。

```c
static int32_t sensor_stop(sensor_info_t *sensor_info)
{
	deserial_info_t *deserial_if = sensor_info->deserial_info;
	int32_t serial_addr = sensor_info->serial_addr;
	int32_t ser_trig_mfp;

	if (deserial_if == NULL) {
		vin_err("no deserial here\n");
		return -1;
	}

	if ((sensor_info->config_index & TRIG_SHUTTER_SYNC) ||
	    (sensor_info->config_index & TRIG_STANDARD)) {
		/* RDK-S100 SENSING_M25F120D4G3_S0R0T7 yuv sensor, no stream off setting. */
		if ((sensor_info->extra_mode & 0xff) == SENSING_M25F120D4G3_S0R0T7) {
			// 关 serial 触发 mfp（mode=0、gpio_id=0），不写 stream_off 寄存器
			ser_trig_mfp = vin_sensor_emode_parse(sensor_info, 'T');
			if (ser_trig_mfp < 0) {
				vin_err("sensor_mode_parse trig pin fail\n");
				return ser_trig_mfp;
			}
			ret = max_serial_mfp_config(sensor_info->bus_num, serial_addr,
					ser_trig_mfp, 0x00u, 0u);
			return ret;
		}
	}
	return ret;
}
```


### aexp_gain_control

YUV sensor app 配置 `isp_attr=NULL` ，图像由 sensor 端 ISP 处理，板端不做 gain 控制。故 `ar0820std` 模块**不注册** `aexp_gain_control` 接口。


### aexp_line_control

同 aexp_gain_control，YUV sensor 板端不做曝光行数控制，模块不注册 `aexp_line_control`。

### userspace_control

同上，YUV sensor 无 gain/line 开关需求，模块未注册 `userspace_control`。

### 驱动部署

1. 进入 `source/hobot-camera/drivers` 目录，执行 `make` 编译。
2. 将 `source/hobot-camera/debian/usr/hobot/lib/sensor/libar0820std.so.1.2.0` 拷贝到板端 `/usr/hobot/lib/sensor/`。

## App 配置

- 在路径 `source/hobot-spdev/src/vp_sensors/ar0820c/` 中为 ar0820std 添加配置。
- YUV 与 RAW 配置差异：
  - `sensor_type = SENSOR_TYPE_GMSL_YUV`。
  - `isp_attr` / `isp_ichn_attr` / `isp_ochn_attr` / `ynr_attr = NULL`（使用sensor 自带isp）。
  - 多 `deserial_config`（max96712 + link_desp + poc_cfg）和 `poc_config`（addr + poc_map）。
  - `calib_lname = "disable"`（YUV 无 ISP tuning）。
- 通用配置参考 [数据结构](/Advanced_development/multimedia_development/multimedia_api/hbn_api)。

### vp_sensor 配置文件：linear_1920x1080_yuv_30fps_1lane.c

- 配置文件路径：`source/hobot-spdev/src/vp_sensors/ar0820c/linear_1920x1080_yuv_30fps_1lane.c`。
- 配置结构体名：`ar0820std_linear_1920x1080_yuv_30fps_1lane`（需在 vp_sensor_config_list 中注册）。主要参数如下：

| 配置项    | 参数名                      | 取值说明                                      |
| --------- | --------------------------- | --------------------------------------------- |
| 顶层      | `config_file`               | `linear_1920x1080_yuv_30fps_1lane.c`          |
|           | `sensor_name`               | `ar0820std-1080p30`                           |
|           | `chip_id_reg` / `chip_id`   | 0 / 0x0820                                    |
|           | `sensor_i2c_addr_list`      | `{0x10}`                                      |
|           | `sensor_type`               | SENSOR_TYPE_GMSL_YUV                          |
| Camera    | `name` / `addr`             | `ar0820std` / 0x13                            |
|           | `eeprom_addr`               | 0x53                                          |
|           | `serial_addr`               | 0x43                                          |
|           | `sensor_mode`               | 0x5                                           |
|           | `extra_mode`                | 5（SENSING_M25F120D4G3_S0R0T7，YUV 模组）     |
|           | `config_index`              | 512                                          |
|           | `fps`                       | 30                                            |
|           | `width` / `height`          | 1920 / 1080                                   |
|           | `calib_lname`               | `disable`                                      |
| POC       | `addr` / `poc_map`          | 0x28 / 0x1320                                 |
| Deserial  | `name` / `addr`             | `max96712` / 0x29                             |
|           | `link_desp[0..3]`           | `ar0820std:5@512`                             |
| VIN node  | `bus_main` / `bus_second`   | 3 / 3                                         |
|           | `mipi_rx`                   | 4                                             |
|           | `vc_index`                  | 3                                             |
|           | `cim_isp_flyby`             | 0（offline）                                  |
|           | `ipi_channels`              | 1                                             |
| VIN 输出  | `ddr_en`                    | 1                                             |
|           | `wstride` / `vstride`       | 0 / 0                                         |
|           | `pack_mode`                 | 1                                             |
|           | `pingpong_ring`             | 1                                             |
| ISP       | `isp_attr` 等               | NULL                                          |

## 程序验证

1. **get_vin_data**：确认 YUV 图正常出图、帧率符合 30fps 配置。

常见问题见 [Camera Sensor FAQ](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/camera_faq)。
