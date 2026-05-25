---
sidebar_position: 1
---

# Configuring U-Boot and Kernel Option Parameters

In system software development, it is often necessary to configure the functional options of u-boot and the kernel. This chapter introduces several commonly used configuration methods for users' reference.

## Configuring U-Boot Option Parameters

:::info Note

​	The following instructions use the modification of the `hobot_s100_defconfig` configuration file as an example.

​	The specific configuration file used by U-Boot can be found by checking the value of the `HR_UBOOT_CONFIG_FILE` variable in the board-level configuration file `bootloader/device/.board_config.mk` after running `./xbuild.sh lunch`.

:::

### Configuring via the xbuild Command

First, navigate to the `source/bootloader` directory. The directory structure is as follows:

```
├── build # Compilation system code directory, provides shell scripts for compiling various functional modules, and tools used for compilation
├── device # Board-level configuration directory, each hardware has its own configuration file, where compilation options and partition tables can be set
├── miniboot # Generates a minimal boot firmware that includes gpt, mbr, bl2, ddr, bl3x
├── out # Compilation output directory
└── uboot # U-Boot source code
```

`build/xbuild.sh` is the main compilation script and provides the following command to help users configure U-Boot options. This command automatically uses the U-Boot configuration file set in the board-level configuration file, and after configuration, automatically completes savedefconfig and saves the work.
```
./xbuild.sh uboot menuconfig
```

After the command executes successfully, the U-Boot graphical configuration interface will open. You can configure options in this interactive interface, including removing unnecessary features and enabling required ones.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_x5/screenshot-20241120-201418.png" alt="image-20220518111319607" style={{ width: '100%' }} />

After completing the configuration on the menuconfig interface, select `Exit` to quit, and choose `Yes` or `No` according to the prompts to save the changes to the `.config` file.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development/image-20220518111506018.png" alt="image-20220518111506018" style={{ width: '100%' }} />

After exiting the configuration, the configuration file will be automatically saved. The automatic process includes:

```
# Call savedefconfig to clean the configuration file, retain necessary items, remove dependencies, and generate a defconfig file
make savedefconfig
# Overwrite the U-Boot configuration file set in the board-level configuration file with the defconfig file
cp -f defconfig <U-Boot configuration file set in the board-level configuration file>
```

### Manual Configuration

First, navigate to the `source/bootloader/uboot` directory and execute `make ARCH=arm64 hobot_s100_defconfig`. The `make` command will first execute the Makefile in the top-level directory. For targets ending with `config`, there is a common entry point:

```makefile
%config: scripts_basic outputmakefile FORCE
        $(Q)$(MAKE) $(build)=scripts/kconfig $@
```

The expanded execution command is:

```
make -f ./scripts/Makefile.build obj=scripts/kconfig hobot_s100_defconfig
```

After executing this command, a `.config` file will be generated in the root directory of the U-Boot source code.

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

Then, execute `make ARCH=arm64 menuconfig` to open the graphical configuration interface and configure U-Boot option parameters.

After completing the configuration on the menuconfig interface, select `Exit` to quit, and choose `Yes` or `No` according to the prompts to save the changes to the `.config` file.

After saving the configuration, you can run the command `diff .config configs/hobot_s100_defconfig` to compare the differences and confirm that the changes meet your expectations.

If the modifications are correct, execute `cp .config configs/hobot_s100_defconfig` to replace the default configuration file.

Clean up files like `.config` in the source directory; otherwise, when recompiling the system, you will be prompted that "xxx is not clean, please run 'make mrproper'".
```bash
make distclean
# or
make mrproper
```

## Configuring Kernel Option Parameters

:::info Note

​	The following instructions use the modification of the `drobot_s100_defconfig` configuration file as an example.

​	The specific configuration file used by the kernel can be found by checking the value of the `kernel_config_file` variable in the `mk_kernel.sh` script.

:::

### Configuring via the mk_kernel Command

`mk_kernel.sh` provides the following command to help users configure Kernel options. This command automatically uses the Kernel configuration file set in the board-level configuration file, and after configuration, automatically completes savedefconfig and saves the work.

```
./mk_kernel.sh menuconfig
```

After the command executes successfully, the Kernel graphical configuration interface will open. You can configure options in this interactive interface, including removing unnecessary features and enabling required ones.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/image-s100-kernel.png" alt="image-20220518111319607" style={{ width: '100%' }} />

After completing the configuration on the menuconfig interface, select `Exit` to quit, and choose `Yes` or `No` according to the prompts to save the changes to the `.config` file.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development/image-20220518111506018.png" alt="image-20220518111506018" style={{ width: '100%' }} />

After exiting the configuration, the configuration file will be automatically saved. The automatic process includes:

```
# Call savedefconfig to clean the configuration file, retain necessary items, remove dependencies, and generate a defconfig file
make savedefconfig
# Overwrite the Kernel configuration file set in the board-level configuration file with the defconfig file
cp defconfig <Kernel configuration file set in the board-level configuration file>
```

### Manual Configuration

Configuring the kernel via `menuconfig` follows a similar process to configuring U-Boot. The command execution process is as follows:

First, navigate to the `source/kernel` directory, then follow these steps to configure kernel options.

- Use `drobot_s100_defconfig` to generate `.config`. If a full compilation of the source code has been performed, the `.config` file will already be configured.

```
make ARCH=arm64 drobot_s100_defconfig
```

- Execute the following command to modify the configuration:

```
make ARCH=arm64 menuconfig
```

- After modification, you can check the differences between the modified and unmodified versions:

```
diff .config hobot-drivers/configs/drobot_s100_defconfig
```

- Overwrite `drobot_s100_defconfig` with the new configuration:

```
cp .config hobot-drivers/configs/drobot_s100_defconfig
```

- Clean up files like `.config` in the source directory; otherwise, when recompiling the system, you will be prompted that "xxx is not clean, please run 'make mrproper'".

```
make distclean
# or
make mrproper
```