---
sidebar_position: 1
title: "1.4.1 使用 RDK Studio"
description: RDK Studio 集成开发环境介绍与下载
---

# 1.4.1 使用 RDK Studio

**RDK Studio** 是 D-Robotics 为 RDK 开发板打造的集成开发环境（IDE），提供代码编辑、远程编译、调试、模型部署、性能分析等一站式开发能力，无需在宿主机上手动搭建交叉编译环境。

## 下载与安装

:::warning 升级说明
- 为了提供更丰富、更便捷的开发体验，我们已对 RDK Studio 进行全面升级。旧版本现已下架，请您移步至 [官网下载页面](https://developer.d-robotics.cc/rdkstudio) 下载最新版本。
- 新版本 RDK Studio 使用指南参见：[RDK Studio 用户手册](https://developer.d-robotics.cc/rdk_studio_doc/category/1-product-intro)
:::

## 核心功能

| 功能 | 说明 |
| --- | --- |
| 远程开发 | 通过 SSH 连接板端，在 IDE 内编辑→编译→运行→调试，无需手动 scp |
| 模型部署 | 可视化模型转换→部署→推理验证全流程 |
| 性能分析 | BPU/CPU 负载、内存占用、帧率等运行时指标监控 |
| Demo 管理 | 内置 RDK 示例项目管理，一键运行 [3.3 算法示例](/Demos/algorithm_demo/summary) |

## 与手动搭建开发环境的对比

| 方面 | RDK Studio | 手动搭建（[5.1.1](/Advanced_development/environment_build/environment_build)） |
| --- | --- | --- |
| 安装 | 下载安装包即可 | 安装工具链+依赖 |
| 编译 | IDE 内一键 | 命令行 mk_*.sh |
| 调试 | 图形化调试器 | gdb / printf |

:::

## 相关文档

- [1.4.2 TogetheROS.Bot](/Quick_start/next_steps/trosb/trosb_intro)
- [5.1 开发环境与编译](/Advanced_development/environment_build/environment_build)
- [5.7 算法工具链开发指南](/Advanced_development/algorithm_toolchain)
