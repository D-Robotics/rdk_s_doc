---
title: "Using TogetheROS.Bot"
sidebar_position: 2
sidebar_label: "Using TogetheROS.Bot"
description: "User guide for the TogetheROS.Bot (tros.b) robotics middleware"
---

# Using TogetheROS.Bot

**TogetheROS.Bot** (**tros.b** for short) is a robotics middleware built by D-Robotics on top of ROS 2. It is delivered through RDK OS images and provides RDK development boards with robotics application development capabilities such as perception, planning and control, and mapping.

## What Is tros.b

tros.b is a ROS 2 distribution optimized by D-Robotics for the RDK platform. On top of standard ROS 2, it adds:

- **BPU algorithm nodes**: Model inference (YOLO/classification/segmentation, etc.) wrapped as ROS 2 nodes that directly leverage BPU hardware acceleration
- **Sensor driver nodes**: Integration with cameras, IMUs, LiDARs, and other sensors
- **Multi-sensor synchronization**: Hardware-level time synchronization based on LPWM/PPS
- **Preconfigured environment**: No manual ROS 2 installation needed; it works out of the box

## Relationship with RDK OS

```text
┌─────────────────────────────────────┐
│      Robot application layer        │
│ (User ROS 2 nodes + launch files)   │
├─────────────────────────────────────┤
│         tros.b middleware           │
│ (BPU nodes + sensor drivers + tools)│
├─────────────────────────────────────┤
│           RDK OS                    │
│ (Ubuntu + BPU drivers + VIO/Codec)  │
├─────────────────────────────────────┤
│           RDK hardware              │
│ (S100/S600 + BPU + MCU + sensors)   │
└─────────────────────────────────────┘
```

tros.b runs on top of RDK OS and achieves energy-efficient robot perception and planning/control through BPU hardware acceleration.

## Differences from Native ROS 2

| Aspect | Native ROS 2 | tros.b |
| --- | --- | --- |
| Installation | Manually install ROS 2 + dependencies | Works out of the box after flashing an image that includes tros.b |
| Model inference | CPU inference or your own integration | BPU-accelerated nodes with models already converted and quantized |
| Sensor synchronization | Software timestamps | Hardware-level LPWM/PPS synchronization |
| Performance | Limited by the CPU | BPU + MCU heterogeneous acceleration |

## Preinstalled Version

tros.b is released together with the RDK OS image, and its version corresponds to the RDK OS version. You can check with the following commands:

```bash
# Check the RDK OS version
cat /etc/version

# Check the tros.b version (if installed)
ros2 pkg list | head
```

:::note Board verification
tros.b is not currently preinstalled in the image on the S600 board. To use tros.b, you need to flash an RDK OS image that includes tros.b.
:::

## Robot Application Development

This section describes the basic workflow for developing robot applications on tros.b, including creating a workspace, writing nodes, and building and running.

### Environment Preparation

- An RDK OS image with tros.b has been flashed to the development board
- You have logged in to the development board via SSH

### Creating a ROS 2 Workspace

```bash
mkdir -p ~/tros_ws/src
cd ~/tros_ws
colcon build
```

### Writing a Node

Create a simple Python node:

```bash
cd ~/tros_ws/src
ros2 pkg create --build-type ament_python my_robot_node
```

Write the following in `my_robot_node/my_robot_node/my_robot_node.py`:

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

### Build

```bash
cd ~/tros_ws
colcon build --packages-select my_robot_node
source install/setup.bash
```

### Run

```bash
ros2 run my_robot_node my_robot_node
```

The output looks like:

```text
[INFO] [my_node]: Hello from tros.b!
[INFO] [my_node]: Hello from tros.b!
```

### Using BPU Inference Nodes

The BPU inference nodes provided by tros.b can be called directly in launch files, with no need to write inference code manually:

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
                # Path on S600; S100 uses /opt/hobot/model/s100/basic/
                'model': '/opt/hobot/model/s600/basic/'
                         'yolov5x_672x672_nv12.hbm',
                'camera': 'mipi_cam0',
            }],
        ),
    ])
```

See [Common Packages](#common-packages) and [Algorithm Demos](../../03_Demos/03_algorithm_demo/01_summary.md) for details.

## Common Packages

This section lists the common packages provided by tros.b, organized by functional domain. The packages cross-link with [Algorithm Demos](../../03_Demos/03_algorithm_demo/01_summary.md) and the [TROS/ROS Development FAQ](../../08_FAQ/06_tros_ros.md).

### Perception

| Package | Function | Corresponding algorithm demo |
| --- | --- | --- |
| `tros_yolo_detection` | Object detection (YOLOv5x/YOLO11) | [Object detection](../../03_Demos/03_algorithm_demo/03_detection/01_yolov5x.md) |
| `tros_classification` | Image classification (ResNet18/MobileNetV2) | [Image classification](../../03_Demos/03_algorithm_demo/02_classification/01_resnet18.md) |
| `tros_instance_segmentation` | Instance segmentation (YOLO11 seg) | [Instance segmentation](../../03_Demos/03_algorithm_demo/04_instance_segmentation/01_yolo11_seg.md) |
| `tros_pose_estimation` | Pose estimation (YOLO11 pose) | [Pose estimation](../../03_Demos/03_algorithm_demo/05_pose/01_yolo11_pose.md) |
| `tros_asr` | Speech recognition | [Automatic speech recognition](../../03_Demos/03_algorithm_demo/06_speech/01_asr.md) |

### Mapping and Localization

| Package | Function |
| --- | --- |
| `tros_lidar_mapping` | LiDAR mapping |
| `tros_visual_mapping` | Visual mapping |
| `tros_localization` | Localization |

### Planning and Control

| Package | Function |
| --- | --- |
| `tros_planning` | Path planning |
| `tros_control` | Motion control |
| `tros_cmd_vel` | Velocity command conversion |

### Sensor Drivers

| Package | Function |
| --- | --- |
| `tros_mipi_camera` | MIPI camera driver |
| `tros_usb_camera` | USB camera driver |
| `tros_imu` | IMU driver |
| `tros_lidar` | LiDAR driver |

### Tools

| Package | Function |
| --- | --- |
| `tros_multi_sync` | Multi-sensor hardware synchronization (LPWM/PPS) |
| `tros_image_tools` | Image format conversion and visualization |

### Usage

```bash
# List installed packages
ros2 pkg list | grep tros

# List parameters of the YOLO detection node
ros2 param list /tros_yolo_detection

# Launch YOLO detection
ros2 launch tros_yolo_detection yolo_detection.launch.py
```

:::note Board verification
tros.b is not currently preinstalled in the image on the S600 board; the commands above need to be run on an image that includes tros.b.
:::

## Related Documentation

- [Using RDK Studio](./01_rdk_studio.md)
- [Algorithm Demos](../../03_Demos/03_algorithm_demo/01_summary.md) (BPU inference demos)
- [TROS/ROS Development FAQ](../../08_FAQ/06_tros_ros.md)
