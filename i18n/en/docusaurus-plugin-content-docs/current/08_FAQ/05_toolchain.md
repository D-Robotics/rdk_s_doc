---
sidebar_position: 5
---

# Models, Algorithms, and Toolchain

:::tip 🛠️ Toolchain and System Download Guide

For toolchain issues, we recommend using the latest version first. For related download resources, see: [Download Resources](../RDK.md#resource-index)

:::

This section answers common questions about intelligent model deployment, algorithm development, and toolchain usage on D-Robotics RDK platforms.

### Q1: What information should I provide when reporting a toolchain issue?
**A:** When you encounter an issue with the D-Robotics algorithm toolchain and need technical support, please provide the following complete information to help us locate the problem quickly:
1.  **Target RDK hardware platform and processor architecture:** For example, RDK S100 (BPU Nash-e), Super100P (BPU Nash-m).
2.  **Algorithm toolchain conversion environment information:**
    * `horizon_nn` package version (check with `pip list | grep horizon`).
    * Python version (for example, Py3.8, Py3.10).
    * Toolchain Docker image version used (if using Docker).
3.  **Original model file:** Provide your ONNX model file (or other original-format model file).
4.  **Model conversion related files:**
    * The `yaml` configuration file used during conversion.
    * Complete model conversion tool logs or similar log files.
    * Calibration dataset for PTQ quantization (or its generation method and a few sample images).
5.  **Board deployment related files:**
    * Code snippets or the complete project for board deployment.
    * Specific error messages and logs from board-side runtime.
    * RDK board system version information (obtained with the `rdkos_info` command).
6.  **Detailed steps to reproduce the issue:** Clearly describe the step-by-step operations needed to reproduce the problem.
7.  **Expected behavior vs. actual behavior:** Describe the result you expected and the phenomenon you actually observed.

**Note:** Many common issues may exist in older toolchain versions and have already been fixed in newer releases. We recommend using the latest officially released Docker image and toolchain version first.
* **Docker image download and mount references:**
    * [Docker Image Download Post](https://developer.d-robotics.cc/forumDetail/136488103547258769)
    * [Docker Mount Method Post](https://developer.d-robotics.cc/forumDetail/228559182180396619)
* For complex issues, we recommend sharing the complete development-machine conversion project, board deployment project, and detailed error reproduction steps with technical support via cloud storage or similar methods.

### Q2: What official resources are recommended for AI algorithm development?
**A:**
1.  **RDK User Manual - Algorithm Toolchain chapter:** This is the most fundamental and important reference. It describes toolchain installation, usage workflow, tool functions, parameters, and more.
    * General entry: [https://developer.d-robotics.cc/rdk_doc/04_toolchain_development](https://developer.d-robotics.cc/rdk_doc/04_toolchain_development) (refer to the latest official documentation)
2.  **RDK Model Zoo:** The official model example repository, containing porting, optimization, quantization, and deployment example code and tutorials for many common intelligent models on RDK platforms.
    * GitHub repository: [https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo)
3.  **D-Robotics Developer Community - Resource Center:** The community resource center usually aggregates development resources, including toolchain packages, SDKs, sample code, technical documentation, tutorial videos, and more.
    * Community resource center: [https://developer.d-robotics.cc/resource](https://developer.d-robotics.cc/resource)

### Q3: The algorithm toolchain Docker image is based on Ubuntu 20.04. Will this affect running conversion outputs (such as `.bin` or `.hbm` model files) on RDK boards running Ubuntu 22.04?
**A:** Usually **it will not affect deployment**.
Although the algorithm toolchain Docker image provided by D-Robotics OpenExplorer may be based on Ubuntu 20.04, its main purpose is to provide an isolated **model conversion environment** that contains all necessary conversion tools and dependency libraries.
The generated model files (such as `.bin` for PTQ and `.hbm` for QAT) are binary instructions and weight data targeting a specific BPU architecture on RDK boards. These model files are decoupled from the Ubuntu version (whether 20.04 or 22.04) of the RDK board OS on which they run, as long as the Runtime libraries on the board (such as `libdnn.so` and other BPU drivers and inference libraries) are compatible with the toolchain version used during model conversion.

### Q4: How do I deploy YOLO series models (such as YOLOv5, YOLOv8, YOLOv10) on RDK platforms?
**A:** D-Robotics and the community provide extensive tutorials and examples for deploying YOLO series models on RDK platforms.

* **YOLO series deployment recommendations:**
    * We recommend starting with examples for your current S-series platform in [RDK Model Zoo](https://github.com/D-Robotics/rdk_model_zoo).
    * If you use a self-trained model, first confirm that the exported ONNX output node format matches the board-side post-processing implementation.
    * For performance optimization, focus on preprocessing, post-processing, and multi-threaded pipeline configuration.

* **General resources:** We strongly recommend reviewing **RDK Model Zoo** ([https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo)), which includes official deployment examples, pre/post-processing code, and performance optimization tips for multiple YOLO versions (and other mainstream models).

### Q5: When deploying YOLOv5, I encounter an error like `can't reshape xxx in (84,84,3,85)`. How do I fix it?
**A:** This error is usually caused by a mismatch between the preset **number of classes (num_classes)** in the post-processing code and the number of classes in your trained and exported model.
For example, `85` usually represents `(x, y, w, h, confidence + num_classes)`. If your model was trained on the COCO dataset (80 classes), then `num_classes` is 80, for a total of `5 + 80 = 85` output channels. If you trained a model with a custom number of classes (for example, 10 classes), this should be `5 + 10 = 15`.
* **Solution:** Find the YOLOv5 post-processing code file you are using (usually a Python script) and modify the defined class count parameter to match your model's actual number of classes.
* **Reference:** The [YOLOv5s v2.0 training and conversion post](https://developer.d-robotics.cc/forumDetail/163807123501918330) mentioned above may also include instructions for modifying the class count.

### Q6: When deploying YOLOv5, detection results show a very large number of irregular bounding boxes. What is the cause?
**A:** This is usually caused by a mismatch between the ONNX model output head structure and what the board-side post-processing code expects.
* **Possible cause 1: The output head was not modified according to BPU requirements.**
    * In higher YOLOv5 versions (for example, tag 2.0 and above), the officially exported ONNX model output layer may include feature decoding (for example, directly outputting bounding box coordinates and class scores), or may not separate the large, medium, and small feature map outputs.
    * D-Robotics RDK BPU deployment usually requires ONNX model outputs to be raw feature maps, with these three feature maps as independent output nodes.
    * **Example images (top: incorrect; bottom: partially correct but still needs adjustment):**
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/AI_toolchain/3.png" alt="YOLOv5 incorrect output head example" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/AI_toolchain/4.jfif" alt="YOLOv5 incorrect output head example" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} /> 
      *Top image: feature maps not separated and decoding included. Bottom image: feature maps separated, but Sigmoid may have been added incorrectly or NHWC conversion may be missing.*
* **Solution:**
    * You need to modify the YOLOv5 export script (usually `models/yolo.py` or a similar file) to ensure that when exporting the ONNX model:
        1.  Remove the detection head at the end of the model (decoding layer, NMS, etc.).
        2.  Export the three feature maps at different scales (P3, P4, P5 or corresponding layers) as independent output nodes.
        3.  Ensure the output dimension order meets toolchain requirements (for example, sometimes NCHW must be converted to NHWC).
        4.  Do not incorrectly add unnecessary activation functions (such as Sigmoid) after the final output layer unless the post-processing code explicitly requires them.
    * **Reference tutorial:** [High-version YOLOv5 output layer modification guide](https://developer.d-robotics.cc/forumDetail/177840589839214598) describes the modification in detail.

### Q7: When deploying YOLOv5, detection results show abnormally arranged bounding boxes with a periodic pattern. What is the cause?
**A:**
* **Possible cause: Output dimensions do not match post-processing.**
    * If the YOLOv5 model you use (for example, official releases below tag 2.0) exports ONNX with 5-dimensional output heads (for example, `[batch, num_anchors, grid_h, grid_w, (x,y,w,h,conf+classes)]` or a flattened form such as `[batch, num_anchors* (5+num_classes), grid_h, grid_w]`).
    * When the D-Robotics BPU toolchain compiles such models directly, dimension handling or post-processing expectations may truncate or incorrectly parse a dimension, resulting in abnormally arranged bounding boxes with a periodic pattern.
    * **Example image:**
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/AI_toolchain/5.png" alt="YOLOv5 periodic abnormal bounding box example" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} /> * **Solution:**
    * The recommended approach is to convert outputs to explicit 4D tensors when exporting the ONNX model (for example, NHWC format: `[batch, grid_h, grid_w, num_anchors*(5+num_classes)]`), and then parse and decode correctly in board-side post-processing according to this NHWC output format (for example, reshape back to 5D or perform the corresponding anchor calculations).
    * Ensure your post-processing logic fully matches the final output dimensions and layout of the ONNX model.

### Q8: When deploying YOLOv5, bounding box positions are shifted overall. What is the cause?
**A:**
1.  **Render size does not match the original image size:**
    * Bounding box coordinates computed by post-processing are usually relative to the model input image size (for example, 640x640). If you draw these coordinates directly on an original image or display canvas of a different size without the corresponding scaling and translation, the bounding boxes will appear shifted.
    * **Solution:** Before rendering bounding boxes, map model output coordinates back to the original image coordinate system using scale factors (`original image width / model input width`, `original image height / model input height`). If padding was applied before model input, reverse mapping must also account for removing the padding effect.
2.  **Anchors mismatch:**
    * YOLOv5 bounding box decoding depends on preset anchor boxes (anchors). If one set of anchors was used during model training but a different set (or different anchor order or scaling) is used in post-processing, decoded bounding box positions and sizes will be incorrect.
    * **Solution:** Ensure the anchor parameters used in post-processing (usually 18 numbers representing width and height of 3 anchors per layer on 3 feature maps) exactly match the anchors used during model training.

### Q9: When deploying YOLOv5, all bounding boxes abnormally cluster in the upper-left corner of the image. What could be the cause?
**A:**
* **Possible cause: Post-processing library parameter passing issue (specifically in examples on certain system versions).**
    * In legacy RDK OS 3.0.0 and above systems, examples such as `/app/pydev_demo/07_yolov5_sample` may use CPython-wrapped post-processing libraries. If key parameters such as the number of classes used during model training are not correctly passed to the initialization or invocation interface of this post-processing library, decoding logic may fail and cause bounding boxes to cluster in the upper-left corner.
    * **Example image:**
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/AI_toolchain/7.png" alt="YOLOv5 bounding boxes clustered in upper-left corner example" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} /> * **Solution:**
    * **Recommended: use post-processing from RDK Model Zoo:** For YOLOv5 and similar models, we strongly recommend referencing or directly using the post-processing code provided in **RDK Model Zoo** ([https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo)). Implementations in Model Zoo are usually more robust, better optimized, and more closely aligned with the toolchain.
    * **Check parameter passing:** If you insist on using the onboard example post-processing, carefully review the example code and ensure all necessary parameters (such as class count, input resolution, anchors, confidence threshold, NMS threshold, etc.) are correctly configured and passed to the post-processing function or class.

### Q10: When running the onboard `/app/pydev_demo/07_yolov5_sample` example with my own model, I get `Segmentation fault`. What should I do?
**A:**
* **Cause:** Onboard official example programs (such as `07_yolov5_sample`) are usually **adapted and tested for their bundled pre-converted `.bin` models**. The example's preprocessing, model loading, BPU inference calls, and post-processing logic are all designed around that specific bundled model.
* If you replace the `.bin` file in the example with your own YOLOv5 model (which may differ in structure, inputs/outputs, and post-processing logic) without modifying the example code's preprocessing, post-processing, or model parameters accordingly, `Segmentation fault` is very likely due to data format mismatch, out-of-bounds memory access, and similar issues.
* **Solution:**
    1.  **Do not expect it to work by simply replacing the bin file:** In principle, for models you train and convert yourself, you need to write or modify a complete inference program (including preprocessing, BPU inference API calls, and post-processing).
    2.  **Refer to RDK Model Zoo:** For common models such as YOLOv5, we strongly recommend referencing the corresponding deployment examples in **RDK Model Zoo** ([https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo)). Model Zoo usually provides more general and clearer preprocessing and post-processing implementations that you can adapt for your own model.
    3.  **Understand post-processing:** Study YOLOv5 post-processing principles carefully (including anchor decoding, confidence filtering, NMS, etc.) and ensure your post-processing code fully matches your model output feature map format, dimensions, and content.

### Q11: Model inference detects nothing, or results are far worse than expected. What should I check (Pipeline inspection workflow)?
**A:** 
When deployed model performance is poor or produces no output, systematically inspect the entire inference pipeline:

1.  **Data preprocessing check:**
    * **Consistency with training:** This is the most critical point. Ensure deployment preprocessing (such as resize method, normalization parameters, mean/variance, color space conversion such as RGB/BGR, letterbox padding method and color, etc.) is **exactly the same** as preprocessing used during model training. Any subtle difference can sharply degrade model performance.
    * **Visualize preprocessing results:** Save preprocessed image data (for example, save processed images if input is an image; visualize if input is a numpy array) and compare with data fed to the model during training.
    * **Toolchain `yaml` configuration:** When using the D-Robotics toolchain for model conversion (PTQ), the `yaml` configuration file contains preprocessing-related parameters (such as `norm_type`, `mean_value`, `std_value`, etc.). Ensure these settings correctly "offset" preprocessing applied before calibration data is fed to the toolchain, so calibration data seen by the toolchain matches the input distribution before the first convolution layer during training.

2.  **Model conversion process check:**
    * **Toolchain version:** Use the latest stable algorithm toolchain recommended by the official documentation.
    * **`yaml` configuration:** Carefully review the `yaml` configuration file used during model conversion and ensure all parameters (such as input node name, output node name, input data type, input layout, model type, BPU architecture, etc.) are set correctly.
    * **Calibration dataset (PTQ):**
        * Calibration dataset quality and representativeness are critical to PTQ quantized model accuracy. The dataset should match the data distribution of your actual application scenario.
        * Calibration data preprocessing, as described above, must be consistent with deployment (or calibration data fed to the toolchain should be "reverse-preprocessed" so the toolchain can perform correct quantization calibration internally).
    * **Quantization-sensitive layer analysis:** If accuracy drops significantly after PTQ, use toolchain accuracy analysis tools (such as layer-by-layer comparison and dumping layer data) to identify quantization-sensitive layers, then try mixed-precision quantization (some layers use higher precision or float) or QAT (quantization-aware training).
    * **Conversion logs:** Carefully read the complete log output from the toolchain during model conversion and look for any errors, warnings, or hints.

3.  **BPU inference and board-side Runtime check:**
    * **Input data preparation:** Ensure data fed to the board-side BPU inference interface exactly matches the input format (layout, data type, shape) defined during model conversion.
    * **Memory management:** Check whether input/output buffer allocation and copying are correct, and whether there is memory corruption or out-of-bounds access.
    * **Runtime version:** Ensure the BPU driver and Runtime libraries (`libdnn.so`, etc.) on the board are compatible with the toolchain version used during model conversion.
    * **API calls:** Check whether BPU inference API call order and parameter settings are correct.

4.  **Postprocessing check:**
    * **Match model output:** Ensure post-processing logic (such as parsing output feature maps, decoding bounding boxes, applying NMS, threshold handling, etc.) fully matches the format, dimensions, and meaning of actual output nodes after model conversion.
    * **Parameter consistency:** Parameters used in post-processing (such as anchors, class count, confidence threshold, NMS threshold, score_threshold, etc.) must match model design and training.
    * **Coordinate mapping:** If necessary, ensure model output coordinates are correctly mapped back to original image dimensions.
    * **Logic errors:** Carefully check post-processing code for logic bugs.

5.  **End-to-end validation:**
    * **Use known inputs and outputs:** Ideally, have samples from the training or validation set for which you know the correct detection results (Ground Truth). Run these samples through your entire deployment pipeline and compare actual output with expected output.
    * **Module-by-module validation:** If possible, split the pipeline into preprocessing, model inference, post-processing, and other modules, and validate input/output for each module separately.

### Q12: How do I obtain board-side `hrt_*` performance analysis tools (such as `hrt_model_exec`, `hrt_bpu_monitor`, etc.)?
**A:** D-Robotics RDK system images, or packages released with the algorithm toolchain/SDK, usually include command-line tools for board-side model execution, performance analysis, and debugging. These generally start with `hrt_` (Horizon Robotics Tool).
* **Where to find them:**
    * These tools may be preinstalled in RDK system images under paths such as `/usr/bin` or `/opt/hobot/bin`.
    * They may also be included in a subdirectory of the algorithm toolchain package you download (after extraction), for example `ddk/package/board/<target_os>/bin/` or similar paths. You may need to manually copy these tools to an executable path on the board (such as `/usr/local/bin`) or run them by specifying the full path on the board.
* **Official resource posts:** The D-Robotics developer community usually has dedicated posts or documentation explaining how to obtain and use these board-side tools. For example, this post previously provided related information:
    [Board-side hrt_* tool download and usage guide](https://developer.d-robotics.cc/forumDetail/228559182180396599) (please confirm the link and content are still up to date)
* **Common tools:**
    * `hrt_model_exec`: Executes converted `.bin` models on the board for inference validation and performance testing.
    * `hrt_bpu_monitor` (or `hrut_somstatus`, performance printing in `bpu_predict_xN_sample`): Monitors real-time BPU utilization, frequency, temperature, and other status.
    * Other specific debugging tools.

Please refer to the latest RDK documentation or community resources for accurate information and download methods for these tools.

### Algorithm Model Board Deployment Errors and Solutions

[Issue] 

  ```bash
  (common.h:79): HR:ERROR: op_name:xxx invalid attr key xxx
  ```

✅ [Solution] 

- This error may occur because libDNN does not yet support a certain attribute of this op. Replace the operator according to our operator support list, or contact D-Robotics for development evaluation.

[Issue] 

  ```bash
  (hb_dnn_ndarray.cpp:xxx): data type of ndarray do not match specified type. NDArray dtype_: n, given：m
  ```

✅ [Solution] 

- This error may occur because libDNN does not yet support this input type (we will gradually move operator constraints to the model conversion stage in future releases). Replace the operator according to our operator support list, or contact D-Robotics for development evaluation.

[Issue] 

  ```bash
  (validate_util.cpp:xxx)：tensor aligned shape size is xxx , but tensor hbSysMem memSize is xxx, tensor hbSysMem memSize should >= tensor aligned shape size!
  ```

✅ [Solution] 

- This error may occur because insufficient memory was allocated for input data. Use `hbDNNTensorProperties.alignedByteSize` to allocate memory.

[Issue] 

  ```bash
  (bpu_model_info.cpp:xxx): HR:ERROR: hbm model input feature names must be equal to graph node input names
  ```

✅ [Solution] 

- For this error, fully update to the latest toolchain SDK development package.

### Model Quantization and Board Deployment Tips

#### YOLOv5x Model Usage Example

1. YOLOv5x model:

  - Download the corresponding `.pt` file from [yolov5-2.0](https://github.com/ultralytics/yolov5/releases/tag/v2.0).

    When cloning the code, confirm that you use tag ``v2.0``; otherwise, conversion will fail.

  - md5sum checksums:

|           **md5sum**             | **File**   |
| -------------------------------- | -----------|
| 2e296b5e31bf1e1b6b8ea4bf36153ea5 | yolov5l.pt |
| 16150e35f707a2f07e7528b89c032308 | yolov5m.pt |
| 42c681cf466c549ff5ecfe86bcc491a0 | yolov5s.pt |
| 069a6baa2a741dec8a2d44a9083b6d6e | yolov5x.pt |

  - To better adapt to post-processing code, we made the following modifications to the GitHub code before exporting the ONNX model
    (see code at: [https://github.com/ultralytics/yolov5/blob/v2.0/models/yolo.py](https://github.com/ultralytics/yolov5/blob/v2.0/models/yolo.py)):

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

-   **Note:** 
      Removed the 4D-to-5D reshape at the end of each output branch (that is, channels are not split from 255 into 3x85), then converted layout from NHWC to NCHW before output.

    The left image below shows visualization of an output node before modification; the right image shows the corresponding output node after modification.

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/multimedia/yolov5.png" alt="x[i] = x[i].view(bs, self.na, self.no, ny, nx).... diagram" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- After download, convert the `.pt` file to ONNX using https://github.com/ultralytics/yolov5/blob/v2.0/models/export.py.

-    **Notes**

      When using the export.py script, note the following:

      1. Because the D-Robotics AI toolchain supports ONNX opset versions ``10`` and ``11``, modify the ``opset_version`` parameter in ``torch.onnx.export`` according to the version you want to use.
      2. Change the default input name parameter in ``torch.onnx.export`` from ``'images'`` 
         to ``'data'`` to match the YOLOv5x example script in the model conversion sample package.
      3. Change the default input size 640x640 in ``parser.add_argument`` to 672x672 as in the YOLOv5x example in the model conversion sample package.

#### Model Accuracy Tuning Checklist{#checklist}

Strictly follow steps 1–5 in the diagram below for model accuracy validation, and keep the code and results for each step:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/multimedia/model_accuracy_check.png" alt="Model Accuracy Check" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

**Before troubleshooting, confirm the Docker image or conversion environment version used for the current model conversion, and keep the version information**

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

Use the open-source tool Netron to open the ``original_float.onnx`` model and inspect the detailed attributes of the preprocessing node ``HzPreprocess`` to obtain the parameters needed for ``data preprocessing``: ``data_format`` and ``input_type``.

Because of the HzPreprocess node, preprocessing in the converted model may differ from the original model. This operator is added during model conversion based on yaml configuration parameters (input_type_rt, input_type_train, norm_type, mean_value, scale_value). For details on preprocessing node generation, refer to the ``norm_type configuration parameter description`` section in PTQ Principles and Steps. Preprocessing nodes appear in all artifacts produced during conversion.

Ideally, the HzPreprocess node should complete the full conversion from input_type_rt to input_type_train. In practice, the entire type conversion process requires D-Robotics computing platform hardware, but the ONNX model does not include the hardware conversion part. Therefore, the actual ONNX input type uses an intermediate type—the hardware processing result type of input_type_rt. For image input data types RGB/BGR/NV12/YUV444/GRAY with dtype=uint8, preprocessing code must apply ``-128``. For ``featuremap`` data type using float32, preprocessing code ``does not need -128``. The data layout (NCHW/NHWC) of original_float.onnx remains the same as the original floating-point model input layout.

Refer to the sample code steps below to confirm that inference steps, data preprocessing, and post-processing code for the original_float.onnx model are correct.

**For data preprocessing, we recommend referencing the preprocessing steps in caffe, onnx, and other example models in the D-Robotics model conversion ``horizon_model_convert_sample`` sample package**

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

Use Netron to open the ``optimize_float.onnx`` model and inspect the ``HzPreprocess`` node attributes to obtain ``data_format`` and ``input_type`` needed for data preprocessing.

Refer to the sample code steps below to confirm inference steps, data preprocessing, and post-processing code for the optimize_float.onnx model.

**For data preprocessing, we recommend referencing the preprocessing steps in caffe, onnx, and other example models in the D-Robotics model conversion ``horizon_model_convert_sample`` sample package**

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

Use Netron to open the ``quantized.onnx`` model and inspect the ``HzPreprocess`` node attributes to obtain ``data_format`` and ``input_type`` needed for data preprocessing.

Refer to the sample code steps below to confirm inference steps, data preprocessing, and post-processing code for the quantized.onnx model.

**For data preprocessing, we recommend referencing the preprocessing steps in caffe, onnx, and other example models in the D-Robotics model conversion ``horizon_model_convert_sample`` sample package**

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

Use the ``hb_model_verifier`` tool to verify consistency between quantized.onnx and `.bin`. Model outputs should align to at least 2–3 decimal places.

For ``hb_model_verifier`` usage, refer to the ``hb_model_verifier tool`` section in PTQ Principles and Steps.

If model consistency verification passes, carefully check pre/post-processing code on the development board.

If consistency verification between quantized.onnx and `.bin` fails, contact D-Robotics technical support.

#### Model Quantization yaml Configuration File Template

#### Fixed-point `.bin` Model Multi-batch Board Deployment Guide

- 1. During model conversion, configure batch_size via input_batch in the yaml configuration file;
- 2. When feeding input to the board `.bin` model, using original model dimensions 1×3×224×224 and setting input_batch to 10 (that is, 10×3×224×224) as an example:
- Prepare data:

    Image data: set ``aligned_shape = valid_shape``, then write 10 images sequentially into the allocated memory space using the same method as single-image data preparation;

    FeatureMap data: pad data according to aligned_shape, then write 10 batches sequentially into the allocated memory space using the same method as single-batch data preparation. The model inference workflow is the same as single-batch model inference;
