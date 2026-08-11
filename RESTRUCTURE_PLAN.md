# docs/ 结构重组搬迁清单（Phase 1）

> 依据：`0-doc-standards/10_目标目录设计.md`（目标）× `docs/` 现状 241 篇（源）。
> Phase 1 原则：**只动结构、内容不动**。`git mv` 到目标路径 + 改 `_category_.json`(position/label) + 改 frontmatter `sidebar_position`，跑 `renumber-docs-md → fix-relative-docs-links → generate-sidebar-config → build → check-broken-links`。
> 动作码：`[移]`=干净搬迁　`[更名]`=改名内容不动　`[合并]`=多源→一目（P1 移主源、其余标 TODO，P2 合并内容）　`[拆]`=一源→多目（P1 留源于目标位、P2 拆）　`[新]`=占位页无源　`[删]`=源无目标退役　`[留]`=原位保留。
> 目录名最终由 `_category_.json` position + `renumber-docs-md` 定型；本清单按**目标文件路径**映射，目录层级以 `10_目标目录设计.md` 为准。

---

## 首页 docs/RDK.md

| 源 | 目标 | 动作 | 备注/P2 |
|---|---|---|---|
| `RDK.md` | `RDK.md` | [留] | P2 重写：套件介绍/资料索引/三模式导览/文档导航/版本发布 |
| `01_Quick_start/download.md` | 并入 `RDK.md` 资料索引 | [合并] | P1 移至 `RDK.md` 同级暂留 + TODO；P2 并入资料索引节 |
| `01_Quick_start/classification.md` | — | [删] | G1 已裁决删除 |

## 第 1 章 快速开始 `01_Quick_start/`

### 1.1 硬件介绍 `01_hardware_introduction/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `01_hardware_introduction/01_rdk_s100/01_rdk_s100.md` | `01_hardware_introduction/01_rdk_s100.md` | [移] | 提一层，S100 套件简介 |
| `01_hardware_introduction/02_rdk_s600/01_rdk_s600.md` | `01_hardware_introduction/02_rdk_s600.md` | [移] | S600 套件简介 |
| `01_hardware_introduction/01_rdk_s100/02_rdk_s100_camera_expansion_board/01_rdk_s100_camera_expansion_board.md` | 同目录 `01_rdk_camera_expansion_board.md` | [更名] | 去掉 s100 |
| `01_hardware_introduction/01_rdk_s100/02_rdk_s100_camera_expansion_board/02_rdk_s100_camera_expansion_board_12l.md` | 同目录 `02_rdk_camera_expansion_board_12l.md` | [更名] | 去掉 s100 |
| `01_hardware_introduction/01_rdk_s100/03_rdk_s100_mcu_port_expansion_board.md` | `01_hardware_introduction/03_rdk_mcu_port_expansion_board.md` | [移+更名] | 提一层、去 s100 |
| `01_hardware_introduction/02_rdk_s600/02_rdk_s600_camera_expansion_board.md` | 同 | [留] | S600 相机扩展板独立成页，原位（G2） |
| `01_hardware_introduction/02_rdk_s600/03_rdk_s600_mcu_port_expansion_board.md` | 同 | [留] | S600 MCU 扩展板独立成页，原位（G2） |
| `01_hardware_introduction/02_rdk_s600/versions/**` (6 篇) | 原位 `02_rdk_s600/versions/**` | [留] | 版本快照，结构不变 |
| `01_hardware_introduction/01_rdk_s100/04_FAQ.md` | 并入 `08_FAQ/01_hardware_and_system.md` | [合并] | P1 移至 08_FAQ 暂留 + TODO；P2 合并 |

### 1.2 开始使用 `02_getting_started.md`（★新增单文件长文）

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| — | `02_getting_started.md` | [新] | 占位；P2 写外设连接长文（电源/启动介质/键鼠/显示器/音频/网络/USB 闪连） |

