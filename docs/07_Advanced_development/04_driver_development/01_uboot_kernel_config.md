---
sidebar_position: 1
title: "配置 U-Boot 和 Kernel 选项参数"
description: "配置 U-Boot 和 Kernel 选项参数"
---

# 配置 U-Boot 和 Kernel 选项参数

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

在系统软件开发中，经常需要对 U-Boot 和 kernel 的功能选项进行配置，本章节介绍几个常用的配置方法，供用户参考使用。

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要裁剪内核/U-Boot 配置、定制板级 `defconfig` 的 BSP/构建工程师。

**前置条件**：已搭建 SDK 源码编译环境（`xbuild.sh`）；了解 U-Boot 与内核 `defconfig` 的配置机制。

**与其他模块关系**：本页是各驱动/功能模块内核态开关的统一入口，与 [5.4 驱动开发](/Advanced_development/driver_development) 各驱动篇的「内核配置」节互链；最终生成的 `defconfig` 供镜像编译使用。

<DocScope products="RDK S100">
S100 的内核配置文件为 `hobot-drivers/configs/drobot_s100_defconfig`，U-Boot 配置文件由板级 `.board_config.mk` 中的 `HR_UBOOT_CONFIG_FILE` 指定（debug 模式为 `hobot_s100_defconfig`，release 模式为 `hobot_s100_rel_defconfig`）。默认存储介质为 eMMC。
</DocScope>

<DocScope products="RDK S600">
S600 的内核配置文件为 `hobot-drivers/configs/drobot_s600_defconfig`，U-Boot 配置文件由板级 `.board_config.mk` 中的 `HR_UBOOT_CONFIG_FILE` 指定（debug/release 模式均为 `hobot_s600_defconfig`）。默认存储介质为 UFS。
</DocScope>

## 配置 U-Boot 选项参数

:::info 注意

​	U-Boot 具体使用的配置文件可以在 `./xbuild.sh lunch` 之后查看 `bootloader/device/.board_config.mk` 板级配置文件中 `HR_UBOOT_CONFIG_FILE` 的变量值。`.board_config.mk` 是一个符号链接，指向 `device/rdk/<chip>/board_<chip>_<mode>.mk`（由 lunch 选择，`./xbuild.sh distclean` 会删除该链接，需重新 lunch）。

​	实际编译时使用的 U-Boot 配置并不只有这一份 defconfig，而是「基础 defconfig + 存储介质 fragment」两步合并生成，介质 fragment 由 build_params 配置文件中的 `RDK_DISK_MEDIUM` 变量选择；开启 OTA（`RDK_OTA=yes`）时还会叠加 OTA 配置。

:::

各平台实际参与合并的配置文件如下：

<DocScope products="RDK S100">
- 基础配置：debug 模式 `hobot_s100_defconfig`，release 模式 `hobot_s100_rel_defconfig`
- 介质配置：`hobot_emmc.config`（默认存储介质 eMMC）
- OTA 配置：`hobot_s100_ota.config`
</DocScope>

<DocScope products="RDK S600">
- 基础配置：`hobot_s600_defconfig`（debug/release 模式相同）
- 介质配置：`hobot_ufs.config`（默认存储介质 UFS）
- OTA 配置：`hobot_s600_ota.config`
</DocScope>

### 通过 xbuild 命令配置

首先进入`source/bootloader`目录,目录结构如下

```
├── build     # 编译系统代码目录，提供编译各个功能模块的shell脚本，编译用到的tools
├── device    # 板级配置目录，每种硬件对应一份配置文件，可以设置编译选项和分区表等
├── miniboot  # 生成包含gpt、mbr、bl2、ddr、bl3x 一体的最小启动固件
├── out       # 编译输出目录
└── uboot     # U-Boot 源代码
```

`build/xbuild.sh`为主编译脚本，提供了以下命令帮助用户进行 U-Boot 的选项配置，该命令会自动使用板级配置文件中设置的 U-Boot 配置文件，在配置完成后，自动完成 savedefconfig 和保存工作。
```
./xbuild.sh uboot menuconfig
```

命令执行成功后会打开 U-Boot 图形化配置界面，您可以在这个交互界面下完成选项的配置，包括删除不需要的功能和启用需要的功能。

:::info 注意

​	`./xbuild.sh uboot menuconfig` 打开配置界面时只加载了基础 defconfig，不包含介质配置 fragment；而实际编译时会合并该介质配置。因此 menuconfig 界面中看不到介质相关的选项（如 U-Boot 的 UFS/eMMC 支持开关）属于正常现象。

:::

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_x5/screenshot-20241120-201418.png" alt="menuconfig图形化配置界面" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

