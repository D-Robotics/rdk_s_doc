---
sidebar_position: 6
title: "sample_codec User Guide"
description: "sample_codec usage instructions - on-board sample usage instructions"
---

# sample_codec User Guide
## Function Overview
sample_codec is a sample program for video encoding and decoding. It performs video encoding and decoding according to the configuration items defined in the configuration file (`codec_config.ini`), helping users debug the video codec.

### Data Flow Description
#### Encoding Data Flow

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/sample_codec_encode_data_flow.png" alt="Encoding Data Flow Diagram" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

#### Decoding Data Flow


<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/sample_codec_decode_data_flow.png" alt="Decoding Data Flow Diagram" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Code Location and Directory Structure

- Code location: `/app/multimedia_samples/sample_codec`
- Directory structure:
```
sample_codec/
├── 1280x720_NV12.yuv
├── 1920x1080_NV12.yuv
├── 640x480_30fps.h264
├── codec_config.ini
├── Makefile
├── Readme.md
├── sample_codec.c
└── sample_codec.h
```

## Compilation

- Enter the sample_codec directory and run `make` to compile.
- The output artifact is `sample_codec` located in the sample_codec source directory.

**Note:** The sample resource files `1280x720_NV12.yuv`, `1920x1080_NV12.yuv`, and `640x480_30fps.h264` are already prepared in the sample code directory. You can use these files to quickly run 720P and 1080P resolution encoding examples and a 640 x 480 resolution H264 decoding example. To run encoding/decoding tasks at other resolutions, refer to the `codec_config.ini` configuration to add or modify configuration items, and prepare the input files.

## Running

### How to Run the Program

Run `./sample_codec -h` to get help information:

### Program Command-Line Options
```
./sample_codec -h
Usage: sample_codec -f config_file [-e encode_option] [-d decode_option] [-v] [-h]
Options:
  -f, --config_file FILE     Set the configuration file
  -e, --encode [OPTION]      Set the encoding option (optional), override encode_streams option
  -d, --decode [OPTION]      Set the decoding option (optional), override decode_streams option
  -v, --verbose              Enable verbose mode
  -h, --help                 Print this help message

Examples:
  Start codec video with codec_config.ini:
    sample_codec

  Start the specified encoding stream in codec_config.ini:
    sample_codec -e 0x1  -- Start the venc_stream1
    sample_codec -e 0x3  -- Start the venc_stream1 and venc_stream2

  Start the specified decoding stream in codec_config.ini:
    sample_codec -d 0x1  -- Start the vdec_stream1
    sample_codec -d 0x3  -- Start the vdec_stream1 and vdec_stream2

  Enable verbose mode for detailed logging:
    sample_codec -v

  Display this help message:
    sample_codec -h
```
**Options:**

- `-f, --config_file FILE`: Specifies the path to the configuration file (optional). The default value is `codec_config.ini`.
- `-e, --encode [OPTION]`: Sets the encoding option (optional). If this option is used, it overrides the `encode_streams` option in the configuration file.
- `-d, --decode [OPTION]`: Sets the decoding option (optional). If this option is used, it overrides the `decode_streams` option in the configuration file.
- `-v, --verbose`: Enables verbose mode to display more log information.
- `-h, --help`: Displays help information.

#### Usage Examples

- Starts encoding/decoding with the configuration items in `codec_config.ini` by default (one H264 encoding stream is enabled by default: `encode_streams = 0x1`); no arguments are needed when running the program:

  ```
  ./sample_codec
  ```

- Starts the specified encoding streams (defined in `codec_config.ini`):

  ```
  ./sample_codec -e 0x1  # Start venc_stream1
  ./sample_codec -e 0x3  # Start venc_stream1 and venc_stream2
  ```

- Starts the specified decoding streams (defined in `codec_config.ini`):

  ```
  ./sample_codec -e 0 -d 0x1 # Disable encoding, start vdec_stream1
  ./sample_codec -e 0 -d 0x3  # Disable encoding, start vdec_stream1 and vdec_stream2
  ```

- Enables verbose mode to get more log information:

  ```
  ./sample_codec -v
  ```

- Displays help information:

  ```
  ./sample_codec -h
  ```

### Configuration File Description

The `codec_config.ini` configuration defines various video encoding and decoding parameters and sets the default number of encoding/decoding channels to start.

The encoding parameter options are described as follows:

```
[encode]
; Enable encoding, using bitwise operations
; 0x0 means encoding is disabled
; 0x01 means only the venc_stream1 encoding stream is enabled
; 0x02 means only the venc_stream2 encoding stream is enabled
; 0x03 means only the first two encoding streams (venc_stream1 and venc_stream2) are enabled, 0x07 means the first three encoding streams are enabled, 0x0f means the first four encoding streams are enabled, and so on
encode_streams = 0x1

[venc_stream1]
; Codec type (0: H264, 1: H265, 2: MJPEG, 3: JPEG)
codec_type = 0
width = 1920
height = 1080
frame_rate = 30
bit_rate = 8192
input = 1920x1080.yuv
output = 1920x1080_30fps.264
frame_num = 100
; profile, level, tier configuration
; H264 supports the common baseline/main/high Profiles Level @ L5.2 (i.e., maximum high@L5.2)
; H265 supports the common main/main still picture profile @ L5.1 High Tier
; For details, refer to the source code ...
profile = h264_main@L4

[decode]
; Enable decoding, using bitwise operations
; 0x0 means decoding is disabled
; 0x01 means only the vdec_stream1 decoding stream is enabled
; 0x02 means only the vdec_stream2 decoding stream is enabled
; 0x03 means only the first two decoding streams (vdec_stream1 and vdec_stream2) are enabled, 0x07 means the first three decoding streams are enabled, 0x0f means the first four decoding streams are enabled, and so on
decode_streams = 0x0

[vdec_stream1]
; Codec type (0: H264, 1: H265, 2: MJPEG, 3: JPEG)
codec_type = 0
width = 1920
height = 1080
input = 1920x1080_30fps.264
output = 1920x1080.yuv
```