### 1.3 烧录系统与配置 `03_install_os_and_setup/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `02_install_os/rdk_s100/02_preparation.md` | `03_install_os_and_setup/rdk_s100/01_instruction.md` | [更名] | ★合并原 instruction+preparation；现状无 instruction，P1 更名、P2 合并内容 |
| `02_install_os/rdk_s100/03_burn.md` | `03_install_os_and_setup/rdk_s100/02_burn/` | [拆] | 目标为目录（按方法分）；P1 留为 `02_burn.md` + TODO，P2 拆目录 |
| `02_install_os/rdk_s100/05_FAQ.md` | 并入 `08_FAQ/01_hardware_and_system.md` | [合并] | P1 移至 08_FAQ 暂留 |
| `02_install_os/rdk_s600/{02_preparation,03_burn,05_FAQ}.md` | `03_install_os_and_setup/rdk_s600/{01_instruction,02_burn}` | 同 S100 | 同上处理 |
| — | `03_install_os_and_setup/system_status.md` | [新] | 1.3.2 系统状态查询占位 |
| `03_configuration_wizard/configuration_wizard_s100.md` + `configuration_wizard_s600.md` | `03_install_os_and_setup/configuration_wizard.md` | [合并] | ★合并为单文件 DocScope 分平台；P1 移主源 s100→目标 + 留 s600 TODO；P2 合并 |
| `remote_login.md` | `03_install_os_and_setup/remote_login.md` | [移] | 1.3.4 远程登录 |

### 1.4 下一步 `05_next_steps.md`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| — | `05_next_steps.md` | [新] | 占位（原 07_next_steps 不存在） |
| `rdk_studio.md` | `04_next_steps/01_rdk_studio.md` | [移] | 1.4.1 RDK Studio |
| — | `04_next_steps/02_trosb/01_trosb_intro.md` | [新] | 1.4.2.1 tros.b 概述占位 |
| — | `04_next_steps/02_trosb/02_robot_dev.md` | [新] | 1.4.2.2 机器人应用开发占位 |
| — | `04_next_steps/02_trosb/03_packages.md` | [新] | 1.4.2.3 常用功能包占位 |

> 删除：`05_Robot_development.md`（[删]，tros.b 已折入 1.4.2）、`06_Application_case/01_intro.md`（[删]，应用开发指南章删除，ADR D12）。

---

## 第 2 章 系统配置 `02_System_configuration/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `01_network_bluetooth.md` + `06_gui_network_config.md` | `01_network_config.md` | [合并] | ★归并网络（有线/无线/GUI）；默认账号/IP 权威定义在此；P1 移主源+TODO，P2 合并 |
| （从 01_network_bluetooth 拆出） | `02_bluetooth_config.md` | [拆] | ★拆出蓝牙；P1 占位，P2 拆内容 |
| — | `03_system_update/01_rdk_os_intro.md` | [新] | 2.3.1 RDK OS 介绍占位 |
| — | `03_system_update/02_apt_usage.md` | [新] | 2.3.2 apt 占位 |
| — | `03_system_update/03_upgrade_firmware.md` | [新] | 2.3.3 主版本升级与固件占位 |
| `02_srpi-config.md` | `04_srpi_config.md` | [移] | 2.4，扩目录（P2） |
| `03_config_txt.md` | `05_config_txt/01_usage.md`（+02_custom/03_common_options/04_boot_options/05_parser_dev） | [拆] | ★拆为目录 5 子节；P1 移主源→01_usage + TODO，P2 拆+补 03/04 |
| `05_self_start.md` | `06_self_start.md` | [移] | 2.6 |
| `07_share_file_tool.md` | `07_share_file_tool.md` | [移] | 2.7 |
| `04_frequency_management.md` | `08_frequency_management.md` | [移] | 2.8 重编号 |
| — | `09_display_config.md` | [新] | 2.9 显示配置占位 |
| — | `10_audio_output.md` | [新] | 2.10 音频配置占位 |
| — | `11_screen_sleep.md` | [新] | 2.11 屏幕休眠占位 |
| — | `12_storage.md` | [新] | 2.12 存储与磁盘管理占位 |
| — | `13_rtc_ntp.md` | [新] | 2.13 时钟与 RTC 占位 |
| — | `14_user_permission.md` | [新] | 2.14 用户与权限占位 |
| — | `15_system_log.md` | [新] | 2.15 系统日志占位 |
| — | `16_debug_serial.md` | [新] | 2.16 调试串口占位（原 1.5.2 迁入，源不存在） |

---

## 第 3 章 开发示例 `03_Demos/`（★原 `03_Basic_Application` 重命名）

