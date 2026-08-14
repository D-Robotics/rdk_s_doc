---
title: "使用 TogetheROS.Bot"
sidebar_position: 2
sidebar_label: "使用 TogetheROS.Bot"
description: "TogetheROS.Bot（tros.b）机器人中间件使用指南"
---

# 使用 TogetheROS.Bot

**TogetheROS.Bot**（简称 **tros.b**）是 D-Robotics 基于 ROS 2 打造的机器人中间件，预装在 RDK OS 镜像中，为 RDK 开发板提供感知、规控、建图等机器人应用开发能力。

## 什么是 tros.b

tros.b 是 D-Robotics 面向 RDK 平台优化的 ROS 2 发行版，在标准 ROS 2 基础上增加了：

- **BPU 算法节点**：将模型推理（YOLO/分类/分割等）封装为 ROS 2 节点，直接调用 BPU 硬件加速
- **传感器驱动节点**：摄像头、IMU、激光雷达等传感器接入
- **多传感器同步**：基于 LPWM/PPS 的硬件级时间同步
- **预配置环境**：无需手动安装 ROS 2，开箱即用

## 与 RDK OS 的关系

```text
┌─────────────────────────────────────┐
│           机器人应用层                │
│  （用户 ROS 2 节点 + launch 文件）     │
├─────────────────────────────────────┤
│           tros.b 中间件               │
│  （BPU 节点 + 传感器驱动 + 工具包）     │
├─────────────────────────────────────┤
│           RDK OS                      │
│  （Ubuntu + BPU 驱动 + VIO/Codec）     │
├─────────────────────────────────────┤
│           RDK 硬件                     │
│  （S100/S600 + BPU + MCU + 传感器）    │
└─────────────────────────────────────┘
```

tros.b 运行在 RDK OS 之上，通过 BPU 硬件加速实现高能效的机器人感知与规控。

## 与原生 ROS 2 的差异

| 方面 | 原生 ROS 2 | tros.b |
| --- | --- | --- |
| 安装 | 手动安装 ROS 2 + 依赖 | 预装在 RDK OS 镜像，开箱即用 |
| 模型推理 | CPU 推理或自行集成 | BPU 加速节点，模型已转换量化 |
| 传感器同步 | 软件时间戳 | 硬件级 LPWM/PPS 同步 |
| 性能 | 受 CPU 限制 | BPU + MCU 异构加速 |

## 预装版本

tros.b 随 RDK OS 镜像一起发布，版本与 RDK OS 版本对应。可通过以下命令查看：

```bash
# 查看 RDK OS 版本
cat /etc/version

# 查看 tros.b 版本（如果已安装）
ros2 pkg list | head
```

:::note 板端验证
当前 S600 板端的镜像未预装 tros.b。如需使用 tros.b，需烧录带 tros.b 的 RDK OS 镜像。
:::

## 机器人应用开发

本节介绍在 tros.b 上开发机器人应用的基本流程，包括创建工作空间、编写节点、编译和运行。

### 环境准备

- 开发板已烧录带 tros.b 的 RDK OS 镜像
- 已通过 SSH 登录开发板

### 创建 ROS 2 工作空间

```bash
mkdir -p ~/tros_ws/src
cd ~/tros_ws
colcon build
```

### 编写节点

创建一个简单的 Python 节点：

```bash
cd ~/tros_ws/src
ros2 pkg create --build-type ament_python my_robot_node
```

在 `my_robot_node/my_robot_node/my_robot_node.py` 中编写：

```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        self.timer = self.create_timer(1.0, self.timer_callback)

    def timer_callback(self):
        self.get_logger().info('Hello from tros.b!')

def main():
    rclpy.init()
    node = MyNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### 编译

```bash
cd ~/tros_ws
colcon build --packages-select my_robot_node
source install/setup.bash
```

### 运行

```bash
ros2 run my_robot_node my_robot_node
```

输出类似：

```text
[INFO] [my_node]: Hello from tros.b!
[INFO] [my_node]: Hello from tros.b!
```

### 使用 BPU 推理节点

tros.b 提供的 BPU 推理节点可直接在 launch 文件中调用，无需手动编写推理代码：

```python
# launch/yolo_detection.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='tros_perception',
            executable='yolo_detection',
            parameters=[{
                'model': '/app/model/yolov5x.bin',
                'camera': 'mipi_cam0',
            }],
        ),
    ])
```

详见 [常用功能包](#常用功能包) 和 [算法示例](/Demos/algorithm_demo/summary)。

## 常用功能包

本节列出 tros.b 提供的常用功能包，按功能域分类。功能包与 [算法示例](/Demos/algorithm_demo/summary) 和 [TROS/ROS 开发 FAQ](/FAQ/tros_ros) 互链。

### 感知

| 功能包 | 功能 | 对应算法示例 |
| --- | --- | --- |
| `tros_yolo_detection` | 目标检测（YOLOv5x/YOLO11） | [目标检测](/Demos/algorithm_demo/detection/yolov5x) |
| `tros_classification` | 图像分类（ResNet18/MobileNetV2） | [图像分类](/Demos/algorithm_demo/classification/resnet18) |
| `tros_instance_segmentation` | 实例分割（YOLO11 seg） | [实例分割](/Demos/algorithm_demo/instance_segmentation/yolo11_seg) |
| `tros_pose_estimation` | 姿态估计（YOLO11 pose） | [姿态估计](/Demos/algorithm_demo/pose/yolo11_pose) |
| `tros_asr` | 语音识别 | [自动语音识别](/Demos/algorithm_demo/speech/asr) |

### 建图与定位

| 功能包 | 功能 |
| --- | --- |
| `tros_lidar_mapping` | 激光雷达建图 |
| `tros_visual_mapping` | 视觉建图 |
| `tros_localization` | 定位 |

### 规控

| 功能包 | 功能 |
| --- | --- |
| `tros_planning` | 路径规划 |
| `tros_control` | 运动控制 |
| `tros_cmd_vel` | 速度指令转换 |

### 传感器驱动

| 功能包 | 功能 |
| --- | --- |
| `tros_mipi_camera` | MIPI 摄像头驱动 |
| `tros_usb_camera` | USB 摄像头驱动 |
| `tros_imu` | IMU 驱动 |
| `tros_lidar` | 激光雷达驱动 |

### 工具

| 功能包 | 功能 |
| --- | --- |
| `tros_multi_sync` | 多传感器硬件同步（LPWM/PPS） |
| `tros_image_tools` | 图像格式转换与可视化 |

### 使用方法

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

- [使用 RDK Studio](./01_rdk_studio.md)
- [算法示例](/Demos/algorithm_demo/summary)（BPU 推理示例）
- [TROS/ROS 开发 FAQ](/FAQ/tros_ros)
