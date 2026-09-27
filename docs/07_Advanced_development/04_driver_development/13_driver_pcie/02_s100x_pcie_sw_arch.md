---
sidebar_position: 2
title: "PCIe 软件架构与模块划分"
description: "PCIe 内核态与用户态模块划分、驱动加载卸载顺序与休眠唤醒流程"
---
# PCIe 软件架构与模块划分

## 概述

本文介绍 PCIe 的软件分层、内核态与用户态模块划分，以及驱动的加载与卸载顺序。

- **定位**：说明 PCIe 软件由哪些模块组成、各模块产出什么、如何加载与卸载。
- **适用读者**：需要集成或排查 PCIe 驱动的模式 3 商业客户/深度团队。
- **前置条件**：了解 PCIe 硬件规格与链路模式，参见 [PCIe 硬件规格](./01_s100x_pcie_hw_guide.md) 与 [PCIe kernel 配置](./03_s100x_pcie_sw_setup.md)。
- **与其他模块关系**：驱动依赖内核 PCIe 子系统，用户态库基于内核驱动暴露的接口封装。

## 软件框架

PCIe 软件框架分为 RC 和 EP 两个部分：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/pcie/sw_arch.png" alt="软件框架示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## 驱动代码

```bash
source/hobot-drivers/pcie/hobot.c            # PCIe 控制器驱动（hobot-pcie.ko）
source/hobot-drivers/pcie/hobot-rc.c         # RC 控制器驱动（hobot-pcie-rc.ko）
source/hobot-drivers/pcie/hobot-ep.c         # EP 控制器驱动（hobot-pcie-ep.ko）
source/hobot-drivers/pcie/hobot-ep-dev/      # 设备管理（含 common/dev-manager/ep-dev）
source/hobot-drivers/pcie/hobot-ep-fun/      # EP 侧功能驱动（hobot-pcie-ep-fun）
```

