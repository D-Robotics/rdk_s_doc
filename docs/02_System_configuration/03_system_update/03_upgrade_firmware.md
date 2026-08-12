---
title: "2.3.3 主版本升级与固件"
sidebar_position: 3
description: "RDK OS 主版本升级、固件升级与降级"
---

# 2.3.3 主版本升级与固件

RDK OS 的升级分两类：**包级更新**（`apt upgrade`，见 [软件包管理 apt](./02_apt_usage.md)）与**主版本/固件升级**（须重新烧录镜像或走 OTA）。

:::info 说明
主版本升级会变更系统镜像，未在板端复现（会抹除当前在用的 S600 系统）；流程据官方升级说明。
:::

## 主版本升级

RDK OS 跨大版本（如 5.0.x → 5.1.x）**不能靠 `apt` 升级**，须重新烧录目标版本的镜像：

1. 备份板端自定义配置（`/etc`、`/opt` 下私有内容）。
2. 下载目标版本镜像（见 [镜像下载](../../01_Quick_start/03_install_os_and_setup/01_instruction.md)）。
3. 按 [烧录步骤](../../01_Quick_start/03_install_os_and_setup/02_burn.md) 烧录新镜像。
4. 烧后用 [系统状态查询](../../01_Quick_start/03_install_os_and_setup/system_status.md) 确认版本。

:::warning
跨大版本升级会清空 rootfs，apt 装的私有包与配置需重新部署。生产环境先在测试板验证。
:::

## 固件升级与降级

部分固件组件（如 miniboot、引导）支持板端工具升级/降级，不必整盘重烧。详细见进阶：

- [系统 OTA 升级](../../07_Advanced_development/03_system_software/06_ota_system.md)
- [miniboot 升级](../../07_Advanced_development/03_system_software/07_ota_miniboot.md)

## apt 升级 vs 固件升级

| 场景 | 方式 | 风险 |
|---|---|---|
| 升级 hobot-* 等包 | `apt upgrade` | 低（同大版本内） |
| 跨大版本 | 重新烧录镜像 | 高（清空 rootfs） |
| 升级引导/miniboot | OTA/miniboot 工具 | 中（须按官方步骤） |

## 常见问题

- **`apt upgrade` 后起不来**：跨大版本 apt 升级不支持；重新烧录正确镜像。
- **降级后异常**：固件降级有兼容风险，确认降级路径官方支持。
- **OTA 失败**：检查分区布局与 `miniboot` 版本是否匹配，见 [系统 OTA 升级](../../07_Advanced_development/03_system_software/06_ota_system.md)。

## 相关文档

- [软件包管理 apt](./02_apt_usage.md)
- [RDK OS 介绍](./01_rdk_os_intro.md)
- [烧录步骤](../../01_Quick_start/03_install_os_and_setup/02_burn.md)
- [系统 OTA 升级（进阶）](../../07_Advanced_development/03_system_software/06_ota_system.md)
