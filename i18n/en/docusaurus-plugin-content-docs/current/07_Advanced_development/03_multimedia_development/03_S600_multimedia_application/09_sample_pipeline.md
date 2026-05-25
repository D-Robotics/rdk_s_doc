# sample_pipeline User Guide

## Feature Overview
The `sample_pipeline` is used to implement single-channel or multi-channel sensor pipeline chaining, enabling common pipeline scenarios for users. Users can learn how to set up various pipelines by exploring the `sample_pipeline` subdirectories.

### sample_pipeline Architecture Description
The `sample_pipeline` contains multiple examples, each existing as a subdirectory under `app/multimedia_samples/sample_pipeline`. Each subdirectory is described as follows:

| Directory      | Description |
| ----------- | ----------- |
| [single_pipe_vin_isp_ynr_pym_vpu](#single_pipe_vin_isp_ynr_pym_vpu)  | Single-channel sensor simple pipeline chaining and encoding example  |
| [single_pipe_vin_isp_ynr_pym_gdc](#single_pipe_vin_isp_ynr_pym_gdc)  | Single-channel sensor pipeline chaining with GDC transformation example  |
| [single_pipe_vin_isp_ynr_pym_gdc_vpu](#single_pipe_vin_isp_ynr_pym_gdc_vpu)  | Single-channel sensor pipeline chaining with GDC transformation and encoding example  |
| [multi_pipe_vin_isp_ynr_pym_gdc_vpu](#multi_pipe_vin_isp_ynr_pym_gdc_vpu)  | Multi-channel sensor pipeline chaining and encoding example  |
| [uvc_capture_sample](#uvc_capture_sample)  |  uvc camera capture example  |

## single_pipe_vin_isp_ynr_pym_vpu

### Feature Overview

The `single_pipe_vin_isp_ynr_pym_vpu` example chains the `VIN`, `ISP`, `PYM`, and `CODEC` modules, making it one of the most basic module chaining examples. The Camera Sensor image passes through VIN, ISP, and then reaches the PYM module. The PYM module is configured with six output channels, each functioning as follows:

- Channel 0 outputs the original-sized image processed by ISP and YNR. The output data from this channel is sent to the encoder, encoded, and saved as an H264 video stream.
- Channel 1 outputs an image with 16-pixel alignment, width and height reduced by a factor of 2, in NV12 format.
- Channel 2 outputs an image with 16-pixel alignment, width and height reduced by a factor of 4, in NV12 format.
- Channel 3 outputs an image with 16-pixel alignment, width and height reduced by a factor of 8, in NV12 format.
- Channel 4 outputs an image with 16-pixel alignment, width and height reduced by a factor of 16, in NV12 format.
- Channel 5 outputs an image with 16-pixel alignment, width and height reduced by a factor of 32, in NV12 format.

Note: The minimum resolution output by PYM is 32. If the scaled width or height is less than 32, the image will not be saved.
### Code Location and Directory Structure
- Code location `/app/multimedia_samples/sample_pipeline/single_pipe_vin_isp_ynr_pym_vpu`
- Directory structure
```
single_pipe_vin_isp_ynr_pym_vpu
├── Makefile
└── single_pipe_vin_isp_ynr_pym_vpu.c
```

### Compilation
- Navigate to the single_pipe_vin_isp_ynr_pym_vpu directory and run `make` to compile.
- The output artifact is `single_pipe_vin_isp_ynr_pym_vpu` in the source code directory of single_pipe_vin_isp_ynr_pym_vpu.

### Execution
#### Program Execution Method
Run the program directly `./single_pipe_vin_isp_ynr_pym_vpu` to get help information.

```sh
# ./single_pipe_vin_isp_ynr_pym_vpu
No sensors specified.
Usage: single_pipe_vin_isp_ynr_pym_vpu [OPTIONS]
Options:
  -s <sensor_index>      Specify sensor index
  -m <mipi_rx>           Specify the mipi_rx for connecting serdes sensors
  -l <link_port>         Specify the port for connecting serdes sensors, 0:A 1:B 2:C 3:D
  -h                     Show this help message
index: 0  sensor_name: imx219-30fps             config_file:linear_1920x1080_raw10_30fps_1lane.c
index: 1  sensor_name: sc1336_gmsl-30fps        config_file:linear_1280x720_raw10_30fps_2lane.c
index: 2  sensor_name: ar0820std-30fps          config_file:linear_3840x2160_30fps_1lane.c
index: 3  sensor_name: ar0820std-1080p30        config_file:linear_1920x1080_yuv_30fps_1lane.c
index: 4  sensor_name: ovx3cstd-30fps           config_file:linear_1920x1280_yuv_30fps_1lane.c
```

#### Program Parameter Options Description

- `-s`: Specify the Camera Sensor model and configuration.
- `-m`: Specify the mipi host connected to the Serdes Sensor.
- `-l`: Specify the Link Port for the Serdes type Sensor, e.g., if connected to Port A, specify as 0: `-l 0`.

:::caution Note
- Non-Serdes sensors do not need to set link and mipi.
- The link value is determined by the port on the deserializer to which the serdes sensor is connected. Ensure the serdes sensor is connected to the specified port.
- The mipi value is determined by the mipi host corresponding to the port on the deserializer to which the serdes sensor is connected. Refer to the [Hardware User Guide](./overview#example-usage-guide).
- Currently, only mipi hosts 0, 2, 4, and 5 can be used.
:::

#### Execution Effect

The output of `single_pipe_vin_isp_ynr_pym_vpu` includes:
1. Every 60 frames, an NV12 image of each PYM output channel is saved in the current runtime directory.
2. The image output from PYM channel 0 is sent to the encoder for encoding, and the encoded file is saved to a file.

Example: With imx219 as the sensor input, run `./single_pipe_vin_isp_ynr_pym_vpu -s 0`.

Example: With an ovx3cstd Serdes sensor connected to mipi host 2 and link port 1 as input, run `./single_pipe_vin_isp_ynr_pym_vpu -s 4 -m 2 -l 1`.

Sample log output is as follows:

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

The following files will be saved during execution:

```bash
single_pipe_vin_isp_ynr_pym_vpu.h264
pym_output_nv12_chn0_1920x1080_stride_1920_count_0.yuv
pym_output_nv12_chn1_960x540_stride_960_count_0.yuv
pym_output_nv12_chn2_480x270_stride_480_count_0.yuv
pym_output_nv12_chn3_240x134_stride_240_count_0.yuv
pym_output_nv12_chn4_120x66_stride_128_count_0.yuv
pym_output_nv12_chn5_60x32_stride_64_count_0.yuv
... ...
```
## single_pipe_vin_isp_ynr_pym_gdc

### Feature Overview

The `single_pipe_vin_isp_ynr_pym_gdc` example chains the `VIN`, `ISP`, `PYM`, and `GDC` modules, making it one of the most basic module chaining examples. The Camera Sensor image passes through VIN, ISP, and PYM modules before reaching the GDC module. The GDC performs transformations based on the GDC bin file and generates YUV images.

### Code Location and Directory Structure
- Code location `/app/multimedia_samples/sample_pipeline/single_pipe_vin_isp_ynr_pym_gdc`
- Directory structure
```
single_pipe_vin_isp_ynr_pym_gdc
├── Makefile
└── single_pipe_vin_isp_ynr_pym_gdc.c
```

### Compilation
- Navigate to the single_pipe_vin_isp_ynr_pym_gdc directory and run `make` to compile.
- The output artifact is `single_pipe_vin_isp_ynr_pym_gdc` in the source code directory of single_pipe_vin_isp_ynr_pym_gdc.

### Execution
#### Program Execution Method
Run the program directly `./single_pipe_vin_isp_ynr_pym_gdc` to get help information.

```sh
# ./single_pipe_vin_isp_ynr_pym_gdc
No sensors specified.
Usage: single_pipe_vin_isp_pym_vpu [OPTIONS]
Options:
  -s <sensor_index>      Specify sensor index
  -m <mipi_rx>           Specify the mipi_rx for connecting serdes sensors
  -l <link_port>         Specify the port for connecting serdes sensors, 0:A 1:B 2:C 3:D
  -f <gdc_bin_file>      Specify sensor gdc_bin_file path
  -h                     Show this help message
index: 0  sensor_name: imx219-30fps             config_file:linear_1920x1080_raw10_30fps_1lane.c
index: 1  sensor_name: sc1336_gmsl-30fps        config_file:linear_1280x720_raw10_30fps_2lane.c
index: 2  sensor_name: ar0820std-30fps          config_file:linear_3840x2160_30fps_1lane.c
index: 3  sensor_name: ar0820std-1080p30        config_file:linear_1920x1080_yuv_30fps_1lane.c
index: 4  sensor_name: ovx3cstd-30fps           config_file:linear_1920x1280_yuv_30fps_1lane.c
```

#### Program Parameter Options Description

- `-s`: Specify the Camera Sensor model and configuration.
- `-m`: This option is used to specify the mipi host connected to the Serdes Sensor.
- `-l`: Specify the Link Port for the Serdes type Sensor, e.g., if connected to Port A, specify as 0: `-l 0`.

:::caution Note
- Non-Serdes sensors do not need to set link and mipi.
- The link value is determined by the port on the deserializer to which the serdes sensor is connected. Ensure the serdes sensor is connected to the specified port.
- The mipi value is determined by the mipi host corresponding to the port on the deserializer to which the serdes sensor is connected. Refer to the [Hardware User Guide](./overview#example-usage-guide).
- Currently, only mipi hosts 0, 2, 4, and 5 can be used.
:::

#### Execution Effect

The output of `single_pipe_vin_isp_ynr_pym_gdc` includes:
1. Every 30 frames, an NV12 image of each GDC output channel is saved in the current runtime directory.

Example: With imx219 as the sensor input, run `./single_pipe_vin_isp_ynr_pym_gdc -s 0 -f ../../vp_sensors/gdc_bin/imx219_gdc.bin`.

Example: With an ovx3cstd Serdes sensor connected to mipi host 2 and link port 1 as input, run `./single_pipe_vin_isp_ynr_pym_gdc -s 4 -m 2 -l 1 -f ../../vp_sensors/gdc_bin/ovx3cstd.bin`.

Sample log output is as follows:

```
# ./single_pipe_vin_isp_ynr_pym_gdc -s 0 -f ../../vp_sensors/gdc_bin/imx219_gdc.bin
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

gdc(296805) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 1, timestamp: 21677343453900
gdc(296805) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 31, timestamp: 21678330776125
gdc(296805) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 61, timestamp: 21679318103925
gdc(296805) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 91, timestamp: 21680305428000
gdc(296805) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 121, timestamp: 21681292757750
```

The following files will be saved during execution:

```bash
gdc_handle_296805_chn0_1920x1080_stride_1920_frameid_121_ts_21681292757750.yuv
gdc_handle_296805_chn0_1920x1080_stride_1920_frameid_1_ts_21677343453900.yuv
gdc_handle_296805_chn0_1920x1080_stride_1920_frameid_31_ts_21678330776125.yuv
gdc_handle_296805_chn0_1920x1080_stride_1920_frameid_61_ts_21679318103925.yuv
gdc_handle_296805_chn0_1920x1080_stride_1920_frameid_91_ts_21680305428000.yuv
... ...
```

## single_pipe_vin_isp_ynr_pym_gdc_vpu

### Feature Overview

The `single_pipe_vin_isp_ynr_pym_gdc_vpu` example chains the `VIN`, `ISP`, `YNR`, `PYM`, `GDC`, and `CODEC` modules, making it one of the most basic module chaining examples. The Camera Sensor image passes through VIN, ISP, YNR, and PYM modules before reaching the GDC module. The GDC performs transformations based on the GDC bin file, generates YUV images, and the output data is sent to the encoder, encoded, and saved as an H264 video stream.

### Code Location and Directory Structure
- Code location `/app/multimedia_samples/sample_pipeline/single_pipe_vin_isp_ynr_pym_gdc_vpu`
- Directory structure
```
single_pipe_vin_isp_ynr_pym_gdc_vpu
├── Makefile
└── single_pipe_vin_isp_ynr_pym_gdc_vpu.c
```

### Compilation
- Navigate to the single_pipe_vin_isp_ynr_pym_gdc_vpu directory and run `make` to compile.
- The output artifact is `single_pipe_vin_isp_ynr_pym_gdc_vpu` in the source code directory of single_pipe_vin_isp_ynr_pym_gdc_vpu.

### Execution
#### Program Execution Method
Run the program directly `./single_pipe_vin_isp_ynr_pym_gdc_vpu` to get help information.

```sh
# ./single_pipe_vin_isp_ynr_pym_gdc_vpu
No sensors specified.
Usage: single_pipe_vin_isp_pym_vpu [OPTIONS]
Options:
  -s <sensor_index>      Specify sensor index
  -l <link_port>         Specify the port for connecting serdes sensors, 0:A 1:B 2:C 3:D
  -m <mipi_rx>           Specify the mipi_rx for connecting serdes sensors
  -f <gdc_bin_file>      Specify sensor gdc_bin_file path
  -h                     Show this help message
index: 0  sensor_name: imx219-30fps             config_file:linear_1920x1080_raw10_30fps_1lane.c
index: 1  sensor_name: sc1336_gmsl-30fps        config_file:linear_1280x720_raw10_30fps_2lane.c
index: 2  sensor_name: ar0820std-30fps          config_file:linear_3840x2160_30fps_1lane.c
index: 3  sensor_name: ar0820std-1080p30        config_file:linear_1920x1080_yuv_30fps_1lane.c
index: 4  sensor_name: ovx3cstd-30fps           config_file:linear_1920x1280_yuv_30fps_1lane.c
```

#### Program Parameter Options Description

- `-s`: Specify the Camera Sensor model and configuration.
- `-m`: Specify the mipi host connected to the Serdes Sensor.
- `-l`: Specify the Link Port for the Serdes type Sensor, e.g., if connected to Port A, specify as 0: `-l 0`.

:::caution Note
- Non-Serdes sensors do not need to set link and mipi.
- The link value is determined by the port on the deserializer to which the serdes sensor is connected. Ensure the serdes sensor is connected to the specified port.
- The mipi value is determined by the mipi host corresponding to the port on the deserializer to which the serdes sensor is connected. Refer to the [Hardware User Guide](./overview#example-usage-guide).
- Currently, only mipi hosts 0, 2, 4, and 5 can be used.
:::

#### Execution Effect

The output of `single_pipe_vin_isp_ynr_pym_gdc_vpu` includes:
1. Every 30 frames, an NV12 image of each GDC output channel is saved in the current runtime directory.
2. The image output from the GDC channel is sent to the encoder for encoding, and the encoded file is saved to a file.

Example: With imx219 as the sensor input, run `./single_pipe_vin_isp_ynr_pym_gdc_vpu -s 0 -f ../../vp_sensors/gdc_bin/imx219_gdc.bin`.

Example: With an ovx3cstd Serdes sensor connected to mipi host 2 and link port 1 as input, run `./single_pipe_vin_isp_ynr_pym_gdc_vpu -s 4 -m 2 -l 1 -f ../../vp_sensors/gdc_bin/ovx3cstd.bin`.

Sample log output is as follows:

```bash
# ./single_pipe_vin_isp_ynr_pym_gdc_vpu -s 0 -f ../../vp_sensors/gdc_bin/imx219_gdc.bin
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
gdc(296805) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 1, timestamp: 21970340530375
gdc(296805) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 31, timestamp: 21971327856500
gdc(296805) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 61, timestamp: 21972315184900
gdc(296805) dump yuv 1920x1080(stride:1920), buffer size: 2073600 + 1036800 frame id: 91, timestamp: 21973302504675
```

The following files will be saved during execution:

```bash
single_pipe_vin_isp_ynr_pym_gdc_vpu.h264
gdc_handle_296805_chn0_1920x1080_stride_1920_frameid_1_ts_21970340530375.yuv
gdc_handle_296805_chn0_1920x1080_stride_1920_frameid_31_ts_21971327856500.yuv
gdc_handle_296805_chn0_1920x1080_stride_1920_frameid_61_ts_21972315184900.yuv
gdc_handle_296805_chn0_1920x1080_stride_1920_frameid_91_ts_21973302504675.yuv
... ...
```

## multi_pipe_vin_isp_ynr_pym_gdc_vpu

### Feature Overview

The `multi_pipe_vin_isp_ynr_pym_gdc_vpu` example supports connecting multiple sensor inputs simultaneously and processes video streams through multiple processing modules such as VIN, ISP, PYM, GDC, and CODEC.

Notes:
1. The `GDC` module depends on a bin file as input. This example program searches for bin files in the `/app/multimedia_samples/vp_sensors/gdc_bin` directory. The `GDC` module will only run if an appropriate bin file is found.
2. The minimum width and height inputs for the `CODEC` module are 256 and 128, respectively. Therefore, if the output resolution of the selected PYM channel is less than the minimum width and height of the `CODEC` module, the program will exit directly.

### Code Location and Directory Structure
- Code location `/app/multimedia_samples/sample_pipeline/multi_pipe_vin_isp_ynr_pym_gdc_vpu`
- Directory structure
```
multi_pipe_vin_isp_ynr_pym_gdc_vpu
├── Makefile
└── multi_pipe_vin_isp_ynr_pym_gdc_vpu.c
```

### Compilation
- Navigate to the multi_pipe_vin_isp_ynr_pym_gdc_vpu directory and run `make` to compile.
- The output artifact is `multi_pipe_vin_isp_ynr_pym_gdc_vpu` in the source code directory of multi_pipe_vin_isp_ynr_pym_gdc_vpu.

### Execution
#### Program Execution Method
Run the program directly `./multi_pipe_vin_isp_ynr_pym_gdc_vpu` to get help information.

```sh
# ./multi_pipe_vin_isp_ynr_pym_gdc_vpu
Usage: multi_pipe_vin_isp_ynr_pym_gdc_vpu [Options]
Options:
-c, --config="sensor=id link=port channel=pym_chn type=TYPE output=FILE, 'channel' and 'type' and 'output' is not mandatory"
                Configure parameters for each video pipeline, can be repeated up to 6 times
                sensor   --  Sensor index,can have multiple parameters, reference sensor list.
                link     --  Specify the port for connecting serdes sensors, 0:A 1:B 2:C 3:D, can be set to [0-3].
				mipi     --  Specify the mipi_rx for connecting serdes sensors
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
index: 4  sensor_name: ovx3cstd-30fps           config_file:linear_1920x1280_yuv_30fps_1lane.c
```

#### Program Parameter Options Description

- `-c, --config="sensor=id channel=vse_chn type=TYPE output=FILE"`
  - Configure the parameters for each video pipeline. This option can be repeated multiple times.
  - `sensor` is a mandatory parameter, while `channel`, `type`, and `output` are optional. If the user does not configure them, the program will use default values.
  - `sensor`: Sensor index, mandatory parameter, can have multiple parameters. Refer to the sensor list.
  - `link`: The Link Port for Serdes type Sensors (ignored for MIPI type Sensors). For example, if connected to Port A, specify as 0: `-l 0`.
  - `mipi`: The mipi host connected to the Serdes Sensor.
  - `channel`: VSE channel index, optional, default is 0, can be set to [0~5].
  - `type`: Encoding type, optional, default is h264, can be set to [h264, h265].
  - `output`: Save encoded stream data to a file, optional, default is `pipeline[xx]_[width]x[height]_[xxx]fps.[type]`.

- `-v, --verbose`
  - Enable verbose mode.

- `-h, --help`
  - Show help message.

Notes:
1. Serdes type sensors must specify the Link Port.
2. To adjust the number of video pipelines, increase or decrease the number of `-c` parameter sets.
3. Non-Serdes sensors do not need to set link and mipi.
4. The link value is determined by the port on the deserializer to which the serdes sensor is connected. Ensure the serdes sensor is connected to the specified port.
5. The mipi value is determined by the mipi host corresponding to the port on the deserializer to which the serdes sensor is connected. Refer to the [Hardware User Guide](./overview#example-usage-guide).
6. Currently, only mipi hosts 0 and 2 can be used.

#### Execution Effect
Output of `multi_pipe_vin_isp_ynr_pym_gdc_vpu`: Each video processing pipeline encodes the processed video stream into H.264/H.265 format and saves it.

Example:
1. Use imx219 (MIPI type) and an ovx3cstd (Serdes type) connected to mipi host 2 and link port 1 as sensor inputs.
2. Execute the command `./multi_pipe_vin_isp_ynr_pym_gdc_vpu -c "sensor=0" -c "sensor=4 mipi=2 link=1"`.

Sample log output is as follows:

```sh
#./multi_pipe_vin_isp_ynr_pym_gdc_vpu -c "sensor=0" -c "sensor=4 mipi=2 link=1"
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

The following files will be saved during execution:

```
pipeline0_1920x1080_30fps.h264
pipeline1_1280x720_30fps.h264
```

## uvc_capture_sample

### Feature Overview
`uvc_capture_sample` is a program for testing the uvc camera video capture pipeline. It captures images from the uvc camera and saves the output images, with support for displaying ISP-related information.

### Code Location and Directory Structure
- Code location `/app/multimedia_samples/sample_pipeline/uvc_capture_sample`

- Directory structure

```bash
uvc_capture_sample
├── Makefile
├── common_utils.c
├── common_utils.h
├── uvc_capture_sample.c
├── uvc_capture_sample.h
├── v4l2_common_utils.c
└── v4l2_common_utils.h
```

### Compilation
- Navigate to the uvc_capture_sample directory and run `make` to compile.
- The output artifact is `uvc_capture_sample` in the source code directory of uvc_capture_sample.

### Execution
#### Program Execution Method

Run the program directly `./uvc_capture_sample -h` to get help information.

#### Program Parameter Options Description

**Options:**

- `-i, --video_id <id>`
  - Specify the video node, such as video0, video1.
- `-d, --dump_file`
  - Whether to save image files. Enabling this option saves captured images to files.
- `-F, --format`
  - Set the image format, choose from supported formats like YUYV, NV12 based on the uvc camera.
- `-l, --loop_cnt <num>`
  - Set the number of capture loops (i.e., how many frames to capture).
- `-H, --height <px>`
  - Set the image height (in pixels).
- `-W, --width <px>`
  - Set the image width (in pixels).
- `-E, --enable_isp_info`
  - Display ISP exposure and white balance information.
- `-h, --help`
  - Display help information.

**Examples:**

- Configure a uvc camera video pipeline using video0, specify format YUYV, and save 5 captured frames.

```shell
./uvc_capture_sample -i 0  -l 5 -W 1920 -H 1080 -F YUYV  -d
```

- Configure a uvc camera video pipeline using video0, specify format YUYV, save 5 captured frames, and print current exposure and white balance information.

```shell
./uvc_capture_sample -i 0  -l 5 -W 1920 -H 1080 -F YUYV  -d -E
```

#### Execution Effect

Run the following command:

```shell
./uvc_capture_sample -i 0  -l 5 -W 1920 -H 1080 -F YUYV  -d
```

Sample log output is as follows:

```shell
ptc[0].video_id = 0
ptc[0].loop_cnt = 5
ptc[0].pic_width = 1920
ptc[0].pic_height = 1080
ptc[0].pic_format = 6
ptc[0].dump_mask = 1
DEBUG: index = 0, max_num = 24
pipe_num:0
TestContext[0] create pthread success
loop_cnt: 5
open device: /dev/video0 (fd=3)
     driver: uvcvideo
       card: FHD Camera Microphone: FHD Came
    version: 6.1.83
   all caps: 84a00001
device caps: 04200001
 0: Motion-JPEG 0x47504a4d 0x1
...
filedump(./yuv_dump/isp_5_s0_c0_b1_f0_005838.yuv, size(4147200) is successed
loop cnt use up
pipe(0)Test thread 281473524101408---join done.
------ Test case uvc_capture_sample done  ------
```