---
title: "config.txt Parser Development Guide"
sidebar_position: 5
description: "Guide on the config.txt parsing mechanism and developing new configuration options"
---

# config.txt Parser Development Guide

This page is aimed at Mode 3 developers, introducing the U-Boot parsing mechanism of config.txt and how to add custom configuration options.

> For user-side configuration usage, see [config.txt Usage Guide](./01_usage.md); for common configuration options, see [Common Configuration Options Reference](./03_common_options.md).

## Parsing Mechanism

config.txt is parsed by U-Boot at the boot stage. The parsing code is located in `parse_config_file()` in
`board/hobot/common/drobot_boot_config.c`:

1. Reads the `config.txt` file from the boot partition into memory
2. Processes it line by line: skips empty lines and `#` comment lines, and splits on the first `=` into key/value
3. Calls `process_key_val_pair()` to handle each key/value:
   - `fdt-setprop`: appended to the environment variable `fdt-setprop`
   - Keys starting with `ion*`: split into `<name>=<size>` and written to environment variables
   - `bootargs`: appended to the existing `bootargs` environment variable
   - Other keys: directly `env_set(key, value)`
4. After parsing is complete, the kernel is loaded; `drobot_fdt_runtime_conf()` in
   `board/hobot/common/drobot_fdt_runtime_config.c` then consumes environment variables such as
   `fdt-enable`/`fdt-disable`/`fdt-setprop`/`fdt-remove`/`dtbo_*`, dynamically modifying the device tree after the DTB is loaded

## How Configuration Options Are Handled

Configuration options in config.txt fall into two categories by how they are handled:

### Environment Variable Category

Directly set U-Boot environment variables for the subsequent boot flow to read, such as `bootargs` (appended to the kernel
cmdline), `loglevel` (assembled into the cmdline by board-level code), and `ion*` (setting memory parameters).

### Device Tree Category

After setting the environment variables, they are consumed by `drobot_fdt_runtime_config.c` after the DTB is loaded:
`fdt-enable`/`fdt-disable` (changing node status), `fdt-setprop` (changing properties),
`fdt-remove` (removing nodes/properties), `dtbo_file_path` and so on (applying DTB Overlays).

## Adding New Configuration Options

To add a custom config.txt configuration option, modify the U-Boot source code:

1. No parsing code change is needed for generic options: `key=value` is automatically written to an environment variable with the same name,
   which can then be read in the board-level code or the boot flow.
2. For options that require special handling, add a new branch in `process_key_val_pair()` in
   `board/hobot/common/drobot_boot_config.c`.
3. If the option is used to modify the device tree, add the corresponding consumption logic in
   `drobot_fdt_runtime_conf()` in
   `board/hobot/common/drobot_fdt_runtime_config.c`.

:::note Development Reference
The config.txt parsing source code is located in the U-Boot source tree of the BSP, at the path
`board/hobot/common/drobot_boot_config.c`. For how to obtain the source code, see
[Development Environment and Compilation](../../07_Advanced_development/06_environment_build/01_environment_build.md).
:::

## Related Documentation

- [config.txt Usage Guide](./01_usage.md)
- [Customizing config.txt](./02_custom.md)
- [Common Configuration Options Reference](./03_common_options.md)
- [Boot-related Configuration](./04_boot_options.md)
- [Development Environment and Compilation](../../07_Advanced_development/06_environment_build/01_environment_build.md)
