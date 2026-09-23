---
title: "系统状态查询"
sidebar_position: 3
description: "烧录后第一步：确认系统版本与板卡型号"
---

# 系统状态查询

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本页介绍烧录完成后如何确认系统版本、板卡型号与 BPU、MCU、VDSP 各核心的工作状态。

登录开发板后执行命令，确认系统版本、Ubuntu 基线、板卡型号与 Board Id、SoC 唯一 ID 及 BPU、MCU、VDSP 各核心的工作状态，可在进入后续开发前排除镜像烧错与硬件异常。确认无误后，可按 [入门配置](./04_configuration_wizard.md) 完成首次配置。

## 前置条件

- [ ] 开发板已烧录 RDK OS，烧录方法见[烧录说明](./01_instruction.md)。
- [ ] 已通过 SSH 或串口登录开发板，登录方法见[远程登录](./05_remote_login.md)；推荐使用默认账户登录。

## 操作步骤

### 步骤 1：确认系统版本与基线

执行以下命令查看 RDK OS 版本号：

```bash
cat /etc/version
```

<DocScope products="RDK S600">

预期输出（RDK S600，RDK OS 5.1.0）：

```text
5.1.0
```

</DocScope>

<DocScope products="RDK S100">

预期输出：所烧录镜像的版本号。当前 S100 最新镜像版本为 `4.0.5`。

</DocScope>

该值即 RDK OS 的版本号。若与预期镜像版本不一致，说明烧入的镜像不对，需按[烧录说明](./01_instruction.md)重新烧录。

继续执行以下命令查看发行版基线信息：

```bash
cat /etc/os-release
```

<DocScope products="RDK S600">

预期输出（RDK S600，RDK OS V5.1.0）：

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

从输出可确认 RDK S600 的基线：Ubuntu 24.04（noble）；版本号 `5.1.0`（与 `cat /etc/version` 一致）。主机名可用 `cat /etc/hostname` 查看，S600 为 `drobot`。

</DocScope>

<DocScope products="RDK S100">

预期输出：RDK S100 基线为 Ubuntu 22.04，版本号、主机名等字段以板端实际输出为准。

</DocScope>

失败排查：命令提示 `No such file or directory` 时，说明当前镜像不完整或不是 RDK OS 镜像，需重新烧录。

### 步骤 2：确认板卡型号与硬件 ID

执行以下命令汇总系统关键信息：

```bash
rdkos_info
```

`rdkos_info` 开头会给出硬件型号与 Board Id：

<DocScope products="RDK S600">

预期输出（RDK S600）：

```text
================ RDK System Information Collection ================

[Hardware Model]:
	D-Robotics RDK S600 MCB V1p0 (Board Id = 0x5131310)
```

</DocScope>

<DocScope products="RDK S100">

预期输出：输出以 `[Hardware Model]` 开头，给出 RDK S100 的板卡型号与 Board Id。

</DocScope>

从中可确认：板卡是 RDK S100 还是 RDK S600、载板版本（如 `MCB V1p0`）、Board Id。后续还会输出 CPU/BPU 温度、频率等运行状态，可用于排障。

如只需 Board Id，单独执行：

<DocScope products="RDK S600">

```bash
hrut_boardid
# 预期输出：0x5131310
```

</DocScope>

<DocScope products="RDK S100">

```bash
hrut_boardid
```

</DocScope>

失败排查：`rdkos_info` 或 `hrut_boardid` 不存在时，确认烧录的是完整 RDK OS 镜像；型号与手中板卡不符时，按[烧录说明](./01_instruction.md)重新烧录对应平台的镜像。

### 步骤 3：确认 SoC 唯一 ID

每片 SoC 有唯一 ID，用于授权或设备登记：

```bash
hrut_socuid
# 预期输出示例：0123456789abcdef0123456789abcdef（32 位十六进制，示例值，实际每片 SoC 不同）
```

失败排查：输出为空或命令不存在时，确认烧录的是完整 RDK OS 镜像，并检查命令是否输错。

### 步骤 4：检查各核心工作状态

确认版本与板卡型号无误后，再检查 BPU、MCU、VDSP 三个协处理核心的工作状态，确保整板硬件就绪。

#### BPU 工作状态

执行 BPU 自检，内核日志打印 `BPU Test Case Pass` 即表示 BPU 正常工作：

```bash
dmesg -c
echo 1 > /sys/devices/system/bpu/bpu0/power_enable
echo 1 > /sys/devices/system/bpu/bpu0/test
dmesg | grep -i bpu
```

:::note 注意
`dmesg -c` 会清空内核日志，仅用于避免旧日志干扰，可按需省略。
:::

预期输出：

```text
bpu-core 28108000.bpu: BPU Test Case(1) Pass, Use time(89us)!
```

