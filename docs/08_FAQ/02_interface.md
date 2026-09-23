---
sidebar_position: 2
title: "接口、外设与驱动"
description: "接口、外设与驱动 常见问题与排查"
---

# 接口、外设与驱动

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

### 40PIN 接口

#### Q1: 开发板是否支持将40PIN 中的 VDD_5V 作为电源输入？
**A:** 开发板 V1.2及以上版本可以支持。版本号通常可以通过查看开发板 PCB 板上的丝印信息来确认。请务必谨慎操作，并确认您的板卡版本确实支持此功能，错误的供电方式可能导致硬件损坏。

#### Q2: 开发板是否支持通过 C/C++语言操作40PIN GPIO 接口？
**A:** 是的，支持。您可以参考 D-Robotics 开发者社区论坛中的相关文章和代码示例，例如：
* C/C++ GPIO 库：请优先使用当前文档与 SDK 中提供的接口和示例。
* 查阅对应 RDK 型号的官方文档中关于 GPIO 开发的章节，通常会提供底层的操作方法或推荐的库。

### 串口

#### Q3: 开发板上电后，调试串口无任何日志显示，怎么办？
**A:** 请按以下步骤排查：
1.  **电源指示灯**： 检查开发板上的红色电源指示灯是否已正常点亮。如果未点亮，请先解决供电问题。
2.  **串口线连接**：
    * 确保调试串口线（通常是一端连接板卡 DEBUG 口，另一端连接 USB 转串口模块）已正确连接。
    * 特别注意 USB 转串口模块与板卡 DEBUG 口之间 TX、RX、GND 线的对应关系（通常是模块 TX 接板卡 RX，模块 RX 接板卡 TX，模块 GND 接板卡 GND）。
    * 参考官方文档中关于“调试串口”或“远程登录”章节的连接图示。
3.  **串口终端软件参数配置**：
    * 确保您电脑上的串口终端软件（如 PuTTY, MobaXterm, minicom, SecureCRT 等）参数配置正确。RDK 板卡调试串口通常的配置为：
        * **波特率 (Baud rate):** 921600 (这是一个高速波特率，部分旧型号或特定场景可能使用115200，请以板卡文档为准)
        * **数据位 (Data bits):** 8
        * **停止位 (Stop bits):** 1
        * **奇偶校验 (Parity):** None (无)
        * **流控 (Flow control):** None (无)
    * 串口号 (COM Port)：确保选择了连接 USB 转串口模块后在电脑设备管理器中识别到的正确串口号。
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/interface/image-20221124200013163.png" alt="串口终端参数配置示例" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
4.  **USB 转串口模块驱动**： 确保电脑已正确安装 USB 转串口模块的驱动程序。
5.  **尝试其他串口模块或 USB 口**： 排除模块或 USB 接口故障的可能。

### 网络接口

#### Q4: 开发板连接网络后无法上网，如何处理？
**A:**
1.  **检查物理连接**：
    * **有线网络**： 确保网线已正确连接到开发板的以太网口和路由器/交换机，并且对应端口的指示灯状态正常。
    * **无线网络**： 确保已正确连接到 Wi-Fi SSID，并且密码输入正确。
2.  **IP 地址配置**：
    * **DHCP 自动获取**： 大多数情况下，网络应配置为通过 DHCP 自动获取 IP 地址。检查路由器 DHCP 服务是否正常，以及板卡是否成功获取到 IP 地址 (`ifconfig` 或 `ip addr` 命令查看)。
    * **静态 IP**： 如果您配置了静态 IP 地址，请确保 IP 地址、子网掩码、网关地址和 DNS 服务器地址都配置正确，并且与您的局域网环境相符。
3.  **网关和 DNS 检查**：
    * 确保板卡获取到或配置了正确的网关地址（通常是路由器的 IP 地址）。
    * 确保配置了有效的 DNS 服务器地址（可以尝试使用公共 DNS 如 `8.8.8.8` 或 `114.114.114.114` 进行测试）。可以通过 `ping www.baidu.com` 等命令测试 DNS 解析和外网连通性。
4.  **查看网络状态**：
    * 使用 `ifconfig` 或 `ip addr` 查看网络接口状态和 IP 配置。
    * 使用 `route -n` 查看路由表信息。
    * 使用 `ping <网关IP>` 测试到网关的连通性。
