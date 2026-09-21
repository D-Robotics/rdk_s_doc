---
title: "图形处理 - GPU"
sidebar_position: 14
description: "RDK S100/S600 3D GPU（Mali-G78AE）图形与通用计算：EGL / OpenGL ES / OpenCL / Vulkan 标准 API、休眠唤醒接口、调试方法与应用场景"
---

# 图形处理 - GPU

## 模块描述

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK S100">

RDK S100 的 GPU 硬件型号为 Mali-G78AE，提供基于开放标准的图形加速平台，支持 2D 图形、3D 图形和 GPGPU（General Purpose computing on GPU）通用计算。GPU 从处理器上运行的应用程序获取图形指令，处理完成后将结果放回系统内存。

</DocScope>
<DocScope products="RDK S600">

RDK S600 的 GPU 硬件型号为 Mali-G78AE，提供基于开放标准的图形加速平台，支持 2D 图形、3D 图形和 GPGPU（General Purpose computing on GPU）通用计算。GPU 从处理器上运行的应用程序获取图形指令，处理完成后将结果放回系统内存。

</DocScope>

### 硬件特性

Mali-G78AE GPU 的硬件特性如下：

- 可编程架构。
- 支持 shader-based 和 fixed-function 两种图形 API。
- 支持抗锯齿功能。
- 3D 图形渲染场景下能够做到高内存带宽和低功耗。
- 支持压缩纹理格式。
- 支持 Tile-based rendering。
- 拥有服务于通用计算场景（GPGPU）应用程序的能效核心。
- 高延迟容忍度。
- 支持可配置的电源管理，为每个应用程序实现最佳的电源和性能组合。
- 支持系统内存和资源共享的一致性感知操作。
- 支持 8 位、10 位和 16 位 YUV 输入和输出格式。
- 多达 8 个用于外部内存访问的 128 位 Arm AMBA 5 ACE-Lite 内存接口。

### 软件框架

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/GPU/gpu_framework.png" alt="GPU 软件框架示意图" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- **硬件层**：GPU Core 为 Mali-G78AE，完成 3D 图像处理加速，渲染的输出结果可以存储到 DDR 中
- **内核驱动层**：S100/S600 中 GPU 的驱动均没有接入 DRM，而是通过字符设备驱动的 ioctl 接口向上提供接口，显示通路由 hobot-drm 显示驱动独立完成
- **用户驱动层**：通过封装 ioctl 接口，实现 GPU 接口层和驱动层的交互
- **Framework 层**：包含 4 个层次
  - **GPU 接口层**：包括四种标准 API：EGL、OpenGL ES、Vulkan 和 OpenCL，详细说明将在后续内容中提供
  - **服务器协议层**：显示服务器协议为 Wayland，桌面场景的合成器为 Mutter
  - **桌面环境**：GnomeShell 是现代化的桌面环境，基于 Mutter 实现，负责用户交互界面
  - **图形工具包**：GTK 为开发者提供图形控件和界面构建工具
- **应用层**：应用层的实现有两种情况：
  - **情况 1**：有桌面环境的情况，应用层可以基于各种图形库开发复杂的游戏和 UI 界面
  - **情况 2**：没有桌面环境的情况，应用层直接调用 GPU 接口，通过 DRM 和 GBM 实现 GPU 渲染图像的显示

### 基础规格

<DocScope products="RDK S100">

- `clpeak` 单精度浮点运算约 100 GFLOPS
- `glmark2-es2-drm` 性能分数约 723 分

</DocScope>
<DocScope products="RDK S600">

- `clpeak` 单精度浮点运算约 200 GFLOPS
- `glmark2-es2-drm` 性能分数约 1277 分

</DocScope>

## 参考示例

### 板端示例 sample_gpu_3d

GPU 开发示例（OpenCL 矩阵乘法、OpenGL ES 贝塞尔曲线渲染）的代码位置、编译运行方法详见 [sample_gpu_3d 使用说明](../02_multimedia_sample/08_sample_gpu_3d.md)。

### OpenGL ES 与 hbmem 交互

可以使用 `eglCreateImage` 接口基于 hbmem 的内存 fd 创建 EGL Image，然后通过 `glEGLImageTargetTexture2DOES` 接口创建 OpenGL ES 纹理。参考代码如下：