内核配置参见 [PCIe kernel 配置](./03_s100x_pcie_sw_setup.md#defconfig)。

## 驱动模块说明

驱动相关的源码在 hobot-drivers/pcie 目录下，各个模块的细节信息如下（`component` 为需求维度，一个 `.ko` 可包含多个需求组件，故 `output` 列有重复）：

| side | component                          | output                    | Source file                     |
|------|------------------------------------|---------------------------|---------------------------------|
| both | S13E01C01 PCIe controller driver   | hobot-pcie.ko、hobot-pcie-common.ko | hobot.c、hobot-ep-dev/hobot-pcie-common/ |
| RC   | S13E01C02 PCIe device manager      | hobot-pcie-dev-manager.ko | hobot-ep-dev/hobot-pcie-dev-manager |
| both | S13E01C04 PCIe controller driver   | hobot-pcie-rc.ko          | hobot-rc.c（RC 侧，EP 侧见 hobot-ep-fun/vnet/） |
| RC   | S13E01C10 PCIe hybrid device driver | hobot-pcie-ep-dev.ko      | hobot-ep-dev/hobot-pcie-ep-dev  |
| RC   | S13E01C11 PCIe device wrapper      | hobot-pcie-ep-dev.ko      | hobot-ep-dev/hobot-pcie-ep-dev  |
| RC   | S13E01C08 PCIe EP resource download | hobot-pcie-ep-dev.ko      | hobot-ep-dev/hobot-pcie-ep-dev  |
| RC   | S13E01C09 PCIe vnet device          | hobot-pcie-ep-dev.ko      | hobot-ep-dev/hobot-pcie-ep-dev/vnet |
| EP   | S13E01C05 PCIe EP controller driver | hobot-pcie-ep.ko          | hobot-ep.c                      |
| both | S13E01C06 PCIe function wrapper    | hobot-pcie-ep-fun.ko      | hobot-ep-fun/（EP 侧，RC 侧见 hobot-ep-dev-wrapper.c） |
| both | S13E01C07 PCIe hybrid driver       | hobot-pcie-ep-fun.ko      | hobot-ep-fun/hybrid/            |
| both | S13E01C07 PCIe hybrid driver       | hobot-pcie-ep-dev.ko      | hobot-ep-dev/hobot-pcie-ep-dev/hybrid/ |

## PCIe 驱动加载/卸载

### RC 端加载

```shell
modprobe hobot-pcie
modprobe hobot-pcie-rc
modprobe hobot-pcie-common
modprobe hobot-pcie-ep-dev
modprobe hobot-pcie-dev-manager
```

### EP 端加载

```shell
modprobe hobot-pcie
modprobe hobot-pcie-common
modprobe hobot-pcie-ep
modprobe hobot-pcie-ep-fun
```

### RC 端卸载

```shell
rmmod hobot_pcie_dev_manager
rmmod hobot_pcie_ep_dev
rmmod hobot_pcie_common
rmmod hobot_pcie_rc
rmmod hobot_pcie
```

### EP 端卸载

```shell
rmmod hobot_pcie_ep_fun
rmmod hobot_pcie_ep
rmmod hobot_pcie_common
rmmod hobot_pcie
```

需要注意（以下流程针对同一块板上的 RC 与 EP 两个控制器角色；两板对连时，RC 侧与 EP 侧各自执行对应部分）：

1. 卸载驱动前一定要保证 PCIe 的应用程序都已关闭，按照先卸载 RC 驱动，再卸载 EP 驱动的顺序进行
2. 系统休眠前需要遵循以下流程：
   - 停掉两端的 PCIe 应用程序
   - 卸载 RC 驱动
   - 卸载 EP 驱动
3. 系统唤醒后需要遵循以下流程：
   - 加载 EP 驱动
   - 加载 RC 驱动
   - 启动 PCIe 应用程序
4. 链路信号不稳定或对端重启导致 PCIe link down 后，需要重启 RC 和 EP 以保证 PCIe 功能的可用性以及系统的稳定性
5. 不使用 PCIe 功能时不要加载相关驱动：`hsi-mode` 会把 HSI 端口的 lane 分配给 PCIe，加载后这部分 lane 无法再供以太网使用，各产品分配方式见 [PCIe 链路配置](./03_s100x_pcie_sw_setup.md#pcie-链路配置)
6. 系统重启前需要遵循以下流程：
   - 停掉两端的 PCIe 应用程序
   - 卸载 RC 驱动
   - 卸载 EP 驱动
   - RC 系统重启
   - EP 系统重启

## 用户态模块说明

用户态模块以预编译动态库形式随镜像发布，位于板端 `/usr/hobot/lib/`。开发包中同时提供头文件与库文件：

| side | component                     | output          | 头文件  | 板端路径 |
|------|-------------------------------|-----------------|--------|----------|
| both | S13E01C15 PCIe user library   | libhbpcie.so    | `source/hobot-multimedia-dev/usr/hobot/include/hb_pcie.h` | `/usr/hobot/lib/libhbpcie.so.2` |
| both | S13E01C16 PCIe High Level API | libhbpciehl.so  | `source/hobot-multimedia-dev/usr/hobot/include/hb_pcie_hl.h` | `/usr/hobot/lib/libhbpciehl.so.1` |

:::info 说明
本 SDK 工作区不包含这两个库的源码目录，仅提供头文件与预编译 `.so`（位于 `source/hobot-multimedia/debian/usr/hobot/lib/`）。接口用法与数据结构以头文件为准，见 [PCIe 用户态 API](./04_s100x_pcie_libhbpciehal.md)。
:::

## 相关文档

- [PCIe 硬件规格](./01_s100x_pcie_hw_guide.md)
- [PCIe kernel 配置](./03_s100x_pcie_sw_setup.md)
- [PCIe 用户态 API](./04_s100x_pcie_libhbpciehal.md)
