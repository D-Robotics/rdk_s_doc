---
title: "1.4.2.2 机器人应用开发"
sidebar_position: 2
description: "tros.b 机器人应用开发流程"
---

# 1.4.2.2 机器人应用开发

本节介绍在 tros.b 上开发机器人应用的基本流程，包括创建工作空间、编写节点、编译和运行。

## 环境准备

- 开发板已烧录带 tros.b 的 RDK OS 镜像
- 已通过 SSH 登录开发板

## 创建 ROS 2 工作空间

```bash
mkdir -p ~/tros_ws/src
cd ~/tros_ws
colcon build
```

## 编写节点

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

## 编译

```bash
cd ~/tros_ws
colcon build --packages-select my_robot_node
source install/setup.bash
```

## 运行

```bash
ros2 run my_robot_node my_robot_node
```

输出类似：

```text
[INFO] [my_node]: Hello from tros.b!
[INFO] [my_node]: Hello from tros.b!
```

## 使用 BPU 推理节点

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

详见 [1.4.2.3 常用功能包](./packages) 和 [3.3 算法示例](/Demos/algorithm_demo/summary)。

## 相关文档

- [1.4.2.1 TogetheROS.Bot 概述](./trosb_intro)
- [1.4.2.3 常用功能包](./packages)
- [3.3 算法示例](/Demos/algorithm_demo/summary)
