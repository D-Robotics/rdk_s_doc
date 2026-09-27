---
sidebar_position: 3
title: "PCIe 模块功能在 kernel 下的配置"
description: "PCIe 的 defconfig 配置项、DTS 控制器节点与链路模式设置"
---
# PCIe 模块功能在 kernel 下的配置

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

在 Kernel 中，PCIe 的配置分为 defconfig 和 DTS 两部分，本文说明这两部分的配置项与产品差异。

- **定位**：给出使能 PCIe（RC 或 EP 模式）所需的内核配置与设备树配置。
- **适用读者**：需要自行编译内核、调整 PCIe 链路模式的模式 3 商业客户/深度团队。
- **前置条件**：已了解 PCIe 硬件规格与软件模块划分，参见 [PCIe 硬件规格](./01_s100x_pcie_hw_guide.md)、[PCIe 软件架构](./02_s100x_pcie_sw_arch.md)。
- **与其他模块关系**：PCIe 与 GMAC 复用 HSI 端口，`hsi-mode` 决定二者如何分配 lane。

## defconfig

内核最终生效的 PCIe 基础配置如下。核对方式：编译主机上查看 `out/build/kernel/.config`，或板端执行 `zcat /proc/config.gz`。

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
CONFIG_PCIE_BUS_SAFE=y
CONFIG_PCIEPORTBUS=y
```

:::info 说明
上表中除 `CONFIG_PCI` 与 `CONFIG_PCIE_BUS_SAFE` 外的各项**并未显式写在 `drobot_s{100,600}_defconfig` 中**，而是由 `config PCIE_HOBOT` 通过 `select` 强制选中。被 `select` 的符号无法在 `menuconfig` 中关闭，如需调整请修改 `source/hobot-drivers/pcie/Kconfig`。
:::

使能 RC 模式需要的配置如下（`CONFIG_PCIE_HOBOT` 由 `CONFIG_PCIE_HOBOT_RC` 通过 `select` 选中，无需单独写入 defconfig）：

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

使能 EP 模式需要的配置如下（`CONFIG_PCIE_HOBOT` 由 `CONFIG_PCIE_HOBOT_EP` 通过 `select` 选中）：

```shell
CONFIG_PCIE_HOBOT=m
CONFIG_PCIE_HOBOT_EP=m
CONFIG_PCIE_HOBOT_EP_FUN=m
```

其中 hybrid 为必须使能的功能，已经被上述配置包含。可按需配置的开关为 VNET 相关项：

```shell
CONFIG_PCIE_HOBOT_EP_FUN_VNET=y
CONFIG_PCIE_HOBOT_EP_DEV_VNET=y
```

调试相关配置：

```shell
CONFIG_PCIE_HOBOT_DEBUG=y
```

<DocScope products="RDK S600">
S600 的 defconfig 还包含以下配置项，用于板载 redriver 的链路补偿：

```shell
CONFIG_PCIE_HOBOT_REDRIVER=y
```
</DocScope>

## DTS
要注意同一个控制器只能配置为 RC 或者 EP 模式。

### RC 模式

控制器的配置节点为： `hobot_pcie_rc0` 和 `hobot_pcie_rc1` 。

使能或关闭某个控制器的 RC 模式，通过修改其 `status` 字段实现：写 `okay` 使能，写 `disabled` 关闭。

下游设备的上电与 PERST 释放时机由 `switch-perst-gpios` 是否存在决定：配置了该项时，驱动先释放 Switch 的 PERST 并建立主链路，再释放各下游设备的 ponrst 与 PERST；未配置时直接释放下游设备的 ponrst 与 PERST 后建链。两产品的 `hobot_pcie_rc0` 均配置了该项。

<DocScope products="RDK S100">
芯片级设备树 `drobot-s100-soc.dtsi` 中 `hobot_pcie_rc0` 默认即为 `okay`，`hobot_pcie_rc1` 默认为 `disabled`，具体状态以板级 dts 的覆盖结果为准。

控制器的 RC/EP 角色由 SIP 型号与 `ADC_IO[1]` 的档位共同决定：`0x4` 为 S100P + RC，`0x5` 为 S100P + EP，`0xA` 为 S100E + RC，`0xB` 为 S100E + EP（SIP 硬件设计指南 p.58）。该档位由硬件决定，不属于设备树配置项。
</DocScope>

<DocScope products="RDK S600">
芯片级设备树 `drobot-s600-soc.dtsi` 中 `hobot_pcie_rc0` 与 `hobot_pcie_rc1` 默认均为 `disabled`，由板级 `rdk-s600-mcb.dtsi` 覆盖为 `okay`。

控制器的 RC/EP 角色由软件决定，无需硬件配置（模块硬件设计指南 p.25）。
</DocScope>

### EP 模式

控制器的配置节点为： `hobot_pcie_ep0` 和 `hobot_pcie_ep1` 。

除了控制器本身需要配置，其子节点 `funX` 也需要进行配置。
`fun0` 必须配置为使能状态。

### PCIe 链路配置

PCIe 与以太网 MAC 复用 HSI 端口的 lane，两种产品的分配方式不同，各自的可选模式见下。

<DocScope products="RDK S100">
S100 PCIe 的链路支持 3 种模式：
- 0x1: PCIe0 x4 Lane;
- 0x4: PCIe0 x2 Lane + GMAC0 + GMAC1;
- 0x8: PCIe0 x1 Lane + PCIe1 x1 Lane + GMAC0 + GMAC1;

链路配置在 dts 内如下：
```dts
/* rdk-v0p5.dtsi */
...

    &hsis0 {
        hsi-mode = <0x4>;  /* 0x1: pcie x4, 0x4: pcie x2 + gmac0 + gmac1, 0x8: pcie0 x1 + pcie1 x1 + gmac0 + gmac1 */
    };

