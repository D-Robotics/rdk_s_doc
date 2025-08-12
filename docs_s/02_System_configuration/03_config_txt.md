---
sidebar_position: 3
---

# 2.3 config.txt 文件配置
:::warning
- 所有配置文件内的配置，均可以在Uboot内手动覆盖。Uboot内手动配置（在Uboot命令行使用setenv）的优先级**高于**配置文件内的配置。完整环境变量优先级：`setenv > 配置文件 > 上一次启动saveenv`；
- 本章内容均以“配置文件”指代**默认路径**为`/boot/config.txt`的配置文件；
- 使用配置文件时，会需要修改启动分区的内容，这与[AVB](https://source.android.com/docs/security/features/verifiedboot)的要求是冲突的，所以本功能在使能AVB时（AVB功能**默认不使能**）不能使用；
:::

## 使用指南
:::info
- 配置文件默认格式为`<key>=<value>`，第一个`=`后面的所有内容均为`=`前的`<key>`的配置值；
- 配置文件单行配置不能超过1024字符；
- 配置文件内的配置默认不会被保存为Uboot的默认配置；
:::

### 配置内核bootargs（内核cmdline）
修改配置文件，添加：`bootargs=<自定义bootargs>`，例如：
```
# Add cpu isolation configuration
bootargs=isolcpus=1-2
```

### 修改内核启动打印等级
修改配置文件，添加：`loglevel=<自定义打印等级>`，例如：
```
# Add kernel loglevel configuration
loglevel=8
```

## 自定义config.txt指南
地瓜Uboot会根据当前启动使用的储存介质和分区，自动获取默认的配置文件所在分区。

客户可以通过Uboot内的环境变量来自定义下一次启动使用的配置文件的储存介质和分区，步骤如下：
  1. 启动过程中停止并进入Uboot命令行；
  2. 以下环境变量可以用于自定义配置文件，每个变量均可单独使用：
     1. `boot_config_f`：改变默认寻找的配置文件名称，例如`setenv boot_config_f test.txt`，下一次启动的配置文件获取，就会去寻找文件名为`test.txt`的文件，而不是`config.txt`
     2. `boot_config_dev_part`：改变默认寻找配置文件的分区，例如`setenv boot_config_dev_part 0:0xd`，下一次启动的配置文件获取，就会去当前启动介质的第13个分区(0xd)寻找配置文件；
     3. `boot_config_intf`：改变默认寻找配置文件的储存介质，例如`setenv boot_config_intf scsi`。
  3. 保存环境变量：`saveenv`

## config.txt解析开发指南
配置文件的解析功能代码路径位于Uboot目录的：`board/hobot/common/drobot_boot_config.c`文件内。
