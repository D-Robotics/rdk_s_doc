---
title: "C/C++ Demo Build Guide"
sidebar_position: 2
description: "How to compile C/C++ demos on the board (cmake/make)"
---

# C/C++ Demo Build Guide

The C/C++ examples under `/app/cdev_demo` on the board are all provided as source code and must be compiled on the board before running. The RDK OS image comes pre-installed with `gcc/g++`, `cmake`, `make`, and OpenCV, so most examples can be compiled directly on the board without cross-compilation.

## Prerequisites

- You have logged in to the development board via SSH (see [Remote Login](../../01_Quick_start/03_install_os_and_setup/remote_login.md)).
- The toolchain pre-installed in the image is available: `cmake`, `make`, `g++` (verify with `which cmake make g++`).

## Compiling Directly on the Board

Taking the ResNet18 classification example as an example (for the path on the board, see [ResNet18 (C/C++)](../03_algorithm_demo/02_classification/01_resnet18.md)):

```bash
cd /app/cdev_demo/bpu/classification_sample/resnet18
mkdir build && cd build
cmake ..
make -j$(nproc)
```

Key output of `cmake ..` (OpenCV auto-detected):

```text
-- Found OpenCV: /usr (found version "4.6.0")
-- Build files have been written to: ...
```

Key output at the end of `make`:

```text
[100%] Linking CXX executable resnet_18
[100%] Built target resnet_18
```

The build output is `build/resnet_18`; run it directly:

```bash
./resnet_18
```

See [ResNet18 (C/C++)](../03_algorithm_demo/02_classification/01_resnet18.md#execution-results) for the actual output.

`cmake ..` automatically detects the OpenCV on the board (measured version 4.6.0) and the BPU-related libraries, with no extra configuration needed.

## Additional Dependencies

Most examples depend on `gflags`, OpenCV, and other libraries that are pre-installed with the image, so no extra installation is needed. If compilation reports that a library is missing, install it as indicated. For example, when gflags is missing:

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Cross-Compilation (Optional)

Compiling on the board is the simplest. If you need to cross-compile on a PC (to save board resources or for batch builds), use the RDK cross toolchain; see [Development Environment and Compilation](../../07_Advanced_development/06_environment_build/01_environment_build.md) in Chapter 5 Advanced Development for details.

## FAQ

- **`make` reports missing header files**: Make sure you run it in the example's `build/` directory and that `cmake ..` succeeded; some examples depend on the parent-level `utils` directory, so do not copy the source elsewhere and compile it standalone.
- **`cmake` cannot find OpenCV**: It is pre-installed in the standard image; if it has been removed, reinstall it with `sudo apt install libopencv-dev`.
- **Slow compilation**: `make -j$(nproc)` already uses all cores; board memory is limited, so cross-compilation is recommended for very large projects.

## Related Documentation

- [ResNet18 (C/C++) Example](../03_algorithm_demo/02_classification/01_resnet18.md)
- [Model Acquisition and Placement](./01_model_files.md)
- [Development Environment and Compilation (Advanced)](../../07_Advanced_development/06_environment_build/01_environment_build.md)