### 3.1 外设应用示例 `01_peripheral/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `03_40pin_user_guide/01_s100/{01_40pin_define,02_gpio,03_pwm,04_uart,05_i2c,06_spi}.md` | `01_peripheral/01_40pin/01_s100/{01_40pin_define,02_gpio,03_pwm,04_uart,05_i2c,06_spi}.md` | [移] | 目录搬迁，文件名不变 |
| `03_40pin_user_guide/02_s600/{01_ext_io,02_gpio,02_uart,04_spi}.md` | `01_peripheral/01_40pin/02_s600/{01_ext_io,02_gpio,03_uart,04_spi}.md` | [移+更名] | `02_uart`→`03_uart` 重编号 |
| `01_Image/01_mipi_camera.md` | `01_peripheral/02_camera/01_mipi_camera.md` | [移] | 3.1.2 摄像头 |
| `01_Image/02_usb_camera.md` | `01_peripheral/02_camera/02_usb_camera.md` | [移] | |
| `02_audio/01_audio_board_super.md` | `01_peripheral/03_audio.md` | [移+更名] | 3.1.3 音频应用 |
| — | `01_peripheral/04_rcore_can.md` | [新] | 3.1.4 CAN 应用占位 |
| — | `01_peripheral/05_imu.md` | [新] | 3.1.5 IMU 应用占位（对应板端 `/app/sample_imu`） |

### 3.2 多媒体示例 `02_multimedia_demo/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `04_multi_media/cdev_demo.md` | `02_multimedia_demo/01_cdev/` 拆为 6 篇 | [拆] | ★cdev_demo 单文→6 篇（vio_capture/vio2display/vio2encoder/vps/decode2display/rtsp2display）；P1 移主源→01_vio_capture + TODO，P2 拆 |
| — | `02_multimedia_demo/02_pydev/` | [新] | 3.2.2 Python 示例占位（待开发） |
| `04_multi_media/pydev_vio_demo.md` | — | [删] | ★板端无 sample，超前标注清理（ADR D5） |

### 3.3 算法示例 `03_algorithm_demo/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `04_Algorithm_Application/03_Python_Sample/01_Summary.md` + `04_Algorithm_Application/01_model_zoo_intro.md` | `03_algorithm_demo/01_summary.md` | [合并] | ★合并概述；P1 移主源+TODO，P2 合并 |
| Python `02_ResNet18.md` + C++ `02_ResNet18.md` | `03_algorithm_demo/02_classification/01_resnet18.md` | [合并] | C/C++ 与 Python 对照；P1 移 C++ 源为主 + Python TODO；P2 合对照 |
| Python `03_MobileNetV2.md` + C++ `03_MobileNetV2.md` | `02_classification/02_mobilenetv2.md` | [合并] | 同上 |
| Python `04_Ultralytics_YOLOv5x.md` + C++ `04_Ultralytics_YOLOv5x.md` | `03_detection/01_yolov5x.md` | [合并] | 目标检测 |
| Python `05_Ultralytics_YOLO11.md` + C++ `05_Ultralytics_YOLO11.md` | `03_detection/02_yolo11.md` | [合并] | |
| Python `07_Ultralytics_YOLO11_Seg.md` + C++ `07_Ultralytics_YOLO11_Seg.md` | `04_instance_segmentation/01_yolo11_seg.md` | [合并] | 实例分割 |
| Python `09_Ultralytics_YOLOE11_Seg.md` + C++ `09_Ultralytics_YOLOE11_Seg.md` | `04_instance_segmentation/02_yoloe11_seg.md` | [合并] | |
| Python `08_Ultralytics_YOLO11_Pose.md` + C++ `08_Ultralytics_YOLO11_Pose.md` | `05_pose/01_yolo11_pose.md` | [合并] | 姿态估计 |
| Python `11_ASR.md` + C++ `11_ASR.md` | `06_speech/01_asr.md` | [合并] | 语音识别 |
| Python `13_USB_Camera_yolov5x.md` + C++ `13_usb_camera.md` | `07_camera_streaming/01_usb_camera.md` | [合并] | 摄像头+推理 |
| Python `14_mipi_camera_yolov5x.md` + C++ `14_mipi_camera_yolov5x.md` | `07_camera_streaming/02_mipi_camera.md` | [合并] | |
| Python `16_rtsp_yolov5x_display.md` + C++ `15_decode_yolov5x_display.md` + `16_rtsp_yolov5x_display.md` | `07_camera_streaming/03_decode_rtsp.md` | [合并] | |
| Python `15_WebSocket_yolov5x.md` | `03_algorithm_demo/07_camera_streaming/04_websocket.md` | [移+更名] | G3 单列第 4 篇 |
| Python `06_UNetMobileNet.md` + C++ `06_UNetMobileNet.md` | — | [删] | ★板端无 sample，超前标注清理 |
| Python `10_LaneNet.md` + C++ `10_LaneNet.md` | — | [删] | 同上 |
| Python `12_PaddleOCR.md` + C++ `12_PaddleOCR.md` | — | [删] | 同上 |

