---
sidebar_position: 7
---
# 8.7 桌面应用

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

本节主要解答在桌面使用第三方应用遇到的问题。

:::warning 注意
设备默认使用64k页表，影响以下桌面应用的正常使用：
:::

<table>
  <thead>
    <tr>
      <th>应用名称</th>
      <th>应用介绍</th>
      <th>备注</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>help</td>
      <td>Help 是基于 GNOME 桌面环境提供的官方文档查看器</td>
      <td>作为 GNOME 系列应用共用的帮助系统，其他 GNOME 应用内置的帮助文档也可能受到影响</td>
    </tr>
    <tr>
      <td>Boxes</td>
      <td>GNOME Boxes是一个轻量虚拟机软件</td>
      <td></td>
    </tr>
    <tr>
      <td>搜狗输入法</td>
      <td>搜狗输入法是一款智能中文输入法，支持拼音、五笔等多种输入方式</td>
      <td>Linux版本基于fcitx框架开发，依赖 X11（Xorg）输入法机制（XIM），不支持 Wayland 输入协议</td>
    </tr>
  </tbody>
</table>

### Q1: 下载 Visual Studio Code 应用打不开？

**A:**
* **使用命令行打开：** Visual Studio Code 使用的 Electron shell 在处理某些 GPU（图形处理单元）硬件加速时存在问题，您可以尝试在启动 VS Code 时通过添加 Electron --disable-gpu 命令行开关来禁用 GPU 加速（https://code.visualstudio.com/docs/supporting/faq#_vs-code-is-blank）：
```bash
    code --disable-gpu
```

### Q2：RDK S600 Docker安装后服务启动失败
docker需要使用iptables的legacy模式，用户可以使用以下命令修复docker运行：
```shell
sudo update-alternatives --set iptables /usr/sbin/iptables-legacy
sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
sudo systemctl restart docker
```

### Q3：RDK S100 / S600时区设置
<Tabs groupId="accessory">
<TabItem value="rdk_s100" label="rdk_s100">
RDK S100系统默认使用上海时区（UTC+8），该配置通过`/etc/systemd/system.conf`文件中的以下参数实现：
```bash
DefaultEnvironment="TZ=CST-08:00"
```
如果需要手动配置，请注释掉`DefaultEnvironment="TZ=CST-08:00"`，然后`reboot`重启设备使配置生效。
</TabItem>
<TabItem value="rdk_s600" label="rdk_s600">
RDK S600系统默认使用上海时区（UTC+8），该配置通过`/etc/systemd/system.conf`文件中的以下参数实现：
```bash
DefaultEnvironment="TZ=CST-08:00"
```
如果需要手动配置，请注释掉`DefaultEnvironment="TZ=CST-08:00"`，然后`reboot`重启设备使配置生效。
</TabItem>
</Tabs>

