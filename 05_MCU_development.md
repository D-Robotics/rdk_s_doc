# Documentation Page

URL: https://developer.d-robotics.cc/rdk_s_doc/05_MCU_development

[## 📄️7.5.1 MCU 代码包结构介绍

MCU0固件编译/McalCdd/Service/Platform 等代码为企业版专有，如有需要，请联系D-Robotics获取支持。](/rdk_s_doc/Advanced_development/mcu_development/code_release)
[## 📄️7.5.2 MCU 快速入门指南

范围](/rdk_s_doc/Advanced_development/mcu_development/basic_information)
[## 📄️7.5.3 MCU 系统说明

编译系统基本说明](/rdk_s_doc/Advanced_development/mcu_development/MCU_build_system)
[## 📄️7.5.4 MCU1开发指南

MCU 中断号及模块对应关系](/rdk_s_doc/Advanced_development/mcu_development/FreeRTOS_development)
[## 📄️7.5.5 UART 使用指南

S100 MCU 芯片共有3路 Uart，即 Uart4~Uart6。其中 Uart4作为调试控制台使用（MCU0、MCU1共用调试串口），默认不开启 DMA，默认配置如下：](/rdk_s_doc/Advanced_development/mcu_development/mcu_uart)
[## 📄️7.5.6 PWM 使用指南

硬件支持](/rdk_s_doc/Advanced_development/mcu_development/mcu_pwm)
[## 📄️7.5.7 SPI 使用指南

硬件支持](/rdk_s_doc/Advanced_development/mcu_development/mcu_spi)
[## 📄️7.5.8 ADC 使用指南

硬件支持](/rdk_s_doc/Advanced_development/mcu_development/mcu_adc)
[## 📄️7.5.9 IPC 使用指南

此章节着重说明 MCU 侧的相关使用说明，更多的 IPC 的原理和使用可以查阅 IPC模块介绍 章节。](/rdk_s_doc/Advanced_development/mcu_development/mcu_ipc)
[## 📄️7.5.10 CAN 使用指南

基本概述](/rdk_s_doc/Advanced_development/mcu_development/mcu_can)
[## 📄️7.5.11 I2C 使用指南

S100 MCU 芯片提供了标准的 I2C 总线，I2C 总线控制器通过串行数据线（SDA）和串行时钟（SCL）线在连接到总线的器件间传递信息。每个器件都有一个唯一的地址。I2C 子系统的主要功能是实现单片机与外围设备之间的串行通信。它可以驱动 mipi 子卡、pmic 芯片和其他常用的外围设备。](/rdk_s_doc/Advanced_development/mcu_development/mcu_i2c)
[## 📄️7.5.12 Eth 使用指南

基本概述](/rdk_s_doc/Advanced_development/mcu_development/mcu_eth)
[## 🗃️7.5.13 PORT模块指南

2 个项目](/rdk_s_doc/07_Advanced_development/05_mcu_development/12_mcu_port)
[## 📄️7.5.14 MCU ramdump 功能

目前 MCU0/MCU1的 Crash 信息共享一块内存。MCU0/MCU1同时出现异常的情况下，MCU ramdump 功能保存的信息不可用。](/rdk_s_doc/Advanced_development/mcu_development/mcu_ramdump)
[## 📄️7.5.15 ICU 使用指南

ICU 模块是基于 S100芯片解决方案的一个软件子模块，在整个系统属于基础服务软件。在 S100整体设计中，ICU 软件主要是对系统内有输入捕获属性的硬件进行软件抽象并统一管理，硬件层 IP 涉及到 PWM 和 GPIO 两个硬件。本文重点介绍 GPIO 中断的配置和实现。](/rdk_s_doc/Advanced_development/mcu_development/mcu_ICU)
[## 📄️7.5.16 TIMER 使用指南

硬件支持](/rdk_s_doc/Advanced_development/mcu_development/mcu_timer)
[## 📄️7.5.17 MCU 看门狗

1. 简介](/rdk_s_doc/Advanced_development/mcu_development/mcu_watchdog)
[## 📄️7.5.18 EtherCAT 用户手册

1. 概述](/rdk_s_doc/Advanced_development/mcu_development/mcu_ethercat)
