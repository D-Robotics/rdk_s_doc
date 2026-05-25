---
sidebar_position: 9
---

# 7.2.9 蓝牙初始化说明

```mdx-code-block
import DocScope from '@site/src/components/DocScope'
```

本章节介绍开发板蓝牙功能的初始化流程和使用方法。

## 概述

开发板支持通过 USB 或 UART 接口连接蓝牙模块。系统启动时，`hobot-bluetooth` 服务会自动检测并初始化蓝牙设备。

### 支持的蓝牙类型

| 类型 | 接口 | 说明 |
|------|------|------|
| USB 蓝牙 | USB 接口 | 通过 USB 接口连接的蓝牙适配器 |
| UART 蓝牙 | UART 串口 | 通过 UART 串口连接的蓝牙模块（如 CYW55560） |

## 系统服务

### hobot-bluetooth 服务

蓝牙初始化由 `hobot-bluetooth.service` 系统服务管理，该服务在系统启动时自动运行。

**服务配置文件位置**: `/lib/systemd/system/hobot-bluetooth.service`

```ini
[Unit]
Description=Hobot init Bluetooth
Before=getty.target system-getty.slice
After=hobot-loadko.service
StartLimitIntervalSec=60
StartLimitBurst=5

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/etc/init.d/hobot-bluetooth start
ExecStop=/usr/bin/hciconfig hci0 down > /dev/null 2>&1
TimeoutStartSec=1min
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 服务管理命令

```bash
# 查看服务状态
systemctl status hobot-bluetooth

# 手动启动服务
sudo systemctl start hobot-bluetooth

# 手动停止服务
sudo systemctl stop hobot-bluetooth

# 启用开机自启
sudo systemctl enable hobot-bluetooth

# 禁用开机自启
sudo systemctl disable hobot-bluetooth
```

## 初始化脚本说明

### 初始化流程

蓝牙初始化脚本 `/usr/bin/startbt.sh` 会按以下顺序检测和初始化蓝牙设备：

```
┌─────────────────────────────┐
│    蓝牙初始化开始             │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│    检测 USB 蓝牙设备         │
│    (lsusb -t | grep btusb)   │
└──────────────┬──────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
   检测到 USB      未检测到 USB
       │               │
       ▼               ▼
┌──────────────┐  ┌──────────────────┐
│ 加载 btusb   │  │ 检测 UART 蓝牙    │
│ 驱动模块     │  │ (/dev/ttyS1)      │
└──────┬───────┘  └────────┬─────────┘
       │                   │
       │           ┌───────┴───────┐
       │           │               │
       │           ▼               ▼
       │       检测到 UART    未检测到 UART
       │           │               │
       │           ▼               ▼
       │    ┌──────────────┐  ┌──────────────┐
       │    │ GPIO 控制    │  │   报错退出    │
       │    │ 固件下载     │  │              │
       │    │ hciattach    │  │              │
       │    └──────┬───────┘  └──────────────┘
       │           │
       └─────┬─────┘
             │
             ▼
    ┌──────────────────┐
    │ hciconfig hci0 up │
    │ hciconfig piscan  │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   初始化完成      │
    └──────────────────┘
```

### USB 蓝牙初始化

当检测到 USB 蓝牙设备时，初始化流程如下：

```bash
# 1. 加载 btusb 驱动模块
modprobe btusb

# 2. 等待固件加载完成
sleep 3

# 3. 启用蓝牙设备
hciconfig hci0 up
sleep 2
hciconfig hci0 piscan
```

### UART 蓝牙初始化

当检测到 UART 蓝牙设备时，初始化流程如下（以XM612为例，如果用户选择了不同的蓝牙模组，请联系蓝牙模组厂提供）：

```bash
# 配置参数
BT_REG_GPIO=427              # 蓝牙使能 GPIO
UART_PORT="/dev/ttyS1"       # UART 端口
UART_BAUD=921600             # 波特率
FW="/lib/firmware/cypress/CYW55560A1.hcd"  # 固件路径

# 1. 导出并配置 GPIO
echo 427 > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio427/direction

# 2. 复位蓝牙模块
echo 0 > /sys/class/gpio/gpio427/value
sleep 1
echo 1 > /sys/class/gpio/gpio427/value
sleep 2

# 3. 下载固件
mbt download /lib/firmware/cypress/CYW55560A1.hcd --autobaud3M
mbt update_baudrate 921600