### Q4：: RDK S100 / S600桌面应用`Power Statistics` 应用设备节点显示不全问题
<Tabs groupId="accessory">
<TabItem value="rdk_s100" label="rdk_s100">
RDK S100默认不支持，未提供相应的驱动。如用户需要支持显示适配器信息和电池信息，请用户自行联系电源管理芯片供应商提供驱动。

    下面内容对电源统计驱动做的简单介绍，`Power Statistics` 应用的信息是根据显示`/sys/class/power_supply/`下的节点信息进行显示的
    ```text
    - sys/class/power_supply/ac      //外部充电器充电相关
    - sys/class/power_supply/usb     //usb充电相关
    - sys/class/power_supply/battery //电池状态相关
    ```

    以下以内核自带的测试驱动test_power.c为例，做一下简单介绍

    1. 驱动代码存放位置：`kernel/drivers/power/supply`
    ```text
        kernel/drivers/power/supply/
            ├── 88pm860x_battery.c
            ├── 88pm860x_charger.c
            ├── ab8500_bmdata.c
            ├── test_power.c       # 内核自带测试驱动
            ├── Kconfig            # 给内核添加编译选项
            ├── Makefile           # 将test_power.c编译进内核
    ```

    2. Kconfig文件
    ```kconfig
        config TEST_POWER
        tristate "Test power driver"
        help
        This driver is used for testing. It's safe to say M here.
    ```

    3. Makefile文件
    ```makefile
        obj-$(CONFIG_TEST_POWER) += test_power.o
    ```

    4. test_power.c
    主要接口：
    ```text
        power_supply_register()接口介绍

        功能：用于注册一个电源设备（如 AC、Battery、USB 等），让内核和用户空间可以统一访问和管理电源信息。

        设备原型：
        struct power_supply *power_supply_register(
            struct device *parent,
            const struct power_supply_desc *desc,
            const struct power_supply_config *cfg
        );

        参数：
        parent ：父设备指针，一般传 NULL，表示没有父设备
        desc   ：指向 struct power_supply_desc，描述电源设备属性、类型、回调函数等
        cfg    ：电源配置结构体，提供 of_node、supplied_to、num_supplicants 等信息
    ```

    主要部分如下（详细内容可查看test_power.c文件）：
    ```c
        #include <linux/kernel.h>
        #include <linux/module.h>
        #include <linux/power_supply.h>
        #include <linux/errno.h>
        #include <linux/delay.h>
        #include <generated/utsrelease.h>

        enum test_power_id {
            TEST_AC,
            TEST_BATTERY,
            TEST_USB,
            TEST_POWER_NUM,
        };

        static int ac_online            = 1;
        static int usb_online           = 1;
        static int battery_status       = POWER_SUPPLY_STATUS_DISCHARGING;
        static int battery_health       = POWER_SUPPLY_HEALTH_GOOD;
        static int battery_present      = 1; /* true */
        static int battery_technology       = POWER_SUPPLY_TECHNOLOGY_LION;
        static int battery_capacity     = 50;
        static int battery_voltage      = 3300;
        static int battery_charge_counter   = -1000;
        static int battery_current      = -1600;

        static bool module_initialized;

        /* -------------------------
        * AC 电源属性获取函数
        * ------------------------- */

        static int test_power_get_ac_property(struct power_supply *psy,
                            enum power_supply_property psp,
                            union power_supply_propval *val)
        {
            switch (psp) {
            case POWER_SUPPLY_PROP_ONLINE:
                val->intval = ac_online;
                break;
            default:
                return -EINVAL;
            }
            return 0;
        }

        /* -------------------------
        * USB 电源属性获取函数
        * ------------------------- */

        static int test_power_get_usb_property(struct power_supply *psy,
                            enum power_supply_property psp,
                            union power_supply_propval *val)
        {
            switch (psp) {
            case POWER_SUPPLY_PROP_ONLINE:
                val->intval = usb_online;
                break;
            default:
                return -EINVAL;
            }
            return 0;
        }

        /* -------------------------
        * 电池属性获取函数
        * ------------------------- */

        static int test_power_get_battery_property(struct power_supply *psy,
                            enum power_supply_property psp,
                            union power_supply_propval *val)
        {
            switch (psp) {
            case POWER_SUPPLY_PROP_MODEL_NAME:
                val->strval = "Test battery";
                break;
            case POWER_SUPPLY_PROP_MANUFACTURER:
                val->strval = "Linux";
                break;
                 .
                 .
                 .
            default:
                pr_info("%s: some properties deliberately report errors.\n",
                    __func__);
                return -EINVAL;
            }
            return 0;
        }
                .
                .
                .
        static int __init test_power_init(void)
        {
            int i;
            int ret;

            BUILD_BUG_ON(TEST_POWER_NUM != ARRAY_SIZE(test_power_supplies));
            BUILD_BUG_ON(TEST_POWER_NUM != ARRAY_SIZE(test_power_configs));

            for (i = 0; i < ARRAY_SIZE(test_power_supplies); i++) {
                test_power_supplies[i] = power_supply_register(NULL,
                                &test_power_desc[i],
                                &test_power_configs[i]);
                if (IS_ERR(test_power_supplies[i])) {
                    pr_err("%s: failed to register %s\n", __func__,
                        test_power_desc[i].name);
                    ret = PTR_ERR(test_power_supplies[i]);
                    goto failed;
                }
            }

            module_initialized = true;
            return 0;
        failed:
            while (--i >= 0)
                power_supply_unregister(test_power_supplies[i]);
            return ret;
        }
        module_init(test_power_init);                                          // 驱动注册阶段

        static void __exit test_power_exit(void)
        {
            int i;

            /* Let's see how we handle changes... */
            ac_online = 0;
            usb_online = 0;
            battery_status = POWER_SUPPLY_STATUS_DISCHARGING;
            for (i = 0; i < ARRAY_SIZE(test_power_supplies); i++)
                power_supply_changed(test_power_supplies[i]);
            pr_info("%s: 'changed' event sent, sleeping for 10 seconds...\n",
                __func__);
            ssleep(10);

            for (i = 0; i < ARRAY_SIZE(test_power_supplies); i++)
                power_supply_unregister(test_power_supplies[i]);

            module_initialized = false;
        }
        module_exit(test_power_exit);                                           // 驱动卸载阶段
    ```
