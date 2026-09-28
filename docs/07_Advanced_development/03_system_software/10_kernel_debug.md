---
sidebar_position: 10
title: "Linux 调试功能介绍"
description: "内核 panic 后的 ramdump 抓取与 crash 离线分析方法"
---

# Linux 调试功能介绍

## 概述

ramdump 是一种将内核 panic 瞬间完整内存镜像保存下来用于离线分析的手段，配合 crash 工具可以查看 panic 时的堆栈、寄存器、dmesg 与内核数据结构，适合定位仅靠日志无法复现的踩内存、偶发死机等问题。

- **定位**：说明内核 panic 后如何开启并抓取 ramdump，以及如何在 x86_64 主机上用 crash 对 dump 做离线分析。
- **适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要分析内核死机、panic 的驱动或内核工程师。
- **前置条件**：已烧录 RDK OS 并可进入 U-Boot 控制台；准备一台 x86_64 服务器用于编译与运行 crash 工具。
- **与其他模块关系**：本功能用于内核死机排查，与《[应用实时内核](/Advanced_development/system_software/realtime_kernel)》《[内核头文件](/Advanced_development/system_software/kernel_headers)》同属内核层开发配套；MCU 侧的异常现场抓取见《[MCU ramdump 功能](/Advanced_development/mcu_development/mcu_ramdump)》。

**范围说明**：本页覆盖内核 panic 后的 ramdump 抓取与 crash 离线分析，不涉及 ftrace、kgdb、kdump、pstore 等其他内核调试手段。

## 机制原理

| 阶段 | 工具/产物 | 说明 |
|------|----------|------|
| 开启抓取 | `hrut_ddr_misc` / `enable_ramdump` | 打开 RAMDUMP 能力 |
| 保存镜像 | `memdump`（U-Boot） | 导出 `DDRCSx.bin` 与 `cpu-contexts.bin` 到指定分区 |
| 离线分析 | `crash` + `vmlinux` | 在 x86_64 平台查看堆栈、寄存器、日志 |

## crash 分析 ramdump

### 抓取 ramdump

当前 ramdump 功能默认为关闭状态，在 Linux 下可以通过工具 `hrut_ddr_misc` 手动开启：

```console
root@ubuntu:/userdata# hrut_ddr_misc s bit 0 1
update misc para begin
------------------------------------
print new misc para:
Bit idx  Function name   Status
0        RAMDUMP         on
------------------------------------
```

查看当前 ramdump 功能是否开启：

```console
root@ubuntu:/userdata# hrut_ddr_misc g
Bit idx  Function name   Status
0        RAMDUMP         on
```

抓取 ramdump 完成后，可关闭 DDR ramdump 功能：

```console
root@ubuntu:~# hrut_ddr_misc s bit 0 0
update misc para begin
------------------------------------
print new misc para:
Bit idx  Function name   Status
0        RAMDUMP         off
------------------------------------
```

