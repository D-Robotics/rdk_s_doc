---
sidebar_position: 2
---

# miniboot 升级

:::note
- 此升级方式仅适用于**非 OTA** 镜像下的在线 miniboot 更新；OTA 镜像请走 [系统 OTA 升级](./01_ota_system.md) 的完整流程。
- 流程**不经过 `ota_tool` 状态机**，而是直接通过 `dd` 烧写，升级后**需重启生效**。
:::

## 概述

当只需单独更新 miniboot 相关分区、而不想整片重烧整个系统时，可在板端通过 `rdk-miniboot-update` 直接刷写 miniboot 升级包。

- 脚本：`/usr/bin/rdk-miniboot-update`（由 `hobot-miniboot` deb 包提供）
- 升级包所在目录：`/usr/lib/firmware/rdk/miniboot/stable/<release|debug>/img_packages/`

本方案采用**直接烧写（direct flash）**策略：

- **NOR** 走一张按 FPT 顺序预排好的整盘镜像，`dd` 一次性覆盖整片（一次调用更新所有 miniboot 相关 NOR 分区，包括 BAK 分区和 A/B 两个 slot）。
- **eMMC / UFS** 上对若干 AB 分区逐个 `dd`，只写**当前 slot**。

:::warning 重要特性
流程不走 `ota_tool` 的 "升级 → 校验 → 切 slot" 两段式状态机，**没有内建的自动回滚**：任意一步 `dd` 失败或中途掉电都可能导致设备无法启动。
:::

## 工作原理

脚本执行顺序：

1. **OHP 生命周期检查**：若设备已进入 `OHP` 阶段，在线升级被拒绝，必须用 factory 工具整片重烧。
2. **读取当前 AB slot**：通过 `ota_tool -g` 获取 A / B；eMMC 阶段按当前 slot 写入 `<part>_<slot>`。
3. **选择 NOR 镜像**：内核 cmdline 含 `hobotboot.secureboot=1` 时使用 `miniboot_flash.img`（签名版），否则使用 `miniboot_flash_nose.img`。
4. **NOR 整片烧写**：对 `/dev/block/platform/by-name/hb_vspiflash` 做一次 `dd`（`bs=2M`），一次性覆盖整片 NOR，22MB 约需 3.5 分钟。
5. **eMMC / UFS 逐个烧写**：对 `acore_cfg_<slot>`、`bl31_<slot>`、`optee_<slot>`、`uboot_<slot>` 四个 AB 分区分别 `dd`（`bs=4M`）。**只写当前 slot，不做跨 slot 同步**，也**不触碰其它 AB 分区**（例如 RDK S600 的 `vbmeta`，本流程不升级；需要时请走系统 OTA 完整流程）。
6. **可选重启**：按 `--reboot y|n` 或交互输入决定是否立即 `reboot`。**重启后新 miniboot 才会生效。**

## 使用方法

### 自动升级（apt 安装 `hobot-miniboot` 时触发）

板端运行以下命令后，`hobot-miniboot` deb 包在安装/升级阶段会**自动调用** `rdk-miniboot-update` 完成 miniboot 烧写：

```bash
sudo apt update
sudo apt-get install -y hobot-miniboot
```

多数场景下只需上面这一步即可完成 miniboot 升级；如需要切换到 debug 版、在 CI / 批量脚本中跳过交互，或之后再手动重刷，再按下面的方式手动调用脚本。

### 手动方式 1：`rdk-miniboot-update` 命令

参数说明：

| 参数 | 取值 | 说明 |
|---|---|---|
| `--build` / `--type` | `release` / `debug` | 升级版本类型，可省略（**默认 `release`**） |
| `--reboot` | `y` / `n` | 升级完成后是否立即重启，省略时交互式提示 |
| `--confirm` | `y` / `n` | 跳过开头的 "WARNING / 警告" 确认，省略时交互式提示 |

示例：

```bash
# 完全交互：先问是否确认，再问是否重启（默认 release）
rdk-miniboot-update

# release 版，跳过确认，升级后立即重启
rdk-miniboot-update --confirm y --reboot y

# debug 版，不重启（保留现场观察 log，后续手动重启才生效）
rdk-miniboot-update --build debug --reboot n

# CI / 批量脚本：全非交互
rdk-miniboot-update --build release --confirm y --reboot y
```

失败时脚本以 `exit 1` 结束，并打印：

```text
Error: N step(s) failed to flash.
错误：N 个步骤烧写失败。
```

重启前建议 `dmesg | tail` 查看相关错误。

### 手动方式 2：`srpi-config` 菜单

详见 [srpi-config](../../../02_System_configuration/02_srpi-config.md#system-options) 的 Update miniboot 条目。

:::warning
`srpi-config` 只能发起 **release 版**升级；升级 debug 版必须用 `rdk-miniboot-update` 命令。
:::

## 限制

- **没有自动回滚**：任一步 `dd` 失败或中途掉电，已经写坏的分区不会被还原。
- **OHP 阶段不可用**：已进入 OHP 生命周期的设备只能走 factory 工具整片烧录。
- **不升级 eMMC 其它 AB 分区**：除 `acore_cfg` / `bl31` / `optee` / `uboot` 外的分区（S600 上的 `vbmeta` 等）都不会被触碰。

## 注意事项

- 升级过程中**禁止**拔电源、断电、重启或对分区执行任何其它写入操作——`dd` 整片烧写被打断会直接导致变砖。
