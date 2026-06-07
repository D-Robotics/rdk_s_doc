# Text Detection and Recognition - PaddleOCR

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/C++_Sample/PaddleOCR

S100 only
This example is only applicable to RDK S100. The RDK S600 image does not include the corresponding hbm models, and the relevant sample code is only released with the system image on the S100; it is not supported on the S600.

This example runs the PaddleOCR model for text detection and recognition based on the BPU inference engine, supporting OCR recognition and visualization in Chinese scenarios. The sample code is located in the `/app/cdev_demo/bpu/08_OCR_sample/01_paddleOCR/` directory.

## Model Description

- Introduction:

This example implements Chinese text detection and recognition (two-stage OCR) based on PaddleOCR v3. The overall process includes detecting text regions (detection model) and recognizing text content region by region (recognition model).
- HBM Model Names:
- Detection Model: `cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm`
- Recognition Model: `cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm`
- Input Format:

- Detection Model: BGR image → resized to 640×640, converted to NV12 format (Y and UV separate)
- Recognition Model: Rotated and cropped BGR text block image → resized to 48×320, normalized, converted to RGB format
- Output:

- Detection Model: Segmentation probability map (1×1×H×W), post-processed to obtain text box coordinates
- Recognition Model: Logits of character tokens, decoded via CTC to obtain the recognized text string

## Functionality Description

- Model Loading

Loads the text detection and recognition models and parses input/output-related information.
- Input Preprocessing

- Detection Model: Resizes the original image to 640×640 and converts it to NV12 format (for BPU inference).
- Recognition Model: Resizes each rotated and cropped text block to 48×320, converts it to RGB format, normalizes it, and finally transforms it into an NCHW structure.
- Inference Execution

Calls the `.infer()` method for forward inference, outputting a probability map (detection) and logits (recognition).
- Result Post-Processing

- Detection Model:

- Binarizes the probability map (using a set threshold)
- Finds contours of text regions and expands them
- Extracts rotated bounding boxes and crops the image regions
- Recognition Model:

- Decodes the logits using CTCLabelDecode to map them to text strings
Finally, the recognition results are annotated in red text on a blank canvas and visualized alongside the original image.

## Environment Dependencies

Before compiling and running, ensure the following dependencies are installed:

```bash
sudo apt update
sudo apt install -y libgflags-dev libpolyclipping-dev
```

## Directory Structure

```text
.
|-- CMakeLists.txt                 # CMake build script: targets/dependencies/include paths/link libraries
|-- FangSong.ttf                   # Chinese font (for rendering recognized text on the visualization canvas)
|-- README.md                      # Usage instructions (this file)
|-- inc
|   `-- paddleOCR.hpp              # OCR encapsulation header: detection/recognition class interfaces (load/preprocess/inference/postprocess)
`-- src
    |-- main.cc                    # Program entry: parse arguments → detect → crop → recognize → visualize → save
    `-- paddleOCR.cc               # Concrete implementation: polygon box generation, cropping, CTC decoding, text rendering
```

## Compiling the Project

- Configuration and Compilation
```bash
mkdir build && cd build
cmake ..
make -j$(nproc)
```

## Model Download

If the models are not found when running the program, you can download them using the following commands:

```bash
# Detection model
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/paddle_ocr/cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm
# Recognition model
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/paddle_ocr/cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm
```

## Parameter Description

| Parameter Name | Description | Default Value 
| `--det_model_path` | Path to the text detection model ( `.hbm` ) | `/opt/hobot/model/s100/basic/cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm` 
| `--rec_model_path` | Path to the text recognition model ( `.hbm` ) | `/opt/hobot/model/s100/basic/cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm` 
| `--test_image` | Path to the input test image | `/app/res/assets/gt_2322.jpg` 
| `--label_file` | Path to the recognition label file | `/app/res/labels/ppocr_keys_v1.txt` 
| `--threshold` | Binarization threshold for text regions (for detection post-processing) | `0.5` 
| `--ratio_prime` | Expansion factor for text boxes (for detection post-processing, affects polygon expansion) | `2.7` 

## Quick Run

- Run the model

- Ensure you are in the `build` directory
- Use default parameters:
```bash
./paddleOCR
```
- Run with specified parameters:
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

After successful execution, the results will be drawn on the original image and saved as `build/result.jpg` .

```bash
[Saved] Result saved to: result.jpg
```

## Notes

- The output result is saved as `result.jpg` , which you can view.
- For more information on deployment methods or model support, please refer to the official documentation or contact platform technical support.
