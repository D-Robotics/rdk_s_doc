---
sidebar_position: 3
title: "Encoder 对象"
description: "Encoder 对象 对象接口说明"
---

# Encoder 对象

> **接口层级**：封装层简易接口（模式 1），底层 MediaCodec 见 [MediaCodec API](/Advanced_development/multimedia_development/multimedia_api/mediacodec_api)。对应 C 接口见 [ENCODER API](/Simple_API/multimedia_api/cdev/encoder_api)。

Encoder 对象实现了对视频数据的编码压缩功能，包含了`encode`、`encode_file`、`get_img`、`close`等几种方法，详细说明如下：

## 方法清单

| 方法名 | 说明 | 所属章节 |
| ------ | ---- | -------- |
| `encode` | 配置并使能 encode 编码模块 | [encode](#encode) |
| `encode_file` | 向使能的编码通道输入图像文件，按预定格式进行编码 | [encode_file](#encode_file) |
| `get_img` | 获取编码后的数据 | [get_img](#get_img) |
| `close` | 关闭使能的编码通道 | [close](#close) |

## encode

【功能描述】

配置并使能 encode 编码模块

【函数声明】

```python
Encoder.encode(video_chn, type, width, height, bits)
```

【参数描述】  

| 参数名称  | 描述           | 取值范围                    |
| --------- | --------------- | ------------------- |
| video_chn | 指定视频编码器的通道号   | 范围0~31 |
| type          | 视频编码类型  | 范围1~3，分别对应`H264`、`H265`、`MJPEG` |
| width     | 输入编码模块的图像宽度      | 不超过4096              |
| height    | 输入编码模块的图像高度      | 不超过4096              |
| bits      | 编码模块的比特率         |    默认8000kbps         |

【使用方法】

```python
#create encode object
encode = libsrcampy.Encoder()

#enable encode channel 0, solution: 1080p, format: H264
ret = encode.encode(0, 1, 1920, 1080)
```

【返回值】  

| 返回值 | 定义描述 |                 
| ------ | ----- |
| 0      | 成功  |
| -1    | 失败   |

【注意事项】

无

【参考代码】

无

## encode_file

【功能描述】

向使能的编码通道输入图像文件，按预定格式进行编码

【函数声明】 

```python
Encoder.encode_file(img)
```

【参数描述】  

| 参数名称 | 描述              | 取值范围                     |
| -------- | ----------------- | --------------------- |
| img      | 需要编码的图像数据，需要使用 NV12格式 | 无 |

【使用方法】 

```python
fin = open("output.img", "rb")
input_img = fin.read()
fin.close()

#input image data to encode
ret = encode.encode_file(input_img)
```

【返回值】  

| 返回值 | 定义描述 |                 
| ------ | ----- |
| 0      | 成功  |
| -1    | 失败   |

【注意事项】 

无

【参考代码】  

无

## get_img

【功能描述】

获取编码后的数据

【函数声明】  

```python
Encoder.get_img()
```

【使用方法】 

无

【参数描述】  

无

【返回值】  

| 返回值 | 定义描述 |
| ------ | ----- |
| PyBytesObject | 成功，返回编码后的数据 |
| None          | 失败 |

【注意事项】 

该接口需要在调用`Encoder.encode()`创建编码通道后使用

【参考代码】  

```python
import sys, os, time

import numpy as np
import cv2
from hobot_vio import libsrcampy

def test_encode():
    #create encode object
    enc = libsrcampy.Encoder()
    ret = enc.encode(0, 1, 1920, 1080)
    print("Encoder encode return:%d" % ret)

    #save encoded data to file
    fo = open("encode.h264", "wb+")
    a = 0
    fin = open("output.img", "rb")
    input_img = fin.read()
    fin.close()
    while a < 100:
        #send image data to encoder
        ret = enc.encode_file(input_img)
        print("Encoder encode_file return:%d" % ret)
        #get encoded data
        img = enc.get_img()
        if img is not None:
            fo.write(img)
            print("encode write image success count: %d" % a)
        else:
            print("encode write image failed count: %d" % a)
        a = a + 1

    enc.close()
    print("test_encode done!!!")

test_encode()
```

## close

【功能描述】

关闭使能的编码通道。

【函数声明】  

```python
Encoder.close()
```

【参数描述】  

无

【使用方法】 

无

【返回值】  

| 返回值 | 定义描述 |
| ------ | ----- |
| 0      | 成功  |
| -1    | 失败   |

【注意事项】 

该接口需要在调用`Encoder.encode()`创建编码通道后使用

【参考代码】  

无

## 相关文档

- [多媒体接口说明](./pydev_multimedia_api)
- [Decoder 对象](./object_decoder)
- [采集→编码](/Demos/multimedia_demo/cdev/vio2encoder)
