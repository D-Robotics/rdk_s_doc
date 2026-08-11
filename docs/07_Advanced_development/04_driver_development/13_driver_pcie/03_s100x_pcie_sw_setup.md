---
sidebar_position: 3
---
# PCIe 模块功能在 kernel 下的配置

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

在 Kernel 中，PCIe 的配置分为 defconfig 和 DTS 两部分：

## defconfig

在内核的 defconfig 文件中，需要包含如下基础配置：

```shell
CONFIG_PCI=y
CONFIG_PCI_DOMAINS=y
CONFIG_PCI_DOMAINS_GENERIC=y
CONFIG_PCI_SYSCALL=y
CONFIG_PCIEAER=y
CONFIG_PCIE_PTM=y
CONFIG_PCI_MSI=y
CONFIG_PCI_MSI_IRQ_DOMAIN=y
CONFIG_PCI_QUIRKS=y
CONFIG_PCI_DEBUG=y
CONFIG_PCI_REALLOC_ENABLE_AUTO=y
CONFIG_PCI_IOV=y
CONFIG_PCIE_BUS_DEFAULT=y
CONFIG_PCIEPORTBUS=y
```

使能 RC 模式需要的配置如下：

```shell
CONFIG_PCIE_HOBOT=m
CONFIG_PCIE_HOBOT_RC=m
CONFIG_PCIE_HOBOT_EP_DEV=m
CONFIG_PCIE_HOBOT_EP_DEV_MAN=m
```

RC 模式支持 NVME 需要的配置如下：

```shell
CONFIG_BLK_DEV_NVME=m
```

使能 EP 模式需要的配置如下：

```shell
CONFIG_PCIE_HOBOT=m
CONFIG_PCIE_HOBOT_EP=m
CONFIG_PCIE_HOBOT_EP_FUN=m
```

其中 hybrid 为必须使能的功能，已经被上述配置包含，其他功能可以按需配置。

```shell
CONFIG_PCIE_HOBOT_DEBUG=y
```

## DTS
要注意同一个控制器只能配置为 RC 或者 EP 模式。

### RC 模式

控制器的配置节点为： `hobot_pcie_rc0` 和 `hobot_pcie_rc1` 。

一般情况下只需要修改 `status` 字段由 `disable` 为 `okay` 即可使能对应控制器的 RC 模式，反之关闭。

### EP 模式

控制器的配置节点为： `hobot_pcie_ep0` 和 `hobot_pcie_ep1` 。

除了控制器本身需要配置，其子节点 `funX` 也需要进行配置。
`fun0` 必须配置为使能状态。

### PCIE 链路配置
:::warning
- S100和 S600的 pcie/ethernet phy 复用情况有微小差异。
- 主要是 S100支持 PCIE x2 + GMAC0 + GMAC1, 而 S600支持 PCIE X2 + PCIE X2模式。
- 细节参考下文以及 dts 描述。
:::

<DocScope products="RDK S100">
S100 PCIE 的链路支持3种模式：
- 0x1: PCIE0 x4 Lane;
- 0x4: PCIE0 x2 Lane + GMAC0 + GMAC1;
- 0x8: PCIE0 x1 Lane + PCIE1 x1 Lane + GMAC0 + GMAC1;

链路配置在 dts 内如下：
```dts
/* rdk-v0p5.dtsi */
...

    &hsis0 {
        hsi-mode = <0x4>;  /* 0x1: pcie x4, 0x4: pcie x2 + gmac0 + gmac1, 0x8: pcie0 x1 + pcie1 x1 + gmac0 + gmac1 */
    };

...
```
</DocScope>
<DocScope products="RDK S600">
S600 PCIE 的链路支持3种模式：
- 0x1: PCIE0 x4 Lane;
- 0x2: PCIE0 x2 Lane + PCIE1 x2 Lane;
- 0x4: PCIE0 x1 Lane + PCIE1 x1 Lane + GMAC0 + GMAC1;
```dts
/* rdk-s600-mcb.dtsi */
...
    &hsis0 {
        hsi-mode = <0x4>;  /* 0x1: pcie x4, 0x2: pcie x2x2, 0x4: pcie x2 + gmac0 + gmac1 */
    };
...
```
</DocScope>
