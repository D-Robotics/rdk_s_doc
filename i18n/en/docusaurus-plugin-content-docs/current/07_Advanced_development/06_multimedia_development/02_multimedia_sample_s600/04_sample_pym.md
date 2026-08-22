---
sidebar_position: 4
title: "sample_pym User Guide"
description: "sample_pym User Guide - On-board sample usage instructions"
---
# sample_pym User Guide  
## Function Overview  
sample_pym reads a YUV file into memory allocated by hbm and passes it to the PYM. The PYM processes the data in pyramid layers and finally dumps the processed YUV data into the file system.  

### Code Location and Directory Structure  
- Code location: `/app/multimedia_samples/sample_pym`  
- Directory structure:  
```
sample_pym/
├── Makefile
└── sample_pym.c
```

## Compilation  

Run the `make` command in the source code path to complete the compilation:  

```Shell
cd /app/multimedia_samples/sample_pym
make
```

## Running  
### How to Run the Program  
Execute the program directly with `./sample_pym` to get help information:  

### Program Parameter Options  
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
- i: Specify the input YUV file. The test program uses a file in NV12 format as input.  
- w: Width of the input YUV image.  
- h: Height of the input YUV image.  
- f: Specify the PYM operation mode. The default mode is Vflow.  

### Running Effect  
Take a YUV image with an input resolution of 1920 x 1080 as an example: run `./sample_pym -i /app/res/assets/nv12_1920x1080.yuv -w 1920 -h 1080`.  

Feed a YUV image into the PYM, initialize 6 channels, perform scaling operations at ratios of 1, 1/2, 1/4, 1/8, 1/16, and 1/32 respectively, and save the processed images as YUV images:  

  - Channel 0 outputs the original resolution of the input image: 1920 x 1080.  
  - Channel 1 outputs an image scaled down by a factor of 2 in both width and height: 960 x 540.  
  - Channel 2 outputs an image scaled down by a factor of 4 in both width and height: 480 x 270.  
  - Channel 3 outputs an image scaled down by a factor of 8 in both width and height: 240 x 134.  
  - Channel 4 outputs an image scaled down by a factor of 16 in both width and height: 120 x 66.  
  - Channel 5 outputs an image scaled down by a factor of 32 in both width and height: 60 x 32.  

The output log is as follows:  
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
1. The width output by the PYM module is aligned to 16 bytes. When viewing the image, pay attention to cases where the `width` and `wstride` parameters differ.

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

- [Sample Code Introduction](/Advanced_development/multimedia_development/multimedia_sample_s600/overview)
- [Multimedia API Reference](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
