---
sidebar_position: 19
---

# UFS驱动调试指南

S100芯片内置UFS Host控制器，硬件最高支持UFS3.1协议，软件接口最高支持3.0，支持HS-G4速率模式，支持2路数据通道。本文档介绍UFS驱动的开发、配置和调试方法。

## UFS硬件架构

### S100 UFS控制器特性

S100芯片内置UFS Host控制器，支持以下特性：

| 特性 | 说明 |
|------|------|
| UFS协议版本 | 支持UFS 2.0 / 2.1 / 3.0 / 3.1 |
| UniPro版本 | 支持UniPro 1.61 / 1.8 |
| M-PHY版本 | 支持M-PHY 3.0 |
| 速率模式 | HS-G4（11.6Gbps/通道） |
| 数据通道 | 2路数据通道 |
| 功能支持 | 数据高速读写、安全存储 |

### 硬件模块组成

UFS子系统由以下几个部分组成：

1. **UFS Host Controller (UFSHC)** - 主机控制器
   - 支持UFS 3.0协议
   - 支持HS-G4速率（11.6Gbps/通道）
   - 支持2路数据通道
   - 内置SCSI命令队列管理

2. **MPHY** - 物理层接口
   - 支持Rate A和Rate B两种速率模式
   - 支持发射端均衡器（Tx Equalization）配置
   - 支持自动校准功能

3. **系统寄存器控制**
   - 时钟门控控制
   - 复位控制
   - AXI缓存配置

### 软件架构

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层                                    │
├─────────────────────────────────────────────────────────────┤
│                    文件系统层                                │
├─────────────────────────────────────────────────────────────┤
│                    块设备层                                  │
├─────────────────────────────────────────────────────────────┤
│                    SCSI子系统                                │
├─────────────────────────────────────────────────────────────┤
│                    UFS核心层 (ufshcd)                        │
│  ┌───────────┬───────────┬───────────┬──────────────────┐   │
│  │  UTP传输层 │  UIC控制层 │  DME管理层 │  电源管理层      │   │
│  └───────────┴───────────┴───────────┴──────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Host Controller层                         │
│              ┌──────────────────────────────┐               │
│              │     Hobot UFS HSI层          │               │
│              │  (ufs-hobot.c/ufs-hobot-hsi.c)│               │
│              └──────────────────────────────┘               │
├─────────────────────────────────────────────────────────────┤
│                    MPHY物理层                                │
└─────────────────────────────────────────────────────────────┘
```

## 代码路径

```shell
# Hobot UFS驱动文件
hobot-drivers/ufs/ufs-hobot.c          # 主驱动文件
hobot-drivers/ufs/ufs-hobot.h          # 头文件
hobot-drivers/ufs/ufs-hobot-hsi.c      # HSI层实现
hobot-drivers/ufs/ufs-hobot-hsi.h      # HSI层头文件
hobot-drivers/ufs/Kconfig              # 内核配置选项
hobot-drivers/ufs/Makefile             # 编译配置

# Linux内核UFS核心代码
drivers/ufs/core/ufshcd.c              # UFS核心层
drivers/ufs/core/ufshcd.h              # UFS核心头文件
drivers/ufs/host/ufshcd-pltfrm.c       # 平台驱动层

# 设备树配置
kernel-dts/drobot-s100-soc.dtsi        # S100 SoC配置
```

## 内核配置

### 配置选项说明

编辑内核配置文件 `hobot-drivers/configs/drobot_s100_defconfig`：

```
# UFS核心支持
CONFIG_SCSI_UFSHCD=y                   # 使能UFS Host Controller驱动
CONFIG_SCSI_UFSHCD_PLATFORM=y          # 平台驱动支持

# Hobot UFS驱动
CONFIG_SCSI_UFS_HOBOT=y                # Hobot UFS Host控制器驱动
CONFIG_SCSI_UFS_HOBOT_OCS_POLL=n       # OCS轮询模式（调试用）

# SCSI和块设备支持
CONFIG_SCSI=y                          # SCSI子系统
CONFIG_BLK_DEV_SD=y                    # SCSI磁盘支持

