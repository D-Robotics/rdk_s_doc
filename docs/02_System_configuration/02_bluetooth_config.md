---
title: "蓝牙配置"
sidebar_position: 2
description: "蓝牙服务状态、扫描、配对、连接"
---

# 蓝牙配置

RDK OS 预装 BlueZ 蓝牙栈，`bluetooth.service` 默认启用。板端可用 `bluetoothctl` 扫描、配对、连接蓝牙设备（键鼠、耳机、BLE 外设等）。蓝牙驱动初始化见进阶 [蓝牙初始化说明](../07_Advanced_development/03_system_software/05_bluetooth_init.md)。

## 查看蓝牙状态

```bash
systemctl is-active bluetooth        # 服务是否运行
rfkill list                          # 是否被软/硬关闭
hciconfig                            # 控制器状态
```

RDK S600 实测（USB 蓝牙适配器 hci0）：

```text
$ systemctl is-active bluetooth
active

$ rfkill list
1: hci0: Bluetooth
        Soft blocked: no
        Hard blocked: no

$ hciconfig
hci0:   Type: Primary  Bus: USB
        BD Address: EC:3A:56:69:C4:E1  ACL MTU: 1021:8  SCO MTU: 255:12
        UP RUNNING PSCAN ISCAN
```

`Soft/Hard blocked: no` + `UP RUNNING` 表示蓝牙已就绪。若 blocked，用 `sudo rfkill unblock bluetooth` 解锁。

## 扫描与配对（bluetoothctl）

`bluetoothctl` 是交互式命令行工具（版本 5.72）：

```bash
bluetoothctl
# 进入交互后：
[bluetooth]# power on               # 开电源
[bluetooth]# agent on
[bluetooth]# default-agent
[bluetooth]# scan on                 # 开始扫描
# 看到目标设备后记下 MAC 地址
[bluetooth]# pair <MAC>              # 配对
[bluetooth]# trust <MAC>             # 信任（免重复配对）
[bluetooth]# connect <MAC>           # 连接
[bluetooth]# quit
```

配对时双方需确认 PIN 或一致码。成功后设备列入 `bluetoothctl devices`。

## 已配对/连接设备

```bash
bluetoothctl devices                 # 已配对设备列表
bluetoothctl info <MAC>               # 某设备详情（含 Connected 状态）
```

断开：`bluetoothctl disconnect <MAC>`；移除：`bluetoothctl remove <MAC>`。

## 开机自动重连

`trust` 过的设备，`bluetooth.service` 启动后会自动重连（需设备也在可发现状态）。若不自动重连，检查 `/etc/bluetooth/main.conf` 的 `AutoConnect=true`。

## 常见问题

- **`rfkill` 显示 blocked**：`sudo rfkill unblock bluetooth`；部分板子有硬件开关需手动打开。
- **扫描不到设备**：确认对端可发现；`hciconfig` 是否 `UP`；USB 适配器是否被识别（`lsusb`）。
- **配对后无法连接**：`trust` 该设备；音频设备需额外配 pulseaudio/pipewire profile。
- **开机不自动重连**：检查 `/etc/bluetooth/main.conf` 的 `AutoConnect`、`FastConnectable`。

## 相关文档

- [蓝牙初始化说明（进阶）](../07_Advanced_development/03_system_software/05_bluetooth_init.md)
- [网络配置](./01_network_config.md)
- [开机自启动配置](./06_self_start.md)
