# PCIe Software Architecture and Module Partitioning

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_pcie/s100x_pcie_sw_arch

## Software Framework

The PCIe software framework is divided into two parts: RC and EP:

![S100_600_PCIE_sw_arch](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/pcie/sw_arch-en.jpg)
## Driver Module Description

The driver-related source code is located in the hobot-drivers/pcie directory. Detailed information for each module is as follows:

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

## PCIe Driver Loading/Unloading

### RC Side Loading

```shell
modprobe hobot-pcie
modprobe hobot-pcie-rc
modprobe hobot-pcie-ep-dev
modprobe hobot-pcie-dev-manager
```

### EP Side Loading

```shell
modprobe hobot-pcie
modprobe hobot-pcie-ep-fun
```

### RC Side Unloading

```shell
rmmod hobot_pcie_dev_manager
rmmod hobot_pcie_ep_dev
rmmod hobot_pcie_rc
rmmod hobot_pcie_common
rmmod hobot_pcie
```

### EP Side Unloading

```shell
rmmod hobot_pcie_ep_fun
rmmod hobot_pcie_ep
rmmod hobot_pcie_common
rmmod hobot_pcie
```

Important notes:

1. Before unloading the driver, ensure that all PCIe applications are closed. Unload the RC driver first, followed by the EP driver.
2. Before system suspend, the following process must be followed:
- Stop PCIe applications on both ends
- Unload the RC driver
- Unload the EP driver
3. Stop PCIe applications on both ends
4. Unload the RC driver
5. Unload the EP driver
6. After system resume, the following process must be followed:
- Load the EP driver
- Load the RC driver
- Start PCIe applications
7. Load the EP driver
8. Load the RC driver
9. Start PCIe applications
10. If the link signal is unstable or a link down occurs due to a peer restart, restart both RC and EP to ensure PCIe functionality and system stability.
11. Do not load PCIe-related drivers when the PCIe function is not in use.
12. Before system restart, the following process must be followed:
- Stop PCIe applications on both ends
- Unload the RC driver
- Unload the EP driver
- Restart the RC system
- Restart the EP system
13. Stop PCIe applications on both ends
14. Unload the RC driver
15. Unload the EP driver
16. Restart the RC system
17. Restart the EP system

## Userspace Module Description

The userspace-related source code is located in the hbre directory. Detailed information for each module is as follows:

| side | component | output | Source file 
| both | S13E01C15 PCIe user library | libhbpcie.so | libhbpcie/ 
| both | S13E01C16 PCIe High Level API | libhbpciehl.so | libhbpciehl/
