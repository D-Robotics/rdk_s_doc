---
title: "config.txt 解析开发指南"
sidebar_position: 5
description: "config.txt 解析机制与新增配置项开发指南"
---

# config.txt 解析开发指南

本页面向模式 3 开发者，介绍 config.txt 的 U-Boot 解析机制及如何新增自定义配置项。

> 用户侧配置使用见 [config.txt 使用指南](./01_usage.md)，常用配置项见 [常用配置项参考](./03_common_options.md)。

## 解析机制

config.txt 由 U-Boot 在启动阶段解析，解析代码位于
`board/hobot/common/drobot_boot_config.c` 的 `parse_config_file()`：

1. 读取 boot 分区的 `config.txt` 文件到内存
2. 逐行处理：跳过空行和 `#` 注释行，按第一个 `=` 拆分为 key/value
3. 调用 `process_key_val_pair()` 处理每个 key/value：
   - `fdt-setprop`：追加到环境变量 `fdt-setprop`
   - `ion*` 开头的 key：拆分为 `<名称>=<大小>` 并写入环境变量
   - `bootargs`：追加到已有 `bootargs` 环境变量
   - 其它 key：直接 `env_set(key, value)`
4. 解析完成后加载内核；`board/hobot/common/drobot_fdt_runtime_config.c`
   的 `drobot_fdt_runtime_conf()` 再消费 `fdt-enable`/`fdt-disable`/
   `fdt-setprop`/`fdt-remove`/`dtbo_*` 等环境变量，在加载 DTB 后动态修改设备树

## 配置项处理方式

config.txt 中的配置项按处理方式分两类：

### 环境变量类

直接设置 U-Boot 环境变量，供后续启动流程读取，如 `bootargs`（追加到内核
cmdline）、`loglevel`（由板级代码拼进 cmdline）、`ion*`（设置内存参数）。

### 设备树类

设置环境变量后，由 `drobot_fdt_runtime_config.c` 在加载 DTB 后消费：
`fdt-enable`/`fdt-disable`（改节点 status）、`fdt-setprop`（改属性）、
`fdt-remove`（删节点/属性）、`dtbo_file_path` 等（应用 DTB Overlay）。

## 新增配置项

如需新增自定义 config.txt 配置项，在 U-Boot 源码中修改：

1. 通用配置项无需改解析代码：`key=value` 会被自动写入同名环境变量，
   在板级代码或启动流程中读取即可。
2. 需要特殊处理的配置项，在 `board/hobot/common/drobot_boot_config.c`
   的 `process_key_val_pair()` 中新增分支。
3. 若配置项用于修改设备树，在
   `board/hobot/common/drobot_fdt_runtime_config.c` 的
   `drobot_fdt_runtime_conf()` 中新增对应消费逻辑。

:::note 开发参考
config.txt 解析源码位于 BSP 的 U-Boot 源码树中，路径为
`board/hobot/common/drobot_boot_config.c`。获取源码见
[开发环境与编译](../../07_Advanced_development/06_environment_build/01_environment_build.md)。
:::

## 验证

- 新增通用配置项后，重启进入 U-Boot 用 `printenv <key>` 确认 `key=value` 已写入环境变量。
- 设备树类配置项（`fdt-enable`/`dtbo_file_path` 等）生效后，进入系统用 `ls /proc/device-tree/soc/` 确认节点或 Overlay。

## 常见问题

### 新增配置项没生效

**原因**：key 被 `process_key_val_pair()` 的既有分支（如 `bootargs` 追加、`ion*` 拆分）特殊处理，未按预期写入。

**解决**：对照 `board/hobot/common/drobot_boot_config.c` 的 `parse_config_file()`/`process_key_val_pair()` 确认处理分支。

### 设备树类配置项不生效

**原因**：只在环境变量层写入，未在 `drobot_fdt_runtime_config.c` 的 `drobot_fdt_runtime_conf()` 加入消费逻辑。

**解决**：在该函数新增对应消费逻辑后重新编译 U-Boot。

## 相关文档

- [config.txt 使用指南](./01_usage.md)
- [自定义 config.txt](./02_custom.md)
- [常用配置项参考](./03_common_options.md)
- [启动相关配置](./04_boot_options.md)
- [开发环境与编译](../../07_Advanced_development/06_environment_build/01_environment_build.md)
