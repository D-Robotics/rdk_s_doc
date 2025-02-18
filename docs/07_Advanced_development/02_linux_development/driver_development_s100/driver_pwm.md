---
sidebar_position: 8
---

# PWM 驱动调试指南


S100芯片包含两个PWM chip，每个只包含一个通道；４个LPWM chip，每个包含4个通道。

LPWM 主要是给 camera trigger 使用，能提供具有延时输出能力的PWM波形，用于校准sensor的曝光同步。

S100总共有4个LPWM chip，每个LPWM chip下面有4个LPWM 子设备，总共16通道。


:::tip
S100芯片目前只用到了LPWM chip，没有用到PWM chip
:::

## 驱动代码

### 代码路径


```c
/* hobot-drivers$ tree camsys/lpwm_super/ */
camsys/lpwm_super/
├── Makefile
├── hobot_lpwm_dev.c
├── hobot_lpwm_dev.h
├── hobot_lpwm_hw_reg.c
├── hobot_lpwm_hw_reg.h
├── hobot_lpwm_ops.c
└── hobot_lpwm_ops.h
```


### 内核配置

```bash
CONFIG_SENSORS_PWM_FAN=m
CONFIG_BACKLIGHT_PWM=m
CONFIG_PWM=y
CONFIG_HOBOT_LPWM=m

```

### DTS节点配置


``` {.c}
lpwm0: lpwm0@370f0000 {
    compatible = "hobot,hobot-lpwm";
    reg = <0 0x370f0000 0 0x1000>;
    pinctrl-names = "default";
    pinctrl-0 = <&cam_lpwm0>;
    // clocks = <&peri_cmm0 4>;
    // clock-names = "lpwm_clk";
    // resets = <&rst_peri 0x8 8>;
    // reset-names = "rst_lpwm0";
    interrupt-parent = <&gic>;
    interrupts = <GIC_SPI CAMERASYS_LPWM_INTR_0 CAMERASYS_LPWM_INTR_0_TRIG_TYPE>;
    offset = <1 1 1 1>;
    trigger-source = <4>;
    channel = <1 1 1 1>;
    // fusa-cfg = <&peri_sys>;
    // fusa-erm = <&peri_erm>;
    status = "okay";
};

lpwm1: lpwm1@370f1000 {
    compatible = "hobot,hobot-lpwm";
    reg = <0 0x370f1000 0 0x1000>;
    pinctrl-names = "default";
    pinctrl-0 = <&cam_lpwm1>;
    // clocks = <&peri_cmm0 4>;
    // clock-names = "lpwm_clk";
    // resets = <&rst_peri 0x8 8>;
    // reset-names = "rst_lpwm0";
    interrupt-parent = <&gic>;
    interrupts = <GIC_SPI CAMERASYS_LPWM_INTR_1 CAMERASYS_LPWM_INTR_1_TRIG_TYPE>;
    offset = <1 1 1 1>;
    trigger-source = <4>;
    channel = <1 1 1 1>;
    // fusa-cfg = <&peri_sys>;
    // fusa-erm = <&peri_erm>;
    status = "okay";
};
... ...
```

## 使用示例

PWM/LPWM节点确认：

``` {.python}
root@ubuntu:/sys/class/pwm# ls
pwmchip0  pwmchip4  pwmchip8
```

sysfs节点说明：

-   lpwm节点