</TabItem>
<TabItem value="rdk_s600" label="rdk_s600">
    RDK S600默认不支持，未提供相应的驱动。如用户需要支持显示适配器信息和电池信息，请用户自行联系电源管理芯片供应商提供驱动。

    下面内容对电源统计驱动做的简单介绍，`Power Statistics` 应用的信息是根据显示`/sys/class/power_supply/`下的节点信息进行显示的
    ```text
    - sys/class/power_supply/ac      //外部充电器充电相关
    - sys/class/power_supply/usb     //usb充电相关
    - sys/class/power_supply/battery //电池状态相关
    ```

    以下以内核自带的测试驱动test_power.c为例，做一下简单介绍

    1. 驱动代码存放位置：`kernel/drivers/power/supply`
    ```text
        kernel/drivers/power/supply/
            ├── 88pm860x_battery.c
            ├── 88pm860x_charger.c
            ├── ab8500_bmdata.c
            ├── test_power.c       # 内核自带测试驱动
            ├── Kconfig            # 给内核添加编译选项
            ├── Makefile           # 将test_power.c编译进内核
    ```

    2. Kconfig文件
    ```kconfig
        config TEST_POWER
        tristate "Test power driver"
        help
        This driver is used for testing. It's safe to say M here.
    ```

    3. Makefile文件
    ```makefile
        obj-$(CONFIG_TEST_POWER) += test_power.o
    ```

    4. test_power.c
    主要接口：
    ```text
        power_supply_register()接口介绍

        功能：用于注册一个电源设备（如 AC、Battery、USB 等），让内核和用户空间可以统一访问和管理电源信息。

        设备原型：
        struct power_supply *power_supply_register(
            struct device *parent,
            const struct power_supply_desc *desc,
            const struct power_supply_config *cfg
        );

        参数：
        parent ：父设备指针，一般传 NULL，表示没有父设备
        desc   ：指向 struct power_supply_desc，描述电源设备属性、类型、回调函数等
        cfg    ：电源配置结构体，提供 of_node、supplied_to、num_supplicants 等信息
    ```

    主要部分如下（详细内容可查看test_power.c文件）：
    ```c
        #include <linux/kernel.h>
        #include <linux/module.h>
        #include <linux/power_supply.h>
        #include <linux/errno.h>
        #include <linux/delay.h>
        #include <generated/utsrelease.h>

        enum test_power_id {
            TEST_AC,
            TEST_BATTERY,
            TEST_USB,
            TEST_POWER_NUM,
        };

        static int ac_online            = 1;
        static int usb_online           = 1;
        static int battery_status       = POWER_SUPPLY_STATUS_DISCHARGING;
        static int battery_health       = POWER_SUPPLY_HEALTH_GOOD;
        static int battery_present      = 1; /* true */
        static int battery_technology       = POWER_SUPPLY_TECHNOLOGY_LION;
        static int battery_capacity     = 50;
        static int battery_voltage      = 3300;
        static int battery_charge_counter   = -1000;
        static int battery_current      = -1600;

        static bool module_initialized;

        /* -------------------------
        * AC 电源属性获取函数
        * ------------------------- */

        static int test_power_get_ac_property(struct power_supply *psy,
                            enum power_supply_property psp,
                            union power_supply_propval *val)
        {
            switch (psp) {
            case POWER_SUPPLY_PROP_ONLINE:
                val->intval = ac_online;
                break;
            default:
                return -EINVAL;
            }
            return 0;
        }

        /* -------------------------
        * USB 电源属性获取函数
        * ------------------------- */

        static int test_power_get_usb_property(struct power_supply *psy,
                            enum power_supply_property psp,
                            union power_supply_propval *val)
        {
            switch (psp) {
            case POWER_SUPPLY_PROP_ONLINE:
                val->intval = usb_online;
                break;
            default:
                return -EINVAL;
            }
            return 0;
        }

        /* -------------------------
        * 电池属性获取函数
        * ------------------------- */

        static int test_power_get_battery_property(struct power_supply *psy,
                            enum power_supply_property psp,
                            union power_supply_propval *val)
        {
            switch (psp) {
            case POWER_SUPPLY_PROP_MODEL_NAME:
                val->strval = "Test battery";
                break;
            case POWER_SUPPLY_PROP_MANUFACTURER:
                val->strval = "Linux";
                break;
                 .
                 .
                 .
            default:
                pr_info("%s: some properties deliberately report errors.\n",
                    __func__);
                return -EINVAL;
            }
            return 0;
        }
                .
                .
                .
        static int __init test_power_init(void)
        {
            int i;
            int ret;

            BUILD_BUG_ON(TEST_POWER_NUM != ARRAY_SIZE(test_power_supplies));
            BUILD_BUG_ON(TEST_POWER_NUM != ARRAY_SIZE(test_power_configs));

            for (i = 0; i < ARRAY_SIZE(test_power_supplies); i++) {
                test_power_supplies[i] = power_supply_register(NULL,
                                &test_power_desc[i],
                                &test_power_configs[i]);
                if (IS_ERR(test_power_supplies[i])) {
                    pr_err("%s: failed to register %s\n", __func__,
                        test_power_desc[i].name);
                    ret = PTR_ERR(test_power_supplies[i]);
                    goto failed;
                }
            }

            module_initialized = true;
            return 0;
        failed:
            while (--i >= 0)
                power_supply_unregister(test_power_supplies[i]);
            return ret;
        }
        module_init(test_power_init);                                          // 驱动注册阶段

        static void __exit test_power_exit(void)
        {
            int i;

            /* Let's see how we handle changes... */
            ac_online = 0;
            usb_online = 0;
            battery_status = POWER_SUPPLY_STATUS_DISCHARGING;
            for (i = 0; i < ARRAY_SIZE(test_power_supplies); i++)
                power_supply_changed(test_power_supplies[i]);
            pr_info("%s: 'changed' event sent, sleeping for 10 seconds...\n",
                __func__);
            ssleep(10);

            for (i = 0; i < ARRAY_SIZE(test_power_supplies); i++)
                power_supply_unregister(test_power_supplies[i]);

            module_initialized = false;
        }
        module_exit(test_power_exit);                                           // 驱动卸载阶段
    ```