在 menuconfig 的配置界面上完成配置后，选择 `Exit`退出，根据提示选择 `Yes` 或者`No`保存修改到`.config`文件中。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development/image-20220518111506018.png" alt="menuconfig退出时保存配置提示" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

在配置退出后，会自动执行配置的文件的保存。自动完成的内容为：

```
# 调用savedefconfig对配置文件进行清理，保留必须项，删除被依赖项，生成 defconfig 文件
make savedefconfig
# 使用 defconfig 文件覆盖板级配置文件中设置的U-Boot配置文件
cp -f defconfig <板级配置文件中设置的Uboot配置文件>
```

### 手动配置

:::info 注意

​	U-Boot 构建使用外部目录（`O=` 方式），编译输出位于 `source/bootloader/out/build/uboot`，源码目录下不会生成 `.config`。手动配置也应使用相同的外部目录，否则修改对实际编译不生效。

​	U-Boot 运行于 AArch32 状态，`ARCH` 必须使用 `arm`（与板级配置 `HR_ARCH_UBOOT` 一致），而不是内核使用的 `arm64`。

:::

首先进入`source/bootloader/uboot`目录，执行以下命令生成 `.config`（基础 defconfig 文件名见上方平台差异说明）：

<DocScope products="RDK S100">
```
# debug 模式
make ARCH=arm O=../out/build/uboot hobot_s100_defconfig
# release 模式
make ARCH=arm O=../out/build/uboot hobot_s100_rel_defconfig
```
</DocScope>

<DocScope products="RDK S600">
```
make ARCH=arm O=../out/build/uboot hobot_s600_defconfig
```
</DocScope>

命令执行后会在 `source/bootloader/out/build/uboot` 下生成 `.config`，输出示例如下：

```
  HOSTCC  scripts/basic/fixdep
  HOSTCC  scripts/kconfig/conf.o
  YACC    scripts/kconfig/zconf.tab.c
  LEX     scripts/kconfig/zconf.lex.c
  HOSTCC  scripts/kconfig/zconf.tab.o
  HOSTLD  scripts/kconfig/conf
#
# configuration written to .config
#
```

如果需要与实际编译一致的完整配置（含介质配置），直接执行以下合并命令（与 `mk_uboot.sh` 编译行为一致）：

<DocScope products="RDK S100">
```
make ARCH=arm O=../out/build/uboot hobot_s100_defconfig hobot_emmc.config
```
</DocScope>

<DocScope products="RDK S600">
```
make ARCH=arm O=../out/build/uboot hobot_s600_defconfig hobot_ufs.config
```
</DocScope>

然后执行以下命令打开图形化的配置界面进行 `U-Boot` 的选项参数配置：

```
make ARCH=arm O=../out/build/uboot menuconfig
```

在 menuconfig 的配置界面上完成配置后，选择 `Exit`退出，根据提示选择 `Yes` 或者`No`保存修改到`.config`文件中。

保存配置后，可以对比一下差异，再次确认一下修改是否符合预期：

<DocScope products="RDK S100">
```
diff ../out/build/uboot/.config configs/hobot_s100_defconfig
```
</DocScope>

<DocScope products="RDK S600">
```
diff ../out/build/uboot/.config configs/hobot_s600_defconfig
```
</DocScope>

如果修改正确，执行以下命令将配置保存回板级配置文件，实际编译使用的也是这份文件：

<DocScope products="RDK S100">
```bash
make ARCH=arm O=../out/build/uboot savedefconfig
# debug 模式
cp -f ../out/build/uboot/defconfig configs/hobot_s100_defconfig
# release 模式
cp -f ../out/build/uboot/defconfig configs/hobot_s100_rel_defconfig
```
</DocScope>

<DocScope products="RDK S600">
```bash
make ARCH=arm O=../out/build/uboot savedefconfig
cp -f ../out/build/uboot/defconfig configs/hobot_s600_defconfig
```
</DocScope>

## 配置 Kernel 选项参数

:::info 注意

​	kernel 具体使用的配置文件可以查看 `mk_kernel.sh` 脚本中的变量值：`KERNEL_DEFCONFIG`（基础配置）和 `HR_KERNEL_MEDIUM_CONFIG_FILE`（介质配置，按 build_params 配置文件中的 `RDK_DISK_MEDIUM` 变量选择）。

​	与 U-Boot 类似，实际编译时使用的 kernel 配置是「基础 defconfig + 存储介质 fragment」两步合并生成；release 模式（`RDK_DEVELOP_MODE=release`）下还会叠加 `drobot_s100_module_sig.config`（内核模块签名配置，两个平台同名）。

