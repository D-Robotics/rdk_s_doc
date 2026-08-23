---
sidebar_position: 3
title: "Encoder Object"
description: "Interface description of the Encoder object"
---

# Encoder Object

> **Interface level**: encapsulated simple API (mode 1). For the low-level MediaCodec, see [MediaCodec API](/Advanced_development/multimedia_development/multimedia_api/mediacodec_api). For the corresponding C interfaces, see [ENCODER API](/Simple_API/multimedia_api/cdev/encoder_api).

The Encoder object implements video data encoding and compression. It includes several methods such as `encode`, `encode_file`, `get_img`, and `close`. Detailed descriptions are as follows:

## Method List

| Method Name | Description | Section |
| ------ | ---- | -------- |
| `encode` | Configures and enables the encode module | [encode](#encode) |
| `encode_file` | Inputs an image file to the enabled encoding channel and encodes it in the preset format | [encode_file](#encode_file) |
| `get_img` | Gets the encoded data | [get_img](#get_img) |
| `close` | Closes the enabled encoding channel | [close](#close) |

## encode

[Function Description]

Configures and enables the encode module.

[Function Declaration]

```python
Encoder.encode(video_chn, type, width, height, bits)
```

[Parameter Description]  

| Parameter Name  | Description           | Value Range                    |
| --------- | --------------- | ------------------- |
| video_chn | Channel number of the video encoder   | Range 0~31 |
| type          | Video encoding type  | Range 1~3, corresponding to `H264`, `H265`, and `MJPEG` respectively |
| width     | Image width input to the encoding module      | Up to 4096              |
| height    | Image height input to the encoding module      | Up to 4096              |
| bits      | Bitrate of the encoding module         |    Default is 8000kbps         |

[Usage]

```python
#create encode object
encode = libsrcampy.Encoder()

#enable encode channel 0, solution: 1080p, format: H264
ret = encode.encode(0, 1, 1920, 1080)
```

[Return Value]  

| Return Value | Description |                 
| ------ | ----- |
| 0      | Success  |
| -1    | Failure   |

[Notes]

None

[Reference Code]

None

## encode_file

[Function Description]

Inputs an image file to the enabled encoding channel and encodes it in the preset format.

[Function Declaration] 

```python
Encoder.encode_file(img)
```

[Parameter Description]  

| Parameter Name | Description              | Value Range                     |
| -------- | ----------------- | --------------------- |
| img      | Image data to be encoded; it must be in NV12 format | None |

[Usage] 

```python
fin = open("output.img", "rb")
input_img = fin.read()
fin.close()

#input image data to encode
ret = encode.encode_file(input_img)
```

[Return Value]  

| Return Value | Description |                 
| ------ | ----- |
| 0      | Success  |
| -1    | Failure   |

[Notes] 

None

[Reference Code]  

None

## get_img

[Function Description]

Gets the encoded data.

[Function Declaration]  

```python
Encoder.get_img()
```

[Usage] 

None

[Parameter Description]  

None

[Return Value]  

| Return Value | Description |
| ------ | ----- |
| PyBytesObject | Success, returns the encoded data |
| None          | Failure |

[Notes] 

This interface must be used after calling `Encoder.encode()` to create an encoding channel.

[Reference Code]  

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

[Function Description]

Closes the enabled encoding channel.

[Function Declaration]  

```python
Encoder.close()
```

[Parameter Description]  

None

[Usage] 

None

[Return Value]  

| Return Value | Description |
| ------ | ----- |
| 0      | Success  |
| -1    | Failure   |

[Notes] 

This interface must be used after calling `Encoder.encode()` to create an encoding channel.

[Reference Code]  

None

## FAQ

### encode_file Encoding Result Is Abnormal

**Symptom**: The data encoded by `encode_file` cannot be played normally or is abnormal.

**Cause**: The image data to be encoded must be in `NV12` format.

**Solution**: Feed image data in `NV12` format into `encode_file`.

### get_img Returns None

**Symptom**: Calling `get_img` cannot retrieve the encoded data.

**Cause**: This interface must be called after creating an encoding channel with `encode()`.

**Solution**: Call `encode()` to enable the encoding channel first, then call `get_img`.

## Related Documentation

- [Multimedia Interface Description](./01_pydev_multimedia_api.md)
- [Decoder Object](./04_object_decoder.md)
- [Capture → Encode](/Demos/multimedia_demo/cdev/vio2encoder)
