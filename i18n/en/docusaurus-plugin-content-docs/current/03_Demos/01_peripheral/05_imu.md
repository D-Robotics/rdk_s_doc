---
title: "IMU Application"
sidebar_position: 5
description: "Example of reading IMU sensor data on RDK S600 (BMI08X/ICM42688)"
---

# IMU Application

This example demonstrates reading data from an IMU sensor (accelerometer + gyroscope). Two IMU chips are supported on the board: **BMI08X** (6-axis) and **ICM42688** (6-axis).

:::tip
This example reads data via the Linux IIO subsystem, and is currently shipped with the RDK S600 image; the source code is located at `2-rdk_s600_source_code/source/hobot-io-samples/debian/app/sample_imu/`.
:::

## Environment Preparation

- The development board has RDK OS flashed and booted
- The IMU sensor is connected (via the MCU interface expansion board or the main board I2C/SPI), and the corresponding IIO driver is loaded (you can see the `iio:device*` node under `/sys/bus/iio/devices/`)

## Code Location

On-board path: `/app/sample_imu/`

```
sample_imu/
├── Makefile
├── sample_imu.c       # Main program: parses arguments + interactively reads IMU data
├── imu_manager.c/.h    # IMU manager layer: unified interface wrapper
├── imu_interface.h     # IMU abstract interface
├── bmi08x.c            # BMI08X driver implementation
└── icm42688.c          # ICM42688 driver implementation
```

Source code path: `2-rdk_s600_source_code/source/hobot-io-samples/debian/app/sample_imu/`

## Build and Run

```bash
cd /app/sample_imu
make
./sample_imu
```

After the program starts, it enters an interactive command line; enter commands to read IMU data (see [Runtime Result](#runtime-result)). If the sensor is not specified with `-n`, `bmi08x` is used by default.

## Code Walkthrough

The example adopts a layered design:

1. `imu_interface.h` — defines the IMU abstract interfaces (init/read/close), hiding the differences between chips
2. `bmi08x.c` / `icm42688.c` — the concrete driver implementation for each chip (reads register data via IIO sysfs)
3. `imu_manager.c` — the manager layer, detects and initializes the connected IMU chip under `/sys/bus/iio/devices/`
4. `sample_imu.c` — the main program, parses command-line arguments and handles interactive reading commands (`g`/`l`/`q`/`h`)

## Runtime Result

Run `./sample_imu -h` to view the help information:

```text
root@drobot:/app/sample_imu# ./sample_imu -h
Usage: sample_imu [OPTIONS]
Options:
  -n <imu_name>         Specify IMU name (default: bmi08x)
  -h                    Show this help message
Supported sensors: bmi08x icm42688-gyro icm42688-accel
```

After the program starts, it shows the command menu; enter `g` to read one frame of data:

```text
***************  Command Lists  ***************
 g    -- Get a single frame of imu data
 l    -- Get multiple frames of imu data
 q    -- Quit the program
 h    -- Print this help message
Enter command: g
Data received (Frame 1):
  Accelerometer: [0.012000, -0.003000, 9.801000] m/s²
  Gyroscope:     [0.050000, 0.020000, -0.010000] rad/s
  Timestamp:     00:00:00.000.000
```

Command description:

- `g`: get one frame of IMU data
- `l`: get multiple frames of IMU data; you need to enter the frame count
- `q`: quit the program
- `h`: show the help information

When no IMU sensor is connected, the program fails to detect and exits:

```text
No IMU specified, using default: bmi08x
Using IMU: bmi08x

=== Detected IIO Devices ===
============================

Error: init IMU 'bmi08x' failed !!! Quit Now
```

> The data frame above is an output format example (acceleration in m/s², angular velocity in rad/s); the actual values vary with the sensor pose and range.

## Related Documentation

- [Extended Pin Application](./01_40pin/02_s600/02_gpio.md)
- [C/C++ Demo Programming Guide](../04_demo_support/02_c_cpp_build.md)
