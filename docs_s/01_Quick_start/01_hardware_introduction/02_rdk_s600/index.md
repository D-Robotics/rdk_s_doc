---
sidebar_position: 4
---

# 1.1.2 RDK S600 系列

![image-rdk_600_mainboard_overview](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_600_v0p1_mainboard_overview.png)

:::danger 注意

1. 本产品仍处于研发阶段，所述内容可能会有变更。

:::

:::warning 警告

1. RDK S600 使用外接电源，需满足相关地区的法规标准。
2. 本产品应在通风良好的环境中使用，在密闭空间使用时，需要做好散热措施。
3. 使用时，本产品应放置在稳固、平坦、不导电的表面上。
4. 将不兼容的设备与 RDK S600 连接时，导致设备损坏，将不支持维修。
5. 所有与本产品配套使用的外围设备均应符合使用国家的相关标准，并标明相应地确保满足安全和性能要求。 外围设备包括但不限于与 RDK S600 结合使用时的键盘、显示器和鼠标。
6. 与本产品一起使用的所有外围设备的电缆和连接器必须有足够的绝缘，以便相关的满足安全要求。

:::

:::warning 安全守则

为避免本产品发生故障或损坏，请遵守以下事项：

1. 运行时，请勿接触水或湿气，或放置在导电物体表面上，不要接触任何热源，以确保本品在正常环境温度下可靠运行。
2. 装配时，避免对印刷电路板和连接器造成机械或电气损坏。
3. 通电时，避免手触摸印刷电路板及设备边缘，减少静电放电损坏的风险。

:::

:::info 提示

对于有独立外部供电的外设，开发板需要先上电，然后外设再上电，若外设早于 S600 开发板先上电且对主板有电源倒灌的情景时，开发板可能会触发保护状态无法启动。

:::

## 产品介绍

地瓜机器人 RDK S600 系列开发者套件搭载 S600 智能计算芯片，BPU 可提供高达 560TOPS 的算力，是一款面向智能计算与机器人应用的开发板，接口丰富，极致易用，独特的异构设计可以同时兼顾感知推理和实时运动控制的需求，减少控制系统的体积和复杂度。

### 主要功能

| 类别           | 规格                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CPU**        | • 18x Arm® Cortex®-A78AE CPU 2.0GHz                                                                                                                                                                                                                                                                                                                                                      |
| **MCU**        | • 6x Arm® Cortex®-R52+ MCU (1× DCLS, 2× Split-Lock)                                                                                                                                                                                                                                                                                                                                      |
| **BPU**        | • 4x BPU Nash core provides up to 560 TOPS                                                                                                                                                                                                                                                                                                                                               |
| **Memory**     | • 32/64GB LPDDR5, 256-bit, up to 6400MT/s                                                                                                                                                                                                                                                                                                                                                |
| **Storage**    | • 64/256GB UFS 3.1<br />• M.2 Key M Connector for NVMe SSD                                                                                                                                                                                                                                                                                                                               |
| **USB**        | • 6x USB 3.2 Gen 1x1 Type-A<br />• 1x USB 2.0 Type-C (for flashing and debugging)                                                                                                                                                                                                                                                                                                        |
| **Network**    | • M.2 Key E Connector for WIFI&BT Module<br />• 2x 1GbE RJ45 Ports<br />• 2x 10GbE RJ45 Ports<br />• 1x 1GbE RJ45 Ports (MCU-Domain)                                                                                                                                                                                                                                                     |
| **Display**    | • 1x HDMI 2.1                                                                                                                                                                                                                                                                                                                                                                            |
| **Expansion**  | • 2x Camera Expansion Connector<br />• 1x MCU Port Expansion Connector                                                                                                                                                                                                                                                                                                                   |
| **Connectors** | • 1x 2-pin RTC Battery Connector<br />• 1x 4-pin Fan Connector<br />• 1x 12-pin Automotive Connector<br />• 1x JTAG Debug Connector (for Main and MCU)<br />• 1x 12-pin MCU-Domain CAN(5x) Connector<br />• 1x 10-pin Main-Domain CAN(4x) Connector<br />• 1x 10-pin MCU-Domain UART(2x) & Main-Domain UART(2x) Connector<br />• 1x 10-pin PCM Connector<br />• 2x 22-pin MIPI Connector |
| **Power**      | • 12–28V<br />• 4-pin Connector                                                                                                                                                                                                                                                                                                                                                          |
| **Size**       | • 140mm x 123mm x 78mm                                                                                                                                                                                                                                                                                                                                                                   |

