---
sidebar_position: 1
title: "VIO（视频输入）API"
description: "VIO（视频输入）API 接口说明"
---

# VIO（视频输入）API

`VIO` 模块提供操作 `MIPI` 摄像头和操作图像处理的功能。

- **接口层级**：封装层简易接口（模式 1），底层 VIO 原语见 [VIO API](/Advanced_development/multimedia_development/multimedia_api/vio_api)。
- **适用场景**：跑通多媒体 demo（采集/采集显示/采集编码），见 [多媒体示例](/Demos/multimedia_demo)。
- **前置条件**：已烧录 RDK OS，板端有编译工具链（`gcc`/`make`），可接入 MIPI 摄像头。

`VIO` API 提供了以下的接口：

| 函数 | 功能 |
| ---- | ----- |
| sp_init_vio_module | **初始化 VIO 对象** |
| sp_release_vio_module | **销毁 VIO 对象** |
| sp_open_camera | **打开摄像头** |
| sp_open_camera_v2 | **指定分辨率打开摄像头** |
| sp_open_vps | **打开 VPS** |
| sp_vio_close | **关闭摄像头或 VPS** |
| sp_vio_get_frame | **获取视频图像帧** |
| sp_vio_get_raw | **获取摄像头的 RAW 图数据** |
| sp_vio_get_yuv | **获取摄像头的 YUV 数据** |
| sp_vio_set_frame | **发送视频图像帧给 vps 模块** |


## sp_init_vio_module  

**【函数原型】**  

`void *sp_init_vio_module()`

**【功能描述】**  

初始化`VIO`对象，创建操作句柄。在其他接口调用前必须执行。

**【参数】**

无

**【返回类型】**  

成功返回一个`VIO`对象指针，失败返回`NULL`

## sp_release_vio_module  

**【函数原型】**  

`void sp_release_vio_module(void *obj)`

**【功能描述】**  

销毁`VIO`对象。

**【参数】**

- `obj`： 调用初始化接口时得到的`VIO`对象指针。

**【返回类型】**  

无

## sp_open_camera  

**【函数原型】**  

`int32_t sp_open_camera(void *obj, const int32_t pipe_id, const int32_t video_index, int32_t chn_num, int32_t *width, int32_t *height)`

**【功能描述】**  

初始化接入到 RDK S100上的 MIPI 摄像头。
支持设置输出分辨率，支持设置最多6组分辨率，只支持缩小。缩小倍率范围为[1, 1/64)

**【参数】**

- `obj`： 已经初始化的`VIO`对象指针
- `pipe_id`：支持多组数据输入，建议填0
- `video_index`：camera 对应的 host 编号。 -1表示自动探测；0, 1, 2 请参考 host 编号选择小节
- `chn_num`：设置输出多少种不同分辨率的图像，最大为6，最小为1。
- `width`：配置输出宽度的数组地址
- `height`：配置输出高度的数组地址

**【返回类型】** 

成功返回 0，失败返回 -1

## sp_open_camera_v2  

**【函数原型】**  

`int32_t sp_open_camera_v2(void *obj, const int32_t pipe_id, const int32_t video_index, int32_t chn_num, sp_sensors_parameters *parameters, int32_t *input_width, int32_t *input_height)`

**【功能描述】**  

初始化接入到 RDK S100上的 MIPI 摄像头。  
支持指定摄像头原始输出 RAW 的分辨率大小，通过`sp_sensors_parameters`设置。  
支持设置输出分辨率，支持设置最多6组分辨率，只支持缩小。缩小倍率范围为[1, 1/64)

目前支持的摄像头分辨率见下表：

| camera | 分辨率 |
| ---- | ----- |
|IMX219|1920x1080@30fps(default)|


**【参数】**

- `obj`： 已经初始化的`VIO`对象指针
- `pipe_id`：支持多组数据输入，建议填0
- `video_index`：camera 对应的 host 编号。 -1表示自动探测；0, 1, 2 请参考 host 编号选择小节
- `chn_num`：设置输出多少种不同分辨率的图像，最大为6，最小为1。
- `parameters`：camera RAW 输出相关结构体，用于指定分辨率和帧率
- `input_width`：配置输出宽度的数组地址
- `input_height`：配置输出高度的数组地址

`sp_sensors_parameters`结构体成员见下表：

| 数据类型 | 成员 | 注释 |
| ---- | ----- | ----- |
|int32_t|raw_height|摄像头输出 RAW 的高度|
|int32_t|raw_width|摄像头输出 RAW 的宽度|
|int32_t|fps|摄像头输出的帧率|

:::info 注意！

`S100`芯片对于`VPS`输出的宽度是有对齐需求的，输出宽度需满足16对齐，输出高度需满足2对齐，如果您设置的宽度和高度不符合对齐要求，则会检测报错。

:::

**【返回类型】** 

成功返回 0，失败返回 -1

## sp_open_vps  

**【函数原型】**  