# 电源管理
CONFIG_PM=y                            # 电源管理支持
CONFIG_PM_RUNTIME=y                    # 运行时电源管理
```

### 使用mk_kernel配置

```shell
# 打开menuconfig配置界面
./mk_kernel.sh menuconfig

# 搜索UFS相关配置
# 在menuconfig界面中输入 / 进行搜索，输入 "UFS"
```

## U-Boot下使用UFS

U-Boot下UFS运行在HS-GEAR4模式，支持在U-Boot console下使用标准SCSI命令访问UFS设备。

### 常用SCSI命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `scsi info` | 查看所有可用的UFS设备信息 | `scsi info` |
| `scsi device [dev]` | 切换选中的UFS设备 | `scsi device 0` |
| `scsi part [dev]` | 查看UFS设备分区信息 | `scsi part 0` |
| `scsi read addr blk# cnt` | 从UFS读取数据到内存 | `scsi read 0x80000000 0x1000 0x100` |
| `scsi write addr blk# cnt` | 将内存数据写入UFS | `scsi write 0x80000000 0x1000 0x100` |

### U-Boot下ext4文件系统操作

```shell
# 查看ext4分区内容
ext4ls scsi 0:17

# 从ext4分区加载文件到内存
ext4load scsi 0:17 0x80000000 /boot/Image

# 将内存数据写入ext4分区
ext4write scsi 0:17 0x80000000 /newfile 0x10000
```

## DTS设备节点配置

### S100 SoC配置 (drobot-s100-soc.dtsi)

```dts
ufs: ufs@0x39410000 {
    power-domains = <&scmi_smc_pd PD_IDX_LSPERI_TOP>;
    status = "okay";
    compatible = "drobot,s100-ufshc";
    reg = <0 0x39410000 0 0x10000>,           /* UFS控制器寄存器 */
          <0x0 0x39010000 0x0 0x1000>,        /* UFS系统寄存器 */
          <0x0 0x39000000 0x0 0x1000>;        /* UFS时钟寄存器 */
    interrupt-parent = <&gic>;
    interrupts = <0 PERISYS_UFSHC_S_INTR PERISYS_UFSHC_S_INTR_TRIG_TYPE>;
    ref-clk-freq = <26000000>;                 /* 参考时钟频率26MHz */
    lanes-per-direction = <2>;                 /* 2路数据通道 */
    pinctrl-names = "default";
    pinctrl-0 = <&peri_ufs>;                   /* 引脚配置 */

    /* 从eFuse获取MPHY校准值 */
    ufstrim_flag_reg_pa = <0xCDF704C>;         /* 校准标志寄存器地址 */
    ufstrim_reg_pa = <0xCDF7014>;              /* 校准值寄存器地址 */

    /* 发射端均衡器配置 */
    tx_eq_main_pre_post = <35 0 0>;           /* main=35, pre=0, post=0 */
};
```

### DTS参数说明

| 参数 | 说明 | 示例值 |
|------|------|--------|
| `compatible` | 驱动匹配字符串 | "drobot,s100-ufshc" |
| `reg` | 寄存器地址范围 | 控制器/系统/时钟寄存器 |
| `interrupts` | 中断配置 | GIC SPI中断 |
| `ref-clk-freq` | 参考时钟频率 | 26000000 (26MHz) |
| `lanes-per-direction` | 每方向数据通道数 | 2 |
| `ufstrim_flag_reg_pa` | 校准标志寄存器物理地址 | 0xCDF704C |
| `ufstrim_reg_pa` | 校准值寄存器物理地址 | 0xCDF7014 |
| `tx_eq_main_pre_post` | 发射均衡器参数 | \<main pre post\> |

## 调试方法

### 1. 检查UFS设备识别

```shell
# 查看UFS设备是否被正确识别
ls /dev/sda*
# 应显示 /dev/sda 和分区（如 /dev/sda1, /dev/sda2）

# 查看块设备信息
lsblk
# 显示UFS磁盘及其分区

# 查看SCSI设备
cat /proc/scsi/scsi
# 应显示UFS设备信息
```

### 2. 查看UFS驱动加载状态

