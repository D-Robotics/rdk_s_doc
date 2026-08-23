---
sidebar_position: 5
title: "Display Object"
description: "Interface description of the Display object"
---

# Display Object

> **Interface level**: encapsulated simple API (mode 1). For the low-level DISP, see [DISP API](/Advanced_development/multimedia_development/multimedia_api/disp_api). For the corresponding C interfaces, see [DISPLAY API](/Simple_API/multimedia_api/cdev/display_api).

The Display object implements video display functionality. It can output image data to a monitor via the `HDMI` interface. This object includes methods such as `display`, `set_img`, `set_graph_rect`, `set_graph_word`, and `close`. Detailed descriptions are as follows:

## Method List

| Method Name | Description | Section |
| ------ | ---- | -------- |
| `display` | Initializes the display module and configures display parameters | [display](#display) |
| `set_img` | Inputs display data (NV12 format) to the display module | [set_img](#set_img) |
| `set_graph_rect` | Draws a rectangle on the graphics layer of the display module | [set_graph_rect](#set_graph_rect) |
| `set_graph_word` | Draws characters on the graphics layer of the display module | [set_graph_word](#set_graph_word) |
| `close` | Closes the display module | [close](#close) |
| `libsrcampy.bind` | Binds the output and input data streams of two modules; data flows automatically | [bind Interface](#bind-interface) |
| `libsrcampy.unbind` | Unbinds two previously bound modules | [unbind Interface](#unbind-interface) |

## display
[Function Description]

Initializes the display module and configures display parameters.

[Function Declaration]  

```python
Display.display(chn, width, height, vot_intf, vot_out_mode, chn_width, chn_height)
```

[Parameter Description]  

| Parameter Name     | Description                  | Value Range      |
| ------------ | ----------------------- | ----------------- |
| chn          | Display output interface        | 10: DP output, 11: HDMI output; 0~3 are legacy values (handled as HDMI by default)  |
| width        | Input image width       | Up to 1920 |
| height       | Input image height       | Up to 1080 |
| vot_intf     | Video interface output resolution | Default is 0, 1080p |
| vot_out_mode | Video output interface     | Default is 1, HDMI output |
| chn_width    | Channel output width     | Defaults to the same as width |
| chn_height   | Channel output height     | Defaults to the same as height |

:::info Note

The `chn` parameter has been changed to an output interface selection: `10` means DP (DisplayPort) output, `11` means HDMI output, and `0~3` are legacy values (handled as HDMI by default).

:::

[Usage] 

```python
#create display object
disp = libsrcampy.Display()

#enable display function, solution: 1080p, interface: HDMI
ret = disp.display(0, 1920, 1080, 0, 1)
```

[Return Value]  

| Return Value | Description |
| ------ | ---- |
| 0      | Success |
| -1    | Failure |

[Notes] 

The resolution of the development board's HDMI interface is obtained from the monitor's EDID. Currently only the following resolutions are supported: `1920x1080`, `1280x720`, `1024x600`, and `800x480`. When enabling the display module, make sure the configured resolution matches the actual resolution of the monitor.

[Reference Code]  

None

## set_img

[Function Description]

Inputs display data to the display module. The format must be `NV12`.

[Function Declaration]  

```python
Display.set_img(img, chn)
```

[Parameter Description]  

| Parameter Name     | Description                  | Value Range      |
| ------------ | ----------------------- | ----------------- |
| img          | Image data to be displayed        | NV12 format  |
| chn          | Display output layer        | 0~1 are video layers, default is 0 |

[Usage] 

None

[Return Value]  

| Return Value | Description |
| ------ | ---- |
| 0      | Success |
| -1    | Failure |

[Notes] 

This interface must be used after enabling the display function with the `display` interface. The input data must be in `NV12` format.

[Reference Code]  

```python
import sys, os, time

import numpy as np
import cv2
from hobot_vio import libsrcampy

def test_display():
    #create display object
    disp = libsrcampy.Display()

    #enable display function
    ret = disp.display(0, 1920, 1080, 0, 1)
    print ("Display display 0 return:%d" % ret)

    fo = open("output.img", "rb")
    img = fo.read()
    fo.close()

    #send image data to display
    ret = disp.set_img(img)
    print ("Display set_img return:%d" % ret)

    time.sleep(3)

    disp.close()
    print("test_display done!!!")

test_display()
```

## set_graph_rect

[Function Description]

Draws a rectangle on the graphics layer of the display module.

[Function Declaration]

```python
Display.set_graph_rect(x0, y0, x1, y1, chn, flush, color, line_width)
```

[Parameter Description]

| Parameter Name   | Description             |    Value Range            |
| ---------- | ----------------------- | --------- |
| x0         | X coordinate of the top-left corner of the rectangle   | Must not exceed the video frame size   |
| y0         | Y coordinate of the top-left corner of the rectangle   | Must not exceed the video frame size   |
| x1         | X coordinate of the bottom-right corner of the rectangle   | Must not exceed the video frame size   |
| y1         | Y coordinate of the bottom-right corner of the rectangle   | Must not exceed the video frame size   |
| chn        | Graphics layer channel number |  Range 2~3, default is 2     |
| flush      | Whether to clear the graphics layer buffer   | 0: No, 1: Yes      |
| color      | Rectangle color setting |  ARGB8888 format |
| line_width | Width of the rectangle border        | Range 1~16, default is 4      |

[Usage]

```python
#enable graph layer 2
ret = disp.display(2)
print ("Display display 2 return:%d" % ret)

#set osd rectangle
ret = disp.set_graph_rect(100, 100, 1920, 200, chn = 2, flush = 1,  color = 0xffff00ff)
```

[Return Value]

| Return Value | Description |
| ------ | ---- |
| 0      | Success |
| -1    | Failure |

[Notes]

This interface must be used after enabling the display function with the `display` interface.

[Reference Code]

None

## set_graph_word

[Function Description]

Draws characters on the graphics layer of the display module.

[Function Declaration]

```python
Display.set_graph_word(x, y, str, chn, flush, color, line_width)
```

[Parameter Description]

| Parameter Name   | Description                    | Value Range         |
| ---------- | ---------------------- | ------------- |
| x          | Starting x coordinate of the drawn characters     | Must not exceed the video frame size   |
| y          | Starting y coordinate of the drawn characters   | Must not exceed the video frame size   |
| str        | Character data to be drawn | GB2312 encoding |
| chn        | Graphics layer channel number |  Range 2~3, default is 2     |
| flush      | Whether to clear the graphics layer buffer   | 0: No, 1: Yes      |
| color      | Character color setting |  ARGB8888 format |
| line_width | Width of the character strokes        | Range 1~16, default is 1      |

[Usage]

```python
#enable graph layer 2
ret = disp.display(2)
print ("Display display 2 return:%d" % ret)

#set osd string
string = "horizon"
ret = disp.set_graph_word(300, 300, string.encode('gb2312'), 2, 0, 0xff00ffff)
print ("Display set_graph_word return:%d" % ret)
```

[Return Value]  

| Return Value | Description |
| ------ | ---- |
| 0      | Success |
| -1    | Failure |

[Notes] 

This interface must be used after enabling the display function with the `display` interface.

[Reference Code]  

None

## close

[Function Description]

Closes the display module.

[Function Declaration]  

```python
Display.close()
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

This interface must be used after enabling the display function with the `display` interface.

[Reference Code]  

None

## bind Interface

[Function Description]

This interface can bind the output and input data streams of the `Camera`, `Encoder`, `Decoder`, and `Display` modules. Once bound, data automatically flows between the bound modules without any user action. For example, after binding `Camera` and `Display`, camera data is automatically output to the screen through the display module, with no need to call additional interfaces.

[Function Declaration]
```python
    libsrcampy.bind(src, dst)
```

[Parameter Description]

| Parameter Name | Description         | Value Range |
| -------- | ------------ | --- |
| src      | Source data module   |`Camera`, `Encoder`, `Decoder` modules |
| dst      | Destination data module |`Camera`, `Encoder`, `Decoder`, `Display` modules|

[Usage]

```python
#create camera object
cam = libsrcampy.Camera()
ret = cam.open_cam(0, 1, 30, [1920, 1280], [1080, 720])
print("Camera open_cam return:%d" % ret)

#encode start
enc = libsrcampy.Encoder()
ret = enc.encode(0, 1, 1920, 1080)
print("Encoder encode return:%d" % ret)

#bind, input: cam, output: enc
ret = libsrcampy.bind(cam, enc)
print("libsrcampy bind return:%d" % ret)
```

 [Return Value]

| Return Value | Description |
| ------ | ---- |
| 0      | Success |
| -1    | Failure |

[Notes]

None

[Reference Code]

None

## unbind Interface

[Function Description]

Unbinds two previously bound modules.

[Function Declaration]
```python
libsrcampy.unbind(src, dst)
```

[Parameter Description]

| Parameter Name | Description         | Value Range |
| -------- | ------------ | --- |
| src      | Source data module   |`Camera`, `Encoder`, `Decoder` modules |
| dst      | Destination data module |`Camera`, `Encoder`, `Decoder`, `Display` modules|

[Usage]

```python
#create camera object
cam = libsrcampy.Camera()
ret = cam.open_cam(0, 1, 30, [1920, 1280], [1080, 720])
print("Camera open_cam return:%d" % ret)

#encode start
enc = libsrcampy.Encoder()
ret = enc.encode(0, 1, 1920, 1080)
print("Encoder encode return:%d" % ret)

#bind, input: cam, output: enc
ret = libsrcampy.bind(cam, enc)
print("libsrcampy bind return:%d" % ret)

#unbind, input: cam, output: enc
ret = libsrcampy.unbind(cam, enc)
print("libsrcampy unbind return:%d" % ret)
```

 [Return Value]

| Return Value | Description |
| ------ | ---- |
| 0      | Success |
| -1    | Failure |

[Notes]

None

[Reference Code]

None

## FAQ

### Black Screen or Abnormal Display

**Symptom**: After calling `set_img`, there is no image or the display is abnormal.

**Cause**: The enabled resolution does not match the actual monitor resolution, or the fed data is not in `NV12` format, or the display function is not enabled.

**Solution**: Match the enabled resolution to the monitor's EDID-supported resolutions (1920x1080, 1280x720, 1024x600, 800x480), use `NV12` data, and make sure the display is enabled with `display` first.

### Drawn Characters Display Garbled Text

**Symptom**: Characters drawn by `set_graph_word` display as garbled text.

**Cause**: The character data must be `GB2312`-encoded.

**Solution**: Encode the characters with `GB2312` before passing them in (e.g. `string.encode('gb2312')`).

### How to Choose the Output Interface via the chn Parameter

**Symptom**: You are unsure what value to fill in for the `chn` parameter of `display`.

**Cause**: The `chn` parameter has been changed to an output interface selection.

**Solution**: `10` means DP (DisplayPort) output, `11` means HDMI output, and `0~3` are legacy values (handled as HDMI by default).

## Related Documentation

- [Multimedia Interface Description](/Simple_API/multimedia_api/pydev/pydev_multimedia_api)
- [Camera Object](/Simple_API/multimedia_api/pydev/object_camera)
- [Capture → Display](/Demos/multimedia_demo/cdev/vio2display)
