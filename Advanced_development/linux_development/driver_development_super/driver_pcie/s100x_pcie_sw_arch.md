# PCIe 软件架构与模块划分

URL: https://developer.d-robotics.cc/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_pcie/s100x_pcie_sw_arch

## 软件框架

PCIe 软件框架分为 RC 和 EP 两个部分：

![S100_600_PCIE_sw_arch](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/pcie/sw_arch.png)
## 驱动模块说明

驱动相关的源码在 hobot-drivers/pcie 目录下，各个模块的细节信息如下：

| side | component | output | Source file 
| both | S13E01C01 PCIe basic driver | hobot-pcie-common.ko | hobot-ep-dev/hobot-pcie-common/ 
| both | S13E01C03 PCIe controller driver | hobot-pcie.ko | hobot.c 
| RC | S13E01C02 PCIe device manager | hobot-pcie-dev-manager.ko | hobot-ep-dev/hobot-pcie-dev-manager 
| RC | S13E01C04 PCIe RC controller driver | hobot-pcie-rc.ko | hobot-rc.c 
| RC | S13E01C10 PCIe hybrid device driver | hobot-pcie-ep-dev.ko | hobot-ep-dev/hobot-pcie-ep-dev 
| RC | S13E01C11 PCIe device wrapper |  |  
| EP | S13E01C05 PCIe EP controller driver | hobot-pcie-ep.ko | hobot-ep.c 
| EP | S13E01C06 PCIe function wrapper | hobot-pcie-ep-fun.ko | hobot-ep-fun/ 
| EP | S13E01C07 PCIe hybrid function driver |  |  

## PCIe 驱动加载/卸载

### RC 端加载

```shell
modprobe hobot-pcie
modprobe hobot-pcie-rc
modprobe hobot-pcie-ep-dev
modprobe hobot-pcie-dev-manager
```

### EP 端加载

```shell
modprobe hobot-pcie
modprobe hobot-pcie-ep-fun
```

### RC 端卸载

```shell
rmmod hobot_pcie_dev_manager
rmmod hobot_pcie_ep_dev
rmmod hobot_pcie_rc
rmmod hobot_pcie_common
rmmod hobot_pcie
```

### EP 端卸载

```shell
rmmod hobot_pcie_ep_fun
rmmod hobot_pcie_ep
rmmod hobot_pcie_common
rmmod hobot_pcie
```

需要注意：

1. 卸载驱动前一定要保证 PCIe 的应用程序都已关闭，按照先卸载 RC 驱动，再卸载 EP 驱动的顺序进行
2. 系统休眠前需要遵循以下流程：
- 停掉两端的 PCIe 应用程序
- 卸载 RC 驱动
- 卸载 EP 驱动
3. 停掉两端的 PCIe 应用程序
4. 卸载 RC 驱动
5. 卸载 EP 驱动
6. 系统唤醒后需要遵循以下流程：
- 加载 EP 驱动
- 加载 RC 驱动
- 启动 PCIe 应用程序
7. 加载 EP 驱动
8. 加载 RC 驱动
9. 启动 PCIe 应用程序
10. 链路信号不稳定或对端重启导致 PCIe link down 后，需要重启 RC 和 EP 以保证 PCIe 功能的可用性以及系统的稳定性
11. 在不使用 pcie 功能的时候，不要加载 pcie 相关驱动
12. 系统重启前需要遵循以下流程：
- 停掉两端的 PCIe 应用程序
- 卸载 RC 驱动
- 卸载 EP 驱动
- RC 系统重启
- EP 系统重启
13. 停掉两端的 PCIe 应用程序
14. 卸载 RC 驱动
15. 卸载 EP 驱动
16. RC 系统重启
17. EP 系统重启

## 用户态模块说明

用户态相关的源码在 hbre 目录下，各个模块的细节信息如下：

| side | component | output | Source file 
| both | S13E01C15 PCIe user library | libhbpcie.so | libhbpcie/ 
| both | S13E01C16 PCIe High Level API | libhbpciehl.so | libhbpciehl/
