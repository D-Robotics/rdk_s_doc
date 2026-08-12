---
sidebar_position: 2
sidebar_products: RDK S600
---

# 5.2.2 RDK S600 硬件点亮

S600 boardid 由 ADC0、ADC1、ADC2、ADC4、ADC5、ADC6共同作用，其中 ADC0、 ADC1和ADC2用于地瓜硬件区分，客户不可更改；ADC4用于module底板区分，ADC5用于底板版本区分，ADC4和ADC5用户可以更改；ADC6为预留状态，强制为0x1。具体 ADC 如何设置分压电阻，可联系地瓜 FAE 团队进行支持

ADC0、ADC1和ADC2 通道共有8个档位，对应0x0-0x7；ADC4、ADC5通道共有7个档位，对应0x0-0x6。S600的 boardid 是一个28bit 的无符号整形，例如`0x5131310`，其中 boardid[27:24]对应 ADC0，为0x5；boardid[23:20]对应 ADC1，为0x1；boardid[19:16]对应 ADC2，为0x3；boardid[15:12]对应 ADC4，为0x1；boardid[11:8]对应 ADC5，为0x3；boardid[7:4]对应 ADC6，为0x1；boardid[3:0]默认为0x0

由 ADC 采样形成 boardid，在 SBL 内实现，对应代码路径为`mcu/BootLoader/BoardId/src/Board_Id_Matrixp.c`，函数`SBL_GetADC_To_AonSram`

## 在 MCU 下新增硬件

:::info 提示

在 MCU 侧需要做的是实现自己的 Acore 外设上电方式，如果是参考地瓜的设计，客户无需修改 MCU，可忽略此部分

:::

### 添加 Acore 电源管理代码

#### 启动阶段

在文件`mcu/BootLoader/Sys/src/Sys_InitSocEarly.c`，函数`Sys_Lld_SetPmicGpio`内，添加pmic EN PIN设置代码

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

如果完全使用地瓜的电源逻辑，可以把自己的boardid放在代码中以0x5开头的boardid case下方。如果是自定义的，需要新建case分支

#### reboot/suspend 的场景

在地瓜S600 MD的pmic配置中，`mcu/Config/McalCdd/gen_s600_md/Pmic/src/Pmic_PBcfg.c`，在`PmicGpioConfig`中添加PIN的信息

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

**如果用户使用了地瓜 S600 MD的pmic配置，需要结合自己的电源方案进行修改**

### 添加版本信息

1. 在`mcu/Service/Board/BoardInfo/inc/McuVersion.h`中，添加boardid信息

```c
#elif ((SOC_TYPE == SOC_TYPE_S600) || (SOC_TYPE == SOC_TYPE_S300))
  #define RDK_S600_V1_0                        0x5131310
  #define RDK_S600_V1_0_NAME                   "Matrix_V2.0"
#endif
```

- `RDK_S600_V1_0`定义为新增的boardid
- `RDK_S600_V1_0_NAME`定义为新增的硬件名

2. 在`mcu/Service/Board/BoardInfo/src/Hobot_Board_Info.c`中，添加boardinfo

```c
#elif ((SOC_TYPE == SOC_TYPE_S600) || (SOC_TYPE == SOC_TYPE_S300))
static Hobot_BoardInfo_t g_BoardInfo[BOARD_TYPE_NUM] = {
    ...
    /* RDK S600 V1.0 */
    {0x5131310, "S600", "RDK", "", "V1.0"},
    ...
```

- `0x5131310`为新增的boardid
- `S600`定义为芯片名
- `RDK`定义为硬件名
- `V1.0`定义为硬件版本

3. 在`mcu/Service/Board/BoardInfo/src/McuVersion.c`中，添加版本比对

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

### 取消SLEEP KEY的处理

在RDK S600 设计中，有个SLEEP KEY，功能是按键休眠及启动时按键进入uboot fastboot状态。SLEEP KEY使用的PIN是AON GPIO 8，这个PIN的其他function是SPI8_CSN1 或CAN11_RX。如果使用了以上这些function，需要在RDK SDK代码中做以下修改才能保证正常启动

在MCU0代码中，会检测AON GPIO 8的中断状态以决定是否要进入休眠模式，中断在ICU模块中注册，因此需要在ICU模块中关闭AON GPIO 8的中断

