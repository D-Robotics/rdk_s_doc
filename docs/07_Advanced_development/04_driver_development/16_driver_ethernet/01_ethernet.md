---
sidebar_position: 1
title: "Ethernet"
description: "RDK S100/S600 以太网控制器：设备树配置、常用命令、PPS/PHC/gPTP 时间同步与 TSN 特性"
---
# Ethernet

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 前言
<DocScope products="RDK S100">
S100芯片提供多个标准千兆/万兆以太网控制器，支持传统的以太网报文收发，PTP/TSN 时间敏感性网络，以及 EtherCAT 主站等特性。
</DocScope>
<DocScope products="RDK S600">
S600芯片提供多个标准千兆/万兆以太网控制器，支持传统的以太网报文收发，PTP/TSN 时间敏感性网络，以及 EtherCAT 主站等特性。
</DocScope>
控制器内置硬件多队列、MTL 二层传输层、DMA 引擎等，以实现上述各种场景的报文收发。
本文主要包括网卡使用指南、开发板 Bringup、关键特性描述等。

- **定位**：说明以太网控制器（GMAC/XGMAC）的硬件连接、设备树配置、常用命令、时间同步（PPS/PHC/gPTP）与 TSN 特性，以及调试与问题排查方法。
- **适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要调试网卡驱动、TSN/PTP/EtherCAT 或板级 Bringup 的 BSP/驱动工程师。
- **前置条件**：已烧录 RDK OS 并可登录板端（SSH 或调试串口）；了解 Linux 网络子系统与时间同步基础。
- **与其他模块关系**：本驱动是网络配置、EtherCAT（Linux 侧）、时间同步（PTP/gPTP）的底层实现。网络配置参见 [网络配置](../../../02_System_configuration/01_network_config.md)，EtherCAT 参见 [EtherCAT（Linux 侧）](./02_ethercat.md)。

## 名词解释
| 缩略语 | 英文全名                          | 中文解释             |
| ------ | --------------------------------- | -------------------- |
| PTP    | Precision Time Protocol           | 精确时钟协议         |
| PHC    | PTP Hardware Clock                | PTP 时钟              |
| TSN    | Time-Sensitive Networking         | 时间敏感网络         |
| CBS    | Credit-Based Shaper               | 基于信用的整形器机制 |
| EST    | Enhancements to Scheduled Traffic | 增强型整形机制       |
| FPE    | Frame Preemption                  | 帧抢占               |
| tc     | traffic control                   | 流量控制             |

## 网卡特性介绍
<DocScope products="RDK S100">

| 特性    | 解释               | S100                             |
| ------  | -----------------  | -------------------------------- |
| 配置    | 网口数量配置       | 双网口                           |
| 接口    | mac--phy 接口       | 支持 SGMII                        |
| PPS     | 秒脉冲, pps out/in | &#x2705;                         |
| TSO     | TCP 分段卸载       | &#x2705;                         |
| 多队列  | 网卡多队列功能     | &#x2705;                         |
| AVB/TSN | 时间敏感性网络     | &#x2705;                         |
| C22/C45 | MDIO PHY 数据协议   | &#x2705;                         |

</DocScope>
<DocScope products="RDK S600">

| 特性    | 解释               | S600                                          |
| ------  | -----------------  |  --------------------                          |
| 配置    | 网口数量配置       | 3x gmac + 3x xgmac<br/>其中前2个 gmac 和 pcie 复用 phy |
| 接口    | mac--phy 接口       |  支持 SGMII/USXGMII                             |
| PPS     | 秒脉冲, pps out/in |  &#x2705;                                      |
| TSO     | TCP 分段卸载       |  &#x2705;                                      |
| 多队列  | 网卡多队列功能     |  &#x2705;                                      |
| AVB/TSN | 时间敏感性网络     |  &#x2705;                                      |
| C22/C45 | MDIO PHY 数据协议   |  &#x2705;                                      |
</DocScope>


## 软件介绍<a id="chap_code_position"></a>
### 驱动代码

S100 与 S600 共用同一份源码树，通过各自的编译配置选择参与编译的驱动；以下路径均相对 SDK 源码根目录 `source/`。

- U-Boot 以太网驱动：`bootloader/uboot/drivers/net/`

```
hobot_super_gmac.c        # GMAC 驱动
hobot_super_xgmac.c       # XGMAC 驱动
hobot_super_xpcs.c        # XPCS 驱动（S100）
hobot_super_xpcs.h
hobot_s600_xpcs.c         # XPCS 驱动（S600）
```

| 编译配置 | 对应驱动 | 适用产品 |
|----------|----------|----------|
| `CONFIG_HOBOT_SUPER_GMAC` | `hobot_super_gmac.c` | S100 / S600 |
| `CONFIG_HOBOT_SUPER_XGMAC` | `hobot_super_xgmac.c` | S600 |
| `CONFIG_HOBOT_SUPER_XPCS` | `hobot_super_xpcs.c` | S100 |
| `CONFIG_HOBOT_S600_XPCS` | `hobot_s600_xpcs.c` | S600 |

编译配置见 `bootloader/uboot/configs/hobot_s600_defconfig` 与 `hobot_s100_defconfig`。

- Linux 以太网驱动：`hobot-drivers/ethernet/hobot/`

```
hobot_eth_super_main.c    # 驱动主体：probe、netdev 操作集、ethtool、TSN 私有 ioctl
hobot_eth_super_mdio.c    # MDIO 总线注册与 C22/C45 PHY 读写
hobot_eth_super_ptp.c     # PTP/PHC 时间戳与 PPS（含 flex PPS）
hobot_eth_super_tc.c      # TSN 流量整形：CBS、EST（taprio）
hobot_eth_selftests.c     # ethtool -t 自检（MAC/PHY loopback）
hobot_veth_super_main.c   # 虚拟以太网（vethernet）
core/hobot_gmac_core.c    # GMAC 控制器操作集
core/hobot_xgmac_core.c   # XGMAC 控制器操作集
core/hobot_xpcs.c         # XPCS/PCS 与 hsis（hsi-mode、xpcs-speed、txeq/vboost）
core/hobot_gmac_mmc.c     # GMAC MMC 统计
core/hobot_xgmac_mmc.c    # XGMAC MMC 统计
dma/hobot_gmac_dma.c      # GMAC DMA 与描述符
dma/hobot_xgmac_dma.c     # XGMAC DMA 与描述符
```

| 内核模块 | 配置项 | 说明 |
|----------|--------|------|
| `hobot_eth_super.ko` | `CONFIG_HOBOT_ETH` | 以太网驱动主体 |
| `hobot_xpcs_super.ko` | `CONFIG_HOBOT_ETH_XPCS` | XPCS 驱动 |
| `hobot_veth_super.ko` | `CONFIG_HOBOT_VETH` | 虚拟以太网 |

编译配置见 `hobot-drivers/configs/drobot_s600_defconfig` 与 `drobot_s100_defconfig`：S600 默认开启 `CONFIG_HOBOT_ETH` 与 `CONFIG_HOBOT_ETH_XPCS`，未开启 `CONFIG_HOBOT_VETH`。

板端可用 `lsmod` 查看已加载的模块，模块文件位于 `/lib/modules/$(uname -r)/hobot-drivers/ethernet/hobot/`。

### U-Boot ETH 驱动开发
#### 硬件连接
<DocScope products="RDK S100">
- 参考 S100设计原理图
</DocScope>
<DocScope products="RDK S600">
- 参考 S600设计原理图
</DocScope>

