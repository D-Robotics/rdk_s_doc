---
sidebar_position: 4
title: "DISPLAY（显示模块）API"
description: "DISPLAY（显示模块）API 接口说明"
---

# DISPLAY（显示模块）API

`DISPLAY` 模块提供视频图像显示功能，把 `NV12` 图像显示到 `HDMI` 接口显示器，并支持在画面上绘制矩形框和文字。

- **接口层级**：封装层简易接口（模式 1），底层 DISP 见 [DISP API](/Advanced_development/multimedia_development/multimedia_api/disp_api)。
- **适用场景**：采集→显示、解码→显示，见 [采集→显示](/Demos/multimedia_demo/cdev/vio2display)。
- **前置条件**：已烧录 RDK OS，板端有编译工具链，HDMI 显示器已连接。

`DISPLAY` API 提供了以下的接口：

| 函数 | 功能 |
| ---- | ----- |
| sp_init_display_module | **初始化显示模块对象** |
| sp_release_display_module | **销毁显示模块对象** |
| sp_start_display | **创建视频显示通道** |
| sp_stop_display | **关闭视频显示通道** |
| sp_display_set_image | **向视频显示通道传入图像** |
| sp_display_draw_rect | **在显示通道上绘制矩形框** |
| sp_display_draw_string | **在显示通道上绘制字符串** |
| sp_get_display_resolution | **获取显示器的分辨率** |

## sp_init_display_module  

**【函数原型】**  

`void *sp_init_display_module()`

**【功能描述】**  

初始化显示模块对象，本模块支持把视频图像数据显示到 `HDMI` 接口的显示器上，并且提供在显示画面上绘制矩形框和文字的功能。

**【参数】**

无

**【返回类型】** 

成功返回 `DISPLAY` 对象指针，失败返回 NULL。

**【注意事项】**

使用其他显示接口前必须先调用本接口获得 `DISPLAY` 操作句柄。

**【兼容性】**

支持 RDK S100、RDK S600。

## sp_release_display_module  

**【函数原型】**  

`void sp_release_display_module(void *obj)`

**【功能描述】**  

销毁 `DISPLAY` 对象。

**【参数】**

- `obj`： 已经初始化的`DISPLAY`对象指针

**【返回类型】** 

无

**【注意事项】**

传入的 `obj` 须为 `sp_init_display_module` 返回的有效对象指针，在停止显示后调用释放资源。

**【兼容性】**

支持 RDK S100、RDK S600。

## sp_start_display  

**【函数原型】**  

`int32_t sp_start_display(void *obj, int32_t chn, int32_t width, int32_t height)`

**【功能描述】**  

创建一个显示通道，RDK S100开发板支持4个通道，2个视频层，2个图形层。支持的最大分辨率为 `1920 x 1080`, 最大帧率 `60fps`。

**【参数】**

- `obj`： 已经初始化的`DISPLAY`对象指针
- `chn`： 通道号，支持0~3， 如果使用的是桌面系统，0通道用作了图形化系统，所以应用程序请使用通道1。2和3通道一般用来绘制矩形框或者叠加文字信息。
- `width`：显示输出分辨率 - 宽
- `height`：显示输出分辨率 - 高

**【返回类型】** 

成功返回 0，失败返回 -1

**【注意事项】**

调用前须先初始化 `DISPLAY` 对象；`chn` 支持 0~3，桌面系统下 0 通道已用作图形化系统，应用程序请使用通道 1，图形层叠加使用通道 2~3；最大分辨率 1920 x 1080、最大帧率 60fps。

**【兼容性】**

支持 RDK S100、RDK S600。

## sp_stop_display  

**【函数原型】**  

`int32_t sp_stop_display(void *obj)`

**【功能描述】**  

关闭显示通道。

**【参数】**

- `obj`： 已经初始化的`DISPLAY`对象指针

**【返回类型】** 

成功返回 0，失败返回 -1

**【注意事项】**

传入的 `obj` 须为已初始化的 `DISPLAY` 对象指针，在显示结束后调用关闭显示通道。

**【兼容性】**

支持 RDK S100、RDK S600。

## sp_display_set_image  

**【函数原型】**  

`int32_t sp_display_set_image(void *obj, char *addr, int32_t size, int32_t chn)`

**【功能描述】**  

让 `addr` 中的图像数据显示到显示通道 `chn`。 图像格式只支持 `NV12` 的 `YUV` 图像。

**【参数】**

- `obj`：已经初始化的`DISPLAY`对象指针
- `addr`：图像数据，图像格式只支持 `NV12`。
- `size`：图像数据大小，计算公式为： width * height * 3 / 2
- `chn`：显示通道，与 `sp_start_display` 接口使用的通道号对应。

**【返回类型】** 

成功返回 0，失败返回 -1

**【注意事项】**

调用前须先创建显示通道（`sp_start_display`）；`addr` 图像数据必须为 `NV12` 格式，`chn` 与 `sp_start_display` 使用的通道号一致。

