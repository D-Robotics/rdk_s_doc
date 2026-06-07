# 7.1.3 RDK S100 Hardware Bringup

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Advanced_development/hardware_development/rdk_s100_board_bringup

The S100 boardid is determined by the combined effect of ADC0, ADC1, ADC3, and ADC4. Among these, ADC0 and ADC1 are used for Donggua hardware differentiation and cannot be modified by the customer; ADC3 is used to identify the power-up sequence of Acore peripherals, allowing customers to customize the power-up sequence and modify the ADC3 voltage divider resistor accordingly; ADC4 is used to identify the hardware version. For details on how to set the ADC voltage divider resistors, please contact the Donggua FAE team for support.

Each ADC channel has 16 levels, corresponding to 0x0~0xF. The boardid of the S100 is a 16-bit unsigned integer, for example `0x6A84` , where boardid[15 :12 ] corresponds to ADC0 as 0x6; boardid[11 :8 ] corresponds to ADC1 as 0xA; boardid[7 :4 ] corresponds to ADC3 as 0x8; boardid[3 :0 ] corresponds to ADC4 as 0x4.

The boardid is formed by ADC sampling and implemented in SBL. This part is closed-source code, and customers do not need to worry about it.

## Adding Hardware Under MCU

Note
What needs to be done on the MCU side is to implement your own power-up method for Acore peripherals. If you are following Donggua's design, customers do not need to modify the MCU and can ignore this part.

### Adding Acore Peripheral Power Management Code

#### Boot Stage

In the file `mcu/McalCdd/Common/Power/S100/scp/boot/src/main_top_init.c` , within the function `Rdk_S100_Peri_Pwr_Init` , add the power-up code.

```c
static Std_ReturnType Rdk_S100_Peri_Pwr_Init(void)
{
    Std_ReturnType CheckStatus = (Std_ReturnType)E_OK;
    uint32 AdcCode3 = 0U;

    AdcCode3 = *((uint32 *)AON_SRAM_ADC + 3U);

    switch (AdcCode3)
    {
        case 0x6:
        case 0x7:
            CheckStatus = Rdk_S100_Peri_Pwr_Init_V121();
            break;
        case 0x8:
            CheckStatus = Rdk_S100_Peri_Pwr_Init_V0P5();
            break;
        default:
            break;
    }

    return CheckStatus;
}
```

As shown in the code, different Acore peripheral power-up flows are followed based on the ADC3 level. If the customer customizes the Acore peripheral power-up method, they need to assign a new ADC3 level and implement their own power-up method.

#### Power-Down Stage of reboot/suspend

In this stage, power-down operations need to be implemented.

In the file `mcu/McalCdd/Common/Power/S100/scp/Drivers/src/Pmu.c` , within the function `Pmu_MainDomainPeriOff` , add the power-down code.

```c
Std_ReturnType Pmu_MainDomainPeriOff(void)
{
    Std_ReturnType CheckStatus = (Std_ReturnType)E_OK;
    uint32 AdcCode3 = 0U;

    AdcCode3 = *((uint32 *)AON_SRAM_ADC + 3U);

    switch (AdcCode3)
    {
        case 0x6:
        case 0x7:
            CheckStatus = Pmu_MainDomainPeriOffV121();
            break;
        case 0x8:
            CheckStatus = Pmu_MainDomainPeriOffV0P5();
            break;
        default:
            break;
    }

    return CheckStatus;
}
```

#### Power-Up Stage of reboot/resume

In this stage, power-up operations need to be implemented.

In the file `mcu/McalCdd/Common/Power/S100/scp/Drivers/src/Pmu.c` , within the function `Pmu_MainDomainPeriOn` , add the power-up code.

```c
static Std_ReturnType Pmu_MainDomainPeriOn(void)
{
    Std_ReturnType CheckStatus = (Std_ReturnType)E_OK;
    uint32 AdcCode3 = 0U;

    AdcCode3 = *((uint32 *)AON_SRAM_ADC + 3U);

    switch (AdcCode3)
    {
        case 0x6:
        case 0x7:
            CheckStatus = Pmu_MainDomainPeriOnV121();
            break;
        case 0x8:
            CheckStatus = Pmu_MainDomainPeriOnV0P5();
            break;
        default:
            break;
    }

    return CheckStatus;
}
```

