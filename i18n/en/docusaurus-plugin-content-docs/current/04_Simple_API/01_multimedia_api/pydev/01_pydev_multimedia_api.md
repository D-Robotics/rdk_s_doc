---
sidebar_position: 1
title: "Multimedia Interface Description"
description: "Overview of the RDK Python pydev multimedia interfaces (Camera/Encoder/Decoder/Display)"
---

# Multimedia Interface Description

RDK OS comes pre-installed with the Python multimedia module `libsrcampy` (package name `hobot_vio`), which provides the following objects for camera capture, video encoding/decoding, and display output:

| Object | Function | See Also |
| --- | --- | --- |
| `Camera` | Camera capture (MIPI/USB) | [Camera Object](./object_camera) |
| `Encoder` | Video encoding (H.264/H.265) | [Encoder Object](./object_encoder) |
| `Decoder` | Video decoding | [Decoder Object](./object_decoder) |
| `Display` | Display output (HDMI) | [Display Object](./object_display) |

## Basic Usage

```python
from hobot_vio import libsrcampy

# Create objects
camera = libsrcampy.Camera()
encode = libsrcampy.Encoder()
decode = libsrcampy.Decoder()
display = libsrcampy.Display()

# Typical pipeline: capture -> display
while True:
    frame = camera.get_img()
    display.set_img(frame)
```

## Notes

- Method calls on each object have prerequisites: data processing methods such as `get_img`/`set_img` must be called after the corresponding object is enabled (`open_cam`/`open_vps`/`encode`/`decode`/`display`). See the documentation of each object for details.
- Before exiting the program, call the close interface of each object (`close_cam`/`close`) to release resources and avoid resource leaks.
- After binding modules with `libsrcampy.bind`, data flows automatically. Before exiting, call `libsrcampy.unbind` to unbind the modules and close each object.

## Typical Pipelines

| Pipeline | Object Combination | Corresponding C Example |
| --- | --- | --- |
| Capture → Display | Camera → Display | [Capture → Display](/Demos/multimedia_demo/cdev/vio2display) |
| Capture → Encode | Camera → Encoder | [Capture → Encode](/Demos/multimedia_demo/cdev/vio2encoder) |
| Decode → Display | Decoder → Display | [Decode → Display](/Demos/multimedia_demo/cdev/decode2display) |

## Related Documentation

- [Camera Object](./object_camera)
- [Encoder Object](./object_encoder)
- [Decoder Object](./object_decoder)
- [Display Object](./object_display)
- [Interface Usage Examples](./pydev_api_demo)
- [Python Multimedia Examples](/Demos/multimedia_demo/pydev/pydev_multimedia)
