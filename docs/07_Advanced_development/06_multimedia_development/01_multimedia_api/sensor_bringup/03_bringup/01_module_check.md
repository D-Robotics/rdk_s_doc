---
sidebar_position: 1
title: "模组检查和基本功能确认"
description: "模组点亮前的硬件信息获取、板级/模组硬件信息与状态确认"
---

# 模组检查和基本功能确认

## 硬件信息获取

在拿到模组点亮前，首先要确认点亮环境及模组等硬件相关信息。每个转接板的硬件设计不同，需要根据硬件设计进行配置

:::doc_scope{products="RDK S100"}

S100 存在两个 Camera 转接板，两个转接板分别是：

1. [相机扩展板（RDK S100）](../../../../../01_Quick_start/01_hardware_introduction/03_expansion_board/01_camera/01_rdk_camera_expansion_board.md)：提供了 2 个 MIPI 相机接口和 4 个 GMSL 相机接口
2. [相机扩展板 12 通道（RDK S100）](../../../../../01_Quick_start/01_hardware_introduction/03_expansion_board/01_camera/02_rdk_camera_expansion_board_12l.md)：提供 12 个 GMSL 相机接口
:::

因为 ``相机扩展板（RDK S100）`` 板级硬件兼容MIPI sensor和 Sedes sensor， 后续点亮都 以 相机扩展板（RDK S100）为例进行演示

:::doc_scope{products="RDK S600"}

S600 存在一个 Camera 转接板：

- [相机扩展板（RDK S600）](../../../../../01_Quick_start/01_hardware_introduction/03_expansion_board/01_camera/03_rdk_s600_camera_expansion_board.md)：提供 8 个 GMSL 相机接口
:::

### 板级硬件信息

**RX匹配的硬件信息**

首先为环境硬件信息，各平台 RDK 上 RX/I2C/DES 等匹配关系如下：

:::doc_scope{products="RDK S100"}

以下是 相机扩展板（RDK S100）的配置：


| MIPIRX | Lane   | PhyType | I2C  | LPWM                                        | gpio_oth        |
| ------ | ------ | ------- | ---- | ------------------------------------------- | --------------- |
| RX0    | 4 lane | DPHY    | I2C1 | LPWM0_DOUT0 - LPWM0_0                       | SPI1_CSN0 - 502 |
| RX1    | 4 lane | DPHY    | I2C2 | LPWM0_DOUT1 - LPWM0_1                       | SD_WPROT - 494  |
| RX4    | 4 lane | DPHY    | I2C3 | LPWM0_DOUT2 - LPWM0_2/LPWM0_DOUT3 - LPWM0_3 | -               |


| MIPIRX | DES            | DES CSI | DES Connecter | gpio_des          | sensor_er | POC            | gpio_poc                          | poc_map |
| ------ | -------------- | ------- | ------------- | ----------------- | --------- | -------------- | --------------------------------- | ------- |
| RX0    | -              | -       | -             | -                 | -         | -              | -                                 | -       |
| RX1    | -              | -       | -             | -                 | -         | -              | -                                 | -       |
| RX4    | MAX96712(0x29) | A       | 4 路          | SENSOR8_ERR - 452 | 0         | MAX20087(0x28) | DES1_POC_EN - 433/SPI1_SCLK - 506 | 0x1320  |