## Adding Hardware Under spl and Uboot

spl refers to the spl under Uboot.

### Adding Configuration Files

The Uboot configuration files are located in the SDK directory `source/bootloader/uboot/configs` . The configuration file for debug mode is `hobot_s100_defconfig` , and for release mode it is `hobot_s100_rel_defconfig` .

The Uboot configuration file is specified in the bootloader board-level configuration file. For the debug configuration file, the path is `source/bootloader/device/rdk/s100/board_s100_debug.mk` , and the variable `HR_UBOOT_CONFIG_FILE` specifies the Uboot configuration file.

```shell
# hobot_s100_defconfig
...
export HR_UBOOT_CONFIG_FILE=hobot_s100_defconfig
export HR_UBOOT_OTA_CONFIG_FILE=hobot_s100_ota.config
export HR_ARCH_UBOOT="arm"
...
```

If customers have requirements, they can generate their own Uboot config file and replace it as described above. Generally, reusing Donggua's configuration is sufficient.

### Adding Device Trees

The Uboot device tree file is located in the SDK directory `source/bootloader/uboot/arch/arm/dts/drobot-s100-rdk.dts` . The device tree is specified by the variable `CONFIG_DEFAULT_DEVICE_TREE` in the configuration file.

```shell
# hobot_s100_defconfig
...
CONFIG_DEFAULT_DEVICE_TREE="drobot-s100-rdk"
...
```

If customers have requirements, they can add their own device tree files, ensuring to `#include "drobot-s100-soc.dtsi"` in their device tree file, then override it later, and finally replace it as described above. Generally, reusing Donggua's configuration is sufficient. When adding your own device tree file, ensure it is included in the Makefile for compilation.

### Adding boardid

1. Add socname, hwname, board version, and pcie mode based on boardid.
Add board information to the `g_board_info` array in the file `source/bootloader/uboot/arch/arm/mach-hobot/super/boot_info.c` .

```c
/* arch/arm/mach-hobot/super/boot_info.c */
/* hb_boardinfo_t structure information
struct hb_boardinfo_t {
    uint32_t board_id;
    char* soc_name;
    char* hw_name;
    char* pcie_mode;
    char* version;
};
*/
struct hb_boardinfo_t g_board_info[BOARD_TYPE_NUM] = {
        /* S100P */
        {0x6460, "S100P", "RDK", "rc", "V1.21"},
        {0x6470, "S100P", "RDK", "rc", "V1.2"},
        {0x6484, "S100P", "RDK", "rc", "V0P5"},
        {0x6485, "S100P", "RDK", "rc", "V0P6"},
        {0x6486, "S100P", "RDK", "rc", "V1P0"},
        {0x6487, "S100P", "RDK", "rc", "V1P1"},

        {0x6560, "S100P", "RDK", "ep", "V1.21"},
        {0x6570, "S100P", "RDK", "ep", "V1.2"},
        {0x6584, "S100P", "RDK", "ep", "V0P5"},
        {0x6585, "S100P", "RDK", "ep", "V0P6"},
        {0x6586, "S100P", "RDK", "ep", "V1P0"},
        {0x6587, "S100P", "RDK", "ep", "V1P1"},

        /* S100 */
        {0x6A60, "S100", "RDK", "rc", "V1.21"},
        {0x6A70, "S100", "RDK", "rc", "V1.2"},
        {0x6A84, "S100", "RDK", "rc", "V0P5"},
        {0x6A85, "S100", "RDK", "rc", "V0P6"},
        {0x6A86, "S100", "RDK", "rc", "V1P0"},
        {0x6A87, "S100", "RDK", "rc", "V1P1"},

        {0x6B60, "S100", "RDK", "ep", "V1.21"},
        {0x6B70, "S100", "RDK", "ep", "V1.2"},
        {0x6B84, "S100", "RDK", "ep", "V0P5"},
        {0x6B85, "S100", "RDK", "ep", "V0P6"},
        {0x6B86, "S100", "RDK", "ep", "V1P0"},
        {0x6B87, "S100", "RDK", "ep", "V1P1"},
};
```

