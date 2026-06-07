# PCIe Module Function Configuration in Kernel

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_pcie/s100x_pcie_sw_setup

In the Kernel, PCIe configuration is divided into two parts: defconfig and DTS:

## defconfig

The kernel's defconfig file must include the following basic configurations:

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

The configurations required to enable RC mode are as follows:

```shell
CONFIG_PCIE_HOBOT=m
CONFIG_PCIE_HOBOT_RC=m
CONFIG_PCIE_HOBOT_EP_DEV=m
CONFIG_PCIE_HOBOT_EP_DEV_MAN=m
```

The configurations required for NVME support in RC mode are as follows:

```shell
CONFIG_BLK_DEV_NVME=m
```

The configurations required to enable EP mode are as follows:

```shell
CONFIG_PCIE_HOBOT=m
CONFIG_PCIE_HOBOT_EP=m
CONFIG_PCIE_HOBOT_EP_FUN=m
```

Among these, hybrid is a mandatory feature and is already included in the above configurations. Other features can be configured as needed.

```shell
CONFIG_PCIE_HOBOT_DEBUG=y
```

## DTS

Note that the same controller can only be configured in either RC or EP mode.

### RC Mode

The controller configuration nodes are: `hobot_pcie_rc0` and `hobot_pcie_rc1` .

In general, simply change the `status` field from `disable` to `okay` to enable RC mode for the corresponding controller, or change it back to disable it.

### EP Mode

The controller configuration nodes are: `hobot_pcie_ep0` and `hobot_pcie_ep1` .

In addition to configuring the controller itself, its child nodes `funX` also need to be configured. `fun0` must be enabled.

### PCIE Link Configuration

warning

- There are slight differences in PCIe/ethernet PHY multiplexing between S100 and S600.
- The main difference is that S100 supports PCIE x2 + GMAC0 + GMAC1, while S600 supports PCIE X2 + PCIE X2 mode.
- Refer to the details below and the dts description.

S100 PCIE link supports 3 modes:

- 0x1: PCIE0 x4 Lane;
- 0x4: PCIE0 x2 Lane + GMAC0 + GMAC1;
- 0x8: PCIE0 x1 Lane + PCIE1 x1 Lane + GMAC0 + GMAC1;
The link configuration in dts is as follows:

```dts
/* rdk-v0p5.dtsi */
...

    &hsis0 {
        hsi-mode = <0x4>;  /* 0x1: pcie x4, 0x4: pcie x2 + gmac0 + gmac1, 0x8: pcie0 x1 + pcie1 x1 + gmac0 + gmac1 */
    };

...
```

S600 PCIE link supports 3 modes:

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