在MCU代码`mcu/Config/McalCdd/gen_s600_md/Icu/src/Icu_PBCfg.c`的`Icu_Gpio_ChannelConfig_PB`数组中，需要做以下设置：

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

- `NotificationEnable`改为`FALSE`
- `IntEnable`改为`FALSE`
- `IntMask`改为`TRUE`

## 在 spl 和 Uboot 下新增硬件

spl 为 Uboot 下的 spl

### 新增配置文件

Uboot 的配置文件位于 SDK 目录`source/bootloader/uboot/configs`下，对应的配置文件`hobot_s600_defconfig`

Uboot 配置文件在 bootloader 板级配置文件中指定，对于 debug 配置文件来说，路径为`source/bootloader/device/rdk/s600/board_s600_debug.mk`，由变量`HR_UBOOT_CONFIG_FILE`指定 Uboot 配置文件

```shell
# hobot_s600_defconfig
...
export HR_UBOOT_CONFIG_FILE=hobot_s600_defconfig
export HR_UBOOT_OTA_CONFIG_FILE=hobot_s600_ota.config
export HR_ARCH_UBOOT="arm"
...
```

如果客户有需求可以生成自己的 Uboot config 文件，按照上述描述进行替换，一般来说复用地瓜的配置即可

### 新增设备树

Uboot 的设备树文件位于 SDK 目录`source/bootloader/uboot/arch/arm/dts/drobot-s600-rdk.dts`，设备树由配置文件的变量`CONFIG_DEFAULT_DEVICE_TREE`指定

```shell
# hobot_s600_defconfig
...
CONFIG_DEFAULT_DEVICE_TREE="drobot-s600-rdk"
...
```

如果客户有需求可以添加自己的设备树文件，注意要在自己的设备树文件中`#include "hobot-s600-soc.dtsi"`，然后在后面覆写，最后按照上述描述进行替换，一般来说复用地瓜的配置即可。添加自己的设备树文件注意在 Makefile 中引入编译。

### 新增 boardid

在Uboot dts中`source/bootloader/uboot/arch/arm/dts/hobot-s600-boardcfg.dtsi`的`board_cfg`中，添加板级配置信息

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

- `u-boot,dm-spl`：表示此dts配置在SPL阶段会使用到，必须添加
- `boardid`：表示客户要新加的boardid
- `soc_name`：表示芯片名
- `hw_name`：硬件名
- `version`：硬件版本
- `pcie_mode`：PCIe mode，默认为rc
- `fdt_feat`：Uboot和SPL使用的dtb的名字
- `pxe_label`：extlinux中kernel的配置
- `bootsrc`：表示根据strap pin选择启动介质

### 取消SLEEP KEY的处理

在RDK S600 设计中，有个SLEEP KEY，功能是按键休眠及启动时按键进入uboot fastboot状态。SLEEP KEY使用的PIN是AON GPIO 8，这个PIN的其他function是SPI8_CSN1 或CAN11_RX。如果使用了以上这些function，需要在RDK SDK代码中做以下修改才能保证正常启动

在uboot代码`source/bootloader/uboot/arch/arm/mach-hobot/super/s600_boot_info.c`中，对于函数`hb_get_fb_key_status`，强制返回`1`

```c
static uint32_t hb_get_fb_key_status(void)
{
    return 1;
    ...
}
```

## 在 Kernel 下新增硬件

### 新增配置文件

Kernel 的配置文件位于 SDK 目录`source/hobot-drivers/configs`下，S600对应的配置文件为`drobot_s600_defconfig`

Kernel 配置文件在 mk_kernel.sh 中指定

```shell
# mk_kernel.sh
...
export KERNEL_DEFCONFIG=drobot_s600_defconfig
...
```

如果客户有需求可以生成自己的 Kernel config 文件，按照上述描述进行替换，一般来说复用地瓜的配置即可

### 新增设备树

Kernel 的设备树文件位于 SDK 目录`source/hobot-drivers/kernel-dts`

如果客户有需求可以添加自己的设备树文件，注意要在自己的设备树文件中`#include "rdk-s600-mcb.dtsi"`，然后在后面覆写，一般来说复用地瓜的配置即可。添加自己的设备树文件注意在 Makefile 中引入编译。