### 型号说明

| 产品名称     | 型号        | 内存        | 存储      | 备注     |
| ------------ | ----------- | ----------- | --------- | -------- |
| RDK S600 32G | KS6X032064C | 32GB LPDDR5 | 64GB UFS  | 正式型号 |
| RDK S600 64G | KS6X064256C | 64GB LPDDR5 | 256GB UFS | 正式型号 |
| RDK S600 32G | KS6X032256C | 32GB LPDDR5 | 256GB UFS | 测试型号 |

### 拓扑图

TODO

### 接口图

![image-rdk_600_mainboard](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_v0p1_mainboard_interface.png)

| 序号     | 功能                      | 序号 | 功能                  | 序号 | 功能              |
| -------- | ------------------------- | ---- | --------------------- | ---- | ----------------- |
| D59      | System 灯                 | J11  | MIPI 相机接口         | J22  | 主板功能接口      |
| D60      | Power 灯                  | J12  | 相机扩展接口          | K1   | RST 弯扭          |
| D61      | Flash 灯                  | J13  | MIPI 相机接口         | K2   | WAKE 按钮         |
| J1       | 主板供电接口              | J14  | 相机扩展接口          | SW2  | 烧录开关          |
| J2       | 699-Pin B2B Connector     | J15  | MCU 扩展接口          | SW3  | 电源开关          |
| J3       | JTAG 接口 (MCU&MAIN)      | J16  | MCU-CAN 接口          | SW6  | MCU-CAN 电阻选择  |
| J4       | 闪连(烧录，Main&MCU 调试) | J17  | MAIN-CAN 接口         | SW7  | MAIN-CAN 电阻选择 |
| J5       | M.2 Key E 接口            | J18  | UART 接口（MAIN&MCU） | U44  | 2x 1GbE           |
| J6       | M.2 Key M 接口            | J19  | PCM+I2C 接口          | U45  | 2x 10GbE          |
| J7/J8/J9 | USB3.0 Type-A 接口        | J20  | RTC 电池接口          | U80  | 1x 1Gbe (MCU)     |
| J10      | HDMI 接口                 | J21  | 风扇接口              |      |                   |

## 接口说明

接口定义（Excel）: TODO

### 主板供电接口 (J1)

TODO

:::info

- 支持 12V-28V 输入，最大电流 XXX，使用 4-pin Microfit Connector。

:::

### 699-Pin B2B Connector (J2)

:::info

- 采用 Molex 699-Pin 连接器

:::

### JTAG 接口 MCU&MAIN (J3)

TODO

### 闪连 烧录，Main&MCU 调试 (J4)

TODO
USB Type-C(J16)仅用于烧录和调试使用，不是一个标准的全功能 USB Type-C 口，包含如下功能：

- 调试串口。硬件上通过 2 颗`CH340`芯片将核心模组 Main 域与 MCU 域的调试串口转换为 USB 接口，用户可使用该接口进行各种调试工作。用户第一次使用该接口时需要在电脑上安装 CH340 驱动，用户可搜索`CH340串口驱动`关键字进行下载、安装。电脑串口工具的参数需按如下方式配置：

  - 波特率（Baud rate）：921600
  - 数据位（Data bits）：8
  - 奇偶校验（Parity）：None
  - 停止位（Stop bits）：1
  - 流控（Flow Control）：无

- USB 下载接口。RDK S600 开发板提供的一路下载接口用于固件下载，具体可以参考[1.2 系统烧录](../02_install_os/rdk_s600.md)

