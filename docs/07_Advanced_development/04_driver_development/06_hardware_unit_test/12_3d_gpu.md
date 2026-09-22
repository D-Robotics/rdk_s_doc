---
sidebar_position: 12
title: "3D GPU 性能测试"
description: "3D GPU 性能测试"
---

# 3D GPU 性能测试

## 功能概述

3D GPU 性能测试用于评估 GPU 在不同计算任务和渲染任务下的性能。RDK 平台 GPU 为 ARM Mali-G78AE，针对 GPU 的不同应用场景，常见测试可分为渲染性能测试与计算性能测试两类，本章分别使用 `glmark2` 与 `clpeak` 进行评估。

<DocScope products="RDK S100">

RDK S100 的 GPU 为 Mali-G78AE，配置 2 个计算单元（Compute Unit），工作频率 800 MHz。可通过如下命令查看 GPU 信息：

```bash
cat /sys/class/misc/mali0/device/gpuinfo
```

:::note
`glmark2-es2-wayland` 与 `clpeak` 均未预装到板端，需按下文「环境准备」与「代码位置」获取：板端联网可直接 `apt install` / `git clone`；板端离线时可由主机下载后 adb 推送安装/编译。本章示例命令与结果均以 RDK S100 为参考值。
:::

</DocScope>

<DocScope products="RDK S600">

RDK S600 的 GPU 为 Mali-G78AE，配置 4 个计算单元（Compute Unit），工作频率 800 MHz。可通过如下命令查看 GPU 信息：

```bash
cat /sys/class/misc/mali0/device/gpuinfo
```

:::note
`glmark2-es2-wayland` 与 `clpeak` 均未预装到板端，需按下文「环境准备」与「代码位置」获取：板端联网可直接 `apt install` / `git clone`；板端离线时可由主机下载后 adb 推送安装/编译。S600 实测数值会高于本章给出的参考值。
:::

</DocScope>

## 环境准备

1. 连接 HDMI 显示器并进入桌面环境（渲染性能测试需要图形输出）：
   - 在登录界面点击右下角小齿轮，选择 GNOME 或 Ubuntu (Wayland) 会话。
   - 程序通过 HDMI 输出到显示器，可直观看到 3D GPU 的渲染效果。