5.  **参考官方文档**： 详细的网络配置步骤和故障排除方法，请参考官方文档中关于“网络配置”的章节。
    <DocScope products="RDK S100">
    [RDK S100 网络配置](/System_configuration/network_config)
    </DocScope>

#### Q5: 开发板无法通过 SSH 远程连接，可能是什么原因？
**A:**
* **提示 `Connection timed out`**：
    * **原因**： 这通常表示网络通讯层面存在问题，您的电脑无法在网络上找到或连接到开发板的 SSH 服务端口（默认为22）。
    * **排查**：
        1.  确认开发板已开机并成功连接到网络（有线或无线）。
        2.  确认您知道开发板的正确 IP 地址。
        3.  在您的电脑上尝试 `ping <开发板IP地址>`，看是否能 ping 通。如果 ping 不通，则先解决网络连接问题（检查 IP 配置、网线、Wi-Fi 连接、路由器设置、防火墙等）。
        4.  确认开发板上的 SSH 服务 (`sshd`) 正在运行。可以尝试通过串口登录后，执行 `sudo systemctl status ssh` 或 `ps aux | grep sshd` 查看。如果未运行，尝试启动：`sudo systemctl start ssh`。
        5.  检查电脑或网络中是否有防火墙阻止了到开发板22端口的连接。
    * **参考**： [SSH登录](../01_Quick_start/03_install_os_and_setup/05_remote_login.md)章节。

* **提示 `Authentication failed` 或 `Permission denied, please try again.`**：
    * **原因**： 这表示网络连接已建立，但您提供的用户名或密码不正确，SSH 服务器拒绝了您的登录请求。
    * **排查**：
        1.  仔细检查您输入的用户名是否正确（例如 `sunrise`, `root`, `hobot` 等，取决于您的系统镜像和配置）。
        2.  仔细检查您输入的密码是否正确，注意大小写。
        3.  尝试使用开发板的默认账户和密码（如果未修改过）。
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/interface/image-20221124201544978.png" alt="SSH认证失败示例" style={{ width: '50%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

#### Q6: 开发板使用无线网络时，连接不稳定、传输速度慢，怎么办？
**A:**
1.  **信号强度与干扰**：
    * 开发板的板载 Wi-Fi 天线性能可能有限，尤其是在有金属外壳、大型散热器或其他电子设备干扰的情况下，Wi-Fi 信号强度可能会减弱。
    * **解决方法**： 如果您的开发板支持外接 Wi-Fi 天线（通常会有一个 IPEX 或 SMA 等类型的天线接口），强烈建议**安装一根外置 Wi-Fi 天线**以增强信号接收能力和连接稳定性。
2.  **路由器位置与信道**：
    * 尽量让开发板靠近无线路由器，减少物理障碍。
    * 尝试在路由器设置中更改 Wi-Fi 信道，避开周围环境中其他无线信号拥挤的信道。
3.  **驱动与固件**： 确保开发板上的 Wi-Fi 模块驱动和固件是最新或稳定的版本（通常随系统更新提供）。
4.  **网络负载**： 检查局域网内是否有其他设备占用了大量带宽。
5.  **2.4GHz vs 5GHz**： 如果您的开发板和路由器都支持5GHz Wi-Fi，尝试连接到5GHz 频段，通常干扰较少且速度更快（但穿墙能力弱于2.4GHz）。

#### Q7: 开发板无线网络无法使用，使用`ifconfig`命令查询不到`wlan0`设备（或类似无线网络接口名），如何处理？
**A:** 如果 `ifconfig` 或 `ip addr` 命令的输出中没有显示无线网络接口（如 `wlan0`），可能的原因及解决方法：
1.  **无线模块被软禁用 (RFKill)**：
    * 系统可能通过 RFKill 机制将无线模块在软件层面禁用了。
    * **解决方法**： 尝试执行以下命令解除对 WLAN 的软阻塞：
        ```bash
        sudo rfkill unblock wlan
        # 或者 sudo rfkill unblock all
        ```
        然后再用 `ifconfig -a` 或 `ip link show` 查看接口是否出现。
