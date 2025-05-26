# sample_pipeline 使用说明

## 概述
### 功能简介
`sample_pipeline` 用于实现单路或多路 sensor pipeline 串联，实现用户常见的 pipeline 场景，用户可在通过 `sample_pipeline` 子目录了解各个 pipeline 的搭建方法。

### sample_pipeline 架构说明
`sample_pipeline` 包含多个示例，每个示例均以子目录形式存在 `app/samples/platform_samples/sample_pipeline` 下，每个子目录描述如下

| 目录      | 描述 |
| ----------- | ----------- |
| [single_pipe_vin_isp_ynr_pym_vpu](#single_pipe_vin_isp_ynr_pym_vpu)  | 单路 sensor 简单 pipeline 串联并编码示例  |
| [multi_pipe_vin_isp_ynr_pym_gdc_vpu](#multi_pipe_vin_isp_ynr_pym_gdc_vpu)  | 多路 sensor pipeline 串联并编码示例  |

## single_pipe_vin_isp_ynr_pym_vpu

### 功能概述

`single_pipe_vin_isp_ynr_pym_vpu` 示例串联 `VIN`，`ISP`，`PYM`，`CODEC ` 模块，是最基础的模块串联示例之一。 Camera Sensor 图像经过 VIN、 ISP 处理后到达 PYM 模块， PYM 模块配置了六个输出通道功能分别如下：

- 0 通道输出 ISP 和 YNR 处理后的原尺寸图像，本通道的输出数据会再送给编码器编码后保存为 H264 视频码流。
- 1 通道输出 16 像素对齐、宽和高各缩小 2 倍、 NV12 格式的图像
- 2 通道输出 16 像素对齐、宽和高各缩小 4 倍、 NV12 格式的图像
- 3 通道输出 16 像素对齐、宽和高各缩小 8 倍、 NV12 格式的图像
- 4 通道输出 16 像素对齐、宽和高各缩小 16 倍、 NV12 格式的图像
- 5 通道输出 16 像素对齐、宽和高各缩小 32 倍、 NV12 格式的图像

注意： PYM 输出的最小分辨率为 32 ，如果缩放后的宽或高小于 32 ，就不会保存图像
### 代码位置及目录结构
- 代码位置 `/app/multimedia_samples/sample_pipeline/single_pipe_vin_isp_ynr_pym_vpu`
- 目录结构
```
single_pipe_vin_isp_ynr_pym_vpu
├── Makefile
└── single_pipe_vin_isp_ynr_pym_vpu.c
```

### 编译
- 进入 single_pipe_vin_isp_ynr_pym_vpu 目录，执行 `make` 编译
- 输出成果物是 single_pipe_vin_isp_ynr_pym_vpu 源码目录下的 `single_pipe_vin_isp_ynr_pym_vpu`


### 运行
#### 程序运行方法
直接执行程序 `./single_pipe_vin_isp_ynr_pym_vpu` 可以获得帮助信息

```sh
# ./single_pipe_vin_isp_ynr_pym_vpu
No sensors specified.
Usage: single_pipe_vin_isp_ynr_pym_vpu [OPTIONS]
Options:
  -s <sensor_index>      Specify sensor index
  -l <link_port>         Specify the port for connecting serdes sensors, 0:A 1:B 2:C 3:D
  -h                     Show this help message
index: 0  sensor_name: imx219-30fps             config_file:linear_1920x1080_raw10_30fps_1lane.c
index: 1  sensor_name: sc1336_gmsl-30fps        config_file:linear_1280x720_raw10_30fps_2lane.c
index: 2  sensor_name: ar0820std-30fps          config_file:linear_3840x2160_30fps_1lane.c
index: 3  sensor_name: ar0820std-1080p30        config_file:linear_1920x1080_yuv_30fps_1lane.c
```

#### 程序参数选项说明

- `-s`: 指定 Camera Sensor 型号和配置
- `-l`: 指定 Serdes 类型的 Sensor 接入的 Link Port, 比如接入的是 Port A，指定为 0: `-l 0`

#### 运行效果

`single_pipe_vin_isp_ynr_pym_vpu` 输出内容如下：
1. 每隔 60 帧保存一张每个 PYM 输出通道的 NV12 图至当前运行目录下
2. 把 PYM 通道 0 输出的图像送入编码器中编码，把编码后的文件保存到文件中。

示例 : 以 imx219 作为 sensor 输入，执行 `./single_pipe_vin_isp_ynr_pym_vpu -s 0`

日志示例如下所示：

```
# ./single_pipe_vin_isp_ynr_pym_vpu -s 0
Using index:0  sensor_name:imx219-30fps  config_file:linear_1920x1080_raw10_30fps_1lane.c
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@0 i2c bus: 1 mipi rx phy: 0
mipi rx used phy: 00000000
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@1 i2c bus: 2 mipi rx phy: 1
mipi rx used phy: 00000000
INFO: Found sensor_name:imx219-30fps on mipi rx csi 1, i2c addr 0x10, config_file:linear_1920x1080_raw10_30fps_1lane.c
        [0] use [isp + ynr].
                vin [hw:1]
                isp [hw:1] [slot_id:0] [mode:1]
                ynr [hw:1] [slot_id:0] [mode:1]
                pym [hw:1] [slot_id:0] [mode:1]
                vin ->online-> isp ->online-> ynr ->online-> pym

INFO: ISP channel info:
        input info: [mipi_rx: 1] [is_online: 1]
        isp channel info: [hw_id: 1] [slot_id: 0] [mode:1]

pym config:
        ichn input width = 1920, height = 1080
        ochn[0] ratio= 1, width = 1920, height = 1080 wstride=1920 vstride=1080 out[1920*1080]
        ochn[1] ratio= 2, width = 960, height = 540 wstride=960 vstride=540 out[960*540]
        ochn[2] ratio= 4, width = 480, height = 270 wstride=480 vstride=270 out[480*270]
        ochn[3] ratio= 8, width = 240, height = 134 wstride=240 vstride=134 out[240*134]
        ochn[4] ratio= 16, width = 120, height = 66 wstride=128 vstride=66 out[120*66]
        ochn[5] ratio= 32, width = 60, height = 32 wstride=64 vstride=32 out[60*32]

Encode idx: 0, init successful
####################### pym chn 0 #######################
=== Frame Info ===
Frame ID: 1
Timestamps: 1960130089350
tv: 1746703610.867799
trig_tv: 1746703610.867799
Frame Done: 8
Buffer Index: 0

=== Graphic Buffer ===
File Descriptors: 26 -1 -1
Plane Count: 2
Format: 8
Width: 1920
Height: 1080
Stride: 1920
Vertical Stride: 1080
Is Contiguous: 1
Share IDs: 181 0 0
Flags: 67108881
Sizes: 2073600 1036800 0
Virtual Addresses: 0xffff849f0000 0xffff84bea400 (nil)
Physical Addresses: 17296588800 17298662400 0
Offsets: 0 0 0
####################### pym chn 1 #######################
=== Frame Info ===
Frame ID: 1
Timestamps: 1960130089350
tv: 1746703610.867799
trig_tv: 1746703610.867799
Frame Done: 8
Buffer Index: 0

=== Graphic Buffer ===
File Descriptors: 27 -1 -1
Plane Count: 2
Format: 8
Width: 960
Height: 540
Stride: 960
Vertical Stride: 540
Is Contiguous: 1
Share IDs: 182 0 0
Flags: 67108881
Sizes: 518400 259200 0
Virtual Addresses: 0xffff84930000 0xffff849ae900 (nil)
Physical Addresses: 17299734528 17300252928 0
Offsets: 0 0 0
####################### pym chn 2 #######################
=== Frame Info ===
Frame ID: 1
Timestamps: 1960130089350
tv: 1746703610.867799
trig_tv: 1746703610.867799
Frame Done: 8
Buffer Index: 0

=== Graphic Buffer ===
File Descriptors: 28 -1 -1
Plane Count: 2
Format: 8
Width: 480
Height: 270
Stride: 480
Vertical Stride: 270
Is Contiguous: 1
Share IDs: 183 0 0
Flags: 67108881
Sizes: 129600 64800 0
Virtual Addresses: 0xffff84900000 0xffff8491fa40 (nil)
Physical Addresses: 17300520960 17300650560 0
Offsets: 0 0 0
####################### pym chn 3 #######################
=== Frame Info ===
Frame ID: 1
Timestamps: 1960130089350
tv: 1746703610.867799
trig_tv: 1746703610.867799
Frame Done: 8
Buffer Index: 0

=== Graphic Buffer ===
File Descriptors: 29 -1 -1
Plane Count: 2
Format: 8
Width: 240
Height: 134
Stride: 240
Vertical Stride: 134
Is Contiguous: 1
Share IDs: 184 0 0
Flags: 67108881
Sizes: 32160 16080 0
Virtual Addresses: 0xffff848f0000 0xffff848f7da0 (nil)
Physical Addresses: 17300717568 17300749728 0
Offsets: 0 0 0
####################### pym chn 4 #######################
=== Frame Info ===
Frame ID: 1
Timestamps: 1960130089350
tv: 1746703610.867799
trig_tv: 1746703610.867799
Frame Done: 8
Buffer Index: 0

=== Graphic Buffer ===
File Descriptors: 30 -1 -1
Plane Count: 2
Format: 8
Width: 120
Height: 66
Stride: 128
Vertical Stride: 66
Is Contiguous: 1
Share IDs: 185 0 0
Flags: 67108881
Sizes: 8448 4224 0
Virtual Addresses: 0xffff848e0000 0xffff848e2100 (nil)
Physical Addresses: 17300783104 17300791552 0
Offsets: 0 0 0
####################### pym chn 5 #######################
=== Frame Info ===
Frame ID: 1
Timestamps: 1960130089350
tv: 1746703610.867799
trig_tv: 1746703610.867799
Frame Done: 8
Buffer Index: 0

=== Graphic Buffer ===
File Descriptors: 31 -1 -1
Plane Count: 2
Format: 8
Width: 60
Height: 32
Stride: 64
Vertical Stride: 32
Is Contiguous: 1
Share IDs: 186 0 0
Flags: 67108881
Sizes: 2048 1024 0
Virtual Addresses: 0xffff848d0000 0xffff848d0800 (nil)
Physical Addresses: 17300848640 17300850688 0
Offsets: 0 0 0
...
```

运行时会保存如下文件：

```
single_pipe_vin_isp_ynr_pym_vpu.h264
pym_output_nv12_chn0_1920x1080_stride_1920_count_0.yuv
pym_output_nv12_chn1_960x540_stride_960_count_0.yuv
pym_output_nv12_chn2_480x270_stride_480_count_0.yuv
pym_output_nv12_chn3_240x134_stride_240_count_0.yuv
pym_output_nv12_chn4_120x66_stride_128_count_0.yuv
pym_output_nv12_chn5_60x32_stride_64_count_0.yuv
... ...
```


## multi_pipe_vin_isp_ynr_pym_gdc_vpu

### 功能概述

`multi_pipe_vin_isp_ynr_pym_gdc_vpu` 支持同时接入多路 Sensor 输入，并通过 VIN、 ISP、 PYM、 GDC、 CODEC 等多个处理模块进行视频流处理

注意：
1. `GDC` 模块依赖 bin 文件作为输入，本示例程序从目录 `/app/multimedia_samples/vp_sensors/gdc_bin` 中搜索 bin 文件，找到合适的 bin 文件才会运行 `GDC` 模块
2. `CODEC` 模块输入的宽和高最小分别为 256 和 128 ，所以当选择 PYM 的通道输出分辨率小于 `CODEC` 模块的最小宽和高时，程序会直接退出

### 代码位置及目录结构
- 代码位置 `/app/multimedia_samples/sample_pipeline/multi_pipe_vin_isp_ynr_pym_gdc_vpu`
- 目录结构
```
multi_pipe_vin_isp_ynr_pym_gdc_vpu
├── Makefile
└── multi_pipe_vin_isp_ynr_pym_gdc_vpu.c
```

### 编译
- 进入 multi_pipe_vin_isp_ynr_pym_gdc_vpu 目录，执行 `make` 编译
- 输出成果物是 multi_pipe_vin_isp_ynr_pym_gdc_vpu 源码目录下的 `multi_pipe_vin_isp_ynr_pym_gdc_vpu`


### 运行
#### 程序运行方法
直接执行程序 `./multi_pipe_vin_isp_ynr_pym_gdc_vpu` 可以获得帮助信息

```sh
# ./multi_pipe_vin_isp_ynr_pym_gdc_vpu
Usage: multi_pipe_vin_isp_ynr_pym_gdc_vpu [Options]
Options:
-c, --config="sensor=id link=port channel=pym_chn type=TYPE output=FILE, 'channel' and 'type' and 'output' is not mandatory"
                Configure parameters for each video pipeline, can be repeated up to 6 times
                sensor   --  Sensor index,can have multiple parameters, reference sensor list.
                link     --  Specify the port for connecting serdes sensors, 0:A 1:B 2:C 3:D, can be set to [0-3].
                channel  --  Pym channel index bind to encode, default 0, can be set to [0-5].
                type     --  Encode type, default is h264, can be set to [h264, h265].
                output   --  Save codec stream data to file, defaule is 'pipeline[xx]_[width]x[height]_[xxx]fps.[type]'.
-v, --verbose   Enable verbose mode
-h, --help      Show help message
Support sensor list:
index: 0  sensor_name: imx219-30fps             config_file:linear_1920x1080_raw10_30fps_1lane.c
index: 1  sensor_name: sc1336_gmsl-30fps        config_file:linear_1280x720_raw10_30fps_2lane.c
index: 2  sensor_name: ar0820std-30fps          config_file:linear_3840x2160_30fps_1lane.c
index: 3  sensor_name: ar0820std-1080p30        config_file:linear_1920x1080_yuv_30fps_1lane.c
```

#### 程序参数选项说明

- `-c, --config="sensor=id channel=vse_chn type=TYPE output=FILE"`
  - 配置每一路视频通路的参数。此选项最多可以重复多次。
  - sensor 是必须的参数， channel、 type、 output 是可选参数，用户不配置时，程序会使用默认值。
  - `sensor`：传感器索引，必须参数，可以有多个参数，参考传感器列表。
  - `link`： Serdes 类型的 Sensor 接入的 Link Port (MIPI 类型的 Sensor 忽略此参数 ), 比如接入的是 Port A，指定为 0: `-l 0`
  - `channel`： VSE 通道索引，可选参数，默认为 0 ，可以设置为 [0-5]。
  - `type`：编码类型，可选参数，默认为 h264 ，可以设置为 [h264, h265]。
  - `output`：保存编码流数据到文件，可选参数，默认为 `pipeline[xx]_[width]x[height]_[xxx]fps.[type]`。

- `-v, --verbose`
  - 启用详细模式。

- `-h, --help`
  - 显示帮助信息。

注意：
1. Serdes 类型的 Sensor 必须指定 Link Port。
2. 如果需要调整视频通路的数量，增减 `-c` 参数集合的数量即可

#### 运行效果
`multi_pipe_vin_isp_ynr_pym_gdc_vpu` 的输出：每条视频处理通道（ pipeline）都会将处理后的视频流编码为 H.264/H.265 格式并保存。

示例 :
1. 以 imx219 （ MIPI 类型） 和 sc1336 (Serdes 类型 ) 作为 sensor 输入
2. 执行命令 `./multi_pipe_vin_isp_ynr_pym_gdc_vpu -c "sensor=0" -c "sensor=1 link=0"`

日志示例如下所示：

```sh
#./multi_pipe_vin_isp_ynr_pym_gdc_vpu -c "sensor=0"  -c"sensor=1 link=0"
Using index:0  sensor_name:imx219-30fps  config_file:linear_1920x1080_raw10_30fps_1lane.c
sensor_type:0
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@0 i2c bus: 1 mipi rx phy: 0
mipi rx used phy: 00000000
mipi mclk is not configed.
Searching camera sensor on device: /proc/device-tree/soc/vcon@1 i2c bus: 2 mipi rx phy: 1
mipi rx used phy: 00000000
INFO: Found sensor_name:imx219-30fps on mipi rx csi 1, i2c addr 0x10, config_file:linear_1920x1080_raw10_30fps_1lane.c
MIPI host: 0x2
  Host 1: Used
Using index:1  sensor_name:sc1336_gmsl-30fps  config_file:linear_1280x720_raw10_30fps_2lane.c
sensor_type:1
MIPI host: 0x2
  Host 1: Used
Pipeline index 0:
        Sensor index: 0
        Sensor name: imx219-30fps
        Active mipi host: 1
        PYM Channel: 0
        Encode type: h264
Pipeline index 1:
        Sensor index: 0
        Sensor name: sc1336_gmsl-30fps
        Active mipi host: 4
        PYM Channel: 0
        Encode type: h264
Verbose: 0

Pipeline Connect Param:
        [0] use [isp + ynr].
                isp [hw:1] [slot_id:4] [mode:1]
                ynr [hw:1] [slot_id:4] [mode:1]
                pym [hw:1] [slot_id:4] [mode:1]
        [1] use [isp + ynr].
                isp [hw:1] [slot_id:5] [mode:1]
                ynr [hw:1] [slot_id:5] [mode:1]
                pym [hw:1] [slot_id:5] [mode:1]

INFO: ISP channel info:
        input info: [mipi_rx: 1] [is_online: 1]
        isp channel info: [hw_id: 1] [slot_id: 4] [mode:1]

pym config:
        ichn input width = 1920, height = 1080
        ochn[0] ratio= 1, width = 1920, height = 1080 wstride=1920 vstride=1080 out[1920*1080]
        ochn[1] ratio= 2, width = 960, height = 540 wstride=960 vstride=536 out[960*536]
        ochn[2] ratio= 4, width = 480, height = 270 wstride=480 vstride=264 out[480*264]
        ochn[3] ratio= 8, width = 240, height = 134 wstride=240 vstride=128 out[240*128]
        ochn[4] ratio= 16, width = 120, height = 66 wstride=128 vstride=64 out[120*64]
        ochn[5] ratio= 32, width = 60, height = 32 wstride=64 vstride=32 out[56*32]

        [0] use [gdc].
[0] encoder input resolution is 1920*1080, output file is pipeline0_1920x1080_30fps.h264.
Create Encode idx: 0, init successful
vc_index:0

INFO: ISP channel info:
        input info: [mipi_rx: 4] [is_online: 1]
        isp channel info: [hw_id: 1] [slot_id: 5] [mode:1]

pym config:
        ichn input width = 1280, height = 720
        ochn[0] ratio= 1, width = 1280, height = 720 wstride=1280 vstride=720 out[1280*720]
        ochn[1] ratio= 2, width = 640, height = 360 wstride=640 vstride=360 out[640*360]
        ochn[2] ratio= 4, width = 320, height = 180 wstride=320 vstride=176 out[320*176]
        ochn[3] ratio= 8, width = 160, height = 90 wstride=160 vstride=88 out[160*88]
        ochn[4] ratio= 16, width = 80, height = 44 wstride=80 vstride=40 out[80*40]
[Warnning] ochn[5] ratio= 32, height = 22 < PYM_MIN_HEIGHT(32), so not enable.

        [1] not use [gdc].
[1] encoder input resolution is 1280*720, output file is pipeline1_1280x720_30fps.h264.
Create Encode idx: 1, init successful
All deserial link info:
        [link_port:0] sc1336_gmsl:0@256
        [link_port:1] sc1336_gmsl:0@256
        [link_port:2] sc1336_gmsl:0@256
        [link_port:3] sc1336_gmsl:0@256
```

运行时会保存如下文件：

```
pipeline0_1920x1080_30fps.h264
pipeline1_1280x720_30fps.h264
```
