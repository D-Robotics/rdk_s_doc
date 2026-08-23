---
sidebar_position: 2
sidebar_products: RDK S600
---

# RDK S600 Hardware Bringup

The S600 boardid is determined by the combined effect of ADC0, ADC1, ADC2, ADC4, ADC5, and ADC6. Among them, ADC0, ADC1, and ADC2 are used for D-Robotics hardware differentiation and cannot be modified by customers. ADC4 is used to differentiate the module base board, ADC5 is used to differentiate the base board version, and ADC4 and ADC5 can be modified by users. ADC6 is reserved and forced to be 0x1. For details on how to set the voltage divider resistors for the ADC, please contact the D-Robotics FAE team for support.

ADC0, ADC1, and ADC2 channels have a total of 8 levels, corresponding to 0x0-0x7. ADC4 and ADC5 channels have a total of 7 levels, corresponding to 0x0-0x6. The boardid of the S600 is a 28-bit unsigned integer, for example `0x5131310`, where boardid[27:24] corresponds to ADC0, which is 0x5; boardid[23:20] corresponds to ADC1, which is 0x1; boardid[19:16] corresponds to ADC2, which is 0x3; boardid[15:12] corresponds to ADC4, which is 0x1; boardid[11:8] corresponds to ADC5, which is 0x3; boardid[7:4] corresponds to ADC6, which is 0x1; boardid[3:0] defaults to 0x0.

The boardid is formed by ADC sampling and implemented in the SBL. The corresponding code path is `mcu/BootLoader/BoardId/src/Board_Id_Matrixp.c`, function `SBL_GetADC_To_AonSram`.

## Adding New Hardware Under MCU

:::info Note

What needs to be done on the MCU side is to implement your own Acore peripheral power-on method. If you are following D-Robotics' design, customers do not need to modify the MCU and can ignore this part.

:::

### Add Acore Power Management Code

#### Boot Stage

In the file `mcu/BootLoader/Sys/src/Sys_InitSocEarly.c`, within the function `Sys_Lld_SetPmicGpio`, add the PMIC EN PIN setting code.

```c
void Sys_Lld_SetPmicGpio(void)
{
    ...
    #if ((SOC_TYPE == SOC_TYPE_S600) || (SOC_TYPE == SOC_TYPE_S300))
    uint32 boardid = 0U;

    //coverity[misra_c_2012_rule_11_4_violation:SUPPRESS], ## violation reason SYSSW_V_11.4_01
    //coverity[misra_c_2012_rule_18_4_violation:SUPPRESS], ## violation reason SYSSW_V_18.4_01
    boardid = *((uint32 *)AON_SRAM_ADC);

    LogSync("boardid 0x%x\r\n",boardid);
    switch (boardid)
    {
        case 0x501FFF0U:
        case 0x502FFF0U:
        case 0x503FFF0U:
        case 0x504FFF0U:
        case 0x505FFF0U:
        case 0x506FFF0U:
        case 0x507FFF0U:
        case 0x5111110U:
        case 0x5121210U:
        case 0x5131310U:
            /*MAIN_DRAM_PRE_PWR_EN_M*/
            Sys_Lld_SetBits32(0x23202000U, BIT_12);
            Sys_Lld_SetBits32(0x23202004U, BIT_12);
            ...
            break;
        default:
            LogSync("can't find boardid\r\n");
            break;
    }
#endif
}
```

If you are fully using D-Robotics' power logic, you can place your boardid under the boardid cases starting with 0x5 in the code. If it is a custom boardid, you need to create a new case branch.

#### Reboot/Suspend Scenarios

In the PMIC configuration of the D-Robotics S600 MD, located at `mcu/Config/McalCdd/gen_s600_md/Pmic/src/Pmic_PBcfg.c`, add the PIN information in `PmicGpioConfig`.