2.  **驱动问题**：
    * 无线模块的驱动程序可能没有正确加载或工作不正常。可以尝试查看内核日志 (`dmesg | grep -i wlan` 或 `dmesg | grep -i wifi`) 是否有相关错误信息。
    * 确保系统已安装了对应无线芯片的正确驱动和固件（通常由`hobot-wifi`等软件包提供）。
3.  **硬件问题**： 极少数情况下，可能是无线模块本身硬件故障。
4.  **系统镜像或配置问题**： 确保您使用的系统镜像支持板载的无线模块，并且相关的内核配置已启用。

### USB 接口

#### Q8: 开发板接入 USB 摄像头后，默认的设备节点是什么？
**A:** 在 RDK 板卡上，当您接入一个标准的 UVC (USB Video Class) 摄像头后，它在 Linux 系统中创建的视频设备节点通常**不是**像 PC 上常见的 `/dev/video0`。
* **默认设备节点通常是：`/dev/video8`**
* 也可能是 `/dev/video9`, `/dev/video10` 等，如果系统中有其他视频设备或多个 USB 摄像头。

您可以在接入 USB 摄像头后，执行 `ls /dev/video*` 来查看实际生成的设备节点。在 OpenCV 等程序中使用摄像头时，需要指定这个正确的设备节点号（例如，`cv2.VideoCapture(8)`）。

#### Q9: 开发板插入 USB 摄像头后，没有生成预期的 `/dev/video8`（或其他）设备节点，怎么办？
**A:**
1.  **确认 USB 摄像头本身是否正常**：
    * 将该 USB 摄像头连接到一台 PC 电脑上，看是否能被正确识别和使用。这有助于判断是摄像头的问题还是板卡的问题。
2.  **检查 USB 连接**：
    * 确保 USB 摄像头已牢固插入到开发板的 USB Host 接口。
    * 尝试重新插拔摄像头，或者更换到开发板上的其他 USB Host 接口（如果板卡有多个）。
3.  **避免 Micro USB 接口冲突（针对特定板卡）**：
    * 部分开发板的 Micro USB 接口可能用于系统调试、ADB 或作为 USB Device 功能，**当此 Micro USB 接口通过数据线连接到 PC 时，可能会影响板上其他 USB Host 接口的功能或 USB 设备的枚举**。
    * **解决方法**： 如果您的 Micro USB 接口正连接着数据线（例如用于串口调试或 ADB），请尝试**断开该 Micro USB 数据线**，然后再测试 USB 摄像头是否能被识别。
4.  **查看内核日志**：
    * 在插入 USB 摄像头后，立即通过串口或 SSH 登录到板卡，执行 `dmesg | tail` 查看最新的内核日志。日志中通常会包含 USB 设备插入、识别、驱动加载或失败的详细信息。
5.  **USB 供电问题**：
    * 部分功耗较大的 USB 摄像头可能需要 USB 接口提供足够的电流。如果开发板 USB 口供电不足（虽然不常见于标准 UVC 摄像头），可能会导致识别失败。可以尝试通过一个带独立供电的 USB Hub 来连接摄像头。
6.  **驱动兼容性**：
    * 绝大多数 USB 摄像头都遵循 UVC 标准，RDK 的 Linux 内核通常内置了 UVC 驱动。但极少数非标准或特殊的 USB 摄像头可能存在驱动兼容性问题。

#### Q10: 开发板接入 USB 遥控手柄（Gamepad/Joystick）后无法使用，没有生成 `/dev/input/js0` 设备节点，如何解决？
**A:** 如果 USB 游戏手柄接入后没有自动创建 `/dev/input/jsX` (如 `js0`) 设备节点，通常是缺少相应的内核驱动或用户空间工具。
1.  **更新系统**： 首先，确保您的开发板系统是最新的，因为新系统可能已包含更多驱动支持。
    ```bash
    sudo apt update && sudo apt upgrade
    ```
2.  **加载内核驱动模块**： 游戏手柄通常需要 `joydev` 内核模块。尝试手动加载它：
    ```bash
    sudo modprobe joydev
    # 或者 sudo modprobe -a joydev (尝试加载所有相关模块)
    ```
    加载后，再次检查 `/dev/input/` 目录下是否出现 `jsX` 设备。
