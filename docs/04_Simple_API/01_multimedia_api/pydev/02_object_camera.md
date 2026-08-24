---
sidebar_position: 2
title: "Camera 对象"
description: "Camera 对象 对象接口说明"
---

# Camera 对象

> **接口层级**：封装层简易接口（模式 1），底层 VIO 原语见 [VIO API](/Advanced_development/multimedia_development/multimedia_api/vio_api)。对应 C 接口见 [VIO API](/Simple_API/multimedia_api/cdev/vio_api)。

Camera 对象用于完成 MIPI Camera 的图像采集和处理功能，包含了`open_cam`、`open_vps`、`get_img`、`set_img`、`close_cam`等几种方法，详细说明如下：

## 方法清单

| 方法名 | 说明 | 所属章节 |
| ------ | ---- | -------- |
| `open_cam` | 打开指定通道的 MIPI 摄像头，并设置摄像头输出帧率、分辨率格式 | [open_cam](#open_cam) |
| `open_vps` | 使能指定 camera 通道的 vps 图像处理功能，支持缩放、裁剪、旋转 | [open_vps](#open_vps) |
| `get_img` | 获取 camera 对象的图像输出 | [get_img](#get_img) |
| `set_img` | 向 vps 模块输入图像，并触发图像处理操作 | [set_img](#set_img) |
| `close_cam` | 关闭使能的 MIPI camera 摄像头 | [close_cam](#close_cam) |

## open_cam

【功能描述】  

打开指定通道的 MIPI 摄像头，并设置摄像头输出帧率、分辨率格式。

【函数声明】  

```python
Camera.open_cam(pipe_id, video_index, fps, width, height, raw_height, raw_width)
```

【参数描述】  

| 参数名称      | 定义描述                  | 取值范围    |
| ----------- | ------------------------ | --------  |
| pipe_id     | camera 对应的 pipeline 通道号  | 默认从0开始，范围0~7  |
| video_index | camera 对应的 host 编号，-1表示自动探测 | 取值 -1,0,1,2 请参考 host 编号选择小节 |
| fps         | camera 图像输出帧率          | 依据 camera 型号而定，默认值30   |
| width       | camera 最终图像输出宽度    |  视 camera 型号而定，默认值1920 |
| height      | camera 最终图像输出高度  |    视 camera 型号而定，默认值1080 |
| raw_height       | camera 原始 RAW 图像输出高度    |  默认值 -1（不设置）|
| raw_width      | camera 原始 RAW 图像输出宽度  |    默认值 -1（不设置）|

【使用方法】 

```python
#create camera object
camera = libsrcampy.Camera()

#open MIPI Camera, fps: 30, solution: 1080p
ret = camera.open_cam(0, -1, 30, 1920, 1080)
```

【返回值】  

| 返回值 | 描述 |
| ------ | ----- |
| 0      | 成功  |
| -1    | 失败 |

【注意事项】 

`width`，`height`参数支持`list`类型输入，表示使能 camera 多组不同分辨率输出。`list`最多支持6组缩小，缩放区间为 camera 原始分辨率的[1 ,1/64)。使用方式如下：

```python
ret = cam.open_cam(0, -1, 30, [1920, 1280], [1080, 720])
```

`raw_height`，`raw_width` 只有在需要摄像头不是默认分辨率的情况下才设置，比如在使用`IMX477`摄像头时，若想同时输出4k 分辨率（3840x2160）和1080P 分辨率（1920x1080），则可以这样使用：
```python
cam.open_cam(0, -1, 10, [3840, 1920], [2160, 1080], 3000, 4000)
```

目前支持的摄像头分辨率见下表：

| camera | 分辨率 |
| ---- | ----- |
|IMX219|1920x1080@30fps(default)|

:::info 注意！

`IMX477`从`1080P`的分辨率切换至其它分辨率需要进行手动复位，可以在板端执行`hobot_reset_camera.py`完成复位操作。

:::

:::info 注意！

`S100`芯片对于`VPS`输出的宽度是有对齐需求的，输出宽度需满足16对齐，输出高度需满足2对齐，如果您设置的宽度和高度不符合对齐要求，则会检测报错。

:::

【参考代码】  

无

【兼容性】

支持 RDK S100、RDK S600。

## open_vps

【功能描述】

使能指定 camera 通道的 vps(video process)图像处理功能，支持对输入图像完成缩放、裁剪等功能。

【函数声明】  

```python
Camera.open_vps(pipe_id, process_mode, src_width, src_height, dst_width, dst_height, crop_rect, rotate, src_size, dst_size)
```

【参数描述】  


| 参数名称      | 定义描述                  | 取值范围    |
| ----------- | ------------------------ | --------  |
| pipe_id    | camera 对应的 pipeline 通道号  | 默认从0开始，范围0~7  |
| process_mode  | 图像处理模式配置，支持缩放、裁剪、旋转   | 范围1~4，分别表示`缩放`、`缩放+裁剪`、`缩放+旋转`、`缩放+裁剪+旋转`|
| src_width  | 图像输入宽度                 | 视 camera 输出宽度而定 |
| src_height | 图像输入高度                 | 视 camera 输出高度而定 |
| dst_width  | 图像输出宽度 | 输入宽度的[1, 1/64)倍 |
| dst_height | 图像输出高度 | 输入高度的[1, 1/64)倍 |
| crop_rect  | 裁剪区域，输入格式 [x, y, width, height] | 不超过输入图像尺寸 |
| rotate     | 旋转角度，最多支持两个通道旋转 | 范围0~3，分别表示`不旋转`、`90度`、`180度`、`270度` |
| src_size | 保留参数 | 默认不需要配置 |
| dst_size | 保留参数 | 默认不需要配置 |

【使用方法】 

```python
#create camera object
camera = libsrcampy.Camera()

#enable vps function
ret = camera.open_vps(1, 1, 1920, 1080, 512, 512)
```

【返回值】  

| 返回值 | 定义描述 |                 
| ------ | ----- |
| 0      | 成功  |
| -1    | 失败 |

:::info 注意！
- vps 处理功能最多支持6个通道输出，只支持缩小。缩小倍率范围为[1, 1/64)，多通道配置通过输入参数`list`传递。
- 图像裁剪功能以图像左上角为原点，按照配置尺寸进行裁剪
- 图像裁剪会在缩放、旋转操作之前进行，多通道配置通过输入参数`list`传递。
:::


:::info 注意！

`S100`芯片对于`VPS`输出的宽度是有对齐需求的，输出宽度需满足16对齐，输出高度需满足2对齐，如果您设置的宽度和高度不符合对齐要求，则会检测报错。

:::

```python
#creat camera object
camera = libsrcampy.Camera()

#enable vps function
#input: 4k, output0: 1080p, output1: 720p
#ouput0 croped by [2560, 1440]
ret = camera.open_vps(0, 1, 3840, 2160, [1920, 1280], [1080, 720], [2560, 1440])
```

【参考代码】  
无

【注意事项】

调用前须先完成摄像头使能；`process_mode` 支持缩放、缩放+裁剪、缩放+旋转、缩放+裁剪+旋转（取值 1~4）；VPS 只支持缩小（倍率 [1, 1/64)）、最多 6 个通道输出，输出宽度需 16 对齐、高度 2 对齐。

【兼容性】

支持 RDK S100、RDK S600。

## get_img

【功能描述】

获取 camera 对象的图像输出，需要在`open_cam`、`open_vps`之后调用

【函数声明】 

```python
Camera.get_img(module, width, height)
```

【参数描述】  

| 参数名称 | 定义描述                 | 取值范围     |
| -------- | ------- | ----------- |
| module   | 需要获取图像的模块（0=SP_DEV_VIN、1=SP_DEV_ISP、2=SP_DEV_VPS） | 默认为2（SP_DEV_VPS） |
| width    | 需要获取图像的宽度 | `open_cam`、`open_vps`设置的输出宽度 |
| height   | 需要获取图像的高度 | `open_cam`、`open_vps`设置的输出高度 |


【使用方法】 

```python
cam = libsrcampy.Camera()

#open MIPI Camera, fps: 30, solution: 1080p
ret = cam.open_cam(0, 1, 30, 1920, 1080)

#wait for 1s
time.sleep(1)

#get one image from camera
img = cam.get_img(2)
```

【返回值】  

| 返回值 | 定义描述 |                 
| ------ | ----- |
| PyBytesObject | 成功，返回图像数据 |
| None          | 失败 |

【注意事项】 

该方法需要在`open_cam`、`open_vps`之后调用  

【参考代码】  

```python
import sys, os, time

from hobot_vio import libsrcampy

def test_camera():
    cam = libsrcampy.Camera()

    #open MIPI camera, fps: 30, solution: 1080p
    ret = cam.open_cam(0, 1, 30, 1920, 1080)
    print("Camera open_cam return:%d" % ret)

    # wait for 1s
    time.sleep(1)

    #get one image from camera   
    img = cam.get_img(2)
    if img is not None:
        #save file
        fo = open("output.img", "wb")
        fo.write(img)
        fo.close()
        print("camera save img file success")
    else:
        print("camera save img file failed")
    
    #close MIPI camera
    cam.close_cam()
    print("test_camera done!!!")

test_camera()
```

【兼容性】

支持 RDK S100、RDK S600。

## set_img

【功能描述】

向`vps`模块输入图像，并触发图像处理操作

【函数声明】  

```python
Camera.set_img(img_obj)
```

【参数描述】  

| 参数名称 | 定义描述     | 取值范围      |
| -------- | -------------------- | ----- |
| img_obj  | 需要处理的图像数据 | 跟 vps 输入尺寸保持一致 |

【使用方法】 

```python
camera = libsrcampy.Camera()

#enable vps function, input: 1080p, output: 512x512
ret = camera.open_vps(1, 1, 1920, 1080, 512, 512)
print("Camera vps return:%d" % ret)

fin = open("output.img", "rb")
img = fin.read()
fin.close()

#send image to vps module
ret = camera.set_img(img)
```

【返回值】  

| 返回值 | 定义描述 |                 
| ------ | ----- |
| 0      | 成功  |
| -1    | 失败 |

【注意事项】 

该接口需要在`open_vps`之后调用

【参考代码】  

```python
import sys, os, time

import numpy as np
import cv2
from hobot_vio import libsrcampy

def test_camera_vps():
    vps = libsrcampy.Camera()

    #enable vps function, input: 1080p, output: 512x512
    ret = vps.open_vps(1, 1, 1920, 1080, 512, 512)
    print("Camera vps return:%d" % ret)

    fin = open("output.img", "rb")
    img = fin.read()
    fin.close()

    #send image data to vps
    ret = vps.set_img(img)
    print ("Process set_img return:%d" % ret)

    fo = open("output_vps.img", "wb+")

    #get image data from vps
    img = vps.get_img()
    if img is not None:
        fo.write(img)
        print("encode write image success")
    else:
        print("encode write image failed")
    fo.close()

    #close vps function
    vps.close_cam()
    print("test_camera_vps done!!!")

test_camera_vps()
```

【兼容性】

支持 RDK S100、RDK S600。

## close_cam

【功能描述】

关闭使能的 MIPI camera 摄像头

【函数声明】  

```python
Camera.close_cam()
```

【参数描述】  

无

【使用方法】 

```python
cam = libsrcampy.Camera()

#open MIPI camera, fps: 30, solution: 1080p
ret = cam.open_cam(0, 1, 30, 1920, 1080)
print("Camera open_cam return:%d" % ret)

#close MIPI camera
cam.close_cam()
```

【返回值】  

无

【注意事项】 

无

【参考代码】  

无

【兼容性】

支持 RDK S100、RDK S600。

## host 编号选择
camera 对应的 host 编号如下图所示

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/20250220-114529.png" alt="Camera对应的host编号示意图" style={{ width: '40%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## 常见问题

### 设置输出宽高时报错

**现象**：调用 `open_vps`/`open_cam` 设置输出宽高后检测报错。

**原因**：S100 对 `VPS` 输出宽度有 16 对齐、高度 2 对齐的要求。

**解决**：将输出宽度调整为满足 16 对齐、高度满足 2 对齐。

### IMX477 切换分辨率后采集异常

**现象**：`IMX477` 摄像头从 `1080P` 切换至其它分辨率后无法正常采集。

**原因**：`IMX477` 分辨率切换需要手动复位。

**解决**：在板端执行 `hobot_reset_camera.py` 完成复位操作。

### get_img 返回 None

**现象**：调用 `get_img` 拿不到图像数据。

**原因**：该方法需在 `open_cam`、`open_vps` 之后调用。

**解决**：确保先调用 `open_cam`/`open_vps`，再调用 `get_img`。

## 相关文档

- [多媒体接口说明](/Simple_API/multimedia_api/pydev/pydev_multimedia_api)
- [Encoder 对象](/Simple_API/multimedia_api/pydev/object_encoder)
- [VIO API](/Simple_API/multimedia_api/cdev/vio_api)
- [Python 多媒体示例](/Demos/multimedia_demo/pydev/pydev_multimedia)