:::tip
RDK S600 开发板提供的 USB Type-C 口仅支持 Device 模式。
:::

### M.2 Key E 接口 (J5)

默认用于连接支持 PCIe 的 Wi-Fi 和四线 UART 的 BT 模组，PCIE 支持 Gen3x1，未提供 SDIO 接口，无 LED 和 ALERT 信号。

:::warning 注意

对于 V0P1 硬件

1. 不支持采用 SDIO 协议的 Wi-Fi 卡
2. 不支持 PCM 音频

:::

:::info

1. 若需要支持 Wi-Fi/Bluetooth 休眠唤醒 S600 的功能，请联系地瓜工程师支持。
2. 当系统处于 light sleep 和 deep sleep 模式时，VDD_AON_PERI_3V3 电源保持供电，最大供电电流为 750mA。

:::

### M.2 Key M 接口 (J6)

用于接 PCIe 固态硬盘，支持 Gen3x1，有 ALERT 信号，无 LED 信号。

:::info

1. 不支持休眠唤醒功能。
2. I2C4 默认已用于 M.2 KEY M 接口、RTC IC 及 风扇(FAN)转速控制 IC 的通讯，RTC IC 和 风扇转速控制 IC 的 I2C 地址分别为 0X32 和 0X2F（不含读写位）。
3. 当系统处于 light sleep 和 deep sleep 模式时，VDD_PERI_3V3 电源关闭，最大供电电流为 700mA。

:::

### USB3.0 Type-A 接口 (J7/J8/J9)

RDK S600 开发板提供了六路 PCIE 拓展出来的 USB3.0 标准接口，可以满足 6 路 USB 外设同时接入使用，每一路 USB 3.0 接口均支持最大 5V/1A 的输出功率。

:::tip

