---
sidebar_position: 3
sidebar_products: RDK S100
---

# 7.1.3 RDK S100 硬件 bringup

S100 boardid 由 ADC0、ADC1、ADC3和 ADC4共同作用，其中 ADC0和 ADC1用于地瓜硬件区分，客户不可更改；ADC3用于识别 Acore 外设上电时序，客户可自定义 Acore 外设上电时序，并同时修改 ADC3的分压电阻；ADC4用于识别硬件版本。具体 ADC 如何设置分压电阻，可联系地瓜 FAE 团队进行支持

每个 ADC 通道共有16个档位，对应0x0~0xF。S100的 boardid 是一个16bit 的无符号整形，例如`0x6A84`，其中 boardid[15:12]对应 ADC0，为0x6；boardid[11:8]对应 ADC1，为0xA；boardid[7:4]对应 ADC3，为0x8；boardid[3:0]对应 ADC4，为0x4

由 ADC 采样形成 boardid，在 SBL 内实现，这部分属于闭源代码，客户无需关心

## 在 MCU 下新增硬件

:::info 提示

在 MCU 侧需要做的是实现自己的 Acore 外设上电方式，如果是参考地瓜的设计，客户无需修改 MCU，可忽略此部分

:::

### 添加 Acore 外设电源管理代码

#### 启动阶段

在文件`mcu/McalCdd/Common/Power/S100/scp/boot/src/main_top_init.c`，函数`Rdk_S100_Peri_Pwr_Init`内，添加上电代码

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

如代码所示，根据 ADC3档位走不同的 Acore 外设上电流程。如果客户自定义了 Acore 外设上电方式，需要分配一个新的 ADC3档位，实现自己的上电方式

#### reboot/suspend 的下电阶段

在此阶段需要实现下电操作

在文件`mcu/McalCdd/Common/Power/S100/scp/Drivers/src/Pmu.c`，函数`Pmu_MainDomainPeriOff`内，添加下电代码

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

#### reboot/resume 的上电阶段

在此阶段需要实现上电操作

在文件`mcu/McalCdd/Common/Power/S100/scp/Drivers/src/Pmu.c`，函数`Pmu_MainDomainPeriOn`内，添加上电代码

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

### 取消SLEEP KEY的处理

在RDK S100/S100P 设计中，有个SLEEP KEY，功能是按键休眠及启动时按键进入uboot fastboot状态。SLEEP KEY使用的PIN是AON GPIO 11，这个PIN的其他function是LIN2_RXD 或UART6_RXD 或 SPI6_CSN3。如果使用了以上这些function，需要在RDK SDK代码中做以下修改才能保证正常启动

在MCU0代码中，会检测AON GPIO 11的中断状态以决定是否要进入休眠模式，中断在ICU模块中注册，因此需要在ICU模块中关闭AON GPIO 11的中断

在MCU代码`mcu/Config/McalCdd/gen_s100_sip_B/Icu/src/Icu_PBCfg.c`的`Icu_Gpio_ChannelConfig_PB`数组中，需要做以下设置：

```c
        ...
         /** @brief gpio mod 3 channel 11 */
        {
            .PinId = 11,
            .instanceNo = 3,
            .DefaultStartEdge = GPIO_ICU_FALLING_EDGE,
            .NotificationEnable = FALSE,
            .GpioChannelNotification = Icu_Gpio_Channel_3_11_ISR,
            .IntEnable = FALSE,
            .IntMask = TRUE,
        },
        ...
```

- `NotificationEnable`改为`FALSE`
- `IntEnable`改为`FALSE`
- `IntMask`改为`TRUE`

## 在 spl 和 Uboot 下新增硬件

spl 为 Uboot 下的 spl

### 新增配置文件

Uboot 的配置文件位于 SDK 目录`source/bootloader/uboot/configs`下，debug 模式对应的配置文件`hobot_s100_defconfig`，release 模式对应的配置文件为`hobot_s100_rel_defconfig`

