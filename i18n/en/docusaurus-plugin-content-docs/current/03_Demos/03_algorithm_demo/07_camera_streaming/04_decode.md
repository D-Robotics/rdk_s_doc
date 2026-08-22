---
sidebar_position: 4
title: "Video Decode and YOLOv5x Inference"
description: "Preset sample for decoding a local H.264 file and performing real-time YOLOv5x object detection"
---

# Video Decode and YOLOv5x Inference

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This sample demonstrates the end-to-end pipeline of combining SP decode/display/VIO with the BPU: local H.264 file → hardware decode (NV12) → YOLOv5x inference → overlay boxes on the display layer. For the WebSocket version, see [WebSocket YOLOv5x Inference (Python)](./04_websocket_py.md).

:::tip
The sample code is located at `/app/cdev_demo/bpu/decode_yolov5x_display_sample/` on the board. It has been verified on the board and can be compiled and run directly.
:::

## Prerequisites

- The board is flashed with RDK OS and accessible via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- Desktop image (Desktop) is used; the desktop/console display is available.
- The input video file is in place: `/app/res/assets/1080P_test.h264`.
- The preset model is in place: S600 `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`); if missing, see [Model Acquisition and Placement](../../04_demo_support/01_model_files.md).

## Environment Dependencies

Building requires `libgflags-dev`:

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Code Location

Board path: `/app/cdev_demo/bpu/decode_yolov5x_display_sample/`

Directory structure:

```text
.
|-- CMakeLists.txt                 # CMake build script (target/dependency/include/link configuration)
|-- README.md                      # Usage instructions
|-- inc
|   `-- ultralytics_yolov5x.hpp    # YOLOv5x wrapper header: load/preprocess/infer/postprocess interfaces
`-- src
    |-- main.cc                    # Program entry: H.264 decode → infer → display overlay (Ctrl+C to exit)
    `-- ultralytics_yolov5x.cc     # YOLOv5x implementation: letterbox, NV12 tensor write, decode, NMS, coordinate restoration
```

## Build

```bash
cd /app/cdev_demo/bpu/decode_yolov5x_display_sample
mkdir build && cd build
cmake ..
make -j$(nproc)
```

The build output is `build/decode_yolov5x_display`.

## Parameter Reference

| Parameter | Description | Default Value |
|---|---|---|
| `--width` | Expected source stream/decode width (pixels) | `1920` |
| `--height` | Expected source stream/decode height (pixels) | `1080` |
| `--input_path` | Input H.264 file path | `/app/res/assets/1080P_test.h264` |
| `--model_path` | YOLOv5x quantized model path (.hbm) | S600: `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` (S100 uses the corresponding `s100/basic/`) |
| `--label_file` | Class name list file (one class name per line) | `/app/res/labels/coco_classes.names` |
| `--score_thres` | Confidence threshold (filters low-score boxes) | `0.25` |
| `--nms_thres` | IoU threshold for NMS | `0.45` |

## Usage

In the `build` directory, run with default parameters:

```bash
./decode_yolov5x_display
```

Run with explicit parameters (equivalent to the defaults):

<DocScope products="RDK S600">

```bash
./decode_yolov5x_display \
  --width 1920 --height 1080 \
  --input_path /app/res/assets/1080P_test.h264 \
  --model_path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
  --label_file /app/res/labels/coco_classes.names \
  --score_thres 0.25 \
  --nms_thres 0.45
```

</DocScope>

To exit: press `Ctrl+C` on the command line.

## Running Results

The following is the actual output measured on RDK S600 (default parameters, `1080P_test.h264`):

```text
./decode_yolov5x_display
disp_w=1920, disp_h=1080
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
sp_start_decode success!
sp_start_display success!
```

**Indicators of success**: `sp_start_decode success!` means the decode channel was opened successfully, `sp_start_display success!` means the display channel is ready; `BPULib verison(2, 2, 15)` and `DNN: 3.13.6` mean the BPU runtime loaded normally. The screen displays the real-time frame with detection boxes.

## Software Description

Data flow: the SP decoder opens the H.264 file (`sp_init_decoder_module`/`sp_start_decode`) → `sp_decoder_get_image` captures NV12 frames → NV12 to BGR → letterbox scale → BPU inference → NMS → draw detection boxes on the Display layer (`draw_detections_on_disp`); if the display resolution does not match the video resolution, an SP VPS scaling pipeline is inserted automatically; after the file is decoded to the end, it loops automatically.

## FAQ

- **`sp_start_decode failed`**: the file specified by `--input_path` does not exist or is not an H.264 stream; check the file path.
- **No image displayed**: a display environment is required; confirm `--width`/`--height` match the actual video resolution, otherwise VPS scaling is needed.
- **`make` fails with gflags not found**: `libgflags-dev` is not installed; install it per "Environment Dependencies".
- **Error: model not found**: check whether the `.hbm` file exists under `--model_path`.

## Related Documentation

- [WebSocket YOLOv5x Inference (Python)](./04_websocket_py.md)
- [Object Detection - YOLOv5x (C/C++)](../03_detection/01_yolov5x.md)
- [C/C++ Demo Programming Guide](../../04_demo_support/02_c_cpp_build.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [DECODER (Decode Module) API](../../../04_Simple_API/01_multimedia_api/cdev/03_decoder_api.md)
- [DISPLAY (Display Module) API](../../../04_Simple_API/01_multimedia_api/cdev/04_display_api.md)
- [C Inference API](../../../04_Simple_API/02_inference_api/01_c_api.md)