```c
const Pmic_GpioConfigType PmicGpioConfig[PMIC_GPIO_INIT_CONFIG_NUM] = {
    [PMIC_DEV_ID_0] = {
        .Name = "VR5510",
        .Type = PMIC_SUPPLY_FOR_MCU,
        .GpioSite = 0U,
        .LpGpioSite = 0U,
    },
    [PMIC_DEV_ID_1] = {
        .Name = "MAIN_DRAM_PRE_PWR_EN_M",
        .Type = PMIC_SUPPLY_FOR_MCUDEVICE,
        .GpioSite = (PMIC_GPIO_TYPE_PINKEEP << PMIC_LLD_GPIO_CLASS_OFFSET) | PMIC_PINKEEP_GPIO_MAIN_DRAM_PRE_PWR_EN_M,
        .GpioEnableLevel = 1U,
        .GpioEnDelay = 15000U,
        .GpioDisDelay = 0U,
    },
    ...
}
```

**If the user uses the PMIC configuration of the D-Robotics S600 MD, they need to modify it according to their own power solution.**

### Add Version Information

1. In `mcu/Service/Board/BoardInfo/inc/McuVersion.h`, add boardid information.

```c
#elif ((SOC_TYPE == SOC_TYPE_S600) || (SOC_TYPE == SOC_TYPE_S300))
  #define RDK_S600_V1_0                        0x5131310
  #define RDK_S600_V1_0_NAME                   "Matrix_V2.0"
#endif
```

- `RDK_S600_V1_0` is defined as the new boardid.
- `RDK_S600_V1_0_NAME` is defined as the new hardware name.

2. In `mcu/Service/Board/BoardInfo/src/Hobot_Board_Info.c`, add boardinfo.

```c
#elif ((SOC_TYPE == SOC_TYPE_S600) || (SOC_TYPE == SOC_TYPE_S300))
static Hobot_BoardInfo_t g_BoardInfo[BOARD_TYPE_NUM] = {
    ...
    /* RDK S600 V1.0 */
    {0x5131310, "S600", "RDK", "", "V1.0"},
    ...
```

- `0x5131310` is the new boardid.
- `S600` is defined as the chip name.
- `RDK` is defined as the hardware name.
- `V1.0` is defined as the hardware version.

3. In `mcu/Service/Board/BoardInfo/src/McuVersion.c`, add version comparison.

```c
static int BoardId_Check(uint32 BoardId)
{
    ...
#elif ((SOC_TYPE == SOC_TYPE_S600) || (SOC_TYPE == SOC_TYPE_S300))
    switch(BoardId)
    {
        case RDK_S600_V1_0:
            result = Compare_board_id(RDK_S600_V1_0_NAME);
            break;
        ...
    }
#endif
}
```

### Disable SLEEP KEY Handling

In the RDK S600 design, there is a SLEEP KEY whose functions are to put the device to sleep via key press and to enter the uboot fastboot state via key press during startup. The PIN used for the SLEEP KEY is AON GPIO 8. The other functions of this PIN are SPI8_CSN1 or CAN11_RX. If you are using any of these functions, you need to make the following modifications in the RDK SDK code to ensure normal startup.

In the MCU0 code, the interrupt status of AON GPIO 8 is checked to decide whether to enter sleep mode. The interrupt is registered in the ICU module, so you need to disable the interrupt for AON GPIO 8 in the ICU module.

In the `Icu_Gpio_ChannelConfig_PB` array in the MCU code file `mcu/Config/McalCdd/gen_s600_md/Icu/src/Icu_PBCfg.c`, make the following settings:

```c
        ...
         /** @brief gpio mod 4 channel 8 */
        {
            .PinId = 8,
            .instanceNo = 4,
            .DefaultStartEdge = GPIO_ICU_FALLING_EDGE,
            .NotificationEnable = FALSE,
            .GpioChannelNotification = Icu_Gpio_Channel_4_8_ISR,
            .IntEnable = FALSE,
            .IntMask = TRUE,
        },
        ...
```

