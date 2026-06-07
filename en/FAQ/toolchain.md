# 8.5 AI Models, Algorithms, and Toolchain

URL: https://developer.d-robotics.cc/rdk_s_doc/en/FAQ/toolchain

🛠️ Toolchain and System Download Guide
For toolchain issues, we recommend using the latest version first. For related download resources, see: [Download Resources](/rdk_s_doc/en/Quick_start/download)

This section answers common questions about AI model deployment, algorithm development, and toolchain usage on D-Robotics RDK platforms.

### Q1: What information should I provide when reporting a toolchain issue?

**A:** When you encounter an issue with the D-Robotics algorithm toolchain and need technical support, please provide the following complete information to help us locate the problem quickly:

1. **Target RDK hardware platform and processor architecture:** For example, RDK S100 (BPU Nash-e), Super100P (BPU Nash-m).
2. **Algorithm toolchain conversion environment information:**
- `horizon_nn` package version (check with `pip list | grep horizon` ).
- Python version (for example, Py3.8, Py3.10).
- Toolchain Docker image version used (if using Docker).
3. `horizon_nn` package version (check with `pip list | grep horizon` ).
4. Python version (for example, Py3.8, Py3.10).
5. Toolchain Docker image version used (if using Docker).
6. **Original model file:** Provide your ONNX model file (or other original-format model file).
7. **Model conversion related files:**
- The `yaml` configuration file used during conversion.
- Complete `hb_mapper make_model_log` or similar log files (for example, `hb_mapper_makertbin_log_*.log` ).
- Calibration dataset for PTQ quantization (or its generation method and a few sample images).
8. The `yaml` configuration file used during conversion.
9. Complete `hb_mapper make_model_log` or similar log files (for example, `hb_mapper_makertbin_log_*.log` ).
10. Calibration dataset for PTQ quantization (or its generation method and a few sample images).
11. **Board deployment related files:**
- Code snippets or the complete project for board deployment.
- Specific error messages and logs from board-side runtime.
- RDK board system version information (obtained with the `rdkos_info` command).
12. Code snippets or the complete project for board deployment.
13. Specific error messages and logs from board-side runtime.
14. RDK board system version information (obtained with the `rdkos_info` command).
15. **Detailed steps to reproduce the issue:** Clearly describe the step-by-step operations needed to reproduce the problem.
16. **Expected behavior vs. actual behavior:** Describe the result you expected and the phenomenon you actually observed.
**Note:** Many common issues may exist in older toolchain versions and have already been fixed in newer releases. We recommend using the latest officially released Docker image and toolchain version first.

