# UFS Driver Debugging Guide

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_ufs

The S100 chip integrates a UFS Host controller, with hardware supporting up to the UFS3.1 protocol, software interface supporting up to 3.0, HS-G4 rate mode, and 2 data lanes. This document describes the development, configuration, and debugging methods for the UFS driver.

## UFS Hardware Architecture

### S100 UFS Controller Features

The S100 chip integrates a UFS Host controller that supports the following features:

| Feature | Description 
| UFS Protocol Version | Supports UFS 2.0 / 2.1 / 3.0 / 3.1 
| UniPro Version | Supports UniPro 1.61 / 1.8 
| M-PHY Version | Supports M-PHY 3.0 
| Rate Mode | HS-G4 (11.6Gbps/lane) 
| Data Lanes | 2 data lanes 
| Functional Support | High-speed read/write, secure storage 

### Hardware Module Composition

The UFS subsystem consists of the following parts:

1. **UFS Host Controller (UFSHC)** - Host Controller

- Supports UFS 3.0 protocol
- Supports HS-G4 rate (11.6Gbps/lane)
- Supports 2 data lanes
- Built-in SCSI command queue management
2. Supports UFS 3.0 protocol
3. Supports HS-G4 rate (11.6Gbps/lane)
4. Supports 2 data lanes
5. Built-in SCSI command queue management
6. **MPHY** - Physical Layer Interface

- Supports Rate A and Rate B modes
- Supports Tx Equalization configuration
- Supports auto-calibration
7. Supports Rate A and Rate B modes
8. Supports Tx Equalization configuration
9. Supports auto-calibration
10. **System Register Control**

- Clock gating control
- Reset control
- AXI cache configuration
11. Clock gating control
12. Reset control
13. AXI cache configuration

### Software Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
├─────────────────────────────────────────────────────────────┤
│                    File System Layer                         │
├─────────────────────────────────────────────────────────────┤
│                    Block Device Layer                        │
├─────────────────────────────────────────────────────────────┤
│                    SCSI Subsystem                            │
├─────────────────────────────────────────────────────────────┤
│                    UFS Core Layer (ufshcd)                   │
│  ┌───────────┬───────────┬───────────┬──────────────────┐   │
│  │ UTP Transport │ UIC Control │ DME Management │ Power Management │   │
│  └───────────┴───────────┴───────────┴──────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Host Controller Layer                     │
│              ┌──────────────────────────────┐               │
│              │     Hobot UFS HSI Layer      │               │
│              │ (ufs-hobot.c/ufs-hobot-hsi.c)│               │
│              └──────────────────────────────┘               │
├─────────────────────────────────────────────────────────────┤
│                    MPHY Physical Layer                       │
└─────────────────────────────────────────────────────────────┘
```

## Code Paths

```shell
# Hobot UFS driver files
hobot-drivers/ufs/ufs-hobot.c          # Main driver file
hobot-drivers/ufs/ufs-hobot.h          # Header file
hobot-drivers/ufs/ufs-hobot-hsi.c      # HSI layer implementation
hobot-drivers/ufs/ufs-hobot-hsi.h      # HSI layer header
hobot-drivers/ufs/Kconfig              # Kernel config options
hobot-drivers/ufs/Makefile             # Build configuration

# Linux kernel UFS core code
drivers/ufs/core/ufshcd.c              # UFS core layer
drivers/ufs/core/ufshcd.h              # UFS core header
drivers/ufs/host/ufshcd-pltfrm.c       # Platform driver layer

# Device tree configuration
kernel-dts/drobot-s100-soc.dtsi        # S100 SoC configuration
```

## Kernel Configuration

### Configuration Options

Edit the kernel configuration file `hobot-drivers/configs/drobot_s100_defconfig` :

```text
# UFS core support
CONFIG_SCSI_UFSHCD=y                   # Enable UFS Host Controller driver
CONFIG_SCSI_UFSHCD_PLATFORM=y          # Platform driver support

# Hobot UFS driver
CONFIG_SCSI_UFS_HOBOT=y                # Hobot UFS Host controller driver
CONFIG_SCSI_UFS_HOBOT_OCS_POLL=n       # OCS polling mode (for debugging)

# SCSI and block device support
CONFIG_SCSI=y                          # SCSI subsystem
CONFIG_BLK_DEV_SD=y                    # SCSI disk support

# Power management
CONFIG_PM=y                            # Power management support
CONFIG_PM_RUNTIME=y                    # Runtime power management
```

### Using mk_kernel for Configuration

```shell
# Open menuconfig interface
./mk_kernel.sh menuconfig