- Change `NotificationEnable` to `FALSE`.
- Change `IntEnable` to `FALSE`.
- Change `IntMask` to `TRUE`.

## Adding New Hardware Under SPL and U-Boot

The SPL is the SPL under U-Boot.

### Add Configuration File

The U-Boot configuration file is located in the SDK directory `source/bootloader/uboot/configs`, with the corresponding configuration file `hobot_s600_defconfig`.

The U-Boot configuration file is specified in the bootloader board-level configuration file. For the debug configuration file, the path is `source/bootloader/device/rdk/s600/board_s600_debug.mk`, with the variable `HR_UBOOT_CONFIG_FILE` specifying the U-Boot configuration file.

```shell
# hobot_s600_defconfig
...
export HR_UBOOT_CONFIG_FILE=hobot_s600_defconfig
export HR_UBOOT_OTA_CONFIG_FILE=hobot_s600_ota.config
export HR_ARCH_UBOOT="arm"
...
```

If customers need to generate their own U-Boot config file, they can replace it as described above. Generally, reusing D-Robotics' configuration is sufficient.

### Add Device Tree

The U-Boot device tree file is located in the SDK directory `source/bootloader/uboot/arch/arm/dts/drobot-s600-rdk.dts`. The device tree is specified by the variable `CONFIG_DEFAULT_DEVICE_TREE` in the configuration file.

```shell
# hobot_s600_defconfig
...
CONFIG_DEFAULT_DEVICE_TREE="drobot-s600-rdk"
...
```

If customers need to add their own device tree file, note that they must `#include "hobot-s600-soc.dtsi"` in their device tree file, then override settings later, and finally replace as described above. Generally, reusing D-Robotics' configuration is sufficient. When adding your own device tree file, remember to include it in the Makefile for compilation.

### Add Board ID

In the U-Boot dts file `source/bootloader/uboot/arch/arm/dts/hobot-s600-boardcfg.dtsi`, under `board_cfg`, add board-level configuration information.

```c
    board_cfg {
        ...
        s600_rdk_1_0 {
            u-boot,dm-spl;
            boardid = <0x5131310>;
            soc_name = "S600";
            hw_name = "rdk";
            version = "V1P0";
            pcie_mode = "rc";
            fdt_feat = "drobot-s600-rdk";
            pxe_label = "drobot-s600-rdk-v1p0-kernel";
            bootsrc = "strappin";
        };
        ...
    }
```

- `u-boot,dm-spl`: Indicates that this dts configuration will be used in the SPL stage and must be added.
- `boardid`: Represents the new boardid to be added by the customer.
- `soc_name`: Represents the chip name.
- `hw_name`: Hardware name.
- `version`: Hardware version.
- `pcie_mode`: PCIe mode, defaults to rc.
- `fdt_feat`: The name of the dtb used by U-Boot and SPL.
- `pxe_label`: Kernel configuration in extlinux.
- `bootsrc`: Indicates selecting the boot medium based on strap pin.

### Disable SLEEP KEY Handling

In the RDK S600 design, there is a SLEEP KEY whose functions are to put the device to sleep via key press and to enter the uboot fastboot state via key press during startup. The PIN used for the SLEEP KEY is AON GPIO 8. The other functions of this PIN are SPI8_CSN1 or CAN11_RX. If you are using any of these functions, you need to make the following modifications in the RDK SDK code to ensure normal startup.

In the uboot code `source/bootloader/uboot/arch/arm/mach-hobot/super/s600_boot_info.c`, for the function `hb_get_fb_key_status`, force it to return `1`.

```c
static uint32_t hb_get_fb_key_status(void)
{
    return 1;
    ...
}
```

## Adding New Hardware Under Kernel

### Add Configuration File

The Kernel configuration file is located in the SDK directory `source/hobot-drivers/configs`. The configuration file corresponding to the S600 is `drobot_s600_defconfig`.