### extlinux 配置

S600中 Uboot 根据 extlinux 解析 Kernel 配置，选择对应的 dtb、Kernel 镜像和 initramfs 加载

extlinux 文件位于`source/kernel/scripts/package/rdk_extlinux`

以 RDK-S600-V1P0版本为例

```shell
label drobot-s600-rdk-v1p0-kernel
    lantin /lantinhv
    domu /vmlinuz-KERNEL_VERSION
    domufdt /hobot/rdk-s600-mcb-v1p0.dtb
    domuinitrd /initrd.img-KERNEL_VERSION
```

其中`label`必须和`source/bootloader/uboot/arch/arm/dts/hobot-s600-boardcfg.dtsi`中的`pxe_label`对应

`domufdt`中的 rdk-s600-mcb-v1p0.dtb 必须和要使用的 Kernel 设备树命名保持一致

## 根据 boardid 加载 ko

在文件`source/hobot-utils/debian/usr/bin/hobot-loadko.sh`中，需要根据 boardid 选择是否加载 pcie 驱动

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
        elif [[ "$boardid" =~ ^0x(51)[01234567][0123456][0123456][1234567].$ ]];then # S600
                # S600 Boardid rules
                modprobe hobot-pcie-rc
        else
                echo "<$LOG_WARN>Unsupported boardid:$boardid, PCIE not Initialized!" > /dev/kmsg
        fi
fi
```

## 根据 boardid 配置 ion

在文件`source/hobot-utils/debian/usr/hobot/bin/hb_switch_ion.sh`中，需要根据 boardid 选择 ion 配置

```shell
function get_dtb()
{
    boardid_sys_path="/sys/class/boardinfo/adc_boardid"
    if [ -f "$boardid_sys_path" ]; then
        boardid="$(cat $boardid_sys_path)"

        # get chip
        if [[ "$boardid" =~ ^0x(51)[01234567][0123456][0123456][1234567].$ ]]; then
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

## 上板调试

上板调试时建议使用 debug 镜像，release 镜像会关闭大部分 log，出问题时无法定位

编译 debug 镜像方法

在脚本`pack_image.sh`中，默认配置选择 beta 配置

### 查看启动信息是否符合预期

- SBL log 中会打印出 ADC 档位值

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

- spl log 中会打印出 ADC 档位值

```shell
U-Boot SPL 2022.04-00885-ge6f5dae98d (May 28 2026 - 16:43:04 +0800)
...
hb_fetch_boardinfo targetid[0x5131310]
...
```

- Uboot log 中会打印出 Model，可以判断是否和 Uboot dts 中定义的一致

```shell
U-Boot 2022.04-00885-ge6f5dae98d (May 28 2026 - 16:43:04 +0800)
...
Model: D-Robotics S600 Module Board
...
```

- Uboot log 中会打印出 boardid，例如下面的5131310

```shell
U-Boot 2022.04-00885-ge6f5dae98d (May 28 2026 - 16:43:04 +0800)
...
system_slot: 0 adc_boardinfo: 5131310
...
```

- Uboot log 中会打印出在 extlinux 中对应的 label，以及 Kernel 镜像、dtb 和 initramfs

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

- 查看 bootargs 中的 board info

主要是`hobotboot.socname=S600` `board.hwname=rdk` `board.ver=V1P0` `board.pcie_mode=rc`等，是否和 Uboot 中定义的一致

```shell
root@ubuntu:~# cat /proc/cmdline
console=ttyS0,921600n8 systemd.show-status=auto loglevel=1 hobot.kernel_in=scsi0 hobotboot.socname=S600 board.hwname=rdk board.ver=V1P0 board.pcie_mode=rc hobotboot.slot_suffix=_a hobotboot.mode=normal hobotboot.secureboot=1 hobotboot.bootcount=1 systemd.unified_cgroup_hierarchy=0 hobotboot.serial=8e09458433902940  clk_ignore_unused earlycon=uart8250,mmio32,0x3484C000 no_console_suspend root=/dev/ram0 rdinit=/init  rootwait net.ifnames=0 root=/dev/disk/by-partuuid/7060c50b-9cc5-834a-994c-89e3df6e42c9 rw rootfstype=ext4 rootwait
```

- 在 Kernel 命令行中查看 board info

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
