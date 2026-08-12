---
title: "2.5.2 自定义 config.txt"
sidebar_position: 2
description: "如何创建和修改 RDK config.txt 配置文件"
---

# 2.5.2 自定义 config.txt

config.txt 是 RDK 的启动配置文件，用于在 U-Boot 阶段配置内核启动参数、DTS 节点、显示选项等，无需重新编译固件即可调整系统行为。

## 文件位置

config.txt 默认路径为 `/boot/config.txt`，位于启动分区（boot 分区）。

## 格式规则

- 每行一条配置：`<key>=<value>`
- 第一个 `=` 后的所有内容均为该 key 的值
- 单行不超过 1024 字符
- 以 `#` 开头的行为注释

```text
# 这是一个注释
bootargs=isolcpus=1-2 loglevel=8
hdmi_group=2
hdmi_mode=82
```

## 修改方法

### 方法 1：板端直接编辑

```bash
# 挂载 boot 分区（如未自动挂载）
mount /dev/mmcblk0p1 /boot  # S100 eMMC
# 或
mount /dev/sda1 /boot       # UFS/NVMe

# 编辑 config.txt
vi /boot/config.txt

# 保存后重启生效
reboot
```

### 方法 2：通过 U-Boot 命令行

在启动时按任意键进入 U-Boot 命令行，使用 `setenv` 临时修改（优先级高于 config.txt）：

```text
# U-Boot 命令行
setenv bootargs 'isolcpus=1-2 loglevel=8'
boot
```

:::warning 优先级
完整环境变量优先级：`setenv（U-Boot 手动）` > `config.txt（配置文件）` > `saveenv（上次保存）`
:::

:::warning AVB 冲突
修改启动分区内容与 AVB（Android Verified Boot）要求冲突。AVB 默认不使能；如已使能 AVB，则不能使用 config.txt。
:::

## 配置生效

config.txt 在每次启动时由 U-Boot 自动读取并解析。修改后**重启开发板**即可生效，无需重新烧录固件。

## 相关文档

- [2.5.1 config.txt 使用指南](./01_usage.md)
- [2.5.3 常用配置项参考](./03_common_options.md)
- [2.5.4 启动相关配置](./04_boot_options.md)