**【兼容性】**

支持 RDK S100、RDK S600。

## sp_display_draw_rect  

**【函数原型】**  

`int32_t sp_display_draw_rect(void *obj, int32_t x0, int32_t y0, int32_t x1, int32_t y1, int32_t chn, int32_t flush, int32_t color, int32_t line_width)`

**【功能描述】**  

在显示模块的图形层绘制矩形框。

**【参数】**

- `obj`： 已经初始化的`DISPLAY`对象指针
- `x0`：绘制矩形框第一个坐标的 x 值
- `y0`：绘制矩形框第一个坐标的 y 值
- `x1`：绘制矩形框第二个坐标的 x 值
- `y1`：绘制矩形框第二个坐标的 y 值
- `chn`：chn 显示输出层，2~3为图形层
- `flush`：是否清零当前图形层 buffer
- `color`：矩形框颜色（颜色格式为 ARGB8888）
- `line_width`：矩形框的线宽

**【返回类型】** 

成功返回 0，失败返回 -1

**【注意事项】**

调用前须先初始化 `DISPLAY` 对象；`chn` 为图形层（2~3），`color` 使用 ARGB8888 格式。

**【兼容性】**

支持 RDK S100、RDK S600。

## sp_display_draw_string  

**【函数原型】**  

`int32_t sp_display_draw_string(void *obj, int32_t x, int32_t y, char *str, int32_t chn, int32_t flush, int32_t color, int32_t line_width)`

**【功能描述】**  

在显示模块的图形层绘制字符串。

**【参数】**

- `obj`： 已经初始化的`DISPLAY`对象指针
- `x`：绘制字符串起始坐标的 x 值
- `y`：绘制字符串起始坐标的 y 值
- `str`：需要绘制的字符串（需要是 GB2312编码）
- `chn`：chn 显示输出层，2~3为图形层
- `flush`：是否清零当前图形层 buffer
- `color`：矩形框颜色（颜色格式为 ARGB8888）
- `line_width`：文字的线宽

**【返回类型】** 

成功返回 0，失败返回 -1

**【注意事项】**

调用前须先初始化 `DISPLAY` 对象；`str` 须为 GB2312 编码，`chn` 为图形层（2~3），`color` 使用 ARGB8888 格式。

**【兼容性】**

支持 RDK S100、RDK S600。

## sp_get_display_resolution  

**【函数原型】**  

`void sp_get_display_resolution(int32_t *width, int32_t *height)`

**【功能描述】**  

获取当前接入的显示器分辨率。

**【参数】**

- `width`： 需要获取的分辨率 - 宽
- `height`：需要获取的分辨率 - 高

**【返回类型】** 

无。

**【注意事项】**

用于在创建显示通道前获取当前接入显示器的分辨率，输出经 `width`/`height` 回填。

**【兼容性】**

支持 RDK S100、RDK S600。

## 数据结构与常量

以下常量定义于 `sp_display.h`：

| 常量 | 值 | 说明 |
| ---- | --- | ---- |
| `DISPLAY_MODE_DP` | 10 | 显示输出模式：DP |
| `DISPLAY_MODE_HDMI` | 11 | 显示输出模式：HDMI |

## 快速示例

显示一帧图像的典型调用顺序（完整可编译示例见 [采集→显示](/Demos/multimedia_demo/cdev/vio2display)）：

```c
void *disp = sp_init_display_module();       // 1. 初始化 DISPLAY 对象
sp_start_display(disp, /*chn*/1, width, height);  // 2. 创建显示通道（桌面系统请用通道 1）
sp_display_set_image(disp, frame_buffer, size, /*chn*/1);  // 3. 送入一帧图像显示
// ... 可用 sp_display_draw_rect / sp_display_draw_string 叠加图形 ...
sp_stop_display(disp);                       // 4. 停止显示通道
sp_release_display_module(disp);             // 5. 销毁 DISPLAY 对象
```

## 常见问题

### 图像无法显示或花屏

**现象**：调用 `sp_display_set_image` 后无画面或花屏。

**原因**：图像数据不是 `NV12` 格式，或通道号使用错误（桌面系统下 0 通道已用作图形化系统）。

**解决**：确保送入数据为 `NV12` 格式；桌面系统下应用程序使用通道 1，叠加图形使用通道 2~3。

### 绘制字符串显示乱码

**现象**：调用 `sp_display_draw_string` 绘制文字显示乱码。

**原因**：需要绘制的字符串必须是 `GB2312` 编码。

**解决**：将字符串转换为 `GB2312` 编码后传入。

## 相关文档

- [DECODER API](/Simple_API/multimedia_api/cdev/decoder_api)
- [Display 对象](/Simple_API/multimedia_api/pydev/object_display)
- [采集→显示](/Demos/multimedia_demo/cdev/vio2display)
