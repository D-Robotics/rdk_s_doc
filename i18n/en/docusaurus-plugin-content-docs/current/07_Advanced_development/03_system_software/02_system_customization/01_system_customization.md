---
title: "System Customization"
sidebar_position: 1
description: "RDK system customization: image remastering, custom rootfs, deb/source-level customization"
---

# System Customization

This section targets Mode 2 (product integration) users and describes how to customize the system on top of the apt/configuration layer, including remastering the image, customizing the rootfs content, and preinstalling software.

> Boundary with [2. System Configuration](/System_configuration): Chapter 2 covers runtime configuration (apt install/network/srpi-config); this section covers image-level customization (remastering rootfs/preinstalling deb/modifying samplefs). Mode 2 users complete system customization here; deb/source-level customization is covered in [deb package development](../01_deb/01_deb.md).

## Mechanism

The essence of system customization is: during the rootfs build process of `pack_image.sh`, `hobot_customize_rootfs.sh` is pulled in via `source`, invoking its `hobot_customize_rootfs` function to add/delete/modify rootfs content, then continuing to install deb packages and package the image. The overall chain is as follows:

| Stage | Description |
|------|------|
| `pack_image.sh` | Image packaging entry: download samplefs → customize rootfs → install deb → generate image |
| `hobot_customize_rootfs.sh` | Customization script that provides the `hobot_customize_rootfs` function to read/write `${DST_ROOTFS_DIR}` |
| `build_params/*.conf` | Build configuration (partition table, image parameters, etc.), auto-sourced by `pack_image.sh` |
| `config/hobot_config.sh` | Customization hook; empty implementation by default |

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
# Install an additional deb into the rootfs (copy the deb into the rootfs first, then install it inside chroot)
cp /path/to/custom-package.deb ${DST_ROOTFS_DIR}/tmp/
chroot ${DST_ROOTFS_DIR} dpkg -i /tmp/custom-package.deb
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

The generated image can be flashed to the board using [System burning](../../../01_Quick_start/03_install_os_and_setup/01_instruction.md).

## Notes

- `hobot_customize_rootfs.sh` is not an independently executed script; its function only takes effect after it is sourced by `pack_image.sh`. Running it directly will not produce any customization effect.
- The paths used in `chroot` operations are rootfs-internal paths (`${DST_ROOTFS_DIR}` is the root); to copy external files into the rootfs, first place them inside `${DST_ROOTFS_DIR}` and then operate.
- After modifying the customization logic, `pack_image.sh` must be re-run for the changes to enter the final image.

## FAQ

### First execution of pack_image.sh takes a long time

**Cause**: the first run downloads samplefs and prebuilt deb packages, which is network-heavy.

**Solution**: once local artifacts exist, use `sudo ./pack_image.sh -l` to reuse them and skip repeated downloads.

### Customized content does not enter the image

**Cause**: only `hobot_customize_rootfs.sh` was modified, but `pack_image.sh` was not re-run.

**Solution**: re-run `sudo ./pack_image.sh` to complete the rootfs customization and packaging.

## Related Documentation

- [deb package development](../01_deb/01_deb.md)
- [Set up the development environment](../../06_environment_build/01_environment_build.md)
- [BSP source directory structure](../../06_environment_build/02_bsp_source_layout.md)
- [System burning](../../../01_Quick_start/03_install_os_and_setup/01_instruction.md)
- [System update](../../../02_System_configuration/03_system_update/01_apt_usage.md)
