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

    UNet is a classic semantic segmentation network with an encoder-decoder architecture, performing well in medical image analysis and similar domains. This example uses MobileNet as the encoder backbone to reduce model complexity and speed up inference, suitable for real-time segmentation on edge devices. The model outputs a class label for each pixel, enabling applications such as urban street scene segmentation.

- HBM model name: unet_mobilenet_1024x2048_nv12.hbm

- Input format: NV12, size 1024x2048 (Y and UV planes separated)

- Output: Segmentation map with the same size as the input; each pixel corresponds to a class index from 0 to 18 (19 classes total)

## Feature Overview
- Model loading

    Load the quantized semantic segmentation model and extract model metadata.

- Input preprocessing

    Load the original image in BGR format, scale it to 1024×2048, convert it to NV12 format (Y/UV separated), and wrap it in the input dictionary structure required by the inference interface.

- Inference execution

    Run the forward pass via the `.infer()` method; output is a class logits tensor.

- Result post-processing

    - Apply argmax to the output tensor to obtain the class for each pixel;

    - Resize the prediction map to the input image size;

    - Restore to the original image size and map to the specified color palette;

    - Blend with the original image using the configured alpha fusion coefficient to generate a segmentation visualization;

    - The final image provides an intuitive overlay of the segmentation result for saving or display.

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
├── README.md                  # Usage documentation (this file)
├── inc
│   └── unet_mobilenet.hpp      # UnetMobileNet class header (declares model loading, preprocessing, inference, and post-processing interfaces)
└── src
    ├── main.cc                 # Main program entry point; controls the inference pipeline
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
| Parameter      | Description                                              | Default Value                                                   |
| -------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| `--model_path` | Model file path (.hbm format)                            | `/opt/hobot/model/s100/basic/unet_mobilenet_1024x2048_nv12.hbm` |
| `--test_img`   | Input test image path                                    | `/app/res/assets/segmentation.png`                              |
| `--alpha_f`    | Visualization blend coefficient; `0.0=mask only`, `1.0=original image only` | `0.75`                                              |

</DocScope>
<DocScope products="RDK-S600">
| Parameter      | Description                                              | Default Value                                                   |
| -------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| `--model_path` | Model file path (.hbm format)                            | `/opt/hobot/model/s600/basic/unet_mobilenet_1024x2048_nv12.hbm` |
| `--test_img`   | Input test image path                                    | `/app/res/assets/segmentation.png`                              |
| `--alpha_f`    | Visualization blend coefficient; `0.0=mask only`, `1.0=original image only` | `0.75`                                              |

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

- View the results

    After a successful run, the result is drawn on the original image and saved to `build/result.jpg`.
    ```bash
    [Saved] Result saved to: result.jpg
    ```

## Notes
- The output is saved as `result.jpg` for you to inspect.

- For more deployment options or model support information, refer to the official documentation or contact platform technical support.
