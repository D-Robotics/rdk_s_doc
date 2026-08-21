---
title: Automatic Speech Recognition - ASR (C/C++)
sidebar_position: 1
description: "Pre-installed example of deploying the ASR model for speech-to-text with C/C++"
---

# Automatic Speech Recognition - ASR (C/C++)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This example demonstrates how to deploy the ASR speech recognition model on the BPU with `C/C++`, transcribe a `.wav` audio clip into text, and print it. For the Python version, see [ASR (Python)](./01_asr_py.md).

The example code is located in the `/app/cdev_demo/bpu/speech_sample/asr/` directory on the board.

:::warning
Neither the S100 nor the S600 system image bundles the `asr.hbm` model. Before running, download it manually and place it at `/opt/hobot/model/<product>/basic/asr.hbm` (or specify it via `--model_path`).
:::

## Prerequisites

- The development board is flashed with RDK OS and logged in via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- The compilation toolchain is available on the board (`cmake`, `make`, `g++`, pre-installed in the image).
- The pre-installed models are in place (not bundled in the image, download from the RDK model zoo, see [Model files](../../04_demo_support/01_model_files.md)):
  - S100: `/opt/hobot/model/s100/basic/asr.hbm`
  - S600: `/opt/hobot/model/s600/basic/asr.hbm`

## Environment Dependencies

Compilation requires `libgflags-dev`, `libsndfile1-dev`, and `libsamplerate0-dev`:

```bash
sudo apt update
sudo apt install -y libgflags-dev libsndfile1-dev libsamplerate0-dev
```

## Code Location

Path on the board: `/app/cdev_demo/bpu/speech_sample/asr/`

:::tip
The code in this directory is pre-installed with the image and verified on the board; it can be compiled and run directly.
:::

Directory structure:

```text
.
|-- CMakeLists.txt                  # CMake build script
|-- README.md                       # Project description
|-- inc/
|   |-- asr.hpp                     # ASR inference class definition
|   `-- audio_chunk_reader.hpp      # Audio chunk reader
`-- src/
    |-- asr.cc                      # Inference implementation: input writing, forward computation, CTC decoding
    |-- audio_chunk_reader.cc       # Audio chunking: file reading, resampling, chunked output
    `-- main.cc                     # Program entry point
```

## Build

```bash
cd /app/cdev_demo/bpu/speech_sample/asr
mkdir build && cd build
cmake ..
make -j$(nproc)
```

The build output is `build/asr`.

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model_path` | Model file path (.hbm) | S600: `/opt/hobot/model/s600/basic/asr.hbm` (S100 uses `s100/basic/`) |
| `--test_sound` | Input audio file path (.wav) | `/app/res/assets/chi_sound.wav` |
| `--vocab_file` | Vocabulary file (JSON, token-to-id mapping) | `/app/res/labels/vocab.json` |

## Usage

Make sure you are in the `build` directory and run with default parameters:

```bash
./asr
```

Run with explicit parameters (equivalent to the defaults):

<DocScope products="RDK-S600">

```bash
./asr \
  --model_path /opt/hobot/model/s600/basic/asr.hbm \
  --test_sound /app/res/assets/chi_sound.wav \
  --vocab_file /app/res/labels/vocab.json
```

</DocScope>

## Execution Results

Actual output on RDK S600 (test audio `chi_sound.wav`, whose content is "我是来自阿里云的大规模语言模型叫做通义千问"):

```text
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
Full transcription:
我是来自阿里云的大规模语言磨型过叫通意千问||
```

**Success indicators**: `Full transcription:` appears at the end, followed by the recognized text. Note that the ASR model has recognition deviations on some words (e.g. "模型→磨型", "叫做→过叫"); this is a model accuracy limitation, not a runtime error.

## Software Notes

Data flow: read wav → resample to 16kHz → truncate/pad to 30000 samples → extract audio featuremap → BPU inference → greedy-decode tokens → map to text using `vocab.json`. The model input is `1x30000`, with no preprocessing.

## FAQ

- **`make` reports `gflags`/`sndfile`/`samplerate` not found**: Install the corresponding `-dev` packages as described in "Environment Dependencies".
- **Garbled or missing characters in the result**: The ASR model accuracy is limited; using clearer audio can improve the result.
- **`asr.hbm` not found**: Neither the S100 nor S600 image bundles it; manual download is required (see the warning above).

## Related Documentation

- [ASR Example (Python)](./01_asr_py.md)
- [C/C++ Demo Build Guide](../../04_demo_support/02_c_cpp_build.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [C Inference API](../../../04_Simple_API/02_inference_api/01_c_api.md)