3.  **安装测试工具 (joystick 包)**： 为了方便测试和使用手柄，可以安装 `joystick` 软件包，它包含了一些用户空间的工具。
    ```bash
    sudo apt install joystick
    ```
4.  **测试手柄**： 安装完 `joystick` 包后，如果 `/dev/input/js0` (或其他 `jsX`) 设备节点已存在，可以使用 `jstest` 命令来测试手柄的按键和轴是否能被正确读取：
    ```bash
    jstest /dev/input/js0
    ```
    在 `jstest` 运行时，按动手柄的按钮或拨动摇杆，终端上应该能看到相应的事件输出。
5.  **查看内核日志**： 如果以上步骤无效，插入手柄后查看 `dmesg` 日志，看是否有关于 USB 设备识别或驱动加载的错误信息。

### MIPI CSI 接口

#### Q11: 开发板接入 MIPI 摄像头后无法使用，`i2cdetect`命令无法检测到摄像头的 I2C 地址，是什么原因？
**A:**
1.  **摄像头连接方式错误**：
    * **FPC 排线方向**： MIPI 摄像头通过 FPC 软排线连接。请务必确认排线的插入方向是否正确（通常排线两端的蓝色加强筋面需要朝向连接器卡扣的扳手面，或遵循板卡和摄像头模组上的标记）。错误的插入方向会导致无法通信。
    * **连接器锁紧**： 确保 FPC 排线已完全插入连接器，并且连接器两端的卡扣已牢固锁紧。
    * **接口对应**： 如果板卡有多个 MIPI CSI 接口，确保摄像头连接到了您在软件配置或设备树中指定的那个接口。
    * **参考文档**： 仔细查阅您所使用的 RDK 板卡型号对应的硬件手册或快速入门指南中关于“MIPI 摄像头”连接的章节，确认连接细节。
        <DocScope products="RDK S100">
        [RDK S100 MIPI 摄像头](/Quick_start/hardware_introduction/rdk_s100/rdk_camera_expansion_board/rdk_camera_expansion_board)
        </DocScope>
2.  **禁止带电插拔**：
    * **严禁在开发板通电的情况下插拔 MIPI 摄像头！** 带电操作极易因瞬间的电流冲击或引脚接触顺序错误而导致摄像头模组或板卡 MIPI 接口电路短路损坏。
3.  **I2C 总线和地址**：
    * 确认您使用的 `i2cdetect -y -r <bus_number>` 命令中的 `<bus_number>` 是否是摄像头实际连接的 I2C 总线号。不同的 MIPI 接口可能对应不同的 I2C 总线。
    * 确认您知道该摄像头模组的正确 I2C 从设备地址。
4.  **摄像头供电或时钟问题**： 确保摄像头模组获得了正确的供电，并且 MIPI 时钟信号正常。
5.  **摄像头模组或 FPC 排线损坏**： 如果排查了以上所有因素，仍无法检测到，则可能是摄像头模组本身或 FPC 排线存在物理损坏。
6.  **设备树配置**： 确保 Linux 内核的设备树中已正确配置了该 MIPI 接口和所连接的摄像头型号的驱动信息。