### 3.4 示例编程指南 `04_demo_support/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| — | `04_demo_support/01_model_files.md` | [新] | 3.4.1 模型获取与放置占位 |
| — | `04_demo_support/02_c_cpp_build.md` | [新] | 3.4.2 C/C++ demo 编程指南占位 |
| — | `04_demo_support/03_python_build.md` | [新] | 3.4.3 Python demo 编程指南占位 |
| — | `04_demo_support/04_custom_model.md` | [新] | 3.4.4 自己的模型占位 |

---

## 第 4 章 简易 API `04_Simple_API/`（★原 `04_Algorithm_Application` 重命名）

### 4.1 多媒体 `01_multimedia_api/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `04_multi_media/multi_media_api/cdev/vio_api.md` | `01_multimedia_api/cdev/01_vio_api.md` | [移+更名] | |
| `.../cdev/encoder_api.md` | `cdev/02_encoder_api.md` | [移+更名] | |
| `.../cdev/decoder_api.md` | `cdev/03_decoder_api.md` | [移+更名] | |
| `.../cdev/display_api.md` | `cdev/04_display_api.md` | [移+更名] | |
| `.../cdev/sys_api.md` | `cdev/05_sys_api.md` | [移+更名] | |
| `.../pydev/pydev_multimedia_api_s100.md` | `pydev/01_pydev_multimedia_api.md` | [移+更名] | 去 s100 |
| `.../pydev/object_camera.md` | `pydev/02_object_camera.md` | [移+更名] | |
| `.../pydev/object_encoder.md` | `pydev/03_object_encoder.md` | [移+更名] | |
| `.../pydev/object_decoder.md` | `pydev/04_object_decoder.md` | [移+更名] | |
| `.../pydev/object_display.md` | `pydev/05_object_display.md` | [移+更名] | |
| `.../pydev/pydev_api_demo.md` | `pydev/06_pydev_api_demo.md` | [移+更名] | |

### 4.2 算法推理 `02_inference_api/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `04_Algorithm_Application/02_Python_API.md` | `02_inference_api/01_python_api.md` | [移+更名] | 4.2.2 |
| — | `02_inference_api/02_c_api.md` | [新] | 4.2.1 C 推理 API 占位（源不存在） |

---

## 第 5 章 进阶开发 `07_Advanced_development/`（目录名保留，内部重组 5.1~5.7）

### 5.1 硬件开发 `01_hardware_development/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `01_hardware_development/01_hardware.md` | `01_hardware_development/01_hardware.md` | [留] | 5.1.1 硬件资料 |
| `01_hardware_development/02_accessory.md` | `01_hardware_development/02_accessory.md` | [留] | 5.1.2 配件清单 |
| `01_hardware_development/03_rdk_s100_board_bringup.md` | 同 | [留] | 5.1.3 |
| `01_hardware_development/03_rdk_s600_board_bringup.md` | `04_rdk_s600_board_bringup.md` | [更名] | 5.1.4 重编号 |

### 5.2 开发环境与编译 `06_environment_build/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `02_linux_development/01_environment_build.md` | `06_environment_build/01_environment_build.md` | [移] | 5.2.1 |
| — | `06_environment_build/03_bsp_source_layout.md` | [新] | 5.2.2 BSP 源码目录结构占位 |
| `06_rdk_gen.md` | `06_environment_build/01_rdk_gen.md` | [移] | 5.2.3 构建系统（孤儿归位） |
| — | `06_environment_build/04_docker_build.md` | [新] | 5.2.4 占位 |
| — | `06_environment_build/05_podman_build.md` | [新] | 5.2.5 占位 |

