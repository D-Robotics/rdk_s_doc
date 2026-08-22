---
title: "System Status"
sidebar_position: 3
description: "First step after flashing: confirm the system version and board model"
---

# System Status

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

After flashing completes and you log in to the development board, **first confirm the system version and board model** to ensure that the flashed image is the expected one and it is running on the expected hardware. After confirmation, check the working status of the BPU, MCU, and VDSP cores to ensure the whole board's hardware is ready.

## Prerequisites

- [ ] The development board has been flashed with RDK OS and logged in via SSH or the serial port (see [Remote login](05_remote_login.md)).

## Confirm the system version

```bash
cat /etc/version
```

<DocScope products="RDK S600">

Sample output (RDK S600, RDK OS 5.1.0):

```text
5.1.0
```

</DocScope>

<DocScope products="RDK S100">

On RDK S100, the output is the version number of the flashed image; the latest S100 image version is `4.0.5`.

</DocScope>

This value is the RDK OS version number. If it does not match the expected image version, the flashed image is wrong and you need to flash again (see [Flashing preparation](./01_instruction.md)).

## Version and baseline

```bash
cat /etc/os-release
```

<DocScope products="RDK S600">

Measured on RDK S600 (RDK OS V5.1.0):

```text
PRETTY_NAME="RDK OS"
NAME="RDK OS"
VERSION_ID="V5.1.0"
VERSION="V5.1.0"
VERSION_CODENAME="rdk os noble"
ID="rdk os"
ID_LIKE="ubuntu"
HOME_URL="https://d-robotics.cc/"
SUPPORT_URL="https://developer.d-robotics.cc/"
BUG_REPORT_URL="https://forum.d-robotics.cc/"
PRIVACY_POLICY_URL="https://developer.d-robotics.cc/privacypolicy"
LOGO="rdk-os-logo"
```

- Baseline: Ubuntu 24.04 (noble).
- Version number: `5.1.0` (`cat /etc/version`).
- Hostname: `drobot` (`cat /etc/hostname`).

</DocScope>

<DocScope products="RDK S100">

RDK S100 is based on Ubuntu 22.04; fields such as the version number and hostname are subject to the actual board output.

</DocScope>

## Confirm the board model and hardware ID

```bash
rdkos_info
```

`rdkos_info` summarizes the key system information. At the beginning it shows the hardware model and Board Id:

<DocScope products="RDK S600">

```text
================ RDK System Information Collection ================

[Hardware Model]:
	D-Robotics RDK S600 MCB V1p0 (Board Id = 0x5131310)
```

</DocScope>

<DocScope products="RDK S100">

The output likewise starts with `[Hardware Model]`, showing the RDK S100 board model and Board Id.

</DocScope>

From this you can confirm: whether the board is an RDK S100 or S600, the carrier board version (such as `MCB V1p0`), and the Board Id. It also outputs runtime status such as CPU/BPU temperatures and frequencies later, which can be used for troubleshooting.

If you only need the Board Id, run separately:

<DocScope products="RDK S600">

```bash
hrut_boardid
# Example output: 0x5131310
```

</DocScope>

<DocScope products="RDK S100">

```bash
hrut_boardid
```

</DocScope>

## Confirm the SoC unique ID

Each SoC has a unique ID, used for licensing or device registration:

```bash
hrut_socuid
# Example output: 0123456789abcdef0123456789abcdef(32-digit hex, example value, differs per SoC)
```

## Check the working status of each core

After confirming the version and board model are correct, check the working status of the three co-processing cores — BPU, MCU, and VDSP — to ensure the whole board's hardware is ready.

### BPU working status

Run the BPU self-test. If the kernel log prints `BPU Test Case Pass`, the BPU is working normally:

```bash
dmesg -c
echo 1 > /sys/devices/system/bpu/bpu0/power_enable
echo 1 > /sys/devices/system/bpu/bpu0/test
dmesg | grep -i bpu
```

:::note

`dmesg -c` clears the kernel log. It is only used to avoid interference from old logs and can be omitted as needed.

:::

Sample output:

```text
bpu-core 28108000.bpu: BPU Test Case(1) Pass, Use time(89us)!
```

If you do not see `BPU Test Case Pass`, use `dmesg | grep -i bpu` to check whether there are BPU-related errors.

Check the BPU firmware version:

```bash
cat /sys/devices/system/bpu/bpu0/fw_version
# Example output: 1.1.26
```

:::note

When the BPU firmware is not loaded, this node returns `0.0.0`. After running the self-test commands above to load the firmware, it returns the actual version number.

:::

### MCU working status

```bash
cat /sys/class/remoteproc/remoteproc_mcu0/alive
# Example output: alive
```

Returning `alive` means the MCU is running normally; otherwise the MCU is abnormal — reboot the board and test again.

Check the MCU firmware version:

```bash
cat /sys/class/remoteproc/remoteproc_mcu0/mcu_version
# Example output:
# MCU0 Board type = GccDebugLiteMatrix_V2.0
# MCU0 Build time = May 26 2026 23:08:30
```

### VDSP working status

```bash
cat /sys/class/remoteproc/remoteproc_vdsp0/state
# Example output: offline
```

If `state` is `running`, the VDSP is running; if it is `offline`, the VDSP firmware is not loaded. RDK OS does not load the VDSP firmware by default, so the default output of `offline` is normal.

Check the VDSP firmware version:

```bash
cat /sys/class/remoteproc/remoteproc_vdsp0/version
# Output is empty when firmware is not loaded
```

The VDSP firmware is loaded by upper-layer applications when needed by the workload. After loading, `state` changes to `running` and `version` returns the version information.

## Success criteria

- `cat /etc/version` outputs a version number (non-empty).
- The `[Hardware Model]` from `rdkos_info` matches the board in your hands (S100/S600).
- The BPU self-test outputs `BPU Test Case Pass` in the kernel log.
- The MCU's `alive` node returns `alive`.

## FAQ

- **The output of `cat /etc/version` does not match the expected image version**: The flashed image is wrong. Flash again following [Flashing preparation](./01_instruction.md).
- **The BPU self-test does not show `BPU Test Case Pass`**: Run `dmesg -c` first to clear the kernel log, then rerun the self-test; if there is still no output, use `dmesg | grep -i bpu` to check BPU-related errors.
- **The MCU's `alive` node returns something other than `alive`**: The MCU is not running properly. Reboot the board and test again.
- **The command reports `No such file or directory`**: The corresponding kernel node or command does not exist in the current image. Confirm that the flashed image is a complete RDK OS image.

## Related documents

- [Flashing preparation](./01_instruction.md)
- [Remote login](05_remote_login.md)
- [Initial configuration](04_configuration_wizard.md)
- RDK dedicated commands reference: [devmem](../../09_Appendix/rdk-command-manual/01_devmem.md), [hrut_boardid](../../09_Appendix/rdk-command-manual/02_hrut_boardid.md), [hrut_socuid](../../09_Appendix/rdk-command-manual/04_hrut_socuid.md), [rdkos_info](../../09_Appendix/rdk-command-manual/06_rdkos_info.md)
