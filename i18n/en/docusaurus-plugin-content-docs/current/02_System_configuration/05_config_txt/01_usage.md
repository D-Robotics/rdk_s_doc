---
sidebar_position: 1
title: "config.txt Usage Guide"
description: "config.txt configuration file usage guide: bootargs, loglevel, DTS nodes, DTB Overlay"
---

# config.txt Usage Guide
:::warning
- All configurations in the configuration file can be manually overridden within U-Boot. Manual configuration in U-Boot (using setenv in the U-Boot command line) has a priority **higher than** the configurations in the configuration file. The full environment variable priority order is: `setenv > configuration file > saveenv from the last boot`;
- Throughout this chapter, "configuration file" refers to the configuration file whose **default path** is `/boot/config.txt`;
- Using the configuration file requires modifying the contents of the boot partition, which conflicts with the requirements of [AVB](https://source.android.com/docs/security/features/verifiedboot). Therefore this feature cannot be used when AVB is enabled (AVB is **disabled by default**);
:::

## Usage Guide
:::info Note
- The default format of the configuration file is `<key>=<value>`. Everything after the first `=` is the configuration value of the `<key>` before the `=`;
- A single line of configuration in the configuration file must not exceed 1024 characters;
- Configurations in the configuration file are not saved as U-Boot's default configuration by default;
- In the factory image, `/boot/config.txt` is an empty file (0 bytes) by default. Configuration items need to be added by yourself as needed;
:::

### Configure Kernel bootargs (kernel cmdline)
Edit the configuration file and add: `bootargs=<custom bootargs>`, for example:
```
# Add cpu isolation configuration
bootargs=isolcpus=1-2
```

### Modify the Kernel Boot Print Level
Edit the configuration file and add: `loglevel=<custom print level>`, for example:
```
# Add kernel loglevel configuration
loglevel=8
```

### Temporarily Modify the dts
#### Enable or Disable Specific Nodes
Edit the configuration file and add: `fdt-enable=<full path of dts node 1>;<full path of dts node 2>;`; `fdt-disable=<full path of dts node 1>;<full path of dts node 2>;`, for example:
```
# Enable kernel dts node
fdt-enable=/soc/uart@394C0000;

# Disable kernel dts node
fdt-disable=/soc/uart@394C0000;
```

:::info Note
- The ";" at the end of the configuration line in the example must not be omitted;
- The full path of a dts node can be obtained on the board under `/proc/device-tree`, for example:
    ```shell
      root@ubuntu:~# realpath --relative-to=/proc/device-tree/ /proc/device-tree/soc/uart@394C0000
      soc/uart@394C0000
    ```
    Note that the path obtained by the command needs a "/" added at the beginning of the line;
- The node addresses in the example are S100 nodes (such as `uart@394C0000`); S600 node addresses are different
  (such as `uart@3484A000`). Use the actual node names under `/proc/device-tree/soc/` on the board as the reference;
:::

#### Configure DTB Overlay Files

The following are the related notes for DTB Overlay:
1. Kernel V6.1 official documentation: [Devicetree Overlay Notes](https://kernel.org/doc/html/v6.1/devicetree/overlay-notes.html);
2. U-Boot V2022.10 official documentation: [Device Tree Overlays](https://docs.u-boot.org/en/v2022.10/usage/fdt_overlays.html);

Brief introduction: DTB Overlay files provide the functionality of **adding/modifying** (deletion is not supported) the dtb file used for the current boot, without modifying the dts file used for the current boot.

The following is an example DTB Overlay file:
```dts
/*
 * Sample dtb overlay source file
 * spi0_cs1_dev.dtso
*/
/dts-v1/;
/plugin/;

&spi0 {
	slave@1 {
		compatible = "sample-compatible-str";
		spi-max-frequency = <32000000>;
		reg = <1>;
	};
};

```
:::info Note
The following need to be modified according to the actual situation of the slave device:
1. `compatible` field: needs to be modified to the `compatible` field of the actual driver of the slave device;
2. `spi-max-frequency` field: needs to be modified to the highest speed actually supported by the slave device;
:::

DTB Overlay compilation example. The following commands can be executed on the Host side or on the RDK board. Assume the path of the `spi0_cs1_dev.dtso` file is `~/rdk_dtbo/spi0_cs1_dev.dtso`:
```
# Install device-tree-compiler
sudo apt install device-tree-compiler -y

# Compile dtbo files
dtc -I dts -O dtb -o ~/rdk_dtbo/spi0_cs1_dev.dtbo ~/rdk_dtbo/spi0_cs1_dev.dtso

# Copy generated dtbo file to /boot for further usage
sudo cp ~/rdk_dtbo/spi0_cs1_dev.dtbo /boot
```

Example compilation output:
```
sunrise@ubuntu:~/rdk_dtbo$ dtc -I dts -O dtb -o ~/rdk_dtbo/spi0_cs1_dev.dtbo ~/rdk_dtbo/spi0_cs1_dev.dtso
/home/sunrise/rdk_dtbo/spi0_cs1_dev.dtso:12.3-13: Warning (reg_format): /fragment@0/__overlay__/slave@1:reg: property has invalid length (4 bytes) (#address-cells == 2, #size-cells == 1)
/home/sunrise/rdk_dtbo/spi0_cs1_dev.dtbo: Warning (pci_device_reg): Failed prerequisite 'reg_format'
/home/sunrise/rdk_dtbo/spi0_cs1_dev.dtbo: Warning (pci_device_bus_num): Failed prerequisite 'reg_format'
/home/sunrise/rdk_dtbo/spi0_cs1_dev.dtbo: Warning (simple_bus_reg): Failed prerequisite 'reg_format'
/home/sunrise/rdk_dtbo/spi0_cs1_dev.dtbo: Warning (i2c_bus_reg): Failed prerequisite 'reg_format'
/home/sunrise/rdk_dtbo/spi0_cs1_dev.dtbo: Warning (spi_bus_reg): Failed prerequisite 'reg_format'
/home/sunrise/rdk_dtbo/spi0_cs1_dev.dtso:9.10-13.4: Warning (avoid_default_addr_size): /fragment@0/__overlay__/slave@1: Relying on default #address-cells value
/home/sunrise/rdk_dtbo/spi0_cs1_dev.dtso:9.10-13.4: Warning (avoid_default_addr_size): /fragment@0/__overlay__/slave@1: Relying on default #size-cells value
/home/sunrise/rdk_dtbo/spi0_cs1_dev.dtbo: Warning (avoid_unnecessary_addr_size): Failed prerequisite 'avoid_default_addr_size'
/home/sunrise/rdk_dtbo/spi0_cs1_dev.dtbo: Warning (unique_unit_address): Failed prerequisite 'avoid_default_addr_size'
sunrise@ubuntu:~/rdk_dtbo$ ls
spi0_cs1_dev.dtbo  spi0_cs1_dev.dtso
```
:::info Note
In general, the `Warning`-level prints during compilation can be ignored.
:::

Edit the configuration file and add: `dtbo_file_path=<relative path under the /boot partition>`, for example:
```
# Set dtbo file path relative to /boot partition
dtbo_file_path=/spi0_cs1_dev.dtbo
```

After rebooting, you can see that a new slave device node has been generated under the path of the device tree SPI0(spi@39800000):
```shell
sunrise@ubuntu:~$ ls /proc/device-tree/soc/spi@39800000/slave@1/
compatible  name  reg  spi-max-frequency
```

If you want to customize the partition where the dtbo file is located, you can add: `dtbo_dev_part=<device number>:<hexadecimal partition number>`. The default device number on RDK S100 is "0". The partition number can be obtained from the `/dev/block/platform/by-name/` path. The following uses the `userdata` partition as an example:
```
# Set dtbo file device number and partition number:
dtbo_dev_part=0:0x10
```

The method to get the partition number: `ls -l /dev/block/platform/by-name/<partition name>`, for example:
```shell
root@ubuntu:~# ls -l /dev/block/platform/by-name/userdata
lrwxrwxrwx 1 root root 15 Jun  4 22:17 /dev/block/platform/by-name/userdata -> /dev/mmcblk0p16
```

## Guide for Customizing config.txt
U-Boot automatically obtains the partition where the default configuration file is located, according to the storage medium and partition used for the current boot.

Customers can customize the storage medium and partition of the configuration file used for the next boot through U-Boot environment variables. The steps are as follows:
  1. During boot, stop and enter the U-Boot command line;
  2. The following environment variables can be used to customize the configuration file, and each variable can be used independently:
     1. `boot_config_f`: change the name of the configuration file searched by default. For example, `setenv boot_config_f test.txt` makes the configuration file retrieval at the next boot look for a file named `test.txt` instead of `config.txt`
     2. `boot_config_dev_part`: change the partition where the configuration file is searched by default. For example, `setenv boot_config_dev_part 0:0xd` makes the configuration file retrieval at the next boot look for the configuration file in the 13th partition (0xd) of the current boot medium;
     3. `boot_config_intf`: change the storage medium where the configuration file is searched by default. For example, `setenv boot_config_intf scsi`.
  3. Save the environment variables: `saveenv`

## config.txt Parser Development Guide

The parsing functionality code of the configuration file is located in the
`board/hobot/common/drobot_boot_config.c` file in the U-Boot directory. For the parsing mechanism and how to add new configuration items, see
[config.txt Parser Development Guide](./05_parser_dev.md).

## Verification

- `bootargs`: after reboot, `cat /proc/cmdline` confirms the appended kernel parameters have taken effect.
- `fdt-enable`/`fdt-disable`: after reboot, `ls /proc/device-tree/soc/` confirms the target node appears/disappears.
- DTB Overlay: after reboot, `ls /proc/device-tree/soc/spi@39800000/slave@1/` showing properties such as `compatible` and `reg` means the Overlay has taken effect (see the example above).

## FAQ

### Configuration Does Not Take Effect After Modification

**Cause**: Manual configuration via `setenv` in U-Boot has a higher priority than the configuration file, so the file is overridden.

**Solution**: Check whether U-Boot used `setenv` to override a variable with the same name; the priority is `setenv > configuration file > saveenv`.

### Configuration Stops Working After Enabling AVB

**Cause**: Modifying the boot partition content conflicts with AVB verification; config.txt cannot be used when AVB is enabled.

**Solution**: AVB is disabled by default; if it has been enabled, disable AVB first, or use another configuration entry point.

### DTS Node Path Not Found

**Cause**: The example node address is for the S100; the S600 uses a different node address, or the full path is misspelled.

**Solution**: Use the actual node names under `/proc/device-tree` on the board; obtain the path with `realpath --relative-to=/proc/device-tree/ <node>` and prepend a leading `/`.

## Related Documentation

- [Customizing config.txt](./02_custom.md)
- [Common Configuration Options Reference](./03_common_options.md)
- [Boot-related Configuration](./04_boot_options.md)
- [config.txt Parser Development Guide](./05_parser_dev.md)