#### Encoding Configuration

#### [encode]
- **encode_streams**: This option specifies which encoding streams to enable, using bitwise representation. For example, `0x1` enables only the `venc_stream1` encoding stream, and `0x3` enables the first two encoding streams (`venc_stream1` and `venc_stream2`). **The value of this option is overridden by the command-line argument `-e`.**

#### [venc_stream]
- **codec_type**: Specifies the encoding type. Valid values are `0` (H264), `1` (H265), `2` (MJPEG), and `3` (JPEG).
- **width**: Width of the video frame.
- **height**: Height of the video frame.
- **frame_rate**: Frame rate of the video.
- **bit_rate**: Bit rate of the video.
- **input**: Input image file. Only NV12-formatted YUV images are supported. Multiple frames can be stored consecutively in one file; during encoding, each frame is read sequentially and cyclically.
- **output**: The output encoded video file.
- **frame_num**: The number of video frames to encode. If the number of image frames in the input image file is fewer than the value of this parameter, the image file is read cyclically during encoding until the number of frames reaches or exceeds the number specified by `frame_num`.
- **performance_test**: Specifies whether to run the performance test flow. The difference from the normal flow is that the performance test flow reads video frames from the file in advance and stores them in an external buffer.
- **profile**: Configuration of profile, level, and tier.
  - H264 supports the baseline/main/high Profiles Level @ L5.2 (i.e., maximum high@L5.2).
  - H265 supports the main/main still picture profile @ L5.1 High Tier.

#### Decoding Configuration

#### [decode]
- **decode_streams**: This section specifies which decoding streams to enable, using bitwise representation. For example, `0x1` enables only the `vdec_stream1` decoding stream, and `0x3` enables the first two decoding streams (`vdec_stream1` and `vdec_stream2`).

#### [vdec_stream]
- **codec_type**: Specifies the video codec type to decode. Valid values are `0` (H264), `1` (H265), `2` (MJPEG), and `3` (JPEG).
- **width**: Width of the decoded video frame.
- **height**: Height of the decoded video frame.
- **input**: Path of the input video file to be decoded. Depending on the `codec_type` setting, either a bitstream file or an RTSP stream can be used.
- **output**: Path of the output decoded image file. Only NV12-formatted YUV images are supported. Decoded images are saved consecutively into a single file, so please ensure the output path has sufficient disk space. Note that YUV images typically occupy a large amount of disk space, especially for high-resolution and long-duration video files, which may consume a large amount of storage. When selecting the output path, make sure the target storage device has enough free space.

### Running Results

Taking the first H264 encoding stream enabled in the configuration file (`encode_streams = 0x1`) as an example:


```
./sample_codec
Config file: codec_config.ini
encode_streams: 0x1
decode_streams: 0x0
Encoding video...
Encode params...
 codec_type: 0, width: 1920, height: 1080, frame_rate: 30, bit_rate: 8192, input_file: 1920x1080_NV12.yuv, output_file: 1920x1080_30fps.h264, frame_num: 100
Encode idx: 0, init successful
Encode idx: 0, start successful
Encode idx: 0, frame= 1
Encode idx: 0, frame= 2
Encode idx: 0, frame= 3
... ...
Encode idx: 0, frame= 98
Encode idx: 0, frame= 99
Encode idx: 0, frame= 100
```

According to the configuration `frame_num = 100` in `codec_config.ini`, the program exits automatically after encoding 100 frames.

## FAQ

### codec_config.ini Configuration Not Taking Effect

**Symptom**: After modifying `codec_config.ini`, the encoding resolution/frame count does not run as expected.

**Cause**: The program reads the ini file at startup; modifications made while it is running are not hot-reloaded. Alternatively, the ini section name or field name may be misspelled.

**Solution**: Re-run the program after making modifications; verify that the `venc_stream`/`vdec_stream` sections and field names are consistent with the parsing logic in `sample_codec.c`.

### Input Buffer Timeout

**Symptom**: During encoding/decoding, `hb_mm_mc_dequeue_input_buffer` returns a timeout (-268435443).

**Cause**: The input image frame rate/resolution does not match the codec configuration, or the upstream is not continuously feeding frames.

**Solution**: Verify that the input YUV resolution matches `codec_config.ini`; confirm that the dequeue → fill → queue rhythm in the loop is correct.

### Empty Bitstream Output or Corrupted File

**Symptom**: The output h264/h265 file cannot be played or has an abnormal size.

**Cause**: The `frame_num` value is too small, the output buffer is not queued back correctly, or the bit rate parameter is extreme.

**Solution**: Confirm that `frame_num` is greater than 0; check that `hb_mm_mc_dequeue_output_buffer`/`queue_output_buffer` are paired; adjust the bit rate appropriately.

## Related Documentation

- [Sample Code Introduction](./01_overview.md)
- [Multimedia API Reference](../01_multimedia_api/01_hbn_api.md)
