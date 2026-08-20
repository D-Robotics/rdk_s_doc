---
title: "Major Version Upgrade and Firmware"
sidebar_position: 2
description: "RDK OS major version upgrade, firmware upgrade and downgrade"
---

# Major Version Upgrade and Firmware

Upgrades of RDK OS fall into two categories: **package-level updates** (`apt upgrade`, see [Package Management apt](./01_apt_usage.md)) and **major version/firmware upgrades** (which require reflashing the image or going through OTA).

:::info Note
A major version upgrade modifies the system image, and was not reproduced on the board (it would wipe the currently in-use S600 system); the procedure follows the official upgrade instructions.
:::

## Major Version Upgrade

RDK OS cannot be upgraded across major versions (e.g., 5.0.x → 5.1.x) **via `apt`**; you must reflash the image of the target version:

1. Back up the custom configurations on the board (private content under `/etc` and `/opt`).
2. Download the image of the target version (see [Flashing Preparation](../../01_Quick_start/03_install_os_and_setup/01_instruction.md)).
3. Flash the new image following the [Flashing Steps](../../01_Quick_start/03_install_os_and_setup/02_burn.md).
4. After flashing, use [System Status](../../01_Quick_start/03_install_os_and_setup/system_status.md) to verify the version.

:::warning
Upgrading across major versions wipes the rootfs; private packages installed via apt and configurations need to be redeployed. In production, verify on a test board first.
:::

## Firmware Upgrade and Downgrade

Some firmware components (such as miniboot and the bootloader) support upgrade/downgrade via on-board tools, without reflashing the whole disk. See the advanced documentation for details:

- [System OTA Upgrade](../../07_Advanced_development/03_system_software/06_ota_system.md)
- [miniboot Upgrade](../../07_Advanced_development/03_system_software/07_ota_miniboot.md)

## apt Upgrade vs Firmware Upgrade

| Scenario | Method | Risk |
|---|---|---|
| Upgrading packages such as hobot-* | `apt upgrade` | Low (within the same major version) |
| Across major versions | Reflash the image | High (wipes rootfs) |
| Upgrading bootloader/miniboot | OTA/miniboot tools | Medium (must follow the official procedure) |

## FAQ

- **Does not boot after `apt upgrade`**: upgrading via apt across major versions is not supported; reflash the correct image.
- **Abnormal behavior after downgrade**: firmware downgrading carries compatibility risks; confirm that the downgrade path is officially supported.
- **OTA failure**: Check whether the partition layout and the `miniboot` version match; see [System OTA Upgrade](../../07_Advanced_development/03_system_software/06_ota_system.md).

## Related Documents

- [Package Management apt](./01_apt_usage.md)
- [Flashing Steps](../../01_Quick_start/03_install_os_and_setup/02_burn.md)
- [System OTA Upgrade (Advanced)](../../07_Advanced_development/03_system_software/06_ota_system.md)
