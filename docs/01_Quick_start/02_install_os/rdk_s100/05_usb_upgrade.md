---
sidebar_position: 5
sidebar_versions: ">= 4.1.0"
sidebar_products: RDK S100
description: 制作 U 盘升级镜像，开发板上电后由 U-Boot 自动完成系统烧录
---

# U 盘升级

## 概述

U 盘升级是把系统镜像写入 U 盘，开发板上电时由 U-Boot 读取 U 盘，把镜像烧录到板载 eMMC，完成后自动重启进入新系统。

制盘只需一次，之后同一张 U 盘可以反复使用，烧录时不需要 PC 和 XBurn，适合产线批量烧录和现场恢复。

U 盘升级使用 `img_packages/disk/emmc_disk.simg`，与 XBurn 烧录 `emmc` 区域时的镜像相同，只是把传输载体从 PC 换成了 U 盘。

| 方式 | 载体 | 支持的操作 | 适用场景 |
| --- | --- | --- | --- |
| XBurn | PC + USB | 烧录全镜像 / 烧录指定区域 / 烧录指定分区镜像 / 备份指定区域 | 首次烧录、系统恢复、分区级维护 |
| U 盘升级 | U 盘 | 仅烧录完整 eMMC 区域（`emmc_disk.simg`） | 无 PC、批量烧录、现场恢复 |