```shell
# 查看驱动是否加载
lsmod | grep ufs
# 应显示 ufs_hobot 模块

# 查看内核日志中的UFS相关信息
dmesg | grep -i ufs

# 查看UFS控制器状态
cat /sys/class/scsi_host/host*/proc_name
# 应显示 "ufshcd"
```

### 3. 文件系统操作

#### 格式化UFS分区

```shell
# 将UFS分区格式化为ext4格式（例如分区17）注意：会清空所有数据：
mkfs.ext4 /dev/sda17
```

#### 挂载UFS分区

```shell
# 挂载UFS分区到指定目录
mkdir -p /userdata
mount -t ext4 /dev/sda17 /userdata

# 查看挂载情况
mount | grep sda
```

#### 文件系统异常处理

当文件系统损坏导致无法挂载时，可通过以下方式处理：

```shell
# 使用fsck工具检测和修复ext4文件系统
fsck.ext4 -f /dev/sda17

# 当fsck无法修复时，可考虑格式化（注意：会清空所有数据）
mkfs.ext4 /dev/sda17
```

### 4. 使用ufs-utils工具

```shell
# 查看UFS设备属性
ufs-utils -p /dev/sda info

# 查看UFS健康状态
ufs-utils -p /dev/sda health

# 查看UFS配置描述符
ufs-utils -p /dev/sda desc
```

### 5. UFS可靠性评估（寿命分析）

由于各个厂商的UFS擦写均衡算法不同，UFS的寿命与具体型号相关，需要根据具体的UFS设备数据手册来判断寿命。

#### 查看UFS健康状态

Linux系统每次启动后会自动更新UFS设备下的健康状态节点：

```shell
# 查看UFS保留块状态
cat /sys/devices/platform/soc/*ufs/health_descriptor/eol_info
# 返回值：0x1表示保留块状态正常

# 查看UFS寿命估计值A
cat /sys/devices/platform/soc/*ufs/health_descriptor/life_time_estimation_a
# 返回值范围0x1-0xA表示寿命正常

# 查看UFS寿命估计值B
cat /sys/devices/platform/soc/*ufs/health_descriptor/life_time_estimation_b
# 返回值范围0x1-0xA表示寿命正常
```

#### 健康状态参数说明

| 节点 | 说明 | 正常范围 | 备注 |
|------|------|----------|------|
| `eol_info` | 保留块状态 | 0x01 | 0x01表示正常 |
| `life_time_estimation_a` | 寿命估计值A | 0x01-0x0A | 值越小寿命越充足 |
| `life_time_estimation_b` | 寿命估计值B | 0x01-0x0A | 值越小寿命越充足 |

具体数值含义请参考UFS设备数据手册中的Device Health Descriptor定义。

### 6. 内核调试日志

```shell
# 开启UFS调试日志
echo 'module ufs_hobot +p' > /sys/kernel/debug/dynamic_debug/control
echo 'module ufshcd +p' > /sys/kernel/debug/dynamic_debug/control

# 查看实时日志
dmesg -w | grep -i ufs

# 或者使用journalctl
journalctl -kf | grep -i ufs
```

### 7. 性能测试

**注意**：UFS性能测试应在已挂载的文件系统分区上进行，**禁止直接对块设备(/dev/sda)写入**，否则会导致文件系统损坏。

根据 `gpt_main_ufs.img` 中的GPT分区表，RDK S100的实际分区布局如下：

| 分区号 | 设备名 | 分区名 | 大小 | 文件系统 | 挂载点 | 用途 |
|--------|--------|--------|------|----------|--------|------|
| 17 | /dev/sda17 | userdata | 2GiB | ext4 | /userdata | 用户数据 |
| 18 | /dev/sda18 | system | 磁盘剩余空间 | ext4 | / | 根文件系统 |

**推荐测试分区**：
- **userdata分区** (`/dev/sda17` → `/userdata`)：首选，专为用户数据设计
- **system分区** (`/dev/sda18` → `/`)：备选，需注意系统文件保护

#### 准备测试环境

