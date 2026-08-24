---
title: "Common Configuration Options Reference"
sidebar_position: 3
description: "Quick reference table for common RDK config.txt configuration options"
---

# Common Configuration Options Reference

This page lists the commonly used configuration options in config.txt, organized by category for quick lookup. For how to modify the configuration file, see [Customizing config.txt](./02_custom.md).

> The DTS node addresses in the examples are S100 examples; S600 node addresses are different.
> Use the actual node names under `/proc/device-tree/soc/` on the board as the reference.

## Kernel Boot Parameters

| Option | Description | Example |
| --- | --- | --- |
| `bootargs` | Kernel cmdline parameters (appended to the default cmdline) | `bootargs=isolcpus=1-2` |
| `loglevel` | Kernel boot print level (0-8) | `loglevel=8` |

## DTS Node Control

| Option | Description | Example |
| --- | --- | --- |
| `fdt-enable` | Enable DTS nodes (multiple nodes separated by semicolons) | `fdt-enable=/soc/uart@394C0000;` |
| `fdt-disable` | Disable DTS nodes | `fdt-disable=/soc/i2c@3932000;` |

## DTS Property Modification

| Option | Description | Example |
| --- | --- | --- |
| `fdt-setprop` | Set node properties (`/node-path property-name value`, multiple entries separated by `;`) | `fdt-setprop=/soc/uart@394C0000 status "okay"` |
| `fdt-remove` | Remove nodes or properties (`node-path` or `node-path property-name`, separated by `;`) | `fdt-remove=/soc/i2c@3932000;` |

## DTB Overlay

| Option | Description | Example |
| --- | --- | --- |
| `dtbo_file_path` | Apply DTB Overlay files (relative to the boot partition, multiple files separated by `;`) | `dtbo_file_path=/spi0_cs1_dev.dtbo` |
| `dtbo_dev_part` | Partition where the Overlay files are located (`<device number>:<hexadecimal partition number>`) | `dtbo_dev_part=0:0x10` |

> The display output interface (DSI/HDMI) is configured through Display Options in [srpi-config](../04_srpi_config/01_overview.md), not in config.txt.

> For how to develop new configuration options and the parsing mechanism, see [config.txt Parser Development Guide](./05_parser_dev.md).

## Verification

- Fill in the configuration options on this page, write them to `/boot/config.txt`, and reboot; confirm the appended parameters with `cat /proc/cmdline` for `bootargs`, and confirm the node or Overlay took effect with `ls /proc/device-tree/soc/` for `fdt-enable`/`dtbo_file_path`. See [config.txt Usage Guide](./01_usage.md) for details.

## FAQ

### Configuration Option Does Not Take Effect

**Cause**: The key name is misspelled, or the line starts with `#` and is skipped as a comment.

**Solution**: Check the key name against the quick reference on this page; confirm it is not a comment line; a single line must not exceed 1024 characters.

### S100 Example Node Not Found on the S600

**Cause**: The DTS node addresses on this page are S100 examples; the S600 uses different node addresses.

**Solution**: Use the actual node names under `/proc/device-tree/soc/` on the board.

## Related Documentation

- [config.txt Usage Guide](./01_usage.md)
- [Customizing config.txt](./02_custom.md)
- [Common Configuration Options Reference](./03_common_options.md)
- [Boot-related Configuration](./04_boot_options.md)
- [config.txt Parser Development Guide](./05_parser_dev.md)
