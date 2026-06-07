# RTSP Stream Pull and YOLOv5x Inference

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/C++_Sample/rtsp_yolov5x_display

This sample demonstrates how to combine SP hardware modules (decoder, VIO, display) with the BPU on platforms such as RDK S100 to implement: RTSP/H.264 video stream → hardware decode (NV12) → YOLOv5x inference → overlay detection boxes → real-time display. The sample code is located in `/app/cdev_demo/bpu/rtsp_yolov5x_display_sample/` .

This sample demonstrates how to combine SP hardware modules (decoder, VIO, display) with the BPU on platforms such as RDK S600 to implement: RTSP/H.264 video stream → hardware decode (NV12) → YOLOv5x inference → overlay detection boxes → real-time display. The sample code is located in `/app/cdev_demo/bpu/rtsp_yolov5x_display_sample/` .

## Feature Overview

- Model loading

Load the BPU model with `YOLOv5x(model_path)` and obtain the class name list through `load_linewise_labels` for subsequent inference.
- Preprocessing

Obtain NV12 frames from the SP decoder ( `sp_decoder_get_image` ), convert to BGR ( `cv::cvtColor` ), apply scaling/letterbox processing, and write to the YOLOv5x input tensor ( `pre_process` ).
- Inference

Call `yolov5x.infer()` to execute forward computation on the BPU and generate raw detection results.
- Postprocessing

Call `yolov5x.post_process` to perform confidence filtering and NMS, and map detection box coordinates to the display resolution.
- RTSP stream pull and decode (SP Decoder / FFmpeg)

Initialize the network stack with FFmpeg ( `avformat_network_init` ), open the RTSP stream ( `avformat_open_input` ), and pull H264 video frames through the SP module ( `sp_start_decode` , `sp_decoder_get_image` ).
- Resolution adaptation and scaling (VPS)

If the display resolution differs from the video stream resolution, use the SP VPS module for scaling ( `sp_open_vps` ) and bind the decoder, VPS, and display modules into a pipeline with `sp_module_bind` .
- Screen display (SP Display)

Initialize the display channel with `sp_start_display` ; overlay detection results on screen with `draw_detections_on_disp` ; if resolutions match, YUV frames can be displayed directly via `sp_display_set_image` .
- Signal control (Signal Handler)

Register `signal_handler_func` to capture signals such as SIGINT, set the global flag `is_stop` , and allow the main loop to exit safely.

## Model Description

See the [Ultralytics YOLOv5x object detection sample](/rdk_s_doc/en/Algorithm_Application/C++_Sample/Ultralytics_YOLOv5x) section.

## Environment Dependencies

Before building and running, ensure the following dependencies are installed:

```bash
sudo apt update
sudo apt install libgflags-dev
```

## Directory Structure

```text
.
|-- CMakeLists.txt
|-- README.md
|-- inc
|   `-- ultralytics_yolov5x.hpp       # YOLOv5x wrapper header
`-- src
    |-- main.cc                       # Main program entry: RTSP decode → YOLOv5x inference → display
    `-- ultralytics_yolov5x.cc        # YOLOv5x implementation: preprocess/infer/postprocess/NMS
```

## Build the Project

- Configure and build
```bash
mkdir build && cd build
cmake ..
make -j$(nproc)
```

## Model Download

If the model is not found at runtime, download it with the following command:

```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolov5x_672x672_nv12.hbm
```

## Model Download

If the model is not found at runtime, download it with the following command:

```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/ultralytics_YOLO/yolov5x_672x672_nv12.hbm
```

## Parameter Reference

| Parameter | Description | Default Value 
| `--rtsp_url` | RTSP stream URL | `rtsp://127.0.0.1/assets/1080P_test.h264` 
| `--transfer_type` | RTSP transport type (tcp/udp) | `tcp` 
| `--model_path` | YOLOv5x quantized BPU model path ( `.hbm` ) | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm` 
| `--label_file` | Class name file (one class name per line) | `/app/res/labels/coco_classes.names` 
| `--score_thres` | Confidence threshold (filter low-score detection boxes) | `0.25` 
| `--nms_thres` | NMS IoU threshold | `0.45` 

| Parameter | Description | Default Value 
| `--rtsp_url` | RTSP stream URL | `rtsp://127.0.0.1/assets/1080P_test.h264` 
| `--transfer_type` | RTSP transport type (tcp/udp) | `tcp` 
| `--model_path` | YOLOv5x quantized BPU model path ( `.hbm` ) | `/opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm` 
| `--label_file` | Class name file (one class name per line) | `/app/res/labels/coco_classes.names` 
| `--score_thres` | Confidence threshold (filter low-score detection boxes) | `0.25` 
| `--nms_thres` | NMS IoU threshold | `0.45` 

## Quick Start

- Prepare RTSP stream

Use the built-in streaming service to prepare an RTSP stream as input. The service converts the `1080P_test.h264` video file into an RTSP stream at `rtsp://127.0.0.1/assets/1080P_test.h264` . Start the streaming service with:

```bash
cd /app/res
sudo chmod +x live555MediaServer
sudo ./live555MediaServer &
```
- Run the model

- Make sure you are in the `build` directory
- Use default parameters

```bash
./rtsp_yolov5x_display
```
- Run with custom parameters

```bash
./rtsp_yolov5x_display \
    --rtsp_url rtsp://127.0.0.1/assets/1080P_test.h264 \
    --transfer_type tcp \
    --model_path /opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm \
    --label_file /app/res/labels/coco_classes.names \
    --score_thres 0.3 \
    --nms_thres 0.5
```

```bash
./rtsp_yolov5x_display \
    --rtsp_url rtsp://127.0.0.1/assets/1080P_test.h264 \
    --transfer_type tcp \
    --model_path /opt/hobot/model/s600/basic/yolov5x_672x672_nv12.hbm \
    --label_file /app/res/labels/coco_classes.names \
    --score_thres 0.3 \
    --nms_thres 0.5
```
- Exit

Press `Ctrl+C` in the terminal.
- View the results

After successful execution, object detection results are displayed on screen in real time.

## Notes

- This program must run in a desktop environment.
- For more deployment options or model support information, refer to the official documentation or contact platform technical support.

## License

```license
Copyright (C) 2025, XiangshunZhao D-Robotics.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
