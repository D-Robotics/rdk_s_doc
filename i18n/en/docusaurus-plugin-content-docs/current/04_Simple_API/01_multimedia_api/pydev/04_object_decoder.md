---
sidebar_position: 4
title: "Decoder Object"
description: "Interface description of the Decoder object"
---

# Decoder Object

> **Interface level**: encapsulated simple API (mode 1). For the low-level MediaCodec, see [MediaCodec API](/Advanced_development/multimedia_development/multimedia_api/mediacodec_api). For the corresponding C interfaces, see [DECODER API](/Simple_API/multimedia_api/cdev/decoder_api).

The Decoder object implements video data decoding. It includes several methods such as `decode`, `set_img`, `get_img`, and `close`. Detailed descriptions are as follows:

## Method List

| Method Name | Description | Section |
| ------ | ---- | -------- |
| `decode` | Enables the decode module and decodes a video file | [decode](#decode) |
| `get_img` | Gets the output result of the decoding module | [get_img](#get_img) |
| `set_img` | Feeds a single frame of encoded data into the decoding module for decoding | [set_img](#set_img) |
| `close` | Closes the decoding module | [close](#close) |

## decode

[Function Description]

Enables the decode module and decodes a video file.

[Function Declaration]  

```python
Decoder.decode(file, video_chn, type, width, height)
```

[Parameter Description]  

| Parameter Name  | Description           | Value Range                    |
| --------- | --------------- | ------------------- |
| file      | Name of the file to be decoded     |       None       |
| video_chn | Channel number of the video decoder   | Range 0~31 |
| type        | Video decoding type  | Range 1~3, corresponding to `H264`, `H265`, and `MJPEG` respectively |
| width     | Image width input to the decoding module      | Up to 4096              |
| height    | Image height input to the decoding module      | Up to 4096              |

[Usage] 

```python
#create decode object
dec = libsrcampy.Decoder()

#enable decode channel 0, solution: 1080p, format: H264
ret = dec.decode("encode.h264", 0, 1, 1920, 1080)
```

 [Return Value]  

The return value is a `list` with 2 members

| Return Value                | Description      |
| ---------------- | ----------- |
| list[0] | 0: decoding succeeded, -1: decoding failed      | 
| list[1] | Number of frames in the input bitstream file; valid when decoding succeeds     |

[Notes] 

None

[Reference Code]  

None

## get_img

[Function Description]

Gets the output result of the decoding module.

[Function Declaration]
```python
Decoder.get_img()
```

[Parameter Description]

None

[Usage]

```python
ret = dec.decode("encode.h264", 0, 1, 1920, 1080)
print ("Decoder return:%d frame count: %d" %(ret[0], ret[1]))

img = dec.get_img()
```

[Return Value]

| Return Value | Description |
| ------ | ----- |
| PyBytesObject | Success, returns the decoded image data |
| None          | Failure |

[Notes]

This interface must be used after calling `Decoder.decode()` to create a decoding channel.

[Reference Code]

```python
import sys, os, time

import numpy as np
import cv2
from hobot_vio import libsrcampy

def test_decode():
    #create decode object
    dec = libsrcampy.Decoder()

    #enable decode function
    #decode input: encode.h264, solution: 1080p, format: h264
    ret = dec.decode("encode.h264", 0, 1, 1920, 1080)
    print ("Decoder return:%d frame count: %d" %(ret[0], ret[1]))
    
    #get decoder output
    img = dec.get_img()
    if img is not None:
        #save file
        fo = open("output.img", "wb")
        fo.write(img)
        fo.close()
        print("decode save img file success")
    else:
        print("decode save img file failed")

    dec.close()
    print("test_decode done!!!")

test_decode()
```

## set_img

[Function Description]

Feeds a single frame of encoded data into the decoding module for decoding.

[Function Declaration]  

```python
Decoder.set_img(img, chn, eos)
```

[Parameter Description]  

| Parameter Name | Description         | Value Range |
| -------- | ------------- | --- | 
| img      | Single frame of data to be decoded | None |
| chn      | Decoder channel number      | Range 0~31 |
| eos      | Whether decoding data has ended   | 0: not ended, 1: ended |

[Usage] 

None

[Return Value]  

| Return Value | Description |
| ------ | ---- |
| 0      | Success |
| -1    | Failure |

[Notes] 

This interface must be used after calling `Decoder.decode()` to create a decoding channel, and when creating the decoding channel the `file` argument must be left empty.

[Reference Code]  

```python
import sys, os, time

import numpy as np
import cv2
from hobot_vio import libsrcampy

def test_cam_bind_encode_decode_bind_display():
    #camera start
    cam = libsrcampy.Camera()
    # If you know the pipe_id and video_index, you can specify the first two arguments.
    # ret = cam.open_cam(0, 1, 30, [1920, 1280], [1080, 720])

    # If you do not know the pipe_id and video_index, you can use the following
    # code to detect them, and it will default to using the first detected camera.
    ret = cam.open_cam(0, -1, 30, [1920, 1280], [1080, 720])
    print("Camera open_cam return:%d" % ret)

    #enable encoder
    enc = libsrcampy.Encoder()
    ret = enc.encode(0, 1, 1920, 1080)
    print("Encoder encode return:%d" % ret)

    #enable decoder
    dec = libsrcampy.Decoder()
    ret = dec.decode("", 0, 1, 1920, 1080)
    print ("Decoder return:%d frame count: %d" %(ret[0], ret[1]))

    ret = libsrcampy.bind(cam, enc)
    print("libsrcampy bind return:%d" % ret)

    a = 0
    while a < 100:
        #get encode image from encoder
        img = enc.get_img()
        if img is not None:
            #send encode image to decoder
            dec.set_img(img)
            print("encode get image success count: %d" % a)
        else:
            print("encode get image failed count: %d" % a)
        a = a + 1

    ret = libsrcampy.unbind(cam, enc)
    dec.close()
    enc.close()
    cam.close_cam()
    print("test_cam_bind_encode_decode_bind_display done!!!")

test_cam_bind_encode_decode_bind_display()
```

## close

[Function Description]

Closes the decoding module.

[Function Declaration]
```python
Decoder.close()
```

[Parameter Description]

None

[Usage] 

None

[Return Value]

| Return Value | Description |
| ------ | ---- |
| 0      | Success |
| -1    | Failure |

[Notes]

The `close` interface must be called when exiting the program to release resources.

[Reference Code]

None

## FAQ

### set_img Single-Frame Decoding Fails

**Symptom**: Calling `set_img` to feed a single frame for decoding reports an error or fails.

**Cause**: This interface must be called after creating a decoding channel with `decode()`, and the `file` argument must be left empty when creating the channel.

**Solution**: Create the decoding channel with `decode("", ...)` and then call `set_img`; to decode a file, pass the file name directly to `decode`.

### get_img Returns None

**Symptom**: Calling `get_img` cannot decode image data.

**Cause**: This interface must be called after creating a decoding channel with `decode()`.

**Solution**: Call `decode()` to enable the decoding channel first, then call `get_img`.

### How to Check Whether File Decoding Succeeded

**Symptom**: You are unsure whether `decode` succeeded in decoding the file.

**Cause**: The return value of `decode` is a `list` with 2 members.

**Solution**: `list[0]` is 0 on success and -1 on failure; `list[1]` is the number of frames in the input bitstream file (valid on success).

## Related Documentation

- [Multimedia Interface Description](/Simple_API/multimedia_api/pydev/pydev_multimedia_api)
- [Encoder Object](/Simple_API/multimedia_api/pydev/object_encoder)
- [Decode → Display](/Demos/multimedia_demo/cdev/decode2display)