``` {.bash}
root@s100:/sys/devices/platform/soc/48160000.lpwm1# ls -lh
lrwxrwxrwx    1 root     root           0 Jan  1 08:10 driver -> ../../../../bus/platform/drivers/hobot-lpwm
-rw-r--r--    1 root     root        4.0K Jan  1 08:10 driver_override
-rw-r--r--    1 root     root        4.0K Jan  1 08:10 fault_injection
-rw-r--r--    1 root     root        4.0K Jan  1 08:10 lpwm_interrupt
-rw-r--r--    1 root     root        4.0K Jan  1 08:10 lpwm_offset
-r--r--r--    1 root     root        4.0K Jan  1 08:10 modalias
lrwxrwxrwx    1 root     root           0 Jan  1 08:10 of_node -> ../../../../firmware/devicetree/base/soc/lpwm1@48160000
drwxr-xr-x    2 root     root           0 Jan  1 08:10 power
drwxr-xr-x    3 root     root           0 Jan  1 08:00 pwm
lrwxrwxrwx    1 root     root           0 Jan  1 08:10 subsystem -> ../../../../bus/platform
-rw-r--r--    1 root     root        4.0K Jan  1 08:10 trigger_all
-rw-r--r--    1 root     root        4.0K Jan  1 08:10 trigger_source
-rw-r--r--    1 root     root        4.0K Jan  1 08:00 uevent
```



### DTS中pwm和pwmchip对应关系

尽管pwm和lpwm都属于pwmchip，但PWM/LPWM下含的设备数量不一致，所以无法通过aliases固定序号，因此在板端操作pwm时，需要cat pwmchip下的device/uevent，查看pwm地址是否与目标pwm地址是否一致。以pwm0为例，在板端使用以下命令查看pwmchip的uevent

```
cat /sys/class/pwm/pwmchip0/device/uevent
DRIVER=drobot-pwm
OF_NAME=pwm
OF_FULLNAME=/soc/a55_apb0/pwm@34140000
OF_COMPATIBLE_0=d-robotics,pwm
OF_COMPATIBLE_N=1
MODALIAS=of:NpwmT(null)Cd-robotics,pwm
```

## 测试

用户可以参考以下命令进行pwm功能测试，并进行信号测量，验证pwm工作是否正常。具体测量的硬件引脚请用户参考使用的具体硬件提供的说明。
以下命令以验证PWM0 ch0为例。

```shell
cd /sys/class/pwm/pwmchip0/
echo 0 > export
cd pwm0

# 配置周期为100us
echo 100000 > period
# 配置占空比为 50% = 100us * 0.5 = 50us
echo 50000 > duty_cycle
# 使能PWM输出
echo 1 > enable

#以下是进行寄存器读取
echo "Regs of PWM 3:"
echo "PWM_EN       `devmem 0x34170000 32`"
echo "PWM_INT_CTRL `devmem 0x34170004 32`"
echo "PWM0_CTRL    `devmem 0x34170008 32`"
echo "PWM0_CLK     `devmem 0x34170010 32`"
echo "PWM0_PERIOD  `devmem 0x34170020 32`"
echo "PWM0_STATUS  `devmem 0x34170028 32`"
echo "PWM1_CTRL    `devmem 0x34170030 32`"
echo "PWM1_CLK     `devmem 0x34170034 32`"
echo "PWM1_PERIOD  `devmem 0x34170040 32`"
echo "PWM1_STATUS  `devmem 0x34170048 32`"
```

**trigger_source:**

| 序号 | 模块 |
| --- | --- |
| 0 | Ethernet 0 |
| 1 | Ethernet 1 |
| 2 | Ethernet 2 |
| 3 | Ethernet 3 |
| 4 | software |
| 5 | GPIO GPS |
| 6 | GPIO LIDAR |
| 7 | GPIO AP |

**lpwm_offset:**

通道的offset 值，单位为us

## 用户空间配置示例

```bash
cd /sys/class/pwm/pwmchip6/
# 使能其下各channel:
echo 0 > export 
echo 1 > export 
echo 2 > export 
echo 3 > export 

# 配置lpwm设备参数:
cd /sys/class/pwm/pwmchip6/device/
echo 4 > trigger_source
echo 500 700 900 1000 > lpwm_offset #设定四个通道的offset 值，单位为us

# 配置各channel参数(周期和占空比）:
cd /sys/class/pwm/pwmchip6/pwm3/
echo 33333000 > period 
echo 10000 > duty_cycle 

# 使能通道输出:
echo 1 > enable 
```