```shell
# 查看UFS分区挂载情况
lsblk
# 输出示例：
# NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
# sda       8:0    0  3.1G  0 disk
# ├─sda13   8:13   0   15M  0 part /boot
# ├─sda16   8:16   0  512M  0 part /var/log
# ├─sda17   8:17   0  256M  0 part /userdata
# └─sda18   8:18   0  1.3G  0 part /

# 检查userdata分区(/dev/sda17)是否挂载
mount | grep userdata
# 如未挂载，手动挂载：
# mkdir -p /userdata
# mount /dev/sda17 /userdata

# 确保测试目录存在且有写入权限
mkdir -p /userdata/ufs_test
chmod 777 /userdata/ufs_test
```

#### FIO性能测试（推荐在userdata分区）

```shell
# 进入userdata测试目录
cd /userdata/ufs_test

# 1. 顺序写测试 (4K块大小，测试小文件写入性能)
fio --name=seq_write_4k \
    --directory=/userdata/ufs_test \
    --filename=test_file \
    --rw=write \
    --bs=4k \
    --size=512M \
    --numjobs=1 \
    --ioengine=libaio \
    --direct=1 \
    --runtime=60 \
    --group_reporting

# 2. 顺序读测试 (4K块大小)
fio --name=seq_read_4k \
    --directory=/userdata/ufs_test \
    --filename=test_file \
    --rw=read \
    --bs=4k \
    --size=512M \
    --numjobs=1 \
    --ioengine=libaio \
    --direct=1 \
    --runtime=60 \
    --group_reporting

# 3. 随机写测试 (4K块大小，4并发，模拟多线程写入)
fio --name=rand_write_4k \
    --directory=/userdata/ufs_test \
    --filename=test_file \
    --rw=randwrite \
    --bs=4k \
    --size=512M \
    --numjobs=4 \
    --ioengine=libaio \
    --direct=1 \
    --runtime=60 \
    --group_reporting

# 4. 随机读测试 (4K块大小，4并发)
fio --name=rand_read_4k \
    --directory=/userdata/ufs_test \
    --filename=test_file \
    --rw=randread \
    --bs=4k \
    --size=512M \
    --numjobs=4 \
    --ioengine=libaio \
    --direct=1 \
    --runtime=60 \
    --group_reporting

# 5. 混合读写测试 (70%读，30%写，模拟真实应用场景)
fio --name=mix_rw \
    --directory=/userdata/ufs_test \
    --filename=test_file \
    --rw=randrw \
    --rwmixread=70 \
    --bs=4k \
    --size=512M \
    --numjobs=4 \
    --ioengine=libaio \
    --direct=1 \
    --runtime=60 \
    --group_reporting

# 6. 大文件顺序写测试 (1M块大小，测试峰值带宽)
# 注意：size不要超过分区可用空间
fio --name=seq_write_1m \
    --directory=/userdata/ufs_test \
    --filename=test_file_big \
    --rw=write \
    --bs=1m \
    --size=1G \
    --numjobs=1 \
    --ioengine=libaio \
    --direct=1 \
    --runtime=60 \
    --group_reporting

# 7. 大文件顺序读测试 (1M块大小)
fio --name=seq_read_1m \
    --directory=/userdata/ufs_test \
    --filename=test_file_big \
    --rw=read \
    --bs=1m \
    --size=1G \
    --numjobs=1 \
    --ioengine=libaio \
    --direct=1 \
    --runtime=60 \
    --group_reporting

# 清理测试文件
rm -f /userdata/ufs_test/test_file /userdata/ufs_test/test_file_big
```

#### 在system分区测试（备选方案）

如果userdata分区(/dev/sda17)不可用，可在system分区(/dev/sda18)的/tmp目录测试：

```shell
# 使用/tmp目录（位于system分区 /dev/sda18）
mkdir -p /tmp/ufs_test

# 运行fio测试（示例：4K随机写）
fio --name=rand_write_4k \
    --directory=/tmp/ufs_test \
    --filename=test_file \
    --rw=randwrite \
    --bs=4k \
    --size=128M \
    --numjobs=4 \
    --ioengine=libaio \
    --direct=1 \
    --runtime=60 \
    --group_reporting

# 清理
rm -rf /tmp/ufs_test
```