1. Add Kernel configuration based on boardid.
Add Kernel configuration to the `hb_super_btype_list` array in the file `source/bootloader/uboot/arch/arm/mach-hobot/super/super_board.c` .

```c
/* arch/arm/mach-hobot/super/super_board.c */
/* hb_super_btype_node structure
struct hb_super_btype_node {
        uint32_t boardid_adc0;
        uint32_t boardid_adc1;
        uint32_t boardid_adc3;
        uint32_t boardid_adc4;
        char fdt_feat[32];
        char pxe_label[32];
};
*/

const static struct hb_super_btype_node hb_super_btype_list[] = {
        {0x6, 0x4, 0x6, 0x0, "rdk-s100-v1-21", "drobot-s100-rdk-v1-21-kernel"},
        {0x6, 0x5, 0x6, 0x0, "rdk-s100-v1-21", "drobot-s100-rdk-v1-21-kernel"},
        {0x6, 0xA, 0x6, 0x0, "rdk-s100-v1-21", "drobot-s100-rdk-v1-21-kernel"},
        {0x6, 0xB, 0x6, 0x0, "rdk-s100-v1-21", "drobot-s100-rdk-v1-21-kernel"},

        {0x6, 0x4, 0x7, 0x0, "rdk-s100-v1-2", "drobot-s100-rdk-v1-2-kernel"},
        {0x6, 0x5, 0x7, 0x0, "rdk-s100-v1-2", "drobot-s100-rdk-v1-2-kernel"},
        {0x6, 0xA, 0x7, 0x0, "rdk-s100-v1-2", "drobot-s100-rdk-v1-2-kernel"},
        {0x6, 0xB, 0x7, 0x0, "rdk-s100-v1-2", "drobot-s100-rdk-v1-2-kernel"},

        {0x6, 0x4, 0x8, 0x4, "rdk-s100p-v0p5", "drobot-s100p-rdk-v0p5-kernel"},
        {0x6, 0x5, 0x8, 0x4, "rdk-s100p-v0p5", "drobot-s100p-rdk-v0p5-kernel"},
        {0x6, 0xA, 0x8, 0x4, "rdk-s100-v0p5", "drobot-s100-rdk-v0p5-kernel"},
        {0x6, 0xB, 0x8, 0x4, "rdk-s100-v0p5", "drobot-s100-rdk-v0p5-kernel"},

        {0x6, 0x4, 0x8, 0x5, "rdk-s100p-v0p6", "drobot-s100p-rdk-v0p6-kernel"},
        {0x6, 0x5, 0x8, 0x5, "rdk-s100p-v0p6", "drobot-s100p-rdk-v0p6-kernel"},
        {0x6, 0xA, 0x8, 0x5, "rdk-s100-v0p6", "drobot-s100-rdk-v0p6-kernel"},
        {0x6, 0xB, 0x8, 0x5, "rdk-s100-v0p6", "drobot-s100-rdk-v0p6-kernel"},

        {0x6, 0x4, 0x8, 0x6, "rdk-s100p-v1p0", "drobot-s100p-rdk-v1p0-kernel"},
        {0x6, 0x5, 0x8, 0x6, "rdk-s100p-v1p0", "drobot-s100p-rdk-v1p0-kernel"},
        {0x6, 0xA, 0x8, 0x6, "rdk-s100-v1p0", "drobot-s100-rdk-v1p0-kernel"},
        {0x6, 0xB, 0x8, 0x6, "rdk-s100-v1p0", "drobot-s100-rdk-v1p0-kernel"},

        {0x6, 0x4, 0x8, 0x7, "rdk-s100p-v1p1", "drobot-s100p-rdk-v1p1-kernel"},
        {0x6, 0x5, 0x8, 0x7, "rdk-s100p-v1p1", "drobot-s100p-rdk-v1p1-kernel"},
        {0x6, 0xA, 0x8, 0x7, "rdk-s100-v1p1", "drobot-s100-rdk-v1p1-kernel"},
        {0x6, 0xB, 0x8, 0x7, "rdk-s100-v1p1", "drobot-s100-rdk-v1p1-kernel"},
};
```

