---
sidebar_position: 4
title: "DISPLAY (Display Module) API"
description: "DISPLAY (display module) API reference"
---

# DISPLAY (Display Module) API

The `DISPLAY` module provides video image display functionality, displaying `NV12` images on a monitor connected via the `HDMI` interface, and supports drawing rectangles and text on the screen.

- **Interface level**: encapsulated simple API (mode 1). For the low-level DISP, see [DISP API](/Advanced_development/multimedia_development/multimedia_api/disp_api).
- **Applicable scenarios**: capture→display, decode→display. See [Capture→Display](/Demos/multimedia_demo/cdev/vio2display).
- **Prerequisites**: RDK OS is flashed, a compile toolchain is available on the board, and an HDMI monitor is connected.

The `DISPLAY` API provides the following interfaces:

| Function | Description |
| ---- | ----- |
| sp_init_display_module | **Initialize the display module object** |
| sp_release_display_module | **Destroy the display module object** |
| sp_start_display | **Create a video display channel** |
| sp_stop_display | **Close the video display channel** |
| sp_display_set_image | **Send an image to the video display channel** |
| sp_display_draw_rect | **Draw a rectangle on the display channel** |
| sp_display_draw_string | **Draw a string on the display channel** |
| sp_get_display_resolution | **Get the resolution of the monitor** |

## sp_init_display_module  

**[Function Prototype]**  

`void *sp_init_display_module()`

**[Description]**  

Initializes the display module object. This module supports displaying video image data on a monitor connected via the `HDMI` interface, and provides the functionality to draw rectangles and text on the displayed screen.

**[Parameters]**

None

**[Return Value]** 

Returns a `DISPLAY` object pointer on success, and NULL on failure.

## sp_release_display_module  

**[Function Prototype]**  

`void sp_release_display_module(void *obj)`

**[Description]**  

Destroys the `DISPLAY` object.

**[Parameters]**

- `obj`: the already initialized `DISPLAY` object pointer

**[Return Value]** 

None

## sp_start_display  

**[Function Prototype]**  

`int32_t sp_start_display(void *obj, int32_t chn, int32_t width, int32_t height)`

**[Description]**  

Creates a display channel. The RDK S100 development board supports 4 channels: 2 video layers and 2 graphic layers. The maximum supported resolution is `1920 x 1080`, with a maximum frame rate of `60fps`.

**[Parameters]**

- `obj`: the already initialized `DISPLAY` object pointer
- `chn`: the channel number. Supports 0~3. On a desktop system, channel 0 is used by the graphical system, so applications should use channel 1. Channels 2 and 3 are generally used for drawing rectangles or overlaying text information.
- `width`: the display output resolution - width
- `height`: the display output resolution - height

**[Return Value]** 

Returns 0 on success, and -1 on failure

## sp_stop_display  

**[Function Prototype]**  

`int32_t sp_stop_display(void *obj)`

**[Description]**  

Closes the display channel.

**[Parameters]**

- `obj`: the already initialized `DISPLAY` object pointer

**[Return Value]** 

Returns 0 on success, and -1 on failure

## sp_display_set_image  

**[Function Prototype]**  

`int32_t sp_display_set_image(void *obj, char *addr, int32_t size, int32_t chn)`

**[Description]**  

Displays the image data in `addr` on display channel `chn`. Only `NV12` `YUV` images are supported as the image format.

**[Parameters]**

- `obj`: the already initialized `DISPLAY` object pointer
- `addr`: the image data. Only `NV12` is supported as the image format.
- `size`: the image data size, computed by: width * height * 3 / 2
- `chn`: the display channel, corresponding to the channel number used in the `sp_start_display` interface.

**[Return Value]** 

Returns 0 on success, and -1 on failure

## sp_display_draw_rect  

**[Function Prototype]**  

`int32_t sp_display_draw_rect(void *obj, int32_t x0, int32_t y0, int32_t x1, int32_t y1, int32_t chn, int32_t flush, int32_t color, int32_t line_width)`

