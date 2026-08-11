---
sidebar_position: 11
---

# Automatic Speech Recognition - ASR

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK-S100">
This sample runs a speech recognition model using the BPU inference engine to automatically transcribe `.wav` audio files and output the corresponding text. The sample code is located in `/app/cdev_demo/bpu/07_speech_sample/01_asr/`.

:::warning
The current RDK S100 system image does **not** include the `asr.hbm` model. Before running this sample, you must download it manually (see the download command in "Model Download" below) and place it at the default path `/opt/hobot/model/s100/basic/asr.hbm`, or specify another path with `--model_path`.
:::

</DocScope>
<DocScope products="RDK-S600">
This sample runs a speech recognition model using the BPU inference engine to automatically transcribe `.wav` audio files and output the corresponding text. The sample code is located in `/app/cdev_demo/bpu/speech_sample/asr/`.

</DocScope>


## Model Description
- Overview:

    ASR (Automatic Speech Recognition) models convert audio signals into text. The input is single-channel speech waveforms (after sample rate conversion and standardization), and the output is character-level token sequences. Combined with a vocabulary (vocab) file, Chinese speech transcription can be achieved. This sample uses a quantized `.hbm` model.

- HBM model name: asr.hbm

- Input format: audio waveform, single channel, sample rate 16kHz, maximum length 30000 (sample points)

- Output: character token probability distribution (logits); recognized text is obtained by argmax decoding and mapping

## Feature Overview
- Model loading

    Load the ASR model and automatically parse model input/output shapes and quantization information.

- Input preprocessing

    Read audio with SoundFile (supports `.wav`). The audio is:

    - Converted to single channel
    - Resampled to the target sample rate (default 16kHz)
    - Standardized to zero mean and unit variance (z-score)
    - Padded or truncated to a fixed length (for example, 30000)
    - Supports generator-based processing of long audio for streaming recognition

- Inference execution

    Complete inference using the `.infer()` method.

- Result post-processing

    Obtain token indices from output logits, map them to characters using the vocab dictionary file (JSON format), and output the final recognized text.


## Environment Dependencies
Before building and running, ensure the following dependencies are installed:
```bash
sudo apt update
sudo apt install -y libgflags-dev libsndfile1-dev libsamplerate0-dev
```

## Directory Structure
```text
.
|-- CMakeLists.txt                  # CMake build script: target/dependency/include/link configuration
|-- README.md                       # Usage instructions (this file)
|-- inc
|   |-- asr.hpp                     # ASR inference wrapper header (load/preprocess/infer/postprocess interfaces)
|   `-- audio_chunk_reader.hpp      # Audio chunk reader: read file → resample → output chunks
`-- src
    |-- asr.cc                      # ASR inference implementation: input write, forward pass, CTC decode, etc.
    |-- audio_chunk_reader.cc       # Chunk reader implementation: libsndfile + libsamplerate streaming chunks
    `-- main.cc                     # Program entry: parse args → loop over chunks → infer → concatenate transcription
```

## Build the Project
- Configure and build
    ```bash
    mkdir build && cd build
    cmake ..
    make -j$(nproc)
    ```

## Model Download
If the model is not found at runtime, download it with the following command:

<DocScope products="RDK-S100">
```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/asr/asr.hbm
```

</DocScope>
<DocScope products="RDK-S600">
```bash
wget https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/asr/asr.hbm
```

</DocScope>

## Parameter Reference

<DocScope products="RDK-S100">
| Parameter      | Description                                    | Default Value                         |
| -------------- | ---------------------------------------------- | ------------------------------------- |
| `--model_path` | Model file path (`.hbm`)                       | `/opt/hobot/model/s100/basic/asr.hbm` |
| `--test_sound` | Input audio file path (`.wav`)                 | `/app/res/assets/chi_sound.wav`       |
| `--vocab_file` | Vocabulary (JSON), mapping **class id → token** | `/app/res/labels/vocab.json`          |

</DocScope>
<DocScope products="RDK-S600">
| Parameter      | Description                                    | Default Value                         |
| -------------- | ---------------------------------------------- | ------------------------------------- |
| `--model_path` | Model file path (`.hbm`)                       | `/opt/hobot/model/s600/basic/asr.hbm` |
| `--test_sound` | Input audio file path (`.wav`)                 | `/app/res/assets/chi_sound.wav`       |
| `--vocab_file` | Vocabulary (JSON), mapping **class id → token** | `/app/res/labels/vocab.json`          |

</DocScope>

## Quick Start
- Run the model
    - Make sure you are in the `build` directory
    - Use default parameters
        ```bash
        ./asr
        ```
    - Run with custom parameters

        <DocScope products="RDK-S100">
        ```bash
        ./asr \
            --model_path /opt/hobot/model/s100/basic/asr.hbm \
            --test_sound /app/res/assets/chi_sound.wav \
            --vocab_file /app/res/labels/vocab.json
        ```

        </DocScope>
        <DocScope products="RDK-S600">
        ```bash
        ./asr \
            --model_path /opt/hobot/model/s600/basic/asr.hbm \
            --test_sound /app/res/assets/chi_sound.wav \
            --vocab_file /app/res/labels/vocab.json
        ```

        </DocScope>
- View the results

    After successful execution, the result will be printed.
    ```bash
    我是来自阿里云的大规模语言磨型过叫通意千问||
    ```

## Notes
- For more deployment options or model support information, refer to the official documentation or contact platform technical support.