In `hb_super_btype_node` , `fdt_feat` is the name of the Kernel dtb, and `pxe_label` is the Kernel configuration in extlinux. The names must correspond to each other.

## Adding Hardware Under Kernel

### Adding Configuration Files

The Kernel configuration files are located in the SDK directory `source/hobot-drivers/configs` . The configuration file corresponding to the S100 is `drobot_s100_defconfig` .

The Kernel configuration file is specified in mk_kernel.sh.

```shell
# mk_kernel.sh
...
export KERNEL_DEFCONFIG=drobot_s100_defconfig
...
```

If customers have requirements, they can generate their own Kernel config file and replace it as described above. Generally, reusing Donggua's configuration is sufficient.

### Adding Device Trees

The Kernel device tree files are located in the SDK directory `source/hobot-drivers/kernel-dts` .

If customers have requirements, they can add their own device tree files, ensuring to `#include "rdk-v0p5.dtsi"` in their device tree file, then override it later. Generally, reusing Donggua's configuration is sufficient. When adding your own device tree file, ensure it is included in the Makefile for compilation.

The naming of the dtb needs to correspond to the fdt_feat in the `hb_super_btype_list` array in `source/bootloader/uboot/arch/arm/mach-hobot/super/super_board.c` .

### extlinux Configuration

In the S100, Uboot parses the Kernel configuration based on extlinux and selects the corresponding dtb, Kernel image, and initramfs to load.

The extlinux file is located at `source/kernel/scripts/package/rdk_extlinux` .

Take the RDK-S100-V1P1 version as an example:

```shell
label drobot-s100-rdk-v1p1-kernel
    kernel /vmlinuz-KERNEL_VERSION
    fdt /hobot/rdk-s100-v1p1.dtb
    initrd /initrd.img-KERNEL_VERSION
```

The `label` must correspond to the `pxe_label` in the `hb_super_btype_list` array in `source/bootloader/uboot/arch/arm/mach-hobot/super/super_board.c` .

The `rdk-s100-v1p1.dtb` in `fdt` must be consistent with the naming of the Kernel device tree to be used.

## Loading ko Based on boardid

In the file `source/hobot-utils/debian/usr/bin/hobot-loadko.sh` , it is necessary to choose whether to load the pcie driver and asm3042 firmware based on the boardid.

```shell
boardid_sys_path="/sys/class/boardinfo/adc_boardid"
if [ -f "$boardid_sys_path" ]; then
        boardid="$(cat $boardid_sys_path)"
        if [[ "$boardid" =~ ^0x(64|65|6A|6B)[0678][04567]$ ]];then
                case ${boardid} in
                        *"0")
                                # Check if TPIC2810 exists, if so, manual reset USB controller
                                if [ -f /sys/class/i2c-adapter/i2c-2/2-0060/name ] &&
                                   [ "$(cat /sys/class/i2c-adapter/i2c-2/2-0060/name)" = "tpic2810" ];then
                                        /usr/bin/pcie-usb-reset.sh
                                fi
                                /usr/bin/start-pcie.sh &
                        ;;
                        *"7") ;&
                        *"6") ;&
                        *"5") ;&
                        *"4")
                                modprobe hobot-pcie-rc
                                # check & update asm3042 firmware
                                /usr/bin/update-asm3042-firmware.sh
                                ;;
                        *)
                                ;;
                esac
        elif [[ "$boardid" =~ ^0x(51)[1234567][01234567][1234567][1234567].$ ]];then
                # S600 Boardid rules
                modprobe hobot-pcie-rc
        else
                echo "<$LOG_WARN>Unsupported boardid:$boardid, PCIE not Initialized!" > /dev/kmsg
        fi
fi
```

