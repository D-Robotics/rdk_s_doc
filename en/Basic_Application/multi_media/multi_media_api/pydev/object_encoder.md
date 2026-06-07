# Encoder Object

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Basic_Application/multi_media/multi_media_api/pydev/object_encoder

The Encoder object implements video data encoding and compression functionality and includes several methods such as `encode` , `encode_file` , `get_img` , and `close` . Detailed descriptions are provided below:

## encode

【Function Description】Configures and enables the encode module.

【Function Declaration】
```python
Encoder.encode(video_chn, encode_type, width, height, bits)
```

【Parameter Description】
| Parameter Name | Description | Value Range 
| video_chn | Specifies the channel number of the video encoder | Range: 0–31 
| encode_type | Video encoding type | Range: 1–3, corresponding to `H264` , `H265` , and `MJPEG` respectively 
| width | Image width input to the encoding module | Up to 4096 
| height | Image height input to the encoding module | Up to 4096 
| bits | Bitrate of the encoding module | Default: 8000 kbps 

【Usage】
```python
#create encode object
encode = libsrcampy.Encoder()

#enable encode channel 0, solution: 1080p, format: H264
ret = encode.encode(0, 1, 1920, 1080)
```

【Return Value】
| Return Value | Description 
| 0 | Success 
| -1 | Failure 

【Notes】None

【Reference Code】None

## encode_file

【Function Description】Inputs an image file into an enabled encoding channel and encodes it according to the preset format.

【Function Declaration】
```python
Encoder.encode_file(img)
```

【Parameter Description】
| Parameter Name | Description | Value Range 
| img | Image data to be encoded, must be in NV12 format | None 

【Usage】
```python
fin = open("output.img", "rb")
input_img = fin.read()
fin.close()

#input image data to encode
ret = encode.encode_file(input_img)
```

【Return Value】
| Return Value | Description 
| 0 | Success 
| -1 | Failure 

【Notes】None

【Reference Code】None

## get_img

【Function Description】Retrieves encoded data.

【Function Declaration】
```python
Encoder.get_img()
```

【Usage】None

【Parameter Description】None

【Return Value】
| Return Value | Description 
| 0 | Success 
| -1 | Failure 

【Notes】This interface must be used after calling `Encoder.encode()` to create an encoding channel.

【Reference Code】
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

【Function Description】Closes the enabled encoding channel.

【Function Declaration】
```python
Encoder.close()
```

【Parameter Description】None

【Usage】None

【Return Value】
| Return Value | Description 
| 0 | Success 
| -1 | Failure 

【Notes】This interface must be used after calling `Encoder.encode()` to create an encoding channel.

【Reference Code】None
