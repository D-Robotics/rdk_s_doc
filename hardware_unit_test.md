# Documentation Page

URL: https://developer.d-robotics.cc/rdk_s_doc/hardware_unit_test

[## 📄️概述

驱动功能单元测试是验证系统驱动程序与硬件组件稳定性、性能及功能完整性的关键阶段。本章节将详细介绍各类驱动功能单元的测试方法与测试标准，确保系统在实际应用场景中具备高度的可靠性和卓越的性能表现。](/rdk_s_doc/Advanced_development/linux_development/hardware_unit_test/overview)
[## 📄️AutoTest 使用方法

AutoTest 提供了一种灵活的自动化测试解决方案，支持通过配置文件 config.ini 自定义压测时长和测试次数，并允许用户根据需求扩展测试用例，以满足不同的测试需求。该工具在驱动单元测试的基础上开发，实现了自动化测试功能，同时与功能单元的独立测试相互独立，并充分复用现有代码资源。](/rdk_s_doc/Advanced_development/linux_development/hardware_unit_test/the_auto_test)
[## 📄️CPU-BPU-DDR 压力测试

本文档同时覆盖 RDK S100 与 RDK S600。CPU/DDR 段（stressapptest）两平台一致；BPU 段两平台使用了完全不同的压测工具与模型——S100 使用 bpuostest（裸 binary，配合 run.sh 中的 group proportion 机制），S600 使用 hrtmodelexec（由 hobot-dnn 包提供）——请通过下方 Tabs 切换至所用平台查看。页内所有 Tabs 联动切换。](/rdk_s_doc/Advanced_development/linux_development/hardware_unit_test/bpu_cpu_ddr_stress)
[## 📄️eMMC 压力测试

测试原理](/rdk_s_doc/Advanced_development/linux_development/hardware_unit_test/emmc_stress)
[## 📄️串口压力测试

测试原理](/rdk_s_doc/Advanced_development/linux_development/hardware_unit_test/uart_stress)
[## 📄️SPI 压力测试

测试原理](/rdk_s_doc/Advanced_development/linux_development/hardware_unit_test/spi_stress)
[## 📄️Wi-Fi 性能测试

Wi-Fi（发音： /ˈwaɪfaɪ/），又称"无线网络"，是一种基于 IEEE 802.11 标准的无线局域网技术。尽管"Wi-Fi"常被写作"Wi-Fi"或"Wi-Fi"，但这些写法并未得到 Wi-Fi 联盟的认可。Wi-Fi 广泛应用于连接计算机、智能手机、平板电脑及智能家居设备，提供便捷的网络接入方式。](/rdk_s_doc/Advanced_development/linux_development/hardware_unit_test/wifi_performance)
[## 📄️以太网性能测试

本章旨在指导如何使用 iperf3 工具进行以太网性能测试。可以查阅 iperf3 了解该命令的详细使用说明。](/rdk_s_doc/Advanced_development/linux_development/hardware_unit_test/ethernet_performance)
[## 📄️CPU 性能测试

测试原理](/rdk_s_doc/Advanced_development/linux_development/hardware_unit_test/cpu_performance)
[## 📄️DDR 带宽测试

测试原理](/rdk_s_doc/Advanced_development/linux_development/hardware_unit_test/ddr_bandwidth)
[## 📄️USB 总线速率测试

测试原理](/rdk_s_doc/Advanced_development/linux_development/hardware_unit_test/usb_performance)
[## 📄️3D GPU 性能测试

测试原理](/rdk_s_doc/Advanced_development/linux_development/hardware_unit_test/10-3d_gpu)
