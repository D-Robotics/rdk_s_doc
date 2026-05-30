---
sidebar_position: 2
---

# miniboot Upgrade

:::note
- This upgrade method is only applicable to **non-OTA** images for online miniboot updates. For OTA images, please follow the complete [System OTA Upgrade](./01_ota_system.md) process.
- The process **does not go through the `ota_tool` state machine** but directly writes via `dd`. **A reboot is required for the upgrade to take effect**.
:::

## Overview

When you need to update only the miniboot-related partitions individually without reprogramming the entire system, you can directly flash the miniboot upgrade package on the board using `rdk-miniboot-update`.

- Script: `/usr/bin/rdk-miniboot-update` (provided by the `hobot-miniboot` deb package)
- Upgrade package directory: `/usr/lib/firmware/rdk/miniboot/stable/<release|debug>/img_packages/`

This solution adopts a **direct flash** strategy:

- **NOR**: Uses a full-disk image pre-arranged in FPT order, overwriting the entire NOR at once with `dd` (a single call updates all miniboot-related NOR partitions, including the BAK partition and both A/B slots).
- **eMMC / UFS**: Flashes several AB partitions individually with `dd`, writing only to the **current slot**.

:::warning Important Feature
The process does not use the "upgrade → verify → switch slot" two-stage state machine of `ota_tool` and **has no built-in automatic rollback**. If any `dd` step fails or power is lost midway, the device may fail to boot.
:::

## Working Principle

Script execution order:

1. **OHP Lifecycle Check**: If the device has entered the `OHP` stage, online upgrades are rejected, and the factory tool must be used to reprogram the entire NOR.
2. **Read Current AB Slot**: Obtains A/B via `ota_tool -g`. During the eMMC stage, writes to `<part>_<slot>` based on the current slot.
3. **Select NOR Image**: Uses `miniboot_flash.img` (signed version) if the kernel cmdline includes `hobotboot.secureboot=1`; otherwise, uses `miniboot_flash_nose.img`.
4. **NOR Full Flash**: Performs a single `dd` (`bs=2M`) to `/dev/block/platform/by-name/hb_vspiflash`, overwriting the entire NOR. For 22MB, this takes approximately 3.5 minutes.
5. **eMMC / UFS Individual Flash**: Flashes the four AB partitions (`acore_cfg_<slot>`, `bl31_<slot>`, `optee_<slot>`, `uboot_<slot>`) separately with `dd` (`bs=4M`). **Only writes to the current slot, does not synchronize across slots**, and **does not touch other AB partitions** (e.g., `vbmeta` on RDK S600). This process does not upgrade them; for those, please follow the complete system OTA process.
6. **Optional Reboot**: Based on `--reboot y|n` or interactive input, decides whether to `reboot` immediately. **The new miniboot will only take effect after a reboot.**

## Usage Instructions

### Automatic Upgrade (triggered when installing `hobot-miniboot` via apt)

After running the following commands on the board, the `hobot-miniboot` deb package will **automatically call** `rdk-miniboot-update` during installation/upgrade to complete the miniboot flash:

```bash
sudo apt update
sudo apt-get install -y hobot-miniboot
```

In most scenarios, the above step is sufficient to complete the miniboot upgrade. If you need to switch to the debug version, skip the interactive prompts in CI/batch scripts, or manually re-flash later, call the script manually as described below.

### Manual Method 1: `rdk-miniboot-update` Command

Parameter description:

| Parameter | Values | Description |
|---|---|---|
| `--build` / `--type` | `release` / `debug` | Upgrade version type, can be omitted (**default is `release`**) |
| `--reboot` | `y` / `n` | Whether to reboot immediately after the upgrade, prompts interactively if omitted |
| `--confirm` | `y` / `n` | Skips the initial "WARNING" confirmation, prompts interactively if omitted |

Example:

```bash
# Fully interactive: asks for confirmation first, then asks whether to reboot (default release)
rdk-miniboot-update

# Release version, skip confirmation, reboot immediately after upgrade
rdk-miniboot-update --confirm y --reboot y

# Debug version, do not reboot (preserve the scene to observe logs; reboot manually later for the upgrade to take effect)
rdk-miniboot-update --build debug --reboot n

# CI / batch script: fully non-interactive
rdk-miniboot-update --build release --confirm y --reboot y
```

On failure, the script exits with `exit 1` and prints:

```text
Error: N step(s) failed to flash.
```

Before rebooting, it is recommended to check `dmesg | tail` for related errors.

### Manual Method 2: `srpi-config` Menu

Refer to the Update miniboot entry in [srpi-config](../../../02_System_configuration/02_srpi-config.md#system-options).

:::warning
`srpi-config` can only initiate **release version** upgrades. To upgrade to the debug version, you must use the `rdk-miniboot-update` command.
:::

## Limitations

- **No automatic rollback**: If any `dd` step fails or power is lost midway, the corrupted partition will not be restored.
- **Not available in OHP stage**: Devices that have entered the OHP lifecycle can only be fully programmed using the factory tool.
- **Does not upgrade other eMMC AB partitions**: Partitions other than `acore_cfg` / `bl31` / `optee` / `uboot` (such as `vbmeta` on S600) are not touched.

## Precautions

- **Do not** unplug the power, cut off power, reboot, or perform any other write operations on the partitions during the upgrade process — interrupting a `dd` full flash will directly brick the device.