:::note
- LPWM 和 MCLK(24MHz)两种功能切换：见 [MIPI 接口功能切换开关（接口5）](../../../../../01_Quick_start/01_hardware_introduction/03_expansion_board/01_camera/01_rdk_camera_expansion_board.md#mipi-接口功能切换开关接口5)
- 控制信号支持 1V8 和 3V3 功能切换：见 [MIPI 接口电平切换开关（接口6）](../../../../../01_Quick_start/01_hardware_introduction/03_expansion_board/01_camera/01_rdk_camera_expansion_board.md#mipi-接口电平切换开关接口6)
:::

设备树配置如下：

```dts
// vcon0：MIPI 直连 sensor
&vin_vcon0 {
    bus = <1>;              // I2C bus 号，对应 i2c1
    gpio_poc = <0>;         // POC 供电 GPIO（MIPI 直连无 POC，填 0）
    gpio_des = <0>;         // 解串器 GPIO（MIPI 直连无 DES，填 0）
    sensor_err = <0>;       // sensor 错误中断线（0 = 不使用）
    gpio_oth = <502>;       // sensor 其他 GPIO（如 reset/XSHUTDN），502 = SPI1_CSN0
    lpwm_chn = <0>;         // LPWM 通道号0，用于触发曝光同步
    rx_phy = <1 0>;         // PHY 配置：1=DPHY, 0=RX0
};

// vcon1：MIPI 直连 sensor
&vin_vcon1 {
    bus = <2>;              // i2c2
    gpio_poc = <0>;
    gpio_des = <0>;
    sensor_err = <0>;
    gpio_oth = <494>;       // 494 = SD_WPROT
    lpwm_chn = <1>;         // LPWM 通道号1，用于触发曝光同步
    rx_phy = <1 1>;         // 1=DPHY, 1=RX1
};

// vcon4：GMSL/SerDes sensor
&vin_vcon4 {
    bus = <3>;              // i2c3
    gpio_poc = <0 433 506>;  // POC 供电 GPIO：0=disable, 433=DES1_POC_EN, 506=SPI1_SCLK
    gpio_des = <0 452 0 0 0 0 0 0 0 0>;  // 解串器 452=SENSOR8_ERR(PWDNB), 后续预留
    sensor_err = <0>;
    lpwm_chn = <2 3>;        // 2 路 LPWM 通道（channel2 + channel3）
    rx_phy = <1 4>;          // 1=DPHY, 4=RX4
    poc_map = <0x1320>;     // POC 与 Link 的映射关系
};
```

#### 参数含义

| 参数       | 类型        | 含义                                                                                          | MIPI 直连                        | GMSL/SerDes                                                       |
| ---------- | ----------- | --------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| `bus`      | uint32      | I2C bus 号，vcon 通过该 bus 与 sensor/解串器通信                                               | 填对应 i2c 号                    | 填对应 i2c 号                                                     |
| `gpio_poc` | array       | POC（Power Over Coax）供电控制 GPIO。非 0=使能；后续值为 GPIO 编号                            | `<0>`（无 POC）                  | `<0 433 506>`（使能 POC，GPIO 433=EN, 506=INT）                   |
| `gpio_des` | array       | 解串器（DES）控制 GPIO。第 1 个值 0=不使用，非 0=使能；第 2 个值为 DES 的 PWDNB GPIO 编号      | `<0>`（无 DES）                  | `<0 452 0 ...>`（使能 DES，GPIO 452=PWDNB）                       |
| `sensor_err` | uint32    | sensor 错误中断线编号，0 = 不使用                                                              | 通常 `<0>`                       | 通常 `<0>`                                                        |
| `gpio_oth` | uint32      | sensor 其他控制 GPIO（如 reset/XSHUTDN）。值为 GPIO 编号，0 = 不使用                           | `<502>` 等                       | 通常不配置（GMSL sensor reset 由加串器 MFP 控制）                 |
| `lpwm_chn` | uint32/array | LPWM 通道号，用于触发曝光同步。MIPI 直连通常 1 路，GMSL 可多路                                | `<0>` 或 `<1>`                   | `<2 3>`（2 路）                                                   |
| `rx_phy`   | array       | PHY 配置：第 1 个值 1=DPHY / 2=CPHY；第 2 个值为 RX 端口号                                    | `<1 0>`（DPHY, RX0）             | `<1 4>`（DPHY, RX4）                                              |
| `poc_map`  | uint32      | POC 芯片与解串器 Link 的映射关系，16bit，每 4bit 对应一个 Link 的 POC 通道号                   | 不配置                           | `<0x1320>`                                                        |

:::

:::doc_scope{products="RDK S600"}

S600 共 6 路 MIPI RX（vcon0~5）：vcon0~3 接 SerDes 扩展板，vcon4/5 为主板直连 MIPI sensor。：

| MIPIRX | Lane/Trio | PhyType | I2C  | LPWM                 | gpio_oth             |
| ------ | --------- | ------- | ---- | -------------------- | -------------------- |
| RX0    | 4 lane    | DPHY    | I2C0 | LPWM0_DOUT0/DOUT1    | -                    |
| RX1    | 3 trio    | CPHY    | I2C1 | LPWM0_DOUT2/DOUT3    | -                    |
| RX2    | 4 lane    | DPHY    | I2C2 | LPWM3_DOUT0/DOUT1    | -                    |
| RX3    | 3 trio    | CPHY    | I2C3 | LPWM3_DOUT2/DOUT3    | -                    |
| RX4    | 4 lane    | DPHY    | I2C4 | LPWM2_DOUT2          | EMMC_DATA7 - 411     |
| RX5    | 4 lane    | DPHY    | I2C5 | LPWM2_DOUT3          | EMMC_DATA_STRB - 412 |

| MIPIRX | DES            | DES CSI | DES Connecter | gpio_des          | sensor_er | POC            | gpio_poc                                  | poc_map |
| ------ | -------------- | ------- | ------------- | ----------------- | --------- | -------------- | ----------------------------------------- | ------- |
| RX0    | MAX96712(0x29) | A       | 4 路          | EMMC_DATA2 - 406  | 0         | MAX20087(0x28) | DES0_POC_EN - 362/DES0_POC_INT - 374      | -       |
| RX1    | MAX96712(0x29) | A       | 4 路          | EMMC_DATA3 - 407  | 0         | MAX20087(0x28) | DES1_POC_EN - 363/DES1_POC_INT - 373      | -       |
| RX2    | MAX96712(0x29) | A       | 4 路          | EMMC_DATA4 - 408  | 0         | MAX20087(0x28) | DES2_POC_EN - 364/DES2_POC_INT - 371      | -       |
| RX3    | MAX96712(0x29) | A       | 4 路          | EMMC_DATA5 - 409  | 0         | MAX20087(0x28) | DES3_POC_EN - 365/DES3_POC_INT - 370      | -       |
| RX4    | -              | -       | -             | -                 | 0         | -              | -                                         | -       |
| RX5    | -              | -       | -             | -                 | 0         | -              | -                                         | -       |


设备树配置如下：

```dts
// vcon0：SerDes sensor
&vin_vcon0 {
	bus = <0>;               // I2C bus 号，对应 i2c0
	gpio_poc = <0 362 374>;  // 0=disable, 362=DES0_POC_EN, 374=DES0_POC_INT
	gpio_des = <0 406>;      // 0=使能, 406=DES0 PWDNB（EMMC_DATA2）
	sensor_err = <0 0 0>;    // sensor 错误中断，0=不使用
	lpwm_chn = <0 1>;         // LPWM0_DOUT0/DOUT1
	rx_phy = <1 0>;          // 1=DPHY, 0=RX0
};

// vcon1：SerDes sensor
&vin_vcon1 {
	bus = <1>;
	gpio_poc = <0 363 373>;  // 363=DES1_POC_EN, 373=DES1_POC_INT
	gpio_des = <0 407>;      // 407=DES1 PWDNB（EMMC_DATA3）
	sensor_err = <0 0 0>;
	lpwm_chn = <2 3>;         // LPWM0_DOUT2/DOUT3
	rx_phy = <2 1>;          // 2=CPHY, 1=RX1
};

// vcon2：SerDes sensor
&vin_vcon2 {
	bus = <2>;
	gpio_poc = <0 364 371>;  // 364=DES2_POC_EN, 371=DES2_POC_INT
	gpio_des = <0 408>;      // 408=DES2 PWDNB（EMMC_DATA4）
	sensor_err = <0 0 0>;
	lpwm_chn = <12 13>;      // LPWM3_DOUT0/DOUT1
	rx_phy = <1 2>;          // 1=DPHY, 2=RX2
};

// vcon3：SerDes sensor
&vin_vcon3 {
	bus = <3>;
	gpio_poc = <0 365 370>;  // 365=DES3_POC_EN, 370=DES3_POC_INT
	gpio_des = <0 409>;      // 409=DES3 PWDNB（EMMC_DATA5）
	sensor_err = <0 0 0>;
	lpwm_chn = <14 15>;      // LPWM3_DOUT2/DOUT3
	rx_phy = <2 3>;          // 2=CPHY, 3=RX3
};

// vcon4：MIPI 直连 sensor
&vin_vcon4 {
	bus = <4>;
	gpio_poc = <0 0 0>;      // MIPI 直连无 POC
	gpio_des = <0 0>;        // MIPI 直连无 DES
	sensor_err = <0 0 0>;
	gpio_oth = <411>;        // sensor reset/XSHUTDN（EMMC_DATA7）
	lpwm_chn = <6>;           // LPWM2_DOUT2
	rx_phy = <1 4>;          // 1=DPHY, 4=RX4
};

// vcon5：MIPI 直连 sensor
&vin_vcon5 {
	bus = <5>;
	gpio_poc = <0 0 0>;
	gpio_des = <0 0>;
	sensor_err = <0 0 0>;
	gpio_oth = <412>;        // EMMC_DATA_STRB
	lpwm_chn = <7>;           // LPWM2_DOUT3
	rx_phy = <1 5>;          // 1=DPHY, 5=RX5
};
```

#### 参数含义

| 参数 | 类型 | 含义 | MIPI 直连（vcon4/5） | GMSL/SerDes（vcon0~3） |
| --- | --- | --- | --- | --- |
| `bus` | uint32 | I2C bus 号，vcon 通过该 bus 与 sensor/解串器通信 | `<4>` / `<5>` | `<0>`~`<3>` |
| `gpio_poc` | array | POC 供电控制 GPIO。非 0=使能；后续值为 GPIO 编号 | `<0 0 0>`（无 POC） | `<0 362 374>`（362=EN, 374=INT） |
| `gpio_des` | array | 解串器 PWDNB GPIO。第 1 个值 0=不使用，非 0=使能；第 2 个值为 PWDNB GPIO | `<0 0>`（无 DES） | `<0 406>`（406=PWDNB） |
| `sensor_err` | array | sensor 错误中断线，0 = 不使用 | `<0 0 0>` | `<0 0 0>` |
| `gpio_oth` | uint32 | sensor 其他 GPIO（reset/XSHUTDN），0 = 不使用 | `<411>` / `<412>` | 不配置（reset 由加串器 MFP 控制） |
| `lpwm_chn` | uint32/array | LPWM 通道号，用于触发曝光同步 | `<6>` / `<7>` | `<0 1>` / `<2 3>` / `<12 13>` / `<14 15>` |
| `rx_phy` | array | PHY 配置：第 1 个值 1=DPHY / 2=CPHY；第 2 个值为 RX 端口号 | `<1 4>` / `<1 5>` | `<1 0>` / `<2 1>` / `<1 2>` / `<2 3>` |
| `poc_map` | uint32 | POC 与 Link 的映射，16bit | 不配置 | 在扩展板 dts 中定义（camsys v0p1 未含） |

:::

#### 如何配置

配置 vcon 节点需要以下信息（从硬件原理图和 pin list 获取）：

1. **确定 vcon 端口号**：sensor 接到哪个 MIPI RX，vcon 号与 RX 号一致。
2. **确定 I2C bus 号**：sensor/解串器接到哪条 I2C 总线，从原理图读 i2c 编号。
3. **确定 GPIO 编号**：使用 hb_gpioinfo 和原理图 PinName 获取 GPIO 编号。
   - MIPI 直连：只需配 `gpio_oth`（sensor reset/power GPIO）。
   - GMSL/SerDes：需配 `gpio_poc`（POC 供电）、`gpio_des`（解串器 PWDNB）、`poc_map`（POC-Link 映射）。
4. **确定 LPWM 通道**：如需曝光同步，从原理图确认 LPWM 输出接到解串器的哪个 MFP。
5. **确定 PHY 类型**：从原理图确认 DPHY 还是 CPHY。

:::note
`poc_map` 的详细含义与配置说明见 [poc_map 是什么？如何配置？](./02_hbn/02_serdes/01_debug_config.md#poc_map-是什么如何配置)。
:::



**GPIO 连接与状态**

DES 与 SoC 之间有 GPIO 连接，调试前需确认部分 GPIO 的状态：

- DES 的 `PWDNB`：需要输出 1，使其工作。
- POC 的 `EN`（若有）：需要输出 1，使 sensor 有供电。

SoC 上各 GPIO 对应的索引请参考 GPIO 文档。可通过命令操作 GPIO：

```bash
#i2cdetect -y -r 3
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- 28 -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```

```bash
# DES 的 PWDNB：控制 管脚 SENSOR8_ERR 输出 GPIO452=1
echo 452 > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio452/direction
echo 0 > /sys/class/gpio/gpio452/value
sleep 0.1
echo 1 > /sys/class/gpio/gpio452/value
i2cdetect -y -r 3
```

```bash
# POC 的 POC_EN：控制 管脚 DES1_POC_EN 输出 GPIO433=1
echo 433 > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio433/direction
echo 0 > /sys/class/gpio/gpio433/value
sleep 0.1
echo 1 > /sys/class/gpio/gpio433/value
i2cdetect -y -r 3
```

```bash
# 使用 I2C 命令可控制 POC 连接的加串上电和下电：
i2ctransfer -y -f 3 w1@0x28 0x01 r1
#下电： 
i2cset -y 3 0x28 0x01 0x10
#上电：
i2cset -y 3 0x28 0x01 0x1F
```

此时一般可以读取到 加串器和sensor的地址

1. 如果是yuv sensor 一般sensor内部isp连接，可能读取不到 sensor 地址
2. 如果是raw sensor 通常可以读取到 加串器 和 sensor地址

```bash
# i2cdetect -y -r 3
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- 28 29 -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: 40 -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- 51 -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```

### 模组硬件信息

在点亮模组前，需向模组厂家（或供应商）拿到该模组的规格书，获取以下点亮关注的关键信息：

| 类型          | 信息                       | 示例                                                                                                  | 描述                         | 备注                                |
| ------------- | -------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------- |
| key component | Camera 模组 vendor         | SUNNY                                                                                                 | 模组厂家                     | 代码内部标识用                      |
|               | sensor 型号 vendor         | Onsemi AR0820                                                                                         | sensor 厂家及型号            | 库名称一般以 sensor 名取            |
|               | SER 加串器型号             | MAX96717                                                                                              | 加串器芯片型号               | 确认所用解串及相关配置              |
|               | 其他                       | xxx.pdf                                                                                               | Camera 的规格书文档          | 如可能，直接给文档                  |
| sensor        | 分辨率                     | 3840×2160                                                                                             | 点亮目标要用的分辨率         | 需与配置对应                        |
|               | 帧率                       | 30fps                                                                                                 | 点亮目标要用的帧率           | 需与配置对应                        |
|               | 数据类型                   | RAW12                                                                                                 | 点亮目标要用的数据类型       | SerDes 及 MIPI 配置需要             |
|               | CFA                        | RGGB                                                                                                  | sensor 实际输出的 pattern    | ISP 适配需要                        |
|               | HDR 模式                   | HDR3 PWL12                                                                                            | 是否支持 HDR，何种方式       | 点亮与 tuning 配置需要              |
|               | 其他                       | 1/2 inch 等                                                                                           | 其他信息                     | 点亮不关注                          |
| lens          | FOV                        | HFOV: 120 / VFOV: 43.9 / DFOV: 127                                                                    | 实际模组的 Fov               | Tuning 菜单适配                     |
|               | 其他                       | 5.07, %3mm 等                                                                                         | 其他信息                     | 点亮不关注                          |
| PCB           | 供电范围                   | 7-16V                                                                                                 | 模组支持的供电               | 判断板级硬件是否适配                |
|               | 典型供电                   | 12V                                                                                                   | 典型使用供电                 | POC 适配                            |
|               | 晶振时钟（sensor）         | 25MHz                                                                                                 | sensor 的时钟输入            | sensor 内 PLL 配置计算需要          |
|               | 晶振时钟（SER）            | 25MHz                                                                                                 | SER 的时钟输入               | SER 内使用，不太关注                |
|               | sensor 与 SER 的 MIPI 连接 | D0~D3 - D0~D3, CLK - CLK                                                                              | sensor 与 SER 间的 MIPI 连接 | 主要关注是否要重新 map              |
|               | LINK PHY                   | GMSL2 6Gbps                                                                                           | SER 的默认速率               | SER 与 DES 之间 Link 适配           |
|               | I2C 地址信息               | sensor: 0x20, SER: 0x80, EEPROM: 0xA0                                                                 | I2C 访问设备的地址           | 调试配置需要                        |
|               | GPIO 连接                  | SER MFP0 - sensor SYS_CHECK, MFP1 - TEMP, MFP2 - FSYNC, MFP8 - RESET, MFP9 - I2C-SDA, MFP10 - I2C-SCL | SER 与 Sensor 之间的 GPIO    | 部分操作需要：sensor 复位、曝光同步 |
|               | 原理图                       | xxx.pdf                                                                                               | Camera 的原理图              | 如可能，直接给文档                  |
| Mech          | Camera 尺寸                | 30×67×42 mm                                                                                           | 机械结构尺寸信息             | 装车需要，点亮不关注                |
|               | 其他                       | xxx.pdf                                                                                               | 机械设计文档                 | 如可能，直接给文档                  |
| Docs          | sensor 用户手册            | xxx_user_guide.pdf                                                                                    | 用户手册，描述如何使用       | 尽量要有                            |
|               | sensor 寄存器手册          | xxx_datasheet.pdf                                                                                     | 寄存器手册，具体功能说明     | 一定要有                            |
|               | SerDes 手册                | xxx.pdf                                                                                               | SerDes 的寄存器手册等        | 新 SerDes 一定要有，已有的尽量要有  |
| Demo          | sensor 配置                | ar0820_hdr3_30fps.txt                                                                                 | 点亮目标模式帧率的配置       | 一定要有                            |
|               | SerDes 配置                | max96717_max9296_cfg.txt                                                                              | 实际所用 SerDes 的参考配置   | 尽量要有                            |

:::tip
上述信息是接入点亮工作的第一步准备，需从供应商处拿到准确匹配的信息。可在实际点亮前，由项目按上述要求发给供应商提前准备。
:::

### 硬件状态确认

在了解到上述硬件信息之后，搭建环境准备调试：

**连接硬件**

:::doc_scope{products="RDK S100"}
以下以 S100 RDK 上 RX4（MAX96712-LinkA），连接 AR0820 模组为例：
:::

:::doc_scope{products="RDK S600"}
以下以 S600 RDK 上 RX0（MAX96712-LinkA），连接 AR0820 模组为例：
:::

实际连接要求请根据具体硬件与模组要求，参考上述方式完成。

**确认状态**

连接完成后，扫描 I2C 总线上设备是否正常。

:::doc_scope{products="RDK S100"}
S100 以 **RX4 / I2C3** 为例（POC @0x28、MAX96712 @0x29），下方命令中 `bus=3`。
:::

:::doc_scope{products="RDK S600"}
S600 以 **RX0 / I2C0** 为例（POC @0x28、MAX96712 @0x29），下方命令中 `bus=0`。
:::

下方命令统一用 `bus` 变量，按上述平台取值（S100=3，S600=0）：

```bash
bus=3   # S100=3 (RX4/I2C3)，S600=0 (RX0/I2C0)
# 扫描总线上的设备:
i2cdetect -y -r $bus
# 此处有: 0x28-MAX20087(POC), 0x29-MAX96712
```

若 DES 不识别，请检查其 `PWDNB` 状态是否已置 1，参见上节 GPIO 部分。

若识别不到 SER 与 sensor，先检查 POC 供电是否正常，若不正常请检查硬件：

```bash
# 查看 POC(MAX20087) 的 Camera 电压:
i2cset -y -f $bus 0x28 0x01 0x9f; i2cget -y -f $bus 0x28 0x06 >/dev/null
echo "POC Camera = $((`i2cget -y -f $bus 0x28 0x06` * 70))mV"
# 正常约为 12V 左右（参考板级硬件设计），输出如下：
# POC Camera = 11830mV
```

若 Camera 电压正常，请检查 POC 的 `EN` 状态是否已置 1，参见上节 GPIO 部分。

若供电正常，仍未识别到 SER 与 sensor，需确认 SerDes（Maxim）的 **Link 速率是否匹配**：不匹配的无法正常 Link Lock，也就无法 I2C 访问，可通过寄存器修改 DES 速率适配：

```bash
# 如 MAX96712(0x29) 的 Link 配置为 3Gbps:
i2ctransfer -y -f $bus w4@0x29 0x00 0x10 0x11 0x11
# 如其他硬件上的 MAX9296(0x48) 的 Link 配为 3Gbps:
i2ctransfer -y -f $bus w3@0x48 0x00 0x01 0x01
```

之后正常应该能识别到 SER，此时若仍不能识别 sensor，检查是否有 **RESET 需要拉起**：

```bash
# 如 MAX9295A 的 MFP8(0x2D6) 连接到 sensor 的 RESET 上，手动将其拉高:
i2ctransfer -y -f $bus w3@0x40 0x02 0xd6 0x10
# 也可手动拉低验证（应该就看不到 0x18 上）:
i2ctransfer -y -f $bus w3@0x40 0x02 0xd6 0x00
```

若一切正常，此时可手动读写 sensor 寄存器（请参考具体 sensor 手册）：

```bash
# 如向 AR0820(0x18) 的寄存器 0x3002 写 0x0002:
i2ctransfer -y -f $bus w4@0x18 0x30 0x02 0x00 0x02
# 之后读取:
i2ctransfer -y -f $bus w2@0x18 0x30 0x02 r2
# 值正常为刚写入值:
# 0x00 0x02
```

此时硬件状态基本 OK，可以进行编码调试。

:::note
以上为 sensor 调试前的一般确认步骤，实际根据板级不同确认部分可能有所差异。但该确认动作建议一定要提前做，避免后续调试异常再返回来查硬件。
GMSL sensor mclk 一般由加串器输出，HBN 需要在 sensor 驱动代码中配置（`serial_rclk_out` / `rclk_mfp`），参考 [Sensor 配置调试说明 - emode_data 配置](/Advanced_development/multimedia_development/multimedia_api/sensor_bringup/bringup/hbn/serdes/debug_config#emode_data-配置)。
:::
