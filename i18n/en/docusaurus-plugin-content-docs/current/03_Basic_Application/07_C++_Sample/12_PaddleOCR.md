---
sidebar_position: 12
sidebar_products: RDK-S100
---

# Text Detection and Recognition - PaddleOCR

:::info S100 only
This sample applies only to RDK S100. The RDK S600 system image does not include the corresponding HBM model, and the related sample code is only shipped with the S100 system image; it is not supported on S600 yet.
:::

This sample runs PaddleOCR models using the BPU inference engine for text detection and recognition, supporting OCR recognition and visualization in Chinese scenarios. The sample code is located in `/app/cdev_demo/bpu/08_OCR_sample/01_paddleOCR/`.


## Model Description
- Overview:

    This sample implements Chinese text detection and recognition (two-stage OCR) based on PaddleOCR v3. The overall pipeline includes detecting text regions (detection model) and recognizing text content for each region (recognition model).

- HBM model names:

- Detection model: cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm

- Recognition model: cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm

- Input format:

    - Detection model: BGR image → resize to 640×640, convert to NV12 format (Y and UV separated)

    - Recognition model: rotated and cropped BGR text block image → resize to 48×320, normalize, convert to RGB format

- Output:

    - Detection model: segmentation probability map (1×1×H×W); text box coordinates are obtained through postprocessing

    - Recognition model: character token logits; recognized text string obtained through CTC decoding

## Feature Overview
- Model loading

    Load text detection and recognition models and parse related input/output information.

- Input preprocessing

    - Detection model: resize the original image to 640×640 and convert it to NV12 format (for BPU inference).

    - Recognition model: resize each rotated and cropped text block to 48×320, convert to RGB format and normalize, then convert to NCHW structure.

- Inference execution

    Run forward inference with the `.infer()` method. Outputs include probability maps (detection) and logits (recognition).

- Result post-processing

    - Detection model:

        - Binarize the probability map (using the configured threshold)

        - Find text region contours and expand them

        - Extract rotated boxes and crop image regions

    - Recognition model:

        - Decode logits with CTCLabelDecode and map to text strings

    Finally, recognition results are annotated in red text on a blank image and concatenated with the original image for visualization.

## Environment Dependencies
Before building and running, ensure the following dependencies are installed:
```bash
sudo apt update
sudo apt install -y libgflags-dev libpolyclipping-dev
```

## Directory Structure
```text
.
|-- CMakeLists.txt                 # CMake build script: target/dependency/include/link libraries
|-- FangSong.ttf                   # Chinese font (for rendering recognized text on the visualization canvas)
|-- README.md                      # Usage instructions (this file)
|-- inc
|   `-- paddleOCR.hpp              # OCR wrapper header: detection/recognition class interfaces (load/preprocess/infer/postprocess)
`-- src
    |-- main.cc                    # Program entry: parse args → detect → crop → recognize → visualize → save
    `-- paddleOCR.cc               # Implementation: polygon box generation, cropping, CTC decode, text rendering
```

## Build the Project
- Configure and build
    ```bash
    mkdir build && cd build
    cmake ..
    make -j$(nproc)
    ```

## Model Download
If the model is not found at runtime, download it with the following commands:
```bash
# Detection model
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/paddle_ocr/cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm
# Recognition model
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/paddle_ocr/cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm
```

## Parameter Reference
| Parameter          | Description                                              | Default Value                                                               |
| ------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| `--det_model_path` | Text detection model (`.hbm`)                            | `/opt/hobot/model/s100/basic/cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm` |
| `--rec_model_path` | Text recognition model (`.hbm`)                          | `/opt/hobot/model/s100/basic/cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm`  |
| `--test_image`     | Input test image path                                    | `/app/res/assets/gt_2322.jpg`                                               |
| `--label_file`     | Recognition label file                                   | `/app/res/labels/ppocr_keys_v1.txt`                                         |
| `--threshold`      | Text region binarization threshold (detection postprocessing) | `0.5`                                                                   |
| `--ratio_prime`    | Text box dilation factor (detection postprocessing, affects polygon expansion) | `2.7`                                                          |



## Quick Start
- Run the model
    - Make sure you are in the `build` directory
    - Use default parameters
        ```bash
        ./paddleOCR
        ```
    - Run with custom parameters
        ```bash
        ./paddleOCR \
            --det_model_path /opt/hobot/model/s100/basic/cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm \
            --rec_model_path /opt/hobot/model/s100/basic/cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm \
            --test_image     /app/res/assets/gt_2322.jpg \
            --label_file     /app/res/labels/ppocr_keys_v1.txt \
            --threshold 0.5 \
            --ratio_prime 2.7
        ```
- View the results

    After successful execution, results are drawn on the original image and saved to `build/result.jpg`.
    ```bash
    [Saved] Result saved to: result.jpg
    ```

## Notes
- The output is saved as `result.jpg` for manual inspection.

- For more deployment options or model support information, refer to the official documentation or contact platform technical support.
