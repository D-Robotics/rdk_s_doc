# sample_codec User Guide
## Functional Overview
sample_codec is an example program for video encoding and decoding. It performs video encoding and decoding based on configuration items defined in the configuration file (`codec_config.ini`), helping users debug video codecs.

### Data Flow Description
#### Encoding Data Flow

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/sample_codec_encode_data_flow.png" alt="sample_codec_encode_data_flow" style={{ width: '100%' }} />

#### Decoding Data Flow

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/sample_codec_decode_data_flow.png" alt="sample_codec_decode_data_flow" style={{ width: '100%' }} />

### Code Location and Directory Structure

- Code location: `/app/multimedia_samples/sample_codec`
- Directory structure
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

- Navigate to the sample_codec directory and run `make` to compile
- The output artifact is `sample_codec` in the sample_codec source directory

**Note:** Resource files `1280x720_NV12.yuv`, `1920x1080_NV12.yuv`, and `640x480_30fps.h264` are already prepared in the example code directory. You can use these files to quickly run encoding examples at 720P and 1080P resolutions, and an H264 decoding example at 640x480 resolution. To run encoding/decoding tasks at other resolutions, refer to the `codec_config.ini` configuration to add or modify configuration items and prepare the input file accordingly.

## Running

### How to Run the Program

Execute the program `./sample_codec -h` to get help information:

### Program Parameter Options Description
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

- -f, --config_file FILE: Specify the configuration file path (optional), default value is `codec_config.ini`.
- -e, --encode [OPTION]: Set encoding options (optional). If this option is used, it overrides the `encode_streams` option in the configuration file.
- -d, --decode [OPTION]: Set decoding options (optional). If this option is used, it overrides the `decode_streams` option in the configuration file.
- -v, --verbose: Enable verbose mode to display more log information.
- -h, --help: Display help information.

#### Usage Examples

- Start encoding/decoding using the configuration items in `codec_config.ini` by default (one H264 encoding channel is enabled by default: `encode_streams = 0x1`). Run the program without any parameters:

  ```
  ./sample_codec
  ```

- Start specified encoding streams (defined in `codec_config.ini`):

  ```
  ./sample_codec -e 0x1  # Start venc_stream1
  ./sample_codec -e 0x3  # Start venc_stream1 and venc_stream2
  ```

- Start specified decoding streams (defined in `codec_config.ini`):

  ```
  ./sample_codec -e 0 -d 0x1 # Disable encoding, start vdec_stream1
  ./sample_codec -e 0 -d 0x3  # Disable encoding, start vdec_stream1 and vdec_stream2
  ```

- Enable verbose mode for more log information:

  ```
  ./sample_codec -v
  ```

- Display help information:

  ```
  ./sample_codec -h
  ```

### Configuration File Description

The `codec_config.ini` configuration defines different video encoding and decoding parameters, setting the number of codec channels to start by default.

The encoding parameter options are described as follows:

```
[encode]
; Enable encoding, bitwise operation
; 0x0 means disable encoding
; 0x01 means enable only venc_stream1 encoding stream
; 0x02 means enable only venc_stream2 encoding stream
; 0x03 means enable the first two encoding streams (venc_stream1 and venc_stream2), 0x07 means enable the first three encoding streams, 0x0f means enable the first four encoding streams, and so on
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
; h264 supports common baseline/main/high Profiles Level @ L5.2 (i.e., up to high@L5.2)
; h265 supports common main/main still picture profile @ L5.1 High Tier
; Refer to code for details ...
profile = h264_main@L4

[decode]
; Enable decoding, bitwise operation
; 0x0 means disable decoding
; 0x01 means enable only vdec_stream1 decoding stream
; 0x02 means enable only vdec_stream2 decoding stream
; 0x03 means enable the first two decoding streams (vdec_stream1 and vdec_stream2), 0x07 means enable the first three decoding streams, 0x0f means enable the first four decoding streams, and so on
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

##### [encode]
- **encode_streams**: This option specifies which encoding streams to enable. It is represented using bitwise operations. For example, `0x1` enables only the `venc_stream1` encoding stream, `0x3` enables the first two encoding streams (`venc_stream1` and `venc_stream2`). **The value of this option is overridden by the command line parameter -e**

##### [venc_stream]
- **codec_type**: Specifies the encoding type. Options are `0` (H264), `1` (H265), `2` (MJPEG), and `3` (JPEG).
- **width**: Width of the video frame.
- **height**: Height of the video frame.
- **frame_rate**: Frame rate of the video.
- **bit_rate**: Bit rate of the video.
- **input**: Input image file, only supports NV12 format YUV images. Multiple frames can be stored consecutively in one file. During encoding, frames are read sequentially and cyclically.
- **output**: Output encoded video file.
- **frame_num**: Number of video frames to encode. If the number of frames in the input image file is less than this parameter value, the image file will be read cyclically until the number of frames specified by frame_num is reached or exceeded.
- **performance_test**: Specifies whether to run the performance test flow. The difference from the normal flow is that the performance test flow pre-reads video frames from the file and stores them in an external buffer.
- **profile**: profile, level, tier configuration.
  - h264 supports baseline/main/high Profiles Level @ L5.2 (i.e., up to high@L5.2).
  - h265 supports main/main still picture profile @ L5.1 High Tier.

#### Decoding Configuration

##### [decode]
- **decode_streams**: This section specifies which decoding streams to enable. It is represented using bitwise operations. For example, `0x1` enables only the `vdec_stream1` decoding stream, `0x3` enables the first two decoding streams (`vdec_stream1` and `vdec_stream2`).

##### [vdec_stream]
- **codec_type**: Specifies the video encoding type for decoding. Options are `0` (H264), `1` (H265), `2` (MJPEG), and `3` (JPEG).
- **width**: Width of the decoded video frame.
- **height**: Height of the decoded video frame.
- **input**: Path to the input video file to be decoded. Bitstream files and RTSP streams can be used depending on the `codec_type` setting.
- **output**: Path to the output decoded image file, only supports NV12 format YUV images. Decoded images are saved consecutively to a single file, so ensure there is sufficient disk space in the output path. Note that YUV images typically consume significant disk space, especially for high-resolution and long-duration video files, which may take up a large amount of storage space. When selecting an output path, ensure the target storage device has enough available space.

### Runtime Effect

Take the first H264 encoding channel enabled in the configuration file (encode_streams = 0x1) as an example.

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

According to the configuration `frame_num = 100` in `codec_config.ini`, the program automatically exits after encoding 100 frames.