---
title: "Boot-related Configuration"
sidebar_position: 4
description: "Boot-related configuration options for RDK config.txt"
---

# Boot-related Configuration

This page lists the configuration options related to system boot in config.txt, including kernel cmdline, boot medium selection and AB boot. For how to modify, see [Customizing config.txt](./02_custom.md).

## Kernel cmdline (bootargs)

Use the `bootargs` configuration option to append kernel boot parameters, without modifying the U-Boot default cmdline:

```text
# CPU isolation (isolate CPU 1-2 for real-time tasks)
bootargs=isolcpus=1-2

# Kernel print level
loglevel=8

# Disable kernel address space randomization
bootargs=norandmaps
```

> The value of `bootargs` is **appended** to the end of the U-Boot default cmdline, and does not override the default parameters.

## Boot Medium

- RDK S100 boots from eMMC by default (the boot medium is controlled by DIP switch SW3).
- RDK S600 boots from UFS by default, and also supports booting from M.2 NVMe (controlled by DIP switch SW8).

The boot medium is selected via hardware DIP switches, and is **not configured in config.txt**. For the DIP switch descriptions, see
[RDK S100 Hardware Introduction](../../01_Quick_start/01_hardware_introduction/01_rdk_s100.md),
[RDK S600 Hardware Introduction](../../01_Quick_start/01_hardware_introduction/02_rdk_s600.md).

## DTS Node Control

Use `fdt-enable`/`fdt-disable` to dynamically enable/disable DTS nodes at boot time, without recompiling the device tree:

```text
# Enable the UART node
fdt-enable=/soc/uart@394C0000;

# Disable the I2C node
fdt-disable=/soc/i2c@3932000;
```

> The node path must match the full path in the device tree. You can run `ls /proc/device-tree/soc/` to view the node names. The example is an S100 node address; S600 node addresses are different.

## Related Documentation

- [config.txt Usage Guide](./01_usage.md)
- [Customizing config.txt](./02_custom.md)
- [Common Configuration Options Reference](./03_common_options.md)
- [Getting Started with RDK](../../01_Quick_start/02_getting_started.md)
- [Setting Up the Development Environment](../../07_Advanced_development/06_environment_build/01_environment_build.md)