:::warning 仅支持写入，不支持备份
U 盘升级只能把 U 盘中的稀疏镜像烧录到板载 eMMC，**不能**把板载 eMMC 的内容备份或回写到 U 盘。需要备份系统时，使用 [XBurn 备份](./03_burn.md#备份指定区域) 功能。
:::

:::note 适用版本
RDK S100 V4.1.0 及之后的系统版本支持 U 盘升级。更早的版本 U-Boot 不包含该功能，上电后不会出现升级日志。
:::

## 前置条件

完成本操作需要准备以下内容：

- 待升级的 RDK S100 开发板，且能从板载 eMMC 启动
- U 盘：容量不小于 16GB，USB 3.0 及以上规格
- 调试串口线，用于查看升级过程和验证结果
- 系统镜像 `img_packages/disk/emmc_disk.simg`，获取方式见 [镜像下载](./02_preparation.md#镜像下载)。本方式无需安装 XBurn

## 操作步骤

### 步骤 1：制作升级 U 盘

U-Boot 只识别写在 U 盘**起始位置**（LBA 0）的稀疏镜像。把 `.simg` 文件复制进 FAT 或 exFAT 文件系统不会被识别，必须用 `dd` 写入整盘设备。

:::danger 数据会全部丢失
本步骤会清空 U 盘上的全部数据和分区，确认设备名时务必核对容量，不要写错为 PC 的系统盘。
:::

本步骤的命令在解压得到的 `product` 目录下执行，镜像位于 `img_packages/disk/`。

1. 在 Linux 或 WSL 环境中插入 U 盘，确认整盘设备名：

   ```bash
   lsblk
   ```

   输出示例（`sdf` 为本次 U 盘，实际以容量判断）：

   ```text
   sdf      8:80   1  58.6G  0 disk
   └─sdf1   8:81   1  58.6G  0 part
   ```

2. （可选）确认镜像是稀疏镜像。稀疏镜像文件头为 `3aff 26ed`：

   ```bash
   xxd -l 4 img_packages/disk/emmc_disk.simg
   ```

   预期输出：

   ```text
   00000000: 3aff 26ed
   ```

3. 擦除 U 盘开头的分区表和引导记录：

   ```bash
   sudo dd if=/dev/zero of=/dev/sdf bs=512 count=2048
   ```

   预期输出：

   ```text
   2048+0 records in
   2048+0 records out
   1048576 bytes (1.0 MB, 1.0 MiB) copied
   ```

4. 把镜像写入 U 盘整盘设备：

   ```bash
   sudo dd if=img_packages/disk/emmc_disk.simg of=/dev/sdf bs=4M conv=sync status=progress
   ```

   预期输出（字节数随镜像版本变化）：

   ```text
   2150+0 records out
   9017753600 bytes (9.0 GB, 8.4 GiB) copied, 449.323 s, 20.1 MB/s
   ```

5. 同步缓存并安全移除 U 盘：

   ```bash
   sync
   sudo eject /dev/sdf
   ```

`conv=sync` 会把最后一个不满 4 MiB 的块补齐，所以 `dd` 输出的字节数是 4 MiB 的整数倍，略大于镜像文件的实际大小，这是正常现象。如果 `dd` 中途报错，或输出字节数小于镜像文件大小，重新执行步骤 3 和步骤 4。

### 步骤 2：连接 U 盘并冷启动

1. 保持开发板断电，把制作好的 U 盘插入 USB 3.0 Type-A 口（J19/J20）。USB Type-C（J16）只支持 Device 模式，不能接 U 盘。
2. 用 Type-C 线缆连接 PC 与调试串口，串口参数见 [Type-C (J16)](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#type-c-j16)。
3. 给开发板断电后重新上电。自动升级只在冷启动时执行，`reboot` 之类的软重启会跳过。

### 步骤 3：观察升级过程

U-Boot 启动后先检测 U 盘，日志示例如下：

```text
u disk auto upgrade: enabled
u disk upgrade: boot reason=poweroff (0xdead40ff)
...
USB upgrade source: usb 0 Vendor: Kingston Prod: DataTraveler 3.0
USB sparse image found, upgrading...
USB upgrade scratch @ 0x400000000
Do NOT remove the USB disk!!!
simg file bytes: 9015699728, expanded bytes: 24747937792
Flashing Sparse Image
...
upgrade progress: 222261248 / 24747937792 bytes (0%)
...
##################################
# USB disk upgrade to mmc SUCCESS, need reboot system.
##################################
upgrade from USB disk Success, now reboot system
```

- 第一行 `u disk auto upgrade: enabled` 表示本次升级由上电自动触发。S100 没有关闭自动升级的开关。
- 看到 `USB sparse image found, upgrading...` 表示已找到镜像并开始烧录。
- 烧录期间**不要拔出 U 盘，也不要断电**，进度到达 100% 后开发板自动重启。
- 升级耗时取决于 U 盘与 eMMC 的读写速度，通常需要数分钟。

## 验证结果

- **成功**：串口出现 `# USB disk upgrade to mmc SUCCESS, need reboot system.`，开发板自动重启。
- 重启后拔掉 U 盘，进入系统确认版本与 U 盘镜像一致：

  ```bash
  cat /etc/version
  ```

  输出为镜像对应的版本号。也可以执行 `sudo rdkos_info` 查看完整系统信息，见 [rdkos_info 命令](../../../09_Appendix/rdk-command-manual/cmd_rdkos_info.md)。
- **常见失败**：串口出现 `# USB disk upgrade to mmc FAILED.` 并停在 U-Boot 命令行，处理见 [常见问题](#常见问题)。

## 进阶用法

### 手动触发升级

进入 U-Boot 命令行（上电后立即长按空格），按需执行：

```text
u_disk_upgrade           # 自动选择起始位置为稀疏镜像的 U 盘
u_disk_upgrade force     # 跳过冷启动判断，立即升级
```

## 常见问题

### 插入 U 盘上电后，串口没有任何升级日志

**原因**：系统版本低于 V4.1.0，U-Boot 不包含该功能。

**解决**：执行 `cat /etc/version` 确认系统版本，低于 V4.1.0 时先升级系统。

### 串口提示 skip u disk upgrade: not POR

**原因**：本次是软重启而不是冷启动。升级完成后的自动重启也会出现该提示，属于正常现象，避免成功后再次烧录。

**解决**：断电后重新上电，或在该提示下进入 U-Boot 命令行手动执行 `u_disk_upgrade force`。

### 串口提示 skip u disk upgrade: no sparse image on USB storage

**原因**：U 盘起始位置不是稀疏镜像。常见于把 `.simg` 文件当作普通文件复制进了 FAT 或 exFAT 文件系统。

**解决**：按 [步骤 1](#步骤-1制作升级-u-盘) 用 `dd` 把镜像写入整盘设备。

### 升级成功后，下次上电又重复升级

**原因**：U 盘仍插在开发板上，冷启动会再次触发自动升级。

**解决**：升级完成后拔掉 U 盘。

### 串口提示 USB disk upgrade to mmc FAILED 并停在 U-Boot 命令行

**原因**：镜像写入不完整或文件损坏，或目标 eMMC 容量小于镜像展开后的大小。

**解决**：重新制作 U 盘，并确认 `dd` 输出的字节数不小于镜像文件大小；确认 eMMC 容量；在 U-Boot 命令行执行 `run u_disk_upgrade_cmd` 重试。