**[Description]**  

Draws a rectangle on the graphic layer of the display module.

**[Parameters]**

- `obj`: the already initialized `DISPLAY` object pointer
- `x0`: the x value of the first coordinate of the rectangle
- `y0`: the y value of the first coordinate of the rectangle
- `x1`: the x value of the second coordinate of the rectangle
- `y1`: the y value of the second coordinate of the rectangle
- `chn`: the display output layer. 2~3 are graphic layers
- `flush`: whether to clear the buffer of the current graphic layer
- `color`: the rectangle color (color format is ARGB8888)
- `line_width`: the line width of the rectangle

**[Return Value]** 

Returns 0 on success, and -1 on failure

## sp_display_draw_string  

**[Function Prototype]**  

`int32_t sp_display_draw_string(void *obj, int32_t x, int32_t y, char *str, int32_t chn, int32_t flush, int32_t color, int32_t line_width)`

**[Description]**  

Draws a string on the graphic layer of the display module.

**[Parameters]**

- `obj`: the already initialized `DISPLAY` object pointer
- `x`: the x value of the starting coordinate of the string
- `y`: the y value of the starting coordinate of the string
- `str`: the string to draw (must be GB2312 encoded)
- `chn`: the display output layer. 2~3 are graphic layers
- `flush`: whether to clear the buffer of the current graphic layer
- `color`: the rectangle color (color format is ARGB8888)
- `line_width`: the line width of the text

**[Return Value]** 

Returns 0 on success, and -1 on failure

## sp_get_display_resolution  

**[Function Prototype]**  

`void sp_get_display_resolution(int32_t *width, int32_t *height)`

**[Description]**  

Gets the resolution of the currently connected monitor.

**[Parameters]**

- `width`: the resolution to retrieve - width
- `height`: the resolution to retrieve - height

**[Return Value]** 

None.

## Data Structures and Constants

The following constants are defined in `sp_display.h`:

| Constant | Value | Description |
| ---- | --- | ---- |
| `DISPLAY_MODE_DP` | 10 | Display output mode: DP |
| `DISPLAY_MODE_HDMI` | 11 | Display output mode: HDMI |

## Quick Example

The typical call sequence for displaying one image frame (see [Capture→Display](/Demos/multimedia_demo/cdev/vio2display) for a fully compilable example):

```c
void *disp = sp_init_display_module();       // 1. Initialize the DISPLAY object
sp_start_display(disp, /*chn*/1, width, height);  // 2. Create a display channel (use channel 1 on a desktop system)
sp_display_set_image(disp, frame_buffer, size, /*chn*/1);  // 3. Feed in one image frame for display
// ... optionally overlay graphics with sp_display_draw_rect / sp_display_draw_string ...
sp_stop_display(disp);                       // 4. Stop the display channel
sp_release_display_module(disp);             // 5. Destroy the DISPLAY object
```

## FAQ

### Image Cannot Be Displayed or Shows Artifacts

**Symptom**: After calling `sp_display_set_image`, there is no image or the image shows artifacts.

**Cause**: The image data is not in `NV12` format, or the channel number is wrong (on a desktop system, channel 0 is already used by the graphical system).

**Solution**: Ensure the fed data is in `NV12` format; on a desktop system, applications should use channel 1, and use channels 2~3 for overlaying graphics.

### Drawn String Displays Garbled Text

**Symptom**: Text drawn by `sp_display_draw_string` displays as garbled characters.

**Cause**: The string to draw must be `GB2312`-encoded.

**Solution**: Convert the string to `GB2312` encoding before passing it in.

## Related Documentation

- [DECODER API](/Simple_API/multimedia_api/cdev/decoder_api)
- [Display Object](/Simple_API/multimedia_api/pydev/object_display)
- [Capture→Display](/Demos/multimedia_demo/cdev/vio2display)
