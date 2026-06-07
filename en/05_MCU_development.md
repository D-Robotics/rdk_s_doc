# Documentation Page

URL: https://developer.d-robotics.cc/rdk_s_doc/en/05_MCU_development

[## 📄️7.5.1 Introduction to MCU Code Package Structure

MCU0 firmware compilation/McalCdd/Service/Platform and other codes are proprietary to the enterprise edition. If needed, please contact D-Robotics for support.](/rdk_s_doc/en/Advanced_development/mcu_development/code_release)
[## 📄️7.5.2 MCU Quick Start Guide

Scope](/rdk_s_doc/en/Advanced_development/mcu_development/basic_information)
[## 📄️7.5.3 MCU System Description

Basic Description of the Compilation System](/rdk_s_doc/en/Advanced_development/mcu_development/MCU_build_system)
[## 📄️7.5.4 MCU1 Development Guide

MCU Interrupt Number and Module Correspondence](/rdk_s_doc/en/Advanced_development/mcu_development/FreeRTOS_development)
[## 📄️7.5.5 UART User Guide

The S100 MCU chip has a total of 3 UARTs, namely Uart4 to Uart6. Among them, Uart4 is used as a debug console (shared by MCU0 and MCU1), DMA is not enabled by default, and the default configuration is as follows:](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_uart)
[## 📄️7.5.6 PWM User Guide

Hardware Support](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_pwm)
[## 📄️7.5.7 SPI User Guide

Hardware Support](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_spi)
[## 📄️7.5.8 ADC User Guide

Hardware Support](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_adc)
[## 📄️7.5.9 IPC User Guide

This section focuses on the usage instructions for the MCU side. For more details on the principles and usage of IPC, please refer to the IPC Module Introduction section.](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_ipc)
[## 📄️7.5.10 CAN User Guide

Overview](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_can)
[## 📄️7.5.11 I2C User Guide

The S100 MCU provides a standard I2C bus. The I2C bus controller transfers information between devices connected to the bus through the serial data line (SDA) and serial clock line (SCL). Each device has a unique address. The main function of the I2C subsystem is to implement serial communication between the microcontroller and peripherals. It can drive MIPI daughter cards, PMIC chips, and other common peripherals.](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_i2c)
[## 📄️7.5.12 Eth User Guide

Overview](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_eth)
[## 🗃️7.5.13 PORT Module Guide

2 items](/rdk_s_doc/en/07_Advanced_development/05_mcu_development/12_mcu_port)
[## 📄️7.5.14 MCU Ramdump

Currently, MCU0 and MCU1 share the same memory for crash information. If MCU0 and MCU1 simultaneously encounter exceptions, the information saved by the MCU ramdump feature is unavailable.](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_ramdump)
[## 📄️7.5.15 ICU User Guide

The ICU module is a software submodule based on the S100 chip solution and serves as basic service software in the overall system. In the S100 overall design, ICU software mainly abstracts and uniformly manages hardware with input capture capabilities in the system. Hardware-layer IPs include PWM and GPIO. This document focuses on GPIO interrupt configuration and implementation.](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_ICU)
[## 📄️7.5.16 TIMER User Guide

Hardware Support](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_timer)
[## 📄️7.5.17 MCU Watchdog

1. Introduction](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_watchdog)
[## 📄️7.5.18 EtherCAT User Guide

1. Overview](/rdk_s_doc/en/Advanced_development/mcu_development/mcu_ethercat)
