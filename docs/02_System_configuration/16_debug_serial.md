---
title: 调试串口
sidebar_position: 16
description: TTL-USB 串口线硬件接线、工具配置与串口登录
---

# 2.16 调试串口

调试串口是系统起不来时的**硬件级入口**——不依赖网络与系统是否正常，直接从板载调试串口看启动日志、进 U-Boot/恢复系统。网络登录不通时，串口是兜底手段。

:::info 说明
本节为硬件接线 + 串口工具操作，未在板端实测（需 TTL-USB 串口线与硬件连接）；波特率与引脚以板端调试串口章节为准。
:::

## 硬件接线

- 用 **TTL-USB 串口线**（3.3V 逻辑电平，非 RS232）连接板载调试串口：
  - 串口线 **GND → 板 GND**
  - 串口线 **TXD → 板 RXD**
  - 串口线 **RXD → 板 TXD**
- 不要接 VCC（板子自己供电），避免电压冲突。

引脚位置见各板硬件介绍的调试串口章节：

- [RDK S100 硬件介绍 - 调试串口](../01_Quick_start/01_hardware_introduction/01_rdk_s100.md)
- [RDK S600 硬件介绍 - 调试串口](../01_Quick_start/01_hardware_introduction/02_rdk_s600.md)

## PC 串口工具

串口线接 PC 后装驱动（USB 转串口芯片，如 CH340/CP210x），用 `Putty`/`MobaXterm`/`minicom` 连接：

| 配置项 | 参数值 |
|---|---|
| 波特率（Baud rate） | 921600 |
| 数据位（Data bits） | 8 |
| 奇偶校验（Parity） | None |
| 停止位（Stop bits） | 1 |
| 流控（Flow Control） | 无 |

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

- **串口无输出**：TXD/RXD 接反（互换再试）；波特率不对（确认 921600）；串口线驱动未装。
- **乱码**：波特率或电平不对（必须 3.3V TTL，非 RS232）；macOS 驱动残留，见 [macOS 驱动残留导致仍乱码](https://developer.d-robotics.cc/xburn_doc/troubleshooting/serial-driver)。
- **进不了 U-Boot**：上电时机要早（启动日志一开始就打断），错过就重启重试。

## 相关文档

- [远程登录](../01_Quick_start/03_install_os_and_setup/remote_login.md)
- [用户与权限管理](./14_user_permission.md)
- [配置 U-Boot 和 Kernel 选项参数（进阶）](../07_Advanced_development/04_driver_development/01_uboot_kernel_config.md)
- [系统日志查看](./15_system_log.md)
