---
sidebar_position: 1
---
# ethernet

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 前言
<DocScope products="RDK S100">
S100芯片提供多个标准千兆/万兆以太网控制器, 支持传统的以太网报文收发, PTP/TSN时间敏感性网络, 以及EtherCAT主站等特性。  
</DocScope>
<DocScope products="RDK S600">
S600芯片提供多个标准千兆/万兆以太网控制器, 支持传统的以太网报文收发, PTP/TSN时间敏感性网络, 以及EtherCAT主站等特性。  
</DocScope>
控制器内置硬件多队列, MTL二层传输层, DMA引擎等。以实现上述各种场景的报文收发。  
本文主要包括网卡使用指南, 开发板Bringup, 关键特性描述等。


## 名词解释
| 缩略语 | 英文全名                          | 中文解释             |
| ------ | --------------------------------- | -------------------- |
| PTP    | Precision Time Protocol           | 精确时钟协议         |
| PHC    | PTP Hardware Clock                | PTP时钟              |
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
| 接口    | mac--phy接口       | 支持SGMII                        | 
| PPS     | 秒脉冲, pps out/in | &#x2705;                         |
| TSO     | TCP 分段卸载       | &#x2705;                         | 
| 多队列  | 网卡多队列功能     | &#x2705;                         | 
| AVB/TSN | 时间敏感性网络     | &#x2705;                         | 
| C22/C45 | MDIO PHY数据协议   | &#x2705;                         | 

</DocScope>
<DocScope products="RDK S600">

| 特性    | 解释               | S600                                          |
| ------  | -----------------  |  --------------------                          |
| 配置    | 网口数量配置       | 3x gmac + 3x xgmac<br/>其中前2个gmac和pcie复用phy |
| 接口    | mac--phy接口       |  支持SGMII/USXGMII                             |
| PPS     | 秒脉冲, pps out/in |  &#x2705;                                      |
| TSO     | TCP 分段卸载       |  &#x2705;                                      |
| 多队列  | 网卡多队列功能     |  &#x2705;                                      |
| AVB/TSN | 时间敏感性网络     |  &#x2705;                                      |
| C22/C45 | MDIO PHY数据协议   |  &#x2705;                                      |
</DocScope>
## 网络配置
### U-Boot
- 配置IP
```shell
      setenv ipaddr x.x.x.x
      setenv gatewayip x.x.x.x
      setenv netmask x.x.x.x
```
- 配置VLAN
```shell
      setenv vlan xx
```

- 配置MAC地址
```shell
      setenv ethaddr xx:xx:xx:xx:xx:xx          //设置eth mac地址
      env del -f ethaddr                        //删除mac地址
```

- 切换当前使用的eth

```shell
      setenv ethact eth0
      setenv ethact eth1
      # 如果U-Boot支持双网卡可以切换成功。单网卡切换无效。
```

### Linux/Ubuntu
:::warning
- 建议使用Network Management, 即Ubuntu桌面进行网卡配置。  
- 下述手动通过ip, ethtool等命令配置为次选方案。可自行结合Ubuntu版本以及网络资料判断是否生效。
:::

- 配置IP
```shell
      ip addr add 192.168.1.10/24 dev eth0.10 //推荐
      或者
      ifconfig eth0.10 192.168.1.10 netmask 255.255.255.0
```

- 配置VLAN
```shell
      ip link add link eth0 name eth0.10 type vlan id 10                                //添加vlan id 10
      ip link set eth0.10 type vlan egress 0:5 1:5 2:5 3:5 4:5 5:5 6:5 7:5          //配置vlan priority 5
```

## 软件介绍 <a id="chap_code_position"></a>
### 代码位置
- U-Boot ETH代码位置
```shell
    drivers/net/hobot_super_gmac.c
    drivers/net/hobot_super_xpcs.c
    drivers/net/hobot_super_xgmac.c
    drivers/net/hobot_s600_xpcs.c
```

- Kernel ETH代码位置
```shell
   hobot-drivers/ethernet/hobot/hobot_eth_super_main.c
   hobot-drivers/ethernet/hobot/hobot_eth_super_mdio.c
   hobot-drivers/ethernet/hobot/hobot_eth_super_ptp.c
   hobot-drivers/ethernet/hobot/hobot_eth_super_tc.c
   hobot-drivers/ethernet/hobot/core/...
   hobot-drivers/ethernet/hobot/dma/...
```