### 5.3 系统软件开发 `03_system_software/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| — | `03_system_software/01_deb/` | [新] | 5.3.1 deb 包开发占位（ADR D3，主线待补） |
| — | `03_system_software/02_system_customization/` | [新] | 5.3.2 系统定制占位 |
| `02_linux_development/08_log_introduction.md` | `03_system_software/03_log_introduction.md` | [移] | 5.3.3 |
| `02_linux_development/08_usb_gadget.md` | `03_system_software/04_usb_gadget.md` | [移] | 5.3.4 |
| `02_linux_development/09_bluetooth_init.md` | `03_system_software/05_bluetooth_init.md` | [移] | 5.3.5 |
| `02_linux_development/06_OTA/01_ota_system.md` | `03_system_software/06_ota_system.md` | [移] | 5.3.6 |
| `02_linux_development/06_OTA/02_ota_miniboot.md` | `03_system_software/07_ota_miniboot.md` | [移] | 5.3.7 |
| `02_linux_development/03_realtime_kernel.md` | `03_system_software/01_realtime_kernel.md` | [移] | 5.3.8 |
| `02_linux_development/02_kernel_headers.md` | `03_system_software/02_kernel_headers.md` | [移] | 5.3.9 |
| `02_linux_development/07_kernel_debug.md` | `03_system_software/03_kernel_debug.md` | [移] | 5.3.10 |
| `02_linux_development/04_driver_development_super/12_driver_timesync.md` | `03_system_software/12_driver_timesync.md` | [移] | 5.3.11 时间同步 |
| `04_driver_development_super/06_driver_ipc.md` | `03_system_software/06_driver_ipc.md` | [移] | 5.3.12 IPC（Acore） |
| `04_driver_development_super/10_driver_lowpower.md` | `03_system_software/10_driver_lowpower.md` | [移] | 5.3.13 低功耗 |

> 注：5.3.11/12/13 的目标文件名前缀（12/06/10）与节号(11/12/13)不一致，系 10_目标目录设计 原文照搬；**P1 按 10 原文文件名搬迁，renumber 后由 sidebar_position 统一重排**。

### 5.4 驱动开发指南 `04_driver_development/`（★原 `04_driver_development_super` 去后缀）

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `04_driver_development_super/01_uboot_kernel_config.md` | `04_driver_development/01_uboot_kernel_config.md` | [移] | 5.4.1 |
| `04_driver_development_super/02_driver_uart_dev.md` | `04_driver_development/02_driver_uart_dev.md` | [移] | 5.4.2 |
| `04_driver_development_super/03_driver_i2c_dev.md` | `04_driver_development/03_driver_i2c_dev.md` | [移] | 5.4.3 |
| `04_driver_development_super/04_driver_gpio_dev.md` | `04_driver_development/04_driver_gpio_dev.md` | [移] | 5.4.4 |
| `04_driver_development_super/05_driver_pinctrl_dev.md` | `04_driver_development/05_driver_pinctrl_dev.md` | [移] | 5.4.5 |
| `04_driver_development_super/07_driver_spi_dev.md` | `04_driver_development/07_driver_spi_dev.md` | [移] | 5.4.6 |
| `04_driver_development_super/08_driver_pwm.md` | `04_driver_development/08_driver_pwm.md` | [移] | 5.4.7 |
| `04_driver_development_super/09_driver_thermal_dev.md` | `04_driver_development/09_driver_thermal_dev.md` | [移] | 5.4.8 |
| `04_driver_development_super/11_driver_audio.md` | `04_driver_development/11_driver_audio.md` | [移] | 5.4.9 |
| `04_driver_development_super/13_driver_pcie/` (4 篇) | `04_driver_development/13_driver_pcie.md/` | [移] | 5.4.10（目标标为目录） |
| `04_driver_development_super/14_driver_wifi.md` | `04_driver_development/14_driver_wifi.md` | [移] | 5.4.11 |
| `04_driver_development_super/15_driver_hbmem/` (5 篇) | `04_driver_development/15_driver_hbmem.md/` | [移] | 5.4.12（目标标为目录） |
| `04_driver_development_super/16_driver_ethernet/{01_ethernet,02_ethercat}.md` | `04_driver_development/16_driver_ethernet/{01_ethernet,02_ethercat}.md` | [移] | 5.4.13 |
| `04_driver_development_super/17_driver_rtc.md` | `04_driver_development/17_driver_rtc.md` | [移] | 5.4.14 |
| `04_driver_development_super/18_driver_watchdog.md` | `04_driver_development/18_driver_watchdog.md` | [移] | 5.4.15 |
| `04_driver_development_super/19_driver_ufs.md` | `04_driver_development/19_driver_ufs.md` | [移] | 5.4.16 |
| `07_vdsp_development.md` | `04_driver_development/01_vdsp_development.md` | [移+更名] | 5.4.17 VDSP |
| `02_linux_development/05_hardware_unit_test/` (12 篇, 文件名带 `-`) | `04_driver_development/06_hardware_unit_test/`（文件名 `-`→`_`，前缀重排 00~11） | [移+更名] | 5.4.18 驱动功能单元测试 |