The Kernel configuration file is specified in `mk_kernel.sh`.

```shell
# mk_kernel.sh
...
export KERNEL_DEFCONFIG=drobot_s600_defconfig
...
```

If customers need to generate their own Kernel config file, they can replace it as described above. Generally, reusing D-Robotics' configuration is sufficient.

### Add Device Tree

The Kernel device tree file is located in the SDK directory `source/hobot-drivers/kernel-dts`.

If customers need to add their own device tree file, note that they must `#include "rdk-s600-mcb.dtsi"` in their device tree file, then override settings later. Generally, reusing D-Robotics' configuration is sufficient. When adding your own device tree file, remember to include it in the Makefile for compilation.

### Extlinux Configuration

In the S600, U-Boot parses the Kernel configuration based on extlinux and selects the corresponding dtb, Kernel image, and initramfs to load.

The extlinux file is located at `source/kernel/scripts/package/rdk_extlinux`.

Take the RDK-S600-V1P0 version as an example:

```shell
label drobot-s600-rdk-v1p0-kernel
    lantin /lantinhv
    domu /vmlinuz-KERNEL_VERSION
    domufdt /hobot/rdk-s600-mcb-v1p0.dtb
    domuinitrd /initrd.img-KERNEL_VERSION
```

The `label` must correspond to the `pxe_label` in `source/bootloader/uboot/arch/arm/dts/hobot-s600-boardcfg.dtsi`.

The `domufdt` file `rdk-s600-mcb-v1p0.dtb` must be consistent with the Kernel device tree naming to be used.

## Loading ko Based on boardid

In the file `source/hobot-utils/debian/usr/bin/hobot-loadko.sh`, you need to decide whether to load the PCIe driver based on the boardid.

```shell
boardid_sys_path="/sys/class/boardinfo/adc_boardid"
if [ -f "$boardid_sys_path" ]; then
        boardid="$(cat $boardid_sys_path)"
        if [[ "$boardid" =~ ^0x(64|65|6A|6B)[0678][04567]$ ]];then # S100
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
        elif [[ "$boardid" =~ ^0x(51)[1234567][01234567][1234567][1234567].$ ]];then # S600
                # S600 Boardid rules
                modprobe hobot-pcie-rc
        else
                echo "<$LOG_WARN>Unsupported boardid:$boardid, PCIE not Initialized!" > /dev/kmsg
        fi
fi
```

## Configuring Ion Based on boardid

In the file `source/hobot-utils/debian/usr/hobot/bin/hb_switch_ion.sh`, you need to select the ion configuration based on the boardid.

```shell
function get_dtb()
{
    boardid_sys_path="/sys/class/boardinfo/adc_boardid"
    if [ -f "$boardid_sys_path" ]; then
        boardid="$(cat $boardid_sys_path)"

        # get chip
        if [[ "$boardid" =~ ^0x(51)[1234567][01234567][1234567][1234567].$ ]]; then
            # S600
            if [[ "$boardid" == "0x5111110"  ]]; then
                echo "rdk-s600-mcb-v0p1.dtb"
            elif [[ "$boardid" == "0x5121210" ]]; then
                echo "rdk-s600-mcb-v0p2.dtb"
            elif [[ "$boardid" == "0x5131310" ]]; then
                echo "rdk-s600-mcb-v1p0.dtb"
            else
                echo "Invalid"
            fi
        else
        ...
}
```

## On-Board Debugging

When debugging on the board, it is recommended to use the debug image. The release image disables most logs, making it difficult to locate issues when problems occur.

Method to compile the debug image:

In the script `pack_image.sh`, the default configuration selects the beta configuration.

### Check if the Startup Information Meets Expectations

- The SBL log will print the ADC level values.

