---
title: "BSP Source Directory Structure"
sidebar_position: 2
description: "RDK S100/S600 BSP source directory structure and key script descriptions"
---

# BSP Source Directory Structure

This section describes the top-level directory structure and key build scripts of the RDK BSP source code, helping developers quickly locate the components they need to modify.

## Top-Level Directories

The BSP source root is `rdk-gen` (the source directory after download and extraction), which packages the image, builds the samplefs, and compiles:

```
rdk-gen/
├── mk_debs.sh              # Builds all deb packages
├── mk_kernel.sh            # Builds the kernel
├── mk_rootfs.sh            # rootfs operation library (deb download/install, initramfs), orchestrated by pack_image.sh
├── pack_image.sh           # Main entry for building the system image
├── download_deb_packages.sh # Downloads prebuilt deb packages
├── download_samplefs.sh    # Downloads the samplefs
├── hobot_customize_rootfs.sh # rootfs customization (create users, enable/disable startup items, etc.)
├── config/
│   └── hobot_config.sh     # Placeholder script, no-op by default
├── source/                  # deb package sources
│   ├── bootloader/          # U-Boot
│   ├── kernel/              # Linux kernel
│   ├── hobot-io/            # Simple I/O API (sp_vio/sp_codec, etc.)
│   ├── hobot-io-samples/    # I/O example code
│   ├── hobot-spdev/         # Python Simple API
│   ├── hobot-sp-samples/    # Python example code
│   ├── hobot-dnn/           # BPU inference library
│   ├── hobot-camera/        # Camera driver
│   ├── hobot-drivers/       # Other drivers
│   ├── hobot-multimedia/    # Multimedia library (cdev)
│   ├── hobot-multimedia-dev/ # Multimedia development library
│   ├── hobot-multimedia-samples/ # Multimedia examples
│   ├── hobot-configs/       # System configuration files
│   ├── hobot-utils/         # System utilities
│   ├── hobot-audio-config/  # Audio configuration
│   ├── hobot-firmware/      # Firmware
│   ├── hobot-miniboot/      # miniboot
│   ├── hobot-wifi/          # Wi-Fi driver
│   └── hobot-ethercat/      # EtherCAT
├── ota_tools/               # OTA tools
├── build_params/            # Build parameters
└── LICENSE
```

## Key Scripts

| Script | Purpose |
| --- | --- |
| `pack_image.sh` | Main entry for building the system image (downloads samplefs/deb, customizes rootfs, packages the image) |
| `mk_debs.sh` | Builds all RDK-customized deb packages under `source/` |
| `mk_kernel.sh` | Builds the Linux kernel |
| `mk_rootfs.sh` | rootfs operation functions (deb download/install, initramfs), orchestrated by pack_image.sh |
| `download_samplefs.sh` | Downloads the prebuilt base Ubuntu root filesystem (samplefs) |
| `download_deb_packages.sh` | Downloads prebuilt RDK-customized deb packages |
| `hobot_customize_rootfs.sh` | rootfs customization (enable users, toggle startup items, etc.) |
| `config/hobot_config.sh` | Placeholder script, no-op by default; board-level configuration is provided by `build_params/*.conf` |

## Typical Build Workflow

```bash
cd rdk-gen
sudo ./pack_image.sh  # One-click system image build
./mk_kernel.sh        # Build the kernel only
./mk_debs.sh          # Build all deb packages
```

See [Set up the development environment](./01_environment_build.md) for details.

## Related Documentation

- [Set up the development environment](./01_environment_build.md)
- [Build system development guide](./03_rdk_gen.md)
- [System customization](../03_system_software/02_system_customization/01_system_customization.md)