失败排查：看不到 `BPU Test Case Pass` 时，用 `dmesg | grep -i bpu` 查看是否有 BPU 相关报错。

查看 BPU 固件版本：

```bash
cat /sys/devices/system/bpu/bpu0/fw_version
# 预期输出示例：1.1.26
```

:::note 注意
BPU 固件未加载时该节点返回 `0.0.0`，执行上述自检命令加载固件后即返回真实版本号。
:::

#### MCU 工作状态

执行以下命令查看 MCU 的 `alive` 节点：

```bash
cat /sys/class/remoteproc/remoteproc_mcu0/alive
# 预期输出：alive
```

返回 `alive` 表示 MCU 正常运行；否则 MCU 异常，重启板卡后复测。

查看 MCU 固件版本：

```bash
cat /sys/class/remoteproc/remoteproc_mcu0/mcu_version
# 预期输出示例：
# MCU0 Board type = GccDebugLiteMatrix_V2.0
# MCU0 Build time = May 26 2026 23:08:30
```

#### VDSP 工作状态

执行以下命令查看 VDSP 的 `state` 节点：

```bash
cat /sys/class/remoteproc/remoteproc_vdsp0/state
# 预期输出示例：offline
```

`state` 为 `running` 表示 VDSP 正在运行；为 `offline` 表示 VDSP 固件未加载。RDK OS 默认不加载 VDSP 固件，默认输出 `offline` 属正常现象。

查看 VDSP 固件版本：

```bash
cat /sys/class/remoteproc/remoteproc_vdsp0/version
# 未加载固件时输出为空
```

VDSP 固件在业务需要时由上层应用加载，加载后 `state` 变为 `running`、`version` 返回版本信息。

## 验证结果

| 检查项 | 命令 | 成功判据 |
| --- | --- | --- |
| 系统版本已确认 | `cat /etc/version` | 输出版本号（非空），且与预期镜像版本一致 |
| 发行版基线已确认 | `cat /etc/os-release` | 输出 `PRETTY_NAME="RDK OS"`，且 Ubuntu 基线与镜像预期一致 |
| 板卡型号已确认 | `rdkos_info` | `[Hardware Model]` 与手中板卡一致（RDK S100 或 RDK S600） |
| SoC 唯一 ID 已确认 | `hrut_socuid` | 输出 32 位十六进制唯一 ID（非空） |
| BPU 工作正常 | `dmesg -c` 后 `dmesg` 过滤 `bpu` | 内核日志输出 `BPU Test Case Pass` |
| MCU 工作正常 | `cat /sys/class/remoteproc/remoteproc_mcu0/alive` | 输出 `alive` |
| VDSP 状态已确认 | `cat /sys/class/remoteproc/remoteproc_vdsp0/state` | 默认输出 `offline`（固件未加载属正常） |

以上检查全部通过，即说明烧入的是预期镜像、跑在预期硬件上，且整板各核心状态正常。

## 常见问题

### `cat /etc/version` 输出与预期镜像版本不一致

**原因**：烧入的镜像与预期不符，例如烧录了其他版本或其他平台的镜像。

**解决**：确认下载的镜像版本与平台，按[烧录说明](./01_instruction.md)重新烧录。

### BPU 自检看不到 `BPU Test Case Pass`

**原因**：旧内核日志干扰，或 BPU 固件未加载、BPU 工作异常。

**解决**：先执行 `dmesg -c` 清空内核日志，再重跑自检；仍无输出则用 `dmesg | grep -i bpu` 查看 BPU 相关报错。

### MCU 的 `alive` 节点返回非 `alive`

**原因**：MCU 未正常运行，或 MCU 固件未正确加载。

**解决**：重启板卡后复测；仍异常时确认烧录的是完整 RDK OS 镜像，必要时重新烧录。

### VDSP 的 `state` 默认输出 `offline`

**原因**：RDK OS 默认不加载 VDSP 固件。

**解决**：无需处理；VDSP 固件在业务需要时由上层应用加载，加载后 `state` 变为 `running`。

### 命令提示 `No such file or directory`

**原因**：对应的内核节点或命令在当前镜像中不存在。

**解决**：确认烧录的是完整 RDK OS 镜像，并按[烧录说明](./01_instruction.md)重新烧录。

## 相关文档

- [烧录说明](./01_instruction.md)
- [远程登录](./05_remote_login.md)
- [入门配置](./04_configuration_wizard.md)
- RDK 专属命令详解：[devmem](../../09_Appendix/rdk-command-manual/01_devmem.md)、[hrut_boardid](../../09_Appendix/rdk-command-manual/02_hrut_boardid.md)、[hrut_socuid](../../09_Appendix/rdk-command-manual/04_hrut_socuid.md)、[rdkos_info](../../09_Appendix/rdk-command-manual/06_rdkos_info.md)
