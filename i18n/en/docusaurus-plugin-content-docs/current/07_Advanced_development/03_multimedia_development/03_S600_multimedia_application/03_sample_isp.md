# sample_isp User Guide

## Functional Overview

`sample_isp` initializes the Camera Sensor, MIPI CSI, CIM, and ISP modules, enabling the retrieval of video frame data from the ISP module. It supports obtaining YUV format images from the ISP module.

### sample_isp Architecture Description

`sample_isp` contains multiple examples, each existing as a subdirectory under `/app/multimedia_samples/sample_isp`. Each subdirectory is described as follows:

| Directory      | Description |
| ----------- | ----------- |
| [get_isp_data](#get_isp_data)  | Single-sensor YUV video frame acquisition example  |
| [isp_feedback](#isp_feedback)  | ISP frame feedback example  |

## get_isp_data

#### Code Location and Directory Structure

The source code path for `get_isp_data` is `/app/multimedia_samples/sample_isp/get_isp_data`, with the following code structure:

```shell
── get_isp_data
   ├── get_isp_data.c
   └── Makefile
```

- Makefile: Makefile file used to compile the program.
- get_isp_data.c: Main source code file of the program.

### Compilation

Execute the `make` command in the source code path to complete the compilation:

```Shell
cd /app/multimedia_samples/sample_isp/get_isp_data
make
```

### Running
#### Program Execution Method
Execute the program directly `./get_isp_data -h` to get help information.

#### Program Parameter Options Description

Execute the command `./get_isp_data -h` to get help information and a list of supported Camera Sensors.

```shell
root@ubuntu:/app/multimedia_samples/sample_isp/get_isp_data# ./get_isp_data -h
Usage: get_isp_data [OPTIONS]
Options:
  -s <sensor_index>      Specify sensor index
  -o <online>            Specify the connection method from VIN to ISP, 1: online 0: offline
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
- `o <online>`: This option is used to specify the connection method from VIN to ISP, 1: online 0: offline, optional parameter, default is offline mode.
- `l <link_port>`: This option is used to specify the connection port for the Serdes Sensor. Must be specified for Serdes sensors.
- `m <mipi_rx>`: This option is used to specify the mipi host connected to the Serdes Sensor.
- `h`: Display help information.

#### Running Effect

Take the imx219 sensor as an example, execute `./get_isp_data -s 0`.

For an ovx3cstd Serdes sensor connected to mipi host 2, link port 1, execute `./get_isp_data -s 4 -m 2 -l 1`.

:::caution Note
- Non-Serdes sensors do not need to set link and mipi.
- The link value is determined by the port on the deserializer to which the serdes sensor is connected. Ensure the serdes sensor is connected to the specified port.
- The mipi value is determined by the mipi host corresponding to the port on the deserializer to which the serdes sensor is connected. Refer to the [Hardware User Guide](./overview#example-usage-guide).
- Currently, only mipi host 0, 2, 4, 5 can be used.
:::

```shell
root@ubuntu:/app/multimedia_samples/sample_isp/get_isp_data# ./get_isp_data -s 0
Using index:0  sensor_name:imx219-30fps  config_file:linear_1920x1080_raw10_30fps_1lane.c
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@0 i2c bus: 1 mipi rx phy: 0
mipi rx used phy: 00000000
INFO: Found sensor_name:imx219-30fps on mipi rx csi 0, i2c addr 0x10, config_file:linear_1920x1080_raw10_30fps_1lane.c

INFO: ISP channel info:
        input info: [mipi_rx: 0] [is_online: 0]
        isp channel info: [hw_id: 0] [slot_id: 4]

***************  Command Lists  ***************
 g      -- get single frame
 l      -- get a set frames
 q      -- quit
 h      -- print help message

Command: g
handle 100197 isp dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 27, timestamp: 20832399744000

Command: q
quit
```

- g: Get a single frame image. Supports entering multiple g's to get images continuously, e.g., enter `gggg`.

```shell
Command: g
handle 100197 isp dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 0, timestamp: 197145649052
```

- l: Continuously get 12 frames of images, equivalent to entering 12 g's.

```shell
Command: l
handle 100197 isp dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 1, timestamp: 197178981635
handle 100197 isp dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 355, timestamp: 208978985224
... ( omitted, total 12 frames dumped ) ...
handle 100197 isp dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 394, timestamp: 210278982766
handle 100197 isp dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 395, timestamp: 210312316183
```

- q: Exit the program.

```shell
Command: q
quit
```

After executing the program, you will obtain a YUV image named with the format `handle_100197_isp_chn0_1920x1080_stride_1920_frameid_27_ts_20832399744000.yuv`.

## isp_feedback

#### Code Location and Directory Structure

The source code path for `isp_feedback` is `/app/multimedia_samples/sample_isp/isp_feedback`, with the following code structure:

```shell
── isp_feedback
   ├── isp_feedback.c
   └── Makefile
```

- Makefile: Makefile file used to compile the program.
- isp_feedback.c: Main source code file of the program.

### Compilation

Execute the `make` command in the source code path to complete the compilation:

```Shell
cd /app/multimedia_samples/sample_isp/isp_feedback
make
```

### Running
#### Program Execution Method
Execute the program directly `./isp_feedback -h` to get help information.

#### Program Parameter Options Description

Execute the command `./isp_feedback -h` to get help information.

```shell
root@ubuntu:/app/multimedia_samples/sample_isp/isp_feedback# ./isp_feedback -h
Usage: isp_feedback [OPTIONS]
Options:
  -f <file>              Specify Raw filename
  -F <format>            Specify Raw format eg: raw8 raw10 raw12
  -W <width>             Specify Raw width
  -H <height>            Specify Raw height
  -l <loop>              Specify feedback Raw loop
  -h                     Show this help message
```

**Command Parameter Description:**

- `f <file>`: This option is used to specify the Raw image filename to use.
- `F <format>`: This option is used to specify the format of the Raw image to use: raw8, raw10, raw12.
- `W <width>`: This option is used to specify the width of the Raw image to use.
- `H <height>`: This option is used to specify the height of the Raw image to use.
- `l <loop>`: This option is used to specify the number of feedback loops for the Raw image. Default is 10 times.
- `h`: Display help information.

#### Running Effect

- First, use `get_vin_data -s 0` to obtain a raw image of imx219. For detailed usage of `get_vin_data`, refer to [sample_vin](sample_vin.html).
- Next, we can specify parameters such as format, width, height, etc., for the prepared RAW image for feedback. During ISP feedback, the corresponding dummy Sensor's ISP effect library will be used for tuning.

<div class="note">
<strong>Note:</strong> <br />
When using a dummy Sensor for feedback, no actual hardware device connection is required. The program will feed the raw image into the ISP and use the corresponding ISP effect library for tuning.<br />
The configuration parameter path for the dummy Sensor is: /app/multimedia_samples/vp_sensors/dummy_sensor/dummy_sensor.c<br />
When using the dummy sensor for image debugging or ISP feedback, correctly configure the bayer_start and bayer_pattern fields in sensor_param based on the actual captured raw image. Incorrect configuration may result in inverted colors or color anomalies in the image.<br />
</div>

Take the imx219 sensor as an example, execute `./isp_feedback -f handle_34661_chn0_1920x1080_stride_2400_frameid_1_ts_5752227762025.raw -F raw10 -H 1080 -W 1920`.

```shell
root@ubuntu:/app/multimedia_samples/sample_isp/isp_feedback# ./isp_feedback  -f handle_34661_chn0_1920x1080_stride_2400_frameid_1_ts_5752227762025.raw -F raw10 -H 1080 -W 1920
Using index:5  sensor_name:dummy  config_file:dummy_sensor.c
Creating camera with config: width=1920, height=1080, format=10
[INFO] Create isp node handle: 100197
isp process one frame cost:  2187075 ns
isp(100197) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 0, timestamp: 0
isp process one frame cost:  2128900 ns
isp(100197) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 0, timestamp: 0
isp process one frame cost:  2115925 ns
isp(100197) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 0, timestamp: 0
isp process one frame cost:  2112825 ns
isp(100197) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 0, timestamp: 0
isp process one frame cost:  2112700 ns
isp(100197) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 0, timestamp: 0
isp process one frame cost:  2115200 ns
isp(100197) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 0, timestamp: 0
isp process one frame cost:  2116475 ns
isp(100197) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 0, timestamp: 0
isp process one frame cost:  2112700 ns
isp(100197) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 0, timestamp: 0
isp process one frame cost:  2112775 ns
isp(100197) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 0, timestamp: 0
isp process one frame cost:  2114200 ns
isp(100197) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 0, timestamp: 0
```

When the program runs, it will save the tuned YUV images in the current directory. By default, it will loop 10 times and calculate the time cost for each feedback loop:

- Using index / sensor_name / config_file: Indicates the current use of sensor index 5, sensor name dummy, and the corresponding sensor configuration file dummy_sensor.c.
- For each frame of RAW data processed, the following ISP processing completion time information is output: `isp process one frame cost: 2170275 ns`.

### isp_feedback Common Issues

- If the resolution or format parameters of the specified image do not match the actual feedback image, it may cause image anomalies.