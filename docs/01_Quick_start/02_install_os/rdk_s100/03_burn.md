---
sidebar_position: 3
---

# 烧录步骤

本页介绍 RDK S100 的系统烧录。烧录前先完成 [烧录准备](./02_preparation.md)。

## 下载模式

RDK S100 通过 XBurn 烧录系统镜像前，先按设备状态选择下载模式，再进入对应模式执行烧录。

| 下载模式 | 适用场景 | 前置要求 |
| --- | -------- | -------- |
| DFU+Fastboot | 空板或系统损坏导致设备变砖 | 需拨码使设备进入 DFU 引导模式 |
| Fastboot | 非空板状态更新系统 | 要求非空板且系统能进入 U-Boot |

:::warning 前置确认
  目前需要将 [SW3 开关](/rdk_s_doc/01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100#系统启动盘选择-sw3) 拨至从板载 eMMC 启动，暂不支持从 M.2 NVMe 固态硬盘启动。
:::

### 进入 DFU+Fastboot 模式

1. 将 [SW1](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#开关-sw1sw2) 拨码至 ↑，关闭电源。
2. 将 [SW2](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#开关-sw1sw2) 拨码至 ↑，进入 Download 模式。
3. 将 SW1 拨码至 ▽，开启电源。
4. 检查 [DOWNLOAD 指示灯](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#download红色)：灯亮表示已进入 DFU 模式；若不亮，按下 [K1](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#按键-k1k2) 复位系统后重试。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/board_dfu1.png" alt="进入 DFU 模式" style={{ width: '100%' }} />

### 进入 Fastboot 模式

1. 将 [SW1](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#开关-sw1sw2) 拨码至 ↑，关闭电源。
2. 将 [SW2](../../01_hardware_introduction/01_rdk_s100/01_rdk_s100.md#开关-sw1sw2) 拨码至 ↓，进入正常启动模式。
3. 将 SW1 拨码至 ▽，开启电源。

- **自动进入**：板端系统启动完成后自动启动 ADB 服务，XBurn 检测到 ADB 设备后下发命令，让板端进入 Fastboot。
- **手动进入**：上电后立刻长按空格键进入 U-Boot 命令行，输入 `fastboot 0` 进入 Fastboot。

## 烧录全镜像

适用于首次刷机或系统恢复，烧录完整系统镜像包，覆盖板载 eMMC 与 NOR Flash 上的 `miniboot_flash`。

1. **产品类型** 选择 `RDK S100`。
2. **连接类型** 选择 `USB`，**下载模式** 选择（`DFU+Fastboot` 或 `Fastboot`）。
3. **存储介质** 选择 `eMMC`，**固件类型** 选择 `secure`。
4. 在 **镜像所在目录** 右侧，单击 **浏览**，选择固件所在的 product 文件夹。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/full-image-flash.jpg" alt="" style={{ width: '100%' }} />

5. （可选）需同时烧录多台设备时，见 XBurn 手册 [批量烧录](https://developer.d-robotics.cc/xburn_doc/basics/batch-burn)（软件上限 8 台、推荐 ≤4 台；设备越多失败概率越高，稳定性取决于线材、hub、供电等硬件环境，软件不保证）。批量时建议关闭下方 **烧录完成自动重启**，避免单台完成重启影响其他设备。

6. （可选）展开 **高级配置**，勾选 **烧录完成自动重启**，烧录完成后设备自动重启，省去手动断电、退出下载模式、重新上电。详见 XBurn 手册 [烧录完成自动重启与启动检查](https://developer.d-robotics.cc/xburn_doc/basics/auto-reboot)。

7. 单击 **开始升级**，设备上电并开始烧录，等待进度完成。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/install_os/image-S600-xburn-burn_progress.png" alt="" style={{ width: '100%' }} />

8. 升级完成后，退出对应模式（DFU 模式需将烧录开关向下拨动退出），关闭电源。

9. 启动验证。先保持设备断电，通过 HDMI 线缆连接设备与显示器，再给设备上电。系统首次启动会进行默认环境配置，持续 45 秒左右，结束后在显示器输出 Ubuntu 系统桌面。

   :::tip 设备指示灯说明
   - **<font color='Green'>绿色</font>** 指示灯：点亮代表硬件上电正常
   :::

   如果设备上电后长时间没有显示输出（2 分钟以上），说明启动异常，需要通过串口线调试。启动异常排查见 XBurn 手册 [启动异常](https://developer.d-robotics.cc/xburn_doc/troubleshooting/boot-issues)。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-boot.png" alt="S100 系统启动桌面" style={{ width: '100%' }} />

## 进阶用法

适用于非首次烧录的特定场景。

### 烧录指定区域{#烧录指定区域}

按指定区域烧录，只烧录部分镜像，而非完整的全镜像包。**存储介质** 选 `eMMC`，支持的区域如下：

| 区域 | 实际存储介质 | 固件内容 | 镜像 |
| --- | --- | -------- | ---- |
| miniboot_flash | NOR Flash | NOR Flash 上的基础启动镜像，包括 HSM/MCU0 等系统组件的镜像 | img_packages/disk/miniboot_flash.img |
| miniboot_emmc | eMMC | eMMC 上的基础启动镜像，包括 BL31/U-Boot 等系统组件的镜像 | img_packages/disk/miniboot_emmc.img |
| emmc | eMMC | eMMC 完整镜像，已包含 miniboot_emmc | img_packages/disk/emmc_disk.simg |

在 [烧录全镜像](#烧录全镜像) 步骤基础上，展开 **高级配置**，勾选 **烧录指定区域**，勾选目标区域（如 `miniboot_flash` 和 `miniboot_emmc`），完成烧录并启动验证。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/specify-region-flash.jpg" alt="" style={{ width: '100%' }} />

### 备份指定区域

备份指定区域的镜像到 PC。**存储介质** 选 `eMMC`，支持的备份区域如下：

| 区域 | 实际存储介质 | 固件内容 | 备份镜像 |
| --- | --- | -------- | ------------ |
| miniboot_flash | NOR Flash | NOR Flash 完整镜像 | img_packages/disk/miniboot_flash_backup.img |
| emmc | eMMC | eMMC 完整镜像 | img_packages/disk/emmc_disk_backup.img |

在 [烧录全镜像](#烧录全镜像) 步骤基础上，展开 **高级配置**，勾选 **备份指定区域**，勾选目标区域（如 `miniboot_flash`）。完成烧录后，打开 `img_packages/disk/`，查看备份镜像文件 `miniboot_flash_backup.img`。

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/specify-region-backup.jpg" alt="" style={{ width: '100%' }} />

:::warning 注意
- 数据备份，耗时较长，请耐心等待。
- 备份镜像再用于烧录时，将文件名中的 `_backup` 去掉，改成与烧录指定区域相同的文件名（如 `emmc_disk_backup.img` → `emmc_disk.simg`）。
:::

### 烧录指定分区镜像

按**单个系统组件分区**烧录，粒度比 [烧录指定区域](#烧录指定区域) 更细，是分区级（单个组件分区，如 `uboot`、`boot`、`system`）。

在 [烧录全镜像](#烧录全镜像) 步骤基础上， 展开 **高级配置**，勾选 **烧录指定分区镜像**，勾选目标分区，完成烧录并启动验证。


   勾选后出现的分区选项如下：

   <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/xburn/s100-specify-partition-flash.jpg" alt="" style={{ width: '100%' }} />