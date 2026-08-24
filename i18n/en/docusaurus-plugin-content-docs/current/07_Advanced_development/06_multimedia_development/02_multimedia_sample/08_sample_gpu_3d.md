---
sidebar_position: 8
title: "sample_gpu_3d User Guide"
description: "sample_gpu_3d usage guide - board-side example usage guide"
---

# sample_gpu_3d User Guide

## Function Overview

The 3D GPU supports the following standard APIs:
- OpenGLES
- OpenCL
- Vulkan

Sample code is provided for two of these APIs:
1. OpenCL sample
2. OpenGLES sample

Please select the API sample that matches your specific requirement for reference and use.

## OpenCL

### sample_matrix_multiply

#### Function Overview

Function description: `sample_matrix_multiply` uses the 3D GPU and the CPU to run the same matrix operation, and prints the time consumed by both.

#### Code Location and Directory Structure

- Code location: `/app/multimedia_samples/sample_gpu_3d/cl/sample_matrix_multiply`
- Directory structure:

```
└── sample_matrix_multiply
    ├── Makefile
    └── matrix_multiply.c
```

#### Compilation

- Enter the `sample_matrix_multiply` directory and run `make` to compile.
- The output artifact is `matrix_multiply` in the source directory of `sample_matrix_multiply`.

#### Running

#### How to Run the Program

Run the executable program: `./matrix_multiply`

#### Program Parameter Options

None

#### Running Result

Execute the command:
`./matrix_multiply`

Runtime log:
```sh
./matrix_multiply
CPU execution time: 0.997923 seconds
OpenCL execution time: 0.038153 seconds
Matrices are identical!
```

Result description:

The same matrix multiplication operation is executed:
1. CPU time: 0.997923 seconds
2. GPU time: 0.038153 seconds

From the total time consumption, it can be seen that the GPU has higher performance than the CPU in matrix multiplication operations.

## OpenGL ES

### sample_bezier

#### Function Overview

Function description: `sample_bezier` uses the 3D GPU to draw a Bézier curve, and displays it in two ways:
1. On the monitor desktop
2. As a saved image

#### Code Location and Directory Structure

- Code location: `/app/multimedia_samples/sample_gpu_3d/gles/sample_bezier`
- Directory structure:

```
sample_bezier/
├── bezier.c
└── Makefile
```

#### Compilation

- Enter the `sample_bezier` directory and run `make` to compile.
- The output artifact is `bezier` in the source directory of `sample_bezier`.

#### Running

#### How to Run the Program

The following preparations are required before running the program:
1. Connect a monitor to the RDK S100 via the HDMI interface
2. Connect a mouse and keyboard to the RDK S100, and log in to the Ubuntu system through the monitor interface

Run the program:
1. Enter the directory: `cd /app/multimedia_samples/sample_gpu_3d/gles/sample_bezier`
2. Run the program: `./bezier`

Note: if the user running the program is different from the user logged into the graphical interface, run the following commands (the program can be run in a system logged in via `ssh` or the serial port):
1. Taking the `sunrise` user as an example, use the `id -u sunrise` command to check that the user ID of the sunrise user is 1000
2. Export the environment variable `WAYLAND_DISPLAY` with the `export` command. Note that `1000` in the command is the user ID obtained in step 1

```shell
root@ubuntu:/app/multimedia_samples/sample_gpu_3d/gles/sample_bezier# id -u sunrise
1000

root@ubuntu:/app/multimedia_samples/sample_gpu_3d/gles/sample_bezier# export WAYLAND_DISPLAY=/run/user/1000/wayland-0
```

#### Program Parameter Options

No parameter options

#### Running Result

Runtime log: none

Result description:
1. A window will be displayed on the monitor desktop: the window displays a red Bézier curve
2. The content displayed in the window is also saved as a file: the following bmp image file will be generated in the current directory: `bezier.bmp`

## FAQ

### No Display Environment, Cannot Preview

**Symptom**: In a headless environment (no HDMI monitor), the OpenGL ES sample cannot display a window or reports an error.

**Cause**: OpenGL ES rendering requires a display device; a headless environment has no available display surface.

**Solution**: Connect an HDMI monitor to run it, or use the OpenCL sample (pure computation, no display required); you can also use a virtual display such as xvfb for verification.

### OpenCL / OpenGL ES Selection

**Symptom**: Not sure about the differences between the two samples.

**Cause**: OpenCL is for general-purpose computing (no window), while OpenGL ES is for graphics rendering (requires a display).

**Solution**: Use OpenCL for image/data processing tasks; use OpenGL ES for tasks that need to render to the screen/window.

## Related Documentation

- [Sample Code Introduction](./01_overview.md)
- [Multimedia API Reference](../01_multimedia_api/01_hbn_api.md)