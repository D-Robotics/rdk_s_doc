---
sidebar_position: 1
title: "时间同步"
description: "RDK S100/S600 时间同步技术方案：外部时间源引入、多时钟域对齐与多传感器同步"
---

# 时间同步

本节介绍 RDK S100/S600 的时间同步技术方案：如何把外部时间源（UTC）引入系统，统一 Acore 侧与 MCU 侧各时钟的时间基准，并实现多相机、LiDAR 等多传感器之间的数据同步。

:::note 待完善
本节内容规划中，正在整理面向解决方案的时间同步技术方案说明，待补充。
在此之前，时间同步的驱动层说明可先参考 [时间同步方案](/Advanced_development/system_software/driver_timesync)（位于系统软件开发章节）。
:::
