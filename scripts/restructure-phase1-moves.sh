#!/usr/bin/env bash
# Phase 1 结构搬迁脚本（zh docs/ + en 镜像并行）。只动结构、内容不动。幂等可重跑。
# 依据：RESTRUCTURE_PLAN.md。renumber 后由 sidebar_position 统一 0N_ 重排。
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
EN=i18n/en/docusaurus-plugin-content-docs/current

mvboth() {
	local src="$1" dst="$2"
	[ -f "docs/$src" ] || { echo "skip $src (gone)"; return 0; }
	mkdir -p "$(dirname "docs/$dst")" "$(dirname "$EN/$dst")"
	git mv "docs/$src" "docs/$dst"
	git mv "$EN/$src" "$EN/$dst"
}
mvdirboth() {
	local src="$1" dst="$2"
	[ -d "docs/$src" ] && git mv "docs/$src" "docs/$dst" || true
	[ -d "$EN/$src" ] && git mv "$EN/$src" "$EN/$dst" || true
}
mkplaceholder() {
	local rel="$1" title="$2" ref="$3"
	mkdir -p "$(dirname "docs/$rel")" "$(dirname "$EN/$rel")"
	for root in docs "$EN"; do
		cat > "$root/$rel" <<EOF
---
title: $title
sidebar_position: 1
description: 待开发
---
# $title

:::info 待开发
本文待开发。对应板端 \`$ref\`（或见 X5 对照）。
:::
EOF
	done
	git add "docs/$rel" "$EN/$rel"
}

echo "=== CH1 ==="
mvboth 01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100.md 01_Quick_start/01_hardware_introduction/01_rdk_s100.md
mvboth 01_Quick_start/01_hardware_introduction/01_rdk_s100/02_rdk_s100_camera_expansion_board/01_rdk_s100_camera_expansion_board.md 01_Quick_start/01_hardware_introduction/01_rdk_s100/02_rdk_s100_camera_expansion_board/01_rdk_camera_expansion_board.md
mvboth 01_Quick_start/01_hardware_introduction/01_rdk_s100/02_rdk_s100_camera_expansion_board/02_rdk_s100_camera_expansion_board_12l.md 01_Quick_start/01_hardware_introduction/01_rdk_s100/02_rdk_s100_camera_expansion_board/02_rdk_camera_expansion_board_12l.md
mvboth 01_Quick_start/01_hardware_introduction/01_rdk_s100/03_rdk_s100_mcu_port_expansion_board.md 01_Quick_start/01_hardware_introduction/03_rdk_mcu_port_expansion_board.md
mvboth 01_Quick_start/01_hardware_introduction/02_rdk_s600/01_rdk_s600.md 01_Quick_start/01_hardware_introduction/02_rdk_s600.md
mkplaceholder 01_Quick_start/02_getting_started.md "开始使用 RDK" "/app（外设连接）"
mvboth 01_Quick_start/02_install_os/rdk_s100/02_preparation.md 01_Quick_start/03_install_os_and_setup/rdk_s100/01_instruction.md
mvboth 01_Quick_start/02_install_os/rdk_s100/03_burn.md 01_Quick_start/03_install_os_and_setup/rdk_s100/02_burn.md
mvboth 01_Quick_start/02_install_os/rdk_s100/05_FAQ.md 01_Quick_start/03_install_os_and_setup/rdk_s100/05_FAQ.md
mvboth 01_Quick_start/02_install_os/rdk_s600/02_preparation.md 01_Quick_start/03_install_os_and_setup/rdk_s600/01_instruction.md
mvboth 01_Quick_start/02_install_os/rdk_s600/03_burn.md 01_Quick_start/03_install_os_and_setup/rdk_s600/02_burn.md
mvboth 01_Quick_start/02_install_os/rdk_s600/05_FAQ.md 01_Quick_start/03_install_os_and_setup/rdk_s600/05_FAQ.md
mkplaceholder 01_Quick_start/03_install_os_and_setup/system_status.md "系统状态查询" "rdkos_info / hrut_boardid"
mvboth 01_Quick_start/03_configuration_wizard/configuration_wizard_s100.md 01_Quick_start/03_install_os_and_setup/configuration_wizard.md
mvboth 01_Quick_start/03_configuration_wizard/configuration_wizard_s600.md 01_Quick_start/03_install_os_and_setup/configuration_wizard_s600.md
mvboth 01_Quick_start/remote_login.md 01_Quick_start/03_install_os_and_setup/remote_login.md
mvboth 01_Quick_start/rdk_studio.md 01_Quick_start/04_next_steps/01_rdk_studio.md
mkplaceholder 01_Quick_start/05_next_steps.md "下一步" "第3/4章"
mkplaceholder 01_Quick_start/04_next_steps/02_trosb/01_trosb_intro.md "TogetheROS.Bot 概述" "tros.b"
mkplaceholder 01_Quick_start/04_next_steps/02_trosb/02_robot_dev.md "机器人应用开发" "tros.b"
mkplaceholder 01_Quick_start/04_next_steps/02_trosb/03_packages.md "常用功能包" "tros.b"
mvboth 01_Quick_start/download.md RDK_download.md

echo "=== CH2 ==="
mvboth 02_System_configuration/01_network_bluetooth.md 02_System_configuration/01_network_config.md
mkplaceholder 02_System_configuration/02_bluetooth_config.md "蓝牙配置" "bluetooth"
mkplaceholder 02_System_configuration/03_system_update/01_rdk_os_intro.md "RDK OS 介绍" "RDK OS"
mkplaceholder 02_System_configuration/03_system_update/02_apt_usage.md "软件包管理 apt" "apt"
mkplaceholder 02_System_configuration/03_system_update/03_upgrade_firmware.md "主版本升级与固件" "固件升级"
mvboth 02_System_configuration/02_srpi-config.md 02_System_configuration/04_srpi_config.md
mvboth 02_System_configuration/03_config_txt.md 02_System_configuration/05_config_txt/01_usage.md
mvboth 02_System_configuration/05_self_start.md 02_System_configuration/06_self_start.md
mvboth 02_System_configuration/07_share_file_tool.md 02_System_configuration/07_share_file_tool.md
mvboth 02_System_configuration/04_frequency_management.md 02_System_configuration/08_frequency_management.md
mkplaceholder 02_System_configuration/09_display_config.md "显示配置" "HDMI/DP"
mkplaceholder 02_System_configuration/10_audio_output.md "音频配置" "音频"
mkplaceholder 02_System_configuration/11_screen_sleep.md "屏幕休眠与电源管理" "电源"
mkplaceholder 02_System_configuration/12_storage.md "存储与磁盘管理" "SD/eMMC"
mkplaceholder 02_System_configuration/13_rtc_ntp.md "时钟与 RTC 同步" "RTC/NTP"
mkplaceholder 02_System_configuration/14_user_permission.md "用户与权限管理" "user/sudo"
mkplaceholder 02_System_configuration/15_system_log.md "系统日志查看" "dmesg/journalctl"
mkplaceholder 02_System_configuration/16_debug_serial.md "调试串口" "TTL-USB"

echo "=== CH3 03_Basic_Application → 03_Demos ==="
mvdirboth 03_Basic_Application 03_Demos
mkdir -p docs/03_Demos/01_peripheral/01_40pin/{01_s100,02_s600} "$EN/03_Demos/01_peripheral/01_40pin/01_s100" "$EN/03_Demos/01_peripheral/01_40pin/02_s600"
for f in 01_40pin_define 02_gpio 03_pwm 04_uart 05_i2c 06_spi; do
	mvboth 03_Demos/03_40pin_user_guide/01_s100/$f.md 03_Demos/01_peripheral/01_40pin/01_s100/$f.md
done
mvboth 03_Demos/03_40pin_user_guide/02_s600/01_ext_io.md 03_Demos/01_peripheral/01_40pin/02_s600/01_ext_io.md
mvboth 03_Demos/03_40pin_user_guide/02_s600/02_gpio.md 03_Demos/01_peripheral/01_40pin/02_s600/02_gpio.md
mvboth 03_Demos/03_40pin_user_guide/02_s600/02_uart.md 03_Demos/01_peripheral/01_40pin/02_s600/03_uart.md
mvboth 03_Demos/03_40pin_user_guide/02_s600/04_spi.md 03_Demos/01_peripheral/01_40pin/02_s600/04_spi.md
mkdir -p docs/03_Demos/01_peripheral/02_camera "$EN/03_Demos/01_peripheral/02_camera"
mvboth 03_Demos/01_Image/01_mipi_camera.md 03_Demos/01_peripheral/02_camera/01_mipi_camera.md
mvboth 03_Demos/01_Image/02_usb_camera.md 03_Demos/01_peripheral/02_camera/02_usb_camera.md
mvboth 03_Demos/02_audio/01_audio_board_super.md 03_Demos/01_peripheral/03_audio.md
mkplaceholder 03_Demos/01_peripheral/04_rcore_can.md "CAN 应用" "/app/Can"
mkplaceholder 03_Demos/01_peripheral/05_imu.md "IMU 应用" "/app/sample_imu"
mkdir -p docs/03_Demos/02_multimedia_demo/01_cdev "$EN/03_Demos/02_multimedia_demo/01_cdev"
mvboth 03_Demos/04_multi_media/cdev_demo.md 03_Demos/02_multimedia_demo/01_cdev/01_vio_capture.md
mkplaceholder 03_Demos/02_multimedia_demo/02_pydev/01_pydev_multimedia.md "Python 多媒体示例" "/app/pydev_demo"
for d in 02_classification 03_detection 04_instance_segmentation 05_pose 06_speech 07_camera_streaming; do
	mkdir -p "docs/03_Demos/03_algorithm_demo/$d" "$EN/03_Demos/03_algorithm_demo/$d"
done
mvboth 04_Algorithm_Application/01_model_zoo_intro.md 03_Demos/03_algorithm_demo/01_summary.md
mvboth 04_Algorithm_Application/03_Python_Sample/01_Summary.md 03_Demos/03_algorithm_demo/01_summary_py.md
mvboth 04_Algorithm_Application/04_C++_Sample/02_ResNet18.md 03_Demos/03_algorithm_demo/02_classification/01_resnet18.md
mvboth 04_Algorithm_Application/03_Python_Sample/02_ResNet18.md 03_Demos/03_algorithm_demo/02_classification/01_resnet18_py.md
mvboth 04_Algorithm_Application/04_C++_Sample/03_MobileNetV2.md 03_Demos/03_algorithm_demo/02_classification/02_mobilenetv2.md
mvboth 04_Algorithm_Application/03_Python_Sample/03_MobileNetV2.md 03_Demos/03_algorithm_demo/02_classification/02_mobilenetv2_py.md
mvboth 04_Algorithm_Application/04_C++_Sample/04_Ultralytics_YOLOv5x.md 03_Demos/03_algorithm_demo/03_detection/01_yolov5x.md
mvboth 04_Algorithm_Application/03_Python_Sample/04_Ultralytics_YOLOv5x.md 03_Demos/03_algorithm_demo/03_detection/01_yolov5x_py.md
mvboth 04_Algorithm_Application/04_C++_Sample/05_Ultralytics_YOLO11.md 03_Demos/03_algorithm_demo/03_detection/02_yolo11.md
mvboth 04_Algorithm_Application/03_Python_Sample/05_Ultralytics_YOLO11.md 03_Demos/03_algorithm_demo/03_detection/02_yolo11_py.md
mvboth 04_Algorithm_Application/04_C++_Sample/07_Ultralytics_YOLO11_Seg.md 03_Demos/03_algorithm_demo/04_instance_segmentation/01_yolo11_seg.md
mvboth 04_Algorithm_Application/03_Python_Sample/07_Ultralytics_YOLO11_Seg.md 03_Demos/03_algorithm_demo/04_instance_segmentation/01_yolo11_seg_py.md
mvboth 04_Algorithm_Application/04_C++_Sample/09_Ultralytics_YOLOE11_Seg.md 03_Demos/03_algorithm_demo/04_instance_segmentation/02_yoloe11_seg.md
mvboth 04_Algorithm_Application/03_Python_Sample/09_Ultralytics_YOLOE11_Seg.md 03_Demos/03_algorithm_demo/04_instance_segmentation/02_yoloe11_seg_py.md
mvboth 04_Algorithm_Application/04_C++_Sample/08_Ultralytics_YOLO11_Pose.md 03_Demos/03_algorithm_demo/05_pose/01_yolo11_pose.md
mvboth 04_Algorithm_Application/03_Python_Sample/08_Ultralytics_YOLO11_Pose.md 03_Demos/03_algorithm_demo/05_pose/01_yolo11_pose_py.md
mvboth 04_Algorithm_Application/04_C++_Sample/11_ASR.md 03_Demos/03_algorithm_demo/06_speech/01_asr.md
mvboth 04_Algorithm_Application/03_Python_Sample/11_ASR.md 03_Demos/03_algorithm_demo/06_speech/01_asr_py.md
mvboth 04_Algorithm_Application/04_C++_Sample/13_usb_camera.md 03_Demos/03_algorithm_demo/07_camera_streaming/01_usb_camera.md
mvboth 04_Algorithm_Application/03_Python_Sample/13_USB_Camera_yolov5x.md 03_Demos/03_algorithm_demo/07_camera_streaming/01_usb_camera_py.md
mvboth 04_Algorithm_Application/04_C++_Sample/14_mipi_camera_yolov5x.md 03_Demos/03_algorithm_demo/07_camera_streaming/02_mipi_camera.md
mvboth 04_Algorithm_Application/03_Python_Sample/14_mipi_camera_yolov5x.md 03_Demos/03_algorithm_demo/07_camera_streaming/02_mipi_camera_py.md
mvboth 04_Algorithm_Application/04_C++_Sample/16_rtsp_yolov5x_display.md 03_Demos/03_algorithm_demo/07_camera_streaming/03_decode_rtsp.md
mvboth 04_Algorithm_Application/03_Python_Sample/16_rtsp_yolov5x_display.md 03_Demos/03_algorithm_demo/07_camera_streaming/03_decode_rtsp_py.md
mvboth 04_Algorithm_Application/04_C++_Sample/15_decode_yolov5x_display.md 03_Demos/03_algorithm_demo/07_camera_streaming/04_decode.md
mvboth 04_Algorithm_Application/03_Python_Sample/15_WebSocket_yolov5x.md 03_Demos/03_algorithm_demo/07_camera_streaming/04_websocket_py.md
mkplaceholder 03_Demos/04_demo_support/01_model_files.md "模型获取与放置" "/app/model"
mkplaceholder 03_Demos/04_demo_support/02_c_cpp_build.md "C/C++ demo 编程指南" "gcc/cmake"
mkplaceholder 03_Demos/04_demo_support/03_python_build.md "Python demo 编程指南" "pydev"
mkplaceholder 03_Demos/04_demo_support/04_custom_model.md "使用自己的模型" "5.7 工具链"

echo "=== CH4 04_Algorithm_Application → 04_Simple_API ==="
mvdirboth 04_Algorithm_Application 04_Simple_API
mkdir -p docs/04_Simple_API/01_multimedia_api/{cdev,pydev} "$EN/04_Simple_API/01_multimedia_api/cdev" "$EN/04_Simple_API/01_multimedia_api/pydev"
mvboth 03_Demos/04_multi_media/multi_media_api/cdev/vio_api.md 04_Simple_API/01_multimedia_api/cdev/01_vio_api.md
mvboth 03_Demos/04_multi_media/multi_media_api/cdev/encoder_api.md 04_Simple_API/01_multimedia_api/cdev/02_encoder_api.md
mvboth 03_Demos/04_multi_media/multi_media_api/cdev/decoder_api.md 04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md
mvboth 03_Demos/04_multi_media/multi_media_api/cdev/display_api.md 04_Simple_API/01_multimedia_api/cdev/04_display_api.md
mvboth 03_Demos/04_multi_media/multi_media_api/cdev/sys_api.md 04_Simple_API/01_multimedia_api/cdev/05_sys_api.md
mvboth 03_Demos/04_multi_media/multi_media_api/pydev/pydev_multimedia_api_s100.md 04_Simple_API/01_multimedia_api/pydev/01_pydev_multimedia_api.md
mvboth 03_Demos/04_multi_media/multi_media_api/pydev/object_camera.md 04_Simple_API/01_multimedia_api/pydev/02_object_camera.md
mvboth 03_Demos/04_multi_media/multi_media_api/pydev/object_encoder.md 04_Simple_API/01_multimedia_api/pydev/03_object_encoder.md
mvboth 03_Demos/04_multi_media/multi_media_api/pydev/object_decoder.md 04_Simple_API/01_multimedia_api/pydev/04_object_decoder.md
mvboth 03_Demos/04_multi_media/multi_media_api/pydev/object_display.md 04_Simple_API/01_multimedia_api/pydev/05_object_display.md
mvboth 03_Demos/04_multi_media/multi_media_api/pydev/pydev_api_demo.md 04_Simple_API/01_multimedia_api/pydev/06_pydev_api_demo.md
mkdir -p docs/04_Simple_API/02_inference_api "$EN/04_Simple_API/02_inference_api"
mvboth 04_Simple_API/02_Python_API.md 04_Simple_API/02_inference_api/01_python_api.md
mkplaceholder 04_Simple_API/02_inference_api/02_c_api.md "C 语言推理 API" "/app/cdev_demo/bpu"

echo "=== CH5 5.1 硬件开发 ==="
mvboth 07_Advanced_development/01_hardware_development/03_rdk_s600_board_bringup.md 07_Advanced_development/01_hardware_development/04_rdk_s600_board_bringup.md

echo "=== CH5 5.2 开发环境与编译 ==="
mkdir -p docs/07_Advanced_development/06_environment_build "$EN/07_Advanced_development/06_environment_build"
mvboth 07_Advanced_development/02_linux_development/01_environment_build.md 07_Advanced_development/06_environment_build/01_environment_build.md
mvboth 07_Advanced_development/06_rdk_gen.md 07_Advanced_development/06_environment_build/03_rdk_gen.md
mkplaceholder 07_Advanced_development/06_environment_build/02_bsp_source_layout.md "BSP 源码目录结构" "BSP"
mkplaceholder 07_Advanced_development/06_environment_build/04_docker_build.md "使用 Docker 编译" "Docker"
mkplaceholder 07_Advanced_development/06_environment_build/05_podman_build.md "使用 Podman 编译" "Podman"

echo "=== CH5 5.3 系统软件开发 ==="
mkdir -p docs/07_Advanced_development/03_system_software/{01_deb,02_system_customization} "$EN/07_Advanced_development/03_system_software/01_deb" "$EN/07_Advanced_development/03_system_software/02_system_customization"
mkplaceholder 07_Advanced_development/03_system_software/01_deb/01_deb.md "deb 包开发" "deb（待研发流程稳定）"
mkplaceholder 07_Advanced_development/03_system_software/02_system_customization/01_system_customization.md "系统定制" "apt/配置/重制镜像"
mvboth 07_Advanced_development/02_linux_development/08_log_introduction.md 07_Advanced_development/03_system_software/03_log_introduction.md
mvboth 07_Advanced_development/02_linux_development/08_usb_gadget.md 07_Advanced_development/03_system_software/04_usb_gadget.md
mvboth 07_Advanced_development/02_linux_development/09_bluetooth_init.md 07_Advanced_development/03_system_software/05_bluetooth_init.md
mvboth 07_Advanced_development/02_linux_development/06_OTA/01_ota_system.md 07_Advanced_development/03_system_software/06_ota_system.md
mvboth 07_Advanced_development/02_linux_development/06_OTA/02_ota_miniboot.md 07_Advanced_development/03_system_software/07_ota_miniboot.md
mvboth 07_Advanced_development/02_linux_development/03_realtime_kernel.md 07_Advanced_development/03_system_software/01_realtime_kernel.md
mvboth 07_Advanced_development/02_linux_development/02_kernel_headers.md 07_Advanced_development/03_system_software/02_kernel_headers.md
mvboth 07_Advanced_development/02_linux_development/07_kernel_debug.md 07_Advanced_development/03_system_software/03_kernel_debug.md
mvboth 07_Advanced_development/02_linux_development/04_driver_development_super/12_driver_timesync.md 07_Advanced_development/03_system_software/12_driver_timesync.md
mvboth 07_Advanced_development/02_linux_development/04_driver_development_super/06_driver_ipc.md 07_Advanced_development/03_system_software/06_driver_ipc.md
mvboth 07_Advanced_development/02_linux_development/04_driver_development_super/10_driver_lowpower.md 07_Advanced_development/03_system_software/10_driver_lowpower.md

echo "=== CH5 5.4 驱动开发 ==="
mvdirboth 07_Advanced_development/02_linux_development/04_driver_development_super 07_Advanced_development/04_driver_development
mvboth 07_Advanced_development/07_vdsp_development.md 07_Advanced_development/04_driver_development/01_vdsp_development.md
mkdir -p docs/07_Advanced_development/04_driver_development/06_hardware_unit_test "$EN/07_Advanced_development/04_driver_development/06_hardware_unit_test"
mvdirboth 07_Advanced_development/02_linux_development/05_hardware_unit_test 07_Advanced_development/04_driver_development/05_hardware_unit_test_tmp
if [ -d docs/07_Advanced_development/04_driver_development/05_hardware_unit_test_tmp ]; then
	for f in $(cd docs/07_Advanced_development/04_driver_development/05_hardware_unit_test_tmp && ls); do
		newf=$(echo "$f" | sed 's/-/_/g')
		mvboth 07_Advanced_development/04_driver_development/05_hardware_unit_test_tmp/$f 07_Advanced_development/04_driver_development/06_hardware_unit_test/$newf
	done
	rmdir docs/07_Advanced_development/04_driver_development/05_hardware_unit_test_tmp "$EN/07_Advanced_development/04_driver_development/05_hardware_unit_test_tmp" 2>/dev/null || true
fi

echo "=== CH5 5.5 多媒体 ==="
mvdirboth 07_Advanced_development/03_multimedia_development 07_Advanced_development/06_multimedia_development
mkdir -p docs/07_Advanced_development/06_multimedia_development/01_multimedia_api "$EN/07_Advanced_development/06_multimedia_development/01_multimedia_api"
mvdirboth 07_Advanced_development/06_multimedia_development/01_multimedia_development 07_Advanced_development/06_multimedia_development/01_multimedia_api_tmp
if [ -d docs/07_Advanced_development/06_multimedia_development/01_multimedia_api_tmp ]; then
	for f in $(cd docs/07_Advanced_development/06_multimedia_development/01_multimedia_api_tmp && ls); do
		mvboth 07_Advanced_development/06_multimedia_development/01_multimedia_api_tmp/$f 07_Advanced_development/06_multimedia_development/01_multimedia_api/$f
	done
	rmdir docs/07_Advanced_development/06_multimedia_development/01_multimedia_api_tmp "$EN/07_Advanced_development/06_multimedia_development/01_multimedia_api_tmp" 2>/dev/null || true
fi
mvdirboth 07_Advanced_development/06_multimedia_development/02_multimedia_application 07_Advanced_development/06_multimedia_development/02_multimedia_sample
mvdirboth 07_Advanced_development/06_multimedia_development/03_S600_multimedia_application 07_Advanced_development/06_multimedia_development/02_multimedia_sample_s600

echo "=== CH5 5.6 MCU ==="
mvdirboth 07_Advanced_development/05_mcu_development 07_Advanced_development/11_mcu_development

echo "=== CH5 5.7 算法工具链 ==="
mvdirboth 07_Advanced_development/04_toolchain_development 07_Advanced_development/10_algorithm_toolchain
mvboth 07_Advanced_development/10_algorithm_toolchain/02_LLM_Toolchain/02_rdk_s600/01_s100_LLM_Toolchain_v1_0_2.md 07_Advanced_development/10_algorithm_toolchain/02_LLM_Toolchain/02_rdk_s600/01_llm_toolchain_v1_0_2.md
mvboth 07_Advanced_development/10_algorithm_toolchain/02_LLM_Toolchain/02_rdk_s600/02_s100_LLM_Toolchain_v1_0_5.md 07_Advanced_development/10_algorithm_toolchain/02_LLM_Toolchain/02_rdk_s600/02_llm_toolchain_v1_0_5.md

# 清空壳
rmdir docs/07_Advanced_development/02_linux_development/06_OTA docs/07_Advanced_development/02_linux_development 2>/dev/null || true
rmdir "$EN/07_Advanced_development/02_linux_development/06_OTA" "$EN/07_Advanced_development/02_linux_development" 2>/dev/null || true
find docs/03_Demos -type d -empty -delete 2>/dev/null || true
find "$EN/03_Demos" -type d -empty -delete 2>/dev/null || true

echo "=== CH7 附录 cmd_ → 去前缀 ==="
for f in $(cd docs/09_Appendix/rdk-command-manual && ls cmd_*.md 2>/dev/null); do
	newf=$(echo "$f" | sed 's/^cmd_//')
	mvboth 09_Appendix/rdk-command-manual/$f 09_Appendix/rdk-command-manual/$newf
done
for f in $(cd docs/09_Appendix/linux-command-manual && ls cmd_*.md 2>/dev/null); do
	newf=$(echo "$f" | sed 's/^cmd_//')
	mvboth 09_Appendix/linux-command-manual/$f 09_Appendix/linux-command-manual/$newf
done

echo "=== CH10 版本发布 ==="
mvdirboth 10_Release_Note/s100 10_Release_Note/01_s100
mvdirboth 10_Release_Note/s600 10_Release_Note/02_s600
mvboth 10_Release_Note/02_s600/v5_0_0.md 10_Release_Note/02_s600/01_v5_0_0.md
mvboth 10_Release_Note/02_s600/v5_0_1.md 10_Release_Note/02_s600/02_v5_0_1.md
mvboth 10_Release_Note/02_s600/v5_1_0.md 10_Release_Note/02_s600/03_v5_1_0.md

echo "=== DONE ==="
echo "zh md: $(find docs -name '*.md'|wc -l)  en md: $(find $EN -name '*.md'|wc -l)"
