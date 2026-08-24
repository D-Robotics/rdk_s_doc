---
sidebar_position: 4
title: "sample_pym User Guide"
description: "sample_pym User Guide: on-board sample usage guide"
---

# sample_pym User Guide

## Function Overview
sample_pym reads a YUV file into memory allocated via hbm, passes it to PYM, which processes it in a pyramid-layer manner, and finally dumps the processed YUV data to the file system.

### Code Location and Directory Structure
- Code location: `/app/multimedia_samples/sample_pym`
- Directory structure:
```
sample_pym/
├── Makefile
└── sample_pym.c
```

## Compilation

Run the `make` command in the source directory to complete compilation:

```Shell
cd /app/multimedia_samples/sample_pym
make
```

## Execution

### How to Run the Program
Execute the program `./sample_pym` directly to display help information:

### Program Argument Options
```
./sample_pym
Usage: sample_pym [OPTIONS]
Options:
-i, --input_file FILE   Specify the input file
-w, --input_width WIDTH Specify the input width
-h, --input_height HEIGHT       Specify the input height
-f, --feedback                  Specify feedback mode
-V, --verbose           Enable verbose mode
```
- `-i`: Specifies the input YUV file. The test program uses NV12-format files as input.
- `-w`: Width of the input YUV image.
- `-h`: Height of the input YUV image.
- `-f`: Specifies the PYM operating mode. By default, it runs in vflow mode.
- `-V`: Enable verbose mode, printing more runtime information.

### Execution Result
Taking a YUV image with an input resolution of 1920 x 1080 as an example, run `./sample_pym -i /app/res/assets/nv12_1920x1080.yuv -w 1920 -h 1080`.

This feeds a YUV image into PYM, initializes six channels, and performs downscaling at ratios of 1, 1/2, 1/4, 1/8, 1/16, and 1/32 respectively, then saves the processed images as YUV images:

  - Channel 0 outputs the original resolution of the input image: 1920 x 1080.
  - Channel 1 outputs the result with width and height each reduced by 2x: 960 x 540.
  - Channel 2 outputs the result with width and height each reduced by 4x: 480 x 270.
  - Channel 3 outputs the result with width and height each reduced by 8x: 240 x 134.
  - Channel 4 outputs the result with width and height each reduced by 16x: 120 x 66.
  - Channel 5 outputs the result with width and height each reduced by 32x: 60 x 32.

Output log is as follows:
```
pym vnode work mode: vflow
Using input file:/app/res/assets/nv12_1920x1080.yuv, input:1920x1080
(read_yuvv_nv12_file):file read(/app/res/assets/nv12_1920x1080.yuv), y-size(2073600)

pym config:
        ichn input width = 1920, height = 1080
        ochn[0] ratio= 1, width = 1920, height = 1080 wstride=1920 vstride=1080 out[1920*1080]
        ochn[1] ratio= 2, width = 960, height = 540 wstride=960 vstride=540 out[960*540]
        ochn[2] ratio= 4, width = 480, height = 270 wstride=480 vstride=270 out[480*270]
        ochn[3] ratio= 8, width = 240, height = 134 wstride=240 vstride=134 out[240*134]
        ochn[4] ratio= 16, width = 120, height = 66 wstride=128 vstride=66 out[120*66]
        ochn[5] ratio= 32, width = 60, height = 32 wstride=64 vstride=32 out[60*32]
```

Note:
1. The width output by the PYM module is aligned to 16 bytes. When viewing images, note that the `width` and `wstride` parameters may differ.

## FAQ

### Abnormal Output Caused by Input YUV Mismatching the Parameters

**Symptom**: After running `./sample_pym -i <file> -w <width> -h <height>`, the output pyramid image is garbled or has an incorrect size.

**Cause**: The actual resolution/format of the input YUV file does not match the `-w`/`-h` parameters (this sample uses NV12-format input).

**Solution**: Confirm that the input file is in NV12 format and that the width/height parameters match the actual file. Note that the PYM output width is aligned to 16 bytes; when viewing the output, distinguish between `width` and `wstride`.

### Difference Between feedback and vflow Modes

**Symptom**: The `-f` parameter (feedback mode) behaves differently from the default vflow mode, and the fed-back data is not processed.

**Cause**: In feedback mode, the input image must be sent manually via `hbn_vnode_sendframe`; in vflow mode, PYM is connected as a vnode into vflow and flows automatically.

**Solution**: Use `-f` when debugging by feeding back a single image; use the default vflow mode when used in a pipeline, referring to `sample_pipeline`.

## Related Documentation

- [Sample Code Introduction](./01_overview.md)
- [Multimedia API Reference](../01_multimedia_api/01_hbn_api.md)
