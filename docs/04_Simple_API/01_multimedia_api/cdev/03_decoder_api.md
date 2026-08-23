---
sidebar_position: 3
title: "DECODER（解码模块）API"
description: "DECODER（解码模块）API 接口说明"
---

# DECODER（解码模块）API

`DECODER` 模块提供视频码流解码功能，支持 `H264`、`H265` 和 `MJPEG` 码流。

- **接口层级**：封装层简易接口（模式 1），底层 MediaCodec 见 [MediaCodec API](/Advanced_development/multimedia_development/multimedia_api/mediacodec_api)。
- **适用场景**：解码→显示、RTSP 拉流解码，见 [解码→显示](/Demos/multimedia_demo/cdev/decode2display)。
- **前置条件**：已烧录 RDK OS，板端有编译工具链，准备码流文件或码流数据源。

`DECODER` API 提供了以下的接口：

| 函数 | 功能 |
| ---- | ----- |
| sp_init_decoder_module | **初始化解码模块对象** |
| sp_release_decoder_module | **销毁解码模块对象** |
| sp_start_decode | **创建图像解码通道** |
| sp_stop_decode | **关闭图像解码通道** |
| sp_decoder_get_image | **从解码通道获取解码后的图像帧** |
| sp_decoder_set_image | **向解码通道传入需要解码的码流数据** |

## sp_init_decoder_module  

**【函数原型】**  

`void *sp_init_decoder_module()`

**【功能描述】**  

初始化解码模块对象，在使用解码模块时需要调用获得操作句柄，支持 H264、H265 和 MJPEG 格式的视频码流。

**【参数】**

无。

**【返回类型】** 

成功返回`DECODER`对象，失败返回 NULL。

## sp_release_decoder_module  

**【函数原型】**  

`void sp_release_decoder_module(void *obj)`

**【功能描述】**  

销毁解码模块对象。

**【参数】**

 - `obj`: 调用初始化接口时得到的对象指针。

**【返回类型】**  

无

## sp_start_decode  

**【函数原型】**  

`int32_t sp_start_decode(void *obj, const char *stream_file, int32_t video_chn, int32_t type, int32_t width, int32_t height)`

**【功能描述】**  

创建一个解码通道，设置通道号、解码的码流类型、图像帧分辨率。

**【参数】**

- `obj`： 已经初始化的`DECODER`对象指针
- `stream_file`：当 `stream_file` 设置为一个码流文件名时，表示对这个码流文件进行解码，例如设置 H264的码流文件“stream.h264”, 当 `stream_file` 传入空字符串时，表示解码的数据流需要通过调用 `sp_decoder_set_image` 传入。
- `video_chn`：解码通道号，支持 0~31。
- `type`：解码的数据类型，支持 `SP_ENCODER_H264`，`SP_ENCODER_H265` 和 `SP_ENCODER_MJPEG`。
- `width`：解码出来的图像帧的分辨率 - 宽
- `height`：解码出来的图像帧的分辨率 - 高

**【返回类型】** 

成功返回 0，失败返回 -1

## sp_stop_decode  

**【函数原型】**  

`int32_t sp_stop_decode(void *obj)`

**【功能描述】**  

关闭解码通道。

**【参数】**

- `obj`： 已经初始化的`DECODER`对象指针

**【返回类型】** 

成功返回 0，失败返回 -1

## sp_decoder_get_image  

**【函数原型】**  

`int32_t sp_decoder_get_image(void *obj, char *image_buffer)`

**【功能描述】**  

从解码通道获取解码后的图像帧数据，返回的图像数据格式为 `NV12` 的 `YUV` 图像。

**【参数】**

- `obj`：已经初始化的`DECODER`对象指针
- `image_buffer`：返回的图像帧数据，这个 buffer 大小与图像分辨率的关系为 `(width * height * 3) / 2`。

**【返回类型】** 

成功返回 0，失败返回 -1

## sp_decoder_set_image  

**【函数原型】**  

`int32_t sp_decoder_set_image(void *obj, char *image_buffer, int32_t chn, int32_t size, int32_t eos)`

**【功能描述】**  

向已经打开的解码通道送入码流数据。
如果是解码 H264 或 H265 码流，需要先发送3~5帧数据，让解码器完成帧缓存后，再获取解码帧数据。
如果解码 H264 码流，首先第一帧送入解码的数据需要是 sps 和 pps 的描述信息，否者解码器会报错退出。

**【参数】**

- `obj`： 已经初始化的`DECODER`对象指针。
- `image_buffer`：码流数据指针。
- `chn`：解码器通道号，需要是调用 `sp_start_decode` 打开过的通道号。
- `size`：码流数据大小。
- `eos`：是否是最后一帧数据。

**【返回类型】** 

成功返回 0，失败返回 -1

## 数据结构与常量

解码类型沿用编码类型常量（定义于 `sp_codec.h`）：`SP_ENCODER_H264`（1）、`SP_ENCODER_H265`（2）、`SP_ENCODER_MJPEG`（3），在 `sp_start_decode` 的 `type` 参数中使用。

## 快速示例

解码视频文件的典型调用顺序（完整可编译示例见 [解码→显示](/Demos/multimedia_demo/cdev/decode2display)）：

```c
void *dec = sp_init_decoder_module();        // 1. 初始化 DECODER 对象
sp_start_decode(dec, "test.h264", /*video_chn*/0,
                SP_ENCODER_H264, width, height);  // 2. 打开码流文件并创建解码通道
char *img = malloc(FRAME_BUFFER_SIZE(width, height));
sp_decoder_get_image(dec, img);              // 3. 取一帧解码图像（NV12）
// ... 使用 img 中的图像数据（如送显/推理）...
sp_stop_decode(dec);                         // 4. 停止解码通道
sp_release_decoder_module(dec);              // 5. 销毁 DECODER 对象
free(img);
```

## 常见问题

### 解码 H264/H265 取帧异常或为空

**现象**：解码 H264/H265 码流时取到的解码帧异常或为空。

**原因**：解码器需要先缓存若干帧数据。

**解决**：先送入 3~5 帧数据，让解码器完成帧缓存后再获取解码帧。

### 解码 H264 时解码器报错退出

**现象**：解码 H264 码流时解码器报错退出。

**原因**：送入的第一帧数据不是 sps/pps 描述信息。

**解决**：送入解码的第一帧必须是 sps 和 pps 描述信息。

### 需要对内存中的数据流解码

**现象**：需要对内存中的码流数据（而非文件）解码。

**原因**：`sp_start_decode` 的 `stream_file` 传文件名时解码文件，传空字符串时需手动送入码流。

**解决**：`sp_start_decode` 的 `stream_file` 传空字符串，再通过 `sp_decoder_set_image` 送入码流数据。

## 相关文档

- [ENCODER API](/Simple_API/multimedia_api/cdev/encoder_api)
- [DISPLAY API](/Simple_API/multimedia_api/cdev/display_api)
- [解码→显示](/Demos/multimedia_demo/cdev/decode2display)