Uboot 配置文件在 bootloader 板级配置文件中指定，对于 debug 配置文件来说，路径为`source/bootloader/device/rdk/s100/board_s100_debug.mk`，由变量`HR_UBOOT_CONFIG_FILE`指定 Uboot 配置文件

```shell
# hobot_s100_defconfig
...
export HR_UBOOT_CONFIG_FILE=hobot_s100_defconfig
export HR_UBOOT_OTA_CONFIG_FILE=hobot_s100_ota.config
export HR_ARCH_UBOOT="arm"
...
```

如果客户有需求可以生成自己的 Uboot config 文件，按照上述描述进行替换，一般来说复用地瓜的配置即可

### 新增设备树

Uboot 的设备树文件位于 SDK 目录`source/bootloader/uboot/arch/arm/dts/drobot-s100-rdk.dts`，设备树由配置文件的变量`CONFIG_DEFAULT_DEVICE_TREE`指定

```shell
# hobot_s100_defconfig
...
CONFIG_DEFAULT_DEVICE_TREE="drobot-s100-rdk"
...
```

如果客户有需求可以添加自己的设备树文件，注意要在自己的设备树文件中`#include "drobot-s100-soc.dtsi"`，然后在后面覆写，最后按照上述描述进行替换，一般来说复用地瓜的配置即可。添加自己的设备树文件注意在 Makefile 中引入编译。

### 新增 boardid

1. 根据 boardid 添加 socname，hwname、board version 和 pcie mode

在 SDK 目录`source/bootloader/uboot/arch/arm/mach-hobot/super/boot_info.c`的`g_board_info`数组中添加 board 信息