#### 设备树配置
<DocScope products="RDK S100">
```dts
    // 配置hsis mode以及参考时钟选择, 如combo phy的复用情况, 参考时钟的来源等。
    hsis0: hsis0 {
        status = "okay";
        compatible = "drobot,super-hsis";
        hsi-mode = <4>; /* 4:pcie x2 + gmac0/1; 8:pcie0 x1 + pcie1 x1 + GMAC0/1; */
        refclk-mode = <0>; /* 0:internal ref clock; 1:external ref clock; */
        #address-cells = <2>;
        #size-cells = <2>;
        ranges;
        /*hsis reg, XPCS0, XPCS1, ETH phy, PCIE phy*/
        reg = <0x0 0x33000000 0x0 0x10000>,
            <0x0 0x33200000 0x0 0x80000>,
            <0x0 0x33280000 0x0 0x80000>,
            <0x0 0x330e0000 0x0 0x10000>,
            <0x0 0x330d0000 0x0 0x10000>;
    };
```

</DocScope>
<DocScope products="RDK S600">
```dts
    // 配置hsis mode以及参考时钟选择, 如combo phy的复用情况, 参考时钟的来源, 以及phy眼图信号相关参数。
    hsis0: hsis0 {
        status = "okay";
        compatible = "drobot,super-hsis";
        hsi-mode = <4>;
        refclk-mode = <0>;/* 0:internal; 1:external; */
        xpcs-speed = <0 0 0 5000 10000 10000>; /*gmac0, gmac1, gmac2, xgmac0, xgmac1, xgmac2*/
        hobot-txeq = <0 0 0 1 2 4>; /* gmac0/1/2 xgmac0/1/2 tx equalization control*/
        hobot-vboost = <5 5 5 5 5 5>; /*gmac0/1/2 xgmac0/1/2*/
        #address-cells = <2>;
        #size-cells = <2>;
        ranges;
        /*hsis reg, XPCS0, XPCS1, ETH phy, PCIE phy, XPCS2, XPCS3,XPCS4, XPCS5*/
        reg = <0x0 0x33000000 0x0 0x10000>,
            <0x0 0x33200000 0x0 0x80000>,
            <0x0 0x33280000 0x0 0x80000>,
            <0x0 0x330e0000 0x0 0x10000>,
            <0x0 0x330d0000 0x0 0x10000>,
            <0x0 0x33300000 0x0 0x80000>,
            <0x0 0x33380000 0x0 0x80000>,
            <0x0 0x33400000 0x0 0x80000>,
            <0x0 0x33480000 0x0 0x80000>;
    };
```
- xpcs-speed:       根据不同的 speed 设置 xpcs。
- hobot-txeq:       设置不同档位的眼图参数，取值范围[0, 10]，默认是4档，sgmii 不需要调整。
- hobot-vboost:     眼图幅值系数，0不使能。

</DocScope>

#### mdio phy 配置
- phy 连接情况参考原理图和硬件说明
- 软件主要需要关注其中的 reset 管脚以及 phy addr 地址

<DocScope products="RDK S100">

```dts
    // drobot-s100-soc.dtsi, 芯片默认的eth配置; 可以被具体board的dts覆盖
    eth0: eth0 {
            status = "disabled";
            compatible = "hobot,hobot_gmac";
            /*MAC, XPCS, ETH PHY, PCIE PHY, hsis reg*/
            reg = <0x0 0x330f0000 0x0 0x10000>,
                    <0x0 0x33200000 0x0 0x80000>;
            phy-handle = <&phy1>;
            phy-mode = "sgmii";
            managed = "in-band-status";
            pinctrl-names = "default";
            pinctrl-0 = <&peri_emac>;
            #address-cells = <1>;
            #size-cells = <0>;
    };

    // drobot-s100-rdk.dts, 根据实际板子情况, 配置属性。 主要phy节点, reset管脚, phy addr等。
    // 以及mdio pinmux, function配置等。
    &eth0 {
        status = "okay";
        hobot,managed = "sgmii-autoneg";
        phy-handle = <&phy0>;
        phy-reset-gpios = <&hsi_port0 10 0>;
        #address-cells = <1>;
        #size-cells = <0>;
        phy0: phy@0 {
                compatible = "ethernet-phy-ieee802.3-c22";
                reg = <0xe>;
        };
    };
```
</DocScope>

<DocScope products="RDK S600">
```dts
    // hobot-s600-soc.dtsi, 芯片默认的eth配置。可以被具体board的dts覆盖
    eth2: gmac2 {
        status = "disabled";
        compatible = "hobot,hobot_gmac";
        /*MAC, XPCS*/
        reg = <0x0 0x33110000 0x0 0x10000>,
                <0x0 0x33380000 0x0 0x80000>;
        phy-mode = "sgmii";
        #address-cells = <1>;
        #size-cells = <0>;
        fixed-link {
                speed = <1000>;
                full-duplex;
        };
    };
    // drobot-s600-rdk.dts, 根据实际板子情况, 配置属性。 主要phy节点, reset管脚, phy addr等。
    // 以及mdio pinmux, function配置等。
    &eth2 {
        status = "okay";
        hobot,managed = "sgmii-autoneg";

        phy-handle = <&phy2>;
        pinctrl-names = "default";
        pinctrl-0 = <&hsi_emac_mdc_hsi2_emac_mdc_hsi2 &hsi_emac_mdio_hsi2_emac_mdio_hsi2>;
        phy2: phy@2 {
                #address-cells = <1>;
                #size-cells = <0>;
                reset-gpios = <&gpio_exp_24 8 GPIO_ACTIVE_LOW>;
                reset-delay-us = <10000>;
                reset-post-delay-us = <150000>;
                compatible = "ethernet-phy-ieee802.3-c22";
                reg = <0x2>;
        };
    };
```

</DocScope>

#### MAC2MAC

MAC2MAC 指两个 MAC 直接相连、中间没有 PHY 的场景：例如板内 SoC 与 SoC、FPGA 或交换芯片直连，或两块板卡的网口背靠背直连。这种情况下没有 MDIO 可读、也没有自协商过程，必须由软件把链路参数固定下来，即在设备树中配置 `fixed-link`（固定速率与双工模式）。

- 例如：

<DocScope products="RDK S100">
```dts
    // eth0默认节点配置可参考drobot-s100-soc.dts
    // 实际板级配置可在对应dts中描述, 例如可参考drobot-s100-rdk.dts。
    // MAC2MAC场景, 主要就是配置成fixed-link模式。即固定好速率, 双工模式等。
    &eth0 {
        status = "okay";
        fixed-link {
            speed = <1000>;
            full-duplex;
        };
    };
```
</DocScope>
<DocScope products="RDK S600">
```dts
    // S600开发板也类似, 在板级dts中重写成fixed-link模式即可。
    &eth3 {
        status = "okay";
        fixed-link {
            speed = <10000>;
            full-duplex;
        };
    };
```
</DocScope>

:::warning
`fixed-link` 中的 `speed` 与 `full-duplex` 必须与对端 MAC 的实际工作参数一致，否则会出现丢包或链路不通。
:::

#### U-Boot 下命令介绍

U-Boot 下常用的以太网调试命令如下，用于读写 PHY 寄存器、查看报文统计计数等。

- `mii`：读写 PHY 寄存器（C22 协议，通过当前 MII 设备访问）

```bash
mii device                            # 列出可用的 MII 设备
mii device <devname>                  # 切换当前 MII 设备
mii info   <addr>                     # 显示 PHY 信息（不指定 <addr> 时扫描 0~31）
mii read   <addr> <reg>               # 读取 PHY <addr> 的寄存器 <reg>
mii write  <addr> <reg> <data>        # 写入 PHY <addr> 的寄存器 <reg>
mii modify <addr> <reg> <data> <mask> # 按 <mask> 修改寄存器 <reg> 中的位
mii dump   <addr> <reg>               # 解析打印 <addr> <reg>（仅支持 reg 0~5）
```

`<addr>`、`<reg>` 支持范围写法，例如 `mii read 2-7 0`。

:::tip
`mii` 通过“当前 MII 设备”访问 PHY。若提示找不到设备，可先用 `mii device` 查看并切换；也可先执行一次网络命令（如 `ping`）触发网口初始化。`mdio` 命令内部会自动探测 MDIO 总线，无需先执行网络命令。
:::

- `mdio`：读写 PHY 寄存器（C45 协议）

