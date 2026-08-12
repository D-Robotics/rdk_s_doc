---
title: "2.5.5 config.txt 解析开发指南"
sidebar_position: 5
description: "config.txt 解析机制与新增配置项开发指南"
---

# 2.5.5 config.txt 解析开发指南

本页面向模式 3 开发者，介绍 config.txt 的 U-Boot 解析机制及如何新增自定义配置项。

> 用户侧配置使用见 [2.5.1 config.txt 使用指南](./01_usage.md)，常用配置项见 [2.5.3 常用配置项参考](./03_common_options.md)。

## 解析机制

config.txt 由 U-Boot 在启动阶段解析。流程：

1. U-Boot 启动时读取 boot 分区的 `config.txt` 文件
2. 逐行解析 `key=value` 格式
3. 根据 key 执行对应操作（设置环境变量、修改 DTS、配置显示等）
4. 解析完成后加载内核启动

## 配置项处理方式

config.txt 中的配置项按处理方式分两类：

### 环境变量类

直接设置 U-Boot 环境变量，如 `bootargs`、`loglevel`。U-Boot 将其追加到内核 cmdline。

### 动作类

触发特定 U-Boot 脚本动作，如 `fdt-enable`/`fdt-disable` 在加载 DTS 后修改 FDT（Flattened Device Tree）。

## 新增配置项

如需新增自定义 config.txt 配置项：

1. 在 U-Boot 源码的 config.txt 解析脚本中添加新 key 的处理逻辑
2. 解析脚本位置：U-Boot 源码 `board/<platform>/config_txt_parser.sh`（或对应 `.c` 文件）
3. 新增 key 的解析分支：读取 value → 执行对应操作（setenv/fdt 修改等）

:::note 开发参考
config.txt 解析脚本的源码在 BSP 源码树中，路径取决于平台。参考 [5.1 开发环境与编译](/Advanced_development/environment_build/environment_build) 获取源码。
:::

## 相关文档

- [2.5.1 config.txt 使用指南](./01_usage.md)
- [2.5.2 自定义 config.txt](./02_custom.md)
- [2.5.3 常用配置项参考](./03_common_options.md)
- [2.5.4 启动相关配置](./04_boot_options.md)
- [5.1 开发环境与编译](/Advanced_development/environment_build/environment_build)
