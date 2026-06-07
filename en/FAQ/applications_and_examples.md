# 8.3 Application Development, Compilation, and Examples

URL: https://developer.d-robotics.cc/rdk_s_doc/en/FAQ/applications_and_examples

This section answers common questions about installing and using third-party libraries on the RDK platform, compiling applications, running official examples, and related topics.

For cross-compilation deployment, refer to [Cross-Compilation Environment Setup](https://developer.d-robotics.cc/forumDetail/112555549341653662)

### Q1: How do I install, cross-compile, and use third-party libraries on RDK?

**A:**

- **Direct installation on the board:** If a third-party library provides prebuilt packages for the ARM architecture (for example, `.deb` files), or can be installed directly through a package manager (such as `apt` ), you can install it directly on the RDK board. For Python libraries, if PyPI provides corresponding arm64 wheel packages, you can also run `pip install` directly.
- **Cross-compilation:** If a third-party library must be built from source, it is recommended to cross-compile it on a PC development host and then deploy the build artifacts to the RDK board.
- **Environment setup:** For detailed steps on setting up a cross-compilation environment, refer to the D-Robotics Developer Community tutorial: [Cross-Compilation Environment Setup](https://developer.d-robotics.cc/forumDetail/112555549341653662)
- **Build steps:** You usually need to configure a CMake toolchain file and specify the cross-compiler, target system sysroot, and related settings.

### Q2: When compiling large programs (such as C++ projects or ROS packages), the build process is killed or logs show out-of-memory errors. How do I fix this?

**A:** When compiling large projects, if physical memory is insufficient, the Linux OOM (Out Of Memory) killer may terminate the process consuming the most memory (usually compiler processes such as `cc1plus` , `ld` , and so on), causing the build to fail. **Solution:** Increase system swap space. Swap is an area on disk where the system can temporarily store less frequently used memory data when physical memory is insufficient, freeing physical memory for the current task. Although swap is slower than physical memory, it can effectively prevent build failures caused by temporary memory shortages.

**Example steps to add swap space (create a 1 GB swap file):**

```bash
# 1. (Optional) Create a directory for the swap file, or create it directly in the root directory
sudo mkdir -p /swapfile_custom_dir 
cd /swapfile_custom_dir

# 2. Use dd to create an empty file of the specified size (bs=1M means 1 MB block size, count=1024 means 1024 blocks, i.e. 1 GB)
sudo dd if=/dev/zero of=swap bs=1M count=1024 

# 3. Set the correct file permissions (readable and writable by root only)
sudo chmod 0600 swap 

# 4. Format the file as a swap partition
sudo mkswap -f swap 

# 5. Enable the swap partition
sudo swapon swap 

# 6. Verify that swap space is enabled (shows total and used swap)
free -h
swapon --show
```

**Enable automatic mounting at boot (optional but recommended):** Edit the `/etc/fstab` file and add the following line at the end (assuming your swap file path is `/swapfile_custom_dir/swap` ):

```bash
/swapfile_custom_dir/swap none swap sw 0 0
```

**Reference tutorial:**[Swap Usage Tutorial](https://developer.d-robotics.cc/forumDetail/98129467158916281)

### Q3: How do I run the example program for the GC4633 MIPI camera?

**A:** D-Robotics officially provides AI algorithm examples based on common MIPI cameras (such as F37 and GC4663), for example FCOS object detection. These examples usually detect the connected camera model automatically and perform algorithm inference.

**Example run steps (using `/app/ai_inference/03_mipi_camera_sample` as an example):**

1. Make sure the GC4663 (or another compatible MIPI camera) is correctly connected to the RDK board's MIPI CSI interface and the board is powered on.
2. Log in to the board system through SSH or serial port.
3. Enter the example program directory:
```bash
cd /app/ai_inference/03_mipi_camera_sample 
# Note: The exact path may vary slightly depending on the RDK system version and image contents.
```
4. Run the Python example script with `sudo` :
```bash
sudo python3 mipi_camera.py
```
5. If the example is designed to output through HDMI, make sure the RDK board's HDMI interface is connected to a display. After running the example, you should see the live camera feed and AI processing results (such as detection boxes and classification labels) on the display.

### Q4: When using `rqt_image_view` to view RGB888 RAW images published by RDK through ROS, the display is very laggy or images cannot be received at all. What is the cause?

**A:** This issue is usually related to ROS 2 middleware DDS configuration and network transmission efficiency, especially when transmitting uncompressed large raw image data.

- **Cause analysis:**
- By default, Fast DDS may not implement effective MTU (Maximum Transmission Unit) fragmentation at the UDP protocol layer. When the published image packet size exceeds the MTU on the network path, the IP layer performs fragmentation.
- A large number of IP fragments can impose a heavy processing burden on many common routers, switches, or network interface cards, which may fail to buffer all fragments effectively.
- In UDP transmission, if any IP fragment is lost, the entire UDP packet (i.e., the entire image frame) is usually discarded, or must wait for retransmission (if the upper layer provides such a mechanism; however, ROS image topics usually do not guarantee reliable transmission). This causes severe lag or image loss. This behavior is sometimes similar to an "IP fragmentation attack," where large numbers of fragments cause network congestion and packet loss.
- **Solutions:**
1. **Switch DDS implementation:** Try changing the ROS 2 RMW (ROS Middleware) implementation from the default `rmw_fastrtps_cpp` to `rmw_cyclonedds_cpp` . CycloneDDS sometimes performs better when handling large packets and network fragmentation. Run the following command in the terminal to switch DDS (valid only for the current terminal session, or add it to `.bashrc` ):
```bash
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
```

Then restart your ROS nodes.
2. **Reduce transmitted data volume:**
- **Publish compressed images:** Consider compressing raw images (such as RGB888) to JPEG, PNG, or other formats on the RDK board before publishing them through ROS topics. This significantly reduces the data size of each frame. You can subscribe to the compressed image topic on the PC and decompress it for display with `rqt_image_view` (or a custom node).
- **Reduce resolution or frame rate:** If your application allows it, lowering the published image resolution or frame rate can also effectively reduce network load.
3. **Publish compressed images:** Consider compressing raw images (such as RGB888) to JPEG, PNG, or other formats on the RDK board before publishing them through ROS topics. This significantly reduces the data size of each frame. You can subscribe to the compressed image topic on the PC and decompress it for display with `rqt_image_view` (or a custom node).
4. **Reduce resolution or frame rate:** If your application allows it, lowering the published image resolution or frame rate can also effectively reduce network load.

### Q5: Do D-Robotics Linux images (specifically minimally trimmed systems, not full Ubuntu Desktop/Server) support direct compilation on the board?

**A:** Some Linux images provided by D-Robotics for RDK, especially rootfs images that have been minimally trimmed for embedded deployment, may **not include** a complete build toolchain (such as GCC, G++, make, CMake, and so on) or the headers and libraries required for development.

- **Conclusion:** These minimally trimmed Linux images usually **do not support or are not suitable for** complex source-code compilation directly on the board.
- **Recommended approach:** For applications that need to run on RDK, use **cross-compilation** . Set up a cross-compilation environment on a PC development host (such as an Ubuntu PC) for the RDK target platform, complete the build on the PC, and then deploy the generated executables and related dependencies to the RDK board.

### Q6: How do I run the examples provided in the official manual on D-Robotics minimally trimmed Linux images (these examples are usually demonstrated in an Ubuntu system environment)?

**A:** Examples in the official manual (especially TROS/ROS-related examples) are usually demonstrated in a more complete Ubuntu system environment. To run these examples (especially C++ ROS nodes) on a minimally trimmed Linux image (which may not have a preinstalled Python interpreter or a complete ROS environment), some adjustments are required:

- **Differences between Ubuntu systems and Linux images when starting examples:**

- **Environment configuration:**
- **Ubuntu system:** Usually use `source /opt/tros/setup.bash` (or the setup.bash for the corresponding ROS version) to configure the TROS/ROS environment. This script sets many environment variables (such as `PATH` , `LD_LIBRARY_PATH` , `AMENT_PREFIX_PATH` , and so on).
- **Linux image:** You may need to set key environment variables manually, especially `LD_LIBRARY_PATH` , to ensure the program can find the required shared libraries. The log path `ROS_LOG_DIR` may also need to be manually specified to a writable location.
- **Configuration file copy:** Regardless of system type, before running an example you usually need to copy the configuration files required by the example (such as model configuration and parameter files) from the TROS/ROS installation path to the current working directory or a specified path.
- **Startup method:**
- **Ubuntu system:** Commonly use `ros2 run <package_name> <executable_name>` or `ros2 launch <package_name> <launch_file_name>` to start nodes or launch files.
- **Linux image:** Because the complete `ros2` command-line tools or launch system may not be available, you usually need to run the compiled C++ executable directly and pass the parameters originally set in the launch file through command-line arguments.
- **Converting launch script content into direct execution commands on a Linux image (using the C++ `dnn_node_example` as an example):**

1. **Analyze the startup commands on Ubuntu:**

```bash
# Ubuntu: Configure the tros.b environment
source /opt/tros/setup.bash

# Ubuntu: Copy the configuration files required to run the example from the tros.b installation path.
# config contains the model used by the example and the local image used for offline inference
cp -r /opt/tros/${TROS_DISTRO}/lib/dnn_node_example/config/ .

# Ubuntu: Run offline inference with a local JPG image and save the rendered output image
ros2 launch dnn_node_example dnn_node_example_feedback.launch.py
```
2. **Find the launch script and analyze its contents:**

- **Find the launch script path:**
```bash
# find /opt/tros/ -name dnn_node_example_feedback.launch.py
/opt/tros/share/dnn_node_example/launch/dnn_node_example_feedback.launch.py
```
- **View the launch script contents (Python launch file):**
```python
# dnn_node_example_feedback.launch.py (main content excerpt)
def generate_launch_description():
    config_file_launch_arg = DeclareLaunchArgument(
        "dnn_example_config_file", default_value=TextSubstitution(text="config/fcosworkconfig.json")
    )

    img_file_launch_arg = DeclareLaunchArgument(
        "dnn_example_image", default_value=TextSubstitution(text="config/test.jpg")
    )

    # Copy files from config
    dnn_node_example_path = os.path.join(
        get_package_prefix('dnn_node_example'),
        "lib/dnn_node_example")
    # print("dnn_node_example_path is ", dnn_node_example_path) # This line is usually not printed directly in launch
    # cp_cmd = "cp -r " + dnn_node_example_path + "/config ."
    # print("cp_cmd is ", cp_cmd) # This line is usually not printed directly in launch
    # os.system(cp_cmd) # Launch files usually do not execute shell copy commands directly; they rely on ament_cmake install rules

    return LaunchDescription([
        config_file_launch_arg,
        img_file_launch_arg,
        Node(
            package='dnn_node_example',
            executable='example', # Executable file name
            output='screen',
            parameters=[         # Parameters passed to the executable
                {"feed_type": 0},
                {"config_file": LaunchConfiguration('dnn_example_config_file')}, 
                {"image": LaunchConfiguration('dnn_example_image')},            
                {"image_type": 0},
                {"dump_render_img": 1}
            ],
            arguments=['--ros-args', '--log-level', 'info']
        )
    ])
```
From the launch script, we can see that it starts the executable named `example` in the `dnn_node_example` package and passes a series of parameters.
3. **Find the launch script path:**
```bash
# find /opt/tros/ -name dnn_node_example_feedback.launch.py
/opt/tros/share/dnn_node_example/launch/dnn_node_example_feedback.launch.py
```
4. **View the launch script contents (Python launch file):**
```python
# dnn_node_example_feedback.launch.py (main content excerpt)
def generate_launch_description():
    config_file_launch_arg = DeclareLaunchArgument(
        "dnn_example_config_file", default_value=TextSubstitution(text="config/fcosworkconfig.json")
    )

    img_file_launch_arg = DeclareLaunchArgument(
        "dnn_example_image", default_value=TextSubstitution(text="config/test.jpg")
    )

    # Copy files from config
    dnn_node_example_path = os.path.join(
        get_package_prefix('dnn_node_example'),
        "lib/dnn_node_example")
    # print("dnn_node_example_path is ", dnn_node_example_path) # This line is usually not printed directly in launch
    # cp_cmd = "cp -r " + dnn_node_example_path + "/config ."
    # print("cp_cmd is ", cp_cmd) # This line is usually not printed directly in launch
    # os.system(cp_cmd) # Launch files usually do not execute shell copy commands directly; they rely on ament_cmake install rules

    return LaunchDescription([
        config_file_launch_arg,
        img_file_launch_arg,
        Node(
            package='dnn_node_example',
            executable='example', # Executable file name
            output='screen',
            parameters=[         # Parameters passed to the executable
                {"feed_type": 0},
                {"config_file": LaunchConfiguration('dnn_example_config_file')}, 
                {"image": LaunchConfiguration('dnn_example_image')},            
                {"image_type": 0},
                {"dump_render_img": 1}
            ],
            arguments=['--ros-args', '--log-level', 'info']
        )
    ])
```
5. **Find the executable path:** Search for the executable under the TROS installation path:

```bash
# find /opt/tros/ -name example -executable -type f 
# (A more precise search may be based on the package name)
# Usually located at /opt/tros/${TROS_DISTRO}/lib/<package_name>/<executable_name>
# Example path: /opt/tros/humble/lib/dnn_node_example/example
```

(If the `TROS_DISTRO` environment variable is not set on the Linux image, you need to know the actual distro name, such as `humble` or `foxy` )
6. **Construct the startup command on the Linux image:**

- **Configure the environment:**
```bash
# Assume TROS library files are located at /opt/tros/humble/lib (confirm the actual path)
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/opt/tros/humble/lib/ 
# Specify a writable log directory
export ROS_LOG_DIR=/userdata/  # or /tmp/roslogs/
mkdir -p $ROS_LOG_DIR
```
- **Copy configuration files:** (Similar to Ubuntu)
```bash
# For example, for the humble version:
cp -r /opt/tros/humble/lib/dnn_node_example/config/ .
```
- **Run the executable directly and pass parameters:** ROS 2 node parameters are usually passed in the form `--ros-args -p <param_name>:=<param_value>` .
```bash
/opt/tros/humble/lib/dnn_node_example/example \
    --ros-args \
    -p feed_type:=0 \
    -p config_file:="config/fcosworkconfig.json" \
    -p image:="config/test.jpg" \
    -p image_type:=0 \
    -p dump_render_img:=1 \
    --log-level info
```
7. **Configure the environment:**
```bash
# Assume TROS library files are located at /opt/tros/humble/lib (confirm the actual path)
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/opt/tros/humble/lib/ 
# Specify a writable log directory
export ROS_LOG_DIR=/userdata/  # or /tmp/roslogs/
mkdir -p $ROS_LOG_DIR
```
8. **Copy configuration files:** (Similar to Ubuntu)
```bash
# For example, for the humble version:
cp -r /opt/tros/humble/lib/dnn_node_example/config/ .
```
9. **Run the executable directly and pass parameters:** ROS 2 node parameters are usually passed in the form `--ros-args -p <param_name>:=<param_value>` .
```bash
/opt/tros/humble/lib/dnn_node_example/example \
    --ros-args \
    -p feed_type:=0 \
    -p config_file:="config/fcosworkconfig.json" \
    -p image:="config/test.jpg" \
    -p image_type:=0 \
    -p dump_render_img:=1 \
    --log-level info
```

- **A complete example run script on a Linux image may look like this:**
```bash
#!/bin/bash

# 1. Configure the environment
# Adjust according to the actual TROS version and installation path
TROS_DISTRO_NAME="humble" # or "foxy", etc.
TROS_INSTALL_LIB_DIR="/opt/tros/${TROS_DISTRO_NAME}/lib"
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:${TROS_INSTALL_LIB_DIR}
# Add other dependent library paths if needed
# export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:${TROS_INSTALL_LIB_DIR}/aarch64-linux-gnu # example

export ROS_LOG_DIR=/userdata/ros_logs_$(date +%s)
mkdir -p $ROS_LOG_DIR
echo "ROS logs will be stored in $ROS_LOG_DIR"

# 2. Prepare the working directory and configuration files
WORK_DIR="/tmp/dnn_example_run_$(date +%s)" # Use a timestamp to avoid conflicts
mkdir -p $WORK_DIR
cd $WORK_DIR
echo "Working directory: $(pwd)"

CONFIG_SOURCE_DIR="${TROS_INSTALL_LIB_DIR}/dnn_node_example/config"
if [ -d "$CONFIG_SOURCE_DIR" ]; then
    echo "Copying config files from $CONFIG_SOURCE_DIR to $(pwd)/config"
    mkdir -p config
    cp -r $CONFIG_SOURCE_DIR/* ./config/
else
    echo "Error: Config source directory $CONFIG_SOURCE_DIR not found."
    exit 1
fi

# 3. Run the executable
EXECUTABLE_PATH="${TROS_INSTALL_LIB_DIR}/dnn_node_example/example"
if [ ! -f "$EXECUTABLE_PATH" ]; then
    echo "Error: Executable $EXECUTABLE_PATH not found."
    exit 1
fi

echo "Starting DNN example..."
$EXECUTABLE_PATH \
    --ros-args \
    -p feed_type:=0 \
    -p config_file:="config/fcosworkconfig.json" \
    -p image:="config/test.jpg" \
    -p image_type:=0 \
    -p dump_render_img:=1 \
    --log-level info

echo "DNN example finished. Check $WORK_DIR for output and $ROS_LOG_DIR for logs."
```
tip

- In addition to setting the log path with the `ROS_LOG_DIR` environment variable, you can also use the startup argument `--ros-args --disable-external-lib-logs` to prevent the node from writing logs to files and print logs directly to the console. For example:
```bash
$EXECUTABLE_PATH --ros-args --disable-external-lib-logs \
    -p feed_type:=0 -p image_type:=0 -p dump_render_img:=1
```
- For detailed ROS 2 logging information, refer to: [ROS 2 Documentation - About Logging](https://docs.ros.org/en/humble/Concepts/Intermediate/About-Logging.html)

### Q7: How do I quickly find the exact path of a ROS/TROS launch script file?

**A:** When you know the filename of a launch script (for example, `dnn_node_example.launch.py` ) but need to modify it or view its contents, you can use the `find` command under the TROS installation path on the RDK board (usually `/opt/tros/` ).

**Search example:**

```bash
# Find the file named dnn_node_example.launch.py
find /opt/tros/ -name dnn_node_example.launch.py
```

### Q8: Cross-compiling the full TogetheROS.Bot (tros.b) source code is very slow. Are there ways to speed it up?

**A:** A full build of all tros.b packages does take a long time (for example, about 20 minutes on a PC with an 8-core CPU and 32 GB RAM). The following are two ways to speed up compilation:

1. **Use the minimal build script:**

- In the tros.b build scripts provided by D-Robotics, in addition to `all_build.sh` (full build), there is usually a `minimal_build.sh` (minimal build) option.
- Minimal build usually skips non-core packages such as algorithm examples and test cases, significantly reducing build time.
- **Usage:** In your cross-compilation configuration step, replace the command that calls `./robot_dev_config/all_build.sh` with `./robot_dev_config/minimal_build.sh` .
2. In the tros.b build scripts provided by D-Robotics, in addition to `all_build.sh` (full build), there is usually a `minimal_build.sh` (minimal build) option.
3. Minimal build usually skips non-core packages such as algorithm examples and test cases, significantly reducing build time.
4. **Usage:** In your cross-compilation configuration step, replace the command that calls `./robot_dev_config/all_build.sh` with `./robot_dev_config/minimal_build.sh` .
5. **Manually ignore packages that do not need to be built:**

- Colcon (the ROS 2 build tool) supports ignoring a package by placing an empty file named `COLCON_IGNORE` in the package source directory.
- **Steps:**
1. First, determine which packages you do not need. These package sources are usually downloaded into the `src/` directory before compilation through a `.repos` file (for example, `robot_dev_config/ros2_release.repos` ).
2. Check the `.repos` file and find the source path of the package you want to ignore. For example, if the `.repos` file contains the following configuration:
```yaml
ament/google_benchmark_vendor:
  type: git
  url: [https://github.com/ament/google_benchmark_vendor.git](https://github.com/ament/google_benchmark_vendor.git)
  version: 0.0.7
```

This means the source code for the `google_benchmark_vendor` package will be downloaded to `src/ament/google_benchmark_vendor/` .
3. Create an empty `COLCON_IGNORE` file in the root directory of that package source:
```bash
touch src/ament/google_benchmark_vendor/COLCON_IGNORE
```
4. On the next `colcon build` , this package will be skipped. You can do this for multiple packages you do not need.
6. Colcon (the ROS 2 build tool) supports ignoring a package by placing an empty file named `COLCON_IGNORE` in the package source directory.
7. **Steps:**
1. First, determine which packages you do not need. These package sources are usually downloaded into the `src/` directory before compilation through a `.repos` file (for example, `robot_dev_config/ros2_release.repos` ).
2. Check the `.repos` file and find the source path of the package you want to ignore. For example, if the `.repos` file contains the following configuration:
```yaml
ament/google_benchmark_vendor:
  type: git
  url: [https://github.com/ament/google_benchmark_vendor.git](https://github.com/ament/google_benchmark_vendor.git)
  version: 0.0.7
```

This means the source code for the `google_benchmark_vendor` package will be downloaded to `src/ament/google_benchmark_vendor/` .
3. Create an empty `COLCON_IGNORE` file in the root directory of that package source:
```bash
touch src/ament/google_benchmark_vendor/COLCON_IGNORE
```
4. On the next `colcon build` , this package will be skipped. You can do this for multiple packages you do not need.
8. First, determine which packages you do not need. These package sources are usually downloaded into the `src/` directory before compilation through a `.repos` file (for example, `robot_dev_config/ros2_release.repos` ).
9. Check the `.repos` file and find the source path of the package you want to ignore. For example, if the `.repos` file contains the following configuration:
```yaml
ament/google_benchmark_vendor:
  type: git
  url: [https://github.com/ament/google_benchmark_vendor.git](https://github.com/ament/google_benchmark_vendor.git)
  version: 0.0.7
```

This means the source code for the `google_benchmark_vendor` package will be downloaded to `src/ament/google_benchmark_vendor/` .
10. Create an empty `COLCON_IGNORE` file in the root directory of that package source:
```bash
touch src/ament/google_benchmark_vendor/COLCON_IGNORE
```
11. On the next `colcon build` , this package will be skipped. You can do this for multiple packages you do not need.

### Q9: After installing the official tros.b on an RDK board, can I still install and use other ROS versions (such as ROS 1 or different ROS 2 distros)?

**A:****Yes.**

- After installing D-Robotics tros.b on an RDK board (for example, based on ROS 2 Humble), you can still try to install other ROS versions, including ROS 1 (such as Noetic or Melodic) or other ROS 2 distros (such as Foxy or Galactic, if they support the ARM64 architecture and you can find or build installation packages yourself).
- Different ROS versions can coexist on the system and are usually installed in different paths (for example, ROS 1 at `/opt/ros/noetic/` , ROS 2 Humble at `/opt/ros/humble/` , and tros.b at `/opt/tros/humble/` ).

**Important Notes**
**Only one ROS version environment can be sourced in a single terminal session!**

- If you run `source /opt/tros/humble/setup.bash` in a terminal to activate the tros.b (Humble) environment, you **must not** source another ROS version environment in the same terminal (such as `source /opt/ros/foxy/setup.bash` or `source /opt/ros/noetic/setup.bash` ), and vice versa.
- Sourcing multiple ROS version environments at the same time causes environment variable conflicts (such as `PATH` , `LD_LIBRARY_PATH` , `PYTHONPATH` , `AMENT_PREFIX_PATH` , `ROS_PACKAGE_PATH` , and so on), which makes ROS commands and program behavior inconsistent.
- If you need to switch between different ROS versions, open a separate terminal session for each version and source the corresponding `setup.bash` file in each session.
- **Compatibility between tros.b and ROS 2 Foxy/Humble:**

- D-Robotics tros.b is usually built and optimized based on a specific ROS 2 LTS version (such as Foxy or Humble) and remains API-compatible with it. This means that if your tros.b is based on Humble, you can usually use tools and libraries developed for standard ROS 2 Humble directly without installing standard ROS 2 Humble separately (unless you need specific tools from the full standard ROS 2 Desktop that are not included in tros.b).

### Q10: When using `colcon build` to compile a ROS 2 package, I get `AttributeError: module 'pyparsing' has no attribute 'operatorPrecedence'` . How do I fix it?

**A:** The error `AttributeError: module 'pyparsing' has no attribute 'operatorPrecedence'` is usually caused by an outdated `python3-catkin-pkg` installation (a Python library used to parse ROS package.xml files), an incompatible `pyparsing` version, or incomplete functionality in `python3-catkin-pkg` itself.

**Solution:** Try upgrading `python3-catkin-pkg` to a newer version from the official ROS APT repository.

**Steps:**

1. **Add the official ROS APT repository** (if not already added): This step ensures you can obtain the latest compatible `python3-catkin-pkg` version from the official ROS source.

```bash
sudo apt update && sudo apt install curl gnupg2 lsb-release
sudo curl -sSL [https://raw.githubusercontent.com/ros/rosdistro/master/ros.key](https://raw.githubusercontent.com/ros/rosdistro/master/ros.key) -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] [http://packages.ros.org/ros2/ubuntu](http://packages.ros.org/ros2/ubuntu) $(source /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

Note: `$(source /etc/os-release && echo $UBUNTU_CODENAME)` automatically retrieves your current Ubuntu codename (such as `focal` for 20.04 and `jammy` for 22.04).
2. **Remove the old version of `python3-catkin-pkg`** (optional, but sometimes helps ensure a clean installation):

```bash
sudo apt remove python3-catkin-pkg
```
3. **Update the APT cache and install the new version of `python3-catkin-pkg` :**

```bash
sudo apt update
sudo apt install python3-catkin-pkg
```
4. After installation or upgrade completes, try running `colcon build` again.
If the problem persists, you may also need to check the version of the `pyparsing` library itself and ensure it is compatible with the newly installed `python3-catkin-pkg` version. Sometimes you may need to manage the `pyparsing` version through `pip` .

### Q11: How do I check the tros.b version information?

**A:** After tros.b installation completes, log in to the RDK system and use the following command to view the version information of the tros.b meta-package, which usually also represents the base version of the entire tros.b distribution:

```bash
apt show tros
```

**Example output (RDK OS 2.x system, tros.b 2.0.0):**

```bash
Package: tros
Version: 2.0.0-20230523223852
Maintainer: kairui.wang <kairui.wang@horizon.ai>
Installed-Size: unknown
Depends: hobot-models-basic, tros-ros-base, tros-ai-msgs, ... (many dependencies)
Download-Size: 980 B
APT-Manual-Installed: yes
APT-Sources: [http://archive.d-robotics.cc/ubuntu-rdk](http://archive.d-robotics.cc/ubuntu-rdk) focal/main arm64 Packages
Description: TogetheROS Bot
```

**Example output (RDK OS 1.x system, tros.b 1.1.6):**

```bash
Package: tros
Version: 1.1.6
Section: utils
Maintainer: kairui.wang <kairui.wang@horizon.ai>
Installed-Size: 1,536 MB
Pre-Depends: hhp-verify
Depends: symlinks, locales, hhp-verify, hobot-models-basic, hobot-arm64-libs (>= 1.1.6)
Apt-Sources: [http://archive.d-robotics.cc/ubuntu-ports](http://archive.d-robotics.cc/ubuntu-ports) focal/main arm64 Packages
Date: 2023
```

### Q12: What are the main notes and differences between tros.b 1.x and 2.x (and newer versions)?

**A:**

- **Relationship with system versions and RDK platform hardware:**

- **tros.b 2.x (and later versions such as 3.x):**
- Usually supports only the corresponding major version of RDK OS (for example, tros.b 2.x supports RDK OS 2.x).
- Supports the full range of hardware for the corresponding RDK OS version.
- Future new features and main maintenance for tros.b will focus on these newer versions.
- Code is usually hosted under the `D-Robotics` organization on GitHub.
- **tros.b 1.x:**
- A legacy version.
- Supports only earlier 1.x RDK OS systems and corresponding hardware.
- Future tros.b 1.x releases may include only critical bug fixes, with no new feature development.
- Code was previously hosted on GitLab or other internal platforms.
- Reference link (legacy version documentation): [tros.b 1.x Documentation](https://developer.d-robotics.cc/api/v1/fileData/TogetherROS/index.html)
**Note**
tros.b 1.x **cannot** be upgraded directly to tros.b 2.x or newer through `apt` . If you need to use a newer tros.b version, you must first upgrade the entire RDK board operating system by flashing an RDK OS image that supports the newer tros.b version, and then install the corresponding tros.b version. Reference: Install the corresponding board OS (refer to the install chapter for your board model in this documentation site)
- **Feature differences:**

- Core ROS 2 functionality remains the same across compatible versions.
- Features optimized for D-Robotics hardware, newly added specific packages, and the latest AI algorithm support are usually provided first or only in tros.b 2.x and newer versions.
- **Different package management methods:**

- **tros.b 1.x:** May use one large monolithic installation package.
- **tros.b 2.x (and newer versions):** Usually splits tros.b into multiple finer-grained Debian packages by functional module (such as `tros-ros-base` , `tros-dnn-node` , `tros-mipi-cam` , and so on), allowing users to install packages as needed. For developers, installing through `apt install tros` (meta-package) or `apt install <specific_tros_package>` provides a similar experience.
- **Usage differences:**

- **apt installation and upgrade methods:** Basic `apt` command usage is similar, but software sources and package names may differ.
- **Source compilation methods:** The build process and tools (such as Colcon) are basically the same, but the dependent ROS 2 base version and specific library versions differ.
- **Example launch scripts:** In tros.b 2.x and newer versions, example launch script filenames, parameters, dependencies, and related settings may have been optimized and adjusted and are not fully compatible with 1.x. Be sure to refer to the manual for the corresponding tros.b version when running examples.

### Q13: When using a web browser (such as Chrome, Edge, or Firefox) to access a web service running on RDK through an IP address and port number (for example, `http://\<RDK_IP>:8000` ), the page fails to open. What could be the cause?

**A:** If the browser cannot open the web page hosted on RDK, possible causes include:

- **Nginx service conflict or failure to start correctly (for certain web examples that depend on Nginx):**

- **Cause:** If Nginx is already running on the RDK board because of another application (for example, a previous web display example without a specific port number that may have started a global Nginx service listening on port 80), then when you try to start a new web example that also wants to use Nginx (or a specific port), the new service may fail to start correctly or listen on the expected port because Nginx is already running or the port is already in use.
- **Solution:**
1. **Check and stop existing Nginx processes:** Log in to the RDK board through SSH, use `ps aux | grep nginx` to check whether Nginx processes are running, and if so, try `sudo systemctl stop nginx` (if it is a systemd service) or `sudo pkill nginx` to stop them.
2. **Reboot the RDK board:** A simple but effective approach is to reboot the board to ensure all old service processes are closed.
3. Then rerun your target web example.
- **Network connectivity issues:**

- Make sure your PC and the RDK board are on the same local network and the network is working (the PC can ping the RDK IP address).
- Verify that the RDK board IP address is correct.
- **Firewall issues:**

- A firewall on the PC or in the network may block access to the target port on the RDK board (such as 8000). Check and configure firewall rules to allow communication on that port.
- The RDK board's own firewall (such as `ufw` , which may be disabled by default) may also block external access if configured incorrectly.
- **The web service itself did not start successfully or is listening on the wrong address/port:**

- Log in to the RDK board through SSH and verify that the web service you expect to run (for example, the TROS `hobot_websocket` node or another Python HTTP server) has actually started successfully and is listening on the IP address and port you are trying to access.
- Check the service logs on the board for error messages.
- Use `netstat -tulnp | grep <port_number>` (for example, `netstat -tulnp | grep 8000` ) on the board to verify that the port is actually in LISTEN state.
- **Browser cache or proxy issues:**

- Try clearing the browser cache or using the browser's incognito/private mode.
- If your PC network configuration uses a proxy server, check whether the proxy settings affect direct access to local network IP addresses.

### Q14: When accessing the TROS Websocket visualization example through a web browser, only the camera image is displayed and AI perception results (such as detection boxes and skeleton keypoints) are not rendered. What is the cause?

**A:** If the Websocket visualization page can display images but not AI results, the image data stream is usually working, but the AI result data stream may have a problem, or the frontend rendering logic was not triggered correctly.

1. **Check Web Node startup command parameters:**

- Many TROS Websocket nodes (such as `hobot_websocket` ) can control whether AI perception results are rendered through parameters at startup. Carefully check the `ros2 launch` or `ros2 run` command used to start the node and make sure relevant parameters (for example, parameters similar to `display_ai_results:=true` or `render_perception:=true` ) are set correctly to enable perception result rendering.
- For specific parameter names and usage, refer to the README or launch file of the corresponding Websocket package (such as `hobot_websocket` ). For example: [hobot_websocket README - Parameters](https://github.com/D-Robotics/hobot_websocket#%E5%8F%82%E6%95%B0)
2. Many TROS Websocket nodes (such as `hobot_websocket` ) can control whether AI perception results are rendered through parameters at startup. Carefully check the `ros2 launch` or `ros2 run` command used to start the node and make sure relevant parameters (for example, parameters similar to `display_ai_results:=true` or `render_perception:=true` ) are set correctly to enable perception result rendering.
3. For specific parameter names and usage, refer to the README or launch file of the corresponding Websocket package (such as `hobot_websocket` ). For example: [hobot_websocket README - Parameters](https://github.com/D-Robotics/hobot_websocket#%E5%8F%82%E6%95%B0)
4. **Check logs in the Web Node startup terminal:**

- In the terminal window on the RDK board where the Websocket node was started, carefully check for any ERROR or WARN log output. These logs may indicate problems in AI result processing or transmission.
5. In the terminal window on the RDK board where the Websocket node was started, carefully check for any ERROR or WARN log output. These logs may indicate problems in AI result processing or transmission.
6. **Confirm that AI perception result data is being published:**

- AI perception results (such as detection boxes and pose keypoints) are usually published through separate ROS topics (for example, custom AI messages of type `*_msgs/AiMsg` ).
- In a new terminal (after sourcing the TROS environment), use `ros2 topic list` to view all active topics and confirm whether a topic publishing AI perception results exists.
- If the topic exists, use `ros2 topic echo /the_ai_result_topic_name` (replace with the actual AI result topic name) to view data being published on that topic in real time. If there is no output for a long time, the upstream AI inference node may not be working correctly or may not have detected any targets.
7. AI perception results (such as detection boxes and pose keypoints) are usually published through separate ROS topics (for example, custom AI messages of type `*_msgs/AiMsg` ).
8. In a new terminal (after sourcing the TROS environment), use `ros2 topic list` to view all active topics and confirm whether a topic publishing AI perception results exists.
9. If the topic exists, use `ros2 topic echo /the_ai_result_topic_name` (replace with the actual AI result topic name) to view data being published on that topic in real time. If there is no output for a long time, the upstream AI inference node may not be working correctly or may not have detected any targets.
10. **Check whether multiple Web Node instances were started accidentally:**

- If multiple Websocket node instances were started on the board for some reason, they may interfere with each other, or the browser may connect to an instance that is not receiving or processing AI data correctly.
- On the board, use `ps aux | grep web` (or a more specific process name) to check whether multiple Websocket service processes are running. If so, use `kill <PID>` to stop all extra Websocket processes and start only one instance.
11. If multiple Websocket node instances were started on the board for some reason, they may interfere with each other, or the browser may connect to an instance that is not receiving or processing AI data correctly.
12. On the board, use `ps aux | grep web` (or a more specific process name) to check whether multiple Websocket service processes are running. If so, use `kill <PID>` to stop all extra Websocket processes and start only one instance.
13. **Frontend/backend data synchronization or rendering logic issues:**

- Make sure the message format and protocol version between the Websocket server (backend, running on RDK) and the browser client (frontend) match.
- Check the Console and Network tabs in the browser developer tools for JavaScript errors or Websocket communication errors.
14. Make sure the message format and protocol version between the Websocket server (backend, running on RDK) and the browser client (frontend) match.
15. Check the Console and Network tabs in the browser developer tools for JavaScript errors or Websocket communication errors.

### Q15: How do I configure and use zero-copy data transmission in TROS Humble?

**A:** Zero-copy is an efficient data transmission mechanism that allows data to be passed between ROS nodes without unnecessary memory copies, reducing latency and CPU usage. It is especially suitable for transmitting large data blocks such as images. TROS Humble (based on ROS 2 Humble) supports zero-copy by leveraging the shared memory (SHM) transport feature of Fast DDS (one of the default DDS implementations).

**Configuration steps (applicable to Ubuntu systems and Linux systems):**

1. **Set the required environment variables:** In the terminal where ROS nodes will run, execute the following commands to configure Fast DDS to use shared memory for transport:

```bash
# 1. Ensure the RMW implementation is Fast DDS (usually the Humble default, but explicit setting is safer)
export RMW_IMPLEMENTATION=rmw_fastrtps_cpp

# 2. Specify the Fast DDS configuration file path that enables shared memory transport
#    Note: This path is an example; adjust it according to your actual TROS Humble installation path
#    Usually at /opt/tros/humble/lib/hobot_shm/config/shm_fastdds.xml or a similar location
export FASTRTPS_DEFAULT_PROFILES_FILE=/opt/tros/humble/lib/hobot_shm/config/shm_fastdds.xml 

# 3. Force Fast DDS to load QoS settings from the XML configuration file
export RMW_FASTRTPS_USE_QOS_FROM_XML=1

# 4. Enable ROS 2 loaned messages, which is key to zero-copy
export ROS_DISABLE_LOANED_MESSAGES=0
```

- 
For detailed descriptions of these environment variables, refer to the ROS 2 official documentation or Fast DDS documentation, for example:

- [ROS 2 using Fast DDS middleware](https://fast-dds.docs.eprosima.com/en/latest/fastdds/ros2/ros2.html)
- D-Robotics official `hobot_shm` package README: [hobot_shm README_cn.md](https://github.com/D-Robotics/hobot_shm/blob/develop/README_cn.md) (visit the latest official link)
2. 
3. [ROS 2 using Fast DDS middleware](https://fast-dds.docs.eprosima.com/en/latest/fastdds/ros2/ros2.html)
4. D-Robotics official `hobot_shm` package README: [hobot_shm README_cn.md](https://github.com/D-Robotics/hobot_shm/blob/develop/README_cn.md) (visit the latest official link)
5. **Start ROS nodes that support zero-copy:**

- Both the publishing node (Publisher) and subscribing node (Subscriber) must support and use the loaned message API in their code. Some official TROS packages provided by D-Robotics (such as `mipi_cam` and `hobot_codec` ) may already support zero-copy.
- For example, start the `mipi_cam` node to publish shared memory images:
```bash
# First source the TROS Humble environment
source /opt/tros/humble/setup.bash
# (Then set the environment variables above)
ros2 launch mipi_cam mipi_cam.launch.py mipi_video_device:=F37
```

-
- Start the `hobot_codec` node to subscribe to images through shared memory and process them:
```bash
# (Also source the environment and set the environment variables above)
ros2 launch hobot_codec hobot_codec.launch.py codec_in_mode:=shared_mem codec_in_format:=nv12 codec_out_mode:=ros codec_out_format:=jpeg codec_sub_topic:=/hbmem_img codec_pub_topic:=/image_jpeg
```

-
6. Both the publishing node (Publisher) and subscribing node (Subscriber) must support and use the loaned message API in their code. Some official TROS packages provided by D-Robotics (such as `mipi_cam` and `hobot_codec` ) may already support zero-copy.
7. For example, start the `mipi_cam` node to publish shared memory images:
```bash
# First source the TROS Humble environment
source /opt/tros/humble/setup.bash
# (Then set the environment variables above)
ros2 launch mipi_cam mipi_cam.launch.py mipi_video_device:=F37
```

-
8. 
9. Start the `hobot_codec` node to subscribe to images through shared memory and process them:
```bash
# (Also source the environment and set the environment variables above)
ros2 launch hobot_codec hobot_codec.launch.py codec_in_mode:=shared_mem codec_in_format:=nv12 codec_out_mode:=ros codec_out_format:=jpeg codec_sub_topic:=/hbmem_img codec_pub_topic:=/image_jpeg
```

-
10. 
**Verify that zero-copy is working:**

- When zero-copy-enabled publishers and subscribers communicate successfully through shared memory, the system creates memory-mapped files under `/dev/shm/` . You can check them with the following command:
```bash
ls -lthr /dev/shm/fast_datasharing* /dev/shm/fastrtps_*
```

- 
If files similar to `fast_datasharing_...` are created and their size is related to the transmitted data (such as image frame size), shared memory transport is likely enabled.
- You can also use the `lsof` command to see which processes are using these shared memory files:
```bash
sudo lsof /dev/shm/fast_datasharing*
```

- 
The output should show your publisher and subscriber processes.
**Disable zero-copy:**

- If you need to disable zero-copy for some reason (for example, debugging or compatibility issues), set the following environment variable, which has the highest priority:
```bash
export ROS_DISABLE_LOANED_MESSAGES=1
```

-
- For detailed instructions on disabling zero-copy, refer to the ROS 2 official documentation: [How to disable loaned messages](https://docs.ros.org/en/humble/How-To-Guides/Configure-ZeroCopy-loaned-messages.html#how-to-disable-loaned-messages)
**Notes:**

- Make sure the XML configuration file ( `shm_fastdds.xml` ) pointed to by `FASTRTPS_DEFAULT_PROFILES_FILE` is correct and actually enables shared memory transport.
- Successful zero-copy depends on both the publisher and subscriber correctly supporting and configuring loaned messages and shared memory transport.
