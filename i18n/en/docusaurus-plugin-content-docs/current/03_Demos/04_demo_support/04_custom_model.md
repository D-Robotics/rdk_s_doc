---
title: "Using Your Own Model"
sidebar_position: 4
description: "Entry point for replacing demo models with your own"
---

# Using Your Own Model

The models bundled with the demos on the board (`/opt/hobot/model/<product>/basic/`) are already quantized into the `.hbm` format runnable on the BPU. To run a demo with **your own model**, you need to **quantize and compile** the trained floating-point model (ONNX/CAFFE) into a `.hbm` with the algorithm toolchain, then copy it to the board and replace the demo's `--model-path`.

## Overall Workflow

1. Prepare the floating-point model (export it as ONNX, or CAFFE).
2. Quantize and compile it into a `.hbm` with the RDK algorithm toolchain (the MARCH must match the product: `nashp` for S600, `nashe` for S100).
3. Copy the `.hbm` and the accompanying class label file to the board.
4. In the demo command, use `--model-path` to point to the new model and `--label-file` to point to the new labels.

Quantization and compilation is Mode 3 (deep customization) work; see Chapter 5 [Algorithm Toolchain Development Guide](../../07_Advanced_development/10_algorithm_toolchain/01_algorithm_toolchain/01_overview.md) for details.

## Replacing the Demo Model

Taking the ResNet18 classification demo as an example, after placing your own model `my_model.hbm` on the board:

```bash
scp my_model.hbm root@<board IP>:/opt/hobot/model/<product>/basic/

# Specify at runtime on the board
cd /app/pydev_demo/classification_sample/resnet18
python resnet18.py \
    --model-path /opt/hobot/model/<product>/basic/my_model.hbm \
    --label-file /app/res/labels/imagenet1000_clsidx_to_labels.txt
```

## Notes

- The model's input size, normalization method (mean/scale), and input format (NV12, etc.) must match the demo's preprocessing, otherwise the results will be wrong. These can be checked in the toolchain's model description (e.g. `INPUT_SHAPE`, `NORM_TYPE`, `SCALE_VALUE`).
- The number of classes must match the label file (e.g. 1000 classes uses the imagenet labels, 80 classes uses the COCO labels).
- If the model comes from an open-source repository, first confirm that its license permits deployment.

## FAQ

### Wrong Results When Running a Demo With My Own Model

**Symptom**: Inference results are wrong after replacing the model with your own.

**Cause**: The model's input size, normalization (mean/scale), and input format (NV12, etc.) do not match the demo preprocessing.

**Solution**: Check `INPUT_SHAPE`, `NORM_TYPE`, and `SCALE_VALUE` in the toolchain model description and align them with the demo preprocessing.

### Wrong Class Labels

**Symptom**: The classification/detection classes do not match expectations.

**Cause**: The number of classes does not match the label file.

**Solution**: Make sure the number of classes matches the label file (e.g. imagenet labels for 1000 classes, COCO labels for 80 classes).

### How to Choose MARCH During Quantization

**Symptom**: The quantized `.hbm` cannot run normally on the board.

**Cause**: MARCH does not match the product during quantization.

**Solution**: Match MARCH to the product: `nashp` for S600 and `nashe` for S100.

## Related Documentation

- [Algorithm Toolchain (Advanced)](../../07_Advanced_development/10_algorithm_toolchain/01_algorithm_toolchain/01_overview.md)
- [Model Acquisition and Placement](./01_model_files.md)
- [ResNet18 (Python) Example](../03_algorithm_demo/02_classification/01_resnet18_py.md)
