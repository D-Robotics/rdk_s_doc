---
title: "Customizing config.txt"
sidebar_position: 2
description: "How to create and modify the RDK config.txt configuration file"
---

# Customizing config.txt

config.txt is the boot configuration file of the RDK. It is used to configure kernel boot parameters, DTS nodes, DTB Overlay and so on at the U-Boot stage, allowing you to adjust system behavior without recompiling the firmware.

## File Location

The default path of config.txt is `/boot/config.txt`, located on the boot partition. In the factory image, this file is empty (0 bytes) by default. Configuration items need to be added by yourself as needed.

## Format Rules

- One configuration per line: `<key>=<value>`
- All content after the first `=` is the value of that key
- A single line must not exceed 1024 characters
- A line starting with `#` is a comment

```text
# This is a comment
bootargs=isolcpus=1-2
loglevel=8
```

## How to Modify

### Method 1: Edit Directly on the Board

The boot partition is already mounted to `/boot` via `/dev/block/platform/by-name/boot_cur`
(see `/etc/fstab`), so manual mounting is usually not needed. If it is not mounted, just run `mount /boot`.

```bash
# If /boot is not mounted, mount it first (relies on the by-name/boot_cur entry in /etc/fstab)
mount /boot

# Edit config.txt
vi /boot/config.txt

# Save, then it takes effect after reboot
reboot
```

### Method 2: Via the U-Boot Command Line

Press any key at boot time to enter the U-Boot command line, and use `setenv` for temporary modification (higher priority than config.txt). Unlike the append semantics of the config.txt `bootargs=` key, `setenv bootargs` replaces the environment variable entirely, overwriting the default cmdline (key parameters such as `root=` and `console=`); to append parameters, reference the existing value:

```text
# U-Boot command line (append kernel parameters, keeping the default cmdline)
setenv bootargs ${bootargs} isolcpus=1-2 loglevel=8
boot
```

:::warning Priority
The full environment variable priority order is: `setenv (manual in U-Boot)` > `config.txt (configuration file)` > `saveenv (last saved)`
:::

:::warning AVB Conflict
Modifying the contents of the boot partition conflicts with the requirements of AVB (Android Verified Boot). AVB is disabled by default; if AVB is enabled, config.txt cannot be used.
:::

## Taking Effect

config.txt is automatically read and parsed by U-Boot at every boot. After modification, **reboot the development board** to take effect. There is no need to re-flash the firmware.

## Verification

- Mount ready: `mount | grep /boot` shows the boot partition is mounted, or `vi /boot/config.txt` can read and write normally.
- Configuration takes effect: after modifying, `reboot`; after reboot, use `cat /proc/cmdline` to check bootargs and `ls /proc/device-tree/soc/` to check the fdt nodes to confirm it took effect.

## FAQ

### Read-Only or File Not Found When Editing config.txt

**Cause**: The boot partition is not mounted, or there is no write permission.

**Solution**: Run `mount /boot` to mount it (relies on the by-name/boot_cur entry in `/etc/fstab`), and edit with `sudo`.

### Default cmdline Lost After Appending Parameters

**Cause**: Using `setenv bootargs` in U-Boot replaces the whole environment variable, overwriting the default parameters such as `root=`/`console=`.

**Solution**: When appending, use `setenv bootargs ${bootargs} <new parameters>` to reference the existing value.

### Modification Does Not Take Effect When AVB Is Enabled

**Cause**: Modifying the boot partition content conflicts with AVB verification.

**Solution**: config.txt cannot be used when AVB is enabled; disable AVB first.

## Related Documentation

- [config.txt Usage Guide](./01_usage.md)
- [Common Configuration Options Reference](./03_common_options.md)
- [Boot-related Configuration](./04_boot_options.md)