</TabItem>
</Tabs>

### Q5: RDKS100 安装 NoMachine 后 GNOME Wayland 会话无法启动，系统回退到 X11 会话？

问题描述：RDKS100 设备安装 NoMachine 后，原本默认的 Wayland 会话无法启动，登录桌面后仅运行在 X11 模式下。

解决方案：升级 NoMachine 至最新版本（使用的版本为9.3.7）后，Wayland 会话可以正常启动，远程连接功能恢复正常。

确认当前会话类型：
可通过以下两种方式查看当前使用的显示协议

1、在桌面终端执行下面命令可以查看，输出内容为会话模式，Wayland模式会输出Wayland
```bash
    echo $XDG_SESSION_TYPE
```
2、打开桌面的 `settings` 应用，选择 `about`，在 `Windowing System` 一栏可查看当前会话模式（Wayland 或 X11）

手动切换回 Wayland 会话：若启动后发现会话模式为 X11，可执行以下命令切换至 Wayland
```bash
    systemctl restart gdm
```

## 已知问题

1、切换语言问题会遇到下面问题
:::info 注意
建议先不使用此功能，若使用，请参考下面步骤解决。
:::

问题描述：在"Settings"中切换系统语言并重启后，出现输入正确密码也无法登录桌面的情况。

步骤：打开 Settings 应用，导航至 Region & Language，选择目标语言，出现restart按钮（此restart只重启桌面会话，不会重启设备），在锁屏界面输入密码。

解决方案：若在步骤中遇到输入密码正确无法登录的问题，设备重新上电或reboot重启设备即可完成切换。
