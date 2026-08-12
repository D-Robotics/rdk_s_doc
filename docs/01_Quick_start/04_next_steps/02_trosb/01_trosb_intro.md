---
title: "1.4.2.1 TogetheROS.Bot 概述"
sidebar_position: 1
description: "TogetheROS.Bot（tros.b）机器人中间件介绍"
---

# 1.4.2.1 TogetheROS.Bot 概述

**TogetheROS.Bot**（简称 **tros.b**）是 D-Robotics 基于 ROS 2 打造的机器人中间件，预装在 RDK OS 镜像中，为 RDK 开发板提供感知、规控、建图等机器人应用开发能力。

## 什么是 tros.b

tros.b 是 D-Robotics 面向 RDK 平台优化的 ROS 2 发行版，在标准 ROS 2 基础上增加了：

- **BPU 算法节点**：将模型推理（YOLO/分类/分割等）封装为 ROS 2 节点，直接调用 BPU 硬件加速
- **传感器驱动节点**：摄像头、IMU、激光雷达等传感器接入
- **多传感器同步**：基于 LPWM/PPS 的硬件级时间同步
- **预配置环境**：无需手动安装 ROS 2，开箱即用

## 与 RDK OS 的关系

```
┌─────────────────────────────────────┐
│           机器人应用层                │
│  （用户 ROS 2 节点 + launch 文件）     │
├─────────────────────────────────────┤
│           tros.b 中间件               │
│  （BPU 节点 + 传感器驱动 + 工具包）     │
├─────────────────────────────────────┤
│           RDK OS                      │
│  （Ubuntu + BPU 驱动 + VIO/Codec）     │
├─────────────────────────────────────┤
│           RDK 硬件                     │
│  （S100/S600 + BPU + MCU + 传感器）    │
└─────────────────────────────────────┘
```

tros.b 运行在 RDK OS 之上，通过 BPU 硬件加速实现高能效的机器人感知与规控。

## 与原生 ROS 2 的差异

| 方面 | 原生 ROS 2 | tros.b |
| --- | --- | --- |
| 安装 | 手动安装 ROS 2 + 依赖 | 预装在 RDK OS 镜像，开箱即用 |
| 模型推理 | CPU 推理或自行集成 | BPU 加速节点，模型已转换量化 |
| 传感器同步 | 软件时间戳 | 硬件级 LPWM/PPS 同步 |
| 性能 | 受 CPU 限制 | BPU + MCU 异构加速 |

## 预装版本

tros.b 随 RDK OS 镜像一起发布，版本与 RDK OS 版本对应。可通过以下命令查看：

```bash
# 查看 RDK OS 版本
cat /etc/version

# 查看 tros.b 版本（如果已安装）
ros2 pkg list | head
```

:::note 板端验证
当前 S600 板端（192.168.3.35）的镜像未预装 tros.b。如需使用 tros.b，需烧录带 tros.b 的 RDK OS 镜像。
:::

## 相关文档

- [1.4.2.2 机器人应用开发](./robot_dev)
- [1.4.2.3 常用功能包](./packages)
- [3.3 算法示例](/Demos/algorithm_demo/summary)（BPU 推理示例）