# Search for UFS-related configurations
# In the menuconfig interface, press / to search and enter "UFS"
```

## Using UFS in U-Boot

UFS runs in HS-GEAR4 mode under U-Boot, supporting standard SCSI commands to access UFS devices via the U-Boot console.

### Common SCSI Commands

| Command | Description | Example 
| `scsi info` | View all available UFS device information | `scsi info` 
| `scsi device [dev]` | Switch the selected UFS device | `scsi device 0` 
| `scsi part [dev]` | View partition information of UFS device | `scsi part 0` 
| `scsi read addr blk# cnt` | Read data from UFS to memory | `scsi read 0x80000000 0x1000 0x100` 
| `scsi write addr blk# cnt` | Write memory data to UFS | `scsi write 0x80000000 0x1000 0x100` 

### ext4 File System Operations in U-Boot

```shell
# View ext4 partition contents
ext4ls scsi 0:17

# Load file from ext4 partition to memory
ext4load scsi 0:17 0x80000000 /boot/Image

# Write memory data to ext4 partition
ext4write scsi 0:17 0x80000000 /newfile 0x10000
```

## DTS Device Node Configuration

### S100 SoC Configuration (drobot-s100-soc.dtsi)

```dts
ufs: ufs@0x39410000 {
    power-domains = <&scmi_smc_pd PD_IDX_LSPERI_TOP>;
    status = "okay";
    compatible = "drobot,s100-ufshc";
    reg = <0 0x39410000 0 0x10000>,           /* UFS controller registers */
          <0x0 0x39010000 0x0 0x1000>,        /* UFS system registers */
          <0x0 0x39000000 0x0 0x1000>;        /* UFS clock registers */
    interrupt-parent = <&gic>;
    interrupts = <0 PERISYS_UFSHC_S_INTR PERISYS_UFSHC_S_INTR_TRIG_TYPE>;
    ref-clk-freq = <26000000>;                 /* Reference clock frequency 26MHz */
    lanes-per-direction = <2>;                 /* 2 data lanes */
    pinctrl-names = "default";
    pinctrl-0 = <&peri_ufs>;                   /* Pin configuration */

    /* Get MPHY calibration values from eFuse */
    ufstrim_flag_reg_pa = <0xCDF704C>;         /* Calibration flag register address */
    ufstrim_reg_pa = <0xCDF7014>;              /* Calibration value register address */

    /* Transmitter equalizer configuration */
    tx_eq_main_pre_post = <35 0 0>;           /* main=35, pre=0, post=0 */
};
```

### DTS Parameter Description

| Parameter | Description | Example Value 
| `compatible` | Driver match string | "drobot,s100-ufshc" 
| `reg` | Register address range | Controller/System/Clock registers 
| `interrupts` | Interrupt configuration | GIC SPI interrupt 
| `ref-clk-freq` | Reference clock frequency | 26000000 (26MHz) 
| `lanes-per-direction` | Number of data lanes per direction | 2 
| `ufstrim_flag_reg_pa` | Calibration flag register physical address | 0xCDF704C 
| `ufstrim_reg_pa` | Calibration value register physical address | 0xCDF7014 
| `tx_eq_main_pre_post` | Transmitter equalizer parameters | <main pre post> 

## Debugging Methods

### 1. Check UFS Device Recognition

```shell
# Check if UFS device is correctly recognized
ls /dev/sda*
# Should display /dev/sda and partitions (e.g., /dev/sda1, /dev/sda2)

# View block device information
lsblk
# Should show UFS disk and its partitions

# View SCSI devices
cat /proc/scsi/scsi
# Should display UFS device information
```

### 2. Check UFS Driver Loading Status

```shell
# Check if driver is loaded
lsmod | grep ufs
# Should display ufs_hobot module

# View UFS-related information in kernel logs
dmesg | grep -i ufs

# Check UFS controller status
cat /sys/class/scsi_host/host*/proc_name
# Should display "ufshcd"
```

### 3. File System Operations

#### Formatting UFS Partition

```shell
# Format UFS partition as ext4 (e.g., partition 17) Note: This will erase all data:
mkfs.ext4 /dev/sda17
```

#### Mounting UFS Partition

```shell
# Mount UFS partition to specified directory
mkdir -p /userdata
mount -t ext4 /dev/sda17 /userdata

# Check mount status
mount | grep sda
```

#### File System Exception Handling

When the file system is corrupted and cannot be mounted, handle it as follows:

```shell
# Use fsck tool to check and repair ext4 file system
fsck.ext4 -f /dev/sda17

# If fsck cannot repair, consider formatting (Note: This will erase all data)
mkfs.ext4 /dev/sda17
```

### 4. Using ufs-utils Tool

