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

**与其他模块关系**：本页是各驱动/功能模块内核态开关的统一入口，与「5.4 驱动开发」各驱动篇的「内核配置」节互链；最终生成的 `defconfig` 供镜像编译使用。

<DocScope products="RDK S100">
S100 的内核配置文件为 `hobot-drivers/configs/drobot_s100_defconfig`，U-Boot 配置文件由板级 `.board_config.mk` 中的 `HR_UBOOT_CONFIG_FILE` 指定。
</DocScope>

<DocScope products="RDK S600">
S600 的内核配置文件为 `hobot-drivers/configs/drobot_s600_defconfig`，U-Boot 配置文件由板级 `.board_config.mk` 中的 `HR_UBOOT_CONFIG_FILE` 指定。
</DocScope>

## 配置 U-Boot 选项参数

:::info 注意

​	以下说明以修改 `hobot_s100_defconfig`配置文件为例。

​	U-Boot 具体使用的配置文件可以在`./xbuild.sh lunch`之后查看`bootloader/device/.board_config.mk`板级配置文件中 `HR_UBOOT_CONFIG_FILE`的变量值。

:::

### 通过 xbuild 命令配置

首先进入`source/bootloader`目录,目录结构如下

```
├── build # 编译系统代码目录，提供编译各个功能模块的shell脚本，编译用到的tools
├── device # 板级配置目录，每种硬件对应一份配置文件，可以设置编译选项和分区表等
├── miniboot  # 生成包含gpt、mbr、bl2、ddr、bl3x 一体的最小启动固件
├── out # 编译输出目录
└── uboot # U-Boot 源代码
```

`build/xbuild.sh`为主编译脚本，提供了以下命令帮助用户进行 U-Boot 的选项配置，该命令会自动使用板级配置文件中设置的 U-Boot 配置文件，在配置完成后，自动完成 savedefconfig 和保存工作。
```
./xbuild.sh uboot menuconfig
```

命令执行成功后会打开 U-Boot 图形化配置界面，您可以在这个交互界面下完成选项的配置，包括删除不需要的功能和启用需要的功能。

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

首先进入`source/bootloader/uboot`目录，执行`make ARCH=arm64 hobot_s100_defconfig `。因为`make`命令将首先执行顶层目录下的 Makefile 文件。其中对于以 config 结尾的目标都有一个共同的入口：

```makefile
%config: scripts_basic outputmakefile FORCE
        $(Q)$(MAKE) $(build)=scripts/kconfig $@
```

展开后的执行命令是：

```
make -f ./scripts/Makefile.build obj=scripts/kconfig hobot_s100_defconfig
```

本命令执行后会在`U-Boot`的源码根目录下生成 `.config`的文件。

```bash
make ARCH=arm64 hobot_s100_defconfig

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

然后就可以执行`make ARCH=arm64 menuconfig`打开图形化的配置界面进行`U-Boot`的选项参数配置。

在 menuconfig 的配置界面上完成配置后，选择 `Exit`退出，根据提示选择 `Yes` 或者`No`保存修改到`.config`文件中。

保存配置后，可以执行命令 `diff .config configs/hobot_s100_defconfig` 对比一下差异，再次确认一下修改是否符合预期。

如果修改正确，请执行 `cp .config configs/hobot_s100_defconfig`替换默认的配置文件。

清理源码目录下的 .config 等文件，否则在重新编译系统时会提示需要 xxx is not clean, please run 'make mrproper'
```bash
make distclean
# 或者
make mrproper
```

## 配置 Kernel 选项参数

:::info 注意

​	以下说明以修改 `drobot_s100_defconfig`配置文件为例。

​	kernel 具体使用的配置文件可以查看 `mk_kernel.sh` 脚本中 `kernel_config_file` 的变量值。

:::

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

通过`menuconfig`方式配置`kernel`与配置`U-Boot`的过程是一样的。命令执行过程如下：

首先进入`source/kernel`目录，然后按照以下步骤配置`kernel`选项。

- 使用`drobot_s100_defconfig`来配置生成`.config`，如果源码做过全量编译，则`.config`文件会配置好

```
make ARCH=arm64 drobot_s100_defconfig
```

- 执行以下命令来修改配置

```
make ARCH=arm64 menuconfig
```

- 修改后，可以先看看修改后和修改前的差异

```
diff .config hobot-drivers/configs/drobot_s100_defconfig
```

- 把新配置覆盖`drobot_s100_defconfig`

```
cp .config hobot-drivers/configs/drobot_s100_defconfig
```

- 清理源码目录下的 .config 等文件，否则在重新编译系统时会提示需要 xxx is not clean, please run 'make mrproper'

```
make distclean
# 或者
make mrproper
```

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
