# Text Detection and Recognition - PaddleOCR

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/Python_Sample/PaddleOCR

S100 only
This sample applies only to RDK S100. The RDK S600 system image does not include the corresponding HBM model, and the related sample code is only shipped with the S100 system image; it is not supported on S600 yet.

This sample runs PaddleOCR models using the `hbm_runtime` inference engine for text detection and recognition, supporting OCR recognition and visualization in Chinese scenarios. The sample code is located in `/app/pydev_demo/08_OCR_sample/01_paddleOCR/` . This sample code is located in `/app/pydev_demo/02_detection_sample/02_ultralytics_yolo11/` .

## Model Description

- Introduction:

This sample implements Chinese text detection and recognition (two-stage OCR) based on PaddleOCR v3. The overall pipeline includes detecting text regions (detection model) and recognizing text content for each region (recognition model).
- HBM model names:
- Detection model: `cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm`
- Recognition model: `cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm`
- Input format:

- Detection model: BGR image → resize to `640×640` , convert to NV12 format (Y and UV separated)
- Recognition model: rotated and cropped BGR text block image → resize to `48×320` , normalize, convert to RGB format
- Output:

- Detection model: segmentation probability map ( `1×1×H×W` ); text box coordinates are obtained through postprocessing
- Recognition model: character token logits; recognized text string obtained through CTC decoding
- Model download URL (automatically downloaded by the program):

```bash
# Detection model
https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/paddle_ocr/cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm
# Recognition model
https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/paddle_ocr/cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm
```

## Features

- Model loading

Use `hbm_runtime` to load text detection and recognition models separately, parse input/output names and shape information, and support inference priority and BPU core binding settings.
- Input preprocessing

- Detection model: resize the original image to `640×640` and convert it to NV12 format (for BPU inference).
- Recognition model: resize each rotated and cropped text block to `48×320` , convert to RGB format and normalize, then convert to NCHW structure.
- Inference execution

Run forward inference with the `.run()` method. Outputs include probability maps (detection) and logits (recognition).
- Output postprocessing

- Detection model:

- Binarize the probability map (using the configured threshold)
- Find text region contours and expand them
- Extract rotated boxes and crop image regions
- Recognition model:

- Decode logits with `CTCLabelDecode` and map to text strings
Finally, recognition results are annotated in red text on a blank image and concatenated with the original image for visualization.

## Environment Dependencies

- Ensure the dependencies in `pydev` are installed
```bash
pip install -r ../../requirements.txt
```
- Install packages required for OCR processing
```bash
pip install pyclipper==1.3.0.post6 Pillow==9.0.1 paddlepaddle
```

## Directory Structure

```text
.
├── FangSong.ttf                # Font for Chinese display
├── paddle_ocr.py               # Main program for text detection and recognition
├── postprocess/                # Postprocessing logic (sorting, merging, decoding, etc.)
└── README.md                   # Usage instructions
```

## Parameter Description

| Parameter | Default Value | Description 
| `--det-model-path` | `/opt/hobot/model/s100/basic/cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm` | Text detection model path 
| `--rec-model-path` | `/opt/hobot/model/s100/basic/cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm` | Text recognition model path 
| `--priority` | `0` | Model inference priority; larger is higher 
| `--bpu-cores` | `[0]` | BPU core indices used for inference 
| `--test-img` | `/app/res/assets/gt_2322.jpg` | Input image path 
| `--label-file` | `/app/res/labels/ppocr_keys_v1.txt` | Label file path required for text recognition 
| `--img-save-path` | `result.jpg` | Save path for inference result image 
| `--threshold` | `0.5` | Threshold for text region binarization 
| `--ratio-prime` | `2.7` | Text box dilation factor for detection box morphology adjustment 

## Quick Start

- Run the model

- Use default parameters
```bash
python paddle_ocr.py
```
- Run with specified parameters
```bash
python paddle_ocr.py \
--det-model-path /opt/hobot/model/s100/basic/cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm \
--rec-model-path /opt/hobot/model/s100/basic/cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm \
--test-img /app/res/assets/gt_2322.jpg \
--label-file /app/res/labels/ppocr_keys_v1.txt \
--img-save-path result.jpg \
--priority 0 \
--bpu-cores 0 \
--threshold 0.5 \
--ratio-prime 2.7
```
- View the result

After successful execution, results will be drawn on the original image and saved to the path specified by `--img-save-path` .

```bash
[Saved] Result saved to: result.jpg
```

## Notes

- If the specified model path does not exist, the program will attempt to download the model automatically.