```c
int32_t ret = 0;
int64_t hb_alloc_flags = HB_MEM_USAGE_CPU_WRITE_OFTEN | HB_MEM_USAGE_CACHED;
hb_mem_common_buf_t imported_buf;

image_in_size = imported_image[file_index].width * imported_image[file_index].height * 3 / 2;
ret = hb_mem_module_open();
if (ret != 0) {
        throw std::runtime_error("Open hbmem module failed");
}
// 创建hbmem内存
ret = hb_mem_alloc_com_buf(image_in_size, hb_alloc_flags, &imported_buf);
if (ret != 0) {
        throw std::bad_alloc();
}
......
EGLAttrib image_attribs[] = {
        EGL_WIDTH,                      imported_buf.width,
        EGL_HEIGHT,                     imported_buf.height,
        EGL_LINUX_DRM_FOURCC_EXT,       DRM_FORMAT_NV12,
        EGL_GL_COLORSPACE_KHR,          EGL_GL_COLORSPACE_DEFAULT_EXT,
        EGL_DMA_BUF_PLANE0_FD_EXT,      imported_buf.fd[0], // hbmem的内存fd
        EGL_DMA_BUF_PLANE0_OFFSET_EXT,  0,
        EGL_DMA_BUF_PLANE0_PITCH_EXT,   imported_buf.width,
        EGL_DMA_BUF_PLANE1_FD_EXT,      imported_buf.fd[0], // hbmem的内存fd
        EGL_DMA_BUF_PLANE1_OFFSET_EXT,  imported_buf.width * imported_buf.height,
        EGL_DMA_BUF_PLANE1_PITCH_EXT,   imported_buf.width,
        EGL_NONE
};

imported_image = eglCreateImage(egl_display,
                                EGL_NO_CONTEXT,
                                EGL_LINUX_DMA_BUF_EXT,
                                NULL,
                                image_attribs);
if (imported_image == EGL_NO_IMAGE) {
        eglCheckError();
        throw std::runtime_error("create egl image failed");
}

glGenTextures(1, &imported_texture);
glBindTexture(GL_TEXTURE_EXTERNAL_OES, imported_texture);
glTexParameteri(GL_TEXTURE_EXTERNAL_OES, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_EXTERNAL_OES, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_EXTERNAL_OES, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_EXTERNAL_OES, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glEGLImageTargetTexture2DOES(GL_TEXTURE_EXTERNAL_OES, imported_image);
......
```

hbmem 内存分配接口的详细说明见 [hbmem 使用指南](02_hbmem/01_hbmem.md)。

### EGL 与 drm 解绑

通过环境变量 `EGL_GBM_DISABLE_DRM` 控制：

```c
// 默认配置，gbm与drm是绑定的
setenv("EGL_GBM_DISABLE_DRM", "0", 1);

// gbm与drm解绑，gbm_create_device函数传入任意数值即可成功创建gbm_device
setenv("EGL_GBM_DISABLE_DRM", "1", 1);
gbm_device = gbm_create_device(-1);
```

## API 参考

### 标准 API

GPU 支持以下 4 种标准 API，详细介绍请参考 Khronos 官网：