...
```

两个控制器（RC/EP 两种角色共 4 个节点）的 lane 能力（见 `drobot-s100-soc.dtsi`）：

| 控制器 | max-link-speed | num-lanes | 说明 |
|---|---|---|---|
| `hobot_pcie_rc0` / `ep0` | 4（Gen4） | 2 | 支持 Gen4 x2 |
| `hobot_pcie_rc1` | 1（Gen1） | 2 | 受限至 Gen1 x2 |
| `hobot_pcie_ep1` | 1（Gen1） | 1 | 受限至 Gen1 x1 |
</DocScope>
<DocScope products="RDK S600">
S600 PCIe 的链路支持 3 种模式：
- 0x1: PCIe0 x4 Lane;
- 0x2: PCIe0 x2 Lane + PCIe1 x2 Lane;
- 0x4: PCIe0 x2 Lane + GMAC0 + GMAC1;

```dts
/* rdk-s600-mcb.dtsi */
...
    &hsis0 {
        hsi-mode = <2>;  /* 0x1: pcie x4, 0x2: pcie x2x2, 0x4: pciex2 + ethx2 */
    };
...
```

两个控制器（RC/EP 两种角色共 4 个节点）的 lane 能力（见 `drobot-s600-soc.dtsi`）：

| 控制器 | max-link-speed | num-lanes | 说明 |
|---|---|---|---|
| `hobot_pcie_rc0` / `ep0` | 4（Gen4） | 2 | 支持 Gen4 x2 |
| `hobot_pcie_rc1` / `ep1` | 4（Gen4） | 2 | 支持 Gen4 x2 |
</DocScope>

:::info 说明
`hsi-mode` 的取值定义见驱动 `hobot-drivers/ethernet/hobot/core/hobot_xpcs.c`：`CFG_MODE_PCIEX4 = 0x1`、`CFG_MODE_PCIEX2X2 = 0x2`、`CFG_MODE_ETHX2_PCIEX2 = 0x4`、`CFG_MODE_ETHX2_PCIEX1X1 = 0x8`。
:::

## 调试

### 确认链路与设备

```bash
lspci                          # 已识别的 PCIe 设备；无输出说明没有任何链路 training 成功
ls /sys/bus/pci/devices/       # 已识别设备的 sysfs 节点
lspci -vv | grep -i lnksta     # 每一跳链路协商出的速率与宽度
```

链路没起来时，内核日志里会出现驱动打印的失败信息：

```bash
dmesg | grep -iE "link up|failed link"
# <控制器设备名>: not link up             ← establish_all_link 失败
# <控制器设备名>: all failed link.        ← resume 流程中建链失败
```

### 查看 LTSSM 状态

链路 training 卡住时，可让驱动导出 LTSSM 状态机的停留轨迹，看它停在哪一步。每个控制器在 `/dev/` 下有一个字符设备节点（`hobot_pcie0` 对应 `hobot_pcie_rc0`，`hobot_pcie1` 对应 `hobot_pcie_rc1`，即设备树的 `ctrl-index`）：

| 写入命令 | 作用 |
|---|---|
| `echo 5 > /dev/hobot_pcie0` | 复位 LTSSM 并打印一次状态轨迹 |
| `echo 6 <间隔> > /dev/hobot_pcie0` | 启动 LTSSM 状态轮询线程，状态变化时打印，`<间隔>` 为轮询周期 |
| `echo 7 > /dev/hobot_pcie0` | 停止轮询线程 |

:::warning 注意
命令 6 必须带轮询周期参数，只写 `echo 6` 不会启动线程（驱动对周期为 0 直接返回）。参数按**十六进制**解析，单位为毫秒，上限截断为 1000，例如 `echo 6 64` 表示 0x64 = 100ms。
:::

轨迹输出在内核日志中，每行给出状态机在每个状态的停留计数与状态名，末行即 training 卡住的位置：

```bash
echo 5 > /dev/hobot_pcie0
dmesg | tail -20
# <控制器设备名>: LTSSM0: <停留计数> <寄存器值> <状态值> <状态名>
# <控制器设备名>: LTSSM1: <停留计数> <寄存器值> <状态值> <状态名>
```

:::info 说明
该接口由 `CONFIG_PCIE_HOBOT_DEBUG` 控制，S100 / S600 的默认 defconfig 中均为 `=y`，无需额外开启。命令值与分支实现见 `hobot-drivers/pcie/hobot-debug.c` 与 `hobot.h`。
:::

## 常见问题

### `lspci` 未显示 PCIe 设备

**现象**：上电后 `lspci` 无输出或缺少预期设备，内核日志出现 `not link up`。

**原因**：链路 training 未完成，下游设备没有被识别。常见原因是下游设备供电或 PERST 未释放。

**解决**：

1. 确认控制器已使能：设备树中 `hobot_pcie_rcX` 的 `status` 为 `okay`。
2. 确认 `hsi-mode` 把 lane 分给了该控制器（见 [PCIe 链路配置](#pcie-链路配置)）。lane 未分配时控制器上不会有链路。
3. 核对 `ep-ponrst-gpios`（供电复位）与 `ep-perst-gpios`（PERST）是否覆盖了该控制器下的**全部**下游设备。驱动建链时对数组元素统一施加上电与解复位时序，数组内元素的先后顺序不影响结果；漏写的设备不会被驱动执行复位序列，其上电与复位状态需按原理图确认。
4. 仍未定位时，用 [查看 LTSSM 状态](#查看-ltssm-状态) 确认 training 卡在哪一步。

### 链路速率或 lane 数低于预期

**现象**：`lspci -vv` 中 `LnkSta` 协商出的速率或宽度低于设备本身能力。

**原因**：`hsi-mode` 分给该控制器的 lane 少于设备能力，或控制器被 `max-link-speed` / `num-lanes` 限制。

**解决**：核对 `hsi-mode` 与设备树中控制器的 `num-lanes`、`max-link-speed` 是否匹配预期，见 [PCIe 链路配置](#pcie-链路配置)。

## 相关文档

- [PCIe 软件架构](./02_s100x_pcie_sw_arch.md)
- [PCIe 用户态 API](./04_s100x_pcie_libhbpciehal.md)
- [PCIe 硬件规格](./01_s100x_pcie_hw_guide.md)