```bash
mdio list                             # 列出 MDIO 总线
mdio read  <phydev> [<devad>.]<reg>   # 读取 PHY 寄存器
mdio write <phydev> [<devad>.]<reg> <data>   # 写入 PHY 寄存器
mdio rx    <phydev> [<devad>.]<reg>   # 读取 PHY 扩展寄存器
mdio wx    <phydev> [<devad>.]<reg> <data>   # 写入 PHY 扩展寄存器
```

`<phydev>` 可以是 `<总线名> <地址>`、`<地址>` 或 `<网口名>`（如 `eth0`）；`<devad>`、`<reg>` 支持范围写法，例如 `1-5.4-0x1f`。

- `md`：读取内存/寄存器内容，可用于查看报文统计计数

```bash
md[.b, .w, .l, .q] address [# of objects]
```

### Linux ETH 驱动开发
- 驱动代码在 hobot-drivers/ethernet 目录, 可参考[软件介绍](#软件介绍)的描述。
- 控制器驱动部分大部分不需要进行修改, 主要任务还是结合开发板硬件, 配置相关设备树。

#### hsis 模式配置
<DocScope products="RDK S100">
:::warning
- 由于 S100以太网和 pcie 的 phy 部分都有复用关系。所以特别需要注意 hsis 模块的配置。
- 包括 Lane 使用的配置, 以及参考时钟配置等。特别需要注意的是, 由于 U-Boot 中启动时也会配置一次,
- 所以需要确保 U-Boot 的 hsis 配置和 Kernel 是一致的。否则可能会导致实际 Lane 配置不对的情况。
:::
</DocScope>
<DocScope products="RDK S600">
:::warning
- 由于 S600以太网和 pcie 的 phy 部分都有复用关系。所以特别需要注意 hsis 模块的配置。
- 包括 Lane 使用的配置, 以及参考时钟配置等。特别需要注意的是, 由于 U-Boot 中启动时也会配置一次,
- 所以需要确保 U-Boot 的 hsis 配置和 Kernel 是一致的。否则可能会导致实际 Lane 配置不对的情况。
:::
</DocScope>
<DocScope products="RDK S100">
```dts
    &hsis0 {
            hsi-mode = <0x4>;  /* 0x1: pcie x4, 0x4: pcie x2 + gmac0 + gmac1, 0x8: pcie0 x1 + pcie1 x1 + gmac0 + gmac1 >
            refclk-mode = <0>; /* 0:internal; 1:external; */
    };
```
</DocScope>

<DocScope products="RDK S600">
```dts
    &hsis0 {
            hsi-mode = <2>;  /* 0x1: pcie x4, 0x2: pcie x2x2, 0x4: pciex2 + ethx2 */
            refclk-mode = <0>; /* 0:internal; 1:external; */

            xpcs-speed = <0 0 0 1000 10000 10000>;  /*gmac0, gmac1, gmac2, xgmac0, xgmac1, xgmac2*/
            hobot-txeq = <0 0 0 1 2 4>; /* gmac0/1/2 xgmac0/1/2 tx equalization control*/
            hobot-vboost = <5 5 5 5 5 5>; /*gmac0/1/2 xgmac0/1/2*/
    };
```
</DocScope>

#### 网卡和 PHY 配置
<DocScope products="RDK S100">
```dts
    // 芯片默认网卡节点可以参考drobot-s100-soc.dtsi
    // 板级相关的配置, 根据实际硬件连接情况来。例如传统sgmii phy模式的情况, 可参考rdk-v0p5.dtsi中的节点。
    &ethernet0 {
            status = "okay";
            phy-handle = <&phy0>;
            hobot,managed = "sgmii-autoneg";
            pinctrl-names = "default";
            pinctrl-0 = <&peri_emac>;
            mdio {
                    #address-cells = <0x1>;
                    #size-cells = <0x0>;
                    phy0: phy@0 {
                            compatible = "ethernet-phy-ieee802.3-c22";
                            reg = <0x2>;
                    };
            };
    };
```

</DocScope>
<DocScope products="RDK S600">
```dts
    // 芯片默认网卡节点可以参考drobot-s600-soc.dtsi
    // 板级相关的配置, 根据实际硬件连接情况来。例如传统sgmii phy模式的情况, 可参考rdk-s600-mcb.dtsi中的节点。
    /* gmac2 */
    &ethernet2 {
            status = "okay";
            phy-handle = <&phy2>;
            hobot,managed = "sgmii-autoneg";
            pinctrl-names = "default";
            phy-mode = "sgmii";
            pinctrl-0 = <&hsi_emac_mdc_hsi2_emac_mdc_hsi2 &hsi_emac_mdio_hsi2_emac_mdio_hsi2>;
            mdio {
                    #address-cells = <0x1>;
                    #size-cells = <0x0>;
                    reset-gpios = <&gpio_exp_24 8 GPIO_ACTIVE_LOW>;
                    reset-delay-us = <10000>;
                    reset-post-delay-us = <150000>;
                    phy2: phy@2 {
                            compatible = "ethernet-phy-ieee802.3-c22";
                            reg = <0x2>;
                    };
            };
    };
```
</DocScope>

#### MAC 和 PHY 常见配置
- 参考上述的设备树内容, 以及 dts 文件中的更完整信息
- 描述下常见的 phy 配置参数
    - reset-delay-us：表示复位时间。
    - reset-post-delay-us：表示解复位后延时时间（phy 从解复位到完成初始化的时间）。
    - ethernet-phy-ieee802.3-c22: mdio compatible 兼容名, 说明 phy mdio 走的是 C22协议。
    常见的如 RTL 千兆 phy 都支持这个协议。
    - ethernet-phy-ieee802.3-c45: mdio compatible 兼容名, 说明 phy mdio 走的是 C45协议。
    参考手册万兆 PHY, 以及一些高端 PHY 会走 C45协议。
- MAC 相关常见一些配置
    - sgmii-autoneg：配置 SGMII 自协商。
    - phy-mode: 与 phy 的连接方式。如 sgmii, usxgmii 等。
    - xpcs-speed: xpcs 工作速率, 例如配置成1000, 强制 xpcs 1G sgmii mode
    - hobot,xgmac_gmii: xgmac 工作在 gmii 模式
- 更多高级特性配置, 可参考后续章节

#### MAC2MAC

和 U-Boot 下类似，MAC2MAC 场景最主要就是把对应网口配置成 `fixed-link` 模式。前提是该网口未连接 PHY，即设备树中不配置 `phy-handle`，也不配置 `mdio` 子节点。

- 例如：

<DocScope products="RDK S100">
```dts
    // eth0默认节点配置可参考drobot-s100-soc.dts
    // 实际板级配置可在对应dts中描述, 例如可参考drobot-s100-rdk.dts。
    // MAC2MAC场景, 主要就是配置成fixed-link模式。即固定好速率, 双工模式等。
    &ethernet0 {
        status = "okay";
        fixed-link {
            speed = <1000>;
            full-duplex;
        };
    };
```
</DocScope>
<DocScope products="RDK S600">
```dts
    // S600开发板也类似, 在板级dts中重写成fixed-link模式即可。
    &ethernet2 {
        status = "okay";
        fixed-link {
            speed = <10000>;
            full-duplex;
        };
    };
```
</DocScope>

实际板级示例：S600 matrix 板的 `&ethernet2`（1000M 全双工）与 `&ethernet5`（10000M 全双工）使用 `fixed-link`；S100 的 `rdk-s100-v1-2.dts` 同样对 `&ethernet0` 配置了 `fixed-link`。若对端可通过带内（in-band）状态传递链路速率与双工，也可不配置 `fixed-link`，改用 `managed = "in-band-status"`（S600 matrix 板的 `&ethernet3`、`&ethernet4` 即为此配置）。

- fixed-link 常用节点含义描述
   - speed（整型，必须），表示链接速率，可设置为 10、100、1000。
   - full-duplex（布尔型，可选），表示双工方式，缺省是半双工方式。
   - pause（布尔型，可选），表示是否使能 pause，缺省禁止 pause。
   - asym-pause（布尔型，可选），表示是否使能 asym-pause，缺省禁止 asym-pause。
   - link-gpios（gpio-list，可选），表示可以通过 gpio 读取链接是否已启动。

#### TSO

TSO（TCP Segmentation Offload，TCP 分段卸载）把 TCP 报文的分段工作交给网卡硬件完成：内核一次下发较大的报文，由硬件按 MSS 切分成多个以太网帧发出，从而降低 CPU 占用。开启后这类报文由硬件分段，内核的软件分段路径（GSO，Generic Segmentation Offload）不再参与。

- 通过设备树属性 `hobot,tso` 使能。该属性为**布尔标记**，存在即开启；同时需要网卡硬件支持该能力（驱动会检查网卡 `TSOEN` 能力位，支持时启动日志打印 `TSO supported`）：

```dts
    ethernet3: xgmac0@0x33130000 {
        compatible = "hobot,hobot_xgmac";
        hobot,tso;                 // 开启 TSO
    };
```

- 关闭 TSO 需要**删除该属性**；写成 `hobot,tso = <0>` 不会关闭（驱动以 `of_property_read_bool` 判断属性是否存在）。
- 使能后该网口具备 `NETIF_F_TSO`、`NETIF_F_TSO6` 与 `NETIF_F_GSO_UDP_L4` 能力，可运行时用 `ethtool -K <interface> tso on/off` 临时开关，用 `ethtool -k <interface>` 查看当前状态。

以 S600 的 eth0 为例：

```console
root@hobot:~# ethtool -k eth0 | grep -E "tcp-segmentation|generic-segmentation"
tcp-segmentation-offload: on
        tx-tcp-segmentation: on
generic-segmentation-offload: on
```

<DocScope products="RDK S600">

#### XGMAC 配置成1G 模式
- 主要通过设备树 hsis, 以及独对应网卡节点进行配置, 例如
```dts
    hsis0: hsis0 {
        status = "okay";
        compatible = "drobot,super-hsis";
        xpcs-speed = <0 0 0 1000 10000 10000>; /*gmac0, gmac1, gmac2, xgmac0, xgmac1, xgmac2*/
    };
    ethernet3: xgmac0@0x33130000 {
        compatible = "hobot,hobot_xgmac";
        hobot,xgmac_gmii;
    };
```
- xpcs-speed:           配置1000前置 xpcs 工作在1G sgmii 模式
- hobot,xgmac_gmii:     强制 xgmac 工作在 gmii 模式下

</DocScope>

#### 中断聚合

中断聚合（interrupt coalescing）让网卡累积多个报文（或等待一段时间）后再产生一次中断，并把多个发送完成事件合并清理，以减少中断次数、降低 CPU 占用；代价是引入额外时延。对时延敏感的业务（如 TSN）可以通过关闭聚合换取更低的转发时延。

- 网卡默认开启中断聚合，默认参数为 `tx-frames = 15`、`rx-usecs = 50`。
- 通过设备树属性 `hobot,disable_coal` 关闭（布尔标记，存在即关闭）：

```dts
    ethernet3: xgmac0@0x33130000 {
        compatible = "hobot,hobot_xgmac";
        hobot,disable_coal;        // 关闭中断聚合
    };
```

- 也可以在运行时调整聚合参数。注意必须在网卡 DOWN 时设置，否则返回 `Device or resource busy`：

```bash
ip link set eth0 down
ethtool -C eth0 tx-frames 15 rx-usecs 50   # tx-frames ≤ 256；rx-usecs 取值范围 30~160
ethtool -c eth0                            # 查看当前聚合参数
ip link set eth0 up
```

:::tip
`hobot,disable_coal` 为可选调优项，当前 RDK S100/S600 板级设备树均未使用（即默认保持开启）。
:::

#### RSS

RSS（Receive Side Scaling，接收端缩放）是网卡硬件实现的接收负载均衡：硬件按报文五元组（源/目的 IP、源/目的端口、协议）计算 hash，把报文分发到不同接收队列，各队列由独立中断与 NAPI 线程处理，从而将接收负载分摊到多个 CPU 核。

- 使能条件：接收队列数大于 1、设备树配置了 `hobot,rss_en`，且控制器实现了 RSS 能力。
- 使能方式：

```dts
    ethernet4: xgmac1@0x33140000 {
        compatible = "hobot,hobot_xgmac";
        hobot,multi_irq;           // 多中断：为每个队列注册独立的 ISR
        hobot,rss_en;              // 使能 RSS
    };
```

- 验证：
    - `/proc/interrupts` 中可见每个队列的中断，命名形如 `ethN`、`ethN_tx_chnX`、`ethN_rx_chnX`；
    - `/sys/class/net/<interface>/queues/` 可查看实际队列数。


#### HSIS, XPCS

HSIS（High-Speed Interface Subsystem）是 SoC 的高速接口子系统，负责 SerDes/PHY 通道在 PCIe 与以太网之间的分配以及参考时钟选择；XPCS 是 MAC 与 SerDes 之间的 PCS（物理编码子层）IP，决定各控制器实际工作的速率。**由于以太网与 PCIe 复用 PHY，修改本节点会同时影响二者。**

<DocScope products="RDK S600">

- `hsi-mode`：通道分配模式，取值含义如下；RDK S600 板级使用 `2`。

| 取值 | 含义 |
|------|------|
| `0x1` | PCIe x4 |
| `0x2` | PCIe x2 + PCIe x2 |
| `0x4` | PCIe x2 + 以太网 x2 |
| `0x8` | PCIe x1 + PCIe x1 + 以太网 x2 |

- `refclk-mode`：参考时钟来源，`0` 为内部时钟，`1` 为外部时钟。
- `xpcs-speed`：6 个元素依次对应 gmac0、gmac1、gmac2、xgmac0、xgmac1、xgmac2 的 XPCS 速率，未使用的控制器填 `0`。
- `hobot-txeq`：发送均衡档位，取值 `0~10`，SGMII 不需要调整。
- `hobot-vboost`：眼图幅值系数，取值 `0~7`，`0` 表示不使能，超过 `7` 会被忽略。

配置示例：

```dts
    hsis0: hsis0 {
        status = "okay";
        compatible = "drobot,super-hsis";
        hsi-mode = <2>;
        refclk-mode = <0>;/* 0:internal; 1:external; */
        xpcs-speed = <0 0 0 1000 10000 10000>; /*gmac0, gmac1, gmac2, xgmac0, xgmac1, xgmac2*/
        hobot-txeq = <0 0 0 1 2 4>; /* gmac0/1/2 xgmac0/1/2 tx equalization control*/
        hobot-vboost = <5 5 5 5 5 5>; /*gmac0/1/2 xgmac0/1/2*/
    };
```

:::warning
- 开机阶段的 hsis/xpcs 配置实际由 **U-Boot** 的 hsis 节点完成；Linux 中的 hsis 配置仅用于休眠唤醒时恢复 hsi-mode 与 xpcs 模式。
- 因此修改 hsis 配置时，必须同步修改 U-Boot 的 hsis 节点，否则会出现实际通道配置与预期不一致。
- `reg` 的顺序为 XPCS4、XPCS5、XPCS3、XPCS0、XPCS1、XPCS2（驱动内部再映射到 gmac/xgmac），照抄板级 dtsi 即可，不要随意调整顺序。
:::

</DocScope>

#### 队列

现代网卡都是多队列网卡：硬件提供多个发送（TX）/接收（RX）队列，每个队列有独立的描述符环与中断，MTL 层再按调度算法与队列模式把不同优先级的流量分流到不同队列，从而同时满足 QoS（TSN 的整形/调度）与多核负载分担的需求。队列数量、调度算法与每个队列的模式都通过设备树配置。

- `hobot,mtl-rx-config` 与 `hobot,mtl-tx-config` 是**必须配置**的子节点，缺失会导致驱动 probe 失败。
- 队列数由 `hobot,rx-queues-to-use`、`hobot,tx-queues-to-use` 决定（缺省 `1`）；子节点 `queue0`、`queue1`…… 按出现顺序依次对应队列 0、1……。
- 配置示例：

```dts
    ethernet4: xgmac1@0x33140000 {
        compatible = "hobot,hobot_xgmac";
        hobot,mtl-rx-config {
            hobot,rx-queues-to-use = <8>;
            hobot,rx-sched-sp;
            queue0 {
                hobot,dcb-algorithm;
                hobot,priority = <0x1>;
            };
            queue1 {
                hobot,avb-algorithm;
                hobot,route-ptp;
            };
            ...
        };
        hobot,mtl-tx-config {
            hobot,tx-queues-to-use = <8>;
            hobot,tx-sched-wrr;
            queue0 {
                hobot,dcb-algorithm;
            };
            queue1 {
                hobot,avb-algorithm;
                hobot,priority = <0x2>;
            };
            ...
        };
    };
```

- hobot,mtl-tx-config 配置：

| 属性 | 描述 |
| ---- | ---- |
| hobot,tx-queues-to-use | 使用的发送队列数，缺省 1 |
| hobot,tx-sched-wrr | 发送调度为 WRR（加权轮询），没有 TSN 或业务优先级需求时可选 |
| hobot,tx-sched-sp | 发送调度为严格优先级（缺省） |
| hobot,weigh | 队列权重，WRR 调度时使用，缺省 1 |
| hobot,dcb-algorithm | 队列使用 DCB 模式（队列 0 以及 rr 调度时，必须配置成 DCB 模式） |
| hobot,avb-algorithm | 队列使用 AVB 模式，可用于 TSN 整形；配合 `hobot,idle_slope`、`hobot,send_slope`、`hobot,high_credit`、`hobot,low_credit` 配置 CBS 参数 |
| hobot,priority | 将该队列标记为高优先级队列 |

- hobot,mtl-rx-config 配置：

| 属性 | 描述 |
| ---- | ---- |
| hobot,rx-queues-to-use | 使用的接收队列数，缺省 1 |
| hobot,rx-sched-sp | 接收严格优先级调度（缺省） |
| hobot,rx-sched-wsp | 接收加权严格优先级调度 |
| hobot,dcb-algorithm | 按 VLAN 优先级选择接收队列，使不同 NAPI 线程承接不同优先级的任务 |
| hobot,avb-algorithm | 接收队列使用 AVB 模式，可用于接收 gPTP 报文 |
| hobot,map-to-dma-channel | 指定队列对应的 DMA 通道，缺省与队列号相同 |
| hobot,priority | 将该队列标记为高优先级队列 |
| hobot,route-ptp / hobot,route-avcp / hobot,route-dcbcp | 将 PTP、AV 控制、DCB 控制报文路由到该队列 |

:::tip
- 根据业务需求配置队列调度机制和队列的模式。
- 当配成多队列时，队列均分硬件 buf，无多队列需求时，可以只保留一个队列独占全部硬件 buf。
:::


## 网络配置

RDK OS 默认由 NetworkManager 管理网络，netplan 配置位于 `/etc/netplan/`（`renderer: NetworkManager`，以板端实际文件为准）。推荐使用 Ubuntu 桌面网络设置或 `nmcli`/`nmtui` 配置网卡，配置可持久化；下文的 `ip`、`ifconfig` 命令为临时配置，重启或网络服务重载后失效。

以 RDK S600 板为例，默认网口为 eth0~eth3；RDK S100 板为 eth0~eth1。实际网口名可用 `ip -br link` 查看。

### U-Boot

U-Boot 环境变量用 `printenv` 查看、`saveenv` 保存；未执行 `saveenv` 时仅本次生效。

- 配置 IP 与服务器地址：

```bash
setenv ipaddr 192.168.1.10          # 本机 IP
setenv netmask 255.255.255.0        # 子网掩码
setenv gatewayip 192.168.1.1        # 网关
setenv serverip 192.168.1.100       # tftp/nfs 服务器地址
saveenv
```

- 配置 MAC 地址：

```bash
setenv ethaddr 00:11:22:33:44:55    # eth0 的 MAC
setenv eth1addr 00:11:22:33:44:56   # eth1 的 MAC
env delete -f ethaddr               # 删除 MAC 地址（-f 表示强制删除）
saveenv
```

多网口时环境变量按 `eth<序号>addr` 命名，即 `ethaddr`、`eth1addr`、`eth2addr`……。

- 切换当前使用的网口：

```bash
printenv ethact            # 查看当前网口
setenv ethact eth1         # 切换当前网口
setenv ethrotate no        # 固定使用 ethact，不再自动轮询其它网口
saveenv
```

**说明**：U-Boot 默认会在多个网口间轮询，仅当板卡存在多个可用网口时，切换才会生效。

:::note
U-Boot 以太网不提供 VLAN 配置项。`vlan` 变量仅在启用 CDP 时由 U-Boot 自动写入，手工 `setenv vlan` 不会生效。
:::

### Linux/Ubuntu

:::warning
- 推荐使用 Ubuntu 桌面网络设置或 `nmcli`/`nmtui` 配置网卡，配置可持久化。
- 下述 `ip`、`ifconfig` 命令为临时配置，重启或网络服务重载后失效。
:::

- 查看网口与地址：

```bash
ip -br link                 # 查看网口列表与 link 状态
ip -br addr                 # 查看网口 IP
```

- 启用/关闭网口：

```bash
ip link set eth0 up
ip link set eth0 down
```

- 配置 IP（临时）：

```bash
ip addr add 192.168.1.10/24 dev eth0
# 或者
ifconfig eth0 192.168.1.10 netmask 255.255.255.0
```

- 配置路由与 DNS（临时）：

```bash
ip route replace default via 192.168.1.1 dev eth0
# /etc/resolv.conf 由 NetworkManager 生成，网络服务重载后会被覆盖
echo "nameserver 8.8.8.8" >> /etc/resolv.conf
```

- 配置 VLAN：

```bash
# 先创建 VLAN 子接口
ip link add link eth0 name eth0.10 type vlan id 10

# 配置 VLAN 优先级映射（egress-qos-map，出方向 PCP 为 5）
ip link set dev eth0.10 type vlan egress-qos-map 0:5 1:5 2:5 3:5 4:5 5:5 6:5 7:5

# 启用子接口并配置 IP
ip link set eth0.10 up
ip addr add 192.168.1.10/24 dev eth0.10
```

- 删除配置：

```bash
ip addr del 192.168.1.10/24 dev eth0.10
ip link del eth0.10
```

- 持久化配置（NetworkManager）：

```bash
nmcli connection show                                   # 查看连接名，例如 eth0_cfg
nmcli device status                                     # 查看网口与连接状态
nmcli connection modify <连接名> ipv4.method manual \
    ipv4.addresses 192.168.1.10/24 ipv4.gateway 192.168.1.1 ipv4.dns 8.8.8.8
nmcli connection up <连接名>
```

也可使用 `nmtui` 图形界面，或修改 `/etc/netplan/` 下的配置文件后执行 `netplan apply`。


## 网卡常用命令介绍

RDK OS 已预装本节涉及的工具：`ethtool`、`phytool`、`tperf` 位于 `/usr/hobot/bin`，`iperf3`、`tcpdump`、`tc`、`vconfig` 位于 `/usr/bin` 或 `/usr/sbin`。

### ethtool

`ethtool` 用于查看网卡状态与统计、调整 offload 与中断聚合等。

- 查看类命令：

```bash
ethtool -i eth0            # 驱动名与版本
ethtool -S eth0            # 统计计数（mmc/tx/rx/mtl/ptp/mac/irq 等分组）
ethtool -T eth0            # 硬件时间戳能力与 PHC index
ethtool -k eth0            # offload 开关状态（TSO/GSO/校验和等）
ethtool -a eth0            # pause 帧协商状态
ethtool -c eth0            # 中断聚合参数
ip -d link show eth0       # 网卡与队列信息（控制器、队列数）
```

- 设置类命令：

```bash
ethtool -K eth0 tso on|off          # TSO 开关
ethtool -K eth0 rx-checksum on|off  # 校验和开关
ethtool -s eth0 speed 100 duplex full autoneg on   # 速率/双工（autoneg 开启时以自协商结果为准）
ethtool -C eth0 tx-frames 15 rx-usecs 50           # 中断聚合参数（需网卡 DOWN）
ethtool -t eth0 offline             # Loopback 自检（MAC/PHY loopback）
ip link set eth0 mtu 9000           # MTU，最大 9000
```

- 私有命令（由地瓜定制版 `ethtool` 提供）：

```bash
ethtool hobot_gmac --set-fp eth0 fp on      # 开启帧抢占
ethtool hobot_gmac --show-fp eth0           # 查看帧抢占状态
ethtool hobot_gmac --set-flex-pps eth0 index 0 fpps on interval 1000000000   # 配置 flex PPS
```

:::tip
- ring 相关调试请用 `/sys/class/net/<interface>/descriptors/` 与 `ethtool -S`。
:::

### VLAN 配置

VLAN 使用 `ip` 命令配置。原 `vconfig` 已废弃（执行时会提示 `vconfig is deprecated ...`），仅作兼容保留：

```bash
ip link add link eth0 name eth0.10 type vlan id 10   # 创建 VLAN 子接口
ip link set eth0.10 up
ip addr add 192.168.1.10/24 dev eth0.10
```

### iperf3

`iperf3` 用于带宽与丢包测试，需要一端作服务端、另一端作客户端。

```bash
# 服务端
iperf3 -s

# 客户端 TCP（默认）
iperf3 -c 192.168.1.100 -t 60

# 客户端 UDP（-b 指定带宽，-l 指定包长）
iperf3 -c 192.168.1.100 -u -b 1G -l 8K -t 60

# 反向测试（服务端发送、客户端接收）
iperf3 -c 192.168.1.100 -R -t 60
```

建议使用直连或独立链路测试，避免其它业务抢占带宽影响结果。

### tcpdump

`tcpdump` 用于抓包分析。

```bash
tcpdump -i eth1 -e             # 抓包输出到终端（-e 显示 MAC 层信息）
tcpdump -i eth1 -nn -c 100     # 抓 100 个包，不解析域名/服务名
tcpdump -i eth1 -w eth1.pcap   # 保存为 pcap 文件，可用 Wireshark 分析
tcpdump -i eth1 -nn vlan       # 只抓带 VLAN tag 的报文
```

### phytool

`phytool` 用于读写 C22/C45 PHY 寄存器，地址格式如下：

- C22：`IFACE/PHYADDR/REG`
- C45：`IFACE/PORT:DEV/REG`

```bash
phytool read  eth0/0x2/2          # 读取 PHY 地址 0x2 的寄存器 2
phytool write eth0/0x2/0 0x1140   # 写入寄存器（请确认含义后再执行）
phytool print eth0/0x2            # 打印 PHY 信息并解析标准寄存器
```

PHY 地址以设备树中 `phy@N` 的 `reg` 为准，例如 RDK S600/S100 的 eth0 均为 `0x2`：

```console
root@hobot:~# phytool read eth0/0x2/2
0x001c

root@hobot:~# phytool print eth0/0x2
ieee-phy: id:0x001cc916
```

## 网卡时间同步
- 包含 PTP, PPS, PHC 等技术。

### PPS
- Pulse Per Second. 秒脉冲, 网卡硬件层面的一种时间同步机制。通常与 PTP(IEEE 1588)/gPTP 配套使用。
以实现汽车, 机器人系统之间的时间同步。
- 分为 pps in 和 pps out, 即可以作为从设备接收外部高精度的秒脉冲, 也可以作为主设备输出秒脉冲信号。

#### pps in
- pps in 用于以太网 PHC 时间的 snapshot 的触发源。

#### pps out
- eth pps 只支持单个 pps out。
- 可以通过以下命令进行配置和测试
```bash
    ethtool hobot_gmac --set-flex-pps eth0 index 0 fpps on interval 1000000000
```

### PHC snapshot
- 即 Ethernet PTP Hardware Clock, 网卡时间同步硬件时间戳。
- 获取 phc snapshot 时间，用于计算时间差。
- 举例说明使用方法
```c
    // 打开PHC设备
    phcfd = open("/dev/ptp0", O_RDWR);

    // 通过ioctl设置PHC的snapshot源
    struct ptp_extts_request extts_request;
    extts_request.index = phc_snapshot_source;
    extts_request.flags = PTP_ENABLE_FEATURE;
    ioctl(phcfd, PTP_EXTTS_REQUEST, &extts_request);

    // 通过read接口, 获取PHC时间
    struct ptp_extts_event event;
    read(phcfd, &event, sizeof(event));
    phctime->tv_sec = event.t.sec;
    phctime->tv_nsec = event.t.nsec;

    // 设置PHC时间，这个执行完毕，PHC时间会被加上offset
    clockadj_step(FD_TO_CLOCKID(phcfd), offset);

    // 关闭PHC设备
    close(phcfd);
```

### 时间同步 gptp

#### 应用层接口
- POSIX 网络与 PTP 硬件时钟 API 对照表

| 功能分类 | 核心 POSIX API 代码 |
| :------- | :----------------- |
| L2 报文收发 | `socket(PF_PACKET, SOCK_RAW, htons(ETH_P_ALL));`<br/>`bind(fd, (struct sockaddr *) &addr, sizeof(addr));`<br/>`setsockopt(fd, SOL_SOCKET, SO_BINDTODEVICE, name, strlen(name)); /* 绑定到指定网卡 */`<br/>`setsockopt(fd, SOL_SOCKET, SO_ATTACH_FILTER, &prg, sizeof(prg)); /* 挂载报文过滤器 */`<br/>`ioctl(sock, SIOCGIFHWADDR, &ifr); /* 获取网卡 MAC 地址 */` |
| 报文硬件时间戳 | `ioctl(fd, SIOCSHWTSTAMP, &ifreq); /* 开启硬件时间戳 */`<br/>`setsockopt(fd, SOL_SOCKET, SO_TIMESTAMPING, &flags, sizeof(flags)); /* 启用时间戳传递 */`<br/>`recvmsg(fd, &msg, MSG_ERRQUEUE); /* 获取发送报文硬件时间戳 */`<br/>`recvmsg(fd, &msg, 0); /* 获取接收报文硬件时间戳 */` |
| 获取网卡 PHC 索引 | `socket(AF_INET, SOCK_DGRAM, 0);`<br/>`ioctl(fd, SIOCETHTOOL, &ifr);` |
| PHC 时间读写 | `open("/dev/ptp0", O_RDWR);`<br/>`FD_TO_CLOCKID(fd);`<br/>`clock_gettime(clkid, &ts);`<br/>`clock_settime(clkid, &ts);` |
| PHC 频率调整 | `clock_adjtime(clkid, &tx); /* 调整频率、时间偏移 */` |

#### 时间同步步骤
- Master
```bash
    ptp4l -P -H -2 -i eth0 -p /dev/ptp0 -m
```

- Slave
```bash
    ptp4l -P -H -2 -i eth0 -p /dev/ptp0 -m -s -l 7
```

- 其他
    - 更详细配置参见第三方工具 linuxptp 源码中的 automotive-master.cfg，automotive-slave.cfg，比如减少 ptp 同步完成时间。

### TSN
#### TSN 介绍
- Time-Sensitive Networking, 时间敏感性网络。
- TSN 由一系列技术标准构成，其主要分为时钟同步、数据调度（即整形器）以及系统配置三个部分相关通用标准。

#### TSN-VLAN
- TSN 在 IEEE 802.1Q 仅指 ISO/OSI 参考模型的第二层数据链路层的标准。
- 802.1Q 标准的 VLAN，该标准在标准以太网帧中插入4个字节用于定义其特征，TSN 的标签位定义下图所示：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/ethernet/media/image15.png" alt="TSN-VLAN实物图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- 对 TSN 网络而言，不同优先级或服务等级（class of
service，CoS）的服务对应上图中的 PCP 码。优先级代码（prioritycode
point，PCP）由3位代码构成；3位 PCP 码定义了0（最低）～7（最高）这8个优先级，传输类型分别对应
基础、最大努力、卓越努力、严苛应用、延时和抖动小于100ms 的视频、延时和抖动小于10ms 的音频、内部网络控制、网络控制。

#### 多队列
- VLAN 优先级以及多个协议需要多个队列来承接，多队列是实现 TSN 的基础。
- 数据包与队列的映射关系由网卡驱动中的 ndo_select_queue 方法实现。

#### 数据调度（整形器）
#### 基于信用的整形器机制（CBS）（IEEE 802.1-Qav）
- 每个队列设置一定的信用值，根据信用值对应带宽，CBS 将队列分为 Class A（Tight delay bound）和 Class B（Loose delay bound）。

#### 增强型整形机制（ EST）（IEEE 802.1Qbv-2015）
- EST 由 IEEE 802.1Qbv 定义，也叫 TAS（Time Awareness Shaper）。是基于预先设定的周期性门控制列表，动态地为出口队列提供开/关控制的机制。
Qbv 定义了一个时间窗口，是一个时间触发型网络（Time-trigged），这个窗口在这个机制中是被预先确定的，同时这个门控制列表被周期性的扫描，
并按预先定义的次序为不同的队列开放传输端口。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/ethernet/media/image16.jpg" alt="数据调度（整形器）实物图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- IEEE 802.1Qbv 规范的框图，说明了门控制列表如何根据为每个事件提供的时间表来管理门关闭（C-close）和打开（O-open）事件。
- GCL 有以下两部分：
    - 时间间隔：定义时间，以纳秒为单位，在从列表中读取下一个门控制项之前，门控制项是有效的。
    - 门控：定义每个 TC 的门的逻辑1表示的开（O-open）或逻辑0表示的关（C-close）状态。

#### 帧抢占（ FPE）（IEEE 802.1Qbu-2016）
- 为了解决 EST 的保护带宽的浪费以及优先级反转问题，引入了抢占标准。因此，TSN 的802.1Qbu 和 IEEE 802.3工作组共同开发了 IEEE
802.3br，即可抢占式 MAC 机制，由可被抢占 MAC（pMAC-Preemptable MAC）和快速 MAC（eMAC-express MAC）组成。pMAC 可以被 eMAC 抢占。
通过抢占，保护带宽可以被减少至最短低优先级帧片段。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/ethernet/media/image17.png" alt="数据调度（整形器）实物图" style={{ width: '40%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::tip
- 由于抢占改变了帧的格式，所以对接交换机时也需要对端支持 FPE。
:::

#### 配置验证
#### tc
- 关于 TSN 各种特性, 通常采用 Linux 原生自带的 tc 命令(即 Traffic Control)进行配置和验证
- 支持如下几种方式：
:::tip
   SHAPING（限制）、 SCHEDULING（调度）、POLICING（策略）、DROPPING（丢弃）
:::

#### CBS
- 命令格式:
```bash
    tc qdisc ... dev dev parent classid [ handle major: ] cbs idleslope <idleslope> sendslope <sendslope> hicredit <hicredit> locredit <locredit> [ offload 0|1 ]
```
- 验证：
```bash
    ## 配置CBS qdisc，将队列1的带宽设置为 40Mbps，测试带宽
    root@hobot:~# tc qdisc add dev eth0 parent root handle 6666 mqprio num_tc 2 map 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 0 queues 1@0 1@1 hw 0

    root@hobot:~# tc qdisc replace dev eth0 parent 6666:2 cbs idleslope 40000 sendslope -960000 hicredit 60 locredit -1440 offload 1

    root@hobot:~# tperf eth0 10000 1
    sending 10000 packets: prio=0x1 (class B)
    10000 packets: 9.708405 MB in 2044712 us
    39.829567 Mbps
```

#### EST
- 命令格式：
```bash
    tc qdisc ... dev dev parent classid [ handle major: ] taprio num_tc tsc  map P0 P1 P2 ...  queues count1@offset1 count2@offset2 ...  base-time base-time clockid clockid
    sched-entry <command 1> <gate mask 1> <interval 1>
    sched-entry <command 2> <gate mask 2> <interval 2>
    sched-entry <command 3> <gate mask 3> <interval 3>
    sched-entry <command N> <gate mask N> <interval N>
    ...
    flags  number
```

- 验证:
```bash
    ## 队列3每100ms循环发送一次，一次发送10ms
    root@hobot:~# ptp4l -P -H -2 -i eth0 -p /dev/ptp0 -m &

    root@hobot:~# tc qdisc replace dev eth0 parent root handle 100 taprio num_tc 4 map 0 1 2 3 queues 1@0 1@1 1@2 1@3 base-time 1000 sched-entry S 8 10000000 sched-entry S 0 10000000 sched-entry S 0 10000000 sched-entry S 0  10000000 sched-entry S 0  10000000 sched-entry S 0  10000000 sched-entry S 0  10000000 sched-entry S 0  10000000 sched-entry S 0  10000000 sched-entry S 0  10000000 flags 2

    root@hobot:~# tc qdisc show dev eth0
    qdisc taprio 100: root refcnt 9 tc 4 map 0 1 2 3 0 0 0 0 0 0 0 0 0 0 0 0
    queues offset 0 count 1 offset 1 count 1 offset 2 count 1 offset 3 count 1
    clockid invalid flags 0x2       base-time 1000 cycle-time 100000000 cycle-time-extension 0
        index 0 cmd S gatemask 0x8 interval 10000000
        index 1 cmd S gatemask 0 interval 10000000
        index 2 cmd S gatemask 0 interval 10000000
        index 3 cmd S gatemask 0 interval 10000000
        index 4 cmd S gatemask 0 interval 10000000
        index 5 cmd S gatemask 0 interval 10000000
        index 6 cmd S gatemask 0 interval 10000000
        index 7 cmd S gatemask 0 interval 10000000
        index 8 cmd S gatemask 0 interval 10000000
        index 9 cmd S gatemask 0 interval 10000000

    root@hobot:~# tperf eth0 10000 3
    sending 10000 packets: prio=0x3 (class A)
    10000 packets: 9.708405 MB in 896210 us
    90.871559 Mbps
```

- wireshark 抓包如下图：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/ethernet/media/image27.png" alt="队列3每100ms循环发送一次，一次发送10ms实物图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### 测试
#### 功能测试
- ping 测试
    - 测试步骤：ping xx.xx.xx.xx

- ssh
    - 测试步骤：ssh root\@xx.xx.xx.xx

#### 稳定性测试
- reboot 测试
    - 进行循环 reboot 测试，并检查网络是否可以 ping 通。

- 上下电测试
    <DocScope products="RDK S100">
    - 使用继电器进行循环上下电，检查 S100网络是否正常开启。
    </DocScope>
    <DocScope products="RDK S600">
    - 使用继电器进行循环上下电，检查 S600网络是否正常开启。
    </DocScope>

- iperf3 24小时测试
    - tcp 测试
    ```bash
        Server:iperf3 -s
        Client:iperf3 -c x.x.x.x -t 86400
    ```
    - udp 测试
    ```bash
        Server:iperf3 -s
        Client:iperf3 -c x.x.x.x -t 86400 -u -b 1G -l 8K
    ```

- up/down 循环测试
```bash
    #!/bin/sh
    echo 14 4 1 7 > /proc/sys/kernel/printk
    i=0
    times=10000000000000
    ifconfig eth0 down
    dmesg -c
    while [ $i -le $times ];do
       echo "test times : $i"
       i=$(($i+1))
       echo "~~~~~new begin~~~~~"
       ifconfig eth0 up
       sleep 2
       note=$(dmesg -c | grep "Link is Up" | wc -l)
       echo $note
       if [ 1 -ne $note ]
       then
           echo "!!!error!!, while break!!!!"
           break
       fi
       ifconfig eth0 down
    done
```

#### 性能测试分析
#### 拓扑

<DocScope products="RDK S100">
- 直接 S100直连即可
</DocScope>
<DocScope products="RDK S600">
- 直接 S600直连即可
</DocScope>

#### napi 独立线程化
- Linux 网络任务由 ksoftirqd/n 处理，默认任务优先级相对较低，独立后可提高 CPU 利用率以及 TSN 的相关的控制。
丢包率在空负载的情况下可以达到0丢包，在大负载情况下可以通过规划项目整体任务的优先级达到性能平衡。
```console
    root@hobot:~# echo 1 > /sys/class/net/eth0/threaded
    root@hobot:~# ps -ef | grep napi
    1705 root 19 0 0 SW [napi/eth0-260]
    1706 root 19 0 0 SW [napi/eth0-259]
    1707 root 19 0 0 SW [napi/eth0-258]
    1708 root 19 0 0 SW [napi/eth0-257]
    1710 root 19 0 3584 S grep napi
    root@hobot:~# iperf3 -s
    -----------------------------------------------------------
    Server listening on 5201
    -----------------------------------------------------------
    Accepted connection from 192.168.1.249, port 58418
    [ 5] local 192.168.1.249 port 5201 connected to 192.168.1.249 port 55021
    [ ID] Interval Transfer Bitrate Jitter Lost/Total Datagrams
    [ 5] 0.00-1.00 sec 98.0 MBytes 822 Mbits/sec 0.022 ms 0/12544 (0%)
    [ 5] 1.00-2.00 sec 108 MBytes 907 Mbits/sec 0.015 ms 0/13841 (0%)
    [ 5] 2.00-3.00 sec 103 MBytes 865 Mbits/sec 0.019 ms 0/13200 (0%)
    [ 5] 3.00-4.00 sec 113 MBytes 947 Mbits/sec 0.019 ms 0/14452 (0%)
    [ 5] 4.00-5.00 sec 114 MBytes 956 Mbits/sec 0.023 ms 0/14586 (0%)
    [ 5] 5.00-6.00 sec 111 MBytes 931 Mbits/sec 0.028 ms 0/14211 (0%)
    [ 5] 6.00-7.00 sec 114 MBytes 953 Mbits/sec 0.020 ms 0/14539 (0%)
    [ 5] 7.00-8.00 sec 105 MBytes 879 Mbits/sec 0.018 ms 0/13410 (0%)
    [ 5] 8.00-9.00 sec 112 MBytes 939 Mbits/sec 0.016 ms 0/14331 (0%)
    [ 5] 9.00-10.00 sec 113 MBytes 946 Mbits/sec 0.024 ms 0/14429 (0%)
    [ 5] 10.00-10.00 sec 112 KBytes 947 Mbits/sec 0.033 ms 0/14 (0%)
    - - - - - - - - - - - - - - - - - - - - - - - - -
    [ ID] Interval Transfer Bitrate Jitter Lost/Total Datagrams
    [ 5] 0.00-10.00 sec 1.06 GBytes 915 Mbits/sec 0.033 ms 0/139557 (0%) receiver
```

### 调试
#### Log
- 系统日志
    - dmesg, pstore 日志分析
- 内存检查
    - 检查内存是否有泄露导致网络包内存无法分配。

#### Ringbuf
- Tx ringbuf
    - 查看/sys/class/net/`<interface>`/descriptors/dump_tx_desc。
    - 举例：
    ```
        cat /sys/class/net/eth0/descriptors/dump_tx_desc
        cat /sys/class/net/eth1/descriptors/dump_tx_desc
    ```

- Rx ringbuf
    - 查看/sys/class/net/`<interface>`/descriptors/dump_rx_desc。
    ```
        cat /sys/class/net/eth0/descriptors/dump_rx_desc
        cat /sys/class/net/eth1/descriptors/dump_rx_desc
    ```

#### 统计计数
- ethtool -S `<interface>` 查看报文 mmc 统计信息，以及其他的统计信息。
- netstat 查看协议栈相关的信息。如协议栈报文计数及 tcp/udp 状态信息等。

#### 开发常见问题排查
#### EQOS_DMA_MODE_SWR stuck
- 描述: emac 软复位失败。
    1. U-Boot 日志如下：EQOS_DMA_MODE_SWR stuck。
    2. linux 日志：device or resource busy。dmesg 日志如下：
    ```text
        [ 21.720702] hobot_gmac 330f0000.ethernet eth0: init_dma_engine: Failed to reset dma
        [ 21.720717] hobot_gmac 330f0000.ethernet eth0: hw_setup, DMA engine initilization failed
        [ 21.720723] hobot_gmac 330f0000.ethernet eth0: eth_netdev_open, Hw setup failed
    ```
- 故障排除。
    1. 检查 SGMII 参考时钟是否提供，若使用内部时钟检查 clock 是否使能。

#### phy link 不上
- 故障排除。
    - 使用 mdio/mii/phytool 命令能否正常读写 phy 寄存器。
    - 检查 phy 时钟、phy 复位、phy 供电等。
    - 检查变压器等。

#### 发送异常
- 故障排除。
    - 检查 phy link 是否 UP。
    - 检查工作模式（速率，双工等）。
    - 确认 transmit 接口是否被调用。
    - 确认发送统计计数。
    - 对端查看是否错包等。
    - 使用环回定位故障点。

#### 接收异常
- 故障排查
    - 测量 phy tx 时钟。
    - mac 环回，若正常收包。可判定 phy tx 时钟 与 MAC rx 接收配合问题。
    - 查看是否有错包，如果有 ECC 错包可推断是信号质量问题。

#### 大量错包
- 故障排除。
    - 检查 clk 是否符合要求。
    - 条件允许的话，测下信号的眼图。
    - 降速测试。

### FAQ
#### TSN
<DocScope products="RDK S100">
- 问：S100支持哪些 TSN 标准？
</DocScope>
<DocScope products="RDK S600">
- 问：S600支持哪些 TSN 标准？
</DocScope>
- 答：基于信用的整形器机制（credit-based shaper，CBS）(IEEE
802.1-Qav)、 增强型整形机制（Enhancements to Scheduled Traffic，EST）（IEEE
802.1Qbv-2015）、 帧抢占（Frame Preemption，FPE）（IEEE 802.1Qbu-2016）。


#### phy
<DocScope products="RDK S100">
- 问：S100适配过哪些 phy？
</DocScope>
<DocScope products="RDK S600">
- 问：S600适配过哪些 phy？
</DocScope>
- 答：Realtek 8211、Marvell 88E1512、Marvell 88Q2121、Marvell 88Q2220、TI dp83867、Marvell CUX3520。

#### 网络环境
<DocScope products="RDK S100">
- 问：S100无法 ping 通 Windows，Windows 可以 ping 通 S100？
- 答：检查 Windows 的防火墙是否关闭，windows 自带防火墙如下图：
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/ethernet/media/image24.png" alt="网络环境实物图" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
</DocScope>

#### U-Boot 调试与升级
- 问：U-Boot 网络自协商失败或协商成千兆后无法 PING 通？
- 答：检查网络是否为6类线。phy 和对端可能在百兆或千兆之间切换，导致 mac 与 phy 之间的速率不匹配。

- 问：U-Boot 无法读写 phy？
- 答：检查 phy 是否解复位，软件使用的 mdio 地址与硬件配置是否一致。

- 问：U-Boot 升级失败（ping 不通）？
- 答：检查 IP 的配置，serverip，使用小局域网或直连 PC。
检查 MAC 的配置，检查使用的网口是否为期望的网口。 检查网线是否为6类线。

## 相关文档

- [网络配置](../../../02_System_configuration/01_network_config.md)
- [EtherCAT（Linux 侧）](./02_ethercat.md)
