---
sidebar_position: 5
title: "SYS (Module Binding) API"
description: "SYS (module binding) API reference"
---

# SYS (Module Binding) API

The `SYS` module provides internal binding between the `VIO`, `ENCODER`, `DECODER` and `DISPLAY` modules. Once bound, data flows automatically between them without manual transfer.

- **Interface level**: encapsulated simple API (mode 1).
- **Applicable scenarios**: simplified pipelines for capture→display and capture→encode. See [Multimedia Demos](../../../03_Demos/02_multimedia_demo/01_cdev/01_vio_capture.md).
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

**Note**:

The source/destination module objects must be initialized first. Only the four binding relationships VIO→ENCODER, VIO→DISPLAY, DECODER→ENCODER and DECODER→DISPLAY are supported.

**Compatibility**:

Supports RDK S100 and RDK S600.

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

**Note**:

The parameters must be consistent with those used when binding with `sp_module_bind`. The modules must be unbound via this interface before exiting.

**Compatibility**:

Supports RDK S100 and RDK S600.

## Data Structures and Constants

The following module type constants are defined in `sp_sys.h` and are used for the `src_type`/`dst_type` parameters of `sp_module_bind`/`sp_module_unbind`:

| Constant | Value | Description |
| ---- | --- | ---- |
| `SP_MTYPE_VIO` | 0 | Module type: VIO (video input) |
| `SP_MTYPE_ENCODER` | 1 | Module type: ENCODER (encoding) |
| `SP_MTYPE_DECODER` | 2 | Module type: DECODER (decoding) |
| `SP_MTYPE_DISPLAY` | 3 | Module type: DISPLAY (display) |

## Quick Example

The typical call for binding the VIO output to the DISPLAY input (see [Capture→Display](../../../03_Demos/02_multimedia_demo/01_cdev/02_vio2display.md) for the complete example):

```c
// vio and disp are the already initialized VIO / DISPLAY objects respectively
sp_module_bind(vio, SP_MTYPE_VIO, disp, SP_MTYPE_DISPLAY);   // Bind: VIO output -> DISPLAY input
// ... data flows automatically, no manual get/set needed ...
sp_module_unbind(vio, SP_MTYPE_VIO, disp, SP_MTYPE_DISPLAY); // Unbind before exit
```

## FAQ

### sp_module_bind Returns a Failure

**Symptom**: Calling `sp_module_bind` to bind two modules returns a failure.

**Cause**: The binding relationship is not in the supported list (only VIO→ENCODER, VIO→DISPLAY, DECODER→ENCODER, DECODER→DISPLAY).

**Solution**: Check whether the source/destination module types conform to the supported binding relationships.

### Abnormal Exit or Unreleased Resources

**Symptom**: The program exits abnormally or the next run is affected.

**Cause**: The modules were not unbound with `sp_module_unbind` before exiting.

**Solution**: Call `sp_module_unbind` to unbind the modules before exiting.

## Related Documentation

- [VIO API](./01_vio_api.md)
- [ENCODER API](./02_encoder_api.md)
