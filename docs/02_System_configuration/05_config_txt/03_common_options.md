---
title: "常用配置项参考"
sidebar_position: 3
description: "RDK config.txt 常用配置项速查表"
---

# 常用配置项参考

本页列出 config.txt 中常用的配置项，按类别分类，方便快速查找。配置文件的修改方法见 [自定义 config.txt](./02_custom.md)。

> 示例中的 DTS 节点地址为 S100 示例；S600 的节点地址不同，以板端
> `/proc/device-tree/soc/` 下实际节点名为准。

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

## DTS 属性修改

| 配置项 | 说明 | 示例 |
| --- | --- | --- |
| `fdt-setprop` | 设置节点属性（`/节点路径 属性名 值`，`;` 分隔多条） | `fdt-setprop=/soc/uart@394C0000 status "okay"` |
| `fdt-remove` | 删除节点或属性（`节点路径` 或 `节点路径 属性名`，`;` 分隔） | `fdt-remove=/soc/i2c@3932000;` |

## DTB Overlay

| 配置项 | 说明 | 示例 |
| --- | --- | --- |
| `dtbo_file_path` | 应用 DTB Overlay 文件（相对 boot 分区，`;` 分隔多个） | `dtbo_file_path=/spi0_cs1_dev.dtbo` |
| `dtbo_dev_part` | Overlay 文件所在分区（`<设备号>:<16 进制分区号>`） | `dtbo_dev_part=0:0x10` |

> 显示输出接口（DSI/HDMI）通过 [srpi-config](../04_srpi_config/01_overview.md)
> 的 Display Options 配置，不在 config.txt 中配置。

> 新增配置项的开发方法与解析机制见 [config.txt 解析开发指南](./05_parser_dev.md)。

## 验证

- 按本页填好配置项并写入 `/boot/config.txt` 后重启；`bootargs` 用 `cat /proc/cmdline` 确认追加参数、`fdt-enable`/`dtbo_file_path` 用 `ls /proc/device-tree/soc/` 确认节点或 Overlay 生效，具体见 [config.txt 使用指南](./01_usage.md)。

## 常见问题

### 配置项未生效

**原因**：key 名拼写错误，或该行以 `#` 开头被当作注释跳过。

**解决**：对照本页速查表核对 key 名；确认不是注释行；单行不超过 1024 字符。

### S100 示例在 S600 上找不到节点

**原因**：本页 DTS 节点地址为 S100 示例，S600 的节点地址不同。

**解决**：以板端 `/proc/device-tree/soc/` 下实际节点名为准。

## 相关文档

- [config.txt 使用指南](./01_usage.md)
- [自定义 config.txt](./02_custom.md)
- [启动相关配置](./04_boot_options.md)
- [config.txt 解析开发指南](./05_parser_dev.md)
