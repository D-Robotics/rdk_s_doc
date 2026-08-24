---
sidebar_position: 1
title: "Multimedia Interface Description"
description: "Overview of the RDK Python pydev multimedia interfaces (Camera/Encoder/Decoder/Display)"
---

# Multimedia Interface Description

RDK OS comes pre-installed with the Python multimedia module `libsrcampy` (package name `hobot_vio`), which provides the following objects for camera capture, video encoding/decoding, and display output:

| Object | Function | See Also |
| --- | --- | --- |
| `Camera` | Camera capture (MIPI/USB) | [Camera Object](./02_object_camera.md) |
| `Encoder` | Video encoding (H.264/H.265) | [Encoder Object](./03_object_encoder.md) |
| `Decoder` | Video decoding | [Decoder Object](./04_object_decoder.md) |
| `Display` | Display output (HDMI) | [Display Object](./05_object_display.md) |

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
| Capture → Display | Camera → Display | [Capture → Display](../../../03_Demos/02_multimedia_demo/01_cdev/02_vio2display.md) |
| Capture → Encode | Camera → Encoder | [Capture → Encode](../../../03_Demos/02_multimedia_demo/01_cdev/03_vio2encoder.md) |
| Decode → Display | Decoder → Display | [Decode → Display](../../../03_Demos/02_multimedia_demo/01_cdev/05_decode2display.md) |

## FAQ

### get_img/set_img Returns None or Reports an Error

**Symptom**: Calling data processing methods such as `get_img`/`set_img` returns `None` or reports an error.

**Cause**: These methods must be called after the corresponding object is enabled (`open_cam`/`open_vps`/`encode`/`decode`/`display`).

**Solution**: Call the corresponding enable interface first, then call the data processing method.

### Resources Not Released After the Program Exits

**Symptom**: Resources are not released after the program exits, or the next run is affected.

**Cause**: The close interface of each object was not called before exiting, or bound modules were not unbound.

**Solution**: Call `close_cam`/`close` to release resources before exiting; modules bound with `libsrcampy.bind` must be unbound with `libsrcampy.unbind` first.

## Related Documentation

- [Camera Object](./02_object_camera.md)
- [Encoder Object](./03_object_encoder.md)
- [Decoder Object](./04_object_decoder.md)
- [Display Object](./05_object_display.md)
- [Interface Usage Examples](./06_pydev_api_demo.md)
- [Python Multimedia Examples](../../../03_Demos/02_multimedia_demo/02_pydev/01_pydev_multimedia.md)