```shell
...
[00.022777 0]Adc:0:2481:0x5
[00.023121 0]Adc:1:586:0x1
[00.023453 0]Adc:2:1521:0x3
[00.023797 0]Adc:3:110:0x0
[00.024130 0]Adc:4:590:0x1
[00.024463 0]Adc:5:1517:0x3
[00.024805 0]Adc:6:584:0x1
[00.025138 0]Adc:7:1566:0x3
[00.025471 0]boardid :0x5131310
...
```

- The SPL log will print the ADC level values.

```shell
U-Boot SPL 2022.04-00885-ge6f5dae98d (May 28 2026 - 16:43:04 +0800)
...
hb_fetch_boardinfo targetid[0x5131310]
...
```

- The U-Boot log will print the Model, which can be used to determine if it matches the definition in the U-Boot dts.

```shell
U-Boot 2022.04-00885-ge6f5dae98d (May 28 2026 - 16:43:04 +0800)
...
Model: D-Robotics S600 Module Board
...
```

- The U-Boot log will print the boardid, for example, 5131310 below.

```shell
U-Boot 2022.04-00885-ge6f5dae98d (May 28 2026 - 16:43:04 +0800)
...
system_slot: 0 adc_boardinfo: 5131310
...
```

- The U-Boot log will print the label corresponding to extlinux, as well as the Kernel image, dtb, and initramfs.

```shell
U-Boot 2022.04-00885-ge6f5dae98d (May 28 2026 - 16:43:04 +0800)
...
Found /extlinux/extlinux.conf
Retrieving file: /extlinux/extlinux.conf
15:     drobot-s600-rdk-v1p0-kernel
Retrieving file: /lantinhv
Retrieving file: /vmlinuz-6.1.158-rt58-DR-5.1.0-2605281643-g37fae2-g1133e0
   Uncompressing Kernel Image
Retrieving file: /initrd.img-6.1.158-rt58-DR-5.1.0-2605281643-g37fae2-g1133e0
Retrieving file: /hobot/rdk-s600-mcb-v1p0.dtb
...
```

- Check the board info in bootargs.

Mainly check `hobotboot.socname=S600`, `board.hwname=rdk`, `board.ver=V1P0`, `board.pcie_mode=rc`, etc., to see if they match the definitions in U-Boot.

```shell
root@ubuntu:~# cat /proc/cmdline
console=ttyS0,921600n8 systemd.show-status=auto loglevel=1 hobot.kernel_in=scsi0 hobotboot.socname=S600 board.hwname=rdk board.ver=V1P0 board.pcie_mode=rc hobotboot.slot_suffix=_a hobotboot.mode=normal hobotboot.secureboot=1 hobotboot.bootcount=1 systemd.unified_cgroup_hierarchy=0 hobotboot.serial=8e09458433902940  clk_ignore_unused earlycon=uart8250,mmio32,0x3484C000 no_console_suspend root=/dev/ram0 rdinit=/init  rootwait net.ifnames=0 root=/dev/disk/by-partuuid/7060c50b-9cc5-834a-994c-89e3df6e42c9 rw rootfstype=ext4 rootwait
```

- View board info in the Kernel command line.

```shell
root@ubuntu:~# cd /sys/class/boardinfo/
root@ubuntu:/sys/class/boardinfo# ls
adc_boardid  board_name  bootdevice_name  chip_id  ddr_size  ddr_type  hw_name  hw_version  pcie_mode  pg_map  soc_gen  soc_name  soc_uid
root@ubuntu:/sys/class/boardinfo# cat *
0x5131310
S600_rdk_V1P0
scsi0
22881793
0x7fff
LPDDR5
rdk
V1P0
rc
0x8000000
super
S600
8e09458433902940750b6e1900000786
```

## Related Documentation

- [Development Environment and Build](../06_environment_build/01_environment_build.md)
- [Driver Development Guide](/Advanced_development/driver_development)
- [Hardware Introduction](/01_hardware_introduction)
