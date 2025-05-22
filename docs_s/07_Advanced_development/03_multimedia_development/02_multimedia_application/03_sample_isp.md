# sample_isp 使用说明

## get_isp_data

### 功能概述

`get_isp_data` 完成 Camera Sensor 、 MIPI CSI 、 CIM 和 ISP 模块的初始化，实现从 ISP 模块获取视频帧数据的功能，支持从 ISP 模块获取 YUV 格式的图像。

#### 代码位置及目录结构

`get_isp_data` 相关源码路径为 `/app/multimedia_samples/sample_isp/get_isp_data`，代码结构如下：

```shell
── get_isp_data
   ├── get_isp_data.c
   └── Makefile
```

- Makefile：用于编译程序的 Makefile 文件。
- get_isp_data.c：程序的主要源代码文件。


### 编译

在源码路径下执行 `make` 命令即可完成编译：

```Shell
cd /app/multimedia_samples/sample_isp/get_isp_data
make
```

### 运行
#### 程序运行方法
直接执行程序 `./get_isp_data -h` 可以获得帮助信息：

#### 程序参数选项说明


执行命令 `./get_isp_data -h` 可以获得帮助信息和支持的 Camera Sensor 列表。

```shell
root@ubuntu:/app/multimedia_samples/sample_isp/get_isp_data# ./get_isp_data -h
Usage: get_isp_data [OPTIONS]
Options:
  -s <sensor_index>      Specify sensor index
  -o <online>            Specify the connection method from VIN to ISP, 1: online 0: offline
  -l <link_port>         Specify the port for connecting serdes sensors, 0:A 1:B 2:C 3:D
  -h                     Show this help message
index: 0  sensor_name: imx219-30fps             config_file:linear_1920x1080_raw10_30fps_1lane.c
index: 1  sensor_name: sc1336_gmsl-30fps        config_file:linear_1280x720_raw10_30fps_2lane.c
index: 2  sensor_name: ar0820std-30fps          config_file:linear_3840x2160_30fps_1lane.c
index: 3  sensor_name: ar0820std-1080p30        config_file:linear_1920x1080_yuv_30fps_1lane.c
```

**命令参数说明：**

- `s <sensor_index>`: 该选项用于指定要使用的传感器索引。用户需要提供一个有效的索引值。
- `o <online>`: 该选项用于指定 VIN 到 ISP 的连接方式， 1: online 0: offline, 可选参数，默认是 offline 模式。
- `l <link_port>`: 该选项用于指定 Serdes Sensor 的连接的端口 , Serdes sensor 必须指定。
- `h`: 显示帮助信息。

#### 运行效果

以 imx219 sensor 为例，执行 `./get_isp_data -s 0` 。

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


- g： 获取一帧图像，支持输入多个 g 来连续获取图像，例如输入 gggg ​

```shell
Command: g
handle 100197 isp dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 0, timestamp: 197145649052
```

- l： 连续获取 12 帧图像，相当于输入 12 个 g ​

```shell
Command: l
handle 100197 isp dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 1, timestamp: 197178981635
handle 100197 isp dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 355, timestamp: 208978985224
... ( 省略，总共 Dump 12 帧 ) ...
handle 100197 isp dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 394, timestamp: 210278982766
handle 100197 isp dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 395, timestamp: 210312316183
```

- q: 退出程序​

```shell
Command: q
quit
```

执行程序后会获取到如 `handle_100197_isp_chn0_1920x1080_stride_1920_frameid_27_ts_20832399744000.yuv` 命名格式的 YUV 图像。