#### Q12: 运行 MIPI 摄像头示例程序时报错 `ValueError: invalid literal for int() with base 10: b'open device /dev/lt8618_ioctl failed\ndevice not open\n1080'`，如何解决？
**A:** 这个报错信息 `ValueError: invalid literal for int() with base 10: b'open device /dev/lt8618_ioctl failed\ndevice not open\n1080'` 通常表明程序在尝试解析一个期望是纯数字的字符串时，收到了一个包含错误信息和数字混合的字符串。在这个特定的例子中，`b'open device /dev/lt8618_ioctl failed\ndevice not open\n1080'` 这部分，程序可能期望只获取到分辨率相关的数字（如'1080'），但由于打开显示相关的设备 (`/dev/lt8618_ioctl`，这似乎是一个 HDMI 相关的控制接口）失败，导致返回了错误信息。

**主要原因及解决方法**：
* **权限不足**： 许多与硬件直接交互的操作（如打开设备节点、配置显示参数等）需要 root 权限。如果您是使用普通用户（如 `sunrise`）运行示例程序，可能会因为权限不足而导致打开设备失败。
    * **解决方法**： 尝试使用 `sudo` 以 root 权限运行示例程序：
        ```bash
        sudo python3 mipi_camera.py
        ```
* **依赖的显示设备未就绪或配置错误**：
    * `lt8618` 似乎是一个 HDMI 发送芯片的型号。如果示例程序依赖于这个 HDMI 输出设备，而该设备未能正确初始化或被其他程序占用，也可能导致此错误。
    * 确保 HDMI 显示器已正确连接并被系统识别（如果示例需要 HDMI 输出）。
    * 检查相关的内核日志 (`dmesg`) 是否有关于 `lt8618` 或显示初始化的错误。

### 显示接口

#### Q13: 开发板的 HDMI 接口可以支持哪些分辨率？
**A:** RDK 开发板 HDMI 接口具体支持的分辨率类型会因**板卡型号、SoC 型号、以及所运行的 RDK OS 系统版本**而有所不同。
* **通用支持**： 大部分 RDK 板卡至少会支持一些常见的分辨率，如：
    * 1920x1080 (1080p) @ 60Hz/50Hz/30Hz
    * 1280x720 (720p) @ 60Hz/50Hz
    * 更低的分辨率如 640x480, 800x600 等。
* **特定型号和版本**：
    * 较新版本的 RDK OS 通常会引入对更多分辨率和刷新率组合的支持。
    * 不同性能档位的板卡在 HDMI 输出能力（如是否支持4K 分辨率）上会有差异。
* **查询方法**：
    1.  **官方文档**： 最准确的信息来源是查阅您所使用的具体 RDK 板卡型号和系统版本的官方《用户手册》或《硬件规格说明书》中关于“HDMI 接口”或显示子系统的章节。
    2.  **系统内查询（如果已连接显示器）**：
        * 如果板卡已连接显示器并能进入 Linux 系统（例如 Desktop 版），有时可以通过 `xrandr` 命令（在 X Window 环境下）查看当前活动输出支持的分辨率模式。
        * 查看内核启动日志 (`dmesg | grep -i hdmi` 或 `dmesg | grep -i drm`)，有时会打印出显示驱动初始化时检测到的显示器支持模式。
    3.  **`srpi-config` 工具**： 部分 RDK 系统版本中的 `srpi-config` 工具可能允许查看或配置 HDMI 输出分辨率。

    如果您遇到特定显示器不兼容的问题，除了检查分辨率，还需要考虑显示器的 EDID 信息是否能被板卡正确解析。

<DocScope products="RDK S100">

### GPIO 扩展芯片

#### Q14: 40PIN 上的 GPIO0–GPIO9 是 SoC 原生引脚吗？做高速翻转或精确时序时有什么限制？
**A:** 不是原生引脚。S100 40PIN 上的 `40PIN_GPIO0_3V3` 至 `40PIN_GPIO9_3V3` 共 10 个 GPIO **由板载 GPIO 扩展 IC（TPT2955x 系列，I2C 接口）提供**，并非 SoC 原生 GPIO；该 IC 内部默认带 100K 上拉电阻。
* **速度限制**： 扩展 IC 通过 I2C 总线（`i2c-0`，从设备地址 `0x27`）控制，每一次电平翻转都要走一次 I2C 传输，实测翻转速率远低于原生 GPIO，无法用于微秒级精确时序、位模拟协议（bit-bang）等场景。
* **适用场景**： LED 指示、按键检测、低速片选/复位控制等对速度不敏感的输出或输入。
* **高性能替代**：
    * 需要**硬件 PWM** 输出时，使用 40PIN 的 `LPWM1` 引脚（Pin 32/33，SoC 原生 LPWM 控制器）。
    * 需要更高翻转速度的 GPIO 时，使用 40PIN 上由 SoC 原生提供的复用引脚（如 `SPI0`、`I2C4`/`I2C5`、`PCM0` 相关引脚可复用为 GPIO）。
* **验证方法**： 在板端执行以下命令可以看到扩展芯片对应的 gpiochip：
    ```bash
    # 查看所有 gpiochip 及其 base/数量
    ls /sys/class/gpio/
    for c in /sys/class/gpio/gpiochip*/; do echo "$c: $(cat $c/label)"; done
    ```
    其中 label 为 `tpt29555a`（base 407，16 路）的 gpiochip 即 40PIN GPIO0–GPIO9 所在的扩展芯片（`gpio-line-names` 为 `40PIN_GPIO0`…`40PIN_GPIO9`）。

</DocScope>

<DocScope products="RDK S100">

### 串口资源与占用

#### Q15: 为什么 /dev/ttyS1 打不开或读不到数据？可以用哪些串口外接自己的设备？
**A:** S100 的串口资源是固定的，`/dev/ttyS1` 有专门用途，随意占用会破坏蓝牙功能：
* **每个串口的归属（S100 实测）**：

    | 设备节点 | 归属 | 能否外接设备 |
    | --- | --- | --- |
    | `/dev/ttyS0` | 调试控制台（console=ttyS0） | 否 |
    | `/dev/ttyS1` | 蓝牙（`hobot-bluetooth` 服务用 `hciattach` 占用） | 否 |
    | `/dev/ttyS2` | 默认 disabled（占位节点，`/proc/tty/driver/serial` 显示 `uart:unknown`） | 改 DTS 启用后可用 |
    | `/dev/ttyS3` | 默认 disabled（占位节点） | 改 DTS 启用后可用 |

* **`ttyS1` 被占用的表现**： 蓝牙服务运行期间，`fuser /dev/ttyS1` 能看到 `hciattach` 进程；此时自己程序打开该串口读写会与蓝牙流量互相干扰。
* **外接串口设备的正确做法**：
    1. 使用 40PIN 上的 **UART2**（`UART2_TX_3V3`/`UART2_RX_3V3`，与 I2C5 复用，通过 SW6 拨码切换），配合 `test_serial.py` 等示例使用，参考[UART 示例文档](/Demos/peripheral/01_40pin/s100/uart)。
    2. 默认 disabled 的串口（如 `/dev/ttyS2`）需修改设备树启用并配置 pinctrl 后才可使用（未启用时执行 `stty -F /dev/ttyS2` 会报 `Input/output error`），参考[UART 驱动开发文档](/Advanced_development/driver_development/driver_uart_dev)。
* **排查命令**：
    ```bash
    # 看串口是否被占用
    fuser /dev/ttyS1
    # 看蓝牙服务是否在用 ttyS1
    systemctl status hobot-bluetooth
    ps aux | grep hciattach
    ```

</DocScope>

<DocScope products="RDK S100">

### 蓝牙与无线模组

#### Q16: 手动运行 mbt 命令时报 environtment set MBT_TRANSPORT not found，怎么解决？
**A:** `mbt` 工具依赖两个环境变量，未导出时会直接报错退出：
```bash
export MBT_TRANSPORT=/dev/ttyS1      # mbt 通信的 UART 端口
export MBT_REG_ON_GPIO=427           # 蓝牙模组使能/复位 GPIO
```
导出后再执行 `mbt download`、`mbt update_baudrate` 等命令即可。系统自带的 `startbt.sh` 内部已包含这两行 export，所以服务自动初始化不受影响；只有手动执行 mbt 时才需要自己导出。完整手动初始化流程参考[蓝牙初始化说明](/Advanced_development/system_software/bluetooth_init)。

#### Q17: 插了一个 USB 无线接收器，蓝牙还是没反应，是板子的问题吗？
**A:** 先确认插入的是**蓝牙 dongle** 还是 **2.4G 无线键鼠接收器**，两者外观相似但完全不同：
* **确认方法**： 插入后执行 `lsusb`，看设备的 Class 字段：
    ```bash
    lsusb
    ```
    * **蓝牙 dongle**： Class 为 `e0`（Wireless Controller），插入后由 `btusb` 驱动接管，会生成 `hci0`。
    * **2.4G 键鼠接收器**： Class 为 `03`（HID），绑定 `usbhid` 驱动，只用于自家键鼠通信，与蓝牙协议栈无关，**不会触发任何蓝牙初始化**。
* **板端验证**： S100 内核自带 `btusb` 驱动模块，插入 Class e0 的标准蓝牙 dongle 即可被识别，无需额外装驱动。
* **S100 板载模组**： S100 通过 J17 M.2 Key E 接口外接 Wi-Fi/蓝牙 combo 模组（AzureWave CYW55560），蓝牙走 UART 而非 USB，不占用 USB 口，也不需要 USB dongle。

#### Q18: hci0 起不来，hobot-bluetooth 服务一直卡住或反复重启，怎么办？
**A:** S100 的蓝牙在 UART 上（M.2 Key E combo 模组），服务卡住基本都是模组硬件链路问题：
1.  **确认模组在位**： 检查 J17 M.2 Key E 插槽上的 Wi-Fi/蓝牙 combo 模组是否插紧、固定螺丝是否拧上、两根天线是否接好（U.FL 座易松）。
2.  **看服务卡在哪一步**：
    ```bash
    systemctl status hobot-bluetooth
    journalctl -u hobot-bluetooth -e
    ```
    * 卡在 `mbt download ... CYW55560A1.hcd` 反复重试： 固件下载不下去，模组没应答，基本是模组未接好或损坏。
    * `hciattach` 起来但 `hciconfig hci0 up` 失败： 检查 `dmesg | grep -iE "hci|ttyS1"`。
3.  **模组正常时的输出**： 服务日志出现 `[BT_INIT] UART Bluetooth initialized`，`hciconfig` 显示 `hci0 ... UP RUNNING PSCAN ISCAN`，`Bus: UART`。

</DocScope>

<DocScope products="RDK S100">

### USB 接口（多设备接入）

#### Q19: 两个 USB 摄像头能不能同时使用？
**A:** 可以，但需要限制 `uvcvideo` 驱动的带宽占用，否则第二个摄像头可能枚举失败或工作不稳定：
```bash
rmmod uvcvideo
modprobe uvcvideo quirks=128
```
执行后再接入两个 USB 摄像头。详细的接入步骤和限制说明参考[USB 摄像头示例文档](/Demos/peripheral/camera/usb_camera)中的双摄像头 FAQ。

</DocScope>

<DocScope products="RDK S100">

### IMU

#### Q20: IMU 在 /dev/iio:deviceX 里怎么区分加速度计和陀螺仪？
**A:** S100 相机扩展板上的 ICM42688 挂在 IIO 子系统下，同一颗芯片的陀螺仪和加速度计是**两个独立的 IIO 设备**：
* **确认方法**：
    ```bash
    ls /dev/iio:device*
    cat /sys/bus/iio/devices/iio:device0/name
    cat /sys/bus/iio/devices/iio:device1/name
    ```
    实测对应关系（S100 + ICM42688）：
    * `iio:device0` — 陀螺仪（`icm42688-gyro`）
    * `iio:device1` — 加速度计（`icm42688-accel`）
    * `iio:device2` — fsync（`icm42688-fsync`）
* **直接读数据**： 使用 `sample_imu_iio` 示例程序，`-n` 参数选择模组型号（如 `-n icm42688`），用法参考[IMU 示例文档](/Demos/peripheral/imu/s100_imu)。

#### Q21: 运行 sample_imu_input 报 No such file or directory，怎么排查？
**A:** 该示例依赖驱动向上抛的 input 事件节点，报此错一般是**当前板子上的 IMU 型号没有走 input 上报路径**：
1.  **确认 input 事件节点**：
    ```bash
    ls /dev/input/
    cat /proc/bus/input/devices
    ```
    找不到 IMU 相关的 event 设备，说明当前 IMU（如 ICM42688）走的是 IIO 路径，请改用 `sample_imu_iio`。
2.  **区分两种读取方式**：
    * IIO 方式（`/dev/iio:deviceX`）： 适用 ICM42688 等通过 IIO 子系统上报的 IMU。
    * input 方式（`/dev/input/eventX`）： 依赖驱动以 MSC 事件形式上报数据，具体支持情况以实际模组为准。
3.  **详细说明**： 参考[IMU 示例文档](/Demos/peripheral/imu/s100_imu)。

</DocScope>

<DocScope products="RDK S600">

### 扩展接口与自锁连接器

#### Q22: S600 的扩展接口能用杜邦线直接插吗？
**A:** 不能。S600 的扩展接口（2 个 10-pin、1 个 12-pin、1 个 14-pin）均为 **1.25mm 间距的自锁线对板连接器**（如星坤 X1251WRS 系列）：
* **接线方式**： 需使用配套的自锁插头（胶壳 + 压线端子）压线后接入；杜邦线（2.54mm 间距）物理尺寸不匹配，无法直接插入。
* **自锁结构优势**： 插头插入后自动锁紧，防止振动或拉扯时松脱，适合机器人等运动场景。
* **注意电平**： J19（PCM+I2C）上的 PCM 管脚复用为 GPIO 时为 **1.8V 电平**，接线前需确认外部器件电平匹配，切勿接 5V。

#### Q23: GPIO 示例能运行但串口没有打印，管脚电平也不变化，是程序问题吗？
**A:** 大多数情况不是程序问题，是接线或电平问题：
1.  **示例本身无打印**： `simple_out.py` 等示例只翻转输出管脚电平，不打印任何内容；`simple_input.py`、`button_led.py` 等仅在**输入电平变化时**打印，电平不变时无输出。
2.  **输入管脚悬空**： 悬空时电平不确定，读数乱跳或不变。应接确定电平（GND 或 1.8V）——注意 S600 扩展接口未引出 1.8V 电源，需从 J15 的 `VDDIO_MCU_1V8` 引出。
3.  **输出管脚无测量点**： 输出管脚需接万用表（另一端接 GND）或 LED 才能观察到 0V/1.8V 跳变。
4.  **提示管脚已被占用**： 该 GPIO 已被其他进程使用，结束占用进程后重试；示例退出时会自动 `GPIO.cleanup()` 释放管脚。

</DocScope>

<DocScope products="RDK S600">

### CAN 接口

#### Q24: S600 的 CAN 总线终端电阻（120Ω）需要自己外接吗？
**A:** 不需要，S600 通过拨码开关控制板载 120Ω 终端电阻是否接入：
* **MCU 域 CAN（J16，12-Pin，5 路）**： SW6 拨码分别控制 MCU-CAN1～CAN5 的 120Ω 电阻，ON=接入，OFF=断开。
* **MAIN 域 CAN（J17，10-Pin，4 路）**： SW7 拨码分别控制 MAIN-CAN1～CAN4 的 120Ω 电阻。
* **典型用法**： 总线两端节点将对应拨码拨到 ON（接入终端电阻），中间节点保持 OFF。节点数量与拓扑请结合 CAN 规范设计。

</DocScope>

<DocScope products="RDK S600">

### IMU（RDK S600）

#### Q25: S600 上 IMU 检测不到，程序直接退出怎么办？怎么读非默认型号？
**A:** S600 的 IMU（BMI088）位于 **MCU Port 扩展板**上，通过 SPI-13 总线通信：
* **检测不到（`Error: init IMU 'bmi08x' failed !!! Quit Now`）**：
    1. 确认 MCU Port 扩展板已正确连接（扩展板上 LINK 绿灯常亮表示连接正常、5V 供电正常）。
    2. 检查 `/sys/bus/iio/devices/` 下是否存在 `iio:device*` 节点，确认 IIO 驱动已加载。
* **读非默认型号**： 程序默认使用 `bmi08x`，其它型号（如 ICM42688）通过 `-n` 参数指定，支持 `bmi08x`、`icm42688-gyro`、`icm42688-accel`。

</DocScope>

<DocScope products="RDK S600">

### PCIe 与外设

#### Q26: S600 启动后 NVMe 硬盘或 PCIe 设备不可用，dmesg 报 boardid 相关错误？
**A:** 这是 S600 板级 boardid 机制不命中的典型表现：
* **现象**： PCIe 驱动 `hobot-pcie-rc` 未自动加载，`dmesg` 可见 `Unsupported boardid:0x..., PCIE not Initialized!`。
* **原因**： boardid 值与 `hobot-loadko.sh` 中登记的分支不匹配，常见于自定义硬件后 boardid 未登记，或 MCU、U-Boot、Kernel 三侧登记的 boardid 不一致。
* **排查步骤**：
    ```bash
    # 1. 查看实际 boardid
    cat /sys/class/boardinfo/adc_boardid
    # 2. 对比 SBL/U-Boot 日志中打印的 boardid，判断三侧是否一致
    ```
* **解决**： 在 `hobot-loadko.sh` 中补全自定义 boardid 的分支，或修正三侧 boardid 定义，详见[RDK S600 硬件点亮](/Advanced_development/board_bringup/rdk_s600_bringup)。

</DocScope>
