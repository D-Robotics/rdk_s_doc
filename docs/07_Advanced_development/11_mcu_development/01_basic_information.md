---
sidebar_position: 1
title: "MCU 快速入门指南"
description: "MCU 快速入门指南"
---

# MCU 快速入门指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 范围

本章节概述了 MCU 系统，旨在帮助读者快速了解并掌握相关内容，以便开展 MCU1 的开发工作。因为 MCU0 负责启动 Acore、MCU1 以及电源管理等功能，这部分不建议客户自行修改，默认不释放源码，提供 D-Robotics 验证过的 bin 文件。章节中仅对可能与 MCU1 发生冲突的部分进行简要说明，旨在帮助用户在开发过程中规避 MCU0 与 MCU1 之间的资源竞争问题。

## 基础信息

MCU 系统的默认配置如下：

| 配置项 | 默认值 |
|---|---|
| 编译工具链 | GCC（gcc-arm-none-eabi-10.3~2021.10） |
| MCU 核 | ARM R52+（参考 [ARM R52 technical reference manual](https://developer.arm.com/documentation/100026/latest)） |
| 操作系统 | FreeRTOS Kernel V10.0.1 |
| MCU 组成 | MCU0（启动 Acore/MCU1、电源管理，不开源）+ MCU1（业务，开源，可修改） |

## MCU 框架

<DocScope products="RDK S100">
MCU0 是板子启动的开始，也是重中之重。因为 MCU0 负责启动 Acore、MCU1 以及电源管理等功能。Acore 所运行的 Linux 操作系统是客户开发功能的重要载体，而 MCU1 运行的 FreeRTOS 操作系统为客户的实时任务进行保驾护航。
MCU1 通过 Linux 的 remoteproc 框架实现，在 Acore 的 sysfs 通过向 MCU0 发送通知，从而控制 MCU1 的启动和关闭。同时在 RDK S100 的休眠模式下，也是通知 Acore 通知 MCU0 从而操作 MCU1，实现低功耗休眠功能。
</DocScope>
<DocScope products="RDK S600">
MCU0 是板子启动的开始，也是重中之重。因为 MCU0 负责启动 Acore、MCU1 以及电源管理等功能。Acore 所运行的 Linux 操作系统是客户开发功能的重要载体，而 MCU1 运行的 FreeRTOS 操作系统为客户的实时任务进行保驾护航。
MCU1 通过 Linux 的 remoteproc 框架实现，在 Acore 的 sysfs 通过向 MCU0 发送通知，从而控制 MCU1 的启动和关闭。同时在 RDK S600 的休眠模式下，也是通知 Acore 通知 MCU0 从而操作 MCU1，实现低功耗休眠功能。
</DocScope>
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_frame.png" alt="MCU 框架示意图" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## 开发环境

交叉编译是指在主机上开发和构建软件，然后把构建的软件部署到开发板上运行。主机一般拥有比开发板更高的性能和更多的内存，可以高效完成代码的构建，可以安装更多的开发工具。

### 主机编译环境要求

推荐使用 Ubuntu 22.04 操作系统，保持和 RDK S100 相同的系统版本，减少因版本差异产生的依赖问题。

Ubuntu 22.04 系统安装以下软件包：

```c
sudo apt-get install -y build-essential make cmake libpcre3 libpcre3-dev bc bison \
                        flex python3-numpy mtd-utils zlib1g-dev debootstrap \
                        libdata-hexdumper-perl libncurses5-dev zip qemu-user-static \
                        curl repo git liblz4-tool apt-cacher-ng libssl-dev checkpolicy autoconf \
                        android-sdk-libsparse-utils mtools parted dosfstools udev rsync python3-pip scons

pip install "scons>=4.0.0"
pip install ecdsa
pip install tqdm
```

## MCU 仓库与整包构建

MCU 源码仓库需要放在 SDK 的指定路径下，整包构建脚本才能使用本地 MCU 源码；否则构建会使用 `source/bootloader` 内已编译好的 MCU 二进制。

**建议路径：** `source/mcu`

如果仓库放在其他路径，需要同时修改 `source/bootloader/device/rdk/<soc>/board_<soc>_debug.mk` 与 `board_<soc>_release.mk` 中的 `SRC_MCU_DIR`（**debug 和 release 两份配置都要修改**）。以 S600 为例：

```c
# source/bootloader/device/rdk/s600/board_s600_debug.mk
export SRC_MCU_DIR="${HR_TOP_DIR}/../mcu"
```

MCU 固件随 miniboot 包一起构建，相关 deb 包包括 `hobot-miniboot`、`hobot-utils`、`hobot-configs`，构建命令如下：

```shell
./mk_debs.sh hobot-miniboot
```

自 RDKS600-V5.1.0 起，`./mk_debs.sh hobot-miniboot` 默认包含 MCU SBL 的 GCC 编译支持。

:::info MCU0 固件
MCU0 固件不释放源码，随 miniboot 相关 deb 包提供 D-Robotics 验证过的二进制文件。如需定制 MCU0，请联系 [D-Robotics](mailto:developer@d-robotics.cc)。
:::

## 编译 MCU 系统

1. 编译会使用 python3，RDK S100/S600 开发使用的 python3 的版本为 3.8.10；
2. MCU1 的镜像分为 debug 和 release 两个版本。debug 版本的镜像会有调试信息，而 release 版本不含调试信息。

:::info 工具链下载说明

首次编译会从 arm 官网下载工具链后解压缩（10min 左右），网速不好可能会导致工具链下载不成功或下载不完整的问题，建议通过以下方式下载编译工具链：
1. 点击 [工具链下载链接](../../RDK.md#工具)，下载编译工具链。
2. 将已有工具链移至 /Build/ToolChain/Gcc/ 内，移动工具链命令如下：

    `mv 工具链存储路径/工具链文件名 新代码/Build/ToolChain/Gcc/`

3. 编译时检测到有工具链，不会再从官网下载。

:::

<DocScope products="RDK S100">
```shell
# 编译 MCU1 Debug 版本
cd mcu/Build/FreeRtos_mcu1
python build_freertos.py lite matrix B s100 mcu1 gcc debug

# 编译 MCU1 Release 版本
cd mcu/Build/FreeRtos_mcu1
python build_freertos.py lite matrix B s100 mcu1 gcc release
```
</DocScope>
<DocScope products="RDK S600">

```shell
# 编译 MCU1 Debug 版本
cd mcu/Build/FreeRtos_mcu1
python build_freertos.py lite matrix B s600 gcc mcu1 debug

# 编译 MCU1 Release 版本
cd mcu/Build/FreeRtos_mcu1
python build_freertos.py lite matrix B s600 gcc mcu1 release
```
</DocScope>

### 编译命令参数说明

`build_freertos.py` 按位置解析参数，格式如下：

```text
python build_freertos.py <mode> <配置段...> <soc> <compiler> [version] [可选参数]
```

| 参数 | 示例 | 说明 |
|---|---|---|
| `mode` | `lite` | 编译模式，必须是第一个参数；可选 `lite`、`product`、`qualitytest`、`boot` |
| 配置段 | `matrix B mcu1` | 非保留字，按顺序用 `-` 连接后决定读取哪个 yaml 文件，`matrix B mcu1` 对应 `lite-matrix-B-mcu1.yaml` |
| `soc` | `s100` 或 `s600` | 目标芯片，决定读取 `build_config/S100/` 或 `build_config/S600/` 下的配置 |
| `compiler` | `gcc` | 编译器，S600 仅支持 `gcc` |
| `version` | `debug` | 版本类型，可省略；`release` 会追加 `MCU_RELEASE` 宏 |

:::caution
脚本不校验"配置段"中的单词。拼写或顺序写错时不会立即报错，而是按拼接结果去读取另一个 yaml 文件，最终表现为找不到配置文件，或者编译了非预期的配置。
:::

## 编译成功标志

<DocScope products="RDK S100">

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/build_success.png" alt="编译成功标志示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
</DocScope>
<DocScope products="RDK S600">
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/02_S600/01_basic_information/build_success.jpg" alt="编译成功标志示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
</DocScope>

### 编译输出目录

<DocScope products="RDK S100">

```c
output/
├── debug                               # 该文件夹下包含 debug 版本的编译生成文件
|    ├── objs                           # 编译生成的 i/s/o 文件
|    └── S100_MCU_SIP_V2.0              # 编译生成的 bin/map/elf 等文件
|         ├── custom_compiler_flags.py
|         ├── S100_MCU_DEBUG.elf        # MCU1 启动文件
|         ├── S100_MCU_DEBUG.map
|         ├── S100_MCU_SIP_V2.0.bin
├── objs                                # 编译生成的 i/s/o 文件，根据编译的版本变化
├── release                             # 该文件夹下包含 release 版本的编译生成文件
|    ├── objs                           # 编译生成的 i/s/o 文件
|    └── S100_MCU_SIP_V2.0              # 编译生成的 bin/map/elf 等文件
```
</DocScope>
<DocScope products="RDK S600">

```c
output/
├── S600_MCU_DEBUG.map                  # debug 链接 map（在 output 根目录）
├── S600_MCU_RELEASE.map                # release 链接 map（release 编译后生成）
├── objs -> output/debug/objs           # 符号链接，指向当前编译 variant 的 objs
├── inc/                                # 构建时收集的头文件
├── debug/                              # debug 版本编译生成文件
|    ├── objs/                          # 编译生成的 i/s/o 文件
|    └── S600_MCU_Matrix_V2.0/          # elf/bin 等固件文件
|         ├── S600_MCU_RAW.bin
|         ├── S600_MCU_DEBUG.elf        # MCU1 启动固件
|         ├── S600_MCU_DEBUG.bin
|         └── S600_MCU_Matrix_V2.0.bin
└── release/                            # release 版本，结构类似
     ├── objs/
     └── S600_MCU_Matrix_V2.0/
          ├── S600_MCU_RAW.bin
          ├── S600_MCU_RELEASE.elf      # MCU1 启动固件（release）
          ├── S600_MCU_DEBUG.bin
          └── S600_MCU_Matrix_V2.0.bin
```

> 说明：`.map` 文件由链接器生成在 `output/` 根目录，debug/release 均会生成，命名分别为 `S600_MCU_DEBUG.map` / `S600_MCU_RELEASE.map`；elf/bin 经后处理移至 `debug/` 或 `release/` 下的 `S600_MCU_Matrix_V2.0/` 子目录。

</DocScope>

## MCU1 启动/关闭流程

MCU1 的启动/关闭是由 Acore 经过 remoteproc 框架传递信息给 MCU0 进而实现启动/关闭 MCU1。

### MCU1 启动原理与步骤{#start_mcu1}

#### MCU1 启动原理

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/mcu1_start.png" alt="MCU1 启动原理示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

#### MCU1 启动步骤

下述启动流程以 debug 版本为例，release 版本与其类似，只是少一些 log 打印。

<DocScope products="RDK S100">
1. 经过上述编译流程，编译 debug 版本会在 S100_MCU_SIP_V2.0 文件夹下产生 S100_MCU_DEBUG.elf 文件（release 版本类似），该文件为 MCU1 的 firmware 文件，因此需要将该文件推送到板端的 /lib/firmware 目录。
</DocScope>
<DocScope products="RDK S600">
1. 经过上述编译流程，编译 debug 版本会在 S600_MCU_Matrix_V2.0 文件夹下产生 S600_MCU_DEBUG.elf 文件（release 版本类似），该文件为 MCU1 的 firmware 文件，因此需要将该文件推送到板端的 /lib/firmware 目录。
</DocScope>
举例子如下：(此处以及后续步骤截图均以 S100 为例，S600 类似)

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/push_elf.png" alt="MCU1 启动步骤示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

2. 板端启动流程
<DocScope products="RDK S100">
```c
cd /sys/class/remoteproc/remoteproc_mcu0
echo S100_MCU_DEBUG.elf > firmware
echo start > state
```
</DocScope>
<DocScope products="RDK S600">
```c
cd /sys/class/remoteproc/remoteproc_mcu0
echo S600_MCU_DEBUG.elf > firmware
echo start > state
```
</DocScope>

Acore 侧串口打印

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/Acore_start_log.png" alt="MCU1 启动步骤截图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

MCU 侧串口打印

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_start_log.png" alt="MCU1 启动步骤截图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### MCU1 关闭原理与步骤

#### MCU1 关闭原理

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/mcu1_stop.png" alt="MCU1 关闭原理示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

#### MCU1 关闭步骤

下述关闭流程以 debug 版本为例，release 版本与其类似，只是少一些 log 打印。
(后续实例以 S100 为例，S600 类似)
<DocScope products="RDK S100">
```c
cd /sys/class/remoteproc/remoteproc_mcu0
echo S100_MCU_DEBUG.elf > firmware
echo stop > state
```
</DocScope>
<DocScope products="RDK S600">
```c
cd /sys/class/remoteproc/remoteproc_mcu0
echo S600_MCU_DEBUG.elf > firmware
echo stop > state
```
</DocScope>
正常关闭后，串口 log 打印下图所示
Acore 侧串口打印

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/Acore_stop_log.png" alt="MCU1 关闭步骤截图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

MCU 侧串口打印

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_stop_log.png" alt="MCU1 关闭步骤截图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
<br/>
:::caution
stop MCU1 之后，如果需要再次启动 MCU1，必须等待系统进入 wfi 模式之后，才能再次 start MCU1，见下图所示。原因解释：避免系统还没有进入 wfi 模式时，start MCU1 会重新加载 firmware 至 mcu sram 位置导致之前位置代码被覆盖，导致系统运行跑飞挂死

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/mcu1_enter_wfi.png" alt="MCU1 关闭步骤示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
:::

## MCU0/MCU1 模块划分

MCU 整个系统含有 ICU、RTC、IPC、Port、CAN 等模块，但是为了用户开发的方便，对于功能进行了划分，划分细节如下图所示。
<DocScope products="RDK S100">
|模块|模块位置|
|----|---------------|
|ppslcu|MCU0|
|port|MCU0|
|uart|MCU0/MCU1|
|log|MCU0/MCU1|
|shell_init|MCU0/MCU1|
|mDma|MCU0/MCU1|
|I2c|MCU0: i2c6, i2c7/MCU1: i2c8, i2c9|
|tca9539|MCU0|
|ICU|MCU0|
|GPT|MCU0|
|pmic|MCU0|
|fls_init|MCU0|
|otaflash|MCU0|
|ipc|MCU0: instance8/MCU1: instance0(其他 instance 未划分, 均可使用)|
|crypto|MCU0|
|pvt|MCU0|
|canGW|MCU1|
|Rtc|MCU0|
|RTC_pps|MCU0|
|Eth_Init|MCU1|
|Scmi|MCU0|
</DocScope>
<DocScope products="RDK S600">
|模块|模块位置|
|----|---------------|
|ppslcu|MCU0|
|port|MCU0|
|uart|MCU0/MCU1|
|log|MCU0/MCU1|
|shell_init|MCU0/MCU1|
|mDma|MCU0/MCU1|
|I2c|MCU0/MCU1|
|tca9539|MCU0|
|ICU|MCU0|
|GPT|MCU0|
|pmic|MCU0|
|fls_init|MCU0|
|otaflash|MCU0|
|ipc|MCU0: instance8/MCU1: instance0|
|crypto|MCU0|
|pvt|MCU0|
|Rtc|MCU0|
|RTC_pps|MCU0|
|Eth_Init|MCU1|
|Scmi|MCU0|
|Can|MCU1:Can1, Can2, Can3, Can4, Can10|
</DocScope>

## MCU 在 sysfs 上 debug 功能介绍

MCU 的 sysfs 节点位于 `/sys/class/remoteproc/remoteproc_mcu0` 与 `/sys/class/remoteproc/remoteproc_mcu1` 下，常用节点如下：

| 节点 | 说明 |
|---|---|
| `alive` | MCU0/MCU1 所处状态，取值为 `alive` 或 `dead`；状态每 1s 更新一次，因此读取有 1s 延迟 |
| `taskcounter` | MCU 启动后持续的时间，单位：秒 |
| `mcu_version` | MCU 版本信息，包括 debug 版本还是 release 版本，以及编译时间 |
| `cpuloads` | MCU0/MCU1 各任务的任务状态、优先级、剩余栈、运行次数（FreeRTOS tickcount）与使用率，可用于 debug；需要在 MCU0/MCU1 **已上电**时才能获取，且因涉及大量数据拷贝至 sysfs 输出 buffer，读取有 1s 延迟 |

remoteproc 相关节点：

| 节点 | 说明 |
|---|---|
| `firmware` | MCU0 启动 MCU1 时使用的固件名。启动时 Linux 会到板端 `/lib/firmware` 目录下查找同名文件，并加载至相应位置 |
| `name` | 节点名：mcu0 为 `soc:remoteproc_mcu0`，mcu1 为 `soc:remoteproc_mcu1` |
| `state` | remoteproc 子系统状态。经 `remoteproc_mcu0` 节点启动 MCU1 后变为 `running`，未启动时为 `offline` |
| `sbl_version` | SBL 版本信息与编译时间，仅在 `remoteproc_mcu0` 下可查看 |
| `recovery` | MCU 挂掉后能否获取 coredump 寄存器信息。该功能正常情况下使能，使用方式见 [MCU ramdump](./13_mcu_ramdump.md) |
| `uevent` | 设备类型，为 `DEVTYPE=remoteproc` |

不支持的节点：

- `timesync`：主从设备同步时间需要，MCU 不支持该功能。

:::info 图片中的信息可能因版本更新而有所不同，文中示例仅供参考
:::
1. 系统状态 `alive`：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/alive_state.png" alt="MCU 在 sysfs 上 debug 功能介绍示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

2. 系统存活时间 `taskcounter`：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/taskcounter_state.png" alt="MCU 在 sysfs 上 debug 功能介绍示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

3. MCU 版本 `mcu_version`：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/mcu_version.png" alt="MCU 在 sysfs 上 debug 功能介绍示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

4. SBL 版本 `sbl_version`：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/sbl_version.png" alt="MCU 在 sysfs 上 debug 功能介绍示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

5. MCU 串口 log：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/log2.png" alt="MCU 在 sysfs 上 debug 功能介绍截图" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

6. MCU 任务负载 `cpuloads`：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/cpuload.jpg" alt="MCU 在 sysfs 上 debug 功能介绍示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## MCU 串口使用

<DocScope products="RDK S100">
如果 RDK S100 含有连接方式如下，mcu 串口和 Acore 串口共用一个串口，自行查看：设备管理器 -> 端口 -> MCU-COM -> 波特率 921600
</DocScope>
<DocScope products="RDK S600">
如果 RDK S600 含有连接方式如下，mcu 串口和 Acore 串口共用一个串口，自行查看：设备管理器 -> 端口 -> MCU-COM -> 波特率 921600
</DocScope>

<DocScope products="RDK S100">
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/MCU_COM1.jpg" alt="MCU 串口使用示意图" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
</DocScope>
<DocScope products="RDK S600">
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/02_S600/01_basic_information/S600_SerialCOM.jpg" alt="MCU 串口使用示意图" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
</DocScope>

## MCU0 烧录流程

### 手动烧录

#### 非空板烧录

1. 打开板子，板端 Acore 串口常按 enter 进入 U-Boot（一定要一直按）
```c
fastboot 0
```
2. 编译好的 MCU0 镜像 output_sysmcu/ 目录下找到相应的 MCU0 镜像（MCU0 代码仅在商业版中提供），这里展示以 S100 MCU0 为例。
```c
fastboot oem interface:mtd
/* 编译出来的 S100 MCU0 镜像：MCU_S100_SIP_V2.0.img */
/* 编译出来的 S600 MCU0 镜像：MCU_S600_Matrix_V2.0.img */
fastboot flash MCU_a "xxx/MCU_S100_SIP_V2.0.img"
fastboot flash MCU_b "xxx/MCU_S100_SIP_V2.0.img"
```

#### 空板烧录

**空板烧录请使用 Xburn 工具指定区域烧录，并指定 `miniboot_flash`**

<DocScope products="RDK S100">

关于 Xburn 工具烧录指定区域，参考 [烧录指定区域](../../01_Quick_start/03_install_os_and_setup/02_burn.md#烧录指定区域) 章节。

</DocScope>
<DocScope products="RDK S600">

关于 Xburn 工具烧录指定区域，参考 [烧录指定区域](../../01_Quick_start/03_install_os_and_setup/02_burn.md#烧录指定区域) 章节。

</DocScope>

## MCU0 定制开发要点

MCU0 负责启动 Acore、MCU1 与电源管理，源码不释放。以下内容与实际硬件设计强相关，客户定制底板时需要确认；相关代码位于企业版代码包中，目录说明见 [MCU 代码包结构介绍](/Advanced_development/mcu_development/code_release)。

<DocScope products="RDK S600">

### 电源功能安全（S600）

S600 在 Acore 外设电源上增加了轻量级的电源功能安全监控：当电源指示引脚出现异常时，MCU0 会触发强制整机关机。

| 监控信号 | 引脚 | 说明 |
|---|---|---|
| `VDD_PERI_PG` | MCU GPIO 34 | Acore 外设电源的 PG（Power Good）指示 |
| `VDD_AON_PERI_PG` | MCU GPIO 26 | AON 域外设电源的 PG 指示 |

实现代码为 `mcu/Service/Power/src/PowerMon.c`。两个 PG 中断服务函数在检测到异常后调用 `hb_PM_RequestSt(SYSSTATE_SHUTDOWN_ACTTION_IT)` 请求整机关机。

客户底板如果不包含这两路电源监控，需要把对应实现改为空实现（保留函数名与签名，函数体留空）：

```c
#include "PowerMon.h"
#ifdef __cplusplus
extern "C"{
#endif

void PwrMon_Init(void)
{
}

void PwrMon_Enable(void)
{
}

void PwrMon_Disable(void)
{
}

uint8_t PwrMon_IsAllowed(void)
{
    return 0;
}

/** MCU[26] - VDD_AON_PERI_PG */
void Icu_Gpio_Channel_0_26_ISR(void)
{
}

/** MCU[34] - VDD_PERI_PG */
void Icu_Gpio_Channel_1_2_ISR(void)
{
}

#ifdef __cplusplus
}
#endif
```

:::info
`PowerMon.c` 中另有 `Icu_Gpio_Channel_1_31_ISR()`（MCU[63]）与 `Icu_Gpio_Channel_2_0_ISR()`（MCU[64]），源码注释标明这两个检测脚硬件不可靠，当前不触发下电。
:::

</DocScope>

### 唤醒源控制

MCU0 支持 RTC 与 GPIO 两种唤醒源。如果要用 USB、Wi-Fi 等外设唤醒整机，需要把外设的 `WAKE_HOST`（用于唤醒 Host）信号接到 AON_GPIO 管脚上，并把对应的 AON_GPIO 配置为唤醒源，具体连接请参考硬件参考设计。

设置唤醒源的接口位于 `Include/SystemPower.h`：

| 接口 | 说明 |
|---|---|
| `SysPower_RtcWakeupSet(uint32 WakeupTime)` | 设置 RTC 唤醒时间 |
| `SysPower_GpioWakeupSet(uint32 GpioIdx, uint32 Type, uint32 Polarity)` | 设置 GPIO 唤醒源；`GpioIdx` 为 AON 子系统的 GPIO 编号，可参考 Pinlist 获取 |

代码包提供了 `wakeupsource` 命令用于验证唤醒源设置。

<DocScope products="RDK S600">

### BPU 带宽限流（HQB）

MCU0 通过 HQB（QoS）寄存器限制 BPU 等主域模块可用的 DDR 带宽。S600 的配置代码位于 `mcu/McalCdd/Common/Power/S600/driver/src/cmn_lld/src/S600_cmn.c`，入口为 `HQB_init()`，按 DDR/SRAM 的 NID 分别调用 `HQB_ddr_perf_config()` 与 `HQB_sram_perf_config()`。

该寄存器涉及 DDR 带宽分配，且 S600 与 S100 的寄存器地址并不相同，如需调整请先联系 [D-Robotics](mailto:developer@d-robotics.cc) 确认，不要照搬 S100 的配置值。

</DocScope>

## MCU1 Undefined/Abort 异常处理原理

<DocScope products="RDK S100">

正常情况下系统进入 Undefined/Abort 异常后，会进入异常处理与现场保存流程。RDK S100 不能对 MCU1 单独进行硬件上下电，因此 MCU1 的 remoteproc stop/start 流程和同步 Undefined/Abort 异常处理流程需要分开理解。

</DocScope>
<DocScope products="RDK S600">
正常情况下系统在进入 undefined/abort 异常时，最终会进入死循环状态。只有重新执行上下电流程才能再次正常运行。RDK S600 由于不能对 MCU1 单独进行上下电，所以需要进行系统流程的修改，以实现上述的预期。
</DocScope>

<DocScope products="RDK S100">

### 路径一：remoteproc 软件 stop/start（日常启停）

Acore 通过 sysfs 执行 `echo stop > state` 后，MCU0 触发核间中断，MCU1 清除运行标志并进入 STANDBY 或深睡；下次执行 `echo start > state` 时，MCU1 重新软件启动。

MCU1 中 core0 的 stop/deepsleep 主要由 Cross_Core_Ins0 / Cross_Core_Ins2 处理，core1 的 stop/deepsleep 主要由 Cross_Core_Ins3 / Cross_Core_Ins5 处理，相关代码位于：

- `mcu/Target/Target_S100/Target-hobot-lite-freertos-mcu1/target/FreeRtosOsHal/Isr_Hal.c`
- `mcu/Target/Target_S100/Target-hobot-lite-freertos-mcu1/target/main.c`

代码示例：

```c
void Os_Isr_Cross_Core_Ins0_Isr(void)
{
  LogSync("mcu1: %s!\r\n",__func__);
  power_on = 0;
  ClearCrossCoreISR0();
  if (exception_on)
  {
    exception_on = 0;
  }
}

void Os_Isr_Cross_Core_Ins3_Isr(void)
{
  LogSync("mcu1: %s!\r\n",__func__);
  power_on_core1 = 0;
  ClearCrossCoreISR3();
  if (exception_on_core1)
  {
    exception_on_core1 = 0;
  }
}
```

### 路径二：同步 Undefined/Abort 异常

RDK S100 MCU1 的 `startup.s` 中，EL1 异常向量表入口为 `call_EL1_Undefined_Handler` / `call_EL1_Abort_Handler`，并非 `main.c` 中的 `EL1_Undefined_Handler`。

Undefined 异常会直接进入 `Os_SaveCrashDump0` 保存 crash dump；Prefetch/Data Abort 会先调用 `User_Abort_Handler_pre` / `User_Abort_Handler` 记录故障信息，再进入 `Os_SaveCrashDump0`。

Abort 处理还有一个可恢复分支：`User_Abort_Handler` 返回 2 时（debug exception），不会进入 `Os_SaveCrashDump0`，而是返回原指令继续执行（`startup.s` 中的 `skip_fault` 标号），因此这类异常不产生 crash dump。

代码示例：

```asm
EL1_core_exceptions_table:
    b   EL1_Reset_Handler
    b   call_EL1_Undefined_Handler
    ldr pc, =vPortSVCDispatcher
    b   call_EL1_Prefetch_Handler
    b   call_EL1_Abort_Handler
    b   EL1_DefaultISR
    ldr pc, =vPortInterruptDispatcher
    b   EL1_FIQ_Handler

call_EL1_Undefined_Handler:
    push {r0}
    mov r0, #(0x100*1+18)
    b Os_SaveCrashDump0

call_EL1_Abort_Handler:
    STMFD SP! , {R0-R12,LR}
    ...
    bl User_Abort_Handler
    ...
    b Os_SaveCrashDump0
```

</DocScope>

<DocScope products="RDK S600">

具体原理：RDK S600 MCU1 涉及**两条独立路径**。

**路径一：remoteproc 软件 stop/start（日常启停）**

Acore 通过 sysfs 执行 `echo stop > state` 后，MCU0 触发核间中断 Ins0，MCU1 清除运行标志并使 core1 进入 STANDBY 或深睡；下次 `echo start > state` 时 MCU1 重新软件启动。相关代码位于 `Target/Target_S600/Target-hobot-lite-freertos-mcu1/target/FreeRtosOsHal/Isr_Hal.c` 与 `main.c`：

```c
/* Isr_Hal.c */
void Os_Isr_Cross_Core_Ins0_Isr(void)
{
  LogSync("mcu1: %s!\r\n", __func__);
  power_on_core1 = 0;
  power_on = 0;
  ClearCrossCoreISR0();
  if (exception_on)
  {
    exception_on = 0;
  }
}

/* main.c — core1 分支（节选） */
while (1) {
    if (0 == power_on_core1) {
        Os_Disable_Can4_DataIsr();
        /* ... 关闭 Can6~Can10 ... */
        if (1 == deep_sleep_core1) {
            LogSync("core1 enter deepsleep...\r\n");
            Mcu1_Enter_Sleep_Core1();
        } else {
            LogSync("core1 enter stop...\r\n");
            STANDBY();
        }
    }
}
```

**路径二：同步 Undefined/Abort 异常**

`startup.s` 中 EL1 异常向量表入口为 `call_EL1_Undefined_Handler` / `call_EL1_Abort_Handler`，**并非** `main.c` 中的 `EL1_Undefined_Handler`。同步异常经 `HorizonHook.c` 中的 `User_Undefined_Handler` / `User_Abort_Handler` 记录故障信息后，进入 `Os_SaveCrashDump0` 保存 crash dump：

```c
/* HorizonHook.c — Undefined 异常（节选） */
uint32 User_Undefined_Handler(void *reg)
{
    LogSync("[MCU%u Core%u] Enter Undefined Instruction Handler!!!\r\n",
            (unsigned int)cluster_id, (unsigned int)core_id);
    LogSync("Estimated undefined fault PC: 0x%x\r\n", fault_pc);
    /* ... 打印指令与上下文 ... */
    return 1u;
}
```

Abort 处理还有一个可恢复分支：`User_Abort_Handler` 返回 2 时（debug exception），不会进入 `Os_SaveCrashDump0`，而是回到原指令继续执行（见 `startup.s` 中的 `skip_fault` 标号），因此这类异常不产生 crash dump。

:::info 关于 main.c 中的异常处理函数

`main.c` 中虽定义了 `S600_Exception_Handler`、`EL1_Undefined_Handler`、`EL1_Abort_Handler`，但当前 **EL1 异常向量表未跳转到这些函数**，不属于上述同步异常的实际执行路径。该问题已记录，计划在下版 MCU 代码中修复。

:::

</DocScope>

## MCU1 main 函数简介

main 函数是进入系统后的关键代码。MCU1 当前会根据 `GetCurrentCoreID()` 区分 core0 与 core1 的初始化流程。core0 负责主要外设、log、版本信息、GIC WAKER、中断亲和性和 FreeRTOS 任务初始化；
<DocScope products="RDK S100">
core1 负责 Can5~Can9 数据中断、核间中断以及 stop/deepsleep 流程。
</DocScope>
<DocScope products="RDK S600">
core1 负责 Can4、Can6~Can10 数据中断、核间中断以及 stop/deepsleep 流程。
</DocScope>

<DocScope products="RDK S100">

下述代码为 RDK S100 MCU1 当前 main 函数关键逻辑节选，请勿随意删除相关初始化代码，否则可能导致启动、remoteproc stop/start、Can 中断或低功耗流程异常。

```c
int main(void)
{
    unsigned long core_id = GetCurrentCoreID();

    if (core_id == 0) {
        /* core0 执行逻辑：
         * Ipc_MainPowerUp、Can2Atcm_Init、PpsIcu_Irq_Init、Uart_Init、
         * Log_Init、Shell_Init、Version_into_AonSram 等初始化。
         */
        LogSync("MCU FreeRtos Lite Init Success!\r\n");

        /* 配置 gicr0/gicr1 WAKER，保留 bit3 和 bit0 */
        /* ... 读写 0x22100014、0x22120014 等 GIC WAKER 寄存器 ... */

        FreeRtos_Irq_Init();
        SetCanInterruptAffinity(1);
        SetIPCInterruptAffinity(1);
        SetCrossCoreInterruptAffinity(1);
        FreeRtos_Task_Init();

        for(;;){};
    } else if (core_id == 1) {
        /* core1 执行逻辑：
         * 使能 Can5~Can9 数据中断，以及 Cross_Core_Ins3/4/5。
         */
        __asm__ volatile("cpsie i");
        __asm__ volatile("cpsie f");

        while(1) {
            if(0 == power_on_core1) {
                /* stop/deepsleep 前关闭 Can5~Can9 数据中断 */
                /* ... Os_Disable_Can5_DataIsr() ~ Os_Disable_Can9_DataIsr() ... */

                if(1 == deep_sleep_core1) {
                    Mcu1_Enter_Sleep_Core1();
                } else {
                    InvalidateCache();
                    STANDBY();
                }
            } else {
                __asm__ volatile("wfe");
            }
        }
    }
}
```

</DocScope>
<DocScope products="RDK S600">

```c
int main(void)
{
    unsigned long core_id = GetCurrentCoreID(); /* 获取当前 cluster 工作的 core id */
    if (core_id == 0) {             /* core0 执行逻辑 */
        /* ... Ipc_MainPowerUp、Disable_AonTimer、Can2Atcm_Init、Uart_Init、
              Log_Init、Version_into_AonSram 等初始化 ... */
        LogSync("MCU1 FreeRtos Lite Init Success!\r\n");

        uint32_t gicr0_waker_addr = 0x22100014; /* 配置 gicr0 WAKER，保留 bit3 和 bit0 */
        /* ... 读写 gicr0 WAKER 寄存器 ... */

        uint32_t gicr1_waker_addr = 0x22120014; /* 配置 gicr1 WAKER，保留 bit3 和 bit0 */
        /* ... 读写 gicr1 WAKER 寄存器 ... */

        FreeRtos_Irq_Init();
        SetCanInterruptAffinity(1);       /* Can 中断绑定 core1，core1 无需再逐个 enable */
        SetIPCInterruptAffinity(1);
        SetCrossCoreInterruptAffinity(1); /* 核间中断绑定 core1 */
        FreeRtos_Task_Init();

        for(;;){};
   } else if (core_id == 1) {         /* core1 执行逻辑 */
        Os_Enable_Cross_Core_Ins3_DataIsr();
        __asm__ volatile("cpsie i");
        __asm__ volatile("cpsie f");

        while(1) {
            if(0 == power_on_core1)
            {
                Os_Disable_Can4_DataIsr();
                /* ... 关闭 Can6~Can10 ... */

                if(1 == deep_sleep_core1)
                {
                    Mcu1_Enter_Sleep_Core1(); /* 进入深睡 */
                }
                else
                {
                    STANDBY();              /* 进入 WFI/STANDBY */
                }
            }
        }
        for(;;){};
   }
}
```

</DocScope>

## MCU Log 简介

MCU 提供了基础的日志（Log）输出功能，主要用于调试与运行状态记录。当前版本的 Log 模块支持通过格式化字符串的方式输出信息，便于开发者在调试过程中快速定位问题和查看变量状态。在 Acore 侧可通过 `/proc/remoteproc_mcu0` 和 `/proc/remoteproc_mcu1` 这两个节点查看 MCU0 和 MCU1 的日志信息。

以获取 MCU1 串口 log 信息为例，如下图所示：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/05_mcu_development/01_S100/basic_information/log2.png" alt="MCU Log 简介截图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

目前，MCU Log 支持的格式化输出类型包括：
- %s —— 字符串
- %d —— 十进制有符号整数
- %u —— 十进制无符号整数
- %x —— 十六进制小写格式
- %X —— 十六进制大写格式
- %c —— 单个字符

除以上类型外的其他格式化输出暂不支持，后续版本将逐步扩展更多的数据类型与格式支持，以满足更丰富的调试需求。

## 常见问题

### 首次编译时工具链下载不成功或下载不完整

**原因**：首次编译会从 Arm 官网下载工具链后解压缩，网速不好可能导致下载失败。

**解决**：手动下载编译工具链，并将工具链移动到代码的 `Build/ToolChain/Gcc/` 目录后重新编译，编译时检测到已有工具链便不再从官网下载。

### stop MCU1 后立即 start 导致系统跑飞挂死

**原因**：系统尚未进入 wfi 模式时 start MCU1，会重新加载 firmware 至 MCU SRAM，覆盖之前的代码位置。

**解决**：stop MCU1 后，必须等待系统进入 wfi 模式，再执行 start MCU1。

## 相关文档

- [MCU 代码包结构介绍](/Advanced_development/mcu_development/code_release)
- [MCU 系统说明](/Advanced_development/mcu_development/MCU_build_system)
- [MCU1 开发指南](/Advanced_development/mcu_development/FreeRTOS_development)
- [MCU ramdump 功能](/Advanced_development/mcu_development/mcu_ramdump)
- MCU 接口扩展板：[RDK S100](/Quick_start/hardware_introduction/rdk_mcu_port_expansion_board)、[RDK S600](/Quick_start/hardware_introduction/expansion_board/mcu/rdk_s600_mcu_port_expansion_board)
- 外设使用指南：[UART](/Advanced_development/mcu_development/mcu_uart)、[PWM](/Advanced_development/mcu_development/mcu_pwm)、[SPI](/Advanced_development/mcu_development/mcu_spi)、[ADC](/Advanced_development/mcu_development/mcu_adc)、[IPC](/Advanced_development/mcu_development/mcu_ipc)、[CAN](/Advanced_development/mcu_development/mcu_can)、[I2C](/Advanced_development/mcu_development/mcu_i2c)、[Eth](/Advanced_development/mcu_development/mcu_eth)
