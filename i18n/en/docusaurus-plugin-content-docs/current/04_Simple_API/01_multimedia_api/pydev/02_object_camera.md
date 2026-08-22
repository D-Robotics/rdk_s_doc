---
sidebar_position: 2
title: "Camera Object"
description: "Interface description of the Camera object"
---

# Camera Object

> **Interface level**: encapsulated simple API (mode 1). For the low-level VIO primitives, see [VIO API](/Advanced_development/multimedia_development/multimedia_api/vio_api). For the corresponding C interfaces, see [VIO API](/Simple_API/multimedia_api/cdev/vio_api).

The Camera object is used for image capture and processing of MIPI cameras. It includes several methods such as `open_cam`, `open_vps`, `get_img`, `set_img`, and `close_cam`. Detailed descriptions are as follows:

## Method List

| Method Name | Description | Section |
| ------ | ---- | -------- |
| `open_cam` | Opens the MIPI camera on the specified channel and sets the camera output frame rate and resolution format | [open_cam](#open_cam) |
| `open_vps` | Enables the vps image processing function of the specified camera channel, supporting scaling, cropping, and rotation | [open_vps](#open_vps) |
| `get_img` | Gets the image output of the camera object | [get_img](#get_img) |
| `set_img` | Inputs an image to the vps module and triggers image processing operations | [set_img](#set_img) |
| `close_cam` | Closes the enabled MIPI camera | [close_cam](#close_cam) |

## open_cam

[Function Description]  

Opens the MIPI camera on the specified channel and sets the camera output frame rate and resolution format.

[Function Declaration]  

```python
Camera.open_cam(pipe_id, video_index, fps, width, height, raw_height, raw_width)
```

[Parameter Description]  

| Parameter Name      | Description                  | Value Range    |
| ----------- | ------------------------ | --------  |
| pipe_id     | Pipeline channel number corresponding to the camera  | Starts from 0 by default, range 0~7  |
| video_index | Host number corresponding to the camera; -1 means auto-detection | Values: -1, 0, 1, 2. Refer to the Host ID Selection section |
| fps         | Camera image output frame rate          | Depends on the camera model; default is 30   |
| width       | Final image output width of the camera    | Depends on the camera model; default is 1920 |
| height      | Final image output height of the camera  | Depends on the camera model; default is 1080 |
| raw_height       | Original RAW image output height of the camera    | Default is -1 (not set)|
| raw_width      | Original RAW image output width of the camera  | Default is -1 (not set)|

[Usage] 

```python
#create camera object
camera = libsrcampy.Camera()

#open MIPI Camera, fps: 30, solution: 1080p
ret = camera.open_cam(0, -1, 30, 1920, 1080)
```

[Return Value]  

| Return Value | Description |
| ------ | ----- |
| 0      | Success  |
| -1    | Failure |

[Notes] 

The `width` and `height` parameters support `list` type input, which enables the camera to output multiple groups of different resolutions. The `list` supports up to 6 scale-down groups, and the scaling range is [1, 1/64) of the camera's original resolution. Usage is as follows:

```python
ret = cam.open_cam(0, -1, 30, [1920, 1280], [1080, 720])
```

`raw_height` and `raw_width` only need to be set when the camera is not used at its default resolution. For example, when using an `IMX477` camera, if you want to output both 4k resolution (3840x2160) and 1080P resolution (1920x1080) at the same time, you can use it as follows:
```python
cam.open_cam(0, -1, 10, [3840, 1920], [2160, 1080], 3000, 4000)
```

The currently supported camera resolutions are listed in the table below:

| camera | Resolution |
| ---- | ----- |
|IMX219|1920x1080@30fps(default)|

:::info Note!

Switching the `IMX477` from `1080P` resolution to other resolutions requires a manual reset. You can run `hobot_reset_camera.py` on the board to perform the reset.

:::

:::info Note!

The `S100` chip has alignment requirements for `VPS` output: the output width must be 16-aligned, and the output height must be 2-aligned. If the width and height you set do not meet the alignment requirements, an error will be reported.

:::

[Reference Code]  

None

## open_vps

[Function Description]

Enables the vps (video process) image processing function of the specified camera channel, supporting scaling, cropping, and other operations on the input image.

[Function Declaration]  

```python
Camera.open_vps(pipe_id, proc_mode, src_width, src_height, dst_width, dst_height, crop_rect, rotate, src_size, dst_size)
```

[Parameter Description]  


| Parameter Name      | Description                  | Value Range    |
| ----------- | ------------------------ | --------  |
| pipe_id    | Pipeline channel number corresponding to the camera  | Starts from 0 by default, range 0~7  |
| proc_mode  | Image processing mode configuration, supporting scaling, cropping, and rotation   | Range 1~4, representing `scaling`, `scaling + cropping`, `scaling + rotation`, and `scaling + cropping + rotation` respectively |
| src_width  | Input image width                 | Depends on the camera output width |
| src_height | Input image height                 | Depends on the camera output height |
| dst_width  | Output image width | [1, 1/64) times the input width |
| dst_height | Output image height | [1, 1/64) times the input height |
| crop_rect  | Cropping region, input format [x, y, width, height] | Must not exceed the input image size |
| rotate     | Rotation angle; up to two channels support rotation | Range 0~3, representing `no rotation`, `90 degrees`, `180 degrees`, and `270 degrees` respectively |
| src_size | Reserved parameter | No configuration required by default |
| dst_size | Reserved parameter | No configuration required by default |

[Usage] 

```python
#create camera object
camera = libsrcampy.Camera()

#enable vps function
ret = camera.open_vps(1, 1, 1920, 1080, 512, 512)
```

[Return Value]  

| Return Value | Description |                 
| ------ | ----- |
| 0      | Success  |
| -1    | Failure |

:::info Note!
- The vps processing function supports up to 6 output channels and only supports scaling down. The scaling ratio range is [1, 1/64). Multi-channel configuration is passed via the input parameter `list`.
- The image cropping function takes the top-left corner of the image as the origin and crops according to the configured size.
- Image cropping is performed before the scaling and rotation operations. Multi-channel configuration is passed via the input parameter `list`.
:::


:::info Note!

The `S100` chip has alignment requirements for `VPS` output: the output width must be 16-aligned, and the output height must be 2-aligned. If the width and height you set do not meet the alignment requirements, an error will be reported.

:::

```python
#creat camera object
camera = libsrcampy.Camera()

#enable vps function
#input: 4k, output0: 1080p, output1: 720p
#ouput0 croped by [2560, 1440]
ret = camera.open_vps(0, 1, 3840, 2160, [1920, 1280], [1080, 720], [2560, 1440])
```

[Reference Code]  
None

## get_img

[Function Description]

Gets the image output of the camera object. It must be called after `open_cam` and `open_vps`.

[Function Declaration] 

```python
Camera.get_img(module, width, height)
```

[Parameter Description]  

| Parameter Name | Description                 | Value Range     |
| -------- | ------- | ----------- |
| module   | Module from which to get the image | Default is 2 |
| width    | Width of the image to get | Output width set by `open_cam` and `open_vps` |
| height   | Height of the image to get | Output height set by `open_cam` and `open_vps` |


[Usage] 

```python
cam = libsrcampy.Camera()

#open MIPI Camera, fps: 30, solution: 1080p
ret = cam.open_cam(0, 1, 30, 1920, 1080)

#wait for 1s
time.sleep(1)

#get one image from camera
img = cam.get_img(2)
```

[Return Value]  

| Return Value | Description |                 
| ------ | ----- |
| PyBytesObject | Success, returns the image data |
| None          | Failure |

[Notes] 

This method must be called after `open_cam` and `open_vps`.  

[Reference Code]  

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

## set_img

[Function Description]

Inputs an image to the `vps` module and triggers image processing operations.

[Function Declaration]  

```python
Camera.set_img(img)
```

[Parameter Description]  

| Parameter Name | Description     | Value Range      |
| -------- | -------------------- | ----- |
| img      | Image data to be processed | Must match the vps input size |

[Usage] 

```python
camera = libsrcampy.Camera()

#enable vps function, input: 1080p, output: 512x512
ret = camera.open_vps(1, 1, 1920, 1080, 512, 512)
print("Camera vps return:%d" % ret)

fin = open("output.img", "rb")
img = fin.read()
fin.close()

#send image to vps module
ret = vps.set_img(img)
```

[Return Value]  

| Return Value | Description |                 
| ------ | ----- |
| 0      | Success  |
| -1    | Failure |

[Notes] 

This interface must be called after `open_vps`.

[Reference Code]  

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

## close_cam

[Function Description]

Closes the enabled MIPI camera.

[Function Declaration]  

```python
Camera.close_cam()
```

[Parameter Description]  

None

[Usage] 

```python
cam = libsrcampy.Camera()

#open MIPI camera, fps: 30, solution: 1080p
ret = cam.open_cam(0, 1, 30, 1920, 1080)
print("Camera open_cam return:%d" % ret)

#close MIPI camera
cam.close_cam()
```

[Return Value]  

None

[Notes] 

None

[Reference Code]  

None
## Host ID Selection
The host number corresponding to the camera is shown in the figure below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/20250220-114529.png" alt="Diagram of the host number corresponding to the Camera" style={{ width: '40%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## Related Documentation

- [Multimedia Interface Description](/Simple_API/multimedia_api/pydev/pydev_multimedia_api)
- [Encoder Object](/Simple_API/multimedia_api/pydev/object_encoder)
- [VIO API](/Simple_API/multimedia_api/cdev/vio_api)
- [Python Multimedia Examples](/Demos/multimedia_demo/pydev/pydev_multimedia)
