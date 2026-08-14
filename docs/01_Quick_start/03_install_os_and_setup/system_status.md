---
title: "系统状态查询"
sidebar_position: 3
description: "烧录后第一步：确认系统版本与板卡型号"
---

# 系统状态查询

烧录完成并登录开发板后，**第一步先确认系统版本与板卡型号**，确保烧入的是预期镜像、跑在预期硬件上。确认无误后，再检查 BPU、MCU、VDSP 各核心的工作状态，确保整板硬件就绪。

## 前置条件

- [ ] 开发板已烧录 RDK OS 并通过 SSH 或串口登录（见 [远程登录](./remote_login.md)）。

## 确认系统版本

```bash
cat /etc/version
```

输出示例（RDK S600，RDK OS 5.1.0）：

```text
5.1.0
```

该值即 RDK OS 的版本号。若与预期镜像版本不一致，说明烧入的镜像不对，需重新烧录（见 [烧录说明](./01_instruction.md)）。

## 版本与基线

```bash
cat /etc/os-release
```

RDK S600 实测（RDK OS V5.1.0）：

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

- 基线：Ubuntu 24.04（noble）。
- 版本号：`5.1.0`（`cat /etc/version`）。
- 主机名：`drobot`（`cat /etc/hostname`）。

## 确认板卡型号与硬件 ID

```bash
rdkos_info
```

`rdkos_info` 汇总系统关键信息，开头会给出硬件型号与 Board Id：

```text
================ RDK System Information Collection ================

[Hardware Model]:
	D-Robotics RDK S600 MCB V1p0 (Board Id = 0x5131310)
```

从中可确认：板卡是 RDK S100 还是 S600、载板版本（如 `MCB V1p0`）、Board Id。后续还会输出 CPU/BPU 温度、频率等运行状态，可用于排障。

如只需 Board Id，单独执行：

```bash
hrut_boardid
# 输出示例：0x5131310
```

## 确认 SoC 唯一 ID

每片 SoC 有唯一 ID，用于授权或设备登记：

```bash
hrut_socuid
# 输出示例：0123456789abcdef0123456789abcdef（32 位十六进制，示例值，实际每片 SoC 不同）
```

## 检查各核心工作状态

确认版本与板卡型号无误后，再检查 BPU、MCU、VDSP 三个协处理核心的工作状态，确保整板硬件就绪。

### BPU 工作状态

执行 BPU 自检，内核日志打印 `BPU Test Case Pass` 即表示 BPU 正常工作：

```bash
dmesg -c
echo 1 > /sys/devices/system/bpu/bpu0/power_enable
echo 1 > /sys/devices/system/bpu/bpu0/test
dmesg | grep -i bpu
```

:::note

`dmesg -c` 会清空内核日志，仅用于避免旧日志干扰，可按需省略。

:::

输出示例：

```text
bpu-core 28108000.bpu: BPU Test Case(1) Pass, Use time(89us)!
```

如果看不到 `BPU Test Case Pass`，用 `dmesg | grep -i bpu` 查看是否有 BPU 相关报错。

查看 BPU 固件版本：

```bash
cat /sys/devices/system/bpu/bpu0/fw_version
# 输出示例：1.1.26
```

:::note

BPU 固件未加载时该节点返回 `0.0.0`，执行上述自检命令加载固件后即返回真实版本号。

:::

### MCU 工作状态

```bash
cat /sys/class/remoteproc/remoteproc_mcu0/alive
# 输出示例：alive
```

返回 `alive` 表示 MCU 正常运行；否则 MCU 异常，重启板卡后复测。

查看 MCU 固件版本：

```bash
cat /sys/class/remoteproc/remoteproc_mcu0/mcu_version
# 输出示例：
# MCU0 Board type = GccDebugLiteMatrix_V2.0
# MCU0 Build time = May 26 2026 23:08:30
```

### VDSP 工作状态

```bash
cat /sys/class/remoteproc/remoteproc_vdsp0/state
# 输出示例：offline
```

`state` 为 `running` 表示 VDSP 正在运行；为 `offline` 表示 VDSP 固件未加载。RDK OS 默认不加载 VDSP 固件，默认输出 `offline` 属正常现象。

查看 VDSP 固件版本：

```bash
cat /sys/class/remoteproc/remoteproc_vdsp0/version
# 未加载固件时输出为空
```

VDSP 固件在业务需要时由上层应用加载，加载后 `state` 变为 `running`、`version` 返回版本信息。

## 成功标志

- `cat /etc/version` 有版本号输出（非空）。
- `rdkos_info` 的 `[Hardware Model]` 与你手中的板卡一致（S100/S600）。
- BPU 自检在内核日志输出 `BPU Test Case Pass`。
- MCU 的 `alive` 节点返回 `alive`。

## 常见问题

- **`cat /etc/version` 输出与预期镜像版本不一致**：说明烧入的镜像不对，按 [烧录说明](./01_instruction.md) 重新烧录。
- **BPU 自检看不到 `BPU Test Case Pass`**：先执行 `dmesg -c` 清空内核日志，再重跑自检；仍无输出则用 `dmesg | grep -i bpu` 查看 BPU 相关报错。
- **MCU 的 `alive` 节点返回非 `alive`**：MCU 未正常运行，重启板卡后复测。
- **命令提示 `No such file or directory`**：对应的内核节点或命令在当前镜像中不存在，确认烧录的是完整 RDK OS 镜像。

## 相关文档

- [烧录说明](./01_instruction.md)
- [远程登录](./remote_login.md)
- [RDK 专属命令详解](../../09_Appendix/rdk-command-manual/04_hrut_socuid.md)（`devmem`/`hrut_boardid`/`hrut_socuid`/`rdkos_info`）
