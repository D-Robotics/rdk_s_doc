---
title: "1.3.2 系统状态查询"
sidebar_position: 3
description: "烧录后第一步：确认系统版本与板卡型号"
---

# 1.3.2 系统状态查询

烧录完成并登录开发板后，**第一步先确认系统版本与板卡型号**，确保烧入的是预期镜像、跑在预期硬件上。本节给出三条最常用的查询命令。

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 或串口登录（见 [远程登录](./remote_login.md)）。

## 确认系统版本

```bash
cat /etc/version
```

输出示例（RDK S600，RDK OS 5.1.0）：

```text
5.1.0
```

该值即 RDK OS 的版本号。若与预期镜像版本不一致，说明烧入的镜像不对，需重新烧录（见 [烧录说明](./01_instruction.md)）。

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
# 输出示例：82458308339029838942491a0000078d
```

## 成功标志

- `cat /etc/version` 有版本号输出（非空）。
- `rdkos_info` 的 `[Hardware Model]` 与你手中的板卡一致（S100/S600）。

## 相关文档

- [烧录说明](./01_instruction.md)
- [远程登录](./remote_login.md)
- [RDK 专属命令详解](../../09_Appendix/rdk-command-manual/04_hrut_socuid.md)（`devmem`/`hrut_boardid`/`hrut_socuid`/`rdkos_info`）