```c
/* arch/arm/mach-hobot/super/boot_info.c */
/* hb_boardinfo_t 结构体信息
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

2. 根据 boardid 添加 Kernel 配置

在 SDK 目录`source/bootloader/uboot/arch/arm/mach-hobot/super/super_board.c`的`hb_super_btype_list`数组中添加 Kernel 配置

```c
/* arch/arm/mach-hobot/super/super_board.c */
/* hb_super_btype_node 结构体
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

其中`hb_super_btype_node`中`fdt_feat`为 Kernel dtb 的名字，`pxe_label`为 extlinux 中的 Kernel 配置，名字必须相互对应

### 取消SLEEP KEY的处理

在RDK S100/S100P 设计中，有个SLEEP KEY，功能是按键休眠及启动时按键进入uboot fastboot状态。SLEEP KEY使用的PIN是AON GPIO 11，这个PIN的其他function是LIN2_RXD 或UART6_RXD 或 SPI6_CSN3。如果使用了以上这些function，需要在RDK SDK代码中做以下修改才能保证正常启动

在uboot代码`source/bootloader/uboot/arch/arm/mach-hobot/super/boot_info.c`中，对于函数`hb_get_fb_key_status`，强制返回`1`

```c
static uint32_t hb_get_fb_key_status(void)
{
    return 1;
    ...
}
```

## 在 Kernel 下新增硬件

### 新增配置文件

Kernel 的配置文件位于 SDK 目录`source/hobot-drivers/configs`下，S100对应的配置文件为`drobot_s100_defconfig`

Kernel 配置文件在 mk_kernel.sh 中指定

```shell
# mk_kernel.sh
...
export KERNEL_DEFCONFIG=drobot_s100_defconfig
...
```

如果客户有需求可以生成自己的 Kernel config 文件，按照上述描述进行替换，一般来说复用地瓜的配置即可

### 新增设备树

Kernel 的设备树文件位于 SDK 目录`source/hobot-drivers/kernel-dts`

如果客户有需求可以添加自己的设备树文件，注意要在自己的设备树文件中`#include "rdk-v0p5.dtsi"`，然后在后面覆写，一般来说复用地瓜的配置即可。添加自己的设备树文件注意在 Makefile 中引入编译。

dtb 的命名需要和`source/bootloader/uboot/arch/arm/mach-hobot/super/super_board.c`的`hb_super_btype_list`数组中的 fdt_feat 对应

### extlinux 配置

S100中 Uboot 根据 extlinux 解析 Kernel 配置，选择对应的 dtb、Kernel 镜像和 initramfs 加载

extlinux 文件位于`source/kernel/scripts/package/rdk_extlinux`

以 RDK-S100-V1P1版本为例

```shell
label drobot-s100-rdk-v1p1-kernel
    kernel /vmlinuz-KERNEL_VERSION
    fdt /hobot/rdk-s100-v1p1.dtb
    initrd /initrd.img-KERNEL_VERSION
```

其中`label`必须和`source/bootloader/uboot/arch/arm/mach-hobot/super/super_board.c`的`hb_super_btype_list`数组中的`pxe_label`对应

`fdt`中的 rdk-s100-v1p1.dtb 必须和要使用的 Kernel 设备树命名保持一致

## 根据 boardid 加载 ko

在文件`source/hobot-utils/debian/usr/bin/hobot-loadko.sh`中，需要根据 boardid 选择是否加载 pcie 驱动和 asm3042 firmware

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

## 上板调试

上板调试时建议使用 debug 镜像，release 镜像会关闭大部分 log，出问题时无法定位

编译 debug 镜像方法

在脚本`pack_image.sh`中，默认配置选择 beta 配置

### 查看启动信息是否符合预期

- SBL log 中会打印出 ADC 档位值

```shell
...
[00.023702 0]Adc:0:1116:0x6
[00.024039 0]Adc:1:2403:0xa
[00.024376 0]Adc:2:1765:0x8
[00.024712 0]Adc:3:1738:0x8
[00.025049 0]Adc:4:632:0x4
...
```

- spl log 中会打印出 ADC 档位值

```shell
U-Boot SPL 2022.04-00905-g5272120b20 (Feb 28 2026 - 08:51:01 +0800)
...
boot_flags.boardid_adc_ch0 0x6
boot_flags.boardid_adc_ch1 0xa
boot_flags.boardid_adc_ch3 0x8
boot_flags.boardid_adc_ch4 0x4
...
```

- Uboot log 中会打印出 Model，可以判断是否和 Uboot dts 中定义的是否一致

```shell
U-Boot 2022.04-00905-g5272120b20 (Feb 28 2026 - 08:51:01 +0800)
...
Model: D-Robotics S100 SIP Board
...
```

- Uboot log 中会打印出 boardid，例如下面的6a84

```shell
U-Boot 2022.04-00905-g5272120b20 (Feb 28 2026 - 08:51:01 +0800)
...
system_slot: 0 adc_boardinfo: 6a84
...
```

- Uboot log 中会打印出在 extlinux 中对应的 label，以及 Kernel 镜像、dtb 和 initramfs

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

- 查看 bootargs 中的 board info

主要是`hobotboot.socname=S100` `board.hwname=RDK` `board.ver=V0P5` `board.pcie_mode=rc`等，是否和 Uboot 中定义的一致

```shell
root@ubuntu:~# cat /proc/cmdline
console=ttyS0,921600n8 systemd.show-status=auto loglevel=1 hobot.kernel_in=nvme0 hobotboot.socname=S100 board.hwname=RDK board.ver=V0P5 board.pcie_mode=rc hobotboot.reason=hwreset hobotboot.slot_suffix=_a hobotboot.mode=normal hobotboot.secureboot=1 hobotboot.bootcount=1 systemd.unified_cgroup_hierarchy=0 hobotboot.serial=060c049530906941  clk_ignore_unused earlycon=uart8250,mmio32,0x394B0000 no_console_suspend root=/dev/ram0 rdinit=/init  rootwait net.ifnames=0 root=/dev/nvme0n1p17 rw rootfstype=ext4 rootwait
```

- 在 Kernel 命令行中查看 board info

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