## 网络驱动开发
### U-Boot ETH开发
#### 硬件连接
<DocScope products="RDK S100">
- 参考S100设计原理图
</DocScope>
<DocScope products="RDK S600">
- 参考S600设计原理图
</DocScope>

#### 设备树配置
<DocScope products="RDK S100">
```dts
    // 配置hsis mode以及参考时钟选择, 如combo phy的复用情况, 参考时钟的来源等。
    hsis0: hsis0 {
        status = "okay";
        compatible = "hobot,super-hsis";
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
        compatible = "hobot,super-hsis";
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
- xpcs-speed:       根据不同的speed设置xpcs。
- hobot-txeq:       设置不同档位的眼图参数，取值范围[0, 10]，默认是4档，sgmii不需要调整。
- hobot-vboost:     眼图幅值系数，0不使能。

</DocScope>

#### mdio phy配置
- phy连接情况参考原理图和硬件说明
- 软件主要需要关注其中的reset管脚以及phy addr地址

<DocScope products="RDK S100">
    
```dts
    // drobot-s100-soc.dtsi, 芯片默认的eth配置; 可以被具体board的dts覆盖
    eth0: eth0 {
            status = "disabled";
            compatible = "hobot,super-gmac";
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
        compatible = "hobot,super-gmac";
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
- 在MAC TO MAC直连情况下, 需要配置为fixed-link
- 例如

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

#### U-Boot下命令介绍
-  mii： phy读写命令（C22协议）
   执行网络命令（如ping）后初始化网络接口，否则mdio命令会执行异常。
```shell
      mii info   <addr>                    //display MII phy info
      mii read   <addr> <reg>              //read  MII phy <addr> register <reg>
```

-  mdio： phy读写命令（C45）
```shell
      mdio list                           //List MDIO buses
      mdio read <phydev> [<devad>.]<reg>  //read phy register at <devad>.<reg>
```

-  md： 查看统计计数  
   通过md命令读写寄存器查看报文统计计数用于调试。

```shell
      md[.b, .w, .l, .q] address
```

### Linux ETH开发
- 驱动代码在 hobot-drivers/ethernet目录, 可参考[软件介绍](#chap2)的描述。
- 控制器驱动部分大部分不需要进行修改, 主要任务还是结合开发板硬件, 配置相关设备树。

#### hsis 模式配置
<DocScope products="RDK S100">
:::warning
- 由于S100以太网和pcie的phy部分都有复用关系。所以特别需要注意hsis模块的配置。  
- 包括Lane使用的配置, 以及参考时钟配置等。特别需要注意的是, 由于U-Boot中启动时也会配置一次,  
- 所以需要确保U-Boot的hsis配置和Kernel是一致的。否则可能会导致实际Lane配置不对的情况。
:::
</DocScope>
<DocScope products="RDK S600">
:::warning
- 由于S600以太网和pcie的phy部分都有复用关系。所以特别需要注意hsis模块的配置。  
- 包括Lane使用的配置, 以及参考时钟配置等。特别需要注意的是, 由于U-Boot中启动时也会配置一次,  
- 所以需要确保U-Boot的hsis配置和Kernel是一致的。否则可能会导致实际Lane配置不对的情况。
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

#### 网卡和PHY配置
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

#### MAC和PHY常见配置
- 参考上述的设备树内容, 以及dts文件中的更完整信息
- 描述下常见的phy配置参数
    - reset-delay-us：表示复位时间。
    - reset-post-delay-us：表示解复位后延时时间（phy从解复位到完成初始化的时间）。
    - ethernet-phy-ieee802.3-c22: mdio compatible兼容名, 说明phy mdio走的是C22协议。  
    常见的如RTL千兆phy都支持这个协议。
    - ethernet-phy-ieee802.3-c45: mdio compatible兼容名, 说明phy mdio走的是C45协议。  
    参考手册万兆PHY, 以及一些高端PHY会走C45协议。
- MAC相关常见一些配置
    - sgmii-autoneg：配置SGMII自协商。
    - phy-mode: 与phy的连接方式。如sgmii, usxgmii等。
    - xpcs-speed: xpcs工作速率, 例如配置成1000, 强制xpcs 1G sgmii mode
    - hobot,xgmac_gmii: xgmac工作在gmii模式
- 更多高级特性配置, 可参考后续章节

#### MAC2MAC
- 和U-Boot下类似, MAC2MAC场景, 最主要就是配置成fixed-link模式

<Tabs groupId="soc_type">
<TabItem value="S100" label="S100">
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
</TabItem>

<TabItem value="S600" label="S600">
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
</TabItem>
</Tabs>

- fixed-link 常用节点含义描述
   - speed（整型，必须），表示链接速率，可以设置为10、100、1000。
   - full-duplex（布尔型，可选），表示双工方式，缺省是半双工方式。
   - pause（布尔型，可选），表示是否使能pause，缺省禁止pause。
   - asym-pause（布尔型，可选），表示是否使能asym-pause，缺省禁止asym-pause。
   - link-gpio（gpio-list，可选），表示是否可以读取 gpio 以确定链接是否已启动。

#### TSO
- 即TCP Segmentation Offload, 现代网卡硬件支持TCP分段卸载功能, 以减轻TCP分段业务的cpu负载。
- TSO开启后， 内核的GSO(Generic Segmentation Offload)会自动开启。
- 可以通过hobot, tso标记进行网卡硬件tso功能的控制。
```dts
    hobot,tso = <1>;            // 打开网卡TSO功能
```

#### XGMAC配置成1G模式
<DocScope products="RDK S600">
- 该功能仅S600万兆网卡需要。(S100默认就是1G千兆模式)
- 主要通过设备树hsis, 以及独对应网卡节点进行配置, 例如
```dts
    hsis0: hsis0 {
        status = "okay";
        compatible = "hobot,super-hsis";
        xpcs-speed = <0 0 0 1000 10000 10000>; /*gmac0, gmac1, gmac2, xgmac0, xgmac1, xgmac2*/
    };
    ethernet3: xgmac0@0x33130000 {
        compatible = "hobot,hobot_xgmac";
        hobot,xgmac_gmii;
    };
```
- xpcs-speed:           配置1000前置xpcs工作在1G sgmii模式
- hobot,xgmac_gmii:     强制xgmac工作在gmii模式下

</DocScope>

#### 中断聚合
```dts
    ethernet3: xgmac0@0x33130000 {
        compatible = "hobot,hobot_xgmac";
        hobot,disable_coal;
    };
```
- hobot,disable_coal;   # 网卡默认是开启中断聚合功能的, 可以通过该标记关闭中断聚合功能

#### RSS
<DocScope products="RDK S600">
- 接收端缩放, 即多队列网卡硬件支持的接收端负载均衡技术
- 通常是万兆网卡, 例如S600需要该项技术
```dts
    ethernet3: xgmac0@0x33130000 {
        compatible = "hobot,hobot_xgmac";
        hobot,multi_irq;
        hobot,rss_en;
    };
```

- RSS网卡接收端缩放技术, 简单说就是网卡硬件通过计算数据包五元组(IP，端口, 协议)的hash值,
然后将网卡的中断, 通过相关策略, 分发到不同核心。以进行接收端cpu负载均衡的行为。
- 所以该技术依赖网卡硬件的hash算法, RSS特性支持, 以及网卡多中断机制。
- hobot,multi_irq;      # 网卡多中断支持, 注册多中断的不同ISR处理。
- hobot,rss_en;         # 网卡接收端缩放功能使能。

</DocScope>

#### HSIS, XPCS
<DocScope products="RDK S600">
```dts
    hsis0: hsis0 {
        status = "okay";
        compatible = "hobot,super-hsis";
        hsi-mode = <4>;
        refclk-mode = <0>;/* 0:internal; 1:external; */
        xpcs-speed = <0 0 0 5000 10000 10000>; /*gmac0, gmac1, gmac2, xgmac0, xgmac1, xgmac2*/
        hobot-txeq = <0 0 0 1 2 4>; /* gmac0/1/2 xgmac0/1/2 tx equalization control*/
        hobot-vboost = <5 5 5 5 5 5>; /*gmac0/1/2 xgmac0/1/2*/
    };
```
:::warning
- 开机启动时的hsis, xpcs配置, 是采用的U-Boot中hsis的配置。
- Linux中的hsis配置, 仅用于休眠唤醒时, 对hsis mode和xpcs模式的恢复。
- 所以, 当需要修改hsis配置时, 需要确保与U-Boot hsis节点同步修改。
:::
</DocScope>

#### 队列
- 现代网卡都是多队列网卡。
- 对于队列调度策略, 优先级配置等, 可以通过设备树进行配置。
```dts
    ethernet4: xgmac0@0x33140000 {
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

- hobot,mtl-tx-config配置：

| 属性                | 描述                                                                |
| ----                | ----                                                                |
| hobot,tx-sched-wrr  | 多队列时round robin调度，当没有tsn或业务优先级需求时 可以选择rr调度
| hobot,tx-sched-sp   | 严格优先级调度
| hobot,avb-algorithm | 发送队列avb机制可用于tsn
| hobot,dcb-algorithm | 队列0以及rr调度时，须配置成dcb模式
  
  
- hobot,mtl-rx-config配置：

| 属性                | 描述                                                                              |
| ----                | ----                                                                              |
| hobot,rx-sched-sp   | 接收严格优先级调度，接收队列无rr调度。
| hobot,avb-algorithm | 接收队列avb机制可用于接收gptp报文
| hobot,dcb-algorithm | dcb机制用于根据vlan优先级选择接收队列。从而达到不同的napi线程承接不同优先级的任务

:::tip
- 根据业务需求配置队列调度机制和队列的模式。
- 当配成多队列时，队列均分硬件buf，无多队列需求时，可以只保留一个队列独占全部硬件buf
:::


## 网卡常用命令介绍
### ethtool
- ethtool： 查看统计计数，设置phy等， 支持以下命令。
```bash
    # 查看统计计数
    ethtool -S eth0

    # 显示时间戳能力
    ethtool -T eth0

    # 进行Loopback测试
    ethtool -t eth0 offline

    # 控制TSO功能开关
    ethtool -K eth0 tso on/off

    # 控制checksum功能开关
    ethtool -K eth0 rx-checksum on/off

    # 切换网络速率
    ethtool -s eth0 speed 100 duplex full autoneg on

    # 开启帧抢占
    ethtool hobot_gmac --set-fp eth0 fp on
```

### vconfig
- 配置vlan
- 可用ip命令替代
```bash
   vconfig add eth0 3
```

### iperf3
- 带宽, 丢包等测试。
- 测试命令
```bash
   server: iperf3 -s
   client tcp: iperf3 -c serverip -t 60
   client udp: iperf3 -c serverip -u -b 1G -l 8K -t 60
```

### tcpdump
- 抓包工具
- 测试命令
```bash
    tcpdump -i eth1 -e              # 过滤报文并输出到终端
    tcpdump -i eth1 -w eth1.pcap    # 过滤报文保存到文档，可以用wireshark分析
```

### phytool
- 可以通过该工具读取和设置 c22/c45 phy寄存器。
- 例如
```bash
    # 帮助信息
    ADDR := C22 | C45
    C22 := <0-0x1f>
    C45 := <0-0x1f>:<0-0x1f>

    phytool read IFACE/ADDR/REG
    phytool write IFACE/ADDR/REG <0-0xffff>

    # 例子
    root@hobot:~# phytool read eth0/0x7:1/2
    0x002b

    root@hobot:~# phytool read eth1/0xE/2
    0x0141
```

## 网卡时间同步
- 包含PTP, PPS, PHC等技术。

### PPS
- Pulse Per Second. 秒脉冲, 网卡硬件层面的一种时间同步机制。通常与PTP(IEEE 1588)/gPTP配套使用。
以实现汽车, 机器人系统之间的时间同步。
- 分为pps in和pps out, 即可以作为从设备接收外部高精度的秒脉冲, 也可以作为主设备输出秒脉冲信号。

#### pps in
- pps in用于以太网PHC时间的snapshot的触发源。

#### pps out
- eth pps只支持单个pps out。
- 可以通过以下命令进行配置和测试
```bash
    ethtool hobot_gmac --set-flex-pps eth0 index 0 fpps on interval 1000000000
```

### PHC snapshot
- 即Ethernet PTP Hardware Clock, 网卡时间同步硬件时间戳。
- 获取phc snapshot时间，用于计算时间差。
- 举例说明使用方法
```c
    // 打开PHC设备
    phcfd = open(“/dev/ptp0”, O_RDWR);

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

### 时间同步gptp

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
    - 更详细配置参见第三方工具linuxptp源码中的automotive-master.cfg，automotive-slave.cfg，比如减少ptp同步完成时间。

### TSN
#### TSN介绍
- Time-Sensitive Networking, 时间敏感性网络。
- TSN由一系列技术标准构成，其主要分为时钟同步、数据调度（即整形器）以及系统配置三个部分相关通用标准。

#### TSN-VLAN
- TSN在IEEE 802.1Q仅指ISO/OSI参考模型的第二层数据链路层的标准。
- 802.1Q标准的VLAN，该标准在标准以太网帧中插入4个字节用于定义其特征，TSN的标签位定义下图所示：

![vlan-tag](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/ethernet/media/image15.png)

- 对TSN网络而言，不同优先级或服务等级（class of
service，CoS）的服务对应上图中的PCP码。优先级代码（prioritycode
point，PCP）由3位代码构成；3位PCP码定义了0（最低）～7（最高）这8个优先级，传输类型分别对应
基础、最大努力、卓越努力、严苛应用、延时和抖动小于100ms的视频、延时和抖动小于10ms的音频、内部网络控制、网络控制。

#### 多队列
- VLAN优先级以及多个协议需要多个队列来承接，多队列是实现TSN的基础。
- 数据包与队列的映射关系由网卡驱动中的ndo_select_queue方法实现。

#### 数据调度（整形器）
##### 基于信用的整形器机制（CBS）（IEEE 802.1-Qav）
- 每个队列设置一定的信用值，根据信用值对应带宽，CBS将队列分为Class A（Tight delay bound）和Class B（Loose delay bound）。

##### 增强型整形机制（ EST）（IEEE 802.1Qbv-2015）
- EST由IEEE 802.1Qbv定义，也叫TAS（Time Awareness Shaper）。是基于预先设定的周期性门控制列表，动态地为出口队列提供开/关控制的机制。
Qbv定义了一个时间窗口，是一个时间触发型网络（Time-trigged），这个窗口在这个机制中是被预先确定的，同时这个门控制列表被周期性的扫描，
并按预先定义的次序为不同的队列开放传输端口。

![tsn-est](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/ethernet/media/image16.jpg)

- IEEE 802.1Qbv规范的框图，说明了门控制列表如何根据为每个事件提供的时间表来管理门关闭（C-close）和打开（O-open）事件。
- GCL有以下两部分：
    - 时间间隔：定义时间，以纳秒为单位，在从列表中读取下一个门控制项之前，门控制项是有效的。
    - 门控：定义每个TC的门的逻辑1表示的开（O-open）或逻辑0表示的关（C-close）状态。

##### 帧抢占（ FPE）（IEEE 802.1Qbu-2016）
- 为了解决EST的保护带宽的浪费以及优先级反转问题，引入了抢占标准。因此，TSN的802.1Qbu和IEEE 802.3工作组共同开发了IEEE
802.3br，即可抢占式MAC机制，由可被抢占MAC（pMAC-Preemptable MAC）和快速MAC（eMAC-express MAC）组成。pMAC可以被eMAC抢占。
通过抢占，保护带宽可以被减少至最短低优先级帧片段。

![tsn-fpe](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/ethernet/media/image17.png)

:::tip
- 由于抢占改变了帧的格式，所以对接交换机时也需要对端支持FPE。
:::

#### 配置验证
##### tc
- 关于TSN各种特性, 通常采用Linux原生自带的tc命令(即Traffic Control)进行配置和验证
- 支持如下几种方式：
:::tip
   SHAPING（限制）、 SCHEDULING（调度）、POLICING（策略）、DROPPING（丢弃）
:::

##### CBS
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

##### EST
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

- wireshark抓包如下图：

![tc-est](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/ethernet/media/image27.png)

### 测试
#### 功能测试
- ping测试
    - 测试步骤：ping xx.xx.xx.xx

- ssh
    - 测试步骤：ssh root\@xx.xx.xx.xx

#### 稳定性测试
- reboot测试
    - 进行循环reboot测试，并检查网络是否可以ping通。

- 上下电测试
    <DocScope products="RDK S100">
    - 使用继电器进行循环上下电，检查S100网络是否正常开启。
    </DocScope>
    <DocScope products="RDK S600">
    - 使用继电器进行循环上下电，检查S600网络是否正常开启。
    </DocScope>

- iperf3 24小时测试
    - tcp测试
    ```bash
        Server:iperf3 -s
        Client:iperf3 -c x.x.x.x -t 86400
    ```
    - udp测试
    ```bash
        Server:iperf3 -s
        Client:iperf3 -c x.x.x.x -t 86400 -u -b 1G -l 8K
    ```

- up/down循环测试
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
##### 拓扑

<DocScope products="RDK S100">
- 直接S100直连即可
</DocScope>
<DocScope products="RDK S600">
- 直接S600直连即可
</DocScope>

##### napi独立线程化
- linux网络任务由ksoftirqd/n处理，默认任务优先级相对较低，独立后可提高CPU利用率以及TSN的相关的控制。
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
    - dmesg, pstore日志分析
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
- ethtool -S `<interface>` 查看报文mmc统计信息，以及其他的统计信息。
- netstat 查看协议栈相关的信息。如协议栈报文计数及tcp/udp状态信息等。

#### 开发常见问题排查
##### EQOS_DMA_MODE_SWR stuck
- 描述: emac软复位失败。
    1. U-Boot日志如下：EQOS_DMA_MODE_SWR stuck。
    2. linux日志：device or resource busy。dmesg日志如下：
    ```text
        [ 21.720702] hobot_gmac 330f0000.ethernet eth0: init_dma_engine: Failed to reset dma
        [ 21.720717] hobot_gmac 330f0000.ethernet eth0: hw_setup, DMA engine initilization failed
        [ 21.720723] hobot_gmac 330f0000.ethernet eth0: eth_netdev_open, Hw setup failed
    ```
- 故障排除。
    1. 检查SGMII参考时钟是否提供，若使用内部时钟检查clock是否使能。

##### phy link不上
- 故障排除。
    - 使用mdio/mii/phytool命令能否正常读写phy寄存器。
    - 检查phy时钟、phy 复位、phy供电等。
    - 检查变压器等。

##### 发送异常
- 故障排除。
    - 检查phy link是否UP。
    - 检查工作模式（速率，双工等）。
    - 确认transmit接口是否被调用。
    - 确认发送统计计数。
    - 对端查看是否错包等。
    - 使用环回定位故障点。

##### 接收异常
- 故障排查
    - 测量phy tx时钟。
    - mac环回，若正常收包。可判定phy tx时钟 与 MAC rx接收配合问题。
    - 查看是否有错包，如果有ECC错包可推断是信号质量问题。

##### 大量错包
- 故障排除。
    - 检查clk是否符合要求。
    - 条件允许的话，测下信号的眼图。
    - 降速测试。

### FAQ
#### TSN
<DocScope products="RDK S100">
- 问：S100支持哪些TSN标准？
</DocScope>
<DocScope products="RDK S600">
- 问：S600支持哪些TSN标准？
</DocScope>
- 答：基于信用的整形器机制（credit-based shaper，CBS）(IEEE
802.1-Qav)、 增强型整形机制（Enhancements to Scheduled Traffic，EST）（IEEE
802.1Qbv-2015）、 帧抢占（Frame Preemption，FPE）（IEEE 802.1Qbu-2016）。


#### phy
<DocScope products="RDK S100">
- 问：S100适配过哪些phy？
</DocScope>
<DocScope products="RDK S600">
- 问：S600适配过哪些phy？
</DocScope>
- 答：Realtek 8211、Marvell 88E1512、Marvell 88Q2121、Marvell 88Q2220、TI dp83867、Marvell CUX3520。

#### 网络环境
<DocScope products="RDK S100">
- 问：S100无法ping通Windows，Windows可以ping通S100？
- 答：检查Windows的防火墙是否关闭，windows自带防火墙如下图：
![windows-firwall](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/ethernet/media/image24.png)
</DocScope>

#### U-Boot调试与升级
- 问：U-Boot网络自协商失败或协商成千兆后无法PING通？
- 答：检查网络是否为6类线。phy和对端可能在百兆或千兆之间切换，导致mac与phy之间的速率不匹配。

- 问：U-Boot无法读写phy？
- 答：检查phy是否解复位，软件使用的mdio地址与硬件配置是否一致。

- 问：U-Boot升级失败（ping不通）？
- 答：检查IP的配置，serverip，使用小局域网或直连PC。
检查MAC的配置，检查使用的网口是否为期望的网口。 检查网线是否为6类线。