2. 安装渲染测试工具 glmark2（计算测试工具 clpeak 见 [代码位置](#代码位置)）。

   `glmark2-es2-wayland` 与 `clpeak` 均未预装到板端，需联网安装或自行获取源码编译。根据板端是否可联网，选择对应方式：

   - **方式一（板端联网，推荐）**：在板端直接安装
     ```bash
     apt update
     apt install glmark2-es2-wayland -y
     ```
   - **方式二（板端离线，主机代理）**：在可联网的主机上下载 deb，再经 adb 推送到板端安装（`glmark2-data`、`libwayland-*` 等依赖已预装于镜像，通常无需额外下载）：
     ```bash
     # 主机（需 adb 可达板端）
     curl -fSL https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/pool/universe/g/glmark2/glmark2-es2-wayland_2023.01+dfsg-1build2_arm64.deb \
       -o glmark2-es2-wayland.deb
     adb push glmark2-es2-wayland.deb /tmp/
     # 板端
     dpkg -i /tmp/glmark2-es2-wayland.deb
     ```

## 代码位置

板端预置了 clpeak 的补丁与编译说明，位于 `/app/chip_base_test/10_gpu_3d_test/clpeak/`：

```text
/app/chip_base_test/10_gpu_3d_test/
└── clpeak/
    ├── Readme.md
    └── 0001-feat-build-add-aarch64-toolchain-for-S100-cross-comp.patch
```

补丁针对 clpeak 1.1.4 版本适配：新增 `cmake/aarch64_toolchain.cmake`（指定板端原生 `aarch64-linux-gnu-gcc` 与 OpenCL 库路径 `/usr/hobot/lib/libOpenCL.so`），并将带宽测试的分配上限限制为 64 MB 以规避运行时问题。板端已预装 `aarch64-linux-gnu-gcc`、`cmake`、OpenCL 头文件与库，可直接在板端原生编译（无需主机交叉编译）。

获取源码（二选一）：

- **方式一（板端联网）**：
  ```bash
  cd /app/chip_base_test/10_gpu_3d_test/
  mkdir -p source && cd source
  git clone --branch 1.1.4 --depth 1 https://github.com/krrishnarraj/clpeak.git
  cd clpeak
  ```
- **方式二（板端离线，主机代理）**：在可联网主机下载 1.1.4 源码包，推送至板端解压
  ```bash
  # 主机
  curl -fSL https://codeload.github.com/krrishnarraj/clpeak/tar.gz/refs/tags/1.1.4 -o clpeak-1.1.4.tar.gz
  adb push clpeak-1.1.4.tar.gz /tmp/
  # 板端
  cd /app/chip_base_test/10_gpu_3d_test/
  mkdir -p source && cd source
  tar xzf /tmp/clpeak-1.1.4.tar.gz
  mv clpeak-1.1.4 clpeak
  cd clpeak
  ```

打补丁并在板端编译运行：

```bash
cp /app/chip_base_test/10_gpu_3d_test/clpeak/0001-feat-build-add-aarch64-toolchain-for-S100-cross-comp.patch ./
patch -p1 < 0001-feat-build-add-aarch64-toolchain-for-S100-cross-comp.patch
mkdir build && cd build
cmake -DCMAKE_TOOLCHAIN_FILE=../cmake/aarch64_toolchain.cmake ..
make
./clpeak
```

## 使用方法

### 测试原理

3D GPU 性能测试主要用于评估 GPU 在不同计算任务和渲染任务下的性能。针对 GPU 的不同应用场景，常见的测试可分为：

- OpenGL ES（渲染性能测试）：使用 glmark2 进行测试，评估 GPU 的图形渲染能力，如几何处理、纹理填充、着色器性能等。
- OpenCL（计算性能测试）：使用 clpeak 进行测试，评估 GPU 在通用计算（GPGPU）任务中的性能，如浮点计算、内存带宽、整数计算等。

### 渲染性能测试方法

1. 按「[环境准备](#环境准备)」安装 `glmark2-es2-wayland` 并进入桌面 Wayland 会话。
2. 连接显示器并进入桌面环境
   - 在登录界面选择点击右下角的小齿轮，选择 GNOME 或 Ubuntu (Wayland)会话
   - 程序通过 HDMI 输出到显示器，可以直观看到 3D GPU 的渲染效果
3. 在桌面终端执行 `glmark2-es2-wayland`

4. 打印如下结果：

```bash
=======================================================
	glmark2 2021.02
=======================================================
	OpenGL Information
	GL_VENDOR:     ARM
	GL_RENDERER:   Mali-G78AE
	GL_VERSION:    OpenGL ES 3.2 v1.r50p0-00eac0.5cc01fb93091eb33e0f41313c0fa19a5
=======================================================
[build] use-vbo=false: FPS: 2490 FrameTime: 0.402 ms
[build] use-vbo=true: FPS: 2403 FrameTime: 0.416 ms
[texture] texture-filter=nearest: FPS: 2882 FrameTime: 0.347 ms
[texture] texture-filter=linear: FPS: 2648 FrameTime: 0.378 ms
[texture] texture-filter=mipmap: FPS: 2704 FrameTime: 0.370 ms
[shading] shading=gouraud: FPS: 2218 FrameTime: 0.451 ms
[shading] shading=blinn-phong-inf: FPS: 2339 FrameTime: 0.428 ms
[shading] shading=phong: FPS: 2211 FrameTime: 0.452 ms
[shading] shading=cel: FPS: 2292 FrameTime: 0.436 ms
[bump] bump-render=high-poly: FPS: 1530 FrameTime: 0.654 ms
[bump] bump-render=normals: FPS: 3052 FrameTime: 0.328 ms
[bump] bump-render=height: FPS: 3011 FrameTime: 0.332 ms
[effect2d] kernel=0,1,0;1,-4,1;0,1,0;: FPS: 2187 FrameTime: 0.457 ms
[effect2d] kernel=1,1,1,1,1;1,1,1,1,1;1,1,1,1,1;: FPS: 826 FrameTime: 1.211 ms
[pulsar] light=false:quads=5:texture=false: FPS: 2928 FrameTime: 0.342 ms
[desktop] blur-radius=5:effect=blur:passes=1:separable=true:windows=4: FPS: 723 FrameTime: 1.383 ms
[desktop] effect=shadow:windows=4: FPS: 1914 FrameTime: 0.522 ms
[buffer] columns=200:interleave=false:update-dispersion=0.9:update-fraction=0.5:update-method=map: FPS: 711 FrameTime: 1.406 ms
[buffer] columns=200:interleave=false:update-dispersion=0.9:update-fraction=0.5:update-method=subdata: FPS: 684 FrameTime: 1.462 ms
[buffer] columns=200:interleave=true:update-dispersion=0.9:update-fraction=0.5:update-method=map: FPS: 947 FrameTime: 1.056 ms
[ideas] speed=duration: FPS: 1532 FrameTime: 0.653 ms
[jellyfish] <default>: FPS: 1360 FrameTime: 0.735 ms
[terrain] <default>: FPS: 128 FrameTime: 7.812 ms
[shadow] <default>: FPS: 1909 FrameTime: 0.524 ms
[refract] <default>: FPS: 328 FrameTime: 3.049 ms
[conditionals] fragment-steps=0:vertex-steps=0: FPS: 3037 FrameTime: 0.329 ms
[conditionals] fragment-steps=5:vertex-steps=0: FPS: 2837 FrameTime: 0.352 ms
[conditionals] fragment-steps=0:vertex-steps=5: FPS: 3015 FrameTime: 0.332 ms
[function] fragment-complexity=low:fragment-steps=5: FPS: 2964 FrameTime: 0.337 ms
[function] fragment-complexity=medium:fragment-steps=5: FPS: 2603 FrameTime: 0.384 ms
[loop] fragment-loop=false:fragment-steps=5:vertex-steps=5: FPS: 2922 FrameTime: 0.342 ms
[loop] fragment-steps=5:fragment-uniform=false:vertex-steps=5: FPS: 2921 FrameTime: 0.342 ms
[loop] fragment-steps=5:fragment-uniform=true:vertex-steps=5: FPS: 2819 FrameTime: 0.355 ms
=======================================================
								  glmark2 Score: 2093
=======================================================
```

:::note
受 GPU 频率/温度、后台负载、合成器调度等因素影响，各场景 FPS 与总分会存在波动，不同次运行、不同镜像版本（如 glmark2 2021.02 与 2023.01）测得数值会有小幅差异，属正常现象。请以实测值为准，本章数据仅作参考。
:::

### 计算性能测试方法

1. 按「[代码位置](#代码位置)」获取源码、打补丁并编译后，执行
	```sh
	cd /app/chip_base_test/10_gpu_3d_test/source/clpeak/build
	./clpeak
	```

2. 打印如下结果：

	```sh
	Platform: ARM Platform
	Device: Mali-G78AE r0p1
		Driver version  : 3.0 (Linux ARM64)
		Compute units   : 2
		Clock frequency : 800 MHz

		Global memory bandwidth (GBPS)
		float   : 10.81
		float2  : 11.32
		float4  : 11.44
		float8  : 9.91
		float16 : 4.91

		Single-precision compute (GFLOPS)
		float   : 100.67
		float2  : 101.59
		float4  : 101.58
		float8  : 101.26
		float16 : 100.54

		Half-precision compute (GFLOPS)
		half   : 101.24
		half2  : 201.40
		half4  : 201.98
		half8  : 200.92
		half16 : 200.11

		No double precision support! Skipped

		Integer compute (GIOPS)
		int   : 25.53
		int2  : 25.53
		int4  : 25.53
		int8  : 25.53
		int16 : 25.54

		Integer compute Fast 24bit (GIOPS)
		int   : 25.52
		int2  : 25.53
		int4  : 25.54
		int8  : 25.53
		int16 : 25.53

		Integer char (8bit) compute (GIOPS)
		char   : 25.53
		char2  : 50.96
		char4  : 101.64
		char8  : 101.65
		char16 : 101.63

		Integer short (16bit) compute (GIOPS)
		short   : 25.53
		short2  : 50.97
		short4  : 50.98
		short8  : 50.99
		short16 : 50.96

		Transfer bandwidth (GBPS)
		enqueueWriteBuffer              : 13.01
		enqueueReadBuffer               : 13.02
		enqueueWriteBuffer non-blocking : 13.06
		enqueueReadBuffer non-blocking  : 13.04
		enqueueMapBuffer(for read)      : 21648.02
			memcpy from mapped ptr        : 13.06
		enqueueUnmap(after write)       : 31956.60
			memcpy to mapped ptr          : 12.89

		Kernel launch latency : 96.12 us
	```

:::note
计算性能各项指标（带宽 GFLOPS/GIOPS、Kernel 启动延迟等）会随 GPU 频率/温度、DDR 负载与运行环境产生波动，不同次运行数值会有小幅差异，属正常现象。请以实测值为准，本章数据仅作参考。
:::

## 运行效果

### 渲染性能指标

测试结果中 FPS（帧率）数值越高，表示 GPU 在该测试场景下表现越好。下面逐行对测试结果进行分析：

#### 一般渲染测试

| 测试项 | FPS | 说明 |
|--------|-----|------|
| **use-vbo=false** | 2490 | 不使用 VBO（顶点缓冲对象）时的性能 |
| **use-vbo=true** | 2403 | 启用 VBO，减少 CPU-GPU 交互，效率略高 |
| **texture-filter=nearest/linear/mipmap** | 2648–2882 | 各种纹理采样方式对性能影响极小，均可高效运行 |
| **shading=gouraud/phong/blinn-phong-inf/cel** | 2211–2339 | 着色器切换带来轻微性能差异 |
| **bump-render=high-poly/normals/height** | 1530–3052 | 法线贴图相关技术对性能表现差异显著 |

#### 复杂计算测试

| 测试项 | FPS | 说明 |
|--------|-----|------|
| **effect2d（卷积核滤波）** | 2187 / 826 | 2D 图像处理中大卷积核计算对性能影响明显 |
| **desktop（窗口模糊/阴影）** | 723 / 1914 | 模糊与阴影效果对 GPU 负载差异较大 |
| **buffer（大规模数据更新）** | 684 / 711 / 947 | 数据更新策略会显著影响性能 |
| **ideas（粒子系统）** | 1532 | 动态粒子动画，表现良好 |
| **jellyfish（水母仿真）** | 1360 | 用于测试 GPU 动画及复杂形变性能 |
| **terrain（地形渲染）** | 128 | 地形复杂度高， FPS 下降 |
| **refract（折射）** | 328 | 折射光线模拟开销较大 |

#### 计算型测试

| 测试项 | FPS | 说明 |
|--------|-----|------|
| **conditionals（分支计算）** | 2837–3037 | GPU 对条件判断的处理效率很高 |
| **function（复杂度递增的片段计算）** | 2603–2964 | 越复杂的 shader 函数带来性能下降 |
| **loop（循环计算）** | 2819–2922 | GPU 循环执行能力稳定强大 |

- 该分数在高分辨率场景下体现了 Mali-G78AE 在现代图形渲染任务中的较强能力，在 VBO、纹理采样、条件逻辑、循环计算等方面均表现出极高的 GPU 浮点运算与并行处理能力。

### 计算性能指标

#### 内存带宽 (GBPS)

```bash
float   : 10.81
float2  : 11.32
float4  : 11.44
float8  : 9.91
float16 : 4.91
```

- 内存带宽随向量大小的增加先提升后降低， float4 具有最高的带宽性能。
- 总体内存带宽表现优异，适合大规模数据吞吐场景。

#### 单精度计算性能 (GFLOPS)

```bash
float   : 100.67
float2  : 101.59
float4  : 101.58
float8  : 101.26
float16 : 100.54
```

- 单精度性能在各向量宽度下保持稳定，说明计算核心具备良好的 SIMD 并行能力。
- 超过 100 GFLOPS，计算能力远优于嵌入式 GPU 平均水平，适合通用图形和计算任务。

#### 半精度计算性能 (GFLOPS)

```bash
half   : 101.24
half2  : 201.40
half4  : 201.98
half8  : 200.92
half16 : 200.11
```

- 半精度计算性能大幅高于单精度，half4 及以上均超过 200 GFLOPS。
- 非常适合模型推理、图像预处理等对吞吐要求高但精度要求低的应用。

#### 整数计算性能 (GIOPS)

```bash
int   : 25.53
int2  : 25.53
int4  : 25.53
int8  : 25.53
int16 : 25.54
```

- 整数计算性能稳定,未随向量宽度扩展。
- 适合处理逻辑/加密/索引类运算。

#### 字节型与短整型整数计算 (GIOPS)

```bash
char16 : 101.63
short16: 50.96
```

- 8-bit（char）整型性能达到峰值 101+ GIOPS，短整型（16-bit）性能接近 51 GIOPS。
- GPU 在处理图像像素等 8-bit 数据时非常高效。

#### 传输带宽 (GBPS)

```bash
enqueueWriteBuffer              : 13.01
enqueueReadBuffer               : 13.02
enqueueWriteBuffer non-blocking : 13.06
enqueueReadBuffer non-blocking  : 13.04
enqueueMapBuffer(for read)      : 21648.02
  memcpy from mapped ptr        : 13.06
enqueueUnmap(after write)       : 31956.60
  memcpy to mapped ptr          : 12.89
```

- GPU 与主内存之间的带宽表现良好，读写均稳定在 13 GBPS。
- 建议充分利用非阻塞传输与 Map/Unmap 机制提高整体性能。

#### Kernel 启动延迟

```bash
Kernel launch latency : 96.12 us
```

- Kernel 启动延迟较高，可能受驱动调度或 OpenCL 运行时影响。
- 对实时计算应用 ( 如计算机视觉 ) 可能造成性能瓶颈，建议减少 Kernel 调用次数。

## 常见问题

1. 执行渲染性能测试时，执行失败
- 问题描述：错误日志如下

```bash
root@ubuntu:~#  glmark2-es2-wayland
Error: main: Could not initialize canvas
```

- 问题分析：当前未处于 Wayland 图形会话（如从 SSH/串口等无显示环境执行），glmark2-es2-wayland 无法连接到 Wayland 合成器，故无法初始化画布。
- 解决办法：接好 HDMI 显示器，在登录界面选择 GNOME 或 Ubuntu (Wayland) 会话登录后，在桌面终端内执行 `glmark2-es2-wayland`。

## 相关文档

- [概述](./01_overview.md)
- [AutoTest 使用方法](./02_auto_test.md)
- [搭建开发环境](../../06_environment_build/01_environment_build.md)