`int32_t sp_open_vps(void *obj, const int32_t pipe_id, int32_t chn_num, int32_t proc_mode, int32_t src_width, int32_t src_height, int32_t *dst_width, int32_t *dst_height, int32_t *crop_x, int32_t *crop_y, int32_t *crop_width, int32_t *crop_height, int32_t *rotate)`

**【功能描述】**  

打开一路图像处理模块，支持对输入的图像完成缩小、裁剪任务。

**【参数】**

- `obj`： 已经初始化的`VIO`对象指针
- `pipe_id`：支持多次打开，通过`pipe_id`进行区分。
- `chn_num`：设置输出图像数量，最大为6，最小为1，与设置的目标高宽数组大小有关
- `proc_mode`：处理模式，当前支持：`SP_VPS_SCALE` 仅缩放、`SP_VPS_SCALE_CROP` 裁剪并缩放
- `src_width`：原始帧宽度
- `src_height`：原始帧高度
- `dst_width`：配置目标输出宽度的数组地址
- `dst_height`：配置目标输出高度的数组地址
- `crop_x`：裁剪区域的左上角 x 坐标集合，当`proc_mode`没有设置裁剪功能时，传入`NULL`
- `crop_y`：裁剪区域的左上角 y 坐标集合，当`proc_mode`没有设置裁剪功能时，传入`NULL`
- `crop_width`：裁剪区域的宽度，当`proc_mode`没有设置裁剪功能时，传入`NULL`
- `crop_height`：裁剪区域的高度，当`proc_mode`没有设置裁剪功能时，传入`NULL`
- `rotate`：旋转角度集合，当前不支持旋转功能，需传入`NULL`

:::info 注意！

`S100`芯片对于`VPS`输出的宽度是有对齐需求的，输出宽度需满足16对齐，输出高度需满足2对齐，如果您设置的宽度和高度不符合对齐要求，则会检测报错。

:::

**【返回类型】**  

成功返回 0，失败返回 -1

## sp_vio_close  

**【函数原型】**  

`int32_t sp_vio_close(void *obj)`

**【功能描述】**  

根据传入的 `obj` 是打开的 `camera` 还是 `vps`决定关闭 camera 还是 vps 模块。

**【参数】**

- `obj`： 已经初始化的`VIO`对象指针  

**【返回类型】**  

成功返回 0，失败返回 -1

## sp_vio_get_frame  

**【函数原型】**  

`int32_t sp_vio_get_frame(void *obj, char *frame_buffer, int32_t width, int32_t height, const int32_t timeout)`

**【功能描述】**  

获取指定分辨率的图像帧数据（分辨率在打开模块时需要传入，否则会获取失败）。返回数据格式为 `NV12` 的 `YUV` 图像。

**【参数】**

- `obj`： 已经初始化的`VIO`对象指针
- `frame_buffer`：已经预分配内存的 buffer 指针，用于保存获取出来的图片，目前获取到的图像都是`NV12`格式，所以预分配内存大小可以由公式`高 * 宽 * 3 / 2 `，也可以利用提供的宏定义 `FRAME_BUFFER_SIZE(w, h)`进行内存大小计算
- `width`：`frame_buffer`保存图片的宽，必须是在`sp_open_camera`或者`sp_open_vps`配置好的输出宽
- `height`：`frame_buffer`保存图片的高，必须是在`sp_open_camera`或者`sp_open_vps`配置好的输出高
- `timeout`：获取图片的超时时间，单位为`ms`，一般设置为`2000`

**【返回类型】**  

成功返回 0，失败返回 -1 

## sp_vio_get_raw  

**【函数原型】**  

`int32_t sp_vio_get_raw(void *obj, char *frame_buffer, int32_t width, int32_t height, const int32_t timeout)`

**【功能描述】**  

获取摄像头的 raw 图数据

**【参数】**

- `obj`： 已经初始化的`VIO`对象指针
- `frame_buffer`：已经预分配内存的 buffer 指针，用于保存获取出来的 raw 图，预分配内存字节大小可以由公式`(高 * 宽 * 图像深度)/8`计算得出
- `width`：获取 raw 图时传`NULL`
- `height`：获取 raw 图时传`NULL`
- `timeout`：获取图片的超时时间，单位为`ms`，一般设置为`2000`

**【返回类型】**  

成功返回 0，失败返回 -1 

## sp_vio_get_yuv  

**【函数原型】**  

`int32_t sp_vio_get_yuv(void *obj, char *frame_buffer, int32_t width, int32_t height, const int32_t timeout)`

**【功能描述】**  

获取摄像头的 ISP 模块的 YUV 数据

**【参数】**

- `obj`： 已经初始化的`VIO`对象指针
- `frame_buffer`：已经预分配内存的 buffer 指针，用于保存获取出来的图片，目前获取到的图像都是`NV12`格式，所以预分配内存大小可以由公式`高 * 宽 * 3 / 2 `，也可以利用提供的宏定义 `FRAME_BUFFER_SIZE(w, h)`进行内存大小计算
- `width`：获取 ISP 的 YUV 数据时传`NULL`
- `height`：获取 ISP 的 YUV 数据传`NULL`
- `timeout`：获取图片的超时时间，单位为`ms`，一般设置为`2000`