:::warning
- 当前 ramdump 功能只支持抓取由 **Kernel panic** 触发的场景。
- ramdump 可能损坏保存 dump 文件的分区，请务必将 dump 文件保存到**非根文件系统分区**，且分区容量大于 DDR 容量。
- 建议创建一个专门用于 ramdump 的分区（例如命名为 `ramdump`），参见《[自定义分区说明](/Advanced_development/environment_build/rdk_gen#自定义分区说明)》。
:::

**抓取完成后：** dump 文件会一直保留在目标分区，占用空间与 DDR 容量相当，建议导出到服务器后及时清理；未关闭 RAMDUMP 开关时，每次 Kernel panic 都会重新抓取一遍，同名文件会被覆盖（`memdump` 输出中的 `file found, deleting` 即删除旧文件）。因此分析完成后建议用 `hrut_ddr_misc s bit 0 0` 关闭开关。

#### 自动抓取

- 在 U-Boot 下设置环境变量：

```bash
setenv enable_ramdump 1
setenv ramdump_part_name ramdump # 这里的 ramdump 表明要保存 dump 文件的实际分区，请根据实际板子分区替换
setenv ramdump_in map # 这里的 map 表明让 ramdump 将文件保存进 UFS 或者 eMMC（根据启动模式），请务必设置成 map
saveenv
```

- secure boot 设备自动抓取 ramdump 需要烧写 HB_APDP 分区镜像、开启 secure debug，参考《RDK S100 商业客户文档补充说明》中的 HB_APDP 生成章节（该文档为外部补充文档，不在本手册内），请联系 FAE 获取。

- 这样一旦出现 panic，重启后自动会进行 ramdump

#### 手动抓取

触发 Kernel panic 重启到 U-Boot 之后，在 U-Boot 下执行以下命令，数据存储到 eMMC 或者 ufs 的/ramdump/目录。

```console
Hobot$ setenv enable_ramdump 1
Hobot$ setenv ramdump_part_name ramdump # 这里的ramdump表明要保存dump文件的实际分区，请根据实际板子分区替换
Hobot$ setenv ramdump_in map # 这里的map表明让ramdump将文件保存进UFS或者eMMC（根据启动模式），请务必设置成map
Hobot$ memdump userdata # 把内存导出为 ext4 文件，写入 ramdump_part_name 指定分区的根目录
intf mmc,dev 0,part 17 directory /Recovery required
file found, deleting
update journal finished
File System is consistent
update journal finished
cpu core context dumped to //cpu-contexts.bin
DRAM bank= 0x0
-> start   = 0x0000000080000000
-> size    = 0x0000000080000000
-> dumpfile = //DDRCS0-0.bin, from memory 0x80000000, length=536870912
File System is consistent
file found, deleting
update journal finished
File System is consistent
update journal finished
536870912 bytes written in 10723 ms
skip secure wolrd memory region
-> dumpfile = //DDRCS0-2.bin, from memory 0xaa000000, length=1442840576
File System is consistent
file found, deleting
update journal finished
File System is consistent
update journal finished
1442840576 bytes written in 23719 ms
DRAM bank= 0x1
-> start   = 0x0000000400000000
-> size    = 0x00000000FFFFF000
-> dumpfile = //DDRCS1-0.bin, from memory 0x400000000, length=2147483648
File System is consistent
file found, deleting
update journal finished
File System is consistent
update journal finished
2147483648 bytes written in 33548 ms
-> dumpfile = //DDRCS1-1.bin, from memory 0x480000000, length=2147479552
File System is consistent
file found, deleting
update journal finished
File System is consistent
update journal finished
2147479552 bytes written in 33429 ms
DRAM bank= 0x2
-> start   = 0x0000000800000000
-> size    = 0x00000000FFFFF000
-> dumpfile = //DDRCS2-0.bin, from memory 0x800000000, length=2147483648
File System is consistent
file found, deleting
update journal finished
File System is consistent
update journal finished
2147483648 bytes written in 33528 ms
-> dumpfile = //DDRCS2-1.bin, from memory 0x880000000, length=2147479552
File System is consistent
file found, deleting
update journal finished
File System is consistent
update journal finished
2147479552 bytes written in 33656 ms
DRAM bank= 0x3
-> start   = 0x0000000C80000000
-> size    = 0x000000007FFFF000
-> dumpfile = //DDRCS3-0.bin, from memory 0xc80000000, length=2147479552
File System is consistent
file found, deleting
update journal finished
File System is consistent
update journal finished
2147479552 bytes written in 33372 ms
```

U-Boot `memdump` 的常用子命令：

| 子命令 | 作用 |
|--------|------|
| `memdump init <intf> <dev[:part]> <partition>` | 初始化导出目标（接口、设备/分区、目录） |
| `memdump dumpall` | 将全部内存 dump 到裸分区 |
| `memdump userdata` | 将内存导出为 ext4 文件（`DDRCS*.bin`、`cpu-contexts.bin`） |
| `memdump mini` | 导出关键内容（minidump）到 ext4 |

### crash 介绍

crash 主要是用来离线分析 linux 内核内存转存文件，它整合了 gdb 工具，具有很强的功能，可以查看堆栈，dmesg 日志，内核数据结构，反汇编等等。其支持多种工具生成的内存转储文件格式，包括：

- Live linux 系统。

- kdump 产生的正常的和压缩的内存转储文件。

- 由 makedumpfile 命令生成的压缩的内存转储文件。

- 由 netdump 生成的内存转储文件。

- 由 diskdump 生成的内存转储文件。

- 由 kdump 生成的 Xen 的内存转储文件。

- LKCD 生成的内存转储文件。

- Mcore 生成的内存转储文件。

- ramdump 格式的 raw 内存转储文件。

### crash 使用方法

本文主要使用 crash 来分析 ramdump 文件。ramdump 文件几乎是对整个内存的镜像，除了一些 security 类型的 memory 抓不出来之外，几乎所有的 DRAM 都能被抓下来。有些问题的复现概率低，而且有些问题是由于踩内存导致的，这种问题靠 log 往往是无法分析出来的，所以如果可以在问题发生时候把内存镜像保存下来，就可以分析了。

#### crash 工具代码获取及编译方法：

```bash
sudo apt install -y make gcc g++ libncurses-dev zlib1g-dev liblzo2-dev \
    libsnappy-dev bison wget patch texinfo libzstd-dev
git clone --depth=1 https://github.com/crash-utility/crash.git
cd crash
make target=ARM64
```

说明：`make target=ARM64` 表示在 x86_64 主机上编译用于分析 arm64 dump 的 crash（官方 README 使用大写 `ARM64`，小写 `arm64` 同样可以识别）。**crash 目前只支持在 x86_64 平台使用**。

#### 获取 vmlinux

crash 需要一份**带调试符号、且与产生 dump 的镜像版本一致**的 `vmlinux`：

- 在 SDK 中执行 `./mk_kernel.sh` 编译内核，产物为 `out/build/kernel/vmlinux`（内核已开启 `CONFIG_DEBUG_INFO`）；
- 注意版本必须与板端镜像一致，否则 crash 无法正确解析内核数据结构。

#### 复制 ramdump 文件到服务器

将板端 ramdump 分区保存的 DDR*.bin 和 cpu-contexts.bin 复制到 crash 二进制存在的目录下，由于 DDR*.bin 是整个 DDR 的数据，与 DDR 容量接近，推荐使用 scp 命令传输：

```bash
# 板端把 dump 所在分区挂载到 /mnt 后，在服务器上拉取
scp -C root@<板端IP>:/mnt/DDRCS*.bin .
scp root@<板端IP>:/mnt/cpu-contexts.bin .
```

#### 获取 crash 扩展文件和 cpu-context 解析脚本

文件位于对外服务器上，路径为[https://archive.d-robotics.cc/ubuntu-rdk-s100-beta/host-tools/crash-tools/](https://archive.d-robotics.cc/ubuntu-rdk-s100-beta/host-tools/crash-tools/)

下载其中的 parse-cpu-contexts.py 和 arm64-regs.so，并保存到 crash 二进制存在的目录下。该页面路径虽然含 `s100-beta`，但这两个文件都是 x86_64 主机侧工具，与 SoC 型号无关，S600 同样适用。

其中 `arm64-regs.so` 是面向 x86_64 的 crash 扩展模块，与 crash/gdb 版本配套（本文示例环境为 crash 9.0.0 + gdb 16.2）；若自行编译的 crash 版本差异较大，`extend` 可能失败。

#### 解析 cpu 的寄存器信息

```bash
python3 parse-cpu-contexts.py cpu-contexts.bin >./coreregs.txt
```

#### 使用 crash 工具进入 crash 现场

```console
./crash ./vmlinux DDRCS0-0.bin@0x80000000,/dev/zero@0xa0000000,DDRCS0-2.bin@0xaa000000,DDRCS1-0.bin@0x400000000,DDRCS1-1.bin@0x480000000,DDRCS2-0.bin@0x800000000,DDRCS2-1.bin@0x880000000,DDRCS3-0.bin@0xc80000000 --machdep vabits_actual=48

crash 9.0.0
Copyright (C) 2002-2025  Red Hat, Inc.
Copyright (C) 2004, 2005, 2006, 2010  IBM Corporation
Copyright (C) 1999-2006  Hewlett-Packard Co
Copyright (C) 2005, 2006, 2011, 2012  Fujitsu Limited
Copyright (C) 2006, 2007  VA Linux Systems Japan K.K.
Copyright (C) 2005, 2011, 2020-2024  NEC Corporation
Copyright (C) 1999, 2002, 2007  Silicon Graphics, Inc.
Copyright (C) 1999, 2000, 2001, 2002  Mission Critical Linux, Inc.
Copyright (C) 2015, 2021  VMware, Inc.
This program is free software, covered by the GNU General Public License,
and you are welcome to change it and/or distribute copies of it under
certain conditions.  Enter "help copying" to see the conditions.
This program has absolutely no warranty.  Enter "help warranty" for details.

NOTE: setting vabits_actual to: 48

GNU gdb (GDB) 16.2
Copyright (C) 2024 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
Type "show copying" and "show warranty" for details.
This GDB was configured as "--host=x86_64-pc-linux-gnu --target=aarch64-elf-linux".
Type "show configuration" for configuration details.
Find the GDB manual and other documentation resources online at:
    <http://www.gnu.org/software/gdb/documentation/>.

For help, type "help".
Type "apropos word" to search for commands related to "word"...

WARNING: cpu 0: cannot find NT_PRSTATUS note
WARNING: cpu 1: cannot find NT_PRSTATUS note
WARNING: cpu 2: cannot find NT_PRSTATUS note
WARNING: cpu 3: cannot find NT_PRSTATUS note
WARNING: cpu 4: cannot find NT_PRSTATUS note
WARNING: cpu 5: cannot find NT_PRSTATUS note
      KERNEL: ./vmlinux
   DUMPFILES: /var/tmp/ramdump_elf_LKd4AH [temporary ELF header]
              DDRCS0-0.bin
              /dev/zero
              DDRCS0-2.bin
              DDRCS1-0.bin
              DDRCS1-1.bin
              DDRCS2-0.bin
              DDRCS2-1.bin
              DDRCS3-0.bin
        CPUS: 6 [OFFLINE: 5]
        DATE: Thu Jun  5 00:01:41 CST 2025
      UPTIME: 01:44:00
LOAD AVERAGE: 3.95, 4.11, 4.05
       TASKS: 672
    NODENAME: ubuntu
     RELEASE: 6.1.112-rt43-DR-4.0.2-2507251105-g2eb711-g0e5746
     VERSION: #6 SMP PREEMPT_RT Fri Jul 25 11:14:37 CST 2025
     MACHINE: aarch64  (unknown Mhz)
      MEMORY: 12 GB
       PANIC: "Kernel panic - not syncing: sysrq triggered crash"
         PID: 4240
     COMMAND: "bash"
        TASK: ffff00040f10f000  [THREAD_INFO: ffff00040f10f000]
         CPU: 0
       STATE: TASK_RUNNING (PANIC)

crash>
```

说明：`--machdep vabits_actual=48` 表示内核虚拟地址位宽为 48 位（S600/S100 内核均为 `CONFIG_ARM64_VA_BITS_48=y`）；若内核配置不同，需要按 `CONFIG_ARM64_VA_BITS` 相应调整。

#### 添加扩展文件

```console
crash> extend arm64-regs.so
./arm64-regs.so: shared object loaded
```

#### 添加 cpu 寄存器信息

```console
crash> arm64_core_set -l coreregs.txt
loading cpu core regs from coreregs.txt
loading cpu core regs from coreregs.txt done
```

#### 查看 panic 时的堆栈信息

```console
crash> bt
PID: 4240     TASK: ffff00040f10f000  CPU: 0    COMMAND: "bash"
 #0 [ffff8000279cfab0] __arm_smccc_smc at ffff800008029cd0
 #1 [ffff8000279cfad0] __invoke_psci_fn_smc at ffff8000089a3394
 #2 [ffff8000279cfb10] psci_sys_reset at ffff8000089a3854
 #3 [ffff8000279cfb20] atomic_notifier_call_chain at ffff8000080cc094
 #4 [ffff8000279cfb60] do_kernel_restart at ffff8000080ce818
 #5 [ffff8000279cfb70] machine_restart at ffff800008019b9c
 #6 [ffff8000279cfb90] emergency_restart at ffff8000080cdaec
 #7 [ffff8000279cfba0] panic at ffff800008c0ad68
 #8 [ffff8000279cfc80] sysrq_handle_crash at ffff800008719354
 #9 [ffff8000279cfc90] __handle_sysrq at ffff800008719c84
#10 [ffff8000279cfce0] write_sysrq_trigger at ffff80000871a318
#11 [ffff8000279cfd00] proc_reg_write at ffff8000083a9478
#12 [ffff8000279cfd20] vfs_write at ffff80000831b9f4
#13 [ffff8000279cfdc0] ksys_write at ffff80000831be6c
#14 [ffff8000279cfe00] __arm64_sys_write at ffff80000831bf20
#15 [ffff8000279cfe10] invoke_syscall at ffff800008029e5c
#16 [ffff8000279cfe40] el0_svc_common.constprop.0 at ffff800008029f80
#17 [ffff8000279cfe70] do_el0_svc at ffff80000802a0f4
#18 [ffff8000279cfe80] el0_svc at ffff800008c22554
#19 [ffff8000279cfea0] el0t_64_sync_handler at ffff800008c239ac
#20 [ffff8000279cffe0] el0t_64_sync at ffff8000080115e4
     PC: 0000ffffa9a67e10   LR: 0000ffffa9a0506c   SP: 0000ffffebb5a030
    X29: 0000ffffebb5a030  X28: 0000000000000000  X27: 0000aaaaab07b000
    X26: 0000aaaaab041468  X25: 0000aaaaab085810  X24: 0000000000000002
    X23: 0000aaaabe0f0cd0  X22: 0000ffffa99707e0  X21: 0000ffffa9b2c5d8
    X20: 0000aaaabe0f0cd0  X19: 0000000000000001  X18: 0000000000000001
    X17: 0000ffffa9a01d40  X16: 0000ffffa9a06450  X15: 0000aaaaab08f2e8
    X14: 0000000000000000  X13: 0000000000000001  X12: 0000ffffa9ad7720
    X11: 0000ffffa9ad7440  X10: 0000000000000063   X9: 0000aaaabe092110
     X8: 0000000000000040   X7: 00000000ffffffff   X6: 0000000000000063
     X5: 0000aaaabe0f0cd1   X4: 0000aaaabe092111   X3: 0000ffffa9970020
     X2: 0000000000000002   X1: 0000aaaabe0f0cd0   X0: 0000000000000001
    ORIG_X0: 0000000000000001  SYSCALLNO: 40  PSTATE: 20001000
crash>
```

## 注意事项

- ramdump 仅支持 **Kernel panic** 触发的场景，其他复位原因不会抓取。
- dump 目标分区的要求与创建方式见《[抓取 ramdump](#抓取-ramdump)》。
- crash 仅支持在 x86_64 平台运行，编译与使用见《[crash 使用方法](#crash-使用方法)》。
- secure boot 设备自动抓取 ramdump 需要额外烧写 HB_APDP 分区镜像并开启 secure debug，请联系 FAE 获取对应说明。

## 常见问题

### 已设置 enable_ramdump，panic 后却没有自动抓取

**原因**：U-Boot 的自动抓取需要同时满足以下条件，任一不满足都会被跳过：

- `enable_ramdump` 未设置为 `1`；
- 本次复位原因不是 Kernel panic（例如断电、看门狗复位）；
- secure boot 设备处于 locked 状态（此时会打印 `Device is locked,skip ramdump`）；
- `ramdump_in` 未设置成 `map` 或 `mmc`；
- 目标分区不存在，或分区内没有可写的目录。

**解决**：先在 Linux 下用 `hrut_ddr_misc g` 确认 RAMDUMP 为 `on`；再进入 U-Boot，用 `printenv enable_ramdump ramdump_in ramdump_part_name` 逐项确认。secure boot 设备需处于 unlocked 状态。

### 执行 memdump userdata 提示 search part failed

**原因**：`memdump userdata` 按 `ramdump_part_name` 指定的**分区名**查找分区（默认值为 `map`），而 RDK 默认分区表中没有 `map` 分区。

**解决**：按《[自定义分区说明](/Advanced_development/environment_build/rdk_gen#自定义分区说明)》新建一个专门用于 ramdump 的分区（例如命名为 `ramdump`），并在 U-Boot 中 `setenv ramdump_part_name ramdump` 后 `saveenv`。也可以把该变量设为已有分区的名字前缀（如 `userdata`，按前缀匹配），但分区容量必须大于 DDR 容量。

### 抓取 ramdump 后保存分区损坏或空间不足

**原因**：dump 文件被写到根文件系统分区，或目标分区容量小于 DDR 容量——dump 文件与 DDR 容量相当，一次写入就可能占满分区可用空间。

**解决**：按《[抓取 ramdump](#抓取-ramdump)》的警告，将 dump 保存到非根文件系统的独立分区，并确保分区容量大于 DDR 容量；分析完成后及时把 dump 导出到服务器并清理。

### crash 工具无法运行

**原因**：crash 只能在 x86_64 平台运行，不能在板端（aarch64）直接执行；此外 crash 需要一份与产生 dump 的镜像版本一致、且带调试符号的 `vmlinux`。

**解决**：将 `DDRCSx.bin` 与 `cpu-contexts.bin` 复制到 x86_64 服务器上，按《[crash 使用方法](#crash-使用方法)》编译并运行 `crash`，并从 SDK 获取与板端镜像同版本的 `vmlinux`。

### crash 启动时提示 cannot find NT_PRSTATUS note

**原因**：各 CPU 的异常现场保存在 `cpu-contexts.bin` 中，crash 不会自动加载，因此启动时会打印 `WARNING: cpu N: cannot find NT_PRSTATUS note`，当前 CPU 之外的寄存器信息为空。

**解决**：按《[crash 使用方法](#crash-使用方法)》中的步骤，用 `parse-cpu-contexts.py` 生成 `coreregs.txt`，进入 crash 后依次执行 `extend arm64-regs.so` 和 `arm64_core_set -l coreregs.txt` 导入寄存器信息。

### extend arm64-regs.so 加载失败

**原因**：`arm64-regs.so` 是与 crash/gdb 版本配套的扩展模块（本文示例环境为 crash 9.0.0 + gdb 16.2），自行编译的 crash 版本差异较大时可能加载失败。

**解决**：优先使用与本文示例一致的 crash 版本；如仍失败，请联系 FAE 确认与所用 crash 版本配套的扩展文件。

## 相关文档

- [应用实时内核](/Advanced_development/system_software/realtime_kernel)
- [内核头文件](/Advanced_development/system_software/kernel_headers)
- [MCU ramdump 功能](/Advanced_development/mcu_development/mcu_ramdump)
