---
sidebar_position: 4
description: 介绍使用 XBurn 备份 RDK S100 系统镜像并恢复的步骤，包括按全镜像、指定区域和指定分区备份，以及用备份镜像恢复。
---

# 备份和恢复镜像

本页介绍如何把 RDK S100 当前系统备份成镜像，并恢复到源板或复制到新板。

## 概述

备份即把当前系统存成镜像。备份后，把镜像重新烧录到目标板即可恢复，目标板可以是源板，也可以是新板：

- **恢复到源板**：把系统恢复到备份时的状态。
- **复制到新板**：把系统复制到另一块开发板。

:::note
备份不支持批量，一次只能操作一台设备。
:::

## 前置条件

### 源板准备

确认源板能正常启动，并开启 ADB。

### XBurn 版本要求

需 XBurn ≥ 1.2.2，安装见 [安装 XBurn](https://developer.d-robotics.cc/xburn_doc/install)。

### SDK 版本要求

- SDK 4.0.5 之后，直接开始备份。
- SDK 4.0.5 及之前版本的 U-Boot 不支持备份超过 4GB 的分区，需先更新。

更新 U-Boot 在**源板**上进行，且必须在备份前完成：

1. 得到 `uboot.img`：
   - **方式一**：打 [补丁](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/rdk_s/file/0001-fastboot-fetch-fix-RDKS100-1919-Support-fetching-par.patch) 后编译出 `uboot.img`。
   - **方式二**：下载预编译的 `uboot.img`，任选其一即可：[uboot-debug.img](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/rdk_s/file/uboot-debug.img)（含打印信息）或 [uboot-release.img](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/rdk_s/file/uboot-release.img)（用于量产）。
2. 替换 `product` 里的 `uboot.img`（`product` 即 [烧录准备](./02_preparation.md#镜像下载) 下载解压的文件夹），覆盖：
   - `product/xmodem_tools/sec/out/s100/uboot.img`
   - `product/img_packages/uboot.img`
3. 烧录到源板 `uboot` 分区：
   - **方式一**：在 XBurn 中勾选 `uboot` 分区后烧录。

     <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-burn-uboot.png" alt="XBurn 勾选分区界面" style={{ width: '100%' }} />

   - **方式二**：板端先进入 Fastboot 模式（上电长按空格进入 U-Boot 命令行，输入 `fastboot 0`），再执行：

     ```text
     fastboot oem interface:blk
     fastboot oem bootdevice:mmc
     fastboot flash uboot_a uboot.img
     fastboot flash uboot_b uboot.img
     ```

## 备份全镜像

备份完整系统镜像，用于恢复到源板或复制到新板。

1. 在 [烧录全镜像](./03_burn.md#烧录全镜像) 步骤基础上，展开 **高级配置**，勾选 `miniboot` 区域和 `boot`、`system` 等分区。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-migration-burn.png" alt="XBurn 配置备份镜像界面" style={{ width: '100%' }} />

   | 区域/分区 | 说明 |
   | --- | --- |
   | 区域 `miniboot_flash` | NOR Flash 启动镜像 |
   | 区域 `miniboot_emmc` | eMMC 基础启动镜像 |
   | 分区 `boot`、`system` 等（按需） | U-Boot 之后的分区 |

   :::note
   不勾选 `emmc` 区域，因为 `miniboot` 已覆盖启动镜像，其余按分区备份即可。
   :::

2. 等待备份完成，然后在解压后的 `product` 文件夹的 `img_packages/` 目录下查看镜像：

   | 路径 | 内容 | 命名规则 |
   | --- | --- | --- |
   | `img_packages/disk/` | 区域备份镜像 | `[区域]_backup.img`（如 `miniboot_flash_backup.img`、`miniboot_emmc_backup.img`） |
   | `img_packages/backup/` | 单个分区备份镜像 | `[分区].img`（如 `boot.img`、`system.img`） |

   :::warning 备份勿中断
   备份耗时较长（大分区如 45GB 的 `system` 约 30 分钟以上），请耐心等待，勿中途中断。
   :::

3. 重命名备份镜像，去掉文件名中的 `_backup` 后缀：

   | 原路径 | 重命名后路径 | 命名规则 |
   | --- | --- | --- |
   | `img_packages/disk/` | 不变 | 去掉 `_backup`<br />- `miniboot_flash_backup.img` → `miniboot_flash.img`<br />- `miniboot_emmc_backup.img` → `miniboot_emmc.img` |
   | `img_packages/backup/` | `img_packages/` | 名称不变（如 `boot.img`、`system.img`） |

4. 按 [烧录指定区域](./03_burn.md#烧录指定区域) 和 [烧录指定分区镜像](./03_burn.md#烧录指定分区镜像) 烧录，勾选与备份时相同的区域和分区。

## 备份指定区域

备份指定区域的镜像到 PC。支持的备份区域如下：

| 区域 | 实际存储介质 | 固件内容 | 备份镜像 |
| --- | --- | -------- | ------------ |
| miniboot_flash | NOR Flash | NOR Flash 基础启动镜像 | img_packages/disk/miniboot_flash_backup.img |
| miniboot_emmc | eMMC | eMMC 基础启动镜像 | img_packages/disk/miniboot_emmc_backup.img |
| emmc | eMMC | eMMC 完整镜像 | img_packages/disk/emmc_disk_backup.img |

1. 在 [烧录全镜像](./03_burn.md#烧录全镜像) 步骤基础上，展开 **高级配置**，勾选 **备份指定区域**，勾选目标区域（如 `miniboot_flash` 和 `miniboot_emmc`）。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-back-region.png" alt="备份指定区域界面" style={{ width: '100%' }} />

   :::note 备份耗时
   数据备份耗时较长，请耐心等待。
   :::

2. 完成备份后，打开 `img_packages/disk/`，查看备份镜像文件（如 `miniboot_flash_backup.img`、`miniboot_emmc_backup.img`）。

3. 重命名备份镜像，去掉文件名中的 `_backup` 后缀：

   | 区域 | 备份镜像 | 重命名后 |
   | --- | --- | --- |
   | miniboot_flash | `miniboot_flash_backup.img` | `miniboot_flash.img` |
   | miniboot_emmc | `miniboot_emmc_backup.img` | `miniboot_emmc.img` |
   | emmc | `emmc_disk_backup.img` | **`emmc_disk.simg`** |

   :::note
   `emmc` 区域的扩展名须由 `.img` 改为 `.simg`。
   :::

4. 按 [烧录指定区域](./03_burn.md#烧录指定区域) 烧录，勾选与备份时相同的区域。

## 备份指定分区镜像

按**单个系统组件分区**备份，粒度比 [备份指定区域](#备份指定区域) 更细，是分区级（单个组件分区，如 `uboot`、`boot`、`system`）。

1. 在 [烧录全镜像](./03_burn.md#烧录全镜像) 步骤基础上，展开 **高级配置**，勾选 **备份指定分区镜像**，勾选目标分区，完成备份。

   勾选后出现的分区选项如下：

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-back-partition.png" alt="备份指定分区镜像界面" style={{ width: '100%' }} />

2. 备份完成后，分区镜像保存在 `img_packages/backup/`（如 `boot.img`、`system.img`）。

3. 烧录前替换，把分区镜像替换到 `img_packages/` 下同名文件（如 `boot.img`、`system.img`）。

4. 按 [烧录指定分区镜像](./03_burn.md#烧录指定分区镜像) 烧录，勾选与备份时相同的分区。