### 5.5 多媒体开发指南 `06_multimedia_development/`（★合并 3 套为 1 套，DocScope 分 S100/S600）

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `03_multimedia_development/01_multimedia_development/{01_camsys,02_camera_bringup,03_codec,04_display,05_camerasync}.md` | `06_multimedia_development/01_multimedia_api/`（5.5.1 API 参考重组为 HBN/Hbmem/Camera/VIO/ISP/VPF-PYM/OSD/GDC/DISP/MediaCodec/3DGPU/2DGPU 12 篇） | [拆+重组] | 大改： camsys/codec/display 内容拆到新 API 节；P1 移主源→对应新位 + TODO，P2 按 X5+板端头文件重组 |
| `03_multimedia_development/02_multimedia_application/{01_overview,...,12_hbmem_sample_guide}.md` (11 篇) | `06_multimedia_development/02_multimedia_sample/`（5.5.2 重编号 01~10） | [移+更名] | sample 层；S100/S600 两套合并为 DocScope 分叉 |
| `03_multimedia_development/03_S600_multimedia_application/**` (11 篇) | 并入 `02_multimedia_sample/`（DocScope S600） | [合并] | 与 S100 套合并；P1 移 S600 源入同目录 + TODO，P2 合并分叉 |

> 注：5.5 是重组最重的节， camsys/camera_bringup/codec/display → 12 API 节的映射非 1:1，需 P2 按 X5 5.x + 板端 `/usr/hobot/include/` 头文件逐个对位。P1 只搬可对位的 + 占位。

### 5.6 MCU 开发 `11_mcu_development/`（★原 `05_mcu_development` 重编号）

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `05_mcu_development/00_code_release.md` ~ `17_mcu_ethercat.md`（含 `12_mcu_port/`） | `11_mcu_development/`（文件名不变，目录重编号） | [移] | 5.6.1~5.6.18 整体搬迁；`08_mcu_ipc.md` 互链节号 P2 校 |

### 5.7 算法工具链 `10_algorithm_toolchain/`（★原 `04_toolchain_development` 重编号）

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `04_toolchain_development/01_algorithm_toolchain/{01_overview,02_v3_2_0}.md` | `10_algorithm_toolchain/01_algorithm_toolchain/` | [移] | 5.7.1 |
| `04_toolchain_development/02_LLM_Toolchain/01_rdk_s100/01_s100_LLM_Toolchain.md` | `10_algorithm_toolchain/02_LLM_Toolchain/01_rdk_s100/01_s100_LLM_Toolchain.md` | [移] | 5.7.2.1 |
| `02_LLM_Toolchain/02_rdk_s600/01_s100_LLM_Toolchain_v1_0_2.md` | `02_LLM_Toolchain/02_rdk_s600/01_llm_toolchain_v1_0_2.md` | [移+更名] | 去 s100 前缀 |
| `02_LLM_Toolchain/02_rdk_s600/02_s100_LLM_Toolchain_v1_0_5.md` | `02_LLM_Toolchain/02_rdk_s600/02_llm_toolchain_v1_0_5.md` | [移+更名] | |

> 删除：`02_linux_development/` 目录壳（内容已迁空）、`04_driver_development_super/` 改名、`03_multimedia_development/` 改名、`05_mcu_development/` 改名、`04_toolchain_development/` 改名——均为目录重命名，renumber 脚本处理后清壳。

---

## 第 6 章 常见问题 `08_FAQ/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `08_FAQ/01_hardware_and_system.md` ~ `07_desktop_app.md` | 同名 | [留] | 6.1~6.7 结构不变；P2 按问题域重组内容 |
| （并入）`01_hardware_introduction/01_rdk_s100/04_FAQ.md`、`02_install_os/{rdk_s100,rdk_s600}/05_FAQ.md` | `08_FAQ/01_hardware_and_system.md` | [合并] | 硬件/烧录 FAQ 并入；P2 |

