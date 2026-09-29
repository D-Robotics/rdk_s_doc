---
sidebar_position: 4
title: "Camera 调试 FAQ"
description: "Camera sensor 常见错误码与排查方向"
---

# Camera 调试FAQ

下面是 sensor 常见的错误码及简单的排查方向：

| 错误码 | 定义                        | 排查方向                                                        |
| ------ | --------------------------- | --------------------------------------------------------------- |
| 203    | HB_CAM_INIT_FAIL            | sensor 初始化失败，一般可能 i2c 不通，配置的 sensor mode 不支持 |
| 205    | HB_CAM_START_FAIL           | sensor 启动失败，一般可能 i2c 不通，配置的 sensor mode 不支持   |
| 207    | HB_CAM_I2C_WRITE_FAIL       | sensor i2c 不通，可以参考 [i2c 不通](#i2c-不通)                 |
| 217    | HB_CAM_SENSOR_POWERON_FAIL  | sensor 上电失败，可能是 sensor gpio 配置错误                    |
| 218    | HB_CAM_SENSOR_POWEROFF_FAIL | sensor 下电失败，可能是 sensor gpio 配置错误                    |

## FAQ

下面是 sensor点亮过程中常见问题和解决方法：

### 目录

| 分类       | 问题                                     | 链接                                                                                  |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| **I2C**    | i2c 不通                                 | [i2c 不通](#i2c-不通)                                                                 |
| **MIPI**   | 无法进入 HS，MIPI start error            | [无法进入 HS，MIPI start error](#无法进入-hsmipi-start-error)                         |
| **MIPI**   | MIPI 报错                                | [MIPI 报错](#mipi-报错)                                                               |
| **MIPI**   | MIPI 参数确定                            | [MIPI 参数确定](#mipi-参数确定)                                                       |
| **MIPI**   | 如何修改 MIPI 驱动电流                   | [如何修改 MIPI 驱动电流](#如何修改-mipi-驱动电流)                                     |
| **MIPI**   | 如何查看 HOST(RX) 设备当前运行状态和配置 | [如何查看 HOST(RX) 设备当前运行状态和配置](#如何查看-hostrx-设备当前运行状态和配置)   |
| **MIPI**   | 如何查看 HOST(RX) 设备寄存器             | [如何查看 HOST(RX) 设备寄存器](#如何查看-hostrx-设备寄存器)                           |
| **MIPI**   | 如何打开 MIPI CIM 驱动的 log                 | [如何打开 MIPI CIM 驱动的 log](#如何打开-mipi-和cim-驱动的-log)                                 |
| **LPWM**   | 如何查看 LPWM的配置                 | [如何查看 LPWM的配置](#如何查看lpwm的配置)                                 |
| **Sensor** | Sensor 库 check 或 load error            | [Sensor 库 check 或 load error](#sensor-库-check-或-load-error)                       |
| **Sensor** | Sensor 作为 slave mode 配置              | [Sensor 作为 slave mode 配置](#sensor-作为-slave-mode-配置)                           |
| **图像**   | Dump 出的图带竖条纹问题                  | [Dump 出的图带竖条纹问题](#dump-出的图带竖条纹问题)                                   |
| **Gain**   | gain 索引值和 增益倍率 对照表            | [gain 索引值和 增益倍率 对照表](#gain-索引值和-增益倍率-对照表)                       |
| **AE/AWB** | AE/AWB 验证                              | [AE/AWB 验证](#aeawb-验证)                                                            |


---

## I2C

### i2c 不通

使用 i2cdetect 命令探测总线 id，如果挂在 i2c bus 上的 sensor 可以被探测到，说明 sensor 接入正常，如下图：

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/5-7-3-1.png)

通过 logcat 可以看到 sensor init error, i2c 不通相关的 log

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/5-7-3-3.png)

**排查方法：**

**硬件排查：**
1. 检查 camera 模组连接是否正常
2. 检查 GPIO 配置：
   - reset gpio
   - pwd (sensor xshutdown) gpio
   - power_en gpio
   - mclk
   - 使用万用表和示波器进行测量并一一排除
3. 检查模组供电：
   - 查看模组 pin list 或原理图
   - 测量供电情况，可能包括 3.0V/2.8V/1.8V/1.2V 等
4. 检查 I2C 信号：
   - 保证 I2C SDA 和 SCLK 上拉，一般是上拉到 1.8V
   - 默认 SCLK 为 100K，确保满足 sensor I2C 速率要求，否则需要修改 dts I2C 默认速率
5. 检查 MCLK：
   - 保证 mclk 晶振 管脚有波形，一般是 24M 或 27M
6. 检查上电时序：
   - 保证 sensor 上电时序符合 sensor spec 要求

**软件排查：**
1. 检查 I2C 配置：
   - I2C number 与实际硬件配置是否相符
   - I2C addr 与实际硬件配置是否相符
2. 检查 DTS 绑定：
   - MIPI host 与 I2C number 在 dts 中进行绑定
   - 如 mipi host0 使用 I2C number 4，必须保证 dts 绑定的 bus 与实际相符

---


## MIPI

### 无法进入 HS，MIPI start error


MIPI 无法进入 HS，可能有以下几种可能：

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/5-7-3-4.jpg)

**可能原因：**

**1. Sensor 没有正常出流**
- **Slave mode：**
  - Sensor 为 slave mode，需要外界 trigger 信号才能正常出流
  - 检查 trigger 信号配置并测量 trigger 信号是否产生
- **Master mode：**
  - Sensor start 会自动调用给 sensor 写入寄存器，会主动出流
  - 使用示波器测量 MIPI data lane 确定是否有数据
  - 没有数据需要确认 stream_on_setting 开流寄存器是否配置正确

**2. Sensor 提前出流**
- Sensor setting 中可能会有出流的配置，sensor init 后便会自己出流
- 这种情况不满足 MIPI 时序要求，需要将 sensor setting 中的出流配置注释掉，在 sensor_start 中出流
    ```c
    static uint32_t sc230ai_linear_init_setting[] = {
        ....
        // 0x0100,0x01,  // 在 setting 最后不包含 开流 的配置
    }
    static uint32_t sc230ai_stream_on_setting[] = {
        0x0100,0x01,
    };
    ```
- 如果 sensor 特性要求必须在 sensor setting 中有出流配置，则需要手动跳过 HS check

**跳过 HS check 方法：**

**临时调试（shell 命令）：**
```shell
# 注意需要把 mipi host 换成对应的端口号
echo 1 > /sys/class/vps/mipi_host0/param/stop_check_instart
```

**集成到代码中：**
```c
static mipi_config_t mipi_config = {
	.rx_enable = 1,
	...
	.rx_ex_mask = 0x40,
	.rx_attr_ex = {
		.stop_check_instart = 1,
	}
};
```

### MIPI 报错


**MIPI PHY Fatal 报错**

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/5-7-3-5.png)

MIPI PHY fatal 报错，为 MIPI 物理层报错，表明 sensor 到 SoC MIPI PHY 之间传输有问题，可能的原因如下：

1. MIPI clk 配置不正确，参见 [MIPI 参数确定](#mipi-参数确定)
2. MIPI settle 配置不正确，参见 [MIPI 参数确定](#mipi-参数确定)

### MIPI 参数确定


#### Framelength (VTS)

**定义：**
- 帧长，表示 camera 一帧曝光多少行
- 包括有效高度和消隐区 (VBlank) 的行数

**获取方法：**
1. **寄存器读取（推荐）：**
   - Sensor spec 中一般会提供读取帧长的寄存器
   - 在 sensor 完成初始化后，读取该寄存器并打印出来
2. **示波器测量：**
   - 如果 sensor spec 没有提供，需要实际测量 MIPI data 管脚，一般示波器测量的图如下：

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/5-7-3-8.png)

   - 蓝色圈内为有效信号: 32ms，红色圈内为 blanking 信号，长度: 68ms，总长度为：100ms
   - 图像 height 为 1080，则传输 1080 个 pixel 用了 32ms，则加上 blanking 传输的 pixel，可计算出：
   - framelength = 1080 * 100 / 32 = 3375

#### Linelength (HTS)

**定义：**
- 行长，表示 camera 曝光一行有多少个 pixel
- 包括有效宽度和消隐区 (HBlank) 的宽度

**获取方法：**
1. **寄存器读取（推荐）：**
   - Sensor spec 中一般会提供读取行长的寄存器
   - 在 sensor 完成初始化后，读取该寄存器并打印出来
2. **示波器测量：**
   - 如果 sensor spec 没有提供，需要实际测量 MIPI data 管脚，一般示波器测量的图如下：

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/5-7-3-9.png)

   - 蓝色圈内是一行有效数据信号，长度为 24.2us，红色圈内为 blanking 信号，长度：5.4us，总长度为 24.2 + 5.4 = 29.6us
   - 图像 width 为 1920，则传输 1920 个 pixel 用了 24.2us，则带上 blanking 传输的 pixel，可以计算出：
   - linelength = 1920 * 29.6 / 24.2 = 2348

#### MIPI CLK

**说明：**
- Sensor 为 MIPI TX 端，SoC 为 MIPI RX 端
- MIPI clk 由 sensor 端决定，配置一般可由 Sensor 原厂 FAE 获取

**配置规则：**
- MIPI clk 为双边沿采样，是实际物理上（或示波器上测量的信号频率）的 2 倍
- 且为多个 lane 的 clk 总和
- 计算公式：`mipi clk = 2 * lane 数量 * 物理 clk`
- 示例：sensor 2 lane 配置，物理上每条 lane 的物理 clk 为 500M
- 则：`mipi clk = 2 * 2 * 500M = 2000M`，配置填写 2000
- 硬件条件允许的情况下，也可以使用差分示波器进行测量

#### Settle

**定义：**
- Settle 是 MIPI 协议中的概念，先简单介绍一下 settle 信号：

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/5-7-3-10.png)

- MIPI 从 LP 进入到 HS 状态时，硬件信号上可能会有一个脉冲信号
- MIPI 接收器则需要通过延时 settle time，避开这个脉冲信号，再打开接收器，接收 MIPI 数据
- SETTLE 值由 prepare 和部分 zero 信号组成，如上图所示

**获取方法：**

**1. 使用默认值：**
- 可以使用默认值 0，MIPI 驱动中会自动计算一个能够运行的 settle 值

**2. 试错法：**
- Settle 值是一个范围 [0-120]
- 如果设置不正确则会报 MIPI phy_fatal 错误，类似下图所示：

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/5-7-3-5.png)

- 所以我们可以通过试错法来找到该范围
- 一般调试阶段，可以从 0 - 120 之间数值尝试，低于某个值 A 会报该错误，高于某个值 B 也会报该错误，则 settle 取 [A B] 的中间值

**3. 实际测量法：**
- 可以使用示波器抓取 MIPI data lane(D+ 和 D- 两条 lane 需要同时测量) 从 LP 到 HS 的过程，根据波形直接测量 settle 时长对应的数值，一般示波器测量图如下：

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/5-7-3-11.png)

    - 蓝色圈内，为 hs-preapre = 14ns
    - 红色圈内，为 hs-zero = 154ns
    - 单位时间 UI = 1s / (MIPI 物理单个 lane clk / 2) = 1s / (405M / 2) = 4.94 ns
    - min = prepare / UI = 14 / 4.94 = 3 UI
    - max = (prepare + zero) / UI = (154 + 14) / 4.94 = 34 UI
    - settle = (min+max) / 2 = 19 UI

### 如何修改 MIPI 驱动电流


**说明：**
- SoC 端作为 MIPI RX，无法修改 MIPI 驱动电流
- 需要从 MIPI TX 端（sensor 端）来修改，请咨询 sensor FAE


### 如何查看 HOST(RX) 设备当前运行状态和配置


**查看运行状态：**
```shell
cat /sys/class/vps/mipi_host0/status/info
```

**查看配置（init 时下发配置）：**
```shell
cat /sys/class/vps/mipi_host0/status/cfg
```

### 如何查看 HOST(RX) 设备寄存器


**方法：**
- 通过 sysfs 进行寄存器 dump，便于调试

```shell
cat /sys/class/vps/mipi_host0/status/regs
```
### 如何打开 MIPI 和CIM 驱动的 log


```shell
# 改成对应的 mipi host 端口
# 将 mipi debug 信息输出到 pr_debug
echo 1 > /sys/class/vps/mipi_host0/param/dbg_value

#打开 MIPI 的调试打印
echo "file hobot_mipi_host.c +p" > /sys/kernel/debug/dynamic_debug/control
echo "file hobot_mipi_host_ops.c +p" > /sys/kernel/debug/dynamic_debug/control

#打开 CIM 的调试打印
echo "file hobot_cim_handler.c +p">/sys/kernel/debug/dynamic_debug/control

# 注: 若要打印到串口，需将 kernel 的 console 打印等级配到 INFO 以上，如:
echo 8 > /proc/sys/kernel/printk
```

### 如何查看LPWM的配置


```shell
# 查看lpwm的配置节点
root@ubuntu:~# find / -name lpwm_config_info
/sys/devices/platform/soc/370f1000.lpwm1/lpwm_config_info
/sys/devices/platform/soc/370f0000.lpwm0/lpwm_config_info
/sys/devices/platform/soc/370f2000.lpwm2/lpwm_config_info


#以 lpwm0 为例查看lpwm的当前配置
root@ubuntu:~# cat /sys/devices/platform/soc/370f0000.lpwm0/lpwm_config_info
core    source  offset  period  duty_time       threshold       adjust_step     occupied
0       0       10      33333   100     0       0       CAMSYS
1       0       0       0       0       0       0       CAMSYS
2       0       0       0       0       0       0       CAMSYS
3       0       0       0       0       0       0       CAMSYS
```


---

## Sensor

### Sensor 库 check 或 load error


Sensor 库 check error，说明 sensor 驱动有问题

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/5-7-3-6.jpg)

**可能原因：**

**1. 编译问题：**
- Sensor 编译错误，没有编译正常，就 push 到板端进行加载

**2. 框架问题：**
- 编译正常，但是没有按照 HBN 框架来编写
- 需要按照 sensor 驱动文件添加规则来编写 sensor 驱动

### Sensor 作为 slave mode 配置


**说明：**
- 如果 sensor 作为 slave mode，则需要外部触发信号，sensor 才能正常曝光，输出图像数据

**配置要点：**

**1. 触发信号：**
- 依据客户需求，触发信号可以来自于：
  - 其他作为 master mode 的 sensor 输出的 FSYNC 信号
  - SoC LPWM 管脚输出的信号
- 触发信号的要求（如高低电平、最小脉冲宽度）请咨询 Sensor 原厂 FAE

**2. Sensor setting：**
- Sensor 作为 slave mode，需要修改对应的 init setting
- 可能需要修改 power on/power off setting 等
- 请咨询 Sensor 原厂 FAE

**3. 无触发信号处理：**
- 配置完成后，如果没有触发信号，sensor 无法正常出图
- MIPI 可能会报无法进入 HS 的错误
- 可以配置 MIPI nocheck 属性，参考如下：

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/5-7-3-7.png)

或者使用 echo 命令设置 nocheck 属性：
```shell
# 以 host0/rx0 为例，实际需要换成对应的 mipi rx 端口
echo 1 > /sys/class/vps/mipi_host0/param/nocheck
```

### 如何配置 yuv sensor ?
**yuv 排列方式**
- planar：把 Y 数据，U 数据和 V 数据单独放置3块位置，形成3个平面。
- semi-planar：把 Y 数据独立，UV 数据放在一起，形成2个平面。
- packed：YUV 数据打包在一起，无论单独的 Y 数据 U 数据还是 V 数据，地址都不是连续的。

**yuv 命名方式**
- YUVxxxP，YUVxxxSP：比如：YUV422P，YUV420SP。根据 planar，semi-planer 和 packed 的类型来定义的。planar 就是P，注意顺序都是 Y 前 U 中 V 后。semi-planar 就是 SP，注意顺序都是 Y 前 UV 后。
- Ixxx：比如：I422，I420。planar 的别称，I422 就是 YUV422P，I420 就是 YUV420P。
- NVxx，YVxx：比如：NV12，NV21，NV16，YV12。NV 代表属于 semi-planar，12代表一个像素所占的实际 bits。NV12 是 YUV420SP，每个像素占据1个 Y(8Bit)+1/4 个UV(8 * 2 / 4 = 4bit) =12bits。


添加 yuv sensor, 首先需要确定 yuv sensor 配置输出的具体格式，目前支持以下几种格式：
- 8bit YUV422SP(semi-planar): 又称为 NV16，Y 单独占一块地方，U、V紧挨着排在一起，占一块地方，且 U 前 V 后，即 YYYYYYY.......UVUVUVUV......，sensor 及 mipi 配置中，format 填写 0x1E，pack_mode 填写 2，stride 为 1倍的 width。
- 8bit YUV422P(packed): 又称为 YUYV422，YUV 4:2:2 采样，YUV 共占一块地方，按像素点交错存储，如 YUVYUVYUVYUV，sensor 及 mipi 配置中，format 填写 0x1E，pack_mode 填写 1，stride 为 2倍的 width。
- 8bit YUV420SP(semi-planar): 又称为 NV12，Y 单独占一块地方，U、V紧挨着排在一起，占一块地方，且 U 前 V 后，即 YYYYYYY.......UVUVUVUV......，sensor 及 mipi 配置中，format 填写 0x18, pack_mode 填写 2，stride 为 1倍的 width。

如需其他 yuv 格式，请联系 Sensor 原厂 FAE 支持。

注意，yuv sensor 接入到 mipi 后，直接从 sif dump 数据到 ddr，如果需要后级模块，则要跳过 isp 模块(因为 isp 只支持输入 raw 格式)，直接将 sif 绑定到 vse 或者后级模块，且 sensor 效果由 sensor 模组本身保证，SoC 端无法通过 isp 做效果 tuning。


---

## 图像

### Dump 出的图带竖条纹问题


出图表现为有规律的黑色竖条纹,log和图像如下图所示：

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/image_20260105-132939.png)

  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/image_20260105-133227.png)

**原因：**
1. 有组 DATA LANE 的 P/N 接反
2. MIPI 数据是按 byte 拆分给各 lane 传输的，最后再组包解析
3. 任何一个 DATA LANE 有问题，都会报出 CRC 问题
4. 若只某一 LANE 上有接反问题，则会出现上述出图有一定规律竖条纹（每隔几个 byte 有 1 个异常 byte 值）

**解决方法：**
- 检查硬件连接，确认 DATA LANE 的 P/N 是否正确连接

## gain 索引值和 增益倍率 对照表


1. ISP（图像信号处理器）的 3A（自动曝光/自动白平衡/自动对焦）算法需要控制 sensor 的增益（gain）。但 ISP 和 sensor 使用不同的增益表示方式：
2. ISP 增益以**倍率（ratio）** 表示（如 1x, 2x, 4x，255x）,会将倍率转换为 **0-255 的索引值** 传递给 sensor 驱动

转换公式如下：
x = 32 * log₂(gain)

下面是是 gain 索引值 和 ISP 增益倍率 的对照表：

| 索引 (x) | 增益倍率 | 索引 (x) | 增益倍率 | 索引 (x) | 增益倍率 | 索引 (x) | 增益倍率 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 0        | 1.000    | 64       | 4.000    | 128      | 16.000   | 192      | 64.000   |
| 1        | 1.022    | 65       | 4.088    | 129      | 16.350   | 193      | 65.401   |
| 2        | 1.044    | 66       | 4.177    | 130      | 16.708   | 194      | 66.834   |
| 3        | 1.067    | 67       | 4.269    | 131      | 17.074   | 195      | 68.297   |
| 4        | 1.091    | 68       | 4.362    | 132      | 17.448   | 196      | 69.792   |
| 5        | 1.114    | 69       | 4.458    | 133      | 17.830   | 197      | 71.321   |
| 6        | 1.139    | 70       | 4.555    | 134      | 18.221   | 198      | 72.882   |
| 7        | 1.164    | 71       | 4.655    | 135      | 18.620   | 199      | 74.478   |
| 8        | 1.189    | 72       | 4.757    | 136      | 19.027   | 200      | 76.109   |
| 9        | 1.215    | 73       | 4.861    | 137      | 19.444   | 201      | 77.776   |
| 10       | 1.242    | 74       | 4.967    | 138      | 19.870   | 202      | 79.479   |
| 11       | 1.269    | 75       | 5.076    | 139      | 20.305   | 203      | 81.219   |
| 12       | 1.297    | 76       | 5.187    | 140      | 20.749   | 204      | 82.998   |
| 13       | 1.325    | 77       | 5.301    | 141      | 21.204   | 205      | 84.815   |
| 14       | 1.354    | 78       | 5.417    | 142      | 21.668   | 206      | 86.672   |
| 15       | 1.384    | 79       | 5.536    | 143      | 22.143   | 207      | 88.570   |
| 16       | 1.414    | 80       | 5.657    | 144      | 22.627   | 208      | 90.510   |
| 17       | 1.445    | 81       | 5.781    | 145      | 23.123   | 209      | 92.492   |
| 18       | 1.477    | 82       | 5.907    | 146      | 23.629   | 210      | 94.517   |
| 19       | 1.509    | 83       | 6.037    | 147      | 24.147   | 211      | 96.587   |
| 20       | 1.542    | 84       | 6.169    | 148      | 24.675   | 212      | 98.701   |
| 21       | 1.576    | 85       | 6.304    | 149      | 25.216   | 213      | 100.863  |
| 22       | 1.610    | 86       | 6.442    | 150      | 25.768   | 214      | 103.071  |
| 23       | 1.646    | 87       | 6.583    | 151      | 26.332   | 215      | 105.328  |
| 24       | 1.682    | 88       | 6.727    | 152      | 26.909   | 216      | 107.635  |
| 25       | 1.719    | 89       | 6.874    | 153      | 27.498   | 217      | 109.992  |
| 26       | 1.756    | 90       | 7.025    | 154      | 28.100   | 218      | 112.400  |
| 27       | 1.795    | 91       | 7.179    | 155      | 28.715   | 219      | 114.861  |
| 28       | 1.834    | 92       | 7.336    | 156      | 29.344   | 220      | 117.377  |
| 29       | 1.874    | 93       | 7.497    | 157      | 29.987   | 221      | 119.947  |
| 30       | 1.915    | 94       | 7.661    | 158      | 30.643   | 222      | 122.573  |
| 31       | 1.957    | 95       | 7.829    | 159      | 31.314   | 223      | 125.257  |
| 32       | 2.000    | 96       | 8.000    | 160      | 32.000   | 224      | 128.000  |
| 33       | 2.044    | 97       | 8.175    | 161      | 32.701   | 225      | 130.803  |
| 34       | 2.089    | 98       | 8.354    | 162      | 33.417   | 226      | 133.667  |
| 35       | 2.134    | 99       | 8.537    | 163      | 34.148   | 227      | 136.594  |
| 36       | 2.181    | 100      | 8.724    | 164      | 34.896   | 228      | 139.585  |
| 37       | 2.229    | 101      | 8.915    | 165      | 35.660   | 229      | 142.642  |
| 38       | 2.278    | 102      | 9.110    | 166      | 36.441   | 230      | 145.765  |
| 39       | 2.327    | 103      | 9.310    | 167      | 37.239   | 231      | 148.957  |
| 40       | 2.378    | 104      | 9.514    | 168      | 38.055   | 232      | 152.219  |
| 41       | 2.430    | 105      | 9.722    | 169      | 38.888   | 233      | 155.552  |
| 42       | 2.484    | 106      | 9.935    | 170      | 39.739   | 234      | 158.958  |
| 43       | 2.538    | 107      | 10.152   | 171      | 40.610   | 235      | 162.439  |
| 44       | 2.594    | 108      | 10.375   | 172      | 41.499   | 236      | 165.995  |
| 45       | 2.650    | 109      | 10.602   | 173      | 42.408   | 237      | 169.630  |
| 46       | 2.709    | 110      | 10.834   | 174      | 43.336   | 238      | 173.345  |
| 47       | 2.768    | 111      | 11.071   | 175      | 44.285   | 239      | 177.140  |
| 48       | 2.828    | 112      | 11.314   | 176      | 45.255   | 240      | 181.019  |
| 49       | 2.890    | 113      | 11.561   | 177      | 46.246   | 241      | 184.983  |
| 50       | 2.954    | 114      | 11.815   | 178      | 47.258   | 242      | 189.034  |
| 51       | 3.018    | 115      | 12.073   | 179      | 48.293   | 243      | 193.173  |
| 52       | 3.084    | 116      | 12.338   | 180      | 49.351   | 244      | 197.403  |
| 53       | 3.152    | 117      | 12.608   | 181      | 50.431   | 245      | 201.726  |
| 54       | 3.221    | 118      | 12.884   | 182      | 51.536   | 246      | 206.143  |
| 55       | 3.292    | 119      | 13.166   | 183      | 52.664   | 247      | 210.657  |
| 56       | 3.364    | 120      | 13.454   | 184      | 53.817   | 248      | 215.269  |
| 57       | 3.437    | 121      | 13.749   | 185      | 54.996   | 249      | 219.983  |
| 58       | 3.513    | 122      | 14.050   | 186      | 56.200   | 250      | 224.800  |
| 59       | 3.589    | 123      | 14.358   | 187      | 57.431   | 251      | 229.723  |
| 60       | 3.668    | 124      | 14.672   | 188      | 58.688   | 252      | 234.753  |
| 61       | 3.748    | 125      | 14.993   | 189      | 59.973   | 253      | 239.893  |
| 62       | 3.830    | 126      | 15.322   | 190      | 61.287   | 254      | 245.146  |
| 63       | 3.914    | 127      | 15.657   | 191      | 62.629   | 255      | 250.514  |


  ![](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/camera_faq/image_16431638886864.png)

## AE/AWB 验证

### 验证步骤


一、验证要求
1. AE（自动曝光）
确认写入 Sensor 的曝光值与增益寄存器符合规格书（Spec）要求。
2. AWB（自动白平衡）
若 Sensor 支持 AWB 寄存器写入，确认其写入值符合规格书要求。

二、ISP AE 调节机制说明

1. Sensor 曝光输出图像后，SOC ISP 会接收到一帧数据。
2. ISP 首先统计该帧数据的亮度信息。
3. ISP Tuning 中会预设一个 AE Target（目标亮度值）。
4. 若统计亮度与 AE Target 不一致，ISP AE 算法将计算出新的曝光时间与增益值，并通过驱动写入 Sensor。
5. 调节持续进行，直至统计亮度接近 AE Target。
6. 环境亮度变化会再次触发该调节过程。

三、实际验证步骤
1. 参考 [hbplayer 和 tuning_tool 工具使用指南](/Advanced_development/multimedia_development/multimedia_api/isp_tuning_guide/hbplayer_tuning_tool)。
2. 将 AE 模式切换为 Manual（手动），以便观察与控制调节过程。

3. 自行设置 aGain，dGain 及 integrationTime 值，来进行验证。
比如，将曝光时间调整为 5ms (记得点一下 Write Page)

4. 然后通过 sensor 驱动中的打印(需要自己添加)，或者使用 i2ctransfer 工具来查看 sensor 寄存器值，确认写给 sensor 的寄存器值是否符合 spec 要求。
