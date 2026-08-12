---
title: "1.4.2.3 常用功能包"
sidebar_position: 3
description: tros.b 常用功能包列表与分类
---

# 1.4.2.3 常用功能包

本节列出 tros.b 提供的常用功能包，按功能域分类。功能包与 [3.3 算法示例](/Demos/algorithm_demo/summary) 和 [6.6 TROS/ROS 开发 FAQ](/FAQ/tros_ros) 互链。

## 感知

| 功能包 | 功能 | 对应算法示例 |
| --- | --- | --- |
| `tros_yolo_detection` | 目标检测（YOLOv5x/YOLO11） | [3.3.3 目标检测](/Demos/algorithm_demo/detection/yolov5x) |
| `tros_classification` | 图像分类（ResNet18/MobileNetV2） | [3.3.2 图像分类](/Demos/algorithm_demo/classification/resnet18) |
| `tros_instance_segmentation` | 实例分割（YOLO11 seg） | [3.3.4 实例分割](/Demos/algorithm_demo/instance_segmentation/yolo11_seg) |
| `tros_pose_estimation` | 姿态估计（YOLO11 pose） | [3.3.5 姿态估计](/Demos/algorithm_demo/pose/yolo11_pose) |
| `tros_asr` | 语音识别 | [3.3.6 自动语音识别](/Demos/algorithm_demo/speech/asr) |

## 建图与定位

| 功能包 | 功能 |
| --- | --- |
| `tros_lidar_mapping` | 激光雷达建图 |
| `tros_visual_mapping` | 视觉建图 |
| `tros_localization` | 定位 |

## 规控

| 功能包 | 功能 |
| --- | --- |
| `tros_planning` | 路径规划 |
| `tros_control` | 运动控制 |
| `tros_cmd_vel` | 速度指令转换 |

## 传感器驱动

| 功能包 | 功能 |
| --- | --- |
| `tros_mipi_camera` | MIPI 摄像头驱动 |
| `tros_usb_camera` | USB 摄像头驱动 |
| `tros_imu` | IMU 驱动 |
| `tros_lidar` | 激光雷达驱动 |

## 工具

| 功能包 | 功能 |
| --- | --- |
| `tros_multi_sync` | 多传感器硬件同步（LPWM/PPS） |
| `tros_image_tools` | 图像格式转换与可视化 |

## 使用方法

```bash
# 查看已安装的功能包
ros2 pkg list | grep tros

# 查看 YOLO 检测节点的参数
ros2 param list /tros_yolo_detection

# 启动 YOLO 检测
ros2 launch tros_yolo_detection yolo_detection.launch.py
```

:::note 板端验证
当前 S600 板端镜像未预装 tros.b，以上命令需在带 tros.b 的镜像上运行。
:::

## 相关文档

- [1.4.2.1 TogetheROS.Bot 概述](./trosb_intro)
- [1.4.2.2 机器人应用开发](./robot_dev)
- [3.3 算法示例](/Demos/algorithm_demo/summary)
- [6.6 TROS/ROS 开发 FAQ](/FAQ/tros_ros)
