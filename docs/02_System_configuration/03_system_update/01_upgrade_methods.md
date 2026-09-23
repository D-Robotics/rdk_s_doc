---
title: "系统升级方式"
sidebar_position: 1
description: "RDK OS 升级方式：apt 包升级与固件烧录"
---

# 系统升级方式

RDK OS 升级分两类：**apt 包升级**（更新软件包）与**固件烧录**（直接烧写镜像或分区）。同大版本内用 `apt` 升级较安全；跨大版本（如 5.0.x → 5.1.x）建议走固件烧录，`apt` 跨大版本从历史版本升级上来可能有兼容风险。miniboot 较特殊，无论走哪类都会触发烧录，详见下文。

## apt 包升级

用 `apt` 更新 `hobot-*`、`tros-*` 等软件包，不烧录镜像、不动引导与分区。命令与注意事项见 [软件包管理 apt](./02_apt_usage.md)。

## 固件烧录

固件烧录用于跨大版本或更换固件组件，会覆盖板端系统，烧录前请备份板端数据。

### 整机镜像烧录（跨大版本）

跨大版本（如 5.0.x → 5.1.x）须重新烧录整个系统镜像：

1. 备份板端自定义配置（`/etc`、`/opt` 下的私有内容）。
2. 下载目标版本镜像（见 [镜像下载](../../01_Quick_start/03_install_os_and_setup/01_instruction.md)）。
3. 按 [烧录步骤](../../01_Quick_start/03_install_os_and_setup/02_burn.md) 烧录新镜像。
4. 烧录后用 [系统状态查询](../../01_Quick_start/03_install_os_and_setup/03_system_status.md) 确认版本。

:::warning 警告
整机烧录会覆盖系统镜像、清空 rootfs，请提前备份板端自定义配置（`/etc`、`/opt` 下的私有内容）。apt 安装的私有包与配置需升级后重新部署，生产环境请先在测试板验证。
:::

### miniboot 烧录（组件级）

miniboot 较特殊：无论走 `apt` 还是整机镜像烧录，都会烧录 miniboot。

- 走 `apt` 安装/升级 `hobot-miniboot` 时，deb 安装阶段会自动调用 `rdk-miniboot-update` 完成烧写。
- `rdk-miniboot-update` 采用直接烧写（direct flash）：对 NOR 做一次 `dd` 整片覆盖，一次性更新所有 miniboot 相关 NOR 分区（含 BAK 分区和 A/B 两个 slot）。
- eMMC/UFS 上的 `acore_cfg`、`bl31`、`optee`、`uboot` 分区逐个 `dd`，只写当前 slot。
- 仅适用于非 OTA 镜像；OTA 镜像请走 [系统 OTA 升级](../../07_Advanced_development/03_system_software/06_ota_system.md)。

详细见 [miniboot 升级](../../07_Advanced_development/03_system_software/07_ota_miniboot.md)。

## 验证

- apt 包升级：`apt upgrade` 后 `apt list --upgradable` 无待升级包，系统功能正常。
- 整机烧录：烧录目标镜像后，用 [系统状态查询](../../01_Quick_start/03_install_os_and_setup/03_system_status.md) 确认版本号已到目标大版本。
- miniboot 烧录：`rdk-miniboot-update` 完成并重启后，系统能正常启动即成功。

## 常见问题

- **`apt upgrade` 后起不来**：跨大版本升级有兼容风险，建议重新烧录正确镜像。
- **烧录后系统异常**：确认镜像版本与板型匹配；固件降级有兼容风险，确认降级路径官方支持。

## 相关文档

- [软件包管理 apt](./02_apt_usage.md)
- [烧录步骤](../../01_Quick_start/03_install_os_and_setup/02_burn.md)
- [miniboot 升级（进阶）](../../07_Advanced_development/03_system_software/07_ota_miniboot.md)
- [系统 OTA 升级（进阶，默认不开启，需重新编译镜像）](../../07_Advanced_development/03_system_software/06_ota_system.md)