## 第 7 章 附录 `09_Appendix/`

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `09_Appendix/rdk-command-manual/cmd_*.md` (6 篇) | `09_Appendix/rdk-command-manual/01_devmem.md`...`06_rdkos_info.md` | [移+更名] | `cmd_xxx`→`0N_xxx` |
| `09_Appendix/linux-command-manual/cmd_*.md` (19 篇) | `linux-command-manual/01_apt.md`...`19_zip.md` | [移+更名] | 同上 |

## 版本发布（并入首页 RDK.md 末节，原 `10_Release_Note/` 保留为数据目录）

| 源 | 目标 | 动作 | 备注 |
|---|---|---|---|
| `10_Release_Note/s100/{01..05}.md` | `10_Release_Note/01_s100/{01..05}.md` | [移] | 目录 `s100`→`01_s100` |
| `10_Release_Note/s600/{v5_0_0,v5_0_1,v5_1_0}.md` | `10_Release_Note/02_s600/{01_v5_0_0,02_v5_0_1,03_v5_1_0}.md` | [移+更名] | 加序号前缀 |

> 版本发布不单独成章，首页 `RDK.md` 末节做导航入口（P2）。

---

## en 镜像同步（Phase 1）

`i18n/en/docusaurus-plugin-content-docs/current/` 下 241 篇同步上述目录结构搬迁（`git mv` 镜像路径），**内容不动**。renumber/fix-links 脚本对 en 同样跑一遍（脚本是否覆盖 en 需验，见 G4）。

---

## 判断点（已裁决）

- **G1** `classification.md` → **删除**。
- **G2** S600 相机扩展板 / MCU 扩展板 → **独立成页**（现状已在 `01_hardware_introduction/02_rdk_s600/02_rdk_s600_camera_expansion_board.md`、`03_rdk_s600_mcu_port_expansion_board.md`，**[留] 原位**）。
- **G3** Python `15_WebSocket_yolov5x.md` → **单列** `03_algorithm_demo/07_camera_streaming/04_websocket.md` [新]（源迁入）。
- **G4** 脚本不覆盖 en：`renumber-docs-md.js`/`fix-relative-docs-links.js` 只扫 `docs/`，`generate-sidebar-config.js` 碰 en。**en 镜像目录手动 `git mv` 同步 + sidebar_position 手动落 en 文件**，执行时一并做。
- **G5** 5.3.11/12/13 等 → **按 `10_目标目录设计` 原文文件名搬，renumber 后由 `sidebar_position` 统一重排**。
- **G6** 占位页 → **只靠正文 `:::info 待开发` 横幅**，不动 sidebar label。

## 确认退役删除清单（红线，执行前再确认）

zh + en 镜像同步删除：

- `01_Quick_start/classification.md`（G1）
- `05_Robot_development.md`（tros.b 折入 1.4.2，ADR D13）
- `06_Application_case/01_intro.md` + 目录（应用开发指南章删除，ADR D12）
- `03_Basic_Application/04_multi_media/pydev_vio_demo.md`（板端无 sample，ADR D5）
- `04_Algorithm_Application/03_Python_Sample/06_UNetMobileNet.md` + `04_C++_Sample/06_UNetMobileNet.md`
- `03_Python_Sample/10_LaneNet.md` + `04_C++_Sample/10_LaneNet.md`
- `03_Python_Sample/12_PaddleOCR.md` + `04_C++_Sample/12_PaddleOCR.md`

---

## Phase 1 执行顺序（建议）

1. 起 feature 分支（现已在 `feature/docs-structure-refactor`）。
2. 读 `scripts/*.js` 确认覆盖范围（en？侧边栏可见性？）——G4。
3. 按章执行 `git mv` + 更名（第 1→7 章顺序，每章搬完先不 renumber）。
4. 新建占位页（★新那批，套占位约定）。
5. 删除确认退役文件（`05_Robot_development.md`、`06_Application_case/`、`pydev_vio_demo.md`、UNetMobileNet/LaneNet/PaddleOCR 等）——删除前再向你确认（红线）。
6. 改 `_category_.json`（label 带"N. 章名"、position）+ 各文 frontmatter `sidebar_position`。
7. 跑 `renumber-docs-md → fix-relative-docs-links → generate-sidebar-config → build → check-broken-links`。
8. build 绿 + 零断链 = Phase 1 验收。提 1 个结构大 PR。
