---
title: "Python Demo Build Guide"
sidebar_position: 3
description: "How to run and extend the Python demos on the board"
---

# Python Demo Build Guide

The examples under `/app/pydev_demo` on the board are Python scripts and **require no compilation**: just `cd` into the example directory and run `python xxx.py` directly. The image comes pre-installed with Python packages such as `hbm_runtime`, so most examples run out of the box.

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Prerequisites

- You have logged in to the development board via SSH (see [Remote Login](../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- Python and `hbm_runtime` are pre-installed with the image.

## Running an Example

Taking ResNet18 classification as an example (for the path on the board, see [ResNet18 (Python)](../03_algorithm_demo/02_classification/01_resnet18_py.md)):

```bash
cd /app/pydev_demo/classification_sample/resnet18
python resnet18.py
```

After a successful run, the model description is printed first, and the Top-5 classification results are output at the end:

```text
Top-5 Predictions:
zebra: 0.9983
cheetah, chetah, Acinonyx jubatus: 0.0004
impala, Aepyceros melampus: 0.0004
gazelle: 0.0003
prairie chicken, prairie grouse, prairie fowl: 0.0002
```

For the parameters and run commands of each example, see the corresponding demo document ([Algorithm Demo Overview](../03_algorithm_demo/01_summary.md)).

## Installing Dependencies

The examples depend on the shared `pydev_demo/utils` utility library and the packages listed in `requirements.txt`. If you get a `ModuleNotFoundError`:

<DocScope products="RDK S600">

```bash
cd /app/pydev_demo && pip install -r requirements.txt --break-system-packages
```

</DocScope>

<DocScope products="RDK S100">

```bash
cd /app/pydev_demo && pip install -r requirements.txt
```

</DocScope>

## Notes

- The Python examples depend on the parent-level `utils` directory, so they **must be run inside the example directory**; copying a script elsewhere on its own will fail to find `utils`.
- `--break-system-packages` (S600) is used to bypass the PEP 668 externally-managed-environment protection; this flag is not needed when using a venv.

## FAQ

### ModuleNotFoundError When Running an Example

**Symptom**: Running a Python example prints `ModuleNotFoundError`.

**Cause**: Dependencies are not installed, or the environment is insufficient.

**Solution**: Run `cd /app/pydev_demo && pip install -r requirements.txt` (add `--break-system-packages` on S600; not needed when using a venv).

### Cannot Find `utils` After Copying a Single Script

**Symptom**: Copying a single script elsewhere and running it reports that `utils` cannot be found.

**Cause**: The Python examples depend on the parent `utils` utility library directory.

**Solution**: Run the script inside the example directory; do not copy the script alone to another location.

### `pip install` Blocked by PEP 668 Protection

**Symptom**: On S600, `pip install` reports an externally-managed-environment error.

**Cause**: PEP 668 externally-managed-environment protection.

**Solution**: Add `--break-system-packages` to bypass it, or use a venv.

## Related Documentation

- [ResNet18 (Python) Example](../03_algorithm_demo/02_classification/01_resnet18_py.md)
- [Model Acquisition and Placement](./01_model_files.md)
- [C/C++ Demo Build Guide](./02_c_cpp_build.md)
- [Python Inference API](../../04_Simple_API/02_inference_api/02_python_api.md)