**注意**：system分区(/dev/sda18)是根文件系统(1.25GB)，测试时：
- 控制测试文件大小，避免填满根分区
- 优先使用/tmp目录，系统重启后自动清理
- 不要在系统关键目录（/bin, /sbin, /etc等）进行测试

#### FIO参数说明

| 参数 | 说明 | 常用值 |
|------|------|--------|
| `--name` | 测试任务名称 | 自定义 |
| `--directory` | 测试目录 | /userdata/ufs_test 或 /tmp/ufs_test |
| `--filename` | 测试文件名 | test_file |
| `--rw` | 读写模式 | read/write/randread/randwrite/randrw |
| `--bs` | 块大小 | 4k, 128k, 1m |
| `--size` | 测试文件大小 | 512M, 1G |
| `--numjobs` | 并发任务数 | 1, 4, 8 |
| `--ioengine` | IO引擎 | libaio, sync |
| `--direct=1` | 直接IO（绕过缓存） | 1 |
| `--runtime` | 测试运行时间(秒) | 60 |
| `--group_reporting` | 汇总报告 | 启用 |
| `--rwmixread` | 混合读写中读比例 | 70 (表示70%读,30%写) |

#### 结果解读

FIO输出关键指标：

- **BW (Bandwidth)**：带宽，单位KB/s或MB/s
- **IOPS**：每秒IO操作数
- **lat (latency)**：延迟，单位usec（微秒）或msec（毫秒）
- **clat (completion latency)**：完成延迟，最重要指标

示例输出：
```
seq_write_4k: (groupid=0, jobs=1): err= 0: pid=1234: Mon Jan  1 00:00:00 2024
  write: IOPS=50.5k, BW=197MiB/s (207MB/s)(11.5GiB/60001msec)
    slat (usec): min=3, max=100, avg= 5.23, stdev= 2.15
    clat (usec): min=50, max=5000, avg=180.50, stdev=85.20
     lat (usec): min=55, max=5010, avg=185.73, stdev=85.80
```

## 高级调试

### 开启详细调试信息

在驱动代码中定义调试宏：

```c
// 在ufs-hobot-hsi.h中添加
#define DEBUG

// 或者在内核配置中开启
CONFIG_DYNAMIC_DEBUG=y
```

## 适配新的UFS设备

当需要适配新型号的UFS设备时，请遵循以下要求：

### 硬件兼容性要求

| 项目 | 要求 |
|------|------|
| UFS协议版本 | 符合V2.1、V3.0或V3.1标准 |
| 电气特性 | 与S100 UFS控制器电平兼容 |
| 封装尺寸 | 符合PCB布局要求 |

### 软件适配步骤

1. **确认UFS设备符合标准协议**
   - 验证设备支持UFS 2.1/3.0/3.1标准
   - 确认UniPro和M-PHY版本兼容

2. **调整PHY参数**
   - 根据不同UFS设备的电气特性，可能需要调整MPHY参数
   - 在DTS中配置合适的`tx_eq_main_pre_post`参数
   - 必要时调整参考时钟频率`ref-clk-freq`

3. **验证信号完整性**
   - 使用示波器检查信号质量
   - 确保HS-G4模式下信号完整

4. **进行兼容性测试**
   - 执行读写压力测试
   - 验证电源管理功能
   - 检查热插拔保护（虽然UFS不支持热插拔）

## 参考文档

- UFS Specification Version 2.1/3.0/3.1
- JEDEC Standard JESD220C
- UniPro Specification Version 1.61/1.8
- M-PHY Specification Version 3.1/4.1
- Linux Kernel Documentation: drivers/scsi/ufs/README

## 注意事项

1. **电源管理**：UFS支持多种低功耗模式，确保电源域配置正确
2. **时钟配置**：UFS需要稳定的参考时钟，默认使用26MHz
3. **信号完整性**：高速模式下注意PCB走线设计和阻抗匹配
4. **温度影响**：MPHY校准值随温度变化，确保在有效温度范围内使用
5. **热插拔**：UFS不支持热插拔，启动前确保设备已正确连接
