---
sidebar_position: 1
title: "Development Environment Setup and Build Instructions"
description: "RDK S100/S600 cross-compilation environment setup, source code acquisition and system image build"
---

# Development Environment Setup and Build Instructions

This section describes the requirements and setup of a cross-compilation development environment, as well as instructions for downloading source code and building system images.

## Host Requirements

| Item | Requirement |
| --- | --- |
| Operating System | Ubuntu 18.04 / 20.04 / 22.04 (native Linux recommended) |
| CPU | x86_64 |
| Memory | 16 GB or more (required for kernel builds) |
| Disk | 50 GB or more free space |
| Privileges | sudo access is required to build system images |

### Installing Dependency Packages

Take Ubuntu 22.04 as an example to install the packages required for building (differences for 18.04 / 20.04 are described in the source package README.md):

```bash
sudo apt-get install -y build-essential make cmake libpcre3 libpcre3-dev bc bison \
                        flex python3-numpy mtd-utils zlib1g-dev libgmp-dev \
                        libdata-hexdumper-perl libncurses5-dev zip qemu-user-static ccache \
                        curl repo git liblz4-tool apt-cacher-ng libssl-dev checkpolicy autoconf \
                        android-sdk-libsparse-utils mtools parted dosfstools udev rsync multistrap whois
```

### Installing Python Dependencies

The Python version must be 3.8 or higher:

```bash
sudo apt install python3-pip
pip3 install --upgrade pip
pip3 install -r requirements.txt
```

### Installing the Cross-Compilation Toolchain

The cross-compilation toolchain must be extracted and installed into the `/opt` directory; the `CROSS_COMPILE` hardcoded in `mk_kernel.sh` points to this path. Toolchain versions for different platforms:

| Platform | Toolchain |
| --- | --- |
| RDK S100 | `arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu` |
| RDK S600 | `arm-gnu-toolchain-13.2.Rel1-x86_64-aarch64-none-linux-gnu` |

Take RDK S100 as an example to download and install:

```bash
curl -fO http://archive.d-robotics.cc/toolchain/arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu.tar.xz
sudo tar -xvf arm-gnu-toolchain-11.3.rel1-x86_64-aarch64-none-linux-gnu.tar.xz -C /opt
```

For RDK S600, replace `11.3.rel1` with `13.2.Rel1` in the commands above.

## Cross-Compilation Development Environment

Cross-compilation is a method of developing and building software on a host machine, where the compiled software is subsequently deployed and executed on a development board.

- **Host Advantages**: The host typically offers higher performance and larger memory capacity, significantly accelerating code builds.
- **Tool Support**: The host can accommodate a wider range of development tools, thereby enhancing development efficiency.

```mdx-code-block
import DocScope from '@site/src/components/DocScope'
```

<DocScope products="RDK S100">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/environment_build/build_host_target.png" alt="Cross-compilation development environment diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>
<DocScope products="RDK S600">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s600/environment_build/build_host_target.png" alt="Cross-compilation development environment diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

## Acquiring the Source Code

:::info BSP source package
The download address of the BSP source package is in [System Images](../../RDK.md#系统镜像) (registration and login required).
:::

:::tip Commercial Support
The commercial edition provides more comprehensive feature support, deeper hardware capability exposure, and exclusive customization content. To ensure compliant and secure delivery, access to the commercial edition will be provided through the following process.

Commercial edition acquisition process:
1. Fill in the questionnaire: submit basic information about your organization and intended use cases.
2. Sign a Non-Disclosure Agreement (NDA): we will contact you based on the submitted information and sign the NDA with you after mutual confirmation.
3. Content release: after the agreement is signed, we will provide access to the commercial edition materials through a private channel.

If you wish to obtain the commercial edition content, click the link below to fill in the questionnaire, and we will contact you within 3 to 5 business days:
https://horizonrobotics.feishu.cn/share/base/form/shrcnpBby71Y8LlixYF2N3ENbre
:::

## Build Process

For the BSP source directory structure, see [BSP Source Directory Structure](./02_bsp_source_layout.md).

After entering the source root directory (`rdk-gen`), the main entry for building the system image is `pack_image.sh`, which automatically downloads the samplefs and deb packages, customizes the rootfs and packages the image:

```bash
cd rdk-gen

# One-click build of the complete system image (requires sudo; automatically downloads samplefs and deb packages)
sudo ./pack_image.sh

# Only set up the deb build environment (download and install dependency packages, no final image packaging)
sudo ./pack_image.sh -p

# Offline build (use the existing deb packages under local out/product/deb_packages)
sudo ./pack_image.sh -l
```

The build output is a flashable system image located at `out/product/img_packages/`. For the flashing method, see [System Flashing](../../01_Quick_start/03_install_os_and_setup/01_instruction.md).

For in-depth development, you can build the kernel and RDK-customized deb packages separately:

```bash
# Build the kernel (the cross-compilation toolchain must be installed first)
./mk_kernel.sh

# Build all RDK-customized deb packages (kernel build must be completed first)
./mk_debs.sh

# Build a single deb package (take hobot-configs as an example)
./mk_debs.sh hobot-configs
```

Build output description:

| Output | Path |
| --- | --- |
| System image | `out/product/img_packages/` |
| Kernel deb package | `out/product/deb_packages/linux-image-*.deb` |
| Customized deb packages | `out/product/deb_packages/` |

> Board-level configuration is selected through the `*.conf` files under `build_params/`. The scripts read `build_params/ubuntu-22.04_desktop_rdk-s100_release.conf` (S100) or `ubuntu-24.04_desktop_rdk-s600_beta.conf` (S600) by default; a different one can be specified with the `-c` parameter.

> Containerized builds (to avoid polluting the host environment) are described in [Docker Build](./04_docker_build.md) and [Podman Build](./05_podman_build.md).

## FAQ

### "Exec format error" or "/bin/bash not found" during the build

**Cause**: qemu-user-static or binfmt-support is too old, or the aarch64 binfmt is not properly registered.

**Solution**:

```bash
sudo apt install -y binfmt-support
sudo systemctl restart systemd-binfmt
sudo update-binfmts --enable qemu-aarch64
```

Also ensure qemu-user-static is 5.2 or newer and binfmt-support is 2.2.1 or newer.

## Related Documentation

- [BSP Source Directory Structure](./02_bsp_source_layout.md)
- [Build System Development Guide](./03_rdk_gen.md)
- [Build with Docker](./04_docker_build.md)
- [Build with Podman](./05_podman_build.md)
- [System Flashing](../../01_Quick_start/03_install_os_and_setup/01_instruction.md)