**【返回类型】**  

成功返回 0，失败返回 -1 

## sp_vio_set_frame  

**【函数原型】**  

`int32_t sp_vio_set_frame(void *obj, void *frame_buffer, int32_t size)`

**【功能描述】**  

在使用`vps`模块功能时，源数据需要通过调用本接口送入，`frame_buffer`里面的数据必须是 `NV12` 格式的图像数据，分辨率必须和调用`sp_open_vps`接口是的原始帧分辨率一致。

**【参数】**

- `obj`： 已经初始化的`VIO`对象指针
- `frame_buffer`：需要处理的图像帧数据，必须是 `NV12` 格式的图像数据，分辨率必须和调用`sp_open_vps`接口是的原始帧分辨率一致。
- `size`: 帧大小

**【返回类型】**  

成功返回 0，失败返回 -1

## host 编号选择
camera 对应的 host 编号如下图所示

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/20250220-114529.png" alt="Camera对应的host编号示意图" style={{ width: '40%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## 数据结构与常量

以下常量定义于 `sp_vio.h`：

| 常量 | 值 | 说明 |
| ---- | --- | ---- |
| `SP_VPS_SCALE` | 1 | VPS 处理模式：仅缩放 |
| `SP_VPS_SCALE_CROP` | 2 | VPS 处理模式：缩放 + 裁剪 |
| `SP_VPS_SCALE_ROTATE` | 3 | VPS 处理模式：缩放 + 旋转 |
| `SP_VPS_SCALE_ROTATE_CROP` | 4 | VPS 处理模式：缩放 + 旋转 + 裁剪 |
| `SP_HOST_0` ~ `SP_HOST_3` | 0 ~ 3 | 指定 host 编号（见 [host 编号选择](#host-编号选择)） |
| `SP_HOST_AUTO_DETECT` | -1 | 自动探测 host 编号 |
| `FRAME_BUFFER_SIZE(w, h)` | 宏 | 计算 NV12 帧缓冲区字节数 `w*h*3/2` |

`sp_open_camera_v2` 使用的传感器参数结构体：

```c
typedef struct {
    int32_t raw_height;  // 传感器输出高度
    int32_t raw_width;   // 传感器输出宽度
    int32_t fps;         // 帧率
} sp_sensors_parameters;
```

## 快速示例

采集一帧图像的典型调用顺序（完整可编译示例见 [采集示例](/Demos/multimedia_demo/cdev/vio_capture)）：

```c
void *vio = sp_init_vio_module();            // 1. 初始化 VIO 对象
sp_open_camera(vio, /*pipe_id*/0, /*video_index*/0, /*chn_num*/1,
               &width, &height);             // 2. 打开摄像头，回填宽高
char *buf = malloc(FRAME_BUFFER_SIZE(width, height));
sp_vio_get_frame(vio, buf, width, height, /*timeout*/2000);  // 3. 取一帧（NV12）
// ... 使用 buf 中的图像数据 ...
sp_vio_close(vio);                           // 4. 关闭摄像头/VPS
sp_release_vio_module(vio);                  // 5. 销毁 VIO 对象
free(buf);
```

## 常见问题

### 设置 VPS 输出分辨率时报错

**现象**：配置 `sp_open_vps` 或 `sp_open_camera_v2` 的输出宽高后检测报错。

**原因**：S100 对 `VPS` 输出宽度有 16 对齐、高度 2 对齐的要求。

**解决**：将输出宽度调整为满足 16 对齐、高度满足 2 对齐。

### sp_vio_get_frame 获取图像帧失败

**现象**：调用 `sp_vio_get_frame` 获取图像帧失败。

**原因**：所需分辨率未在打开模块时传入，或 `frame_buffer` 预分配内存不足。

**解决**：确认分辨率已在 `sp_open_camera`/`sp_open_vps` 配置，并按 `高 * 宽 * 3 / 2`（或 `FRAME_BUFFER_SIZE(w, h)` 宏）预分配 `frame_buffer`。

### sp_vio_set_frame 处理后结果异常

**现象**：`vps` 模块处理后的结果异常。

**原因**：送入的数据不是 `NV12` 格式，或分辨率与 `sp_open_vps` 的原始帧分辨率不一致。

**解决**：确保 `frame_buffer` 数据为 `NV12` 格式，且分辨率与 `sp_open_vps` 配置的原始帧分辨率一致。

## 相关文档

- [多媒体接口说明](/Simple_API/multimedia_api/pydev/pydev_multimedia_api)
- [ENCODER API](/Simple_API/multimedia_api/cdev/encoder_api)
- [VIO API](/Advanced_development/multimedia_development/multimedia_api/vio_api)
