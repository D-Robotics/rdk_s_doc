---
title: "调试串口"
sidebar_position: 16
description: "调试串口 USB Type-C 接线、串口工具配置与串口登录"
---

# 调试串口

调试串口是系统起不来时的**硬件级入口**——不依赖网络与系统是否正常，直接从板载调试串口看启动日志、进 U-Boot/恢复系统。网络登录不通时，串口是兜底手段。

## 硬件接线

RDK S100/S600 的调试串口由板载 CH340 芯片转为 USB，通过 USB Type-C 口输出，无需 TTL 串口线：

- RDK S100：USB Type-C（J16），内置 2 颗 CH340，分别对应 Main 域与 MCU 域调试串口。
- RDK S600：USB Type-C（J4），同样内置 2 颗 CH340。

用 USB Type-C 数据线连接板卡调试口与 PC，首次需安装 CH340 驱动（搜索 `CH340串口驱动` 下载安装），PC 会识别出 Main 域与 MCU 域两个串口，Main 域即 Linux 调试串口。

连接器位置与参数见各板硬件介绍：

- [RDK S100 硬件介绍 - Type-C (J16)](../01_Quick_start/01_hardware_introduction/01_rdk_s100.md#type-c-j16)
- [RDK S600 硬件介绍 - 闪连 烧录，Main&MCU 调试 (J4)](../01_Quick_start/01_hardware_introduction/02_rdk_s600.md#j4)

## PC 串口工具

装好 CH340 驱动后，用 `Putty`/`MobaXterm`/`minicom`/`SecureCRT` 连接 Main 域串口：

| 配置项 | 参数值 |
|---|---|
| 波特率（Baud rate） | 921600 |
| 数据位（Data bits） | 8 |
| 奇偶校验（Parity） | None |
| 停止位（Stop bits） | 1 |
| 流控（Flow Control） | 无 |

波特率 921600 可由板端内核命令行确认：`cat /proc/cmdline` 中 `console=ttyS0,921600n8`。

### Windows（MobaXterm）

新建 Serial 会话，选 PC 识别的 COM 口，按上表配置，连接后回车出登录提示，输入 `root`/`root`。

### macOS/Linux（minicom）

```bash
minicom -D /dev/ttyUSB0 -b 921600 -8
# 或 screen
screen /dev/ttyUSB0 921600
```

## 串口登录

连接并上电后，串口会输出启动日志（U-Boot → kernel → systemd）。系统起来后回车出登录提示，输入账户密码（见 [用户与权限管理](./14_user_permission.md)）。

## 进 U-Boot（系统起不来时）

上电瞬间在串口按任意键（或空格）打断自动引导，进入 U-Boot 命令行，可查/改启动参数、恢复引导。U-Boot 参数配置见 [配置 U-Boot 和 Kernel 选项参数](../07_Advanced_development/04_driver_development/01_uboot_kernel_config.md)。

## 常见问题

- **串口无输出**：选错串口（板卡识别出 Main/MCU 两个串口，选 Main 域）；波特率不对（确认 921600）；CH340 驱动未装。
- **乱码**：波特率不对（确认 921600）；macOS 驱动残留，见 [macOS 驱动残留导致仍乱码](https://developer.d-robotics.cc/xburn_doc/troubleshooting/serial-driver)。
- **进不了 U-Boot**：上电时机要早（启动日志一开始就打断），错过就重启重试。

## 相关文档

- [远程登录](../01_Quick_start/03_install_os_and_setup/05_remote_login.md)
- [用户与权限管理](./14_user_permission.md)
- [UART 驱动调试指南](../07_Advanced_development/04_driver_development/02_driver_uart_dev.md)
- [配置 U-Boot 和 Kernel 选项参数（进阶）](../07_Advanced_development/04_driver_development/01_uboot_kernel_config.md)
- [系统日志查看](./15_system_log.md)
