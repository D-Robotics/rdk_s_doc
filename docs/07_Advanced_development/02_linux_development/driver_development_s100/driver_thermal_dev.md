---
sidebar_position: 9
---

# Thermal 系统

## S100温度监控原理

### 内置PVT监控

两个pvt控制器，每个8路温度通道，分别从下面设备节点读取，单位为 毫摄氏度

| **pvt id** | **ts id** | **linux thermal 节点**                           |
| ---------- | --------- | ------------------------------------------------ |
| 0          | 0         | cat /sys/class/thermal/thermal_zone0/temp         |
|            | 1         | cat /sys/class/thermal/thermal_zone1/temp         |
|            | 2         | cat /sys/class/thermal/thermal_zone2/temp         |
|            | 3         | cat /sys/class/thermal/thermal_zone3/temp         |
|            | 4         | cat /sys/class/thermal/thermal_zone4/temp         |
|            | 5         | cat /sys/class/thermal/thermal_zone5/temp         |
|            | 6         | cat /sys/class/thermal/thermal_zone6/temp         |
|            | 7         | cat /sys/class/thermal/thermal_zone7/temp         |
| 1          | 0         | cat /sys/class/thermal/thermal_zone8/temp         |
|            | 1         | cat /sys/class/thermal/thermal_zone9/temp         |
|            | 2         | cat /sys/class/thermal/thermal_zone10/temp        |
|            | 3         | cat /sys/class/thermal/thermal_zone11/temp        |
|            | 4         | cat /sys/class/thermal/thermal_zone12/temp        |
|            | 5         | cat /sys/class/thermal/thermal_zone13/temp        |
|            | 6         | cat /sys/class/thermal/thermal_zone14/temp        |
|            | 7         | cat /sys/class/thermal/thermal_zone15/temp        |

### 外置热敏电阻

热敏电阻的原理是温度改变阻值从而改变分压。

Mcore本身会将所有通路的电压进行读取。在Acore linux中会提供设备节点读取这些电压值。

因此Mcore、Acore本身的系统软件镜像均无需修改。

只需要在linux用户态将读取到热敏电阻对应通道的电压值，根据热敏电阻的物理公式转化成温度值即可。

linux设备节点与通道的对应关系如下:

#### PVT0

| Channel | Channel Name       | 对应的 Linux 节点 (读取到的电压单位为 mV，毫伏) |
| ------- | ------------------ | ---------------------------------------------- |
| 0       | external 差分      | /sys/bus/iio/devices/iio:device0/in_voltage0_raw |
| 1       | external 差分      | /sys/bus/iio/devices/iio:device0/in_voltage1_raw |
| 2       | external 单端      | /sys/bus/iio/devices/iio:device0/in_voltage2_raw |
| 3       | external 单端      | /sys/bus/iio/devices/iio:device0/in_voltage3_raw |
| 4       | external 单端      | /sys/bus/iio/devices/iio:device0/in_voltage4_raw |
| 5       | external 单端      | /sys/bus/iio/devices/iio:device0/in_voltage5_raw |
| 6       | VDD_BPU1           | /sys/bus/iio/devices/iio:device0/in_voltage6_raw |
| 7       | VDD_DDR1           | /sys/bus/iio/devices/iio:device0/in_voltage7_raw |
| 8       | VDDQ_DDR1          | /sys/bus/iio/devices/iio:device0/in_voltage8_raw |
| 9       | VDDQLP_DDR1        | /sys/bus/iio/devices/iio:device0/in_voltage9_raw |
| 10      | VAA_DDR1           | /sys/bus/iio/devices/iio:device0/in_voltage10_raw |
| 11      | VDDHV_PLL          | /sys/bus/iio/devices/iio:device0/in_voltage11_raw |
| 12      | VDDIO_SD_SPI0      | /sys/bus/iio/devices/iio:device0/in_voltage12_raw |
| 13      | VDDIO_SD_SD0       | /sys/bus/iio/devices/iio:device0/in_voltage13_raw |
| 14      | VDDIO_SD_OSPI      | /sys/bus/iio/devices/iio:device0/in_voltage14_raw |
| 15      | VDDIO_SD_SPI3      | /sys/bus/iio/devices/iio:device0/in_voltage15_raw |


#### PVT1

| Channel | Channel Name       | 对应的 Linux 节点 (读取到的电压单位为 mV，毫伏) |
| ------- | ------------------ | ---------------------------------------------- |
| 0       | external 差分      | /sys/bus/iio/devices/iio:device1/in_voltage0_raw |
| 1       | external 差分      | /sys/bus/iio/devices/iio:device1/in_voltage1_raw |
| 2       | external 单端      | /sys/bus/iio/devices/iio:device1/in_voltage2_raw |
| 3       | external 单端      | /sys/bus/iio/devices/iio:device1/in_voltage3_raw |
| 4       | external 单端      | /sys/bus/iio/devices/iio:device1/in_voltage4_raw |
| 5       | external 单端      | /sys/bus/iio/devices/iio:device1/in_voltage5_raw |
| 6       | VDD_BPU0           | /sys/bus/iio/devices/iio:device1/in_voltage6_raw |
| 7       | VDD_DDR0           | /sys/bus/iio/devices/iio:device1/in_voltage7_raw |
| 8       | VDDQ_DDR0          | /sys/bus/iio/devices/iio:device1/in_voltage8_raw |
| 9       | VDDQLP_DDR0        | /sys/bus/iio/devices/iio:device1/in_voltage9_raw |
| 10      | VAA_DDR0           | /sys/bus/iio/devices/iio:device1/in_voltage10_raw |
| 11      | NA                 | /sys/bus/iio/devices/iio:device1/in_voltage11_raw |
| 12      | VDD_CORE           | /sys/bus/iio/devices/iio:device1/in_voltage12_raw |
| 13      | VDD_AO             | /sys/bus/iio/devices/iio:device1/in_voltage13_raw |
| 14      | VDDIO_SD_EMAC0     | /sys/bus/iio/devices/iio:device1/in_voltage14_raw |
| 15      | VDDIO_SD_SD1       | /sys/bus/iio/devices/iio:device1/in_voltage15_raw |


## 温度监控阈值及策略
S100的16路温度，以最高温度为准，不要使用平均温度。

芯片120摄氏度时，Acore的上层诊断服务会通过SPI把过温信息发送给外部MCU，期望外部MCU进行干预操作，例如断电。

芯片125摄氏度时，Mcore会进行shutdown操作，对Acore的内部部分domain，通过pmu进行下电操作，关闭部分时钟，Mcore进入wfi状态，做兜底保护。

