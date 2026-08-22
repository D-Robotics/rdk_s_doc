---
sidebar_position: 1
title: "VIO (Video Input) API"
description: "VIO (video input) API reference"
---

# VIO (Video Input) API

The `VIO` module provides the functionality to operate `MIPI` cameras and perform image processing.

- **Interface level**: encapsulated simple API (mode 1). For the low-level VIO primitives, see [VIO API](/Advanced_development/multimedia_development/multimedia_api/vio_api).
- **Applicable scenarios**: running the multimedia demos (capture / capture+display / capture+encode). See [Multimedia Demos](/Demos/multimedia_demo).
- **Prerequisites**: RDK OS is flashed, a compile toolchain (`gcc`/`make`) is available on the board, and a MIPI camera can be connected.

The `VIO` API provides the following interfaces:

| Function | Description |
| ---- | ----- |
| sp_init_vio_module | **Initialize the VIO object** |
| sp_release_vio_module | **Destroy the VIO object** |
| sp_open_camera | **Open the camera** |
| sp_open_camera_v2 | **Open the camera with a specified resolution** |
| sp_open_vps | **Open VPS** |
| sp_vio_close | **Close the camera or VPS** |
| sp_vio_get_frame | **Get a video image frame** |
| sp_vio_get_raw | **Get the RAW image data from the camera** |
| sp_vio_get_yuv | **Get the YUV data from the camera** |
| sp_vio_set_frame | **Send a video image frame to the VPS module** |


## sp_init_vio_module  

**[Function Prototype]**  

`void *sp_init_vio_module()`

**[Description]**  

Initializes the `VIO` object and creates the operation handle. This must be called before calling any other interfaces.

**[Parameters]**

None

**[Return Value]**  

Returns a `VIO` object pointer on success, and `NULL` on failure.

## sp_release_vio_module  

**[Function Prototype]**  

`void sp_release_vio_module(void *obj)`

**[Description]**  

Destroys the `VIO` object.

**[Parameters]**

- `obj`: the `VIO` object pointer obtained by calling the initialization interface.

**[Return Value]**  

None

## sp_open_camera  

**[Function Prototype]**  

`int32_t sp_open_camera(void *obj, const int32_t pipe_id, const int32_t video_index, int32_t chn_num, int32_t *width, int32_t *height)`

**[Description]**  

Initializes the MIPI camera connected to the RDK S100.
Setting the output resolution is supported. Up to 6 sets of resolutions can be configured, and only downscaling is supported. The downscale ratio range is [1, 1/64)

**[Parameters]**

- `obj`: the already initialized `VIO` object pointer
- `pipe_id`: multiple data inputs are supported. It is recommended to set this to 0
- `video_index`: the host number corresponding to the camera. -1 means auto-detection; for 0, 1, 2 refer to the host number selection section
- `chn_num`: sets how many different output resolutions to produce. Maximum 6, minimum 1.
- `width`: the array address holding the configured output widths
- `height`: the array address holding the configured output heights

**[Return Value]** 

Returns 0 on success, and -1 on failure

## sp_open_camera_v2  

**[Function Prototype]**  

`int32_t sp_open_camera_v2(void *obj, const int32_t pipe_id, const int32_t video_index, int32_t chn_num, sp_sensors_parameters *parameters, int32_t *input_width, int32_t *input_height)`

**[Description]**  

Initializes the MIPI camera connected to the RDK S100.  
The resolution of the camera's original RAW output can be specified via `sp_sensors_parameters`.  
Setting the output resolution is supported. Up to 6 sets of resolutions can be configured, and only downscaling is supported. The downscale ratio range is [1, 1/64)

The currently supported camera resolutions are listed in the table below:

| camera | Resolution |
| ---- | ----- |
|IMX219|1920x1080@30fps(default)|


**[Parameters]**

- `obj`: the already initialized `VIO` object pointer
- `pipe_id`: multiple data inputs are supported. It is recommended to set this to 0
- `video_index`: the host number corresponding to the camera. -1 means auto-detection; for 0, 1, 2 refer to the host number selection section
- `chn_num`: sets how many different output resolutions to produce. Maximum 6, minimum 1.
- `parameters`: the camera RAW output related structure, used to specify the resolution and frame rate
- `input_width`: the array address holding the configured output widths
- `input_height`: the array address holding the configured output heights

The members of the `sp_sensors_parameters` structure are listed in the table below:

