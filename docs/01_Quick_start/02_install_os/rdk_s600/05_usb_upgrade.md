---
sidebar_position: 5
description: 制作 U 盘升级盘，开发板冷启动时由 U-Boot 自动把稀疏镜像烧录到板载 UFS
---

# U 盘升级

## 概述

U 盘升级是把系统镜像写入 U 盘，开发板冷启动时由 U-Boot 读取 U 盘，把镜像烧录到板载 UFS，完成后自动重启进入新系统。

制盘只需一次，之后同一张 U 盘可以反复使用，烧录时不需要 PC 和 XBurn，适合产线批量烧录和现场恢复。

U 盘升级使用 `img_packages/disk/ufs_disk.simg`，与 XBurn 烧录 `ufs` 区域时的镜像相同，只是把传输载体从 PC 换成了 U 盘。

| 方式 | 载体 | 支持的操作 | 适用场景 |
| --- | --- | --- | --- |
| XBurn | PC + USB | 烧录全镜像 / 烧录指定区域 / 烧录指定分区镜像 / 备份指定区域 | 首次烧录、系统恢复、分区级维护 |
| U 盘升级 | U 盘 | 仅烧录完整 UFS 区域（`ufs_disk.simg`） | 无 PC、批量烧录、现场恢复 |

:::warning 仅支持写入，不支持备份
U 盘升级只能把 U 盘中的稀疏镜像烧录到板载 UFS，**不能**把板载 UFS 的内容备份或回写到 U 盘。需要备份系统时，使用 XBurn 的 [备份指定区域](./03_burn.md#备份指定区域)。
:::

:::note 仅支持板载 UFS
当前 U 盘升级只支持板载 UFS，不支持 NVMe。NVMe 系统请使用 [XBurn 烧录](./03_burn.md)。
:::

## 前置条件

完成本操作需要准备以下内容：

- 待升级的 RDK S600 开发板，且从板载 UFS 启动
- U 盘：容量不小于 16GB，USB 3.0 及以上规格
- 调试串口线，用于查看升级过程和验证结果
- 系统镜像 `img_packages/disk/ufs_disk.simg`，获取方式见 [镜像下载](./02_preparation.md#镜像下载)。本方式无需安装 XBurn

## 操作步骤

### 步骤 1：制作升级 U 盘

U-Boot 只识别写在 U 盘**起始位置**（LBA 0）的稀疏镜像。把 `.simg` 文件复制进 FAT 或 exFAT 文件系统不会被识别，必须写入整盘设备。

:::danger 数据会全部丢失
本步骤会清空 U 盘上的全部数据和分区，确认设备名时务必核对容量，不要误写为 PC 的系统盘。
:::

制作完成后 U 盘不再有文件系统，在 PC 上可能提示「需要格式化」，这是正常现象，**不要格式化**。

#### 在 Linux 中使用 dd

以下命令在解压得到的 `product` 目录下执行，镜像位于 `img_packages/disk/`。

1. 插入 U 盘，执行 `lsblk` 确认整盘设备名（示例中 `sdf` 为 U 盘，实际以容量判断）：

   ```bash
   lsblk
   ```

   ```text
   sdf      8:80   1  58.6G  0 disk
   └─sdf1   8:81   1  58.6G  0 part
   ```

2. 擦除 U 盘开头的分区表和引导记录：

   ```bash
   sudo dd if=/dev/zero of=/dev/sdf bs=512 count=2048
   ```

3. 把镜像写入 U 盘整盘设备：

   ```bash
   sudo dd if=img_packages/disk/ufs_disk.simg of=/dev/sdf bs=4M conv=sync status=progress
   ```

   `conv=sync` 会把最后一个不满 4 MiB 的块补齐，所以 `dd` 输出的字节数是 4 MiB 的整数倍，略大于镜像文件的实际大小，这是正常现象。如果 `dd` 中途报错，或输出字节数小于镜像文件大小，重新执行步骤 2 和步骤 3。写入耗时取决于镜像大小和 U 盘写速度，8 GB 镜像约 3 到 4 分钟。

4. 同步缓存并安全移除 U 盘：

   ```bash
   sync
   sudo eject /dev/sdf
   ```

#### 在 WSL2 中使用 dd

WSL2 默认无法直接访问 U 盘，需要先用 usbipd-win 把 U 盘挂载进 WSL。

1. 在 Windows 管理员 PowerShell 中安装 usbipd-win（只需执行一次）：

   ```powershell
   winget install dorssel.usbipd-win
   ```

2. 列出 USB 设备，记录 U 盘对应的 BUSID（示例中为 `5-4`）：

   ```powershell
   usbipd list
   ```

3. 绑定并挂载到 WSL：

   ```powershell
   usbipd bind --busid 5-4
   usbipd attach --wsl --busid 5-4
   ```

4. 在 WSL 中执行 `lsblk` 确认设备名，然后按 [在 Linux 中使用 dd](#在-linux-中使用-dd) 的步骤擦除并写入镜像。

#### 在 Windows 中使用 balenaEtcher

1. 安装并打开 [balenaEtcher](https://etcher.balena.io/)，选择 **从文件烧录**。
2. 在文件选择对话框中，将文件格式切换为 **任何文件格式**，选择 `ufs_disk.simg`。
3. 选择目标 U 盘，单击 **现在烧录！**。
4. 若提示「没有分区表」，单击 **继续**。该提示属于正常现象，因为镜像是稀疏镜像而不是分区表格式。
5. 烧录完成后若提示「镜像曾被压缩，无法检查是否损坏」，单击 **取消**，忽略该提示。
6. 在 Windows 任务栏通知区域单击 **弹出 U 盘**，再拔出 U 盘。

:::note balenaEtcher 报 Flash Failed
该错误通常由 U 盘与 PC 的连接不稳定引起。重新插拔 U 盘后重试；多次失败时更换 U 盘或 USB 接口。
:::

### 步骤 2：连接 U 盘并冷启动

1. 保持开发板断电，把制作好的 U 盘插入 USB 3.0 Type-A 接口（[J7/J8/J9](../../01_hardware_introduction/02_rdk_s600/01_rdk_s600.md#usb-30-type-a-接口-j7j8j9)）。Type-C 接口只支持 Device 模式，不能接 U 盘。
2. 用 Type-C 线缆连接 PC 与开发板的 [调试串口](../../01_hardware_introduction/02_rdk_s600/01_rdk_s600.md#j4)，串口参数为波特率 921600、8 数据位、无校验、1 停止位、无流控。
3. 给开发板断电后重新上电。自动升级只在断电上电（POR）时执行，`reboot` 或按 RST 按键之类的复位都会跳过一次升级检查。

### 步骤 3：观察升级过程

U-Boot 启动后先检测 U 盘，串口日志示例如下：

```text
try upgrade from USB disk
reset reason is POR,try upgrade from u disk to scsi
addr=0x400000000, usb_index=0
starting USB...
scanning bus xhci_pci for devices... 1 USB Device(s) found
scanning usb for storage devices... 1 Storage Device(s) found
Device 0: Vendor: SanDisk Rev: 1.00 Prod: Ultra
            Type: Removable Hard Disk
            Capacity: 29664.0 MB = 28.9 GB (60751872 x 512)
Reading sparse image from usb disk 0 ...
=== Sparse Image Info ===
blk_sz: 4096, total_blks: 6168280
total_chunks: 746
Reading sparse image from USB disk. Please wait. Do NOT remove the USB disk!!!
usb read: device 0 block # 0, count 20971520 ... 20971520 blocks read: OK
Writing sparse image 0000400080000000 to scsi...
Flashing sparse Image at offset 0
Flashing Sparse Image
....... write 12380372992 bytes to '0x0'
time: 7 minutes, 0.719 seconds
#################################
# USB disk upgrade to scsi SUCCESS, need reboot system.
#################################
upgrade from USB disk Success, now reboot system
try to clear boot count...
read aon boot cnt = 0
resetting ...
```

- 看到 `Reading sparse image from usb disk 0` 表示已识别到镜像并开始读取；随后 U-Boot 打印 `Do NOT remove the USB disk!!!`，此时 U 盘仍在被读取。
- 读盘期间**严禁拔出 U 盘**；只有出现 `Writing sparse image ... to scsi`（开始写入 UFS）之后才能拔出 U 盘。
- 写入期间串口不输出百分比进度，长时间没有新日志属于正常现象。升级耗时取决于镜像大小和 UFS 写速度，镜像大小随版本变化；本文日志中的镜像写入约 12.4 GB，用时约 7 分钟。
- 升级成功后开发板自动重启，并清除升级标志，插着 U 盘再次冷启动不会重复烧录。

## 验证结果

- **成功**：串口出现 `USB disk upgrade to scsi SUCCESS, need reboot system.`，开发板自动重启。
- 重启后进入系统确认版本与 U 盘镜像一致：

  ```bash
  cat /etc/version
  ```

  输出为镜像对应的版本号。也可以执行 `sudo rdkos_info` 查看完整系统信息，见 [rdkos_info 命令](../../../09_Appendix/rdk-command-manual/cmd_rdkos_info.md)。
- **失败**：串口停在 U-Boot 命令行，不再继续启动，处理见 [常见问题](#常见问题)。

## 进阶用法

### 手动触发升级

进入 U-Boot 命令行（上电后立即长按空格），按需执行：

```text
u_disk_upgrade           # 自动选择起始位置为稀疏镜像的 U 盘
u_disk_upgrade force     # 跳过冷启动判断，立即升级
```

手动触发时，命令返回即表示升级完成，需要手动重启让系统从 UFS 启动。

## 常见问题

### 插入 U 盘上电后，串口没有任何升级日志

**原因**：串口没有正确连接，或开发板没有真正断电上电。

**解决**：确认串口线接在调试串口上、参数为 921600 8N1；确认 U 盘插在 USB 3.0 Type-A 接口（J7/J8/J9）；给开发板断电后重新上电。

### 串口提示 reset reason is not POR, skip upgrade from u disk

**原因**：本次是软重启或复位，不是断电上电。升级完成后的自动重启也会出现该提示，属于正常现象，避免成功后再次烧录。

**解决**：给开发板断电后重新上电，或进入 U-Boot 命令行手动执行 `u_disk_upgrade force`。

### 串口只打印 try upgrade from USB disk，没有识别到 U 盘

**原因**：U 盘未插好、插在 Device 模式的 Type-C 接口，或 U 盘不是 USB 3.0 规格。

**解决**：把 U 盘插到 USB 3.0 Type-A 接口（J7/J8/J9）并确认插紧，断电后重新上电；仍无法识别时更换 U 盘或接口重试。

### 升级耗时比预期长

**原因**：U 盘读速度或 UFS 写速度偏低。参考值：U 盘读速度约 113MB/s、UFS 写速度约 30MB/s。

**解决**：使用 USB 3.0 及以上的 U 盘，并确认 U 盘已按 [步骤 1](#步骤-1制作升级-u-盘) 写入整盘设备而不是带文件系统。

### 升级过程中可以拔出 U 盘吗

读 U 盘期间严禁拔出 U 盘。只有串口出现 `Writing sparse image ... to scsi`（开始写入 UFS）之后，才可以拔出 U 盘。

### U 盘升级会影响正常启动时间吗

会。无论是否插入 U 盘，每次冷启动时 U-Boot 都会花约 4 秒检测 U 盘；未插入 U 盘时，检测完成后立即继续正常启动。

### 升级失败后会怎样

- 读 U 盘出错（未插 U 盘或镜像格式不正确）：继续正常启动流程，从 UFS 启动内核。
- 写 UFS 出错（UFS 硬件异常等）：停止启动，停在 U-Boot 命令行。

### 升级完成后是否需要立即拔出 U 盘

不需要。U-Boot 已清除升级标志，插着 U 盘再次冷启动不会重复烧录。建议升级完成后拔出 U 盘，避免下次升级时误用旧镜像。

### 升级过程中的 LED 状态

- 开机后默认熄灭。
- 烧录期间 Flash 指示灯（[D61](../../01_hardware_introduction/02_rdk_s600/01_rdk_s600.md#指示灯d59d60d61)）常亮，烧录完成后熄灭。
- 烧录成功时系统自动重启，进入 Linux 后指示灯闪烁。
- 烧录失败时停在 U-Boot 命令行，指示灯保持熄灭。