1. RDK S600 开发板提供的 USB 3.0 接口仅支持 Host 模式。
2. 注意[USB2.0 Camera 接入能力限制](/rdk_s/Basic_Application/Image/usb_camera#usb20摄像头接入说明)。
   :::

### HDMI 接口 (J10)

RDK S600 开发板提供一路 HDMI 显示接口，最高支持 2k 60 帧的显示模式。开发板上电后会通过 HDMI 接口输出 Ubuntu 图形界面，配合特定的示例程序，同时还支持摄像头、视频流画面的预览显示功能。

### MIPI 相机接口 (J11/J13)

RDK S600 包含 2 个相机扩展接口，可以接入单目或者双目相机。

### 相机扩展接口 (J12/J14)

RDK S600 主板包含二个相机扩展接口

### MCU 扩展接口 (J15)

RDK S600 主板包含一个 MCU 接口扩展接口。

### MCU-CAN 接口 (J16)

该接口具有 5 路 MCU 域的 CAN 接口，其中 120Ω 电阻可以通过 SW6 开关控制是否接入

### MAIN-CAN 接口 (J17)

:::warning 注意

- 该接口暂不可用，等待驱动更新

:::

该接口具有 4 路 MCU 域的 CAN 接口，其中 120Ω 电阻可以通过 SW7 开关控制是否接入

### UART 接口 MAIN&MCU (J18)

:::warning 注意

- V0P1 硬件，MAIN 域的 UART 不可用

:::

该接口具有 2 路 MCU 域和 2 路 MAIN 域的 UART 接口

### PCM+I2C 接口 (J19)

:::warning 注意

- V0P1 硬件该接口不可用

:::

该接口具有 2 路 PCM 和 1 路 I2C 接口，用于接入音频相关功能子卡

### RTC 电池接口 (J20)

RTC 电池接口

### 风扇接口 (J21)

FAN Connector 用于连接散热风扇，支持风扇转动速率控制。

:::info 提示

1. 12V 最大供电电流为 200mA，当系统处于 light sleep 和 deep sleep 模式时，VDD_PERI_12V 电源关闭。

:::

### 主板功能接口 (J22)

RDK S100 主板有一个 Automatic EXT CTRL Connector 12-Pin 连接器，主要作用如下：

- 将主板上的系统运行灯、电源指示灯拓展到主板外部，以便观察主板处于何种工作状态。
- 将烧录开关、休眠按键、复位按键、电源开关拓展到主板外部，便于整机装机后人工操作。

:::info 提示

1. 绿灯用于指示主板小系统是否完成上电，橙灯用于指示主板 Main 域系统是否正常运行。
2. Automatic EXT CTRL Connector 12-Pin 接口供电仅允许连接功能描述中涉及的电路，禁止连接大功耗负载。
3. 当系统处于 light sleep 和 deep sleep 模式时，VDD_AON_PERI_5V 和 DCIN_CONN 电源保持供电，VDD_PERI_3V3 电源关闭，外接子板时需预留短路保护电路，防止主板因外接子板短路导致供电异常。
4. VDD_AON_PERI_5V, DCIN_CONN，VDD_PERI_3V3 电源对外输出最大电流分别为 50mA，5mA，100mA。

:::

### 2x 1GbE (U44)

两路千兆以太网接口，兼容 1000BASE-T 和 100BASE-T 标准，支持自动协商速率切换。

| 位置 | 标识 | 功能说明                             | IP 配置方式                  | 默认 IP 地址   |
| ---- | ---- | ------------------------------------ | ---------------------------- | -------------- |
| 下   | eth0 | 通用以太网接口，需用户配置 IP 地址   | 外部 DHCP 分配或手动静态配置 | 无             |
| 上   | eth1 | 管理或专用通信接口，内置静态 IP 地址 | 固定静态 IP                  | 192.168.127.10 |

### 2x 10GbE (U45)

:::warning 注意

暂不可用，请等待驱动更新

:::

两路万兆以太网接口

### 1x 1GbE MCU (U80)

MCU 域千兆网口

## 开关、按键和灯光说明

### 指示灯（D59/D60/D61）

| 位号 | 名称      | 熄灭         | 常亮         | 闪烁         |
| ---- | --------- | ------------ | ------------ | ------------ |
| D59  | System 灯 | 系统异常     | 系统异常     | 系统运行正常 |
| D60  | Power 灯  | 电源关闭     | 电源开启     | -            |
| D61  | Flash 灯  | 正常启动模式 | DFU 烧录模式 | -            |

### 开关（SW2/SW3）

| 位号 | 名称     | OFF          | ON           | 备注         |
| ---- | -------- | ------------ | ------------ | ------------ |
| SW2  | 烧录开关 | 正常启动模式 | DFU 烧录模式 | 使用跳帽控制 |
| SW3  | 电源开关 | 电源关闭     | 电源开启     | △ 位置为 ON  |

### 拨码开关（SW6/SW7）

| 位号 | 名称           | OFF | ON  | 备注 |
| ---- | -------------- | --- | --- | ---- |
| SW6  | MCU-CAN1 120Ω  | OFF | ON  | -    |
|      | MCU-CAN2 120Ω  | OFF | ON  | -    |
|      | MCU-CAN3 120Ω  | OFF | ON  | -    |
|      | MCU-CAN4 120Ω  | OFF | ON  | -    |
|      | MCU-CAN5 120Ω  | OFF | ON  | -    |
| SW7  | MAIN-CAN1 120Ω | OFF | ON  | -    |
|      | MAIN-CAN2 120Ω | OFF | ON  | -    |
|      | MAIN-CAN3 120Ω | OFF | ON  | -    |
|      | MAIN-CAN4 120Ω | OFF | ON  | -    |

### 按钮（K1/K2）

| 位号 | 名称      | OFF          | ON           | 备注         |
| ---- | --------- | ------------ | ------------ | ------------ |
| K1   | RST 按钮  | 正常启动模式 | DFU 烧录模式 | 使用跳帽控制 |
| K2   | WAKE 按钮 | 电源关闭     | 电源开启     | △ 位置为 ON  |
