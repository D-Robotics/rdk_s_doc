---
title: "2.5.4 启动相关配置"
sidebar_position: 4
description: "RDK config.txt 启动相关配置项"
---

# 2.5.4 启动相关配置

本页列出 config.txt 中与系统启动相关的配置项，包括内核 cmdline、启动介质选择和 AB 启动。修改方法见 [2.5.2 自定义 config.txt](./02_custom.md)。

## 内核 cmdline（bootargs）

通过 `bootargs` 配置项追加内核启动参数，无需修改 U-Boot 默认 cmdline：

```text
# CPU 隔离（将 CPU 1-2 隔离给实时任务）
bootargs=isolcpus=1-2

# 内核打印等级
loglevel=8

# 关闭内核地址空间随机化
bootargs=norandmaps
```

> `bootargs` 的值会**追加**到 U-Boot 默认 cmdline 末尾，不会覆盖默认参数。

## 启动介质

RDK S100 默认从 eMMC 启动，RDK S600 默认从 UFS 启动。启动介质选择通过硬件拨码开关（SW3/SW8）控制，**不在 config.txt 中配置**。拨码说明见 [1.1 硬件介绍](/01_hardware_introduction) 各 kit 文档。

## DTS 节点控制

通过 `fdt-enable`/`fdt-disable` 在启动时动态使能/失能 DTS 节点，无需重新编译设备树：

```text
# 使能 UART 节点
fdt-enable=/soc/uart@394C0000;

# 失能 I2C 节点
fdt-disable=/soc/i2c@3932000;
```

> 节点路径需与设备树中的完整路径一致。可用 `ls /proc/device-tree/soc/` 查看节点名。

## 相关文档

- [2.5.1 config.txt 使用指南](./01_usage.md)
- [2.5.2 自定义 config.txt](./02_custom.md)
- [2.5.3 常用配置项参考](./03_common_options.md)
- [1.2 开始使用 RDK](/Quick_start/getting_started)
- [5.1.1 搭建开发环境](/Advanced_development/environment_build/environment_build)
