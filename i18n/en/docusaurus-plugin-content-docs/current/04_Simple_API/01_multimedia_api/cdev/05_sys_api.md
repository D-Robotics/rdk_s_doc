---
sidebar_position: 5
title: "SYS (Module Binding) API"
description: "SYS (module binding) API reference"
---

# SYS (Module Binding) API

The `SYS` module provides internal binding between the `VIO`, `ENCODER`, `DECODER` and `DISPLAY` modules. Once bound, data flows automatically between them without manual transfer.

- **Interface level**: encapsulated simple API (mode 1).
- **Applicable scenarios**: simplified pipelines for capture→display and capture→encode. See [Multimedia Demos](/Demos/multimedia_demo).
- **Prerequisites**: RDK OS is flashed, and a compile toolchain is available on the board.

The `SYS` API provides the following interfaces:

| Function | Description |
| ---- | ----- |
| sp_module_bind | **Bind a source module and a destination module** |
| sp_module_unbind | **Unbind two modules** |

## sp_module_bind  

**[Function Prototype]**  

`int sp_module_bind(void *src, int32_t src_type, void *dst, int32_t dst_type)`

**[Description]**  

This interface performs internal binding between the outputs and inputs of the four modules `VIO`, `ENCODER`, `DECODER` and `DISPLAY`. Once bound, data flows automatically between the two modules internally without any user operation. For example, after binding `VIO` and `DISPLAY`, the data from an opened MIPI camera is displayed directly on the screen, with no need to call the `sp_vio_get_frame` interface of `VIO` to fetch the data and then call the `sp_display_set_image` interface of `DISPLAY` to display it.

The supported module binding relationships are as follows:

| Source Module | Destination Module |
| ---- | ----- |
| VIO | ENCODER |
| VIO | DISPLAY |
| DECODER | ENCODER |
| DECODER | DISPLAY |

**[Parameters]**

- `src`: the object pointer of the source module (obtained by calling the initialization interface of the corresponding module)
- `src_type`: the source module type. Supports `SP_MTYPE_VIO` and `SP_MTYPE_DECODER`
- `dst`: the object pointer of the destination module (obtained by calling the initialization interface of the corresponding module)
- `dst_type`: the destination module type. Supports `SP_MTYPE_ENCODER` and `SP_MTYPE_DISPLAY`

**[Return Value]**  

Returns 0 on success, and a non-zero value on failure.

## sp_module_unbind  

**[Function Prototype]**  

`int sp_module_unbind(void *src, int32_t src_type, void *dst, int32_t dst_type)`

**[Description]**  

This interface unbinds two modules that have been bound together. Modules must be unbound before they are exited.

**[Parameters]**

- `src`: the object pointer of the source module (obtained by calling the initialization interface of the corresponding module)
- `src_type`: the source module type. Supports `SP_MTYPE_VIO` and `SP_MTYPE_DECODER`
- `dst`: the object pointer of the destination module (obtained by calling the initialization interface of the corresponding module)
- `dst_type`: the destination module type. Supports `SP_MTYPE_ENCODER` and `SP_MTYPE_DISPLAY`

**[Return Value]**  

Returns 0 on success, and a non-zero value on failure.

## Data Structures and Constants

The following module type constants are defined in `sp_sys.h` and are used for the `src_type`/`dst_type` parameters of `sp_module_bind`/`sp_module_unbind`:

| Constant | Value | Description |
| ---- | --- | ---- |
| `SP_MTYPE_VIO` | 0 | Module type: VIO (video input) |
| `SP_MTYPE_ENCODER` | 1 | Module type: ENCODER (encoding) |
| `SP_MTYPE_DECODER` | 2 | Module type: DECODER (decoding) |
| `SP_MTYPE_DISPLAY` | 3 | Module type: DISPLAY (display) |

## Quick Example

The typical call for binding the VIO output to the DISPLAY input (see [Capture→Display](/Demos/multimedia_demo/cdev/vio2display) for the complete example):

```c
// vio and disp are the already initialized VIO / DISPLAY objects respectively
sp_module_bind(vio, SP_MTYPE_VIO, disp, SP_MTYPE_DISPLAY);   // Bind: VIO output -> DISPLAY input
// ... data flows automatically, no manual get/set needed ...
sp_module_unbind(vio, SP_MTYPE_VIO, disp, SP_MTYPE_DISPLAY); // Unbind before exit
```

## Related Documentation

- [VIO API](/Simple_API/multimedia_api/cdev/vio_api)
- [ENCODER API](/Simple_API/multimedia_api/cdev/encoder_api)
