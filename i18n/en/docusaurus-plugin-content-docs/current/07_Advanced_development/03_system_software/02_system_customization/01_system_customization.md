---
title: "System Customization"
sidebar_position: 1
description: "RDK system customization: image remastering, custom rootfs, deb/source-level customization"
---

# System Customization

This section targets Mode 2 (product integration) users and describes how to customize the system on top of the apt/configuration layer, including remastering the image, customizing the rootfs content, and preinstalling software.

> Boundary with [2. System Configuration](/System_configuration): Chapter 2 covers runtime configuration (apt install/network/srpi-config); this section covers image-level customization (remastering rootfs/preinstalling deb/modifying samplefs). Mode 2 users complete system customization here; deb/source-level customization is covered in [deb package development](../01_deb/01_deb.md).

## Customization Entry

The core script for system customization is `hobot_customize_rootfs.sh`, located in the top-level BSP source directory (same level as `pack_image.sh`, `mk_rootfs.sh`, etc.):

```bash
cd <sdk_dir>
sudo ./pack_image.sh
```

`hobot_customize_rootfs.sh` is not executed independently. It is sourced by `pack_image.sh` after building the rootfs via `source hobot_customize_rootfs.sh`, which then invokes the `hobot_customize_rootfs` function inside it to add/modify/delete files in the rootfs. To customize, directly edit the logic inside the function in that script, then re-run `pack_image.sh`.

:::note
`config/hobot_config.sh` is an empty implementation (does nothing by default). Build configuration (partition table, image parameters, etc.) lives in `build_params/*.conf`, which is auto-sourced by `pack_image.sh`; no manual loading is needed.
:::

## Common Customization Scenarios

### Preinstalling Additional deb Packages

Add the following in `hobot_customize_rootfs.sh`:

```bash
# Install an additional deb into the rootfs
chroot ${DST_ROOTFS_DIR} dpkg -i /path/to/custom-package.deb
```

### Preinstalling Custom Files

```bash
# Copy a custom config file into the rootfs
cp my_config.conf ${DST_ROOTFS_DIR}/etc/my_config.conf
```

### Modifying the Default Account/Password

```bash
# Change the root password
chroot ${DST_ROOTFS_DIR} bash -c 'echo "root:my_password" | chpasswd'
```

### Preinstalling Python Dependencies

```bash
chroot ${DST_ROOTFS_DIR} pip3 install flask requests
```

## Image Remastering Workflow

```bash
cd <sdk_dir>

# First run: download samplefs and prebuilt deb packages, customize the rootfs, and package the full image
sudo ./pack_image.sh

# Local build: do not re-download samplefs or deb packages, reuse local artifacts directly (common for debugging)
sudo ./pack_image.sh -l
```

Internally, `pack_image.sh` completes in sequence: download samplefs -> extract and invoke `hobot_customize_rootfs.sh` to customize -> install deb packages -> generate the image. If you only need to set up the deb build environment without generating the final `.img`, use `sudo ./pack_image.sh -p`; to rebuild a specific official deb package separately, use `./mk_debs.sh <package-name>`.

The generated image can be flashed to the board using [System burning](/Quick_start/install_os_and_setup/instruction).

## Related Documentation

- [deb package development](../01_deb/01_deb.md)
- [Set up the development environment](/Advanced_development/environment_build/environment_build)
- [BSP source directory structure](/Advanced_development/environment_build/bsp_source_layout)
- [System burning](/Quick_start/install_os_and_setup/instruction)
- [System update](/System_configuration/system_update)
