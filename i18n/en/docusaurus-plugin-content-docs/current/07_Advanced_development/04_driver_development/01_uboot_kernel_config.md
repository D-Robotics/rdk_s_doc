---
sidebar_position: 1
---

# Configuring U-Boot and Kernel Option Parameters

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

In system software development, it is often necessary to configure the functional options of U-Boot and the kernel. This chapter introduces several commonly used configuration methods for users' reference.

**Target Audience**: Mode 3 deep-customization developers (commercial customers / deep teams) — BSP/build engineers who need to trim the kernel/U-Boot configuration or customize board-level `defconfig`.

**Prerequisites**: An SDK source compilation environment (`xbuild.sh`) has been set up; familiarity with the configuration mechanism of U-Boot and kernel `defconfig`.

**Relationships with Other Modules**: This page is the unified entry point for kernel-mode switches of each driver/function module, cross-linked with the "Kernel Configuration" sections of the driver pages under [5.4 Driver Development](/Advanced_development/driver_development); the final `defconfig` is used for image compilation.

<DocScope products="RDK S100">
The kernel configuration file for the S100 is `hobot-drivers/configs/drobot_s100_defconfig`. The U-Boot configuration file is specified by `HR_UBOOT_CONFIG_FILE` in the board-level `.board_config.mk`.
</DocScope>

<DocScope products="RDK S600">
The kernel configuration file for the S600 is `hobot-drivers/configs/drobot_s600_defconfig`. The U-Boot configuration file is specified by `HR_UBOOT_CONFIG_FILE` in the board-level `.board_config.mk`.
</DocScope>

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

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_x5/screenshot-20241120-201418.png" alt="menuconfig graphical configuration interface" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

After completing the configuration on the menuconfig interface, select `Exit` to quit, and choose `Yes` or `No` according to the prompts to save the changes to the `.config` file.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development/image-20220518111506018.png" alt="menuconfig save configuration prompt on exit" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

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

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/image-s100-kernel.png" alt="menuconfig graphical configuration interface" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

After completing the configuration on the menuconfig interface, select `Exit` to quit, and choose `Yes` or `No` according to the prompts to save the changes to the `.config` file.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development/image-20220518111506018.png" alt="menuconfig save configuration prompt on exit" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

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

## FAQ

### Recompilation reports "xxx is not clean, please run 'make mrproper'"

**Cause**: Files such as `.config` left over from the previous compilation remain in the source directory, inconsistent with the current configuration.

**Solution**: Run `make distclean` (or `make mrproper`) in the corresponding source directory to clean up, then reconfigure and recompile.

### Configuration lost after recompiling following menuconfig changes

**Cause**: Only `.config` was modified and not saved back to the board-level `defconfig`, so it was overwritten by the board-level configuration during recompilation.

**Solution**: Use `make savedefconfig` to generate the `defconfig` file, overwrite the corresponding board-level configuration file under `hobot-drivers/configs/`, and then recompile.

## Related Documentation

- [Boot-Related Configuration](../../02_System_configuration/05_config_txt/04_boot_options.md)
- [Set Up the Development Environment](../06_environment_build/01_environment_build.md)
