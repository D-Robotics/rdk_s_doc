---
title: "2.5.3 常用配置项参考"
sidebar_position: 3
description: "RDK config.txt 常用配置项速查表"
---

# 2.5.3 常用配置项参考

本页列出 config.txt 中常用的配置项，按类别分类，方便快速查找。配置文件的修改方法见 [2.5.2 自定义 config.txt](./02_custom.md)。

## 内核启动参数

| 配置项 | 说明 | 示例 |
| --- | --- | --- |
| `bootargs` | 内核 cmdline 参数（追加到默认 cmdline） | `bootargs=isolcpus=1-2` |
| `loglevel` | 内核启动打印等级（0-8） | `loglevel=8` |

## DTS 节点控制

| 配置项 | 说明 | 示例 |
| --- | --- | --- |
| `fdt-enable` | 使能 DTS 节点（分号分隔多节点） | `fdt-enable=/soc/uart@394C0000;` |
| `fdt-disable` | 失能 DTS 节点 | `fdt-disable=/soc/i2c@3932000;` |

## 显示选项

| 配置项 | 说明 | 示例 |
| --- | --- | --- |
| `hdmi_group` | HDMI 输出组（1=CEA/电视，2=DMT/显示器） | `hdmi_group=2` |
| `hdmi_mode` | HDMI 输出模式（分辨率+刷新率） | `hdmi_mode=82`（1920×1080@60Hz DMT） |

常用 HDMI 模式（DMT group=2）：

| 模式码 | 分辨率 | 刷新率 |
| --- | --- | --- |
| 4 | 640×480 | 60Hz |
| 9 | 800×600 | 60Hz |
| 16 | 1024×768 | 60Hz |
| 82 | 1920×1080 | 60Hz |
| 87 | 2560×1440 | 60Hz |

## 系统配置

| 配置项 | 说明 | 示例 |
| --- | --- | --- |
| `overlayfs` | 覆盖文件系统配置 | `overlayfs=upper` |

> 配置项的完整列表和新增配置项的开发方法见 [2.5.5 config.txt 解析开发指南](./05_parser_dev.md)。

## 相关文档

- [2.5.1 config.txt 使用指南](./01_usage.md)
- [2.5.2 自定义 config.txt](./02_custom.md)
- [2.5.4 启动相关配置](./04_boot_options.md)
- [2.5.5 config.txt 解析开发指南](./05_parser_dev.md)