- **Docker image download and mount references:**
- [Docker Image Download Post](https://developer.d-robotics.cc/forumDetail/136488103547258769)
- [Docker Mount Method Post](https://developer.d-robotics.cc/forumDetail/228559182180396619)
- For complex issues, we recommend sharing the complete development-machine conversion project, board deployment project, and detailed error reproduction steps with technical support via cloud storage or similar methods.

### Q2: What official resources are recommended for AI algorithm development?

**A:**

1. **RDK User Manual - Algorithm Toolchain chapter:** This is the most fundamental and important reference. It describes toolchain installation, usage workflow, tool functions, parameters, and more.
- General entry: [https://developer.d-robotics.cc/rdk_doc/04_toolchain_development](https://developer.d-robotics.cc/rdk_doc/04_toolchain_development) (refer to the latest official documentation)
2. General entry: [https://developer.d-robotics.cc/rdk_doc/04_toolchain_development](https://developer.d-robotics.cc/rdk_doc/04_toolchain_development) (refer to the latest official documentation)
3. **RDK Model Zoo:** The official model example repository, containing porting, optimization, quantization, and deployment example code and tutorials for many common AI models on RDK platforms.
- GitHub repository: [https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo)
4. GitHub repository: [https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo)
5. **D-Robotics Developer Community - Resource Center:** The community resource center usually aggregates development resources, including toolchain packages, SDKs, sample code, technical documentation, tutorial videos, and more.
- Community resource center: [https://developer.d-robotics.cc/resource](https://developer.d-robotics.cc/resource)
6. Community resource center: [https://developer.d-robotics.cc/resource](https://developer.d-robotics.cc/resource)

### Q3: The algorithm toolchain Docker image is based on Ubuntu 20.04. Will this affect running conversion outputs (such as `.bin` or `.hbm` model files) on RDK boards running Ubuntu 22.04?

**A:** Usually **it will not affect deployment** . Although the algorithm toolchain Docker image provided by D-Robotics OpenExplorer may be based on Ubuntu 20.04, its main purpose is to provide an isolated **model conversion environment** that contains all necessary conversion tools and dependency libraries. The generated model files (such as `.bin` for PTQ and `.hbm` for QAT) are binary instructions and weight data targeting a specific BPU architecture on RDK boards. These model files are decoupled from the Ubuntu version (whether 20.04 or 22.04) of the RDK board OS on which they run, as long as the Runtime libraries on the board (such as `libdnn.so` and other BPU drivers and inference libraries) are compatible with the toolchain version used during model conversion.

### Q4: How do I deploy YOLO series models (such as YOLOv5, YOLOv8, YOLOv10) on RDK platforms?

**A:** D-Robotics and the community provide extensive tutorials and examples for deploying YOLO series models on RDK platforms.

- **YOLO series deployment recommendations:**

- We recommend starting with examples for your current S-series platform in [RDK Model Zoo](https://github.com/D-Robotics/rdk_model_zoo) .
- If you use a self-trained model, first confirm that the exported ONNX output node format matches the board-side post-processing implementation.
- For performance optimization, focus on preprocessing, post-processing, and multi-threaded pipeline configuration.
- **General resources:** We strongly recommend reviewing **RDK Model Zoo** ( [https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo) ), which includes official deployment examples, pre/post-processing code, and performance optimization tips for multiple YOLO versions (and other mainstream models).

### Q5: When deploying YOLOv5, I encounter an error like `can't reshape xxx in (84,84,3,85)` . How do I fix it?

**A:** This error is usually caused by a mismatch between the preset **number of classes (num_classes)** in the post-processing code and the number of classes in your trained and exported model. For example, `85` usually represents `(x, y, w, h, confidence + num_classes)` . If your model was trained on the COCO dataset (80 classes), then `num_classes` is 80, for a total of `5 + 80 = 85` output channels. If you trained a model with a custom number of classes (for example, 10 classes), this should be `5 + 10 = 15` .

- **Solution:** Find the YOLOv5 post-processing code file you are using (usually a Python script) and modify the defined class count parameter to match your model's actual number of classes.
- **Reference:** The [YOLOv5s v2.0 training and conversion post](https://developer.d-robotics.cc/forumDetail/163807123501918330) mentioned above may also include instructions for modifying the class count.

### Q6: When deploying YOLOv5, detection results show a very large number of irregular bounding boxes. What is the cause?

**A:** This is usually caused by a mismatch between the ONNX model output head structure and what the board-side post-processing code expects.

- **Possible cause 1: The output head was not modified according to BPU requirements.**
- In higher YOLOv5 versions (for example, tag 2.0 and above), the officially exported ONNX model output layer may include feature decoding (for example, directly outputting bounding box coordinates and class scores), or may not separate the large, medium, and small feature map outputs.
- D-Robotics RDK BPU deployment usually requires ONNX model outputs to be raw feature maps, with these three feature maps as independent output nodes.
- **Example images (top: incorrect; bottom: partially correct but still needs adjustment):**![YOLOv5 incorrect output head example](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/AI_toolchain/3.png)![YOLOv5 incorrect output head example](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/AI_toolchain/4.jfif)*Top image: feature maps not separated and decoding included. Bottom image: feature maps separated, but Sigmoid may have been added incorrectly or NHWC conversion may be missing.*
- **Solution:**
- You need to modify the YOLOv5 export script (usually `models/yolo.py` or a similar file) to ensure that when exporting the ONNX model:
1. Remove the detection head at the end of the model (decoding layer, NMS, etc.).
2. Export the three feature maps at different scales (P3, P4, P5 or corresponding layers) as independent output nodes.
3. Ensure the output dimension order meets toolchain requirements (for example, sometimes NCHW must be converted to NHWC).
4. Do not incorrectly add unnecessary activation functions (such as Sigmoid) after the final output layer unless the post-processing code explicitly requires them.
- **Reference tutorial:**[High-version YOLOv5 output layer modification guide](https://developer.d-robotics.cc/forumDetail/177840589839214598) describes the modification in detail.

### Q7: When deploying YOLOv5, detection results show abnormally arranged bounding boxes with a periodic pattern. What is the cause?

**A:**

- **Possible cause: Output dimensions do not match post-processing.**
- If the YOLOv5 model you use (for example, official releases below tag 2.0) exports ONNX with 5-dimensional output heads (for example, `[batch, num_anchors, grid_h, grid_w, (x,y,w,h,conf+classes)]` or a flattened form such as `[batch, num_anchors* (5+num_classes), grid_h, grid_w]` ).
- When the D-Robotics BPU toolchain compiles such models directly, dimension handling or post-processing expectations may truncate or incorrectly parse a dimension, resulting in abnormally arranged bounding boxes with a periodic pattern.
- **Example image:**![YOLOv5 periodic abnormal bounding box example](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/AI_toolchain/5.png) * **Solution:**
- The recommended approach is to convert outputs to explicit 4D tensors when exporting the ONNX model (for example, NHWC format: `[batch, grid_h, grid_w, num_anchors*(5+num_classes)]` ), and then parse and decode correctly in board-side post-processing according to this NHWC output format (for example, reshape back to 5D or perform the corresponding anchor calculations).
- Ensure your post-processing logic fully matches the final output dimensions and layout of the ONNX model.

### Q8: When deploying YOLOv5, bounding box positions are shifted overall. What is the cause?

**A:**

1. **Render size does not match the original image size:**
- Bounding box coordinates computed by post-processing are usually relative to the model input image size (for example, 640x640). If you draw these coordinates directly on an original image or display canvas of a different size without the corresponding scaling and translation, the bounding boxes will appear shifted.
- **Solution:** Before rendering bounding boxes, map model output coordinates back to the original image coordinate system using scale factors ( `original image width / model input width` , `original image height / model input height` ). If padding was applied before model input, reverse mapping must also account for removing the padding effect.
2. Bounding box coordinates computed by post-processing are usually relative to the model input image size (for example, 640x640). If you draw these coordinates directly on an original image or display canvas of a different size without the corresponding scaling and translation, the bounding boxes will appear shifted.
3. **Solution:** Before rendering bounding boxes, map model output coordinates back to the original image coordinate system using scale factors ( `original image width / model input width` , `original image height / model input height` ). If padding was applied before model input, reverse mapping must also account for removing the padding effect.
4. **Anchors mismatch:**
- YOLOv5 bounding box decoding depends on preset anchor boxes (anchors). If one set of anchors was used during model training but a different set (or different anchor order or scaling) is used in post-processing, decoded bounding box positions and sizes will be incorrect.
- **Solution:** Ensure the anchor parameters used in post-processing (usually 18 numbers representing width and height of 3 anchors per layer on 3 feature maps) exactly match the anchors used during model training.
5. YOLOv5 bounding box decoding depends on preset anchor boxes (anchors). If one set of anchors was used during model training but a different set (or different anchor order or scaling) is used in post-processing, decoded bounding box positions and sizes will be incorrect.
6. **Solution:** Ensure the anchor parameters used in post-processing (usually 18 numbers representing width and height of 3 anchors per layer on 3 feature maps) exactly match the anchors used during model training.

### Q9: When deploying YOLOv5, all bounding boxes abnormally cluster in the upper-left corner of the image. What could be the cause?

**A:**

- **Possible cause: Post-processing library parameter passing issue (specifically in examples on certain system versions).**
- In RDK OS 3.0.0 and above, examples such as `/app/pydev_demo/07_yolov5_sample` may use CPython-wrapped post-processing libraries. If key parameters such as the number of classes used during model training are not correctly passed to the initialization or invocation interface of this post-processing library, decoding logic may fail and cause bounding boxes to cluster in the upper-left corner.
- **Example image:**![YOLOv5 bounding boxes clustered in upper-left corner example](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/AI_toolchain/7.png) * **Solution:**
- **Recommended: use post-processing from RDK Model Zoo:** For YOLOv5 and similar models, we strongly recommend referencing or directly using the post-processing code provided in **RDK Model Zoo** ( [https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo) ). Implementations in Model Zoo are usually more robust, better optimized, and more closely aligned with the toolchain.
- **Check parameter passing:** If you insist on using the onboard example post-processing, carefully review the example code and ensure all necessary parameters (such as class count, input resolution, anchors, confidence threshold, NMS threshold, etc.) are correctly configured and passed to the post-processing function or class.

### Q10: When running the onboard `/app/pydev_demo/07_yolov5_sample` example with my own model, I get `Segmentation fault` . What should I do?

**A:**

- **Cause:** Onboard official example programs (such as `07_yolov5_sample` ) are usually **adapted and tested for their bundled pre-converted `.bin` models** . The example's preprocessing, model loading, BPU inference calls, and post-processing logic are all designed around that specific bundled model.
- If you replace the `.bin` file in the example with your own YOLOv5 model (which may differ in structure, inputs/outputs, and post-processing logic) without modifying the example code's preprocessing, post-processing, or model parameters accordingly, `Segmentation fault` is very likely due to data format mismatch, out-of-bounds memory access, and similar issues.
- **Solution:**
1. **Do not expect it to work by simply replacing the bin file:** In principle, for models you train and convert yourself, you need to write or modify a complete inference program (including preprocessing, BPU inference API calls, and post-processing).
2. **Refer to RDK Model Zoo:** For common models such as YOLOv5, we strongly recommend referencing the corresponding deployment examples in **RDK Model Zoo** ( [https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo) ). Model Zoo usually provides more general and clearer preprocessing and post-processing implementations that you can adapt for your own model.
3. **Understand post-processing:** Study YOLOv5 post-processing principles carefully (including anchor decoding, confidence filtering, NMS, etc.) and ensure your post-processing code fully matches your model output feature map format, dimensions, and content.

### Q11: Model inference detects nothing, or results are far worse than expected. What should I check (Pipeline inspection workflow)?

**A:** When deployed model performance is poor or produces no output, systematically inspect the entire inference pipeline:

1. **Data preprocessing check:**

- **Consistency with training:** This is the most critical point. Ensure deployment preprocessing (such as resize method, normalization parameters, mean/variance, color space conversion such as RGB/BGR, letterbox padding method and color, etc.) is **exactly the same** as preprocessing used during model training. Any subtle difference can sharply degrade model performance.
- **Visualize preprocessing results:** Save preprocessed image data (for example, save processed images if input is an image; visualize if input is a numpy array) and compare with data fed to the model during training.
- **Toolchain `yaml` configuration:** When using the D-Robotics toolchain for model conversion (PTQ), the `yaml` configuration file contains preprocessing-related parameters (such as `norm_type` , `mean_value` , `std_value` , etc.). Ensure these settings correctly "offset" preprocessing applied before calibration data is fed to the toolchain, so calibration data seen by the toolchain matches the input distribution before the first convolution layer during training.
2. **Consistency with training:** This is the most critical point. Ensure deployment preprocessing (such as resize method, normalization parameters, mean/variance, color space conversion such as RGB/BGR, letterbox padding method and color, etc.) is **exactly the same** as preprocessing used during model training. Any subtle difference can sharply degrade model performance.
3. **Visualize preprocessing results:** Save preprocessed image data (for example, save processed images if input is an image; visualize if input is a numpy array) and compare with data fed to the model during training.
4. **Toolchain `yaml` configuration:** When using the D-Robotics toolchain for model conversion (PTQ), the `yaml` configuration file contains preprocessing-related parameters (such as `norm_type` , `mean_value` , `std_value` , etc.). Ensure these settings correctly "offset" preprocessing applied before calibration data is fed to the toolchain, so calibration data seen by the toolchain matches the input distribution before the first convolution layer during training.
5. **Model conversion process check:**

- **Toolchain version:** Use the latest stable algorithm toolchain recommended by the official documentation.
- **`yaml` configuration:** Carefully review the `yaml` configuration file used during model conversion and ensure all parameters (such as input node name, output node name, input data type, input layout, model type, BPU architecture, etc.) are set correctly.
- **Calibration dataset (PTQ):**
- Calibration dataset quality and representativeness are critical to PTQ quantized model accuracy. The dataset should match the data distribution of your actual application scenario.
- Calibration data preprocessing, as described above, must be consistent with deployment (or calibration data fed to the toolchain should be "reverse-preprocessed" so the toolchain can perform correct quantization calibration internally).
- **Quantization-sensitive layer analysis:** If accuracy drops significantly after PTQ, use toolchain accuracy analysis tools (such as layer-by-layer comparison and dumping layer data) to identify quantization-sensitive layers, then try mixed-precision quantization (some layers use higher precision or float) or QAT (quantization-aware training).
- **Conversion logs:** Carefully read the complete log output from the toolchain during model conversion and look for any errors, warnings, or hints.
6. **Toolchain version:** Use the latest stable algorithm toolchain recommended by the official documentation.
7. **`yaml` configuration:** Carefully review the `yaml` configuration file used during model conversion and ensure all parameters (such as input node name, output node name, input data type, input layout, model type, BPU architecture, etc.) are set correctly.
8. **Calibration dataset (PTQ):**
- Calibration dataset quality and representativeness are critical to PTQ quantized model accuracy. The dataset should match the data distribution of your actual application scenario.
- Calibration data preprocessing, as described above, must be consistent with deployment (or calibration data fed to the toolchain should be "reverse-preprocessed" so the toolchain can perform correct quantization calibration internally).
9. Calibration dataset quality and representativeness are critical to PTQ quantized model accuracy. The dataset should match the data distribution of your actual application scenario.
10. Calibration data preprocessing, as described above, must be consistent with deployment (or calibration data fed to the toolchain should be "reverse-preprocessed" so the toolchain can perform correct quantization calibration internally).
11. **Quantization-sensitive layer analysis:** If accuracy drops significantly after PTQ, use toolchain accuracy analysis tools (such as layer-by-layer comparison and dumping layer data) to identify quantization-sensitive layers, then try mixed-precision quantization (some layers use higher precision or float) or QAT (quantization-aware training).
12. **Conversion logs:** Carefully read the complete log output from the toolchain during model conversion and look for any errors, warnings, or hints.
13. **BPU inference and board-side Runtime check:**

- **Input data preparation:** Ensure data fed to the board-side BPU inference interface exactly matches the input format (layout, data type, shape) defined during model conversion.
- **Memory management:** Check whether input/output buffer allocation and copying are correct, and whether there is memory corruption or out-of-bounds access.
- **Runtime version:** Ensure the BPU driver and Runtime libraries ( `libdnn.so` , etc.) on the board are compatible with the toolchain version used during model conversion.
- **API calls:** Check whether BPU inference API call order and parameter settings are correct.
14. **Input data preparation:** Ensure data fed to the board-side BPU inference interface exactly matches the input format (layout, data type, shape) defined during model conversion.
15. **Memory management:** Check whether input/output buffer allocation and copying are correct, and whether there is memory corruption or out-of-bounds access.
16. **Runtime version:** Ensure the BPU driver and Runtime libraries ( `libdnn.so` , etc.) on the board are compatible with the toolchain version used during model conversion.
17. **API calls:** Check whether BPU inference API call order and parameter settings are correct.
18. **Postprocessing check:**

- **Match model output:** Ensure post-processing logic (such as parsing output feature maps, decoding bounding boxes, applying NMS, threshold handling, etc.) fully matches the format, dimensions, and meaning of actual output nodes after model conversion.
- **Parameter consistency:** Parameters used in post-processing (such as anchors, class count, confidence threshold, NMS threshold, score_threshold, etc.) must match model design and training.
- **Coordinate mapping:** If necessary, ensure model output coordinates are correctly mapped back to original image dimensions.
- **Logic errors:** Carefully check post-processing code for logic bugs.
19. **Match model output:** Ensure post-processing logic (such as parsing output feature maps, decoding bounding boxes, applying NMS, threshold handling, etc.) fully matches the format, dimensions, and meaning of actual output nodes after model conversion.
20. **Parameter consistency:** Parameters used in post-processing (such as anchors, class count, confidence threshold, NMS threshold, score_threshold, etc.) must match model design and training.
21. **Coordinate mapping:** If necessary, ensure model output coordinates are correctly mapped back to original image dimensions.
22. **Logic errors:** Carefully check post-processing code for logic bugs.
23. **End-to-end validation:**

- **Use known inputs and outputs:** Ideally, have samples from the training or validation set for which you know the correct detection results (Ground Truth). Run these samples through your entire deployment pipeline and compare actual output with expected output.
- **Module-by-module validation:** If possible, split the pipeline into preprocessing, model inference, post-processing, and other modules, and validate input/output for each module separately.
24. **Use known inputs and outputs:** Ideally, have samples from the training or validation set for which you know the correct detection results (Ground Truth). Run these samples through your entire deployment pipeline and compare actual output with expected output.
25. **Module-by-module validation:** If possible, split the pipeline into preprocessing, model inference, post-processing, and other modules, and validate input/output for each module separately.

### Q12: How do I obtain board-side `hrt_*` performance analysis tools (such as `hrt_model_exec` , `hrt_bpu_monitor` , etc.)?

**A:** D-Robotics RDK system images, or packages released with the algorithm toolchain/SDK, usually include command-line tools for board-side model execution, performance analysis, and debugging. These generally start with `hrt_` (Horizon Robotics Tool).

- **Where to find them:**
- These tools may be preinstalled in RDK system images under paths such as `/usr/bin` or `/opt/hobot/bin` .
- They may also be included in a subdirectory of the algorithm toolchain package you download (after extraction), for example `ddk/package/board/<target_os>/bin/` or similar paths. You may need to manually copy these tools to an executable path on the board (such as `/usr/local/bin` ) or run them by specifying the full path on the board.
- **Official resource posts:** The D-Robotics developer community usually has dedicated posts or documentation explaining how to obtain and use these board-side tools. For example, this post previously provided related information: [Board-side hrt_* tool download and usage guide](https://developer.d-robotics.cc/forumDetail/228559182180396599) (please confirm the link and content are still up to date)
- **Common tools:**
- `hrt_model_exec` : Executes converted `.bin` models on the board for inference validation and performance testing.
- `hrt_bpu_monitor` (or `hrut_somstatus` , performance printing in `bpu_predict_xN_sample` ): Monitors real-time BPU utilization, frequency, temperature, and other status.
- Other specific debugging tools.
Please refer to the latest RDK documentation or community resources for accurate information and download methods for these tools.

### Model Quantization Errors and Solutions

#### hb_mapper checker (01_check.sh) Model Validation Errors

[Issue]
```bash
ERROR The shape of model input:input is [xxx] which has dimensions of 0. Please specify input-shape parameter.
```

[Solution]
- This error may occur because the model input has a dynamic shape. For this error, use the `--input-shape input_name input_shape` parameter to specify the input node shape.
[Issue]
```bash
ERROR HorizonRT not support these cpu operators: {op_type}
```

[Solution]
- This error may occur because the CPU operator used is not supported by D-Robotics. Replace the operator according to our operator support list. If the unsupported CPU operator is a core model operator, contact D-Robotics for development evaluation.
[Issue]
```bash
Unsupported op {op_type}
```

[Solution]
- This error may occur because the BPU operator used is not supported by D-Robotics. If overall model performance meets your needs, you may ignore this log. Otherwise, replace the operator according to our operator support list.
[Issue]
```bash
ERROR nodes:['{op_type}'] are specified as domain:xxx, which are not supported by official onnx. Please check whether these ops are official onnx ops or defined by yourself
```

[Solution]
- This error may occur because the custom operator used is not supported by D-Robotics. Replace the operator according to our operator support list, or refer to custom operator development to register a custom CPU operator.

#### hb_mapper makertbin (03_build.sh) Model Conversion Errors

[Issue]
```bash
Layer `{op_name}`  
    xxx expect data shape range:[[xxx][xxx]], but the data shape is [xxx]
Layer `{op_name}`
    Tensor xxx expects be n dimensions, but m provided
```

[Solution]
- This error may occur because operator `{op_name}` exceeded supported limits and was fallback to CPU execution. If the CPU operator performance overhead is acceptable, you can ignore this message. Otherwise, modify the op to a BPU-supported range according to our operator support list.
[Issue]
```bash
INFO： Layer `{op_name}` will be executed on CPU
```

[Solution]
- This error may occur because operator `{op_name}` was fallback to CPU execution because shape (CxHxW) exceeded 8192. If only a few operators fallback to CPU and overall performance meets requirements, you can ignore this message. Otherwise, check the operator support list and replace with other BPU operators without shape limits.
[Issue]
```bash
ERROR There is an error in pass: `{op_name}`. Error message:xxx
```

[Solution]
- This error may occur because optimization of operator `{op_name}` failed. Collect the model and `.log` files and provide them to D-Robotics technical support for analysis.
[Issue]
```bash
Error There is an error in pass:constant_folding. Error message: Could not find an implementation for the node `{op_name}`
```

[Solution]
- This error may occur because onnxruntime does not yet support this operator. Replace the operator according to our operator support list. If the unsupported operator is a core operator, contact D-Robotics for development evaluation.
[Issue]
```bash
WARNING input shape [xxx] has length: n  ERROR list index out of range
```

[Solution]
- This error may occur because non-4D model inputs are currently not supported. Modify the model input to 4D (for example, HxW -> 1x1xHxW).
[Issue]
```bash
Start to parse the onnx model
core dump
```

[Solution]
- This error may occur because model parsing failed (possibly because only one output/input node was assigned a name when exporting the model). Re-export the ONNX model and verify its validity (do not specify output/input names when exporting, or assign names to each output/input node sequentially).
[Issue]
```bash
Start to calibrate/quantize the model
core dump

Start to compile the model 
core dump
```

[Solution]
- This error may occur because model quantization/compilation failed. Collect the model and `.log` files and provide them to D-Robotics technical support for analysis.
[Issue]
```bash
ERROR model conversion faild: Inferred shape and existing shape differ in dimension x: (n) vs (m)
```

[Solution]
- This error may occur because the ONNX model input shape is invalid, or a toolchain optimization pass is incorrect. Ensure the ONNX model is valid. If the ONNX model can infer normally, provide the model to D-Robotics technical support for analysis.
[Issue]
```bash
WARNING got unexpected input/output/sumin threshold on conv `{op_name}`! value: xxx
```

[Solution]
- This error may occur because data preprocessing is incorrect, or the node weight values are too small/large. 1. Check whether data preprocessing is correct; 2. We recommend using a BN operator to optimize the data distribution.
[Issue]
```bash
ERROR hbdk-cc compile hbir model failed with returncode -n
```

[Solution]
- This error may occur because model compilation failed. Collect the model and `.log` files and provide them to D-Robotics technical support for analysis.
[Issue]
```bash
ERROR {op_type}  only support 4 dim input
```

[Solution]
- This error may occur because the toolchain does not yet support non-4D input dimensions for this op. Adjust the op input dimensions to 4D.
[Issue]
```bash
ERROR {op_type} Not support this attribute/mode=xxx
```

[Solution]
- This error may occur because the toolchain does not yet support this op attribute. Replace the operator according to our operator support list, or contact D-Robotics for development evaluation.
[Issue]
```bash
ERROR There is no node can execute on BPU in this model, please make sure the model has at least one conv node which is supported by BPU.
```

[Solution]
- This error may occur because there are no quantizable BPU nodes in the model. Ensure the ONNX model is valid and contains at least one conv node. If these conditions are met, collect the model and `.log` files and provide them to D-Robotics technical support for analysis.
[Issue]
```bash
ERROR [ONNXRuntimeError] : 9 : NOT_IMPLEMENTED : could not find a implementation for the node of `{op_name}`:{op_type}(opset)
```

[Solution]
- This error may occur because the model opset version exceeds toolchain support limits. Re-export the model and ensure `opset_version=10 or 11` .
[Issue]
```bash
ERROR The opset version of the onnx model is n, only model with opset_version 10/11 is supported
```

[Solution]
- This error may occur because the model opset version exceeds toolchain support limits. Re-export the model and ensure `opset_version=10 or 11` .
[Issue]
```bash
Conversion error after using run_on_bpu.
```

[Solution]
- This error may occur because run_on_bpu is not currently supported for this operator. `run_on_bpu` currently only supports specifying `Relu/Softmax/pooling (maxpool, avgpool, etc.)` operators at the model tail and CPU*+Transpose combinations (by declaring the `Transpose` node name, both `CPU*+Transpose` can run on BPU; CPU* refers to ops supported by BPU). If the above conditions are met but `run_on_bpu` still fails, contact D-Robotics technical support for analysis. If the conditions are not met, contact D-Robotics for development evaluation.
[Issue]
```bash
ERROR tool limits for max output num is 32
```

[Solution]
- This error may occur because the toolchain only supports up to 32 model output nodes. Keep the number of model output nodes within 32.
[Issue]
```bash
ERROR xxx file parse failed.
ERROR xxx does not exist in xxx.
```

[Solution]
- This error may occur because the environment is configured incorrectly. Use the Docker environment provided by D-Robotics for quantization.
[Issue]
```bash
ERROR exception in command: makertbin.
ERROR cannot reshape array of size xxx into shape xxx.
```

[Solution]
- This error may occur because of abnormal data preprocessing. Refer to preprocessing-related information in our documentation.
[Issue]
```bash
ERROR load cal data for input xxx error
ERROR cannot reshape array of size xxx into shape xxx
```

[Solution]
- This error may occur because the toolchain version does not match. Use the corresponding toolchain version in the SDK we provide.
[Issue]
```bash
ERROR [ONNXRuntimeError] : 1 : FAIL : Non-zero status code returned while running HzCalibration node.Name:'xxx'Status Message :CUDA error cudaErrorNoKernelImageForDevice:no kernel image is available for execution on the device
```

[Solution]
- This error may occur because Docker was loaded incorrectly. Try using the nvidia-docker load command when starting Docker.
[Issue]
```bash
[ONNXRuntimeError] : 10 : INVALID_GRAPH : Load model from xxx.onnx failed:This is an invalid model. In Node, ("xxx", HzSQuantizedPreprocess, "", -1) : ("images": tensor(int8),"xxx": tensor(int8),"xxx": tensor(int32),"xxx": tensor(int8),) -> ("xxx": tensor(int8),) , Error No Op registered for HzSQuantizedPreprocess with domain_version of 11
```

[Solution]
- This error may occur because the ONNX version does not match. Re-export the ONNX model with opset 10 and use OpenCV for preprocessing.
[Issue]
```bash
[E:onnxruntime:, sequential_executor.cc:183 Execute] Non-zero status code returned while running Resize node. Name:'xxx' Status Message: upsample.h:299 void onnxruntime::UpsampleBase::ScalesValidation(const std::vector<float>&, onnxruntime::UpsampleMode) const scales.size() == 2 || (scales.size() == 4 && scales[0] == 1 && scales[1] == 1) was false. 'Linear' mode and 'Cubic' mode only support 2-D inputs ('Bilinear', 'Bicubic') or 4-D inputs with the corresponding outermost 2 scale values being 1 in the Resize operator
```

[Solution]
- This error may be an onnxruntime issue. Batch calibration is not supported; calibrate one image at a time because the model contains reshape operations and dimensions mismatch after batching. This does not affect the result.
[Issue]
```bash
ERROR No guantifiable nodes were found, and the model is not supported
```

[Solution]
- This error may occur because the model structure does not contain output nodes.

### Algorithm Model Board Deployment Errors and Solutions

[Issue]
```bash
(common.h:79): HR:ERROR: op_name:xxx invalid attr key xxx
```

[Solution]
- This error may occur because libDNN does not yet support a certain attribute of this op. Replace the operator according to our operator support list, or contact D-Robotics for development evaluation.
[Issue]
```bash
(hb_dnn_ndarray.cpp:xxx): data type of ndarray do not match specified type. NDArray dtype_: n, given：m
```

[Solution]
- This error may occur because libDNN does not yet support this input type (we will gradually move operator constraints to the model conversion stage in future releases). Replace the operator according to our operator support list, or contact D-Robotics for development evaluation.
[Issue]
```bash
(validate_util.cpp:xxx)：tensor aligned shape size is xxx , but tensor hbSysMem memSize is xxx, tensor hbSysMem memSize should >= tensor aligned shape size!
```

[Solution]
- This error may occur because insufficient memory was allocated for input data. Use `hbDNNTensorProperties.alignedByteSize` to allocate memory.
[Issue]
```bash
(bpu_model_info.cpp:xxx): HR:ERROR: hbm model input feature names must be equal to graph node input names
```

[Solution]
- For this error, fully update to the latest toolchain SDK development package.

### Model Quantization and Board Deployment Tips

#### Transformer Usage Guide

This section explains the concepts and parameters of each transformer and provides reference examples to help you use transformers.

Before reading this section, please note the following:

- Image data is `3-dimensional` , but D-Robotics transformers obtain and process data as `4-dimensional` data. A transformer only applies the operation to the `0th` image in the input data.

##### AddTransformer

**Description:**

Adds `value` to every pixel in the input image. This transformer converts output data to float32.

**Parameters:**

- value: The value added to each pixel. Note that value can be negative, such as -128.
**Usage examples:**

```bash
# Subtract 128 from image data
  AddTransformer(-128)

  # Add 127 to image data
  AddTransformer(127)
```

##### MeanTransformer

**Description:**

Subtracts mean_value from every pixel in the input image.

**Parameters:**

- means: The value subtracted from each pixel. Note that the value can be negative, such as -128.
- data_format: Input layout type. Valid values: ["CHW", "HWC"]. Default: "CHW".
**Usage examples:**

```bash
# Subtract 128.0 from each pixel; input layout is CHW
  MeanTransformer(np.array([128.0, 128.0, 128.0])) 

  # Subtract different values 103.94, 116.78, 123.68 from each pixel; input layout is HWC
  MeanTransformer(np.array([103.94, 116.78, 123.68]), data_format="HWC")
```

##### ScaleTransformer

**Description:**

Multiplies every pixel in the input image by the data_scale coefficient.

**Parameters:**

- scale_value: The coefficient to multiply by, such as 0.0078125 or 1/128.
**Usage examples:**

```bash
# Scale pixel values from range -128~127 to -1~1
  ScaleTransformer(0.0078125) 
  # or
  ScaleTransformer(1/128)
```

##### NormalizeTransformer

**Description:**

Normalizes the input image. This transformer converts output data to float32.

**Parameters:**

- std: The value by which to divide pixels in the first input image.
**Usage examples:**

```bash
# Scale pixel values from range [-128, 127] to -1~1
  NormalizeTransformer(128)
```

##### TransposeTransformer

**Description:**

Performs layout conversion.

**Parameters:**

- order: The dimension order after layout conversion (depends on the original layout order). For example, HWC order is 0,1,2; to convert to CHW, order is (2,0,1).
**Usage examples:**

```bash
# Convert HWC to CHW
  TransposeTransformer((2, 0, 1))
  # Convert CHW to HWC
  TransposeTransformer((1, 2, 0))
```

##### HWC2CHWTransformer

**Description:**

Converts NHWC to NCHW.

**Parameters:**Not applicable.

**Usage examples:**

```bash
# Convert NHWC to NCHW
  HWC2CHWTransformer()
```

##### CHW2HWCTransformer

**Description:**

Converts NCHW to NHWC.

**Parameters:**Not applicable.

**Usage examples:**

```bash
# Convert NCHW to NHWC
  CHW2HWCTransformer()
```

##### CenterCropTransformer

**Description:**

Crops a square image from the center by direct truncation. This transformer converts output to float32. When data_type is uint8, output is uint8.

**Parameters:**

- crop_size: Side length of the center-cropped square.
- data_type: Output type. Valid values: ["float", "uint8"].
**Usage examples:**

```bash
# Center crop to 224*224; default output type is float32
  CenterCropTransformer(crop_size=224) 

  # Center crop to 224*224; output type is uint8
  CenterCropTransformer(crop_size=224, data_type="uint8")
```

##### PILCenterCropTransformer

**Description:**

Crops a square image from the center using PIL. This transformer converts output to float32.

**Parameters:**

- size: Side length of the center-cropped square.
**Usage examples:**

```bash
# Center crop to 224*224 using PIL
  PILCenterCropTransformer(size=224)
```

##### LongSideCropTransformer

**Description:**

Performs long-side cropping. This transformer converts output to float32.

When width is greater than height, crops a centered square based on height. For example, width 100 and height 70 becomes 70*70 after cropping.

When height is greater than width, crops a centered rectangle with unchanged width and height of half the difference plus width. For example, width 70 and height 100 becomes `70*((100-70)/2+70)` , that is, a 70*85 rectangle.

**Parameters:**Not applicable.

**Usage examples:**

```bash
LongSideCropTransformer()
```

##### PadResizeTransformer

**Description:**

Enlarges the image using padding. This transformer converts output to float32.

**Parameters:**

- target_size: Target size as a tuple, such as (240,240).
- pad_value: Value used for padding. Default: 127.
- pad_position: Padding position. Valid values: ["boundary", "bottom_right"]. Default: "boundary".
**Usage examples:**

```bash
# Pad to 512*512, bottom-right padding, pad value 0
  PadResizeTransformer((512, 512), pad_position='bottom_right', pad_value=0)

  # Pad to 608*608, border padding, pad value 127
  PadResizeTransformer(target_size=(608, 608))
```

##### ResizeTransformer

**Description:**

Resizes the image.

**Parameters:**

- target_size: Target size as a tuple, such as (240,240).
- mode: Image processing mode. Valid values: ("skimage", "opencv"). Default: "skimage".
- method: Interpolation method. Only effective when mode is skimage. Valid range: 0–5. Default: 1. Values:

- 0: Nearest-neighbor;
- 1: Bi-linear (default);
- 2: Bi-quadratic;
- 3: Bi-cubic;
- 4: Bi-quartic;
- 5: Bi-quintic.
- data_type: Output type. Valid values: (uint8, float). Default: float. When set to uint8, output is uint8; otherwise float32.
- interpolation: Interpolation method. Only effective when mode is opencv. Default: empty. Valid values: (OpenCV interpolation methods). Currently interpolation only supports empty or OpenCV INTER_CUBIC. When empty, INTER_LINEAR is used by default.

OpenCV interpolation methods and descriptions (unsupported methods will be added in future releases):

- INTER_NEAREST: nearest-neighbor interpolation;
- INTER_LINEAR: bilinear interpolation; used by default when interpolation is empty.
- INTER_CUBIC: bicubic interpolation over a 4x4 pixel neighborhood.
- INTER_AREA: resampling using pixel area relation. Preferred for image decimation because it can avoid moiré patterns. When scaling images, behaves similarly to INTER_NEAREST.
- INTER_LANCZOS4: Lanczos interpolation over an 8x8 neighborhood.
- INTER_LINEAR_EXACT: bit-exact bilinear interpolation.
- INTER_NEAREST_EXACT: bit-exact nearest-neighbor interpolation. Produces the same result as nearest-neighbor in PIL, scikit-image, or Matlab.
- INTER_MAX: interpolation code mask.
- WARP_FILL_OUTLIERS: flag to fill all destination image pixels. Outliers from the source image are set to zero.
- WARP_INVERSE_MAP: flag for inverse transform.
**Usage examples:**

```bash
# Resize input to 224*224 using OpenCV with bilinear interpolation; output float32
  ResizeTransformer(target_size=(224, 224), mode='opencv', method=1)

  # Resize input to 256*256 using skimage with bilinear interpolation; output float32
  ResizeTransformer(target_size=(256, 256))

  # Resize input to 256*256 using skimage with bilinear interpolation; output uint8
  ResizeTransformer(target_size=(256, 256), data_type="uint8")
```

##### PILResizeTransformer

**Description:**

Resizes the image using the PIL library.

**Parameters:**

- size: Target size as a tuple, such as (240,240).
- interpolation: Interpolation method. Valid values: (Image.NEAREST, Image.BILINEAR, Image.BICUBIC, Image.LANCZOS). Default: Image.BILINEAR.

- Image.NEAREST: nearest-neighbor sampling;
- Image.BILINEAR: bilinear interpolation;
- Image.BICUBIC: bicubic spline interpolation;
- Image.LANCZOS: high-quality downsampling filter.
**Usage examples:**

```bash
# Resize input to 256*256 with bilinear interpolation
  PILResizeTransformer(size=256)

  # Resize input to 256*256 with Lanczos downsampling filter
  PILResizeTransformer(size=256, interpolation=Image.LANCZOS)
```

##### ShortLongResizeTransformer

**Description:**

Scales the input image while preserving aspect ratio. New image size depends on configured parameters. Steps:

1. Divide short_size by the smaller of the original image width and height to get the scale factor.
2. When scale factor multiplied by the larger of original width and height exceeds long_size, change scale factor to long_size divided by the larger of original width and height.
3. Use OpenCV resize with the scale factor obtained above to resize the image.
**Parameters:**

- short_size: Expected length of the short side after cropping.
- long_size: Expected length of the long side after cropping.
- include_im: Default True. When True, returns both the processed image and the original image.
**Usage examples:**

```bash
# Short side 20, long side 100; return processed and original images
  ShortLongResizeTransformer(short_size=20, long_size=100)
```

##### PadTransformer

**Description:**

Divides target size by the maximum of input image width or height as a coefficient, multiplies original width and height by this coefficient to resize the image. Then based on the new image size, divides by size_divisor, rounds up, multiplies by size_divisor to get new width and height, and generates a new image.

**Parameters:**

- size_divisor: Size divisor. Default: 128.
- target_size: Target size. Default: 512.
**Usage examples:**

```bash
# Pad size 1024*1024
  PadTransformer(size_divisor=1024, target_size=1024)
```

##### ShortSideResizeTransformer

**Description:**

Center-crops a new image size based on the expected short-side length and current aspect ratio.

**Parameters:**

- short_size: Expected short-side length.
- data_type: Output type. Valid values: ("float", "uint8"). Default "float32" outputs float32; when set to uint8, output is uint8.
- interpolation: Interpolation method from OpenCV. Default: empty.

Currently interpolation only supports empty or OpenCV INTER_CUBIC. When empty, INTER_LINEAR is used by default.

OpenCV interpolation methods and descriptions (unsupported methods will be added in future releases):

- INTER_NEAREST: nearest-neighbor interpolation;
- INTER_LINEAR: bilinear interpolation; used by default when interpolation is empty.
- INTER_CUBIC: bicubic interpolation over a 4x4 pixel neighborhood.
- INTER_AREA: resampling using pixel area relation. Preferred for image decimation because it can avoid moiré patterns. When scaling images, behaves similarly to INTER_NEAREST.
- INTER_LANCZOS4: Lanczos interpolation over an 8x8 neighborhood.
- INTER_LINEAR_EXACT: bit-exact bilinear interpolation.
- INTER_NEAREST_EXACT: bit-exact nearest-neighbor interpolation. Produces the same result as nearest-neighbor in PIL, scikit-image, or Matlab.
- INTER_MAX: interpolation code mask.
- WARP_FILL_OUTLIERS: flag to fill all destination image pixels. Outliers from the source image are set to zero.
- WARP_INVERSE_MAP: flag for inverse transform.
**Usage examples:**

```bash
# Resize short side to 256 with bilinear interpolation
  ShortSideResizeTransformer(short_size=256)

  # Resize short side to 256 with Lanczos interpolation over 8x8 neighborhood
  ShortSideResizeTransformer(short_size=256, interpolation=Image.LANCZOS4)
```

##### PaddedCenterCropTransformer

**Description:**

Center-crops the image using padding.

.. attention::

Only applicable to EfficientNet-lite related instance models.

Calculation method:

1. Compute coefficient: int(float(image_size) / (image_size + crop_pad)).
2. Compute center size: coefficient * np.minimum(original image height, original image width).
3. Perform center crop based on the computed size.
**Parameters:**

- image_size: Image size. Default: 224.
- crop_pad: Center padding size. Default: 32.
**Usage examples:**

```bash
# Crop size 240*240, pad value 32
  PaddedCenterCropTransformer(image_size=240, crop_pad=32)

  # Crop size 224*224, pad value 32
  PaddedCenterCropTransformer()
```

##### BGR2RGBTransformer

**Description:**

Converts input from BGR to RGB.

**Parameters:**

- data_format: Data format. Valid values: (CHW, HWC). Default: CHW.
**Usage examples:**

```bash
# Convert BGR to RGB when layout is NCHW
  BGR2RGBTransformer() 

  # Convert BGR to RGB when layout is NHWC
  BGR2RGBTransformer(data_format="HWC")
```

##### RGB2BGRTransformer

**Description:**

Converts input from RGB to BGR.

**Parameters:**

- data_format: Data format. Valid values: (CHW, HWC). Default: CHW.
**Usage examples:**

```bash
# Convert RGB to BGR when layout is NCHW
  RGB2BGRTransformer() 

  # Convert RGB to BGR when layout is NHWC
  RGB2BGRTransformer(data_format="HWC")
```

##### RGB2GRAYTransformer

**Description:**

Converts input from RGB to GRAY.

**Parameters:**

- data_format: Input layout type. Valid values: ("CHW", "HWC"). Default: "CHW".
**Usage examples:**

```bash
# Convert RGB to GRAY when layout is NCHW
  RGB2GRAYTransformer(data_format='CHW')

  # Convert RGB to GRAY when layout is NHWC
  RGB2GRAYTransformer(data_format='HWC')
```

##### BGR2GRAYTransformer

**Description:**

Converts input from BGR to GRAY.

**Parameters:**

- data_format: Input layout type. Valid values: ["CHW", "HWC"]. Default: "CHW".
**Usage examples:**

```bash
# Convert BGR to GRAY when layout is NCHW
  BGR2GRAYTransformer(data_format='CHW')

  # Convert BGR to GRAY when layout is NHWC
  BGR2GRAYTransformer(data_format='HWC')
```

##### RGB2GRAY_128Transformer

**Description:**

Converts input from RGB to GRAY_128. GRAY_128 value range is (-128,127).

**Parameters:**

- data_format: Input layout type. Valid values: ["CHW", "HWC"]. Default: "CHW". Required.
**Usage examples:**

```bash
# Convert RGB to GRAY when layout is NCHW_128
  RGB2GRAY_128Transformer(data_format='CHW')

  # Convert RGB to GRAY when layout is NHWC_128
  RGB2GRAY_128Transformer(data_format='HWC')
```

##### RGB2YUV444Transformer

**Description:**

Converts input from RGB to YUV444.

**Parameters:**

- data_format: Input layout type. Valid values: ["CHW", "HWC"]. Default: "CHW". Required.
**Usage examples:**

```bash
# Convert BGR to YUV444 when layout is NCHW
  BGR2YUV444Transformer(data_format='CHW')

  # Convert BGR to YUV444 when layout is NHWC
  BGR2YUV444Transformer(data_format='HWC')
```

##### BGR2YUV444Transformer

**Description:**

Converts input from BGR to YUV444.

**Parameters:**

- data_format: Input layout type. Valid values: ["CHW", "HWC"]. Default: "CHW". Required.
**Usage examples:**

```bash
# Convert BGR to YUV444 when layout is NCHW
  BGR2YUV444Transformer(data_format='CHW')

  # Convert BGR to YUV444 when layout is NHWC
  BGR2YUV444Transformer(data_format='HWC')
```

##### BGR2YUV444_128Transformer

**Description:**

Converts input from BGR to YUV444_128. YUV444_128 value range is (-128,127).

**Parameters:**

- data_format: Input layout type. Valid values: ["CHW", "HWC"]. Default: "CHW". Required.
**Usage examples:**

```bash
# Convert BGR to YUV444 when layout is NCHW_128
  BGR2YUV444_128Transformer(data_format='CHW') 

  # Convert BGR to YUV444 when layout is NHWC_128
  BGR2YUV444_128Transformer(data_format='HWC')
```

##### RGB2YUV444_128Transformer

**Description:**

Converts input from RGB to YUV444_128. YUV444_128 value range is (-128,127).

**Parameters:**

- data_format: Input layout type. Valid values: ["CHW", "HWC"]. Default: "CHW". Required.
**Usage examples:**

```bash
# Convert RGB to YUV444_128 when layout is NCHW
  RGB2YUV444_128Transformer(data_format='CHW') 

  # Convert RGB to YUV444_128 when layout is NHWC
  RGB2YUV444_128Transformer(data_format='HWC')
```

##### BGR2YUVBT601VIDEOTransformer

**Description:**

Converts input from BGR to YUV_BT601_Video_Range.

YUV_BT601_Video_Range: some camera inputs use YUV BT601 (Video Range) format with value range 16–235. This transformer adapts to that format.

**Parameters:**

- data_format: Input layout type. Valid values: ["CHW", "HWC"]. Default: "CHW". Required.
**Usage examples:**

```bash
# Convert BGR to YUV_BT601_Video_Range when layout is NCHW
  BGR2YUVBT601VIDEOTransformer(data_format='CHW')

  # Convert BGR to YUV_BT601_Video_Range when layout is NHWC
  BGR2YUVBT601VIDEOTransformer(data_format='HWC')
```

##### RGB2YUVBT601VIDEOTransformer

**Description:**

Converts input from RGB to YUV_BT601_Video_Range.

YUV_BT601_Video_Range: some camera inputs use YUV BT601 (Video Range) format with value range 16–235. This transformer adapts to that format.

**Parameters:**

- data_format: Input layout type. Valid values: ["CHW", "HWC"]. Default: "CHW". Required.
**Usage examples:**

```bash
# Convert RGB to YUV_BT601_Video_Range when layout is NCHW
  RGB2YUVBT601VIDEOTransformer(data_format='CHW')

  # Convert RGB to YUV_BT601_Video_Range when layout is NHWC
  RGB2YUVBT601VIDEOTransformer(data_format='HWC')
```

##### YUVTransformer

**Description:**

Converts input to YUV444.

**Parameters:**

- color_sequence: Color sequence. Required.
**Usage examples:**

```bash
# Convert BGR-loaded image to YUV444
  YUVTransformer(color_sequence="BGR")

  # Convert RGB-loaded image to YUV444
  YUVTransformer(color_sequence="RGB")
```

##### ReduceChannelTransformer

**Description:**

Reduces the C channel to a single channel. Mainly for the C channel, e.g., shape 1 *3* 224 *224 to 1* 1 *224* 224. Ensure layout matches data_format to avoid deleting the wrong channel.

**Parameters:**

- data_format: Input layout type. Valid values: ["CHW", "HWC"]. Default: "CHW".
**Usage examples:**

```bash
# Remove C channel when layout is NCHW
  ReduceChannelTransformer()
  # or
  ReduceChannelTransformer(data_format="CHW") 

  # Remove C channel when layout is NHWC
  ReduceChannelTransformer(data_format="HWC")
```

##### BGR2NV12Transformer

**Description:**

Converts input from BGR to NV12.

**Parameters:**

- data_format: Input layout type. Valid values: ["CHW", "HWC"]. Default: "CHW".
- cvt_mode: Conversion mode. Valid values: (rgb_calc, opencv). Default: rgb_calc.

- rgb_calc: process image using mergeUV;
- opencv: process image using OpenCV.
**Usage examples:**

```bash
# Convert BGR to NV12 when layout is NCHW using rgb_calc
  BGR2NV12Transformer()
  # or
  BGR2NV12Transformer(data_format="CHW") 

  # Convert BGR to NV12 when layout is NHWC using opencv
  BGR2NV12Transformer(data_format="HWC", cvt_mode="opencv")
```

##### RGB2NV12Transformer

**Description:**

Converts input from RGB to NV12.

**Parameters:**

- data_format: Input layout type. Valid values: ["CHW", "HWC"]. Default: "CHW".
- cvt_mode: Conversion mode. Valid values: (rgb_calc, opencv). Default: rgb_calc.

- rgb_calc: process image using mergeUV;
- opencv: process image using OpenCV.
**Usage examples:**

```bash
# Convert RGB to NV12 when layout is NCHW using rgb_calc
  RGB2NV12Transformer()
  # or
  RGB2NV12Transformer(data_format="CHW") 

  # Convert RGB to NV12 when layout is NHWC using opencv
  RGB2NV12Transformer(data_format="HWC", cvt_mode="opencv")
```

##### NV12ToYUV444Transformer

**Description:**

Converts input from NV12 to YUV444.

**Parameters:**

- target_size: Target size as a tuple, such as (240,240).
- yuv444_output_layout: YUV444 output layout. Valid values: (HWC, CHW). Default: "HWC".
**Usage examples:**

```bash
# Layout NCHW, size 768*768, NV12 to YUV444
  NV12ToYUV444Transformer(target_size=(768, 768))

  # Layout NHWC, size 224*224, NV12 to YUV444
  NV12ToYUV444Transformer((224, 224), yuv444_output_layout="HWC")
```

##### WarpAffineTransformer

**Description:**

Performs image affine transformation.

**Parameters:**

- input_shape: Input shape value.
- scale: Multiplication coefficient.
**Usage examples:**

```bash
# Size 512*512, long-side scale 1.0
  WarpAffineTransformer((512, 512), 1.0)
```

##### F32ToS8Transformer

**Description:**

Converts input from float32 to int8.

**Parameters:**Not applicable.

**Usage examples:**

```bash
# Convert input from float32 to int8
  F32ToS8Transformer()
```

##### F32ToU8Transformer

**Description:**

Converts input from float32 to uint8.

**Parameters:**Not applicable.

**Usage examples:**

```bash
# Convert input from float32 to uint8
  F32ToU8Transformer()
```

#### YOLOv5x Model Usage Example

1. YOLOv5x model:

- Download the corresponding `.pt` file from [yolov5-2.0](https://github.com/ultralytics/yolov5/releases/tag/v2.0) .

When cloning the code, confirm that you use tag `v2.0` ; otherwise, conversion will fail.
- md5sum checksums:

| **md5sum** | **File** 
| 2e296b5e31bf1e1b6b8ea4bf36153ea5 | yolov5l.pt 
| 16150e35f707a2f07e7528b89c032308 | yolov5m.pt 
| 42c681cf466c549ff5ecfe86bcc491a0 | yolov5s.pt 
| 069a6baa2a741dec8a2d44a9083b6d6e | yolov5x.pt 

- To better adapt to post-processing code, we made the following modifications to the GitHub code before exporting the ONNX model (see code at: [https://github.com/ultralytics/yolov5/blob/v2.0/models/yolo.py](https://github.com/ultralytics/yolov5/blob/v2.0/models/yolo.py) ):

```python
def forward(self, x):
        # x = x.copy()  # for profiling
        z = []  # inference output
        self.training |= self.export
        for i in range(self.nl):
            x[i] = self.m[i](x[i])  # conv
            bs, _, ny, nx = x[i].shape  # x(bs,255,20,20) to x(bs,3,20,20,85)
            #  x[i] = x[i].view(bs, self.na, self.no, ny, nx).permute(0, 1, 3, 4, 2).contiguous()
            x[i] = x[i].permute(0, 2, 3, 1).contiguous()
```

- **Note:** Removed the 4D-to-5D reshape at the end of each output branch (that is, channels are not split from 255 into 3x85), then converted layout from NHWC to NCHW before output.

The left image below shows visualization of an output node before modification; the right image shows the corresponding output node after modification.

![yolov5](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/multimedia/yolov5.png)
- After download, convert the `.pt` file to ONNX using [https://github.com/ultralytics/yolov5/blob/v2.0/models/export.py](https://github.com/ultralytics/yolov5/blob/v2.0/models/export.py) .
- **Notes**

When using the export.py script, note the following:

1. Because the D-Robotics AI toolchain supports ONNX opset versions `10` and `11` , modify the `opset_version` parameter in `torch.onnx.export` according to the version you want to use.
2. Change the default input name parameter in `torch.onnx.export` from `'images'` to `'data'` to match the YOLOv5x example script in the model conversion sample package.
3. Change the default input size 640x640 in `parser.add_argument` to 672x672 as in the YOLOv5x example in the model conversion sample package.

#### Model Accuracy Tuning Checklist

Strictly follow steps 1–5 in the diagram below for model accuracy validation, and keep the code and results for each step:

![model_accuracy_check](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/multimedia/model_accuracy_check.png)**Before troubleshooting, confirm the Docker image or conversion environment version used for the current model conversion, and keep the version information**

##### 1. Verify floating-point ONNX model inference results

In the model conversion environment, test single-image results of the floating-point ONNX model (specifically the ONNX model exported from a DL framework). Results at this step should exactly match inference results of the trained model (except for NV12 format, which may introduce slight differences).

Refer to the sample code steps below to confirm that inference steps, data preprocessing, and post-processing code for the floating-point ONNX model are correct.

```python
from horizon_tc_ui import HB_ONNXRuntime
  import numpy as np
  import cv2

  def preprocess(input_name):
      # BGR->RGB, Resize, CenterCrop, etc.
      # HWC->CHW
      # normalization
      return data

  def main(): 
      # Load model file
      sess = HB_ONNXRuntime(model_file=MODEL_PATH)
      # Get input and output node names
      input_names = [input.name for input in sess.get_inputs()]
      output_names = [output.name for output in sess.get_outputs()]
      # Prepare model input data
      feed_dict = dict()
      for input_name in input_names:
          feed_dict[input_name] = preprocess(input_name)
          
      # Original floating-point ONNX, data dtype=float32
      outputs = sess.run_feature(output_names, feed_dict, input_offset=0)     
      
      # Post-processing
      postprocess(outputs)
          
  if __name__ == '__main__':
      main()
```

##### 2. Verify yaml configuration file and pre/post-processing code

Test single-image results of the `original_float.onnx` model; they should exactly match floating-point ONNX model inference results (except for NV12 format, which may introduce slight differences due to NV12 data loss).

Use the open-source tool Netron to open the `original_float.onnx` model and inspect the detailed attributes of the preprocessing node `HzPreprocess` to obtain the parameters needed for `data preprocessing` : `data_format` and `input_type` .

Because of the HzPreprocess node, preprocessing in the converted model may differ from the original model. This operator is added during model conversion based on yaml configuration parameters (input_type_rt, input_type_train, norm_type, mean_value, scale_value). For details on preprocessing node generation, refer to the `norm_type configuration parameter description` section in PTQ Principles and Steps. Preprocessing nodes appear in all artifacts produced during conversion.

Ideally, the HzPreprocess node should complete the full conversion from input_type_rt to input_type_train. In practice, the entire type conversion process requires D-Robotics AI chip hardware, but the ONNX model does not include the hardware conversion part. Therefore, the actual ONNX input type uses an intermediate type—the hardware processing result type of input_type_rt. For image input data types RGB/BGR/NV12/YUV444/GRAY with dtype=uint8, preprocessing code must apply `-128` . For `featuremap` data type using float32, preprocessing code `does not need -128` . The data layout (NCHW/NHWC) of original_float.onnx remains the same as the original floating-point model input layout.

Refer to the sample code steps below to confirm that inference steps, data preprocessing, and post-processing code for the original_float.onnx model are correct.

**For data preprocessing, we recommend referencing the preprocessing steps in caffe, onnx, and other example models in the D-Robotics model conversion `horizon_model_convert_sample` sample package**

```python
from horizon_tc_ui import HB_ONNXRuntime
  import numpy as np
  import cv2

  def preprocess(input_name):
      # BGR->RGB, Resize, CenterCrop, etc.
      # HWC->CHW (determine whether layout conversion is needed based on ONNX input node shape)
      # normalization (if norm was embedded in the model via yaml, do not repeat in preprocessing)
      # -128 (for image input models, apply -128 in preprocessing only when using hb_session.run; other interfaces use input_offset)
      return data

  def main(): 
      # Load model file
      sess = HB_ONNXRuntime(model_file=MODEL_PATH)
      # Get input and output node names
      input_names = [input.name for input in sess.get_inputs()]
      output_names = [output.name for output in sess.get_outputs()]
      # Prepare model input data
      feed_dict = dict()
      for input_name in input_names:
          feed_dict[input_name] = preprocess(input_name)
      # Image input models (RGB/BGR/NV12/YUV444/GRAY), data dtype=uint8
      outputs = sess.run(output_names, feed_dict, input_offset=128)         
      # FeatureMap models, data dtype=float32. Comment out the line below if model input is not featuremap!
      outputs = sess.run_feature(output_names, feed_dict, input_offset=0)     
      # Post-processing
      postprocess(outputs)
          
  if __name__ == '__main__':
      main()
```

##### 3. Verify that graph optimization did not introduce accuracy errors

Test single-image results of the optimize_float.onnx model; they should exactly match original_float.onnx inference results.

Use Netron to open the `optimize_float.onnx` model and inspect the `HzPreprocess` node attributes to obtain `data_format` and `input_type` needed for data preprocessing.

Refer to the sample code steps below to confirm inference steps, data preprocessing, and post-processing code for the optimize_float.onnx model.

**For data preprocessing, we recommend referencing the preprocessing steps in caffe, onnx, and other example models in the D-Robotics model conversion `horizon_model_convert_sample` sample package**

```python
from horizon_tc_ui import HB_ONNXRuntime
  import numpy as np
  import cv2

  def preprocess(input_name):
      # BGR->RGB, Resize, CenterCrop, etc.
      # HWC->CHW (determine whether layout conversion is needed based on ONNX input node shape)
      # normalization (if norm was embedded in the model via yaml, do not repeat in preprocessing)
      # -128 (for image input models, apply -128 in preprocessing only when using hb_session.run; other interfaces use input_offset)
      return data

  def main(): 
      # Load model file
      sess = HB_ONNXRuntime(model_file=MODEL_PATH)
      # Get input and output node names
      input_names = [input.name for input in sess.get_inputs()]
      output_names = [output.name for output in sess.get_outputs()]
      # Prepare model input data
      feed_dict = dict()
      for input_name in input_names:
          feed_dict[input_name] = preprocess(input_name)
      # Image input models (RGB/BGR/NV12/YUV444/GRAY), data dtype=uint8
      outputs = sess.run(output_names, feed_dict, input_offset=128)         
      # FeatureMap models, data dtype=float32. Comment out the line below if model input is not featuremap!
      outputs = sess.run_feature(output_names, feed_dict, input_offset=0)     
      # Post-processing
      postprocess(outputs)
          
  if __name__ == '__main__':
      main()
```

##### 4. Verify whether quantization accuracy meets expectations

Test accuracy metrics of quantized.onnx.

Use Netron to open the `quantized.onnx` model and inspect the `HzPreprocess` node attributes to obtain `data_format` and `input_type` needed for data preprocessing.

Refer to the sample code steps below to confirm inference steps, data preprocessing, and post-processing code for the quantized.onnx model.

**For data preprocessing, we recommend referencing the preprocessing steps in caffe, onnx, and other example models in the D-Robotics model conversion `horizon_model_convert_sample` sample package**

```python
from horizon_tc_ui import HB_ONNXRuntime
  import numpy as np
  import cv2

  def preprocess(input_name):
      # BGR->RGB, Resize, CenterCrop, etc.
      # HWC->CHW (determine whether layout conversion is needed based on ONNX input node shape)
      # normalization (if norm was embedded in the model via yaml, do not repeat in preprocessing)
      # -128 (for image input models, apply -128 in preprocessing only when using hb_session.run; other interfaces use input_offset)
      return data

  def main(): 
      # Load model file
      sess = HB_ONNXRuntime(model_file=MODEL_PATH)
      # Get input and output node names
      input_names = [input.name for input in sess.get_inputs()]
      output_names = [output.name for output in sess.get_outputs()]
      # Prepare model input data
      feed_dict = dict()
      for input_name in input_names:
          feed_dict[input_name] = preprocess(input_name)
      # Image input models (RGB/BGR/NV12/YUV444/GRAY), data dtype=uint8
      outputs = sess.run(output_names, feed_dict, input_offset=128)         
      # FeatureMap models, data dtype=float32. Comment out the line below if model input is not featuremap!
      outputs = sess.run_feature(output_names, feed_dict, input_offset=0)     
      # Post-processing
      postprocess(outputs)
          
  if __name__ == '__main__':
      main()
```

##### 5. Ensure model compilation is correct and board-side inference code is correct

Use the `hb_model_verifier` tool to verify consistency between quantized.onnx and `.bin` . Model outputs should align to at least 2–3 decimal places.

For `hb_model_verifier` usage, refer to the `hb_model_verifier tool` section in PTQ Principles and Steps.

If model consistency verification passes, carefully check pre/post-processing code on the development board.

If consistency verification between quantized.onnx and `.bin` fails, contact D-Robotics technical support.

#### Model Quantization yaml Configuration File Template

#### Fixed-point `.bin` Model Multi-batch Board Deployment Guide

- 1. During model conversion, configure batch_size via input_batch in the yaml configuration file;
- 1. When feeding input to the board `.bin` model, using original model dimensions 1×3×224×224 and setting input_batch to 10 (that is, 10×3×224×224) as an example:
- Prepare data:

Image data: set `aligned_shape = valid_shape` , then write 10 images sequentially into the allocated memory space using the same method as single-image data preparation;

FeatureMap data: pad data according to aligned_shape, then write 10 batches sequentially into the allocated memory space using the same method as single-batch data preparation. The model inference workflow is the same as single-batch model inference;