## On-Board Debugging

When debugging on the board, it is recommended to use the debug image, as the release image disables most logs, making it impossible to locate issues when problems occur.

Method to compile the debug image:

In the script `pack_image.sh` , the default configuration selects the beta configuration.

### Check if the Boot Information Matches Expectations

- The SBL log will print the ADC level values.

```shell
...
[00.023702 0]Adc:0:1116:0x6
[00.024039 0]Adc:1:2403:0xa
[00.024376 0]Adc:2:1765:0x8
[00.024712 0]Adc:3:1738:0x8
[00.025049 0]Adc:4:632:0x4
...
```

- The spl log will print the ADC level values.

```shell
U-Boot SPL 2022.04-00905-g5272120b20 (Feb 28 2026 - 08:51:01 +0800)
...
boot_flags.boardid_adc_ch0 0x6
boot_flags.boardid_adc_ch1 0xa
boot_flags.boardid_adc_ch3 0x8
boot_flags.boardid_adc_ch4 0x4
...
```

- The Uboot log will print the Model, which can determine whether it is consistent with the definition in the Uboot dts.

```shell
U-Boot 2022.04-00905-g5272120b20 (Feb 28 2026 - 08:51:01 +0800)
...
Model: D-Robotics S100 SIP Board
...
```

- The Uboot log will print the boardid, for example, 6a84 below.

```shell
U-Boot 2022.04-00905-g5272120b20 (Feb 28 2026 - 08:51:01 +0800)
...
system_slot: 0 adc_boardinfo: 6a84
...
```

- The Uboot log will print the label corresponding to extlinux, as well as the Kernel image, dtb, and initramfs.

```shell
U-Boot 2022.04-00905-g5272120b20 (Feb 28 2026 - 08:51:01 +0800)
...
Found /extlinux/extlinux.conf
Retrieving file: /extlinux/extlinux.conf
3:      drobot-s100-rdk-v0p5-kernel
Retrieving file: /initrd.img-6.1.158-rt58-DR-4.0.5-2602251559-g9f678e-g9b251c
Retrieving file: /vmlinuz-6.1.158-rt58-DR-4.0.5-2602251559-g9f678e-g9b251c
Retrieving file: /hobot/rdk-s100-v0p5.dtb
...
```

- Check the board info in bootargs.
Mainly `hobotboot.socname=S100``board.hwname=RDK``board.ver=V0P5``board.pcie_mode=rc` , etc., to see if they are consistent with the definitions in Uboot.

```shell
root@ubuntu:~# cat /proc/cmdline
console=ttyS0,921600n8 systemd.show-status=auto loglevel=1 hobot.kernel_in=nvme0 hobotboot.socname=S100 board.hwname=RDK board.ver=V0P5 board.pcie_mode=rc hobotboot.reason=hwreset hobotboot.slot_suffix=_a hobotboot.mode=normal hobotboot.secureboot=1 hobotboot.bootcount=1 systemd.unified_cgroup_hierarchy=0 hobotboot.serial=060c049530906941  clk_ignore_unused earlycon=uart8250,mmio32,0x394B0000 no_console_suspend root=/dev/ram0 rdinit=/init  rootwait net.ifnames=0 root=/dev/nvme0n1p17 rw rootfstype=ext4 rootwait
```

- View board info in the Kernel command line.

```shell
root@ubuntu:~# cd /sys/class/boardinfo/
root@ubuntu:/sys/class/boardinfo# ls
adc_boardid  board_name  bootdevice_name  chip_id  ddr_size  ddr_type  hw_name  hw_version  pcie_mode  soc_gen  soc_name  soc_uid
root@ubuntu:/sys/class/boardinfo# cat *
0x6A84
S100_RDK_V0P5
nvme0
21845505
0x2fff
LPDDR5
RDK
V0P5
rc
s100
S100
060c0495309069410f94dc4c00001079
```