```shell
# View UFS device attributes
ufs-utils -p /dev/sda info

# View UFS health status
ufs-utils -p /dev/sda health

# View UFS configuration descriptor
ufs-utils -p /dev/sda desc
```

### 5. UFS Reliability Assessment (Lifetime Analysis)

Since UFS wear leveling algorithms vary by manufacturer, UFS lifetime is model-dependent and should be determined based on the specific UFS device datasheet.

#### Checking UFS Health Status

The Linux system automatically updates the health status nodes under the UFS device after each boot:

```shell
# Check UFS reserved block status
cat /sys/devices/platform/soc/*ufs/health_descriptor/eol_info
# Return value: 0x1 indicates reserved block status is normal

# Check UFS lifetime estimation A
cat /sys/devices/platform/soc/*ufs/health_descriptor/life_time_estimation_a
# Return value range 0x1-0xA indicates normal lifetime

# Check UFS lifetime estimation B
cat /sys/devices/platform/soc/*ufs/health_descriptor/life_time_estimation_b
# Return value range 0x1-0xA indicates normal lifetime
```

#### Health Status Parameter Description

| Node | Description | Normal Range | Notes 
| `eol_info` | Reserved block status | 0x01 | 0x01 indicates normal 
| `life_time_estimation_a` | Lifetime estimation A | 0x01~0x0A | Smaller values indicate more remaining life 
| `life_time_estimation_b` | Lifetime estimation B | 0x01~0x0A | Smaller values indicate more remaining life 

For specific value meanings, refer to the Device Health Descriptor definition in the UFS device datasheet.

### 6. Kernel Debug Logging

```shell
# Enable UFS debug logging
echo 'module ufs_hobot +p' > /sys/kernel/debug/dynamic_debug/control
echo 'module ufshcd +p' > /sys/kernel/debug/dynamic_debug/control

# View real-time logs
dmesg -w | grep -i ufs

# Or use journalctl
journalctl -kf | grep -i ufs
```

### 7. Performance Testing

**Note** : UFS performance testing should be performed on a mounted file system partition. **Direct writing to the block device (/dev/sda) is prohibited** as it will corrupt the file system.

According to the GPT partition table in `gpt_main_ufs.img` , the actual partition layout of RDK S100 is as follows:

| Partition Number | Device Name | Partition Name | Size | File System | Mount Point | Purpose 
| 17 | /dev/sda17 | userdata | 2GiB | ext4 | /userdata | User data 
| 18 | /dev/sda18 | system | Remaining disk space | ext4 | / | Root file system 

**Recommended Test Partitions** :

- **userdata partition** ( `/dev/sda17` → `/userdata` ): Preferred, designed for user data
- **system partition** ( `/dev/sda18` → `/` ): Alternative, be careful with system file protection

#### Preparing the Test Environment

```shell
# Check UFS partition mount status
lsblk
# Example output:
# NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
# sda       8:0    0  3.1G  0 disk
# ├─sda13   8:13   0   15M  0 part /boot
# ├─sda16   8:16   0  512M  0 part /var/log
# ├─sda17   8:17   0  256M  0 part /userdata
# └─sda18   8:18   0  1.3G  0 part /

# Check if userdata partition (/dev/sda17) is mounted
mount | grep userdata
# If not mounted, manually mount:
# mkdir -p /userdata
# mount /dev/sda17 /userdata

# Ensure the test directory exists and has write permissions
mkdir -p /userdata/ufs_test
chmod 777 /userdata/ufs_test
```

#### FIO Performance Testing (Recommended on userdata partition)

```shell
# Navigate to userdata test directory
cd /userdata/ufs_test

# 1. Sequential write test (4K block size, tests small file write performance)
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

# 2. Sequential read test (4K block size)
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

# 3. Random write test (4K block size, 4 jobs, simulates multi-threaded writing)
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

# 4. Random read test (4K block size, 4 jobs)
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

# 5. Mixed read/write test (70% read, 30% write, simulates real application scenarios)
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

# 6. Large file sequential write test (1M block size, tests peak bandwidth)
# Note: size should not exceed available partition space
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

# 7. Large file sequential read test (1M block size)
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

# Clean up test files
rm -f /userdata/ufs_test/test_file /userdata/ufs_test/test_file_big
```

#### Testing on system Partition (Alternative)

If the userdata partition (/dev/sda17) is unavailable, test in the /tmp directory of the system partition (/dev/sda18):

```shell
# Use /tmp directory (located on system partition /dev/sda18)
mkdir -p /tmp/ufs_test

# Run fio test (example: 4K random write)
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

# Clean up
rm -rf /tmp/ufs_test
```

