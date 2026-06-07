# Documentation Page

URL: https://developer.d-robotics.cc/rdk_s_doc/driver_development_s100_s600

[## 📄️配置 U-Boot 和 Kernel 选项参数

在系统软件开发中，经常需要对 u-boot 和 kernel 的功能选项进行配置，本章节介绍几个常用的配置方法，供用户参考使用。](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/uboot_kernel_config)
[## 📄️UART 驱动调试指南

S100(S600)芯片共有4(8)路 uart，即 uart0-uart3(uart0~uart7)。其中 uart0作为调试控制台使用，默认不开启 DMA，且需要通过控制 Bootstrip pin 决定波特率为115200或921600;](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_uart_dev)
[## 📄️I2C 调试指南

前言](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_i2c_dev)
[## 📄️GPIO 使用

S100 Acore 芯片内中共有3个 sys 有 gpio 设备，分别是 peri, cam 和 video，每个设备最多有32个 gpio 引脚，并且每个 gpio 引脚都支持中断。](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_gpio_dev)
[## 📄️Pinctrl 调试指南

Pinctrl 使用](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_pinctrl_dev)
[## 📄️IPC 模块介绍

IPC（Inter-Processor Communication）模块是用于多核之间的通信，支持同构核和异构核之间的通信，软件上基于 buffer-ring 进行共享内存的管理，硬件上基于 MailBox 实现核间中断。IPCF 具有多路通道，大数据传输，适用多种平台的特点。RPMSG 基于开源协议框架，支持 Acore 与 VDSP 的核间通信。](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_ipc)
[## 📄️SPI 调试指南

SPI 硬件支持](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_spi_dev)
[## 📄️PWM 驱动调试指南

持续更新中....](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_pwm)
[## 📄️Thermal 系统

S100 Thermal 系统](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_thermal_dev)
[## 📄️低功耗模式调试指南

芯片电源域](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_lowpower)
[## 📄️音频调试指南

本章主要是关于 I2S 的规格特性，语音基础知识以及添加 codec、调试声卡的说明。](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_audio)
[## 📄️时间同步方案

名词缩写及解释](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_timesync)
[## 🗃️PCIe使用指南

4 个项目](/rdk_s_doc/13_driver_pcie)
[## 📄️Wi-Fi 驱动调试指南

RDK S100 的 Wi-Fi 接在由 PCIe 拓展出来的 M.2 接口上。本章节会介绍部分用户层命令和内核 dts 配置项。](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_wifi)
[## 🗃️HBMEM使用指南

5 个项目](/rdk_s_doc/15_driver_hbmem)
[## 🗃️以太网使用开发指南

2 个项目](/rdk_s_doc/16_driver_ethernet)
[## 📄️RTC 调试指南

RTC 概述](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_rtc)
[## 📄️Watchdog

Watchdog 概述](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_watchdog)
[## 📄️UFS 驱动调试指南

S100芯片内置 UFS Host 控制器，硬件最高支持 UFS3.1协议，软件接口最高支持3.0，支持 HS-G4速率模式，支持2路数据通道。本文档介绍 UFS 驱动的开发、配置和调试方法。](/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_ufs)