# 4. 启动 HCI attach
hciattach -s 921600 /dev/ttyS1 any 921600 &

# 5. 启用蓝牙设备
hciconfig hci0 up
hciconfig hci0 piscan
```

## 蓝牙固件

### 固件存放路径

蓝牙固件存放在以下目录：

| 芯片型号 | 固件路径 |
|---------|---------|
| Realtek RTL8852BTU | `/lib/firmware/rtl_bt/rtl8852btu_fw.bin` |
| Realtek RTL8723BS | `/lib/firmware/rtl_bt/rtl8723bs_fw.bin` |
| Cypress CYW55560 | `/lib/firmware/cypress/CYW55560A1.hcd` |

### 查看已加载固件

```bash
# 查看 rtl_bt 固件
ls -la /lib/firmware/rtl_bt/

# 查看 cypress 固件
ls -la /lib/firmware/cypress/
```

## 蓝牙状态查询

### 查看蓝牙设备

```bash
# 查看蓝牙设备列表
hciconfig

# 查看蓝牙设备详细信息
hciconfig hci0
```

输出示例：
```
hci0:   Type: Primary  Bus: USB
        BD Address: 00:11:22:33:44:55  ACL MTU: 1021:8  SCO MTU: 64:1
        UP RUNNING PSCAN ISCAN
        RX bytes:1234 acl:0 sco:0 events:456 bytes:789
        TX bytes:987 acl:0 sco:0 commands:123 errors:0
```

### 查看蓝牙设备属性

```bash
# 查看蓝牙设备状态
hciconfig hci0 status

# 查看蓝牙设备地址
hciconfig hci0 | grep "BD Address"
```

## 蓝牙操作命令

### 启用/禁用蓝牙

```bash
# 启用蓝牙设备
sudo hciconfig hci0 up

# 禁用蓝牙设备
sudo hciconfig hci0 down

# 启用扫描模式
sudo hciconfig hci0 piscan

# 禁用扫描模式
sudo hciconfig hci0 noscan
```

### 蓝牙扫描

```bash
# 扫描附近的蓝牙设备
hcitool scan

# 扫描低功耗蓝牙设备
hcitool lescan
```

### 蓝牙配对

```bash
# 使用 bluetoothctl 进行配对
bluetoothctl

# 在 bluetoothctl 交互界面中：
[bluetooth]# power on
[bluetooth]# agent on
[bluetooth]# default-agent
[bluetooth]# scan on
[bluetooth]# pair XX:XX:XX:XX:XX:XX
[bluetooth]# trust XX:XX:XX:XX:XX:XX
[bluetooth]# connect XX:XX:XX:XX:XX:XX
```

## 常见问题

### 蓝牙设备未识别

如果蓝牙设备未被识别，请检查：

1. **检查服务状态**
   ```bash
   systemctl status hobot-bluetooth
   ```

2. **检查设备连接**
   ```bash
   # USB 蓝牙
   lsusb

   # UART 设备
   ls -la /dev/ttyS*
   ```

3. **检查驱动模块**
   ```bash
   lsmod | grep bt
   ```

### 固件加载失败

如果固件加载失败：

1. **检查固件文件是否存在**
   ```bash
   ls -la /lib/firmware/rtl_bt/
   ls -la /lib/firmware/cypress/
   ```

2. **检查内核日志**
   ```bash
   dmesg | grep -i bluetooth
   dmesg | grep -i firmware
   ```

### UART 蓝牙初始化失败

如果 UART 蓝牙初始化失败：

1. **检查 GPIO 状态**
   ```bash
   cat /sys/class/gpio/gpio427/value
   ```

2. **检查 UART 端口权限**
   ```bash
   ls -la /dev/ttyS1
   ```

3. **手动测试 UART**
   ```bash
   stty -F /dev/ttyS1 921600
   cat /dev/ttyS1 &
   echo "test" > /dev/ttyS1
   ```

### 手动重新初始化蓝牙

如果需要手动重新初始化蓝牙：

```bash
# 停止蓝牙服务
sudo systemctl stop hobot-bluetooth

# 禁用蓝牙设备
sudo hciconfig hci0 down

# 卸载驱动模块
sudo rmmod btusb

# 重新加载驱动
sudo modprobe btusb

# 启动蓝牙服务
sudo systemctl start hobot-bluetooth
```