**Note** : The system partition (/dev/sda18) is the root file system (1.25GB). When testing:

- Control the test file size to avoid filling the root partition
- Prefer using the /tmp directory, which is automatically cleaned up after system reboot
- Do not test in system-critical directories (/bin, /sbin, /etc, etc.)

#### FIO Parameter Description

| Parameter | Description | Common Values 
| `--name` | Test job name | User-defined 
| `--directory` | Test directory | /userdata/ufs_test or /tmp/ufs_test 
| `--filename` | Test file name | test_file 
| `--rw` | Read/write mode | read/write/randread/randwrite/randrw 
| `--bs` | Block size | 4k, 128k, 1m 
| `--size` | Test file size | 512M, 1G 
| `--numjobs` | Number of concurrent jobs | 1, 4, 8 
| `--ioengine` | IO engine | libaio, sync 
| `--direct=1` | Direct IO (bypass cache) | 1 
| `--runtime` | Test runtime (seconds) | 60 
| `--group_reporting` | Aggregate report | Enable 
| `--rwmixread` | Read percentage in mixed read/write | 70 (means 70% read, 30% write) 

#### Result Interpretation

Key FIO output metrics:

- **BW (Bandwidth)** : Bandwidth, in KB/s or MB/s
- **IOPS** : I/O operations per second
- **lat (latency)** : Latency, in usec (microseconds) or msec (milliseconds)
- **clat (completion latency)** : Completion latency, the most important metric
Example output:

```text
seq_write_4k: (groupid=0, jobs=1): err= 0: pid=1234: Mon Jan  1 00:00:00 2024
  write: IOPS=50.5k, BW=197MiB/s (207MB/s)(11.5GiB/60001msec)
    slat (usec): min=3, max=100, avg= 5.23, stdev= 2.15
    clat (usec): min=50, max=5000, avg=180.50, stdev=85.20
     lat (usec): min=55, max=5010, avg=185.73, stdev=85.80
```

## Advanced Debugging

### Enabling Detailed Debug Information

Define debug macros in the driver code:

```c
// Add to ufs-hobot-hsi.h
#define DEBUG

// Or enable in kernel configuration
CONFIG_DYNAMIC_DEBUG=y
```

## Adapting New UFS Devices

When adapting new UFS device models, follow these requirements:

### Hardware Compatibility Requirements

| Item | Requirement 
| UFS Protocol Version | Compliant with V2.1, V3.0, or V3.1 standards 
| Electrical Characteristics | Level compatible with S100 UFS controller 
| Package Dimensions | Meet PCB layout requirements 

### Software Adaptation Steps

1. **Verify UFS device complies with standard protocols**

- Verify device supports UFS 2.1/3.0/3.1 standards
- Confirm UniPro and M-PHY version compatibility
2. Verify device supports UFS 2.1/3.0/3.1 standards
3. Confirm UniPro and M-PHY version compatibility
4. **Adjust PHY parameters**

- MPHY parameters may need adjustment based on different UFS device electrical characteristics
- Configure appropriate `tx_eq_main_pre_post` parameters in DTS
- Adjust reference clock frequency `ref-clk-freq` if necessary
5. MPHY parameters may need adjustment based on different UFS device electrical characteristics
6. Configure appropriate `tx_eq_main_pre_post` parameters in DTS
7. Adjust reference clock frequency `ref-clk-freq` if necessary
8. **Verify signal integrity**

- Check signal quality using an oscilloscope
- Ensure signal integrity in HS-G4 mode
9. Check signal quality using an oscilloscope
10. Ensure signal integrity in HS-G4 mode
11. **Perform compatibility testing**

- Execute read/write stress tests
- Verify power management functionality
- Check hot-swap protection (though UFS does not support hot-swap)
12. Execute read/write stress tests
13. Verify power management functionality
14. Check hot-swap protection (though UFS does not support hot-swap)

## Reference Documents

- UFS Specification Version 2.1/3.0/3.1
- JEDEC Standard JESD220C
- UniPro Specification Version 1.61/1.8
- M-PHY Specification Version 3.1/4.1
- Linux Kernel Documentation: drivers/scsi/ufs/README

## Important Notes

1. **Power Management** : UFS supports multiple low-power modes; ensure power domain configuration is correct
2. **Clock Configuration** : UFS requires a stable reference clock; 26MHz is used by default
3. **Signal Integrity** : Pay attention to PCB trace design and impedance matching in high-speed mode
4. **Temperature Effects** : MPHY calibration values vary with temperature; ensure operation within valid temperature range
5. **Hot-Swap** : UFS does not support hot-swap; ensure the device is properly connected before power-on
