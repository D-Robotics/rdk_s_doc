# Documentation Page

URL: https://developer.d-robotics.cc/rdk_s_doc/en/driver_development_s100_s600

[## 📄️Configuring U-Boot and Kernel Option Parameters

In system software development, it is often necessary to configure the functional options of u-boot and the kernel. This chapter introduces several commonly used configuration methods for users' reference.](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/uboot_kernel_config)
[## 📄️UART Driver Debugging Guide

The S100(S600) chip has a total of 4(8) UARTs, namely uart0-uart3(uart0~uart7). Among them, uart0 is used as the debug console, DMA is not enabled by default, and the baud rate is determined by controlling the Bootstrip pin to be either 115200 or 921600.](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_uart_dev)
[## 📄️I2C Debugging Guide

Preface](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_i2c_dev)
[## 📄️GPIO Usage

The S100 Acore chip has a total of 3 sys with gpio devices, namely peri, cam, and video. Each device supports up to 32 gpio pins, and each gpio pin supports interrupts.](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_gpio_dev)
[## 📄️Pinctrl Debugging Guide

Pinctrl Usage](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_pinctrl_dev)
[## 📄️IPC Module Introduction

The IPC (Inter-Processor Communication) module is used for communication between multiple cores, supporting communication between homogeneous and heterogeneous cores. It is based on a buffer-ring for shared memory management in software, and hardware interrupts between cores are implemented via MailBox. IPCF features multiple channels, large data transmission, and is suitable for various platforms. RPMSG is based on an open-source protocol framework and supports inter-core communication between Acore and VDSP.](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_ipc)
[## 📄️SPI Debugging Guide

SPI Hardware Support](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_spi_dev)
[## 📄️PWM Driver Debugging Guide

Continuously updating...](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_pwm)
[## 📄️Thermal System

S100 Thermal System](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_thermal_dev)
[## 📄️Low Power Mode Debugging Guide

Chip Power Domains](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_lowpower)
[## 📄️Audio Debugging Guide

This chapter mainly covers the specifications and features of I2S, basic audio knowledge, and instructions for adding codecs and debugging sound cards.](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_audio)
[## 📄️Time Synchronization Solution

Abbreviations and Explanations](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_timesync)
[## 🗃️PCIe Usage Guide

4 items](/rdk_s_doc/en/13_driver_pcie)
[## 📄️Wi-Fi Driver Debugging Guide

The Wi-Fi of the RDK S100 is connected to the M.2 interface expanded via PCIe. This chapter introduces some user-space commands and kernel DTS configuration items.](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_wifi)
[## 🗃️HBMEM Usage Guide

5 items](/rdk_s_doc/en/15_driver_hbmem)
[## 🗃️Ethernet Usage Development Guide

2 items](/rdk_s_doc/en/16_driver_ethernet)
[## 📄️RTC Debugging Guide

RTC Overview](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_rtc)
[## 📄️Watchdog

Watchdog Overview](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_watchdog)
[## 📄️UFS Driver Debugging Guide

The S100 chip integrates a UFS Host controller, with hardware supporting up to the UFS3.1 protocol, software interface supporting up to 3.0, HS-G4 rate mode, and 2 data lanes. This document describes the development, configuration, and debugging methods for the UFS driver.](/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_ufs)