| 标准 | 支持版本 | 官网链接 |
| --- | --- | --- |
| EGL | 1.5, 1.4, 1.3, 1.2, 1.1, 1.0 | [registry.khronos.org/EGL](https://registry.khronos.org/EGL/) |
| OpenGL ES | 3.2, 3.1, 3.0, 2.0 | [registry.khronos.org/OpenGL](https://registry.khronos.org/OpenGL/index_es.php) |
| OpenCL | 3.0, 2.2, 2.1, 2.0, 1.1, 1.0 | [registry.khronos.org/OpenCL](https://registry.khronos.org/OpenCL/) |
| Vulkan | 1.3, 1.2, 1.1, 1.0 | [registry.khronos.org/vulkan](https://registry.khronos.org/vulkan/) |

### 头文件说明

编写 OpenGL ES、OpenCL 或 Vulkan 应用程序的过程中会使用到相关标准协议的头文件，这些头文件所在的文件夹以及文件夹简述如下表所示：

| 标准 | 头文件所在的文件夹 | 文件夹简述 |
| --- | --- | --- |
| EGL | `EGL` | 包含 EGL 所有版本的头文件 |
| OpenGL ES | `GLES2` | 包含 OpenGL ES 2.x 相关的头文件，且包含 OpenGL ES 扩展相关的头文件 |
| OpenGL ES | `GLES3` | 包含 OpenGL ES 3.x 相关的头文件 |
| OpenCL | `CL` | 包含 OpenCL C 风格的头文件 |
| OpenCL | `CL_HPP` | 包含 OpenCL CPP 风格的头文件 |
| GBM | `gbm` | 包含 GBM 的头文件 |
| Vulkan | `vulkan` | 包含 Vulkan 的头文件 |

休眠唤醒的 load/unload API 头文件存放路径：`{sdk_dir}/hbre/gpu/inc/loader`。

### 动态库说明

编写 OpenGL ES、OpenCL 或 Vulkan 应用程序的过程中会使用到相关标准的动态库，相关动态库的名称如下表所示：

| 标准 | 动态库名称 | 动态库简述 |
| --- | --- | --- |
| EGL | `libEGL.so` | EGL 动态库 |
| OpenGL ES | `libGLESv2.so` | OpenGL ES 2.x 和 OpenGL ES 3.x 动态库 |
| OpenCL | `libOpenCL.so` | OpenCL 动态库 |
| GBM | `libgbm.so` | GBM 动态库 |
| Vulkan | `libvulkan.so` | Vulkan ICD Loader 动态库 |

### 休眠唤醒 API

GPU 支持休眠唤醒，在休眠前和唤醒后有如下要求：

- 在休眠前，需要释放所有 GPU 资源（比如 GBM device、EGL context、OpenCL mem 等）。
- 完成资源释放后，调用对应模块的 unload API。
- 在唤醒后调用 load API。

各模块的 load/unload API 如下所示（调用正常时，接口返回 `0`；调用异常时，接口返回 `-1`）：

| 标准 | load/unload API |
| --- | --- |
| GBM | `int hb_load_gbm(void);` / `int hb_unload_gbm(void);` |
| EGL | `int hb_load_egl(void);` / `int hb_unload_egl(void);` |
| OpenGL ES | `int hb_load_gles(void);` / `int hb_unload_gles(void);` |
| OpenCL | `int hb_load_cl(void);` / `int hb_unload_cl(void);` |

:::info 注意

- 调用 unload API 期间不能调用任何相关模块的 API。
- 调用 unload API 后不能调用任何相关模块的 API。
- 调用 unload API 后必须成功调用对应的 load API 才能调用相关模块的 API。
- 调用 load API 期间不能调用相关模块的 API。
:::

### 标准说明及功能简介

#### EGL

EGL 是 Khronos 渲染 API（如 OpenGL ES）与底层本地平台窗口系统之间的接口。它能够处理图形上下文管理、表面缓冲区绑定和渲染同步，辅助实现高性能、加速的 3D 渲染。

##### 扩展列表

以下是支持的 EGL 1.5 扩展功能（扩展详情请查阅 [EGL Registry](https://registry.khronos.org/EGL/)）：

- `EGL_EXT_client_extensions`
- `EGL_EXT_create_context_robustness`
- `EGL_EXT_image_dma_buf_import`
- `EGL_EXT_image_dma_buf_import_modifiers`
- `EGL_EXT_image_gl_colorspace`
- `EGL_EXT_pixel_format_float`
- `EGL_KHR_platform_gbm`
- `EGL_EXT_yuv_surface`
- `EGL_IMG_context_priority`
- `EGL_KHR_client_get_all_proc_addresses`
- `EGL_KHR_create_context`
- `EGL_KHR_fence_sync`
- `EGL_KHR_get_all_proc_addresses`
- `EGL_KHR_gl_colorspace`
- `EGL_KHR_gl_texture_2D_image`
- `EGL_KHR_gl_texture_3D_image`
- `EGL_KHR_gl_texture_cubemap_image`
- `EGL_KHR_gl_renderbuffer_image`
- `EGL_KHR_image`
- `EGL_KHR_image_base`
- `EGL_KHR_no_config_context`
- `EGL_KHR_partial_update`

##### 调试方法

借助 EGL 提供的调试功能，应用开发者可以根据调试功能的打印信息，结合 EGL spec，找出应用程序存在的错误。

每调用一次 EGL 的接口，相应的错误状态都会被记录下来，`eglGetError` 可获取该错误状态（也可通过 EGL 接口的返回值判断当前状态）。EGL 的所有版本都支持 `eglGetError`。使用示例如下：

```c
void eglCheckError_(const char *file, int line);
#define eglCheckError() eglCheckError_(__FILE__, __LINE__)

void eglCheckError_(const char *file, int line)
{
        EGLint errorCode;
        while ((errorCode = eglGetError()) != EGL_SUCCESS)
        {
                std::string error;
                switch (errorCode)
                {
                        case EGL_NOT_INITIALIZED:          error = "EGL_NOT_INITIALIZED"; break;
                        case EGL_BAD_ACCESS:               error = "EGL_BAD_ACCESS"; break;
                        case EGL_BAD_ALLOC:                error = "EGL_BAD_ALLOC"; break;
                        case EGL_BAD_ATTRIBUTE:            error = "EGL_BAD_ATTRIBUTE"; break;
                        /* ……其余错误码分支同理，详见 EGL spec */
                }
                std::cout << error << " | " << file << " (" << line << ")" << std::endl;
        }
}
```

#### OpenGL ES

OpenGL ES 是用于编写 3D 图形应用程序的标准 API。它分为两种版本：

- OpenGL ES 1.1（不支持，此处仅作为 OpenGL ES 的版本迭代说明）
- OpenGL ES 2.0、OpenGL ES 3.0、OpenGL ES 3.1 和 OpenGL ES 3.2

两者最大的区别在于渲染管线是否可编程。下面将分小节简述各版本的特点。

##### OpenGL ES 1.1

OpenGL ES 1.1 是 OpenGL 1.5 标准的一个子集，它定义了在图形硬件上使用的渲染管线。几何变换、照明和着色都是通过选择各种预定义算法指定。

##### OpenGL ES 2.0

OpenGL ES 2.0 是 OpenGL 2.0 标准的一个子集，它定义了一个用于可编程图形硬件的可编程渲染管线。渲染应用程序需要指定两种类型的信息：

- 使用顶点着色器进行几何处理。
- 使用片段着色器进行像素处理。

这两种类型的着色器均由 OpenGL ES 着色语言编写。为了简化 API，OpenGL ES 2.0 取消了 OpenGL ES 1.1 中的固定渲染管线，因此，OpenGL ES 2.0 不兼容 OpenGL ES 1.1。

###### 扩展列表

以下是支持的 OpenGL ES 2.0 扩展功能（扩展详情请查阅 [OpenGL ES Registry](https://registry.khronos.org/OpenGL/index_es.php)）：

- `GL_ARM_mali_program_binary`
- `GL_ARM_mali_shader_binary`
- `GL_ARM_rgba8`
- `GL_ARM_shader_framebuffer_fetch`
- `GL_ARM_shader_framebuffer_fetch_depth_stencil`
- `GL_EXT_blend_minmax`
- `GL_EXT_color_buffer_half_float`
- `GL_EXT_clip_control`
- `GL_EXT_discard_framebuffer`
- `GL_EXT_disjoint_timer_query`
- `GL_EXT_draw_elements_base_vertex`
- `GL_EXT_fragment_shading_rate`
- `GL_EXT_fragment_shading_rate_attachment`
- `GL_EXT_fragment_shading_rate_primitive`
- `GL_EXT_multisampled_render_to_texture`
- `GL_EXT_multisampled_render_to_texture2`
- `GL_EXT_occlusion_query_boolean`
- `GL_EXT_polygon_offset_clamp`
- `GL_EXT_read_format_bgra`
- `GL_EXT_robustness`
- `GL_EXT_shader_framebuffer_fetch`
- `GL_EXT_shadow_samplers`
- `GL_EXT_sRGB`
- `GL_EXT_sRGB_write_control`
- `GL_EXT_texture_border_clamp`
- `GL_EXT_texture_filter_anisotropic`
- `GL_EXT_texture_format_BGRA8888`
- `GL_EXT_texture_rg`
- `GL_EXT_texture_storage`
- `GL_EXT_texture_type_2_10_10_10_REV`
- `GL_EXT_unpack_subimage`
- `GL_EXT_EGL_image_array`
- `GL_KHR_blend_equation_advanced`
- `GL_KHR_blend_equation_advanced_coherent`
- `GL_KHR_debug`
- `GL_KHR_robust_buffer_access_behavior`
- `GL_KHR_texture_compression_astc_hdr`
- `GL_KHR_texture_compression_astc_ldr`
- `GL_KHR_texture_compression_astc_sliced_3d`
- `GL_OES_compressed_ETC1_RGB8_texture`
- `GL_OES_compressed_paletted_texture`
- `GL_OES_depth_texture`
- `GL_OES_depth_texture_cube_map`
- `GL_OES_depth24`
- `GL_OES_draw_elements_base_vertex`
- `GL_OES_element_index_uint`
- `GL_OES_fbo_render_mipmap`
- `GL_OES_get_program_binary`
- `GL_OES_mapbuffer`
- `GL_OES_packed_depth_stencil`
- `GL_OES_required_internalformat`
- `GL_OES_rgb8_rgba8`
- `GL_OES_standard_derivatives`
- `GL_OES_surfaceless_context`
- `GL_OES_texture_3D`
- `GL_OES_texture_border_clamp`
- `GL_OES_texture_compression_astc`
- `GL_OES_texture_npot`
- `GL_OES_vertex_array_object`
- `GL_OES_vertex_half_float`
- `GL_OES_EGL_image`
- `GL_OES_EGL_image_external`
- `GL_OES_EGL_sync`

##### OpenGL ES 3.0

OpenGL ES 3.0 标准向后兼容 OpenGL ES 2.0，引入了 OpenGL ES 着色语言 3.0。它包括以下功能：

- 更多的纹理格式。
- 3D 纹理和 2D 纹理数组。
- 变换反馈。
- 像素缓冲。
- 多渲染目标。
- 遮挡查询。
- 显示同步。
- 采样器对象。
- Uniform 缓冲。

###### 扩展列表

以下是支持的 OpenGL ES 3.0 扩展功能：

- `GL_ARM_texture_unnormalized_coordinates`
- `GL_EXT_color_buffer_float`
- `GL_EXT_copy_image`
- `GL_EXT_draw_buffers_indexed`
- `GL_EXT_float_blend`
- `GL_EXT_protected_textures`
- `GL_EXT_shader_pixel_local_storage`
- `GL_EXT_texture_sRGB_R8`
- `GL_EXT_texture_sRGB_RG8`
- `GL_EXT_YUV_target`
- `GL_OES_draw_buffers_indexed`
- `GL_OES_sample_shading`
- `GL_OES_sample_variables`
- `GL_OES_shader_multisample_interpolation`
- `GL_OES_texture_float_linear`
- `GL_OES_EGL_image_external_essl3`
- `GL_OVR_multiview`
- `GL_OVR_multiview2`
- `GL_OVR_multiview_multisampled_render_to_texture`

##### OpenGL ES 3.1

OpenGL ES 3.1 标准向后兼容 OpenGL ES 2.0 和 OpenGL ES 3.0。OpenGL ES 3.1 引入了 OpenGL ES 着色语言 3.1，包括以下新特性：

- 计算管线。
- 间接渲染。
- 着色器缓冲。
- 多采样纹理。

###### 扩展列表

以下是支持的 OpenGL ES 3.1 扩展功能：

- `GL_EXT_buffer_storage`
- `GL_EXT_clear_texture`
- `GL_EXT_external_buffer`
- `GL_EXT_geometry_shader`
- `GL_EXT_gpu_shader5`
- `GL_EXT_primitive_bounding_box`
- `GL_EXT_shader_io_blocks`
- `GL_EXT_tessellation_shader`
- `GL_EXT_texture_buffer`
- `GL_EXT_texture_cube_map_array`
- `GL_KHR_robustness`
- `GL_OES_copy_image`
- `GL_OES_geometry_shader`
- `GL_OES_gpu_shader5`
- `GL_OES_primitive_bounding_box`
- `GL_OES_shader_image_atomic`
- `GL_OES_shader_io_blocks`
- `GL_OES_tessellation_shader`
- `GL_OES_texture_buffer`
- `GL_OES_texture_cube_map_array`
- `GL_OES_texture_stencil8`
- `GL_OES_texture_storage_multisample_2d_array`

##### OpenGL ES 3.2

OpenGL ES 3.2 标准向后兼容 OpenGL ES 2.0、OpenGL ES 3.0 和 OpenGL ES 3.1。OpenGL ES 3.2 引入了 OpenGL ES 着色语言 3.2，包括以下新特性：

- 浮点渲染目标。
- Per-sample 着色。
- Per-attachment 混色。
- 几何着色器。
- 细分着色器。

###### 扩展列表

以下是支持的 OpenGL ES 3.2 扩展功能：

- `GL_ARM_shader_core_properties`
- `GL_EXT_shader_non_constant_global_initializers`

##### 调试方法

每调用一次 OpenGL ES 的接口，相应的错误状态都会被记录下来，`glGetError` 可获取该错误状态。使用示例如下：

```c
GLenum glCheckError_(const char *file, int line);
#define glCheckError() glCheckError_(__FILE__, __LINE__)

GLenum glCheckError_(const char *file, int line)
{
    GLenum errorCode;
    while ((errorCode = glGetError()) != GL_NO_ERROR)
    {
        std::string error;
        switch (errorCode)
        {
            case GL_CONTEXT_LOST:                  error = "CONTEXT_LOST"; break;
            case GL_INVALID_ENUM:                  error = "INVALID_ENUM"; break;
            case GL_INVALID_VALUE:                 error = "INVALID_VALUE"; break;
            case GL_INVALID_OPERATION:             error = "INVALID_OPERATION"; break;
            case GL_STACK_OVERFLOW:                error = "STACK_OVERFLOW"; break;
            case GL_STACK_UNDERFLOW:               error = "STACK_UNDERFLOW"; break;
            case GL_OUT_OF_MEMORY:                 error = "OUT_OF_MEMORY"; break;
            case GL_INVALID_FRAMEBUFFER_OPERATION: error = "INVALID_FRAMEBUFFER_OPERATION"; break;
        }
        std::cout << error << " | " << file << " (" << line << ")" << std::endl;
    }
    return errorCode;
}
```

OpenGL ES 3.2 新增了 debug output 功能，借助该功能可更方便地进行 OpenGL ES 应用的开发，用户可自定义回调函数进行调试输出。当错误出现时，回调函数会被调用，打印相关信息。使用示例如下：

```c
/* 这是回调函数 */
void glDebugContexOutput(GLenum source,
                         GLenum type,
                         unsigned int id,
                         GLenum severity,
                         GLsizei length,
                         const char *glmessage,
                         const void *user_param)
{
        std::cout << "gles debug message:" << glmessage << std::endl;
}

glGetIntegerv(GL_CONTEXT_FLAGS, &flags);
if (flags & GL_CONTEXT_FLAG_DEBUG_BIT)
{
        glEnable(GL_DEBUG_OUTPUT);               // 打开debug output功能
        glEnable(GL_DEBUG_OUTPUT_SYNCHRONOUS);
        glDebugMessageCallback(glDebugContexOutput, nullptr); // 设置回调函数
        glDebugMessageControl(GL_DONT_CARE, GL_DONT_CARE, GL_DONT_CARE, 0, nullptr, GL_TRUE);
} else {
        std::cout << "Failed to set gles debug context!" << std::endl;
        return -INIT_FAILED;
}
```

#### OpenCL

OpenCL 是并行计算标准之一，该标准可应用在超级计算机、云服务器、个人计算机、移动设备和嵌入式平台中，使得应用程序可以并行处理任务和数据集。

##### 扩展列表

以下是支持的 OpenCL 扩展（扩展详情请查阅 [OpenCL Registry](https://registry.khronos.org/OpenCL/)）：

- `cl_arm_core_id`
- `cl_arm_controlled_kernel_termination`
- `cl_arm_import_memory`
- `cl_arm_import_memory_dma_buf`
- `cl_arm_import_memory_host`
- `cl_arm_import_memory_protected`
- `cl_arm_integer_dot_product_int8`
- `cl_arm_integer_dot_product_accumulate_int8`
- `cl_arm_integer_dot_product_accumulate_int16`
- `cl_arm_integer_dot_product_accumulate_saturate_int8`
- `cl_arm_job_slot_selection`
- `cl_arm_non_uniform_work_group_size`
- `cl_arm_printf`
- `cl_arm_protected_memory_allocation`
- `cl_arm_scheduling_controls`
- `cl_ext_cxx_for_opencl`
- `cl_ext_yuv_images`
- `cl_ext_image_drm_format_modifier`
- `cl_ext_image_from_buffer`
- `cl_ext_image_requirements_info`
- `cl_ext_image_tiling_control`
- `cl_khr_3d_image_writes`
- `cl_khr_byte_addressable_store`
- `cl_khr_create_command_queue`
- `cl_khr_command_buffer_mutable_dispatch`
- `cl_khr_depth_images`
- `cl_khr_device_uuid`
- `cl_khr_egl_image`
- `cl_khr_extended_bit_ops`
- `cl_khr_extended_versioning`
- `cl_khr_external_memory`
- `cl_khr_external_memory_dma_buf`
- `cl_khr_fp16`
- `cl_khr_global_int32_base_atomics`
- `cl_khr_global_int32_extended_atomics`
- `cl_khr_icd`
- `cl_khr_il_program`
- `cl_khr_image2d_from_buffer`
- `cl_khr_int64_base_atomics`
- `cl_khr_int64_extended_atomics`
- `cl_khr_integer_dot_product`
- `cl_khr_local_int32_base_atomics`
- `cl_khr_local_int32_extended_atomics`
- `cl_khr_priority_hints`
- `cl_khr_semaphore`
- `cl_khr_subgroups`
- `cl_khr_subgroup_extended_types`
- `cl_khr_suggested_local_work_size`

##### 调试方法

可通过 OpenCL API 接口返回值或者抛出异常对应用程序进行调试。

调用 OpenCL 的接口后，接口会返回错误码，可根据错误码判断运行状态，以下以 C 风格为例（CPP 风格上可能存在差异，但原理是相同的）：

```c
// 形式1，通过传入指针返回错误码
cl_command_queue queue = clCreateCommandQueue(context, device_id, 0, &err);
if (err != CL_SUCCESS)
{
        print_error(errCodeResult, msg);
        return retValue;
}
// 形式2，通过返回值返回错误码
err = clEnqueueNDRangeKernel(queue, kernel[1], 2, NULL, threads, NULL, 0, NULL, NULL);
if (err != CL_SUCCESS)
{
        print_error(errCodeResult, msg);
        return retValue;
}
```

使用 C++ 风格 API 时，可通过 `CL_HPP_ENABLE_EXCEPTIONS` 开启抛出异常功能：

```c
// 开启抛出异常功能
#define CL_HPP_ENABLE_EXCEPTIONS
#include <CL/opencl.hpp>

try {
        // OpenCL 业务逻辑
}
// 捕捉异常
catch (const cl::Error& e) {
        std::cout << e.what() << ": Error code " << e.err() << std::endl;
}
```

#### Vulkan

Vulkan 是 3D 图形和计算的开放标准之一，它有 3 个特点：底层、低开销、跨平台。Vulkan 旨在解决 OpenGL 的缺点，其「底层」特点意味着允许开发人员获得更多的 GPU 控制权，多线程渲染是它的重要特性之一。

:::info 提示

Vulkan 应用程序可通过两种方式实现与显示的交互：一种是借助 WSI Layer 实现（当前未集成），另一种是通过自主实现的显示交互逻辑完成。
:::

##### 扩展列表

以下是支持的 Vulkan 扩展功能（扩展详情请查阅 [Vulkan Registry](https://registry.khronos.org/vulkan/)）：

- `VK_ARM_rasterization_order_attachment_access`
- `VK_EXT_rasterization_order_attachment_access`
- `VK_ARM_scheduling_controls`
- `VK_ARM_shader_core_builtins`
- `VK_ARM_shader_core_properties`
- `VK_EXT_border_color_swizzle`
- `VK_EXT_calibrated_timestamps`
- `VK_EXT_conservative_rasterization`
- `VK_EXT_custom_border_color`
- `VK_EXT_debug_utils`
- `VK_EXT_descriptor_indexing`
- `VK_EXT_device_fault`
- `VK_EXT_device_memory_report`
- `VK_EXT_depth_clamp_zero_one`
- `VK_EXT_depth_clip_enable`
- `VK_EXT_device_address_binding_report`
- `VK_EXT_extended_dynamic_state`
- `VK_EXT_extended_dynamic_state2`
- `VK_EXT_external_memory_acquire_unmodified`
- `VK_EXT_external_memory_dma_buf`
- `VK_EXT_fragment_density_map`
- `VK_EXT_fragment_density_map2`
- `VK_EXT_frame_boundary`
- `VK_EXT_global_priority`
- `VK_EXT_global_priority_query`
- `VK_EXT_host_query_reset`
- `VK_EXT_image_2d_view_of_3d`
- `VK_EXT_image_compression_control`
- `VK_EXT_image_robustness`
- `VK_EXT_index_type_uint8`
- `VK_EXT_inline_uniform_block`
- `VK_EXT_legacy_dithering`
- `VK_EXT_line_rasterization`
- `VK_EXT_load_store_op_none`
- `VK_EXT_multisampled_render_to_single_sampled`
- `VK_EXT_pipeline_creation_cache_control`
- `VK_EXT_pipeline_creation_feedback`
- `VK_EXT_pipeline_protected_access`
- `VK_EXT_pipeline_robustness`
- `VK_EXT_primitive_topology_list_restart`
- `VK_EXT_primitives_generated_query`
- `VK_EXT_private_data`
- `VK_EXT_sampler_filter_minmax`
- `VK_EXT_scalar_block_layout`
- `VK_EXT_separate_stencil_usage`
- `VK_EXT_shader_demote_to_helper_invocation`
- `VK_EXT_shader_image_atomic_int64`
- `VK_EXT_shader_subgroup_ballot`
- `VK_EXT_shader_subgroup_vote`
- `VK_EXT_shader_tile_image`
- `VK_EXT_subgroup_size_control`
- `VK_EXT_subpass_merge_feedback`
- `VK_EXT_texel_buffer_alignment`
- `VK_EXT_texture_compression_astc_hdr`
- `VK_EXT_transform_feedback`
- `VK_EXT_4444_formats`
- `VK_KHR_8bit_storage`
- `VK_KHR_16bit_storage`
- `VK_KHR_bind_memory2`
- `VK_KHR_cooperative_matrix`
- `VK_KHR_copy_commands2`
- `VK_KHR_create_renderpass2`
- `VK_KHR_dedicated_allocation`
- `VK_KHR_deferred_host_operations`
- `VK_KHR_depth_stencil_resolve`
- `VK_KHR_descriptor_update_template`
- `VK_KHR_device_group`
- `VK_KHR_device_group_creation`
- `VK_KHR_driver_properties`
- `VK_KHR_dynamic_rendering`
- `VK_KHR_external_fence`
- `VK_KHR_external_fence_capabilities`
- `VK_KHR_external_fence_fd`
- `VK_KHR_external_memory`
- `VK_KHR_external_memory_capabilities`
- `VK_KHR_external_memory_fd`
- `VK_KHR_external_semaphore`
- `VK_KHR_external_semaphore_capabilities`
- `VK_KHR_external_semaphore_fd`
- `VK_KHR_format_feature_flags2`
- `VK_KHR_fragment_shading_rate`
- `VK_KHR_get_memory_requirements2`
- `VK_KHR_get_physical_device_properties2`
- `VK_KHR_get_surface_capabilities2`
- `VK_KHR_global_priority`
- `VK_KHR_image_format_list`
- `VK_KHR_maintenance1`
- `VK_KHR_maintenance2`
- `VK_KHR_maintenance3`
- `VK_KHR_maintenance4`
- `VK_KHR_maintenance5`
- `VK_KHR_map_memory2`
- `VK_KHR_multiview`
- `VK_KHR_pipeline_library`
- `VK_KHR_relaxed_block_layout`
- `VK_KHR_sampler_mirror_clamp_to_edge`
- `VK_KHR_sampler_ycbcr_conversion`
- `VK_KHR_shader_atomic_int64`
- `VK_KHR_shader_draw_parameters`
- `VK_KHR_shader_float16_int8`
- `VK_KHR_shader_float_controls`
- `VK_KHR_shader_integer_dot_product`
- `VK_KHR_shader_terminate_invocation`
- `VK_KHR_spirv_1_4`
- `VK_KHR_storage_buffer_storage_class`
- `VK_KHR_uniform_buffer_standard_layout`
- `VK_KHR_variable_pointers`
- `VK_KHR_vulkan_memory_model`
- `VK_KHR_zero_initialize_workgroup_memory`

##### 调试方法

Vulkan 驱动程序内部仅完成最小的错误检查，应用程序应该肩负起正确使用 API 的责任。任何 Vulkan API 的使用错误都可能导致崩溃，如果不借助其他的工具，应用开发者很难找到错误位置。

`VK_LAYER_KHRONOS_validation` 是 Khronos 实现的一个 Vulkan layer，该 layer 可以作为 Vulkan 的验证层，为使用 Vulkan API 提供错误检查的辅助功能。开启 validation layer 后，Vulkan API 使用上的错误会在应用程序运行时被打印出来，详细的资料请参考 [VK_LAYER_KHRONOS_validation](https://vulkan.lunarg.com/doc/view/latest/linux/khronos_validation_layer.html)。与之相关还有 `VK_EXT_debug_report` 功能，详情请参考 [VK_EXT_debug_report](https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VK_EXT_debug_report.html)。

### GPU 驱动参数

GPU 驱动提供 sysfs 节点调节性能相关的参数，这些参数一般保持默认值即可，如果有特殊需要可以自行更改：

| 节点 | 默认值 | 节点功能 |
| --- | --- | --- |
| `/sys/class/misc/mali0/device/js_ctx_scheduling_mode` | 0 | 决定 GPU 的任务调度策略：`0` 为优先级策略；`1` 为时间片轮转法 |
| `/sys/class/misc/mali0/device/js_scheduling_period` | 100（ms） | 决定 GPU 任务的切换时间 |

## 相关文档

- [sample_gpu_3d 使用说明](../02_multimedia_sample/08_sample_gpu_3d.md)
- [视频处理框架 - VPF/PYM](07_vpf_pym_api.md)
- [hbmem 使用指南](02_hbmem/01_hbmem.md)
- [显示输出 - DISP](09_disp_api.md)
- [BPU 底层 API](13_bpu_api.md)