| Data Type | Member | Description |
| ---- | ----- | ----- |
|int32_t|raw_height|The RAW output height of the camera|
|int32_t|raw_width|The RAW output width of the camera|
|int32_t|fps|The output frame rate of the camera|

:::info Note!

The `S100` chip has alignment requirements for the `VPS` output width: the output width must be aligned to 16, and the output height must be aligned to 2. If the width and height you set do not meet the alignment requirements, an error will be reported during validation.

:::

**[Return Value]** 

Returns 0 on success, and -1 on failure

## sp_open_vps  

**[Function Prototype]**  

`int32_t sp_open_vps(void *obj, const int32_t pipe_id, int32_t chn_num, int32_t proc_mode, int32_t src_width, int32_t src_height, int32_t *dst_width, int32_t *dst_height, int32_t *crop_x, int32_t *crop_y, int32_t *crop_width, int32_t *crop_height, int32_t *rotate)`

**[Description]**  

Opens one image processing module, which supports performing downscaling and cropping tasks on the input image.

**[Parameters]**

- `obj`: the already initialized `VIO` object pointer
- `pipe_id`: it can be opened multiple times, distinguished by `pipe_id`.
- `chn_num`: sets the number of output images. Maximum 6, minimum 1, related to the size of the configured target height/width arrays
- `proc_mode`: processing mode. Currently supported: `SP_VPS_SCALE` scale only, `SP_VPS_SCALE_CROP` crop and scale
- `src_width`: the original frame width
- `src_height`: the original frame height
- `dst_width`: the array address holding the configured target output widths
- `dst_height`: the array address holding the configured target output heights
- `crop_x`: the set of top-left x coordinates of the crop regions. Pass `NULL` when `proc_mode` is not configured with the crop function
- `crop_y`: the set of top-left y coordinates of the crop regions. Pass `NULL` when `proc_mode` is not configured with the crop function
- `crop_width`: the widths of the crop regions. Pass `NULL` when `proc_mode` is not configured with the crop function
- `crop_height`: the heights of the crop regions. Pass `NULL` when `proc_mode` is not configured with the crop function
- `rotate`: the set of rotation angles. Rotation is currently not supported, so `NULL` must be passed

:::info Note!

The `S100` chip has alignment requirements for the `VPS` output width: the output width must be aligned to 16, and the output height must be aligned to 2. If the width and height you set do not meet the alignment requirements, an error will be reported during validation.

:::

**[Return Value]**  

Returns 0 on success, and -1 on failure

## sp_vio_close  

**[Function Prototype]**  

`int32_t sp_vio_close(void *obj)`

**[Description]**  

Depending on whether the passed `obj` is an opened `camera` or `vps`, it closes either the camera or the vps module.

**[Parameters]**

- `obj`: the already initialized `VIO` object pointer  

**[Return Value]**  

Returns 0 on success, and -1 on failure

## sp_vio_get_frame  

**[Function Prototype]**  

`int32_t sp_vio_get_frame(void *obj, char *frame_buffer, int32_t width, int32_t height, const int32_t timeout)`

**[Description]**  

Gets the image frame data of the specified resolution (the resolution must be passed in when opening the module, otherwise the retrieval will fail). The returned data format is an `NV12` `YUV` image.

**[Parameters]**

- `obj`: the already initialized `VIO` object pointer
- `frame_buffer`: a buffer pointer with memory already pre-allocated, used to store the retrieved image. Currently the retrieved images are all in `NV12` format, so the pre-allocated memory size can be computed by the formula `height * width * 3 / 2 `, or by using the provided macro `FRAME_BUFFER_SIZE(w, h)` to calculate the memory size
- `width`: the width of the image stored in `frame_buffer`. It must be one of the output widths configured in `sp_open_camera` or `sp_open_vps`
- `height`: the height of the image stored in `frame_buffer`. It must be one of the output heights configured in `sp_open_camera` or `sp_open_vps`
- `timeout`: the timeout for retrieving the image, in `ms`. Usually set to `2000`

**[Return Value]**  

Returns 0 on success, and -1 on failure 

## sp_vio_get_raw  

**[Function Prototype]**  

`int32_t sp_vio_get_raw(void *obj, char *frame_buffer, int32_t width, int32_t height, const int32_t timeout)`

**[Description]**  

Gets the RAW image data from the camera

**[Parameters]**

