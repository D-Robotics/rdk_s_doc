---
sidebar_position: 6
---

# Semantic Segmentation - UNetMobileNet

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">

This example shows how to run the UNet-MobileNet semantic segmentation model on the BPU. It supports image preprocessing, inference, and post-processing (parse outputs and overlay colored segmentation masks). The sample code is located in `/app/cdev_demo/bpu/03_instance_segmentation_sample/01_unetmobilenet/`.

</DocScope>
<DocScope products="RDK-S600">

This example shows how to run the UNet-MobileNet semantic segmentation model on the BPU. It supports image preprocessing, inference, and post-processing (parse outputs and overlay colored segmentation masks). The sample code is located in `/app/cdev_demo/bpu/instance_segmentation_sample/unetmobilenet/`.

</DocScope>

## Model Description
- Overview:

    UNet is a classic semantic segmentation architecture with an encoder-decoder design, widely used in medical image analysis and similar domains. This example uses MobileNet as the encoder backbone to reduce model complexity and improve inference speed, making it suitable for real-time segmentation on edge devices. The model outputs a per-pixel class label map for applications such as urban street-scene segmentation.

- HBM model name: unet_mobilenet_1024x2048_nv12.hbm

- Input format: NV12, size 1024x2048 (Y and UV planes separated)

- Output: Segmentation map with the same size as the input; each pixel has a class index from 0 to 18 (19 classes total)

## Feature Overview
- Model loading

    Load the quantized semantic segmentation model and extract model metadata.

- Input preprocessing

    Load the original image in BGR format, resize it to 1024×2048, convert it to NV12 format (Y/UV separated), and build the input structure required by the inference interface.

- Inference execution

    Run the forward pass via the `.infer()` method; the output is a class logits tensor.

- Result post-processing

    - Apply argmax on the output tensor to obtain the class index per pixel;

    - Resize the prediction map to the input image size;

    - Map classes to the color palette and restore to the original image dimensions;

    - Blend with the original image using the configured alpha value to produce a visualization;

    - The final image shows the segmentation overlay and can be saved or displayed.

## Environment Dependencies
Before building and running, ensure the following dependencies are installed:
```bash
sudo apt update
sudo apt install libgflags-dev
```

## Directory Structure
```text
.
├── CMakeLists.txt             # CMake build configuration
├── README.md                  # Usage instructions (this file)
├── inc
│   └── unet_mobilenet.hpp      # UnetMobileNet class header (load, preprocess, infer, postprocess)
└── src
    ├── main.cc                 # Main entry: runs the full inference pipeline
    └── unet_mobilenet.cc       # UnetMobileNet class implementation
```

## Build the Project
- Configure and build
    ```bash
    mkdir build && cd build
    cmake ..
    make -j$(nproc)
    ```

## Parameter Reference

<DocScope products="RDK-S100">
| Parameter       | Description                                              | Default Value                                                       |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| `--model_path`  | Model file path (.hbm format)                            | `/opt/hobot/model/s100/basic/unet_mobilenet_1024x2048_nv12.hbm`     |
| `--test_img`    | Input test image path                                    | `/app/res/assets/segmentation.png`                                  |
| `--alpha_f`     | Visualization blend factor; `0.0` = mask only, `1.0` = original image only | `0.75`                                                      |

</DocScope>
<DocScope products="RDK-S600">
| Parameter       | Description                                              | Default Value                                                       |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| `--model_path`  | Model file path (.hbm format)                            | `/opt/hobot/model/s600/basic/unet_mobilenet_1024x2048_nv12.hbm`     |
| `--test_img`    | Input test image path                                    | `/app/res/assets/segmentation.png`                                  |
| `--alpha_f`     | Visualization blend factor; `0.0` = mask only, `1.0` = original image only | `0.75`                                                      |

</DocScope>

## Quick Start
- Run the model
    - Make sure you are in the `build` directory
    - Use default parameters
        ```bash
        ./unet_mobilenet
        ```
    - Run with custom parameters

        <DocScope products="RDK-S100">
        ```bash
        ./unet_mobilenet \
        --model_path /opt/hobot/model/s100/basic/unet_mobilenet_1024x2048_nv12.hbm \
        --test_img /app/res/assets/segmentation.png \
        --alpha_f 0.75
        ```

        </DocScope>
        <DocScope products="RDK-S600">
        ```bash
        ./unet_mobilenet \
        --model_path /opt/hobot/model/s600/basic/unet_mobilenet_1024x2048_nv12.hbm \
        --test_img /app/res/assets/segmentation.png \
        --alpha_f 0.75
        ```

        </DocScope>

- View results

    After a successful run, results are drawn on the original image and saved to `build/result.jpg`.
    ```bash
    [Saved] Result saved to: result.jpg
    ```

## Notes
- The output image is saved as `result.jpg` in the build directory.

- For more deployment options or model support details, refer to the official documentation or contact platform technical support.
