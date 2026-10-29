# sample_vin User Manual

## Functional Overview
`sample_vin` completes the initialization of the Camera Sensor, MIPI CSI, and SIF modules, enabling the function of acquiring video frame data from the vin module. It supports acquiring Raw or YUV format images from the VIN module.

### sample_vin Architecture Description

`sample_vin` contains multiple examples, each existing as a subdirectory under `/app/multimedia_samples/sample_vin`. Each subdirectory is described as follows:

| Directory      | Description |
| ----------- | ----------- |
| [get_vin_data](#get_vin_data)  | Example of acquiring video frames from a single sensor  |
| [get_multi_vin_data](#get_multi_vin_data)  | Example of acquiring video frames from multiple sensors  |

## get_vin_data

### Compilation

Execute the `make` command in the source code path to complete compilation:

```Shell
cd /app/multimedia_samples/sample_vin/get_vin_data
make
```

### Execution
#### Program Execution Method
Directly execute the program `./get_vin_data -h` to get help information:

#### Program Parameter Options Description

Execute the command `./get_vin_data -h` to get help information and a list of supported Camera Sensors.

```shell
root@ubuntu:/app/multimedia_samples/sample_vin/get_vin_data# ./get_vin_data -h
Usage: get_vin_data [OPTIONS]
Options:
	-s <sensor_index>      Specify sensor index
	-l <link_port>         Specify the port for connecting serdes sensors, 0:A 1:B 2:C 3:D
	-m <mipi_rx>           Specify the mipi_rx for connecting serdes sensors
	-h                     Show this help message
index: 0  sensor_name: imx219-30fps             config_file:linear_1920x1080_raw10_30fps_1lane.c
index: 1  sensor_name: sc1336_gmsl-30fps        config_file:linear_1280x720_raw10_30fps_2lane.c
index: 2  sensor_name: ar0820std-30fps          config_file:linear_3840x2160_30fps_1lane.c
index: 3  sensor_name: ar0820std-1080p30        config_file:linear_1920x1080_yuv_30fps_1lane.c
index: 4  sensor_name: ovx3cstd-30fps           config_file:linear_1920x1280_yuv_30fps_1lane.c
```

**Command Parameter Description:**

- `s <sensor_index>`: This option is used to specify the sensor index to use. The user needs to provide a valid index value.
- `l <link_port>`: This option is used to specify the connection port for the Serdes Sensor. Must be specified for Serdes sensors.
- `m <mipi_rx>`: This option is used to specify the mipi host connected to the Serdes Sensor.
- `h`: Display help information.

#### Execution Effect

Taking the imx219 sensor as an example, execute `./get_vin_data -s 0`.

Taking the ovx3cstd Serdes sensor connected to mipi host 2, link port 1 as an example, execute `./get_vin_data -s 4 -m 2 -l 1`.

:::caution Note
- Non-Serdes sensors do not need to set link and mipi
- The link value is determined by the port on the deserializer to which the serdes sensor is connected. Ensure the serdes sensor is connected to the set port.
- The mipi value is determined by the mipi host corresponding to the port on the deserializer to which the serdes sensor is connected. Refer to the [Hardware User Guide](./overview#example-usage-guide)
- Currently, only mipi hosts 0, 2, 4, and 5 are available
:::

```shell
root@ubuntu:/app/multimedia_samples/sample_vin/get_vin_data# ./get_vin_data -s 0
Using index:0  sensor_name:imx219-30fps  config_file:linear_1920x1080_raw10_30fps_1lane.c
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@0 i2c bus: 1 mipi rx phy: 0
mipi rx used phy: 00000000
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@1 i2c bus: 2 mipi rx phy: 1
mipi rx used phy: 00000000
INFO: Found sensor_name:imx219-30fps on mipi rx csi 1, i2c addr 0x10, config_file:linear_1920x1080_raw10_30fps_1lane.c

***************  Command Lists  ***************
 g      -- get single frame
 l      -- get a set frames
 q      -- quit
 h      -- print help message

Command: g
Dumping RAW data: handle 34661, resolution: 1920x1080 (stride: 2400), size: 2592000, frame id: 0, timestamp: 0
Dump image to file(handle_34661_chn0_1920x1080_stride_2400_frameid_0_ts_0.raw), size(2592000) succeeded
```

- g: Get a single frame. Supports entering multiple 'g's to continuously acquire images, e.g., enter `gggg`

```shell
Command: g
Dumping RAW data: handle 34661, resolution: 1920x1080 (stride: 2400), size: 2592000, frame id: 138, timestamp: 1012736827400
Dump image to file(handle_34661_chn0_1920x1080_stride_2400_frameid_138_ts_1012736827400.raw), size(2592000) succeeded
```

- l: Continuously acquire 12 frames, equivalent to entering 12 'g's

```shell
Command: l
Dumping RAW data: handle 34661, resolution: 1920x1080 (stride: 2400), size: 2592000, frame id: 138, timestamp: 1012736827400
Dump image to file(handle_34661_chn0_1920x1080_stride_2400_frameid_138_ts_1012736827400.raw), size(2592000) succeeded
Dumping RAW data: handle 34661, resolution: 1920x1080 (stride: 2400), size: 2592000, frame id: 139, timestamp: 1012769731350
Dump image to file(handle_34661_chn0_1920x1080_stride_2400_frameid_139_ts_1012769731350.raw), size(2592000) succeeded
... (omitted, total 12 frames dumped) ...
Dumping RAW data: handle 34661, resolution: 1920x1080 (stride: 2400), size: 2592000, frame id: 995, timestamp: 1040941500225
Dump image to file(handle_34661_chn0_1920x1080_stride_2400_frameid_995_ts_1040941500225.raw), size(2592000) succeeded
```

- q: Exit the program

```shell
Command: q
quit
```

After executing the program, you will get raw images named in the format like `handle_34661_chn0_1920x1080_stride_2400_frameid_995_ts_1040941500225.raw`.

## get_multi_vin_data

### Compilation

Execute the `make` command in the source code path to complete compilation:

```Shell
cd /app/multimedia_samples/sample_vin/get_multi_vin_data
make
```

### Execution
#### Program Execution Method
Directly execute the program `./get_multi_vin_data -h` to get help information:

#### Program Parameter Options Description

Execute the command `./get_multi_vin_data -h` to get help information and a list of supported Camera Sensors.

```shell
root@ubuntu:/app/multimedia_samples/sample_vin/get_multi_vin_data# ./get_multi_vin_data -h
Usage: get_multi_vin_data [Options]
Options:
-c, --config="sensor=id"
	Configure parameters for each video pipeline, can be repeated up to 6 times.
	sensor   --  Sensor index, can have multiple parameters, reference sensor list.
	mode     --  Sensor mode of camera_config_t
	link     --  Sensor link port number, serdes sensor must be configured according to the hardware connection, can be set to [0-3] 0:A 1:B 2:C 3:D.
	mipi     --  Specify the mipi_rx for connecting serdes sensors
-h, --help      Show help message
Support sensor list:
index: 0  sensor_name: imx219-30fps             config_file:linear_1920x1080_raw10_30fps_1lane.c
index: 1  sensor_name: sc1336_gmsl-30fps        config_file:linear_1280x720_raw10_30fps_2lane.c
index: 2  sensor_name: ar0820std-30fps          config_file:linear_3840x2160_30fps_1lane.c
index: 3  sensor_name: ar0820std-1080p30        config_file:linear_1920x1080_yuv_30fps_1lane.c
index: 4  sensor_name: ovx3cstd-30fps           config_file:linear_1920x1280_yuv_30fps_1lane.c
```

**Command Parameter Description:**

- `c <sensor>`: This option is used to specify the sensor index to use. The user needs to provide a valid index value.
- `l <link_port>`: This option is used to specify the connection port for the Serdes Sensor. Must be specified for Serdes sensors.
- `m <mipi_rx>`: This option is used to specify the mipi host connected to the Serdes Sensor.
- `h`: Display help information.

#### Execution Effect

Taking the imx219 sensor and the ovx3cstd Serdes sensor connected to mipi host 2, link port 1 as an example, execute `./get_multi_vin_data -c "sensor=0" -c "sensor=4 mipi=2 link=1"`.

:::caution Note
- Non-Serdes sensors do not need to set link and mipi
- The link value is determined by the port on the deserializer to which the serdes sensor is connected. Ensure the serdes sensor is connected to the set port.
- The mipi value is determined by the mipi host corresponding to the port on the deserializer to which the serdes sensor is connected. Refer to the [Hardware User Guide](./overview#example-usage-guide)
- Currently, only mipi hosts 0, 2, 4, and 5 are available
:::

```shell
Using index:0  sensor_name:imx219-30fps  config_file:linear_1920x1080_raw10_30fps_1lane.c
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@0 i2c bus: 1 mipi rx phy: 0
mipi rx used phy: 00000000
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@1 i2c bus: 2 mipi rx phy: 1
mipi rx used phy: 00000000
INFO: Found sensor_name:imx219-30fps on mipi rx csi 1, i2c addr 0x10, config_file:linear_1920x1080_raw10_30fps_1lane.c
Using index:2  sensor_name:ar0820std-30fps  config_file:linear_3840x2160_30fps_1lane.c
Pipeline index 0:
	Sensor index: 0
	Sensor name: imx219-30fps
	Active mipi host: 1
Pipeline index 1:
	Sensor index: 0
	Sensor name: ar0820std-30fps
	Active mipi host: 4
Verbose: 1
vc_index:1
All deserial link info:
	[link_port:0] sc1336_gmsl:0@256
	[link_port:1] ar0820std:5@512
	[link_port:2] sc1336_gmsl:0@256
	[link_port:3] sc1336_gmsl:0@256
deserial_config:29_max96712, des_handle:148274
Dumping RAW data: handle 34661, resolution: 1920x1080 (stride: 2400), size: 2592000, frame id: 1, timestamp: 1317321489925
Dump image to file(handle_34661_chn-1_1920x1080_stride_2400_frameid_1_ts_1317321489925.raw), size(2592000) succeeded
Dumping YUV data: handle 100197, resolution: 3840x2160 (stride: 3840), size: 8294400 + 4147200, frame id: 1, timestamp: 1317379256975
Dump successful: handle_100197_chn1_3840x2160_stride_3840_frameid_1_ts_1317379256975.yuv (size: 256)
```

After executing the program, you will get the RAW image for imx219 named in the format `handle_34661_chn-1_1920x1080_stride_2400_frameid_1_ts_1317321489925.raw` and the YUV image for ar0820std named in the format `handle_100197_chn1_3840x2160_stride_3840_frameid_1_ts_1317379256975.yuv`.