- `obj`: the already initialized `VIO` object pointer
- `frame_buffer`: a buffer pointer with memory already pre-allocated, used to store the retrieved RAW image. The pre-allocated memory size in bytes can be computed by the formula `(height * width * image bit depth)/8`
- `width`: pass `NULL` when retrieving the RAW image
- `height`: pass `NULL` when retrieving the RAW image
- `timeout`: the timeout for retrieving the image, in `ms`. Usually set to `2000`

**[Return Value]**  

Returns 0 on success, and -1 on failure 

## sp_vio_get_yuv  

**[Function Prototype]**  

`int32_t sp_vio_get_yuv(void *obj, char *frame_buffer, int32_t width, int32_t height, const int32_t timeout)`

**[Description]**  

Gets the YUV data from the camera's ISP module

**[Parameters]**

- `obj`: the already initialized `VIO` object pointer
- `frame_buffer`: a buffer pointer with memory already pre-allocated, used to store the retrieved image. Currently the retrieved images are all in `NV12` format, so the pre-allocated memory size can be computed by the formula `height * width * 3 / 2 `, or by using the provided macro `FRAME_BUFFER_SIZE(w, h)` to calculate the memory size
- `width`: pass `NULL` when retrieving the ISP YUV data
- `height`: pass `NULL` when retrieving the ISP YUV data
- `timeout`: the timeout for retrieving the image, in `ms`. Usually set to `2000`

**[Return Value]**  

Returns 0 on success, and -1 on failure 

## sp_vio_set_frame  

**[Function Prototype]**  

`int32_t sp_vio_set_frame(void *obj, void *frame_buffer, int32_t size)`

**[Description]**  

When using the `vps` module functionality, the source data must be fed in by calling this interface. The data in `frame_buffer` must be image data in `NV12` format, and its resolution must match the original frame resolution used when calling the `sp_open_vps` interface.

**[Parameters]**

- `obj`: the already initialized `VIO` object pointer
- `frame_buffer`: the image frame data to be processed. It must be image data in `NV12` format, and its resolution must match the original frame resolution used when calling the `sp_open_vps` interface.
- `size`: the frame size

**[Return Value]**  

Returns 0 on success, and -1 on failure

## Host Number Selection
The host numbers corresponding to the cameras are shown in the figure below

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/20250220-114529.png" alt="Diagram of host numbers corresponding to cameras" style={{ width: '40%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Data Structures and Constants

The following constants are defined in `sp_vio.h`:

| Constant | Value | Description |
| ---- | --- | ---- |
| `SP_VPS_SCALE` | 1 | VPS processing mode: scale only |
| `SP_VPS_SCALE_CROP` | 2 | VPS processing mode: scale + crop |
| `SP_VPS_SCALE_ROTATE` | 3 | VPS processing mode: scale + rotate |
| `SP_VPS_SCALE_ROTATE_CROP` | 4 | VPS processing mode: scale + rotate + crop |
| `SP_HOST_0` ~ `SP_HOST_3` | 0 ~ 3 | Specifies the host number (see [Host Number Selection](#host-number-selection)) |
| `SP_HOST_AUTO_DETECT` | -1 | Auto-detect the host number |
| `FRAME_BUFFER_SIZE(w, h)` | macro | Computes the byte size of an NV12 frame buffer `w*h*3/2` |

The sensor parameter structure used by `sp_open_camera_v2`:

```c
typedef struct {
    int32_t raw_height;  // sensor output height
    int32_t raw_width;   // sensor output width
    int32_t fps;         // frame rate
} sp_sensors_parameters;
```

## Quick Example

The typical call sequence for capturing one image frame (see [Capture Example](/Demos/multimedia_demo/cdev/vio_capture) for a fully compilable example):

```c
void *vio = sp_init_vio_module();            // 1. Initialize the VIO object
sp_open_camera(vio, /*pipe_id*/0, /*video_index*/0, /*chn_num*/1,
               &width, &height);             // 2. Open the camera, width/height are filled in
char *buf = malloc(FRAME_BUFFER_SIZE(width, height));
sp_vio_get_frame(vio, buf, width, height, /*timeout*/2000);  // 3. Get one frame (NV12)
// ... use the image data in buf ...
sp_vio_close(vio);                           // 4. Close the camera/VPS
sp_release_vio_module(vio);                  // 5. Destroy the VIO object
free(buf);
```

## Related Documentation

- [Multimedia API Overview](/Simple_API/multimedia_api/pydev/pydev_multimedia_api)
- [ENCODER API](/Simple_API/multimedia_api/cdev/encoder_api)
- [VIO API](/Advanced_development/multimedia_development/multimedia_api/vio_api)
