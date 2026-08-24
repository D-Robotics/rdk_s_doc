---
title: "Package Management apt"
sidebar_position: 1
description: "Querying, installing, upgrading, and removing apt packages on RDK OS"
---

# Package Management apt

RDK OS is based on Ubuntu and uses `apt` to manage software packages. The system is preconfigured with the D-Robotics official apt source (providing RDK-specific packages such as `hobot-dnn` and `hobot-camera`) and the Ubuntu official source. Mode 1 users can use `apt` to install common tools; Mode 2 users can build productized integration based on apt + the configuration layer.

## Package Sources

Check the current apt sources (`apt policy`, tested on RDK S600, excerpt):

```text
Package files:
 100 /var/lib/dpkg/status
 500 http://archive.d-robotics.cc/ubuntu-rdk-s600-beta noble/main arm64 Packages
     release o=D-Robotics RDK S600 APT Repo,n=noble
 500 http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports noble/multiverse arm64 Packages
```

- `archive.d-robotics.cc/ubuntu-rdk-s600-beta`: D-Robotics packages specific to RDK S600 (the `hobot-*` series).
- Ubuntu official source (`mirrors.tuna.tsinghua.edu.cn/ubuntu-ports`): general Ubuntu packages, based on Ubuntu 24.04 (noble).

## Common Commands

### Query

```bash
# List installed packages
apt list --installed

# Search for packages
apt search <keyword>

# Show package details
apt show <package name>
```

### Install/Remove

```bash
# Install (using htop as an example)
sudo apt install htop

# Remove
sudo apt remove htop          # Keep configuration
sudo apt purge htop           # Remove configuration as well
```

### Upgrade

```bash
sudo apt update               # Refresh the package index
sudo apt upgrade              # Upgrade installed packages (without changing dependencies)
sudo apt full-upgrade         # Upgrade and handle dependency changes
```

:::warning
`apt upgrade` / `full-upgrade` may upgrade `hobot-*` system packages, and upgrading across major versions carries compatibility risks. Verify on a test board before upgrading in production. Major version upgrades (such as RDK OS major version changes) require reflashing the image; see [Major Version Upgrade and Firmware](./02_upgrade_firmware.md).
:::

## RDK-Specific Packages

A set of `hobot-*` packages is preinstalled on RDK boards (`dpkg -l | grep hobot`, tested on S600, excerpt):

```text
ii  hobot-audio-config   5.0.0       arm64   Configuration files of audio hat
ii  hobot-camera         5.1.0       arm64   Camera Sensor Support Package
ii  hobot-configs         5.1.0       arm64   Hobot custom system configuration
ii  hobot-dnn             5.1.0       arm64   UCP sdk build
ii  hobot-ethercat       5.1.0       arm64   Ethercat IgH Package
```

These are system-level packages for BPU runtime, camera, audio, and so on. **Do not uninstall them at will**; otherwise, board capabilities will be affected.

## Disk Usage

Packages installed by `apt` occupy rootfs space. To check and clean up:

```bash
# Check disk usage
df -h /

# Clean up the apt cache
sudo apt clean               # Clear /var/cache/apt/archives
sudo apt autoremove          # Remove unnecessary dependencies
```

For rootfs expansion, see [Storage and Disk Management](../12_storage.md).

## Verification

- Source effective: the output of `apt policy` includes `archive.d-robotics.cc` (the D-Robotics dedicated package source) and the official Ubuntu sources.
- Installation successful: `apt list --installed | grep <package>` shows the installed package, or `apt show <package>` displays its details.
- Upgrade result: `apt list --upgradable` lists the packages pending upgrade; after upgrading, `df -h /` shows the change in rootfs usage.

## FAQ

### System Malfunctions After an Upgrade

**Cause**: Upgrading across major versions with `apt upgrade` is not supported and introduces compatibility issues.

**Solution**: Reflash the correct image version; within the same major version, confirm the packages pending upgrade before upgrading, and validate on a test board in production environments first.

### Missing Capabilities After Accidentally Removing hobot-* System Packages

**Cause**: `hobot-*` packages are system-level packages such as the BPU runtime, camera, and audio; after removing them, the corresponding board capabilities stop working.

**Solution**: Do not remove them casually; if already removed, reinstall with `sudo apt install <package>` and restart the corresponding services.

### apt Cache Fills Up the Disk

**Cause**: The download cache in `/var/cache/apt/archives` and unused dependencies are not cleaned up.

**Solution**: Run `sudo apt clean` to clear the cache and `sudo apt autoremove` to remove unused dependencies; if the rootfs is still short on space, see [Storage and Disk Management](../12_storage.md).

## Related Documentation

- [Major Version Upgrade and Firmware](./02_upgrade_firmware.md)
- [Storage and Disk Management](../12_storage.md)
- [apt Command Reference](../../09_Appendix/linux-command-manual/01_apt.md)