​	这些配置文件位于 `source/hobot-drivers/configs/` 目录下。

:::

各平台实际参与合并的配置文件如下：

<DocScope products="RDK S100">
- 基础配置：`drobot_s100_defconfig`
- 介质配置：`drobot_emmc.config`（默认存储介质 eMMC）
</DocScope>

<DocScope products="RDK S600">
- 基础配置：`drobot_s600_defconfig`
- 介质配置：`drobot_ufs.config`（默认存储介质 UFS）
</DocScope>

### 通过 mk_kernel 命令配置

`mk_kernel.sh`提供了以下命令帮助用户进行 Kernel 的选项配置，该命令会自动使用板级配置文件中设置的 Kernel 配置文件，在配置完成后，自动完成 savedefconfig 和保存工作。

```
./mk_kernel.sh menuconfig
```

命令执行成功后会打开 Kernel 图形化配置界面，您可以在这个交互界面下完成选项的配置，包括删除不需要的功能，启用需要的功能。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/image-s100-kernel.png" alt="menuconfig图形化配置界面" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

在 menuconfig 的配置界面上完成配置后，选择 `Exit`退出，根据提示选择 `Yes` 或者`No`保存修改到`.config`文件中。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development/image-20220518111506018.png" alt="menuconfig退出时保存配置提示" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

在配置退出后，会自动执行配置的文件的保存。自动完成的内容为：

```
# 调用savedefconfig对配置文件进行清理，保留必须项，删除被依赖项，生成 defconfig 文件
make savedefconfig
# 使用 defconfig 文件覆盖板级配置文件中设置的Kernel配置文件
cp defconfig <板级配置文件中设置的Kernel配置文件>
```

### 手动配置

通过`menuconfig`方式配置`kernel`与配置`U-Boot`的过程是一样的，但需要使用 `arm64` 架构和 kernel 自己的构建输出目录。

:::info 注意

​	kernel 构建使用外部目录（`O=` 方式），编译输出位于 SDK 根目录的 `out/build/kernel`，源码目录 `source/kernel` 下不会生成 `.config`。手动配置也应使用相同的外部目录，否则修改对实际编译不生效。

:::

首先进入`source/kernel`目录，然后按照以下步骤配置 `kernel` 选项。

- 生成 `.config`：加载基础 defconfig 并合并介质配置（与 `mk_kernel.sh` 实际编译行为一致）

<DocScope products="RDK S100">
```
make ARCH=arm64 O=../../out/build/kernel drobot_s100_defconfig drobot_emmc.config
```
</DocScope>

<DocScope products="RDK S600">
```
make ARCH=arm64 O=../../out/build/kernel drobot_s600_defconfig drobot_ufs.config
```
</DocScope>

- 执行以下命令来修改配置

```
make ARCH=arm64 O=../../out/build/kernel menuconfig
```

- 修改后，可以先看看修改后和修改前的差异

<DocScope products="RDK S100">
```
diff ../../out/build/kernel/.config ../hobot-drivers/configs/drobot_s100_defconfig
```
</DocScope>

<DocScope products="RDK S600">
```
diff ../../out/build/kernel/.config ../hobot-drivers/configs/drobot_s600_defconfig
```
</DocScope>

- 将新配置保存回板级配置文件，实际编译使用的也是这份文件

<DocScope products="RDK S100">
```
make ARCH=arm64 O=../../out/build/kernel savedefconfig
cp -f ../../out/build/kernel/defconfig ../hobot-drivers/configs/drobot_s100_defconfig
```
</DocScope>

<DocScope products="RDK S600">
```
make ARCH=arm64 O=../../out/build/kernel savedefconfig
cp -f ../../out/build/kernel/defconfig ../hobot-drivers/configs/drobot_s600_defconfig
```
</DocScope>

## 常见问题

### 重新编译系统时报「xxx is not clean, please run 'make mrproper'」

**原因**：源码目录下残留了上次编译生成的 `.config` 等文件，与当前配置不一致。

**解决**：在对应源码目录执行 `make distclean`（或 `make mrproper`）清理后再重新配置、编译。

### menuconfig 修改后重新编译配置丢失

**原因**：只修改了 `.config`，未保存回板级 `defconfig`，重新编译时被板级配置覆盖。

**解决**：用 `make savedefconfig` 生成 `defconfig` 文件，再覆盖 `hobot-drivers/configs/` 下对应的板级配置文件后重新编译。

## 相关文档

- [启动相关配置](/System_configuration/config_txt/boot_options)
- [搭建开发环境](/Advanced_development/environment_build/environment_build)
